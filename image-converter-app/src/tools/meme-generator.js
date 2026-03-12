import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
let allTemplates = []
let templatePage = 0
const PER_PAGE = 20

if (document.head) {
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:#F2F2F2;'
  const style = document.createElement('style')
  style.textContent = `
    .tool-wrap{max-width:1100px;margin:0 auto;padding:32px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:24px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:#C84B31}
    .tool-sub{font-size:13px;color:#7A6A5A;margin:0}
    .meme-layout{display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start}
    @media(max-width:768px){.meme-layout{grid-template-columns:1fr}}
    .meme-controls{background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border:1.5px solid #E8E0D5;display:flex;flex-direction:column}
    .meme-section{padding:12px 0;border-bottom:1px solid #F0EAE4}
    .meme-section:last-child{border-bottom:none;padding-bottom:0}
    .meme-section:first-child{padding-top:0}
    .meme-label{display:block;font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:7px;font-family:'DM Sans',sans-serif}
    .meme-optional{font-weight:400;text-transform:none;letter-spacing:0;color:#B0A090;font-size:10px}
    .meme-source-row{display:flex;align-items:center;gap:8px}
    .meme-source-btn{flex:1;padding:10px 8px;border:none;border-radius:8px;background:#C84B31;color:#fff;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-source-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .meme-or{font-size:11px;font-weight:700;color:#B0A090;font-family:'DM Sans',sans-serif;flex-shrink:0}
    .meme-input{width:100%;padding:9px 11px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#FAFAF8;outline:none;box-sizing:border-box;transition:border-color 0.15s}
    .meme-input:focus{border-color:#C84B31;background:#fff}
    .meme-input::placeholder{color:#C4B8A8}
    .meme-toggle-row{display:flex;gap:6px}
    .meme-toggle{flex:1;padding:7px 10px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:11px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-toggle:hover{border-color:#C84B31;color:#C84B31}
    .meme-toggle.active{background:#C84B31;border-color:#C84B31;color:#fff}
    .meme-slider{width:100%;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#DDD5C8;outline:none;cursor:pointer;margin-top:4px;display:block}
    .meme-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#C84B31;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.2)}
    .meme-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#C84B31;cursor:pointer;border:none}
    .meme-color-row{display:flex;gap:16px}
    .meme-color-row>div{flex:1}
    .meme-color{width:44px;height:30px;border:1.5px solid #DDD5C8;border-radius:6px;cursor:pointer;padding:2px;background:#fff;display:block;margin-top:4px}
    .meme-pick-btn{width:100%;padding:9px 10px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#2C1810;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-pick-btn:hover{border-color:#C84B31;color:#C84B31;background:#FDE8E3}
    .meme-remove-btn{margin-top:8px;padding:6px 10px;border:1.5px solid #E8D0C8;border-radius:7px;background:#FDE8E3;font-size:11px;font-weight:600;color:#C84B31;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;display:block;width:100%}
    .meme-remove-btn:hover{background:#C84B31;color:#fff;border-color:#C84B31}
    .apply-btn{width:100%;padding:12px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-top:4px}
    .apply-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .apply-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none}
    .meme-preview-wrap{position:sticky;top:84px}
    .meme-preview-box{background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:16px;min-height:300px}
    .meme-preview-box canvas{max-width:100%;border-radius:6px;display:block}
    .meme-placeholder{color:#B0A090;font-size:13px;font-family:'DM Sans',sans-serif;text-align:center}
    .meme-modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .meme-modal{background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.2)}
    .meme-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;border-bottom:1px solid #E8E0D5;flex-shrink:0}
    .meme-modal-header h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:0}
    .meme-modal-close{width:30px;height:30px;border:none;border-radius:8px;background:#F5F0E8;color:#5A4A3A;font-size:14px;cursor:pointer;transition:all 0.15s}
    .meme-modal-close:hover{background:#C84B31;color:#fff}
    .meme-search{width:100%;padding:11px 16px;border:none;border-bottom:1px solid #E8E0D5;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#FAFAF8;outline:none;flex-shrink:0;box-sizing:border-box}
    .meme-search::placeholder{color:#C4B8A8}
    .meme-template-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;overflow-y:auto;flex:1}
    @media(max-width:600px){.meme-template-grid{grid-template-columns:repeat(2,1fr)}}
    .meme-template-item{border:1.5px solid #E8E0D5;border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.15s;background:#FAFAF8}
    .meme-template-item:hover{border-color:#C84B31;box-shadow:0 4px 12px rgba(200,75,49,0.15);transform:translateY(-2px)}
    .meme-template-item img{width:100%;height:110px;object-fit:cover;display:block;background:#F0EAE4}
    .meme-template-item span{display:block;font-size:10px;font-weight:600;color:#5A4A3A;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Sans',sans-serif}
    .meme-pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 16px;border-top:1px solid #E8E0D5;flex-shrink:0}
    .meme-page-btn{padding:7px 16px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#2C1810;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-page-btn:hover:not(:disabled){border-color:#C84B31;color:#C84B31}
    .meme-page-btn:disabled{opacity:0.4;cursor:not-allowed}
    .meme-page-info{font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif}
    .seo-section{max-width:700px;margin:40px auto 0;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
    .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:24px 0 8px}
    .seo-section ol{padding-left:20px;margin:0 0 12px}
    .seo-section ol li,.seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin-bottom:6px}
    .faq-item{border-top:1px solid #E8E0D5;padding:10px 0}
    .faq-item h4{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif}
    .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .seo-links a{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
    .seo-links a:hover{border-color:#C84B31;color:#C84B31}
  `
  document.head.appendChild(style)
}

