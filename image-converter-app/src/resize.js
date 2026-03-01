import JSZip from 'jszip'
import { formatSize, fileKey, totalBytes, sanitizeBaseName, uniqueName, LIMITS } from './core/utils.js'
import { injectHeader } from './core/header.js'

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
    #resizeBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #resizeBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .tab-btn { flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; color:#9A8A7A; }
    .tab-btn.active { background:#C84B31; color:#fff; }
    .tab-btn:not(.active):hover { background:#F0E8DF; color:#2C1810; }
    .preset-btn { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; background:#fff; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
    .preset-btn:hover { border-color:#C84B31; color:#C84B31; }
    .preset-btn.active { border-color:#C84B31; background:#C84B31; color:#fff; }
    input[type=number]:focus { outline:none; border-color:#C84B31 !important; box-shadow: 0 0 0 3px rgba(200,75,49,0.12); }
    input[type=checkbox] { accent-color:#C84B31; width:15px; height:15px; cursor:pointer; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
  `
  document.head.appendChild(style)
}

document.title = 'Image Resizer — Resize JPG and PNG Free'

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        Image <em style="font-style:italic; color:#C84B31;">Resizer</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Resize JPG and PNG images free. Files never leave your device.</p>
    </div>

    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> Select Images
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop images anywhere</span>
    </div>

    <input type="file" id="fileInput" multiple accept="image/jpeg,image/png" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>

    <div id="resizePanel" style="background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">Resize Options</div>
      <div style="display:flex; gap:6px; background:#F5F0E8; border-radius:10px; padding:4px; margin-bottom:16px;">
        <button class="tab-btn active" id="tabPixels">By Pixels</button>
        <button class="tab-btn" id="tabPercent">By Percentage</button>
      </div>
      <div id="pixelsPanel">
        <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:12px;">
          <div style="flex:1;">
            <label style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:6px;">Width (px)</label>
            <input type="number" id="widthInput" min="1" max="10000" placeholder="e.g. 800" style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          </div>
          <div style="padding-bottom:12px; color:#9A8A7A; font-size:18px;">×</div>
          <div style="flex:1;">
            <label style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:6px;">Height (px)</label>
            <input type="number" id="heightInput" min="1" max="10000" placeholder="e.g. 600" style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          </div>
        </div>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#555; cursor:pointer;">
          <input type="checkbox" id="aspectLock" />
          Maintain aspect ratio
        </label>
      </div>
      <div id="percentPanel" style="display:none;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="preset-btn" data-pct="25">25% smaller</button>
          <button class="preset-btn" data-pct="50">50% smaller</button>
          <button class="preset-btn" data-pct="75">75% smaller</button>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size:13px; color:#555; white-space:nowrap;">Custom %</label>
          <input type="number" id="customPct" min="1" max="1000" placeholder="e.g. 60" style="width:100px; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          <span style="font-size:13px; color:#9A8A7A;">of original size</span>
        </div>
      </div>
    </div>

    <button id="resizeBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">Resize Images</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>

    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">What's next?</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="next-link" data-href="/compress">Compress Image</button>
        <button class="next-link" data-href="/jpg-to-png">Convert to PNG</button>
        <button class="next-link" data-href="/jpg-to-webp">Convert to WebP</button>
      </div>
    </div>
  </div>
`

// Inject All Tools nav
injectHeader()

const fileInput = document.getElementById('fileInput')
const resizeBtn = document.getElementById('resizeBtn')
const downloadLink = document.getElementById('downloadLink')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const nextSteps = document.getElementById('nextSteps')
const tabPixels = document.getElementById('tabPixels')
const tabPercent = document.getElementById('tabPercent')
const pixelsPanel = document.getElementById('pixelsPanel')
const percentPanel = document.getElementById('percentPanel')
const widthInput = document.getElementById('widthInput')
const heightInput = document.getElementById('heightInput')
const aspectLock = document.getElementById('aspectLock')
const customPct = document.getElementById('customPct')

let selectedFiles = []
let currentDownloadUrl = null
let activeTab = 'pixels'
let selectedPct = null
let resizedBlobs = []

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
}

async function saveFilesToIDB(files) {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  store.clear()
  files.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}

tabPixels.addEventListener('click', () => {
  activeTab = 'pixels'
  tabPixels.classList.add('active')
  tabPercent.classList.remove('active')
  pixelsPanel.style.display = 'block'
  percentPanel.style.display = 'none'
})

tabPercent.addEventListener('click', () => {
  activeTab = 'percent'
  tabPercent.classList.add('active')
  tabPixels.classList.remove('active')
  percentPanel.style.display = 'block'
  pixelsPanel.style.display = 'none'
})

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedPct = parseInt(btn.getAttribute('data-pct'))
    customPct.value = 100 - selectedPct
  })
})

customPct.addEventListener('input', () => {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
  selectedPct = null
})

let aspectRatio = null
widthInput.addEventListener('input', () => {
  if (aspectLock.checked && aspectRatio && widthInput.value) {
    heightInput.value = Math.round(widthInput.value / aspectRatio)
  }
})
heightInput.addEventListener('input', () => {
  if (aspectLock.checked && aspectRatio && heightInput.value) {
    widthInput.value = Math.round(heightInput.value * aspectRatio)
  }
})

function cleanupOldUrl() {
  if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null }
}

function showWarning(msg) {
  warning.style.display = 'block'
  warning.textContent = msg
  setTimeout(() => { warning.style.display = 'none' }, 4000)
}

function setDisabled() {
  resizeBtn.disabled = true
  resizeBtn.textContent = 'Resize Images'
  resizeBtn.style.background = '#C4B8A8'
  resizeBtn.style.cursor = 'not-allowed'
  resizeBtn.style.opacity = '0.7'
}
function setIdle() {
  resizeBtn.disabled = false
  resizeBtn.textContent = 'Resize Images'
  resizeBtn.style.background = '#C84B31'
  resizeBtn.style.cursor = 'pointer'
  resizeBtn.style.opacity = '1'
}
function setResizing() {
  resizeBtn.disabled = true
  resizeBtn.textContent = 'Resizing...'
  resizeBtn.style.background = '#9A8A7A'
  resizeBtn.style.cursor = 'not-allowed'
  resizeBtn.style.opacity = '1'
}

function renderPreviews() {
  if (!selectedFiles.length) {
    previewGrid.style.display = 'none'
    previewGrid.innerHTML = ''
    aspectRatio = null
    return
  }

  if (selectedFiles.length === 1) {
    const img = new Image()
    const url = URL.createObjectURL(selectedFiles[0])
    img.onload = () => {
      aspectRatio = img.width / img.height
      widthInput.placeholder = img.width
      heightInput.placeholder = img.height
      URL.revokeObjectURL(url)
    }
    img.src = url
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
      downloadLink.style.display = 'none'
      nextSteps.style.display = 'none'
      renderPreviews()
      if (selectedFiles.length) setIdle(); else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrongFormat = incoming.filter(f => f.type !== 'image/jpeg' && f.type !== 'image/png')
  const tooBig = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size > LIMITS.MAX_PER_FILE_BYTES)

  if (wrongFormat.length) showWarning(`Only JPG and PNG can be resized. ${wrongFormat.length} file(s) were skipped.`)
  if (tooBig.length) showWarning(`${tooBig.length} file(s) are too large and were skipped.`)

  const map = new Map()
  for (const f of [...selectedFiles, ...valid]) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()

  selectedFiles = merged
  cleanupOldUrl()
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

async function resizeFile(file, targetW, targetH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => {
        let w = targetW || img.width
        let h = targetH || img.height
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (file.type === 'image/jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Resize failed'))
          const ext = file.type === 'image/jpeg' ? 'jpg' : 'png'
          const base = sanitizeBaseName(file.name)
          const filename = `${base}-${w}x${h}.${ext}`
          resolve({ blob, filename, outputSize: blob.size, type: file.type })
        }, file.type, file.type === 'image/jpeg' ? 0.92 : undefined)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function getTargetDimensions(file) {
  return new Promise((resolve) => {
    if (activeTab === 'pixels') {
      const w = parseInt(widthInput.value) || null
      const h = parseInt(heightInput.value) || null
      if (!w && !h) return resolve(null)
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let finalW = w || img.width
        let finalH = h || img.height
        if (aspectLock.checked) {
          const ratio = img.width / img.height
          if (w && !h) finalH = Math.round(w / ratio)
          else if (h && !w) finalW = Math.round(h * ratio)
        }
        resolve({ w: finalW, h: finalH })
      }
      img.src = url
    } else {
      const pctVal = parseInt(customPct.value)
      if (!pctVal || pctVal <= 0) return resolve(null)
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const factor = pctVal / 100
        resolve({ w: Math.round(img.width * factor), h: Math.round(img.height * factor) })
      }
      img.src = url
    }
  })
}

