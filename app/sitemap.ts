import type { MetadataRoute } from 'next'
import { siteUrl } from '../lib/site'
import { SUBSIDIARY_IDS } from '../lib/subsidiaries'

// All indexable routes: home, the standalone pages, the subsidiaries index,
// and every subsidiary detail page (robots.ts allows everything but /api/).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const lastModified = new Date()
  return [
    { url: base, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/subsidiaries`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...SUBSIDIARY_IDS.map((id) => ({
      url: `${base}/subsidiaries/${id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/investments`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/work`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