document.getElementById('app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">Meme <em class="brand-em">Generator</em></h1>
    <p class="tool-sub">Create memes online. Choose a template or upload your own image. Private — runs in your browser.</p>
  </div>
  <div class="meme-layout">
    <div class="meme-controls">

      <div class="meme-section">
        <div class="meme-source-row">
          <button class="meme-source-btn" id="uploadBtn">⬆ Upload Image</button>
          <span class="meme-or">or</span>
          <button class="meme-source-btn" id="templateBtn">🎭 Choose Template</button>
        </div>
        <input type="file" id="fileInput" accept="image/*" style="display:none">
      </div>

      <div id="secTopText" style="display:none" class="meme-section">
        <label class="meme-label">Top Text <span class="meme-optional">(optional)</span></label>
        <input type="text" id="topText" class="meme-input" placeholder="TOP TEXT">
      </div>

      <div id="secBottomText" style="display:none" class="meme-section">
        <label class="meme-label">Bottom Text <span class="meme-optional">(optional)</span></label>
        <input type="text" id="bottomText" class="meme-input" placeholder="BOTTOM TEXT">
      </div>

      <div id="secPosition" style="display:none" class="meme-section">
        <label class="meme-label">Text Position</label>
        <div class="meme-toggle-row">
          <button class="meme-toggle active" id="insideBtn">Inside Image</button>
          <button class="meme-toggle" id="outsideBtn">Outside Image</button>
        </div>
      </div>

      <div id="secFontSize" style="display:none" class="meme-section">
        <label class="meme-label">Font Size: <span id="fontSizeVal">40</span>px</label>
        <input type="range" id="fontSize" min="16" max="100" value="40" class="meme-slider">
      </div>

      <div id="secColors" style="display:none" class="meme-section meme-color-row">
        <div>
          <label class="meme-label">Text Color</label>
          <input type="color" id="textColor" value="#ffffff" class="meme-color">
        </div>
        <div>
          <label class="meme-label">Stroke Color</label>
          <input type="color" id="strokeColor" value="#000000" class="meme-color">
        </div>
      </div>

      <div id="secOverlay" style="display:none" class="meme-section">
        <label class="meme-label">Add Overlay Image <span class="meme-optional">(optional — drag to position)</span></label>
        <button class="meme-pick-btn" id="overlayBtn">+ Add Sticker / Image</button>
        <input type="file" id="overlayInput" accept="image/*" style="display:none">
        <div id="overlayControls" style="display:none;margin-top:8px">
          <label class="meme-label" style="margin-top:8px">Overlay Size: <span id="overlaySizeVal">30</span>%</label>
          <input type="range" id="overlaySize" min="5" max="100" value="30" class="meme-slider">
          <button class="meme-remove-btn" id="removeOverlay">✕ Remove Overlay</button>
        </div>
      </div>

      <div id="secFormat" style="display:none" class="meme-section">
        <label class="meme-label">Download Format</label>
        <div class="meme-toggle-row">
          <button class="meme-toggle active" id="fmtJpg">JPG</button>
          <button class="meme-toggle" id="fmtPng">PNG</button>
        </div>
      </div>

      <button class="apply-btn" id="downloadBtn" style="display:none" disabled>⬇ Download Meme</button>
    </div>

    <div class="meme-preview-wrap">
      <div class="meme-preview-box" id="previewBox">
        <p class="meme-placeholder">Select an image or template to get started</p>
      </div>
    </div>
  </div>

  <div class="meme-modal-overlay" id="templateModal" style="display:none">
    <div class="meme-modal">
      <div class="meme-modal-header">
        <h2>Choose a Meme Template</h2>
        <button class="meme-modal-close" id="closeModal">✕</button>
      </div>
      <input type="text" id="templateSearch" class="meme-search" placeholder="Search templates... (try 'dog', 'drake', 'brain')">
      <div class="meme-template-grid" id="templateGrid"></div>
      <div class="meme-pagination" id="pagination" style="display:none">
        <button class="meme-page-btn" id="prevPage">← Prev</button>
        <span class="meme-page-info" id="pageInfo"></span>
        <button class="meme-page-btn" id="nextPage">Next →</button>
      </div>
    </div>
  </div>
</div>
`

injectHeader()

// State
let mainImage = null
let overlayImage = null
let overlayX = 0.5, overlayY = 0.5
let textPosition = 'inside'
let downloadFmt = 'jpg'
let isDragging = false
let canvas = null, ctx = null
let filteredTemplates = []

const fileInput = document.getElementById('fileInput')
const overlayInput = document.getElementById('overlayInput')
const uploadBtn = document.getElementById('uploadBtn')
const templateBtn = document.getElementById('templateBtn')
const overlayBtn = document.getElementById('overlayBtn')
const removeOverlay = document.getElementById('removeOverlay')
const topText = document.getElementById('topText')
const bottomText = document.getElementById('bottomText')
const fontSize = document.getElementById('fontSize')
const fontSizeVal = document.getElementById('fontSizeVal')
const textColor = document.getElementById('textColor')
const strokeColor = document.getElementById('strokeColor')
const overlaySize = document.getElementById('overlaySize')
const overlaySizeVal = document.getElementById('overlaySizeVal')
const overlayControls = document.getElementById('overlayControls')
const downloadBtn = document.getElementById('downloadBtn')
const previewBox = document.getElementById('previewBox')
const insideBtn = document.getElementById('insideBtn')
const outsideBtn = document.getElementById('outsideBtn')
const fmtJpg = document.getElementById('fmtJpg')
const fmtPng = document.getElementById('fmtPng')

const controlIds = ['secTopText','secBottomText','secPosition','secFontSize','secColors','secOverlay','secFormat']

function showControls() {
  controlIds.forEach(id => { document.getElementById(id).style.display = 'block' })
  downloadBtn.style.display = 'block'
}

// Upload
uploadBtn.onclick = () => { fileInput.value = ''; fileInput.click() }
fileInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => { const img = new Image(); img.onload = () => { mainImage = img; canvas = null; render() }; img.src = ev.target.result }
  reader.readAsDataURL(f)
}

// Overlay
overlayBtn.onclick = () => { overlayInput.value = ''; overlayInput.click() }
overlayInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => { const img = new Image(); img.onload = () => { overlayImage = img; overlayControls.style.display = 'block'; render() }; img.src = ev.target.result }
  reader.readAsDataURL(f)
}
removeOverlay.onclick = () => { overlayImage = null; overlayControls.style.display = 'none'; render() }

// Toggles
insideBtn.onclick = () => {
  textPosition = 'inside'
  insideBtn.classList.add('active'); outsideBtn.classList.remove('active')
  textColor.value = '#ffffff'; render()
}
outsideBtn.onclick = () => {
  textPosition = 'outside'
  outsideBtn.classList.add('active'); insideBtn.classList.remove('active')
  textColor.value = '#000000'; render()
}
fmtJpg.onclick = () => { downloadFmt='jpg'; fmtJpg.classList.add('active'); fmtPng.classList.remove('active') }
fmtPng.onclick = () => { downloadFmt='png'; fmtPng.classList.add('active'); fmtJpg.classList.remove('active') }

topText.oninput = render
bottomText.oninput = render
fontSize.oninput = () => { fontSizeVal.textContent = fontSize.value; render() }
textColor.oninput = render
strokeColor.oninput = render
overlaySize.oninput = () => { overlaySizeVal.textContent = overlaySize.value; render() }

// Templates
templateBtn.onclick = async () => {
  document.getElementById('templateModal').style.display = 'flex'
  if (allTemplates.length) { filteredTemplates = allTemplates; showPage(0); return }
  document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#9A8A7A;font-size:13px;grid-column:1/-1;font-family:\'DM Sans\',sans-serif">Loading templates…</p>'
  try {
    const res = await fetch('https://api.imgflip.com/get_memes')
    const json = await res.json()
    allTemplates = json.data.memes
    filteredTemplates = allTemplates
    showPage(0)
  } catch {
    document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#C84B31;font-size:13px;grid-column:1/-1">Failed to load. Check your connection.</p>'
  }
}
document.getElementById('closeModal').onclick = () => { document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateModal').onclick = e => { if (e.target === document.getElementById('templateModal')) document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateSearch').oninput = e => {
  const q = e.target.value.toLowerCase().trim()
  filteredTemplates = q ? allTemplates.filter(m => m.name.toLowerCase().includes(q)) : allTemplates
  showPage(0)
}
document.getElementById('prevPage').onclick = () => { if (templatePage > 0) showPage(templatePage - 1) }
document.getElementById('nextPage').onclick = () => { if ((templatePage + 1) * PER_PAGE < filteredTemplates.length) showPage(templatePage + 1) }

function showPage(page) {
  templatePage = page
  const total = filteredTemplates.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const slice = filteredTemplates.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  document.getElementById('templateGrid').innerHTML = slice.map(m =>
    `<div class="meme-template-item" data-url="${m.url}"><img src="${m.url}" alt="${m.name}" loading="lazy"><span>${m.name}</span></div>`
  ).join('')
  document.getElementById('templateGrid').querySelectorAll('.meme-template-item').forEach(item => {
    item.onclick = () => {
      const img = new Image(); img.crossOrigin = 'anonymous'
      img.onload = () => { mainImage = img; canvas = null; render(); document.getElementById('templateModal').style.display = 'none' }
      img.onerror = () => { const i2 = new Image(); i2.onload = () => { mainImage = i2; canvas = null; render(); document.getElementById('templateModal').style.display = 'none' }; i2.src = item.dataset.url }
      img.src = item.dataset.url
    }
  })
  const pag = document.getElementById('pagination')
  if (totalPages > 1) {
    pag.style.display = 'flex'
    document.getElementById('pageInfo').textContent = `Page ${page + 1} of ${totalPages}`
    document.getElementById('prevPage').disabled = page === 0
    document.getElementById('nextPage').disabled = page >= totalPages - 1
  } else { pag.style.display = 'none' }
}

// Draw word-wrapped text on canvas
function drawText(text, centerX, centerY, maxW, fs, fillColor, strokeColor) {
  if (!text) return
  ctx.font = `900 ${fs}px Impact, Arial Black, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Word wrap
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w } else line = test
  }
  lines.push(line)

  const lineH = fs * 1.3
  const totalH = lines.length * lineH
  lines.forEach((l, i) => {
    const y = centerY - totalH / 2 + i * lineH + lineH / 2
    ctx.lineWidth = Math.max(fs / 7, 3)
    ctx.strokeStyle = strokeColor
    ctx.strokeText(l, centerX, y)
    ctx.fillStyle = fillColor
    ctx.fillText(l, centerX, y)
  })
}

