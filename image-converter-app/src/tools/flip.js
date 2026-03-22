import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('flip')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['flip']) || 'Flip Image'
const seoData   = t.seo && t.seo['flip']
const descText  = seoData ? seoData.h2a : 'Flip any image horizontally or vertically. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = '#F2F2F2'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:visible;position:relative;padding-bottom:8px;}
  .card-img-wrap{position:relative;width:100%;height:130px;display:flex;align-items:center;justify-content:center;background:#F5F0E8;border-radius:10px 10px 0 0;overflow:hidden;}
  .card-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block;transition:transform 0.2s ease;}
  .card-flip-btns{display:flex;justify-content:center;gap:6px;margin:14px 8px 4px;}
  .card-flip-btn{flex:1;padding:6px 4px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:11px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;}
  .card-flip-btn:hover{border-color:#C84B31;color:#C84B31;}
  .card-flip-btn.active{border-color:#C84B31;background:#FDE8E3;color:#C84B31;}
  .card-fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:2px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}
  .card-status{font-size:10px;color:#9A8A7A;font-family:'DM Sans',sans-serif;text-align:center;min-height:14px;padding:0 8px;}
  .card-dl{display:none;font-size:11px;font-weight:700;color:#C84B31;font-family:'DM Sans',sans-serif;padding:2px 8px 0;text-align:center;text-decoration:none;}
  .card-dl:hover{text-decoration:underline;}
  .card-rm{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:6;}
  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;min-width:160px;}
  .action-btn:hover{background:#A63D26;}
  .action-btn.dark{background:#2C1810;}
  .action-btn.dark:hover{background:#1a0f09;}
  .action-btn:disabled{background:#C4B8A8;cursor:not-allowed;}
  .status-text{font-size:13px;color:#7A6A5A;font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .next-steps{margin-top:20px;}
  .next-steps-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:13px;font-weight:500;color:#2C1810;text-decoration:none;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:#C84B31;color:#C84B31;}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px;}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:24px 0 8px;}
  .seo-section ol{padding-left:20px;margin:0 0 12px;}
  .seo-section ol li{font-size:13px;color:#5A4A3A;line-height:1.6;margin-bottom:6px;}
  .seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin:0 0 12px;}
  
  
  
  
  .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
  .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .seo-link:hover{border-color:#C84B31;color:#C84B31;}
    .seo-section .faq-item { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
`
document.head.appendChild(style)
document.title = `${toolName} Free | No Upload — RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="applyBtn">⬇ Download All</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const fileGrid   = document.getElementById('fileGrid')
const actionRow  = document.getElementById('actionRow')
const applyBtn   = document.getElementById('applyBtn')
const zipBtn     = document.getElementById('zipBtn')
const statusText = document.getElementById('statusText')
const nextSteps  = document.getElementById('nextSteps')
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
    addFiles(fileObjs)
  } catch (e) {}
}

// ── Next steps ─────────────────────────────────────────────────────────────
function buildNextSteps() {
  const mime = files.length > 0 ? files[0].file.type : 'image/jpeg'
  const isJpg = mime === 'image/jpeg'
  const isPng = mime === 'image/png'
  const isWebp = mime === 'image/webp'
  const buttons = []
  buttons.push({ label: t.nav_short?.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: t.nav_short?.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: t.nav_short?.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: t.nav_short?.rotate || 'Rotate', href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.grayscale || 'Black & White', href: localHref('grayscale') })
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

function getStatus(entry) {
  if (entry.flippedH && entry.flippedV) return 'Flipped: H + V'
  if (entry.flippedH) return 'Flipped: Horizontal'
  if (entry.flippedV) return 'Flipped: Vertical'
  return 'No flip'
}

function addFiles(newFiles) {
  Array.from(newFiles).forEach(file => {
    if (!file.type.startsWith('image/')) return
    const entry = { file, img: null, flippedH: false, flippedV: false, dlLink: null }
    const card = document.createElement('div')
    card.className = 'file-card'
    const imgWrap = document.createElement('div')
    imgWrap.className = 'card-img-wrap'
    const img = document.createElement('img')
    const previewUrl = URL.createObjectURL(file)
    img.src = previewUrl
    img.onload = () => URL.revokeObjectURL(previewUrl)
    entry.img = img
    imgWrap.appendChild(img)
    const flipBtns = document.createElement('div')
    flipBtns.className = 'card-flip-btns'
    const btnH = document.createElement('button')
    btnH.className = 'card-flip-btn'
    btnH.textContent = '⇄ H'
    btnH.title = 'Flip Horizontal'
    const btnV = document.createElement('button')
    btnV.className = 'card-flip-btn'
    btnV.textContent = '⇅ V'
    btnV.title = 'Flip Vertical'
    btnH.addEventListener('click', () => {
      entry.flippedH = !entry.flippedH
      btnH.classList.toggle('active', entry.flippedH)
      updateImgTransform(entry)
      statusLabel.textContent = getStatus(entry)
      entry.dlLink.style.display = 'none'
    })
    btnV.addEventListener('click', () => {
      entry.flippedV = !entry.flippedV
      btnV.classList.toggle('active', entry.flippedV)
      updateImgTransform(entry)
      statusLabel.textContent = getStatus(entry)
      entry.dlLink.style.display = 'none'
    })
    flipBtns.append(btnH, btnV)
    const fname = document.createElement('div')
    fname.className = 'card-fname'
    fname.textContent = file.name
    const statusLabel = document.createElement('div')
    statusLabel.className = 'card-status'
    statusLabel.textContent = 'No flip'
    const dlLink = document.createElement('a')
    dlLink.className = 'card-dl'
    dlLink.textContent = '⬇ Download'
    entry.dlLink = dlLink
    const rmBtn = document.createElement('button')
    rmBtn.className = 'card-rm'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => {
      files = files.filter(f => f !== entry)
      card.remove()
      if (files.length === 0) { actionRow.classList.remove('on'); statusText.textContent = ''; nextSteps.style.display = 'none' }
    })
    card.append(imgWrap, flipBtns, fname, statusLabel, dlLink, rmBtn)
    fileGrid.appendChild(card)
    files.push(entry)
  })
  if (files.length > 0) {
    actionRow.classList.add('on')
    zipBtn.style.display = 'none'
    statusText.textContent = 'Tap ⇄ H or ⇅ V on each image to flip individually, then download all.'
  }
}

function updateImgTransform(entry) {
  const sx = entry.flippedH ? -1 : 1
  const sy = entry.flippedV ? -1 : 1
  entry.img.style.transform = `scale(${sx}, ${sy})`
}

function flipToBlob(entry) {
  return new Promise(resolve => {
    const image = new Image()
    const url = URL.createObjectURL(entry.file)
    image.onload = () => {
      URL.revokeObjectURL(url)
      const W = image.naturalWidth, H = image.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')
      ctx.translate(entry.flippedH ? W : 0, entry.flippedV ? H : 0)
      ctx.scale(entry.flippedH ? -1 : 1, entry.flippedV ? -1 : 1)
      ctx.drawImage(image, 0, 0)
      const mime = entry.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const ext  = mime === 'image/png' ? 'png' : 'jpg'
      canvas.toBlob(blob => resolve({ blob, mime, ext }), mime, 0.92)
    }
    image.src = url
  })
}

applyBtn.addEventListener('click', async () => {
  if (!files.length) return
  applyBtn.disabled = true
  statusText.textContent = 'Processing…'
  const results = []
  lastResults = []

  for (const entry of files) {
    const baseName = entry.file.name.replace(/\.[^.]+$/, '')
    const suffix = entry.flippedH && entry.flippedV ? 'hv' : entry.flippedH ? 'h' : entry.flippedV ? 'v' : 'original'
    if (!entry.flippedH && !entry.flippedV) {
      const url = URL.createObjectURL(entry.file)
      const ext = entry.file.name.split('.').pop()
      entry.dlLink.href = url
      entry.dlLink.download = `${baseName}-flipped-${suffix}.${ext}`
      entry.dlLink.style.display = 'block'
      entry.dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
      const ab = await entry.file.arrayBuffer()
      const blob = new Blob([ab], { type: entry.file.type })
      results.push({ name: entry.dlLink.download, blob })
      lastResults.push({ blob, name: entry.dlLink.download, type: entry.file.type })
    } else {
      const { blob, mime, ext } = await flipToBlob(entry)
      const url = URL.createObjectURL(blob)
      entry.dlLink.href = url
      entry.dlLink.download = `${baseName}-flipped-${suffix}.${ext}`
      entry.dlLink.style.display = 'block'
      entry.dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
      results.push({ name: entry.dlLink.download, blob })
      lastResults.push({ blob, name: entry.dlLink.download, type: mime })
    }
  }

  applyBtn.disabled = false
  statusText.textContent = files.length > 1 ? `${files.length} images ready.` : 'Image ready.'
  if (files.length > 1) zipBtn.style.display = 'block'
  zipBtn._results = results
  buildNextSteps()
})

zipBtn.addEventListener('click', async () => {
  const results = zipBtn._results
  if (!results?.length) return
  zipBtn.textContent = 'Zipping…'
  zipBtn.disabled = true
  try {
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
    const zip = new JSZip()
    for (const r of results) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'flipped-images.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  } catch(e) { alert('ZIP failed: ' + e.message) }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

;(function injectSEO() {
  const seo = t.seo && t.seo['flip']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()

loadPendingFiles()