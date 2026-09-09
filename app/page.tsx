"use client"

import React, { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import SmoothScrollProvider from '../components/SmoothScrollProvider'
import BrandMarkAssembly from '../components/BrandMarkAssembly'
import ScrollProgress from '../components/ScrollProgress'
import CustomCursor from '../components/CustomCursor'
import ParticleField from '../components/ParticleField'
import LoadingScreen from '../components/LoadingScreen'
import { HOME_JOURNEY } from '../components/homeJourney'

// Code-split + mount-on-open: the modal (and its ~150 KB libphonenumber-js
// dependency) stays out of the initial home-page bundle and only loads when a
// visitor actually opens the contact flow.
const ContactFlow = dynamic(
  () => import('../components/ContactFlow').then((m) => m.default),
  { ssr: false }
)

export default function Page() {
  const [contactOpen, setContactOpen] = useState(false)
  const closeContact = useCallback(() => setContactOpen(false), [])
  // Stable identity: every section's onContactClick prop stays referentially
  // equal across renders (paired with the memo()'d sections) so opening or
  // closing the modal re-renders only the modal — not all 12 sections.
  const openContact = useCallback(() => setContactOpen(true), [])

  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <SmoothScrollProvider>
        <main id="scroll-container" className="relative" style={{ background: 'var(--bg-primary)' }}>
          <ParticleField />

          {/* Static group mark + finale hexagon overlay */}
          <BrandMarkAssembly />
          {/* Fixed scroll progress dots */}
          <ScrollProgress />

          {/* ── Scrollable Content ── */}
          <div className="relative" style={{ zIndex: 5 }}>
            {/* The journey registry is the single ordering source (also feeds
                ScrollProgress.SECTIONS + the coupling test). Sections without
                a CTA simply ignore the onContactClick prop. */}
            {HOME_JOURNEY.map(({ id, Component }) => (
              <Component key={id} onContactClick={openContact} />
            ))}
          </div>

          {/* Contact Flow Modal — mounts (and lazy-loads its chunk) on open */}
          {contactOpen && <ContactFlow isOpen={contactOpen} onClose={closeContact} />}
        </main>
      </SmoothScrollProvider>
    </>
  )
}
