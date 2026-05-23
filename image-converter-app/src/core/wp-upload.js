/**
 * WordPress upload integration.
 *
 * Supports TWO authentication flows side-by-side:
 *
 *   1. New Application Passwords flow (PDF/Office Tools plugin v1.0.1+):
 *      URL params: ?handoff=<token>&site=<wp-site>
 *      On page load we exchange the single-use 60-second handoff token
 *      for the user's stored app password via the plugin's /handoff REST
 *      endpoint. Credentials live in JS memory only. Uploads go to the
 *      standard /wp-json/wp/v2/media endpoint via HTTP Basic Auth — no
 *      custom plugin auth code involved.
 *
 *   2. Legacy custom-endpoint flow (Image Tools plugin v1.0.x):
 *      URL params: ?wpsite=<custom-endpoint>&token=<token>
 *      Direct POST to the plugin's own REST endpoint with the token. This
 *      path is preserved for backward compatibility while the Image Tools
 *      plugin still uses the older auth pattern.
 *
 * Both flows do the same things:
 *   - Auto-load file from ?url= into the tool's file input
 *   - Inject "Send to WordPress" inline button next to <a download> elements
 *   - Intercept programmatic a.click() to show a floating prompt
 *   - Suppress prompts for .zip downloads
 */

// Suppress the "Send to WordPress?" prompt for .zip downloads.
// WordPress rejects .zip uploads from non-admins, and a .zip in the Media
// Library isn't what the user wanted anyway — they wanted the bundled files,
// not the archive. Silent failure here would generate confused support
// requests, so we don't offer the prompt for ZIPs at all.
function isZipDownload(filename) {
  return /\.zip$/i.test(filename || '')
}

/**
 * Parse the WordPress integration params from the URL.
 * Returns null if neither flow's params are present.
 */
function getWpParams() {
  const params = new URLSearchParams(window.location.search)

  // New flow: Application Passwords handoff
  const handoff = params.get('handoff')
  const site = params.get('site')
  if (handoff && site) {
    return { flow: 'app-password', handoff, site, creds: null }
  }

  // Legacy flow: custom endpoint + token (Image Tools plugin)
  const wpsite = params.get('wpsite')
  const token = params.get('token')
  if (wpsite && token) {
    return { flow: 'legacy-token', wpsite, token }
  }

  return null
}

// Module-level singletons so multiple callers (or duplicate IIFE
// invocations if the bundler ends up importing wp-upload.js from more
// than one chunk) share the same handoff result instead of each firing
// their own POST. The handoff token is SINGLE-USE on the server side —
// the first POST consumes it; a duplicate POST would get 401 invalid_token.
let _handoffResult = null
let _handoffPromise = null

/**
 * Exchange the handoff token for user credentials. The result is cached
 * at module scope; concurrent callers share the in-flight promise.
 */
async function fetchHandoffCreds(wp) {
  if (!wp || wp.flow !== 'app-password') return wp
  if (wp.creds) return wp

  // Already-completed fetch from a prior caller.
  if (_handoffResult) {
    wp.creds = _handoffResult
    return wp
  }

  // First caller wins — kicks off the fetch; everyone else awaits it.
  if (!_handoffPromise) {
    _handoffPromise = (async () => {
      try {
        const endpoint = wp.site.replace(/\/+$/, '') + '/wp-json/relahconvert-pdf/v1/handoff'
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: wp.handoff }),
        })
        if (!res.ok) {
          console.warn('[rc-wp] handoff failed:', res.status)
          return null
        }
        const data = await res.json()
        if (!data || !data.user_login || !data.app_password) {
          console.warn('[rc-wp] handoff response missing credentials')
          return null
        }
        return data
      } catch (e) {
        console.warn('[rc-wp] handoff error:', e && e.message)
        return null
      }
    })()
  }

  const data = await _handoffPromise
  if (data) {
    _handoffResult = data
    wp.creds = data
  }
  return wp
}

/**
 * Upload a blob to the user's WordPress Media Library using the
 * appropriate auth flow.
 */
