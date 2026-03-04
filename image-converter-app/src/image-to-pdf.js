import { injectHeader } from './core/header.js'
import { formatSize, fileKey, totalBytes, sanitizeBaseName, LIMITS } from './core/utils.js'
import { getT } from './core/i18n.js'
import { jsPDF } from 'jspdf'

export function initImageToPdf({ slug: _slug } = {}) {
const bg = '#F2F2F2'
const t = getT()

// Detect which PDF tool we're on
const isPng = (_slug || window.location.pathname).includes('png-to-pdf')
const inputMime = isPng ? 'image/png' : 'image/jpeg'
const inputLabel = isPng ? 'PNG' : 'JPG'
const slug = isPng ? 'png-to-pdf' : 'jpg-to-pdf'

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
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .preview-card .page-num { position:absolute; bottom:28px; left:6px; background:rgba(0,0,0,0.55); color:#fff; font-size:10px; font-weight:600; padding:2px 7px; border-radius:4px; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .mode-btn { flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; color:#9A8A7A; }
    .mode-btn.active { background:#C84B31; color:#fff; }
    .mode-btn:not(.active):hover { background:#F0E8DF; color:#2C1810; }
    .seo-section { max-width:700px; margin:0 auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif; }
    .seo-section h2 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section h3 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:#2C1810; margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section p { font-size:14px; color:#5A4A3A; line-height:1.8; margin:0 0 12px; }
    .seo-section ol { padding-left:20px; margin:0 0 12px; }
    .seo-section ol li { font-size:14px; color:#5A4A3A; line-height:1.8; margin-bottom:6px; }
    .seo-section .faq-item { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
    .seo-section .internal-links { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
    .seo-section .internal-links a { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; transition:all 0.15s; }
    .seo-section .internal-links a:hover { border-color:#C84B31; color:#C84B31; }
    .seo-divider { border:none; border-top:1px solid #E8E0D5; margin:0 auto 40px; max-width:700px; }
  `
  document.head.appendChild(style)
  document.title = `${inputLabel} to PDF Converter — Free | No Upload`
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = `Convert ${inputLabel} images to PDF free without uploading to a server. Browser-based ${inputLabel} to PDF converter — your files never leave your device.`
  document.head.appendChild(metaDesc)
}

// SEO content per language
const seoPdf = {
  en: {
    'jpg-to-pdf': {
      h2a: 'How to Convert JPG to PDF Without Uploading',
      steps: [
        '<strong>Select your JPG images</strong> — click "Select Images" or drag and drop JPG files onto the page.',
        '<strong>Choose PDF mode</strong> — one PDF per image, or all images combined into one PDF.',
        '<strong>Click Convert and download</strong> — your PDF is ready instantly. No upload, no waiting.',
      ],
      h2b: "The Best Free JPG to PDF Converter That Doesn't Upload Your Files",
      body: `<p>Most JPG to PDF converters upload your images to a remote server before generating the PDF. RelahConvert converts JPG to PDF entirely inside your browser. Your files never leave your device at any point.</p><p>Whether you need to combine several photos into a single PDF document, create a PDF from a scanned receipt, or convert product images for a report — this tool handles it privately and instantly.</p>`,
      h3why: 'Why Convert JPG to PDF?',
      why: 'PDF is the universal document format — accepted everywhere, preserving image quality exactly, and easy to share or print. Converting JPG images to PDF makes them easier to email, upload to document portals, and archive.',
      faqs: [
        { q: 'How do I convert JPG to PDF without uploading?', a: 'Select your JPG files in RelahConvert, choose your PDF mode, and click Convert. The entire process runs locally in your browser — nothing is uploaded.' },
        { q: 'Can I combine multiple JPG images into one PDF?', a: 'Yes — select multiple images and choose "All images in one PDF". Each image becomes a page in the document.' },
        { q: 'Is there a limit to how many images I can convert?', a: 'You can convert multiple images at once. Processing happens locally so there is no server-imposed limit.' },
        { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
      ],
      links: [{ href: '/jpg-to-png', label: 'JPG to PNG' }, { href: '/jpg-to-webp', label: 'JPG to WebP' }, { href: '/compress', label: 'Compress Image' }, { href: '/resize', label: 'Resize Image' }],
    },
    'png-to-pdf': {
      h2a: 'How to Convert PNG to PDF Without Uploading',
      steps: [
        '<strong>Select your PNG images</strong> — click "Select Images" or drag and drop PNG files onto the page.',
        '<strong>Choose PDF mode</strong> — one PDF per image, or all images combined into one PDF.',
        '<strong>Click Convert and download</strong> — your PDF is ready instantly. No upload, no waiting.',
      ],
      h2b: "The Best Free PNG to PDF Converter That Doesn't Upload Your Files",
      body: `<p>Most PNG to PDF converters upload your images to a remote server before generating the PDF. RelahConvert converts PNG to PDF entirely inside your browser. Your files never leave your device.</p><p>Perfect for converting screenshots, graphics, UI exports, and design assets into PDF documents.</p>`,
      h3why: 'Why Convert PNG to PDF?',
      why: 'PDF is universally accepted for sharing and archiving. Converting PNG images to PDF makes them easier to email, submit to document portals, and print — while preserving quality exactly.',
      faqs: [
        { q: 'How do I convert PNG to PDF without uploading?', a: 'Select your PNG files in RelahConvert, choose your PDF mode, and click Convert. Everything runs locally in your browser.' },
        { q: 'Can I combine multiple PNG images into one PDF?', a: 'Yes — select multiple images and choose "All images in one PDF". Each image becomes a page.' },
        { q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' },
      ],
      links: [{ href: '/png-to-jpg', label: 'PNG to JPG' }, { href: '/png-to-webp', label: 'PNG to WebP' }, { href: '/compress', label: 'Compress Image' }, { href: '/resize', label: 'Resize Image' }],
    },
  },
  fr: {
    'jpg-to-pdf': {
      h2a: 'Comment convertir JPG en PDF sans télécharger',
      steps: ['<strong>Sélectionnez vos images JPG</strong>.', '<strong>Choisissez le mode PDF</strong> — un PDF par image ou toutes les images en un seul PDF.', '<strong>Cliquez sur Convertir</strong> — votre PDF est prêt instantanément.'],
      h2b: "Le meilleur convertisseur JPG en PDF gratuit sans téléchargement",
      body: '<p>RelahConvert convertit JPG en PDF entièrement dans votre navigateur. Vos fichiers ne quittent jamais votre appareil.</p>',
      h3why: 'Pourquoi convertir JPG en PDF ?', why: 'Le PDF est le format de document universel — accepté partout et facile à partager.',
      faqs: [{ q: 'Puis-je combiner plusieurs images JPG en un seul PDF ?', a: 'Oui — sélectionnez plusieurs images et choisissez "Toutes les images en un PDF".' }, { q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement.' }],
      links: [{ href: '/jpg-to-png', label: 'JPG en PNG' }, { href: '/jpg-to-webp', label: 'JPG en WebP' }, { href: '/compress', label: 'Compresser' }, { href: '/resize', label: 'Redimensionner' }],
    },
    'png-to-pdf': {
      h2a: 'Comment convertir PNG en PDF sans télécharger',
      steps: ['<strong>Sélectionnez vos images PNG</strong>.', '<strong>Choisissez le mode PDF</strong>.', '<strong>Cliquez sur Convertir</strong> — votre PDF est prêt instantanément.'],
      h2b: "Le meilleur convertisseur PNG en PDF gratuit sans téléchargement",
      body: '<p>RelahConvert convertit PNG en PDF entièrement dans votre navigateur. Vos fichiers ne quittent jamais votre appareil.</p>',
      h3why: 'Pourquoi convertir PNG en PDF ?', why: 'Le PDF est universellement accepté pour le partage et l\'archivage.',
      faqs: [{ q: 'Puis-je combiner plusieurs images PNG en un seul PDF ?', a: 'Oui — sélectionnez plusieurs images et choisissez "Toutes les images en un PDF".' }, { q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement.' }],
      links: [{ href: '/png-to-jpg', label: 'PNG en JPG' }, { href: '/png-to-webp', label: 'PNG en WebP' }, { href: '/compress', label: 'Compresser' }, { href: '/resize', label: 'Redimensionner' }],
    },
  },
  es: {
    'jpg-to-pdf': {
      h2a: 'Cómo convertir JPG a PDF sin subir archivos',
      steps: ['<strong>Selecciona tus imágenes JPG</strong>.', '<strong>Elige el modo PDF</strong> — un PDF por imagen o todas las imágenes en un PDF.', '<strong>Haz clic en Convertir</strong> — tu PDF está listo al instante.'],
      h2b: 'El mejor convertidor gratuito de JPG a PDF sin subida',
      body: '<p>RelahConvert convierte JPG a PDF completamente en tu navegador. Tus archivos nunca salen de tu dispositivo.</p>',
      h3why: '¿Por qué convertir JPG a PDF?', why: 'PDF es el formato de documento universal — aceptado en todas partes y fácil de compartir.',
      faqs: [{ q: '¿Puedo combinar varias imágenes JPG en un PDF?', a: 'Sí — selecciona varias imágenes y elige "Todas las imágenes en un PDF".' }, { q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente.' }],
      links: [{ href: '/jpg-to-png', label: 'JPG a PNG' }, { href: '/jpg-to-webp', label: 'JPG a WebP' }, { href: '/compress', label: 'Comprimir' }, { href: '/resize', label: 'Redimensionar' }],
    },
    'png-to-pdf': {
      h2a: 'Cómo convertir PNG a PDF sin subir archivos',
      steps: ['<strong>Selecciona tus imágenes PNG</strong>.', '<strong>Elige el modo PDF</strong>.', '<strong>Haz clic en Convertir</strong> — tu PDF está listo al instante.'],
      h2b: 'El mejor convertidor gratuito de PNG a PDF sin subida',
      body: '<p>RelahConvert convierte PNG a PDF completamente en tu navegador. Tus archivos nunca salen de tu dispositivo.</p>',
      h3why: '¿Por qué convertir PNG a PDF?', why: 'PDF es universalmente aceptado para compartir y archivar.',
      faqs: [{ q: '¿Puedo combinar varias imágenes PNG en un PDF?', a: 'Sí — selecciona varias imágenes y elige "Todas las imágenes en un PDF".' }, { q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente.' }],
      links: [{ href: '/png-to-jpg', label: 'PNG a JPG' }, { href: '/png-to-webp', label: 'PNG a WebP' }, { href: '/compress', label: 'Comprimir' }, { href: '/resize', label: 'Redimensionar' }],
    },
  },
  pt: {
    'jpg-to-pdf': {
      h2a: 'Como converter JPG para PDF sem fazer upload',
      steps: ['<strong>Selecione suas imagens JPG</strong>.', '<strong>Escolha o modo PDF</strong>.', '<strong>Clique em Converter</strong> — seu PDF está pronto instantaneamente.'],
      h2b: 'O melhor conversor gratuito de JPG para PDF sem upload',
      body: '<p>RelahConvert converte JPG para PDF completamente no seu navegador. Seus arquivos nunca saem do seu dispositivo.</p>',
      h3why: 'Por que converter JPG para PDF?', why: 'PDF é o formato de documento universal — aceito em todos os lugares e fácil de compartilhar.',
      faqs: [{ q: 'Posso combinar várias imagens JPG em um PDF?', a: 'Sim — selecione várias imagens e escolha "Todas as imagens em um PDF".' }, { q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente.' }],
      links: [{ href: '/jpg-to-png', label: 'JPG para PNG' }, { href: '/jpg-to-webp', label: 'JPG para WebP' }, { href: '/compress', label: 'Comprimir' }, { href: '/resize', label: 'Redimensionar' }],
    },
    'png-to-pdf': {
      h2a: 'Como converter PNG para PDF sem fazer upload',
      steps: ['<strong>Selecione suas imagens PNG</strong>.', '<strong>Escolha o modo PDF</strong>.', '<strong>Clique em Converter</strong> — seu PDF está pronto instantaneamente.'],
      h2b: 'O melhor conversor gratuito de PNG para PDF sem upload',
      body: '<p>RelahConvert converte PNG para PDF completamente no seu navegador. Seus arquivos nunca saem do seu dispositivo.</p>',
      h3why: 'Por que converter PNG para PDF?', why: 'PDF é universalmente aceito para compartilhamento e arquivamento.',
      faqs: [{ q: 'Posso combinar várias imagens PNG em um PDF?', a: 'Sim — selecione várias imagens e escolha "Todas as imagens em um PDF".' }, { q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente.' }],
      links: [{ href: '/png-to-jpg', label: 'PNG para JPG' }, { href: '/png-to-webp', label: 'PNG para WebP' }, { href: '/compress', label: 'Comprimir' }, { href: '/resize', label: 'Redimensionar' }],
    },
  },
  de: {
    'jpg-to-pdf': {
      h2a: 'So konvertieren Sie JPG in PDF ohne Upload',
      steps: ['<strong>Wählen Sie Ihre JPG-Bilder aus</strong>.', '<strong>Wählen Sie den PDF-Modus</strong>.', '<strong>Klicken Sie auf Konvertieren</strong> — Ihr PDF ist sofort fertig.'],
      h2b: 'Der beste kostenlose JPG zu PDF Konverter ohne Upload',
      body: '<p>RelahConvert konvertiert JPG zu PDF vollständig in Ihrem Browser. Ihre Dateien verlassen nie Ihr Gerät.</p>',
      h3why: 'Warum JPG in PDF konvertieren?', why: 'PDF ist das universelle Dokumentformat — überall akzeptiert und leicht zu teilen.',
      faqs: [{ q: 'Kann ich mehrere JPG-Bilder in einem PDF zusammenführen?', a: 'Ja — wählen Sie mehrere Bilder und klicken Sie auf "Alle Bilder in einem PDF".' }, { q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal.' }],
      links: [{ href: '/jpg-to-png', label: 'JPG zu PNG' }, { href: '/jpg-to-webp', label: 'JPG zu WebP' }, { href: '/compress', label: 'Komprimieren' }, { href: '/resize', label: 'Skalieren' }],
    },
    'png-to-pdf': {
      h2a: 'So konvertieren Sie PNG in PDF ohne Upload',
      steps: ['<strong>Wählen Sie Ihre PNG-Bilder aus</strong>.', '<strong>Wählen Sie den PDF-Modus</strong>.', '<strong>Klicken Sie auf Konvertieren</strong> — Ihr PDF ist sofort fertig.'],
      h2b: 'Der beste kostenlose PNG zu PDF Konverter ohne Upload',
      body: '<p>RelahConvert konvertiert PNG zu PDF vollständig in Ihrem Browser. Ihre Dateien verlassen nie Ihr Gerät.</p>',
      h3why: 'Warum PNG in PDF konvertieren?', why: 'PDF ist universell für das Teilen und Archivieren akzeptiert.',
      faqs: [{ q: 'Kann ich mehrere PNG-Bilder in einem PDF zusammenführen?', a: 'Ja — wählen Sie mehrere Bilder und klicken Sie auf "Alle Bilder in einem PDF".' }, { q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal.' }],
      links: [{ href: '/png-to-jpg', label: 'PNG zu JPG' }, { href: '/png-to-webp', label: 'PNG zu WebP' }, { href: '/compress', label: 'Komprimieren' }, { href: '/resize', label: 'Skalieren' }],
    },
  },
  ar: {
    'jpg-to-pdf': {
      h2a: 'كيفية تحويل JPG إلى PDF بدون رفع',
      steps: ['<strong>اختر صور JPG</strong>.', '<strong>اختر وضع PDF</strong>.', '<strong>انقر على تحويل</strong> — ملف PDF جاهز فوراً.'],
      h2b: 'أفضل محوّل مجاني JPG إلى PDF بدون رفع',
      body: '<p>RelahConvert يحوّل JPG إلى PDF بالكامل في متصفحك. ملفاتك لا تغادر جهازك أبداً.</p>',
      h3why: 'لماذا تحويل JPG إلى PDF؟', why: 'PDF هو تنسيق المستند العالمي — مقبول في كل مكان وسهل المشاركة.',
      faqs: [{ q: 'هل يمكنني دمج عدة صور JPG في PDF واحد؟', a: 'نعم — اختر عدة صور واختر "جميع الصور في PDF واحد".' }, { q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً.' }],
      links: [{ href: '/jpg-to-png', label: 'JPG إلى PNG' }, { href: '/jpg-to-webp', label: 'JPG إلى WebP' }, { href: '/compress', label: 'ضغط' }, { href: '/resize', label: 'تغيير الحجم' }],
    },
    'png-to-pdf': {
      h2a: 'كيفية تحويل PNG إلى PDF بدون رفع',
      steps: ['<strong>اختر صور PNG</strong>.', '<strong>اختر وضع PDF</strong>.', '<strong>انقر على تحويل</strong> — ملف PDF جاهز فوراً.'],
      h2b: 'أفضل محوّل مجاني PNG إلى PDF بدون رفع',
      body: '<p>RelahConvert يحوّل PNG إلى PDF بالكامل في متصفحك. ملفاتك لا تغادر جهازك أبداً.</p>',
      h3why: 'لماذا تحويل PNG إلى PDF؟', why: 'PDF مقبول عالمياً للمشاركة والأرشفة.',
      faqs: [{ q: 'هل يمكنني دمج عدة صور PNG في PDF واحد؟', a: 'نعم — اختر عدة صور واختر "جميع الصور في PDF واحد".' }, { q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً.' }],
      links: [{ href: '/png-to-jpg', label: 'PNG إلى JPG' }, { href: '/png-to-webp', label: 'PNG إلى WebP' }, { href: '/compress', label: 'ضغط' }, { href: '/resize', label: 'تغيير الحجم' }],
    },
  },
}

function getLang() { return localStorage.getItem('rc_lang') || 'en' }
function buildSeoSection() {
  const lang = getLang()
  const langSeo = seoPdf[lang] || seoPdf['en']
  const seo = langSeo[slug] || seoPdf['en'][slug]
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
        ${seo.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
      </div>
    </div>
  `
}

const toolTitle = isPng
  ? (t.tool_title?.['png-to-pdf'] || `PNG <em style="font-style:italic; color:#C84B31;">to PDF</em>`)
  : (t.tool_title?.['jpg-to-pdf'] || `JPG <em style="font-style:italic; color:#C84B31;">to PDF</em>`)

const toolDesc = isPng
  ? (t.tool_desc?.['png-to-pdf'] || 'Convert PNG images to PDF. Files never leave your device.')
  : (t.tool_desc?.['jpg-to-pdf'] || 'Convert JPG images to PDF. Files never leave your device.')

// Build title HTML with em on last word
const titleWords = toolTitle.split(' ')
const titleHTML = titleWords.length > 1
  ? titleWords.slice(0, -1).join(' ') + ` <em style="font-style:italic; color:#C84B31;">${titleWords[titleWords.length - 1]}</em>`
  : `<em style="font-style:italic; color:#C84B31;">${toolTitle}</em>`

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">${titleHTML}</h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${toolDesc}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${t.select_images}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${t.drop_hint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="${inputMime === 'image/jpeg' ? 'image/jpeg' : 'image/png'}" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <div id="pdfOptions" style="background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">${t.pdf_options}</div>
      <div style="display:flex; gap:6px; background:#F5F0E8; border-radius:10px; padding:4px;">
        <button class="mode-btn active" id="modeOne">${t.pdf_mode_one}</button>
        <button class="mode-btn" id="modeAll">${t.pdf_mode_all}</button>
      </div>
    </div>
    <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.pdf_btn}</button>
    <div id="downloadArea" style="display:none; display:flex; flex-direction:column; gap:8px;"></div>
  </div>
  ${buildSeoSection()}
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const convertBtn = document.getElementById('convertBtn')
const downloadArea = document.getElementById('downloadArea')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const modeOne = document.getElementById('modeOne')
const modeAll = document.getElementById('modeAll')

let selectedFiles = [], pdfMode = 'one', downloadUrls = []

function setDisabled() { convertBtn.disabled = true; convertBtn.textContent = t.pdf_btn; convertBtn.style.background = '#C4B8A8'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '0.7' }
function setIdle() { convertBtn.disabled = false; convertBtn.textContent = t.pdf_btn; convertBtn.style.background = '#C84B31'; convertBtn.style.cursor = 'pointer'; convertBtn.style.opacity = '1' }
function setConverting() { convertBtn.disabled = true; convertBtn.textContent = t.pdf_btn_loading; convertBtn.style.background = '#9A8A7A'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '1' }
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 4000) }
function cleanupUrls() { downloadUrls.forEach(u => URL.revokeObjectURL(u)); downloadUrls = [] }

modeOne.addEventListener('click', () => { pdfMode = 'one'; modeOne.classList.add('active'); modeAll.classList.remove('active') })
modeAll.addEventListener('click', () => { pdfMode = 'all'; modeAll.classList.add('active'); modeOne.classList.remove('active') })

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => resolve(img)
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function imageFileToPdfBlob(files) {
  const doc = new jsPDF({ unit: 'px', compress: true })
  let first = true
  for (const file of files) {
    const img = await loadImage(file)
    const imgW = img.width, imgH = img.height
    const pageW = imgW, pageH = imgH
    if (!first) doc.addPage([pageW, pageH])
    else { doc.deletePage(1); doc.addPage([pageW, pageH]) }
    first = false
    const fmt = file.type === 'image/png' ? 'PNG' : 'JPEG'
    doc.addImage(img, fmt, 0, 0, pageW, pageH)
  }
  return doc.output('blob')
}

function renderPreviews() {
  if (!selectedFiles.length) { previewGrid.style.display = 'none'; previewGrid.innerHTML = ''; return }
  previewGrid.style.display = 'grid'; previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'; previewGrid.style.gap = '12px'
  previewGrid.innerHTML = selectedFiles.map((f, i) => { const url = URL.createObjectURL(f); return `<div class="preview-card"><img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" /><span class="page-num">p.${i + 1}</span><button class="remove-btn" data-index="${i}">✕</button><div class="fname">${f.name}</div></div>` }).join('')
  previewGrid.innerHTML += `<label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px;"><span style="font-size:28px;">+</span><span>${t.add_more}</span></label>`
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => { btn.addEventListener('click', () => { selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1); cleanupUrls(); downloadArea.style.display = 'none'; downloadArea.innerHTML = ''; renderPreviews(); if (selectedFiles.length) setIdle(); else setDisabled() }) })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => f.type === inputMime && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrong = incoming.filter(f => f.type !== inputMime)
  const tooBig = incoming.filter(f => f.type === inputMime && f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (wrong.length) showWarning(`${t.warn_wrong_fmt_tool} ${inputLabel} ${t.warn_files} ${wrong.length} ${t.warn_wrong_format}`)
  if (tooBig.length) showWarning(`${tooBig.length} ${t.warn_too_large}`)
  const map = new Map(); for (const f of [...selectedFiles, ...valid]) map.set(fileKey(f), f)
  let merged = Array.from(map.values())
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged; cleanupUrls(); downloadArea.style.display = 'none'; downloadArea.innerHTML = ''
  renderPreviews(); if (selectedFiles.length) setIdle(); else setDisabled()
}

fileInput.addEventListener('change', () => { validateAndAdd(Array.from(fileInput.files || [])); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

convertBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting(); cleanupUrls(); downloadArea.innerHTML = ''; downloadArea.style.display = 'none'
  try {
    const links = []
    if (pdfMode === 'one') {
      for (let i = 0; i < selectedFiles.length; i++) {
        convertBtn.textContent = `${t.pdf_btn_loading} ${i + 1}/${selectedFiles.length}...`
        const blob = await imageFileToPdfBlob([selectedFiles[i]])
        const url = URL.createObjectURL(blob); downloadUrls.push(url)
        const base = sanitizeBaseName(selectedFiles[i].name)
        links.push({ url, name: `${base}.pdf`, size: blob.size })
      }
    } else {
      const blob = await imageFileToPdfBlob(selectedFiles)
      const url = URL.createObjectURL(blob); downloadUrls.push(url)
      links.push({ url, name: 'images.pdf', size: blob.size })
    }
    downloadArea.innerHTML = links.map(l => `<a href="${l.url}" download="${l.name}" style="display:block; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;">${t.download} ${l.name} (${formatSize(l.size)})</a>`).join('')
    downloadArea.style.display = 'flex'; setIdle()
  } catch (err) {
    alert(err?.message || 'PDF conversion error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})
}