import { describe, it, expect } from 'vitest'
import {
  EMAIL_RE,
  FIELD_LIMITS,
  stripControls,
  sanitizeBody,
  validate,
  parseAndNormalizePhone,
  type ContactBody,
} from '../app/api/contact/route'

const validBody = (overrides: Partial<ContactBody> = {}): ContactBody => ({
  user: { name: 'Jane Doe', email: 'jane@example.com', phone: '', company: 'Acme' },
  answers: { '1': 'Growth & Strategy', '2': 'Startup (pre-revenue or early)', '3': 'Need help' },
  matchedDivision: 'Xanadu Consulting',
  sessionType: 'free',
  consent: true,
  ...overrides,
})

describe('stripControls', () => {
  it('removes C0 control bytes and DEL', () => {
    expect(stripControls('a\u0000b\u0007c\u001Fd\u007Fe')).toBe('abcde')
  })
  it('preserves regular spaces and printable text (but strips tab, a C0 char)', () => {
    expect(stripControls('Hello, World! 123')).toBe('Hello, World! 123')
    // Tab is U+0009, inside the C0 range, so it is stripped too.
    expect(stripControls('a\tb')).toBe('ab')
  })
  it('strips CRLF (header-injection guard)', () => {
    expect(stripControls('a\r\nBcc: evil@x.com')).toBe('aBcc: evil@x.com')
  })
  it('strips a NUL that would truncate', () => {
    expect(stripControls('name\u0000admin')).toBe('nameadmin')
  })
})

describe('sanitizeBody', () => {
  it('strips controls from user free-text fields', () => {
    const out = sanitizeBody({
      ...validBody(),
      user: { name: 'J\r\nane', email: 'a@b.com', phone: '+1\n2', company: 'A\x00' },
    })
    expect(out.user?.name).toBe('Jane')
    expect(out.user?.phone).toBe('+12')
    expect(out.user?.company).toBe('A')
  })
  it('strips controls from answer values', () => {
    const out = sanitizeBody({ ...validBody(), answers: { '3': 'x\r\ny\u0000z' } })
    expect(out.answers?.['3']).toBe('xyz')
  })
  it('leaves the honeypot field untouched (checked on raw body)', () => {
    const out = sanitizeBody({ ...validBody(), website: 'bot\r\nfill' })
    expect(out.website).toBe('bot\r\nfill')
  })
  it('is a no-op on a clean body', () => {
    const clean = validBody()
    expect(sanitizeBody(clean)).toEqual(clean)
  })
})

describe('EMAIL_RE', () => {
  it.each([
    'jane@example.com',
    'first.last+tag@sub.example.co.uk',
    'a@b.io',
  ])('accepts %s', (v) => expect(EMAIL_RE.test(v)).toBe(true))
  it.each([
    'plainaddress',
    '@no-local.com',
    'no-at.com',
    'no-tld@example',
    'spaces in@example.com',
    'a@b.com,ev', // comma-injection attempt (B4)
    'a@b.com;evil',
    'a@b(space).com',
  ])('rejects %s', (v) => expect(EMAIL_RE.test(v)).toBe(false))
})

describe('parseAndNormalizePhone', () => {
  it('returns empty/ok for an empty string (phone is optional; the guard)', () => {
    expect(parseAndNormalizePhone('')).toEqual({ ok: true, e164: '' })
  })
  it('normalizes a valid international number to E.164', () => {
    const r = parseAndNormalizePhone('+1 650 253 0000')
    expect(r.ok).toBe(true)
    expect(r.e164).toMatch(/^\+1\d{10}$/)
  })
  it('rejects garbage', () => {
    expect(parseAndNormalizePhone('not-a-phone').ok).toBe(false)
    expect(parseAndNormalizePhone('abc').ok).toBe(false)
  })
})

describe('validate', () => {
  it('passes a complete, valid body', () => {
    const { error, phoneE164 } = validate(validBody())
    expect(error).toBeNull()
    expect(phoneE164).toBe('')
  })
  it('requires a name', () => {
    expect(validate({ ...validBody(), user: { name: '', email: 'a@b.io' } }).error).toBe('Name is required.')
  })
  it('requires an email', () => {
    expect(validate({ ...validBody(), user: { name: 'Jane', email: '' } }).error).toBe('Email is required.')
  })
  it('rejects a malformed email', () => {
    expect(validate({ ...validBody(), user: { name: 'Jane', email: 'nope' } }).error).toMatch(/valid email/i)
  })
  it('requires consent', () => {
    expect(validate({ ...validBody(), consent: false }).error).toMatch(/consent/i)
  })
  it('rejects an unknown matchedDivision', () => {
    expect(validate({ ...validBody(), matchedDivision: 'Evil Co' }).error).toMatch(/division/i)
  })
  it('rejects an unknown sessionType', () => {
    expect(validate({ ...validBody(), sessionType: 'super' as unknown as string }).error).toMatch(/session/i)
  })
  it('enforces the name length cap', () => {
    const tooLong = 'x'.repeat(FIELD_LIMITS.name + 1)
    expect(validate({ ...validBody(), user: { name: tooLong, email: 'a@b.io' } }).error).toMatch(/too long/i)
  })
  it('rejects too many answers', () => {
    const answers: Record<string, string> = {}
    for (let i = 0; i < FIELD_LIMITS.answerCount + 1; i++) answers[String(i)] = 'x'
    expect(validate({ ...validBody(), answers }).error).toMatch(/too many/i)
  })
  it('rejects an oversized answer value', () => {
    expect(
      validate({ ...validBody(), answers: { '3': 'y'.repeat(FIELD_LIMITS.answerValue + 1) } }).error
    ).toMatch(/too long/i)
  })
  it('rejects prototype-pollution answer keys (constructor/prototype)', () => {
    expect(validate({ ...validBody(), answers: { constructor: 'x' } }).error).toMatch(/invalid answer key/i)
    expect(validate({ ...validBody(), answers: { prototype: 'x' } }).error).toMatch(/invalid answer key/i)
  })
  it('rejects a non-object body', () => {
    expect(validate(null as unknown as ContactBody).error).toBeTruthy()
    expect(validate('nope' as unknown as ContactBody).error).toBeTruthy()
  })
  it('rejects an array as user (B2)', () => {
    expect(
      validate({ ...validBody(), user: [] as unknown as ContactBody['user'] }).error
    ).toMatch(/missing user/i)
  })
  it('rejects an array as answers (B2)', () => {
    expect(
      validate({ ...validBody(), answers: [] as unknown as ContactBody['answers'] }).error
    ).toMatch(/invalid answers/i)
  })
})
