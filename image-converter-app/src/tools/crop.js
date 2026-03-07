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
    .download-btn { display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px; margin-bottom:10px; }
    .download-btn:hover { background:#1a0f09; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    .preview-wrap { position:relative; display:inline-block; max-width:100%; }
    .preview-wrap img { max-width:100%; max-height:400px; display:block; border-radius:8px; }
    #cropBox { position:absolute; border:2px solid #C84B31; background:rgba(200,75,49,0.08); cursor:move; box-sizing:border-box; }
    #cropBox::after { content:''; position:absolute; inset:0; }
    .crop-handle { position:absolute; width:10px; height:10px; background:#C84B31; border-radius:2px; }
    .crop-handle.nw { top:-5px; left:-5px; cursor:nw-resize; }
    .crop-handle.ne { top:-5px; right:-5px; cursor:ne-resize; }
    .crop-handle.sw { bottom:-5px; left:-5px; cursor:sw-resize; }
    .crop-handle.se { bottom:-5px; right:-5px; cursor:se-resize; }
    .info-text { font-size:12px; color:#9A8A7A; font-family:'DM Sans',sans-serif; margin-top:8px; }
  `
  document.head.appendChild(style)
}

document.title = 'Crop Image Free | No Upload — RelahConvert'
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Crop <em style="font-style:italic; color:#C84B31;">Image</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Crop any image free. Drag to select area. Files never leave your device.</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> Select Image</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop image anywhere</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="previewArea" style="display:none; margin-bottom:16px;">
      <div class="preview-wrap" id="previewWrap">
        <img id="previewImg" src="" alt="preview" />
        <div id="cropBox">
          <div class="crop-handle nw" data-dir="nw"></div>
          <div class="crop-handle ne" data-dir="ne"></div>
          <div class="crop-handle sw" data-dir="sw"></div>
          <div class="crop-handle se" data-dir="se"></div>
        </div>
      </div>
      <p class="info-text" id="cropInfo">Drag the box to adjust crop area</p>
    </div>
    <button class="opt-btn" id="cropBtn" disabled>Crop Image</button>
    <a class="download-btn" id="downloadLink">Download Cropped Image</a>
  </div>
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const previewArea = document.getElementById('previewArea')
const previewImg = document.getElementById('previewImg')
const previewWrap = document.getElementById('previewWrap')
const cropBox = document.getElementById('cropBox')
const cropBtn = document.getElementById('cropBtn')
const downloadLink = document.getElementById('downloadLink')
const cropInfo = document.getElementById('cropInfo')

let originalFile = null
let imgNaturalW = 0, imgNaturalH = 0
let displayW = 0, displayH = 0

// Crop box state (in display px)
let box = { x: 0, y: 0, w: 0, h: 0 }
let dragState = null // { type: 'move'|'nw'|'ne'|'sw'|'se', startX, startY, startBox }

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function applyBox() {
  cropBox.style.left = box.x + 'px'
  cropBox.style.top = box.y + 'px'
  cropBox.style.width = box.w + 'px'
  cropBox.style.height = box.h + 'px'
  const scaleX = imgNaturalW / displayW
  const scaleY = imgNaturalH / displayH
  const rx = Math.round(box.x * scaleX)
  const ry = Math.round(box.y * scaleY)
  const rw = Math.round(box.w * scaleX)
  const rh = Math.round(box.h * scaleY)
  cropInfo.textContent = `Crop area: ${rw} × ${rh} px`
}

function initBox() {
  const pad = 20
  box = { x: pad, y: pad, w: displayW - pad * 2, h: displayH - pad * 2 }
  applyBox()
}

previewImg.onload = () => {
  displayW = previewImg.offsetWidth
  displayH = previewImg.offsetHeight
  imgNaturalW = previewImg.naturalWidth
  imgNaturalH = previewImg.naturalHeight
  initBox()
  cropBtn.disabled = false
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const url = URL.createObjectURL(file)
  previewImg.src = url
  previewArea.style.display = 'block'
  downloadLink.style.display = 'none'
  cropBtn.disabled = false
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

// Drag logic
cropBox.addEventListener('mousedown', e => {
  const dir = e.target.dataset.dir
  dragState = { type: dir || 'move', startX: e.clientX, startY: e.clientY, startBox: { ...box } }
  e.preventDefault()
})

document.addEventListener('mousemove', e => {
  if (!dragState) return
  const dx = e.clientX - dragState.startX
  const dy = e.clientY - dragState.startY
  const sb = dragState.startBox
  const MIN = 20

  if (dragState.type === 'move') {
    box.x = clamp(sb.x + dx, 0, displayW - box.w)
    box.y = clamp(sb.y + dy, 0, displayH - box.h)
  } else if (dragState.type === 'se') {
    box.w = clamp(sb.w + dx, MIN, displayW - box.x)
    box.h = clamp(sb.h + dy, MIN, displayH - box.y)
  } else if (dragState.type === 'sw') {
    const newW = clamp(sb.w - dx, MIN, sb.x + sb.w)
    box.x = sb.x + sb.w - newW
    box.w = newW
    box.h = clamp(sb.h + dy, MIN, displayH - box.y)
  } else if (dragState.type === 'ne') {
    box.w = clamp(sb.w + dx, MIN, displayW - box.x)
    const newH = clamp(sb.h - dy, MIN, sb.y + sb.h)
    box.y = sb.y + sb.h - newH
    box.h = newH
  } else if (dragState.type === 'nw') {
    const newW = clamp(sb.w - dx, MIN, sb.x + sb.w)
    box.x = sb.x + sb.w - newW
    box.w = newW
    const newH = clamp(sb.h - dy, MIN, sb.y + sb.h)
    box.y = sb.y + sb.h - newH
    box.h = newH
  }
  applyBox()
})

document.addEventListener('mouseup', () => { dragState = null })

// Touch support
cropBox.addEventListener('touchstart', e => {
  const dir = e.target.dataset.dir
  const touch = e.touches[0]
  dragState = { type: dir || 'move', startX: touch.clientX, startY: touch.clientY, startBox: { ...box } }
  e.preventDefault()
}, { passive: false })

document.addEventListener('touchmove', e => {
  if (!dragState) return
  const touch = e.touches[0]
  const dx = touch.clientX - dragState.startX
  const dy = touch.clientY - dragState.startY
  const sb = dragState.startBox
  const MIN = 20
  if (dragState.type === 'move') {
    box.x = clamp(sb.x + dx, 0, displayW - box.w)
    box.y = clamp(sb.y + dy, 0, displayH - box.h)
  } else if (dragState.type === 'se') {
    box.w = clamp(sb.w + dx, MIN, displayW - box.x)
    box.h = clamp(sb.h + dy, MIN, displayH - box.y)
  }
  applyBox()
  e.preventDefault()
}, { passive: false })

document.addEventListener('touchend', () => { dragState = null })

cropBtn.addEventListener('click', () => {
  if (!originalFile) return
  const scaleX = imgNaturalW / displayW
  const scaleY = imgNaturalH / displayH
  const sx = Math.round(box.x * scaleX)
  const sy = Math.round(box.y * scaleY)
  const sw = Math.round(box.w * scaleX)
  const sh = Math.round(box.h * scaleY)

  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')
  ctx.drawImage(previewImg, sx, sy, sw, sh, 0, 0, sw, sh)

  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `cropped-image.${ext}`
    downloadLink.textContent = `Download Cropped Image (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})