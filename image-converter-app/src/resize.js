import JSZip from 'jszip'
import { formatSize, totalBytes, sanitizeBaseName, uniqueName, LIMITS } from './core/utils.js'
import { injectHeader } from './core/header.js'
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
    #resizeBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #resizeBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: #2C1810 !important; color: #F5F0E8 !important; }
    #downloadLink { transition: all 0.18s ease; }
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:#C84B31 !important; color:#C84B31 !important; }
    .tab-btn { flex:1; padding:10px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; color:#9A8A7A; }
    .tab-btn.active { background:#C84B31; color:#fff; }
    .tab-btn:not(.active):hover { background:#F0E8DF; color:#2C1810; }
    .preset-btn { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; background:#fff; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
    .preset-btn:hover { border-color:#C84B31; color:#C84B31; }
    .preset-btn.active { border-color:#C84B31; background:#C84B31; color:#fff; }
    input[type=number]:focus { outline:none; border-color:#C84B31 !important; box-shadow: 0 0 0 3px rgba(200,75,49,0.12); }
    input[type=checkbox] { accent-color:#C84B31; width:15px; height:15px; cursor:pointer; }
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
  document.title = 'Image Resizer — Resize JPG and PNG Free | No Upload'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = 'Resize images by pixels or percentage free without uploading to a server. Browser-based image resizer — your files never leave your device. Instant, private, no account needed.'
  document.head.appendChild(metaDesc)
}

const seoResize = {
  en: {
    h2a: 'How to Resize Images Without Uploading',
    steps: ['<strong>Select your images</strong> — click "Select Images" or drag and drop JPG or PNG files onto the page.','<strong>Set your dimensions</strong> — enter pixel dimensions or choose a percentage. Enable aspect ratio lock to scale proportionally.','<strong>Click Resize and download</strong> — your resized image is ready instantly. No upload, no waiting.'],
    h2b: "The Best Free Image Resizer That Doesn't Upload Your Files",
    body: `<p>Uploading images just to resize them is slow and exposes your files to third-party servers. RelahConvert resizes images entirely in your browser — no upload, no server, no privacy risk. Whether you need exact pixel dimensions or a quick percentage resize, the entire process happens locally on your device in seconds.</p>`,
    h3why: 'Why Resize Images?', why: 'Images that are too large slow down websites, fail platform upload requirements, and take too long to share. Resizing ensures your images load fast and meet the specs of every platform.',
    faqs: [{ q: 'How do I resize an image without losing quality?', a: 'Reducing dimensions generally preserves quality well. Avoid enlarging beyond original size. Use aspect ratio lock to prevent distortion.' },{ q: 'Can I resize an image to exact pixels without uploading?', a: 'Yes — enter your exact target width and height in pixels. Enable aspect ratio lock to scale proportionally from a single dimension.' },{ q: 'Can I resize by percentage instead of pixels?', a: 'Yes — switch to "By Percentage" and enter your desired scale, or use the quick presets for 25%, 50%, or 75% smaller.' },{ q: 'What formats are supported?', a: 'JPG and PNG images are fully supported. The output format matches your input.' },{ q: 'Do you store my images?', a: 'Never. All processing happens locally in your browser. Your images are not uploaded to any server.' }],
    links: [{ href: '/compress', label: 'Compress Image' },{ href: '/png-to-jpg', label: 'PNG to JPG' },{ href: '/jpg-to-webp', label: 'JPG to WebP' },{ href: '/jpg-to-png', label: 'JPG to PNG' }],
  },
  fr: {
    h2a: 'Comment redimensionner des images sans télécharger',
    steps: ['<strong>Sélectionnez vos images</strong> — cliquez ou déposez des fichiers JPG ou PNG.','<strong>Définissez vos dimensions</strong> — entrez des dimensions en pixels ou choisissez un pourcentage.','<strong>Cliquez sur Redimensionner</strong> — votre image est prête instantanément.'],
    h2b: "Le meilleur redimensionneur d'images gratuit sans téléchargement",
    body: `<p>RelahConvert redimensionne les images entièrement dans votre navigateur — sans téléchargement, sans serveur, sans risque pour la vie privée.</p>`,
    h3why: 'Pourquoi redimensionner les images ?', why: 'Les images trop grandes ralentissent les sites web et ne répondent pas aux exigences des plateformes. Redimensionner garantit que vos images se chargent rapidement.',
    faqs: [{ q: 'Comment redimensionner une image sans perdre en qualité ?', a: 'Réduire les dimensions préserve généralement bien la qualité. Utilisez le verrouillage du rapport pour éviter la distorsion.' },{ q: 'Puis-je redimensionner en pourcentage ?', a: 'Oui — passez à "En pourcentage" et entrez votre échelle souhaitée.' },{ q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement dans votre navigateur.' }],
    links: [{ href: '/compress', label: 'Compresser' },{ href: '/png-to-jpg', label: 'PNG en JPG' },{ href: '/jpg-to-webp', label: 'JPG en WebP' },{ href: '/jpg-to-png', label: 'JPG en PNG' }],
  },
  es: {
    h2a: 'Cómo redimensionar imágenes sin subir archivos',
    steps: ['<strong>Selecciona tus imágenes</strong> — haz clic o arrastra archivos JPG o PNG.','<strong>Establece tus dimensiones</strong> — ingresa dimensiones en píxeles o elige un porcentaje.','<strong>Haz clic en Redimensionar</strong> — tu imagen estará lista al instante.'],
    h2b: 'El mejor redimensionador de imágenes gratuito sin subida',
    body: `<p>RelahConvert redimensiona imágenes completamente en tu navegador — sin subida, sin servidor, sin riesgo de privacidad.</p>`,
    h3why: '¿Por qué redimensionar imágenes?', why: 'Las imágenes demasiado grandes ralentizan los sitios web y no cumplen los requisitos de las plataformas. Redimensionar garantiza que tus imágenes carguen rápido.',
    faqs: [{ q: '¿Cómo redimensiono una imagen sin perder calidad?', a: 'Reducir las dimensiones generalmente preserva bien la calidad. Usa el bloqueo de proporción para evitar distorsiones.' },{ q: '¿Puedo redimensionar por porcentaje?', a: 'Sí — cambia a "En porcentaje" e ingresa la escala deseada.' },{ q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente en tu navegador.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/png-to-jpg', label: 'PNG a JPG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/jpg-to-png', label: 'JPG a PNG' }],
  },
  pt: {
    h2a: 'Como redimensionar imagens sem fazer upload',
    steps: ['<strong>Selecione suas imagens</strong> — clique ou arraste arquivos JPG ou PNG.','<strong>Defina suas dimensões</strong> — insira dimensões em pixels ou escolha uma porcentagem.','<strong>Clique em Redimensionar</strong> — sua imagem estará pronta instantaneamente.'],
    h2b: 'O melhor redimensionador de imagens gratuito sem upload',
    body: `<p>RelahConvert redimensiona imagens completamente no seu navegador — sem upload, sem servidor, sem risco de privacidade.</p>`,
    h3why: 'Por que redimensionar imagens?', why: 'Imagens muito grandes tornam os sites lentos e não atendem aos requisitos das plataformas. Redimensionar garante que suas imagens carreguem rapidamente.',
    faqs: [{ q: 'Como redimensiono uma imagem sem perder qualidade?', a: 'Reduzir as dimensões geralmente preserva bem a qualidade. Use o bloqueio de proporção para evitar distorções.' },{ q: 'Posso redimensionar por porcentagem?', a: 'Sim — mude para "Em porcentagem" e insira a escala desejada.' },{ q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente no seu navegador.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/png-to-jpg', label: 'PNG para JPG' },{ href: '/jpg-to-webp', label: 'JPG para WebP' },{ href: '/jpg-to-png', label: 'JPG para PNG' }],
  },
  de: {
    h2a: 'So ändern Sie die Bildgröße ohne Upload',
    steps: ['<strong>Wählen Sie Ihre Bilder aus</strong> — klicken oder ziehen Sie JPG- oder PNG-Dateien.','<strong>Legen Sie Ihre Abmessungen fest</strong> — geben Sie Pixelabmessungen ein oder wählen Sie einen Prozentsatz.','<strong>Klicken Sie auf Skalieren</strong> — Ihr Bild ist sofort fertig.'],
    h2b: 'Der beste kostenlose Bildskalierer ohne Upload',
    body: `<p>RelahConvert skaliert Bilder vollständig in Ihrem Browser — kein Upload, kein Server, kein Datenschutzrisiko.</p>`,
    h3why: 'Warum Bilder skalieren?', why: 'Zu große Bilder verlangsamen Websites und erfüllen keine Plattformanforderungen. Das Skalieren stellt sicher, dass Ihre Bilder schnell laden.',
    faqs: [{ q: 'Wie skaliere ich ein Bild ohne Qualitätsverlust?', a: 'Das Reduzieren von Abmessungen erhält die Qualität im Allgemeinen gut. Verwenden Sie die Seitenverhältnissperre, um Verzerrungen zu vermeiden.' },{ q: 'Kann ich in Prozent statt in Pixeln skalieren?', a: 'Ja — wechseln Sie zu "In Prozent" und geben Sie Ihre gewünschte Skala ein.' },{ q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.' }],
    links: [{ href: '/compress', label: 'Komprimieren' },{ href: '/png-to-jpg', label: 'PNG zu JPG' },{ href: '/jpg-to-webp', label: 'JPG zu WebP' },{ href: '/jpg-to-png', label: 'JPG zu PNG' }],
  },
  ar: {
    h2a: 'كيفية تغيير حجم الصور بدون رفع',
    steps: ['<strong>اختر صورك</strong> — انقر أو اسحب ملفات JPG أو PNG.','<strong>حدد أبعادك</strong> — أدخل أبعاد البكسل أو اختر نسبة مئوية.','<strong>انقر على تغيير الحجم</strong> — صورتك جاهزة فوراً.'],
    h2b: 'أفضل أداة مجانية لتغيير حجم الصور بدون رفع',
    body: `<p>RelahConvert يغير حجم الصور بالكامل في متصفحك — بدون رفع، بدون خادم، بدون مخاطر على الخصوصية.</p>`,
    h3why: 'لماذا تغيير حجم الصور؟', why: 'الصور الكبيرة جداً تبطئ المواقع ولا تستوفي متطلبات المنصات. تغيير الحجم يضمن تحميل صورك بسرعة.',
    faqs: [{ q: 'كيف أغير حجم صورة بدون فقدان الجودة؟', a: 'تقليل الأبعاد يحافظ عادة على الجودة جيداً. استخدم قفل نسبة العرض لتجنب التشويه.' },{ q: 'هل يمكنني التغيير بالنسبة المئوية؟', a: 'نعم — انتقل إلى "بالنسبة المئوية" وأدخل المقياس المطلوب.' },{ q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً في متصفحك.' }],
    links: [{ href: '/compress', label: 'ضغط' },{ href: '/png-to-jpg', label: 'PNG إلى JPG' },{ href: '/jpg-to-webp', label: 'JPG إلى WebP' },{ href: '/jpg-to-png', label: 'JPG إلى PNG' }],
  },
}

function getLang() { return localStorage.getItem('rc_lang') || 'en' }
function buildSeoSection() {
  const lang = getLang()
  const seo = seoResize[lang] || seoResize['en']
  return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</div></div>`
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${t.resize_title} <em style="font-style:italic; color:#C84B31;">${t.resize_title_em}</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.resize_desc}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${t.select_images}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${t.drop_hint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/png" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <div id="resizePanel" style="background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:12px;">
      <div style="font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">${t.resize_options}</div>
      <div style="display:flex; gap:6px; background:#F5F0E8; border-radius:10px; padding:4px; margin-bottom:16px;">
        <button class="tab-btn active" id="tabPixels">${t.resize_by_pixels}</button>
        <button class="tab-btn" id="tabPercent">${t.resize_by_percent}</button>
      </div>
      <div id="pixelsPanel">
        <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:12px;">
          <div style="flex:1;">
            <label style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:6px;">${t.resize_width}</label>
            <input type="number" id="widthInput" min="1" max="10000" placeholder="e.g. 800" style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          </div>
          <div style="padding-bottom:12px; color:#9A8A7A; font-size:18px;">×</div>
          <div style="flex:1;">
            <label style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:6px;">${t.resize_height}</label>
            <input type="number" id="heightInput" min="1" max="10000" placeholder="e.g. 600" style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          </div>
        </div>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:#555; cursor:pointer;">
          <input type="checkbox" id="aspectLock" /> ${t.resize_aspect}
        </label>
      </div>
      <div id="percentPanel" style="display:none;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="preset-btn" data-pct="25">25% smaller</button>
          <button class="preset-btn" data-pct="50">50% smaller</button>
          <button class="preset-btn" data-pct="75">75% smaller</button>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <label style="font-size:13px; color:#555; white-space:nowrap;">${t.resize_custom_pct}</label>
          <input type="number" id="customPct" min="1" max="1000" placeholder="e.g. 60" style="width:100px; padding:10px 12px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:14px; font-family:'DM Sans',sans-serif; color:#2C1810; background:#FAF6EF;" />
          <span style="font-size:13px; color:#9A8A7A;">${t.resize_of_original}</span>
        </div>
      </div>
    </div>
    <button id="resizeBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.resize_btn}</button>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="next-link" data-href="/compress">${t.next_compress}</button>
        <button class="next-link" data-href="/jpg-to-png">${t.next_to_png}</button>
        <button class="next-link" data-href="/jpg-to-webp">${t.next_to_webp}</button>
      </div>
    </div>
  </div>
  ${buildSeoSection()}
`

injectHeader()

const fileInput = document.getElementById('fileInput')
const resizeBtn = document.getElementById('resizeBtn')
const downloadLink = document.getElementById('downloadLink')
const previewGrid = document.getElementById('previewGrid')
const warning = document.getElementById('warning')
const nextSteps = document.getElementById('nextSteps')
const tabPixels = document.getElementById('tabPixels')
const tabPercent = document.getElementById('tabPercent')
const pixelsPanel = document.getElementById('pixelsPanel')
const percentPanel = document.getElementById('percentPanel')
const widthInput = document.getElementById('widthInput')
const heightInput = document.getElementById('heightInput')
const aspectLock = document.getElementById('aspectLock')
const customPct = document.getElementById('customPct')

let selectedFiles = [], currentDownloadUrl = null, activeTab = 'pixels', selectedPct = null, resizedBlobs = []

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
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  store.clear()
  files.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
  return new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = reject })
}
async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const db = await openDB()
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    const records = await new Promise((res, rej) => { const r = store.getAll(); r.onsuccess = () => { store.clear(); res(r.result || []) }; r.onerror = rej })
    if (!records.length) return
    const files = records.map(r => new File([r.blob], r.name, { type: r.type })).filter(f => f.type === 'image/jpeg' || f.type === 'image/png')
    if (!files.length) return
    selectedFiles = files; renderPreviews(); setIdle()
  } catch (e) {}
}

tabPixels.addEventListener('click', () => { activeTab = 'pixels'; tabPixels.classList.add('active'); tabPercent.classList.remove('active'); pixelsPanel.style.display = 'block'; percentPanel.style.display = 'none' })
tabPercent.addEventListener('click', () => { activeTab = 'percent'; tabPercent.classList.add('active'); tabPixels.classList.remove('active'); percentPanel.style.display = 'block'; pixelsPanel.style.display = 'none' })
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => { document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); selectedPct = parseInt(btn.getAttribute('data-pct')); customPct.value = 100 - selectedPct })
})
customPct.addEventListener('input', () => { document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); selectedPct = null })

let aspectRatio = null
widthInput.addEventListener('input', () => { if (aspectLock.checked && aspectRatio && widthInput.value) heightInput.value = Math.round(widthInput.value / aspectRatio) })
heightInput.addEventListener('input', () => { if (aspectLock.checked && aspectRatio && heightInput.value) widthInput.value = Math.round(heightInput.value * aspectRatio) })

function cleanupOldUrl() { if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null } }
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 4000) }
function setDisabled() { resizeBtn.disabled = true; resizeBtn.textContent = t.resize_btn; resizeBtn.style.background = '#C4B8A8'; resizeBtn.style.cursor = 'not-allowed'; resizeBtn.style.opacity = '0.7' }
function setIdle() { resizeBtn.disabled = false; resizeBtn.textContent = t.resize_btn; resizeBtn.style.background = '#C84B31'; resizeBtn.style.cursor = 'pointer'; resizeBtn.style.opacity = '1' }
function setResizing() { resizeBtn.disabled = true; resizeBtn.textContent = t.resize_btn_loading; resizeBtn.style.background = '#9A8A7A'; resizeBtn.style.cursor = 'not-allowed'; resizeBtn.style.opacity = '1' }

function renderPreviews() {
  if (!selectedFiles.length) { previewGrid.style.display = 'none'; previewGrid.innerHTML = ''; aspectRatio = null; return }
  if (selectedFiles.length === 1) { const img = new Image(); const url = URL.createObjectURL(selectedFiles[0]); img.onload = () => { aspectRatio = img.width / img.height; widthInput.placeholder = img.width; heightInput.placeholder = img.height; URL.revokeObjectURL(url) }; img.src = url }
  previewGrid.style.display = 'grid'; previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'; previewGrid.style.gap = '12px'
  previewGrid.innerHTML = selectedFiles.map((f, i) => { const url = URL.createObjectURL(f); return `<div class="preview-card"><img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" /><button class="remove-btn" data-index="${i}">✕</button><div class="fname">${f.name}</div></div>` }).join('')
  previewGrid.innerHTML += `<label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px; transition:all 0.15s;"><span style="font-size:28px;">+</span><span>${t.add_more}</span></label>`
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => { btn.addEventListener('click', () => { selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1); cleanupOldUrl(); downloadLink.style.display = 'none'; nextSteps.style.display = 'none'; renderPreviews(); if (selectedFiles.length) setIdle(); else setDisabled() }) })
}

function validateAndAdd(incoming) {
  const valid = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= LIMITS.MAX_PER_FILE_BYTES)
  const wrongFormat = incoming.filter(f => f.type !== 'image/jpeg' && f.type !== 'image/png')
  const tooBig = incoming.filter(f => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size > LIMITS.MAX_PER_FILE_BYTES)
  if (wrongFormat.length) showWarning(`${t.warn_only_jpg_png} ${wrongFormat.length} ${t.warn_wrong_format}`)
  if (tooBig.length) showWarning(`${tooBig.length} ${t.warn_too_large}`)
  // Allow duplicates — just append, no deduplication
  let merged = [...selectedFiles, ...valid]
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged; cleanupOldUrl(); downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
  renderPreviews(); if (selectedFiles.length) setIdle(); else setDisabled()
}

fileInput.addEventListener('change', () => { validateAndAdd(Array.from(fileInput.files || [])); fileInput.value = '' })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files || [])) })

