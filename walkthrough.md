# Xanadu Website — Final Project Report

This document serves as the final report and explanation for the Xanadu single-page website. It translates the roadmap (`website_roadmap.txt`) into a premium, interactive, and highly dynamic web experience.

## The Core Concept: "The Line is the Story"

The roadmap's original metaphor was a fragmented line that connects and smooths into a hexagon. During the build this **evolved** through several models and now ships as a **PNG-layer assembly** (`components/BrandMarkAssembly.tsx`) that reads as the actual Xanadu logo at every stage:

1. **Persistent group mark:** a fixed right-side overlay (corner-pinned on mobile) holds the Xanadu group mark.
2. **Layered assembly:** as the user scrolls through each subsidiary section, that subsidiary's full-canvas PNG slice (`/logos/parts/<id>.png`) flies in over a faint base silhouette and settles into place; layers accumulate, and at rest they stack pixel-for-pixel back into `/logos/group.png`.
3. **Finale:** by the Final CTA all six layers have landed — the complete group mark rides alongside the closing CTA.

> **Historical note:** the earlier "one line per section" + six-color hexagon-finale model (with per-edge hover/click navigation, Phase 12.1) was later replaced by this PNG-slice model. The interactive finale edges no longer exist.

## Technical Architecture

The site was built using a modern, high-performance tech stack:
- **Framework:** Next.js 16 (App Router, Turbopack) with React 19 and TypeScript.
- **Styling:** Tailwind CSS 3 combined with a custom CSS variable design system (`globals.css`) to enforce the dark, premium aesthetic (`#050508` background with glassmorphism cards).
- **Typography:** Google Fonts (`Outfit` for cinematic headings via `--font-heading`, `Inter` for body text via `--font-body`). Loaded in `app/layout.tsx` as `--font-outfit` / `--font-inter` and bridged to the design-system names in `globals.css`.
- **Animation Engine:** **GSAP** (GreenSock Animation Platform) combined with **ScrollTrigger** drives all the scroll-linked animations.
- **Smooth Scrolling:** **Lenis** was integrated to override the default browser scroll, ensuring the animations remain perfectly smooth and buttery across all devices.

### Layering Contract (must be preserved)
The fixed/overlay elements are layered by `zIndex` — this order is load-bearing and documented in `AGENTS.md` / `.kiro/steering/structure.md`:

`particles (0) → content (5) → BrandMarkAssembly overlay (6) → ContactFlow modal (100)`

## Page Structure & Sections

The single-page experience (`app/page.tsx`) flows chronologically through the following sections:

1. **Hero Section:** The cinematic opening with a staggered word-reveal animation and the initial fragmented line.
2. **Subsidiary Sections (6x):** Reusable `SubsidiarySection` components display the brand logo mark, hook, description, and glassmorphism "service pills". Each section has a unique accent color:
   - **Consulting** (Green `#28D75A`)
   - **Soft** (Blue `#4176FA`)
   - **Sports** (Red-Orange `#FF4E33`)
   - **Ventures** (Yellow `#FFD21F`, includes the Portfolio grid)
   - **Trading** (Indigo `#4D7CFF`, includes the Portfolio grid)
   - **Xw3** (Purple `#9344DE`)
   
    Generic UI accents (focus rings, glows, buttons) use a navy-derived primary `#3D5A80` rather than any single subsidiary color. The group mark is shipped as PNGs — `/logos/holding.png` in the Hero and `/logos/group.png` in the Header + Final CTA footer (the earlier inline `<BrandMark>` SVG was removed with the PNG-slice assembly model).
 3. **Ecosystem & Validation:** 
    - **About:** A breather section explaining the Xanadu system.
    - **Investments:** An interactive grid of expandable cards detailing portfolio companies like Origin CX, Foras Fen, Qualiphi, Hatoon, Derma Egypt, and Ukaz.
    - **Partners:** A logo grid of 20+ partners (static, with a scroll-reveal).
    - **Network:** Highlights the benefits of Xanadu's activated network, with a lazy-loaded interactive MapLibre map of the MENA region.

## Interactive Features & Polish

To ensure the site feels truly premium and state-of-the-art, several micro-interactions were added:

