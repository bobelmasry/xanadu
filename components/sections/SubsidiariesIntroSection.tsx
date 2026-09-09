"use client"

import React, { memo, useRef } from 'react'
import { useRevealOnScroll } from '../../lib/useRevealOnScroll'

/**
 * The "Our Subsidiaries" chapter heading of the home journey — styled like
 * the About section's title so the two chapters read as one system. Sits
 * between the About section and the first subsidiary section (consulting).
 * The six subsidiary sections that follow carry the scroll-driven logo
 * assembly, so this intro stays lightweight (no BrandMarkAssembly layer).
 */
export default memo(function SubsidiariesIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, {
    selector: '.subs-reveal',
    duration: 1,
    stagger: 0.15,
    start: 'top 70%',
  })

  return (
    <section ref={sectionRef} id="our-subsidiaries" className="relative py-20 md:py-28">
      <div className="section-container max-w-3xl mx-auto text-center">
        <p className="subs-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>
          Our Subsidiaries
        </p>

        <h2
          className="subs-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Six specialized companies.{' '}
          <span className="text-gradient">One continuous system.</span>
        </h2>

        <p
          className="subs-reveal text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Each subsidiary operates independently — and each one feeds the
          others. Scroll on: as you pass each company, its line flies in and
          the Xanadu mark assembles.
        </p>
      </div>
    </section>
  )
})
