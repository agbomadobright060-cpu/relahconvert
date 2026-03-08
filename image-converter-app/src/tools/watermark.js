import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const bg = '#F2F2F2'

if (document.head) {
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }

    .opt-btn { width:100%; padding:13px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; margin-bottom:10px; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .download-btn { display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px; }
    .download-btn:hover { background:#1a0f09; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    .upload-label.secondary { background:#fff; color:#2C1810; border:1.5px solid #DDD5C8; }
    .upload-label.secondary:hover { border-color:#C84B31; color:#C84B31; }

    /* Two column layout */
    .tool-layout { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
    .image-col { background:#fff; border-radius:14px; border:1.5px solid #E8E0D5; min-height:320px; display:flex; align-items:center; justify-content:center; overflow:hidden; padding:16px; }
    #previewCanvas { max-width:100%; max-height:440px; border-radius:6px; display:block; margin:0 auto; }
    .controls-col { background:#fff; border-radius:14px; border:1.5px solid #E8E0D5; padding:20px; font-family:'DM Sans',sans-serif; }
    .controls-col h3 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:0 0 16px; }

    /* Tabs */
    .tab-row { display:flex; gap:0; margin-bottom:16px; border-radius:10px; overflow:hidden; border:1.5px solid #DDD5C8; }
    .tab-btn { flex:1; padding:10px; border:none; background:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#5A4A3A; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:6px; }
    .tab-btn:first-child { border-right:1.5px solid #DDD5C8; }
    .tab-btn.active { background:#FDE8E3; color:#C84B31; }
    .tab-btn:hover:not(.active) { background:#F5F0E8; }

    /* Controls */
    .ctrl-row { display:flex; gap:10px; align-items:center; margin-bottom:12px; }
    .ctrl-label { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.06em; font-family:'DM Sans',sans-serif; margin-bottom:6px; }
    .ctrl-input { width:100%; padding:8px 12px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:13px; font-family:'DM Sans',sans-serif; background:#fff; color:#2C1810; outline:none; box-sizing:border-box; }
    .ctrl-input:focus { border-color:#C84B31; }
    input[type=range] { width:100%; accent-color:#C84B31; margin:4px 0; }
    .range-row { display:flex; align-items:center; gap:8px; }
    .range-val { font-size:12px; color:#9A8A7A; min-width:36px; text-align:right; font-family:'DM Sans',sans-serif; }

    /* Position grid */
    .pos-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
    .pos-btn { padding:7px 4px; border:1.5px solid #DDD5C8; border-radius:7px; font-size:11px; font-weight:600; color:#5A4A3A; background:#fff; cursor:pointer; text-align:center; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .pos-btn:hover, .pos-btn.active { border-color:#C84B31; color:#C84B31; background:#FDE8E3; }

    .divider { height:1px; background:#F0EAE3; margin:14px 0; }
    .section-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#9A8A7A; margin-bottom:8px; font-family:'DM Sans',sans-serif; }

    /* Watermark image preview */
    #wmImgPreview { width:100%; height:70px; object-fit:contain; border-radius:6px; border:1.5px solid #E8E0D5; display:none; margin-bottom:10px; background:#F5F0E8; }

    /* Empty state */
    .empty-state { text-align:center; color:#C4B8A8; font-family:'DM Sans',sans-serif; font-size:13px; }
    .empty-state svg { margin-bottom:10px; opacity:0.4; }

    @media (max-width:700px) {
      .tool-layout { grid-template-columns:1fr; }
      .image-col { min-height:220px; }
    }
  `
  document.head.appendChild(style)
}

document.title = 'Add Watermark to Image Free | No Upload — RelahConvert'
document.querySelector('#app').innerHTML = `
  <div style="max-width:1000px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Add <em style="font-style:italic; color:#C84B31;">Watermark</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0 0 16px;">Add text or image watermark free. Files never leave your device.</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> Select Image</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop image anywhere</span>
      <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    </div>

    <div class="tool-layout" id="toolLayout" style="display:none;">

      <!-- Left: live preview -->
      <div class="image-col">
        <canvas id="previewCanvas"></canvas>
      </div>

      <!-- Right: controls -->
      <div class="controls-col">
        <h3>Watermark Options</h3>

        <!-- Tabs: Text / Image -->
        <div class="tab-row">
          <button class="tab-btn active" id="tabText">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            Add Text
          </button>
          <button class="tab-btn" id="tabImage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Add Image
          </button>
        </div>

        <!-- Text panel -->
        <div id="panelText">
          <div class="section-label">Watermark Text</div>
          <input class="ctrl-input" type="text" id="wmText" value="© Your Brand" placeholder="Enter watermark text" style="margin-bottom:12px;" />

          <div class="ctrl-label">Color</div>
          <div class="ctrl-row" style="margin-bottom:12px;">
            <input type="color" id="wmColor" value="#ffffff" style="width:44px; height:36px; border:1.5px solid #DDD5C8; border-radius:8px; cursor:pointer; padding:2px; flex-shrink:0;" />
            <div style="flex:1;">
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${['#ffffff','#000000','#C84B31','#2563EB','#16A34A','#F59E0B'].map(c =>
                  `<div class="color-swatch" data-color="${c}" style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid #E8E0D5;cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`
                ).join('')}
              </div>
            </div>
          </div>

          <div class="ctrl-label">Font Size</div>
          <div class="range-row" style="margin-bottom:12px;">
            <input type="range" id="wmSize" min="10" max="120" value="36" />
            <span class="range-val" id="sizeVal">36px</span>
          </div>
        </div>

        <!-- Image panel -->
        <div id="panelImage" style="display:none;">
          <div class="section-label">Watermark Image (logo, stamp)</div>
          <img id="wmImgPreview" src="" alt="watermark" />
          <label class="upload-label secondary" for="wmImgInput" style="margin-bottom:12px; justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Upload Logo / Image
          </label>
          <input type="file" id="wmImgInput" accept="image/*" style="display:none;" />

          <div class="ctrl-label">Size</div>
          <div class="range-row" style="margin-bottom:12px;">
            <input type="range" id="wmImgSize" min="5" max="80" value="25" />
            <span class="range-val" id="imgSizeVal">25%</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Opacity (shared) -->
        <div class="ctrl-label">Opacity</div>
        <div class="range-row" style="margin-bottom:14px;">
          <input type="range" id="wmOpacity" min="5" max="100" value="60" />
          <span class="range-val" id="opacityVal">60%</span>
        </div>

        <div class="divider"></div>

        <!-- Position -->
        <div class="section-label">Position</div>
        <div class="pos-grid" style="margin-bottom:16px;">
          <button class="pos-btn" data-pos="top-left">↖ Top Left</button>
          <button class="pos-btn" data-pos="top-center">↑ Top</button>
          <button class="pos-btn" data-pos="top-right">↗ Top Right</button>
          <button class="pos-btn" data-pos="middle-left">← Left</button>
          <button class="pos-btn active" data-pos="center">⊙ Center</button>
          <button class="pos-btn" data-pos="middle-right">→ Right</button>
          <button class="pos-btn" data-pos="bottom-left">↙ Bot Left</button>
          <button class="pos-btn" data-pos="bottom-center">↓ Bottom</button>
          <button class="pos-btn" data-pos="bottom-right">↘ Bot Right</button>
        </div>

        <button class="opt-btn" id="applyBtn">Apply & Download</button>
        <a class="download-btn" id="downloadLink">Download Watermarked Image</a>
      </div>
    </div>
  </div>
`

injectHeader()

const fileInput     = document.getElementById('fileInput')
const toolLayout    = document.getElementById('toolLayout')
const previewCanvas = document.getElementById('previewCanvas')
const applyBtn      = document.getElementById('applyBtn')
const downloadLink  = document.getElementById('downloadLink')
const wmText        = document.getElementById('wmText')
const wmColor       = document.getElementById('wmColor')
const wmOpacity     = document.getElementById('wmOpacity')
const wmSize        = document.getElementById('wmSize')
const wmImgSize     = document.getElementById('wmImgSize')
const opacityVal    = document.getElementById('opacityVal')
const sizeVal       = document.getElementById('sizeVal')
const imgSizeVal    = document.getElementById('imgSizeVal')
const wmImgInput    = document.getElementById('wmImgInput')
const wmImgPreview  = document.getElementById('wmImgPreview')
const panelText     = document.getElementById('panelText')
const panelImage    = document.getElementById('panelImage')
const tabText       = document.getElementById('tabText')
const tabImage      = document.getElementById('tabImage')

let originalImg  = null
let originalFile = null
let watermarkImg = null
let selectedPos  = 'center'
let activeTab    = 'text'

// Tab switching
tabText.addEventListener('click', () => {
  activeTab = 'text'
  tabText.classList.add('active'); tabImage.classList.remove('active')
  panelText.style.display = 'block'; panelImage.style.display = 'none'
  renderPreview()
})
tabImage.addEventListener('click', () => {
  activeTab = 'image'
  tabImage.classList.add('active'); tabText.classList.remove('active')
  panelImage.style.display = 'block'; panelText.style.display = 'none'
  renderPreview()
})

// Color swatches
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    wmColor.value = swatch.dataset.color
    renderPreview()
  })
})

// Position buttons
document.querySelectorAll('.pos-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedPos = btn.dataset.pos
    renderPreview()
  })
})

// Live update listeners
wmText.addEventListener('input', renderPreview)
wmColor.addEventListener('input', renderPreview)
wmOpacity.addEventListener('input', () => { opacityVal.textContent = wmOpacity.value + '%'; renderPreview() })
wmSize.addEventListener('input', () => { sizeVal.textContent = wmSize.value + 'px'; renderPreview() })
wmImgSize.addEventListener('input', () => { imgSizeVal.textContent = wmImgSize.value + '%'; renderPreview() })

// Watermark image upload
wmImgInput.addEventListener('change', () => {
  const file = wmImgInput.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    watermarkImg = img
    wmImgPreview.src = img.src
    wmImgPreview.style.display = 'block'
    renderPreview()
  }
  img.src = URL.createObjectURL(file)
})

function getPos(pos, cw, ch, ew, eh, padding) {
  const map = {
    'top-left':      { x: padding,            y: padding },
    'top-center':    { x: cw/2 - ew/2,        y: padding },
    'top-right':     { x: cw - padding - ew,  y: padding },
    'middle-left':   { x: padding,            y: ch/2 - eh/2 },
    'center':        { x: cw/2 - ew/2,        y: ch/2 - eh/2 },
    'middle-right':  { x: cw - padding - ew,  y: ch/2 - eh/2 },
    'bottom-left':   { x: padding,            y: ch - padding - eh },
    'bottom-center': { x: cw/2 - ew/2,        y: ch - padding - eh },
    'bottom-right':  { x: cw - padding - ew,  y: ch - padding - eh },
  }
  return map[pos] || map['center']
}

function drawWatermark(ctx, cw, ch, scale = 1) {
  const opacity = parseInt(wmOpacity.value) / 100
  const padding = Math.round(20 * scale)
  ctx.save()
  ctx.globalAlpha = opacity

  if (activeTab === 'text') {
    const text = wmText.value || '© Watermark'
    const fontSize = Math.round(parseInt(wmSize.value) * scale)
    ctx.font = `bold ${fontSize}px 'DM Sans', Arial, sans-serif`
    ctx.fillStyle = wmColor.value
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = Math.round(4 * scale)
    const tw = ctx.measureText(text).width
    const th = fontSize
    const { x, y } = getPos(selectedPos, cw, ch, tw, th, padding)
    ctx.fillText(text, x, y + th) // offset y by th since fillText baseline is bottom
  } else if (activeTab === 'image' && watermarkImg) {
    const pct = parseInt(wmImgSize.value) / 100
    const ww = Math.round(cw * pct)
    const wh = Math.round(ww * (watermarkImg.naturalHeight / watermarkImg.naturalWidth))
    const { x, y } = getPos(selectedPos, cw, ch, ww, wh, padding)
    ctx.drawImage(watermarkImg, x, y, ww, wh)
  }

  ctx.restore()
}

function renderPreview() {
  if (!originalImg) return
  const maxW = 580
  const scale = Math.min(1, maxW / originalImg.naturalWidth)
  const w = Math.round(originalImg.naturalWidth * scale)
  const h = Math.round(originalImg.naturalHeight * scale)
  previewCanvas.width = w
  previewCanvas.height = h
  const ctx = previewCanvas.getContext('2d')
  ctx.drawImage(originalImg, 0, 0, w, h)
  drawWatermark(ctx, w, h, scale)
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const img = new Image()
  img.onload = () => {
    originalImg = img
    toolLayout.style.display = 'grid'
    downloadLink.style.display = 'none'
    renderPreview()
  }
  img.src = URL.createObjectURL(file)
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

applyBtn.addEventListener('click', () => {
  if (!originalImg) return
  const canvas = document.createElement('canvas')
  canvas.width = originalImg.naturalWidth
  canvas.height = originalImg.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(originalImg, 0, 0)
  drawWatermark(ctx, canvas.width, canvas.height, 1)

  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `watermarked.${ext}`
    downloadLink.textContent = `Download Watermarked Image (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})