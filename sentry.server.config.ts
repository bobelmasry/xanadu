import * as Sentry from '@sentry/nextjs'

/**
 * Server-side (Node runtime) Sentry init.
 *
 * Intentionally server-only:
 *  - Captures API route + server-component errors (incl. contact-API 500s)
 *    with ZERO client-bundle cost.
 *  - No client SDK → no browser CSP / connect-src change needed.
 *  - `SENTRY_DSN` is a runtime (non-NEXT_PUBLIC) env var, so it can be set on
 *    Vercel without a rebuild.
 *
 * No-op until SENTRY_DSN is set, so the app builds and runs identically with or
 * without monitoring configured. Client-side capture + source-map upload can be
 * added later via the full @sentry/nextjs wizard (withSentryConfig) if needed.
 */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // Performance tracing off by default for a low-traffic marketing site;
    // set SENTRY_TRACES_SAMPLE_RATE (0–1) to opt in.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    sendDefaultPii: false,
  })
}
