import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('add-page-numbers')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['add-page-numbers']) || 'Add Page Numbers'
const seoData   = t.seo && t.seo['add-page-numbers']
const descText  = t.addpgnum_desc || (seoData ? seoData.h2a : 'Add page numbers to any PDF. Choose position, font size, format, and starting number.')
const selectLbl = t.addpgnum_select || t.select_image || 'Select PDF'
const dropHint  = t.addpgnum_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const dlBtn     = t.download || 'Download'
const applyLbl  = t.addpgnum_apply || 'Add Page Numbers'
const applyingLbl = t.addpgnum_applying || 'Adding numbers\u2026'
const loadingLbl  = t.addpgnum_loading || 'Loading PDF\u2026'
const pagesLabel  = t.addpgnum_pages || t.pdfpng_pages || 'pages'
const removeLbl   = t.remove || 'Remove'

/* position labels */
const posLabels = {
  'bottom-center': t.addpgnum_pos_bc || 'Bottom Center',
  'bottom-left':   t.addpgnum_pos_bl || 'Bottom Left',
  'bottom-right':  t.addpgnum_pos_br || 'Bottom Right',
  'top-center':    t.addpgnum_pos_tc || 'Top Center',
  'top-left':      t.addpgnum_pos_tl || 'Top Left',
  'top-right':     t.addpgnum_pos_tr || 'Top Right',
}

