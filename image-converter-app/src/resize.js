import JSZip from 'jszip'
import { formatSize, totalBytes, sanitizeBaseName, uniqueName, LIMITS} from './core/utils.js'
import { injectHeader } from './core/header.js'
import { getT , getLang, localHref, injectHreflang, injectFaqSchema} from './core/i18n.js'
injectHreflang('resize')

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
    body: `<p>Télécharger des images juste pour les redimensionner est lent et expose vos fichiers à des serveurs tiers. RelahConvert redimensionne les images entièrement dans votre navigateur — sans téléchargement, sans serveur, sans risque pour la vie privée. Que vous ayez besoin de dimensions exactes en pixels ou d'un redimensionnement rapide en pourcentage, le processus complet se déroule localement sur votre appareil en quelques secondes.</p>`,
    h3why: 'Pourquoi redimensionner les images ?', why: 'Les images trop grandes ralentissent les sites web et ne répondent pas aux exigences des plateformes. Redimensionner garantit que vos images se chargent rapidement.',
    faqs: [{ q: 'Comment redimensionner une image sans perdre en qualité ?', a: 'Réduire les dimensions préserve généralement bien la qualité. Évitez d\'agrandir au-delà de la taille originale. Utilisez le verrouillage du rapport pour éviter la distorsion.' },{ q: 'Puis-je redimensionner une image en pixels exacts sans téléchargement ?', a: 'Oui — entrez la largeur et la hauteur exactes en pixels. Activez le verrouillage du rapport pour redimensionner proportionnellement à partir d\'une seule dimension.' },{ q: 'Puis-je redimensionner en pourcentage ?', a: 'Oui — passez à "En pourcentage" et entrez votre échelle souhaitée, ou utilisez les préréglages rapides pour 25 %, 50 % ou 75 % plus petit.' },{ q: 'Quels formats sont pris en charge ?', a: 'Les images JPG et PNG sont entièrement prises en charge. Le format de sortie correspond à votre entrée.' },{ q: 'Stockez-vous mes images ?', a: 'Jamais. Tout le traitement se fait localement dans votre navigateur. Vos images ne sont jamais envoyées sur un serveur.' }],
    links: [{ href: '/compress', label: 'Compresser' },{ href: '/png-to-jpg', label: 'PNG en JPG' },{ href: '/jpg-to-webp', label: 'JPG en WebP' },{ href: '/jpg-to-png', label: 'JPG en PNG' }],
  },
  es: {
    h2a: 'Cómo redimensionar imágenes sin subir archivos',
    steps: ['<strong>Selecciona tus imágenes</strong> — haz clic o arrastra archivos JPG o PNG.','<strong>Establece tus dimensiones</strong> — ingresa dimensiones en píxeles o elige un porcentaje.','<strong>Haz clic en Redimensionar</strong> — tu imagen estará lista al instante.'],
    h2b: 'El mejor redimensionador de imágenes gratuito sin subida',
    body: `<p>Subir imágenes solo para redimensionarlas es lento y expone tus archivos a servidores de terceros. RelahConvert redimensiona imágenes completamente en tu navegador — sin subida, sin servidor, sin riesgo de privacidad. Ya sea que necesites dimensiones exactas en píxeles o un redimensionamiento rápido por porcentaje, todo el proceso ocurre localmente en tu dispositivo en segundos.</p>`,
    h3why: '¿Por qué redimensionar imágenes?', why: 'Las imágenes demasiado grandes ralentizan los sitios web y no cumplen los requisitos de las plataformas. Redimensionar garantiza que tus imágenes carguen rápido.',
    faqs: [{ q: '¿Cómo redimensiono una imagen sin perder calidad?', a: 'Reducir las dimensiones generalmente preserva bien la calidad. Evita ampliar más allá del tamaño original. Usa el bloqueo de proporción para evitar distorsiones.' },{ q: '¿Puedo redimensionar a píxeles exactos sin subir la imagen?', a: 'Sí — ingresa el ancho y alto exactos en píxeles. Activa el bloqueo de proporción para escalar proporcionalmente desde una sola dimensión.' },{ q: '¿Puedo redimensionar por porcentaje?', a: 'Sí — cambia a "En porcentaje" e ingresa la escala deseada, o usa los ajustes rápidos para reducir un 25 %, 50 % o 75 %.' },{ q: '¿Qué formatos son compatibles?', a: 'Las imágenes JPG y PNG son totalmente compatibles. El formato de salida coincide con el de entrada.' },{ q: '¿Almacenan mis imágenes?', a: 'Nunca. Todo el procesamiento ocurre localmente en tu navegador. Tus imágenes no se suben a ningún servidor.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/png-to-jpg', label: 'PNG a JPG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/jpg-to-png', label: 'JPG a PNG' }],
  },
  pt: {
    h2a: 'Como redimensionar imagens sem fazer upload',
    steps: ['<strong>Selecione suas imagens</strong> — clique ou arraste arquivos JPG ou PNG.','<strong>Defina suas dimensões</strong> — insira dimensões em pixels ou escolha uma porcentagem.','<strong>Clique em Redimensionar</strong> — sua imagem estará pronta instantaneamente.'],
    h2b: 'O melhor redimensionador de imagens gratuito sem upload',
    body: `<p>Fazer upload de imagens apenas para redimensioná-las é lento e expõe seus arquivos a servidores de terceiros. RelahConvert redimensiona imagens completamente no seu navegador — sem upload, sem servidor, sem risco de privacidade. Seja para dimensões exatas em pixels ou um redimensionamento rápido por porcentagem, todo o processo acontece localmente no seu dispositivo em segundos.</p>`,
    h3why: 'Por que redimensionar imagens?', why: 'Imagens muito grandes tornam os sites lentos e não atendem aos requisitos das plataformas. Redimensionar garante que suas imagens carreguem rapidamente.',
    faqs: [{ q: 'Como redimensiono uma imagem sem perder qualidade?', a: 'Reduzir as dimensões geralmente preserva bem a qualidade. Evite ampliar além do tamanho original. Use o bloqueio de proporção para evitar distorções.' },{ q: 'Posso redimensionar para pixels exatos sem fazer upload?', a: 'Sim — insira a largura e altura exatas em pixels. Ative o bloqueio de proporção para escalar proporcionalmente a partir de uma única dimensão.' },{ q: 'Posso redimensionar por porcentagem?', a: 'Sim — mude para "Em porcentagem" e insira a escala desejada, ou use os ajustes rápidos para reduzir em 25%, 50% ou 75%.' },{ q: 'Quais formatos são suportados?', a: 'Imagens JPG e PNG são totalmente suportadas. O formato de saída corresponde ao formato de entrada.' },{ q: 'Vocês armazenam minhas imagens?', a: 'Nunca. Todo o processamento ocorre localmente no seu navegador. Suas imagens não são enviadas para nenhum servidor.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/png-to-jpg', label: 'PNG para JPG' },{ href: '/jpg-to-webp', label: 'JPG para WebP' },{ href: '/jpg-to-png', label: 'JPG para PNG' }],
  },
  de: {
    h2a: 'So ändern Sie die Bildgröße ohne Upload',
    steps: ['<strong>Wählen Sie Ihre Bilder aus</strong> — klicken oder ziehen Sie JPG- oder PNG-Dateien.','<strong>Legen Sie Ihre Abmessungen fest</strong> — geben Sie Pixelabmessungen ein oder wählen Sie einen Prozentsatz.','<strong>Klicken Sie auf Skalieren</strong> — Ihr Bild ist sofort fertig.'],
    h2b: 'Der beste kostenlose Bildskalierer ohne Upload',
    body: `<p>Bilder nur zum Skalieren hochzuladen ist langsam und setzt Ihre Dateien Drittanbieter-Servern aus. RelahConvert skaliert Bilder vollständig in Ihrem Browser — kein Upload, kein Server, kein Datenschutzrisiko. Ob Sie exakte Pixelabmessungen oder eine schnelle prozentuale Skalierung benötigen, der gesamte Vorgang erfolgt lokal auf Ihrem Gerät in Sekunden.</p>`,
    h3why: 'Warum Bilder skalieren?', why: 'Zu große Bilder verlangsamen Websites und erfüllen keine Plattformanforderungen. Das Skalieren stellt sicher, dass Ihre Bilder schnell laden.',
    faqs: [{ q: 'Wie skaliere ich ein Bild ohne Qualitätsverlust?', a: 'Das Reduzieren von Abmessungen erhält die Qualität im Allgemeinen gut. Vermeiden Sie eine Vergrößerung über die Originalgröße hinaus. Verwenden Sie die Seitenverhältnissperre, um Verzerrungen zu vermeiden.' },{ q: 'Kann ich ein Bild auf exakte Pixel skalieren ohne Upload?', a: 'Ja — geben Sie die exakte Zielbreite und -höhe in Pixeln ein. Aktivieren Sie die Seitenverhältnissperre, um proportional aus einer einzelnen Dimension zu skalieren.' },{ q: 'Kann ich in Prozent statt in Pixeln skalieren?', a: 'Ja — wechseln Sie zu "In Prozent" und geben Sie Ihre gewünschte Skala ein, oder verwenden Sie die Schnellvorlagen für 25 %, 50 % oder 75 % kleiner.' },{ q: 'Welche Formate werden unterstützt?', a: 'JPG- und PNG-Bilder werden vollständig unterstützt. Das Ausgabeformat entspricht Ihrem Eingabeformat.' },{ q: 'Speichern Sie meine Bilder?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser. Ihre Bilder werden nicht auf einen Server hochgeladen.' }],
    links: [{ href: '/compress', label: 'Komprimieren' },{ href: '/png-to-jpg', label: 'PNG zu JPG' },{ href: '/jpg-to-webp', label: 'JPG zu WebP' },{ href: '/jpg-to-png', label: 'JPG zu PNG' }],
  },
  ar: {
    h2a: 'كيفية تغيير حجم الصور بدون رفع',
    steps: ['<strong>اختر صورك</strong> — انقر أو اسحب ملفات JPG أو PNG.','<strong>حدد أبعادك</strong> — أدخل أبعاد البكسل أو اختر نسبة مئوية.','<strong>انقر على تغيير الحجم</strong> — صورتك جاهزة فوراً.'],
    h2b: 'أفضل أداة مجانية لتغيير حجم الصور بدون رفع',
    body: `<p>رفع الصور لمجرد تغيير حجمها أمر بطيء ويعرض ملفاتك لخوادم خارجية. RelahConvert يغير حجم الصور بالكامل في متصفحك — بدون رفع، بدون خادم، بدون مخاطر على الخصوصية. سواء كنت بحاجة إلى أبعاد بكسل دقيقة أو تغيير حجم سريع بالنسبة المئوية، تتم العملية بأكملها محلياً على جهازك في ثوانٍ.</p>`,
    h3why: 'لماذا تغيير حجم الصور؟', why: 'الصور الكبيرة جداً تبطئ المواقع ولا تستوفي متطلبات المنصات. تغيير الحجم يضمن تحميل صورك بسرعة.',
    faqs: [{ q: 'كيف أغير حجم صورة بدون فقدان الجودة؟', a: 'تقليل الأبعاد يحافظ عادة على الجودة جيداً. تجنب التكبير فوق الحجم الأصلي. استخدم قفل نسبة العرض لتجنب التشويه.' },{ q: 'هل يمكنني تغيير الحجم إلى بكسل محدد بدون رفع؟', a: 'نعم — أدخل العرض والارتفاع المستهدفين بالبكسل بدقة. فعّل قفل نسبة العرض للتحجيم التناسبي من بُعد واحد.' },{ q: 'هل يمكنني التغيير بالنسبة المئوية؟', a: 'نعم — انتقل إلى "بالنسبة المئوية" وأدخل المقياس المطلوب، أو استخدم الإعدادات السريعة للتصغير بنسبة 25% أو 50% أو 75%.' },{ q: 'ما الصيغ المدعومة؟', a: 'صور JPG وPNG مدعومة بالكامل. صيغة الإخراج تطابق صيغة الإدخال.' },{ q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً في متصفحك. لا يتم رفع صورك إلى أي خادم.' }],
    links: [{ href: '/compress', label: 'ضغط' },{ href: '/png-to-jpg', label: 'PNG إلى JPG' },{ href: '/jpg-to-webp', label: 'JPG إلى WebP' },{ href: '/jpg-to-png', label: 'JPG إلى PNG' }],
  },
  it: {
    h2a: 'Come ridimensionare le immagini senza caricarle',
    steps: ['<strong>Seleziona le tue immagini</strong> — clicca o trascina file JPG o PNG.','<strong>Imposta le dimensioni</strong> — inserisci le dimensioni in pixel o scegli una percentuale.','<strong>Clicca su Ridimensiona</strong> — la tua immagine è pronta istantaneamente.'],
    h2b: 'Il miglior ridimensionatore di immagini gratuito senza caricamento',
    body: `<p>Caricare immagini solo per ridimensionarle è lento e espone i tuoi file a server di terze parti. RelahConvert ridimensiona le immagini interamente nel tuo browser — nessun caricamento, nessun server, nessun rischio per la privacy. Che tu abbia bisogno di dimensioni esatte in pixel o di un rapido ridimensionamento in percentuale, l'intero processo avviene localmente sul tuo dispositivo in pochi secondi.</p>`,
    h3why: 'Perché ridimensionare le immagini?', why: 'Le immagini troppo grandi rallentano i siti web e non soddisfano i requisiti delle piattaforme. Ridimensionare garantisce un caricamento rapido.',
    faqs: [{ q: 'Come ridimensiono un\'immagine senza perdere qualità?', a: 'Ridurre le dimensioni generalmente preserva bene la qualità. Evita di ingrandire oltre la dimensione originale. Usa il blocco proporzioni per evitare distorsioni.' },{ q: 'Posso ridimensionare un\'immagine a pixel esatti senza caricarla?', a: 'Sì — inserisci la larghezza e l\'altezza esatte in pixel. Attiva il blocco proporzioni per scalare proporzionalmente da una singola dimensione.' },{ q: 'Posso ridimensionare in percentuale?', a: 'Sì — passa a "In percentuale" e inserisci la scala desiderata, oppure usa le preimpostazioni rapide per il 25%, 50% o 75% più piccolo.' },{ q: 'Quali formati sono supportati?', a: 'Le immagini JPG e PNG sono completamente supportate. Il formato di output corrisponde al tuo input.' },{ q: 'Conservate le mie immagini?', a: 'Mai. Tutta l\'elaborazione avviene localmente nel tuo browser. Le tue immagini non vengono caricate su nessun server.' }],
    links: [{ href: '/compress', label: 'Comprimi' },{ href: '/png-to-jpg', label: 'PNG in JPG' },{ href: '/jpg-to-webp', label: 'JPG in WebP' },{ href: '/jpg-to-png', label: 'JPG in PNG' }],
  },
  ja: {
    h2a: 'アップロードなしで画像をリサイズする方法',
    steps: ['<strong>画像を選択</strong> — JPGまたはPNGファイルをクリックまたはドラッグ＆ドロップ。','<strong>サイズを設定</strong> — ピクセル寸法を入力するかパーセントを選択。','<strong>リサイズをクリック</strong> — 画像が即座に完成。'],
    h2b: 'ファイルをアップロードしない最高の無料画像リサイザー',
    body: `<p>画像をリサイズするためだけにアップロードするのは遅く、ファイルをサードパーティのサーバーに晒すことになります。RelahConvertはブラウザ内で完全に画像をリサイズします — アップロード不要、サーバー不要、プライバシーリスクなし。正確なピクセル寸法が必要な場合でも、素早いパーセンテージリサイズでも、すべてのプロセスはお使いのデバイス上でローカルに数秒で完了します。</p>`,
    h3why: '画像をリサイズする理由', why: '大きすぎる画像はウェブサイトを遅くし、プラットフォームの要件を満たしません。リサイズにより画像の読み込みが速くなります。',
    faqs: [{ q: '品質を落とさずにリサイズするには？', a: '寸法を縮小すると通常品質は維持されます。元のサイズ以上に拡大するのは避けてください。歪みを防ぐにはアスペクト比ロックを使用してください。' },{ q: 'アップロードせずに正確なピクセルサイズにリサイズできますか？', a: 'はい — 目標の幅と高さをピクセルで正確に入力してください。アスペクト比ロックを有効にすると、片方の寸法から比例的にスケールできます。' },{ q: 'パーセントでリサイズできますか？', a: 'はい — 「パーセント」に切り替えて希望のスケールを入力するか、25%、50%、75%縮小のクイックプリセットをご利用ください。' },{ q: '対応しているフォーマットは？', a: 'JPGとPNG画像に完全対応しています。出力フォーマットは入力に合わせて変わります。' },{ q: '画像を保存しますか？', a: 'いいえ。すべての処理はブラウザ内でローカルに行われます。画像はどのサーバーにもアップロードされません。' }],
    links: [{ href: '/compress', label: '圧縮' },{ href: '/png-to-jpg', label: 'PNGからJPG' },{ href: '/jpg-to-webp', label: 'JPGからWebP' },{ href: '/jpg-to-png', label: 'JPGからPNG' }],
  },
  ru: {
    h2a: 'Как изменить размер изображений без загрузки',
    steps: ['<strong>Выберите изображения</strong> — нажмите или перетащите файлы JPG или PNG.','<strong>Задайте размеры</strong> — введите размеры в пикселях или выберите процент.','<strong>Нажмите Изменить размер</strong> — ваше изображение готово мгновенно.'],
    h2b: 'Лучший бесплатный редактор размера изображений без загрузки',
    body: `<p>Загружать изображения только для изменения размера — это медленно и подвергает ваши файлы рискам на сторонних серверах. RelahConvert изменяет размер изображений полностью в вашем браузере — без загрузки, без сервера, без рисков для конфиденциальности. Нужны точные пиксельные размеры или быстрое процентное масштабирование — весь процесс происходит локально на вашем устройстве за считанные секунды.</p>`,
    h3why: 'Зачем изменять размер изображений?', why: 'Слишком большие изображения замедляют сайты и не соответствуют требованиям платформ. Изменение размера обеспечивает быструю загрузку.',
    faqs: [{ q: 'Как изменить размер без потери качества?', a: 'Уменьшение размеров обычно хорошо сохраняет качество. Избегайте увеличения сверх исходного размера. Используйте блокировку соотношения сторон для предотвращения искажений.' },{ q: 'Можно ли задать точные пиксели без загрузки?', a: 'Да — введите точную целевую ширину и высоту в пикселях. Включите блокировку соотношения сторон для пропорционального масштабирования по одному измерению.' },{ q: 'Можно ли изменить размер в процентах?', a: 'Да — переключитесь на «В процентах» и введите нужный масштаб, или используйте быстрые пресеты для уменьшения на 25%, 50% или 75%.' },{ q: 'Какие форматы поддерживаются?', a: 'Полностью поддерживаются изображения JPG и PNG. Формат вывода соответствует формату входного файла.' },{ q: 'Вы сохраняете мои изображения?', a: 'Никогда. Вся обработка происходит локально в вашем браузере. Ваши изображения не загружаются ни на какой сервер.' }],
    links: [{ href: '/compress', label: 'Сжать' },{ href: '/png-to-jpg', label: 'PNG в JPG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/jpg-to-png', label: 'JPG в PNG' }],
  },
  ko: {
    h2a: '업로드 없이 이미지 크기 조정하는 방법',
    steps: ['<strong>이미지 선택</strong> — JPG 또는 PNG 파일을 클릭하거나 드래그 앤 드롭하세요.','<strong>크기 설정</strong> — 픽셀 치수를 입력하거나 백분율을 선택하세요.','<strong>크기 조정 클릭</strong> — 이미지가 즉시 준비됩니다.'],
    h2b: '파일을 업로드하지 않는 최고의 무료 이미지 리사이저',
    body: `<p>이미지 크기를 조정하기 위해 업로드하는 것은 느리고 파일을 제3자 서버에 노출시킵니다. RelahConvert는 브라우저에서 완전히 이미지 크기를 조정합니다 — 업로드 없음, 서버 없음, 개인정보 위험 없음. 정확한 픽셀 치수가 필요하든 빠른 백분율 크기 조정이 필요하든, 전체 프로세스는 몇 초 만에 기기에서 로컬로 수행됩니다.</p>`,
    h3why: '이미지 크기를 조정하는 이유', why: '너무 큰 이미지는 웹사이트를 느리게 하고 플랫폼 요구 사항을 충족하지 못합니다. 크기 조정으로 빠른 로딩을 보장합니다.',
    faqs: [{ q: '품질 손실 없이 크기를 조정하려면?', a: '크기를 줄이면 일반적으로 품질이 잘 유지됩니다. 원본 크기 이상으로 확대하는 것은 피하세요. 왜곡을 방지하려면 비율 잠금을 사용하세요.' },{ q: '업로드 없이 정확한 픽셀로 크기를 조정할 수 있나요?', a: '네 — 정확한 목표 너비와 높이를 픽셀로 입력하세요. 비율 잠금을 활성화하면 하나의 치수에서 비례적으로 스케일됩니다.' },{ q: '백분율로 크기를 조정할 수 있나요?', a: '네 — "백분율"로 전환하고 원하는 스케일을 입력하거나, 25%, 50%, 75% 축소 빠른 프리셋을 사용하세요.' },{ q: '어떤 형식이 지원되나요?', a: 'JPG 및 PNG 이미지가 완전히 지원됩니다. 출력 형식은 입력과 동일합니다.' },{ q: '이미지를 저장하나요?', a: '절대 아닙니다. 모든 처리는 브라우저에서 로컬로 수행됩니다. 이미지는 어떤 서버에도 업로드되지 않습니다.' }],
    links: [{ href: '/compress', label: '압축' },{ href: '/png-to-jpg', label: 'PNG를 JPG로' },{ href: '/jpg-to-webp', label: 'JPG를 WebP로' },{ href: '/jpg-to-png', label: 'JPG를 PNG로' }],
  },
  zh: {
    h2a: '如何在不上传的情况下调整图片大小',
    steps: ['<strong>选择图片</strong> — 点击或拖放JPG或PNG文件。','<strong>设置尺寸</strong> — 输入像素尺寸或选择百分比。','<strong>点击调整大小</strong> — 图片即时完成。'],
    h2b: '不上传文件的最佳免费图片缩放工具',
    body: `<p>仅仅为了调整大小就上传图片既慢又会将文件暴露给第三方服务器。RelahConvert完全在浏览器中调整图片大小 — 无需上传、无需服务器、无隐私风险。无论您需要精确的像素尺寸还是快速的百分比缩放，整个过程都在您的设备上本地完成，只需几秒钟。</p>`,
    h3why: '为什么要调整图片大小？', why: '过大的图片会拖慢网站速度，不符合平台要求。调整大小确保图片快速加载。',
    faqs: [{ q: '如何在不损失质量的情况下调整大小？', a: '缩小尺寸通常能很好地保持质量。避免放大超过原始尺寸。使用宽高比锁定来防止变形。' },{ q: '可以在不上传的情况下调整到精确像素吗？', a: '可以 — 输入精确的目标宽度和高度（像素）。启用宽高比锁定可从单个维度按比例缩放。' },{ q: '可以按百分比调整吗？', a: '可以 — 切换到"按百分比"并输入所需的比例，或使用快速预设缩小25%、50%或75%。' },{ q: '支持哪些格式？', a: '完全支持JPG和PNG图片。输出格式与输入格式一致。' },{ q: '你们会保存我的图片吗？', a: '绝不会。所有处理都在浏览器中本地完成。您的图片不会上传到任何服务器。' }],
    links: [{ href: '/compress', label: '压缩' },{ href: '/png-to-jpg', label: 'PNG转JPG' },{ href: '/jpg-to-webp', label: 'JPG转WebP' },{ href: '/jpg-to-png', label: 'JPG转PNG' }],
  },
  'zh-TW': {
    h2a: '如何在不上傳的情況下調整圖片大小',
    steps: ['<strong>選擇圖片</strong> — 點擊或拖放JPG或PNG檔案。','<strong>設定尺寸</strong> — 輸入像素尺寸或選擇百分比。','<strong>點擊調整大小</strong> — 圖片即時完成。'],
    h2b: '不上傳檔案的最佳免費圖片縮放工具',
    body: `<p>僅僅為了調整大小就上傳圖片既慢又會將檔案暴露給第三方伺服器。RelahConvert完全在瀏覽器中調整圖片大小 — 無需上傳、無需伺服器、無隱私風險。無論您需要精確的像素尺寸還是快速的百分比縮放，整個過程都在您的裝置上本地完成，只需幾秒鐘。</p>`,
    h3why: '為什麼要調整圖片大小？', why: '過大的圖片會拖慢網站速度，不符合平台要求。調整大小確保圖片快速載入。',
    faqs: [{ q: '如何在不損失品質的情況下調整大小？', a: '縮小尺寸通常能很好地保持品質。避免放大超過原始尺寸。使用寬高比鎖定來防止變形。' },{ q: '可以在不上傳的情況下調整到精確像素嗎？', a: '可以 — 輸入精確的目標寬度和高度（像素）。啟用寬高比鎖定可從單個維度按比例縮放。' },{ q: '可以按百分比調整嗎？', a: '可以 — 切換到「按百分比」並輸入所需的比例，或使用快速預設縮小25%、50%或75%。' },{ q: '支援哪些格式？', a: '完全支援JPG和PNG圖片。輸出格式與輸入格式一致。' },{ q: '你們會保存我的圖片嗎？', a: '絕不會。所有處理都在瀏覽器中本地完成。您的圖片不會上傳到任何伺服器。' }],
    links: [{ href: '/compress', label: '壓縮' },{ href: '/png-to-jpg', label: 'PNG轉JPG' },{ href: '/jpg-to-webp', label: 'JPG轉WebP' },{ href: '/jpg-to-png', label: 'JPG轉PNG' }],
  },
  bg: {
    h2a: 'Как да преоразмерите изображения без качване',
    steps: ['<strong>Изберете изображения</strong> — щракнете или плъзнете JPG или PNG файлове.','<strong>Задайте размери</strong> — въведете размери в пиксели или изберете процент.','<strong>Натиснете Преоразмери</strong> — изображението е готово мигновено.'],
    h2b: 'Най-добрият безплатен инструмент за преоразмеряване без качване',
    body: `<p>Качването на изображения само за да ги преоразмерите е бавно и излага файловете ви на сървъри на трети страни. RelahConvert преоразмерява изображения изцяло във вашия браузър — без качване, без сървър, без риск за поверителността. Независимо дали имате нужда от точни пикселни размери или бързо процентно мащабиране, целият процес се извършва локално на вашето устройство за секунди.</p>`,
    h3why: 'Защо да преоразмерявате изображения?', why: 'Твърде големите изображения забавят сайтовете и не отговарят на изискванията на платформите. Преоразмеряването осигурява бързо зареждане.',
    faqs: [{ q: 'Как да преоразмеря без загуба на качество?', a: 'Намаляването на размерите обикновено запазва качеството добре. Избягвайте увеличаване над оригиналния размер. Използвайте заключване на пропорциите за избягване на изкривявания.' },{ q: 'Мога ли да преоразмеря до точни пиксели без качване?', a: 'Да — въведете точната целева ширина и височина в пиксели. Активирайте заключване на пропорциите за пропорционално мащабиране от едно измерение.' },{ q: 'Мога ли да преоразмеря в проценти?', a: 'Да — превключете на «В проценти» и въведете желания мащаб, или използвайте бързите пресети за 25%, 50% или 75% по-малко.' },{ q: 'Какви формати се поддържат?', a: 'JPG и PNG изображения се поддържат напълно. Изходният формат съответства на входния.' },{ q: 'Съхранявате ли изображенията ми?', a: 'Никога. Цялата обработка се извършва локално в браузъра ви. Вашите изображения не се качват на никакъв сървър.' }],
    links: [{ href: '/compress', label: 'Компресиране' },{ href: '/png-to-jpg', label: 'PNG към JPG' },{ href: '/jpg-to-webp', label: 'JPG към WebP' },{ href: '/jpg-to-png', label: 'JPG към PNG' }],
  },
  ca: {
    h2a: 'Com redimensionar imatges sense pujar-les',
    steps: ['<strong>Seleccioneu les imatges</strong> — feu clic o arrossegueu fitxers JPG o PNG.','<strong>Establiu les dimensions</strong> — introduïu dimensions en píxels o trieu un percentatge.','<strong>Feu clic a Redimensionar</strong> — la imatge està llesta a l\'instant.'],
    h2b: 'El millor redimensionador d\'imatges gratuït sense pujada',
    body: `<p>Pujar imatges només per redimensionar-les és lent i exposa els vostres fitxers a servidors de tercers. RelahConvert redimensiona les imatges completament al vostre navegador — sense pujada, sense servidor, sense risc per a la privacitat. Tant si necessiteu dimensions exactes en píxels com un redimensionament ràpid per percentatge, tot el procés es fa localment al vostre dispositiu en segons.</p>`,
    h3why: 'Per què redimensionar imatges?', why: 'Les imatges massa grans alenteixen els llocs web i no compleixen els requisits de les plataformes. Redimensionar garanteix una càrrega ràpida.',
    faqs: [{ q: 'Com redimensiono sense perdre qualitat?', a: 'Reduir les dimensions normalment preserva bé la qualitat. Eviteu ampliar més enllà de la mida original. Utilitzeu el bloqueig de proporcions per evitar distorsions.' },{ q: 'Puc redimensionar a píxels exactes sense pujar la imatge?', a: 'Sí — introduïu l\'amplada i l\'alçada exactes en píxels. Activeu el bloqueig de proporcions per escalar proporcionalment des d\'una sola dimensió.' },{ q: 'Puc redimensionar per percentatge?', a: 'Sí — canvieu a "Per percentatge" i introduïu l\'escala desitjada, o utilitzeu les preseleccions ràpides per al 25%, 50% o 75% més petit.' },{ q: 'Quins formats són compatibles?', a: 'Les imatges JPG i PNG són totalment compatibles. El format de sortida coincideix amb el d\'entrada.' },{ q: 'Deseu les meves imatges?', a: 'Mai. Tot el processament es fa localment al vostre navegador. Les vostres imatges no es pugen a cap servidor.' }],
    links: [{ href: '/compress', label: 'Comprimir' },{ href: '/png-to-jpg', label: 'PNG a JPG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/jpg-to-png', label: 'JPG a PNG' }],
  },
  nl: {
    h2a: 'Hoe afbeeldingen verkleinen zonder uploaden',
    steps: ['<strong>Selecteer je afbeeldingen</strong> — klik of sleep JPG- of PNG-bestanden.','<strong>Stel je afmetingen in</strong> — voer pixelafmetingen in of kies een percentage.','<strong>Klik op Formaat wijzigen</strong> — je afbeelding is direct klaar.'],
    h2b: 'De beste gratis afbeeldingsverkleiner zonder upload',
    body: `<p>Afbeeldingen uploaden alleen om ze te verkleinen is traag en stelt je bestanden bloot aan servers van derden. RelahConvert wijzigt het formaat van afbeeldingen volledig in je browser — geen upload, geen server, geen privacyrisico. Of je nu exacte pixelafmetingen nodig hebt of een snelle procentuele schaling, het hele proces vindt lokaal op je apparaat plaats in seconden.</p>`,
    h3why: 'Waarom afbeeldingen verkleinen?', why: 'Te grote afbeeldingen vertragen websites en voldoen niet aan platformvereisten. Verkleinen zorgt voor snel laden.',
    faqs: [{ q: 'Hoe verklein ik zonder kwaliteitsverlies?', a: 'Het verkleinen van afmetingen behoudt over het algemeen de kwaliteit goed. Vermijd vergroten boven het originele formaat. Gebruik de beeldverhoudingsvergrendeling om vervorming te voorkomen.' },{ q: 'Kan ik een afbeelding naar exacte pixels verkleinen zonder uploaden?', a: 'Ja — voer je exacte doelbreedte en -hoogte in pixels in. Schakel de beeldverhoudingsvergrendeling in om proportioneel te schalen vanuit één dimensie.' },{ q: 'Kan ik op percentage verkleinen?', a: 'Ja — schakel naar "Op percentage" en voer de gewenste schaal in, of gebruik de snelle presets voor 25%, 50% of 75% kleiner.' },{ q: 'Welke formaten worden ondersteund?', a: 'JPG- en PNG-afbeeldingen worden volledig ondersteund. Het uitvoerformaat komt overeen met je invoer.' },{ q: 'Bewaren jullie mijn afbeeldingen?', a: 'Nooit. Alle verwerking gebeurt lokaal in je browser. Je afbeeldingen worden niet naar een server geüpload.' }],
    links: [{ href: '/compress', label: 'Comprimeren' },{ href: '/png-to-jpg', label: 'PNG naar JPG' },{ href: '/jpg-to-webp', label: 'JPG naar WebP' },{ href: '/jpg-to-png', label: 'JPG naar PNG' }],
  },
  el: {
    h2a: 'Πώς να αλλάξετε μέγεθος εικόνων χωρίς μεταφόρτωση',
    steps: ['<strong>Επιλέξτε τις εικόνες σας</strong> — κάντε κλικ ή σύρετε αρχεία JPG ή PNG.','<strong>Ορίστε τις διαστάσεις</strong> — εισάγετε διαστάσεις σε pixel ή επιλέξτε ποσοστό.','<strong>Κάντε κλικ στο Αλλαγή μεγέθους</strong> — η εικόνα σας είναι έτοιμη αμέσως.'],
    h2b: 'Το καλύτερο δωρεάν εργαλείο αλλαγής μεγέθους χωρίς μεταφόρτωση',
    body: `<p>Η μεταφόρτωση εικόνων μόνο για αλλαγή μεγέθους είναι αργή και εκθέτει τα αρχεία σας σε διακομιστές τρίτων. Το RelahConvert αλλάζει το μέγεθος εικόνων εξ ολοκλήρου στο πρόγραμμα περιήγησής σας — χωρίς μεταφόρτωση, χωρίς διακομιστή, χωρίς κίνδυνο απορρήτου. Είτε χρειάζεστε ακριβείς διαστάσεις pixel είτε γρήγορη αλλαγή μεγέθους κατά ποσοστό, η όλη διαδικασία γίνεται τοπικά στη συσκευή σας σε δευτερόλεπτα.</p>`,
    h3why: 'Γιατί να αλλάξετε μέγεθος εικόνων;', why: 'Οι πολύ μεγάλες εικόνες επιβραδύνουν τους ιστότοπους και δεν πληρούν τις απαιτήσεις πλατφορμών. Η αλλαγή μεγέθους εξασφαλίζει γρήγορη φόρτωση.',
    faqs: [{ q: 'Πώς αλλάζω μέγεθος χωρίς απώλεια ποιότητας;', a: 'Η μείωση διαστάσεων διατηρεί γενικά καλά την ποιότητα. Αποφύγετε τη μεγέθυνση πέρα από το αρχικό μέγεθος. Χρησιμοποιήστε το κλείδωμα αναλογίας για αποφυγή παραμόρφωσης.' },{ q: 'Μπορώ να αλλάξω μέγεθος σε ακριβή pixel χωρίς μεταφόρτωση;', a: 'Ναι — εισάγετε το ακριβές πλάτος και ύψος στόχου σε pixel. Ενεργοποιήστε το κλείδωμα αναλογίας για αναλογική κλιμάκωση από μία μόνο διάσταση.' },{ q: 'Μπορώ να αλλάξω μέγεθος κατά ποσοστό;', a: 'Ναι — μεταβείτε στο «Κατά ποσοστό» και εισάγετε την επιθυμητή κλίμακα, ή χρησιμοποιήστε τις γρήγορες προεπιλογές για 25%, 50% ή 75% μικρότερο.' },{ q: 'Ποιες μορφές υποστηρίζονται;', a: 'Οι εικόνες JPG και PNG υποστηρίζονται πλήρως. Η μορφή εξόδου αντιστοιχεί στην είσοδό σας.' },{ q: 'Αποθηκεύετε τις εικόνες μου;', a: 'Ποτέ. Όλη η επεξεργασία γίνεται τοπικά στο πρόγραμμα περιήγησής σας. Οι εικόνες σας δεν μεταφορτώνονται σε κανέναν διακομιστή.' }],
    links: [{ href: '/compress', label: 'Συμπίεση' },{ href: '/png-to-jpg', label: 'PNG σε JPG' },{ href: '/jpg-to-webp', label: 'JPG σε WebP' },{ href: '/jpg-to-png', label: 'JPG σε PNG' }],
  },
  hi: {
    h2a: 'बिना अपलोड किए छवियों का आकार कैसे बदलें',
    steps: ['<strong>अपनी छवियाँ चुनें</strong> — JPG या PNG फ़ाइलें क्लिक या ड्रैग करें।','<strong>आयाम सेट करें</strong> — पिक्सेल आयाम दर्ज करें या प्रतिशत चुनें।','<strong>आकार बदलें पर क्लिक करें</strong> — आपकी छवि तुरंत तैयार है।'],
    h2b: 'बिना अपलोड के सबसे अच्छा मुफ्त इमेज रिसाइज़र',
    body: `<p>छवियों का आकार बदलने के लिए उन्हें अपलोड करना धीमा है और आपकी फ़ाइलों को तृतीय-पक्ष सर्वरों पर उजागर करता है। RelahConvert आपके ब्राउज़र में पूरी तरह से छवियों का आकार बदलता है — कोई अपलोड नहीं, कोई सर्वर नहीं, कोई गोपनीयता जोखिम नहीं। चाहे आपको सटीक पिक्सेल आयाम चाहिए या त्वरित प्रतिशत रिसाइज़, पूरी प्रक्रिया आपके डिवाइस पर स्थानीय रूप से सेकंडों में पूरी होती है।</p>`,
    h3why: 'छवियों का आकार क्यों बदलें?', why: 'बहुत बड़ी छवियाँ वेबसाइटों को धीमा करती हैं और प्लेटफ़ॉर्म आवश्यकताओं को पूरा नहीं करतीं। आकार बदलने से तेज़ लोडिंग सुनिश्चित होती है।',
    faqs: [{ q: 'गुणवत्ता खोए बिना आकार कैसे बदलें?', a: 'आयाम कम करने से आमतौर पर गुणवत्ता अच्छी बनी रहती है। मूल आकार से अधिक बड़ा करने से बचें। विकृति से बचने के लिए पक्षानुपात लॉक का उपयोग करें।' },{ q: 'क्या मैं बिना अपलोड किए सटीक पिक्सेल में आकार बदल सकता हूँ?', a: 'हाँ — सटीक लक्ष्य चौड़ाई और ऊँचाई पिक्सेल में दर्ज करें। एक आयाम से आनुपातिक रूप से स्केल करने के लिए पक्षानुपात लॉक सक्षम करें।' },{ q: 'क्या मैं प्रतिशत में आकार बदल सकता हूँ?', a: 'हाँ — "प्रतिशत में" पर स्विच करें और वांछित स्केल दर्ज करें, या 25%, 50% या 75% छोटा करने के लिए त्वरित प्रीसेट का उपयोग करें।' },{ q: 'कौन से फ़ॉर्मैट समर्थित हैं?', a: 'JPG और PNG छवियाँ पूरी तरह समर्थित हैं। आउटपुट फ़ॉर्मैट आपके इनपुट से मेल खाता है।' },{ q: 'क्या आप मेरी छवियाँ सहेजते हैं?', a: 'कभी नहीं। सारी प्रोसेसिंग आपके ब्राउज़र में स्थानीय रूप से होती है। आपकी छवियाँ किसी भी सर्वर पर अपलोड नहीं की जातीं।' }],
    links: [{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/png-to-jpg', label: 'PNG से JPG' },{ href: '/jpg-to-webp', label: 'JPG से WebP' },{ href: '/jpg-to-png', label: 'JPG से PNG' }],
  },
  id: {
    h2a: 'Cara mengubah ukuran gambar tanpa mengunggah',
    steps: ['<strong>Pilih gambar Anda</strong> — klik atau seret file JPG atau PNG.','<strong>Atur dimensi</strong> — masukkan dimensi piksel atau pilih persentase.','<strong>Klik Ubah Ukuran</strong> — gambar Anda siap secara instan.'],
    h2b: 'Pengubah ukuran gambar gratis terbaik tanpa unggah',
    body: `<p>Mengunggah gambar hanya untuk mengubah ukurannya lambat dan mengekspos file Anda ke server pihak ketiga. RelahConvert mengubah ukuran gambar sepenuhnya di browser Anda — tanpa unggah, tanpa server, tanpa risiko privasi. Baik Anda membutuhkan dimensi piksel yang tepat atau pengubahan ukuran persentase yang cepat, seluruh proses berlangsung secara lokal di perangkat Anda dalam hitungan detik.</p>`,
    h3why: 'Mengapa mengubah ukuran gambar?', why: 'Gambar yang terlalu besar memperlambat situs web dan tidak memenuhi persyaratan platform. Mengubah ukuran memastikan pemuatan cepat.',
    faqs: [{ q: 'Bagaimana mengubah ukuran tanpa kehilangan kualitas?', a: 'Mengurangi dimensi biasanya mempertahankan kualitas dengan baik. Hindari memperbesar melebihi ukuran asli. Gunakan kunci rasio aspek untuk mencegah distorsi.' },{ q: 'Bisakah saya mengubah ukuran ke piksel tepat tanpa mengunggah?', a: 'Ya — masukkan lebar dan tinggi target yang tepat dalam piksel. Aktifkan kunci rasio aspek untuk menskalakan secara proporsional dari satu dimensi.' },{ q: 'Bisakah saya mengubah ukuran dalam persentase?', a: 'Ya — beralih ke "Dalam persentase" dan masukkan skala yang diinginkan, atau gunakan preset cepat untuk 25%, 50%, atau 75% lebih kecil.' },{ q: 'Format apa saja yang didukung?', a: 'Gambar JPG dan PNG didukung sepenuhnya. Format output sesuai dengan input Anda.' },{ q: 'Apakah Anda menyimpan gambar saya?', a: 'Tidak pernah. Semua pemrosesan dilakukan secara lokal di browser Anda. Gambar Anda tidak diunggah ke server mana pun.' }],
    links: [{ href: '/compress', label: 'Kompres' },{ href: '/png-to-jpg', label: 'PNG ke JPG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/jpg-to-png', label: 'JPG ke PNG' }],
  },
  ms: {
    h2a: 'Cara mengubah saiz imej tanpa memuat naik',
    steps: ['<strong>Pilih imej anda</strong> — klik atau seret fail JPG atau PNG.','<strong>Tetapkan dimensi</strong> — masukkan dimensi piksel atau pilih peratusan.','<strong>Klik Ubah Saiz</strong> — imej anda siap serta-merta.'],
    h2b: 'Pengubah saiz imej percuma terbaik tanpa muat naik',
    body: `<p>Memuat naik imej hanya untuk mengubah saiznya adalah perlahan dan mendedahkan fail anda kepada pelayan pihak ketiga. RelahConvert mengubah saiz imej sepenuhnya dalam pelayar anda — tanpa muat naik, tanpa pelayan, tanpa risiko privasi. Sama ada anda memerlukan dimensi piksel yang tepat atau pengubahan saiz peratusan yang cepat, keseluruhan proses berlaku secara tempatan pada peranti anda dalam beberapa saat.</p>`,
    h3why: 'Mengapa mengubah saiz imej?', why: 'Imej yang terlalu besar memperlahankan laman web dan tidak memenuhi keperluan platform. Mengubah saiz memastikan pemuatan pantas.',
    faqs: [{ q: 'Bagaimana mengubah saiz tanpa kehilangan kualiti?', a: 'Mengurangkan dimensi biasanya mengekalkan kualiti dengan baik. Elakkan membesarkan melebihi saiz asal. Gunakan kunci nisbah aspek untuk mengelakkan herotan.' },{ q: 'Bolehkah saya mengubah saiz ke piksel tepat tanpa memuat naik?', a: 'Ya — masukkan lebar dan tinggi sasaran yang tepat dalam piksel. Aktifkan kunci nisbah aspek untuk menskala secara berkadar dari satu dimensi.' },{ q: 'Bolehkah saya mengubah saiz dalam peratusan?', a: 'Ya — tukar ke "Dalam peratusan" dan masukkan skala yang dikehendaki, atau gunakan pratetap pantas untuk 25%, 50%, atau 75% lebih kecil.' },{ q: 'Format apa yang disokong?', a: 'Imej JPG dan PNG disokong sepenuhnya. Format output sepadan dengan input anda.' },{ q: 'Adakah anda menyimpan imej saya?', a: 'Tidak pernah. Semua pemprosesan dilakukan secara tempatan dalam pelayar anda. Imej anda tidak dimuat naik ke mana-mana pelayan.' }],
    links: [{ href: '/compress', label: 'Mampat' },{ href: '/png-to-jpg', label: 'PNG ke JPG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/jpg-to-png', label: 'JPG ke PNG' }],
  },
  pl: {
    h2a: 'Jak zmienić rozmiar obrazów bez przesyłania',
    steps: ['<strong>Wybierz obrazy</strong> — kliknij lub przeciągnij pliki JPG lub PNG.','<strong>Ustaw wymiary</strong> — wpisz wymiary w pikselach lub wybierz procent.','<strong>Kliknij Zmień rozmiar</strong> — obraz jest gotowy natychmiast.'],
    h2b: 'Najlepsze darmowe narzędzie do zmiany rozmiaru bez przesyłania',
    body: `<p>Przesyłanie obrazów tylko po to, by zmienić ich rozmiar, jest wolne i naraża pliki na serwery zewnętrzne. RelahConvert zmienia rozmiar obrazów w całości w przeglądarce — bez przesyłania, bez serwera, bez ryzyka dla prywatności. Niezależnie od tego, czy potrzebujesz dokładnych wymiarów w pikselach, czy szybkiej zmiany rozmiaru procentowego, cały proces odbywa się lokalnie na Twoim urządzeniu w kilka sekund.</p>`,
    h3why: 'Dlaczego zmieniać rozmiar obrazów?', why: 'Zbyt duże obrazy spowalniają strony internetowe i nie spełniają wymagań platform. Zmiana rozmiaru zapewnia szybkie ładowanie.',
    faqs: [{ q: 'Jak zmienić rozmiar bez utraty jakości?', a: 'Zmniejszanie wymiarów zwykle dobrze zachowuje jakość. Unikaj powiększania ponad oryginalny rozmiar. Użyj blokady proporcji, aby uniknąć zniekształceń.' },{ q: 'Czy mogę zmienić rozmiar do dokładnych pikseli bez przesyłania?', a: 'Tak — wpisz dokładną docelową szerokość i wysokość w pikselach. Włącz blokadę proporcji, aby skalować proporcjonalnie z jednego wymiaru.' },{ q: 'Czy mogę zmienić rozmiar procentowo?', a: 'Tak — przełącz na „Procentowo" i wpisz żądaną skalę, lub użyj szybkich presetów dla 25%, 50% lub 75% mniejszego.' },{ q: 'Jakie formaty są obsługiwane?', a: 'Obrazy JPG i PNG są w pełni obsługiwane. Format wyjściowy odpowiada formatowi wejściowemu.' },{ q: 'Czy przechowujecie moje obrazy?', a: 'Nigdy. Całe przetwarzanie odbywa się lokalnie w przeglądarce. Twoje obrazy nie są przesyłane na żaden serwer.' }],
    links: [{ href: '/compress', label: 'Kompresja' },{ href: '/png-to-jpg', label: 'PNG do JPG' },{ href: '/jpg-to-webp', label: 'JPG do WebP' },{ href: '/jpg-to-png', label: 'JPG do PNG' }],
  },
  sv: {
    h2a: 'Hur man ändrar storlek på bilder utan uppladdning',
    steps: ['<strong>Välj dina bilder</strong> — klicka eller dra JPG- eller PNG-filer.','<strong>Ställ in dimensioner</strong> — ange pixelmått eller välj procent.','<strong>Klicka på Ändra storlek</strong> — din bild är klar direkt.'],
    h2b: 'Bästa gratis bildstorleksändraren utan uppladdning',
    body: `<p>Att ladda upp bilder bara för att ändra storlek är långsamt och exponerar dina filer för tredjepartsservrar. RelahConvert ändrar storlek på bilder helt i din webbläsare — ingen uppladdning, ingen server, ingen integritetsrisk. Oavsett om du behöver exakta pixelmått eller en snabb procentuell storleksändring sker hela processen lokalt på din enhet på sekunder.</p>`,
    h3why: 'Varför ändra storlek på bilder?', why: 'För stora bilder gör webbplatser långsamma och uppfyller inte plattformskrav. Storleksändring säkerställer snabb laddning.',
    faqs: [{ q: 'Hur ändrar jag storlek utan kvalitetsförlust?', a: 'Att minska dimensionerna bevarar generellt kvaliteten väl. Undvik att förstora utöver originalstorlek. Använd bildförhållandelåset för att undvika förvrängning.' },{ q: 'Kan jag ändra storlek till exakta pixlar utan uppladdning?', a: 'Ja — ange din exakta målbredd och -höjd i pixlar. Aktivera bildförhållandelåset för att skala proportionellt från en enda dimension.' },{ q: 'Kan jag ändra storlek i procent?', a: 'Ja — växla till "I procent" och ange önskad skala, eller använd snabbförinställningarna för 25%, 50% eller 75% mindre.' },{ q: 'Vilka format stöds?', a: 'JPG- och PNG-bilder stöds fullt ut. Utdataformatet matchar ditt indata.' },{ q: 'Sparar ni mina bilder?', a: 'Aldrig. All bearbetning sker lokalt i din webbläsare. Dina bilder laddas inte upp till någon server.' }],
    links: [{ href: '/compress', label: 'Komprimera' },{ href: '/png-to-jpg', label: 'PNG till JPG' },{ href: '/jpg-to-webp', label: 'JPG till WebP' },{ href: '/jpg-to-png', label: 'JPG till PNG' }],
  },
  th: {
    h2a: 'วิธีปรับขนาดรูปภาพโดยไม่ต้องอัปโหลด',
    steps: ['<strong>เลือกรูปภาพ</strong> — คลิกหรือลากไฟล์ JPG หรือ PNG','<strong>ตั้งค่าขนาด</strong> — ป้อนขนาดพิกเซลหรือเลือกเปอร์เซ็นต์','<strong>คลิกปรับขนาด</strong> — รูปภาพพร้อมทันที'],
    h2b: 'เครื่องมือปรับขนาดรูปภาพฟรีที่ดีที่สุดโดยไม่ต้องอัปโหลด',
    body: `<p>การอัปโหลดรูปภาพเพียงเพื่อปรับขนาดนั้นช้าและเปิดเผยไฟล์ของคุณให้กับเซิร์ฟเวอร์บุคคลที่สาม RelahConvert ปรับขนาดรูปภาพทั้งหมดในเบราว์เซอร์ของคุณ — ไม่ต้องอัปโหลด ไม่ต้องใช้เซิร์ฟเวอร์ ไม่มีความเสี่ยงด้านความเป็นส่วนตัว ไม่ว่าคุณจะต้องการขนาดพิกเซลที่แน่นอนหรือปรับขนาดตามเปอร์เซ็นต์อย่างรวดเร็ว กระบวนการทั้งหมดเกิดขึ้นในอุปกรณ์ของคุณภายในไม่กี่วินาที</p>`,
    h3why: 'ทำไมต้องปรับขนาดรูปภาพ?', why: 'รูปภาพที่ใหญ่เกินไปทำให้เว็บไซต์ช้าและไม่ตรงตามข้อกำหนดของแพลตฟอร์ม การปรับขนาดช่วยให้โหลดเร็ว',
    faqs: [{ q: 'ปรับขนาดโดยไม่สูญเสียคุณภาพได้อย่างไร?', a: 'การลดขนาดมักรักษาคุณภาพได้ดี หลีกเลี่ยงการขยายเกินขนาดต้นฉบับ ใช้ล็อกอัตราส่วนเพื่อป้องกันการบิดเบือน' },{ q: 'สามารถปรับขนาดเป็นพิกเซลที่แน่นอนโดยไม่ต้องอัปโหลดได้ไหม?', a: 'ได้ — ป้อนความกว้างและความสูงเป้าหมายที่แน่นอนเป็นพิกเซล เปิดใช้ล็อกอัตราส่วนเพื่อปรับขนาดตามสัดส่วนจากมิติเดียว' },{ q: 'สามารถปรับขนาดเป็นเปอร์เซ็นต์ได้ไหม?', a: 'ได้ — สลับไปที่ "เป็นเปอร์เซ็นต์" แล้วป้อนสเกลที่ต้องการ หรือใช้พรีเซ็ตด่วนสำหรับลดขนาด 25%, 50% หรือ 75%' },{ q: 'รองรับรูปแบบไฟล์อะไรบ้าง?', a: 'รองรับรูปภาพ JPG และ PNG อย่างเต็มรูปแบบ รูปแบบเอาต์พุตจะตรงกับอินพุตของคุณ' },{ q: 'คุณเก็บรูปภาพของฉันไหม?', a: 'ไม่เลย การประมวลผลทั้งหมดเกิดขึ้นในเบราว์เซอร์ของคุณ รูปภาพของคุณจะไม่ถูกอัปโหลดไปยังเซิร์ฟเวอร์ใดๆ' }],
    links: [{ href: '/compress', label: 'บีบอัด' },{ href: '/png-to-jpg', label: 'PNG เป็น JPG' },{ href: '/jpg-to-webp', label: 'JPG เป็น WebP' },{ href: '/jpg-to-png', label: 'JPG เป็น PNG' }],
  },
  tr: {
    h2a: 'Yüklemeden görsel boyutunu nasıl değiştirirsiniz',
    steps: ['<strong>Görsellerinizi seçin</strong> — JPG veya PNG dosyalarını tıklayın veya sürükleyin.','<strong>Boyutları ayarlayın</strong> — piksel boyutlarını girin veya yüzde seçin.','<strong>Boyutlandır\'a tıklayın</strong> — görseliniz anında hazır.'],
    h2b: 'Dosya yüklemeyen en iyi ücretsiz görsel boyutlandırıcı',
    body: `<p>Görselleri sadece boyutlandırmak için yüklemek yavaştır ve dosyalarınızı üçüncü taraf sunuculara maruz bırakır. RelahConvert görselleri tamamen tarayıcınızda boyutlandırır — yükleme yok, sunucu yok, gizlilik riski yok. İster tam piksel boyutlarına ister hızlı bir yüzde boyutlandırmaya ihtiyacınız olsun, tüm süreç cihazınızda yerel olarak saniyeler içinde gerçekleşir.</p>`,
    h3why: 'Neden görselleri boyutlandırmalısınız?', why: 'Çok büyük görseller web sitelerini yavaşlatır ve platform gereksinimlerini karşılamaz. Boyutlandırma hızlı yükleme sağlar.',
    faqs: [{ q: 'Kalite kaybı olmadan boyut nasıl değiştirilir?', a: 'Boyutları küçültmek genellikle kaliteyi iyi korur. Orijinal boyutun ötesinde büyütmekten kaçının. Bozulmayı önlemek için en-boy oranı kilidini kullanın.' },{ q: 'Yüklemeden tam piksele boyutlandırabilir miyim?', a: 'Evet — tam hedef genişliği ve yüksekliği piksel olarak girin. Tek bir boyuttan orantılı olarak ölçeklemek için en-boy oranı kilidini etkinleştirin.' },{ q: 'Yüzde olarak boyutlandırabilir miyim?', a: 'Evet — "Yüzde olarak"a geçin ve istediğiniz ölçeği girin, veya %25, %50 veya %75 küçültme için hızlı ön ayarları kullanın.' },{ q: 'Hangi formatlar destekleniyor?', a: 'JPG ve PNG görselleri tam olarak desteklenir. Çıktı formatı girdinizle eşleşir.' },{ q: 'Görsellerimi saklıyor musunuz?', a: 'Asla. Tüm işlemler tarayıcınızda yerel olarak gerçekleşir. Görselleriniz hiçbir sunucuya yüklenmez.' }],
    links: [{ href: '/compress', label: 'Sıkıştır' },{ href: '/png-to-jpg', label: 'PNG\'den JPG\'ye' },{ href: '/jpg-to-webp', label: 'JPG\'den WebP\'ye' },{ href: '/jpg-to-png', label: 'JPG\'den PNG\'ye' }],
  },
  uk: {
    h2a: 'Як змінити розмір зображень без завантаження',
    steps: ['<strong>Виберіть зображення</strong> — натисніть або перетягніть файли JPG або PNG.','<strong>Встановіть розміри</strong> — введіть розміри в пікселях або виберіть відсоток.','<strong>Натисніть Змінити розмір</strong> — ваше зображення готове миттєво.'],
    h2b: 'Найкращий безкоштовний інструмент для зміни розміру без завантаження',
    body: `<p>Завантажувати зображення лише для зміни розміру — це повільно і наражає ваші файли на сервери третіх сторін. RelahConvert змінює розмір зображень повністю у вашому браузері — без завантаження, без сервера, без ризику для конфіденційності. Незалежно від того, чи потрібні вам точні піксельні розміри, чи швидке процентне масштабування, весь процес відбувається локально на вашому пристрої за лічені секунди.</p>`,
    h3why: 'Навіщо змінювати розмір зображень?', why: 'Занадто великі зображення сповільнюють сайти і не відповідають вимогам платформ. Зміна розміру забезпечує швидке завантаження.',
    faqs: [{ q: 'Як змінити розмір без втрати якості?', a: 'Зменшення розмірів зазвичай добре зберігає якість. Уникайте збільшення понад оригінальний розмір. Використовуйте блокування співвідношення сторін для запобігання спотворенню.' },{ q: 'Чи можна задати точні пікселі без завантаження?', a: 'Так — введіть точну цільову ширину та висоту в пікселях. Увімкніть блокування співвідношення сторін для пропорційного масштабування за одним виміром.' },{ q: 'Чи можна змінити розмір у відсотках?', a: 'Так — переключіться на «У відсотках» і введіть бажаний масштаб, або скористайтеся швидкими пресетами для зменшення на 25%, 50% чи 75%.' },{ q: 'Які формати підтримуються?', a: 'Зображення JPG та PNG підтримуються повністю. Формат виводу відповідає формату вхідного файлу.' },{ q: 'Ви зберігаєте мої зображення?', a: 'Ніколи. Вся обробка відбувається локально у вашому браузері. Ваші зображення не завантажуються на жоден сервер.' }],
    links: [{ href: '/compress', label: 'Стиснути' },{ href: '/png-to-jpg', label: 'PNG в JPG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/jpg-to-png', label: 'JPG в PNG' }],
  },
  vi: {
    h2a: 'Cách thay đổi kích thước ảnh không cần tải lên',
    steps: ['<strong>Chọn ảnh của bạn</strong> — nhấp hoặc kéo thả tệp JPG hoặc PNG.','<strong>Đặt kích thước</strong> — nhập kích thước pixel hoặc chọn phần trăm.','<strong>Nhấp Thay đổi kích thước</strong> — ảnh của bạn sẵn sàng ngay lập tức.'],
    h2b: 'Công cụ thay đổi kích thước ảnh miễn phí tốt nhất không cần tải lên',
    body: `<p>Tải ảnh lên chỉ để thay đổi kích thước rất chậm và phơi bày tệp của bạn cho máy chủ bên thứ ba. RelahConvert thay đổi kích thước ảnh hoàn toàn trong trình duyệt — không tải lên, không máy chủ, không rủi ro quyền riêng tư. Dù bạn cần kích thước pixel chính xác hay thay đổi kích thước theo phần trăm nhanh chóng, toàn bộ quá trình diễn ra cục bộ trên thiết bị của bạn trong vài giây.</p>`,
    h3why: 'Tại sao cần thay đổi kích thước ảnh?', why: 'Ảnh quá lớn làm chậm trang web và không đáp ứng yêu cầu nền tảng. Thay đổi kích thước đảm bảo tải nhanh.',
    faqs: [{ q: 'Làm sao thay đổi kích thước mà không mất chất lượng?', a: 'Giảm kích thước thường giữ chất lượng tốt. Tránh phóng to vượt quá kích thước gốc. Sử dụng khóa tỷ lệ khung hình để tránh méo.' },{ q: 'Có thể thay đổi kích thước đến pixel chính xác mà không cần tải lên không?', a: 'Có — nhập chiều rộng và chiều cao mục tiêu chính xác bằng pixel. Bật khóa tỷ lệ khung hình để co giãn tỷ lệ từ một chiều duy nhất.' },{ q: 'Có thể thay đổi kích thước theo phần trăm không?', a: 'Có — chuyển sang "Theo phần trăm" và nhập tỷ lệ mong muốn, hoặc sử dụng các preset nhanh để giảm 25%, 50% hoặc 75%.' },{ q: 'Hỗ trợ những định dạng nào?', a: 'Ảnh JPG và PNG được hỗ trợ đầy đủ. Định dạng đầu ra khớp với đầu vào của bạn.' },{ q: 'Các bạn có lưu ảnh của tôi không?', a: 'Không bao giờ. Mọi xử lý diễn ra cục bộ trong trình duyệt của bạn. Ảnh của bạn không được tải lên bất kỳ máy chủ nào.' }],
    links: [{ href: '/compress', label: 'Nén' },{ href: '/png-to-jpg', label: 'PNG sang JPG' },{ href: '/jpg-to-webp', label: 'JPG sang WebP' },{ href: '/jpg-to-png', label: 'JPG sang PNG' }],
  },
}


function buildSeoSection() {
  const lang = getLang()
  const seo = seoResize[lang] || seoResize['en']
  injectFaqSchema(seo.faqs)
  return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div></div>`
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
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
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

function buildNextSteps() {
  const mime = resizedBlobs.length > 0 ? resizedBlobs[0].type : (selectedFiles.length > 0 ? selectedFiles[0].type : 'image/jpeg')
  const isJpg = mime === 'image/jpeg'
  const isPng = mime === 'image/png'
  const isWebp = mime === 'image/webp'

  const buttons = []
  // Optimization tools (never show resize = current tool)
  buttons.push({ label: t.nav_short?.compress || 'Compress', href: localHref('compress') })
  buttons.push({ label: t.nav_short?.crop || 'Crop', href: localHref('crop') })
  buttons.push({ label: t.nav_short?.rotate || 'Rotate', href: localHref('rotate') })
  buttons.push({ label: t.nav_short?.flip || 'Flip', href: localHref('flip') })
  buttons.push({ label: t.nav_short?.grayscale || 'Black & White', href: localHref('grayscale') })
  buttons.push({ label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') })
  if (!isJpg)  buttons.push({ label: t.next_to_jpg  || 'Convert to JPG',  href: localHref('png-to-jpg') })
  if (!isPng)  buttons.push({ label: t.next_to_png  || 'Convert to PNG',  href: localHref('jpg-to-png') })
  if (!isWebp) buttons.push({ label: t.next_to_webp || 'Convert to WebP', href: localHref('jpg-to-webp') })

  const nextStepsButtons = document.getElementById('nextStepsButtons')
  nextStepsButtons.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'next-link'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      if (resizedBlobs.length) {
        try { await saveFilesToIDB(resizedBlobs); sessionStorage.setItem('pendingFromIDB', '1') } catch (e) {}
      }
      window.location.href = b.href
    })
    nextStepsButtons.appendChild(btn)
  })
  nextSteps.style.display = 'block'
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
      downloadLink.href = currentDownloadUrl; downloadLink.download = filename; downloadLink.style.display = 'block';if(window.showReviewPrompt)window.showReviewPrompt()
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
      downloadLink.href = currentDownloadUrl; downloadLink.download = 'resized-images.zip'; downloadLink.style.display = 'block';if(window.showReviewPrompt)window.showReviewPrompt()
      downloadLink.textContent = `${t.download_zip} (${formatSize(zipBlob.size)})`
    }
    buildNextSteps(); setIdle(); fileInput.value = ''
  } catch (err) {
    alert(err?.message || 'Resize error')
    if (selectedFiles.length) setIdle(); else setDisabled()
  }
})

loadPendingFiles()