function bindNextSteps() {
  nextSteps.querySelectorAll('.next-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      const href = btn.getAttribute('data-href')
      if (!resizedBlobs.length) { window.location.href = href; return }
      try {
        await saveFilesToIDB(resizedBlobs)
        sessionStorage.setItem('pendingFromIDB', '1')
      } catch (e) {}
      window.location.href = href
    })
  })
}

resizeBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return

  if (activeTab === 'pixels' && !widthInput.value && !heightInput.value) {
    showWarning('Please enter a width or height.')
    return
  }
  if (activeTab === 'percent' && !customPct.value) {
    showWarning('Please enter a percentage.')
    return
  }

  setResizing()
  cleanupOldUrl()
  resizedBlobs = []
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'

  try {
    if (selectedFiles.length === 1) {
      const dims = await getTargetDimensions(selectedFiles[0])
      if (!dims) { showWarning('Invalid dimensions.'); setIdle(); return }
      const { blob, filename, outputSize, type } = await resizeFile(selectedFiles[0], dims.w, dims.h)
      resizedBlobs = [{ blob, name: filename, type }]
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = filename
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download (${formatSize(outputSize)})`
    } else {
      const zip = new JSZip()
      const usedNames = new Set()
      for (let i = 0; i < selectedFiles.length; i++) {
        resizeBtn.textContent = `Resizing ${i + 1}/${selectedFiles.length}...`
        const dims = await getTargetDimensions(selectedFiles[i])
        if (!dims) continue
        const { blob, filename, type } = await resizeFile(selectedFiles[i], dims.w, dims.h)
        const safeName = uniqueName(usedNames, filename)
        resizedBlobs.push({ blob, name: safeName, type })
        zip.file(safeName, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = 'resized-images.zip'
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download ZIP (${formatSize(zipBlob.size)})`
    }
    nextSteps.style.display = 'block'
    bindNextSteps()
    setIdle()
    fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Resize error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})