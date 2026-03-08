import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const bg = '#F2F2F2'

const toolName  = (t.nav_short && t.nav_short['jpg-to-svg']) || 'JPG to SVG'
const seoData   = t.seo && t.seo['jpg-to-svg']
const descText  = seoData ? seoData.h2a : 'Convert JPG or PNG to SVG free. No upload. Files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlBtn     = t.download || 'Download'

if (document.head) {
  document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #app>div{animation:fadeUp 0.4s ease both}
    .opt-btn{width:100%;padding:13px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
    .opt-btn:hover{background:#A63D26;transform:translateY(-1px);}
    .opt-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none;}
    .download-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:#2C1810;text-decoration:none;color:#F5F0E8;font-family:'Fraunces',serif;font-weight:700;font-size:15px;margin-bottom:10px;}
    .download-btn:hover{background:#1a0f09;}
    .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;}
    .preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
    .preview-box{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:hidden;padding:12px;text-align:center;}
    .preview-box img,.preview-box svg{max-width:100%;max-height:260px;display:block;margin:0 auto;border-radius:6px;}
    .preview-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;font-family:'DM Sans',sans-serif;}
    .ctrl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;}
    .ctrl-label{font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;}
    .ctrl-range{width:140px;accent-color:#C84B31;}
    .mode-btns{display:flex;gap:8px;margin-bottom:14px;}
    .mode-btn{flex:1;padding:9px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:13px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;transition:all 0.15s;}
    .mode-btn.active{border-color:#C84B31;background:#FDE8E3;color:#C84B31;}
    .notice{font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif;margin-bottom:12px;padding:10px;background:#fff;border-radius:8px;border:1.5px solid #E8E0D5;}
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
    @media(max-width:560px){.preview-grid{grid-template-columns:1fr;}}
  `
  document.head.appendChild(style)
}

document.title = `${toolName} Converter Free | No Upload — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">JPG <em style="font-style:italic;color:#C84B31;">to SVG</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0;">${descText}</p>
    </div>
    <div class="notice">ℹ️ This tool embeds your image inside an SVG wrapper — making it infinitely scalable. For full vector tracing, use a dedicated app like Inkscape.</div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" style="display:none;" />
    <div id="previewArea" style="display:none;margin-bottom:16px;">
      <div class="preview-grid">
        <div class="preview-box">
          <div class="preview-label">Original</div>
          <img id="originalImg" src="" alt="original" />
        </div>
        <div class="preview-box">
          <div class="preview-label">SVG Preview</div>
          <div id="svgPreview"></div>
        </div>
      </div>
      <div class="ctrl-row">
        <span class="ctrl-label">SVG Width (px)</span>
        <input type="number" id="svgWidth" value="800" min="100" max="4000" style="width:90px;padding:6px 10px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;outline:none;" />
      </div>
    </div>
    <button class="opt-btn" id="convertBtn" disabled>Convert to SVG</button>
    <a class="download-btn" id="downloadLink">${dlBtn}</a>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const previewArea  = document.getElementById('previewArea')
const originalImg  = document.getElementById('originalImg')
const svgPreview   = document.getElementById('svgPreview')
const convertBtn   = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const svgWidthInp  = document.getElementById('svgWidth')

let loadedFile = null
let naturalW = 0, naturalH = 0

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  loadedFile = file
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    naturalW = img.naturalWidth
    naturalH = img.naturalHeight
    svgWidthInp.value = Math.min(naturalW, 800)
    originalImg.src = url
    // SVG preview using embedded image
    svgPreview.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${naturalW} ${naturalH}"><image href="${url}" width="${naturalW}" height="${naturalH}" /></svg>`
    previewArea.style.display = 'block'
    convertBtn.disabled = false
    downloadLink.style.display = 'none'
  }
  img.src = url
}

fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]) })

convertBtn.addEventListener('click', () => {
  if (!loadedFile) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const b64 = e.target.result
    const w = parseInt(svgWidthInp.value) || naturalW
    const h = Math.round((naturalH / naturalW) * w)
    const mime = loadedFile.type || 'image/jpeg'
    const svgStr = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image xlink:href="${b64}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>
</svg>`
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const baseName = loadedFile.name.replace(/\.[^.]+$/, '')
    downloadLink.href = url
    downloadLink.download = `${baseName}.svg`
    downloadLink.textContent = `${dlBtn} ${baseName}.svg (${Math.round(blob.size / 1024)} KB)`
    downloadLink.style.display = 'block'
  }
  reader.readAsDataURL(loadedFile)
})

// ── SEO Section ──────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo['jpg-to-svg']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const stepsHtml = seo.steps.map(s => `<li>${s}</li>`).join('')
  const faqsHtml  = seo.faqs.map(f => `<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')
  const linksHtml = seo.links.map(l => `<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')
  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${stepsHtml}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${faqsHtml}<h3>${alsoTry}</h3><div class="seo-links">${linksHtml}</div>`
  document.querySelector('#app').appendChild(div)
})()
// ─────────────────────────────────────────────────────────────────────────────