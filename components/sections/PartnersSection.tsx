"use client"

import React, { memo, useRef } from 'react'
import { useRevealOnScroll } from '../../lib/useRevealOnScroll'

// From the Xanadu Group profile: strategic partners + featured clients, in
// profile order. Entries without a logo asset render as a text chip.
const PARTNERS: { name: string; logo?: string }[] = [
  { name: 'SMG', logo: '/partners/smg.png' },
  { name: 'Entourage', logo: '/partners/entourage.png' },
  { name: 'Ye Sports', logo: '/partners/ye-sports.png' },
  { name: 'Winfi', logo: '/partners/winfi.png' },
  { name: 'Bricks', logo: '/partners/bricks.png' },
  { name: 'Tremoloo', logo: '/partners/tremoloo.png' },
  { name: 'Odoo', logo: '/partners/odoo.png' },
  { name: 'Clio', logo: '/partners/clio.png' },
  { name: 'Cloudbeds', logo: '/partners/cloudbeds.png' },
  { name: 'Asfaleia', logo: '/partners/asfaleia.png' },
  { name: 'Taager', logo: '/partners/taager.png' },
  { name: 'Nabda', logo: '/partners/nabda.png' },
  { name: 'Influencer Hero' },
  { name: 'Beacons.ai', logo: '/partners/beacons.png' },
  { name: 'El Shawaraby' },
  { name: 'Contrato', logo: '/partners/contrato.png' },
  { name: 'Al Zamil' },
  { name: 'Bekiaa', logo: '/partners/bekia.png' },
  // CX technology ecosystem (Xanadu Web3 profile)
  { name: 'Zendesk', logo: '/partners/zendesk.png' },
  { name: 'Infobip', logo: '/partners/infobip.png' },
  { name: 'Gameball', logo: '/partners/gameball.png' },
]

export default memo(function PartnersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealOnScroll(sectionRef, {
    selector: '.partner-reveal',
    y: 30,
    duration: 0.8,
    stagger: 0.06,
    start: 'top 75%',
  })

  return (
    <section ref={sectionRef} id="partners" className="py-32 md:py-44">
      <div className="section-container text-center">
        <p className="partner-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>Partners</p>
        <h2 className="partner-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          We don&apos;t grow alone.
        </h2>
        <p className="partner-reveal text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>
          We grow through strategic alignment.
        </p>
        <p className="partner-reveal text-base mb-16 mx-auto" style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
          Xanadu Group has established strong strategic collaborations with global industry
          leaders and serves some of the most prominent organizations in the MENA region.
        </p>

        {/* Partner logos */}
        <div className="partner-reveal grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16 max-w-4xl mx-auto">
          {PARTNERS.map((partner) => (
            <div key={partner.name} className="flex items-center justify-center">
              {partner.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element -- partner brand logo */
                <img
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                  className="h-11 md:h-12 w-auto max-w-full object-contain"
                />
              ) : (
                <span
                  className="text-sm font-semibold tracking-wide px-4 py-2 rounded-lg"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'rgba(15,23,42,0.03)',
                    border: '1px solid rgba(15,23,42,0.1)',
                  }}
                >
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="partner-reveal text-lg italic" style={{ color: 'var(--text-muted)' }}>
          Driving innovation and growth through{' '}
          <span style={{ color: 'var(--text-primary)' }}>powerful collaborations</span>.
        </p>
      </div>
    </section>
  )
})
