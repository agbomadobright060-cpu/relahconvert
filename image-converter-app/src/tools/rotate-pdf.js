import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument, degrees } from 'pdf-lib'

injectHreflang('rotate-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['rotate-pdf']) || 'Rotate PDF'
const seoData   = t.seo && t.seo['rotate-pdf']
const descText  = t.rotatepdf_desc || t.card_rotate_pdf_desc || 'Rotate PDF pages by 90, 180, or 270 degrees.'
const selectLbl = t.rotatepdf_select || t.select_image || 'Select PDFs'
const dropHint  = t.rotatepdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const applyLbl  = t.rotatepdf_apply_btn || 'Apply & Download'
const applyAllLbl = t.rotatepdf_apply_all || 'Apply All & Download ZIP'
const applyingLbl = t.rotatepdf_applying || 'Applying rotations\u2026'
const pagesLabel = t.rotatepdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl = t.rotatepdf_loading || 'Loading PDFs\u2026'
const cwLbl     = t.rotatepdf_cw || '90\u00B0 CW'
const ccwLbl    = t.rotatepdf_ccw || '90\u00B0 CCW'
const r180Lbl   = t.rotatepdf_180 || '180\u00B0'
const resetLbl  = t.rotatepdf_reset || 'Reset'
const pageLabel = t.rotatepdf_page || t.pdfpng_page || 'Page'
const addMoreLbl = t.rotatepdf_add_more || '+ Add More'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

/* ── Lazy-load PDF.js ─────────────────────────────────────────────────────── */
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}

  /* File tabs */
  .file-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px;align-items:center;}
  .file-tab{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;position:relative;}
  .file-tab:hover{border-color:var(--accent);color:var(--accent);}
  .file-tab.active{border-color:var(--accent);background:var(--accent);color:var(--text-on-accent);}
  .file-tab .tab-close{margin-left:6px;font-size:14px;opacity:0.7;font-weight:400;}
  .file-tab .tab-close:hover{opacity:1;}
  .file-tab-add{padding:8px 14px;border:1.5px dashed var(--border-light);border-radius:8px;background:transparent;color:var(--text-muted);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .file-tab-add:hover{border-color:var(--accent);color:var(--accent);}

  /* File header row */
  .file-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;flex-wrap:wrap;}
  .file-header .fname{font-size:13px;color:var(--text-primary);font-family:'DM Sans',sans-serif;font-weight:600;}
  .file-header .fmeta{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;}
  .file-header .clear-btn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;}

  /* Rotate all bar */
  .rotate-all-bar{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
  .rotate-all-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;font-family:'DM Sans',sans-serif;}
  .ra-btn{padding:6px 14px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .ra-btn:hover{border-color:var(--accent);color:var(--accent);}

  /* Page grid */
  #pageGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:14px;margin-bottom:16px;}
  .page-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;transition:border-color 0.15s,box-shadow 0.15s;}
  .page-card:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(0,0,0,0.06);}
  .page-card .canvas-wrap{width:100%;height:160px;display:flex;align-items:center;justify-content:center;background:var(--bg-surface);overflow:hidden;position:relative;}
  .page-card canvas{max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.3s ease;}
  .page-card .plabel{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 4px;text-align:center;font-weight:600;}
  .page-card .rot-label{font-size:10px;color:var(--accent);font-family:'DM Sans',sans-serif;text-align:center;padding:0 8px 2px;font-weight:600;min-height:14px;}
  .page-card .page-btns{display:flex;justify-content:center;gap:4px;padding:4px 8px 8px;}
  .page-card .page-btns button{width:32px;height:28px;border:1.5px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text-primary);font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
  .page-card .page-btns button:hover{border-color:var(--accent);color:var(--accent);background:var(--bg-surface);}

  /* Action row */
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);}
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

