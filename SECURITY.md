# Xanadu Website — Security Assessment & Remediation Plan

> **Status:** Low–moderate risk · **Last reviewed:** 2026-06-26
> **Scope:** `xanadu-website` (Next.js 16 marketing site + `POST /api/contact`).
> **Decisions captured:** **deployment is on a GoDaddy VPS** (Phase 17, current) — contact submissions are delivered **email-only via GoDaddy SMTP** (Nodemailer), superseding the removed Phase 10 Google Sheets + Resend layer. Prod delivers leads by **GoDaddy SMTP** (`lib/leads/mail.ts`, `SMTP_*`) and **fails closed (HTTP 500)** if misconfigured (the email is the store → no silent degradation); delivery mode is selected by `LEAD_DELIVERY=smtp|file` (defaulting from `NODE_ENV`). The local AES-256-GCM encrypted file is the **dev-only** fallback (`lib/leads/file.ts`). Manual mailbox deletion is the erasure path (no automated Art. 17 store); the in-memory rate limiter is correct on the single instance (Upstash optional, env-gated); per-IP keying requires `TRUST_REAL_IP=1` (on every host, incl. Vercel — the `VERCEL=1` auto-trust was removed as spoofable off-Vercel) + nginx `x-real-ip` on the VPS. Repository is *private, small team*. See the hardening-audit notes for the full lead-path hardening pass.
> **Note:** §3 (threat catalog) and §4 (remediation plan) below are the **original** point-in-time assessment, kept as a record; §1a tracks the current status of each item.

## 1. Executive summary

**Overall security level: LOW–MODERATE** (down from MODERATE after the hardening pass).

The application has a small attack surface — a static marketing site with one
unauthenticated `POST /api/contact` endpoint, no database (yet), no auth, and no
sessions — and the client tier is clean (React auto-escaping, no
`eval`; `dangerouslySetInnerHTML` is used only for the pre-paint `js`-class script,
which is nonce'd; fonts served locally). The original review rated it MODERATE
on three counts; all three have since been addressed (see §1a):

1. **PII in version control** — the in-repo file was relocated outside the repo,
   encrypted at rest (AES-256-GCM, fail-closed in prod), and the historical PII
   blob (`commit dbc418a`) was made unreachable by deleting the `dependabot/*`
   branches that held it.
2. **Vulnerable dependencies** — migrated to `next@16.2.9` + `react@19`;
   `npm audit` now reports 0 critical / 0 high.
3. **No security-hardening layer** — added per-request **CSP nonces** (via
   `proxy.ts`, dropping `unsafe-inline` for `script-src` in prod), HSTS and
   the standard security headers, per-IP rate limiting, a honeypot, and an
   Origin/Referer + Content-Type guard.

`npm audit`: **0 critical · 0 high · 2 moderate** (both Next's bundled `postcss`,
transitive).
History check: the historical PII blob (`dbc418a`) is **no longer reachable**
from any live remote ref after the `dependabot/*` branches were deleted.

## 1a. Remediation status (post-execution)

Executed in this pass — see §4 for the original plan and §3 for detail:

| Item | Status | Notes |
|------|--------|-------|
| T1 PII in git | **Done** | `data/` gitignored, file `git rm --cached`, route writes outside the repo (`~/.xanadu-data/` or `$SUBMISSIONS_FILE_PATH`). **History purge complete:** the `dependabot/*` branches that held commit `dbc418a` were deleted, so the PII blob is no longer reachable from any live remote ref (verify from a fresh clone with `git cat-file -p dbc418a`). |
| T2 Dependencies | **Resolved** | Migrated to `next@16.2.9` + `react@19` (+ `eslint-config-next@16`, `eslint@9`, `postcss@^8.5.10`). `npm audit` now reports **0 critical / 0 high**. Only 2 *moderate* advisories remain, both Next's bundled `postcss` (transitive — out of our control until Next updates) |
| T3 Rate limit | **Done (in-memory + optional Upstash)** | Per-IP (per-user) limiter (`lib/rateLimit.ts`): 5/hour/IP → 429, via a bounded in-memory limiter (correct on the single VPS instance) with Upstash as an optional env-gated shared store / resilience fallback. `X-Real-IP` keying requires `TRUST_REAL_IP=1` **on every host, including Vercel** — the `VERCEL=1` auto-trust was removed (`VERCEL` is a manually-settable env var that made the limit spoofable off-Vercel; hardening-audit H2), and forwarded-IP values are split + validated via `node:net` `isIP` (rejects leading-zero IPv4 octets + non-IP/IPv6 garbage that the earlier hand-rolled check accepted as distinct bucket keys — a rate-limit-bypass amplifier; hardening-audit L3, strengthened audit pass 2). Was trusted unconditionally |
| T4 Security headers | **Done (nonce-based)** | HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options via `next.config.js`; **CSP set in `proxy.ts`** with a per-request nonce + `'strict-dynamic'` (drops `unsafe-inline` for `script-src` in prod). Verified: header nonce matches the nonce stamped on every inline + Next-injected script |
| T5 CSRF/Origin | **Done (strengthened)** | Origin/Referer allow-list → 403; **empty Origin/Referer now rejected**; `application/json` Content-Type required → 415 (strict media-type match — the hardening audit L1). In production the guard **fails closed (403) when no allow-list is configured** — was falling back to the client-controlled `Host` header (hardening-audit L2); in dev it still falls back to the request's own Host so a missing var doesn't 403 every local submission |
| T6 Serverless FS | **N/A under Phase 17** | Phase 10 (now removed) deployed to Vercel with storage in Google Sheets + Resend email (`lib/leads/{sheets,notify}.ts`), fail-closed (500) if misconfigured, appends using `valueInputOption=RAW` (CSV/formula injection mitigation). **Phase 17 (current):** deployment is a **GoDaddy VPS** with a persistent filesystem (the ephemeral-FS risk no longer applies), and storage is **GoDaddy SMTP email-only** (Sheets + Resend removed; `sheets.ts`/`notify.ts` deleted). |
| T7 Privacy policy | **Done** | `/privacy` page + required consent checkbox + link in the contact form |
| T8 Access/encryption | **Done (fail-closed) — Phase 17 store** | Prod store is the **team's GoDaddy mailbox** (SMTP email-only, TLS in transit); the dev fallback file is relocated outside the repo, mode `0o600` (dir `0o700`), AES-256-GCM encrypted with `SUBMISSIONS_ENCRYPTION_KEY` (validated as exactly 64 hex chars before use, so an over-length/non-hex value can't silently truncate to a weak key — the hardening audit L12; optional in dev → plaintext + warning), and perms are re-tightened on every write in case a pre-existing file/dir was looser (hardening-audit M3). **Prod fails closed (HTTP 500) if `SMTP_*` is misconfigured** (delivery mode `LEAD_DELIVERY=smtp`, defaulting from `NODE_ENV` — hardening-audit H3); `SUBMISSIONS_FILE_PATH` is rejected if it resolves inside the repo. `scripts/decrypt-submissions.mjs` reads dev entries; `scripts/redact-submission.mjs` erases by email and keeps **no `.bak` by default** (an encrypted safety copy is opt-in via `KEEP_REDACT_BACKUP=1` — the hardening audit M6). There is no Sheets/DB, so prod erasure is **manual mailbox deletion** (no automated Art. 17 path — documented in the privacy policy). |
| T9–T11 Governance | **Partial** | Dependabot + CI workflow (lint/build/audit) added; `@types/react` realigned to 19; **Sentry wired (server-only, env-gated — no-op until `SENTRY_DSN` set)**; Vercel log drain still pending |

