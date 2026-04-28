import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite'

injectHreflang('protect-pdf'

const t = getT()

const toolName  = (t.nav_short && t.nav_short['protect-pdf']) || 'Protect PDF'
const seoData   = t.seo && t.seo['protect-pdf']
const descText  = t.protpdf_desc || t.card_protect_pdf_desc || 'Add password protection to your PDF files.'
const selectLbl = t.protpdf_select || t.pdfpng_select || 'Select PDFs'
const dropHint  = t.protpdf_drop_hint || t.pdfpng_drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const protectLbl    = t.protpdf_protect_btn || 'Protect PDFs'
const protectingLbl = t.protpdf_protecting || 'Encrypting\u2026'
const passwordLbl   = t.protpdf_password || 'Password'
const confirmLbl    = t.protpdf_confirm || 'Confirm password'
const mismatchLbl   = t.protpdf_mismatch || 'Passwords do not match'
const addMoreLbl    = t.add_more || 'Add more'

const MAX_FILES = LIMITS.MAX_FILES || 25
const MAX_FILE_SIZE = 50 * 1024 * 1024

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style'
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #optionsRow{display:none;margin-bottom:14px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:16px 18px;}
  #optionsRow.on{display:block;}
  .opt-field{margin-bottom:12px;}
  .opt-field:last-child{margin-bottom:0;}
  .opt-field label{display:block;font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;margin-bottom:5px;}
  .pw-wrap{position:relative;display:flex;align-items:center;}
  .pw-wrap input{width:100%;padding:9px 40px 9px 12px;border:1.5px solid var(--border-light);border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);outline:none;transition:border-color 0.15s;}
  .pw-wrap input:focus{border-color:var(--accent);}
  .pw-toggle{position:absolute;right:8px;background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);font-size:13px;font-family:'DM Sans',sans-serif;font-weight:600;}
  .pw-toggle:hover{color:var(--text-primary);}
  .pw-error{font-size:12px;color:#dc2626;font-family:'DM Sans',sans-serif;margin-top:6px;display:none;}
  .pw-error.on{display:block;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #fileList{margin-bottom:14px;}
  .file-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);margin-bottom:8px;font-family:'DM Sans',sans-serif;}
  .file-item .fname{flex:1;font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-item .fmeta{font-size:11px;color:var(--text-muted);white-space:nowrap;}
  .file-item .fresult{font-size:11px;font-weight:700;white-space:nowrap;color:#16a34a;}
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

document.title = t.protpdf_page_title || 'Protect PDF Free | Add Password to PDF Online \u2014 RelahConvert'
const _metaDesc = document.createElement('meta'
_metaDesc.name = 'description'
_metaDesc.content = t.protpdf_meta_desc || 'Protect PDF with a password. Add encryption to your PDF files for free.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' '
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' '

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
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${t.pdfpng_drop_hint || 'Drop PDFs here'}</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileList"></div>
    <div id="optionsRow">
      <div class="opt-field">
        <label for="pwInput">${passwordLbl}</label>
        <div class="pw-wrap">
          <input type="password" id="pwInput" autocomplete="new-password" placeholder="Enter password" />
          <button class="pw-toggle" id="pwToggle1" type="button">Show</button>
        </div>
      </div>
      <div class="opt-field">
        <label for="pwConfirm">${confirmLbl}</label>
        <div class="pw-wrap">
          <input type="password" id="pwConfirm" autocomplete="new-password" placeholder="Confirm password" />
          <button class="pw-toggle" id="pwToggle2" type="button">Show</button>
        </div>
        <div class="pw-error" id="pwError">${mismatchLbl}</div>
      </div>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Clear all'}</button></div>
    <div class="status-text" id="statusText"></div>
    <div id="protectpdf_applyModeToggle" style="display:none;margin-bottom:12px;">
      <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
        <button id="protectpdf_modeAll" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
        <button id="protectpdf_modeIndiv" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
      </div>
    </div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="protectBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${protectLbl}</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput'
const fileList     = document.getElementById('fileList'
const optionsRow   = document.getElementById('optionsRow'
const fileMeta     = document.getElementById('fileMeta'
const fileMetaText = document.getElementById('fileMetaText'
const removeBtn    = document.getElementById('removeBtn'
const protectBtn   = document.getElementById('protectBtn'
const zipBtn       = document.getElementById('zipBtn'
const statusText   = document.getElementById('statusText'
const uploadArea   = document.getElementById('uploadArea'
const pwInput      = document.getElementById('pwInput'
const pwConfirm    = document.getElementById('pwConfirm'
const pwError      = document.getElementById('pwError'
const pwToggle1    = document.getElementById('pwToggle1'
const pwToggle2    = document.getElementById('pwToggle2'

// State
let pdfEntries = [] // { file, name, originalSize, protectedBlob?, itemEl }
let lastResults = []
let protectpdf_activeIndex = 0

// Apply mode toggle
const protectpdf_applyModeToggle = document.getElementById('protectpdf_applyModeToggle'
const protectpdf_modeAllBtn = document.getElementById('protectpdf_modeAll'
const protectpdf_modeIndivBtn = document.getElementById('protectpdf_modeIndiv'
let protectpdf_applyMode = 'all'

protectpdf_modeAllBtn.addEventListener('click', () => {
  protectpdf_applyMode = 'all'
  protectpdf_modeAllBtn.style.background = 'var(--accent)'; protectpdf_modeAllBtn.style.color = 'var(--text-on-accent)'
  protectpdf_modeIndivBtn.style.background = 'var(--bg-card)'; protectpdf_modeIndivBtn.style.color = 'var(--text-secondary)'
})
protectpdf_modeIndivBtn.addEventListener('click', () => {
  protectpdf_applyMode = 'individual'
  protectpdf_modeIndivBtn.style.background = 'var(--accent)'; protectpdf_modeIndivBtn.style.color = 'var(--text-on-accent)'
  protectpdf_modeAllBtn.style.background = 'var(--bg-card)'; protectpdf_modeAllBtn.style.color = 'var(--text-secondary)'
})

// ── Password show/hide toggles ──────────────────────────────────────────────
function setupToggle(toggleBtn, inputEl) {
  toggleBtn.addEventListener('click', () => {
    const isPassword = inputEl.type === 'password'
    inputEl.type = isPassword ? 'text' : 'password'
    toggleBtn.textContent = isPassword ? 'Hide' : 'Show'
  })
}
setupToggle(pwToggle1, pwInput)
setupToggle(pwToggle2, pwConfirm)

// ── Password validation ─────────────────────────────────────────────────────
function validatePasswords() {
  const pw = pwInput.value
  const cf = pwConfirm.value
  if (cf.length > 0 && pw !== cf) {
    pwError.classList.add('on'
    return false
  }
  pwError.classList.remove('on'
  if (pw.length > 0 && pw === cf && pdfEntries.length > 0) return true
  return false
}

function updateProtectBtn() {
  const valid = validatePasswords()
  if (valid) {
    protectBtn.disabled = false
    protectBtn.style.opacity = '1'
    protectBtn.style.cursor = 'pointer'
    protectBtn.style.background = 'var(--accent)'
  } else {
    protectBtn.disabled = true
    protectBtn.style.opacity = '0.7'
    protectBtn.style.cursor = 'not-allowed'
    protectBtn.style.background = 'var(--btn-disabled)'
  }
}

pwInput.addEventListener('input', updateProtectBtn)
pwConfirm.addEventListener('input', updateProtectBtn)

// ── IndexedDB handoff ────────────────────────────────────────────────────────

function makeUnique(usedNames, name) {
  if (!usedNames.has(name)) { usedNames.add(name); return name }
  const dot = name.lastIndexOf('.'
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
    const tx = db.transaction('pending', 'readwrite'
    const store = tx.objectStore('pending'
    store.clear()
    items.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('IDB write failed'))
  })
}

async function loadFilesFromIDB() {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite'
  const store = tx.objectStore('pending'
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => { store.clear(); resolve(req.result || []) }
    req.onerror = () => reject(new Error('IDB read failed'))
  })
}

async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB'
  try {
    const records = await loadFilesFromIDB()
    if (!records.length) return
    const files = records.map(r => new File([r.blob], r.name, { type: r.type || 'application/pdf' }))
    addFiles(files)
  } catch (e) { console.warn('[protect-pdf] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
    { label: ns['add-page-numbers'] || 'Add Page Numbers', href: localHref('add-page-numbers') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons'
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button'
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
  fileMeta.classList.remove('on'
  optionsRow.classList.remove('on'
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  pwInput.value = ''
  pwConfirm.value = ''
  pwError.classList.remove('on'
  protectBtn.disabled = true
  protectBtn.style.opacity = '0.7'
  protectBtn.style.cursor = 'not-allowed'
  protectBtn.style.background = 'var(--btn-disabled)'
  protectBtn.textContent = protectLbl
  uploadArea.style.display = ''
  document.getElementById('actionRow').style.display = 'none'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

function updateUI() {
  if (pdfEntries.length === 0) {
    fileMeta.classList.remove('on'
    optionsRow.classList.remove('on'
    uploadArea.style.display = ''
    document.getElementById('actionRow').style.display = 'none'
    protectpdf_applyModeToggle.style.display = 'none'
    return
  }
  uploadArea.style.display = 'none'
  document.getElementById('actionRow').style.display = 'flex'
  protectpdf_applyModeToggle.style.display = pdfEntries.length > 1 ? 'block' : 'none'
  optionsRow.classList.add('on'
  const totalSize = pdfEntries.reduce((s, e) => s + e.originalSize, 0)
  fileMetaText.textContent = `${pdfEntries.length} file${pdfEntries.length > 1 ? 's' : ''} \u2014 ${formatSize(totalSize)}`
  fileMeta.classList.add('on'
  updateProtectBtn()
}

function removeEntry(idx) {
  pdfEntries.splice(idx, 1)
  renderFileList()
  updateUI()
}

function renderFileList() {
  fileList.innerHTML = ''
  pdfEntries.forEach((entry, i) => {
    const div = document.createElement('div'
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
      protectpdf_activeIndex = i
      fileList.querySelectorAll('.file-item').forEach((el, j) => {
        el.style.borderColor = j === i ? 'var(--accent)' : ''
      })
    })
    if (i === protectpdf_activeIndex) div.style.borderColor = 'var(--accent)'
    fileList.appendChild(div)
    entry.itemEl = div
  })
}

// ── Add files ──────────────────────────────────────────────────────────────
async function addFiles(files) {
  const validFiles = Array.from(files).filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'
  )
  if (!validFiles.length) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files.'
    return
  }

  let skipped = 0
  for (const file of validFiles) {
    if (pdfEntries.length >= MAX_FILES) {
      statusText.textContent = `Maximum ${MAX_FILES} files.`
      break
    }
    if (file.size > MAX_FILE_SIZE) {
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
  const a = document.createElement('a'
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// ── Encrypt single PDF ───────────────────────────────────────────────────────
async function encryptSinglePdf(file, password) {
  const srcBuf = await file.arrayBuffer()
  const pdfBytes = new Uint8Array(srcBuf)
  const encryptedBytes = await encryptPDF(pdfBytes, password)
  return new Blob([encryptedBytes], { type: 'application/pdf' })
}

// ── Protect all ──────────────────────────────────────────────────────────────
protectBtn.addEventListener('click', async () => {
  if (!pdfEntries.length) return
  if (!validatePasswords()) return

  const password = pwInput.value
  protectBtn.disabled = true
  protectBtn.textContent = protectingLbl
  zipBtn.style.display = 'none'

  // Determine which entries to process
  const indicesToProcess = (protectpdf_applyMode === 'individual' && pdfEntries.length > 1)
    ? [protectpdf_activeIndex]
    : pdfEntries.map((_, i) => i)
  const isSingle = indicesToProcess.length === 1

  for (const i of indicesToProcess) {
    const entry = pdfEntries[i]
    statusText.textContent = `Encrypting (${i + 1}/${pdfEntries.length}) \u2014 ${entry.name}`
    try {
      const blob = await encryptSinglePdf(entry.file, password)
      entry.protectedBlob = blob
      const outName = entry.name.replace(/\.pdf$/i, '') + '-protected.pdf'

      const resultEl = document.getElementById('result-' + i)
      const dlEl = document.getElementById('dl-' + i)
      if (resultEl) {
        resultEl.textContent = 'Protected'
      }

      if (isSingle) {
        triggerDownload(blob, outName)
      } else if (dlEl) {
        const a = document.createElement('a'
        a.className = 'fdl'
        a.textContent = dlBtn
        const url = URL.createObjectURL(blob)
        a.href = url
        a.download = outName
        a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 10000))
        dlEl.appendChild(a)
      }
    } catch (err) {
      console.error('[protect-pdf] failed:', entry.name, err)
      const resultEl = document.getElementById('result-' + i)
      if (resultEl) {
        resultEl.textContent = 'Failed'
        resultEl.style.color = '#dc2626'
      }
    }
  }

  statusText.textContent = t.protpdf_done || 'Encryption complete.'
  protectBtn.textContent = protectLbl
  protectBtn.disabled = false

  // Show ZIP button if multiple files in 'all' mode
  const successEntries = pdfEntries.filter(e => e.protectedBlob)
  if (successEntries.length > 1 && protectpdf_applyMode === 'all') {
    zipBtn.style.display = 'block'
  }

  lastResults = successEntries.map(e => ({ blob: e.protectedBlob, name: e.name.replace(/\.pdf$/i, '') + '-protected.pdf', type: 'application/pdf' }))

  if (isSingle && successEntries.length === 1) {
    window.rcShowSaveButton?.(protectBtn.parentElement, successEntries[0].protectedBlob, successEntries[0].name.replace(/\.pdf$/i, '') + '-protected.pdf', 'protect-pdf'
  }
  if (window.showReviewPrompt) window.showReviewPrompt()
  buildNextSteps()
})

// ── ZIP download ──────────────────────────────────────────────────────────────
zipBtn.addEventListener('click', async () => {
  const results = pdfEntries.filter(e => e.protectedBlob)
  if (!results.length) return
  zipBtn.textContent = 'Zipping\u2026'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) {
      zip.file(r.name.replace(/\.pdf$/i, '') + '-protected.pdf', await r.protectedBlob.arrayBuffer())
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a'
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'protected-pdfs.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, 'protected-pdfs.zip', 'protect-pdf'
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

// ── SEO Section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['protect-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div'
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()