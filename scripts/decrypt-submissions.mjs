// Decrypt / pretty-print contact submissions.
//
// Usage:
//   SUBMISSIONS_ENCRYPTION_KEY=<hex> node scripts/decrypt-submissions.mjs [path]
//
// - Encrypted lines are written as "v1:iv.ct.tag" (base64) and decrypted with
//   AES-256-GCM.
// - Legacy encrypted lines ("iv.ct.tag" without the v1: prefix) are also
//   handled for backward compatibility.
// - Plaintext JSON lines are passed through unchanged.
//
// The submissions file defaults to ~/.xanadu-data/contact_submissions.json
// (or SUBMISSIONS_FILE_PATH). Override the path with the first arg.
//
// Each run is appended to the access audit log (~/.xanadu-data/access.log).

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import readline from 'node:readline'
import { tryDecrypt, loadKey } from './_crypto.mjs'
import { logAccess } from './_access-log.mjs'

const filePath = process.argv[2] || process.env.SUBMISSIONS_FILE_PATH ||
  path.join(os.homedir(), '.xanadu-data', 'contact_submissions.json')

const key = loadKey()

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

// Audit: record that the stored submissions were read.
logAccess('decrypt', { file: filePath, keySet: Boolean(key) })

let hadDecryptFailure = false

const stream = fs.createReadStream(filePath, { encoding: 'utf8' })
const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })

for await (const line of rl) {
  const trimmed = line.trim()
  if (!trimmed) continue
  const plain = tryDecrypt(trimmed, key)
  if (plain !== null) {
    process.stdout.write(plain + '\n')
  } else if (key && trimmed.startsWith('v1:')) {
    // Unambiguously encrypted (new format) but failed — almost certainly a
    // wrong key. Warn loudly instead of silently printing ciphertext.
    process.stderr.write('[decrypt] failed to decrypt a v1 line (wrong key?)\n')
    hadDecryptFailure = true
    process.stdout.write(trimmed + '\n')
  } else {
    process.stdout.write(trimmed + '\n')
  }
}

if (hadDecryptFailure) {
  process.exitCode = 1
}
