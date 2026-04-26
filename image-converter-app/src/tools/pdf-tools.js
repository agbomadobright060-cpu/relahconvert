import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang } from '../core/i18n.js'

injectHreflang('pdf-tools')

const t = getT()

const hubTitle = t.pdfhub_title || 'PDF Tools'
const hubDesc  = t.pdfhub_desc || 'Edit, organize, and optimize your PDF documents instantly.'

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
  .pdf-hero{text-align:center;padding:56px 16px 40px;max-width:700px;margin:0 auto;}
  .pdf-hero h1{font-family:'Fraunces',serif;font-size:clamp(32px,6vw,52px);font-weight:400;color:var(--text-primary);line-height:1.1;letter-spacing:-0.02em;margin-bottom:14px;}
  .pdf-hero h1 em{font-style:italic;color:var(--accent);}
  .pdf-hero p{font-size:15px;color:var(--text-tertiary);line-height:1.6;}
  .pdf-tools-section{max-width:1180px;margin:0 auto;padding:0 24px 60px;width:100%;}
  .pdf-tools-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
  .pdf-tool-card{position:relative;background:var(--bg-card);border-radius:16px;padding:28px 26px;text-decoration:none;border:1.5px solid transparent;box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all 0.2s;display:block;}
  .pdf-tool-card:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(200,75,49,0.12);transform:translateY(-2px);}
  .pdf-tool-card .icon{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
  .pdf-tool-card .icon svg{width:34px;height:34px;display:block;}
  .pdf-tool-card h2{font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:var(--text-primary);margin-bottom:8px;letter-spacing:-0.01em;}
  .pdf-tool-card p{font-size:13px;color:var(--text-tertiary);line-height:1.55;}
  @media(max-width:900px){.pdf-tools-grid{grid-template-columns:repeat(3,1fr);}}
  @media(max-width:768px){
    .pdf-tools-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
    .pdf-tool-card{padding:18px 16px;border-radius:14px;}
    .pdf-tool-card .icon{width:44px;height:44px;border-radius:10px;margin-bottom:10px;}
    .pdf-tool-card .icon svg{width:34px;height:34px;}
    .pdf-tool-card h2{font-size:14px;}
    .pdf-tool-card p{display:none;}
    .pdf-hero{padding:36px 16px 28px;}
  }
`
document.head.appendChild(style)

const svgIcons = {
  'merge-pdf':        { bg: '#2563EB', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="12" height="16" rx="2" fill="#fff" opacity="0.6"/><rect x="22" y="16" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M16 20l6-4v8z" fill="#fff"/></svg>` },
  'split-pdf':        { bg: '#D97706', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="6" width="24" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 8v24" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 2"/><path d="M16 20l-4 3v-6z" fill="#fff"/><path d="M24 20l4 3v-6z" fill="#fff"/></svg>` },
  'rotate-pdf':       { bg: '#16A34A', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="8" width="20" height="24" rx="2" fill="#fff" opacity="0.3"/><path d="M26 16a8 8 0 11-12 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M26 12v5h-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  'compress-pdf':     { bg: '#DC2626', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 14v8M20 22l-3 3M20 22l3 3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 28h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  'reorder-pdf':      { bg: '#7C3AED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="8" width="20" height="6" rx="1.5" fill="#fff" opacity="0.5"/><rect x="10" y="17" width="20" height="6" rx="1.5" fill="#fff"/><rect x="10" y="26" width="20" height="6" rx="1.5" fill="#fff" opacity="0.5"/></svg>` },
  'extract-pdf':      { bg: '#059669', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 16v10M17 19l3-3 3 3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  'remove-pdf':       { bg: '#E11D48', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M15 19l10 8M25 19l-10 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>` },
  'add-page-numbers': { bg: '#EA580C', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><text x="20" y="25" font-family="Arial" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">1</text></svg>` },
}

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

const pdfToolSlugs = ['merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers']

const _tp = hubTitle.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.querySelector('#app').innerHTML = `
  <div>
    <section class="pdf-hero">
      <h1>${titlePart1} <em>${titlePart2}</em></h1>
      <p>${hubDesc}</p>
    </section>
    <section class="pdf-tools-section">
      <div class="pdf-tools-grid">
        ${pdfToolSlugs.map(slug => {
          const ic = svgIcons[slug]
          return `<a href="${localHref(slug)}" class="pdf-tool-card">
            <div class="icon" style="background:${ic.bg}">${ic.svg}</div>
            <h2>${ns[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
            <p>${cardDescs[slug]}</p>
          </a>`
        }).join('')}
      </div>
    </section>
  </div>
`

injectHeader()
