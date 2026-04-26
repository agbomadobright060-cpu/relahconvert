import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('reorder-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['reorder-pdf']) || 'Reorder PDF'
const seoData   = t.seo && t.seo['reorder-pdf']
const descText  = t.reorderpdf_desc || t.card_reorder_pdf_desc || 'Drag and drop to rearrange PDF pages in any order.'
const selectLbl = t.reorderpdf_select || t.select_image || 'Select PDF'
const dropHint  = t.reorderpdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const applyBtn  = t.reorderpdf_apply || 'Apply & Download'
const applyingLbl = t.reorderpdf_applying || 'Reordering pages\u2026'
const pageLabel = t.reorderpdf_page || t.pdfpng_page || 'Page'
const pagesLabel = t.reorderpdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl = t.reorderpdf_loading || 'Loading PDF\u2026'
const dragHint  = t.reorderpdf_drag_hint || 'Drag pages to reorder'
const resetLbl  = t.reorderpdf_reset || 'Reset Order'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #pageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px;}
  .page-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;cursor:grab;user-select:none;transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s,border-color 0.15s;}
  .page-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);}
  .page-card.dragging{opacity:0.45;border-color:var(--accent);transform:scale(0.95);}
  .page-card.drag-over{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent);transform:scale(1.03);}
  .page-card:active{cursor:grabbing;}
  .page-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .page-card .drag-handle{display:flex;align-items:center;justify-content:center;padding:4px 0;color:var(--text-muted);font-size:16px;cursor:grab;letter-spacing:2px;line-height:1;}
  .page-card .drag-handle:active{cursor:grabbing;}
  .page-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:2px 8px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;text-align:center;}
  .page-card .pnum{position:absolute;top:6px;left:6px;background:var(--btn-dark);color:var(--text-on-accent);font-size:10px;font-weight:700;font-family:'DM Sans',sans-serif;padding:2px 7px;border-radius:6px;line-height:1.4;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #dragHint{display:none;font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;margin-bottom:10px;font-style:italic;}
  #dragHint.on{display:block;}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);}
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

document.title = t.reorderpdf_page_title || (seoData ? seoData.page_title : 'Reorder PDF Pages Free Online \u2014 Drag & Drop | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.reorderpdf_meta_desc || 'Reorder PDF pages free online. Drag and drop to rearrange pages in any order. Browser-only, no upload, instant download.'
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
    <div id="dragHint">\u2195 ${dragHint}</div>
    <div id="pageGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="applyBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${applyBtn}</button>
      <button class="action-btn dark" id="resetBtn" style="display:none;">${resetLbl}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const pageGrid   = document.getElementById('pageGrid')
const fileMeta   = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn  = document.getElementById('removeBtn')
const dragHintEl = document.getElementById('dragHint')
const applyBtnEl = document.getElementById('applyBtn')
const resetBtnEl = document.getElementById('resetBtn')
const statusText = document.getElementById('statusText')

let pdfBytes = null
let pdfFileName = ''
let totalPages = 0
let pageOrder = [] // current order: array of 0-based page indices

// ── Lazy-load pdf.js ────────────────────────────────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// ── Drag & Drop Reordering ──────────────────────────────────────────────────
let dragSrcIndex = null

function attachDragListeners(card, index) {
  card.setAttribute('draggable', 'true')
  card.dataset.index = index

  card.addEventListener('dragstart', e => {
    dragSrcIndex = parseInt(card.dataset.index)
    card.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', card.dataset.index)
  })

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging')
    document.querySelectorAll('.page-card.drag-over').forEach(c => c.classList.remove('drag-over'))
    dragSrcIndex = null
  })

  card.addEventListener('dragover', e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const targetIndex = parseInt(card.dataset.index)
    if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
      card.classList.add('drag-over')
    }
  })

  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over')
  })

  card.addEventListener('drop', e => {
    e.preventDefault()
    card.classList.remove('drag-over')
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    const toIndex = parseInt(card.dataset.index)
    if (fromIndex === toIndex || isNaN(fromIndex) || isNaN(toIndex)) return
    // Reorder the pageOrder array
    const moved = pageOrder.splice(fromIndex, 1)[0]
    pageOrder.splice(toIndex, 0, moved)
    rebuildGrid()
  })
}

function rebuildGrid() {
  const cards = Array.from(pageGrid.children)
  // Rebuild from pageOrder
  const fragment = document.createDocumentFragment()
  pageOrder.forEach((origPageIdx, displayIdx) => {
    const card = cards.find(c => parseInt(c.dataset.origPage) === origPageIdx)
    if (card) {
      card.dataset.index = displayIdx
      // Update displayed position number
      const pnum = card.querySelector('.pnum')
      if (pnum) pnum.textContent = displayIdx + 1
      fragment.appendChild(card)
    }
  })
  pageGrid.innerHTML = ''
  pageGrid.appendChild(fragment)
  // Re-attach drag listeners with updated indices
  Array.from(pageGrid.children).forEach((card, i) => {
    card.dataset.index = i
    attachDragListeners(card, i)
  })
}