// Measure how tall wrapped text will be
function textBlockHeight(text, maxW, fs) {
  if (!text) return 0
  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = `900 ${fs}px Impact, Arial Black, sans-serif`
  const words = text.split(' ')
  let lines = 1, line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (tmp.measureText(test).width > maxW && line) { lines++; line = w } else line = test
  }
  return lines * fs * 1.3
}

// Main render
function render() {
  if (!mainImage) return
  showControls()
  downloadBtn.disabled = false

  const fs = parseInt(fontSize.value)
  const tc = textColor.value
  const sc = strokeColor.value
  const top = topText.value.trim().toUpperCase()
  const bot = bottomText.value.trim().toUpperCase()
  const ovSz = parseInt(overlaySize.value) / 100
  const W = mainImage.naturalWidth
  const H = mainImage.naturalHeight
  const maxW = W * 0.92
  const pad = fs * 0.6  // padding inside bands

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'max-width:100%;border-radius:6px;display:block'
    previewBox.innerHTML = ''
    previewBox.appendChild(canvas)
    setupDrag()
  }

  // Calculate band heights for outside mode
  let topBand = 0, botBand = 0
  if (textPosition === 'outside') {
    if (top) topBand = textBlockHeight(top, maxW, fs) + pad * 2
    if (bot) botBand = textBlockHeight(bot, maxW, fs) + pad * 2
  }

  canvas.width = W
  canvas.height = H + topBand + botBand
  ctx = canvas.getContext('2d')

  // Fill background white (for outside bands)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, canvas.height)

  // Draw image
  ctx.drawImage(mainImage, 0, topBand, W, H)

  if (textPosition === 'inside') {
    // Inside: white text + black stroke, anchored near top/bottom edges
    const topY = topBand + fs * 0.7 + pad
    const botY = topBand + H - pad - textBlockHeight(bot, maxW, fs) * 0.5 + fs * 0.1
    drawText(top, W / 2, topY, maxW, fs, tc, sc)
    drawText(bot, W / 2, botY, maxW, fs, tc, sc)
  } else {
    // Outside: black text on white band, centered vertically in each band
    if (top) {
      const bh = textBlockHeight(top, maxW, fs)
      drawText(top, W / 2, (topBand) / 2, maxW, fs, '#000000', '#ffffff')
    }
    if (bot) {
      const bh = textBlockHeight(bot, maxW, fs)
      drawText(bot, W / 2, topBand + H + botBand / 2, maxW, fs, '#000000', '#ffffff')
    }
  }

  // Draw overlay
  if (overlayImage) {
    const ow = W * ovSz
    const oh = (overlayImage.naturalHeight / overlayImage.naturalWidth) * ow
    ctx.drawImage(overlayImage, overlayX * W - ow / 2, overlayY * canvas.height - oh / 2, ow, oh)
  }
}

