// Erase a contact submission (GDPR / PDPL right to erasure) from the local
// dev file, by email (case-insensitive).
//
// Usage:
//   SUBMISSIONS_ENCRYPTION_KEY=<hex> node scripts/redact-submission.mjs <email> [path]
//
// - Reads every record, drops those whose `email` matches, and rewrites the
//   file (re-encrypted when a key is set, plaintext otherwise).
// - Writes via temp-file + atomic rename so the file is never left half-written
//   (the temp file is unlinked if the swap fails, so no orphan PII is left).
// - NO backup is kept by default — a copy of the pre-erasure file would retain
//   the very record being erased. Opt into an (encrypted) safety copy with
//   KEEP_REDACT_BACKUP=1.
// - Production erasure (Phase 17) is manual: leads are delivered email-only to
//   the team's GoDaddy mailbox, so erasure = deleting the email from the
//   mailbox. (Phase 10 used lib/leads/sheets.ts `deleteLeadsByEmail` — removed.)
//   This script covers the dev file fallback.
// - Each run is appended to the access audit log (~/.xanadu-data/access.log).

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import readline from 'node:readline'
import { tryDecrypt, encryptLine, loadKey } from './_crypto.mjs'
import { logAccess } from './_access-log.mjs'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node scripts/redact-submission.mjs <email> [path]')
  process.exit(1)
}

const filePath = process.argv[3] || process.env.SUBMISSIONS_FILE_PATH ||
  path.join(os.homedir(), '.xanadu-data', 'contact_submissions.json')
const key = loadKey()

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}

// Read + decode every line into plaintext JSON.
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '')
const records = []
for (const line of lines) {
  const plain = tryDecrypt(line.trim(), key)
  records.push(plain !== null ? plain : line.trim()) // decrypt, else pass through
}

let removed = 0
const kept = []
for (const plain of records) {
  let rec
  try {
    rec = JSON.parse(plain)
  } catch {
    kept.push(plain) // keep unparseable lines untouched
    continue
  }
  const recEmail = String(rec.email ?? '').trim().toLowerCase()
  if (recEmail === email) {
    removed += 1
  } else {
    kept.push(plain)
  }
}

if (removed === 0) {
  console.log(`No records matched "${email}".`)
  logAccess('redact', { file: filePath, email, removed: 0 })
  process.exit(0)
}

// Re-serialize (re-encrypt when a key is set) and write atomically.
const serialized = kept.map((plain) => (key ? encryptLine(plain, key) : plain)).join('\n') + '\n'

// Tighten a pre-existing loose parent dir (prior umask 022 run, etc.) so the
// rewrite isn't group/world-readable during the brief window — mirrors
// lib/leads/file.ts persistToFile. POSIX: mkdir/chmod mode only fully applies
// on creation, so stat + chmod when any group/other bit is set.
const dirPath = path.dirname(filePath)
const dirStat = fs.statSync(dirPath)
if ((dirStat.mode & 0o077) !== 0) {
  fs.chmodSync(dirPath, 0o700)
}

const tmp = filePath + '.tmp'
fs.writeFileSync(tmp, serialized, { mode: 0o600, encoding: 'utf8' })

// Erasure must actually erase: a plaintext `.bak` of the PRE-erasure file
// (which still contains the targeted record) defeats GDPR/PDPL right-to-
// erasure, so the backup is opt-in via KEEP_REDACT_BACKUP=1 and, when kept,
// is encrypted with the same key + 0o600 — never plaintext PII on disk.
let backupNote = ''
if (process.env.KEEP_REDACT_BACKUP === '1') {
  const bak = `${filePath}.bak`
  if (key) {
    const backupPlain = fs.readFileSync(filePath, 'utf8')
    fs.writeFileSync(bak, encryptLine(backupPlain, key) + '\n', { mode: 0o600, encoding: 'utf8' })
    backupNote = ` Encrypted backup: ${bak}`
  } else {
    fs.copyFileSync(filePath, bak)
    fs.chmodSync(bak, 0o600)
    backupNote = ` Plaintext backup: ${bak} (set SUBMISSIONS_ENCRYPTION_KEY to encrypt it)`
  }
}

try {
  fs.renameSync(tmp, filePath)
} catch (e) {
  // Never leave an orphan plaintext .tmp (it is the live PII file) if the
  // atomic swap fails.
  try { fs.unlinkSync(tmp) } catch {}
  throw e
}

console.log(`Erased ${removed} record(s) matching "${email}".${backupNote}`)
logAccess('redact', { file: filePath, email, removed, backupKept: process.env.KEEP_REDACT_BACKUP === '1' })
