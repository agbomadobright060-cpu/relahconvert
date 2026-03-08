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

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}
  .opt-btn{width:100%;padding:13px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
  .opt-btn:hover{background:#A63D26;transform:translateY(-1px);}
  .opt-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none;}
  .download-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:#2C1810;text-decoration:none;color:#F5F0E8;font-family:'Fraunces',serif;font-weight:700;font-size:15px;margin-bottom:10px;}
  .download-btn:hover{background:#1a0f09;}

  /* Split viewer */
  #viewerWrap{display:none;position:relative;width:100%;border-radius:12px;overflow:hidden;border:1.5px solid #E8E0D5;background:#fff;margin-bottom:16px;cursor:ew-resize;user-select:none;}
  #viewerWrap canvas{display:block;width:100%;height:auto;}
  #divider{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 6px rgba(0,0,0,0.35);transform:translateX(-50%);pointer-events:none;z-index:10;}
  #dividerHandle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;}

  .progress-wrap{background:#E8E0D5;border-radius:8px;height:5px;margin-bottom:10px;overflow:hidden;display:none;}
  .progress-bar{height:100%;background:#C84B31;border-radius:8px;width:0%;transition:width 0.25s;}
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
document.title = `${toolName} Free | No Upload — RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 24px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />

    <div id="viewerWrap">
      <canvas id="viewerCanvas"></canvas>
      <div id="divider">
        <div id="dividerHandle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C84B31" stroke-width="2.5" stroke-linecap="round">
            <path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="progress-wrap" id="progressWrap"><div class="progress-bar" id="progressBar"></div></div>
    <div class="status-text" id="statusText"></div>
    <button class="opt-btn" id="removeBtn" disabled>Remove Background</button>
    <a class="download-btn" id="downloadLink">${dlBtn}</a>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const viewerWrap   = document.getElementById('viewerWrap')
const canvas       = document.getElementById('viewerCanvas')
const divider      = document.getElementById('divider')
const removeBtn    = document.getElementById('removeBtn')
const downloadLink = document.getElementById('downloadLink')
const progressWrap = document.getElementById('progressWrap')
const progressBar  = document.getElementById('progressBar')
const statusText   = document.getElementById('statusText')

let origImg    = null
let resultOff  = null   // offscreen canvas with removed-bg result
let splitPct   = 0.5
let dragging   = false
let loadedFile = null

// ── Checker ───────────────────────────────────────────────────────────────────
function drawChecker(ctx, x, y, w, h, sz = 12) {
  for (let r = 0; r * sz < h; r++) {
    for (let c = 0; c * sz < w; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#cccccc' : '#f0f0f0'
      ctx.fillRect(x + c * sz, y + r * sz, sz, sz)
    }
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  if (!origImg) return
  const W = origImg.naturalWidth
  const H = origImg.naturalHeight
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W
    canvas.height = H
  }
  const ctx = canvas.getContext('2d')
  const sx = Math.round(W * splitPct)

  ctx.clearRect(0, 0, W, H)

  // Left: original
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, sx, H); ctx.clip()
  ctx.drawImage(origImg, 0, 0, W, H)
  ctx.restore()

  // Right: checker + result (or just original greyed if no result yet)
  ctx.save()
  ctx.beginPath(); ctx.rect(sx, 0, W - sx, H); ctx.clip()
  if (resultOff) {
    drawChecker(ctx, sx, 0, W - sx, H)
    ctx.drawImage(resultOff, 0, 0, W, H)
  } else {
    // Before processing: right side shows original (slider still works live)
    ctx.drawImage(origImg, 0, 0, W, H)
  }
  ctx.restore()

  divider.style.left = (splitPct * 100) + '%'
}

// ── Drag ──────────────────────────────────────────────────────────────────────
function getPct(cx) {
  const r = viewerWrap.getBoundingClientRect()
  return Math.max(0.02, Math.min(0.98, (cx - r.left) / r.width))
}
viewerWrap.addEventListener('mousedown', e => { dragging = true; splitPct = getPct(e.clientX); render() })
document.addEventListener('mousemove', e => { if (!dragging) return; splitPct = getPct(e.clientX); render() })
document.addEventListener('mouseup', () => { dragging = false })
viewerWrap.addEventListener('touchstart', e => { dragging = true; splitPct = getPct(e.touches[0].clientX); render(); e.preventDefault() }, { passive: false })
document.addEventListener('touchmove', e => { if (!dragging) return; splitPct = getPct(e.touches[0].clientX); render() }, { passive: true })
document.addEventListener('touchend', () => { dragging = false })

// ── Load ──────────────────────────────────────────────────────────────────────
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  loadedFile = file
  resultOff = null
  splitPct = 0.5
  downloadLink.style.display = 'none'
  progressWrap.style.display = 'none'
  statusText.textContent = ''

  const img = new Image()
  img.onload = () => {
    origImg = img
    viewerWrap.style.display = 'block'
    render()
    removeBtn.disabled = false
    statusText.textContent = 'Image loaded — hit Remove Background.'
  }
  img.src = URL.createObjectURL(file)
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

// ── Process ───────────────────────────────────────────────────────────────────
removeBtn.addEventListener('click', async () => {
  if (!loadedFile) return
  removeBtn.disabled = true
  downloadLink.style.display = 'none'
  progressWrap.style.display = 'block'
  progressBar.style.width = '8%'
  statusText.textContent = 'Loading AI model…'

  try {
    const { removeBackground } = await import('@imgly/background-removal')
    progressBar.style.width = '30%'
    statusText.textContent = 'Removing background…'

    const blob = await removeBackground(loadedFile, {
      model: 'small',
      progress: (key, cur, tot) => {
        if (tot > 0) progressBar.style.width = (30 + Math.round((cur / tot) * 60)) + '%'
      },
    })

    progressBar.style.width = '100%'

    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const W = origImg.naturalWidth
      const H = origImg.naturalHeight
      const off = document.createElement('canvas')
      off.width = W; off.height = H
      off.getContext('2d').drawImage(img, 0, 0, W, H)
      resultOff = off
      splitPct = 0.5
      render()
      statusText.textContent = 'Done — drag the line to compare.'
      downloadLink.href = url
      downloadLink.download = loadedFile.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
      downloadLink.textContent = `${dlBtn} PNG (${Math.round(blob.size / 1024)} KB)`
      downloadLink.style.display = 'block'
      removeBtn.disabled = false
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
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `
    <h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <h2>${seo.h2b}</h2>${seo.body}
    <h3>${seo.h3why}</h3><p>${seo.why}</p>
    <h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}
    <h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.querySelector('#app').appendChild(div)
})()