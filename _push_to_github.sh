#!/usr/bin/env bash
set -e
REPO_DIR="/home/runner/workspace/cafe-ordering"
REMOTE_URL="https://${GITHUB_PAT}@github.com/k89293676-creator/Cafe-ordering.git"

cd "$REPO_DIR"

if [ ! -d ".git" ]; then
  git init -b main
  git remote add origin "$REMOTE_URL"
else
  git remote set-url origin "$REMOTE_URL"
fi

git config user.email "cafe-portal@replit.com"
git config user.name "Cafe Portal Bot"

git add -A
git commit -m "security: comprehensive hardening against external attacks

Rate limiting (Flask-Limiter):
- Login: 15/min, 50/hr  — blocks brute-force credential attacks
- Signup: 5/hr           — prevents account-farming abuse
- OTP verify: 5/15min   — prevents OTP enumeration
- Checkout API: 20/min   — prevents order spam
- Table view: 60/min     — general abuse protection
- Global default: 300/day, 60/hr

CSRF protection (Flask-WTF):
- CSRFProtect enabled globally for all POST forms
- CSRF tokens added to every form in every template
- JSON API endpoints (/api/menu, /api/order-preview, /api/checkout) explicitly exempted

Security headers (Flask-Talisman + custom after_request):
- Content-Security-Policy: strict self-only for scripts, fonts from Google
- X-Frame-Options: DENY  — prevent clickjacking
- X-Content-Type-Options: nosniff — prevent MIME sniffing
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation/camera/mic/payment/usb all denied
- Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy: same-origin
- HSTS enabled in production (max-age 1 year, includeSubDomains)
- Server header masked as 'CafePortal' — hides framework version
- X-Permitted-Cross-Domain-Policies: none

Session hardening:
- SESSION_COOKIE_HTTPONLY: True — JS cannot read session cookie
- SESSION_COOKIE_SAMESITE: Lax — CSRF vector reduced
- SESSION_COOKIE_SECURE: True in production — cookie only over HTTPS
- PERMANENT_SESSION_LIFETIME: 8h — auto-expiry
- session.clear() on login to prevent session fixation

Input validation:
- All route params validated with re.fullmatch() before use
- String inputs truncated to safe lengths (username 64, password 256, etc.)
- Price clamped to 0–9999.99, tags limited to 10 × 50 chars each
- Menu JSON size capped at 50 KB

OTP security:
- Replaced random.randint with secrets.randbelow (cryptographically secure)
- OTP expires after 10 minutes (stored as UTC ISO timestamp)
- OTP comparison via secrets.compare_digest (timing-safe)
- OTP session cleared after successful verification

Password strength:
- Minimum 8 characters with at least one letter and one digit
- Username format validated (letters, digits, _, -, . only)

Request size limit:
- MAX_CONTENT_LENGTH: 2MB — prevents large payload / DoS attacks

Security event logging:
- LOGIN_SUCCESS / LOGIN_FAILURE (with IP)
- SIGNUP_OTP_ISSUED / SIGNUP_SUCCESS
- OTP_FAILURE / OTP_EXPIRED
- UNAUTHORISED_ACCESS
- CSRF_VIOLATION
- RATE_LIMIT_HIT
- ORDER_PLACED

CSP compliance:
- Removed all inline onclick handlers from dashboard template
- Created static/js/dashboard.js with event delegation (switchTab, toggleEdit, data-confirm)
- Only 'unsafe-inline' allowed for style-src (needed for style= attributes in Jinja)
- script-src: 'self' only — no inline scripts

Error pages:
- 400, 403, 404, 429, 500 — generic messages, no stack traces exposed"

git push -u origin main --force
echo "Done! Security changes pushed to GitHub."