async function uploadToWp(wp, blob, filename) {
  if (wp.flow === 'app-password') {
    if (!wp.creds) throw new Error('Not connected')
    const creds = wp.creds
    const auth = btoa(`${creds.user_login}:${creds.app_password}`)
    const url = creds.site_url.replace(/\/+$/, '') + '/wp-json/wp/v2/media'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename || 'file')}"`,
        'Content-Type': blob.type || 'application/octet-stream',
      },
      body: blob,
    })
    if (!res.ok) {
      let msg = 'Upload failed (' + res.status + ')'
      try { const j = await res.json(); if (j && j.message) msg = j.message } catch (_) {}
      throw new Error(msg)
    }
    const data = await res.json()
    return { success: true, attachment_id: data.id, url: data.source_url }
  }

  // Legacy flow
  const formData = new FormData()
  formData.append('file', blob, filename || 'file')
  formData.append('token', wp.token)
  const res = await fetch(wp.wpsite + '?token=' + encodeURIComponent(wp.token), {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Upload failed')
  return data
}

/**
 * Get the user's wp-admin/upload.php URL for the "open Media Library" step
 * after a successful send.
 */
function getAdminUploadUrl(wp) {
  if (wp.flow === 'app-password' && wp.creds) {
    return wp.creds.site_url.replace(/\/+$/, '') + '/wp-admin/upload.php'
  }
  if (wp.flow === 'legacy-token') {
    try { return new URL(wp.wpsite).origin + '/wp-admin/upload.php' } catch (_) { return '' }
  }
  return ''
}

export { getWpParams, createWpUploadButton }

function createWpUploadButton(getBlob, getFilename) {
  const wp = getWpParams()
  if (!wp) return null
  return buildWpButton(wp, getBlob, getFilename)
}

function buildWpButton(wp, getBlob, getFilename) {
  const btn = document.createElement('button')
  btn.textContent = 'Send to WordPress'
  btn.className = 'relahconvert-wp-btn'
  btn.style.cssText = 'width:100%;padding:13px;border:none;border-radius:10px;background:#0073aa;color:#fff;font-family:"Fraunces",serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.18s;margin-top:8px;display:block;text-align:center;box-sizing:border-box;'

  const status = document.createElement('div')
  status.style.cssText = 'font-family:"DM Sans",sans-serif;font-size:13px;margin-top:6px;text-align:center;display:none;'

  btn.addEventListener('click', async (e) => {
    e.preventDefault()
    // Guard against rapid double-clicks.
    if (btn.disabled) return
    btn.disabled = true

    // getBlob may be sync (returns Blob) OR async (returns Promise<Blob>).
    // Await the Promise case so we always pass a real Blob into uploadToWp.
    let blob = typeof getBlob === 'function' ? getBlob() : getBlob
    if (blob && typeof blob.then === 'function') blob = await blob
    if (!blob) { btn.disabled = false; return }

    const filename = typeof getFilename === 'function' ? getFilename() : getFilename

    btn.textContent = 'Uploading...'
    btn.style.background = '#999'
    btn.style.cursor = 'not-allowed'
    status.style.display = 'block'
    status.style.color = '#666'
    status.textContent = 'Sending to WordPress...'

    try {
      const data = await uploadToWp(wp, blob, filename || 'file')
      if (data && data.success) {
        btn.textContent = 'Sent to WordPress!'
        btn.style.background = '#46b450'
        status.style.color = '#46b450'
        status.textContent = 'Added to your Media Library.'
        const adminUrl = getAdminUploadUrl(wp)
        if (adminUrl) window.open(adminUrl, '_blank')
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      btn.textContent = 'Send to WordPress'
      btn.style.background = '#0073aa'
      btn.style.cursor = 'pointer'
      btn.disabled = false
      status.style.color = '#dc3232'
      status.textContent = 'Failed: ' + (err && err.message ? err.message : 'Could not upload.')
    }
  })

  const wrapper = document.createElement('div')
  wrapper.className = 'relahconvert-wp-wrapper'
  wrapper.appendChild(btn)
  wrapper.appendChild(status)
  return wrapper
}

// ── Smart file-input selector — picks the input matching the URL's extension ──
function pickFileInput(url) {
  const inputs = Array.from(document.querySelectorAll('input[type="file"]'))
  if (inputs.length === 0) return null
  if (inputs.length === 1) return inputs[0]

  const ext = (url.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase()
  const tokens = {
    pdf:  ['pdf'],
    docx: ['wordprocessingml', '.docx', 'msword'],
    doc:  ['msword', '.doc'],
    xlsx: ['spreadsheetml', '.xlsx', 'ms-excel'],
    xls:  ['ms-excel', '.xls'],
    pptx: ['presentationml', '.pptx', 'ms-powerpoint'],
    ppt:  ['ms-powerpoint', '.ppt'],
    jpg:  ['image', 'jpeg', 'jpg'],
    jpeg: ['image', 'jpeg', 'jpg'],
    png:  ['image', 'png'],
    webp: ['image', 'webp'],
    gif:  ['image', 'gif'],
  }
  const wanted = tokens[ext] || ['image']
  for (const tok of wanted) {
    const hit = inputs.find(inp => (inp.accept || '').toLowerCase().includes(tok))
    if (hit) return hit
  }
  return inputs[0]
}

// ── Global auto-load file from ?url= into any tool ─────────────────────
;(function autoLoadFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const imgUrl = params.get('url')
  if (!imgUrl) return

  setTimeout(() => {
    const fileInput = pickFileInput(imgUrl)
    if (!fileInput) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth; c.height = img.naturalHeight
        c.getContext('2d').drawImage(img, 0, 0)
        const mime = imgUrl.match(/\.png$/i) ? 'image/png' : 'image/jpeg'
        c.toBlob(blob => {
          if (!blob) return
          injectFile(blob, imgUrl, fileInput)
        }, mime, 0.95)
      } catch (e) {
        fetchAndInject(imgUrl, fileInput)
      }
    }
    img.onerror = () => fetchAndInject(imgUrl, fileInput)
    img.src = imgUrl
  }, 500)

  function injectFile(blob, url, input) {
    const name = url.split('/').pop().split('?')[0] || 'image.jpg'
    const file = new File([blob], name, { type: blob.type })
    const dt = new DataTransfer()
    dt.items.add(file)
    input.files = dt.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function fetchAndInject(url, input) {
    fetch(url).then(r => r.blob()).then(blob => injectFile(blob, url, input)).catch(() => {})
  }
})()

// ── Watch for download links and add "Send to WordPress" button ──────────
;(async function watchForDownloads() {
  let wp = getWpParams()
  if (!wp) return

  // For the new flow, exchange handoff token for credentials before any
  // upload button can be useful. If this fails, fall back to no button.
  if (wp.flow === 'app-password') {
    wp = await fetchHandoffCreds(wp)
    if (!wp || !wp.creds) {
      console.warn('[rc-wp] no credentials, Send-to-WordPress disabled')
      return
    }
  }

  const processed = new WeakSet()

  function findAndAttach() {
    const anchors = document.querySelectorAll('a[download], a[id*="download"], a[class*="download"]')
    anchors.forEach(a => {
      if (processed.has(a)) return
      const isDownload = a.hasAttribute('download') || a.id.includes('download') || a.className.includes('download')
      const isVisible = a.offsetParent !== null && a.style.display !== 'none'
      if (!isDownload || !isVisible) return
      // Skip .zip downloads — see isZipDownload() comment.
      if (isZipDownload(a.download || a.getAttribute('download') || a.href || '')) return

      processed.add(a)

      // buildWpButton's own click handler now awaits async getBlob, so we
      // don't add a second handler here — adding one caused a double-fire
      // (500 then 201) on the WP REST upload because both handlers ran on
      // a single click.
      const wpBtn = buildWpButton(wp,
        () => {
          const h = a.href || ''
          if (h.startsWith('blob:') || h.startsWith('data:')) {
            return fetch(h).then(r => r.blob()).catch(() => null)
          }
          return null
        },
        () => a.download || 'file'
      )

      if (a.parentNode) {
        a.parentNode.insertBefore(wpBtn, a.nextSibling)
      }
    })
  }

  setInterval(findAndAttach, 1000)

  const observer = new MutationObserver(() => findAndAttach())
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'display', 'href'] })

  // ── Intercept programmatic a.click() for tools that don't use persistent links ──
  let lastDownloadBlob = null
  let lastDownloadFilename = 'file'
  let floatingWpBtn = null

  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.download || this.hasAttribute('download')) {
      const href = this.href || this.getAttribute('href') || ''
      const dlName = this.download || ''
      if (isZipDownload(dlName) || isZipDownload(href)) {
        return origClick.call(this)
      }
      if (href.startsWith('blob:') || href.startsWith('data:')) {
        lastDownloadFilename = dlName || 'file'
        fetch(href).then(r => r.blob()).then(blob => {
          lastDownloadBlob = blob
          showFloatingWpBtn()
        }).catch(() => {})
      }
    }
    return origClick.call(this)
  }

  function showFloatingWpBtn() {
    if (!lastDownloadBlob) return
    if (floatingWpBtn) floatingWpBtn.remove()

    const blob = lastDownloadBlob
    const filename = lastDownloadFilename

    floatingWpBtn = document.createElement('div')
    floatingWpBtn.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10000;background:#fff;border-radius:14px;padding:16px 24px;box-shadow:0 6px 24px rgba(0,0,0,0.2);border:2px solid #0073aa;font-family:"DM Sans",sans-serif;text-align:center;max-width:320px;width:90%;'

    const title = document.createElement('div')
    title.textContent = 'Send to WordPress?'
    title.style.cssText = 'font-size:14px;font-weight:600;color:#1d2327;margin-bottom:10px;'

    const btn = document.createElement('button')
    btn.textContent = 'Send to WordPress'
    btn.style.cssText = 'width:100%;padding:11px;border:none;border-radius:8px;background:#0073aa;color:#fff;font-weight:700;font-size:14px;cursor:pointer;'

    const status = document.createElement('div')
    status.style.cssText = 'font-size:12px;margin-top:6px;display:none;'

    const dismiss = document.createElement('button')
    dismiss.textContent = 'Dismiss'
    dismiss.style.cssText = 'background:none;border:none;color:#999;font-size:12px;cursor:pointer;margin-top:8px;'
    dismiss.addEventListener('click', () => floatingWpBtn.remove())

    btn.addEventListener('click', async () => {
      btn.disabled = true
      btn.textContent = 'Uploading...'
      btn.style.background = '#999'
      status.style.display = 'block'
      status.textContent = 'Sending...'

      try {
        const data = await uploadToWp(wp, blob, filename)
        if (data && data.success) {
          btn.textContent = 'Sent!'
          btn.style.background = '#46b450'
          status.style.color = '#46b450'
          status.textContent = 'Added to Media Library.'
          const adminUrl = getAdminUploadUrl(wp)
          if (adminUrl) window.open(adminUrl, '_blank')
        } else { throw new Error('Failed') }
      } catch (err) {
        btn.textContent = 'Send to WordPress'
        btn.style.background = '#0073aa'
        btn.disabled = false
        status.style.color = '#dc3232'
        status.textContent = 'Failed: ' + (err && err.message ? err.message : 'Could not upload.')
      }
    })

    floatingWpBtn.appendChild(title)
    floatingWpBtn.appendChild(btn)
    floatingWpBtn.appendChild(status)
    floatingWpBtn.appendChild(dismiss)
    document.body.appendChild(floatingWpBtn)

    setTimeout(() => { if (floatingWpBtn && floatingWpBtn.parentNode) floatingWpBtn.remove() }, 60000)
  }
})()
