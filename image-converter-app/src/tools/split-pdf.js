import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('split-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['split-pdf']) || 'Split PDF'
const seoData   = t.seo && t.seo['split-pdf']
const descText  = t.splitpdf_desc || t.card_split_pdf_desc || 'Split a PDF into separate pages or custom page ranges.'
const selectLbl = t.splitpdf_select || 'Select PDFs'
const dropHint  = t.splitpdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const dlZipLbl  = t.download_zip || 'Download All as ZIP'
const splitBtnLbl   = t.splitpdf_split_btn || 'Split'
const splittingLbl  = t.splitpdf_splitting || 'Splitting'
const pageLabel     = t.splitpdf_page || t.pdfpng_page || 'Page'
const pagesLabel    = t.splitpdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl    = t.splitpdf_loading || 'Loading PDF...'
const filesLabel    = t.splitpdf_files || 'files'
const modeAllLbl    = t.splitpdf_mode_all || 'Split All Pages'
const modeCustomLbl = t.splitpdf_mode_custom || 'Custom Ranges'
const customPlaceholder = t.splitpdf_custom_placeholder || 'e.g. 1-3, 5, 7-10'
const splitCurrentLbl   = t.splitpdf_split_current || 'Split Current'
const splitAllZipLbl    = t.splitpdf_split_all_zip || 'Split All Files & Download ZIP'
const addMoreLbl        = t.splitpdf_add_more || '+ Add more'
const clearLbl          = t.splitpdf_clear || 'Clear'

const MAX_FILES = LIMITS.MAX_FILES || 25
const MAX_FILE_SIZE = 50 * 1024 * 1024

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
  #fileTabs{display:flex;gap:0;margin-bottom:14px;flex-wrap:wrap;border-bottom:2px solid var(--border-light);}
  .file-tab{padding:8px 16px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;color:var(--text-secondary);background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;cursor:pointer;transition:all 0.15s;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;}
  .file-tab:hover{color:var(--accent);}
  .file-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
  .file-tab.add-tab{color:var(--text-muted);font-weight:500;font-size:12px;}
  .file-tab.add-tab:hover{color:var(--accent);}
  #fileHeader{display:none;align-items:center;gap:10px;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  #fileHeader.on{display:flex;}
  #fileHeader .fh-name{flex:1;font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  #fileHeader .fh-meta{font-size:12px;color:var(--text-muted);white-space:nowrap;}
  #fileHeader .fh-clear{background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;padding:0;}
  #fileHeader .fh-clear:hover{opacity:0.7;}
  #modeRow{display:none;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
  #modeRow.on{display:flex;}
  .mode-btn{padding:7px 16px;border-radius:8px;border:1.5px solid var(--border);font-size:13px;font-weight:600;color:var(--text-secondary);background:var(--bg-card);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .mode-btn:hover{border-color:var(--accent);color:var(--accent);}
  .mode-btn.active{background:var(--accent);color:var(--text-on-accent);border-color:var(--accent);}
  #customRangeRow{display:none;margin-bottom:12px;}
  #customRangeRow.on{display:block;}
  #customRangeInput{width:100%;max-width:360px;padding:9px 14px;border-radius:8px;border:1.5px solid var(--border);font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);outline:none;transition:border-color 0.15s;}
  #customRangeInput:focus{border-color:var(--accent);}
  #pageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-bottom:16px;}
  .page-thumb{position:relative;background:var(--bg-card);border-radius:10px;border:2px solid var(--border);overflow:hidden;cursor:pointer;transition:all 0.18s;user-select:none;}
  .page-thumb canvas{width:100%;height:140px;object-fit:contain;display:block;background:var(--bg-surface);}
  .page-thumb .plabel{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;text-align:center;}
  .page-thumb .pnum{position:absolute;top:6px;left:6px;background:var(--btn-dark);color:var(--text-on-accent);font-size:10px;font-weight:700;font-family:'DM Sans',sans-serif;padding:2px 7px;border-radius:6px;line-height:1.4;}
  .page-thumb .check-mark{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:13px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1;pointer-events:none;font-family:'DM Sans',sans-serif;}
  .page-thumb.selected{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent);}
  .page-thumb.selected .check-mark{display:flex;}
  .page-thumb:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}
  .page-thumb.selected:hover{box-shadow:0 0 0 2px var(--accent),0 4px 12px rgba(0,0,0,0.08);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .action-btn.disabled{background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;}
  #resultArea{display:none;margin-bottom:16px;}
  #resultArea.on{display:block;}
  #resultGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:12px;}
  .result-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;}
  .result-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .result-card .rname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
  .result-card .rmeta{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 8px 4px;}
  .result-card .dl-link{display:block;font-size:11px;font-weight:700;color:var(--accent);font-family:'DM Sans',sans-serif;padding:0 8px 8px;text-decoration:none;}
  .result-card .dl-link:hover{text-decoration:underline;}
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

