/**
 * WordPress upload integration.
 * When tools are opened from the WP plugin, shows a "Send to WordPress" button
 * after processing, and uploads the result back to the WP media library.
 */

export function getWpParams() {
  const params = new URLSearchParams(window.location.search)
  const wpsite = params.get('wpsite')
  const token = params.get('token')
  if (!wpsite || !token) return null
  return { wpsite, token }
}

export function createWpUploadButton(getBlob, getFilename) {
  const wp = getWpParams()
  if (!wp) return null

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'margin-top:10px;'

  const btn = document.createElement('button')
  btn.textContent = 'Send to WordPress'
  btn.style.cssText = 'width:100%;padding:13px;border:none;border-radius:10px;background:#0073aa;color:#fff;font-family:"Fraunces",serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.18s;'
  btn.addEventListener('mouseenter', () => { btn.style.background = '#005a87' })
  btn.addEventListener('mouseleave', () => { btn.style.background = '#0073aa' })

  const status = document.createElement('div')
  status.style.cssText = 'font-family:"DM Sans",sans-serif;font-size:13px;margin-top:8px;text-align:center;display:none;'

  btn.addEventListener('click', async () => {
    const blob = getBlob()
    if (!blob) return

    btn.disabled = true
    btn.textContent = 'Uploading...'
    btn.style.background = '#999'
    btn.style.cursor = 'not-allowed'
    status.style.display = 'block'
    status.style.color = 'var(--text-secondary)'
    status.textContent = 'Sending image to WordPress...'

    try {
      const formData = new FormData()
      const filename = getFilename() || 'relahconvert-image.jpg'
      formData.append('file', blob, filename)
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
  })

  wrapper.appendChild(btn)
  wrapper.appendChild(status)
  return wrapper
}
