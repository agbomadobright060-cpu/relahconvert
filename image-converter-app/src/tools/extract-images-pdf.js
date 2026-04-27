import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('extract-images-pdf')

const t = getT()

const toolName    = (t.nav_short && t.nav_short['extract-images-pdf']) || 'Extract Images from PDF'
const seoData     = t.seo && t.seo['extract-images-pdf']
const descText    = t.extimg_desc || (seoData ? seoData.h2a : 'Extract actual embedded images from any PDF — photos, logos, diagrams — at their original resolution.')
const selectLbl   = t.extimg_select || 'Select PDFs'
const dropHint    = t.extimg_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const extractLbl  = t.extimg_extract_btn || 'Extract Images'
const extractAllLbl = t.extimg_extract_all_btn || 'Extract All & Download ZIP'
const extractingLbl = t.extimg_extracting || 'Extracting\u2026'
const dlBtn       = t.download || 'Download'
const dlZipBtn    = t.download_zip || 'Download All as ZIP'
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
  .img-card canvas,.img-card img{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
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
  .file-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
  .file-tab{padding:7px 14px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;color:var(--text-secondary);cursor:pointer;transition:all 0.15s;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .file-tab:hover{border-color:var(--accent);color:var(--accent);}
  .file-tab.active{background:var(--accent);color:var(--text-on-accent);border-color:var(--accent);}
  .file-tab .tab-badge{display:inline-block;margin-left:5px;font-size:10px;font-weight:700;opacity:0.7;}
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

document.title = t.extimg_page_title || (seoData ? seoData.page_title : 'Extract Images from PDF Free Online | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.extimg_meta_desc || 'Extract actual embedded images from any PDF at their original resolution. Download photos, logos, and diagrams individually or as a ZIP.'
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
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="fileTabs" class="file-tabs" style="display:none;"></div>
    <div id="imageGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="extractBtn">${extractLbl}</button>
      <button class="action-btn dark" id="extractAllBtn" style="display:none;">${extractAllLbl}</button>
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
const extractAllBtn = document.getElementById('extractAllBtn')
const zipBtn       = document.getElementById('zipBtn')
const statusText   = document.getElementById('statusText')
const fileTabs     = document.getElementById('fileTabs')

/* -- Multi-file state -------------------------------------------------------- */
let files = []          // { name, bytes, pdfDocProxy, pageCount, extractedImages }
let activeFileIndex = 0
let lastResults = []    // flat array for IDB handoff / next-steps

const MAX_FILES = 25
const MAX_SIZE  = 50 * 1024 * 1024

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
    const rawFiles = records.map(r => new File([r.blob], r.name, { type: r.type || 'application/pdf' }))
    loadPdfFiles(rawFiles)
  } catch (e) { console.warn('[extract-images-pdf] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.compress || 'Compress Image', href: localHref('compress') },
    { label: ns.resize || 'Resize Image', href: localHref('resize') },
    { label: ns['png-to-jpg'] || 'PNG to JPG', href: localHref('png-to-jpg') },
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
  files = []
  activeFileIndex = 0
  lastResults = []
  imageGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  fileTabs.style.display = 'none'
  fileTabs.innerHTML = ''
  if (document.getElementById('uploadArea')) document.getElementById('uploadArea').style.display = ''
  document.getElementById('actionRow').style.display = 'none'
  extractAllBtn.style.display = 'none'
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

// -- File tabs UI ------------------------------------------------------------
function renderFileTabs() {
  fileTabs.innerHTML = ''
  if (files.length <= 1) { fileTabs.style.display = 'none'; return }
  fileTabs.style.display = 'flex'
  files.forEach((f, i) => {
    const tab = document.createElement('button')
    tab.className = 'file-tab' + (i === activeFileIndex ? ' active' : '')
    const shortName = f.name.length > 22 ? f.name.slice(0, 19) + '\u2026' : f.name
    let badge = ''
    if (f.extractedImages && f.extractedImages.length > 0) badge = `<span class="tab-badge">(${f.extractedImages.length})</span>`
    tab.innerHTML = shortName + badge
    tab.title = f.name
    tab.addEventListener('click', () => switchToFile(i))
    fileTabs.appendChild(tab)
  })
}

function switchToFile(idx) {
  if (idx < 0 || idx >= files.length) return
  activeFileIndex = idx
  renderFileTabs()
  renderActiveFileGrid()
  updateFileMetaText()
  updateButtonVisibility()
}

function updateFileMetaText() {
  const f = files[activeFileIndex]
  if (!f) return
  const totalText = files.length > 1 ? ` (file ${activeFileIndex + 1} of ${files.length})` : ''
  fileMetaText.textContent = `${f.name} \u2014 ${f.pageCount} ${pagesLabel}${totalText}`
}

function renderActiveFileGrid() {
  imageGrid.innerHTML = ''
  const f = files[activeFileIndex]
  if (!f || !f.extractedImages || f.extractedImages.length === 0) {
    if (f && f.extractedImages) {
      statusText.textContent = t.extimg_no_images || 'No embedded images found in this PDF.'
    } else {
      statusText.textContent = ''
    }
    zipBtn.style.display = 'none'
    return
  }

  f.extractedImages.forEach(item => {
    const card = document.createElement('div')
    card.className = 'img-card'
    const img = document.createElement('img')
    img.src = item.url
    img.alt = item.label
    const iname = document.createElement('div')
    iname.className = 'iname'
    iname.textContent = item.label
    const imeta = document.createElement('div')
    imeta.className = 'imeta'
    imeta.textContent = `${item.w} \u00D7 ${item.h} \u2014 ${formatSize(item.size)}`
    const dlLink = document.createElement('a')
    dlLink.className = 'dl-link'
    dlLink.href = item.url
    dlLink.download = item.name
    dlLink.textContent = `\u2B07 ${dlBtn} PNG`
    dlLink.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(item.url), 10000))
    card.append(img, iname, imeta, dlLink)
    imageGrid.appendChild(card)
  })

  const count = f.extractedImages.length
  statusText.textContent = count === 1
    ? (t.extimg_image_ready || '1 image extracted.')
    : `${count} ${t.extimg_images_ready || 'images extracted.'}`

  if (count > 1) {
    zipBtn.style.display = 'block'
    zipBtn._results = f.extractedImages.map(item => ({ name: item.name, blob: item.blob }))
  } else {
    zipBtn.style.display = 'none'
  }
}

function updateButtonVisibility() {
  const anyExtracted = files.some(f => f.extractedImages && f.extractedImages.length > 0)
  if (anyExtracted) buildNextSteps()
}

// -- Load PDFs ---------------------------------------------------------------
async function loadPdfFiles(rawFiles) {
  const validFiles = []
  for (const file of rawFiles) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) continue
    if (file.size > MAX_SIZE) {
      statusText.textContent = `"${file.name}" exceeds 50 MB limit — skipped.`
      continue
    }
    validFiles.push(file)
  }

  if (validFiles.length === 0) {
    statusText.textContent = t.warn_wrong_fmt_short || 'No valid PDF files selected.'
    return
  }

  if (validFiles.length > MAX_FILES) {
    statusText.textContent = `Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} will be loaded.`
    validFiles.length = MAX_FILES
  }

  resetState()
  statusText.textContent = loadingLbl

  try {
    const pdfjs = await loadPdfJs()

    for (const file of validFiles) {
      const buf = await file.arrayBuffer()
      const data = new Uint8Array(buf.slice(0))
      const pdfDocProxy = await pdfjs.getDocument({ data }).promise
      files.push({
        name: file.name,
        bytes: data,
        pdfDocProxy,
        pageCount: pdfDocProxy.numPages,
        extractedImages: null   // null = not yet extracted
      })
    }

    activeFileIndex = 0
    document.getElementById('uploadArea').style.display = 'none'
    fileMeta.classList.add('on')
    updateFileMetaText()
    renderFileTabs()
    document.getElementById('actionRow').style.display = 'flex'

    // Show "Extract All" button only when multiple files
    if (files.length > 1) {
      extractAllBtn.style.display = 'block'
    }

    statusText.textContent = ''
  } catch (err) {
    console.error('[extract-images-pdf] load failed:', err)
    statusText.textContent = (t.extimg_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFiles(Array.from(fileInput.files))
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) loadPdfFiles(Array.from(e.dataTransfer.files))
})

