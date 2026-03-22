import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('jpg-to-svg')

const t = getT()

const bg = '#F2F2F2'
const toolName  = (t.nav_short && t.nav_short['jpg-to-svg']) || 'JPG to SVG'
const seoData   = t.seo && t.seo['jpg-to-svg']
const descText  = seoData ? seoData.h2a : 'Convert JPG or PNG to SVG free. No upload. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:#A63D26;}
  .notice{font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif;margin-bottom:14px;padding:10px;background:#fff;border-radius:8px;border:1.5px solid #E8E0D5;}
  #widthRow{display:none;align-items:center;gap:12px;margin-bottom:14px;background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;padding:12px 16px;}
  #widthRow.on{display:flex;}
  #widthRow label{font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #svgWidth{width:90px;padding:6px 10px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;outline:none;}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px;}
  .file-card{background:#fff;border-radius:10px;border:1.5px solid #E8E0D5;overflow:hidden;position:relative;}
  .file-card img{width:100%;height:110px;object-fit:contain;display:block;background:#F5F0E8;}
  .file-card .fname{font-size:11px;color:#5A4A3A;font-family:'DM Sans',sans-serif;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-card .dl-link{display:none;font-size:11px;font-weight:700;color:#C84B31;font-family:'DM Sans',sans-serif;padding:0 8px 7px;text-decoration:none;}
  .file-card .dl-link:hover{text-decoration:underline;}
  .file-card .rm-btn{position:absolute;top:5px;right:5px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.45);border:none;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
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
  
  
  
  
  .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
  .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .seo-link:hover{border-color:#C84B31;color:#C84B31;}
    .seo-section .faq-item { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
`
document.head.appendChild(style)
document.title = `${toolName} Converter Free | No Upload — RelahConvert`
const _tp = toolName.split(' '); const titlePart1 = _tp[0]; const titlePart2 = _tp.slice(1).join(' ')
document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:#C84B31;">${titlePart2}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0 0 14px;">${descText}</p>
    </div>
    <div class="notice">ℹ️ ${t.svg_notice || 'This tool embeds your image inside an SVG wrapper — making it infinitely scalable. For full vector tracing, use a dedicated app like Inkscape.'}</div>
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    <div id="widthRow">
      <label>SVG output width (px):</label>
      <input type="number" id="svgWidth" value="800" min="100" max="4000" />
      <span style="font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif;">Height scales proportionally</span>
    </div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="convertBtn">Convert to SVG</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
  </div>
`

injectHeader()

const fileInput   = document.getElementById('fileInput')
const widthRow    = document.getElementById('widthRow')
const fileGrid    = document.getElementById('fileGrid')
const actionRow   = document.getElementById('actionRow')
const convertBtn  = document.getElementById('convertBtn')
const zipBtn      = document.getElementById('zipBtn')
const svgWidthInp = document.getElementById('svgWidth')
const statusText  = document.getElementById('statusText')

let files = []

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
    const card = document.createElement('div')
    card.className = 'file-card'
    const img = document.createElement('img')
    const _purl = URL.createObjectURL(file)
    img.onload = () => URL.revokeObjectURL(_purl)
    img.src = _purl
    const fname = document.createElement('div')
    fname.className = 'fname'; fname.textContent = file.name
    const dlLink = document.createElement('a')
    dlLink.className = 'dl-link'; dlLink.textContent = '⬇ Download SVG'
    const rmBtn = document.createElement('button')
    rmBtn.className = 'rm-btn'; rmBtn.textContent = '×'
    rmBtn.addEventListener('click', () => {
      const idx = files.findIndex(f => f.card === card)
      if (idx !== -1) files.splice(idx, 1)
      card.remove()
      if (files.length === 0) { widthRow.classList.remove('on'); actionRow.classList.remove('on'); statusText.textContent = '' }
    })
    card.append(img, fname, dlLink, rmBtn)
    fileGrid.appendChild(card)
    const tmpImg = new Image()
    tmpImg.onload = () => { files.push({ file, card, dlLink, naturalW: tmpImg.naturalWidth, naturalH: tmpImg.naturalHeight }) }
    tmpImg.src = img.src
  })
  widthRow.classList.add('on'); actionRow.classList.add('on')
  zipBtn.style.display = 'none'; statusText.textContent = ''
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

function fileToSVGBlob(f) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = e.target.result
      const w = parseInt(svgWidthInp.value) || f.naturalW
      const h = Math.round((f.naturalH / f.naturalW) * w)
      const svgStr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image xlink:href="${b64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
</svg>`
      resolve(new Blob([svgStr], { type: 'image/svg+xml' }))
    }
    reader.readAsDataURL(f.file)
  })
}

convertBtn.addEventListener('click', async () => {
  if (!files.length) return
  convertBtn.disabled = true; statusText.textContent = 'Converting…'
  const results = []
  const usedNames = new Set()
  for (const f of files) {
    const blob = await fileToSVGBlob(f)
    const rawName = f.file.name.replace(/\.[^.]+$/, '') + '.svg'
    const safeName = makeUnique(usedNames, rawName)
    const url = URL.createObjectURL(blob)
    f.dlLink.href = url; f.dlLink.download = safeName; f.dlLink.style.display = 'block'; f.dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
    results.push({ name: safeName, blob })
  }
  convertBtn.disabled = false
  statusText.textContent = files.length > 1 ? `${files.length} SVGs ready.` : 'SVG ready.'
  if (files.length > 1) { zipBtn.style.display = 'block'; zipBtn._results = results }
})

zipBtn.addEventListener('click', async () => {
  const results = zipBtn._results
  if (!results || !results.length) return
  zipBtn.textContent = 'Zipping…'; zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of results) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob); a.download = 'svg-files.zip'; a.click();if(window.showReviewPrompt)window.showReviewPrompt(); setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  } catch(e) { alert('ZIP failed: ' + e.message) }
  zipBtn.textContent = dlZipBtn; zipBtn.disabled = false
})

;(function injectSEO() {
  const seo = t.seo && t.seo['jpg-to-svg']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()