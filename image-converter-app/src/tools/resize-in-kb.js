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
    h2a: 'Comment redimensionner une image à une taille en Ko précise',
    steps: ['<strong>Téléchargez votre image</strong> — cliquez sur « Sélectionner une image » ou glissez-déposez un fichier JPG, PNG ou WebP.','<strong>Entrez la taille cible</strong> — tapez la taille de fichier souhaitée en kilo-octets (par ex. 100 Ko, 200 Ko).','<strong>Cliquez sur Redimensionner</strong> — l\'outil compresse automatiquement pour atteindre votre taille cible.','<strong>Téléchargez</strong> — enregistrez l\'image redimensionnée sur votre appareil.'],
    h2b: 'Meilleur outil gratuit pour compresser une image à une taille en Ko exacte',
    body: '<p>Besoin d\'une image de moins de 100 Ko pour soumettre un formulaire ? Ou exactement 200 Ko pour une photo de visa ? L\'outil Redimensionner en Ko de RelahConvert utilise une compression intelligente par recherche binaire pour atteindre la taille de fichier cible aussi précisément que possible — le tout dans votre navigateur. Aucun téléversement, aucun serveur, entièrement gratuit.</p><p>Fonctionne parfaitement pour les exigences de taille de photo de passeport, les limites de téléversement des formulaires gouvernementaux, les restrictions de pièces jointes par e-mail, et toute situation où vous avez besoin d\'une image sous une limite de kilo-octets spécifique.</p>',
    h3why: 'Pourquoi redimensionner les images à une taille en Ko précise ?',
    why: 'De nombreux sites web, portails gouvernementaux et applications exigent des images sous une taille de fichier spécifique. Ajuster manuellement la qualité jusqu\'à atteindre la cible est fastidieux. Cet outil automatise le processus — entrez simplement votre taille cible en Ko et téléchargez.',
    faqs: [{ q: 'Qu\'est-ce que le redimensionnement d\'image en Ko ?', a: 'Redimensionner une image en Ko signifie compresser le fichier image à une taille de fichier spécifique mesurée en kilo-octets. Par exemple, réduire une photo de 2 Mo à exactement 200 Ko tout en maintenant une qualité visuelle acceptable.' },{ q: 'Comment réduire une image à 200 Ko ?', a: 'Téléchargez votre image, tapez 200 dans le champ de taille cible en Ko, et cliquez sur Redimensionner. L\'outil trouvera automatiquement le bon niveau de compression pour obtenir votre image aussi proche de 200 Ko que possible.' },{ q: 'Cela fonctionne-t-il pour les photos de passeport et de visa ?', a: 'Oui — de nombreux pays exigent des photos de passeport et de visa sous une taille de fichier spécifique (par ex. 100 Ko, 200 Ko, 300 Ko). Téléchargez votre photo, entrez la taille requise, et téléchargez.' },{ q: 'Y a-t-il une taille minimale de compression ?', a: 'Le minimum dépend des dimensions et du contenu de l\'image. Les images très détaillées ou grandes peuvent ne pas se compresser en dessous d\'un certain seuil sans d\'abord réduire les dimensions. Pour de meilleurs résultats, redimensionnez d\'abord les dimensions de l\'image, puis utilisez cet outil pour atteindre la cible en Ko.' },{ q: 'Quels formats sont supportés ?', a: 'Vous pouvez télécharger des images JPG, PNG et WebP. La sortie est toujours en JPEG pour un contrôle optimal de la compression.' }],
    links: [{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' },{ href: '/crop', label: 'Recadrer' },{ href: '/passport-photo', label: 'Photo passeport' }],
  },
  es: {
    h2a: 'Cómo redimensionar una imagen a un tamaño específico en KB',
    steps: ['<strong>Sube tu imagen</strong> — haz clic en "Seleccionar imagen" o arrastra y suelta un archivo JPG, PNG o WebP.','<strong>Ingresa el tamaño objetivo</strong> — escribe el tamaño de archivo que deseas en kilobytes (por ej. 100 KB, 200 KB).','<strong>Haz clic en Redimensionar</strong> — la herramienta comprime automáticamente para alcanzar tu tamaño objetivo.','<strong>Descarga</strong> — guarda la imagen redimensionada en tu dispositivo.'],
    h2b: 'Mejor herramienta gratuita para comprimir una imagen a un tamaño exacto en KB',
    body: '<p>¿Necesitas una imagen de menos de 100 KB para enviar un formulario? ¿O exactamente 200 KB para una foto de visa? La herramienta Redimensionar en KB de RelahConvert usa compresión inteligente de búsqueda binaria para alcanzar el tamaño de archivo objetivo con la mayor precisión posible — todo dentro de tu navegador. Sin subir archivos, sin servidor, completamente gratis.</p><p>Funciona perfectamente para requisitos de tamaño de foto de pasaporte, límites de carga de formularios gubernamentales, restricciones de archivos adjuntos en correos electrónicos, y cualquier situación donde necesites una imagen por debajo de un límite específico de kilobytes.</p>',
    h3why: '¿Por qué redimensionar imágenes a un tamaño específico en KB?',
    why: 'Muchos sitios web, portales gubernamentales y aplicaciones requieren imágenes por debajo de un tamaño de archivo específico. Ajustar manualmente la calidad hasta alcanzar el objetivo es tedioso. Esta herramienta automatiza el proceso — simplemente ingresa tu tamaño objetivo en KB y descarga.',
    faqs: [{ q: '¿Qué es redimensionar imagen en KB?', a: 'Redimensionar una imagen en KB significa comprimir el archivo de imagen a un tamaño de archivo específico medido en kilobytes. Por ejemplo, reducir una foto de 2 MB a exactamente 200 KB manteniendo una calidad visual aceptable.' },{ q: '¿Cómo reduzco una imagen a 200 KB?', a: 'Sube tu imagen, escribe 200 en el campo de tamaño objetivo en KB y haz clic en Redimensionar. La herramienta encontrará automáticamente el nivel de compresión adecuado para que tu imagen se acerque lo más posible a 200 KB.' },{ q: '¿Funciona para fotos de pasaporte y visa?', a: 'Sí — muchos países requieren fotos de pasaporte y visa por debajo de un tamaño de archivo específico (por ej. 100 KB, 200 KB, 300 KB). Sube tu foto, ingresa el tamaño requerido y descarga.' },{ q: '¿Hay un tamaño mínimo al que puedo comprimir?', a: 'El mínimo depende de las dimensiones y el contenido de la imagen. Las imágenes muy detalladas o grandes pueden no comprimirse por debajo de cierto umbral sin reducir primero las dimensiones. Para mejores resultados, redimensiona primero las dimensiones de la imagen y luego usa esta herramienta para alcanzar el objetivo en KB.' },{ q: '¿Qué formatos se admiten?', a: 'Puedes subir imágenes JPG, PNG y WebP. La salida es siempre JPEG para un control óptimo de la compresión.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto pasaporte' }],
  },
  pt: {
    h2a: 'Como redimensionar uma imagem para um tamanho específico em KB',
    steps: ['<strong>Envie sua imagem</strong> — clique em "Selecionar imagem" ou arraste e solte um arquivo JPG, PNG ou WebP.','<strong>Digite o tamanho alvo</strong> — insira o tamanho de arquivo desejado em kilobytes (por ex. 100 KB, 200 KB).','<strong>Clique em Redimensionar</strong> — a ferramenta comprime automaticamente para atingir o tamanho alvo.','<strong>Baixe</strong> — salve a imagem redimensionada no seu dispositivo.'],
    h2b: 'Melhor ferramenta gratuita para comprimir uma imagem a um tamanho exato em KB',
    body: '<p>Precisa de uma imagem com menos de 100 KB para enviar um formulário? Ou exatamente 200 KB para uma foto de visto? A ferramenta Redimensionar em KB do RelahConvert usa compressão inteligente de busca binária para atingir o tamanho de arquivo alvo com a maior precisão possível — tudo dentro do seu navegador. Sem upload, sem servidor, completamente gratuito.</p><p>Funciona perfeitamente para requisitos de tamanho de foto de passaporte, limites de upload de formulários governamentais, restrições de anexos de e-mail e qualquer situação onde você precise de uma imagem abaixo de um limite específico de kilobytes.</p>',
    h3why: 'Por que redimensionar imagens para um tamanho específico em KB?',
    why: 'Muitos sites, portais governamentais e aplicações exigem imagens abaixo de um tamanho de arquivo específico. Ajustar manualmente a qualidade até atingir o alvo é tedioso. Esta ferramenta automatiza o processo — basta inserir o tamanho alvo em KB e baixar.',
    faqs: [{ q: 'O que é redimensionar imagem em KB?', a: 'Redimensionar uma imagem em KB significa comprimir o arquivo de imagem para um tamanho de arquivo específico medido em kilobytes. Por exemplo, reduzir uma foto de 2 MB para exatamente 200 KB mantendo uma qualidade visual aceitável.' },{ q: 'Como reduzo uma imagem para 200 KB?', a: 'Envie sua imagem, digite 200 no campo de tamanho alvo em KB e clique em Redimensionar. A ferramenta encontrará automaticamente o nível de compressão correto para deixar sua imagem o mais próximo possível de 200 KB.' },{ q: 'Funciona para fotos de passaporte e visto?', a: 'Sim — muitos países exigem fotos de passaporte e visto abaixo de um tamanho de arquivo específico (por ex. 100 KB, 200 KB, 300 KB). Envie sua foto, insira o tamanho exigido e baixe.' },{ q: 'Existe um tamanho mínimo para compressão?', a: 'O mínimo depende das dimensões e do conteúdo da imagem. Imagens muito detalhadas ou grandes podem não comprimir abaixo de certo limite sem reduzir as dimensões primeiro. Para melhores resultados, redimensione primeiro as dimensões da imagem e depois use esta ferramenta para atingir o alvo em KB.' },{ q: 'Quais formatos são suportados?', a: 'Você pode enviar imagens JPG, PNG e WebP. A saída é sempre JPEG para controle ideal de compressão.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto passaporte' }],
  },
  de: {
    h2a: 'So ändern Sie die Bildgröße auf eine bestimmte KB-Größe',
    steps: ['<strong>Bild hochladen</strong> — klicken Sie auf „Bild auswählen" oder ziehen Sie eine JPG-, PNG- oder WebP-Datei per Drag & Drop.','<strong>Zielgröße eingeben</strong> — geben Sie die gewünschte Dateigröße in Kilobyte ein (z. B. 100 KB, 200 KB).','<strong>Klicken Sie auf Ändern</strong> — das Tool komprimiert automatisch, um Ihre Zielgröße zu erreichen.','<strong>Herunterladen</strong> — speichern Sie das verkleinerte Bild auf Ihrem Gerät.'],
    h2b: 'Bestes kostenloses Tool zum Komprimieren eines Bildes auf eine exakte KB-Größe',
    body: '<p>Brauchen Sie ein Bild unter 100 KB für eine Formulareinreichung? Oder genau 200 KB für ein Visafoto? Das KB-Größenänderungs-Tool von RelahConvert verwendet intelligente Binärsuche-Komprimierung, um Ihre Zieldateigröße so genau wie möglich zu erreichen — alles in Ihrem Browser. Kein Upload, kein Server, völlig kostenlos.</p><p>Funktioniert perfekt für Passbildgrößenanforderungen, Upload-Limits bei Behördenformularen, E-Mail-Anhangsbeschränkungen und jede Situation, in der Sie ein Bild unter einem bestimmten Kilobyte-Limit benötigen.</p>',
    h3why: 'Warum Bilder auf eine bestimmte KB-Größe ändern?',
    why: 'Viele Websites, Behördenportale und Anwendungen verlangen Bilder unter einer bestimmten Dateigröße. Die Qualität manuell anzupassen, bis das Ziel erreicht ist, ist mühsam. Dieses Tool automatisiert den Prozess — geben Sie einfach Ihre Ziel-KB ein und laden Sie herunter.',
    faqs: [{ q: 'Was bedeutet Bildgröße in KB ändern?', a: 'Die Bildgröße in KB zu ändern bedeutet, die Bilddatei auf eine bestimmte Dateigröße in Kilobyte zu komprimieren. Zum Beispiel ein 2-MB-Foto auf genau 200 KB zu reduzieren und dabei eine akzeptable visuelle Qualität beizubehalten.' },{ q: 'Wie reduziere ich ein Bild auf 200 KB?', a: 'Laden Sie Ihr Bild hoch, geben Sie 200 in das KB-Zielgrößenfeld ein und klicken Sie auf Ändern. Das Tool findet automatisch die richtige Komprimierungsstufe, um Ihr Bild so nah wie möglich an 200 KB zu bringen.' },{ q: 'Funktioniert das für Pass- und Visafotos?', a: 'Ja — viele Länder verlangen Pass- und Visafotos unter einer bestimmten Dateigröße (z. B. 100 KB, 200 KB, 300 KB). Laden Sie Ihr Foto hoch, geben Sie die erforderliche Größe ein und laden Sie es herunter.' },{ q: 'Gibt es eine Mindestgröße für die Komprimierung?', a: 'Das Minimum hängt von den Abmessungen und dem Inhalt des Bildes ab. Sehr detaillierte oder große Bilder lassen sich möglicherweise nicht unter einen bestimmten Schwellenwert komprimieren, ohne vorher die Abmessungen zu verkleinern. Für beste Ergebnisse ändern Sie zuerst die Bildabmessungen und verwenden dann dieses Tool, um das KB-Ziel zu erreichen.' },{ q: 'Welche Formate werden unterstützt?', a: 'Sie können JPG-, PNG- und WebP-Bilder hochladen. Die Ausgabe ist immer JPEG für optimale Komprimierungskontrolle.' }],
    links: [{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' },{ href: '/crop', label: 'Zuschneiden' },{ href: '/passport-photo', label: 'Passfoto' }],
  },
  ar: {
    h2a: 'كيفية تغيير حجم الصورة إلى حجم محدد بالكيلوبايت',
    steps: ['<strong>ارفع صورتك</strong> — انقر على "اختيار صورة" أو اسحب وأفلت ملف JPG أو PNG أو WebP.','<strong>أدخل الحجم المطلوب</strong> — اكتب حجم الملف الذي تريده بالكيلوبايت (مثلاً 100 كيلوبايت، 200 كيلوبايت).','<strong>انقر تغيير الحجم</strong> — الأداة تضغط تلقائياً للوصول إلى الحجم المستهدف.','<strong>حمّل</strong> — احفظ الصورة المُعدَّلة على جهازك.'],
    h2b: 'أفضل أداة مجانية لضغط الصورة إلى حجم محدد بالكيلوبايت',
    body: '<p>هل تحتاج صورة أقل من 100 كيلوبايت لتقديم نموذج؟ أو بالضبط 200 كيلوبايت لصورة تأشيرة؟ أداة تغيير الحجم بالكيلوبايت من RelahConvert تستخدم ضغطاً ذكياً بالبحث الثنائي للوصول إلى حجم الملف المستهدف بأكبر دقة ممكنة — كل ذلك داخل متصفحك. بدون رفع، بدون خادم، مجاني بالكامل.</p><p>تعمل بشكل مثالي لمتطلبات حجم صورة جواز السفر، وحدود رفع نماذج الجهات الحكومية، وقيود مرفقات البريد الإلكتروني، وأي حالة تحتاج فيها إلى صورة أقل من حد معين بالكيلوبايت.</p>',
    h3why: 'لماذا تغيير حجم الصور إلى حجم محدد بالكيلوبايت؟',
    why: 'العديد من المواقع والبوابات الحكومية والتطبيقات تتطلب صوراً تحت حجم ملف محدد. ضبط الجودة يدوياً حتى الوصول إلى الهدف أمر مرهق. هذه الأداة تُؤتمت العملية — فقط أدخل الحجم المستهدف بالكيلوبايت وحمّل.',
    faqs: [{ q: 'ما هو تغيير حجم الصورة بالكيلوبايت؟', a: 'تغيير حجم الصورة بالكيلوبايت يعني ضغط ملف الصورة إلى حجم ملف محدد يُقاس بالكيلوبايت. على سبيل المثال، تقليل صورة بحجم 2 ميغابايت إلى 200 كيلوبايت بالضبط مع الحفاظ على جودة بصرية مقبولة.' },{ q: 'كيف أقلل صورة إلى 200 كيلوبايت؟', a: 'ارفع صورتك، اكتب 200 في حقل الحجم المستهدف بالكيلوبايت، وانقر تغيير الحجم. ستجد الأداة تلقائياً مستوى الضغط المناسب لجعل صورتك أقرب ما يمكن إلى 200 كيلوبايت.' },{ q: 'هل يعمل لصور جواز السفر والتأشيرة؟', a: 'نعم — العديد من الدول تتطلب صور جواز السفر والتأشيرة تحت حجم ملف محدد (مثلاً 100 كيلوبايت، 200 كيلوبايت، 300 كيلوبايت). ارفع صورتك، أدخل الحجم المطلوب، وحمّل.' },{ q: 'هل هناك حد أدنى للضغط؟', a: 'الحد الأدنى يعتمد على أبعاد الصورة ومحتواها. الصور التفصيلية جداً أو الكبيرة قد لا تُضغط تحت عتبة معينة بدون تقليل الأبعاد أولاً. للحصول على أفضل النتائج، قم بتغيير أبعاد الصورة أولاً، ثم استخدم هذه الأداة للوصول إلى الهدف بالكيلوبايت.' },{ q: 'ما الصيغ المدعومة؟', a: 'يمكنك رفع صور JPG وPNG وWebP. المخرج دائماً JPEG للتحكم الأمثل في الضغط.' }],
    links: [{ href: '/compress', label: 'ضغط' },{ href: '/resize', label: 'تغيير الحجم' },{ href: '/crop', label: 'قص' },{ href: '/passport-photo', label: 'صورة جواز' }],
  },
  it: {
    h2a: 'Come ridimensionare un\'immagine a una dimensione specifica in KB',
    steps: ['<strong>Carica la tua immagine</strong> — clicca su "Seleziona immagine" o trascina e rilascia un file JPG, PNG o WebP.','<strong>Inserisci la dimensione target</strong> — digita la dimensione del file che desideri in kilobyte (es. 100 KB, 200 KB).','<strong>Clicca su Ridimensiona</strong> — lo strumento comprime automaticamente per raggiungere la dimensione target.','<strong>Scarica</strong> — salva l\'immagine ridimensionata sul tuo dispositivo.'],
    h2b: 'Miglior strumento gratuito per comprimere un\'immagine a una dimensione esatta in KB',
    body: '<p>Hai bisogno di un\'immagine sotto i 100 KB per inviare un modulo? O esattamente 200 KB per una foto visto? Lo strumento Ridimensiona in KB di RelahConvert usa una compressione intelligente a ricerca binaria per raggiungere la dimensione del file target il più precisamente possibile — tutto nel tuo browser. Nessun caricamento, nessun server, completamente gratuito.</p><p>Funziona perfettamente per i requisiti di dimensione delle foto passaporto, i limiti di caricamento dei moduli governativi, le restrizioni degli allegati e-mail e qualsiasi situazione in cui hai bisogno di un\'immagine sotto un limite specifico di kilobyte.</p>',
    h3why: 'Perché ridimensionare le immagini a una dimensione specifica in KB?',
    why: 'Molti siti web, portali governativi e applicazioni richiedono immagini sotto una dimensione di file specifica. Regolare manualmente la qualità fino a raggiungere l\'obiettivo è noioso. Questo strumento automatizza il processo — basta inserire la dimensione target in KB e scaricare.',
    faqs: [{ q: 'Cosa significa ridimensionare un\'immagine in KB?', a: 'Ridimensionare un\'immagine in KB significa comprimere il file immagine a una dimensione di file specifica misurata in kilobyte. Ad esempio, ridurre una foto da 2 MB a esattamente 200 KB mantenendo una qualità visiva accettabile.' },{ q: 'Come riduco un\'immagine a 200 KB?', a: 'Carica la tua immagine, digita 200 nel campo della dimensione target in KB e clicca su Ridimensiona. Lo strumento troverà automaticamente il livello di compressione giusto per portare la tua immagine il più vicino possibile a 200 KB.' },{ q: 'Funziona per foto passaporto e visto?', a: 'Sì — molti paesi richiedono foto passaporto e visto sotto una dimensione di file specifica (es. 100 KB, 200 KB, 300 KB). Carica la tua foto, inserisci la dimensione richiesta e scarica.' },{ q: 'C\'è una dimensione minima di compressione?', a: 'Il minimo dipende dalle dimensioni e dal contenuto dell\'immagine. Le immagini molto dettagliate o grandi potrebbero non comprimersi sotto una certa soglia senza prima ridurre le dimensioni. Per i migliori risultati, ridimensiona prima le dimensioni dell\'immagine, poi usa questo strumento per raggiungere l\'obiettivo in KB.' },{ q: 'Quali formati sono supportati?', a: 'Puoi caricare immagini JPG, PNG e WebP. L\'uscita è sempre JPEG per un controllo ottimale della compressione.' }],
    links: [{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' },{ href: '/crop', label: 'Ritaglia' },{ href: '/passport-photo', label: 'Foto passaporto' }],
  },
  ja: {
    h2a: '画像を特定のKBサイズにリサイズする方法',
    steps: ['<strong>画像をアップロード</strong> — 「画像を選択」をクリックするか、JPG、PNG、またはWebPファイルをドラッグ＆ドロップしてください。','<strong>目標サイズを入力</strong> — 希望するファイルサイズをキロバイトで入力してください（例：100 KB、200 KB）。','<strong>リサイズをクリック</strong> — ツールが自動的に目標サイズに合わせて圧縮します。','<strong>ダウンロード</strong> — リサイズされた画像をデバイスに保存してください。'],
    h2b: '画像を正確なKBサイズに圧縮する最高の無料ツール',
    body: '<p>フォーム送信用に100 KB以下の画像が必要ですか？ビザ写真用にちょうど200 KBが必要ですか？RelahConvertのKBリサイズツールは、スマートなバイナリサーチ圧縮を使用して、目標ファイルサイズにできるだけ近づけます — すべてブラウザ内で完結。アップロード不要、サーバー不要、完全無料です。</p><p>パスポート写真のサイズ要件、政府フォームのアップロード制限、メール添付の容量制限など、特定のキロバイト制限以下の画像が必要なあらゆる場面で完璧に機能します。</p>',
    h3why: 'なぜ画像を特定のKBにリサイズするのか？',
    why: '多くのウェブサイト、政府ポータル、アプリケーションでは、特定のファイルサイズ以下の画像が求められます。目標に達するまで手動で品質を調整するのは面倒です。このツールはそのプロセスを自動化します — 目標KBを入力してダウンロードするだけです。',
    faqs: [{ q: 'KBでリサイズとは？', a: 'KBでのリサイズとは、画像ファイルをキロバイト単位の特定のファイルサイズに圧縮することです。例えば、2 MBの写真を許容できる画質を維持しながら、ちょうど200 KBに縮小することを意味します。' },{ q: '200KBに縮小するには？', a: '画像をアップロードし、目標KBフィールドに200と入力してリサイズをクリックしてください。ツールが自動的に最適な圧縮レベルを見つけ、画像をできるだけ200 KBに近づけます。' },{ q: 'パスポートやビザの写真に使えますか？', a: 'はい — 多くの国ではパスポートやビザの写真に特定のファイルサイズ制限があります（例：100 KB、200 KB、300 KB）。写真をアップロードし、必要なサイズを入力してダウンロードしてください。' },{ q: '圧縮できる最小サイズは？', a: '最小サイズは画像の寸法と内容によって異なります。非常に詳細な画像や大きな画像は、先に寸法を縮小しないと特定の閾値以下に圧縮できない場合があります。最良の結果を得るには、まず画像の寸法をリサイズしてから、このツールでKB目標に合わせてください。' },{ q: '対応フォーマットは？', a: 'JPG、PNG、WebP画像をアップロードできます。最適な圧縮制御のため、出力は常にJPEG形式です。' }],
    links: [{ href: '/compress', label: '圧縮' },{ href: '/resize', label: 'リサイズ' },{ href: '/crop', label: 'クロップ' },{ href: '/passport-photo', label: '証明写真' }],
  },
  ru: {
    h2a: 'Как изменить размер изображения до определённого количества КБ',
    steps: ['<strong>Загрузите изображение</strong> — нажмите «Выбрать изображение» или перетащите файл JPG, PNG или WebP.','<strong>Введите целевой размер</strong> — укажите желаемый размер файла в килобайтах (например, 100 КБ, 200 КБ).','<strong>Нажмите Изменить</strong> — инструмент автоматически сжимает изображение до целевого размера.','<strong>Скачайте</strong> — сохраните изменённое изображение на устройство.'],
    h2b: 'Лучший бесплатный инструмент для сжатия изображения до точного количества КБ',
    body: '<p>Нужно изображение менее 100 КБ для отправки формы? Или ровно 200 КБ для визовой фотографии? Инструмент RelahConvert «Размер в КБ» использует умное сжатие с бинарным поиском, чтобы максимально точно достичь целевого размера файла — полностью в вашем браузере. Без загрузки на сервер, без регистрации, полностью бесплатно.</p><p>Идеально подходит для требований к размеру фото на паспорт, ограничений загрузки на государственных порталах, лимитов вложений электронной почты и любых ситуаций, когда необходимо изображение меньше определённого количества килобайт.</p>',
    h3why: 'Зачем менять размер изображений до определённого КБ?',
    why: 'Многие веб-сайты, государственные порталы и приложения требуют изображения меньше определённого размера файла. Ручная настройка качества до достижения нужного размера — утомительный процесс. Этот инструмент автоматизирует его — просто введите целевой размер в КБ и скачайте.',
    faqs: [{ q: 'Что такое изменение размера в КБ?', a: 'Изменение размера изображения в КБ означает сжатие файла изображения до определённого размера, измеряемого в килобайтах. Например, уменьшение фотографии размером 2 МБ до ровно 200 КБ при сохранении приемлемого визуального качества.' },{ q: 'Как уменьшить до 200КБ?', a: 'Загрузите изображение, введите 200 в поле целевого размера КБ и нажмите «Изменить». Инструмент автоматически подберёт оптимальный уровень сжатия, чтобы размер изображения был максимально близок к 200 КБ.' },{ q: 'Работает для фото на паспорт?', a: 'Да — многие страны требуют, чтобы фотографии на паспорт и визу были меньше определённого размера файла (например, 100 КБ, 200 КБ, 300 КБ). Загрузите фотографию, введите требуемый размер и скачайте.' },{ q: 'Есть минимальный размер?', a: 'Минимум зависит от размеров и содержимого изображения. Очень детализированные или крупные изображения могут не сжаться ниже определённого порога без предварительного уменьшения размеров. Для лучших результатов сначала уменьшите размеры изображения, а затем используйте этот инструмент для достижения целевого КБ.' },{ q: 'Какие форматы поддерживаются?', a: 'Вы можете загрузить изображения в форматах JPG, PNG и WebP. Выходной формат всегда JPEG для оптимального контроля сжатия.' }],
    links: [{ href: '/compress', label: 'Сжать' },{ href: '/resize', label: 'Изменить размер' },{ href: '/crop', label: 'Обрезать' },{ href: '/passport-photo', label: 'Фото на паспорт' }],
  },
  ko: {
    h2a: '이미지를 특정 KB 크기로 리사이즈하는 방법',
    steps: ['<strong>이미지 업로드</strong> — "이미지 선택"을 클릭하거나 JPG, PNG 또는 WebP 파일을 드래그 앤 드롭하세요.','<strong>목표 크기 입력</strong> — 원하는 파일 크기를 킬로바이트로 입력하세요 (예: 100 KB, 200 KB).','<strong>리사이즈 클릭</strong> — 도구가 자동으로 목표 크기에 맞게 압축합니다.','<strong>다운로드</strong> — 리사이즈된 이미지를 기기에 저장하세요.'],
    h2b: '이미지를 정확한 KB 크기로 압축하는 최고의 무료 도구',
    body: '<p>폼 제출을 위해 100 KB 이하의 이미지가 필요하신가요? 비자 사진을 위해 정확히 200 KB가 필요하신가요? RelahConvert의 KB 리사이즈 도구는 스마트한 이진 탐색 압축을 사용하여 목표 파일 크기에 최대한 가깝게 맞춥니다 — 모두 브라우저 안에서 처리됩니다. 업로드 없음, 서버 없음, 완전 무료입니다.</p><p>여권 사진 크기 요구사항, 정부 포털 업로드 제한, 이메일 첨부 용량 제한 등 특정 킬로바이트 제한 이하의 이미지가 필요한 모든 상황에 완벽하게 작동합니다.</p>',
    h3why: '왜 이미지를 특정 KB로 리사이즈해야 할까요?',
    why: '많은 웹사이트, 정부 포털, 애플리케이션에서 특정 파일 크기 이하의 이미지를 요구합니다. 목표에 도달할 때까지 수동으로 품질을 조정하는 것은 번거로운 작업입니다. 이 도구는 그 과정을 자동화합니다 — 목표 KB를 입력하고 다운로드하기만 하면 됩니다.',
    faqs: [{ q: 'KB로 리사이즈란?', a: 'KB로 이미지 리사이즈란 이미지 파일을 킬로바이트 단위의 특정 파일 크기로 압축하는 것을 의미합니다. 예를 들어, 2 MB 사진을 허용 가능한 시각적 품질을 유지하면서 정확히 200 KB로 줄이는 것입니다.' },{ q: '200KB로 줄이려면?', a: '이미지를 업로드하고 목표 KB 필드에 200을 입력한 후 리사이즈를 클릭하세요. 도구가 자동으로 최적의 압축 수준을 찾아 이미지를 가능한 한 200 KB에 가깝게 만듭니다.' },{ q: '여권 사진에 사용 가능?', a: '예 — 많은 국가에서 여권 및 비자 사진의 파일 크기를 특정 크기 이하로 요구합니다 (예: 100 KB, 200 KB, 300 KB). 사진을 업로드하고 필요한 크기를 입력한 후 다운로드하세요.' },{ q: '최소 크기가 있나요?', a: '최소 크기는 이미지의 크기와 내용에 따라 다릅니다. 매우 상세하거나 큰 이미지는 먼저 크기를 줄이지 않으면 특정 임계값 이하로 압축되지 않을 수 있습니다. 최상의 결과를 위해 먼저 이미지 크기를 조정한 다음 이 도구를 사용하여 KB 목표에 맞추세요.' },{ q: '지원 포맷은?', a: 'JPG, PNG, WebP 이미지를 업로드할 수 있습니다. 최적의 압축 제어를 위해 출력은 항상 JPEG 형식입니다.' }],
    links: [{ href: '/compress', label: '압축' },{ href: '/resize', label: '크기 조정' },{ href: '/crop', label: '자르기' },{ href: '/passport-photo', label: '여권 사진' }],
  },
  zh: {
    h2a: '如何将图片调整为特定KB大小',
    steps: ['<strong>上传图片</strong> — 点击"选择图片"或拖放JPG、PNG或WebP文件。','<strong>输入目标大小</strong> — 输入您想要的文件大小（以千字节为单位，例如 100 KB、200 KB）。','<strong>点击调整</strong> — 工具自动压缩以达到目标大小。','<strong>下载</strong> — 将调整后的图片保存到设备。'],
    h2b: '将图片压缩到精确KB大小的最佳免费工具',
    body: '<p>需要100 KB以下的图片来提交表单？或者签证照片需要恰好200 KB？RelahConvert的KB调整工具使用智能二分搜索压缩，尽可能精确地达到您的目标文件大小 — 全部在浏览器中完成。无需上传、无需服务器、完全免费。</p><p>完美适用于护照照片尺寸要求、政府表单上传限制、电子邮件附件大小限制，以及任何需要图片低于特定千字节限制的场景。</p>',
    h3why: '为什么要按KB调整图片大小？',
    why: '许多网站、政府门户和应用程序要求图片低于特定文件大小。手动调整质量直到达到目标是一项繁琐的工作。这个工具自动化了整个过程 — 只需输入目标KB并下载即可。',
    faqs: [{ q: '什么是按KB调整图片？', a: '按KB调整图片大小意味着将图片文件压缩到以千字节为单位的特定文件大小。例如，将一张2 MB的照片缩小到恰好200 KB，同时保持可接受的视觉质量。' },{ q: '如何缩小到200KB？', a: '上传您的图片，在目标KB字段中输入200，然后点击调整。工具会自动找到合适的压缩级别，使图片尽可能接近200 KB。' },{ q: '适用于护照和签证照片吗？', a: '是的 — 许多国家要求护照和签证照片低于特定文件大小（例如 100 KB、200 KB、300 KB）。上传您的照片，输入所需大小并下载。' },{ q: '有最小大小吗？', a: '最小值取决于图片的尺寸和内容。非常详细或尺寸较大的图片可能无法在不先缩小尺寸的情况下压缩到某个阈值以下。为获得最佳效果，请先调整图片尺寸，然后使用此工具来达到KB目标。' },{ q: '支持哪些格式？', a: '您可以上传JPG、PNG和WebP图片。为了实现最佳压缩控制，输出始终为JPEG格式。' }],
    links: [{ href: '/compress', label: '压缩' },{ href: '/resize', label: '调整大小' },{ href: '/crop', label: '裁剪' },{ href: '/passport-photo', label: '证件照' }],
  },
  'zh-TW': {
    h2a: '如何將圖片調整為特定KB大小',
    steps: ['<strong>上傳圖片</strong> — 點擊「選擇圖片」或拖放JPG、PNG或WebP檔案。','<strong>輸入目標大小</strong> — 輸入您想要的檔案大小（以千位元組為單位，例如 100 KB、200 KB）。','<strong>點擊調整</strong> — 工具自動壓縮以達到目標大小。','<strong>下載</strong> — 將調整後的圖片儲存到裝置。'],
    h2b: '將圖片壓縮到精確KB大小的最佳免費工具',
    body: '<p>需要100 KB以下的圖片來提交表單？或者簽證照片需要恰好200 KB？RelahConvert的KB調整工具使用智慧二分搜尋壓縮，盡可能精確地達到您的目標檔案大小 — 全部在瀏覽器中完成。無需上傳、無需伺服器、完全免費。</p><p>完美適用於護照照片尺寸要求、政府表單上傳限制、電子郵件附件大小限制，以及任何需要圖片低於特定千位元組限制的場景。</p>',
    h3why: '為什麼要按KB調整圖片大小？',
    why: '許多網站、政府入口網站和應用程式要求圖片低於特定檔案大小。手動調整品質直到達到目標是一項繁瑣的工作。這個工具自動化了整個過程 — 只需輸入目標KB並下載即可。',
    faqs: [{ q: '什麼是按KB調整圖片？', a: '按KB調整圖片大小意味著將圖片檔案壓縮到以千位元組為單位的特定檔案大小。例如，將一張2 MB的照片縮小到恰好200 KB，同時保持可接受的視覺品質。' },{ q: '如何縮小到200KB？', a: '上傳您的圖片，在目標KB欄位中輸入200，然後點擊調整。工具會自動找到合適的壓縮級別，使圖片盡可能接近200 KB。' },{ q: '適用於護照和簽證照片嗎？', a: '是的 — 許多國家要求護照和簽證照片低於特定檔案大小（例如 100 KB、200 KB、300 KB）。上傳您的照片，輸入所需大小並下載。' },{ q: '有最小大小嗎？', a: '最小值取決於圖片的尺寸和內容。非常詳細或尺寸較大的圖片可能無法在不先縮小尺寸的情況下壓縮到某個閾值以下。為獲得最佳效果，請先調整圖片尺寸，然後使用此工具來達到KB目標。' },{ q: '支援哪些格式？', a: '您可以上傳JPG、PNG和WebP圖片。為了實現最佳壓縮控制，輸出始終為JPEG格式。' }],
    links: [{ href: '/compress', label: '壓縮' },{ href: '/resize', label: '調整大小' },{ href: '/crop', label: '裁剪' },{ href: '/passport-photo', label: '證件照' }],
  },
  bg: {
    h2a: 'Как да промените размера на изображение до определени KB',
    steps: [
      '<strong>Качете изображението си</strong> — щракнете върху „Избор на изображение" или плъзнете и пуснете JPG, PNG или WebP файл.',
      '<strong>Въведете целевия размер</strong> — напишете желания размер на файла в килобайти (напр. 100 KB, 200 KB).',
      '<strong>Натиснете Промени</strong> — инструментът автоматично компресира, за да достигне целевия размер.',
      '<strong>Изтеглете</strong> — запазете преоразмереното изображение на вашето устройство.'
    ],
    h2b: 'Най-добрият безплатен инструмент за компресиране на изображение до точни KB',
    body: '<p>Нуждаете се от изображение под 100 KB за подаване на формуляр? Или точно 200 KB за снимка за виза? Инструментът „Промяна на размера в KB" на RelahConvert използва интелигентна компресия с двоично търсене, за да достигне целевия размер на файла възможно най-точно — изцяло във вашия браузър. Без качване, без сървър, напълно безплатно.</p><p>Работи перфектно за изисквания за размер на паспортни снимки, лимити за качване на държавни формуляри, ограничения за прикачени файлове в имейли и всяка ситуация, в която имате нужда от изображение под определен лимит в килобайти.</p>',
    h3why: 'Защо да променяте размера на изображенията в KB?',
    why: 'Много уебсайтове, държавни портали и приложения изискват изображения под определен размер на файла. Ръчното коригиране на качеството, докато достигнете целта, е досадно. Този инструмент автоматизира процеса — просто въведете целевите KB и изтеглете.',
    faqs: [
      { q: 'Какво е промяна на размер в KB?', a: 'Промяната на размера на изображение в KB означава компресиране на файла на изображението до определен размер, измерен в килобайти. Например намаляване на снимка от 2 MB до точно 200 KB, като се запазва приемливо визуално качество.' },
      { q: 'Как да намаля до 200KB?', a: 'Качете изображението си, напишете 200 в полето за целеви KB и натиснете Промени. Инструментът автоматично ще намери подходящото ниво на компресия, за да доближи изображението ви възможно най-близо до 200 KB.' },
      { q: 'Работи ли за паспортни снимки?', a: 'Да — много държави изискват паспортни и визови снимки под определен размер на файла (напр. 100 KB, 200 KB, 300 KB). Качете снимката си, въведете необходимия размер и изтеглете.' },
      { q: 'Има ли минимален размер?', a: 'Минимумът зависи от размерите и съдържанието на изображението. Много детайлни или големи изображения може да не се компресират под определен праг без първо да се намалят размерите. За най-добри резултати първо преоразмерете размерите на изображението, след това използвайте този инструмент, за да достигнете целевите KB.' },
      { q: 'Какви формати се поддържат?', a: 'Можете да качвате JPG, PNG и WebP изображения. Изходът е винаги JPEG за оптимален контрол на компресията.' },
    ],
    links: [{ href: '/compress', label: 'Компресиране' },{ href: '/resize', label: 'Преоразмеряване' },{ href: '/crop', label: 'Изрязване' },{ href: '/passport-photo', label: 'Паспортна снимка' }],
  },
  ca: {
    h2a: 'Com redimensionar una imatge a una mida específica en KB',
    steps: [
      '<strong>Pugeu la vostra imatge</strong> — feu clic a „Selecciona imatge" o arrossegueu i deixeu anar un fitxer JPG, PNG o WebP.',
      '<strong>Introduïu la mida objectiu</strong> — escriviu la mida de fitxer que voleu en kilobytes (p. ex. 100 KB, 200 KB).',
      '<strong>Feu clic a Redimensionar</strong> — l\'eina comprimeix automàticament per assolir la mida objectiu.',
      '<strong>Descarregueu</strong> — deseu la imatge redimensionada al vostre dispositiu.'
    ],
    h2b: 'Millor eina gratuïta per comprimir una imatge a una mida exacta en KB',
    body: '<p>Necessiteu una imatge de menys de 100 KB per enviar un formulari? O exactament 200 KB per a una foto de visat? L\'eina „Redimensionar en KB" de RelahConvert utilitza compressió intel·ligent amb cerca binària per assolir la mida de fitxer objectiu tan precisament com sigui possible — tot dins del vostre navegador. Sense pujada, sense servidor, completament gratuït.</p><p>Funciona perfectament per a requisits de mida de fotos de passaport, límits de pujada de formularis governamentals, restriccions de fitxers adjunts de correu electrònic i qualsevol situació on necessiteu una imatge per sota d\'un límit específic en kilobytes.</p>',
    h3why: 'Per què redimensionar imatges a una mida específica en KB?',
    why: 'Molts llocs web, portals governamentals i aplicacions requereixen imatges per sota d\'una mida de fitxer específica. Ajustar manualment la qualitat fins a assolir l\'objectiu és tediós. Aquesta eina automatitza el procés — simplement introduïu els KB objectiu i descarregueu.',
    faqs: [
      { q: 'Què és redimensionar imatge en KB?', a: 'Redimensionar una imatge en KB significa comprimir el fitxer de la imatge a una mida de fitxer específica mesurada en kilobytes. Per exemple, reduir una foto de 2 MB a exactament 200 KB mantenint una qualitat visual acceptable.' },
      { q: 'Com redueixo una imatge a 200KB?', a: 'Pugeu la vostra imatge, escriviu 200 al camp de KB objectiu i feu clic a Redimensionar. L\'eina trobarà automàticament el nivell de compressió adequat per apropar la imatge el màxim possible a 200 KB.' },
      { q: 'Funciona per a fotos de passaport i visat?', a: 'Sí — molts països requereixen fotos de passaport i visat per sota d\'una mida de fitxer específica (p. ex. 100 KB, 200 KB, 300 KB). Pugeu la vostra foto, introduïu la mida requerida i descarregueu.' },
      { q: 'Hi ha una mida mínima?', a: 'El mínim depèn de les dimensions i el contingut de la imatge. Imatges molt detallades o grans poden no comprimir-se per sota d\'un cert llindar sense reduir primer les dimensions. Per als millors resultats, redimensioneu primer les dimensions de la imatge i després utilitzeu aquesta eina per assolir els KB objectiu.' },
      { q: 'Quins formats se suporten?', a: 'Podeu pujar imatges JPG, PNG i WebP. La sortida és sempre JPEG per a un control de compressió òptim.' },
    ],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Retallar' },{ href: '/passport-photo', label: 'Foto passaport' }],
  },
  nl: {
    h2a: 'Hoe een afbeelding naar een specifieke KB-grootte verkleinen',
    steps: [
      '<strong>Upload je afbeelding</strong> — klik op „Selecteer afbeelding" of sleep een JPG-, PNG- of WebP-bestand.',
      '<strong>Voer de doelgrootte in</strong> — typ de gewenste bestandsgrootte in kilobytes (bijv. 100 KB, 200 KB).',
      '<strong>Klik op Verkleinen</strong> — de tool comprimeert automatisch om de doelgrootte te bereiken.',
      '<strong>Download</strong> — sla de verkleinde afbeelding op je apparaat op.'
    ],
    h2b: 'Beste gratis tool om een afbeelding naar exacte KB te comprimeren',
    body: '<p>Heb je een afbeelding onder de 100 KB nodig voor het indienen van een formulier? Of precies 200 KB voor een visumfoto? De tool „Verkleinen in KB" van RelahConvert gebruikt slimme binaire-zoekcompressie om je doelbestandsgrootte zo nauwkeurig mogelijk te bereiken — volledig in je browser. Geen upload, geen server, volledig gratis.</p><p>Werkt perfect voor vereisten voor paspoortfoto-grootte, uploadlimieten van overheidsformulieren, beperkingen voor e-mailbijlagen en elke situatie waarin je een afbeelding onder een specifieke kilobyte-limiet nodig hebt.</p>',
    h3why: 'Waarom afbeeldingen naar een specifieke KB verkleinen?',
    why: 'Veel websites, overheidsportalen en applicaties vereisen afbeeldingen onder een specifieke bestandsgrootte. Handmatig de kwaliteit aanpassen totdat je het doel bereikt, is vervelend. Deze tool automatiseert het proces — voer gewoon je doel-KB in en download.',
    faqs: [
      { q: 'Wat is verkleinen van afbeelding in KB?', a: 'Het verkleinen van een afbeelding in KB betekent het comprimeren van het afbeeldingsbestand naar een specifieke bestandsgrootte gemeten in kilobytes. Bijvoorbeeld het verkleinen van een foto van 2 MB naar precies 200 KB met behoud van acceptabele visuele kwaliteit.' },
      { q: 'Hoe verklein ik een afbeelding naar 200KB?', a: 'Upload je afbeelding, typ 200 in het doel-KB-veld en klik op Verkleinen. De tool vindt automatisch het juiste compressieniveau om je afbeelding zo dicht mogelijk bij 200 KB te krijgen.' },
      { q: 'Werkt het voor paspoort- en visumfoto\'s?', a: 'Ja — veel landen vereisen paspoort- en visumfoto\'s onder een specifieke bestandsgrootte (bijv. 100 KB, 200 KB, 300 KB). Upload je foto, voer de vereiste grootte in en download.' },
      { q: 'Is er een minimumgrootte?', a: 'Het minimum hangt af van de afmetingen en inhoud van de afbeelding. Zeer gedetailleerde of grote afbeeldingen kunnen mogelijk niet onder een bepaalde drempel worden gecomprimeerd zonder eerst de afmetingen te verkleinen. Voor de beste resultaten verklein je eerst de afbeeldingsafmetingen en gebruik je daarna deze tool om de KB-doelgrootte te bereiken.' },
      { q: 'Welke formaten worden ondersteund?', a: 'Je kunt JPG-, PNG- en WebP-afbeeldingen uploaden. De uitvoer is altijd JPEG voor optimale compressiecontrole.' },
    ],
    links: [{ href: '/compress', label: 'Comprimeren' },{ href: '/resize', label: 'Formaat wijzigen' },{ href: '/crop', label: 'Bijsnijden' },{ href: '/passport-photo', label: 'Pasfoto' }],
  },
  el: {
    h2a: 'Πώς να αλλάξετε το μέγεθος εικόνας σε συγκεκριμένα KB',
    steps: [
      '<strong>Μεταφορτώστε την εικόνα σας</strong> — κάντε κλικ στο „Επιλογή εικόνας" ή σύρετε και αποθέστε ένα αρχείο JPG, PNG ή WebP.',
      '<strong>Εισάγετε το μέγεθος-στόχο</strong> — πληκτρολογήστε το μέγεθος αρχείου που θέλετε σε kilobyte (π.χ. 100 KB, 200 KB).',
      '<strong>Κλικ Αλλαγή μεγέθους</strong> — το εργαλείο συμπιέζει αυτόματα για να φτάσει το μέγεθος-στόχο.',
      '<strong>Λήψη</strong> — αποθηκεύστε την εικόνα με αλλαγμένο μέγεθος στη συσκευή σας.'
    ],
    h2b: 'Καλύτερο δωρεάν εργαλείο συμπίεσης εικόνας σε ακριβή KB',
    body: '<p>Χρειάζεστε εικόνα κάτω από 100 KB για υποβολή φόρμας; Ή ακριβώς 200 KB για φωτογραφία βίζας; Το εργαλείο „Αλλαγή μεγέθους σε KB" του RelahConvert χρησιμοποιεί έξυπνη συμπίεση δυαδικής αναζήτησης για να φτάσει το μέγεθος-στόχο του αρχείου όσο πιο κοντά γίνεται — όλα μέσα στο πρόγραμμα περιήγησής σας. Χωρίς μεταφόρτωση, χωρίς διακομιστή, εντελώς δωρεάν.</p><p>Λειτουργεί τέλεια για απαιτήσεις μεγέθους φωτογραφιών διαβατηρίου, όρια μεταφόρτωσης κρατικών φορμών, περιορισμούς συνημμένων email και οποιαδήποτε κατάσταση όπου χρειάζεστε εικόνα κάτω από συγκεκριμένο όριο kilobyte.</p>',
    h3why: 'Γιατί αλλαγή μεγέθους εικόνων σε συγκεκριμένα KB;',
    why: 'Πολλοί ιστότοποι, κρατικές πύλες και εφαρμογές απαιτούν εικόνες κάτω από συγκεκριμένο μέγεθος αρχείου. Η χειροκίνητη ρύθμιση της ποιότητας μέχρι να πετύχετε τον στόχο είναι κουραστική. Αυτό το εργαλείο αυτοματοποιεί τη διαδικασία — απλά εισάγετε τα KB-στόχο και κατεβάστε.',
    faqs: [
      { q: 'Τι είναι η αλλαγή μεγέθους εικόνας σε KB;', a: 'Η αλλαγή μεγέθους εικόνας σε KB σημαίνει συμπίεση του αρχείου εικόνας σε συγκεκριμένο μέγεθος αρχείου μετρημένο σε kilobyte. Για παράδειγμα, μείωση μιας φωτογραφίας 2 MB σε ακριβώς 200 KB διατηρώντας αποδεκτή οπτική ποιότητα.' },
      { q: 'Πώς μειώνω μια εικόνα σε 200KB;', a: 'Μεταφορτώστε την εικόνα σας, πληκτρολογήστε 200 στο πεδίο KB-στόχου και κάντε κλικ στο Αλλαγή μεγέθους. Το εργαλείο θα βρει αυτόματα το σωστό επίπεδο συμπίεσης για να φέρει την εικόνα σας όσο πιο κοντά γίνεται στα 200 KB.' },
      { q: 'Λειτουργεί για φωτογραφίες διαβατηρίου και βίζας;', a: 'Ναι — πολλές χώρες απαιτούν φωτογραφίες διαβατηρίου και βίζας κάτω από συγκεκριμένο μέγεθος αρχείου (π.χ. 100 KB, 200 KB, 300 KB). Μεταφορτώστε τη φωτογραφία σας, εισάγετε το απαιτούμενο μέγεθος και κατεβάστε.' },
      { q: 'Υπάρχει ελάχιστο μέγεθος;', a: 'Το ελάχιστο εξαρτάται από τις διαστάσεις και το περιεχόμενο της εικόνας. Πολύ λεπτομερείς ή μεγάλες εικόνες μπορεί να μην συμπιεστούν κάτω από ένα ορισμένο κατώφλι χωρίς πρώτα να μειωθούν οι διαστάσεις. Για καλύτερα αποτελέσματα, αλλάξτε πρώτα τις διαστάσεις της εικόνας και μετά χρησιμοποιήστε αυτό το εργαλείο για να φτάσετε τα KB-στόχο.' },
      { q: 'Ποιες μορφές υποστηρίζονται;', a: 'Μπορείτε να μεταφορτώσετε εικόνες JPG, PNG και WebP. Η έξοδος είναι πάντα JPEG για βέλτιστο έλεγχο συμπίεσης.' },
    ],
    links: [{ href: '/compress', label: 'Συμπίεση' },{ href: '/resize', label: 'Αλλαγή μεγέθους' },{ href: '/crop', label: 'Περικοπή' },{ href: '/passport-photo', label: 'Φωτογραφία διαβατηρίου' }],
  },
  hi: {
    h2a: 'किसी इमेज को विशिष्ट KB आकार में कैसे बदलें',
    steps: [
      '<strong>अपनी छवि अपलोड करें</strong> — "छवि चुनें" पर क्लिक करें या JPG, PNG, या WebP फ़ाइल खींचकर छोड़ें।',
      '<strong>लक्ष्य आकार दर्ज करें</strong> — किलोबाइट में वांछित फ़ाइल आकार टाइप करें (जैसे 100 KB, 200 KB)।',
      '<strong>बदलें पर क्लिक करें</strong> — टूल आपके लक्ष्य आकार तक पहुँचने के लिए स्वचालित रूप से संपीड़ित करता है।',
      '<strong>डाउनलोड करें</strong> — आकार बदली हुई छवि को अपने डिवाइस पर सहेजें।'
    ],
    h2b: 'सटीक KB आकार में इमेज संपीड़ित करने का सबसे अच्छा मुफ्त टूल',
    body: '<p>फॉर्म जमा करने के लिए 100 KB से कम की छवि चाहिए? या वीज़ा फोटो के लिए ठीक 200 KB? RelahConvert का KB में आकार बदलें टूल स्मार्ट बाइनरी-सर्च संपीड़न का उपयोग करता है ताकि आपके लक्ष्य फ़ाइल आकार को यथासंभव सटीक रूप से प्राप्त किया जा सके — सब कुछ आपके ब्राउज़र में। कोई अपलोड नहीं, कोई सर्वर नहीं, पूरी तरह मुफ्त।</p><p>पासपोर्ट फोटो आकार आवश्यकताओं, सरकारी फॉर्म अपलोड सीमाओं, ईमेल अटैचमेंट प्रतिबंधों और किसी भी स्थिति के लिए बिल्कुल सही काम करता है जहाँ आपको किसी विशिष्ट किलोबाइट सीमा से कम छवि की आवश्यकता है।</p>',
    h3why: 'KB में इमेज का आकार क्यों बदलें?',
    why: 'कई वेबसाइटों, सरकारी पोर्टलों और एप्लिकेशन को एक विशिष्ट फ़ाइल आकार से कम छवियों की आवश्यकता होती है। लक्ष्य तक पहुँचने तक मैन्युअल रूप से गुणवत्ता समायोजित करना थकाऊ है। यह टूल प्रक्रिया को स्वचालित करता है — बस अपना लक्ष्य KB दर्ज करें और डाउनलोड करें।',
    faqs: [
      { q: 'KB में इमेज आकार बदलना क्या है?', a: 'KB में इमेज का आकार बदलने का अर्थ है छवि फ़ाइल को किलोबाइट में मापी गई एक विशिष्ट फ़ाइल आकार तक संपीड़ित करना। उदाहरण के लिए, स्वीकार्य दृश्य गुणवत्ता बनाए रखते हुए 2 MB की फ़ोटो को ठीक 200 KB तक कम करना।' },
      { q: '200KB तक कैसे कम करें?', a: 'अपनी छवि अपलोड करें, लक्ष्य KB फ़ील्ड में 200 टाइप करें और बदलें पर क्लिक करें। टूल स्वचालित रूप से सही संपीड़न स्तर खोजेगा ताकि आपकी छवि 200 KB के यथासंभव करीब पहुँच सके।' },
      { q: 'क्या यह पासपोर्ट फोटो के लिए काम करता है?', a: 'हाँ — कई देशों को पासपोर्ट और वीज़ा फोटो एक विशिष्ट फ़ाइल आकार से कम चाहिए (जैसे 100 KB, 200 KB, 300 KB)। अपनी फोटो अपलोड करें, आवश्यक आकार दर्ज करें और डाउनलोड करें।' },
      { q: 'क्या न्यूनतम आकार है?', a: 'न्यूनतम छवि के आयामों और सामग्री पर निर्भर करता है। बहुत विस्तृत या बड़ी छवियाँ पहले आयाम कम किए बिना एक निश्चित सीमा से नीचे संपीड़ित नहीं हो सकती हैं। सर्वोत्तम परिणामों के लिए, पहले छवि के आयाम बदलें, फिर KB लक्ष्य तक पहुँचने के लिए इस टूल का उपयोग करें।' },
      { q: 'कौन से प्रारूप समर्थित हैं?', a: 'आप JPG, PNG और WebP छवियाँ अपलोड कर सकते हैं। इष्टतम संपीड़न नियंत्रण के लिए आउटपुट हमेशा JPEG होता है।' },
    ],
    links: [{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/resize', label: 'आकार बदलें' },{ href: '/crop', label: 'क्रॉप' },{ href: '/passport-photo', label: 'पासपोर्ट फोटो' }],
  },
  id: {
    h2a: 'Cara mengubah ukuran gambar ke KB tertentu',
    steps: [
      '<strong>Unggah gambar Anda</strong> — klik "Pilih Gambar" atau seret dan lepas file JPG, PNG, atau WebP.',
      '<strong>Masukkan ukuran target</strong> — ketik ukuran file yang Anda inginkan dalam kilobyte (mis. 100 KB, 200 KB).',
      '<strong>Klik Ubah Ukuran</strong> — alat ini secara otomatis mengompres untuk mencapai ukuran target Anda.',
      '<strong>Unduh</strong> — simpan gambar yang telah diubah ukurannya ke perangkat Anda.'
    ],
    h2b: 'Alat gratis terbaik untuk mengompres gambar ke ukuran KB yang tepat',
    body: '<p>Butuh gambar di bawah 100 KB untuk pengiriman formulir? Atau tepat 200 KB untuk foto visa? Alat Ubah Ukuran dalam KB dari RelahConvert menggunakan kompresi pencarian biner yang cerdas untuk mencapai ukuran file target Anda sedekat mungkin — semuanya di dalam browser Anda. Tanpa unggah, tanpa server, sepenuhnya gratis.</p><p>Berfungsi sempurna untuk persyaratan ukuran foto paspor, batas unggah formulir pemerintah, pembatasan lampiran email, dan situasi apa pun di mana Anda membutuhkan gambar di bawah batas kilobyte tertentu.</p>',
    h3why: 'Mengapa mengubah ukuran gambar ke KB tertentu?',
    why: 'Banyak situs web, portal pemerintah, dan aplikasi membutuhkan gambar di bawah ukuran file tertentu. Menyesuaikan kualitas secara manual hingga mencapai target sangat merepotkan. Alat ini mengotomatiskan prosesnya — cukup masukkan KB target Anda dan unduh.',
    faqs: [
      { q: 'Apa itu ubah ukuran gambar dalam KB?', a: 'Mengubah ukuran gambar dalam KB berarti mengompres file gambar ke ukuran file tertentu yang diukur dalam kilobyte. Misalnya, mengurangi foto 2 MB menjadi tepat 200 KB sambil mempertahankan kualitas visual yang dapat diterima.' },
      { q: 'Bagaimana cara mengurangi gambar ke 200KB?', a: 'Unggah gambar Anda, ketik 200 di kolom KB target, dan klik Ubah Ukuran. Alat ini akan secara otomatis menemukan tingkat kompresi yang tepat untuk mendapatkan gambar Anda sedekat mungkin dengan 200 KB.' },
      { q: 'Apakah ini berfungsi untuk foto paspor dan visa?', a: 'Ya — banyak negara memerlukan foto paspor dan visa di bawah ukuran file tertentu (mis. 100 KB, 200 KB, 300 KB). Unggah foto Anda, masukkan ukuran yang diperlukan, dan unduh.' },
      { q: 'Apakah ada ukuran minimum?', a: 'Minimum tergantung pada dimensi dan konten gambar. Gambar yang sangat detail atau besar mungkin tidak dapat dikompres di bawah ambang batas tertentu tanpa mengurangi dimensi terlebih dahulu. Untuk hasil terbaik, ubah ukuran dimensi gambar terlebih dahulu, lalu gunakan alat ini untuk mencapai target KB.' },
      { q: 'Format apa yang didukung?', a: 'Anda dapat mengunggah gambar JPG, PNG, dan WebP. Output selalu JPEG untuk kontrol kompresi yang optimal.' },
    ],
    links: [{ href: '/compress', label: 'Kompres' },{ href: '/resize', label: 'Ubah Ukuran' },{ href: '/crop', label: 'Potong' },{ href: '/passport-photo', label: 'Foto Paspor' }],
  },
  ms: {
    h2a: 'Cara mengubah saiz imej ke KB tertentu',
    steps: [
      '<strong>Muat naik imej anda</strong> — klik "Pilih Imej" atau seret dan lepas fail JPG, PNG atau WebP.',
      '<strong>Masukkan saiz sasaran</strong> — taip saiz fail yang anda mahu dalam kilobait (cth. 100 KB, 200 KB).',
      '<strong>Klik Ubah Saiz</strong> — alat ini memampatkan secara automatik untuk mencapai saiz sasaran anda.',
      '<strong>Muat turun</strong> — simpan imej yang telah diubah saiz ke peranti anda.'
    ],
    h2b: 'Alat percuma terbaik untuk memampatkan imej ke saiz KB yang tepat',
    body: '<p>Perlukan imej di bawah 100 KB untuk penghantaran borang? Atau tepat 200 KB untuk foto visa? Alat Ubah Saiz dalam KB daripada RelahConvert menggunakan pemampatan carian binari pintar untuk mencapai saiz fail sasaran anda setepat mungkin — semuanya dalam pelayar anda. Tanpa muat naik, tanpa pelayan, percuma sepenuhnya.</p><p>Berfungsi sempurna untuk keperluan saiz foto pasport, had muat naik borang kerajaan, sekatan lampiran e-mel dan sebarang situasi di mana anda memerlukan imej di bawah had kilobait tertentu.</p>',
    h3why: 'Mengapa ubah saiz imej ke KB tertentu?',
    why: 'Banyak laman web, portal kerajaan dan aplikasi memerlukan imej di bawah saiz fail tertentu. Melaraskan kualiti secara manual sehingga mencapai sasaran adalah membosankan. Alat ini mengautomasikan proses — hanya masukkan KB sasaran anda dan muat turun.',
    faqs: [
      { q: 'Apa itu ubah saiz imej dalam KB?', a: 'Mengubah saiz imej dalam KB bermaksud memampatkan fail imej ke saiz fail tertentu yang diukur dalam kilobait. Contohnya, mengurangkan foto 2 MB kepada tepat 200 KB sambil mengekalkan kualiti visual yang boleh diterima.' },
      { q: 'Bagaimana mengurangkan imej ke 200KB?', a: 'Muat naik imej anda, taip 200 dalam medan KB sasaran dan klik Ubah Saiz. Alat ini akan secara automatik mencari tahap pemampatan yang sesuai untuk mendapatkan imej anda sehampir mungkin dengan 200 KB.' },
      { q: 'Adakah ia berfungsi untuk foto pasport dan visa?', a: 'Ya — banyak negara memerlukan foto pasport dan visa di bawah saiz fail tertentu (cth. 100 KB, 200 KB, 300 KB). Muat naik foto anda, masukkan saiz yang diperlukan dan muat turun.' },
      { q: 'Adakah saiz minimum?', a: 'Minimum bergantung pada dimensi dan kandungan imej. Imej yang sangat terperinci atau besar mungkin tidak dapat dimampatkan di bawah ambang tertentu tanpa mengurangkan dimensi terlebih dahulu. Untuk hasil terbaik, ubah saiz dimensi imej dahulu, kemudian gunakan alat ini untuk mencapai sasaran KB.' },
      { q: 'Format apa yang disokong?', a: 'Anda boleh memuat naik imej JPG, PNG dan WebP. Output sentiasa JPEG untuk kawalan pemampatan yang optimum.' },
    ],
    links: [{ href: '/compress', label: 'Mampat' },{ href: '/resize', label: 'Ubah Saiz' },{ href: '/crop', label: 'Potong' },{ href: '/passport-photo', label: 'Foto Pasport' }],
  },
  pl: {
    h2a: 'Jak zmienić rozmiar obrazu do określonej ilości KB',
    steps: [
      '<strong>Prześlij swój obraz</strong> — kliknij „Wybierz obraz" lub przeciągnij i upuść plik JPG, PNG lub WebP.',
      '<strong>Wprowadź rozmiar docelowy</strong> — wpisz żądany rozmiar pliku w kilobajtach (np. 100 KB, 200 KB).',
      '<strong>Kliknij Zmień rozmiar</strong> — narzędzie automatycznie kompresuje, aby osiągnąć docelowy rozmiar.',
      '<strong>Pobierz</strong> — zapisz zmieniony obraz na swoim urządzeniu.'
    ],
    h2b: 'Najlepsze darmowe narzędzie do kompresji obrazu do dokładnych KB',
    body: '<p>Potrzebujesz obrazu poniżej 100 KB do przesłania formularza? Albo dokładnie 200 KB na zdjęcie wizowe? Narzędzie „Zmień rozmiar w KB" od RelahConvert używa inteligentnej kompresji z wyszukiwaniem binarnym, aby osiągnąć docelowy rozmiar pliku tak dokładnie, jak to możliwe — wszystko w Twojej przeglądarce. Bez przesyłania, bez serwera, całkowicie za darmo.</p><p>Działa doskonale dla wymagań dotyczących rozmiaru zdjęć paszportowych, limitów przesyłania formularzy rządowych, ograniczeń załączników e-mail i każdej sytuacji, w której potrzebujesz obrazu poniżej określonego limitu w kilobajtach.</p>',
    h3why: 'Dlaczego zmieniać rozmiar obrazów do określonych KB?',
    why: 'Wiele stron internetowych, portali rządowych i aplikacji wymaga obrazów poniżej określonego rozmiaru pliku. Ręczne dostosowywanie jakości, aż osiągniesz cel, jest żmudne. To narzędzie automatyzuje ten proces — po prostu wprowadź docelowe KB i pobierz.',
    faqs: [
      { q: 'Co to jest zmiana rozmiaru obrazu w KB?', a: 'Zmiana rozmiaru obrazu w KB oznacza kompresję pliku obrazu do określonego rozmiaru pliku mierzonego w kilobajtach. Na przykład zmniejszenie zdjęcia o wielkości 2 MB do dokładnie 200 KB przy zachowaniu akceptowalnej jakości wizualnej.' },
      { q: 'Jak zmniejszyć obraz do 200KB?', a: 'Prześlij swój obraz, wpisz 200 w polu docelowych KB i kliknij Zmień rozmiar. Narzędzie automatycznie znajdzie odpowiedni poziom kompresji, aby zbliżyć obraz jak najbardziej do 200 KB.' },
      { q: 'Czy działa dla zdjęć paszportowych i wizowych?', a: 'Tak — wiele krajów wymaga zdjęć paszportowych i wizowych poniżej określonego rozmiaru pliku (np. 100 KB, 200 KB, 300 KB). Prześlij swoje zdjęcie, wprowadź wymagany rozmiar i pobierz.' },
      { q: 'Czy jest minimalny rozmiar?', a: 'Minimum zależy od wymiarów i zawartości obrazu. Bardzo szczegółowe lub duże obrazy mogą nie skompresować się poniżej pewnego progu bez uprzedniego zmniejszenia wymiarów. Dla najlepszych wyników najpierw zmień wymiary obrazu, a następnie użyj tego narzędzia, aby osiągnąć docelowe KB.' },
      { q: 'Jakie formaty są obsługiwane?', a: 'Możesz przesyłać obrazy JPG, PNG i WebP. Wyjście jest zawsze w formacie JPEG dla optymalnej kontroli kompresji.' },
    ],
    links: [{ href: '/compress', label: 'Kompresuj' },{ href: '/resize', label: 'Zmień rozmiar' },{ href: '/crop', label: 'Przytnij' },{ href: '/passport-photo', label: 'Zdjęcie paszportowe' }],
  },
  sv: {
    h2a: 'Hur man ändrar storlek på en bild till specifika KB',
    steps: [
      '<strong>Ladda upp din bild</strong> — klicka på „Välj bild" eller dra och släpp en JPG-, PNG- eller WebP-fil.',
      '<strong>Ange målstorlek</strong> — skriv den filstorlek du vill ha i kilobyte (t.ex. 100 KB, 200 KB).',
      '<strong>Klicka på Ändra storlek</strong> — verktyget komprimerar automatiskt för att nå din målstorlek.',
      '<strong>Ladda ner</strong> — spara den storleksändrade bilden på din enhet.'
    ],
    h2b: 'Bästa gratisverktyg för att komprimera en bild till exakta KB',
    body: '<p>Behöver du en bild under 100 KB för en formulärinlämning? Eller exakt 200 KB för ett visumfoto? RelahConverts verktyg „Ändra storlek i KB" använder smart binärsökningskomprimering för att nå din målfilstorlek så nära som möjligt — helt i din webbläsare. Ingen uppladdning, ingen server, helt gratis.</p><p>Fungerar perfekt för krav på passfotostorlek, uppladdningsgränser för myndighetsformulär, begränsningar för e-postbilagor och alla situationer där du behöver en bild under en specifik kilobyte-gräns.</p>',
    h3why: 'Varför ändra storlek på bilder till specifika KB?',
    why: 'Många webbplatser, myndighetsportaler och applikationer kräver bilder under en specifik filstorlek. Att manuellt justera kvaliteten tills du når målet är tråkigt. Det här verktyget automatiserar processen — ange bara dina mål-KB och ladda ner.',
    faqs: [
      { q: 'Vad är storleksändring av bild i KB?', a: 'Att ändra storlek på en bild i KB innebär att komprimera bildfilen till en specifik filstorlek mätt i kilobyte. Till exempel att minska ett foto på 2 MB till exakt 200 KB med bibehållen acceptabel visuell kvalitet.' },
      { q: 'Hur minskar jag en bild till 200KB?', a: 'Ladda upp din bild, skriv 200 i fältet för mål-KB och klicka på Ändra storlek. Verktyget hittar automatiskt rätt komprimeringsnivå för att få din bild så nära 200 KB som möjligt.' },
      { q: 'Fungerar det för passfoton och visumfoton?', a: 'Ja — många länder kräver pass- och visumfoton under en specifik filstorlek (t.ex. 100 KB, 200 KB, 300 KB). Ladda upp ditt foto, ange den krävda storleken och ladda ner.' },
      { q: 'Finns det en minimistorlek?', a: 'Minimum beror på bildens dimensioner och innehåll. Mycket detaljerade eller stora bilder kanske inte kan komprimeras under en viss tröskel utan att först minska dimensionerna. För bästa resultat, ändra först bildens dimensioner och använd sedan detta verktyg för att nå mål-KB.' },
      { q: 'Vilka format stöds?', a: 'Du kan ladda upp JPG-, PNG- och WebP-bilder. Utdata är alltid JPEG för optimal komprimeringskontroll.' },
    ],
    links: [{ href: '/compress', label: 'Komprimera' },{ href: '/resize', label: 'Ändra storlek' },{ href: '/crop', label: 'Beskär' },{ href: '/passport-photo', label: 'Passfoto' }],
  },
  th: {
    h2a: 'วิธีปรับขนาดรูปภาพเป็น KB เฉพาะ',
    steps: [
      '<strong>อัปโหลดรูปภาพของคุณ</strong> — คลิก "เลือกรูปภาพ" หรือลากและวางไฟล์ JPG, PNG หรือ WebP',
      '<strong>ป้อนขนาดเป้าหมาย</strong> — พิมพ์ขนาดไฟล์ที่คุณต้องการเป็นกิโลไบต์ (เช่น 100 KB, 200 KB)',
      '<strong>คลิกปรับขนาด</strong> — เครื่องมือบีบอัดอัตโนมัติเพื่อให้ได้ขนาดเป้าหมายของคุณ',
      '<strong>ดาวน์โหลด</strong> — บันทึกรูปภาพที่ปรับขนาดแล้วลงอุปกรณ์ของคุณ'
    ],
    h2b: 'เครื่องมือฟรีที่ดีที่สุดสำหรับบีบอัดรูปภาพเป็น KB ที่แน่นอน',
    body: '<p>ต้องการรูปภาพต่ำกว่า 100 KB สำหรับการส่งแบบฟอร์ม? หรือพอดี 200 KB สำหรับรูปถ่ายวีซ่า? เครื่องมือ "ปรับขนาดเป็น KB" ของ RelahConvert ใช้การบีบอัดค้นหาแบบไบนารีอัจฉริยะเพื่อให้ได้ขนาดไฟล์เป้าหมายของคุณใกล้เคียงที่สุด — ทั้งหมดในเบราว์เซอร์ของคุณ ไม่ต้องอัปโหลด ไม่มีเซิร์ฟเวอร์ ฟรีทั้งหมด</p><p>ทำงานได้อย่างสมบูรณ์แบบสำหรับข้อกำหนดขนาดรูปถ่ายพาสปอร์ต ขีดจำกัดการอัปโหลดแบบฟอร์มราชการ ข้อจำกัดไฟล์แนบอีเมล และทุกสถานการณ์ที่คุณต้องการรูปภาพต่ำกว่าขีดจำกัดกิโลไบต์เฉพาะ</p>',
    h3why: 'ทำไมต้องปรับขนาดรูปภาพเป็น KB เฉพาะ?',
    why: 'หลายเว็บไซต์ พอร์ทัลราชการ และแอปพลิเคชันต้องการรูปภาพที่มีขนาดไฟล์ต่ำกว่าที่กำหนด การปรับคุณภาพด้วยตนเองจนกว่าจะถึงเป้าหมายนั้นน่าเบื่อ เครื่องมือนี้ทำให้กระบวนการเป็นอัตโนมัติ — เพียงป้อน KB เป้าหมายของคุณแล้วดาวน์โหลด',
    faqs: [
      { q: 'การปรับขนาดรูปภาพเป็น KB คืออะไร?', a: 'การปรับขนาดรูปภาพเป็น KB หมายถึงการบีบอัดไฟล์รูปภาพให้ได้ขนาดไฟล์เฉพาะที่วัดเป็นกิโลไบต์ ตัวอย่างเช่น ลดขนาดรูปถ่าย 2 MB เป็นพอดี 200 KB โดยรักษาคุณภาพภาพที่ยอมรับได้' },
      { q: 'ลดรูปภาพเหลือ 200KB ได้อย่างไร?', a: 'อัปโหลดรูปภาพของคุณ พิมพ์ 200 ในช่อง KB เป้าหมาย แล้วคลิกปรับขนาด เครื่องมือจะค้นหาระดับการบีบอัดที่เหมาะสมโดยอัตโนมัติเพื่อให้รูปภาพของคุณใกล้เคียง 200 KB มากที่สุด' },
      { q: 'ใช้กับรูปถ่ายพาสปอร์ตและวีซ่าได้ไหม?', a: 'ได้ — หลายประเทศต้องการรูปถ่ายพาสปอร์ตและวีซ่าที่มีขนาดไฟล์ต่ำกว่าที่กำหนด (เช่น 100 KB, 200 KB, 300 KB) อัปโหลดรูปถ่ายของคุณ ป้อนขนาดที่ต้องการ แล้วดาวน์โหลด' },
      { q: 'มีขนาดขั้นต่ำไหม?', a: 'ขั้นต่ำขึ้นอยู่กับขนาดและเนื้อหาของรูปภาพ รูปภาพที่มีรายละเอียดมากหรือขนาดใหญ่อาจไม่สามารถบีบอัดต่ำกว่าเกณฑ์ที่กำหนดได้โดยไม่ลดขนาดก่อน เพื่อผลลัพธ์ที่ดีที่สุด ให้ปรับขนาดมิติของรูปภาพก่อน จากนั้นใช้เครื่องมือนี้เพื่อให้ได้ KB เป้าหมาย' },
      { q: 'รองรับรูปแบบอะไรบ้าง?', a: 'คุณสามารถอัปโหลดรูปภาพ JPG, PNG และ WebP ได้ ผลลัพธ์เป็น JPEG เสมอเพื่อการควบคุมการบีบอัดที่เหมาะสมที่สุด' },
    ],
    links: [{ href: '/compress', label: 'บีบอัด' },{ href: '/resize', label: 'ปรับขนาด' },{ href: '/crop', label: 'ครอบตัด' },{ href: '/passport-photo', label: 'รูปถ่ายพาสปอร์ต' }],
  },
  tr: {
    h2a: 'Görseli belirli KB boyutuna nasıl değiştirirsiniz',
    steps: [
      '<strong>Görselinizi yükleyin</strong> — "Görsel Seç"e tıklayın veya bir JPG, PNG ya da WebP dosyasını sürükleyip bırakın.',
      '<strong>Hedef boyutu girin</strong> — istediğiniz dosya boyutunu kilobayt cinsinden yazın (ör. 100 KB, 200 KB).',
      '<strong>Boyutlandır\'a tıklayın</strong> — araç hedef boyutunuza ulaşmak için otomatik olarak sıkıştırır.',
      '<strong>İndirin</strong> — boyutlandırılmış görseli cihazınıza kaydedin.'
    ],
    h2b: 'Görseli tam KB boyutuna sıkıştırmak için en iyi ücretsiz araç',
    body: '<p>Form göndermek için 100 KB altında bir görsele mi ihtiyacınız var? Ya da vize fotoğrafı için tam 200 KB mi? RelahConvert\'un KB Olarak Boyutlandır aracı, hedef dosya boyutunuza mümkün olduğunca yakın ulaşmak için akıllı ikili arama sıkıştırması kullanır — tamamen tarayıcınızda. Yükleme yok, sunucu yok, tamamen ücretsiz.</p><p>Pasaport fotoğrafı boyut gereksinimleri, devlet formu yükleme sınırları, e-posta eki kısıtlamaları ve belirli bir kilobayt sınırının altında görsele ihtiyaç duyduğunuz her durum için mükemmel çalışır.</p>',
    h3why: 'Neden görselleri belirli KB\'ye boyutlandırmalı?',
    why: 'Birçok web sitesi, devlet portalı ve uygulama belirli bir dosya boyutunun altında görsel gerektirir. Hedefe ulaşana kadar kaliteyi manuel olarak ayarlamak sıkıcıdır. Bu araç süreci otomatikleştirir — sadece hedef KB\'nizi girin ve indirin.',
    faqs: [
      { q: 'KB olarak görsel boyutlandırma nedir?', a: 'KB olarak görsel boyutlandırma, görsel dosyasını kilobayt cinsinden ölçülen belirli bir dosya boyutuna sıkıştırmak anlamına gelir. Örneğin, kabul edilebilir görsel kaliteyi koruyarak 2 MB\'lık bir fotoğrafı tam 200 KB\'ye düşürmek.' },
      { q: '200KB\'ye nasıl küçültürüm?', a: 'Görselinizi yükleyin, hedef KB alanına 200 yazın ve Boyutlandır\'a tıklayın. Araç, görselinizi 200 KB\'ye mümkün olduğunca yaklaştırmak için doğru sıkıştırma seviyesini otomatik olarak bulacaktır.' },
      { q: 'Pasaport ve vize fotoğrafları için çalışır mı?', a: 'Evet — birçok ülke pasaport ve vize fotoğraflarının belirli bir dosya boyutunun altında olmasını gerektirir (ör. 100 KB, 200 KB, 300 KB). Fotoğrafınızı yükleyin, gerekli boyutu girin ve indirin.' },
      { q: 'Minimum boyut var mı?', a: 'Minimum, görselin boyutlarına ve içeriğine bağlıdır. Çok ayrıntılı veya büyük görseller, önce boyutları küçültülmeden belirli bir eşiğin altına sıkıştırılamayabilir. En iyi sonuçlar için önce görsel boyutlarını değiştirin, ardından KB hedefine ulaşmak için bu aracı kullanın.' },
      { q: 'Hangi formatlar destekleniyor?', a: 'JPG, PNG ve WebP görselleri yükleyebilirsiniz. Optimum sıkıştırma kontrolü için çıktı her zaman JPEG\'dir.' },
    ],
    links: [{ href: '/compress', label: 'Sıkıştır' },{ href: '/resize', label: 'Boyutlandır' },{ href: '/crop', label: 'Kırp' },{ href: '/passport-photo', label: 'Vesikalık' }],
  },
  uk: {
    h2a: 'Як змінити розмір зображення до певної кількості КБ',
    steps: [
      '<strong>Завантажте зображення</strong> — натисніть „Вибрати зображення" або перетягніть файл JPG, PNG або WebP.',
      '<strong>Введіть цільовий розмір</strong> — введіть бажаний розмір файлу в кілобайтах (напр. 100 КБ, 200 КБ).',
      '<strong>Натисніть Змінити</strong> — інструмент автоматично стискає для досягнення цільового розміру.',
      '<strong>Завантажте</strong> — збережіть зображення зі зміненим розміром на свій пристрій.'
    ],
    h2b: 'Найкращий безкоштовний інструмент для стиснення зображення до точної кількості КБ',
    body: '<p>Потрібне зображення менше 100 КБ для подання форми? Або точно 200 КБ для фото на візу? Інструмент „Змінити розмір у КБ" від RelahConvert використовує розумне стиснення з бінарним пошуком для досягнення цільового розміру файлу якомога точніше — повністю у вашому браузері. Без завантаження, без сервера, повністю безкоштовно.</p><p>Ідеально працює для вимог щодо розміру фото на паспорт, обмежень завантаження державних форм, обмежень вкладень електронної пошти та будь-якої ситуації, де вам потрібне зображення нижче певного ліміту в кілобайтах.</p>',
    h3why: 'Навіщо змінювати розмір зображень до певних КБ?',
    why: 'Багато веб-сайтів, державних порталів та додатків вимагають зображення менше певного розміру файлу. Ручне налаштування якості до досягнення мети — стомлююче. Цей інструмент автоматизує процес — просто введіть цільові КБ та завантажте.',
    faqs: [
      { q: 'Що таке зміна розміру зображення в КБ?', a: 'Зміна розміру зображення в КБ означає стиснення файлу зображення до певного розміру файлу, виміряного в кілобайтах. Наприклад, зменшення фото розміром 2 МБ до точно 200 КБ із збереженням прийнятної візуальної якості.' },
      { q: 'Як зменшити зображення до 200КБ?', a: 'Завантажте зображення, введіть 200 у поле цільових КБ та натисніть Змінити. Інструмент автоматично знайде правильний рівень стиснення, щоб наблизити зображення до 200 КБ якомога точніше.' },
      { q: 'Чи працює для фото на паспорт та візу?', a: 'Так — багато країн вимагають фото на паспорт та візу менше певного розміру файлу (напр. 100 КБ, 200 КБ, 300 КБ). Завантажте своє фото, введіть необхідний розмір та завантажте.' },
      { q: 'Чи є мінімальний розмір?', a: 'Мінімум залежить від розмірів та вмісту зображення. Дуже деталізовані або великі зображення можуть не стиснутися нижче певного порогу без попереднього зменшення розмірів. Для найкращих результатів спочатку змініть розміри зображення, а потім скористайтеся цим інструментом для досягнення цільових КБ.' },
      { q: 'Які формати підтримуються?', a: 'Ви можете завантажувати зображення JPG, PNG та WebP. Вихідний формат завжди JPEG для оптимального контролю стиснення.' },
    ],
    links: [{ href: '/compress', label: 'Стиснути' },{ href: '/resize', label: 'Змінити розмір' },{ href: '/crop', label: 'Обрізати' },{ href: '/passport-photo', label: 'Фото на паспорт' }],
  },
  vi: {
    h2a: 'Cách thay đổi kích thước ảnh thành KB cụ thể',
    steps: [
      '<strong>Tải ảnh lên</strong> — nhấp vào "Chọn ảnh" hoặc kéo và thả tệp JPG, PNG hoặc WebP.',
      '<strong>Nhập kích thước mục tiêu</strong> — gõ kích thước tệp bạn muốn bằng kilobyte (ví dụ: 100 KB, 200 KB).',
      '<strong>Nhấp Thay đổi kích thước</strong> — công cụ tự động nén để đạt kích thước mục tiêu của bạn.',
      '<strong>Tải về</strong> — lưu ảnh đã thay đổi kích thước vào thiết bị của bạn.'
    ],
    h2b: 'Công cụ miễn phí tốt nhất để nén ảnh đúng KB',
    body: '<p>Cần ảnh dưới 100 KB để nộp biểu mẫu? Hoặc đúng 200 KB cho ảnh thị thực? Công cụ Thay đổi kích thước theo KB của RelahConvert sử dụng nén tìm kiếm nhị phân thông minh để đạt kích thước tệp mục tiêu của bạn chính xác nhất có thể — tất cả trong trình duyệt của bạn. Không cần tải lên, không có máy chủ, hoàn toàn miễn phí.</p><p>Hoạt động hoàn hảo cho các yêu cầu kích thước ảnh hộ chiếu, giới hạn tải lên biểu mẫu chính phủ, hạn chế tệp đính kèm email và bất kỳ tình huống nào bạn cần ảnh dưới giới hạn kilobyte cụ thể.</p>',
    h3why: 'Tại sao cần thay đổi kích thước ảnh theo KB?',
    why: 'Nhiều trang web, cổng chính phủ và ứng dụng yêu cầu ảnh dưới kích thước tệp cụ thể. Điều chỉnh chất lượng thủ công cho đến khi đạt mục tiêu rất tẻ nhạt. Công cụ này tự động hóa quy trình — chỉ cần nhập KB mục tiêu của bạn và tải về.',
    faqs: [
      { q: 'Thay đổi kích thước ảnh theo KB là gì?', a: 'Thay đổi kích thước ảnh theo KB có nghĩa là nén tệp ảnh đến kích thước tệp cụ thể được đo bằng kilobyte. Ví dụ, giảm ảnh 2 MB xuống đúng 200 KB trong khi vẫn duy trì chất lượng hình ảnh chấp nhận được.' },
      { q: 'Làm sao giảm ảnh xuống 200KB?', a: 'Tải ảnh lên, gõ 200 vào trường KB mục tiêu và nhấp Thay đổi kích thước. Công cụ sẽ tự động tìm mức nén phù hợp để đưa ảnh của bạn gần 200 KB nhất có thể.' },
      { q: 'Có dùng được cho ảnh hộ chiếu và thị thực không?', a: 'Có — nhiều quốc gia yêu cầu ảnh hộ chiếu và thị thực dưới kích thước tệp cụ thể (ví dụ: 100 KB, 200 KB, 300 KB). Tải ảnh của bạn lên, nhập kích thước yêu cầu và tải về.' },
      { q: 'Có kích thước tối thiểu không?', a: 'Kích thước tối thiểu phụ thuộc vào kích thước và nội dung của ảnh. Ảnh rất chi tiết hoặc lớn có thể không nén được dưới ngưỡng nhất định mà không giảm kích thước trước. Để có kết quả tốt nhất, hãy thay đổi kích thước ảnh trước, sau đó sử dụng công cụ này để đạt KB mục tiêu.' },
      { q: 'Hỗ trợ định dạng nào?', a: 'Bạn có thể tải lên ảnh JPG, PNG và WebP. Đầu ra luôn là JPEG để kiểm soát nén tối ưu.' },
    ],
    links: [{ href: '/compress', label: 'Nén' },{ href: '/resize', label: 'Đổi kích thước' },{ href: '/crop', label: 'Cắt' },{ href: '/passport-photo', label: 'Ảnh hộ chiếu' }],
  },
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
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
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
const warning        = document.getElementById('warning')

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
  warning.style.display = 'none'

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

  // Check minimum achievable
  const minBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.01))
  if (minBlob.size > targetBytes) {
    // Can't go that small — try scaling down dimensions
    const scale = Math.sqrt(targetBytes / minBlob.size) * 0.9
    const small = document.createElement('canvas')
    small.width = Math.floor(canvas.width * scale)
    small.height = Math.floor(canvas.height * scale)
    small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height)
    return await new Promise(res => small.toBlob(res, 'image/jpeg', 0.5))
  }

  // Binary search — track best under and best over
  let low = 0.01, high = 1.0
  let underBlob = minBlob, overBlob = null
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', mid))
    if (blob.size <= targetBytes) {
      underBlob = blob
      low = mid
    } else {
      if (!overBlob || blob.size < overBlob.size) overBlob = blob
      high = mid
    }
    if (high - low < 0.0005) break
  }
  return underBlob
}

// ── Resize action ───────────────────────────────────────────────────────────
resizeBtn.addEventListener('click', async () => {
  if (!originalFile) return
  const targetKB = parseInt(targetKBInput.value)
  if (!targetKB || targetKB < 1) return

  const targetBytes = targetKB * 1024

  setResizing()

  try {
    const img = await loadImage(originalFile)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d').drawImage(img, 0, 0)

    // Check max achievable size at quality 1.0
    const maxBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 1.0))

    if (targetBytes >= maxBlob.size) {
      // Target is beyond max achievable — download at highest quality with warning
      const maxKB = Math.round(maxBlob.size / 1024)
      showWarning((t.rik_warn_max || 'Maximum achievable is') + ' ' + maxKB + 'KB — ' + (t.rik_warn_max_dl || 'downloading at highest quality.'))
      resultBlob = maxBlob
      const baseName = originalFile.name.replace(/\.[^.]+$/, '')
      showResultBar(originalFile.size, maxBlob.size)
      showDownload(baseName + '_' + maxKB + 'kb.jpg', maxBlob)
    } else {
      // Target is within range — compress to hit it
      const blob = await compressToTargetSize(canvas, targetKB)

      // Check if we had to scale down (target was too small for dimensions)
      const minBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.01))
      if (minBlob.size > targetBytes) {
        showWarning(t.rik_warn_small || 'Target too small for these dimensions — image was scaled down.')
      }

      resultBlob = blob
      const baseName = originalFile.name.replace(/\.[^.]+$/, '')
      showResultBar(originalFile.size, blob.size)
      showDownload(baseName + '_' + targetKB + 'kb.jpg', blob)
    }
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
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 5000) }

function showResultBar(originalBytes, outputBytes) {
  const isIncrease = outputBytes > originalBytes
  const pct = isIncrease
    ? Math.round((outputBytes / originalBytes - 1) * 100)
    : Math.max(0, Math.round((1 - outputBytes / originalBytes) * 100))
  const circumference = 226
  const dashOffset = circumference - (circumference * Math.min(pct, 100) / 100)
  const changeLbl = isIncrease ? (t.rik_increase || 'increase') : rikReductionLbl
  const circleColor = isIncrease ? '#2563EB' : '#C84B31'
  resultBar.style.display = 'block'
  resultBar.innerHTML = `
    <div class="result-bar">
      <div class="savings-circle">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle class="circle-bg" cx="36" cy="36" r="30" />
          <circle class="circle-fill" cx="36" cy="36" r="30" style="stroke-dashoffset:${circumference};stroke:${circleColor}" id="circleAnim" />
          <text class="circle-label" x="36" y="36" transform="rotate(90,36,36)">${pct}%</text>
        </svg>
      </div>
      <div class="result-stats">
        <p class="result-saved">${pct}% ${changeLbl}</p>
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
