import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('compress-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['compress-pdf']) || 'Compress PDF'
const seoData   = t.seo && t.seo['compress-pdf']
const descText  = t.compresspdf_desc || t.card_compress_pdf_desc || 'Reduce PDF file size by optimizing images.'
const selectLbl = t.compresspdf_select || 'Select PDFs'
const dropHint  = t.compresspdf_drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const compressLbl   = t.compresspdf_compress_btn || 'Compress PDFs'
const compressingLbl = t.compresspdf_compressing || 'Compressing\u2026'
const qualityLabel  = t.compresspdf_quality_label || 'Compression level'
const pagesLabel = t.compresspdf_pages || 'pages'
const loadingLbl = t.compresspdf_loading || 'Loading PDF\u2026'
const lowLbl     = t.compresspdf_low || 'Low'
const mediumLbl  = t.compresspdf_medium || 'Medium'
const highLbl    = t.compresspdf_high || 'High'
const origSizeLbl = t.compresspdf_original_size || 'Original'
const compSizeLbl = t.compresspdf_compressed_size || 'Compressed'
const savedLbl    = t.compresspdf_saved || 'Saved'
const addMoreLbl  = t.add_more || 'Add more'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #qualityRow{display:none;align-items:center;gap:12px;margin-bottom:14px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:12px 16px;flex-wrap:wrap;}
  #qualityRow.on{display:flex;}
  #qualityRow label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  .quality-options{display:flex;gap:6px;}
  .quality-btn{padding:6px 14px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);cursor:pointer;transition:all 0.15s;font-weight:500;}
  .quality-btn:hover{border-color:var(--accent);color:var(--accent);}
  .quality-btn.active{background:var(--accent);color:var(--text-on-accent);border-color:var(--accent);}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #fileList{margin-bottom:14px;}
  .file-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);margin-bottom:8px;font-family:'DM Sans',sans-serif;}
  .file-item .fname{flex:1;font-size:13px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-item .fmeta{font-size:11px;color:var(--text-muted);white-space:nowrap;}
  .file-item .fresult{font-size:11px;font-weight:700;white-space:nowrap;}
  .file-item .fresult.saved{color:#16a34a;}
  .file-item .fresult.larger{color:#dc2626;}
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
  #totalSummary{display:none;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:16px 20px;margin-bottom:14px;font-family:'DM Sans',sans-serif;}
  #totalSummary.on{display:block;}
  .size-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:6px;}
  .size-row:last-child{margin-bottom:0;}
  .size-label{font-size:12px;font-weight:600;color:var(--text-secondary);min-width:90px;}
  .size-value{font-size:14px;font-weight:700;color:var(--text-primary);}
  .size-saved{font-size:13px;font-weight:700;color:#16a34a;}
  .size-bar-wrap{width:100%;height:8px;background:var(--bg-surface);border-radius:4px;overflow:hidden;margin-top:6px;}
  .size-bar{height:100%;background:var(--accent);border-radius:4px;transition:width 0.6s ease;}
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

document.title = t.compresspdf_page_title || (seoData ? seoData.page_title : 'Compress PDF Free | Reduce PDF Size Online \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.compresspdf_meta_desc || 'Compress PDF free. Reduce PDF file size by optimizing images.'
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
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop PDFs here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileList"></div>
    <div id="qualityRow">
      <label>${qualityLabel}:</label>
      <div class="quality-options">
        <button class="quality-btn" data-level="low">${lowLbl}</button>
        <button class="quality-btn active" data-level="medium">${mediumLbl}</button>
        <button class="quality-btn" data-level="high">${highLbl}</button>
      </div>
      <span style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;" id="qualityHint"></span>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Clear all'}</button></div>
    <div id="totalSummary">
      <div class="size-row">
        <span class="size-label">${origSizeLbl}:</span>
        <span class="size-value" id="origSize">-</span>
      </div>
      <div class="size-row">
        <span class="size-label">${compSizeLbl}:</span>
        <span class="size-value" id="compSize">-</span>
        <span class="size-saved" id="savedPct"></span>
      </div>
      <div class="size-bar-wrap"><div class="size-bar" id="sizeBar" style="width:100%;"></div></div>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="compresspdf_applyModeToggle" style="display:none;margin-bottom:12px;">
      <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
        <button id="compresspdf_modeAll" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
        <button id="compresspdf_modeIndiv" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
      </div>
    </div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="compressBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${compressLbl}</button>
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
const qualityRow   = document.getElementById('qualityRow')
const qualityHint  = document.getElementById('qualityHint')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn    = document.getElementById('removeBtn')
const compressBtn  = document.getElementById('compressBtn')
const zipBtn       = document.getElementById('zipBtn')
const statusText   = document.getElementById('statusText')
const totalSummary = document.getElementById('totalSummary')
const origSizeEl   = document.getElementById('origSize')
const compSizeEl   = document.getElementById('compSize')
const savedPctEl   = document.getElementById('savedPct')
const sizeBar      = document.getElementById('sizeBar')
const uploadArea   = document.getElementById('uploadArea')

// Apply mode toggle
const compresspdf_applyModeToggle = document.getElementById('compresspdf_applyModeToggle')
const compresspdf_modeAllBtn = document.getElementById('compresspdf_modeAll')
const compresspdf_modeIndivBtn = document.getElementById('compresspdf_modeIndiv')
let compresspdf_applyMode = 'all'
let compresspdf_activeIndex = 0

compresspdf_modeAllBtn.addEventListener('click', () => {
  compresspdf_applyMode = 'all'
  compresspdf_modeAllBtn.style.background = 'var(--accent)'; compresspdf_modeAllBtn.style.color = 'var(--text-on-accent)'
  compresspdf_modeIndivBtn.style.background = 'var(--bg-card)'; compresspdf_modeIndivBtn.style.color = 'var(--text-secondary)'
})
compresspdf_modeIndivBtn.addEventListener('click', () => {
  compresspdf_applyMode = 'individual'
  compresspdf_modeIndivBtn.style.background = 'var(--accent)'; compresspdf_modeIndivBtn.style.color = 'var(--text-on-accent)'
  compresspdf_modeAllBtn.style.background = 'var(--bg-card)'; compresspdf_modeAllBtn.style.color = 'var(--text-secondary)'
})

// State
let pdfEntries = [] // { file, name, originalSize, compressedBlob?, compressedSize?, itemEl }
let selectedLevel = 'medium'

const QUALITY_PRESETS = {
  low:    { jpeg: 0.40, scale: 1.0, hint: 'Smallest file, lower quality' },
  medium: { jpeg: 0.65, scale: 1.5, hint: 'Balanced quality and size' },
  high:   { jpeg: 0.85, scale: 2.0, hint: 'Best quality, moderate compression' },
}

updateQualityHint()

document.querySelectorAll('.quality-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedLevel = btn.dataset.level
    updateQualityHint()
  })
})

function updateQualityHint() {
  const preset = QUALITY_PRESETS[selectedLevel]
  qualityHint.textContent = t['compresspdf_hint_' + selectedLevel] || preset.hint
}

// ── Lazy-load PDF.js ────────────────────────────────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
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
let lastResults = []

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
  } catch (e) { console.warn('[compress-pdf] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
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
  fileList.innerHTML = ''
  fileMeta.classList.remove('on')
  qualityRow.classList.remove('on')
  totalSummary.classList.remove('on')
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  compressBtn.disabled = true
  compressBtn.style.opacity = '0.7'
  compressBtn.style.cursor = 'not-allowed'
  compressBtn.style.background = 'var(--btn-disabled)'
  compressBtn.textContent = compressLbl
  uploadArea.style.display = ''
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

function updateUI() {
  if (pdfEntries.length === 0) {
    fileMeta.classList.remove('on')
    qualityRow.classList.remove('on')
    compressBtn.disabled = true
    compressBtn.style.opacity = '0.7'
    compressBtn.style.cursor = 'not-allowed'
    compressBtn.style.background = 'var(--btn-disabled)'
    uploadArea.style.display = ''
    document.getElementById('actionRow').style.display = 'none'
    compresspdf_applyModeToggle.style.display = 'none'
    return
  }
  uploadArea.style.display = 'none'
  document.getElementById('actionRow').style.display = 'flex'
  compresspdf_applyModeToggle.style.display = pdfEntries.length > 1 ? 'block' : 'none'
  const totalSize = pdfEntries.reduce((s, e) => s + e.originalSize, 0)
  fileMetaText.textContent = `${pdfEntries.length} file${pdfEntries.length > 1 ? 's' : ''} \u2014 ${formatSize(totalSize)}`
  fileMeta.classList.add('on')
  qualityRow.classList.add('on')
  compressBtn.disabled = false
  compressBtn.style.opacity = '1'
  compressBtn.style.cursor = 'pointer'
  compressBtn.style.background = 'var(--accent)'
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
      compresspdf_activeIndex = i
      fileList.querySelectorAll('.file-item').forEach((el, j) => {
        el.style.borderColor = j === i ? 'var(--accent)' : ''
      })
    })
    if (i === compresspdf_activeIndex) div.style.borderColor = 'var(--accent)'
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

// ── Render page to JPEG ───────────────────────────────────────────────────
function renderPageToJpeg(page, scale, jpegQuality) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise.then(() => {
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', jpegQuality))
  })
}

