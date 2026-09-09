import nodemailer, { type Transporter } from "nodemailer"
import { createHash } from "node:crypto"
import { parsePhoneNumber } from "libphonenumber-js"
import type { Lead } from "./types"

/**
 * Team notification on every submission, via GoDaddy SMTP (Nodemailer).
 * Production requires this to be configured (the route fails closed
 * otherwise); dev is best-effort. `replyTo` is set to the submitter so the
 * team can hit "reply" directly.
 *
 * Under Phase 17 the email IS the store (no Sheets/DB), so this module NEVER
 * swallows a send error — `sendLeadEmail` throws and the route returns 500 so
 * the user can retry. A deterministic Message-ID (sha256 of the stable lead
 * fields + the submission's calendar day) lets the receiving mailbox dedupe a
 * genuine same-day client retry of the same submission to a single email
 * (Gmail/Outlook collapse by Message-ID natively) while still admitting a
 * deliberate re-submission on a later day.
 *
 * TLS is enforced: implicit TLS on port 465 (`secure`), STARTTLS elsewhere
 * (`requireTLS`). Certificate verification is left at the default (on) — never
 * set `rejectUnauthorized: false`, which would expose SMTP credentials to a
 * MITM. The transport uses a bounded pool so a long-lived process can't leak
 * idle sockets to a flaky relay.
 *
 * See implementation_plan.md Phase 17.
 */

let transporter: Transporter | null | undefined
// Cache key (a hash of the connection params incl. the password) so a credential
// rotation — or populating SMTP_* after the first request — is picked up without
// a process restart.
let transporterKey: string | undefined

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST
  const portRaw = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const key = [host, portRaw, user, pass].join("\u0000")
  if (transporterKey === key && transporter !== undefined) {
    return transporter
  }
  transporterKey = key
  if (!host || !portRaw || !user || !pass) {
    transporter = null
    return null
  }
  const port = Number(portRaw)
  // Invalid/non-numeric port → treat SMTP as unconfigured so isMailConfigured()
  // fails closed with a clear error instead of passing NaN to Nodemailer.
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    transporter = null
    return null
  }
  // Implicit TLS on 465; STARTTLS upgrade on every other port (e.g. 587).
  const secure = port === 465
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    // Bounded connection pool — recycles stale sockets and caps concurrent
    // connections to the relay (a long-lived VPS process otherwise keeps idle
    // connections that the relay may kill, causing ECONNRESET on the next send).
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    // `tls: { rejectUnauthorized: true }` is the default — left implicit on
    // purpose; disabling it would let a MITM read SMTP_AUTH credentials.
  })
  return transporter
}

export function isMailConfigured(): boolean {
  return Boolean(getTransporter() && process.env.SMTP_FROM && process.env.SMTP_TO)
}

export async function sendLeadEmail(lead: Lead): Promise<void> {
  const transport = getTransporter()
  const from = process.env.SMTP_FROM
  const to = process.env.SMTP_TO
  if (!transport || !from || !to) {
    throw new Error("SMTP is not configured.")
  }

  // sendMail rejects on any transport/SMTP error — that rejection MUST
  // propagate (the route returns 500). Do not wrap it in a try/catch that
  // swallows; the email is the store, so a silent failure loses the lead.
  const info = await transport.sendMail({
    from,
    to,
    replyTo: lead.email,
    messageId: messageIdFor(lead),
    subject: `New ${lead.sessionType === "paid" ? "paid " : ""}lead — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    html: renderEmail(lead),
  })
  // Belt-and-braces: treat a missing messageId as a failure (no silent drop).
  if (!info?.messageId) {
    throw new Error("SMTP send returned no message id.")
  }
}

/** Deterministic Message-ID over the stable lead fields plus a calendar-day
 *  bucket, so a client retry of the same submission WITHIN THE SAME DAY
 *  collapses to one email in the team mailbox. The day bucket bounds the
 *  dedupe window: without it the ID was identical forever, so a prospect
 *  re-submitting identical content weeks later would have their lead
 *  swallowed by the mailbox's Message-ID dedupe (and the email is the only
 *  store under Phase 17 — a deduped email is a lost lead). */
export function messageIdFor(lead: Lead): string {
  const dayBucket = lead.timestamp.slice(0, 10) // YYYY-MM-DD
  const stable = [
    dayBucket,
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    lead.matchedDivision,
    lead.sessionType,
    lead.needHelpWith,
    lead.stage,
    lead.challenge,
  ].join("\u0000")
  const hash = createHash("sha256").update(stable, "utf8").digest("hex").slice(0, 24)
  const domain = domainFromAddress(process.env.SMTP_FROM ?? "noreply@xanadu.com")
  return `<lead-${hash}@${domain}>`
}

/** Extract the domain from a "Name <addr@domain>" / "addr@domain" string for
 *  the Message-ID host part. Falls back to a constant if unparseable. */
export function domainFromAddress(addr: string): string {
  const match = /@([^>\s]+)/.exec(addr)
  return (match && match[1]) || "xanadu.com"
}

function renderEmail(lead: Lead): string {
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", formatPhone(lead.phone)],
    ["Company", lead.company || "—"],
    ["Routed to", lead.matchedDivision || "—"],
    ["Session", lead.sessionType],
    ["Need help with", lead.needHelpWith || "—"],
    ["Stage", lead.stage || "—"],
    ["Biggest challenge", lead.challenge || "—"],
    ["Consented", lead.consent ? "Yes" : "No"],
  ]
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#666;font-weight:600;white-space:nowrap;vertical-align:top">${k}</td>` +
        `<td style="padding:6px 0;vertical-align:top">${escapeHtml(v)}</td></tr>`
    )
    .join("")
  return (
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;max-width:560px">` +
    `<h2 style="margin:0 0 8px">New contact submission</h2>` +
    `<p style="color:#666;margin:0 0 20px">Received ${escapeHtml(lead.timestamp)}</p>` +
    `<table style="border-collapse:collapse">${body}</table>` +
    `</div>`
  )
}

/** Human-readable phone + resolved country for the team email. Parses the
 *  canonical E.164 value stored on the lead (see route.ts `parseAndNormalizePhone`). */
function formatPhone(phone: string): string {
  if (!phone) return "—"
  try {
    const pn = parsePhoneNumber(phone)
    if (pn) {
      const iso = pn.country
      const name = iso ? new Intl.DisplayNames(["en"], { type: "region" }).of(iso) : null
      return name ? `${pn.formatInternational()} (${name})` : pn.formatInternational()
    }
  } catch {
    /* fall through */
  }
  return phone
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&#39;"
    }
  })
}
