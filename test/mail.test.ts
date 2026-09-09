import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isMailConfigured, escapeHtml, domainFromAddress, messageIdFor } from '../lib/leads/mail'
import type { Lead } from '../lib/leads/types'

const lead = (overrides: Partial<Lead> = {}): Lead => ({
  timestamp: '2026-01-01T00:00:00.000Z',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '',
  company: 'Acme',
  matchedDivision: 'Xanadu Consulting',
  sessionType: 'free',
  needHelpWith: '',
  stage: '',
  challenge: '',
  consent: true,
  ...overrides,
})

describe('escapeHtml', () => {
  it('escapes all HTML-significant characters (XSS guard for the team email)', () => {
    const evil = `<img src=x onerror="alert(1)"> & 'script' "quoted"`
    const out = escapeHtml(evil)
    expect(out).not.toContain('<')
    expect(out).not.toContain('>')
    expect(out).not.toContain('"')
    expect(out).not.toContain("'")
    expect(out).toContain('&amp;')
  })
  it('escapes a script-injection attempt', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })
})

describe('domainFromAddress', () => {
  it('extracts the domain from a "Name <addr@domain>" string', () => {
    expect(domainFromAddress('Xanadu <noreply@xanadu.com>')).toBe('xanadu.com')
  })
  it('extracts the domain from a bare address', () => {
    expect(domainFromAddress('noreply@xanadu.com')).toBe('xanadu.com')
  })
  it('falls back to a constant when nothing parses', () => {
    expect(domainFromAddress('garbage')).toBe('xanadu.com')
  })
})

describe('messageIdFor', () => {
  beforeEach(() => {
    process.env.SMTP_FROM = 'Xanadu <noreply@xanadu.com>'
  })
  afterEach(() => {
    delete process.env.SMTP_FROM
  })

  it('is deterministic for the same stable lead fields (retry dedup)', () => {
    const a = messageIdFor(lead())
    const b = messageIdFor(lead())
    expect(a).toBe(b)
  })
  it('is a well-formed Message-ID (<id@domain>)', () => {
    expect(messageIdFor(lead())).toMatch(/^<lead-[0-9a-f]{24}@xanadu\.com>$/)
  })
  it('differs when the lead content differs (so distinct leads are not deduped)', () => {
    const a = messageIdFor(lead({ email: 'one@example.com' }))
    const b = messageIdFor(lead({ email: 'two@example.com' }))
    expect(a).not.toBe(b)
  })
  it('is unaffected by the per-call time within the same day (same-day retry dedupe)', () => {
    const a = messageIdFor(lead({ timestamp: '2026-01-01T00:00:00.000Z' }))
    const b = messageIdFor(lead({ timestamp: '2026-01-01T23:59:59.999Z' }))
    expect(a).toBe(b)
  })
  it('differs across days so a later deliberate re-submission is not deduped away', () => {
    const a = messageIdFor(lead({ timestamp: '2026-01-01T00:00:00.000Z' }))
    const b = messageIdFor(lead({ timestamp: '2026-06-28T12:00:00.000Z' }))
    expect(a).not.toBe(b)
  })
})

describe('isMailConfigured (SMTP port validation, B1)', () => {
  const baseCreds = () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_USER = 'user'
    process.env.SMTP_PASS = 'pass'
    process.env.SMTP_FROM = 'noreply@example.com'
    process.env.SMTP_TO = 'leads@example.com'
  }
  afterEach(() => {
    for (const k of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_TO'])
      delete process.env[k]
  })

  it('reports configured for a valid numeric port', () => {
    baseCreds()
    process.env.SMTP_PORT = '465'
    expect(isMailConfigured()).toBe(true)
  })
  it('reports UNconfigured when the port is non-numeric (fail-closed)', () => {
    baseCreds()
    process.env.SMTP_PORT = 'abc'
    expect(isMailConfigured()).toBe(false)
  })
  it('reports UNconfigured when the port is empty', () => {
    baseCreds()
    process.env.SMTP_PORT = ''
    expect(isMailConfigured()).toBe(false)
  })
  it('reports UNconfigured when the port is out of range', () => {
    baseCreds()
    process.env.SMTP_PORT = '99999'
    expect(isMailConfigured()).toBe(false)
  })
})
