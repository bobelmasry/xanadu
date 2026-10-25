'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortfolioItem } from '../lib/subsidiaries'

type Product = { src: string; alt: string; scale?: number }

// Product shelf per partner, keyed by the portfolio `name` in lib/subsidiaries.
// Partners without an entry here are left out of the carousel.
// `scale` zooms artwork that has a lot of built-in whitespace so it reads
// at the same visual size as the rest of the shelf.
const PRODUCTS: Record<string, Product[]> = {
  'Food Trip — Spuds': [
    { src: '/carousel/foodtrip/spuds-prime-ribs-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Prime Ribs crisps' },
    { src: '/carousel/foodtrip/spuds-sea-salt-2-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Sea Salt crisps' },
    { src: '/carousel/foodtrip/spuds-siracha-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Sriracha crisps' },
    { src: '/carousel/foodtrip/spuds-wrcester-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Worcestershire crisps' },
  ],
  'EPG Pharma': [
    { src: '/carousel/efgpharma/novofilm.png', alt: 'NovaFilm SleepEase melatonin oral film' },
    { src: '/carousel/efgpharma/novofilm1.png', alt: 'NovaFilm Prime B12 oral film' },
    { src: '/carousel/efgpharma/novofilm2.png', alt: 'NovaFilm PrimeAlert caffeine oral film' },
    { src: '/carousel/efgpharma/download.png', alt: 'Omeprazole 20 mg delayed release capsules', scale: 1.5 },
    { src: '/carousel/efgpharma/download (1).png', alt: 'Pantoprazole 40 mg delayed release tablets', scale: 1.5 },
  ],
  'Rich Land': [
    { src: '/carousel/richland/0a21696be21554d80d01205ff81d6ec410ca2963-800x1074.png', alt: 'Rich Land Mandarines in light syrup' },
    { src: '/carousel/richland/49f2533588b5924845c9fc72d5e14ec945883c21-800x1074.png', alt: 'Rich Land Strawberry in light syrup' },
    { src: '/carousel/richland/c363e0a5f2f27ee45877bdaf54562572cccd3929-800x1074.png', alt: 'Rich Land Peach Slices in light syrup' },
    { src: '/carousel/richland/images.jpeg', alt: 'Rich Land Mango Cubes in mango juice' },
  ],
}

interface TradingCarouselProps {
  /** Trading partners; only those with a PRODUCTS entry are shown. */
  companies: PortfolioItem[]
  /** Subsidiary accent color (controls + indicator tint). */
  accent: string
  /** Label above the track, styled like the PortfolioGrid heading. */
  heading?: string
}

/**
 * Partner carousel for the Trading section of /work: one company per slide,
 * with the products of the company currently in view shown underneath.
 * Native scroll-snap does the heavy lifting (touch/trackpad swipe for free);
 * the arrows and dots just scroll the track to a given slide.
 */
export default function TradingCarousel({ companies, accent, heading = 'Some of the Products Our Partners Sell' }: TradingCarouselProps) {
  const slides = companies.filter((c) => PRODUCTS[c.name]?.length)
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setActive(Math.round(track.scrollLeft / track.clientWidth))
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: index * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  if (slides.length === 0) return null

  const current = slides[Math.min(active, slides.length - 1)]
  const products = PRODUCTS[current.name]
  const arrowStyle = { borderColor: `${accent}40`, color: accent }

  return (
    <div className="mt-10" role="region" aria-roledescription="carousel" aria-label={heading}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-xs uppercase tracking-[0.25em] m-0" style={{ color: 'var(--text-muted)' }}>
          {heading}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active <= 0}
            aria-label="Previous company"
            className="carousel-arrow glass-card"
            style={arrowStyle}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active >= slides.length - 1}
            aria-label="Next company"
            className="carousel-arrow glass-card"
            style={arrowStyle}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <ul ref={trackRef} onScroll={sync} className="carousel-track" tabIndex={0} aria-label="Partner companies, scroll horizontally">
        {slides.map((company, index) => (
          <li
            key={company.name}
            className="carousel-slide carousel-slide--full"
            aria-roledescription="slide"
            aria-label={`${company.name}, ${index + 1} of ${slides.length}`}
            aria-current={index === active ? 'true' : undefined}
          >
            <div className="investment-card investment-card--open h-full flex flex-col sm:flex-row sm:items-center gap-5">
              {company.logo && (
                <div className="investment-logo-frame investment-logo-frame--open sm:w-56 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- partner brand logo */}
                  <img src={company.logo} alt={`${company.name} logo`} loading="lazy" draggable={false} />
                </div>
              )}
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: accent }}>{company.name}</h4>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center gap-2">
        {slides.map((company, index) => (
          <button
            key={company.name}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show ${company.name}`}
            aria-current={index === active ? 'true' : undefined}
            className="h-[6px] rounded-full cursor-pointer"
            style={{
              width: index === active ? '1.75rem' : '0.5rem',
              background: index === active ? accent : `${accent}40`,
              transition: 'width 0.25s ease-out, background 0.25s ease-out',
            }}
          />
        ))}
      </div>

      <ul
        key={current.name}
        className="carousel-products mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 list-none p-0"
        aria-live="polite"
        aria-label={`${current.name} products`}
      >
        {products.map((product) => (
          <li key={product.src}>
            <div className="investment-card glass-card p-2 h-full">
              <div className="carousel-frame">
                {/* eslint-disable-next-line @next/next/no-img-element -- local product artwork */}
                <img
                  src={product.src}
                  alt={product.alt}
                  loading="lazy"
                  draggable={false}
                  style={product.scale ? { transform: `scale(${product.scale})` } : undefined}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
