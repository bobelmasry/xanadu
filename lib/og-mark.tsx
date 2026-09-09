import React from 'react'
import { HEXAGON_COLORS } from '../components/brandMarkData'

/**
 * Brand-mark geometry for the dynamically generated OG/Twitter/favicon images
 * (`app/icon.tsx`, `app/opengraph-image.tsx`, `app/twitter-image.tsx`) via
 * `next/og` (Satori). Reuses the canonical subsidiary colors so the generated
 * images stay in sync with the live `BrandMarkAssembly` finale hexagon.
 *
 * Satori has no DOM and needs a real font for ANY text, so these scenes are
 * deliberately glyph-free (the title/description travel via `metadata`); they
 * render only the assembled six-color hexagon — the site's core motif.
 */

/** Flat-top regular-hexagon vertices around (cx, cy). Angles 0,60,…,300 give
 *  flat top & bottom edges (matches the finale hexagon orientation). */
function hexVerts(cx: number, cy: number, r: number) {
  return [0, 60, 120, 180, 240, 300].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  })
}

/** The 6 colored edges (one per subsidiary) as `<path d>` strings + colors. */
function hexPaths(cx: number, cy: number, r: number) {
  const v = hexVerts(cx, cy, r)
  return HEXAGON_COLORS.map((color, i) => {
    const a = v[i]
    const b = v[(i + 1) % v.length]
    return { d: `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`, color }
  })
}

/** The six-color flat-top Xanadu hexagon (the assembled brand mark). */
export function BrandHexagon({
  r = 160,
  stroke = 18,
  pad = 70,
  px = 460,
}: {
  r?: number
  stroke?: number
  pad?: number
  px?: number
}) {
  const edges = hexPaths(0, 0, r)
  const ext = r + pad
  const viewBox = `${-ext} ${-ext} ${2 * ext} ${2 * ext}`
  return (
    <svg width={px} height={px} viewBox={viewBox}>
      {edges.map((e, i) => (
        <path key={i} d={e.d} stroke={e.color} strokeWidth={stroke} strokeLinecap="round" fill="none" />
      ))}
    </svg>
  )
}

/** The 1200×630 social scene: light gradient + a centered hexagon. */
export function OgScene() {
  const backdrop = hexPaths(0, 0, 300)
  const glow = hexPaths(0, 0, 160)
  const main = hexPaths(0, 0, 160)
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#ffffff 0%,#f6f8fa 55%,#eef2f7 100%)',
      }}
    >
      <svg width="480" height="480" viewBox="-340 -340 680 680">
        <circle cx="0" cy="0" r="220" fill="#3D5A80" opacity="0.06" />
        {backdrop.map((e, i) => (
          <path key={`b${i}`} d={e.d} stroke="#3D5A80" strokeWidth="3" fill="none" opacity="0.1" />
        ))}
        {glow.map((e, i) => (
          <path key={`g${i}`} d={e.d} stroke={e.color} strokeWidth="34" fill="none" opacity="0.18" />
        ))}
        {main.map((e, i) => (
          <path key={`m${i}`} d={e.d} stroke={e.color} strokeWidth="18" strokeLinecap="round" fill="none" />
        ))}
      </svg>
    </div>
  )
}

/** The 32×32 favicon scene: light bg + the colored hexagon. */
export function IconScene() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <BrandHexagon r={78} stroke={26} pad={22} px={32} />
    </div>
  )
}