**Verification:** `npm run lint` clean, `npm run build` passes, `npm audit` shows `0 critical / 0 high`. API smoke-tested on the prod server: `/` → 200; empty Origin → 403; non-JSON Content-Type → 415; valid request with `SMTP_*` unset in prod (`LEAD_DELIVERY=smtp`) → fail-closed 500.

**Data destination.** **Production (Phase 17, current):** `lib/leads/mail.ts` emails the team via GoDaddy SMTP (`SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO`) — email-only, fail-closed (HTTP 500) if `SMTP_*` is unset/misconfigured (the email is the store → no silent degradation). Erasure (GDPR/PDPL Art. 17) is **manual mailbox deletion** (no Sheets/DB). **Development** (file mode): falls back to `~/.xanadu-data/contact_submissions.json` (or `$SUBMISSIONS_FILE_PATH`), AES-256-GCM encrypted with `$SUBMISSIONS_ENCRYPTION_KEY`, perms `0o600` (dir `0o700`); read entries with `scripts/decrypt-submissions.mjs`.

## 2. What's already done well

- React auto-escaping; **no** `dangerouslySetInnerHTML`, `eval`, `new Function`,
  or `document.cookie` anywhere in the codebase.
- Server-side input validation: email regex, required name/email, `sessionType`
  enum check, and (when provided) phone parsed + validated via `libphonenumber-js`
  (`app/api/contact/route.ts`); the stored phone is canonicalized to E.164.
- **Injection hardening for the email store** — under Phase 17 the team email is
  the store (`lib/leads/mail.ts`), and every free-text field (name, phone,
  company, qualifying answers) is HTML-escaped before being inserted into the
  email body, so attacker-controlled text can't break out of the HTML.
