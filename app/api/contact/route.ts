import { NextResponse } from 'next/server'
import os from 'os'
import { getClientIp, rateLimit } from '../../../lib/rateLimit'
import type { Lead, SessionType } from '../../../lib/leads/types'
import { isMailConfigured, sendLeadEmail } from '../../../lib/leads/mail'
import { persistToFile } from '../../../lib/leads/file'
import { SUBSIDIARIES, divisionName } from '../../../lib/subsidiaries'
import { parsePhoneNumber } from 'libphonenumber-js'

export const EMAIL_RE = /^[^\s@,;()<>"'\[\]]+@[^\s@,;()<>"'\[\]]+\.[^\s@,;()<>"'\[\]]{2,}$/
const MAX_BYTES = 16 * 1024 // hard cap on request body size

// Per-field length caps.
export const FIELD_LIMITS = {
  name: 200, email: 320, phone: 60, company: 200,
  answerValue: 2000, answerCount: 16,
} as const
// Wire values the client may send for matchedDivision — DERIVED from
// lib/subsidiaries.ts (divisionName) so a subsidiary rename flows through
// instead of silently 400ing every contact submission.
const KNOWN_DIVISIONS = new Set(SUBSIDIARIES.map(divisionName))

// Always dynamic: this POST handler talks to external services / Node built-ins
// and must never be statically evaluated during build.
export const dynamic = 'force-dynamic'
// Pin to the Node.js runtime: this handler relies on Node APIs (Nodemailer for
// GoDaddy SMTP) and would break on the Edge runtime.
export const runtime = 'nodejs'

export interface ContactBody {
  user?: { name?: string; email?: string; phone?: string; company?: string }
  answers?: Record<string, string>
  matchedDivision?: string
  sessionType?: SessionType
  consent?: boolean
  website?: string // honeypot — bots fill hidden fields
}

/** Parse + validate a phone once, returning its canonical E.164 form. Single
 *  parse point: `validate` checks the `ok` flag, `toLead` consumes `e164`, so a
 *  successful submission parses libphonenumber-js exactly once (previously
 *  validate + normalizePhone each parsed it). */
export function parseAndNormalizePhone(raw: string): { ok: boolean; e164: string } {
  if (!raw) return { ok: true, e164: '' }
  try {
    const pn = parsePhoneNumber(raw)
    if (pn && pn.isValid()) return { ok: true, e164: pn.format('E.164') }
    return { ok: false, e164: raw }
  } catch {
    return { ok: false, e164: raw }
  }
}

/** Map the validated request body to the persisted Lead shape. The contact
 *  flow keys its answers by step number (1=need, 2=stage, 3=challenge); those
 *  arrive as JSON string keys. `phoneE164` is the single-parse E.164 result
 *  from validate(). */
function toLead(body: ContactBody, phoneE164: string): Lead {
  const u = body.user || {}
  const a = body.answers || {}
  const get = (n: number) => {
    const v = (a as Record<string, string>)[String(n)]
    return typeof v === 'string' ? v.trim() : ''
  }
  return {
    timestamp: new Date().toISOString(),
    name: (u.name || '').trim(),
    email: (u.email || '').trim(),
    phone: phoneE164,
    company: (u.company || '').trim(),
    matchedDivision: body.matchedDivision || '',
    sessionType: body.sessionType || '',
    needHelpWith: get(1),
    stage: get(2),
    challenge: get(3),
    consent: body.consent === true,
  }
}

/** Cross-origin guard. An empty Origin/Referer (privacy-stripped or forged
 *  requests) is rejected; a present header must match an allow-listed origin.
 *  Comparison is scheme-aware — `(protocol, host)` tuples — so an `http://`
 *  origin can never satisfy an `https://`-only allow-list. Localhost origins
 *  are only honored outside production. */
