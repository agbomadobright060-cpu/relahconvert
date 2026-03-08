import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const bg = '#F2F2F2'
const toolName  = (t.nav_short && t.nav_short['remove-background']) || 'Remove Background'
const seoData   = t.seo && t.seo['remove-background']
const descText  = seoData ? seoData.h2a : 'Remove image background free. AI-powered, runs entirely in your browser.'
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

  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}

  /* Main viewer */
  #viewerWrap{display:none;position:relative;width:100%;border-radius:12px;overflow:hidden;border:1.5px solid #E8E0D5;background:#fff;margin-bottom:16px;cursor:ew-resize;user-select:none;}
  #viewerWrap canvas{display:block;width:100%;height:auto;}

  /* Processing overlay */
  #procOverlay{display:none;position:absolute;inset:0;background:rgba(255,255,255,0.78);z-index:20;flex-direction:column;align-items:center;justify-content:center;gap:14px;}
  #procOverlay.on{display:flex;}
  .spinner{width:40px;height:40px;border:3px solid #E8E0D5;border-top-color:#C84B31;border-radius:50%;animation:spin 0.7s linear infinite;}
  .proc-label{font-family:'DM Sans',sans-serif;font-size:13px;color:#5A4A3A;font-weight:600;}
  .proc-progress{width:160px;height:4px;background:#E8E0D5;border-radius:4px;overflow:hidden;}
  .proc-bar{height:100%;background:#C84B31;border-radius:4px;width:0%;transition:width 0.25s;}

  /* Slider row */
  #sliderRow{display:none;align-items:center;gap:12px;margin-bottom:14px;}
  #sliderRow.on{display:flex;}
  #sliderRow label{font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #threshSlider{flex:1;accent-color:#C84B31;cursor:pointer;}
  #sliderVal{font-size:12px;color:#C84B31;font-weight:700;font-family:'DM Sans',sans-serif;width:36px;text-align:right;}

  /* Nav */
  #navRow{display:none;align-items:center;justify-content:space-between;margin-bottom:10px;}
  #navRow.on{display:flex;}
  .nav-btn{padding:7px 16px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .nav-btn:hover{border-color:#C84B31;color:#C84B31;}
  .nav-btn:disabled{opacity:0.35;cursor:not-allowed;}
  .nav-counter{font-size:13px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;}
  .nav-fname{font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif;text-align:center;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  /* Thumb strip */
  #thumbStrip{display:none;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:4px;}
  #thumbStrip.on{display:flex;}
  .thumb-item{flex-shrink:0;width:54px;height:54px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;position:relative;}
  .thumb-item.active{border-color:#C84B31;}
  .thumb-item img{width:100%;height:100%;object-fit:cover;display:block;}
  .thumb-done{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#22c55e;display:none;align-items:center;justify-content:center;}
  .thumb-done.on{display:flex;}
  .thumb-done svg{display:block;}

  .dl-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:#C84B31;border:none;color:#fff;font-family:'Fraunces',serif;font-weight:700;font-size:15px;cursor:pointer;margin-bottom:10px;transition:background 0.15s;}
  .dl-btn:hover{background:#A63D26;}
  .zip-btn{display:none;width:100%;padding:12px;border:1.5px solid #2C1810;border-radius:10px;background:#2C1810;color:#F5F0E8;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;margin-bottom:10px;transition:all 0.15s;}
  .zip-btn:hover{background:#1a0f09;}
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
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>

    <!-- Thumbnail strip -->
    <div id="thumbStrip"></div>

    <!-- Nav row -->
    <div id="navRow">
      <button class="nav-btn" id="prevBtn">← Prev</button>
      <span class="nav-counter" id="navCounter"></span>
      <button class="nav-btn" id="nextBtn">Next →</button>
    </div>

    <!-- File name -->
    <div class="nav-fname" id="navFname"></div>

    <!-- Main canvas viewer -->
    <div id="viewerWrap">
      <canvas id="viewerCanvas"></canvas>
      <div id="procOverlay">
        <div class="spinner"></div>
        <div class="proc-progress"><div class="proc-bar" id="procBar"></div></div>
        <div class="proc-label" id="procLabel">Loading AI model…</div>
      </div>
    </div>

    <div id="sliderRow">
      <label>Background removal:</label>
      <input type="range" id="threshSlider" min="0" max="100" value="100" />
      <span id="sliderVal">100%</span>
    </div>

    <div class="status-text" id="statusText"></div>
    <button class="dl-btn" id="dlBtn">${dlBtn}</button>
    <button class="zip-btn" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    <button class="new-btn" id="newBtn">+ Add more images</button>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const viewerWrap   = document.getElementById('viewerWrap')
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
const newBtn       = document.getElementById('newBtn')
const navRow       = document.getElementById('navRow')
const prevBtn      = document.getElementById('prevBtn')
const nextBtn      = document.getElementById('nextBtn')
const navCounter   = document.getElementById('navCounter')
const navFname     = document.getElementById('navFname')
const thumbStrip   = document.getElementById('thumbStrip')

// entries[i] = { file, origData, maskData, resultBlob, thumbEl, doneEl }
let entries = []
let currentIdx = 0
let removeBackgroundFn = null

function drawChecker(ctx, x, y, w, h, sz = 12) {
  for (let r = 0; r * sz < h; r++)
    for (let c = 0; c * sz < w; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#cccccc' : '#f0f0f0'
      ctx.fillRect(x + c * sz, y + r * sz, sz, sz)
    }
}

function applyBlend(entry, intensity) {
  if (!entry.origData || !entry.maskData) return
  const { origData, maskData } = entry
  const W = canvas.width, H = canvas.height
  const ctx = canvas.getContext('2d')
  drawChecker(ctx, 0, 0, W, H)
  const out = ctx.createImageData(W, H)
  const src = origData.data, d = out.data
  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    d[p] = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
    d[p+3] = Math.round(255 * (1 - intensity) + maskData[i] * intensity)
  }
  ctx.putImageData(out, 0, 0)
}

function showEntry(idx) {
  if (idx < 0 || idx >= entries.length) return
  currentIdx = idx
  const entry = entries[idx]

  // Update thumb strip active
  document.querySelectorAll('.thumb-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx)
  })

  // Update nav
  navCounter.textContent = `${idx + 1} / ${entries.length}`
  navFname.textContent = entry.file.name
  prevBtn.disabled = idx === 0
  nextBtn.disabled = idx === entries.length - 1

  // Show canvas
  viewerWrap.style.display = 'block'

  if (entry.origData) {
    // Already loaded — draw it
    canvas.width = entry.origData.width
    canvas.height = entry.origData.height
    const intensity = parseInt(threshSlider.value) / 100

    if (entry.maskData) {
      applyBlend(entry, intensity)
      sliderRow.classList.add('on')
      dlBtnEl.style.display = 'block'
      newBtn.style.display = 'block'
      procOverlay.classList.remove('on')
      statusText.textContent = 'Drag slider to adjust, then download.'
    } else {
      // Still processing — show original
      const ctx = canvas.getContext('2d')
      ctx.putImageData(entry.origData, 0, 0)
      statusText.textContent = 'Processing…'
    }
  } else {
    // Not loaded yet — show blank
    sliderRow.classList.remove('on')
    dlBtnEl.style.display = 'none'
    statusText.textContent = 'Waiting to process…'
  }
}

threshSlider.addEventListener('input', () => {
  const v = parseInt(threshSlider.value)
  sliderValEl.textContent = v + '%'
  const entry = entries[currentIdx]
  if (entry && entry.maskData) applyBlend(entry, v / 100)
})

prevBtn.addEventListener('click', () => showEntry(currentIdx - 1))
nextBtn.addEventListener('click', () => showEntry(currentIdx + 1))

async function processEntry(entry) {
  // Load original
  await new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      entry.origData = ctx.getImageData(0, 0, W, H)
      // Also show original while processing
      resolve()
    }
    img.src = URL.createObjectURL(entry.file)
  })

  procOverlay.classList.add('on')
  procBar.style.width = '10%'
  procLabel.textContent = 'Loading AI model…'

  try {
    if (!removeBackgroundFn) {
      const mod = await import('@imgly/background-removal')
      removeBackgroundFn = mod.removeBackground
    }
    procBar.style.width = '30%'
    procLabel.textContent = 'Removing background…'

    const blob = await removeBackgroundFn(entry.file, {
      model: 'small',
      progress: (key, cur, tot) => {
        if (tot > 0) procBar.style.width = (30 + Math.round((cur / tot) * 60)) + '%'
      },
    })

    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const W = entry.origData.width, H = entry.origData.height
        const off = document.createElement('canvas')
        off.width = W; off.height = H
        const ctx = off.getContext('2d')
        ctx.drawImage(img, 0, 0, W, H)
        const data = ctx.getImageData(0, 0, W, H).data
        entry.maskData = new Uint8ClampedArray(W * H)
        for (let i = 0; i < W * H; i++) entry.maskData[i] = data[i * 4 + 3]
        entry.resultBlob = blob
        resolve()
      }
      img.src = URL.createObjectURL(blob)
    })

    // Mark thumb as done
    entry.doneEl.classList.add('on')

    // If still viewing this entry, update display
    if (entries[currentIdx] === entry) {
      procOverlay.classList.remove('on')
      const intensity = parseInt(threshSlider.value) / 100
      applyBlend(entry, intensity)
      sliderRow.classList.add('on')
      dlBtnEl.style.display = 'block'
      newBtn.style.display = 'block'
      statusText.textContent = 'Done — drag slider to adjust, then download.'
    }

  } catch(err) {
    procLabel.textContent = 'Error — try again'
    console.error(err)
  }
}

async function addFiles(newFiles) {
  const fileArr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
  if (!fileArr.length) return

  const startIdx = entries.length

  for (const file of fileArr) {
    const entry = { file, origData: null, maskData: null, resultBlob: null, thumbEl: null, doneEl: null }

    // Build thumb
    const thumbItem = document.createElement('div')
    thumbItem.className = 'thumb-item'
    const thumbImg = document.createElement('img')
    thumbImg.src = URL.createObjectURL(file)
    const doneEl = document.createElement('div')
    doneEl.className = 'thumb-done'
    doneEl.innerHTML = `<svg width="8" height="8" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`
    entry.doneEl = doneEl
    entry.thumbEl = thumbItem
    thumbItem.append(thumbImg, doneEl)
    const idx = entries.length
    thumbItem.addEventListener('click', () => showEntry(idx))
    thumbStrip.appendChild(thumbItem)
    entries.push(entry)
  }

  thumbStrip.classList.add('on')
  navRow.classList.add('on')

  // Show first new file immediately
  showEntry(startIdx)

  // Process all new files sequentially
  for (let i = startIdx; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.maskData) continue
    // If not currently viewing this one, still process silently
    if (currentIdx !== i) {
      // Load origData silently
      await new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
          const off = document.createElement('canvas')
          off.width = img.naturalWidth; off.height = img.naturalHeight
          const ctx = off.getContext('2d')
          ctx.drawImage(img, 0, 0)
          entry.origData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
          resolve()
        }
        img.src = URL.createObjectURL(entry.file)
      })
      try {
        if (!removeBackgroundFn) {
          const mod = await import('@imgly/background-removal')
          removeBackgroundFn = mod.removeBackground
        }
        const blob = await removeBackgroundFn(entry.file, { model: 'small' })
        await new Promise(resolve => {
          const img = new Image()
          img.onload = () => {
            const W = entry.origData.width, H = entry.origData.height
            const off = document.createElement('canvas')
            off.width = W; off.height = H
            off.getContext('2d').drawImage(img, 0, 0, W, H)
            const data = off.getContext('2d').getImageData(0, 0, W, H).data
            entry.maskData = new Uint8ClampedArray(W * H)
            for (let j = 0; j < W * H; j++) entry.maskData[j] = data[j * 4 + 3]
            entry.resultBlob = blob
            entry.doneEl.classList.add('on')
            resolve()
          }
          img.src = URL.createObjectURL(blob)
        })
      } catch(e) { console.error(e) }
    } else {
      await processEntry(entry)
    }
  }

  // Show zip if multiple done
  const doneCount = entries.filter(e => e.resultBlob).length
  if (doneCount > 1) zipBtn.style.display = 'block'
  statusText.textContent = `All ${entries.length} images processed.`
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })
newBtn.addEventListener('click', () => fileInput.click())

