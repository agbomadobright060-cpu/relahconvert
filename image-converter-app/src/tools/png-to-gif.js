import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
injectHreflang('png-to-gif')

const t = getT()

const slug = 'png-to-gif'
const inputMime = 'image/png'
const toolName = (t.nav_short && t.nav_short[slug]) || 'PNG to GIF'
const seoData  = t.seo && t.seo[slug]
const descText = seoData ? seoData.h2a : 'Convert PNG images to GIF free. No upload required.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint    || 'or drop images anywhere'
const dlBtn     = t.download     || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'
const parts  = toolName.split(' ')
const h1Main = parts[0]
const h1Em   = parts.slice(1).join(' ')
const GIF_MAX = 600

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .mode-tab{flex:1;padding:10px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;color:var(--text-secondary);cursor:pointer;transition:all 0.15s;text-align:center;}
  .mode-tab.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent);}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:16px;}
  .file-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;}
  .file-card img{width:100%;height:90px;object-fit:cover;display:block;}
  .file-card .card-name{font-size:10px;color:var(--text-secondary);padding:4px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Sans',sans-serif;}
  .file-card .rm{position:absolute;top:4px;right:4px;width:18px;height:18px;border-radius:50%;background:rgba(0,0,0,0.45);border:none;color:#fff;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .main-btn{width:100%;padding:13px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
  .main-btn:hover{background:var(--accent-hover);}
  .main-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;}
  .dark-btn{background:var(--btn-dark);color:var(--text-on-dark-btn);}
  .dark-btn:hover{background:var(--btn-dark-hover) !important;}
  .count-badge{display:inline-block;background:var(--accent-bg);color:var(--accent);font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:'DM Sans',sans-serif;margin-left:10px;}
  .option-row{display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:8px;font-family:'DM Sans',sans-serif;}
  .option-label{font-size:13px;font-weight:600;color:var(--text-primary);}
  .option-val{font-size:13px;color:var(--accent);font-weight:700;min-width:40px;text-align:right;}
  input[type=range]{accent-color:var(--accent);}
  .toggle-wrap{display:flex;align-items:center;gap:8px;}
  .toggle{width:36px;height:20px;background:var(--border-light);border-radius:20px;position:relative;cursor:pointer;transition:background 0.2s;border:none;outline:none;}
  .toggle.on{background:var(--accent);}
  .toggle::after{content:'';position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:3px;left:3px;transition:left 0.2s;}
  .toggle.on::after{left:19px;}
  #animatedPreview{display:none;text-align:center;margin-bottom:12px;}
  #animatedPreview img{max-width:100%;max-height:200px;border-radius:8px;border:1.5px solid var(--border);}
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
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
`
document.head.appendChild(style)
document.title = `${toolName} Free | Bulk & Private — RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);">${dropHint} — up to 25 files</span>
      <span class="count-badge" id="countBadge" style="display:none;"></span>
    </div>
    <input type="file" id="fileInput" accept="image/png" multiple style="display:none;" />

    <div id="fileGrid"></div>

    <!-- Mode toggle — only shown for 2+ files -->
    <div id="modeWrap" style="display:none;margin-bottom:14px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;font-family:'DM Sans',sans-serif;">GIF Mode</div>
      <div style="display:flex;gap:8px;">
        <button class="mode-tab active" id="tabStatic">🖼 Static GIF</button>
        <button class="mode-tab" id="tabAnimated">🎬 Animated GIF</button>
      </div>
    </div>

    <!-- Animated options — only shown in animated mode -->
    <div id="animOpts" style="display:none;margin-bottom:14px;">
      <div class="option-row">
        <span class="option-label">⏱ Seconds per frame</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="range" id="fpsRange" min="0.1" max="3" step="0.1" value="0.5" style="width:120px;">
          <span class="option-val" id="fpsVal">0.5s</span>
        </div>
      </div>
      <div class="option-row">
        <span class="option-label">🔁 Loop</span>
        <div class="toggle-wrap">
          <button class="toggle on" id="loopToggle"></button>
          <span style="font-size:13px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;" id="loopLabel">On</span>
        </div>
      </div>
    </div>

    <!-- Animated preview -->
    <div id="animatedPreview">
      <p style="font-size:12px;color:var(--text-muted);margin:0 0 6px;font-family:'DM Sans',sans-serif;">Preview</p>
      <img id="previewGif" src="" alt="animated preview" />
    </div>

    <button class="main-btn" id="convertBtn" disabled>Convert to GIF</button>
    <a id="downloadLink" class="main-btn dark-btn" style="display:none;text-align:center;text-decoration:none;"></a>
    <button class="main-btn dark-btn" id="zipBtn" style="display:none;">⬇ ${dlZipBtn}</button>
    <p id="statusNote" style="font-size:12px;color:var(--text-muted);text-align:center;margin:4px 0 0;font-family:'DM Sans',sans-serif;min-height:16px;"></p>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileGrid     = document.getElementById('fileGrid')