document.title = t.splitpdf_page_title || (seoData ? seoData.page_title : 'Split PDF Online Free | Extract Pages \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.splitpdf_meta_desc || 'Split PDF into separate pages or custom ranges free. Download individual PDFs or ZIP all.'
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
      <label for="fileInput" class="drop-zone" id="dropZone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop PDFs here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileTabs"></div>
    <div id="fileHeader"><span class="fh-name" id="fhName"></span><span class="fh-meta" id="fhMeta"></span><button class="fh-clear" id="fhClear">${clearLbl}</button></div>
    <div id="modeRow">
      <button class="mode-btn active" id="modeAllBtn">${modeAllLbl}</button>
      <button class="mode-btn" id="modeCustomBtn">${modeCustomLbl}</button>
    </div>
    <div id="customRangeRow">
      <input type="text" id="customRangeInput" placeholder="${customPlaceholder}" />
    </div>
    <div id="pageGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="splitpdf_applyModeToggle" style="display:none;margin-bottom:12px;">
      <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
        <button id="splitpdf_modeAll" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
        <button id="splitpdf_modeIndiv" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
      </div>
    </div>
    <div id="actionRow">
      <button class="action-btn disabled" id="splitBtn" disabled>${splitBtnLbl}</button>
    </div>
    <div id="resultArea">
      <div id="resultGrid"></div>
      <div style="text-align:center;">
        <button class="action-btn dark" id="dlZipBtn" style="display:none;max-width:320px;margin:0 auto;">${dlZipLbl}</button>
      </div>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

/* ---- DOM refs ---- */
const fileInput       = document.getElementById('fileInput')
const dropZone        = document.getElementById('dropZone')
const uploadArea      = document.getElementById('uploadArea')
const fileTabs        = document.getElementById('fileTabs')
const fileHeader      = document.getElementById('fileHeader')
const fhName          = document.getElementById('fhName')
const fhMeta          = document.getElementById('fhMeta')
const fhClear         = document.getElementById('fhClear')
const modeRow         = document.getElementById('modeRow')
const modeAllBtn      = document.getElementById('modeAllBtn')
const modeCustomBtn   = document.getElementById('modeCustomBtn')
const customRangeRow  = document.getElementById('customRangeRow')
const customRangeInput = document.getElementById('customRangeInput')
const pageGrid        = document.getElementById('pageGrid')
const statusText      = document.getElementById('statusText')
const splitBtn        = document.getElementById('splitBtn')
const resultArea      = document.getElementById('resultArea')
const resultGrid      = document.getElementById('resultGrid')
const dlZipBtn        = document.getElementById('dlZipBtn')

/* ---- Apply mode toggle ---- */
const splitpdf_applyModeToggle = document.getElementById('splitpdf_applyModeToggle')
const splitpdf_modeAllBtn = document.getElementById('splitpdf_modeAll')
const splitpdf_modeIndivBtn = document.getElementById('splitpdf_modeIndiv')
let splitpdf_applyMode = 'all'

splitpdf_modeAllBtn.addEventListener('click', () => {
  splitpdf_applyMode = 'all'
  splitpdf_modeAllBtn.style.background = 'var(--accent)'; splitpdf_modeAllBtn.style.color = 'var(--text-on-accent)'
  splitpdf_modeIndivBtn.style.background = 'var(--bg-card)'; splitpdf_modeIndivBtn.style.color = 'var(--text-secondary)'
})
splitpdf_modeIndivBtn.addEventListener('click', () => {
  splitpdf_applyMode = 'individual'
  splitpdf_modeIndivBtn.style.background = 'var(--accent)'; splitpdf_modeIndivBtn.style.color = 'var(--text-on-accent)'
  splitpdf_modeAllBtn.style.background = 'var(--bg-card)'; splitpdf_modeAllBtn.style.color = 'var(--text-secondary)'
})

/* ---- State ---- */
let files = [] // { name, bytes, pageCount, pdfJsDoc, mode:'all'|'custom', customRanges:'', selectedPages:Set }
let activeFileIndex = 0
let resultBlobs = [] // { blob, name, pageIndex, pdfJsDoc }

/* ---- Lazy-load pdf.js ---- */
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

/* ---- Helpers ---- */
function enableBtn(btn) {
  btn.disabled = false
  btn.classList.remove('disabled')
  btn.style.removeProperty('background')
  btn.style.removeProperty('opacity')
  btn.style.removeProperty('cursor')
}
function disableBtn(btn) {
  btn.disabled = true
  btn.classList.add('disabled')
  btn.style.background = 'var(--btn-disabled)'
  btn.style.opacity = '0.7'
  btn.style.cursor = 'not-allowed'
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/* Parse custom ranges like "1-3, 5, 7-10" into 0-based page indices */
function parseRanges(str, maxPages) {
  const indices = new Set()
  const parts = str.split(',').map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = Math.max(1, parseInt(match[1], 10))
      const end = Math.min(maxPages, parseInt(match[2], 10))
      for (let i = start; i <= end; i++) indices.add(i - 1)
    } else {
      const num = parseInt(part, 10)
      if (num >= 1 && num <= maxPages) indices.add(num - 1)
    }
  }
  return [...indices].sort((a, b) => a - b)
}

