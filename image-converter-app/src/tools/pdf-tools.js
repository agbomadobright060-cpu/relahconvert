import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang } from '../core/i18n.js'

injectHreflang('pdf-tools')

const t = getT()

const hubDesc = t.pdfhub_desc || 'Edit, organize, and optimize your PDF documents instantly.'

document.title = t.pdfhub_page_title || 'PDF Tools — Edit, Organize and Optimize PDFs Free | RelahConvert'
const _metaDesc = document.createElement('meta')
_metaDesc.name = 'description'
_metaDesc.content = t.pdfhub_meta_desc || hubDesc
document.head.appendChild(_metaDesc)

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);font-family:"DM Sans",sans-serif;display:flex;flex-direction:column;'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app{flex:1;position:relative;z-index:2;}
  #app>div{animation:fadeUp 0.4s ease both}

  /* Decorative background */
  .bg-canvas{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
  .pdf-block{position:absolute;background:var(--bg-card);border-radius:10px;box-shadow:0 4px 16px rgba(80,100,180,0.13),0 1px 4px rgba(0,0,0,0.07);overflow:hidden;opacity:0.75;}
  .pdf-block .block-area{width:100%;height:76%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--c1),var(--c2));}
  .pdf-block .block-area svg{width:52%;height:52%;opacity:0.55;}
  .pdf-block .block-bar{height:24%;background:var(--bg-card);}
  .pdf-block:nth-child(1){width:105px;height:122px;top:6%;left:-20px;transform:rotate(-7deg);--c1:#fca5a5;--c2:#ef4444;}
  .pdf-block:nth-child(2){width:82px;height:96px;top:20%;left:55px;transform:rotate(5deg);--c1:#93c5fd;--c2:#3b82f6;}
  .pdf-block:nth-child(3){width:92px;height:108px;top:44%;left:-15px;transform:rotate(-4deg);--c1:#c4b5fd;--c2:#8b5cf6;}
  .pdf-block:nth-child(4){width:76px;height:90px;top:63%;left:50px;transform:rotate(7deg);--c1:#86efac;--c2:#22c55e;}
  .pdf-block:nth-child(5){width:98px;height:114px;top:79%;left:-18px;transform:rotate(-5deg);--c1:#fde68a;--c2:#f59e0b;}
  .pdf-block:nth-child(6){width:100px;height:118px;top:5%;right:-18px;transform:rotate(6deg);--c1:#fca5a5;--c2:#dc2626;}
  .pdf-block:nth-child(7){width:78px;height:92px;top:20%;right:52px;transform:rotate(-8deg);--c1:#a5f3fc;--c2:#06b6d4;}
  .pdf-block:nth-child(8){width:90px;height:106px;top:45%;right:-15px;transform:rotate(5deg);--c1:#d8b4fe;--c2:#a855f7;}
  .pdf-block:nth-child(9){width:74px;height:88px;top:63%;right:50px;transform:rotate(-6deg);--c1:#86efac;--c2:#16a34a;}
  .pdf-block:nth-child(10){width:96px;height:112px;top:79%;right:-16px;transform:rotate(7deg);--c1:#fdba74;--c2:#ea580c;}
  .bg-fade{position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse 50% 65% at 50% 40%,rgba(238,241,248,0) 5%,rgba(238,241,248,0.45) 45%,rgba(238,241,248,0.80) 68%);}
  [data-theme="dark"] .pdf-block{opacity:0.5;}
  [data-theme="dark"] .bg-fade{background:radial-gradient(ellipse 50% 65% at 50% 40%,rgba(24,24,27,0) 5%,rgba(24,24,27,0.45) 45%,rgba(24,24,27,0.80) 68%);}

  /* Hero */
  .pdf-hero{text-align:center;padding:56px 16px 40px;max-width:700px;margin:0 auto;position:relative;z-index:2;}
  .pdf-hero h1{font-family:'Fraunces',serif;font-size:clamp(32px,6vw,52px);font-weight:400;color:var(--text-primary);line-height:1.1;letter-spacing:-0.02em;margin-bottom:14px;}
  .pdf-hero h1 em{font-style:italic;color:var(--accent);}
  .pdf-hero p{font-size:15px;color:var(--text-tertiary);line-height:1.6;}

  /* Tools grid */
  .pdf-tools-section{max-width:1280px;margin:0 auto;padding:0 24px 60px;width:100%;position:relative;z-index:2;}
  .pdf-tools-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
  .pdf-tool-card{position:relative;background:var(--bg-card);border-radius:12px;padding:20px 18px;text-decoration:none;border:1.5px solid transparent;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:all 0.2s;display:block;}
  .pdf-tool-card:hover{border-color:var(--accent);box-shadow:0 4px 14px rgba(200,75,49,0.12);transform:translateY(-2px);}
  .pdf-tool-card .icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;flex-shrink:0;}
  .pdf-tool-card .icon svg{width:42px;height:42px;display:block;}
  .pdf-tool-card h2{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:5px;letter-spacing:-0.01em;}
  .pdf-tool-card p{font-size:12px;color:var(--text-tertiary);line-height:1.5;}
  @media(max-width:1100px){.pdf-tools-grid{grid-template-columns:repeat(4,1fr);}}
  @media(max-width:900px){.pdf-tools-grid{grid-template-columns:repeat(3,1fr);}}
  @media(max-width:768px){
    .pdf-tools-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
    .pdf-tool-card{padding:16px 14px;border-radius:10px;}
    .pdf-tool-card .icon{width:40px;height:40px;border-radius:9px;margin-bottom:9px;}
    .pdf-tool-card .icon svg{width:26px;height:26px;}
    .pdf-tool-card h2{font-size:13px;}
    .pdf-tool-card p{display:none;}
    .pdf-hero{padding:36px 16px 28px;}
    .pdf-block{opacity:0.5;}
  }
`
document.head.appendChild(style)

// iLovePDF style: two small SOLID-FILLED colored squares overlapping (like little tiles/papers),
// with a tiny corner accent symbol. No outlined documents — bold filled blocks.
const svgIcons = {
  'merge-pdf':        { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="14" width="18" height="18" rx="3" fill="#E94B2C"/><rect x="19" y="6" width="18" height="18" rx="3" fill="#E94B2C"/><path d="M16 19l-3 3 3 3M13 22h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  'split-pdf':        { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="14" width="18" height="18" rx="3" fill="#F97316"/><rect x="19" y="6" width="18" height="18" rx="3" fill="#F97316"/><path d="M13 19l3 3-3 3M19 22h-6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  'rotate-pdf':       { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="9" y="9" width="24" height="24" rx="3" fill="#16A34A"/><path d="M27 17a7 7 0 11-11 0" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M27 13v5h-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>` },
  'compress-pdf':     { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="4" y="4" width="13" height="13" rx="2.5" fill="#16A34A"/><rect x="25" y="4" width="13" height="13" rx="2.5" fill="#16A34A"/><rect x="4" y="25" width="13" height="13" rx="2.5" fill="#16A34A"/><rect x="25" y="25" width="13" height="13" rx="2.5" fill="#16A34A"/><path d="M9 9l4 4M33 9l-4 4M9 33l4-4M33 33l-4-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>` },
  'reorder-pdf':      { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="6" y="7" width="30" height="7" rx="2" fill="#7C3AED"/><rect x="6" y="17.5" width="30" height="7" rx="2" fill="#7C3AED" opacity="0.55"/><rect x="6" y="28" width="30" height="7" rx="2" fill="#7C3AED"/><circle cx="32" cy="10.5" r="1.4" fill="#fff"/><circle cx="32" cy="31.5" r="1.4" fill="#fff"/></svg>` },
  'extract-pdf':      { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="14" width="18" height="18" rx="3" fill="#0891B2" opacity="0.45"/><rect x="19" y="6" width="18" height="18" rx="3" fill="#0891B2"/><path d="M28 11v6M25 14l3 3 3-3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  'remove-pdf':       { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="14" width="18" height="18" rx="3" fill="#E11D48" opacity="0.45"/><rect x="19" y="6" width="18" height="18" rx="3" fill="#E11D48"/><path d="M24 11l8 8M32 11l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>` },
  'add-page-numbers': { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="6" width="24" height="30" rx="3" fill="#EA580C"/><circle cx="32" cy="32" r="7" fill="#EA580C"/><text x="32" y="35.5" font-family="Arial,sans-serif" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">1</text><circle cx="17" cy="21" r="1.5" fill="#fff" opacity="0.9"/><path d="M11 14h12M11 28h12" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/></svg>` },
  'watermark-pdf':    { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="6" y="6" width="30" height="30" rx="3" fill="#6366F1"/><text x="21" y="26" font-family="Arial Black,sans-serif" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle" transform="rotate(-26 21 23)" opacity="0.95">DRAFT</text></svg>` },
  'crop-pdf':         { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="11" y="11" width="20" height="20" rx="2" fill="#0D9488"/><path d="M14 4v8H6M28 38v-8h8" stroke="#0D9488" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>` },
  'protect-pdf':      { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="6" y="6" width="30" height="30" rx="3" fill="#059669"/><rect x="13" y="20" width="16" height="12" rx="1.8" fill="#fff"/><path d="M16 20v-3a5 5 0 0110 0v3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="21" cy="26" r="1.8" fill="#059669"/></svg>` },
  'unlock-pdf':       { svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="6" y="6" width="30" height="30" rx="3" fill="#DC2626"/><rect x="13" y="20" width="16" height="12" rx="1.8" fill="#fff"/><path d="M16 20v-3a5 5 0 019-3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="21" cy="26" r="1.8" fill="#DC2626"/></svg>` },
  'extract-images-pdf':{ svg: `<svg viewBox="0 0 42 42" fill="none"><rect x="5" y="14" width="18" height="18" rx="3" fill="#9333EA" opacity="0.45"/><rect x="19" y="6" width="18" height="18" rx="3" fill="#9333EA"/><circle cx="25" cy="12" r="1.6" fill="#fff"/><path d="M21 19l3-3 2.5 2.5L29 16l4 4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>` },
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
  'watermark-pdf':    t.card_watermark_pdf_desc || 'Add text watermark to PDF pages. Customize opacity, position, and size.',
  'crop-pdf':         t.card_crop_pdf_desc || 'Crop PDF pages by adjusting margins. Trim whitespace or resize.',
  'protect-pdf':      t.card_protect_pdf_desc || 'Add password protection to your PDF. AES-256 encryption.',
  'unlock-pdf':       t.card_unlock_pdf_desc || 'Remove password from a protected PDF. Preserves original content.',
  'extract-images-pdf': t.card_extract_images_pdf_desc || 'Extract all images from a PDF document. Download as PNG.',
}

const pdfToolSlugs = ['merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf','protect-pdf','unlock-pdf','extract-images-pdf']

// Decorative PDF icon for background blocks
const bgIcon = `<svg viewBox="0 0 60 40" fill="none"><path d="M15 5h18l8 8v22a2 2 0 01-2 2H15a2 2 0 01-2-2V7a2 2 0 012-2z" fill="rgba(255,255,255,0.7)"/><path d="M33 5v9h9" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/><text x="22" y="28" font-family="Arial" font-size="8" font-weight="800" fill="rgba(255,255,255,0.6)">PDF</text></svg>`

// Inject background decoration into body (outside #app, like homepage)
const bgCanvas = document.createElement('div')
bgCanvas.className = 'bg-canvas'
bgCanvas.innerHTML = Array.from({length:10}, () => `<div class="pdf-block"><div class="block-area">${bgIcon}</div><div class="block-bar"></div></div>`).join('')
document.body.insertBefore(bgCanvas, document.body.firstChild)
const bgFade = document.createElement('div')
bgFade.className = 'bg-fade'
document.body.insertBefore(bgFade, bgCanvas.nextSibling)

document.querySelector('#app').innerHTML = `
  <div>
    <section class="pdf-hero">
      <h1>${t.pdfhub_hero_1 || 'Every PDF tool'}<br>${t.pdfhub_hero_2 || 'you need,'} <em>${t.pdfhub_hero_em || 'free'}</em></h1>
      <p>${hubDesc}</p>
    </section>
    <section class="pdf-tools-section">
      <div class="pdf-tools-grid">
        ${pdfToolSlugs.map(slug => {
          const ic = svgIcons[slug]
          return `<a href="${localHref(slug)}" class="pdf-tool-card">
            <div class="icon">${ic.svg}</div>
            <h2>${ns[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
            <p>${cardDescs[slug]}</p>
          </a>`
        }).join('')}
      </div>
    </section>
  </div>
`

injectHeader()
