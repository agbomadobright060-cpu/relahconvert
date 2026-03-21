import { injectHeader } from '../core/header.js'
import { formatSize } from '../core/utils.js'
import { getT, getLang, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
injectHreflang('resize-in-kb')

const t = getT()
const bg = '#F2F2F2'

const toolName = (t.nav_short && t.nav_short['resize-in-kb']) || 'Resize Image in KB'
const parts    = toolName.split(' ')
const h1Main   = parts.slice(0, -1).join(' ')
const h1Em     = parts[parts.length - 1]
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlLabel   = t.download || 'Download'

const rikTargetLbl    = t.rik_target || 'Target Size (KB)'
const rikResizeBtn    = t.rik_resize || 'Resize to Target'
const rikResizingBtn  = t.rik_resizing || 'Resizing...'
const rikOriginalLbl  = t.rik_original || 'Original'
const rikOutputLbl    = t.rik_output || 'Output'
const rikReductionLbl = t.rik_reduction || 'reduction'

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
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
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
    .preview-card { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; max-height:400px; object-fit:contain; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
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
  document.title = 'Resize Image to Specific KB \u2014 Free & Private | RelahConvert'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = 'Resize any image to a specific file size in KB. Free, private, browser-only. Compress image to exact target size \u2014 perfect for passport photos, visa applications, and upload limits.'
  document.head.appendChild(metaDesc)
}

// ── SEO data ────────────────────────────────────────────────────────────────
const seoResizeKB = {
  en: {
    h2a: 'How to Resize an Image to a Specific KB Size',
    steps: ['<strong>Upload your image</strong> \u2014 click "Select Image" or drag and drop a JPG, PNG, or WebP file.','<strong>Enter target size</strong> \u2014 type the file size you want in kilobytes (e.g. 100 KB, 200 KB).','<strong>Click Resize</strong> \u2014 the tool automatically compresses to hit your target size.','<strong>Download</strong> \u2014 save the resized image to your device.'],
    h2b: 'Best Free Tool to Compress an Image to Exact KB Size',
    body: '<p>Need an image under 100 KB for a form submission? Or exactly 200 KB for a visa photo? RelahConvert\u2019s Resize in KB tool uses smart binary-search compression to hit your target file size as closely as possible \u2014 all inside your browser. No upload, no server, completely free.</p><p>Works perfectly for passport photo size requirements, government form upload limits, email attachment restrictions, and any situation where you need an image under a specific kilobyte limit.</p>',
    h3why: 'Why Resize Images to a Specific KB?',
    why: 'Many websites, government portals, and applications require images under a specific file size. Manually adjusting quality until you hit the target is tedious. This tool automates the process \u2014 just enter your target KB and download.',
    faqs: [
      { q: 'What is resize image in KB?', a: 'Resizing an image in KB means compressing the image file to a specific file size measured in kilobytes. For example, reducing a 2 MB photo to exactly 200 KB while maintaining acceptable visual quality.' },
      { q: 'How do I reduce an image to 200KB?', a: 'Upload your image, type 200 in the target KB field, and click Resize. The tool will automatically find the right compression level to get your image as close to 200 KB as possible.' },
      { q: 'Does this work for passport and visa photos?', a: 'Yes \u2014 many countries require passport and visa photos under a specific file size (e.g. 100 KB, 200 KB, 300 KB). Upload your photo, enter the required size, and download.' },
      { q: 'Is there a minimum size I can compress to?', a: 'The minimum depends on the image dimensions and content. Very detailed or large images may not compress below a certain threshold without reducing dimensions first. For best results, resize the image dimensions first, then use this tool to hit the KB target.' },
      { q: 'Which formats are supported?', a: 'You can upload JPG, PNG, and WebP images. The output is always JPEG for optimal compression control.' },
    ],
    links: [{ href: '/compress', label: 'Compress Image' },{ href: '/resize', label: 'Resize Image' },{ href: '/crop', label: 'Crop Image' },{ href: '/passport-photo', label: 'Passport Photo' }],
  },
  fr: {
    h2a: 'Comment redimensionner une image \u00e0 une taille en Ko pr\u00e9cise',
    steps: ['<strong>T\u00e9l\u00e9chargez votre image</strong> \u2014 cliquez ou d\u00e9posez un fichier JPG, PNG ou WebP.','<strong>Entrez la taille cible</strong> \u2014 tapez la taille souhait\u00e9e en kilo-octets.','<strong>Cliquez sur Redimensionner</strong> \u2014 l\u2019outil compresse automatiquement.','<strong>T\u00e9l\u00e9chargez</strong> \u2014 enregistrez l\u2019image sur votre appareil.'],
    h2b: 'Meilleur outil gratuit pour compresser une image \u00e0 une taille en Ko exacte',
    body: '<p>Besoin d\u2019une image de moins de 100 Ko pour un formulaire ? RelahConvert utilise une compression intelligente pour atteindre la taille cible \u2014 enti\u00e8rement dans votre navigateur. Gratuit et priv\u00e9.</p>',
    h3why: 'Pourquoi redimensionner en Ko ?',
    why: 'De nombreux sites et portails gouvernementaux exigent des images sous une taille sp\u00e9cifique. Cet outil automatise le processus.',
    faqs: [{ q: 'Qu\u2019est-ce que le redimensionnement en Ko ?', a: 'C\u2019est la compression d\u2019une image \u00e0 une taille de fichier sp\u00e9cifique mesur\u00e9e en kilo-octets.' },{ q: 'Comment r\u00e9duire une image \u00e0 200 Ko ?', a: 'T\u00e9l\u00e9chargez votre image, tapez 200 dans le champ cible et cliquez sur Redimensionner.' },{ q: 'Cela fonctionne-t-il pour les photos de passeport ?', a: 'Oui \u2014 entrez la taille requise et t\u00e9l\u00e9chargez.' },{ q: 'Y a-t-il une taille minimale ?', a: 'Le minimum d\u00e9pend des dimensions et du contenu de l\u2019image.' },{ q: 'Quels formats sont support\u00e9s ?', a: 'JPG, PNG et WebP en entr\u00e9e. La sortie est toujours JPEG.' }],
    links: [{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' },{ href: '/crop', label: 'Recadrer' },{ href: '/passport-photo', label: 'Photo passeport' }],
  },
  es: {
    h2a: 'C\u00f3mo redimensionar una imagen a un tama\u00f1o espec\u00edfico en KB',
    steps: ['<strong>Sube tu imagen</strong> \u2014 haz clic o arrastra un archivo JPG, PNG o WebP.','<strong>Ingresa el tama\u00f1o objetivo</strong> \u2014 escribe el tama\u00f1o deseado en kilobytes.','<strong>Haz clic en Redimensionar</strong> \u2014 la herramienta comprime autom\u00e1ticamente.','<strong>Descarga</strong> \u2014 guarda la imagen en tu dispositivo.'],
    h2b: 'Mejor herramienta gratuita para comprimir imagen a KB exactos',
    body: '<p>\u00bfNecesitas una imagen de menos de 100 KB? RelahConvert usa compresi\u00f3n inteligente para alcanzar el tama\u00f1o objetivo \u2014 todo en tu navegador. Gratis y privado.</p>',
    h3why: '\u00bfPor qu\u00e9 redimensionar en KB?',
    why: 'Muchos sitios y portales gubernamentales exigen im\u00e1genes bajo un tama\u00f1o espec\u00edfico. Esta herramienta automatiza el proceso.',
    faqs: [{ q: '\u00bfQu\u00e9 es redimensionar imagen en KB?', a: 'Es comprimir una imagen a un tama\u00f1o de archivo espec\u00edfico medido en kilobytes.' },{ q: '\u00bfC\u00f3mo reduzco una imagen a 200KB?', a: 'Sube tu imagen, escribe 200 en el campo objetivo y haz clic en Redimensionar.' },{ q: '\u00bfFunciona para fotos de pasaporte y visa?', a: 'S\u00ed \u2014 ingresa el tama\u00f1o requerido y descarga.' },{ q: '\u00bfHay un tama\u00f1o m\u00ednimo?', a: 'El m\u00ednimo depende de las dimensiones y contenido de la imagen.' },{ q: '\u00bfQu\u00e9 formatos se admiten?', a: 'JPG, PNG y WebP de entrada. La salida es siempre JPEG.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto pasaporte' }],
  },
  pt: {
    h2a: 'Como redimensionar uma imagem para um tamanho espec\u00edfico em KB',
    steps: ['<strong>Envie sua imagem</strong> \u2014 clique ou arraste um arquivo JPG, PNG ou WebP.','<strong>Digite o tamanho alvo</strong> \u2014 insira o tamanho desejado em kilobytes.','<strong>Clique em Redimensionar</strong> \u2014 a ferramenta comprime automaticamente.','<strong>Baixe</strong> \u2014 salve a imagem no seu dispositivo.'],
    h2b: 'Melhor ferramenta gratuita para comprimir imagem a KB exatos',
    body: '<p>Precisa de uma imagem com menos de 100 KB? O RelahConvert usa compress\u00e3o inteligente para atingir o tamanho alvo \u2014 tudo no seu navegador. Gratuito e privado.</p>',
    h3why: 'Por que redimensionar em KB?',
    why: 'Muitos sites e portais governamentais exigem imagens abaixo de um tamanho espec\u00edfico. Esta ferramenta automatiza o processo.',
    faqs: [{ q: 'O que \u00e9 redimensionar imagem em KB?', a: '\u00c9 comprimir uma imagem para um tamanho de arquivo espec\u00edfico medido em kilobytes.' },{ q: 'Como reduzo uma imagem para 200KB?', a: 'Envie sua imagem, digite 200 no campo alvo e clique em Redimensionar.' },{ q: 'Funciona para fotos de passaporte e visto?', a: 'Sim \u2014 insira o tamanho exigido e baixe.' },{ q: 'Existe um tamanho m\u00ednimo?', a: 'O m\u00ednimo depende das dimens\u00f5es e conte\u00fado da imagem.' },{ q: 'Quais formatos s\u00e3o suportados?', a: 'JPG, PNG e WebP na entrada. A sa\u00edda \u00e9 sempre JPEG.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto passaporte' }],
  },
  de: {
    h2a: 'So \u00e4ndern Sie die Bildgr\u00f6\u00dfe auf eine bestimmte KB-Gr\u00f6\u00dfe',
    steps: ['<strong>Bild hochladen</strong> \u2014 klicken oder ziehen Sie eine JPG-, PNG- oder WebP-Datei.','<strong>Zielgr\u00f6\u00dfe eingeben</strong> \u2014 geben Sie die gew\u00fcnschte Gr\u00f6\u00dfe in Kilobyte ein.','<strong>Klicken Sie auf \u00c4ndern</strong> \u2014 das Tool komprimiert automatisch.','<strong>Herunterladen</strong> \u2014 speichern Sie das Bild auf Ihrem Ger\u00e4t.'],
    h2b: 'Bestes kostenloses Tool zum Komprimieren auf exakte KB',
    body: '<p>Brauchen Sie ein Bild unter 100 KB? RelahConvert verwendet intelligente Komprimierung \u2014 vollst\u00e4ndig in Ihrem Browser. Kostenlos und privat.</p>',
    h3why: 'Warum Bilder auf KB \u00e4ndern?',
    why: 'Viele Websites und Beh\u00f6rdenportale verlangen Bilder unter einer bestimmten Gr\u00f6\u00dfe. Dieses Tool automatisiert den Prozess.',
    faqs: [{ q: 'Was bedeutet Bildgr\u00f6\u00dfe in KB \u00e4ndern?', a: 'Es bedeutet, ein Bild auf eine bestimmte Dateigr\u00f6\u00dfe in Kilobyte zu komprimieren.' },{ q: 'Wie reduziere ich ein Bild auf 200KB?', a: 'Laden Sie Ihr Bild hoch, geben Sie 200 ein und klicken Sie auf \u00c4ndern.' },{ q: 'Funktioniert das f\u00fcr Passfotos?', a: 'Ja \u2014 geben Sie die erforderliche Gr\u00f6\u00dfe ein und laden Sie herunter.' },{ q: 'Gibt es eine Mindestgr\u00f6\u00dfe?', a: 'Das Minimum h\u00e4ngt von den Abmessungen und dem Inhalt des Bildes ab.' },{ q: 'Welche Formate werden unterst\u00fctzt?', a: 'JPG, PNG und WebP als Eingabe. Ausgabe ist immer JPEG.' }],
    links: [{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' },{ href: '/crop', label: 'Zuschneiden' },{ href: '/passport-photo', label: 'Passfoto' }],
  },
  ar: {
    h2a: '\u0643\u064a\u0641\u064a\u0629 \u062a\u063a\u064a\u064a\u0631 \u062d\u062c\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0625\u0644\u0649 \u062d\u062c\u0645 \u0645\u062d\u062f\u062f \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a',
    steps: ['<strong>\u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u062a\u0643</strong> \u2014 \u0627\u0646\u0642\u0631 \u0623\u0648 \u0627\u0633\u062d\u0628 \u0645\u0644\u0641 JPG \u0623\u0648 PNG \u0623\u0648 WebP.','<strong>\u0623\u062f\u062e\u0644 \u0627\u0644\u062d\u062c\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628</strong> \u2014 \u0627\u0643\u062a\u0628 \u0627\u0644\u062d\u062c\u0645 \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a.','<strong>\u0627\u0646\u0642\u0631 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u062c\u0645</strong> \u2014 \u0627\u0644\u0623\u062f\u0627\u0629 \u062a\u0636\u063a\u0637 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b.','<strong>\u062d\u0645\u0651\u0644</strong> \u2014 \u0627\u062d\u0641\u0638 \u0627\u0644\u0635\u0648\u0631\u0629 \u0639\u0644\u0649 \u062c\u0647\u0627\u0632\u0643.'],
    h2b: '\u0623\u0641\u0636\u0644 \u0623\u062f\u0627\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u0644\u0636\u063a\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0625\u0644\u0649 \u062d\u062c\u0645 \u0645\u062d\u062f\u062f',
    body: '<p>\u0647\u0644 \u062a\u062d\u062a\u0627\u062c \u0635\u0648\u0631\u0629 \u0623\u0642\u0644 \u0645\u0646 100 \u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a\u061f RelahConvert \u064a\u0633\u062a\u062e\u062f\u0645 \u0636\u063a\u0637\u0627\u064b \u0630\u0643\u064a\u0627\u064b \u2014 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0641\u064a \u0645\u062a\u0635\u0641\u062d\u0643. \u0645\u062c\u0627\u0646\u064a \u0648\u062e\u0627\u0635.</p>',
    h3why: '\u0644\u0645\u0627\u0630\u0627 \u062a\u063a\u064a\u064a\u0631 \u062d\u062c\u0645 \u0627\u0644\u0635\u0648\u0631 \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a\u061f',
    why: '\u0627\u0644\u0639\u062f\u064a\u062f \u0645\u0646 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a \u0627\u0644\u062d\u0643\u0648\u0645\u064a\u0629 \u062a\u062a\u0637\u0644\u0628 \u0635\u0648\u0631\u0627\u064b \u062a\u062d\u062a \u062d\u062c\u0645 \u0645\u062d\u062f\u062f.',
    faqs: [{ q: '\u0645\u0627 \u0647\u0648 \u062a\u063a\u064a\u064a\u0631 \u062d\u062c\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a\u061f', a: '\u0647\u0648 \u0636\u063a\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0625\u0644\u0649 \u062d\u062c\u0645 \u0645\u0644\u0641 \u0645\u062d\u062f\u062f \u0628\u0627\u0644\u0643\u064a\u0644\u0648\u0628\u0627\u064a\u062a.' },{ q: '\u0643\u064a\u0641 \u0623\u0642\u0644\u0644 \u0635\u0648\u0631\u0629 \u0625\u0644\u0649 200KB\u061f', a: '\u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u062a\u0643\u060c \u0627\u0643\u062a\u0628 200 \u0648\u0627\u0646\u0642\u0631 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u062c\u0645.' },{ q: '\u0647\u0644 \u064a\u0639\u0645\u0644 \u0644\u0635\u0648\u0631 \u062c\u0648\u0627\u0632 \u0627\u0644\u0633\u0641\u0631\u061f', a: '\u0646\u0639\u0645 \u2014 \u0623\u062f\u062e\u0644 \u0627\u0644\u062d\u062c\u0645 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0648\u062d\u0645\u0651\u0644.' },{ q: '\u0647\u0644 \u0647\u0646\u0627\u0643 \u062d\u062f \u0623\u062f\u0646\u0649\u061f', a: '\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u062f\u0646\u0649 \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 \u0623\u0628\u0639\u0627\u062f \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0645\u062d\u062a\u0648\u0627\u0647\u0627.' },{ q: '\u0645\u0627 \u0627\u0644\u0635\u064a\u063a \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629\u061f', a: 'JPG \u0648PNG \u0648WebP \u0643\u0645\u062f\u062e\u0644. \u0627\u0644\u0645\u062e\u0631\u062c \u062f\u0627\u0626\u0645\u0627\u064b JPEG.' }],
    links: [{ href: '/compress', label: '\u0636\u063a\u0637' },{ href: '/resize', label: '\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u062c\u0645' },{ href: '/crop', label: '\u0642\u0635' },{ href: '/passport-photo', label: '\u0635\u0648\u0631\u0629 \u062c\u0648\u0627\u0632' }],
  },
  it: {
    h2a: 'Come ridimensionare un\u2019immagine a una dimensione specifica in KB',
    steps: ['<strong>Carica la tua immagine</strong> \u2014 clicca o trascina un file JPG, PNG o WebP.','<strong>Inserisci la dimensione target</strong> \u2014 digita la dimensione desiderata in kilobyte.','<strong>Clicca su Ridimensiona</strong> \u2014 lo strumento comprime automaticamente.','<strong>Scarica</strong> \u2014 salva l\u2019immagine sul tuo dispositivo.'],
    h2b: 'Miglior strumento gratuito per comprimere immagini a KB esatti',
    body: '<p>Hai bisogno di un\u2019immagine sotto i 100 KB? RelahConvert usa una compressione intelligente \u2014 interamente nel tuo browser. Gratuito e privato.</p>',
    h3why: 'Perch\u00e9 ridimensionare in KB?',
    why: 'Molti siti e portali governativi richiedono immagini sotto una dimensione specifica. Questo strumento automatizza il processo.',
    faqs: [{ q: 'Cosa significa ridimensionare in KB?', a: '\u00c8 la compressione di un\u2019immagine a una dimensione file specifica misurata in kilobyte.' },{ q: 'Come riduco un\u2019immagine a 200KB?', a: 'Carica l\u2019immagine, digita 200 nel campo target e clicca su Ridimensiona.' },{ q: 'Funziona per foto passaporto?', a: 'S\u00ec \u2014 inserisci la dimensione richiesta e scarica.' },{ q: 'C\u2019\u00e8 una dimensione minima?', a: 'Il minimo dipende dalle dimensioni e dal contenuto dell\u2019immagine.' },{ q: 'Quali formati sono supportati?', a: 'JPG, PNG e WebP in ingresso. L\u2019uscita \u00e8 sempre JPEG.' }],
    links: [{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' },{ href: '/crop', label: 'Ritaglia' },{ href: '/passport-photo', label: 'Foto passaporto' }],
  },
  ja: {
    h2a: '\u753b\u50cf\u3092\u7279\u5b9a\u306eKB\u30b5\u30a4\u30ba\u306b\u30ea\u30b5\u30a4\u30ba\u3059\u308b\u65b9\u6cd5',
    steps: ['<strong>\u753b\u50cf\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9</strong> \u2014 JPG\u3001PNG\u3001WebP\u30d5\u30a1\u30a4\u30eb\u3092\u30af\u30ea\u30c3\u30af\u307e\u305f\u306f\u30c9\u30e9\u30c3\u30b0\u3002','<strong>\u76ee\u6a19\u30b5\u30a4\u30ba\u3092\u5165\u529b</strong> \u2014 \u5e0c\u671b\u306e\u30ad\u30ed\u30d0\u30a4\u30c8\u6570\u3092\u5165\u529b\u3002','<strong>\u30ea\u30b5\u30a4\u30ba\u3092\u30af\u30ea\u30c3\u30af</strong> \u2014 \u30c4\u30fc\u30eb\u304c\u81ea\u52d5\u7684\u306b\u5727\u7e2e\u3002','<strong>\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9</strong> \u2014 \u30c7\u30d0\u30a4\u30b9\u306b\u4fdd\u5b58\u3002'],
    h2b: '\u6b63\u78ba\u306aKB\u306b\u5727\u7e2e\u3059\u308b\u6700\u9ad8\u306e\u7121\u6599\u30c4\u30fc\u30eb',
    body: '<p>100KB\u4ee5\u4e0b\u306e\u753b\u50cf\u304c\u5fc5\u8981\u3067\u3059\u304b\uff1fRelahConvert\u306f\u30b9\u30de\u30fc\u30c8\u306a\u5727\u7e2e\u3092\u4f7f\u7528 \u2014 \u5b8c\u5168\u306b\u30d6\u30e9\u30a6\u30b6\u5185\u3067\u52d5\u4f5c\u3002\u7121\u6599\u3067\u30d7\u30e9\u30a4\u30d9\u30fc\u30c8\u3002</p>',
    h3why: '\u306a\u305cKB\u3067\u30ea\u30b5\u30a4\u30ba\uff1f',
    why: '\u591a\u304f\u306e\u30b5\u30a4\u30c8\u3084\u653f\u5e9c\u30dd\u30fc\u30bf\u30eb\u306f\u7279\u5b9a\u30b5\u30a4\u30ba\u4ee5\u4e0b\u306e\u753b\u50cf\u3092\u8981\u6c42\u3057\u307e\u3059\u3002',
    faqs: [{ q: 'KB\u3067\u30ea\u30b5\u30a4\u30ba\u3068\u306f\uff1f', a: '\u753b\u50cf\u3092\u30ad\u30ed\u30d0\u30a4\u30c8\u5358\u4f4d\u306e\u7279\u5b9a\u30d5\u30a1\u30a4\u30eb\u30b5\u30a4\u30ba\u306b\u5727\u7e2e\u3059\u308b\u3053\u3068\u3067\u3059\u3002' },{ q: '200KB\u306b\u7e2e\u5c0f\u3059\u308b\u306b\u306f\uff1f', a: '\u753b\u50cf\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u3001200\u3092\u5165\u529b\u3057\u3066\u30ea\u30b5\u30a4\u30ba\u3092\u30af\u30ea\u30c3\u30af\u3002' },{ q: '\u30d1\u30b9\u30dd\u30fc\u30c8\u5199\u771f\u306b\u4f7f\u3048\u307e\u3059\u304b\uff1f', a: '\u306f\u3044 \u2014 \u5fc5\u8981\u306a\u30b5\u30a4\u30ba\u3092\u5165\u529b\u3057\u3066\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3002' },{ q: '\u6700\u5c0f\u30b5\u30a4\u30ba\u306f\uff1f', a: '\u6700\u5c0f\u306f\u753b\u50cf\u306e\u5bfa\u6cd5\u3068\u5185\u5bb9\u306b\u3088\u308a\u307e\u3059\u3002' },{ q: '\u5bfe\u5fdc\u30d5\u30a9\u30fc\u30de\u30c3\u30c8\u306f\uff1f', a: 'JPG\u3001PNG\u3001WebP\u3002\u51fa\u529b\u306f\u5e38\u306bJPEG\u3002' }],
    links: [{ href: '/compress', label: '\u5727\u7e2e' },{ href: '/resize', label: '\u30ea\u30b5\u30a4\u30ba' },{ href: '/crop', label: '\u30af\u30ed\u30c3\u30d7' },{ href: '/passport-photo', label: '\u8a3c\u660e\u5199\u771f' }],
  },
  ru: {
    h2a: '\u041a\u0430\u043a \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u0434\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e\u0433\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u041a\u0411',
    steps: ['<strong>\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435</strong> \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u0438\u043b\u0438 \u043f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043b JPG, PNG \u0438\u043b\u0438 WebP.','<strong>\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0446\u0435\u043b\u0435\u0432\u043e\u0439 \u0440\u0430\u0437\u043c\u0435\u0440</strong> \u2014 \u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440 \u0432 \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u0445.','<strong>\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c</strong> \u2014 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u0441\u0436\u0438\u043c\u0430\u0435\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438.','<strong>\u0421\u043a\u0430\u0447\u0430\u0439\u0442\u0435</strong> \u2014 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u043d\u0430 \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u043e.'],
    h2b: '\u041b\u0443\u0447\u0448\u0438\u0439 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u0434\u043b\u044f \u0441\u0436\u0430\u0442\u0438\u044f \u0434\u043e \u0442\u043e\u0447\u043d\u043e\u0433\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u041a\u0411',
    body: '<p>\u041d\u0443\u0436\u043d\u043e \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u043c\u0435\u043d\u0435\u0435 100 \u041a\u0411? RelahConvert \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0443\u043c\u043d\u043e\u0435 \u0441\u0436\u0430\u0442\u0438\u0435 \u2014 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e.</p>',
    h3why: '\u0417\u0430\u0447\u0435\u043c \u043c\u0435\u043d\u044f\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440 \u0432 \u041a\u0411?',
    why: '\u041c\u043d\u043e\u0433\u0438\u0435 \u0441\u0430\u0439\u0442\u044b \u0438 \u0433\u043e\u0441\u043f\u043e\u0440\u0442\u0430\u043b\u044b \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043c\u0435\u043d\u044c\u0448\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u043c\u0435\u0440\u0430.',
    faqs: [{ q: '\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u0430 \u0432 \u041a\u0411?', a: '\u042d\u0442\u043e \u0441\u0436\u0430\u0442\u0438\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u0434\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u043c\u0435\u0440\u0430 \u0432 \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u0445.' },{ q: '\u041a\u0430\u043a \u0443\u043c\u0435\u043d\u044c\u0448\u0438\u0442\u044c \u0434\u043e 200\u041a\u0411?', a: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 200 \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c.' },{ q: '\u0420\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0434\u043b\u044f \u0444\u043e\u0442\u043e \u043d\u0430 \u043f\u0430\u0441\u043f\u043e\u0440\u0442?', a: '\u0414\u0430 \u2014 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u043c\u044b\u0439 \u0440\u0430\u0437\u043c\u0435\u0440 \u0438 \u0441\u043a\u0430\u0447\u0430\u0439\u0442\u0435.' },{ q: '\u0415\u0441\u0442\u044c \u043c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0437\u043c\u0435\u0440?', a: '\u041c\u0438\u043d\u0438\u043c\u0443\u043c \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043e\u0442 \u0440\u0430\u0437\u043c\u0435\u0440\u043e\u0432 \u0438 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u043c\u043e\u0433\u043e \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f.' },{ q: '\u041a\u0430\u043a\u0438\u0435 \u0444\u043e\u0440\u043c\u0430\u0442\u044b \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044e\u0442\u0441\u044f?', a: 'JPG, PNG \u0438 WebP. \u0412\u044b\u0445\u043e\u0434 \u0432\u0441\u0435\u0433\u0434\u0430 JPEG.' }],
    links: [{ href: '/compress', label: '\u0421\u0436\u0430\u0442\u044c' },{ href: '/resize', label: '\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440' },{ href: '/crop', label: '\u041e\u0431\u0440\u0435\u0437\u0430\u0442\u044c' },{ href: '/passport-photo', label: '\u0424\u043e\u0442\u043e \u043d\u0430 \u043f\u0430\u0441\u043f\u043e\u0440\u0442' }],
  },
  ko: {
    h2a: '\uc774\ubbf8\uc9c0\ub97c \ud2b9\uc815 KB \ud06c\uae30\ub85c \ub9ac\uc0ac\uc774\uc988\ud558\ub294 \ubc29\ubc95',
    steps: ['<strong>\uc774\ubbf8\uc9c0 \uc5c5\ub85c\ub4dc</strong> \u2014 JPG, PNG, WebP \ud30c\uc77c\uc744 \ud074\ub9ad \ub610\ub294 \ub4dc\ub798\uadf8.','<strong>\ubaa9\ud45c \ud06c\uae30 \uc785\ub825</strong> \u2014 \uc6d0\ud558\ub294 \ud0ac\ub85c\ubc14\uc774\ud2b8 \uc218\ub97c \uc785\ub825.','<strong>\ub9ac\uc0ac\uc774\uc988 \ud074\ub9ad</strong> \u2014 \ub3c4\uad6c\uac00 \uc790\ub3d9\uc73c\ub85c \uc555\ucd95.','<strong>\ub2e4\uc6b4\ub85c\ub4dc</strong> \u2014 \uae30\uae30\uc5d0 \uc800\uc7a5.'],
    h2b: '\uc815\ud655\ud55c KB\ub85c \uc555\ucd95\ud558\ub294 \ucd5c\uace0\uc758 \ubb34\ub8cc \ub3c4\uad6c',
    body: '<p>100KB \uc774\ud558\uc758 \uc774\ubbf8\uc9c0\uac00 \ud544\uc694\ud558\uc2e0\uac00\uc694? RelahConvert\ub294 \uc2a4\ub9c8\ud2b8 \uc555\ucd95\uc744 \uc0ac\uc6a9 \u2014 \uc644\uc804\ud788 \ube0c\ub77c\uc6b0\uc800\uc5d0\uc11c \ub3d9\uc791. \ubb34\ub8cc\uc774\uace0 \ube44\uacf5\uac1c.</p>',
    h3why: '\uc65c KB\ub85c \ub9ac\uc0ac\uc774\uc988?',
    why: '\ub9ce\uc740 \uc0ac\uc774\ud2b8\uc640 \uc815\ubd80 \ud3ec\ud138\uc774 \ud2b9\uc815 \ud06c\uae30 \uc774\ud558\uc758 \uc774\ubbf8\uc9c0\ub97c \uc694\uad6c\ud569\ub2c8\ub2e4.',
    faqs: [{ q: 'KB\ub85c \ub9ac\uc0ac\uc774\uc988\ub780?', a: '\uc774\ubbf8\uc9c0\ub97c \ud0ac\ub85c\ubc14\uc774\ud2b8 \ub2e8\uc704\uc758 \ud2b9\uc815 \ud30c\uc77c \ud06c\uae30\ub85c \uc555\ucd95\ud558\ub294 \uac83\uc785\ub2c8\ub2e4.' },{ q: '200KB\ub85c \uc904\uc774\ub824\uba74?', a: '\uc774\ubbf8\uc9c0\ub97c \uc5c5\ub85c\ub4dc\ud558\uace0 200\uc744 \uc785\ub825\ud55c \ud6c4 \ub9ac\uc0ac\uc774\uc988 \ud074\ub9ad.' },{ q: '\uc5ec\uad8c \uc0ac\uc9c4\uc5d0 \uc0ac\uc6a9 \uac00\ub2a5?', a: '\uc608 \u2014 \ud544\uc694\ud55c \ud06c\uae30\ub97c \uc785\ub825\ud558\uace0 \ub2e4\uc6b4\ub85c\ub4dc.' },{ q: '\ucd5c\uc18c \ud06c\uae30\uac00 \uc788\ub098\uc694?', a: '\ucd5c\uc18c\ub294 \uc774\ubbf8\uc9c0 \ud06c\uae30\uc640 \ub0b4\uc6a9\uc5d0 \ub530\ub77c \ub2e4\ub985\ub2c8\ub2e4.' },{ q: '\uc9c0\uc6d0 \ud3ec\ub9f7\uc740?', a: 'JPG, PNG, WebP. \ucd9c\ub825\uc740 \ud56d\uc0c1 JPEG.' }],
    links: [{ href: '/compress', label: '\uc555\ucd95' },{ href: '/resize', label: '\ud06c\uae30 \uc870\uc815' },{ href: '/crop', label: '\uc790\ub974\uae30' },{ href: '/passport-photo', label: '\uc5ec\uad8c \uc0ac\uc9c4' }],
  },
  zh: {
    h2a: '\u5982\u4f55\u5c06\u56fe\u7247\u8c03\u6574\u4e3a\u7279\u5b9aKB\u5927\u5c0f',
    steps: ['<strong>\u4e0a\u4f20\u56fe\u7247</strong> \u2014 \u70b9\u51fb\u6216\u62d6\u653eJPG\u3001PNG\u6216WebP\u6587\u4ef6\u3002','<strong>\u8f93\u5165\u76ee\u6807\u5927\u5c0f</strong> \u2014 \u8f93\u5165\u5e0c\u671b\u7684\u5343\u5b57\u8282\u6570\u3002','<strong>\u70b9\u51fb\u8c03\u6574</strong> \u2014 \u5de5\u5177\u81ea\u52a8\u538b\u7f29\u3002','<strong>\u4e0b\u8f7d</strong> \u2014 \u4fdd\u5b58\u5230\u8bbe\u5907\u3002'],
    h2b: '\u538b\u7f29\u56fe\u7247\u5230\u7cbe\u786eKB\u7684\u6700\u4f73\u514d\u8d39\u5de5\u5177',
    body: '<p>\u9700\u8981100KB\u4ee5\u4e0b\u7684\u56fe\u7247\uff1fRelahConvert\u4f7f\u7528\u667a\u80fd\u538b\u7f29 \u2014 \u5b8c\u5168\u5728\u6d4f\u89c8\u5668\u4e2d\u8fd0\u884c\u3002\u514d\u8d39\u4e14\u79c1\u5bc6\u3002</p>',
    h3why: '\u4e3a\u4ec0\u4e48\u8981\u6309KB\u8c03\u6574\uff1f',
    why: '\u8bb8\u591a\u7f51\u7ad9\u548c\u653f\u5e9c\u95e8\u6237\u8981\u6c42\u56fe\u7247\u4f4e\u4e8e\u7279\u5b9a\u5927\u5c0f\u3002',
    faqs: [{ q: '\u4ec0\u4e48\u662f\u6309KB\u8c03\u6574\u56fe\u7247\uff1f', a: '\u5c06\u56fe\u7247\u538b\u7f29\u5230\u4ee5\u5343\u5b57\u8282\u4e3a\u5355\u4f4d\u7684\u7279\u5b9a\u6587\u4ef6\u5927\u5c0f\u3002' },{ q: '\u5982\u4f55\u7f29\u5c0f\u5230200KB\uff1f', a: '\u4e0a\u4f20\u56fe\u7247\uff0c\u8f93\u5165200\uff0c\u70b9\u51fb\u8c03\u6574\u3002' },{ q: '\u9002\u7528\u4e8e\u62a4\u7167\u7167\u7247\u5417\uff1f', a: '\u662f\u7684 \u2014 \u8f93\u5165\u6240\u9700\u5927\u5c0f\u5e76\u4e0b\u8f7d\u3002' },{ q: '\u6709\u6700\u5c0f\u5927\u5c0f\u5417\uff1f', a: '\u6700\u5c0f\u503c\u53d6\u51b3\u4e8e\u56fe\u7247\u5c3a\u5bf8\u548c\u5185\u5bb9\u3002' },{ q: '\u652f\u6301\u54ea\u4e9b\u683c\u5f0f\uff1f', a: 'JPG\u3001PNG\u548cWebP\u3002\u8f93\u51fa\u59cb\u7ec8\u4e3aJPEG\u3002' }],
    links: [{ href: '/compress', label: '\u538b\u7f29' },{ href: '/resize', label: '\u8c03\u6574\u5927\u5c0f' },{ href: '/crop', label: '\u88c1\u526a' },{ href: '/passport-photo', label: '\u8bc1\u4ef6\u7167' }],
  },
  'zh-TW': {
    h2a: '\u5982\u4f55\u5c07\u5716\u7247\u8abf\u6574\u70ba\u7279\u5b9aKB\u5927\u5c0f',
    steps: ['<strong>\u4e0a\u50b3\u5716\u7247</strong> \u2014 \u9ede\u64ca\u6216\u62d6\u653eJPG\u3001PNG\u6216WebP\u6a94\u6848\u3002','<strong>\u8f38\u5165\u76ee\u6a19\u5927\u5c0f</strong> \u2014 \u8f38\u5165\u5e0c\u671b\u7684\u5343\u4f4d\u5143\u7d44\u6578\u3002','<strong>\u9ede\u64ca\u8abf\u6574</strong> \u2014 \u5de5\u5177\u81ea\u52d5\u58d3\u7e2e\u3002','<strong>\u4e0b\u8f09</strong> \u2014 \u5132\u5b58\u5230\u88dd\u7f6e\u3002'],
    h2b: '\u58d3\u7e2e\u5716\u7247\u5230\u7cbe\u78baKB\u7684\u6700\u4f73\u514d\u8cbb\u5de5\u5177',
    body: '<p>\u9700\u8981100KB\u4ee5\u4e0b\u7684\u5716\u7247\uff1fRelahConvert\u4f7f\u7528\u667a\u6167\u58d3\u7e2e \u2014 \u5b8c\u5168\u5728\u700f\u89bd\u5668\u4e2d\u904b\u884c\u3002\u514d\u8cbb\u4e14\u79c1\u5bc6\u3002</p>',
    h3why: '\u70ba\u4ec0\u9ebc\u8981\u6309KB\u8abf\u6574\uff1f',
    why: '\u8a31\u591a\u7db2\u7ad9\u548c\u653f\u5e9c\u5165\u53e3\u7db2\u7ad9\u8981\u6c42\u5716\u7247\u4f4e\u65bc\u7279\u5b9a\u5927\u5c0f\u3002',
    faqs: [{ q: '\u4ec0\u9ebc\u662f\u6309KB\u8abf\u6574\u5716\u7247\uff1f', a: '\u5c07\u5716\u7247\u58d3\u7e2e\u5230\u4ee5\u5343\u4f4d\u5143\u7d44\u70ba\u55ae\u4f4d\u7684\u7279\u5b9a\u6a94\u6848\u5927\u5c0f\u3002' },{ q: '\u5982\u4f55\u7e2e\u5c0f\u5230200KB\uff1f', a: '\u4e0a\u50b3\u5716\u7247\uff0c\u8f38\u5165200\uff0c\u9ede\u64ca\u8abf\u6574\u3002' },{ q: '\u9069\u7528\u65bc\u8b77\u7167\u7167\u7247\u55ce\uff1f', a: '\u662f\u7684 \u2014 \u8f38\u5165\u6240\u9700\u5927\u5c0f\u4e26\u4e0b\u8f09\u3002' },{ q: '\u6709\u6700\u5c0f\u5927\u5c0f\u55ce\uff1f', a: '\u6700\u5c0f\u503c\u53d6\u6c7a\u65bc\u5716\u7247\u5c3a\u5bf8\u548c\u5167\u5bb9\u3002' },{ q: '\u652f\u63f4\u54ea\u4e9b\u683c\u5f0f\uff1f', a: 'JPG\u3001PNG\u548cWebP\u3002\u8f38\u51fa\u59cb\u7d42\u70baJPEG\u3002' }],
    links: [{ href: '/compress', label: '\u58d3\u7e2e' },{ href: '/resize', label: '\u8abf\u6574\u5927\u5c0f' },{ href: '/crop', label: '\u88c1\u526a' },{ href: '/passport-photo', label: '\u8b49\u4ef6\u7167' }],
  },
  bg: { h2a:'\u041a\u0430\u043a \u0434\u0430 \u043f\u0440\u043e\u043c\u0435\u043d\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u0430 \u043d\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438 KB',steps:['<strong>\u041a\u0430\u0447\u0435\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435</strong> \u2014 \u0449\u0440\u0430\u043a\u043d\u0435\u0442\u0435 \u0438\u043b\u0438 \u043f\u043b\u044a\u0437\u043d\u0435\u0442\u0435 JPG, PNG \u0438\u043b\u0438 WebP.','<strong>\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0446\u0435\u043b\u0435\u0432\u0438\u044f \u0440\u0430\u0437\u043c\u0435\u0440</strong> \u2014 \u0432\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u0430 \u0432 \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442\u0438.','<strong>\u041d\u0430\u0442\u0438\u0441\u043d\u0435\u0442\u0435 \u041f\u0440\u043e\u043c\u0435\u043d\u0438</strong> \u2014 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044a\u0442 \u043a\u043e\u043c\u043f\u0440\u0435\u0441\u0438\u0440\u0430 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e.','<strong>\u0418\u0437\u0442\u0435\u0433\u043b\u0435\u0442\u0435</strong> \u2014 \u0437\u0430\u043f\u0430\u0437\u0435\u0442\u0435 \u043d\u0430 \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u043e\u0442\u043e.'],h2b:'\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0438\u044f\u0442 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u0435\u043d \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u0437\u0430 \u043a\u043e\u043c\u043f\u0440\u0435\u0441\u0438\u0440\u0430\u043d\u0435 \u0434\u043e \u0442\u043e\u0447\u043d\u0438 KB',body:'<p>\u041d\u0443\u0436\u0434\u0430\u0435\u0442\u0435 \u0441\u0435 \u043e\u0442 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u043f\u043e\u0434 100 KB? RelahConvert \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0438\u043d\u0442\u0435\u043b\u0438\u0433\u0435\u043d\u0442\u043d\u0430 \u043a\u043e\u043c\u043f\u0440\u0435\u0441\u0438\u044f \u2014 \u0438\u0437\u0446\u044f\u043b\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u044a\u0440\u0430.</p>',h3why:'\u0417\u0430\u0449\u043e \u0434\u0430 \u043f\u0440\u043e\u043c\u0435\u043d\u044f\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440\u0430 \u0432 KB?',why:'\u041c\u043d\u043e\u0433\u043e \u0441\u0430\u0439\u0442\u043e\u0432\u0435 \u0438\u0437\u0438\u0441\u043a\u0432\u0430\u0442 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043f\u043e\u0434 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d \u0440\u0430\u0437\u043c\u0435\u0440.',faqs:[{q:'\u041a\u0430\u043a\u0432\u043e \u0435 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u0440\u0430\u0437\u043c\u0435\u0440 \u0432 KB?',a:'\u041a\u043e\u043c\u043f\u0440\u0435\u0441\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0434\u043e \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d \u0440\u0430\u0437\u043c\u0435\u0440 \u0432 \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442\u0438.'},{q:'\u041a\u0430\u043a \u0434\u0430 \u043d\u0430\u043c\u0430\u043b\u044f \u0434\u043e 200KB?',a:'\u041a\u0430\u0447\u0435\u0442\u0435 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435, \u0432\u044a\u0432\u0435\u0434\u0435\u0442\u0435 200 \u0438 \u043d\u0430\u0442\u0438\u0441\u043d\u0435\u0442\u0435 \u041f\u0440\u043e\u043c\u0435\u043d\u0438.'},{q:'\u0420\u0430\u0431\u043e\u0442\u0438 \u043b\u0438 \u0437\u0430 \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u0438 \u0441\u043d\u0438\u043c\u043a\u0438?',a:'\u0414\u0430 \u2014 \u0432\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438\u044f \u0440\u0430\u0437\u043c\u0435\u0440.'},{q:'\u0418\u043c\u0430 \u043b\u0438 \u043c\u0438\u043d\u0438\u043c\u0430\u043b\u0435\u043d \u0440\u0430\u0437\u043c\u0435\u0440?',a:'\u041c\u0438\u043d\u0438\u043c\u0443\u043c\u044a\u0442 \u0437\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0440\u0430\u0437\u043c\u0435\u0440\u0438\u0442\u0435 \u0438 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435\u0442\u043e.'},{q:'\u041a\u0430\u043a\u0432\u0438 \u0444\u043e\u0440\u043c\u0430\u0442\u0438 \u0441\u0435 \u043f\u043e\u0434\u0434\u044a\u0440\u0436\u0430\u0442?',a:'JPG, PNG \u0438 WebP. \u0418\u0437\u0445\u043e\u0434\u044a\u0442 \u0435 \u0432\u0438\u043d\u0430\u0433\u0438 JPEG.'}],links:[{href:'/compress',label:'\u041a\u043e\u043c\u043f\u0440\u0435\u0441\u0438\u0440\u0430\u043d\u0435'},{href:'/resize',label:'\u041f\u0440\u0435\u043e\u0440\u0430\u0437\u043c\u0435\u0440\u044f\u0432\u0430\u043d\u0435'},{href:'/crop',label:'\u0418\u0437\u0440\u044f\u0437\u0432\u0430\u043d\u0435'},{href:'/passport-photo',label:'\u041f\u0430\u0441\u043f\u043e\u0440\u0442\u043d\u0430 \u0441\u043d\u0438\u043c\u043a\u0430'}]},
  ca: { h2a:'Com redimensionar una imatge a una mida espec\u00edfica en KB',steps:['<strong>Pugeu la imatge</strong> \u2014 feu clic o arrossegueu un fitxer JPG, PNG o WebP.','<strong>Introduïu la mida objectiu</strong> \u2014 escriviu la mida desitjada en kilobytes.','<strong>Feu clic a Redimensionar</strong> \u2014 l\u2019eina comprimeix autom\u00e0ticament.','<strong>Descarregueu</strong> \u2014 deseu la imatge al dispositiu.'],h2b:'Millor eina gratu\u00efta per comprimir a KB exactes',body:'<p>Necessiteu una imatge de menys de 100 KB? RelahConvert utilitza compressi\u00f3 intel\u00b7ligent \u2014 completament al navegador. Gratu\u00eft i privat.</p>',h3why:'Per qu\u00e8 redimensionar en KB?',why:'Molts llocs web i portals governamentals exigeixen imatges sota una mida espec\u00edfica.',faqs:[{q:'Qu\u00e8 \u00e9s redimensionar en KB?',a:'Comprimir una imatge a una mida espec\u00edfica en kilobytes.'},{q:'Com redueixo a 200KB?',a:'Pugeu la imatge, escriviu 200 i feu clic a Redimensionar.'},{q:'Funciona per a fotos de passaport?',a:'S\u00ed \u2014 introduïu la mida requerida.'},{q:'Hi ha una mida m\u00ednima?',a:'El m\u00ednim dep\u00e8n de les dimensions i el contingut.'},{q:'Quins formats se suporten?',a:'JPG, PNG i WebP. La sortida \u00e9s sempre JPEG.'}],links:[{href:'/compress',label:'Comprimir'},{href:'/resize',label:'Redimensionar'},{href:'/crop',label:'Retallar'},{href:'/passport-photo',label:'Foto passaport'}]},
  nl: { h2a:'Hoe een afbeelding naar een specifieke KB-grootte verkleinen',steps:['<strong>Upload je afbeelding</strong> \u2014 klik of sleep een JPG-, PNG- of WebP-bestand.','<strong>Voer doelgrootte in</strong> \u2014 typ de gewenste grootte in kilobytes.','<strong>Klik op Verkleinen</strong> \u2014 de tool comprimeert automatisch.','<strong>Download</strong> \u2014 sla de afbeelding op je apparaat op.'],h2b:'Beste gratis tool om afbeeldingen naar exacte KB te comprimeren',body:'<p>Een afbeelding onder 100 KB nodig? RelahConvert gebruikt slimme compressie \u2014 volledig in je browser. Gratis en priv\u00e9.</p>',h3why:'Waarom verkleinen in KB?',why:'Veel websites en overheidportalen vereisen afbeeldingen onder een specifieke grootte.',faqs:[{q:'Wat is verkleinen in KB?',a:'Een afbeelding comprimeren naar een specifieke bestandsgrootte in kilobytes.'},{q:'Hoe verklein ik naar 200KB?',a:'Upload je afbeelding, typ 200 en klik op Verkleinen.'},{q:'Werkt het voor pasfoto\u2019s?',a:'Ja \u2014 voer de vereiste grootte in.'},{q:'Is er een minimumgrootte?',a:'Het minimum hangt af van de afmetingen en inhoud.'},{q:'Welke formaten worden ondersteund?',a:'JPG, PNG en WebP. Uitvoer is altijd JPEG.'}],links:[{href:'/compress',label:'Comprimeren'},{href:'/resize',label:'Formaat wijzigen'},{href:'/crop',label:'Bijsnijden'},{href:'/passport-photo',label:'Pasfoto'}]},
  el: { h2a:'\u03a0\u03ce\u03c2 \u03bd\u03b1 \u03b1\u03bb\u03bb\u03ac\u03be\u03b5\u03c4\u03b5 \u03c4\u03bf \u03bc\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2 \u03b5\u03b9\u03ba\u03cc\u03bd\u03b1\u03c2 \u03c3\u03b5 \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b1 KB',steps:['<strong>\u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03c4\u03ce\u03c3\u03c4\u03b5 \u03c4\u03b7\u03bd \u03b5\u03b9\u03ba\u03cc\u03bd\u03b1</strong> \u2014 \u03ba\u03ac\u03bd\u03c4\u03b5 \u03ba\u03bb\u03b9\u03ba \u03ae \u03c3\u03cd\u03c1\u03b5\u03c4\u03b5 JPG, PNG \u03ae WebP.','<strong>\u0395\u03b9\u03c3\u03ac\u03b3\u03b5\u03c4\u03b5 \u03c4\u03bf \u03bc\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2-\u03c3\u03c4\u03cc\u03c7\u03bf</strong> \u2014 \u03c0\u03bb\u03b7\u03ba\u03c4\u03c1\u03bf\u03bb\u03bf\u03b3\u03ae\u03c3\u03c4\u03b5 \u03c4\u03b1 kilobyte.','<strong>\u039a\u03bb\u03b9\u03ba \u0391\u03bb\u03bb\u03b1\u03b3\u03ae</strong> \u2014 \u03c4\u03bf \u03b5\u03c1\u03b3\u03b1\u03bb\u03b5\u03af\u03bf \u03c3\u03c5\u03bc\u03c0\u03b9\u03ad\u03b6\u03b5\u03b9 \u03b1\u03c5\u03c4\u03cc\u03bc\u03b1\u03c4\u03b1.','<strong>\u039b\u03ae\u03c8\u03b7</strong> \u2014 \u03b1\u03c0\u03bf\u03b8\u03b7\u03ba\u03b5\u03cd\u03c3\u03c4\u03b5 \u03c3\u03c4\u03b7 \u03c3\u03c5\u03c3\u03ba\u03b5\u03c5\u03ae.'],h2b:'\u039a\u03b1\u03bb\u03cd\u03c4\u03b5\u03c1\u03bf \u03b4\u03c9\u03c1\u03b5\u03ac\u03bd \u03b5\u03c1\u03b3\u03b1\u03bb\u03b5\u03af\u03bf \u03c3\u03c5\u03bc\u03c0\u03af\u03b5\u03c3\u03b7\u03c2 \u03c3\u03b5 \u03b1\u03ba\u03c1\u03b9\u03b2\u03ae KB',body:'<p>\u03a7\u03c1\u03b5\u03b9\u03ac\u03b6\u03b5\u03c3\u03c4\u03b5 \u03b5\u03b9\u03ba\u03cc\u03bd\u03b1 \u03ba\u03ac\u03c4\u03c9 \u03b1\u03c0\u03cc 100 KB; \u0388\u03be\u03c5\u03c0\u03bd\u03b7 \u03c3\u03c5\u03bc\u03c0\u03af\u03b5\u03c3\u03b7 \u03c3\u03c4\u03bf \u03c0\u03c1\u03cc\u03b3\u03c1\u03b1\u03bc\u03bc\u03b1 \u03c0\u03b5\u03c1\u03b9\u03ae\u03b3\u03b7\u03c3\u03b7\u03c2.</p>',h3why:'\u0393\u03b9\u03b1\u03c4\u03af \u03b1\u03bb\u03bb\u03b1\u03b3\u03ae \u03bc\u03b5\u03b3\u03ad\u03b8\u03bf\u03c5\u03c2 \u03c3\u03b5 KB;',why:'\u03a0\u03bf\u03bb\u03bb\u03bf\u03af \u03b9\u03c3\u03c4\u03cc\u03c4\u03bf\u03c0\u03bf\u03b9 \u03b1\u03c0\u03b1\u03b9\u03c4\u03bf\u03cd\u03bd \u03b5\u03b9\u03ba\u03cc\u03bd\u03b5\u03c2 \u03ba\u03ac\u03c4\u03c9 \u03b1\u03c0\u03cc \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03bf \u03bc\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2.',faqs:[{q:'\u03a4\u03b9 \u03b5\u03af\u03bd\u03b1\u03b9 \u03b7 \u03b1\u03bb\u03bb\u03b1\u03b3\u03ae \u03bc\u03b5\u03b3\u03ad\u03b8\u03bf\u03c5\u03c2 \u03c3\u03b5 KB;',a:'\u03a3\u03c5\u03bc\u03c0\u03af\u03b5\u03c3\u03b7 \u03b5\u03b9\u03ba\u03cc\u03bd\u03b1\u03c2 \u03c3\u03b5 \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b1 kilobyte.'},{q:'\u03a0\u03ce\u03c2 \u03bc\u03b5\u03b9\u03ce\u03bd\u03c9 \u03c3\u03b5 200KB;',a:'\u039c\u03b5\u03c4\u03b1\u03c6\u03bf\u03c1\u03c4\u03ce\u03c3\u03c4\u03b5, \u03c0\u03bb\u03b7\u03ba\u03c4\u03c1\u03bf\u03bb\u03bf\u03b3\u03ae\u03c3\u03c4\u03b5 200 \u03ba\u03b1\u03b9 \u03ba\u03ac\u03bd\u03c4\u03b5 \u03ba\u03bb\u03b9\u03ba.'},{q:'\u039b\u03b5\u03b9\u03c4\u03bf\u03c5\u03c1\u03b3\u03b5\u03af \u03b3\u03b9\u03b1 \u03c6\u03c9\u03c4\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b5\u03c2 \u03b4\u03b9\u03b1\u03b2\u03b1\u03c4\u03b7\u03c1\u03af\u03bf\u03c5;',a:'\u039d\u03b1\u03b9 \u2014 \u03b5\u03b9\u03c3\u03ac\u03b3\u03b5\u03c4\u03b5 \u03c4\u03bf \u03b1\u03c0\u03b1\u03b9\u03c4\u03bf\u03cd\u03bc\u03b5\u03bd\u03bf \u03bc\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2.'},{q:'\u03a5\u03c0\u03ac\u03c1\u03c7\u03b5\u03b9 \u03b5\u03bb\u03ac\u03c7\u03b9\u03c3\u03c4\u03bf;',a:'\u0395\u03be\u03b1\u03c1\u03c4\u03ac\u03c4\u03b1\u03b9 \u03b1\u03c0\u03cc \u03c4\u03b9\u03c2 \u03b4\u03b9\u03b1\u03c3\u03c4\u03ac\u03c3\u03b5\u03b9\u03c2 \u03ba\u03b1\u03b9 \u03c4\u03bf \u03c0\u03b5\u03c1\u03b9\u03b5\u03c7\u03cc\u03bc\u03b5\u03bd\u03bf.'},{q:'\u03a0\u03bf\u03b9\u03b5\u03c2 \u03bc\u03bf\u03c1\u03c6\u03ad\u03c2 \u03c5\u03c0\u03bf\u03c3\u03c4\u03b7\u03c1\u03af\u03b6\u03bf\u03bd\u03c4\u03b1\u03b9;',a:'JPG, PNG \u03ba\u03b1\u03b9 WebP. \u0388\u03be\u03bf\u03b4\u03bf\u03c2 \u03c0\u03ac\u03bd\u03c4\u03b1 JPEG.'}],links:[{href:'/compress',label:'\u03a3\u03c5\u03bc\u03c0\u03af\u03b5\u03c3\u03b7'},{href:'/resize',label:'\u0391\u03bb\u03bb\u03b1\u03b3\u03ae \u03bc\u03b5\u03b3\u03ad\u03b8\u03bf\u03c5\u03c2'},{href:'/crop',label:'\u03a0\u03b5\u03c1\u03b9\u03ba\u03bf\u03c0\u03ae'},{href:'/passport-photo',label:'\u03a6\u03c9\u03c4\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b1 \u03b4\u03b9\u03b1\u03b2\u03b1\u03c4\u03b7\u03c1\u03af\u03bf\u03c5'}]},
  hi: { h2a:'\u0915\u093f\u0938\u0940 \u0907\u092e\u0947\u091c \u0915\u094b \u0935\u093f\u0936\u093f\u0937\u094d\u091f KB \u0906\u0915\u093e\u0930 \u092e\u0947\u0902 \u0915\u0948\u0938\u0947 \u092c\u0926\u0932\u0947\u0902',steps:['<strong>\u0905\u092a\u0928\u0940 \u091b\u0935\u093f \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902</strong> \u2014 JPG, PNG \u092f\u093e WebP \u092b\u093c\u093e\u0907\u0932 \u0915\u094d\u0932\u093f\u0915 \u092f\u093e \u0921\u094d\u0930\u0948\u0917 \u0915\u0930\u0947\u0902\u0964','<strong>\u0932\u0915\u094d\u0937\u094d\u092f \u0906\u0915\u093e\u0930 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902</strong> \u2014 \u0915\u093f\u0932\u094b\u092c\u093e\u0907\u091f \u092e\u0947\u0902 \u0906\u0915\u093e\u0930 \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902\u0964','<strong>\u092c\u0926\u0932\u0947\u0902 \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902</strong> \u2014 \u091f\u0942\u0932 \u0938\u094d\u0935\u091a\u093e\u0932\u093f\u0924 \u0930\u0942\u092a \u0938\u0947 \u0938\u0902\u092a\u0940\u0921\u093c\u093f\u0924 \u0915\u0930\u0924\u093e \u0939\u0948\u0964','<strong>\u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u0915\u0930\u0947\u0902</strong> \u2014 \u0905\u092a\u0928\u0947 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0938\u0939\u0947\u091c\u0947\u0902\u0964'],h2b:'\u0938\u091f\u0940\u0915 KB \u092e\u0947\u0902 \u0938\u0902\u092a\u0940\u0921\u093c\u093f\u0924 \u0915\u0930\u0928\u0947 \u0915\u093e \u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u092e\u0941\u092b\u094d\u0924 \u091f\u0942\u0932',body:'<p>100 KB \u0938\u0947 \u0915\u092e \u0915\u0940 \u091b\u0935\u093f \u091a\u093e\u0939\u093f\u090f? RelahConvert \u0938\u094d\u092e\u093e\u0930\u094d\u091f \u0915\u0902\u092a\u094d\u0930\u0947\u0936\u0928 \u0915\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0924\u093e \u0939\u0948 \u2014 \u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0947 \u092c\u094d\u0930\u093e\u0909\u091c\u093c\u0930 \u092e\u0947\u0902\u0964 \u092e\u0941\u092b\u094d\u0924 \u0914\u0930 \u0928\u093f\u091c\u0940\u0964</p>',h3why:'KB \u092e\u0947\u0902 \u0906\u0915\u093e\u0930 \u0915\u094d\u092f\u094b\u0902 \u092c\u0926\u0932\u0947\u0902?',why:'\u0915\u0908 \u0935\u0947\u092c\u0938\u093e\u0907\u091f\u094b\u0902 \u0914\u0930 \u0938\u0930\u0915\u093e\u0930\u0940 \u092a\u094b\u0930\u094d\u091f\u0932\u094b\u0902 \u0915\u094b \u090f\u0915 \u0935\u093f\u0936\u093f\u0937\u094d\u091f \u0906\u0915\u093e\u0930 \u0938\u0947 \u0915\u092e \u091b\u0935\u093f\u092f\u094b\u0902 \u0915\u0940 \u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e \u0939\u094b\u0924\u0940 \u0939\u0948\u0964',faqs:[{q:'KB \u092e\u0947\u0902 \u0906\u0915\u093e\u0930 \u092c\u0926\u0932\u0928\u093e \u0915\u094d\u092f\u093e \u0939\u0948?',a:'\u0915\u093f\u0932\u094b\u092c\u093e\u0907\u091f \u092e\u0947\u0902 \u092e\u093e\u092a\u0940 \u0917\u0908 \u0935\u093f\u0936\u093f\u0937\u094d\u091f \u092b\u093c\u093e\u0907\u0932 \u0906\u0915\u093e\u0930 \u092e\u0947\u0902 \u091b\u0935\u093f \u0915\u094b \u0938\u0902\u092a\u0940\u0921\u093c\u093f\u0924 \u0915\u0930\u0928\u093e\u0964'},{q:'200KB \u0924\u0915 \u0915\u0948\u0938\u0947 \u0915\u092e \u0915\u0930\u0947\u0902?',a:'\u091b\u0935\u093f \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902, 200 \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902 \u0914\u0930 \u092c\u0926\u0932\u0947\u0902 \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902\u0964'},{q:'\u0915\u094d\u092f\u093e \u092f\u0939 \u092a\u093e\u0938\u092a\u094b\u0930\u094d\u091f \u092b\u094b\u091f\u094b \u0915\u0947 \u0932\u093f\u090f \u0915\u093e\u092e \u0915\u0930\u0924\u093e \u0939\u0948?',a:'\u0939\u093e\u0901 \u2014 \u0906\u0935\u0936\u094d\u092f\u0915 \u0906\u0915\u093e\u0930 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902\u0964'},{q:'\u0915\u094d\u092f\u093e \u0928\u094d\u092f\u0942\u0928\u0924\u092e \u0906\u0915\u093e\u0930 \u0939\u0948?',a:'\u0928\u094d\u092f\u0942\u0928\u0924\u092e \u091b\u0935\u093f \u0915\u0947 \u0906\u0915\u093e\u0930 \u0914\u0930 \u0938\u093e\u092e\u0917\u094d\u0930\u0940 \u092a\u0930 \u0928\u093f\u0930\u094d\u092d\u0930 \u0915\u0930\u0924\u093e \u0939\u0948\u0964'},{q:'\u0915\u094c\u0928 \u0938\u0947 \u092a\u094d\u0930\u093e\u0930\u0942\u092a \u0938\u092e\u0930\u094d\u0925\u093f\u0924 \u0939\u0948\u0902?',a:'JPG, PNG \u0914\u0930 WebP\u0964 \u0906\u0909\u091f\u092a\u0941\u091f \u0939\u092e\u0947\u0936\u093e JPEG\u0964'}],links:[{href:'/compress',label:'\u0938\u0902\u092a\u0940\u0921\u093c\u093f\u0924 \u0915\u0930\u0947\u0902'},{href:'/resize',label:'\u0906\u0915\u093e\u0930 \u092c\u0926\u0932\u0947\u0902'},{href:'/crop',label:'\u0915\u094d\u0930\u0949\u092a'},{href:'/passport-photo',label:'\u092a\u093e\u0938\u092a\u094b\u0930\u094d\u091f \u092b\u094b\u091f\u094b'}]},
  id: { h2a:'Cara mengubah ukuran gambar ke KB tertentu',steps:['<strong>Unggah gambar</strong> \u2014 klik atau seret file JPG, PNG, atau WebP.','<strong>Masukkan ukuran target</strong> \u2014 ketik ukuran dalam kilobyte.','<strong>Klik Ubah Ukuran</strong> \u2014 alat mengompres otomatis.','<strong>Unduh</strong> \u2014 simpan ke perangkat.'],h2b:'Alat gratis terbaik untuk mengompres ke KB tepat',body:'<p>Butuh gambar di bawah 100 KB? RelahConvert menggunakan kompresi cerdas \u2014 sepenuhnya di browser. Gratis dan pribadi.</p>',h3why:'Mengapa mengubah ukuran dalam KB?',why:'Banyak situs web dan portal pemerintah membutuhkan gambar di bawah ukuran tertentu.',faqs:[{q:'Apa itu ubah ukuran dalam KB?',a:'Mengompres gambar ke ukuran file tertentu dalam kilobyte.'},{q:'Bagaimana mengurangi ke 200KB?',a:'Unggah gambar, ketik 200, klik Ubah Ukuran.'},{q:'Berfungsi untuk foto paspor?',a:'Ya \u2014 masukkan ukuran yang diperlukan.'},{q:'Ada ukuran minimum?',a:'Minimum tergantung dimensi dan konten gambar.'},{q:'Format apa yang didukung?',a:'JPG, PNG, dan WebP. Output selalu JPEG.'}],links:[{href:'/compress',label:'Kompres'},{href:'/resize',label:'Ubah Ukuran'},{href:'/crop',label:'Potong'},{href:'/passport-photo',label:'Foto Paspor'}]},
  ms: { h2a:'Cara mengubah saiz imej ke KB tertentu',steps:['<strong>Muat naik imej</strong> \u2014 klik atau seret fail JPG, PNG atau WebP.','<strong>Masukkan saiz sasaran</strong> \u2014 taip saiz dalam kilobait.','<strong>Klik Ubah Saiz</strong> \u2014 alat memampatkan secara automatik.','<strong>Muat turun</strong> \u2014 simpan ke peranti.'],h2b:'Alat percuma terbaik untuk memampatkan ke KB tepat',body:'<p>Perlukan imej di bawah 100 KB? RelahConvert menggunakan pemampatan pintar \u2014 sepenuhnya dalam pelayar. Percuma dan peribadi.</p>',h3why:'Mengapa ubah saiz dalam KB?',why:'Banyak laman web dan portal kerajaan memerlukan imej di bawah saiz tertentu.',faqs:[{q:'Apa itu ubah saiz dalam KB?',a:'Memampatkan imej ke saiz fail tertentu dalam kilobait.'},{q:'Bagaimana mengurangkan ke 200KB?',a:'Muat naik imej, taip 200, klik Ubah Saiz.'},{q:'Berfungsi untuk foto pasport?',a:'Ya \u2014 masukkan saiz yang diperlukan.'},{q:'Ada saiz minimum?',a:'Minimum bergantung pada dimensi dan kandungan.'},{q:'Format apa yang disokong?',a:'JPG, PNG dan WebP. Output sentiasa JPEG.'}],links:[{href:'/compress',label:'Mampat'},{href:'/resize',label:'Ubah Saiz'},{href:'/crop',label:'Potong'},{href:'/passport-photo',label:'Foto Pasport'}]},
  pl: { h2a:'Jak zmieni\u0107 rozmiar obrazu do okre\u015blonej ilo\u015bci KB',steps:['<strong>Prze\u015blij obraz</strong> \u2014 kliknij lub przeci\u0105gnij plik JPG, PNG lub WebP.','<strong>Wprowad\u017a rozmiar docelowy</strong> \u2014 wpisz rozmiar w kilobajtach.','<strong>Kliknij Zmie\u0144</strong> \u2014 narz\u0119dzie kompresuje automatycznie.','<strong>Pobierz</strong> \u2014 zapisz na urz\u0105dzeniu.'],h2b:'Najlepsze darmowe narz\u0119dzie do kompresji do dok\u0142adnych KB',body:'<p>Potrzebujesz obrazu poni\u017cej 100 KB? RelahConvert u\u017cywa inteligentnej kompresji \u2014 ca\u0142kowicie w przegl\u0105darce. Darmowe i prywatne.</p>',h3why:'Dlaczego zmienia\u0107 rozmiar w KB?',why:'Wiele stron i portali rz\u0105dowych wymaga obraz\u00f3w poni\u017cej okre\u015blonego rozmiaru.',faqs:[{q:'Co to jest zmiana rozmiaru w KB?',a:'Kompresja obrazu do okre\u015blonego rozmiaru w kilobajtach.'},{q:'Jak zmniejszy\u0107 do 200KB?',a:'Prze\u015blij obraz, wpisz 200 i kliknij Zmie\u0144.'},{q:'Dzia\u0142a dla zdj\u0119\u0107 paszportowych?',a:'Tak \u2014 wprowad\u017a wymagany rozmiar.'},{q:'Czy jest minimalny rozmiar?',a:'Minimum zale\u017cy od wymiar\u00f3w i zawarto\u015bci obrazu.'},{q:'Jakie formaty s\u0105 obs\u0142ugiwane?',a:'JPG, PNG i WebP. Wyj\u015bcie zawsze JPEG.'}],links:[{href:'/compress',label:'Kompresuj'},{href:'/resize',label:'Zmie\u0144 rozmiar'},{href:'/crop',label:'Przytnij'},{href:'/passport-photo',label:'Zdj\u0119cie paszportowe'}]},
  sv: { h2a:'Hur man \u00e4ndrar storlek p\u00e5 en bild till specifika KB',steps:['<strong>Ladda upp din bild</strong> \u2014 klicka eller dra en JPG-, PNG- eller WebP-fil.','<strong>Ange m\u00e5lstorlek</strong> \u2014 skriv storleken i kilobyte.','<strong>Klicka p\u00e5 \u00c4ndra</strong> \u2014 verktyget komprimerar automatiskt.','<strong>Ladda ner</strong> \u2014 spara p\u00e5 din enhet.'],h2b:'B\u00e4sta gratisverktyg f\u00f6r att komprimera till exakta KB',body:'<p>Beh\u00f6ver du en bild under 100 KB? RelahConvert anv\u00e4nder smart komprimering \u2014 helt i din webbl\u00e4sare. Gratis och privat.</p>',h3why:'Varf\u00f6r \u00e4ndra storlek i KB?',why:'M\u00e5nga webbplatser och myndighetsportaler kr\u00e4ver bilder under en specifik storlek.',faqs:[{q:'Vad \u00e4r storleks\u00e4ndring i KB?',a:'Att komprimera en bild till en specifik filstorlek i kilobyte.'},{q:'Hur minskar jag till 200KB?',a:'Ladda upp bilden, skriv 200 och klicka p\u00e5 \u00c4ndra.'},{q:'Fungerar det f\u00f6r passfoton?',a:'Ja \u2014 ange den kr\u00e4vda storleken.'},{q:'Finns det en minimistorlek?',a:'Minimum beror p\u00e5 bildens dimensioner och inneh\u00e5ll.'},{q:'Vilka format st\u00f6ds?',a:'JPG, PNG och WebP. Utdata \u00e4r alltid JPEG.'}],links:[{href:'/compress',label:'Komprimera'},{href:'/resize',label:'\u00c4ndra storlek'},{href:'/crop',label:'Besk\u00e4r'},{href:'/passport-photo',label:'Passfoto'}]},
  th: { h2a:'\u0e27\u0e34\u0e18\u0e35\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e\u0e40\u0e1b\u0e47\u0e19 KB \u0e40\u0e09\u0e1e\u0e32\u0e30',steps:['<strong>\u0e2d\u0e31\u0e1b\u0e42\u0e2b\u0e25\u0e14\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e</strong> \u2014 \u0e04\u0e25\u0e34\u0e01\u0e2b\u0e23\u0e37\u0e2d\u0e25\u0e32\u0e01\u0e44\u0e1f\u0e25\u0e4c JPG, PNG \u0e2b\u0e23\u0e37\u0e2d WebP','<strong>\u0e1b\u0e49\u0e2d\u0e19\u0e02\u0e19\u0e32\u0e14\u0e40\u0e1b\u0e49\u0e32\u0e2b\u0e21\u0e32\u0e22</strong> \u2014 \u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e02\u0e19\u0e32\u0e14\u0e40\u0e1b\u0e47\u0e19\u0e01\u0e34\u0e42\u0e25\u0e44\u0e1a\u0e15\u0e4c','<strong>\u0e04\u0e25\u0e34\u0e01\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14</strong> \u2014 \u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d\u0e1a\u0e35\u0e1a\u0e2d\u0e31\u0e14\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34','<strong>\u0e14\u0e32\u0e27\u0e19\u0e4c\u0e42\u0e2b\u0e25\u0e14</strong> \u2014 \u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e25\u0e07\u0e2d\u0e38\u0e1b\u0e01\u0e23\u0e13\u0e4c'],h2b:'\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e21\u0e37\u0e2d\u0e1f\u0e23\u0e35\u0e17\u0e35\u0e48\u0e14\u0e35\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e1a\u0e35\u0e1a\u0e2d\u0e31\u0e14\u0e40\u0e1b\u0e47\u0e19 KB \u0e17\u0e35\u0e48\u0e41\u0e19\u0e48\u0e19\u0e2d\u0e19',body:'<p>\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e\u0e15\u0e48\u0e33\u0e01\u0e27\u0e48\u0e32 100 KB? RelahConvert \u0e43\u0e0a\u0e49\u0e01\u0e32\u0e23\u0e1a\u0e35\u0e1a\u0e2d\u0e31\u0e14\u0e2d\u0e31\u0e08\u0e09\u0e23\u0e34\u0e22\u0e30 \u2014 \u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e43\u0e19\u0e40\u0e1a\u0e23\u0e32\u0e27\u0e4c\u0e40\u0e0b\u0e2d\u0e23\u0e4c \u0e1f\u0e23\u0e35\u0e41\u0e25\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27</p>',h3why:'\u0e17\u0e33\u0e44\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14\u0e40\u0e1b\u0e47\u0e19 KB?',why:'\u0e2b\u0e25\u0e32\u0e22\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e0b\u0e15\u0e4c\u0e41\u0e25\u0e30\u0e1e\u0e2d\u0e23\u0e4c\u0e17\u0e31\u0e25\u0e23\u0e32\u0e0a\u0e01\u0e32\u0e23\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e\u0e15\u0e48\u0e33\u0e01\u0e27\u0e48\u0e32\u0e02\u0e19\u0e32\u0e14\u0e17\u0e35\u0e48\u0e01\u0e33\u0e2b\u0e19\u0e14',faqs:[{q:'\u0e01\u0e32\u0e23\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14\u0e40\u0e1b\u0e47\u0e19 KB \u0e04\u0e37\u0e2d\u0e2d\u0e30\u0e44\u0e23?',a:'\u0e01\u0e32\u0e23\u0e1a\u0e35\u0e1a\u0e2d\u0e31\u0e14\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e\u0e43\u0e2b\u0e49\u0e44\u0e14\u0e49\u0e02\u0e19\u0e32\u0e14\u0e44\u0e1f\u0e25\u0e4c\u0e17\u0e35\u0e48\u0e01\u0e33\u0e2b\u0e19\u0e14\u0e40\u0e1b\u0e47\u0e19\u0e01\u0e34\u0e42\u0e25\u0e44\u0e1a\u0e15\u0e4c'},{q:'\u0e25\u0e14\u0e40\u0e2b\u0e25\u0e37\u0e2d 200KB \u0e44\u0e14\u0e49\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e44\u0e23?',a:'\u0e2d\u0e31\u0e1b\u0e42\u0e2b\u0e25\u0e14\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e \u0e1e\u0e34\u0e21\u0e1e\u0e4c 200 \u0e41\u0e25\u0e30\u0e04\u0e25\u0e34\u0e01\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14'},{q:'\u0e43\u0e0a\u0e49\u0e01\u0e31\u0e1a\u0e23\u0e39\u0e1b\u0e16\u0e48\u0e32\u0e22\u0e1e\u0e32\u0e2a\u0e1b\u0e2d\u0e23\u0e4c\u0e15\u0e44\u0e14\u0e49\u0e44\u0e2b\u0e21?',a:'\u0e44\u0e14\u0e49 \u2014 \u0e1b\u0e49\u0e2d\u0e19\u0e02\u0e19\u0e32\u0e14\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23'},{q:'\u0e21\u0e35\u0e02\u0e19\u0e32\u0e14\u0e02\u0e31\u0e49\u0e19\u0e15\u0e48\u0e33\u0e44\u0e2b\u0e21?',a:'\u0e02\u0e36\u0e49\u0e19\u0e2d\u0e22\u0e39\u0e48\u0e01\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14\u0e41\u0e25\u0e30\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2b\u0e32\u0e02\u0e2d\u0e07\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e'},{q:'\u0e23\u0e2d\u0e07\u0e23\u0e31\u0e1a\u0e23\u0e39\u0e1b\u0e41\u0e1a\u0e1a\u0e2d\u0e30\u0e44\u0e23?',a:'JPG, PNG \u0e41\u0e25\u0e30 WebP \u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c\u0e40\u0e1b\u0e47\u0e19 JPEG \u0e40\u0e2a\u0e21\u0e2d'}],links:[{href:'/compress',label:'\u0e1a\u0e35\u0e1a\u0e2d\u0e31\u0e14'},{href:'/resize',label:'\u0e1b\u0e23\u0e31\u0e1a\u0e02\u0e19\u0e32\u0e14'},{href:'/crop',label:'\u0e04\u0e23\u0e2d\u0e1a\u0e15\u0e31\u0e14'},{href:'/passport-photo',label:'\u0e23\u0e39\u0e1b\u0e16\u0e48\u0e32\u0e22\u0e1e\u0e32\u0e2a\u0e1b\u0e2d\u0e23\u0e4c\u0e15'}]},
  tr: { h2a:'G\u00f6rseli belirli KB boyutuna nas\u0131l de\u011fi\u015ftirirsiniz',steps:['<strong>G\u00f6rselinizi y\u00fckleyin</strong> \u2014 JPG, PNG veya WebP dosyas\u0131n\u0131 t\u0131klay\u0131n veya s\u00fcr\u00fckleyin.','<strong>Hedef boyutu girin</strong> \u2014 kilobayt cinsinden boyutu yaz\u0131n.','<strong>De\u011fi\u015ftir\'e t\u0131klay\u0131n</strong> \u2014 ara\u00e7 otomatik olarak s\u0131k\u0131\u015ft\u0131r\u0131r.','<strong>\u0130ndirin</strong> \u2014 cihaz\u0131n\u0131za kaydedin.'],h2b:'Tam KB\'ye s\u0131k\u0131\u015ft\u0131rmak i\u00e7in en iyi \u00fccretsiz ara\u00e7',body:'<p>100 KB alt\u0131nda g\u00f6rsele mi ihtiyac\u0131n\u0131z var? RelahConvert ak\u0131ll\u0131 s\u0131k\u0131\u015ft\u0131rma kullan\u0131r \u2014 tamamen taray\u0131c\u0131n\u0131zda. \u00dccretsiz ve gizli.</p>',h3why:'Neden KB olarak boyut de\u011fi\u015ftirmeli?',why:'Birçok web sitesi ve devlet portalı belirli bir boyutun alt\u0131nda g\u00f6rsel gerektirir.',faqs:[{q:'KB olarak boyut de\u011fi\u015ftirme nedir?',a:'G\u00f6rseli kilobayt cinsinden belirli bir dosya boyutuna s\u0131k\u0131\u015ft\u0131rmakt\u0131r.'},{q:'200KB\'ye nas\u0131l k\u00fc\u00e7\u00fclt\u00fcr\u00fcm?',a:'G\u00f6rseli y\u00fckleyin, 200 yaz\u0131n ve De\u011fi\u015ftir\'e t\u0131klay\u0131n.'},{q:'Pasaport foto\u011fraflar\u0131 i\u00e7in \u00e7al\u0131\u015f\u0131r m\u0131?',a:'Evet \u2014 gerekli boyutu girin.'},{q:'Minimum boyut var m\u0131?',a:'Minimum, g\u00f6rselin boyutlar\u0131na ve i\u00e7eri\u011fine ba\u011fl\u0131d\u0131r.'},{q:'Hangi formatlar destekleniyor?',a:'JPG, PNG ve WebP. \u00c7\u0131kt\u0131 her zaman JPEG.'}],links:[{href:'/compress',label:'S\u0131k\u0131\u015ft\u0131r'},{href:'/resize',label:'Boyutland\u0131r'},{href:'/crop',label:'K\u0131rp'},{href:'/passport-photo',label:'Vesikal\u0131k'}]},
  uk: { h2a:'\u042f\u043a \u0437\u043c\u0456\u043d\u0438\u0442\u0438 \u0440\u043e\u0437\u043c\u0456\u0440 \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f \u0434\u043e \u043f\u0435\u0432\u043d\u043e\u0457 \u043a\u0456\u043b\u044c\u043a\u043e\u0441\u0442\u0456 \u041a\u0411',steps:['<strong>\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0442\u0435 \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f</strong> \u2014 \u043d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u0430\u0431\u043e \u043f\u0435\u0440\u0435\u0442\u044f\u0433\u043d\u0456\u0442\u044c \u0444\u0430\u0439\u043b JPG, PNG \u0430\u0431\u043e WebP.','<strong>\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u0446\u0456\u043b\u044c\u043e\u0432\u0438\u0439 \u0440\u043e\u0437\u043c\u0456\u0440</strong> \u2014 \u0432\u043a\u0430\u0436\u0456\u0442\u044c \u0440\u043e\u0437\u043c\u0456\u0440 \u0443 \u043a\u0456\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u0445.','<strong>\u041d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u0417\u043c\u0456\u043d\u0438\u0442\u0438</strong> \u2014 \u0456\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u0441\u0442\u0438\u0441\u043a\u0430\u0454 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u043d\u043e.','<strong>\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0442\u0435</strong> \u2014 \u0437\u0431\u0435\u0440\u0435\u0436\u0456\u0442\u044c \u043d\u0430 \u043f\u0440\u0438\u0441\u0442\u0440\u0456\u0439.'],h2b:'\u041d\u0430\u0439\u043a\u0440\u0430\u0449\u0438\u0439 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0439 \u0456\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442 \u0434\u043b\u044f \u0441\u0442\u0438\u0441\u043d\u0435\u043d\u043d\u044f \u0434\u043e \u0442\u043e\u0447\u043d\u043e\u0457 \u043a\u0456\u043b\u044c\u043a\u043e\u0441\u0442\u0456 \u041a\u0411',body:'<p>\u041f\u043e\u0442\u0440\u0456\u0431\u043d\u0435 \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f \u043c\u0435\u043d\u0448\u0435 100 \u041a\u0411? RelahConvert \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454 \u0440\u043e\u0437\u0443\u043c\u043d\u0435 \u0441\u0442\u0438\u0441\u043d\u0435\u043d\u043d\u044f \u2014 \u043f\u043e\u0432\u043d\u0456\u0441\u0442\u044e \u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456. \u0411\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u043e \u0442\u0430 \u043a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u043e.</p>',h3why:'\u041d\u0430\u0432\u0456\u0449\u043e \u0437\u043c\u0456\u043d\u044e\u0432\u0430\u0442\u0438 \u0440\u043e\u0437\u043c\u0456\u0440 \u0443 \u041a\u0411?',why:'\u0411\u0430\u0433\u0430\u0442\u043e \u0441\u0430\u0439\u0442\u0456\u0432 \u0456 \u0434\u0435\u0440\u0436\u0430\u0432\u043d\u0438\u0445 \u043f\u043e\u0440\u0442\u0430\u043b\u0456\u0432 \u0432\u0438\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f \u043c\u0435\u043d\u0448\u0435 \u043f\u0435\u0432\u043d\u043e\u0433\u043e \u0440\u043e\u0437\u043c\u0456\u0440\u0443.',faqs:[{q:'\u0429\u043e \u0442\u0430\u043a\u0435 \u0437\u043c\u0456\u043d\u0430 \u0440\u043e\u0437\u043c\u0456\u0440\u0443 \u0432 \u041a\u0411?',a:'\u0421\u0442\u0438\u0441\u043d\u0435\u043d\u043d\u044f \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f \u0434\u043e \u043f\u0435\u0432\u043d\u043e\u0433\u043e \u0440\u043e\u0437\u043c\u0456\u0440\u0443 \u0432 \u043a\u0456\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u0445.'},{q:'\u042f\u043a \u0437\u043c\u0435\u043d\u0448\u0438\u0442\u0438 \u0434\u043e 200\u041a\u0411?',a:'\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0442\u0435 \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f, \u0432\u0432\u0435\u0434\u0456\u0442\u044c 200 \u0442\u0430 \u043d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u0417\u043c\u0456\u043d\u0438\u0442\u0438.'},{q:'\u041f\u0440\u0430\u0446\u044e\u0454 \u0434\u043b\u044f \u0444\u043e\u0442\u043e \u043d\u0430 \u043f\u0430\u0441\u043f\u043e\u0440\u0442?',a:'\u0422\u0430\u043a \u2014 \u0432\u0432\u0435\u0434\u0456\u0442\u044c \u043d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u0438\u0439 \u0440\u043e\u0437\u043c\u0456\u0440.'},{q:'\u0404 \u043c\u0456\u043d\u0456\u043c\u0430\u043b\u044c\u043d\u0438\u0439 \u0440\u043e\u0437\u043c\u0456\u0440?',a:'\u041c\u0456\u043d\u0456\u043c\u0443\u043c \u0437\u0430\u043b\u0435\u0436\u0438\u0442\u044c \u0432\u0456\u0434 \u0440\u043e\u0437\u043c\u0456\u0440\u0456\u0432 \u0442\u0430 \u0432\u043c\u0456\u0441\u0442\u0443 \u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u043d\u044f.'},{q:'\u042f\u043a\u0456 \u0444\u043e\u0440\u043c\u0430\u0442\u0438 \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u0443\u044e\u0442\u044c\u0441\u044f?',a:'JPG, PNG \u0442\u0430 WebP. \u0412\u0438\u0445\u0456\u0434 \u0437\u0430\u0432\u0436\u0434\u0438 JPEG.'}],links:[{href:'/compress',label:'\u0421\u0442\u0438\u0441\u043d\u0443\u0442\u0438'},{href:'/resize',label:'\u0417\u043c\u0456\u043d\u0438\u0442\u0438 \u0440\u043e\u0437\u043c\u0456\u0440'},{href:'/crop',label:'\u041e\u0431\u0440\u0456\u0437\u0430\u0442\u0438'},{href:'/passport-photo',label:'\u0424\u043e\u0442\u043e \u043d\u0430 \u043f\u0430\u0441\u043f\u043e\u0440\u0442'}]},
  vi: { h2a:'C\u00e1ch thay \u0111\u1ed5i k\u00edch th\u01b0\u1edbc \u1ea3nh th\u00e0nh KB c\u1ee5 th\u1ec3',steps:['<strong>T\u1ea3i \u1ea3nh l\u00ean</strong> \u2014 nh\u1ea5p ho\u1eb7c k\u00e9o th\u1ea3 t\u1ec7p JPG, PNG ho\u1eb7c WebP.','<strong>Nh\u1eadp k\u00edch th\u01b0\u1edbc m\u1ee5c ti\u00eau</strong> \u2014 g\u00f5 k\u00edch th\u01b0\u1edbc b\u1eb1ng kilobyte.','<strong>Nh\u1ea5p Thay \u0111\u1ed5i</strong> \u2014 c\u00f4ng c\u1ee5 t\u1ef1 \u0111\u1ed9ng n\u00e9n.','<strong>T\u1ea3i v\u1ec1</strong> \u2014 l\u01b0u v\u00e0o thi\u1ebft b\u1ecb.'],h2b:'C\u00f4ng c\u1ee5 mi\u1ec5n ph\u00ed t\u1ed1t nh\u1ea5t \u0111\u1ec3 n\u00e9n \u1ea3nh \u0111\u00fang KB',body:'<p>C\u1ea7n \u1ea3nh d\u01b0\u1edbi 100 KB? RelahConvert s\u1eed d\u1ee5ng n\u00e9n th\u00f4ng minh \u2014 ho\u00e0n to\u00e0n trong tr\u00ecnh duy\u1ec7t. Mi\u1ec5n ph\u00ed v\u00e0 ri\u00eang t\u01b0.</p>',h3why:'T\u1ea1i sao c\u1ea7n thay \u0111\u1ed5i k\u00edch th\u01b0\u1edbc theo KB?',why:'Nhi\u1ec1u trang web v\u00e0 c\u1ed5ng ch\u00ednh ph\u1ee7 y\u00eau c\u1ea7u \u1ea3nh d\u01b0\u1edbi k\u00edch th\u01b0\u1edbc nh\u1ea5t \u0111\u1ecbnh.',faqs:[{q:'Thay \u0111\u1ed5i k\u00edch th\u01b0\u1edbc theo KB l\u00e0 g\u00ec?',a:'N\u00e9n \u1ea3nh \u0111\u1ebfn k\u00edch th\u01b0\u1edbc t\u1ec7p c\u1ee5 th\u1ec3 t\u00ednh b\u1eb1ng kilobyte.'},{q:'L\u00e0m sao gi\u1ea3m xu\u1ed1ng 200KB?',a:'T\u1ea3i \u1ea3nh l\u00ean, g\u00f5 200, nh\u1ea5p Thay \u0111\u1ed5i.'},{q:'D\u00f9ng \u0111\u01b0\u1ee3c cho \u1ea3nh h\u1ed9 chi\u1ebfu?',a:'C\u00f3 \u2014 nh\u1eadp k\u00edch th\u01b0\u1edbc y\u00eau c\u1ea7u.'},{q:'C\u00f3 k\u00edch th\u01b0\u1edbc t\u1ed1i thi\u1ec3u kh\u00f4ng?',a:'T\u1ed1i thi\u1ec3u ph\u1ee5 thu\u1ed9c v\u00e0o k\u00edch th\u01b0\u1edbc v\u00e0 n\u1ed9i dung \u1ea3nh.'},{q:'H\u1ed7 tr\u1ee3 \u0111\u1ecbnh d\u1ea1ng n\u00e0o?',a:'JPG, PNG v\u00e0 WebP. \u0110\u1ea7u ra lu\u00f4n l\u00e0 JPEG.'}],links:[{href:'/compress',label:'N\u00e9n'},{href:'/resize',label:'\u0110\u1ed5i k\u00edch th\u01b0\u1edbc'},{href:'/crop',label:'C\u1eaft'},{href:'/passport-photo',label:'\u1ea2nh h\u1ed9 chi\u1ebfu'}]},
}

function buildSeoSection() {
  const lang = getLang()
  const seo = seoResizeKB[lang] || seoResizeKB['en']
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry = t.seo_also_try || 'Also Try'
  injectFaqSchema(seo.faqs)
  return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="internal-links">${seo.links.map(l => `<a href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div></div>`
}

// ── HTML ────────────────────────────────────────────────────────────────────
document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.rik_desc || 'Compress any image to an exact file size in KB. Free, private, browser-only.'}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${selectLbl}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" style="display:none;" />
    <div id="previewArea" style="display:none; margin-bottom:16px;"></div>
    <div id="controlsArea" style="display:none; margin-bottom:16px;">
      <label style="font-size:13px; font-weight:600; color:#2C1810; display:block; margin-bottom:6px;">${rikTargetLbl}</label>
      <div style="display:flex; gap:10px; align-items:center;">
        <input type="number" id="targetKB" min="1" max="99999" value="200" style="width:120px; padding:10px 14px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:15px; font-family:'DM Sans',sans-serif; color:#2C1810; outline:none;" />
        <span style="font-size:13px; color:#7A6A5A;">KB</span>
      </div>
    </div>
    <button id="resizeBtn" disabled style="display:none; width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${rikResizeBtn}</button>
    <div id="resultBar" style="display:none; margin-bottom:12px;"></div>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next || "WHAT'S NEXT?"}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
  ${buildSeoSection()}
`

injectHeader()

// ── DOM refs ────────────────────────────────────────────────────────────────
const fileInput      = document.getElementById('fileInput')
const previewArea    = document.getElementById('previewArea')
const controlsArea   = document.getElementById('controlsArea')
const resizeBtn      = document.getElementById('resizeBtn')
const targetKBInput  = document.getElementById('targetKB')
const resultBar      = document.getElementById('resultBar')
const downloadLink   = document.getElementById('downloadLink')
const nextSteps      = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')

let originalFile = null
let resultBlob = null
let currentDownloadUrl = null

// ── File handling ───────────────────────────────────────────────────────────
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  resultBlob = null
  cleanupOldUrl()
  resultBar.style.display = 'none'
  downloadLink.style.display = 'none'
  nextSteps.style.display = 'none'

  const url = URL.createObjectURL(file)
  previewArea.innerHTML = `<div class="preview-card">
    <img src="${url}" alt="preview" />
    <button class="remove-btn" id="removeBtn">&times;</button>
    <div class="fname">${file.name} &mdash; ${formatSize(file.size)}</div>
  </div>`
  previewArea.style.display = 'block'
  controlsArea.style.display = 'block'
  resizeBtn.style.display = 'block'
  setIdle()

  document.getElementById('removeBtn').addEventListener('click', () => {
    originalFile = null
    resultBlob = null
    cleanupOldUrl()
    previewArea.style.display = 'none'
    controlsArea.style.display = 'none'
    resizeBtn.style.display = 'none'
    resultBar.style.display = 'none'
    downloadLink.style.display = 'none'
    nextSteps.style.display = 'none'
    setDisabled()
    URL.revokeObjectURL(url)
  })
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadFile(fileInput.files[0])
  fileInput.value = ''
})

document.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation() })
document.addEventListener('drop', e => {
  e.preventDefault(); e.stopPropagation()
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) loadFile(file)
})

// ── Core compression logic ──────────────────────────────────────────────────
async function compressToTargetSize(canvas, targetKB) {
  const targetBytes = targetKB * 1024
  let min = 0.01, max = 1.0, quality = 0.8
  let bestBlob = null
  for (let i = 0; i < 15; i++) {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality))
    if (blob.size <= targetBytes) {
      bestBlob = blob
      min = quality
    } else {
      max = quality
    }
    quality = (min + max) / 2
  }
  return bestBlob
}

// ── Resize action ───────────────────────────────────────────────────────────
resizeBtn.addEventListener('click', async () => {
  if (!originalFile) return
  const targetKB = parseInt(targetKBInput.value)
  if (!targetKB || targetKB < 1) return

  if (originalFile.size <= targetKB * 1024) {
    showResultBar(originalFile.size, originalFile.size)
    resultBlob = originalFile
    showDownload(originalFile.name, originalFile)
    return
  }

  setResizing()

  try {
    const img = await loadImage(originalFile)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const blob = await compressToTargetSize(canvas, targetKB)
    if (!blob) {
      alert('Could not reach target size. Try a larger value or resize dimensions first.')
      setIdle()
      return
    }

    resultBlob = blob
    const baseName = originalFile.name.replace(/\.[^.]+$/, '')
    showResultBar(originalFile.size, blob.size)
    showDownload(baseName + '_' + targetKB + 'kb.jpg', blob)
  } catch (e) {
    alert('Error: ' + e.message)
  }
  setIdle()
})

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

// ── UI helpers ──────────────────────────────────────────────────────────────
function setDisabled() { resizeBtn.disabled = true; resizeBtn.textContent = rikResizeBtn; resizeBtn.style.background = '#C4B8A8'; resizeBtn.style.cursor = 'not-allowed'; resizeBtn.style.opacity = '0.7' }
function setIdle() { resizeBtn.disabled = false; resizeBtn.textContent = rikResizeBtn; resizeBtn.style.background = '#C84B31'; resizeBtn.style.cursor = 'pointer'; resizeBtn.style.opacity = '1' }
function setResizing() { resizeBtn.disabled = true; resizeBtn.textContent = rikResizingBtn; resizeBtn.style.background = '#9A8A7A'; resizeBtn.style.cursor = 'not-allowed'; resizeBtn.style.opacity = '1' }
function cleanupOldUrl() { if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null } }

function showResultBar(originalBytes, outputBytes) {
  const saved = Math.max(0, Math.round((1 - outputBytes / originalBytes) * 100))
  const circumference = 226
  const dashOffset = circumference - (circumference * saved / 100)
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
        <p class="result-saved">${saved}% ${rikReductionLbl}</p>
        <div class="result-sizes">
          <span>${rikOriginalLbl}: ${formatSize(originalBytes)}</span>
          <span class="result-arrow">\u2192</span>
          <span style="font-weight:600; color:#2C1810;">${rikOutputLbl}: ${formatSize(outputBytes)}</span>
        </div>
      </div>
    </div>`
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const circle = document.getElementById('circleAnim')
    if (circle) circle.style.strokeDashoffset = dashOffset
  }))
}

function showDownload(filename, blob) {
  cleanupOldUrl()
  currentDownloadUrl = URL.createObjectURL(blob)
  downloadLink.href = currentDownloadUrl
  downloadLink.download = filename
  downloadLink.textContent = dlLabel
  downloadLink.style.display = 'block'
  buildNextSteps()
}

// ── IndexedDB helpers ───────────────────────────────────────────────────────
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
    const file = new File([records[0].blob], records[0].name, { type: records[0].type })
    loadFile(file)
  } catch (e) {}
}

// ── Next steps ──────────────────────────────────────────────────────────────
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.compress || 'Compress Image', href: localHref('compress') },
    { label: ns.resize || 'Resize Image', href: localHref('resize') },
    { label: ns.crop || 'Crop Image', href: localHref('crop') },
    { label: ns['passport-photo'] || 'Passport Photo', href: localHref('passport-photo') },
  ]
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (resultBlob) {
        try {
          await saveFilesToIDB([{ blob: resultBlob, name: originalFile.name, type: resultBlob.type }])
          sessionStorage.setItem('pendingFromIDB', '1')
        } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

// ── Init ────────────────────────────────────────────────────────────────────
loadPendingFiles()
