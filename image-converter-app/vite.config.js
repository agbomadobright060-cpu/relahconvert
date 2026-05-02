import { defineConfig } from 'vite'
import { resolve } from 'path'
import { mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { VitePWA } from 'vite-plugin-pwa'

const supportedLangs = ['fr','es','pt','de','ar','it','ja','ru','ko','zh','zh-TW','bg','ca','nl','el','hi','id','ms','pl','sv','th','tr','uk','vi']

function langRedirectPlugin() {
  return {
    name: 'lang-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || '').split('?')[0]
        const segs = urlPath.replace(/^\/|\/$/g, '').split('/')

        // Match /{lang} or /{lang}/{slug} — serve index.html so main.js can handle routing
        if (segs[0] && supportedLangs.includes(segs[0].toLowerCase())) {
          req.url = '/index.html'
        }
        next()
      })
    }
  }
}

// After build, copy index.html into each lang folder so Cloudflare serves
// actual files instead of relying on _redirects (which gets aggressively cached)
function langCopyPlugin() {
  return {
    name: 'lang-copy',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const src = resolve(distDir, 'index.html')
      if (!existsSync(src)) return

      // Read i18n.js to extract translated slugs per language
      const i18nPath = resolve(__dirname, 'src/core/i18n.js')
      const i18nSrc = readFileSync(i18nPath, 'utf-8')
      // Extract slug mappings: { fr: { compress: 'compresser-image', ... }, ... }
      const slugMapByLang = {}
      const slugBlocks = i18nSrc.match(/slugs:\{[^}]+\}/g) || []
      const langsWithSlugs = supportedLangs.filter(l => l !== 'en')
      slugBlocks.forEach((block, i) => {
        if (i >= langsWithSlugs.length) return
        const lang = langsWithSlugs[i]
        const map = {}
        const inner = block.replace('slugs:{', '').replace('}', '')
        inner.split(',').forEach(pair => {
          const [k, v] = pair.split(':').map(s => s ? s.replace(/'/g, '').trim() : '')
          if (k && v) map[k] = v
        })
        slugMapByLang[lang] = map
      })

      // Extract home_title and home_meta_description per language
      const homeTitleByLang = {}
      const homeDescByLang = {}
      const allLangsForMeta = ['en', ...supportedLangs]
      for (const lang of allLangsForMeta) {
        const langKey = lang.includes('-') ? `'${lang}'` : lang
        // Find start of this lang's top-level object (anchored to line start with 2-space indent)
        const prefix = '\n  '
        let startIdx = i18nSrc.indexOf(prefix + langKey + ':{')
        if (startIdx === -1) startIdx = i18nSrc.indexOf(prefix + langKey + ': {')
        if (startIdx === -1) continue
        // Find start of next lang's object to bound search
        let endIdx = i18nSrc.length
        for (const other of allLangsForMeta) {
          if (other === lang) continue
          const otherKey = other.includes('-') ? `'${other}'` : other
          let otherIdx = i18nSrc.indexOf(prefix + otherKey + ':{', startIdx + 1)
          if (otherIdx === -1) otherIdx = i18nSrc.indexOf(prefix + otherKey + ': {', startIdx + 1)
          if (otherIdx > startIdx && otherIdx < endIdx) endIdx = otherIdx
        }
        const block = i18nSrc.substring(startIdx, endIdx)
        // Extract values handling both quote styles
        const titleM = block.match(/home_title:'([^']*)'/) || block.match(/home_title:"([^"]*)"/)
        const descM = block.match(/home_meta_description:'([^']*)'/) || block.match(/home_meta_description:"([^"]*)"/)
        if (titleM) homeTitleByLang[lang] = titleM[1]
        if (descM) homeDescByLang[lang] = descM[1]
      }

      // Extract per-language SEO h2b and body for PDF tools (used for translated <title> and <meta description>)
      const pdfToolsForSeo = ['merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf','protect-pdf','unlock-pdf','extract-images-pdf']
      const seoByLangByTool = {}
      for (const lang of allLangsForMeta) {
        const langKey = lang.includes('-') ? `'${lang}'` : lang
        let startIdx = i18nSrc.indexOf('\n  ' + langKey + ':{')
        if (startIdx === -1) startIdx = i18nSrc.indexOf('\n  ' + langKey + ': {')
        if (startIdx === -1) continue
        let endIdx = i18nSrc.length
        for (const other of allLangsForMeta) {
          if (other === lang) continue
          const otherKey = other.includes('-') ? `'${other}'` : other
          let otherIdx = i18nSrc.indexOf('\n  ' + otherKey + ':{', startIdx + 1)
          if (otherIdx === -1) otherIdx = i18nSrc.indexOf('\n  ' + otherKey + ': {', startIdx + 1)
          if (otherIdx > startIdx && otherIdx < endIdx) endIdx = otherIdx
        }
        const block = i18nSrc.substring(startIdx, endIdx)
        seoByLangByTool[lang] = {}
        for (const tool of pdfToolsForSeo) {
          const toolStart = block.indexOf("'" + tool + "':{")
          if (toolStart === -1) continue
          // Take a window that's large enough to contain the tool's seo entry but not bleed into siblings
          const windowEnd = block.indexOf("\n      '", toolStart + 1)
          const window = block.substring(toolStart, windowEnd === -1 ? toolStart + 8000 : windowEnd)
          const h2bM = window.match(/h2b:'((?:\\.|[^'\\])*)'/)
          const bodyM = window.match(/body:'((?:\\.|[^'\\])*)'/)
          seoByLangByTool[lang][tool] = {
            h2b: h2bM ? h2bM[1].replace(/\\'/g, "'") : null,
            body: bodyM ? bodyM[1].replace(/\\'/g, "'").replace(/<[^>]+>/g, '').trim() : null,
          }
        }
      }

      function buildMetaDesc(body) {
        if (!body) return null
        if (body.length <= 160) return body
        const slice = body.substring(0, 160)
        const lastDot = slice.lastIndexOf('. ')
        if (lastDot > 80) return slice.substring(0, lastDot + 1).trim()
        const lastSpace = slice.lastIndexOf(' ')
        return slice.substring(0, lastSpace > 0 ? lastSpace : 160).trim()
      }

      function escAttr(s) {
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      // ── Schema.org JSON-LD helpers ──────────────────────────────────────
      const PDF_TOOL_SET = new Set([
        'pdf-tools','merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf',
        'extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf',
        'protect-pdf','unlock-pdf','extract-images-pdf'
      ])
      // English display name per slug for WebApplication schema name field
      const TOOL_NAME_EN = {
        'compress':'Compress Image','resize':'Resize Image','crop':'Crop Image',
        'rotate':'Rotate Image','flip':'Flip Image','grayscale':'Black & White',
        'watermark':'Watermark Image','round-corners':'Round Image Corners',
        'meme-generator':'Meme Generator','blur-face':'Blur Face',
        'remove-background':'Remove Background','heic-to-jpg':'HEIC to JPG',
        'image-to-ico':'Image to ICO','jpg-to-svg':'JPG to SVG',
        'html-to-image':'HTML to Image','merge-images':'Merge Images',
        'passport-photo':'Passport Photo','image-splitter':'Image Splitter',
        'resize-in-kb':'Resize in KB','pixelate-image':'Pixelate Image',
        'svg-to-png':'SVG to PNG','svg-to-jpg':'SVG to JPG',
        'jpg-to-png':'JPG to PNG','png-to-jpg':'PNG to JPG',
        'jpg-to-webp':'JPG to WebP','webp-to-jpg':'WebP to JPG',
        'png-to-webp':'PNG to WebP','webp-to-png':'WebP to PNG',
        'jpg-to-pdf':'JPG to PDF','png-to-pdf':'PNG to PDF','pdf-to-png':'PDF to PNG',
        'gif-to-jpg':'GIF to JPG','gif-to-png':'GIF to PNG',
        'bmp-to-jpg':'BMP to JPG','bmp-to-png':'BMP to PNG','tiff-to-jpg':'TIFF to JPG',
        'jpg-to-gif':'JPG to GIF','png-to-gif':'PNG to GIF',
        'pdf-tools':'PDF Tools','merge-pdf':'Merge PDF','split-pdf':'Split PDF',
        'rotate-pdf':'Rotate PDF','compress-pdf':'Compress PDF',
        'reorder-pdf':'Reorder PDF Pages','extract-pdf':'Extract PDF Pages',
        'remove-pdf':'Remove PDF Pages','add-page-numbers':'Add Page Numbers to PDF',
        'watermark-pdf':'Watermark PDF','crop-pdf':'Crop PDF',
        'protect-pdf':'Protect PDF','unlock-pdf':'Unlock PDF',
        'extract-images-pdf':'Extract Images from PDF',
      }
      function appCategoryFor(slug) {
        return PDF_TOOL_SET.has(slug) ? 'BusinessApplication' : 'MultimediaApplication'
      }
      function orgSchema(homeUrl) {
        return {
          '@context':'https://schema.org','@type':'Organization',
          name:'RelahConvert',url:homeUrl,
          logo:'https://relahconvert.com/pwa-512x512.png'
        }
      }
      function siteSchema(homeUrl) {
        return {
          '@context':'https://schema.org','@type':'WebSite',
          name:'RelahConvert',url:homeUrl
        }
      }
      // Fallback English description per tool when the source HTML lacks a
      // <meta name="description"> (some image tools inject it at runtime in JS)
      const TOOL_DESC_EN = {
        'compress':'Compress JPG, PNG, and WebP images to reduce file size while keeping quality. Bulk processing.',
        'resize':'Resize JPG and PNG images by pixels or percentage. Bulk image resizer.',
        'crop':'Crop images to exact pixel dimensions. Free image cropper with bulk processing.',
        'rotate':'Rotate images by any angle. Batch rotate multiple files at once.',
        'flip':'Flip images horizontally or vertically. Bulk processing for multiple files.',
        'grayscale':'Convert images to black and white. Bulk grayscale converter for multiple files.',
        'watermark':'Add text or image watermarks to your photos. Bulk watermark tool.',
        'round-corners':'Add rounded corners to images. Bulk processing for multiple files.',
        'meme-generator':'Create memes with custom text and 100+ templates.',
        'blur-face':'Automatically blur faces in photos. Privacy-focused face blurring.',
        'remove-background':'AI-powered background removal for photos. Bulk processing.',
        'heic-to-jpg':'Convert HEIC images from iPhone to JPG format. Bulk converter.',
        'image-to-ico':'Create favicon ICO files from any image. Multiple sizes supported.',
        'jpg-to-svg':'Convert JPG raster images to SVG vector format.',
        'html-to-image':'Convert HTML markup to PNG or JPG images.',
        'merge-images':'Combine multiple images into one. Horizontal or vertical merge.',
        'passport-photo':'Create passport photos for 160+ countries with correct sizing.',
        'image-splitter':'Split images into grid pieces for Instagram or other layouts.',
        'resize-in-kb':'Resize images to a target file size in KB. Precise size control.',
        'pixelate-image':'Pixelate faces, license plates, or any area in photos.',
        'svg-to-png':'Convert SVG vector files to PNG raster images.',
        'svg-to-jpg':'Convert SVG vector files to JPG raster images.',
        'jpg-to-png':'Convert JPG images to PNG format with transparency support.',
        'png-to-jpg':'Convert PNG images to JPG format. Reduce file size.',
        'jpg-to-webp':'Convert JPG to WebP for smaller, modern web images.',
        'webp-to-jpg':'Convert WebP images back to universal JPG format.',
        'png-to-webp':'Convert PNG to WebP for smaller, modern web images.',
        'webp-to-png':'Convert WebP images to PNG format with transparency.',
        'jpg-to-pdf':'Convert JPG images to PDF documents. Bulk processing.',
        'png-to-pdf':'Convert PNG images to PDF documents. Bulk processing.',
        'pdf-to-png':'Convert PDF pages to PNG images. Extract pages as PNG.',
        'gif-to-jpg':'Convert GIF images to JPG format. Bulk converter.',
        'gif-to-png':'Convert GIF images to PNG format. Bulk converter.',
        'bmp-to-jpg':'Convert BMP bitmap images to JPG format.',
        'bmp-to-png':'Convert BMP bitmap images to PNG format.',
        'tiff-to-jpg':'Convert TIFF images to JPG format. Bulk converter.',
        'jpg-to-gif':'Convert JPG images to animated GIF.',
        'png-to-gif':'Convert PNG images to animated GIF.',
        'pdf-tools':'Free PDF toolkit — merge, split, compress, rotate, watermark, protect, unlock, and edit PDF files.',
        'merge-pdf':'Merge multiple PDF files into one document. Drag to reorder, bulk process.',
        'split-pdf':'Split a PDF into separate pages or custom page ranges.',
        'rotate-pdf':'Rotate PDF pages by 90, 180, or 270 degrees. Per-page or all pages.',
        'compress-pdf':'Reduce PDF file size by optimizing images and removing unnecessary data.',
        'reorder-pdf':'Drag and drop to rearrange PDF pages in any order.',
        'extract-pdf':'Extract specific pages from a PDF and save them as a new document.',
        'remove-pdf':'Delete unwanted pages from a PDF document.',
        'add-page-numbers':'Add page numbers to PDF with custom position, font size, and starting number.',
        'watermark-pdf':'Add text or image watermarks to PDF pages. Customize opacity and position.',
        'crop-pdf':'Crop PDF pages by adjusting margins. Trim whitespace or resize.',
        'protect-pdf':'Add password protection to PDF documents with AES-256 encryption.',
        'unlock-pdf':'Remove password protection from a PDF. Preserves original content.',
        'extract-images-pdf':'Pull embedded images out of any PDF at original resolution.',
      }
      // Strip forbidden privacy/processing-location phrasing from descriptions.
      // Strategy: locate the first forbidden phrase, walk back to the previous
      // clause boundary (period, em-dash, comma, semicolon) and truncate there.
      const FORBIDDEN_PHRASES = [
        // English
        'no file upload','no upload','no uploads','no install','no server','no signup','no sign-up','no sign up',
        'browser-only','browser only','entirely in your browser','in your browser','in the browser',
        'files never leave','files don\'t leave','files stay on','processed locally','runs locally',
        // French
        'dans votre navigateur','aucun envoi','aucun téléversement','aucun téléchargement','sans serveur','sans installation','sans inscription',
        // Spanish
        'en tu navegador','en su navegador','sin subir','sin servidor','sin instalación','sin registro',
        // Portuguese
        'no seu navegador','no navegador','sem enviar','sem upload','sem servidor','sem instalar','sem cadastro',
        // German
        'in ihrem browser','im browser','ohne upload','ohne server','ohne installation','ohne anmeldung',
        // Italian
        'nel tuo browser','nel browser','senza lasciare','senza caricamento','senza server','senza installazione','senza registrazione','direttamente nel','tuo browser',
        // Dutch
        'in je browser','in uw browser','geen upload','geen server','geen installatie',
        // Russian
        'в вашем браузере','в браузере','без загрузки','без сервера','без установки',
        // Polish
        'w przeglądarce','bez przesyłania','bez serwera','bez instalacji',
        // Other locale terms commonly seen in our translations
        '브라우저에서','브라우저 전용','업로드 없이',
        '在浏览器中','在瀏覽器中','无需上传','無需上傳',
        'ในเบราว์เซอร์','ไม่ต้องอัปโหลด',
        'tarayıcınızda','tarayıcıda','yüklemeden',
        'ในเบราว์เซอร์','คุณ',
      ]
      function sanitizeDesc(s) {
        if (!s) return s
        const lower = s.toLowerCase()
        let cutAt = -1
        for (const p of FORBIDDEN_PHRASES) {
          const idx = lower.indexOf(p.toLowerCase())
          if (idx !== -1 && (cutAt === -1 || idx < cutAt)) cutAt = idx
        }
        if (cutAt === -1) return s.trim()
        // Walk backward to the nearest clause boundary
        let end = cutAt
        for (let i = cutAt - 1; i >= 0; i--) {
          const ch = s[i]
          if (ch === '.' || ch === '!' || ch === '?' || ch === ';') { end = i + 1; break }
          if (ch === '—' || ch === '–' || ch === ',') { end = i; break }
        }
        return s.substring(0, end).trim().replace(/[,.\s—–\-]+$/, '').trim()
      }
      function appSchema(opts) {
        return {
          '@context':'https://schema.org','@type':'WebApplication',
          name:opts.name,description:sanitizeDesc(opts.description),url:opts.url,
          applicationCategory:opts.category,operatingSystem:'Any',
          browserRequirements:'Requires JavaScript. Requires HTML5.',
          offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}
        }
      }
      function injectSchemas(html, schemas) {
        const cleaned = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '')
        const scripts = schemas.map(s => `    <script type="application/ld+json">${JSON.stringify(s)}</script>\n`).join('')
        return cleaned.replace('</head>', scripts + '  </head>')
      }
      function extractMetaDesc(html) {
        const m = html.match(/<meta name="description" content="([^"]*)"/)
        return m ? m[1] : ''
      }

      const base = 'https://relahconvert.com'
      const baseHtml = readFileSync(src, 'utf-8')

      const staticSlugMap = {
        fr: { about: 'a-propos', contact: 'contact', cookies: 'cookies', 'privacy-policy': 'politique-de-confidentialite', 'terms-and-conditions': 'conditions-generales' },
        es: { about: 'acerca-de', contact: 'contacto', cookies: 'cookies', 'privacy-policy': 'politica-de-privacidad', 'terms-and-conditions': 'terminos-y-condiciones' },
        pt: { about: 'sobre', contact: 'contato', cookies: 'cookies', 'privacy-policy': 'politica-de-privacidade', 'terms-and-conditions': 'termos-e-condicoes' },
        de: { about: 'ueber-uns', contact: 'kontakt', cookies: 'cookies', 'privacy-policy': 'datenschutzrichtlinie', 'terms-and-conditions': 'allgemeine-geschaeftsbedingungen' },
        ar: { about: 'hawl', contact: 'ittisal', cookies: 'cookies', 'privacy-policy': 'siyasat-alkhususiya', 'terms-and-conditions': 'al-shurut-wal-ahkam' },
        it: { about: 'chi-siamo', contact: 'contatti', cookies: 'cookies', 'privacy-policy': 'informativa-privacy', 'terms-and-conditions': 'termini-e-condizioni' },
        ja: { about: 'gaiyou', contact: 'otoiawase', cookies: 'cookies', 'privacy-policy': 'puraibashii-porishii', 'terms-and-conditions': 'riyou-kiyaku' },
        ru: { about: 'o-nas', contact: 'kontakty', cookies: 'cookies', 'privacy-policy': 'politika-konfidentsialnosti', 'terms-and-conditions': 'usloviya-ispolzovaniya' },
        ko: { about: 'sogae', contact: 'munui', cookies: 'cookies', 'privacy-policy': 'gaein-jeongbo-cheori-bangchim', 'terms-and-conditions': 'iyong-yakgwan' },
        zh: { about: 'guanyu', contact: 'lianxi', cookies: 'cookies', 'privacy-policy': 'yinsi-zhengce', 'terms-and-conditions': 'fuwu-tiaokuan' },
        'zh-TW': { about: 'guanyu', contact: 'lianxi', cookies: 'cookies', 'privacy-policy': 'yinsi-zhengce', 'terms-and-conditions': 'fuwu-tiaokuan' },
        bg: { about: 'za-nas', contact: 'kontakt', cookies: 'cookies', 'privacy-policy': 'politika-za-poveritelnost', 'terms-and-conditions': 'obshti-usloviya' },
        ca: { about: 'sobre-nosaltres', contact: 'contacte', cookies: 'cookies', 'privacy-policy': 'politica-de-privacitat', 'terms-and-conditions': 'termes-i-condicions' },
        nl: { about: 'over-ons', contact: 'contact', cookies: 'cookies', 'privacy-policy': 'privacybeleid', 'terms-and-conditions': 'algemene-voorwaarden' },
        el: { about: 'shetika', contact: 'epikoinonia', cookies: 'cookies', 'privacy-policy': 'politiki-aporritou', 'terms-and-conditions': 'oroi-chrisis' },
        hi: { about: 'hamare-baare-mein', contact: 'sampark', cookies: 'cookies', 'privacy-policy': 'gopaniyata-niti', 'terms-and-conditions': 'niyam-aur-sharten' },
        id: { about: 'tentang', contact: 'kontak', cookies: 'cookies', 'privacy-policy': 'kebijakan-privasi', 'terms-and-conditions': 'syarat-dan-ketentuan' },
        ms: { about: 'tentang-kami', contact: 'hubungi', cookies: 'cookies', 'privacy-policy': 'dasar-privasi', 'terms-and-conditions': 'terma-dan-syarat' },
        pl: { about: 'o-nas', contact: 'kontakt', cookies: 'cookies', 'privacy-policy': 'polityka-prywatnosci', 'terms-and-conditions': 'regulamin' },
        sv: { about: 'om-oss', contact: 'kontakt', cookies: 'cookies', 'privacy-policy': 'integritetspolicy', 'terms-and-conditions': 'villkor' },
        th: { about: 'kiew-kap-rao', contact: 'tidtaw', cookies: 'cookies', 'privacy-policy': 'nayobai-khwam-pensuantua', 'terms-and-conditions': 'khaw-taklong' },
        tr: { about: 'hakkimizda', contact: 'iletisim', cookies: 'cookies', 'privacy-policy': 'gizlilik-politikasi', 'terms-and-conditions': 'kullanim-kosullari' },
        uk: { about: 'pro-nas', contact: 'kontakty', cookies: 'cookies', 'privacy-policy': 'polityka-konfidentsiynosti', 'terms-and-conditions': 'umovy-vykorystannya' },
        vi: { about: 've-chung-toi', contact: 'lien-he', cookies: 'cookies', 'privacy-policy': 'chinh-sach-bao-mat', 'terms-and-conditions': 'dieu-khoan-su-dung' },
      }

      // Helper: build hreflang tags for static pages (about, contact, etc.)
      function staticHreflangTags(enPage) {
        let tags = ''
        const allLangs = ['en', ...supportedLangs]
        for (const l of allLangs) {
          const slug = (staticSlugMap[l] && staticSlugMap[l][enPage]) || enPage
          const href = l === 'en' ? base + '/' + enPage : base + '/' + l + '/' + slug + '/'
          tags += `    <link rel="alternate" hreflang="${l}" href="${href}" />\n`
        }
        tags += `    <link rel="alternate" hreflang="x-default" href="${base}/${enPage}" />\n`
        return tags
      }

      // Helper: build hreflang tags for a given English tool key (or null for homepage)
      function hreflangTags(enToolKey) {
        const isHome = !enToolKey
        let tags = ''
        const allLangs = ['en', ...supportedLangs]
        for (const l of allLangs) {
          let href
          if (isHome) {
            href = l === 'en' ? base + '/' : base + '/' + l + '/'
          } else {
            const slug = (slugMapByLang[l] && slugMapByLang[l][enToolKey]) || enToolKey
            href = l === 'en' ? base + '/' + enToolKey : base + '/' + l + '/' + slug + '/'
          }
          tags += `    <link rel="alternate" hreflang="${l}" href="${href}" />\n`
        }
        // x-default points to English
        const xHref = isHome ? base + '/' : base + '/' + enToolKey
        tags += `    <link rel="alternate" hreflang="x-default" href="${xHref}" />\n`
        return tags
      }

      // Inject meta description, hreflang, and JSON-LD into root index.html (English homepage)
      const enDescTag = homeDescByLang['en']
        ? `    <meta name="description" content="${homeDescByLang['en']}" />\n`
        : ''
      const enHomeUrl = base + '/'
      let enHomeHtml = injectSchemas(baseHtml, [orgSchema(enHomeUrl), siteSchema(enHomeUrl)])
      enHomeHtml = enHomeHtml.replace('</head>', enDescTag + hreflangTags(null) + '  </head>')
      writeFileSync(src, enHomeHtml)

      // Inject hreflang into English tool HTML files (e.g. dist/jpg-to-pdf.html)
      const enToolSlugs = [
        'jpg-to-png','png-to-jpg','jpg-to-webp','webp-to-jpg','png-to-webp','webp-to-png',
        'compress','resize','jpg-to-pdf','png-to-pdf','pdf-to-png',
        'gif-to-jpg','gif-to-png','bmp-to-jpg','bmp-to-png','tiff-to-jpg',
        'jpg-to-gif','png-to-gif','crop','rotate','flip','grayscale','watermark',
        'round-corners','meme-generator','blur-face','remove-background',
        'heic-to-jpg','image-to-ico','jpg-to-svg','html-to-image','merge-images','passport-photo','image-splitter','resize-in-kb','pixelate-image','svg-to-png','svg-to-jpg',
        'pdf-tools','merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers',
        'watermark-pdf','crop-pdf','protect-pdf','unlock-pdf','extract-images-pdf'
      ]
      for (const slug of enToolSlugs) {
        const toolFile = resolve(distDir, slug + '.html')
        if (existsSync(toolFile)) {
          let toolHtml = readFileSync(toolFile, 'utf-8')
          // Inject WebApplication JSON-LD; prefer the existing meta description,
          // fall back to the curated English description when the source HTML
          // doesn't carry a static <meta name="description"> (some image tools inject
          // it at runtime in JS, which the build-time scrape can't see).
          const metaDesc = extractMetaDesc(toolHtml)
          const toolDesc = metaDesc || TOOL_DESC_EN[slug] || ''
          const toolName = TOOL_NAME_EN[slug] || slug
          const toolUrl = base + '/' + slug
          toolHtml = injectSchemas(toolHtml, [appSchema({
            name: toolName, description: toolDesc, url: toolUrl, category: appCategoryFor(slug)
          })])
          toolHtml = toolHtml.replace('</head>', hreflangTags(slug) + '  </head>')
          writeFileSync(toolFile, toolHtml)
        }
      }

      // Inject hreflang into English static pages
      const enStaticPages = ['about', 'contact', 'cookies', 'privacy-policy', 'terms-and-conditions']
      for (const page of enStaticPages) {
        const staticFile = resolve(distDir, page + '.html')
        if (existsSync(staticFile)) {
          const html = readFileSync(staticFile, 'utf-8')
          const updated = html.replace('</head>', staticHreflangTags(page) + '  </head>')
          writeFileSync(staticFile, updated)
        }
      }

      for (const lang of supportedLangs) {
        // Replace lang="en" with the correct language and strip English canonical
        let langHtml = baseHtml.replace('lang="en"', `lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ''}`)
        langHtml = langHtml.replace(/<link rel="canonical"[^>]*\/>\n?/g, '')

        // Inject translated title and meta description into homepage
        let homeHtml = langHtml
        if (homeTitleByLang[lang]) {
          homeHtml = homeHtml.replace(/<title>[^<]*<\/title>/, `<title>${homeTitleByLang[lang]}</title>`)
        }
        const descTag = homeDescByLang[lang]
          ? `    <meta name="description" content="${homeDescByLang[lang]}" />\n`
          : ''
        // Inject Organization + WebSite JSON-LD with the language-prefixed home URL
        const langHomeUrl = base + '/' + lang + '/'
        homeHtml = injectSchemas(homeHtml, [orgSchema(langHomeUrl), siteSchema(langHomeUrl)])
        // Inject canonical, hreflang tags and meta description into <head>
        const homeCanonical = `    <link rel="canonical" href="${base}/${lang}/" />\n`
        homeHtml = homeHtml.replace('</head>', homeCanonical + descTag + hreflangTags(null) + '  </head>')

        // Create {lang}/index.html for homepage
        const langDir = resolve(distDir, lang)
        mkdirSync(langDir, { recursive: true })
        writeFileSync(resolve(langDir, 'index.html'), homeHtml)

        // Create {lang}/{slug}/index.html for each tool page
        const slugMap = slugMapByLang[lang] || {}
        for (const [enKey, localSlug] of Object.entries(slugMap)) {
          const toolCanonical = `    <link rel="canonical" href="${base}/${lang}/${localSlug}/" />\n`
          let toolHtml = langHtml.replace('</head>', toolCanonical + hreflangTags(enKey) + '  </head>')

          // For PDF tools, inject translated <title> and <meta description> from seoData
          if (seoByLangByTool[lang] && seoByLangByTool[lang][enKey]) {
            const seo = seoByLangByTool[lang][enKey]
            if (seo.h2b) {
              const newTitle = `${seo.h2b} | RelahConvert`
              toolHtml = toolHtml.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(newTitle)}</title>`)
            }
            const meta = sanitizeDesc(buildMetaDesc(seo.body))
            if (meta) {
              toolHtml = toolHtml.replace(/    <meta name="description"[^>]*\/>\n?/g, '')
              const metaTag = `    <meta name="description" content="${escAttr(meta)}" />\n`
              toolHtml = toolHtml.replace('</head>', metaTag + '  </head>')
            }
          }

          // Inject WebApplication JSON-LD; prefer the page's final meta description,
          // fall back to the curated English description if neither HTML nor i18n
          // produced one for this tool.
          const finalDesc = extractMetaDesc(toolHtml) || TOOL_DESC_EN[enKey] || ''
          const toolUrl = base + '/' + lang + '/' + localSlug + '/'
          const toolName = TOOL_NAME_EN[enKey] || enKey
          toolHtml = injectSchemas(toolHtml, [appSchema({
            name: toolName, description: finalDesc, url: toolUrl, category: appCategoryFor(enKey)
          })])

          const slugDir = resolve(distDir, lang, localSlug)
          mkdirSync(slugDir, { recursive: true })
          writeFileSync(resolve(slugDir, 'index.html'), toolHtml)
        }

        // Create {lang}/{translatedPage}/index.html for static pages
        const staticPages = ['about', 'contact', 'cookies', 'privacy-policy', 'terms-and-conditions']
        for (const page of staticPages) {
          const staticSrc = resolve(distDir, page + '.html')
          if (!existsSync(staticSrc)) continue
          let staticHtml = readFileSync(staticSrc, 'utf-8')
          staticHtml = staticHtml.replace('lang="en"', `lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ''}`)
          staticHtml = staticHtml.replace(/<link rel="canonical"[^>]*\/>\n?/g, '')
          staticHtml = staticHtml.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*\/>\n?/g, '')
          const translatedSlug = (staticSlugMap[lang] && staticSlugMap[lang][page]) || page
          const staticCanonical = `    <link rel="canonical" href="${base}/${lang}/${translatedSlug}/" />\n`
          staticHtml = staticHtml.replace('</head>', staticCanonical + staticHreflangTags(page) + '  </head>')
          const staticDir = resolve(distDir, lang, translatedSlug)
          mkdirSync(staticDir, { recursive: true })
          writeFileSync(resolve(staticDir, 'index.html'), staticHtml)
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [
    langRedirectPlugin(),
    langCopyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'RelahConvert',
        short_name: 'RelahConvert',
        description: 'Every image tool you need, free',
        theme_color: '#C84B31',
        background_color: '#18181b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,svg,png,jpg,woff,woff2}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/flagcdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'flag-icons', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main:                resolve(__dirname, 'index.html'),
        'jpg-to-png':        resolve(__dirname, 'jpg-to-png.html'),
        'png-to-jpg':        resolve(__dirname, 'png-to-jpg.html'),
        'jpg-to-webp':       resolve(__dirname, 'jpg-to-webp.html'),
        'webp-to-jpg':       resolve(__dirname, 'webp-to-jpg.html'),
        'png-to-webp':       resolve(__dirname, 'png-to-webp.html'),
        'webp-to-png':       resolve(__dirname, 'webp-to-png.html'),
        compress:            resolve(__dirname, 'compress.html'),
        resize:              resolve(__dirname, 'resize.html'),
        'jpg-to-pdf':        resolve(__dirname, 'jpg-to-pdf.html'),
        'png-to-pdf':        resolve(__dirname, 'png-to-pdf.html'),
        'pdf-to-png':        resolve(__dirname, 'pdf-to-png.html'),
        'gif-to-jpg':        resolve(__dirname, 'gif-to-jpg.html'),
        'gif-to-png':        resolve(__dirname, 'gif-to-png.html'),
        'bmp-to-jpg':        resolve(__dirname, 'bmp-to-jpg.html'),
        'bmp-to-png':        resolve(__dirname, 'bmp-to-png.html'),
        'tiff-to-jpg':       resolve(__dirname, 'tiff-to-jpg.html'),
        'jpg-to-gif':        resolve(__dirname, 'jpg-to-gif.html'),
        'png-to-gif':        resolve(__dirname, 'png-to-gif.html'),
        'crop':              resolve(__dirname, 'crop.html'),
        'rotate':            resolve(__dirname, 'rotate.html'),
        'flip':              resolve(__dirname, 'flip.html'),
        'grayscale':         resolve(__dirname, 'grayscale.html'),
        'watermark':         resolve(__dirname, 'watermark.html'),
        'round-corners':     resolve(__dirname, 'round-corners.html'),
        'meme-generator':    resolve(__dirname, 'meme-generator.html'),
        'blur-face':         resolve(__dirname, 'blur-face.html'),
        'remove-background': resolve(__dirname, 'remove-background.html'),
        'heic-to-jpg':       resolve(__dirname, 'heic-to-jpg.html'),
        'image-to-ico':      resolve(__dirname, 'image-to-ico.html'),
        'jpg-to-svg':        resolve(__dirname, 'jpg-to-svg.html'),
        'html-to-image':     resolve(__dirname, 'html-to-image.html'),
        'merge-images':      resolve(__dirname, 'merge-images.html'),
        'passport-photo':    resolve(__dirname, 'passport-photo.html'),
        'image-splitter':    resolve(__dirname, 'image-splitter.html'),
        'resize-in-kb':      resolve(__dirname, 'resize-in-kb.html'),
        'pixelate-image':    resolve(__dirname, 'pixelate-image.html'),
        'svg-to-png':        resolve(__dirname, 'svg-to-png.html'),
        'svg-to-jpg':        resolve(__dirname, 'svg-to-jpg.html'),
        'pdf-tools':         resolve(__dirname, 'pdf-tools.html'),
        'merge-pdf':         resolve(__dirname, 'merge-pdf.html'),
        'split-pdf':         resolve(__dirname, 'split-pdf.html'),
        'rotate-pdf':        resolve(__dirname, 'rotate-pdf.html'),
        'compress-pdf':      resolve(__dirname, 'compress-pdf.html'),
        'reorder-pdf':       resolve(__dirname, 'reorder-pdf.html'),
        'extract-pdf':       resolve(__dirname, 'extract-pdf.html'),
        'remove-pdf':        resolve(__dirname, 'remove-pdf.html'),
        'add-page-numbers':  resolve(__dirname, 'add-page-numbers.html'),
        'watermark-pdf':     resolve(__dirname, 'watermark-pdf.html'),
        'crop-pdf':          resolve(__dirname, 'crop-pdf.html'),
        'protect-pdf':       resolve(__dirname, 'protect-pdf.html'),
        'unlock-pdf':        resolve(__dirname, 'unlock-pdf.html'),
        'extract-images-pdf':resolve(__dirname, 'extract-images-pdf.html'),
        'account':           resolve(__dirname, 'account.html'),
      }
    }
  }
})
