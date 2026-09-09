"use client"

import React, { useEffect, useState } from 'react'

// Repeat visits within the session skip the overlay entirely (client-side
// navigations back to home remount this component; re-running the full
// intro every time was pure friction).
const SESSION_KEY = 'xanadu-intro-shown'
const FADE_AFTER = 600 // ms before the fade begins (hero paints under it)
const FADE_DURATION = 500 // ms

export default function LoadingScreen() {
  // Skip on repeat mounts (sessionStorage is client-only — default to
  // showing so SSR/first paint always includes the overlay).
  const [isLoading, setIsLoading] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Decoupled from GSAP so the overlay always dismisses (a stuck loading
    // screen would make the whole site appear broken). CSS transition handles
    // the fade; the second timer unmounts the node after it completes.
    let seen = false
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1'
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Private modes can throw on sessionStorage access — just show it.
    }
    if (seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time client-only sessionStorage read (unavailable during SSR, so it can't live in the initial state)
      setIsLoading(false)
      return
    }

    const fadeTimer = setTimeout(() => setFading(true), FADE_AFTER)
    const hideTimer = setTimeout(() => setIsLoading(false), FADE_AFTER + FADE_DURATION)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050508]"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_DURATION}ms ease-in-out` }}
    >
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]">
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (Math.PI / 3) * i
            // Round to avoid a server/client floating-point hydration mismatch
            // (Node and Chrome V8 can differ at the ~15th decimal place).
            const x = Math.round((50 + 40 * Math.cos(angle)) * 1000) / 1000
            const y = Math.round((50 + 40 * Math.sin(angle)) * 1000) / 1000
            return <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.3)" />
          })}
        </svg>
        <div className="w-8 h-8 border border-[#3D5A80]/60 rounded-full animate-ping" />
        <div className="absolute w-2 h-2 bg-[#3D5A80] rounded-full" />
      </div>
      <p className="text-sm tracking-[0.3em] uppercase text-gray-500 font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
        Initializing System
      </p>
    </div>
  )
}
