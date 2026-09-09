# Xanadu — Interactive Line Journey

Premium single-page storytelling site for Xanadu.

## Visual Metaphor

The homepage presents Xanadu's holding mark, subsidiary sections, portfolio, network, and contact journey. The "Ready to scale?" line leads the "→ Talk to Xanadu" CTA.

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
- If you plan to use GSAP Club plugins (MorphSVG / DrawSVG), keep sensitive tokens out of source control — add them to an `.env` or an `.npmrc` and ensure `.npmrc` is ignored.
