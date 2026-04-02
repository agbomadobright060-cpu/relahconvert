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
  document.body.style.cssText = `margin:0; padding:0; min-height:100vh; background:var(--bg-page);`
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #app > div { animation: fadeUp 0.4s ease both; }
    #downloadBtn:not(:disabled):hover { background: var(--accent-hover) !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,75,49,0.35) !important; }
    #downloadBtn { transition: all 0.18s ease; }
    .next-link { padding:8px 16px; border-radius:8px; border:1.5px solid var(--border-light); font-size:13px; font-weight:500; color:var(--text-primary); text-decoration:none; background:var(--bg-card); cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .next-link:hover { border-color:var(--accent); color:var(--accent); }
    .pix-mode-btn { padding:7px 16px; border-radius:8px; border:1.5px solid var(--border-light); font-size:13px; font-weight:600; color:var(--text-primary); background:var(--bg-card); cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
    .pix-mode-btn:hover { border-color:var(--accent); color:var(--accent); }
    .pix-mode-btn.active { background:var(--accent); color:var(--text-on-accent); border-color:var(--accent); }
    .preview-card { background:var(--bg-card); border-radius:6px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); position:relative; cursor:pointer; transition:outline 0.1s; }
    .preview-card:hover { outline:2px solid var(--accent); outline-offset:1px; }
    .preview-card.active { outline:2px solid var(--accent); outline-offset:1px; }
    .preview-card img { width:100%; height:80px; object-fit:cover; display:block; }
    .preview-card .remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:22px; height:22px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .preview-card .remove-btn:hover { background:var(--accent); }
    .preview-card .fname { font-size:11px; color:#555; padding:6px 8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tool-layout { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:start; }
    .image-col { min-height:320px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; }
    .controls-col { background:var(--bg-card); border-radius:14px; border:1.5px solid var(--border); padding:16px; font-family:'DM Sans',sans-serif; }
    .controls-col h3 { font-family:'Fraunces',serif; font-size:16px; font-weight:700; color:var(--text-primary); margin:0 0 12px; }
    .section-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; }
    .divider { height:1px; background:var(--bg-surface); margin:12px 0; }
    .range-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
    .range-val { font-size:12px; color:var(--text-muted); min-width:28px; text-align:right; }
    .opt-btn { width:100%; padding:12px; border:none; border-radius:10px; background:var(--accent); color:var(--text-on-accent); font-size:14px; font-family:'Fraunces',serif; font-weight:700; cursor:pointer; transition:all 0.18s; }
    .opt-btn:hover { background:var(--accent-hover); transform:translateY(-1px); }
    .opt-btn:disabled { background:var(--btn-disabled); cursor:not-allowed; opacity:0.7; transform:none; }
    .file-chips { display:flex; gap:8px; margin-bottom:12px; overflow-x:auto; padding-bottom:4px; }
    .file-thumb { position:relative; flex-shrink:0; width:64px; height:64px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:border-color 0.15s; }
    .file-thumb:hover { border-color:var(--accent); }
    .file-thumb.active { border-color:var(--accent); box-shadow:0 0 0 2px rgba(200,75,49,0.3); }
    .file-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .file-thumb .thumb-x { position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:16px; height:16px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; padding:0; opacity:0; transition:opacity 0.15s; }
    .file-thumb:hover .thumb-x { opacity:1; }
    .file-thumb .thumb-x:hover { background:var(--accent); }
    .add-thumb { flex-shrink:0; width:64px; height:64px; border-radius:8px; border:1.5px dashed var(--border-light); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; color:var(--text-muted); transition:all 0.15s; }
    .add-thumb:hover { border-color:var(--accent); color:var(--accent); }
    .pix-canvas-wrap { position:relative; overflow:hidden; display:block; width:100%; }
    .pix-canvas-wrap canvas { display:block; max-width:100%; max-height:500px; margin:0 auto; cursor:crosshair; touch-action:none; }
    @media (max-width:700px) { .tool-layout { grid-template-columns:1fr; } .image-col { min-height:220px; } }
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
  document.title = t.pix_page_title || 'Pixelate Image Online \u2014 Pixelate Face or Full Image Free | RelahConvert'
  const metaDesc = document.createElement('meta')
  metaDesc.name = 'description'
  metaDesc.content = t.pix_meta_desc || 'Pixelate image free \u2014 pixelate a face, region, or entire image with adjustable intensity. Batch process up to 25 files. Browser-only, no upload, completely private.'
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
  it: {
    h2a: 'Come pixelare un\'immagine online',
    steps: ['<strong>Carica la tua immagine</strong> — fai clic su "Seleziona immagine" oppure trascina e rilascia un file JPG, PNG o WebP.','<strong>Scegli una modalità</strong> — seleziona "Immagine intera" per pixelare tutto, oppure "Seleziona area" per disegnare un riquadro sopra un volto o una zona che vuoi pixelare.','<strong>Regola il cursore</strong> — sposta il cursore del livello di pixelatura da basso (mosaico leggero) ad alto (blocchi pesanti). L\'anteprima si aggiorna in tempo reale mentre regoli.','<strong>Scarica</strong> — salva l\'immagine pixelata sul tuo dispositivo.'],
    h2b: 'Il miglior strumento gratuito per pixelare immagini e volti online',
    body: '<p>Hai bisogno di nascondere un volto, una targa o informazioni sensibili in una foto? Lo strumento Pixela immagine di RelahConvert ti permette di applicare un effetto mosaico all\'intera immagine o solo a un\'area specifica — tutto direttamente nel tuo browser. Nessun caricamento, nessun server, completamente gratuito e privato.</p><p>Usa il cursore regolabile per controllare l\'intensità della pixelatura da un mosaico leggero a blocchi pesanti. Disegna un riquadro di selezione per pixelare solo un volto o una zona mantenendo il resto dell\'immagine nitido. Perfetto per la protezione della privacy, l\'offuscamento di dati sensibili, i post sui social media e l\'anonimizzazione delle foto prima della condivisione.</p>',
    h3why: 'Perché pixelare le immagini?',
    why: 'La pixelatura è il modo più riconoscibile per nascondere contenuti sensibili nelle immagini. A differenza della sfocatura, la pixelatura non può essere invertita — il dettaglio originale viene sostituito permanentemente con blocchi di colore solido. Questo la rende ideale per proteggere la privacy, nascondere volti, targhe, indirizzi e informazioni riservate.',
    faqs: [
      { q: 'Cos\'è la pixelatura delle immagini?', a: 'La pixelatura delle immagini sostituisce aree di un\'immagine con grandi blocchi di colore solido, creando un effetto mosaico che nasconde il dettaglio originale. A differenza della sfocatura, la pixelatura è irreversibile — i pixel originali vengono sostituiti permanentemente, rendendola un modo sicuro per nascondere contenuti sensibili.' },
      { q: 'Posso pixelare solo un volto o un\'area specifica?', a: 'Sì — passa alla modalità "Seleziona area" e disegna un rettangolo sopra il volto o la zona che vuoi pixelare. Il resto dell\'immagine rimane nitido e inalterato. Puoi regolare il livello di pixelatura con il cursore.' },
      { q: 'Come controllo l\'intensità della pixelatura?', a: 'Usa il cursore per regolare la dimensione dei blocchi da basso (blocchi piccoli, effetto leggero) ad alto (blocchi grandi, pixelatura pesante). L\'anteprima si aggiorna in tempo reale mentre muovi il cursore.' },
      { q: 'La pixelatura è reversibile?', a: 'No — una volta scaricata l\'immagine pixelata, il dettaglio originale nelle aree pixelate è perso permanentemente. Questo è ciò che rende la pixelatura più sicura della sfocatura per nascondere informazioni sensibili.' },
      { q: 'Quali formati sono supportati?', a: 'Puoi caricare immagini JPG, PNG e WebP. Il formato di output corrisponde a quello di input — JPG resta JPG, PNG resta PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Sfoca volto' },{ href: '/crop', label: 'Ritaglia' },{ href: '/compress', label: 'Comprimi' },{ href: '/resize', label: 'Ridimensiona' }],
  },
  ja: {
    h2a: 'オンラインで画像をピクセル化する方法',
    steps: ['<strong>画像をアップロード</strong> — 「画像を選択」をクリックするか、JPG、PNG、またはWebPファイルをドラッグ＆ドロップします。','<strong>モードを選択</strong> — 「画像全体」を選択してすべてをピクセル化するか、「エリアを選択」を選択して顔やピクセル化したい領域にボックスを描きます。','<strong>スライダーを調整</strong> — ピクセル化レベルのスライダーを低（薄いモザイク）から高（大きなブロック）まで動かします。調整するとプレビューがリアルタイムで更新されます。','<strong>ダウンロード</strong> — ピクセル化された画像をデバイスに保存します。'],
    h2b: '画像と顔をオンラインでピクセル化する最高の無料ツール',
    body: '<p>写真の中の顔、ナンバープレート、または機密情報を隠す必要がありますか？RelahConvertのピクセル化ツールを使えば、画像全体または特定のエリアにモザイク効果を適用できます — すべてブラウザ内で完結します。アップロード不要、サーバー不要、完全に無料でプライベートです。</p><p>調整可能なスライダーを使って、薄いモザイクから大きなブロックまでピクセル化の強度を制御できます。選択ボックスを描いて、顔や領域のみをピクセル化し、画像の残りの部分はシャープに保ちます。プライバシー保護、機密データのぼかし、ソーシャルメディアの投稿、共有前の写真の匿名化に最適です。</p>',
    h3why: 'なぜ画像をピクセル化するのか？',
    why: 'ピクセル化は、画像内の機密コンテンツを隠す最も認知度の高い方法です。ぼかしとは異なり、ピクセル化は元に戻すことができません — 元のディテールは単色ブロックで永久に置き換えられます。これにより、プライバシーの保護、顔、ナンバープレート、住所、機密情報の隠蔽に最適です。',
    faqs: [
      { q: '画像のピクセル化とは何ですか？', a: '画像のピクセル化とは、画像の領域を大きな単色ブロックに置き換え、元のディテールを隠すモザイク効果を作り出すことです。ぼかしとは異なり、ピクセル化は不可逆です — 元のピクセルは永久に置き換えられるため、機密コンテンツを隠す安全な方法です。' },
      { q: '顔や特定のエリアだけをピクセル化できますか？', a: 'はい — 「エリアを選択」モードに切り替えて、ピクセル化したい顔や領域の上に長方形を描きます。画像の残りの部分はシャープで影響を受けません。スライダーでピクセル化レベルを調整できます。' },
      { q: 'ピクセル化の強度はどのように制御しますか？', a: 'スライダーを使って、ブロックサイズを低（小さなブロック、控えめな効果）から高（大きなブロック、強いピクセル化）まで調整します。スライダーを動かすとプレビューがリアルタイムで更新されます。' },
      { q: 'ピクセル化は元に戻せますか？', a: 'いいえ — ピクセル化された画像をダウンロードすると、ピクセル化された領域の元のディテールは永久に失われます。これが、機密情報を隠す際にピクセル化がぼかしよりも安全である理由です。' },
      { q: 'どのフォーマットに対応していますか？', a: 'JPG、PNG、WebP画像をアップロードできます。出力フォーマットは入力に一致します — JPGはJPGのまま、PNGはPNGのままです。' },
    ],
    links: [{ href: '/blur-face', label: '顔をぼかす' },{ href: '/crop', label: '切り抜き' },{ href: '/compress', label: '圧縮' },{ href: '/resize', label: 'リサイズ' }],
  },
  ru: {
    h2a: 'Как пикселизировать изображение онлайн',
    steps: ['<strong>Загрузите изображение</strong> — нажмите «Выбрать изображение» или перетащите файл JPG, PNG или WebP.','<strong>Выберите режим</strong> — выберите «Всё изображение», чтобы пикселизировать всё, или «Выбрать область», чтобы нарисовать рамку вокруг лица или области, которую хотите пикселизировать.','<strong>Настройте ползунок</strong> — перемещайте ползунок уровня пикселизации от низкого (лёгкая мозаика) до высокого (крупные блоки). Предварительный просмотр обновляется в реальном времени при настройке.','<strong>Скачайте</strong> — сохраните пикселизированное изображение на своё устройство.'],
    h2b: 'Лучший бесплатный инструмент для пикселизации изображений и лиц онлайн',
    body: '<p>Нужно скрыть лицо, номерной знак или конфиденциальную информацию на фото? Инструмент пикселизации изображений от RelahConvert позволяет применить эффект мозаики ко всему изображению или только к определённой области — всё прямо в вашем браузере. Без загрузки на сервер, полностью бесплатно и конфиденциально.</p><p>Используйте регулируемый ползунок для управления интенсивностью пикселизации от лёгкой мозаики до крупных блоков. Нарисуйте рамку выделения, чтобы пикселизировать только лицо или область, сохраняя остальную часть изображения чёткой. Идеально подходит для защиты конфиденциальности, скрытия персональных данных, публикаций в социальных сетях и анонимизации фотографий перед отправкой.</p>',
    h3why: 'Зачем пикселизировать изображения?',
    why: 'Пикселизация — самый узнаваемый способ скрыть конфиденциальное содержимое на изображениях. В отличие от размытия, пикселизацию невозможно отменить — исходные детали навсегда заменяются сплошными цветными блоками. Это делает её идеальной для защиты конфиденциальности, скрытия лиц, номерных знаков, адресов и секретной информации.',
    faqs: [
      { q: 'Что такое пикселизация изображений?', a: 'Пикселизация изображений заменяет области изображения крупными одноцветными блоками, создавая эффект мозаики, который скрывает исходные детали. В отличие от размытия, пикселизация необратима — исходные пиксели навсегда заменяются, что делает её надёжным способом скрытия конфиденциального содержимого.' },
      { q: 'Можно ли пикселизировать только лицо или определённую область?', a: 'Да — переключитесь в режим «Выбрать область» и нарисуйте прямоугольник поверх лица или области, которую хотите пикселизировать. Остальная часть изображения остаётся чёткой и нетронутой. Вы можете настроить уровень пикселизации с помощью ползунка.' },
      { q: 'Как управлять интенсивностью пикселизации?', a: 'Используйте ползунок для настройки размера блоков от низкого (мелкие блоки, лёгкий эффект) до высокого (крупные блоки, сильная пикселизация). Предварительный просмотр обновляется в реальном времени при перемещении ползунка.' },
      { q: 'Можно ли отменить пикселизацию?', a: 'Нет — после скачивания пикселизированного изображения исходные детали в пикселизированных областях теряются навсегда. Именно это делает пикселизацию более надёжной, чем размытие, для скрытия конфиденциальной информации.' },
      { q: 'Какие форматы поддерживаются?', a: 'Вы можете загружать изображения в форматах JPG, PNG и WebP. Формат вывода соответствует формату ввода — JPG остаётся JPG, PNG остаётся PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Размытие лица' },{ href: '/crop', label: 'Обрезка' },{ href: '/compress', label: 'Сжатие' },{ href: '/resize', label: 'Изменить размер' }],
  },
  ko: {
    h2a: '온라인에서 이미지를 픽셀화하는 방법',
    steps: ['<strong>이미지 업로드</strong> — "이미지 선택"을 클릭하거나 JPG, PNG 또는 WebP 파일을 드래그 앤 드롭하세요.','<strong>모드 선택</strong> — "전체 이미지"를 선택하여 모든 것을 픽셀화하거나, "영역 선택"을 선택하여 픽셀화하려는 얼굴이나 영역 위에 상자를 그리세요.','<strong>슬라이더 조절</strong> — 픽셀화 수준 슬라이더를 낮음(은은한 모자이크)에서 높음(큰 블록)까지 이동하세요. 조절하는 동안 미리보기가 실시간으로 업데이트됩니다.','<strong>다운로드</strong> — 픽셀화된 이미지를 기기에 저장하세요.'],
    h2b: '온라인에서 이미지와 얼굴을 픽셀화하는 최고의 무료 도구',
    body: '<p>사진에서 얼굴, 번호판 또는 민감한 정보를 숨겨야 하나요? RelahConvert의 이미지 픽셀화 도구를 사용하면 전체 이미지 또는 특정 영역에만 모자이크 효과를 적용할 수 있습니다 — 모든 것이 브라우저 내에서 처리됩니다. 업로드 없음, 서버 없음, 완전히 무료이며 프라이버시가 보장됩니다.</p><p>조절 가능한 슬라이더를 사용하여 은은한 모자이크에서 큰 블록까지 픽셀화 강도를 제어하세요. 선택 상자를 그려 얼굴이나 영역만 픽셀화하고 나머지 이미지는 선명하게 유지하세요. 프라이버시 보호, 민감한 데이터 흐림 처리, 소셜 미디어 게시물, 공유 전 사진 익명화에 완벽합니다.</p>',
    h3why: '왜 이미지를 픽셀화하나요?',
    why: '픽셀화는 이미지에서 민감한 콘텐츠를 숨기는 가장 잘 알려진 방법입니다. 흐림과 달리 픽셀화는 되돌릴 수 없습니다 — 원본 디테일이 단색 블록으로 영구적으로 대체됩니다. 이는 프라이버시 보호, 얼굴, 번호판, 주소 및 기밀 정보를 숨기는 데 이상적입니다.',
    faqs: [
      { q: '이미지 픽셀화란 무엇인가요?', a: '이미지 픽셀화는 이미지의 영역을 큰 단색 블록으로 대체하여 원본 디테일을 숨기는 모자이크 효과를 만드는 것입니다. 흐림과 달리 픽셀화는 되돌릴 수 없습니다 — 원본 픽셀이 영구적으로 대체되어 민감한 콘텐츠를 숨기는 안전한 방법입니다.' },
      { q: '얼굴이나 특정 영역만 픽셀화할 수 있나요?', a: '네 — "영역 선택" 모드로 전환하고 픽셀화하려는 얼굴이나 영역 위에 직사각형을 그리세요. 나머지 이미지는 선명하고 영향을 받지 않습니다. 슬라이더로 픽셀화 수준을 조절할 수 있습니다.' },
      { q: '픽셀화 강도는 어떻게 제어하나요?', a: '슬라이더를 사용하여 블록 크기를 낮음(작은 블록, 은은한 효과)에서 높음(큰 블록, 강한 픽셀화)까지 조절하세요. 슬라이더를 움직이면 미리보기가 실시간으로 업데이트됩니다.' },
      { q: '픽셀화는 되돌릴 수 있나요?', a: '아니요 — 픽셀화된 이미지를 다운로드하면 픽셀화된 영역의 원본 디테일은 영구적으로 사라집니다. 이것이 민감한 정보를 숨길 때 픽셀화가 흐림보다 더 안전한 이유입니다.' },
      { q: '어떤 형식이 지원되나요?', a: 'JPG, PNG, WebP 이미지를 업로드할 수 있습니다. 출력 형식은 입력과 동일합니다 — JPG는 JPG로, PNG는 PNG로 유지됩니다.' },
    ],
    links: [{ href: '/blur-face', label: '얼굴 흐림' },{ href: '/crop', label: '자르기' },{ href: '/compress', label: '압축' },{ href: '/resize', label: '크기 조절' }],
  },
  zh: {
    h2a: '如何在线像素化图片',
    steps: ['<strong>上传图片</strong> — 点击"选择图片"或拖放JPG、PNG或WebP文件。','<strong>选择模式</strong> — 选择"整张图片"来像素化所有内容，或选择"选择区域"在要像素化的面部或区域上绘制方框。','<strong>调整滑块</strong> — 将像素化级别滑块从低（轻微马赛克）移动到高（大块马赛克）。调整时预览会实时更新。','<strong>下载</strong> — 将像素化后的图片保存到您的设备。'],
    h2b: '在线像素化图片和面部的最佳免费工具',
    body: '<p>需要在照片中隐藏面部、车牌或敏感信息吗？RelahConvert的图片像素化工具让您可以对整张图片或特定区域应用马赛克效果 — 全部在浏览器中完成。无需上传，无需服务器，完全免费且保护隐私。</p><p>使用可调节的滑块控制像素化强度，从轻微马赛克到大块马赛克。绘制选择框仅对面部或区域进行像素化，同时保持图片其余部分清晰。非常适合隐私保护、模糊敏感数据、社交媒体帖子以及分享前的照片匿名化处理。</p>',
    h3why: '为什么要像素化图片？',
    why: '像素化是隐藏图片中敏感内容最常见的方式。与模糊不同，像素化无法逆转 — 原始细节会被纯色块永久替换。这使其成为保护隐私、隐藏面部、车牌、地址和机密信息的理想选择。',
    faqs: [
      { q: '什么是图片像素化？', a: '图片像素化是将图片的区域替换为大的纯色块，产生隐藏原始细节的马赛克效果。与模糊不同，像素化是不可逆的 — 原始像素被永久替换，使其成为隐藏敏感内容的安全方式。' },
      { q: '我可以只像素化面部或特定区域吗？', a: '可以 — 切换到"选择区域"模式，在要像素化的面部或区域上绘制一个矩形。图片的其余部分保持清晰且不受影响。您可以使用滑块调整像素化级别。' },
      { q: '如何控制像素化强度？', a: '使用滑块调整块大小，从低（小块，轻微效果）到高（大块，强烈像素化）。移动滑块时预览会实时更新。' },
      { q: '像素化可以逆转吗？', a: '不能 — 一旦下载像素化后的图片，像素化区域中的原始细节就永久消失了。这就是为什么像素化比模糊更安全地隐藏敏感信息的原因。' },
      { q: '支持哪些格式？', a: '您可以上传JPG、PNG和WebP图片。输出格式与输入格式一致 — JPG保持JPG，PNG保持PNG。' },
    ],
    links: [{ href: '/blur-face', label: '模糊面部' },{ href: '/crop', label: '裁剪' },{ href: '/compress', label: '压缩' },{ href: '/resize', label: '调整大小' }],
  },
  'zh-TW': {
    h2a: '如何在線上像素化圖片',
    steps: ['<strong>上傳圖片</strong> — 點擊「選擇圖片」或拖放JPG、PNG或WebP檔案。','<strong>選擇模式</strong> — 選擇「整張圖片」來像素化所有內容，或選擇「選擇區域」在要像素化的臉部或區域上繪製方框。','<strong>調整滑桿</strong> — 將像素化級別滑桿從低（輕微馬賽克）移動到高（大塊馬賽克）。調整時預覽會即時更新。','<strong>下載</strong> — 將像素化後的圖片儲存到您的裝置。'],
    h2b: '線上像素化圖片和臉部的最佳免費工具',
    body: '<p>需要在照片中隱藏臉部、車牌或敏感資訊嗎？RelahConvert的圖片像素化工具讓您可以對整張圖片或特定區域套用馬賽克效果 — 全部在瀏覽器中完成。無需上傳，無需伺服器，完全免費且保護隱私。</p><p>使用可調節的滑桿控制像素化強度，從輕微馬賽克到大塊馬賽克。繪製選擇框僅對臉部或區域進行像素化，同時保持圖片其餘部分清晰。非常適合隱私保護、模糊敏感資料、社群媒體貼文以及分享前的照片匿名化處理。</p>',
    h3why: '為什麼要像素化圖片？',
    why: '像素化是隱藏圖片中敏感內容最常見的方式。與模糊不同，像素化無法逆轉 — 原始細節會被純色塊永久替換。這使其成為保護隱私、隱藏臉部、車牌、地址和機密資訊的理想選擇。',
    faqs: [
      { q: '什麼是圖片像素化？', a: '圖片像素化是將圖片的區域替換為大的純色塊，產生隱藏原始細節的馬賽克效果。與模糊不同，像素化是不可逆的 — 原始像素被永久替換，使其成為隱藏敏感內容的安全方式。' },
      { q: '我可以只像素化臉部或特定區域嗎？', a: '可以 — 切換到「選擇區域」模式，在要像素化的臉部或區域上繪製一個矩形。圖片的其餘部分保持清晰且不受影響。您可以使用滑桿調整像素化級別。' },
      { q: '如何控制像素化強度？', a: '使用滑桿調整塊大小，從低（小塊，輕微效果）到高（大塊，強烈像素化）。移動滑桿時預覽會即時更新。' },
      { q: '像素化可以逆轉嗎？', a: '不能 — 一旦下載像素化後的圖片，像素化區域中的原始細節就永久消失了。這就是為什麼像素化比模糊更安全地隱藏敏感資訊的原因。' },
      { q: '支援哪些格式？', a: '您可以上傳JPG、PNG和WebP圖片。輸出格式與輸入格式一致 — JPG保持JPG，PNG保持PNG。' },
    ],
    links: [{ href: '/blur-face', label: '模糊臉部' },{ href: '/crop', label: '裁切' },{ href: '/compress', label: '壓縮' },{ href: '/resize', label: '調整大小' }],
  },
  pl: {
    h2a: 'Jak pikselować obraz online',
    steps: ['<strong>Prześlij swój obraz</strong> — kliknij „Wybierz obraz" lub przeciągnij i upuść plik JPG, PNG lub WebP.','<strong>Wybierz tryb</strong> — wybierz „Cały obraz", aby pikselować wszystko, lub „Zaznacz obszar", aby narysować ramkę wokół twarzy lub regionu, który chcesz pikselować.','<strong>Dostosuj suwak</strong> — przesuń suwak poziomu pikselacji od niskiego (subtelna mozaika) do wysokiego (duże bloki). Podgląd aktualizuje się na żywo w miarę regulacji.','<strong>Pobierz</strong> — zapisz spikselowany obraz na swoim urządzeniu.'],
    h2b: 'Najlepsze darmowe narzędzie do pikselowania obrazów i twarzy online',
    body: '<p>Musisz ukryć twarz, tablicę rejestracyjną lub poufne informacje na zdjęciu? Narzędzie Pikselacja od RelahConvert pozwala zastosować efekt mozaiki do całego obrazu lub tylko do wybranego obszaru — wszystko w przeglądarce. Bez przesyłania, bez serwera, całkowicie za darmo i prywatnie.</p><p>Użyj regulowanego suwaka, aby kontrolować intensywność pikselacji od subtelnej mozaiki do dużych bloków. Narysuj ramkę zaznaczenia, aby pikselować tylko twarz lub region, zachowując resztę obrazu ostrą. Idealne do ochrony prywatności, ukrywania wrażliwych danych, postów w mediach społecznościowych i anonimizacji zdjęć przed udostępnieniem.</p>',
    h3why: 'Dlaczego warto pikselować obrazy?',
    why: 'Pikselacja to najbardziej rozpoznawalny sposób ukrywania wrażliwych treści w obrazach. W przeciwieństwie do rozmycia, pikselacja jest nieodwracalna — oryginalne szczegóły zostają trwale zastąpione jednolitymi blokami kolorów. To czyni ją idealną do ochrony prywatności, ukrywania twarzy, tablic rejestracyjnych, adresów i poufnych informacji.',
    faqs: [
      { q: 'Czym jest pikselacja obrazu?', a: 'Pikselacja obrazu polega na zastępowaniu obszarów obrazu dużymi jednokolorowymi blokami, tworząc efekt mozaiki ukrywający oryginalne szczegóły. W przeciwieństwie do rozmycia, pikselacja jest nieodwracalna — oryginalne piksele są trwale zastępowane, co czyni ją bezpiecznym sposobem ukrywania wrażliwych treści.' },
      { q: 'Czy mogę pikselować tylko twarz lub określony obszar?', a: 'Tak — przełącz się na tryb „Zaznacz obszar" i narysuj prostokąt wokół twarzy lub regionu, który chcesz pikselować. Reszta obrazu pozostaje ostra i nienaruszona. Możesz dostosować poziom pikselacji za pomocą suwaka.' },
      { q: 'Jak kontrolować intensywność pikselacji?', a: 'Użyj suwaka, aby dostosować rozmiar bloków od niskiego (małe bloki, subtelny efekt) do wysokiego (duże bloki, silna pikselacja). Podgląd aktualizuje się w czasie rzeczywistym podczas przesuwania suwaka.' },
      { q: 'Czy pikselacja jest odwracalna?', a: 'Nie — po pobraniu spikselowanego obrazu oryginalne szczegóły w pikselowanych obszarach są trwale utracone. To właśnie sprawia, że pikselacja jest bezpieczniejsza niż rozmycie do ukrywania wrażliwych informacji.' },
      { q: 'Jakie formaty są obsługiwane?', a: 'Możesz przesłać obrazy JPG, PNG i WebP. Format wyjściowy odpowiada formatowi wejściowemu — JPG pozostaje JPG, PNG pozostaje PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Rozmyj twarz' },{ href: '/crop', label: 'Przytnij' },{ href: '/compress', label: 'Kompresuj' },{ href: '/resize', label: 'Zmień rozmiar' }],
  },
  sv: {
    h2a: 'Hur man pixelerar en bild online',
    steps: ['<strong>Ladda upp din bild</strong> — klicka på "Välj bild" eller dra och släpp en JPG-, PNG- eller WebP-fil.','<strong>Välj ett läge</strong> — välj "Hela bilden" för att pixelera allt, eller "Välj område" för att rita en ruta över ett ansikte eller en region du vill pixelera.','<strong>Justera reglaget</strong> — flytta reglaget för pixeleringsnivå från låg (subtil mosaik) till hög (stora block). Förhandsgranskningen uppdateras live medan du justerar.','<strong>Ladda ner</strong> — spara den pixelerade bilden till din enhet.'],
    h2b: 'Bästa gratisverktyget för att pixelera bilder och ansikten online',
    body: '<p>Behöver du dölja ett ansikte, en registreringsskylt eller känslig information i ett foto? RelahConverts pixeleringsverktyg låter dig applicera en mosaikeffekt på hela bilden eller bara ett specifikt område — allt i din webbläsare. Ingen uppladdning, ingen server, helt gratis och privat.</p><p>Använd det justerbara reglaget för att styra pixeleringsintensiteten från en subtil mosaik till stora block. Rita en markeringsruta för att pixelera bara ett ansikte eller en region medan resten av bilden förblir skarp. Perfekt för integritetsskydd, dölja känsliga uppgifter, inlägg på sociala medier och anonymisering av foton innan delning.</p>',
    h3why: 'Varför pixelera bilder?',
    why: 'Pixelering är det mest igenkännbara sättet att dölja känsligt innehåll i bilder. Till skillnad från oskärpa är pixelering oåterkallelig — originaldetaljen ersätts permanent med enfärgade block. Detta gör det idealiskt för att skydda integriteten, dölja ansikten, registreringsskyltar, adresser och konfidentiell information.',
    faqs: [
      { q: 'Vad är bildpixelering?', a: 'Bildpixelering ersätter områden i en bild med stora enfärgade block, vilket skapar en mosaikeffekt som döljer originaldetaljen. Till skillnad från oskärpa är pixelering oåterkallelig — de ursprungliga pixlarna ersätts permanent, vilket gör det till ett säkert sätt att dölja känsligt innehåll.' },
      { q: 'Kan jag pixelera bara ett ansikte eller ett specifikt område?', a: 'Ja — byt till läget "Välj område" och rita en rektangel över ansiktet eller regionen du vill pixelera. Resten av bilden förblir skarp och opåverkad. Du kan justera pixeleringsnivån med reglaget.' },
      { q: 'Hur kontrollerar jag pixeleringsintensiteten?', a: 'Använd reglaget för att justera blockstorleken från låg (små block, subtil effekt) till hög (stora block, kraftig pixelering). Förhandsgranskningen uppdateras i realtid när du flyttar reglaget.' },
      { q: 'Är pixelering reversibel?', a: 'Nej — när du har laddat ner den pixelerade bilden är originaldetaljen i de pixelerade områdena permanent borta. Det är detta som gör pixelering säkrare än oskärpa för att dölja känslig information.' },
      { q: 'Vilka format stöds?', a: 'Du kan ladda upp JPG-, PNG- och WebP-bilder. Utdataformatet matchar ditt indata — JPG förblir JPG, PNG förblir PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Oskärpa ansikte' },{ href: '/crop', label: 'Beskär' },{ href: '/compress', label: 'Komprimera' },{ href: '/resize', label: 'Ändra storlek' }],
  },
  th: {
    h2a: 'วิธีทำให้ภาพเป็นพิกเซลออนไลน์',
    steps: ['<strong>อัปโหลดภาพของคุณ</strong> — คลิก "เลือกภาพ" หรือลากและวางไฟล์ JPG, PNG หรือ WebP','<strong>เลือกโหมด</strong> — เลือก "ทั้งภาพ" เพื่อทำพิกเซลทั้งหมด หรือ "เลือกพื้นที่" เพื่อวาดกรอบรอบใบหน้าหรือบริเวณที่คุณต้องการทำพิกเซล','<strong>ปรับแถบเลื่อน</strong> — เลื่อนแถบระดับพิกเซลจากต่ำ (โมเสกบาง ๆ) ไปสูง (บล็อกใหญ่) ตัวอย่างจะอัปเดตแบบสดขณะที่คุณปรับ','<strong>ดาวน์โหลด</strong> — บันทึกภาพที่ทำพิกเซลแล้วลงอุปกรณ์ของคุณ'],
    h2b: 'เครื่องมือฟรีที่ดีที่สุดสำหรับทำพิกเซลภาพและใบหน้าออนไลน์',
    body: '<p>ต้องการซ่อนใบหน้า ป้ายทะเบียน หรือข้อมูลที่ละเอียดอ่อนในภาพถ่าย? เครื่องมือทำพิกเซลของ RelahConvert ช่วยให้คุณใส่เอฟเฟกต์โมเสกบนภาพทั้งหมดหรือเฉพาะพื้นที่ที่เลือก — ทั้งหมดในเบราว์เซอร์ของคุณ ไม่ต้องอัปโหลด ไม่มีเซิร์ฟเวอร์ ฟรีและเป็นส่วนตัวอย่างสมบูรณ์</p><p>ใช้แถบเลื่อนที่ปรับได้เพื่อควบคุมความเข้มของพิกเซลตั้งแต่โมเสกบาง ๆ ไปจนถึงบล็อกใหญ่ วาดกรอบเลือกเพื่อทำพิกเซลเฉพาะใบหน้าหรือบริเวณที่ต้องการในขณะที่ภาพส่วนที่เหลือยังคมชัด เหมาะสำหรับการปกป้องความเป็นส่วนตัว ซ่อนข้อมูลที่ละเอียดอ่อน โพสต์บนโซเชียลมีเดีย และทำให้ภาพถ่ายไม่ระบุตัวตนก่อนแชร์</p>',
    h3why: 'ทำไมต้องทำพิกเซลภาพ?',
    why: 'การทำพิกเซลเป็นวิธีที่เป็นที่รู้จักมากที่สุดในการซ่อนเนื้อหาที่ละเอียดอ่อนในภาพ ต่างจากการเบลอ การทำพิกเซลไม่สามารถย้อนกลับได้ — รายละเอียดเดิมถูกแทนที่อย่างถาวรด้วยบล็อกสีทึบ เหมาะอย่างยิ่งสำหรับการปกป้องความเป็นส่วนตัว ซ่อนใบหน้า ป้ายทะเบียน ที่อยู่ และข้อมูลที่เป็นความลับ',
    faqs: [
      { q: 'การทำพิกเซลภาพคืออะไร?', a: 'การทำพิกเซลภาพจะแทนที่พื้นที่ของภาพด้วยบล็อกสีทึบขนาดใหญ่ สร้างเอฟเฟกต์โมเสกที่ซ่อนรายละเอียดเดิม ต่างจากการเบลอ การทำพิกเซลไม่สามารถย้อนกลับได้ — พิกเซลเดิมถูกแทนที่อย่างถาวร ทำให้เป็นวิธีที่ปลอดภัยในการซ่อนเนื้อหาที่ละเอียดอ่อน' },
      { q: 'ฉันสามารถทำพิกเซลเฉพาะใบหน้าหรือพื้นที่เฉพาะได้ไหม?', a: 'ได้ — สลับไปที่โหมด "เลือกพื้นที่" แล้ววาดสี่เหลี่ยมผืนผ้ารอบใบหน้าหรือบริเวณที่คุณต้องการทำพิกเซล ภาพส่วนที่เหลือจะยังคมชัดและไม่ได้รับผลกระทบ คุณสามารถปรับระดับพิกเซลด้วยแถบเลื่อน' },
      { q: 'ฉันจะควบคุมความเข้มของพิกเซลได้อย่างไร?', a: 'ใช้แถบเลื่อนเพื่อปรับขนาดบล็อกจากต่ำ (บล็อกเล็ก เอฟเฟกต์บาง ๆ) ไปสูง (บล็อกใหญ่ พิกเซลหนัก) ตัวอย่างจะอัปเดตแบบเรียลไทม์ขณะที่คุณเลื่อนแถบ' },
      { q: 'การทำพิกเซลย้อนกลับได้ไหม?', a: 'ไม่ได้ — เมื่อคุณดาวน์โหลดภาพที่ทำพิกเซลแล้ว รายละเอียดเดิมในพื้นที่ที่ทำพิกเซลจะหายไปอย่างถาวร นี่คือสิ่งที่ทำให้การทำพิกเซลปลอดภัยกว่าการเบลอสำหรับการซ่อนข้อมูลที่ละเอียดอ่อน' },
      { q: 'รองรับรูปแบบไฟล์ใดบ้าง?', a: 'คุณสามารถอัปโหลดภาพ JPG, PNG และ WebP รูปแบบไฟล์ขาออกจะตรงกับไฟล์ขาเข้า — JPG ยังคงเป็น JPG, PNG ยังคงเป็น PNG' },
    ],
    links: [{ href: '/blur-face', label: 'เบลอใบหน้า' },{ href: '/crop', label: 'ครอป' },{ href: '/compress', label: 'บีบอัด' },{ href: '/resize', label: 'ปรับขนาด' }],
  },
  tr: {
    h2a: 'Bir Görüntüyü Çevrimiçi Nasıl Pikselleştirilir',
    steps: ['<strong>Görüntünüzü yükleyin</strong> — "Görüntü Seç"e tıklayın veya bir JPG, PNG ya da WebP dosyasını sürükleyip bırakın.','<strong>Bir mod seçin</strong> — her şeyi pikselleştirmek için "Tüm Görüntü"yü veya bir yüz ya da bölge üzerine kutu çizmek için "Alan Seç"i seçin.','<strong>Kaydırıcıyı ayarlayın</strong> — pikselleştirme seviyesi kaydırıcısını düşükten (hafif mozaik) yükseğe (büyük bloklar) hareket ettirin. Önizleme, siz ayarladıkça canlı olarak güncellenir.','<strong>İndirin</strong> — pikselleştirilmiş görüntüyü cihazınıza kaydedin.'],
    h2b: 'Görüntüleri ve Yüzleri Çevrimiçi Pikselleştirmek İçin En İyi Ücretsiz Araç',
    body: '<p>Bir fotoğrafta yüzü, plakayı veya hassas bilgileri gizlemeniz mi gerekiyor? RelahConvert\'ın Pikselleştirme aracı, tüm görüntüye veya yalnızca belirli bir alana mozaik efekti uygulamanıza olanak tanır — tamamı tarayıcınızda. Yükleme yok, sunucu yok, tamamen ücretsiz ve gizli.</p><p>Ayarlanabilir kaydırıcıyı kullanarak pikselleştirme yoğunluğunu hafif mozaikten büyük bloklara kadar kontrol edin. Görüntünün geri kalanını keskin tutarken yalnızca bir yüzü veya bölgeyi pikselleştirmek için seçim kutusu çizin. Gizlilik koruması, hassas verileri gizleme, sosyal medya paylaşımları ve paylaşmadan önce fotoğrafları anonimleştirme için mükemmel.</p>',
    h3why: 'Neden Görüntüleri Pikselleştirmeliyiz?',
    why: 'Pikselleştirme, görüntülerdeki hassas içeriği gizlemenin en tanınmış yoludur. Bulanıklaştırmanın aksine, pikselleştirme geri alınamaz — orijinal detay kalıcı olarak düz renkli bloklarla değiştirilir. Bu, gizliliği korumak, yüzleri, plakaları, adresleri ve gizli bilgileri gizlemek için ideal kılar.',
    faqs: [
      { q: 'Görüntü pikselleştirme nedir?', a: 'Görüntü pikselleştirme, bir görüntünün alanlarını büyük düz renkli bloklarla değiştirerek orijinal detayı gizleyen bir mozaik efekti oluşturur. Bulanıklaştırmanın aksine, pikselleştirme geri alınamaz — orijinal pikseller kalıcı olarak değiştirilir, bu da hassas içeriği gizlemenin güvenli bir yolunu sağlar.' },
      { q: 'Sadece bir yüzü veya belirli bir alanı pikselleştirebilir miyim?', a: 'Evet — "Alan Seç" moduna geçin ve pikselleştirmek istediğiniz yüz veya bölge üzerine bir dikdörtgen çizin. Görüntünün geri kalanı keskin ve etkilenmemiş kalır. Pikselleştirme seviyesini kaydırıcıyla ayarlayabilirsiniz.' },
      { q: 'Pikselleştirme yoğunluğunu nasıl kontrol ederim?', a: 'Blok boyutunu düşükten (küçük bloklar, hafif efekt) yükseğe (büyük bloklar, yoğun pikselleştirme) ayarlamak için kaydırıcıyı kullanın. Önizleme, kaydırıcıyı hareket ettirdikçe gerçek zamanlı olarak güncellenir.' },
      { q: 'Pikselleştirme geri alınabilir mi?', a: 'Hayır — pikselleştirilmiş görüntüyü indirdikten sonra, pikselleştirilmiş alanlardaki orijinal detay kalıcı olarak kaybolur. Pikselleştirmeyi hassas bilgileri gizlemek için bulanıklaştırmadan daha güvenli kılan da budur.' },
      { q: 'Hangi formatlar destekleniyor?', a: 'JPG, PNG ve WebP görüntüleri yükleyebilirsiniz. Çıktı formatı girdilerinizle eşleşir — JPG olarak kalır JPG, PNG olarak kalır PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Yüz Bulanıklaştır' },{ href: '/crop', label: 'Kırp' },{ href: '/compress', label: 'Sıkıştır' },{ href: '/resize', label: 'Yeniden Boyutlandır' }],
  },
  uk: {
    h2a: 'Як піксельувати зображення онлайн',
    steps: ['<strong>Завантажте своє зображення</strong> — натисніть «Вибрати зображення» або перетягніть файл JPG, PNG чи WebP.','<strong>Виберіть режим</strong> — оберіть «Все зображення», щоб піксельувати все, або «Вибрати область», щоб намалювати рамку навколо обличчя чи ділянки, яку потрібно піксельувати.','<strong>Налаштуйте повзунок</strong> — перемістіть повзунок рівня піксельування від низького (легка мозаїка) до високого (великі блоки). Попередній перегляд оновлюється в реальному часі.','<strong>Завантажте</strong> — збережіть піксельоване зображення на свій пристрій.'],
    h2b: 'Найкращий безкоштовний інструмент для піксельування зображень та облич онлайн',
    body: '<p>Потрібно приховати обличчя, номерний знак або конфіденційну інформацію на фотографії? Інструмент піксельування від RelahConvert дозволяє застосувати ефект мозаїки до всього зображення або лише до певної області — все у вашому браузері. Без завантаження, без сервера, повністю безкоштовно та приватно.</p><p>Використовуйте регульований повзунок для керування інтенсивністю піксельування від легкої мозаїки до великих блоків. Намалюйте рамку виділення, щоб піксельувати лише обличчя або ділянку, зберігаючи решту зображення чіткою. Ідеально підходить для захисту конфіденційності, приховування чутливих даних, публікацій у соціальних мережах та анонімізації фотографій перед поширенням.</p>',
    h3why: 'Навіщо піксельувати зображення?',
    why: 'Піксельування — це найбільш впізнаваний спосіб приховати конфіденційний вміст у зображеннях. На відміну від розмиття, піксельування є незворотним — оригінальні деталі назавжди замінюються суцільними кольоровими блоками. Це робить його ідеальним для захисту приватності, приховування облич, номерних знаків, адрес та конфіденційної інформації.',
    faqs: [
      { q: 'Що таке піксельування зображення?', a: 'Піксельування зображення замінює ділянки зображення великими одноколірними блоками, створюючи ефект мозаїки, який приховує оригінальні деталі. На відміну від розмиття, піксельування є незворотним — оригінальні пікселі назавжди замінюються, що робить його безпечним способом приховування конфіденційного вмісту.' },
      { q: 'Чи можу я піксельувати лише обличчя або певну область?', a: 'Так — переключіться на режим «Вибрати область» і намалюйте прямокутник навколо обличчя або ділянки, яку потрібно піксельувати. Решта зображення залишається чіткою та незміненою. Ви можете налаштувати рівень піксельування за допомогою повзунка.' },
      { q: 'Як контролювати інтенсивність піксельування?', a: 'Використовуйте повзунок для налаштування розміру блоків від низького (малі блоки, легкий ефект) до високого (великі блоки, сильне піксельування). Попередній перегляд оновлюється в реальному часі під час переміщення повзунка.' },
      { q: 'Чи є піксельування зворотним?', a: 'Ні — після завантаження піксельованого зображення оригінальні деталі в піксельованих областях назавжди втрачені. Саме це робить піксельування безпечнішим за розмиття для приховування конфіденційної інформації.' },
      { q: 'Які формати підтримуються?', a: 'Ви можете завантажити зображення JPG, PNG та WebP. Формат виведення відповідає вхідному — JPG залишається JPG, PNG залишається PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Розмити обличчя' },{ href: '/crop', label: 'Обрізати' },{ href: '/compress', label: 'Стиснути' },{ href: '/resize', label: 'Змінити розмір' }],
  },
  vi: {
    h2a: 'Cách tạo hiệu ứng pixel cho ảnh trực tuyến',
    steps: ['<strong>Tải ảnh lên</strong> — nhấp vào "Chọn ảnh" hoặc kéo và thả tệp JPG, PNG hoặc WebP.','<strong>Chọn chế độ</strong> — chọn "Toàn bộ ảnh" để tạo pixel cho toàn bộ, hoặc "Chọn vùng" để vẽ khung quanh khuôn mặt hoặc vùng bạn muốn tạo pixel.','<strong>Điều chỉnh thanh trượt</strong> — di chuyển thanh trượt mức pixel từ thấp (khảm nhẹ) đến cao (khối lớn). Bản xem trước cập nhật trực tiếp khi bạn điều chỉnh.','<strong>Tải xuống</strong> — lưu ảnh đã tạo pixel về thiết bị của bạn.'],
    h2b: 'Công cụ miễn phí tốt nhất để tạo pixel cho ảnh và khuôn mặt trực tuyến',
    body: '<p>Cần ẩn khuôn mặt, biển số xe hoặc thông tin nhạy cảm trong ảnh? Công cụ Tạo pixel của RelahConvert cho phép bạn áp dụng hiệu ứng khảm lên toàn bộ ảnh hoặc chỉ một vùng cụ thể — tất cả trong trình duyệt của bạn. Không cần tải lên, không có máy chủ, hoàn toàn miễn phí và riêng tư.</p><p>Sử dụng thanh trượt có thể điều chỉnh để kiểm soát cường độ pixel từ khảm nhẹ đến các khối lớn. Vẽ khung chọn để chỉ tạo pixel cho khuôn mặt hoặc vùng cần thiết trong khi giữ phần còn lại của ảnh sắc nét. Hoàn hảo để bảo vệ quyền riêng tư, ẩn dữ liệu nhạy cảm, đăng bài trên mạng xã hội và ẩn danh ảnh trước khi chia sẻ.</p>',
    h3why: 'Tại sao nên tạo pixel cho ảnh?',
    why: 'Tạo pixel là cách dễ nhận biết nhất để ẩn nội dung nhạy cảm trong ảnh. Khác với làm mờ, tạo pixel không thể đảo ngược — chi tiết gốc được thay thế vĩnh viễn bằng các khối màu đặc. Điều này làm cho nó lý tưởng để bảo vệ quyền riêng tư, ẩn khuôn mặt, biển số xe, địa chỉ và thông tin bí mật.',
    faqs: [
      { q: 'Tạo pixel ảnh là gì?', a: 'Tạo pixel ảnh thay thế các vùng của ảnh bằng các khối màu đặc lớn, tạo ra hiệu ứng khảm che giấu chi tiết gốc. Khác với làm mờ, tạo pixel không thể đảo ngược — các pixel gốc được thay thế vĩnh viễn, biến nó thành cách an toàn để ẩn nội dung nhạy cảm.' },
      { q: 'Tôi có thể tạo pixel chỉ cho khuôn mặt hoặc vùng cụ thể không?', a: 'Có — chuyển sang chế độ "Chọn vùng" và vẽ hình chữ nhật quanh khuôn mặt hoặc vùng bạn muốn tạo pixel. Phần còn lại của ảnh vẫn sắc nét và không bị ảnh hưởng. Bạn có thể điều chỉnh mức pixel bằng thanh trượt.' },
      { q: 'Làm thế nào để kiểm soát cường độ pixel?', a: 'Sử dụng thanh trượt để điều chỉnh kích thước khối từ thấp (khối nhỏ, hiệu ứng nhẹ) đến cao (khối lớn, pixel đậm). Bản xem trước cập nhật theo thời gian thực khi bạn di chuyển thanh trượt.' },
      { q: 'Tạo pixel có thể đảo ngược không?', a: 'Không — khi bạn tải xuống ảnh đã tạo pixel, chi tiết gốc trong các vùng đã tạo pixel sẽ mất vĩnh viễn. Đây là điều làm cho tạo pixel an toàn hơn làm mờ khi cần ẩn thông tin nhạy cảm.' },
      { q: 'Những định dạng nào được hỗ trợ?', a: 'Bạn có thể tải lên ảnh JPG, PNG và WebP. Định dạng đầu ra khớp với đầu vào của bạn — JPG vẫn là JPG, PNG vẫn là PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Làm mờ khuôn mặt' },{ href: '/crop', label: 'Cắt ảnh' },{ href: '/compress', label: 'Nén ảnh' },{ href: '/resize', label: 'Thay đổi kích thước' }],
  },
  bg: {
    h2a: 'Как да пикселизирате изображение онлайн',
    steps: ['<strong>Качете вашето изображение</strong> — кликнете върху «Избор на изображение» или плъзнете и пуснете JPG, PNG или WebP файл.','<strong>Изберете режим</strong> — изберете «Цяло изображение», за да пикселизирате всичко, или «Избор на зона», за да начертаете рамка върху лице или област, която искате да пикселизирате.','<strong>Настройте плъзгача</strong> — преместете плъзгача за ниво на пикселизация от ниско (фина мозайка) до високо (големи блокове). Визуализацията се обновява в реално време, докато регулирате.','<strong>Изтеглете</strong> — запазете пикселизираното изображение на вашето устройство.'],
    h2b: 'Най-добрият безплатен инструмент за пикселизиране на изображения и лица онлайн',
    body: '<p>Трябва да скриете лице, регистрационен номер или чувствителна информация в снимка? Инструментът за пикселизация на RelahConvert ви позволява да приложите мозаечен ефект върху цялото изображение или само върху определена зона — изцяло в браузъра ви. Без качване, без сървър, напълно безплатно и поверително.</p><p>Използвайте регулируемия плъзгач, за да контролирате интензивността на пикселизацията от фина мозайка до големи блокове. Начертайте рамка за избор, за да пикселизирате само лице или област, като останалата част от изображението остава ясна. Идеално за защита на поверителността, скриване на чувствителни данни, публикации в социалните мрежи и анонимизиране на снимки преди споделяне.</p>',
    h3why: 'Защо да пикселизирате изображения?',
    why: 'Пикселизацията е най-разпознаваемият начин за скриване на чувствително съдържание в изображения. За разлика от размазването, пикселизацията е необратима — оригиналният детайл се заменя завинаги с блокове от плътен цвят. Това я прави идеална за защита на поверителността, скриване на лица, регистрационни номера, адреси и поверителна информация.',
    faqs: [
      { q: 'Какво е пикселизация на изображение?', a: 'Пикселизацията на изображение заменя области от изображението с големи блокове от плътен цвят, създавайки мозаечен ефект, който скрива оригиналния детайл. За разлика от размазването, пикселизацията е необратима — оригиналните пиксели се заменят завинаги, което я прави сигурен начин за скриване на чувствително съдържание.' },
      { q: 'Мога ли да пикселизирам само лице или определена зона?', a: 'Да — превключете в режим «Избор на зона» и начертайте правоъгълник върху лицето или областта, която искате да пикселизирате. Останалата част от изображението остава ясна и незасегната. Можете да регулирате нивото на пикселизация с плъзгача.' },
      { q: 'Как да контролирам интензивността на пикселизацията?', a: 'Използвайте плъзгача, за да регулирате размера на блоковете от ниско (малки блокове, фин ефект) до високо (големи блокове, силна пикселизация). Визуализацията се обновява в реално време, докато местите плъзгача.' },
      { q: 'Обратима ли е пикселизацията?', a: 'Не — след като изтеглите пикселизираното изображение, оригиналният детайл в пикселизираните зони е загубен завинаги. Именно това прави пикселизацията по-сигурна от размазването за скриване на чувствителна информация.' },
      { q: 'Кои формати се поддържат?', a: 'Можете да качите JPG, PNG и WebP изображения. Изходният формат съвпада с входния — JPG остава JPG, PNG остава PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Размазване на лице' },{ href: '/crop', label: 'Изрязване' },{ href: '/compress', label: 'Компресиране' },{ href: '/resize', label: 'Преоразмеряване' }],
  },
  ca: {
    h2a: 'Com pixelar una imatge en línia',
    steps: ['<strong>Pugeu la vostra imatge</strong> — feu clic a «Seleccionar imatge» o arrossegueu i deixeu anar un fitxer JPG, PNG o WebP.','<strong>Trieu un mode</strong> — seleccioneu «Imatge sencera» per pixelar-ho tot, o «Seleccionar àrea» per dibuixar un quadre sobre una cara o una zona que vulgueu pixelar.','<strong>Ajusteu el control lliscant</strong> — moveu el control del nivell de pixelació de baix (mosaic subtil) a alt (blocs grans). La previsualització s\'actualitza en temps real mentre ajusteu.','<strong>Descarregueu</strong> — deseu la imatge pixelada al vostre dispositiu.'],
    h2b: 'La millor eina gratuïta per pixelar imatges i cares en línia',
    body: '<p>Necessiteu amagar una cara, una matrícula o informació sensible en una foto? L\'eina de pixelació de RelahConvert us permet aplicar un efecte mosaic a tota la imatge o només a una àrea específica — tot dins del vostre navegador. Sense pujada, sense servidor, completament gratuït i privat.</p><p>Utilitzeu el control lliscant ajustable per controlar la intensitat de la pixelació des d\'un mosaic subtil fins a blocs grans. Dibuixeu un quadre de selecció per pixelar només una cara o una zona mentre manteniu la resta de la imatge nítida. Perfecte per a la protecció de la privadesa, amagar dades sensibles, publicacions a xarxes socials i anonimitzar fotos abans de compartir.</p>',
    h3why: 'Per què pixelar imatges?',
    why: 'La pixelació és la manera més reconeixible d\'amagar contingut sensible en imatges. A diferència del desenfocament, la pixelació és irreversible — el detall original se substitueix permanentment per blocs de color sòlid. Això la fa ideal per protegir la privadesa, amagar cares, matrícules, adreces i informació confidencial.',
    faqs: [
      { q: 'Què és la pixelació d\'imatges?', a: 'La pixelació d\'imatges substitueix àrees d\'una imatge amb grans blocs de color sòlid, creant un efecte mosaic que amaga el detall original. A diferència del desenfocament, la pixelació és irreversible — els píxels originals se substitueixen permanentment, cosa que la converteix en una manera segura d\'amagar contingut sensible.' },
      { q: 'Puc pixelar només una cara o una àrea específica?', a: 'Sí — canvieu al mode «Seleccionar àrea» i dibuixeu un rectangle sobre la cara o la zona que vulgueu pixelar. La resta de la imatge es manté nítida i sense afectar. Podeu ajustar el nivell de pixelació amb el control lliscant.' },
      { q: 'Com controlo la intensitat de la pixelació?', a: 'Utilitzeu el control lliscant per ajustar la mida dels blocs de baix (blocs petits, efecte subtil) a alt (blocs grans, pixelació forta). La previsualització s\'actualitza en temps real quan moveu el control lliscant.' },
      { q: 'La pixelació és reversible?', a: 'No — un cop descarregueu la imatge pixelada, el detall original a les zones pixelades s\'ha perdut permanentment. Això és el que fa que la pixelació sigui més segura que el desenfocament per amagar informació sensible.' },
      { q: 'Quins formats són compatibles?', a: 'Podeu pujar imatges JPG, PNG i WebP. El format de sortida coincideix amb l\'entrada — JPG continua sent JPG, PNG continua sent PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Desenfocar cara' },{ href: '/crop', label: 'Retallar' },{ href: '/compress', label: 'Comprimir' },{ href: '/resize', label: 'Redimensionar' }],
  },
  nl: {
    h2a: 'Hoe een afbeelding online te pixeleren',
    steps: ['<strong>Upload uw afbeelding</strong> — klik op «Afbeelding selecteren» of sleep een JPG-, PNG- of WebP-bestand.','<strong>Kies een modus</strong> — selecteer «Volledige afbeelding» om alles te pixeleren, of «Gebied selecteren» om een kader te tekenen over een gezicht of gebied dat u wilt pixeleren.','<strong>Pas de schuifregelaar aan</strong> — verplaats de schuifregelaar voor het pixelatieniveau van laag (subtiel mozaïek) naar hoog (grote blokken). Het voorbeeld wordt in realtime bijgewerkt terwijl u aanpast.','<strong>Downloaden</strong> — sla de gepixelde afbeelding op naar uw apparaat.'],
    h2b: 'Beste gratis tool om afbeeldingen en gezichten online te pixeleren',
    body: '<p>Moet u een gezicht, kenteken of gevoelige informatie in een foto verbergen? De Pixeleren-tool van RelahConvert laat u een mozaïekeffect toepassen op de hele afbeelding of alleen op een specifiek gebied — volledig in uw browser. Geen upload, geen server, volledig gratis en privé.</p><p>Gebruik de aanpasbare schuifregelaar om de pixelatie-intensiteit te regelen van een subtiel mozaïek tot grote blokken. Teken een selectiekader om alleen een gezicht of gebied te pixeleren terwijl de rest van de afbeelding scherp blijft. Perfect voor privacybescherming, het verbergen van gevoelige gegevens, berichten op sociale media en het anonimiseren van foto\'s voor het delen.</p>',
    h3why: 'Waarom afbeeldingen pixeleren?',
    why: 'Pixelatie is de meest herkenbare manier om gevoelige inhoud in afbeeldingen te verbergen. In tegenstelling tot vervaging is pixelatie onomkeerbaar — het originele detail wordt permanent vervangen door blokken van effen kleur. Dit maakt het ideaal voor het beschermen van privacy, het verbergen van gezichten, kentekens, adressen en vertrouwelijke informatie.',
    faqs: [
      { q: 'Wat is beeldpixelatie?', a: 'Beeldpixelatie vervangt gebieden van een afbeelding door grote blokken van effen kleur, waardoor een mozaïekeffect ontstaat dat het originele detail verbergt. In tegenstelling tot vervaging is pixelatie onomkeerbaar — de originele pixels worden permanent vervangen, wat het een veilige manier maakt om gevoelige inhoud te verbergen.' },
      { q: 'Kan ik alleen een gezicht of specifiek gebied pixeleren?', a: 'Ja — schakel over naar de modus «Gebied selecteren» en teken een rechthoek over het gezicht of het gebied dat u wilt pixeleren. De rest van de afbeelding blijft scherp en onaangetast. U kunt het pixelatieniveau aanpassen met de schuifregelaar.' },
      { q: 'Hoe regel ik de pixelatie-intensiteit?', a: 'Gebruik de schuifregelaar om de blokgrootte aan te passen van laag (kleine blokken, subtiel effect) tot hoog (grote blokken, sterke pixelatie). Het voorbeeld wordt in realtime bijgewerkt terwijl u de schuifregelaar verplaatst.' },
      { q: 'Is pixelatie omkeerbaar?', a: 'Nee — zodra u de gepixelde afbeelding downloadt, is het originele detail in de gepixelde gebieden permanent verdwenen. Dit is wat pixelatie veiliger maakt dan vervaging voor het verbergen van gevoelige informatie.' },
      { q: 'Welke formaten worden ondersteund?', a: 'U kunt JPG-, PNG- en WebP-afbeeldingen uploaden. Het uitvoerformaat komt overeen met uw invoer — JPG blijft JPG, PNG blijft PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Gezicht vervagen' },{ href: '/crop', label: 'Bijsnijden' },{ href: '/compress', label: 'Comprimeren' },{ href: '/resize', label: 'Formaat wijzigen' }],
  },
  el: {
    h2a: 'Πώς να πιξελοποιήσετε μια εικόνα online',
    steps: ['<strong>Ανεβάστε την εικόνα σας</strong> — κάντε κλικ στο «Επιλογή εικόνας» ή σύρετε και αφήστε ένα αρχείο JPG, PNG ή WebP.','<strong>Επιλέξτε λειτουργία</strong> — επιλέξτε «Ολόκληρη εικόνα» για να πιξελοποιήσετε τα πάντα, ή «Επιλογή περιοχής» για να σχεδιάσετε ένα πλαίσιο πάνω σε πρόσωπο ή περιοχή που θέλετε να πιξελοποιήσετε.','<strong>Ρυθμίστε το ρυθμιστικό</strong> — μετακινήστε το ρυθμιστικό επιπέδου πιξελοποίησης από χαμηλό (διακριτικό μωσαϊκό) σε υψηλό (μεγάλα τετράγωνα). Η προεπισκόπηση ενημερώνεται σε πραγματικό χρόνο καθώς ρυθμίζετε.','<strong>Λήψη</strong> — αποθηκεύστε την πιξελοποιημένη εικόνα στη συσκευή σας.'],
    h2b: 'Το καλύτερο δωρεάν εργαλείο για πιξελοποίηση εικόνων και προσώπων online',
    body: '<p>Χρειάζεται να κρύψετε ένα πρόσωπο, πινακίδα κυκλοφορίας ή ευαίσθητες πληροφορίες σε μια φωτογραφία; Το εργαλείο πιξελοποίησης του RelahConvert σας επιτρέπει να εφαρμόσετε εφέ μωσαϊκού σε ολόκληρη την εικόνα ή μόνο σε μια συγκεκριμένη περιοχή — εξ ολοκλήρου στον περιηγητή σας. Χωρίς μεταφόρτωση, χωρίς διακομιστή, εντελώς δωρεάν και ιδιωτικό.</p><p>Χρησιμοποιήστε το ρυθμιζόμενο ρυθμιστικό για να ελέγξετε την ένταση της πιξελοποίησης από διακριτικό μωσαϊκό έως μεγάλα τετράγωνα. Σχεδιάστε ένα πλαίσιο επιλογής για να πιξελοποιήσετε μόνο ένα πρόσωπο ή μια περιοχή, ενώ η υπόλοιπη εικόνα παραμένει ευκρινής. Ιδανικό για προστασία απορρήτου, απόκρυψη ευαίσθητων δεδομένων, αναρτήσεις σε κοινωνικά δίκτυα και ανωνυμοποίηση φωτογραφιών πριν τη δημοσίευση.</p>',
    h3why: 'Γιατί να πιξελοποιήσετε εικόνες;',
    why: 'Η πιξελοποίηση είναι ο πιο αναγνωρίσιμος τρόπος απόκρυψης ευαίσθητου περιεχομένου σε εικόνες. Σε αντίθεση με το θόλωμα, η πιξελοποίηση είναι μη αναστρέψιμη — η αρχική λεπτομέρεια αντικαθίσταται μόνιμα με τετράγωνα μονόχρωμου χρώματος. Αυτό την καθιστά ιδανική για την προστασία του απορρήτου, την απόκρυψη προσώπων, πινακίδων κυκλοφορίας, διευθύνσεων και εμπιστευτικών πληροφοριών.',
    faqs: [
      { q: 'Τι είναι η πιξελοποίηση εικόνας;', a: 'Η πιξελοποίηση εικόνας αντικαθιστά περιοχές μιας εικόνας με μεγάλα τετράγωνα μονόχρωμου χρώματος, δημιουργώντας ένα εφέ μωσαϊκού που κρύβει την αρχική λεπτομέρεια. Σε αντίθεση με το θόλωμα, η πιξελοποίηση είναι μη αναστρέψιμη — τα αρχικά pixel αντικαθίστανται μόνιμα, καθιστώντας την ασφαλή μέθοδο απόκρυψης ευαίσθητου περιεχομένου.' },
      { q: 'Μπορώ να πιξελοποιήσω μόνο ένα πρόσωπο ή μια συγκεκριμένη περιοχή;', a: 'Ναι — μεταβείτε στη λειτουργία «Επιλογή περιοχής» και σχεδιάστε ένα ορθογώνιο πάνω στο πρόσωπο ή την περιοχή που θέλετε να πιξελοποιήσετε. Η υπόλοιπη εικόνα παραμένει ευκρινής και ανεπηρέαστη. Μπορείτε να ρυθμίσετε το επίπεδο πιξελοποίησης με το ρυθμιστικό.' },
      { q: 'Πώς ελέγχω την ένταση της πιξελοποίησης;', a: 'Χρησιμοποιήστε το ρυθμιστικό για να ρυθμίσετε το μέγεθος των τετραγώνων από χαμηλό (μικρά τετράγωνα, διακριτικό εφέ) σε υψηλό (μεγάλα τετράγωνα, έντονη πιξελοποίηση). Η προεπισκόπηση ενημερώνεται σε πραγματικό χρόνο καθώς μετακινείτε το ρυθμιστικό.' },
      { q: 'Είναι η πιξελοποίηση αναστρέψιμη;', a: 'Όχι — μόλις κατεβάσετε την πιξελοποιημένη εικόνα, η αρχική λεπτομέρεια στις πιξελοποιημένες περιοχές έχει χαθεί μόνιμα. Αυτό είναι που κάνει την πιξελοποίηση πιο ασφαλή από το θόλωμα για την απόκρυψη ευαίσθητων πληροφοριών.' },
      { q: 'Ποιες μορφές αρχείων υποστηρίζονται;', a: 'Μπορείτε να ανεβάσετε εικόνες JPG, PNG και WebP. Η μορφή εξόδου αντιστοιχεί στην είσοδό σας — JPG παραμένει JPG, PNG παραμένει PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Θόλωμα προσώπου' },{ href: '/crop', label: 'Περικοπή' },{ href: '/compress', label: 'Συμπίεση' },{ href: '/resize', label: 'Αλλαγή μεγέθους' }],
  },
  hi: {
    h2a: 'ऑनलाइन किसी छवि को पिक्सेलेट कैसे करें',
    steps: ['<strong>अपनी छवि अपलोड करें</strong> — «छवि चुनें» पर क्लिक करें या JPG, PNG या WebP फ़ाइल को खींचकर छोड़ें।','<strong>एक मोड चुनें</strong> — सब कुछ पिक्सेलेट करने के लिए «संपूर्ण छवि» चुनें, या किसी चेहरे या क्षेत्र पर बॉक्स बनाने के लिए «क्षेत्र चुनें» चुनें जिसे आप पिक्सेलेट करना चाहते हैं।','<strong>स्लाइडर समायोजित करें</strong> — पिक्सेलेशन स्तर स्लाइडर को निम्न (सूक्ष्म मोज़ेक) से उच्च (बड़े ब्लॉक) तक ले जाएँ। जैसे ही आप समायोजित करते हैं, पूर्वावलोकन लाइव अपडेट होता है।','<strong>डाउनलोड करें</strong> — पिक्सेलेटेड छवि को अपने डिवाइस पर सहेजें।'],
    h2b: 'ऑनलाइन छवियों और चेहरों को पिक्सेलेट करने का सबसे अच्छा मुफ़्त टूल',
    body: '<p>क्या आपको किसी फ़ोटो में चेहरा, लाइसेंस प्लेट या संवेदनशील जानकारी छिपानी है? RelahConvert का पिक्सेलेट इमेज टूल आपको पूरी छवि या केवल एक विशिष्ट क्षेत्र पर मोज़ेक प्रभाव लागू करने देता है — सब कुछ आपके ब्राउज़र में। कोई अपलोड नहीं, कोई सर्वर नहीं, पूरी तरह मुफ़्त और निजी।</p><p>सूक्ष्म मोज़ेक से लेकर बड़े ब्लॉक तक पिक्सेलेशन तीव्रता को नियंत्रित करने के लिए समायोज्य स्लाइडर का उपयोग करें। केवल एक चेहरे या क्षेत्र को पिक्सेलेट करने के लिए चयन बॉक्स बनाएँ जबकि बाकी छवि स्पष्ट रहे। गोपनीयता सुरक्षा, संवेदनशील डेटा छिपाने, सोशल मीडिया पोस्ट और साझा करने से पहले फ़ोटो को गुमनाम बनाने के लिए एकदम सही।</p>',
    h3why: 'छवियों को पिक्सेलेट क्यों करें?',
    why: 'पिक्सेलेशन छवियों में संवेदनशील सामग्री छिपाने का सबसे पहचानने योग्य तरीका है। धुंधलापन के विपरीत, पिक्सेलेशन अपरिवर्तनीय है — मूल विवरण स्थायी रूप से ठोस रंग ब्लॉक से बदल दिया जाता है। यह गोपनीयता की रक्षा, चेहरे, लाइसेंस प्लेट, पते और गोपनीय जानकारी छिपाने के लिए आदर्श है।',
    faqs: [
      { q: 'इमेज पिक्सेलेशन क्या है?', a: 'इमेज पिक्सेलेशन किसी छवि के क्षेत्रों को बड़े ठोस रंग के ब्लॉक से बदल देता है, जिससे एक मोज़ेक प्रभाव बनता है जो मूल विवरण को छिपा देता है। धुंधलापन के विपरीत, पिक्सेलेशन अपरिवर्तनीय है — मूल पिक्सेल स्थायी रूप से बदल दिए जाते हैं, जो इसे संवेदनशील सामग्री छिपाने का एक सुरक्षित तरीका बनाता है।' },
      { q: 'क्या मैं केवल एक चेहरे या विशिष्ट क्षेत्र को पिक्सेलेट कर सकता हूँ?', a: 'हाँ — «क्षेत्र चुनें» मोड पर स्विच करें और उस चेहरे या क्षेत्र पर एक आयत बनाएँ जिसे आप पिक्सेलेट करना चाहते हैं। बाकी छवि स्पष्ट और अप्रभावित रहती है। आप स्लाइडर से पिक्सेलेशन स्तर समायोजित कर सकते हैं।' },
      { q: 'मैं पिक्सेलेशन तीव्रता कैसे नियंत्रित करूँ?', a: 'ब्लॉक आकार को निम्न (छोटे ब्लॉक, सूक्ष्म प्रभाव) से उच्च (बड़े ब्लॉक, मजबूत पिक्सेलेशन) तक समायोजित करने के लिए स्लाइडर का उपयोग करें। जब आप स्लाइडर को हिलाते हैं तो पूर्वावलोकन वास्तविक समय में अपडेट होता है।' },
      { q: 'क्या पिक्सेलेशन उलटा किया जा सकता है?', a: 'नहीं — एक बार जब आप पिक्सेलेटेड छवि डाउनलोड कर लेते हैं, तो पिक्सेलेटेड क्षेत्रों में मूल विवरण स्थायी रूप से खो जाता है। यही वह बात है जो संवेदनशील जानकारी छिपाने के लिए पिक्सेलेशन को धुंधलेपन से अधिक सुरक्षित बनाती है।' },
      { q: 'कौन से प्रारूप समर्थित हैं?', a: 'आप JPG, PNG और WebP छवियाँ अपलोड कर सकते हैं। आउटपुट प्रारूप आपके इनपुट से मेल खाता है — JPG, JPG रहता है, PNG, PNG रहता है।' },
    ],
    links: [{ href: '/blur-face', label: 'चेहरा धुंधला करें' },{ href: '/crop', label: 'क्रॉप करें' },{ href: '/compress', label: 'संपीड़ित करें' },{ href: '/resize', label: 'आकार बदलें' }],
  },
  id: {
    h2a: 'Cara Mempikselasi Gambar Secara Online',
    steps: ['<strong>Unggah gambar Anda</strong> — klik «Pilih Gambar» atau seret dan lepas file JPG, PNG, atau WebP.','<strong>Pilih mode</strong> — pilih «Seluruh Gambar» untuk mempikselasi semuanya, atau «Pilih Area» untuk menggambar kotak di atas wajah atau area yang ingin Anda pikselasi.','<strong>Atur penggeser</strong> — geser penggeser tingkat pikselasi dari rendah (mosaik halus) ke tinggi (blok besar). Pratinjau diperbarui secara langsung saat Anda mengatur.','<strong>Unduh</strong> — simpan gambar yang telah dipikselasi ke perangkat Anda.'],
    h2b: 'Alat Gratis Terbaik untuk Mempikselasi Gambar dan Wajah Secara Online',
    body: '<p>Perlu menyembunyikan wajah, plat nomor, atau informasi sensitif dalam foto? Alat Pikselasi Gambar dari RelahConvert memungkinkan Anda menerapkan efek mosaik ke seluruh gambar atau hanya pada area tertentu — semuanya di dalam browser Anda. Tanpa unggahan, tanpa server, sepenuhnya gratis dan pribadi.</p><p>Gunakan penggeser yang dapat disesuaikan untuk mengontrol intensitas pikselasi dari mosaik halus hingga blok besar. Gambar kotak seleksi untuk mempikselasi hanya wajah atau area tertentu sambil menjaga sisa gambar tetap tajam. Sempurna untuk perlindungan privasi, menyembunyikan data sensitif, postingan media sosial, dan menganonimkan foto sebelum dibagikan.</p>',
    h3why: 'Mengapa Mempikselasi Gambar?',
    why: 'Pikselasi adalah cara paling dikenal untuk menyembunyikan konten sensitif dalam gambar. Tidak seperti pengaburan, pikselasi tidak dapat dibalik — detail asli diganti secara permanen dengan blok warna solid. Ini menjadikannya ideal untuk melindungi privasi, menyembunyikan wajah, plat nomor, alamat, dan informasi rahasia.',
    faqs: [
      { q: 'Apa itu pikselasi gambar?', a: 'Pikselasi gambar mengganti area gambar dengan blok warna solid besar, menciptakan efek mosaik yang menyembunyikan detail asli. Tidak seperti pengaburan, pikselasi tidak dapat dibalik — piksel asli diganti secara permanen, menjadikannya cara aman untuk menyembunyikan konten sensitif.' },
      { q: 'Bisakah saya mempikselasi hanya wajah atau area tertentu?', a: 'Ya — beralih ke mode «Pilih Area» dan gambar persegi panjang di atas wajah atau area yang ingin Anda pikselasi. Sisa gambar tetap tajam dan tidak terpengaruh. Anda dapat menyesuaikan tingkat pikselasi dengan penggeser.' },
      { q: 'Bagaimana cara mengontrol intensitas pikselasi?', a: 'Gunakan penggeser untuk menyesuaikan ukuran blok dari rendah (blok kecil, efek halus) ke tinggi (blok besar, pikselasi kuat). Pratinjau diperbarui secara langsung saat Anda menggeser penggeser.' },
      { q: 'Apakah pikselasi dapat dibalik?', a: 'Tidak — setelah Anda mengunduh gambar yang dipikselasi, detail asli di area yang dipikselasi hilang secara permanen. Inilah yang membuat pikselasi lebih aman daripada pengaburan untuk menyembunyikan informasi sensitif.' },
      { q: 'Format apa saja yang didukung?', a: 'Anda dapat mengunggah gambar JPG, PNG, dan WebP. Format output sesuai dengan input Anda — JPG tetap JPG, PNG tetap PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Blur Wajah' },{ href: '/crop', label: 'Potong' },{ href: '/compress', label: 'Kompres' },{ href: '/resize', label: 'Ubah Ukuran' }],
  },
  ms: {
    h2a: 'Cara Mempikselkan Imej Dalam Talian',
    steps: ['<strong>Muat naik imej anda</strong> — klik «Pilih Imej» atau seret dan lepas fail JPG, PNG atau WebP.','<strong>Pilih mod</strong> — pilih «Seluruh Imej» untuk mempikselkan semuanya, atau «Pilih Kawasan» untuk melukis kotak pada muka atau kawasan yang ingin anda pikselkan.','<strong>Laraskan peluncur</strong> — gerakkan peluncur tahap pikselasi dari rendah (mozek halus) ke tinggi (blok besar). Pratonton dikemas kini secara langsung semasa anda melaraskan.','<strong>Muat turun</strong> — simpan imej yang telah dipikselkan ke peranti anda.'],
    h2b: 'Alat Percuma Terbaik untuk Mempikselkan Imej dan Wajah Dalam Talian',
    body: '<p>Perlu menyembunyikan wajah, plat nombor atau maklumat sensitif dalam foto? Alat Pikselasi Imej daripada RelahConvert membolehkan anda menggunakan kesan mozek pada seluruh imej atau hanya pada kawasan tertentu — semuanya dalam pelayar anda. Tanpa muat naik, tanpa pelayan, percuma sepenuhnya dan peribadi.</p><p>Gunakan peluncur boleh laras untuk mengawal keamatan pikselasi dari mozek halus hingga blok besar. Lukis kotak pemilihan untuk mempikselkan hanya wajah atau kawasan tertentu sambil mengekalkan bahagian imej yang lain dengan jelas. Sempurna untuk perlindungan privasi, menyembunyikan data sensitif, siaran media sosial dan menamakan foto sebelum dikongsi.</p>',
    h3why: 'Mengapa Mempikselkan Imej?',
    why: 'Pikselasi adalah cara paling mudah dikenali untuk menyembunyikan kandungan sensitif dalam imej. Tidak seperti pengaburan, pikselasi tidak boleh diterbalikkan — butiran asal diganti secara kekal dengan blok warna pepejal. Ini menjadikannya ideal untuk melindungi privasi, menyembunyikan wajah, plat nombor, alamat dan maklumat sulit.',
    faqs: [
      { q: 'Apakah pikselasi imej?', a: 'Pikselasi imej menggantikan kawasan imej dengan blok warna pepejal yang besar, mencipta kesan mozek yang menyembunyikan butiran asal. Tidak seperti pengaburan, pikselasi tidak boleh diterbalikkan — piksel asal diganti secara kekal, menjadikannya cara selamat untuk menyembunyikan kandungan sensitif.' },
      { q: 'Bolehkah saya mempikselkan hanya wajah atau kawasan tertentu?', a: 'Ya — tukar ke mod «Pilih Kawasan» dan lukis segi empat tepat pada wajah atau kawasan yang ingin anda pikselkan. Bahagian imej yang lain kekal jelas dan tidak terjejas. Anda boleh melaraskan tahap pikselasi dengan peluncur.' },
      { q: 'Bagaimana cara mengawal keamatan pikselasi?', a: 'Gunakan peluncur untuk melaraskan saiz blok dari rendah (blok kecil, kesan halus) ke tinggi (blok besar, pikselasi kuat). Pratonton dikemas kini secara langsung semasa anda menggerakkan peluncur.' },
      { q: 'Adakah pikselasi boleh diterbalikkan?', a: 'Tidak — setelah anda memuat turun imej yang dipikselkan, butiran asal di kawasan yang dipikselkan hilang secara kekal. Inilah yang menjadikan pikselasi lebih selamat daripada pengaburan untuk menyembunyikan maklumat sensitif.' },
      { q: 'Format apa yang disokong?', a: 'Anda boleh memuat naik imej JPG, PNG dan WebP. Format output sepadan dengan input anda — JPG kekal JPG, PNG kekal PNG.' },
    ],
    links: [{ href: '/blur-face', label: 'Kabur Wajah' },{ href: '/crop', label: 'Pangkas' },{ href: '/compress', label: 'Mampat' },{ href: '/resize', label: 'Ubah Saiz' }],
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
  <div id="mainContainer" style="max-width:700px; margin:32px auto; padding:0 16px 60px; font-family:'DM Sans',sans-serif; transition:max-width 0.3s;">
    <div style="margin-bottom:20px;">
      <h1 style="font-family:'Fraunces',serif; font-size:clamp(24px,4vw,36px); font-weight:400; color:var(--text-primary); margin:0 0 6px; line-height:1; letter-spacing:-0.02em;">
        ${h1Main} <em style="font-style:italic; color:var(--accent);">${h1Em}</em>
      </h1>
      <p style="font-size:13px; color:var(--text-tertiary); margin:0;">${t.pix_desc || 'Pixelate an entire image or just a face/region. Batch process up to 25 files. Free, private, browser-only.'}</p>
    </div>
    <div id="uploadArea" style="margin-bottom:16px;">
      <label for="fileInput" style="display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:var(--text-on-accent); font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px; padding:10px 20px; border-radius:8px; cursor:pointer;">
        <span style="font-size:18px;">+</span> ${selectLbl}
      </label>
      <span style="font-size:12px; color:var(--text-muted); margin-left:12px;">${dropHint}</span>
    </div>
    <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" />
    <div id="warning" style="display:none; margin-bottom:12px; padding:10px 14px; border-radius:10px; border:1px solid #F5C6BC; background:var(--accent-bg); color:var(--accent-hover); font-weight:600; font-size:13px;"></div>
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
              <button id="modeAllBtn" style="flex:1; padding:6px 8px; border:1.5px solid var(--border-light); border-radius:6px 0 0 6px; background:var(--bg-card); color:var(--text-primary); font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${applyAllLbl}</button>
              <button id="modeIndBtn" style="flex:1; padding:6px 8px; border:1.5px solid var(--accent); border-radius:0 6px 6px 0; background:var(--accent); color:var(--text-on-accent); font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;">${individualLbl}</button>
            </div>
          </div>
          <div class="divider"></div>
          <p class="section-label">${pixLevelLbl}</p>
          <div class="range-row">
            <input type="range" id="pixelSlider" min="2" max="60" value="12" style="flex:1;" />
            <span class="range-val" id="pixelVal">12</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:-6px; margin-bottom:12px;">
            <span style="font-size:10px; color:var(--text-muted);">${pixLowLbl}</span>
            <span style="font-size:10px; color:var(--text-muted);">${pixHighLbl}</span>
          </div>
          <div class="divider"></div>
          <button class="opt-btn" id="downloadBtn" disabled>${dlLabel}</button>
        </div>
      </div>
    </div>
    <div id="nextSteps" style="display:none; margin-top:20px;">
      <div style="font-size:11px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">${t.whats_next || "WHAT'S NEXT?"}</div>
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
let perFileSelections = [] // perFileSelections[i] = [{ x, y, w, h }, ...]
let perFileMode = []       // perFileMode[i] = 'whole' | 'area'
let perFileLevel = []      // perFileLevel[i] = blockSize number
let activeSelIdx = -1 // which selection box is visible (-1 = none/drawing)
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
  selectedRegion = null
  pixCanvas.style.cursor = 'default'
  render()
})

