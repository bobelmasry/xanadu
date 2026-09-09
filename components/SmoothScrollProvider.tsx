"use client"

import React, { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenis } from '../lib/scroll'
import { useReducedMotion } from '../lib/useReducedMotion'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  // Reactive prefers-reduced-motion: toggling the OS preference re-runs the
  // effect below (it's a dep) so Lenis is created/destroyed without a reload.
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    // Respect prefers-reduced-motion: skip the smooth-scroll interpolation
    // (a continuous motion that some users find uncomfortable) and let the
    // browser do native scrolling. ScrollTrigger keeps working with the
    // default window scroller; getLenis() returns null and the consumers
    // (scrollToId / setScrollLock) degrade gracefully to native behavior.
    if (prefersReduced) {
      let cancelled = false
      const refresh = () => {
        if (!cancelled) ScrollTrigger.refresh()
      }
      window.addEventListener('load', refresh)
      // `load` fires only once. If it already fired before this mounted (HMR,
      // StrictMode 2nd run on a slow connection, lazy mount), refresh now so
      // late-arriving images/fonts still recompute trigger positions.
      if (document.readyState === 'complete') refresh()
      const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts
      fonts?.ready?.then(refresh, () => {})
      return () => {
        cancelled = true
        window.removeEventListener('load', refresh)
      }
    }

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Recalculate trigger positions once fonts/images have settled so the
    // scroll-anchored animations don't fire at the wrong offsets.
    let cancelled = false
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh()
    }
    window.addEventListener('load', refresh)
    // `load` fires only once. If it already fired before this mounted, refresh
    // now so late images/fonts recompute trigger positions (see note above).
    if (document.readyState === 'complete') refresh()
    const fontsReady = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts
    fontsReady?.ready?.then(refresh, () => {})

    return () => {
      cancelled = true
      window.removeEventListener('load', refresh)
      setLenis(null)
      lenis.destroy()
      gsap.ticker.remove(tick)
      // Restore GSAP's default lag smoothing (500ms) — lagSmoothing(0) above
      // is global state, so restore it on teardown to avoid leaking it.
      gsap.ticker.lagSmoothing(500)
    }
  }, [prefersReduced])

  return <>{children}</>
}
