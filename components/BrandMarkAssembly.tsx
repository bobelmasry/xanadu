"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../lib/useReducedMotion'

// Tunable layout constants --------------------------------------------------
const MARK_SIZE_DESKTOP = 0.32 // mark box = MARK_SIZE_DESKTOP * min(vw, vh)
const MARK_SIZE_MOBILE = 0.26 // corner-pinned on phones (was 0.30 centered)
// Opacity of the faint "empty" silhouette the colored lines assemble onto.
const SILHOUETTE_OPACITY = 0.14

// SVG coordinate space + the <g> Y offset the mark is drawn under (see the
// <svg viewBox> / <g transform> in the JSX).
const VIEWBOX = 1667
const GROUP_DY = -291.5

// Placement rect (g-space) shared by every mark layer image. Stacking the
// layers at this exact rect reproduces `/logos/group.png` pixel-for-pixel.
const MARK_RECT = { x: 247.4, y: 602.3, w: 1195.2, h: 1175 }

// Mark center (g-space, same frame as the holding logo SVG) — the pivot the
// flying layers scale/rotate around.
const HEX_CENTER = { x: 844, y: 1189 }

/**
 * The six mark layers, in scroll order. Each is a full-canvas PNG slice of the
 * group logo (`/logos/parts/<id>.png`), so at their shared rest rect they stack
 * back into the exact mark. `kind` tweaks the motion: the four arms slide in
 * from the subsidiary side; the two dots pop in with a bounce.
 */
interface Layer {
  id: string
  kind: 'arm' | 'dot'
}
// Exported for the coupling-guard test (test/section-coupling.test.ts): the
// layer list must stay in `lib/subsidiaries.ts` order (edge i ↔ arm i ↔
// section id).
export const LAYERS: Layer[] = [
  { id: 'consulting', kind: 'arm' },
  { id: 'soft', kind: 'arm' },
  { id: 'sports', kind: 'arm' },
  { id: 'ventures', kind: 'arm' },
  { id: 'trading', kind: 'dot' },
  { id: 'xw3', kind: 'dot' },
]

// Fly-in emitter offsets (g-space viewBox units). The line starts translated
// toward the subsidiary content (left) + shrunk, then travels home to identity
// (x=y=0, scale=1, rot=0) — the rest state where the layers stack into the logo.
const ARM_EMIT = { dx: -520, dy: 90, scale: 0.62, rot: -6 }
const DOT_EMIT = { dx: -300, dy: 60, scale: 0.2, rot: 0 }

