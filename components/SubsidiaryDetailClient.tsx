"use client"

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { SUBSIDIARY_SECTIONS } from './homeJourney'

// Code-split + mount-on-open (keeps the ~150 KB phone-validation dep out of
// the detail pages' initial bundle).
const ContactFlow = dynamic(() => import('./ContactFlow'), { ssr: false })

export default function SubsidiaryDetailClient({ id }: { id: string }) {
  const [contactOpen, setContactOpen] = useState(false)
  const closeContact = useCallback(() => setContactOpen(false), [])
  const openContact = useCallback(() => setContactOpen(true), [])
  const Section = SUBSIDIARY_SECTIONS[id]
  if (!Section) return null

  return (
    <main className="pt-16">
      <div className="section-container pt-8">
        <Link
          href="/subsidiaries"
          className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
        >
          ← All subsidiaries
        </Link>
      </div>
      <Section variant="full" onContactClick={openContact} />
      {contactOpen && <ContactFlow isOpen={contactOpen} onClose={closeContact} />}
    </main>
  )
}
