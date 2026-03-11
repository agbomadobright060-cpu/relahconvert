const fs = require('fs')
const p = 'src/core/i18n.js'
let s = fs.readFileSync(p, 'utf8')

const enSeo = `      'round-corners':{h2a:'How to Round Image Corners Free — No Upload Required',steps:['<strong>Select your images</strong> — click "Select Images" or drag and drop up to 25 images onto the page.','<strong>Choose a corner radius</strong> — drag the slider or pick a preset: Slight, Rounded, Very Rounded, or Circle.','<strong>Click Round Corners</strong> — processing runs instantly in your browser. No upload, no waiting.','<strong>Download your PNG</strong> — single image downloads directly; multiple images download as a ZIP.'],h2b:"The Best Free Image Corner Rounder That Doesn't Upload Your Files",body:'<p>RelahConvert rounds the corners of any image directly in your browser. No file upload, no server, no account required. Output is always PNG to preserve the transparent corners.</p>',h3why:'Why Round Image Corners?',why:'Rounded corners give images a polished, modern look — ideal for profile pictures, product photos, app icons, thumbnails, and UI mockups.',faqs:[{q:'What format is the output?',a:'Always PNG — this preserves the transparent rounded corners.'},{q:'Does it work on multiple images at once?',a:'Yes — upload up to 25 images and download them all as a ZIP.'},{q:'Will my files be uploaded to a server?',a:'No. Everything runs in your browser. Your files never leave your device.'},{q:'Can I make a circle crop?',a:'Yes — set the radius to 50% to turn any image into a perfect circle.'},{q:'Can I control how rounded the corners are?',a:'Yes — drag the slider from 0% (sharp) to 50% (circle), or use the preset buttons.'}],links:[{href:'/crop',label:'Crop Image'},{href:'/resize',label:'Resize Image'},{href:'/rotate',label:'Rotate Image'},{href:'/compress',label:'Compress Image'},{href:'/remove-background',label:'Remove Background'},{href:'/jpg-to-png',label:'JPG to PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{
        h2a:'How to Convert JPG to SVG Without Uploading',`,
  enSeo + `      'jpg-to-svg':{
        h2a:'How to Convert JPG to SVG Without Uploading',`
)

const frSeo = `      'round-corners':{h2a:"Arrondir les coins d'une image gratuitement — sans télécharger",steps:['<strong>Sélectionnez vos images</strong>.','<strong>Choisissez un rayon</strong>.','<strong>Cliquez sur Arrondir les coins</strong>.','<strong>Téléchargez votre PNG</strong>.'],h2b:"Le meilleur outil d'arrondissement de coins gratuit",body:"<p>RelahConvert arrondit les coins dans votre navigateur. Sortie toujours en PNG.</p>",h3why:'Pourquoi arrondir les coins ?',why:"Les coins arrondis donnent un aspect moderne.",faqs:[{q:'Format de sortie ?',a:'Toujours PNG.'},{q:'Plusieurs images ?',a:"Oui — jusqu'à 25, ZIP."},{q:'Fichiers uploadés ?',a:'Non.'},{q:'Recadrage circulaire ?',a:'Oui — rayon à 50%.'}],links:[{href:'/crop',label:'Recadrer'},{href:'/resize',label:'Redimensionner'},{href:'/rotate',label:'Pivoter'},{href:'/compress',label:'Compresser'},{href:'/remove-background',label:'Supprimer fond'},{href:'/jpg-to-png',label:'JPG en PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{h2a:'Comment convertir JPG en SVG sans télécharger',`,
  frSeo + `      'jpg-to-svg':{h2a:'Comment convertir JPG en SVG sans télécharger',`
)

const esSeo = `      'round-corners':{h2a:'Redondear esquinas de imagen gratis — sin subir',steps:['<strong>Selecciona tus imágenes</strong>.','<strong>Elige un radio</strong>.','<strong>Haz clic en Esquinas redondeadas</strong>.','<strong>Descarga tu PNG</strong>.'],h2b:"La mejor herramienta de esquinas redondeadas gratis",body:"<p>RelahConvert redondea las esquinas en tu navegador. Salida siempre en PNG.</p>",h3why:'¿Por qué redondear esquinas?',why:"Dan un aspecto moderno y pulido.",faqs:[{q:'¿Formato de salida?',a:'Siempre PNG.'},{q:'¿Varias imágenes?',a:'Sí — hasta 25, ZIP.'},{q:'¿Se suben archivos?',a:'No.'},{q:'¿Recorte circular?',a:'Sí — radio al 50%.'}],links:[{href:'/crop',label:'Recortar'},{href:'/resize',label:'Redimensionar'},{href:'/rotate',label:'Rotar'},{href:'/compress',label:'Comprimir'},{href:'/remove-background',label:'Quitar fondo'},{href:'/jpg-to-png',label:'JPG a PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{h2a:'Cómo convertir JPG a SVG sin subir',`,
  esSeo + `      'jpg-to-svg':{h2a:'Cómo convertir JPG a SVG sin subir',`
)

