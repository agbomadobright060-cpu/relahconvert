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
    it: {
      'jpg-to-pdf': { h2a: 'Come salvare le foto come PDF', steps: ['<strong>Aggiungi le tue foto JPG</strong> — dalla fotocamera, telefono o social media.','<strong>Scegli la modalità</strong> — una foto per PDF o tutte combinate.','<strong>Scarica istantaneamente</strong> — tutto avviene nel tuo browser.'], h2b: 'Trasforma le tue foto in documenti PDF', body: '<p>Converti foto di viaggio, documenti d\'identità o foto prodotto in PDF senza caricare nulla. Ideale per foto da fotocamera e social media.</p>', h3why: 'Quando convertire foto in PDF?', why: 'Il PDF mantiene le foto in piena qualità rendendole facili da inviare via email o caricare su portali ufficiali.', faqs: [{ q: 'Posso convertire foto del telefono in PDF?', a: 'Sì. I telefoni salvano le foto in JPG per impostazione predefinita. Selezionale e ottieni un PDF istantaneamente.' },{ q: 'Conservate le mie foto?', a: 'Mai. Tutta l\'elaborazione avviene localmente nel browser.' }], links: [{ href: '/jpg-to-png', label: 'JPG in PNG' },{ href: '/jpg-to-webp', label: 'JPG in WebP' },{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' }] },
      'png-to-pdf': { h2a: 'Come convertire screenshot e grafiche in PDF', steps: ['<strong>Aggiungi i file PNG</strong> — screenshot, loghi o esportazioni di design.','<strong>Scegli la modalità PDF</strong> — uno per file o tutto in un unico documento.','<strong>Scarica il PDF</strong> — generato istantaneamente senza caricamento server.'], h2b: 'Converti screenshot, loghi e grafiche in PDF', body: '<p>Il PNG è il formato ideale per screenshot, mockup UI e loghi con trasparenza. Convertili in PDF per condividerli facilmente — tutto nel browser.</p>', h3why: 'Perché convertire grafiche PNG in PDF?', why: 'Il PDF preserva la nitidezza e la trasparenza delle grafiche PNG rendendole universalmente condivisibili e stampabili.', faqs: [{ q: 'Posso combinare più screenshot in un PDF?', a: 'Sì — seleziona tutti gli screenshot e scegli "Tutte le immagini in un PDF". Ogni screenshot diventa una pagina.' },{ q: 'Conservate i miei file?', a: 'Mai. La conversione avviene completamente nel browser.' }], links: [{ href: '/png-to-jpg', label: 'PNG in JPG' },{ href: '/png-to-webp', label: 'PNG in WebP' },{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' }] },
    },
    ja: {
      'jpg-to-pdf': { h2a: '写真をPDFとして保存する方法', steps: ['<strong>JPG写真を追加</strong> — カメラ、スマートフォン、SNSから。','<strong>モードを選択</strong> — 1枚ずつPDFまたはすべてを結合。','<strong>即座にダウンロード</strong> — すべてブラウザ内で完了。'], h2b: '写真をPDFドキュメントに変換', body: '<p>旅行写真、身分証明書、商品写真をアップロードなしでPDFに変換。カメラやSNSの写真に最適。</p>', h3why: '写真をPDFに変換するタイミング', why: 'PDFは写真をフル品質で保持し、メールやポータルへの提出を容易にします。', faqs: [{ q: 'スマートフォンの写真をPDFに変換できますか？', a: 'はい。スマートフォンはデフォルトでJPGで保存します。選択するだけで即座にPDFが生成されます。' },{ q: '写真を保存しますか？', a: 'いいえ。すべてブラウザ内でローカルに処理されます。' }], links: [{ href: '/jpg-to-png', label: 'JPGからPNG' },{ href: '/jpg-to-webp', label: 'JPGからWebP' },{ href: '/compress', label: '圧縮' },{ href: '/resize', label: 'リサイズ' }] },
      'png-to-pdf': { h2a: 'スクリーンショットとグラフィックをPDFに変換する方法', steps: ['<strong>PNGファイルを追加</strong> — スクリーンショット、ロゴ、デザインエクスポート。','<strong>PDFモードを選択</strong> — ファイルごとまたはすべてを1つのドキュメントに。','<strong>PDFをダウンロード</strong> — サーバーアップロードなしで即座に生成。'], h2b: 'スクリーンショット、ロゴ、グラフィックをPDFに変換', body: '<p>PNGはスクリーンショット、UIモックアップ、透過ロゴに最適な形式です。ブラウザ内でPDFに変換して簡単に共有できます。</p>', h3why: 'PNGグラフィックをPDFに変換する理由', why: 'PDFはPNGグラフィックの鮮明さと透明性を保持しながら、普遍的に共有・印刷可能にします。', faqs: [{ q: '複数のスクリーンショットを1つのPDFにまとめられますか？', a: 'はい — すべてのスクリーンショットを選択し「すべての画像を1つのPDFに」を選択。各スクリーンショットが1ページになります。' },{ q: 'ファイルを保存しますか？', a: 'いいえ。変換は完全にブラウザ内で行われます。' }], links: [{ href: '/png-to-jpg', label: 'PNGからJPG' },{ href: '/png-to-webp', label: 'PNGからWebP' },{ href: '/compress', label: '圧縮' },{ href: '/resize', label: 'リサイズ' }] },
    },
    ru: {
      'jpg-to-pdf': { h2a: 'Как сохранить фотографии как PDF', steps: ['<strong>Добавьте фото JPG</strong> — с камеры, телефона или соцсетей.','<strong>Выберите режим</strong> — одно фото на PDF или все вместе.','<strong>Скачайте мгновенно</strong> — всё происходит в браузере.'], h2b: 'Превратите фотографии в PDF-документы', body: '<p>Конвертируйте фотографии из путешествий, документы или фото товаров в PDF без загрузки. Идеально для фотографий с камеры и соцсетей.</p>', h3why: 'Когда конвертировать фото в PDF?', why: 'PDF сохраняет фотографии в полном качестве и делает их удобными для отправки по email или загрузки на порталы.', faqs: [{ q: 'Можно конвертировать фото с телефона в PDF?', a: 'Да. Телефоны сохраняют фото в JPG по умолчанию. Выберите их и получите PDF мгновенно.' },{ q: 'Вы сохраняете мои фото?', a: 'Никогда. Вся обработка происходит локально в браузере.' }], links: [{ href: '/jpg-to-png', label: 'JPG в PNG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/compress', label: 'Сжать' },{ href: '/resize', label: 'Изменить размер' }] },
      'png-to-pdf': { h2a: 'Как конвертировать скриншоты и графику в PDF', steps: ['<strong>Добавьте PNG-файлы</strong> — скриншоты, логотипы или дизайн-экспорты.','<strong>Выберите режим PDF</strong> — один на файл или всё в одном документе.','<strong>Скачайте PDF</strong> — генерируется мгновенно без загрузки на сервер.'], h2b: 'Конвертируйте скриншоты, логотипы и графику в PDF', body: '<p>PNG — идеальный формат для скриншотов, UI-макетов и логотипов с прозрачностью. Конвертируйте в PDF для удобного обмена — всё в браузере.</p>', h3why: 'Зачем конвертировать PNG-графику в PDF?', why: 'PDF сохраняет чёткость и прозрачность PNG-графики, делая её универсально доступной для обмена и печати.', faqs: [{ q: 'Можно объединить несколько скриншотов в один PDF?', a: 'Да — выберите все скриншоты и нажмите «Все изображения в один PDF». Каждый скриншот станет страницей.' },{ q: 'Вы сохраняете мои файлы?', a: 'Никогда. Конвертация происходит полностью в браузере.' }], links: [{ href: '/png-to-jpg', label: 'PNG в JPG' },{ href: '/png-to-webp', label: 'PNG в WebP' },{ href: '/compress', label: 'Сжать' },{ href: '/resize', label: 'Изменить размер' }] },
    },
    ko: {
      'jpg-to-pdf': { h2a: '사진을 PDF로 저장하는 방법', steps: ['<strong>JPG 사진 추가</strong> — 카메라, 스마트폰, SNS에서.','<strong>모드 선택</strong> — 사진당 하나의 PDF 또는 모두 결합.','<strong>즉시 다운로드</strong> — 모두 브라우저에서 처리.'], h2b: '사진을 PDF 문서로 변환', body: '<p>여행 사진, 신분증, 제품 사진을 업로드 없이 PDF로 변환. 카메라 및 SNS 사진에 이상적.</p>', h3why: '사진을 PDF로 변환해야 할 때', why: 'PDF는 사진을 최고 품질로 유지하며 이메일 전송이나 공식 포털 업로드를 쉽게 합니다.', faqs: [{ q: '스마트폰 사진을 PDF로 변환할 수 있나요?', a: '네. 스마트폰은 기본적으로 JPG로 저장합니다. 선택하면 즉시 PDF가 생성됩니다.' },{ q: '사진을 저장하나요?', a: '절대 아닙니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.' }], links: [{ href: '/jpg-to-png', label: 'JPG를 PNG로' },{ href: '/jpg-to-webp', label: 'JPG를 WebP로' },{ href: '/compress', label: '압축' },{ href: '/resize', label: '크기 조정' }] },
      'png-to-pdf': { h2a: '스크린샷과 그래픽을 PDF로 변환하는 방법', steps: ['<strong>PNG 파일 추가</strong> — 스크린샷, 로고, 디자인 내보내기.','<strong>PDF 모드 선택</strong> — 파일당 하나 또는 모두 하나의 문서로.','<strong>PDF 다운로드</strong> — 서버 업로드 없이 즉시 생성.'], h2b: '스크린샷, 로고, 그래픽을 PDF로 변환', body: '<p>PNG는 스크린샷, UI 목업, 투명 로고에 이상적인 형식입니다. 브라우저에서 PDF로 변환하여 쉽게 공유하세요.</p>', h3why: 'PNG 그래픽을 PDF로 변환하는 이유', why: 'PDF는 PNG 그래픽의 선명함과 투명성을 보존하면서 보편적으로 공유 및 인쇄 가능하게 합니다.', faqs: [{ q: '여러 스크린샷을 하나의 PDF로 합칠 수 있나요?', a: '네 — 모든 스크린샷을 선택하고 "모든 이미지를 하나의 PDF로"를 선택하세요.' },{ q: '파일을 저장하나요?', a: '절대 아닙니다. 변환은 완전히 브라우저에서 수행됩니다.' }], links: [{ href: '/png-to-jpg', label: 'PNG를 JPG로' },{ href: '/png-to-webp', label: 'PNG를 WebP로' },{ href: '/compress', label: '압축' },{ href: '/resize', label: '크기 조정' }] },
    },
    zh: {
      'jpg-to-pdf': { h2a: '如何将照片保存为PDF', steps: ['<strong>添加JPG照片</strong> — 来自相机、手机或社交媒体。','<strong>选择模式</strong> — 每张照片一个PDF或全部合并。','<strong>即时下载</strong> — 全部在浏览器中完成。'], h2b: '将照片转换为PDF文档', body: '<p>将旅行照片、证件照或产品照片转换为PDF，无需上传。适用于相机和社交媒体照片。</p>', h3why: '何时将照片转换为PDF？', why: 'PDF以完整质量保存照片，便于通过电子邮件发送或上传到官方门户。', faqs: [{ q: '可以将手机照片转换为PDF吗？', a: '可以。手机默认以JPG格式保存照片。选择后即可立即获得PDF。' },{ q: '你们会保存我的照片吗？', a: '绝不会。所有处理都在浏览器中本地完成。' }], links: [{ href: '/jpg-to-png', label: 'JPG转PNG' },{ href: '/jpg-to-webp', label: 'JPG转WebP' },{ href: '/compress', label: '压缩' },{ href: '/resize', label: '调整大小' }] },
      'png-to-pdf': { h2a: '如何将截图和图形转换为PDF', steps: ['<strong>添加PNG文件</strong> — 截图、徽标或设计导出。','<strong>选择PDF模式</strong> — 每个文件一个或全部合并到一个文档。','<strong>下载PDF</strong> — 无需服务器上传即时生成。'], h2b: '将截图、徽标和图形转换为PDF', body: '<p>PNG是截图、UI模型和透明徽标的理想格式。在浏览器中转换为PDF以便轻松共享。</p>', h3why: '为什么将PNG图形转换为PDF？', why: 'PDF保留PNG图形的清晰度和透明度，使其可以普遍共享和打印。', faqs: [{ q: '可以将多个截图合并为一个PDF吗？', a: '可以 — 选择所有截图并选择"所有图片合并为一个PDF"。每个截图成为一页。' },{ q: '你们会保存我的文件吗？', a: '绝不会。转换完全在浏览器中完成。' }], links: [{ href: '/png-to-jpg', label: 'PNG转JPG' },{ href: '/png-to-webp', label: 'PNG转WebP' },{ href: '/compress', label: '压缩' },{ href: '/resize', label: '调整大小' }] },
    },
    'zh-TW': {
      'jpg-to-pdf': { h2a: '如何將照片儲存為PDF', steps: ['<strong>新增JPG照片</strong> — 來自相機、手機或社群媒體。','<strong>選擇模式</strong> — 每張照片一個PDF或全部合併。','<strong>即時下載</strong> — 全部在瀏覽器中完成。'], h2b: '將照片轉換為PDF文件', body: '<p>將旅行照片、證件照或產品照片轉換為PDF，無需上傳。適用於相機和社群媒體照片。</p>', h3why: '何時將照片轉換為PDF？', why: 'PDF以完整品質保存照片，便於透過電子郵件發送或上傳到官方入口網站。', faqs: [{ q: '可以將手機照片轉換為PDF嗎？', a: '可以。手機預設以JPG格式儲存照片。選擇後即可立即獲得PDF。' },{ q: '你們會儲存我的照片嗎？', a: '絕不會。所有處理都在瀏覽器中本地完成。' }], links: [{ href: '/jpg-to-png', label: 'JPG轉PNG' },{ href: '/jpg-to-webp', label: 'JPG轉WebP' },{ href: '/compress', label: '壓縮' },{ href: '/resize', label: '調整大小' }] },
      'png-to-pdf': { h2a: '如何將截圖和圖形轉換為PDF', steps: ['<strong>新增PNG檔案</strong> — 截圖、標誌或設計匯出。','<strong>選擇PDF模式</strong> — 每個檔案一個或全部合併到一個文件。','<strong>下載PDF</strong> — 無需伺服器上傳即時產生。'], h2b: '將截圖、標誌和圖形轉換為PDF', body: '<p>PNG是截圖、UI原型和透明標誌的理想格式。在瀏覽器中轉換為PDF以便輕鬆分享。</p>', h3why: '為什麼將PNG圖形轉換為PDF？', why: 'PDF保留PNG圖形的清晰度和透明度，使其可以普遍分享和列印。', faqs: [{ q: '可以將多個截圖合併為一個PDF嗎？', a: '可以 — 選擇所有截圖並選擇「所有圖片合併為一個PDF」。' },{ q: '你們會儲存我的檔案嗎？', a: '絕不會。轉換完全在瀏覽器中完成。' }], links: [{ href: '/png-to-jpg', label: 'PNG轉JPG' },{ href: '/png-to-webp', label: 'PNG轉WebP' },{ href: '/compress', label: '壓縮' },{ href: '/resize', label: '調整大小' }] },
    },
    bg: {
      'jpg-to-pdf': { h2a: 'Как да запазите снимки като PDF', steps: ['<strong>Добавете JPG снимки</strong> — от камера, телефон или социални мрежи.','<strong>Изберете режим</strong> — една снимка на PDF или всички комбинирани.','<strong>Изтеглете веднага</strong> — всичко се случва в браузъра.'], h2b: 'Превърнете снимките си в PDF документи', body: '<p>Конвертирайте снимки от пътувания, лични документи или продуктови снимки в PDF без качване.</p>', h3why: 'Кога да конвертирате снимки в PDF?', why: 'PDF запазва снимките в пълно качество и ги прави лесни за изпращане по имейл.', faqs: [{ q: 'Мога ли да конвертирам снимки от телефона в PDF?', a: 'Да. Телефоните запазват снимките в JPG по подразбиране.' },{ q: 'Съхранявате ли снимките ми?', a: 'Никога. Обработката е локална в браузъра.' }], links: [{ href: '/jpg-to-png', label: 'JPG към PNG' },{ href: '/jpg-to-webp', label: 'JPG към WebP' },{ href: '/compress', label: 'Компресиране' },{ href: '/resize', label: 'Преоразмеряване' }] },
      'png-to-pdf': { h2a: 'Как да конвертирате екранни снимки и графики в PDF', steps: ['<strong>Добавете PNG файлове</strong> — екранни снимки, лога или дизайн експорти.','<strong>Изберете PDF режим</strong> — един на файл или всичко в един документ.','<strong>Изтеглете PDF</strong> — генерирано мигновено без качване на сървър.'], h2b: 'Конвертирайте екранни снимки, лога и графики в PDF', body: '<p>PNG е идеалният формат за екранни снимки, UI макети и лога с прозрачност. Конвертирайте в PDF за лесно споделяне.</p>', h3why: 'Защо да конвертирате PNG графики в PDF?', why: 'PDF запазва остротата и прозрачността на PNG графиките.', faqs: [{ q: 'Мога ли да комбинирам няколко екранни снимки в един PDF?', a: 'Да — изберете всичките и натиснете "Всички изображения в един PDF".' },{ q: 'Съхранявате ли файловете ми?', a: 'Никога. Конвертирането е изцяло в браузъра.' }], links: [{ href: '/png-to-jpg', label: 'PNG към JPG' },{ href: '/png-to-webp', label: 'PNG към WebP' },{ href: '/compress', label: 'Компресиране' },{ href: '/resize', label: 'Преоразмеряване' }] },
    },
    ca: {
      'jpg-to-pdf': { h2a: 'Com desar fotos com a PDF', steps: ['<strong>Afegiu fotos JPG</strong> — de la càmera, telèfon o xarxes socials.','<strong>Trieu el mode</strong> — una foto per PDF o totes combinades.','<strong>Descarregueu a l\'instant</strong> — tot passa al navegador.'], h2b: 'Convertiu les vostres fotos en documents PDF', body: '<p>Convertiu fotos de viatges, documents d\'identitat o fotos de productes en PDF sense pujar res.</p>', h3why: 'Quan convertir fotos a PDF?', why: 'El PDF conserva les fotos en qualitat completa i les fa fàcils d\'enviar per correu.', faqs: [{ q: 'Puc convertir fotos del telèfon a PDF?', a: 'Sí. Els telèfons desen fotos en JPG per defecte.' },{ q: 'Deseu les meves fotos?', a: 'Mai. Tot el processament és local al navegador.' }], links: [{ href: '/jpg-to-png', label: 'JPG a PNG' },{ href: '/jpg-to-webp', label: 'JPG a WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
      'png-to-pdf': { h2a: 'Com convertir captures de pantalla i gràfics a PDF', steps: ['<strong>Afegiu fitxers PNG</strong> — captures, logos o exportacions de disseny.','<strong>Trieu el mode PDF</strong> — un per fitxer o tot en un document.','<strong>Descarregueu el PDF</strong> — generat a l\'instant sense pujada al servidor.'], h2b: 'Convertiu captures, logos i gràfics en PDF', body: '<p>El PNG és ideal per a captures de pantalla, maquetes UI i logos amb transparència. Convertiu-los a PDF al navegador.</p>', h3why: 'Per què convertir gràfics PNG a PDF?', why: 'El PDF preserva la nitidesa i transparència dels gràfics PNG.', faqs: [{ q: 'Puc combinar captures en un PDF?', a: 'Sí — seleccioneu-les totes i trieu "Totes les imatges en un PDF".' },{ q: 'Deseu els meus fitxers?', a: 'Mai. La conversió és completament al navegador.' }], links: [{ href: '/png-to-jpg', label: 'PNG a JPG' },{ href: '/png-to-webp', label: 'PNG a WebP' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }] },
    },
    nl: {
      'jpg-to-pdf': { h2a: 'Hoe foto\'s opslaan als PDF', steps: ['<strong>Voeg JPG-foto\'s toe</strong> — van camera, telefoon of social media.','<strong>Kies de modus</strong> — één foto per PDF of alles gecombineerd.','<strong>Direct downloaden</strong> — alles gebeurt in je browser.'], h2b: 'Verander je foto\'s in PDF-documenten', body: '<p>Converteer vakantiefoto\'s, identiteitsbewijzen of productfoto\'s naar PDF zonder te uploaden.</p>', h3why: 'Wanneer foto\'s naar PDF converteren?', why: 'PDF bewaart foto\'s in volledige kwaliteit en maakt ze makkelijk te e-mailen of uploaden naar portalen.', faqs: [{ q: 'Kan ik telefoonfoto\'s naar PDF converteren?', a: 'Ja. Telefoons slaan foto\'s standaard op als JPG. Selecteer ze en krijg direct een PDF.' },{ q: 'Bewaren jullie mijn foto\'s?', a: 'Nooit. Alle verwerking is lokaal in je browser.' }], links: [{ href: '/jpg-to-png', label: 'JPG naar PNG' },{ href: '/jpg-to-webp', label: 'JPG naar WebP' },{ href: '/compress', label: 'Comprimeren' },{ href: '/resize', label: 'Formaat wijzigen' }] },
      'png-to-pdf': { h2a: 'Hoe screenshots en afbeeldingen naar PDF converteren', steps: ['<strong>Voeg PNG-bestanden toe</strong> — screenshots, logo\'s of design-exports.','<strong>Kies PDF-modus</strong> — één per bestand of alles in één document.','<strong>Download je PDF</strong> — direct gegenereerd zonder server-upload.'], h2b: 'Converteer screenshots, logo\'s en afbeeldingen naar PDF', body: '<p>PNG is ideaal voor screenshots, UI-mockups en logo\'s met transparantie. Converteer ze naar PDF in je browser.</p>', h3why: 'Waarom PNG-afbeeldingen naar PDF converteren?', why: 'PDF behoudt de scherpte en transparantie van PNG-afbeeldingen.', faqs: [{ q: 'Kan ik meerdere screenshots in één PDF combineren?', a: 'Ja — selecteer alles en kies "Alle afbeeldingen in één PDF".' },{ q: 'Bewaren jullie mijn bestanden?', a: 'Nooit. De conversie is volledig in je browser.' }], links: [{ href: '/png-to-jpg', label: 'PNG naar JPG' },{ href: '/png-to-webp', label: 'PNG naar WebP' },{ href: '/compress', label: 'Comprimeren' },{ href: '/resize', label: 'Formaat wijzigen' }] },
    },
    el: {
      'jpg-to-pdf': { h2a: 'Πώς να αποθηκεύσετε φωτογραφίες ως PDF', steps: ['<strong>Προσθέστε φωτογραφίες JPG</strong> — από κάμερα, τηλέφωνο ή κοινωνικά δίκτυα.','<strong>Επιλέξτε λειτουργία</strong> — μία φωτογραφία ανά PDF ή όλες μαζί.','<strong>Κατεβάστε αμέσως</strong> — όλα γίνονται στο πρόγραμμα περιήγησης.'], h2b: 'Μετατρέψτε τις φωτογραφίες σας σε PDF', body: '<p>Μετατρέψτε φωτογραφίες ταξιδιών, ταυτοτήτων ή προϊόντων σε PDF χωρίς μεταφόρτωση.</p>', h3why: 'Πότε να μετατρέψετε φωτογραφίες σε PDF;', why: 'Το PDF διατηρεί τις φωτογραφίες σε πλήρη ποιότητα.', faqs: [{ q: 'Μπορώ να μετατρέψω φωτογραφίες τηλεφώνου σε PDF;', a: 'Ναι. Τα τηλέφωνα αποθηκεύουν σε JPG από προεπιλογή.' },{ q: 'Αποθηκεύετε τις φωτογραφίες μου;', a: 'Ποτέ. Όλη η επεξεργασία είναι τοπική.' }], links: [{ href: '/jpg-to-png', label: 'JPG σε PNG' },{ href: '/jpg-to-webp', label: 'JPG σε WebP' },{ href: '/compress', label: 'Συμπίεση' },{ href: '/resize', label: 'Αλλαγή μεγέθους' }] },
      'png-to-pdf': { h2a: 'Πώς να μετατρέψετε screenshots σε PDF', steps: ['<strong>Προσθέστε PNG αρχεία</strong> — screenshots, λογότυπα ή εξαγωγές σχεδιασμού.','<strong>Επιλέξτε λειτουργία PDF</strong> — ένα ανά αρχείο ή όλα σε ένα έγγραφο.','<strong>Κατεβάστε το PDF</strong> — δημιουργείται αμέσως.'], h2b: 'Μετατρέψτε screenshots και γραφικά σε PDF', body: '<p>Το PNG είναι ιδανικό για screenshots και λογότυπα με διαφάνεια. Μετατρέψτε τα σε PDF στο πρόγραμμα περιήγησής σας.</p>', h3why: 'Γιατί να μετατρέψετε PNG σε PDF;', why: 'Το PDF διατηρεί την ευκρίνεια και διαφάνεια.', faqs: [{ q: 'Μπορώ να συνδυάσω screenshots σε ένα PDF;', a: 'Ναι — επιλέξτε όλα και κάντε κλικ "Όλες οι εικόνες σε ένα PDF".' },{ q: 'Αποθηκεύετε τα αρχεία μου;', a: 'Ποτέ. Η μετατροπή γίνεται στο πρόγραμμα περιήγησης.' }], links: [{ href: '/png-to-jpg', label: 'PNG σε JPG' },{ href: '/png-to-webp', label: 'PNG σε WebP' },{ href: '/compress', label: 'Συμπίεση' },{ href: '/resize', label: 'Αλλαγή μεγέθους' }] },
    },
    hi: {
      'jpg-to-pdf': { h2a: 'फ़ोटो को PDF के रूप में कैसे सहेजें', steps: ['<strong>JPG फ़ोटो जोड़ें</strong> — कैमरा, फ़ोन या सोशल मीडिया से।','<strong>मोड चुनें</strong> — प्रति फ़ोटो एक PDF या सभी संयुक्त।','<strong>तुरंत डाउनलोड करें</strong> — सब ब्राउज़र में होता है।'], h2b: 'अपनी फ़ोटो को PDF दस्तावेज़ में बदलें', body: '<p>यात्रा फ़ोटो, पहचान पत्र या उत्पाद फ़ोटो को बिना अपलोड किए PDF में बदलें।</p>', h3why: 'फ़ोटो को PDF में कब बदलें?', why: 'PDF फ़ोटो को पूर्ण गुणवत्ता में रखता है और ईमेल या पोर्टल पर अपलोड करना आसान बनाता है।', faqs: [{ q: 'क्या फ़ोन की फ़ोटो को PDF में बदल सकता हूँ?', a: 'हाँ। फ़ोन डिफ़ॉल्ट रूप से JPG में सहेजते हैं।' },{ q: 'क्या आप मेरी फ़ोटो सहेजते हैं?', a: 'कभी नहीं। सब ब्राउज़र में स्थानीय रूप से होता है।' }], links: [{ href: '/jpg-to-png', label: 'JPG से PNG' },{ href: '/jpg-to-webp', label: 'JPG से WebP' },{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/resize', label: 'आकार बदलें' }] },
      'png-to-pdf': { h2a: 'स्क्रीनशॉट और ग्राफ़िक्स को PDF में कैसे बदलें', steps: ['<strong>PNG फ़ाइलें जोड़ें</strong> — स्क्रीनशॉट, लोगो या डिज़ाइन निर्यात।','<strong>PDF मोड चुनें</strong> — प्रति फ़ाइल एक या सभी एक दस्तावेज़ में।','<strong>PDF डाउनलोड करें</strong> — सर्वर अपलोड के बिना तुरंत बनाया गया।'], h2b: 'स्क्रीनशॉट, लोगो और ग्राफ़िक्स को PDF में बदलें', body: '<p>PNG स्क्रीनशॉट, UI मॉकअप और पारदर्शी लोगो के लिए आदर्श है। ब्राउज़र में PDF में बदलें।</p>', h3why: 'PNG ग्राफ़िक्स को PDF में क्यों बदलें?', why: 'PDF PNG ग्राफ़िक्स की तीक्ष्णता और पारदर्शिता को संरक्षित करता है।', faqs: [{ q: 'क्या कई स्क्रीनशॉट को एक PDF में जोड़ सकता हूँ?', a: 'हाँ — सभी चुनें और "सभी छवियाँ एक PDF में" चुनें।' },{ q: 'क्या आप मेरी फ़ाइलें सहेजते हैं?', a: 'कभी नहीं। रूपांतरण पूरी तरह ब्राउज़र में होता है।' }], links: [{ href: '/png-to-jpg', label: 'PNG से JPG' },{ href: '/png-to-webp', label: 'PNG से WebP' },{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/resize', label: 'आकार बदलें' }] },
    },
    id: {
      'jpg-to-pdf': { h2a: 'Cara menyimpan foto sebagai PDF', steps: ['<strong>Tambahkan foto JPG</strong> — dari kamera, ponsel, atau media sosial.','<strong>Pilih mode</strong> — satu foto per PDF atau semua digabung.','<strong>Download langsung</strong> — semua terjadi di browser.'], h2b: 'Ubah foto Anda menjadi dokumen PDF', body: '<p>Konversi foto liburan, KTP, atau foto produk ke PDF tanpa upload.</p>', h3why: 'Kapan mengonversi foto ke PDF?', why: 'PDF menjaga foto dalam kualitas penuh dan memudahkan pengiriman email atau upload ke portal resmi.', faqs: [{ q: 'Bisakah mengonversi foto ponsel ke PDF?', a: 'Ya. Ponsel menyimpan foto dalam JPG secara default.' },{ q: 'Apakah Anda menyimpan foto saya?', a: 'Tidak pernah. Pemrosesan lokal di browser.' }], links: [{ href: '/jpg-to-png', label: 'JPG ke PNG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/compress', label: 'Kompres' },{ href: '/resize', label: 'Ubah Ukuran' }] },
      'png-to-pdf': { h2a: 'Cara mengonversi screenshot dan grafik ke PDF', steps: ['<strong>Tambahkan file PNG</strong> — screenshot, logo, atau ekspor desain.','<strong>Pilih mode PDF</strong> — satu per file atau semua dalam satu dokumen.','<strong>Download PDF</strong> — dibuat instan tanpa upload server.'], h2b: 'Konversi screenshot, logo, dan grafik ke PDF', body: '<p>PNG ideal untuk screenshot, mockup UI, dan logo transparan. Konversi ke PDF di browser.</p>', h3why: 'Mengapa mengonversi grafik PNG ke PDF?', why: 'PDF mempertahankan ketajaman dan transparansi grafik PNG.', faqs: [{ q: 'Bisakah menggabungkan beberapa screenshot dalam satu PDF?', a: 'Ya — pilih semua dan klik "Semua gambar dalam satu PDF".' },{ q: 'Apakah Anda menyimpan file saya?', a: 'Tidak pernah. Konversi sepenuhnya di browser.' }], links: [{ href: '/png-to-jpg', label: 'PNG ke JPG' },{ href: '/png-to-webp', label: 'PNG ke WebP' },{ href: '/compress', label: 'Kompres' },{ href: '/resize', label: 'Ubah Ukuran' }] },
    },
    ms: {
      'jpg-to-pdf': { h2a: 'Cara menyimpan foto sebagai PDF', steps: ['<strong>Tambah foto JPG</strong> — dari kamera, telefon, atau media sosial.','<strong>Pilih mod</strong> — satu foto per PDF atau semua digabungkan.','<strong>Muat turun serta-merta</strong> — semua berlaku dalam pelayar.'], h2b: 'Tukar foto anda kepada dokumen PDF', body: '<p>Tukar foto percutian, dokumen pengenalan atau foto produk kepada PDF tanpa muat naik.</p>', h3why: 'Bila perlu tukar foto kepada PDF?', why: 'PDF mengekalkan foto dalam kualiti penuh dan memudahkan penghantaran emel.', faqs: [{ q: 'Bolehkah tukar foto telefon kepada PDF?', a: 'Ya. Telefon menyimpan foto dalam JPG secara lalai.' },{ q: 'Adakah anda menyimpan foto saya?', a: 'Tidak pernah. Pemprosesan tempatan dalam pelayar.' }], links: [{ href: '/jpg-to-png', label: 'JPG ke PNG' },{ href: '/jpg-to-webp', label: 'JPG ke WebP' },{ href: '/compress', label: 'Mampat' },{ href: '/resize', label: 'Ubah Saiz' }] },
      'png-to-pdf': { h2a: 'Cara menukar tangkapan skrin dan grafik kepada PDF', steps: ['<strong>Tambah fail PNG</strong> — tangkapan skrin, logo, atau eksport reka bentuk.','<strong>Pilih mod PDF</strong> — satu per fail atau semua dalam satu dokumen.','<strong>Muat turun PDF</strong> — dijana serta-merta tanpa muat naik pelayan.'], h2b: 'Tukar tangkapan skrin, logo dan grafik kepada PDF', body: '<p>PNG sesuai untuk tangkapan skrin, mockup UI dan logo lutsinar. Tukar kepada PDF dalam pelayar.</p>', h3why: 'Mengapa tukar grafik PNG kepada PDF?', why: 'PDF mengekalkan ketajaman dan ketelusan grafik PNG.', faqs: [{ q: 'Boleh gabungkan beberapa tangkapan skrin dalam satu PDF?', a: 'Ya — pilih semua dan klik "Semua imej dalam satu PDF".' },{ q: 'Adakah anda menyimpan fail saya?', a: 'Tidak pernah. Penukaran sepenuhnya dalam pelayar.' }], links: [{ href: '/png-to-jpg', label: 'PNG ke JPG' },{ href: '/png-to-webp', label: 'PNG ke WebP' },{ href: '/compress', label: 'Mampat' },{ href: '/resize', label: 'Ubah Saiz' }] },
    },
    pl: {
      'jpg-to-pdf': { h2a: 'Jak zapisać zdjęcia jako PDF', steps: ['<strong>Dodaj zdjęcia JPG</strong> — z aparatu, telefonu lub mediów społecznościowych.','<strong>Wybierz tryb</strong> — jedno zdjęcie na PDF lub wszystkie połączone.','<strong>Pobierz natychmiast</strong> — wszystko dzieje się w przeglądarce.'], h2b: 'Zamień zdjęcia w dokumenty PDF', body: '<p>Konwertuj zdjęcia z podróży, dokumenty tożsamości lub zdjęcia produktów na PDF bez przesyłania.</p>', h3why: 'Kiedy konwertować zdjęcia na PDF?', why: 'PDF zachowuje zdjęcia w pełnej jakości i ułatwia wysyłanie e-mailem.', faqs: [{ q: 'Czy mogę konwertować zdjęcia z telefonu na PDF?', a: 'Tak. Telefony zapisują zdjęcia domyślnie w JPG.' },{ q: 'Czy przechowujecie moje zdjęcia?', a: 'Nigdy. Przetwarzanie lokalne w przeglądarce.' }], links: [{ href: '/jpg-to-png', label: 'JPG do PNG' },{ href: '/jpg-to-webp', label: 'JPG do WebP' },{ href: '/compress', label: 'Kompresja' },{ href: '/resize', label: 'Zmień rozmiar' }] },
      'png-to-pdf': { h2a: 'Jak konwertować zrzuty ekranu i grafiki na PDF', steps: ['<strong>Dodaj pliki PNG</strong> — zrzuty ekranu, loga lub eksporty projektów.','<strong>Wybierz tryb PDF</strong> — jeden na plik lub wszystko w jednym dokumencie.','<strong>Pobierz PDF</strong> — wygenerowany natychmiast bez przesyłania na serwer.'], h2b: 'Konwertuj zrzuty ekranu, loga i grafiki na PDF', body: '<p>PNG to idealny format dla zrzutów ekranu, makiet UI i logotypów z przezroczystością. Konwertuj na PDF w przeglądarce.</p>', h3why: 'Dlaczego konwertować grafiki PNG na PDF?', why: 'PDF zachowuje ostrość i przezroczystość grafik PNG.', faqs: [{ q: 'Czy mogę połączyć kilka zrzutów ekranu w jeden PDF?', a: 'Tak — wybierz wszystkie i kliknij "Wszystkie obrazy w jednym PDF".' },{ q: 'Czy przechowujecie moje pliki?', a: 'Nigdy. Konwersja w całości w przeglądarce.' }], links: [{ href: '/png-to-jpg', label: 'PNG do JPG' },{ href: '/png-to-webp', label: 'PNG do WebP' },{ href: '/compress', label: 'Kompresja' },{ href: '/resize', label: 'Zmień rozmiar' }] },
    },
    sv: {
      'jpg-to-pdf': { h2a: 'Hur man sparar foton som PDF', steps: ['<strong>Lägg till JPG-foton</strong> — från kamera, telefon eller sociala medier.','<strong>Välj läge</strong> — ett foto per PDF eller alla kombinerade.','<strong>Ladda ner direkt</strong> — allt sker i din webbläsare.'], h2b: 'Förvandla dina foton till PDF-dokument', body: '<p>Konvertera semesterfoton, ID-foton eller produktbilder till PDF utan uppladdning.</p>', h3why: 'När ska man konvertera foton till PDF?', why: 'PDF bevarar foton i full kvalitet och gör dem enkla att e-posta eller ladda upp till portaler.', faqs: [{ q: 'Kan jag konvertera telefonfoton till PDF?', a: 'Ja. Telefoner sparar foton som JPG som standard.' },{ q: 'Sparar ni mina foton?', a: 'Aldrig. All bearbetning sker lokalt i webbläsaren.' }], links: [{ href: '/jpg-to-png', label: 'JPG till PNG' },{ href: '/jpg-to-webp', label: 'JPG till WebP' },{ href: '/compress', label: 'Komprimera' },{ href: '/resize', label: 'Ändra storlek' }] },
      'png-to-pdf': { h2a: 'Hur man konverterar skärmbilder och grafik till PDF', steps: ['<strong>Lägg till PNG-filer</strong> — skärmbilder, logotyper eller designexporter.','<strong>Välj PDF-läge</strong> — en per fil eller allt i ett dokument.','<strong>Ladda ner din PDF</strong> — genererad direkt utan serveruppladdning.'], h2b: 'Konvertera skärmbilder, logotyper och grafik till PDF', body: '<p>PNG är perfekt för skärmbilder, UI-mockups och logotyper med transparens. Konvertera till PDF i webbläsaren.</p>', h3why: 'Varför konvertera PNG-grafik till PDF?', why: 'PDF bevarar skärpan och transparensen hos PNG-grafik.', faqs: [{ q: 'Kan jag kombinera flera skärmbilder i en PDF?', a: 'Ja — välj alla och klicka "Alla bilder i en PDF".' },{ q: 'Sparar ni mina filer?', a: 'Aldrig. Konverteringen sker helt i webbläsaren.' }], links: [{ href: '/png-to-jpg', label: 'PNG till JPG' },{ href: '/png-to-webp', label: 'PNG till WebP' },{ href: '/compress', label: 'Komprimera' },{ href: '/resize', label: 'Ändra storlek' }] },
    },
    th: {
      'jpg-to-pdf': { h2a: 'วิธีบันทึกรูปภาพเป็น PDF', steps: ['<strong>เพิ่มรูปภาพ JPG</strong> — จากกล้อง โทรศัพท์ หรือโซเชียลมีเดีย','<strong>เลือกโหมด</strong> — หนึ่งรูปต่อ PDF หรือรวมทั้งหมด','<strong>ดาวน์โหลดทันที</strong> — ทั้งหมดเกิดขึ้นในเบราว์เซอร์'], h2b: 'แปลงรูปภาพเป็นเอกสาร PDF', body: '<p>แปลงรูปภาพท่องเที่ยว บัตรประชาชน หรือรูปสินค้าเป็น PDF โดยไม่ต้องอัปโหลด</p>', h3why: 'เมื่อไหร่ควรแปลงรูปภาพเป็น PDF?', why: 'PDF รักษารูปภาพคุณภาพเต็มและทำให้ส่งอีเมลง่าย', faqs: [{ q: 'แปลงรูปจากมือถือเป็น PDF ได้ไหม?', a: 'ได้ มือถือบันทึกรูปเป็น JPG โดยค่าเริ่มต้น' },{ q: 'คุณเก็บรูปภาพไหม?', a: 'ไม่เลย ประมวลผลในเบราว์เซอร์' }], links: [{ href: '/jpg-to-png', label: 'JPG เป็น PNG' },{ href: '/jpg-to-webp', label: 'JPG เป็น WebP' },{ href: '/compress', label: 'บีบอัด' },{ href: '/resize', label: 'ปรับขนาด' }] },
      'png-to-pdf': { h2a: 'วิธีแปลงภาพหน้าจอและกราฟิกเป็น PDF', steps: ['<strong>เพิ่มไฟล์ PNG</strong> — ภาพหน้าจอ โลโก้ หรือส่งออกดีไซน์','<strong>เลือกโหมด PDF</strong> — หนึ่งต่อไฟล์หรือรวมทั้งหมดในเอกสารเดียว','<strong>ดาวน์โหลด PDF</strong> — สร้างทันทีโดยไม่ต้องอัปโหลด'], h2b: 'แปลงภาพหน้าจอ โลโก้ และกราฟิกเป็น PDF', body: '<p>PNG เหมาะสำหรับภาพหน้าจอ UI mockup และโลโก้โปร่งใส แปลงเป็น PDF ในเบราว์เซอร์</p>', h3why: 'ทำไมต้องแปลง PNG เป็น PDF?', why: 'PDF รักษาความคมชัดและความโปร่งใสของกราฟิก PNG', faqs: [{ q: 'รวมภาพหน้าจอหลายภาพเป็น PDF เดียวได้ไหม?', a: 'ได้ — เลือกทั้งหมดแล้วคลิก "รวมทุกภาพในPDFเดียว"' },{ q: 'คุณเก็บไฟล์ไหม?', a: 'ไม่เลย แปลงในเบราว์เซอร์ทั้งหมด' }], links: [{ href: '/png-to-jpg', label: 'PNG เป็น JPG' },{ href: '/png-to-webp', label: 'PNG เป็น WebP' },{ href: '/compress', label: 'บีบอัด' },{ href: '/resize', label: 'ปรับขนาด' }] },
    },
    tr: {
      'jpg-to-pdf': { h2a: 'Fotoğrafları PDF olarak nasıl kaydedilir', steps: ['<strong>JPG fotoğraf ekleyin</strong> — kameradan, telefondan veya sosyal medyadan.','<strong>Modu seçin</strong> — fotoğraf başına bir PDF veya tümü birleşik.','<strong>Anında indirin</strong> — her şey tarayıcınızda gerçekleşir.'], h2b: 'Fotoğraflarınızı PDF belgelerine dönüştürün', body: '<p>Seyahat fotoğraflarını, kimlik fotoğraflarını veya ürün fotoğraflarını yüklemeden PDF\'e dönüştürün.</p>', h3why: 'Fotoğrafları ne zaman PDF\'e dönüştürmeli?', why: 'PDF fotoğrafları tam kalitede korur ve e-posta ile göndermeyi kolaylaştırır.', faqs: [{ q: 'Telefon fotoğraflarını PDF\'e dönüştürebilir miyim?', a: 'Evet. Telefonlar fotoğrafları varsayılan olarak JPG olarak kaydeder.' },{ q: 'Fotoğraflarımı saklıyor musunuz?', a: 'Asla. İşlemler tarayıcıda yerel olarak yapılır.' }], links: [{ href: '/jpg-to-png', label: 'JPG\'den PNG\'ye' },{ href: '/jpg-to-webp', label: 'JPG\'den WebP\'ye' },{ href: '/compress', label: 'Sıkıştır' },{ href: '/resize', label: 'Boyutlandır' }] },
      'png-to-pdf': { h2a: 'Ekran görüntüleri ve grafikleri PDF\'e nasıl dönüştürülür', steps: ['<strong>PNG dosyaları ekleyin</strong> — ekran görüntüleri, logolar veya tasarım dışa aktarmaları.','<strong>PDF modunu seçin</strong> — dosya başına bir veya tümü tek belgede.','<strong>PDF\'inizi indirin</strong> — sunucu yüklemesi olmadan anında oluşturulur.'], h2b: 'Ekran görüntülerini, logoları ve grafikleri PDF\'e dönüştürün', body: '<p>PNG ekran görüntüleri, UI mockupları ve şeffaf logolar için idealdir. Tarayıcıda PDF\'e dönüştürün.</p>', h3why: 'PNG grafikleri neden PDF\'e dönüştürülmeli?', why: 'PDF, PNG grafiklerinin keskinliğini ve şeffaflığını korur.', faqs: [{ q: 'Birden fazla ekran görüntüsünü bir PDF\'de birleştirebilir miyim?', a: 'Evet — tümünü seçin ve "Tüm görseller tek PDF\'de"yi tıklayın.' },{ q: 'Dosyalarımı saklıyor musunuz?', a: 'Asla. Dönüşüm tamamen tarayıcıda gerçekleşir.' }], links: [{ href: '/png-to-jpg', label: 'PNG\'den JPG\'ye' },{ href: '/png-to-webp', label: 'PNG\'den WebP\'ye' },{ href: '/compress', label: 'Sıkıştır' },{ href: '/resize', label: 'Boyutlandır' }] },
    },
    uk: {
      'jpg-to-pdf': { h2a: 'Як зберегти фотографії як PDF', steps: ['<strong>Додайте фото JPG</strong> — з камери, телефону або соцмереж.','<strong>Виберіть режим</strong> — одне фото на PDF або всі разом.','<strong>Завантажте миттєво</strong> — все відбувається у браузері.'], h2b: 'Перетворіть фотографії на PDF-документи', body: '<p>Конвертуйте фото з подорожей, документи або фото товарів у PDF без завантаження.</p>', h3why: 'Коли конвертувати фото у PDF?', why: 'PDF зберігає фотографії у повній якості та полегшує надсилання електронною поштою.', faqs: [{ q: 'Чи можу конвертувати фото з телефону у PDF?', a: 'Так. Телефони зберігають фото у JPG за замовчуванням.' },{ q: 'Ви зберігаєте мої фото?', a: 'Ніколи. Обробка локальна у браузері.' }], links: [{ href: '/jpg-to-png', label: 'JPG в PNG' },{ href: '/jpg-to-webp', label: 'JPG в WebP' },{ href: '/compress', label: 'Стиснути' },{ href: '/resize', label: 'Змінити розмір' }] },
      'png-to-pdf': { h2a: 'Як конвертувати скріншоти та графіку у PDF', steps: ['<strong>Додайте PNG-файли</strong> — скріншоти, логотипи або дизайн-експорти.','<strong>Виберіть режим PDF</strong> — один на файл або все в одному документі.','<strong>Завантажте PDF</strong> — згенеровано миттєво без завантаження на сервер.'], h2b: 'Конвертуйте скріншоти, логотипи та графіку у PDF', body: '<p>PNG ідеальний для скріншотів, UI-макетів та логотипів з прозорістю. Конвертуйте у PDF у браузері.</p>', h3why: 'Навіщо конвертувати PNG-графіку у PDF?', why: 'PDF зберігає чіткість та прозорість PNG-графіки.', faqs: [{ q: 'Чи можу об\'єднати кілька скріншотів в один PDF?', a: 'Так — виберіть усі та натисніть «Усі зображення в один PDF».' },{ q: 'Ви зберігаєте мої файли?', a: 'Ніколи. Конвертація повністю у браузері.' }], links: [{ href: '/png-to-jpg', label: 'PNG в JPG' },{ href: '/png-to-webp', label: 'PNG в WebP' },{ href: '/compress', label: 'Стиснути' },{ href: '/resize', label: 'Змінити розмір' }] },
    },
    vi: {
      'jpg-to-pdf': { h2a: 'Cách lưu ảnh dưới dạng PDF', steps: ['<strong>Thêm ảnh JPG</strong> — từ máy ảnh, điện thoại hoặc mạng xã hội.','<strong>Chọn chế độ</strong> — mỗi ảnh một PDF hoặc tất cả kết hợp.','<strong>Tải về ngay</strong> — tất cả diễn ra trong trình duyệt.'], h2b: 'Chuyển ảnh thành tài liệu PDF', body: '<p>Chuyển đổi ảnh du lịch, CMND hoặc ảnh sản phẩm sang PDF mà không cần tải lên.</p>', h3why: 'Khi nào chuyển ảnh sang PDF?', why: 'PDF giữ ảnh chất lượng đầy đủ và dễ gửi email hoặc tải lên cổng thông tin.', faqs: [{ q: 'Có thể chuyển ảnh điện thoại sang PDF không?', a: 'Có. Điện thoại lưu ảnh dạng JPG theo mặc định.' },{ q: 'Các bạn có lưu ảnh không?', a: 'Không bao giờ. Xử lý cục bộ trong trình duyệt.' }], links: [{ href: '/jpg-to-png', label: 'JPG sang PNG' },{ href: '/jpg-to-webp', label: 'JPG sang WebP' },{ href: '/compress', label: 'Nén' },{ href: '/resize', label: 'Đổi kích thước' }] },
      'png-to-pdf': { h2a: 'Cách chuyển ảnh chụp màn hình và đồ họa sang PDF', steps: ['<strong>Thêm tệp PNG</strong> — ảnh chụp màn hình, logo hoặc xuất thiết kế.','<strong>Chọn chế độ PDF</strong> — một tệp mỗi hoặc tất cả trong một tài liệu.','<strong>Tải PDF về</strong> — tạo ngay lập tức không cần tải lên máy chủ.'], h2b: 'Chuyển ảnh chụp màn hình, logo và đồ họa sang PDF', body: '<p>PNG lý tưởng cho ảnh chụp màn hình, mockup UI và logo trong suốt. Chuyển sang PDF trong trình duyệt.</p>', h3why: 'Tại sao chuyển đồ họa PNG sang PDF?', why: 'PDF giữ độ sắc nét và trong suốt của đồ họa PNG.', faqs: [{ q: 'Có thể gộp nhiều ảnh chụp màn hình thành một PDF không?', a: 'Có — chọn tất cả và nhấp "Tất cả ảnh trong một PDF".' },{ q: 'Các bạn có lưu tệp không?', a: 'Không bao giờ. Chuyển đổi hoàn toàn trong trình duyệt.' }], links: [{ href: '/png-to-jpg', label: 'PNG sang JPG' },{ href: '/png-to-webp', label: 'PNG sang WebP' },{ href: '/compress', label: 'Nén' },{ href: '/resize', label: 'Đổi kích thước' }] },
    },
  }

  function getLang() { return localStorage.getItem('rc_lang') || 'en' }
  function buildSeoSection() {
    const lang = getLang()
    const langSeo = seoPdf[lang] || seoPdf['en']
    const seo = langSeo[slug] || seoPdf['en'][slug]
    return `<hr class="seo-divider" /><div class="seo-section"><h2>${seo.h2a}</h2><ol>${seo.steps.map(s => `<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2>${seo.body}<h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${t.seo_faq_title}</h3>${seo.faqs.map(f => `<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${t.seo_also_try}</h3><div class="internal-links">${seo.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</div></div>`
  }

  const pdfTitles = { en: { jpg: 'JPG to PDF', png: 'PNG to PDF' }, fr: { jpg: 'JPG en PDF', png: 'PNG en PDF' }, es: { jpg: 'JPG a PDF', png: 'PNG a PDF' }, pt: { jpg: 'JPG para PDF', png: 'PNG para PDF' }, de: { jpg: 'JPG zu PDF', png: 'PNG zu PDF' }, ar: { jpg: 'JPG إلى PDF', png: 'PNG إلى PDF' }, it: { jpg: 'JPG in PDF', png: 'PNG in PDF' }, ja: { jpg: 'JPGからPDF', png: 'PNGからPDF' }, ru: { jpg: 'JPG в PDF', png: 'PNG в PDF' }, ko: { jpg: 'JPG를 PDF로', png: 'PNG를 PDF로' }, zh: { jpg: 'JPG转PDF', png: 'PNG转PDF' }, 'zh-TW': { jpg: 'JPG轉PDF', png: 'PNG轉PDF' }, bg: { jpg: 'JPG към PDF', png: 'PNG към PDF' }, ca: { jpg: 'JPG a PDF', png: 'PNG a PDF' }, nl: { jpg: 'JPG naar PDF', png: 'PNG naar PDF' }, el: { jpg: 'JPG σε PDF', png: 'PNG σε PDF' }, hi: { jpg: 'JPG से PDF', png: 'PNG से PDF' }, id: { jpg: 'JPG ke PDF', png: 'PNG ke PDF' }, ms: { jpg: 'JPG ke PDF', png: 'PNG ke PDF' }, pl: { jpg: 'JPG do PDF', png: 'PNG do PDF' }, sv: { jpg: 'JPG till PDF', png: 'PNG till PDF' }, th: { jpg: 'JPG เป็น PDF', png: 'PNG เป็น PDF' }, tr: { jpg: 'JPG\'den PDF\'e', png: 'PNG\'den PDF\'e' }, uk: { jpg: 'JPG в PDF', png: 'PNG в PDF' }, vi: { jpg: 'JPG sang PDF', png: 'PNG sang PDF' } }
  const pdfDescs = { en: { jpg: 'Turn photos, camera images, and social media pictures into PDF documents. No upload needed.', png: 'Convert screenshots, logos, graphics, and transparent images to PDF. No upload needed.' }, fr: { jpg: 'Transformez vos photos et images en documents PDF. Aucun téléchargement nécessaire.', png: 'Convertissez captures d\'écran, logos et graphiques en PDF. Aucun téléchargement nécessaire.' }, es: { jpg: 'Convierte fotos e imágenes de cámara en documentos PDF. Sin subida necesaria.', png: 'Convierte capturas de pantalla, logos y gráficos en PDF. Sin subida necesaria.' }, pt: { jpg: 'Transforme fotos e imagens de câmera em documentos PDF. Sem upload necessário.', png: 'Converta capturas de tela, logos e gráficos em PDF. Sem upload necessário.' }, de: { jpg: 'Verwandeln Sie Fotos und Kamerabilder in PDF-Dokumente. Kein Upload nötig.', png: 'Konvertieren Sie Screenshots, Logos und Grafiken in PDF. Kein Upload nötig.' }, ar: { jpg: 'حوّل الصور الفوتوغرافية وصور الكاميرا إلى مستندات PDF. بدون رفع.', png: 'حوّل لقطات الشاشة والشعارات والرسومات إلى PDF. بدون رفع.' }, it: { jpg: 'Trasforma foto e immagini in documenti PDF. Nessun caricamento necessario.', png: 'Converti screenshot, loghi e grafiche in PDF. Nessun caricamento necessario.' }, ja: { jpg: '写真やカメラ画像をPDFドキュメントに変換。アップロード不要。', png: 'スクリーンショット、ロゴ、グラフィックをPDFに変換。アップロード不要。' }, ru: { jpg: 'Превратите фотографии и снимки камеры в PDF-документы. Без загрузки.', png: 'Конвертируйте скриншоты, логотипы и графику в PDF. Без загрузки.' }, ko: { jpg: '사진과 카메라 이미지를 PDF 문서로 변환. 업로드 불필요.', png: '스크린샷, 로고, 그래픽을 PDF로 변환. 업로드 불필요.' }, zh: { jpg: '将照片和相机图片转换为PDF文档。无需上传。', png: '将截图、徽标和图形转换为PDF。无需上传。' }, 'zh-TW': { jpg: '將照片和相機圖片轉換為PDF文件。無需上傳。', png: '將截圖、標誌和圖形轉換為PDF。無需上傳。' }, bg: { jpg: 'Превърнете снимки и изображения от камера в PDF документи. Без качване.', png: 'Конвертирайте екранни снимки, лога и графики в PDF. Без качване.' }, ca: { jpg: 'Convertiu fotos i imatges de càmera en documents PDF. Sense pujada.', png: 'Convertiu captures de pantalla, logos i gràfics a PDF. Sense pujada.' }, nl: { jpg: 'Verander foto\'s en camerabeelden in PDF-documenten. Geen upload nodig.', png: 'Converteer screenshots, logo\'s en afbeeldingen naar PDF. Geen upload nodig.' }, el: { jpg: 'Μετατρέψτε φωτογραφίες και εικόνες κάμερας σε PDF. Χωρίς μεταφόρτωση.', png: 'Μετατρέψτε screenshots, λογότυπα και γραφικά σε PDF. Χωρίς μεταφόρτωση.' }, hi: { jpg: 'फ़ोटो और कैमरा छवियों को PDF दस्तावेज़ में बदलें। अपलोड की ज़रूरत नहीं।', png: 'स्क्रीनशॉट, लोगो और ग्राफ़िक्स को PDF में बदलें। अपलोड की ज़रूरत नहीं।' }, id: { jpg: 'Ubah foto dan gambar kamera menjadi dokumen PDF. Tanpa upload.', png: 'Konversi screenshot, logo, dan grafik ke PDF. Tanpa upload.' }, ms: { jpg: 'Tukar foto dan imej kamera kepada dokumen PDF. Tanpa muat naik.', png: 'Tukar tangkapan skrin, logo dan grafik kepada PDF. Tanpa muat naik.' }, pl: { jpg: 'Zamień zdjęcia i obrazy z aparatu w dokumenty PDF. Bez przesyłania.', png: 'Konwertuj zrzuty ekranu, loga i grafiki na PDF. Bez przesyłania.' }, sv: { jpg: 'Förvandla foton och kamerabilder till PDF-dokument. Ingen uppladdning.', png: 'Konvertera skärmbilder, logotyper och grafik till PDF. Ingen uppladdning.' }, th: { jpg: 'แปลงรูปภาพและภาพจากกล้องเป็นเอกสาร PDF ไม่ต้องอัปโหลด', png: 'แปลงภาพหน้าจอ โลโก้ และกราฟิกเป็น PDF ไม่ต้องอัปโหลด' }, tr: { jpg: 'Fotoğrafları ve kamera görsellerini PDF belgelerine dönüştürün. Yükleme gerekmez.', png: 'Ekran görüntülerini, logoları ve grafikleri PDF\'e dönüştürün. Yükleme gerekmez.' }, uk: { jpg: 'Перетворіть фотографії та зображення з камери на PDF-документи. Без завантаження.', png: 'Конвертуйте скріншоти, логотипи та графіку в PDF. Без завантаження.' }, vi: { jpg: 'Chuyển ảnh và ảnh máy ảnh thành tài liệu PDF. Không cần tải lên.', png: 'Chuyển ảnh chụp màn hình, logo và đồ họa sang PDF. Không cần tải lên.' } }
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