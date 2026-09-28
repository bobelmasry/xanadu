"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      // Staggered text reveal
      const words = titleRef.current?.querySelectorAll('.word')
      if (words) {
        gsap.fromTo(words,
          { y: prefersReduced ? 0 : 60, opacity: 0, rotateX: prefersReduced ? 0 : -15 },
          { y: 0, opacity: 1, rotateX: 0, duration: prefersReduced ? 0.001 : 1.2, stagger: prefersReduced ? 0 : 0.12, ease: 'power3.out', delay: 0.3 }
        )
      }

      gsap.fromTo(subtitleRef.current,
        { y: prefersReduced ? 0 : 30, opacity: 0 },
        { y: 0, opacity: 1, duration: prefersReduced ? 0.001 : 1, ease: 'power2.out', delay: 1.2 }
      )

      // Fade out on scroll (movement dropped for reduced-motion users)
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '60% top',
          scrub: true,
        },
        opacity: 0,
        y: prefersReduced ? 0 : -60,
      })

      // Scroll indicator fade out
      gsap.to(scrollRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '10% top',
          end: '30% top',
          scrub: true,
        },
        opacity: 0,
        y: -20,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const titleWords = "Most companies don't grow in a straight line.".split(' ')

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(61,90,128,0.10) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-4xl text-center">
        {/* Group mark — the new holding logo (replaces the old sprite vector). */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative hero brand mark */}
        <img
          src="/brand/02%20Xanadu%20Logos-20260726T102112Z-1-001/02%20Xanadu%20Logos/Xanadu_Holding_Color.png"
          alt=""
          aria-hidden="true"
          width={512}
          height={472}
          fetchPriority="high"
          className="mx-auto h-64 w-64 mb-10 object-contain"
          style={{ filter: 'drop-shadow(0 4px 24px rgba(61,90,128,0.25))' }}
        />
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8"
          style={{ fontFamily: 'var(--font-heading)', perspective: '600px' }}
        >
          {titleWords.map((word, i) => (
            <span
              key={i}
              className="word inline-block mr-[0.3em] js-hidden"
              style={{ display: 'inline-block' }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl md:text-3xl font-light js-hidden"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}
        >
          They grow in <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>fragments</span>.
        </p>
      </div>

      {/* Keep Scrolling indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-12 flex flex-col items-center gap-3"
        style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}
      >
        <svg width="20" height="30" viewBox="0 0 20 30" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="18" height="28" rx="9" stroke="rgba(15,23,42,0.25)" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.5" fill="rgba(15,23,42,0.45)">
            <animate attributeName="cy" values="10;18;10" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </section>
  )
}
