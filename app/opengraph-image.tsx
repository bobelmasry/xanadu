import { ImageResponse } from 'next/og'
import { OgScene } from '../lib/og-mark'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Xanadu — the assembled six-color brand hexagon on a light gradient'

export default function OpengraphImage() {
  return new ImageResponse(<OgScene />, { ...size })
}
