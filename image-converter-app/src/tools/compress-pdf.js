import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('compress-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['compress-pdf']) || 'Compress PDF'
const seoData   = t.seo && t.seo['compress-pdf']
const descText  = t.compresspdf_desc || (seoData ? seoData.h2a : 'Reduce PDF file size by optimizing images.')
const selectLbl = t.compresspdf_select || t.select_image || 'Select PDF'
const dropHint  = t.compresspdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const dlBtn     = t.download || 'Download'
const compressLbl   = t.compresspdf_compress_btn || 'Compress PDF'
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
  #sizeInfo{display:none;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:16px 20px;margin-bottom:14px;font-family:'DM Sans',sans-serif;}
  #sizeInfo.on{display:block;}
  .size-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:6px;}
  .size-row:last-child{margin-bottom:0;}
  .size-label{font-size:12px;font-weight:600;color:var(--text-secondary);min-width:90px;}
  .size-value{font-size:14px;font-weight:700;color:var(--text-primary);}
  .size-saved{font-size:13px;font-weight:700;color:#16a34a;}
  .size-bar-wrap{width:100%;height:8px;background:var(--bg-surface);border-radius:4px;overflow:hidden;margin-top:6px;}
  .size-bar{height:100%;background:var(--accent);border-radius:4px;transition:width 0.6s ease;}
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

document.title = t.compresspdf_page_title || (seoData ? seoData.page_title : 'Compress PDF Free | Reduce PDF Size Online \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.compresspdf_meta_desc || 'Compress PDF free online. Reduce PDF file size by converting pages to optimized JPEG images. Browser-only, no upload, instant download.'
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
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="qualityRow">
      <label>${qualityLabel}:</label>
      <div class="quality-options">
        <button class="quality-btn" data-level="low">${lowLbl}</button>
        <button class="quality-btn active" data-level="medium">${mediumLbl}</button>
        <button class="quality-btn" data-level="high">${highLbl}</button>
      </div>
      <span style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;" id="qualityHint"></span>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="sizeInfo">
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
    <div id="actionRow">
      <button class="action-btn" id="compressBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${compressLbl}</button>
      <button class="action-btn dark" id="downloadBtn" style="display:none;">${dlBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const qualityRow   = document.getElementById('qualityRow')
const qualityHint  = document.getElementById('qualityHint')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn    = document.getElementById('removeBtn')
const compressBtn  = document.getElementById('compressBtn')
const downloadBtn  = document.getElementById('downloadBtn')
const statusText   = document.getElementById('statusText')
const sizeInfo     = document.getElementById('sizeInfo')
const origSizeEl   = document.getElementById('origSize')
const compSizeEl   = document.getElementById('compSize')
const savedPctEl   = document.getElementById('savedPct')
const sizeBar      = document.getElementById('sizeBar')

let pdfFile = null
let pdfFileName = ''
let originalSize = 0
let compressedBlob = null
let selectedLevel = 'medium'

// Quality presets: JPEG quality (0-1) and render scale
const QUALITY_PRESETS = {
  low:    { jpeg: 0.40, scale: 1.0, hint: 'Smallest file, lower quality' },
  medium: { jpeg: 0.65, scale: 1.5, hint: 'Balanced quality and size' },
  high:   { jpeg: 0.85, scale: 2.0, hint: 'Best quality, moderate compression' },
}

updateQualityHint()

// ── Quality selector ────────────────────────────────────────────────────────
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

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['merge-pdf'] || 'Merge PDF', href: localHref('merge-pdf') },
    { label: ns['split-pdf'] || 'Split PDF', href: localHref('split-pdf') },
    { label: ns['rotate-pdf'] || 'Rotate PDF', href: localHref('rotate-pdf') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', () => { window.location.href = b.href })
    nextStepsButtons.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

function resetState() {
  pdfFile = null
  pdfFileName = ''
  originalSize = 0
  compressedBlob = null
  fileMeta.classList.remove('on')
  qualityRow.classList.remove('on')
  sizeInfo.classList.remove('on')
  downloadBtn.style.display = 'none'
  statusText.textContent = ''
  compressBtn.disabled = true
  compressBtn.style.opacity = '0.7'
  compressBtn.style.cursor = 'not-allowed'
  compressBtn.style.background = 'var(--btn-disabled)'
  compressBtn.textContent = compressLbl
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

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
    const doc = await pdfjs.getDocument({ data: buf }).promise

    pdfFile = file
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    originalSize = file.size

    fileMetaText.textContent = `${file.name} \u2014 ${doc.numPages} ${pagesLabel} \u2014 ${formatSize(originalSize)}`
    fileMeta.classList.add('on')
    qualityRow.classList.add('on')

    compressBtn.disabled = false
    compressBtn.style.opacity = '1'
    compressBtn.style.cursor = 'pointer'
    compressBtn.style.background = 'var(--accent)'
    statusText.textContent = ''
  } catch (err) {
    console.error('[compress-pdf] load failed:', err)
    statusText.textContent = (t.compresspdf_load_error || 'Could not load PDF: ') + (err?.message || err)
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

// ── Render a single page to JPEG blob ───────────────────────────────────────
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

// ── Compress ────────────────────────────────────────────────────────────────
compressBtn.addEventListener('click', async () => {
  if (!pdfFile) return
  compressBtn.disabled = true
  compressBtn.textContent = compressingLbl
  downloadBtn.style.display = 'none'
  sizeInfo.classList.remove('on')

  const preset = QUALITY_PRESETS[selectedLevel]

  try {
    const pdfjs = await loadPdfJs()
    const srcBuf = await pdfFile.arrayBuffer()
    const srcDoc = await pdfjs.getDocument({ data: new Uint8Array(srcBuf) }).promise

    // Create new PDF with pdf-lib
    const newPdf = await PDFDocument.create()

    for (let i = 1; i <= srcDoc.numPages; i++) {
      statusText.textContent = `${compressingLbl} (${i}/${srcDoc.numPages})`

      const page = await srcDoc.getPage(i)
      const jpegBlob = await renderPageToJpeg(page, preset.scale, preset.jpeg)
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer())

      // Embed JPEG into new PDF
      const jpegImage = await newPdf.embedJpg(jpegBytes)

      // Get original page dimensions to maintain them
      const origViewport = page.getViewport({ scale: 1 })
      const pageWidth = origViewport.width * 0.75   // pt to PDF units (72 dpi)
      const pageHeight = origViewport.height * 0.75

      const newPage = newPdf.addPage([pageWidth, pageHeight])
      newPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      })
    }

    const compressedBytes = await newPdf.save()
    compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' })
    const compressedSize = compressedBlob.size

    // Show size info
    origSizeEl.textContent = formatSize(originalSize)
    compSizeEl.textContent = formatSize(compressedSize)

    const pctSaved = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0
    if (pctSaved > 0) {
      savedPctEl.textContent = `(${pctSaved}% ${savedLbl.toLowerCase()})`
      savedPctEl.style.color = '#16a34a'
    } else {
      savedPctEl.textContent = pctSaved === 0 ? '(no change)' : `(+${Math.abs(pctSaved)}% larger)`
      savedPctEl.style.color = pctSaved < 0 ? '#dc2626' : 'var(--text-muted)'
    }

    const barPct = originalSize > 0 ? Math.min(100, Math.round((compressedSize / originalSize) * 100)) : 100
    sizeBar.style.width = barPct + '%'
    sizeInfo.classList.add('on')

    statusText.textContent = t.compresspdf_done || 'Compression complete.'
    downloadBtn.style.display = 'block'
    compressBtn.textContent = compressLbl
    compressBtn.disabled = false

    buildNextSteps()
  } catch (err) {
    console.error('[compress-pdf] compression failed:', err)
    statusText.textContent = (t.compresspdf_error || 'Compression failed: ') + (err?.message || err)
    compressBtn.textContent = compressLbl
    compressBtn.disabled = false
  }
})

// ── Download ────────────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  if (!compressedBlob) return
  const a = document.createElement('a')
  const url = URL.createObjectURL(compressedBlob)
  a.href = url
  a.download = `${pdfFileName || 'compressed'}-compressed.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)

  if (window.showReviewPrompt) window.showReviewPrompt()
  window.rcShowSaveButton?.(downloadBtn.parentElement, compressedBlob, `${pdfFileName || 'compressed'}-compressed.pdf`, 'compress-pdf')
})

// ── SEO Section ─────────────────────────────────────────────────────────────
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
