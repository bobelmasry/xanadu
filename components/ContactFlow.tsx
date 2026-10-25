"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { parsePhoneNumber, type CountryCode } from 'libphonenumber-js'
import { STEPS, ROUTING } from '../lib/contactConfig'
import { getCountryOptions, regionFlag, regionName, sendablePhone } from '../lib/phone'

type Answers = Record<number, string>
interface ContactInfo { name: string; email: string; phone: string; company: string }

/** The /contact page's question flow: a few quick questions, contact details, then a thank-you. */
export default function ContactFlow() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', email: '', phone: '', company: '' })
  const [phoneCountry, setPhoneCountry] = useState('') // ISO-2 for the phone picker (optional)
  const [website, setWebsite] = useState('') // honeypot
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [consented, setConsented] = useState(false)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstStepRef = useRef(true)
  // Synchronous re-entry guard: `isSubmitting` only disables the button after a
  // re-render, so a fast double-click could otherwise send the lead twice.
  const isSubmittingRef = useRef(false)

  // Move focus to the active heading when advancing steps / showing the thank-you
  // (skips the first render) so screen-reader + keyboard users follow along.
  useEffect(() => {
    if (firstStepRef.current) { firstStepRef.current = false; return }
    const id = window.setTimeout(() => headingRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [step, sent])

  // Live phone parse: country flag + name + validity, shown under the input.
  // Phone is optional, so this only evaluates when the user has typed something.
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

  const currentStep = STEPS[step]
  // Still sent with the lead so the team email shows which division it fits;
  // the visitor no longer sees the match.
  const routing = answers[1] ? ROUTING[answers[1]] : null

  const submitData = async (): Promise<boolean> => {
    if (isSubmittingRef.current) return false
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          user: { ...contactInfo, phone: sendablePhone(contactInfo.phone, phoneCountry) },
          matchedDivision: routing?.division,
          consent: consented,
          website,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setFormError(data.error || 'Submission failed. Please try again.')
        return false
      }
      return true
    } catch {
      // Message only — logging the raw error object in a browser console can
      // leak server response details to anyone with devtools open.
      setFormError('Network error. Please try again.')
      return false
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [step]: option })
    setStep(step + 1)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactInfo.name.trim() || !contactInfo.email.trim()) {
      setFormError('Please provide at least your name and email.')
      return
    }
    if (contactInfo.phone.trim() && (!phoneInfo || !phoneInfo.valid)) {
      setFormError('Please enter a valid phone number (with country code).')
      return
    }
    if (await submitData()) setSent(true)
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

  if (sent) {
    return (
      <div className="text-center" aria-live="polite">
        <div
          aria-hidden="true"
          className="inline-flex w-16 h-16 rounded-full mb-8 items-center justify-center text-2xl"
          style={{ background: 'rgba(var(--accent-primary-rgb), 0.12)', color: 'var(--accent-primary)' }}
        >
          ✓
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl sm:text-4xl font-bold mb-4 focus:outline-none"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Thanks for reaching out
        </h1>
        <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
          Someone from our team will be in touch soon.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
          style={{ background: '#3D5A80', border: '1px solid #34496a', color: '#fff' }}
        >
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12" aria-hidden="true">
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

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl sm:text-4xl font-bold mb-4 focus:outline-none"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {step === 0 ? 'Talk to Xanadu' : currentStep.title}
      </h1>

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
              type="button"
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
            style={{ background: '#3D5A80', border: '1px solid #34496a', color: '#fff' }}
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
            <p className="text-sm" role="alert" style={{ color: '#DC2626' }}>{formError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-6 py-4 rounded-lg text-sm font-semibold transition-all duration-300 bg-[#3D5A80] hover:bg-[#4a6a96] disabled:opacity-50"
            style={{ border: '1px solid #34496a', color: '#fff' }}
          >
            {isSubmitting ? 'Sending...' : 'Send →'}
          </button>
        </form>
      )}

      {/* Start button for welcome screen */}
      {step === 0 && !currentStep.options && !currentStep.freeText && (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
          style={{ background: '#3D5A80', border: '1px solid #34496a', color: '#fff' }}
        >
          Let&apos;s Start →
        </button>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => { setFormError(null); setStep(step - 1) }}
          className="mt-8 text-xs uppercase tracking-[0.18em] font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back
        </button>
      )}
    </div>
  )
}
