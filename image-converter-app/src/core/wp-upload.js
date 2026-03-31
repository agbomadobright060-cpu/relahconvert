/**
 * WordPress upload integration.
 * Auto-initializes on every page. When ?wpsite and ?token are present:
 * 1. Auto-loads image from ?url= into the tool's file input
 * 2. Watches for download links and adds "Send to WordPress" button next to them
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
    const blob = typeof getBlob === 'function' ? getBlob() : getBlob
    if (!blob) return
    const filename = typeof getFilename === 'function' ? getFilename() : getFilename

    btn.disabled = true
    btn.textContent = 'Uploading...'
    btn.style.background = '#999'
    btn.style.cursor = 'not-allowed'
    status.style.display = 'block'
    status.style.color = '#666'
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
        status.textContent = 'Image added to your Media Library.'
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
      status.textContent = 'Failed: ' + (e.message || 'Could not upload.')
    }
  })

  const wrapper = document.createElement('div')
  wrapper.className = 'relahconvert-wp-wrapper'
  wrapper.appendChild(btn)
  wrapper.appendChild(status)
  return wrapper
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
;(function watchForDownloads() {
  const wp = getWpParams()
  if (!wp) return

  // Track which elements we've already added a WP button to
  const processed = new WeakSet()

  function findAndAttach() {
    // Find all visible download links (a[download] or a with download-like text)
    const anchors = document.querySelectorAll('a[download], a[id*="download"], a[class*="download"]')
    anchors.forEach(a => {
      if (processed.has(a)) return
      // Only care about blob/data URLs or visible download buttons
      const href = a.href || ''
      const isDownload = a.hasAttribute('download') || a.id.includes('download') || a.className.includes('download')
      const isVisible = a.offsetParent !== null && a.style.display !== 'none'
      if (!isDownload || !isVisible) return

      processed.add(a)

      const wpBtn = buildWpButton(wp,
        () => {
          const h = a.href || ''
          if (h.startsWith('blob:') || h.startsWith('data:')) {
            return fetch(h).then(r => r.blob()).catch(() => null)
          }
          return null
        },
        () => a.download || 'image.jpg'
      )

      // Make the getBlob async-compatible
      const realBtn = wpBtn.querySelector('button')
      const realStatus = wpBtn.querySelector('div')
      realBtn.removeEventListener('click', realBtn._handler)
      realBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        const h = a.href || ''
        if (!h.startsWith('blob:') && !h.startsWith('data:')) return

        realBtn.disabled = true
        realBtn.textContent = 'Uploading...'
        realBtn.style.background = '#999'
        realBtn.style.cursor = 'not-allowed'
        realStatus.style.display = 'block'
        realStatus.style.color = '#666'
        realStatus.textContent = 'Sending image to WordPress...'

        try {
          const blob = await fetch(h).then(r => r.blob())
          const filename = a.download || 'image.jpg'
          const formData = new FormData()
          formData.append('file', blob, filename)
          formData.append('token', wp.token)

          const res = await fetch(wp.wpsite + '?token=' + encodeURIComponent(wp.token), {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()

          if (data.success) {
            realBtn.textContent = 'Sent to WordPress!'
            realBtn.style.background = '#46b450'
            realStatus.style.color = '#46b450'
            realStatus.textContent = 'Image added to your Media Library.'
            const siteUrl = new URL(wp.wpsite).origin
            window.open(siteUrl + '/wp-admin/upload.php', '_blank')
          } else {
            throw new Error(data.message || 'Upload failed')
          }
        } catch (err) {
          realBtn.textContent = 'Send to WordPress'
          realBtn.style.background = '#0073aa'
          realBtn.style.cursor = 'pointer'
          realBtn.disabled = false
          realStatus.style.color = '#dc3232'
          realStatus.textContent = 'Failed: ' + (err.message || 'Could not upload.')
        }
      })

      // Insert after the download link
      if (a.parentNode) {
        a.parentNode.insertBefore(wpBtn, a.nextSibling)
      }
    })

    // Also find button-style download elements
    const buttons = document.querySelectorAll('button[id*="download"], button[class*="download"], .download-btn')
    buttons.forEach(b => {
      if (processed.has(b)) return
      if (b.offsetParent === null || b.style.display === 'none') return
      processed.add(b)
      // These are click-to-download buttons — we can't easily get the blob
      // but we can show the button after they click
    })
  }

  // Run periodically to catch dynamically added download links
  setInterval(findAndAttach, 1000)

  // Also use MutationObserver for faster detection
  const observer = new MutationObserver(() => findAndAttach())
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'display', 'href'] })

  // ── Intercept programmatic a.click() for tools that don't use persistent links ──
  let lastDownloadBlob = null
  let lastDownloadFilename = 'image.jpg'
  let floatingWpBtn = null

  const origClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.download || this.hasAttribute('download')) {
      const href = this.href || this.getAttribute('href') || ''
      if (href.startsWith('blob:') || href.startsWith('data:')) {
        lastDownloadFilename = this.download || 'image.jpg'
        // Fetch the blob before it gets revoked
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
        const formData = new FormData()
        formData.append('file', blob, filename)
        formData.append('token', wp.token)
        const res = await fetch(wp.wpsite + '?token=' + encodeURIComponent(wp.token), { method: 'POST', body: formData })
        const data = await res.json()
        if (data.success) {
          btn.textContent = 'Sent!'
          btn.style.background = '#46b450'
          status.style.color = '#46b450'
          status.textContent = 'Image added to Media Library.'
          const siteUrl = new URL(wp.wpsite).origin
          window.open(siteUrl + '/wp-admin/upload.php', '_blank')
        } else { throw new Error(data.message || 'Failed') }
      } catch (err) {
        btn.textContent = 'Send to WordPress'
        btn.style.background = '#0073aa'
        btn.disabled = false
        status.style.color = '#dc3232'
        status.textContent = 'Failed: ' + err.message
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