export function isAllowedOrigin(req: Request): boolean {
  const header = req.headers.get('origin') || req.headers.get('referer')
  if (!header) return false
  let incoming: URL
  try {
    incoming = new URL(header)
  } catch {
    return false
  }
  const allowed = (process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SITE_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowedTuples = new Set<string>()
  for (const a of allowed) {
    try {
      const u = new URL(a)
      allowedTuples.add(`${u.protocol}//${u.host}`)
    } catch {
      allowedTuples.add(a)
    }
  }
  // Local dev/preview origins are only trusted outside production.
  if (process.env.NODE_ENV !== 'production') {
    for (const h of ['localhost:3000', '127.0.0.1:3000', 'localhost:3001']) {
      allowedTuples.add(`http://${h}`)
      allowedTuples.add(`https://${h}`)
    }
  }
  // If no allow-list was configured: in dev/preview, fall back to the request's
  // own origin (Host header + forwarding protocol) so a forgotten env var
  // doesn't silently 403 every local submission. In production, fail CLOSED —
  // the Host header is client-controlled and the fallback is vacuous for
  // non-browser clients (CSRF-safe only because of the JSON Content-Type
  // preflight). Configure ALLOWED_ORIGINS / NEXT_PUBLIC_SITE_URL in prod.
  if (allowedTuples.size === 0) {
    if (process.env.NODE_ENV === 'production') {
      return false
    }
    const host = req.headers.get('host')
    if (host) {
      const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
      allowedTuples.add(`${proto}://${host}`)
    }
  }
  return allowedTuples.has(`${incoming.protocol}//${incoming.host}`)
}

/** Read the request body with a hard byte cap (works even when no
 *  content-length header is sent, e.g. chunked transfers). */
type BodyResult = { ok: true; body: string } | { ok: false; reason: 'empty' | 'too_large' }
export async function readBodyCapped(req: Request): Promise<BodyResult> {
  const reader = req.body?.getReader()
  if (!reader) return { ok: false, reason: 'empty' }
  const chunks: Uint8Array[] = []
  let received = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      received += value.byteLength
      if (received > MAX_BYTES) return { ok: false, reason: 'too_large' }
      chunks.push(value)
    }
  } finally {
    // Release the reader on EVERY exit path. On the too-large early return the
    // stream is still locked; without this it stays pinned until the runtime
    // tears the request down. On the done path cancel() is a harmless no-op.
    // Swallow cancel errors so cleanup never masks the original failure.
    await reader.cancel().catch(() => {})
  }
  if (received === 0) return { ok: false, reason: 'empty' }
  const total = chunks.reduce((n, c) => n + c.byteLength, 0)
  const buf = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    buf.set(c, offset)
    offset += c.byteLength
  }
  return { ok: true, body: new TextDecoder().decode(buf) }
}

/** Strip C0 control bytes + DEL from a string. Prevents CRLF header/log
 *  injection, NUL truncation, and other control-char abuse across the
 *  downstream stores (SMTP email, the dev encrypted file, server logs).
 *  Regular spaces and printable text are untouched. */
export function stripControls(s: string): string {
  return s.replace(/[\u0000-\u001F\u007F]/g, '')
}

/** Normalize every free-text field before validation + persistence: strip
 *  control chars (above) from user + answer values. The honeypot field is
 *  intentionally NOT sanitized (it's checked on the raw body first). */
export function sanitizeBody(body: ContactBody): ContactBody {
  const next: ContactBody = { ...body }
  const u = next.user
  if (u && typeof u === 'object' && !Array.isArray(u)) {
    next.user = {
      name: typeof u.name === 'string' ? stripControls(u.name) : u.name,
      email: typeof u.email === 'string' ? stripControls(u.email) : u.email,
      phone: typeof u.phone === 'string' ? stripControls(u.phone) : u.phone,
      company: typeof u.company === 'string' ? stripControls(u.company) : u.company,
    }
  }
  const a = next.answers
  if (a && typeof a === 'object') {
    next.answers = Object.fromEntries(
      Object.entries(a).map(([k, v]) => [k, typeof v === 'string' ? stripControls(v) : v])
    ) as ContactBody['answers']
  }
  return next
}

