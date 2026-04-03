import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { jsPDF } from 'jspdf'
injectHreflang('merge-images')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['merge-images']) || 'Merge Images'
const seoData   = t.seo && t.seo['merge-images']
const descText  = seoData ? seoData.h2a : 'Merge multiple images side by side or stacked vertically. Free and private — files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = 'var(--bg-page)'

const mergeHorizontalLbl = t.merge_horizontal || 'Horizontal'
const mergeVerticalLbl   = t.merge_vertical || 'Vertical'
const mergeDirectionLbl  = t.merge_direction || 'Direction'
const mergeFormatLbl     = t.merge_format || 'Format'
const mergeSizingLbl     = t.merge_sizing || 'Sizing'
const autoAdjustLbl      = t.merge_auto_adjust || 'Auto Adjust'
const fitContentLbl      = t.merge_fit_content || 'Fit to Content'
const mergeBtnLbl        = t.merge_btn || 'Merge Images'
const mergeBtnLoadingLbl = t.merge_btn_loading || 'Merging...'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{border:2px dashed var(--border-light);border-radius:12px;padding:32px 20px;text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:18px;background:var(--bg-surface);}
  .drop-zone:hover,.drop-zone.drag-over{border-color:var(--accent);background:var(--accent-bg);}
  .drop-zone svg{margin-bottom:6px;color:var(--btn-disabled);transition:color 0.2s;}
  .drop-zone:hover svg,.drop-zone.drag-over svg{color:var(--accent);}
  .drop-zone p{margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text-muted);}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:16px;}
  .file-card{background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);overflow:visible;position:relative;padding-bottom:8px;}
  .card-img-wrap{position:relative;width:100%;height:100px;display:flex;align-items:center;justify-content:center;background:var(--bg-surface);border-radius:10px 10px 0 0;overflow:hidden;}
  .card-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block;}
  .card-fname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:4px 8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}
  .card-rm{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:6;}
  .card-order{position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;background:var(--accent);color:var(--text-on-accent);font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;z-index:6;}
  .options-row{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center;}
  .opt-group{display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text-secondary);}
  .opt-group label{font-weight:600;}
  .opt-group select{padding:6px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;background:var(--bg-card);color:var(--text-primary);cursor:pointer;}
  .opt-group select:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 3px rgba(200,75,49,0.12);}
  .dir-btn{padding:7px 14px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:13px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .dir-btn:hover{border-color:var(--accent);color:var(--accent);}
  .dir-btn.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent);}
  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;min-width:160px;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;}
  #previewWrap{display:none;margin-bottom:16px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:12px;text-align:center;overflow:auto;max-height:500px;}
  #previewWrap img{max-width:100%;border-radius:8px;}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .next-steps{margin-top:20px;}
  .next-steps-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px;}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px;}
  .seo-section ol{padding-left:20px;margin:0 0 12px;}
  .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px;}
  .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px;}
  
  
  
  
  .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
  .seo-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-primary);text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .seo-link:hover{border-color:var(--accent);color:var(--accent);}
    .seo-section .faq-item { background:var(--bg-card); border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:var(--text-primary); margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
`
document.head.appendChild(style)
document.title = `${toolName} Free & Private | RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>
    <div class="drop-zone" id="dropZone">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#F5F0E8"/>
        <circle cx="14" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="#DDD5C8"/>
        <path d="M6 26l7-6 5 4 6-5 10 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <rect x="14" y="16" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#fff" opacity="0.85"/>
        <path d="M28 30v-8m0 0l-3.5 3.5M28 22l3.5 3.5" stroke="#C84B31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>${t.drop_images || 'Drop images'}</p>
    </div>
    <div id="fileGrid"></div>
    <div class="options-row" id="optionsRow" style="display:none;">
      <div class="opt-group">
        <label>${mergeDirectionLbl}:</label>
        <button class="dir-btn active" id="dirH">⇄ ${mergeHorizontalLbl}</button>
        <button class="dir-btn" id="dirV">⇅ ${mergeVerticalLbl}</button>
      </div>
      <div class="opt-group">
        <label>${mergeFormatLbl}:</label>
        <select id="formatSelect">
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="application/pdf">PDF</option>
        </select>
      </div>
      <div class="opt-group">
        <label>${mergeSizingLbl}:</label>
        <select id="sizingSelect">
          <option value="auto">${autoAdjustLbl}</option>
          <option value="fit">${fitContentLbl}</option>
        </select>
      </div>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="mergeBtn">${mergeBtnLbl}</button>
    </div>
    <div id="previewWrap"><img id="previewImg" /></div>
    <div id="dlRow" style="display:none;margin-bottom:16px;">
      <a id="dlLink" class="action-btn" style="display:inline-block;text-align:center;text-decoration:none;background:var(--btn-dark);color:var(--text-on-dark-btn);" download>⬇ ${dlBtn}</a>
    </div>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileGrid     = document.getElementById('fileGrid')
const optionsRow   = document.getElementById('optionsRow')
const actionRow    = document.getElementById('actionRow')
const mergeBtn     = document.getElementById('mergeBtn')
const statusText   = document.getElementById('statusText')
const previewWrap  = document.getElementById('previewWrap')
const previewImg   = document.getElementById('previewImg')
const dlRow        = document.getElementById('dlRow')
const dlLink       = document.getElementById('dlLink')
const dirH         = document.getElementById('dirH')
const dirV         = document.getElementById('dirV')
const formatSelect = document.getElementById('formatSelect')
const sizingSelect = document.getElementById('sizingSelect')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

const MAX_FILES = 25
const MAX_TOTAL_BYTES = 200 * 1024 * 1024 // 200MB

let files = []
let direction = 'horizontal'
let lastBlobUrl = null

dirH.addEventListener('click', () => { direction = 'horizontal'; dirH.classList.add('active'); dirV.classList.remove('active') })
dirV.addEventListener('click', () => { direction = 'vertical'; dirV.classList.add('active'); dirH.classList.remove('active') })

function updateUI() {
  const dz = document.getElementById('dropZone')
  if (files.length >= 2) {
    dz.style.display = 'none'
    optionsRow.style.display = 'flex'
    actionRow.classList.add('on')
    statusText.textContent = `${files.length} images selected. Choose direction and merge.`
  } else if (files.length === 1) {
    dz.style.display = 'none'
    optionsRow.style.display = 'none'
    actionRow.classList.remove('on')
    statusText.textContent = 'Add at least 2 images to merge.'
  } else {
    dz.style.display = ''
    optionsRow.style.display = 'none'
    actionRow.classList.remove('on')
    statusText.textContent = ''
  }
  // Revoke previous result when UI resets
  if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null }
  previewWrap.style.display = 'none'
  dlRow.style.display = 'none'
}

