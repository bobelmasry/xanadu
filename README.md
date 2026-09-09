# Xanadu — Interactive Line Journey

Premium single-page storytelling site for Xanadu.

## Visual Metaphor

A persistent group mark sits on the right of the viewport (centered on mobile). As the user scrolls through each subsidiary section, that section's logo **flies into** the mark, progressively assembling the Xanadu group mark — Consulting/Soft/Sports/Ventures ride their colored diagonal line; Trading and Xw3 fly to their finale hexagon edge (indigo/purple). At the finale (`FinalCTA`) the colored strokes slide their endpoints into a six-color flat-top hexagon, and each side becomes hover/click navigation back to its subsidiary. The "Ready to scale?" line leads the "→ Talk to Xanadu" CTA.

## Tech Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS 3
- GSAP + ScrollTrigger
- Lenis (smooth scrolling)
- libphonenumber-js (phone validation + country detection)

## Local Setup

Requirements: Node.js 20.9+ (matches the `engines` field in `package.json`).

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

Tests (Vitest — logic/server tests in Node, component tests in jsdom):

```bash
npm test            # run the suite once
npm run test:watch  # watch mode
npm run test:coverage
```

Lint:

```bash
npm run lint
```

Notes:
- See `AGENTS.md` for the authoritative architecture, commands, and load-bearing conventions (z-index layering, the `BrandMarkAssembly` ↔ `data-assembly-logo` coupling, contact-submission storage).
- If you plan to use GSAP Club plugins (MorphSVG / DrawSVG), keep sensitive tokens out of source control — add them to an `.env` or an `.npmrc` and ensure `.npmrc` is ignored.
