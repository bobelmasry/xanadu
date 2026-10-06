"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { useRevealOnScroll } from '../lib/useRevealOnScroll'
import type { LogoEntry } from '../lib/subsidiaries'

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
   * 'summary' (default) — home-page teaser: name + logo + one-liner +
   * a "Learn more" link to the detail page. Heavy copy lives on the
   * detail route.
   * 'full' — detail-page layout: about, services, clients, partners,
   * portfolio.
   */
  variant?: 'summary' | 'full'
  /** This subsidiary's logo image (the emitter). Omitted for divisions without a logo. */
  logo?: string
  /** Override the content column's width/position classes (default is narrow + left). */
  contentClassName?: string
  /** Detail page: extra "About Us" paragraph beyond `description`. */
  aboutText?: string
  /** Detail page: named clients (logo chip if available). */
  clients?: LogoEntry[]
  /** Detail page: fallback line for the Clients block when no client is nameable. */
  clientsNote?: string
  /** Detail page: partners / alliances (logo chip if available). */
  partners?: LogoEntry[]
  children?: React.ReactNode
}

/** A client/partner chip — logo image when an asset exists, text chip otherwise. */
function LogoChip({ entry, accent }: { entry: LogoEntry; accent: string }) {
  if (entry.logo) {
    return (
    <div
      className="flex h-16 w-40 shrink-0 items-center justify-center rounded-lg px-4 py-3"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--chip-border)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.logo}
        alt={entry.name}
        loading="lazy"
        className="max-h-10 max-w-24 object-contain"
      />
    </div>
    )
  }
  return (
    <span
      className="text-sm font-semibold tracking-wide px-4 py-2 rounded-lg"
      style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)', border: `1px solid ${accent}33` }}
    >
      {entry.name}
    </span>
  )
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
  aboutText,
  clients,
  clientsNote,
  partners,
  children,
}: SubsidiarySectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, { end: 'top 30%' })

  return (
    <section
      ref={sectionRef}
      id={id}
      className={variant === 'summary' ? 'relative pt-8 pb-40 sm:py-14 md:min-h-[70vh] md:py-24' : 'relative py-24 sm:py-32 md:py-40'}
      style={{ minHeight: variant === 'summary' ? undefined : '80vh' }}
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
          <div className={variant === 'summary' ? 'mb-8 flex flex-nowrap items-center gap-x-4 gap-y-3' : 'mb-12 md:mb-16 flex flex-nowrap items-center gap-x-4 gap-y-3'}>
            {variant === 'full' ? (
              /* Detail page: the subsidiary name is the page's single <h1>. */
              <h1
                className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.15em]"
                style={{ fontFamily: 'var(--font-heading)', color }}
              >
                {name}
              </h1>
            ) : (
              <span
                className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.15em]"
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
                className="h-16 w-16 sm:h-24 sm:w-24 shrink-0 object-contain"
              />
            )}
          </div>

          {/* Hook text — detail page only (home keeps to a single sentence). */}
          {variant === 'full' && (
            <h2
              className="reveal-item text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {hookText}
            </h2>
          )}

          {variant === 'full' ? (
            <>
              {/* About Us */}
              <div className="reveal-item mb-10">
                <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)' }}>About Us</p>
                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}
                >
                  {description}
                </p>
                {aboutText && (
                  <p
                    className="text-base sm:text-lg leading-relaxed mt-4"
                    style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}
                  >
                    {aboutText}
                  </p>
                )}
              </div>

              {/* Services */}
              <div className="reveal-item glass-card p-5 mb-10">
                <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--text-muted)' }}>Services</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {servicesText}
                </p>
              </div>

              {/* Clients */}
              {(clients?.length || clientsNote) && (
                <div className="reveal-item mb-10">
                  <p className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--text-muted)' }}>Clients</p>
                  {clients?.length ? (
                    <div className="flex flex-wrap gap-3">
                      {clients.map((c) => (
                        <LogoChip key={c.name} entry={c} accent={color} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>
                      {clientsNote}
                    </p>
                  )}
                </div>
              )}

              {/* Partners */}
              {partners?.length ? (
                <div className="reveal-item mb-10">
                  <p className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--text-muted)' }}>Partners</p>
                  <div className="flex flex-wrap gap-3">
                    {partners.map((p) => (
                      <LogoChip key={p.name} entry={p} accent={color} />
                    ))}
                  </div>
                </div>
              ) : null}

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

            {/* CTA Button — detail page (home funnels through Learn more / Final CTA). */}
            {variant === 'full' && ctaText && (
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