- **Control-char / injection hardening** — every free-text field is stripped of
  C0 control bytes + DEL before validation + persistence
  (`app/api/contact/route.ts` `sanitizeBody`), blocking CRLF header/log
  injection and NUL truncation; prototype-pollution keys are rejected in
  `answers`; server logs are newline-collapsed + home-dir-redacted. **There is
  no SQL/database** in the app (leads → GoDaddy SMTP email or the local
  encrypted JSON file), so SQL injection is not an applicable surface; no shell `exec`, `eval`,
  or user-controlled URL fetch exists, so command-injection / SSRF are
  likewise not surfaces.
- Streaming request body size cap — 16 KB, enforced even without a
  `content-length` header (`route.ts`).
- Honeypot field (`website`) drops naive bots (`ContactFlow.tsx` → `route.ts`).
- Generic error responses — no stack traces leaked to clients.
- No path traversal (file path built from `process.cwd()` only) and no deep-merge
  (no prototype-pollution vector).
- `.env*` and `.npmrc` gitignored; GSAP tokens not in source.
- No third-party runtime scripts / analytics → low supply-chain runtime risk;
  fonts served locally via `next/font`.
- HTTPS enforced by nginx on the GoDaddy VPS (Phase 17) / by Vercel by default (Phase 10).

## 3. Threat catalog

| ID | Severity | Threat | Evidence | Impact |
|----|----------|--------|----------|--------|
| T1 | **High** | PII stored in plaintext in a **git-tracked** JSON file | `data/contact_submissions.json` absent from `.gitignore`; `app/api/contact/route.ts` `appendFile` writes name/email/phone/company; ~19 lines already in history | Unencrypted PII in version control; insider leak; compliance gap (GDPR/CCPA/PDPL). Private small team lowers blast radius but does not eliminate it |
| T2 | **High** | Vulnerable dependencies | `npm audit` 1 critical / 3 high / 1 moderate — `next@14.0.0` (GHSA-4342-x723-ch2f SSRF, GHSA-qpjv-v59x-3qc4 cache poisoning, multiple DoS incl. GHSA-mwv6-3258-q52c, GHSA-ffhc-5mcf-pf4q XSS w/ CSP nonces, GHSA-h64f-5h5j-jqjh image-opt DoS), `postcss` moderate | DoS, SSRF, cache poisoning, potential XSS once a CSP is added |
| T3 | **High** | No rate limiting / bot protection on `/api/contact` (honeypot only) | `route.ts` has no throttling; no Turnstile/hCaptcha | Spam floods, disk fill via appends, abuse if wired to email later, enumeration |
| T4 | **High** | No security headers / CSP | No `headers()` in `next.config.js`, no `middleware.ts` | No defense-in-depth XSS mitigation, no clickjacking protection, no enforced HSTS off-Vercel |
| T5 | **Medium** | No CSRF / Origin validation on POST | `route.ts` ignores `Origin` / `Referer` | Cross-origin forced submissions (spam); becomes a real CSRF risk the moment sessions/cookies are added |
| T6 | **Medium** | File persistence breaks on serverless read-only FS | `appendFile` to project FS fails on Vercel/Lambda → 500 | **Only a risk if hosted on serverless** — submissions silently lost; self-hosted is fine |
| T7 | **Medium** | No privacy policy, consent, or lawful-basis notice | No `/privacy` route; no checkbox/notice in `ContactFlow.tsx` | Legal/compliance exposure for a site collecting PII |
| T8 | **Medium** | No access control / encryption on stored PII | `contact_submissions.json` readable on repo + server FS | Insider leak; fails least-privilege and encryption-at-rest expectations |
| T9 | **Low** | No monitoring / alerting | No Sentry / log drain / thresholds | Abuse or outages go unnoticed |
| T10 | **Low** | Dependency type skew | `@types/react@19` vs runtime `react@18.2.0` | Can mask type-level security regressions |
| T11 | **Low** | No dependency governance | No Dependabot / Renovate, no CI audit gate | Recurrence of T2 |

## 4. Remediation plan (phased)

### P0 — Immediate (this week)

1. **Get PII out of version control.**
   - Add `data/` and `data/contact_submissions.json` to `.gitignore`.
   - `git rm --cached data/contact_submissions.json` so it stops being tracked.
   - Relocate the live file **outside the repo** (e.g.
     `~/.xanadu-data/contact_submissions.json`) and point the route at it via an
     env var (`SUBMISSIONS_FILE_PATH`).
   - Purge historical PII from git history with BFG Repo-Cleaner or
     `git filter-repo`, then force-push (coordinate briefly with the small team). _(T1, T8)_
2. **Patch dependencies.**
   - `npm audit fix --force` (proposes `next@14.2.35`) or upgrade to the latest
     stable 14.x; rerun `npm audit` until 0 high/critical; rebuild. _(T2)_
