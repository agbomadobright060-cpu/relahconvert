import { injectHeader } from './core/header.js'
import { jsPDF } from 'jspdf'
import { formatSize, fileKey, totalBytes, sanitizeBaseName, LIMITS } from './core/utils.js'

const bg = '#F2F2F2'

export function initImageToPdf({ acceptMime, acceptAttr, toolTitle, toolDesc, pageSlug, outputName }) {

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
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
  `
  document.head.appendChild(style)
}

document.title = toolTitle

const [titleMain, titleItalic] = toolTitle.split(' to ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${titleMain} to <em style="font-style:italic; color:#C84B31;">PDF</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${toolDesc}</p>
    </div>

    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> Select Images
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">or drop images anywhere</span>
    </div>

    <input type="file" id="fileInput" multiple accept="${acceptAttr}" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>

    <div id="pdfModePanel" style="display:none; background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">PDF Options</div>
      <div style="display:flex; gap:6px; background:#F5F0E8; border-radius:10px; padding:4px;">
        <button id="modeOne" style="flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; background:#C84B31; color:#fff; transition:all 0.15s;">One PDF per image</button>
        <button id="modeAll" style="flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; background:transparent; color:#9A8A7A; transition:all 0.15s;">All images in one PDF</button>
      </div>
    </div>

    <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">Convert to PDF</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>

    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">What's next?</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <a href="/compress" class="next-link">Compress Image</a>
        <a href="/resize" class="next-link">Resize Image</a>
        <a href="/jpg-to-png" class="next-link">Convert to PNG</a>
      </div>
    </div>
  </div>
`

const fileInput = document.getElementById('fileInput')
const convertBtn = document.getElementById('convertBtn')
const downloadLink = document.getElementById('downloadLink')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const nextSteps = document.getElementById('nextSteps')
const pdfModePanel = document.getElementById('pdfModePanel')
const modeOne = document.getElementById('modeOne')
const modeAll = document.getElementById('modeAll')

let selectedFiles = []
let currentDownloadUrl = null
let pdfMode = 'one' // 'one' or 'all'

modeOne.addEventListener('click', () => {
  pdfMode = 'one'
  modeOne.style.background = '#C84B31'
  modeOne.style.color = '#fff'
  modeAll.style.background = 'transparent'
  modeAll.style.color = '#9A8A7A'
})

modeAll.addEventListener('click', () => {
  pdfMode = 'all'
  modeAll.style.background = '#C84B31'
  modeAll.style.color = '#fff'
  modeOne.style.background = 'transparent'
  modeOne.style.color = '#9A8A7A'
})

function cleanupOldUrl() {
  if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null }
}

function showWarning(msg) {
  warning.style.display = 'block'
  warning.textContent = msg
  setTimeout(() => { warning.style.display = 'none' }, 4000)
}

function setDisabled() {
  convertBtn.disabled = true
  convertBtn.textContent = 'Convert to PDF'
  convertBtn.style.background = '#C4B8A8'
  convertBtn.style.cursor = 'not-allowed'
  convertBtn.style.opacity = '0.7'
}
function setIdle() {
  convertBtn.disabled = false
  convertBtn.textContent = 'Convert to PDF'
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

function renderPreviews() {
  if (!selectedFiles.length) {
    previewGrid.style.display = 'none'
    previewGrid.innerHTML = ''
    pdfModePanel.style.display = 'none'
    return
  }

  previewGrid.style.display = 'grid'
  previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
  previewGrid.style.gap = '12px'
  pdfModePanel.style.display = selectedFiles.length > 1 ? 'block' : 'none'

  previewGrid.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f)
    return `
      <div class="preview-card">
        <img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" />
        <button class="remove-btn" data-index="${i}">✕</button>
        <div class="fname">${f.name}</div>
      </div>`
  }).join('')

  previewGrid.innerHTML += `
    <label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;">
      <span style="font-size:28px;">+</span>
      <span>Add more</span>
    </label>`

  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
      cleanupOldUrl()
      downloadLink.style.display = 'none'
      nextSteps.style.display = 'none'
      renderPreviews()
      if (selectedFiles.length) setIdle(); else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => acceptMime.includes(f.type) && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrongFormat = incoming.filter(f => !acceptMime.includes(f.type))
  const tooBig = incoming.filter(f => acceptMime.includes(f.type) && f.size > LIMITS.MAX_PER_FILE_BYTES)

  if (wrongFormat.length) showWarning(`Wrong format. ${wrongFormat.length} file(s) were skipped.`)
  if (tooBig.length) showWarning(`${tooBig.length} file(s) are too large and were skipped.`)

  const map = new Map()
  for (const f of [...selectedFiles, ...valid]) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()

  selectedFiles = merged
  cleanupOldUrl()
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'
  renderPreviews()
  if (selectedFiles.length) setIdle(); else setDisabled()
}

