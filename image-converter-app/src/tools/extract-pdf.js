import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('extract-pdf')

const t = getT()

const toolName    = (t.nav_short && t.nav_short['extract-pdf']) || 'Extract PDF Pages'
const seoData     = t.seo && t.seo['extract-pdf']
const descText    = t.extractpdf_desc || t.card_extract_pdf_desc || 'Extract specific pages from a PDF and save them as a new document.'
const selectLbl   = t.extractpdf_select || 'Select PDF'
const dropHint    = t.extractpdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const extractLbl  = t.extractpdf_extract_btn || 'Extract Selected Pages'
const extractingLbl = t.extractpdf_extracting || 'Extracting\u2026'
const pageLabel   = t.extractpdf_page || t.pdfpng_page || 'Page'
const pagesLabel  = t.extractpdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl  = t.extractpdf_loading || 'Loading PDF\u2026'
const selectAllLbl   = t.extractpdf_select_all || 'Select All'
const deselectAllLbl = t.extractpdf_deselect_all || 'Deselect All'
const selectedLbl    = t.extractpdf_selected || 'selected'
const dlBtn          = t.download || 'Download'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #selectionRow{display:none;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #selectionRow.on{display:flex;}
  .sel-btn{padding:7px 14px;border-radius:8px;border:1.5px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .sel-btn:hover{border-color:var(--accent);color:var(--accent);}
  #selCount{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px;}
  .pdf-card{background:var(--bg-card);border-radius:10px;border:2px solid var(--border);overflow:hidden;position:relative;cursor:pointer;transition:all 0.15s;user-select:none;}
  .pdf-card:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(200,75,49,0.08);}
  .pdf-card.selected{border-color:var(--accent);background:rgba(200,75,49,0.04);}
  .pdf-card.selected::after{content:'\\2713';position:absolute;top:6px;right:8px;width:22px;height:22px;background:var(--accent);color:var(--text-on-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;line-height:1;}
  .pdf-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .pdf-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;text-align:center;}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
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
`
document.head.appendChild(style)

document.title = t.extractpdf_page_title || (seoData ? seoData.page_title : 'Extract PDF Pages Free Online | No Upload \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.extractpdf_meta_desc || 'Extract specific pages from a PDF free. Select pages visually, download a new PDF with only the pages you need. Browser-only, no upload.'
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
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop a PDF here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="selectionRow">
      <button class="sel-btn" id="selectAllBtn">${selectAllLbl}</button>
      <button class="sel-btn" id="deselectAllBtn">${deselectAllLbl}</button>
      <span id="selCount"></span>
    </div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="extractBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${extractLbl}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput     = document.getElementById('fileInput')
const fileGrid      = document.getElementById('fileGrid')
const fileMeta      = document.getElementById('fileMeta')
const fileMetaText  = document.getElementById('fileMetaText')
const removeBtn     = document.getElementById('removeBtn')
const selectionRow  = document.getElementById('selectionRow')
const selectAllBtn  = document.getElementById('selectAllBtn')
const deselectAllBtn = document.getElementById('deselectAllBtn')
const selCount      = document.getElementById('selCount')
const extractBtn    = document.getElementById('extractBtn')
const statusText    = document.getElementById('statusText')

let pdfDoc = null
let pdfRawBytes = null
let pdfFileName = ''
let pages = []   // [{ pageNum, card, selected }]

// ── Lazy-load pdf.js ────────────────────────────────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// ── Selection helpers ───────────────────────────────────────────────────────
function updateSelectionCount() {
  const count = pages.filter(p => p.selected).length
  selCount.textContent = `${count} / ${pages.length} ${selectedLbl}`
  if (count > 0) {
    extractBtn.disabled = false
    extractBtn.style.opacity = '1'
    extractBtn.style.cursor = 'pointer'
    extractBtn.style.background = 'var(--accent)'
  } else {
    extractBtn.disabled = true
    extractBtn.style.opacity = '0.7'
    extractBtn.style.cursor = 'not-allowed'
    extractBtn.style.background = 'var(--btn-disabled)'
  }
}

function togglePage(entry) {
  entry.selected = !entry.selected
  entry.card.classList.toggle('selected', entry.selected)
  updateSelectionCount()
}

function setAll(val) {
  pages.forEach(p => {
    p.selected = val
    p.card.classList.toggle('selected', val)
  })
  updateSelectionCount()
}

selectAllBtn.addEventListener('click', () => setAll(true))
deselectAllBtn.addEventListener('click', () => setAll(false))

// ── What's Next ─────────────────────────────────────────────────────────────

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
    loadPdfFile(files[0])
  } catch (e) { console.warn('[extract-pdf] IDB autoload failed:', e) }
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

// ── Reset ───────────────────────────────────────────────────────────────────
function resetState() {
  pdfDoc = null
  pdfRawBytes = null
  pdfFileName = ''
  pages = []
  fileGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  if (document.getElementById('uploadArea')) document.getElementById('uploadArea').style.display = ''
  selectionRow.classList.remove('on')
  document.getElementById('actionRow').style.display = 'none'
  statusText.textContent = ''
  extractBtn.disabled = true
  extractBtn.style.opacity = '0.7'
  extractBtn.style.cursor = 'not-allowed'
  extractBtn.style.background = 'var(--btn-disabled)'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

// ── Load PDF ────────────────────────────────────────────────────────────────
async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Wrong format.'
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    statusText.textContent = 'File too large. Maximum size is 50 MB.'
    return
  }
  resetState()
  statusText.textContent = loadingLbl
  try {
    const pdfjs = await loadPdfJs()
    const buf = await file.arrayBuffer()
    pdfRawBytes = new Uint8Array(buf.slice(0))
    pdfDoc = await pdfjs.getDocument({ data: buf }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    fileMetaText.textContent = `${file.name} \u2014 ${pdfDoc.numPages} ${pagesLabel}`
    document.getElementById('uploadArea').style.display = 'none'
    fileMeta.classList.add('on')
    selectionRow.classList.add('on')
    document.getElementById('actionRow').style.display = 'flex'

    // Render preview thumbnails
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      statusText.textContent = `Loading page ${i}/${pdfDoc.numPages}`
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const card = document.createElement('div')
      card.className = 'pdf-card'
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
      const pname = document.createElement('div')
      pname.className = 'pname'
      pname.textContent = `${pageLabel} ${i}`
      card.append(canvas, pname)
      fileGrid.appendChild(card)
      const entry = { pageNum: i, card, selected: false }
      card.addEventListener('click', () => togglePage(entry))
      pages.push(entry)
    }

    updateSelectionCount()
    statusText.textContent = ''
  } catch (err) {
    console.error('[extract-pdf] load failed:', err)
    statusText.textContent = (t.extractpdf_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFile(fileInput.files[0])
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) loadPdfFile(e.dataTransfer.files[0])
})

// ── Extract selected pages via pdf-lib ──────────────────────────────────────
extractBtn.addEventListener('click', async () => {
  const selectedPages = pages.filter(p => p.selected)
  if (!selectedPages.length || !pdfRawBytes) return

  extractBtn.disabled = true
  extractBtn.textContent = extractingLbl
  statusText.textContent = extractingLbl

  try {
    const { PDFDocument } = await import('pdf-lib')
    const srcDoc = await PDFDocument.load(pdfRawBytes)
    const newDoc = await PDFDocument.create()

    // pdf-lib uses 0-based indices
    const indices = selectedPages.map(p => p.pageNum - 1)
    const copiedPages = await newDoc.copyPages(srcDoc, indices)
    copiedPages.forEach(p => newDoc.addPage(p))

    const pdfBytes = await newDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    lastResults = [{ blob, name: `${pdfFileName || 'extracted'}-extracted.pdf`, type: 'application/pdf' }]
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pdfFileName || 'extracted'}-pages.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)

    statusText.textContent = `${selectedPages.length} ${pagesLabel} ${t.extractpdf_extracted || 'extracted successfully.'}`
    buildNextSteps()

    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(extractBtn.parentElement, blob, `${pdfFileName || 'extracted'}-pages.pdf`, 'extract-pdf')
  } catch (err) {
    console.error('[extract-pdf] extraction failed:', err)
    statusText.textContent = (t.extractpdf_error || 'Extraction failed: ') + (err?.message || err)
  }

  extractBtn.disabled = false
  extractBtn.textContent = extractLbl
})

// ── SEO section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['extract-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
