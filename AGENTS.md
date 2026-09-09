# AGENTS.md

Single-page Next.js 16 marketing site for Xanadu (the "Line is the Story" scroll journey), plus detail routes (`/subsidiaries/[slug]`, `/investments`, `/work`, `/about`, `/privacy`). App Router + React 19 + TypeScript (strict) + Tailwind 3 + GSAP/ScrollTrigger + Lenis. Build/dev use Turbopack (Next 16 default). The site is a **light (white) theme** — colors flow from the CSS variables in `styles/globals.css`; `scripts/recolor-light-theme.py` regenerates the navy `parts/base.png` silhouette if it is ever replaced with a light version.

Authoritative context lives in `.kiro/steering/` (`tech.md`, `structure.md`, `product.md`) and `walkthrough.md`. Read those for architecture; this file captures only what an agent would otherwise get wrong.

## Commands

```bash
npm run dev      # dev server (http://localhost:3000) — Turbopack, outputs to .next/dev
npm run build    # production build (Turbopack) — THIS is the type check (no separate typecheck script)
npm run start    # serve the production build
npm run lint     # eslint . (flat config: eslint.config.mjs + eslint-config-next/core-web-vitals)
npm test         # vitest run — the test suite (test/**/*.{test,spec}.{ts,tsx})
npm run test:watch   # vitest in watch mode
npm run test:coverage    # vitest run --coverage
```

Tests use **Vitest** (`vitest.config.ts`): node-environment logic/server tests by default; component tests opt into jsdom via a `// @vitest-environment jsdom` pragma. `test/setup.ts` loads `@testing-library/jest-dom` matchers + registers DOM cleanup (needed because `globals: false`). Test files are **excluded from `tsconfig.json`** (and the Next build type-check) — they're type-checked/resolved by vitest. Several pure helpers are exported from `app/api/contact/route.ts`, `lib/rateLimit.ts`, `lib/leads/mail.ts`, and `lib/leads/file.ts` purely for unit testing; do not remove those exports.

`next build` no longer runs ESLint (Next 16 dropped that), so Verification = `npm run lint` then `npm test` then `npm run build`, plus manual click-through of CTAs / brand-mark builder / contact flow. Note: Next 16 splits `next dev` → `.next/dev` and `next build` → `.next`, so the two no longer clash (previously a running dev server could corrupt the prod build).

## Critical cross-file couplings (do not break)

- The scroll-driven logo assembly (`components/BrandMarkAssembly.tsx`) is a **PNG-layer model**: it renders a faint `base.png` silhouette (navy, recolored for the light theme), a `core.png` overlap, and one full-canvas slice per subsidiary (`/logos/parts/<id>.png`), all stacked at a shared `MARK_RECT` so they reproduce `/logos/group.png` pixel-for-pixel at rest. Each layer's scroll band is computed from `document.getElementById(layer.id)` — **the subsidiary section ids are load-bearing** (a renamed section id silently kills its fly-in band). `LAYERS` order must equal `lib/subsidiaries.ts` order (guard-tested in `test/consistency.test.ts`). The old hexagon-morph/`LINE_ENDPOINTS`/`ARMS` model and the interactive finale edges are gone, as are `BrandMark.tsx`, `LINE_PATHS`, and the `data-assembly-logo` attribute (Hero/FinalCTA render plain `<img src="/logos/holding.png|group.png">`). The layer `<image>` hrefs are attached lazily on first near-viewport frame — keep that.
- Home journey chapter order (pinned by `test/consistency.test.ts`): `hero → about ("Who are we?") → our-subsidiaries (intro heading) → the six subsidiary sections in lib order → investments → partners → network → final-cta`. On the home page each subsidiary renders the **summary** variant only (name + logo + one sentence + "Learn more"); the hook headline, CTA button, and the About/Services/Clients/Partner blocks render only on the `/subsidiaries/[slug]` detail pages (**full** variant).
- The Web3 subsidiary *displays* as `Web3` but its id / file / logo-path remain `xw3`.
- The header nav's **Subsidiaries item is a dropdown** (desktop hover/click + mobile accordion) linking each `/subsidiaries/<id>` plus an "All Subsidiaries" index. Other nav items: Investments, Our Work (`/work`), About Us. `/portfolio` → `/work` and `/founder` → `/about` are permanent redirects in `next.config.js` — don't recreate those routes.
- Adding/reordering/removing a subsidiary requires updating: `components/homeJourney.tsx` (the `HOME_JOURNEY` registry — the single ordering source; `app/page.tsx` composition, `ScrollProgress.SECTIONS`, and the detail-route `SUBSIDIARY_SECTIONS` map all derive from it), the corresponding `components/sections/*.tsx` (matching `id` + `logo`), `BrandMarkAssembly.LAYERS` + a matching `public/logos/parts/<id>.png` slice, `app/sitemap.ts`, and the z-index layering below.

## Conventions that differ from defaults

