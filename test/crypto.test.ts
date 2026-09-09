import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHash } from 'node:crypto'
import { getEncryptionKey, encryptLine } from '../lib/leads/file'
import { tryDecrypt, encryptLine as scriptEncryptLine, loadKey } from '../scripts/_crypto.mjs'

const VALID_KEY_HEX = createHash('sha256').update('test-key-xanadu').digest('hex') // 64 hex chars

describe('getEncryptionKey', () => {
  afterEach(() => delete process.env.SUBMISSIONS_ENCRYPTION_KEY)

  it('returns null when no key is set (dev plaintext fallback)', () => {
    delete process.env.SUBMISSIONS_ENCRYPTION_KEY
    expect(getEncryptionKey()).toBeNull()
  })
  it('returns a 32-byte Buffer for a valid 64-hex key', () => {
    process.env.SUBMISSIONS_ENCRYPTION_KEY = VALID_KEY_HEX
    const key = getEncryptionKey()
    expect(Buffer.isBuffer(key)).toBe(true)
    expect(key!.length).toBe(32)
  })
  it('throws on a malformed (too short) key — no silent downgrade', () => {
    process.env.SUBMISSIONS_ENCRYPTION_KEY = 'abcd'
    expect(() => getEncryptionKey()).toThrow()
  })
  it('throws on an over-length key (would be silently truncated by hex decode)', () => {
    process.env.SUBMISSIONS_ENCRYPTION_KEY = VALID_KEY_HEX + 'ab'
    expect(() => getEncryptionKey()).toThrow()
  })
  it('throws on non-hex content', () => {
    process.env.SUBMISSIONS_ENCRYPTION_KEY = 'z'.repeat(64)
    expect(() => getEncryptionKey()).toThrow()
  })
})

describe('AES-256-GCM round-trip', () => {
  beforeEach(() => {
    process.env.SUBMISSIONS_ENCRYPTION_KEY = VALID_KEY_HEX
  })
  afterEach(() => delete process.env.SUBMISSIONS_ENCRYPTION_KEY)

  it('encrypts and decrypts back to the original plaintext', () => {
    const key = loadKey()!
    const plain = JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
    const ct = encryptLine(plain, key)
    expect(ct.startsWith('v1:')).toBe(true)
    expect(tryDecrypt(ct, key)).toBe(plain)
  })

  it('produces a different ciphertext each time (random IV) but decrypts identically', () => {
    const key = loadKey()!
    const plain = 'stable payload'
    const a = encryptLine(plain, key)
    const b = encryptLine(plain, key)
    expect(a).not.toBe(b) // random IV
    expect(tryDecrypt(a, key)).toBe(plain)
    expect(tryDecrypt(b, key)).toBe(plain)
  })

  it('file.ts encryptLine and scripts/_crypto.mjs encryptLine are interchangeable', () => {
    const key = loadKey()!
    const plain = 'cross-module compatibility'
    // lib/leads/file.ts encrypts → script decrypts, and vice-versa.
    expect(tryDecrypt(encryptLine(plain, key), key)).toBe(plain)
    expect(tryDecrypt(scriptEncryptLine(plain, key), key)).toBe(plain)
  })

  it('fails to decrypt with a wrong key (auth tag mismatch)', () => {
    const key = loadKey()!
    const wrong = Buffer.from('0'.repeat(64), 'hex')
    const ct = encryptLine('secret', key)
    expect(tryDecrypt(ct, wrong)).toBeNull()
  })

  it('rejects a tampered ciphertext (GCM integrity)', () => {
    const key = loadKey()!
    const ct = encryptLine('secret', key)
    const tampered = ct.slice(0, -4) + 'AAAA'
    expect(tryDecrypt(tampered, key)).toBeNull()
  })
})
