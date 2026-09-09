/**
 * PM2 process definition for the Xanadu site (Phase 17 — GoDaddy VPS).
 * Usage (from the repo root):  pm2 start deploy/ecosystem.config.js
 * Full runbook: DEPLOY.md
 */
const path = require('path')

module.exports = {
  apps: [
    {
      name: 'xanadu',
      cwd: path.join(__dirname, '..'),

      // Run the Next server binary directly (not `npm start`) so PM2 owns the
      // process tree and forwards signals cleanly for graceful restarts.
      script: './node_modules/next/dist/bin/next',
      args: 'start --hostname 127.0.0.1 --port 3000',

      // SINGLE fork instance is load-bearing:
      //  - the rate limiter is in-memory (lib/rateLimit.ts) — N processes = N x 5/hr budgets
      //  - the SMTP transporter is cached per-process (lib/leads/mail.ts)
      // Never switch to exec_mode: 'cluster' or instances > 1 here without moving
      // rate limiting to Upstash first (see .env.example → Rate limiting).
      exec_mode: 'fork',
      instances: 1,

      // Prod posture baked in (hardening-audit H2/H3) so fail-closed delivery and
      // per-IP rate limiting don't depend on the launcher's shell env:
      //  - NODE_ENV=production + LEAD_DELIVERY=smtp → leads are emailed, fail-closed 500 on SMTP failure
      //  - TRUST_REAL_IP=1 → honor the x-real-ip header nginx injects (deploy/nginx/*.conf)
      // Secrets (SMTP_*, SENTRY_DSN, ...) live in the gitignored .env at the repo root.
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        LEAD_DELIVERY: 'smtp',
        TRUST_REAL_IP: '1',
      },
      // Next.js also loads .env / .env.production from cwd itself at `next start`
      // (@next/env); env_file additionally covers PM2 >= 5.2 for non-Next tooling.
      env_file: '.env',

      autorestart: true,
      min_uptime: '30s',
      max_restarts: 10,
      max_memory_restart: '400M',
      kill_timeout: 10000, // let in-flight requests (incl. awaited SMTP sends) finish
      time: true, // timestamp log lines
      out_file: '/var/log/xanadu/out.log',
      error_file: '/var/log/xanadu/error.log',
    },
  ],
}
