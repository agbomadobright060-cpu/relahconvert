import { injectHeader } from '../core/header.js'
import { formatSize, totalBytes } from '../core/utils.js'
import JSZip from 'jszip'
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
    .preview-card img { width:100%; height:180px; object-fit:contain; display:block; background:#f9f9f9; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .preview-card .kb-input { width:70px; padding:4px 6px; border:1.5px solid #DDD5C8; border-radius:6px; font-size:12px; font-family:'DM Sans',sans-serif; color:#2C1810; outline:none; margin:0 4px 6px 8px; }
    #addMoreBtn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border:1.5px dashed #DDD5C8; border-radius:8px; background:transparent; color:#7A6A5A; font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; margin-top:8px; }
    #addMoreBtn:hover { border-color:#C84B31; color:#C84B31; }
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
  document.title = 'Resize Image in KB \u2014 Batch Resize to Specific KB Size Free & Private | RelahConvert'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = 'Resize image in KB \u2014 batch compress or adjust multiple images to a specific file size in kilobytes. Process up to 25 files at once with individual or global KB targets. Free, private, browser-only.'
  document.head.appendChild(metaDesc)
}

// ── SEO data ────────────────────────────────────────────────────────────────
const seoResizeKB = {
  en: {
    h2a: 'How to Batch Resize Images to a Specific KB Size',
    steps: ['<strong>Upload your images</strong> \u2014 click "Select Image" or drag and drop up to 25 JPG, PNG, or WebP files. You can add the same file multiple times.','<strong>Choose a mode</strong> \u2014 use "Apply to All" to set one KB target for every file, or switch to "Individual" to set a different KB target per image.','<strong>Click Resize</strong> \u2014 the tool processes each image: compressing to hit the target, saving at max quality if the target is larger, or downloading the original if already close.','<strong>Download</strong> \u2014 save a single image or a ZIP file containing all resized images.'],
    h2b: 'Best Free Batch Resize Image in KB Tool \u2014 Hit Exact File Size',
    body: '<p>Need images under 100 KB for form submissions? Or exactly 200 KB for visa photos? RelahConvert\u2019s Resize in KB tool uses smart binary-search compression to hit your target file size as closely as possible \u2014 all inside your browser. Process up to 25 images at once with a 200 MB total limit. No upload, no server, completely free.</p><p>The tool handles three scenarios automatically for each image: if your target is smaller than the original, it compresses to match. If the target is larger, it re-encodes at maximum JPEG quality. If the image is already close to the target size, it downloads the original. Use "Apply to All" for batch processing with one target, or "Individual" mode to set different KB targets per file. Multiple results are delivered as a ZIP download.</p>',
    h3why: 'Why Batch Resize Images to a Specific KB?',
    why: 'Many websites, government portals, and applications require images under a specific file size. Manually adjusting quality for each image is tedious. This tool automates the process for up to 25 files at once \u2014 set your target KB and download all results in a ZIP.',
    faqs: [
      { q: 'What is resize image in KB?', a: 'Resizing an image in KB means adjusting the image file to a specific file size measured in kilobytes. For reducing, the tool compresses the image. For increasing, it re-encodes at maximum JPEG quality. For example, reducing a 2 MB photo to exactly 200 KB while maintaining acceptable visual quality.' },
      { q: 'Can I resize multiple images at once?', a: 'Yes \u2014 you can upload up to 25 images (200 MB total) and resize them all in one batch. Use "Apply to All" to set the same KB target for every image, or switch to "Individual" mode to set a different target per file. Multiple results are downloaded as a ZIP.' },
      { q: 'How do I reduce an image to 200KB?', a: 'Upload your image, type 200 in the target KB field, and click Resize. The tool will automatically find the right compression level to get your image as close to 200 KB as possible.' },
      { q: 'What happens if my target is larger than the original?', a: 'If you set a target larger than your original file, the tool saves the image at maximum JPEG quality. A warning will show the maximum achievable size. The image dimensions stay the same \u2014 only the encoding quality is maximized.' },
      { q: 'Does this work for passport and visa photos?', a: 'Yes \u2014 many countries require passport and visa photos under a specific file size (e.g. 100 KB, 200 KB, 300 KB). Upload your photo, enter the required size, and download.' },
      { q: 'Is there a minimum size I can compress to?', a: 'The minimum depends on the image dimensions and content. Very detailed or large images may not compress below a certain threshold without reducing dimensions first. If the target is too small, the tool will automatically scale down the image dimensions to reach it.' },
      { q: 'Which formats are supported?', a: 'You can upload JPG, PNG, and WebP images. The output is always JPEG for optimal compression control.' },
    ],
    links: [{ href: '/compress', label: 'Compress Image' },{ href: '/resize', label: 'Resize Image' },{ href: '/crop', label: 'Crop Image' },{ href: '/passport-photo', label: 'Passport Photo' }],
  },
  fr: {
    h2a: 'Comment redimensionner par lot des images à une taille en Ko précise',
    steps: ['<strong>Téléchargez vos images</strong> — cliquez sur « Sélectionner une image » ou glissez-déposez jusqu\'à 25 fichiers JPG, PNG ou WebP. Vous pouvez ajouter le même fichier plusieurs fois.','<strong>Choisissez un mode</strong> — utilisez « Appliquer à tous » pour définir une taille cible en Ko pour chaque fichier, ou passez en mode « Individuel » pour définir une taille cible différente par image.','<strong>Cliquez sur Redimensionner</strong> — l\'outil traite chaque image : compression pour atteindre la cible, enregistrement en qualité maximale si la cible est supérieure, ou téléchargement de l\'original si déjà proche.','<strong>Téléchargez</strong> — enregistrez une seule image ou un fichier ZIP contenant toutes les images redimensionnées.'],
    h2b: 'Meilleur outil gratuit pour redimensionner par lot des images en Ko — Taille de fichier exacte',
    body: '<p>Besoin d\'images de moins de 100 Ko pour soumettre un formulaire ? Ou exactement 200 Ko pour une photo de visa ? L\'outil Redimensionner en Ko de RelahConvert utilise une compression intelligente par recherche binaire pour atteindre la taille de fichier cible aussi précisément que possible — le tout dans votre navigateur. Traitez jusqu\'à 25 images à la fois avec une limite totale de 200 Mo. Aucun téléversement, aucun serveur, entièrement gratuit.</p><p>L\'outil gère automatiquement trois scénarios pour chaque image : si votre cible est inférieure à l\'original, il compresse pour correspondre. Si la cible est supérieure, il ré-encode en qualité JPEG maximale. Si l\'image est déjà proche de la taille cible, il télécharge l\'original. Utilisez « Appliquer à tous » pour le traitement par lot avec une seule cible, ou le mode « Individuel » pour définir des tailles cibles en Ko différentes par fichier. Les résultats multiples sont livrés sous forme de téléchargement ZIP.</p>',
    h3why: 'Pourquoi redimensionner par lot des images à une taille en Ko précise ?',
    why: 'De nombreux sites web, portails gouvernementaux et applications exigent des images sous une taille de fichier spécifique. Ajuster manuellement la qualité pour chaque image est fastidieux. Cet outil automatise le processus pour jusqu\'à 25 fichiers à la fois — définissez votre taille cible en Ko et téléchargez tous les résultats dans un ZIP.',
    faqs: [{ q: 'Qu\'est-ce que le redimensionnement d\'image en Ko ?', a: 'Redimensionner une image en Ko signifie ajuster le fichier image à une taille de fichier spécifique mesurée en kilo-octets. Pour la réduction, l\'outil compresse l\'image. Pour l\'augmentation, il ré-encode en qualité JPEG maximale. Par exemple, réduire une photo de 2 Mo à exactement 200 Ko tout en maintenant une qualité visuelle acceptable.' },{ q: 'Puis-je redimensionner plusieurs images à la fois ?', a: 'Oui — vous pouvez télécharger jusqu\'à 25 images (200 Mo au total) et les redimensionner toutes en un seul lot. Utilisez « Appliquer à tous » pour définir la même taille cible en Ko pour chaque image, ou passez en mode « Individuel » pour définir une cible différente par fichier. Les résultats multiples sont téléchargés sous forme de ZIP.' },{ q: 'Comment réduire une image à 200 Ko ?', a: 'Téléchargez votre image, tapez 200 dans le champ de taille cible en Ko, et cliquez sur Redimensionner. L\'outil trouvera automatiquement le bon niveau de compression pour obtenir votre image aussi proche de 200 Ko que possible.' },{ q: 'Que se passe-t-il si ma cible est supérieure à l\'original ?', a: 'Si vous définissez une cible supérieure à votre fichier original, l\'outil enregistre l\'image en qualité JPEG maximale. Un avertissement affichera la taille maximale atteignable. Les dimensions de l\'image restent les mêmes — seule la qualité d\'encodage est maximisée.' },{ q: 'Cela fonctionne-t-il pour les photos de passeport et de visa ?', a: 'Oui — de nombreux pays exigent des photos de passeport et de visa sous une taille de fichier spécifique (par ex. 100 Ko, 200 Ko, 300 Ko). Téléchargez votre photo, entrez la taille requise, et téléchargez.' },{ q: 'Y a-t-il une taille minimale de compression ?', a: 'Le minimum dépend des dimensions et du contenu de l\'image. Les images très détaillées ou grandes peuvent ne pas se compresser en dessous d\'un certain seuil sans d\'abord réduire les dimensions. Si la cible est trop petite, l\'outil réduira automatiquement les dimensions de l\'image pour l\'atteindre.' },{ q: 'Quels formats sont supportés ?', a: 'Vous pouvez télécharger des images JPG, PNG et WebP. La sortie est toujours en JPEG pour un contrôle optimal de la compression.' }],
    links: [{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' },{ href: '/crop', label: 'Recadrer' },{ href: '/passport-photo', label: 'Photo passeport' }],
  },
  es: {
    h2a: 'Cómo redimensionar imágenes por lotes a un tamaño específico en KB',
    steps: ['<strong>Sube tus imágenes</strong> — haz clic en "Seleccionar imagen" o arrastra y suelta hasta 25 archivos JPG, PNG o WebP. Puedes agregar el mismo archivo varias veces.','<strong>Elige un modo</strong> — usa "Aplicar a todos" para establecer un objetivo en KB para cada archivo, o cambia a "Individual" para establecer un objetivo en KB diferente por imagen.','<strong>Haz clic en Redimensionar</strong> — la herramienta procesa cada imagen: comprimiendo para alcanzar el objetivo, guardando en calidad máxima si el objetivo es mayor, o descargando el original si ya está cerca.','<strong>Descarga</strong> — guarda una sola imagen o un archivo ZIP con todas las imágenes redimensionadas.'],
    h2b: 'Mejor herramienta gratuita para redimensionar imágenes en KB por lotes — Tamaño de archivo exacto',
    body: '<p>¿Necesitas imágenes de menos de 100 KB para enviar un formulario? ¿O exactamente 200 KB para una foto de visa? La herramienta Redimensionar en KB de RelahConvert usa compresión inteligente de búsqueda binaria para alcanzar el tamaño de archivo objetivo con la mayor precisión posible — todo dentro de tu navegador. Procesa hasta 25 imágenes a la vez con un límite total de 200 MB. Sin subir archivos, sin servidor, completamente gratis.</p><p>La herramienta maneja tres escenarios automáticamente para cada imagen: si tu objetivo es menor que el original, comprime para coincidir. Si el objetivo es mayor, re-codifica en calidad JPEG máxima. Si la imagen ya está cerca del tamaño objetivo, descarga el original. Usa "Aplicar a todos" para procesamiento por lotes con un solo objetivo, o el modo "Individual" para establecer objetivos en KB diferentes por archivo. Los resultados múltiples se entregan como descarga ZIP.</p>',
    h3why: '¿Por qué redimensionar imágenes por lotes a un tamaño específico en KB?',
    why: 'Muchos sitios web, portales gubernamentales y aplicaciones requieren imágenes por debajo de un tamaño de archivo específico. Ajustar manualmente la calidad para cada imagen es tedioso. Esta herramienta automatiza el proceso para hasta 25 archivos a la vez — establece tu tamaño objetivo en KB y descarga todos los resultados en un ZIP.',
    faqs: [{ q: '¿Qué es redimensionar imagen en KB?', a: 'Redimensionar una imagen en KB significa ajustar el archivo de imagen a un tamaño de archivo específico medido en kilobytes. Para reducir, la herramienta comprime la imagen. Para aumentar, re-codifica en calidad JPEG máxima. Por ejemplo, reducir una foto de 2 MB a exactamente 200 KB manteniendo una calidad visual aceptable.' },{ q: '¿Puedo redimensionar varias imágenes a la vez?', a: 'Sí — puedes subir hasta 25 imágenes (200 MB en total) y redimensionarlas todas en un solo lote. Usa "Aplicar a todos" para establecer el mismo objetivo en KB para cada imagen, o cambia al modo "Individual" para establecer un objetivo diferente por archivo. Los resultados múltiples se descargan como ZIP.' },{ q: '¿Cómo reduzco una imagen a 200 KB?', a: 'Sube tu imagen, escribe 200 en el campo de tamaño objetivo en KB y haz clic en Redimensionar. La herramienta encontrará automáticamente el nivel de compresión adecuado para que tu imagen se acerque lo más posible a 200 KB.' },{ q: '¿Qué pasa si mi objetivo es mayor que el original?', a: 'Si estableces un objetivo mayor que tu archivo original, la herramienta guarda la imagen en calidad JPEG máxima. Una advertencia mostrará el tamaño máximo alcanzable. Las dimensiones de la imagen permanecen iguales — solo se maximiza la calidad de codificación.' },{ q: '¿Funciona para fotos de pasaporte y visa?', a: 'Sí — muchos países requieren fotos de pasaporte y visa por debajo de un tamaño de archivo específico (por ej. 100 KB, 200 KB, 300 KB). Sube tu foto, ingresa el tamaño requerido y descarga.' },{ q: '¿Hay un tamaño mínimo al que puedo comprimir?', a: 'El mínimo depende de las dimensiones y el contenido de la imagen. Las imágenes muy detalladas o grandes pueden no comprimirse por debajo de cierto umbral sin reducir primero las dimensiones. Si el objetivo es demasiado pequeño, la herramienta reducirá automáticamente las dimensiones de la imagen para alcanzarlo.' },{ q: '¿Qué formatos se admiten?', a: 'Puedes subir imágenes JPG, PNG y WebP. La salida es siempre JPEG para un control óptimo de la compresión.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto pasaporte' }],
  },
  pt: {
    h2a: 'Como redimensionar imagens em lote para um tamanho específico em KB',
    steps: ['<strong>Envie suas imagens</strong> — clique em "Selecionar imagem" ou arraste e solte até 25 arquivos JPG, PNG ou WebP. Você pode adicionar o mesmo arquivo várias vezes.','<strong>Escolha um modo</strong> — use "Aplicar a todos" para definir um alvo em KB para cada arquivo, ou mude para "Individual" para definir um alvo em KB diferente por imagem.','<strong>Clique em Redimensionar</strong> — a ferramenta processa cada imagem: comprimindo para atingir o alvo, salvando em qualidade máxima se o alvo for maior, ou baixando o original se já estiver próximo.','<strong>Baixe</strong> — salve uma única imagem ou um arquivo ZIP contendo todas as imagens redimensionadas.'],
    h2b: 'Melhor ferramenta gratuita para redimensionar imagens em lote em KB — Tamanho de arquivo exato',
    body: '<p>Precisa de imagens com menos de 100 KB para enviar um formulário? Ou exatamente 200 KB para uma foto de visto? A ferramenta Redimensionar em KB do RelahConvert usa compressão inteligente de busca binária para atingir o tamanho de arquivo alvo com a maior precisão possível — tudo dentro do seu navegador. Processe até 25 imagens de uma vez com um limite total de 200 MB. Sem upload, sem servidor, completamente gratuito.</p><p>A ferramenta lida com três cenários automaticamente para cada imagem: se seu alvo é menor que o original, comprime para corresponder. Se o alvo é maior, re-codifica em qualidade JPEG máxima. Se a imagem já está próxima do tamanho alvo, baixa o original. Use "Aplicar a todos" para processamento em lote com um único alvo, ou o modo "Individual" para definir alvos em KB diferentes por arquivo. Os resultados múltiplos são entregues como download ZIP.</p>',
    h3why: 'Por que redimensionar imagens em lote para um tamanho específico em KB?',
    why: 'Muitos sites, portais governamentais e aplicações exigem imagens abaixo de um tamanho de arquivo específico. Ajustar manualmente a qualidade para cada imagem é tedioso. Esta ferramenta automatiza o processo para até 25 arquivos de uma vez — defina seu tamanho alvo em KB e baixe todos os resultados em um ZIP.',
    faqs: [{ q: 'O que é redimensionar imagem em KB?', a: 'Redimensionar uma imagem em KB significa ajustar o arquivo de imagem para um tamanho de arquivo específico medido em kilobytes. Para reduzir, a ferramenta comprime a imagem. Para aumentar, re-codifica em qualidade JPEG máxima. Por exemplo, reduzir uma foto de 2 MB para exatamente 200 KB mantendo uma qualidade visual aceitável.' },{ q: 'Posso redimensionar várias imagens de uma vez?', a: 'Sim — você pode enviar até 25 imagens (200 MB no total) e redimensioná-las todas em um único lote. Use "Aplicar a todos" para definir o mesmo alvo em KB para cada imagem, ou mude para o modo "Individual" para definir um alvo diferente por arquivo. Os resultados múltiplos são baixados como ZIP.' },{ q: 'Como reduzo uma imagem para 200 KB?', a: 'Envie sua imagem, digite 200 no campo de tamanho alvo em KB e clique em Redimensionar. A ferramenta encontrará automaticamente o nível de compressão correto para deixar sua imagem o mais próximo possível de 200 KB.' },{ q: 'O que acontece se meu alvo for maior que o original?', a: 'Se você definir um alvo maior que seu arquivo original, a ferramenta salva a imagem em qualidade JPEG máxima. Um aviso mostrará o tamanho máximo alcançável. As dimensões da imagem permanecem as mesmas — apenas a qualidade de codificação é maximizada.' },{ q: 'Funciona para fotos de passaporte e visto?', a: 'Sim — muitos países exigem fotos de passaporte e visto abaixo de um tamanho de arquivo específico (por ex. 100 KB, 200 KB, 300 KB). Envie sua foto, insira o tamanho exigido e baixe.' },{ q: 'Existe um tamanho mínimo para compressão?', a: 'O mínimo depende das dimensões e do conteúdo da imagem. Imagens muito detalhadas ou grandes podem não comprimir abaixo de certo limite sem reduzir as dimensões primeiro. Se o alvo for muito pequeno, a ferramenta reduzirá automaticamente as dimensões da imagem para alcançá-lo.' },{ q: 'Quais formatos são suportados?', a: 'Você pode enviar imagens JPG, PNG e WebP. A saída é sempre JPEG para controle ideal de compressão.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Recortar' },{ href: '/passport-photo', label: 'Foto passaporte' }],
  },
  de: {
    h2a: 'So ändern Sie die Bildgröße stapelweise auf eine bestimmte KB-Größe',
    steps: ['<strong>Bilder hochladen</strong> — klicken Sie auf „Bild auswählen" oder ziehen Sie bis zu 25 JPG-, PNG- oder WebP-Dateien per Drag & Drop. Sie können dieselbe Datei mehrfach hinzufügen.','<strong>Modus wählen</strong> — verwenden Sie „Auf alle anwenden", um ein KB-Ziel für jede Datei festzulegen, oder wechseln Sie zu „Individuell", um ein anderes KB-Ziel pro Bild festzulegen.','<strong>Klicken Sie auf Ändern</strong> — das Tool verarbeitet jedes Bild: Komprimierung zum Erreichen des Ziels, Speichern in maximaler Qualität wenn das Ziel größer ist, oder Download des Originals wenn bereits nahe dran.','<strong>Herunterladen</strong> — speichern Sie ein einzelnes Bild oder eine ZIP-Datei mit allen verkleinerten Bildern.'],
    h2b: 'Bestes kostenloses Tool zum stapelweisen Ändern der Bildgröße in KB — Exakte Dateigröße',
    body: '<p>Brauchen Sie Bilder unter 100 KB für eine Formulareinreichung? Oder genau 200 KB für ein Visafoto? Das KB-Größenänderungs-Tool von RelahConvert verwendet intelligente Binärsuche-Komprimierung, um Ihre Zieldateigröße so genau wie möglich zu erreichen — alles in Ihrem Browser. Verarbeiten Sie bis zu 25 Bilder gleichzeitig mit einem Gesamtlimit von 200 MB. Kein Upload, kein Server, völlig kostenlos.</p><p>Das Tool behandelt automatisch drei Szenarien für jedes Bild: Wenn Ihr Ziel kleiner als das Original ist, komprimiert es entsprechend. Wenn das Ziel größer ist, kodiert es in maximaler JPEG-Qualität neu. Wenn das Bild bereits nahe an der Zielgröße liegt, wird das Original heruntergeladen. Verwenden Sie „Auf alle anwenden" für Stapelverarbeitung mit einem Ziel, oder den „Individuell"-Modus, um verschiedene KB-Ziele pro Datei festzulegen. Mehrere Ergebnisse werden als ZIP-Download geliefert.</p>',
    h3why: 'Warum Bilder stapelweise auf eine bestimmte KB-Größe ändern?',
    why: 'Viele Websites, Behördenportale und Anwendungen verlangen Bilder unter einer bestimmten Dateigröße. Die Qualität für jedes Bild manuell anzupassen ist mühsam. Dieses Tool automatisiert den Prozess für bis zu 25 Dateien gleichzeitig — legen Sie Ihre Ziel-KB fest und laden Sie alle Ergebnisse in einer ZIP herunter.',
    faqs: [{ q: 'Was bedeutet Bildgröße in KB ändern?', a: 'Die Bildgröße in KB zu ändern bedeutet, die Bilddatei auf eine bestimmte Dateigröße in Kilobyte anzupassen. Zum Verkleinern komprimiert das Tool das Bild. Zum Vergrößern kodiert es in maximaler JPEG-Qualität neu. Zum Beispiel ein 2-MB-Foto auf genau 200 KB zu reduzieren und dabei eine akzeptable visuelle Qualität beizubehalten.' },{ q: 'Kann ich mehrere Bilder gleichzeitig verkleinern?', a: 'Ja — Sie können bis zu 25 Bilder (200 MB insgesamt) hochladen und alle in einem Stapel verkleinern. Verwenden Sie „Auf alle anwenden", um dasselbe KB-Ziel für jedes Bild festzulegen, oder wechseln Sie zum „Individuell"-Modus, um ein anderes Ziel pro Datei festzulegen. Mehrere Ergebnisse werden als ZIP heruntergeladen.' },{ q: 'Wie reduziere ich ein Bild auf 200 KB?', a: 'Laden Sie Ihr Bild hoch, geben Sie 200 in das KB-Zielgrößenfeld ein und klicken Sie auf Ändern. Das Tool findet automatisch die richtige Komprimierungsstufe, um Ihr Bild so nah wie möglich an 200 KB zu bringen.' },{ q: 'Was passiert, wenn mein Ziel größer als das Original ist?', a: 'Wenn Sie ein Ziel größer als Ihre Originaldatei festlegen, speichert das Tool das Bild in maximaler JPEG-Qualität. Eine Warnung zeigt die maximal erreichbare Größe an. Die Bildabmessungen bleiben gleich — nur die Kodierungsqualität wird maximiert.' },{ q: 'Funktioniert das für Pass- und Visafotos?', a: 'Ja — viele Länder verlangen Pass- und Visafotos unter einer bestimmten Dateigröße (z. B. 100 KB, 200 KB, 300 KB). Laden Sie Ihr Foto hoch, geben Sie die erforderliche Größe ein und laden Sie es herunter.' },{ q: 'Gibt es eine Mindestgröße für die Komprimierung?', a: 'Das Minimum hängt von den Abmessungen und dem Inhalt des Bildes ab. Sehr detaillierte oder große Bilder lassen sich möglicherweise nicht unter einen bestimmten Schwellenwert komprimieren, ohne vorher die Abmessungen zu verkleinern. Wenn das Ziel zu klein ist, verkleinert das Tool automatisch die Bildabmessungen, um es zu erreichen.' },{ q: 'Welche Formate werden unterstützt?', a: 'Sie können JPG-, PNG- und WebP-Bilder hochladen. Die Ausgabe ist immer JPEG für optimale Komprimierungskontrolle.' }],
    links: [{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' },{ href: '/crop', label: 'Zuschneiden' },{ href: '/passport-photo', label: 'Passfoto' }],
  },
  ar: {
    h2a: 'كيفية تغيير حجم الصور دفعة واحدة إلى حجم محدد بالكيلوبايت',
    steps: ['<strong>ارفع صورك</strong> — انقر على "اختيار صورة" أو اسحب وأفلت حتى 25 ملف JPG أو PNG أو WebP. يمكنك إضافة نفس الملف عدة مرات.','<strong>اختر وضعاً</strong> — استخدم "تطبيق على الكل" لتعيين حجم مستهدف بالكيلوبايت لكل ملف، أو انتقل إلى "فردي" لتعيين حجم مستهدف مختلف لكل صورة.','<strong>انقر تغيير الحجم</strong> — الأداة تعالج كل صورة: ضغط للوصول إلى الهدف، حفظ بأقصى جودة إذا كان الهدف أكبر، أو تحميل الأصلي إذا كان قريباً بالفعل.','<strong>حمّل</strong> — احفظ صورة واحدة أو ملف ZIP يحتوي على جميع الصور المُعدَّلة.'],
    h2b: 'أفضل أداة مجانية لتغيير حجم الصور دفعة واحدة بالكيلوبايت — حجم ملف دقيق',
    body: '<p>هل تحتاج صوراً أقل من 100 كيلوبايت لتقديم نموذج؟ أو بالضبط 200 كيلوبايت لصورة تأشيرة؟ أداة تغيير الحجم بالكيلوبايت من RelahConvert تستخدم ضغطاً ذكياً بالبحث الثنائي للوصول إلى حجم الملف المستهدف بأكبر دقة ممكنة — كل ذلك داخل متصفحك. عالج حتى 25 صورة دفعة واحدة بحد أقصى إجمالي 200 ميغابايت. بدون رفع، بدون خادم، مجاني بالكامل.</p><p>الأداة تتعامل مع ثلاثة سيناريوهات تلقائياً لكل صورة: إذا كان هدفك أصغر من الأصلي، تضغط للمطابقة. إذا كان الهدف أكبر، تعيد الترميز بأقصى جودة JPEG. إذا كانت الصورة قريبة بالفعل من الحجم المستهدف، تحمّل الأصلي. استخدم "تطبيق على الكل" للمعالجة الدفعية بهدف واحد، أو وضع "فردي" لتعيين أحجام مستهدفة مختلفة بالكيلوبايت لكل ملف. النتائج المتعددة تُسلَّم كتحميل ZIP.</p>',
    h3why: 'لماذا تغيير حجم الصور دفعة واحدة إلى حجم محدد بالكيلوبايت؟',
    why: 'العديد من المواقع والبوابات الحكومية والتطبيقات تتطلب صوراً تحت حجم ملف محدد. ضبط الجودة يدوياً لكل صورة أمر مرهق. هذه الأداة تُؤتمت العملية لما يصل إلى 25 ملفاً دفعة واحدة — حدد حجمك المستهدف بالكيلوبايت وحمّل جميع النتائج في ملف ZIP.',
    faqs: [{ q: 'ما هو تغيير حجم الصورة بالكيلوبايت؟', a: 'تغيير حجم الصورة بالكيلوبايت يعني تعديل ملف الصورة إلى حجم ملف محدد يُقاس بالكيلوبايت. للتقليل، تضغط الأداة الصورة. للزيادة، تعيد الترميز بأقصى جودة JPEG. على سبيل المثال، تقليل صورة بحجم 2 ميغابايت إلى 200 كيلوبايت بالضبط مع الحفاظ على جودة بصرية مقبولة.' },{ q: 'هل يمكنني تغيير حجم عدة صور دفعة واحدة؟', a: 'نعم — يمكنك رفع حتى 25 صورة (200 ميغابايت إجمالاً) وتغيير حجمها جميعاً في دفعة واحدة. استخدم "تطبيق على الكل" لتعيين نفس الحجم المستهدف بالكيلوبايت لكل صورة، أو انتقل إلى وضع "فردي" لتعيين هدف مختلف لكل ملف. النتائج المتعددة تُحمَّل كملف ZIP.' },{ q: 'كيف أقلل صورة إلى 200 كيلوبايت؟', a: 'ارفع صورتك، اكتب 200 في حقل الحجم المستهدف بالكيلوبايت، وانقر تغيير الحجم. ستجد الأداة تلقائياً مستوى الضغط المناسب لجعل صورتك أقرب ما يمكن إلى 200 كيلوبايت.' },{ q: 'ماذا يحدث إذا كان هدفي أكبر من الأصلي؟', a: 'إذا حددت هدفاً أكبر من ملفك الأصلي، تحفظ الأداة الصورة بأقصى جودة JPEG. سيظهر تحذير بالحجم الأقصى الممكن تحقيقه. تبقى أبعاد الصورة كما هي — فقط جودة الترميز تُرفع إلى الحد الأقصى.' },{ q: 'هل يعمل لصور جواز السفر والتأشيرة؟', a: 'نعم — العديد من الدول تتطلب صور جواز السفر والتأشيرة تحت حجم ملف محدد (مثلاً 100 كيلوبايت، 200 كيلوبايت، 300 كيلوبايت). ارفع صورتك، أدخل الحجم المطلوب، وحمّل.' },{ q: 'هل هناك حد أدنى للضغط؟', a: 'الحد الأدنى يعتمد على أبعاد الصورة ومحتواها. الصور التفصيلية جداً أو الكبيرة قد لا تُضغط تحت عتبة معينة بدون تقليل الأبعاد أولاً. إذا كان الهدف صغيراً جداً، ستقوم الأداة تلقائياً بتصغير أبعاد الصورة للوصول إليه.' },{ q: 'ما الصيغ المدعومة؟', a: 'يمكنك رفع صور JPG وPNG وWebP. المخرج دائماً JPEG للتحكم الأمثل في الضغط.' }],
    links: [{ href: '/compress', label: 'ضغط' },{ href: '/resize', label: 'تغيير الحجم' },{ href: '/crop', label: 'قص' },{ href: '/passport-photo', label: 'صورة جواز' }],
  },
  it: {
    h2a: 'Come ridimensionare in batch le immagini a una dimensione specifica in KB',
    steps: ['<strong>Carica le tue immagini</strong> — clicca su "Seleziona immagine" o trascina e rilascia fino a 25 file JPG, PNG o WebP. Puoi aggiungere lo stesso file più volte.','<strong>Scegli una modalità</strong> — usa "Applica a tutti" per impostare un obiettivo in KB per ogni file, o passa a "Individuale" per impostare un obiettivo in KB diverso per immagine.','<strong>Clicca su Ridimensiona</strong> — lo strumento elabora ogni immagine: comprimendo per raggiungere l\'obiettivo, salvando alla qualità massima se l\'obiettivo è più grande, o scaricando l\'originale se già vicino.','<strong>Scarica</strong> — salva una singola immagine o un file ZIP contenente tutte le immagini ridimensionate.'],
    h2b: 'Miglior strumento gratuito per ridimensionare in batch le immagini in KB — Dimensione file esatta',
    body: '<p>Hai bisogno di immagini sotto i 100 KB per inviare un modulo? O esattamente 200 KB per una foto visto? Lo strumento Ridimensiona in KB di RelahConvert usa una compressione intelligente a ricerca binaria per raggiungere la dimensione del file target il più precisamente possibile — tutto nel tuo browser. Elabora fino a 25 immagini contemporaneamente con un limite totale di 200 MB. Nessun caricamento, nessun server, completamente gratuito.</p><p>Lo strumento gestisce automaticamente tre scenari per ogni immagine: se il tuo target è più piccolo dell\'originale, comprime per corrispondere. Se il target è più grande, ri-codifica alla qualità JPEG massima. Se l\'immagine è già vicina alla dimensione target, scarica l\'originale. Usa "Applica a tutti" per l\'elaborazione in batch con un unico obiettivo, o la modalità "Individuale" per impostare obiettivi in KB diversi per file. I risultati multipli vengono consegnati come download ZIP.</p>',
    h3why: 'Perché ridimensionare in batch le immagini a una dimensione specifica in KB?',
    why: 'Molti siti web, portali governativi e applicazioni richiedono immagini sotto una dimensione di file specifica. Regolare manualmente la qualità per ogni immagine è noioso. Questo strumento automatizza il processo per fino a 25 file contemporaneamente — imposta la dimensione target in KB e scarica tutti i risultati in un ZIP.',
    faqs: [{ q: 'Cosa significa ridimensionare un\'immagine in KB?', a: 'Ridimensionare un\'immagine in KB significa regolare il file immagine a una dimensione di file specifica misurata in kilobyte. Per ridurre, lo strumento comprime l\'immagine. Per aumentare, ri-codifica alla qualità JPEG massima. Ad esempio, ridurre una foto da 2 MB a esattamente 200 KB mantenendo una qualità visiva accettabile.' },{ q: 'Posso ridimensionare più immagini contemporaneamente?', a: 'Sì — puoi caricare fino a 25 immagini (200 MB in totale) e ridimensionarle tutte in un unico batch. Usa "Applica a tutti" per impostare lo stesso obiettivo in KB per ogni immagine, o passa alla modalità "Individuale" per impostare un obiettivo diverso per file. I risultati multipli vengono scaricati come ZIP.' },{ q: 'Come riduco un\'immagine a 200 KB?', a: 'Carica la tua immagine, digita 200 nel campo della dimensione target in KB e clicca su Ridimensiona. Lo strumento troverà automaticamente il livello di compressione giusto per portare la tua immagine il più vicino possibile a 200 KB.' },{ q: 'Cosa succede se il mio target è più grande dell\'originale?', a: 'Se imposti un target più grande del tuo file originale, lo strumento salva l\'immagine alla qualità JPEG massima. Un avviso mostrerà la dimensione massima raggiungibile. Le dimensioni dell\'immagine restano invariate — solo la qualità di codifica viene massimizzata.' },{ q: 'Funziona per foto passaporto e visto?', a: 'Sì — molti paesi richiedono foto passaporto e visto sotto una dimensione di file specifica (es. 100 KB, 200 KB, 300 KB). Carica la tua foto, inserisci la dimensione richiesta e scarica.' },{ q: 'C\'è una dimensione minima di compressione?', a: 'Il minimo dipende dalle dimensioni e dal contenuto dell\'immagine. Le immagini molto dettagliate o grandi potrebbero non comprimersi sotto una certa soglia senza prima ridurre le dimensioni. Se il target è troppo piccolo, lo strumento ridurrà automaticamente le dimensioni dell\'immagine per raggiungerlo.' },{ q: 'Quali formati sono supportati?', a: 'Puoi caricare immagini JPG, PNG e WebP. L\'uscita è sempre JPEG per un controllo ottimale della compressione.' }],
    links: [{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' },{ href: '/crop', label: 'Ritaglia' },{ href: '/passport-photo', label: 'Foto passaporto' }],
  },
  ja: {
    h2a: '画像を一括で特定のKBサイズにリサイズする方法',
    steps: ['<strong>画像をアップロード</strong> — 最大25枚のJPG、PNG、またはWebPファイルをアップロードできます。同じファイルを複数回追加することも可能です。','<strong>モードを選択</strong> — 「一括適用」で全ファイルに同じ目標KBを設定するか、「個別」で画像ごとに異なる目標KBを設定します。','<strong>リサイズをクリック</strong> — ツールが各画像を自動的に処理します。','<strong>ダウンロード</strong> — 単一画像をそのまま、または複数画像をZIPでダウンロードします。'],
    h2b: '最高の無料一括KB画像リサイズツール — 正確なファイルサイズを実現',
    body: '<p>フォーム送信用に100 KB以下の画像が必要ですか？ビザ写真用にちょうど200 KBが必要ですか？RelahConvertのKBリサイズツールは、スマートなバイナリサーチ圧縮を使用して、目標ファイルサイズにできるだけ近づけます — すべてブラウザ内で完結。最大25枚の画像を一度に処理でき、合計200 MBの制限があります。アップロード不要、サーバー不要、完全無料です。</p><p>このツールは3つのシナリオを自動的に処理します：目標がオリジナルより小さい場合は圧縮して合わせます。目標が大きい場合は、最高JPEG品質で再エンコードします。画像が既に目標サイズに近い場合は、オリジナルをそのままダウンロードします。「一括適用」で同じ目標を設定するバッチ処理、または「個別」モードでファイルごとに異なるKB目標を設定できます。複数の結果はZIPダウンロードで提供されます。</p>',
    h3why: 'なぜ画像を一括で特定のKBにリサイズするのか？',
    why: '多くのウェブサイト、政府ポータル、アプリケーションでは、特定のファイルサイズ以下の画像が求められます。各画像の品質を手動で調整するのは面倒です。このツールは最大25ファイルを一度に自動処理します — 目標KBを設定して、すべての結果をZIPでダウンロードするだけです。',
    faqs: [{ q: 'KBでリサイズとは？', a: 'KBでの画像リサイズとは、画像ファイルをキロバイト単位の特定のファイルサイズに調整することです。縮小の場合、ツールは画像を圧縮します。拡大の場合、最高JPEG品質で再エンコードします。例えば、2 MBの写真を許容できる画質を維持しながら、ちょうど200 KBに縮小することを意味します。' },{ q: '複数の画像を一度にリサイズできますか？', a: 'はい — 最大25枚の画像（合計200 MB）をアップロードして一括リサイズできます。「一括適用」で全画像に同じKB目標を設定するか、「個別」モードでファイルごとに異なる目標を設定できます。複数の結果はZIPでダウンロードされます。' },{ q: '200KBに縮小するには？', a: '画像をアップロードし、目標KBフィールドに200と入力してリサイズをクリックしてください。ツールが自動的に最適な圧縮レベルを見つけ、画像をできるだけ200 KBに近づけます。' },{ q: '目標がオリジナルより大きい場合はどうなりますか？', a: 'オリジナルファイルより大きい目標を設定した場合、ツールは最高JPEG品質で画像を保存します。達成可能な最大サイズが警告として表示されます。画像の寸法は変わりません — エンコード品質のみが最大化されます。' },{ q: 'パスポートやビザの写真に使えますか？', a: 'はい — 多くの国ではパスポートやビザの写真に特定のファイルサイズ制限があります（例：100 KB、200 KB、300 KB）。写真をアップロードし、必要なサイズを入力してダウンロードしてください。' },{ q: '圧縮できる最小サイズは？', a: '最小サイズは画像の寸法と内容によって異なります。非常に詳細な画像や大きな画像は、先に寸法を縮小しないと特定の閾値以下に圧縮できない場合があります。目標が小さすぎる場合、ツールは自動的に画像の寸法を縮小して目標に到達します。' },{ q: '対応フォーマットは？', a: 'JPG、PNG、WebP画像をアップロードできます。最適な圧縮制御のため、出力は常にJPEG形式です。' }],
    links: [{ href: '/compress', label: '圧縮' },{ href: '/resize', label: 'リサイズ' },{ href: '/crop', label: 'クロップ' },{ href: '/passport-photo', label: '証明写真' }],
  },
  ru: {
    h2a: 'Как пакетно изменить размер изображений до определённого количества КБ',
    steps: ['<strong>Загрузите изображения</strong> — до 25 файлов JPG, PNG или WebP. Один и тот же файл можно добавить несколько раз.','<strong>Выберите режим</strong> — «Применить ко всем» для одного целевого размера или «Индивидуально» для отдельных целей по каждому файлу.','<strong>Нажмите Изменить</strong> — инструмент автоматически обрабатывает каждое изображение.','<strong>Скачайте</strong> — одно изображение напрямую или ZIP-архив для нескольких.'],
    h2b: 'Лучший бесплатный инструмент для пакетного изменения размера изображений в КБ — точный размер файла',
    body: '<p>Нужно изображение менее 100 КБ для отправки формы? Или ровно 200 КБ для визовой фотографии? Инструмент RelahConvert «Размер в КБ» использует умное сжатие с бинарным поиском, чтобы максимально точно достичь целевого размера файла — полностью в вашем браузере. Обрабатывайте до 25 изображений одновременно с лимитом 200 МБ. Без загрузки на сервер, без регистрации, полностью бесплатно.</p><p>Инструмент автоматически обрабатывает три сценария для каждого изображения: если целевой размер меньше оригинала, он сжимает до нужного размера. Если целевой размер больше, изображение перекодируется с максимальным качеством JPEG. Если изображение уже близко к целевому размеру, скачивается оригинал. Используйте «Применить ко всем» для пакетной обработки с одной целью или «Индивидуально» для разных КБ целей по файлам. Результаты для нескольких файлов скачиваются в ZIP-архиве.</p>',
    h3why: 'Зачем пакетно менять размер изображений до определённого КБ?',
    why: 'Многие веб-сайты, государственные порталы и приложения требуют изображения меньше определённого размера файла. Ручная настройка качества для каждого изображения — утомительный процесс. Этот инструмент автоматизирует его для до 25 файлов одновременно — установите целевой размер в КБ и скачайте все результаты в ZIP.',
    faqs: [{ q: 'Что такое изменение размера в КБ?', a: 'Изменение размера изображения в КБ означает настройку файла изображения до определённого размера, измеряемого в килобайтах. Для уменьшения инструмент сжимает изображение. Для увеличения — перекодирует с максимальным качеством JPEG. Например, уменьшение фотографии размером 2 МБ до ровно 200 КБ при сохранении приемлемого визуального качества.' },{ q: 'Можно ли изменить размер нескольких изображений одновременно?', a: 'Да — вы можете загрузить до 25 изображений (всего 200 МБ) и изменить их размер за один раз. Используйте «Применить ко всем» для одного целевого КБ для всех изображений или переключитесь на «Индивидуально» для разных целей по файлам. Результаты скачиваются в ZIP-архиве.' },{ q: 'Как уменьшить до 200КБ?', a: 'Загрузите изображение, введите 200 в поле целевого размера КБ и нажмите «Изменить». Инструмент автоматически подберёт оптимальный уровень сжатия, чтобы размер изображения был максимально близок к 200 КБ.' },{ q: 'Что произойдёт, если целевой размер больше оригинала?', a: 'Если вы установите целевой размер больше оригинального файла, инструмент сохранит изображение с максимальным качеством JPEG. Предупреждение покажет максимально достижимый размер. Размеры изображения останутся прежними — максимизируется только качество кодирования.' },{ q: 'Работает для фото на паспорт?', a: 'Да — многие страны требуют, чтобы фотографии на паспорт и визу были меньше определённого размера файла (например, 100 КБ, 200 КБ, 300 КБ). Загрузите фотографию, введите требуемый размер и скачайте.' },{ q: 'Есть минимальный размер?', a: 'Минимум зависит от размеров и содержимого изображения. Очень детализированные или крупные изображения могут не сжаться ниже определённого порога без предварительного уменьшения размеров. Если целевой размер слишком мал, инструмент автоматически уменьшит размеры изображения, чтобы достичь его.' },{ q: 'Какие форматы поддерживаются?', a: 'Вы можете загрузить изображения в форматах JPG, PNG и WebP. Выходной формат всегда JPEG для оптимального контроля сжатия.' }],
    links: [{ href: '/compress', label: 'Сжать' },{ href: '/resize', label: 'Изменить размер' },{ href: '/crop', label: 'Обрезать' },{ href: '/passport-photo', label: 'Фото на паспорт' }],
  },
  ko: {
    h2a: '이미지를 일괄로 특정 KB 크기로 리사이즈하는 방법',
    steps: ['<strong>이미지 업로드</strong> — 최대 25개의 JPG, PNG 또는 WebP 파일을 업로드할 수 있습니다. 같은 파일을 여러 번 추가할 수 있습니다.','<strong>모드 선택</strong> — "일괄 적용"으로 모든 파일에 하나의 목표를 설정하거나, "개별"로 이미지별 다른 목표를 설정하세요.','<strong>리사이즈 클릭</strong> — 도구가 각 이미지를 자동으로 처리합니다.','<strong>다운로드</strong> — 단일 이미지를 직접 또는 여러 이미지를 ZIP으로 다운로드합니다.'],
    h2b: '최고의 무료 일괄 KB 이미지 리사이즈 도구 — 정확한 파일 크기 달성',
    body: '<p>폼 제출을 위해 100 KB 이하의 이미지가 필요하신가요? 비자 사진을 위해 정확히 200 KB가 필요하신가요? RelahConvert의 KB 리사이즈 도구는 스마트한 이진 탐색 압축을 사용하여 목표 파일 크기에 최대한 가깝게 맞춥니다 — 모두 브라우저 안에서 처리됩니다. 최대 25개 이미지를 한 번에 처리할 수 있으며 총 200 MB 제한이 있습니다. 업로드 없음, 서버 없음, 완전 무료입니다.</p><p>이 도구는 각 이미지에 대해 세 가지 시나리오를 자동으로 처리합니다: 목표가 원본보다 작으면 압축하여 맞춥니다. 목표가 더 크면 최고 JPEG 품질로 다시 인코딩합니다. 이미지가 이미 목표 크기에 가까우면 원본을 그대로 다운로드합니다. "일괄 적용"으로 하나의 목표로 일괄 처리하거나, "개별" 모드로 파일별 다른 KB 목표를 설정하세요. 여러 결과는 ZIP 다운로드로 제공됩니다.</p>',
    h3why: '왜 이미지를 일괄로 특정 KB로 리사이즈해야 할까요?',
    why: '많은 웹사이트, 정부 포털, 애플리케이션에서 특정 파일 크기 이하의 이미지를 요구합니다. 각 이미지의 품질을 수동으로 조정하는 것은 번거로운 작업입니다. 이 도구는 최대 25개 파일을 한 번에 자동 처리합니다 — 목표 KB를 설정하고 모든 결과를 ZIP으로 다운로드하세요.',
    faqs: [{ q: 'KB로 리사이즈란?', a: 'KB로 이미지 리사이즈란 이미지 파일을 킬로바이트 단위의 특정 파일 크기로 조정하는 것을 의미합니다. 축소의 경우 도구가 이미지를 압축합니다. 확대의 경우 최고 JPEG 품질로 다시 인코딩합니다. 예를 들어, 2 MB 사진을 허용 가능한 시각적 품질을 유지하면서 정확히 200 KB로 줄이는 것입니다.' },{ q: '여러 이미지를 한 번에 리사이즈할 수 있나요?', a: '예 — 최대 25개 이미지(총 200 MB)를 업로드하여 한 번에 리사이즈할 수 있습니다. "일괄 적용"으로 모든 이미지에 같은 KB 목표를 설정하거나, "개별" 모드로 파일별 다른 목표를 설정하세요. 여러 결과는 ZIP으로 다운로드됩니다.' },{ q: '200KB로 줄이려면?', a: '이미지를 업로드하고 목표 KB 필드에 200을 입력한 후 리사이즈를 클릭하세요. 도구가 자동으로 최적의 압축 수준을 찾아 이미지를 가능한 한 200 KB에 가깝게 만듭니다.' },{ q: '목표가 원본보다 크면 어떻게 되나요?', a: '원본 파일보다 큰 목표를 설정하면 도구가 최고 JPEG 품질로 이미지를 저장합니다. 달성 가능한 최대 크기가 경고로 표시됩니다. 이미지 크기는 동일하게 유지됩니다 — 인코딩 품질만 최대화됩니다.' },{ q: '여권 사진에 사용 가능?', a: '예 — 많은 국가에서 여권 및 비자 사진의 파일 크기를 특정 크기 이하로 요구합니다 (예: 100 KB, 200 KB, 300 KB). 사진을 업로드하고 필요한 크기를 입력한 후 다운로드하세요.' },{ q: '최소 크기가 있나요?', a: '최소 크기는 이미지의 크기와 내용에 따라 다릅니다. 매우 상세하거나 큰 이미지는 먼저 크기를 줄이지 않으면 특정 임계값 이하로 압축되지 않을 수 있습니다. 목표가 너무 작으면 도구가 자동으로 이미지 크기를 축소하여 목표에 도달합니다.' },{ q: '지원 포맷은?', a: 'JPG, PNG, WebP 이미지를 업로드할 수 있습니다. 최적의 압축 제어를 위해 출력은 항상 JPEG 형식입니다.' }],
    links: [{ href: '/compress', label: '압축' },{ href: '/resize', label: '크기 조정' },{ href: '/crop', label: '자르기' },{ href: '/passport-photo', label: '여권 사진' }],
  },
  zh: {
    h2a: '如何批量将图片调整为特定KB大小',
    steps: ['<strong>上传图片</strong> — 最多可上传25个JPG、PNG或WebP文件。同一文件可多次添加。','<strong>选择模式</strong> — 使用"全部应用"为所有文件设置一个目标，或切换到"单独设置"为每个文件设置不同的KB目标。','<strong>点击调整</strong> — 工具自动处理每张图片。','<strong>下载</strong> — 单张图片直接下载，多张图片以ZIP下载。'],
    h2b: '最佳免费批量KB图片调整工具 — 精确达到目标文件大小',
    body: '<p>需要100 KB以下的图片来提交表单？或者签证照片需要恰好200 KB？RelahConvert的KB调整工具使用智能二分搜索压缩，尽可能精确地达到您的目标文件大小 — 全部在浏览器中完成。一次可处理最多25张图片，总计200 MB限制。无需上传、无需服务器、完全免费。</p><p>该工具自动为每张图片处理三种场景：如果目标小于原始文件，则压缩以匹配。如果目标更大，则以最高JPEG质量重新编码。如果图片已接近目标大小，则直接下载原始文件。使用"全部应用"以一个目标进行批量处理，或使用"单独设置"模式为每个文件设置不同的KB目标。多个结果以ZIP下载提供。</p>',
    h3why: '为什么要批量按KB调整图片大小？',
    why: '许多网站、政府门户和应用程序要求图片低于特定文件大小。手动调整每张图片的质量是一项繁琐的工作。这个工具可一次自动处理最多25个文件 — 设置目标KB，然后以ZIP下载所有结果。',
    faqs: [{ q: '什么是按KB调整图片？', a: '按KB调整图片大小意味着将图片文件调整到以千字节为单位的特定文件大小。缩小时，工具会压缩图片。增大时，工具以最高JPEG质量重新编码。例如，将一张2 MB的照片缩小到恰好200 KB，同时保持可接受的视觉质量。' },{ q: '可以一次调整多张图片吗？', a: '是的 — 您可以上传最多25张图片（总计200 MB），一次性全部调整。使用"全部应用"为所有图片设置相同的KB目标，或切换到"单独设置"模式为每个文件设置不同的目标。多个结果以ZIP下载。' },{ q: '如何缩小到200KB？', a: '上传您的图片，在目标KB字段中输入200，然后点击调整。工具会自动找到合适的压缩级别，使图片尽可能接近200 KB。' },{ q: '如果目标大于原始文件会怎样？', a: '如果您设置的目标大于原始文件，工具会以最高JPEG质量保存图片。警告将显示可达到的最大大小。图片尺寸保持不变 — 仅编码质量被最大化。' },{ q: '适用于护照和签证照片吗？', a: '是的 — 许多国家要求护照和签证照片低于特定文件大小（例如 100 KB、200 KB、300 KB）。上传您的照片，输入所需大小并下载。' },{ q: '有最小大小吗？', a: '最小值取决于图片的尺寸和内容。非常详细或尺寸较大的图片可能无法在不先缩小尺寸的情况下压缩到某个阈值以下。如果目标太小，工具会自动缩小图片尺寸以达到目标。' },{ q: '支持哪些格式？', a: '您可以上传JPG、PNG和WebP图片。为了实现最佳压缩控制，输出始终为JPEG格式。' }],
    links: [{ href: '/compress', label: '压缩' },{ href: '/resize', label: '调整大小' },{ href: '/crop', label: '裁剪' },{ href: '/passport-photo', label: '证件照' }],
  },
  'zh-TW': {
    h2a: '如何批量將圖片調整為特定KB大小',
    steps: ['<strong>上傳圖片</strong> — 最多可上傳25個JPG、PNG或WebP檔案。同一檔案可多次新增。','<strong>選擇模式</strong> — 使用「全部套用」為所有檔案設定一個目標，或切換到「個別設定」為每個檔案設定不同的KB目標。','<strong>點擊調整</strong> — 工具自動處理每張圖片。','<strong>下載</strong> — 單張圖片直接下載，多張圖片以ZIP下載。'],
    h2b: '最佳免費批量KB圖片調整工具 — 精確達到目標檔案大小',
    body: '<p>需要100 KB以下的圖片來提交表單？或者簽證照片需要恰好200 KB？RelahConvert的KB調整工具使用智慧二分搜尋壓縮，盡可能精確地達到您的目標檔案大小 — 全部在瀏覽器中完成。一次可處理最多25張圖片，總計200 MB限制。無需上傳、無需伺服器、完全免費。</p><p>該工具自動為每張圖片處理三種場景：如果目標小於原始檔案，則壓縮以匹配。如果目標更大，則以最高JPEG品質重新編碼。如果圖片已接近目標大小，則直接下載原始檔案。使用「全部套用」以一個目標進行批量處理，或使用「個別設定」模式為每個檔案設定不同的KB目標。多個結果以ZIP下載提供。</p>',
    h3why: '為什麼要批量按KB調整圖片大小？',
    why: '許多網站、政府入口網站和應用程式要求圖片低於特定檔案大小。手動調整每張圖片的品質是一項繁瑣的工作。這個工具可一次自動處理最多25個檔案 — 設定目標KB，然後以ZIP下載所有結果。',
    faqs: [{ q: '什麼是按KB調整圖片？', a: '按KB調整圖片大小意味著將圖片檔案調整到以千位元組為單位的特定檔案大小。縮小時，工具會壓縮圖片。增大時，工具以最高JPEG品質重新編碼。例如，將一張2 MB的照片縮小到恰好200 KB，同時保持可接受的視覺品質。' },{ q: '可以一次調整多張圖片嗎？', a: '是的 — 您可以上傳最多25張圖片（總計200 MB），一次性全部調整。使用「全部套用」為所有圖片設定相同的KB目標，或切換到「個別設定」模式為每個檔案設定不同的目標。多個結果以ZIP下載。' },{ q: '如何縮小到200KB？', a: '上傳您的圖片，在目標KB欄位中輸入200，然後點擊調整。工具會自動找到合適的壓縮級別，使圖片盡可能接近200 KB。' },{ q: '如果目標大於原始檔案會怎樣？', a: '如果您設定的目標大於原始檔案，工具會以最高JPEG品質儲存圖片。警告將顯示可達到的最大大小。圖片尺寸保持不變 — 僅編碼品質被最大化。' },{ q: '適用於護照和簽證照片嗎？', a: '是的 — 許多國家要求護照和簽證照片低於特定檔案大小（例如 100 KB、200 KB、300 KB）。上傳您的照片，輸入所需大小並下載。' },{ q: '有最小大小嗎？', a: '最小值取決於圖片的尺寸和內容。非常詳細或尺寸較大的圖片可能無法在不先縮小尺寸的情況下壓縮到某個閾值以下。如果目標太小，工具會自動縮小圖片尺寸以達到目標。' },{ q: '支援哪些格式？', a: '您可以上傳JPG、PNG和WebP圖片。為了實現最佳壓縮控制，輸出始終為JPEG格式。' }],
    links: [{ href: '/compress', label: '壓縮' },{ href: '/resize', label: '調整大小' },{ href: '/crop', label: '裁剪' },{ href: '/passport-photo', label: '證件照' }],
  },
  bg: {
    h2a: 'Как пакетно да промените размера на изображения до определени KB',
    steps: [
      '<strong>Качете изображенията си</strong> — щракнете върху „Избор на изображение" или плъзнете и пуснете до 25 JPG, PNG или WebP файла. Можете да добавите един и същ файл няколко пъти.',
      '<strong>Изберете режим</strong> — използвайте „Приложи към всички", за да зададете един целеви KB за всеки файл, или превключете на „Индивидуален", за да зададете различен целеви KB за всяко изображение.',
      '<strong>Натиснете Промени</strong> — инструментът обработва всяко изображение: компресира за достигане на целта, записва с максимално качество, ако целта е по-голяма, или изтегля оригинала, ако вече е близо.',
      '<strong>Изтеглете</strong> — запазете едно изображение или ZIP файл с всички преоразмерени изображения.'
    ],
    h2b: 'Най-добрият безплатен инструмент за пакетно компресиране на изображения до точни KB',
    body: '<p>Нуждаете се от изображение под 100 KB за подаване на формуляр? Или точно 200 KB за снимка за виза? Инструментът „Промяна на размера в KB" на RelahConvert използва интелигентна компресия с двоично търсене, за да достигне целевия размер на файла възможно най-точно — изцяло във вашия браузър. Обработете до 25 изображения наведнъж с лимит от 200 MB. Без качване, без сървър, напълно безплатно.</p><p>Инструментът обработва три сценария автоматично за всяко изображение: ако целевият размер е по-малък от оригинала, компресира до съвпадение. Ако целевият размер е по-голям, прекодира с максимално качество JPEG. Ако изображението вече е близо до целевия размер, изтегля оригинала. Използвайте „Приложи към всички" за пакетна обработка с една цел, или режим „Индивидуален" за различни целеви KB за всеки файл. Множество резултати се доставят като ZIP файл за изтегляне.</p>',
    h3why: 'Защо пакетно да променяте размера на изображенията в KB?',
    why: 'Много уебсайтове, държавни портали и приложения изискват изображения под определен размер на файла. Ръчното коригиране на качеството за всяко изображение е досадно. Този инструмент автоматизира процеса за до 25 файла наведнъж — задайте целевите KB и изтеглете всички резултати в ZIP.',
    faqs: [
      { q: 'Какво е промяна на размер в KB?', a: 'Промяната на размера на изображение в KB означава коригиране на файла на изображението до определен размер, измерен в килобайти. За намаляване инструментът компресира изображението. За увеличаване прекодира с максимално качество JPEG. Например намаляване на снимка от 2 MB до точно 200 KB, като се запазва приемливо визуално качество.' },
      { q: 'Мога ли да променя размера на няколко изображения наведнъж?', a: 'Да — можете да качите до 25 изображения (общо 200 MB) и да промените размера им наведнъж. Използвайте „Приложи към всички" за един и същ целеви KB за всяко изображение, или превключете на „Индивидуален" режим за различна цел за всеки файл. Множество резултати се изтеглят като ZIP.' },
      { q: 'Как да намаля до 200KB?', a: 'Качете изображението си, напишете 200 в полето за целеви KB и натиснете Промени. Инструментът автоматично ще намери подходящото ниво на компресия, за да доближи изображението ви възможно най-близо до 200 KB.' },
      { q: 'Какво се случва, ако целевият размер е по-голям от оригинала?', a: 'Ако зададете целеви размер, по-голям от оригиналния файл, инструментът записва изображението с максимално качество JPEG. Ще се покаже предупреждение с максимално постижимия размер. Размерите на изображението остават същите — само качеството на кодиране се максимизира.' },
      { q: 'Работи ли за паспортни снимки?', a: 'Да — много държави изискват паспортни и визови снимки под определен размер на файла (напр. 100 KB, 200 KB, 300 KB). Качете снимката си, въведете необходимия размер и изтеглете.' },
      { q: 'Има ли минимален размер?', a: 'Минимумът зависи от размерите и съдържанието на изображението. Много детайлни или големи изображения може да не се компресират под определен праг без първо да се намалят размерите. Ако целевият размер е твърде малък, инструментът автоматично ще намали размерите на изображението, за да го достигне.' },
      { q: 'Какви формати се поддържат?', a: 'Можете да качвате JPG, PNG и WebP изображения. Изходът е винаги JPEG за оптимален контрол на компресията.' },
    ],
    links: [{ href: '/compress', label: 'Компресиране' },{ href: '/resize', label: 'Преоразмеряване' },{ href: '/crop', label: 'Изрязване' },{ href: '/passport-photo', label: 'Паспортна снимка' }],
  },
  ca: {
    h2a: 'Com redimensionar imatges per lots a una mida específica en KB',
    steps: [
      '<strong>Pugeu les vostres imatges</strong> — feu clic a „Selecciona imatge" o arrossegueu i deixeu anar fins a 25 fitxers JPG, PNG o WebP. Podeu afegir el mateix fitxer diverses vegades.',
      '<strong>Trieu un mode</strong> — utilitzeu „Aplica a tots" per establir una mida objectiu en KB per a cada fitxer, o canvieu a „Individual" per establir una mida objectiu diferent per imatge.',
      '<strong>Feu clic a Redimensionar</strong> — l\'eina processa cada imatge: comprimint per assolir l\'objectiu, desant amb qualitat màxima si l\'objectiu és més gran, o descarregant l\'original si ja és a prop.',
      '<strong>Descarregueu</strong> — deseu una sola imatge o un fitxer ZIP amb totes les imatges redimensionades.'
    ],
    h2b: 'Millor eina gratuïta per redimensionar per lots imatges a una mida exacta en KB',
    body: '<p>Necessiteu una imatge de menys de 100 KB per enviar un formulari? O exactament 200 KB per a una foto de visat? L\'eina „Redimensionar en KB" de RelahConvert utilitza compressió intel·ligent amb cerca binària per assolir la mida de fitxer objectiu tan precisament com sigui possible — tot dins del vostre navegador. Processeu fins a 25 imatges alhora amb un límit total de 200 MB. Sense pujada, sense servidor, completament gratuït.</p><p>L\'eina gestiona tres escenaris automàticament per a cada imatge: si la mida objectiu és més petita que l\'original, comprimeix per coincidir. Si la mida objectiu és més gran, recodifica amb qualitat JPEG màxima. Si la imatge ja és propera a la mida objectiu, descarrega l\'original. Utilitzeu „Aplica a tots" per al processament per lots amb un objectiu, o el mode „Individual" per establir mides objectiu en KB diferents per fitxer. Els resultats múltiples es lliuren com a descàrrega ZIP.</p>',
    h3why: 'Per què redimensionar imatges per lots a una mida específica en KB?',
    why: 'Molts llocs web, portals governamentals i aplicacions requereixen imatges per sota d\'una mida de fitxer específica. Ajustar manualment la qualitat per a cada imatge és tediós. Aquesta eina automatitza el procés per a fins a 25 fitxers alhora — establiu la mida objectiu en KB i descarregueu tots els resultats en un ZIP.',
    faqs: [
      { q: 'Què és redimensionar imatge en KB?', a: 'Redimensionar una imatge en KB significa ajustar el fitxer de la imatge a una mida de fitxer específica mesurada en kilobytes. Per reduir, l\'eina comprimeix la imatge. Per augmentar, recodifica amb qualitat JPEG màxima. Per exemple, reduir una foto de 2 MB a exactament 200 KB mantenint una qualitat visual acceptable.' },
      { q: 'Puc redimensionar diverses imatges alhora?', a: 'Sí — podeu pujar fins a 25 imatges (200 MB en total) i redimensionar-les totes en un sol lot. Utilitzeu „Aplica a tots" per establir el mateix objectiu en KB per a cada imatge, o canvieu al mode „Individual" per establir un objectiu diferent per fitxer. Els resultats múltiples es descarreguen com a ZIP.' },
      { q: 'Com redueixo una imatge a 200KB?', a: 'Pugeu la vostra imatge, escriviu 200 al camp de KB objectiu i feu clic a Redimensionar. L\'eina trobarà automàticament el nivell de compressió adequat per apropar la imatge el màxim possible a 200 KB.' },
      { q: 'Què passa si la mida objectiu és més gran que l\'original?', a: 'Si establiu una mida objectiu més gran que el fitxer original, l\'eina desa la imatge amb qualitat JPEG màxima. Es mostrarà un avís amb la mida màxima assolible. Les dimensions de la imatge es mantenen iguals — només es maximitza la qualitat de codificació.' },
      { q: 'Funciona per a fotos de passaport i visat?', a: 'Sí — molts països requereixen fotos de passaport i visat per sota d\'una mida de fitxer específica (p. ex. 100 KB, 200 KB, 300 KB). Pugeu la vostra foto, introduïu la mida requerida i descarregueu.' },
      { q: 'Hi ha una mida mínima?', a: 'El mínim depèn de les dimensions i el contingut de la imatge. Imatges molt detallades o grans poden no comprimir-se per sota d\'un cert llindar sense reduir primer les dimensions. Si la mida objectiu és massa petita, l\'eina reduirà automàticament les dimensions de la imatge per assolir-la.' },
      { q: 'Quins formats se suporten?', a: 'Podeu pujar imatges JPG, PNG i WebP. La sortida és sempre JPEG per a un control de compressió òptim.' },
    ],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' },{ href: '/crop', label: 'Retallar' },{ href: '/passport-photo', label: 'Foto passaport' }],
  },
  nl: {
    h2a: 'Hoe afbeeldingen in batch naar een specifieke KB-grootte verkleinen',
    steps: [
      '<strong>Upload je afbeeldingen</strong> — klik op „Selecteer afbeelding" of sleep tot 25 JPG-, PNG- of WebP-bestanden. Je kunt hetzelfde bestand meerdere keren toevoegen.',
      '<strong>Kies een modus</strong> — gebruik „Toepassen op alle" om één doel-KB voor elk bestand in te stellen, of schakel naar „Individueel" om een ander doel-KB per afbeelding in te stellen.',
      '<strong>Klik op Verkleinen</strong> — de tool verwerkt elke afbeelding: comprimeert om het doel te bereiken, slaat op met maximale kwaliteit als het doel groter is, of downloadt het origineel als het al dichtbij is.',
      '<strong>Download</strong> — sla een enkele afbeelding op of een ZIP-bestand met alle verkleinde afbeeldingen.'
    ],
    h2b: 'Beste gratis tool om afbeeldingen in batch naar exacte KB te verkleinen',
    body: '<p>Heb je een afbeelding onder de 100 KB nodig voor het indienen van een formulier? Of precies 200 KB voor een visumfoto? De tool „Verkleinen in KB" van RelahConvert gebruikt slimme binaire-zoekcompressie om je doelbestandsgrootte zo nauwkeurig mogelijk te bereiken — volledig in je browser. Verwerk tot 25 afbeeldingen tegelijk met een totale limiet van 200 MB. Geen upload, geen server, volledig gratis.</p><p>De tool verwerkt drie scenario\'s automatisch voor elke afbeelding: als je doel kleiner is dan het origineel, comprimeert het om overeen te komen. Als het doel groter is, hercodeert het met maximale JPEG-kwaliteit. Als de afbeelding al dicht bij de doelgrootte is, downloadt het het origineel. Gebruik „Toepassen op alle" voor batchverwerking met één doel, of de modus „Individueel" om verschillende doel-KB per bestand in te stellen. Meerdere resultaten worden geleverd als ZIP-download.</p>',
    h3why: 'Waarom afbeeldingen in batch naar een specifieke KB verkleinen?',
    why: 'Veel websites, overheidsportalen en applicaties vereisen afbeeldingen onder een specifieke bestandsgrootte. Handmatig de kwaliteit aanpassen voor elke afbeelding is vervelend. Deze tool automatiseert het proces voor tot 25 bestanden tegelijk — stel je doel-KB in en download alle resultaten in een ZIP.',
    faqs: [
      { q: 'Wat is verkleinen van afbeelding in KB?', a: 'Het verkleinen van een afbeelding in KB betekent het aanpassen van het afbeeldingsbestand naar een specifieke bestandsgrootte gemeten in kilobytes. Voor verkleinen comprimeert de tool de afbeelding. Voor vergroten hercodeert het met maximale JPEG-kwaliteit. Bijvoorbeeld het verkleinen van een foto van 2 MB naar precies 200 KB met behoud van acceptabele visuele kwaliteit.' },
      { q: 'Kan ik meerdere afbeeldingen tegelijk verkleinen?', a: 'Ja — je kunt tot 25 afbeeldingen uploaden (200 MB totaal) en ze allemaal in één batch verkleinen. Gebruik „Toepassen op alle" om hetzelfde doel-KB voor elke afbeelding in te stellen, of schakel naar de modus „Individueel" om een ander doel per bestand in te stellen. Meerdere resultaten worden gedownload als ZIP.' },
      { q: 'Hoe verklein ik een afbeelding naar 200KB?', a: 'Upload je afbeelding, typ 200 in het doel-KB-veld en klik op Verkleinen. De tool vindt automatisch het juiste compressieniveau om je afbeelding zo dicht mogelijk bij 200 KB te krijgen.' },
      { q: 'Wat gebeurt er als mijn doel groter is dan het origineel?', a: 'Als je een doel instelt dat groter is dan je originele bestand, slaat de tool de afbeelding op met maximale JPEG-kwaliteit. Er verschijnt een waarschuwing met de maximaal haalbare grootte. De afbeeldingsafmetingen blijven hetzelfde — alleen de coderingskwaliteit wordt gemaximaliseerd.' },
      { q: 'Werkt het voor paspoort- en visumfoto\'s?', a: 'Ja — veel landen vereisen paspoort- en visumfoto\'s onder een specifieke bestandsgrootte (bijv. 100 KB, 200 KB, 300 KB). Upload je foto, voer de vereiste grootte in en download.' },
      { q: 'Is er een minimumgrootte?', a: 'Het minimum hangt af van de afmetingen en inhoud van de afbeelding. Zeer gedetailleerde of grote afbeeldingen kunnen mogelijk niet onder een bepaalde drempel worden gecomprimeerd zonder eerst de afmetingen te verkleinen. Als het doel te klein is, verkleint de tool automatisch de afbeeldingsafmetingen om het te bereiken.' },
      { q: 'Welke formaten worden ondersteund?', a: 'Je kunt JPG-, PNG- en WebP-afbeeldingen uploaden. De uitvoer is altijd JPEG voor optimale compressiecontrole.' },
    ],
    links: [{ href: '/compress', label: 'Comprimeren' },{ href: '/resize', label: 'Formaat wijzigen' },{ href: '/crop', label: 'Bijsnijden' },{ href: '/passport-photo', label: 'Pasfoto' }],
  },
  el: {
    h2a: 'Πώς να αλλάξετε μαζικά το μέγεθος εικόνων σε συγκεκριμένα KB',
    steps: [
      '<strong>Μεταφορτώστε τις εικόνες σας</strong> — κάντε κλικ στο „Επιλογή εικόνας" ή σύρετε και αποθέστε έως 25 αρχεία JPG, PNG ή WebP. Μπορείτε να προσθέσετε το ίδιο αρχείο πολλές φορές.',
      '<strong>Επιλέξτε λειτουργία</strong> — χρησιμοποιήστε „Εφαρμογή σε όλα" για να ορίσετε έναν στόχο KB για κάθε αρχείο, ή αλλάξτε σε „Ατομικό" για να ορίσετε διαφορετικό στόχο KB ανά εικόνα.',
      '<strong>Κλικ Αλλαγή μεγέθους</strong> — το εργαλείο επεξεργάζεται κάθε εικόνα: συμπιέζοντας για να φτάσει τον στόχο, αποθηκεύοντας σε μέγιστη ποιότητα αν ο στόχος είναι μεγαλύτερος, ή κατεβάζοντας το πρωτότυπο αν είναι ήδη κοντά.',
      '<strong>Λήψη</strong> — αποθηκεύστε μία εικόνα ή ένα αρχείο ZIP με όλες τις εικόνες με αλλαγμένο μέγεθος.'
    ],
    h2b: 'Καλύτερο δωρεάν εργαλείο μαζικής αλλαγής μεγέθους εικόνων σε ακριβή KB',
    body: '<p>Χρειάζεστε εικόνα κάτω από 100 KB για υποβολή φόρμας; Ή ακριβώς 200 KB για φωτογραφία βίζας; Το εργαλείο „Αλλαγή μεγέθους σε KB" του RelahConvert χρησιμοποιεί έξυπνη συμπίεση δυαδικής αναζήτησης για να φτάσει το μέγεθος-στόχο του αρχείου όσο πιο κοντά γίνεται — όλα μέσα στο πρόγραμμα περιήγησής σας. Επεξεργαστείτε έως 25 εικόνες ταυτόχρονα με όριο 200 MB. Χωρίς μεταφόρτωση, χωρίς διακομιστή, εντελώς δωρεάν.</p><p>Το εργαλείο χειρίζεται τρία σενάρια αυτόματα για κάθε εικόνα: αν ο στόχος σας είναι μικρότερος από το πρωτότυπο, συμπιέζει για να ταιριάξει. Αν ο στόχος είναι μεγαλύτερος, επανακωδικοποιεί με μέγιστη ποιότητα JPEG. Αν η εικόνα είναι ήδη κοντά στο μέγεθος-στόχο, κατεβάζει το πρωτότυπο. Χρησιμοποιήστε „Εφαρμογή σε όλα" για μαζική επεξεργασία με έναν στόχο, ή τη λειτουργία „Ατομικό" για να ορίσετε διαφορετικά KB-στόχους ανά αρχείο. Πολλαπλά αποτελέσματα παραδίδονται ως λήψη ZIP.</p>',
    h3why: 'Γιατί μαζική αλλαγή μεγέθους εικόνων σε συγκεκριμένα KB;',
    why: 'Πολλοί ιστότοποι, κρατικές πύλες και εφαρμογές απαιτούν εικόνες κάτω από συγκεκριμένο μέγεθος αρχείου. Η χειροκίνητη ρύθμιση της ποιότητας για κάθε εικόνα είναι κουραστική. Αυτό το εργαλείο αυτοματοποιεί τη διαδικασία για έως 25 αρχεία ταυτόχρονα — ορίστε τα KB-στόχο και κατεβάστε όλα τα αποτελέσματα σε ZIP.',
    faqs: [
      { q: 'Τι είναι η αλλαγή μεγέθους εικόνας σε KB;', a: 'Η αλλαγή μεγέθους εικόνας σε KB σημαίνει προσαρμογή του αρχείου εικόνας σε συγκεκριμένο μέγεθος αρχείου μετρημένο σε kilobyte. Για μείωση, το εργαλείο συμπιέζει την εικόνα. Για αύξηση, επανακωδικοποιεί με μέγιστη ποιότητα JPEG. Για παράδειγμα, μείωση μιας φωτογραφίας 2 MB σε ακριβώς 200 KB διατηρώντας αποδεκτή οπτική ποιότητα.' },
      { q: 'Μπορώ να αλλάξω μέγεθος πολλών εικόνων ταυτόχρονα;', a: 'Ναι — μπορείτε να μεταφορτώσετε έως 25 εικόνες (200 MB συνολικά) και να αλλάξετε μέγεθος όλων μαζί. Χρησιμοποιήστε „Εφαρμογή σε όλα" για τον ίδιο στόχο KB σε κάθε εικόνα, ή αλλάξτε σε λειτουργία „Ατομικό" για διαφορετικό στόχο ανά αρχείο. Πολλαπλά αποτελέσματα κατεβαίνουν ως ZIP.' },
      { q: 'Πώς μειώνω μια εικόνα σε 200KB;', a: 'Μεταφορτώστε την εικόνα σας, πληκτρολογήστε 200 στο πεδίο KB-στόχου και κάντε κλικ στο Αλλαγή μεγέθους. Το εργαλείο θα βρει αυτόματα το σωστό επίπεδο συμπίεσης για να φέρει την εικόνα σας όσο πιο κοντά γίνεται στα 200 KB.' },
      { q: 'Τι συμβαίνει αν ο στόχος μου είναι μεγαλύτερος από το πρωτότυπο;', a: 'Αν ορίσετε στόχο μεγαλύτερο από το αρχικό αρχείο, το εργαλείο αποθηκεύει την εικόνα με μέγιστη ποιότητα JPEG. Θα εμφανιστεί μια προειδοποίηση με το μέγιστο επιτεύξιμο μέγεθος. Οι διαστάσεις της εικόνας παραμένουν ίδιες — μόνο η ποιότητα κωδικοποίησης μεγιστοποιείται.' },
      { q: 'Λειτουργεί για φωτογραφίες διαβατηρίου και βίζας;', a: 'Ναι — πολλές χώρες απαιτούν φωτογραφίες διαβατηρίου και βίζας κάτω από συγκεκριμένο μέγεθος αρχείου (π.χ. 100 KB, 200 KB, 300 KB). Μεταφορτώστε τη φωτογραφία σας, εισάγετε το απαιτούμενο μέγεθος και κατεβάστε.' },
      { q: 'Υπάρχει ελάχιστο μέγεθος;', a: 'Το ελάχιστο εξαρτάται από τις διαστάσεις και το περιεχόμενο της εικόνας. Πολύ λεπτομερείς ή μεγάλες εικόνες μπορεί να μην συμπιεστούν κάτω από ένα ορισμένο κατώφλι χωρίς πρώτα να μειωθούν οι διαστάσεις. Αν ο στόχος είναι πολύ μικρός, το εργαλείο θα μειώσει αυτόματα τις διαστάσεις της εικόνας για να τον επιτύχει.' },
      { q: 'Ποιες μορφές υποστηρίζονται;', a: 'Μπορείτε να μεταφορτώσετε εικόνες JPG, PNG και WebP. Η έξοδος είναι πάντα JPEG για βέλτιστο έλεγχο συμπίεσης.' },
    ],
    links: [{ href: '/compress', label: 'Συμπίεση' },{ href: '/resize', label: 'Αλλαγή μεγέθους' },{ href: '/crop', label: 'Περικοπή' },{ href: '/passport-photo', label: 'Φωτογραφία διαβατηρίου' }],
  },
  hi: {
    h2a: 'बैच में इमेज को विशिष्ट KB आकार में कैसे बदलें',
    steps: [
      '<strong>अपनी छवियाँ अपलोड करें</strong> — "छवि चुनें" पर क्लिक करें या 25 तक JPG, PNG, या WebP फ़ाइलें खींचकर छोड़ें। आप एक ही फ़ाइल कई बार जोड़ सकते हैं।',
      '<strong>मोड चुनें</strong> — "सभी पर लागू करें" का उपयोग करके हर फ़ाइल के लिए एक KB लक्ष्य सेट करें, या "व्यक्तिगत" पर स्विच करके प्रत्येक छवि के लिए अलग KB लक्ष्य सेट करें।',
      '<strong>बदलें पर क्लिक करें</strong> — टूल प्रत्येक छवि को प्रोसेस करता है: लक्ष्य तक पहुँचने के लिए संपीड़ित करता है, लक्ष्य बड़ा होने पर अधिकतम गुणवत्ता पर सहेजता है, या पहले से करीब होने पर मूल डाउनलोड करता है।',
      '<strong>डाउनलोड करें</strong> — एकल छवि या सभी आकार बदली हुई छवियों वाली ZIP फ़ाइल सहेजें।'
    ],
    h2b: 'बैच में सटीक KB आकार में इमेज संपीड़ित करने का सबसे अच्छा मुफ्त टूल',
    body: '<p>फॉर्म जमा करने के लिए 100 KB से कम की छवि चाहिए? या वीज़ा फोटो के लिए ठीक 200 KB? RelahConvert का KB में आकार बदलें टूल स्मार्ट बाइनरी-सर्च संपीड़न का उपयोग करता है ताकि आपके लक्ष्य फ़ाइल आकार को यथासंभव सटीक रूप से प्राप्त किया जा सके — सब कुछ आपके ब्राउज़र में। एक बार में 25 तक छवियों को 200 MB की कुल सीमा के साथ प्रोसेस करें। कोई अपलोड नहीं, कोई सर्वर नहीं, पूरी तरह मुफ्त।</p><p>टूल प्रत्येक छवि के लिए तीन परिदृश्यों को स्वचालित रूप से संभालता है: यदि आपका लक्ष्य मूल से छोटा है, तो यह मिलान के लिए संपीड़ित करता है। यदि लक्ष्य बड़ा है, तो यह अधिकतम JPEG गुणवत्ता पर पुन: एन्कोड करता है। यदि छवि पहले से लक्ष्य आकार के करीब है, तो यह मूल डाउनलोड करता है। एक लक्ष्य के साथ बैच प्रोसेसिंग के लिए "सभी पर लागू करें" या प्रत्येक फ़ाइल के लिए अलग KB लक्ष्य सेट करने के लिए "व्यक्तिगत" मोड का उपयोग करें। एकाधिक परिणाम ZIP डाउनलोड के रूप में दिए जाते हैं।</p>',
    h3why: 'बैच में KB में इमेज का आकार क्यों बदलें?',
    why: 'कई वेबसाइटों, सरकारी पोर्टलों और एप्लिकेशन को एक विशिष्ट फ़ाइल आकार से कम छवियों की आवश्यकता होती है। प्रत्येक छवि के लिए मैन्युअल रूप से गुणवत्ता समायोजित करना थकाऊ है। यह टूल एक बार में 25 तक फ़ाइलों के लिए प्रक्रिया को स्वचालित करता है — अपना लक्ष्य KB सेट करें और सभी परिणाम ZIP में डाउनलोड करें।',
    faqs: [
      { q: 'KB में इमेज आकार बदलना क्या है?', a: 'KB में इमेज का आकार बदलने का अर्थ है छवि फ़ाइल को किलोबाइट में मापी गई एक विशिष्ट फ़ाइल आकार में समायोजित करना। कम करने के लिए, टूल छवि को संपीड़ित करता है। बढ़ाने के लिए, यह अधिकतम JPEG गुणवत्ता पर पुन: एन्कोड करता है। उदाहरण के लिए, स्वीकार्य दृश्य गुणवत्ता बनाए रखते हुए 2 MB की फ़ोटो को ठीक 200 KB तक कम करना।' },
      { q: 'क्या मैं एक बार में कई छवियों का आकार बदल सकता हूँ?', a: 'हाँ — आप 25 तक छवियाँ (कुल 200 MB) अपलोड कर सकते हैं और उन सभी का एक बैच में आकार बदल सकते हैं। हर छवि के लिए समान KB लक्ष्य सेट करने के लिए "सभी पर लागू करें" का उपयोग करें, या प्रत्येक फ़ाइल के लिए अलग लक्ष्य सेट करने के लिए "व्यक्तिगत" मोड पर स्विच करें। एकाधिक परिणाम ZIP के रूप में डाउनलोड होते हैं।' },
      { q: '200KB तक कैसे कम करें?', a: 'अपनी छवि अपलोड करें, लक्ष्य KB फ़ील्ड में 200 टाइप करें और बदलें पर क्लिक करें। टूल स्वचालित रूप से सही संपीड़न स्तर खोजेगा ताकि आपकी छवि 200 KB के यथासंभव करीब पहुँच सके।' },
      { q: 'अगर मेरा लक्ष्य मूल से बड़ा हो तो क्या होगा?', a: 'यदि आप अपनी मूल फ़ाइल से बड़ा लक्ष्य सेट करते हैं, तो टूल छवि को अधिकतम JPEG गुणवत्ता पर सहेजता है। अधिकतम प्राप्त करने योग्य आकार दिखाने वाली एक चेतावनी दिखाई देगी। छवि के आयाम समान रहते हैं — केवल एन्कोडिंग गुणवत्ता अधिकतम की जाती है।' },
      { q: 'क्या यह पासपोर्ट फोटो के लिए काम करता है?', a: 'हाँ — कई देशों को पासपोर्ट और वीज़ा फोटो एक विशिष्ट फ़ाइल आकार से कम चाहिए (जैसे 100 KB, 200 KB, 300 KB)। अपनी फोटो अपलोड करें, आवश्यक आकार दर्ज करें और डाउनलोड करें।' },
      { q: 'क्या न्यूनतम आकार है?', a: 'न्यूनतम छवि के आयामों और सामग्री पर निर्भर करता है। बहुत विस्तृत या बड़ी छवियाँ पहले आयाम कम किए बिना एक निश्चित सीमा से नीचे संपीड़ित नहीं हो सकती हैं। यदि लक्ष्य बहुत छोटा है, तो टूल स्वचालित रूप से छवि के आयाम कम करेगा ताकि उस तक पहुँच सके।' },
      { q: 'कौन से प्रारूप समर्थित हैं?', a: 'आप JPG, PNG और WebP छवियाँ अपलोड कर सकते हैं। इष्टतम संपीड़न नियंत्रण के लिए आउटपुट हमेशा JPEG होता है।' },
    ],
    links: [{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/resize', label: 'आकार बदलें' },{ href: '/crop', label: 'क्रॉप' },{ href: '/passport-photo', label: 'पासपोर्ट फोटो' }],
  },
  id: {
    h2a: 'Cara mengubah ukuran gambar secara massal ke KB tertentu',
    steps: [
      '<strong>Unggah gambar Anda</strong> — klik "Pilih Gambar" atau seret dan lepas hingga 25 file JPG, PNG, atau WebP. Anda dapat menambahkan file yang sama beberapa kali.',
      '<strong>Pilih mode</strong> — gunakan "Terapkan ke Semua" untuk menetapkan satu target KB untuk setiap file, atau beralih ke "Individual" untuk menetapkan target KB berbeda per gambar.',
      '<strong>Klik Ubah Ukuran</strong> — alat memproses setiap gambar: mengompres untuk mencapai target, menyimpan pada kualitas maksimum jika target lebih besar, atau mengunduh aslinya jika sudah mendekati.',
      '<strong>Unduh</strong> — simpan satu gambar atau file ZIP berisi semua gambar yang telah diubah ukurannya.'
    ],
    h2b: 'Alat gratis terbaik untuk mengubah ukuran gambar secara massal ke KB yang tepat',
    body: '<p>Butuh gambar di bawah 100 KB untuk pengiriman formulir? Atau tepat 200 KB untuk foto visa? Alat Ubah Ukuran dalam KB dari RelahConvert menggunakan kompresi pencarian biner yang cerdas untuk mencapai ukuran file target Anda sedekat mungkin — semuanya di dalam browser Anda. Proses hingga 25 gambar sekaligus dengan batas total 200 MB. Tanpa unggah, tanpa server, sepenuhnya gratis.</p><p>Alat ini menangani tiga skenario secara otomatis untuk setiap gambar: jika target Anda lebih kecil dari aslinya, alat mengompres untuk mencocokkan. Jika target lebih besar, alat mengodekan ulang pada kualitas JPEG maksimum. Jika gambar sudah mendekati ukuran target, alat mengunduh aslinya. Gunakan "Terapkan ke Semua" untuk pemrosesan massal dengan satu target, atau mode "Individual" untuk menetapkan target KB berbeda per file. Hasil ganda dikirimkan sebagai unduhan ZIP.</p>',
    h3why: 'Mengapa mengubah ukuran gambar secara massal ke KB tertentu?',
    why: 'Banyak situs web, portal pemerintah, dan aplikasi membutuhkan gambar di bawah ukuran file tertentu. Menyesuaikan kualitas secara manual untuk setiap gambar sangat merepotkan. Alat ini mengotomatiskan prosesnya untuk hingga 25 file sekaligus — tetapkan target KB Anda dan unduh semua hasil dalam ZIP.',
    faqs: [
      { q: 'Apa itu ubah ukuran gambar dalam KB?', a: 'Mengubah ukuran gambar dalam KB berarti menyesuaikan file gambar ke ukuran file tertentu yang diukur dalam kilobyte. Untuk mengurangi, alat mengompres gambar. Untuk menambah, alat mengodekan ulang pada kualitas JPEG maksimum. Misalnya, mengurangi foto 2 MB menjadi tepat 200 KB sambil mempertahankan kualitas visual yang dapat diterima.' },
      { q: 'Bisakah saya mengubah ukuran banyak gambar sekaligus?', a: 'Ya — Anda dapat mengunggah hingga 25 gambar (total 200 MB) dan mengubah ukuran semuanya dalam satu batch. Gunakan "Terapkan ke Semua" untuk menetapkan target KB yang sama untuk setiap gambar, atau beralih ke mode "Individual" untuk menetapkan target berbeda per file. Hasil ganda diunduh sebagai ZIP.' },
      { q: 'Bagaimana cara mengurangi gambar ke 200KB?', a: 'Unggah gambar Anda, ketik 200 di kolom KB target, dan klik Ubah Ukuran. Alat ini akan secara otomatis menemukan tingkat kompresi yang tepat untuk mendapatkan gambar Anda sedekat mungkin dengan 200 KB.' },
      { q: 'Apa yang terjadi jika target saya lebih besar dari aslinya?', a: 'Jika Anda menetapkan target yang lebih besar dari file asli Anda, alat menyimpan gambar pada kualitas JPEG maksimum. Peringatan akan menampilkan ukuran maksimum yang dapat dicapai. Dimensi gambar tetap sama — hanya kualitas pengodean yang dimaksimalkan.' },
      { q: 'Apakah ini berfungsi untuk foto paspor dan visa?', a: 'Ya — banyak negara memerlukan foto paspor dan visa di bawah ukuran file tertentu (mis. 100 KB, 200 KB, 300 KB). Unggah foto Anda, masukkan ukuran yang diperlukan, dan unduh.' },
      { q: 'Apakah ada ukuran minimum?', a: 'Minimum tergantung pada dimensi dan konten gambar. Gambar yang sangat detail atau besar mungkin tidak dapat dikompres di bawah ambang batas tertentu tanpa mengurangi dimensi terlebih dahulu. Jika target terlalu kecil, alat akan secara otomatis memperkecil dimensi gambar untuk mencapainya.' },
      { q: 'Format apa yang didukung?', a: 'Anda dapat mengunggah gambar JPG, PNG, dan WebP. Output selalu JPEG untuk kontrol kompresi yang optimal.' },
    ],
    links: [{ href: '/compress', label: 'Kompres' },{ href: '/resize', label: 'Ubah Ukuran' },{ href: '/crop', label: 'Potong' },{ href: '/passport-photo', label: 'Foto Paspor' }],
  },
  ms: {
    h2a: 'Cara mengubah saiz imej berkelompok ke KB tertentu',
    steps: [
      '<strong>Muat naik imej anda</strong> — klik "Pilih Imej" atau seret dan lepas sehingga 25 fail JPG, PNG atau WebP. Anda boleh menambah fail yang sama beberapa kali.',
      '<strong>Pilih mod</strong> — gunakan "Terapkan kepada Semua" untuk menetapkan satu sasaran KB bagi setiap fail, atau tukar kepada "Individu" untuk menetapkan sasaran KB berbeza bagi setiap imej.',
      '<strong>Klik Ubah Saiz</strong> — alat memproses setiap imej: memampatkan untuk mencapai sasaran, menyimpan pada kualiti maksimum jika sasaran lebih besar, atau memuat turun asal jika sudah hampir.',
      '<strong>Muat turun</strong> — simpan satu imej atau fail ZIP yang mengandungi semua imej yang telah diubah saiz.'
    ],
    h2b: 'Alat percuma terbaik untuk mengubah saiz imej berkelompok ke KB yang tepat',
    body: '<p>Perlukan imej di bawah 100 KB untuk penghantaran borang? Atau tepat 200 KB untuk foto visa? Alat Ubah Saiz dalam KB daripada RelahConvert menggunakan pemampatan carian binari pintar untuk mencapai saiz fail sasaran anda setepat mungkin — semuanya dalam pelayar anda. Proses sehingga 25 imej sekaligus dengan had keseluruhan 200 MB. Tanpa muat naik, tanpa pelayan, percuma sepenuhnya.</p><p>Alat ini mengendalikan tiga senario secara automatik untuk setiap imej: jika sasaran anda lebih kecil daripada asal, ia memampatkan untuk sepadan. Jika sasaran lebih besar, ia mengekod semula pada kualiti JPEG maksimum. Jika imej sudah hampir dengan saiz sasaran, ia memuat turun asal. Gunakan "Terapkan kepada Semua" untuk pemprosesan berkelompok dengan satu sasaran, atau mod "Individu" untuk menetapkan sasaran KB berbeza bagi setiap fail. Hasil berganda dihantar sebagai muat turun ZIP.</p>',
    h3why: 'Mengapa ubah saiz imej berkelompok ke KB tertentu?',
    why: 'Banyak laman web, portal kerajaan dan aplikasi memerlukan imej di bawah saiz fail tertentu. Melaraskan kualiti secara manual untuk setiap imej adalah membosankan. Alat ini mengautomasikan proses untuk sehingga 25 fail sekaligus — tetapkan sasaran KB anda dan muat turun semua hasil dalam ZIP.',
    faqs: [
      { q: 'Apa itu ubah saiz imej dalam KB?', a: 'Mengubah saiz imej dalam KB bermaksud menyesuaikan fail imej ke saiz fail tertentu yang diukur dalam kilobait. Untuk mengurangkan, alat memampatkan imej. Untuk menambah, ia mengekod semula pada kualiti JPEG maksimum. Contohnya, mengurangkan foto 2 MB kepada tepat 200 KB sambil mengekalkan kualiti visual yang boleh diterima.' },
      { q: 'Bolehkah saya mengubah saiz banyak imej sekaligus?', a: 'Ya — anda boleh memuat naik sehingga 25 imej (jumlah 200 MB) dan mengubah saiz semuanya dalam satu kelompok. Gunakan "Terapkan kepada Semua" untuk menetapkan sasaran KB yang sama bagi setiap imej, atau tukar kepada mod "Individu" untuk menetapkan sasaran berbeza bagi setiap fail. Hasil berganda dimuat turun sebagai ZIP.' },
      { q: 'Bagaimana mengurangkan imej ke 200KB?', a: 'Muat naik imej anda, taip 200 dalam medan KB sasaran dan klik Ubah Saiz. Alat ini akan secara automatik mencari tahap pemampatan yang sesuai untuk mendapatkan imej anda sehampir mungkin dengan 200 KB.' },
      { q: 'Apa yang berlaku jika sasaran saya lebih besar daripada asal?', a: 'Jika anda menetapkan sasaran yang lebih besar daripada fail asal anda, alat menyimpan imej pada kualiti JPEG maksimum. Amaran akan menunjukkan saiz maksimum yang boleh dicapai. Dimensi imej kekal sama — hanya kualiti pengekodan yang dimaksimumkan.' },
      { q: 'Adakah ia berfungsi untuk foto pasport dan visa?', a: 'Ya — banyak negara memerlukan foto pasport dan visa di bawah saiz fail tertentu (cth. 100 KB, 200 KB, 300 KB). Muat naik foto anda, masukkan saiz yang diperlukan dan muat turun.' },
      { q: 'Adakah saiz minimum?', a: 'Minimum bergantung pada dimensi dan kandungan imej. Imej yang sangat terperinci atau besar mungkin tidak dapat dimampatkan di bawah ambang tertentu tanpa mengurangkan dimensi terlebih dahulu. Jika sasaran terlalu kecil, alat akan secara automatik mengecilkan dimensi imej untuk mencapainya.' },
      { q: 'Format apa yang disokong?', a: 'Anda boleh memuat naik imej JPG, PNG dan WebP. Output sentiasa JPEG untuk kawalan pemampatan yang optimum.' },
    ],
    links: [{ href: '/compress', label: 'Mampat' },{ href: '/resize', label: 'Ubah Saiz' },{ href: '/crop', label: 'Potong' },{ href: '/passport-photo', label: 'Foto Pasport' }],
  },
  pl: {
    h2a: 'Jak wsadowo zmienić rozmiar obrazów do określonej ilości KB',
    steps: [
      '<strong>Prześlij swoje obrazy</strong> — kliknij „Wybierz obraz" lub przeciągnij i upuść do 25 plików JPG, PNG lub WebP. Możesz dodać ten sam plik wielokrotnie.',
      '<strong>Wybierz tryb</strong> — użyj „Zastosuj do wszystkich", aby ustawić jeden docelowy rozmiar KB dla każdego pliku, lub przełącz na „Indywidualny", aby ustawić inny docelowy rozmiar KB na obraz.',
      '<strong>Kliknij Zmień rozmiar</strong> — narzędzie przetwarza każdy obraz: kompresuje, aby osiągnąć cel, zapisuje w maksymalnej jakości, jeśli cel jest większy, lub pobiera oryginał, jeśli jest już blisko.',
      '<strong>Pobierz</strong> — zapisz pojedynczy obraz lub plik ZIP zawierający wszystkie zmienione obrazy.'
    ],
    h2b: 'Najlepsze darmowe narzędzie do wsadowej zmiany rozmiaru obrazów do dokładnych KB',
    body: '<p>Potrzebujesz obrazu poniżej 100 KB do przesłania formularza? Albo dokładnie 200 KB na zdjęcie wizowe? Narzędzie „Zmień rozmiar w KB" od RelahConvert używa inteligentnej kompresji z wyszukiwaniem binarnym, aby osiągnąć docelowy rozmiar pliku tak dokładnie, jak to możliwe — wszystko w Twojej przeglądarce. Przetwarzaj do 25 obrazów naraz z łącznym limitem 200 MB. Bez przesyłania, bez serwera, całkowicie za darmo.</p><p>Narzędzie automatycznie obsługuje trzy scenariusze dla każdego obrazu: jeśli cel jest mniejszy niż oryginał, kompresuje do dopasowania. Jeśli cel jest większy, ponownie koduje w maksymalnej jakości JPEG. Jeśli obraz jest już zbliżony do rozmiaru docelowego, pobiera oryginał. Użyj „Zastosuj do wszystkich" do przetwarzania wsadowego z jednym celem lub trybu „Indywidualny", aby ustawić różne docelowe KB na plik. Wiele wyników jest dostarczanych jako plik ZIP do pobrania.</p>',
    h3why: 'Dlaczego wsadowo zmieniać rozmiar obrazów do określonych KB?',
    why: 'Wiele stron internetowych, portali rządowych i aplikacji wymaga obrazów poniżej określonego rozmiaru pliku. Ręczne dostosowywanie jakości dla każdego obrazu jest żmudne. To narzędzie automatyzuje ten proces dla do 25 plików naraz — ustaw docelowe KB i pobierz wszystkie wyniki w ZIP.',
    faqs: [
      { q: 'Co to jest zmiana rozmiaru obrazu w KB?', a: 'Zmiana rozmiaru obrazu w KB oznacza dostosowanie pliku obrazu do określonego rozmiaru pliku mierzonego w kilobajtach. W celu zmniejszenia narzędzie kompresuje obraz. W celu zwiększenia ponownie koduje w maksymalnej jakości JPEG. Na przykład zmniejszenie zdjęcia o wielkości 2 MB do dokładnie 200 KB przy zachowaniu akceptowalnej jakości wizualnej.' },
      { q: 'Czy mogę zmienić rozmiar wielu obrazów naraz?', a: 'Tak — możesz przesłać do 25 obrazów (łącznie 200 MB) i zmienić rozmiar ich wszystkich w jednej partii. Użyj „Zastosuj do wszystkich", aby ustawić ten sam docelowy KB dla każdego obrazu, lub przełącz na tryb „Indywidualny", aby ustawić inny cel na plik. Wiele wyników pobieranych jest jako ZIP.' },
      { q: 'Jak zmniejszyć obraz do 200KB?', a: 'Prześlij swój obraz, wpisz 200 w polu docelowych KB i kliknij Zmień rozmiar. Narzędzie automatycznie znajdzie odpowiedni poziom kompresji, aby zbliżyć obraz jak najbardziej do 200 KB.' },
      { q: 'Co się stanie, jeśli mój cel jest większy niż oryginał?', a: 'Jeśli ustawisz cel większy niż oryginalny plik, narzędzie zapisuje obraz w maksymalnej jakości JPEG. Pojawi się ostrzeżenie z maksymalnym osiągalnym rozmiarem. Wymiary obrazu pozostają takie same — maksymalizowana jest tylko jakość kodowania.' },
      { q: 'Czy działa dla zdjęć paszportowych i wizowych?', a: 'Tak — wiele krajów wymaga zdjęć paszportowych i wizowych poniżej określonego rozmiaru pliku (np. 100 KB, 200 KB, 300 KB). Prześlij swoje zdjęcie, wprowadź wymagany rozmiar i pobierz.' },
      { q: 'Czy jest minimalny rozmiar?', a: 'Minimum zależy od wymiarów i zawartości obrazu. Bardzo szczegółowe lub duże obrazy mogą nie skompresować się poniżej pewnego progu bez uprzedniego zmniejszenia wymiarów. Jeśli cel jest zbyt mały, narzędzie automatycznie zmniejszy wymiary obrazu, aby go osiągnąć.' },
      { q: 'Jakie formaty są obsługiwane?', a: 'Możesz przesyłać obrazy JPG, PNG i WebP. Wyjście jest zawsze w formacie JPEG dla optymalnej kontroli kompresji.' },
    ],
    links: [{ href: '/compress', label: 'Kompresuj' },{ href: '/resize', label: 'Zmień rozmiar' },{ href: '/crop', label: 'Przytnij' },{ href: '/passport-photo', label: 'Zdjęcie paszportowe' }],
  },
  sv: {
    h2a: 'Hur man batch-ändrar storlek på bilder till specifika KB',
    steps: [
      '<strong>Ladda upp dina bilder</strong> — klicka på „Välj bild" eller dra och släpp upp till 25 JPG-, PNG- eller WebP-filer. Du kan lägga till samma fil flera gånger.',
      '<strong>Välj ett läge</strong> — använd „Tillämpa på alla" för att ange en mål-KB för varje fil, eller växla till „Individuell" för att ange olika mål-KB per bild.',
      '<strong>Klicka på Ändra storlek</strong> — verktyget bearbetar varje bild: komprimerar för att nå målet, sparar med maximal kvalitet om målet är större, eller laddar ner originalet om det redan är nära.',
      '<strong>Ladda ner</strong> — spara en enskild bild eller en ZIP-fil med alla storleksändrade bilder.'
    ],
    h2b: 'Bästa gratisverktyg för att batch-ändra storlek på bilder till exakta KB',
    body: '<p>Behöver du en bild under 100 KB för en formulärinlämning? Eller exakt 200 KB för ett visumfoto? RelahConverts verktyg „Ändra storlek i KB" använder smart binärsökningskomprimering för att nå din målfilstorlek så nära som möjligt — helt i din webbläsare. Bearbeta upp till 25 bilder samtidigt med en total gräns på 200 MB. Ingen uppladdning, ingen server, helt gratis.</p><p>Verktyget hanterar tre scenarier automatiskt för varje bild: om ditt mål är mindre än originalet komprimeras det för att matcha. Om målet är större omkodas det med maximal JPEG-kvalitet. Om bilden redan är nära målstorleken laddas originalet ner. Använd „Tillämpa på alla" för batchbearbetning med ett mål, eller läget „Individuell" för att ange olika mål-KB per fil. Flera resultat levereras som ZIP-nedladdning.</p>',
    h3why: 'Varför batch-ändra storlek på bilder till specifika KB?',
    why: 'Många webbplatser, myndighetsportaler och applikationer kräver bilder under en specifik filstorlek. Att manuellt justera kvaliteten för varje bild är tråkigt. Det här verktyget automatiserar processen för upp till 25 filer samtidigt — ange dina mål-KB och ladda ner alla resultat i en ZIP.',
    faqs: [
      { q: 'Vad är storleksändring av bild i KB?', a: 'Att ändra storlek på en bild i KB innebär att justera bildfilen till en specifik filstorlek mätt i kilobyte. För att minska komprimerar verktyget bilden. För att öka omkodas den med maximal JPEG-kvalitet. Till exempel att minska ett foto på 2 MB till exakt 200 KB med bibehållen acceptabel visuell kvalitet.' },
      { q: 'Kan jag ändra storlek på flera bilder samtidigt?', a: 'Ja — du kan ladda upp till 25 bilder (totalt 200 MB) och ändra storlek på alla i en batch. Använd „Tillämpa på alla" för att ange samma mål-KB för varje bild, eller växla till läget „Individuell" för att ange olika mål per fil. Flera resultat laddas ner som ZIP.' },
      { q: 'Hur minskar jag en bild till 200KB?', a: 'Ladda upp din bild, skriv 200 i fältet för mål-KB och klicka på Ändra storlek. Verktyget hittar automatiskt rätt komprimeringsnivå för att få din bild så nära 200 KB som möjligt.' },
      { q: 'Vad händer om mitt mål är större än originalet?', a: 'Om du anger ett mål som är större än din originalfil sparar verktyget bilden med maximal JPEG-kvalitet. En varning visar den maximalt uppnåbara storleken. Bildens dimensioner förblir desamma — bara kodningskvaliteten maximeras.' },
      { q: 'Fungerar det för passfoton och visumfoton?', a: 'Ja — många länder kräver pass- och visumfoton under en specifik filstorlek (t.ex. 100 KB, 200 KB, 300 KB). Ladda upp ditt foto, ange den krävda storleken och ladda ner.' },
      { q: 'Finns det en minimistorlek?', a: 'Minimum beror på bildens dimensioner och innehåll. Mycket detaljerade eller stora bilder kanske inte kan komprimeras under en viss tröskel utan att först minska dimensionerna. Om målet är för litet kommer verktyget automatiskt att skala ner bildens dimensioner för att nå det.' },
      { q: 'Vilka format stöds?', a: 'Du kan ladda upp JPG-, PNG- och WebP-bilder. Utdata är alltid JPEG för optimal komprimeringskontroll.' },
    ],
    links: [{ href: '/compress', label: 'Komprimera' },{ href: '/resize', label: 'Ändra storlek' },{ href: '/crop', label: 'Beskär' },{ href: '/passport-photo', label: 'Passfoto' }],
  },
  th: {
    h2a: 'วิธีปรับขนาดรูปภาพแบบกลุ่มเป็น KB เฉพาะ',
    steps: [
      '<strong>อัปโหลดรูปภาพของคุณ</strong> — คลิก "เลือกรูปภาพ" หรือลากและวางไฟล์ JPG, PNG หรือ WebP สูงสุด 25 ไฟล์ คุณสามารถเพิ่มไฟล์เดียวกันได้หลายครั้ง',
      '<strong>เลือกโหมด</strong> — ใช้ "ใช้กับทั้งหมด" เพื่อกำหนด KB เป้าหมายเดียวสำหรับทุกไฟล์ หรือสลับไปที่ "รายบุคคล" เพื่อกำหนด KB เป้าหมายต่างกันต่อรูปภาพ',
      '<strong>คลิกปรับขนาด</strong> — เครื่องมือประมวลผลทุกรูปภาพ: บีบอัดเพื่อให้ได้เป้าหมาย บันทึกที่คุณภาพสูงสุดหากเป้าหมายใหญ่กว่า หรือดาวน์โหลดต้นฉบับหากใกล้เคียงอยู่แล้ว',
      '<strong>ดาวน์โหลด</strong> — บันทึกรูปภาพเดียวหรือไฟล์ ZIP ที่มีรูปภาพที่ปรับขนาดแล้วทั้งหมด'
    ],
    h2b: 'เครื่องมือฟรีที่ดีที่สุดสำหรับปรับขนาดรูปภาพแบบกลุ่มเป็น KB ที่แน่นอน',
    body: '<p>ต้องการรูปภาพต่ำกว่า 100 KB สำหรับการส่งแบบฟอร์ม? หรือพอดี 200 KB สำหรับรูปถ่ายวีซ่า? เครื่องมือ "ปรับขนาดเป็น KB" ของ RelahConvert ใช้การบีบอัดค้นหาแบบไบนารีอัจฉริยะเพื่อให้ได้ขนาดไฟล์เป้าหมายของคุณใกล้เคียงที่สุด — ทั้งหมดในเบราว์เซอร์ของคุณ ประมวลผลสูงสุด 25 รูปภาพพร้อมกันด้วยขีดจำกัดรวม 200 MB ไม่ต้องอัปโหลด ไม่มีเซิร์ฟเวอร์ ฟรีทั้งหมด</p><p>เครื่องมือจัดการสามสถานการณ์โดยอัตโนมัติสำหรับแต่ละรูปภาพ: หากเป้าหมายของคุณเล็กกว่าต้นฉบับ จะบีบอัดให้ตรงกัน หากเป้าหมายใหญ่กว่า จะเข้ารหัสใหม่ที่คุณภาพ JPEG สูงสุด หากรูปภาพใกล้เคียงกับขนาดเป้าหมายอยู่แล้ว จะดาวน์โหลดต้นฉบับ ใช้ "ใช้กับทั้งหมด" สำหรับการประมวลผลแบบกลุ่มด้วยเป้าหมายเดียว หรือโหมด "รายบุคคล" เพื่อกำหนด KB เป้าหมายต่างกันต่อไฟล์ ผลลัพธ์หลายรายการจะถูกส่งมอบเป็นดาวน์โหลด ZIP</p>',
    h3why: 'ทำไมต้องปรับขนาดรูปภาพแบบกลุ่มเป็น KB เฉพาะ?',
    why: 'หลายเว็บไซต์ พอร์ทัลราชการ และแอปพลิเคชันต้องการรูปภาพที่มีขนาดไฟล์ต่ำกว่าที่กำหนด การปรับคุณภาพด้วยตนเองสำหรับแต่ละรูปภาพนั้นน่าเบื่อ เครื่องมือนี้ทำให้กระบวนการเป็นอัตโนมัติสำหรับสูงสุด 25 ไฟล์พร้อมกัน — กำหนด KB เป้าหมายของคุณแล้วดาวน์โหลดผลลัพธ์ทั้งหมดใน ZIP',
    faqs: [
      { q: 'การปรับขนาดรูปภาพเป็น KB คืออะไร?', a: 'การปรับขนาดรูปภาพเป็น KB หมายถึงการปรับไฟล์รูปภาพให้ได้ขนาดไฟล์เฉพาะที่วัดเป็นกิโลไบต์ สำหรับการลดขนาด เครื่องมือจะบีบอัดรูปภาพ สำหรับการเพิ่มขนาด จะเข้ารหัสใหม่ที่คุณภาพ JPEG สูงสุด ตัวอย่างเช่น ลดขนาดรูปถ่าย 2 MB เป็นพอดี 200 KB โดยรักษาคุณภาพภาพที่ยอมรับได้' },
      { q: 'ฉันสามารถปรับขนาดรูปภาพหลายรูปพร้อมกันได้ไหม?', a: 'ได้ — คุณสามารถอัปโหลดสูงสุด 25 รูปภาพ (รวม 200 MB) และปรับขนาดทั้งหมดในครั้งเดียว ใช้ "ใช้กับทั้งหมด" เพื่อกำหนด KB เป้าหมายเดียวกันสำหรับทุกรูปภาพ หรือสลับไปที่โหมด "รายบุคคล" เพื่อกำหนดเป้าหมายต่างกันต่อไฟล์ ผลลัพธ์หลายรายการจะดาวน์โหลดเป็น ZIP' },
      { q: 'ลดรูปภาพเหลือ 200KB ได้อย่างไร?', a: 'อัปโหลดรูปภาพของคุณ พิมพ์ 200 ในช่อง KB เป้าหมาย แล้วคลิกปรับขนาด เครื่องมือจะค้นหาระดับการบีบอัดที่เหมาะสมโดยอัตโนมัติเพื่อให้รูปภาพของคุณใกล้เคียง 200 KB มากที่สุด' },
      { q: 'จะเกิดอะไรขึ้นถ้าเป้าหมายใหญ่กว่าต้นฉบับ?', a: 'หากคุณตั้งเป้าหมายที่ใหญ่กว่าไฟล์ต้นฉบับ เครื่องมือจะบันทึกรูปภาพที่คุณภาพ JPEG สูงสุด จะแสดงคำเตือนขนาดสูงสุดที่สามารถทำได้ มิติของรูปภาพจะยังคงเท่าเดิม — เพียงแค่คุณภาพการเข้ารหัสจะถูกเพิ่มสูงสุด' },
      { q: 'ใช้กับรูปถ่ายพาสปอร์ตและวีซ่าได้ไหม?', a: 'ได้ — หลายประเทศต้องการรูปถ่ายพาสปอร์ตและวีซ่าที่มีขนาดไฟล์ต่ำกว่าที่กำหนด (เช่น 100 KB, 200 KB, 300 KB) อัปโหลดรูปถ่ายของคุณ ป้อนขนาดที่ต้องการ แล้วดาวน์โหลด' },
      { q: 'มีขนาดขั้นต่ำไหม?', a: 'ขั้นต่ำขึ้นอยู่กับขนาดและเนื้อหาของรูปภาพ รูปภาพที่มีรายละเอียดมากหรือขนาดใหญ่อาจไม่สามารถบีบอัดต่ำกว่าเกณฑ์ที่กำหนดได้โดยไม่ลดขนาดก่อน หากเป้าหมายเล็กเกินไป เครื่องมือจะลดขนาดมิติของรูปภาพโดยอัตโนมัติเพื่อให้ได้ตามเป้าหมาย' },
      { q: 'รองรับรูปแบบอะไรบ้าง?', a: 'คุณสามารถอัปโหลดรูปภาพ JPG, PNG และ WebP ได้ ผลลัพธ์เป็น JPEG เสมอเพื่อการควบคุมการบีบอัดที่เหมาะสมที่สุด' },
    ],
    links: [{ href: '/compress', label: 'บีบอัด' },{ href: '/resize', label: 'ปรับขนาด' },{ href: '/crop', label: 'ครอบตัด' },{ href: '/passport-photo', label: 'รูปถ่ายพาสปอร์ต' }],
  },
  tr: {
    h2a: 'Görselleri toplu olarak belirli KB boyutuna nasıl değiştirirsiniz',
    steps: [
      '<strong>Görsellerinizi yükleyin</strong> — "Görsel Seç"e tıklayın veya 25\'e kadar JPG, PNG ya da WebP dosyasını sürükleyip bırakın. Aynı dosyayı birden fazla kez ekleyebilirsiniz.',
      '<strong>Bir mod seçin</strong> — her dosya için tek bir KB hedefi belirlemek için "Tümüne Uygula"yı kullanın veya görsel başına farklı KB hedefi belirlemek için "Bireysel"e geçin.',
      '<strong>Boyutlandır\'a tıklayın</strong> — araç her görseli işler: hedefe ulaşmak için sıkıştırır, hedef daha büyükse maksimum kalitede kaydeder veya zaten yakınsa orijinali indirir.',
      '<strong>İndirin</strong> — tek bir görsel veya tüm boyutlandırılmış görselleri içeren bir ZIP dosyası kaydedin.'
    ],
    h2b: 'Görselleri toplu olarak tam KB boyutuna boyutlandırmak için en iyi ücretsiz araç',
    body: '<p>Form göndermek için 100 KB altında bir görsele mi ihtiyacınız var? Ya da vize fotoğrafı için tam 200 KB mi? RelahConvert\'un KB Olarak Boyutlandır aracı, hedef dosya boyutunuza mümkün olduğunca yakın ulaşmak için akıllı ikili arama sıkıştırması kullanır — tamamen tarayıcınızda. Aynı anda 25\'e kadar görseli 200 MB toplam limitle işleyin. Yükleme yok, sunucu yok, tamamen ücretsiz.</p><p>Araç her görsel için üç senaryoyu otomatik olarak yönetir: hedefiniz orijinalden küçükse eşleşecek şekilde sıkıştırır. Hedef daha büyükse maksimum JPEG kalitesinde yeniden kodlar. Görsel zaten hedef boyuta yakınsa orijinali indirir. Tek bir hedefle toplu işleme için "Tümüne Uygula"yı veya dosya başına farklı KB hedefleri belirlemek için "Bireysel" modunu kullanın. Birden fazla sonuç ZIP indirmesi olarak teslim edilir.</p>',
    h3why: 'Neden görselleri toplu olarak belirli KB\'ye boyutlandırmalı?',
    why: 'Birçok web sitesi, devlet portalı ve uygulama belirli bir dosya boyutunun altında görsel gerektirir. Her görsel için kaliteyi manuel olarak ayarlamak sıkıcıdır. Bu araç süreci aynı anda 25\'e kadar dosya için otomatikleştirir — hedef KB\'nizi belirleyin ve tüm sonuçları ZIP olarak indirin.',
    faqs: [
      { q: 'KB olarak görsel boyutlandırma nedir?', a: 'KB olarak görsel boyutlandırma, görsel dosyasını kilobayt cinsinden ölçülen belirli bir dosya boyutuna ayarlamak anlamına gelir. Küçültmek için araç görseli sıkıştırır. Büyütmek için maksimum JPEG kalitesinde yeniden kodlar. Örneğin, kabul edilebilir görsel kaliteyi koruyarak 2 MB\'lık bir fotoğrafı tam 200 KB\'ye düşürmek.' },
      { q: 'Birden fazla görseli aynı anda boyutlandırabilir miyim?', a: 'Evet — 25\'e kadar görsel (toplam 200 MB) yükleyebilir ve hepsini tek seferde boyutlandırabilirsiniz. Her görsel için aynı KB hedefini belirlemek için "Tümüne Uygula"yı kullanın veya dosya başına farklı hedef belirlemek için "Bireysel" moduna geçin. Birden fazla sonuç ZIP olarak indirilir.' },
      { q: '200KB\'ye nasıl küçültürüm?', a: 'Görselinizi yükleyin, hedef KB alanına 200 yazın ve Boyutlandır\'a tıklayın. Araç, görselinizi 200 KB\'ye mümkün olduğunca yaklaştırmak için doğru sıkıştırma seviyesini otomatik olarak bulacaktır.' },
      { q: 'Hedefim orijinalden büyükse ne olur?', a: 'Orijinal dosyanızdan büyük bir hedef belirlerseniz, araç görseli maksimum JPEG kalitesinde kaydeder. Ulaşılabilecek maksimum boyutu gösteren bir uyarı görüntülenir. Görsel boyutları aynı kalır — yalnızca kodlama kalitesi maksimize edilir.' },
      { q: 'Pasaport ve vize fotoğrafları için çalışır mı?', a: 'Evet — birçok ülke pasaport ve vize fotoğraflarının belirli bir dosya boyutunun altında olmasını gerektirir (ör. 100 KB, 200 KB, 300 KB). Fotoğrafınızı yükleyin, gerekli boyutu girin ve indirin.' },
      { q: 'Minimum boyut var mı?', a: 'Minimum, görselin boyutlarına ve içeriğine bağlıdır. Çok ayrıntılı veya büyük görseller, önce boyutları küçültülmeden belirli bir eşiğin altına sıkıştırılamayabilir. Hedef çok küçükse, araç buna ulaşmak için görsel boyutlarını otomatik olarak küçültecektir.' },
      { q: 'Hangi formatlar destekleniyor?', a: 'JPG, PNG ve WebP görselleri yükleyebilirsiniz. Optimum sıkıştırma kontrolü için çıktı her zaman JPEG\'dir.' },
    ],
    links: [{ href: '/compress', label: 'Sıkıştır' },{ href: '/resize', label: 'Boyutlandır' },{ href: '/crop', label: 'Kırp' },{ href: '/passport-photo', label: 'Vesikalık' }],
  },
  uk: {
    h2a: 'Як пакетно змінити розмір зображень до певної кількості КБ',
    steps: [
      '<strong>Завантажте зображення</strong> — натисніть „Вибрати зображення" або перетягніть до 25 файлів JPG, PNG або WebP. Ви можете додати один і той же файл кілька разів.',
      '<strong>Оберіть режим</strong> — використовуйте „Застосувати до всіх" щоб задати один цільовий розмір КБ для кожного файлу, або перемкніть на „Індивідуальний" щоб задати різний цільовий КБ для кожного зображення.',
      '<strong>Натисніть Змінити</strong> — інструмент обробляє кожне зображення: стискає для досягнення цілі, зберігає з максимальною якістю, якщо ціль більша, або завантажує оригінал, якщо вже близько.',
      '<strong>Завантажте</strong> — збережіть одне зображення або ZIP-файл з усіма зображеннями зі зміненим розміром.'
    ],
    h2b: 'Найкращий безкоштовний інструмент для пакетної зміни розміру зображень до точної кількості КБ',
    body: '<p>Потрібне зображення менше 100 КБ для подання форми? Або точно 200 КБ для фото на візу? Інструмент „Змінити розмір у КБ" від RelahConvert використовує розумне стиснення з бінарним пошуком для досягнення цільового розміру файлу якомога точніше — повністю у вашому браузері. Обробляйте до 25 зображень одночасно з лімітом 200 МБ. Без завантаження, без сервера, повністю безкоштовно.</p><p>Інструмент автоматично обробляє три сценарії для кожного зображення: якщо ваша ціль менша за оригінал, стискає для відповідності. Якщо ціль більша, перекодовує з максимальною якістю JPEG. Якщо зображення вже близьке до цільового розміру, завантажує оригінал. Використовуйте „Застосувати до всіх" для пакетної обробки з однією ціллю, або режим „Індивідуальний" щоб задати різні цільові КБ для кожного файлу. Кілька результатів доставляються як ZIP-завантаження.</p>',
    h3why: 'Навіщо пакетно змінювати розмір зображень до певних КБ?',
    why: 'Багато веб-сайтів, державних порталів та додатків вимагають зображення менше певного розміру файлу. Ручне налаштування якості для кожного зображення — стомлююче. Цей інструмент автоматизує процес для до 25 файлів одночасно — задайте цільові КБ та завантажте всі результати у ZIP.',
    faqs: [
      { q: 'Що таке зміна розміру зображення в КБ?', a: 'Зміна розміру зображення в КБ означає коригування файлу зображення до певного розміру файлу, виміряного в кілобайтах. Для зменшення інструмент стискає зображення. Для збільшення перекодовує з максимальною якістю JPEG. Наприклад, зменшення фото розміром 2 МБ до точно 200 КБ із збереженням прийнятної візуальної якості.' },
      { q: 'Чи можу я змінити розмір кількох зображень одночасно?', a: 'Так — ви можете завантажити до 25 зображень (загалом 200 МБ) та змінити розмір усіх одночасно. Використовуйте „Застосувати до всіх" щоб задати однаковий цільовий КБ для кожного зображення, або перемкніть на режим „Індивідуальний" для різних цілей по файлах. Кілька результатів завантажуються як ZIP.' },
      { q: 'Як зменшити зображення до 200КБ?', a: 'Завантажте зображення, введіть 200 у поле цільових КБ та натисніть Змінити. Інструмент автоматично знайде правильний рівень стиснення, щоб наблизити зображення до 200 КБ якомога точніше.' },
      { q: 'Що станеться, якщо моя ціль більша за оригінал?', a: 'Якщо ви встановите ціль, більшу за ваш оригінальний файл, інструмент зберігає зображення з максимальною якістю JPEG. З\'явиться попередження з максимально досяжним розміром. Розміри зображення залишаються такими ж — максимізується лише якість кодування.' },
      { q: 'Чи працює для фото на паспорт та візу?', a: 'Так — багато країн вимагають фото на паспорт та візу менше певного розміру файлу (напр. 100 КБ, 200 КБ, 300 КБ). Завантажте своє фото, введіть необхідний розмір та завантажте.' },
      { q: 'Чи є мінімальний розмір?', a: 'Мінімум залежить від розмірів та вмісту зображення. Дуже деталізовані або великі зображення можуть не стиснутися нижче певного порогу без попереднього зменшення розмірів. Якщо ціль занадто мала, інструмент автоматично зменшить розміри зображення, щоб досягти її.' },
      { q: 'Які формати підтримуються?', a: 'Ви можете завантажувати зображення JPG, PNG та WebP. Вихідний формат завжди JPEG для оптимального контролю стиснення.' },
    ],
    links: [{ href: '/compress', label: 'Стиснути' },{ href: '/resize', label: 'Змінити розмір' },{ href: '/crop', label: 'Обрізати' },{ href: '/passport-photo', label: 'Фото на паспорт' }],
  },
  vi: {
    h2a: 'Cách thay đổi kích thước ảnh hàng loạt thành KB cụ thể',
    steps: [
      '<strong>Tải ảnh lên</strong> — nhấp vào "Chọn ảnh" hoặc kéo và thả tối đa 25 tệp JPG, PNG hoặc WebP. Bạn có thể thêm cùng một tệp nhiều lần.',
      '<strong>Chọn chế độ</strong> — sử dụng "Áp dụng cho tất cả" để đặt một mục tiêu KB cho mọi tệp, hoặc chuyển sang "Riêng lẻ" để đặt mục tiêu KB khác nhau cho mỗi ảnh.',
      '<strong>Nhấp Thay đổi kích thước</strong> — công cụ xử lý từng ảnh: nén để đạt mục tiêu, lưu ở chất lượng tối đa nếu mục tiêu lớn hơn, hoặc tải xuống bản gốc nếu đã gần.',
      '<strong>Tải về</strong> — lưu một ảnh đơn hoặc tệp ZIP chứa tất cả ảnh đã thay đổi kích thước.'
    ],
    h2b: 'Công cụ miễn phí tốt nhất để thay đổi kích thước ảnh hàng loạt đúng KB',
    body: '<p>Cần ảnh dưới 100 KB để nộp biểu mẫu? Hoặc đúng 200 KB cho ảnh thị thực? Công cụ Thay đổi kích thước theo KB của RelahConvert sử dụng nén tìm kiếm nhị phân thông minh để đạt kích thước tệp mục tiêu của bạn chính xác nhất có thể — tất cả trong trình duyệt của bạn. Xử lý tối đa 25 ảnh cùng lúc với giới hạn tổng 200 MB. Không cần tải lên, không có máy chủ, hoàn toàn miễn phí.</p><p>Công cụ xử lý ba tình huống tự động cho mỗi ảnh: nếu mục tiêu của bạn nhỏ hơn bản gốc, nó nén để khớp. Nếu mục tiêu lớn hơn, nó mã hóa lại ở chất lượng JPEG tối đa. Nếu ảnh đã gần kích thước mục tiêu, nó tải xuống bản gốc. Sử dụng "Áp dụng cho tất cả" để xử lý hàng loạt với một mục tiêu, hoặc chế độ "Riêng lẻ" để đặt mục tiêu KB khác nhau cho mỗi tệp. Nhiều kết quả được giao dưới dạng tải xuống ZIP.</p>',
    h3why: 'Tại sao cần thay đổi kích thước ảnh hàng loạt theo KB?',
    why: 'Nhiều trang web, cổng chính phủ và ứng dụng yêu cầu ảnh dưới kích thước tệp cụ thể. Điều chỉnh chất lượng thủ công cho từng ảnh rất tẻ nhạt. Công cụ này tự động hóa quy trình cho tối đa 25 tệp cùng lúc — đặt KB mục tiêu của bạn và tải về tất cả kết quả trong ZIP.',
    faqs: [
      { q: 'Thay đổi kích thước ảnh theo KB là gì?', a: 'Thay đổi kích thước ảnh theo KB có nghĩa là điều chỉnh tệp ảnh đến kích thước tệp cụ thể được đo bằng kilobyte. Để giảm, công cụ nén ảnh. Để tăng, nó mã hóa lại ở chất lượng JPEG tối đa. Ví dụ, giảm ảnh 2 MB xuống đúng 200 KB trong khi vẫn duy trì chất lượng hình ảnh chấp nhận được.' },
      { q: 'Tôi có thể thay đổi kích thước nhiều ảnh cùng lúc không?', a: 'Có — bạn có thể tải lên tối đa 25 ảnh (tổng 200 MB) và thay đổi kích thước tất cả trong một lần. Sử dụng "Áp dụng cho tất cả" để đặt cùng mục tiêu KB cho mỗi ảnh, hoặc chuyển sang chế độ "Riêng lẻ" để đặt mục tiêu khác nhau cho mỗi tệp. Nhiều kết quả được tải xuống dưới dạng ZIP.' },
      { q: 'Làm sao giảm ảnh xuống 200KB?', a: 'Tải ảnh lên, gõ 200 vào trường KB mục tiêu và nhấp Thay đổi kích thước. Công cụ sẽ tự động tìm mức nén phù hợp để đưa ảnh của bạn gần 200 KB nhất có thể.' },
      { q: 'Điều gì xảy ra nếu mục tiêu lớn hơn bản gốc?', a: 'Nếu bạn đặt mục tiêu lớn hơn tệp gốc, công cụ lưu ảnh ở chất lượng JPEG tối đa. Một cảnh báo sẽ hiển thị kích thước tối đa có thể đạt được. Kích thước ảnh giữ nguyên — chỉ chất lượng mã hóa được tối đa hóa.' },
      { q: 'Có dùng được cho ảnh hộ chiếu và thị thực không?', a: 'Có — nhiều quốc gia yêu cầu ảnh hộ chiếu và thị thực dưới kích thước tệp cụ thể (ví dụ: 100 KB, 200 KB, 300 KB). Tải ảnh của bạn lên, nhập kích thước yêu cầu và tải về.' },
      { q: 'Có kích thước tối thiểu không?', a: 'Kích thước tối thiểu phụ thuộc vào kích thước và nội dung của ảnh. Ảnh rất chi tiết hoặc lớn có thể không nén được dưới ngưỡng nhất định mà không giảm kích thước trước. Nếu mục tiêu quá nhỏ, công cụ sẽ tự động thu nhỏ kích thước ảnh để đạt được.' },
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
const applyAllLbl = t.rik_apply_all || 'Apply to All'
const individualLbl = t.rik_individual || 'Individual'
const addMoreLbl = t.add_more || 'Add More'
const downloadZipLbl = t.download_zip || 'Download ZIP'

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:400; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.rik_desc || 'Batch resize images to an exact file size in KB. Free, private, browser-only.'}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${selectLbl}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <div id="controlsArea" style="display:none; margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
        <label style="font-size:13px; font-weight:600; color:#2C1810;">${rikTargetLbl}</label>
        <div style="display:flex; gap:4px; margin-left:auto;">
          <button id="modeAllBtn" style="padding:4px 10px; border:1.5px solid #C84B31; border-radius:6px 0 0 6px; background:#C84B31; color:#fff; font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${applyAllLbl}</button>
          <button id="modeIndBtn" style="padding:4px 10px; border:1.5px solid #DDD5C8; border-radius:0 6px 6px 0; background:#fff; color:#2C1810; font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${individualLbl}</button>
        </div>
      </div>
      <div id="globalTarget" style="display:flex; gap:10px; align-items:center;">
        <input type="number" id="targetKB" min="1" max="99999" value="200" style="width:120px; padding:10px 14px; border:1.5px solid #DDD5C8; border-radius:8px; font-size:15px; font-family:'DM Sans',sans-serif; color:#2C1810; outline:none;" />
        <span style="font-size:13px; color:#7A6A5A;">KB</span>
      </div>
    </div>
    <button id="resizeBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${rikResizeBtn}</button>
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

// ── Constants ───────────────────────────────────────────────────────────────
const MAX_FILES = 25
const MAX_TOTAL_BYTES = 200 * 1024 * 1024

// ── DOM refs ────────────────────────────────────────────────────────────────
const fileInput      = document.getElementById('fileInput')
const previewGrid    = document.getElementById('previewGrid')
const controlsArea   = document.getElementById('controlsArea')
const globalTarget   = document.getElementById('globalTarget')
const resizeBtn      = document.getElementById('resizeBtn')
const targetKBInput  = document.getElementById('targetKB')
const resultBar      = document.getElementById('resultBar')
const downloadLink   = document.getElementById('downloadLink')
const nextSteps      = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')
const warning        = document.getElementById('warning')
const modeAllBtn     = document.getElementById('modeAllBtn')
const modeIndBtn     = document.getElementById('modeIndBtn')

let selectedFiles = []
let previewUrls = []
let resultBlobs = []
let currentDownloadUrl = null
let isApplyAll = true

// ── Mode toggle ─────────────────────────────────────────────────────────────
modeAllBtn.addEventListener('click', () => {
  isApplyAll = true
  modeAllBtn.style.background = '#C84B31'; modeAllBtn.style.color = '#fff'; modeAllBtn.style.borderColor = '#C84B31'
  modeIndBtn.style.background = '#fff'; modeIndBtn.style.color = '#2C1810'; modeIndBtn.style.borderColor = '#DDD5C8'
  globalTarget.style.display = 'flex'
  document.querySelectorAll('.kb-input').forEach(el => el.style.display = 'none')
  document.querySelectorAll('.kb-label').forEach(el => el.style.display = 'none')
})
modeIndBtn.addEventListener('click', () => {
  isApplyAll = false
  modeIndBtn.style.background = '#C84B31'; modeIndBtn.style.color = '#fff'; modeIndBtn.style.borderColor = '#C84B31'
  modeAllBtn.style.background = '#fff'; modeAllBtn.style.color = '#2C1810'; modeAllBtn.style.borderColor = '#DDD5C8'
  globalTarget.style.display = 'none'
  document.querySelectorAll('.kb-input').forEach(el => el.style.display = 'inline-block')
  document.querySelectorAll('.kb-label').forEach(el => el.style.display = 'inline')
})

// ── File handling ───────────────────────────────────────────────────────────
function addFiles(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
  if (!arr.length) return

  const total = selectedFiles.length + arr.length
  if (total > MAX_FILES) {
    showWarning((t.warn_files || 'Maximum') + ' ' + MAX_FILES + ' ' + (t.warn_files_suffix || 'files.'))
    return
  }
  const totalSize = selectedFiles.reduce((s, f) => s + f.size, 0) + arr.reduce((s, f) => s + f.size, 0)
  if (totalSize > MAX_TOTAL_BYTES) {
    showWarning(t.warn_too_large || 'Total file size exceeds 200 MB limit.')
    return
  }

  arr.forEach(f => selectedFiles.push(f))
  renderPreviews()
  setIdle()
}

function removeFile(idx) {
  if (previewUrls[idx]) URL.revokeObjectURL(previewUrls[idx])
  selectedFiles.splice(idx, 1)
  renderPreviews()
  if (!selectedFiles.length) {
    setDisabled()
    controlsArea.style.display = 'none'
    resultBar.style.display = 'none'
    downloadLink.style.display = 'none'
    nextSteps.style.display = 'none'
  }
}

function renderPreviews() {
  // Revoke old URLs
  previewUrls.forEach(u => { if (u) URL.revokeObjectURL(u) })
  previewUrls = selectedFiles.map(f => URL.createObjectURL(f))

  previewGrid.innerHTML = selectedFiles.map((f, i) => `
    <div class="preview-card" style="display:inline-block; width:calc(33.33% - 8px); vertical-align:top; margin-bottom:10px;">
      <img src="${previewUrls[i]}" alt="preview" />
      <button class="remove-btn" data-idx="${i}">&times;</button>
      <div class="fname">${f.name} &mdash; ${formatSize(f.size)}</div>
      <div style="padding:0 8px 6px;">
        <input type="number" class="kb-input" data-idx="${i}" min="1" max="99999" value="200" style="${isApplyAll ? 'display:none' : ''}" />
        <span class="kb-label" style="font-size:11px; color:#7A6A5A; ${isApplyAll ? 'display:none' : ''}">KB</span>
      </div>
    </div>
  `).join('') + `<button id="addMoreBtn">+ ${addMoreLbl}</button>`

  previewGrid.style.display = 'block'
  controlsArea.style.display = 'block'
  resizeBtn.style.display = 'block'

  // Hide mode toggle for single file
  const modeWrap = modeAllBtn.parentElement
  if (selectedFiles.length <= 1) {
    modeWrap.style.display = 'none'
    globalTarget.style.display = 'flex'
  } else {
    modeWrap.style.display = 'flex'
  }

  // Wire up remove buttons
  previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFile(parseInt(btn.dataset.idx)))
  })
  // Wire up add more
  document.getElementById('addMoreBtn').addEventListener('click', () => fileInput.click())
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) addFiles(fileInput.files)
  fileInput.value = ''
})

document.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation() })
document.addEventListener('drop', e => {
  e.preventDefault(); e.stopPropagation()
  const files = e.dataTransfer.files
  if (files && files.length) addFiles(files)
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
async function processOneFile(file, targetKB) {
  const targetBytes = targetKB * 1024
  const originalKB = file.size / 1024
  const imgUrl = URL.createObjectURL(file)

  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Image load failed'))
      i.src = imgUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d').drawImage(img, 0, 0)
    const baseName = file.name.replace(/\.[^.]+$/, '')

    let blob, outName, warn = null
    if (targetKB >= originalKB * 0.95) {
      if (Math.abs(targetKB - originalKB) / originalKB < 0.05) {
        blob = file
        outName = file.name
        warn = 'close'
      } else {
        blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 1.0))
        outName = baseName + '_maxq.jpg'
        warn = 'larger'
      }
    } else {
      const minBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.01))
      blob = await compressToTargetSize(canvas, targetKB)
      outName = baseName + '_' + targetKB + 'kb.jpg'
      if (minBlob.size > targetBytes) warn = 'small'
    }
    return { blob, name: outName, originalSize: file.size, type: blob.type || 'image/jpeg', warn }
  } finally {
    URL.revokeObjectURL(imgUrl)
  }
}

resizeBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return

  // Gather targets
  const targets = selectedFiles.map((f, i) => {
    if (isApplyAll) return parseInt(targetKBInput.value) || 200
    const inp = previewGrid.querySelector(`.kb-input[data-idx="${i}"]`)
    return inp ? (parseInt(inp.value) || 200) : 200
  })

  setResizing()
  resultBlobs = []
  let totalOriginal = 0, totalOutput = 0

  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      resizeBtn.textContent = rikResizingBtn + ` (${i + 1}/${selectedFiles.length})`
      const result = await processOneFile(selectedFiles[i], targets[i])
      resultBlobs.push(result)
      totalOriginal += result.originalSize
      totalOutput += result.blob.size
    }

    // Show warnings if any
    const warns = resultBlobs.filter(r => r.warn)
    if (warns.length) {
      const hasLarger = warns.some(r => r.warn === 'larger')
      const hasClose = warns.some(r => r.warn === 'close')
      const hasSmall = warns.some(r => r.warn === 'small')
      if (hasLarger) showWarning(t.rik_warn_larger || 'Target larger than original \u2014 saved at maximum quality.')
      else if (hasClose) showWarning(t.rik_warn_close || 'Image already close to target size.')
      else if (hasSmall) showWarning(t.rik_warn_small || 'Target too small for these dimensions \u2014 image was scaled down.')
    }

    showResultBar(totalOriginal, totalOutput)

    if (resultBlobs.length === 1) {
      showDownload(resultBlobs[0].name, resultBlobs[0].blob)
    } else {
      // ZIP multiple results — prefix with index to avoid duplicate names
      const zip = new JSZip()
      resultBlobs.forEach((r, i) => zip.file((i + 1) + '_' + r.name, r.blob))
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      showDownload('resized-images.zip', zipBlob)
    }
  } catch (e) {
    alert('Error: ' + e.message)
  }
  setIdle()
})