function setupDrag() {
  canvas.addEventListener('mousedown', e => {
    if (!overlayImage) return
    isDragging = true
  })
  window.addEventListener('mousemove', e => {
    if (!isDragging) return
    const rect = canvas.getBoundingClientRect()
    overlayX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    render()
  })
  window.addEventListener('mouseup', () => { isDragging = false })
  canvas.addEventListener('touchstart', e => { if (!overlayImage) return; isDragging = true; e.preventDefault() }, { passive: false })
  window.addEventListener('touchmove', e => {
    if (!isDragging) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    overlayX = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height))
    render()
  }, { passive: true })
  window.addEventListener('touchend', () => { isDragging = false })
}

downloadBtn.onclick = () => {
  if (!canvas) return
  const mime = downloadFmt === 'png' ? 'image/png' : 'image/jpeg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${downloadFmt}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

;(function injectSEO() {
  const s = t.seo?.['meme-generator']
  if (!s) return
  const sec = document.createElement('section')
  sec.className = 'seo-section'
  sec.innerHTML = `
    <h2>${s.h2a||''}</h2>
    <ol>${(s.steps||[]).map(st=>`<li>${st}</li>`).join('')}</ol>
    <h2>${s.h2b||''}</h2>${s.body||''}
    <h3>${s.h3why||''}</h3><p>${s.why||''}</p>
    <h3>Frequently Asked Questions</h3>
    ${(s.faqs||[]).map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}
    <div class="seo-links">${(s.links||[]).map(l=>`<a href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.getElementById('app').appendChild(sec)
})()