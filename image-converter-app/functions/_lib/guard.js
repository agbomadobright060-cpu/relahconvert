// Shared request guard for all paid-API broker functions
// (screenshot.js / remove-bg.js / convert/[tool]/*). Without these checks,
// the brokers expose third-party paid APIs (ApiFlash, Remove.bg, CloudConvert)
// to anyone who can hit our /api/* endpoints — which is exactly how the
// ApiFlash key was drained on 2026-05-24.
//
// Defense layers here (server-side only; rate limiting at the CF dashboard
// is a separate third layer):
//   1. Origin header must match relahconvert.com (browser-enforced for
//      cross-origin POSTs).
//   2. Fallback: Referer header must originate from relahconvert.com
//      (covers same-origin requests where Origin may be omitted).
//   3. CORS responses set Access-Control-Allow-Origin to the matched
//      origin only — never wildcard. Browsers will block cross-origin
//      response reads from non-relahconvert origins even if a request
//      slips through (defense in depth).
//
// Bypass note: a determined attacker using curl/Node can forge Origin and
// Referer headers. The server-side check here stops opportunistic and
// browser-based abuse. Use Cloudflare's Rate Limiting product on the
// /api/* path to backstop forged-header attacks. Without rate limiting,
// the only protection against forged headers is per-key quota at the
// upstream API.

const ALLOWED_ORIGINS = new Set([
  'https://relahconvert.com',
  'https://www.relahconvert.com',
])

export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin') || ''
  if (ALLOWED_ORIGINS.has(origin)) return true

  // Some same-origin requests omit Origin — fall back to Referer.
  const referer = request.headers.get('Referer') || ''
  for (const allowed of ALLOWED_ORIGINS) {
    if (referer.startsWith(allowed + '/')) return true
  }
  return false
}

// Returns CORS headers echoing the matched origin (never wildcard).
// Pass the request so we can echo Origin: relahconvert.com vs www.
export function corsHeaders(request) {
  const origin = request.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://relahconvert.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

export function forbidden() {
  return new Response(JSON.stringify({ error: 'forbidden' }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://relahconvert.com',
    },
  })
}