/* Extract specific pages from PDF bytes into a new PDF */
async function extractPages(srcBytes, pageIndices) {
  const srcDoc = await PDFDocument.load(srcBytes)
  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)
  copiedPages.forEach(p => newDoc.addPage(p))
  return newDoc.save()
}

/* Render a thumbnail from a pdf.js document */
async function renderThumb(pdfJsDoc, pageNum) {
  const page = await pdfJsDoc.getPage(pageNum)
  const viewport = page.getViewport({ scale: 0.5 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
  return canvas
}

/* ---- Next steps ---- */

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
    addPdfFiles(files)
  } catch (e) { console.warn('[split-pdf] IDB autoload failed:', e) }
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

/* ---- Render file tabs (multi-file) ---- */
function renderFileTabs() {
  fileTabs.innerHTML = ''
  if (files.length <= 1) {
    fileTabs.style.display = 'none'
    return
  }
  fileTabs.style.display = 'flex'
  files.forEach((f, idx) => {
    const tab = document.createElement('button')
    tab.className = 'file-tab' + (idx === activeFileIndex ? ' active' : '')
    tab.textContent = f.name
    tab.title = f.name
    tab.addEventListener('click', () => {
      activeFileIndex = idx
      renderActiveFile()
    })
    fileTabs.appendChild(tab)
  })
  // Add more tab
  const addTab = document.createElement('button')
  addTab.className = 'file-tab add-tab'
  addTab.textContent = addMoreLbl
  addTab.addEventListener('click', () => fileInput.click())
  fileTabs.appendChild(addTab)
}

/* ---- Render active file header, mode, grid ---- */
function renderActiveFile() {
  renderFileTabs()
  clearResults()

  if (files.length === 0) {
    fileHeader.classList.remove('on')
    modeRow.classList.remove('on')
    customRangeRow.classList.remove('on')
    pageGrid.innerHTML = ''
    disableBtn(splitBtn)
    splitpdf_applyModeToggle.style.display = 'none'
    dropZone.classList.remove('hidden')
    return
  }

  dropZone.classList.add('hidden')

  const f = files[activeFileIndex]

  // Header
  fhName.textContent = f.name
  fhMeta.textContent = `${f.pageCount} ${pagesLabel}`
  fileHeader.classList.add('on')

  // Mode buttons
  modeRow.classList.add('on')
  modeAllBtn.classList.toggle('active', f.mode === 'all')
  modeCustomBtn.classList.toggle('active', f.mode === 'custom')
  customRangeRow.classList.toggle('on', f.mode === 'custom')
  customRangeInput.value = f.customRanges

  // Apply mode toggle: show only when multiple files
  splitpdf_applyModeToggle.style.display = files.length > 1 ? 'block' : 'none'
  splitBtn.textContent = splitBtnLbl

  enableBtn(splitBtn)

  // Page grid
  renderPageGrid(f)
}

async function renderPageGrid(f) {
  pageGrid.innerHTML = ''
  statusText.textContent = loadingLbl

  for (let i = 0; i < f.pageCount; i++) {
    const card = document.createElement('div')
    card.className = 'page-thumb'
    if (f.selectedPages.has(i)) card.classList.add('selected')

    // Page number badge
    const pnum = document.createElement('div')
    pnum.className = 'pnum'
    pnum.textContent = i + 1

    // Check mark for selected
    const check = document.createElement('div')
    check.className = 'check-mark'
    check.textContent = '\u2713'

    // Label
    const plabel = document.createElement('div')
    plabel.className = 'plabel'
    plabel.textContent = `${pageLabel} ${i + 1}`

    card.append(pnum, check, plabel)
    pageGrid.appendChild(card)

    // Click to toggle selection
    const pageIdx = i
    card.addEventListener('click', () => {
      if (f.selectedPages.has(pageIdx)) {
        f.selectedPages.delete(pageIdx)
        card.classList.remove('selected')
      } else {
        f.selectedPages.add(pageIdx)
        card.classList.add('selected')
      }
      // Sync custom ranges from selection
      if (f.mode === 'custom') {
        f.customRanges = buildRangeString(f.selectedPages, f.pageCount)
        customRangeInput.value = f.customRanges
      }
    })

    // Render thumbnail async with progress
    statusText.textContent = `Loading page ${i + 1}/${f.pageCount}`
    try {
      const canvas = await renderThumb(f.pdfJsDoc, i + 1)
      card.insertBefore(canvas, pnum)
    } catch (_) { /* skip thumbnail on error */ }
  }

  statusText.textContent = ''

  // If custom mode, highlight pages from ranges
  if (f.mode === 'custom' && f.customRanges) {
    syncSelectionFromRanges(f)
  }
}

/* Build range string from a Set of 0-based indices, e.g. {0,1,2,4,6,7,8} => "1-3, 5, 7-9" */
function buildRangeString(selectedSet, maxPages) {
  const sorted = [...selectedSet].sort((a, b) => a - b)
  if (sorted.length === 0) return ''
  const ranges = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`)
      start = sorted[i]
      end = sorted[i]
    }
  }
  ranges.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`)
  return ranges.join(', ')
}

