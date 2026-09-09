import fs from "fs/promises"
import path from "path"
import os from "os"
import crypto from "node:crypto"
import type { Lead } from "./types"

/**
 * Dev-only lead persistence: append the lead to a local AES-256-GCM encrypted
 * file outside the repo. This is the zero-setup local-dev fallback — production
 * never reaches it (Phase 17: the route delivers leads by GoDaddy SMTP email
 * and fails closed if SMTP is misconfigured; Phase 10 referenced an ephemeral
 * serverless FS).
 *
 * Read entries with `scripts/decrypt-submissions.mjs`.
 */

// Serialize concurrent writes within this process so appends never interleave.
let writeChain: Promise<void> = Promise.resolve()
function appendSerialized(file: string, data: string): Promise<void> {
  // Open in append mode with mode 0o600 so the file is created with the correct
  // restrictive permissions atomically. POSIX only applies the mode on CREATION,
  // though: if the file already exists (a prior plaintext write under a no-key
  // config, a backup restore, an earlier umask 022 run) it may still be
  // group/world-readable. Tighten it via fchmod on the open fd whenever any
  // group/other bit is set — no-op on a freshly-created 0o600 file, and it
  // closes the PII confidentiality gap on a pre-existing looser file.
  const run = async (): Promise<void> => {
    const fh = await fs.open(file, "a", 0o600)
    try {
      const { mode } = await fh.stat()
      if ((mode & 0o077) !== 0) {
        await fh.chmod(0o600)
      }
      await fh.appendFile(data, "utf8")
    } finally {
      await fh.close()
    }
  }
  writeChain = writeChain.then(run, run)
  return writeChain
}

/** Resolve a path's real (symlink-free, on-disk-cased) form. Falls back to the
 *  parent dir's real path joined with the basename when the path doesn't exist
 *  yet (the normal first-write case), so a symlinked directory is still caught. */
async function realpathSafe(p: string): Promise<string> {
  try {
    return await fs.realpath(p)
  } catch {
    const parent = await fs.realpath(path.dirname(p)).catch(() => path.dirname(p))
    return path.join(parent, path.basename(p))
  }
}

/** Resolve the submissions file path. Lives OUTSIDE the repo so PII never
 *  dirties the working tree. Override with SUBMISSIONS_FILE_PATH (resolved
 *  absolutely and rejected if it points inside the repo). Both the candidate
 *  and the repo root are resolved with fs.realpath() first, so a symlinked
 *  override path can't smuggle PII back into the tree and casing differences
 *  on case-insensitive filesystems can't bypass the boundary check. */
async function getFilePath(): Promise<string> {
  const override = process.env.SUBMISSIONS_FILE_PATH
  const candidate = override
    ? path.resolve(override)
    : path.join(os.homedir(), ".xanadu-data", "contact_submissions.json")

  const cwd = await realpathSafe(process.cwd())
  const real = await realpathSafe(candidate)
  if (real === cwd || real.startsWith(cwd + path.sep)) {
    throw new Error("SUBMISSIONS_FILE_PATH must point outside the repository.")
  }
  return candidate
}

/** 32-byte AES-256 key from env (hex). Absent → null (plaintext + warning, dev
 *  only); set but malformed → throws so PII is never silently downgraded to a
 *  weak key. The regex runs BEFORE Buffer.from: hex decoding silently truncates
 *  non-hex/over-length input, so a length-only guard would accept a weak key. */
export function getEncryptionKey(): Buffer | null {
  const raw = process.env.SUBMISSIONS_ENCRYPTION_KEY
  if (!raw) return null
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error("SUBMISSIONS_ENCRYPTION_KEY is set but invalid (must be exactly 64 hex chars).")
  }
  return Buffer.from(raw, "hex")
}

export function encryptLine(plain: string, key: Buffer): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return "v1:" + [iv.toString("base64"), ct.toString("base64"), tag.toString("base64")].join(".")
}

export async function persistToFile(lead: Lead): Promise<void> {
  const filePath = await getFilePath()
  const dirPath = path.dirname(filePath)
  await fs.mkdir(dirPath, { recursive: true, mode: 0o700 })
  // mkdir's mode only applies on creation; tighten a pre-existing dir that was
  // left group/world-accessible (prior umask 022 run, backup restore, etc.) so
  // the PII file's parent isn't listable/traversable by group or others.
  const dirStat = await fs.stat(dirPath)
  if ((dirStat.mode & 0o077) !== 0) {
    await fs.chmod(dirPath, 0o700)
  }

  const plain = JSON.stringify(lead)
  const key = getEncryptionKey()
  if (key) {
    await appendSerialized(filePath, encryptLine(plain, key) + "\n")
  } else {
    console.warn(
      "[contact] SUBMISSIONS_ENCRYPTION_KEY not set — writing plaintext (dev file fallback). Set it to keep PII encrypted at rest."
    )
    await appendSerialized(filePath, plain + "\n")
  }
}
