import { injectHeader } from './core/header.js'
import { formatSize, totalBytes, sanitizeBaseName, LIMITS } from './core/utils.js'
import { getT } from './core/i18n.js'
import { jsPDF } from 'jspdf'
import exifr from 'exifr'

export function initImageToPdf({ slug: _slug } = {}) {
  const bg = '#F2F2F2'
  const t = getT()

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
      .settings-panel { background:#fff; border-radius:14px; padding:20px; box-shadow:0 2px 12px rgba(0,0,0,0.07); margin-bottom:12px; }
      .settings-label { font-size:10px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; }
      .settings-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
      .settings-row:last-child { margin-bottom:0; }
      .settings-row-label { font-size:12px; font-weight:600; color:#5A4A3A; width:76px; flex-shrink:0; }
      .seg-group { display:flex; gap:4px; background:#F5F0E8; border-radius:8px; padding:3px; flex:1; }
      .seg-btn { flex:1; padding:6px 4px; border:none; border-radius:6px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; background:transparent; color:#9A8A7A; transition:all 0.15s; white-space:nowrap; }
      .seg-btn.active { background:#C84B31; color:#fff; box-shadow:0 1px 4px rgba(200,75,49,0.25); }
      .seg-btn:not(.active):hover { background:#EDE5DA; color:#2C1810; }
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
    document.title = isPng
      ? 'Convert Screenshots & Graphics to PDF — PNG to PDF Converter Free'
      : 'Convert Photos to PDF — JPG to PDF Converter Free'
    const metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    metaDesc.content = isPng
      ? 'Convert screenshots, logos, graphics, and transparent PNG images to PDF. Free PNG to PDF converter — no upload, works entirely in your browser.'
      : 'Turn your photos, camera images, and social media pictures into PDF documents. Free JPG to PDF converter — no upload, works entirely in your browser.'
    document.head.appendChild(metaDesc)
  }

  const pageSettings = { orientation: 'portrait', size: 'fit', margin: 'none' }
  const MARGIN_MM = { none: 0, small: 8, big: 20 }
  const PAGE_DIMS_MM = { fit: null, a4: [210, 297], letter: [215.9, 279.4] }

  async function getRotationDeg(file) {
    try {
      const tags = await exifr.parse(file, ['Orientation'])
      return { 1: 0, 3: 180, 6: 90, 8: 270 }[tags?.Orientation] ?? 0
    } catch (_) { return 0 }
  }

  function drawRotatedToCanvas(imgEl, deg) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const w = imgEl.naturalWidth, h = imgEl.naturalHeight
    const swapped = deg === 90 || deg === 270
    canvas.width  = swapped ? h : w
    canvas.height = swapped ? w : h
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((deg * Math.PI) / 180)
    ctx.drawImage(imgEl, -w / 2, -h / 2)
    ctx.restore()
    return { dataURL: canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92), w: canvas.width, h: canvas.height }
  }

  async function loadAndCorrectImage(file) {
    const deg = await getRotationDeg(file)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('File read failed'))
      reader.onload = (e) => {
        const imgEl = new Image()
        imgEl.onerror = () => reject(new Error('Image load failed'))
        imgEl.onload = () => {
          const browserAlreadyCorrected = (deg === 90 || deg === 270) && imgEl.naturalWidth < imgEl.naturalHeight
          resolve(drawRotatedToCanvas(imgEl, browserAlreadyCorrected ? 0 : deg))
        }
        imgEl.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function imageFilesToPdfBlob(files, onProgress) {
    const marginMm = MARGIN_MM[pageSettings.margin]
    const fmt = isPng ? 'PNG' : 'JPEG'
    const corrected = []
    for (let i = 0; i < files.length; i++) {
      corrected.push(await loadAndCorrectImage(files[i]))
      onProgress?.(i + 1, files.length)
    }
    let doc = null
    for (let i = 0; i < corrected.length; i++) {
      const { dataURL, w: imgW, h: imgH } = corrected[i]
      let pgWmm, pgHmm
      if (pageSettings.size === 'fit') {
        const PX_TO_MM = 25.4 / 96
        pgWmm = imgW * PX_TO_MM; pgHmm = imgH * PX_TO_MM
      } else {
        ;[pgWmm, pgHmm] = PAGE_DIMS_MM[pageSettings.size]
      }
      const wantsLandscape = pageSettings.orientation === 'landscape'
      if ((wantsLandscape && pgHmm > pgWmm) || (!wantsLandscape && pgWmm > pgHmm)) { ;[pgWmm, pgHmm] = [pgHmm, pgWmm] }
      const jsPdfOrient = pgWmm >= pgHmm ? 'l' : 'p'
      if (!doc) {
        doc = new jsPDF({ orientation: jsPdfOrient, unit: 'mm', format: [pgWmm, pgHmm], compress: true })
      } else {
        doc.addPage([pgWmm, pgHmm], jsPdfOrient)
      }
      const usableW = pgWmm - marginMm * 2, usableH = pgHmm - marginMm * 2
      const imgAr = imgW / imgH
      let drawW = usableW, drawH = usableW / imgAr
      if (drawH > usableH) { drawH = usableH; drawW = usableH * imgAr }
      const x = marginMm + (usableW - drawW) / 2, y = marginMm + (usableH - drawH) / 2
      doc.addImage(dataURL, fmt, x, y, drawW, drawH, '', 'FAST')
    }
    return doc ? doc.output('blob') : null
  }

  const seoPdf = {
    en: {
      'jpg-to-pdf': {
        h2a: 'How to Save Photos as PDF — No Upload Needed',
        steps: ['<strong>Add your photos</strong> — click "Select Images" or drag and drop JPG photos from your camera roll, phone, or social media downloads.','<strong>Pick a layout</strong> — one photo per PDF, or combine all photos into a single multi-page document.','<strong>Download instantly</strong> — your photo PDF is generated right in your browser. Nothing is uploaded anywhere.'],
        h2b: 'The Easiest Way to Turn Photos Into PDF Documents',
        body: `<p>Need to email vacation photos as a PDF? Submit ID photos to a government portal? Bundle product shots for a client? RelahConvert turns your JPG photos into polished PDF documents without uploading a single file.</p><p>JPG is the default format for phone cameras, DSLR cameras, and social media downloads. This tool converts those everyday photos into the PDF format that offices, schools, and agencies expect — all without leaving your browser.</p>`,
        h3why: 'When Should You Convert Photos to PDF?', why: 'PDF keeps your photos at full quality while making them easy to email, print, or submit to document portals that don\'t accept image files directly.',
        faqs: [{ q: 'Can I convert phone photos to PDF?', a: 'Yes. Phone cameras save photos as JPG by default. Just select or drag your phone photos into the tool and they\'ll become a PDF instantly.' },{ q: 'How do I combine multiple photos into one PDF?', a: 'Select all your photos, choose "All images in one PDF", and click Convert. Each photo becomes its own page in the document.' },{ q: 'Will converting to PDF reduce my photo quality?', a: 'No. Your JPG photos are embedded at their original resolution inside the PDF. There is no additional compression.' },{ q: 'Is it safe to convert personal photos here?', a: 'Yes. Everything runs locally in your browser. Your photos are never uploaded to any server — they stay on your device the entire time.' },{ q: 'Can I convert scanned receipts or documents to PDF?', a: 'Absolutely. If your scanner or phone saved the scan as a JPG, this tool will convert it to a clean PDF you can file or email.' }],
        links: [{ href: '/jpg-to-png', label: 'JPG to PNG' },{ href: '/jpg-to-webp', label: 'JPG to WebP' },{ href: '/compress', label: 'Compress Image' },{ href: '/resize', label: 'Resize Image' }],
      },
      'png-to-pdf': {
        h2a: 'How to Convert Screenshots & Graphics to PDF',
        steps: ['<strong>Add your PNG files</strong> — click "Select Images" or drag and drop screenshots, logos, or design exports onto the page.','<strong>Choose your PDF mode</strong> — one PDF per file, or merge all graphics into a single document.','<strong>Download your PDF</strong> — generated instantly in your browser with no upload or server processing.'],
        h2b: 'Turn Screenshots, Logos, and Graphics Into Shareable PDFs',
        body: `<p>PNG is the go-to format for screenshots, UI mockups, logo exports, and any graphic with transparency. But when you need to share these assets as a document — for a presentation, a client deliverable, or a print job — PDF is the standard.</p><p>RelahConvert converts your PNG graphics to PDF entirely in your browser. Transparency, sharp edges, and text clarity are all preserved. No file is uploaded, no account is needed.</p>`,
        h3why: 'Why Convert PNG Graphics to PDF?', why: 'PDF preserves the sharp edges and transparency of PNG graphics while making them universally viewable, printable, and easy to attach in emails or document portals.',
        faqs: [{ q: 'Will my transparent PNG backgrounds be kept in the PDF?', a: 'The transparency data is preserved in the conversion. However, PDF viewers typically render transparent areas as white when displaying or printing.' },{ q: 'Can I combine multiple screenshots into one PDF?', a: 'Yes — select all your screenshots and choose "All images in one PDF". Each screenshot becomes a separate page, great for bug reports or documentation.' },{ q: 'Is this tool good for converting design mockups to PDF?', a: 'Yes. PNG exports from Figma, Sketch, or Canva convert cleanly to PDF with all details intact — perfect for sharing with clients who don\'t have design tools.' },{ q: 'Do you store or see my files?', a: 'Never. The entire conversion happens locally in your browser. Nothing is uploaded, nothing is stored.' },{ q: 'What\'s the difference between JPG to PDF and PNG to PDF?', a: 'JPG is best for photos and camera images. PNG is best for screenshots, graphics, logos, and images with text or transparency. Use the tool that matches your source file format.' }],
        links: [{ href: '/png-to-jpg', label: 'PNG to JPG' },{ href: '/png-to-webp', label: 'PNG to WebP' },{ href: '/compress', label: 'Compress Image' },{ href: '/resize', label: 'Resize Image' }],
      },
    },
    fr: {
      'jpg-to-pdf': { h2a: 'Comment enregistrer vos photos en PDF', steps: ['<strong>Ajoutez vos photos JPG</strong> — depuis votre appareil photo, téléphone ou réseaux sociaux.','<strong>Choisissez le mode</strong> — une photo par PDF ou toutes combinées.','<strong>Téléchargez instantanément</strong> — tout se passe dans votre navigateur.'], h2b: 'Transformez vos photos en documents PDF', body: '<p>Convertissez photos de vacances, pièces d\'identité ou images produit en PDF sans rien télécharger vers un serveur. Idéal pour les photos de caméra et réseaux sociaux.</p>', h3why: 'Quand convertir vos photos en PDF ?', why: 'Le PDF garde vos photos en pleine qualité tout en les rendant faciles à envoyer par email ou soumettre sur les portails administratifs.', faqs: [{ q: 'Puis-je convertir les photos de mon téléphone en PDF ?', a: 'Oui. Les téléphones enregistrent les photos en JPG par défaut. Sélectionnez-les et obtenez un PDF instantanément.' },{ q: 'Stockez-vous mes photos ?', a: 'Jamais. Tout le traitement se fait localement dans votre navigateur.' }], links: [{ href: '/jpg-to-png', label: 'JPG en PNG' },{ href: '/jpg-to-webp', label: 'JPG en WebP' },{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' }] },
      'png-to-pdf': { h2a: 'Comment convertir captures d\'écran et graphiques en PDF', steps: ['<strong>Ajoutez vos fichiers PNG</strong> — captures d\'écran, logos ou exports design.','<strong>Choisissez le mode PDF</strong> — un par fichier ou tout dans un seul document.','<strong>Téléchargez votre PDF</strong> — généré instantanément sans téléchargement serveur.'], h2b: 'Convertissez captures d\'écran, logos et graphiques en PDF', body: '<p>Le PNG est le format idéal pour les captures d\'écran, maquettes UI et logos avec transparence. Convertissez-les en PDF pour les partager facilement — tout se passe dans votre navigateur.</p>', h3why: 'Pourquoi convertir vos graphiques PNG en PDF ?', why: 'Le PDF préserve la netteté et la transparence de vos graphiques PNG tout en les rendant universellement partageables et imprimables.', faqs: [{ q: 'Puis-je combiner plusieurs captures d\'écran en un PDF ?', a: 'Oui — sélectionnez toutes vos captures et choisissez "Toutes les images en un PDF". Chaque capture devient une page.' },{ q: 'Stockez-vous mes fichiers ?', a: 'Jamais. La conversion se fait entièrement dans votre navigateur.' }], links: [{ href: '/png-to-jpg', label: 'PNG en JPG' },{ href: '/png-to-webp', label: 'PNG en WebP' },{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' }] },
    },
    es: {
      'jpg-to-pdf': { h2a: 'Cómo guardar fotos como PDF', steps: ['<strong>Añade tus fotos JPG</strong> — desde tu cámara, teléfono o redes sociales.','<strong>Elige el modo</strong> — una foto por PDF o todas combinadas.','<strong>Descarga al instante</strong> — todo ocurre en tu navegador.'], h2b: 'Convierte tus fotos en documentos PDF', body: '<p>Convierte fotos de vacaciones, imágenes de identificación o fotos de productos en PDF sin subir nada a un servidor. Ideal para fotos de cámara y redes sociales.</p>', h3why: '¿Cuándo convertir fotos a PDF?', why: 'PDF mantiene tus fotos en calidad completa y las hace fáciles de enviar por email o subir a portales oficiales.', faqs: [{ q: '¿Puedo convertir fotos del teléfono a PDF?', a: 'Sí. Los teléfonos guardan fotos en JPG por defecto. Selecciónalas y obtén un PDF al instante.' },{ q: '¿Almacenan mis fotos?', a: 'Nunca. Todo el procesamiento ocurre localmente en tu navegador.' }], links: [{ href: '/jpg-to-png', label: 'JPG a PNG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
      'png-to-pdf': { h2a: 'Cómo convertir capturas de pantalla y gráficos a PDF', steps: ['<strong>Añade tus archivos PNG</strong> — capturas de pantalla, logos o exportaciones de diseño.','<strong>Elige el modo PDF</strong> — uno por archivo o todo en un solo documento.','<strong>Descarga tu PDF</strong> — generado al instante sin subida al servidor.'], h2b: 'Convierte capturas, logos y gráficos en PDF', body: '<p>PNG es el formato ideal para capturas de pantalla, maquetas UI y logos con transparencia. Conviértelos a PDF para compartirlos fácilmente — todo en tu navegador.</p>', h3why: '¿Por qué convertir gráficos PNG a PDF?', why: 'PDF preserva la nitidez y transparencia de tus gráficos PNG mientras los hace universalmente compartibles e imprimibles.', faqs: [{ q: '¿Puedo combinar varias capturas en un PDF?', a: 'Sí — selecciona todas tus capturas y elige "Todas las imágenes en un PDF". Cada captura se convierte en una página.' },{ q: '¿Almacenan mis archivos?', a: 'Nunca. La conversión ocurre completamente en tu navegador.' }], links: [{ href: '/png-to-jpg', label: 'PNG a JPG' },{ href: '/png-to-webp', label: 'PNG a WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
    },
    pt: {
      'jpg-to-pdf': { h2a: 'Como salvar fotos como PDF', steps: ['<strong>Adicione suas fotos JPG</strong> — da câmera, celular ou redes sociais.','<strong>Escolha o modo</strong> — uma foto por PDF ou todas combinadas.','<strong>Baixe instantaneamente</strong> — tudo acontece no seu navegador.'], h2b: 'Transforme suas fotos em documentos PDF', body: '<p>Converta fotos de viagem, documentos de identidade ou fotos de produtos em PDF sem fazer upload. Ideal para fotos de câmera e redes sociais.</p>', h3why: 'Quando converter fotos para PDF?', why: 'PDF mantém suas fotos em qualidade total e facilita o envio por email ou upload em portais oficiais.', faqs: [{ q: 'Posso converter fotos do celular para PDF?', a: 'Sim. Celulares salvam fotos em JPG por padrão. Selecione e obtenha um PDF instantaneamente.' },{ q: 'Vocês armazenam minhas fotos?', a: 'Nunca. Todo o processamento ocorre localmente no seu navegador.' }], links: [{ href: '/jpg-to-png', label: 'JPG para PNG' },{ href: '/jpg-to-webp', label: 'JPG para WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
      'png-to-pdf': { h2a: 'Como converter capturas de tela e gráficos para PDF', steps: ['<strong>Adicione seus arquivos PNG</strong> — capturas de tela, logos ou exportações de design.','<strong>Escolha o modo PDF</strong> — um por arquivo ou tudo em um só documento.','<strong>Baixe seu PDF</strong> — gerado instantaneamente sem upload ao servidor.'], h2b: 'Converta capturas de tela, logos e gráficos em PDF', body: '<p>PNG é o formato ideal para capturas de tela, mockups de UI e logos com transparência. Converta-os para PDF para compartilhar facilmente — tudo no seu navegador.</p>', h3why: 'Por que converter gráficos PNG para PDF?', why: 'PDF preserva a nitidez e transparência dos seus gráficos PNG enquanto os torna universalmente compartilháveis e imprimíveis.', faqs: [{ q: 'Posso combinar várias capturas de tela em um PDF?', a: 'Sim — selecione todas as suas capturas e escolha "Todas as imagens em um PDF". Cada captura vira uma página.' },{ q: 'Vocês armazenam meus arquivos?', a: 'Nunca. A conversão acontece completamente no seu navegador.' }], links: [{ href: '/png-to-jpg', label: 'PNG para JPG' },{ href: '/png-to-webp', label: 'PNG para WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
    },
    de: {
      'jpg-to-pdf': { h2a: 'Fotos als PDF speichern — ohne Upload', steps: ['<strong>Fügen Sie Ihre JPG-Fotos hinzu</strong> — von Kamera, Handy oder Social Media.','<strong>Wählen Sie den Modus</strong> — ein Foto pro PDF oder alle kombiniert.','<strong>Sofort herunterladen</strong> — alles geschieht in Ihrem Browser.'], h2b: 'Verwandeln Sie Ihre Fotos in PDF-Dokumente', body: '<p>Konvertieren Sie Urlaubsfotos, Ausweisbilder oder Produktfotos in PDF ohne Upload. Ideal für Kamera- und Social-Media-Fotos.</p>', h3why: 'Wann sollten Sie Fotos in PDF konvertieren?', why: 'PDF bewahrt Ihre Fotos in voller Qualität und macht sie einfach per E-Mail zu versenden oder auf Portale hochzuladen.', faqs: [{ q: 'Kann ich Handyfotos in PDF konvertieren?', a: 'Ja. Handys speichern Fotos standardmäßig als JPG. Wählen Sie sie aus und erhalten Sie sofort ein PDF.' },{ q: 'Speichern Sie meine Fotos?', a: 'Niemals. Die gesamte Verarbeitung erfolgt lokal in Ihrem Browser.' }], links: [{ href: '/jpg-to-png', label: 'JPG zu PNG' },{ href: '/jpg-to-webp', label: 'JPG zu WebP' },{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' }] },
      'png-to-pdf': { h2a: 'Screenshots und Grafiken in PDF konvertieren', steps: ['<strong>Fügen Sie Ihre PNG-Dateien hinzu</strong> — Screenshots, Logos oder Design-Exporte.','<strong>Wählen Sie den PDF-Modus</strong> — einer pro Datei oder alles in einem Dokument.','<strong>Laden Sie Ihr PDF herunter</strong> — sofort generiert ohne Server-Upload.'], h2b: 'Screenshots, Logos und Grafiken in PDF umwandeln', body: '<p>PNG ist das ideale Format für Screenshots, UI-Mockups und Logos mit Transparenz. Konvertieren Sie sie in PDF zum einfachen Teilen — alles in Ihrem Browser.</p>', h3why: 'Warum PNG-Grafiken in PDF konvertieren?', why: 'PDF bewahrt die Schärfe und Transparenz Ihrer PNG-Grafiken und macht sie universell teilbar und druckbar.', faqs: [{ q: 'Kann ich mehrere Screenshots in einem PDF zusammenführen?', a: 'Ja — wählen Sie alle Ihre Screenshots und klicken Sie auf "Alle Bilder in einem PDF". Jeder Screenshot wird eine Seite.' },{ q: 'Speichern Sie meine Dateien?', a: 'Niemals. Die Konvertierung erfolgt vollständig in Ihrem Browser.' }], links: [{ href: '/png-to-jpg', label: 'PNG zu JPG' },{ href: '/png-to-webp', label: 'PNG zu WebP' },{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' }] },
    },
    ar: {
      'jpg-to-pdf': { h2a: 'كيفية حفظ الصور الفوتوغرافية كـ PDF', steps: ['<strong>أضف صورك الفوتوغرافية</strong> — من الكاميرا أو الهاتف أو وسائل التواصل.','<strong>اختر الوضع</strong> — صورة واحدة لكل PDF أو الكل مجتمعة.','<strong>حمّل فوراً</strong> — كل شيء يتم في متصفحك.'], h2b: 'حوّل صورك الفوتوغرافية إلى مستندات PDF', body: '<p>حوّل صور السفر وصور الهوية وصور المنتجات إلى PDF بدون رفع أي ملف. مثالي لصور الكاميرا ووسائل التواصل الاجتماعي.</p>', h3why: 'متى تحوّل الصور إلى PDF؟', why: 'PDF يحافظ على صورك بجودة كاملة ويجعلها سهلة الإرسال بالبريد الإلكتروني أو الرفع على البوابات الرسمية.', faqs: [{ q: 'هل يمكنني تحويل صور الهاتف إلى PDF؟', a: 'نعم. الهواتف تحفظ الصور بتنسيق JPG افتراضياً. اخترها واحصل على PDF فوراً.' },{ q: 'هل تحتفظون بصوري؟', a: 'أبداً. تتم جميع المعالجة محلياً في متصفحك.' }], links: [{ href: '/jpg-to-png', label: 'JPG إلى PNG' },{ href: '/jpg-to-webp', label: 'JPG إلى WebP' },{ href: '/compress', label: 'ضغط' },{ href: '/resize', label: 'تغيير الحجم' }] },
      'png-to-pdf': { h2a: 'كيفية تحويل لقطات الشاشة والرسومات إلى PDF', steps: ['<strong>أضف ملفات PNG</strong> — لقطات شاشة أو شعارات أو تصاميم.','<strong>اختر وضع PDF</strong> — واحد لكل ملف أو الكل في مستند واحد.','<strong>حمّل PDF</strong> — يتم إنشاؤه فوراً بدون رفع للخادم.'], h2b: 'حوّل لقطات الشاشة والشعارات والرسومات إلى PDF', body: '<p>PNG هو التنسيق المثالي للقطات الشاشة ونماذج الواجهات والشعارات الشفافة. حوّلها إلى PDF لمشاركتها بسهولة — كل شيء في متصفحك.</p>', h3why: 'لماذا تحويل رسومات PNG إلى PDF؟', why: 'PDF يحافظ على حدة ووضوح رسومات PNG مع جعلها قابلة للمشاركة والطباعة عالمياً.', faqs: [{ q: 'هل يمكنني دمج عدة لقطات شاشة في PDF واحد؟', a: 'نعم — اختر جميع لقطاتك واختر "جميع الصور في PDF واحد". كل لقطة تصبح صفحة.' },{ q: 'هل تحتفظون بملفاتي؟', a: 'أبداً. التحويل يتم بالكامل في متصفحك.' }], links: [{ href: '/png-to-jpg', label: 'PNG إلى JPG' },{ href: '/png-to-webp', label: 'PNG إلى WebP' },{ href: '/compress', label: 'ضغط' },{ href: '/resize', label: 'تغيير الحجم' }] },
    },
  }

  function getLang() { return localStorage.getItem('rc_lang') || 'en' }
  function buildSeoSection() {
    const lang = getLang()
    const langSeo = seoPdf[lang] || seoPdf['en']
    const seo = langSeo[slug] || seoPdf['en'][slug]
    return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</div></div>`
  }

  const pdfTitles = { en: { jpg: 'JPG to PDF', png: 'PNG to PDF' }, fr: { jpg: 'JPG en PDF', png: 'PNG en PDF' }, es: { jpg: 'JPG a PDF', png: 'PNG a PDF' }, pt: { jpg: 'JPG para PDF', png: 'PNG para PDF' }, de: { jpg: 'JPG zu PDF', png: 'PNG zu PDF' }, ar: { jpg: 'JPG إلى PDF', png: 'PNG إلى PDF' } }
  const pdfDescs = { en: { jpg: 'Turn photos, camera images, and social media pictures into PDF documents. No upload needed.', png: 'Convert screenshots, logos, graphics, and transparent images to PDF. No upload needed.' }, fr: { jpg: 'Transformez vos photos et images en documents PDF. Aucun téléchargement nécessaire.', png: 'Convertissez captures d\'écran, logos et graphiques en PDF. Aucun téléchargement nécessaire.' }, es: { jpg: 'Convierte fotos e imágenes de cámara en documentos PDF. Sin subida necesaria.', png: 'Convierte capturas de pantalla, logos y gráficos en PDF. Sin subida necesaria.' }, pt: { jpg: 'Transforme fotos e imagens de câmera em documentos PDF. Sem upload necessário.', png: 'Converta capturas de tela, logos e gráficos em PDF. Sem upload necessário.' }, de: { jpg: 'Verwandeln Sie Fotos und Kamerabilder in PDF-Dokumente. Kein Upload nötig.', png: 'Konvertieren Sie Screenshots, Logos und Grafiken in PDF. Kein Upload nötig.' }, ar: { jpg: 'حوّل الصور الفوتوغرافية وصور الكاميرا إلى مستندات PDF. بدون رفع.', png: 'حوّل لقطات الشاشة والشعارات والرسومات إلى PDF. بدون رفع.' } }
  const _lang = getLang()
  const _key = isPng ? 'png' : 'jpg'
  const _titleText = (pdfTitles[_lang] || pdfTitles['en'])[_key]
  const toolDesc = (pdfDescs[_lang] || pdfDescs['en'])[_key]
  const titleWords = _titleText.split(' ')
  const titleHTML = titleWords.slice(0, -1).join(' ') + ` <em style="font-style:italic; color:#C84B31;">${titleWords[titleWords.length - 1]}</em>`

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
      <div class="settings-panel">
        <div class="settings-label">${t.pdf_options}</div>
        <div class="settings-row">
          <div class="settings-row-label" style="font-size:11px; color:#9A8A7A;">${t.pdf_mode_label ?? 'Pages'}</div>
          <div class="seg-group"><button class="seg-btn active" id="modeOne">${t.pdf_mode_one}</button><button class="seg-btn" id="modeAll">${t.pdf_mode_all}</button></div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label" style="font-size:11px; color:#9A8A7A;">${t.pdf_orientation ?? 'Orientation'}</div>
          <div class="seg-group" id="orientGroup"><button class="seg-btn active" data-val="portrait">${t.pdf_portrait ?? 'Portrait'}</button><button class="seg-btn" data-val="landscape">${t.pdf_landscape ?? 'Landscape'}</button></div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label" style="font-size:11px; color:#9A8A7A;">${t.pdf_size ?? 'Page size'}</div>
          <div class="seg-group" id="sizeGroup"><button class="seg-btn active" data-val="fit">${t.pdf_size_fit ?? 'Fit'}</button><button class="seg-btn" data-val="a4">A4</button><button class="seg-btn" data-val="letter">${t.pdf_size_letter ?? 'Letter'}</button></div>
        </div>
        <div class="settings-row">
          <div class="settings-row-label" style="font-size:11px; color:#9A8A7A;">${t.pdf_margin ?? 'Margin'}</div>
          <div class="seg-group" id="marginGroup"><button class="seg-btn active" data-val="none">${t.pdf_margin_none ?? 'None'}</button><button class="seg-btn" data-val="small">${t.pdf_margin_small ?? 'Small'}</button><button class="seg-btn" data-val="big">${t.pdf_margin_big ?? 'Big'}</button></div>
        </div>
      </div>
      <button id="convertBtn" disabled style="width:100%; padding:13px; border:none; border-radius:10px; background:#C4B8A8; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:not-allowed; opacity:0.7; margin-bottom:10px;">${t.pdf_btn}</button>
      <div id="downloadArea" style="display:none; flex-direction:column; gap:8px;"></div>
    </div>
    ${buildSeoSection()}
  `

  injectHeader()

  const fileInput    = document.getElementById('fileInput')
  const convertBtn   = document.getElementById('convertBtn')
  const downloadArea = document.getElementById('downloadArea')
  const previewGrid  = document.getElementById('previewGrid')
  const warning      = document.getElementById('warning')
  const modeOne      = document.getElementById('modeOne')
  const modeAll      = document.getElementById('modeAll')

  let selectedFiles = [], pdfMode = 'one', downloadUrls = []

  function wireSegGroup(groupId, settingsKey) {
    document.getElementById(groupId).addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn')
      if (!btn) return
      document.querySelectorAll(`#${groupId} .seg-btn`).forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      pageSettings[settingsKey] = btn.dataset.val
    })
  }
  wireSegGroup('orientGroup', 'orientation')
  wireSegGroup('sizeGroup',   'size')
  wireSegGroup('marginGroup', 'margin')

  function setDisabled()   { convertBtn.disabled = true;  convertBtn.textContent = t.pdf_btn; convertBtn.style.background = '#C4B8A8'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '0.7' }
  function setIdle()       { convertBtn.disabled = false; convertBtn.textContent = t.pdf_btn; convertBtn.style.background = '#C84B31'; convertBtn.style.cursor = 'pointer';     convertBtn.style.opacity = '1'   }
  function setConverting() { convertBtn.disabled = true;  convertBtn.textContent = t.pdf_btn_loading; convertBtn.style.background = '#9A8A7A'; convertBtn.style.cursor = 'not-allowed'; convertBtn.style.opacity = '1' }

  function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 4000) }
  function cleanupUrls()    { downloadUrls.forEach(u => URL.revokeObjectURL(u)); downloadUrls = [] }

  modeOne.addEventListener('click', () => { pdfMode = 'one'; modeOne.classList.add('active'); modeAll.classList.remove('active') })
  modeAll.addEventListener('click', () => { pdfMode = 'all'; modeAll.classList.add('active'); modeOne.classList.remove('active') })

  function renderPreviews() {
    if (!selectedFiles.length) { previewGrid.style.display = 'none'; previewGrid.innerHTML = ''; return }
    previewGrid.style.display = 'grid'
    previewGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))'
    previewGrid.style.gap = '12px'
    previewGrid.innerHTML = selectedFiles.map((f, i) => {
      const url = URL.createObjectURL(f)
      return `<div class="preview-card"><img src="${url}" alt="${f.name}" onload="URL.revokeObjectURL(this.src)" /><span class="page-num">p.${i + 1}</span><button class="remove-btn" data-index="${i}">✕</button><div class="fname">${f.name}</div></div>`
    }).join('')
    previewGrid.innerHTML += `<label id="addMoreBtn" for="fileInput" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:158px; border:2px dashed #CCC; border-radius:10px; cursor:pointer; color:#999; font-size:13px; gap:6px;"><span style="font-size:28px;">+</span><span>${t.add_more}</span></label>`
    previewGrid.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFiles.splice(parseInt(btn.getAttribute('data-index')), 1)
        cleanupUrls(); downloadArea.style.display = 'none'; downloadArea.innerHTML = ''
        renderPreviews()
        if (selectedFiles.length) setIdle(); else setDisabled()
      })
    })
  }

  function validateAndAdd(incoming) {
    const valid  = incoming.filter(f => f.type === inputMime && f.size <= LIMITS.MAX_PER_FILE_BYTES)
    const wrong  = incoming.filter(f => f.type !== inputMime)
    const tooBig = incoming.filter(f => f.type === inputMime && f.size > LIMITS.MAX_PER_FILE_BYTES)
    if (wrong.length)  showWarning(`${t.warn_wrong_fmt_tool} ${inputLabel} ${t.warn_files} ${wrong.length} ${t.warn_wrong_format}`)
    if (tooBig.length) showWarning(`${tooBig.length} ${t.warn_too_large}`)
    // Allow duplicates — just append, no deduplication
    let merged = [...selectedFiles, ...valid]
    if (merged.length > LIMITS.MAX_FILES) merged = merged.slice(0, LIMITS.MAX_FILES)
    while (totalBytes(merged) > LIMITS.MAX_TOTAL_BYTES && merged.length > 0) merged.pop()
    selectedFiles = merged
    cleanupUrls(); downloadArea.style.display = 'none'; downloadArea.innerHTML = ''
    renderPreviews()
    if (selectedFiles.length) setIdle(); else setDisabled()
  }

  // ── FIXED: reset input so same file can be re-selected ──
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
          const blob = await imageFilesToPdfBlob([selectedFiles[i]], () => {})
          const url = URL.createObjectURL(blob); downloadUrls.push(url)
          const base = sanitizeBaseName(selectedFiles[i].name)
          links.push({ url, name: `${base}.pdf`, size: blob.size })
        }
      } else {
        const blob = await imageFilesToPdfBlob(selectedFiles, (cur, total) => {
          convertBtn.textContent = `${t.pdf_btn_loading} ${cur}/${total}...`
        })
        const url = URL.createObjectURL(blob); downloadUrls.push(url)
        links.push({ url, name: 'images.pdf', size: blob.size })
      }
      downloadArea.innerHTML = links.map(l =>
        `<a href="${l.url}" download="${l.name}" style="display:block; width:100%; box-sizing:border-box; text-align:center; padding:13px; border-radius:10px; background:#2C1810; text-decoration:none; color:#F5F0E8; font-family:'Fraunces',serif; font-weight:700; font-size:15px;">${t.download} ${l.name} (${formatSize(l.size)})</a>`
      ).join('')
      downloadArea.style.display = 'flex'
      setIdle()
    } catch (err) {
      alert(err?.message || 'PDF conversion error')
      if (selectedFiles.length) setIdle(); else setDisabled()
    }
  })
}