/* format labels */
const fmtLabels = {
  'n':          t.addpgnum_fmt_n || '1',
  'page-n':     t.addpgnum_fmt_pn || 'Page 1',
  'n-of-N':     t.addpgnum_fmt_non || '1 of N',
  'page-n-of-N': t.addpgnum_fmt_pnon || 'Page 1 of N',
}

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .opt-card{background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);padding:20px;margin-bottom:16px;font-family:'DM Sans',sans-serif;}
  .opt-card h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 14px;}
  .opt-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;}
  .opt-label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;min-width:100px;}
  .opt-select,.opt-number{padding:8px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:var(--bg-card);color:var(--text-primary);outline:none;}
  .opt-select:focus,.opt-number:focus{border-color:var(--accent);}
  .opt-number{width:80px;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;}
  .action-btn:hover{background:var(--accent-hover);transform:translateY(-1px);}
  .action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;transform:none;}
  .action-btn.dark{background:var(--btn-dark);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:14px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:48px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .drop-zone.over{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
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

document.title = t.addpgnum_page_title || 'Add Page Numbers to PDF Free \u2014 Number PDF Pages Online | RelahConvert'
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.addpgnum_meta_desc || 'Add page numbers to PDF documents free. Choose position, font size, format, and starting number. Browser-only, no upload required.'
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
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${removeLbl}</button></div>
    <div id="optionsPanel" style="display:none;">
      <div class="opt-card">
        <h3>${t.addpgnum_options_title || 'Page Number Options'}</h3>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_position || 'Position'}</span>
          <select class="opt-select" id="positionSelect">
            ${Object.entries(posLabels).map(([k, v]) => `<option value="${k}"${k === 'bottom-center' ? ' selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_font_size || 'Font Size'}</span>
          <input type="number" class="opt-number" id="fontSizeInput" value="12" min="8" max="36" step="1" />
          <span style="font-size:11px;color:var(--text-muted);">pt (8\u201336)</span>
        </div>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_start_num || 'Start Number'}</span>
          <input type="number" class="opt-number" id="startNumInput" value="1" min="0" max="9999" step="1" />
        </div>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_format || 'Format'}</span>
          <select class="opt-select" id="formatSelect">
            ${Object.entries(fmtLabels).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow" style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <button class="action-btn" id="applyBtn" disabled>${applyLbl}</button>
      <a class="action-btn dark" id="downloadBtn" style="display:none;text-align:center;text-decoration:none;">\u2B07 ${dlBtn}</a>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

/* ── DOM refs ─────────────────────────────────────────────────────────────── */
const fileInput      = document.getElementById('fileInput')
const dropZone       = document.getElementById('dropZone')
const fileMeta       = document.getElementById('fileMeta')
const fileMetaText   = document.getElementById('fileMetaText')
const removeBtn      = document.getElementById('removeBtn')
const optionsPanel   = document.getElementById('optionsPanel')
const positionSelect = document.getElementById('positionSelect')
const fontSizeInput  = document.getElementById('fontSizeInput')
const startNumInput  = document.getElementById('startNumInput')
const formatSelect   = document.getElementById('formatSelect')
const applyBtn       = document.getElementById('applyBtn')
const downloadBtn    = document.getElementById('downloadBtn')
const statusText     = document.getElementById('statusText')

/* ── State ────────────────────────────────────────────────────────────────── */
let pdfBytes = null
let pdfFileName = ''
let pdfPageCount = 0

/* ── Reset ────────────────────────────────────────────────────────────────── */
function resetState() {
  pdfBytes = null
  pdfFileName = ''
  pdfPageCount = 0
  fileMeta.classList.remove('on')
  optionsPanel.style.display = 'none'
  dropZone.style.display = 'flex'
  downloadBtn.style.display = 'none'
  statusText.textContent = ''
  applyBtn.disabled = true
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

/* ── Load PDF ─────────────────────────────────────────────────────────────── */
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
    const { PDFDocument } = await import('pdf-lib')
    const buf = await file.arrayBuffer()
    const doc = await PDFDocument.load(buf)
    pdfBytes = new Uint8Array(buf.slice(0))
    pdfPageCount = doc.getPageCount()
    pdfFileName = file.name.replace(/\.[^.]+$/, '')

    fileMetaText.textContent = `${file.name} \u2014 ${pdfPageCount} ${pagesLabel}`
    fileMeta.classList.add('on')
    optionsPanel.style.display = 'block'
    dropZone.style.display = 'none'
    downloadBtn.style.display = 'none'

    applyBtn.disabled = false
    statusText.textContent = ''
  } catch (err) {
    console.error('[add-page-numbers] load failed:', err)
    statusText.textContent = (t.addpgnum_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

/* ── File input & drag-drop ───────────────────────────────────────────────── */
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFile(fileInput.files[0])
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) loadPdfFile(e.dataTransfer.files[0])
})
dropZone.addEventListener('dragenter', () => dropZone.classList.add('over'))
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'))

/* ── Format number text ───────────────────────────────────────────────────── */
function formatPageNumber(pageNum, totalPages, fmt) {
  const pageLbl = t.addpgnum_page_word || 'Page'
  const ofLbl   = t.addpgnum_of_word || 'of'
  switch (fmt) {
    case 'page-n':      return `${pageLbl} ${pageNum}`
    case 'n-of-N':      return `${pageNum} ${ofLbl} ${totalPages}`
    case 'page-n-of-N': return `${pageLbl} ${pageNum} ${ofLbl} ${totalPages}`
    default:            return `${pageNum}`
  }
}

/* ── Calculate position ───────────────────────────────────────────────────── */
function calcPosition(pos, pageWidth, pageHeight, textWidth, fontSize) {
  const margin = 40
  let x, y

  switch (pos) {
    case 'bottom-left':
      x = margin
      y = margin
      break
    case 'bottom-center':
      x = (pageWidth - textWidth) / 2
      y = margin
      break
    case 'bottom-right':
      x = pageWidth - textWidth - margin
      y = margin
      break
    case 'top-left':
      x = margin
      y = pageHeight - fontSize - margin
      break
    case 'top-center':
      x = (pageWidth - textWidth) / 2
      y = pageHeight - fontSize - margin
      break
    case 'top-right':
      x = pageWidth - textWidth - margin
      y = pageHeight - fontSize - margin
      break
    default:
      x = (pageWidth - textWidth) / 2
      y = margin
  }
  return { x, y }
}

/* ── Apply page numbers ───────────────────────────────────────────────────── */
applyBtn.addEventListener('click', async () => {
  if (!pdfBytes) return
  applyBtn.disabled = true
  applyBtn.textContent = applyingLbl
  downloadBtn.style.display = 'none'
  statusText.textContent = ''
  document.getElementById('nextSteps').style.display = 'none'

  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

    const doc = await PDFDocument.load(pdfBytes)
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const totalPages = doc.getPageCount()

    const pos      = positionSelect.value
    const fontSize = Math.max(8, Math.min(36, parseInt(fontSizeInput.value) || 12))
    const startNum = parseInt(startNumInput.value) || 1
    const fmt      = formatSelect.value

    for (let i = 0; i < totalPages; i++) {
      const page   = doc.getPage(i)
      const { width, height } = page.getSize()
      const pageNum = startNum + i
      const text    = formatPageNumber(pageNum, startNum + totalPages - 1, fmt)
      const textWidth = font.widthOfTextAtSize(text, fontSize)

      const { x, y } = calcPosition(pos, width, height, textWidth, fontSize)

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })

      statusText.textContent = `${applyingLbl} (${i + 1}/${totalPages})`
    }

    const numberedBytes = await doc.save()
    const blob = new Blob([numberedBytes], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const filename = `${pdfFileName || 'document'}-numbered.pdf`

    downloadBtn.href     = url
    downloadBtn.download = filename
    downloadBtn.style.display = 'block'
    downloadBtn.onclick = () => {
      if (window.showReviewPrompt) window.showReviewPrompt()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    }

    window.rcShowSaveButton?.(applyBtn.parentElement, blob, filename, 'add-page-numbers')

    statusText.textContent = t.addpgnum_done || `Done! ${totalPages} ${totalPages === 1 ? 'page' : 'pages'} numbered.`
    buildNextSteps()
  } catch (err) {
    console.error('[add-page-numbers] failed:', err)
    statusText.textContent = (t.addpgnum_error || 'Error: ') + (err?.message || err)
  }

  applyBtn.disabled = false
  applyBtn.textContent = applyLbl
})

/* ── Next steps ───────────────────────────────────────────────────────────── */
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['merge-pdf']    || 'Merge PDF',    href: localHref('merge-pdf') },
    { label: ns['split-pdf']    || 'Split PDF',    href: localHref('split-pdf') },
    { label: ns['compress-pdf'] || 'Compress PDF',  href: localHref('compress-pdf') },
    { label: ns['rotate-pdf']   || 'Rotate PDF',   href: localHref('rotate-pdf') },
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

/* ── SEO section ──────────────────────────────────────────────────────────── */
;(function injectSEO() {
  const seo = t.seo && t.seo['add-page-numbers']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
