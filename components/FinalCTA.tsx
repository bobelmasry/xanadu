"use client"

import React, { memo, useRef } from 'react'
import { useRevealOnScroll } from '../lib/useRevealOnScroll'

interface FinalCTAProps {
  onContactClick?: () => void
}

export default memo(function FinalCTA({ onContactClick }: FinalCTAProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, {
    selector: '.cta-reveal',
    duration: 1,
    stagger: 0.15,
    start: 'top 70%',
  })

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative py-32 md:py-44 flex items-center justify-center"
      style={{ minHeight: '80vh' }}
    >
      {/* Background hexagon watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
        <svg viewBox="0 0 500 500" width="600" height="600">
          {Array.from({ length: 6 }, (_, i) => {
            const cx = 250, cy = 250, r = 200
            const v1 = { x: cx + r * Math.cos((Math.PI / 3) * i - Math.PI / 2), y: cy + r * Math.sin((Math.PI / 3) * i - Math.PI / 2) }
            const v2 = { x: cx + r * Math.cos((Math.PI / 3) * ((i + 1) % 6) - Math.PI / 2), y: cy + r * Math.sin((Math.PI / 3) * ((i + 1) % 6) - Math.PI / 2) }
            return <line key={i} x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke="#0f172a" strokeWidth="1" />
          })}
        </svg>
      </div>

      <div className="section-container text-center relative z-10">
        <p className="cta-reveal text-lg sm:text-xl md:text-2xl mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          The difference between slow growth<br />
          and exponential growth<br />
          is not effort.
        </p>

        <h2 className="cta-reveal text-4xl sm:text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          It&apos;s <span className="text-gradient">structure</span>.
        </h2>

        <p className="cta-reveal text-2xl sm:text-3xl font-semibold mb-10" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
          Ready to scale?
        </p>

        <button
          className="cta-reveal group relative px-10 py-4 rounded-xl text-base font-semibold overflow-hidden transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #3D5A80, #34496a)',
            border: '1px solid rgba(61,90,128,0.5)',
            color: '#fff',
          }}
          onClick={onContactClick}
          onMouseEnter={(e) => {
            (e.currentTarget).style.boxShadow = '0 8px 30px rgba(61,90,128,0.35)'
            ;(e.currentTarget).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.boxShadow = 'none'
            ;(e.currentTarget).style.transform = 'translateY(0)'
          }}
        >
          → Talk to Xanadu
        </button>

        {/* Footer — the assembled group mark rides in via the fixed
            BrandMarkAssembly overlay as this section scrolls into view. */}
        <div className="mt-32 pt-8 flex flex-col items-center gap-6" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          {/* Group mark */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative footer brand mark */}
          <img
            src="/logos/group.png"
            alt="Xanadu"
            width={128}
            height={118}
            loading="lazy"
            className="cta-reveal h-10 w-auto opacity-70"
          />
          <p className="cta-reveal text-xs" style={{ color: 'var(--text-muted)' }}>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Xanadu. One continuous system.
          </p>
        </div>
      </div>
    </section>
  )
})