modeArea.addEventListener('click', () => {
  if (isApplyAll) return
  isWholeMode = false
  modeArea.classList.add('active')
  modeWhole.classList.remove('active')
  perFileMode[activeFileIdx] = 'area'
  pixCanvas.style.cursor = 'crosshair'
  render()
})

modeAllBtn.addEventListener('click', () => {
  isApplyAll = true
  modeAllBtn.style.background = 'var(--accent)'; modeAllBtn.style.color = 'var(--text-on-accent)'; modeAllBtn.style.borderColor = 'var(--accent)'
  modeIndBtn.style.background = 'var(--bg-card)'; modeIndBtn.style.color = 'var(--text-primary)'; modeIndBtn.style.borderColor = 'var(--border-light)'
  // Force Whole Image mode in Apply to All
  isWholeMode = true
  modeWhole.classList.add('active')
  modeArea.classList.remove('active')
  modeArea.style.opacity = '0.5'
  modeArea.style.pointerEvents = 'none'
  pixCanvas.style.cursor = 'default'
  applyPixelation()
})

modeIndBtn.addEventListener('click', () => {
  isApplyAll = false
  modeIndBtn.style.background = 'var(--accent)'; modeIndBtn.style.color = 'var(--text-on-accent)'; modeIndBtn.style.borderColor = 'var(--accent)'
  modeAllBtn.style.background = 'var(--bg-card)'; modeAllBtn.style.color = 'var(--text-primary)'; modeAllBtn.style.borderColor = 'var(--border-light)'
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
  document.getElementById('mainContainer').style.maxWidth = '900px'
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
  drawing = null
  selectedRegion = null
  // Restore per-file state in Individual mode
  if (!isApplyAll) {
    isWholeMode = perFileMode[idx] === 'whole'
    pixelSlider.value = perFileLevel[idx] || 12
    pixelVal.textContent = pixelSlider.value
    modeWhole.classList.toggle('active', isWholeMode)
    modeArea.classList.toggle('active', !isWholeMode)
    pixCanvas.style.cursor = isWholeMode ? 'default' : 'crosshair'
  }
  render()
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

// ── Canvas interaction (blur-face pattern) ──────────────────────────────────
function coords(e) {
  const r = pixCanvas.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return { cx: (clientX - r.left) * pixCanvas.width / r.width, cy: (clientY - r.top) * pixCanvas.height / r.height }
}

let drawing = null
let selectedRegion = null

function setupCanvasEvents() {
  pixCanvas.addEventListener('mousedown', onDown)
  pixCanvas.addEventListener('mousemove', onMove)
  pixCanvas.addEventListener('mouseup', onUp)
  pixCanvas.addEventListener('touchstart', e => { const t = e.touches[0]; pixCanvas.dispatchEvent(new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY })) }, { passive: false })
  pixCanvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; pixCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY })) }, { passive: false })
  pixCanvas.addEventListener('touchend', e => { const t = e.changedTouches[0]; pixCanvas.dispatchEvent(new MouseEvent('mouseup', { clientX: t.clientX, clientY: t.clientY })) })
}

