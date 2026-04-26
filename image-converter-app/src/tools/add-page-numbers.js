import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

injectHreflang('add-page-numbers')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['add-page-numbers']) || 'Add Page Numbers'
const seoData   = t.seo && t.seo['add-page-numbers']
const descText  = t.addpgnum_desc || t.card_add_page_numbers_desc || 'Add page numbers to your PDF. Choose position, font size, and starting number.'
const selectLbl = t.addpgnum_select || t.select_image || 'Select PDFs'
const dropHint  = t.addpgnum_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const applyLbl  = t.addpgnum_apply || 'Add Numbers & Download'
const applyAllLbl = t.addpgnum_apply_all || 'Apply to All & Download ZIP'
const applyingLbl = t.addpgnum_applying || 'Adding numbers\u2026'
const loadingLbl  = t.addpgnum_loading || 'Loading PDFs\u2026'
const pagesLabel  = t.addpgnum_pages || t.pdfpng_pages || 'pages'
const clearLbl    = t.addpgnum_clear || 'Clear'
const addMoreLbl  = t.addpgnum_add_more || '+ Add more'

/* position labels */
const posLabels = {
  'bl': t.addpgnum_pos_bl || 'Bottom Left',
  'bc': t.addpgnum_pos_bc || 'Bottom Center',
  'br': t.addpgnum_pos_br || 'Bottom Right',
  'tl': t.addpgnum_pos_tl || 'Top Left',
  'tc': t.addpgnum_pos_tc || 'Top Center',
  'tr': t.addpgnum_pos_tr || 'Top Right',
}

/* format labels */
const fmtLabels = {
  'n':            t.addpgnum_fmt_n || '1',
  'page-n':       t.addpgnum_fmt_pn || 'Page 1',
  'n-of-N':       t.addpgnum_fmt_non || '1 of N',
  'page-n-of-N':  t.addpgnum_fmt_pnon || 'Page 1 of N',
}

