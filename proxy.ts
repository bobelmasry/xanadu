import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Per-request Content-Security-Policy with a fresh nonce.
 *
 * Production: `script-src 'self' 'nonce-<nonce>' 'strict-dynamic'` — no
 * 'unsafe-inline'. The CSP is set on BOTH the request headers and the
 * response: Next.js extracts the nonce from the *request's*
 * `content-security-policy` header (getScriptNonceFromHeader) to stamp it
 * onto the framework bootstrap/hydration scripts it injects. Setting it on
 * the response only would leave those scripts nonce-less, and with
 * 'strict-dynamic' active ('self' is ignored) every framework script would
 * be blocked in production — the page renders but is fully non-interactive.
 *
 * Development: no CSP is emitted. HMR / react-refresh and some libs (GSAP)
 * rely on eval + websockets, which a strict CSP would block and break the dev
 * server.
 */
/** Resolve every distinct calendar host so they can all be allow-listed in
 *  `frame-src`. Without it a booking `<iframe>` whose host differs from the
 *  first parseable URL (e.g. free on cal.com, paid on calendly.com) is
 *  blocked by `default-src 'self'` and renders blank in production. */
function calendarHosts(): string[] {
  const urls = [
    process.env.NEXT_PUBLIC_CALENDAR_URL,
    process.env.NEXT_PUBLIC_CALENDAR_FREE_URL,
    process.env.NEXT_PUBLIC_CALENDAR_PAID_URL,
  ].filter((u): u is string => Boolean(u))
  const hosts = new Set<string>()
  for (const raw of urls) {
    try {
      const h = new URL(raw).host
      if (h) hosts.add(h)
    } catch { /* ignore malformed values */ }
  }
  return [...hosts]
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isProd = process.env.NODE_ENV === 'production'

  // Hand the nonce to the Server Component layer so it can be attached to our
  // own inline scripts (and so Next.js stamps it onto its injected scripts).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  let csp: string | null = null
  if (isProd) {
    const frameSources = ["'self'", ...calendarHosts().map((h) => `https://${h}`)]
    csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      `frame-src ${frameSources.join(' ')}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')

    // Mirror the CSP onto the request so Next.js picks up the nonce for the
    // scripts it injects (see the docblock above).
    requestHeaders.set('content-security-policy', csp)
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  if (csp) {
    response.headers.set('Content-Security-Policy', csp)
  }

  return response
}

export const config = {
  // Run on every navigable route but skip static assets / public files so the
  // nonce/CSP overhead doesn't apply to them.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos|robots.txt|sitemap.xml|api).*)',
  ],
}
