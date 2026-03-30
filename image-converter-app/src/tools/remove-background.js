import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('remove-background')

const t = getT()

const bg = 'var(--bg-page)'
const toolName  = (t.nav_short && t.nav_short['remove-background']) || 'Remove Background'
const seoData   = t.seo && t.seo['remove-background']
const descText  = seoData ? seoData.h2a : 'Remove image background free. AI-powered, batch process up to 25 images.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  #resultRow{display:none;gap:16px;margin-bottom:16px;align-items:flex-start;}
  #resultRow.on{display:flex;}
  #viewerWrap{position:relative;flex:1;min-width:0;border-radius:12px;overflow:hidden;border:1.5px solid var(--border);background:var(--bg-card);}
  #viewerWrap canvas{display:block;width:100%;height:auto;}
  #procOverlay{display:none;position:absolute;inset:0;background:var(--overlay);z-index:20;flex-direction:column;align-items:center;justify-content:center;gap:14px;}
  #procOverlay.on{display:flex;}
  .spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;}
  .proc-label{font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text-secondary);font-weight:600;}
  .proc-progress{width:160px;height:4px;background:var(--border);border-radius:4px;overflow:hidden;}
  .proc-bar{height:100%;background:var(--accent);border-radius:4px;width:0%;transition:width 0.25s;}
  #sliderRow{display:none;align-items:center;gap:12px;margin-bottom:14px;}
  #sliderRow.on{display:flex;}
  #sliderRow label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #threshSlider{flex:1;accent-color:var(--accent);cursor:pointer;}
  #sliderVal{font-size:12px;color:var(--accent);font-weight:700;font-family:'DM Sans',sans-serif;width:36px;text-align:right;}
  #bgPanel{display:none;width:120px;flex-shrink:0;padding:10px;background:var(--bg-card);border:1.5px solid var(--border);border-radius:10px;}
  #bgPanel.on{display:flex;flex-direction:column;}
  .bg-panel-label{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;font-family:'DM Sans',sans-serif;}
  .bg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;}
  .bg-swatch{width:100%;aspect-ratio:1;border-radius:6px;border:2px solid var(--border-light);cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
  .bg-swatch:hover{border-color:var(--accent);}
  .bg-swatch.active{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent);}
  .bg-swatch .check{display:none;position:absolute;inset:0;align-items:center;justify-content:center;}
  .bg-swatch.active .check{display:flex;}
  .bg-swatch-checker{background:repeating-conic-gradient(#ccc 0% 25%, #f0f0f0 0% 50%) 50%/10px 10px;}
  .bg-custom-wrap{display:flex;align-items:center;gap:5px;margin-bottom:10px;}
  .bg-color-input{width:24px;height:24px;border:2px solid var(--border-light);border-radius:5px;cursor:pointer;padding:0;background:none;-webkit-appearance:none;appearance:none;flex-shrink:0;}
  .bg-color-input::-webkit-color-swatch-wrapper{padding:0;}
  .bg-color-input::-webkit-color-swatch{border:none;border-radius:4px;}
  .bg-color-input::-moz-color-swatch{border:none;border-radius:4px;}
  .bg-hex-input{flex:1;min-width:0;padding:4px 6px;border:1.5px solid var(--border-light);border-radius:5px;font-size:11px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);outline:none;}
  .bg-hex-input:focus{border-color:var(--accent);}
  .bg-dl-btn{width:100%;padding:8px;border-radius:7px;background:var(--accent);border:none;color:var(--text-on-accent);font-family:'Fraunces',serif;font-weight:700;font-size:12px;cursor:pointer;transition:background 0.15s;margin-top:auto;}
  .bg-dl-btn:hover{background:var(--accent-hover);}
  @media(max-width:600px){
    #resultRow.on{flex-direction:column;}
    #bgPanel{width:100%;}
    .bg-grid{grid-template-columns:repeat(6,1fr);}
  }
  #navRow{display:none;align-items:center;justify-content:space-between;margin-bottom:10px;}
  #navRow.on{display:flex;}
  .nav-btn{padding:7px 16px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:13px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .nav-btn:hover{border-color:var(--accent);color:var(--accent);}
  .nav-btn:disabled{opacity:0.35;cursor:not-allowed;}
  .nav-counter{font-size:13px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;}
  .nav-fname{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif;text-align:center;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  #thumbStrip{display:none;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:4px;}
  #thumbStrip.on{display:flex;}
  .thumb-item{flex-shrink:0;width:54px;height:54px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;position:relative;}
  .thumb-item.active{border-color:var(--accent);}
  .thumb-item img{width:100%;height:100%;object-fit:cover;display:block;}
  .thumb-badge{position:absolute;bottom:2px;right:2px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;}
  .thumb-badge.done{background:#22c55e;}
  .thumb-badge.proc{background:var(--accent);animation:spin 0.8s linear infinite;}
  .zip-btn{display:none;width:100%;padding:12px;border-radius:10px;background:var(--btn-dark);color:var(--text-on-dark-btn);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;margin-bottom:10px;border:none;transition:background 0.15s;}
  .zip-btn:hover{background:var(--btn-dark-hover);}
  .new-btn{display:none;width:100%;padding:11px;border:1.5px solid var(--accent);border-radius:10px;background:transparent;color:var(--accent);font-size:14px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;margin-bottom:16px;transition:all 0.15s;}
  .new-btn:hover{background:var(--accent);color:var(--text-on-accent);}
  .remove-all-btn{width:100%;padding:12px;border-radius:10px;background:var(--badge-purple);color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;margin-bottom:10px;border:none;transition:background 0.15s;}
  .remove-all-btn:hover{background:var(--badge-purple-hover);}
  .remove-all-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;}
  .status-text{font-size:13px;color:var(--text-tertiary);text-align:center;margin-bottom:10px;font-family:'DM Sans',sans-serif;min-height:18px;}
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
document.title = t.rb_page_title || `${toolName} Free — AI Background Remover | RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 24px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>
    <div id="thumbStrip"></div>
    <div id="navRow">
      <button class="nav-btn" id="prevBtn">← Prev</button>
      <span class="nav-counter" id="navCounter"></span>
      <button class="nav-btn" id="nextBtn">Next →</button>
    </div>
    <div class="nav-fname" id="navFname"></div>
    <div id="resultRow">
      <div id="viewerWrap">
        <canvas id="viewerCanvas"></canvas>
        <div id="procOverlay">
          <div class="spinner"></div>
          <div class="proc-progress"><div class="proc-bar" id="procBar"></div></div>
          <div class="proc-label" id="procLabel">Loading AI model…</div>
        </div>
      </div>
      <div id="bgPanel">
        <div class="bg-panel-label">${t.rb_bg_label || 'Background'}</div>
        <div class="bg-grid">
          <div class="bg-swatch bg-swatch-checker active" data-bg="transparent" title="Transparent"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
          <div class="bg-swatch" data-bg="#ffffff" style="background:#ffffff;" title="White"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
          <div class="bg-swatch" data-bg="#000000" style="background:#000000;" title="Black"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
          <div class="bg-swatch" data-bg="#ff0000" style="background:#ff0000;" title="Red"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
          <div class="bg-swatch" data-bg="#0066ff" style="background:#0066ff;" title="Blue"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
          <div class="bg-swatch" data-bg="#22c55e" style="background:#22c55e;" title="Green"><span class="check"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>
        </div>
        <div class="bg-custom-wrap">
          <input type="color" class="bg-color-input" id="bgColorPicker" value="#888888" title="Custom color" />
          <input type="text" class="bg-hex-input" id="bgHexInput" placeholder="#hex" maxlength="7" />
        </div>
        <button class="bg-dl-btn" id="dlBtn">${dlBtn}</button>
      </div>
    </div>
    <div id="sliderRow">
      <label>Background removal:</label>
      <input type="range" id="threshSlider" min="0" max="100" value="100" />
      <span id="sliderVal">100%</span>
    </div>
    <div class="status-text" id="statusText"></div>
    <button class="remove-all-btn" id="removeAllBtn" style="display:none;">⚡ Remove All Backgrounds</button>
    <button class="zip-btn" id="zipBtn">${dlZipBtn}</button>
    <button class="new-btn" id="newBtn">+ Add more images</button>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">What's Next?</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const canvas       = document.getElementById('viewerCanvas')
const procOverlay  = document.getElementById('procOverlay')
const procBar      = document.getElementById('procBar')
const procLabel    = document.getElementById('procLabel')
const sliderRow    = document.getElementById('sliderRow')
const threshSlider = document.getElementById('threshSlider')
const sliderValEl  = document.getElementById('sliderVal')
const statusText   = document.getElementById('statusText')
const dlBtnEl      = document.getElementById('dlBtn')
const zipBtn       = document.getElementById('zipBtn')
const removeAllBtn = document.getElementById('removeAllBtn')
const newBtn       = document.getElementById('newBtn')
const navRow       = document.getElementById('navRow')
const prevBtn      = document.getElementById('prevBtn')
const nextBtn      = document.getElementById('nextBtn')
const navCounter   = document.getElementById('navCounter')
const navFname     = document.getElementById('navFname')
const thumbStrip   = document.getElementById('thumbStrip')

let entries = [], currentIdx = 0, activeBg = 'transparent'

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

function drawChecker(ctx, x, y, w, h, sz = 12) {
  for (let r = 0; r * sz < h; r++)
    for (let c = 0; c * sz < w; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#cccccc' : '#f0f0f0'
      ctx.fillRect(x + c * sz, y + r * sz, sz, sz)
    }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function applyBlend(entry, intensity) {
  if (!entry.origData || !entry.maskData) return
  const W = entry.origData.width, H = entry.origData.height
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  const useSolid = activeBg !== 'transparent'

  if (useSolid) {
    ctx.fillStyle = activeBg
    ctx.fillRect(0, 0, W, H)
  } else {
    drawChecker(ctx, 0, 0, W, H)
  }

  const out = ctx.createImageData(W, H)
  const src = entry.origData.data, d = out.data

  if (useSolid) {
    const [br, bg, bb] = hexToRgb(activeBg)
    for (let i = 0; i < W * H; i++) {
      const p = i * 4
      const a = Math.round(255 * (1 - intensity) + entry.maskData[i] * intensity) / 255
      d[p]   = Math.round(src[p] * a + br * (1 - a))
      d[p+1] = Math.round(src[p+1] * a + bg * (1 - a))
      d[p+2] = Math.round(src[p+2] * a + bb * (1 - a))
      d[p+3] = 255
    }
  } else {
    for (let i = 0; i < W * H; i++) {
      const p = i * 4
      d[p] = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
      d[p+3] = Math.round(255 * (1 - intensity) + entry.maskData[i] * intensity)
    }
  }
  ctx.putImageData(out, 0, 0)
}

function renderCurrent() {
  const entry = entries[currentIdx]
  if (!entry) return
  navCounter.textContent = `${currentIdx + 1} / ${entries.length}`
  navFname.textContent = entry.file.name
  prevBtn.disabled = currentIdx === 0
  nextBtn.disabled = currentIdx === entries.length - 1
  const resultRow = document.getElementById('resultRow')
  const bgPanel = document.getElementById('bgPanel')
  resultRow.classList.add('on'); newBtn.style.display = 'block'
  threshSlider.value = entry.sliderValue
  sliderValEl.textContent = entry.sliderValue + '%'
  document.querySelectorAll('.thumb-item').forEach((el, i) => el.classList.toggle('active', i === currentIdx))
  if (entry.maskData) {
    applyBlend(entry, entry.sliderValue / 100)
    sliderRow.classList.add('on'); bgPanel.classList.add('on'); procOverlay.classList.remove('on')
    statusText.textContent = 'Done — drag slider to adjust, then download.'
  } else if (entry.processing) {
    sliderRow.classList.remove('on'); bgPanel.classList.remove('on'); procOverlay.classList.add('on')
    statusText.textContent = 'Removing background…'
    if (entry.origData) { canvas.width = entry.origData.width; canvas.height = entry.origData.height; canvas.getContext('2d').putImageData(entry.origData, 0, 0) }
  } else {
    sliderRow.classList.remove('on'); bgPanel.classList.remove('on')
    statusText.textContent = 'Ready to process.'
    if (entry.origData) { canvas.width = entry.origData.width; canvas.height = entry.origData.height; canvas.getContext('2d').putImageData(entry.origData, 0, 0) }
    startProcessing(entry)
  }
  const doneCount = entries.filter(e => e.resultBlob).length
  zipBtn.style.display = doneCount > 1 ? 'block' : 'none'
}

async function startProcessing(entry) {
  if (entry.processing || entry.maskData) return
  entry.processing = true
  entry.badgeEl.className = 'thumb-badge proc'; entry.badgeEl.textContent = '…'
  if (!entry.origData) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const W = img.naturalWidth, H = img.naturalHeight
        const off = document.createElement('canvas')
        off.width = W; off.height = H
        off.getContext('2d').drawImage(img, 0, 0)
        entry.origData = off.getContext('2d').getImageData(0, 0, W, H)
        resolve()
      }
      img.src = URL.createObjectURL(entry.file)
    })
  }
  if (entries[currentIdx] === entry) {
    canvas.width = entry.origData.width; canvas.height = entry.origData.height
    canvas.getContext('2d').putImageData(entry.origData, 0, 0)
    procOverlay.classList.add('on'); procBar.style.width = '10%'; procLabel.textContent = 'Loading AI model…'
  }
  try {
    if (entries[currentIdx] === entry) { procBar.style.width = '30%'; procLabel.textContent = 'Removing background…' }

    // Use server-side Remove.bg API for high-quality background removal
    const formData = new FormData()
    formData.append('image', entry.file)
    const response = await fetch('/api/remove-bg', { method: 'POST', body: formData })
    if (!response.ok) throw new Error('API returned ' + response.status)
    const blob = await response.blob()

    if (entries[currentIdx] === entry) { procBar.style.width = '90%' }
    await new Promise(resolve => {
      const maskImg = new Image()
      maskImg.onload = () => {
        const W = entry.origData.width, H = entry.origData.height

        // Scale mask to original dimensions and extract alpha
        const mc = document.createElement('canvas')
        mc.width = W; mc.height = H
        mc.getContext('2d').drawImage(maskImg, 0, 0, W, H)
        const maskData = mc.getContext('2d').getImageData(0, 0, W, H).data
        entry.maskData = new Uint8ClampedArray(W * H)
        for (let i = 0; i < W * H; i++) entry.maskData[i] = maskData[i * 4 + 3]

        // Build full-res result: original pixels + upscaled mask alpha
        const out = document.createElement('canvas')
        out.width = W; out.height = H
        const octx = out.getContext('2d')
        const hiRes = octx.createImageData(W, H)
        const src = entry.origData.data, d = hiRes.data
        for (let i = 0; i < W * H; i++) {
          const p = i * 4
          d[p] = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
          d[p+3] = entry.maskData[i]
        }
        octx.putImageData(hiRes, 0, 0)
        out.toBlob(hiBlob => { entry.resultBlob = hiBlob; resolve() }, 'image/png')
      }
      maskImg.src = URL.createObjectURL(blob)
    })
    entry.processing = false
    entry.badgeEl.className = 'thumb-badge done'
    entry.badgeEl.innerHTML = `<svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`
    if (entries[currentIdx] === entry) {
      procOverlay.classList.remove('on'); applyBlend(entry, entry.sliderValue / 100)
      sliderRow.classList.add('on'); document.getElementById('bgPanel').classList.add('on')
      statusText.textContent = 'Done — drag slider to adjust, then download.'
      const doneCount = entries.filter(e => e.resultBlob).length
      zipBtn.style.display = doneCount > 1 ? 'block' : 'none'
      buildNextSteps()
    }
  } catch(err) {
    entry.processing = false
    entry.badgeEl.className = 'thumb-badge'; entry.badgeEl.textContent = '!'
    if (entries[currentIdx] === entry) { procOverlay.classList.remove('on'); statusText.textContent = 'Error processing image.' }
    console.error(err)
  }
}

threshSlider.addEventListener('input', () => {
  const v = parseInt(threshSlider.value)
  sliderValEl.textContent = v + '%'
  const entry = entries[currentIdx]
  if (!entry) return
  entry.sliderValue = v
  if (entry.maskData) applyBlend(entry, v / 100)
})

// Background panel
const bgSwatches = document.querySelectorAll('.bg-swatch')
const bgColorPicker = document.getElementById('bgColorPicker')
const bgHexInput = document.getElementById('bgHexInput')

function setActiveBg(color) {
  activeBg = color
  bgSwatches.forEach(s => s.classList.toggle('active', s.dataset.bg === color))
  // If custom color doesn't match any swatch, deselect all swatches
  if (!document.querySelector('.bg-swatch.active')) {
    bgColorPicker.parentElement.querySelector('.bg-color-input').style.boxShadow = '0 0 0 2px var(--accent)'
  } else {
    bgColorPicker.style.boxShadow = 'none'
  }
  const entry = entries[currentIdx]
  if (entry?.maskData) applyBlend(entry, entry.sliderValue / 100)
}

bgSwatches.forEach(s => {
  s.addEventListener('click', () => {
    bgColorPicker.style.boxShadow = 'none'
    setActiveBg(s.dataset.bg)
    if (s.dataset.bg !== 'transparent') {
      bgHexInput.value = s.dataset.bg
      bgColorPicker.value = s.dataset.bg
    } else {
      bgHexInput.value = ''
    }
  })
})

let colorRafId = null
bgColorPicker.addEventListener('input', () => {
  const hex = bgColorPicker.value
  bgHexInput.value = hex
  bgSwatches.forEach(s => s.classList.remove('active'))
  bgColorPicker.style.boxShadow = '0 0 0 2px var(--accent)'
  activeBg = hex
  if (colorRafId) cancelAnimationFrame(colorRafId)
  colorRafId = requestAnimationFrame(() => {
    const entry = entries[currentIdx]
    if (entry?.maskData) applyBlend(entry, entry.sliderValue / 100)
  })
})

bgHexInput.addEventListener('input', () => {
  let v = bgHexInput.value.trim()
  if (!v.startsWith('#')) v = '#' + v
  if (/^#[0-9a-fA-F]{6}$/.test(v)) {
    bgColorPicker.value = v
    bgSwatches.forEach(s => s.classList.remove('active'))
    bgColorPicker.style.boxShadow = '0 0 0 2px var(--accent)'
    activeBg = v
    const entry = entries[currentIdx]
    if (entry?.maskData) applyBlend(entry, entry.sliderValue / 100)
  }
})

prevBtn.addEventListener('click', () => { currentIdx--; renderCurrent() })
nextBtn.addEventListener('click', () => { currentIdx++; renderCurrent() })
newBtn.addEventListener('click', () => fileInput.click())

function addFiles(newFiles) {
  const fileArr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
  if (!fileArr.length) return
  const startIdx = entries.length
  for (const file of fileArr) {
    const entry = { file, origData: null, maskData: null, resultBlob: null, sliderValue: 100, processing: false, thumbEl: null, badgeEl: null }
    const img = new Image()
    const _imgUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(_imgUrl)
      const off = document.createElement('canvas')
      off.width = img.naturalWidth; off.height = img.naturalHeight
      off.getContext('2d').drawImage(img, 0, 0)
      entry.origData = off.getContext('2d').getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      if (entries[currentIdx] === entry && !entry.processing && !entry.maskData) {
        canvas.width = entry.origData.width; canvas.height = entry.origData.height
        canvas.getContext('2d').putImageData(entry.origData, 0, 0)
      }
    }
    img.src = _imgUrl
    const thumbItem = document.createElement('div')
    thumbItem.className = 'thumb-item'
    const thumbImg = document.createElement('img')
    const _turl = URL.createObjectURL(file)
    thumbImg.onload = () => URL.revokeObjectURL(_turl)
    thumbImg.src = _turl
    const badgeEl = document.createElement('div')
    badgeEl.className = 'thumb-badge'
    entry.badgeEl = badgeEl; entry.thumbEl = thumbItem
    thumbItem.append(thumbImg, badgeEl)
    const idx = entries.length
    thumbItem.addEventListener('click', () => { currentIdx = idx; renderCurrent() })
    thumbStrip.appendChild(thumbItem)
    entries.push(entry)
  }
  thumbStrip.classList.add('on'); navRow.classList.add('on')
  if (entries.length > 1) removeAllBtn.style.display = 'block'
  currentIdx = startIdx; renderCurrent()
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

// Auto-load image from ?url= parameter (e.g. from WordPress plugin)
;(function loadFromUrlParam() {
  const params = new URLSearchParams(window.location.search)
  const imgUrl = params.get('url')
  if (!imgUrl) return
  function loadFile(blob) {
    const name = imgUrl.split('/').pop().split('?')[0] || 'image.jpg'
    const file = new File([blob], name, { type: blob.type || 'image/jpeg' })
    addFiles([file])
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      c.getContext('2d').drawImage(img, 0, 0)
      c.toBlob(blob => { if (blob) loadFile(blob) }, 'image/jpeg', 0.95)
    } catch (e) { fetch(imgUrl).then(r => r.blob()).then(loadFile).catch(() => {}) }
  }
  img.onerror = () => { fetch(imgUrl).then(r => r.blob()).then(loadFile).catch(() => {}) }
  img.src = imgUrl
})()

dlBtnEl.addEventListener('click', () => {
  const entry = entries[currentIdx]
  if (!entry?.origData || !entry?.maskData) return
  const W = entry.origData.width, H = entry.origData.height
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const ctx = off.getContext('2d')
  const intensity = entry.sliderValue / 100
  const src = entry.origData.data
  const useSolid = activeBg !== 'transparent'

  if (useSolid) {
    ctx.fillStyle = activeBg
    ctx.fillRect(0, 0, W, H)
    const [br, bgc, bb] = hexToRgb(activeBg)
    const out = ctx.createImageData(W, H)
    const d = out.data
    for (let i = 0; i < W * H; i++) {
      const p = i * 4
      const a = Math.round(255 * (1 - intensity) + entry.maskData[i] * intensity) / 255
      d[p]   = Math.round(src[p] * a + br * (1 - a))
      d[p+1] = Math.round(src[p+1] * a + bgc * (1 - a))
      d[p+2] = Math.round(src[p+2] * a + bb * (1 - a))
      d[p+3] = 255
    }
    ctx.putImageData(out, 0, 0)
    const dl = document.createElement('a')
    dl.href = off.toDataURL('image/jpeg', 0.95)
    dl.download = entry.file.name.replace(/\.[^.]+$/, '') + '-no-bg.jpg'
    dl.click();if(window.showReviewPrompt)window.showReviewPrompt()
  } else {
    const out = ctx.createImageData(W, H)
    const d = out.data
    for (let i = 0; i < W * H; i++) {
      const p = i * 4
      d[p] = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
      d[p+3] = Math.round(255 * (1 - intensity) + entry.maskData[i] * intensity)
    }
    ctx.putImageData(out, 0, 0)
    const dl = document.createElement('a')
    dl.href = off.toDataURL('image/png')
    dl.download = entry.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
    dl.click();if(window.showReviewPrompt)window.showReviewPrompt()
  }
})

zipBtn.addEventListener('click', async () => {
  const done = entries.filter(e => e.resultBlob)
  if (!done.length) return
  zipBtn.textContent = 'Zipping…'; zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    const usedNames = new Set()
    for (const e of done) {
      const rawName = e.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
      const safeName = makeUnique(usedNames, rawName)
      zip.file(safeName, await e.resultBlob.arrayBuffer())
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob); a.download = 'removed-backgrounds.zip'; a.click();if(window.showReviewPrompt)window.showReviewPrompt(); setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  } catch(err) { alert('ZIP failed: ' + err.message) }
  zipBtn.textContent = dlZipBtn; zipBtn.disabled = false
})

removeAllBtn.addEventListener('click', async () => {
  const pending = entries.filter(e => !e.maskData && !e.processing)
  if (!pending.length) return
  removeAllBtn.disabled = true
  removeAllBtn.textContent = `Processing 0 of ${entries.length}…`
  let doneCount = entries.filter(e => e.maskData).length
  for (const entry of pending) {
    doneCount++
    removeAllBtn.textContent = `Processing ${doneCount} of ${entries.length}…`
    currentIdx = entries.indexOf(entry); renderCurrent()
    await startProcessing(entry)
  }
  removeAllBtn.textContent = `✓ All ${entries.length} done`
  removeAllBtn.disabled = false
  zipBtn.style.display = 'block'
  buildNextSteps()
})

// ── IDB helpers ───────────────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IDB open failed'))
  })
}
async function saveFilesToIDB(items) {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  store.clear()
  items.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
  return new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = reject })
}

// ── What's Next ───────────────────────────────────────────────────────────────
function buildNextSteps() {
  const buttons = [
    { label: 'Compress',      href: localHref('compress') },
    { label: 'Resize',        href: localHref('resize') },
    { label: 'Crop',          href: localHref('crop') },
    { label: 'Rotate',        href: localHref('rotate') },
    { label: 'Flip',          href: localHref('flip') },
    { label: 'Black & White', href: localHref('grayscale') },
    { label: 'Watermark',     href: localHref('watermark') },
    { label: 'Convert to JPG',  href: localHref('png-to-jpg') },
    { label: 'Convert to WebP', href: localHref('png-to-webp') },
  ]
  const container = document.getElementById('nextStepsButtons')
  container.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.textContent = b.label
    btn.style.cssText = "padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;"
    btn.onmouseover = () => { btn.style.borderColor='var(--accent)'; btn.style.color='var(--accent)' }
    btn.onmouseout  = () => { btn.style.borderColor='var(--border-light)'; btn.style.color='var(--text-primary)' }
    btn.addEventListener('click', async () => {
      const done = entries.filter(e => e.resultBlob)
      if (done.length) {
        try {
          await saveFilesToIDB(done.map(e => ({ blob: e.resultBlob, name: e.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png', type: 'image/png' })))
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch(e) {}
      }
      window.location.href = b.href
    })
    container.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

;(function injectSEO() {
  const seo = t.seo && t.seo['remove-background']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()