async function resizeFile(file, targetW, targetH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => {
        const w = targetW || img.width, h = targetH || img.height
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (file.type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h) }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Resize failed'))
          const ext = file.type === 'image/jpeg' ? 'jpg' : 'png'
          resolve({ blob, filename: `${sanitizeBaseName(file.name)}-${w}x${h}.${ext}`, outputSize: blob.size, type: file.type })
        }, file.type, file.type === 'image/jpeg' ? 0.92 : undefined)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function getTargetDimensions(file) {
  return new Promise((resolve) => {
    if (activeTab === 'pixels') {
      const w = parseInt(widthInput.value) || null, h = parseInt(heightInput.value) || null
      if (!w && !h) return resolve(null)
      const img = new Image(), url = URL.createObjectURL(file)
      img.onload = () => { URL.revokeObjectURL(url); let fW = w || img.width, fH = h || img.height; if (aspectLock.checked) { const r = img.width / img.height; if (w && !h) fH = Math.round(w / r); else if (h && !w) fW = Math.round(h * r) }; resolve({ w: fW, h: fH }) }
      img.src = url
    } else {
      const pctVal = parseInt(customPct.value)
      if (!pctVal || pctVal <= 0) return resolve(null)
      const img = new Image(), url = URL.createObjectURL(file)
      img.onload = () => { URL.revokeObjectURL(url); const f = pctVal / 100; resolve({ w: Math.round(img.width * f), h: Math.round(img.height * f) }) }
      img.src = url
    }
  })
}

