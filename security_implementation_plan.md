# Xanadu Website — Security Implementation Plan

The companion to [`SECURITY.md`](./SECURITY.md) (the point-in-time assessment). This file tracks the **active remediation work** — what's done, what's planned, and the inputs each task needs.

## Overview

A fresh security review (app + infra + supply-chain) was run after the initial hardening pass. **No Critical or High remotely-exploitable vulnerabilities remain.** The earlier work was verified intact: PII purged from live history, fail-closed encryption-at-rest, Origin + Content-Type CSRF guards, per-request CSP nonces, dependency upgrade to `next@16`/`react@19`. The nonce scheme is cryptographically sound, the PII data path is clean end-to-end, there is no XSS/injection/SSRF sink, and the historical PII blob (`dbc418a`) is unreachable from all refs.

What remains is: **Phase 17 (GoDaddy VPS + GoDaddy SMTP email-only) supersedes the Phase 10 serverless storage/email layer**, plus a couple of low-severity operational items. The Phase 10 S3.3 live-verification step is now moot (the layer it tests will be removed by Phase 17). Those are tracked below.

## Status Legend
- `[x]` DONE & verified
- `[ ]` PENDING
- `[~]` PARTIALLY done

---

## Verified clean (no action — recorded to avoid re-litigating)
- **CSP nonce scheme** (`proxy.ts`) — `crypto.randomUUID()` per request, `'self' 'nonce-X' 'strict-dynamic'`; blocks JSONP, injected SVG scripts, `javascript:` URIs, inline handlers. `base-uri`/`object-src`/`frame-ancestors`/`form-action` all locked. `/api` excluded from CSP matcher is fine (JSON-only, `X-Content-Type-Options: nosniff` covers it).
- **PII data path** — body → single `appendFile`; never logged (error logging is `fs` errno only, homedir-redacted), never sent to analytics (none), never cached (`force-dynamic` POST).
- **No XSS / injection** — only one `dangerouslySetInnerHTML` (the static `js`-class string, nonce'd); all rendered text is React-escaped or hardcoded; no `href`/`src` is request-derived.
- **Secrets handling** — `.env.local` gitignored (not tracked); `.env.example` placeholders only; the only `NEXT_PUBLIC_*` var is the non-secret site URL; all real secrets are non-public server env. CI uses `pull_request` (not `_target`), no `secrets.*`, no `write-all`.
- **Lockfile integrity** — all packages carry integrity hashes; `npm ci` enforced in CI.
- **`npm audit`** — **0 vulnerabilities** (post 2026-08-27 pentest: the `nanoid` HIGH was bumped to 3.3.18 and the 2 build-time moderates cleared with the same `npm audit fix`).
- **Historical PII** — `dbc418a` is not reachable from any ref (verified via `merge-base --is-ancestor`). Fresh clones + the remote are clean. (The object still exists in *this* local clone until GC — see S4.)

---

## Phase S1 — App-level quick wins
Status: **DONE** (no inputs required — done first)

- `[x]` **S1.1** `next.config.js` — `poweredByHeader: false` (removes `X-Powered-By: Next.js` fingerprinting on every response incl. `/api/contact`).
- `[x]` **S1.2** `lib/rateLimit.ts` — bound the `buckets` Map with an LRU cap (evict oldest regardless of expiry when `size > MAX_BUCKETS`); decouple sweep from request count. Closes the spoofed-IP memory-exhaustion DoS now, even before Upstash.
- `[x]` **S1.3** `app/api/contact/route.ts` — atomic create: `fs.open(filePath, 'a', 0o600)` then `write` (no plaintext-then-chmod race); `mkdir(dirname, { recursive: true, mode: 0o700 })`.
- `[x]` **S1.4** `app/api/contact/route.ts` — `getFilePath()` uses `fs.realpath()` for both the override and `process.cwd()` before the repo-boundary check (closes symlink + case-insensitive-FS bypass).
- `[x]` **S1.5** `app/api/contact/route.ts` — gate the localhost origins behind `NODE_ENV !== 'production'` (currently always allowed).
- `[x]` **S1.6** `app/api/contact/route.ts` — scheme-aware Origin compare: match on `(protocol, host)` tuples instead of host-only (so `http://` doesn't match an `https://` allow-list).

## Phase S2 — Config & supply-chain hardening
Status: **DONE** (no inputs required)

- `[x]` **S2.1** `.github/workflows/ci.yml` — pin `actions/checkout` + `actions/setup-node` to full 40-char commit SHAs with `# vX.Y.Z` comments (Dependabot keeps them fresh); add `permissions: { contents: read }` to the job.
- `[x]` **S2.2** `package.json` — add `"engines": { "node": ">=20.9" }` (matches CI's Node).
- `[x]` **S2.3** `next.config.js` — explicit `productionBrowserSourceMaps: false` (lock the default so no debug-info ever ships).
- `[x]` **S2.4** `next.config.js` — add `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Resource-Policy: same-origin` (do **not** add COEP — would break cross-origin assets/fonts).
- `[x]` **S2.5** `next.config.js` — HSTS `preload`: **dropped** (not enrolled; not all subdomains confirmed over HTTPS). Header is now `max-age=63072000; includeSubDomains`. Re-add `preload` only after enrolling at hstspreload.org.

## Phase S3 — Serverless correctness (rate limiting + storage)
Status: **CODE DONE (Phase 10, env-gated) — SUPERSEDED by Phase 17.** S3.3 live verification is moot (the Phase 10 layer it tests will be removed by Phase 17).

**Phase 10 framed this around Vercel (serverless).** Two things that don't survive serverless must move off the local instance: lead storage and the rate limiter. **Phase 17 supersedes this framing:** the site is moving to a **GoDaddy VPS** (persistent FS, single long-lived instance), lead delivery becomes **GoDaddy SMTP email-only** (no Sheets), and the in-memory limiter is correct on one instance (Upstash optional). The items below are kept as the Phase 10 record.

- `[x]` **S3.1** Rate limiting → **Upstash Ratelimit** (`@upstash/ratelimit` + `@upstash/redis`): shared store across instances; fixes the per-instance bypass (`N × 5/hr`) and the default `'unknown'`-bucket global lockout (5/hr shared by everyone). On Vercel, key by **`x-real-ip`** — now **auto-trusted via `VERCEL=1`** (or `TRUST_REAL_IP=1`), since Vercel sets it reliably — and **avoid `TRUST_XFF`** (leftmost `X-Forwarded-For` is client-spoofable). Keep the bounded in-memory limiter as a **dev fallback** (no Upstash in dev). **(Update — hardening-audit H2/L3: the `VERCEL=1` auto-trust was later removed entirely as spoofable off-Vercel; `TRUST_REAL_IP=1` is now required on every host incl. Vercel, forwarded-IP values are split + validated, and under Phase 17 the in-memory limiter is the default with Upstash optional.)**
- `[x]` **S3.2** Storage migration (= [`implementation_plan.md`](./implementation_plan.md) Phase 10): Google Sheets (storage) + Resend (team email). The S3.1 rate limit now also guards the **email** path → prevents outbound email-bombing / reputation damage / cost once Resend is live. Prod stays **fail-closed** if the Sheets/Resend env is unset. **(Superseded by Phase 17: GoDaddy SMTP email-only — same fail-closed posture, no Sheets.)**
- `[~]` **S3.3** Verify (needs creds): spoofed-IP load test against `/api/contact` → bounded + 429 across instances; a live submission lands a Sheet row + sends the team email. **MOOT under Phase 17** — the Sheets/Resend layer this tests is removed (Phase 17 shipped); replace with a Phase 17 SMTP live test (submission → team mailbox; per-IP 429 with `TRUST_REAL_IP=1` on every host + nginx `x-real-ip` on the VPS).

> **Required inputs (Phase 10, before the old prod works):** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`; Google service-account JSON (email + private key) + Sheet ID; `RESEND_API_KEY` + a **verified sender domain** (e.g. `noreply@xanadu.com`) + team recipient (e.g. `leads@xanadu.com`). **Phase 17 replaces these with:** GoDaddy VPS + `SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO` (+ `TRUST_REAL_IP=1` + nginx `x-real-ip`). Upstash becomes optional on the single VPS instance.

## Phase S4 — Compliance & operations
Status: **DONE** (S4.5 is a per-developer operational step)

- `[x]` **S4.1** **Erasure** — `scripts/redact-submission.mjs`: rewrites the JSONL minus the matching email (GDPR/PDPL Art. 17 right-to-erasure on the dev fallback file), atomic temp+rename (orphan `.tmp` unlinked on a failed swap), audit-logged. **No `.bak` by default** — a pre-erasure copy would retain the very record being erased; an encrypted safety copy is opt-in via `KEEP_REDACT_BACKUP=1` (the hardening audit M6). Prod erasure under Phase 17 is **manual mailbox deletion** (no Sheets/DB; the Phase 10 `lib/leads/sheets.ts` `deleteLeadsByEmail` path is gone). Verified round-trip locally.
- `[x]` **S4.2** **Privacy policy** (`app/privacy/page.tsx`) — added a 24-month retention window, lawful-basis (consent), PDPL/MENA + cross-border-transfer wording, rights incl. complaint-to-authority, and a security.txt link. Chose **light access logging** (decrypt/redact append to `~/.xanadu-data/access.log`) so the "restricted to authorized team members" claim is auditable.
- `[x]` **S4.3** **Monitoring** — wired **server-only** `@sentry/nextjs` via `instrumentation.ts` (`sentry.server.config.ts`), no-op without `SENTRY_DSN` (runtime env, no rebuild), zero client-bundle cost / no CSP change. The edge config was removed: Next 16 runs `proxy` on the Node.js runtime exclusively, so there are no edge functions to instrument (audit pass 3, the hardening audit B3). **Vercel log drain still to be configured** in the dashboard (documented) — Sentry DSN added when creds arrive.
- `[x]` **S4.4** `.well-known/security.txt` for responsible disclosure — **already present and RFC 9116-compliant** (`security@xanadu.com`, `Expires: 2027-12-31`); verified served as `text/plain`.
- `[ ]` **S4.5** **Operational (each developer)** — run `git gc --prune=now` to drop the local `dbc418a` PII object from this clone (fresh clones + remote are already clean). **Manual, per-clone.**

## Phase S5 — Additional lead-path hardening (second review)
Status: **DONE** (no inputs required)

A second pass on the contact/lead path closed four issues found after the initial hardening:

- `[x]` **S5.1** **Spreadsheet formula/CSV injection** (`lib/leads/sheets.ts`) — `appendLead` writes with `valueInputOption=RAW` (was `USER_ENTERED`), so attacker-controlled free-text fields (name/phone/company/qualifying answers) are stored verbatim and can't be parsed as `=HYPERLINK`/`=IMPORTXML`-style formulas when the team opens or exports the Sheet. **(Phase 10 only — `sheets.ts` is removed under Phase 17; the email body is already HTML-escaped, so no analogous risk remains.)**
- `[x]` **S5.2** **Erasure row integrity** (`lib/leads/sheets.ts` `deleteLeadsByEmail`) — the `deleteDimension` requests are now sorted descending, so a multi-match GDPR/PDPL Art. 17 erasure removes the correct rows (a `batchUpdate` applies the deletes sequentially and shifts later indices; ascending order was deleting shifted, unrelated rows).
- `[x]` **S5.3** **Origin-check availability** (`app/api/contact/route.ts`) — when `ALLOWED_ORIGINS` / `NEXT_PUBLIC_SITE_URL` are unset, the guard now falls back to the request's own Host (still CSRF-safe via the `application/json` preflight) instead of 403-ing every submission.
- `[x]` **S5.4** **Rate-limit IP keying on Vercel** (`lib/rateLimit.ts`) — `x-real-ip` is auto-trusted when `VERCEL=1` (Vercel sets it platform-side), so a missing `TRUST_REAL_IP` flag no longer collapses every visitor into one global 5/hr bucket. **(Update — hardening-audit H2: the `VERCEL=1` auto-trust was subsequently removed entirely — `VERCEL` is a manually-settable env var that made the rate limit spoofable off-Vercel; `TRUST_REAL_IP=1` is now required on every host including Vercel.)**
- `[x]` **S5.5** **Input sanitization + injection hardening** (`app/api/contact/route.ts`) — every free-text field is stripped of C0 control bytes + DEL before validation/persistence (`sanitizeBody`/`stripControls`), blocking CRLF header/log injection and NUL truncation across the GoDaddy SMTP email body, the dev JSONL file, and logs; prototype-pollution keys (`__proto__`/`constructor`/`prototype`) are rejected in `answers`; server logs are newline-collapsed + home-dir-redacted (`forLog`). The request body is shape-checked as a non-null object before any property access (hardening-audit H1). **No SQL/DB exists** in this app (Phase 17: leads → GoDaddy SMTP email / local encrypted file), so SQL injection is not an applicable surface; the analogous risk for the email store — HTML injection in the body — is neutralized by HTML-escaping every field in `lib/leads/mail.ts`.

> **Note on rate limiting:** the contact endpoint is throttled **per IP (per user)** at 5/hr only — there is no site-wide/global cap, so legitimate users never block each other. The trade-off is that a *distributed* attacker (many IPs) isn't fully capped by us; that's accepted because (a) each IP still gets only 5/hr, (b) the body/field-size caps + honeypot + control-char sanitization remain, and (c) Google Sheets and Resend enforce their own quotas/throttles on the downstream stores. A high, non-blocking global backstop (e.g. 500/hr) can be added later if abuse is observed.

---

## Verification checklist (per phase)
Verified 2026-08-27 (authorized penetration test — see the record below):
- [x] `npm run lint` + `npm run build` pass.
- [x] `curl -I` shows **no** `X-Powered-By**; COOP/CORP present; CSP nonce intact (per-request rotation confirmed; nonce stamped on framework + inline scripts).
- [x] Rate-limit load test (100 spoofed-IP reqs) → no crash/latency degradation; per-IP behavior confirmed (5 pass / 6th → 429 + `Retry-After`; distinct IPs isolated; comma-joined + leading-zero IPs rejected per S1.2/L3).
- [x] File created with `0600` (no `0644` window) — verified on a sandbox submissions file.
- [x] Erasure round-trip: submit → `redact-submission` → record gone (sandbox file, perms stay 0600).
- [x] Privacy policy claims auditable against the actual tooling.

## Penetration test record (2026-08-27)
Authorized test on the local clone: static review of the full lead path + attack-surface inventory, live probing of the dev server (sandbox submissions file + throwaway AES key, file delivery mode) and of the production build (`next start`), dependency audit, lockfile integrity, and git-history PII check.

**Findings — one issue, fixed:**
- **[HIGH, dependency]** `nanoid@3.3.16` (transitive via `postcss`) — GHSA-2v37-7h3g-55p8 (custom-generator infinite loop at size 0). Build-time-only surface, not reachable at runtime; bumped to **3.3.18** via `npm audit fix` (lockfile-only change). `npm audit` → **0 vulnerabilities** (the 2 build-time moderates also cleared).

**Verified clean (no action):**
- **CSRF/Origin**: missing/`null`/evil/Referer-less origins → 403; localhost origins rejected in prod; prod fails closed (403) with no allow-list; strict `application/json` media-type match — `text/application/json`, `application/json-seq`, `application/json-patch+json`, form-encoded all → 415. OPTIONS preflight returns **no** CORS grant (browsers block the cross-origin call; the POST-side origin check is the real gate).
- **Payload validation**: invalid JSON / `null` / arrays / scalars → 400 (shape-check before property access); prototype-pollution keys → 400; honeypot returns fake 200 and stores nothing; CRLF stripped from every free-text field pre-persistence (verified by decrypting the stored record); XSS payloads (`<script>`, `<img onerror>`) stored inert — `renderEmail`/`escapeHtml` is the sink gate (unit-tested); phone validated + E.164-normalized; per-field caps enforced; >16 KB bodies → 413 (chunked-transfer safe).
- **Rate limiting**: in-memory limiter correct (5 pass, 6th → 429 + `Retry-After`); `x-real-ip` honored only under `TRUST_REAL_IP=1`; per-IP buckets isolated; comma-joined lists split + validated; leading-zero IPv4 rejected (→ shared `'unknown'` bucket, not a fresh bucket).
- **Headers/CSP**: per-request rotating nonce + `strict-dynamic`, no `unsafe-inline` in `script-src`; HSTS/nosniff/Referrer-Policy/Permissions-Policy/X-Frame-Options/COOP/CORP all present in prod; no `X-Powered-By`/`Server` leak; no source maps shipped; no secrets in client chunks (the one regex hit was the literal `"mask-type"` CSS string).
- **File/erasure**: submissions file created `0600`, parent `0700`, AES-256-GCM ciphertext at rest; `redact-submission` erases the matching record only.
- **Misc**: `/subsidiaries/[slug]` uses `dynamicParams = false` + allow-list (no traversal; encoded `..%2f` → 404); `/_next/static/` traversal → 404; `GET /api/contact` → 405; `security.txt` served `text/plain`; robots disallows `/api`; lockfile has integrity hashes for 745/745 packages; no env/secret files tracked; the historical PII blob (`dbc418a`) is **absent from this clone entirely**; CI keeps `contents: read` + `pull_request` trigger.

## Open decisions
- **HSTS `preload`** (S2.5) — **RESOLVED: dropped.** Not enrolled and not all subdomains confirmed over HTTPS; re-add only after enrolling at hstspreload.org.
- **S3 credentials** — **superseded by Phase 17.** Phase 10 needed Upstash / Google service account / Resend; Phase 17 needs a GoDaddy VPS + `SMTP_*` (+ `TRUST_REAL_IP=1` + nginx `x-real-ip`). Upstash becomes optional on the single VPS instance.
- **Compliance scope** (S4.2) — **RESOLVED: light access logging.** decrypt/redact scripts append to `~/.xanadu-data/access.log`; retention 24 months; disclosure contact `security@xanadu.com`.
