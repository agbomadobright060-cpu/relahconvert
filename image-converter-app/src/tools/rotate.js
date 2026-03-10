import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const toolName  = (t.nav_short && t.nav_short['rotate']) || 'Rotate Image'
const seoData   = t.seo && t.seo['rotate']
const descText  = seoData ? seoData.h2a : 'Rotate any image free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
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
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:visible;position:relative;padding-bottom:8px;}
  .card-img-wrap{position:relative;width:100%;height:130px;display:flex;align-items:center;justify-content:center;background:#F5F0E8;border-radius:10px 10px 0 0;overflow:hidden;}
  .card-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block;transition:transform 0.25s ease;}
  .card-rot-btn{position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;background:#C84B31;border:2px solid #fff;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(200,75,49,0.35);transition:background 0.15s;z-index:5;}
  .card-rot-btn:hover{background:#A63D26;}
  .card-fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:18px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}
  .card-angle{font-size:11px;font-weight:700;color:#C84B31;font-family:'DM Sans',sans-serif;text-align:center;min-height:16px;}
  .card-dl{display:none;font-size:11px;font-weight:700;color:#2C1810;font-family:'DM Sans',sans-serif;padding:2px 8px 0;text-align:center;text-decoration:none;}
  .card-dl:hover{text-decoration:underline;color:#C84B31;}
  .card-rm{position:absolute;top:6px;right:6px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:6;}
  #actionRow{display:none;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #actionRow.on{display:flex;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;min-width:160px;}
  .action-btn:hover{background:#A63D26;}
  .action-btn.dark{background:#2C1810;}
  .action-btn.dark:hover{background:#1a0f09;}
  .action-btn:disabled{background:#C4B8A8;cursor:not-allowed;}
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
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic;color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 16px;">${descText}</p>
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
      <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    </div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="applyBtn">⬇ Download All</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const fileGrid   = document.getElementById('fileGrid')
const actionRow  = document.getElementById('actionRow')
const applyBtn   = document.getElementById('applyBtn')
const zipBtn     = document.getElementById('zipBtn')
const statusText = document.getElementById('statusText')

let files = []

// Unique filename helper to avoid ZIP collisions
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

function addFiles(newFiles) {
  Array.from(newFiles).forEach(file => {
    if (!file.type.startsWith('image/')) return
    const entry = { file, img: null, angle: 0, dlLink: null }
    const card = document.createElement('div')
    card.className = 'file-card'
    const imgWrap = document.createElement('div')
    imgWrap.className = 'card-img-wrap'
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    entry.img = img
    const rotBtn = document.createElement('button')
    rotBtn.className = 'card-rot-btn'
    rotBtn.title = 'Tap to rotate 90°'
    rotBtn.innerHTML = '↻'
    rotBtn.addEventListener('click', () => {
      entry.angle = (entry.angle + 90) % 360
      img.style.transform = `rotate(${entry.angle}deg)`
      angleLabel.textContent = entry.angle > 0 ? entry.angle + '°' : ''
      entry.dlLink.style.display = 'none'
    })
    imgWrap.append(img, rotBtn)
    const fname = document.createElement('div')
    fname.className = 'card-fname'
    fname.textContent = file.name
    const angleLabel = document.createElement('div')
    angleLabel.className = 'card-angle'
    const dlLink = document.createElement('a')
    dlLink.className = 'card-dl'
    dlLink.textContent = '⬇ Download'
    entry.dlLink = dlLink
    const rmBtn = document.createElement('button')
    rmBtn.className = 'card-rm'
    rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => {
      files = files.filter(f => f !== entry)
      card.remove()
      if (files.length === 0) { actionRow.classList.remove('on'); statusText.textContent = '' }
    })
    card.append(imgWrap, fname, angleLabel, dlLink, rmBtn)
    fileGrid.appendChild(card)
    files.push(entry)
  })
  if (files.length > 0) {
    actionRow.classList.add('on')
    zipBtn.style.display = 'none'
    statusText.textContent = 'Tap ↻ on each image to rotate individually, then download all.'
  }
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

function rotateToBlob(entry) {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => {
      const rad = (entry.angle * Math.PI) / 180
      const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad))
      const W = image.naturalWidth, H = image.naturalHeight
      const nW = Math.round(W * cos + H * sin)
      const nH = Math.round(W * sin + H * cos)
      const canvas = document.createElement('canvas')
      canvas.width = nW; canvas.height = nH
      const ctx = canvas.getContext('2d')
      ctx.translate(nW / 2, nH / 2)
      ctx.rotate(rad)
      ctx.drawImage(image, -W / 2, -H / 2)
      const mime = entry.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const ext  = mime === 'image/png' ? 'png' : 'jpg'
      canvas.toBlob(blob => resolve({ blob, mime, ext }), mime, 0.92)
    }
    image.src = URL.createObjectURL(entry.file)
  })
}

applyBtn.addEventListener('click', async () => {
  if (!files.length) return
  applyBtn.disabled = true
  statusText.textContent = 'Processing…'
  const results = []
  const usedNames = new Set()

  for (const entry of files) {
    const baseName = entry.file.name.replace(/\.[^.]+$/, '')
    if (entry.angle === 0) {
      const ext = entry.file.name.split('.').pop()
      const rawName = `${baseName}-rotated-0deg.${ext}`
      const safeName = makeUnique(usedNames, rawName)
      const url = URL.createObjectURL(entry.file)
      entry.dlLink.href = url
      entry.dlLink.download = safeName
      entry.dlLink.style.display = 'block'
      const ab = await entry.file.arrayBuffer()
      results.push({ name: safeName, blob: new Blob([ab], { type: entry.file.type }) })
    } else {
      const { blob, mime, ext } = await rotateToBlob(entry)
      const rawName = `${baseName}-rotated-${entry.angle}deg.${ext}`
      const safeName = makeUnique(usedNames, rawName)
      const url = URL.createObjectURL(blob)
      entry.dlLink.href = url
      entry.dlLink.download = safeName
      entry.dlLink.style.display = 'block'
      results.push({ name: safeName, blob })
    }
  }

  applyBtn.disabled = false
  statusText.textContent = files.length > 1 ? `${files.length} images ready.` : 'Image ready.'
  if (files.length > 1) { zipBtn.style.display = 'block'; zipBtn._results = results }
})

zipBtn.addEventListener('click', async () => {
  const results = zipBtn._results
  if (!results?.length) return
  zipBtn.textContent = 'Zipping…'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = 'rotated-images.zip'
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