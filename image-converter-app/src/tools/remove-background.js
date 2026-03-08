import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const bg = '#F2F2F2'
const toolName  = (t.nav_short && t.nav_short['remove-background']) || 'Remove Background'
const seoData   = t.seo && t.seo['remove-background']
const descText  = seoData ? seoData.h2a : 'Remove image background free. AI-powered, runs entirely in your browser.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlBtn     = t.download || 'Download PNG'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  @keyframes spin{to{transform:rotate(360deg)}}

  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}

  #previewBox{display:none;position:relative;width:100%;border-radius:12px;overflow:hidden;border:1.5px solid #E8E0D5;background:#e8e8e8;margin-bottom:14px;}
  #previewBox canvas{display:block;width:100%;height:auto;}

  /* Spinner overlay while AI loads */
  #spinOverlay{display:none;position:absolute;inset:0;background:rgba(255,255,255,0.7);z-index:20;flex-direction:column;align-items:center;justify-content:center;gap:12px;}
  #spinOverlay.on{display:flex;}
  .spinner{width:38px;height:38px;border:3px solid #E8E0D5;border-top-color:#C84B31;border-radius:50%;animation:spin 0.7s linear infinite;}
  .spin-label{font-family:'DM Sans',sans-serif;font-size:13px;color:#5A4A3A;font-weight:600;}
  .spin-prog{width:150px;height:4px;background:#E8E0D5;border-radius:4px;overflow:hidden;}
  .spin-bar{height:100%;background:#C84B31;border-radius:4px;width:0%;transition:width 0.2s;}

  /* Threshold slider */
  #sliderRow{display:none;align-items:center;gap:12px;margin-bottom:14px;}
  #sliderRow label{font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #threshSlider{flex:1;accent-color:#C84B31;cursor:pointer;height:4px;}

  .dl-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:#C84B31;border:none;color:#fff;font-family:'Fraunces',serif;font-weight:700;font-size:15px;cursor:pointer;margin-bottom:10px;transition:background 0.15s;}
  .dl-btn:hover{background:#A63D26;}
  .new-btn{display:none;width:100%;padding:11px;border:1.5px solid #C84B31;border-radius:10px;background:transparent;color:#C84B31;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;margin-bottom:16px;transition:all 0.15s;}
  .new-btn:hover{background:#C84B31;color:#fff;}

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

    <div id="uploadArea" style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />

    <div id="previewBox">
      <canvas id="previewCanvas"></canvas>
      <div id="spinOverlay">
        <div class="spinner"></div>
        <div class="spin-prog"><div class="spin-bar" id="spinBar"></div></div>
        <div class="spin-label" id="spinLabel">Loading AI model…</div>
      </div>
    </div>

    <div id="sliderRow">
      <label>Background removal:</label>
      <input type="range" id="threshSlider" min="0" max="100" value="0" />
      <span id="sliderVal" style="font-size:12px;color:#5A4A3A;font-family:'DM Sans',sans-serif;width:32px;text-align:right;">0%</span>
    </div>

    <div class="status-text" id="statusText"></div>
    <button class="dl-btn" id="dlBtn">${dlBtn}</button>
    <button class="new-btn" id="newBtn">+ Try another image</button>
  </div>
`

injectHeader()

const fileInput   = document.getElementById('fileInput')
const uploadArea  = document.getElementById('uploadArea')
const previewBox  = document.getElementById('previewBox')
const previewCvs  = document.getElementById('previewCanvas')
const spinOverlay = document.getElementById('spinOverlay')
const spinBar     = document.getElementById('spinBar')
const spinLabel   = document.getElementById('spinLabel')
const sliderRow   = document.getElementById('sliderRow')
const threshSlider= document.getElementById('threshSlider')
const sliderVal   = document.getElementById('sliderVal')
const statusText  = document.getElementById('statusText')
const dlBtnEl     = document.getElementById('dlBtn')
const newBtn      = document.getElementById('newBtn')

// origData = ImageData of original, maskData = alpha channel from AI result
let origData = null
let maskData = null   // Uint8ClampedArray — alpha values per pixel from AI
let currentFile = null

// ── Draw preview blending original with mask at given intensity (0–1) ─────────
function drawBlend(intensity) {
  if (!origData || !maskData) return
  const W = previewCvs.width, H = previewCvs.height
  const ctx = previewCvs.getContext('2d')

  // Draw checker
  const sz = 14
  for (let r = 0; r * sz < H; r++)
    for (let c = 0; c * sz < W; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#cccccc' : '#f0f0f0'
      ctx.fillRect(c * sz, r * sz, sz, sz)
    }

  // Build blended ImageData
  const out = ctx.createImageData(W, H)
  const src = origData.data
  const d   = out.data
  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    d[p]   = src[p]
    d[p+1] = src[p+1]
    d[p+2] = src[p+2]
    // alpha: blend between fully opaque (0%) and AI mask (100%)
    const aiAlpha = maskData[i]
    d[p+3] = Math.round(255 * (1 - intensity) + aiAlpha * intensity)
  }
  ctx.putImageData(out, 0, 0)
}

threshSlider.addEventListener('input', () => {
  const v = parseInt(threshSlider.value)
  sliderVal.textContent = v + '%'
  drawBlend(v / 100)
})

// ── Process ───────────────────────────────────────────────────────────────────
async function processFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  currentFile = file
  origData = null
  maskData = null
  threshSlider.value = 0
  sliderVal.textContent = '0%'
  dlBtnEl.style.display = 'none'
  newBtn.style.display = 'none'
  statusText.textContent = ''
  uploadArea.style.display = 'none'

  // Load original into canvas
  await new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight
      previewCvs.width = W
      previewCvs.height = H
      const ctx = previewCvs.getContext('2d')
      ctx.drawImage(img, 0, 0)
      origData = ctx.getImageData(0, 0, W, H)
      resolve()
    }
    img.src = URL.createObjectURL(file)
  })

  previewBox.style.display = 'block'
  spinOverlay.classList.add('on')
  spinBar.style.width = '8%'
  spinLabel.textContent = 'Loading AI model…'

  try {
    const { removeBackground } = await import('@imgly/background-removal')
    spinBar.style.width = '30%'
    spinLabel.textContent = 'Removing background…'

    const blob = await removeBackground(file, {
      model: 'small',
      progress: (key, cur, tot) => {
        if (tot > 0) spinBar.style.width = (30 + Math.round((cur / tot) * 60)) + '%'
      },
    })

    // Extract alpha mask from result
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const W = previewCvs.width, H = previewCvs.height
        const off = document.createElement('canvas')
        off.width = W; off.height = H
        const ctx = off.getContext('2d')
        ctx.drawImage(img, 0, 0, W, H)
        const data = ctx.getImageData(0, 0, W, H).data
        // Store just the alpha channel
        maskData = new Uint8ClampedArray(W * H)
        for (let i = 0; i < W * H; i++) maskData[i] = data[i * 4 + 3]
        resolve()
      }
      img.src = URL.createObjectURL(blob)
    })

    spinOverlay.classList.remove('on')
    sliderRow.style.display = 'flex'
    statusText.textContent = 'Drag the slider to remove the background, then download.'

    // Animate slider from 0→100 so user sees it working live
    let v = 0
    const anim = setInterval(() => {
      v = Math.min(v + 2, 100)
      threshSlider.value = v
      sliderVal.textContent = v + '%'
      drawBlend(v / 100)
      if (v >= 100) {
        clearInterval(anim)
        dlBtnEl.style.display = 'block'
        newBtn.style.display = 'block'
        statusText.textContent = 'Done — slide to adjust, then download.'
      }
    }, 16)

  } catch (err) {
    spinOverlay.classList.remove('on')
    statusText.textContent = 'Error: ' + (err.message || 'Could not process image.')
    uploadArea.style.display = 'flex'
    console.error(err)
  }
}

// ── Download current blended result ──────────────────────────────────────────
dlBtnEl.addEventListener('click', () => {
  if (!origData || !maskData) return
  const W = previewCvs.width, H = previewCvs.height
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const ctx = off.getContext('2d')
  const intensity = parseInt(threshSlider.value) / 100
  const src = origData.data
  const out = ctx.createImageData(W, H)
  const d = out.data
  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    d[p]   = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
    d[p+3] = Math.round(255 * (1 - intensity) + maskData[i] * intensity)
  }
  ctx.putImageData(out, 0, 0)
  const a = document.createElement('a')
  a.href = off.toDataURL('image/png')
  a.download = (currentFile.name.replace(/\.[^.]+$/, '') || 'image') + '-no-bg.png'
  a.click()
})

// ── Reset ─────────────────────────────────────────────────────────────────────
newBtn.addEventListener('click', () => {
  origData = null; maskData = null; currentFile = null
  previewBox.style.display = 'none'
  sliderRow.style.display = 'none'
  dlBtnEl.style.display = 'none'
  newBtn.style.display = 'none'
  statusText.textContent = ''
  threshSlider.value = 0
  uploadArea.style.display = 'flex'
  fileInput.value = ''
})

fileInput.addEventListener('change', () => { if (fileInput.files[0]) processFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]) })

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