function renderCards() {
  fileGrid.innerHTML = ''
  files.forEach((entry, i) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    const imgWrap = document.createElement('div')
    imgWrap.className = 'card-img-wrap'
    const img = document.createElement('img')
    const url = URL.createObjectURL(entry.file)
    img.src = url
    img.onload = () => URL.revokeObjectURL(url)
    imgWrap.appendChild(img)
    const order = document.createElement('div')
    order.className = 'card-order'
    order.textContent = i + 1
    const fname = document.createElement('div')
    fname.className = 'card-fname'
    fname.textContent = entry.file.name
    const rmBtn = document.createElement('button')
    rmBtn.className = 'card-rm'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => { files.splice(i, 1); renderCards(); updateUI() })
    card.append(imgWrap, order, fname, rmBtn)
    fileGrid.appendChild(card)
  })
}

function getTotalBytes() {
  return files.reduce((sum, e) => sum + e.file.size, 0)
}

function addFiles(newFiles) {
  let skipped = 0
  Array.from(newFiles).forEach(file => {
    if (!file.type.startsWith('image/')) return
    if (files.length >= MAX_FILES) { skipped++; return }
    if (getTotalBytes() + file.size > MAX_TOTAL_BYTES) { skipped++; return }
    files.push({ file })
  })
  if (skipped > 0) {
    statusText.textContent = `${skipped} file(s) skipped. Limit: ${MAX_FILES} images, 200MB total.`
  }
  renderCards()
  updateUI()
}

