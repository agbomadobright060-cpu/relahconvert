const fs = require('fs')
const p = 'src/core/i18n.js'
let s = fs.readFileSync(p, 'utf8')

s = s.replace("'image-to-ico':'Image to ICO','jpg-to-svg':'JPG to SVG',","'image-to-ico':'Image to ICO','jpg-to-svg':'JPG to SVG','round-corners':'Round Corners',")
s = s.replace("'image-to-ico':'Image en ICO','jpg-to-svg':'JPG en SVG'}","'image-to-ico':'Image en ICO','jpg-to-svg':'JPG en SVG','round-corners':'Coins arrondis'}")
s = s.replace("'image-to-ico':'Imagen a ICO','jpg-to-svg':'JPG a SVG'}","'image-to-ico':'Imagen a ICO','jpg-to-svg':'JPG a SVG','round-corners':'Esquinas redondeadas'}")
s = s.replace("'image-to-ico':'Imagem para ICO','jpg-to-svg':'JPG para SVG'}","'image-to-ico':'Imagem para ICO','jpg-to-svg':'JPG para SVG','round-corners':'Cantos arredondados'}")
s = s.replace("'image-to-ico':'Bild zu ICO','jpg-to-svg':'JPG zu SVG'}","'image-to-ico':'Bild zu ICO','jpg-to-svg':'JPG zu SVG','round-corners':'Abgerundete Ecken'}")

fs.writeFileSync(p, s)
console.log('done')