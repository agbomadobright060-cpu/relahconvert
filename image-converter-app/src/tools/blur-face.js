import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

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
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:#F2F2F2;'
  const style = document.createElement('style')
  style.textContent = `
    *{box-sizing:border-box}
    .tool-wrap{max-width:1060px;margin:0 auto;padding:24px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:20px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:900;color:#2C1810;margin:0 0 4px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:#C84B31}
    .tool-sub{font-size:13px;color:#7A6A5A;margin:0}
    .bf-upload-area{border:2px dashed #DDD5C8;border-radius:14px;padding:40px 24px;text-align:center;cursor:pointer;transition:all 0.2s;background:#fff}
    .bf-upload-area:hover,.bf-upload-area.drag{border-color:#C84B31;background:#FDF5F3}
    .bf-upload-icon{font-size:36px;margin-bottom:10px}
    .bf-upload-text{font-size:15px;font-weight:700;color:#2C1810;margin:0 0 4px}
    .bf-upload-sub{font-size:12px;color:#9A8A7A;margin:0}
    .bf-upload-btn{margin-top:14px;padding:10px 24px;background:#C84B31;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer}
    .bf-upload-btn:hover{background:#A63D26}
    .bf-queue{display:none;margin-bottom:16px}
    .bf-queue-title{font-size:11px;font-weight:700;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px}
    .bf-queue-grid{display:flex;flex-wrap:wrap;gap:8px}
    .bf-queue-item{position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:2px solid #DDD5C8;cursor:pointer;flex-shrink:0;transition:border-color 0.15s}
    .bf-queue-item.active{border-color:#C84B31}
    .bf-queue-item img{width:100%;height:100%;object-fit:cover;display:block}
    .bf-queue-item .qi-del{position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.55);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
    .bf-queue-item .qi-del:hover{background:#C84B31}
    .bf-queue-add{width:72px;height:72px;border-radius:8px;border:2px dashed #DDD5C8;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:22px;color:#9A8A7A;flex-shrink:0;transition:all 0.15s;background:#fff}
    .bf-queue-add:hover{border-color:#C84B31;color:#C84B31}
    .bf-layout{display:none;gap:20px;align-items:start}
    .bf-layout.visible{display:grid;grid-template-columns:1fr 270px}
    @media(max-width:700px){.bf-layout.visible{grid-template-columns:1fr}}
    .bf-canvas-wrap{position:relative;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)}
    .bf-canvas-wrap canvas{display:block;width:100%;height:auto;cursor:crosshair;touch-action:none}
    .bf-panel{background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.08);display:flex;flex-direction:column;gap:14px}
    .bf-panel-title{font-size:14px;font-weight:700;color:#2C1810;margin:0;font-family:'Fraunces',serif}
    .bf-mode-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .bf-mode-btn{padding:9px 6px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:12px;font-weight:700;color:#2C1810;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center}
    .bf-mode-btn.active{border-color:#C84B31;background:#FDF5F3;color:#C84B31}
    .bf-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px}
    .bf-slider{width:100%;accent-color:#C84B31;cursor:pointer}
    .bf-status{font-size:12px;color:#7A6A5A;background:#F5EDE8;border-radius:8px;padding:10px 12px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}
    .bf-status.error{background:#FDE8E3;color:#C84B31}
    .bf-status.success{background:#E8F5E9;color:#2E7D32}
    .bf-regions{display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto}
    .bf-region-item{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#F8F4F0;border-radius:8px;font-size:12px;color:#2C1810;font-weight:600}
    .bf-region-del{background:none;border:none;color:#C84B31;cursor:pointer;font-size:14px;padding:0 4px;line-height:1}
    .bf-action-row{display:flex;flex-direction:column;gap:8px}
    .bf-download-btn{padding:12px;background:#C84B31;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;width:100%}
    .bf-download-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .bf-download-btn:disabled{background:#C4B8A8;cursor:not-allowed;transform:none}
    .bf-reset-btn{padding:10px;background:#fff;color:#7A6A5A;border:1.5px solid #DDD5C8;border-radius:9px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;width:100%}
    .bf-reset-btn:hover{border-color:#C84B31;color:#C84B31}
    #nextSteps{margin-top:4px}
    .seo-section{margin-top:48px;padding-top:32px;border-top:1.5px solid #E8DDD5}
    .seo-section .seo-h2-large{font-family:'Fraunces',serif;font-size:clamp(15px,2vw,19px);font-weight:900;color:#2C1810;margin:0 0 14px}
    .seo-section h3{font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:#2C1810;margin:22px 0 8px}
    .seo-section ol{padding-left:20px;color:#5A4A3A;font-size:14px;line-height:1.8}
    .seo-section p{color:#5A4A3A;font-size:14px;line-height:1.7;margin:10px 0}
    .faq-item{margin-bottom:14px}
    .faq-q{font-weight:700;color:#2C1810;font-size:14px;margin:0 0 4px}
    .faq-a{color:#5A4A3A;font-size:13px;line-height:1.6;margin:0}
    .also-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .also-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:12px;font-weight:600;color:#2C1810;text-decoration:none;transition:all 0.15s}
    .also-link:hover{border-color:#C84B31;color:#C84B31}
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
  <div class="bf-upload-area" id="uploadArea">
    <div class="bf-upload-icon">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="40" height="40" rx="8" fill="#F5EDE8" stroke="#DDD5C8" stroke-width="2"/>
        <circle cx="24" cy="18" r="7" fill="#C84B31" opacity="0.25" stroke="#C84B31" stroke-width="1.5"/>
        <path d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#C84B31" opacity="0.15" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="16" y="14" width="16" height="8" rx="3" fill="#C84B31" opacity="0.3"/>
        <line x1="15" y1="16" x2="33" y2="16" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
        <line x1="15" y1="19" x2="33" y2="19" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
        <line x1="15" y1="22" x2="33" y2="22" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      </svg>
    </div>
    <p class="bf-upload-text">${ui.drop}</p>
    <p class="bf-upload-sub">${ui.dropSub}</p>
    <button class="bf-upload-btn" id="uploadBtn">${ui.uploadBtn}</button>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none">
  </div>
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
        <button class="bf-download-btn" id="batchDownloadBtn" style="display:none;background:#2C1810">⬇ ${ui.downloadZip}</button>
        <button class="bf-reset-btn" id="resetBtn">↺ ${ui.reset}</button>
        <div id="nextSteps" style="display:none">
          <div style="font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">${t.whats_next||"What's Next?"}</div>
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
  // scale blur regions back up if preview was downscaled
  const scale = entry.previewScale || 1
  const tc=document.createElement('canvas')
  tc.width=entry.img.naturalWidth;tc.height=entry.img.naturalHeight
  const tctx=tc.getContext('2d');tctx.drawImage(entry.img,0,0)
  entry.blurRegions.forEach(r=>{
    // if preview was downscaled, scale coordinates back to full res
    const rx = r.x / scale, ry = r.y / scale, rw = r.w / scale, rh = r.h / scale
    const ix=Math.max(0,Math.round(rx)),iy=Math.max(0,Math.round(ry))
    const iw=Math.min(tc.width-ix,Math.round(rw)),ih=Math.min(tc.height-iy,Math.round(rh))
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
  return tc
}

function canvasToBlob(tc){return new Promise(resolve=>tc.toBlob(blob=>resolve(blob),'image/jpeg',0.92))}

function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('relahconvert',1);req.onupgradeneeded=e=>e.target.result.createObjectStore('pending',{keyPath:'id'});req.onsuccess=e=>resolve(e.target.result);req.onerror=()=>reject()})}
async function saveToIDB(blob,name,type){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('pending','readwrite'),store=tx.objectStore('pending');store.clear();store.put({id:0,blob,name,type});tx.oncomplete=resolve;tx.onerror=reject})}

function buildNextSteps(blob){
  const buttons=[{label:t.nav_short?.compress||'Compress',href:'/compress'},{label:t.nav_short?.resize||'Resize',href:'/resize'},{label:t.nav_short?.crop||'Crop',href:'/crop'},{label:t.nav_short?.watermark||'Watermark',href:'/watermark'},{label:'Meme Generator',href:'/meme-generator'}]
  const container=$('nextStepsButtons');container.innerHTML=''
  buttons.forEach(b=>{
    const btn=document.createElement('button')
    btn.style.cssText='padding:7px 13px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:12px;font-weight:600;color:#2C1810;background:#fff;cursor:pointer;font-family:DM Sans,sans-serif;transition:all 0.15s'
    btn.textContent=b.label
    btn.onmouseover=()=>{btn.style.borderColor='#C84B31';btn.style.color='#C84B31'}
    btn.onmouseout=()=>{btn.style.borderColor='#DDD5C8';btn.style.color='#2C1810'}
    btn.onclick=async()=>{try{await saveToIDB(blob,'blurred.jpg','image/jpeg');sessionStorage.setItem('pendingFromIDB','1')}catch(e){}window.location.href=b.href}
    container.appendChild(btn)
  })
  $('nextSteps').style.display='block'
}

$('downloadBtn').onclick=async()=>{
  if(!images.length)return
  const tc=renderClean(images[activeIdx])
  const blob=await canvasToBlob(tc)
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='blurred-face.jpg';a.click()
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
      const tc=renderClean(entry)
      const blob=await canvasToBlob(tc)
      zip.file(`${String(i+1).padStart(2,'0')}-${entry.file.name.replace(/\.[^.]+$/,'')}-blurred.jpg`,blob)
      // free canvas memory
      tc.width=1; tc.height=1
    }
    btn.textContent=ui.creatingZip
    const zipBlob=await zip.generateAsync({type:'blob'})
    const url=URL.createObjectURL(zipBlob)
    const a=document.createElement('a');a.href=url;a.download='blurred-faces.zip';a.click()
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
  en:{h2a:'How to Blur Faces in Photos — Free & No Upload Required',steps:['Upload your photo — click Upload Image or drag and drop any JPG, PNG, or WebP file.','Click Auto Detect to automatically find and blur all faces, or click Add Blur to draw blur regions manually.','Adjust blur amount — use the slider to make the blur stronger or lighter.','Download — click Download Image to save your blurred photo instantly.'],h2b:'The Best Free Face Blur Tool That Never Uploads Your Photos',body:"RelahConvert's face blur tool runs entirely in your browser. Your photos never leave your device. No account needed, no watermarks, no limits. Batch process up to 25 images at once.",h3why:'Why Blur Faces in Photos?',why:"Blurring faces protects privacy when sharing photos publicly. Essential for social media, journalism, and street photography.",faqs:[{q:'Does my photo get uploaded to a server?',a:'No. Everything runs in your browser. Your files never leave your device.'},{q:'How does auto face detection work?',a:'We use a lightweight AI model (TinyFaceDetector) that runs entirely in your browser.'},{q:'Can I blur multiple faces?',a:'Yes — auto mode detects all faces. In Add Blur mode draw as many regions as you want.'},{q:'Can I process multiple images at once?',a:'Yes — upload up to 25 images (200MB total) and download them all as a ZIP.'},{q:'What image formats are supported?',a:'JPG, PNG, and WebP.'},{q:'Is there a watermark?',a:'No watermark, ever.'}],links:[{href:'/compress',label:'Compress Image'},{href:'/resize',label:'Resize Image'},{href:'/crop',label:'Crop Image'},{href:'/watermark',label:'Add Watermark'},{href:'/meme-generator',label:'Meme Generator'}]},
  fr:{h2a:"Comment flouter des visages dans des photos — Gratuit et sans téléversement",steps:["Téléversez votre photo.","Cliquez sur Détection auto ou sur Ajouter un flou pour dessiner manuellement.","Ajustez le flou avec le curseur.","Téléchargez votre photo."],h2b:"Le meilleur outil gratuit pour flouter les visages sans téléverser vos photos",body:"L'outil de floutage de RelahConvert fonctionne entièrement dans votre navigateur. Traitez jusqu'à 25 images à la fois.",h3why:"Pourquoi flouter les visages ?",why:"Le floutage protège la vie privée sur les réseaux sociaux, en journalisme et en photographie de rue.",faqs:[{q:"Ma photo sera-t-elle téléversée ?",a:"Non. Tout s'exécute dans votre navigateur."},{q:"Comment fonctionne la détection auto ?",a:"Nous utilisons un modèle IA léger dans votre navigateur."},{q:"Puis-je traiter plusieurs images ?",a:"Oui — jusqu'à 25 images en ZIP."},{q:"Quels formats ?",a:"JPG, PNG et WebP."},{q:"Filigrane ?",a:"Aucun filigrane."}],links:[{href:"/compress",label:"Compresser"},{href:"/resize",label:"Redimensionner"},{href:"/crop",label:"Recadrer"},{href:"/watermark",label:"Filigrane"},{href:"/meme-generator",label:"Générateur de mèmes"}]},
  es:{h2a:"Cómo difuminar caras en fotos — Gratis y sin subir archivos",steps:["Sube tu foto.","Haz clic en Detección automática o en Añadir desenfoque para dibujar zonas.","Ajusta el difuminado.","Descarga tu foto."],h2b:"La mejor herramienta gratuita para difuminar caras",body:"Funciona completamente en tu navegador. Procesa hasta 25 imágenes a la vez.",h3why:"¿Por qué difuminar caras?",why:"Protege la privacidad en redes sociales, periodismo y fotografía callejera.",faqs:[{q:"¿Se sube mi foto?",a:"No. Todo en tu navegador."},{q:"¿Cómo funciona la detección?",a:"Modelo IA ligero en tu navegador."},{q:"¿Varias imágenes?",a:"Sí, hasta 25 en ZIP."},{q:"¿Formatos?",a:"JPG, PNG y WebP."},{q:"¿Marca de agua?",a:"Sin marca de agua."}],links:[{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca de agua"},{href:"/meme-generator",label:"Generador de memes"}]},
  pt:{h2a:"Como desfocar rostos em fotos — Grátis e sem upload",steps:["Envie sua foto.","Clique em Detectar automaticamente ou em Adicionar desfoque.","Ajuste o desfoque.","Baixe sua foto."],h2b:"A melhor ferramenta gratuita para desfocar rostos",body:"Funciona no seu navegador. Processe até 25 imagens de uma vez.",h3why:"Por que desfocar rostos?",why:"Protege a privacidade em redes sociais, jornalismo e fotografia de rua.",faqs:[{q:"Minha foto é enviada?",a:"Não. Tudo no navegador."},{q:"Como funciona a detecção?",a:"Modelo de IA leve no navegador."},{q:"Várias imagens?",a:"Sim, até 25 em ZIP."},{q:"Formatos?",a:"JPG, PNG e WebP."},{q:"Marca d'água?",a:"Sem marca d'água."}],links:[{href:"/compress",label:"Comprimir"},{href:"/resize",label:"Redimensionar"},{href:"/crop",label:"Recortar"},{href:"/watermark",label:"Marca d'água"},{href:"/meme-generator",label:"Gerador de memes"}]},
  de:{h2a:"Gesichter in Fotos unkenntlich machen — Kostenlos und ohne Upload",steps:["Lade dein Foto hoch.","Klicke auf Auto-Erkennung oder Unschärfe hinzufügen.","Stärke anpassen.","Herunterladen."],h2b:"Das beste kostenlose Tool zum Verpixeln ohne Upload",body:"Läuft vollständig in deinem Browser. Verarbeite bis zu 25 Bilder auf einmal.",h3why:"Warum Gesichter unkenntlich machen?",why:"Schützt die Privatsphäre in sozialen Medien, Journalismus und Straßenfotografie.",faqs:[{q:"Wird mein Foto hochgeladen?",a:"Nein. Alles läuft in deinem Browser."},{q:"Wie funktioniert die Erkennung?",a:"Leichtes KI-Modell im Browser."},{q:"Mehrere Bilder?",a:"Ja, bis zu 25 als ZIP."},{q:"Formate?",a:"JPG, PNG und WebP."},{q:"Wasserzeichen?",a:"Kein Wasserzeichen."}],links:[{href:"/compress",label:"Komprimieren"},{href:"/resize",label:"Größe ändern"},{href:"/crop",label:"Zuschneiden"},{href:"/watermark",label:"Wasserzeichen"},{href:"/meme-generator",label:"Meme-Generator"}]},
  ar:{h2a:"كيفية تمويه الوجوه في الصور — مجاناً وبدون رفع",steps:["ارفع صورتك.","انقر على الكشف التلقائي أو إضافة تمويه.","اضبط مقدار التمويه.","تحميل الصورة."],h2b:"أفضل أداة مجانية لتمويه الوجوه",body:"تعمل بالكامل في متصفحك. معالجة حتى 25 صورة في وقت واحد.",h3why:"لماذا تمويه الوجوه؟",why:"يحمي الخصوصية في وسائل التواصل الاجتماعي والصحافة وتصوير الشوارع.",faqs:[{q:"هل ترفع صوري؟",a:"لا. كل شيء في متصفحك."},{q:"كيف يعمل الكشف؟",a:"نموذج ذكاء اصطناعي خفيف."},{q:"عدة صور؟",a:"نعم، حتى 25 صورة كـ ZIP."},{q:"الصيغ؟",a:"JPG وPNG وWebP."},{q:"علامة مائية؟",a:"لا علامة مائية."}],links:[{href:"/compress",label:"ضغط"},{href:"/resize",label:"تغيير الحجم"},{href:"/crop",label:"اقتصاص"},{href:"/watermark",label:"علامة مائية"},{href:"/meme-generator",label:"صانع الميمات"}]}
}

function getLang(){return localStorage.getItem('rc_lang')||navigator.language?.slice(0,2)||'en'}
function buildSeoSection(){
  const lang=getLang(),seo=seoBlur[lang]||seoBlur['en']
  const faqTitle=t.seo_faq_title||'Frequently Asked Questions',alsoTry=t.seo_also_try||'Also Try'
  const div=document.createElement('div');div.className='seo-section'
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
    <div class="also-links">${seo.links.map(l=>`<a class="also-link" href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.querySelector('.tool-wrap').appendChild(div)
}
buildSeoSection()