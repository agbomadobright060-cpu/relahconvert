import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const toolName  = (t.nav_short && t.nav_short['flip']) || 'Flip Image'
const seoData   = t.seo && t.seo['flip']
const descText  = seoData ? seoData.h2a : 'Flip any image horizontally or vertically. Files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')

const bg = '#F2F2F2'

if (document.head) {
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    .opt-btn { padding:11px 24px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .opt-btn.secondary { background:#fff; color:#2C1810; border:1.5px solid #DDD5C8; }
    .opt-btn.secondary:hover { border-color:#C84B31; color:#C84B31; background:#fff; }
    .opt-btn.active { background:#FDE8E3; color:#C84B31; border-color:#C84B31; }
    .download-btn { display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px; margin-top:12px; }
    .download-btn:hover { background:#1a0f09; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    #previewImg { max-width:100%; max-height:380px; display:block; border-radius:8px; margin:0 auto; transition:transform 0.2s ease; }
  `
  document.head.appendChild(style)
}

document.title = `${toolName} Free | No Upload — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="previewArea" style="display:none; margin-bottom:16px;">
      <div style="text-align:center; margin-bottom:16px;">
        <img id="previewImg" src="" alt="preview" />
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:12px;">
        <button class="opt-btn secondary" id="flipH">⇄ Flip Horizontal</button>
        <button class="opt-btn secondary" id="flipV">⇅ Flip Vertical</button>
      </div>
      <div style="text-align:center; font-size:12px; color:#9A8A7A; font-family:'DM Sans',sans-serif;" id="flipStatus">No flip applied</div>
    </div>
    <button class="opt-btn" id="applyBtn" disabled style="width:100%; margin-bottom:10px;">${dlBtn}</button>
    <a class="download-btn" id="downloadLink">${dlBtn}</a>
  </div>
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const previewArea = document.getElementById('previewArea')
const previewImg = document.getElementById('previewImg')
const applyBtn = document.getElementById('applyBtn')
const downloadLink = document.getElementById('downloadLink')
const flipStatus = document.getElementById('flipStatus')
const flipHBtn = document.getElementById('flipH')
const flipVBtn = document.getElementById('flipV')

let originalFile = null
let flippedH = false
let flippedV = false

function updatePreview() {
  const sx = flippedH ? -1 : 1
  const sy = flippedV ? -1 : 1
  previewImg.style.transform = `scale(${sx}, ${sy})`
  const states = []
  if (flippedH) states.push('Horizontal')
  if (flippedV) states.push('Vertical')
  flipStatus.textContent = states.length ? `Flipped: ${states.join(' + ')}` : 'No flip applied'
  flipHBtn.className = 'opt-btn secondary' + (flippedH ? ' active' : '')
  flipVBtn.className = 'opt-btn secondary' + (flippedV ? ' active' : '')
}

flipHBtn.addEventListener('click', () => { flippedH = !flippedH; updatePreview() })
flipVBtn.addEventListener('click', () => { flippedV = !flippedV; updatePreview() })

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  flippedH = false
  flippedV = false
  previewImg.style.transform = 'scale(1,1)'
  flipStatus.textContent = 'No flip applied'
  flipHBtn.className = 'opt-btn secondary'
  flipVBtn.className = 'opt-btn secondary'
  previewImg.src = URL.createObjectURL(file)
  previewArea.style.display = 'block'
  applyBtn.disabled = false
  downloadLink.style.display = 'none'
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

applyBtn.addEventListener('click', () => {
  if (!originalFile) return
  const img = previewImg
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.translate(flippedH ? canvas.width : 0, flippedV ? canvas.height : 0)
  ctx.scale(flippedH ? -1 : 1, flippedV ? -1 : 1)
  ctx.drawImage(img, 0, 0)

  const mime = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  const suffix = flippedH && flippedV ? 'hv' : flippedH ? 'horizontal' : flippedV ? 'vertical' : 'flipped'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    downloadLink.href = url
    downloadLink.download = `flipped-${suffix}.${ext}`
    downloadLink.textContent = `${dlBtn} (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }, mime, 0.92)
})

// ── SEO Section ──────────────────────────────────────────────────────────────
;(function injectSEO() {
  // t already defined at top of file
  const seo = t.seo && t.seo['flip']
  if (!seo) return
  const faqTitle = (t.seo_faq_title) || 'Frequently Asked Questions'
  const alsoTry  = (t.seo_also_try)  || 'Also Try'
  const style = document.createElement('style')
  style.textContent = `
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
  const stepsHtml = seo.steps.map(s => `<li>${s}</li>`).join('')
  const faqsHtml  = seo.faqs.map(f => `<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')
  const linksHtml = seo.links.map(l => `<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${stepsHtml}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${faqsHtml}<h3>${alsoTry}</h3><div class="seo-links">${linksHtml}</div>`
  document.querySelector('#app').appendChild(div)
})()
// ─────────────────────────────────────────────────────────────────────────────