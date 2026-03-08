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
  #app>div{animation:fadeUp 0.4s ease both}
  @keyframes spin{to{transform:rotate(360deg)}}

  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}

  /* File grid */
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:hidden;position:relative;}
  .card-thumb{width:100%;height:130px;object-fit:contain;display:block;background:#F5F0E8;}

  /* Status overlay on each card */
  .card-overlay{position:absolute;top:0;left:0;right:0;height:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,0.82);font-family:'DM Sans',sans-serif;font-size:12px;color:#5A4A3A;font-weight:600;}
  .card-overlay.done{background:rgba(255,255,255,0);}
  .spinner-sm{width:24px;height:24px;border:2.5px solid #E8E0D5;border-top-color:#C84B31;border-radius:50%;animation:spin 0.7s linear infinite;}
  .card-prog{width:80px;height:3px;background:#E8E0D5;border-radius:3px;overflow:hidden;}
  .card-prog-bar{height:100%;background:#C84B31;border-radius:3px;width:0%;transition:width 0.2s;}

  /* Slider on each card */
  .card-slider-wrap{position:relative;width:100%;height:130px;overflow:hidden;cursor:ew-resize;user-select:none;display:none;}
  .card-slider-wrap canvas{display:block;width:100%;height:100%;object-fit:contain;}
  .card-divider{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 5px rgba(0,0,0,0.3);transform:translateX(-50%);pointer-events:none;z-index:5;}
  .card-divider-handle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:9px;color:#C84B31;font-weight:900;}

  .card-fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:6px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .card-dl{display:none;font-size:11px;font-weight:700;color:#C84B31;font-family:'DM Sans',sans-serif;padding:0 8px 6px;text-decoration:none;display:none;}
  .card-dl:hover{text-decoration:underline;}
  .card-rm{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;}

  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;min-width:160px;}
  .action-btn:hover{background:#A63D26;}
  .action-btn.dark{background:#2C1810;}
  .action-btn.dark:hover{background:#1a0f09;}
  .action-btn:disabled{background:#C4B8A8;cursor:not-allowed;}

  .status-text{font-size:13px;color:#7A6A5A;font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}

  /* Slider control */
  #globalSliderRow{display:none;align-items:center;gap:12px;margin-bottom:14px;background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;padding:12px 16px;}
  #globalSliderRow.on{display:flex;}
  #globalSliderRow label{font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #threshSlider{flex:1;accent-color:#C84B31;cursor:pointer;}
  #sliderVal{font-size:12px;color:#C84B31;font-weight:700;font-family:'DM Sans',sans-serif;width:36px;text-align:right;}

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
  <div style="max-width:900px;margin:32px auto;padding:0 16px 24px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>

    <div id="globalSliderRow">
      <label>Background removal:</label>
      <input type="range" id="threshSlider" min="0" max="100" value="100" />
      <span id="sliderVal">100%</span>
    </div>

    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>

    <div id="actionRow">
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
  </div>
`

injectHeader()

const fileInput      = document.getElementById('fileInput')
const fileGrid       = document.getElementById('fileGrid')
const actionRow      = document.getElementById('actionRow')
const zipBtn         = document.getElementById('zipBtn')
const statusText     = document.getElementById('statusText')
const globalSlider   = document.getElementById('globalSliderRow')
const threshSlider   = document.getElementById('threshSlider')
const sliderValEl    = document.getElementById('sliderVal')

// entries[i] = { file, origData, maskData, canvas, dlLink, intensity }
let entries = []
let removeBackgroundFn = null

function drawChecker(ctx, x, y, w, h, sz = 10) {
  for (let r = 0; r * sz < h; r++)
    for (let c = 0; c * sz < w; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#cccccc' : '#f0f0f0'
      ctx.fillRect(x + c * sz, y + r * sz, sz, sz)
    }
}

function applyBlend(entry, intensity) {
  if (!entry.origData || !entry.maskData) return
  entry.intensity = intensity
  const { canvas, origData, maskData } = entry
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

// Global slider updates all done entries
threshSlider.addEventListener('input', () => {
  const v = parseInt(threshSlider.value)
  sliderValEl.textContent = v + '%'
  entries.forEach(e => { if (e.maskData) applyBlend(e, v / 100) })
})

async function processEntry(entry) {
  const { file, overlay, progBar, overlayLabel } = entry

  // Load original
  await new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight
      entry.canvas.width = W; entry.canvas.height = H
      const ctx = entry.canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      entry.origData = ctx.getImageData(0, 0, W, H)
      resolve()
    }
    img.src = URL.createObjectURL(file)
  })

  // Show spinner
  overlay.style.display = 'flex'
  overlayLabel.textContent = 'Processing…'
  progBar.style.width = '10%'

  try {
    if (!removeBackgroundFn) {
      overlayLabel.textContent = 'Loading AI…'
      const mod = await import('@imgly/background-removal')
      removeBackgroundFn = mod.removeBackground
    }
    progBar.style.width = '30%'
    overlayLabel.textContent = 'Removing bg…'

    const blob = await removeBackgroundFn(file, {
      model: 'small',
      progress: (key, cur, tot) => {
        if (tot > 0) progBar.style.width = (30 + Math.round((cur / tot) * 60)) + '%'
      },
    })

    // Extract mask
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const W = entry.canvas.width, H = entry.canvas.height
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

    // Apply current slider intensity
    const intensity = parseInt(threshSlider.value) / 100
    applyBlend(entry, intensity)

    overlay.style.display = 'none'

    // Show download link
    entry.dlLink.href = URL.createObjectURL(blob)
    entry.dlLink.download = file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
    entry.dlLink.style.display = 'block'

  } catch(err) {
    overlayLabel.textContent = 'Error'
    progBar.style.width = '100%'
    progBar.style.background = '#ef4444'
    console.error(err)
  }
}

async function addFiles(newFiles) {
  const fileArr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
  if (!fileArr.length) return

  actionRow.classList.add('on')
  globalSlider.classList.add('on')

  for (const file of fileArr) {
    const entry = { file, origData: null, maskData: null, resultBlob: null, canvas: null, dlLink: null, intensity: 1 }

    const card = document.createElement('div')
    card.className = 'file-card'

    // Canvas for result
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'width:100%;height:130px;object-fit:contain;display:block;background:#F5F0E8;'
    entry.canvas = canvas

    // Thumbnail shown while processing
    const thumb = document.createElement('img')
    thumb.className = 'card-thumb'
    thumb.src = URL.createObjectURL(file)

    // Overlay
    const overlay = document.createElement('div')
    overlay.className = 'card-overlay'
    overlay.style.display = 'none'
    const spinner = document.createElement('div')
    spinner.className = 'spinner-sm'
    const progWrap = document.createElement('div')
    progWrap.className = 'card-prog'
    const progBar = document.createElement('div')
    progBar.className = 'card-prog-bar'
    progWrap.appendChild(progBar)
    const overlayLabel = document.createElement('div')
    overlayLabel.textContent = 'Waiting…'
    overlay.append(spinner, progWrap, overlayLabel)
    entry.overlay = overlay
    entry.progBar = progBar
    entry.overlayLabel = overlayLabel

    const thumbWrap = document.createElement('div')
    thumbWrap.style.cssText = 'position:relative;width:100%;height:130px;overflow:hidden;'
    thumbWrap.append(thumb, canvas, overlay)

    const fname = document.createElement('div')
    fname.className = 'card-fname'
    fname.textContent = file.name

    const dlLink = document.createElement('a')
    dlLink.className = 'card-dl'
    dlLink.textContent = '⬇ Download PNG'
    dlLink.style.display = 'none'
    entry.dlLink = dlLink

    const rmBtn = document.createElement('button')
    rmBtn.className = 'card-rm'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => {
      entries = entries.filter(e => e !== entry)
      card.remove()
      if (entries.length === 0) {
        actionRow.classList.remove('on')
        globalSlider.classList.remove('on')
        statusText.textContent = ''
      }
    })

    card.append(thumbWrap, fname, dlLink, rmBtn)
    fileGrid.appendChild(card)
    entries.push(entry)
  }

  // Process all queued entries sequentially
  statusText.textContent = `Processing ${fileArr.length} image${fileArr.length > 1 ? 's' : ''}…`
  let doneCount = 0
  for (const entry of entries.filter(e => !e.maskData && !e._processing)) {
    entry._processing = true
    await processEntry(entry)
    doneCount++
    statusText.textContent = `${doneCount} of ${entries.length} done — drag slider to adjust removal.`
  }

  if (entries.length > 1) zipBtn.style.display = 'block'
  statusText.textContent = `All done — drag slider to adjust, then download.`
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

zipBtn.addEventListener('click', async () => {
  const done = entries.filter(e => e.resultBlob)
  if (!done.length) return
  zipBtn.textContent = 'Zipping…'
  zipBtn.disabled = true
  try {
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
    const zip = new JSZip()
    for (const e of done) {
      const name = e.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
      zip.file(name, await e.resultBlob.arrayBuffer())
    }
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