import { injectHeader } from '../core/header.js'
import { injectHreflang } from '../core/utils.js'
// JSZip loaded dynamically
import { getT, localHref} from '../core/i18n.js'
injectHreflang('round-corners')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['round-corners']) || t.round_corners_title_1 + ' ' + t.round_corners_title_em
const seoData   = t.seo && t.seo['round-corners']
const descText  = seoData ? seoData.h2a : 'Round image corners free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
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
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    #fileGrid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:12px; margin-bottom:20px; }
    .file-card { background:#fff; border-radius:10px; border:1.5px solid #E8E0D5; overflow:hidden; position:relative; }
    .file-card .card-img-wrap { width:100%; height:130px; display:flex; align-items:center; justify-content:center; background:repeating-conic-gradient(#e8e0d5 0% 25%,#fff 0% 50%) 0 0/12px 12px; overflow:hidden; }
    .file-card .card-img-wrap canvas { max-width:100%; max-height:100%; object-fit:contain; display:block; }
    .file-card .card-footer { padding:6px 8px; display:flex; align-items:center; justify-content:space-between; }
    .file-card .card-name { font-size:11px; color:#5A4A3A; font-family:'DM Sans',sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100px; }
    .file-card .remove-btn { background:none; border:none; cursor:pointer; color:#C4B8A8; font-size:14px; line-height:1; padding:2px 4px; }
    .file-card .remove-btn:hover { color:#C84B31; }
    .count-badge { display:inline-block; background:#FDE8E3; color:#C84B31; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; font-family:'DM Sans',sans-serif; margin-left:10px; }
    .radius-panel { background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .radius-panel-title { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; font-family:'DM Sans',sans-serif; }
    .slider-row { display:flex; align-items:center; gap:12px; }
    .radius-slider { flex:1; -webkit-appearance:none; appearance:none; height:4px; border-radius:2px; background:#DDD5C8; outline:none; cursor:pointer; }
    .radius-slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#C84B31; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
    .radius-slider::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#C84B31; cursor:pointer; border:none; }
    .radius-value { font-size:14px; font-weight:700; color:#2C1810; font-family:'DM Sans',sans-serif; min-width:40px; text-align:right; }
    .preset-btns { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
    .preset-btn { padding:6px 14px; border-radius:20px; border:1.5px solid #DDD5C8; background:#fff; font-size:12px; font-weight:600; color:#5A4A3A; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; }
    .preset-btn:hover, .preset-btn.active { border-color:#C84B31; color:#C84B31; background:#FDE8E3; }
    .next-steps { margin-top:20px; }
    .next-steps-label { font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; font-family:'DM Sans',sans-serif; }
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
document.querySelector('#app').innerHTML = `
  <div style="max-width:900px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:#9A8A7A;">${dropHint} — up to 25 files</span>
      <span class="count-badge" id="countBadge" style="display:none;">0 images</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    <div id="radiusPanel" class="radius-panel" style="display:none;">
      <div class="radius-panel-title">${t.round_corners_panel}</div>
      <div class="slider-row">
        <input type="range" class="radius-slider" id="radiusSlider" min="0" max="50" value="20" />
        <span class="radius-value" id="radiusValue">20%</span>
      </div>
      <div class="preset-btns">
        <button class="preset-btn" data-val="10">${t.round_corners_preset_slight}</button>
        <button class="preset-btn active" data-val="20">${t.round_corners_preset_rounded}</button>
        <button class="preset-btn" data-val="35">${t.round_corners_preset_very}</button>
        <button class="preset-btn" data-val="50">${t.round_corners_preset_circle}</button>
      </div>
    </div>
    <div id="fileGrid"></div>
    <button class="opt-btn" id="applyBtn" disabled>${t.round_corners_btn}</button>
    <div id="zipWrap" style="display:none; margin-top:10px;">
      <a id="zipBtn" class="opt-btn" style="display:block; text-align:center; text-decoration:none; background:#2C1810; color:#F5F0E8;">⬇ ${dlZipBtn}</a>
      <p id="zipNote" style="font-size:12px; color:#9A8A7A; text-align:center; margin:8px 0 0; font-family:'DM Sans',sans-serif;"></p>
    </div>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileGrid     = document.getElementById('fileGrid')
const radiusPanel  = document.getElementById('radiusPanel')
const radiusSlider = document.getElementById('radiusSlider')
const radiusValue  = document.getElementById('radiusValue')
const applyBtn     = document.getElementById('applyBtn')
const countBadge   = document.getElementById('countBadge')
const zipWrap      = document.getElementById('zipWrap')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

let files = []
let lastResults = []

// ── IndexedDB helpers ──────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
}
async function saveFilesToIDB(items) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    items.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
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
    const fileObjs = records.map(r => new File([r.blob], r.name, { type: r.type }))
    loadFiles(fileObjs)
  } catch (e) {}
}

// ── Next steps ─────────────────────────────────────────────────────────────
function buildNextSteps() {
  const mime = files.length > 0 ? files[0].file.type : 'image/jpeg'
  const isJpg  = mime === 'image/jpeg'
  const isPng  = mime === 'image/png'
  const isWebp = mime === 'image/webp'
  const buttons = []
  buttons.push({ label: t.nav_short?.compress  || 'Compress',  href: localHref('compress') })
  buttons.push({ label: t.nav_short?.resize    || 'Resize',    href: localHref('resize') })
  buttons.push({ label: t.nav_short?.crop      || 'Crop',      href: localHref('crop') })
  buttons.push({ label: t.nav_short?.rotate    || 'Rotate',    href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.flip      || 'Flip',      href: localHref('flip') })
  buttons.push({ label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') })
  if (!isJpg)  buttons.push({ label: t.next_to_jpg  || 'Convert to JPG',  href: localHref('png-to-jpg') })
  if (!isPng)  buttons.push({ label: t.next_to_png  || 'Convert to PNG',  href: localHref('jpg-to-png') })
  if (!isWebp) buttons.push({ label: t.next_to_webp || 'Convert to WebP', href: localHref('jpg-to-webp') })
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastResults.length) {
        try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

// ── Unique filename helper ─────────────────────────────────────────────────
function makeUnique(usedNames, name) {
  if (!usedNames.has(name)) { usedNames.add(name); return name }
  const dot = name.lastIndexOf('.')
  const base = dot !== -1 ? name.slice(0, dot) : name
  const ext  = dot !== -1 ? name.slice(dot) : ''
  let i = 1
  while (usedNames.has(`${base}-${i}${ext}`)) i++
  const unique = `${base}-${i}${ext}`
  usedNames.add(unique)
  return unique
}

// ── Count badge & button state ─────────────────────────────────────────────
function updateCountBadge() {
  if (files.length === 0) {
    countBadge.style.display = 'none'
    radiusPanel.style.display = 'none'
  } else {
    countBadge.style.display = 'inline-block'
    countBadge.textContent = `${files.length} image${files.length > 1 ? 's' : ''}`
    radiusPanel.style.display = 'block'
  }
  applyBtn.disabled = files.length === 0
  applyBtn.textContent = files.length > 1 ? `${t.round_corners_btn} (${files.length})` : t.round_corners_btn
}

// ── Draw rounded preview onto a canvas ────────────────────────────────────
function drawRounded(img, canvas, radiusPct) {
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  canvas.width = w
  canvas.height = h
  const r = Math.min(w, h) * (radiusPct / 100)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(w - r, 0)
  ctx.arcTo(w, 0, w, r, r)
  ctx.lineTo(w, h - r)
  ctx.arcTo(w, h, w - r, h, r)
  ctx.lineTo(r, h)
  ctx.arcTo(0, h, 0, h - r, r)
  ctx.lineTo(0, r)
  ctx.arcTo(0, 0, r, 0, r)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, 0, 0, w, h)
}

// ── Update all previews when slider changes ────────────────────────────────
function refreshPreviews() {
  const radiusPct = parseInt(radiusSlider.value)
  files.forEach(item => {
    if (item.imgEl && item.previewCanvas) {
      drawRounded(item.imgEl, item.previewCanvas, radiusPct)
    }
  })
}

// ── Render grid ────────────────────────────────────────────────────────────
function renderGrid() {
  fileGrid.innerHTML = ''
  const radiusPct = parseInt(radiusSlider.value)
  files.forEach((item, idx) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    const imgWrap = document.createElement('div')
    imgWrap.className = 'card-img-wrap'
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'max-width:100%; max-height:130px; object-fit:contain; display:block;'
    item.previewCanvas = canvas
    if (item.imgEl) drawRounded(item.imgEl, canvas, radiusPct)
    imgWrap.appendChild(canvas)
    const footer = document.createElement('div')
    footer.className = 'card-footer'
    footer.innerHTML = `<span class="card-name">${item.file.name}</span><button class="remove-btn" data-idx="${idx}">✕</button>`
    footer.querySelector('.remove-btn').addEventListener('click', () => {
      files.splice(idx, 1)
      renderGrid()
      updateCountBadge()
      zipWrap.style.display = 'none'
      nextSteps.style.display = 'none'
    })
    card.append(imgWrap, footer)
    fileGrid.appendChild(card)
  })
}

// ── Load files ─────────────────────────────────────────────────────────────
function loadFiles(newFiles) {
  const remaining = 25 - files.length
  const toAdd = Array.from(newFiles).filter(f => f.type.startsWith('image/')).slice(0, remaining)
  if (toAdd.length === 0) return
  let loaded = 0
  toAdd.forEach(file => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      files.push({ file, imgEl: img, previewCanvas: null })
      loaded++
      if (loaded === toAdd.length) {
        renderGrid()
        updateCountBadge()
        zipWrap.style.display = 'none'
        nextSteps.style.display = 'none'
      }
    }
    img.src = url
  })
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) loadFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files) })

// ── Slider & presets ───────────────────────────────────────────────────────
radiusSlider.addEventListener('input', () => {
  const val = radiusSlider.value
  radiusValue.textContent = val + '%'
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.val === val))
  refreshPreviews()
})
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    radiusSlider.value = btn.dataset.val
    radiusValue.textContent = btn.dataset.val + '%'
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    refreshPreviews()
  })
})

// ── Canvas to blob ─────────────────────────────────────────────────────────
function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'))
}

// ── Apply ──────────────────────────────────────────────────────────────────
applyBtn.addEventListener('click', async () => {
  if (files.length === 0) return
  applyBtn.disabled = true
  applyBtn.textContent = 'Processing...'
  zipWrap.style.display = 'none'
  nextSteps.style.display = 'none'
  lastResults = []
  const radiusPct = parseInt(radiusSlider.value)
  const usedNames = new Set()

  if (files.length === 1) {
    const item = files[0]
    const canvas = document.createElement('canvas')
    drawRounded(item.imgEl, canvas, radiusPct)
    const blob = await canvasToBlob(canvas)
    const baseName = item.file.name.replace(/\.[^.]+$/, '')
    const fname = makeUnique(usedNames, `${baseName}-rounded.png`)
    lastResults = [{ blob, name: fname, type: 'image/png' }]
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url; a.download = fname; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    applyBtn.disabled = false
    applyBtn.textContent = t.round_corners_btn
    buildNextSteps()
    return
  }

  if (!window.JSZip) {
    await new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      s.onload = res; s.onerror = rej
      document.head.appendChild(s)
    })
  }

  const zip = new window.JSZip()
  for (const item of files) {
    const canvas = document.createElement('canvas')
    drawRounded(item.imgEl, canvas, radiusPct)
    const blob = await canvasToBlob(canvas)
    const baseName = item.file.name.replace(/\.[^.]+$/, '')
    const fname = makeUnique(usedNames, `${baseName}-rounded.png`)
    zip.file(fname, blob)
    lastResults.push({ blob, name: fname, type: 'image/png' })
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  const url = URL.createObjectURL(zipBlob)
  const zipBtn = document.getElementById('zipBtn')
  zipBtn.href = url
  zipBtn.download = 'rounded-images.zip'
  zipBtn.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
  const totalKB = Math.round(zipBlob.size / 1024)
  document.getElementById('zipNote').textContent = `${files.length} images — ${totalKB} KB total`
  zipWrap.style.display = 'block'
  applyBtn.disabled = false
  applyBtn.textContent = `${t.round_corners_btn} (${files.length})`
  buildNextSteps()
})

// ── SEO ────────────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo['round-corners']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()

loadPendingFiles()