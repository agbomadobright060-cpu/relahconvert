import { convertFile, convertFilesToZip } from './core/converter.js'
import { LIMITS, formatSize, fileKey, totalBytes } from './core/utils.js'
import { getCurrentTool } from './app/router.js'

const currentTool = getCurrentTool()
const bg = currentTool ? '#F2F2F2' : '#F5F0E8'

if (document.head) {
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap'
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
  `
  document.head.appendChild(style)
}

function buildTitleHTML(tool) {
  if (!tool) return 'Image <em style="font-style:italic; color:#C84B31;">Converter</em>'
  const parts = tool.title.split(' ')
  const last = parts.pop()
  return parts.join(' ') + ' <em style="font-style:italic; color:#C84B31;">' + last + '</em>'
}

const titleHTML = buildTitleHTML(currentTool)
const descText = currentTool ? currentTool.description : 'Convert PNG, JPG and WebP instantly. Files never leave your device.'
const badgeHTML = currentTool ? '' : `<div style="display:inline-block; background:#C84B31; color:#F5F0E8; font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; padding:4px 10px; border-radius:4px; margin-bottom:10px;">Free · No upload · Browser only</div>`

const formatSelectorHTML = currentTool
  ? `<input type="hidden" id="formatSelect" value="${currentTool.outputFormat}" />`
  : `<div style="background:#ffffff; border:1px solid #DDD5C8; border-radius:12px; padding:16px; margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Output Format</div>
      <select id="formatSelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; background:#FAF6EF; color:#2C1810; outline:none; cursor:pointer; transition:all 0.15s;">
        <option value="image/jpeg">Convert to JPG</option>
        <option value="image/png">Convert to PNG</option>
        <option value="image/webp">Convert to WebP</option>
      </select>
      <div id="formatAllFilesNote" style="display:none; margin-top:5px; font-size:11px; color:#9A8A7A;">Applies to all selected files</div>
    </div>`

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      ${badgeHTML}
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(32px,6vw,48px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${titleHTML}</h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${descText}</p>
    </div>

    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer; transition:background 0.15s;">
        <span style="font-size:18px;">+</span> Select Images
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop images anywhere</span>
    </div>

    <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <div id="sizes" style="margin:0 0 10px; font-size:14px;"></div>

    ${formatSelectorHTML}

    <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">Convert Images</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
  </div>
`

if (currentTool) document.title = currentTool.title

const fileInput = document.getElementById('fileInput')
const formatSelect = document.getElementById('formatSelect')
const convertBtn = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const sizes = document.getElementById('sizes')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const uploadArea = document.getElementById('uploadArea')

const FIXED_QUALITY = 0.85
let selectedFiles = []
let currentDownloadUrl = null

function setIdleEnabled() {
  convertBtn.disabled = false
  convertBtn.textContent = 'Convert Images'
  convertBtn.style.background = '#C84B31'
  convertBtn.style.cursor = 'pointer'
  convertBtn.style.opacity = '1'
}

function setConverting() {
  convertBtn.disabled = true
  convertBtn.textContent = 'Converting...'
  convertBtn.style.background = '#9A8A7A'
  convertBtn.style.cursor = 'not-allowed'
  convertBtn.style.opacity = '1'
}

function setDisabled() {
  convertBtn.disabled = true
  convertBtn.textContent = 'Convert Images'
  convertBtn.style.background = '#C4B8A8'
  convertBtn.style.cursor = 'not-allowed'
  convertBtn.style.opacity = '0.7'
}

function cleanupOldUrl() {
  if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null }
}

function clearResultsUI() {
  cleanupOldUrl()
  downloadLink.style.display = 'none'
  sizes.textContent = ''
}

function showWarning(msg) {
  warning.style.display = 'block'
  warning.textContent = msg
  setTimeout(() => { warning.style.display = 'none' }, 4000)
}

function renderPreviews() {
  if (!selectedFiles.length) {
    previewGrid.style.display = 'none'
    previewGrid.innerHTML = ''
    return
  }
  previewGrid.style.display = 'grid'
  previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
  previewGrid.style.gap = '12px'

  previewGrid.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f)
    return `
      <div class="preview-card">
        <img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" />
        <button class="remove-btn" data-index="${i}">✕</button>
        <div class="fname">${f.name}</div>
      </div>`
  }).join('')

  // Add "add more" card
  previewGrid.innerHTML += `
    <label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;">
      <span style="font-size:28px;">+</span>
      <span>Add more</span>
    </label>`

  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'))
      selectedFiles.splice(idx, 1)
      clearResultsUI()
      renderPreviews()
      if (selectedFiles.length) setIdleEnabled()
      else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const allImages = incoming.filter(f => f.type && f.type.startsWith('image/'))

  // Format validation on tool pages
  if (currentTool && currentTool.inputFormats.length) {
    const wrong = allImages.filter(f => !currentTool.inputFormats.includes(f.type))
    if (wrong.length) {
      const allowed = currentTool.inputFormats.map(f => f === 'image/jpeg' ? 'JPG' : f === 'image/png' ? 'PNG' : 'WebP').join(', ')
      showWarning(`Wrong format! This tool only accepts ${allowed} files. ${wrong.length} file(s) were skipped.`)
    }
  }

  const valid = currentTool && currentTool.inputFormats.length
    ? allImages.filter(f => currentTool.inputFormats.includes(f.type))
    : allImages

  const tooBig = valid.filter(f => f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (tooBig.length) showWarning(`${tooBig.length} file(s) are too large and were skipped.`)

  const filtered = valid.filter(f => f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const map = new Map(selectedFiles.map(f => [fileKey(f), f]))
  for (const f of filtered) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()

  selectedFiles = merged
  clearResultsUI()
  renderPreviews()
  if (selectedFiles.length) setIdleEnabled()
  else setDisabled()
}

fileInput.addEventListener('change', () => { validateAndAdd(Array.from(fileInput.files || [])) })

document.addEventListener('dragover', (e) => e.preventDefault())
document.addEventListener('drop', (e) => {
  e.preventDefault()
  validateAndAdd(Array.from(e.dataTransfer.files || []))
})

convertBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting()
  clearResultsUI()
  const mime = formatSelect.value
  try {
    if (selectedFiles.length === 1) {
      sizes.textContent = 'Processing...'
      const { blob, outputSize, filename } = await convertFile(selectedFiles[0], mime, FIXED_QUALITY)
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = filename
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download (${formatSize(outputSize)})`
      sizes.textContent = ''
    } else {
      const { zipBlob, zipName } = await convertFilesToZip(
        selectedFiles, mime, FIXED_QUALITY,
        (current, total) => { sizes.textContent = `Converting ${current}/${total}...` }
      )
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = zipName
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download ZIP (${formatSize(zipBlob.size)})`
      sizes.textContent = ''
    }
    setIdleEnabled()
  } catch (err) {
    alert(err?.message || 'Conversion error')
    sizes.textContent = ''
    if (selectedFiles.length) setIdleEnabled()
    else setDisabled()
  }
})