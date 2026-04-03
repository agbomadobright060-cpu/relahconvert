import { injectHeader } from '../core/header.js'

import { getT , getLang, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('blur-face')

const t = getT()

const ui = {
  title:      t.blur_face_title      || 'Blur',
  titleEm:    t.blur_face_title_em   || 'Face',
  sub:        t.blur_face_sub        || 'Blur faces in photos. Auto-detect or draw manually. Batch up to 25 images. Private — runs in your browser.',
  uploadBtn:  t.blur_face_upload     || 'Upload Image',
  download:   t.blur_face_download   || 'Download Image',
  blurAmount: t.blur_face_amount     || 'Blur Amount',
  detecting:  t.blur_face_detecting  || 'Detecting faces…',
  noFaces:    t.blur_face_none       || 'No faces detected. Try a clearer photo or use Add Blur.',
  facesFound: t.blur_face_found      || 'face(s) detected',
  addBlur:    t.blur_face_manual     || 'Add Blur',
  autoDetect: t.blur_face_auto       || 'Auto Detect',
  mode:       t.blur_face_mode       || 'Mode',
  selectMode: t.blur_face_select_mode|| 'Select a mode to begin.',
  draw:       t.blur_face_draw       || 'Click and drag on the image to blur a region.',
  editor:     t.blur_face_editor     || 'Blur Editor',
  regions:    t.blur_face_regions    || 'Blurred Regions',
  downloadZip:t.blur_face_download_zip|| 'Download All as ZIP',
  reset:      t.blur_face_reset      || 'Upload New Image',
  imagesLabel:t.blur_face_images_label|| 'Images',
  drop:       t.blur_face_drop       || 'Drop images here or click to upload',
  dropSub:    t.blur_face_drop_sub   || 'JPG, PNG, WebP · Up to 25 images · Max 200MB total',
  processing: t.blur_face_processing || 'Processing',
  creatingZip:t.blur_face_creating_zip|| 'Creating ZIP…',
  batchFailed:t.blur_face_batch_failed|| 'Batch download failed',
}

const MAX_FILES = 25
const MAX_BYTES = 200 * 1024 * 1024

if (document.head) {
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'
  const style = document.createElement('style')
  style.textContent = `
    *{box-sizing:border-box}
    .tool-wrap{max-width:1060px;margin:0 auto;padding:24px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:20px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:400;color:var(--text-primary);margin:0 0 4px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:var(--accent)}
    .tool-sub{font-size:13px;color:var(--text-tertiary);margin:0}
    .bf-upload-area{display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed var(--border-light);border-radius:14px;padding:48px 24px;cursor:pointer;transition:all 0.2s;background:var(--bg-card);margin-bottom:16px}
    .bf-upload-area:hover,.bf-upload-area.drag{border-color:var(--accent);background:#FDF5F3}
    .bf-upload-icon{font-size:36px;margin-bottom:10px}
    .bf-upload-text{font-size:15px;font-weight:700;color:var(--text-primary);margin:0 0 4px}
    .bf-upload-sub{font-size:12px;color:var(--text-muted);margin:0}
    .bf-upload-btn{margin-top:14px;padding:10px 24px;background:var(--accent);color:var(--text-on-accent);border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer}
    .bf-upload-btn:hover{background:var(--accent-hover)}
    .bf-queue{display:none;margin-bottom:16px}
    .bf-queue-title{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px}
    .bf-queue-grid{display:flex;flex-wrap:wrap;gap:8px}
    .bf-queue-item{position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:2px solid var(--border-light);cursor:pointer;flex-shrink:0;transition:border-color 0.15s}
    .bf-queue-item.active{border-color:var(--accent)}
    .bf-queue-item img{width:100%;height:100%;object-fit:cover;display:block}
    .bf-queue-item .qi-del{position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.55);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
    .bf-queue-item .qi-del:hover{background:var(--accent)}
    .bf-queue-add{width:72px;height:72px;border-radius:8px;border:2px dashed var(--border-light);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:22px;color:var(--text-muted);flex-shrink:0;transition:all 0.15s;background:var(--bg-card)}
    .bf-queue-add:hover{border-color:var(--accent);color:var(--accent)}
    .bf-layout{display:none;gap:20px;align-items:start}
    .bf-layout.visible{display:grid;grid-template-columns:1fr 270px}
    @media(max-width:700px){.bf-layout.visible{grid-template-columns:1fr}}
    .bf-canvas-wrap{position:relative;background:var(--bg-card);border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
    .bf-canvas-wrap canvas{display:block;width:100%;height:auto;cursor:crosshair;touch-action:none}
    .bf-panel{background:var(--bg-card);border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:14px}
    .bf-panel-title{font-size:14px;font-weight:700;color:var(--text-primary);margin:0;font-family:'Fraunces',serif}
    .bf-mode-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .bf-mode-btn{padding:9px 6px;border:1.5px solid var(--border-light);border-radius:8px;font-size:12px;font-weight:700;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center}
    .bf-mode-btn.active{border-color:var(--accent);background:#FDF5F3;color:var(--accent)}
    .bf-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px}
    .bf-slider{width:100%;accent-color:var(--accent);cursor:pointer}
    .bf-status{font-size:12px;color:var(--text-tertiary);background:var(--bg-surface);border-radius:8px;padding:10px 12px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}
    .bf-status.error{background:var(--accent-bg);color:var(--accent)}
    .bf-status.success{background:#E8F5E9;color:#2E7D32}
    .bf-regions{display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto}
    .bf-region-item{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg-surface);border-radius:8px;font-size:12px;color:var(--text-primary);font-weight:600}
    .bf-region-del{background:none;border:none;color:var(--accent);cursor:pointer;font-size:14px;padding:0 4px;line-height:1}
    .bf-action-row{display:flex;flex-direction:column;gap:8px}
    .bf-download-btn{padding:12px;background:var(--accent);color:var(--text-on-accent);border:none;border-radius:9px;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;width:100%}
    .bf-download-btn:hover{background:var(--accent-hover);transform:translateY(-1px)}
    .bf-download-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;transform:none}
    .bf-reset-btn{padding:10px;background:var(--bg-card);color:var(--text-tertiary);border:1.5px solid var(--border-light);border-radius:9px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;width:100%}
    .bf-reset-btn:hover{border-color:var(--accent);color:var(--accent)}
    #nextSteps{margin-top:4px}
    .seo-section{margin-top:48px;padding-top:32px;border-top:1.5px solid var(--border)}
    .seo-section .seo-h2-large{font-family:'Fraunces',serif;font-size:clamp(15px,2vw,19px);font-weight:900;color:var(--text-primary);margin:0 0 14px}
    .seo-section h3{font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:var(--text-primary);margin:22px 0 8px}
    .seo-section ol{padding-left:20px;color:var(--text-secondary);font-size:14px;line-height:1.8}
    .seo-section p{color:var(--text-secondary);font-size:14px;line-height:1.7;margin:10px 0}
    .faq-item{background:var(--bg-card);border-radius:12px;padding:18px 20px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
    .faq-q{font-family:'Fraunces',serif;font-weight:700;color:var(--text-primary);font-size:15px;margin:0 0 6px}
    .faq-a{color:var(--text-secondary);font-size:13px;line-height:1.6;margin:0}
    .also-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .also-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:12px;font-weight:600;color:var(--text-primary);text-decoration:none;transition:all 0.15s}
    .also-link:hover{border-color:var(--accent);color:var(--accent)}
    @media(max-width:700px){
      .bf-mode-btn{padding:14px 8px;font-size:13px}
      .bf-download-btn{padding:16px;font-size:15px}
      .bf-reset-btn{padding:14px;font-size:14px}
      .bf-slider{height:6px}
      .bf-queue-item{width:64px;height:64px}
      .bf-queue-add{width:64px;height:64px}
      .bf-panel{padding:16px}
      .bf-upload-area{padding:32px 16px}
    }
  `
  document.head.appendChild(style)
}

injectHeader()

document.querySelector('#app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">${ui.title} <em class="brand-em">${ui.titleEm}</em></h1>
    <p class="tool-sub">${ui.sub}</p>
  </div>
  <div style="margin-bottom:16px;">
    <label class="bf-upload-btn" for="fileInput" style="display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;border:none;">
      <span style="font-size:18px;">+</span> ${ui.uploadBtn}
    </label>
    <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">${t.drop_hint || 'or drop images anywhere'}</span>
  </div>
  <label for="fileInput" class="bf-upload-area" id="uploadArea">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    <p class="bf-upload-text" style="margin-top:10px;">${t.drop_images || 'Drop images'}</p>
  </label>
  <input type="file" id="fileInput" accept="image/*" multiple style="display:none">
  <div class="bf-queue" id="bfQueue">
    <p class="bf-queue-title">Images (<span id="queueCount">0</span>)</p>
    <div class="bf-queue-grid" id="queueGrid"></div>
  </div>
  <div class="bf-layout" id="bfLayout">
    <div class="bf-canvas-wrap">
      <canvas id="bfCanvas"></canvas>
    </div>
    <div class="bf-panel">
      <p class="bf-panel-title">${ui.editor}</p>
      <div>
        <p class="bf-label">${ui.mode}</p>
        <div class="bf-mode-row">
          <button class="bf-mode-btn" id="autoBtn">${ui.autoDetect}</button>
          <button class="bf-mode-btn" id="manualBtn">${ui.addBlur}</button>
        </div>
      </div>
      <div>
        <p class="bf-label">${ui.blurAmount}: <span id="blurVal">18</span>px</p>
        <input type="range" class="bf-slider" id="blurSlider" min="4" max="40" value="18">
      </div>
      <div class="bf-status" id="bfStatus">${ui.selectMode}</div>
      <div id="regionsList" style="display:none">
        <p class="bf-label">${ui.regions}</p>
        <div class="bf-regions" id="regionsContainer"></div>
      </div>
      <div class="bf-action-row">
        <button class="bf-download-btn" id="downloadBtn">⬇ ${ui.download}</button>
        <button class="bf-download-btn" id="batchDownloadBtn" style="display:none;background:var(--btn-dark)">⬇ ${ui.downloadZip}</button>
        <button class="bf-reset-btn" id="resetBtn">↺ ${ui.reset}</button>
        <div id="nextSteps" style="display:none">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">${t.whats_next||"What's Next?"}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px" id="nextStepsButtons"></div>
        </div>
      </div>
    </div>
  </div>
</div>
`

let images = [], activeIdx = 0, canvas = null, ctx = null
let mode = null, drawing = null, blurAmount = 18, nextRegionId = 1, faceApiLoaded = false
let selectedRegion = null

const $ = id => document.getElementById(id)

$('uploadBtn').onclick = () => { $('fileInput').value = ''; $('fileInput').click() }
$('fileInput').onchange = e => { addFiles(Array.from(e.target.files||[])); $('fileInput').value='' }

const uploadArea = $('uploadArea')
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag') })
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag'))
uploadArea.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); uploadArea.classList.remove('drag'); addFiles(Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/'))) })
// also allow drag/drop anywhere on page after upload
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/')); if(files.length) addFiles(files) })

function addFiles(files) {
  let totalBytes = images.reduce((s,im)=>s+im.file.size,0)
  const startLen = images.length
  for (const f of files) {

    if (images.length >= MAX_FILES) { setStatus(`${ui.imagesLabel}: Max ${MAX_FILES}`,'error'); break }
    if (totalBytes + f.size > MAX_BYTES) { setStatus('Total size exceeds 200MB limit.','error'); break }
    totalBytes += f.size
    images.push({ file:f, img:null, blurRegions:[], processed:false })
  }
  loadImageAtIndex(startLen > 0 ? startLen : 0)
}

const MAX_PREVIEW_PX = 1600 // cap preview resolution for performance

function loadImageAtIndex(startIdx) {
  const idx = Math.max(0, startIdx)
  if (idx >= images.length) return
  const entry = images[idx]
  if (entry.img) { activateImage(idx); return }
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => {
      // downscale large images for preview/editing — keep original file for download
      const maxPx = MAX_PREVIEW_PX
      if (img.naturalWidth > maxPx || img.naturalHeight > maxPx) {
        const scale = Math.min(maxPx / img.naturalWidth, maxPx / img.naturalHeight)
        const oc = document.createElement('canvas')
        oc.width = Math.round(img.naturalWidth * scale)
        oc.height = Math.round(img.naturalHeight * scale)
        oc.getContext('2d').drawImage(img, 0, 0, oc.width, oc.height)
        const scaled = new Image()
        scaled.onload = () => {
          entry.img = scaled
          entry.previewScale = scale
          // revoke original data URL to free memory
          URL.revokeObjectURL && img.src.startsWith('blob:') && URL.revokeObjectURL(img.src)
          if (idx === startIdx) activateImage(idx)
          if (idx+1 < images.length && !images[idx+1].img) loadImageAtIndex(idx+1)
        }
        oc.toBlob(blob => {
          scaled.src = URL.createObjectURL(blob)
        }, 'image/jpeg', 0.85)
      } else {
        entry.img = img
        entry.previewScale = 1
        if (idx === startIdx) activateImage(idx)
        if (idx+1 < images.length && !images[idx+1].img) loadImageAtIndex(idx+1)
      }
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(entry.file)
}

function activateImage(idx) {
  activeIdx = idx
  selectedRegion = null
  $('uploadArea').style.display = 'none'
  $('bfLayout').classList.add('visible')
  renderQueue()
  initCanvas()
  resetMode()
  updateRegionsList()
}

function renderQueue() {
  $('queueCount').textContent = images.length
  $('bfQueue').style.display = 'block'
  $('batchDownloadBtn').style.display = images.length > 1 ? 'block' : 'none'
  const grid = $('queueGrid')
  grid.innerHTML = images.map((im,i) => {
    const url = URL.createObjectURL(im.file)
    return `<div class="bf-queue-item${i===activeIdx?' active':''}" data-idx="${i}">
      <img src="${url}" onload="URL.revokeObjectURL(this.src)">
      <button class="qi-del" data-del="${i}">✕</button>
    </div>`
  }).join('') + (images.length < MAX_FILES ? `<div class="bf-queue-add" id="queueAdd"><span>+</span></div>` : '')

  grid.querySelectorAll('.bf-queue-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('qi-del')) return
      const i = parseInt(el.dataset.idx)
      images[i].img ? activateImage(i) : loadImageAtIndex(i)
    })
  })
  grid.querySelectorAll('.qi-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      images.splice(parseInt(btn.dataset.del), 1)
      if (!images.length) { resetAll(); return }
      activateImage(Math.min(activeIdx, images.length-1))
    })
  })
  const addBtn = $('queueAdd')
  if (addBtn) addBtn.onclick = () => { $('fileInput').value=''; $('fileInput').click() }
}

function initCanvas() {
  canvas = $('bfCanvas')
  ctx = canvas.getContext('2d')
  const entry = images[activeIdx]
  canvas.width = entry.img.naturalWidth
  canvas.height = entry.img.naturalHeight
  setupCanvasEvents()
  render()
}

function render() {
  if (!ctx) return
  const entry = images[activeIdx]
  ctx.clearRect(0,0,canvas.width,canvas.height)
  ctx.drawImage(entry.img,0,0)
  entry.blurRegions.forEach(r => applyBlurRegion(r.x,r.y,r.w,r.h,r.amount||blurAmount))
  entry.blurRegions.forEach(r => {
    r._xBtn = null
    if (r !== selectedRegion) return // only draw outline for selected region
    ctx.save()
    ctx.strokeStyle='rgba(200,75,49,0.9)';ctx.lineWidth=Math.max(2,canvas.width/300);ctx.setLineDash([5,3])
    ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.setLineDash([])
    const xr=Math.max(10,canvas.width/80),xcx=r.x+r.w+xr+2,xcy=r.y-xr-2
    ctx.fillStyle='#ff3333';ctx.beginPath();ctx.arc(xcx,xcy,xr,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle='#fff';ctx.lineWidth=2
    ctx.beginPath();ctx.moveTo(xcx-5,xcy-5);ctx.lineTo(xcx+5,xcy+5);ctx.stroke()
    ctx.beginPath();ctx.moveTo(xcx+5,xcy-5);ctx.lineTo(xcx-5,xcy+5);ctx.stroke()
    r._xBtn={cx:xcx,cy:xcy,r:xr};ctx.restore()
  })
  if (drawing) {
    ctx.save();ctx.strokeStyle='#C84B31';ctx.lineWidth=Math.max(2, canvas.width/200);ctx.setLineDash([5,3])
    const x=Math.min(drawing.startX,drawing.curX),y=Math.min(drawing.startY,drawing.curY)
    ctx.strokeRect(x,y,Math.abs(drawing.curX-drawing.startX),Math.abs(drawing.curY-drawing.startY))
    ctx.setLineDash([]);ctx.restore()
  }
}

function applyBlurRegion(x,y,w,h,amount) {
  if(w<4||h<4)return
  const ix=Math.max(0,Math.round(x)),iy=Math.max(0,Math.round(y))
  const iw=Math.min(canvas.width-ix,Math.round(w)),ih=Math.min(canvas.height-iy,Math.round(h))
  if(iw<2||ih<2)return
  const bs=Math.max(4,Math.round(amount*0.8))
  const id=ctx.getImageData(ix,iy,iw,ih),d=id.data
  for(let by=0;by<ih;by+=bs)for(let bx=0;bx<iw;bx+=bs){
    const bw=Math.min(bs,iw-bx),bh=Math.min(bs,ih-by)
    let r=0,g=0,b=0,c=0
    for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;r+=d[i];g+=d[i+1];b+=d[i+2];c++}
    r=Math.round(r/c);g=Math.round(g/c);b=Math.round(b/c)
    for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;d[i]=r;d[i+1]=g;d[i+2]=b}
  }
  ctx.putImageData(id,ix,iy)
}

function setupCanvasEvents() {
  const old=canvas, nc=old.cloneNode(false)
  old.parentNode.replaceChild(nc,old)
  canvas=nc; ctx=canvas.getContext('2d'); render()

  canvas.addEventListener('mousedown',e=>{
    const {cx,cy}=coords(e)
    // check X delete on selected region
    if(selectedRegion&&selectedRegion._xBtn){
      const {cx:xcx,cy:xcy,r:xr}=selectedRegion._xBtn
      if(Math.hypot(cx-xcx,cy-xcy)<=xr+4){
        images[activeIdx].blurRegions=images[activeIdx].blurRegions.filter(x=>x!==selectedRegion)
        selectedRegion=null;updateRegionsList();render();e.preventDefault();return
      }
    }
    // check if clicking inside an existing blur region to select it
    const entry=images[activeIdx]
    for(let i=entry.blurRegions.length-1;i>=0;i--){
      const r=entry.blurRegions[i]
      if(cx>=r.x&&cx<=r.x+r.w&&cy>=r.y&&cy<=r.y+r.h){
        selectedRegion=r
        // sync slider to this region's blur amount
        blurAmount=r.amount||blurAmount
        $('blurSlider').value=blurAmount
        $('blurVal').textContent=blurAmount
        render();e.preventDefault();return
      }
    }
    // clicked empty area — deselect
    selectedRegion=null
    if(mode!=='manual'){render();return}
    drawing={startX:cx,startY:cy,curX:cx,curY:cy};e.preventDefault()
  })
  canvas.addEventListener('mousemove',e=>{
    if(!drawing)return;const{cx,cy}=coords(e);drawing.curX=cx;drawing.curY=cy;render()
  })
  canvas.addEventListener('mouseup',e=>{
    if(!drawing)return;const{cx,cy}=coords(e)
    const x=Math.min(drawing.startX,cx),y=Math.min(drawing.startY,cy)
    const w=Math.abs(cx-drawing.startX),h=Math.abs(cy-drawing.startY)
    drawing=null
    if(w>10&&h>10){
      const newRegion={id:nextRegionId++,x,y,w,h,label:`Region ${nextRegionId-1}`,amount:blurAmount}
      // deselect all existing regions
      selectedRegion=newRegion
      images[activeIdx].blurRegions.push(newRegion)
      updateRegionsList()
    }
    render()
  })
  canvas.addEventListener('touchstart',e=>{const t=e.touches[0];canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:t.clientX,clientY:t.clientY}))},{passive:false})
  canvas.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0];canvas.dispatchEvent(new MouseEvent('mousemove',{clientX:t.clientX,clientY:t.clientY}))},{passive:false})
  canvas.addEventListener('touchend',e=>{const t=e.changedTouches[0];canvas.dispatchEvent(new MouseEvent('mouseup',{clientX:t.clientX,clientY:t.clientY}))})
}

function coords(e){const r=canvas.getBoundingClientRect();return{cx:(e.clientX-r.left)*canvas.width/r.width,cy:(e.clientY-r.top)*canvas.height/r.height}}

function resetMode(){
  mode=null
  selectedRegion=null
  $('autoBtn').classList.remove('active')
  $('manualBtn').classList.remove('active')
  setStatus(ui.selectMode,'')
}

$('autoBtn').onclick=()=>{
  mode='auto'
  $('autoBtn').classList.add('active')
  $('manualBtn').classList.remove('active')
  runAutoDetect()
}
$('manualBtn').onclick=()=>{
  mode='manual'
  $('manualBtn').classList.add('active')
  $('autoBtn').classList.remove('active')
  setStatus(ui.draw,'')
}

async function runAutoDetect(){
  setStatus(ui.detecting,'')
  try{
    if(!faceApiLoaded){
      await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js')
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model')
      faceApiLoaded=true
    }
    const entry=images[activeIdx]
    const detections=await faceapi.detectAllFaces(entry.img,new faceapi.TinyFaceDetectorOptions({scoreThreshold:0.4}))
    if(!detections.length){setStatus(ui.noFaces,'error');return}
    detections.forEach((d,i)=>{
      const box=d.box
      entry.blurRegions.push({id:nextRegionId++,x:box.x,y:box.y,w:box.width,h:box.height,label:`Face ${i+1}`,amount:blurAmount})
    })
    setStatus(`✓ ${detections.length} ${ui.facesFound}`,'success')
    updateRegionsList();render()
  }catch(err){setStatus('Auto-detect failed. Use Add Blur to blur manually.','error')}
}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return}
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)
  })
}

$('blurSlider').oninput=()=>{
  blurAmount=parseInt($('blurSlider').value)
  $('blurVal').textContent=blurAmount
  // if a region is selected, update only that region's blur
  if(selectedRegion) selectedRegion.amount=blurAmount
  render()
}

function updateRegionsList(){
  if(!images.length)return
  const entry=images[activeIdx],list=$('regionsList'),container=$('regionsContainer')
  if(!entry.blurRegions.length){list.style.display='none';return}
  list.style.display='block'
  container.innerHTML=entry.blurRegions.map(r=>`
    <div class="bf-region-item"><span>${r.label}</span><button class="bf-region-del" data-id="${r.id}">✕</button></div>`).join('')
  container.querySelectorAll('.bf-region-del').forEach(btn=>{
    btn.onclick=()=>{
      images[activeIdx].blurRegions=images[activeIdx].blurRegions.filter(r=>r.id!==parseInt(btn.dataset.id))
      updateRegionsList();render()
    }
  })
}

function setStatus(msg,type){const el=$('bfStatus');el.textContent=msg;el.className='bf-status'+(type?` ${type}`:'')}

function renderClean(entry){
  return new Promise(resolve => {
    const scale = entry.previewScale || 1
    // Load original full-res image from file for download
    const fullImg = new Image()
    const url = URL.createObjectURL(entry.file)
    fullImg.onload = () => {
      const tc=document.createElement('canvas')
      tc.width=fullImg.naturalWidth;tc.height=fullImg.naturalHeight
      const tctx=tc.getContext('2d');tctx.drawImage(fullImg,0,0)
      URL.revokeObjectURL(url)
      entry.blurRegions.forEach(r=>{
        // scale preview coordinates back to full-res coordinates
        const rx = r.x / scale, ry = r.y / scale, rw = r.w / scale, rh = r.h / scale
        const ix=Math.max(0,Math.round(rx)),iy=Math.max(0,Math.round(ry))
        const iw=Math.min(tc.width-ix,Math.round(rw)),ih=Math.min(tc.height-iy,Math.round(rh))
        if(iw<2||ih<2)return
        const bs=Math.max(4,Math.round((r.amount||blurAmount)*0.8/scale))
        const id=tctx.getImageData(ix,iy,iw,ih),d=id.data
        for(let by=0;by<ih;by+=bs)for(let bx=0;bx<iw;bx+=bs){
          const bw=Math.min(bs,iw-bx),bh=Math.min(bs,ih-by)
          let rr=0,g=0,b=0,c=0
          for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;rr+=d[i];g+=d[i+1];b+=d[i+2];c++}
          rr=Math.round(rr/c);g=Math.round(g/c);b=Math.round(b/c)
          for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;d[i]=rr;d[i+1]=g;d[i+2]=b}
        }
        tctx.putImageData(id,ix,iy)
      })
      resolve(tc)
    }
    fullImg.onerror = () => {
      URL.revokeObjectURL(url)
      // Fallback: use the preview image if original can't load
      const tc=document.createElement('canvas')
      tc.width=entry.img.naturalWidth;tc.height=entry.img.naturalHeight
      const tctx=tc.getContext('2d');tctx.drawImage(entry.img,0,0)
      entry.blurRegions.forEach(r=>{
        const ix=Math.max(0,Math.round(r.x)),iy=Math.max(0,Math.round(r.y))
        const iw=Math.min(tc.width-ix,Math.round(r.w)),ih=Math.min(tc.height-iy,Math.round(r.h))
        if(iw<2||ih<2)return
        const bs=Math.max(4,Math.round((r.amount||blurAmount)*0.8))
        const id=tctx.getImageData(ix,iy,iw,ih),d=id.data
        for(let by=0;by<ih;by+=bs)for(let bx=0;bx<iw;bx+=bs){
          const bw=Math.min(bs,iw-bx),bh=Math.min(bs,ih-by)
          let rr=0,g=0,b=0,c=0
          for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;rr+=d[i];g+=d[i+1];b+=d[i+2];c++}
          rr=Math.round(rr/c);g=Math.round(g/c);b=Math.round(b/c)
          for(let py=by;py<by+bh;py++)for(let px=bx;px<bx+bw;px++){const i=(py*iw+px)*4;d[i]=rr;d[i+1]=g;d[i+2]=b}
        }
        tctx.putImageData(id,ix,iy)
      })
      resolve(tc)
    }
    fullImg.src = url
  })
}

function canvasToBlob(tc){return new Promise(resolve=>tc.toBlob(blob=>resolve(blob),'image/jpeg',0.92))}

function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('relahconvert',1);req.onupgradeneeded=e=>e.target.result.createObjectStore('pending',{keyPath:'id'});req.onsuccess=e=>resolve(e.target.result);req.onerror=()=>reject()})}
async function saveToIDB(blob,name,type){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('pending','readwrite'),store=tx.objectStore('pending');store.clear();store.put({id:0,blob,name,type});tx.oncomplete=resolve;tx.onerror=reject})}

function buildNextSteps(blob){
  const buttons=[{label:t.nav_short?.compress||'Compress',href: localHref('compress')},{label:t.nav_short?.resize||'Resize',href: localHref('resize')},{label:t.nav_short?.crop||'Crop',href: localHref('crop')},{label:t.nav_short?.watermark||'Watermark',href: localHref('watermark')},{label:'Meme Generator',href: localHref('meme-generator')}]
  const container=$('nextStepsButtons');container.innerHTML=''
  buttons.forEach(b=>{
    const btn=document.createElement('button')
    btn.style.cssText='padding:7px 13px;border-radius:8px;border:1.5px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:DM Sans,sans-serif;transition:all 0.15s'
    btn.textContent=b.label
    btn.onmouseover=()=>{btn.style.borderColor='var(--accent)';btn.style.color='var(--accent)'}
    btn.onmouseout=()=>{btn.style.borderColor='var(--border-light)';btn.style.color='var(--text-primary)'}
    btn.onclick=async()=>{try{await saveToIDB(blob,'blurred.jpg','image/jpeg');sessionStorage.setItem('pendingFromIDB','1')}catch(e){}window.location.href=b.href}
    container.appendChild(btn)
  })
  $('nextSteps').style.display='block'
}

$('downloadBtn').onclick=async()=>{
  if(!images.length)return
  const tc=await renderClean(images[activeIdx])
  const blob=await canvasToBlob(tc)
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='blurred-face.jpg';a.click();if(window.showReviewPrompt)window.showReviewPrompt()
  setTimeout(()=>URL.revokeObjectURL(url),10000)
  buildNextSteps(blob)
}

$('batchDownloadBtn').onclick=async()=>{
  const btn=$('batchDownloadBtn')
  btn.disabled=true;btn.textContent=ui.processing+'…'
  try{
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    const zip=new JSZip()
    for(let i=0;i<images.length;i++){
      const entry=images[i];if(!entry.img)continue
      btn.textContent=`${ui.processing} ${i+1}/${images.length}…`
      const tc=await renderClean(entry)
      const blob=await canvasToBlob(tc)
      zip.file(`${String(i+1).padStart(2,'0')}-${entry.file.name.replace(/\.[^.]+$/,'')}-blurred.jpg`,blob)
      // free canvas memory
      tc.width=1; tc.height=1
    }
    btn.textContent=ui.creatingZip
    const zipBlob=await zip.generateAsync({type:'blob'})
    const url=URL.createObjectURL(zipBlob)
    const a=document.createElement('a');a.href=url;a.download='blurred-faces.zip';a.click();if(window.showReviewPrompt)window.showReviewPrompt()
    setTimeout(()=>URL.revokeObjectURL(url),10000)
  }catch(e){alert(ui.batchFailed+': '+e.message)}
  btn.disabled=false;btn.textContent='⬇ ${ui.downloadZip}'
}

$('resetBtn').onclick=resetAll
function resetAll(){
  images=[];activeIdx=0;mode=null;drawing=null;nextRegionId=1;canvas=null;ctx=null
  $('uploadArea').style.display=''
  $('bfLayout').classList.remove('visible')
  $('bfQueue').style.display='none'
  $('nextSteps').style.display='none'
  $('regionsList').style.display='none'
  $('batchDownloadBtn').style.display='none'
  $('autoBtn').classList.remove('active')
  $('manualBtn').classList.remove('active')
  setStatus('${ui.selectMode}','')
}

async function loadFromIDB(){
  if(!sessionStorage.getItem('pendingFromIDB'))return
  sessionStorage.removeItem('pendingFromIDB')
  try{
    const db=await openDB()
    const tx=db.transaction('pending','readonly'),store=tx.objectStore('pending'),req=store.get(0)
    req.onsuccess=()=>{const rec=req.result;if(!rec?.blob)return;addFiles([new File([rec.blob],rec.name||'image.jpg',{type:rec.type||'image/jpeg'})])}
  }catch(e){}
}
loadFromIDB()

const seoBlur={
  en:{h2a:'How to Blur Faces in Photos — Free & No Upload Required',steps:['Upload your photo — click Upload Image or drag and drop any JPG, PNG, or WebP file.','Click Auto Detect to automatically find and blur all faces, or click Add Blur to draw blur regions manually.','Adjust blur amount — use the slider to make the blur stronger or lighter.','Download — click Download Image to save your blurred photo instantly.'],h2b:'The Best Free Face Blur Tool That Never Uploads Your Photos',body:"RelahConvert's face blur tool runs entirely in your browser. Your photos never leave your device. No account needed, no watermarks, no limits. Batch process up to 25 images at once.",h3why:'Why Blur Faces in Photos?',why:"Blurring faces protects privacy when sharing photos publicly. Essential for social media, journalism, and street photography.",faqs:[{q:'Does my photo get uploaded to a server?',a:'No. Everything runs in your browser. Your files never leave your device.'},{q:'How does auto face detection work?',a:'We use a lightweight AI model (TinyFaceDetector) that runs entirely in your browser.'},{q:'Can I blur multiple faces?',a:'Yes — auto mode detects all faces. In Add Blur mode draw as many regions as you want.'},{q:'Can I process multiple images at once?',a:'Yes — upload up to 25 images (200MB total) and download them all as a ZIP.'},{q:'What image formats are supported?',a:'JPG, PNG, and WebP.'},{q:'Is there a watermark?',a:'No watermark, ever.'}],links:[{href: '/compress',label:'Compress Image'},{href: '/resize',label:'Resize Image'},{href: '/crop',label:'Crop Image'},{href: '/watermark',label:'Add Watermark'},{href: '/meme-generator',label:'Meme Generator'}]},
  fr:{h2a:"Comment flouter des visages dans des photos — Gratuit et sans téléversement",steps:["Téléversez votre photo.","Cliquez sur Détection auto ou sur Ajouter un flou pour dessiner manuellement.","Ajustez le flou avec le curseur.","Téléchargez votre photo."],h2b:"Le meilleur outil gratuit pour flouter les visages sans téléverser vos photos",body:"L'outil de floutage de RelahConvert fonctionne entièrement dans votre navigateur. Traitez jusqu'à 25 images à la fois.",h3why:"Pourquoi flouter les visages ?",why:"Le floutage protège la vie privée sur les réseaux sociaux, en journalisme et en photographie de rue.",faqs:[{q:"Ma photo sera-t-elle téléversée ?",a:"Non. Tout s'exécute dans votre navigateur."},{q:"Comment fonctionne la détection auto ?",a:"Nous utilisons un modèle IA léger dans votre navigateur."},{q:"Puis-je flouter plusieurs visages ?",a:"Oui — le mode auto détecte tous les visages. En mode Ajouter un flou, dessinez autant de zones que vous le souhaitez."},{q:"Puis-je traiter plusieurs images ?",a:"Oui — jusqu'à 25 images en ZIP."},{q:"Quels formats ?",a:"JPG, PNG et WebP."},{q:"Filigrane ?",a:"Aucun filigrane."}],links:[{href:"/compress",label:"Compresser"},{href:"/resize",label:"Redimensionner"},{href:"/crop",label:"Recadrer"},{href:"/watermark",label:"Filigrane"},{href:"/meme-generator",label:"Générateur de mèmes"}]},
  es:{h2a:"Cómo difuminar caras en fotos — Gratis y sin subir archivos",steps:["Sube tu foto.","Haz clic en Detección automática o en Añadir desenfoque para dibujar zonas.","Ajusta el difuminado.","Descarga tu foto."],h2b:"La mejor herramienta gratuita para difuminar caras",body:"Funciona completamente en tu navegador. Procesa hasta 25 imágenes a la vez.",h3why:"¿Por qué difuminar caras?",why:"Protege la privacidad en redes sociales, periodismo y fotografía callejera.",faqs:[{q:"¿Se sube mi foto?",a:"No. Todo en tu navegador."},{q:"¿Cómo funciona la detección?",a:"Modelo IA ligero en tu navegador."},{q:"¿Puedo difuminar varias caras?",a:"Sí — el modo automático detecta todas las caras. Con Añadir desenfoque puedes dibujar tantas zonas como quieras."},{q:"¿Varias imágenes?",a:"Sí, hasta 25 en ZIP."},{q:"¿Formatos?",a:"JPG, PNG y WebP."},{q:"¿Marca de agua?",a:"Sin marca de agua."}],links:[{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca de agua"},{href:"/meme-generator",label:"Generador de memes"}]},
  pt:{h2a:"Como desfocar rostos em fotos — Grátis e sem upload",steps:["Envie sua foto.","Clique em Detectar automaticamente ou em Adicionar desfoque.","Ajuste o desfoque.","Baixe sua foto."],h2b:"A melhor ferramenta gratuita para desfocar rostos",body:"Funciona no seu navegador. Processe até 25 imagens de uma vez.",h3why:"Por que desfocar rostos?",why:"Protege a privacidade em redes sociais, jornalismo e fotografia de rua.",faqs:[{q:"Minha foto é enviada?",a:"Não. Tudo no navegador."},{q:"Como funciona a detecção?",a:"Modelo de IA leve no navegador."},{q:"Posso desfocar vários rostos?",a:"Sim — o modo automático detecta todos os rostos. No modo Adicionar desfoque, desenhe quantas áreas quiser."},{q:"Várias imagens?",a:"Sim, até 25 em ZIP."},{q:"Formatos?",a:"JPG, PNG e WebP."},{q:"Marca d'água?",a:"Sem marca d'água."}],links:[{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca d'água"},{href:"/meme-generator",label:"Gerador de memes"}]},
  de:{h2a:"Gesichter in Fotos unkenntlich machen — Kostenlos und ohne Upload",steps:["Lade dein Foto hoch.","Klicke auf Auto-Erkennung oder Unschärfe hinzufügen.","Stärke anpassen.","Herunterladen."],h2b:"Das beste kostenlose Tool zum Verpixeln ohne Upload",body:"Läuft vollständig in deinem Browser. Verarbeite bis zu 25 Bilder auf einmal.",h3why:"Warum Gesichter unkenntlich machen?",why:"Schützt die Privatsphäre in sozialen Medien, Journalismus und Straßenfotografie.",faqs:[{q:"Wird mein Foto hochgeladen?",a:"Nein. Alles läuft in deinem Browser."},{q:"Wie funktioniert die Erkennung?",a:"Leichtes KI-Modell im Browser."},{q:"Kann ich mehrere Gesichter unkenntlich machen?",a:"Ja — der Automatikmodus erkennt alle Gesichter. Im Modus Unschärfe hinzufügen kannst du beliebig viele Bereiche zeichnen."},{q:"Mehrere Bilder?",a:"Ja, bis zu 25 als ZIP."},{q:"Formate?",a:"JPG, PNG und WebP."},{q:"Wasserzeichen?",a:"Kein Wasserzeichen."}],links:[{href:"/compress",label:"Komprimieren"},{href:"/resize",label:"Größe ändern"},{href:"/crop",label:"Zuschneiden"},{href:"/watermark",label:"Wasserzeichen"},{href:"/meme-generator",label:"Meme-Generator"}]},
  ar:{h2a:"كيفية تمويه الوجوه في الصور — مجاناً وبدون رفع",steps:["ارفع صورتك.","انقر على الكشف التلقائي أو إضافة تمويه.","اضبط مقدار التمويه.","تحميل الصورة."],h2b:"أفضل أداة مجانية لتمويه الوجوه",body:"تعمل بالكامل في متصفحك. معالجة حتى 25 صورة في وقت واحد.",h3why:"لماذا تمويه الوجوه؟",why:"يحمي الخصوصية في وسائل التواصل الاجتماعي والصحافة وتصوير الشوارع.",faqs:[{q:"هل ترفع صوري؟",a:"لا. كل شيء في متصفحك."},{q:"كيف يعمل الكشف؟",a:"نموذج ذكاء اصطناعي خفيف."},{q:"هل يمكنني تمويه عدة وجوه؟",a:"نعم — الوضع التلقائي يكشف جميع الوجوه. في وضع إضافة تمويه، ارسم أي عدد من المناطق."},{q:"عدة صور؟",a:"نعم، حتى 25 صورة كـ ZIP."},{q:"الصيغ؟",a:"JPG وPNG وWebP."},{q:"علامة مائية؟",a:"لا علامة مائية."}],links:[{href:"/compress",label:"ضغط"},{href:"/resize",label:"تغيير الحجم"},{href:"/crop",label:"اقتصاص"},{href:"/watermark",label:"علامة مائية"},{href:"/meme-generator",label:"صانع الميمات"}]},
  it:{h2a:"Come sfocare i volti nelle foto — Gratis e senza caricamento",steps:["Carica la tua foto.","Clicca su Rilevamento automatico o Aggiungi sfocatura.","Regola l'intensità della sfocatura.","Scarica la tua foto."],h2b:"Il miglior strumento gratuito per sfocare i volti senza caricare",body:"Funziona interamente nel tuo browser. Elabora fino a 25 immagini alla volta.",h3why:"Perché sfocare i volti?",why:"Protegge la privacy sui social media, nel giornalismo e nella fotografia di strada.",faqs:[{q:"La mia foto viene caricata?",a:"No. Tutto nel tuo browser."},{q:"Come funziona il rilevamento?",a:"Modello IA leggero nel browser."},{q:"Posso sfocare più volti?",a:"Sì — la modalità automatica rileva tutti i volti. Con Aggiungi sfocatura puoi disegnare quante aree vuoi."},{q:"Più immagini?",a:"Sì, fino a 25 in ZIP."},{q:"Formati?",a:"JPG, PNG e WebP."},{q:"Watermark?",a:"Nessun watermark."}],links:[{href:"/compress",label:"Comprimi"},{href:"/resize",label:"Ridimensiona"},{href:"/crop",label:"Ritaglia"},{href:"/watermark",label:"Watermark"},{href:"/meme-generator",label:"Generatore di meme"}]},
  ja:{h2a:"写真の顔をぼかす方法 — 無料・アップロード不要",steps:["写真をアップロード。","自動検出をクリックまたはぼかしを追加。","ぼかしの強さを調整。","写真をダウンロード。"],h2b:"写真をアップロードしない最高の無料顔ぼかしツール",body:"ブラウザ内で完全に動作します。一度に最大25枚まで処理可能。",h3why:"なぜ顔をぼかすのか？",why:"SNS、ジャーナリズム、ストリート写真で公開する際のプライバシー保護に不可欠です。",faqs:[{q:"写真はアップロードされますか？",a:"いいえ。すべてブラウザ内で処理されます。"},{q:"検出はどう機能しますか？",a:"ブラウザ内の軽量AIモデルを使用。"},{q:"複数の顔をぼかせますか？",a:"はい。自動モードですべての顔を検出します。ぼかし追加モードでは好きなだけ領域を描画できます。"},{q:"複数画像は？",a:"はい、最大25枚をZIPで。"},{q:"対応形式は？",a:"JPG、PNG、WebP。"},{q:"透かしは？",a:"透かしはありません。"}],links:[{href:"/compress",label:"圧縮"},{href:"/resize",label:"リサイズ"},{href:"/crop",label:"トリミング"},{href:"/watermark",label:"透かし"},{href:"/meme-generator",label:"ミームジェネレーター"}]},
  ru:{h2a:"Как размыть лица на фото — бесплатно и без загрузки",steps:["Загрузите фото.","Нажмите Автоопределение или Добавить размытие.","Настройте интенсивность размытия.","Скачайте фото."],h2b:"Лучший бесплатный инструмент размытия лиц без загрузки",body:"Работает полностью в вашем браузере. Обрабатывайте до 25 изображений за раз.",h3why:"Зачем размывать лица?",why:"Защищает конфиденциальность в социальных сетях, журналистике и уличной фотографии.",faqs:[{q:"Фото загружается на сервер?",a:"Нет. Всё в вашем браузере."},{q:"Как работает обнаружение?",a:"Лёгкая модель ИИ в браузере."},{q:"Можно размыть несколько лиц?",a:"Да — автоматический режим находит все лица. В режиме добавления размытия рисуйте сколько угодно областей."},{q:"Несколько изображений?",a:"Да, до 25 в ZIP."},{q:"Форматы?",a:"JPG, PNG и WebP."},{q:"Водяной знак?",a:"Без водяного знака."}],links:[{href:"/compress",label:"Сжать"},{href:"/resize",label:"Изменить размер"},{href:"/crop",label:"Обрезать"},{href:"/watermark",label:"Водяной знак"},{href:"/meme-generator",label:"Генератор мемов"}]},
  ko:{h2a:"사진에서 얼굴 흐리게 하는 방법 — 무료, 업로드 불필요",steps:["사진을 업로드하세요.","자동 감지 또는 블러 추가를 클릭하세요.","블러 강도를 조절하세요.","사진을 다운로드하세요."],h2b:"사진을 업로드하지 않는 최고의 무료 얼굴 블러 도구",body:"브라우저에서 완전히 작동합니다. 한 번에 최대 25장까지 처리 가능.",h3why:"왜 얼굴을 흐리게 하나요?",why:"SNS, 저널리즘, 거리 사진에서 프라이버시를 보호합니다.",faqs:[{q:"사진이 업로드되나요?",a:"아닙니다. 모두 브라우저에서 처리됩니다."},{q:"감지는 어떻게 작동하나요?",a:"브라우저 내 경량 AI 모델 사용."},{q:"여러 얼굴을 흐리게 할 수 있나요?",a:"네 — 자동 모드에서 모든 얼굴을 감지합니다. 블러 추가 모드에서 원하는 만큼 영역을 그릴 수 있습니다."},{q:"여러 이미지?",a:"네, 최대 25장을 ZIP으로."},{q:"지원 형식?",a:"JPG, PNG, WebP."},{q:"워터마크?",a:"워터마크 없음."}],links:[{href:"/compress",label:"압축"},{href:"/resize",label:"크기 조정"},{href:"/crop",label:"자르기"},{href:"/watermark",label:"워터마크"},{href:"/meme-generator",label:"밈 생성기"}]},
  zh:{h2a:"如何在照片中模糊人脸 — 免费且无需上传",steps:["上传照片。","点击自动检测或添加模糊。","调整模糊强度。","下载照片。"],h2b:"不上传照片的最佳免费人脸模糊工具",body:"完全在浏览器中运行。一次最多处理25张图片。",h3why:"为什么要模糊人脸？",why:"在社交媒体、新闻和街头摄影中保护隐私。",faqs:[{q:"照片会上传吗？",a:"不会。一切都在浏览器中完成。"},{q:"检测如何工作？",a:"浏览器中的轻量级AI模型。"},{q:"可以模糊多张人脸吗？",a:"可以——自动模式会检测所有人脸。在添加模糊模式下，您可以绘制任意数量的区域。"},{q:"多张图片？",a:"可以，最多25张打包为ZIP。"},{q:"支持格式？",a:"JPG、PNG和WebP。"},{q:"有水印吗？",a:"没有水印。"}],links:[{href:"/compress",label:"压缩"},{href:"/resize",label:"调整大小"},{href:"/crop",label:"裁剪"},{href:"/watermark",label:"水印"},{href:"/meme-generator",label:"表情包生成器"}]},
  'zh-TW':{h2a:"如何在照片中模糊人臉 — 免費且無需上傳",steps:["上傳照片。","點擊自動偵測或新增模糊。","調整模糊強度。","下載照片。"],h2b:"不上傳照片的最佳免費人臉模糊工具",body:"完全在瀏覽器中運行。一次最多處理25張圖片。",h3why:"為什麼要模糊人臉？",why:"在社群媒體、新聞和街頭攝影中保護隱私。",faqs:[{q:"照片會上傳嗎？",a:"不會。一切都在瀏覽器中完成。"},{q:"偵測如何運作？",a:"瀏覽器中的輕量級AI模型。"},{q:"可以模糊多張人臉嗎？",a:"可以——自動模式會偵測所有人臉。在新增模糊模式下，您可以繪製任意數量的區域。"},{q:"多張圖片？",a:"可以，最多25張打包為ZIP。"},{q:"支援格式？",a:"JPG、PNG和WebP。"},{q:"有浮水印嗎？",a:"沒有浮水印。"}],links:[{href:"/compress",label:"壓縮"},{href:"/resize",label:"調整大小"},{href:"/crop",label:"裁切"},{href:"/watermark",label:"浮水印"},{href:"/meme-generator",label:"迷因產生器"}]},
  bg:{h2a:"Как да замъглите лица в снимки — безплатно и без качване",steps:["Качете снимката си.","Щракнете Автоматично откриване или Добави замъгляване.","Регулирайте силата на замъгляване.","Изтеглете снимката."],h2b:"Най-добрият безплатен инструмент за замъгляване на лица",body:"Работи изцяло в браузъра ви. Обработвайте до 25 изображения наведнъж.",h3why:"Защо да замъглявате лица?",why:"Защитава поверителността в социалните мрежи, журналистиката и уличната фотография.",faqs:[{q:"Снимката ми качва ли се?",a:"Не. Всичко в браузъра."},{q:"Как работи откриването?",a:"Лек AI модел в браузъра."},{q:"Мога ли да замъгля няколко лица?",a:"Да — автоматичният режим открива всички лица. В режим Добави замъгляване рисувайте колкото области искате."},{q:"Няколко изображения?",a:"Да, до 25 като ZIP."},{q:"Формати?",a:"JPG, PNG и WebP."},{q:"Воден знак?",a:"Без воден знак."}],links:[{href:"/compress",label:"Компресиране"},{href:"/resize",label:"Преоразмеряване"},{href:"/crop",label:"Изрязване"},{href:"/watermark",label:"Воден знак"},{href:"/meme-generator",label:"Генератор на миймове"}]},
  ca:{h2a:"Com difuminar cares en fotos — Gratis i sense pujar",steps:["Pugeu la vostra foto.","Feu clic a Detecció automàtica o Afegir difuminat.","Ajusteu la intensitat.","Descarregueu la foto."],h2b:"La millor eina gratuïta per difuminar cares sense pujar",body:"Funciona completament al navegador. Processeu fins a 25 imatges alhora.",h3why:"Per què difuminar cares?",why:"Protegeix la privacitat a xarxes socials, periodisme i fotografia de carrer.",faqs:[{q:"La meva foto es puja?",a:"No. Tot al navegador."},{q:"Com funciona la detecció?",a:"Model IA lleuger al navegador."},{q:"Puc difuminar diverses cares?",a:"Sí — el mode automàtic detecta totes les cares. Amb Afegir difuminat podeu dibuixar tantes àrees com vulgueu."},{q:"Diverses imatges?",a:"Sí, fins a 25 en ZIP."},{q:"Formats?",a:"JPG, PNG i WebP."},{q:"Marca d'aigua?",a:"Sense marca d'aigua."}],links:[{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Retallar"},{href:"/watermark",label:"Marca d'aigua"},{href:"/meme-generator",label:"Generador de memes"}]},
  nl:{h2a:"Gezichten vervagen in foto's — Gratis en zonder uploaden",steps:["Upload je foto.","Klik op Automatisch detecteren of Vervaging toevoegen.","Pas de vervaging aan.","Download je foto."],h2b:"De beste gratis tool om gezichten te vervagen zonder uploaden",body:"Werkt volledig in je browser. Verwerk tot 25 afbeeldingen tegelijk.",h3why:"Waarom gezichten vervagen?",why:"Beschermt privacy op social media, in journalistiek en straatfotografie.",faqs:[{q:"Wordt mijn foto geüpload?",a:"Nee. Alles in je browser."},{q:"Hoe werkt de detectie?",a:"Licht AI-model in de browser."},{q:"Kan ik meerdere gezichten vervagen?",a:"Ja — de automatische modus detecteert alle gezichten. Met Vervaging toevoegen teken je zoveel gebieden als je wilt."},{q:"Meerdere afbeeldingen?",a:"Ja, tot 25 als ZIP."},{q:"Formaten?",a:"JPG, PNG en WebP."},{q:"Watermerk?",a:"Geen watermerk."}],links:[{href:"/compress",label:"Comprimeren"},{href:"/resize",label:"Formaat wijzigen"},{href:"/crop",label:"Bijsnijden"},{href:"/watermark",label:"Watermerk"},{href:"/meme-generator",label:"Memegenerator"}]},
  el:{h2a:"Πώς να θολώσετε πρόσωπα σε φωτογραφίες — Δωρεάν χωρίς μεταφόρτωση",steps:["Ανεβάστε τη φωτογραφία σας.","Κάντε κλικ στην Αυτόματη ανίχνευση ή Προσθήκη θολώματος.","Ρυθμίστε την ένταση.","Κατεβάστε τη φωτογραφία."],h2b:"Το καλύτερο δωρεάν εργαλείο θολώματος προσώπων χωρίς μεταφόρτωση",body:"Λειτουργεί εξ ολοκλήρου στο πρόγραμμα περιήγησής σας. Επεξεργαστείτε έως 25 εικόνες τη φορά.",h3why:"Γιατί να θολώσετε πρόσωπα;",why:"Προστατεύει το απόρρητο σε κοινωνικά δίκτυα, δημοσιογραφία και φωτογραφία δρόμου.",faqs:[{q:"Η φωτογραφία μου ανεβαίνει;",a:"Όχι. Όλα στο πρόγραμμα περιήγησής σας."},{q:"Πώς λειτουργεί η ανίχνευση;",a:"Ελαφρύ μοντέλο AI στο πρόγραμμα περιήγησης."},{q:"Μπορώ να θολώσω πολλά πρόσωπα;",a:"Ναι — η αυτόματη λειτουργία ανιχνεύει όλα τα πρόσωπα. Με την Προσθήκη θολώματος σχεδιάστε όσες περιοχές θέλετε."},{q:"Πολλές εικόνες;",a:"Ναι, έως 25 σε ZIP."},{q:"Μορφές;",a:"JPG, PNG και WebP."},{q:"Υδατογράφημα;",a:"Χωρίς υδατογράφημα."}],links:[{href:"/compress",label:"Συμπίεση"},{href:"/resize",label:"Αλλαγή μεγέθους"},{href:"/crop",label:"Περικοπή"},{href:"/watermark",label:"Υδατογράφημα"},{href:"/meme-generator",label:"Γεννήτρια meme"}]},
  hi:{h2a:"फ़ोटो में चेहरे धुंधले कैसे करें — मुफ़्त और अपलोड नहीं",steps:["अपनी फ़ोटो अपलोड करें।","ऑटो डिटेक्ट या ब्लर जोड़ें पर क्लिक करें।","ब्लर की तीव्रता समायोजित करें।","फ़ोटो डाउनलोड करें।"],h2b:"फ़ोटो अपलोड न करने वाला सबसे अच्छा मुफ़्त फ़ेस ब्लर टूल",body:"पूरी तरह से आपके ब्राउज़र में काम करता है। एक बार में 25 छवियों तक प्रोसेस करें।",h3why:"चेहरे क्यों धुंधले करें?",why:"सोशल मीडिया, पत्रकारिता और स्ट्रीट फ़ोटोग्राफ़ी में गोपनीयता की रक्षा करता है।",faqs:[{q:"क्या मेरी फ़ोटो अपलोड होती है?",a:"नहीं। सब कुछ ब्राउज़र में।"},{q:"डिटेक्शन कैसे काम करता है?",a:"ब्राउज़र में हल्का AI मॉडल।"},{q:"क्या मैं कई चेहरे धुंधले कर सकता हूँ?",a:"हाँ — ऑटो मोड सभी चेहरों का पता लगाता है। ब्लर जोड़ें मोड में जितने चाहें उतने क्षेत्र बनाएँ।"},{q:"कई छवियाँ?",a:"हाँ, 25 तक ZIP में।"},{q:"प्रारूप?",a:"JPG, PNG और WebP।"},{q:"वॉटरमार्क?",a:"कोई वॉटरमार्क नहीं।"}],links:[{href:"/compress",label:"संपीड़ित करें"},{href:"/resize",label:"आकार बदलें"},{href:"/crop",label:"काटें"},{href:"/watermark",label:"वॉटरमार्क"},{href:"/meme-generator",label:"मीम जनरेटर"}]},
  id:{h2a:"Cara memburamkan wajah di foto — Gratis dan tanpa upload",steps:["Upload foto Anda.","Klik Deteksi Otomatis atau Tambah Blur.","Sesuaikan intensitas blur.","Download foto Anda."],h2b:"Alat blur wajah gratis terbaik tanpa upload",body:"Berjalan sepenuhnya di browser Anda. Proses hingga 25 gambar sekaligus.",h3why:"Mengapa memburamkan wajah?",why:"Melindungi privasi di media sosial, jurnalisme, dan fotografi jalanan.",faqs:[{q:"Apakah foto saya diupload?",a:"Tidak. Semua di browser."},{q:"Bagaimana deteksi bekerja?",a:"Model AI ringan di browser."},{q:"Bisakah saya memburamkan banyak wajah?",a:"Ya — mode otomatis mendeteksi semua wajah. Dalam mode Tambah Blur, gambar sebanyak mungkin area yang Anda inginkan."},{q:"Banyak gambar?",a:"Ya, hingga 25 dalam ZIP."},{q:"Format?",a:"JPG, PNG, dan WebP."},{q:"Watermark?",a:"Tidak ada watermark."}],links:[{href:"/compress",label:"Kompres"},{href:"/resize",label:"Ubah Ukuran"},{href:"/crop",label:"Potong"},{href:"/watermark",label:"Watermark"},{href:"/meme-generator",label:"Generator Meme"}]},
  ms:{h2a:"Cara mengaburkan muka dalam foto — Percuma dan tanpa muat naik",steps:["Muat naik foto anda.","Klik Pengesanan Auto atau Tambah Kabur.","Laraskan intensiti kabur.","Muat turun foto anda."],h2b:"Alat kabur muka percuma terbaik tanpa muat naik",body:"Berjalan sepenuhnya dalam pelayar anda. Proses sehingga 25 imej serentak.",h3why:"Mengapa mengaburkan muka?",why:"Melindungi privasi di media sosial, kewartawanan dan fotografi jalanan.",faqs:[{q:"Adakah foto saya dimuat naik?",a:"Tidak. Semua dalam pelayar."},{q:"Bagaimana pengesanan berfungsi?",a:"Model AI ringan dalam pelayar."},{q:"Bolehkah saya mengaburkan banyak muka?",a:"Ya — mod automatik mengesan semua muka. Dalam mod Tambah Kabur, lukis seberapa banyak kawasan yang anda mahu."},{q:"Banyak imej?",a:"Ya, sehingga 25 dalam ZIP."},{q:"Format?",a:"JPG, PNG dan WebP."},{q:"Tera air?",a:"Tiada tera air."}],links:[{href:"/compress",label:"Mampat"},{href:"/resize",label:"Ubah Saiz"},{href:"/crop",label:"Pangkas"},{href:"/watermark",label:"Tera Air"},{href:"/meme-generator",label:"Penjana Meme"}]},
  pl:{h2a:"Jak rozmyć twarze na zdjęciach — za darmo i bez przesyłania",steps:["Prześlij zdjęcie.","Kliknij Automatyczne wykrywanie lub Dodaj rozmycie.","Dostosuj intensywność rozmycia.","Pobierz zdjęcie."],h2b:"Najlepsze darmowe narzędzie do rozmywania twarzy bez przesyłania",body:"Działa w całości w przeglądarce. Przetwarzaj do 25 obrazów naraz.",h3why:"Dlaczego rozmywać twarze?",why:"Chroni prywatność w mediach społecznościowych, dziennikarstwie i fotografii ulicznej.",faqs:[{q:"Czy moje zdjęcie jest przesyłane?",a:"Nie. Wszystko w przeglądarce."},{q:"Jak działa wykrywanie?",a:"Lekki model AI w przeglądarce."},{q:"Czy mogę rozmyć wiele twarzy?",a:"Tak — tryb automatyczny wykrywa wszystkie twarze. W trybie Dodaj rozmycie rysuj dowolną liczbę obszarów."},{q:"Wiele obrazów?",a:"Tak, do 25 w ZIP."},{q:"Formaty?",a:"JPG, PNG i WebP."},{q:"Znak wodny?",a:"Brak znaku wodnego."}],links:[{href:"/compress",label:"Kompresja"},{href:"/resize",label:"Zmień rozmiar"},{href:"/crop",label:"Przytnij"},{href:"/watermark",label:"Znak wodny"},{href:"/meme-generator",label:"Generator memów"}]},
  sv:{h2a:"Hur man suddar ansikten i foton — Gratis och utan uppladdning",steps:["Ladda upp ditt foto.","Klicka på Automatisk identifiering eller Lägg till suddning.","Justera suddningens styrka.","Ladda ner ditt foto."],h2b:"Bästa gratis ansiktssuddningsverktyget utan uppladdning",body:"Körs helt i din webbläsare. Bearbeta upp till 25 bilder åt gången.",h3why:"Varför sudda ansikten?",why:"Skyddar integriteten på sociala medier, inom journalistik och gatefotografi.",faqs:[{q:"Laddas mitt foto upp?",a:"Nej. Allt i din webbläsare."},{q:"Hur fungerar detekteringen?",a:"Lätt AI-modell i webbläsaren."},{q:"Kan jag sudda flera ansikten?",a:"Ja — automatiskt läge upptäcker alla ansikten. Med Lägg till suddning kan du rita så många områden du vill."},{q:"Flera bilder?",a:"Ja, upp till 25 som ZIP."},{q:"Format?",a:"JPG, PNG och WebP."},{q:"Vattenstämpel?",a:"Ingen vattenstämpel."}],links:[{href:"/compress",label:"Komprimera"},{href:"/resize",label:"Ändra storlek"},{href:"/crop",label:"Beskär"},{href:"/watermark",label:"Vattenstämpel"},{href:"/meme-generator",label:"Memegenerator"}]},
  th:{h2a:"วิธีเบลอใบหน้าในรูปภาพ — ฟรีและไม่ต้องอัปโหลด",steps:["อัปโหลดรูปภาพ","คลิกตรวจจับอัตโนมัติหรือเพิ่มเบลอ","ปรับความเข้มของเบลอ","ดาวน์โหลดรูปภาพ"],h2b:"เครื่องมือเบลอใบหน้าฟรีที่ดีที่สุดโดยไม่ต้องอัปโหลด",body:"ทำงานทั้งหมดในเบราว์เซอร์ ประมวลผลได้สูงสุด 25 ภาพต่อครั้ง",h3why:"ทำไมต้องเบลอใบหน้า?",why:"ปกป้องความเป็นส่วนตัวบนโซเชียลมีเดีย งานข่าว และการถ่ายภาพริมถนน",faqs:[{q:"รูปภาพจะถูกอัปโหลดไหม?",a:"ไม่ ทุกอย่างอยู่ในเบราว์เซอร์"},{q:"การตรวจจับทำงานอย่างไร?",a:"โมเดล AI น้ำหนักเบาในเบราว์เซอร์"},{q:"เบลอหลายใบหน้าได้ไหม?",a:"ได้ — โหมดอัตโนมัติตรวจจับใบหน้าทั้งหมด ในโหมดเพิ่มเบลอ วาดพื้นที่ได้ไม่จำกัด"},{q:"หลายภาพ?",a:"ได้ สูงสุด 25 ภาพเป็น ZIP"},{q:"รูปแบบ?",a:"JPG, PNG และ WebP"},{q:"ลายน้ำ?",a:"ไม่มีลายน้ำ"}],links:[{href:"/compress",label:"บีบอัด"},{href:"/resize",label:"ปรับขนาด"},{href:"/crop",label:"ครอป"},{href:"/watermark",label:"ลายน้ำ"},{href:"/meme-generator",label:"สร้างมีม"}]},
  tr:{h2a:"Fotoğraflarda yüzleri bulanıklaştırma — Ücretsiz ve yüklemesiz",steps:["Fotoğrafınızı yükleyin.","Otomatik Algıla veya Bulanıklık Ekle'ye tıklayın.","Bulanıklık yoğunluğunu ayarlayın.","Fotoğrafınızı indirin."],h2b:"Fotoğraf yüklemeyen en iyi ücretsiz yüz bulanıklaştırma aracı",body:"Tamamen tarayıcınızda çalışır. Bir seferde 25 görüntüye kadar işleyin.",h3why:"Neden yüzleri bulanıklaştırmalı?",why:"Sosyal medya, gazetecilik ve sokak fotoğrafçılığında gizliliği korur.",faqs:[{q:"Fotoğrafım yüklenir mi?",a:"Hayır. Her şey tarayıcınızda."},{q:"Algılama nasıl çalışır?",a:"Tarayıcıda hafif AI modeli."},{q:"Birden fazla yüzü bulanıklaştırabilir miyim?",a:"Evet — otomatik mod tüm yüzleri algılar. Bulanıklık Ekle modunda istediğiniz kadar alan çizebilirsiniz."},{q:"Birden fazla görüntü?",a:"Evet, 25'e kadar ZIP olarak."},{q:"Formatlar?",a:"JPG, PNG ve WebP."},{q:"Filigran?",a:"Filigran yok."}],links:[{href:"/compress",label:"Sıkıştır"},{href:"/resize",label:"Boyutlandır"},{href:"/crop",label:"Kırp"},{href:"/watermark",label:"Filigran"},{href:"/meme-generator",label:"Meme Oluşturucu"}]},
  uk:{h2a:"Як розмити обличчя на фото — безкоштовно і без завантаження",steps:["Завантажте фото.","Натисніть Автовиявлення або Додати розмиття.","Налаштуйте інтенсивність розмиття.","Завантажте фото."],h2b:"Найкращий безкоштовний інструмент розмиття облич без завантаження",body:"Працює повністю у вашому браузері. Обробляйте до 25 зображень за раз.",h3why:"Навіщо розмивати обличчя?",why:"Захищає конфіденційність у соціальних мережах, журналістиці та вуличній фотографії.",faqs:[{q:"Моє фото завантажується?",a:"Ні. Все у вашому браузері."},{q:"Як працює виявлення?",a:"Легка модель ШІ у браузері."},{q:"Чи можу я розмити кілька облич?",a:"Так — автоматичний режим виявляє всі обличчя. У режимі Додати розмиття малюйте скільки завгодно областей."},{q:"Кілька зображень?",a:"Так, до 25 у ZIP."},{q:"Формати?",a:"JPG, PNG і WebP."},{q:"Водяний знак?",a:"Без водяного знаку."}],links:[{href:"/compress",label:"Стиснути"},{href:"/resize",label:"Змінити розмір"},{href:"/crop",label:"Обрізати"},{href:"/watermark",label:"Водяний знак"},{href:"/meme-generator",label:"Генератор мемів"}]},
  vi:{h2a:"Cách làm mờ khuôn mặt trong ảnh — Miễn phí và không cần tải lên",steps:["Tải ảnh lên.","Nhấp Tự động phát hiện hoặc Thêm làm mờ.","Điều chỉnh độ mờ.","Tải ảnh về."],h2b:"Công cụ làm mờ khuôn mặt miễn phí tốt nhất không cần tải lên",body:"Chạy hoàn toàn trong trình duyệt. Xử lý tối đa 25 ảnh cùng lúc.",h3why:"Tại sao cần làm mờ khuôn mặt?",why:"Bảo vệ quyền riêng tư trên mạng xã hội, báo chí và nhiếp ảnh đường phố.",faqs:[{q:"Ảnh của tôi có được tải lên không?",a:"Không. Mọi thứ trong trình duyệt."},{q:"Phát hiện hoạt động như thế nào?",a:"Mô hình AI nhẹ trong trình duyệt."},{q:"Tôi có thể làm mờ nhiều khuôn mặt không?",a:"Có — chế độ tự động phát hiện tất cả khuôn mặt. Trong chế độ Thêm làm mờ, vẽ bao nhiêu vùng tùy thích."},{q:"Nhiều ảnh?",a:"Có, tối đa 25 ảnh dạng ZIP."},{q:"Định dạng?",a:"JPG, PNG và WebP."},{q:"Watermark?",a:"Không có watermark."}],links:[{href:"/compress",label:"Nén"},{href:"/resize",label:"Đổi kích thước"},{href:"/crop",label:"Cắt ảnh"},{href:"/watermark",label:"Watermark"},{href:"/meme-generator",label:"Tạo Meme"}]}
}


function buildSeoSection(){
  const lang=getLang(),seo=seoBlur[lang]||seoBlur['en']
  const faqTitle=t.seo_faq_title||'Frequently Asked Questions',alsoTry=t.seo_also_try||'Also Try'
  const div=document.createElement('div');div.className='seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML=`
    <h2 class="seo-h2-large">${seo.h2a}</h2>
    <ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <h2 class="seo-h2-large">${seo.h2b}</h2>
    <p>${seo.body}</p>
    <h3>${seo.h3why}</h3>
    <p>${seo.why}</p>
    <h3>${faqTitle}</h3>
    ${seo.faqs.map(f=>`<div class="faq-item"><p class="faq-q">${f.q}</p><p class="faq-a">${f.a}</p></div>`).join('')}
    <h3>${alsoTry}</h3>
    <div class="also-links">${seo.links.map(l=>`<a class="also-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>
  `
  document.querySelector('.tool-wrap').appendChild(div)
}
buildSeoSection()