import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
injectHreflang('image-splitter')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['image-splitter']) || 'Image Splitter'
const seoData   = t.seo && t.seo['image-splitter']
const descText  = seoData ? seoData.h2a : 'Split any image into a grid of equal pieces. Free and private — files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = 'var(--bg-page)'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .sp-preview-wrap{position:relative;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);overflow:hidden;display:inline-block;max-width:100%;}
  .sp-preview-wrap img{display:block;max-width:100%;height:auto;}
  .sp-preview-wrap canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;}
  .sp-grid-presets{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
  .sp-preset{padding:7px 14px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:600;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .sp-preset:hover{border-color:var(--accent);color:var(--accent);}
  .sp-preset.active{background:var(--accent);color:var(--text-on-accent);border-color:var(--accent);}
  .sp-custom-row{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  .sp-custom-input{width:56px;padding:7px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-surface);text-align:center;outline:none;}
  .sp-custom-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(200,75,49,0.12);}
  .sp-info{font-size:12px;color:var(--text-tertiary);margin-bottom:12px;}
  .download-btn{display:none;text-align:center;padding:12px 24px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;border:none;border-radius:10px;cursor:pointer;transition:background 0.15s;width:100%;text-decoration:none;margin-top:10px;}
  .download-btn:hover{background:var(--accent-hover);}
  .next-steps{display:none;margin-top:20px;}
  .next-steps-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;}
  .next-link{padding:7px 14px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:600;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;text-decoration:none;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px}
  .seo-section ol{padding-left:20px;margin:0 0 12px}
  .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px}
  .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px}
.seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
  .seo-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-primary);text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .seo-link:hover{border-color:var(--accent);color:var(--accent)}
    .seo-section .faq-item { background:var(--bg-card); border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:var(--text-primary); margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
`
document.head.appendChild(style)
document.title = toolName + ' Free | No Upload — RelahConvert'

const PRESETS = [
  { label: '2×2', rows: 2, cols: 2 },
  { label: '3×3', rows: 3, cols: 3 },
  { label: '4×4', rows: 4, cols: 4 },
  { label: '1×2', rows: 1, cols: 2 },
  { label: '1×3', rows: 1, cols: 3 },
  { label: '2×1', rows: 2, cols: 1 },
  { label: '3×1', rows: 3, cols: 1 },
]

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0;">${descText}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">${dropHint}</span>
      <label for="fileInput" style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:48px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;" onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-bg)'" onmouseout="this.style.borderColor='var(--border-light)';this.style.background='transparent'">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <span style="font-size:14px;color:var(--text-secondary);margin-top:10px;font-family:'DM Sans',sans-serif;font-weight:600;">${t.drop_images || 'Drop images'}</span>
      </label>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="previewArea" style="display:none;">
      <div style="margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Grid presets</div>
        <div class="sp-grid-presets" id="presetBtns">
          ${PRESETS.map((p, i) => `<button class="sp-preset${i === 0 ? ' active' : ''}" data-idx="${i}">${p.label}</button>`).join('')}
          <button class="sp-preset" id="customBtn">Custom</button>
        </div>
        <div class="sp-custom-row" id="customRow" style="display:none;">
          <span style="font-size:13px;color:var(--text-secondary);">Rows</span>
          <input class="sp-custom-input" id="customRows" type="number" min="1" max="20" value="2" />
          <span style="font-size:13px;color:var(--text-secondary);">×</span>
          <span style="font-size:13px;color:var(--text-secondary);">Columns</span>
          <input class="sp-custom-input" id="customCols" type="number" min="1" max="20" value="2" />
        </div>
        <div class="sp-info" id="splitInfo"></div>
      </div>
      <div class="sp-preview-wrap" id="previewWrap">
        <img id="previewImg" />
        <canvas id="gridOverlay"></canvas>
      </div>
      <button class="download-btn" id="downloadBtn">Download All as ZIP</button>
    </div>
    <div id="nextSteps" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput       = document.getElementById('fileInput')
const previewArea     = document.getElementById('previewArea')
const previewImg      = document.getElementById('previewImg')
const gridOverlay     = document.getElementById('gridOverlay')
const presetBtns      = document.getElementById('presetBtns')
const customBtn       = document.getElementById('customBtn')
const customRow       = document.getElementById('customRow')
const customRowsInput = document.getElementById('customRows')
const customColsInput = document.getElementById('customCols')
const splitInfo       = document.getElementById('splitInfo')
const downloadBtn     = document.getElementById('downloadBtn')
const nextSteps       = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

let uploadedImg = null
let originalFile = null
let currentRows = 2
let currentCols = 2
let isCustom = false

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const img = new Image()
  img.onload = () => {
    uploadedImg = img
    previewImg.src = img.src
    previewArea.style.display = 'block'
    document.getElementById('uploadArea').style.display = 'none'
    downloadBtn.style.display = 'block'
    drawGrid()
  }
  img.src = URL.createObjectURL(file)
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) handleFile(fileInput.files[0])
  fileInput.value = ''
})

document.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation() })
document.addEventListener('drop', e => {
  e.preventDefault(); e.stopPropagation()
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) handleFile(file)
})

// Preset buttons
presetBtns.addEventListener('click', e => {
  const btn = e.target.closest('.sp-preset')
  if (!btn || btn === customBtn) return
  const idx = parseInt(btn.dataset.idx)
  if (isNaN(idx)) return
  isCustom = false
  customRow.style.display = 'none'
  customBtn.classList.remove('active')
  presetBtns.querySelectorAll('.sp-preset[data-idx]').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  currentRows = PRESETS[idx].rows
  currentCols = PRESETS[idx].cols
  drawGrid()
})

// Custom button
customBtn.addEventListener('click', () => {
  isCustom = true
  presetBtns.querySelectorAll('.sp-preset[data-idx]').forEach(b => b.classList.remove('active'))
  customBtn.classList.add('active')
  customRow.style.display = 'flex'
  currentRows = parseInt(customRowsInput.value) || 2
  currentCols = parseInt(customColsInput.value) || 2
  drawGrid()
})

customRowsInput.addEventListener('input', () => {
  let v = parseInt(customRowsInput.value)
  if (v < 1) v = 1; if (v > 20) v = 20
  currentRows = v || 1
  drawGrid()
})
customColsInput.addEventListener('input', () => {
  let v = parseInt(customColsInput.value)
  if (v < 1) v = 1; if (v > 20) v = 20
  currentCols = v || 1
  drawGrid()
})

function drawGrid() {
  if (!uploadedImg) return
  const wrap = document.getElementById('previewWrap')
  const displayW = previewImg.clientWidth
  const displayH = previewImg.clientHeight
  gridOverlay.width = displayW
  gridOverlay.height = displayH
  const ctx = gridOverlay.getContext('2d')
  ctx.clearRect(0, 0, displayW, displayH)

  const cellW = displayW / currentCols
  const cellH = displayH / currentRows

  // Draw grid lines
  ctx.strokeStyle = 'rgba(200, 75, 49, 0.7)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])

  // Vertical lines
  for (let c = 1; c < currentCols; c++) {
    const x = Math.round(c * cellW)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, displayH)
    ctx.stroke()
  }
  // Horizontal lines
  for (let r = 1; r < currentRows; r++) {
    const y = Math.round(r * cellH)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(displayW, y)
    ctx.stroke()
  }

  // Labels
  ctx.setLineDash([])
  ctx.font = '11px DM Sans, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let r = 0; r < currentRows; r++) {
    for (let c = 0; c < currentCols; c++) {
      const cx = c * cellW + cellW / 2
      const cy = r * cellH + cellH / 2
      const label = `${r + 1},${c + 1}`
      const tw = ctx.measureText(label).width + 10
      ctx.fillStyle = 'rgba(44,24,16,0.65)'
      ctx.beginPath()
      ctx.roundRect(cx - tw / 2, cy - 10, tw, 20, 4)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(label, cx, cy)
    }
  }

  const pieceW = Math.round(uploadedImg.naturalWidth / currentCols)
  const pieceH = Math.round(uploadedImg.naturalHeight / currentRows)
  const total = currentRows * currentCols
  splitInfo.textContent = `${total} pieces — each ${pieceW}×${pieceH}px`
}

// Redraw on image load / resize
previewImg.addEventListener('load', drawGrid)
window.addEventListener('resize', drawGrid)

// Download ZIP
downloadBtn.addEventListener('click', async () => {
  if (!uploadedImg) return
  downloadBtn.textContent = 'Splitting…'
  downloadBtn.disabled = true

  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()

    const imgW = uploadedImg.naturalWidth
    const imgH = uploadedImg.naturalHeight
    const cellW = imgW / currentCols
    const cellH = imgH / currentRows

    const pieceCanvas = document.createElement('canvas')
    const pctx = pieceCanvas.getContext('2d')

    const promises = []
    for (let r = 0; r < currentRows; r++) {
      for (let c = 0; c < currentCols; c++) {
        const sx = Math.round(c * cellW)
        const sy = Math.round(r * cellH)
        const sw = Math.round((c + 1) * cellW) - sx
        const sh = Math.round((r + 1) * cellH) - sy
        pieceCanvas.width = sw
        pieceCanvas.height = sh
        pctx.clearRect(0, 0, sw, sh)
        pctx.drawImage(uploadedImg, sx, sy, sw, sh, 0, 0, sw, sh)

        promises.push(new Promise(resolve => {
          pieceCanvas.toBlob(blob => {
            zip.file(`piece_row${r + 1}_col${c + 1}.jpg`, blob)
            resolve()
          }, 'image/jpeg', 0.92)
        }))
      }
    }

    await Promise.all(promises)
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'split-images.zip'
    a.click();if(window.showReviewPrompt)window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)

    buildNextSteps()
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }

  downloadBtn.textContent = 'Download All as ZIP'
  downloadBtn.disabled = false
})

// ── IndexedDB helpers ──────────────────────────────────────────────────────
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
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.crop || 'Crop Image', href: localHref('crop') },
    { label: ns.resize || 'Resize Image', href: localHref('resize') },
    { label: ns.compress || 'Compress Image', href: localHref('compress') },
    { label: ns['merge-images'] || 'Merge Images', href: localHref('merge-images') },
  ]
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (originalFile) {
        try {
          await saveFilesToIDB([{ blob: originalFile, name: originalFile.name, type: originalFile.type }])
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

;(function injectSEO() {
  const seo = t.seo && t.seo['image-splitter']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