const countBadge   = document.getElementById('countBadge')
const modeWrap     = document.getElementById('modeWrap')
const tabStatic    = document.getElementById('tabStatic')
const tabAnimated  = document.getElementById('tabAnimated')
const animOpts     = document.getElementById('animOpts')
const fpsRange     = document.getElementById('fpsRange')
const fpsVal       = document.getElementById('fpsVal')
const loopToggle   = document.getElementById('loopToggle')
const loopLabel    = document.getElementById('loopLabel')
const convertBtn   = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const zipBtn       = document.getElementById('zipBtn')
const statusNote   = document.getElementById('statusNote')
const animatedPreview = document.getElementById('animatedPreview')
const previewGif   = document.getElementById('previewGif')

let files = []
let lastResults = []
let isAnimated = false

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

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.compress || 'Compress', href: localHref('compress') },
    { label: ns.resize || 'Resize', href: localHref('resize') },
    { label: ns.crop || 'Crop', href: localHref('crop') },
    { label: ns.watermark || 'Watermark', href: localHref('watermark') },
    { label: ns['remove-background'] || 'Remove BG', href: localHref('remove-background') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastResults.length) {
        try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch(e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}
let loopOn = true

// ── Mode tabs ─────────────────────────────────────────────────────────────────
tabStatic.addEventListener('click', () => {
  isAnimated = false
  tabStatic.classList.add('active'); tabAnimated.classList.remove('active')
  animOpts.style.display = 'none'
  animatedPreview.style.display = 'none'
  resetResult()
})
tabAnimated.addEventListener('click', () => {
  isAnimated = true
  tabAnimated.classList.add('active'); tabStatic.classList.remove('active')
  animOpts.style.display = 'block'
  resetResult()
})

fpsRange.addEventListener('input', () => {
  fpsVal.textContent = parseFloat(fpsRange.value).toFixed(1) + 's'
  resetResult()
})
loopToggle.addEventListener('click', () => {
  loopOn = !loopOn
  loopToggle.classList.toggle('on', loopOn)
  loopLabel.textContent = loopOn ? 'On' : 'Off'
  resetResult()
})

function resetResult() {
  downloadLink.style.display = 'none'
  zipBtn.style.display = 'none'
  animatedPreview.style.display = 'none'
  statusNote.textContent = ''
}

// ── File management ───────────────────────────────────────────────────────────
function updateUI() {
  countBadge.style.display = files.length ? 'inline-block' : 'none'
  countBadge.textContent = `${files.length} image${files.length !== 1 ? 's' : ''}`
  convertBtn.disabled = files.length === 0
  modeWrap.style.display = files.length >= 2 ? 'block' : 'none'
  if (files.length < 2 && isAnimated) {
    isAnimated = false
    tabStatic.classList.add('active'); tabAnimated.classList.remove('active')
    animOpts.style.display = 'none'
  }
  resetResult()
}

function renderGrid() {
  fileGrid.innerHTML = ''
  files.forEach((file, idx) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    const img = document.createElement('img')
    const previewUrl = URL.createObjectURL(file)
    img.onload = () => URL.revokeObjectURL(previewUrl)
    img.src = previewUrl
    const name = document.createElement('div')
    name.className = 'card-name'
    name.textContent = file.name
    const rm = document.createElement('button')
    rm.className = 'rm'
    rm.textContent = '×'
    rm.addEventListener('click', () => {
      files.splice(idx, 1)
      renderGrid(); updateUI()
    })
    card.append(img, name, rm)
    fileGrid.appendChild(card)
  })
  updateUI()
}

function addFiles(incoming) {
  const valid = Array.from(incoming).filter(f =>
    f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
  ).slice(0, 25 - files.length)
  files.push(...valid)
  renderGrid()
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

// ── GIF encoding helpers ──────────────────────────────────────────────────────
function fileToCanvas(file, maxSize = GIF_MAX) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onerror = reject
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h / w * maxSize); w = maxSize }
        else { w = Math.round(w / h * maxSize); h = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.src = url
  })
}

function staticGifFromCanvas(canvas) {
  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d')
  const data = new Uint8Array(ctx.getImageData(0, 0, w, h).data.buffer)
  const palette = quantize(data, 256)
  const index = applyPalette(data, palette)
  const gif = GIFEncoder()
  gif.writeFrame(index, w, h, { palette, repeat: 0 })
  gif.finish()
  return new Blob([gif.bytes()], { type: 'image/gif' })
}

