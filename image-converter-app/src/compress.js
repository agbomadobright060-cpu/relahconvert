import { injectHeader } from './core/header.js'
import JSZip from 'jszip'
import { formatSize, totalBytes, sanitizeBaseName, uniqueName, LIMITS } from './core/utils.js'
import { getT } from './core/i18n.js'

const bg = '#F2F2F2'
const t = getT()

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
    #compressBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #compressBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .result-bar { background:#fff; border-radius:14px; padding:20px 24px; box-shadow:0 2px 12px rgba(0,0,0,0.07); display:flex; align-items:center; gap:24px; }
    .savings-circle { flex-shrink:0; }
    .savings-circle svg { transform: rotate(-90deg); }
    .savings-circle .circle-bg { fill:none; stroke:#F0E8DF; stroke-width:8; }
    .savings-circle .circle-fill { fill:none; stroke:#C84B31; stroke-width:8; stroke-linecap:round; stroke-dasharray:226; transition: stroke-dashoffset 1s ease; }
    .circle-label { font-family:'Fraunces',serif; font-weight:900; font-size:15px; color:#2C1810; text-anchor:middle; dominant-baseline:middle; }
    .result-stats { flex:1; }
    .result-saved { font-size:14px; color:#2C1810; margin:0 0 4px; font-weight:400; }
    .result-sizes { font-size:13px; color:#7A6A5A; display:flex; align-items:center; gap:8px; }
    .result-arrow { color:#C84B31; font-size:16px; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
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
  document.title = 'Image Compressor — Compress JPG, PNG and WebP Free | No Upload'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = 'Compress JPG, PNG and WebP images free without uploading to a server. Browser-based image compression — your files never leave your device. Instant, private, no account needed.'
  document.head.appendChild(metaDesc)
}

const seoCompress = {
  en: {
    h2a: 'How to Compress Images Without Uploading',
    steps: ['<strong>Select your images</strong> — click "Select Images" or drag and drop JPG, PNG, or WebP files onto the page.','<strong>Click Compress</strong> — compression runs instantly inside your browser. No upload, no waiting.','<strong>Download your result</strong> — save your compressed image or ZIP file directly to your device.'],
    h2b: "The Best Free Image Compressor That Doesn't Upload Your Files",
    body: `<p>Most online image compression tools upload your images to a remote server, process them, then send them back. RelahConvert works differently. Compression happens entirely inside your browser using local processing. Your images never leave your device — no uploads, no server storage, no accounts, completely free.</p><p>Whether you're compressing product photos, reducing image sizes for social media, optimizing website assets, or making files smaller to share by email — this tool handles it instantly and privately.</p>`,
    h3why: 'Why Compress Images?',
    why: 'Large image files slow down websites, take longer to upload, and use unnecessary storage. Compressing images reduces file size while preserving visual quality — making your website faster and improving your SEO performance.',
    faqs: [{ q: 'How do I compress an image without losing quality?', a: 'For most images, 75–85% quality produces files that look identical to the original at a fraction of the size. The difference is imperceptible to the human eye at these settings.' },{ q: "What is the best free image compressor that doesn't upload files?", a: 'RelahConvert compresses images entirely in your browser with zero server uploads. Your files never leave your device.' },{ q: 'Can I compress multiple images at once?', a: 'Yes — select multiple images and they will be compressed in batch. Multiple files are delivered as a ZIP download.' },{ q: 'What image formats are supported?', a: 'RelahConvert supports JPG, PNG, and WebP compression. PNG files are converted to JPG during compression for maximum size reduction.' },{ q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server, stored, or shared with anyone.' }],
    links: [{ href: '/resize', label: 'Resize Image' },{ href: '/jpg-to-png', label: 'JPG to PNG' },{ href: '/jpg-to-webp', label: 'JPG to WebP' },{ href: '/png-to-jpg', label: 'PNG to JPG' }],
  },
  fr: {
    h2a: 'Comment compresser des images sans télécharger',
    steps: ['<strong>Sélectionnez vos images</strong> — cliquez ou déposez des fichiers JPG, PNG ou WebP.','<strong>Cliquez sur Compresser</strong> — la compression s\'exécute instantanément dans votre navigateur.','<strong>Téléchargez votre résultat</strong> — enregistrez l\'image compressée sur votre appareil.'],
    h2b: "Le meilleur compresseur d'images gratuit sans téléchargement",
    body: `<p>La plupart des outils de compression en ligne téléchargent vos images sur un serveur distant. RelahConvert fonctionne différemment : la compression se fait entièrement dans votre navigateur. Vos images ne quittent jamais votre appareil.</p>`,
    h3why: 'Pourquoi compresser les images ?', why: 'Les fichiers d\'images volumineux ralentissent les sites web et utilisent un espace de stockage inutile. La compression réduit la taille des fichiers tout en préservant la qualité visuelle.',
    faqs: [{ q: 'Comment compresser une image sans perdre en qualité ?', a: 'Pour la plupart des images, une qualité de 75 à 85 % produit des fichiers qui semblent identiques à l\'original.' },{ q: 'Puis-je compresser plusieurs images à la fois ?', a: 'Oui — sélectionnez plusieurs images. Les fichiers multiples sont livrés en ZIP.' },{ q: 'Quels formats d\'image sont pris en charge ?', a: 'RelahConvert prend en charge la compression JPG, PNG et WebP.' },{ q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement dans votre navigateur.' }],
    links: [{ href: '/resize', label: 'Redimensionner' },{ href: '/jpg-to-png', label: 'JPG en PNG' },{ href: '/jpg-to-webp', label: 'JPG en WebP' },{ href: '/png-to-jpg', label: 'PNG en JPG' }],
  },
  es: {
    h2a: 'Cómo comprimir imágenes sin subir archivos',
    steps: ['<strong>Selecciona tus imágenes</strong> — haz clic o arrastra archivos JPG, PNG o WebP.','<strong>Haz clic en Comprimir</strong> — la compresión se ejecuta instantáneamente en tu navegador.','<strong>Descarga tu resultado</strong> — guarda la imagen comprimida en tu dispositivo.'],
    h2b: 'El mejor compresor de imágenes gratuito sin subida',
    body: `<p>La mayoría de las herramientas de compresión en línea suben tus imágenes a un servidor remoto. RelahConvert funciona de manera diferente: la compresión ocurre completamente en tu navegador. Tus imágenes nunca salen de tu dispositivo.</p>`,
    h3why: '¿Por qué comprimir imágenes?', why: 'Los archivos de imagen grandes ralentizan los sitios web y usan almacenamiento innecesario. Comprimir imágenes reduce el tamaño del archivo mientras se preserva la calidad visual.',
    faqs: [{ q: '¿Cómo comprimo una imagen sin perder calidad?', a: 'Para la mayoría de las imágenes, una calidad del 75–85% produce archivos que se ven idénticos al original.' },{ q: '¿Puedo comprimir varias imágenes a la vez?', a: 'Sí — selecciona varias imágenes. Los archivos múltiples se entregan en ZIP.' },{ q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente en tu navegador.' }],
    links: [{ href: '/resize', label: 'Redimensionar' },{ href: '/jpg-to-png', label: 'JPG a PNG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/png-to-jpg', label: 'PNG a JPG' }],
  },
  pt: {
    h2a: 'Como comprimir imagens sem fazer upload',
    steps: ['<strong>Selecione suas imagens</strong> — clique ou arraste arquivos JPG, PNG ou WebP.','<strong>Clique em Comprimir</strong> — a compressão ocorre instantaneamente no seu navegador.','<strong>Baixe seu resultado</strong> — salve a imagem comprimida no seu dispositivo.'],
    h2b: 'O melhor compressor de imagens gratuito sem upload',
    body: `<p>A maioria das ferramentas de compressão online envia suas imagens para um servidor remoto. RelahConvert funciona de forma diferente: a compressão ocorre completamente no seu navegador. Suas imagens nunca saem do seu dispositivo.</p>`,
    h3why: 'Por que comprimir imagens?', why: 'Arquivos de imagem grandes tornam os sites lentos e usam armazenamento desnecessário. Comprimir imagens reduz o tamanho do arquivo preservando a qualidade visual.',
    faqs: [{ q: 'Como comprimo uma imagem sem perder qualidade?', a: 'Para a maioria das imagens, uma qualidade de 75–85% produz arquivos que parecem idênticos ao original.' },{ q: 'Posso comprimir várias imagens de uma vez?', a: 'Sim — selecione várias imagens. Os arquivos múltiplos são entregues em ZIP.' },{ q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente no seu navegador.' }],
    links: [{ href: '/resize', label: 'Redimensionar' },{ href: '/jpg-to-png', label: 'JPG para PNG' },{ href: '/jpg-to-webp', label: 'JPG para WebP' },{ href: '/png-to-jpg', label: 'PNG para JPG' }],
  },
  de: {
    h2a: 'So komprimieren Sie Bilder ohne Upload',
    steps: ['<strong>Wählen Sie Ihre Bilder aus</strong> — klicken Sie oder ziehen Sie JPG-, PNG- oder WebP-Dateien.','<strong>Klicken Sie auf Komprimieren</strong> — die Komprimierung läuft sofort in Ihrem Browser.','<strong>Laden Sie Ihr Ergebnis herunter</strong> — speichern Sie das komprimierte Bild auf Ihrem Gerät.'],
    h2b: 'Der beste kostenlose Bildkompressor ohne Upload',
    body: `<p>Die meisten Online-Komprimierungstools laden Ihre Bilder auf einen Remote-Server hoch. RelahConvert funktioniert anders: Die Komprimierung erfolgt vollständig in Ihrem Browser. Ihre Bilder verlassen nie Ihr Gerät.</p>`,
    h3why: 'Warum Bilder komprimieren?', why: 'Große Bilddateien verlangsamen Websites und verbrauchen unnötigen Speicherplatz. Das Komprimieren reduziert die Dateigröße bei gleichbleibender Qualität.',
    faqs: [{ q: 'Wie komprimiere ich ein Bild ohne Qualitätsverlust?', a: 'Für die meisten Bilder produziert eine Qualität von 75–85 % Dateien, die dem Original identisch aussehen.' },{ q: 'Kann ich mehrere Bilder auf einmal komprimieren?', a: 'Ja — wählen Sie mehrere Bilder aus. Mehrere Dateien werden als ZIP geliefert.' },{ q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.' }],
    links: [{ href: '/resize', label: 'Skalieren' },{ href: '/jpg-to-png', label: 'JPG zu PNG' },{ href: '/jpg-to-webp', label: 'JPG zu WebP' },{ href: '/png-to-jpg', label: 'PNG zu JPG' }],
  },
  ar: {
    h2a: 'كيفية ضغط الصور بدون رفع',
    steps: ['<strong>اختر صورك</strong> — انقر أو اسحب ملفات JPG أو PNG أو WebP.','<strong>انقر على ضغط</strong> — يعمل الضغط فوراً في متصفحك.','<strong>حمّل نتيجتك</strong> — احفظ الصورة المضغوطة على جهازك.'],
    h2b: 'أفضل ضاغط صور مجاني بدون رفع',
    body: `<p>معظم أدوات الضغط عبر الإنترنت ترفع صورك إلى خادم بعيد. RelahConvert يعمل بشكل مختلف: يتم الضغط بالكامل في متصفحك. صورك لا تغادر جهازك أبداً.</p>`,
    h3why: 'لماذا ضغط الصور؟', why: 'الملفات الكبيرة تبطئ المواقع وتستهلك مساحة تخزين غير ضرورية. ضغط الصور يقلل حجم الملف مع الحفاظ على الجودة.',
    faqs: [{ q: 'كيف أضغط صورة بدون فقدان الجودة؟', a: 'لمعظم الصور، تنتج جودة 75–85% ملفات تبدو مطابقة للأصل.' },{ q: 'هل يمكنني ضغط عدة صور دفعة واحدة؟', a: 'نعم — اختر عدة صور. الملفات المتعددة تُسلَّم في ZIP.' },{ q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً في متصفحك.' }],
    links: [{ href: '/resize', label: 'تغيير الحجم' },{ href: '/jpg-to-png', label: 'JPG إلى PNG' },{ href: '/jpg-to-webp', label: 'JPG إلى WebP' },{ href: '/png-to-jpg', label: 'PNG إلى JPG' }],
  },
}

function getLang() { return localStorage.getItem('rc_lang') || 'en' }
function buildSeoSection() {
  const lang = getLang()
  const seo = seoCompress[lang] || seoCompress['en']
  return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</div></div>`
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${t.compress_title} <em style="font-style:italic; color:#C84B31;">${t.compress_title_em}</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.compress_desc}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${t.select_images}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${t.drop_hint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/webp,image/png" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <button id="compressBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.compress_btn}</button>
    <div id="resultBar" style="display:none; margin-bottom:12px;"></div>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="next-link" data-href="/jpg-to-png">${t.next_to_png}</button>
        <button class="next-link" data-href="/jpg-to-webp">${t.next_to_webp}</button>
        <button class="next-link" data-href="/png-to-jpg">${t.next_to_jpg}</button>
      </div>
    </div>
  </div>
  ${buildSeoSection()}
`

const fileInput = document.getElementById('fileInput')
const compressBtn = document.getElementById('compressBtn')
const downloadLink = document.getElementById('downloadLink')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const resultBar = document.getElementById('resultBar')
const nextSteps = document.getElementById('nextSteps')

let selectedFiles = [], currentDownloadUrl = null, compressedBlobs = []

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
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
    selectedFiles = files; renderPreviews(); setIdle()
  } catch (e) {}
}

function getOutputMime(mime) { return mime === 'image/png' ? 'image/jpeg' : mime }
function getQuality(mime) { return mime === 'image/webp' ? 0.65 : 0.6 }
function setDisabled() { compressBtn.disabled = true; compressBtn.textContent = t.compress_btn; compressBtn.style.background = '#C4B8A8'; compressBtn.style.cursor = 'not-allowed'; compressBtn.style.opacity = '0.7' }
function setIdle() { compressBtn.disabled = false; compressBtn.textContent = t.compress_btn; compressBtn.style.background = '#C84B31'; compressBtn.style.cursor = 'pointer'; compressBtn.style.opacity = '1' }
function setConverting() { compressBtn.disabled = true; compressBtn.textContent = t.compress_btn_loading; compressBtn.style.background = '#9A8A7A'; compressBtn.style.cursor = 'not-allowed'; compressBtn.style.opacity = '1' }
function cleanupOldUrl() { if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null } }
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 4000) }

function showResultBar(originalBytes, outputBytes) {
  const saved = Math.max(0, Math.round((1 - outputBytes / originalBytes) * 100))
  const circumference = 226
  const dashOffset = circumference - (circumference * saved / 100)
  const plural = selectedFiles.length > 1 ? t.compress_result_plural : t.compress_result_singular
  resultBar.style.display = 'block'
  resultBar.innerHTML = `
    <div class="result-bar">
      <div class="savings-circle">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle class="circle-bg" cx="36" cy="36" r="30" />
          <circle class="circle-fill" cx="36" cy="36" r="30" style="stroke-dashoffset:${circumference}" id="circleAnim" />
          <text class="circle-label" x="36" y="36" transform="rotate(90,36,36)">${saved}%</text>
        </svg>
      </div>
      <div class="result-stats">
        <p class="result-saved">${plural} ${saved}% ${t.compress_result}</p>
        <div class="result-sizes">
          <span>${formatSize(originalBytes)}</span>
          <span class="result-arrow">→</span>
          <span style="font-weight:600; color:#2C1810;">${formatSize(outputBytes)}</span>
        </div>
      </div>
    </div>`
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const circle = document.getElementById('circleAnim')
    if (circle) circle.style.strokeDashoffset = dashOffset
  }))
  nextSteps.style.display = 'block'
}

async function compressFile(file) {
  const outputMime = getOutputMime(file.type)
  const quality = getQuality(outputMime)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (outputMime === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'))
          const ext = outputMime === 'image/jpeg' ? 'jpg' : 'webp'
          const base = sanitizeBaseName(file.name)
          resolve({ blob, filename: `${base}-compressed.${ext}`, originalSize: file.size, outputSize: blob.size, type: outputMime })
        }, outputMime, quality)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function renderPreviews() {
  if (!selectedFiles.length) { previewGrid.style.display = 'none'; previewGrid.innerHTML = ''; return }
  previewGrid.style.display = 'grid'; previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'; previewGrid.style.gap = '12px'
  previewGrid.innerHTML = selectedFiles.map((f, i) => {
    const url = URL.createObjectURL(f)
    return `<div class="preview-card"><img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" /><button class="remove-btn" data-index="${i}">✕</button><div class="fname">${f.name}</div></div>`
  }).join('')
  previewGrid.innerHTML += `<label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;"><span style="font-size:28px;">+</span><span>${t.add_more}</span></label>`
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
      cleanupOldUrl(); resultBar.style.display = 'none'; downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
      renderPreviews()
      if (selectedFiles.length) setIdle(); else setDisabled()
    })
  })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/webp' || f.type === 'image/png') && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrongFormat = incoming.filter(f => f.type !== 'image/jpeg' && f.type !== 'image/webp' && f.type !== 'image/png')
  const tooBig = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/webp' || f.type === 'image/png') && f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (wrongFormat.length) showWarning(`${t.warn_unsupported} ${wrongFormat.length} ${t.warn_wrong_format}`)
  if (tooBig.length) showWarning(`${tooBig.length} ${t.warn_too_large}`)
  if (valid.some(f => f.type === 'image/png')) showWarning(t.warn_png_to_jpg)
  // Allow duplicates — just append, no deduplication
  let merged = [...selectedFiles, ...valid]
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged
  cleanupOldUrl(); resultBar.style.display = 'none'; downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
  renderPreviews()
  if (selectedFiles.length) setIdle(); else setDisabled()
}

nextSteps.querySelectorAll('.next-link').forEach(btn => {
  btn.addEventListener('click', async () => {
    const href = btn.getAttribute('data-href')
    if (!compressedBlobs.length) { window.location.href = href; return }
    try { await saveFilesToIDB(compressedBlobs); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
    window.location.href = href
  })
})

fileInput.addEventListener('change', () => { validateAndAdd(Array.from(fileInput.files || [])); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

loadPendingFiles()
injectHeader()

compressBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  setConverting(); cleanupOldUrl(); compressedBlobs = []
  resultBar.style.display = 'none'; downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
  try {
    if (selectedFiles.length === 1) {
      const { blob, filename, originalSize, outputSize, type } = await compressFile(selectedFiles[0])
      compressedBlobs = [{ blob, name: filename, type }]
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = filename; downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download} (${formatSize(outputSize)})`
      showResultBar(originalSize, outputSize)
    } else {
      const zip = new JSZip()
      const usedNames = new Set()
      let totalOriginal = 0, totalOutput = 0
      for (let i = 0; i < selectedFiles.length; i++) {
        compressBtn.textContent = `${t.compress_btn_loading} ${i + 1}/${selectedFiles.length}...`
        const { blob, filename, originalSize, outputSize, type } = await compressFile(selectedFiles[i])
        totalOriginal += originalSize; totalOutput += outputSize
        const safeName = uniqueName(usedNames, filename)
        compressedBlobs.push({ blob, name: safeName, type })
        zip.file(safeName, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = 'compressed-images.zip'; downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
      showResultBar(totalOriginal, totalOutput)
    }
    setIdle(); fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Compression error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})