/* Sync page card selection from custom range input */
function syncSelectionFromRanges(f) {
  const indices = parseRanges(f.customRanges, f.pageCount)
  f.selectedPages = new Set(indices)
  const cards = pageGrid.querySelectorAll('.page-thumb')
  cards.forEach((card, i) => {
    card.classList.toggle('selected', f.selectedPages.has(i))
  })
}

/* ---- Mode switching ---- */
modeAllBtn.addEventListener('click', () => {
  if (files.length === 0) return
  const f = files[activeFileIndex]
  f.mode = 'all'
  f.selectedPages = new Set()
  modeAllBtn.classList.add('active')
  modeCustomBtn.classList.remove('active')
  customRangeRow.classList.remove('on')
  // Deselect all page cards
  pageGrid.querySelectorAll('.page-thumb').forEach(c => c.classList.remove('selected'))
})

modeCustomBtn.addEventListener('click', () => {
  if (files.length === 0) return
  const f = files[activeFileIndex]
  f.mode = 'custom'
  modeCustomBtn.classList.add('active')
  modeAllBtn.classList.remove('active')
  customRangeRow.classList.add('on')
  customRangeInput.focus()
  if (f.customRanges) syncSelectionFromRanges(f)
})

customRangeInput.addEventListener('input', () => {
  if (files.length === 0) return
  const f = files[activeFileIndex]
  f.customRanges = customRangeInput.value
  syncSelectionFromRanges(f)
})

/* ---- Clear current file ---- */
fhClear.addEventListener('click', () => {
  if (files.length === 0) return
  files.splice(activeFileIndex, 1)
  if (files.length === 0) {
    activeFileIndex = 0
    renderActiveFile()
    return
  }
  if (activeFileIndex >= files.length) activeFileIndex = files.length - 1
  renderActiveFile()
})

