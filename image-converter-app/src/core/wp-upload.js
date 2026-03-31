/**
 * WordPress upload integration.
 * Auto-initializes on every page. When ?wpsite and ?token are present,
 * intercepts image downloads and shows a "Send to WordPress" button.
 */

function getWpParams() {
  const params = new URLSearchParams(window.location.search)
  const wpsite = params.get('wpsite')
  const token = params.get('token')
  if (!wpsite || !token) return null
  return { wpsite, token }
}

// Also export for tools that manually create the button
export { getWpParams, createWpUploadButton }

function createWpUploadButton(getBlob, getFilename) {
  const wp = getWpParams()
  if (!wp) return null

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'margin-top:10px;'

  const btn = document.createElement('button')
  btn.textContent = 'Send to WordPress'
  btn.style.cssText = 'width:100%;padding:13px;border:none;border-radius:10px;background:#0073aa;color:#fff;font-family:"Fraunces",serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.18s;'
  btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#005a87' })
  btn.addEventListener('mouseleave', () => { if (!btn.disabled) btn.style.background = '#0073aa' })

  const status = document.createElement('div')
  status.style.cssText = 'font-family:"DM Sans",sans-serif;font-size:13px;margin-top:8px;text-align:center;display:none;'

  btn.addEventListener('click', async () => {
    const blob = getBlob()
    if (!blob) return
    await uploadToWp(wp, blob, getFilename(), btn, status)
  })

  wrapper.appendChild(btn)
  wrapper.appendChild(status)
  return wrapper
}

async function uploadToWp(wp, blob, filename, btn, status) {
  btn.disabled = true
  btn.textContent = 'Uploading...'
  btn.style.background = '#999'
  btn.style.cursor = 'not-allowed'
  status.style.display = 'block'
  status.style.color = 'var(--text-secondary, #666)'
  status.textContent = 'Sending image to WordPress...'

  try {
    const formData = new FormData()
    formData.append('file', blob, filename || 'relahconvert-image.jpg')
    formData.append('token', wp.token)

    const res = await fetch(wp.wpsite + '?token=' + encodeURIComponent(wp.token), {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (data.success) {
      btn.textContent = 'Sent to WordPress!'
      btn.style.background = '#46b450'
      status.style.color = '#46b450'
      status.textContent = 'Image added to your Media Library. Opening...'
      const siteUrl = new URL(wp.wpsite).origin
      window.open(siteUrl + '/wp-admin/upload.php', '_blank')
    } else {
      throw new Error(data.message || 'Upload failed')
    }
  } catch (e) {
    btn.textContent = 'Send to WordPress'
    btn.style.background = '#0073aa'
    btn.style.cursor = 'pointer'
    btn.disabled = false
    status.style.color = '#dc3232'
    status.textContent = 'Failed: ' + (e.message || 'Could not upload. Try again.')
  }
}

// ── Global auto-intercept ──────────────────────────────────────────────
// Intercepts any image download and shows "Send to WordPress" floating button
;(function initGlobalWpUpload() {
  const wp = getWpParams()
  if (!wp) return

  let lastBlob = null
  let lastFilename = 'image.jpg'
  let floatingBtn = null

  // Track blobs created via URL.createObjectURL
  const originalCreateObjectURL = URL.createObjectURL.bind(URL)
  URL.createObjectURL = function (obj) {
    if (obj instanceof Blob && obj.type && obj.type.startsWith('image/')) {
      lastBlob = obj
    }
    return originalCreateObjectURL(obj)
  }

  // Intercept anchor clicks with download attribute
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[download]')
    if (!anchor) return
    const href = anchor.href || ''
    if (href.startsWith('blob:') || href.startsWith('data:')) {
      lastFilename = anchor.download || 'image.jpg'
      // For data URLs, convert to blob
      if (href.startsWith('data:') && !lastBlob) {
        fetch(href).then(r => r.blob()).then(b => {
          lastBlob = b
          showFloatingWpButton()
        })
        return
      }
      setTimeout(() => showFloatingWpButton(), 300)
    }
  }, true)

  // Also intercept programmatic a.click() calls
  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download')) {
      const href = this.href || ''
      if (href.startsWith('blob:') || href.startsWith('data:')) {
        lastFilename = this.download || 'image.jpg'
        if (href.startsWith('data:') && !lastBlob) {
          fetch(href).then(r => r.blob()).then(b => {
            lastBlob = b
            showFloatingWpButton()
          })
        } else {
          setTimeout(() => showFloatingWpButton(), 300)
        }
      }
    }
    return origClick.call(this)
  }

  function showFloatingWpButton() {
    if (!lastBlob) return
    const blob = lastBlob
    const filename = lastFilename

    // Remove old floating button if exists
    if (floatingBtn) floatingBtn.remove()

    floatingBtn = document.createElement('div')
    floatingBtn.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10000;background:#fff;border-radius:14px;padding:16px 24px;box-shadow:0 6px 24px rgba(0,0,0,0.2);border:2px solid #0073aa;font-family:"DM Sans",sans-serif;text-align:center;animation:fadeUp 0.3s ease both;max-width:320px;width:90%;'

    const title = document.createElement('div')
    title.textContent = 'Send processed image to WordPress?'
    title.style.cssText = 'font-size:14px;font-weight:600;color:#1d2327;margin-bottom:10px;'

    const btn = document.createElement('button')
    btn.textContent = 'Send to WordPress'
    btn.style.cssText = 'width:100%;padding:11px;border:none;border-radius:8px;background:#0073aa;color:#fff;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.15s;'
    btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#005a87' })
    btn.addEventListener('mouseleave', () => { if (!btn.disabled) btn.style.background = '#0073aa' })

    const status = document.createElement('div')
    status.style.cssText = 'font-size:12px;margin-top:6px;display:none;'

    const dismiss = document.createElement('button')
    dismiss.textContent = 'Dismiss'
    dismiss.style.cssText = 'background:none;border:none;color:#999;font-size:12px;cursor:pointer;margin-top:8px;'
    dismiss.addEventListener('click', () => floatingBtn.remove())

    btn.addEventListener('click', () => uploadToWp(wp, blob, filename, btn, status))

    floatingBtn.appendChild(title)
    floatingBtn.appendChild(btn)
    floatingBtn.appendChild(status)
    floatingBtn.appendChild(dismiss)
    document.body.appendChild(floatingBtn)

    // Auto-dismiss after 30 seconds
    setTimeout(() => { if (floatingBtn) floatingBtn.remove() }, 30000)
  }
})()
