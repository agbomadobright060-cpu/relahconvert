import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('crop-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['crop-pdf']) || 'Crop PDF'
const seoData   = t.seo && t.seo['crop-pdf']
const descText  = t.croppdf_desc || t.card_crop_pdf_desc || 'Crop PDF pages by adjusting margins. Set custom top, bottom, left, and right margins in points.'
const selectLbl = t.croppdf_select || t.select_image || 'Select PDF'
const dropHint  = t.croppdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const applyLbl  = t.croppdf_apply_btn || 'Apply & Download'
const applyingLbl = t.croppdf_applying || 'Applying crop\u2026'
const loadingLbl = t.croppdf_loading || 'Loading PDF\u2026'
const pageLabel = t.croppdf_page || t.pdfpng_page || 'Page'
const pagesLabel = t.croppdf_pages || t.pdfpng_pages || 'pages'
const topLbl    = t.croppdf_top || 'Top'
const bottomLbl = t.croppdf_bottom || 'Bottom'
const leftLbl   = t.croppdf_left || 'Left'
const rightLbl  = t.croppdf_right || 'Right'
const applyAllPagesLbl = t.croppdf_apply_all_pages || 'Apply to all pages'
const marginsLbl = t.croppdf_margins || 'Crop Margins (points)'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

/* -- Lazy-load PDF.js -------------------------------------------------------- */
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

/* -- Styles ------------------------------------------------------------------ */
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}

  /* Options panel */
  .options-panel{display:none;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:16px 20px;margin-bottom:16px;}
  .options-panel.on{display:block;}
  .options-title{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;}
  .margin-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:12px;}
  .margin-field{display:flex;flex-direction:column;gap:4px;}
  .margin-field label{font-size:11px;font-weight:600;color:var(--text-muted);font-family:'DM Sans',sans-serif;}
  .margin-field input{padding:8px 12px;border:1.5px solid var(--border-light);border-radius:8px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);width:100%;box-sizing:border-box;transition:border-color 0.15s;}
  .margin-field input:focus{outline:none;border-color:var(--accent);}
  .apply-all-row{display:flex;align-items:center;gap:8px;margin-top:4px;}
  .apply-all-row input[type=checkbox]{accent-color:var(--accent);width:16px;height:16px;cursor:pointer;}
  .apply-all-row label{font-size:13px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;}

  /* File header row */
  .file-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;flex-wrap:wrap;}
  .file-header .fname{font-size:13px;color:var(--text-primary);font-family:'DM Sans',sans-serif;font-weight:600;}
  .file-header .fmeta{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;}
  .file-header .clear-btn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}

  /* Preview area */
  .preview-area{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:16px;background:var(--bg-surface);border-radius:12px;border:1.5px solid var(--border);overflow:hidden;min-height:300px;}
  .preview-area canvas{max-width:100%;max-height:500px;display:block;}
  .crop-overlay{position:absolute;pointer-events:none;}
  .crop-overlay-top,.crop-overlay-bottom,.crop-overlay-left,.crop-overlay-right{position:absolute;background:rgba(200,75,49,0.18);transition:all 0.2s;}
  .crop-overlay-top{top:0;left:0;right:0;}
  .crop-overlay-bottom{bottom:0;left:0;right:0;}
  .crop-overlay-left{left:0;}
  .crop-overlay-right{right:0;}

  /* Page nav */
  .page-nav{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px;font-family:'DM Sans',sans-serif;}
  .page-nav button{padding:6px 14px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .page-nav button:hover{border-color:var(--accent);color:var(--accent);}
  .page-nav button:disabled{opacity:0.4;cursor:not-allowed;}
  .page-nav .page-info{font-size:13px;color:var(--text-secondary);font-weight:600;}

  /* Action row */
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .action-btn.disabled{background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;}

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

document.title = t.croppdf_page_title || (seoData ? seoData.page_title : 'Crop PDF Pages Free Online \u2014 Adjust Margins | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.croppdf_meta_desc || 'Crop PDF pages by setting custom margins. Preview the crop area, adjust top, bottom, left, and right margins, then download.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div id="toolWrap" style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${descText}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
        <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
      </div>
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop PDF here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="fileHeader" class="file-header" style="display:none;"></div>
    <div id="optionsPanel" class="options-panel">
      <div class="options-title">${marginsLbl}</div>
      <div class="margin-grid">
        <div class="margin-field"><label for="marginTop">${topLbl} (pt)</label><input type="number" id="marginTop" value="0" min="0" step="1" /></div>
        <div class="margin-field"><label for="marginBottom">${bottomLbl} (pt)</label><input type="number" id="marginBottom" value="0" min="0" step="1" /></div>
        <div class="margin-field"><label for="marginLeft">${leftLbl} (pt)</label><input type="number" id="marginLeft" value="0" min="0" step="1" /></div>
        <div class="margin-field"><label for="marginRight">${rightLbl} (pt)</label><input type="number" id="marginRight" value="0" min="0" step="1" /></div>
      </div>
      <div class="apply-all-row">
        <input type="checkbox" id="applyAllCheck" checked />
        <label for="applyAllCheck">${applyAllPagesLbl}</label>
      </div>
    </div>
    <div id="previewArea" class="preview-area" style="display:none;">
      <canvas id="previewCanvas"></canvas>
      <div class="crop-overlay" id="cropOverlay">
        <div class="crop-overlay-top" id="overlayTop"></div>
        <div class="crop-overlay-bottom" id="overlayBottom"></div>
        <div class="crop-overlay-left" id="overlayLeft"></div>
        <div class="crop-overlay-right" id="overlayRight"></div>
      </div>
    </div>
    <div id="pageNav" class="page-nav" style="display:none;">
      <button id="prevPageBtn">\u2190 Prev</button>
      <span class="page-info" id="pageInfo"></span>
      <button id="nextPageBtn">Next \u2192</button>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:none;">
      <button class="action-btn" id="applyBtn">${applyLbl}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

/* -- DOM refs ---------------------------------------------------------------- */
const uploadArea    = document.getElementById('uploadArea')
const fileInput     = document.getElementById('fileInput')
const fileHeader    = document.getElementById('fileHeader')
const optionsPanel  = document.getElementById('optionsPanel')
const previewArea   = document.getElementById('previewArea')
const previewCanvas = document.getElementById('previewCanvas')
const cropOverlay   = document.getElementById('cropOverlay')
const overlayTop    = document.getElementById('overlayTop')
const overlayBottom = document.getElementById('overlayBottom')
const overlayLeft   = document.getElementById('overlayLeft')
const overlayRight  = document.getElementById('overlayRight')
const pageNav       = document.getElementById('pageNav')
const prevPageBtn   = document.getElementById('prevPageBtn')
const nextPageBtn   = document.getElementById('nextPageBtn')
const pageInfo      = document.getElementById('pageInfo')
const statusText    = document.getElementById('statusText')
const actionRow     = document.getElementById('actionRow')
const applyBtn      = document.getElementById('applyBtn')
const marginTop     = document.getElementById('marginTop')
const marginBottom  = document.getElementById('marginBottom')
const marginLeft    = document.getElementById('marginLeft')
const marginRight   = document.getElementById('marginRight')
const applyAllCheck = document.getElementById('applyAllCheck')

/* -- State ------------------------------------------------------------------- */
let fileBytes    = null  // Uint8Array
let fileName     = ''
let pdfDocProxy  = null  // PDF.js document
let pageCount    = 0
let currentPage  = 0     // 0-indexed
let pageViewport = null  // viewport of current rendered page
let renderScale  = 1
let lastResults  = []

/* -- Margin inputs ----------------------------------------------------------- */
function getMargins() {
  return {
    top:    Math.max(0, parseFloat(marginTop.value) || 0),
    bottom: Math.max(0, parseFloat(marginBottom.value) || 0),
    left:   Math.max(0, parseFloat(marginLeft.value) || 0),
    right:  Math.max(0, parseFloat(marginRight.value) || 0),
  }
}

;[marginTop, marginBottom, marginLeft, marginRight].forEach(inp => {
  inp.addEventListener('input', updateCropOverlay)
})

/* -- Update crop overlay ----------------------------------------------------- */
function updateCropOverlay() {
  if (!pageViewport || !pdfDocProxy) return
  const m = getMargins()

  // Convert point margins to pixel positions on canvas
  const scaleX = renderScale
  const scaleY = renderScale
  const canvasW = previewCanvas.width
  const canvasH = previewCanvas.height

  // PDF points to canvas pixels
  const topPx    = m.top * scaleY
  const bottomPx = m.bottom * scaleY
  const leftPx   = m.left * scaleX
  const rightPx  = m.right * scaleX

  // Get displayed size of canvas (CSS pixels)
  const rect = previewCanvas.getBoundingClientRect()
  const dispW = rect.width
  const dispH = rect.height

  // Scale from canvas pixels to display pixels
  const sx = dispW / canvasW
  const sy = dispH / canvasH

  const tPx = topPx * sy
  const bPx = bottomPx * sy
  const lPx = leftPx * sx
  const rPx = rightPx * sx

  // Position overlay to match canvas
  cropOverlay.style.width  = dispW + 'px'
  cropOverlay.style.height = dispH + 'px'
  cropOverlay.style.top    = previewCanvas.offsetTop + 'px'
  cropOverlay.style.left   = previewCanvas.offsetLeft + 'px'

  overlayTop.style.height    = Math.min(tPx, dispH) + 'px'
  overlayBottom.style.height = Math.min(bPx, dispH) + 'px'

  const midTop = Math.min(tPx, dispH)
  const midBot = Math.min(bPx, dispH)
  const midH   = Math.max(0, dispH - midTop - midBot)

  overlayLeft.style.top    = midTop + 'px'
  overlayLeft.style.height = midH + 'px'
  overlayLeft.style.width  = Math.min(lPx, dispW) + 'px'

  overlayRight.style.top    = midTop + 'px'
  overlayRight.style.height = midH + 'px'
  overlayRight.style.width  = Math.min(rPx, dispW) + 'px'
}

/* -- Render page preview ----------------------------------------------------- */
async function renderPage(pageIdx) {
  if (!pdfDocProxy) return
  const page = await pdfDocProxy.getPage(pageIdx + 1)

  // Calculate scale to fit max ~500px height
  const baseViewport = page.getViewport({ scale: 1 })
  const maxH = 500
  const maxW = 660
  const scaleH = maxH / baseViewport.height
  const scaleW = maxW / baseViewport.width
  renderScale = Math.min(scaleH, scaleW, 1.5)

  pageViewport = page.getViewport({ scale: renderScale })
  previewCanvas.width  = pageViewport.width
  previewCanvas.height = pageViewport.height
  const ctx = previewCanvas.getContext('2d')
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
  await page.render({ canvasContext: ctx, viewport: pageViewport, intent: 'display' }).promise

  // Update page nav
  pageInfo.textContent = `${pageLabel} ${pageIdx + 1} / ${pageCount}`
  prevPageBtn.disabled = pageIdx <= 0
  nextPageBtn.disabled = pageIdx >= pageCount - 1

  // Wait a frame for layout then update overlay
  requestAnimationFrame(updateCropOverlay)
}

/* -- Load file --------------------------------------------------------------- */
async function loadFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select a PDF file.'
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    statusText.textContent = `File too large. Max 50 MB.`
    return
  }

  statusText.textContent = loadingLbl
  document.getElementById('nextSteps').style.display = 'none'

  try {
    const pdfjs = await loadPdfJs()
    const buf = await file.arrayBuffer()
    fileBytes = new Uint8Array(buf.slice(0))
    fileName  = file.name

    pdfDocProxy = await pdfjs.getDocument({ data: buf }).promise
    pageCount   = pdfDocProxy.numPages
    currentPage = 0

    // Show UI
    uploadArea.style.display = 'none'
    fileHeader.style.display = 'flex'
    fileHeader.innerHTML = `
      <span><span class="fname">${fileName}</span> <span class="fmeta">\u2014 ${pageCount} ${pagesLabel}</span></span>
      <button class="clear-btn" id="clearBtn">${t.remove || 'Clear'}</button>
    `
    document.getElementById('clearBtn').addEventListener('click', resetState)

    optionsPanel.classList.add('on')
    previewArea.style.display = 'flex'
    pageNav.style.display = pageCount > 1 ? 'flex' : 'none'
    actionRow.style.display = 'flex'

    await renderPage(0)
    statusText.textContent = ''
  } catch (err) {
    console.error('[crop-pdf] load failed:', err)
    statusText.textContent = `Failed to load PDF: ${err?.message || err}`
  }
}

