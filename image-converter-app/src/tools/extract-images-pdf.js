import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('extract-images-pdf')

const t = getT()

const toolName    = (t.nav_short && t.nav_short['extract-images-pdf']) || 'Extract Images from PDF'
const seoData     = t.seo && t.seo['extract-images-pdf']
const descText    = t.extimg_desc || (seoData ? seoData.h2a : 'Extract every page of a PDF as a high-quality PNG image.')
const selectLbl   = t.extimg_select || t.select_image || 'Select PDF'
const dropHint    = t.extimg_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const extractLbl  = t.extimg_extract_btn || 'Extract Images'
const extractingLbl = t.extimg_extracting || 'Extracting\u2026'
const dlBtn       = t.download || 'Download'
const dlZipBtn    = t.download_zip || 'Download All as ZIP'
const pageLabel   = t.extimg_page || t.pdfpng_page || 'Page'
const pagesLabel  = t.extimg_pages || t.pdfpng_pages || 'pages'
const loadingLbl  = t.extimg_loading || 'Loading PDF\u2026'

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
  #imageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;}
  .img-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;}
  .img-card img{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .img-card .iname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 2px;font-weight:600;}
  .img-card .imeta{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 8px 4px;}
  .img-card .dl-link{display:block;font-size:11px;font-weight:700;color:var(--accent);font-family:'DM Sans',sans-serif;padding:0 8px 8px;text-decoration:none;}
  .img-card .dl-link:hover{text-decoration:underline;}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
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

document.title = t.extimg_page_title || (seoData ? seoData.page_title : 'Extract Images from PDF Free Online | No Upload \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.extimg_meta_desc || 'Extract images from PDF free. Render every page as a high-quality PNG image. Download individually or as a ZIP. Browser-only, no upload.'
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
    <div id="imageGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="extractBtn">${extractLbl}</button>
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
const imageGrid    = document.getElementById('imageGrid')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn    = document.getElementById('removeBtn')
const extractBtn   = document.getElementById('extractBtn')
const zipBtn       = document.getElementById('zipBtn')
const statusText   = document.getElementById('statusText')

let pdfDoc = null
let pdfFileName = ''
let lastResults = []

// -- Lazy-load pdf.js --------------------------------------------------------
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// -- IndexedDB handoff -------------------------------------------------------
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
    loadPdfFile(files[0])
  } catch (e) { console.warn('[extract-images-pdf] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
    { label: ns['add-page-numbers'] || 'Add Page Numbers', href: localHref('add-page-numbers') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
    { label: ns.compress || 'Compress Image', href: localHref('compress') },
    { label: ns.resize || 'Resize Image', href: localHref('resize') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastResults.length) {
        try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

// -- Reset -------------------------------------------------------------------
function resetState() {
  pdfDoc = null
  pdfFileName = ''
  lastResults = []
  imageGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  if (document.getElementById('uploadArea')) document.getElementById('uploadArea').style.display = ''
  document.getElementById('actionRow').style.display = 'none'
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

// -- Render a single page to PNG blob at given DPI ---------------------------
function pageToPngBlob(page, dpi) {
  const scale = dpi / 72
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise.then(() => {
    return new Promise(resolve => canvas.toBlob(b => resolve({ blob: b, w: canvas.width, h: canvas.height }), 'image/png'))
  })
}

// -- Load PDF ----------------------------------------------------------------
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
    const data = new Uint8Array(buf.slice(0))
    pdfDoc = await pdfjs.getDocument({ data }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    fileMetaText.textContent = `${file.name} \u2014 ${pdfDoc.numPages} ${pagesLabel}`
    document.getElementById('uploadArea').style.display = 'none'
    fileMeta.classList.add('on')
    document.getElementById('actionRow').style.display = 'flex'
    statusText.textContent = ''
  } catch (err) {
    console.error('[extract-images-pdf] load failed:', err)
    statusText.textContent = (t.extimg_load_error || 'Could not load PDF: ') + (err?.message || err)
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

// -- Extract images (render pages at 150 DPI) --------------------------------
extractBtn.addEventListener('click', async () => {
  if (!pdfDoc) return
  extractBtn.disabled = true
  extractBtn.textContent = extractingLbl
  imageGrid.innerHTML = ''
  lastResults = []
  zipBtn.style.display = 'none'

  const DPI = 150
  const results = []

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    statusText.textContent = `Extracting page ${i}/${pdfDoc.numPages}`
    const page = await pdfDoc.getPage(i)
    const { blob, w, h } = await pageToPngBlob(page, DPI)
    const safeName = `${pdfFileName || 'page'}-page-${String(i).padStart(2, '0')}.png`
    const url = URL.createObjectURL(blob)

    // Build image card
    const card = document.createElement('div')
    card.className = 'img-card'

    const img = document.createElement('img')
    img.src = url
    img.alt = `${pageLabel} ${i}`

    const iname = document.createElement('div')
    iname.className = 'iname'
    iname.textContent = `${pageLabel} ${i}`

    const imeta = document.createElement('div')
    imeta.className = 'imeta'
    imeta.textContent = `${w} \u00D7 ${h} \u2014 ${formatSize(blob.size)}`

    const dlLink = document.createElement('a')
    dlLink.className = 'dl-link'
    dlLink.href = url
    dlLink.download = safeName
    dlLink.textContent = `\u2B07 ${dlBtn} PNG`
    dlLink.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 10000))

    card.append(img, iname, imeta, dlLink)
    imageGrid.appendChild(card)

    results.push({ name: safeName, blob })
  }

  lastResults = results.map(r => ({ blob: r.blob, name: r.name, type: 'image/png' }))

  statusText.textContent = pdfDoc.numPages > 1
    ? `${pdfDoc.numPages} ${t.extimg_images_ready || 'images extracted.'}`
    : (t.extimg_image_ready || 'Image extracted.')

  if (pdfDoc.numPages > 1) {
    zipBtn.style.display = 'block'
    zipBtn._results = results
  }

  extractBtn.disabled = false
  extractBtn.textContent = extractLbl

  buildNextSteps()

  if (window.showReviewPrompt) window.showReviewPrompt()
})

// -- Download All as ZIP -----------------------------------------------------
zipBtn.addEventListener('click', async () => {
  const results = zipBtn._results
  if (!results || !results.length) return
  zipBtn.textContent = 'Zipping\u2026'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${pdfFileName || 'pdf-images'}.zip`
    a.click()
    if (window.showReviewPrompt) window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, `${pdfFileName || 'pdf-images'}.zip`, 'extract-images-pdf')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

// -- Auto-load from IDB handoff ----------------------------------------------
loadPendingFiles()

// -- SEO section -------------------------------------------------------------
;(function injectSEO() {
  const seo = t.seo && t.seo['extract-images-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
