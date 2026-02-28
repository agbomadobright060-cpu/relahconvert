import JSZip from 'jszip'
import { formatSize, fileKey, totalBytes, sanitizeBaseName, uniqueName, LIMITS } from './core/utils.js'

const bg = '#F2F2F2'

if (document.head) {
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    #compressBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #compressBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .result-bar { background:#fff; border-radius:14px; padding:20px 24px; box-shadow:0 2px 12px rgba(0,0,0,0.07); display:flex; align-items:center; gap:24px; }
    .savings-circle { flex-shrink:0; }
    .savings-circle svg { transform: rotate(-90deg); }
    .savings-circle .circle-bg { fill:none; stroke:#F0E8DF; stroke-width:8; }
    .savings-circle .circle-fill { fill:none; stroke:#C84B31; stroke-width:8; stroke-linecap:round; stroke-dasharray:226; transition: stroke-dashoffset 1s ease; }
    .circle-label { font-family:'Fraunces',serif; font-weight:900; font-size:15px; color:#2C1810; text-anchor:middle; dominant-baseline:middle; }
    .result-stats { flex:1; }
    .result-saved { font-size:14px; color:#2C1810; margin:0 0 4px; font-weight:400; }
    .result-sizes { font-size:13px; color:#7A6A5A; display:flex; align-items:center; gap:8px; }
    .result-arrow { color:#C84B31; font-size:16px; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
  `
  document.head.appendChild(style)
}

document.title = 'Image Compressor — Compress JPG, PNG and WebP Free'

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        Image <em style="font-style:italic; color:#C84B31;">Compressor</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Compress JPG, PNG and WebP images free. Files never leave your device.</p>
    </div>

    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> Select Images
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop images anywhere</span>
    </div>

    <input type="file" id="fileInput" multiple accept="image/jpeg,image/webp,image/png" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>

    <button id="compressBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">Compress Images</button>

    <div id="resultBar" style="display:none; margin-bottom:12px;"></div>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>

    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">What's next?</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="next-link" data-href="/jpg-to-png">Convert to PNG</button>
        <button class="next-link" data-href="/jpg-to-webp">Convert to WebP</button>
        <button class="next-link" data-href="/png-to-jpg">Convert to JPG</button>
      </div>
    </div>
  </div>
`

const fileInput = document.getElementById('fileInput')
const compressBtn = document.getElementById('compressBtn')
const downloadLink = document.getElementById('downloadLink')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const resultBar = document.getElementById('resultBar')
const nextSteps = document.getElementById('nextSteps')

let selectedFiles = []
let currentDownloadUrl = null
let lastBlob = null

function getOutputMime(mime) {
  if (mime === 'image/png') return 'image/jpeg'
  return mime
}

function getQuality(mime) {
  if (mime === 'image/jpeg') return 0.6
  if (mime === 'image/webp') return 0.65
  return 0.6
}

function setDisabled() {
  compressBtn.disabled = true
  compressBtn.textContent = 'Compress Images'
  compressBtn.style.background = '#C4B8A8'
  compressBtn.style.cursor = 'not-allowed'
  compressBtn.style.opacity = '0.7'
}
function setIdle() {
  compressBtn.disabled = false
  compressBtn.textContent = 'Compress Images'
  compressBtn.style.background = '#C84B31'
  compressBtn.style.cursor = 'pointer'
  compressBtn.style.opacity = '1'
}
function setConverting() {
  compressBtn.disabled = true
  compressBtn.textContent = 'Compressing...'
  compressBtn.style.background = '#9A8A7A'
  compressBtn.style.cursor = 'not-allowed'
  compressBtn.style.opacity = '1'
}

function cleanupOldUrl() {
  if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null }
}

function showWarning(msg) {
  warning.style.display = 'block'
  warning.textContent = msg
  setTimeout(() => { warning.style.display = 'none' }, 4000)
}

function showResultBar(originalBytes, outputBytes) {
  const saved = Math.max(0, Math.round((1 - outputBytes / originalBytes) * 100))
  const circumference = 226
  const dashOffset = circumference - (circumference * saved / 100)

  resultBar.style.display = 'block'
  resultBar.innerHTML = `
    <div class="result-bar">
      <div class="savings-circle">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle class="circle-bg" cx="36" cy="36" r="30" />
          <circle class="circle-fill" cx="36" cy="36" r="30" style="stroke-dashoffset:${circumference}" id="circleAnim" />
          <text class="circle-label" x="36" y="36" transform="rotate(90,36,36)">${saved}%</text>
        </svg>
      </div>
      <div class="result-stats">
        <p class="result-saved">Your ${selectedFiles.length > 1 ? 'images are' : 'image is'} ${saved}% smaller!</p>
        <div class="result-sizes">
          <span>${formatSize(originalBytes)}</span>
          <span class="result-arrow">→</span>
          <span style="font-weight:600; color:#2C1810;">${formatSize(outputBytes)}</span>
        </div>
      </div>
    </div>
  `

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const circle = document.getElementById('circleAnim')
      if (circle) circle.style.strokeDashoffset = dashOffset
    })
  })

  nextSteps.style.display = 'block'

  nextSteps.querySelectorAll('.next-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('data-href')
      if (!lastBlob) { window.location.href = href; return }
      const fileName = selectedFiles.length === 1 ? selectedFiles[0].name : 'compressed.jpg'
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          sessionStorage.setItem('pendingFileData', e.target.result)
          sessionStorage.setItem('pendingFileName', fileName)
          sessionStorage.setItem('pendingFileType', lastBlob.type)
        } catch (err) {}
        window.location.href = href
      }
      reader.readAsDataURL(lastBlob)
    })
  })
}

