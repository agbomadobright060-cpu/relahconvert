import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('pdf-to-png')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['pdf-to-png']) || 'PDF to PNG'
const seoData   = t.seo && t.seo['pdf-to-png']
const descText  = (t.pdfpng_desc) || (seoData ? seoData.h2a : 'Convert PDF pages to PNG images free. No upload required.')
const selectLbl = t.pdfpng_select || t.select_image || 'Select PDF'
const dropHint  = t.pdfpng_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const convertLbl   = t.pdfpng_convert_btn || 'Convert to PNG'
const convertingLbl = t.pdfpng_converting || 'Converting…'
const dpiLabel  = t.pdfpng_dpi_label || 'Output quality (DPI)'
const dpiHint   = t.pdfpng_dpi_hint || 'Higher = sharper but larger files'
const pageLabel = t.pdfpng_page || 'Page'
const pagesLabel = t.pdfpng_pages || 'pages'
const loadingLbl = t.pdfpng_loading || 'Loading PDF…'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:var(--bg-page);`

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #dpiRow{display:none;align-items:center;gap:12px;margin-bottom:14px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:12px 16px;flex-wrap:wrap;}
  #dpiRow.on{display:flex;}
  #dpiRow label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #dpiInput{width:90px;padding:6px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);outline:none;background:var(--bg-card);}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;}
  .pdf-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;}
  .pdf-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .pdf-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
  .pdf-card .pmeta{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 8px 6px;}
  .pdf-card .dl-link{display:none;font-size:11px;font-weight:700;color:var(--accent);font-family:'DM Sans',sans-serif;padding:0 8px 8px;text-decoration:none;}
  .pdf-card .dl-link:hover{text-decoration:underline;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
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

document.title = t.pdfpng_page_title || (seoData ? seoData.page_title : 'PDF to PNG Converter Free | No Upload — RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.pdfpng_meta_desc || 'Convert PDF to PNG free. Extract every page of a PDF as a high-quality PNG image. Browser-only, no upload, batch download as ZIP.'
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
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop a PDF here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="dpiRow">
      <label>${dpiLabel}:</label>
      <input type="number" id="dpiInput" value="150" min="72" max="600" step="1" />
      <span style="font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;">${dpiHint}</span>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="convertBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${convertLbl}</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput   = document.getElementById('fileInput')
const dpiRow      = document.getElementById('dpiRow')
const dpiInput    = document.getElementById('dpiInput')
const fileGrid    = document.getElementById('fileGrid')
const fileMeta    = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn   = document.getElementById('removeBtn')
const convertBtn  = document.getElementById('convertBtn')
const zipBtn      = document.getElementById('zipBtn')
const statusText  = document.getElementById('statusText')

let pdfDoc = null
let pdfFileName = ''
let pages = []   // [{ pageNum, card, dlLink, blob? }]
let lastResults = []

// ── Lazy-load pdf.js ────────────────────────────────────────────────────────
// NOTE: must be plain string literals (not template literals) so Vite leaves
// the full URL alone instead of rewriting it as a relative path.
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// ── IndexedDB handoff to next-step tools ───────────────────────────────────
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

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.compress || 'Compress', href: localHref('compress') },
    { label: ns.resize || 'Resize', href: localHref('resize') },
    { label: ns['png-to-jpg'] || 'PNG to JPG', href: localHref('png-to-jpg') },
    { label: ns['merge-images'] || 'Merge Images', href: localHref('merge-images') },
    { label: ns['png-to-pdf'] || 'PNG to PDF', href: localHref('png-to-pdf') },
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

function resetState() {
  pdfDoc = null
  pdfFileName = ''
  pages = []
  lastResults = []
  fileGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  dpiRow.classList.remove('on')
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  convertBtn.disabled = true
  convertBtn.style.opacity = '0.7'
  convertBtn.style.cursor = 'not-allowed'
  convertBtn.style.background = 'var(--btn-disabled)'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Wrong format.'
    return
  }
  resetState()
  statusText.textContent = loadingLbl
  try {
    const pdfjs = await loadPdfJs()
    const buf = await file.arrayBuffer()
    pdfDoc = await pdfjs.getDocument({ data: buf }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    fileMetaText.textContent = `${file.name} \u2014 ${pdfDoc.numPages} ${pagesLabel}`
    fileMeta.classList.add('on')
    dpiRow.classList.add('on')

    // Render preview thumbnails (small scale)
    for (let i = 1; i <= pdfDoc.numPages; i++) {
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
      const pmeta = document.createElement('div')
      pmeta.className = 'pmeta'
      const fullViewport = page.getViewport({ scale: 1 })
      pmeta.textContent = `${Math.round(fullViewport.width)} \u00D7 ${Math.round(fullViewport.height)} pt`
      const dlLink = document.createElement('a')
      dlLink.className = 'dl-link'
      dlLink.textContent = `\u2B07 ${dlBtn} PNG`
      card.append(canvas, pname, pmeta, dlLink)
      fileGrid.appendChild(card)
      pages.push({ pageNum: i, card, dlLink })
    }

    convertBtn.disabled = false
    convertBtn.style.opacity = '1'
    convertBtn.style.cursor = 'pointer'
    convertBtn.style.background = 'var(--accent)'
    statusText.textContent = ''
  } catch (err) {
    console.error('[pdf-to-png] load failed:', err)
    statusText.textContent = (t.pdfpng_load_error || 'Could not load PDF: ') + (err?.message || err)
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

function makeUnique(usedNames, name) {
  if (!usedNames.has(name)) { usedNames.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot !== -1 ? name.slice(0, dot) : name
  const ext  = dot !== -1 ? name.slice(dot) : ''
  let i = 1
  while (usedNames.has(`${base}-${i}${ext}`)) i++
  const unique = `${base}-${i}${ext}`
  usedNames.add(unique)
  return unique
}

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
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'))
  })
}

convertBtn.addEventListener('click', async () => {
  if (!pdfDoc) return
  convertBtn.disabled = true
  const dpi = Math.max(72, Math.min(600, parseInt(dpiInput.value) || 150))
  const usedNames = new Set()
  const results = []
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    statusText.textContent = `${convertingLbl} (${i}/${pdfDoc.numPages})`
    const page = await pdfDoc.getPage(i)
    const blob = await pageToPngBlob(page, dpi)
    const safeName = makeUnique(usedNames, `${pdfFileName || 'page'}-page-${String(i).padStart(2, '0')}.png`)
    const url = URL.createObjectURL(blob)
    const entry = pages[i - 1]
    if (entry && entry.dlLink) {
      entry.dlLink.href = url
      entry.dlLink.download = safeName
      entry.dlLink.style.display = 'block'
      entry.dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
    }
    results.push({ name: safeName, blob })
  }
  convertBtn.disabled = false
  statusText.textContent = pdfDoc.numPages > 1
    ? `${pdfDoc.numPages} ${t.pdfpng_pngs_ready || 'PNGs ready.'}`
    : (t.pdfpng_png_ready || 'PNG ready.')
  if (pdfDoc.numPages > 1) { zipBtn.style.display = 'block'; zipBtn._results = results }
  lastResults = results.map(r => ({ blob: r.blob, name: r.name, type: 'image/png' }))
  buildNextSteps()
})

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
    a.download = `${pdfFileName || 'pdf-pages'}.zip`
    a.click()
    if (window.showReviewPrompt) window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, `${pdfFileName || 'pdf-pages'}.zip`, 'pdf-to-png')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

;(function injectSEO() {
  const seo = t.seo && t.seo['pdf-to-png']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
