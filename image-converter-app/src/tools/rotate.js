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
    .opt-btn { padding:11px 24px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .opt-btn.secondary { background:#fff; color:#2C1810; border:1.5px solid #DDD5C8; }
    .opt-btn.secondary:hover { border-color:#C84B31; color:#C84B31; background:#fff; transform:translateY(-1px); }
    .download-btn { display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px; margin-top:12px; }
    .download-btn:hover { background:#1a0f09; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    #previewImg { max-width:100%; max-height:380px; display:block; border-radius:8px; transition:transform 0.3s ease; margin:0 auto; }
    .angle-badge { display:inline-block; background:#FDE8E3; color:#C84B31; font-weight:700; font-size:13px; padding:4px 12px; border-radius:20px; font-family:'DM Sans',sans-serif; margin-left:8px; }

    /* Orientation selector */
    .orient-group { display:flex; gap:10px; justify-content:center; margin-bottom:16px; }
    .orient-btn {
      display:flex; flex-direction:column; align-items:center; gap:8px;
      padding:14px 20px; border-radius:12px; border:2px solid #DDD5C8;
      background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif;
      font-size:13px; font-weight:600; color:#5A4A3A; transition:all 0.18s;
      min-width:90px;
    }
    .orient-btn:hover { border-color:#C84B31; color:#C84B31; }
    .orient-btn.active { border-color:#C84B31; background:#FDE8E3; color:#C84B31; }
    .orient-btn svg { display:block; }

    /* Rotation buttons */
    .rot-group { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:14px; }

    .section-label { font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#9A8A7A; margin-bottom:8px; font-family:'DM Sans',sans-serif; }
  `
  document.head.appendChild(style)
}

document.title = 'Rotate Image Free | No Upload — RelahConvert'
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Rotate <em style="font-style:italic; color:#C84B31;">Image</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Rotate any image free. Files never leave your device.</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> Select Image</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop image anywhere</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />

    <div id="previewArea" style="display:none; margin-bottom:16px;">
      <div style="text-align:center; margin-bottom:16px;">
        <img id="previewImg" src="" alt="preview" />
      </div>

      <!-- Orientation selector -->
      <div class="section-label" style="text-align:center;">Select orientation</div>
      <div class="orient-group">
        <button class="orient-btn" id="orientAll" data-orient="all">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
          </svg>
          All
        </button>
        <button class="orient-btn" id="orientPortrait" data-orient="portrait">
          <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
            <rect x="1" y="1" width="20" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
          </svg>
          Portrait
        </button>
        <button class="orient-btn" id="orientLandscape" data-orient="landscape">
          <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
            <rect x="1" y="1" width="28" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
          </svg>
          Landscape
        </button>
      </div>

      <!-- Rotation buttons -->
      <div class="section-label" style="text-align:center; margin-top:4px;">Rotation</div>
      <div class="rot-group">
        <button class="opt-btn secondary" id="rotL">↺ Left 90°</button>
        <button class="opt-btn secondary" id="rotR">↻ Right 90°</button>
        <button class="opt-btn secondary" id="rot180">↕ 180°</button>
      </div>

      <div style="text-align:center;">
        <span style="font-size:13px; color:#9A8A7A;">Current rotation:</span>
        <span class="angle-badge" id="angleBadge">0°</span>
      </div>
    </div>

    <button class="opt-btn" id="applyBtn" disabled style="width:100%; margin-bottom:10px;">Apply & Download</button>
    <a class="download-btn" id="downloadLink">Download Rotated Image</a>
  </div>
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const previewArea = document.getElementById('previewArea')
const previewImg = document.getElementById('previewImg')
const applyBtn = document.getElementById('applyBtn')
const downloadLink = document.getElementById('downloadLink')
const angleBadge = document.getElementById('angleBadge')

let originalFile = null
let angle = 0
let naturalW = 0
let naturalH = 0
let selectedOrient = 'all' // 'all' | 'portrait' | 'landscape'

// Orientation button logic
const orientBtns = document.querySelectorAll('.orient-btn')
orientBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedOrient = btn.dataset.orient
    orientBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')

    // If image is loaded, auto-rotate to match selected orientation
    if (!originalFile) return
    if (selectedOrient === 'all') return

    const isCurrentlyPortrait = naturalW <= naturalH
    const wantsPortrait = selectedOrient === 'portrait'

    // If orientation doesn't match, rotate 90° right to fix it
    if (isCurrentlyPortrait !== wantsPortrait) {
      updateAngle(90)
    }
  })
})

function updateAngle(deg) {
  angle = ((angle + deg) % 360 + 360) % 360
  angleBadge.textContent = angle + '°'
  previewImg.style.transform = `rotate(${angle}deg)`
  if (angle === 90 || angle === 270) {
    previewImg.style.maxHeight = '300px'
    previewImg.style.maxWidth = '300px'
  } else {
    previewImg.style.maxHeight = '380px'
    previewImg.style.maxWidth = '100%'
  }
}

document.getElementById('rotL').addEventListener('click', () => updateAngle(-90))
document.getElementById('rotR').addEventListener('click', () => updateAngle(90))
document.getElementById('rot180').addEventListener('click', () => updateAngle(180))

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  angle = 0
  angleBadge.textContent = '0°'
  previewImg.style.transform = 'rotate(0deg)'
  previewImg.style.maxHeight = '380px'
  previewImg.style.maxWidth = '100%'
  previewImg.onload = () => {
    naturalW = previewImg.naturalWidth
    naturalH = previewImg.naturalHeight
  }
  previewImg.src = URL.createObjectURL(file)
  previewArea.style.display = 'block'
  applyBtn.disabled = false
  downloadLink.style.display = 'none'

  // Reset orientation selection
  selectedOrient = 'all'
  orientBtns.forEach(b => b.classList.remove('active'))
  document.getElementById('orientAll').classList.add('active')
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

applyBtn.addEventListener('click', () => {
  if (!originalFile) return
  const img = previewImg
  const rad = (angle * Math.PI) / 180
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const w = img.naturalWidth
  const h = img.naturalHeight
  const newW = Math.round(w * cos + h * sin)
  const newH = Math.round(w * sin + h * cos)

  const canvas = document.createElement('canvas')
  canvas.width = newW
  canvas.height = newH
  const ctx = canvas.getContext('2d')
  ctx.translate(newW / 2, newH / 2)
  ctx.rotate(rad)
  ctx.drawImage(img, -w / 2, -h / 2)

  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `rotated-${angle}deg.${ext}`
    downloadLink.textContent = `Download Rotated Image (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})