/* -- Page navigation --------------------------------------------------------- */
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--
    renderPage(currentPage)
  }
})
nextPageBtn.addEventListener('click', () => {
  if (currentPage < pageCount - 1) {
    currentPage++
    renderPage(currentPage)
  }
})

/* -- Reset ------------------------------------------------------------------- */
function resetState() {
  fileBytes    = null
  fileName     = ''
  pdfDocProxy  = null
  pageCount    = 0
  currentPage  = 0
  pageViewport = null
  lastResults  = []

  uploadArea.style.display   = ''
  fileHeader.style.display   = 'none'
  fileHeader.innerHTML       = ''
  optionsPanel.classList.remove('on')
  previewArea.style.display  = 'none'
  pageNav.style.display      = 'none'
  actionRow.style.display    = 'none'
  statusText.textContent     = ''
  document.getElementById('nextSteps').style.display = 'none'

  marginTop.value    = '0'
  marginBottom.value = '0'
  marginLeft.value   = '0'
  marginRight.value  = '0'
  applyAllCheck.checked = true
}

/* -- File input handlers ----------------------------------------------------- */
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadFile(fileInput.files[0])
  fileInput.value = ''
})

document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  const f = e.dataTransfer.files
  if (f.length) loadFile(f[0])
})

/* -- Apply crop & download --------------------------------------------------- */
applyBtn.addEventListener('click', applyCrop)

