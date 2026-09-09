/**
 * Per-IP rate limiting for the contact endpoint.
 *
 * Two backends:
 *  - Upstash Ratelimit (shared, correct across serverless instances) when
 *    UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set. Production on
 *    Vercel MUST use this — otherwise every serverless instance gets its own
 *    5/hr budget (N×5/hr) and the limiter is effectively bypassed.
 *  - An in-memory fixed-window limiter with an LRU cap: the dev fallback and
 *    the resilience fallback if Upstash is unreachable at runtime.
 *
 * IP keying: behind a trusted proxy (nginx injects x-real-ip; Vercel sets it
 *  reliably), opt in with TRUST_REAL_IP=1. X-Forwarded-For is never trusted:
 *  the leftmost hop is client-spoofable, which makes the per-IP limit
 *  trivially bypassable.
 */
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { isIP } from "node:net"

interface Bucket {
  count: number
  resetAt: number
}

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 5
// Hard cap on tracked keys. Bounds memory so a spoofed-IP flood (one bucket
// per fake IP) can't exhaust the heap; the least-recently-used bucket is
// evicted regardless of expiry once the cap is exceeded.
const MAX_BUCKETS = 10_000
// Sweep expired buckets at most this often, decoupled from request volume.
const SWEEP_INTERVAL_MS = 60 * 1000 // 1 minute

const buckets = new Map<string, Bucket>()
let lastSweep = 0

function sweepExpired(now: number) {
  for (const [k, b] of buckets) {
    if (now > b.resetAt) buckets.delete(k)
  }
}

// Map preserves insertion order; re-insert on access so the first entry is
// always the least-recently-used. Evict from the front to enforce cap.
function enforceCap() {
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value
    if (oldest === undefined) break
    buckets.delete(oldest)
  }
}

function rateLimitInMemory(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  // Time-based sweep: runs on the first request after the interval, regardless
  // of how many requests have arrived (closes the spoofed-IP memory blow-up).
  if (now - lastSweep >= SWEEP_INTERVAL_MS) {
    lastSweep = now
    sweepExpired(now)
  }

  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    // New window: (re)insert at the end as most-recently-used.
    buckets.delete(key)
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    enforceCap()
    return { ok: true, retryAfter: Math.round(WINDOW_MS / 1000) }
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  // Move to end so repeated use delays LRU eviction.
  buckets.delete(key)
  buckets.set(key, bucket)
  return { ok: true, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
}

// Lazily-built Upstash limiter (only when configured). Cached for the life of
// the instance so the Redis connection is reused.
let upstash: Ratelimit | null | undefined
function getUpstash(): Ratelimit | null {
  if (upstash !== undefined) return upstash
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    upstash = null
    return null
  }
  upstash = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(MAX_REQUESTS, "1 h"),
    prefix: "xanadu:contact",
  })
  return upstash
}

export async function rateLimit(key: string): Promise<{ ok: boolean; retryAfter: number }> {
  const limiter = getUpstash()
  if (!limiter) return rateLimitInMemory(key)
  try {
    const { success, reset } = await limiter.limit(key)
    return { ok: success, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) }
  } catch {
    // Upstash unreachable → degrade to the in-memory limiter (availability over
    // throttling: better to accept a few extra requests than drop all leads).
    return rateLimitInMemory(key)
  }
}

/** First syntactically-valid IPv4/IPv6 from a (possibly comma-joined,
 *  multi-valued) forwarded-IP header. Headers.get() joins repeated headers
 *  with ", "; without splitting + validating, the whole string becomes one
 *  bogus bucket key and garbage bloats the bucket map. */
export function firstValidIp(raw: string | null): string | null {
  if (!raw) return null
  for (const part of raw.split(',')) {
    const ip = part.trim().replace(/^\[|\]$/g, '') // strip IPv6 [brackets]
    if (ip && isValidIp(ip)) return ip
  }
  return null
}

export function isValidIp(s: string): boolean {
  // Delegate to Node's RFC-correct validator. A hand-rolled check accepted
  // leading-zero IPv4 octets ("1.2.3.04" → distinct bucket keys) and any
  // string containing ":" as IPv6 (unlimited keys) — both rate-limit bypasses.
  return isIP(s) !== 0
}

/** Best-effort client IP. x-real-ip / x-forwarded-for are client-controlled, so
 *  honor x-real-ip only when opted in via TRUST_REAL_IP. X-Forwarded-For is
 *  ignored entirely — its leftmost hop stays attacker-controlled even behind a
 *  proxy, so trusting it would let an attacker spoof a fresh IP per request and
 *  bypass the limit. We do NOT auto-trust on VERCEL=1 — it's a plain,
 *  manually-settable var with the same spoofing problem. */
export function getClientIp(req: Request): string {
  // Set TRUST_REAL_IP=1 on every host, including Vercel (x-real-ip is
  // platform-set and trustworthy there once opted in).
  const trustRealIp = process.env.TRUST_REAL_IP === '1'
  if (trustRealIp) {
    const realIp = firstValidIp(req.headers.get('x-real-ip'))
    if (realIp) return realIp
  }
  return 'unknown'
}
