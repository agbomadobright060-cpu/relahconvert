import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
import { PDFDocument } from 'pdf-lib'

injectHreflang('split-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['split-pdf']) || 'Split PDF'
const seoData   = t.seo && t.seo['split-pdf']
const descText  = (t.splitpdf_desc) || (seoData ? seoData.h2a : 'Split PDF into individual pages or custom ranges.')
const selectLbl = t.splitpdf_select || t.select_image || 'Select PDF'
const dropHint  = t.splitpdf_drop_hint || t.drop_hint || 'or drop a PDF anywhere'
const dlBtn     = t.download || 'Download'
const dlZipBtn  = t.download_zip || 'Download All as ZIP'
const splitAllLbl   = t.splitpdf_split_all || 'Split All Pages'
const customLbl     = t.splitpdf_custom || 'Custom Ranges'
const splitBtnLbl   = t.splitpdf_split_btn || 'Split PDF'
const splittingLbl  = t.splitpdf_splitting || 'Splitting...'
const pageLabel     = t.splitpdf_page || t.pdfpng_page || 'Page'
const pagesLabel    = t.splitpdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl    = t.splitpdf_loading || 'Loading PDF...'
const rangeHint     = t.splitpdf_range_hint || 'e.g. 1-3, 5, 7-10'
const modeLblAll    = t.splitpdf_mode_all || 'Each page as a separate PDF'
const modeLblCustom = t.splitpdf_mode_custom || 'Split by custom page ranges'

document.body.style.cssText = `margin:0;padding:0;min-height:100vh;background:var(--bg-page);`

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #modeRow{display:none;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  #modeRow.on{display:flex;}
  .mode-btn{padding:8px 16px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
  .mode-btn.active{border-color:var(--accent);color:var(--accent);background:var(--bg-surface);}
  .mode-btn:hover{border-color:var(--accent);color:var(--accent);}
  #rangeRow{display:none;align-items:center;gap:12px;margin-bottom:14px;background:var(--bg-card);border-radius:12px;border:1.5px solid var(--border);padding:12px 16px;flex-wrap:wrap;}
  #rangeRow.on{display:flex;}
  #rangeRow label{font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  #rangeInput{flex:1;min-width:160px;padding:6px 10px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);outline:none;background:var(--bg-card);}
  #fileGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;}
  .pdf-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);overflow:hidden;position:relative;}
  .pdf-card canvas{width:100%;height:130px;object-fit:contain;display:block;background:var(--bg-surface);}
  .pdf-card .pname{font-size:11px;color:var(--text-secondary);font-family:'DM Sans',sans-serif;padding:6px 8px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
  .pdf-card .pmeta{font-size:10px;color:var(--text-muted);font-family:'DM Sans',sans-serif;padding:0 8px 6px;}
  .pdf-card .dl-link{display:none;font-size:11px;font-weight:700;color:var(--accent);font-family:'DM Sans',sans-serif;padding:0 8px 8px;text-decoration:none;}
  .pdf-card .dl-link:hover{text-decoration:underline;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
  #removeBtn{background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;}
  #actionRow{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;}
  .action-btn{padding:12px 20px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;flex:1;}
  .action-btn:hover{background:var(--accent-hover);}
  .action-btn.dark{background:var(--btn-dark);}
  .action-btn.dark:hover{background:var(--btn-dark-hover);}
  .status-text{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;min-height:18px;}
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
  .next-link{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border-light);font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .next-link:hover{border-color:var(--accent);color:var(--accent);}
`
document.head.appendChild(style)

document.title = t.splitpdf_page_title || (seoData ? seoData.page_title : 'Split PDF Online Free | Extract Pages — RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.splitpdf_meta_desc || 'Split PDF into separate pages or custom ranges free. Browser-only, no upload needed. Download individual PDFs or ZIP all.'
document.head.appendChild(_metaDesc)

const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:13px;color:var(--text-tertiary);margin:0 0 14px;">${descText}</p>
    </div>
    <div style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <label class="upload-label" for="fileInput"><span style="font-size:18px;">+</span> ${selectLbl}</label>
        <span style="font-size:12px;color:var(--text-muted);">${dropHint}</span>
      </div>
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop a PDF here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" style="display:none;" />
    <div id="modeRow">
      <button class="mode-btn active" data-mode="all">${splitAllLbl}</button>
      <button class="mode-btn" data-mode="custom">${customLbl}</button>
      <span style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;" id="modeDesc">${modeLblAll}</span>
    </div>
    <div id="rangeRow">
      <label>${customLbl}:</label>
      <input type="text" id="rangeInput" placeholder="${rangeHint}" />
      <span style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;">${rangeHint}</span>
    </div>
    <div id="fileMeta"><span id="fileMetaText"></span><button id="removeBtn">${t.remove || 'Remove'}</button></div>
    <div id="fileGrid"></div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="splitBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${splitBtnLbl}</button>
      <button class="action-btn dark" id="zipBtn" style="display:none;">${dlZipBtn}</button>
    </div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const modeRow      = document.getElementById('modeRow')
const modeDesc     = document.getElementById('modeDesc')
const rangeRow     = document.getElementById('rangeRow')
const rangeInput   = document.getElementById('rangeInput')
const fileGrid     = document.getElementById('fileGrid')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const removeBtn    = document.getElementById('removeBtn')
const splitBtn     = document.getElementById('splitBtn')
const zipBtn       = document.getElementById('zipBtn')
const statusText   = document.getElementById('statusText')

let pdfJsDoc = null
let pdfBytes = null
let pdfFileName = ''
let splitMode = 'all'
let resultBlobs = []

// -- Lazy-load pdf.js for thumbnails --
let pdfjsLib = null
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib
  const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs')
  mod.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
  pdfjsLib = mod
  return mod
}

// -- Mode selector --
modeRow.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    modeRow.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    splitMode = btn.dataset.mode
    if (splitMode === 'custom') {
      rangeRow.classList.add('on')
      modeDesc.textContent = modeLblCustom
    } else {
      rangeRow.classList.remove('on')
      modeDesc.textContent = modeLblAll
    }
  })
})

// -- Next steps --
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['merge-pdf'] || 'Merge PDF', href: localHref('merge-pdf') },
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
    { label: ns['rotate-pdf'] || 'Rotate PDF', href: localHref('rotate-pdf') },
    { label: ns['pdf-to-png'] || 'PDF to PNG', href: localHref('pdf-to-png') },
  ]
  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', () => { window.location.href = b.href })
    nextStepsButtons.appendChild(btn)
  })
  document.getElementById('nextSteps').style.display = 'block'
}

function resetState() {
  pdfJsDoc = null
  pdfBytes = null
  pdfFileName = ''
  resultBlobs = []
  fileGrid.innerHTML = ''
  fileMeta.classList.remove('on')
  modeRow.classList.remove('on')
  rangeRow.classList.remove('on')
  zipBtn.style.display = 'none'
  statusText.textContent = ''
  splitBtn.disabled = true
  splitBtn.style.opacity = '0.7'
  splitBtn.style.cursor = 'not-allowed'
  splitBtn.style.background = 'var(--btn-disabled)'
  document.getElementById('nextSteps').style.display = 'none'
}

removeBtn.addEventListener('click', resetState)

async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    statusText.textContent = t.warn_wrong_fmt_short || 'Wrong format.'
    return
  }
  resetState()
  statusText.textContent = loadingLbl
  try {
    const pdfjs = await loadPdfJs()
    const buf = await file.arrayBuffer()
    pdfBytes = new Uint8Array(buf.slice(0))
    pdfJsDoc = await pdfjs.getDocument({ data: buf }).promise
    pdfFileName = file.name.replace(/\.[^.]+$/, '')
    fileMetaText.textContent = `${file.name} \u2014 ${pdfJsDoc.numPages} ${pagesLabel}`
    fileMeta.classList.add('on')
    modeRow.classList.add('on')

    // Render preview thumbnails
    for (let i = 1; i <= pdfJsDoc.numPages; i++) {
      const page = await pdfJsDoc.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const card = document.createElement('div')
      card.className = 'pdf-card'
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport, intent: 'display' }).promise
      const pname = document.createElement('div')
      pname.className = 'pname'
      pname.textContent = `${pageLabel} ${i}`
      const pmeta = document.createElement('div')
      pmeta.className = 'pmeta'
      const fullViewport = page.getViewport({ scale: 1 })
      pmeta.textContent = `${Math.round(fullViewport.width)} \u00D7 ${Math.round(fullViewport.height)} pt`
      card.append(canvas, pname, pmeta)
      fileGrid.appendChild(card)
    }

    splitBtn.disabled = false
    splitBtn.style.opacity = '1'
    splitBtn.style.cursor = 'pointer'
    splitBtn.style.background = 'var(--accent)'
    statusText.textContent = ''
  } catch (err) {
    console.error('[split-pdf] load failed:', err)
    statusText.textContent = (t.splitpdf_load_error || 'Could not load PDF: ') + (err?.message || err)
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadPdfFile(fileInput.files[0])
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) loadPdfFile(e.dataTransfer.files[0])
})

// -- Parse custom ranges like "1-3, 5, 7-10" --
function parseRanges(input, totalPages) {
  const ranges = []
  const parts = input.split(',').map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = parseInt(match[1], 10)
      const end = parseInt(match[2], 10)
      if (start < 1 || end < start || end > totalPages) {
        throw new Error(`Invalid range: ${part} (PDF has ${totalPages} pages)`)
      }
      ranges.push({ start, end, label: `${start}-${end}` })
    } else {
      const num = parseInt(part, 10)
      if (isNaN(num) || num < 1 || num > totalPages) {
        throw new Error(`Invalid page: ${part} (PDF has ${totalPages} pages)`)
      }
      ranges.push({ start: num, end: num, label: `${num}` })
    }
  }
  if (ranges.length === 0) throw new Error('No valid ranges entered.')
  return ranges
}

// -- Create a PDF with specific pages --
async function extractPages(srcBytes, pageIndices) {
  const srcDoc = await PDFDocument.load(srcBytes)
  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)
  copiedPages.forEach(p => newDoc.addPage(p))
  return newDoc.save()
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// -- Split action --
splitBtn.addEventListener('click', async () => {
  if (!pdfBytes || !pdfJsDoc) return
  splitBtn.disabled = true
  splitBtn.style.opacity = '0.7'
  splitBtn.style.cursor = 'not-allowed'
  resultBlobs = []
  zipBtn.style.display = 'none'

  try {
    const totalPages = pdfJsDoc.numPages
    let tasks = [] // { pageIndices: number[], label: string }

    if (splitMode === 'custom') {
      const raw = rangeInput.value.trim()
      if (!raw) {
        statusText.textContent = t.splitpdf_enter_ranges || 'Please enter page ranges.'
        splitBtn.disabled = false
        splitBtn.style.opacity = '1'
        splitBtn.style.cursor = 'pointer'
        return
      }
      const ranges = parseRanges(raw, totalPages)
      for (const r of ranges) {
        const indices = []
        for (let p = r.start; p <= r.end; p++) indices.push(p - 1) // 0-indexed for pdf-lib
        tasks.push({ pageIndices: indices, label: r.label })
      }
    } else {
      // Split all: each page separately
      for (let i = 0; i < totalPages; i++) {
        tasks.push({ pageIndices: [i], label: `${i + 1}` })
      }
    }

    // Process each task
    for (let i = 0; i < tasks.length; i++) {
      statusText.textContent = `${splittingLbl} (${i + 1}/${tasks.length})`
      const task = tasks[i]
      const newPdfBytes = await extractPages(pdfBytes, task.pageIndices)
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' })
      const filename = tasks.length === 1
        ? `${pdfFileName || 'split'}-pages-${task.label}.pdf`
        : `${pdfFileName || 'split'}-page-${task.label}.pdf`
      resultBlobs.push({ blob, name: filename })
    }

    // If only one result, download immediately
    if (resultBlobs.length === 1) {
      triggerDownload(resultBlobs[0].blob, resultBlobs[0].name)
      statusText.textContent = t.splitpdf_done || 'Done! PDF downloaded.'
      if (window.showReviewPrompt) window.showReviewPrompt()
    } else {
      statusText.textContent = `${resultBlobs.length} ${t.splitpdf_pdfs_ready || 'PDFs ready.'}`
      // Show individual download links on cards
      resultBlobs.forEach((r, idx) => {
        const card = fileGrid.children[idx]
        if (card) {
          let dlLink = card.querySelector('.dl-link')
          if (!dlLink) {
            dlLink = document.createElement('a')
            dlLink.className = 'dl-link'
            card.appendChild(dlLink)
          }
          const url = URL.createObjectURL(r.blob)
          dlLink.textContent = `\u2B07 ${dlBtn} PDF`
          dlLink.href = url
          dlLink.download = r.name
          dlLink.style.display = 'block'
          dlLink.onclick = () => setTimeout(() => URL.revokeObjectURL(url), 10000)
        }
      })
      zipBtn.style.display = 'block'
    }

    buildNextSteps()
  } catch (err) {
    console.error('[split-pdf] split failed:', err)
    statusText.textContent = (t.splitpdf_error || 'Split failed: ') + (err?.message || err)
  }

  splitBtn.disabled = false
  splitBtn.style.opacity = '1'
  splitBtn.style.cursor = 'pointer'
})

// -- ZIP download --
zipBtn.addEventListener('click', async () => {
  if (!resultBlobs.length) return
  zipBtn.textContent = 'Zipping\u2026'
  zipBtn.disabled = true
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
    const JSZip = mod.default || window.JSZip
    const zip = new JSZip()
    for (const r of resultBlobs) zip.file(r.name, await r.blob.arrayBuffer())
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${pdfFileName || 'split-pdf'}.zip`
    a.click()
    if (window.showReviewPrompt) window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
    window.rcShowSaveButton?.(zipBtn.parentElement, zipBlob, `${pdfFileName || 'split-pdf'}.zip`, 'split-pdf')
  } catch (e) {
    alert('ZIP failed: ' + e.message)
  }
  zipBtn.textContent = dlZipBtn
  zipBtn.disabled = false
})

// -- SEO section --
;(function injectSEO() {
  const seo = t.seo && t.seo['split-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
