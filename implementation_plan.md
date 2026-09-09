# Xanadu Website — Full Build Implementation Plan

## Overview

A premium single-page scrolling experience where **the line IS the story**. A fragmented, broken line transforms through scroll into a **unicursal hexagon** — representing Xanadu's unified growth system.

**Tech stack:** Next.js 16 (App Router, Turbopack) + React 19 + GSAP + Lenis + Tailwind CSS 3.4 + TypeScript  
**Design language:** Dark base (`#050508`), electric accents (green/blue/red/yellow/indigo/purple), thin glowing lines, breathing animations, cinematic typography

---

## Status Legend
- `[x]` DONE & verified
- `[~]` PARTIALLY done — gaps tracked below
- `[ ]` PENDING / backlog

---

## Phases & Tasks Breakdown

### Phase 1: Foundation + Core Visuals
Status: **DONE**

- `[x]` **Global Setup:** Configure `app/layout.tsx` and `globals.css` with design tokens, fonts, and smooth scroll provider.
- `[x]` **Page Orchestration:** Set up `app/page.tsx` to sequence all sections in order.
- `[x]` **Core Visuals:** Implement `LoadingScreen.tsx`, `CustomCursor.tsx`, and `ParticleField.tsx`.
- `[x]` **Scroll Journey Components:** Build `ScrollProgress.tsx` indicator.
- `[x]` **Hero & Line Canvas:** Implement `HeroSection.tsx` and the GSAP background animation in `LineCanvas.tsx`.

### Phase 2: Subsidiary Sections (UI)
Status: **DONE**

- `[x]` **Reusable Component:** Build `SubsidiarySection.tsx` to standardize layout, GSAP reveals, and CTA styling.
- `[x]` **Consulting:** Build `ConsultingSection.tsx`.
- `[x]` **Soft:** Build `SoftSection.tsx`.
- `[x]` **Sports:** Build `SportsSection.tsx`.
- `[x]` **Ventures:** Build `VenturesSection.tsx`.
- `[x]` **Trading:** Build `TradingSection.tsx`.
- `[x]` **Xw3:** Build `Xw3Section.tsx`.

### Phase 3: Ecosystem Sections (UI)
Status: **DONE**

- `[x]` **About Xanadu:** Build `AboutSection.tsx`.
- `[x]` **Investments:** Build `InvestmentsSection.tsx`.
- `[x]` **Partners:** Build `PartnersSection.tsx`.
- `[x]` **Network:** Build `NetworkSection.tsx`.
- `[x]` **Case Studies:** Build `CaseStudiesSection.tsx`.

### Phase 4: Interactive Navigation & End CTAs
Status: **DONE** (completed in Phase 7 — see history note)

> History: Initially marked DONE, but a review found that two tasks were not actually implemented. They were rebuilt in Phase 7:
> - "Hexagon Interactive Hover" and "Hexagon Click-to-Scroll" were unimplemented (the hexagon only had the center CTA). Both are now implemented per roadmap lines 460-465.

- `[x]` **The Big Moment:** Build `HexagonFormation.tsx`.
- `[x]` **Hexagon Interactive Hover:** Hexagon sides glow on hover and display subsidiary labels.
- `[x]` **Hexagon Click-to-Scroll:** Clicking hexagon sides smoothly scrolls to the respective section.
- `[x]` **Final CTA:** Build `FinalCTA.tsx`.
- `[x]` **Contact Flow UI (Frontend):** Build `ContactFlow.tsx` modal with the step-by-step questionnaire.

### Phase 5: Contact Flow Backend & Global Linking
Status: **DONE** (hardened in Phase 7)

- `[x]` **Task 5.1: Global CTA Hookup** 
  - `app/page.tsx` threads `onContactClick={() => setContactOpen(true)}` to every subsidiary and ecosystem section.
  - History: an initial pass wired only Consulting & Trading CTAs. Phase 7 fixed the four remaining dead CTAs (Soft, Sports, Ventures, Xw3) — see Bug #1.
- `[x]` **Task 5.2: User Information Capture**
  - `ContactFlow.tsx` collects Name, Email, Phone, and Company before the decision screen.