fileInput.addEventListener('change', () => {
  validateAndAdd(Array.from(fileInput.files || []))
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => resolve({ img, dataUrl: e.target.result })
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function addImageToPage(pdf, dataUrl, imgType, imgWidth, imgHeight, isFirst) {
  // A4 dimensions in mm
  const pageW = 210
  const pageH = 297
  const margin = 10
  const maxW = pageW - margin * 2
  const maxH = pageH - margin * 2

  // Scale image to fit within A4 with margins
  const ratio = Math.min(maxW / imgWidth, maxH / imgHeight)
  const w = imgWidth * ratio
  const h = imgHeight * ratio
  const x = (pageW - w) / 2
  const y = (pageH - h) / 2

  if (!isFirst) pdf.addPage()
  pdf.addImage(dataUrl, imgType, x, y, w, h)
}

async function convertToPdf() {
  setConverting()
  cleanupOldUrl()
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'

  try {
    const imgType = acceptMime[0] === 'image/jpeg' ? 'JPEG' : 'PNG'

    if (pdfMode === 'all' && selectedFiles.length > 1) {
      // All images in one PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      for (let i = 0; i < selectedFiles.length; i++) {
        convertBtn.textContent = `Converting ${i + 1}/${selectedFiles.length}...`
        const { dataUrl, img } = await loadImage(selectedFiles[i])
        addImageToPage(pdf, dataUrl, imgType, img.width, img.height, i === 0)
      }
      const pdfBlob = pdf.output('blob')
      currentDownloadUrl = URL.createObjectURL(pdfBlob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = `${outputName}.pdf`
      downloadLink.style.display = 'block'
      downloadLink.textContent = `Download PDF (${formatSize(pdfBlob.size)})`
    } else {
      // One PDF per image (or single image)
      if (selectedFiles.length === 1) {
        const { dataUrl, img } = await loadImage(selectedFiles[0])
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        addImageToPage(pdf, dataUrl, imgType, img.width, img.height, true)
        const pdfBlob = pdf.output('blob')
        currentDownloadUrl = URL.createObjectURL(pdfBlob)
        const base = sanitizeBaseName(selectedFiles[0].name)
        downloadLink.href = currentDownloadUrl
        downloadLink.download = `${base}.pdf`
        downloadLink.style.display = 'block'
        downloadLink.textContent = `Download PDF (${formatSize(pdfBlob.size)})`
      } else {
        // Multiple files → zip of PDFs
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        for (let i = 0; i < selectedFiles.length; i++) {
          convertBtn.textContent = `Converting ${i + 1}/${selectedFiles.length}...`
          const { dataUrl, img } = await loadImage(selectedFiles[i])
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
          addImageToPage(pdf, dataUrl, imgType, img.width, img.height, true)
          const pdfBlob = pdf.output('blob')
          const base = sanitizeBaseName(selectedFiles[i].name)
          zip.file(`${base}.pdf`, pdfBlob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        currentDownloadUrl = URL.createObjectURL(zipBlob)
        downloadLink.href = currentDownloadUrl
        downloadLink.download = `${outputName}-pdfs.zip`
        downloadLink.style.display = 'block'
        downloadLink.textContent = `Download ZIP (${formatSize(zipBlob.size)})`
      }
    }

    nextSteps.style.display = 'block'
    setIdle()
    fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Conversion error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
}

convertBtn.addEventListener('click', convertToPdf)

// Load pending files from IDB
async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const req = indexedDB.open('relahconvert', 1)
    const db = await new Promise((res, rej) => { req.onsuccess = e => res(e.target.result); req.onerror = rej })
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    const records = await new Promise((res, rej) => {
      const r = store.getAll()
      r.onsuccess = () => { store.clear(); res(r.result || []) }
      r.onerror = rej
    })
    if (!records.length) return
    const files = records.map(r => new File([r.blob], r.name, { type: r.type }))
    selectedFiles = files.filter(f => acceptMime.includes(f.type))
    if (selectedFiles.length) { renderPreviews(); setIdle() }
  } catch (e) {}
}

loadPendingFiles()
injectHeader()

} // end initImageToPdf