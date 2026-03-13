import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const ui = {
  title:      t.blur_face_title    || 'Blur',
  titleEm:    t.blur_face_title_em || 'Face',
  sub:        t.blur_face_sub      || 'Automatically detect and blur faces in any photo. Private — runs in your browser.',
  uploadBtn:  t.blur_face_upload   || 'Upload Image',
  download:   t.blur_face_download || 'Download Image',
  blurAmount: t.blur_face_amount   || 'Blur Amount',
  detecting:  t.blur_face_detecting|| 'Detecting faces…',
  noFaces:    t.blur_face_none     || 'No faces detected. Try a clearer photo.',
  facesFound: t.blur_face_found    || 'faces detected',
  manualBlur: t.blur_face_manual   || 'Manual Blur',
  autoBlur:   t.blur_face_auto     || 'Auto Detect',
}

if (document.head) {
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:#F2F2F2;'
  const style = document.createElement('style')
  style.textContent = `
    *{box-sizing:border-box}
    .tool-wrap{max-width:1000px;margin:0 auto;padding:24px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:20px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:900;color:#2C1810;margin:0 0 4px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:#C84B31}
    .tool-sub{font-size:13px;color:#7A6A5A;margin:0}

    .bf-upload-area{border:2px dashed #DDD5C8;border-radius:14px;padding:48px 24px;text-align:center;cursor:pointer;transition:all 0.2s;background:#fff}
    .bf-upload-area:hover,.bf-upload-area.drag{border-color:#C84B31;background:#FDF5F3}
    .bf-upload-icon{font-size:40px;margin-bottom:12px}
    .bf-upload-text{font-size:15px;font-weight:700;color:#2C1810;margin:0 0 4px}
    .bf-upload-sub{font-size:12px;color:#9A8A7A;margin:0}
    .bf-upload-btn{margin-top:16px;padding:10px 24px;background:#C84B31;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer}
    .bf-upload-btn:hover{background:#A63D26}

    .bf-layout{display:none;gap:20px;align-items:start}
    .bf-layout.visible{display:grid;grid-template-columns:1fr 260px}
    @media(max-width:700px){.bf-layout.visible{grid-template-columns:1fr}}

    .bf-canvas-wrap{position:relative;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
    .bf-canvas-wrap canvas{display:block;width:100%;height:auto;cursor:crosshair}

    .bf-panel{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:16px}
    .bf-panel-title{font-size:14px;font-weight:700;color:#2C1810;margin:0;font-family:'Fraunces',serif}

    .bf-mode-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .bf-mode-btn{padding:9px 6px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:12px;font-weight:700;color:#2C1810;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center}
    .bf-mode-btn.active{border-color:#C84B31;background:#FDF5F3;color:#C84B31}

    .bf-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px}
    .bf-slider{width:100%;accent-color:#C84B31;cursor:pointer}

    .bf-status{font-size:12px;color:#7A6A5A;background:#F5EDE8;border-radius:8px;padding:10px 12px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}
    .bf-status.error{background:#FDE8E3;color:#C84B31}
    .bf-status.success{background:#E8F5E9;color:#2E7D32}

    .bf-regions{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto}
    .bf-region-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#F8F4F0;border-radius:8px;font-size:12px;color:#2C1810;font-weight:600}
    .bf-region-del{background:none;border:none;color:#C84B31;cursor:pointer;font-size:14px;padding:0 4px;line-height:1}

    .bf-action-row{display:flex;flex-direction:column;gap:8px}
    .bf-download-btn{padding:12px;background:#C84B31;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;width:100%}
    .bf-download-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .bf-reset-btn{padding:10px;background:#fff;color:#7A6A5A;border:1.5px solid #DDD5C8;border-radius:9px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;width:100%}
    .bf-reset-btn:hover{border-color:#C84B31;color:#C84B31}

    #nextSteps{margin-top:4px}
    .seo-section{margin-top:48px;padding-top:32px;border-top:1.5px solid #E8DDD5}
    .seo-section h2{font-family:'Fraunces',serif;font-size:clamp(18px,2.5vw,24px);font-weight:900;color:#2C1810;margin:0 0 16px}
    .seo-section ol{padding-left:20px;color:#5A4A3A;font-size:14px;line-height:1.8}
    .seo-section p{color:#5A4A3A;font-size:14px;line-height:1.7;margin:12px 0}
    .seo-section h3{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:#2C1810;margin:24px 0 8px}
    .faq-item{margin-bottom:14px}
    .faq-q{font-weight:700;color:#2C1810;font-size:14px;margin:0 0 4px}
    .faq-a{color:#5A4A3A;font-size:13px;line-height:1.6;margin:0}
    .also-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .also-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:12px;font-weight:600;color:#2C1810;text-decoration:none;transition:all 0.15s}
    .also-link:hover{border-color:#C84B31;color:#C84B31}
  `
  document.head.appendChild(style)
}

