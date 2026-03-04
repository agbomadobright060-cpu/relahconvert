import { convertFile, convertFilesToZip } from './core/converter.js'
import { LIMITS, formatSize, fileKey, totalBytes } from './core/utils.js'
import { getCurrentTool } from './app/router.js'
import { injectHeader } from './core/header.js'
import { getT } from './core/i18n.js'

const currentTool = getCurrentTool()
const bg = '#F2F2F2'
const t = getT()

const relatedLinks = {
  'jpg-to-png':  [{ href: '/webp-to-png', label: 'Convert WebP to PNG' }],
  'png-to-jpg':  [{ href: '/webp-to-jpg', label: 'Convert WebP to JPG' }],
  'jpg-to-webp': [{ href: '/png-to-webp', label: 'Convert PNG to WebP' }],
  'webp-to-jpg': [{ href: '/png-to-jpg',  label: 'Convert PNG to JPG' }],
  'png-to-webp': [{ href: '/jpg-to-webp', label: 'Convert JPG to WebP' }],
  'webp-to-png': [{ href: '/jpg-to-png',  label: 'Convert JPG to PNG' }],
}

const nextStepsMap = {
  'image/png':  [
    { href: '/compress',   label: t.next_compress },
    { href: '/resize',     label: t.next_resize },
    { href: '/png-to-pdf', label: t.next_to_pdf },
  ],
  'image/jpeg': [
    { href: '/compress',   label: t.next_compress },
    { href: '/resize',     label: t.next_resize },
    { href: '/jpg-to-pdf', label: t.next_to_pdf },
  ],
  'image/webp': [
    { href: '/compress',   label: t.next_compress },
    { href: '/resize',     label: t.next_resize },
  ],
}

