"use client"

import type { Ref } from 'react'
import type { SessionType } from '../../lib/leads/types'
import type { Routing } from '../../lib/contactConfig'

interface Props {
  routing: Routing | null
  chosenSession: SessionType | null
  headingRef: Ref<HTMLHeadingElement>
  onDone: () => void
}

export default function ConfirmationScreen({ routing, chosenSession, headingRef, onDone }: Props) {
  return (
    <div className="text-center" aria-live="polite">
      <div
        className="inline-flex w-16 h-16 rounded-full mb-8 items-center justify-center text-2xl"
        style={{ background: `${routing?.color || '#3D5A80'}20` }}
      >
        ✓
      </div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl font-bold mb-4 rounded-lg focus:shadow-[0_0_0_2px_rgba(61,90,128,0.7)] focus:outline-none"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        We&apos;ve received your request
      </h2>
      <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
        Your case will be reviewed by our senior team
        {routing?.division ? <> under the {routing.division} division</> : null}.
      </p>
      {chosenSession && (
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Session: {chosenSession === 'paid' ? 'Paid Strategic Session' : 'Free Alignment Call'}
        </p>
      )}
      <button
        onClick={onDone}
        className="px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
        style={{
          background: 'rgba(61,90,128,0.25)',
          border: '1px solid rgba(61,90,128,0.5)',
          color: '#fff',
        }}
      >
        Done
      </button>
    </div>
  )
}