// Track blob URLs so we can revoke AFTER drawImage, not before
var _imgBlobUrls = []
function loadImage(file) {
  return new Promise(function (resolve, reject) {
    var img = new Image()
    var url = URL.createObjectURL(file)
    _imgBlobUrls.push(url)
    img.onload = function () {
      // Do NOT revoke blob URL here — older iOS loses pixel data if revoked before drawImage
      if (img.decode) {
        img.decode().then(function () { resolve(img) }).catch(function () { resolve(img) })
      } else {
        setTimeout(function () { resolve(img) }, 50)
      }
    }
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}
function revokeImageUrls() {
  _imgBlobUrls.forEach(function (u) { try { URL.revokeObjectURL(u) } catch (e) {} })
  _imgBlobUrls = []
}

// Safe max — avoids call stack overflow with spread on older engines
function safeMax(arr) {
  var m = arr[0]; for (var i = 1; i < arr.length; i++) { if (arr[i] > m) m = arr[i] } return m
}

// Older iOS Safari has canvas size limits. iPhone 8 (2GB) can fail above ~5MP.
var MAX_CANVAS_AREA = 4194304 // 2048*2048 — safe for all iOS devices
function clampCanvas(w, h) {
  var area = w * h
  if (area <= MAX_CANVAS_AREA) return { w: w, h: h }
  var ratio = Math.sqrt(MAX_CANVAS_AREA / area)
  return { w: Math.floor(w * ratio), h: Math.floor(h * ratio) }
}

// canvas.toBlob polyfill for older iOS Safari
function dataURLtoBlob(dataURL) {
  if (!dataURL || typeof dataURL !== 'string') throw new Error('Invalid dataURL')
  var parts = dataURL.split(',')
  var byteString = parts[1] ? atob(parts[1]) : ''
  var mimeMatch = parts[0] && parts[0].match(/:(.*?);/)
  var mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
  var ab = new ArrayBuffer(byteString.length)
  var ia = new Uint8Array(ab)
  for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
  return new Blob([ab], { type: mimeType })
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise(function (resolve, reject) {
    function fallback() {
      try { resolve(dataURLtoBlob(canvas.toDataURL(mime, quality))) }
      catch (e) { reject(e) }
    }
    try {
      if (canvas.toBlob) {
        var done = false
        // Timeout: if toBlob callback never fires (older iOS Safari), fallback
        var timer = setTimeout(function () {
          if (!done) { done = true; fallback() }
        }, 2000)
        canvas.toBlob(function (blob) {
          if (done) return
          done = true
          clearTimeout(timer)
          if (blob) { resolve(blob) } else { fallback() }
        }, mime, quality)
      } else {
        fallback()
      }
    } catch (e) {
      fallback()
    }
  })
}

mergeBtn.addEventListener('click', function () {
  if (files.length < 2) return
  mergeBtn.disabled = true
  mergeBtn.textContent = mergeBtnLoadingLbl
  statusText.textContent = 'Merging...'

  Promise.all(files.map(function (f) { return loadImage(f.file) })).then(function (images) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported on this device')
    var mime = formatSelect.value
    var sizing = sizingSelect.value
    var i, clamped, scaleDown

    if (sizing === 'fit') {
      if (direction === 'horizontal') {
        var maxH = safeMax(images.map(function (img) { return img.naturalHeight }))
        var totalW = images.reduce(function (sum, img) { return sum + img.naturalWidth }, 0)
        clamped = clampCanvas(totalW, maxH)
        scaleDown = clamped.w / totalW
        canvas.width = clamped.w
        canvas.height = clamped.h
        if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, clamped.w, clamped.h) }
        var x = 0
        for (i = 0; i < images.length; i++) {
          var dw = Math.round(images[i].naturalWidth * scaleDown)
          ctx.drawImage(images[i], x, 0, dw, clamped.h)
          x += dw
        }
      } else {
        var maxW = safeMax(images.map(function (img) { return img.naturalWidth }))
        var totalH = images.reduce(function (sum, img) { return sum + img.naturalHeight }, 0)
        clamped = clampCanvas(maxW, totalH)
        scaleDown = clamped.h / totalH
        canvas.width = clamped.w
        canvas.height = clamped.h
        if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, clamped.w, clamped.h) }
        var y = 0
        for (i = 0; i < images.length; i++) {
          var dh = Math.round(images[i].naturalHeight * scaleDown)
          ctx.drawImage(images[i], 0, y, clamped.w, dh)
          y += dh
        }
      }
    } else {
      if (direction === 'horizontal') {
        var maxH2 = safeMax(images.map(function (img) { return img.naturalHeight }))
        var totalW2 = images.reduce(function (sum, img) {
          var scale = maxH2 / img.naturalHeight
          return sum + Math.round(img.naturalWidth * scale)
        }, 0)
        clamped = clampCanvas(totalW2, maxH2)
        scaleDown = clamped.w / totalW2
        canvas.width = clamped.w
        canvas.height = clamped.h
        if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, clamped.w, clamped.h) }
        var x2 = 0
        for (i = 0; i < images.length; i++) {
          var s = maxH2 / images[i].naturalHeight
          var w = Math.round(images[i].naturalWidth * s * scaleDown)
          ctx.drawImage(images[i], x2, 0, w, clamped.h)
          x2 += w
        }
      } else {
        var maxW2 = safeMax(images.map(function (img) { return img.naturalWidth }))
        var totalH2 = images.reduce(function (sum, img) {
          var scale2 = maxW2 / img.naturalWidth
          return sum + Math.round(img.naturalHeight * scale2)
        }, 0)
        clamped = clampCanvas(maxW2, totalH2)
        scaleDown = clamped.h / totalH2
        canvas.width = clamped.w
        canvas.height = clamped.h
        if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, clamped.w, clamped.h) }
        var y2 = 0
        for (i = 0; i < images.length; i++) {
          var s2 = maxW2 / images[i].naturalWidth
          var h = Math.round(images[i].naturalHeight * s2 * scaleDown)
          ctx.drawImage(images[i], 0, y2, clamped.w, h)
          y2 += h
        }
      }
    }

    // Now that all drawImage calls are done, revoke the source blob URLs
    revokeImageUrls()

    // Revoke previous result URL to free memory
    if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null }

    // Generate data URL for preview and download (works on all iOS versions)
    var ext, dataURL, dlHref
    if (mime === 'application/pdf') {
      var pxToMm = 25.4 / 96
      var wMm = canvas.width * pxToMm
      var hMm = canvas.height * pxToMm
      var orientation = wMm >= hMm ? 'l' : 'p'
      var pdf = new jsPDF({ orientation: orientation, unit: 'mm', format: [wMm, hMm] })
      var imgData = canvas.toDataURL('image/jpeg', 0.92)
      pdf.addImage(imgData, 'JPEG', 0, 0, wMm, hMm)
      var pdfBlob = pdf.output('blob')
      dlHref = URL.createObjectURL(pdfBlob)
      dataURL = canvas.toDataURL('image/png')
      ext = 'pdf'
    } else {
      ext = mime === 'image/png' ? 'png' : 'jpg'
      dataURL = canvas.toDataURL(mime, 0.92)
      dlHref = dataURL
    }

    lastBlobUrl = dlHref
    previewImg.src = dataURL
    previewWrap.style.display = 'block'
    dlLink.href = dlHref
    dlLink.download = 'merged-image.' + ext
    // For iOS: create a temporary <a> and click it programmatically if needed
    dlLink.onclick = function () {
      setTimeout(function () { if (lastBlobUrl && lastBlobUrl.indexOf('blob:') === 0) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null } }, 10000)
    }
    dlRow.style.display = 'block'
    statusText.textContent = 'Merge complete! Preview below.'
    buildNextSteps()

    return Promise.resolve()
  }).catch(function (e) {
    statusText.textContent = 'Merge failed: ' + (e.message || 'Unknown error')
  }).then(function () {
    mergeBtn.disabled = false
    mergeBtn.textContent = mergeBtnLbl
  })
})

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

function buildNextSteps() {
  var ns = t.nav_short || {}
  var buttons = []
  buttons.push({ label: ns.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: ns.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: ns.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: ns.watermark || 'Watermark', href: localHref('watermark') })
  buttons.push({ label: ns['jpg-to-pdf'] || 'JPG to PDF', href: localHref('jpg-to-pdf') })
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      // Save the merged image to IDB so the next tool can load it
      const href = dlLink.href || ''
      if (href) {
        try {
          const res = await fetch(href)
          const blob = await res.blob()
          const name = dlLink.download || 'merged-image.jpg'
          await saveFilesToIDB([{ blob, name, type: blob.type }])
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })

const dropZone = document.getElementById('dropZone')
dropZone.addEventListener('click', () => fileInput.click())
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
dropZone.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

;(function injectSEO() {
  const seo = t.seo && t.seo['merge-images']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()