/** Redact the home dir and collapse newlines before writing to server logs
 *  (no path leakage; no log-line forgery via embedded CRLF). */
function forLog(s: string): string {
  const home = os.homedir()
  let out = home && home !== '/' ? s.split(home).join('~') : s
  // SMTP relay errors commonly echo the operator's host/user; redact them so
  // internal infra details don't land in the VPS journald/logs.
  for (const secret of [process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS]) {
    if (secret && secret.length > 3) out = out.split(secret).join('[redacted]')
  }
  return out.replace(/[\r\n]+/g, ' ')
}

export function validate(body: ContactBody): { error: string | null; phoneE164: string } {
  const fail = (msg: string): { error: string | null; phoneE164: string } => ({ error: msg, phoneE164: '' })
  if (!body || typeof body !== 'object') return fail('Invalid payload.')
  const { user } = body
  if (!user || typeof user !== 'object' || Array.isArray(user)) return fail('Missing user details.')
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  const email = typeof user.email === 'string' ? user.email.trim() : ''
  const phone = typeof user.phone === 'string' ? user.phone.trim() : ''
  const company = typeof user.company === 'string' ? user.company.trim() : ''
  if (!name) return fail('Name is required.')
  if (name.length > FIELD_LIMITS.name) return fail('Name is too long.')
  if (!email) return fail('Email is required.')
  if (email.length > FIELD_LIMITS.email) return fail('Email is too long.')
  if (!EMAIL_RE.test(email)) return fail('A valid email is required.')
  if (phone.length > FIELD_LIMITS.phone) return fail('Phone is too long.')
  // Single phone parse: validity check + E.164 normalization in one call, the
  // result threaded into toLead so libphonenumber-js runs once per submission.
  let phoneE164 = ''
  if (phone) {
    const { ok, e164 } = parseAndNormalizePhone(phone)
    if (!ok) return fail('Please enter a valid phone number (with country code).')
    phoneE164 = e164
  }
  if (company.length > FIELD_LIMITS.company) return fail('Company is too long.')
  if (body.sessionType !== undefined && body.sessionType !== 'free' && body.sessionType !== 'paid') {
    return fail('Invalid session type.')
  }
  if (body.consent !== true) return fail('Consent is required.')
  if (body.matchedDivision !== undefined && body.matchedDivision !== null && !KNOWN_DIVISIONS.has(body.matchedDivision)) {
    return fail('Invalid matched division.')
  }
  const answers = body.answers
  if (answers !== undefined) {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return fail('Invalid answers.')
    const keys = Object.keys(answers)
    if (keys.length > FIELD_LIMITS.answerCount) return fail('Too many answers.')
    for (const k of keys) {
      // Reject prototype-pollution keys (defense-in-depth: Object.fromEntries
      // in sanitizeBody already can't pollute, but block them explicitly).
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return fail('Invalid answer key.')
      const v = (answers as Record<string, unknown>)[k]
      if (typeof v !== 'string' || v.length > FIELD_LIMITS.answerValue) return fail('An answer is too long.')
    }
  }
  return { error: null, phoneE164 }
}

/** Explicit LEAD_DELIVERY=smtp|file wins; else infer from NODE_ENV (production
 *  → smtp, else → file). Decoupled from NODE_ENV so a prod process that forgets
 *  NODE_ENV=production can't silently fall through to the dev file and lose a
 *  lead. Set LEAD_DELIVERY=smtp on every production host. */
function resolveLeadDelivery(): 'smtp' | 'file' {
  const explicit = process.env.LEAD_DELIVERY
  if (explicit === 'smtp' || explicit === 'file') return explicit
  return process.env.NODE_ENV === 'production' ? 'smtp' : 'file'
}

