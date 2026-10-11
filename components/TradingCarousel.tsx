'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// `scale` zooms artwork that has a lot of built-in whitespace so it reads
// at the same visual size as the rest of the shelf.
const SLIDES: { src: string; alt: string; scale?: number }[] = [
  { src: '/carousel/0a21696be21554d80d01205ff81d6ec410ca2963-800x1074.png', alt: 'Rich Land Mandarines in light syrup' },
  { src: '/carousel/49f2533588b5924845c9fc72d5e14ec945883c21-800x1074.png', alt: 'Rich Land Strawberry in light syrup' },
  { src: '/carousel/c363e0a5f2f27ee45877bdaf54562572cccd3929-800x1074.png', alt: 'Rich Land Peach Slices in light syrup' },
  { src: '/carousel/images.jpeg', alt: 'Rich Land Mango Cubes in mango juice' },
  { src: '/carousel/novofilm.png', alt: 'NovaFilm SleepEase melatonin oral film' },
  { src: '/carousel/novofilm1.png', alt: 'NovaFilm Prime B12 oral film' },
  { src: '/carousel/novofilm2.png', alt: 'NovaFilm PrimeAlert caffeine oral film' },
  { src: '/carousel/download.png', alt: 'Omeprazole 20 mg delayed release capsules', scale: 1.5 },
  { src: '/carousel/download (1).png', alt: 'Pantoprazole 40 mg delayed release tablets', scale: 1.5 },
  { src: '/carousel/spuds-prime-ribs-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Prime Ribs crisps' },
  { src: '/carousel/spuds-sea-salt-2-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Sea Salt crisps' },
  { src: '/carousel/spuds-siracha-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Sriracha crisps' },
  { src: '/carousel/spuds-wrcester-pr8t6r6aux5b2mem2umi7qn4a1mb2sr70dp89mzo34.png', alt: 'Spuds Worcestershire crisps' },
]
 
interface TradingCarouselProps {
  /** Subsidiary accent color (controls + progress tint). */
  accent: string
  /** Label above the track, styled like the PortfolioGrid heading. */
  heading?: string
}

/**
 * Horizontally scrolling product shelf for the Trading section of /work.
 * Native scroll-snap does the heavy lifting (touch/trackpad swipe for free);
 * the arrow buttons just page the track by its visible width.
 */
export default function TradingCarousel({ accent, heading = 'Products Our Partners Sell' }: TradingCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    setProgress(max > 0 ? track.scrollLeft / max : 1)
    setAtStart(track.scrollLeft <= 2)
    setAtEnd(track.scrollLeft >= max - 2)
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync])

  const page = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

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
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous products"
            className="carousel-arrow glass-card"
            style={arrowStyle}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next products"
            className="carousel-arrow glass-card"
            style={arrowStyle}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <ul ref={trackRef} onScroll={sync} className="carousel-track" tabIndex={0} aria-label="Product images, scroll horizontally">
        {SLIDES.map((slide, index) => (
          <li key={slide.src} className="carousel-slide" aria-label={`${index + 1} of ${SLIDES.length}`}>
            <div className="investment-card glass-card p-2 h-full">
              <div className="carousel-frame">
                {/* eslint-disable-next-line @next/next/no-img-element -- local product artwork */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  loading="lazy"
                  draggable={false}
                  style={slide.scale ? { transform: `scale(${slide.scale})` } : undefined}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full" style={{ background: `${accent}1f` }} aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(progress * 100, 8)}%`,
            background: accent,
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>
    </div>
  )
}
