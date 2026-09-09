import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Re-import fresh each test file run so the in-memory bucket map is clean.
import { rateLimit, getClientIp, firstValidIp, isValidIp } from '../lib/rateLimit'

const goodHeaders = (extra: Record<string, string> = {}) => {
  const h = new Headers()
  for (const [k, v] of Object.entries(extra)) h.set(k, v)
  return h
}
const req = (extra: Record<string, string> = {}) =>
  ({ headers: goodHeaders(extra) }) as unknown as Request

describe('isValidIp', () => {
  it.each([
    ['1.2.3.4', true],
    ['::1', true],
    ['2606:4700:4700::1111', true],
    ['', false],
    ['not-an-ip', false],
    ['1.2.3.04', false], // leading-zero octet (L3 amplifier)
    ['1.2.3', false],
    ['999.1.1.1', false],
    ['foo:bar', false], // the old hand-rolled check accepted any ':' string as IPv6
  ])('isIP(%s) -> %s', (v, ok) => expect(isValidIp(v)).toBe(ok))
})

describe('firstValidIp', () => {
  it('returns the first valid IP from a comma-joined header', () => {
    expect(firstValidIp('1.2.3.4, 5.6.7.8')).toBe('1.2.3.4')
  })
  it('skips garbage hops and returns the first valid one', () => {
    expect(firstValidIp('garbage, not-an-ip, 10.0.0.1')).toBe('10.0.0.1')
  })
  it('strips IPv6 brackets', () => {
    expect(firstValidIp('[2606:4700:4700::1111]')).toBe('2606:4700:4700::1111')
  })
  it('returns null when nothing parses', () => {
    expect(firstValidIp(null)).toBeNull()
    expect(firstValidIp('')).toBeNull()
    expect(firstValidIp('totally bogus')).toBeNull()
  })
})

describe('getClientIp', () => {
  afterEach(() => {
    delete process.env.TRUST_REAL_IP
    delete process.env.TRUST_XFF
  })

  it('collapses to "unknown" when no trust flag is set (header is client-controlled)', () => {
    process.env.TRUST_REAL_IP = ''
    expect(getClientIp(req({ 'x-real-ip': '1.2.3.4' }))).toBe('unknown')
    expect(getClientIp(req({ 'x-forwarded-for': '1.2.3.4' }))).toBe('unknown')
  })
  it('honors x-real-ip only when TRUST_REAL_IP=1', () => {
    process.env.TRUST_REAL_IP = '1'
    expect(getClientIp(req({ 'x-real-ip': '203.0.113.5' }))).toBe('203.0.113.5')
  })
  it('falls back to "unknown" when the trusted header holds garbage', () => {
    process.env.TRUST_REAL_IP = '1'
    expect(getClientIp(req({ 'x-real-ip': 'not-an-ip' }))).toBe('unknown')
  })
  it('ignores X-Forwarded-For even if TRUST_XFF=1 is set (leftmost hop is client-spoofable)', () => {
    process.env.TRUST_XFF = '1'
    expect(getClientIp(req({ 'x-forwarded-for': '5.6.7.8, 9.10.11.12' }))).toBe('unknown')
  })
  it('does NOT auto-trust on a stray flag (no VERCEL/PLATFORM auto-trust)', () => {
    process.env.VERCEL = '1'
    expect(getClientIp(req({ 'x-real-ip': '1.2.3.4' }))).toBe('unknown')
    delete process.env.VERCEL
  })
})

describe('rateLimit (in-memory fixed window)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('allows up to 5 requests per key within the window', async () => {
    const results = []
    for (let i = 0; i < 5; i++) results.push((await rateLimit('ip-allow')).ok)
    expect(results.every(Boolean)).toBe(true)
  })

  it('rejects the 6th request in the same window (429)', async () => {
    for (let i = 0; i < 5; i++) await rateLimit('ip-throttle')
    const sixth = await rateLimit('ip-throttle')
    expect(sixth.ok).toBe(false)
    expect(sixth.retryAfter).toBeGreaterThan(0)
  })

  it('isolates buckets per key', async () => {
    for (let i = 0; i < 5; i++) await rateLimit('ip-a')
    expect((await rateLimit('ip-a')).ok).toBe(false) // a is throttled
    expect((await rateLimit('ip-b')).ok).toBe(true) // b is unaffected
  })

  it('reopens the window after the hour elapses', async () => {
    for (let i = 0; i < 5; i++) await rateLimit('ip-reset')
    expect((await rateLimit('ip-reset')).ok).toBe(false)
    // Advance just past the 1-hour window.
    vi.advanceTimersByTime(60 * 60 * 1000 + 1)
    expect((await rateLimit('ip-reset')).ok).toBe(true)
  })

  it('reports a sane Retry-After that shrinks as time passes', async () => {
    for (let i = 0; i < 5; i++) await rateLimit('ip-ttl')
    const first = await rateLimit('ip-ttl')
    expect(first.ok).toBe(false)
    const before = first.retryAfter
    vi.advanceTimersByTime(10 * 60 * 1000) // 10 min later
    const later = await rateLimit('ip-ttl')
    expect(later.ok).toBe(false)
    expect(later.retryAfter).toBeLessThan(before)
  })
})
