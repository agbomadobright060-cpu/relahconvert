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
    .compare-wrap { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
    .compare-wrap img { width:100%; height:180px; object-fit:cover; border-radius:8px; display:block; }
    .compare-label { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; font-family:'DM Sans',sans-serif; }
    @media(max-width:480px) { .compare-wrap { grid-template-columns:1fr; } }
  `
  document.head.appendChild(style)
}

document.title = 'Convert Image to Grayscale Free | No Upload — RelahConvert'
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Convert to <em style="font-style:italic; color:#C84B31;">Grayscale</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Remove color from any image instantly. Files never leave your device.</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> Select Image</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop image anywhere</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="previewArea" style="display:none; margin-bottom:16px;">
      <div class="compare-wrap">
        <div>
          <div class="compare-label">Original</div>
          <img id="originalImg" src="" alt="original" />
        </div>
        <div>
          <div class="compare-label">Grayscale</div>
          <canvas id="grayCanvas" style="width:100%; height:180px; object-fit:cover; border-radius:8px; display:block;"></canvas>
        </div>
      </div>
    </div>
    <button class="opt-btn" id="applyBtn" disabled>Convert to Grayscale & Download</button>
    <a class="download-btn" id="downloadLink">Download Grayscale Image</a>
  </div>
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const previewArea = document.getElementById('previewArea')
const originalImg = document.getElementById('originalImg')
const grayCanvas = document.getElementById('grayCanvas')
const applyBtn = document.getElementById('applyBtn')
const downloadLink = document.getElementById('downloadLink')

let originalFile = null

function applyGrayscale(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const url = URL.createObjectURL(file)
  originalImg.src = url
  originalImg.onload = () => {
    const gc = applyGrayscale(originalImg)
    // Draw preview into grayCanvas
    grayCanvas.width = gc.width
    grayCanvas.height = gc.height
    const ctx = grayCanvas.getContext('2d')
    ctx.drawImage(gc, 0, 0)
    previewArea.style.display = 'block'
    applyBtn.disabled = false
    downloadLink.style.display = 'none'
  }
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

applyBtn.addEventListener('click', () => {
  if (!originalFile) return
  const canvas = applyGrayscale(originalImg)
  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `grayscale-image.${ext}`
    downloadLink.textContent = `Download Grayscale Image (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})