"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToId } from '../lib/scroll'
import { HOME_JOURNEY } from './homeJourney'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Right-side dot nav ↔ section ids. DERIVED from the home-journey registry
// (components/homeJourney.tsx) — the single ordering source — and exported
// for the coupling-guard test (test/consistency.test.ts).
export const SECTIONS = HOME_JOURNEY.map(({ id, label }) => ({ id, label }))

export default function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      SECTIONS.forEach((section, i) => {
        const dot = containerRef.current!.querySelector(`#dot-${section.id}`)
        if (!dot) return
        const el = document.getElementById(section.id)
        if (!el) return

        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) {
              (dot as HTMLElement).style.background = '#0f172a'
              ;(dot as HTMLElement).style.transform = 'scale(1.5)'
            } else {
              (dot as HTMLElement).style.background = 'rgba(15,23,42,0.2)'
              ;(dot as HTMLElement).style.transform = 'scale(1)'
            }
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Thin top scroll-% bar for mobile/tablet (desktop keeps the right-side
  // dots). Lenis drives the native scroll position, so window.scrollY / the
  // scroll event stay accurate. rAF-throttled; passive listener.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Mobile/tablet top progress bar (scroll %); hidden on desktop */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-900/5 lg:hidden" aria-hidden="true">
        <div
          ref={barRef}
          className="h-full origin-left"
          style={{
            background:
              'linear-gradient(90deg,#28D75A,#4176FA,#FF4E33,#FFD21F,#4D7CFF,#9344DE)',
            transform: 'scaleX(0)',
            willChange: 'transform',
            transition: 'transform 80ms linear',
          }}
        />
      </div>

      {/* Desktop right-side dots */}
      <div
        ref={containerRef}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3"
      >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          aria-label={`Jump to ${section.label}`}
          onClick={() => scrollToId(section.id)}
          title={section.label}
          className="flex h-6 w-6 items-center justify-center rounded-full"
        >
          {/* The 8px dot itself is too small as a touch/click target — the
              button pads it to 24px (WCAG 2.5.8). JS styles the span. */}
          <span
            id={`dot-${section.id}`}
            className="block w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: 'rgba(15,23,42,0.2)' }}
          />
        </button>
      ))}
    </div>
    </>
  )
}
