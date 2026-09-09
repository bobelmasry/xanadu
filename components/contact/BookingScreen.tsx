"use client"

import type { Ref } from 'react'
import type { SessionType } from '../../lib/leads/types'

// Sandbox tokens for the third-party booking <iframe>. `allow-same-origin` is
// required by the major calendar embeds (cal.com / Calendly run embed scripts
// + storage scoped to their own origin); combined with `allow-scripts` it makes
// the sandbox self-removable, so the sandbox is NOT the trust boundary here —
// the CSP `frame-src` allow-list in proxy.ts is (it gates which host may load
// at all). `allow-top-navigation` is deliberately omitted so the embed can never
// redirect xanadu.com itself. If a provider is later chosen that works without
// `allow-same-origin`, drop it here: the sandbox becomes a real, enforceable
// boundary.
const BOOKING_SANDBOX = 'allow-scripts allow-forms allow-popups allow-same-origin'

interface Props {
  chosenSession: SessionType | null
  url: string
  headingRef: Ref<HTMLHeadingElement>
  onContinue: () => void
}

export default function BookingScreen({ chosenSession, url, headingRef, onContinue }: Props) {
  return (
    <div className="text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl font-bold mb-2 rounded-lg focus:shadow-[0_0_0_2px_rgba(61,90,128,0.7)] focus:outline-none"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Book your {chosenSession === 'paid' ? 'paid strategic session' : 'free alignment call'}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Pick a time that works for you below.
      </p>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(15,23,42,0.12)' }}>
        <iframe
          src={url}
          title="Schedule your session"
          className="w-full"
          sandbox={BOOKING_SANDBOX}
          referrerPolicy="no-referrer"
          style={{ minHeight: '520px', border: 0, background: '#fff' }}
        />
      </div>
      <button
        onClick={onContinue}
        className="mt-6 px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
        style={{
          background: '#3D5A80',
          border: '1px solid #34496a',
          color: '#fff',
        }}
      >
        Continue →
      </button>
      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        Finished booking? Tap continue — or skip and we&apos;ll reach out to schedule.
      </p>
    </div>
  )
}