injectHeader()

const app = document.querySelector('#app')
app.innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">${ui.title} <em class="brand-em">${ui.titleEm}</em></h1>
    <p class="tool-sub">${ui.sub}</p>
  </div>

  <div class="bf-upload-area" id="uploadArea">
    <div class="bf-upload-icon">🫥</div>
    <p class="bf-upload-text">Drop your image here</p>
    <p class="bf-upload-sub">JPG, PNG, WebP supported</p>
    <button class="bf-upload-btn" id="uploadBtn">${ui.uploadBtn}</button>
    <input type="file" id="fileInput" accept="image/*" style="display:none">
  </div>

  <div class="bf-layout" id="bfLayout">
    <div class="bf-canvas-wrap">
      <canvas id="bfCanvas"></canvas>
    </div>

    <div class="bf-panel">
      <p class="bf-panel-title">Blur Editor</p>

      <div>
        <p class="bf-label">Mode</p>
        <div class="bf-mode-row">
          <button class="bf-mode-btn active" id="autoBtn">${ui.autoBlur}</button>
          <button class="bf-mode-btn" id="manualBtn">${ui.manualBlur}</button>
        </div>
      </div>

      <div>
        <p class="bf-label">${ui.blurAmount}: <span id="blurVal">18</span>px</p>
        <input type="range" class="bf-slider" id="blurSlider" min="4" max="40" value="18">
      </div>

      <div class="bf-status" id="bfStatus">${ui.detecting}</div>

      <div id="regionsList" style="display:none">
        <p class="bf-label">Blurred Regions</p>
        <div class="bf-regions" id="regionsContainer"></div>
      </div>

      <div class="bf-action-row">
        <button class="bf-download-btn" id="downloadBtn">⬇ ${ui.download}</button>
        <button class="bf-reset-btn" id="resetBtn">↺ Upload New Image</button>
        <div id="nextSteps" style="display:none">
          <div style="font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">${t.whats_next||"What's Next?"}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px" id="nextStepsButtons"></div>
        </div>
      </div>
    </div>
  </div>
