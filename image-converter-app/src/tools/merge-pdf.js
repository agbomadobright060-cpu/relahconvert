import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('merge-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['merge-pdf']) || 'Merge PDF'
const seoData   = t.seo && t.seo['merge-pdf']
const descText  = t.mergepdf_desc || t.card_merge_pdf_desc || 'Combine multiple PDF files into one document.'
const selectLbl = t.mergepdf_select || 'Select PDFs'
const dropHint  = t.mergepdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const mergeLbl  = t.mergepdf_merge_btn || 'Merge PDFs'
const mergingLbl = t.mergepdf_merging || 'Merging…'
const pagesLabel = t.mergepdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl = t.mergepdf_loading || 'Loading PDFs…'
const dlBtn     = t.download || 'Download'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:var(--bg-page);`

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;}
  .pdf-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;cursor:grab;user-select:none;transition:box-shadow 0.15s,border-color 0.15s;}
  .pdf-card.dragging{opacity:0.5;border-color:var(--accent);}
  .pdf-card.drag-over{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent);}
  .pdf-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .pdf-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
  .pdf-card .pmeta{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 8px 6px;}
  .pdf-card .remove-file{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.55);color:#fff;border:none;font-size:13px;line-height:22px;text-align:center;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background 0.15s;}
  .pdf-card .remove-file:hover{background:rgba(200,75,49,0.85);}
  .pdf-card .order-badge{position:absolute;top:4px;left:4px;min-width:22px;height:22px;border-radius:50%;background:var(--accent);color:var(--text-on-accent);font-size:11px;font-weight:700;line-height:22px;text-align:center;font-family:'DM Sans',sans-serif;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
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

document.title = t.mergepdf_page_title || (seoData ? seoData.page_title : 'Merge PDF Free Online | Combine PDFs — RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.mergepdf_meta_desc || 'Merge PDF files free online. Combine multiple PDFs into one document, reorder pages by dragging. Browser-only, no upload required.'
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
    <div style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
        <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
      </div>
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop a PDF here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileMeta"><span id="fileMetaText"></span></div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="mergeBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${mergeLbl}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput   = document.getElementById('fileInput')
const fileGrid    = document.getElementById('fileGrid')
const fileMeta    = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const mergeBtn    = document.getElementById('mergeBtn')
const statusText  = document.getElementById('statusText')

// Each entry: { id, name, pageCount, arrayBuffer, cardEl }
let pdfFiles = []
let fileIdCounter = 0
let dragSrcId = null

// ── Lazy-load pdf.js (for thumbnail previews) ──────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

function updateMergeButton() {
  const actionRow = document.getElementById('actionRow')
  if (pdfFiles.length >= 2) {
    mergeBtn.disabled = false
    mergeBtn.style.opacity = '1'
    mergeBtn.style.cursor = 'pointer'
    mergeBtn.style.background = 'var(--accent)'
    actionRow.style.display = 'flex'
  } else if (pdfFiles.length >= 1) {
    mergeBtn.disabled = true
    mergeBtn.style.opacity = '0.7'
    mergeBtn.style.cursor = 'not-allowed'
    mergeBtn.style.background = 'var(--btn-disabled)'
    actionRow.style.display = 'flex'
  } else {
    mergeBtn.disabled = true
    mergeBtn.style.opacity = '0.7'
    mergeBtn.style.cursor = 'not-allowed'
    mergeBtn.style.background = 'var(--btn-disabled)'
    actionRow.style.display = 'none'
  }
}

function updateFileMeta() {
  if (pdfFiles.length === 0) {
    fileMeta.classList.remove('on')
    return
  }
  const totalPages = pdfFiles.reduce((s, f) => s + f.pageCount, 0)
  fileMetaText.textContent = `${pdfFiles.length} ${pdfFiles.length === 1 ? 'file' : 'files'} \u2014 ${totalPages} ${pagesLabel} total`
  fileMeta.classList.add('on')
}

function updateOrderBadges() {
  pdfFiles.forEach((f, i) => {
    const badge = f.cardEl.querySelector('.order-badge')
    if (badge) badge.textContent = i + 1
  })
}

function removeFile(id) {
  pdfFiles = pdfFiles.filter(f => f.id !== id)
  renderFileGrid()
  updateMergeButton()
  updateFileMeta()
  if (pdfFiles.length === 0) {
    statusText.textContent = ''
    document.getElementById('nextSteps').style.display = 'none'
  }
}

function renderFileGrid() {
  fileGrid.innerHTML = ''
  pdfFiles.forEach(f => {
    fileGrid.appendChild(f.cardEl)
  })
  updateOrderBadges()
}

function setupDragHandlers(card, id) {
  card.setAttribute('draggable', 'true')
  card.addEventListener('dragstart', e => {
    dragSrcId = id
    card.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(id))
  })
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging')
    dragSrcId = null
    document.querySelectorAll('.pdf-card.drag-over').forEach(el => el.classList.remove('drag-over'))
  })
  card.addEventListener('dragover', e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragSrcId !== null && dragSrcId !== id) {
      card.classList.add('drag-over')
    }
  })
  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over')
  })
  card.addEventListener('drop', e => {
    e.preventDefault()
    card.classList.remove('drag-over')
    if (dragSrcId === null || dragSrcId === id) return
    const srcIdx = pdfFiles.findIndex(f => f.id === dragSrcId)
    const destIdx = pdfFiles.findIndex(f => f.id === id)
    if (srcIdx === -1 || destIdx === -1) return
    const [moved] = pdfFiles.splice(srcIdx, 1)
    pdfFiles.splice(destIdx, 0, moved)
    renderFileGrid()
  })
}

async function addPdfFiles(files) {
  const validFiles = Array.from(files).filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  )
  if (validFiles.length === 0) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files.'
    return
  }

  // Check total file count (existing + new)
  if (pdfFiles.length + validFiles.length > 25) {
    statusText.textContent = 'Too many files. Maximum is 25 PDFs.'
    return
  }

  // Check per-file size limit
  for (const file of validFiles) {
    if (file.size > 50 * 1024 * 1024) {
      statusText.textContent = `"${file.name}" is too large. Maximum size is 50 MB per file.`
      return
    }
  }

  statusText.textContent = loadingLbl

  try {
    const pdfjs = await loadPdfJs()

    for (let fi = 0; fi < validFiles.length; fi++) {
      const file = validFiles[fi]
      statusText.textContent = `Loading PDF ${fi + 1}/${validFiles.length} — ${file.name}`
      const buf = await file.arrayBuffer()
      let pageCount = 0
      let thumbCanvas = null

      try {
        const doc = await pdfjs.getDocument({ data: buf.slice(0) }).promise
        pageCount = doc.numPages

        // Render first-page thumbnail
        const page = await doc.getPage(1)
        const viewport = page.getViewport({ scale: 0.4 })
        thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = viewport.width
        thumbCanvas.height = viewport.height
        const ctx = thumbCanvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
        doc.destroy()
      } catch (err) {
        console.warn('[merge-pdf] preview failed for', file.name, err)
        // Still add the file even if preview fails — pdf-lib will handle the merge
        thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = 160
        thumbCanvas.height = 130
        const ctx = thumbCanvas.getContext('2d')
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, 160, 130)
        ctx.fillStyle = '#999'
        ctx.font = '13px DM Sans, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('PDF', 80, 70)
      }

      const id = ++fileIdCounter
      const card = document.createElement('div')
      card.className = 'pdf-card'

      const badge = document.createElement('span')
      badge.className = 'order-badge'
      badge.textContent = String(pdfFiles.length + 1)

      const removeButton = document.createElement('button')
      removeButton.className = 'remove-file'
      removeButton.textContent = '\u00D7'
      removeButton.title = t.remove || 'Remove'
      removeButton.addEventListener('click', e => {
        e.stopPropagation()
        removeFile(id)
      })

      const pname = document.createElement('div')
      pname.className = 'pname'
      pname.textContent = file.name

      const pmeta = document.createElement('div')
      pmeta.className = 'pmeta'
      pmeta.textContent = `${pageCount} ${pagesLabel}`

      card.append(thumbCanvas, badge, removeButton, pname, pmeta)
      setupDragHandlers(card, id)

      pdfFiles.push({ id, name: file.name, pageCount, arrayBuffer: buf, cardEl: card })
    }

    renderFileGrid()
    updateMergeButton()
    updateFileMeta()
    statusText.textContent = ''
  } catch (err) {
    console.error('[merge-pdf] load failed:', err)
    statusText.textContent = (t.mergepdf_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addPdfFiles(fileInput.files)
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) addPdfFiles(e.dataTransfer.files)
})

// ── Merge logic using pdf-lib ───────────────────────────────────────────────
mergeBtn.addEventListener('click', async () => {
  if (pdfFiles.length < 2) return
  mergeBtn.disabled = true
  mergeBtn.textContent = mergingLbl
  statusText.textContent = mergingLbl

  try {
    const mergedPdf = await PDFDocument.create()

    for (let i = 0; i < pdfFiles.length; i++) {
      statusText.textContent = `${mergingLbl} (${i + 1}/${pdfFiles.length})`
      const srcDoc = await PDFDocument.load(pdfFiles[i].arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
      copiedPages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedBytes = await mergedPdf.save()
    const blob = new Blob([mergedBytes], { type: 'application/pdf' })
    lastResults = [{ blob, name: `${mergedName}.pdf`, type: 'application/pdf' }]
    const url = URL.createObjectURL(blob)

    // Build download filename from first file's name
    const baseName = pdfFiles[0].name.replace(/\.[^.]+$/, '')
    const fileName = `${baseName}-merged.pdf`

    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)

    const totalPages = pdfFiles.reduce((s, f) => s + f.pageCount, 0)
    statusText.textContent = t.mergepdf_done
      || `Merged ${pdfFiles.length} files (${totalPages} ${pagesLabel}) into one PDF.`

    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(mergeBtn.parentElement, blob, fileName, 'merge-pdf')

    buildNextSteps()
  } catch (err) {
    console.error('[merge-pdf] merge failed:', err)
    statusText.textContent = (t.mergepdf_error || 'Merge failed: ') + (err?.message || err)
  }

  mergeBtn.textContent = mergeLbl
  mergeBtn.disabled = false
  updateMergeButton()
})

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
    addPdfFiles(files)
  } catch (e) { console.warn('[merge-pdf] IDB autoload failed:', e) }
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

// ── SEO section ─────────────────────────────────────────────────────────────

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['merge-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
