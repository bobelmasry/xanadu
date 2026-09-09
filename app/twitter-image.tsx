import { ImageResponse } from 'next/og'
import { OgScene } from '../lib/og-mark'

// Same scene as opengraph-image.tsx (summary_large_image); kept as a distinct
// file convention so Next emits an explicit twitter:image meta tag.
export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Xanadu — the assembled six-color brand hexagon on a light gradient'

export default function TwitterImage() {
  return new ImageResponse(<OgScene />, { ...size })
}
