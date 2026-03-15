import { convertFile, convertFilesToZip } from './core/converter.js'
import { LIMITS, formatSize, fileKey, totalBytes } from './core/utils.js'
import { getCurrentTool } from './app/router.js'
import { injectHeader } from './core/header.js'
import { getT, getLang, translatedSlug as getTranslatedSlug } from './core/i18n.js'

const currentTool = getCurrentTool()
const bg = '#F2F2F2'
const t = getT()
const currentLang = getLang()
const slug = currentTool ? currentTool.slug : ''

function localHref(englishSlug) {
  if (currentLang === 'en') return '/' + englishSlug
  return '/' + currentLang + '/' + getTranslatedSlug(currentLang, englishSlug)
}

const nextStepsMap = {
  'image/png':  [{ href:localHref('compress'), label:t.next_compress },{ href:localHref('resize'), label:t.next_resize },{ href:localHref('crop'), label:t.nav_short?.crop||'Crop' },{ href:localHref('rotate'), label:t.nav_short?.rotate||'Rotate' },{ href:localHref('flip'), label:t.nav_short?.flip||'Flip' },{ href:localHref('grayscale'), label:t.nav_short?.grayscale||'Grayscale' },{ href:localHref('watermark'), label:t.nav_short?.watermark||'Watermark' }],
  'image/jpeg': [{ href:localHref('compress'), label:t.next_compress },{ href:localHref('resize'), label:t.next_resize },{ href:localHref('crop'), label:t.nav_short?.crop||'Crop' },{ href:localHref('rotate'), label:t.nav_short?.rotate||'Rotate' },{ href:localHref('flip'), label:t.nav_short?.flip||'Flip' },{ href:localHref('grayscale'), label:t.nav_short?.grayscale||'Grayscale' },{ href:localHref('watermark'), label:t.nav_short?.watermark||'Watermark' }],
  'image/webp': [{ href:localHref('compress'), label:t.next_compress },{ href:localHref('resize'), label:t.next_resize },{ href:localHref('crop'), label:t.nav_short?.crop||'Crop' },{ href:localHref('rotate'), label:t.nav_short?.rotate||'Rotate' },{ href:localHref('flip'), label:t.nav_short?.flip||'Flip' },{ href:localHref('grayscale'), label:t.nav_short?.grayscale||'Grayscale' },{ href:localHref('watermark'), label:t.nav_short?.watermark||'Watermark' }],
}

if (document.head) {
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:${bg};`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    #convertBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #convertBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    select:focus { border-color: #C84B31 !important; box-shadow: 0 0 0 3px rgba(200,75,49,0.12) !important; }
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .related-link { font-size:13px; color:#C84B31; text-decoration:none; font-weight:500; }
    .related-link:hover { text-decoration:underline; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; background:#fff; cursor:pointer; text-decoration:none; display:inline-block; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
    .seo-section { max-width:700px; margin:0 auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif; }
    .seo-section h2 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section h3 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section p { font-size:14px; color:#5A4A3A; line-height:1.8; margin:0 0 12px; }
    .seo-section ol { padding-left:20px; margin:0 0 12px; }
    .seo-section ol li { font-size:14px; color:#5A4A3A; line-height:1.8; margin-bottom:6px; }
    .seo-section .faq-item { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; font-size:14px; color:#5A4A3A; line-height:1.8; }
    .seo-section .internal-links { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
    .seo-section .internal-links a { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; transition:all 0.15s; }
    .seo-section .internal-links a:hover { border-color:#C84B31; color:#C84B31; }
    .seo-divider { border:none; border-top:1px solid #E8E0D5; margin:0 auto 40px; max-width:700px; }
  `
  document.head.appendChild(style)

  if (t.seo && t.seo[slug]) {
    const metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    const enSeo = { 'jpg-to-png':'Convert JPG to PNG free without uploading to a server. Browser-based JPG to PNG converter — your files never leave your device.','png-to-jpg':'Convert PNG to JPG free without uploading to a server. Browser-based PNG to JPG converter — your files never leave your device.','jpg-to-webp':'Convert JPG to WebP free without uploading to a server. Browser-based JPG to WebP converter — your files never leave your device.','webp-to-jpg':'Convert WebP to JPG free without uploading to a server. Browser-based WebP to JPG converter — your files never leave your device.','png-to-webp':'Convert PNG to WebP free without uploading to a server. Browser-based PNG to WebP converter — your files never leave your device.','webp-to-png':'Convert WebP to PNG free without uploading to a server. Browser-based WebP to PNG converter — your files never leave your device.' }
    metaDesc.content = enSeo[slug] || ''
    document.head.appendChild(metaDesc)
  }
}

