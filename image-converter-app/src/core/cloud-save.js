/**
 * Cloud save — optional "Save to Account" button shown after processing.
 * Only shows when user is signed in. Uploads to Supabase Storage.
 */
import { supabase, getUser } from './supabase.js'

const MAX_STORAGE_BYTES = 50 * 1024 * 1024 // 50MB per user

/**
 * Show "Save to Account" button after a download link.
 * Auto-detects if user is signed in. Does nothing if not.
 * Call this after showing the download link.
 */
export async function maybeShowSaveButton(containerEl, getBlob, getFilename, toolSlug) {
  // Remove any existing save button in this container
  const existing = containerEl.querySelector('.rc-cloud-save')
  if (existing) existing.remove()

  const user = await getUser()
  if (!user || !supabase) return

  const wrapper = document.createElement('div')
  wrapper.className = 'rc-cloud-save'
  wrapper.style.cssText = 'margin-top:8px;'

  const btn = document.createElement('button')
  btn.style.cssText = 'width:100%;padding:11px;border:none;border-radius:10px;background:#0073aa;color:#fff;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;'
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3H7a2 2 0 00-2 2v14l7-5 7 5V5a2 2 0 00-2-2z"/></svg>Save to Account`
  btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#005a87' })
  btn.addEventListener('mouseleave', () => { if (!btn.disabled) btn.style.background = '#0073aa' })

  const status = document.createElement('div')
  status.style.cssText = 'font-size:11px;text-align:center;margin-top:4px;display:none;font-family:"DM Sans",sans-serif;'

  btn.addEventListener('click', async () => {
    const blob = typeof getBlob === 'function' ? await getBlob() : getBlob
    if (!blob) return
    const filename = typeof getFilename === 'function' ? getFilename() : getFilename

    btn.disabled = true
    btn.innerHTML = 'Saving...'
    btn.style.background = '#999'
    btn.style.cursor = 'not-allowed'
    status.style.display = 'block'
    status.style.color = 'var(--text-muted)'
    status.textContent = 'Uploading to your account...'

    try {
      // Check storage usage
      const { data: files } = await supabase
        .from('saved_files')
        .select('file_size')
        .eq('user_id', user.id)
      const totalUsed = (files || []).reduce((s, f) => s + (f.file_size || 0), 0)
      if (totalUsed + blob.size > MAX_STORAGE_BYTES) {
        throw new Error('Storage limit reached (50MB). Delete some files from My Account.')
      }

      // Upload to storage
      const timestamp = Date.now()
      const storagePath = `${user.id}/${timestamp}_${filename}`
      const { error: uploadErr } = await supabase.storage
        .from('user-files')
        .upload(storagePath, blob, { contentType: blob.type })
      if (uploadErr) throw uploadErr

      // Save metadata
      const { error: dbErr } = await supabase.from('saved_files').insert({
        user_id: user.id,
        file_name: filename,
        file_size: blob.size,
        mime_type: blob.type || 'image/jpeg',
        storage_path: storagePath,
        tool_used: toolSlug || null,
      })
      if (dbErr) throw dbErr

      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>Saved!`
      btn.style.background = '#46b450'
      status.style.color = '#46b450'
      status.textContent = 'File saved to your account.'
    } catch (err) {
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 3H7a2 2 0 00-2 2v14l7-5 7 5V5a2 2 0 00-2-2z"/></svg>Save to Account`
      btn.style.background = '#0073aa'
      btn.style.cursor = 'pointer'
      btn.disabled = false
      status.style.color = '#dc3232'
      status.textContent = err.message || 'Failed to save.'
    }
  })

  wrapper.appendChild(btn)
  wrapper.appendChild(status)
  containerEl.appendChild(wrapper)
}