function onDown(e) {
  if (isWholeMode || isApplyAll) return
  const { cx, cy } = coords(e)
  const entry = perFileSelections[activeFileIdx] || []

  // Check X delete on selected region
  if (selectedRegion && selectedRegion._xBtn) {
    const xb = selectedRegion._xBtn
    if (Math.hypot(cx - xb.cx, cy - xb.cy) <= xb.r + 4) {
      perFileSelections[activeFileIdx] = entry.filter(r => r !== selectedRegion)
      selectedRegion = null
      render()
      e.preventDefault()
      return
    }
  }

  // Check if clicking inside an existing region to select it
  for (let i = entry.length - 1; i >= 0; i--) {
    const r = entry[i]
    if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
      selectedRegion = r
      pixelSlider.value = r.blockSize || 12
      pixelVal.textContent = pixelSlider.value
      render()
      e.preventDefault()
      return
    }
  }

  // Clicked empty area — deselect and start drawing
  selectedRegion = null
  drawing = { startX: cx, startY: cy, curX: cx, curY: cy }
  e.preventDefault()
}

function onMove(e) {
  if (!drawing) return
  const { cx, cy } = coords(e)
  drawing.curX = cx
  drawing.curY = cy
  render()
}

function onUp(e) {
  if (!drawing) return
  const { cx, cy } = coords(e)
  const x = Math.min(drawing.startX, cx), y = Math.min(drawing.startY, cy)
  const w = Math.abs(cx - drawing.startX), h = Math.abs(cy - drawing.startY)
  drawing = null
  if (w > 10 && h > 10) {
    const newRegion = { x, y, w, h, blockSize: parseInt(pixelSlider.value) }
    selectedRegion = newRegion
    if (!perFileSelections[activeFileIdx]) perFileSelections[activeFileIdx] = []
    perFileSelections[activeFileIdx].push(newRegion)
  }
  render()
}

