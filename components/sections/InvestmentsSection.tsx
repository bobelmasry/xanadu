"use client"

import React, { memo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INVESTMENTS } from '../../lib/investments'
import { useRevealOnScroll } from '../../lib/useRevealOnScroll'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const GOLD = '#D9B00D'

interface Props {
  /**
   * 'summary' (default) — home-page teaser: heading + intro + one-line-per-
   * company cards + a "Learn more" link to /investments. The services/value/
   * case-study detail lives on the detail page.
   * 'full' — /investments page: the expandable cards with full detail.
   */
  variant?: 'summary' | 'full'
}

export default memo(function InvestmentsSection({ variant = 'summary' }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useRevealOnScroll(sectionRef, { selector: '.inv-reveal', stagger: 0.08 })

  // Expanding/collapsing a panel changes the document height. ScrollTrigger only
  // recomputes trigger offsets on resize/load/explicit refresh, so without this
  // every section below (Case Studies, Final CTA…), the ScrollProgress dots, and
  // the BrandMarkAssembly morph thresholds would desync until the next resize.
  useEffect(() => {
    if (variant !== 'full') return
    ScrollTrigger.refresh()
  }, [expanded, variant])

  return (
    <section ref={sectionRef} id="investments" className="py-32 md:py-44">
      <div className="section-container">
        <p className="inv-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>Investments</p>
        <h2 className="inv-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          We don&apos;t just support growth. We invest in it.
        </h2>
        <p className="inv-reveal text-lg mb-12" style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>
          Through strategic ownership and ecosystem building, Xanadu invests in companies that shape markets and create long-term value across MENA.
        </p>

        {variant === 'full' ? (
          /* ── Full detail (detail page): expandable cards ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INVESTMENTS.map((inv, i) => (
              <div
                key={inv.name}
                className="inv-reveal glass-card p-6 transition-all duration-400"
                style={{
                  borderColor: expanded === i ? `${GOLD}55` : undefined,
                  boxShadow: expanded === i ? `0 0 30px ${GOLD}15` : undefined,
                }}
              >
                <h3 className="m-0 mb-2">
                  <button
                    type="button"
                    aria-expanded={expanded === i}
                    aria-controls={`inv-panel-${i}`}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full text-left cursor-pointer text-lg font-semibold"
                    style={{ color: GOLD }}
                  >
                    ✧ {inv.name}
                  </button>
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p>
                {expanded === i && (
                  <div
                    id={`inv-panel-${i}`}
                    role="region"
                    aria-label={`${inv.name} details`}
                    className="mt-3 pt-3"
                    style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {inv.services.map((s, j) => (
                        <span key={j} className="text-xs px-2 py-1 rounded-full" style={{ background: `${GOLD}15`, color: GOLD }}>{s}</span>
                      ))}
                    </div>
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{inv.value}</p>
                    {inv.caseStudy && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: GOLD }}>Case Study</p>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Subject: </span>{inv.caseStudy.subject}
                        </p>
                        <div className="grid gap-1.5">
                          <p className="text-xs m-0" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Challenge: </span>{inv.caseStudy.challenge}
                          </p>
                          <p className="text-xs m-0" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Solution: </span>{inv.caseStudy.solution}
                          </p>
                          <p className="text-xs m-0" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Result: </span>{inv.caseStudy.result}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* ── Summary (home): one line per company + learn-more link ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {INVESTMENTS.map((inv) => (
              <div key={inv.name} className="inv-reveal glass-card p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: GOLD }}>✧ {inv.name}</h3>
                <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>{inv.overview}</p>
              </div>
            ))}
          </div>
        )}

        {variant === 'summary' && (
          <Link
            href="/investments"
            aria-label="Learn more about Xanadu investments"
            className="inv-reveal group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: `${GOLD}15`,
              border: `1px solid ${GOLD}40`,
              color: GOLD,
              fontFamily: 'var(--font-heading)',
              boxShadow: `0 0 30px ${GOLD}30`,
            }}
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  )
})
