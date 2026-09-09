import { ImageResponse } from 'next/og'
import { IconScene } from '../lib/og-mark'

// Node runtime: matches the rest of the app; `next/og` supports it and it keeps
// the dynamic image generator off the Edge runtime.
export const runtime = 'nodejs'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<IconScene />, { ...size })
}
