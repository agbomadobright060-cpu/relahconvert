import { injectHeader } from '../core/header.js'
import { LIMITS, formatSize } from '../core/utils.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'

injectHreflang('rotate-pdf')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['rotate-pdf']) || 'Rotate PDF'
const seoData   = t.seo && t.seo['rotate-pdf']
const descText  = t.rotatepdf_desc || (seoData ? seoData.h2a : 'Rotate PDF pages by 90, 180, or 270 degrees.')
const selectLbl = t.rotatepdf_select || t.select_image || 'Select PDFs'
const dropHint  = t.rotatepdf_drop_hint || t.drop_hint || 'or drop PDFs anywhere'
const dlBtn     = t.download || 'Download'
const rotateLbl = t.rotatepdf_apply_btn || 'Apply & Download'
const applyingLbl = t.rotatepdf_applying || 'Applying rotations\u2026'
const pagesLabel = t.rotatepdf_pages || t.pdfpng_pages || 'pages'
const loadingLbl = t.rotatepdf_loading || 'Loading PDFs\u2026'
const cwLbl     = t.rotatepdf_cw || '90\u00B0 CW'
const ccwLbl    = t.rotatepdf_ccw || '90\u00B0 CCW'
const r180Lbl   = t.rotatepdf_180 || '180\u00B0'
const dlAllLbl  = t.rotatepdf_download_all || 'Download All (.zip)'

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .upload-label{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .upload-label:hover{background:var(--accent-hover);}
  .drop-zone{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:16px;padding:40px 24px;border:2px dashed var(--border-light);border-radius:14px;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:var(--bg-card);}
  .drop-zone:hover{border-color:var(--accent);background:var(--accent-bg,rgba(200,75,49,0.04));}
  #fileList{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
  .file-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:border-color 0.15s;}
  .file-card:hover{border-color:var(--accent);}
  .file-card .fname{font-size:13px;color:var(--text-primary);font-family:'DM Sans',sans-serif;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;}
  .file-card .fsize{font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  .file-card .remove-file{width:24px;height:24px;border-radius:50%;background:transparent;color:var(--text-muted);border:1.5px solid var(--border-light);font-size:14px;line-height:24px;text-align:center;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;flex-shrink:0;}
  .file-card .remove-file:hover{background:rgba(200,75,49,0.1);color:var(--accent);border-color:var(--accent);}
  .result-card{background:var(--bg-card);border-radius:10px;border:1.5px solid var(--border);padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
  .result-card .rname{font-size:13px;color:var(--text-primary);font-family:'DM Sans',sans-serif;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;}
  .result-card .rmeta{font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;white-space:nowrap;}
  .result-card .rdl{padding:6px 14px;border:none;border-radius:8px;background:var(--accent);color:var(--text-on-accent);font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background 0.15s;text-decoration:none;flex-shrink:0;}
  .result-card .rdl:hover{background:var(--accent-hover);}
  #anglePicker{display:none;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
  #anglePicker.on{display:flex;}
  .angle-btn{padding:8px 16px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .angle-btn:hover{border-color:var(--accent);color:var(--accent);}
  .angle-btn.active{border-color:var(--accent);background:var(--accent);color:var(--text-on-accent);}
  .angle-label{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;font-family:'DM Sans',sans-serif;}
  #fileMeta{font-size:13px;color:var(--text-tertiary);font-family:'DM Sans',sans-serif;margin-bottom:10px;display:none;}
  #fileMeta.on{display:block;}
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

document.title = t.rotatepdf_page_title || (seoData ? seoData.page_title : 'Rotate PDF Pages Free Online \u2014 90\u00B0, 180\u00B0, 270\u00B0 | RelahConvert')
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.rotatepdf_meta_desc || 'Rotate PDF pages by 90, 180, or 270 degrees free. Rotate all pages of multiple PDFs at once.'
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
      <label for="fileInput" class="drop-zone"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style="font-size:13px;color:var(--text-secondary);margin-top:8px;font-weight:600;">Drop PDFs here</span></label>
    </div>
    <input type="file" id="fileInput" accept="application/pdf,.pdf" multiple style="display:none;" />
    <div id="fileMeta"><span id="fileMetaText"></span><button id="clearBtn" style="background:transparent;color:var(--accent);border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:10px;text-decoration:underline;">${t.remove || 'Clear All'}</button></div>
    <div id="fileList"></div>
    <div id="anglePicker">
      <span class="angle-label">${t.rotatepdf_angle || 'Rotation'}:</span>
      <button class="angle-btn active" data-angle="90">\u21BB ${cwLbl}</button>
      <button class="angle-btn" data-angle="-90">\u21BA ${ccwLbl}</button>
      <button class="angle-btn" data-angle="180">\u21C5 ${r180Lbl}</button>
    </div>
    <div class="status-text" id="statusText"></div>
    <div id="actionRow">
      <button class="action-btn" id="applyBtn" disabled style="background:var(--btn-disabled);opacity:0.7;cursor:not-allowed;">${rotateLbl}</button>
    </div>
    <div id="resultsArea"></div>
    <div id="nextSteps" style="display:none;margin-top:20px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;font-family:'DM Sans',sans-serif;">${t.whats_next || "What's Next?"}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
`

injectHeader()

const fileInput    = document.getElementById('fileInput')
const fileList     = document.getElementById('fileList')
const fileMeta     = document.getElementById('fileMeta')
const fileMetaText = document.getElementById('fileMetaText')
const clearBtn     = document.getElementById('clearBtn')
const anglePicker  = document.getElementById('anglePicker')
const applyBtn     = document.getElementById('applyBtn')
const statusText   = document.getElementById('statusText')
const resultsArea  = document.getElementById('resultsArea')

let pdfFiles = [] // [{ file, bytes, name }]
let selectedAngle = 90

// ── Angle picker ───────────────────────────────────────────────────────────
const angleButtons = anglePicker.querySelectorAll('.angle-btn')
angleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    angleButtons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedAngle = parseInt(btn.dataset.angle, 10)
  })
})

// ── Next steps ──────────────────────────────────────────────────────────────
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns['merge-pdf'] || 'Merge PDF', href: localHref('merge-pdf') },
    { label: ns['split-pdf'] || 'Split PDF', href: localHref('split-pdf') },
    { label: ns['compress-pdf'] || 'Compress PDF', href: localHref('compress-pdf') },
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

// ── State helpers ───────────────────────────────────────────────────────────
function resetState() {
  pdfFiles = []
  fileList.innerHTML = ''
  resultsArea.innerHTML = ''
  fileMeta.classList.remove('on')
  anglePicker.classList.remove('on')
  statusText.textContent = ''
  disableApply()
  document.getElementById('nextSteps').style.display = 'none'
}

function disableApply() {
  applyBtn.disabled = true
  applyBtn.style.opacity = '0.7'
  applyBtn.style.cursor = 'not-allowed'
  applyBtn.style.background = 'var(--btn-disabled)'
}

function enableApply() {
  applyBtn.disabled = false
  applyBtn.style.opacity = '1'
  applyBtn.style.cursor = 'pointer'
  applyBtn.style.background = 'var(--accent)'
}

function updateUI() {
  fileMetaText.textContent = `${pdfFiles.length} ${pdfFiles.length === 1 ? 'file' : 'files'} selected`
  if (pdfFiles.length > 0) {
    fileMeta.classList.add('on')
    anglePicker.classList.add('on')
    enableApply()
  } else {
    fileMeta.classList.remove('on')
    anglePicker.classList.remove('on')
    disableApply()
  }
}

function renderFileList() {
  fileList.innerHTML = ''
  pdfFiles.forEach((entry, idx) => {
    const card = document.createElement('div')
    card.className = 'file-card'
    card.innerHTML = `<span class="fname">${entry.name}</span><span class="fsize">${formatSize(entry.file.size)}</span>`
    const removeBtn = document.createElement('button')
    removeBtn.className = 'remove-file'
    removeBtn.textContent = '\u00D7'
    removeBtn.addEventListener('click', () => {
      pdfFiles.splice(idx, 1)
      renderFileList()
      updateUI()
    })
    card.appendChild(removeBtn)
    fileList.appendChild(card)
  })
}

clearBtn.addEventListener('click', resetState)

function rotationLabel(deg) {
  if (deg === 90) return cwLbl
  if (deg === -90 || deg === 270) return ccwLbl
  if (deg === 180) return r180Lbl
  return deg + '\u00B0'
}

// ── Add files ──────────────────────────────────────────────────────────────
async function addFiles(files) {
  resultsArea.innerHTML = ''
  document.getElementById('nextSteps').style.display = 'none'

  for (const file of files) {
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      statusText.textContent = t.warn_wrong_fmt_short || 'Please select PDF files only.'
      continue
    }
    if (file.size > LIMITS.MAX_PER_FILE_BYTES) {
      statusText.textContent = `${file.name}: too large. Max ${formatSize(LIMITS.MAX_PER_FILE_BYTES)} per file.`
      continue
    }
    if (pdfFiles.length >= LIMITS.MAX_FILES) {
      statusText.textContent = `Maximum ${LIMITS.MAX_FILES} files allowed.`
      break
    }
    const buf = await file.arrayBuffer()
    pdfFiles.push({ file, bytes: new Uint8Array(buf.slice(0)), name: file.name })
  }

  renderFileList()
  updateUI()
  if (pdfFiles.length > 0) statusText.textContent = ''
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles(Array.from(fileInput.files))
  fileInput.value = ''
})
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => {
  e.preventDefault()
  if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files))
})

// ── Apply rotations with pdf-lib ────────────────────────────────────────────
applyBtn.addEventListener('click', async () => {
  if (!pdfFiles.length) return

  applyBtn.disabled = true
  applyBtn.style.opacity = '0.7'
  applyBtn.style.cursor = 'not-allowed'
  statusText.textContent = applyingLbl
  resultsArea.innerHTML = ''

  try {
    const { PDFDocument, degrees } = await import('pdf-lib')
    const results = [] // [{ name, blob, originalSize }]

    for (let i = 0; i < pdfFiles.length; i++) {
      const entry = pdfFiles[i]
      statusText.textContent = `${applyingLbl} (${i + 1}/${pdfFiles.length})`

      const pdfDoc = await PDFDocument.load(entry.bytes)
      const pages = pdfDoc.getPages()

      for (const page of pages) {
        const currentRotation = page.getRotation().angle
        page.setRotation(degrees(currentRotation + selectedAngle))
      }

      const rotatedBytes = await pdfDoc.save()
      const blob = new Blob([rotatedBytes], { type: 'application/pdf' })
      const baseName = entry.name.replace(/\.[^.]+$/, '')
      results.push({ name: `${baseName}-rotated.pdf`, blob, originalSize: entry.file.size })
    }

    // Render per-file results
    results.forEach(r => {
      const card = document.createElement('div')
      card.className = 'result-card'
      const url = URL.createObjectURL(r.blob)
      card.innerHTML = `<span class="rname">${r.name}</span><span class="rmeta">${formatSize(r.originalSize)} \u2192 Rotated ${rotationLabel(selectedAngle)}</span>`
      const dlLink = document.createElement('a')
      dlLink.className = 'rdl'
      dlLink.href = url
      dlLink.download = r.name
      dlLink.textContent = dlBtn
      card.appendChild(dlLink)
      resultsArea.appendChild(card)
    })

    // Download All as ZIP for multiple files
    if (results.length > 1) {
      const zipBtn = document.createElement('button')
      zipBtn.className = 'action-btn dark'
      zipBtn.textContent = dlAllLbl
      zipBtn.style.marginTop = '8px'
      zipBtn.addEventListener('click', async () => {
        zipBtn.disabled = true
        zipBtn.textContent = t.rotatepdf_zipping || 'Creating ZIP\u2026'
        try {
          const JSZipModule = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
          const JSZip = JSZipModule.default || window.JSZip
          const zip = new JSZip()
          for (const r of results) {
            zip.file(r.name, r.blob)
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          const url = URL.createObjectURL(zipBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'rotated-pdfs.zip'
          a.click()
          setTimeout(() => URL.revokeObjectURL(url), 10000)
        } catch (err) {
          console.error('[rotate-pdf] zip failed:', err)
          statusText.textContent = (t.rotatepdf_zip_error || 'Failed to create ZIP: ') + (err?.message || err)
        }
        zipBtn.disabled = false
        zipBtn.textContent = dlAllLbl
      })
      resultsArea.appendChild(zipBtn)
    } else if (results.length === 1) {
      // Auto-download for single file
      const url = URL.createObjectURL(results[0].blob)
      const a = document.createElement('a')
      a.href = url
      a.download = results[0].name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      window.rcShowSaveButton?.(applyBtn.parentElement, results[0].blob, results[0].name, 'rotate-pdf')
    }

    statusText.textContent = (t.rotatepdf_done || 'Done!') + ` ${results.length} ${results.length === 1 ? 'file' : 'files'} rotated.`

    buildNextSteps()
    if (window.showReviewPrompt) window.showReviewPrompt()
  } catch (err) {
    console.error('[rotate-pdf] apply failed:', err)
    statusText.textContent = (t.rotatepdf_error || 'Failed to rotate PDF: ') + (err?.message || err)
  }

  enableApply()
})

// ── SEO section ─────────────────────────────────────────────────────────────
;(function injectSEO() {
  const seo = t.seo && t.seo['rotate-pdf']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l => `<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
})()