// ── Compress single PDF ───────────────────────────────────────────────────
async function compressSinglePdf(file, preset, onPageProgress) {
  const pdfjs = await loadPdfJs()
  const srcBuf = await file.arrayBuffer()
  const srcDoc = await pdfjs.getDocument({ data: new Uint8Array(srcBuf) }).promise

  const newPdf = await PDFDocument.create()

  for (let i = 1; i <= srcDoc.numPages; i++) {
    if (onPageProgress) onPageProgress(i, srcDoc.numPages)
    const page = await srcDoc.getPage(i)
    const jpegBlob = await renderPageToJpeg(page, preset.scale, preset.jpeg)
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())
    const jpegImage = await newPdf.embedJpg(jpegBytes)

    const origViewport = page.getViewport({ scale: 1 })
    const pageWidth = origViewport.width * 0.75
    const pageHeight = origViewport.height * 0.75

    const newPage = newPdf.addPage([pageWidth, pageHeight])
    newPage.drawImage(jpegImage, { x: 0, y: 0, width: pageWidth, height: pageHeight })
  }

  const compressedBytes = await newPdf.save()
  srcDoc.destroy()
  const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' })
  // If "compressed" is larger than original, return original instead
  if (compressedBlob.size >= file.size) {
    return new Blob([await file.arrayBuffer()], { type: 'application/pdf' })
  }
  return compressedBlob
}