document.title = t.rotatepdf_page_title || (seoData ? seoData.page_title : 'Rotate PDF Pages Free Online \u2014 90\u00B0, 180\u00B0, 270\u00B0 | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.rotatepdf_meta_desc || 'Rotate individual PDF pages by 90, 180, or 270 degrees. Preview pages, rotate selectively, and download.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div id="toolWrap" style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;transition:max-width 0.3s;">
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
    <input type="file" id="addMoreInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileTabs" class="file-tabs" style="display:none;"></div>
    <div id="fileHeader" class="file-header" style="display:none;"></div>
    <div id="rotateAllBar" class="rotate-all-bar" style="display:none;">
      <span class="rotate-all-label">${t.rotatepdf_rotate_all || 'Rotate All'}:</span>
      <button class="ra-btn" data-action="cw">\u21BB ${cwLbl}</button>
      <button class="ra-btn" data-action="ccw">\u21BA ${ccwLbl}</button>
      <button class="ra-btn" data-action="180">\u21C5 ${r180Lbl}</button>
      <button class="ra-btn" data-action="reset">\u21A9 ${resetLbl}</button>
    </div>
    <div id="pageGrid"></div>
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

/* ── DOM refs ─────────────────────────────────────────────────────────────── */
const toolWrap      = document.getElementById('toolWrap')
const uploadArea    = document.getElementById('uploadArea')
const fileInput     = document.getElementById('fileInput')
const addMoreInput  = document.getElementById('addMoreInput')
const fileTabs      = document.getElementById('fileTabs')
const fileHeader    = document.getElementById('fileHeader')
const rotateAllBar  = document.getElementById('rotateAllBar')
const pageGrid      = document.getElementById('pageGrid')
const statusText    = document.getElementById('statusText')
const actionRow     = document.getElementById('actionRow')
const applyBtn      = document.getElementById('applyBtn')

/* ── State ────────────────────────────────────────────────────────────────── */
let files = [] // { name, bytes (Uint8Array), pageCount, rotations: [0,0,...], canvases: [canvas,...] }
let activeFileIndex = 0

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function isMulti() { return files.length > 1 }

function rotLabel(deg) {
  const n = ((deg % 360) + 360) % 360
  if (n === 0) return ''
  if (n === 90) return cwLbl
  if (n === 180) return r180Lbl
  if (n === 270) return ccwLbl
  return n + '\u00B0'
}

/* ── Layout switch ────────────────────────────────────────────────────────── */
function updateLayout() {
  const multi = isMulti()
  toolWrap.style.maxWidth = multi ? '900px' : '700px'

  // File tabs: only show for multi
  fileTabs.style.display = multi ? 'flex' : 'none'

  // File header: show for single
  fileHeader.style.display = files.length > 0 ? 'flex' : 'none'

  // Upload area: hide when files loaded
  uploadArea.style.display = files.length > 0 ? 'none' : ''

  // Rotate all bar
  rotateAllBar.style.display = files.length > 0 ? 'flex' : 'none'

  // Action row
  actionRow.style.display = files.length > 0 ? 'flex' : 'none'

  // Action buttons
  if (multi) {
    actionRow.innerHTML = `
      <button class="action-btn" id="applyCurrentBtn">${applyLbl}</button>
      <button class="action-btn dark" id="applyAllBtn">${applyAllLbl}</button>
    `
    document.getElementById('applyCurrentBtn').addEventListener('click', () => applyAndDownloadSingle(activeFileIndex))
    document.getElementById('applyAllBtn').addEventListener('click', applyAllAndDownloadZip)
  } else {
    actionRow.innerHTML = `<button class="action-btn" id="applySingleBtn">${applyLbl}</button>`
    document.getElementById('applySingleBtn').addEventListener('click', () => applyAndDownloadSingle(0))
  }
}

/* ── Render file tabs ─────────────────────────────────────────────────────── */
function renderFileTabs() {
  fileTabs.innerHTML = ''
  files.forEach((f, i) => {
    const tab = document.createElement('button')
    tab.className = 'file-tab' + (i === activeFileIndex ? ' active' : '')
    const shortName = f.name.length > 20 ? f.name.slice(0, 17) + '\u2026' : f.name
    tab.innerHTML = `${shortName}<span class="tab-close">\u00D7</span>`
    tab.title = f.name
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close')) {
        removeFile(i)
        return
      }
      activeFileIndex = i
      renderFileTabs()
      renderActiveFile()
    })
    fileTabs.appendChild(tab)
  })
  // Add more button
  const addBtn = document.createElement('button')
  addBtn.className = 'file-tab-add'
  addBtn.textContent = addMoreLbl
  addBtn.addEventListener('click', () => addMoreInput.click())
  fileTabs.appendChild(addBtn)
}

/* ── Render file header ───────────────────────────────────────────────────── */
function renderFileHeader() {
  if (files.length === 0) {
    fileHeader.style.display = 'none'
    return
  }
  fileHeader.style.display = 'flex'
  const f = files[activeFileIndex]
  if (!f) return

  if (isMulti()) {
    fileHeader.innerHTML = `
      <span><span class="fname">${f.name}</span> <span class="fmeta">\u2014 ${f.pageCount} ${pagesLabel}</span></span>
    `
  } else {
    fileHeader.innerHTML = `
      <span><span class="fname">${f.name}</span> <span class="fmeta">\u2014 ${f.pageCount} ${pagesLabel}</span></span>
      <button class="clear-btn" id="clearAllBtn">${t.remove || 'Clear'}</button>
    `
    document.getElementById('clearAllBtn').addEventListener('click', resetState)
  }
}

