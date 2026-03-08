import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const toolName  = (t.nav_short && t.nav_short['rotate']) || 'Rotate Image'
const seoData   = t.seo && t.seo['rotate']
const descText  = seoData ? seoData.h2a : 'Rotate any image free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = '#F2F2F2'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}
  .opt-btn{padding:10px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;}
  .opt-btn:hover{background:#A63D26;transform:translateY(-1px);}
  .opt-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none;}
  .opt-btn.sec{background:#fff;color:#2C1810;border:1.5px solid #DDD5C8;}
  .opt-btn.sec:hover{border-color:#C84B31;color:#C84B31;background:#fff;}

  /* Controls bar */
  #ctrlBar{display:none;background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;padding:14px 16px;margin-bottom:14px;display:none;align-items:center;gap:10px;flex-wrap:wrap;}
  #ctrlBar.on{display:flex;}
  .rot-btn{padding:8px 14px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
  .rot-btn:hover{border-color:#C84B31;color:#C84B31;}
  .angle-badge{background:#FDE8E3;color:#C84B31;font-weight:700;font-size:13px;padding:5px 14px;border-radius:20px;font-family:'DM Sans',sans-serif;}

  /* File grid */
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:10px;border:1.5px solid #E8E0D5;overflow:hidden;position:relative;}
  .file-card img{width:100%;height:110px;object-fit:contain;display:block;background:#F5F0E8;transition:transform 0.25s ease;}
  .file-card .fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-card .dl-link{display:none;font-size:11px;font-weight:700;color:#C84B31;font-family:'DM Sans',sans-serif;padding:0 8px 7px;text-decoration:none;}
  .file-card .dl-link:hover{text-decoration:underline;}
  .file-card .rm-btn{position:absolute;top:5px;right:5px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.45);border:none;color:#fff;font-size:12px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}

  /* Action row */
  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:#A63D26;}
  .action-btn.dark{background:#2C1810;}
  .action-btn.dark:hover{background:#1a0f09;}

  .status-text{font-size:13px;color:#7A6A5A;font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}

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
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>

    <div id="ctrlBar">
      <button class="rot-btn" id="rotL">↺ Left 90°</button>
      <button class="rot-btn" id="rotR">↻ Right 90°</button>
      <button class="rot-btn" id="rot180">↕ 180°</button>
      <span style="flex:1"></span>
      <span class="angle-badge" id="angleBadge">0°</span>
    </div>

    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>

    <div id="actionRow">
      <button class="action-btn" id="applyBtn">Rotate &amp; Download All</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const ctrlBar    = document.getElementById('ctrlBar')
const fileGrid   = document.getElementById('fileGrid')
const actionRow  = document.getElementById('actionRow')
const applyBtn   = document.getElementById('applyBtn')
const zipBtn     = document.getElementById('zipBtn')
const angleBadge = document.getElementById('angleBadge')
const statusText = document.getElementById('statusText')

let angle = 0
let files = []   // { file, card, img, dlLink }

function setAngle(deg) {
  angle = ((deg % 360) + 360) % 360
  angleBadge.textContent = Math.round(angle) + '°'
  // Update all previews live
  files.forEach(f => {
    if (f.img) f.img.style.transform = `rotate(${angle}deg)`
  })
}

document.getElementById('rotL').addEventListener('click', () => setAngle(angle - 90))
document.getElementById('rotR').addEventListener('click', () => setAngle(angle + 90))
document.getElementById('rot180').addEventListener('click', () => setAngle(angle + 180))

function addFiles(newFiles) {
  Array.from(newFiles).forEach(file => {
    if (!file.type.startsWith('image/')) return
    const card = document.createElement('div')
    card.className = 'file-card'
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    img.style.transform = `rotate(${angle}deg)`
    const fname = document.createElement('div')
    fname.className = 'fname'
    fname.textContent = file.name
    const dlLink = document.createElement('a')
    dlLink.className = 'dl-link'
    dlLink.textContent = '⬇ Download'
    const rmBtn = document.createElement('button')
    rmBtn.className = 'rm-btn'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => {
      const idx = files.findIndex(f => f.card === card)
      if (idx !== -1) files.splice(idx, 1)
      card.remove()
      if (files.length === 0) { ctrlBar.classList.remove('on'); actionRow.classList.remove('on'); statusText.textContent = '' }
    })
    card.append(img, fname, dlLink, rmBtn)
    fileGrid.appendChild(card)
    files.push({ file, card, img, dlLink })
  })
  if (files.length > 0) {
    ctrlBar.classList.add('on')
    actionRow.classList.add('on')
    zipBtn.style.display = 'none'
    statusText.textContent = ''
  }
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

function rotateFileToBlob(file, angleDeg) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const rad = (angleDeg * Math.PI) / 180
      const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad))
      const W = img.naturalWidth, H = img.naturalHeight
      const nW = Math.round(W * cos + H * sin)
      const nH = Math.round(W * sin + H * cos)
      const canvas = document.createElement('canvas')
      canvas.width = nW; canvas.height = nH
      const ctx = canvas.getContext('2d')
      ctx.translate(nW / 2, nH / 2)
      ctx.rotate(rad)
      ctx.drawImage(img, -W / 2, -H / 2)
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(blob => resolve({ blob, mime }), mime, 0.92)
    }
    img.src = URL.createObjectURL(file)
  })
}

applyBtn.addEventListener('click', async () => {
  if (!files.length || angle === 0) return
  applyBtn.disabled = true
  statusText.textContent = 'Processing…'
  const results = []
  for (const f of files) {
    const { blob, mime } = await rotateFileToBlob(f.file, angle)
    const ext = mime === 'image/png' ? 'png' : 'jpg'
    const url = URL.createObjectURL(blob)
    const baseName = f.file.name.replace(/\.[^.]+$/, '')
    f.dlLink.href = url
    f.dlLink.download = `${baseName}-rotated-${Math.round(angle)}deg.${ext}`
    f.dlLink.style.display = 'block'
    results.push({ name: `${baseName}-rotated-${Math.round(angle)}deg.${ext}`, blob })
  }
  applyBtn.disabled = false
  statusText.textContent = files.length > 1 ? `${files.length} images rotated.` : 'Image rotated.'
  if (files.length > 1) zipBtn.style.display = 'block'
  // Store for zip
  zipBtn._results = results
})

zipBtn.addEventListener('click', async () => {
  const results = zipBtn._results
  if (!results || !results.length) return
  zipBtn.textContent = 'Zipping…'
  zipBtn.disabled = true
  try {
    const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default || window.JSZip
    const zip = new JSZip()
    for (const r of results) {
      const ab = await r.blob.arrayBuffer()
      zip.file(r.name, ab)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `rotated-images.zip`
    a.click()
  } catch(e) { alert('ZIP failed: ' + e.message) }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

;(function injectSEO() {
  const seo = t.seo && t.seo['rotate']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()