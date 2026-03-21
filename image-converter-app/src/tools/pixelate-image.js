import { injectHeader } from '../core/header.js'
import { formatSize } from '../core/utils.js'
import { getT, getLang, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
injectHreflang('pixelate-image')

const t = getT()
const bg = '#F2F2F2'

const toolName = (t.nav_short && t.nav_short['pixelate-image']) || 'Pixelate Image'
const parts    = toolName.split(' ')
const h1Main   = parts[0]
const h1Em     = parts.slice(1).join(' ')
const selectLbl = t.select_images || 'Select Image'
const dropHint  = t.drop_hint || 'or drop image anywhere'
const dlLabel   = t.download || 'Download'

const pixWholeLbl = t.pix_whole || 'Whole Image'
const pixAreaLbl  = t.pix_area || 'Select Area'
const pixLevelLbl = t.pix_level || 'Pixelation Level'
const pixLowLbl   = t.pix_low || 'Low'
const pixHighLbl  = t.pix_high || 'High'

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
    #downloadBtn:not(:disabled):hover { background: #A63D26 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #downloadBtn { transition: all 0.18s ease; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:500; color:#2C1810; text-decoration:none; background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:#C84B31; color:#C84B31; }
    .pix-mode-btn { padding:7px 16px; border-radius:8px; border:1.5px solid #DDD5C8; font-size:13px; font-weight:600; color:#2C1810; background:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .pix-mode-btn:hover { border-color:#C84B31; color:#C84B31; }
    .pix-mode-btn.active { background:#C84B31; color:#fff; border-color:#C84B31; }
    .pix-canvas-wrap { position:relative; background:#fff; border-radius:12px; border:1.5px solid #E8E0D5; overflow:hidden; display:inline-block; max-width:100%; cursor:crosshair; }
    .pix-canvas-wrap canvas { display:block; max-width:100%; height:auto; }
    .pix-selection { position:absolute; border:2px dashed #C84B31; background:rgba(200,75,49,0.1); pointer-events:none; }
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
  document.title = 'Pixelate Image Online \u2014 Pixelate Face or Full Image Free | RelahConvert'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = 'Pixelate image online free \u2014 pixelate a face, region, or entire image with adjustable intensity. Browser-only, no upload, completely private.'
  document.head.appendChild(metaDesc)
}

// ── SEO data ────────────────────────────────────────────────────────────────
const seoPixelate = {
  en: {
    h2a: 'How to Pixelate an Image Online',
    steps: ['<strong>Upload your image</strong> \u2014 click "Select Image" or drag and drop a JPG, PNG, or WebP file.','<strong>Choose a mode</strong> \u2014 select "Whole Image" to pixelate everything, or "Select Area" to draw a box over a face or region you want to pixelate.','<strong>Adjust the slider</strong> \u2014 move the pixelation level slider from low (subtle mosaic) to high (heavy blocks). The preview updates live as you adjust.','<strong>Download</strong> \u2014 save the pixelated image to your device.'],
    h2b: 'Best Free Tool to Pixelate Images and Faces Online',
    body: '<p>Need to hide a face, license plate, or sensitive information in a photo? RelahConvert\u2019s Pixelate Image tool lets you apply a mosaic effect to the entire image or just a specific area \u2014 all inside your browser. No upload, no server, completely free and private.</p><p>Use the adjustable slider to control the pixelation intensity from a subtle mosaic to heavy blocks. Draw a selection box to pixelate only a face or region while keeping the rest of the image sharp. Perfect for privacy protection, blurring sensitive data, social media posts, and anonymizing photos before sharing.</p>',
    h3why: 'Why Pixelate Images?',
    why: 'Pixelation is the most recognizable way to hide sensitive content in images. Unlike blurring, pixelation cannot be reversed \u2014 the original detail is permanently replaced with solid color blocks. This makes it ideal for protecting privacy, hiding faces, license plates, addresses, and confidential information.',
    faqs: [
      { q: 'What is image pixelation?', a: 'Image pixelation replaces areas of an image with large solid-color blocks, creating a mosaic effect that hides the original detail. Unlike blurring, pixelation is irreversible \u2014 the original pixels are permanently replaced, making it a secure way to hide sensitive content.' },
      { q: 'Can I pixelate just a face or specific area?', a: 'Yes \u2014 switch to "Select Area" mode and draw a rectangle over the face or region you want to pixelate. The rest of the image stays sharp and unaffected. You can adjust the pixelation level with the slider.' },
      { q: 'How do I control the pixelation intensity?', a: 'Use the slider to adjust the block size from low (small blocks, subtle effect) to high (large blocks, heavy pixelation). The preview updates in real time as you move the slider.' },
      { q: 'Is pixelation reversible?', a: 'No \u2014 once you download the pixelated image, the original detail in the pixelated areas is permanently gone. This is what makes pixelation more secure than blurring for hiding sensitive information.' },
      { q: 'Which formats are supported?', a: 'You can upload JPG, PNG, and WebP images. The output format matches your input \u2014 JPG stays JPG, PNG stays PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Blur Face' },{ href: '/crop', label: 'Crop Image' },{ href: '/compress', label: 'Compress Image' },{ href: '/resize', label: 'Resize Image' }],
  },
  fr: {
    h2a: 'Comment pixeliser une image en ligne',
    steps: ['<strong>T\u00e9l\u00e9chargez votre image</strong> \u2014 cliquez sur \u00ab S\u00e9lectionner une image \u00bb ou glissez-d\u00e9posez un fichier JPG, PNG ou WebP.','<strong>Choisissez un mode</strong> \u2014 s\u00e9lectionnez \u00ab Image enti\u00e8re \u00bb pour tout pixeliser, ou \u00ab S\u00e9lectionner une zone \u00bb pour dessiner un cadre sur un visage ou une r\u00e9gion \u00e0 pixeliser.','<strong>Ajustez le curseur</strong> \u2014 d\u00e9placez le curseur de niveau de pixelisation de faible (mosa\u00efque subtile) \u00e0 \u00e9lev\u00e9 (blocs importants). L\u2019aper\u00e7u se met \u00e0 jour en temps r\u00e9el.','<strong>T\u00e9l\u00e9chargez</strong> \u2014 enregistrez l\u2019image pixelis\u00e9e sur votre appareil.'],
    h2b: 'Meilleur outil gratuit pour pixeliser des images et des visages en ligne',
    body: '<p>Besoin de cacher un visage, une plaque d\u2019immatriculation ou des informations sensibles sur une photo ? L\u2019outil Pixeliser de RelahConvert vous permet d\u2019appliquer un effet mosa\u00efque \u00e0 l\u2019image enti\u00e8re ou \u00e0 une zone sp\u00e9cifique \u2014 enti\u00e8rement dans votre navigateur. Aucun t\u00e9l\u00e9versement, aucun serveur, enti\u00e8rement gratuit et priv\u00e9.</p><p>Utilisez le curseur r\u00e9glable pour contr\u00f4ler l\u2019intensit\u00e9 de la pixelisation, d\u2019une mosa\u00efque subtile \u00e0 des blocs importants. Dessinez un cadre de s\u00e9lection pour ne pixeliser qu\u2019un visage ou une r\u00e9gion tout en gardant le reste de l\u2019image net. Parfait pour la protection de la vie priv\u00e9e, le masquage de donn\u00e9es sensibles, les publications sur les r\u00e9seaux sociaux et l\u2019anonymisation de photos avant le partage.</p>',
    h3why: 'Pourquoi pixeliser des images ?',
    why: 'La pixelisation est le moyen le plus reconnaissable de cacher du contenu sensible dans les images. Contrairement au flou, la pixelisation est irr\u00e9versible \u2014 le d\u00e9tail original est d\u00e9finitivement remplac\u00e9 par des blocs de couleur unie. C\u2019est id\u00e9al pour prot\u00e9ger la vie priv\u00e9e, cacher des visages, plaques d\u2019immatriculation, adresses et informations confidentielles.',
    faqs: [
      { q: 'Qu\u2019est-ce que la pixelisation d\u2019image ?', a: 'La pixelisation remplace des zones d\u2019une image par de grands blocs de couleur unie, cr\u00e9ant un effet mosa\u00efque qui cache le d\u00e9tail original. Contrairement au flou, la pixelisation est irr\u00e9versible \u2014 les pixels originaux sont d\u00e9finitivement remplac\u00e9s, ce qui en fait un moyen s\u00fbr de cacher du contenu sensible.' },
      { q: 'Puis-je pixeliser seulement un visage ou une zone sp\u00e9cifique ?', a: 'Oui \u2014 passez en mode \u00ab S\u00e9lectionner une zone \u00bb et dessinez un rectangle sur le visage ou la r\u00e9gion que vous souhaitez pixeliser. Le reste de l\u2019image reste net et non affect\u00e9. Vous pouvez ajuster le niveau de pixelisation avec le curseur.' },
      { q: 'Comment contr\u00f4ler l\u2019intensit\u00e9 de la pixelisation ?', a: 'Utilisez le curseur pour ajuster la taille des blocs de faible (petits blocs, effet subtil) \u00e0 \u00e9lev\u00e9 (grands blocs, pixelisation forte). L\u2019aper\u00e7u se met \u00e0 jour en temps r\u00e9el lorsque vous d\u00e9placez le curseur.' },
      { q: 'La pixelisation est-elle r\u00e9versible ?', a: 'Non \u2014 une fois l\u2019image pixelis\u00e9e t\u00e9l\u00e9charg\u00e9e, le d\u00e9tail original dans les zones pixelis\u00e9es est d\u00e9finitivement perdu. C\u2019est ce qui rend la pixelisation plus s\u00fbre que le flou pour cacher des informations sensibles.' },
      { q: 'Quels formats sont support\u00e9s ?', a: 'Vous pouvez t\u00e9l\u00e9charger des images JPG, PNG et WebP. Le format de sortie correspond \u00e0 votre entr\u00e9e \u2014 JPG reste JPG, PNG reste PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Flouter visage' },{ href: '/crop', label: 'Recadrer' },{ href: '/compress', label: 'Compresser' },{ href: '/resize', label: 'Redimensionner' }],
  },
  es: {
    h2a: 'C\u00f3mo pixelar una imagen en l\u00ednea',
    steps: ['<strong>Sube tu imagen</strong> \u2014 haz clic en \u00abSeleccionar imagen\u00bb o arrastra y suelta un archivo JPG, PNG o WebP.','<strong>Elige un modo</strong> \u2014 selecciona \u00abImagen completa\u00bb para pixelar todo, o \u00abSeleccionar \u00e1rea\u00bb para dibujar un cuadro sobre un rostro o regi\u00f3n que quieras pixelar.','<strong>Ajusta el control</strong> \u2014 mueve el control de nivel de pixelado de bajo (mosaico sutil) a alto (bloques grandes). La vista previa se actualiza en tiempo real.','<strong>Descarga</strong> \u2014 guarda la imagen pixelada en tu dispositivo.'],
    h2b: 'Mejor herramienta gratuita para pixelar im\u00e1genes y rostros en l\u00ednea',
    body: '<p>\u00bfNecesitas ocultar un rostro, una placa de matr\u00edcula o informaci\u00f3n sensible en una foto? La herramienta Pixelar de RelahConvert te permite aplicar un efecto mosaico a toda la imagen o solo a un \u00e1rea espec\u00edfica \u2014 todo en tu navegador. Sin subida, sin servidor, completamente gratis y privado.</p><p>Usa el control deslizante ajustable para controlar la intensidad de la pixelaci\u00f3n desde un mosaico sutil hasta bloques grandes. Dibuja un cuadro de selecci\u00f3n para pixelar solo un rostro o regi\u00f3n mientras mantienes el resto de la imagen n\u00edtido. Perfecto para protecci\u00f3n de privacidad, ocultar datos sensibles, publicaciones en redes sociales y anonimizar fotos antes de compartir.</p>',
    h3why: '\u00bfPor qu\u00e9 pixelar im\u00e1genes?',
    why: 'La pixelaci\u00f3n es la forma m\u00e1s reconocible de ocultar contenido sensible en im\u00e1genes. A diferencia del desenfoque, la pixelaci\u00f3n es irreversible \u2014 el detalle original se reemplaza permanentemente por bloques de color s\u00f3lido. Esto la hace ideal para proteger la privacidad, ocultar rostros, placas, direcciones e informaci\u00f3n confidencial.',
    faqs: [
      { q: '\u00bfQu\u00e9 es la pixelaci\u00f3n de im\u00e1genes?', a: 'La pixelaci\u00f3n reemplaza \u00e1reas de una imagen con grandes bloques de color s\u00f3lido, creando un efecto mosaico que oculta el detalle original. A diferencia del desenfoque, la pixelaci\u00f3n es irreversible \u2014 los p\u00edxeles originales se reemplazan permanentemente, lo que la convierte en una forma segura de ocultar contenido sensible.' },
      { q: '\u00bfPuedo pixelar solo un rostro o \u00e1rea espec\u00edfica?', a: 'S\u00ed \u2014 cambia al modo \u00abSeleccionar \u00e1rea\u00bb y dibuja un rect\u00e1ngulo sobre el rostro o regi\u00f3n que deseas pixelar. El resto de la imagen permanece n\u00edtido y sin afectar. Puedes ajustar el nivel de pixelaci\u00f3n con el control deslizante.' },
      { q: '\u00bfC\u00f3mo controlo la intensidad de la pixelaci\u00f3n?', a: 'Usa el control deslizante para ajustar el tama\u00f1o de los bloques desde bajo (bloques peque\u00f1os, efecto sutil) hasta alto (bloques grandes, pixelaci\u00f3n fuerte). La vista previa se actualiza en tiempo real al mover el control.' },
      { q: '\u00bfLa pixelaci\u00f3n es reversible?', a: 'No \u2014 una vez descargada la imagen pixelada, el detalle original en las \u00e1reas pixeladas se pierde permanentemente. Esto es lo que hace la pixelaci\u00f3n m\u00e1s segura que el desenfoque para ocultar informaci\u00f3n sensible.' },
      { q: '\u00bfQu\u00e9 formatos se admiten?', a: 'Puedes subir im\u00e1genes JPG, PNG y WebP. El formato de salida coincide con tu entrada \u2014 JPG sigue siendo JPG, PNG sigue siendo PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Desenfocar rostro' },{ href: '/crop', label: 'Recortar' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }],
  },
  pt: {
    h2a: 'Como pixelizar uma imagem online',
    steps: ['<strong>Envie sua imagem</strong> \u2014 clique em \u201cSelecionar imagem\u201d ou arraste e solte um arquivo JPG, PNG ou WebP.','<strong>Escolha um modo</strong> \u2014 selecione \u201cImagem inteira\u201d para pixelizar tudo, ou \u201cSelecionar \u00e1rea\u201d para desenhar uma caixa sobre um rosto ou regi\u00e3o que deseja pixelizar.','<strong>Ajuste o controle</strong> \u2014 mova o controle de n\u00edvel de pixeliza\u00e7\u00e3o de baixo (mosaico sutil) a alto (blocos grandes). A visualiza\u00e7\u00e3o \u00e9 atualizada em tempo real.','<strong>Baixe</strong> \u2014 salve a imagem pixelizada no seu dispositivo.'],
    h2b: 'Melhor ferramenta gratuita para pixelizar imagens e rostos online',
    body: '<p>Precisa esconder um rosto, placa ou informa\u00e7\u00e3o sens\u00edvel em uma foto? A ferramenta Pixelizar do RelahConvert permite aplicar um efeito mosaico \u00e0 imagem inteira ou apenas a uma \u00e1rea espec\u00edfica \u2014 tudo no seu navegador. Sem upload, sem servidor, totalmente gratuito e privado.</p><p>Use o controle deslizante ajust\u00e1vel para controlar a intensidade da pixeliza\u00e7\u00e3o, de um mosaico sutil a blocos grandes. Desenhe uma caixa de sele\u00e7\u00e3o para pixelizar apenas um rosto ou regi\u00e3o enquanto mant\u00e9m o restante da imagem n\u00edtido. Perfeito para prote\u00e7\u00e3o de privacidade, oculta\u00e7\u00e3o de dados sens\u00edveis, postagens em redes sociais e anonimiza\u00e7\u00e3o de fotos antes de compartilhar.</p>',
    h3why: 'Por que pixelizar imagens?',
    why: 'A pixeliza\u00e7\u00e3o \u00e9 a forma mais reconhec\u00edvel de esconder conte\u00fado sens\u00edvel em imagens. Ao contr\u00e1rio do desfoque, a pixeliza\u00e7\u00e3o \u00e9 irrevers\u00edvel \u2014 o detalhe original \u00e9 permanentemente substitu\u00eddo por blocos de cor s\u00f3lida. Ideal para proteger a privacidade, esconder rostos, placas, endere\u00e7os e informa\u00e7\u00f5es confidenciais.',
    faqs: [
      { q: 'O que \u00e9 pixeliza\u00e7\u00e3o de imagem?', a: 'A pixeliza\u00e7\u00e3o substitui \u00e1reas de uma imagem por grandes blocos de cor s\u00f3lida, criando um efeito mosaico que esconde o detalhe original. Ao contr\u00e1rio do desfoque, a pixeliza\u00e7\u00e3o \u00e9 irrevers\u00edvel \u2014 os pixels originais s\u00e3o permanentemente substitu\u00eddos, tornando-a uma forma segura de esconder conte\u00fado sens\u00edvel.' },
      { q: 'Posso pixelizar apenas um rosto ou \u00e1rea espec\u00edfica?', a: 'Sim \u2014 mude para o modo \u201cSelecionar \u00e1rea\u201d e desenhe um ret\u00e2ngulo sobre o rosto ou regi\u00e3o que deseja pixelizar. O restante da imagem permanece n\u00edtido e inalterado. Voc\u00ea pode ajustar o n\u00edvel de pixeliza\u00e7\u00e3o com o controle deslizante.' },
      { q: 'Como controlo a intensidade da pixeliza\u00e7\u00e3o?', a: 'Use o controle deslizante para ajustar o tamanho dos blocos de baixo (blocos pequenos, efeito sutil) a alto (blocos grandes, pixeliza\u00e7\u00e3o forte). A visualiza\u00e7\u00e3o \u00e9 atualizada em tempo real ao mover o controle.' },
      { q: 'A pixeliza\u00e7\u00e3o \u00e9 revers\u00edvel?', a: 'N\u00e3o \u2014 uma vez baixada a imagem pixelizada, o detalhe original nas \u00e1reas pixelizadas \u00e9 permanentemente perdido. Isso \u00e9 o que torna a pixeliza\u00e7\u00e3o mais segura que o desfoque para esconder informa\u00e7\u00f5es sens\u00edveis.' },
      { q: 'Quais formatos s\u00e3o suportados?', a: 'Voc\u00ea pode enviar imagens JPG, PNG e WebP. O formato de sa\u00edda corresponde \u00e0 sua entrada \u2014 JPG continua JPG, PNG continua PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Desfocar rosto' },{ href: '/crop', label: 'Recortar' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }],
  },
  de: {
    h2a: 'So verpixeln Sie ein Bild online',
    steps: ['<strong>Bild hochladen</strong> \u2014 klicken Sie auf \u201eBild ausw\u00e4hlen\u201c oder ziehen Sie eine JPG-, PNG- oder WebP-Datei.','<strong>Modus w\u00e4hlen</strong> \u2014 w\u00e4hlen Sie \u201eGanzes Bild\u201c um alles zu verpixeln, oder \u201eBereich ausw\u00e4hlen\u201c um einen Rahmen \u00fcber ein Gesicht oder eine Region zu zeichnen.','<strong>Regler anpassen</strong> \u2014 bewegen Sie den Verpixelungsregler von niedrig (subtiles Mosaik) bis hoch (gro\u00dfe Bl\u00f6cke). Die Vorschau aktualisiert sich in Echtzeit.','<strong>Herunterladen</strong> \u2014 speichern Sie das verpixelte Bild auf Ihrem Ger\u00e4t.'],
    h2b: 'Bestes kostenloses Tool zum Verpixeln von Bildern und Gesichtern online',
    body: '<p>M\u00fcssen Sie ein Gesicht, ein Nummernschild oder sensible Informationen in einem Foto verbergen? Das Verpixeln-Tool von RelahConvert erm\u00f6glicht es Ihnen, einen Mosaikeffekt auf das gesamte Bild oder nur auf einen bestimmten Bereich anzuwenden \u2014 vollst\u00e4ndig in Ihrem Browser. Kein Upload, kein Server, komplett kostenlos und privat.</p><p>Verwenden Sie den einstellbaren Regler, um die Verpixelungsintensit\u00e4t von einem subtilen Mosaik bis zu gro\u00dfen Bl\u00f6cken zu steuern. Zeichnen Sie einen Auswahlrahmen, um nur ein Gesicht oder eine Region zu verpixeln, w\u00e4hrend der Rest des Bildes scharf bleibt. Perfekt f\u00fcr Datenschutz, Verbergen sensibler Daten, Social-Media-Beitr\u00e4ge und Anonymisierung von Fotos vor dem Teilen.</p>',
    h3why: 'Warum Bilder verpixeln?',
    why: 'Verpixelung ist die bekannteste Methode, sensible Inhalte in Bildern zu verbergen. Im Gegensatz zur Unsch\u00e4rfe ist Verpixelung nicht umkehrbar \u2014 das Originaldetail wird dauerhaft durch einfarbige Bl\u00f6cke ersetzt. Das macht sie ideal zum Schutz der Privatsph\u00e4re, zum Verbergen von Gesichtern, Nummernschildern, Adressen und vertraulichen Informationen.',
    faqs: [
      { q: 'Was ist Bildverpixelung?', a: 'Bildverpixelung ersetzt Bereiche eines Bildes durch gro\u00dfe einfarbige Bl\u00f6cke und erzeugt einen Mosaikeffekt, der das Originaldetail verbirgt. Im Gegensatz zur Unsch\u00e4rfe ist Verpixelung irreversibel \u2014 die Originalpixel werden dauerhaft ersetzt, was sie zu einer sicheren Methode macht, sensible Inhalte zu verbergen.' },
      { q: 'Kann ich nur ein Gesicht oder einen bestimmten Bereich verpixeln?', a: 'Ja \u2014 wechseln Sie in den Modus \u201eBereich ausw\u00e4hlen\u201c und zeichnen Sie ein Rechteck \u00fcber das Gesicht oder die Region, die Sie verpixeln m\u00f6chten. Der Rest des Bildes bleibt scharf und unber\u00fchrt. Sie k\u00f6nnen den Verpixelungsgrad mit dem Regler anpassen.' },
      { q: 'Wie steuere ich die Verpixelungsintensit\u00e4t?', a: 'Verwenden Sie den Regler, um die Blockgr\u00f6\u00dfe von niedrig (kleine Bl\u00f6cke, subtiler Effekt) bis hoch (gro\u00dfe Bl\u00f6cke, starke Verpixelung) anzupassen. Die Vorschau aktualisiert sich in Echtzeit beim Bewegen des Reglers.' },
      { q: 'Ist Verpixelung umkehrbar?', a: 'Nein \u2014 sobald Sie das verpixelte Bild herunterladen, ist das Originaldetail in den verpixelten Bereichen dauerhaft verloren. Das macht Verpixelung sicherer als Unsch\u00e4rfe zum Verbergen sensibler Informationen.' },
      { q: 'Welche Formate werden unterst\u00fctzt?', a: 'Sie k\u00f6nnen JPG-, PNG- und WebP-Bilder hochladen. Das Ausgabeformat entspricht Ihrer Eingabe \u2014 JPG bleibt JPG, PNG bleibt PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Gesicht weichzeichnen' },{ href: '/crop', label: 'Zuschneiden' },{ href: '/compress', label: 'Komprimieren' },{ href: '/resize', label: 'Skalieren' }],
  },
  ar: {
    h2a: '\u0643\u064a\u0641\u064a\u0629 \u062a\u0628\u0643\u0633\u0644 \u0635\u0648\u0631\u0629 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a',
    steps: ['<strong>\u0627\u0631\u0641\u0639 \u0635\u0648\u0631\u062a\u0643</strong> \u2014 \u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u00ab\u0627\u062e\u062a\u064a\u0627\u0631 \u0635\u0648\u0631\u0629\u00bb \u0623\u0648 \u0627\u0633\u062d\u0628 \u0645\u0644\u0641 JPG \u0623\u0648 PNG \u0623\u0648 WebP.','<strong>\u0627\u062e\u062a\u0631 \u0627\u0644\u0648\u0636\u0639</strong> \u2014 \u0627\u062e\u062a\u0631 \u00ab\u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0627\u0645\u0644\u0629\u00bb \u0644\u062a\u0628\u0643\u0633\u0644 \u0643\u0644 \u0634\u064a\u0621\u060c \u0623\u0648 \u00ab\u062a\u062d\u062f\u064a\u062f \u0645\u0646\u0637\u0642\u0629\u00bb \u0644\u0631\u0633\u0645 \u0625\u0637\u0627\u0631 \u062d\u0648\u0644 \u0648\u062c\u0647 \u0623\u0648 \u0645\u0646\u0637\u0642\u0629.','<strong>\u0627\u0636\u0628\u0637 \u0627\u0644\u0645\u0646\u0632\u0644\u0642</strong> \u2014 \u062d\u0631\u0651\u0643 \u0645\u0646\u0632\u0644\u0642 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0645\u0646 \u0645\u0646\u062e\u0641\u0636 (\u0641\u0633\u064a\u0641\u0633\u0627\u0621 \u062e\u0641\u064a\u0641\u0629) \u0625\u0644\u0649 \u0639\u0627\u0644\u064a (\u0643\u062a\u0644 \u0643\u0628\u064a\u0631\u0629). \u064a\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0641\u0639\u0644\u064a.','<strong>\u062d\u0645\u0651\u0644</strong> \u2014 \u0627\u062d\u0641\u0638 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0628\u0643\u0633\u0644\u0629 \u0639\u0644\u0649 \u062c\u0647\u0627\u0632\u0643.'],
    h2b: '\u0623\u0641\u0636\u0644 \u0623\u062f\u0627\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u0644\u062a\u0628\u0643\u0633\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0648\u062c\u0648\u0647 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a',
    body: '<p>\u0647\u0644 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0625\u062e\u0641\u0627\u0621 \u0648\u062c\u0647 \u0623\u0648 \u0644\u0648\u062d\u0629 \u062a\u0631\u062e\u064a\u0635 \u0623\u0648 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u062d\u0633\u0627\u0633\u0629 \u0641\u064a \u0635\u0648\u0631\u0629\u061f \u0623\u062f\u0627\u0629 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0645\u0646 RelahConvert \u062a\u062a\u064a\u062d \u0644\u0643 \u062a\u0637\u0628\u064a\u0642 \u062a\u0623\u062b\u064a\u0631 \u0627\u0644\u0641\u0633\u064a\u0641\u0633\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0623\u0643\u0645\u0644\u0647\u0627 \u0623\u0648 \u0639\u0644\u0649 \u0645\u0646\u0637\u0642\u0629 \u0645\u062d\u062f\u062f\u0629 \u2014 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0641\u064a \u0645\u062a\u0635\u0641\u062d\u0643. \u0628\u062f\u0648\u0646 \u0631\u0641\u0639\u060c \u0628\u062f\u0648\u0646 \u062e\u0627\u062f\u0645\u060c \u0645\u062c\u0627\u0646\u064a \u0648\u062e\u0627\u0635 \u062a\u0645\u0627\u0645\u0627\u064b.</p><p>\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0645\u0646\u0632\u0644\u0642 \u0627\u0644\u0642\u0627\u0628\u0644 \u0644\u0644\u062a\u0639\u062f\u064a\u0644 \u0644\u0644\u062a\u062d\u0643\u0645 \u0641\u064a \u0634\u062f\u0629 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0645\u0646 \u0641\u0633\u064a\u0641\u0633\u0627\u0621 \u062e\u0641\u064a\u0641\u0629 \u0625\u0644\u0649 \u0643\u062a\u0644 \u0643\u0628\u064a\u0631\u0629. \u0627\u0631\u0633\u0645 \u0625\u0637\u0627\u0631 \u0627\u062e\u062a\u064a\u0627\u0631 \u0644\u062a\u0628\u0643\u0633\u0644 \u0648\u062c\u0647 \u0623\u0648 \u0645\u0646\u0637\u0642\u0629 \u0641\u0642\u0637 \u0645\u0639 \u0627\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0628\u0627\u0642\u064a \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062d\u0629. \u0645\u062b\u0627\u0644\u064a \u0644\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629 \u0648\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0633\u0629 \u0648\u0645\u0646\u0634\u0648\u0631\u0627\u062a \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0648\u0625\u062e\u0641\u0627\u0621 \u0647\u0648\u064a\u0629 \u0627\u0644\u0635\u0648\u0631 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629.</p>',
    h3why: '\u0644\u0645\u0627\u0630\u0627 \u062a\u0628\u0643\u0633\u0644 \u0627\u0644\u0635\u0648\u0631\u061f',
    why: '\u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0647\u0648 \u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u064a\u0648\u0639\u0627\u064b \u0644\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u062d\u0633\u0627\u0633 \u0641\u064a \u0627\u0644\u0635\u0648\u0631. \u0639\u0644\u0649 \u0639\u0643\u0633 \u0627\u0644\u062a\u0645\u0648\u064a\u0647\u060c \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0644\u0627 \u064a\u0645\u0643\u0646 \u0639\u0643\u0633\u0647 \u2014 \u064a\u062a\u0645 \u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0628\u0634\u0643\u0644 \u062f\u0627\u0626\u0645 \u0628\u0643\u062a\u0644 \u0644\u0648\u0646\u064a\u0629 \u0635\u0644\u0628\u0629. \u0645\u062b\u0627\u0644\u064a \u0644\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629 \u0648\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0648\u062c\u0648\u0647 \u0648\u0644\u0648\u062d\u0627\u062a \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0648\u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646 \u0648\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0633\u0631\u064a\u0629.',
    faqs: [
      { q: '\u0645\u0627 \u0647\u0648 \u062a\u0628\u0643\u0633\u0644 \u0627\u0644\u0635\u0648\u0631\u0629\u061f', a: '\u062a\u0628\u0643\u0633\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u064a\u0633\u062a\u0628\u062f\u0644 \u0645\u0646\u0627\u0637\u0642 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0643\u062a\u0644 \u0644\u0648\u0646\u064a\u0629 \u0643\u0628\u064a\u0631\u0629\u060c \u0645\u0645\u0627 \u064a\u0646\u0634\u0626 \u062a\u0623\u062b\u064a\u0631 \u0641\u0633\u064a\u0641\u0633\u0627\u0621 \u064a\u062e\u0641\u064a \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0623\u0635\u0644\u064a\u0629. \u0639\u0644\u0649 \u0639\u0643\u0633 \u0627\u0644\u062a\u0645\u0648\u064a\u0647\u060c \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0644\u0627 \u064a\u0645\u0643\u0646 \u0639\u0643\u0633\u0647 \u2014 \u064a\u062a\u0645 \u0627\u0633\u062a\u0628\u062f\u0627\u0644 \u0627\u0644\u0628\u0643\u0633\u0644\u0627\u062a \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0628\u0634\u0643\u0644 \u062f\u0627\u0626\u0645\u060c \u0645\u0645\u0627 \u064a\u062c\u0639\u0644\u0647 \u0637\u0631\u064a\u0642\u0629 \u0622\u0645\u0646\u0629 \u0644\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u062d\u0633\u0627\u0633.' },
      { q: '\u0647\u0644 \u064a\u0645\u0643\u0646\u0646\u064a \u062a\u0628\u0643\u0633\u0644 \u0648\u062c\u0647 \u0623\u0648 \u0645\u0646\u0637\u0642\u0629 \u0645\u062d\u062f\u062f\u0629 \u0641\u0642\u0637\u061f', a: '\u0646\u0639\u0645 \u2014 \u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0648\u0636\u0639 \u00ab\u062a\u062d\u062f\u064a\u062f \u0645\u0646\u0637\u0642\u0629\u00bb \u0648\u0627\u0631\u0633\u0645 \u0645\u0633\u062a\u0637\u064a\u0644\u0627\u064b \u062d\u0648\u0644 \u0627\u0644\u0648\u062c\u0647 \u0623\u0648 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062a\u064a \u062a\u0631\u064a\u062f \u062a\u0628\u0643\u0633\u0644\u0647\u0627. \u064a\u0628\u0642\u0649 \u0628\u0627\u0642\u064a \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062d\u0627\u064b \u0648\u063a\u064a\u0631 \u0645\u062a\u0623\u062b\u0631. \u064a\u0645\u0643\u0646\u0643 \u0636\u0628\u0637 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0628\u0627\u0644\u0645\u0646\u0632\u0644\u0642.' },
      { q: '\u0643\u064a\u0641 \u0623\u062a\u062d\u0643\u0645 \u0641\u064a \u0634\u062f\u0629 \u0627\u0644\u062a\u0628\u0643\u0633\u0644\u061f', a: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0645\u0646\u0632\u0644\u0642 \u0644\u0636\u0628\u0637 \u062d\u062c\u0645 \u0627\u0644\u0643\u062a\u0644 \u0645\u0646 \u0645\u0646\u062e\u0641\u0636 (\u0643\u062a\u0644 \u0635\u063a\u064a\u0631\u0629\u060c \u062a\u0623\u062b\u064a\u0631 \u062e\u0641\u064a\u0641) \u0625\u0644\u0649 \u0639\u0627\u0644\u064a (\u0643\u062a\u0644 \u0643\u0628\u064a\u0631\u0629\u060c \u062a\u0628\u0643\u0633\u0644 \u0642\u0648\u064a). \u064a\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u064a \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0641\u0639\u0644\u064a \u0639\u0646\u062f \u062a\u062d\u0631\u064a\u0643 \u0627\u0644\u0645\u0646\u0632\u0644\u0642.' },
      { q: '\u0647\u0644 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0642\u0627\u0628\u0644 \u0644\u0644\u0639\u0643\u0633\u061f', a: '\u0644\u0627 \u2014 \u0628\u0645\u062c\u0631\u062f \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0628\u0643\u0633\u0644\u0629\u060c \u064a\u0636\u064a\u0639 \u0627\u0644\u062a\u0641\u0635\u064a\u0644 \u0627\u0644\u0623\u0635\u0644\u064a \u0641\u064a \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0645\u0628\u0643\u0633\u0644\u0629 \u0628\u0634\u0643\u0644 \u062f\u0627\u0626\u0645. \u0647\u0630\u0627 \u0645\u0627 \u064a\u062c\u0639\u0644 \u0627\u0644\u062a\u0628\u0643\u0633\u0644 \u0623\u0643\u062b\u0631 \u0623\u0645\u0627\u0646\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0645\u0648\u064a\u0647 \u0644\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0633\u0629.' },
      { q: '\u0645\u0627 \u0627\u0644\u0635\u064a\u063a \u0627\u0644\u0645\u062f\u0639\u0648\u0645\u0629\u061f', a: '\u064a\u0645\u0643\u0646\u0643 \u0631\u0641\u0639 \u0635\u0648\u0631 JPG \u0648PNG \u0648WebP. \u064a\u062a\u0637\u0627\u0628\u0642 \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0625\u062e\u0631\u0627\u062c \u0645\u0639 \u0627\u0644\u0625\u062f\u062e\u0627\u0644 \u2014 JPG \u064a\u0628\u0642\u0649 JPG\u060c PNG \u064a\u0628\u0642\u0649 PNG.' },
    ],
    links: [{ href: '/blur-face', label: '\u062a\u0645\u0648\u064a\u0647 \u0627\u0644\u0648\u062c\u0647' },{ href: '/crop', label: '\u0642\u0635' },{ href: '/compress', label: '\u0636\u063a\u0637' },{ href: '/resize', label: '\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062d\u062c\u0645' }],
  },
}

// For remaining languages, use English as fallback (SEO will be added via agents)
function buildSeoSection() {
  const lang = getLang()
  const seo = seoPixelate[lang] || seoPixelate['en']
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
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.pix_desc || 'Pixelate an entire image or just a face/region. Free, private, browser-only.'}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${selectLbl}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" style="display:none;" />
    <div id="editorArea" style="display:none;">
      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <button class="pix-mode-btn active" id="modeWhole">${pixWholeLbl}</button>
        <button class="pix-mode-btn" id="modeArea">${pixAreaLbl}</button>
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:13px; font-weight:600; color:#2C1810; display:block; margin-bottom:6px;">${pixLevelLbl}</label>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:11px; color:#9A8A7A;">${pixLowLbl}</span>
          <input type="range" id="pixelSlider" min="2" max="60" value="12" style="flex:1; accent-color:#C84B31;" />
          <span style="font-size:11px; color:#9A8A7A;">${pixHighLbl}</span>
        </div>
      </div>
      <div class="pix-canvas-wrap" id="canvasWrap">
        <canvas id="pixCanvas"></canvas>
      </div>
    </div>
    <button id="downloadBtn" disabled style="display:none; width:100%; padding:13px; border:none; border-radius:10px; background:#C84B31; color:#F5F0E8; font-size:15px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; margin-top:12px;">${dlLabel}</button>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next || "WHAT'S NEXT?"}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;" id="nextStepsButtons"></div>
    </div>
  </div>
  ${buildSeoSection()}
`

injectHeader()

// ── DOM refs ────────────────────────────────────────────────────────────────
const fileInput    = document.getElementById('fileInput')
const editorArea   = document.getElementById('editorArea')
const pixCanvas    = document.getElementById('pixCanvas')
const canvasWrap   = document.getElementById('canvasWrap')
const pixelSlider  = document.getElementById('pixelSlider')
const downloadBtn  = document.getElementById('downloadBtn')
const modeWhole    = document.getElementById('modeWhole')
const modeArea     = document.getElementById('modeArea')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')
const ctx          = pixCanvas.getContext('2d')

let uploadedImg = null
let originalFile = null
let isWholeMode = true
let selections = [] // [{ x, y, w, h }, ...]
let currentDrag = null // { x, y, w, h } while dragging
let isDragging = false
let dragStart = { x: 0, y: 0 }

// ── File handling ───────────────────────────────────────────────────────────
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  originalFile = file
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    uploadedImg = img
    pixCanvas.width = img.naturalWidth
    pixCanvas.height = img.naturalHeight
    selections = []
    currentDrag = null
    renderSelectionBoxes()
    editorArea.style.display = 'block'
    downloadBtn.style.display = 'block'
    downloadBtn.disabled = false
    applyPixelation()
    URL.revokeObjectURL(url)
  }
  img.src = url
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

// ── Mode toggle ─────────────────────────────────────────────────────────────
modeWhole.addEventListener('click', () => {
  isWholeMode = true
  modeWhole.classList.add('active')
  modeArea.classList.remove('active')
  selections = []
  currentDrag = null
  renderSelectionBoxes()
  canvasWrap.style.cursor = 'default'
  applyPixelation()
})

modeArea.addEventListener('click', () => {
  isWholeMode = false
  modeArea.classList.add('active')
  modeWhole.classList.remove('active')
  canvasWrap.style.cursor = 'crosshair'
  // Redraw original without pixelation until area is selected
  if (uploadedImg) {
    ctx.drawImage(uploadedImg, 0, 0)
  }
})

// ── Selection drawing ───────────────────────────────────────────────────────
function getCanvasCoords(e) {
  const rect = pixCanvas.getBoundingClientRect()
  const scaleX = pixCanvas.width / rect.width
  const scaleY = pixCanvas.height / rect.height
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  }
}

canvasWrap.addEventListener('mousedown', startDrag)
canvasWrap.addEventListener('touchstart', startDrag, { passive: false })

function startDrag(e) {
  if (isWholeMode || !uploadedImg) return
  e.preventDefault()
  isDragging = true
  dragStart = getCanvasCoords(e)
}

document.addEventListener('mousemove', moveDrag)
document.addEventListener('touchmove', moveDrag, { passive: false })

function moveDrag(e) {
  if (!isDragging) return
  e.preventDefault()
  const pos = getCanvasCoords(e)
  const x = Math.min(dragStart.x, pos.x)
  const y = Math.min(dragStart.y, pos.y)
  const w = Math.abs(pos.x - dragStart.x)
  const h = Math.abs(pos.y - dragStart.y)
  currentDrag = { x, y, w, h }
  renderSelectionBoxes()
  applyPixelation()
}

document.addEventListener('mouseup', endDrag)
document.addEventListener('touchend', endDrag)

function endDrag() {
  if (!isDragging) return
  isDragging = false
  if (currentDrag && currentDrag.w > 5 && currentDrag.h > 5) {
    selections.push(currentDrag)
  }
  currentDrag = null
  renderSelectionBoxes()
  applyPixelation()
}

function renderSelectionBoxes() {
  // Remove old selection box elements
  canvasWrap.querySelectorAll('.pix-selection').forEach(el => el.remove())
  const rect = pixCanvas.getBoundingClientRect()
  const scaleX = rect.width / pixCanvas.width
  const scaleY = rect.height / pixCanvas.height
  const allSels = [...selections]
  if (currentDrag) allSels.push(currentDrag)
  allSels.forEach((sel, i) => {
    const div = document.createElement('div')
    div.className = 'pix-selection'
    div.style.left = (sel.x * scaleX) + 'px'
    div.style.top = (sel.y * scaleY) + 'px'
    div.style.width = (sel.w * scaleX) + 'px'
    div.style.height = (sel.h * scaleY) + 'px'
    div.style.display = 'block'
    canvasWrap.appendChild(div)
  })
}

// ── Pixelation logic ────────────────────────────────────────────────────────
function applyPixelation() {
  if (!uploadedImg) return
  const blockSize = parseInt(pixelSlider.value)

  // Draw original image first
  ctx.drawImage(uploadedImg, 0, 0)

  if (isWholeMode) {
    // Pixelate entire image
    pixelateRegion(0, 0, pixCanvas.width, pixCanvas.height, blockSize)
  } else {
    // Pixelate all selected areas
    const allSels = [...selections]
    if (currentDrag && currentDrag.w > 2 && currentDrag.h > 2) allSels.push(currentDrag)
    allSels.forEach(sel => {
      pixelateRegion(
        Math.round(sel.x),
        Math.round(sel.y),
        Math.round(sel.w),
        Math.round(sel.h),
        blockSize
      )
    })
  }
}

function pixelateRegion(rx, ry, rw, rh, blockSize) {
  // Clamp to canvas bounds
  const x0 = Math.max(0, rx)
  const y0 = Math.max(0, ry)
  const x1 = Math.min(pixCanvas.width, rx + rw)
  const y1 = Math.min(pixCanvas.height, ry + rh)

  for (let y = y0; y < y1; y += blockSize) {
    for (let x = x0; x < x1; x += blockSize) {
      const bw = Math.min(blockSize, x1 - x)
      const bh = Math.min(blockSize, y1 - y)
      // Sample center pixel of block
      const sx = Math.min(x + Math.floor(bw / 2), x1 - 1)
      const sy = Math.min(y + Math.floor(bh / 2), y1 - 1)
      const pixel = ctx.getImageData(sx, sy, 1, 1).data
      ctx.fillStyle = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
      ctx.fillRect(x, y, bw, bh)
    }
  }
}

// ── Slider live update ──────────────────────────────────────────────────────
pixelSlider.addEventListener('input', () => applyPixelation())

// ── Download ────────────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  if (!uploadedImg) return
  const mime = originalFile.type === 'image/png' ? 'image/png' : (originalFile.type === 'image/webp' ? 'image/webp' : 'image/jpeg')
  const ext = mime === 'image/png' ? '.png' : (mime === 'image/webp' ? '.webp' : '.jpg')
  const quality = mime === 'image/jpeg' ? 0.92 : undefined

  pixCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const baseName = originalFile.name.replace(/\.[^.]+$/, '')
    a.href = url
    a.download = baseName + '_pixelated' + ext
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    buildNextSteps(blob)
  }, mime, quality)
})

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
function buildNextSteps(lastBlob) {
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
      if (lastBlob) {
        try {
          await saveFilesToIDB([{ blob: lastBlob, name: originalFile.name, type: lastBlob.type }])
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
