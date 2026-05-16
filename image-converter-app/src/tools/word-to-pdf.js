// Word → PDF tool. UNLIKE the rest of RelahConvert's tools, this one uploads
// the user's file to CloudConvert (a third-party processor) because pure
// browser-side .docx → PDF is not viable. Files are auto-deleted from
// CloudConvert within 24 hours. Disclosed in the page UI and privacy policy.
import { injectHeader } from '../core/header.js'
import { getT, localHref, injectFaqSchema, setToolMeta } from '../core/i18n.js'

const t = getT()
const SLUG = 'word-to-pdf'
const API_BASE = '/api/convert/' + SLUG
const MAX_BYTES = 50 * 1024 * 1024

const toolName    = (t.nav_short && t.nav_short[SLUG]) || 'Word to PDF'
const seoData     = t.seo && t.seo[SLUG]
const descText    = (t.wordpdf_desc) || 'Convert Word documents to PDF.'
const selectLbl   = t.wordpdf_select   || 'Select Word file'
const dropHint    = t.wordpdf_drop_hint || 'or drop a .docx file anywhere'
const convertLbl  = t.wordpdf_convert_btn || 'Convert to PDF'
const downloadLbl = t.download || 'Download'
const procNote    = t.wordpdf_processing_note || 'This tool processes your file via our conversion partner (CloudConvert). Files are deleted after processing.'
const privacyLink = t.wordpdf_privacy_link || 'Read more'
const pagesLabel  = t.compresspdf_pages || 'pages'

const STATUS_LABELS = {
  preparing:  t.wordpdf_status_preparing  || 'Preparing…',
  uploading:  t.wordpdf_status_uploading  || 'Uploading…',
  converting: t.wordpdf_status_converting || 'Converting…',
  done:       t.wordpdf_status_done       || 'Done!',
}
const ERR_LABELS = {
  too_large:           t.wordpdf_err_too_large           || 'File is too large (max 50 MB). Try a smaller file.',
  invalid_format:      t.wordpdf_err_invalid_format      || 'Please select a Word file (.docx).',
  rate_limited:        t.wordpdf_err_rate_limited        || 'Server is busy. Please try again in a moment.',
  quota_exhausted:     t.wordpdf_err_quota_exhausted     || 'Free conversion limit reached for today. Please try again tomorrow.',
  service_unreachable: t.wordpdf_err_service_unreachable || 'Conversion service is unreachable. Please try again shortly.',
  service_error:       t.wordpdf_err_service_error       || 'Conversion service returned an error. Please try again.',
  password_protected:  t.wordpdf_err_password_protected  || 'This file appears to be password-protected. Remove the password and try again.',
  file_corrupted:      t.wordpdf_err_file_corrupted      || 'This file appears to be corrupted or unreadable.',
  unsupported_content: t.wordpdf_err_unsupported_content || 'This file contains content we couldn’t convert. Try saving it as a simpler .docx.',
  conversion_failed:   t.wordpdf_err_conversion_failed   || 'We couldn’t convert this file. Please try a different one.',
  upload_failed:       t.wordpdf_err_upload_failed       || 'Upload failed. Check your internet connection and try again.',
  timeout:             t.wordpdf_err_timeout             || 'Conversion took too long. Try a smaller or simpler file.',
  generic:             t.wordpdf_err_generic             || 'Something went wrong. Please try again.',
}

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .drop-zone.hidden{display:none;}
  #fileMeta{display:none;align-items:center;gap:10px;margin-bottom:12px;font-family:'DM Sans',sans-serif;background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border-light);padding:12px 14px;}
  #fileMeta.on{display:flex;}
  .fm-name{flex:1;font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .fm-size{font-size:12px;color:var(--text-muted);white-space:nowrap;}
  .fm-clear{background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;padding:0;}
  .action-btn{padding:13px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.disabled,.action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;}
  .action-btn.dark{background:var(--btn-dark);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  #actionRow{display:none;margin-bottom:14px;}
  #actionRow.on{display:block;}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .progress-bar{height:6px;background:var(--bg-surface);border-radius:3px;overflow:hidden;margin-bottom:10px;display:none;}
  .progress-bar.on{display:block;}
  .progress-bar-fill{height:100%;background:var(--accent);width:0;transition:width 0.2s ease;}
  .processing-note{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;background:var(--bg-card);border:1px solid var(--border-light);border-radius:10px;padding:11px 14px;margin-bottom:18px;line-height:1.5;}
  .processing-note a{color:var(--accent);text-decoration:underline;}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px;}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px;}
  .seo-section ol{padding-left:20px;margin:0 0 12px;}
  .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px;}
  .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px;}
  .seo-section .faq-item{background:var(--bg-card);border-radius:12px;padding:18px 20px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .seo-section .faq-item h4{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:0 0 6px;}
  .seo-section .faq-item p{margin:0;}
  .seo-section .internal-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;}
  .seo-section .internal-links a{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);transition:all 0.15s;}
  .seo-section .internal-links a:hover{border-color:var(--accent);color:var(--accent);}
  .seo-divider{border:none;border-top:1px solid var(--border);margin:0 auto 40px;max-width:700px;}