dlBtnEl.addEventListener('click', () => {
  const entry = entries[currentIdx]
  if (!entry || !entry.origData || !entry.maskData) return
  const W = entry.origData.width, H = entry.origData.height
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const ctx = off.getContext('2d')
  const intensity = parseInt(threshSlider.value) / 100
  const src = entry.origData.data
  const out = ctx.createImageData(W, H)
  const d = out.data
  for (let i = 0; i < W * H; i++) {
    const p = i * 4
    d[p] = src[p]; d[p+1] = src[p+1]; d[p+2] = src[p+2]
    d[p+3] = Math.round(255 * (1 - intensity) + entry.maskData[i] * intensity)
  }
  ctx.putImageData(out, 0, 0)
  const a = document.createElement('a')
  a.href = off.toDataURL('image/png')
  a.download = entry.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
  a.click()
})

zipBtn.addEventListener('click', async () => {
  const done = entries.filter(e => e.resultBlob)
  if (!done.length) return
  zipBtn.textContent = 'Zipping…'
  zipBtn.disabled = true
  try {
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
    const zip = new JSZip()
    for (const e of done) zip.file(e.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png', await e.resultBlob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'removed-backgrounds.zip'
    a.click()
  } catch(err) { alert('ZIP failed: ' + err.message) }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

;(function injectSEO() {
  const seo = t.seo && t.seo['remove-background']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()