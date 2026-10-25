"use client"

import React from 'react'
import Link from 'next/link'
import { SUBSIDIARY_SECTIONS } from '../app/homeJourney'

export default function SubsidiaryDetailClient({ id }: { id: string }) {
  const Section = SUBSIDIARY_SECTIONS[id]
  if (!Section) return null

  return (
    <main className="pt-16">
      <div className="section-container">
        <Link
          href="/subsidiaries"
          className="inline-flex items-center gap-2 mt-12 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}
        >
          ← All subsidiaries
        </Link>
      </div>
      <Section variant="full" />
    </main>
  )
}
