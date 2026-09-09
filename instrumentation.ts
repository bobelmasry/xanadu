/**
 * Next.js instrumentation hook — runs once when a server/edge runtime starts.
 * Loads the matching Sentry config so server + proxy errors are captured
 * when SENTRY_DSN is configured (no-op otherwise). See sentry.{server,edge}.config.ts.
 *
 * The Sentry config is imported ONLY when SENTRY_DSN is set. @sentry/nextjs pulls
 * in an orchestrion webpack bundler plugin (@sentry/server-utils →
 * @apm-js-collab/code-transformer-bundler-plugins/core) that Turbopack cannot
 * resolve; loading it unconditionally broke dev/build. Guarding the import keeps
 * the build identical with or without monitoring configured (the documented intent).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    await import('./sentry.server.config')
  }
}
