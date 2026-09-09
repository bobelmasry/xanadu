import type { MetadataRoute } from 'next'
import { siteUrl } from '../lib/site'

// Allow the public pages, keep the lead API out of the index. Satisfies the
// `robots.txt` reference in proxy.ts's matcher and the roadmap Phase 14.2.
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
