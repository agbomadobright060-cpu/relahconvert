import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

injectHreflang('watermark-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['watermark-pdf']) || 'Watermark PDF'
const seoData   = t.seo && t.seo['watermark-pdf']
const descText  = t.wmpdf_desc || t.card_watermark_pdf_desc || 'Add text watermarks to your PDF files. Choose text, font size, opacity, color, and position.'
const selectLbl = t.wmpdf_select || t.select_images || 'Select PDFs'
const dropHint  = t.wmpdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'
const applyLbl  = t.wmpdf_apply || 'Add Watermark'
const applyingLbl = t.wmpdf_applying || 'Adding watermark\u2026'
const loadingLbl  = t.wmpdf_loading || 'Loading PDFs\u2026'
const pagesLabel  = t.wmpdf_pages || t.pdfpng_pages || 'pages'

const MAX_FILES = LIMITS.MAX_FILES || 25
const MAX_FILE_SIZE = 50 * 1024 * 1024

const _tp = toolName.split(' ')
const h1Main = _tp[0]
const h1Em = _tp.slice(1).join(' ')

/* ── PDF.js CDN ─────────────────────────────────────────────────────────── */
const PDFJS_CDN = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build'
let pdfjsLib = null

async function ensurePdfJs() {
  if (pdfjsLib) return pdfjsLib
  if (window.pdfjsLib) { pdfjsLib = window.pdfjsLib; return pdfjsLib }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `${PDFJS_CDN}/pdf.min.mjs`
    s.type = 'module'
    s.onload = () => {
      pdfjsLib = window.pdfjsLib
      if (pdfjsLib) { pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`; resolve(pdfjsLib) }
      else reject(new Error('PDF.js did not load'))
    }
    s.onerror = () => reject(new Error('PDF.js CDN failed'))
    document.head.appendChild(s)
  })
}

/* Fallback: load PDF.js via classic script tag if module fails */
async function loadPdfJsFallback() {
  if (pdfjsLib) return pdfjsLib
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
    s.onload = () => {
      pdfjsLib = window.pdfjsLib
      if (pdfjsLib) { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'; resolve(pdfjsLib) }
      else reject(new Error('PDF.js fallback did not load'))
    }
    s.onerror = () => reject(new Error('PDF.js fallback CDN failed'))
    document.head.appendChild(s)
  })
}

async function getPdfJs() {
  try { return await ensurePdfJs() } catch(e) { return await loadPdfJsFallback() }
}

/* ── Styles ──────────────────────────────────────────────────────────── */
document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .wmpdf-drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:48px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .wmpdf-drop-zone:hover,.wmpdf-drop-zone.over{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .tool-layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;}
  .image-col{background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);min-height:320px;display:flex;flex-direction:column;padding:16px;gap:10px;overflow:hidden;}
  .controls-col{background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);padding:16px;font-family:'DM Sans',sans-serif;max-height:85vh;overflow-y:auto;}
  .controls-col h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 12px;}
  .section-label{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;font-family:'DM Sans',sans-serif;}
  .divider{height:1px;background:#F0EAE3;margin:12px 0;}
  .ctrl-input{width:100%;padding:8px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;background:var(--bg-card);color:var(--text-primary);outline:none;box-sizing:border-box;}
  .ctrl-input:focus{border-color:var(--accent);}
  input[type=range]{width:100%;accent-color:var(--accent);margin:3px 0;}
  .range-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
  .range-val{font-size:12px;color:var(--text-muted);min-width:36px;text-align:right;font-family:'DM Sans',sans-serif;}
  .swatches{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px;margin-bottom:10px;}
  .swatch{width:24px;height:24px;border-radius:50%;border:2.5px solid var(--border);cursor:pointer;transition:transform 0.15s,border-color 0.15s;flex-shrink:0;}
  .swatch:hover{transform:scale(1.15);}
  .swatch.active{border-color:var(--accent);transform:scale(1.15);}
  .pos-grid{display:grid;grid-template-columns:repeat(3,28px);grid-template-rows:repeat(3,28px);gap:3px;margin-top:5px;margin-bottom:10px;}
  .pos-cell{background:var(--bg-surface,#F5F0EB);border:1.5px solid var(--border-light);border-radius:5px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
  .pos-cell:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  .pos-cell.active{background:var(--accent);border-color:var(--accent);}
  .pos-cell.active .pos-dot{background:#fff;}
  .pos-dot{width:8px;height:8px;border-radius:50%;background:var(--text-muted);}
  .file-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;}
  .file-chip{display:flex;align-items:center;gap:5px;background:var(--bg-surface);border-radius:20px;padding:4px 10px;font-size:11px;font-family:'DM Sans',sans-serif;color:var(--text-secondary);cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;}
  .file-chip:hover{border-color:var(--accent);}
  .file-chip.active{border-color:var(--accent);color:var(--accent);}
  .file-chip button{background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:12px;line-height:1;padding:0;}
  .file-chip button:hover{color:var(--accent);}
  .thumb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;width:100%;}
  .thumb-wrap{position:relative;background:var(--bg-surface,#F5F0EB);border-radius:8px;overflow:hidden;border:1.5px solid var(--border-light);aspect-ratio:0.707;}
  .thumb-wrap canvas{width:100%;height:100%;object-fit:contain;display:block;}
  .thumb-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;}
  .thumb-overlay-text{font-family:Helvetica,Arial,sans-serif;white-space:nowrap;transform-origin:center center;}
  .thumb-label{position:absolute;bottom:4px;right:6px;font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;background:rgba(255,255,255,0.75);border-radius:4px;padding:1px 5px;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;width:100%;margin-bottom:8px;}
  .action-btn:hover{background:var(--accent-hover);transform:translateY(-1px);}
  .action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;transform:none;}
  .action-btn.dark{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-top:6px;min-height:18px;}
  .diag-row{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:13px;color:var(--text-primary);font-family:'DM Sans',sans-serif;cursor:pointer;user-select:none;}
  .diag-row input[type=checkbox]{accent-color:var(--accent);width:16px;height:16px;cursor:pointer;}
  .next-steps{margin-top:20px;}
  .next-steps-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
  @media(max-width:700px){.tool-layout{grid-template-columns:1fr;}.image-col{min-height:220px;}}
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

document.title = t.wmpdf_page_title || (seoData ? seoData.page_title : 'Watermark PDF Free | Add Text Watermark to PDF Online \u2014 RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.wmpdf_meta_desc || 'Add text watermarks to PDF files free. Choose text, font size, opacity, color, and placement style.'
document.head.appendChild(_metaDesc)

/* ── HTML ───────────────────────────────────────────────────────────── */
document.querySelector('#app').innerHTML = `
  <div id="wmpdf_main" style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${descText}</p>
      <label class="upload-label" for="wmpdf_fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);margin-left:10px;">${dropHint}</span>
      <input type="file" id="wmpdf_fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
      <label for="wmpdf_fileInput" id="wmpdf_dropZone" class="wmpdf-drop-zone">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">${t.drop_images || 'Drop PDFs here'}</span>
      </label>
    </div>
    <div class="tool-layout" id="wmpdf_toolLayout" style="display:none;">
      <div class="image-col" id="wmpdf_imageCol">
        <div class="file-chips" id="wmpdf_fileChips"></div>
        <div class="thumb-grid" id="wmpdf_thumbGrid"></div>
      </div>
      <div class="controls-col" id="wmpdf_controlsCol">
        <h3>${t.wmpdf_options_title || 'Watermark Options'}</h3>

        <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;margin-bottom:14px;">
          <button id="wmpdf_modeText" style="flex:1;padding:9px 0;border:none;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Text</button>
          <button id="wmpdf_modeImage" style="flex:1;padding:9px 0;border:none;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Image</button>
        </div>

        <div id="wmpdf_textPanel">
          <div class="section-label">${t.wmpdf_text_label || 'Text'}</div>
          <input type="text" class="ctrl-input" id="wmpdf_text" value="CONFIDENTIAL" maxlength="100" style="margin-bottom:10px;" />

          <div class="section-label">${t.wmpdf_font_size || 'Font Size'}</div>
          <div class="range-row">
            <input type="number" class="ctrl-input" id="wmpdf_fontSize" value="48" min="20" max="120" step="1" style="width:70px;" />
            <span class="range-val">pt</span>
          </div>

          <div class="section-label">${t.wmpdf_color || 'Color'}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <input type="color" id="wmpdf_colorPicker" value="#808080" style="width:44px;height:36px;border:1.5px solid var(--border-light);border-radius:8px;cursor:pointer;padding:2px;background:var(--bg-card);" />
            <span id="wmpdf_colorHex" style="font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;">#808080</span>
          </div>

          <label class="diag-row"><input type="checkbox" id="wmpdf_diagonal" checked /> ${t.wmpdf_diagonal || 'Diagonal'}</label>

          <div class="section-label">${t.wmpdf_rotation || 'Rotation'}</div>
          <div class="range-row">
            <input type="range" id="wmpdf_rotation" min="-90" max="90" step="1" value="-45" />
            <span class="range-val" id="wmpdf_rotationVal">-45&deg;</span>
          </div>
        </div>

        <div id="wmpdf_imagePanel" style="display:none;">
          <label class="upload-label" for="wmpdf_imgInput" style="width:100%;justify-content:center;margin-bottom:10px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Choose Image
          </label>
          <input type="file" id="wmpdf_imgInput" accept="image/png,image/jpeg" style="display:none;" />
          <div id="wmpdf_imgPreview" style="display:none;margin:0 0 12px;text-align:center;">
            <img id="wmpdf_imgPreviewImg" style="max-width:100%;max-height:120px;border-radius:8px;border:1.5px solid var(--border-light);" />
            <button id="wmpdf_imgRemove" style="display:block;margin:6px auto 0;background:none;border:none;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;">Remove image</button>
          </div>

          <div class="section-label">Scale</div>
          <div class="range-row">
            <input type="range" id="wmpdf_imgScale" min="10" max="100" value="30" />
            <span class="range-val" id="wmpdf_imgScaleVal">30%</span>
          </div>
        </div>

        <div class="section-label">${t.wmpdf_opacity || 'Opacity'}</div>
        <div class="range-row">
          <input type="range" id="wmpdf_opacity" min="5" max="50" step="1" value="15" />
          <span class="range-val" id="wmpdf_opacityVal">15%</span>
        </div>

        <div class="section-label">${t.wmpdf_position || 'Position'}</div>
        <div class="pos-grid" id="wmpdf_posGrid"></div>

        <div class="divider"></div>
        <div id="wmpdf_applyModeToggle" style="display:none;margin-bottom:12px;">
          <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
            <button id="wmpdf_modeAll" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
            <button id="wmpdf_modeIndiv" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
          </div>
        </div>
        <button class="action-btn" id="wmpdf_applyBtn" disabled>${applyLbl}</button>
        <div id="wmpdf_zipWrap" style="display:none;">
          <a id="wmpdf_zipBtn" class="action-btn dark" style="display:block;text-align:center;text-decoration:none;">\u2B07 ${dlZipBtn}</a>
          <p id="wmpdf_zipNote" style="font-size:11px;color:var(--text-muted);text-align:center;margin:4px 0 0;font-family:'DM Sans',sans-serif;"></p>
        </div>
        <div class="status-text" id="wmpdf_status"></div>
      </div>
    </div>
    <div id="wmpdf_nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="wmpdf_nextButtons"></div>
    </div>
  </div>
`

injectHeader()

/* ── State ───────────────────────────────────────────────────────────── */
let pdfFiles = []        // { name, bytes, pageCount, thumbCanvases[] }
let activeIdx = 0
let lastResults = []
let wmMode = 'text' // 'text' or 'image'
let wmImageFile = null   // File object for image watermark
let wmImageEl = null     // HTMLImageElement for preview
let wmImageUrl = null    // object URL for preview

const opts = {
  text: 'CONFIDENTIAL',
  fontSize: 48,
  opacity: 15,       // 5-50 => actual 0.05-0.50
  color: '#808080',
  position: 'center',
  diagonal: true,
  rotation: -45,
  imgScale: 30,      // 10-100, % of page width
}

function defaultOpts() {
  return { text:'CONFIDENTIAL', fontSize:48, opacity:15, color:'#808080', position:'center', diagonal:true, rotation:-45, imgScale:30 }
}

function saveOptsToFile() {
  if (applyMode !== 'individual' || !pdfFiles[activeIdx]) return
  pdfFiles[activeIdx].opts = { ...opts }
  pdfFiles[activeIdx].wmImageFile = wmImageFile
  pdfFiles[activeIdx].wmMode = wmMode
}

function loadOptsFromFile() {
  if (applyMode !== 'individual' || !pdfFiles[activeIdx]) return
  const fo = pdfFiles[activeIdx].opts
  if (!fo) return
  Object.assign(opts, fo)
  // Sync UI from opts
  const ti = document.getElementById('wmpdf_textInput')
  const fsi = document.getElementById('wmpdf_fontSize')
  const cp = document.getElementById('wmpdf_colorPicker')
  const ch = document.getElementById('wmpdf_colorHex')
  const dc = document.getElementById('wmpdf_diagonal')
  const rs = document.getElementById('wmpdf_rotation')
  const rv = document.getElementById('wmpdf_rotationVal')
  const os = document.getElementById('wmpdf_opacity')
  const ov = document.getElementById('wmpdf_opacityVal')
  const is = document.getElementById('wmpdf_imgScale')
  const iv = document.getElementById('wmpdf_imgScaleVal')
  if (ti) ti.value = opts.text
  if (fsi) fsi.value = opts.fontSize
  if (cp) { cp.value = opts.color; if (ch) ch.textContent = opts.color.toUpperCase() }
  if (dc) dc.checked = opts.diagonal
  if (rs) { rs.value = opts.rotation; if (rv) rv.innerHTML = opts.rotation + '&deg;' }
  if (os) { os.value = opts.opacity; if (ov) ov.textContent = opts.opacity + '%' }
  if (is) { is.value = opts.imgScale; if (iv) iv.textContent = opts.imgScale + '%' }
  // Update position grid
  document.querySelectorAll('.pos-cell').forEach(c => {
    c.classList.toggle('active', c.dataset.pos === opts.position)
  })
  // Load per-file image and mode
  const fileImg = pdfFiles[activeIdx].wmImageFile
  const fileMode = pdfFiles[activeIdx].wmMode || 'text'
  wmImageFile = fileImg || null
  if (fileImg) {
    if (wmImageUrl) URL.revokeObjectURL(wmImageUrl)
    wmImageUrl = URL.createObjectURL(fileImg)
    document.getElementById('wmpdf_imgPreviewImg').src = wmImageUrl
    document.getElementById('wmpdf_imgPreview').style.display = 'block'
    const img = new Image(); img.onload = () => { wmImageEl = img; updateOverlays() }; img.src = wmImageUrl
  } else {
    wmImageEl = null
    if (wmImageUrl) { URL.revokeObjectURL(wmImageUrl); wmImageUrl = null }
    document.getElementById('wmpdf_imgPreviewImg').src = ''
    document.getElementById('wmpdf_imgPreview').style.display = 'none'
  }
  // Set mode toggle
  if (typeof setWmMode === 'function') setWmMode(fileMode)
  else wmMode = fileMode
  updateOverlays()
}

/* ── Color helpers ────────────────────────────────────────────────── */
function hexToRgb01(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  }
}

/* ── DOM refs ────────────────────────────────────────────────────────── */
const fileInput    = document.getElementById('wmpdf_fileInput')
const dropZone     = document.getElementById('wmpdf_dropZone')
const toolLayout   = document.getElementById('wmpdf_toolLayout')
const imageCol     = document.getElementById('wmpdf_imageCol')
const fileChips    = document.getElementById('wmpdf_fileChips')
const thumbGrid    = document.getElementById('wmpdf_thumbGrid')
const textInput    = document.getElementById('wmpdf_text')
const fontSizeInput = document.getElementById('wmpdf_fontSize')
const opacitySlider = document.getElementById('wmpdf_opacity')
const opacityVal   = document.getElementById('wmpdf_opacityVal')
// color picker handled below
const posGrid      = document.getElementById('wmpdf_posGrid')
const diagCheck    = document.getElementById('wmpdf_diagonal')
const rotSlider    = document.getElementById('wmpdf_rotation')
const rotVal       = document.getElementById('wmpdf_rotationVal')
const applyBtn     = document.getElementById('wmpdf_applyBtn')
const modeTextBtn  = document.getElementById('wmpdf_modeText')
const modeImageBtn = document.getElementById('wmpdf_modeImage')
const textPanel    = document.getElementById('wmpdf_textPanel')
const imagePanel   = document.getElementById('wmpdf_imagePanel')
const imgInput     = document.getElementById('wmpdf_imgInput')
const imgPreview   = document.getElementById('wmpdf_imgPreview')
const imgPreviewImg = document.getElementById('wmpdf_imgPreviewImg')
const imgScaleSlider = document.getElementById('wmpdf_imgScale')
const imgScaleVal  = document.getElementById('wmpdf_imgScaleVal')
const zipWrap      = document.getElementById('wmpdf_zipWrap')
const zipBtn       = document.getElementById('wmpdf_zipBtn')
const zipNote      = document.getElementById('wmpdf_zipNote')
const statusText   = document.getElementById('wmpdf_status')
const nextStepsDiv = document.getElementById('wmpdf_nextSteps')
const nextButtons  = document.getElementById('wmpdf_nextButtons')

/* ── Text/Image mode toggle ─────────────────────────────────────────── */
function setWmMode(mode) {
  wmMode = mode
  const isText = mode === 'text'
  modeTextBtn.style.background = isText ? 'var(--accent)' : 'var(--bg-card)'
  modeTextBtn.style.color = isText ? 'var(--text-on-accent)' : 'var(--text-secondary)'
  modeImageBtn.style.background = isText ? 'var(--bg-card)' : 'var(--accent)'
  modeImageBtn.style.color = isText ? 'var(--text-secondary)' : 'var(--text-on-accent)'
  textPanel.style.display = isText ? 'block' : 'none'
  imagePanel.style.display = isText ? 'none' : 'block'
  updateOverlays()
}
modeTextBtn.addEventListener('click', () => setWmMode('text'))
modeImageBtn.addEventListener('click', () => setWmMode('image'))

/* ── Position grid ───────────────────────────────────────────────────── */
const POSITIONS = [
  'top-left','top-center','top-right',
  'center-left','center','center-right',
  'bottom-left','bottom-center','bottom-right'
]

function buildPosGrid() {
  posGrid.innerHTML = ''
  POSITIONS.forEach(pos => {
    const cell = document.createElement('div')
    cell.className = 'pos-cell' + (pos === opts.position ? ' active' : '')
    cell.dataset.pos = pos
    cell.innerHTML = '<div class="pos-dot"></div>'
    cell.addEventListener('click', () => {
      opts.position = pos
      posGrid.querySelectorAll('.pos-cell').forEach(c => c.classList.toggle('active', c.dataset.pos === pos))
      updateOverlays()
    })
    posGrid.appendChild(cell)
  })
}
buildPosGrid()

/* ── Control bindings ────────────────────────────────────────────────── */
textInput.addEventListener('input', () => { opts.text = textInput.value.trim() || 'CONFIDENTIAL'; updateOverlays() })

fontSizeInput.addEventListener('input', () => {
  let v = parseInt(fontSizeInput.value) || 48
  v = Math.max(20, Math.min(120, v))
  opts.fontSize = v
  updateOverlays()
})

opacitySlider.addEventListener('input', () => {
  opts.opacity = parseInt(opacitySlider.value)
  opacityVal.textContent = opts.opacity + '%'
  updateOverlays()
})

const colorPicker = document.getElementById('wmpdf_colorPicker')
const colorHex = document.getElementById('wmpdf_colorHex')

colorPicker.addEventListener('input', () => {
  opts.color = colorPicker.value
  colorHex.textContent = colorPicker.value.toUpperCase()
  updateOverlays()
})

diagCheck.addEventListener('change', () => {
  opts.diagonal = diagCheck.checked
  if (opts.diagonal) {
    opts.rotation = -45
    rotSlider.value = -45
    rotVal.innerHTML = '-45&deg;'
  } else {
    opts.rotation = 0
    rotSlider.value = 0
    rotVal.innerHTML = '0&deg;'
  }
  updateOverlays()
})

rotSlider.addEventListener('input', () => {
  opts.rotation = parseInt(rotSlider.value)
  rotVal.innerHTML = opts.rotation + '&deg;'
  // Sync diagonal checkbox
  diagCheck.checked = (opts.rotation === -45)
  opts.diagonal = diagCheck.checked
  updateOverlays()
})

/* ── Mode toggle (Text / Image) ──────────────────────────────────────── */
/* ── Image watermark input ───────────────────────────────────────────── */
imgInput.addEventListener('change', () => {
  const file = imgInput.files[0]
  if (!file) return
  wmImageFile = file
  if (wmImageUrl) URL.revokeObjectURL(wmImageUrl)
  wmImageUrl = URL.createObjectURL(file)
  imgPreviewImg.src = wmImageUrl
  imgPreview.style.display = 'block'
  // Save to current file in Individual mode
  if (applyMode === 'individual' && pdfFiles[activeIdx]) {
    pdfFiles[activeIdx].wmImageFile = file
  }
  // Load into an Image element for overlay preview
  const img = new Image()
  img.onload = () => { wmImageEl = img; updateOverlays() }
  img.src = wmImageUrl
  imgInput.value = ''
})

// Remove image button
document.getElementById('wmpdf_imgRemove').addEventListener('click', () => {
  wmImageFile = null
  wmImageEl = null
  if (wmImageUrl) { URL.revokeObjectURL(wmImageUrl); wmImageUrl = null }
  imgPreviewImg.src = ''
  imgPreview.style.display = 'none'
  if (applyMode === 'individual' && pdfFiles[activeIdx]) {
    pdfFiles[activeIdx].wmImageFile = null
  }
  updateOverlays()
})

imgScaleSlider.addEventListener('input', () => {
  opts.imgScale = parseInt(imgScaleSlider.value)
  imgScaleVal.textContent = opts.imgScale + '%'
  updateOverlays()
})

/* ── Overlay positioning helper ──────────────────────────────────────── */
function getOverlayStyles() {
  const color = opts.color || '#808080'
  const opac = opts.opacity / 100
  const rot = opts.rotation

  // Position -> CSS alignment
  let alignItems = 'center', justifyContent = 'center'
  const p = opts.position
  if (p.startsWith('top')) alignItems = 'flex-start'
  else if (p.startsWith('bottom')) alignItems = 'flex-end'
  if (p.endsWith('left')) justifyContent = 'flex-start'
  else if (p.endsWith('right')) justifyContent = 'flex-end'

  // Padding offsets for edge positions
  let padTop = '0', padBottom = '0', padLeft = '0', padRight = '0'
  if (p.startsWith('top')) padTop = '8%'
  if (p.startsWith('bottom')) padBottom = '8%'
  if (p.endsWith('left')) padLeft = '6%'
  if (p.endsWith('right')) padRight = '6%'

  return { color, opac, rot, alignItems, justifyContent, padTop, padBottom, padLeft, padRight }
}

function updateOverlays() {
  const overlays = thumbGrid.querySelectorAll('.thumb-overlay')
  const s = getOverlayStyles()
  overlays.forEach(ov => {
    ov.style.alignItems = s.alignItems
    ov.style.justifyContent = s.justifyContent
    ov.style.paddingTop = s.padTop
    ov.style.paddingBottom = s.padBottom
    ov.style.paddingLeft = s.padLeft
    ov.style.paddingRight = s.padRight

    const txt = ov.querySelector('.thumb-overlay-text')
    let imgOv = ov.querySelector('.thumb-overlay-img')

    if (wmMode === 'text') {
      // Show text, hide image
      if (txt) {
        txt.style.display = ''
        txt.textContent = opts.text || 'CONFIDENTIAL'
        txt.style.color = s.color
        txt.style.opacity = s.opac
        txt.style.transform = `rotate(${s.rot}deg)`
        const wrapW = ov.parentElement.offsetWidth || 120
        const scaledFS = Math.max(6, Math.round(opts.fontSize * (wrapW / 600)))
        txt.style.fontSize = scaledFS + 'px'
        txt.style.fontWeight = 'bold'
      }
      if (imgOv) imgOv.style.display = 'none'
    } else {
      // Image mode: hide text, show image overlay
      if (txt) txt.style.display = 'none'
      if (wmImageEl) {
        if (!imgOv) {
          imgOv = document.createElement('img')
          imgOv.className = 'thumb-overlay-img'
          imgOv.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;'
          ov.appendChild(imgOv)
        }
        imgOv.style.display = ''
        imgOv.src = wmImageEl.src
        imgOv.style.opacity = s.opac
        imgOv.style.width = opts.imgScale + '%'
        imgOv.style.height = 'auto'
      } else if (imgOv) {
        imgOv.style.display = 'none'
      }
    }
  })
}

/* ── File chips ──────────────────────────────────────────────────────── */
function renderFileChips() {
  fileChips.innerHTML = ''
  if (pdfFiles.length <= 1) return
  pdfFiles.forEach((entry, idx) => {
    const chip = document.createElement('div')
    chip.className = 'file-chip' + (idx === activeIdx ? ' active' : '')
    const shortName = entry.name.replace(/\.[^.]+$/, '').slice(0, 14)
    chip.innerHTML = `<span>${shortName}</span><button data-idx="${idx}">\u2715</button>`
    chip.querySelector('span').addEventListener('click', () => {
      saveOptsToFile()
      activeIdx = idx
      loadOptsFromFile()
      renderFileChips()
      renderThumbnails()
    })
    chip.querySelector('button').addEventListener('click', e => {
      e.stopPropagation()
      pdfFiles.splice(idx, 1)
      if (activeIdx >= pdfFiles.length) activeIdx = Math.max(0, pdfFiles.length - 1)
      if (pdfFiles.length === 0) {
        toolLayout.style.display = 'none'
        dropZone.style.display = 'flex'
        applyBtn.disabled = true
      }
      renderFileChips()
      renderThumbnails()
    })
    fileChips.appendChild(chip)
  })
}

/* ── Thumbnail rendering via PDF.js ──────────────────────────────────── */
async function renderThumbnails() {
  thumbGrid.innerHTML = ''
  const entry = pdfFiles[activeIdx]
  if (!entry) return

  // If we already have cached canvases, reuse them
  if (entry.thumbCanvases && entry.thumbCanvases.length) {
    entry.thumbCanvases.forEach((cvs, i) => {
      const wrap = createThumbWrap(cvs, i + 1)
      thumbGrid.appendChild(wrap)
    })
    updateOverlays()
    return
  }

  try {
    const lib = await getPdfJs()
    const loadTask = lib.getDocument({ data: entry.bytes.slice(0) })
    const pdf = await loadTask.promise
    entry.thumbCanvases = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const vp = page.getViewport({ scale: 0.5 })
      const cvs = document.createElement('canvas')
      cvs.width = vp.width
      cvs.height = vp.height
      const ctx = cvs.getContext('2d')
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      entry.thumbCanvases.push(cvs)

      const wrap = createThumbWrap(cvs, i)
      thumbGrid.appendChild(wrap)
    }
    updateOverlays()
  } catch (err) {
    console.error('[watermark-pdf] thumbnail render failed:', err)
    thumbGrid.innerHTML = `<p style="font-size:12px;color:var(--text-muted);padding:20px;">Preview not available. Watermark will still be applied.</p>`
  }
}

function createThumbWrap(canvas, pageNum) {
  const wrap = document.createElement('div')
  wrap.className = 'thumb-wrap'
  wrap.appendChild(canvas)

  const overlay = document.createElement('div')
  overlay.className = 'thumb-overlay'
  const txt = document.createElement('span')
  txt.className = 'thumb-overlay-text'
  overlay.appendChild(txt)
  wrap.appendChild(overlay)

  const label = document.createElement('span')
  label.className = 'thumb-label'
  label.textContent = pageNum
  wrap.appendChild(label)

  return wrap
}

/* ── Load PDF files ──────────────────────────────────────────────────── */
async function loadPdfFiles(rawFiles) {
  const toLoad = Array.from(rawFiles).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
  if (!toLoad.length) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files.'
    return
  }

  nextStepsDiv.style.display = 'none'
  zipWrap.style.display = 'none'

  const remaining = MAX_FILES - pdfFiles.length
  if (remaining <= 0) {
    statusText.textContent = (t.wmpdf_max_files || 'Maximum') + ` ${MAX_FILES} files.`
    return
  }
  const batch = toLoad.slice(0, remaining)
  if (batch.length < toLoad.length) {
    statusText.textContent = (t.wmpdf_max_files || 'Maximum') + ` ${MAX_FILES} files. ${toLoad.length - batch.length} skipped.`
  } else {
    statusText.textContent = loadingLbl
  }

  for (const file of batch) {
    if (file.size > MAX_FILE_SIZE) {
      statusText.textContent = `${file.name}: ` + (t.wmpdf_too_large || 'File too large. Maximum size is 50 MB.')
      continue
    }
    try {
      const buf = await file.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      pdfFiles.push({
        name: file.name,
        bytes: new Uint8Array(buf.slice(0)),
        pageCount: doc.getPageCount(),
        thumbCanvases: null,
        opts: defaultOpts(),
      })
    } catch (err) {
      console.error('[watermark-pdf] load failed:', file.name, err)
      statusText.textContent = `${file.name}: ` + (t.wmpdf_load_error || 'Could not load PDF: ') + (err?.message || err)
    }
  }

  if (pdfFiles.length) {
    toolLayout.style.display = 'grid'
    document.getElementById('wmpdf_main').style.maxWidth = '900px'
    dropZone.style.display = 'none'
    applyBtn.disabled = false
    statusText.textContent = ''
    updateApplyButtons()
    renderFileChips()
    await renderThumbnails()
  }
}

/* ── File input & drag-drop ──────────────────────────────────────────── */
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

/* ── Position -> (x, y) calculation for pdf-lib ─────────────────────── */
function calcPosition(pos, pageW, pageH, textWidth, fontSize) {
  const margin = fontSize * 0.8
  let x, y
  // Horizontal
  if (pos.endsWith('left')) x = margin
  else if (pos.endsWith('right')) x = pageW - textWidth - margin
  else x = pageW / 2 - textWidth / 2 // center
  // Vertical
  if (pos.startsWith('top')) y = pageH - fontSize - margin
  else if (pos.startsWith('bottom')) y = margin
  else y = pageH / 2 - fontSize / 2 // center

  return { x, y }
}

function calcImagePosition(pos, pageW, pageH, drawW, drawH) {
  const margin = Math.min(pageW, pageH) * 0.04
  let x, y
  // Horizontal
  if (pos.endsWith('left')) x = margin
  else if (pos.endsWith('right')) x = pageW - drawW - margin
  else x = (pageW - drawW) / 2
  // Vertical (pdf-lib y starts from bottom)
  if (pos.startsWith('top')) y = pageH - drawH - margin
  else if (pos.startsWith('bottom')) y = margin
  else y = (pageH - drawH) / 2

  return { x, y }
}

/* ── Process one PDF ─────────────────────────────────────────────────── */
async function processOnePdf(entry, onPageProgress, fileOpts) {
  const o = fileOpts || opts
  const doc = await PDFDocument.load(entry.bytes)
  const totalPages = doc.getPageCount()
  const actualOpacity = o.opacity / 100
  const fileImgFile = entry.wmImageFile || wmImageFile
  const hasText = o.text && o.text.trim().length > 0
  const hasImage = !!fileImgFile

  // Embed font for text
  let font, textColor
  if (hasText) {
    font = await doc.embedFont(StandardFonts.Helvetica)
    const c = hexToRgb01(o.color)
    textColor = rgb(c.r, c.g, c.b)
  }

  // Embed image if provided
  let embeddedImg
  if (hasImage) {
    const imgBytes = new Uint8Array(await fileImgFile.arrayBuffer())
    if (fileImgFile.type === 'image/png') {
      embeddedImg = await doc.embedPng(imgBytes)
    } else {
      embeddedImg = await doc.embedJpg(imgBytes)
    }
  }

  const text = o.text || 'CONFIDENTIAL'
  const fontSize = o.fontSize
  const rotation = o.rotation

  for (let i = 0; i < totalPages; i++) {
    if (onPageProgress) onPageProgress(i + 1, totalPages)

    const page = doc.getPage(i)
    const { width, height } = page.getSize()

    // Apply text watermark if text is set
    if (hasText && font) {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      let x, y

      if (o.diagonal || Math.abs(rotation) > 5) {
        const pos = calcPosition(o.position, width, height, textWidth, fontSize)
        const rad = (Math.abs(rotation) * Math.PI) / 180
        const cosR = Math.cos(rad)
        const sinR = Math.sin(rad)
        x = pos.x + (textWidth / 2) * (1 - cosR)
        y = pos.y + (textWidth / 2) * sinR * (rotation < 0 ? -1 : 1)
      } else {
        const pos = calcPosition(o.position, width, height, textWidth, fontSize)
        x = pos.x
        y = pos.y
      }

      page.drawText(text, {
        x, y, size: fontSize, font, color: textColor,
        opacity: actualOpacity, rotate: degrees(rotation),
      })
    }

    // Apply image watermark if image is set
    if (hasImage && embeddedImg) {
      const imgAspect = embeddedImg.width / embeddedImg.height
      const drawWidth = width * (o.imgScale / 100)
      const drawHeight = drawWidth / imgAspect
      const pos = calcImagePosition(o.position, width, height, drawWidth, drawHeight)
      page.drawImage(embeddedImg, {
        x: pos.x, y: pos.y, width: drawWidth, height: drawHeight, opacity: actualOpacity,
      })
    }
  }

  const watermarkedBytes = await doc.save()
  const blob = new Blob([watermarkedBytes], { type: 'application/pdf' })
  const baseName = entry.name.replace(/\.[^.]+$/, '')
  const filename = `${baseName}-watermarked.pdf`
  return { blob, filename, totalPages }
}

/* ── Trigger download ────────────────────────────────────────────────── */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

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

/* ── Apply watermark ─────────────────────────────────────────────────── */
const applyModeToggle = document.getElementById('wmpdf_applyModeToggle')
const modeAllBtn = document.getElementById('wmpdf_modeAll')
const modeIndivBtn = document.getElementById('wmpdf_modeIndiv')
let applyMode = 'all'

modeAllBtn.addEventListener('click', () => {
  applyMode = 'all'
  modeAllBtn.style.background = 'var(--accent)'; modeAllBtn.style.color = 'var(--text-on-accent)'
  modeIndivBtn.style.background = 'var(--bg-card)'; modeIndivBtn.style.color = 'var(--text-secondary)'
})
modeIndivBtn.addEventListener('click', () => {
  applyMode = 'individual'
  modeIndivBtn.style.background = 'var(--accent)'; modeIndivBtn.style.color = 'var(--text-on-accent)'
  modeAllBtn.style.background = 'var(--bg-card)'; modeAllBtn.style.color = 'var(--text-secondary)'
})

function updateApplyButtons() {
  applyModeToggle.style.display = pdfFiles.length > 1 ? 'block' : 'none'
}

// Apply watermark — respects Apply to All / Individual toggle
applyBtn.addEventListener('click', async () => {
  if (!pdfFiles.length) return
  // Need at least text or image
  const hasAnyWatermark = (opts.text && opts.text.trim()) || wmImageFile || (pdfFiles[activeIdx] && pdfFiles[activeIdx].wmImageFile)
  if (!hasAnyWatermark) {
    statusText.textContent = 'Enter watermark text or choose an image.'
    return
  }
  applyBtn.disabled = true
  applyBtn.textContent = applyingLbl
  statusText.textContent = ''
  nextStepsDiv.style.display = 'none'
  lastResults = []

  saveOptsToFile()
  const doAll = applyMode === 'all' || pdfFiles.length === 1

  try {
    if (!doAll) {
      // Individual: apply to current file only with THIS file's saved opts
      const entry = pdfFiles[activeIdx]
      const result = await processOnePdf(entry, (page, total) => {
        statusText.textContent = `Adding watermark \u2014 ${entry.name} (page ${page}/${total})`
      }, entry.opts)
      triggerDownload(result.blob, result.filename)
      lastResults = [{ blob: result.blob, name: result.filename, type: 'application/pdf' }]
      statusText.textContent = `Done! Watermark added to ${result.totalPages} ${result.totalPages === 1 ? 'page' : 'pages'}.`
      if (window.showReviewPrompt) window.showReviewPrompt()
      window.rcShowSaveButton?.(applyBtn.parentElement, result.blob, result.filename, 'watermark-pdf')
    } else {
      // Apply to All: process all files
      const results = []
      for (let i = 0; i < pdfFiles.length; i++) {
        const entry = pdfFiles[i]
        const result = await processOnePdf(entry, (page, total) => {
          statusText.textContent = `Adding watermark (${i+1}/${pdfFiles.length}) \u2014 ${entry.name} (page ${page}/${total})`
        })
        results.push(result)
      }

      if (results.length === 1) {
        triggerDownload(results[0].blob, results[0].filename)
        lastResults = [{ blob: results[0].blob, name: results[0].filename, type: 'application/pdf' }]
      } else {
        statusText.textContent = 'Creating ZIP\u2026'
        const JSZip = (await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
        const zip = new JSZip()
        const usedNames = new Set()
        for (const r of results) { zip.file(makeUnique(usedNames, r.filename), r.blob) }
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
        triggerDownload(zipBlob, 'watermarked-pdfs.zip')
        lastResults = results.map(r => ({ blob: r.blob, name: r.filename, type: 'application/pdf' }))
      }

      const totalPgs = results.reduce((s, r) => s + r.totalPages, 0)
      statusText.textContent = `Done! Watermark added to ${totalPgs} pages across ${results.length} files.`
      if (window.showReviewPrompt) window.showReviewPrompt()
    }

    buildNextSteps()
  } catch (err) {
    console.error('[watermark-pdf] apply all failed:', err)
    statusText.textContent = `Failed: ${err?.message || err}`
  }

  applyBtn.disabled = false
  applyBtn.textContent = applyLbl
})

/* ── IndexedDB handoff ───────────────────────────────────────────────── */
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
    loadPdfFiles(files)
  } catch (e) { console.warn('[watermark-pdf] IDB autoload failed:', e) }
}

/* ── Next steps ──────────────────────────────────────────────────────── */
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
    { label: ns['add-page-numbers'] || 'Add Page Numbers', href: localHref('add-page-numbers') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
  ]
  nextButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastResults.length) {
        try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch(e) {}
      }
      window.location.href = b.href
    })
    nextButtons.appendChild(btn)
  })
  nextStepsDiv.style.display = 'block'
}

/* ── SEO section ─────────────────────────────────────────────────────── */
loadPendingFiles()

;(function injectSEO() {
  const seo = t.seo && t.seo['watermark-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()