/* ---- File loading ---- */
async function addPdfFiles(incoming) {
  const pdfjs = await loadPdfJs()
  let skipped = 0

  for (const file of incoming) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      skipped++
      continue
    }
    if (file.size > MAX_FILE_SIZE) {
      statusText.textContent = `${file.name}: ${t.splitpdf_too_large || 'File too large. Maximum 50 MB per file.'}`
      skipped++
      continue
    }
    if (files.length >= MAX_FILES) {
      statusText.textContent = t.splitpdf_max_files || `Maximum ${MAX_FILES} files.`
      break
    }

    statusText.textContent = loadingLbl
    try {
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf.slice(0))
      const pdfJsDoc = await pdfjs.getDocument({ data: bytes.slice(0) }).promise
      files.push({
        name: file.name,
        bytes,
        pageCount: pdfJsDoc.numPages,
        pdfJsDoc,
        mode: 'all',
        customRanges: '',
        selectedPages: new Set()
      })
    } catch (err) {
      console.error('[split-pdf] load failed:', file.name, err)
      statusText.textContent = (t.splitpdf_load_error || 'Could not load PDF: ') + file.name
      skipped++
    }
  }

  if (files.length > 0) {
    activeFileIndex = files.length - 1
    renderActiveFile()
    if (skipped === 0) statusText.textContent = ''
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    clearResults()
    addPdfFiles(Array.from(fileInput.files))
  }
  fileInput.value = ''
})

document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) {
    clearResults()
    addPdfFiles(Array.from(e.dataTransfer.files))
  }
})

/* ---- Results ---- */
function clearResults() {
  resultBlobs = []
  resultGrid.innerHTML = ''
  resultArea.classList.remove('on')
  dlZipBtn.style.display = 'none'
  document.getElementById('nextSteps').style.display = 'none'
}

async function showResults(blobs) {
  resultBlobs = blobs
  lastResults = blobs.map(b => ({ blob: b.blob, name: b.name, type: 'application/pdf' }))
  resultGrid.innerHTML = ''
  resultArea.classList.add('on')

  for (const r of blobs) {
    const card = document.createElement('div')
    card.className = 'result-card'

    // Thumbnail
    if (r.pdfJsDoc && r.pageIndex !== undefined) {
      try {
        const canvas = await renderThumb(r.pdfJsDoc, r.pageIndex + 1)
        card.appendChild(canvas)
      } catch (_) { /* skip */ }
    }

    const rname = document.createElement('div')
    rname.className = 'rname'
    rname.textContent = r.name

    const rmeta = document.createElement('div')
    rmeta.className = 'rmeta'
    rmeta.textContent = formatSize(r.blob.size)

    const dlLink = document.createElement('a')
    dlLink.className = 'dl-link'
    const url = URL.createObjectURL(r.blob)
    dlLink.href = url
    dlLink.download = r.name
    dlLink.textContent = `\u2B07 ${dlBtn}`
    dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)

    card.append(rname, rmeta, dlLink)
    resultGrid.appendChild(card)
  }

  // Auto-download if single result
  if (blobs.length === 1) {
    triggerDownload(blobs[0].blob, blobs[0].name)
    statusText.textContent = t.splitpdf_done || 'Done! PDF downloaded.'
    if (window.showReviewPrompt) window.showReviewPrompt()
  } else {
    dlZipBtn.style.display = ''
  }

  buildNextSteps()
}

/* ---- Split logic ---- */
async function splitFile(f) {
  const baseName = f.name.replace(/\.[^.]+$/, '')
  const results = []

  if (f.mode === 'all') {
    // Split every page into separate PDF
    for (let i = 0; i < f.pageCount; i++) {
      statusText.textContent = `${splittingLbl} ${pageLabel} ${i + 1}/${f.pageCount}`
      const newBytes = await extractPages(f.bytes, [i])
      const blob = new Blob([newBytes], { type: 'application/pdf' })
      results.push({
        blob,
        name: `${baseName}-page-${i + 1}.pdf`,
        pdfJsDoc: f.pdfJsDoc,
        pageIndex: i
      })
    }
  } else {
    // Custom ranges
    const indices = parseRanges(f.customRanges, f.pageCount)
    if (indices.length === 0) {
      statusText.textContent = t.splitpdf_no_pages || 'No valid pages selected. Use format: 1-3, 5, 7-10'
      return []
    }

    // If the selection is contiguous groups, split into range-based PDFs
    const groups = []
    let groupStart = indices[0]
    let groupEnd = indices[0]
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === groupEnd + 1) {
        groupEnd = indices[i]
      } else {
        groups.push({ start: groupStart, end: groupEnd })
        groupStart = indices[i]
        groupEnd = indices[i]
      }
    }
    groups.push({ start: groupStart, end: groupEnd })

    for (let g = 0; g < groups.length; g++) {
      const group = groups[g]
      const pageIdxs = []
      for (let p = group.start; p <= group.end; p++) pageIdxs.push(p)

      statusText.textContent = `${splittingLbl} (${g + 1}/${groups.length})`
      const newBytes = await extractPages(f.bytes, pageIdxs)
      const blob = new Blob([newBytes], { type: 'application/pdf' })

      const rangeStr = group.start === group.end
        ? `page-${group.start + 1}`
        : `pages-${group.start + 1}-${group.end + 1}`
      results.push({
        blob,
        name: `${baseName}-${rangeStr}.pdf`,
        pdfJsDoc: f.pdfJsDoc,
        pageIndex: group.start
      })
    }
  }

  return results
}