// ── What's Next? ────────────────────────────────────────────────────────────

// ── IndexedDB handoff ────────────────────────────────────────────────────────
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
  } catch (e) { console.warn('[reorder-pdf] IDB autoload failed:', e) }
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

// ── State Reset ─────────────────────────────────────────────────────────────
function resetState() {
  pdfBytes = null
  pdfFileName = ''
  totalPages = 0
  pageOrder = []
  pageGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  if (document.getElementById('uploadArea')) document.getElementById('uploadArea').style.display = ''
  document.getElementById('actionRow').style.display = 'none'
  dragHintEl.classList.remove('on')
  resetBtnEl.style.display = 'none'
  statusText.textContent = ''
  applyBtnEl.disabled = true
  applyBtnEl.style.opacity = '0.7'
  applyBtnEl.style.cursor = 'not-allowed'
  applyBtnEl.style.background = 'var(--btn-disabled)'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

resetBtnEl.addEventListener('click', () => {
  pageOrder = Array.from({ length: totalPages }, (_, i) => i)
  rebuildGrid()
  statusText.textContent = t.reorderpdf_order_reset || 'Page order reset to original.'
})

// ── Load PDF ────────────────────────────────────────────────────────────────
async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select a PDF file.'
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
    pdfBytes = new Uint8Array(buf.slice(0))
    const pdfDoc = await pdfjs.getDocument({ data: buf }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    totalPages = pdfDoc.numPages
    pageOrder = Array.from({ length: totalPages }, (_, i) => i)

    fileMetaText.textContent = `${file.name} \u2014 ${totalPages} ${pagesLabel}`
    document.getElementById('uploadArea').style.display = 'none'
    fileMeta.classList.add('on')
    dragHintEl.classList.add('on')
    document.getElementById('actionRow').style.display = 'flex'

    // Render thumbnails with progress
    for (let i = 1; i <= totalPages; i++) {
      statusText.textContent = `Loading page ${i}/${totalPages}`
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const card = document.createElement('div')
      card.className = 'page-card'
      card.dataset.origPage = i - 1
      card.dataset.index = i - 1

      const handle = document.createElement('div')
      handle.className = 'drag-handle'
      handle.innerHTML = '\u2261\u2261'
      handle.title = dragHint

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise

      const pnum = document.createElement('div')
      pnum.className = 'pnum'
      pnum.textContent = i

      const pname = document.createElement('div')
      pname.className = 'pname'
      pname.textContent = `${pageLabel} ${i}`

      card.append(handle, canvas, pnum, pname)
      pageGrid.appendChild(card)
      attachDragListeners(card, i - 1)
    }

    applyBtnEl.disabled = false
    applyBtnEl.style.opacity = '1'
    applyBtnEl.style.cursor = 'pointer'
    applyBtnEl.style.background = 'var(--accent)'
    resetBtnEl.style.display = 'block'
    statusText.textContent = ''
  } catch (err) {
    console.error('[reorder-pdf] load failed:', err)
    statusText.textContent = (t.reorderpdf_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

// ── File Input & Drop ───────────────────────────────────────────────────────
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFile(fileInput.files[0])
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (file) loadPdfFile(file)
})

// ── Apply Reorder & Download ────────────────────────────────────────────────
applyBtnEl.addEventListener('click', async () => {
  if (!pdfBytes || !pageOrder.length) return
  applyBtnEl.disabled = true
  applyBtnEl.style.opacity = '0.7'
  applyBtnEl.style.cursor = 'not-allowed'
  statusText.textContent = applyingLbl
  try {
    const srcDoc = await PDFDocument.load(pdfBytes)
    const newDoc = await PDFDocument.create()
    const copiedPages = await newDoc.copyPages(srcDoc, pageOrder)
    copiedPages.forEach(page => newDoc.addPage(page))
    const resultBytes = await newDoc.save()
    const blob = new Blob([resultBytes], { type: 'application/pdf' })
    lastResults = [{ blob, name: `${pdfFileName || 'reordered'}-reordered.pdf`, type: 'application/pdf' }]
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pdfFileName || 'reordered'}-reordered.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    statusText.textContent = t.reorderpdf_done || 'Reordered PDF downloaded!'
    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(applyBtnEl.parentElement, blob, `${pdfFileName || 'reordered'}-reordered.pdf`, 'reorder-pdf')
  } catch (err) {
    console.error('[reorder-pdf] reorder failed:', err)
    statusText.textContent = (t.reorderpdf_error || 'Reorder failed: ') + (err?.message || err)
  }
  applyBtnEl.disabled = false
  applyBtnEl.style.opacity = '1'
  applyBtnEl.style.cursor = 'pointer'
})

// ── SEO Section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['reorder-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
