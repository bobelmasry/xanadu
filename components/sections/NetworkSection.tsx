"use client"

import { memo, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRevealOnScroll } from '../../lib/useRevealOnScroll'

// Interactive MapLibre map (Google-Maps-style, free CARTO/OSM tiles — no API
// key). Lazy-loaded client-only so maplibre-gl never enters the initial
// bundle and never touches SSR.
const MenaMap = dynamic(() => import('../MenaMap'), {
  ssr: false,
  loading: () => (
    <div
      className="mx-auto flex aspect-[4/3] sm:aspect-[16/10] max-h-[440px] w-full max-w-[600px] items-center justify-center rounded-xl"
      style={{ background: 'rgba(61,90,128,0.08)' }}
    >
      <span
        className="text-xs uppercase"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
      >
        Loading map…
      </span>
    </div>
  ),
})

export default memo(function NetworkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const mapSlotRef = useRef<HTMLDivElement>(null)
  // maplibre-gl is ~1 MB of JS + CSS; `dynamic()` defers the *chunk load*
  // until first render of <MenaMap/>, but rendering it unconditionally would
  // still fire that import during hydration. Gate the mount itself behind an
  // IntersectionObserver so the download only starts when the map slot is
  // ~600px from the viewport (MenaMap's own observer then defers WebGL init
  // to ~300px).
  const [mapNear, setMapNear] = useState(false)

  useEffect(() => {
    const el = mapSlotRef.current
    if (!el || mapNear) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect()
          setMapNear(true)
        }
      },
      { rootMargin: '600px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mapNear])

  useRevealOnScroll(sectionRef, { selector: '.net-reveal' })

  const benefits = [
    { icon: '⟡', text: 'Direct access to decision-makers' },
    { icon: '⟡', text: 'Faster partnerships and deal flow' },
    { icon: '⟡', text: 'Insider market knowledge' },
    { icon: '⟡', text: 'Cross-border opportunities' },
  ]

  return (
    <section ref={sectionRef} id="network" className="py-32 md:py-44">
      <div className="section-container max-w-3xl mx-auto text-center">
        <p className="net-reveal text-sm uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-muted)' }}>Our Network</p>
        <h2 className="net-reveal text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Access changes everything.
        </h2>
        <p className="net-reveal text-lg mb-12" style={{ color: 'var(--text-secondary)' }}>
          Xanadu operates within a powerful regional and global network of founders, investors,
          operators, and decision-makers. This network is not passive — it is actively leveraged
          to unlock opportunities and accelerate deals.
        </p>

        {/* MENA coverage map */}
        <div className="net-reveal mb-14">
          <div ref={mapSlotRef} className="glass-card mx-auto p-4 sm:p-6" style={{ maxWidth: '640px' }}>
            {mapNear ? <MenaMap /> : (
              <div
                className="flex aspect-[4/3] sm:aspect-[16/10] max-h-[440px] w-full items-center justify-center"
                style={{ background: 'rgba(61,90,128,0.08)' }}
              />
            )}
          </div>
          <p
            className="mt-5 text-xs sm:text-sm uppercase"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.3em' }}
          >
            Covering the entire MENA region
          </p>
        </div>

        <div className="net-reveal grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-left">
          {benefits.map((b, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <span className="text-xl" style={{ color: '#3D5A80' }}>{b.icon}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.text}</span>
            </div>
          ))}
        </div>

        <p className="net-reveal text-lg" style={{ color: 'var(--text-muted)' }}>
          Most companies build connections.{' '}
          <span style={{ color: '#fff', fontWeight: 500 }}>We activate networks.</span>
        </p>
      </div>
    </section>
  )
})
