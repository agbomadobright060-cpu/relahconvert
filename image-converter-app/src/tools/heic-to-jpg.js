import { injectHeader } from '../core/header.js'

import { getT, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('heic-to-jpg')

const t = getT()

const bg = '#F2F2F2'
const toolName  = (t.nav_short && t.nav_short['heic-to-jpg']) || 'HEIC to JPG'
const seoData   = t.seo && t.seo['heic-to-jpg']
const descText  = seoData ? seoData.h2a : 'Convert iPhone HEIC photos to JPG free. No upload. Files never leave your device.'
const selectLbl = t.select_images || 'Select HEIC Images'
const dropHint  = t.drop_hint || 'or drop images anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download ZIP'

if (document.head) {
  document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #app>div{animation:fadeUp 0.4s ease both}
    .opt-btn{width:100%;padding:13px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:15px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-bottom:10px;}
    .opt-btn:hover{background:#A63D26;transform:translateY(-1px);}
    .opt-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none;}
    .upload-label{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;}
    .file-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px;}
    .file-card{background:#fff;border-radius:10px;border:1.5px solid #E8E0D5;overflow:hidden;text-align:center;padding:10px;}
    .file-card img{width:100%;height:100px;object-fit:cover;border-radius:6px;display:block;margin-bottom:6px;}
    .file-card .name{font-size:11px;color:#7A6A5A;font-family:'DM Sans',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .file-card .status{font-size:11px;font-weight:600;color:#C84B31;font-family:'DM Sans',sans-serif;}
    .dl-list{margin-bottom:12px;}
    .dl-item{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#fff;border-radius:8px;margin-bottom:6px;border:1.5px solid #E8E0D5;}
    .dl-item a{font-size:13px;color:#C84B31;font-weight:600;text-decoration:none;font-family:'DM Sans',sans-serif;}
    .dl-item a:hover{text-decoration:underline;}
    .dl-item span{font-size:11px;color:#9A8A7A;font-family:'DM Sans',sans-serif;}
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
}

document.title = `${toolName} Converter Free | No Upload — RelahConvert`
const _tp = toolName.split(' '); const titlePart1 = _tp[0]; const titlePart2 = _tp.slice(1).join(' ')
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:#C84B31;">${titlePart2}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
      <span style="font-size:12px;color:#9A8A7A;margin-left:12px;">${dropHint} — ${t.up_to_25_files || 'up to 25 files'}</span>
    </div>
    <input type="file" id="fileInput" accept=".heic,.heif,image/heic,image/heif" multiple style="display:none;" />
    <div id="fileGrid" class="file-grid"></div>
    <button class="opt-btn" id="convertBtn" disabled>${t.next_to_jpg || 'Convert to JPG'}</button>
    <div id="singleDl" style="display:none;margin-bottom:10px;"></div>
    <div id="zipWrap" style="display:none;margin-bottom:10px;">
      <a id="zipBtn" class="opt-btn" style="display:block;text-align:center;text-decoration:none;background:#2C1810;color:#F5F0E8;">⬇ ${dlZipBtn}</a>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">What's Next?</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput  = document.getElementById('fileInput')
const fileGrid   = document.getElementById('fileGrid')
const convertBtn = document.getElementById('convertBtn')
const singleDl   = document.getElementById('singleDl')
const zipWrap    = document.getElementById('zipWrap')
const zipBtn     = document.getElementById('zipBtn')

let files = []
let results = []

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

async function loadHeic2any() {
  if (window.heic2any) return window.heic2any
  await new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js'
    s.onload = res; s.onerror = rej
    document.head.appendChild(s)
  })
  return window.heic2any
}

function renderGrid() {
  fileGrid.innerHTML = files.map((f, i) => `
    <div class="file-card" id="card-${i}">
      <div style="width:100%;height:100px;background:#F2F2F2;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4B8A8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      </div>
      <div class="name">${f.name}</div>
      <div class="status" id="status-${i}">Ready</div>
    </div>`).join('')
  convertBtn.disabled = files.length === 0
}

function addFiles(newFiles) {
  const allowed = [...newFiles].filter(f => /heic|heif/i.test(f.name) || /heic|heif/i.test(f.type))
  files = [...files, ...allowed].slice(0, 25)
  renderGrid()
}

fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); addFiles(e.dataTransfer.files) })