function bindNextSteps() {
  nextSteps.querySelectorAll('.next-link').forEach(btn => {
    btn.addEventListener('click', async () => {
      const href = btn.getAttribute('data-href')
      if (!resizedBlobs.length) { window.location.href = href; return }
      try { await saveFilesToIDB(resizedBlobs); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      window.location.href = href
    })
  })
}

resizeBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  if (activeTab === 'pixels' && !widthInput.value && !heightInput.value) { showWarning(t.resize_warn_dims); return }
  if (activeTab === 'percent' && !customPct.value) { showWarning(t.resize_warn_pct); return }
  setResizing(); cleanupOldUrl(); resizedBlobs = []; downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
  try {
    if (selectedFiles.length === 1) {
      const dims = await getTargetDimensions(selectedFiles[0])
      if (!dims) { showWarning(t.resize_warn_invalid); setIdle(); return }
      const { blob, filename, outputSize, type } = await resizeFile(selectedFiles[0], dims.w, dims.h)
      resizedBlobs = [{ blob, name: filename, type }]
      currentDownloadUrl = URL.createObjectURL(blob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = filename; downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download} (${formatSize(outputSize)})`
    } else {
      const zip = new JSZip(), usedNames = new Set()
      for (let i = 0; i < selectedFiles.length; i++) {
        resizeBtn.textContent = `${t.resize_btn_loading} ${i + 1}/${selectedFiles.length}...`
        const dims = await getTargetDimensions(selectedFiles[i])
        if (!dims) continue
        const { blob, filename, type } = await resizeFile(selectedFiles[i], dims.w, dims.h)
        const safeName = uniqueName(usedNames, filename)
        resizedBlobs.push({ blob, name: safeName, type }); zip.file(safeName, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      downloadLink.href = currentDownloadUrl; downloadLink.download = 'resized-images.zip'; downloadLink.style.display = 'block'
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
    }
    nextSteps.style.display = 'block'; bindNextSteps(); setIdle(); fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Resize error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})

loadPendingFiles()