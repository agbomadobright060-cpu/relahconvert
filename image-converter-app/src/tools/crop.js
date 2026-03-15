import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang} from '../core/i18n.js'
injectHreflang('crop')

const t = getT()

const bg = '#F2F2F2'
const toolName  = (t.nav_short && t.nav_short['crop']) || 'Crop Image'
const seo       = t.seo && t.seo['crop']
const descText  = seo ? seo.h2a : 'Crop any image free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const faqTitle  = t.seo_faq_title || 'Frequently Asked Questions'
const alsoTry   = t.seo_also_try || 'Also Try'
const lblWidth  = t.resize_width  || 'Width (px)'
const lblHeight = t.resize_height || 'Height (px)'
const lblX      = 'Position X (px)'
const lblY      = 'Position Y (px)'

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
    .crop-handle { position:absolute; width:10px; height:10px; background:#C84B31; border-radius:2px; }
    .crop-handle.nw { top:-5px; left:-5px; cursor:nw-resize; }
    .crop-handle.ne { top:-5px; right:-5px; cursor:ne-resize; }
    .crop-handle.sw { bottom:-5px; left:-5px; cursor:sw-resize; }
    .crop-handle.se { bottom:-5px; right:-5px; cursor:se-resize; }
    .crop-options { background:#fff; border-radius:12px; padding:16px; margin-top:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .crop-options-title { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; font-family:'DM Sans',sans-serif; }
    .crop-inputs-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .crop-input-group { display:flex; flex-direction:column; gap:4px; }
    .crop-input-label { font-size:11px; font-weight:600; color:#5A4A3A; font-family:'DM Sans',sans-serif; }
    .crop-input { padding:8px 10px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:13px; font-family:'DM Sans',sans-serif; color:#2C1810; outline:none; width:100%; box-sizing:border-box; }
    .crop-input:focus { border-color:#C84B31; box-shadow:0 0 0 3px rgba(200,75,49,0.1); }
    .next-steps { margin-top:20px; }
    .next-steps-label { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
    .seo-section { max-width:700px; margin:0 auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif; }
    .seo-section h2 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:32px 0 10px; }
    .seo-section h3 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:24px 0 8px; }
    .seo-section ol { padding-left:20px; margin:0 0 12px; }
    .seo-section ol li { font-size:13px; color:#5A4A3A; line-height:1.6; margin-bottom:6px; }
    .seo-section p { font-size:13px; color:#5A4A3A; line-height:1.6; margin:0 0 12px; }
    .seo-faq { border-top:1px solid #E8E0D5; padding:10px 0; }
    .seo-faq:last-child { border-bottom:1px solid #E8E0D5; }
    .seo-faq-q { font-size:13px; font-weight:700; color:#2C1810; margin:0 0 4px; font-family:'DM Sans',sans-serif; }
    .seo-faq-a { font-size:13px; color:#5A4A3A; margin:0; line-height:1.6; }
    .seo-links { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }
    .seo-link { padding:7px 14px; background:#fff; border:1.5px solid #DDD5C8; border-radius:8px; font-size:13px; font-weight:600; color:#2C1810; text-decoration:none; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .seo-link:hover { border-color:#C84B31; color:#C84B31; }
  `
  document.head.appendChild(style)
}

document.title = `${toolName} Free | No Upload — RelahConvert`
const parts = toolName.split(' ')
const h1Main = parts[0]
const h1Em   = parts.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
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
      <div class="crop-options">
        <div class="crop-options-title">${toolName}</div>
        <div class="crop-inputs-grid">
          <div class="crop-input-group"><label class="crop-input-label">${lblWidth}</label><input class="crop-input" type="number" id="inputW" min="1" /></div>
          <div class="crop-input-group"><label class="crop-input-label">${lblHeight}</label><input class="crop-input" type="number" id="inputH" min="1" /></div>
          <div class="crop-input-group"><label class="crop-input-label">${lblX}</label><input class="crop-input" type="number" id="inputX" min="0" /></div>
          <div class="crop-input-group"><label class="crop-input-label">${lblY}</label><input class="crop-input" type="number" id="inputY" min="0" /></div>
        </div>
      </div>
    </div>
    <button class="opt-btn" id="cropBtn" disabled>${toolName}</button>
    <a class="download-btn" id="downloadLink">${t.download || 'Download'}</a>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

if (seo) {
  const seoDiv = document.createElement('div')
  seoDiv.className = 'seo-section'
  seoDiv.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(seoDiv)
}

const fileInput    = document.getElementById('fileInput')
const previewArea  = document.getElementById('previewArea')
const previewImg   = document.getElementById('previewImg')
const cropBox      = document.getElementById('cropBox')
const cropBtn      = document.getElementById('cropBtn')
const downloadLink = document.getElementById('downloadLink')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')
const inputW       = document.getElementById('inputW')
const inputH       = document.getElementById('inputH')
const inputX       = document.getElementById('inputX')
const inputY       = document.getElementById('inputY')

let originalFile = null
let imgNaturalW = 0, imgNaturalH = 0
let displayW = 0, displayH = 0
let box = { x: 0, y: 0, w: 0, h: 0 }
let dragState = null
let updatingFromInputs = false
let updatingFromDrag = false
let lastCroppedBlob = null

// ── IndexedDB helpers ──────────────────────────────────────────────────────
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
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    files.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
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
    const file = new File([records[0].blob], records[0].name, { type: records[0].type })
    loadFile(file)
  } catch (e) {}
}

// ── Next steps ─────────────────────────────────────────────────────────────
function buildNextSteps(mime) {
  const isJpg = mime === 'image/jpeg'
  const isPng = mime === 'image/png'
  const isWebp = mime === 'image/webp'

  const buttons = []
  // Optimization tools (always show, except current = crop)
  buttons.push({ label: t.nav_short?.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: t.nav_short?.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: t.nav_short?.rotate || 'Rotate', href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.flip || 'Flip', href: localHref('flip') })
  buttons.push({ label: t.nav_short?.grayscale || 'Black & White', href: localHref('grayscale') })
  buttons.push({ label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') })
  // Format conversions — filter out current format and redundant ones
  if (!isJpg)  buttons.push({ label: t.next_to_jpg  || 'Convert to JPG',  href: localHref('png-to-jpg') })
  if (!isPng)  buttons.push({ label: t.next_to_png  || 'Convert to PNG',  href: localHref('jpg-to-png') })
  if (!isWebp) buttons.push({ label: t.next_to_webp || 'Convert to WebP', href: localHref('jpg-to-webp') })

  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastCroppedBlob) {
        try {
          await saveFilesToIDB([{ blob: lastCroppedBlob, name: originalFile.name, type: lastCroppedBlob.type }])
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

// ── Core logic ─────────────────────────────────────────────────────────────
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }
function toDisplay(val, scale) { return val / scale }
function toNatural(val, scale) { return Math.round(val * scale) }

function applyBox() {
  cropBox.style.left   = box.x + 'px'
  cropBox.style.top    = box.y + 'px'
  cropBox.style.width  = box.w + 'px'
  cropBox.style.height = box.h + 'px'
  const scaleX = imgNaturalW / displayW
  const scaleY = imgNaturalH / displayH
  if (!updatingFromInputs) {
    updatingFromDrag = true
    inputW.value = toNatural(box.w, scaleX)
    inputH.value = toNatural(box.h, scaleY)
    inputX.value = toNatural(box.x, scaleX)
    inputY.value = toNatural(box.y, scaleY)
    updatingFromDrag = false
  }
}

function initBox() {
  const pad = 20
  box = { x: pad, y: pad, w: displayW - pad * 2, h: displayH - pad * 2 }
  applyBox()
}

function onInputChange() {
  if (updatingFromDrag) return
  updatingFromInputs = true
  const scaleX = imgNaturalW / displayW
  const scaleY = imgNaturalH / displayH
  let nX = clamp(parseInt(inputX.value) || 0, 0, imgNaturalW - 1)
  let nY = clamp(parseInt(inputY.value) || 0, 0, imgNaturalH - 1)
  let nW = clamp(parseInt(inputW.value) || 1, 1, imgNaturalW - nX)
  let nH = clamp(parseInt(inputH.value) || 1, 1, imgNaturalH - nY)
  box.x = toDisplay(nX, scaleX); box.y = toDisplay(nY, scaleY)
  box.w = toDisplay(nW, scaleX); box.h = toDisplay(nH, scaleY)
  cropBox.style.left = box.x + 'px'; cropBox.style.top = box.y + 'px'
  cropBox.style.width = box.w + 'px'; cropBox.style.height = box.h + 'px'
  updatingFromInputs = false
}

inputW.addEventListener('input', onInputChange)
inputH.addEventListener('input', onInputChange)
inputX.addEventListener('input', onInputChange)
inputY.addEventListener('input', onInputChange)

previewImg.onload = () => {
  displayW = previewImg.offsetWidth; displayH = previewImg.offsetHeight
  imgNaturalW = previewImg.naturalWidth; imgNaturalH = previewImg.naturalHeight
  inputW.max = imgNaturalW; inputH.max = imgNaturalH
  inputX.max = imgNaturalW - 1; inputY.max = imgNaturalH - 1
  initBox(); cropBtn.disabled = false
}

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const url = URL.createObjectURL(file)
  previewImg.onload = () => {
    URL.revokeObjectURL(url)
    displayW = previewImg.offsetWidth; displayH = previewImg.offsetHeight
    imgNaturalW = previewImg.naturalWidth; imgNaturalH = previewImg.naturalHeight
    inputW.max = imgNaturalW; inputH.max = imgNaturalH
    inputX.max = imgNaturalW - 1; inputY.max = imgNaturalH - 1
    initBox(); cropBtn.disabled = false
  }
  previewImg.src = url
  previewArea.style.display = 'block'
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

cropBox.addEventListener('mousedown', e => {
  const dir = e.target.dataset.dir
  dragState = { type: dir || 'move', startX: e.clientX, startY: e.clientY, startBox: { ...box } }
  e.preventDefault()
})

document.addEventListener('mousemove', e => {
  if (!dragState) return
  const dx = e.clientX - dragState.startX, dy = e.clientY - dragState.startY
  const sb = dragState.startBox, MIN = 10
  if (dragState.type === 'move') { box.x = clamp(sb.x + dx, 0, displayW - box.w); box.y = clamp(sb.y + dy, 0, displayH - box.h) }
  else if (dragState.type === 'se') { box.w = clamp(sb.w + dx, MIN, displayW - box.x); box.h = clamp(sb.h + dy, MIN, displayH - box.y) }
  else if (dragState.type === 'sw') { const nW = clamp(sb.w - dx, MIN, sb.x + sb.w); box.x = sb.x + sb.w - nW; box.w = nW; box.h = clamp(sb.h + dy, MIN, displayH - box.y) }
  else if (dragState.type === 'ne') { box.w = clamp(sb.w + dx, MIN, displayW - box.x); const nH = clamp(sb.h - dy, MIN, sb.y + sb.h); box.y = sb.y + sb.h - nH; box.h = nH }
  else if (dragState.type === 'nw') { const nW = clamp(sb.w - dx, MIN, sb.x + sb.w); box.x = sb.x + sb.w - nW; box.w = nW; const nH = clamp(sb.h - dy, MIN, sb.y + sb.h); box.y = sb.y + sb.h - nH; box.h = nH }
  applyBox()
})

document.addEventListener('mouseup', () => { dragState = null })

cropBox.addEventListener('touchstart', e => {
  const dir = e.target.dataset.dir
  const touch = e.touches[0]
  dragState = { type: dir || 'move', startX: touch.clientX, startY: touch.clientY, startBox: { ...box } }
  e.preventDefault()
}, { passive: false })

document.addEventListener('touchmove', e => {
  if (!dragState) return
  const touch = e.touches[0]
  const dx = touch.clientX - dragState.startX, dy = touch.clientY - dragState.startY
  const sb = dragState.startBox, MIN = 10
  if (dragState.type === 'move') { box.x = clamp(sb.x + dx, 0, displayW - box.w); box.y = clamp(sb.y + dy, 0, displayH - box.h) }
  else if (dragState.type === 'se') { box.w = clamp(sb.w + dx, MIN, displayW - box.x); box.h = clamp(sb.h + dy, MIN, displayH - box.y) }
  applyBox(); e.preventDefault()
}, { passive: false })

document.addEventListener('touchend', () => { dragState = null })

cropBtn.addEventListener('click', () => {
  if (!originalFile) return
  const scaleX = imgNaturalW / displayW, scaleY = imgNaturalH / displayH
  const sx = Math.round(box.x * scaleX), sy = Math.round(box.y * scaleY)
  const sw = Math.round(box.w * scaleX), sh = Math.round(box.h * scaleY)
  const canvas = document.createElement('canvas')
  canvas.width = sw; canvas.height = sh
  canvas.getContext('2d').drawImage(previewImg, sx, sy, sw, sh, 0, 0, sw, sh)
  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext  = mime === 'image/png' ? 'png' : 'jpg'
  canvas.toBlob(blob => {
    lastCroppedBlob = blob
    if (downloadLink.href && downloadLink.href.startsWith('blob:')) URL.revokeObjectURL(downloadLink.href)
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `cropped-image.${ext}`
    downloadLink.textContent = `${t.download || 'Download'} (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
    downloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
    buildNextSteps(mime)
  }, mime, 0.92)
})

loadPendingFiles()