// ── UI helpers ──────────────────────────────────────────────────────────────
function setDisabled() { resizeBtn.disabled = true; resizeBtn.textContent = rikResizeBtn; resizeBtn.style.background = '#C4B8A8'; resizeBtn.style.cursor = 'not-allowed'; resizeBtn.style.opacity = '0.7' }
function setIdle() { if (!selectedFiles.length) { setDisabled(); return } resizeBtn.disabled = false; resizeBtn.textContent = rikResizeBtn; resizeBtn.style.background = '#C84B31'; resizeBtn.style.cursor = 'pointer'; resizeBtn.style.opacity = '1' }
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
  const plural = selectedFiles.length > 1 ? (t.compress_result_plural || 'Total') : ''
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
        <p class="result-saved">${plural} ${pct}% ${changeLbl}</p>
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
  downloadLink.textContent = selectedFiles.length > 1 ? downloadZipLbl : dlLabel
  downloadLink.style.display = 'block';if(window.showReviewPrompt)window.showReviewPrompt()
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
    const files = records.map(r => new File([r.blob], r.name, { type: r.type }))
    addFiles(files)
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
      if (resultBlobs.length) {
        try {
          await saveFilesToIDB(resultBlobs.map(r => ({ blob: r.blob, name: r.name, type: r.type })))
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
