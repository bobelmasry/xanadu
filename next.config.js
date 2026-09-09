/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Explicitly lock the default so browser source maps (which expose original
  // source/function names) never ship to clients.
  productionBrowserSourceMaps: false,
  async headers() {
    // CSP is set per-request (with a nonce) in proxy.ts so that
    // 'unsafe-inline' can be dropped from script-src in production. These
    // static security headers apply to every response.
    const headers = [
      // HSTS: `preload` intentionally omitted — only add it once enrolled at
      // hstspreload.org AND every subdomain serves HTTPS (preloading is hard
      // to reverse). See security_implementation_plan.md S2.5.
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'DENY' },
      // Process isolation (cross-origin documents can't reference this window)
      // and cross-origin resource loading restriction. COEP is intentionally
      // omitted — it would block the cross-origin assets/fonts the site uses.
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ]

    return [{ source: '/:path*', headers }]
  },
  async redirects() {
    return [
      // "Our Portfolio" was renamed "Our Work" and moved to /work; the founder
      // page was folded into /about. Keep old links working (301 for SEO).
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/founder', destination: '/about', permanent: true },
    ]
  },
}

module.exports = nextConfig