function buildTitleHTML() {
  if (!currentTool) return 'Image <em style="font-style:italic; color:#C84B31;">Converter</em>'
  const translatedTitle = t.tool_title && t.tool_title[slug]
  if (translatedTitle) {
    const words = translatedTitle.split(' ')
    const last = words.pop()
    return words.join(' ') + ' <em style="font-style:italic; color:#C84B31;">' + last + '</em>'
  }
  const parts = currentTool.title.split(' ')
  const last = parts.pop()
  return parts.join(' ') + ' <em style="font-style:italic; color:#C84B31;">' + last + '</em>'
}

const titleHTML = buildTitleHTML()
const descText = (t.tool_desc && t.tool_desc[slug]) || (currentTool ? currentTool.description : 'Convert images instantly. Files never leave your device.')

const relatedLinksMap = {
  'jpg-to-png':  [{ href:'/webp-to-png', slug:'webp-to-png' }],
  'png-to-jpg':  [{ href:'/webp-to-jpg', slug:'webp-to-jpg' }],
  'jpg-to-webp': [{ href:'/png-to-webp', slug:'png-to-webp' }],
  'webp-to-jpg': [{ href:'/png-to-jpg',  slug:'png-to-jpg' }],
  'png-to-webp': [{ href:'/jpg-to-webp', slug:'jpg-to-webp' }],
  'webp-to-png': [{ href:'/jpg-to-png',  slug:'jpg-to-png' }],
}
const relatedRaw = relatedLinksMap[slug] || []
const relatedHTML = relatedRaw.length ? `
  <div style="margin-top:8px; font-size:13px; color:#9A8A7A;">
    ${t.also_convert} ${relatedRaw.map(r => `<a href="${localHref(r.slug)}" class="related-link">${t.nav_short[r.slug]}</a>`).join(' · ')}
  </div>` : ''

const formatSelectorHTML = currentTool
  ? `<input type="hidden" id="formatSelect" value="${currentTool.outputFormat}" />`
  : `<div style="background:#ffffff; border:1px solid #DDD5C8; border-radius:12px; padding:16px; margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">${t.convert_output_format}</div>
      <select id="formatSelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; background:#FAF6EF; color:#2C1810; outline:none; cursor:pointer; transition:all 0.15s;">
        <option value="image/jpeg">${t.convert_to_jpg}</option>
        <option value="image/png">${t.convert_to_png}</option>
        <option value="image/webp">${t.convert_to_webp}</option>
      </select>
    </div>`