// SEO content per tool
const seoContent = {
  'jpg-to-png': {
    metaDesc: 'Convert JPG to PNG free without uploading to a server. Browser-based JPG to PNG converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert JPG to PNG Without Uploading',
    steps: [
      '<strong>Select your JPG images</strong> — click "Select Images" or drag and drop JPG files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your PNG</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free JPG to PNG Converter That Doesn\'t Upload Your Files',
    body: `<p>PNG is the preferred format for logos, icons, and graphics that require transparent backgrounds or lossless quality. Most online JPG to PNG converters upload your file to a remote server before converting it — meaning your image passes through systems outside your control. RelahConvert converts JPG to PNG entirely inside your browser. Your file never leaves your device.</p>
<p>Whether you're a graphic designer needing a transparent version of an image, a developer preparing assets for a web project, or simply converting files to meet a platform requirement, this tool handles it privately and instantly.</p>`,
    h3why: 'Why Convert JPG to PNG?',
    why: 'PNG is a lossless format that supports transparent backgrounds — making it the go-to choice for logos, icons, UI assets, and any image that needs crisp edges. Converting JPG to PNG ensures your image retains maximum detail and supports transparency for design work.',
    faqs: [
      { q: 'How do I convert JPG to PNG without losing quality?', a: 'The conversion process itself is lossless — no additional quality is lost when converting to PNG. However, quality lost when the JPG was originally created cannot be recovered.' },
      { q: 'What is the best free JPG to PNG converter that doesn\'t upload files?', a: 'RelahConvert converts JPG to PNG entirely in your browser with zero server uploads. Your files never leave your device.' },
      { q: 'Does PNG support transparent backgrounds?', a: 'Yes — unlike JPG, PNG supports full transparency, which is why it\'s preferred for logos and graphics.' },
      { q: 'Can I convert multiple JPG files to PNG at once?', a: 'Yes — batch conversion is fully supported. Multiple files are delivered as a ZIP download.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/png-to-jpg', label: 'PNG to JPG' },
      { href: '/jpg-to-webp', label: 'JPG to WebP' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
  'png-to-jpg': {
    metaDesc: 'Convert PNG to JPG free without uploading to a server. Browser-based PNG to JPG converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert PNG to JPG Without Uploading',
    steps: [
      '<strong>Select your PNG images</strong> — click "Select Images" or drag and drop PNG files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your JPG</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free PNG to JPG Converter That Doesn\'t Upload Your Files',
    body: `<p>JPG files are significantly smaller than PNGs for photographic images, making them ideal for websites, emails, and social media where load speed matters. Most PNG to JPG converters require you to upload your image to a server. RelahConvert converts PNG to JPG entirely in your browser — no upload, no server processing, no privacy concerns.</p>
<p>Developers optimizing website images, bloggers reducing attachment sizes, ecommerce sellers converting product graphics, and anyone sharing images online benefits from a fast, private PNG to JPG converter.</p>`,
    h3why: 'Why Convert PNG to JPG?',
    why: 'JPG is significantly smaller than PNG for photographic images — typically 60–80% smaller — making it the better choice for websites, emails, and social sharing where file size and load speed matter.',
    faqs: [
      { q: 'How do I convert PNG to JPG without losing quality?', a: 'Set the quality to high during conversion. The difference at high quality settings is imperceptible to the human eye while still producing a much smaller file.' },
      { q: 'What happens to the transparent background when converting PNG to JPG?', a: 'JPG does not support transparency. Transparent areas are filled with white by default during conversion.' },
      { q: 'How much smaller will the JPG be compared to the PNG?', a: 'For photographic images, JPG is typically 60–80% smaller than the equivalent PNG.' },
      { q: 'Can I convert multiple PNG files to JPG at once?', a: 'Yes — batch conversion is supported. Multiple files are delivered as a ZIP download.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/jpg-to-png', label: 'JPG to PNG' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/png-to-webp', label: 'PNG to WebP' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
  'jpg-to-webp': {
    metaDesc: 'Convert JPG to WebP free without uploading to a server. Browser-based JPG to WebP converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert JPG to WebP Without Uploading',
    steps: [
      '<strong>Select your JPG images</strong> — click "Select Images" or drag and drop JPG files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your WebP</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free JPG to WebP Converter That Doesn\'t Upload Your Files',
    body: `<p>WebP is Google's modern image format built for the web. It produces files 25–35% smaller than JPG at equivalent visual quality, directly improving page load times and Google Core Web Vitals scores. Most online JPG to WebP converters upload your files to a remote server. RelahConvert converts JPG to WebP entirely inside your browser — your images stay on your device throughout the entire process.</p>
<p>Web developers optimizing site performance, bloggers improving page speed scores, and ecommerce sellers reducing image payload all benefit from converting JPG to WebP.</p>`,
    h3why: 'Why Convert JPG to WebP?',
    why: 'WebP files are 25–35% smaller than JPG at equivalent quality, making pages load faster and directly improving Core Web Vitals scores. Google PageSpeed Insights specifically recommends serving images in next-gen formats like WebP.',
    faqs: [
      { q: 'How do I convert JPG to WebP for free without uploading?', a: 'Use RelahConvert — select your JPG, click Convert, and download your WebP instantly. Everything runs in your browser with no uploads.' },
      { q: 'How much smaller is WebP compared to JPG?', a: 'WebP files are typically 25–35% smaller than JPG at the same visual quality level.' },
      { q: 'Is WebP supported by all browsers?', a: 'Yes — WebP is supported by Chrome, Firefox, Safari, Edge, and all other major modern browsers.' },
      { q: 'Will converting to WebP improve my Google PageSpeed score?', a: 'Yes — Google PageSpeed Insights specifically recommends serving images in next-gen formats like WebP to improve load times.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/webp-to-jpg', label: 'WebP to JPG' },
      { href: '/jpg-to-png', label: 'JPG to PNG' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
  'webp-to-jpg': {
    metaDesc: 'Convert WebP to JPG free without uploading to a server. Browser-based WebP to JPG converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert WebP to JPG Without Uploading',
    steps: [
      '<strong>Select your WebP images</strong> — click "Select Images" or drag and drop WebP files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your JPG</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free WebP to JPG Converter That Doesn\'t Upload Your Files',
    body: `<p>Despite strong browser support, WebP files aren't accepted by many image editors, design tools, CMS platforms, and older applications. JPG is universally compatible — it opens everywhere. RelahConvert converts WebP to JPG entirely in your browser, meaning your files are never sent to a remote server. Fast, private, and completely free.</p>
<p>Designers downloading assets from the web, developers working with legacy systems that don't support WebP, and anyone who receives WebP files and needs JPG compatibility will find this tool essential.</p>`,
    h3why: 'Why Convert WebP to JPG?',
    why: 'WebP is great for the web but not universally supported by image editors, design tools, and older platforms. JPG is the universal standard — it opens in every application, on every device, without compatibility issues.',
    faqs: [
      { q: 'How do I convert WebP to JPG without uploading to a server?', a: 'Use RelahConvert — select your WebP file, click Convert, and download your JPG. Everything happens locally in your browser.' },
      { q: 'Will the JPG look the same as the WebP?', a: 'At high quality settings the visual difference is imperceptible. Our converter uses high quality settings by default.' },
      { q: 'Can I convert multiple WebP files to JPG at once?', a: 'Yes — batch conversion is fully supported. Multiple files are delivered as a ZIP download.' },
      { q: 'What software can open JPG that can\'t open WebP?', a: 'Most image editors including older versions of Photoshop, GIMP, Paint, and Microsoft Office all open JPG but may not support WebP natively.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/jpg-to-webp', label: 'JPG to WebP' },
      { href: '/png-to-jpg', label: 'PNG to JPG' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
  'png-to-webp': {
    metaDesc: 'Convert PNG to WebP free without uploading to a server. Browser-based PNG to WebP converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert PNG to WebP Without Uploading',
    steps: [
      '<strong>Select your PNG images</strong> — click "Select Images" or drag and drop PNG files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your WebP</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free PNG to WebP Converter That Doesn\'t Upload Your Files',
    body: `<p>PNG files are large. WebP offers similar or better quality at 30–50% smaller file sizes, making it the superior choice for web images. Switching from PNG to WebP is one of the fastest ways to improve website performance and Core Web Vitals scores. RelahConvert converts PNG to WebP entirely in your browser — no file uploads, no server processing, no privacy risk.</p>
<p>Web developers, bloggers, and site owners converting image libraries to WebP will see immediate gains in page speed. And unlike most online converters, RelahConvert never uploads your images to a third-party server.</p>`,
    h3why: 'Why Convert PNG to WebP?',
    why: 'WebP files are 30–50% smaller than PNG at equivalent quality with full transparency support — making it a direct upgrade for web images. Converting PNG to WebP is one of the most impactful optimizations you can make for page speed.',
    faqs: [
      { q: 'How do I convert PNG to WebP for free without uploading?', a: 'Select your PNG in RelahConvert, click Convert, and download your WebP. The entire process runs locally in your browser — nothing is uploaded.' },
      { q: 'Does WebP support transparency like PNG?', a: 'Yes — WebP fully supports transparent backgrounds, making it a direct replacement for PNG on modern websites.' },
      { q: 'How much smaller are WebP files compared to PNG?', a: 'WebP files are typically 30–50% smaller than equivalent PNG files.' },
      { q: 'Can I convert multiple PNG files to WebP at once?', a: 'Yes — batch conversion is fully supported. Multiple files are delivered as a ZIP download.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/webp-to-png', label: 'WebP to PNG' },
      { href: '/png-to-jpg', label: 'PNG to JPG' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
  'webp-to-png': {
    metaDesc: 'Convert WebP to PNG free without uploading to a server. Browser-based WebP to PNG converter — your files never leave your device. Instant, private, no account needed.',
    h2a: 'How to Convert WebP to PNG Without Uploading',
    steps: [
      '<strong>Select your WebP images</strong> — click "Select Images" or drag and drop WebP files onto the page.',
      '<strong>Click Convert</strong> — conversion runs instantly inside your browser. No upload, no waiting.',
      '<strong>Download your PNG</strong> — save your converted file directly to your device.',
    ],
    h2b: 'The Best Free WebP to PNG Converter That Doesn\'t Upload Your Files',
    body: `<p>PNG is the universal lossless format supported by every image editor, design tool, and platform. When you need to edit a WebP image in Photoshop, Illustrator, Figma, or any other tool that doesn't accept WebP, converting to PNG is the solution. RelahConvert converts WebP to PNG entirely in your browser — your files are never uploaded to any server, keeping your images completely private.</p>
<p>Graphic designers, photographers, and developers who regularly work with downloaded WebP assets will find this tool fast, reliable, and completely private.</p>`,
    h3why: 'Why Convert WebP to PNG?',
    why: 'PNG is universally supported by every image editor and platform. When you need to edit or use a WebP image in tools that don\'t support WebP natively, PNG is the safest, most compatible format to convert to.',
    faqs: [
      { q: 'How do I convert WebP to PNG without uploading my file?', a: 'Use RelahConvert — select your WebP, click Convert, and download your PNG instantly. No uploads, no accounts, runs entirely in your browser.' },
      { q: 'Will the PNG preserve the transparent background from the WebP?', a: 'Yes — if your WebP has a transparent background, the PNG output will preserve it fully.' },
      { q: 'Is there any quality loss converting WebP to PNG?', a: 'No — PNG is lossless so no quality is lost during conversion.' },
      { q: 'Can I convert multiple WebP files to PNG at once?', a: 'Yes — batch conversion is supported. Multiple files are delivered as a ZIP download.' },
      { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
    ],
    internalLinks: [
      { href: '/png-to-webp', label: 'PNG to WebP' },
      { href: '/webp-to-jpg', label: 'WebP to JPG' },
      { href: '/compress', label: 'Compress Image' },
      { href: '/resize', label: 'Resize Image' },
    ],
  },
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

  const slug = currentTool ? currentTool.slug : ''
  const seo = seoContent[slug]
  if (seo) {
    const metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    metaDesc.content = seo.metaDesc
    document.head.appendChild(metaDesc)
  }
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

const slug = currentTool ? currentTool.slug : ''
const related = relatedLinks[slug] || []
const relatedHTML = related.length ? `
  <div style="margin-top:8px; font-size:13px; color:#9A8A7A;">
    ${t.also_convert} ${related.map(r => `<a href="${r.href}" class="related-link">${r.label}</a>`).join(' · ')}
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

function buildSeoSection(slug) {
  const seo = seoContent[slug]
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
      <h3>Frequently Asked Questions</h3>
      ${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}
      <h3>Also Try</h3>
      <div class="internal-links">
        ${seo.internalLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
      </div>
    </div>
  `
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      ${badgeHTML}
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
  ${buildSeoSection(slug)}
`

if (currentTool) document.title = currentTool.title + ' | Free & Private — No Upload'
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

function setIdleEnabled() {
  convertBtn.disabled = false
  convertBtn.textContent = t.convert_btn
  convertBtn.style.background = '#C84B31'
  convertBtn.style.cursor = 'pointer'
  convertBtn.style.opacity = '1'
}
function setConverting() {
  convertBtn.disabled = true
  convertBtn.textContent = t.convert_btn_loading
  convertBtn.style.background = '#9A8A7A'
  convertBtn.style.cursor = 'not-allowed'
  convertBtn.style.opacity = '1'
}
function setDisabled() {
  convertBtn.disabled = true
  convertBtn.textContent = t.convert_btn
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
  nextSteps.style.display = 'none'
  sizes.textContent = ''
}
function showWarning(msg) {
  warning.style.display = 'block'
  warning.textContent = msg
  setTimeout(() => { warning.style.display = 'none' }, 4000)
}

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

let convertedBlobs = []

function showNextSteps(outputMime) {
  const steps = nextStepsMap[outputMime] || nextStepsMap['image/jpeg']
  nextStepsLinks.innerHTML = steps.map(s =>
    `<button class="next-link" data-href="${s.href}">${s.label}</button>`
  ).join('')
  nextSteps.style.display = 'block'
  nextStepsLinks.querySelectorAll('.next-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      const href = btn.getAttribute('data-href')
      if (!convertedBlobs.length) { window.location.href = href; return }
      try {
        await saveFilesToIDB(convertedBlobs)
        sessionStorage.setItem('pendingFromIDB', '1')
      } catch (e) {}
      window.location.href = href
    })
  })
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
    return `<div class="preview-card">
      <img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" />
      <button class="remove-btn" data-index="${i}">✕</button>
      <div class="fname">${f.name}</div>
    </div>`
  }).join('')
  previewGrid.innerHTML += `
    <label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;">
      <span style="font-size:28px;">+</span><span>${t.add_more}</span>
    </label>`
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
      clearResultsUI()
      renderPreviews()
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
  const map = new Map(selectedFiles.map(f => [fileKey(f), f]))
  for (const f of filtered) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged
  clearResultsUI()
  renderPreviews()
  if (selectedFiles.length) setIdleEnabled(); else setDisabled()
}

fileInput.addEventListener('change', () => { validateAndAdd(Array.from(fileInput.files || [])) })
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
    selectedFiles = files
    clearResultsUI()
    renderPreviews()
    setIdleEnabled()
  } catch (e) {}
}

loadPendingFiles()

convertBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting()
  clearResultsUI()
  const mime = formatSelect.value
  try {
    convertedBlobs = []
    if (selectedFiles.length === 1) {
      sizes.textContent = t.processing
      const { blob, outputSize, filename } = await convertFile(selectedFiles[0], mime, FIXED_QUALITY)
      convertedBlobs = [{ blob, name: filename, type: mime }]
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl
      downloadLink.download = filename
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
      downloadLink.href = currentDownloadUrl
      downloadLink.download = zipName
      downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
      sizes.textContent = ''
    }
    showNextSteps(mime)
    setIdleEnabled()
  } catch (err) {
    alert(err?.message || 'Conversion error')
    sizes.textContent = ''
    if (selectedFiles.length) setIdleEnabled(); else setDisabled()
  }
})