convertBtn.addEventListener('click', async () => {
  if (!files.length) return
  convertBtn.disabled = true
  results = []
  singleDl.style.display = 'none'; singleDl.innerHTML = ''
  zipWrap.style.display = 'none'
  document.getElementById('nextSteps').style.display = 'none'

  const heic2any = await loadHeic2any()
  const usedNames = new Set()

  for (let i = 0; i < files.length; i++) {
    const statusEl = document.getElementById(`status-${i}`)
    statusEl.textContent = 'Converting...'
    try {
      const blob = await heic2any({ blob: files[i], toType: 'image/jpeg', quality: 0.92 })
      const outBlob = Array.isArray(blob) ? blob[0] : blob
      const rawName = files[i].name.replace(/\.(heic|heif)$/i, '.jpg')
      const name = makeUnique(usedNames, rawName)
      const url = URL.createObjectURL(outBlob)
      results.push({ name, url, blob: outBlob, size: outBlob.size })
      statusEl.textContent = '✓ Done'; statusEl.style.color = '#2C8A4A'
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        const card = document.getElementById(`card-${i}`)
        if (card) {
          const previewUrl = URL.createObjectURL(outBlob)
          card.querySelector('div').innerHTML = `<img src="${previewUrl}" onload="URL.revokeObjectURL(this.src)" style="width:100%;height:100px;object-fit:cover;border-radius:6px;" />`
        }
      }
      img.src = url
    } catch (e) {
      statusEl.textContent = '✗ Failed'; statusEl.style.color = '#C84B31'
    }
  }

  if (results.length === 1) {
    // Single file — just a download button
    const r = results[0]
    singleDl.innerHTML = `<a href="${r.url}" download="${r.name}" onclick="setTimeout(()=>URL.revokeObjectURL(this.href),10000)" class="opt-btn" style="display:block;text-align:center;text-decoration:none;background:#2C1810;color:#F5F0E8;">⬇ ${dlBtn} (${Math.round(r.size / 1024)} KB)</a>`
    singleDl.style.display = 'block'
  } else if (results.length > 1) {
    // Multiple files — ZIP only
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
      const JSZip = mod.default || window.JSZip
      const zip = new JSZip()
      for (const r of results) zip.file(r.name, await r.blob.arrayBuffer())
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      const zipUrl = URL.createObjectURL(zipBlob)
      zipBtn.href = zipUrl
      zipBtn.download = 'heic-to-jpg.zip'
      zipBtn.textContent = `⬇ ${dlZipBtn} (${Math.round(zipBlob.size / 1024)} KB)`
      zipBtn.onclick = () => setTimeout(() => URL.revokeObjectURL(zipUrl), 10000)
      zipWrap.style.display = 'block'
    } catch(e) { console.warn('ZIP failed', e) }
  }

  buildNextSteps()
  convertBtn.disabled = false
})

// ── IDB helpers ───────────────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IDB open failed'))
  })
}
async function saveFilesToIDB(items) {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  store.clear()
  items.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
  return new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = reject })
}

// ── What's Next ───────────────────────────────────────────────────────────────
function buildNextSteps() {
  const buttons = [
    { label: 'Compress',     href: localHref('compress') },
    { label: 'Resize',       href: localHref('resize') },
    { label: 'Crop',         href: localHref('crop') },
    { label: 'Rotate',       href: localHref('rotate') },
    { label: 'Flip',         href: localHref('flip') },
    { label: 'Black & White', href: localHref('grayscale') },
    { label: 'Watermark',    href: localHref('watermark') },
    { label: 'Convert to PNG',  href: localHref('jpg-to-png') },
    { label: 'Convert to WebP', href: localHref('jpg-to-webp') },
  ]
  const container = document.getElementById('nextStepsButtons')
  container.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.textContent = b.label
    btn.style.cssText = 'padding:8px 16px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:13px;font-weight:500;color:#2C1810;background:#fff;cursor:pointer;font-family:\'DM Sans\',sans-serif;transition:all 0.15s;'
    btn.onmouseover = () => { btn.style.borderColor='#C84B31'; btn.style.color='#C84B31' }
    btn.onmouseout  = () => { btn.style.borderColor='#DDD5C8'; btn.style.color='#2C1810' }
    btn.addEventListener('click', async () => {
      if (results.length) {
        try {
          await saveFilesToIDB(results.map(r => ({ blob: r.blob, name: r.name, type: 'image/jpeg' })))
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch(e) {}
      }
      window.location.href = b.href
    })
    container.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

;(function injectSEO() {
  const seo = t.seo && t.seo['heic-to-jpg']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()