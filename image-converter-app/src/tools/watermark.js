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
    .ctrl-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:12px; }
    .ctrl-label { font-size:12px; font-weight:600; color:#5A4A3A; font-family:'DM Sans',sans-serif; min-width:80px; }
    .ctrl-input { padding:8px 12px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:13px; font-family:'DM Sans',sans-serif; background:#fff; color:#2C1810; outline:none; flex:1; min-width:0; }
    .ctrl-input:focus { border-color:#C84B31; }
    .pos-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
    .pos-btn { padding:8px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:11px; font-weight:600; color:#5A4A3A; background:#fff; cursor:pointer; text-align:center; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .pos-btn:hover, .pos-btn.active { border-color:#C84B31; color:#C84B31; background:#FDE8E3; }
    #previewCanvas { max-width:100%; border-radius:8px; display:block; margin:0 auto 16px; }
    input[type=range] { flex:1; accent-color:#C84B31; }
  `
  document.head.appendChild(style)
}

document.title = 'Add Watermark to Image Free | No Upload — RelahConvert'
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Add <em style="font-style:italic; color:#C84B31;">Watermark</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Add text watermark to any image free. Files never leave your device.</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> Select Image</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop image anywhere</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="controls" style="display:none;">
      <canvas id="previewCanvas"></canvas>
      <div style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <div class="ctrl-row">
          <span class="ctrl-label">Text</span>
          <input class="ctrl-input" type="text" id="wmText" value="© RelahConvert" placeholder="Your watermark text" />
        </div>
        <div class="ctrl-row">
          <span class="ctrl-label">Color</span>
          <input type="color" id="wmColor" value="#ffffff" style="width:44px; height:36px; border:1.5px solid #DDD5C8; border-radius:8px; cursor:pointer; padding:2px;" />
          <span class="ctrl-label" style="margin-left:8px;">Opacity</span>
          <input type="range" id="wmOpacity" min="10" max="100" value="60" />
          <span id="opacityVal" style="font-size:12px; color:#9A8A7A; min-width:32px; font-family:'DM Sans',sans-serif;">60%</span>
        </div>
        <div class="ctrl-row">
          <span class="ctrl-label">Size</span>
          <input type="range" id="wmSize" min="10" max="100" value="30" />
          <span id="sizeVal" style="font-size:12px; color:#9A8A7A; min-width:32px; font-family:'DM Sans',sans-serif;">30px</span>
        </div>
        <div style="margin-bottom:8px;">
          <div class="ctrl-label" style="margin-bottom:8px;">Position</div>
          <div class="pos-grid">
            <button class="pos-btn" data-pos="top-left">↖ Top Left</button>
            <button class="pos-btn" data-pos="top-center">↑ Top Center</button>
            <button class="pos-btn" data-pos="top-right">↗ Top Right</button>
            <button class="pos-btn" data-pos="middle-left">← Middle Left</button>
            <button class="pos-btn active" data-pos="center">⊙ Center</button>
            <button class="pos-btn" data-pos="middle-right">→ Middle Right</button>
            <button class="pos-btn" data-pos="bottom-left">↙ Bottom Left</button>
            <button class="pos-btn" data-pos="bottom-center">↓ Bottom Center</button>
            <button class="pos-btn" data-pos="bottom-right">↘ Bottom Right</button>
          </div>
        </div>
      </div>
      <button class="opt-btn" id="applyBtn">Apply Watermark & Download</button>
      <a class="download-btn" id="downloadLink">Download Watermarked Image</a>
    </div>
  </div>
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const controls = document.getElementById('controls')
const previewCanvas = document.getElementById('previewCanvas')
const applyBtn = document.getElementById('applyBtn')
const downloadLink = document.getElementById('downloadLink')
const wmText = document.getElementById('wmText')
const wmColor = document.getElementById('wmColor')
const wmOpacity = document.getElementById('wmOpacity')
const wmSize = document.getElementById('wmSize')
const opacityVal = document.getElementById('opacityVal')
const sizeVal = document.getElementById('sizeVal')

let originalImg = null
let originalFile = null
let selectedPos = 'center'

document.querySelectorAll('.pos-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedPos = btn.dataset.pos
    renderPreview()
  })
})

wmOpacity.addEventListener('input', () => { opacityVal.textContent = wmOpacity.value + '%'; renderPreview() })
wmSize.addEventListener('input', () => { sizeVal.textContent = wmSize.value + 'px'; renderPreview() })
wmText.addEventListener('input', renderPreview)
wmColor.addEventListener('input', renderPreview)

function getPos(pos, cw, ch, tw, th, padding) {
  const map = {
    'top-left':      { x: padding, y: padding + th },
    'top-center':    { x: cw / 2 - tw / 2, y: padding + th },
    'top-right':     { x: cw - padding - tw, y: padding + th },
    'middle-left':   { x: padding, y: ch / 2 + th / 2 },
    'center':        { x: cw / 2 - tw / 2, y: ch / 2 + th / 2 },
    'middle-right':  { x: cw - padding - tw, y: ch / 2 + th / 2 },
    'bottom-left':   { x: padding, y: ch - padding },
    'bottom-center': { x: cw / 2 - tw / 2, y: ch - padding },
    'bottom-right':  { x: cw - padding - tw, y: ch - padding },
  }
  return map[pos] || map['center']
}

function renderPreview() {
  if (!originalImg) return
  // Scale down for preview
  const maxW = 660
  const scale = Math.min(1, maxW / originalImg.naturalWidth)
  const w = Math.round(originalImg.naturalWidth * scale)
  const h = Math.round(originalImg.naturalHeight * scale)
  previewCanvas.width = w
  previewCanvas.height = h
  const ctx = previewCanvas.getContext('2d')
  ctx.drawImage(originalImg, 0, 0, w, h)
  drawWatermark(ctx, w, h, scale)
}

function drawWatermark(ctx, cw, ch, scale = 1) {
  const text = wmText.value || '© Watermark'
  const fontSize = Math.round(parseInt(wmSize.value) * scale)
  const opacity = parseInt(wmOpacity.value) / 100
  const color = wmColor.value
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = `bold ${fontSize}px 'DM Sans', Arial, sans-serif`
  ctx.fillStyle = color
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = Math.round(4 * scale)
  const tw = ctx.measureText(text).width
  const th = fontSize
  const padding = Math.round(20 * scale)
  const { x, y } = getPos(selectedPos, cw, ch, tw, th, padding)
  ctx.fillText(text, x, y)
  ctx.restore()
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const img = new Image()
  img.onload = () => {
    originalImg = img
    renderPreview()
    controls.style.display = 'block'
    downloadLink.style.display = 'none'
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