// -- Convert raw image data to a PNG blob ------------------------------------
function imageDataToBlob(imgData) {
  return new Promise((resolve, reject) => {
    try {
      const w = imgData.width
      const h = imgData.height
      if (!w || !h || w < 1 || h < 1) { resolve(null); return }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      const rawData = imgData.data
      const kind = imgData.kind

      // kind 1 = GRAYSCALE_1BPP, kind 2 = RGB_24BPP, kind 3 = RGBA_32BPP
      // If it's already RGBA (Uint8ClampedArray with 4 bytes per pixel), use directly
      if (rawData instanceof Uint8ClampedArray && rawData.length === w * h * 4) {
        const id = new ImageData(new Uint8ClampedArray(rawData), w, h)
        ctx.putImageData(id, 0, 0)
      } else if (rawData instanceof Uint8Array || rawData instanceof Uint8ClampedArray) {
        const pixels = rawData.length
        const expected4 = w * h * 4
        const expected3 = w * h * 3
        const expected1 = w * h

        if (pixels === expected4) {
          // RGBA data
          const id = new ImageData(new Uint8ClampedArray(rawData), w, h)
          ctx.putImageData(id, 0, 0)
        } else if (pixels === expected3) {
          // RGB data — expand to RGBA
          const rgba = new Uint8ClampedArray(expected4)
          for (let i = 0, j = 0; i < pixels; i += 3, j += 4) {
            rgba[j]     = rawData[i]
            rgba[j + 1] = rawData[i + 1]
            rgba[j + 2] = rawData[i + 2]
            rgba[j + 3] = 255
          }
          const id = new ImageData(rgba, w, h)
          ctx.putImageData(id, 0, 0)
        } else if (pixels === expected1) {
          // Grayscale data — expand to RGBA
          const rgba = new Uint8ClampedArray(expected4)
          for (let i = 0; i < pixels; i++) {
            const off = i * 4
            rgba[off] = rgba[off + 1] = rgba[off + 2] = rawData[i]
            rgba[off + 3] = 255
          }
          const id = new ImageData(rgba, w, h)
          ctx.putImageData(id, 0, 0)
        } else {
          // Unknown format — skip
          resolve(null)
          return
        }
      } else {
        // Not a typed array — skip
        resolve(null)
        return
      }

      canvas.toBlob(blob => resolve(blob ? { blob, w, h } : null), 'image/png')
    } catch (e) {
      console.warn('[extract-images-pdf] imageDataToBlob error:', e)
      resolve(null)
    }
  })
}