async function compressFile(file) {
  const outputMime = getOutputMime(file.type)
  const quality = getQuality(outputMime)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (outputMime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'))
          const ext = outputMime === 'image/jpeg' ? 'jpg' : 'webp'
          const base = sanitizeBaseName(file.name)
          const filename = `${base}-compressed.${ext}`
          resolve({ blob, filename, originalSize: file.size, outputSize: blob.size })
        }, outputMime, quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function renderPreviews() {
  if (!selectedFiles.length) {
    previewGrid.style.display = 'none'
    previewGrid.innerHTML = ''
    return
  }
  previewGrid.style.display = 'grid'
  previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
  previewGrid.style.gap = '12px'

  previewGrid.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f)
    return `
      <div class="preview-card">
        <img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" />
        <button class="remove-btn" data-index="${i}">✕</button>
        <div class="fname">${f.name}</div>
      </div>`
  }).join('')

  previewGrid.innerHTML += `
    <label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;">
      <span style="font-size:28px;">+</span>
      <span>Add more</span>
    </label>`

  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
      cleanupOldUrl()
      resultBar.style.display = 'none'
      downloadLink.style.display = 'none'
      nextSteps.style.display = 'none'
      renderPreviews()
      if (selectedFiles.length) setIdle(); else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/webp' || f.type === 'image/png') && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrongFormat = incoming.filter(f => f.type !== 'image/jpeg' && f.type !== 'image/webp' && f.type !== 'image/png')
  const tooBig = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/webp' || f.type === 'image/png') && f.size > LIMITS.MAX_PER_FILE_BYTES)

  if (wrongFormat.length) showWarning(`Unsupported format. ${wrongFormat.length} file(s) were skipped.`)
  if (tooBig.length) showWarning(`${tooBig.length} file(s) are too large and were skipped.`)

  const map = new Map()
  for (const f of [...selectedFiles, ...valid]) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()

  selectedFiles = merged
  cleanupOldUrl()
  resultBar.style.display = 'none'
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'
  renderPreviews()
  if (selectedFiles.length) setIdle(); else setDisabled()
}

fileInput.addEventListener('change', () => {
  validateAndAdd(Array.from(fileInput.files || []))
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

compressBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting()
  cleanupOldUrl()
  lastBlob = null
  resultBar.style.display = 'none'
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'

  try {
    if (selectedFiles.length === 1) {
      const { blob, filename, originalSize, outputSize } = await compressFile(selectedFiles[0])
      lastBlob = blob
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = filename
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download (${formatSize(outputSize)})`
      showResultBar(originalSize, outputSize)
    } else {
      const zip = new JSZip()
      const usedNames = new Set()
      let totalOriginal = 0
      let totalOutput = 0

      for (let i = 0; i < selectedFiles.length; i++) {
        compressBtn.textContent = `Compressing ${i + 1}/${selectedFiles.length}...`
        const { blob, filename, originalSize, outputSize } = await compressFile(selectedFiles[i])
        totalOriginal += originalSize
        totalOutput += outputSize
        const safeName = uniqueName(usedNames, filename)
        zip.file(safeName, blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = 'compressed-images.zip'
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download ZIP (${formatSize(zipBlob.size)})`
      showResultBar(totalOriginal, totalOutput)
    }
    setIdle()
    fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Compression error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})