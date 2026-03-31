import { injectHeader } from './core/header.js'
import JSZip from 'jszip'
import { formatSize, totalBytes, sanitizeBaseName, uniqueName, LIMITS} from './core/utils.js'
import { getT , getLang, localHref, injectHreflang, injectFaqSchema} from './core/i18n.js'
injectHreflang('compress')

const bg = '#F2F2F2'
const t = getT()


if (document.head) {
  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:var(--bg-page);`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    #compressBtn:not(:disabled):hover { background: var(--accent-hover) !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #compressBtn { transition: all 0.18s ease; }
    #downloadLink:hover { background: var(--btn-dark) !important; color: var(--text-on-dark-btn) !important; }
    #downloadLink { transition: all 0.18s ease; }
    .preview-card { background:var(--bg-card); border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); position:relative; }
    .preview-card img { width:100%; height:120px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:var(--accent); }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #addMoreBtn:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
    .result-bar { background:var(--bg-card); border-radius:14px; padding:20px 24px; box-shadow:0 2px 12px rgba(0,0,0,0.07); display:flex; align-items:center; gap:24px; }
    .savings-circle { flex-shrink:0; }
    .savings-circle svg { transform: rotate(-90deg); }
    .savings-circle .circle-bg { fill:none; stroke:var(--bg-surface); stroke-width:8; }
    .savings-circle .circle-fill { fill:none; stroke:var(--accent); stroke-width:8; stroke-linecap:round; stroke-dasharray:226; transition: stroke-dashoffset 1s ease; }
    .circle-label { font-family:'Fraunces',serif; font-weight:900; font-size:15px; color:var(--text-primary); text-anchor:middle; dominant-baseline:middle; }
    .result-stats { flex:1; }
    .result-saved { font-size:14px; color:var(--text-primary); margin:0 0 4px; font-weight:400; }
    .result-sizes { font-size:13px; color:var(--text-tertiary); display:flex; align-items:center; gap:8px; }
    .result-arrow { color:var(--accent); font-size:16px; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid var(--border-light); font-size:13px; font-weight:500; color:var(--text-primary); text-decoration:none; background:var(--bg-card); cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:var(--accent); color:var(--accent); }
    .seo-section { max-width:700px; margin:0 auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif; }
    .seo-section h2 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:var(--text-primary); margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section h3 { font-family:'Fraunces',serif; font-size:17px; font-weight:700; color:var(--text-primary); margin:24px 0 8px; letter-spacing:-0.01em; }
    .seo-section p { font-size:14px; color:var(--text-secondary); line-height:1.8; margin:0 0 12px; }
    .seo-section ol { padding-left:20px; margin:0 0 12px; }
    .seo-section ol li { font-size:14px; color:var(--text-secondary); line-height:1.8; margin-bottom:6px; }
    .seo-section .faq-item { background:var(--bg-card); border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:var(--text-primary); margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
    .seo-section .internal-links { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
    .seo-section .internal-links a { padding:8px 16px; border-radius:8px; border:1.5px solid var(--border-light); font-size:13px; font-weight:500; color:var(--text-primary); text-decoration:none; background:var(--bg-card); transition:all 0.15s; }
    .seo-section .internal-links a:hover { border-color:var(--accent); color:var(--accent); }
    .seo-divider { border:none; border-top:1px solid var(--border); margin:0 auto 40px; max-width:700px; }
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
    body: `<p>La plupart des outils de compression en ligne téléchargent vos images sur un serveur distant, les traitent, puis vous les renvoient. RelahConvert fonctionne différemment. La compression se fait entièrement dans votre navigateur grâce au traitement local. Vos images ne quittent jamais votre appareil — aucun téléchargement, aucun stockage serveur, aucun compte, entièrement gratuit.</p><p>Que vous compressiez des photos de produits, réduisiez la taille des images pour les réseaux sociaux, optimisiez les ressources d'un site web ou rendiez des fichiers plus légers pour les envoyer par e-mail — cet outil s'en charge instantanément et en toute confidentialité.</p>`,
    h3why: 'Pourquoi compresser les images ?', why: 'Les fichiers d\'images volumineux ralentissent les sites web, prennent plus de temps à télécharger et utilisent un espace de stockage inutile. La compression réduit la taille des fichiers tout en préservant la qualité visuelle — rendant votre site plus rapide et améliorant vos performances SEO.',
    faqs: [{ q: 'Comment compresser une image sans perdre en qualité ?', a: 'Pour la plupart des images, une qualité de 75 à 85 % produit des fichiers qui semblent identiques à l\'original pour une fraction de la taille. La différence est imperceptible à l\'œil humain à ces réglages.' },{ q: 'Quel est le meilleur compresseur d\'images gratuit qui ne télécharge pas les fichiers ?', a: 'RelahConvert compresse les images entièrement dans votre navigateur sans aucun téléchargement vers un serveur. Vos fichiers ne quittent jamais votre appareil.' },{ q: 'Puis-je compresser plusieurs images à la fois ?', a: 'Oui — sélectionnez plusieurs images et elles seront compressées en lot. Les fichiers multiples sont livrés en téléchargement ZIP.' },{ q: 'Quels formats d\'image sont pris en charge ?', a: 'RelahConvert prend en charge la compression JPG, PNG et WebP. Les fichiers PNG sont convertis en JPG lors de la compression pour une réduction maximale de la taille.' },{ q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement dans votre navigateur. Vos images ne sont ni téléchargées sur un serveur, ni stockées, ni partagées avec qui que ce soit.' }],
    links: [{ href: '/resize', label: 'Redimensionner' },{ href: '/jpg-to-png', label: 'JPG en PNG' },{ href: '/jpg-to-webp', label: 'JPG en WebP' },{ href: '/png-to-jpg', label: 'PNG en JPG' }],
  },
  es: {
    h2a: 'Cómo comprimir imágenes sin subir archivos',
    steps: ['<strong>Selecciona tus imágenes</strong> — haz clic o arrastra archivos JPG, PNG o WebP.','<strong>Haz clic en Comprimir</strong> — la compresión se ejecuta instantáneamente en tu navegador.','<strong>Descarga tu resultado</strong> — guarda la imagen comprimida en tu dispositivo.'],
    h2b: 'El mejor compresor de imágenes gratuito sin subida',
    body: `<p>La mayoría de las herramientas de compresión en línea suben tus imágenes a un servidor remoto, las procesan y luego te las devuelven. RelahConvert funciona de manera diferente. La compresión ocurre completamente en tu navegador mediante procesamiento local. Tus imágenes nunca salen de tu dispositivo — sin subidas, sin almacenamiento en servidores, sin cuentas, completamente gratis.</p><p>Ya sea que estés comprimiendo fotos de productos, reduciendo el tamaño de imágenes para redes sociales, optimizando recursos de tu sitio web o haciendo archivos más pequeños para compartir por correo electrónico — esta herramienta lo maneja de forma instantánea y privada.</p>`,
    h3why: '¿Por qué comprimir imágenes?', why: 'Los archivos de imagen grandes ralentizan los sitios web, tardan más en subirse y usan almacenamiento innecesario. Comprimir imágenes reduce el tamaño del archivo preservando la calidad visual — haciendo tu sitio web más rápido y mejorando tu rendimiento SEO.',
    faqs: [{ q: '¿Cómo comprimo una imagen sin perder calidad?', a: 'Para la mayoría de las imágenes, una calidad del 75–85% produce archivos que se ven idénticos al original a una fracción del tamaño. La diferencia es imperceptible para el ojo humano con estos ajustes.' },{ q: '¿Cuál es el mejor compresor de imágenes gratuito que no sube archivos?', a: 'RelahConvert comprime imágenes completamente en tu navegador sin ninguna subida al servidor. Tus archivos nunca salen de tu dispositivo.' },{ q: '¿Puedo comprimir varias imágenes a la vez?', a: 'Sí — selecciona varias imágenes y se comprimirán en lote. Los archivos múltiples se entregan como descarga ZIP.' },{ q: '¿Qué formatos de imagen son compatibles?', a: 'RelahConvert es compatible con la compresión de JPG, PNG y WebP. Los archivos PNG se convierten a JPG durante la compresión para una reducción máxima del tamaño.' },{ q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente en tu navegador. Tus imágenes no se suben a ningún servidor, ni se almacenan, ni se comparten con nadie.' }],
    links: [{ href: '/resize', label: 'Redimensionar' },{ href: '/jpg-to-png', label: 'JPG a PNG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/png-to-jpg', label: 'PNG a JPG' }],
  },
  pt: {
    h2a: 'Como comprimir imagens sem fazer upload',
    steps: ['<strong>Selecione suas imagens</strong> — clique ou arraste arquivos JPG, PNG ou WebP.','<strong>Clique em Comprimir</strong> — a compressão ocorre instantaneamente no seu navegador.','<strong>Baixe seu resultado</strong> — salve a imagem comprimida no seu dispositivo.'],
    h2b: 'O melhor compressor de imagens gratuito sem upload',
    body: `<p>A maioria das ferramentas de compressão online envia suas imagens para um servidor remoto, processa-as e depois as devolve. RelahConvert funciona de forma diferente. A compressão ocorre completamente no seu navegador usando processamento local. Suas imagens nunca saem do seu dispositivo — sem uploads, sem armazenamento em servidor, sem contas, totalmente grátis.</p><p>Seja comprimindo fotos de produtos, reduzindo o tamanho de imagens para redes sociais, otimizando recursos de sites ou tornando arquivos menores para compartilhar por e-mail — esta ferramenta cuida de tudo de forma instantânea e privada.</p>`,
    h3why: 'Por que comprimir imagens?', why: 'Arquivos de imagem grandes tornam os sites lentos, demoram mais para carregar e usam armazenamento desnecessário. Comprimir imagens reduz o tamanho do arquivo preservando a qualidade visual — tornando seu site mais rápido e melhorando seu desempenho de SEO.',
    faqs: [{ q: 'Como comprimo uma imagem sem perder qualidade?', a: 'Para a maioria das imagens, uma qualidade de 75–85% produz arquivos que parecem idênticos ao original por uma fração do tamanho. A diferença é imperceptível ao olho humano nessas configurações.' },{ q: 'Qual é o melhor compressor de imagens gratuito que não faz upload dos arquivos?', a: 'RelahConvert comprime imagens inteiramente no seu navegador sem nenhum upload para servidores. Seus arquivos nunca saem do seu dispositivo.' },{ q: 'Posso comprimir várias imagens de uma vez?', a: 'Sim — selecione várias imagens e elas serão comprimidas em lote. Os arquivos múltiplos são entregues como download ZIP.' },{ q: 'Quais formatos de imagem são suportados?', a: 'RelahConvert suporta compressão de JPG, PNG e WebP. Arquivos PNG são convertidos para JPG durante a compressão para máxima redução de tamanho.' },{ q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente no seu navegador. Suas imagens não são enviadas para nenhum servidor, armazenadas ou compartilhadas com ninguém.' }],
    links: [{ href: '/resize', label: 'Redimensionar' },{ href: '/jpg-to-png', label: 'JPG para PNG' },{ href: '/jpg-to-webp', label: 'JPG para WebP' },{ href: '/png-to-jpg', label: 'PNG para JPG' }],
  },
  de: {
    h2a: 'So komprimieren Sie Bilder ohne Upload',
    steps: ['<strong>Wählen Sie Ihre Bilder aus</strong> — klicken Sie oder ziehen Sie JPG-, PNG- oder WebP-Dateien.','<strong>Klicken Sie auf Komprimieren</strong> — die Komprimierung läuft sofort in Ihrem Browser.','<strong>Laden Sie Ihr Ergebnis herunter</strong> — speichern Sie das komprimierte Bild auf Ihrem Gerät.'],
    h2b: 'Der beste kostenlose Bildkompressor ohne Upload',
    body: `<p>Die meisten Online-Komprimierungstools laden Ihre Bilder auf einen Remote-Server hoch, verarbeiten sie und senden sie dann zurück. RelahConvert funktioniert anders. Die Komprimierung erfolgt vollständig in Ihrem Browser durch lokale Verarbeitung. Ihre Bilder verlassen nie Ihr Gerät — kein Upload, kein Server-Speicher, kein Konto, komplett kostenlos.</p><p>Ob Sie Produktfotos komprimieren, Bildgrößen für soziale Medien reduzieren, Website-Ressourcen optimieren oder Dateien zum Versenden per E-Mail verkleinern — dieses Tool erledigt es sofort und privat.</p>`,
    h3why: 'Warum Bilder komprimieren?', why: 'Große Bilddateien verlangsamen Websites, brauchen länger zum Hochladen und verbrauchen unnötigen Speicherplatz. Das Komprimieren reduziert die Dateigröße bei gleichbleibender visueller Qualität — macht Ihre Website schneller und verbessert Ihre SEO-Leistung.',
    faqs: [{ q: 'Wie komprimiere ich ein Bild ohne Qualitätsverlust?', a: 'Für die meisten Bilder produziert eine Qualität von 75–85 % Dateien, die dem Original identisch aussehen, bei einem Bruchteil der Größe. Der Unterschied ist bei diesen Einstellungen für das menschliche Auge nicht wahrnehmbar.' },{ q: 'Was ist der beste kostenlose Bildkompressor, der keine Dateien hochlädt?', a: 'RelahConvert komprimiert Bilder vollständig in Ihrem Browser ohne jeglichen Server-Upload. Ihre Dateien verlassen nie Ihr Gerät.' },{ q: 'Kann ich mehrere Bilder auf einmal komprimieren?', a: 'Ja — wählen Sie mehrere Bilder aus und sie werden im Stapel komprimiert. Mehrere Dateien werden als ZIP-Download geliefert.' },{ q: 'Welche Bildformate werden unterstützt?', a: 'RelahConvert unterstützt die Komprimierung von JPG, PNG und WebP. PNG-Dateien werden bei der Komprimierung in JPG umgewandelt, um die maximale Größenreduzierung zu erreichen.' },{ q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser. Ihre Bilder werden weder auf einen Server hochgeladen, noch gespeichert, noch mit jemandem geteilt.' }],
    links: [{ href: '/resize', label: 'Skalieren' },{ href: '/jpg-to-png', label: 'JPG zu PNG' },{ href: '/jpg-to-webp', label: 'JPG zu WebP' },{ href: '/png-to-jpg', label: 'PNG zu JPG' }],
  },
  ar: {
    h2a: 'كيفية ضغط الصور بدون رفع',
    steps: ['<strong>اختر صورك</strong> — انقر أو اسحب ملفات JPG أو PNG أو WebP.','<strong>انقر على ضغط</strong> — يعمل الضغط فوراً في متصفحك.','<strong>حمّل نتيجتك</strong> — احفظ الصورة المضغوطة على جهازك.'],
    h2b: 'أفضل ضاغط صور مجاني بدون رفع',
    body: `<p>معظم أدوات الضغط عبر الإنترنت ترفع صورك إلى خادم بعيد، تعالجها، ثم تعيدها إليك. RelahConvert يعمل بشكل مختلف. يتم الضغط بالكامل في متصفحك باستخدام المعالجة المحلية. صورك لا تغادر جهازك أبداً — بدون رفع، بدون تخزين على خوادم، بدون حسابات، مجاني بالكامل.</p><p>سواء كنت تضغط صور منتجات، أو تقلل أحجام الصور لوسائل التواصل الاجتماعي، أو تحسّن موارد موقعك الإلكتروني، أو تصغّر ملفات لمشاركتها عبر البريد الإلكتروني — هذه الأداة تتعامل مع كل ذلك فوراً وبخصوصية تامة.</p>`,
    h3why: 'لماذا ضغط الصور؟', why: 'الملفات الكبيرة تبطئ المواقع، وتستغرق وقتاً أطول للرفع، وتستهلك مساحة تخزين غير ضرورية. ضغط الصور يقلل حجم الملف مع الحفاظ على الجودة البصرية — مما يجعل موقعك أسرع ويحسّن أداء SEO الخاص بك.',
    faqs: [{ q: 'كيف أضغط صورة بدون فقدان الجودة؟', a: 'لمعظم الصور، تنتج جودة 75–85% ملفات تبدو مطابقة للأصل بجزء بسيط من الحجم. الفرق غير محسوس للعين البشرية عند هذه الإعدادات.' },{ q: 'ما هو أفضل ضاغط صور مجاني لا يرفع الملفات؟', a: 'RelahConvert يضغط الصور بالكامل في متصفحك بدون أي رفع للخادم. ملفاتك لا تغادر جهازك أبداً.' },{ q: 'هل يمكنني ضغط عدة صور دفعة واحدة؟', a: 'نعم — اختر عدة صور وسيتم ضغطها دفعة واحدة. الملفات المتعددة تُسلَّم كتحميل ZIP.' },{ q: 'ما هي صيغ الصور المدعومة؟', a: 'يدعم RelahConvert ضغط JPG وPNG وWebP. يتم تحويل ملفات PNG إلى JPG أثناء الضغط لتحقيق أقصى تقليل في الحجم.' },{ q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً في متصفحك. صورك لا تُرفع إلى أي خادم، ولا تُخزَّن، ولا تُشارَك مع أي شخص.' }],
    links: [{ href: '/resize', label: 'تغيير الحجم' },{ href: '/jpg-to-png', label: 'JPG إلى PNG' },{ href: '/jpg-to-webp', label: 'JPG إلى WebP' },{ href: '/png-to-jpg', label: 'PNG إلى JPG' }],
  },
  it: {
    h2a: 'Come comprimere immagini senza caricarle',
    steps: ['<strong>Seleziona le tue immagini</strong> — clicca o trascina file JPG, PNG o WebP.','<strong>Clicca su Comprimi</strong> — la compressione avviene istantaneamente nel tuo browser.','<strong>Scarica il risultato</strong> — salva l\'immagine compressa sul tuo dispositivo.'],
    h2b: 'Il miglior compressore di immagini gratuito senza caricamento',
    body: `<p>La maggior parte degli strumenti di compressione online carica le tue immagini su un server remoto. RelahConvert funziona diversamente: la compressione avviene interamente nel tuo browser. Le tue immagini non lasciano mai il tuo dispositivo — nessun caricamento, nessun archivio su server, nessun account, completamente gratuito.</p><p>Che tu stia comprimendo foto di prodotti, riducendo le dimensioni delle immagini per i social media, ottimizzando risorse per il sito web o rimpicciolendo file da condividere via email — questo strumento lo gestisce istantaneamente e in modo privato.</p>`,
    h3why: 'Perché comprimere le immagini?', why: 'I file di grandi dimensioni rallentano i siti web e occupano spazio di archiviazione inutile. La compressione riduce la dimensione del file preservando la qualità visiva.',
    faqs: [{ q: 'Come comprimo un\'immagine senza perdere qualità?', a: 'Per la maggior parte delle immagini, una qualità del 75–85% produce file identici all\'originale.' },{ q: 'Qual è il miglior compressore di immagini gratuito che non carica file?', a: 'RelahConvert comprime le immagini interamente nel tuo browser senza alcun caricamento sul server. I tuoi file non lasciano mai il tuo dispositivo.' },{ q: 'Posso comprimere più immagini contemporaneamente?', a: 'Sì — seleziona più immagini. I file multipli vengono consegnati in ZIP.' },{ q: 'Quali formati sono supportati?', a: 'RelahConvert supporta la compressione JPG, PNG e WebP.' },{ q: 'Conservate le mie immagini?', a: 'Mai. Tutta l\'elaborazione avviene localmente nel tuo browser.' }],
    links: [{ href: '/resize', label: 'Ridimensiona' },{ href: '/jpg-to-png', label: 'JPG in PNG' },{ href: '/jpg-to-webp', label: 'JPG in WebP' },{ href: '/png-to-jpg', label: 'PNG in JPG' }],
  },
  ja: {
    h2a: 'アップロードなしで画像を圧縮する方法',
    steps: ['<strong>画像を選択</strong> — JPG、PNG、WebPファイルをクリックまたはドラッグ＆ドロップ。','<strong>圧縮をクリック</strong> — ブラウザ内で即座に圧縮が実行されます。','<strong>結果をダウンロード</strong> — 圧縮された画像をデバイスに保存。'],
    h2b: 'ファイルをアップロードしない最高の無料画像圧縮ツール',
    body: `<p>ほとんどのオンライン圧縮ツールは画像をリモートサーバーにアップロードします。RelahConvertは異なります：圧縮は完全にブラウザ内で行われます。画像がデバイスから離れることはありません — アップロードなし、サーバー保存なし、アカウント不要、完全無料です。</p><p>商品写真の圧縮、SNS用の画像サイズ縮小、ウェブサイト素材の最適化、メール添付用のファイル軽量化など、あらゆる用途に即座にプライベートに対応します。</p>`,
    h3why: '画像を圧縮する理由', why: '大きなファイルはウェブサイトを遅くし、不要なストレージを消費します。圧縮は視覚的な品質を維持しながらファイルサイズを削減します。',
    faqs: [{ q: '品質を落とさずに圧縮するには？', a: 'ほとんどの画像で、75〜85%の品質で元と見分けがつかないファイルが生成されます。' },{ q: 'ファイルをアップロードしない最高の無料画像圧縮ツールは？', a: 'RelahConvertはサーバーへのアップロードなしで、完全にブラウザ内で画像を圧縮します。ファイルがデバイスから離れることはありません。' },{ q: '複数の画像を一度に圧縮できますか？', a: 'はい — 複数の画像を選択してください。複数ファイルはZIPで配信されます。' },{ q: 'どの形式に対応していますか？', a: 'JPG、PNG、WebPの圧縮に対応しています。' },{ q: '画像を保存しますか？', a: 'いいえ。すべての処理はブラウザ内でローカルに行われます。' }],
    links: [{ href: '/resize', label: 'リサイズ' },{ href: '/jpg-to-png', label: 'JPGからPNG' },{ href: '/jpg-to-webp', label: 'JPGからWebP' },{ href: '/png-to-jpg', label: 'PNGからJPG' }],
  },
  ru: {
    h2a: 'Как сжать изображения без загрузки',
    steps: ['<strong>Выберите изображения</strong> — нажмите или перетащите файлы JPG, PNG или WebP.','<strong>Нажмите Сжать</strong> — сжатие выполняется мгновенно в вашем браузере.','<strong>Скачайте результат</strong> — сохраните сжатое изображение на устройство.'],
    h2b: 'Лучший бесплатный компрессор изображений без загрузки',
    body: `<p>Большинство онлайн-инструментов сжатия загружают ваши изображения на удалённый сервер. RelahConvert работает иначе: сжатие происходит полностью в вашем браузере. Ваши изображения никогда не покидают ваше устройство — никаких загрузок, серверного хранения, аккаунтов, полностью бесплатно.</p><p>Сжимаете ли вы фотографии товаров, уменьшаете размеры изображений для соцсетей, оптимизируете ресурсы сайта или делаете файлы меньше для отправки по email — этот инструмент справляется мгновенно и конфиденциально.</p>`,
    h3why: 'Зачем сжимать изображения?', why: 'Большие файлы замедляют сайты и занимают ненужное место. Сжатие уменьшает размер файла, сохраняя визуальное качество.',
    faqs: [{ q: 'Как сжать изображение без потери качества?', a: 'Для большинства изображений качество 75–85% даёт файлы, неотличимые от оригинала.' },{ q: 'Какой лучший бесплатный компрессор изображений без загрузки файлов?', a: 'RelahConvert сжимает изображения полностью в вашем браузере без загрузки на сервер. Ваши файлы никогда не покидают устройство.' },{ q: 'Можно сжать несколько изображений сразу?', a: 'Да — выберите несколько изображений. Множественные файлы доставляются в ZIP.' },{ q: 'Какие форматы поддерживаются?', a: 'RelahConvert поддерживает сжатие JPG, PNG и WebP.' },{ q: 'Вы сохраняете мои изображения?', a: 'Никогда. Вся обработка происходит локально в вашем браузере.' }],
    links: [{ href: '/resize', label: 'Изменить размер' },{ href: '/jpg-to-png', label: 'JPG в PNG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/png-to-jpg', label: 'PNG в JPG' }],
  },
  ko: {
    h2a: '업로드 없이 이미지 압축하는 방법',
    steps: ['<strong>이미지 선택</strong> — JPG, PNG 또는 WebP 파일을 클릭하거나 드래그 앤 드롭하세요.','<strong>압축 클릭</strong> — 브라우저에서 즉시 압축이 실행됩니다.','<strong>결과 다운로드</strong> — 압축된 이미지를 기기에 저장하세요.'],
    h2b: '파일을 업로드하지 않는 최고의 무료 이미지 압축기',
    body: `<p>대부분의 온라인 압축 도구는 이미지를 원격 서버에 업로드합니다. RelahConvert는 다릅니다: 압축이 완전히 브라우저에서 이루어집니다. 이미지가 기기를 떠나지 않습니다 — 업로드 없음, 서버 저장 없음, 계정 불필요, 완전 무료입니다.</p><p>제품 사진 압축, 소셜 미디어용 이미지 크기 축소, 웹사이트 자산 최적화, 이메일 공유를 위한 파일 축소 등 어떤 용도든 이 도구가 즉시 비공개로 처리합니다.</p>`,
    h3why: '이미지를 압축하는 이유', why: '큰 파일은 웹사이트를 느리게 하고 불필요한 저장 공간을 차지합니다. 압축은 시각적 품질을 유지하면서 파일 크기를 줄입니다.',
    faqs: [{ q: '품질 손실 없이 압축하려면?', a: '대부분의 이미지에서 75–85% 품질은 원본과 동일하게 보이는 파일을 생성합니다.' },{ q: '파일을 업로드하지 않는 최고의 무료 이미지 압축기는?', a: 'RelahConvert는 서버 업로드 없이 완전히 브라우저에서 이미지를 압축합니다. 파일이 기기를 떠나지 않습니다.' },{ q: '여러 이미지를 한 번에 압축할 수 있나요?', a: '네 — 여러 이미지를 선택하세요. 복수 파일은 ZIP으로 제공됩니다.' },{ q: '어떤 형식을 지원하나요?', a: 'JPG, PNG, WebP 압축을 지원합니다.' },{ q: '이미지를 저장하나요?', a: '절대 아닙니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.' }],
    links: [{ href: '/resize', label: '크기 조정' },{ href: '/jpg-to-png', label: 'JPG를 PNG로' },{ href: '/jpg-to-webp', label: 'JPG를 WebP로' },{ href: '/png-to-jpg', label: 'PNG를 JPG로' }],
  },
  zh: {
    h2a: '如何在不上传的情况下压缩图片',
    steps: ['<strong>选择图片</strong> — 点击或拖放JPG、PNG或WebP文件。','<strong>点击压缩</strong> — 压缩在浏览器中即时运行。','<strong>下载结果</strong> — 将压缩后的图片保存到设备。'],
    h2b: '不上传文件的最佳免费图片压缩工具',
    body: `<p>大多数在线压缩工具会将图片上传到远程服务器。RelahConvert不同：压缩完全在浏览器中进行。图片永远不会离开你的设备——无需上传、无服务器存储、无需账户、完全免费。</p><p>无论你是压缩产品照片、缩小社交媒体图片大小、优化网站素材，还是缩小文件以便通过电子邮件分享——这个工具都能即时且私密地处理。</p>`,
    h3why: '为什么要压缩图片？', why: '大文件会拖慢网站速度并占用不必要的存储空间。压缩可以在保持视觉质量的同时减小文件大小。',
    faqs: [{ q: '如何在不损失质量的情况下压缩？', a: '大多数图片在75–85%质量下生成的文件与原件看起来完全相同。' },{ q: '不上传文件的最佳免费图片压缩工具是什么？', a: 'RelahConvert完全在浏览器中压缩图片，无需上传到服务器。你的文件永远不会离开设备。' },{ q: '可以一次压缩多张图片吗？', a: '可以 — 选择多张图片。多个文件以ZIP格式提供。' },{ q: '支持哪些格式？', a: '支持JPG、PNG和WebP压缩。' },{ q: '你们会保存我的图片吗？', a: '绝不会。所有处理都在浏览器中本地完成。' }],
    links: [{ href: '/resize', label: '调整大小' },{ href: '/jpg-to-png', label: 'JPG转PNG' },{ href: '/jpg-to-webp', label: 'JPG转WebP' },{ href: '/png-to-jpg', label: 'PNG转JPG' }],
  },
  'zh-TW': {
    h2a: '如何在不上傳的情況下壓縮圖片',
    steps: ['<strong>選擇圖片</strong> — 點擊或拖放JPG、PNG或WebP檔案。','<strong>點擊壓縮</strong> — 壓縮在瀏覽器中即時運行。','<strong>下載結果</strong> — 將壓縮後的圖片儲存到裝置。'],
    h2b: '不上傳檔案的最佳免費圖片壓縮工具',
    body: `<p>大多數線上壓縮工具會將圖片上傳到遠端伺服器。RelahConvert不同：壓縮完全在瀏覽器中進行。圖片永遠不會離開你的裝置——無需上傳、無伺服器儲存、無需帳戶、完全免費。</p><p>無論你是壓縮產品照片、縮小社群媒體圖片大小、最佳化網站素材，還是縮小檔案以便透過電子郵件分享——這個工具都能即時且私密地處理。</p>`,
    h3why: '為什麼要壓縮圖片？', why: '大檔案會拖慢網站速度並佔用不必要的儲存空間。壓縮可以在保持視覺品質的同時減小檔案大小。',
    faqs: [{ q: '如何在不損失品質的情況下壓縮？', a: '大多數圖片在75–85%品質下生成的檔案與原件看起來完全相同。' },{ q: '不上傳檔案的最佳免費圖片壓縮工具是什麼？', a: 'RelahConvert完全在瀏覽器中壓縮圖片，無需上傳到伺服器。你的檔案永遠不會離開裝置。' },{ q: '可以一次壓縮多張圖片嗎？', a: '可以 — 選擇多張圖片。多個檔案以ZIP格式提供。' },{ q: '支援哪些格式？', a: '支援JPG、PNG和WebP壓縮。' },{ q: '你們會儲存我的圖片嗎？', a: '絕不會。所有處理都在瀏覽器中本地完成。' }],
    links: [{ href: '/resize', label: '調整大小' },{ href: '/jpg-to-png', label: 'JPG轉PNG' },{ href: '/jpg-to-webp', label: 'JPG轉WebP' },{ href: '/png-to-jpg', label: 'PNG轉JPG' }],
  },
  bg: {
    h2a: 'Как да компресирате изображения без качване',
    steps: ['<strong>Изберете изображения</strong> — щракнете или плъзнете файлове JPG, PNG или WebP.','<strong>Натиснете Компресирай</strong> — компресирането се изпълнява мигновено в браузъра.','<strong>Изтеглете резултата</strong> — запазете компресираното изображение на устройството.'],
    h2b: 'Най-добрият безплатен компресор на изображения без качване',
    body: `<p>Повечето онлайн инструменти за компресиране качват изображенията ви на отдалечен сървър. RelahConvert работи различно: компресирането се извършва изцяло в браузъра. Изображенията ви никога не напускат устройството — без качване, без сървърно съхранение, без акаунти, напълно безплатно.</p><p>Независимо дали компресирате продуктови снимки, намалявате размера на изображения за социални мрежи, оптимизирате ресурси за уебсайт или правите файлове по-малки за споделяне по имейл — този инструмент се справя мигновено и поверително.</p>`,
    h3why: 'Защо да компресирате изображения?', why: 'Големите файлове забавят сайтовете и заемат ненужно място. Компресирането намалява размера на файла, запазвайки визуалното качество.',
    faqs: [{ q: 'Как да компресирам без загуба на качество?', a: 'За повечето изображения качество от 75–85% създава файлове, идентични с оригинала.' },{ q: 'Кой е най-добрият безплатен компресор на изображения, който не качва файлове?', a: 'RelahConvert компресира изображения изцяло в браузъра ви без качване на сървър. Файловете ви никога не напускат устройството.' },{ q: 'Мога ли да компресирам няколко изображения наведнъж?', a: 'Да — изберете няколко изображения. Множеството файлове се доставят в ZIP.' },{ q: 'Какви формати се поддържат?', a: 'Поддържа компресиране на JPG, PNG и WebP.' },{ q: 'Съхранявате ли изображенията ми?', a: 'Никога. Цялата обработка се извършва локално в браузъра.' }],
    links: [{ href: '/resize', label: 'Преоразмеряване' },{ href: '/jpg-to-png', label: 'JPG към PNG' },{ href: '/jpg-to-webp', label: 'JPG към WebP' },{ href: '/png-to-jpg', label: 'PNG към JPG' }],
  },
  ca: {
    h2a: 'Com comprimir imatges sense pujar-les',
    steps: ['<strong>Seleccioneu les imatges</strong> — feu clic o arrossegueu fitxers JPG, PNG o WebP.','<strong>Feu clic a Comprimir</strong> — la compressió s\'executa instantàniament al navegador.','<strong>Descarregueu el resultat</strong> — deseu la imatge comprimida al dispositiu.'],
    h2b: 'El millor compressor d\'imatges gratuït sense pujada',
    body: `<p>La majoria d'eines de compressió en línia pugen les imatges a un servidor remot. RelahConvert funciona diferent: la compressió es fa completament al navegador. Les imatges no surten mai del dispositiu — sense pujades, sense emmagatzematge al servidor, sense comptes, completament gratuït.</p><p>Tant si esteu comprimint fotos de productes, reduint la mida d'imatges per a xarxes socials, optimitzant recursos del lloc web o fent fitxers més petits per compartir per correu electrònic — aquesta eina ho gestiona instantàniament i de manera privada.</p>`,
    h3why: 'Per què comprimir imatges?', why: 'Els fitxers grans alenteixen els llocs web i ocupen espai innecessari. La compressió redueix la mida del fitxer preservant la qualitat visual.',
    faqs: [{ q: 'Com comprimir sense perdre qualitat?', a: 'Per a la majoria d\'imatges, una qualitat del 75–85% produeix fitxers idèntics a l\'original.' },{ q: 'Quin és el millor compressor d\'imatges gratuït que no puja fitxers?', a: 'RelahConvert comprimeix imatges completament al navegador sense cap pujada al servidor. Els fitxers no surten mai del dispositiu.' },{ q: 'Puc comprimir diverses imatges alhora?', a: 'Sí — seleccioneu diverses imatges. Els fitxers múltiples es lliuren en ZIP.' },{ q: 'Quins formats es suporten?', a: 'Suporta compressió JPG, PNG i WebP.' },{ q: 'Deseu les meves imatges?', a: 'Mai. Tot el processament es fa localment al navegador.' }],
    links: [{ href: '/resize', label: 'Redimensionar' },{ href: '/jpg-to-png', label: 'JPG a PNG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/png-to-jpg', label: 'PNG a JPG' }],
  },
  nl: {
    h2a: 'Hoe afbeeldingen comprimeren zonder uploaden',
    steps: ['<strong>Selecteer je afbeeldingen</strong> — klik of sleep JPG-, PNG- of WebP-bestanden.','<strong>Klik op Comprimeren</strong> — compressie draait direct in je browser.','<strong>Download het resultaat</strong> — sla de gecomprimeerde afbeelding op je apparaat op.'],
    h2b: 'De beste gratis afbeeldingscompressor zonder upload',
    body: `<p>De meeste online compressietools uploaden je afbeeldingen naar een externe server. RelahConvert werkt anders: compressie vindt volledig in je browser plaats. Je afbeeldingen verlaten nooit je apparaat — geen uploads, geen serveropslag, geen accounts, volledig gratis.</p><p>Of je nu productfoto's comprimeert, afbeeldingsformaten verkleint voor social media, website-assets optimaliseert of bestanden kleiner maakt om te delen via e-mail — deze tool regelt het direct en privé.</p>`,
    h3why: 'Waarom afbeeldingen comprimeren?', why: 'Grote bestanden vertragen websites en nemen onnodige opslagruimte in beslag. Compressie verkleint de bestandsgrootte met behoud van visuele kwaliteit.',
    faqs: [{ q: 'Hoe comprimeer ik zonder kwaliteitsverlies?', a: 'Voor de meeste afbeeldingen levert 75–85% kwaliteit bestanden op die identiek lijken aan het origineel.' },{ q: 'Wat is de beste gratis afbeeldingscompressor die geen bestanden uploadt?', a: 'RelahConvert comprimeert afbeeldingen volledig in je browser zonder serveruploads. Je bestanden verlaten nooit je apparaat.' },{ q: 'Kan ik meerdere afbeeldingen tegelijk comprimeren?', a: 'Ja — selecteer meerdere afbeeldingen. Meerdere bestanden worden als ZIP geleverd.' },{ q: 'Welke formaten worden ondersteund?', a: 'Ondersteunt JPG-, PNG- en WebP-compressie.' },{ q: 'Bewaren jullie mijn afbeeldingen?', a: 'Nooit. Alle verwerking gebeurt lokaal in je browser.' }],
    links: [{ href: '/resize', label: 'Formaat wijzigen' },{ href: '/jpg-to-png', label: 'JPG naar PNG' },{ href: '/jpg-to-webp', label: 'JPG naar WebP' },{ href: '/png-to-jpg', label: 'PNG naar JPG' }],
  },
  el: {
    h2a: 'Πώς να συμπιέσετε εικόνες χωρίς μεταφόρτωση',
    steps: ['<strong>Επιλέξτε τις εικόνες σας</strong> — κάντε κλικ ή σύρετε αρχεία JPG, PNG ή WebP.','<strong>Κάντε κλικ στο Συμπίεση</strong> — η συμπίεση εκτελείται αμέσως στο πρόγραμμα περιήγησης.','<strong>Κατεβάστε το αποτέλεσμα</strong> — αποθηκεύστε τη συμπιεσμένη εικόνα στη συσκευή σας.'],
    h2b: 'Ο καλύτερος δωρεάν συμπιεστής εικόνων χωρίς μεταφόρτωση',
    body: `<p>Τα περισσότερα εργαλεία συμπίεσης ανεβάζουν τις εικόνες σας σε απομακρυσμένο διακομιστή. Το RelahConvert λειτουργεί διαφορετικά: η συμπίεση γίνεται εξ ολοκλήρου στο πρόγραμμα περιήγησής σας. Οι εικόνες σας δεν φεύγουν ποτέ από τη συσκευή σας — χωρίς μεταφορτώσεις, χωρίς αποθήκευση σε διακομιστή, χωρίς λογαριασμούς, εντελώς δωρεάν.</p><p>Είτε συμπιέζετε φωτογραφίες προϊόντων, μειώνετε μεγέθη εικόνων για μέσα κοινωνικής δικτύωσης, βελτιστοποιείτε πόρους ιστοσελίδας ή κάνετε αρχεία μικρότερα για κοινοποίηση μέσω email — αυτό το εργαλείο τα χειρίζεται αμέσως και ιδιωτικά.</p>`,
    h3why: 'Γιατί να συμπιέσετε εικόνες;', why: 'Τα μεγάλα αρχεία επιβραδύνουν τους ιστότοπους και καταναλώνουν περιττό χώρο. Η συμπίεση μειώνει το μέγεθος αρχείου διατηρώντας την οπτική ποιότητα.',
    faqs: [{ q: 'Πώς συμπιέζω χωρίς απώλεια ποιότητας;', a: 'Για τις περισσότερες εικόνες, ποιότητα 75–85% παράγει αρχεία πανομοιότυπα με το πρωτότυπο.' },{ q: 'Ποιος είναι ο καλύτερος δωρεάν συμπιεστής εικόνων που δεν ανεβάζει αρχεία;', a: 'Το RelahConvert συμπιέζει εικόνες εξ ολοκλήρου στο πρόγραμμα περιήγησής σας χωρίς μεταφόρτωση στον διακομιστή. Τα αρχεία σας δεν φεύγουν ποτέ από τη συσκευή σας.' },{ q: 'Μπορώ να συμπιέσω πολλές εικόνες ταυτόχρονα;', a: 'Ναι — επιλέξτε πολλαπλές εικόνες. Πολλαπλά αρχεία παραδίδονται σε ZIP.' },{ q: 'Ποιες μορφές υποστηρίζονται;', a: 'Υποστηρίζει συμπίεση JPG, PNG και WebP.' },{ q: 'Αποθηκεύετε τις εικόνες μου;', a: 'Ποτέ. Όλη η επεξεργασία γίνεται τοπικά στο πρόγραμμα περιήγησής σας.' }],
    links: [{ href: '/resize', label: 'Αλλαγή μεγέθους' },{ href: '/jpg-to-png', label: 'JPG σε PNG' },{ href: '/jpg-to-webp', label: 'JPG σε WebP' },{ href: '/png-to-jpg', label: 'PNG σε JPG' }],
  },
  hi: {
    h2a: 'बिना अपलोड किए छवियों को संपीड़ित कैसे करें',
    steps: ['<strong>अपनी छवियाँ चुनें</strong> — JPG, PNG या WebP फ़ाइलें क्लिक या ड्रैग करें।','<strong>संपीड़ित करें पर क्लिक करें</strong> — संपीड़न ब्राउज़र में तुरंत चलता है।','<strong>परिणाम डाउनलोड करें</strong> — संपीड़ित छवि को अपने डिवाइस पर सहेजें।'],
    h2b: 'बिना अपलोड के सबसे अच्छा मुफ्त इमेज कंप्रेसर',
    body: `<p>अधिकांश ऑनलाइन संपीड़न उपकरण आपकी छवियों को दूरस्थ सर्वर पर अपलोड करते हैं। RelahConvert अलग है: संपीड़न पूरी तरह से ब्राउज़र में होता है। छवियाँ कभी डिवाइस नहीं छोड़तीं — कोई अपलोड नहीं, कोई सर्वर स्टोरेज नहीं, कोई अकाउंट नहीं, पूरी तरह मुफ्त।</p><p>चाहे आप प्रोडक्ट फोटो संपीड़ित कर रहे हों, सोशल मीडिया के लिए छवि का आकार कम कर रहे हों, वेबसाइट एसेट ऑप्टिमाइज़ कर रहे हों, या ईमेल से साझा करने के लिए फ़ाइलें छोटी कर रहे हों — यह उपकरण इसे तुरंत और निजी रूप से संभालता है।</p>`,
    h3why: 'छवियों को संपीड़ित क्यों करें?', why: 'बड़ी फ़ाइलें वेबसाइटों को धीमा करती हैं और अनावश्यक स्टोरेज लेती हैं। संपीड़न दृश्य गुणवत्ता बनाए रखते हुए फ़ाइल का आकार कम करता है।',
    faqs: [{ q: 'गुणवत्ता खोए बिना कैसे संपीड़ित करें?', a: 'अधिकांश छवियों के लिए, 75–85% गुणवत्ता मूल के समान दिखने वाली फ़ाइलें बनाती है।' },{ q: 'फ़ाइलें अपलोड न करने वाला सबसे अच्छा मुफ्त इमेज कंप्रेसर कौन सा है?', a: 'RelahConvert सर्वर अपलोड के बिना पूरी तरह से ब्राउज़र में छवियों को संपीड़ित करता है। आपकी फ़ाइलें कभी डिवाइस नहीं छोड़तीं।' },{ q: 'क्या कई छवियों को एक साथ संपीड़ित कर सकता हूँ?', a: 'हाँ — कई छवियाँ चुनें। एकाधिक फ़ाइलें ZIP में दी जाती हैं।' },{ q: 'कौन से प्रारूप समर्थित हैं?', a: 'JPG, PNG और WebP संपीड़न समर्थित है।' },{ q: 'क्या आप मेरी छवियाँ सहेजते हैं?', a: 'कभी नहीं। सारी प्रोसेसिंग ब्राउज़र में स्थानीय रूप से होती है।' }],
    links: [{ href: '/resize', label: 'आकार बदलें' },{ href: '/jpg-to-png', label: 'JPG से PNG' },{ href: '/jpg-to-webp', label: 'JPG से WebP' },{ href: '/png-to-jpg', label: 'PNG से JPG' }],
  },
  id: {
    h2a: 'Cara mengompres gambar tanpa mengunggah',
    steps: ['<strong>Pilih gambar Anda</strong> — klik atau seret file JPG, PNG, atau WebP.','<strong>Klik Kompres</strong> — kompresi berjalan instan di browser Anda.','<strong>Download hasilnya</strong> — simpan gambar yang dikompres ke perangkat Anda.'],
    h2b: 'Kompresor gambar gratis terbaik tanpa unggah',
    body: `<p>Sebagian besar alat kompresi online mengunggah gambar Anda ke server jarak jauh. RelahConvert berbeda: kompresi terjadi sepenuhnya di browser. Gambar Anda tidak pernah meninggalkan perangkat — tanpa unggahan, tanpa penyimpanan server, tanpa akun, sepenuhnya gratis.</p><p>Baik Anda mengompres foto produk, mengurangi ukuran gambar untuk media sosial, mengoptimalkan aset situs web, atau mengecilkan file untuk dibagikan melalui email — alat ini menanganinya secara instan dan pribadi.</p>`,
    h3why: 'Mengapa mengompres gambar?', why: 'File besar memperlambat situs web dan menghabiskan penyimpanan yang tidak perlu. Kompresi mengurangi ukuran file sambil mempertahankan kualitas visual.',
    faqs: [{ q: 'Bagaimana mengompres tanpa kehilangan kualitas?', a: 'Untuk sebagian besar gambar, kualitas 75–85% menghasilkan file yang terlihat identik dengan aslinya.' },{ q: 'Apa kompresor gambar gratis terbaik yang tidak mengunggah file?', a: 'RelahConvert mengompres gambar sepenuhnya di browser Anda tanpa unggahan ke server. File Anda tidak pernah meninggalkan perangkat.' },{ q: 'Bisakah mengompres banyak gambar sekaligus?', a: 'Ya — pilih beberapa gambar. File multiple dikirim dalam ZIP.' },{ q: 'Format apa yang didukung?', a: 'Mendukung kompresi JPG, PNG, dan WebP.' },{ q: 'Apakah Anda menyimpan gambar saya?', a: 'Tidak pernah. Semua pemrosesan dilakukan secara lokal di browser.' }],
    links: [{ href: '/resize', label: 'Ubah Ukuran' },{ href: '/jpg-to-png', label: 'JPG ke PNG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/png-to-jpg', label: 'PNG ke JPG' }],
  },
  ms: {
    h2a: 'Cara memampatkan imej tanpa memuat naik',
    steps: ['<strong>Pilih imej anda</strong> — klik atau seret fail JPG, PNG, atau WebP.','<strong>Klik Mampat</strong> — pemampatan berjalan serta-merta dalam pelayar.','<strong>Muat turun hasilnya</strong> — simpan imej yang dimampatkan ke peranti anda.'],
    h2b: 'Pemampat imej percuma terbaik tanpa muat naik',
    body: `<p>Kebanyakan alat pemampatan dalam talian memuat naik imej anda ke pelayan jauh. RelahConvert berbeza: pemampatan berlaku sepenuhnya dalam pelayar. Imej anda tidak pernah meninggalkan peranti — tiada muat naik, tiada storan pelayan, tiada akaun, percuma sepenuhnya.</p><p>Sama ada anda memampatkan foto produk, mengurangkan saiz imej untuk media sosial, mengoptimumkan aset laman web atau mengecilkan fail untuk dikongsi melalui e-mel — alat ini mengendalikannya serta-merta dan secara peribadi.</p>`,
    h3why: 'Mengapa memampatkan imej?', why: 'Fail besar memperlahankan laman web dan menggunakan storan yang tidak perlu. Pemampatan mengurangkan saiz fail sambil mengekalkan kualiti visual.',
    faqs: [{ q: 'Bagaimana memampatkan tanpa kehilangan kualiti?', a: 'Untuk kebanyakan imej, kualiti 75–85% menghasilkan fail yang kelihatan sama dengan asal.' },{ q: 'Apakah pemampat imej percuma terbaik yang tidak memuat naik fail?', a: 'RelahConvert memampatkan imej sepenuhnya dalam pelayar anda tanpa muat naik ke pelayan. Fail anda tidak pernah meninggalkan peranti.' },{ q: 'Bolehkah memampatkan banyak imej sekaligus?', a: 'Ya — pilih beberapa imej. Fail berganda dihantar dalam ZIP.' },{ q: 'Format apa yang disokong?', a: 'Menyokong pemampatan JPG, PNG dan WebP.' },{ q: 'Adakah anda menyimpan imej saya?', a: 'Tidak pernah. Semua pemprosesan dilakukan secara tempatan dalam pelayar.' }],
    links: [{ href: '/resize', label: 'Ubah Saiz' },{ href: '/jpg-to-png', label: 'JPG ke PNG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/png-to-jpg', label: 'PNG ke JPG' }],
  },
  pl: {
    h2a: 'Jak skompresować obrazy bez przesyłania',
    steps: ['<strong>Wybierz obrazy</strong> — kliknij lub przeciągnij pliki JPG, PNG lub WebP.','<strong>Kliknij Kompresuj</strong> — kompresja działa natychmiast w przeglądarce.','<strong>Pobierz wynik</strong> — zapisz skompresowany obraz na urządzeniu.'],
    h2b: 'Najlepszy darmowy kompresor obrazów bez przesyłania',
    body: `<p>Większość narzędzi kompresji online przesyła obrazy na zdalny serwer. RelahConvert działa inaczej: kompresja odbywa się całkowicie w przeglądarce. Obrazy nigdy nie opuszczają urządzenia — bez przesyłania, bez przechowywania na serwerze, bez kont, całkowicie za darmo.</p><p>Niezależnie od tego, czy kompresujesz zdjęcia produktów, zmniejszasz rozmiary obrazów do mediów społecznościowych, optymalizujesz zasoby strony internetowej, czy zmniejszasz pliki do udostępnienia przez e-mail — to narzędzie obsługuje to natychmiast i prywatnie.</p>`,
    h3why: 'Dlaczego kompresować obrazy?', why: 'Duże pliki spowalniają strony i zajmują niepotrzebne miejsce. Kompresja zmniejsza rozmiar pliku, zachowując jakość wizualną.',
    faqs: [{ q: 'Jak skompresować bez utraty jakości?', a: 'Dla większości obrazów jakość 75–85% daje pliki identyczne z oryginałem.' },{ q: 'Jaki jest najlepszy darmowy kompresor obrazów, który nie przesyła plików?', a: 'RelahConvert kompresuje obrazy całkowicie w przeglądarce bez przesyłania na serwer. Twoje pliki nigdy nie opuszczają urządzenia.' },{ q: 'Czy mogę skompresować wiele obrazów naraz?', a: 'Tak — wybierz wiele obrazów. Pliki wielokrotne dostarczane są w ZIP.' },{ q: 'Jakie formaty są obsługiwane?', a: 'Obsługuje kompresję JPG, PNG i WebP.' },{ q: 'Czy przechowujecie moje obrazy?', a: 'Nigdy. Całe przetwarzanie odbywa się lokalnie w przeglądarce.' }],
    links: [{ href: '/resize', label: 'Zmień rozmiar' },{ href: '/jpg-to-png', label: 'JPG do PNG' },{ href: '/jpg-to-webp', label: 'JPG do WebP' },{ href: '/png-to-jpg', label: 'PNG do JPG' }],
  },
  sv: {
    h2a: 'Hur man komprimerar bilder utan uppladdning',
    steps: ['<strong>Välj dina bilder</strong> — klicka eller dra JPG-, PNG- eller WebP-filer.','<strong>Klicka på Komprimera</strong> — komprimering körs direkt i din webbläsare.','<strong>Ladda ner resultatet</strong> — spara den komprimerade bilden på din enhet.'],
    h2b: 'Bästa gratis bildkompressorn utan uppladdning',
    body: `<p>De flesta onlinekomprimeringsverktyg laddar upp bilder till en fjärrserver. RelahConvert fungerar annorlunda: komprimering sker helt i din webbläsare. Dina bilder lämnar aldrig din enhet — ingen uppladdning, ingen serverlagring, inga konton, helt gratis.</p><p>Oavsett om du komprimerar produktfoton, minskar bildstorlekar för sociala medier, optimerar webbplatstillgångar eller gör filer mindre för att dela via e-post — det här verktyget hanterar det direkt och privat.</p>`,
    h3why: 'Varför komprimera bilder?', why: 'Stora filer gör webbplatser långsamma och tar onödigt lagringsutrymme. Komprimering minskar filstorleken med bibehållen visuell kvalitet.',
    faqs: [{ q: 'Hur komprimerar jag utan kvalitetsförlust?', a: 'För de flesta bilder ger 75–85% kvalitet filer som ser identiska ut med originalet.' },{ q: 'Vilken är den bästa gratis bildkompressorn som inte laddar upp filer?', a: 'RelahConvert komprimerar bilder helt i din webbläsare utan serveruppladdningar. Dina filer lämnar aldrig din enhet.' },{ q: 'Kan jag komprimera flera bilder samtidigt?', a: 'Ja — välj flera bilder. Flera filer levereras som ZIP.' },{ q: 'Vilka format stöds?', a: 'Stöder JPG-, PNG- och WebP-komprimering.' },{ q: 'Sparar ni mina bilder?', a: 'Aldrig. All bearbetning sker lokalt i din webbläsare.' }],
    links: [{ href: '/resize', label: 'Ändra storlek' },{ href: '/jpg-to-png', label: 'JPG till PNG' },{ href: '/jpg-to-webp', label: 'JPG till WebP' },{ href: '/png-to-jpg', label: 'PNG till JPG' }],
  },
  th: {
    h2a: 'วิธีบีบอัดรูปภาพโดยไม่ต้องอัปโหลด',
    steps: ['<strong>เลือกรูปภาพ</strong> — คลิกหรือลากไฟล์ JPG, PNG หรือ WebP','<strong>คลิกบีบอัด</strong> — การบีบอัดทำงานทันทีในเบราว์เซอร์','<strong>ดาวน์โหลดผลลัพธ์</strong> — บันทึกรูปภาพที่บีบอัดแล้วลงอุปกรณ์'],
    h2b: 'เครื่องมือบีบอัดรูปภาพฟรีที่ดีที่สุดโดยไม่ต้องอัปโหลด',
    body: `<p>เครื่องมือบีบอัดออนไลน์ส่วนใหญ่จะอัปโหลดรูปภาพไปยังเซิร์ฟเวอร์ RelahConvert ทำงานต่างออกไป: การบีบอัดเกิดขึ้นทั้งหมดในเบราว์เซอร์ รูปภาพไม่เคยออกจากอุปกรณ์ — ไม่มีการอัปโหลด ไม่มีการจัดเก็บบนเซิร์ฟเวอร์ ไม่ต้องสมัครบัญชี ฟรีทั้งหมด</p><p>ไม่ว่าคุณจะบีบอัดรูปสินค้า ลดขนาดรูปภาพสำหรับโซเชียลมีเดีย ปรับแต่งทรัพยากรเว็บไซต์ หรือทำไฟล์ให้เล็กลงเพื่อแชร์ทางอีเมล — เครื่องมือนี้จัดการได้ทันทีและเป็นส่วนตัว</p>`,
    h3why: 'ทำไมต้องบีบอัดรูปภาพ?', why: 'ไฟล์ขนาดใหญ่ทำให้เว็บไซต์ช้าและใช้พื้นที่เก็บข้อมูลโดยไม่จำเป็น การบีบอัดลดขนาดไฟล์โดยรักษาคุณภาพภาพ',
    faqs: [{ q: 'บีบอัดโดยไม่สูญเสียคุณภาพได้อย่างไร?', a: 'สำหรับรูปภาพส่วนใหญ่ คุณภาพ 75–85% สร้างไฟล์ที่ดูเหมือนต้นฉบับ' },{ q: 'เครื่องมือบีบอัดรูปภาพฟรีที่ดีที่สุดที่ไม่อัปโหลดไฟล์คืออะไร?', a: 'RelahConvert บีบอัดรูปภาพทั้งหมดในเบราว์เซอร์ของคุณโดยไม่มีการอัปโหลดไปยังเซิร์ฟเวอร์ ไฟล์ของคุณไม่เคยออกจากอุปกรณ์' },{ q: 'บีบอัดหลายรูปพร้อมกันได้ไหม?', a: 'ได้ — เลือกหลายรูปภาพ ไฟล์หลายไฟล์จะส่งเป็น ZIP' },{ q: 'รองรับรูปแบบอะไรบ้าง?', a: 'รองรับการบีบอัด JPG, PNG และ WebP' },{ q: 'คุณเก็บรูปภาพของฉันไหม?', a: 'ไม่เลย การประมวลผลทั้งหมดเกิดขึ้นในเบราว์เซอร์' }],
    links: [{ href: '/resize', label: 'ปรับขนาด' },{ href: '/jpg-to-png', label: 'JPG เป็น PNG' },{ href: '/jpg-to-webp', label: 'JPG เป็น WebP' },{ href: '/png-to-jpg', label: 'PNG เป็น JPG' }],
  },
  tr: {
    h2a: 'Yüklemeden görsel nasıl sıkıştırılır',
    steps: ['<strong>Görsellerinizi seçin</strong> — JPG, PNG veya WebP dosyalarını tıklayın veya sürükleyin.','<strong>Sıkıştır\'a tıklayın</strong> — sıkıştırma tarayıcınızda anında çalışır.','<strong>Sonucu indirin</strong> — sıkıştırılmış görseli cihazınıza kaydedin.'],
    h2b: 'Dosya yüklemeyen en iyi ücretsiz görsel sıkıştırıcı',
    body: `<p>Çoğu çevrimiçi sıkıştırma aracı görsellerinizi uzak bir sunucuya yükler. RelahConvert farklı çalışır: sıkıştırma tamamen tarayıcınızda gerçekleşir. Görselleriniz cihazınızdan asla ayrılmaz — yükleme yok, sunucu depolama yok, hesap yok, tamamen ücretsiz.</p><p>Ürün fotoğraflarını sıkıştırıyor, sosyal medya için görsel boyutlarını küçültüyor, web sitesi varlıklarını optimize ediyor veya e-posta ile paylaşmak için dosyaları küçültüyor olun — bu araç anında ve gizli şekilde halleder.</p>`,
    h3why: 'Neden görselleri sıkıştırmalısınız?', why: 'Büyük dosyalar web sitelerini yavaşlatır ve gereksiz depolama alanı kaplar. Sıkıştırma, görsel kaliteyi koruyarak dosya boyutunu küçültür.',
    faqs: [{ q: 'Kalite kaybı olmadan nasıl sıkıştırılır?', a: 'Çoğu görsel için %75–85 kalite, orijinalle aynı görünen dosyalar üretir.' },{ q: 'Dosya yüklemeyen en iyi ücretsiz görsel sıkıştırıcı hangisidir?', a: 'RelahConvert görselleri tamamen tarayıcınızda sunucuya yükleme yapmadan sıkıştırır. Dosyalarınız cihazınızdan asla ayrılmaz.' },{ q: 'Birden fazla görseli aynı anda sıkıştırabilir miyim?', a: 'Evet — birden fazla görsel seçin. Çoklu dosyalar ZIP olarak sunulur.' },{ q: 'Hangi formatlar destekleniyor?', a: 'JPG, PNG ve WebP sıkıştırma desteklenir.' },{ q: 'Görsellerimi saklıyor musunuz?', a: 'Asla. Tüm işlemler tarayıcınızda yerel olarak gerçekleşir.' }],
    links: [{ href: '/resize', label: 'Boyutlandır' },{ href: '/jpg-to-png', label: 'JPG\'den PNG\'ye' },{ href: '/jpg-to-webp', label: 'JPG\'den WebP\'ye' },{ href: '/png-to-jpg', label: 'PNG\'den JPG\'ye' }],
  },
  uk: {
    h2a: 'Як стиснути зображення без завантаження',
    steps: ['<strong>Виберіть зображення</strong> — натисніть або перетягніть файли JPG, PNG або WebP.','<strong>Натисніть Стиснути</strong> — стиснення виконується миттєво у браузері.','<strong>Завантажте результат</strong> — збережіть стиснуте зображення на пристрій.'],
    h2b: 'Найкращий безкоштовний компресор зображень без завантаження',
    body: `<p>Більшість онлайн-інструментів стиснення завантажують зображення на віддалений сервер. RelahConvert працює інакше: стиснення відбувається повністю у браузері. Зображення ніколи не залишають ваш пристрій — без завантажень, без серверного зберігання, без облікових записів, повністю безкоштовно.</p><p>Чи стискаєте ви фотографії товарів, зменшуєте розміри зображень для соціальних мереж, оптимізуєте ресурси сайту або робите файли меншими для надсилання електронною поштою — цей інструмент справляється миттєво та конфіденційно.</p>`,
    h3why: 'Навіщо стискати зображення?', why: 'Великі файли сповільнюють сайти та займають непотрібне місце. Стиснення зменшує розмір файлу, зберігаючи візуальну якість.',
    faqs: [{ q: 'Як стиснути без втрати якості?', a: 'Для більшості зображень якість 75–85% дає файли, ідентичні оригіналу.' },{ q: 'Який найкращий безкоштовний компресор зображень, що не завантажує файли?', a: 'RelahConvert стискає зображення повністю у вашому браузері без завантаження на сервер. Ваші файли ніколи не залишають пристрій.' },{ q: 'Чи можна стиснути кілька зображень одразу?', a: 'Так — виберіть кілька зображень. Множинні файли доставляються у ZIP.' },{ q: 'Які формати підтримуються?', a: 'Підтримується стиснення JPG, PNG та WebP.' },{ q: 'Ви зберігаєте мої зображення?', a: 'Ніколи. Вся обробка відбувається локально у браузері.' }],
    links: [{ href: '/resize', label: 'Змінити розмір' },{ href: '/jpg-to-png', label: 'JPG в PNG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/png-to-jpg', label: 'PNG в JPG' }],
  },
  vi: {
    h2a: 'Cách nén ảnh không cần tải lên',
    steps: ['<strong>Chọn ảnh của bạn</strong> — nhấp hoặc kéo thả tệp JPG, PNG hoặc WebP.','<strong>Nhấp Nén</strong> — nén chạy ngay lập tức trong trình duyệt.','<strong>Tải kết quả về</strong> — lưu ảnh đã nén vào thiết bị.'],
    h2b: 'Công cụ nén ảnh miễn phí tốt nhất không cần tải lên',
    body: `<p>Hầu hết công cụ nén trực tuyến tải ảnh lên máy chủ từ xa. RelahConvert khác biệt: nén diễn ra hoàn toàn trong trình duyệt. Ảnh không bao giờ rời khỏi thiết bị — không tải lên, không lưu trữ trên máy chủ, không cần tài khoản, hoàn toàn miễn phí.</p><p>Dù bạn đang nén ảnh sản phẩm, giảm kích thước ảnh cho mạng xã hội, tối ưu hóa tài nguyên trang web hay làm nhỏ tệp để chia sẻ qua email — công cụ này xử lý ngay lập tức và riêng tư.</p>`,
    h3why: 'Tại sao cần nén ảnh?', why: 'Tệp lớn làm chậm trang web và chiếm dung lượng không cần thiết. Nén giảm kích thước tệp trong khi giữ chất lượng hình ảnh.',
    faqs: [{ q: 'Làm sao nén mà không mất chất lượng?', a: 'Với hầu hết ảnh, chất lượng 75–85% tạo ra tệp trông giống hệt bản gốc.' },{ q: 'Công cụ nén ảnh miễn phí tốt nhất không tải lên tệp là gì?', a: 'RelahConvert nén ảnh hoàn toàn trong trình duyệt của bạn mà không tải lên máy chủ. Tệp của bạn không bao giờ rời khỏi thiết bị.' },{ q: 'Có thể nén nhiều ảnh cùng lúc không?', a: 'Có — chọn nhiều ảnh. Nhiều tệp được gửi dạng ZIP.' },{ q: 'Hỗ trợ định dạng nào?', a: 'Hỗ trợ nén JPG, PNG và WebP.' },{ q: 'Các bạn có lưu ảnh của tôi không?', a: 'Không bao giờ. Mọi xử lý diễn ra cục bộ trong trình duyệt.' }],
    links: [{ href: '/resize', label: 'Đổi kích thước' },{ href: '/jpg-to-png', label: 'JPG sang PNG' },{ href: '/jpg-to-webp', label: 'JPG sang WebP' },{ href: '/png-to-jpg', label: 'PNG sang JPG' }],
  },
}


