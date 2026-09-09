# DEPLOY — GoDaddy VPS (Phase 17)

Production runbook for the Xanadu site on a **GoDaddy VPS**: `next build` →
`next start` behind **nginx** (TLS termination + reverse proxy) supervised by
**PM2**. Lead delivery is **email-only via GoDaddy SMTP** (no Sheets/DB — the
team mailbox is the store; see `implementation_plan.md` Phase 17).

```
visitor ──HTTPS:443──▶ nginx ──HTTP──▶ 127.0.0.1:3000 next start (PM2, fork x1)
                                              │
                                              └──TLS:465──▶ smtpout.secureserver.net ──▶ team mailbox
```

**No static export** — the live `POST /api/contact` route handler requires the
Node server. GoDaddy *shared* hosting cannot run this; the target is a **VPS**
(Ubuntu 22.04/24.04, 2 vCPU / 2 GB is plenty).

---

## 1. Provision the VPS (once)

```bash
ssh root@<VPS_IP>
apt update && apt -y upgrade
apt -y install nginx git

# Node 20.9+ (package.json engines) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt -y install nodejs
npm i -g pm2

# Firewall: only SSH + web. App binds 127.0.0.1 only — :3000 is never exposed.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable

mkdir -p /var/log/xanadu /var/www/certbot
```

DNS (in the GoDaddy dashboard): `A` record `@` → `<VPS_IP>`, `A` (or CNAME)
`www` → `<VPS_IP>`.

## 2. Code + images

```bash
git clone https://github.com/mmohamedkhaled/xanadu-website.git /var/www/xanadu
cd /var/www/xanadu
```

**Images are gitignored** (see `.gitignore` — they're managed outside the repo).
Before building, bring `public/` assets over from a machine that has them
(seeded local clones carry them on disk):

```bash
# from the machine with the assets:
rsync -av --delete public/ root@<VPS_IP>:/var/www/xanadu/public/
```

## 3. Environment (secrets — never commit)

Create **`/var/www/xanadu/.env`** (gitignored; loaded by both PM2 ≥ 5.2 via
`env_file` and by Next itself at `next start` via `@next/env`). See
`.env.example` for the full annotated list. Production minimum:

```bash
NEXT_PUBLIC_SITE_URL=https://xanadu.com
ALLOWED_ORIGINS=https://xanadu.com,https://www.xanadu.com
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USER=noreply@xanadu.com
SMTP_PASS=<mailbox password>
SMTP_FROM=Xanadu <noreply@xanadu.com>
SMTP_TO=leads@xanadu.com
# optional hardening/monitoring:
# SENTRY_DSN=...
# SENTRY_ENVIRONMENT=production
```

- `SMTP_FROM` must match `SMTP_USER` or GoDaddy rejects the send as spoofing.
- `NODE_ENV=production`, `LEAD_DELIVERY=smtp`, `TRUST_REAL_IP=1`, `PORT=3000`
  are baked into `deploy/ecosystem.config.js` — don't rely on the shell.
- **`NEXT_PUBLIC_*` vars are inlined at build time** — `.env` must exist with
  the final `NEXT_PUBLIC_SITE_URL` *before* step 4 (changing it later requires
  a rebuild).
- Do **not** set `SUBMISSIONS_*` in prod (that's the dev file-fallback only).

## 4. Build

```bash
cd /var/www/xanadu && npm ci && npm run build
```

(`npm ci` — lockfile-exact installs; the build is also the type check.)

## 5. PM2

```bash
pm2 start deploy/ecosystem.config.js
pm2 save              # persist the process list
pm2 startup systemd   # follow the printed command → starts PM2 on boot
pm2 logs xanadu       # /var/log/xanadu/*.log
```

**Never** run this app with `exec_mode: 'cluster'` or more than one instance —
the rate limiter is in-memory and each process would get its own 5/hr budget
(and `pm2 reload` zero-downtime only applies to cluster mode; use
`pm2 restart xanadu` — a few seconds of downtime is fine for a marketing site).

## 6. nginx + TLS

```bash
sudo cp deploy/nginx/xanadu.conf /etc/nginx/sites-available/xanadu.conf
sudo ln -s /etc/nginx/sites-available/xanadu.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d xanadu.com -d www.xanadu.com   # fills in + renews the certs
```

Renewals are automatic (`certbot` systemd timer) — verify with
`sudo certbot renew --dry-run`.

## 7. Verify after every deploy

- [ ] `curl -sI https://xanadu.com` — **no `X-Powered-By`**; `Strict-Transport-Security`, COOP/CORP present; `Content-Security-Policy` carries a nonce.
- [ ] `curl -sI http://xanadu.com` → 301 to https.
- [ ] **Fail-closed first**: with SMTP unset/wrong, `POST /api/contact` (with a valid Origin + `application/json`) must return **500** — then fix `.env` and `pm2 restart xanadu`.
- [ ] Full contact-flow submission from the live site → email lands in the `SMTP_TO` mailbox with `Reply-To` = submitter (that email is the lead store — nothing else is persisted).
- [ ] Rate limit: a 6th submission within an hour from the same IP → **429**; from a different IP it still passes (confirms nginx `X-Real-IP` + `TRUST_REAL_IP=1` — if both IPs 429 together, the header isn't being set).
- [ ] `pm2 status` → `xanadu` online, restarts ≈ 0; `pm2 logs xanadu` free of errors.
- [ ] Scroll journey + CTAs behave (see `walkthrough.md` → manual checks).

Erasure (GDPR/PDPL) in prod = **delete the email from the team mailbox** — there
is no programmatic store (`scripts/redact-submission.mjs` is dev-file only).

## 8. Routine ops

**Redeploy (code or copy update):**

```bash
cd /var/www/xanadu
git pull --ff-only
npm ci
npm run build
pm2 restart xanadu
```

If `public/` assets changed, re-run the rsync from step 2 **before** restarting.

**Env change:** edit `.env` → `pm2 restart xanadu` (no Vercel-style runtime env;
`NEXT_PUBLIC_*` changes need a rebuild).

**Log growth:** `pm2 install pm2-logrotate` (or add `/var/log/xanadu/*.log` to
logrotate).

**Backup note:** nothing on-disk is authoritative (leads live in the mailbox;
the repo lives on GitHub) — the only machine-specific state is `.env` and the
`public/` image assets. Keep copies of both off-box.
