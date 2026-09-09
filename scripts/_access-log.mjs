import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/**
 * Append-only access audit log for the lead-data scripts. Makes the privacy
 * policy's "access is limited to authorized team members and audit-logged when
 * the stored data is read or modified" claim true and auditable.
 *
 * Defaults to ~/.xanadu-data/access.log (override with ACCESS_LOG_PATH). Lives
 * outside the repo alongside the submissions file, perms 0600.
 */

const LOG_PATH =
  process.env.ACCESS_LOG_PATH || path.join(os.homedir(), '.xanadu-data', 'access.log')

/** Best-effort: logging must never block or fail the calling operation. */
export function logAccess(action, detail) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true })
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      actor: os.userInfo().username,
      host: os.hostname(),
      action,
      detail,
    })
    fs.appendFileSync(LOG_PATH, entry + '\n', { mode: 0o600, encoding: 'utf8' })
  } catch {
    // Swallow — never break decrypt/redact because logging failed.
  }
}