- `[x]` **Task 5.3: Backend Integration**
  - `app/api/contact/route.ts` persists submissions to `data/contact_submissions.json`.
  - Phase 7 added input validation, email/size guards, and an atomic write (see Bug #6).
  - Phase 7 also captures the Free vs Paid session choice (see Bug #5).

### Phase 6: Content & Visual Polish (Roadmap Alignment)
Status: **DONE**

- `[x]` **Task 6.1: Roadmap Text Verification** — section copy matches `website_roadmap.txt`.
- `[x]` **Task 6.2: Portfolio & Partner Names** — Partners list (20 logos) and Investments cards match the roadmap.
- `[x]` **Task 6.3: Line Animation Sync** — `LineCanvas.tsx` arms map to subsidiary scroll progress.
- `[x]` **Task 6.4: Interactive Hexagon Verification** — section IDs (`consulting`, `soft`, `sports`, `ventures`, `trading`, `xw3`) match across `LineCanvas.tsx`, `HexagonFormation.tsx`, and the section components.

---

### Phase 7: Bug Fixes & Polish (Roadmap + Code Review)
Status: **DONE**

This phase closed the gaps found by comparing the source against `website_roadmap.txt` and `.kiro/steering/*`.

- `[x]` **#1 (High) Dead subsidiary CTAs** — `SoftSection`, `SportsSection`, `VenturesSection`, `Xw3Section` accepted `onContactClick` but never forwarded it as `onCtaClick` to `SubsidiarySection`, so 4 CTA buttons did nothing. Fixed by adding `onCtaClick={onContactClick}` to each.
- `[x]` **#2 (High) Hexagon brand-color mismatch** — `HexagonFormation.tsx` ARMS used wrong colors for 3 of 6 sides (consulting was green, soft was blue, ventures was yellow). Aligned to the canonical palette in `globals.css` / `product.md` (consulting `#3B82F6`, soft `#8B5CF6`, ventures `#10B981`).
- `[x]` **#3 (High) Unstyled contact inputs** — `ContactFlow.tsx` used a `.contact-input` class that was never defined. Added the rule to `globals.css` (bg, border, radius, placeholder, focus glow).
- `[x]` **#4 (Med) Lenis ticker leak** — `SmoothScrollProvider.tsx` cleanup passed a *new* function to `gsap.ticker.remove`, so the original RAF callback was never removed (dangling loop under StrictMode). Hoisted the handler to a named const and removed the same reference.
- `[x]` **#5 (Med) Free vs Paid choice lost** — both result buttons in `ContactFlow.tsx` just closed the modal. Refactored so the single submission fires on the user's session choice and includes `sessionType` ('free' | 'paid') in the payload.
- `[x]` **#6 (Med) Contact API hardening** — `app/api/contact/route.ts` had no validation and a read-modify-write race. Added field/email validation, a 16 KB body cap, `400`/`413` responses, and an atomic temp-file + `fs.rename` write.
- `[x]` **#7 (Med) Z-index layering violation** — `HexagonFormation.tsx` used `z-40`, breaking the contract documented in `AGENTS.md` / `structure.md`. Changed to `z-10` (particles 0 → line 1 → content 5 → hexagon 10 → modal 100).
- `[x]` **#9 (Med) Hexagon side navigation** — implemented the roadmap's headline feature: each hexagon side now glows on hover with a floating subsidiary label, and click-to-scrolls to that section. Sides only become interactive once the hexagon is fully formed.

### Backlog (low severity — not blocking)
- `[x]` **#8** `ScrollProgress.tsx` `id="hexagon"` dot — replaced with `final-cta` (and Phase 9 removes the assembling hexagon entirely). Done.
- `[x]` **#10** `LineCanvas.tsx` `Math.random()` hydration — replaced with a deterministic seeded PRNG. (Moot: `LineCanvas` was deleted in Phase 9.)
- `[x]` **#11** Dead/unused `onContactClick` props on `HeroSection`, `InvestmentsSection`, `CaseStudiesSection` — removed the props + page.tsx threading; standardized the prop to optional across the rest. Done in Phase 9b.
- `[x]` **#12** `README.md` referenced a non-existent `components/LineJourney.tsx` — fixed in the Phase 15 doc pass.
- `[x]` Optional: `metadata.metadataBase` — set in `app/layout.tsx` (env-configurable, wrapped in try/catch in Phase 9b). Done.
- `[x]` **Subsidiary logos** — resolved: all 6 divisions render logos via `data-assembly-logo` and fly into the `BrandMarkAssembly` mark (Consulting/Soft/Sports/Ventures ride `LINE_ENDPOINTS`; Trading/Xw3 fly to their finale hexagon edge). The Trading/Xw3 accent-glow silhouette tint was removed once their logos landed.

---

### Phase 8: Brand Refresh (new brand kit)
Status: **DONE**

Applied the new brand identity from `new brand updated/`. The kit defines colors/logos for Consulting, Soft, Sports, and Ventures only; Trading and Xw3 keep their existing colors.

- `[x]` **#1 Design tokens** (`styles/globals.css`) — updated `--color-*`, `--glow-*`, `::selection`, `.contact-input:focus`. Added `--color-group: #151923`, `--accent-primary: #3D5A80` (navy-derived generic primary, replacing the old Consulting blue used as a site-wide accent), and `--accent-primary-rgb`.
- `[x]` **#2 Recolor scroll + hexagon** — `LineCanvas.tsx` and `HexagonFormation.tsx` ARMS arrays.
- `[x]` **#3 Recolor sections** — `color=` props and hardcoded hexes in `VenturesSection`, `InvestmentsSection`, `CaseStudiesSection` (division colors), and the `PartnersSection` hover glow.
- `[x]` **#4 Contact flow** — `ContactFlow.tsx` ROUTING division colors updated; all generic `#3B82F6`/`bg-blue-600` chrome moved to navy (`--accent-primary`).
- `[x]` **#5 Generic primary → navy** — `HeroSection` glow, `FinalCTA` gradient, `NetworkSection` icons, `LoadingScreen` spinner.
- `[x]` **#6 Group logo** — `public/logos/xanadu-group.png` (the known-correct transparent PNG from the kit) added to `HeroSection` and the `FinalCTA` footer.
- `[~]` **#7 Subsidiary logos (deferred)** — initially extracted per-subsidiary SVGs from `new brand updated/xanadu sprite.svg` and wired them into the four section headers, but the lockups rendered poorly at header size (duplicated the heading wordmark and disrupted the `reveal-item` text animation). Reverted; see Backlog. Trading/Xw3 have no logo assets regardless. *(Superseded: Trading & Xw3 later received mark-only logos — see "Trading & Web3 logo completion" in Recent Fixes.)*

---

### Phase 9: Brand-Mark Assembly Motif (replaces center-screen hexagon)
Status: **DONE** (implementation diverged from the original per-section-builder plan — see note)

Replaced the center-screen assembling hexagon (`HexagonFormation.tsx`) and the scroll line canvas (`LineCanvas.tsx`) with a **brand-mark assembly** model that always reads as the real Xanadu logo at every stage. The original plan (a per-section top-left builder completing at Xw3) evolved during the build into a single persistent right-side overlay.

> **Design divergence (intentional):** the planned per-section top-left builder (`stepIndex` + climax CTA at Xw3) was superseded by `BrandMarkAssembly` — a persistent right-side mark whose subsidiary logos fly in along their colored lines and converge into a six-color hexagon at the Final CTA. The "Ready to scale?" climax CTA and per-side hexagon navigation were **not** re-added; they are tracked as Phase 12.

Decisions (locked):
- **Asset:** the Xanadu group mark is an inline SVG component (`components/BrandMark.tsx`) — transparent + scalable, each stroke individually addressable. Used statically in the Hero and Final CTA.
- **Assembly:** `components/BrandMarkAssembly.tsx` is a fixed right-side overlay (centered on mobile). Each subsidiary section's logo (marked `data-assembly-logo="<id>"` on the `<img>` in `SubsidiarySection`) flies into the mark as the user scrolls — the four diagonal-stroke divisions ride `LINE_ENDPOINTS` (`hasLine: true`); Trading/Xw3 (`hasLine: false`) fly straight to their finale hexagon edge (indigo/purple), whose colored edge fades in during the morph.
- **Finale:** at the Final CTA the four colored strokes slide their endpoints into a flat-top six-color hexagon (adding two more colored edges), and the subsidiary logos + gray silhouette fade out.
- **Layering:** z-index updated to `particles(0) → content(5) → BrandMarkAssembly overlay(6) → ContactFlow modal(100)`.

Tasks:
- `[x]` **9.1** `components/BrandMark.tsx` — inline SVG of the group mark; each stroke addressable; scalable.
- `[x]` **9.2** `components/BrandMarkAssembly.tsx` + `brandMarkData.ts` — persistent overlay; `ARMS` array (order matches `LINE_ENDPOINTS`) flies the 4 logos into the mark; finale morph into a six-color hexagon. Driven off `window.scrollY` in a `gsap.ticker` loop (not ScrollTrigger).
- `[x]` **9.3** `SubsidiarySection.tsx` renders the logo `<img>` with `data-assembly-logo={id}` when a `logo` prop is passed (Consulting/Soft/Sports/Ventures at Phase 9; Trading/Xw3 added later).
- `[x]` **9.4** `HeroSection.tsx` + `FinalCTA.tsx` use the inline `<BrandMark>`.
- `[x]` **9.5** Deleted `components/HexagonFormation.tsx` and `LineCanvas.tsx`; removed their renders from `app/page.tsx` (kept `lib/scroll.ts` — still used by `ScrollProgress`).
- `[x]` **9.6** `AGENTS.md` z-index + coupling notes updated to the new motif.

  Open / carried forward:
- `[x]` **Climax CTA + hexagon navigation** — the "Ready to scale? → Contact Us Now" CTA and per-side hover/click nav. Implemented in **Phase 12**.

---

### Phase 9b: Hardening Pass (security, a11y, performance)
Status: **DONE** (a code+security review pass after Phase 9; see `SECURITY.md`)

Security:
- `[x]` **PII history purge** — deleted the 7 `dependabot/*` remote branches that held commit `dbc418a`, so the historical submissions blob is no longer reachable from any live ref.
- `[x]` **Contact API hardening** (`app/api/contact/route.ts`) — fail-closed (500) when `SUBMISSIONS_ENCRYPTION_KEY` is unset in production; reject empty Origin/Referer; require `application/json` Content-Type (415); reject `SUBMISSIONS_FILE_PATH` that resolves inside the repo; pin `runtime = 'nodejs'`.
- `[x]` **Rate-limit hardening** (`lib/rateLimit.ts`) — `X-Real-IP` now gated behind `TRUST_REAL_IP` (was trusted unconditionally).
- `[x]` **Nonce-based CSP** (`middleware.ts`) — per-request nonce + `'strict-dynamic'`; drops `unsafe-inline` for `script-src` in prod. CSP moved out of `next.config.js` (static security headers stay there).
- `[x]` `.env.example` + `AGENTS.md` updated for the prod-encryption requirement + proxy-header flags.

Correctness:
- `[x]` **`BrandMarkAssembly` stale-bounds fix** — recomputes scroll thresholds on `document.fonts.ready`, `window load`, and each section logo's `load`/`error` (it drives off `window.scrollY`, so `ScrollTrigger.refresh` never covered it); re-queries late-mounting logos.

Accessibility (WCAG):
- `[x]` **`prefers-reduced-motion`** — new `lib/useReducedMotion.ts`; applied in SmoothScrollProvider (skip Lenis), ParticleField (static frame), CustomCursor (hide), BrandMark/PartnersSection (drop infinite tweens).
- `[x]` **Progressive enhancement** — `.reveal-item` / `.js-hidden` scoped to `html.js`; pre-paint inline script in `app/layout.tsx` adds the `js` class (no-JS users see content).
- `[x]` **Keyboard-accessible accordions** — Investments / Case Studies converted to `heading > <button>` with `aria-expanded`/`aria-controls` + labelled region panels.
- `[x]` Contact textarea labelled (`aria-label`).

Cleanup:
- `[x]` Removed dead `onContactClick` props (Hero/Investments/CaseStudies) + page.tsx threading; standardized the prop to optional across Consulting/Trading/FinalCTA.
- `[x]` Removed the vestigial `id="scroll-container"` from the privacy page; hardened `metadataBase` with try/catch; cancelled the `fonts.ready` promise on unmount in SmoothScrollProvider.
- `[x]` Tailwind content globs cover `styles/` + `lib/`; `scripts/` no longer ignored by ESLint; `new brand updated/` untracked + gitignored (2.8MB).

---

### Phase 10: Lead Storage Migration — Google Sheets + Resend (replaces the file)
Status: **DONE (code-complete) — SUPERSEDED by Phase 17 (GoDaddy VPS + SMTP), which has shipped in code.** The Sheets + Resend layer was removed when 17 landed; do not invest further in S3.3 live verification for this layer.

**Why:** the site deploys to Vercel (serverless), where the `~/.xanadu-data/contact_submissions.json` file is **ephemeral** — submissions are silently lost across instances/cold starts. Moving to Google Sheets (durable, team-viewable) + Resend (instant team email) fixes correctness and gives the team a real store. Existing validation, rate-limit, CSRF, honeypot, and body-cap stay; **only the persistence layer changed.**

Decisions (locked, all implemented):
- **Deploy target:** Vercel (serverless) → a DB/service is mandatory; the file is a dev-only fallback.
- **Storage:** Google Sheets via the Sheets API + a **service account** (JWT, no user OAuth). Append with `insertDataOption: INSERT_ROWS` so the API allocates rows server-side → concurrent submissions can't collide (replaces the old file-write atomicity concern).
- **Notifications:** Resend sends a formatted HTML email to the team on every submission (`reply_to` = submitter).
- **Prod posture:** fail-closed (HTTP 500) if Sheets/Resend env is misconfigured — mirrors the existing encryption fail-closed pattern.
- **Dev fallback:** if Sheets isn't configured and `NODE_ENV !== 'production'`, fall back to the existing local encrypted-file (zero-setup local dev); Resend is best-effort there.
- **Encryption:** the AES-256-GCM file encryption was for the file; in prod the Sheet is the store (Google encrypts at rest + service-account ACLs). Local dev file fallback keeps optional encryption.

Tasks:
- `[x]` **10.1** `lib/leads/sheets.ts` — service-account auth (`google-auth-library` JWT + direct `sheets.values.append` fetch, lighter than `googleapis`) writing columns: `timestamp, name, email, phone, company, matchedDivision, sessionType, needHelpWith, stage, challenge, consent`. Also exports `deleteLeadsByEmail` for the prod erasure path.
- `[x]` **10.2** `lib/leads/notify.ts` — Resend SDK → formatted HTML email to the team.
- `[x]` **10.3** Refactor `app/api/contact/route.ts` (`storeLead`) — prod: Sheets → Resend, fail-closed (500) if either is misconfigured; a transient email failure after a successful store is logged, not re-thrown (avoids losing the lead / duplicating the Sheet row). Dev: encrypted-file fallback (`lib/leads/file.ts`), email best-effort. `scripts/decrypt-submissions.mjs` retained for the dev fallback.
- `[x]` **10.4** `.env.example` rewritten (Sheets + Resend + Upstash sections); `AGENTS.md` gotcha + `SECURITY.md` updated to the implemented prod/dev split.
- `[~]` **10.5** Verify: `npm run lint` + `npm run build` pass; dev fallback works without Sheets config. **Live submission test (row lands in Sheet + team email arrives) is the only open sub-item — blocked on credentials, tracked as `security_implementation_plan.md` S3.3.**

> **Required inputs (before prod works):** `UPSTASH_REDIS_REST_URL` + `_TOKEN` (shared rate-limit store — `security_implementation_plan.md` S3.1); Google service-account JSON (email + private key) + `GOOGLE_SHEET_ID`; `RESEND_API_KEY` + a **verified sender domain** in Resend (e.g. `noreply@xanadu.com`) + team recipient (e.g. `leads@xanadu.com`). Until set, prod returns 500 (intentional). Testing can use Resend's `onboarding@resend.dev`.

---

### Phase 11: Contact Flow Completion
Status: **DONE**

- `[~]` **11.1** Add **Investments** to `ContactFlow.tsx` ROUTING table + `app/api/contact/route.ts` `KNOWN_DIVISIONS` — **not needed**: the "Investment & Funding" option already routes to **Xanadu Ventures** and `KNOWN_DIVISIONS` covers Ventures, so there is no unreachable Investments path today. Revisit only if a standalone "Xanadu Investments" division is desired.
- `[x]` **11.2** Post-submit **confirmation screen** in `ContactFlow.tsx` (replaces the instant close) — "We've received your request", echoes the routed division + session type, "Done" button.
- `[x]` **11.3** Cal.com/Calendly **booking step** — env-gated behind `NEXT_PUBLIC_CALENDAR_FREE_URL` / `NEXT_PUBLIC_CALENDAR_PAID_URL` (single `NEXT_PUBLIC_CALENDAR_URL` fallback); **skips gracefully to confirmation** when unset. Flow: … → Free/Paid → scheduling embed → confirmation. Documented in `.env.example`.

---

### Phase 12: Interactive Finale Hexagon + Climax CTA
Status: **DONE**

Builds on the existing `BrandMarkAssembly` model — the line journey is **NOT** being rebuilt; the logo-builder model stays (decision: keep current builder model).

- `[x]` **12.1** **Hexagon-as-navigation** — `BrandMarkAssembly.tsx`: each of the 6 finale edges maps to its subsidiary + section id (edge 0→`#consulting`, 1→`#soft`, 2→`#sports`, 3→`#ventures`, 4→`#trading`, 5→`#xw3`, matching `HEXAGON_COLORS`/`ARMS`). Once `eM > 0.85` the edge hit-areas go `pointer-events: stroke` (the rest of the overlay stays `pointer-events-none`). **Hover:** thicken edge + glow + a floating subsidiary label at the edge midpoint (g-space → viewBox → screen mapping). **Click:** `scrollToId(sectionId)`. Reduced-motion: clickable, hover fx suppressed.
- `[x]` **12.2** **"Ready to scale?" climax line** — per design review the in-hexagon "Contact Us Now" button was dropped; the "Ready to scale?" line now leads the FinalCTA's existing "→ Talk to Xanadu" button (replacing the "Build Your System" tagline). `BrandMarkAssembly` keeps only the hexagon-as-navigation, so no `onContactClick` is threaded into it.

---

### Phase 13: Content Depth
Status: **DONE**

- `[x]` **13.1** Investments Case Study — added `caseStudy: { subject, challenge, solution, result }` to each entry in `InvestmentsSection.tsx`; rendered in the expanded panel below services/value (roadmap lines 188-280).
- `[x]` **13.2** Case Studies structure — restored the bulleted layout: converted `challenge/solution/outcome` to string arrays, added the missing **`execution`** sub-section; rendered as bulleted lists in `CaseStudiesSection.tsx` (roadmap lines 339-458).
- `[x]` **13.3** Ventures completeness — `VenturesSection.tsx`: added "Crypto Exchange (Stealth)" + "Local Brands Platform (Stealth)" (badged Stealth); restored the dropped "Why This Matters" lines; fixed "Founder Support & Scaling **Frameworks**".

---

### Phase 14: SEO / Production-Readiness
Status: **DONE**

- `[x]` **14.1** Dynamic **favicon** (`app/icon.tsx`) + **OpenGraph image** (`app/opengraph-image.tsx`) + **Twitter image** (`app/twitter-image.tsx`) via `ImageResponse` (no static assets/fonts needed; shared glyph-free scene in `lib/og-mark.tsx`). `twitter.card` wired in `app/layout.tsx`.
- `[x]` **14.2** `app/sitemap.ts` + `app/robots.ts` (Next conventions, read `NEXT_PUBLIC_SITE_URL` via `lib/site.ts`) — also satisfies the `proxy.ts` matcher references.
- `[x]` **14.3** Mobile **scroll-progress** — `ScrollProgress.tsx` keeps right-side dots on desktop (`lg`), adds a thin gradient top progress bar (scroll %) on mobile/tablet.

---

### Phase 15: Cleanup (dead/stale)
Status: **DONE**

- `[x]` **15.1** `README.md` — removed the `LineJourney.tsx` reference; updated the visual metaphor (BrandMarkAssembly model) and stack (Next 16 / React 19 / Turbopack).
- `[x]` **15.2** Doc accuracy pass across `walkthrough.md`, `.kiro/steering/structure.md`, `.kiro/steering/product.md`, `.kiro/steering/tech.md`, and `SECURITY.md` — rewrote for `BrandMarkAssembly` (deleted `LineCanvas`/`HexagonFormation` refs); corrected the z-index table to `particles(0) → content(5) → BrandMarkAssembly(6) → ContactFlow(100)`; marked the hexagon-navigation as planned (Phase 12); updated stack, storage, and security status to current reality.
- `[x]` **15.3** Delete orphaned `public/logos/xanadu-group.png` (no `.tsx` references it after Phase 9's swap to inline SVG). Done — `walkthrough.md` updated to reflect removal.
- `[x]` **15.4** Remove the dead `lineJitter` keyframes in `styles/globals.css` (left over from the removed line canvas). Already gone (no `lineJitter` rule remains in `globals.css`); only this plan note referenced it.

---

### Phase 16: Authentication & Accounts (Neon Postgres + Drizzle)
Status: **PLANNED** (not yet implemented — env-gated; live testing is credential-blocked, see Required inputs)

**Why:** unlock, from one auth system, (a) a protected team area to view/manage leads + trigger GDPR erasure in-app, (b) client/visitor accounts with a portal, and (c) an optional login gate on contact/booking. This introduces the app's **first database** and **first sessions/cookies**.

**Decisions (locked):**
- **Database:** **Neon Postgres** (serverless, branchable, free tier covers this site easily). Neon's cold-starts only touch the low-traffic auth surfaces (`/login`, `/admin`, `/portal`) — the marketing pages never hit the DB, so there's no UX cost on the main site. (Alternative considered: Turso — more generous free tier, but Postgres is more standard/transferable and richer.)
- **ORM:** **Drizzle** (`drizzle-orm` + `drizzle-kit`), via `@neondatabase/serverless`. SQL-first, light, edge/serverless-friendly.
- **Framework:** **Auth.js v5 (`next-auth`)** with the **Drizzle adapter** — one system, two audiences, role-based.
- **Providers:** **Google OAuth** primary (team *and* visitors) + **email magic link** fallback (reuses the GoDaddy SMTP transport from Phase 17 — no new email vendor; if 16 ships before 17, it reuses Resend instead). **No passwords** → nothing to hash or breach.
- **Roles:** `admin` (team) vs `client` (visitor). Admins granted via an env allowlist (`ADMIN_EMAILS`, comma-separated); the `role` is written to the user row at first sign-in and surfaced on the session. Everyone else is a `client`.
- **Schema** (`lib/db/schema.ts`): the Auth.js tables — `users`, `accounts`, `sessions`, `verificationTokens` — plus a small `audit_log` table for admin actions. Leads are **email-only** under Phase 17 (delivered to the team mailbox, not stored in a DB/Sheet); if a queryable store is later wanted, it can fold into this Postgres.
- **Sessions:** DB-backed sessions via the Drizzle adapter (server-side revocable) — preferred over pure JWT now that a DB exists; Auth.js still sets an `httpOnly` + `Secure` + `SameSite=Lax` cookie.
- **Gating (16.3) is env-gated** (`CONTACT_REQUIRE_AUTH=1`), **off by default** — requiring login on a marketing lead form measurably hurts conversions, so it must be switchable and ships last.

**Tasks (build sequentially — 16.0 is the foundation; 16.1 is highest-value/lowest-risk):**
- `[ ]` **16.0 Foundation** — add deps (`next-auth`, `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`); scaffold `lib/db/schema.ts` (Auth.js tables + `audit_log`) + `lib/db/client.ts`; `lib/auth.ts` (Auth.js config + Drizzle adapter + Google + magic-link providers + `ADMIN_EMAILS` role callback) and a `getSessionRole()` helper for server components / route handlers; wire Auth.js into **`proxy.ts`** (Next 16 renamed `middleware` → `proxy` — **verify Auth.js's `auth()` export works under the new convention**) for route guards; first Drizzle migration; env wiring in `.env.example` (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`/`_SECRET`, `AUTH_TRUST_HOST`, `AUTH_RESEND_*` reuse `RESEND_*`, `ADMIN_EMAILS`, `CONTACT_REQUIRE_AUTH`).
- `[ ]` **16.1 Team/admin dashboard** — `/admin` (admin-only via `getSessionRole()`): an in-app lead list + search/filter + **GDPR erasure** action. **Note:** under Phase 17 leads are email-only (no Sheet), so 16.1 requires first folding leads into this Postgres (or re-introducing a store); the old "read from the Sheet / `deleteLeadsByEmail`" path is removed with `sheets.ts`. Admin actions are written to the `audit_log` table.
- `[ ]` **16.2 Client accounts + portal** — `/login` (Google + magic link) and `/portal` (client-only): shows a visitor their past submissions/bookings (read from the Sheet by email) and any members content. First sign-in creates a `client` row.
- `[ ]` **16.3 Gate contact/booking** — when `CONTACT_REQUIRE_AUTH=1`, `/api/contact` requires a session (else `401`) and the contact modal prompts "Sign in to continue"; the booking embed is shown only to authenticated clients. Off by default.

**Required inputs (provision before live — credential-blocked, like Phase 10):**

> **Don't paste secrets into chat / commit them.** Put them in the gitignored `.env.local`; just confirm when they're set.

| Variable | What | Where to get it | Free? |
|---|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string (`postgres://...`) | [neon.tech](https://neon.tech) → create project → copy connection string | ✅ free tier |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Google Cloud Console → APIs & Services → Credentials → **Create Credentials → OAuth client ID** (type: Web) | ✅ free |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Same screen (shown once) | ✅ free |

- **Google Console — Authorized redirect URI(s)** to whitelist during client creation (and the same origins under *Authorized JavaScript origins*):
  - dev: `http://localhost:3000/api/auth/callback/google`
  - prod: `https://<your-domain>/api/auth/callback/google`
- **Generated / configured at build time (you don't source these):**
  - `AUTH_SECRET` — `openssl rand -base64 32`.
  - `AUTH_TRUST_HOST=true` — required on Vercel.
  - `ADMIN_EMAILS` — just **tell me the team's Gmail addresses** (allowlist → `admin` role; not secret).
  - `CONTACT_REQUIRE_AUTH` — defaults to `0` (off).
- **Already provisioned (Phase 17) — reused for the magic link:** the GoDaddy SMTP transport (`SMTP_HOST`/`_PORT`/`_USER`/`_PASS`/`_FROM`/`_TO`, `lib/leads/mail.ts`) sends the magic-link email. (Phase 10's `RESEND_*` is gone once 17 lands; if you implement 16 before 17, the Resend vars apply instead. Google-only login works without email transport.)

**Security & compliance (do not skip):**
- **CSRF goes live (SECURITY.md T5):** sessions/cookies flip the dormant CSRF risk on. Auth.js covers its own flows; every custom state-changing authenticated endpoint (`/api/admin/*`, `/api/account/*`) gets a **CSRF token** on top of the existing Origin guard + `SameSite` cookies.
- **Rate-limit** the magic-link + login/callback endpoints (reuse the Upstash per-IP limiter, `lib/rateLimit.ts`) to stop link/credential stuffing.
- **Privacy policy** (`app/privacy/page.tsx`) must add an **"Accounts & authentication data"** section: auth PII (name, email, picture from Google) stored in the Postgres `users` table; retention + the right to delete an account (cascading `users`/`accounts`/`sessions` deletion). A matching DB retention + backup policy is needed.
- **Audit log** admin/erasure actions (the new `audit_log` table, mirroring the `scripts/_access-log.mjs` pattern).

**Verification:** `npm run lint` + `npm run build`; `drizzle-kit migrate` applies cleanly; manual — admin can view + erase a lead (and it's audit-logged); client signup → magic-link/Google login → portal round-trip; gating on/off via `CONTACT_REQUIRE_AUTH`; cross-origin POST to a mutating endpoint is rejected (CSRF); the login endpoint is rate-limited; session cookie is `httpOnly`+`Secure`+`SameSite=Lax`.

---

### Phase 17: GoDaddy Migration + GoDaddy SMTP Email (supersedes Phase 10's storage/email layer)
Status: **CODE-COMPLETE incl. deploy scaffold (17.0–17.5); VPS provisioning + live verification remain (manual, credential-blocked).** Deployment: **GoDaddy VPS**; lead delivery: **email-only via GoDaddy SMTP (no Google Sheets)** — the Phase 10 Sheets + Resend layer (`sheets.ts`/`notify.ts`) is removed. See the hardening-audit notes for the post-implementation lead-path hardening pass.

**Why:** the deployment target is changing from Vercel (serverless) to **GoDaddy**, and the team wants contact submissions delivered to a **GoDaddy-hosted mailbox**. Two consequences drive this phase:

1. **Hosting model flips.** GoDaddy is **not serverless** — there is no per-request ephemeral-function platform. The app's live `POST /api/contact` route handler means the site **cannot be statically exported**; it must run as a long-lived Node process (`next start`) behind a reverse proxy + TLS. GoDaddy's economy/shared hosting can't run a Next 16 app reliably (no persistent Node; Phusion Passenger is fragile under Turbopack). The supported target is a **GoDaddy VPS** (Linux, Node 20.9+, nginx, PM2). The VPS has a **persistent filesystem**, so the Phase 10 "ephemeral FS → must use a remote store" assumption no longer holds.
2. **Email via GoDaddy, drop Google Sheets.** GoDaddy provides **no transactional-email API** (no Resend equivalent); "send via GoDaddy" means **SMTP transport** to a GoDaddy mailbox. Per the product decision, leads are **email-only** — Google Sheets storage is removed.

> **Decision (locked):** Phase 10's Sheets + Resend production layer is **superseded**. `resend`, `google-auth-library`, and `lib/leads/sheets.ts` leave the prod path; the durable store becomes the **team's GoDaddy mailbox** (no programmatic queryable store, no automated per-lead erasure — see Compliance below).

Decisions (locked — to be implemented):
- **Deploy target:** GoDaddy VPS (Linux). `next build` → `next start` behind **nginx** (TLS termination + reverse proxy) supervised by **PM2** (auto-restart, logs). **No static export** (`output: export` is incompatible with the `POST` route handler).
- **Email transport:** **Nodemailer** SMTP transport to GoDaddy's outbound mail server (`smtpout.secureserver.net`, TLS, port 465/587). Sender = a GoDaddy mailbox (e.g. `noreply@xanadu.com`); recipient = the team mailbox (e.g. `leads@xanadu.com`); `replyTo` = the submitter. Replaces the Resend SDK in `lib/leads/notify.ts` (→ renamed `lib/leads/mail.ts`).
- **Storage:** **email-only.** No Google Sheets, no DB. The team mailbox is the store. Dev keeps the AES-256-GCM JSONL fallback (`lib/leads/file.ts`) for zero-setup local dev.
- **Prod posture:** **fail-closed (HTTP 500)** if the SMTP env is misconfigured — same invariant as Phase 10, now keyed on `SMTP_*`. Because the email IS the store, an SMTP failure must 500 (so the user can retry) rather than degrade silently. Delivery mode is selected by `LEAD_DELIVERY=smtp|file` (defaulting from `NODE_ENV`), so fail-closed no longer depends on the launcher setting `NODE_ENV=production` correctly (hardening-audit H3).
- **Rate limiting:** on a single long-lived VPS process the **in-memory limiter is correct** (no per-instance split), so **Upstash becomes optional** (keep the env-gated path as hardening + the in-memory as default/fallback). **Critical:** `VERCEL=1` no longer auto-trusts `x-real-ip` (removed as spoofable off-Vercel — hardening-audit H2); `TRUST_REAL_IP=1` is required on **every host, including Vercel**. On the GoDaddy VPS, nginx must inject `x-real-ip` and `TRUST_REAL_IP=1` must be set, or every visitor collapses into one `'unknown'` bucket (5/hr total = broken). Forwarded-IP values are split + validated (hardening-audit L3).
- **Erasure:** with email-only there is **no automated GDPR/PDPL Art. 17 path** (no Sheet/DB to delete from). Erasure = manual deletion of the email from the team mailbox. Accepted trade-off, documented honestly in the privacy policy + `SECURITY.md` (see Compliance below).

Tasks (build sequentially):
- `[~]` **17.0 Deployment scaffold** — **shipped in-repo:** `deploy/ecosystem.config.js` (PM2, single fork instance — load-bearing for the in-memory limiter; `NODE_ENV=production` + `LEAD_DELIVERY=smtp` + `TRUST_REAL_IP=1` baked in, app bound to `127.0.0.1:3000`), `deploy/nginx/xanadu.conf` (TLS via certbot, `X-Real-IP` injection, 16 KB body cap, HTTP→HTTPS), and the `DEPLOY.md` runbook (provision → clone+rsync images → `.env` → build → PM2 → nginx/certbot → verify → ops). **Remaining (manual, credential-blocked):** provision the actual GoDaddy VPS + DNS/TLS and run the DEPLOY.md verification checklist.
- `[x]` **17.1 `lib/leads/mail.ts`** (rename/rewrite of `notify.ts`) — Nodemailer SMTP transport (cached, lazy); `isMailConfigured()`; `sendLeadEmail(lead)` reuses the existing HTML render + escaping, paid/free subject, `replyTo: lead.email`. New env: `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `SMTP_TO`.
- `[x]` **17.2 Move the `Lead` type + retire `sheets.ts`** — the shared `Lead` interface currently lives in `lib/leads/sheets.ts`; extract it to `lib/leads/types.ts` (imported by `mail.ts` + `file.ts` + `route.ts`). Delete `lib/leads/sheets.ts` (and `deleteLeadsByEmail`). Remove `google-auth-library` + `resend` from `package.json`; add `nodemailer` (+ `@types/nodemailer`).
- `[x]` **17.3 Refactor `storeLead` in `app/api/contact/route.ts`** — prod: `sendLeadEmail` only, **fail-closed (500)** if `SMTP_*` misconfigured or the send throws (email is the store → no silent degradation). Delivery mode is now `LEAD_DELIVERY=smtp|file` (defaulting from `NODE_ENV`) — hardening-audit H3. Dev: encrypted-file fallback unchanged.
- `[x]` **17.4 Rate-limit + proxy headers for nginx** — `TRUST_REAL_IP=1` gates `x-real-ip` on every host (the `VERCEL=1` auto-trust was removed — hardening-audit H2); forwarded-IP values are split + validated (hardening-audit L3). Document that Upstash is optional on a single-instance VPS.
- `[x]` **17.5 Docs sync** — done: `.env.example` (SMTP section replaces Sheets/Resend; rate-limit + Sentry + `AUTH_TRUST_HOST` Vercel notes → GoDaddy equivalents; `LEAD_DELIVERY` added); `AGENTS.md` (lead-storage + lead-path gotchas); `SECURITY.md` (decisions, T6/T8, data destination, §7); `security_implementation_plan.md` (S3/S5); `.kiro/steering/{tech,structure}.md`; `walkthrough.md`; `app/privacy/page.tsx` (storage / cross-border / retention for email-only); + `DEPLOY.md` (17.0).

**Required inputs (before prod works — credential-blocked, like Phase 10):**

> **Don't paste secrets into chat / commit them.** Put them in the gitignored `.env` (loaded by the PM2 process); just confirm when they're set.

| Variable | What | Where to get it |
|---|---|---|
| `SMTP_HOST` | GoDaddy outbound mail host | `smtpout.secureserver.net` (GoDaddy mailbox → Server Settings) |
| `SMTP_PORT` | SMTP TLS port | `465` (implicit TLS) or `587` (STARTTLS) |
| `SMTP_USER` | Sending mailbox username | the full GoDaddy mailbox address, e.g. `noreply@xanadu.com` |
| `SMTP_PASS` | Sending mailbox password | GoDaddy mailbox password (app-specific password if available) |
| `SMTP_FROM` | `From:` header | `Xanadu <noreply@xanadu.com>` (must match `SMTP_USER` or GoDaddy rejects it as spoofing) |
| `SMTP_TO` | Team recipient | `leads@xanadu.com` |

- GoDaddy VPS plan + the domain's DNS + TLS cert (Let's Encrypt via nginx, or GoDaddy SSL).
- Optional (hardening only): `UPSTASH_REDIS_REST_URL` + `_TOKEN` — **no longer required** (in-memory limiter is correct on a single VPS) but recommended if you later scale beyond one process.

**Compliance & security (do not skip):**
- **GDPR/PDPL erasure is now manual.** With email-only there is no programmatic store to delete from — a right-to-erasure request means manually deleting the email from the team mailbox. `app/privacy/page.tsx` + `SECURITY.md` must state this honestly; the automated `deleteLeadsByEmail` path is gone with Sheets.
- **No queryable durable store** — the team can't search/filter/export leads programmatically. If that becomes a need, reconsider Sheets or fold leads into Phase 16's Neon Postgres.
- **SMTP credential safety** — `SMTP_PASS` is a server-side secret; never `NEXT_PUBLIC_*`. Nodemailer runs on the Node runtime (already pinned). Keep the existing `sanitizeBody` control-char stripping so the email body stays injection-safe.
- **TLS everywhere** — nginx terminates HTTPS; the SMTP connection uses TLS (`465`/`587`). HSTS header stays.
- **`x-real-ip` trust** — enable `TRUST_REAL_IP` only behind nginx (which sets it platform-side). `TRUST_XFF` no longer exists: `X-Forwarded-For` is ignored entirely (its leftmost hop is client-spoofable even behind a proxy).

**Verification:** `npm run lint` + `npm run build` pass; deploy to the GoDaddy VPS (nginx + PM2); live submission → email arrives in the `SMTP_TO` mailbox (with `replyTo` = submitter); per-IP rate limit behaves with distinct IPs (confirms `TRUST_REAL_IP` + nginx `x-real-ip`); fail-closed 500 when `SMTP_*` is unset; Origin allow-list honors the GoDaddy domain; manual mailbox deletion tested as the erasure path.

---

## Verification Plan

### Automated
- `npm run lint` — `eslint .` via flat config (`eslint.config.mjs` + `eslint-config-next/core-web-vitals`), ESLint 9.
- `npm run build` — **this is the type check** (no separate typecheck script); Next 16 / Turbopack. (`next build` no longer runs ESLint — run `npm run lint` separately.) Passes with no warnings.

### Manual
- Click every subsidiary CTA (Consulting, Soft, Sports, Ventures, Trading, Xw3) and confirm the Contact Flow modal opens.
- Go through the full Contact Flow with mock details, pick Free and then Paid, and confirm a submission is captured. **Dev:** appends to `~/.xanadu-data/contact_submissions.json` (or `$SUBMISSIONS_FILE_PATH`), AES-encrypted — read with `scripts/decrypt-submissions.mjs`. **Prod (Phase 17, current):** sends the team a GoDaddy SMTP email (`SMTP_*`, email-only, no Sheets) — live test = email arrives in the `SMTP_TO` mailbox (with `replyTo` = submitter). Either way the payload carries `sessionType` and the matched division.
- Scroll through the 6 subsidiaries and confirm each logo flies into the right-side `BrandMarkAssembly` mark along its colored line, and at the Final CTA the strokes converge into a six-color hexagon.
- Click the FinalCTA "Talk to Xanadu" CTA (now led by "Ready to scale?"), and (at the finale) the assembled hexagon's per-side nav (Phase 12).

## Recent Fixes
- **Phone validation + country picker (libphonenumber-js):** scrollable country-code picker (245 countries, flag + dial code, name-first so typing a letter jumps to it) + live validity check in `ContactFlow.tsx`; the server validates + canonicalizes to E.164 (`route.ts`), and the team email shows the resolved country (`notify.ts`). Plus: **Sports** added to the contact routing (all 6 divisions now reachable); contact-API input hardening — control-char sanitization, prototype-pollution rejection, log-forging prevention (security plan **S5.5**); and the rate limit kept **per IP (per user)** at 5/hr (a brief site-wide global cap was reverted so legit users never block each other).
- **Phases 11–15 (roadmap completion):** contact confirmation screen + env-gated Cal.com/Calendly booking (11); interactive finale hexagon per-side nav (12); Investments case studies + Case Studies bulleted structure (+ Execution) + Ventures stealth entries & "Why This Matters" (13); dynamic favicon/OG/Twitter images, sitemap/robots, mobile scroll-progress bar (14); orphaned-PNG deletion + `middleware.ts`→`proxy.ts` rename (15).
- **Lead-path hardening (post-review, security plan S5 + the hardening audit):** the Origin guard **fails closed (403) in prod** when the allow-list is unset (was falling back to the client-controlled `Host` header — hardening-audit L2); `x-real-ip` requires `TRUST_REAL_IP=1` on **every host** (the `VERCEL=1` auto-trust was removed as spoofable off-Vercel — hardening-audit H2); forwarded-IP values are split + validated (hardening-audit L3); `LEAD_DELIVERY=smtp|file` decouples fail-closed from `NODE_ENV` (hardening-audit H3); the request body is shape-checked as a non-null object before any property access (hardening-audit H1). (The Phase-10 `appendLead` `valueInputOption=RAW` / `deleteLeadsByEmail` invariants left with `sheets.ts`.)
- **Phase 7:** wired the four remaining subsidiary CTAs; corrected hexagon brand colors; added `.contact-input` styling; fixed the Lenis `gsap.ticker` cleanup; captured Free/Paid session preference; hardened the contact API.
- **Phase 9b (hardening):** see Phase 9b above — PII history purge, contact-API + rate-limit + CSP-nonce hardening, `BrandMarkAssembly` stale-bounds fix, reduced-motion + progressive-enhancement + accordion a11y, and dead-prop cleanup. See `SECURITY.md` §1a for per-item status.
- **Phase 10 (lead storage migration):** see Phase 10 above — contact persistence moved off the ephemeral serverless FS to **Google Sheets (storage) + Resend (email)**, fail-closed if misconfigured, with the local encrypted file as the dev fallback; rate limiting moved to Upstash. Live verification (S3.3) is the only open step.
- **Trading & Web3 logo completion:** all six subsidiaries now fly into the `BrandMarkAssembly` mark. Mark-only logos extracted for Trading/Xw3 (`public/logos/trading.png` / `xw3.png`, white bg removed); `ARMS` expanded to 6 with `hasLine` (Trading/Xw3 fly to their finale hexagon edge). Adopted the logos' brand colors — Trading indigo `#4D7CFF` (chosen over the logo's `#011F7F` for legibility on the dark bg), Xw3 purple `#9344DE` (replacing amber/cyan) — across the hexagon, sections, contact routing, and CSS vars; removed the now-redundant accent-glow silhouette tint.

## Notes
- Contact submissions are **NOT stored in the repo**. **Production (Phase 17, current):** `app/api/contact/route.ts` delivers leads **email-only via GoDaddy SMTP** (`lib/leads/mail.ts`, `SMTP_*`) — fail-closed (HTTP 500) if `SMTP_*` is misconfigured in `smtp` delivery mode (`LEAD_DELIVERY`, defaulting from `NODE_ENV`); no Sheets/DB (the team mailbox is the store; erasure = manual deletion). Hosting is a **GoDaddy VPS** (persistent FS, nginx + PM2). **Development** (`LEAD_DELIVERY=file`): falls back to `~/.xanadu-data/contact_submissions.json` (override with `SUBMISSIONS_FILE_PATH`), AES-256-GCM encrypted via `SUBMISSIONS_ENCRYPTION_KEY`. The old in-repo `data/contact_submissions.json` was removed from `main`, and the historical PII blob (`commit dbc418a`) was made unreachable by deleting the `dependabot/*` branches. See `SECURITY.md` and the hardening audit. Rate limiting uses the **in-memory** limiter (`lib/rateLimit.ts`), correct on the single VPS instance (Upstash optional, env-gated); per-IP keying needs `TRUST_REAL_IP=1` (on every host) + nginx `x-real-ip` on the VPS.
- A previous top-level `app/route.ts` collided with `app/page.tsx` (both resolved to `/`) and broke the build. Do not re-add a root `app/route.ts`.
