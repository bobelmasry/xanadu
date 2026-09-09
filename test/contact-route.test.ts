import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Hoisted shared mock state (vi.mock factories are hoisted above imports).
const mocks = vi.hoisted(() => ({
  mailConfigured: true,
  sendLeadEmail: vi.fn(),
  persistToFile: vi.fn(),
}))

vi.mock('../lib/leads/mail', () => ({
  isMailConfigured: () => mocks.mailConfigured,
  sendLeadEmail: mocks.sendLeadEmail,
}))
vi.mock('../lib/leads/file', () => ({
  persistToFile: mocks.persistToFile,
}))

// Import AFTER the mocks are registered.
const { POST } = await import('../app/api/contact/route')

const ORIGIN = 'https://test.local'

function post(body: unknown, opts: { origin?: string; contentType?: string; ip?: string; raw?: string } = {}) {
  const headers: Record<string, string> = {
    'content-type': opts.contentType ?? 'application/json',
    origin: opts.origin ?? ORIGIN,
  }
  if (opts.ip) headers['x-real-ip'] = opts.ip
  const text = opts.raw ?? (typeof body === 'string' ? body : JSON.stringify(body))
  return POST(
    new Request('https://test.local/api/contact', {
      method: 'POST',
      headers,
      body: text,
    })
  )
}

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  user: { name: 'Jane Doe', email: 'jane@example.com', phone: '+1 650 253 0000', company: 'Acme' },
  answers: { '1': 'Growth & Strategy', '2': 'Startup (pre-revenue or early)', '3': 'Challenge text' },
  matchedDivision: 'Xanadu Consulting',
  sessionType: 'free',
  consent: true,
  website: '',
  ...overrides,
})

