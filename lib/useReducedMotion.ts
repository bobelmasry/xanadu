"use client"

import { useEffect, useState } from 'react'

/**
 * Reactive `prefers-reduced-motion` check. Returns `true` when the user has
 * asked the OS to minimize non-essential motion (WCAG 2.3.3). SSR-safe:
 * returns `false` on the server/first render, then corrects after mount.
 *
 * For one-shot mount-time animation setup (GSAP contexts, canvas loops) prefer
 * reading `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
 * directly inside the effect to avoid an initial motion flash; use this hook
 * when a component needs to re-render on the preference changing.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