3. **Add security headers** via `next.config.js` `headers()`:
   - strict `Content-Security-Policy`,
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`,
   - `X-Content-Type-Options: nosniff`,
   - `Referrer-Policy: strict-origin-when-cross-origin`,
   - `Permissions-Policy` (limit camera/mic/geolocation),
   - `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`).
   - Must follow the Next upgrade to avoid the CSP-nonce XSS advisory. _(T4)_

### P1 — Short-term (next ~2 weeks)

4. **Rate-limit `/api/contact`.** Portable: in-memory token bucket for
   self-hosted single-instance, or Upstash Ratelimit
   (`@upstash/ratelimit` + `@upstash/redis`) for serverless.
   Suggest 5 requests/hour/IP, return `429`. _(T3)_
5. **Origin / Referer check** on the POST (reject cross-origin). _(T5)_
6. **Encrypt the file at rest** (symmetric encrypt of each JSONL line using a key
   from env) so the relocated file isn't plaintext on disk; restrict file perms
   to `0600`. _(T8)_
7. **Privacy compliance:** add a `/privacy` page + a consent checkbox in
   `ContactFlow.tsx`, linked from form and footer. _(T7)_

### P2 — Hardening / decisions pending

8. **Deployment pick flips two items** (decide before going to production):
   - If **Vercel / serverless** → file persistence **will not work** (read-only
     FS). Switch to email / CRM / DB even though file storage is preferred. _(T6)_
   - If **self-hosted** → file persistence is fine; ensure TLS termination + HSTS
     at the reverse proxy (nginx / Caddy).
9. **CSP with nonces** (post-upgrade) with tightened directives; verify build.
10. **Monitoring / alerting** (Sentry + platform log drain; alert on error spikes
    and 429 volume). _(T9)_
11. **Dependency governance:** enable Dependabot / Renovate, add a CI step that
    fails on `npm audit` high/critical, align `@types/react` with the runtime
    React version. _(T10, T11)_
12. **Data lifecycle:** retention window + deletion workflow for the GDPR right
    to erasure.
13. **Responsible disclosure:** add `.well-known/security.txt` with a contact.

## 5. Explicitly out of scope (per current decisions)

- Contact-persistence is **Phase 17 (current)**: GoDaddy VPS + GoDaddy SMTP email-only (no Sheets/DB), fail-closed on `SMTP_*`. The Phase 10 Google Sheets + Resend layer (`sheets.ts`/`notify.ts`) and its live-verification step S3.3 have been removed. The encrypted file remains the dev fallback (`LEAD_DELIVERY=file`).
- No emergency breach response (repo is private + small team) — the one-time history purge (deleting the `dependabot/*` branches) is complete.

## 6. Verification checklist

- [x] `data/` is gitignored; the historical PII blob `dbc418a` is unreachable from any live remote ref (dependabot branches deleted).
- [x] `npm audit` shows 0 high/critical; `npm run build` + `npm run lint` pass.
- [x] Security headers + nonce-CSP present — `curl -I` shows the per-request nonce; header nonce matches script nonces.
- [x] Dev submissions file lives at `$SUBMISSIONS_FILE_PATH` (or `~/.xanadu-data/`), outside the repo, with `0o600` perms (dir `0o700`), encrypted at rest; prod fails closed (500) without `SMTP_*` configured (`LEAD_DELIVERY=smtp`).
- [x] Repeated POSTs from one IP return `429` after the limit.
- [x] Cross-origin **and** empty-Origin POSTs return `403`; non-JSON Content-Type returns `415`.
- [x] `/privacy` reachable; form requires consent.

## 7. Open decisions still needed

- **Storage migration** — **DONE (Phase 17, current).** Phase 10's Sheets (storage) + Resend (email) is replaced by **GoDaddy SMTP email-only** (no Sheets/DB), fail-closed on `SMTP_*` (delivery mode `LEAD_DELIVERY=smtp`, defaulting from `NODE_ENV` — hardening-audit H3). Erasure is manual mailbox deletion. Provisioning: GoDaddy VPS + SMTP creds (`SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO`).
- **Rate limiting** — **DONE (code-complete).** A bounded in-memory limiter is the default (correct on the single GoDaddy VPS instance); Upstash is an optional env-gated shared store / resilience fallback (`security_implementation_plan.md` S3.1). `x-real-ip` requires `TRUST_REAL_IP=1` on **every host, including Vercel** — the `VERCEL=1` auto-trust was removed as spoofable off-Vercel (hardening-audit H2); forwarded-IP values are split + validated (hardening-audit L3).
- **Monitoring** — Sentry + a log drain are still pending (T9).
