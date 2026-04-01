import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('image-to-ico')

const t = getT()

const bg = 'var(--bg-page)'
const toolName  = (t.nav_short && t.nav_short['image-to-ico']) || 'Image to ICO'
const seoData   = t.seo && t.seo['image-to-ico']
const descText  = seoData ? seoData.h2a : 'Convert any image to ICO favicon free. Batch process multiple images. No upload.'
const selectLbl = t.select_images || 'Select Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'

if (document.head) {
  document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #app>div{animation:fadeUp 0.4s ease both}
    .opt-btn{width:100%;padding:13px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
    .opt-btn:hover{background:var(--accent-hover);transform:translateY(-1px);}
    .opt-btn:disabled{background:var(--btn-disabled);cursor:not-allowed;opacity:0.7;transform:none;}
    .download-btn{display:none;width:100%;box-sizing:border-box;text-align:center;padding:13px;border-radius:10px;background:var(--btn-dark);text-decoration:none;color:var(--text-on-dark-btn);font-family:'Fraunces',serif;font-weight:700;font-size:15px;margin-bottom:10px;}
    .download-btn:hover{background:var(--btn-dark-hover);}
    .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;}
    .size-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
    .size-btn{padding:8px 14px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:13px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;transition:all 0.15s;}
    .size-btn.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent);}
    .custom-size-input{width:60px;padding:8px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-surface);text-align:center;outline:none;}
    .custom-size-input:focus{border-color:var(--accent);}
    .ico-preview{background-image:linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%);background-size:12px 12px;border-radius:8px;display:inline-block;padding:8px;}
    .preview-grid{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;}
    .preview-card{background:var(--bg-card);border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);position:relative;width:100px;cursor:pointer;border:2px solid transparent;transition:border-color 0.15s;}
    .preview-card.active{border-color:var(--accent);}
    .preview-card img{width:100%;height:80px;object-fit:cover;display:block;}
    .preview-card .fname{font-size:10px;color:var(--text-tertiary);padding:4px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .preview-card .remove-btn{position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
    .preview-card .remove-btn:hover{background:var(--accent);}
    .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px;}
    .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px;}
    .seo-section ol{padding-left:20px;margin:0 0 12px;}
    .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px;}
    .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px;}
    .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
    .seo-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-primary);text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
    .seo-link:hover{border-color:var(--accent);color:var(--accent);}
    .seo-section .faq-item{background:var(--bg-card);border-radius:12px;padding:18px 20px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
    .seo-section .faq-item h4{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:0 0 6px;}
    .seo-section .faq-item p{margin:0;}
  `
  document.head.appendChild(style)
}

document.title = `${toolName} Converter Free | No Upload — RelahConvert`
const _tp = toolName.split(' '); const titlePart1 = _tp[0]; const titlePart2 = _tp.slice(1).join(' ')
const SIZES = [16, 32, 48, 64, 128, 256]
let selectedSize = 32
let files = []
let activeFileIndex = 0

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
    <div id="previewGrid" class="preview-grid" style="display:none;"></div>
    <div id="sizeArea" style="display:none;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">ICO SIZE</div>
      <div class="size-grid" id="sizeGrid">
        ${SIZES.map(s => `<button class="size-btn${s===selectedSize?' active':''}" data-size="${s}">${s}×${s}</button>`).join('')}
        <div style="display:flex;align-items:center;gap:6px;">
          <input type="number" class="custom-size-input" id="customSize" min="1" max="512" placeholder="Custom" />
          <span style="font-size:12px;color:var(--text-tertiary);">px</span>
        </div>
      </div>
      <div id="icoPreview" style="margin-top:10px;"></div>
    </div>
    <button class="opt-btn" id="convertBtn" disabled>${t.convert_to_ico || 'Convert to ICO'}</button>
    <a class="download-btn" id="downloadLink">${dlBtn}</a>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const previewGrid  = document.getElementById('previewGrid')
const sizeArea     = document.getElementById('sizeArea')
const convertBtn   = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const icoPreview   = document.getElementById('icoPreview')
const customSize   = document.getElementById('customSize')

// Size selection — single select
document.getElementById('sizeGrid').addEventListener('click', e => {
  const btn = e.target.closest('.size-btn')
  if (!btn) return
  selectedSize = parseInt(btn.dataset.size)
  customSize.value = ''
  document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.size) === selectedSize))
  renderIcoPreview()
})

customSize.addEventListener('input', () => {
  const v = parseInt(customSize.value)
  if (v >= 1 && v <= 512) {
    selectedSize = v
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'))
    renderIcoPreview()
  }
})

function renderIcoPreview() {
  if (!files.length || !files[activeFileIndex]) { icoPreview.innerHTML = ''; return }
  const entry = files[activeFileIndex]
  if (!entry.img) { icoPreview.innerHTML = ''; return }
  const s = selectedSize
  const c = document.createElement('canvas')
  c.width = s; c.height = s
  c.getContext('2d').drawImage(entry.img, 0, 0, s, s)
  const displaySize = Math.min(s, 128)
  icoPreview.innerHTML = `<div class="ico-preview"><img src="${c.toDataURL()}" width="${displaySize}" height="${displaySize}" style="display:block;image-rendering:${s <= 64 ? 'pixelated' : 'auto'};" /></div><div style="font-size:11px;color:var(--text-tertiary);margin-top:4px;">${entry.file.name} — ${s}×${s}px</div>`
}

function addFiles(newFiles) {
  const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'))
  arr.forEach(f => {
    const url = URL.createObjectURL(f)
    const entry = { file: f, url, img: null }
    const img = new Image()
    img.onload = () => {
      entry.img = img
      if (files.length === 1) renderIcoPreview()
    }
    img.src = url
    files.push(entry)
  })
  renderPreviews()
  sizeArea.style.display = 'block'
  convertBtn.disabled = false
  downloadLink.style.display = 'none'
}

function renderPreviews() {
  if (!files.length) { previewGrid.style.display = 'none'; return }
  previewGrid.style.display = 'flex'
  previewGrid.innerHTML = files.map((f, i) => `
    <div class="preview-card${i === activeFileIndex ? ' active' : ''}" data-file-index="${i}">
      <img src="${f.url}" alt="" />
      <button class="remove-btn" data-index="${i}">×</button>
      <div class="fname">${f.file.name}</div>
    </div>
  `).join('') + `<label for="fileInput" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100px;height:110px;border:2px dashed #CCC;border-radius:10px;cursor:pointer;color:#999;font-size:13px;gap:4px;"><span style="font-size:24px;">+</span><span>Add more</span></label>`

  // Click to select image for preview
  previewGrid.querySelectorAll('.preview-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.remove-btn')) return
      activeFileIndex = parseInt(card.dataset.fileIndex)
      previewGrid.querySelectorAll('.preview-card').forEach(c => c.classList.toggle('active', parseInt(c.dataset.fileIndex) === activeFileIndex))
      renderIcoPreview()
    })
  })

  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index)
      URL.revokeObjectURL(files[idx].url)
      files.splice(idx, 1)
      if (activeFileIndex >= files.length) activeFileIndex = Math.max(0, files.length - 1)
      renderPreviews()
      renderIcoPreview()
      if (!files.length) { sizeArea.style.display = 'none'; convertBtn.disabled = true; downloadLink.style.display = 'none' }
    })
  })
}