`
document.head.appendChild(style)

setToolMeta(SLUG)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${escapeHtml(titlePart1)} <em style="font-style:italic;color:var(--accent);">${escapeHtml(titlePart2)}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${escapeHtml(descText)}</p>
    </div>
    <div class="processing-note">${escapeHtml(procNote)} <a href="${localHref('privacy-policy')}">${escapeHtml(privacyLink)}</a></div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${escapeHtml(selectLbl)}</label>
        <span style="font-size:12px;color:var(--text-muted);">${escapeHtml(dropHint)}</span>
      </div>
      <label for="fileInput" class="drop-zone" id="dropZone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${escapeHtml(dropHint)}</span></label>
    </div>
    <input type="file" id="fileInput" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none;" />
    <div id="fileMeta"><span class="fm-name" id="fmName"></span><span class="fm-size" id="fmSize"></span><button class="fm-clear" id="fmClear">${escapeHtml(t.remove || 'Remove')}</button></div>
    <div class="progress-bar" id="progBar"><div class="progress-bar-fill" id="progFill"></div></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="convertBtn" disabled>${escapeHtml(convertLbl)}</button>
    </div>
    <div id="resultArea" style="display:none;margin-bottom:14px;">
      <a id="dlLink" class="action-btn dark" style="display:inline-block;text-decoration:none;text-align:center;" download>${escapeHtml(downloadLbl)}</a>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${escapeHtml(t.whats_next || "What's Next?")}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
  ${buildSeoSection()}
`

injectHeader()
if (seoData && seoData.faqs) injectFaqSchema(seoData.faqs)

const fileInput   = document.getElementById('fileInput')
const dropZone    = document.getElementById('dropZone')
const uploadArea  = document.getElementById('uploadArea')
const fileMeta    = document.getElementById('fileMeta')
const fmName      = document.getElementById('fmName')
const fmSize      = document.getElementById('fmSize')
const fmClear     = document.getElementById('fmClear')
const convertBtn  = document.getElementById('convertBtn')
const actionRow   = document.getElementById('actionRow')
const statusText  = document.getElementById('statusText')
const progBar     = document.getElementById('progBar')
const progFill    = document.getElementById('progFill')
const resultArea  = document.getElementById('resultArea')
const dlLink      = document.getElementById('dlLink')

let selectedFile = null
let pollTimer = null
let isConverting = false

function clearSelection() {
  selectedFile = null
  fileMeta.classList.remove('on')
  actionRow.classList.remove('on')
  convertBtn.disabled = true
  statusText.textContent = ''
  progBar.classList.remove('on')
  progFill.style.width = '0'
  resultArea.style.display = 'none'
  uploadArea.style.display = ''
}

function setSelection(file) {
  if (!file) return
  if (file.size > MAX_BYTES) {
    showError('too_large')
    return
  }
  const name = (file.name || '').toLowerCase()
  if (!name.endsWith('.docx')) {
    showError('invalid_format')
    return
  }
  selectedFile = file
  fmName.textContent = file.name
  fmSize.textContent = formatSize(file.size)
  fileMeta.classList.add('on')
  actionRow.classList.add('on')
  convertBtn.disabled = false
  statusText.textContent = ''
  resultArea.style.display = 'none'
  uploadArea.style.display = 'none'
}

function showError(code) {
  isConverting = false
  convertBtn.disabled = !selectedFile
  progBar.classList.remove('on')
  statusText.textContent = ERR_LABELS[code] || ERR_LABELS.generic
  statusText.style.color = 'var(--accent-hover, #c00)'
}

