"use client"

import type { Ref } from 'react'
import type { SessionType } from '../../lib/leads/types'
import type { Routing } from '../../lib/contactConfig'

interface Props {
  routing: Routing | null
  headingRef: Ref<HTMLHeadingElement>
  isSubmitting: boolean
  submitError: string | null
  onChoose: (sessionType: SessionType) => void
}

export default function ResultScreen({ routing, headingRef, isSubmitting, submitError, onChoose }: Props) {
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
        We&apos;ve matched you with
      </h2>
      <p className="text-2xl font-bold mb-8" style={{ color: routing?.color || '#3D5A80' }}>
        {routing?.division || 'Xanadu Consulting'}
      </p>

      <p className="text-base mb-10" style={{ color: 'var(--text-muted)' }}>
        Your case will be reviewed by our senior team. Choose how you&apos;d like to proceed:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className="glass-card p-6 text-left transition-all duration-300 hover:bg-slate-900/[0.03] disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => onChoose('free')}
        >
          <span className="block text-sm font-semibold mb-1">Free Alignment Call</span>
          <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>15-minute intro call to align on goals</span>
        </button>
        <button
          className="p-6 rounded-2xl text-left transition-all duration-300 disabled:opacity-50"
          style={{
            background: `${routing?.color || '#3D5A80'}15`,
            border: `1px solid ${routing?.color || '#3D5A80'}40`,
          }}
          disabled={isSubmitting}
          onClick={() => onChoose('paid')}
        >
          <span className="block text-sm font-semibold mb-1">Paid Strategic Session</span>
          <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>60-minute deep-dive with a senior strategist</span>
        </button>
      </div>

      {submitError && (
        <p className="mt-6 text-sm" style={{ color: '#DC2626' }}>{submitError}</p>
      )}
    </div>
  )
}
