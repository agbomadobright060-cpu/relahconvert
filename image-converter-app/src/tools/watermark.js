import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('watermark')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['watermark']) || 'Watermark Image'
const seoData   = t.seo && t.seo['watermark']
const descText  = seoData ? seoData.h2a : 'Add text or image watermarks free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = 'var(--bg-page)'

if (document.head) {
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    .opt-btn { width:100%; padding:12px; border:none; border-radius:10px; background:var(--accent); color:var(--text-on-accent); font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; margin-bottom:8px; }
    .opt-btn:hover { background:var(--accent-hover); transform:translateY(-1px); }
    .opt-btn:disabled { background:var(--btn-disabled); cursor:not-allowed; opacity:0.7; transform:none; }
    .opt-btn.dark { background:var(--btn-dark); }
    .opt-btn.dark:hover { background:var(--btn-dark-hover); }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:var(--text-on-accent); font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    .tool-layout { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
    .image-col { background:var(--bg-card); border-radius:14px; border:1.5px solid var(--border); min-height:320px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; padding:16px; gap:10px; }
    #previewCanvas { max-width:100%; max-height:420px; border-radius:6px; display:block; cursor:move; }
    .controls-col { background:var(--bg-card); border-radius:14px; border:1.5px solid var(--border); padding:16px; font-family:'DM Sans',sans-serif; max-height:85vh; overflow-y:auto; }
    .controls-col h3 { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:var(--text-primary); margin:0 0 12px; }
    .section-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; font-family:'DM Sans',sans-serif; }
    .divider { height:1px; background:#F0EAE3; margin:12px 0; }
    .ctrl-input { width:100%; padding:8px 10px; border:1.5px solid var(--border-light); border-radius:8px; font-size:13px; font-family:'DM Sans',sans-serif; background:var(--bg-card); color:var(--text-primary); outline:none; box-sizing:border-box; }
    .ctrl-input:focus { border-color:var(--accent); }
    input[type=range] { width:100%; accent-color:var(--accent); margin:3px 0; }
    .range-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
    .range-val { font-size:12px; color:var(--text-muted); min-width:36px; text-align:right; font-family:'DM Sans',sans-serif; }
    .wm-list { display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
    .wm-card { border:1.5px solid var(--border); border-radius:10px; overflow:hidden; }
    .wm-card.selected { border-color:var(--accent); }
    .wm-card-header { display:flex; align-items:center; gap:8px; padding:8px 10px; background:#F9F6F2; cursor:pointer; }
    .wm-card-header:hover { background:var(--bg-surface); }
    .wm-type-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; font-family:'DM Sans',sans-serif; }
    .wm-type-badge.text { background:#EFF6FF; color:#2563EB; }
    .wm-type-badge.image { background:#F0FDF4; color:#16A34A; }
    .wm-card-title { flex:1; font-size:12px; font-weight:600; color:var(--text-primary); font-family:'DM Sans',sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .wm-delete { background:none; border:none; cursor:pointer; color:var(--btn-disabled); font-size:14px; padding:2px 4px; line-height:1; }
    .wm-delete:hover { color:var(--accent); }
    .wm-card-body { padding:10px; display:none; }
    .wm-card-body.open { display:block; }
    .add-row { display:flex; gap:8px; margin-bottom:12px; }
    .add-btn { flex:1; padding:8px; border:1.5px dashed var(--border-light); border-radius:8px; background:var(--bg-card); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; color:var(--text-secondary); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.15s; }
    .add-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-bg); }
    .swatches { display:flex; gap:5px; flex-wrap:wrap; margin-top:5px; }
    .swatch { width:20px; height:20px; border-radius:50%; border:2px solid var(--border); cursor:pointer; transition:transform 0.15s; flex-shrink:0; }
    .swatch:hover { transform:scale(1.2); }
    .file-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
    .file-chip { display:flex; align-items:center; gap:5px; background:var(--bg-surface); border-radius:20px; padding:4px 10px; font-size:11px; font-family:'DM Sans',sans-serif; color:var(--text-secondary); }
    .file-chip button { background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:12px; line-height:1; padding:0; }
    .file-chip button:hover { color:var(--accent); }
    .drag-hint { display:flex; align-items:center; gap:6px; background:var(--bg-surface); border-radius:8px; padding:8px 10px; font-size:11px; color:var(--text-tertiary); font-family:'DM Sans',sans-serif; }
    .next-steps { margin-top:20px; }
    .next-steps-label { font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; font-family:'DM Sans',sans-serif; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid var(--border-light); font-size:13px; font-weight:500; color:var(--text-primary); text-decoration:none; background:var(--bg-card); cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:var(--accent); color:var(--accent); }
    @media (max-width:700px) { .tool-layout { grid-template-columns:1fr; } .image-col { min-height:220px; } }
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
}

document.title = `${toolName} Free | Bulk & Private — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div id="mainContainer" style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:400; color:var(--text-primary); margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:var(--accent);">${h1Em}</em></h1>
      <p style="font-size:13px; color:var(--text-tertiary); margin:0 0 14px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:var(--text-muted); margin-left:10px;">${t.drop_hint || 'or drop images anywhere'}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
      <label for="fileInput" id="wmDropZone" style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:48px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);" onmouseover="this.style.borderColor='var(--accent)';this.style.background='var(--accent-bg)'" onmouseout="this.style.borderColor='var(--border-light)';this.style.background='var(--bg-card)'">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <span style="font-size:14px;color:var(--text-secondary);margin-top:10px;font-family:'DM Sans',sans-serif;font-weight:600;">${t.drop_images || 'Drop images'}</span>
      </label>
    </div>
    <div class="tool-layout" id="toolLayout" style="display:none;">
      <div class="image-col">
        <div class="file-chips" id="fileChips"></div>
        <canvas id="previewCanvas"></canvas>
        <div class="drag-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3"/><path d="M2 12h20M12 2v20"/></svg>
          Click a watermark layer then drag it on the preview to reposition
        </div>
      </div>
      <div class="controls-col">
        <div id="modeToggle" style="display:none;margin-bottom:12px;">
          <div style="display:flex;gap:0;border:1.5px solid var(--border-light);border-radius:10px;overflow:hidden;">
            <button class="mode-btn active" data-mode="all" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--accent);color:var(--text-on-accent);transition:all 0.15s;">Apply to All</button>
            <button class="mode-btn" data-mode="individual" style="flex:1;padding:8px 0;border:none;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;background:var(--bg-card);color:var(--text-secondary);transition:all 0.15s;">Individual</button>
          </div>
        </div>
        <h3>Watermark Layers</h3>
        <div class="add-row">
          <button class="add-btn" id="addTextBtn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            + Add Text
          </button>
          <label class="add-btn" for="addImgInput">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            + Add Logo
          </label>
          <input type="file" id="addImgInput" accept="image/*" style="display:none;" />
        </div>
        <div class="wm-list" id="wmList"></div>
        <div class="divider"></div>
        <button class="opt-btn" id="applyBtn" disabled>${dlBtn}</button>
        <div id="zipWrap" style="display:none; margin-top:4px;">
          <a id="zipBtn" class="opt-btn dark" style="display:block; text-align:center; text-decoration:none;">⬇ ${dlZipBtn}</a>
          <p id="zipNote" style="font-size:11px; color:var(--text-muted); text-align:center; margin:4px 0 0; font-family:'DM Sans',sans-serif;"></p>
        </div>
      </div>
    </div>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

let baseFiles = [], activeFileIdx = 0, watermarks = [], selectedWmId = null
let isDragging = false, dragOffsetX = 0, dragOffsetY = 0, wmIdCounter = 0
let lastResults = []
let wmMode = 'all' // 'all' or 'individual'

// Save current watermarks to the active file's state
function saveWMState() {
  if (wmMode === 'individual' && baseFiles[activeFileIdx]) {
    baseFiles[activeFileIdx].watermarks = watermarks
  }
}
// Load watermarks for a given file index
function loadWMState(idx) {
  if (wmMode === 'individual' && baseFiles[idx]) {
    watermarks = baseFiles[idx].watermarks || []
  }
}
// Get watermarks for a specific entry (used during export)
function getWMFor(entry) {
  if (wmMode === 'individual') return entry.watermarks || []
  return watermarks
}

const fileInput     = document.getElementById('fileInput')
const toolLayout    = document.getElementById('toolLayout')
const previewCanvas = document.getElementById('previewCanvas')
const fileChips     = document.getElementById('fileChips')
const wmList        = document.getElementById('wmList')
const applyBtn      = document.getElementById('applyBtn')
const addTextBtn    = document.getElementById('addTextBtn')
const addImgInput   = document.getElementById('addImgInput')
const nextSteps     = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

function newId() { return ++wmIdCounter }

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

// ── IndexedDB helpers ──────────────────────────────────────────────────────
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
async function loadFilesFromIDB() {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => { store.clear(); resolve(req.result || []) }
    req.onerror = () => reject(new Error('IDB read failed'))
  })
}
async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const records = await loadFilesFromIDB()
    if (!records.length) return
    const fileObjs = records.map(r => new File([r.blob], r.name, { type: r.type }))
    loadFiles(fileObjs)
  } catch (e) {}
}

// ── Next steps ─────────────────────────────────────────────────────────────
function buildNextSteps() {
  const mime = baseFiles.length > 0 ? baseFiles[0].file.type : 'image/jpeg'
  const isJpg = mime === 'image/jpeg'
  const isPng = mime === 'image/png'
  const isWebp = mime === 'image/webp'
  const buttons = []
  buttons.push({ label: t.nav_short?.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: t.nav_short?.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: t.nav_short?.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: t.nav_short?.rotate || 'Rotate', href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.flip || 'Flip', href: localHref('flip') })
  buttons.push({ label: t.nav_short?.grayscale || 'Black & White', href: localHref('grayscale') })
  if (!isJpg)  buttons.push({ label: t.next_to_jpg  || 'Convert to JPG',  href: localHref('png-to-jpg') })
  if (!isPng)  buttons.push({ label: t.next_to_png  || 'Convert to PNG',  href: localHref('jpg-to-png') })
  if (!isWebp) buttons.push({ label: t.next_to_webp || 'Convert to WebP', href: localHref('jpg-to-webp') })
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (lastResults.length) {
        try { await saveFilesToIDB(lastResults); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

function getWmRect(wm, cw, ch) {
  if (wm.type === 'text') {
    const ctx = previewCanvas.getContext('2d')
    const scale = cw / (baseFiles[activeFileIdx]?.img.naturalWidth || cw)
    const fs = Math.round(wm.fontSize * scale)
    ctx.font = `bold ${fs}px 'DM Sans', Arial, sans-serif`
    const tw = ctx.measureText(wm.text || '© Watermark').width
    return { x: wm.posX * cw - tw / 2, y: wm.posY * ch - fs / 2, w: tw, h: fs }
  } else if (wm.imgEl) {
    const ww = cw * (wm.imgSizePct / 100)
    const wh = ww * (wm.imgEl.naturalHeight / wm.imgEl.naturalWidth)
    return { x: wm.posX * cw - ww / 2, y: wm.posY * ch - wh / 2, w: ww, h: wh }
  }
  return { x: 0, y: 0, w: 0, h: 0 }
}

function renderPreview() {
  const entry = baseFiles[activeFileIdx]
  if (!entry) return
  const img = entry.img
  const maxW = 560
  const scale = Math.min(1, maxW / img.naturalWidth)
  const cw = Math.round(img.naturalWidth * scale)
  const ch = Math.round(img.naturalHeight * scale)
  previewCanvas.width = cw; previewCanvas.height = ch
  const ctx = previewCanvas.getContext('2d')
  ctx.drawImage(img, 0, 0, cw, ch)
  watermarks.forEach(wm => {
    ctx.save()
    ctx.globalAlpha = wm.opacity / 100
    const { x, y, w, h } = getWmRect(wm, cw, ch)
    if (wm.type === 'text') {
      const fs = Math.round(wm.fontSize * scale)
      ctx.font = `bold ${fs}px 'DM Sans', Arial, sans-serif`
      ctx.fillStyle = wm.color
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = Math.round(4 * scale)
      ctx.fillText(wm.text || '© Watermark', x, y + h)
    } else if (wm.imgEl) {
      ctx.drawImage(wm.imgEl, x, y, w, h)
    }
    if (wm.id === selectedWmId) {
      ctx.globalAlpha = 1; ctx.strokeStyle = '#C84B31'; ctx.lineWidth = 2
      ctx.setLineDash([5, 3]); ctx.strokeRect(x - 4, y - 4, w + 8, h + 8)
    }
    ctx.restore()
  })
}

function drawWatermarkFull(ctx, cw, ch, wm) {
  ctx.save(); ctx.globalAlpha = wm.opacity / 100
  if (wm.type === 'text') {
    ctx.font = `bold ${wm.fontSize}px 'DM Sans', Arial, sans-serif`
    ctx.fillStyle = wm.color; ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 4
    const tw = ctx.measureText(wm.text || '© Watermark').width
    const th = wm.fontSize
    ctx.fillText(wm.text || '© Watermark', wm.posX * cw - tw / 2, wm.posY * ch - th / 2 + th)
  } else if (wm.imgEl) {
    const ww = cw * (wm.imgSizePct / 100)
    const wh = ww * (wm.imgEl.naturalHeight / wm.imgEl.naturalWidth)
    ctx.drawImage(wm.imgEl, wm.posX * cw - ww / 2, wm.posY * ch - wh / 2, ww, wh)
  }
  ctx.restore()
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, mime, quality))
}

function renderWmList() {
  wmList.innerHTML = ''
  watermarks.forEach(wm => {
    const card = document.createElement('div')
    card.className = 'wm-card' + (wm.id === selectedWmId ? ' selected' : '')
    card.dataset.id = wm.id
    const previewThumb = wm.type === 'image' && wm.imgEl
      ? `<img src="${wm.imgEl.src}" style="width:20px;height:20px;object-fit:contain;border-radius:3px;border:1px solid var(--border);">`
      : ''
    card.innerHTML = `
      <div class="wm-card-header">
        <span class="wm-type-badge ${wm.type}">${wm.type === 'text' ? 'T' : '⬛'}</span>
        ${previewThumb}
        <span class="wm-card-title">${wm.type === 'text' ? (wm.text || '© Watermark') : 'Logo'}</span>
        <button class="wm-delete" data-id="${wm.id}">✕</button>
      </div>
      <div class="wm-card-body ${wm.id === selectedWmId ? 'open' : ''}">
        ${wm.type === 'text' ? `
          <div class="section-label" style="margin-top:4px;">Text</div>
          <input class="ctrl-input wm-text" data-id="${wm.id}" value="${wm.text}" placeholder="Watermark text" style="margin-bottom:8px;" />
          <div class="section-label">Color</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <input type="color" class="wm-color" data-id="${wm.id}" value="${wm.color}" style="width:36px;height:30px;border:1.5px solid var(--border-light);border-radius:6px;cursor:pointer;padding:2px;" />
            <div class="swatches">
              ${['#ffffff','#000000','#C84B31','#2563EB','#16A34A','#F59E0B'].map(c =>
                `<div class="swatch color-swatch" data-id="${wm.id}" data-color="${c}" style="background:${c};"></div>`
              ).join('')}
            </div>
          </div>
          <div class="section-label">Font Size</div>
          <div class="range-row">
            <input type="range" class="wm-size" data-id="${wm.id}" min="10" max="120" value="${wm.fontSize}" />
            <span class="range-val wm-size-val" data-id="${wm.id}">${wm.fontSize}px</span>
          </div>
        ` : `
          <div class="section-label" style="margin-top:4px;">Logo Size</div>
          <div class="range-row">
            <input type="range" class="wm-imgsize" data-id="${wm.id}" min="5" max="80" value="${wm.imgSizePct}" />
            <span class="range-val wm-imgsize-val" data-id="${wm.id}">${wm.imgSizePct}%</span>
          </div>
        `}
        <div class="section-label">Opacity</div>
        <div class="range-row">
          <input type="range" class="wm-opacity" data-id="${wm.id}" min="5" max="100" value="${wm.opacity}" />
          <span class="range-val wm-opacity-val" data-id="${wm.id}">${wm.opacity}%</span>
        </div>
      </div>`
    wmList.appendChild(card)
  })

  wmList.querySelectorAll('.wm-card-header').forEach(h => {
    h.addEventListener('click', e => {
      if (e.target.classList.contains('wm-delete')) return
      const id = parseInt(h.closest('.wm-card').dataset.id)
      selectedWmId = selectedWmId === id ? null : id
      renderWmList(); renderPreview()
    })
  })
  wmList.querySelectorAll('.wm-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const id = parseInt(btn.dataset.id)
      watermarks = watermarks.filter(w => w.id !== id)
      if (selectedWmId === id) selectedWmId = null
      renderWmList(); renderPreview()
    })
  })
  wmList.querySelectorAll('.wm-text').forEach(inp => {
    inp.addEventListener('input', () => {
      const wm = watermarks.find(w => w.id === parseInt(inp.dataset.id))
      if (wm) { wm.text = inp.value; renderPreview() }
    })
  })
  wmList.querySelectorAll('.wm-color').forEach(inp => {
    inp.addEventListener('input', () => {
      const wm = watermarks.find(w => w.id === parseInt(inp.dataset.id))
      if (wm) { wm.color = inp.value; renderPreview() }
    })
  })
  wmList.querySelectorAll('.color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      const wm = watermarks.find(w => w.id === parseInt(s.dataset.id))
      if (wm) {
        wm.color = s.dataset.color
        const colorInput = wmList.querySelector(`.wm-color[data-id="${wm.id}"]`)
        if (colorInput) colorInput.value = wm.color
        renderPreview()
      }
    })
  })
  wmList.querySelectorAll('.wm-size').forEach(inp => {
    inp.addEventListener('input', () => {
      const wm = watermarks.find(w => w.id === parseInt(inp.dataset.id))
      if (wm) {
        wm.fontSize = parseInt(inp.value)
        const val = wmList.querySelector(`.wm-size-val[data-id="${wm.id}"]`)
        if (val) val.textContent = wm.fontSize + 'px'
        renderPreview()
      }
    })
  })
  wmList.querySelectorAll('.wm-imgsize').forEach(inp => {
    inp.addEventListener('input', () => {
      const wm = watermarks.find(w => w.id === parseInt(inp.dataset.id))
      if (wm) {
        wm.imgSizePct = parseInt(inp.value)
        const val = wmList.querySelector(`.wm-imgsize-val[data-id="${wm.id}"]`)
        if (val) val.textContent = wm.imgSizePct + '%'
        renderPreview()
      }
    })
  })
  wmList.querySelectorAll('.wm-opacity').forEach(inp => {
    inp.addEventListener('input', () => {
      const wm = watermarks.find(w => w.id === parseInt(inp.dataset.id))
      if (wm) {
        wm.opacity = parseInt(inp.value)
        const val = wmList.querySelector(`.wm-opacity-val[data-id="${wm.id}"]`)
        if (val) val.textContent = wm.opacity + '%'
        renderPreview()
      }
    })
  })
}

addTextBtn.addEventListener('click', () => {
  const wm = { id: newId(), type: 'text', text: '© Your Brand', color: '#ffffff', fontSize: 36, opacity: 60, posX: 0.5, posY: 0.5 }
  watermarks.push(wm); selectedWmId = wm.id; renderWmList(); renderPreview()
})

addImgInput.addEventListener('change', () => {
  const file = addImgInput.files[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    const wm = { id: newId(), type: 'image', imgEl: img, imgSizePct: 25, opacity: 70, posX: 0.5, posY: 0.5 }
    watermarks.push(wm); selectedWmId = wm.id; renderWmList(); renderPreview()
  }
  img.src = URL.createObjectURL(file)
  addImgInput.value = ''
})

function getCanvasPos(e) {
  const rect = previewCanvas.getBoundingClientRect()
  const scaleX = previewCanvas.width / rect.width, scaleY = previewCanvas.height / rect.height
  const cx = e.touches ? e.touches[0].clientX : e.clientX
  const cy = e.touches ? e.touches[0].clientY : e.clientY
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY }
}

previewCanvas.addEventListener('mousedown', e => {
  if (!selectedWmId) return
  const { x, y } = getCanvasPos(e)
  const wm = watermarks.find(w => w.id === selectedWmId)
  if (!wm) return
  isDragging = true
  dragOffsetX = x - wm.posX * previewCanvas.width
  dragOffsetY = y - wm.posY * previewCanvas.height
  previewCanvas.style.cursor = 'grabbing'
})

previewCanvas.addEventListener('mousemove', e => {
  if (!isDragging || !selectedWmId) return
  const { x, y } = getCanvasPos(e)
  const wm = watermarks.find(w => w.id === selectedWmId)
  if (!wm) return
  wm.posX = Math.max(0, Math.min(1, (x - dragOffsetX) / previewCanvas.width))
  wm.posY = Math.max(0, Math.min(1, (y - dragOffsetY) / previewCanvas.height))
  renderPreview()
})

document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; previewCanvas.style.cursor = 'move' } })

previewCanvas.addEventListener('touchstart', e => {
  if (!selectedWmId) return
  e.preventDefault()
  const { x, y } = getCanvasPos(e)
  const wm = watermarks.find(w => w.id === selectedWmId)
  if (!wm) return
  isDragging = true
  dragOffsetX = x - wm.posX * previewCanvas.width
  dragOffsetY = y - wm.posY * previewCanvas.height
}, { passive: false })

previewCanvas.addEventListener('touchmove', e => {
  if (!isDragging || !selectedWmId) return
  e.preventDefault()
  const { x, y } = getCanvasPos(e)
  const wm = watermarks.find(w => w.id === selectedWmId)
  if (!wm) return
  wm.posX = Math.max(0, Math.min(1, (x - dragOffsetX) / previewCanvas.width))
  wm.posY = Math.max(0, Math.min(1, (y - dragOffsetY) / previewCanvas.height))
  renderPreview()
}, { passive: false })

previewCanvas.addEventListener('touchend', () => { isDragging = false })

// Mode toggle handler
const modeToggle = document.getElementById('modeToggle')
modeToggle.addEventListener('click', e => {
  const btn = e.target.closest('.mode-btn')
  if (!btn) return
  const newMode = btn.dataset.mode
  if (newMode === wmMode) return

  if (wmMode === 'all' && newMode === 'individual') {
    // Copy global watermarks to each file that doesn't have its own yet
    baseFiles.forEach(entry => {
      if (!entry.watermarks || !entry.watermarks.length) {
        entry.watermarks = JSON.parse(JSON.stringify(watermarks))
        // Re-link image elements (can't be JSON-cloned)
        entry.watermarks.forEach((wm, i) => {
          if (wm.type === 'image' && watermarks[i] && watermarks[i].imgEl) wm.imgEl = watermarks[i].imgEl
        })
      }
    })
    loadWMState(activeFileIdx)
  } else {
    // Switch to global — use current watermarks as global
    watermarks = getWMFor(baseFiles[activeFileIdx])
  }

  wmMode = newMode
  modeToggle.querySelectorAll('.mode-btn').forEach(b => {
    const isActive = b.dataset.mode === wmMode
    b.style.background = isActive ? 'var(--accent)' : 'var(--bg-card)'
    b.style.color = isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)'
    b.classList.toggle('active', isActive)
  })
  selectedWmId = null
  renderWmList(); renderPreview(); renderFileChips()
})

function renderFileChips() {
  fileChips.innerHTML = ''
  if (baseFiles.length <= 1) return
  baseFiles.forEach((entry, idx) => {
    const chip = document.createElement('div')
    chip.className = 'file-chip'
    chip.style.border = idx === activeFileIdx ? '1.5px solid var(--accent)' : '1.5px solid transparent'
    const wmCount = wmMode === 'individual' ? (entry.watermarks || []).length : ''
    const badge = wmMode === 'individual' && wmCount ? ` (${wmCount})` : ''
    chip.innerHTML = `<span style="cursor:pointer;">${entry.file.name.replace(/\.[^.]+$/, '').slice(0, 12)}${badge}</span><button data-idx="${idx}">✕</button>`
    chip.querySelector('span').addEventListener('click', () => {
      saveWMState()
      activeFileIdx = idx
      loadWMState(idx)
      selectedWmId = null
      renderFileChips(); renderWmList(); renderPreview()
    })
    chip.querySelector('button').addEventListener('click', () => {
      baseFiles.splice(idx, 1)
      if (activeFileIdx >= baseFiles.length) activeFileIdx = baseFiles.length - 1
      if (wmMode === 'individual') loadWMState(activeFileIdx)
      renderFileChips(); renderWmList(); renderPreview()
      if (baseFiles.length === 0) toolLayout.style.display = 'none'
      if (baseFiles.length <= 1) modeToggle.style.display = 'none'
    })
    fileChips.appendChild(chip)
  })
}

function loadFiles(newFiles) {
  const toAdd = Array.from(newFiles).filter(f => f.type.startsWith('image/')).slice(0, 25 - baseFiles.length)
  let loaded = 0
  toAdd.forEach(file => {
    const img = new Image()
    const _lurl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(_lurl)
      baseFiles.push({ file, img, watermarks: [] }); loaded++
      if (loaded === toAdd.length) {
        toolLayout.style.display = 'grid'
        document.getElementById('mainContainer').style.maxWidth = '1000px'
        const dz = document.getElementById('wmDropZone')
        if (dz) dz.style.display = 'none'
        applyBtn.disabled = false
        if (baseFiles.length > 1) modeToggle.style.display = 'block'
        renderFileChips(); renderPreview()
      }
    }
    img.src = _lurl
  })
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) loadFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files) })

applyBtn.addEventListener('click', async () => {
  saveWMState()
  if (baseFiles.length === 0) return
  // Check at least one file has watermarks
  const hasAny = wmMode === 'all' ? watermarks.length > 0 : baseFiles.some(e => (e.watermarks || []).length > 0)
  if (!hasAny) return
  applyBtn.disabled = true
  applyBtn.textContent = 'Processing...'
  document.getElementById('zipWrap').style.display = 'none'
  nextSteps.style.display = 'none'
  lastResults = []

  if (baseFiles.length === 1) {
    const entry = baseFiles[0]
    const wms = getWMFor(entry)
    const canvas = document.createElement('canvas')
    canvas.width = entry.img.naturalWidth; canvas.height = entry.img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(entry.img, 0, 0)
    wms.forEach(wm => drawWatermarkFull(ctx, canvas.width, canvas.height, wm))
    const mime = entry.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const blob = await canvasToBlob(canvas, mime, 0.92)
    lastResults = [{ blob, name: `watermarked.${ext}`, type: mime }]
    const url = URL.createObjectURL(blob)
    const filename = `watermarked.${ext}`
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click();if(window.showReviewPrompt)window.showReviewPrompt(); setTimeout(() => URL.revokeObjectURL(url), 10000)
    window.rcShowSaveButton?.(applyBtn.parentElement, blob, filename, 'watermark')
    applyBtn.disabled = false; applyBtn.textContent = dlBtn
    buildNextSteps()
    return
  }

  const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
  const JSZip = mod.default || window.JSZip
  const zip = new JSZip()
  const usedNames = new Set()

  for (const entry of baseFiles) {
    const wms = getWMFor(entry)
    if (!wms.length) continue
    const canvas = document.createElement('canvas')
    canvas.width = entry.img.naturalWidth; canvas.height = entry.img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(entry.img, 0, 0)
    wms.forEach(wm => drawWatermarkFull(ctx, canvas.width, canvas.height, wm))
    const mime = entry.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const base = entry.file.name.replace(/\.[^.]+$/, '')
    const rawName = `watermarked-${base}.${ext}`
    const safeName = makeUnique(usedNames, rawName)
    const blob = await canvasToBlob(canvas, mime, 0.92)
    lastResults.push({ blob, name: safeName, type: mime })
    zip.file(safeName, await blob.arrayBuffer())
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
  const url = URL.createObjectURL(zipBlob)
  const zipBtn = document.getElementById('zipBtn')
  zipBtn.href = url; zipBtn.download = 'watermarked-images.zip'
  zipBtn.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
  document.getElementById('zipNote').textContent = `${baseFiles.length} images — ${Math.round(zipBlob.size / 1024)} KB`
  document.getElementById('zipWrap').style.display = 'block'
  applyBtn.disabled = false; applyBtn.textContent = dlBtn
  buildNextSteps()
})

;(function injectSEO() {
  const seo = t.seo && t.seo['watermark']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()

loadPendingFiles()