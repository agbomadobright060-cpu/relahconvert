import { convertFile, convertFilesToZip } from './converter.js'
import { LIMITS, formatSize, fileKey, totalBytes } from './utils.js'

if (document.head) {
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)
  document.body.style.cssText = 'margin:0; padding:0; min-height:100vh; background:#F5F0E8;'
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.5s ease both; }
    #dropZone:hover { border-color: #C84B31 !important; background: #FDF6ED !important; }
    #convertBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #convertBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    select:focus { border-color: #C84B31 !important; box-shadow: 0 0 0 3px rgba(200,75,49,0.12) !important; }
    .file-row:hover { background: #EEE8DC !important; }
    .remove-btn:hover { background: #C84B31 !important; color: white !important; border-color: #C84B31 !important; }
  `
  document.head.appendChild(style)
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:560px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <div style="display:inline-block; background:#C84B31; color:#F5F0E8; font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; padding:4px 10px; border-radius:4px; margin-bottom:10px;">Free · No upload · Browser only</div>
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(32px,6vw,48px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">Image <em style="font-style:italic; color:#C84B31;">Converter</em></h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">Convert PNG, JPG and WebP instantly. Files never leave your device.</p>
    </div>

    <label id="dropZone" for="fileInput" style="display:block; width:100%; box-sizing:border-box; padding:24px 16px; border:2px dashed #C4B8A8; border-radius:12px; text-align:center; cursor:pointer; margin-bottom:12px; background:#FAF6EF; transition:all 0.18s ease;">
      <div style="font-size:24px; margin-bottom:6px;">🖼️</div>
      <div id="dzTitle" style="font-family:'Fraunces',serif; font-weight:700; font-size:16px; color:#2C1810; margin-bottom:4px;">Drop images here or click to upload</div>
      <div id="dzSub" style="font-size:12px; color:#9A8A7A; font-weight:500;">You can drop multiple times to add more files</div>
      <div style="margin-top:10px; display:flex; gap:6px; justify-content:center;">
        <span style="font-size:10px; font-weight:600; color:#C84B31; background:#FDE8E3; padding:2px 8px; border-radius:99px;">PNG</span>
        <span style="font-size:10px; font-weight:600; color:#C84B31; background:#FDE8E3; padding:2px 8px; border-radius:99px;">JPG</span>
        <span style="font-size:10px; font-weight:600; color:#C84B31; background:#FDE8E3; padding:2px 8px; border-radius:99px;">WebP</span>
      </div>
    </label>

    <input type="file" id="fileInput" multiple accept="image/*" style="display:none;" />
    <div id="sizes" style="margin:0 0 10px; font-size:14px;"></div>
    <div id="fileList" style="display:none; margin-bottom:12px; border:1px solid #DDD5C8; border-radius:10px; background:#FAF6EF; overflow:hidden;"></div>

    <div style="background:#ffffff; border:1px solid #DDD5C8; border-radius:12px; padding:16px; margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Output Format</div>
      <select id="formatSelect" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; background:#FAF6EF; color:#2C1810; outline:none; cursor:pointer; transition:all 0.15s;">
        <option value="image/jpeg">Convert to JPG</option>
        <option value="image/png">Convert to PNG</option>
        <option value="image/webp">Convert to WebP</option>
      </select>
      <div id="formatAllFilesNote" style="display:none; margin-top:5px; font-size:11px; color:#9A8A7A;">Applies to all selected files</div>
    </div>

    <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">Convert Images</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
  </div>
`

const fileInput = document.getElementById('fileInput')
const dropZone = document.getElementById('dropZone')
const dzTitle = document.getElementById('dzTitle')
const dzSub = document.getElementById('dzSub')
const formatSelect = document.getElementById('formatSelect')
const convertBtn = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const sizes = document.getElementById('sizes')
const fileList = document.getElementById('fileList')

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

function refreshHeader() {
  dzTitle.textContent = selectedFiles.length ? `${selectedFiles.length} file(s) selected` : 'Drop images here or click to upload'
  dzSub.textContent = selectedFiles.length ? 'Ready to convert — remove files below if needed' : 'You can drop multiple times to add more files'
  const note = document.getElementById('formatAllFilesNote')
  if (note) note.style.display = selectedFiles.length > 1 ? 'block' : 'none'
}

function showLimitMessage(msg) {
  sizes.innerHTML = `<div style="padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;">${msg}</div>`
}

function syncInputFilesFromSelected() {
  const dt = new DataTransfer()
  selectedFiles.forEach(f => dt.items.add(f))
  fileInput.files = dt.files
}

function renderFileList(files) {
  if (!files.length) { fileList.style.display = 'none'; fileList.innerHTML = ''; return }
  fileList.style.display = 'block'
  const rows = files.map(f => `
    <div class="file-row" style="display:flex; justify-content:space-between; gap:12px; padding:10px 14px; border-top:1px solid #DDD5C8; font-size:13px; align-items:center; background:#FAF6EF; transition:background 0.15s;">
      <div style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#2C1810; font-weight:500;">${f.name}</div>
      <div style="display:flex; align-items:center; gap:10px; white-space:nowrap;">
        <div style="color:#9A8A7A; font-weight:600; font-size:12px;">${formatSize(f.size)}</div>
        <button class="removeBtn remove-btn" data-key="${fileKey(f)}" style="border:1px solid #DDD5C8; background:#ffffff; cursor:pointer; font-size:13px; padding:6px 9px; border-radius:8px; transition:all 0.15s;">✕</button>
      </div>
    </div>`).join('')
  fileList.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; font-weight:700; font-size:13px; background:#ffffff; border-bottom:1px solid #DDD5C8;">
      <div style="color:#2C1810;">Files (${files.length})</div>
      <button id="clearAllBtn" style="border:1px solid #DDD5C8; background:#ffffff; color:#7A6A5A; cursor:pointer; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;">Clear all</button>
    </div>${rows}`
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    selectedFiles = []
    syncInputFilesFromSelected()
    clearResultsUI()
    renderFileList(selectedFiles)
    refreshHeader()
    setDisabled()
  })
  fileList.querySelectorAll('.removeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles = selectedFiles.filter(f => fileKey(f) !== btn.getAttribute('data-key'))
      syncInputFilesFromSelected()
      clearResultsUI()
      renderFileList(selectedFiles)
      refreshHeader()
      if (selectedFiles.length) setIdleEnabled()
      else setDisabled()
    })
  })
}

function validateAndMergeFiles(existing, incoming) {
  const errors = []
  const images = incoming.filter(f => f.type && f.type.startsWith('image/'))
  const tooBig = images.filter(f => f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (tooBig.length) errors.push(`${tooBig.length} file(s) exceed ${formatSize(LIMITS.MAX_PER_FILE_BYTES)} each and were skipped.`)
  const filtered = images.filter(f => f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const map = new Map(existing.map(f => [fileKey(f), f]))
  for (const f of filtered) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) {
    const before = merged.length
    merged = merged.slice(0, LIMITS.MAX_FILES)
    errors.push(`Maximum ${LIMITS.MAX_FILES} files allowed. ${before - merged.length} file(s) were skipped.`)
  }
  const beforeTotal = totalBytes(merged)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  if (beforeTotal > LIMITS.MAX_TOTAL_BYTES) errors.push(`Total size limit ${formatSize(LIMITS.MAX_TOTAL_BYTES)} reached. Some files were skipped.`)
  return { merged, errors }
}

function addFiles(filesToAdd) {
  const { merged, errors } = validateAndMergeFiles(selectedFiles, filesToAdd)
  selectedFiles = merged
  syncInputFilesFromSelected()
  clearResultsUI()
  renderFileList(selectedFiles)
  refreshHeader()
  if (errors.length) showLimitMessage(errors.join(' '))
  if (selectedFiles.length) setIdleEnabled()
  else setDisabled()
}

fileInput.addEventListener('change', () => { addFiles(Array.from(fileInput.files || [])) })
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.background = '#FDF6ED'; dropZone.style.borderColor = '#C84B31' })
dropZone.addEventListener('dragleave', () => { dropZone.style.background = '#FAF6EF'; dropZone.style.borderColor = '#C4B8A8' })
dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.style.background = '#FAF6EF'; dropZone.style.borderColor = '#C4B8A8'; addFiles(Array.from(e.dataTransfer.files || [])) })

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

refreshHeader()