- `app/page.tsx` is `"use client"` and owns the `contactOpen` state; it threads `onContactClick` down to every section that has a CTA. The contact modal (`ContactFlow.tsx`) is code-split (`next/dynamic`) and mounts on open.
- `app/layout.tsx` stays a Server Component (fonts via `next/font/google`, metadata only) — no client logic.
- Z-index layering is fixed and must be preserved: particles (0) → content (5) → BrandMarkAssembly overlay (6) → ContactFlow modal (100).
- Colors/fonts come from CSS variables in `styles/globals.css` (`--color-consulting`, `--font-heading`, etc.). Prefer these and the `.glass-card` / `.section-container` / `.text-gradient` utilities over hardcoded values or new Tailwind config entries. Per-subsidiary accent colors are the one accepted use of inline `style`.
- GSAP: register `ScrollTrigger` at module top, wrap animations in `gsap.context(() => {...}, ref)` and return `ctx.revert()` from `useEffect`. `reactStrictMode: true` is on — effects run twice in dev, so cleanup must be correct.
- Subsidiary sections delegate to `components/SubsidiarySection.tsx` and only pass data props (color, hookText, description, services). Keep `components/sections/*.tsx` thin.

## Gotchas

- Contact submissions are **NOT stored in the repo**. `app/api/contact/route.ts` persists via the `lib/leads/*` modules. **The code is Phase 17** (GoDaddy SMTP email-only): production delivers leads **email-only** via **GoDaddy SMTP** (Nodemailer, `lib/leads/mail.ts`, `SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO`) — the handler **fails closed (HTTP 500) if `SMTP_*` is unconfigured/misconfigured in `smtp` delivery mode** (the email is the store, so no silent degradation). Delivery mode is selected by `LEAD_DELIVERY=smtp|file` (defaulting from `NODE_ENV`: production→smtp, else→file), so fail-closed no longer depends on the launcher setting `NODE_ENV=production` correctly (hardening-audit H3). The Phase 10 Google Sheets + Resend layer (`sheets.ts`/`notify.ts`) has been **removed**; there is no Sheets/DB. **Development** (file mode) falls back to the local encrypted file at `~/.xanadu-data/contact_submissions.json` (override with `SUBMISSIONS_FILE_PATH`, AES-256-GCM via `SUBMISSIONS_ENCRYPTION_KEY`, perms tightened to 0o600/0o700 on every write — hardening-audit M3); read entries with `scripts/decrypt-submissions.mjs`. Rate limiting: the **in-memory** limiter is correct on the single VPS instance (Upstash optional, env-gated). `.env.local` (gitignored) configures path/keys; `.env.example` documents all vars. The old in-repo `data/contact_submissions.json` was removed from `main`'s history, but its blob (`commit dbc418a`) remained reachable from the `dependabot/*` branches until they were deleted; verify with `git cat-file -p dbc418a` from a fresh clone before assuming PII is gone.
- Lead-path invariants (do not regress): under Phase 17 the lead path is **SMTP email-only** — keep `sanitizeBody` (strips C0/DEL control chars from free-text **before** validate+persist) so the email body stays injection-safe, and prototype-pollution keys rejected in `answers`; a deterministic Message-ID lets the team mailbox dedupe a genuine retry. The Phase 10 `sheets.ts` invariants (`valueInputOption=RAW`, `deleteLeadsByEmail`) are gone with that layer. In `lib/rateLimit.ts`, `x-real-ip` is honored **only** when `TRUST_REAL_IP=1` is set — the `VERCEL=1` auto-trust was removed (`VERCEL` is a plain, manually-settable env var that made the rate limit spoofable off-Vercel; hardening-audit H2), and forwarded-IP values are now split + validated via `node:net`'s `isIP` (rejects leading-zero IPv4 octets + non-IP/IPv6 garbage that the earlier hand-rolled check accepted as distinct, valid-looking bucket keys — a per-IP rate-limit bypass amplifier; hardening-audit L3). Set `TRUST_REAL_IP=1` on every host, including Vercel (where the platform sets `x-real-ip` reliably), and have nginx inject `x-real-ip` on the GoDaddy VPS — or every visitor collapses into one `'unknown'` 5/hr bucket.
- Input handling (`app/api/contact/route.ts`): the JSON body is shape-checked as a non-null object before any property access (hardening-audit H1); free-text fields run through `sanitizeBody` (strips C0/DEL control chars) **before** validate+persist — keep it; prototype-pollution keys are rejected in `answers`. Phone (optional) is validated + normalized to E.164 via `libphonenumber-js`; the client prefixes the selected country's dial code before sending. The contact endpoint is rate-limited **per IP (per user)** at 5/hr only (no shared/global cap, so legit users never block each other). The Origin guard requires an allow-list (`ALLOWED_ORIGINS`/`NEXT_PUBLIC_SITE_URL`) in prod and fails closed (403) when unset — was falling back to the client-controlled `Host` header (hardening-audit L2); the Content-Type guard is a strict `application/json` media-type match (the hardening audit L1). There is **no SQL/DB** (Phase 17: leads → GoDaddy SMTP email), so never introduce raw query building / string-concatenated SQL. See the hardening-audit notes for the full set of lead-path hardening fixes.
- `.next/`, `.env*`, and `.npmrc` are gitignored. `.npmrc` is ignored specifically so GSAP Club plugin tokens (MorphSVG/DrawSVG) are not leaked — keep tokens there, never in source.
- A previous top-level `app/route.ts` collided with `app/page.tsx` (both resolved to `/`) and broke the build. Do not add a root `app/route.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