describe('contact route: env + mock setup', () => {
  beforeEach(() => {
    // Production-like environment so the fail-closed + origin paths are exercised.
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOWED_ORIGINS', ORIGIN)
    vi.stubEnv('LEAD_DELIVERY', 'smtp')
    vi.stubEnv('TRUST_REAL_IP', '1')
    vi.stubEnv('SMTP_HOST', 'smtp.example.com')
    vi.stubEnv('SMTP_PORT', '465')
    vi.stubEnv('SMTP_USER', 'user')
    vi.stubEnv('SMTP_PASS', 'pass')
    vi.stubEnv('SMTP_FROM', 'noreply@example.com')
    vi.stubEnv('SMTP_TO', 'leads@example.com')
    mocks.mailConfigured = true
    mocks.sendLeadEmail.mockReset()
    mocks.sendLeadEmail.mockResolvedValue(undefined)
    mocks.persistToFile.mockReset()
    mocks.persistToFile.mockResolvedValue(undefined)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('happy path', () => {
    it('returns 200 and emails the lead (smtp mode)', async () => {
      const res = await post(validPayload())
      expect(res.status).toBe(200)
      expect(mocks.sendLeadEmail).toHaveBeenCalledTimes(1)
      const lead = mocks.sendLeadEmail.mock.calls[0][0]
      expect(lead.name).toBe('Jane Doe')
      expect(lead.email).toBe('jane@example.com')
      expect(lead.consent).toBe(true)
      expect(mocks.persistToFile).not.toHaveBeenCalled()
    })

    it('persists to file (not email-first) under LEAD_DELIVERY=file', async () => {
      vi.stubEnv('LEAD_DELIVERY', 'file')
      const res = await post(validPayload(), { ip: '10.0.0.1' })
      expect(res.status).toBe(200)
      expect(mocks.persistToFile).toHaveBeenCalledTimes(1)
      // file mode still best-effort emails when mail is configured
      expect(mocks.sendLeadEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('origin / content-type guards', () => {
    it('rejects a foreign origin with 403', async () => {
      const res = await post(validPayload(), { origin: 'https://evil.example' })
      expect(res.status).toBe(403)
      expect(mocks.sendLeadEmail).not.toHaveBeenCalled()
    })

    it('rejects a missing origin with 403', async () => {
      const res = await post(validPayload(), { origin: '' })
      expect(res.status).toBe(403)
    })

    it('rejects a non-JSON content type with 415', async () => {
      const res = await post(validPayload(), { contentType: 'text/plain' })
      expect(res.status).toBe(415)
    })

    it('accepts application/json with a charset parameter (strict media match)', async () => {
      const res = await post(validPayload(), { contentType: 'application/json; charset=utf-8', ip: '10.0.0.2' })
      expect(res.status).toBe(200)
    })

    it('rejects a bogus json-ish media type (L1)', async () => {
      const res = await post(validPayload(), { contentType: 'application/json-seq' })
      expect(res.status).toBe(415)
    })
  })

  describe('body parsing & size cap', () => {
    it('returns 400 on invalid JSON', async () => {
      const res = await post('{not valid json', { ip: '10.0.0.3' })
      expect(res.status).toBe(400)
    })

    it('returns 400 on a null body (H1: not a 500)', async () => {
      const res = await post('null', { ip: '10.0.0.4' })
      expect(res.status).toBe(400)
    })

    it.each([
      ['array', '["a","b"]'],
      ['number', '123'],
      ['string', '"hello"'],
      ['boolean', 'true'],
    ])('returns 400 on a non-object JSON body (%s)', async (_label, raw) => {
      const res = await post(raw, { ip: '10.0.0.5' })
      expect(res.status).toBe(400)
    })

    it('returns 400 on an empty body', async () => {
      const res = await post('', { ip: '10.0.0.6' })
      expect(res.status).toBe(400)
    })

    it('returns 413 on an oversized body', async () => {
      const huge = { ...validPayload(), answers: { '3': 'x'.repeat(20 * 1024) } }
      const res = await post(huge, { ip: '10.0.0.7' })
      expect(res.status).toBe(413)
      expect(mocks.sendLeadEmail).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('returns 400 when name is missing', async () => {
      const res = await post(validPayload({ user: { name: '', email: 'a@b.io' } }), { ip: '10.0.0.8' })
      expect(res.status).toBe(400)
    })

    it('returns 400 on a malformed email', async () => {
      const res = await post(validPayload({ user: { name: 'Jane', email: 'nope' } }), { ip: '10.0.0.9' })
      expect(res.status).toBe(400)
    })

    it('returns 400 when consent is false', async () => {
      const res = await post(validPayload({ consent: false }), { ip: '10.0.0.10' })
      expect(res.status).toBe(400)
    })
  })

  describe('honeypot', () => {
    it('pretends success and stores nothing when the honeypot is filled', async () => {
      const res = await post(validPayload({ website: 'bot-fill' }), { ip: '10.0.0.11' })
      expect(res.status).toBe(200)
      expect(mocks.sendLeadEmail).not.toHaveBeenCalled()
      expect(mocks.persistToFile).not.toHaveBeenCalled()
    })
  })

  describe('sanitization before persistence', () => {
    it('strips CRLF from free-text before the lead is delivered (injection guard)', async () => {
      const res = await post(
        validPayload({
          user: { name: 'Jane\r\nBcc: evil@x.com', email: 'jane@example.com', phone: '', company: 'A\u0000cme' },
        }),
        { ip: '10.0.0.12' }
      )
      expect(res.status).toBe(200)
      const lead = mocks.sendLeadEmail.mock.calls[0][0]
      expect(lead.name).toBe('JaneBcc: evil@x.com') // CRLF stripped
      expect(lead.company).toBe('Acme') // NUL stripped
    })
  })

  describe('rate limiting', () => {
    it('returns 429 after 5 requests from the same IP', async () => {
      const ip = '10.0.0.99'
      let last
      for (let i = 0; i < 5; i++) last = await post(validPayload(), { ip })
      expect(last!.status).toBe(200)
      const sixth = await post(validPayload(), { ip })
      expect(sixth.status).toBe(429)
      expect(sixth.headers.get('retry-after')).toBeTruthy()
    })
  })

  describe('fail-closed delivery (no silent lead loss)', () => {
    it('returns 500 when smtp mode but mail is not configured', async () => {
      mocks.mailConfigured = false
      const res = await post(validPayload(), { ip: '10.0.0.20' })
      expect(res.status).toBe(500)
      expect(mocks.sendLeadEmail).not.toHaveBeenCalled()
    })

    it('returns 500 when sendLeadEmail throws (no swallowed drop)', async () => {
      mocks.sendLeadEmail.mockRejectedValueOnce(new Error('SMTP relay down'))
      const res = await post(validPayload(), { ip: '10.0.0.21' })
      expect(res.status).toBe(500)
    })
  })
})
