import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { jsPDF } from 'jspdf'
injectHreflang('merge-images')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['merge-images']) || 'Merge Images'
const seoData   = t.seo && t.seo['merge-images']
const descText  = seoData ? seoData.h2a : 'Merge multiple images side by side or stacked vertically. Free and private — files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = '#F2F2F2'

const mergeHorizontalLbl = t.merge_horizontal || 'Horizontal'
const mergeVerticalLbl   = t.merge_vertical || 'Vertical'
const mergeDirectionLbl  = t.merge_direction || 'Direction'
const mergeFormatLbl     = t.merge_format || 'Format'
const mergeBtnLbl        = t.merge_btn || 'Merge Images'
const mergeBtnLoadingLbl = t.merge_btn_loading || 'Merging...'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}
  .drop-zone{border:2px dashed #DDD5C8;border-radius:12px;padding:32px 20px;text-align:center;cursor:pointer;transition:all 0.2s;margin-bottom:18px;background:#FAFAF8;}
  .drop-zone:hover,.drop-zone.drag-over{border-color:#C84B31;background:#FDE8E3;}
  .drop-zone svg{margin-bottom:6px;color:#C4B8A8;transition:color 0.2s;}
  .drop-zone:hover svg,.drop-zone.drag-over svg{color:#C84B31;}
  .drop-zone p{margin:0;font-family:'DM Sans',sans-serif;font-size:13px;color:#9A8A7A;}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:visible;position:relative;padding-bottom:8px;}
  .card-img-wrap{position:relative;width:100%;height:100px;display:flex;align-items:center;justify-content:center;background:#F5F0E8;border-radius:10px 10px 0 0;overflow:hidden;}
  .card-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block;}
  .card-fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:4px 8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}
  .card-rm{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:6;}
  .card-order{position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;background:#C84B31;color:#fff;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;z-index:6;}
  .options-row{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center;}
  .opt-group{display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:13px;color:#5A4A3A;}
  .opt-group label{font-weight:600;}
  .opt-group select{padding:6px 10px;border:1.5px solid #DDD5C8;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;background:#fff;color:#2C1810;cursor:pointer;}
  .opt-group select:focus{border-color:#C84B31;outline:none;box-shadow:0 0 0 3px rgba(200,75,49,0.12);}
  .dir-btn{padding:7px 14px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .dir-btn:hover{border-color:#C84B31;color:#C84B31;}
  .dir-btn.active{border-color:#C84B31;background:#FDE8E3;color:#C84B31;}
  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;min-width:160px;}
  .action-btn:hover{background:#A63D26;}
  .action-btn:disabled{background:#C4B8A8;cursor:not-allowed;}
  #previewWrap{display:none;margin-bottom:16px;background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;padding:12px;text-align:center;overflow:auto;max-height:500px;}
  #previewWrap img{max-width:100%;border-radius:8px;}
  .status-text{font-size:13px;color:#7A6A5A;font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
  .next-steps{margin-top:20px;}
  .next-steps-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:13px;font-weight:500;color:#2C1810;text-decoration:none;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:#C84B31;color:#C84B31;}
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
document.title = `${toolName} Free & Private | RelahConvert`

document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>
    <div class="drop-zone" id="dropZone">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#F5F0E8"/>
        <circle cx="14" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="#DDD5C8"/>
        <path d="M6 26l7-6 5 4 6-5 10 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <rect x="14" y="16" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#fff" opacity="0.85"/>
        <path d="M28 30v-8m0 0l-3.5 3.5M28 22l3.5 3.5" stroke="#C84B31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>${t.drop_images_here || 'Drop images here'}</p>
    </div>
    <div id="fileGrid"></div>
    <div class="options-row" id="optionsRow" style="display:none;">
      <div class="opt-group">
        <label>${mergeDirectionLbl}:</label>
        <button class="dir-btn active" id="dirH">⇄ ${mergeHorizontalLbl}</button>
        <button class="dir-btn" id="dirV">⇅ ${mergeVerticalLbl}</button>
      </div>
      <div class="opt-group">
        <label>${mergeFormatLbl}:</label>
        <select id="formatSelect">
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="application/pdf">PDF</option>
        </select>
      </div>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="mergeBtn">${mergeBtnLbl}</button>
    </div>
    <div id="previewWrap"><img id="previewImg" /></div>
    <div id="dlRow" style="display:none;margin-bottom:16px;">
      <a id="dlLink" class="action-btn" style="display:inline-block;text-align:center;text-decoration:none;background:#2C1810;" download>⬇ ${dlBtn}</a>
    </div>
    <div id="nextSteps" style="display:none;" class="next-steps">
      <div class="next-steps-label">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileGrid     = document.getElementById('fileGrid')
const optionsRow   = document.getElementById('optionsRow')
const actionRow    = document.getElementById('actionRow')
const mergeBtn     = document.getElementById('mergeBtn')
const statusText   = document.getElementById('statusText')
const previewWrap  = document.getElementById('previewWrap')
const previewImg   = document.getElementById('previewImg')
const dlRow        = document.getElementById('dlRow')
const dlLink       = document.getElementById('dlLink')
const dirH         = document.getElementById('dirH')
const dirV         = document.getElementById('dirV')
const formatSelect = document.getElementById('formatSelect')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

const MAX_FILES = 25
const MAX_TOTAL_BYTES = 200 * 1024 * 1024 // 200MB

let files = []
let direction = 'horizontal'
let lastBlobUrl = null

dirH.addEventListener('click', () => { direction = 'horizontal'; dirH.classList.add('active'); dirV.classList.remove('active') })
dirV.addEventListener('click', () => { direction = 'vertical'; dirV.classList.add('active'); dirH.classList.remove('active') })

function updateUI() {
  const dz = document.getElementById('dropZone')
  if (files.length >= 2) {
    dz.style.display = 'none'
    optionsRow.style.display = 'flex'
    actionRow.classList.add('on')
    statusText.textContent = `${files.length} images selected. Choose direction and merge.`
  } else if (files.length === 1) {
    dz.style.display = 'none'
    optionsRow.style.display = 'none'
    actionRow.classList.remove('on')
    statusText.textContent = 'Add at least 2 images to merge.'
  } else {
    dz.style.display = ''
    optionsRow.style.display = 'none'
    actionRow.classList.remove('on')
    statusText.textContent = ''
  }
  // Revoke previous result when UI resets
  if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null }
  previewWrap.style.display = 'none'
  dlRow.style.display = 'none'
}

function renderCards() {
  fileGrid.innerHTML = ''
  files.forEach((entry, i) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    const imgWrap = document.createElement('div')
    imgWrap.className = 'card-img-wrap'
    const img = document.createElement('img')
    const url = URL.createObjectURL(entry.file)
    img.src = url
    img.onload = () => URL.revokeObjectURL(url)
    imgWrap.appendChild(img)
    const order = document.createElement('div')
    order.className = 'card-order'
    order.textContent = i + 1
    const fname = document.createElement('div')
    fname.className = 'card-fname'
    fname.textContent = entry.file.name
    const rmBtn = document.createElement('button')
    rmBtn.className = 'card-rm'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => { files.splice(i, 1); renderCards(); updateUI() })
    card.append(imgWrap, order, fname, rmBtn)
    fileGrid.appendChild(card)
  })
}

function getTotalBytes() {
  return files.reduce((sum, e) => sum + e.file.size, 0)
}

function addFiles(newFiles) {
  let skipped = 0
  Array.from(newFiles).forEach(file => {
    if (!file.type.startsWith('image/')) return
    if (files.length >= MAX_FILES) { skipped++; return }
    if (getTotalBytes() + file.size > MAX_TOTAL_BYTES) { skipped++; return }
    files.push({ file })
  })
  if (skipped > 0) {
    statusText.textContent = `${skipped} file(s) skipped. Limit: ${MAX_FILES} images, 200MB total.`
  }
  renderCards()
  updateUI()
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

mergeBtn.addEventListener('click', async () => {
  if (files.length < 2) return
  mergeBtn.disabled = true
  mergeBtn.textContent = mergeBtnLoadingLbl
  statusText.textContent = 'Merging...'

  try {
    const images = await Promise.all(files.map(f => loadImage(f.file)))
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const mime = formatSelect.value

    if (direction === 'horizontal') {
      const maxH = Math.max(...images.map(img => img.naturalHeight))
      const totalW = images.reduce((sum, img) => {
        const scale = maxH / img.naturalHeight
        return sum + Math.round(img.naturalWidth * scale)
      }, 0)
      canvas.width = totalW
      canvas.height = maxH
      if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, totalW, maxH) }
      let x = 0
      for (const img of images) {
        const scale = maxH / img.naturalHeight
        const w = Math.round(img.naturalWidth * scale)
        ctx.drawImage(img, x, 0, w, maxH)
        x += w
      }
    } else {
      const maxW = Math.max(...images.map(img => img.naturalWidth))
      const totalH = images.reduce((sum, img) => {
        const scale = maxW / img.naturalWidth
        return sum + Math.round(img.naturalHeight * scale)
      }, 0)
      canvas.width = maxW
      canvas.height = totalH
      if (mime === 'image/jpeg' || mime === 'application/pdf') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, maxW, totalH) }
      let y = 0
      for (const img of images) {
        const scale = maxW / img.naturalWidth
        const h = Math.round(img.naturalHeight * scale)
        ctx.drawImage(img, 0, y, maxW, h)
        y += h
      }
    }

    // Revoke previous result URL to free memory
    if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null }

    let url, ext
    if (mime === 'application/pdf') {
      const pxToMm = 25.4 / 96
      const wMm = canvas.width * pxToMm
      const hMm = canvas.height * pxToMm
      const orientation = wMm >= hMm ? 'l' : 'p'
      const pdf = new jsPDF({ orientation, unit: 'mm', format: [wMm, hMm] })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      pdf.addImage(imgData, 'JPEG', 0, 0, wMm, hMm)
      const blob = pdf.output('blob')
      url = URL.createObjectURL(blob)
      ext = 'pdf'
    } else {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, 0.92))
      url = URL.createObjectURL(blob)
      ext = mime === 'image/png' ? 'png' : 'jpg'
    }

    lastBlobUrl = url
    previewImg.src = mime === 'application/pdf' ? canvas.toDataURL('image/png') : url
    previewWrap.style.display = 'block'
    dlLink.href = url
    dlLink.download = `merged-image.${ext}`
    dlLink.onclick = () => setTimeout(() => { URL.revokeObjectURL(url); lastBlobUrl = null }, 10000)
    dlRow.style.display = 'block'
    statusText.textContent = 'Merge complete! Preview below.'
    buildNextSteps()
  } catch (e) {
    statusText.textContent = 'Merge failed: ' + e.message
  }

  mergeBtn.disabled = false
  mergeBtn.textContent = mergeBtnLbl
})

function buildNextSteps() {
  const buttons = []
  buttons.push({ label: t.nav_short?.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: t.nav_short?.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: t.nav_short?.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') })
  buttons.push({ label: t.nav_short?.['jpg-to-pdf'] || 'JPG to PDF', href: localHref('jpg-to-pdf') })
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', () => { window.location.href = b.href })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })

const dropZone = document.getElementById('dropZone')
dropZone.addEventListener('click', () => fileInput.click())
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

;(function injectSEO() {
  const seo = t.seo && t.seo['merge-images']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()