const ptSeo = `      'round-corners':{h2a:'Arredondar cantos de imagem grátis — sem upload',steps:['<strong>Selecione suas imagens</strong>.','<strong>Escolha um raio</strong>.','<strong>Clique em Cantos arredondados</strong>.','<strong>Baixe seu PNG</strong>.'],h2b:"Melhor ferramenta de cantos arredondados grátis",body:"<p>RelahConvert arredonda os cantos no seu navegador. Saída sempre em PNG.</p>",h3why:'Por que arredondar cantos?',why:"Dão um visual moderno e polido.",faqs:[{q:'Formato de saída?',a:'Sempre PNG.'},{q:'Várias imagens?',a:'Sim — até 25, ZIP.'},{q:'Arquivos enviados?',a:'Não.'},{q:'Recorte circular?',a:'Sim — raio 50%.'}],links:[{href:'/crop',label:'Cortar'},{href:'/resize',label:'Redimensionar'},{href:'/rotate',label:'Girar'},{href:'/compress',label:'Comprimir'},{href:'/remove-background',label:'Remover fundo'},{href:'/jpg-to-png',label:'JPG para PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{h2a:'Como converter JPG para SVG sem upload',`,
  ptSeo + `      'jpg-to-svg':{h2a:'Como converter JPG para SVG sem upload',`
)

const deSeo = `      'round-corners':{h2a:'Bildecken kostenlos abrunden — kein Upload erforderlich',steps:['<strong>Bilder auswählen</strong>.','<strong>Radius wählen</strong>.','<strong>Ecken abrunden klicken</strong>.','<strong>PNG herunterladen</strong>.'],h2b:"Bestes kostenloses Werkzeug zum Abrunden von Bildecken",body:"<p>RelahConvert rundet Bildecken in Ihrem Browser ab. Ausgabe immer als PNG.</p>",h3why:'Warum Bildecken abrunden?',why:"Verleihen Bildern ein modernes Aussehen.",faqs:[{q:'Ausgabeformat?',a:'Immer PNG.'},{q:'Mehrere Bilder?',a:'Ja — bis zu 25, ZIP.'},{q:'Dateien hochgeladen?',a:'Nein.'},{q:'Kreisausschnitt?',a:'Ja — Radius 50%.'}],links:[{href:'/crop',label:'Zuschneiden'},{href:'/resize',label:'Skalieren'},{href:'/rotate',label:'Drehen'},{href:'/compress',label:'Komprimieren'},{href:'/remove-background',label:'Hintergrund entfernen'},{href:'/jpg-to-png',label:'JPG zu PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{h2a:'So konvertieren Sie JPG in SVG ohne Upload',`,
  deSeo + `      'jpg-to-svg':{h2a:'So konvertieren Sie JPG in SVG ohne Upload',`
)

const arSeo = `      'round-corners':{h2a:'تدوير زوايا الصور مجاناً — بدون رفع',steps:['<strong>اختر صورك</strong>.','<strong>اختر نصف القطر</strong>.','<strong>انقر على زوايا مستديرة</strong>.','<strong>حمّل PNG</strong>.'],h2b:"أفضل أداة تدوير زوايا الصور مجاناً",body:"<p>RelahConvert يدوّر زوايا الصور في متصفحك. الإخراج دائماً PNG.</p>",h3why:'لماذا تدوير زوايا الصور؟',why:"تعطي الصور مظهراً حديثاً.",faqs:[{q:'تنسيق الإخراج؟',a:'PNG دائماً.'},{q:'صور متعددة؟',a:'نعم — حتى 25، ZIP.'},{q:'رفع الملفات؟',a:'لا.'},{q:'قص دائري؟',a:'نعم — 50%.'}],links:[{href:'/crop',label:'قص'},{href:'/resize',label:'تغيير الحجم'},{href:'/rotate',label:'تدوير'},{href:'/compress',label:'ضغط'},{href:'/remove-background',label:'إزالة الخلفية'},{href:'/jpg-to-png',label:'JPG إلى PNG'}]},\n`

s = s.replace(
  `      'jpg-to-svg':{h2a:'كيفية تحويل JPG إلى SVG بدون رفع',`,
  arSeo + `      'jpg-to-svg':{h2a:'كيفية تحويل JPG إلى SVG بدون رفع',`
)

fs.writeFileSync(p, s)
console.log('SEO patch done')