/** Deliver the lead to the team. smtp mode: email via GoDaddy SMTP (Nodemailer,
 *  `lib/leads/mail.ts`), failing closed (500) if SMTP is misconfigured OR the
 *  send throws — the email IS the store under Phase 17 (no Sheets/DB), so a
 *  failure must propagate so the caller returns 500 and the user can retry
 *  (never silently drop a lead). file mode (dev): the local encrypted file
 *  fallback (zero-setup), with the email best-effort if SMTP is configured. */
async function storeLead(lead: Lead): Promise<void> {
  const mode = resolveLeadDelivery()
  if (mode === 'smtp') {
    if (!isMailConfigured()) {
      throw new Error('lead delivery is set to smtp but GoDaddy SMTP is misconfigured')
    }
    // Email is the store: a send failure MUST propagate (no catch-and-swallow —
    // swallowing would return 200 to the user while losing the lead). A
    // deterministic Message-ID (set in mail.ts) lets the mailbox dedupe a
    // genuine client retry of the same submission.
    await sendLeadEmail(lead)
    return
  }

  // file mode (dev fallback). Warn loudly if this runs in a production-like
  // NODE_ENV: someone explicitly set LEAD_DELIVERY=file in prod, which drops
  // leads onto a local file instead of delivering them — almost always a mistake.
  if (process.env.NODE_ENV === 'production') {
    console.warn('[contact] LEAD_DELIVERY=file under NODE_ENV=production — leads are NOT being emailed; verify this is intended.')
  }
  await persistToFile(lead)
  if (isMailConfigured()) {
    try {
      await sendLeadEmail(lead)
    } catch (err) {
      console.error('[contact] (file mode) SMTP email failed:', err instanceof Error ? err.message : err)
    }
  }
}

export async function POST(req: Request) {
  try {
    // 1. Cross-origin guard (CSRF-lite)
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden origin.' }, { status: 403 })
    }

    // 1b. Strict Content-Type — rejects form/multipart CSRFs and browsers that
    //     send a simple (non-preflight) cross-origin request without JSON.
    const contentType = req.headers.get('content-type') || ''
    // Strict media-type match (ignoring parameters like ;charset=): the loose
    // includes() accepted bogus types such as text/application/json or
    // application/json-seq (RFC 7464), weakening the CSRF preflight gate.
    const mediaType = contentType.split(';')[0].trim().toLowerCase()
    if (mediaType !== 'application/json') {
      return NextResponse.json({ error: 'Unsupported media type.' }, { status: 415 })
    }

    // 2. Rate limit (per IP / per user). Uses Upstash (shared) in prod,
    //    in-memory in dev.
    const ip = getClientIp(req)
    const rl = await rateLimit(ip)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    // 3. Read + size-cap body
    const result = await readBodyCapped(req)
    if (!result.ok) {
      if (result.reason === 'empty') {
        return NextResponse.json({ error: 'Missing body.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
    }

    // Parse untyped, then validate the shape BEFORE any property access:
    // JSON.parse("null") yields `null`, and `as ContactBody` would otherwise
    // silence the compiler and crash on the honeypot read below (→ 500 instead
    // of 400). Reject non-objects (null/booleans/numbers/strings/arrays) here.
    let body: ContactBody
    try {
      const parsed: unknown = JSON.parse(result.body)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
      }
      body = parsed as ContactBody
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }

    // 4. Honeypot: bots fill hidden fields. Pretend success, store nothing.
    //    Checked on the RAW body (before sanitization) so a control-char-only
    //    honeypot value still counts as bot-filled.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ ok: true })
    }

    // 4b. Sanitize: strip control chars (CRLF/NUL/…) from every free-text
    //     field before validation + persistence.
    const clean = sanitizeBody(body)

    const { error: validationError, phoneE164 } = validate(clean)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // 5. Deliver (prod: GoDaddy SMTP email; dev: encrypted file + best-effort email).
    await storeLead(toLead(clean, phoneE164))

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Redact the home dir + collapse newlines before logging.
    console.error('Contact API error:', forLog(msg))
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