// -- Extract images from a single file entry ---------------------------------
async function extractFromFile(fileEntry) {
  const pdfDoc = fileEntry.pdfDocProxy
  const pdfFileName = fileEntry.name.replace(/\.[^.]+$/, '')
  const pdfjs = await loadPdfJs()
  const results = []
  const seenImages = new Set()
  let imgCount = 0

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    statusText.textContent = `${fileEntry.name}: scanning page ${p}/${pdfDoc.numPages}` + (imgCount > 0 ? ` \u2014 found ${imgCount} image${imgCount !== 1 ? 's' : ''} so far` : '')

    let page
    try { page = await pdfDoc.getPage(p) } catch (e) { continue }

    let ops
    try { ops = await page.getOperatorList() } catch (e) { continue }

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i]
      if (fn !== pdfjs.OPS.paintImageXObject && fn !== pdfjs.OPS.paintJpegXObject) continue

      const imgName = ops.argsArray[i][0]
      if (!imgName || seenImages.has(imgName)) continue
      seenImages.add(imgName)

      let imgData
      try { imgData = await page.objs.get(imgName) } catch (e) { continue }
      if (!imgData || !imgData.width || !imgData.height) continue

      // Skip tiny images (likely artifacts, spacing pixels, or decorative dots)
      if (imgData.width < 8 || imgData.height < 8) continue

      let result
      try { result = await imageDataToBlob(imgData) } catch (e) { continue }
      if (!result) continue

      imgCount++
      const safeName = `${pdfFileName || 'image'}-img-${String(imgCount).padStart(3, '0')}.png`
      const url = URL.createObjectURL(result.blob)

      results.push({
        name: safeName,
        label: `Image ${imgCount}`,
        blob: result.blob,
        url,
        w: result.w,
        h: result.h,
        size: result.blob.size
      })
    }
  }

  fileEntry.extractedImages = results
  return results
}