function buildSeoSection() {
  const seo = t.seo && t.seo[slug]
  if (!seo) return ''
  return `
    <hr class="seo-divider" />
    <div class="seo-section">
      <h2>${seo.h2a}</h2>
      <ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      <h2>${seo.h2b}</h2>
      ${seo.body}
      <h3>${seo.h3why}</h3>
      <p>${seo.why}</p>
      <h3>${t.seo_faq_title}</h3>
      ${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}
      <h3>${t.seo_also_try}</h3>
      <div class="internal-links">
        ${seo.links.map(l => `<a href="${localHref(l.href.replace(/^\//,''))}">${l.label}</a>`).join('')}
      </div>
    </div>
  `
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${titleHTML}</h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0 0 4px;">${descText}</p>
      ${relatedHTML}
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; transition:background 0.15s;">
        <span style="font-size:18px;">+</span> ${t.select_images}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${t.drop_hint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <div id="sizes" style="margin:0 0 10px; font-size:14px;"></div>
    ${formatSelectorHTML}
    <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.convert_btn}</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsLinks"></div>
    </div>
  </div>
  ${buildSeoSection()}
`

if (currentTool) document.title = (t.tool_title && t.tool_title[slug] ? t.tool_title[slug] : currentTool.title) + ' | Free & Private — No Upload'
injectHeader()

const fileInput = document.getElementById('fileInput')
const formatSelect = document.getElementById('formatSelect')
const convertBtn = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const sizes = document.getElementById('sizes')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const nextSteps = document.getElementById('nextSteps')
const nextStepsLinks = document.getElementById('nextStepsLinks')

const FIXED_QUALITY = 0.85
let selectedFiles = []
let currentDownloadUrl = null
let convertedBlobs = []

function setIdleEnabled() {
  convertBtn.disabled = false; convertBtn.textContent = t.convert_btn
  convertBtn.style.background = '#C84B31'; convertBtn.style.cursor = 'pointer'; convertBtn.style.opacity = '1'
}
function setConverting() {
  convertBtn.disabled = true; convertBtn.textContent = t.convert_btn_loading
  convertBtn.style.background = '#9A8A7A'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '1'
}
function setDisabled() {
  convertBtn.disabled = true; convertBtn.textContent = t.convert_btn
  convertBtn.style.background = '#C4B8A8'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '0.7'
}
function cleanupOldUrl() { if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null } }
function clearResultsUI() { cleanupOldUrl(); downloadLink.style.display = 'none'; nextSteps.style.display = 'none'; sizes.textContent = '' }
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 4000) }

async function saveFilesToIDB(files) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    files.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('IDB write failed'))
  })
}

function showNextSteps(outputMime) {
  const steps = nextStepsMap[outputMime] || nextStepsMap['image/jpeg']
  nextStepsLinks.innerHTML = steps.map(s => `<button class="next-link" data-href="${s.href}">${s.label}</button>`).join('')
  nextSteps.style.display = 'block'
  nextStepsLinks.querySelectorAll('.next-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      const href = btn.getAttribute('data-href')
      if (!convertedBlobs.length) { window.location.href = href; return }
      try { await saveFilesToIDB(convertedBlobs); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      window.location.href = href
    })
  })
}

function renderPreviews() {
  if (!selectedFiles.length) { previewGrid.style.display = 'none'; previewGrid.innerHTML = ''; return }
  previewGrid.style.display = 'grid'
  previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
  previewGrid.style.gap = '12px'
  previewGrid.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f)
    return `<div class="preview-card"><img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" /><button class="remove-btn" data-index="${i}">✕</button><div class="fname">${f.name}</div></div>`
  }).join('')
  previewGrid.innerHTML += `<label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;"><span style="font-size:28px;">+</span><span>${t.add_more}</span></label>`
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
      clearResultsUI(); renderPreviews()
      if (selectedFiles.length) setIdleEnabled(); else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const allImages = incoming.filter(f => f.type && f.type.startsWith('image/'))
  if (currentTool && currentTool.inputFormats.length) {
    const wrong = allImages.filter(f => !currentTool.inputFormats.includes(f.type))
    if (wrong.length) {
      const allowed = currentTool.inputFormats.map(f => f === 'image/jpeg' ? 'JPG' : f === 'image/png' ? 'PNG' : 'WebP').join(', ')
      showWarning(`${t.warn_wrong_fmt_tool} ${allowed} ${t.warn_files} ${wrong.length} ${t.warn_wrong_format}`)
    }
  }
  const valid = currentTool && currentTool.inputFormats.length
    ? allImages.filter(f => currentTool.inputFormats.includes(f.type))
    : allImages
  const tooBig = valid.filter(f => f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (tooBig.length) showWarning(`${tooBig.length} ${t.warn_too_large}`)
  const filtered = valid.filter(f => f.size <= LIMITS.MAX_PER_FILE_BYTES)
  // Allow duplicates — just append, no deduplication
  let merged = [...selectedFiles, ...filtered]
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged
  clearResultsUI(); renderPreviews()
  if (selectedFiles.length) setIdleEnabled(); else setDisabled()
}

// ── FIXED: reset input after each selection so same file can be re-selected ──
fileInput.addEventListener('change', () => {
  validateAndAdd(Array.from(fileInput.files || []))
  fileInput.value = ''
})
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('dragover', (e) => e.preventDefault())
document.addEventListener('drop', (e) => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
}

async function loadFilesFromIDB() {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => { store.clear(); resolve(req.result || []) }
    req.onerror = () => reject(new Error('IDB read failed'))
  })
}

async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const records = await loadFilesFromIDB()
    if (!records.length) return
    const files = records.map(r => new File([r.blob], r.name, { type: r.type }))
    selectedFiles = files; clearResultsUI(); renderPreviews(); setIdleEnabled()
  } catch (e) {}
}

loadPendingFiles()

convertBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting(); clearResultsUI()
  const mime = formatSelect.value
  try {
    convertedBlobs = []
    if (selectedFiles.length === 1) {
      sizes.textContent = t.processing
      const { blob, outputSize, filename } = await convertFile(selectedFiles[0], mime, FIXED_QUALITY)
      convertedBlobs = [{ blob, name: filename, type: mime }]
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = filename
      downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download} (${formatSize(outputSize)})`
      sizes.textContent = ''
    } else {
      const { zipBlob, zipName, convertedBlobs: blobs } = await convertFilesToZip(
        selectedFiles, mime, FIXED_QUALITY,
        (current, total) => { sizes.textContent = `${t.convert_btn_loading} ${current}/${total}...` }
      )
      convertedBlobs.push(...blobs)
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = zipName
      downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
      sizes.textContent = ''
    }
    showNextSteps(mime); setIdleEnabled()
  } catch (err) {
    alert(err?.message || 'Conversion error')
    sizes.textContent = ''
    if (selectedFiles.length) setIdleEnabled(); else setDisabled()
  }
})