</div>
`

// ── State ──
let sourceImg = null
let canvas = null, ctx = null
let blurRegions = []   // { id, x, y, w, h, label }
let mode = 'auto'      // 'auto' | 'manual'
let drawing = null     // { startX, startY } for manual draw
let blurAmount = 18
let nextRegionId = 1

const $ = id => document.getElementById(id)

// ── Upload ──
$('uploadBtn').onclick = () => { $('fileInput').value = ''; $('fileInput').click() }
$('fileInput').onchange = e => { const f = e.target.files[0]; if (f) loadImage(f) }

const uploadArea = $('uploadArea')
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag') })
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag'))
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.classList.remove('drag')
  const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) loadImage(f)
})

function loadImage(file) {
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => {
      sourceImg = img
      initCanvas()
      $('uploadArea').style.display = 'none'
      $('bfLayout').classList.add('visible')
      if (mode === 'auto') runAutoDetect()
      else setStatus('Click and drag on the image to blur a region.', '')
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

// ── Canvas init ──
function initCanvas() {
  canvas = $('bfCanvas')
  ctx = canvas.getContext('2d')
  canvas.width = sourceImg.naturalWidth
  canvas.height = sourceImg.naturalHeight
  blurRegions = []
  nextRegionId = 1
  updateRegionsList()
  render()
  setupCanvasEvents()
}

// ── Render ──
function render() {
  if (!ctx) return
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.drawImage(sourceImg, 0, 0, W, H)

  blurRegions.forEach(r => {
    applyBlurRegion(r.x, r.y, r.w, r.h, blurAmount)
  })

  // draw region outlines
  blurRegions.forEach(r => {
    ctx.save()
    ctx.strokeStyle = 'rgba(200,75,49,0.7)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.strokeRect(r.x, r.y, r.w, r.h)
    ctx.setLineDash([])
    // delete X
    const xr = 10, xcx = r.x + r.w + xr + 2, xcy = r.y - xr - 2
    ctx.fillStyle = '#ff3333'
    ctx.beginPath(); ctx.arc(xcx, xcy, xr, 0, Math.PI*2); ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(xcx-5,xcy-5); ctx.lineTo(xcx+5,xcy+5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(xcx+5,xcy-5); ctx.lineTo(xcx-5,xcy+5); ctx.stroke()
    r._xBtn = { cx: xcx, cy: xcy }
    ctx.restore()
  })

  // drawing preview
  if (drawing) {
    ctx.save()
    ctx.strokeStyle = '#C84B31'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    const x = Math.min(drawing.startX, drawing.curX)
    const y = Math.min(drawing.startY, drawing.curY)
    const w = Math.abs(drawing.curX - drawing.startX)
    const h = Math.abs(drawing.curY - drawing.startY)
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])
    ctx.restore()
  }
}

// ── Pixelate blur (no CSS filter — works on canvas export) ──
function applyBlurRegion(x, y, w, h, amount) {
  if (w < 4 || h < 4) return
  const ix = Math.max(0, Math.round(x))
  const iy = Math.max(0, Math.round(y))
  const iw = Math.min(canvas.width - ix, Math.round(w))
  const ih = Math.min(canvas.height - iy, Math.round(h))
  if (iw < 2 || ih < 2) return

  const blockSize = Math.max(4, Math.round(amount * 0.8))

  // get pixel data for just this region
  const imageData = ctx.getImageData(ix, iy, iw, ih)
  const data = imageData.data

  for (let by = 0; by < ih; by += blockSize) {
    for (let bx = 0; bx < iw; bx += blockSize) {
      const bw = Math.min(blockSize, iw - bx)
      const bh = Math.min(blockSize, ih - by)
      let r=0,g=0,b=0,count=0
      for (let py = by; py < by+bh; py++) {
        for (let px = bx; px < bx+bw; px++) {
          const i = (py * iw + px) * 4
          r += data[i]; g += data[i+1]; b += data[i+2]; count++
        }
      }
      r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count)
      for (let py = by; py < by+bh; py++) {
        for (let px = bx; px < bx+bw; px++) {
          const i = (py * iw + px) * 4
          data[i]=r; data[i+1]=g; data[i+2]=b
        }
      }
    }
  }
  ctx.putImageData(imageData, ix, iy)
}

// ── Auto face detection using face-api.js ──
async function runAutoDetect() {
  setStatus(ui.detecting, '')
  try {
    // Load face-api.js from CDN
    await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js')
    // Load models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model'
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    ])
    const detections = await faceapi.detectAllFaces(sourceImg, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
    if (!detections.length) {
      setStatus(ui.noFaces, 'error')
      // switch to manual automatically
      switchMode('manual')
      return
    }
    detections.forEach((d, i) => {
      const box = d.box
      blurRegions.push({
        id: nextRegionId++,
        x: box.x, y: box.y, w: box.width, h: box.height,
        label: `Face ${i+1}`
      })
    })
    setStatus(`✓ ${detections.length} ${ui.facesFound}`, 'success')
    updateRegionsList()
    render()
  } catch(err) {
    console.error(err)
    setStatus('Auto-detect failed. Switch to Manual mode to blur manually.', 'error')
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
}

// ── Manual draw mode ──
function setupCanvasEvents() {
  canvas.addEventListener('mousedown', e => {
    const { cx, cy } = getCanvasCoords(e)

    // check X delete buttons
    for (const r of blurRegions) {
      if (r._xBtn && Math.hypot(cx - r._xBtn.cx, cy - r._xBtn.cy) <= 12) {
        blurRegions = blurRegions.filter(x => x !== r)
        updateRegionsList()
        render()
        e.preventDefault(); return
      }
    }

    if (mode !== 'manual') return
    drawing = { startX: cx, startY: cy, curX: cx, curY: cy }
    e.preventDefault()
  })

  canvas.addEventListener('mousemove', e => {
    if (!drawing) return
    const { cx, cy } = getCanvasCoords(e)
    drawing.curX = cx; drawing.curY = cy
    render()
  })

  canvas.addEventListener('mouseup', e => {
    if (!drawing) return
    const { cx, cy } = getCanvasCoords(e)
    const x = Math.min(drawing.startX, cx)
    const y = Math.min(drawing.startY, cy)
    const w = Math.abs(cx - drawing.startX)
    const h = Math.abs(cy - drawing.startY)
    drawing = null
    if (w > 10 && h > 10) {
      blurRegions.push({ id: nextRegionId++, x, y, w, h, label: `Region ${nextRegionId-1}` })
      updateRegionsList()
    }
    render()
  })

  // touch support
  canvas.addEventListener('touchstart', e => {
    const t = e.touches[0]
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY }))
  }, { passive: false })
  canvas.addEventListener('touchmove', e => {
    e.preventDefault()
    const t = e.touches[0]
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY }))
  }, { passive: false })
  canvas.addEventListener('touchend', e => {
    const t = e.changedTouches[0]
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: t.clientX, clientY: t.clientY }))
  })
}

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    cx: (e.clientX - rect.left) * scaleX,
    cy: (e.clientY - rect.top) * scaleY
  }
}

// ── Mode toggle ──
function switchMode(m) {
  mode = m
  $('autoBtn').classList.toggle('active', m === 'auto')
  $('manualBtn').classList.toggle('active', m === 'manual')
  if (m === 'manual') {
    setStatus('Click and drag on the image to blur a region.', '')
  } else if (m === 'auto' && sourceImg) {
    blurRegions = []; updateRegionsList(); render()
    runAutoDetect()
  }
}

$('autoBtn').onclick = () => { if (sourceImg) switchMode('auto') }
$('manualBtn').onclick = () => switchMode('manual')

// ── Blur slider ──
$('blurSlider').oninput = () => {
  blurAmount = parseInt($('blurSlider').value)
  $('blurVal').textContent = blurAmount
  render()
}

// ── Regions list ──
function updateRegionsList() {
  const container = $('regionsContainer')
  const list = $('regionsList')
  if (!blurRegions.length) { list.style.display = 'none'; return }
  list.style.display = 'block'
  container.innerHTML = blurRegions.map(r => `
    <div class="bf-region-item">
      <span>${r.label}</span>
      <button class="bf-region-del" data-id="${r.id}">✕</button>
    </div>
  `).join('')
  container.querySelectorAll('.bf-region-del').forEach(btn => {
    btn.onclick = () => {
      blurRegions = blurRegions.filter(r => r.id !== parseInt(btn.dataset.id))
      updateRegionsList(); render()
    }
  })
}

// ── Status ──
function setStatus(msg, type) {
  const el = $('bfStatus')
  el.textContent = msg
  el.className = 'bf-status' + (type ? ` ${type}` : '')
}

// ── IDB helpers ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject()
  })
}
async function saveToIDB(blob, name, type) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear(); store.put({ id: 0, blob, name, type })
    tx.oncomplete = resolve; tx.onerror = reject
  })
}

// ── What's Next ──
function buildNextSteps(blob) {
  const buttons = [
    { label: t.nav_short?.compress  || 'Compress',  href: '/compress' },
    { label: t.nav_short?.resize    || 'Resize',    href: '/resize' },
    { label: t.nav_short?.crop      || 'Crop',      href: '/crop' },
    { label: t.nav_short?.watermark || 'Watermark', href: '/watermark' },
    { label: 'Meme',                                href: '/meme-generator' },
  ]
  const container = $('nextStepsButtons')
  container.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.style.cssText = 'padding:7px 13px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:12px;font-weight:600;color:#2C1810;background:#fff;cursor:pointer;font-family:DM Sans,sans-serif;transition:all 0.15s'
    btn.textContent = b.label
    btn.onmouseover = () => { btn.style.borderColor='#C84B31'; btn.style.color='#C84B31' }
    btn.onmouseout  = () => { btn.style.borderColor='#DDD5C8'; btn.style.color='#2C1810' }
    btn.onclick = async () => {
      try { await saveToIDB(blob, 'blurred.jpg', 'image/jpeg'); sessionStorage.setItem('pendingFromIDB','1') } catch(e) {}
      window.location.href = b.href
    }
    container.appendChild(btn)
  })
  $('nextSteps').style.display = 'block'
}

// ── Download ──
$('downloadBtn').onclick = () => {
  if (!canvas) return
  // clean render without outlines
  const savedRegions = blurRegions
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width; tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.drawImage(sourceImg, 0, 0)
  savedRegions.forEach(r => {
    // pixelate on tempCanvas
    const ix = Math.max(0, Math.round(r.x)), iy = Math.max(0, Math.round(r.y))
    const iw = Math.min(tempCanvas.width - ix, Math.round(r.w))
    const ih = Math.min(tempCanvas.height - iy, Math.round(r.h))
    if (iw < 2 || ih < 2) return
    const blockSize = Math.max(4, Math.round(blurAmount * 0.8))
    const imageData = tempCtx.getImageData(ix, iy, iw, ih)
    const data = imageData.data
    for (let by = 0; by < ih; by += blockSize) {
      for (let bx = 0; bx < iw; bx += blockSize) {
        const bw = Math.min(blockSize, iw-bx), bh = Math.min(blockSize, ih-by)
        let r2=0,g=0,b=0,count=0
        for (let py=by;py<by+bh;py++) for (let px=bx;px<bx+bw;px++) {
          const i=(py*iw+px)*4; r2+=data[i];g+=data[i+1];b+=data[i+2];count++
        }
        r2=Math.round(r2/count);g=Math.round(g/count);b=Math.round(b/count)
        for (let py=by;py<by+bh;py++) for (let px=bx;px<bx+bw;px++) {
          const i=(py*iw+px)*4; data[i]=r2;data[i+1]=g;data[i+2]=b
        }
      }
    }
    tempCtx.putImageData(imageData, ix, iy)
  })
  tempCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='blurred-face.jpg'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    buildNextSteps(blob)
  }, 'image/jpeg', 0.92)
}

// ── Reset ──
$('resetBtn').onclick = () => {
  sourceImg = null; canvas = null; ctx = null
  blurRegions = []; drawing = null
  $('uploadArea').style.display = ''
  $('bfLayout').classList.remove('visible')
  $('nextSteps').style.display = 'none'
  $('regionsList').style.display = 'none'
  setStatus(ui.detecting, '')
}

// ── Load from IDB (auto-upload from another tool) ──
async function loadFromIDB() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const db = await openDB()
    const tx = db.transaction('pending', 'readonly')
    const store = tx.objectStore('pending')
    const req = store.get(0)
    req.onsuccess = () => {
      const rec = req.result
      if (!rec?.blob) return
      const file = new File([rec.blob], rec.name || 'image.jpg', { type: rec.type || 'image/jpeg' })
      loadImage(file)
    }
  } catch(e) {}
}

loadFromIDB()

// ── SEO ──
const seoBlur = {
  en: {
    h2a: 'How to Blur Faces in Photos — Free & No Upload Required',
    steps: ['Upload your photo — click Upload Image or drag and drop any JPG, PNG, or WebP file.','Auto-detect faces — the tool automatically finds and blurs all faces in the photo.','Adjust blur amount — use the slider to make the blur stronger or lighter.','Add manual regions — switch to Manual mode to blur any area by drawing a box.','Download — click Download Image to save your blurred photo instantly.'],
    h2b: 'The Best Free Face Blur Tool That Never Uploads Your Photos',
    body: 'RelahConvert\'s face blur tool runs entirely in your browser. Your photos never leave your device. No account needed, no watermarks, no limits. Blur faces automatically or draw custom blur regions manually.',
    h3why: 'Why Blur Faces in Photos?',
    why: 'Blurring faces protects privacy when sharing photos publicly. It\'s essential for social media posts, journalistic content, background characters in street photography, or any image where someone didn\'t consent to being shown.',
    faqs: [
      {q:'Does my photo get uploaded to a server?',a:'No. Everything runs in your browser. Your files never leave your device.'},
      {q:'How does auto face detection work?',a:'We use a lightweight AI model (TinyFaceDetector) that runs entirely in your browser — no server required.'},
      {q:'Can I blur multiple faces?',a:'Yes — auto mode detects all faces at once. In manual mode you can draw as many blur regions as you want.'},
      {q:'Can I blur things other than faces?',a:'Yes — switch to Manual mode and draw a box over any area you want to blur.'},
      {q:'What image formats are supported?',a:'JPG, PNG, and WebP.'},
      {q:'Is there a watermark?',a:'No watermark, ever.'}
    ],
    links: [{href:'/compress',label:'Compress Image'},{href:'/resize',label:'Resize Image'},{href:'/crop',label:'Crop Image'},{href:'/watermark',label:'Add Watermark'},{href:'/meme-generator',label:'Meme Generator'}]
  },
  fr: {
    h2a: "Comment flouter des visages dans des photos — Gratuit et sans téléversement",
    steps: ["Téléversez votre photo — cliquez sur Téléverser une image ou glissez-déposez un fichier JPG, PNG ou WebP.","Détection automatique — l'outil détecte et floute automatiquement tous les visages.","Ajustez le flou — utilisez le curseur pour renforcer ou alléger le flou.","Zones manuelles — passez en mode Manuel pour flouter n'importe quelle zone.","Téléchargez — cliquez sur Télécharger pour enregistrer votre photo instantanément."],
    h2b: "Le meilleur outil gratuit pour flouter les visages sans téléverser vos photos",
    body: "L'outil de floutage de RelahConvert fonctionne entièrement dans votre navigateur. Vos photos ne quittent jamais votre appareil. Sans compte, sans filigrane, sans limites.",
    h3why: "Pourquoi flouter les visages ?",
    why: "Le floutage des visages protège la vie privée lors du partage public de photos. Indispensable pour les réseaux sociaux, le journalisme ou la photographie de rue.",
    faqs: [
      {q:"Ma photo sera-t-elle téléversée sur un serveur ?",a:"Non. Tout s'exécute dans votre navigateur. Vos fichiers ne quittent jamais votre appareil."},
      {q:"Comment fonctionne la détection automatique ?",a:"Nous utilisons un modèle IA léger qui s'exécute entièrement dans votre navigateur."},
      {q:"Puis-je flouter plusieurs visages ?",a:"Oui — le mode automatique détecte tous les visages. En mode manuel, dessinez autant de zones que vous voulez."},
      {q:"Puis-je flouter autre chose que des visages ?",a:"Oui — passez en mode Manuel et dessinez une zone sur n'importe quelle partie de l'image."},
      {q:"Quels formats sont supportés ?",a:"JPG, PNG et WebP."},
      {q:"Y a-t-il un filigrane ?",a:"Aucun filigrane, jamais."}
    ],
    links: [{href:"/compress",label:"Compresser"},{href:"/resize",label:"Redimensionner"},{href:"/crop",label:"Recadrer"},{href:"/watermark",label:"Filigrane"},{href:"/meme-generator",label:"Générateur de mèmes"}]
  },
  es: {
    h2a: "Cómo difuminar caras en fotos — Gratis y sin subir archivos",
    steps: ["Sube tu foto — haz clic en Subir imagen o arrastra un archivo JPG, PNG o WebP.","Detección automática — la herramienta detecta y difumina todas las caras automáticamente.","Ajusta el difuminado — usa el control deslizante para más o menos difuminado.","Zonas manuales — cambia al modo Manual para difuminar cualquier área dibujando un recuadro.","Descarga — haz clic en Descargar imagen para guardar tu foto instantáneamente."],
    h2b: "La mejor herramienta gratuita para difuminar caras sin subir tus fotos",
    body: "La herramienta de difuminado de RelahConvert funciona completamente en tu navegador. Tus fotos nunca salen de tu dispositivo. Sin cuenta, sin marca de agua, sin límites.",
    h3why: "¿Por qué difuminar caras en fotos?",
    why: "Difuminar caras protege la privacidad al compartir fotos públicamente. Es esencial para redes sociales, periodismo y fotografía callejera.",
    faqs: [
      {q:"¿Se subirá mi foto a un servidor?",a:"No. Todo se ejecuta en tu navegador. Tus archivos nunca salen de tu dispositivo."},
      {q:"¿Cómo funciona la detección automática?",a:"Usamos un modelo de IA ligero que se ejecuta completamente en tu navegador."},
      {q:"¿Puedo difuminar varias caras?",a:"Sí — el modo automático detecta todas las caras. En modo manual puedes dibujar tantas zonas como quieras."},
      {q:"¿Puedo difuminar otras cosas además de caras?",a:"Sí — cambia al modo Manual y dibuja un recuadro sobre cualquier área."},
      {q:"¿Qué formatos se admiten?",a:"JPG, PNG y WebP."},
      {q:"¿Hay marca de agua?",a:"Sin marca de agua, nunca."}
    ],
    links: [{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca de agua"},{href:"/meme-generator",label:"Generador de memes"}]
  },
  pt: {
    h2a: "Como desfocar rostos em fotos — Grátis e sem fazer upload",
    steps: ["Envie sua foto — clique em Enviar imagem ou arraste um arquivo JPG, PNG ou WebP.","Detecção automática — a ferramenta detecta e desfoca todos os rostos automaticamente.","Ajuste o desfoque — use o controle deslizante para mais ou menos desfoque.","Zonas manuais — mude para o modo Manual para desfocar qualquer área desenhando um retângulo.","Baixe — clique em Baixar imagem para salvar sua foto instantaneamente."],
    h2b: "A melhor ferramenta gratuita para desfocar rostos sem enviar suas fotos",
    body: "A ferramenta de desfoque do RelahConvert funciona inteiramente no seu navegador. Suas fotos nunca saem do seu dispositivo. Sem conta, sem marca d'água, sem limites.",
    h3why: "Por que desfocar rostos em fotos?",
    why: "Desfocar rostos protege a privacidade ao compartilhar fotos publicamente. É essencial para redes sociais, jornalismo e fotografia de rua.",
    faqs: [
      {q:"Minha foto será enviada para um servidor?",a:"Não. Tudo é executado no seu navegador. Seus arquivos nunca saem do seu dispositivo."},
      {q:"Como funciona a detecção automática?",a:"Usamos um modelo de IA leve que é executado completamente no seu navegador."},
      {q:"Posso desfocar vários rostos?",a:"Sim — o modo automático detecta todos os rostos. No modo manual, você pode desenhar quantas zonas quiser."},
      {q:"Posso desfocar outras coisas além de rostos?",a:"Sim — mude para o modo Manual e desenhe um retângulo sobre qualquer área."},
      {q:"Quais formatos são suportados?",a:"JPG, PNG e WebP."},
      {q:"Há marca d'água?",a:"Sem marca d'água, nunca."}
    ],
    links: [{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca d'água"},{href:"/meme-generator",label:"Gerador de memes"}]
  },
  de: {
    h2a: "Wie man Gesichter in Fotos unkenntlich macht — Kostenlos und ohne Upload",
    steps: ["Lade dein Foto hoch — klicke auf Bild hochladen oder ziehe eine JPG-, PNG- oder WebP-Datei hinein.","Automatische Erkennung — das Tool erkennt und unkenntlich macht alle Gesichter automatisch.","Stärke anpassen — nutze den Schieberegler für mehr oder weniger Unschärfe.","Manuelle Bereiche — wechsle in den Manuell-Modus, um beliebige Bereiche unkenntlich zu machen.","Herunterladen — klicke auf Bild herunterladen, um dein Foto sofort zu speichern."],
    h2b: "Das beste kostenlose Tool zum Verpixeln von Gesichtern ohne Upload",
    body: "RelahConverts Gesichtsunschärfe-Tool läuft vollständig in deinem Browser. Deine Fotos verlassen nie dein Gerät. Kein Konto, kein Wasserzeichen, keine Limits.",
    h3why: "Warum Gesichter in Fotos unkenntlich machen?",
    why: "Das Unkenntlichmachen von Gesichtern schützt die Privatsphäre beim öffentlichen Teilen von Fotos. Unverzichtbar für soziale Medien, Journalismus und Straßenfotografie.",
    faqs: [
      {q:"Wird mein Foto auf einen Server hochgeladen?",a:"Nein. Alles läuft in deinem Browser. Deine Dateien verlassen nie dein Gerät."},
      {q:"Wie funktioniert die automatische Erkennung?",a:"Wir verwenden ein leichtes KI-Modell, das vollständig in deinem Browser läuft."},
      {q:"Kann ich mehrere Gesichter unkenntlich machen?",a:"Ja — der Auto-Modus erkennt alle Gesichter. Im manuellen Modus kannst du beliebig viele Bereiche zeichnen."},
      {q:"Kann ich auch andere Bereiche unkenntlich machen?",a:"Ja — wechsle in den Manuell-Modus und zeichne ein Rechteck über den gewünschten Bereich."},
      {q:"Welche Formate werden unterstützt?",a:"JPG, PNG und WebP."},
      {q:"Gibt es ein Wasserzeichen?",a:"Kein Wasserzeichen, niemals."}
    ],
    links: [{href:"/compress",label:"Komprimieren"},{href:"/resize",label:"Größe ändern"},{href:"/crop",label:"Zuschneiden"},{href:"/watermark",label:"Wasserzeichen"},{href:"/meme-generator",label:"Meme-Generator"}]
  },
  ar: {
    h2a: "كيفية تمويه الوجوه في الصور — مجاناً وبدون رفع",
    steps: ["ارفع صورتك — انقر على رفع صورة أو اسحب ملف JPG أو PNG أو WebP.","الكشف التلقائي — تكتشف الأداة جميع الوجوه وتموّهها تلقائياً.","اضبط مقدار التمويه — استخدم المتزلج لزيادة أو تقليل التمويه.","مناطق يدوية — انتقل إلى الوضع اليدوي لتمويه أي منطقة برسم مستطيل.","تحميل — انقر على تحميل الصورة لحفظها فوراً."],
    h2b: "أفضل أداة مجانية لتمويه الوجوه دون رفع صورك",
    body: "تعمل أداة تمويه الوجوه من RelahConvert بالكامل في متصفحك. لا تغادر صورك جهازك أبداً. بدون حساب، بدون علامة مائية، بدون حدود.",
    h3why: "لماذا تمويه الوجوه في الصور؟",
    why: "يحمي تمويه الوجوه الخصوصية عند مشاركة الصور علناً. ضروري لوسائل التواصل الاجتماعي والصحافة وتصوير الشوارع.",
    faqs: [
      {q:"هل سيتم رفع صورتي إلى خادم؟",a:"لا. كل شيء يعمل في متصفحك. لا تغادر ملفاتك جهازك أبداً."},
      {q:"كيف يعمل الكشف التلقائي؟",a:"نستخدم نموذج ذكاء اصطناعي خفيف يعمل بالكامل في متصفحك."},
      {q:"هل يمكنني تمويه عدة وجوه؟",a:"نعم — الوضع التلقائي يكتشف جميع الوجوه. في الوضع اليدوي يمكنك رسم أي عدد من المناطق."},
      {q:"هل يمكنني تمويه أشياء أخرى غير الوجوه؟",a:"نعم — انتقل إلى الوضع اليدوي وارسم مستطيلاً على أي منطقة."},
      {q:"ما صيغ الصور المدعومة؟",a:"JPG وPNG وWebP."},
      {q:"هل توجد علامة مائية؟",a:"لا علامة مائية، أبداً."}
    ],
    links: [{href:"/compress",label:"ضغط"},{href:"/resize",label:"تغيير الحجم"},{href:"/crop",label:"اقتصاص"},{href:"/watermark",label:"علامة مائية"},{href:"/meme-generator",label:"صانع الميمات"}]
  }
}

function getLang() { return localStorage.getItem('rc_lang') || navigator.language?.slice(0,2) || 'en' }

function buildSeoSection() {
  const lang = getLang()
  const seo = seoBlur[lang] || seoBlur['en']
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `
    <h2>${seo.h2a}</h2>
    <ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <h2>${seo.h2b}</h2>
    <p>${seo.body}</p>
    <h3>${seo.h3why}</h3>
    <p>${seo.why}</p>
    <h3>${faqTitle}</h3>
    ${seo.faqs.map(f=>`<div class="faq-item"><p class="faq-q">${f.q}</p><p class="faq-a">${f.a}</p></div>`).join('')}
    <h3>${alsoTry}</h3>
    <div class="also-links">${seo.links.map(l=>`<a class="also-link" href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.querySelector('.tool-wrap').appendChild(div)
}

buildSeoSection()