const MAX_FILES = LIMITS.MAX_FILES || 25
const MAX_FILE_SIZE = 50 * 1024 * 1024

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:48px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .drop-zone.over{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .file-tabs{display:flex;gap:0;margin-bottom:0;overflow-x:auto;border-bottom:1.5px solid var(--border);}
  .file-tab{padding:10px 18px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;color:var(--text-secondary);background:transparent;border:none;border-bottom:2.5px solid transparent;cursor:pointer;white-space:nowrap;transition:all 0.15s;}
  .file-tab:hover{color:var(--text-primary);}
  .file-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
  .file-tab-add{padding:10px 14px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;color:var(--accent);background:transparent;border:none;border-bottom:2.5px solid transparent;cursor:pointer;white-space:nowrap;transition:all 0.15s;}
  .file-tab-add:hover{color:var(--accent-hover);}
  .file-info{display:flex;align-items:center;justify-content:space-between;padding:12px 0;margin-bottom:12px;font-family:'DM Sans',sans-serif;}
  .file-info-left{font-size:13px;color:var(--text-primary);font-weight:600;}
  .file-info-left span{color:var(--text-muted);font-weight:400;margin-left:6px;}
  .file-info-clear{background:transparent;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}
  .file-info-clear:hover{opacity:0.7;}
  .opt-card{background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);padding:20px;margin-bottom:16px;font-family:'DM Sans',sans-serif;}
  .opt-card h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 14px;}
  .opt-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;}
  .opt-row:last-child{margin-bottom:0;}
  .opt-label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;min-width:100px;}
  .opt-select,.opt-number{padding:8px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:var(--bg-card);color:var(--text-primary);outline:none;}
  .opt-select:focus,.opt-number:focus{border-color:var(--accent);}
  .opt-number{width:80px;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;}
  .action-btn:hover{background:var(--accent-hover);transform:translateY(-1px);}
  .action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;transform:none;}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
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
_metaDesc.content = t.addpgnum_meta_desc || 'Add page numbers to PDF documents free. Choose position, font size, format, and starting number.'
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
      <label for="fileInput" class="drop-zone" id="dropZone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop PDFs here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileTabs" class="file-tabs" style="display:none;"></div>
    <div id="fileInfoRow" class="file-info" style="display:none;">
      <div class="file-info-left"><span id="fileInfoName"></span><span id="fileInfoMeta"></span></div>
      <button class="file-info-clear" id="clearBtn">${clearLbl}</button>
    </div>
    <div id="optionsPanel" style="display:none;">
      <div class="opt-card">
        <h3>${t.addpgnum_options_title || 'Page Number Options'}</h3>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_position || 'Position'}</span>
          <select class="opt-select" id="positionSelect">
            ${Object.entries(posLabels).map(([k, v]) => `<option value="${k}"${k === 'bc' ? ' selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_font_size || 'Font Size'}</span>
          <input type="number" class="opt-number" id="fontSizeInput" value="12" min="8" max="36" step="1" />
          <span style="font-size:11px;color:var(--text-muted);">pt (8\u201336)</span>
        </div>
        <div class="opt-row">
          <span class="opt-label">${t.addpgnum_start_num || 'Starting Number'}</span>
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
    <div id="actionRow" style="display:none;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
      <button class="action-btn" id="applyBtn">${applyLbl}</button>
      <button class="action-btn dark" id="applyAllBtn" style="display:none;">${applyAllLbl}</button>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

/* -- DOM refs ---------------------------------------------------------------- */
const fileInput      = document.getElementById('fileInput')
const dropZone       = document.getElementById('dropZone')
const uploadArea     = document.getElementById('uploadArea')
const fileTabs       = document.getElementById('fileTabs')
const fileInfoRow    = document.getElementById('fileInfoRow')
const fileInfoName   = document.getElementById('fileInfoName')
const fileInfoMeta   = document.getElementById('fileInfoMeta')
const clearBtn       = document.getElementById('clearBtn')
const optionsPanel   = document.getElementById('optionsPanel')
const positionSelect = document.getElementById('positionSelect')
const fontSizeInput  = document.getElementById('fontSizeInput')
const startNumInput  = document.getElementById('startNumInput')
const formatSelect   = document.getElementById('formatSelect')
const actionRow      = document.getElementById('actionRow')
const applyBtn       = document.getElementById('applyBtn')
const applyAllBtn    = document.getElementById('applyAllBtn')
const statusText     = document.getElementById('statusText')

/* -- State ------------------------------------------------------------------- */
let files = []          // { name, bytes, pageCount, opts: {position, fontSize, startNum, format} }
let activeFileIndex = 0

/* Save current form values into the active file's opts */
function saveActiveOpts() {
  if (!files.length) return
  const f = files[activeFileIndex]
  if (!f) return
  f.opts = {
    position: positionSelect.value,
    fontSize: parseInt(fontSizeInput.value) || 12,
    startNum: parseInt(startNumInput.value) || 1,
    format: formatSelect.value,
  }
}

/* Load the active file's opts into the form */
function loadActiveOpts() {
  if (!files.length) return
  const f = files[activeFileIndex]
  if (!f || !f.opts) return
  positionSelect.value = f.opts.position
  fontSizeInput.value = f.opts.fontSize
  startNumInput.value = f.opts.startNum
  formatSelect.value = f.opts.format
}

/* -- UI update --------------------------------------------------------------- */
function updateUI() {
  const count = files.length

  if (count === 0) {
    uploadArea.style.display = ''
    dropZone.style.display = 'flex'
    fileTabs.style.display = 'none'
    fileInfoRow.style.display = 'none'
    optionsPanel.style.display = 'none'
    actionRow.style.display = 'none'
    statusText.textContent = ''
    document.getElementById('nextSteps').style.display = 'none'
    return
  }

  /* Hide drop zone after files loaded */
  dropZone.style.display = 'none'

  /* File tabs: show only when multiple files */
  if (count > 1) {
    fileTabs.style.display = 'flex'
    renderTabs()
  } else {
    fileTabs.style.display = 'none'
  }

  /* File info for active file */
  if (activeFileIndex >= count) activeFileIndex = count - 1
  const active = files[activeFileIndex]
  fileInfoRow.style.display = 'flex'
  fileInfoName.textContent = active.name
  fileInfoMeta.textContent = ` \u2014 ${active.pageCount} ${pagesLabel}`

  /* Options & action */
  optionsPanel.style.display = 'block'
  actionRow.style.display = 'flex'

  /* Show/hide buttons based on file count */
  applyBtn.textContent = applyLbl
  applyAllBtn.style.display = count > 1 ? '' : 'none'
}

function renderTabs() {
  fileTabs.innerHTML = ''
  files.forEach((f, i) => {
    const btn = document.createElement('button')
    btn.className = 'file-tab' + (i === activeFileIndex ? ' active' : '')
    btn.textContent = f.name.length > 22 ? f.name.slice(0, 20) + '\u2026' : f.name
    btn.title = f.name
    btn.addEventListener('click', () => {
      saveActiveOpts()
      activeFileIndex = i
      updateUI()
      loadActiveOpts()
    })
    fileTabs.appendChild(btn)
  })
  /* Add more tab */
  if (files.length < MAX_FILES) {
    const addBtn = document.createElement('button')
    addBtn.className = 'file-tab-add'
    addBtn.textContent = addMoreLbl
    addBtn.addEventListener('click', () => fileInput.click())
    fileTabs.appendChild(addBtn)
  }
}

/* -- Clear ------------------------------------------------------------------- */
function clearAll() {
  files = []
  activeFileIndex = 0
  fileInput.value = ''
  updateUI()
}

clearBtn.addEventListener('click', clearAll)

/* -- Load PDF files ---------------------------------------------------------- */
async function loadPdfFiles(rawFiles) {
  const toLoad = Array.from(rawFiles).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
  if (!toLoad.length) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files.'
    return
  }

  /* Clear previous results */
  document.getElementById('nextSteps').style.display = 'none'

  const remaining = MAX_FILES - files.length
  if (remaining <= 0) {
    statusText.textContent = (t.addpgnum_max_files || 'Maximum') + ` ${MAX_FILES} files.`
    return
  }
  const batch = toLoad.slice(0, remaining)
  if (batch.length < toLoad.length) {
    statusText.textContent = (t.addpgnum_max_files || 'Maximum') + ` ${MAX_FILES} files. ${toLoad.length - batch.length} skipped.`
  } else {
    statusText.textContent = loadingLbl
  }

  for (const file of batch) {
    if (file.size > MAX_FILE_SIZE) {
      statusText.textContent = `${file.name}: ` + (t.addpgnum_too_large || 'File too large. Maximum size is 50 MB.')
      continue
    }
    try {
      const buf = await file.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      files.push({
        name: file.name,
        bytes: new Uint8Array(buf.slice(0)),
        pageCount: doc.getPageCount(),
        opts: { position: 'bc', fontSize: 12, startNum: 1, format: 'num' },
      })
    } catch (err) {
      console.error('[add-page-numbers] load failed:', file.name, err)
      statusText.textContent = `${file.name}: ` + (t.addpgnum_load_error || 'Could not load PDF: ') + (err?.message || err)
    }
  }

  if (files.length) {
    activeFileIndex = files.length === 1 ? 0 : activeFileIndex
    statusText.textContent = ''
  }
  updateUI()
}

/* -- File input & drag-drop -------------------------------------------------- */
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFiles(fileInput.files)
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) loadPdfFiles(e.dataTransfer.files)
})
dropZone.addEventListener('dragenter', () => dropZone.classList.add('over'))
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'))

/* -- Format number text ------------------------------------------------------ */
function formatPageNumber(pageNum, totalPages, fmt) {
  const pageLbl = t.addpgnum_page_word || 'Page'
  const ofLbl   = t.addpgnum_of_word || 'of'
  switch (fmt) {
    case 'page-n':       return `${pageLbl} ${pageNum}`
    case 'n-of-N':       return `${pageNum} ${ofLbl} ${totalPages}`
    case 'page-n-of-N':  return `${pageLbl} ${pageNum} ${ofLbl} ${totalPages}`
    default:             return `${pageNum}`
  }
}

/* -- Calculate position ------------------------------------------------------ */
function calcPosition(pos, pageWidth, pageHeight, textWidth, fontSize) {
  const margin = 40
  let x, y

  switch (pos) {
    case 'bl':
      x = margin
      y = margin
      break
    case 'bc':
      x = pageWidth / 2 - textWidth / 2
      y = margin
      break
    case 'br':
      x = pageWidth - margin - textWidth
      y = margin
      break
    case 'tl':
      x = margin
      y = pageHeight - margin
      break
    case 'tc':
      x = pageWidth / 2 - textWidth / 2
      y = pageHeight - margin
      break
    case 'tr':
      x = pageWidth - margin - textWidth
      y = pageHeight - margin
      break
    default:
      x = pageWidth / 2 - textWidth / 2
      y = margin
  }
  return { x, y }
}

/* -- Process a single PDF ---------------------------------------------------- */
async function processOnePdf(entry, opts) {
  const doc = await PDFDocument.load(entry.bytes)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const totalPages = doc.getPageCount()

  for (let i = 0; i < totalPages; i++) {
    const page = doc.getPage(i)
    const { width, height } = page.getSize()
    const pageNum = opts.startNum + i
    const text = formatPageNumber(pageNum, opts.startNum + totalPages - 1, opts.fmt)
    const textWidth = font.widthOfTextAtSize(text, opts.fontSize)
    const { x, y } = calcPosition(opts.pos, width, height, textWidth, opts.fontSize)

    page.drawText(text, {
      x, y,
      size: opts.fontSize,
      font,
      color: rgb(0, 0, 0),
    })
  }

  const numberedBytes = await doc.save()
  const blob = new Blob([numberedBytes], { type: 'application/pdf' })
  const baseName = entry.name.replace(/\.[^.]+$/, '')
  const filename = `${baseName}-numbered.pdf`
  return { name: entry.name, blob, filename, totalPages }
}

/* -- Get current options ----------------------------------------------------- */
function getOpts() {
  return {
    pos: positionSelect.value,
    fontSize: Math.max(8, Math.min(36, parseInt(fontSizeInput.value) || 12)),
    startNum: parseInt(startNumInput.value) || 1,
    fmt: formatSelect.value,
  }
}
function getOptsForFile(f) {
  return {
    pos: f.opts.position,
    fontSize: Math.max(8, Math.min(36, f.opts.fontSize)),
    startNum: f.opts.startNum,
    fmt: f.opts.format,
  }
}

/* -- Trigger download -------------------------------------------------------- */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/* -- Apply to current file --------------------------------------------------- */
applyBtn.addEventListener('click', async () => {
  if (!files.length) return
  applyBtn.disabled = true
  applyBtn.textContent = applyingLbl
  statusText.textContent = applyingLbl
  document.getElementById('nextSteps').style.display = 'none'

  saveActiveOpts()
  const opts = getOptsForFile(files[activeFileIndex])

  try {
    const result = await processOnePdf(files[activeFileIndex], opts)
    triggerDownload(result.blob, result.filename)
    lastResults = [{ blob: result.blob, name: result.filename, type: 'application/pdf' }]
    statusText.textContent = t.addpgnum_done_single || `Done! ${result.totalPages} ${result.totalPages === 1 ? 'page' : 'pages'} numbered.`
    if (window.showReviewPrompt) window.showReviewPrompt()
    window.rcShowSaveButton?.(actionRow, result.blob, result.filename, 'add-page-numbers')
    buildNextSteps()
  } catch (err) {
    console.error('[add-page-numbers] failed:', err)
    statusText.textContent = (t.addpgnum_error || 'Error: ') + (err?.message || err)
  }

  applyBtn.disabled = false
  applyBtn.textContent = applyLbl
})

/* -- Apply to all files & ZIP ------------------------------------------------ */
applyAllBtn.addEventListener('click', async () => {
  if (files.length < 2) return
  applyAllBtn.disabled = true
  applyBtn.disabled = true
  applyAllBtn.textContent = applyingLbl
  statusText.textContent = ''
  document.getElementById('nextSteps').style.display = 'none'

  saveActiveOpts()

  try {
    const results = []
    for (let i = 0; i < files.length; i++) {
      statusText.textContent = `${applyingLbl} (${i + 1}/${files.length})`
      const opts = getOptsForFile(files[i])
      const result = await processOnePdf(files[i], opts)
      results.push(result)
    }

    statusText.textContent = t.addpgnum_zipping || 'Creating ZIP\u2026'
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
    const zip = new JSZip()
    for (const r of results) {
      zip.file(r.filename, r.blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(zipBlob, 'numbered-pdfs.zip')

    const totalPgs = results.reduce((s, r) => s + r.totalPages, 0)
    statusText.textContent = t.addpgnum_done || `Done! ${totalPgs} ${totalPgs === 1 ? 'page' : 'pages'} numbered across ${results.length} files.`
    if (window.showReviewPrompt) window.showReviewPrompt()
    buildNextSteps()
  } catch (err) {
    console.error('[add-page-numbers] failed:', err)
    statusText.textContent = (t.addpgnum_error || 'Error: ') + (err?.message || err)
  }

  applyAllBtn.disabled = false
  applyBtn.disabled = false
  applyAllBtn.textContent = applyAllLbl
})

/* -- Next steps -------------------------------------------------------------- */

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
    loadPdfFiles(files)
  } catch (e) { console.warn('[add-page-numbers] IDB autoload failed:', e) }
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
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