function animatedGifFromCanvases(canvases, delayMs, loop) {
  // All frames must be same size — use first frame dimensions
  const w = canvases[0].width, h = canvases[0].height
  const gif = GIFEncoder()
  for (const canvas of canvases) {
    // Resize each frame to match first if needed
    let src = canvas
    if (canvas.width !== w || canvas.height !== h) {
      const tmp = document.createElement('canvas')
      tmp.width = w; tmp.height = h
      const tctx = tmp.getContext('2d')
      tctx.fillStyle = '#ffffff'
      tctx.fillRect(0, 0, w, h)
      tctx.drawImage(canvas, 0, 0, w, h)
      src = tmp
    }
    const data = new Uint8Array(src.getContext('2d').getImageData(0, 0, w, h).data.buffer)
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)
    gif.writeFrame(index, w, h, {
      palette,
      delay: delayMs,
      repeat: loop ? 0 : -1   // 0 = loop forever, -1 = no loop
    })
  }
  gif.finish()
  return new Blob([gif.bytes()], { type: 'image/gif' })
}

// ── Convert ───────────────────────────────────────────────────────────────────
convertBtn.addEventListener('click', async () => {
  if (!files.length) return
  convertBtn.disabled = true
  convertBtn.textContent = 'Processing…'
  statusNote.textContent = ''
  resetResult()

  try {
    const delayMs = Math.round(parseFloat(fpsRange.value) * 100) // gifenc uses centiseconds

    if (isAnimated && files.length >= 2) {
      // ── Animated GIF ──
      statusNote.textContent = 'Building frames…'
      const canvases = []
      for (let i = 0; i < files.length; i++) {
        statusNote.textContent = `Loading frame ${i + 1} of ${files.length}…`
        canvases.push(await fileToCanvas(files[i]))
      }
      statusNote.textContent = 'Encoding animated GIF…'
      const blob = animatedGifFromCanvases(canvases, delayMs, loopOn)
      const url = URL.createObjectURL(blob)
      // Show preview
      previewGif.src = url
      animatedPreview.style.display = 'block'
      // Download button
      downloadLink.href = url
      downloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
      downloadLink.download = 'animated.gif'
      downloadLink.textContent = `⬇ ${dlBtn} animated.gif (${Math.round(blob.size / 1024)} KB)`
      downloadLink.style.display = 'block'
      statusNote.textContent = `${files.length} frames · ${Math.round(blob.size / 1024)} KB`
      lastResults = [{ blob, name: 'animated.gif', type: 'image/gif' }]
      buildNextSteps()

    } else {
      // ── Static GIF(s) ──
      if (files.length === 1) {
        statusNote.textContent = 'Converting…'
        const canvas = await fileToCanvas(files[0])
        const blob = staticGifFromCanvas(canvas)
        const url = URL.createObjectURL(blob)
        const base = files[0].name.replace(/\.[^.]+$/, '')
        downloadLink.href = url
        downloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
        downloadLink.download = `${base}.gif`
        downloadLink.textContent = `⬇ ${dlBtn} (${Math.round(blob.size / 1024)} KB)`
        downloadLink.style.display = 'block'
        lastResults = [{ blob, name: `${base}.gif`, type: 'image/gif' }]
        buildNextSteps()
      } else {
        // Multiple static GIFs → ZIP
        const blobs = []
        for (let i = 0; i < files.length; i++) {
          statusNote.textContent = `Converting ${i + 1} of ${files.length}…`
          const canvas = await fileToCanvas(files[i])
          const blob = staticGifFromCanvas(canvas)
          const base = files[i].name.replace(/\.[^.]+$/, '')
          blobs.push({ name: `${base}.gif`, blob })
        }
        // Lazy load JSZip
        if (!window.JSZip) {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
            s.onload = res; s.onerror = rej
            document.head.appendChild(s)
          })
        }
        const zip = new window.JSZip()
        for (const { name, blob } of blobs) zip.file(name, await blob.arrayBuffer())
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
        const zipUrl = URL.createObjectURL(zipBlob)
        zipBtn._url = zipUrl
        zipBtn.style.display = 'block'
        statusNote.textContent = `${files.length} GIFs ready — ${Math.round(zipBlob.size / 1024)} KB total`
        lastResults = blobs.map(b => ({ blob: b.blob, name: b.name, type: 'image/gif' }))
        buildNextSteps()
        zipBtn.addEventListener('click', () => {
          const a = document.createElement('a')
          a.href = zipBtn._url; a.download = 'converted-gif.zip'; a.click();if(window.showReviewPrompt)window.showReviewPrompt()
          setTimeout(() => URL.revokeObjectURL(zipBtn._url), 10000)
        }, { once: true })
      }
      statusNote.textContent = statusNote.textContent || 'Done!'
    }

  } catch (err) {
    alert('Error: ' + (err?.message || err))
  }

  convertBtn.disabled = false
  convertBtn.textContent = 'Convert to GIF'
})

// ── SEO ───────────────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo[slug]
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()