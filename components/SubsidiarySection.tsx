"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { useRevealOnScroll } from '../lib/useRevealOnScroll'

interface SubsidiarySectionProps {
  id: string
  name: string
  color: string
  hookText: string
  summaryText: string
  description: string
  servicesText: string
  ctaText?: string
  onCtaClick?: () => void
  /**
   * 'summary' (default) — home-page teaser: hook + one-liner + a
   * "Learn more" link to the detail page. Heavy copy lives on the
   * detail route.
   * 'full' — detail-page layout: description, services, portfolio.
   */
  variant?: 'summary' | 'full'
  /** This subsidiary's logo image (the emitter). Omitted for divisions without a logo. */
  logo?: string
  /** Override the content column's width/position classes (default is narrow + left). */
  contentClassName?: string
  children?: React.ReactNode
}

export default function SubsidiarySection({
  id,
  name,
  color,
  hookText,
  summaryText,
  description,
  servicesText,
  ctaText,
  onCtaClick,
  variant = 'summary',
  logo,
  contentClassName,
  children,
}: SubsidiarySectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, { end: 'top 30%' })

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative py-24 sm:py-32 md:py-40"
      style={{ minHeight: '80vh' }}
    >
      <div className="section-container">
        <div
          className={
            variant === 'full' && contentClassName
              ? contentClassName
              : 'max-w-xl mx-auto md:mx-0 md:ml-8 md:max-w-[min(40vw,520px)]'
          }
        >
          {/* Subsidiary name + logo (the emitter) — top-left, above the text.
              The name is the section's primary title: it leads the hierarchy
              (largest + heaviest), so the hook headline below reads as a
              supporting sub-headline instead of overshadowing it.
              flex-wrap + smaller mobile scale so the row never clips off the
              right edge on narrow phones — the logo drops below the name. */}
          <div className="mb-12 md:mb-16 flex flex-wrap items-center gap-x-4 gap-y-3">
            {variant === 'full' ? (
              /* Detail page: the subsidiary name is the page's single <h1>. */
              <h1
                className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-heading)', color }}
              >
                {name}
              </h1>
            ) : (
              <span
                className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-heading)', color }}
              >
                {name}
              </span>
            )}
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element -- small decorative logo
              <img
                src={logo}
                alt=""
                aria-hidden="true"
                width={224}
                height={224}
                loading="lazy"
                className="h-20 w-20 sm:h-28 sm:w-28 shrink-0 object-contain"
                style={{ filter: `drop-shadow(0 0 10px ${color})` }}
              />
            )}
          </div>

          {/* Hook text */}
          <h2
            className="reveal-item text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {hookText}
          </h2>

          {variant === 'full' ? (
            <>
              {/* Description — heavy copy lives on the detail page */}
              <p
                className="reveal-item text-base sm:text-lg leading-relaxed mb-10"
                style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}
              >
                {description}
              </p>

              {/* Services */}
              <div className="reveal-item glass-card p-5 mb-10">
                <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)' }}>Services</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {servicesText}
                </p>
              </div>

              {/* Custom content (portfolio, etc.) */}
              {children && <div className="reveal-item mb-10">{children}</div>}
            </>
          ) : (
            /* Summary — one-liner only on the home page */
            <p
              className="reveal-item text-base sm:text-lg leading-relaxed mb-10"
              style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}
            >
              {summaryText}
            </p>
          )}

          {/* Actions */}
          <div className="reveal-item flex flex-wrap items-center gap-4">
            {variant === 'summary' && (
              <Link
                href={`/subsidiaries/${id}`}
                aria-label={`Learn more about Xanadu ${name}`}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}40`,
                  color,
                  fontFamily: 'var(--font-heading)',
                  boxShadow: `0 0 30px ${color}30`,
                }}
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            )}

            {/* CTA Button */}
            {ctaText && (
              <button
                className="svc-cta group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden"
                style={{
                  '--cta-bg': `${color}15`,
                  '--cta-bg-hover': `${color}25`,
                  '--cta-border': `${color}40`,
                  '--cta-color': color,
                  '--cta-glow': `0 0 30px ${color}30`,
                } as React.CSSProperties}
                onClick={onCtaClick}
              >
                → {ctaText}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
