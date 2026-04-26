import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('rotate-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['rotate-pdf']) || 'Rotate PDF'
const seoData   = t.seo && t.seo['rotate-pdf']
const descText  = t.rotatepdf_desc || (seoData ? seoData.h2a : 'Rotate PDF pages by 90, 180, or 270 degrees.')
const selectLbl = t.rotatepdf_select || t.select_image || 'Select PDF'
const dropHint  = t.rotatepdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const dlBtn     = t.download || 'Download'
const rotateLbl = t.rotatepdf_apply_btn || 'Apply & Download'
const applyingLbl = t.rotatepdf_applying || 'Applying rotations\u2026'
const pageLabel = t.rotatepdf_page || t.pdfpng_page || 'Page'
const pagesLabel = t.rotatepdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl = t.rotatepdf_loading || 'Loading PDF\u2026'
const rotateAllLbl = t.rotatepdf_rotate_all || 'Rotate All'
const cwLbl     = t.rotatepdf_cw || '90\u00B0 CW'
const ccwLbl    = t.rotatepdf_ccw || '90\u00B0 CCW'
const r180Lbl   = t.rotatepdf_180 || '180\u00B0'
const resetLbl  = t.rotatepdf_reset || 'Reset'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  #pageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:16px;}
  .page-card{background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);overflow:hidden;position:relative;transition:border-color 0.15s;}
  .page-card:hover{border-color:var(--accent);}
  .page-card .thumb-wrap{width:100%;height:160px;display:flex;align-items:center;justify-content:center;background:var(--bg-surface);overflow:hidden;position:relative;}
  .page-card .thumb-wrap canvas{max-width:100%;max-height:100%;display:block;transition:transform 0.3s ease;}
  .page-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:8px 10px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
  .page-card .rot-info{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 10px 4px;}
  .page-card .rot-btn{display:flex;justify-content:center;padding:6px 10px 10px;gap:6px;}
  .page-card .rot-btn button{width:30px;height:30px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
  .page-card .rot-btn button:hover{border-color:var(--accent);color:var(--accent);background:var(--bg-surface);}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #globalRotateRow{display:none;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
  #globalRotateRow.on{display:flex;}
  .g-rot-btn{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .g-rot-btn:hover{border-color:var(--accent);color:var(--accent);}
  .g-rot-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;font-family:'DM Sans',sans-serif;}
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

document.title = t.rotatepdf_page_title || (seoData ? seoData.page_title : 'Rotate PDF Pages Free Online \u2014 90\u00B0, 180\u00B0, 270\u00B0 | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.rotatepdf_meta_desc || 'Rotate PDF pages by 90, 180, or 270 degrees free. Rotate individual pages or all at once. Browser-only, no upload required.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="globalRotateRow">
      <span class="g-rot-label">${rotateAllLbl}:</span>
      <button class="g-rot-btn" id="gRotCW">\u21BB ${cwLbl}</button>
      <button class="g-rot-btn" id="gRotCCW">\u21BA ${ccwLbl}</button>
      <button class="g-rot-btn" id="gRot180">\u21C5 ${r180Lbl}</button>
      <button class="g-rot-btn" id="gRotReset">\u21A9 ${resetLbl}</button>
    </div>
    <div id="pageGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="applyBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${rotateLbl}</button>
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
const removeBtn    = document.getElementById('removeBtn')
const globalRow    = document.getElementById('globalRotateRow')
const applyBtn     = document.getElementById('applyBtn')
const statusText   = document.getElementById('statusText')

let pdfBytes = null
let pdfFileName = ''
let pageEntries = [] // [{ pageNum, rotation, card, canvas, rotInfo }]

// ── Lazy-load pdf.js ────────────────────────────────────────────────────────
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// ── Next steps ──────────────────────────────────────────────────────────────
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['merge-pdf'] || 'Merge PDF', href: localHref('merge-pdf') },
    { label: ns['split-pdf'] || 'Split PDF', href: localHref('split-pdf') },
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
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

// ── State helpers ───────────────────────────────────────────────────────────
function resetState() {
  pdfBytes = null
  pdfFileName = ''
  pageEntries = []
  pageGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  globalRow.classList.remove('on')
  statusText.textContent = ''
  applyBtn.disabled = true
  applyBtn.style.opacity = '0.7'
  applyBtn.style.cursor = 'not-allowed'
  applyBtn.style.background = 'var(--btn-disabled)'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

function rotationLabel(deg) {
  if (deg === 0) return '\u2014'
  return deg + '\u00B0'
}

function updateVisual(entry) {
  entry.canvas.style.transform = `rotate(${entry.rotation}deg)`
  entry.rotInfo.textContent = entry.rotation === 0
    ? (t.rotatepdf_no_rotation || 'No rotation')
    : (t.rotatepdf_rotated || 'Rotated') + ' ' + rotationLabel(entry.rotation)
}

function rotateEntry(entry, delta) {
  entry.rotation = (entry.rotation + delta + 360) % 360
  updateVisual(entry)
}

function rotateAll(delta) {
  pageEntries.forEach(e => rotateEntry(e, delta))
}

function resetAll() {
  pageEntries.forEach(e => { e.rotation = 0; updateVisual(e) })
}

// ── Global rotate buttons ───────────────────────────────────────────────────
document.getElementById('gRotCW').addEventListener('click', () => rotateAll(90))
document.getElementById('gRotCCW').addEventListener('click', () => rotateAll(-90))
document.getElementById('gRot180').addEventListener('click', () => rotateAll(180))
document.getElementById('gRotReset').addEventListener('click', resetAll)

// ── Load PDF ────────────────────────────────────────────────────────────────
async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select a PDF file.'
    return
  }
  resetState()
  statusText.textContent = loadingLbl
  try {
    const pdfjs = await loadPdfJs()
    const buf = await file.arrayBuffer()
    pdfBytes = new Uint8Array(buf.slice(0))
    pdfFileName = file.name.replace(/\.[^.]+$/, '')

    const pdfDoc = await pdfjs.getDocument({ data: buf }).promise
    fileMetaText.textContent = `${file.name} \u2014 ${pdfDoc.numPages} ${pagesLabel}`
    fileMeta.classList.add('on')
    globalRow.classList.add('on')

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 0.5 })

      const card = document.createElement('div')
      card.className = 'page-card'

      const thumbWrap = document.createElement('div')
      thumbWrap.className = 'thumb-wrap'

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
      thumbWrap.appendChild(canvas)

      const pname = document.createElement('div')
      pname.className = 'pname'
      pname.textContent = `${pageLabel} ${i}`

      const rotInfo = document.createElement('div')
      rotInfo.className = 'rot-info'
      rotInfo.textContent = t.rotatepdf_no_rotation || 'No rotation'

      const btnRow = document.createElement('div')
      btnRow.className = 'rot-btn'

      const btnCW = document.createElement('button')
      btnCW.title = cwLbl
      btnCW.innerHTML = '\u21BB'
      const btnCCW = document.createElement('button')
      btnCCW.title = ccwLbl
      btnCCW.innerHTML = '\u21BA'
      const btn180 = document.createElement('button')
      btn180.title = r180Lbl
      btn180.innerHTML = '\u21C5'
      btnRow.append(btnCCW, btnCW, btn180)

      card.append(thumbWrap, pname, rotInfo, btnRow)
      pageGrid.appendChild(card)

      const entry = { pageNum: i, rotation: 0, card, canvas, rotInfo }
      pageEntries.push(entry)

      btnCW.addEventListener('click', () => rotateEntry(entry, 90))
      btnCCW.addEventListener('click', () => rotateEntry(entry, -90))
      btn180.addEventListener('click', () => rotateEntry(entry, 180))
    }

    applyBtn.disabled = false
    applyBtn.style.opacity = '1'
    applyBtn.style.cursor = 'pointer'
    applyBtn.style.background = 'var(--accent)'
    statusText.textContent = ''
  } catch (err) {
    console.error('[rotate-pdf] load failed:', err)
    statusText.textContent = (t.rotatepdf_load_error || 'Could not load PDF: ') + (err?.message || err)
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

// ── Apply rotations with pdf-lib ────────────────────────────────────────────
applyBtn.addEventListener('click', async () => {
  if (!pdfBytes || !pageEntries.length) return
  const hasRotation = pageEntries.some(e => e.rotation !== 0)
  if (!hasRotation) {
    statusText.textContent = t.rotatepdf_no_changes || 'No rotations applied. Rotate at least one page first.'
    return
  }

  applyBtn.disabled = true
  applyBtn.style.opacity = '0.7'
  applyBtn.style.cursor = 'not-allowed'
  statusText.textContent = applyingLbl

  try {
    const { PDFDocument, degrees } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()

    for (const entry of pageEntries) {
      if (entry.rotation !== 0) {
        const page = pages[entry.pageNum - 1]
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + entry.rotation))
      }
    }

    const rotatedBytes = await pdfDoc.save()
    const blob = new Blob([rotatedBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pdfFileName || 'rotated'}-rotated.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)

    const rotatedCount = pageEntries.filter(e => e.rotation !== 0).length
    statusText.textContent = (t.rotatepdf_done || 'Done!') + ` ${rotatedCount} ${rotatedCount === 1 ? (t.rotatepdf_page_rotated || 'page rotated') : (t.rotatepdf_pages_rotated || 'pages rotated')}.`

    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(applyBtn.parentElement, blob, `${pdfFileName || 'rotated'}-rotated.pdf`, 'rotate-pdf')
  } catch (err) {
    console.error('[rotate-pdf] apply failed:', err)
    statusText.textContent = (t.rotatepdf_error || 'Failed to rotate PDF: ') + (err?.message || err)
  }

  applyBtn.disabled = false
  applyBtn.style.opacity = '1'
  applyBtn.style.cursor = 'pointer'
})

// ── SEO section ─────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo['rotate-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
