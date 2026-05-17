// Shared bulk-conversion engine for Office↔PDF tools that route through the
// CloudConvert broker at /api/convert/<slug>/{start,status}. Each tool entry
// point (excel-to-pdf.js, word-to-pdf.js, …) calls initBulkPdfTool(config)
// with its slug, accepted extensions, and per-tool labels; everything else —
// file list rendering, sequential upload+poll, partial-failure retry, ZIP
// bundling, prerender SEO injection — lives here so bug fixes happen once.
//
// Free-tier limits (same for every bulk tool):
//   • 10 files per session
//   • 25 MB per file
//   • 100 MB total per batch
import { injectHeader } from '../../core/header.js'
import { getT, localHref, injectFaqSchema, setToolMeta } from '../../core/i18n.js'
import JSZip from 'jszip'

export const MAX_FILES = 10
export const MAX_BYTES_PER_FILE = 25 * 1024 * 1024
export const MAX_BYTES_TOTAL = 100 * 1024 * 1024

let stylesInjected = false
function injectStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #app>div{animation:fadeUp 0.4s ease both}
    .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
    .upload-label:hover{background:var(--accent-hover);}
    .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
    .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
    #batchSummary{display:none;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:10px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--text-muted);}
    #batchSummary.on{display:flex;}
    .batch-stat{font-weight:600;color:var(--text-secondary);}
    .file-list{display:none;flex-direction:column;gap:8px;margin-bottom:12px;}
    .file-list.on{display:flex;}
    .file-row{background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px;font-family:'DM Sans',sans-serif;font-size:13px;}
    .file-row .fr-name{flex:1;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .file-row .fr-size{font-size:11px;color:var(--text-muted);white-space:nowrap;}
    .file-row .fr-status{font-size:11px;font-weight:600;white-space:nowrap;padding:3px 8px;border-radius:6px;}
    .file-row .fr-status.pending{color:var(--text-muted);background:var(--bg-surface);}
    .file-row .fr-status.uploading,.file-row .fr-status.converting{color:var(--accent-hover);background:var(--accent-bg,rgba(200,75,49,0.08));}
    .file-row .fr-status.done{color:#0d8b3d;background:rgba(13,139,61,0.08);}
    .file-row .fr-status.error{color:#c0392b;background:rgba(192,57,43,0.08);}
    .file-row .fr-action{background:none;border:1.5px solid var(--border-light);color:var(--text-primary);border-radius:8px;padding:5px 11px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;text-decoration:none;display:inline-block;}
    .file-row .fr-action:hover{border-color:var(--accent);color:var(--accent);}
    .file-row .fr-action.primary{background:var(--btn-dark);color:var(--text-on-dark-btn);border-color:var(--btn-dark);}
    .file-row .fr-action.primary:hover{background:var(--btn-dark-hover);}
    .file-row .fr-remove{background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;padding:4px 6px;font-family:'DM Sans',sans-serif;}
    .file-row .fr-remove:hover{color:var(--accent);}
    .progress-bar{height:6px;background:var(--bg-surface);border-radius:3px;overflow:hidden;display:none;margin-bottom:10px;}
    .progress-bar.on{display:block;}
    .progress-bar-fill{height:100%;background:var(--accent);width:0;transition:width 0.2s ease;}
    .action-btn{padding:13px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;}
    .action-btn:hover{background:var(--accent-hover);}
    .action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;}
    .action-btn.dark{background:var(--btn-dark);}
    .action-btn.dark:hover{background:var(--btn-dark-hover);}
    #actionRow{display:none;margin-bottom:14px;flex-direction:column;gap:8px;}
    #actionRow.on{display:flex;}
    .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
    .status-text.error{color:var(--accent-hover,#c00);}
    .limit-banner{display:none;background:var(--bg-card);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text-secondary);align-items:center;gap:10px;flex-wrap:wrap;}
    .limit-banner.on{display:flex;}
    .limit-banner .lb-text{flex:1;}
    .limit-banner .lb-btn{padding:6px 14px;border-radius:8px;border:1.5px solid var(--border-light);background:var(--bg-card);color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:not-allowed;opacity:0.6;}
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
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
async function safeJson(res) { try { return await res.json() } catch (_) { return null } }

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

/**
 * Initialise a bulk Office→PDF tool page. Caller passes a config object;
 * the engine renders the whole page (H1, upload UI, file list, batch
 * progress, ZIP download, SEO block) and wires up CloudConvert via the
 * Pages Function broker.
 *
 * config = {
 *   slug:           'word-to-pdf',
 *   acceptExts:     ['.docx', '.doc'],          // hard validation list (lowercase, with dot)
 *   acceptAttr:     '.docx,.doc,application/…', // <input accept="…">
 *   nextStepsSlugs: ['excel-to-pdf', 'merge-pdf', 'compress-pdf'],
 *   labels: {       // English fallbacks; per-lang values come from i18n.js
 *     desc, select, dropHint, convertBtn, downloadAll, retry, remove,
 *     limitBanner, upgradeBtn,
 *     statusPending, statusUploading, statusConverting, statusDone, statusError,
 *     progressFmt, summaryFmt,
 *     errTooLarge, errTotalTooLarge, errTooMany, errInvalidFormat,
 *     errRateLimited, errQuotaExhausted, errServiceUnreachable, errServiceError,
 *     errPasswordProtected, errFileCorrupted, errUnsupportedContent,
 *     errConversionFailed, errUploadFailed, errTimeout, errGeneric,
 *     fileBaseFallback,    // download base name when filename has no extension stem
 *     zipName,
 *   },
 *   t:              <getT() result>,            // i18n bundle; engine reads tool labels via t.<slug>_* keys with the fallbacks above
 *   keyPrefix:      'wordpdf'                   // flat-key prefix for runtime i18n lookups (wordpdf_select, wordpdf_status_done, …)
 * }
 */
export function initBulkPdfTool(config) {
  injectStyles()

  const { slug, acceptExts, acceptAttr, nextStepsSlugs, t, keyPrefix } = config
  const labels = config.labels || {}
  const API_BASE = '/api/convert/' + slug

  // Pull per-tool label, falling back to the English default in config.labels.
  // For brevity, the keys in t/i18n use `<keyPrefix>_<suffix>` (e.g. wordpdf_select).
  const get = (suffix, fallback) => {
    const k = keyPrefix + '_' + suffix
    return (t && t[k]) || fallback
  }

  const toolName = (t.nav_short && t.nav_short[slug]) || slug
  const seoData  = t.seo && t.seo[slug]
  const descText = get('desc', labels.desc || 'Convert files to PDF.')
  const selectLbl = get('select', labels.select || 'Select files')
  const dropHint  = get('drop_hint', labels.dropHint || 'or drop files anywhere')
  const convertLbl = get('convert_btn', labels.convertBtn || 'Convert to PDF')
  const downloadAllLbl = get('download_all', labels.downloadAll || 'Download all as ZIP')
  const retryLbl  = get('retry', labels.retry || 'Retry')
  const removeLbl = t.remove || labels.remove || 'Remove'
  const limitBannerLbl = get('limit_banner', labels.limitBanner || 'Free limit: 10 files per session. Upgrade for more.')
  const upgradeBtnLbl  = get('upgrade', labels.upgradeBtn || 'Upgrade')

  const STATUS_LABELS = {
    pending:    get('status_pending',    labels.statusPending    || 'Ready'),
    uploading:  get('status_uploading',  labels.statusUploading  || 'Uploading…'),
    converting: get('status_converting', labels.statusConverting || 'Converting…'),
    done:       get('status_done',       labels.statusDone       || 'Done'),
    error:      get('status_error',      labels.statusError      || 'Failed'),
  }
  const PROGRESS_LABEL_FMT = get('progress_fmt', labels.progressFmt || 'Converting {current} of {total}…')
  const SUMMARY_LABEL_FMT  = get('summary_fmt',  labels.summaryFmt  || '{ok} of {total} converted')

  const ERR = {
    too_large:           get('err_too_large',           labels.errTooLarge           || 'File too large (max 25 MB per file).'),
    total_too_large:     get('err_total_too_large',     labels.errTotalTooLarge     || 'Total batch size too large (max 100 MB).'),
    too_many:            get('err_too_many',            labels.errTooMany            || 'Maximum 10 files per session on the free tier.'),
    invalid_format:      get('err_invalid_format',      labels.errInvalidFormat      || 'Please select a supported file type.'),
    rate_limited:        get('err_rate_limited',        labels.errRateLimited        || 'Server busy. Try again in a moment.'),
    quota_exhausted:     get('err_quota_exhausted',     labels.errQuotaExhausted     || 'Free conversion limit reached. Try again tomorrow.'),
    service_unreachable: get('err_service_unreachable', labels.errServiceUnreachable || 'Conversion service is unreachable. Try again shortly.'),
    service_error:       get('err_service_error',       labels.errServiceError       || 'Conversion service returned an error.'),
    password_protected:  get('err_password_protected',  labels.errPasswordProtected  || 'File is password-protected. Remove the password and retry.'),
    file_corrupted:      get('err_file_corrupted',      labels.errFileCorrupted      || 'File appears corrupted.'),
    unsupported_content: get('err_unsupported_content', labels.errUnsupportedContent || 'File contains unsupported content.'),
    conversion_failed:   get('err_conversion_failed',   labels.errConversionFailed   || 'Conversion failed.'),
    upload_failed:       get('err_upload_failed',       labels.errUploadFailed       || 'Upload failed.'),
    timeout:             get('err_timeout',             labels.errTimeout            || 'Conversion took too long.'),
    generic:             get('err_generic',             labels.errGeneric            || 'Something went wrong.'),
  }
  const fileBaseFallback = labels.fileBaseFallback || 'document'
  const zipName          = labels.zipName || (slug + '.zip')

  // --- Render shell ---
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'
  setToolMeta(slug)
  const _tp = toolName.split(' ')
  const titlePart1 = _tp[0]
  const titlePart2 = _tp.slice(1).join(' ')

  document.querySelector('#app').innerHTML = `
    <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${escapeHtml(titlePart1)} <em style="font-style:italic;color:var(--accent);">${escapeHtml(titlePart2)}</em></h1>
        <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${escapeHtml(descText)}</p>
      </div>
      <div class="limit-banner" id="limitBanner">
        <span class="lb-text" id="lbText">${escapeHtml(limitBannerLbl)}</span>
        <button class="lb-btn" id="upgradeBtn" disabled>${escapeHtml(upgradeBtnLbl)}</button>
      </div>
      <div id="uploadArea" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
          <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${escapeHtml(selectLbl)}</label>
          <span style="font-size:12px;color:var(--text-muted);">${escapeHtml(dropHint)}</span>
        </div>
        <label for="fileInput" class="drop-zone" id="dropZone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${escapeHtml(dropHint)}</span></label>
      </div>
      <input type="file" id="fileInput" accept="${escapeHtml(acceptAttr)}" multiple style="display:none;" />
      <div id="batchSummary"><span class="batch-stat" id="bsCount">0 / ${MAX_FILES}</span><span>·</span><span class="batch-stat" id="bsSize">0 MB / 100 MB</span></div>
      <div class="file-list" id="fileList"></div>
      <div class="progress-bar" id="progBar"><div class="progress-bar-fill" id="progFill"></div></div>
      <div class="status-text" id="statusText"></div>
      <div id="actionRow">
        <button class="action-btn" id="convertBtn">${escapeHtml(convertLbl)}</button>
        <button class="action-btn dark" id="downloadAllBtn" style="display:none;">${escapeHtml(downloadAllLbl)}</button>
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

  const fileInput      = document.getElementById('fileInput')
  const uploadArea     = document.getElementById('uploadArea')
  const batchSummary   = document.getElementById('batchSummary')
  const bsCount        = document.getElementById('bsCount')
  const bsSize         = document.getElementById('bsSize')
  const fileListEl     = document.getElementById('fileList')
  const progBar        = document.getElementById('progBar')
  const progFill       = document.getElementById('progFill')
  const statusText     = document.getElementById('statusText')
  const actionRow      = document.getElementById('actionRow')
  const convertBtn     = document.getElementById('convertBtn')
  const downloadAllBtn = document.getElementById('downloadAllBtn')
  const limitBanner    = document.getElementById('limitBanner')

  // state[i] = { id, file, name, size, status, jobId?, downloadUrl?, pdfBlob?, errCode? }
  let entries = []
  let nextId = 1
  let isBatchRunning = false

  function setStatus(msg, isError) {
    statusText.textContent = msg || ''
    statusText.classList.toggle('error', !!isError)
  }
  function totalBytes() { return entries.reduce((s, e) => s + e.size, 0) }
  function isAcceptedExt(name) {
    const lower = (name || '').toLowerCase()
    return acceptExts.some(ext => lower.endsWith(ext))
  }

  function refreshBatchSummary() {
    const totalMb = (totalBytes() / (1024 * 1024)).toFixed(1)
    bsCount.textContent = `${entries.length} / ${MAX_FILES}`
    bsSize.textContent  = `${totalMb} MB / 100 MB`
    batchSummary.classList.toggle('on', entries.length > 0)
    fileListEl.classList.toggle('on', entries.length > 0)
    actionRow.classList.toggle('on', entries.length > 0)
    // Once a file is added, hide the big empty drop-zone preview — the small
    // "+ Select" button stays so the user can add more. Document-level
    // drag-drop still works regardless.
    const dz = document.getElementById('dropZone')
    if (dz) dz.style.display = entries.length > 0 ? 'none' : ''
    // Fully hide the upload area when at the 10-file cap.
    uploadArea.style.display = entries.length >= MAX_FILES ? 'none' : ''
  }

  function renderFileList() {
    fileListEl.innerHTML = entries.map(e => {
      const status = e.status || 'pending'
      const statusLabel = STATUS_LABELS[status] || status
      let action = ''
      if (status === 'done' && e.pdfBlob) {
        action = `<button class="fr-action primary" data-action="download" data-id="${e.id}">${escapeHtml(t.download || 'Download')}</button>`
      } else if (status === 'error') {
        action = `<button class="fr-action" data-action="retry" data-id="${e.id}">${escapeHtml(retryLbl)}</button>`
      }
      const removeBtn = isBatchRunning && (status === 'uploading' || status === 'converting')
        ? ''
        : `<button class="fr-remove" data-action="remove" data-id="${e.id}" aria-label="${escapeHtml(removeLbl)}">×</button>`
      return `
        <div class="file-row" data-id="${e.id}">
          <span class="fr-name">${escapeHtml(e.name)}</span>
          <span class="fr-size">${formatSize(e.size)}</span>
          <span class="fr-status ${status}">${escapeHtml(statusLabel)}</span>
          ${action}
          ${removeBtn}
        </div>
      `
    }).join('')
  }

  function addFiles(files) {
    if (isBatchRunning) return
    let limitHit = false
    let invalidCount = 0
    let oversizedCount = 0
    let totalOverflow = false

    for (const f of files) {
      if (!isAcceptedExt(f.name)) { invalidCount++; continue }
      if (f.size > MAX_BYTES_PER_FILE) { oversizedCount++; continue }
      if (entries.length >= MAX_FILES) { limitHit = true; break }
      if (totalBytes() + f.size > MAX_BYTES_TOTAL) { totalOverflow = true; break }
      entries.push({
        id: nextId++,
        file: f,
        name: f.name,
        size: f.size,
        status: 'pending',
      })
    }

    if (limitHit) {
      setStatus(ERR.too_many, true)
      limitBanner.classList.add('on')
    } else if (totalOverflow) {
      setStatus(ERR.total_too_large, true)
    } else if (invalidCount && !entries.length) {
      setStatus(ERR.invalid_format, true)
    } else if (oversizedCount) {
      setStatus(ERR.too_large, true)
    } else {
      setStatus('')
    }

    refreshBatchSummary()
    renderFileList()
    updateConvertButton()
  }

  function updateConvertButton() {
    const anyPending = entries.some(e => e.status === 'pending')
    convertBtn.disabled = isBatchRunning || !anyPending
    const successCount = entries.filter(e => e.status === 'done' && e.pdfBlob).length
    downloadAllBtn.style.display = (!isBatchRunning && successCount >= 2) ? '' : 'none'
  }

  async function startBatch() {
    if (isBatchRunning) return
    const pending = entries.filter(e => e.status === 'pending' || e.status === 'error')
    if (pending.length === 0) return

    isBatchRunning = true
    updateConvertButton()
    progBar.classList.add('on')
    progFill.style.width = '0'
    setStatus('')

    let processed = 0
    for (const e of pending) {
      if (!entries.find(x => x.id === e.id)) continue // removed mid-batch
      processed++
      setStatus(PROGRESS_LABEL_FMT.replace('{current}', String(processed)).replace('{total}', String(pending.length)))
      progFill.style.width = `${((processed - 1) / pending.length) * 100}%`
      await processOne(e)
      progFill.style.width = `${(processed / pending.length) * 100}%`
      renderFileList()
    }

    isBatchRunning = false
    progFill.style.width = '100%'
    setTimeout(() => { progBar.classList.remove('on'); progFill.style.width = '0' }, 500)
    const ok = entries.filter(e => e.status === 'done').length
    setStatus(SUMMARY_LABEL_FMT.replace('{ok}', String(ok)).replace('{total}', String(entries.length)))
    renderFileList()
    updateConvertButton()
    buildNextSteps()
    if (window.showReviewPrompt && ok > 0) window.showReviewPrompt()
  }

  async function processOne(entry) {
    entry.status = 'uploading'
    entry.errCode = undefined
    renderFileList()

    // 1) Ask the Function to create a CC job
    let job
    try {
      const startRes = await fetch(API_BASE + '/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: entry.name, size: entry.size }),
      })
      if (!startRes.ok) {
        const err = await safeJson(startRes)
        entry.status = 'error'
        entry.errCode = mapStartError(err && err.error, startRes.status)
        return
      }
      job = await startRes.json()
    } catch (_) {
      entry.status = 'error'
      entry.errCode = 'service_unreachable'
      return
    }
    if (!job || !job.jobId || !job.uploadUrl) {
      entry.status = 'error'
      entry.errCode = 'service_error'
      return
    }
    entry.jobId = job.jobId

    // 2) Upload directly to CloudConvert via signed URL
    try {
      const fd = new FormData()
      for (const [k, v] of Object.entries(job.uploadFields || {})) fd.append(k, v)
      fd.append('file', entry.file, entry.name)
      const upRes = await fetch(job.uploadUrl, { method: 'POST', body: fd })
      if (!upRes.ok && upRes.status !== 201 && upRes.status !== 204) {
        entry.status = 'error'
        entry.errCode = 'upload_failed'
        return
      }
    } catch (_) {
      entry.status = 'error'
      entry.errCode = 'upload_failed'
      return
    }

    entry.status = 'converting'
    renderFileList()

    // 3) Poll for completion, then prefetch the PDF blob so JSZip can bundle it
    const result = await pollUntilDone(entry.jobId)
    if (result.ok) {
      try {
        const pdfRes = await fetch(result.downloadUrl)
        const blob = await pdfRes.blob()
        entry.pdfBlob = blob
        entry.downloadUrl = URL.createObjectURL(blob)
        entry.status = 'done'
      } catch (_) {
        entry.status = 'error'
        entry.errCode = 'service_unreachable'
      }
    } else {
      entry.status = 'error'
      entry.errCode = result.code
    }
  }

  async function pollUntilDone(jobId) {
    const MAX_POLLS = 60 // 60 × 2s = 120s
    for (let i = 0; i < MAX_POLLS; i++) {
      let res
      try { res = await fetch(API_BASE + '/status?jobId=' + encodeURIComponent(jobId)) }
      catch (_) { return { ok: false, code: 'service_unreachable' } }
      if (!res.ok) {
        const err = await safeJson(res)
        return { ok: false, code: mapStatusError(err && err.code, res.status) }
      }
      const data = await res.json()
      if (data.status === 'processing') {
        await sleep(2000)
        continue
      }
      if (data.status === 'error') return { ok: false, code: data.code || 'conversion_failed' }
      if (data.status === 'finished' && data.downloadUrl) {
        return { ok: true, downloadUrl: data.downloadUrl }
      }
      return { ok: false, code: 'generic' }
    }
    return { ok: false, code: 'timeout' }
  }

  function downloadEntry(entry) {
    if (!entry.pdfBlob) return
    const baseName = (entry.name || fileBaseFallback).replace(/\.[^.]+$/, '')
    const url = entry.downloadUrl || URL.createObjectURL(entry.pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = baseName + '.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  async function downloadAllAsZip() {
    const succ = entries.filter(e => e.status === 'done' && e.pdfBlob)
    if (succ.length === 0) return
    downloadAllBtn.disabled = true
    const zip = new JSZip()
    for (const e of succ) {
      const baseName = (e.name || fileBaseFallback).replace(/\.[^.]+$/, '')
      zip.file(baseName + '.pdf', e.pdfBlob)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = zipName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    downloadAllBtn.disabled = false
  }

  function removeEntry(id) {
    const idx = entries.findIndex(e => e.id === id)
    if (idx < 0) return
    if (entries[idx].downloadUrl) URL.revokeObjectURL(entries[idx].downloadUrl)
    entries.splice(idx, 1)
    if (entries.length < MAX_FILES) limitBanner.classList.remove('on')
    refreshBatchSummary()
    renderFileList()
    updateConvertButton()
  }

  async function retryEntry(id) {
    if (isBatchRunning) return
    const e = entries.find(x => x.id === id)
    if (!e) return
    e.status = 'pending'
    renderFileList()
    isBatchRunning = true
    updateConvertButton()
    setStatus(PROGRESS_LABEL_FMT.replace('{current}', '1').replace('{total}', '1'))
    await processOne(e)
    isBatchRunning = false
    setStatus('')
    renderFileList()
    updateConvertButton()
  }

  function buildNextSteps() {
    const container = document.getElementById('nextStepsButtons')
    const parent = document.getElementById('nextSteps')
    if (!container || !parent) return
    if (!entries.some(e => e.status === 'done')) return
    const links = (nextStepsSlugs || []).map(s => ({
      slug: s,
      label: (t.nav_short && t.nav_short[s]) || s,
    }))
    container.innerHTML = links.map(l => `<a href="${localHref(l.slug)}" style="padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);">${escapeHtml(l.label)}</a>`).join('')
    parent.style.display = 'block'
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

  // --- Event wiring ---
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) addFiles(Array.from(fileInput.files))
    fileInput.value = ''
  })
  convertBtn.addEventListener('click', startBatch)
  downloadAllBtn.addEventListener('click', downloadAllAsZip)
  fileListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const id = parseInt(btn.dataset.id, 10)
    const action = btn.dataset.action
    if (action === 'download') {
      const entry = entries.find(x => x.id === id)
      if (entry) downloadEntry(entry)
    } else if (action === 'retry') {
      retryEntry(id)
    } else if (action === 'remove') {
      removeEntry(id)
    }
  })
  document.addEventListener('dragover', e => e.preventDefault())
  document.addEventListener('drop', e => {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  })
}