// ── Render (blur-face pattern) ──────────────────────────────────────────────
function render() {
  const img = loadedImages[activeFileIdx]
  if (!img) return
  const blockSize = parseInt(pixelSlider.value)
  ctx.clearRect(0, 0, pixCanvas.width, pixCanvas.height)
  ctx.drawImage(img, 0, 0)

  if (isWholeMode) {
    pixelateRegion(0, 0, pixCanvas.width, pixCanvas.height, blockSize)
  } else {
    const sels = perFileSelections[activeFileIdx] || []
    // Pixelate ALL regions
    sels.forEach(r => {
      const bs = (r === selectedRegion) ? blockSize : (r.blockSize || blockSize)
      pixelateRegion(Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h), bs)
    })
    // Draw outline + X only for selected region
    sels.forEach(r => {
      r._xBtn = null
      if (r !== selectedRegion) return
      ctx.save()
      ctx.strokeStyle = 'rgba(200,75,49,0.9)'
      ctx.lineWidth = Math.max(2, pixCanvas.width / 300)
      ctx.setLineDash([5, 3])
      ctx.strokeRect(r.x, r.y, r.w, r.h)
      ctx.setLineDash([])
      // X delete circle
      const xr = Math.max(10, pixCanvas.width / 80)
      const xcx = r.x + r.w + xr + 2, xcy = r.y - xr - 2
      ctx.fillStyle = '#C84B31'
      ctx.beginPath(); ctx.arc(xcx, xcy, xr, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(xcx - 5, xcy - 5); ctx.lineTo(xcx + 5, xcy + 5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(xcx + 5, xcy - 5); ctx.lineTo(xcx - 5, xcy + 5); ctx.stroke()
      r._xBtn = { cx: xcx, cy: xcy, r: xr }
      ctx.restore()
    })
    // Draw current drag outline
    if (drawing) {
      ctx.save()
      ctx.strokeStyle = '#C84B31'
      ctx.lineWidth = Math.max(2, pixCanvas.width / 200)
      ctx.setLineDash([5, 3])
      const x = Math.min(drawing.startX, drawing.curX), y = Math.min(drawing.startY, drawing.curY)
      ctx.strokeRect(x, y, Math.abs(drawing.curX - drawing.startX), Math.abs(drawing.curY - drawing.startY))
      ctx.setLineDash([])
      ctx.restore()
    }
  }
}

// Keep old name for compatibility
function applyPixelation() { render() }

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
        const selBS = sel.blockSize || blockSize
        const x0 = Math.max(0, Math.round(sel.x)), y0 = Math.max(0, Math.round(sel.y))
        const x1 = Math.min(c.width, Math.round(sel.x + sel.w)), y1 = Math.min(c.height, Math.round(sel.y + sel.h))
        const rw = x1 - x0, rh = y1 - y0
        if (rw <= 0 || rh <= 0) return
        const imgData = cx.getImageData(x0, y0, rw, rh)
        const d = imgData.data
        for (let by = 0; by < rh; by += selBS) {
          for (let bx = 0; bx < rw; bx += selBS) {
            const bw = Math.min(selBS, rw - bx), bh = Math.min(selBS, rh - by)
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
  if (selectedRegion) selectedRegion.blockSize = parseInt(pixelSlider.value)
  if (loadedImages[activeFileIdx] && editorArea.style.display !== 'none') render()
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
      const sels = isApplyAll ? [] : (perFileSelections[i] || [])
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
      a.click();if(window.showReviewPrompt)window.showReviewPrompt()
    } else {
      const zip = new JSZip()
      resultBlobs.forEach((r, i) => zip.file((i + 1) + '_' + r.name, r.blob))
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      cleanupOldUrl()
      currentDownloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = currentDownloadUrl
      a.download = 'pixelated-images.zip'
      a.click();if(window.showReviewPrompt)window.showReviewPrompt()
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
setupCanvasEvents()
loadPendingFiles()