function setStatus(label) {
  statusText.textContent = label
  statusText.style.color = ''
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildSeoSection() {
  if (!seoData) return ''
  const links = (seoData.links || []).map(l => `<a href="${localHref(l.href.replace(/^\//, ''))}">${escapeHtml(l.label)}</a>`).join('')
  const steps = (seoData.steps || []).map(s => `<li>${s}</li>`).join('')
  const faqs  = (seoData.faqs  || []).map(f => `<div class="faq-item"><h4>${escapeHtml(f.q)}</h4><p>${escapeHtml(f.a)}</p></div>`).join('')
  return `
    <hr class="seo-divider" />
    <div class="seo-section">
      <h2>${escapeHtml(seoData.h2a)}</h2>
      <ol>${steps}</ol>
      <h2>${escapeHtml(seoData.h2b)}</h2>
      ${seoData.body || ''}
      <h3>${escapeHtml(seoData.h3why)}</h3>
      <p>${escapeHtml(seoData.why)}</p>
      <h3>${escapeHtml(t.seo_faq_title || 'Frequently asked questions')}</h3>
      ${faqs}
      <h3>${escapeHtml(t.seo_also_try || 'Also try')}</h3>
      <div class="internal-links">${links}</div>
    </div>
  `
}

// --- conversion flow ---
async function startConversion() {
  if (!selectedFile || isConverting) return
  isConverting = true
  convertBtn.disabled = true
  resultArea.style.display = 'none'
  progBar.classList.add('on')
  progFill.style.width = '5%'
  setStatus(STATUS_LABELS.preparing)

  let job
  try {
    const startRes = await fetch(API_BASE + '/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: selectedFile.name, size: selectedFile.size }),
    })
    if (!startRes.ok) {
      const err = await safeJson(startRes)
      showError(mapStartError(err && err.error, startRes.status))
      return
    }
    job = await startRes.json()
  } catch (_) {
    showError('service_unreachable')
    return
  }
  if (!job || !job.jobId || !job.uploadUrl) {
    showError('service_error')
    return
  }

  // Upload directly to CloudConvert
  progFill.style.width = '20%'
  setStatus(STATUS_LABELS.uploading)
  try {
    const fd = new FormData()
    for (const [k, v] of Object.entries(job.uploadFields || {})) fd.append(k, v)
    fd.append('file', selectedFile, selectedFile.name)
    const upRes = await fetch(job.uploadUrl, { method: 'POST', body: fd })
    if (!upRes.ok && upRes.status !== 201 && upRes.status !== 204) {
      showError('upload_failed')
      return
    }
  } catch (_) {
    showError('upload_failed')
    return
  }

  // Poll for completion
  progFill.style.width = '50%'
  setStatus(STATUS_LABELS.converting)
  pollStatus(job.jobId)
}

function pollStatus(jobId) {
  let polls = 0
  const MAX_POLLS = 60 // 60 × 2s = 120s
  const tick = async () => {
    polls++
    if (polls > MAX_POLLS) { showError('timeout'); return }
    let res
    try { res = await fetch(API_BASE + '/status?jobId=' + encodeURIComponent(jobId)) }
    catch (_) { showError('service_unreachable'); return }
    if (!res.ok) {
      const err = await safeJson(res)
      showError(mapStatusError(err && err.code, res.status))
      return
    }
    const data = await res.json()
    if (data.status === 'processing') {
      // Bump the progress bar a bit each poll for visible feedback (capped at 90%)
      const pct = Math.min(90, 50 + polls * 1.5)
      progFill.style.width = pct + '%'
      pollTimer = setTimeout(tick, 2000)
      return
    }
    if (data.status === 'error') {
      showError(data.code || 'conversion_failed')
      return
    }
    if (data.status === 'finished' && data.downloadUrl) {
      progFill.style.width = '100%'
      setStatus(STATUS_LABELS.done)
      dlLink.href = data.downloadUrl
      const baseName = (selectedFile.name || 'document').replace(/\.[^.]+$/, '')
      dlLink.download = baseName + '.pdf'
      resultArea.style.display = 'block'
      isConverting = false
      buildNextSteps()
      if (window.showReviewPrompt) window.showReviewPrompt()
      return
    }
    showError('generic')
  }
  tick()
}

function mapStartError(code, http) {
  if (code === 'file_too_large') return 'too_large'
  if (code === 'invalid_format') return 'invalid_format'
  if (code === 'quota_exhausted') return 'quota_exhausted'
  if (code === 'rate_limited') return 'rate_limited'
  if (code === 'service_unreachable') return 'service_unreachable'
  if (code === 'service_misconfigured') return 'service_error'
  if (http === 429) return 'rate_limited'
  if (http >= 500) return 'service_error'
  return 'generic'
}
function mapStatusError(code, http) {
  if (code === 'service_unreachable') return 'service_unreachable'
  if (code === 'password_protected') return 'password_protected'
  if (code === 'file_corrupted') return 'file_corrupted'
  if (code === 'unsupported_content') return 'unsupported_content'
  if (code === 'conversion_failed') return 'conversion_failed'
  if (http >= 500) return 'service_error'
  return 'generic'
}
async function safeJson(res) {
  try { return await res.json() } catch (_) { return null }
}

function buildNextSteps() {
  const container = document.getElementById('nextStepsButtons')
  const parent = document.getElementById('nextSteps')
  if (!container || !parent) return
  const links = [
    { slug: 'compress-pdf', label: (t.nav_short && t.nav_short['compress-pdf']) || 'Compress PDF' },
    { slug: 'merge-pdf',    label: (t.nav_short && t.nav_short['merge-pdf'])    || 'Merge PDF' },
    { slug: 'split-pdf',    label: (t.nav_short && t.nav_short['split-pdf'])    || 'Split PDF' },
  ]
  container.innerHTML = links.map(l => `<a href="${localHref(l.slug)}" style="padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);">${escapeHtml(l.label)}</a>`).join('')
  parent.style.display = 'block'
}

// --- event wiring ---
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) setSelection(fileInput.files[0])
  fileInput.value = ''
})
fmClear.addEventListener('click', clearSelection)
convertBtn.addEventListener('click', startConversion)
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
    setSelection(e.dataTransfer.files[0])
  }
})
