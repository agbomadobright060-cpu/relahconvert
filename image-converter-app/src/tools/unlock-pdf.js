import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt-lite'

injectHreflang('unlock-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['unlock-pdf']) || 'Unlock PDF'
const seoData   = t.seo && t.seo['unlock-pdf']
const descText  = t.unlkpdf_desc || t.card_unlock_pdf_desc || 'Remove password protection from PDF files.'
const selectLbl = t.unlkpdf_select || t.select_images || 'Select PDFs'
const dropHint  = t.unlkpdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const unlockLbl    = t.unlkpdf_unlock_btn || 'Unlock PDFs'
const unlockingLbl = t.unlkpdf_unlocking || 'Unlocking\u2026'
const passwordLbl  = t.unlkpdf_password_label || 'PDF Password'
const passwordPh   = t.unlkpdf_password_placeholder || 'Enter PDF password'
const showLbl      = t.unlkpdf_show || 'Show'
const hideLbl      = t.unlkpdf_hide || 'Hide'
const wrongPwLbl   = t.unlkpdf_wrong_password || 'Incorrect password. Please try again.'
const notEncLbl    = t.unlkpdf_not_encrypted || 'This PDF is not encrypted.'
const addMoreLbl   = t.add_more || 'Add more'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #passwordRow{display:none;align-items:center;gap:10px;margin-bottom:14px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:12px 16px;flex-wrap:wrap;}
  #passwordRow.on{display:flex;}
  #passwordRow label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #passwordRow input[type="password"],#passwordRow input[type="text"]{flex:1;min-width:160px;padding:8px 12px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-surface);outline:none;transition:border-color 0.15s;}
  #passwordRow input:focus{border-color:var(--accent);}
  .toggle-pw{padding:6px 12px;border:1.5px solid var(--border-light);border-radius:8px;font-size:12px;font-family:'DM Sans',sans-serif;color:var(--text-secondary);background:var(--bg-card);cursor:pointer;transition:all 0.15s;font-weight:600;}
  .toggle-pw:hover{border-color:var(--accent);color:var(--accent);}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #fileList{margin-bottom:14px;}
  .file-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);margin-bottom:8px;font-family:'DM Sans',sans-serif;}
  .file-item .fname{flex:1;font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-item .fmeta{font-size:11px;color:var(--text-muted);white-space:nowrap;}
  .file-item .fresult{font-size:11px;font-weight:700;white-space:nowrap;}
  .file-item .fresult.ok{color:#16a34a;}
  .file-item .fresult.err{color:#dc2626;}
  .file-item .fdl{font-size:11px;font-weight:700;color:var(--accent);text-decoration:none;white-space:nowrap;cursor:pointer;}
  .file-item .fdl:hover{text-decoration:underline;}
  .file-item .fremove{background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:0 4px;line-height:1;}
  .file-item .fremove:hover{color:var(--accent);}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .status-text.error{color:#dc2626;}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px;}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px;}
  .seo-section ol{padding-left:20px;margin:0 0 12px;}
  .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px;}
  .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px;}
  .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
  .seo-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-primary);text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .seo-link:hover{border-color:var(--accent);color:var(--accent);}
  .seo-section .faq-item{background:var(--bg-card);border-radius:12px;padding:18px 20px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .seo-section .faq-item h4{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:0 0 6px;}
  .seo-section .faq-item p{margin:0;}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
`
document.head.appendChild(style)

document.title = t.unlkpdf_page_title || (seoData ? seoData.page_title : 'Unlock PDF Free | Remove PDF Password Online \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.unlkpdf_meta_desc || 'Unlock PDF free. Remove password protection from PDF files instantly.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${descText}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
        <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
      </div>
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${t.drop_images || 'Drop PDFs here'}</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileList"></div>
    <div id="passwordRow">
      <label>${passwordLbl}:</label>
      <input type="password" id="pwInput" placeholder="${passwordPh}" autocomplete="off" />
      <button class="toggle-pw" id="togglePwBtn">${showLbl}</button>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Clear all'}</button></div>
    <div class="status-text" id="statusText"></div>
    <div id="unlockpdf_applyModeToggle" style="display:none;margin-bottom:12px;">
      <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
        <button id="unlockpdf_modeAll" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
        <button id="unlockpdf_modeIndiv" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
      </div>
    </div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="unlockBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${unlockLbl}</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileList     = document.getElementById('fileList')
const passwordRow  = document.getElementById('passwordRow')
const pwInput      = document.getElementById('pwInput')
const togglePwBtn  = document.getElementById('togglePwBtn')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn    = document.getElementById('removeBtn')
const unlockBtn    = document.getElementById('unlockBtn')
const zipBtn       = document.getElementById('zipBtn')
const statusText   = document.getElementById('statusText')
const uploadArea   = document.getElementById('uploadArea')

// State
let pdfEntries = [] // { file, name, originalSize, unlockedBlob?, itemEl }
let lastResults = []
let unlockpdf_activeIndex = 0

// Apply mode toggle
const unlockpdf_applyModeToggle = document.getElementById('unlockpdf_applyModeToggle')
const unlockpdf_modeAllBtn = document.getElementById('unlockpdf_modeAll')
const unlockpdf_modeIndivBtn = document.getElementById('unlockpdf_modeIndiv')
let unlockpdf_applyMode = 'all'

unlockpdf_modeAllBtn.addEventListener('click', () => {
  unlockpdf_applyMode = 'all'
  unlockpdf_modeAllBtn.style.background = 'var(--accent)'; unlockpdf_modeAllBtn.style.color = 'var(--text-on-accent)'
  unlockpdf_modeIndivBtn.style.background = 'var(--bg-card)'; unlockpdf_modeIndivBtn.style.color = 'var(--text-secondary)'
})
unlockpdf_modeIndivBtn.addEventListener('click', () => {
  unlockpdf_applyMode = 'individual'
  unlockpdf_modeIndivBtn.style.background = 'var(--accent)'; unlockpdf_modeIndivBtn.style.color = 'var(--text-on-accent)'
  unlockpdf_modeAllBtn.style.background = 'var(--bg-card)'; unlockpdf_modeAllBtn.style.color = 'var(--text-secondary)'
})

// ── Password show/hide toggle ────────────────────────────────────────────────
togglePwBtn.addEventListener('click', () => {
  if (pwInput.type === 'password') {
    pwInput.type = 'text'
    togglePwBtn.textContent = hideLbl
  } else {
    pwInput.type = 'password'
    togglePwBtn.textContent = showLbl
  }
})

// ── Enable/disable unlock button based on password input ─────────────────────
pwInput.addEventListener('input', () => {
  updateUnlockBtnState()
})

function updateUnlockBtnState() {
  const hasPassword = pwInput.value.trim().length > 0
  const hasFiles = pdfEntries.length > 0
  if (hasPassword && hasFiles) {
    unlockBtn.disabled = false
    unlockBtn.style.opacity = '1'
    unlockBtn.style.cursor = 'pointer'
    unlockBtn.style.background = 'var(--accent)'
  } else {
    unlockBtn.disabled = true
    unlockBtn.style.opacity = '0.7'
    unlockBtn.style.cursor = 'not-allowed'
    unlockBtn.style.background = 'var(--btn-disabled)'
  }
}

// ── IndexedDB handoff ────────────────────────────────────────────────────────

function makeUnique(usedNames, name) {
  if (!usedNames.has(name)) { usedNames.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot !== -1 ? name.slice(0, dot) : name
  const ext  = dot !== -1 ? name.slice(dot) : ''
  let i = 1
  while (usedNames.has(base + '-' + i + ext)) i++
  const unique = base + '-' + i + ext
  usedNames.add(unique)
  return unique
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
}
async function saveFilesToIDB(items) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    items.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('IDB write failed'))
  })
}

async function loadFilesFromIDB() {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => { store.clear(); resolve(req.result || []) }
    req.onerror = () => reject(new Error('IDB read failed'))
  })
}

async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const records = await loadFilesFromIDB()
    if (!records.length) return
    const files = records.map(r => new File([r.blob], r.name, { type: r.type || 'application/pdf' }))
    addFiles(files)
  } catch (e) { console.warn('[unlock-pdf] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
    { label: ns['add-page-numbers'] || 'Add Page Numbers', href: localHref('add-page-numbers') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => { if (lastResults.length) { try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch(e) {} } window.location.href = b.href })
    nextStepsButtons.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

function resetState() {
  pdfEntries = []
  lastResults = []
  fileList.innerHTML = ''
  fileMeta.classList.remove('on')
  passwordRow.classList.remove('on')
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  statusText.className = 'status-text'
  pwInput.value = ''
  unlockBtn.disabled = true
  unlockBtn.style.opacity = '0.7'
  unlockBtn.style.cursor = 'not-allowed'
  unlockBtn.style.background = 'var(--btn-disabled)'
  unlockBtn.textContent = unlockLbl
  uploadArea.style.display = ''
  document.getElementById('actionRow').style.display = 'none'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

function updateUI() {
  if (pdfEntries.length === 0) {
    fileMeta.classList.remove('on')
    passwordRow.classList.remove('on')
    uploadArea.style.display = ''
    document.getElementById('actionRow').style.display = 'none'
    unlockpdf_applyModeToggle.style.display = 'none'
    updateUnlockBtnState()
    return
  }
  uploadArea.style.display = 'none'
  document.getElementById('actionRow').style.display = 'flex'
  unlockpdf_applyModeToggle.style.display = pdfEntries.length > 1 ? 'block' : 'none'
  const totalSize = pdfEntries.reduce((s, e) => s + e.originalSize, 0)
  fileMetaText.textContent = `${pdfEntries.length} file${pdfEntries.length > 1 ? 's' : ''} \u2014 ${formatSize(totalSize)}`
  fileMeta.classList.add('on')
  passwordRow.classList.add('on')
  updateUnlockBtnState()
}

function removeEntry(idx) {
  pdfEntries.splice(idx, 1)
  renderFileList()
  updateUI()
}

function renderFileList() {
  fileList.innerHTML = ''
  pdfEntries.forEach((entry, i) => {
    const div = document.createElement('div')
    div.className = 'file-item'
    div.innerHTML = `
      <span class="fname">${entry.name}</span>
      <span class="fmeta">${formatSize(entry.originalSize)}</span>
      <span class="fresult" id="result-${i}"></span>
      <span id="dl-${i}"></span>
      <button class="fremove" title="Remove">\u00D7</button>
    `
    div.querySelector('.fremove').addEventListener('click', () => removeEntry(i))
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('fremove') || e.target.tagName === 'A') return
      unlockpdf_activeIndex = i
      fileList.querySelectorAll('.file-item').forEach((el, j) => {
        el.style.borderColor = j === i ? 'var(--accent)' : ''
      })
    })
    if (i === unlockpdf_activeIndex) div.style.borderColor = 'var(--accent)'
    fileList.appendChild(div)
    entry.itemEl = div
  })
}

// ── Add files ──────────────────────────────────────────────────────────────
async function addFiles(files) {
  const validFiles = Array.from(files).filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  )
  if (!validFiles.length) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files.'
    return
  }

  let skipped = 0
  for (const file of validFiles) {
    if (pdfEntries.length >= 25) {
      statusText.textContent = 'Maximum 25 files.'
      break
    }
    if (file.size > 50 * 1024 * 1024) {
      statusText.textContent = `"${file.name}" is too large. Maximum 50 MB per file.`
      skipped++
      continue
    }
    pdfEntries.push({ file, name: file.name, originalSize: file.size })
  }

  renderFileList()
  updateUI()
  if (skipped === 0) statusText.textContent = ''
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles(fileInput.files)
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
})

// ── Auto-download helper ─────────────────────────────────────────────────────
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// ── Unlock single PDF ────────────────────────────────────────────────────────
async function unlockSinglePdf(file, password) {
  const srcBuf = await file.arrayBuffer()
  const pdfBytes = new Uint8Array(srcBuf)

  // Check if encrypted
  const encInfo = await isEncrypted(pdfBytes)
  if (!encInfo.encrypted) {
    throw new Error('NOT_ENCRYPTED')
  }

  // Decrypt
  const decryptedBytes = await decryptPDF(pdfBytes, password)
  return new Blob([decryptedBytes], { type: 'application/pdf' })
}

// ── Unlock all ───────────────────────────────────────────────────────────────
unlockBtn.addEventListener('click', async () => {
  if (!pdfEntries.length) return
  const password = pwInput.value
  if (!password) return

  unlockBtn.disabled = true
  unlockBtn.textContent = unlockingLbl
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  statusText.className = 'status-text'

  let successCount = 0

  // Determine which entries to process
  const indicesToProcess = (unlockpdf_applyMode === 'individual' && pdfEntries.length > 1)
    ? [unlockpdf_activeIndex]
    : pdfEntries.map((_, i) => i)

  for (const i of indicesToProcess) {
    const entry = pdfEntries[i]
    statusText.textContent = pdfEntries.length > 1
      ? `Unlocking (${i + 1}/${pdfEntries.length}) \u2014 ${entry.name}`
      : `Unlocking \u2014 ${entry.name}`

    try {
      const blob = await unlockSinglePdf(entry.file, password)
      entry.unlockedBlob = blob

      const resultEl = document.getElementById('result-' + i)
      const dlEl = document.getElementById('dl-' + i)
      if (resultEl) {
        resultEl.textContent = t.unlkpdf_unlocked || 'Unlocked'
        resultEl.className = 'fresult ok'
      }
      if (dlEl) {
        const a = document.createElement('a')
        a.className = 'fdl'
        a.textContent = dlBtn
        const url = URL.createObjectURL(blob)
        a.href = url
        a.download = entry.name.replace(/\.pdf$/i, '') + '-unlocked.pdf'
        a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 10000))
        dlEl.appendChild(a)
      }
      successCount++
    } catch (err) {
      console.error('[unlock-pdf] failed:', entry.name, err)
      const resultEl = document.getElementById('result-' + i)
      if (resultEl) {
        if (err.message === 'NOT_ENCRYPTED') {
          resultEl.textContent = notEncLbl
          resultEl.className = 'fresult err'
        } else {
          resultEl.textContent = wrongPwLbl
          resultEl.className = 'fresult err'
        }
      }
    }
  }

  // Auto-download for single file or individual mode
  if (indicesToProcess.length === 1) {
    const idx = indicesToProcess[0]
    if (pdfEntries[idx] && pdfEntries[idx].unlockedBlob) {
      triggerDownload(
        pdfEntries[idx].unlockedBlob,
        pdfEntries[idx].name.replace(/\.pdf$/i, '') + '-unlocked.pdf'
      )
    }
  }

  if (successCount === indicesToProcess.length) {
    statusText.textContent = t.unlkpdf_done || 'All PDFs unlocked successfully.'
    statusText.className = 'status-text'
  } else if (successCount > 0) {
    statusText.textContent = t.unlkpdf_partial || `${successCount} of ${indicesToProcess.length} PDFs unlocked.`
    statusText.className = 'status-text'
  } else {
    statusText.textContent = wrongPwLbl
    statusText.className = 'status-text error'
  }

  unlockBtn.textContent = unlockLbl
  unlockBtn.disabled = false
  updateUnlockBtnState()

  // Show ZIP button if multiple successful in 'all' mode
  const successEntries = pdfEntries.filter(e => e.unlockedBlob)
  if (successEntries.length > 1 && unlockpdf_applyMode === 'all') {
    zipBtn.style.display = 'block'
  }

  lastResults = successEntries.map(e => ({ blob: e.unlockedBlob, name: e.name.replace(/\.pdf$/i, '') + '-unlocked.pdf', type: 'application/pdf' }))
  if (window.showReviewPrompt) window.showReviewPrompt()
  if (successCount > 0) buildNextSteps()
})

// ── ZIP download ──────────────────────────────────────────────────────────
zipBtn.addEventListener('click', async () => {
  const results = pdfEntries.filter(e => e.unlockedBlob)
  if (!results.length) return
  zipBtn.textContent = 'Zipping\u2026'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) {
      zip.file(r.name.replace(/\.pdf$/i, '') + '-unlocked.pdf', await r.unlockedBlob.arrayBuffer())
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'unlocked-pdfs.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, 'unlocked-pdfs.zip', 'unlock-pdf')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

// ── SEO Section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['unlock-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
