"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { parsePhoneNumber, type CountryCode } from 'libphonenumber-js'
import { useFocusTrap } from '../lib/useFocusTrap'
import type { SessionType } from '../lib/leads/types'
import { STEPS, ROUTING, getCalendarUrl } from '../lib/contactConfig'
import { getCountryOptions, regionFlag, regionName, sendablePhone } from '../lib/phone'
import ConfirmationScreen from './contact/ConfirmationScreen'
import BookingScreen from './contact/BookingScreen'
import ResultScreen from './contact/ResultScreen'

type Answers = Record<number, string>
type Screen = 'wizard' | 'result' | 'booking' | 'confirmation'
interface ContactInfo { name: string; email: string; phone: string; company: string }

interface ContactFlowProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactFlow({ isOpen, onClose }: ContactFlowProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', email: '', phone: '', company: '' })
  const [phoneCountry, setPhoneCountry] = useState('') // ISO-2 for the phone picker (optional)
  const [website, setWebsite] = useState('') // honeypot
  const [screen, setScreen] = useState<Screen>('wizard')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [consented, setConsented] = useState(false)
  const [bookingUrl, setBookingUrl] = useState<string | null>(null)
  const [chosenSession, setChosenSession] = useState<SessionType | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstStepRef = useRef(true)
  // Latest submit state, reachable from the persistent keydown listener.
  const isSubmittingRef = useRef(false)
  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  // Stable form reset (all setters are stable) — shared by the close paths and
  // callable from the keydown effect without a stale closure.
  const resetForm = useCallback(() => {
    setStep(0)
    setAnswers({})
    setScreen('wizard')
    setContactInfo({ name: '', email: '', phone: '', company: '' })
    setPhoneCountry('')
    setWebsite('')
    setConsented(false)
    setBookingUrl(null)
    setChosenSession(null)
    setSubmitError(null)
    setFormError(null)
  }, [])

  // a11y: while open, lock background scroll, trap focus, support Escape, and
  // restore focus to whatever opened the modal on close.
  const { dialogRef, closeBtnRef } = useFocusTrap({ isOpen, onClose, resetForm, isSubmittingRef })

  // Move focus to the active heading when advancing steps / showing the result
  // (skips the very first open, where the close button is focused instead) so
  // screen-reader + keyboard users follow the conversation.
  useEffect(() => {
    if (!isOpen) { firstStepRef.current = true; return }
    if (firstStepRef.current) { firstStepRef.current = false; return }
    const id = window.setTimeout(() => headingRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [screen, step, isOpen])

  // Live phone parse: country flag + name + validity, shown under the input.
  // Phone is optional, so this only evaluates when the user has typed something.
  // Declared before the early `!isOpen` return so the hook order stays stable.
  const phoneInfo = useMemo(() => {
    const raw = contactInfo.phone.trim()
    if (!raw) return null
    const def = (phoneCountry || undefined) as CountryCode | undefined
    try {
      const pn = parsePhoneNumber(raw, def)
      if (!pn) return { valid: false, text: 'Pick a country code', tone: 'muted' as const }
      const iso = pn.country
      if (!iso) return { valid: false, text: 'Pick a country code', tone: 'muted' as const }
      const valid = pn.isValid()
      return {
        valid,
        text: `${regionFlag(iso)} ${regionName(iso)} · ${pn.formatInternational()}`,
        tone: (valid ? 'valid' : 'invalid') as 'valid' | 'invalid',
      }
    } catch {
      return { valid: false, text: 'Not a valid phone number', tone: 'muted' as const }
    }
  }, [contactInfo.phone, phoneCountry])

  if (!isOpen) return null

  const currentStep = STEPS[step]
  const routing = answers[1] ? ROUTING[answers[1]] : null

  const submitData = async (
    finalAnswers: Answers,
    finalInfo: ContactInfo,
    sessionType: SessionType
  ): Promise<boolean> => {
    // Synchronous re-entry guard. The submit buttons disable on `isSubmitting`,
    // but that state only flips after a re-render — a fast double-click (e.g.
    // Free then Paid) before the re-render fires chooseSession twice. Since
    // sessionType is part of the lead's deterministic Message-ID, the two sends
    // get different IDs and don't dedupe → the team gets two emails. The ref
    // flips synchronously here, before the first await, closing the window.
    if (isSubmittingRef.current) return false
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          user: { ...finalInfo, phone: sendablePhone(finalInfo.phone, phoneCountry) },
          matchedDivision: routing?.division,
          sessionType,
          consent: consented,
          website,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setSubmitError(data.error || 'Submission failed. Please try again.')
        return false
      }
      return true
    } catch {
      // Message only — logging the raw error object in a browser console can
      // leak server response details to anyone with devtools open.
      setSubmitError('Network error. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const chooseSession = async (sessionType: SessionType) => {
    const ok = await submitData(answers, contactInfo, sessionType)
    if (!ok) return // submitError is surfaced on the result screen
    setChosenSession(sessionType)
    // Env-gated booking step: skip straight to confirmation when no calendar
    // URL is configured.
    const url = getCalendarUrl(sessionType)
    if (url) { setBookingUrl(url); setScreen('booking') }
    else setScreen('confirmation')
  }

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [step]: option })
    setStep(step + 1)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactInfo.name.trim() || !contactInfo.email.trim()) {
      setFormError('Please provide at least your name and email.')
      return
    }
    if (contactInfo.phone.trim() && (!phoneInfo || !phoneInfo.valid)) {
      setFormError('Please enter a valid phone number (with country code).')
      return
    }
    setFormError(null)
    setScreen('result')
  }

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = fd.get('challenge') as string
    if (text.trim()) {
      setAnswers({ ...answers, [step]: text })
      setStep(step + 1)
    }
  }

  const handleClose = () => {
    // Ignore close affordances (backdrop / X) while a submit is in flight so
    // the user doesn't lose success/error feedback. (Escape is guarded in the
    // keydown effect via isSubmittingRef.)
    if (isSubmitting) return
    onClose()
    resetForm()
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Contact Xanadu"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Close button */}
      <button
        ref={closeBtnRef}
        onClick={handleClose}
        aria-label="Close contact dialog"
        className="absolute top-8 right-8 text-2xl transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        ✕
      </button>

      <div
        className="max-w-xl w-full max-h-[90vh] overflow-y-auto px-6 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress dots */}
        {screen === 'wizard' && (
          <div className="flex justify-center gap-2 mb-12">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i <= step ? '#3D5A80' : 'rgba(15,23,42,0.15)',
                  transform: i === step ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}

        {screen === 'confirmation' ? (
          /* ── Confirmation Screen ── */
          <ConfirmationScreen
            routing={routing}
            chosenSession={chosenSession}
            headingRef={headingRef}
            onDone={() => { onClose(); resetForm() }}
          />
        ) : screen === 'booking' ? (
          /* ── Booking Embed (env-gated) ── */
          <BookingScreen
            chosenSession={chosenSession}
            url={bookingUrl ?? ''}
            headingRef={headingRef}
            onContinue={() => setScreen('confirmation')}
          />
        ) : screen === 'wizard' ? (
          <div className="text-center">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl sm:text-4xl font-bold mb-4 rounded-lg focus:shadow-[0_0_0_2px_rgba(61,90,128,0.7)] focus:outline-none"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {currentStep.title}
            </h2>

            {currentStep.subtitle && (
              <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>{currentStep.subtitle}</p>
            )}
            {currentStep.description && (
              <p className="text-base mb-10" style={{ color: 'var(--text-muted)' }}>{currentStep.description}</p>
            )}

            {/* Options */}
            {currentStep.options && step < 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="glass-card p-4 text-left text-sm font-medium transition-all duration-300 hover:border-slate-900/20 hover:bg-slate-900/[0.03]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Free text */}
            {currentStep.freeText && step === 3 && (
              <form onSubmit={handleTextSubmit} className="text-left">
                <textarea
                  name="challenge"
                  rows={4}
                  placeholder="Tell us briefly..."
                  aria-label={currentStep.title}
                  className="w-full p-4 rounded-xl text-base md:text-sm resize-none focus:outline-none focus:border-[#3D5A80]/50 transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(15,23,42,0.12)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <button
                  type="submit"
                  className="mt-4 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                  style={{
                    background: '#3D5A80',
                    border: '1px solid #34496a',
                    color: '#fff',
                  }}
                >
                  Continue →
                </button>
              </form>
            )}

            {/* Contact Details Form */}
            {step === 4 && (
              <form onSubmit={handleContactSubmit} className="grid grid-cols-1 gap-4 text-left">
                {/* Honeypot: hidden from humans, filled by bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
                />
                <input
                  type="text" placeholder="Full Name" required aria-label="Full Name"
                  className="contact-input"
                  value={contactInfo.name} onChange={e => setContactInfo({ ...contactInfo, name: e.target.value })}
                />
                <input
                  type="email" placeholder="Work Email" required aria-label="Work Email"
                  className="contact-input"
                  value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    className="contact-input w-28 min-[360px]:w-36 shrink-0"
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    style={{ paddingRight: '1.75rem', colorScheme: 'light' }}
                  >
                    <option value="">Code</option>
                    {getCountryOptions().map((c) => (
                      // Name-first so the <select>'s built-in type-ahead jumps
                      // by country name (typing a letter scrolls to it).
                      <option key={c.iso} value={c.iso}>
                        {c.name} {c.flag} (+{c.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel" inputMode="tel" placeholder="Phone number" aria-label="Phone Number"
                    className="contact-input"
                    style={{ flex: 1, minWidth: 0 }}
                    value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  />
                </div>
                {phoneInfo && (
                  <p
                    className="text-xs -mt-2 mb-1"
                    style={{
                      color:
                        phoneInfo.tone === 'valid' ? '#15803D' : phoneInfo.tone === 'invalid' ? '#DC2626' : 'var(--text-muted)',
                    }}
                  >
                    {phoneInfo.text}
                  </p>
                )}
                <input
                  type="text" placeholder="Company Name" aria-label="Company Name"
                  className="contact-input"
                  value={contactInfo.company} onChange={e => setContactInfo({ ...contactInfo, company: e.target.value })}
                />
                <label
                  className="flex items-start gap-3 text-xs cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <input
                    type="checkbox"
                    checked={consented}
                    onChange={(e) => setConsented(e.target.checked)}
                    required
                    className="mt-0.5 h-4 w-4 accent-[#3D5A80]"
                  />
                  <span>
                    I agree to be contacted by Xanadu and have read the{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {formError && (
                  <p className="text-sm" style={{ color: '#DC2626' }}>{formError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 px-6 py-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-[#3D5A80] hover:bg-[#4a6a96] disabled:opacity-50"
                  style={{
                    border: '1px solid #34496a',
                    color: '#fff',
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Get My Strategy Path →'}
                </button>
              </form>
            )}

            {/* Start button for welcome screen */}
            {step === 0 && !currentStep.options && !currentStep.freeText && (
              <button
                onClick={() => setStep(1)}
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                style={{
                  background: '#3D5A80',
                  border: '1px solid #34496a',
                  color: '#fff',
                }}
              >
                Let&apos;s Start →
              </button>
            )}
          </div>
        ) : (
          /* ── Result Screen ── */
          <ResultScreen
            routing={routing}
            headingRef={headingRef}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onChoose={chooseSession}
          />
        )}
      </div>
    </div>
  )
}