// -- Extract from current file -----------------------------------------------
extractBtn.addEventListener('click', async () => {
  const f = files[activeFileIndex]
  if (!f) return
  extractBtn.disabled = true
  extractAllBtn.disabled = true
  extractBtn.textContent = extractingLbl
  imageGrid.innerHTML = ''
  zipBtn.style.display = 'none'

  const results = await extractFromFile(f)
  renderFileTabs()
  renderActiveFileGrid()

  // Rebuild flat lastResults for IDB handoff
  rebuildLastResults()

  extractBtn.disabled = false
  extractAllBtn.disabled = false
  extractBtn.textContent = extractLbl

  if (results.length > 0) {
    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
  }

  updateButtonVisibility()
})

// -- Extract All & Download ZIP ----------------------------------------------
extractAllBtn.addEventListener('click', async () => {
  extractBtn.disabled = true
  extractAllBtn.disabled = true
  extractAllBtn.textContent = extractingLbl
  zipBtn.style.display = 'none'

  let totalImages = 0
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    // Only extract if not already extracted
    if (!f.extractedImages) {
      await extractFromFile(f)
    }
    totalImages += f.extractedImages.length
    renderFileTabs()
  }

  rebuildLastResults()

  if (totalImages === 0) {
    statusText.textContent = t.extimg_no_images || 'No embedded images found in any PDF.'
    extractBtn.disabled = false
    extractAllBtn.disabled = false
    extractAllBtn.textContent = extractAllLbl
    renderActiveFileGrid()
    return
  }

  // Show active file grid
  renderActiveFileGrid()
  statusText.textContent = `${totalImages} images extracted from ${files.length} files. Zipping\u2026`

  // Build ZIP with all images from all files
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()

    for (const f of files) {
      if (!f.extractedImages || f.extractedImages.length === 0) continue
      const folderName = files.length > 1 ? f.name.replace(/\.[^.]+$/, '') : null
      for (const item of f.extractedImages) {
        const path = folderName ? `${folderName}/${item.name}` : item.name
        zip.file(path, await item.blob.arrayBuffer())
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    const zipName = files.length === 1
      ? `${files[0].name.replace(/\.[^.]+$/, '')}-images.zip`
      : 'pdf-images-all.zip'
    a.download = zipName
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(extractAllBtn.parentElement, zipBlob, zipName, 'extract-images-pdf')

    statusText.textContent = `${totalImages} images from ${files.length} files downloaded as ZIP.`
    if (window.showReviewPrompt) window.showReviewPrompt()
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }

  extractBtn.disabled = false
  extractAllBtn.disabled = false
  extractAllBtn.textContent = extractAllLbl
  buildNextSteps()
})

// -- Rebuild flat lastResults for IDB handoff --------------------------------
function rebuildLastResults() {
  lastResults = []
  for (const f of files) {
    if (!f.extractedImages) continue
    for (const item of f.extractedImages) {
      lastResults.push({ blob: item.blob, name: item.name, type: 'image/png' })
    }
  }
}

// -- Download All as ZIP (current file only) ---------------------------------
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
    const f = files[activeFileIndex]
    const zipName = `${f ? f.name.replace(/\.[^.]+$/, '') : 'pdf-images'}.zip`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = zipName
    a.click()
    if (window.showReviewPrompt) window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, zipName, 'extract-images-pdf')
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
