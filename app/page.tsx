"use client"

import React from 'react'
import SmoothScrollProvider from '../components/SmoothScrollProvider'
import ScrollProgress from '../components/ScrollProgress'
import ParticleField from '../components/ParticleField'
import LoadingScreen from '../components/LoadingScreen'
import { HOME_JOURNEY } from './homeJourney'

export default function Page() {
  return (
    <>
      <LoadingScreen />
      <SmoothScrollProvider>
        <main id="scroll-container" className="relative" style={{ background: 'var(--bg-primary)' }}>
          <ParticleField />

          {/* Fixed scroll progress dots */}
          <ScrollProgress />

          {/* ── Scrollable Content ── */}
          <div className="relative" style={{ zIndex: 5 }}>
            {/* The journey registry is the single ordering source (also feeds
                ScrollProgress.SECTIONS + the coupling test). */}
            {HOME_JOURNEY.map(({ id, Component }) => (
              <Component key={id} />
            ))}
          </div>
        </main>
      </SmoothScrollProvider>
    </>
  )
}
