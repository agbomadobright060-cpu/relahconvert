import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang } from '../core/i18n.js'

injectHreflang('pdf-tools')

const t = getT()

const hubTitle = t.pdfhub_title || 'PDF Tools'
const hubDesc  = t.pdfhub_desc || 'Free online PDF tools. Merge, split, compress, rotate, reorder, extract, remove pages and add page numbers — all in your browser.'

document.title = t.pdfhub_page_title || 'Free Online PDF Tools — Merge, Split, Compress, Rotate PDF | RelahConvert'
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.pdfhub_meta_desc || hubDesc
document.head.appendChild(_metaDesc)

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .pdf-hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:24px;}
  .pdf-hub-card{background:var(--bg-card);border:1.5px solid var(--border);border-radius:14px;padding:24px 20px;text-decoration:none;transition:all 0.18s;display:flex;align-items:flex-start;gap:16px;}
  .pdf-hub-card:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(200,75,49,0.10);transform:translateY(-2px);}
  .pdf-hub-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;}
  .pdf-hub-info{flex:1;min-width:0;}
  .pdf-hub-info h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 4px;line-height:1.3;}
  .pdf-hub-info p{font-size:13px;color:var(--text-tertiary);margin:0;line-height:1.5;font-family:'DM Sans',sans-serif;}
  .pdf-hub-arrow{color:var(--text-muted);font-size:18px;margin-top:4px;flex-shrink:0;transition:color 0.15s;}
  .pdf-hub-card:hover .pdf-hub-arrow{color:var(--accent);}
`
document.head.appendChild(style)

const pdfTools = [
  { slug: 'merge-pdf',       icon: '📑', bg: '#EFF6FF', color: '#2563EB' },
  { slug: 'split-pdf',       icon: '✂️', bg: '#FEF3C7', color: '#D97706' },
  { slug: 'rotate-pdf',      icon: '🔄', bg: '#F0FDF4', color: '#16A34A' },
  { slug: 'compress-pdf',    icon: '📦', bg: '#FEF2F2', color: '#DC2626' },
  { slug: 'reorder-pdf',     icon: '↕️', bg: '#F5F3FF', color: '#7C3AED' },
  { slug: 'extract-pdf',     icon: '📤', bg: '#ECFDF5', color: '#059669' },
  { slug: 'remove-pdf',      icon: '🗑️', bg: '#FFF1F2', color: '#E11D48' },
  { slug: 'add-page-numbers',icon: '#️⃣', bg: '#FFF7ED', color: '#EA580C' },
]

const ns = t.nav_short || {}
const cardDescs = {
  'merge-pdf':        t.card_merge_pdf_desc || 'Combine multiple PDF files into a single document. Drag to reorder before merging.',
  'split-pdf':        t.card_split_pdf_desc || 'Split a PDF into separate pages or custom page ranges.',
  'rotate-pdf':       t.card_rotate_pdf_desc || 'Rotate PDF pages by 90, 180, or 270 degrees. Rotate all or individual pages.',
  'compress-pdf':     t.card_compress_pdf_desc || 'Reduce PDF file size by optimizing images and removing unnecessary data.',
  'reorder-pdf':      t.card_reorder_pdf_desc || 'Drag and drop to rearrange PDF pages in any order you want.',
  'extract-pdf':      t.card_extract_pdf_desc || 'Extract specific pages from a PDF and save them as a new document.',
  'remove-pdf':       t.card_remove_pdf_desc || 'Delete unwanted pages from a PDF document.',
  'add-page-numbers': t.card_add_page_numbers_desc || 'Add page numbers to your PDF. Choose position, font size, and starting number.',
}

const _tp = hubTitle.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div style="max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:8px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:var(--accent);">${titlePart2}</em></h1>
      <p style="font-size:14px;color:var(--text-tertiary);margin:0;max-width:600px;line-height:1.5;">${hubDesc}</p>
    </div>
    <div class="pdf-hub-grid">
      ${pdfTools.map(tool => `
        <a href="${localHref(tool.slug)}" class="pdf-hub-card">
          <div class="pdf-hub-icon" style="background:${tool.bg};">
            <span>${tool.icon}</span>
          </div>
          <div class="pdf-hub-info">
            <h3>${ns[tool.slug] || tool.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
            <p>${cardDescs[tool.slug]}</p>
          </div>
          <span class="pdf-hub-arrow">\u203A</span>
        </a>
      `).join('')}
    </div>
  </div>
`

injectHeader()
