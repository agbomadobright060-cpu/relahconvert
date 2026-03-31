/**
 * WordPress upload integration.
 * Auto-initializes on every page. When ?wpsite and ?token are present:
 * 1. Auto-loads image from ?url= into the tool's file input
 * 2. Shows "Send to WordPress" floating button after any image download
 */

function getWpParams() {
  const params = new URLSearchParams(window.location.search)
  const wpsite = params.get('wpsite')
  const token = params.get('token')
  if (!wpsite || !token) return null
  return { wpsite, token }
}

export { getWpParams, createWpUploadButton }

function createWpUploadButton(getBlob, getFilename) {
  const wp = getWpParams()
  if (!wp) return null

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'margin-top:10px;'

  const btn = document.createElement('button')
  btn.textContent = 'Send to WordPress'
  btn.style.cssText = 'width:100%;padding:13px;border:none;border-radius:10px;background:#0073aa;color:#fff;font-family:"Fraunces",serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.18s;'

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

// ── Global auto-load image from ?url= into any tool ─────────────────────
;(function autoLoadFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const imgUrl = params.get('url')
  if (!imgUrl) return

  setTimeout(() => {
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') || document.querySelector('input[type="file"]')
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
          const name = imgUrl.split('/').pop().split('?')[0] || 'image.jpg'
          const file = new File([blob], name, { type: blob.type || mime })
          const dt = new DataTransfer()
          dt.items.add(file)
          fileInput.files = dt.files
          fileInput.dispatchEvent(new Event('change', { bubbles: true }))
        }, mime, 0.95)
      } catch (e) {
        fetchAndInject(imgUrl, fileInput)
      }
    }
    img.onerror = () => fetchAndInject(imgUrl, fileInput)
    img.src = imgUrl
  }, 500)

  function fetchAndInject(url, input) {
    fetch(url).then(r => r.blob()).then(blob => {
      const name = url.split('/').pop().split('?')[0] || 'image.jpg'
      const file = new File([blob], name, { type: blob.type })
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }).catch(() => {})
  }
})()

// ── Global download intercept — show "Send to WordPress" ────────────────
;(function initGlobalWpUpload() {
  const wp = getWpParams()
  if (!wp) return

  let floatingBtn = null

  // Helper: convert href to blob
  function hrefToBlob(href) {
    if (href.startsWith('blob:')) {
      return fetch(href).then(r => r.blob()).catch(() => null)
    }
    if (href.startsWith('data:')) {
      return fetch(href).then(r => r.blob()).catch(() => null)
    }
    return Promise.resolve(null)
  }

  // Intercept programmatic a.click() — this catches most tools
  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download') || this.download) {
      const href = this.href || this.getAttribute('href') || ''
      if (href.startsWith('blob:') || href.startsWith('data:')) {
        const filename = this.download || 'image.jpg'
        hrefToBlob(href).then(blob => {
          if (blob) showFloatingWpButton(blob, filename)
        })
      }
    }
    return origClick.call(this)
  }

  // Also catch user clicks on download links in the DOM
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest ? e.target.closest('a[download]') : null
    if (!anchor) return
    const href = anchor.href || ''
    if (href.startsWith('blob:') || href.startsWith('data:')) {
      const filename = anchor.download || 'image.jpg'
      hrefToBlob(href).then(blob => {
        if (blob) showFloatingWpButton(blob, filename)
      })
    }
  }, true)

  function showFloatingWpButton(blob, filename) {
    if (floatingBtn) floatingBtn.remove()

    floatingBtn = document.createElement('div')
    floatingBtn.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10000;background:#fff;border-radius:14px;padding:16px 24px;box-shadow:0 6px 24px rgba(0,0,0,0.2);border:2px solid #0073aa;font-family:"DM Sans",sans-serif;text-align:center;max-width:320px;width:90%;'

    const title = document.createElement('div')
    title.textContent = 'Send to WordPress?'
    title.style.cssText = 'font-size:14px;font-weight:600;color:#1d2327;margin-bottom:10px;'

    const btn = document.createElement('button')
    btn.textContent = 'Send to WordPress'
    btn.style.cssText = 'width:100%;padding:11px;border:none;border-radius:8px;background:#0073aa;color:#fff;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.15s;'

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

    setTimeout(() => { if (floatingBtn && floatingBtn.parentNode) floatingBtn.remove() }, 60000)
  }
})()