const clamp = (t: number) => Math.max(0, Math.min(1, t))
const smooth = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}
// Slight overshoot for the dots so they "pop" into place.
const backOut = (t: number) => {
  const x = clamp(t)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export default function BrandMarkAssembly() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(SVGGElement | null)[]>([])
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const overlay = overlayRef.current
    const mark = markRef.current
    if (!overlay || !mark) return

    const baseImg = overlay.querySelector<SVGImageElement>('#assembly-silhouette')
    const coreImg = overlay.querySelector<SVGImageElement>('#assembly-core')
    const layerEls = layerRefs.current
    const ease = prefersReduced ? clamp : smooth

    // Per-property quickSetters, built once: update() runs on every ticker
    // frame while scrolling (~60/s) and each gsap.set call allocates + parses
    // a full vars object; quickSetter writes directly to GSAP's transform
    // cache (same rendering path, zero per-frame allocation). The silhouette
    // opacity is constant (pinned by the JSX inline style) so it needs no
    // setter at all.
    const setOverlayOpacity = gsap.quickSetter(overlay, 'opacity')
    const setCoreOpacity = coreImg ? gsap.quickSetter(coreImg, 'opacity') : null
    const layerSetters = layerEls.map((g) =>
      g
        ? {
            x: gsap.quickSetter(g, 'x', 'px'),
            y: gsap.quickSetter(g, 'y', 'px'),
            sx: gsap.quickSetter(g, 'scaleX'),
            sy: gsap.quickSetter(g, 'scaleY'),
            rot: gsap.quickSetter(g, 'rotation', 'deg'),
            op: gsap.quickSetter(g, 'opacity'),
          }
        : null
    )

    const markRect = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isDesktop = vw >= 768
      if (isDesktop) {
        const base = MARK_SIZE_DESKTOP * Math.min(vw, vh)
        const size = Math.min(base, vw * 0.28)
        return { x: vw - size - vw * 0.05, y: (vh - size) / 2, w: size, h: size }
      }
      // Mobile: pin to the bottom-right corner instead of dead-center — the
      // centered mark used to float on top of the (centered) subsidiary copy.
      // Keep it clear of the scroll progress bar (top) and edge gestures.
      const size = MARK_SIZE_MOBILE * Math.min(vw, vh)
      const margin = Math.max(12, vw * 0.04)
      return { x: vw - size - margin, y: vh - size - margin, w: size, h: size }
    }

    const positionMark = () => {
      const r = markRect()
      gsap.set(mark, { left: r.x, top: r.y, width: r.w, height: r.h })
    }

    let heroStart = 0
    let heroEnd = 0
    let geometryReady = false
    const bands: { start: number; end: number }[] = LAYERS.map(() => ({ start: 0, end: 0 }))

    const refresh = () => {
      const vh = window.innerHeight
      const scrollY = window.scrollY
      const hero = document.getElementById('hero')
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom + scrollY
        heroStart = heroBottom - vh * 0.8
        heroEnd = heroBottom - vh * 0.3
      }
      LAYERS.forEach((layer, i) => {
        const el = document.getElementById(layer.id)
        if (!el) return
        const top = el.getBoundingClientRect().top + scrollY
        bands[i].start = top - vh * 0.92
        bands[i].end = top - vh * 0.52
      })

      // FIX: Use `transformOrigin` with local coordinates instead of `svgOrigin`.
      // GSAP's `svgOrigin` feature computes an offset matrix relative to the global
      // SVG canvas, but it struggles to account correctly for the parent group's
      // `<g transform="translate(...)">`, causing the layers to receive spurious
      // offsets during flight and converge on the wrong spot.
      // Since the layer `<g>` elements have no transform of their own, their
      // local coordinate space perfectly matches the parent's space. We can
      // use standard `transformOrigin` in local pixels to reliably pivot around
      // the true center of the X without global-to-local matrix bugs.
      layerEls.forEach((g) => {
        if (g) {
          gsap.set(g, { transformOrigin: `${HEX_CENTER.x}px ${HEX_CENTER.y}px` })
        }
      })

      // Band/hero geometry changed → transforms may differ even at the same
      // scroll offset (e.g. fonts ready shifting layout), so force the next
      // update() to run instead of early-exiting.
      lastScroll = -1
      lastVw = -1
      geometryReady = true
    }

    // Idle early-exit memo: the ticker fires ~60×/s for the whole session.
    // When neither the scroll offset nor the viewport width changed since the
    // last applied frame, skip the 8+ gsap.set calls — the overlay is
    // visually static (idle at the top or fully assembled at the end) most
    // of the time.
    let lastScroll = -1
    let lastVw = -1

    // The 8 full-canvas PNG slices (~101 KB, ~62 MB decoded GPU memory at
    // 1452×1338) are only needed once the overlay leaves the hero. Defer
    // attaching their hrefs until the first frame that could show them —
    // before that the overlay sits at opacity 0 and the bytes/GPU memory
    // would sit idle. (Refreshed below once activated.)
    let imagesActivated = false
    const activateImages = () => {
      if (imagesActivated) return
      imagesActivated = true
      baseImg?.setAttribute('href', '/logos/parts/base.png')
      coreImg?.setAttribute('href', '/logos/parts/core.png')
      layerEls.forEach((g, i) => {
        g?.querySelector('image')?.setAttribute('href', `/logos/parts/${LAYERS[i].id}.png`)
      })
    }

    const update = () => {
      const scrollY = window.scrollY
      const vw = window.innerWidth
      if (scrollY === lastScroll && vw === lastVw) return
      lastScroll = scrollY
      lastVw = vw

      // Half a viewport before the first band can paint, start fetching the
      // slices so they're decoded by the time the overlay fades in. Gated on
      // geometryReady — heroStart is 0 until the first refresh() computes it,
      // which would otherwise satisfy the check at the page top.
      if (geometryReady && !imagesActivated && scrollY >= heroStart - window.innerHeight) activateImages()

      const maxOp = vw >= 768 ? 1 : 0.6
      const op = ease(clamp((scrollY - heroStart) / (heroEnd - heroStart || 1))) * maxOp
      setOverlayOpacity(op)

      let coreProgress = 0
      LAYERS.forEach((layer, i) => {
        const set = layerSetters[i]
        if (!set) return
        const b = bands[i]
        const p = clamp((scrollY - b.start) / (b.end - b.start || 1))
        const emit = layer.kind === 'dot' ? DOT_EMIT : ARM_EMIT
        const q = prefersReduced ? clamp(p) : layer.kind === 'dot' ? backOut(p) : smooth(p)
        const inv = 1 - q
        if (i === 0) coreProgress = clamp(p)

        set.op(prefersReduced ? clamp(p) : clamp(p * 1.3))
        if (prefersReduced) {
          set.x(0); set.y(0); set.sx(1); set.sy(1); set.rot(0)
        } else {
          // Note: svgOrigin is intentionally omitted here to prevent matrix drift.
          // Uniform scaleX/scaleY (not the earlier anisotropic line-stretch) —
          // the dot glyphs aren't drawn at the shared HEX_CENTER pivot, so
          // scaling them unevenly around that distant origin flung them off
          // to the side instead of settling into the mark. Reverted to the
          // same safe transform the arm layers use; only the easing curve
          // (`q`, bouncy for dots vs smooth for arms) differs by kind.
          set.x(emit.dx * inv)
          set.y(emit.dy * inv)
          set.sx(emit.scale + (1 - emit.scale) * q)
          set.sy(emit.scale + (1 - emit.scale) * q)
          set.rot(emit.rot * inv)
        }
      })
      if (setCoreOpacity) setCoreOpacity(prefersReduced ? coreProgress : smooth(coreProgress))
    }

    const recompute = () => {
      positionMark()
      refresh()
      update()
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(recompute, 150)
    }

    let onScroll: (() => void) | undefined
    if (prefersReduced) {
      onScroll = () => update()
      window.addEventListener('scroll', onScroll, { passive: true })
    } else {
      gsap.ticker.add(update)
    }
    window.addEventListener('resize', onResize)

    let cancelled = false
    const onFontsReady = () => {
      if (!cancelled) recompute()
    }
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onFontsReady, () => {})
    }

    window.addEventListener('load', recompute)
    if (document.readyState === 'complete') recompute()

    const boot = window.setTimeout(recompute, 150)

    return () => {
      cancelled = true
      window.clearTimeout(boot)
      clearTimeout(resizeTimer)
      if (onScroll) window.removeEventListener('scroll', onScroll)
      else gsap.ticker.remove(update)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('load', recompute)
      gsap.set(overlay, { opacity: 0 })
    }
  }, [prefersReduced])

  return (
    <div ref={overlayRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 6, opacity: 0 }}>
      {/* Persistent group mark (right side on desktop, centered on mobile) */}
      <div ref={markRef} style={{ position: 'fixed' }}>
        <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <g transform={`translate(0 ${GROUP_DY})`}>
            {/* Faint silhouette the colored lines assemble onto. href is
                attached lazily by activateImages() — see the update loop. */}
            <image
              id="assembly-silhouette"
              x={MARK_RECT.x}
              y={MARK_RECT.y}
              width={MARK_RECT.w}
              height={MARK_RECT.h}
              style={{ opacity: SILHOUETTE_OPACITY }}
            />
            {/* Per-subsidiary colored lines that fly in as you scroll. */}
            {LAYERS.map((layer, i) => (
              <g
                key={layer.id}
                data-layer={layer.id}
                ref={(el) => { layerRefs.current[i] = el }}
                style={{ opacity: 0 }}
              >
                <image
                  x={MARK_RECT.x}
                  y={MARK_RECT.y}
                  width={MARK_RECT.w}
                  height={MARK_RECT.h}
                />
              </g>
            ))}
            {/* Dark center overlap where the arms cross (revealed with the arms). */}
            <image
              id="assembly-core"
              x={MARK_RECT.x}
              y={MARK_RECT.y}
              width={MARK_RECT.w}
              height={MARK_RECT.h}
              style={{ opacity: 0 }}
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