async function applyCrop() {
  if (!fileBytes) return
  const m = getMargins()

  if (m.top === 0 && m.bottom === 0 && m.left === 0 && m.right === 0) {
    statusText.textContent = t.croppdf_no_margins || 'Set at least one margin to crop.'
    return
  }

  statusText.textContent = applyingLbl
  setButtonsDisabled(true)

  try {
    const pdfDoc = await PDFDocument.load(fileBytes)
    const pages  = pdfDoc.getPages()
    const total  = pages.length
    const applyAll = applyAllCheck.checked

    const pagesToCrop = applyAll
      ? pages.map((_, i) => i)
      : [currentPage]

    for (const i of pagesToCrop) {
      statusText.textContent = `${applyingLbl} ${pageLabel} ${i + 1}/${total}`
      const page = pages[i]

      // Get the current MediaBox (the full page boundary)
      const mediaBox = page.getMediaBox()

      const newX = mediaBox.x + m.left
      const newY = mediaBox.y + m.bottom
      const newW = mediaBox.width - m.left - m.right
      const newH = mediaBox.height - m.top - m.bottom

      if (newW <= 0 || newH <= 0) {
        statusText.textContent = t.croppdf_margins_too_large || `Margins too large for page ${i + 1}. Reduce margin values.`
        setButtonsDisabled(false)
        return
      }

      // Set CropBox to apply the visual crop
      page.setCropBox(newX, newY, newW, newH)
    }

    const croppedBytes = await pdfDoc.save()
    const blob = new Blob([croppedBytes], { type: 'application/pdf' })
    const baseName = fileName.replace(/\.[^.]+$/, '')
    const outName = `${baseName}-cropped.pdf`
    lastResults = [{ blob, name: outName, type: 'application/pdf' }]
    downloadBlob(blob, outName)

    const doneMsg = applyAll
      ? `${total} ${pagesLabel} cropped.`
      : `${pageLabel} ${currentPage + 1} cropped.`
    statusText.textContent = (t.croppdf_done || 'Done!') + ' ' + doneMsg
    window.rcShowSaveButton?.()
    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
  } catch (err) {
    console.error('[crop-pdf] apply failed:', err)
    statusText.textContent = (t.croppdf_error || 'Failed to crop PDF: ') + (err?.message || err)
  }
  setButtonsDisabled(false)
}

/* -- Helpers ----------------------------------------------------------------- */
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function setButtonsDisabled(disabled) {
  actionRow.querySelectorAll('.action-btn').forEach(btn => {
    btn.disabled = disabled
    if (disabled) btn.classList.add('disabled')
    else btn.classList.remove('disabled')
  })
}

/* -- Resize observer for overlay --------------------------------------------- */
const resizeObs = new ResizeObserver(() => updateCropOverlay())
resizeObs.observe(previewArea)

/* -- IndexedDB handoff ------------------------------------------------------- */
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
    const file = new File([records[0].blob], records[0].name, { type: records[0].type || 'application/pdf' })
    loadFile(file)
  } catch (e) { console.warn('[crop-pdf] IDB autoload failed:', e) }
}

/* -- What's Next? ------------------------------------------------------------ */
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

/* -- SEO section ------------------------------------------------------------- */

loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['crop-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
