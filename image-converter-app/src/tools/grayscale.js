import { injectHeader } from '../core/header.js'
// JSZip loaded dynamically
import { getT } from '../core/i18n.js'

const t = getT()
const toolName  = (t.nav_short && t.nav_short['grayscale']) || 'Black & White'
const seoData   = t.seo && t.seo['grayscale']
const descText  = seoData ? seoData.h2a : 'Convert image to grayscale (black & white) free. Files never leave your device.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'
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
    .opt-btn { width:100%; padding:13px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; margin-bottom:10px; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .upload-label { display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; }
    #fileGrid { display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:12px; margin-bottom:20px; }
    .file-card { background:#fff; border-radius:10px; border:1.5px solid #E8E0D5; overflow:hidden; position:relative; }
    .file-card .card-imgs { display:grid; grid-template-columns:1fr 1fr; }
    .file-card .card-imgs img,
    .file-card .card-imgs canvas { width:100%; height:80px; object-fit:cover; display:block; }
    .file-card .card-footer { padding:6px 8px; display:flex; align-items:center; justify-content:space-between; }
    .file-card .card-name { font-size:11px; color:#5A4A3A; font-family:'DM Sans',sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100px; }
    .file-card .remove-btn { background:none; border:none; cursor:pointer; color:#C4B8A8; font-size:14px; line-height:1; padding:2px 4px; }
    .file-card .remove-btn:hover { color:#C84B31; }
    .file-card .card-label { font-size:9px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.06em; padding:3px 6px; font-family:'DM Sans',sans-serif; background:#F5F0E8; }
    .count-badge { display:inline-block; background:#FDE8E3; color:#C84B31; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; font-family:'DM Sans',sans-serif; margin-left:10px; }
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
}

document.title = `${toolName} / Grayscale Free | No Upload — RelahConvert`
document.querySelector('#app').innerHTML = `
  <div style="max-width:900px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px; color:#9A8A7A;">${dropHint} — up to 25 files</span>
      <span class="count-badge" id="countBadge" style="display:none;">0 images</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    <div id="fileGrid"></div>
    <button class="opt-btn" id="applyBtn" disabled>${dlBtn}</button>
    <div id="zipWrap" style="display:none; margin-top:10px;">
      <a id="zipBtn" class="opt-btn" style="display:block; text-align:center; text-decoration:none; background:#2C1810; color:#F5F0E8;">⬇ ${dlZipBtn}</a>
      <p id="zipNote" style="font-size:12px; color:#9A8A7A; text-align:center; margin:8px 0 0; font-family:'DM Sans',sans-serif;"></p>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const fileGrid   = document.getElementById('fileGrid')
const applyBtn   = document.getElementById('applyBtn')
const countBadge = document.getElementById('countBadge')
const zipWrap    = document.getElementById('zipWrap')

let files = []

function applyGrayscale(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    data[i] = gray; data[i + 1] = gray; data[i + 2] = gray
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

function updateCountBadge() {
  if (files.length === 0) {
    countBadge.style.display = 'none'
  } else {
    countBadge.style.display = 'inline-block'
    countBadge.textContent = `${files.length} image${files.length > 1 ? 's' : ''}`
  }
  applyBtn.disabled = files.length === 0
  applyBtn.textContent = files.length > 1 ? `${dlBtn} (${files.length})` : dlBtn
}

function renderGrid() {
  fileGrid.innerHTML = ''
  files.forEach((item, idx) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    card.innerHTML = `
      <div class="card-imgs">
        <div>
          <div class="card-label">Original</div>
          <img src="${item.originalUrl}" onload="URL.revokeObjectURL(this.src)" />
        </div>
        <div>
          <div class="card-label">B&W</div>
        </div>
      </div>
      <div class="card-footer">
        <span class="card-name">${item.file.name}</span>
        <button class="remove-btn" data-idx="${idx}">✕</button>
      </div>
    `
    const secondCell = card.querySelector('.card-imgs > div:nth-child(2)')
    secondCell.appendChild(item.grayCanvas)
    card.querySelector('.remove-btn').addEventListener('click', () => {
      files.splice(idx, 1)
      renderGrid()
      updateCountBadge()
      zipWrap.style.display = 'none'
    })
    fileGrid.appendChild(card)
  })
}

function loadFiles(newFiles) {
  const remaining = 25 - files.length
  const toAdd = Array.from(newFiles).filter(f => f.type.startsWith('image/')).slice(0, remaining)
  if (toAdd.length === 0) return
  let loaded = 0
  toAdd.forEach(file => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const grayCanvas = applyGrayscale(img)
      URL.revokeObjectURL(url)
      grayCanvas.style.cssText = 'width:100%; height:80px; object-fit:cover; display:block;'
      files.push({ file, originalUrl: URL.createObjectURL(file), grayCanvas })
      loaded++
      if (loaded === toAdd.length) {
        renderGrid()
        updateCountBadge()
        zipWrap.style.display = 'none'
      }
    }
    img.src = url
  })
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) loadFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) loadFiles(e.dataTransfer.files) })

applyBtn.addEventListener('click', async () => {
  if (files.length === 0) return
  applyBtn.disabled = true
  applyBtn.textContent = 'Processing...'
  zipWrap.style.display = 'none'

  if (files.length === 1) {
    const item = files[0]
    const img = new Image()
    const srcUrl = URL.createObjectURL(item.file)
    img.onload = () => {
      URL.revokeObjectURL(srcUrl)
      const canvas = applyGrayscale(img)
      const mime = item.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const ext  = mime === 'image/png' ? 'png' : 'jpg'
      const baseName = item.file.name.replace(/\.[^.]+$/, '')
      canvas.toBlob(blob => {
        const a = document.createElement('a')
        const url = URL.createObjectURL(blob)
        a.href = url
        a.download = `grayscale-${baseName}.${ext}`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 10000)
        applyBtn.disabled = false
        applyBtn.textContent = dlBtn
      }, mime, 0.92)
    }
    img.src = srcUrl
    return
  }

  if (!window.JSZip) {
    await new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      s.onload = res; s.onerror = rej
      document.head.appendChild(s)
    })
  }

  const zip = new window.JSZip()
  let done = 0
  files.forEach(item => {
    const img = new Image()
    const srcUrl = URL.createObjectURL(item.file)
    img.onload = () => {
      URL.revokeObjectURL(srcUrl)
      const canvas = applyGrayscale(img)
      const mime = item.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const ext  = mime === 'image/png' ? 'png' : 'jpg'
      const baseName = item.file.name.replace(/\.[^.]+$/, '')
      canvas.toBlob(blob => {
        zip.file(`grayscale-${baseName}.${ext}`, blob)
        done++
        if (done === files.length) {
          zip.generateAsync({ type: 'blob', compression: 'STORE' }).then(zipBlob => {
            const url = URL.createObjectURL(zipBlob)
            const zipBtn = document.getElementById('zipBtn')
            zipBtn.href = url
            zipBtn.download = 'grayscale-images.zip'
            zipBtn.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
            const totalKB = Math.round(zipBlob.size / 1024)
            document.getElementById('zipNote').textContent = `${files.length} images — ${totalKB} KB total`
            zipWrap.style.display = 'block'
            applyBtn.disabled = false
            applyBtn.textContent = `${dlBtn} (${files.length})`
          })
        }
      }, mime, 0.92)
    }
    img.src = srcUrl
  })
})

;(function injectSEO() {
  const seo = t.seo && t.seo['grayscale']
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