fileInput.addEventListener('change', () => { if (fileInput.files.length) addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) })

function buildIco(canvases) {
  const NUM = canvases.length
  const HEADER = 6, DIR_ENTRY = 16
  const dirOffset = HEADER + NUM * DIR_ENTRY
  const imageDataList = canvases.map(c => {
    const dataUrl = c.toDataURL('image/png')
    const b64 = dataUrl.split(',')[1]
    const bin = atob(b64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return arr
  })
  const totalSize = dirOffset + imageDataList.reduce((a, d) => a + d.length, 0)
  const buf = new ArrayBuffer(totalSize)
  const view = new DataView(buf)
  view.setUint16(0, 0, true); view.setUint16(2, 1, true); view.setUint16(4, NUM, true)
  let off = HEADER, imgOff = dirOffset
  for (let i = 0; i < NUM; i++) {
    const s = canvases[i].width
    view.setUint8(off, s >= 256 ? 0 : s); view.setUint8(off+1, s >= 256 ? 0 : s)
    view.setUint8(off+2, 0); view.setUint8(off+3, 0)
    view.setUint16(off+4, 1, true); view.setUint16(off+6, 32, true)
    view.setUint32(off+8, imageDataList[i].length, true); view.setUint32(off+12, imgOff, true)
    imgOff += imageDataList[i].length; off += DIR_ENTRY
  }
  let writeOff = dirOffset
  const uint8 = new Uint8Array(buf)
  for (const data of imageDataList) { uint8.set(data, writeOff); writeOff += data.length }
  return new Blob([buf], { type: 'image/x-icon' })
}

convertBtn.addEventListener('click', async () => {
  if (!files.length) return
  convertBtn.disabled = true
  convertBtn.textContent = 'Converting...'

  const s = selectedSize
  const results = []

  for (const entry of files) {
    // Wait for image to load if not ready
    if (!entry.img) {
      await new Promise(resolve => {
        const check = setInterval(() => { if (entry.img) { clearInterval(check); resolve() } }, 100)
      })
    }
    const c = document.createElement('canvas')
    c.width = s; c.height = s
    c.getContext('2d').drawImage(entry.img, 0, 0, s, s)
    const blob = buildIco([c])
    const name = entry.file.name.replace(/\.[^.]+$/, '') + '.ico'
    results.push({ blob, name })
  }

  if (results.length === 1) {
    const url = URL.createObjectURL(results[0].blob)
    downloadLink.href = url
    downloadLink.download = results[0].name
    downloadLink.textContent = `${dlBtn} ${results[0].name} (${s}×${s}px)`
    downloadLink.style.display = 'block'
    if (window.showReviewPrompt) window.showReviewPrompt()
    downloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
  } else {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    results.forEach(r => zip.file(r.name, r.blob))
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
    const url = URL.createObjectURL(zipBlob)
    downloadLink.href = url
    downloadLink.download = 'ico-files.zip'
    downloadLink.textContent = `${dlZipBtn} (${results.length} files, ${s}×${s}px)`
    downloadLink.style.display = 'block'
    if (window.showReviewPrompt) window.showReviewPrompt()
    downloadLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  convertBtn.disabled = false
  convertBtn.textContent = t.convert_to_ico || 'Convert to ICO'
})

;(function injectSEO() {
  const seo = t.seo && t.seo['image-to-ico']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
