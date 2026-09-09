import crypto from 'node:crypto'

// Shared by scripts/decrypt-submissions.mjs and scripts/redact-submission.mjs.

/** Decrypt a single record line. Returns the plaintext string, or null if the
 *  line isn't a valid encrypted record for this key. Handles both the current
 *  "v1:iv.ct.tag" format and the legacy bare "iv.ct.tag" form. */
export function tryDecrypt(line, key) {
  if (!key) return null
  let payload = line
  if (line.startsWith('v1:')) {
    payload = line.slice(3)
  } else {
    // Legacy format: bare "iv.ct.tag" — only attempt when it looks exactly
    // right, so ordinary plaintext isn't misclassified.
    if (line.split('.').length !== 3) return null
  }
  const parts = payload.split('.')
  if (parts.length !== 3) return null
  try {
    const [ivb, ctb, tagb] = parts
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivb, 'base64'))
    decipher.setAuthTag(Buffer.from(tagb, 'base64'))
    const plain = Buffer.concat([decipher.update(Buffer.from(ctb, 'base64')), decipher.final()])
    return plain.toString('utf8')
  } catch {
    return null
  }
}

/** Encrypt a plaintext string with AES-256-GCM → "v1:iv.ct.tag" (base64).
 *  Matches lib/leads/file.ts so re-written records stay readable by the
 *  decrypt script. */
export function encryptLine(plain, key) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return 'v1:' + [iv.toString('base64'), ct.toString('base64'), tag.toString('base64')].join('.')
}

/** Parse a 32-byte (64 hex char) key from env. Returns a Buffer or null. Throws
 *  if the value is present but malformed. Validates with a regex BEFORE
 *  Buffer.from so hex-decode truncation (e.g. a 65-char or non-hex value) can't
 *  silently shrink the key — mirrors lib/leads/file.ts. */
export function loadKey() {
  const hex = process.env.SUBMISSIONS_ENCRYPTION_KEY
  if (!hex) return null
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    console.error('SUBMISSIONS_ENCRYPTION_KEY must be 32 bytes (64 hex chars).')
    process.exit(1)
  }
  return Buffer.from(hex, 'hex')
}
