import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('remove-pdf')

const t = getT()

const toolName   = (t.nav_short && t.nav_short['remove-pdf']) || 'Remove PDF Pages'
const seoData    = t.seo && t.seo['remove-pdf']
const descText   = t.removepdf_desc || t.card_remove_pdf_desc || 'Delete unwanted pages from a PDF document.'
const selectLbl  = t.removepdf_select || 'Select PDF'
const dropHint   = t.removepdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const removeLbl  = t.removepdf_remove_btn || 'Remove Selected Pages'
const removingLbl = t.removepdf_removing || 'Removing pages...'
const dlBtn      = t.download || 'Download'
const pagesLabel = t.removepdf_pages || 'pages'
const pageLabel  = t.removepdf_page || 'Page'
const loadingLbl = t.removepdf_loading || 'Loading PDF...'
const removeAllWarn = t.removepdf_remove_all_warn || 'You must keep at least one page.'
const removedCountTpl = t.removepdf_count || '{x} pages will be removed, {y} pages will remain'

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
  .page-thumb{position:relative;background:var(--bg-card);border-radius:10px;border:2px solid var(--border);overflow:hidden;cursor:pointer;transition:all 0.18s;user-select:none;}
  .page-thumb canvas{width:100%;height:140px;object-fit:contain;display:block;background:var(--bg-surface);}
  .page-thumb .plabel{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;text-align:center;}
  .page-thumb .remove-x{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(220,38,38,0.85);color:#fff;font-size:14px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1;pointer-events:none;font-family:'DM Sans',sans-serif;}
  .page-thumb.marked{border-color:#DC2626;opacity:0.45;}
  .page-thumb.marked .remove-x{display:flex;}
  .page-thumb:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08);}
  .page-thumb.marked:hover{border-color:#DC2626;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #clearBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #removalCount{font-size:13px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;margin-bottom:12px;min-height:18px;font-weight:600;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;max-width:400px;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.disabled{background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .warn-text{font-size:13px;color:#DC2626;font-family:'DM Sans',sans-serif;margin-bottom:10px;font-weight:600;}
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

document.title = t.removepdf_page_title || 'Remove PDF Pages Free Online | No Upload \u2014 RelahConvert'
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.removepdf_meta_desc || 'Remove pages from a PDF free. Click to select unwanted pages and download the cleaned PDF. Browser-only, no upload needed.'
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
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${dropHint}</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="fileMeta"><span id="fileMetaText"></span><button id="clearBtn">${t.remove || 'Remove'}</button></div>
    <div id="pageGrid"></div>
    <div id="removalCount"></div>
    <div id="warnMsg" class="warn-text" style="display:none;"></div>
    <div class="status-text" id="statusText"></div>
    <div style="margin-bottom:14px;">
      <button class="action-btn disabled" id="removeBtn" disabled>${removeLbl}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const pageGrid     = document.getElementById('pageGrid')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const clearBtn     = document.getElementById('clearBtn')
const removalCount = document.getElementById('removalCount')
const warnMsg      = document.getElementById('warnMsg')
const removeBtn    = document.getElementById('removeBtn')
const statusText   = document.getElementById('statusText')

let pdfJsDoc = null
let pdfRawBytes = null
let pdfFileName = ''
let totalPages = 0
const markedForRemoval = new Set()

// ── Lazy-load pdf.js ────────────────────────────────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

function updateRemovalCount() {
  const removed = markedForRemoval.size
  const remaining = totalPages - removed

  if (removed === 0) {
    removalCount.textContent = ''
    warnMsg.style.display = 'none'
    removeBtn.disabled = true
    removeBtn.classList.add('disabled')
    return
  }

  if (remaining === 0) {
    removalCount.textContent = removedCountTpl.replace('{x}', removed).replace('{y}', remaining)
    warnMsg.textContent = removeAllWarn
    warnMsg.style.display = 'block'
    removeBtn.disabled = true
    removeBtn.classList.add('disabled')
    return
  }

  removalCount.textContent = removedCountTpl.replace('{x}', removed).replace('{y}', remaining)
  warnMsg.style.display = 'none'
  removeBtn.disabled = false
  removeBtn.classList.remove('disabled')
}

function resetState() {
  pdfJsDoc = null
  pdfRawBytes = null
  pdfFileName = ''
  totalPages = 0
  markedForRemoval.clear()
  pageGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  if (document.getElementById('uploadArea')) document.getElementById('uploadArea').style.display = ''
  removalCount.textContent = ''
  warnMsg.style.display = 'none'
  statusText.textContent = ''
  removeBtn.disabled = true
  removeBtn.classList.add('disabled')
  document.getElementById('nextSteps').style.display = 'none'
}

clearBtn.addEventListener('click', resetState)

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
    pdfJsDoc = await pdfjs.getDocument({ data: buf }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    totalPages = pdfJsDoc.numPages
    fileMetaText.textContent = `${file.name} \u2014 ${totalPages} ${pagesLabel}`
    document.getElementById('uploadArea').style.display = 'none'
    fileMeta.classList.add('on')

    for (let i = 1; i <= totalPages; i++) {
      statusText.textContent = `Loading page ${i}/${totalPages}`
      const page = await pdfJsDoc.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const thumb = document.createElement('div')
      thumb.className = 'page-thumb'
      thumb.dataset.page = i

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise

      const xOverlay = document.createElement('div')
      xOverlay.className = 'remove-x'
      xOverlay.textContent = '\u2715'

      const plabel = document.createElement('div')
      plabel.className = 'plabel'
      plabel.textContent = `${pageLabel} ${i}`

      thumb.append(canvas, xOverlay, plabel)
      pageGrid.appendChild(thumb)

      thumb.addEventListener('click', () => {
        const pageNum = parseInt(thumb.dataset.page)
        if (markedForRemoval.has(pageNum)) {
          markedForRemoval.delete(pageNum)
          thumb.classList.remove('marked')
        } else {
          markedForRemoval.add(pageNum)
          thumb.classList.add('marked')
        }
        updateRemovalCount()
      })
    }

    statusText.textContent = ''
  } catch (err) {
    console.error('[remove-pdf] load failed:', err)
    statusText.textContent = (t.removepdf_load_error || 'Could not load PDF: ') + (err?.message || err)
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

removeBtn.addEventListener('click', async () => {
  if (!pdfRawBytes || markedForRemoval.size === 0) return
  const remaining = totalPages - markedForRemoval.size
  if (remaining === 0) return

  removeBtn.disabled = true
  removeBtn.classList.add('disabled')
  statusText.textContent = removingLbl

  try {
    const srcDoc = await PDFDocument.load(pdfRawBytes)
    const newDoc = await PDFDocument.create()

    const pagesToKeep = []
    for (let i = 0; i < totalPages; i++) {
      if (!markedForRemoval.has(i + 1)) pagesToKeep.push(i)
    }

    const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep)
    copiedPages.forEach(p => newDoc.addPage(p))

    const resultBytes = await newDoc.save()
    const blob = new Blob([resultBytes], { type: 'application/pdf' })
    lastResults = [{ blob, name: `${pdfFileName || 'cleaned'}-cleaned.pdf`, type: 'application/pdf' }]
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pdfFileName || 'document'}-removed.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)

    statusText.textContent = t.removepdf_done || `Done! ${remaining} page${remaining > 1 ? 's' : ''} saved.`

    window.rcShowSaveButton?.(removeBtn.parentElement, blob, `${pdfFileName || 'document'}-removed.pdf`, 'remove-pdf')

    if (window.showReviewPrompt) window.showReviewPrompt()

    buildNextSteps()
  } catch (err) {
    console.error('[remove-pdf] removal failed:', err)
    statusText.textContent = (t.removepdf_error || 'Error removing pages: ') + (err?.message || err)
    removeBtn.disabled = false
    removeBtn.classList.remove('disabled')
  }
})


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
  } catch (e) { console.warn('[remove-pdf] IDB autoload failed:', e) }
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


loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['remove-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