function buildSeoSection() {
  const lang = getLang()
  const seo = seoCompress[lang] || seoCompress['en']
  injectFaqSchema(seo.faqs)
  return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div></div>`
}

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:400; color:var(--text-primary); margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${t.compress_title} <em style="font-style:italic; color:var(--accent);">${t.compress_title_em}</em>
      </h1>
      <p style="font-size:13px; color:var(--text-tertiary); margin:0;">${t.compress_desc}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:var(--text-on-accent); font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${t.select_images}
      </label>
      <span style="font-size:12px; color:var(--text-muted); margin-left:12px;">${t.drop_hint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/webp,image/png" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:var(--accent-bg); color:var(--accent-hover); font-weight:600; font-size:13px;"></div>
    <div id="previewGrid" style="display:none; margin-bottom:16px;"></div>
    <button id="compressBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:var(--btn-disabled); color:var(--text-on-dark-btn); font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.compress_btn}</button>
    <div id="resultBar" style="display:none; margin-bottom:12px;"></div>
    <a id="downloadLink" style="display:none; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:var(--btn-dark); text-decoration:none; color:var(--text-on-dark-btn); font-family:'Fraunces',serif; font-weight:700; font-size:15px;"></a>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
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
const nextStepsButtons = document.getElementById('nextStepsButtons')

let selectedFiles = [], currentDownloadUrl = null, compressedBlobs = []

// Auto-load from ?url= is handled globally by wp-upload.js via header.js

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

// ── Next steps ─────────────────────────────────────────────────────────────
function buildNextSteps() {
  // Determine dominant mime from compressed output
  const outputMime = compressedBlobs.length > 0 ? compressedBlobs[0].type : (selectedFiles.length > 0 ? getOutputMime(selectedFiles[0].type) : 'image/jpeg')
  const isJpg = outputMime === 'image/jpeg'
  const isPng = outputMime === 'image/png'
  const isWebp = outputMime === 'image/webp'

  const buttons = []
  // Optimization tools (never show compress = current tool)
  buttons.push({ label: t.nav_short?.resize || 'Resize', href: localHref('resize') })
  buttons.push({ label: t.nav_short?.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: t.nav_short?.rotate || 'Rotate', href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.flip || 'Flip', href: localHref('flip') })
  buttons.push({ label: t.nav_short?.grayscale || 'Black & White', href: localHref('grayscale') })
  buttons.push({ label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') })
  // Format conversions — filter out current output format
  if (!isJpg)  buttons.push({ label: t.next_to_jpg  || 'Convert to JPG',  href: localHref('png-to-jpg') })
  if (!isPng)  buttons.push({ label: t.next_to_png  || 'Convert to PNG',  href: localHref('jpg-to-png') })
  if (!isWebp) buttons.push({ label: t.next_to_webp || 'Convert to WebP', href: localHref('jpg-to-webp') })

  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (compressedBlobs.length) {
        try { await saveFilesToIDB(compressedBlobs); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
}

function getOutputMime(mime) { return mime === 'image/png' ? 'image/jpeg' : mime }
function getQuality(mime) { return mime === 'image/webp' ? 0.65 : 0.6 }
function setDisabled() { compressBtn.disabled = true; compressBtn.textContent = t.compress_btn; compressBtn.style.background = 'var(--btn-disabled)'; compressBtn.style.cursor = 'not-allowed'; compressBtn.style.opacity = '0.7' }
function setIdle() { compressBtn.disabled = false; compressBtn.textContent = t.compress_btn; compressBtn.style.background = 'var(--accent)'; compressBtn.style.cursor = 'pointer'; compressBtn.style.opacity = '1' }
function setConverting() { compressBtn.disabled = true; compressBtn.textContent = t.compress_btn_loading; compressBtn.style.background = 'var(--text-muted)'; compressBtn.style.cursor = 'not-allowed'; compressBtn.style.opacity = '1' }
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
          <span style="font-weight:600; color:var(--text-primary);">${formatSize(outputBytes)}</span>
        </div>
      </div>
    </div>`
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const circle = document.getElementById('circleAnim')
    if (circle) circle.style.strokeDashoffset = dashOffset
  }))
  buildNextSteps()
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
  let merged = [...selectedFiles, ...valid]
  if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
  while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
  selectedFiles = merged
  cleanupOldUrl(); resultBar.style.display = 'none'; downloadLink.style.display = 'none'; nextSteps.style.display = 'none'
  renderPreviews()
  if (selectedFiles.length) setIdle(); else setDisabled()
}

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
      downloadLink.href = currentDownloadUrl; downloadLink.download = filename; downloadLink.style.display = 'block';if(window.showReviewPrompt)window.showReviewPrompt()
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
      downloadLink.href = currentDownloadUrl; downloadLink.download = 'compressed-images.zip'; downloadLink.style.display = 'block';if(window.showReviewPrompt)window.showReviewPrompt()
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
      showResultBar(totalOriginal, totalOutput)
    }
    setIdle(); fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Compression error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})