import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const bg = '#F2F2F2'

const toolName  = (t.nav_short && t.nav_short['remove-background']) || 'Remove Background'
const seoData   = t.seo && t.seo['remove-background']
const descText  = seoData ? seoData.h2a : 'Remove image background free. AI-powered, runs entirely in your browser.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')

if (document.head) {
  document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #app>div{animation:fadeUp 0.4s ease both}
    .opt-btn{width:100%;padding:13px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
    .opt-btn:hover{background:#A63D26;transform:translateY(-1px);}
    .opt-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none;}
    .download-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:#2C1810;text-decoration:none;color:#F5F0E8;font-family:'Fraunces',serif;font-weight:700;font-size:15px;margin-bottom:10px;}
    .download-btn:hover{background:#1a0f09;}
    .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;}

    .slider-wrap{position:relative;width:100%;max-width:700px;max-height:420px;overflow:hidden;border-radius:12px;background:#fff;border:1.5px solid #E8E0D5;margin-bottom:16px;user-select:none;cursor:ew-resize;}
    .slider-wrap canvas{display:block;width:100%;height:100%;object-fit:contain;}
    .divider-line{position:absolute;top:0;bottom:0;width:3px;background:#fff;box-shadow:0 0 8px rgba(0,0,0,0.3);transform:translateX(-50%);z-index:10;pointer-events:none;}
    .divider-handle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;}
    .divider-handle svg{display:block;}
    .side-label{position:absolute;top:12px;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;padding:4px 10px;border-radius:20px;background:rgba(0,0,0,0.45);color:#fff;letter-spacing:0.06em;text-transform:uppercase;pointer-events:none;}
    .label-before{left:14px;}
    .label-after{right:14px;}

    .progress-wrap{background:#E8E0D5;border-radius:8px;height:6px;margin-bottom:10px;overflow:hidden;display:none;}
    .progress-bar{height:100%;background:#C84B31;border-radius:8px;width:0%;transition:width 0.3s;}
    .status-text{font-size:13px;color:#7A6A5A;text-align:center;margin-bottom:10px;font-family:'DM Sans',sans-serif;min-height:18px;}

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
}

document.title = `${toolName} Free | No Upload — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 24px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />

    <div id="sliderWrap" class="slider-wrap" style="display:none;">
      <canvas id="sliderCanvas"></canvas>
      <div class="divider-line" id="dividerLine">
        <div class="divider-handle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C84B31" stroke-width="2.5" stroke-linecap="round">
            <path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
      <span class="side-label label-before">Before</span>
      <span class="side-label label-after">After</span>
    </div>

    <div class="progress-wrap" id="progressWrap"><div class="progress-bar" id="progressBar"></div></div>
    <div class="status-text" id="statusText"></div>

    <button class="opt-btn" id="removeBtn" disabled>Remove Background</button>
    <a class="download-btn" id="downloadLink">${dlBtn}</a>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const sliderWrap   = document.getElementById('sliderWrap')
const sliderCanvas = document.getElementById('sliderCanvas')
const dividerLine  = document.getElementById('dividerLine')
const removeBtn    = document.getElementById('removeBtn')
const downloadLink = document.getElementById('downloadLink')
const progressWrap = document.getElementById('progressWrap')
const progressBar  = document.getElementById('progressBar')
const statusText   = document.getElementById('statusText')

let originalImg = null
let resultImg   = null
let sliderPct   = 0.5
let dragging    = false
let loadedFile  = null

// ── Constrain canvas size: max 700×420 display, keep aspect ratio ─────────────
function getCanvasDims(W, H) {
  const maxW = 700, maxH = 420
  const scale = Math.min(maxW / W, maxH / H, 1)
  return { dispW: Math.round(W * scale), dispH: Math.round(H * scale) }
}

function drawChecker(ctx, x, y, w, h, size = 14) {
  for (let row = 0; row * size < h; row++) {
    for (let col = 0; col * size < w; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#d0d0d0' : '#f8f8f8'
      ctx.fillRect(x + col * size, y + row * size, size, size)
    }
  }
}

function renderSplit() {
  if (!originalImg) return
  const W = originalImg.naturalWidth
  const H = originalImg.naturalHeight
  const { dispW, dispH } = getCanvasDims(W, H)

  // Set canvas pixel dimensions to display size (avoids scaling mismatch)
  sliderCanvas.width  = dispW
  sliderCanvas.height = dispH
  sliderCanvas.style.width  = dispW + 'px'
  sliderCanvas.style.height = dispH + 'px'
  sliderWrap.style.height   = dispH + 'px'

  const ctx = sliderCanvas.getContext('2d')
  const splitX = Math.round(dispW * sliderPct)

  // Left: original
  ctx.drawImage(originalImg, 0, 0, dispW, dispH)

  // Right: checker + result (or just checker if still processing)
  ctx.save()
  ctx.beginPath()
  ctx.rect(splitX, 0, dispW - splitX, dispH)
  ctx.clip()
  drawChecker(ctx, 0, 0, dispW, dispH)
  if (resultImg) ctx.drawImage(resultImg, 0, 0, dispW, dispH)
  ctx.restore()

  dividerLine.style.left = (sliderPct * 100) + '%'
}

// ── Drag — use getBoundingClientRect for accurate pointer position ────────────
function getPct(clientX) {
  const rect = sliderWrap.getBoundingClientRect()
  return Math.max(0.02, Math.min(0.98, (clientX - rect.left) / rect.width))
}

sliderWrap.addEventListener('mousedown', e => { dragging = true; sliderPct = getPct(e.clientX); renderSplit() })
document.addEventListener('mousemove', e => { if (!dragging) return; sliderPct = getPct(e.clientX); renderSplit() })
document.addEventListener('mouseup', () => { dragging = false })
sliderWrap.addEventListener('touchstart', e => { dragging = true; sliderPct = getPct(e.touches[0].clientX); renderSplit(); e.preventDefault() }, { passive: false })
document.addEventListener('touchmove', e => { if (!dragging) return; sliderPct = getPct(e.touches[0].clientX); renderSplit() }, { passive: true })
document.addEventListener('touchend', () => { dragging = false })

// ── Load file ─────────────────────────────────────────────────────────────────
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  loadedFile = file
  resultImg = null
  sliderPct = 0.5
  downloadLink.style.display = 'none'
  statusText.textContent = ''
  progressWrap.style.display = 'none'

  const img = new Image()
  img.onload = () => {
    originalImg = img
    sliderWrap.style.display = 'block'
    renderSplit()
    removeBtn.disabled = false
  }
  img.src = URL.createObjectURL(file)
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

// ── Remove background ─────────────────────────────────────────────────────────
removeBtn.addEventListener('click', async () => {
  if (!loadedFile) return
  removeBtn.disabled = true
  downloadLink.style.display = 'none'
  progressWrap.style.display = 'block'
  progressBar.style.width = '10%'
  statusText.textContent = 'Loading AI model…'

  try {
    const { removeBackground } = await import("@imgly/background-removal")

    progressBar.style.width = '35%'
    statusText.textContent = 'Removing background…'

    const blob = await removeBackground(loadedFile, {
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = 35 + Math.round((current / total) * 55)
          progressBar.style.width = pct + '%'
        }
      },
    })

    progressBar.style.width = '100%'
    statusText.textContent = 'Done! Drag the slider to compare.'

    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      resultImg = img
      sliderPct = 0.5
      renderSplit()
      downloadLink.href = url
      downloadLink.download = loadedFile.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
      downloadLink.textContent = `${dlBtn} PNG (${Math.round(blob.size / 1024)} KB)`
      downloadLink.style.display = 'block'
      removeBtn.disabled = false
      // Scroll download into view
      downloadLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    img.src = url

  } catch (err) {
    statusText.textContent = 'Error: ' + (err.message || 'Could not process image.')
    progressWrap.style.display = 'none'
    removeBtn.disabled = false
    console.error(err)
  }
})

// ── SEO ───────────────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo['remove-background']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const stepsHtml = seo.steps.map(s => `<li>${s}</li>`).join('')
  const faqsHtml  = seo.faqs.map(f => `<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')
  const linksHtml = seo.links.map(l => `<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${stepsHtml}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${faqsHtml}<h3>${alsoTry}</h3><div class="seo-links">${linksHtml}</div>`
  document.querySelector('#app').appendChild(div)
})()