/* Split — branches based on toggle */
splitBtn.addEventListener('click', async () => {
  if (files.length === 0) return
  disableBtn(splitBtn)
  clearResults()

  if (splitpdf_applyMode === 'all' || files.length <= 1) {
    if (files.length <= 1) {
      // Single file split
      try {
        const f = files[activeFileIndex]
        const results = await splitFile(f)
        if (results.length > 0) {
          statusText.textContent = `${results.length} ${t.splitpdf_pdfs_ready || 'PDFs ready.'}`
          await showResults(results)
          window.rcShowSaveButton?.(document.getElementById('actionRow'), results.length === 1 ? results[0].blob : null, results.length === 1 ? results[0].name : null, 'split-pdf')
        }
      } catch (err) {
        console.error('[split-pdf] split failed:', err)
        statusText.textContent = (t.splitpdf_error || 'Split failed: ') + (err?.message || err)
      }
    } else {
      // Split all files & download ZIP
      try {
        const allResults = []
        for (let i = 0; i < files.length; i++) {
          statusText.textContent = `${splittingLbl} ${files[i].name} (${i + 1}/${files.length})`
          const results = await splitFile(files[i])
          allResults.push(...results)
        }

        if (allResults.length === 0) {
          statusText.textContent = t.splitpdf_no_pages || 'No valid pages selected.'
          enableBtn(splitBtn)
          return
        }

        statusText.textContent = `${allResults.length} ${t.splitpdf_pdfs_ready || 'PDFs ready.'} Zipping...`

        const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
        const JSZip = mod.default || window.JSZip
        const zip = new JSZip()
        for (const r of allResults) {
          zip.file(r.name, await r.blob.arrayBuffer())
        }
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })

        triggerDownload(zipBlob, 'split-pdfs.zip')
        statusText.textContent = `${allResults.length} ${t.splitpdf_pdfs_ready || 'PDFs ready.'}`

        await showResults(allResults)
        if (window.showReviewPrompt) window.showReviewPrompt()
        window.rcShowSaveButton?.(document.getElementById('actionRow'), zipBlob, 'split-pdfs.zip', 'split-pdf')
      } catch (err) {
        console.error('[split-pdf] split-all failed:', err)
        statusText.textContent = (t.splitpdf_error || 'Split failed: ') + (err?.message || err)
      }
    }
  } else {
    // Individual: split only the active file
    try {
      const f = files[activeFileIndex]
      const results = await splitFile(f)
      if (results.length > 0) {
        statusText.textContent = `${results.length} ${t.splitpdf_pdfs_ready || 'PDFs ready.'}`
        await showResults(results)
        window.rcShowSaveButton?.(document.getElementById('actionRow'), results.length === 1 ? results[0].blob : null, results.length === 1 ? results[0].name : null, 'split-pdf')
      }
    } catch (err) {
      console.error('[split-pdf] split failed:', err)
      statusText.textContent = (t.splitpdf_error || 'Split failed: ') + (err?.message || err)
    }
  }

  enableBtn(splitBtn)
})

/* ZIP download for results of single-file split */
dlZipBtn.addEventListener('click', async () => {
  if (!resultBlobs.length) return
  dlZipBtn.textContent = 'Zipping\u2026'
  dlZipBtn.disabled = true
  try {
    const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of resultBlobs) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    triggerDownload(zipBlob, 'split-pdfs.zip')
    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(dlZipBtn.parentElement, zipBlob, 'split-pdfs.zip', 'split-pdf')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  dlZipBtn.textContent = dlZipLbl
  dlZipBtn.disabled = false
})

/* ---- SEO section ---- */

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['split-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()