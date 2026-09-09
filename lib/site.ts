/** Canonical site origin, derived from NEXT_PUBLIC_SITE_URL (with the same
 *  `https://xanadu.com` fallback `app/layout.tsx` uses for metadataBase) and
 *  trailing-slash-normalized. Shared by sitemap/robots so there's one place to
 *  change the base URL. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://xanadu.com'
  try {
    return new URL(raw).toString().replace(/\/$/, '')
  } catch {
    return 'https://xanadu.com'
  }
}
