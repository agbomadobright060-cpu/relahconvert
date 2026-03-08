import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const toolName  = (t.nav_short && t.nav_short['rotate']) || 'Rotate Image'
const seoData   = t.seo && t.seo['rotate']
const descText  = seoData ? seoData.h2a : 'Rotate any image free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlBtn     = t.download || 'Download'
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

    .opt-btn { padding:11px 24px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .opt-btn.secondary { background:#fff; color:#2C1810; border:1.5px solid #DDD5C8; }
    .opt-btn.secondary:hover { border-color:#C84B31; color:#C84B31; background:#fff; transform:translateY(-1px); }
    .download-btn { display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px; margin-top:12px; }
    .download-btn:hover { background:#1a0f09; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    .angle-badge { display:inline-block; background:#FDE8E3; color:#C84B31; font-weight:700; font-size:13px; padding:4px 12px; border-radius:20px; font-family:'DM Sans',sans-serif; }
    .section-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#9A8A7A; margin-bottom:10px; font-family:'DM Sans',sans-serif; }

    /* Two column layout */
    .tool-layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 20px;
      align-items: start;
    }

    /* Left: image area */
    .image-col {
      background: #fff;
      border-radius: 14px;
      border: 1.5px solid #E8E0D5;
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 24px;
      position: relative;
    }
    .image-col .empty-state {
      text-align: center;
      color: #C4B8A8;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
    }
    .image-col .empty-state svg { margin-bottom: 10px; opacity: 0.4; }

    #imgWrapper {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #previewImg {
      display: block;
      max-width: 260px;
      max-height: 260px;
      object-fit: contain;
      border-radius: 6px;
      user-select: none;
      pointer-events: none;
      transition: transform 0.3s ease;
    }
    #rotateHandle {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 28px;
      height: 28px;
      background: #fff;
      border: 2px solid #C84B31;
      border-radius: 50%;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(200,75,49,0.3);
      z-index: 10;
      transition: background 0.15s;
    }
    #rotateHandle:hover { background: #FDE8E3; }
    #rotateHandle.dragging { cursor: grabbing; background: #FDE8E3; }
    #rotateHandle::after {
      content: 'Drag to rotate';
      position: absolute;
      top: -28px;
      right: 0;
      background: #2C1810;
      color: #fff;
      font-size: 10px;
      font-family: 'DM Sans', sans-serif;
      padding: 3px 7px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    #rotateHandle:hover::after { opacity: 1; }

    /* Right: controls panel */
    .controls-col {
      background: #fff;
      border-radius: 14px;
      border: 1.5px solid #E8E0D5;
      padding: 20px;
      font-family: 'DM Sans', sans-serif;
    }
    .controls-col h3 {
      font-family: 'Fraunces', serif;
      font-size: 17px;
      font-weight: 700;
      color: #2C1810;
      margin: 0 0 18px;
    }

    .orient-group { display:flex; gap:8px; justify-content:center; margin-bottom:18px; }
    .orient-btn {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:10px 12px; border-radius:10px; border:2px solid #DDD5C8;
      background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif;
      font-size:12px; font-weight:600; color:#5A4A3A; transition:all 0.18s;
      flex:1;
    }
    .orient-btn:hover { border-color:#C84B31; color:#C84B31; }
    .orient-btn.active { border-color:#C84B31; background:#FDE8E3; color:#C84B31; }

    .rot-group { display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
    .rot-group .opt-btn { width:100%; text-align:center; padding:10px; font-size:13px; }

    .divider { height:1px; background:#F0EAE3; margin:16px 0; }

    /* Mobile: stack columns */
    @media (max-width: 700px) {
      .tool-layout { grid-template-columns: 1fr; }
      .image-col { min-height: 260px; }
      .rot-group { flex-direction: row; flex-wrap: wrap; }
      .rot-group .opt-btn { width: auto; flex: 1; }
      #imgWrapper { width: 220px; height: 220px; }
      #previewImg { max-width: 200px; max-height: 200px; }
    }
  `
  document.head.appendChild(style)
}

document.title = `${toolName} Free | No Upload — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div style="max-width:1000px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">

    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    </div>

    <div class="tool-layout" id="toolLayout" style="display:none;">

      <!-- Left: image preview -->
      <div class="image-col" id="imageCol">

        <div id="imgWrapper" style="display:none;">
          <img id="previewImg" src="" alt="preview" draggable="false" />
          <div id="rotateHandle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C84B31" stroke-width="2.5" stroke-linecap="round">
              <path d="M21 12a9 9 0 11-9-9"/>
              <polyline points="21 3 21 9 15 9"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Right: controls -->
      <div class="controls-col" id="controlsCol" style="display:none;">
        <h3>Rotate Image</h3>

        <div class="section-label">Select files to rotate</div>
        <div class="orient-group">
          <button class="orient-btn active" data-orient="all">
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none"><rect x="1" y="1" width="24" height="24" rx="3" stroke="currentColor" stroke-width="2"/></svg>
            All
          </button>
          <button class="orient-btn" data-orient="portrait">
            <svg width="14" height="20" viewBox="0 0 18 26" fill="none"><rect x="1" y="1" width="16" height="24" rx="3" stroke="currentColor" stroke-width="2"/></svg>
            Portrait
          </button>
          <button class="orient-btn" data-orient="landscape">
            <svg width="20" height="14" viewBox="0 0 26 18" fill="none"><rect x="1" y="1" width="24" height="16" rx="3" stroke="currentColor" stroke-width="2"/></svg>
            Landscape
          </button>
        </div>

        <div class="divider"></div>

        <div class="section-label">Rotation</div>
        <div class="rot-group">
          <button class="opt-btn secondary" id="rotL">↺ Rotate Left 90°</button>
          <button class="opt-btn secondary" id="rotR">↻ Rotate Right 90°</button>
          <button class="opt-btn secondary" id="rot180">↕ Rotate 180°</button>
        </div>

        <div class="divider"></div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
          <span style="font-size:13px; color:#9A8A7A;">Current rotation</span>
          <span class="angle-badge" id="angleBadge">0°</span>
        </div>

        <button class="opt-btn" id="applyBtn" disabled style="width:100%; margin-bottom:10px;">${dlBtn}</button>
        <a class="download-btn" id="downloadLink">${dlBtn}</a>
      </div>

    </div>
  </div>
`

injectHeader()

// Orientation buttons — visual only
document.querySelectorAll('.orient-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
  })
})

const fileInput    = document.getElementById('fileInput')
const imgWrapper   = document.getElementById('imgWrapper')
const previewImg   = document.getElementById('previewImg')
const rotateHandle = document.getElementById('rotateHandle')
const applyBtn     = document.getElementById('applyBtn')
const downloadLink = document.getElementById('downloadLink')
const angleBadge   = document.getElementById('angleBadge')

let originalFile = null
let angle = 0

function setAngle(deg) {
  angle = ((deg % 360) + 360) % 360
  angleBadge.textContent = Math.round(angle) + '°'
  previewImg.style.transform = `rotate(${angle}deg)`
}

function snapAngle(deg) {
  const snapped = Math.round(deg / 90) * 90
  return Math.abs(deg - snapped) < 8 ? snapped : deg
}

document.getElementById('rotL').addEventListener('click', () => setAngle(angle - 90))
document.getElementById('rotR').addEventListener('click', () => setAngle(angle + 90))
document.getElementById('rot180').addEventListener('click', () => setAngle(angle + 180))

// Drag-to-rotate
let isDragging = false
let startAngle = 0
let startMouseAngle = 0

function getMouseAngle(e) {
  const rect = imgWrapper.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
}

rotateHandle.addEventListener('mousedown', e => {
  e.preventDefault()
  isDragging = true
  startAngle = angle
  startMouseAngle = getMouseAngle(e)
  rotateHandle.classList.add('dragging')
  document.body.style.userSelect = 'none'
})

rotateHandle.addEventListener('touchstart', e => {
  e.preventDefault()
  isDragging = true
  startAngle = angle
  startMouseAngle = getMouseAngle(e)
  rotateHandle.classList.add('dragging')
}, { passive: false })

document.addEventListener('mousemove', e => {
  if (!isDragging) return
  const delta = getMouseAngle(e) - startMouseAngle
  setAngle(snapAngle(startAngle + delta))
})

document.addEventListener('touchmove', e => {
  if (!isDragging) return
  e.preventDefault()
  const delta = getMouseAngle(e) - startMouseAngle
  setAngle(snapAngle(startAngle + delta))
}, { passive: false })

document.addEventListener('mouseup', () => {
  if (!isDragging) return
  isDragging = false
  rotateHandle.classList.remove('dragging')
  document.body.style.userSelect = ''
})

document.addEventListener('touchend', () => {
  if (!isDragging) return
  isDragging = false
  rotateHandle.classList.remove('dragging')
})

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  setAngle(0)
  previewImg.src = URL.createObjectURL(file)
  imgWrapper.style.display = 'flex'
  applyBtn.disabled = false
  downloadLink.style.display = 'none'
  document.getElementById('toolLayout').style.display = 'grid'
  document.getElementById('controlsCol').style.display = 'block'
  document.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('active'))
  document.querySelector('[data-orient="all"]').classList.add('active')
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
    downloadLink.download = `rotated-${Math.round(angle)}deg.${ext}`
    downloadLink.textContent = `Download Rotated Image (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})

// ── SEO Section ──────────────────────────────────────────────────────────────
;(function injectSEO() {
  // t already defined at top of file
  const seo = t.seo && t.seo['rotate']
  if (!seo) return
  const faqTitle = (t.seo_faq_title) || 'Frequently Asked Questions'
  const alsoTry  = (t.seo_also_try)  || 'Also Try'
  const style = document.createElement('style')
  style.textContent = `
    .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px;}
    .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:24px 0 8px;}
    .seo-section ol{padding-left:20px;margin:0 0 12px;}
    .seo-section ol li{font-size:13px;color:#5A4A3A;line-height:1.6;margin-bottom:6px;}
    .seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin:0 0 12px;}
    .seo-faq{border-top:1px solid #E8E0D5;padding:10px 0;}
    .seo-faq:last-child{border-bottom:1px solid #E8E0D5;}
    .seo-faq-q{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif;}
    .seo-faq-a{font-size:13px;color:#5A4A3A;margin:0;line-height:1.6;}
    .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
    .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
    .seo-link:hover{border-color:#C84B31;color:#C84B31;}
  `
  document.head.appendChild(style)
  const stepsHtml = seo.steps.map(s => `<li>${s}</li>`).join('')
  const faqsHtml  = seo.faqs.map(f => `<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')
  const linksHtml = seo.links.map(l => `<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${stepsHtml}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${faqsHtml}<h3>${alsoTry}</h3><div class="seo-links">${linksHtml}</div>`
  document.querySelector('#app').appendChild(div)
})()
// ─────────────────────────────────────────────────────────────────────────────