"use client"

import React, { memo, useRef } from 'react'
import { useRevealOnScroll } from '../../lib/useRevealOnScroll'

export default memo(function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, {
    selector: '.about-reveal',
    duration: 1,
    stagger: 0.15,
    start: 'top 70%',
  })

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-32 md:py-44"
    >
      <div className="section-container max-w-3xl mx-auto text-center">
        <p className="about-reveal text-sm uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--text-muted)' }}>
          About Xanadu
        </p>

        <h2
          className="about-reveal text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Global vision,{' '}
          <span className="text-gradient">local execution.</span>
        </h2>

        <p className="about-reveal text-lg leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          A multi-disciplinary business group founded and led by Hessain Al Menawy,
          continuing a legacy of entrepreneurship and innovation in the MENA region —
          building and scaling businesses across emerging sectors through a business
          development lens.
        </p>

        <p className="about-reveal text-base leading-relaxed mb-12" style={{ color: 'var(--text-muted)' }}>
          We bring international thinking and digital-first strategies to local
          opportunities, operating at the intersection of traditional industries and
          digital transformation — with offices across Egypt, Oman, and Mauritius.
        </p>

        {/* Regional impact — from the group profile */}
        <div className="about-reveal grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { value: '15+ Years', label: 'Trusted expertise in MENA' },
            { value: '1,000+ Projects', label: 'Excellence across industries' },
            { value: '3 Countries', label: 'Egypt, Oman, Mauritius' },
          ].map((stat) => (
            <div key={stat.value} className="glass-card p-5">
              <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