> [!TIP]
> **Premium Micro-interactions**
> - **Loading Screen:** A 1.5-second cinematic loading sequence that masks the background calculations required by GSAP to map the SVG lines perfectly to the scroll height.
> - **Particle Field:** A subtle, slow-drifting HTML canvas particle system that lives behind the entire site, giving the dark background depth and atmosphere.
> - **Custom Cursor:** On desktop devices, the default mouse is replaced with a custom glowing dot and trailing ring that reacts and expands when hovering over clickable elements.

> [!IMPORTANT]
> **Hexagon Navigation (the roadmap's headline interaction) — IMPLEMENTED**
> Once the hexagon fully forms, each of its 6 sides becomes interactive (edge `i` ↔ subsidiary `i`):
> - **Hover** → the side brightens (thicker stroke + glow) and a floating subsidiary label appears.
> - **Click** → smooth-scrolls to that subsidiary's section.
> Sides are only interactive once the morph is essentially complete (`eM > 0.85`), so they never intercept the scroll journey. Reduced-motion: clickable, hover fx suppressed. (`implementation_plan.md` Phase 12.1.)

## The Contact Flow ("Talk to Xanadu")

Instead of a boring, standard contact form, the **"→ Talk to Xanadu"** button (led by the "Ready to scale?" climax line in the Final CTA) — plus every subsidiary section's CTA — opens a full-screen, guided modal (`ContactFlow.tsx`).

This system:
1. Welcomes the user and sets expectations.
2. Asks what they need help with (Growth, Tech, Investment, Trade, Sports, New Idea, Web3).
3. Asks for their company stage (Startup, Scaling, Enterprise).
4. Provides a text box for their biggest challenge.
5. Captures contact details (Name, Email, Phone, Company) — rendered with the `.contact-input` design-system style. Phone is optional; a **scrollable country-code picker** (all 245 countries, flag + dial code, name-first so typing a letter jumps to it) sits next to the field, and as the user types the number is parsed live with **libphonenumber-js** to show the detected country + validity. The server validates it and canonicalizes to E.164, and the team email shows the resolved country.
6. **Dynamically routes** the user to the correct Xanadu division based on their first answer.
7. Offers the user a choice between a **Free Alignment Call** or a **Paid Strategic Session** — this choice (`sessionType`) is submitted alongside the lead data.

Submissions are validated and persisted by `POST /api/contact` (`app/api/contact/route.ts`). **Phase 17 (current):** production delivers leads **email-only via GoDaddy SMTP** (`SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO`, `lib/leads/mail.ts` → `smtpout.secureserver.net`) and **fails closed (HTTP 500)** if `SMTP_*` is unconfigured/misconfigured in `smtp` delivery mode (the email is the store → no silent degradation). Delivery mode is selected by `LEAD_DELIVERY=smtp|file` (defaulting from `NODE_ENV`), so fail-closed no longer depends on the launcher setting `NODE_ENV=production` correctly. **Development** (`LEAD_DELIVERY=file`) falls back to the local AES-256-GCM-encrypted JSONL file at `~/.xanadu-data/contact_submissions.json` (override with `SUBMISSIONS_FILE_PATH`, perms `0o600`/`0o700`); read those entries with `scripts/decrypt-submissions.mjs`. Rate limiting uses the **in-memory** limiter (correct on the single VPS instance; Upstash optional, env-gated); per-IP keying needs `TRUST_REAL_IP=1` on every host (the `VERCEL=1` auto-trust was removed as spoofable off-Vercel) + nginx `x-real-ip` on the VPS. `.env.example` documents every var. The Phase 10 Google Sheets + Resend layer (`sheets.ts`/`notify.ts`) is removed. See the hardening-audit notes for the full lead-path hardening pass and `implementation_plan.md` Phase 17.

## Changelog — Phase 7 (Bug Fixes)

A full code review against the roadmap and steering docs produced the following fixes:
- Wired the four remaining subsidiary CTAs (Soft, Sports, Ventures, Xw3) so they open the contact modal.
- Corrected 3 wrong brand colors on the final hexagon (consulting/soft/ventures).
- Added `.contact-input` styling so the lead form renders correctly.
- Fixed the Lenis `gsap.ticker` cleanup (was leaking a RAF loop under React StrictMode).
- Captured and persisted the Free vs Paid session preference.
- Hardened the contact API (field/email validation, body-size cap, atomic JSON write).
- Restored the documented z-index layering for the hexagon overlay (`z-10`).
- Implemented hexagon side hover-glow + click-to-scroll navigation. *(Superseded: `HexagonFormation` was deleted in Phase 9; this interaction was re-implemented on `BrandMarkAssembly` in Phase 12 — see the Phases 12–15 changelog below.)*

> The former "open low-severity items" from this phase (ScrollProgress "System" dot, `LineCanvas` hydration, unused `onContactClick` props, the stale `README.md` reference) are all **resolved** — see the Backlog in `implementation_plan.md` and the Phase 9b / Phase 15 changelogs.

## Changelog — Phase 8 (Brand Refresh)

Applied the new brand kit from `new brand updated/`:
- New subsidiary palette: Consulting → green `#28D75A`, Soft → blue `#4176FA`, Sports → red-orange `#FF4E33`, Ventures → yellow `#FFD21F`. Trading & Xw3 unchanged (no assets in the kit). Group navy `#151923`; Investments gold `#D9B00D`. *(Superseded: Trading & Xw3 later received mark-only logos + brand colors — indigo `#4D7CFF` / purple `#9344DE`; see the Trading & Web3 logo completion changelog below.)*
- Introduced a navy-derived generic primary (`--accent-primary: #3D5A80`) to replace the old Consulting blue that was used site-wide for buttons, focus rings, and glows.
- Recolored the scroll line, hexagon, every section, the contact flow routing, and all generic accents.
 - Added the group logo (`public/logos/xanadu-group.png`) to the Hero and Final CTA footer. Per-subsidiary logos were tried in the section headers but the blind-extracted lockups rendered poorly (duplicated the heading and disrupted the reveal animation), so they were reverted — pending isolated mark-only assets. *(Superseded in Phase 9: the Hero + Final CTA now render the inline `<BrandMark>` SVG instead; the orphaned PNG was removed in Phase 15.3.)*

## Changelog — Phase 9 (Brand-Mark Assembly model)

> **Superseded:** `BrandMark.tsx` was later deleted; the assembly now uses full-canvas PNG slices per subsidiary (see "The Core Concept" above). The entries below are historical.

Replaced the center-screen assembling hexagon (`HexagonFormation.tsx`) and the scroll line canvas (`LineCanvas.tsx`) with a **brand-mark assembly** model that always reads as the real Xanadu logo:
- `components/BrandMark.tsx` — inline SVG of the group mark (transparent, scalable), used in the Hero and Final CTA.
- `components/BrandMarkAssembly.tsx` — a persistent right-side overlay; each subsidiary section's logo (marked `data-assembly-logo`) flies into the mark as the user scrolls (the four diagonal-stroke divisions ride their colored line). At the Final CTA the strokes slide into a six-color flat-top hexagon. *(Updated later: Trading/Xw3 now fly their logos in too — straight to their finale hexagon edge, instead of the earlier accent-glow silhouette tint.)*
- Deleted `HexagonFormation.tsx` and `LineCanvas.tsx`; the per-side hexagon navigation and "Ready to scale?" climax line were **not** re-added at the time (per-side nav returned in Phase 12; the climax line now leads the FinalCTA button).
- Z-index layering updated to `particles(0) → content(5) → BrandMarkAssembly(6) → ContactFlow(100)`.

## Changelog — Modularity pass (single ordering source, shared reveal + portfolio modules)

Structural dedup on top of the perf passes — same rendered output, fewer places to change:
- **`components/homeJourney.tsx`** — the home journey's section order existed three times (page.tsx composition, `ScrollProgress.SECTIONS`, the coupling test). One `HOME_JOURNEY` registry (id + label + Component) now feeds `page.tsx` (maps it), `ScrollProgress.SECTIONS` (derived; same export for the test), and the detail route's `SUBSIDIARY_SECTIONS` map (derived from `lib/subsidiaries.ts` ids, throws if a subsidiary lacks a journey entry). Adding a subsidiary = one registry entry instead of three coordinated edits.
- **`lib/useRevealOnScroll.ts`** — the six copy-pasted `gsap.fromTo` reveal blocks (Subsidiary/About/Partners/Investments/Network/FinalCTA) collapsed into one hook; per-section timing stays as call-site knobs, reduced-motion + `gsap.context` cleanup live once.
- **`components/PortfolioGrid.tsx`** — the near-identical Ventures/Trading portfolio grids unified ('tagged'/'plain' variants, accent from subsidiary data instead of hardcoded hex).
- **Misc perf**: `dns-prefetch` hints for the map tile hosts (map tiles connect sooner at journey's end without holding a preconnect all session); `SubsidiaryDetailClient` got the same stable-callback treatment as `page.tsx`.

## Changelog — Runtime performance pass 2 (time + memory)

Zero-allocation frame loops and render-scope reduction on top of the earlier lazy-chunk/asset pass:
- **`BrandMarkAssembly` ticker → `gsap.quickSetter`** — the scroll update ran ~9 `gsap.set` calls per frame (each allocating + parsing a vars object); each layer/overlay/core write now goes through one-time-built per-property quickSetters (straight to GSAP's transform cache, no per-frame allocation). The per-frame silhouette-opacity set was redundant (pinned by the JSX inline style) and is gone. Guarded by `test/brand-mark-assembly.test.tsx`.
- **`CustomCursor` → quickSetters** — the dot/ring position writes ran one `gsap.set` per mousemove (input-device rate, >120 Hz possible) + one per rAF frame; now zero-alloc quickSetter writes.
- **`ParticleField` batched rendering** — alpha is quantized into 5 buckets at seed time so the rAF loop draws one `beginPath`/`fill` per bucket with precomputed `fillStyle` strings, instead of ~`width/15` per-particle fills that each built + parsed an `rgba()` template string every frame (≈128 string allocations + CSS color parses per frame at desktop width).
- **Modal open/close no longer re-renders the page** — `page.tsx` passes one `useCallback`-stable `openContact` to every CTA section and all sections + `FinalCTA` are `memo()`-wrapped, so the `contactOpen` state change reconciles only the modal subtree (previously all 12 sections re-rendered, including their GSAP-heavy JSX trees).

## Changelog — Hardening Pass (security, a11y, performance)

A code+security review closed the following (see `SECURITY.md` and `implementation_plan.md`):
- **Security:** PII purged from live remote history (the dependabot branches holding commit `dbc418a` were deleted); contact API now fails closed when `SMTP_*` is unset in `smtp` delivery mode, rejects empty Origin (and fails closed in prod with no allow-list), requires a strict `application/json` Content-Type, validates `SUBMISSIONS_FILE_PATH` stays outside the repo, and pins the Node runtime; `X-Real-IP` rate-limit keying gated behind `TRUST_REAL_IP=1` (now required on every host — the `VERCEL=1` auto-trust was removed as spoofable off-Vercel); per-request **CSP nonces** via `proxy.ts` (drops `unsafe-inline` for `script-src` in prod). See the hardening-audit notes for the full hardening pass.
- **Correctness:** `BrandMarkAssembly` now recomputes its scroll bounds on `fonts.ready` / `load` / per-logo image load (it drove off `window.scrollY`, so `ScrollTrigger.refresh` never covered it).
- **Accessibility (WCAG):** `prefers-reduced-motion` handling across Lenis / particle field / custom cursor / infinite tweens; progressive-enhancement (`.reveal-item` / `.js-hidden` scoped to `html.js` so no-JS users still see content); accordions converted to real `<button>` + `aria-expanded`/`aria-controls`; contact textarea labelled.
- **Cleanup:** removed dead `onContactClick` props, stale vestigial ids, hardened `metadataBase`, cancelled the `fonts.ready` promise on unmount.

## Changelog — Phase 10 (Lead Storage Migration: Google Sheets + Resend)

The serverless-correctness gap is closed — the contact endpoint no longer depends on the ephemeral Vercel filesystem. Existing validation, rate-limit, CSRF (Origin/Referer + `application/json`), honeypot, and 16 KB body-cap all stay; only the persistence + notification layer changed (`app/api/contact/route.ts` `storeLead`):
- **Storage** — `lib/leads/sheets.ts`: appends a row to Google Sheets via a service account (JWT, `google-auth-library` + raw `fetch`) using `insertDataOption: INSERT_ROWS` so concurrent submissions can't collide, and `valueInputOption: RAW` so free-text fields can't be parsed as formulas (CSV/formula injection).
- **Notifications** — `lib/leads/notify.ts`: Resend sends a formatted HTML email to the team on every submission (with `reply_to` set to the submitter).
- **Prod posture** — fail-closed (HTTP 500) if Sheets or Resend env is unset, mirroring the earlier encryption fail-closed pattern.
- **Dev fallback** — the local AES-256-GCM JSONL file (`lib/leads/file.ts`) remains the zero-setup local-dev store; Resend is best-effort there.
- **Rate limiting** — moved to **Upstash Ratelimit** (shared across serverless instances); the in-memory limiter is now the dev/resilience fallback.
- **Erasure** — `lib/leads/sheets.ts` `deleteLeadsByEmail` mirrors `scripts/redact-submission.mjs` for the prod store (GDPR/PDPL Art. 17), deleting matching rows bottom-up so a multi-match request removes the correct rows.

Required inputs before prod works: `UPSTASH_REDIS_REST_URL` / `_TOKEN`; Google service-account JSON + `GOOGLE_SHEET_ID`; `RESEND_API_KEY` + verified sender domain + team recipient. Live verification (a real submission landing a Sheet row + sending the email) is the only remaining step — `security_implementation_plan.md` S3.3, blocked on credentials.

> **Phase 17 (current) superseded this layer.** Hosting moved to a **GoDaddy VPS** and lead delivery is **GoDaddy SMTP email-only** (Nodemailer, no Sheets, no Resend) — still fail-closed. `lib/leads/notify.ts` → `lib/leads/mail.ts`; `lib/leads/sheets.ts` is removed; the `Lead` type moved to `lib/leads/types.ts`. Erasure is manual mailbox deletion (no `deleteLeadsByEmail`). The in-memory rate limiter is correct on the single VPS instance (Upstash optional); per-IP keying needs `TRUST_REAL_IP=1` (on every host — the `VERCEL=1` auto-trust was removed entirely as spoofable off-Vercel; hardening-audit H2) + nginx `x-real-ip` on the VPS. See `implementation_plan.md` Phase 17.

All roadmap phases (11–15) are now complete: contact-flow confirmation screen + env-gated booking (11), interactive finale hexagon (12), content depth (13), SEO (14), and cleanup (15).

## Changelog — Trading & Web3 logo completion + brand-color update

All six subsidiaries now fly into the `BrandMarkAssembly` mark; the earlier Trading/Xw3 "no logo" gap (they tinted the silhouette with an accent glow) is closed.
- **Mark-only logos** — extracted the Trading & Web3 symbols from the brand-kit assets (`public/logos/trading.png`, `public/logos/xw3.png`); the white background was keyed out (feathered) and the wordmark cropped away so only the mark remains, matching the other four logos.
- **Assembly** — `BrandMarkAssembly` `ARMS` expanded to 6. Trading/Xw3 carry `hasLine: false` (no diagonal stroke) and fly straight to their finale hexagon edge; the accent-glow silhouette tint was removed (it was the stopgap for the logoless two).
- **Brand colors** — adopted the new logos' colors as the Trading/Web3 brand colors: Trading → indigo `#4D7CFF` (the logo's `#011F7F` is too dark to read on `#050508`), Web3 → purple `#9344DE` (replacing the amber/cyan placeholders) across `HEXAGON_COLORS`, arm/section/routing colors, CSS vars, and `BrandMark`.
- Docs synced (AGENTS/README/walkthrough/implementation_plan + `.kiro/steering`) to the six-logo + indigo/purple model.

> Trading's brand color is indigo `#4D7CFF` (~5.3:1 contrast on `#050508`) so the section text, the flying mark, and the finale hexagon edge all stay legible on the dark background.

## Changelog — Website audit (typography + one-line-per-section)

Implemented the four notes from the website audit PDF:
- **Typography hierarchy (Issue 1)** — `SubsidiarySection.tsx` section title (the subsidiary name) bumped from `text-2xl/3xl font-bold` to `text-4xl/5xl/6xl font-extrabold`, so it now leads the hierarchy instead of being dwarfed by the hook headline. Shared component, so all six subsidiaries stay consistent.
- **One line per section (Issues 2–4)** — `BrandMarkAssembly.tsx` switched from the accumulating group-mark model to a **one-line-per-section** model: all six subsidiaries now carry `hasLine: true` and ride their own `LINE_ENDPOINTS` stroke (entries 4–5 for Trading/Web3 are assembly-only diagonals; `LINE_PATHS` / the static `BrandMark` logo stay at the 4 brand-kit strokes). Only the active subsidiary's logo + line are visible at any scroll position — previous ones clear as the next section enters (no leftover colored lines) — and at the finale all six lines gather and morph into the hexagon. The old manually-rendered `#assembly-line-4`/`-5` finale edges are gone (they're regular morphable lines now).
- **Web3 spelling** — the Web3 subsidiary displays as `Web3` everywhere user-visible (section title, scroll-progress dot, hexagon hover label, contact routing + server validation); its internal `id` / file / logo-path remain `xw3` to preserve the `data-assembly-logo` coupling.

> Trading/Web3 diagonal stroke coordinates in `LINE_ENDPOINTS[4–5]` are tunable; the static group logo in the Hero/FinalCTA is intentionally unchanged (still the 4 brand-kit strokes).

## Changelog — Phases 11–15 (contact completion, interactive finale, content depth, SEO, cleanup)

All remaining roadmap phases shipped:
- **Phase 11 — Contact completion:** a post-submit **confirmation screen** ("We've received your request" + routed division + session type + Done) replaced the instant close, and an env-gated **Cal.com/Calendly booking embed** (`NEXT_PUBLIC_CALENDAR_FREE_URL` / `_PAID_URL` / fallback `NEXT_PUBLIC_CALENDAR_URL`) slots in between the Free/Paid choice and the confirmation — skipping gracefully to confirmation when no calendar URL is set.
- **Phase 12 — Interactive finale hexagon:** once the six-color hexagon forms at the Final CTA, each of its 6 sides becomes hover/click navigation back to its subsidiary (`BrandMarkAssembly.tsx`; edge `i` ↔ `ARMS[i]` ↔ section `id`; interactive only past `eM > 0.85`, reduced-motion-aware). The "Ready to scale?" climax line leads the FinalCTA's "→ Talk to Xanadu" button (the in-hexagon "Contact Us Now" button was dropped in review).
- **Phase 13 — Content depth:** Investments cards gained a per-entry case study (subject/challenge/solution/result); Case Studies restructured to bulleted Challenge / What Xanadu Did / Execution / Outcome + Key Insight; Ventures gained the two Stealth portfolio entries, the full "Why This Matters" block, and the "Scaling Frameworks" service.
- **Phase 14 — SEO / production-readiness:** dynamic favicon (`app/icon.tsx`), OpenGraph + Twitter images (`app/opengraph-image.tsx` / `app/twitter-image.tsx`) via `next/og` — shared glyph-free scene in `lib/og-mark.tsx`; `app/sitemap.ts` + `app/robots.ts` (+ `lib/site.ts`); a mobile/tablet top scroll-progress bar in `ScrollProgress.tsx`.
- **Phase 15 — Cleanup:** deleted the orphaned `public/logos/xanadu-group.png`; renamed `middleware.ts` → `proxy.ts` (+ the `proxy` export) for the Next 16 convention; refreshed the docs to the `proxy.ts` path.

## Planned — Phase 16 (Authentication & Accounts)

Beyond the shipped roadmap, the next initiative is **authentication** (`implementation_plan.md` Phase 16) — **not yet implemented**. Decision: **Auth.js v5 + Neon Postgres (Drizzle ORM)**, **Google OAuth** primary + **email magic link** (Resend) fallback, **no passwords**, with `admin`/`client` roles resolved from an `ADMIN_EMAILS` allowlist. It will unlock (a) a team `/admin` lead dashboard with in-app GDPR erasure (replacing the `scripts/redact-submission.mjs` workflow), (b) a client `/portal`, and (c) an optional, env-gated login gate on the contact/booking flow (`CONTACT_REQUIRE_AUTH`, off by default). It introduces the app's **first database** and **first sessions/cookies**, so CSRF hardening (SECURITY.md T5 goes live), login rate-limiting, an `audit_log` table, and a privacy-policy update for auth PII are scoped in. Like Phase 10, it's **credential-blocked** — needs a free Neon DB (`DATABASE_URL`) + a Google OAuth client (`AUTH_GOOGLE_ID` / `_SECRET`); see `.env.example`.
