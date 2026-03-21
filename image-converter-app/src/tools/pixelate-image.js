import { injectHeader } from '../core/header.js'
import { formatSize } from '../core/utils.js'
import JSZip from 'jszip'
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
    .preview-card { background:#fff; border-radius:6px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); position:relative; cursor:pointer; transition:outline 0.1s; }
    .preview-card:hover { outline:2px solid #C84B31; outline-offset:1px; }
    .preview-card.active { outline:2px solid #C84B31; outline-offset:1px; }
    .preview-card img { width:100%; height:80px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:#C84B31; }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tool-layout { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:start; }
    .image-col { min-height:320px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; }
    .controls-col { background:#fff; border-radius:14px; border:1.5px solid #E8E0D5; padding:16px; font-family:'DM Sans',sans-serif; }
    .controls-col h3 { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:#2C1810; margin:0 0 12px; }
    .section-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#9A8A7A; margin-bottom:6px; }
    .divider { height:1px; background:#F0EAE3; margin:12px 0; }
    .range-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
    .range-val { font-size:12px; color:#9A8A7A; min-width:28px; text-align:right; }
    .opt-btn { width:100%; padding:12px; border:none; border-radius:10px; background:#C84B31; color:#fff; font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; }
    .opt-btn:hover { background:#A63D26; transform:translateY(-1px); }
    .opt-btn:disabled { background:#C4B8A8; cursor:not-allowed; opacity:0.7; transform:none; }
    .file-chips { display:flex; gap:8px; margin-bottom:12px; overflow-x:auto; padding-bottom:4px; }
    .file-thumb { position:relative; flex-shrink:0; width:64px; height:64px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:border-color 0.15s; }
    .file-thumb:hover { border-color:#C84B31; }
    .file-thumb.active { border-color:#C84B31; box-shadow:0 0 0 2px rgba(200,75,49,0.3); }
    .file-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .file-thumb .thumb-x { position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:16px; height:16px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; padding:0; opacity:0; transition:opacity 0.15s; }
    .file-thumb:hover .thumb-x { opacity:1; }
    .file-thumb .thumb-x:hover { background:#C84B31; }
    .add-thumb { flex-shrink:0; width:64px; height:64px; border-radius:8px; border:1.5px dashed #DDD5C8; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; color:#9A8A7A; transition:all 0.15s; }
    .add-thumb:hover { border-color:#C84B31; color:#C84B31; }
    .pix-canvas-wrap { position:relative; overflow:hidden; display:block; cursor:crosshair; width:100%; }
    .pix-canvas-wrap canvas { display:block; max-width:100%; max-height:500px; margin:0 auto; }
    @media (max-width:700px) { .tool-layout { grid-template-columns:1fr; } .image-col { min-height:220px; } }
    .pix-selection { position:absolute; border:2px dashed #C84B31; background:rgba(200,75,49,0.1); z-index:1; }
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
const applyAllLbl = t.rik_apply_all || 'Apply to All'
const individualLbl = t.rik_individual || 'Individual'
const addMoreLbl = t.add_more || 'Add More'
const downloadZipLbl = t.download_zip || 'Download ZIP'

document.querySelector('#app').innerHTML = `
  <div style="max-width:1100px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:900; color:#2C1810; margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${h1Main} <em style="font-style:italic; color:#C84B31;">${h1Em}</em>
      </h1>
      <p style="font-size:13px; color:#7A6A5A; margin:0;">${t.pix_desc || 'Pixelate an entire image or just a face/region. Batch process up to 25 files. Free, private, browser-only.'}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:#C84B31; color:#fff; font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${selectLbl}
      </label>
      <span style="font-size:12px; color:#9A8A7A; margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:#FDE8E3; color:#A63D26; font-weight:600; font-size:13px;"></div>
    <div id="workArea" style="display:none; margin-bottom:16px;">
      <div id="fileChips" class="file-chips"></div>
      <div class="tool-layout">
        <div class="image-col" id="imageCol">
          <div id="editorArea" style="display:none; width:100%;">
            <div class="pix-canvas-wrap" id="canvasWrap" style="width:100%;">
              <canvas id="pixCanvas"></canvas>
            </div>
          </div>
        </div>
        <div class="controls-col">
          <h3>${t.pix_controls || 'Pixelation'}</h3>
          <div style="display:flex; gap:6px; margin-bottom:12px;">
            <button class="pix-mode-btn active" id="modeWhole" style="flex:1;">${pixWholeLbl}</button>
            <button class="pix-mode-btn" id="modeArea" style="flex:1;">${pixAreaLbl}</button>
          </div>
          <div id="batchModeWrap" style="display:none; margin-bottom:12px;">
            <div style="display:flex; gap:0;">
              <button id="modeAllBtn" style="flex:1; padding:6px 8px; border:1.5px solid #DDD5C8; border-radius:6px 0 0 6px; background:#fff; color:#2C1810; font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${applyAllLbl}</button>
              <button id="modeIndBtn" style="flex:1; padding:6px 8px; border:1.5px solid #C84B31; border-radius:0 6px 6px 0; background:#C84B31; color:#fff; font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${individualLbl}</button>
            </div>
          </div>
          <div class="divider"></div>
          <p class="section-label">${pixLevelLbl}</p>
          <div class="range-row">
            <input type="range" id="pixelSlider" min="2" max="60" value="12" style="flex:1;" />
            <span class="range-val" id="pixelVal">12</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:-6px; margin-bottom:12px;">
            <span style="font-size:10px; color:#9A8A7A;">${pixLowLbl}</span>
            <span style="font-size:10px; color:#9A8A7A;">${pixHighLbl}</span>
          </div>
          <div class="divider"></div>
          <button class="opt-btn" id="downloadBtn" disabled>${dlLabel}</button>
        </div>
      </div>
    </div>
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
const fileInput    = document.getElementById('fileInput')
const uploadArea   = document.getElementById('uploadArea')
const workArea     = document.getElementById('workArea')
const fileChips    = document.getElementById('fileChips')
const editorArea   = document.getElementById('editorArea')
const pixCanvas    = document.getElementById('pixCanvas')
const canvasWrap   = document.getElementById('canvasWrap')
const pixelSlider  = document.getElementById('pixelSlider')
const pixelVal     = document.getElementById('pixelVal')
const downloadBtn  = document.getElementById('downloadBtn')
const modeWhole    = document.getElementById('modeWhole')
const modeArea     = document.getElementById('modeArea')
const modeAllBtn   = document.getElementById('modeAllBtn')
const modeIndBtn   = document.getElementById('modeIndBtn')
const batchModeWrap = document.getElementById('batchModeWrap')
const warning      = document.getElementById('warning')
const nextSteps    = document.getElementById('nextSteps')
const nextStepsButtons = document.getElementById('nextStepsButtons')
const ctx          = pixCanvas.getContext('2d')

let selectedFiles = []
let isWholeMode = true
let isApplyAll = false
let activeFileIdx = 0
let perFileSelections = [] // perFileSelections[i] = [{ x, y, w, h, active:bool }, ...]
let perFileMode = []       // perFileMode[i] = 'whole' | 'area'
let perFileLevel = []      // perFileLevel[i] = blockSize number
let currentDrag = null
let isDragging = false
let dragStart = { x: 0, y: 0 }
let loadedImages = [] // cached Image objects
let resultBlobs = []
let currentDownloadUrl = null

// ── Mode toggles ────────────────────────────────────────────────────────────
modeWhole.addEventListener('click', () => {
  isWholeMode = true
  modeWhole.classList.add('active')
  modeArea.classList.remove('active')
  if (!isApplyAll) { perFileSelections[activeFileIdx] = []; perFileMode[activeFileIdx] = 'whole' }
  canvasWrap.style.cursor = 'default'
  applyPixelation()
})

modeArea.addEventListener('click', () => {
  if (isApplyAll) return // Select Area only available in Individual mode
  isWholeMode = false
  modeArea.classList.add('active')
  modeWhole.classList.remove('active')
  perFileMode[activeFileIdx] = 'area'
  canvasWrap.style.cursor = 'crosshair'
  applyPixelation()
})

modeAllBtn.addEventListener('click', () => {
  isApplyAll = true
  modeAllBtn.style.background = '#C84B31'; modeAllBtn.style.color = '#fff'; modeAllBtn.style.borderColor = '#C84B31'
  modeIndBtn.style.background = '#fff'; modeIndBtn.style.color = '#2C1810'; modeIndBtn.style.borderColor = '#DDD5C8'
  // Force Whole Image mode in Apply to All
  isWholeMode = true
  modeWhole.classList.add('active')
  modeArea.classList.remove('active')
  modeArea.style.opacity = '0.5'
  modeArea.style.pointerEvents = 'none'
  canvasWrap.style.cursor = 'default'
  applyPixelation()
})

modeIndBtn.addEventListener('click', () => {
  isApplyAll = false
  modeIndBtn.style.background = '#C84B31'; modeIndBtn.style.color = '#fff'; modeIndBtn.style.borderColor = '#C84B31'
  modeAllBtn.style.background = '#fff'; modeAllBtn.style.color = '#2C1810'; modeAllBtn.style.borderColor = '#DDD5C8'
  // Re-enable Select Area button
  modeArea.style.opacity = '1'
  modeArea.style.pointerEvents = 'auto'
  if (selectedFiles.length) openEditor(activeFileIdx)
})

// ── File handling ───────────────────────────────────────────────────────────
function addFiles(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
  if (!arr.length) return
  if (selectedFiles.length + arr.length > MAX_FILES) {
    showWarning('Maximum ' + MAX_FILES + ' files.')
    return
  }
  const totalSize = selectedFiles.reduce((s, f) => s + f.size, 0) + arr.reduce((s, f) => s + f.size, 0)
  if (totalSize > MAX_TOTAL_BYTES) {
    showWarning('Total file size exceeds 200 MB limit.')
    return
  }
  arr.forEach(f => {
    selectedFiles.push(f)
    perFileSelections.push([])
    perFileMode.push('whole')
    perFileLevel.push(12)
    loadedImages.push(null)
  })
  // Preload images
  arr.forEach((f, i) => {
    const idx = selectedFiles.length - arr.length + i
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => { loadedImages[idx] = img; URL.revokeObjectURL(url) }
    img.src = url
  })
  renderFileChips()
  uploadArea.style.display = 'none'
  workArea.style.display = 'block'
  downloadBtn.disabled = false
  // Always auto-open first/active file in editor
  const targetIdx = activeFileIdx < selectedFiles.length ? activeFileIdx : 0
  const waitForLoad = () => {
    if (loadedImages[targetIdx]) { openEditor(targetIdx) }
    else { setTimeout(waitForLoad, 50) }
  }
  waitForLoad()
}

function removeFile(idx) {
  if (thumbUrls[idx]) URL.revokeObjectURL(thumbUrls[idx])
  thumbUrls.splice(idx, 1)
  selectedFiles.splice(idx, 1)
  perFileSelections.splice(idx, 1)
  perFileMode.splice(idx, 1)
  perFileLevel.splice(idx, 1)
  loadedImages.splice(idx, 1)
  if (activeFileIdx >= selectedFiles.length) activeFileIdx = Math.max(0, selectedFiles.length - 1)
  renderFileChips()
  if (!selectedFiles.length) {
    workArea.style.display = 'none'
    uploadArea.style.display = 'block'
    editorArea.style.display = 'none'
    downloadBtn.disabled = true
    nextSteps.style.display = 'none'
  } else {
    if (loadedImages[activeFileIdx]) openEditor(activeFileIdx)
  }
}

let thumbUrls = []

function renderFileChips() {
  // Revoke old thumb URLs
  thumbUrls.forEach(u => { if (u) URL.revokeObjectURL(u) })
  thumbUrls = selectedFiles.map(f => URL.createObjectURL(f))

  fileChips.innerHTML = selectedFiles.map((f, i) => `
    <div class="file-thumb${i === activeFileIdx ? ' active' : ''}" data-idx="${i}">
      <img src="${thumbUrls[i]}" alt="${f.name}" />
      <button class="thumb-x" data-idx="${i}">&times;</button>
    </div>
  `).join('') + `<div class="add-thumb" id="addMoreChip">+</div>`

  batchModeWrap.style.display = selectedFiles.length > 1 ? 'block' : 'none'

  fileChips.querySelectorAll('.thumb-x').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); removeFile(parseInt(btn.dataset.idx)) })
  })
  fileChips.querySelectorAll('.file-thumb[data-idx]').forEach(thumb => {
    thumb.addEventListener('click', () => openEditor(parseInt(thumb.dataset.idx)))
  })
  document.getElementById('addMoreChip').addEventListener('click', () => fileInput.click())
}

function openEditor(idx) {
  // Save current file's state before switching
  if (!isApplyAll && activeFileIdx < selectedFiles.length) {
    perFileMode[activeFileIdx] = isWholeMode ? 'whole' : 'area'
    perFileLevel[activeFileIdx] = parseInt(pixelSlider.value)
  }
  activeFileIdx = idx
  const img = loadedImages[idx]
  if (!img) return
  pixCanvas.width = img.naturalWidth
  pixCanvas.height = img.naturalHeight
  editorArea.style.display = 'block'
  currentDrag = null
  // Restore per-file state in Individual mode
  if (!isApplyAll) {
    isWholeMode = perFileMode[idx] === 'whole'
    pixelSlider.value = perFileLevel[idx] || 12
    pixelVal.textContent = pixelSlider.value
    modeWhole.classList.toggle('active', isWholeMode)
    modeArea.classList.toggle('active', !isWholeMode)
    canvasWrap.style.cursor = isWholeMode ? 'default' : 'crosshair'
  }
  applyPixelation()
  // Update active thumbnail highlight
  fileChips.querySelectorAll('.file-thumb[data-idx]').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === idx)
  })
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

// ── Selection drawing ───────────────────────────────────────────────────────
function getCanvasCoords(e) {
  const rect = pixCanvas.getBoundingClientRect()
  const scaleX = pixCanvas.width / rect.width
  const scaleY = pixCanvas.height / rect.height
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
}

canvasWrap.addEventListener('mousedown', startDrag)
canvasWrap.addEventListener('touchstart', startDrag, { passive: false })
function startDrag(e) {
  if (isWholeMode || isApplyAll) return
  if (!loadedImages[activeFileIdx]) return
  // Don't start drag if clicking on a selection box or its X button
  if (e.target.closest('.pix-selection')) return
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
  currentDrag = {
    x: Math.min(dragStart.x, pos.x), y: Math.min(dragStart.y, pos.y),
    w: Math.abs(pos.x - dragStart.x), h: Math.abs(pos.y - dragStart.y)
  }
  renderSelectionBoxes()
  applyPixelation()
}

document.addEventListener('mouseup', endDrag)
document.addEventListener('touchend', endDrag)
function endDrag() {
  if (!isDragging) return
  isDragging = false
  if (currentDrag && currentDrag.w > 5 && currentDrag.h > 5) {
    perFileSelections[activeFileIdx].push({ ...currentDrag, active: true })
  }
  currentDrag = null
  renderSelectionBoxes()
  applyPixelation()
}

function renderSelectionBoxes() {
  canvasWrap.querySelectorAll('.pix-selection').forEach(el => el.remove())
  if (isApplyAll && selectedFiles.length > 1) return
  const canvasRect = pixCanvas.getBoundingClientRect()
  const wrapRect = canvasWrap.getBoundingClientRect()
  const offsetX = canvasRect.left - wrapRect.left
  const offsetY = canvasRect.top - wrapRect.top
  const scaleX = canvasRect.width / pixCanvas.width
  const scaleY = canvasRect.height / pixCanvas.height
  const savedSels = perFileSelections[activeFileIdx] || []
  const allSels = [...savedSels]
  if (currentDrag) allSels.push({ ...currentDrag, active: true })
  allSels.forEach((sel, i) => {
    const isSaved = i < savedSels.length
    const isActive = sel.active !== false
    const div = document.createElement('div')
    div.className = 'pix-selection'
    div.style.left = (offsetX + sel.x * scaleX) + 'px'
    div.style.top = (offsetY + sel.y * scaleY) + 'px'
    div.style.width = (sel.w * scaleX) + 'px'
    div.style.height = (sel.h * scaleY) + 'px'
    div.style.display = 'block'
    // Active: solid border + colored fill; Inactive: dashed border, no fill
    if (isActive) {
      div.style.borderColor = '#C84B31'
      div.style.background = 'rgba(200,75,49,0.15)'
      div.style.borderStyle = 'solid'
    } else {
      div.style.borderColor = '#9A8A7A'
      div.style.background = 'transparent'
      div.style.borderStyle = 'dashed'
    }
    if (isSaved) {
      // Click to toggle active/inactive
      div.style.cursor = 'pointer'
      div.addEventListener('mousedown', e => {
        e.stopPropagation() // prevent drag start
      })
      div.addEventListener('click', e => {
        if (e.target.closest('button')) return // don't toggle when clicking X
        perFileSelections[activeFileIdx][i].active = !perFileSelections[activeFileIdx][i].active
        renderSelectionBoxes()
        applyPixelation()
      })
      // X delete button
      const xBtn = document.createElement('button')
      xBtn.textContent = '\u00d7'
      xBtn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(200,75,49,0.85);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;pointer-events:auto;line-height:1;padding:0;'
      xBtn.addEventListener('mousedown', e => {
        e.stopPropagation()
        e.preventDefault()
      })
      xBtn.addEventListener('click', e => {
        e.stopPropagation()
        e.preventDefault()
        perFileSelections[activeFileIdx].splice(i, 1)
        renderSelectionBoxes()
        applyPixelation()
      })
      div.appendChild(xBtn)
    }
    canvasWrap.appendChild(div)
  })
}

// ── Pixelation logic ────────────────────────────────────────────────────────
function applyPixelation() {
  const img = loadedImages[activeFileIdx]
  if (!img) return
  const blockSize = parseInt(pixelSlider.value)
  ctx.drawImage(img, 0, 0)
  if (isWholeMode) {
    pixelateRegion(0, 0, pixCanvas.width, pixCanvas.height, blockSize)
  } else {
    const sels = (perFileSelections[activeFileIdx] || []).filter(s => s.active !== false)
    if (currentDrag && currentDrag.w > 2 && currentDrag.h > 2) sels.push(currentDrag)
    sels.forEach(sel => {
      pixelateRegion(Math.round(sel.x), Math.round(sel.y), Math.round(sel.w), Math.round(sel.h), blockSize)
    })
  }
}

function pixelateRegion(rx, ry, rw, rh, blockSize) {
  const x0 = Math.max(0, rx), y0 = Math.max(0, ry)
  const x1 = Math.min(pixCanvas.width, rx + rw), y1 = Math.min(pixCanvas.height, ry + rh)
  const w = x1 - x0, h = y1 - y0
  if (w <= 0 || h <= 0) return
  // Read all pixels at once for performance
  const imgData = ctx.getImageData(x0, y0, w, h)
  const d = imgData.data
  for (let by = 0; by < h; by += blockSize) {
    for (let bx = 0; bx < w; bx += blockSize) {
      const bw = Math.min(blockSize, w - bx), bh = Math.min(blockSize, h - by)
      const sx = Math.min(bx + (bw >> 1), w - 1)
      const sy = Math.min(by + (bh >> 1), h - 1)
      const idx = (sy * w + sx) * 4
      const r = d[idx], g = d[idx + 1], b = d[idx + 2]
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(x0 + bx, y0 + by, bw, bh)
    }
  }
}

function pixelateImageToBlob(img, file, blockSize, sels) {
  return new Promise(resolve => {
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const cx = c.getContext('2d')
    cx.drawImage(img, 0, 0)
    if (!sels || !sels.length) {
      // Pixelate whole — read all pixels once
      const imgData = cx.getImageData(0, 0, c.width, c.height)
      const d = imgData.data, w = c.width, h = c.height
      for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
          const bw = Math.min(blockSize, w - bx), bh = Math.min(blockSize, h - by)
          const sx = Math.min(bx + (bw >> 1), w - 1)
          const sy = Math.min(by + (bh >> 1), h - 1)
          const idx = (sy * w + sx) * 4
          cx.fillStyle = `rgb(${d[idx]},${d[idx+1]},${d[idx+2]})`
          cx.fillRect(bx, by, bw, bh)
        }
      }
    } else {
      sels.forEach(sel => {
        const x0 = Math.max(0, Math.round(sel.x)), y0 = Math.max(0, Math.round(sel.y))
        const x1 = Math.min(c.width, Math.round(sel.x + sel.w)), y1 = Math.min(c.height, Math.round(sel.y + sel.h))
        const rw = x1 - x0, rh = y1 - y0
        if (rw <= 0 || rh <= 0) return
        const imgData = cx.getImageData(x0, y0, rw, rh)
        const d = imgData.data
        for (let by = 0; by < rh; by += blockSize) {
          for (let bx = 0; bx < rw; bx += blockSize) {
            const bw = Math.min(blockSize, rw - bx), bh = Math.min(blockSize, rh - by)
            const sx = Math.min(bx + (bw >> 1), rw - 1)
            const sy = Math.min(by + (bh >> 1), rh - 1)
            const idx = (sy * rw + sx) * 4
            cx.fillStyle = `rgb(${d[idx]},${d[idx+1]},${d[idx+2]})`
            cx.fillRect(x0 + bx, y0 + by, bw, bh)
          }
        }
      })
    }
    const mime = file.type === 'image/png' ? 'image/png' : (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg')
    c.toBlob(blob => resolve(blob), mime, mime === 'image/jpeg' ? 0.92 : undefined)
  })
}

// ── Slider live update ──────────────────────────────────────────────────────
pixelSlider.addEventListener('input', () => {
  pixelVal.textContent = pixelSlider.value
  if (!isApplyAll) perFileLevel[activeFileIdx] = parseInt(pixelSlider.value)
  if (loadedImages[activeFileIdx] && editorArea.style.display !== 'none') applyPixelation()
})

// ── Download ────────────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', async () => {
  if (!selectedFiles.length) return
  const blockSize = parseInt(pixelSlider.value)
  downloadBtn.disabled = true
  downloadBtn.textContent = t.processing || 'Processing...'

  try {
    resultBlobs = []
    for (let i = 0; i < selectedFiles.length; i++) {
      downloadBtn.textContent = (t.processing || 'Processing...') + ` (${i + 1}/${selectedFiles.length})`
      // Wait for image to load if not ready
      if (!loadedImages[i]) {
        loadedImages[i] = await new Promise((resolve, reject) => {
          const url = URL.createObjectURL(selectedFiles[i])
          const img = new Image()
          img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
          img.src = url
        })
      }
      const fileBlockSize = isApplyAll ? blockSize : (perFileLevel[i] || 12)
      const sels = isApplyAll ? [] : (perFileSelections[i] || []).filter(s => s.active !== false)
      const fileIsWhole = isApplyAll ? isWholeMode : (perFileMode[i] === 'whole')
      const blob = await pixelateImageToBlob(loadedImages[i], selectedFiles[i], fileBlockSize, fileIsWhole ? [] : sels)
      const ext = selectedFiles[i].type === 'image/png' ? '.png' : (selectedFiles[i].type === 'image/webp' ? '.webp' : '.jpg')
      const baseName = selectedFiles[i].name.replace(/\.[^.]+$/, '')
      resultBlobs.push({ blob, name: baseName + '_pixelated' + ext, type: blob.type })
    }

    if (resultBlobs.length === 1) {
      cleanupOldUrl()
      currentDownloadUrl = URL.createObjectURL(resultBlobs[0].blob)
      const a = document.createElement('a')
      a.href = currentDownloadUrl
      a.download = resultBlobs[0].name
      a.click()
    } else {
      const zip = new JSZip()
      resultBlobs.forEach((r, i) => zip.file((i + 1) + '_' + r.name, r.blob))
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      cleanupOldUrl()
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = currentDownloadUrl
      a.download = 'pixelated-images.zip'
      a.click()
    }
    buildNextSteps()
  } catch (e) {
    alert('Error: ' + e.message)
  }
  downloadBtn.disabled = false
  downloadBtn.textContent = selectedFiles.length > 1 ? downloadZipLbl : dlLabel
})

// ── UI helpers ──────────────────────────────────────────────────────────────
function cleanupOldUrl() { if (currentDownloadUrl) { URL.revokeObjectURL(currentDownloadUrl); currentDownloadUrl = null } }
function showWarning(msg) { warning.style.display = 'block'; warning.textContent = msg; setTimeout(() => { warning.style.display = 'none' }, 5000) }

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