/* ── Render page grid ─────────────────────────────────────────────────────── */
function renderActiveFile() {
  renderFileHeader()
  pageGrid.innerHTML = ''
  if (files.length === 0) return
  const f = files[activeFileIndex]
  if (!f) return

  for (let i = 0; i < f.pageCount; i++) {
    const card = document.createElement('div')
    card.className = 'page-card'

    const wrap = document.createElement('div')
    wrap.className = 'canvas-wrap'
    const canvas = f.canvases[i]
    if (canvas) {
      canvas.style.transform = `rotate(${f.rotations[i]}deg)`
      wrap.appendChild(canvas)
    }
    card.appendChild(wrap)

    const label = document.createElement('div')
    label.className = 'plabel'
    label.textContent = `${pageLabel} ${i + 1}`
    card.appendChild(label)

    const rotLbl = document.createElement('div')
    rotLbl.className = 'rot-label'
    rotLbl.textContent = rotLabel(f.rotations[i])
    card.appendChild(rotLbl)

    const btns = document.createElement('div')
    btns.className = 'page-btns'

    const btnCW = document.createElement('button')
    btnCW.title = cwLbl
    btnCW.textContent = '\u21BB'
    btnCW.addEventListener('click', () => rotatePage(i, 90))

    const btnCCW = document.createElement('button')
    btnCCW.title = ccwLbl
    btnCCW.textContent = '\u21BA'
    btnCCW.addEventListener('click', () => rotatePage(i, -90))

    const btn180 = document.createElement('button')
    btn180.title = r180Lbl
    btn180.textContent = '\u21C5'
    btn180.addEventListener('click', () => rotatePage(i, 180))

    btns.appendChild(btnCCW)
    btns.appendChild(btn180)
    btns.appendChild(btnCW)
    card.appendChild(btns)

    pageGrid.appendChild(card)
  }
}

/* ── Rotate single page ───────────────────────────────────────────────────── */
function rotatePage(pageIdx, delta) {
  const f = files[activeFileIndex]
  if (!f) return
  f.rotations[pageIdx] = (f.rotations[pageIdx] + delta + 360) % 360

  // Update canvas transform + label
  const cards = pageGrid.children
  const card = cards[pageIdx]
  if (!card) return
  const canvas = card.querySelector('canvas')
  if (canvas) canvas.style.transform = `rotate(${f.rotations[pageIdx]}deg)`
  const rl = card.querySelector('.rot-label')
  if (rl) rl.textContent = rotLabel(f.rotations[pageIdx])
}

/* ── Rotate all pages ─────────────────────────────────────────────────────── */
rotateAllBar.querySelectorAll('.ra-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const f = files[activeFileIndex]
    if (!f) return
    const action = btn.dataset.action
    for (let i = 0; i < f.pageCount; i++) {
      if (action === 'cw') f.rotations[i] = (f.rotations[i] + 90) % 360
      else if (action === 'ccw') f.rotations[i] = (f.rotations[i] + 270) % 360
      else if (action === '180') f.rotations[i] = (f.rotations[i] + 180) % 360
      else if (action === 'reset') f.rotations[i] = 0
    }
    renderActiveFile()
  })
})

/* ── Remove file ──────────────────────────────────────────────────────────── */
function removeFile(idx) {
  files.splice(idx, 1)
  if (files.length === 0) {
    resetState()
    return
  }
  if (activeFileIndex >= files.length) activeFileIndex = files.length - 1
  renderFileTabs()
  renderActiveFile()
  updateLayout()
}

/* ── Reset ────────────────────────────────────────────────────────────────── */
function resetState() {
  files = []
  activeFileIndex = 0
  pageGrid.innerHTML = ''
  fileTabs.innerHTML = ''
  fileHeader.innerHTML = ''
  fileHeader.style.display = 'none'
  fileTabs.style.display = 'none'
  rotateAllBar.style.display = 'none'
  actionRow.style.display = 'none'
  statusText.textContent = ''
  uploadArea.style.display = ''
  toolWrap.style.maxWidth = '700px'
  document.getElementById('nextSteps').style.display = 'none'
}

