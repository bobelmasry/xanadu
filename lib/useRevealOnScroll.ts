import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * The shared scroll-reveal used across every section: elements matching
 * `selector` start translated down + transparent, then stagger in when the
 * section enters the viewport (reverse on scroll-back).
 *
 * One hook instead of six copy-pasted `gsap.fromTo` blocks — the timing
 * knobs (distance/duration/stagger/start) stay per-section, while the
 * reduced-motion handling (instant instead of animated), gsap.context
 * scoping and cleanup (reactStrictMode double-run safe) live here once.
 *
 * Scoped like the originals: `gsap.context(..., sectionRef)` so `ctx.revert()`
 * restores exactly this section's elements.
 */
export interface RevealOptions {
  /** Element selector to reveal (defaults to '.reveal-item'). */
  selector?: string
  /** Travel distance in px (0 for reduced-motion users). */
  y?: number
  /** Per-element duration in s (0.001 for reduced-motion users). */
  duration?: number
  /** Per-element stagger in s (0 for reduced-motion users). */
  stagger?: number
  /** ScrollTrigger start (default 'top 75%'). */
  start?: string
  /** Optional ScrollTrigger end (used by SubsidiarySection for scrubbed range). */
  end?: string
}

export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  {
    selector = '.reveal-item',
    y = 40,
    duration = 0.8,
    stagger = 0.1,
    start = 'top 75%',
    end,
  }: RevealOptions = {}
) {
  useEffect(() => {
    const section = ref.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const elements = section.querySelectorAll(selector)
      gsap.fromTo(
        elements,
        { y: prefersReduced ? 0 : y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: prefersReduced ? 0.001 : duration,
          stagger: prefersReduced ? 0 : stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start,
            ...(end ? { end } : {}),
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [ref, selector, y, duration, stagger, start, end])
}