// ── Compress all ──────────────────────────────────────────────────────────
compressBtn.addEventListener('click', async () => {
  if (!pdfEntries.length) return
  compressBtn.disabled = true
  compressBtn.textContent = compressingLbl
  zipBtn.style.display = 'none'
  totalSummary.classList.remove('on')

  const preset = QUALITY_PRESETS[selectedLevel]
  let totalOriginal = 0
  let totalCompressed = 0

  // Determine which entries to process
  const indicesToProcess = (compresspdf_applyMode === 'individual' && pdfEntries.length > 1)
    ? [compresspdf_activeIndex]
    : pdfEntries.map((_, i) => i)

  for (const i of indicesToProcess) {
    const entry = pdfEntries[i]
    try {
      const blob = await compressSinglePdf(entry.file, preset, (page, total) => {
        statusText.textContent = `${compressingLbl} — ${entry.name} (page ${page}/${total})`
      })
      entry.compressedBlob = blob
      entry.compressedSize = blob.size
      totalOriginal += entry.originalSize
      totalCompressed += entry.compressedSize

      const pctSaved = Math.round((1 - entry.compressedSize / entry.originalSize) * 100)
      const resultEl = document.getElementById('result-' + i)
      const dlEl = document.getElementById('dl-' + i)
      if (resultEl) {
        if (pctSaved > 0) {
          resultEl.textContent = `${formatSize(entry.compressedSize)} (-${pctSaved}%)`
          resultEl.className = 'fresult saved'
        } else {
          resultEl.textContent = `${formatSize(entry.compressedSize)} (+${Math.abs(pctSaved)}%)`
          resultEl.className = 'fresult larger'
        }
      }
      if (dlEl) {
        const a = document.createElement('a')
        a.className = 'fdl'
        a.textContent = dlBtn
        const url = URL.createObjectURL(blob)
        a.href = url
        a.download = entry.name.replace(/\.pdf$/i, '') + '-compressed.pdf'
        a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 10000))
        dlEl.appendChild(a)
      }

      // Auto-download for individual mode
      if (compresspdf_applyMode === 'individual' && pdfEntries.length > 1) {
        const outName = entry.name.replace(/\.pdf$/i, '') + '-compressed.pdf'
        const dlUrl = URL.createObjectURL(blob)
        const dlA = document.createElement('a')
        dlA.href = dlUrl
        dlA.download = outName
        dlA.click()
        setTimeout(() => URL.revokeObjectURL(dlUrl), 10000)
      }
    } catch (err) {
      console.error('[compress-pdf] failed:', entry.name, err)
      const resultEl = document.getElementById('result-' + i)
      if (resultEl) {
        resultEl.textContent = 'Failed'
        resultEl.className = 'fresult larger'
      }
    }
  }

  // Show total summary
  if (totalOriginal > 0) {
    origSizeEl.textContent = formatSize(totalOriginal)
    compSizeEl.textContent = formatSize(totalCompressed)
    const totalPct = Math.round((1 - totalCompressed / totalOriginal) * 100)
    if (totalPct > 0) {
      savedPctEl.textContent = `(-${totalPct}% ${savedLbl.toLowerCase()})`
      savedPctEl.style.color = '#16a34a'
    } else {
      savedPctEl.textContent = `(+${Math.abs(totalPct)}% larger)`
      savedPctEl.style.color = '#dc2626'
    }
    const barPct = Math.min(100, Math.round((totalCompressed / totalOriginal) * 100))
    sizeBar.style.width = barPct + '%'
    totalSummary.classList.add('on')
  }

  statusText.textContent = t.compresspdf_done || 'Compression complete.'
  compressBtn.textContent = compressLbl
  compressBtn.disabled = false

  // Show ZIP button if multiple files compressed in 'all' mode
  const successEntries = pdfEntries.filter(e => e.compressedBlob)
  if (successEntries.length > 1 && compresspdf_applyMode === 'all') {
    zipBtn.style.display = 'block'
  }

  const successResults = pdfEntries.filter(e => e.compressedBlob)
  lastResults = successResults.map(e => ({ blob: e.compressedBlob, name: e.name.replace(/.pdf$/i, '') + '-compressed.pdf', type: 'application/pdf' }))
  if (window.showReviewPrompt) window.showReviewPrompt()
  buildNextSteps()
})

// ── ZIP download ──────────────────────────────────────────────────────────
zipBtn.addEventListener('click', async () => {
  const results = pdfEntries.filter(e => e.compressedBlob)
  if (!results.length) return
  zipBtn.textContent = 'Zipping\u2026'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) {
      zip.file(r.name.replace(/\.pdf$/i, '') + '-compressed.pdf', await r.compressedBlob.arrayBuffer())
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'compressed-pdfs.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, 'compressed-pdfs.zip', 'compress-pdf')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

// ── SEO Section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['compress-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