/* ── Load files ───────────────────────────────────────────────────────────── */
async function addFiles(inputFiles) {
  statusText.textContent = loadingLbl
  document.getElementById('nextSteps').style.display = 'none'

  const pdfjs = await loadPdfJs()

  for (const file of inputFiles) {
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files only.'
      continue
    }
    if (file.size > LIMITS.MAX_PER_FILE_BYTES) {
      statusText.textContent = `${file.name}: too large. Max ${formatSize(LIMITS.MAX_PER_FILE_BYTES)} per file.`
      continue
    }
    if (files.length >= LIMITS.MAX_FILES) {
      statusText.textContent = `Maximum ${LIMITS.MAX_FILES} files allowed.`
      break
    }

    try {
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf.slice(0))
      const pdfDoc = await pdfjs.getDocument({ data: buf }).promise
      const pageCount = pdfDoc.numPages
      const rotations = new Array(pageCount).fill(0)
      const canvases = []

      // Add file entry first (with empty canvases), render thumbnails progressively
      const entry = { name: file.name, bytes, pageCount, rotations, canvases, pdfDoc }
      files.push(entry)
      activeFileIndex = files.length - 1
      updateLayout()
      renderFileTabs()

      // Render thumbnails one at a time with progress
      for (let p = 1; p <= pageCount; p++) {
        statusText.textContent = `Loading ${file.name} \u2014 page ${p}/${pageCount}`
        const page = await pdfDoc.getPage(p)
        const viewport = page.getViewport({ scale: 0.4 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
        canvases.push(canvas)
        renderActiveFile() // Update grid after each page
      }
    } catch (err) {
      console.error('[rotate-pdf] load failed:', file.name, err)
      statusText.textContent = `Failed to load ${file.name}: ${err?.message || err}`
    }
  }

  if (files.length > 0) {
    statusText.textContent = ''
    activeFileIndex = Math.min(activeFileIndex, files.length - 1)
    updateLayout()
    renderFileTabs()
    renderActiveFile()
  }
}

/* ── File input handlers ──────────────────────────────────────────────────── */
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles(Array.from(fileInput.files))
  fileInput.value = ''
})

addMoreInput.addEventListener('change', () => {
  if (addMoreInput.files.length) addFiles(Array.from(addMoreInput.files))
  addMoreInput.value = ''
})

document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files))
})

/* ── Apply rotation to a single PDF ──────────────────────────────────────── */
async function buildRotatedPdf(fileEntry) {
  const pdfDoc = await PDFDocument.load(fileEntry.bytes)
  const pages = pdfDoc.getPages()
  for (let i = 0; i < pages.length; i++) {
    if (fileEntry.rotations[i] !== 0) {
      const current = pages[i].getRotation().angle
      pages[i].setRotation(degrees(current + fileEntry.rotations[i]))
    }
  }
  const rotatedBytes = await pdfDoc.save()
  return new Blob([rotatedBytes], { type: 'application/pdf' })
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/* ── Apply & Download single ──────────────────────────────────────────────── */
async function applyAndDownloadSingle(idx) {
  const f = files[idx]
  if (!f) return
  statusText.textContent = applyingLbl
  setButtonsDisabled(true)

  try {
    const blob = await buildRotatedPdf(f)
    const baseName = f.name.replace(/\.[^.]+$/, '')
    const outName = `${baseName}-rotated.pdf`
    downloadBlob(blob, outName)

    statusText.textContent = (t.rotatepdf_done || 'Done!') + ` ${f.name} rotated.`
    window.rcShowSaveButton?.()
    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
  } catch (err) {
    console.error('[rotate-pdf] apply failed:', err)
    statusText.textContent = (t.rotatepdf_error || 'Failed to rotate PDF: ') + (err?.message || err)
  }
  setButtonsDisabled(false)
}

/* ── Apply All & Download ZIP ─────────────────────────────────────────────── */
async function applyAllAndDownloadZip() {
  if (files.length === 0) return
  statusText.textContent = applyingLbl
  setButtonsDisabled(true)

  try {
    const JSZipModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = JSZipModule.default || window.JSZip
    const zip = new JSZip()

    for (let i = 0; i < files.length; i++) {
      statusText.textContent = `${applyingLbl} (${i + 1}/${files.length})`
      const blob = await buildRotatedPdf(files[i])
      const baseName = files[i].name.replace(/\.[^.]+$/, '')
      zip.file(`${baseName}-rotated.pdf`, blob)
    }

    statusText.textContent = t.rotatepdf_zipping || 'Creating ZIP\u2026'
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, 'rotated-pdfs.zip')

    statusText.textContent = (t.rotatepdf_done || 'Done!') + ` ${files.length} files rotated.`
    window.rcShowSaveButton?.()
    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
  } catch (err) {
    console.error('[rotate-pdf] zip failed:', err)
    statusText.textContent = (t.rotatepdf_zip_error || 'Failed to create ZIP: ') + (err?.message || err)
  }
  setButtonsDisabled(false)
}

/* ── Disable/enable action buttons ────────────────────────────────────────── */
function setButtonsDisabled(disabled) {
  actionRow.querySelectorAll('.action-btn').forEach(btn => {
    btn.disabled = disabled
    if (disabled) {
      btn.classList.add('disabled')
    } else {
      btn.classList.remove('disabled')
    }
  })
}

/* ── What's Next? ─────────────────────────────────────────────────────────── */
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

/* ── SEO section ──────────────────────────────────────────────────────────── */
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
