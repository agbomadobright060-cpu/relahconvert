/**
 * Cloud save — optional "Save to Account" button shown after processing.
 * Only shows when user is signed in. Uploads to Supabase Storage.
 */
import { supabase, getUser } from './supabase.js'

const MAX_STORAGE_BYTES = 50 * 1024 * 1024 // 50MB per user

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

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

/**
 * Auto-save a batch of completed files to the signed-in user's account.
 * Renders a "Pending uploads" panel inside containerEl listing each file with
 * a live status indicator (Pending → Saving → ✓ Saved / ✗ <reason>).
 *
 * Does nothing if no user is signed in OR if Supabase isn't initialised —
 * the function returns silently so callers can call it unconditionally.
 *
 * files: [{ name: string, blob: Blob }]  (typically built from the bulk
 *        engine's completed entries)
 */
export async function maybeAutoSaveBatch(containerEl, files, toolSlug) {
  // Clear any previous panel in this container so re-running the batch
  // doesn't stack multiple panels.
  const existing = containerEl.querySelector('.rc-cloud-batch')
  if (existing) existing.remove()

  if (!Array.isArray(files) || files.length === 0) return
  const user = await getUser()
  if (!user || !supabase) return // signed-out: render nothing, no prompt, no noise

  const panel = document.createElement('div')
  panel.className = 'rc-cloud-batch'
  panel.style.cssText = 'margin-top:14px;padding:14px;border-radius:12px;border:1.5px solid var(--border-light);background:var(--bg-card);font-family:"DM Sans",sans-serif;'

  const header = document.createElement('div')
  header.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;'
  header.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span>Saving to your account</span>`
  panel.appendChild(header)

  const list = document.createElement('div')
  list.style.cssText = 'display:flex;flex-direction:column;gap:6px;'
  panel.appendChild(list)

  const footer = document.createElement('div')
  footer.style.cssText = 'margin-top:10px;font-size:12px;color:var(--text-muted);'
  panel.appendChild(footer)

  // Build a row per file so we can mutate its status independently
  const rows = files.map((f) => {
    const row = document.createElement('div')
    row.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:13px;'
    const name = document.createElement('span')
    name.style.cssText = 'flex:1;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    name.textContent = f.name
    const size = document.createElement('span')
    size.style.cssText = 'font-size:11px;color:var(--text-muted);white-space:nowrap;'
    size.textContent = fmtSize(f.blob ? f.blob.size : 0)
    const status = document.createElement('span')
    status.style.cssText = 'font-size:11px;font-weight:600;white-space:nowrap;padding:3px 8px;border-radius:6px;color:var(--text-muted);background:var(--bg-surface);'
    status.textContent = 'Pending'
    row.appendChild(name); row.appendChild(size); row.appendChild(status)
    list.appendChild(row)
    return { row, status, file: f }
  })

  // Pre-check storage quota so we can fail fast and tell the user how much
  // they're over before uploading anything.
  let used = 0
  try {
    const { data: existingFiles } = await supabase
      .from('saved_files')
      .select('file_size')
      .eq('user_id', user.id)
    used = (existingFiles || []).reduce((s, f) => s + (f.file_size || 0), 0)
  } catch (_) { /* if the quota check fails, fall through and let per-file uploads surface the error */ }
  const batchSize = files.reduce((s, f) => s + (f.blob ? f.blob.size : 0), 0)
  if (used + batchSize > MAX_STORAGE_BYTES) {
    rows.forEach(r => { r.status.textContent = 'Skipped'; r.status.style.color = '#c0392b'; r.status.style.background = 'rgba(192,57,43,0.08)' })
    footer.innerHTML = `Storage limit reached (50&nbsp;MB). <a href="/account" style="color:var(--accent);text-decoration:underline;">Manage saved files</a>.`
    containerEl.appendChild(panel)
    return
  }

  containerEl.appendChild(panel)

  let saved = 0, failed = 0
  for (const r of rows) {
    r.status.textContent = 'Saving…'
    r.status.style.color = 'var(--accent-hover)'
    r.status.style.background = 'var(--accent-bg,rgba(200,75,49,0.08))'
    try {
      const blob = r.file.blob
      if (!blob) throw new Error('no_blob')
      const timestamp = Date.now()
      const storagePath = `${user.id}/${timestamp}_${r.file.name}`
      // Prefer the caller-supplied type (bulk-pdf-tool passes outputMime so
      // the .docx/.xlsx/.pptx outputs from PDF→Office tools get tagged
      // correctly even when CloudConvert's blob has an empty Content-Type).
      const mime = r.file.type || blob.type || 'application/pdf'
      const { error: uploadErr } = await supabase.storage
        .from('user-files')
        .upload(storagePath, blob, { contentType: mime })
      if (uploadErr) throw uploadErr
      const { error: dbErr } = await supabase.from('saved_files').insert({
        user_id: user.id,
        file_name: r.file.name,
        file_size: blob.size,
        mime_type: mime,
        storage_path: storagePath,
        tool_used: toolSlug || null,
      })
      if (dbErr) throw dbErr
      r.status.textContent = '✓ Saved'
      r.status.style.color = '#0d8b3d'
      r.status.style.background = 'rgba(13,139,61,0.08)'
      saved++
    } catch (_) {
      r.status.textContent = 'Failed'
      r.status.style.color = '#c0392b'
      r.status.style.background = 'rgba(192,57,43,0.08)'
      failed++
    }
  }

  const total = files.length
  if (saved === total) {
    footer.innerHTML = `<span style="color:#0d8b3d;font-weight:600;">All ${saved} file${saved > 1 ? 's' : ''} saved.</span> <a href="/account" style="color:var(--accent);text-decoration:underline;">Open My Account</a>`
  } else if (saved > 0) {
    footer.innerHTML = `<span style="color:#0d8b3d;font-weight:600;">${saved} of ${total} saved</span>${failed ? `, ${failed} failed` : ''}. <a href="/account" style="color:var(--accent);text-decoration:underline;">Open My Account</a>`
  } else {
    footer.innerHTML = `<span style="color:#c0392b;">Could not save files. <a href="/account" style="color:var(--accent);text-decoration:underline;">Try again from My Account</a></span>`
  }
}
