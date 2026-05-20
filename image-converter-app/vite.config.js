import { defineConfig } from 'vite'
import { resolve } from 'path'
import { mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { VitePWA } from 'vite-plugin-pwa'

const supportedLangs = ['fr','es','pt','de','ar','it','ja','ru','ko','zh','zh-TW','bg','ca','nl','el','hi','id','ms','pl','sv','th','tr','uk','vi']

// ── Freshness signals (sitemap <lastmod>, JSON-LD dateModified, visible
// "Last updated" footer) — sourced from git so each tool's date reflects
// the latest commit that actually touched its content/code, not the
// build/deploy time. Cached so per-build cost stays one git invocation
// per unique path even when we look up the same tool across many URLs.
const __gitDateCache = new Map()
function gitDateFor(paths) {
  // paths: array of repo-relative file paths. Returns the most recent
  // commit date (YYYY-MM-DD) across them. Falls back to today if git isn't
  // available (e.g. shallow clone, build env without history) so callers
  // can use the result unconditionally.
  const key = Array.isArray(paths) ? paths.slice().sort().join('|') : String(paths)
  if (__gitDateCache.has(key)) return __gitDateCache.get(key)
  const list = Array.isArray(paths) ? paths : [paths]
  let best = ''
  for (const p of list) {
    try {
      const out = execSync(`git log -1 --format=%cs -- "${p}"`, { cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
      if (out && out > best) best = out
    } catch (_) { /* file may not exist or git unavailable — fall through */ }
  }
  if (!best) best = new Date().toISOString().slice(0, 10)
  __gitDateCache.set(key, best)
  return best
}
// Per-tool source-of-truth files. Changes to ANY of these bump that
// tool's lastmod. The shared bulk-pdf engine is included for Word/Excel
// so an engine bug fix also refreshes both tool pages.
function pathsForTool(slug) {
  const base = ['image-converter-app/src/core/i18n.js']
  const entry = `image-converter-app/src/tools/${slug}.js`
  const html  = `image-converter-app/${slug}.html`
  const extras = (slug === 'word-to-pdf' || slug === 'excel-to-pdf' || slug === 'powerpoint-to-pdf' ||
                  slug === 'pdf-to-word' || slug === 'pdf-to-excel' || slug === 'pdf-to-powerpoint' ||
                  slug === 'excel-to-word' || slug === 'word-to-excel' || slug === 'powerpoint-to-word')
    ? ['image-converter-app/src/tools/shared/bulk-pdf-tool.js']
    : []
  return [...base, entry, html, ...extras]
}
function lastModFor(slug) {
  if (!slug) return gitDateFor(['image-converter-app/src/core/i18n.js'])
  return gitDateFor(pathsForTool(slug))
}

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

      function escAttr(s) {
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      }

      // ── Schema.org JSON-LD helpers ──────────────────────────────────────
      const PDF_TOOL_SET = new Set([
        'pdf-tools','merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf',
        'extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf',
        'protect-pdf','unlock-pdf','extract-images-pdf','word-to-pdf','excel-to-pdf',
        'powerpoint-to-pdf','pdf-to-word','pdf-to-excel','pdf-to-powerpoint','excel-to-word','word-to-excel','powerpoint-to-word'
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
        'word-to-pdf':'Word to PDF',
        'excel-to-pdf':'Excel to PDF',
        'powerpoint-to-pdf':'PowerPoint to PDF',
        'pdf-to-word':'PDF to Word',
        'pdf-to-excel':'PDF to Excel',
        'pdf-to-powerpoint':'PDF to PowerPoint',
        'excel-to-word':'Excel to Word',
        'word-to-excel':'Word to Excel',
        'powerpoint-to-word':'PowerPoint to Word',
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
        'word-to-pdf':'Convert Word (.docx) documents to PDF online. Free Word to PDF converter.',
        'excel-to-pdf':'Convert one or multiple Excel files (.xlsx, .xls) to PDF online. Free bulk Excel to PDF converter.',
        'powerpoint-to-pdf':'Convert one or multiple PowerPoint files (.pptx, .ppt) to PDF online. Free bulk PowerPoint to PDF converter.',
        'pdf-to-word':'Convert one or multiple PDF files to editable Word (.docx) documents online. Free bulk PDF to Word converter.',
        'pdf-to-excel':'Convert one or multiple PDF files to editable Excel (.xlsx) spreadsheets online. Free bulk PDF to Excel converter.',
        'pdf-to-powerpoint':'Convert one or multiple PDF files to editable PowerPoint (.pptx) presentations online. Free bulk PDF to PowerPoint converter.',
        'excel-to-word':'Convert one or multiple Excel files (.xlsx, .xls) to editable Word (.docx) documents online. Free bulk Excel to Word converter.',
        'word-to-excel':'Convert one or multiple Word files (.docx) to editable Excel (.xlsx) spreadsheets online. Free bulk Word to Excel converter.',
        'powerpoint-to-word':'Convert one or multiple PowerPoint files (.pptx) to editable Word (.docx) documents online. Slide text and tables preserved. Free bulk PowerPoint to Word converter.',
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
        const schema = {
          '@context':'https://schema.org','@type':'WebApplication',
          name:opts.name,description:sanitizeDesc(opts.description),url:opts.url,
          applicationCategory:opts.category,operatingSystem:'Any',
          browserRequirements:'Requires JavaScript. Requires HTML5.',
          offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}
        }
        // Per-tool dateModified so Google has a structured freshness signal
        // alongside sitemap <lastmod> and the visible prerender footer.
        if (opts.slug) schema.dateModified = lastModFor(opts.slug)
        return schema
      }
      function injectSchemas(html, schemas) {
        const cleaned = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '')
        const scripts = schemas.map(s => `    <script type="application/ld+json">${JSON.stringify(s)}</script>\n`).join('')
        return cleaned.replace('</head>', scripts + '  </head>')
      }
      // ── Pre-render helpers (Phase 3 hybrid SSG) ─────────────────────────
      // Extract per-language SEO data (h2a, steps, h2b, body, h3why, why, faqs)
      // for ALL 51 tools, plus nav_short per lang per slug, plus hero/pdfhub keys.
      const ALL_TOOL_SLUGS = [
        'jpg-to-png','png-to-jpg','jpg-to-webp','webp-to-jpg','png-to-webp','webp-to-png',
        'compress','resize','jpg-to-pdf','png-to-pdf','pdf-to-png',
        'gif-to-jpg','gif-to-png','bmp-to-jpg','bmp-to-png','tiff-to-jpg',
        'jpg-to-gif','png-to-gif','crop','rotate','flip','grayscale','watermark',
        'round-corners','meme-generator','blur-face','remove-background',
        'heic-to-jpg','image-to-ico','jpg-to-svg','html-to-image','merge-images',
        'passport-photo','image-splitter','resize-in-kb','pixelate-image',
        'svg-to-png','svg-to-jpg',
        'pdf-tools','merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf',
        'extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf',
        'protect-pdf','unlock-pdf','extract-images-pdf','word-to-pdf','excel-to-pdf',
        'powerpoint-to-pdf','pdf-to-word','pdf-to-excel','pdf-to-powerpoint','excel-to-word','word-to-excel','powerpoint-to-word'
      ]

      function unescJs(s) { return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\') }
      function parseStringArray(str) {
        const items = []
        const re = /'((?:\\.|[^'\\])*)'/g
        let m
        while ((m = re.exec(str)) !== null) items.push(unescJs(m[1]))
        return items
      }
      function parseFaqs(str) {
        const faqs = []
        const re = /\{q:'((?:\\.|[^'\\])*)',a:'((?:\\.|[^'\\])*)'\}/g
        let m
        while ((m = re.exec(str)) !== null) faqs.push({ q: unescJs(m[1]), a: unescJs(m[2]) })
        return faqs
      }
      // Match a single OR double-quoted string value for a given key. i18n.js
      // uses double quotes when the value contains an apostrophe (e.g. h2b
      // for jpg-to-png is "...That Doesn't Upload..."). Returns the matched
      // string or '' if not found.
      function _matchValue(text, key) {
        const re = new RegExp(`${key}:(?:'((?:\\\\.|[^'\\\\])*)'|"((?:\\\\.|[^"\\\\])*)")`)
        const m = text.match(re)
        if (!m) return ''
        return unescJs(m[1] !== undefined ? m[1] : m[2])
      }
      // Parse a links:[{href:'X',label:'Y'},...] array, accepting both quote styles.
      function _parseLinks(arrInner) {
        const items = []
        // Match each {href:..., label:...} pair (single OR double quotes for each)
        const re = /\{href:(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")\s*,\s*label:(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")\}/g
        let m
        while ((m = re.exec(arrInner)) !== null) {
          const href = unescJs(m[1] !== undefined ? m[1] : m[2])
          const label = unescJs(m[3] !== undefined ? m[3] : m[4])
          items.push({ href, label })
        }
        return items
      }
      function extractToolSeo(block, tool) {
        const toolStart = block.indexOf("'" + tool + "':{")
        if (toolStart === -1) return null
        const windowEnd = block.indexOf("\n      '", toolStart + 1)
        const w = block.substring(toolStart, windowEnd === -1 ? toolStart + 12000 : windowEnd)
        const stepsM = w.match(/steps:\[((?:\\.|[^\]\\])*)\]/)
        const faqsM = w.match(/faqs:\[([\s\S]*?)\](?:,|\s*\n)/)
        const linksM = w.match(/links:\[((?:\{[^}]*\},?\s*)+)\]/)
        const h2a = _matchValue(w, 'h2a')
        if (!h2a) return null
        return {
          h2a,
          steps: stepsM ? parseStringArray(stepsM[1]) : [],
          h2b: _matchValue(w, 'h2b'),
          body: _matchValue(w, 'body'),
          h3why: _matchValue(w, 'h3why'),
          why: _matchValue(w, 'why'),
          faqs: faqsM ? parseFaqs(faqsM[1]) : [],
          links: linksM ? _parseLinks(linksM[1]) : [],
        }
      }
      // Build full SEO map: { lang: { slug: {...} } }
      const allSeoByLang = {}
      const navShortByLang = {}
      const heroByLang = {}     // { lang: { title1, title2, em, desc } }
      const pdfHubByLang = {}   // { lang: { hero1, hero2, em, desc } }
      for (const lang of allLangsForMeta) {
        const langKey = lang.includes('-') ? `'${lang}'` : lang
        let s = i18nSrc.indexOf('\n  ' + langKey + ':{')
        if (s === -1) s = i18nSrc.indexOf('\n  ' + langKey + ': {')
        if (s === -1) continue
        let e = i18nSrc.length
        for (const o of allLangsForMeta) {
          if (o === lang) continue
          const ok = o.includes('-') ? `'${o}'` : o
          let oi = i18nSrc.indexOf('\n  ' + ok + ':{', s + 1)
          if (oi === -1) oi = i18nSrc.indexOf('\n  ' + ok + ': {', s + 1)
          if (oi !== -1 && oi < e) e = oi
        }
        const block = i18nSrc.substring(s, e)
        // SEO per tool
        allSeoByLang[lang] = {}
        for (const tool of ALL_TOOL_SLUGS) {
          const data = extractToolSeo(block, tool)
          if (data) allSeoByLang[lang][tool] = data
        }
        // nav_short
        navShortByLang[lang] = {}
        const navIdx = block.indexOf('nav_short')
        if (navIdx !== -1) {
          const navEnd = block.indexOf('\n    }', navIdx)
          const navBlock = block.substring(navIdx, navEnd === -1 ? navIdx + 4000 : navEnd)
          const re = /'([a-z][a-z0-9-]*)':'((?:\\.|[^'\\])*)'/g
          let m
          while ((m = re.exec(navBlock)) !== null) navShortByLang[lang][m[1]] = unescJs(m[2])
        }
        // hero keys
        const ht1 = block.match(/hero_title_1:'((?:\\.|[^'\\])*)'/)
        const ht2 = block.match(/hero_title_2:'((?:\\.|[^'\\])*)'/)
        const htEm = block.match(/hero_title_em:'((?:\\.|[^'\\])*)'/)
        const hDesc = block.match(/hero_desc:'((?:\\.|[^'\\])*)'/)
        heroByLang[lang] = {
          title1: ht1 ? unescJs(ht1[1]) : '',
          title2: ht2 ? unescJs(ht2[1]) : '',
          em: htEm ? unescJs(htEm[1]) : '',
          desc: hDesc ? unescJs(hDesc[1]) : '',
        }
        // pdfhub keys
        const ph1 = block.match(/pdfhub_hero_1:'((?:\\.|[^'\\])*)'/)
        const ph2 = block.match(/pdfhub_hero_2:'((?:\\.|[^'\\])*)'/)
        const phEm = block.match(/pdfhub_hero_em:'((?:\\.|[^'\\])*)'/)
        const phDesc = block.match(/pdfhub_desc:'((?:\\.|[^'\\])*)'/)
        pdfHubByLang[lang] = {
          hero1: ph1 ? unescJs(ph1[1]) : '',
          hero2: ph2 ? unescJs(ph2[1]) : '',
          em: phEm ? unescJs(phEm[1]) : '',
          desc: phDesc ? unescJs(phDesc[1]) : '',
        }
      }

      // Static page H1 per language (hero_h1 doesn't exist in i18n.js yet)
      const STATIC_H1 = {
        en:    { about:'About RelahConvert',  contact:'Contact Us',  cookies:'Cookie Policy',  'privacy-policy':'Privacy Policy',  'terms-and-conditions':'Terms and Conditions' },
        fr:    { about:'À propos de RelahConvert', contact:'Contactez-nous', cookies:'Politique des cookies', 'privacy-policy':'Politique de confidentialité', 'terms-and-conditions':'Conditions générales' },
        es:    { about:'Acerca de RelahConvert',   contact:'Contáctenos',     cookies:'Política de cookies',  'privacy-policy':'Política de privacidad',     'terms-and-conditions':'Términos y condiciones' },
        pt:    { about:'Sobre o RelahConvert',     contact:'Contate-nos',     cookies:'Política de cookies',  'privacy-policy':'Política de privacidade',    'terms-and-conditions':'Termos e condições' },
        de:    { about:'Über RelahConvert',        contact:'Kontakt',         cookies:'Cookie-Richtlinie',    'privacy-policy':'Datenschutzrichtlinie',      'terms-and-conditions':'Allgemeine Geschäftsbedingungen' },
        ar:    { about:'حول RelahConvert',         contact:'اتصل بنا',         cookies:'سياسة ملفات تعريف الارتباط', 'privacy-policy':'سياسة الخصوصية',         'terms-and-conditions':'الشروط والأحكام' },
        it:    { about:'Chi siamo',                contact:'Contattaci',      cookies:'Politica sui cookie',  'privacy-policy':'Informativa sulla privacy',  'terms-and-conditions':'Termini e condizioni' },
        ja:    { about:'RelahConvertについて',     contact:'お問い合わせ',     cookies:'クッキーポリシー',     'privacy-policy':'プライバシーポリシー',       'terms-and-conditions':'利用規約' },
        ru:    { about:'О RelahConvert',           contact:'Контакты',        cookies:'Политика cookie',      'privacy-policy':'Политика конфиденциальности','terms-and-conditions':'Условия использования' },
        ko:    { about:'RelahConvert 소개',        contact:'문의하기',         cookies:'쿠키 정책',            'privacy-policy':'개인정보 처리방침',          'terms-and-conditions':'이용약관' },
        zh:    { about:'关于 RelahConvert',        contact:'联系我们',         cookies:'Cookie 政策',          'privacy-policy':'隐私政策',                   'terms-and-conditions':'服务条款' },
        'zh-TW':{ about:'關於 RelahConvert',       contact:'聯絡我們',         cookies:'Cookie 政策',          'privacy-policy':'隱私政策',                   'terms-and-conditions':'服務條款' },
        bg:    { about:'За RelahConvert',          contact:'Свържете се с нас', cookies:'Политика за бисквитки', 'privacy-policy':'Политика за поверителност', 'terms-and-conditions':'Общи условия' },
        ca:    { about:'Sobre RelahConvert',       contact:'Contacta\'ns',    cookies:'Política de cookies',  'privacy-policy':'Política de privacitat',     'terms-and-conditions':'Termes i condicions' },
        nl:    { about:'Over RelahConvert',        contact:'Contact',         cookies:'Cookiebeleid',         'privacy-policy':'Privacybeleid',              'terms-and-conditions':'Algemene voorwaarden' },
        el:    { about:'Σχετικά με το RelahConvert', contact:'Επικοινωνία',  cookies:'Πολιτική cookies',     'privacy-policy':'Πολιτική απορρήτου',         'terms-and-conditions':'Όροι χρήσης' },
        hi:    { about:'RelahConvert के बारे में', contact:'संपर्क करें',     cookies:'कुकी नीति',           'privacy-policy':'गोपनीयता नीति',              'terms-and-conditions':'नियम और शर्तें' },
        id:    { about:'Tentang RelahConvert',     contact:'Kontak',          cookies:'Kebijakan Cookie',     'privacy-policy':'Kebijakan Privasi',          'terms-and-conditions':'Syarat dan Ketentuan' },
        ms:    { about:'Tentang RelahConvert',     contact:'Hubungi Kami',    cookies:'Dasar Kuki',           'privacy-policy':'Dasar Privasi',              'terms-and-conditions':'Terma dan Syarat' },
        pl:    { about:'O RelahConvert',           contact:'Kontakt',         cookies:'Polityka cookies',     'privacy-policy':'Polityka prywatności',       'terms-and-conditions':'Regulamin' },
        sv:    { about:'Om RelahConvert',          contact:'Kontakt',         cookies:'Cookiepolicy',         'privacy-policy':'Integritetspolicy',          'terms-and-conditions':'Villkor' },
        th:    { about:'เกี่ยวกับ RelahConvert',    contact:'ติดต่อเรา',         cookies:'นโยบายคุกกี้',          'privacy-policy':'นโยบายความเป็นส่วนตัว',       'terms-and-conditions':'ข้อกำหนดและเงื่อนไข' },
        tr:    { about:'RelahConvert Hakkında',    contact:'İletişim',        cookies:'Çerez Politikası',     'privacy-policy':'Gizlilik Politikası',        'terms-and-conditions':'Kullanım Koşulları' },
        uk:    { about:'Про RelahConvert',         contact:'Контакти',        cookies:'Політика cookie',      'privacy-policy':'Політика конфіденційності',  'terms-and-conditions':'Умови використання' },
        vi:    { about:'Về RelahConvert',          contact:'Liên hệ',         cookies:'Chính sách cookie',    'privacy-policy':'Chính sách bảo mật',         'terms-and-conditions':'Điều khoản và điều kiện' },
      }

      function escTextHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      }
      // Build a localized href for an English tool slug or static-page slug.
      // 'home' returns the lang-specific homepage. Tool slugs translate via
      // slugMapByLang; static slugs translate via staticSlugMap. EN paths
      // use no trailing slash (matches our canonical convention); non-EN use
      // a trailing slash.
      function langHref(targetSlug, lang) {
        if (targetSlug === 'home' || targetSlug === '' || targetSlug === '/') {
          return lang === 'en' ? '/' : '/' + lang + '/'
        }
        const clean = targetSlug.replace(/^\//, '').replace(/\/$/, '')
        if (lang === 'en') return '/' + clean
        const toolSlug = slugMapByLang[lang] && slugMapByLang[lang][clean]
        if (toolSlug) return '/' + lang + '/' + toolSlug + '/'
        const staticSlug = staticSlugMap[lang] && staticSlugMap[lang][clean]
        if (staticSlug) return '/' + lang + '/' + staticSlug + '/'
        return '/' + lang + '/' + clean + '/'
      }
      // body and steps already contain HTML (e.g. <p>, <strong>) — pass through
      function buildToolPrerender(slug, lang) {
        const seo = (allSeoByLang[lang] && allSeoByLang[lang][slug]) ||
                    (allSeoByLang['en'] && allSeoByLang['en'][slug])
        const navName = (navShortByLang[lang] && navShortByLang[lang][slug]) ||
                        (navShortByLang['en'] && navShortByLang['en'][slug]) ||
                        TOOL_NAME_EN[slug] || slug
        // Header (logo home link), related tools, and footer links — gives the
        // prerender body real outgoing internal links so Ahrefs's "Page has no
        // outgoing links" doesn't fire on every tool page. Same set across all
        // tool pages, lang-aware hrefs.
        const homeHref = langHref('home', lang)
        const aboutHref = langHref('about', lang)
        const privHref = langHref('privacy-policy', lang)
        const termsHref = langHref('terms-and-conditions', lang)
        const sH1 = (STATIC_H1[lang] && STATIC_H1[lang]) || STATIC_H1.en
        const headerNav = `<nav class="rc-pr-header"><a href="${homeHref}">RelahConvert</a></nav>`
        const footerNav = `<nav class="rc-pr-footer"><a href="${aboutHref}">${escTextHtml(sH1.about || 'About')}</a> · <a href="${privHref}">${escTextHtml(sH1['privacy-policy'] || 'Privacy')}</a> · <a href="${termsHref}">${escTextHtml(sH1['terms-and-conditions'] || 'Terms')}</a></nav>`
        // Visible freshness signal in the prerender (and a machine-readable
        // <time datetime>). The .rc-prerender wrapper is hidden, so this is
        // here for non-JS crawlers and Google's HTML parser; rendered users
        // don't see it.
        const lastModDate = lastModFor(slug)
        const lastUpdated = `<p class="rc-last-updated">Last updated: <time datetime="${lastModDate}">${lastModDate}</time></p>`
        if (!seo) {
          const desc = TOOL_DESC_EN[slug] || ''
          return `<section class="rc-prerender" hidden>${headerNav}<h1>${escTextHtml(navName)}</h1><p>${escTextHtml(desc)}</p>${lastUpdated}${footerNav}</section>`
        }
        const stepsHtml = (seo.steps || []).map(s => `<li>${s}</li>`).join('')
        const faqsHtml = (seo.faqs || []).map(f => `<div class="rc-faq"><h4>${escTextHtml(f.q)}</h4><p>${escTextHtml(f.a)}</p></div>`).join('')
        // Related tools from seo.links — the same 4 internal-tool links the
        // runtime SEO section renders. href values in i18n.js are English
        // slugs (e.g. '/resize'); langHref translates per language.
        const linksList = (seo.links && seo.links.length)
          ? seo.links
          : ((allSeoByLang.en && allSeoByLang.en[slug] && allSeoByLang.en[slug].links) || [])
        const relatedHtml = linksList.length
          ? `<nav class="rc-pr-related">${linksList.slice(0, 4).map(l => `<a href="${langHref(l.href, lang)}">${escTextHtml(l.label)}</a>`).join(' · ')}</nav>`
          : ''
        const intro = (seo.body || '').replace(/<[^>]+>/g, '').slice(0, 240)
        return `<section class="rc-prerender" hidden>
  ${headerNav}
  <h1>${escTextHtml(navName)}</h1>
  <p class="rc-intro">${escTextHtml(intro)}</p>
  <h2>${escTextHtml(seo.h2a)}</h2>
  <ol>${stepsHtml}</ol>
  <h2>${escTextHtml(seo.h2b)}</h2>
  ${seo.body || ''}
  <h3>${escTextHtml(seo.h3why)}</h3>
  <p>${escTextHtml(seo.why)}</p>
  ${relatedHtml}
  ${faqsHtml}
  ${lastUpdated}
  ${footerNav}
</section>`
      }
      function buildHomePrerender(lang) {
        const h = heroByLang[lang] || heroByLang['en'] || {}
        const t1 = h.title1 || 'Every image tool'
        const t2 = h.title2 || 'you need,'
        const em = h.em || 'free'
        const desc = h.desc || ''
        return { t1, t2, em, desc }
      }
      function buildPdfHubPrerender(lang) {
        const p = pdfHubByLang[lang] || pdfHubByLang['en'] || {}
        const h1 = p.hero1 || 'Every PDF tool'
        const h2 = p.hero2 || 'you need,'
        const em = p.em || 'free'
        const desc = p.desc || 'Edit, organize, and optimize your PDF documents instantly.'
        return { h1, h2, em, desc }
      }

      // Inject pre-rendered content into a tool/hub HTML by replacing the
      // <div id="app">...</div> with <div id="app">${prerender}</div>. JS will
      // overwrite this on load with the interactive UI.
      // Matches both the empty form and a previously-filled form so the
      // per-language loop can overwrite the English prerender written earlier.
      function injectAppPrerender(html, prerenderHtml) {
        return html.replace(/<div id="app">[\s\S]*?<\/div>(\s*<\/body>)/, `<div id="app">${prerenderHtml}</div>$1`)
      }
      // For homepage: fill the empty hero H1 + description elements
      function injectHomePrerender(html, lang) {
        const { t1, t2, em, desc } = buildHomePrerender(lang)
        let out = html.replace(
          /<h1 id="heroTitle"><\/h1>/,
          `<h1 id="heroTitle">${escTextHtml(t1)}<br>${escTextHtml(t2)} <em>${escTextHtml(em)}</em></h1>`
        )
        out = out.replace(
          /<p[^>]*id="heroDesc"[^>]*><\/p>/,
          (match) => match.replace(/><\/p>/, `>${escTextHtml(desc)}</p>`)
        )
        return out
      }
      // For PDF hub: build a prerender block matching its hub structure and
      // inject into #app. Includes header logo, links to all 13 PDF tools,
      // and footer links so Ahrefs sees outgoing-link structure.
      function buildPdfHubBlock(lang) {
        const { h1, h2, em, desc } = buildPdfHubPrerender(lang)
        const homeHref = langHref('home', lang)
        const aboutHref = langHref('about', lang)
        const privHref = langHref('privacy-policy', lang)
        const termsHref = langHref('terms-and-conditions', lang)
        const sH1 = (STATIC_H1[lang] && STATIC_H1[lang]) || STATIC_H1.en
        const PDF_SLUGS = ['merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers','watermark-pdf','crop-pdf','protect-pdf','unlock-pdf','extract-images-pdf','word-to-pdf','excel-to-pdf','powerpoint-to-pdf','pdf-to-word','pdf-to-excel','pdf-to-powerpoint','excel-to-word','word-to-excel','powerpoint-to-word']
        const toolLinks = PDF_SLUGS.map(s => {
          const label = (navShortByLang[lang] && navShortByLang[lang][s]) ||
                        (navShortByLang.en && navShortByLang.en[s]) ||
                        TOOL_NAME_EN[s] || s
          return `<a href="${langHref(s, lang)}">${escTextHtml(label)}</a>`
        }).join(' · ')
        return `<section class="rc-prerender" hidden>
  <nav class="rc-pr-header"><a href="${homeHref}">RelahConvert</a></nav>
  <h1>${escTextHtml(h1)}<br>${escTextHtml(h2)} <em>${escTextHtml(em)}</em></h1>
  <p>${escTextHtml(desc)}</p>
  <nav class="rc-pr-tools">${toolLinks}</nav>
  <nav class="rc-pr-footer"><a href="${aboutHref}">${escTextHtml(sH1.about || 'About')}</a> · <a href="${privHref}">${escTextHtml(sH1['privacy-policy'] || 'Privacy')}</a> · <a href="${termsHref}">${escTextHtml(sH1['terms-and-conditions'] || 'Terms')}</a></nav>
</section>`
      }
      // For static pages (about, contact, etc.): fill the hero H1. Matches
      // empty AND already-filled <h1 id="heroH1"> so per-language injection
      // can replace the English value left by the earlier English pass.
      function injectStaticH1(html, page, lang) {
        const map = STATIC_H1[lang] || STATIC_H1['en']
        const h1 = (map && map[page]) || (STATIC_H1['en'][page]) || page
        return html.replace(/<h1 id="heroH1">[^<]*<\/h1>/, `<h1 id="heroH1">${escTextHtml(h1)}</h1>`)
      }

      // ── OG / Twitter card helpers ───────────────────────────────────────
      // og:locale per language. Underscored POSIX-style as required by spec.
      const LOCALE_MAP = {
        en: 'en_US', fr: 'fr_FR', es: 'es_ES', pt: 'pt_PT', de: 'de_DE',
        ar: 'ar_AR', it: 'it_IT', ja: 'ja_JP', ru: 'ru_RU', ko: 'ko_KR',
        zh: 'zh_CN', 'zh-TW': 'zh_TW', bg: 'bg_BG', ca: 'ca_ES', nl: 'nl_NL',
        el: 'el_GR', hi: 'hi_IN', id: 'id_ID', ms: 'ms_MY', pl: 'pl_PL',
        sv: 'sv_SE', th: 'th_TH', tr: 'tr_TR', uk: 'uk_UA', vi: 'vi_VN',
      }
      // Square 512×512 stopgap; swap to a 1200×630 og-image.png later and
      // change TWITTER_CARD to 'summary_large_image' at the same time.
      const OG_IMAGE_URL = 'https://relahconvert.com/pwa-512x512.png'
      const TWITTER_CARD = 'summary'

      // Mirror runtime _TOOL_KEY_OVERRIDES from src/core/i18n.js so build-time
      // title/meta resolution matches setToolMeta() exactly.
      const TOOL_KEY_OVERRIDES = {
        'compress':           { title: 'compress_page_title',     desc: 'compress_meta_desc' },
        'resize':             { title: 'resize_page_title',       desc: 'resize_meta_desc' },
        'jpg-to-pdf':         { title: 'jpgpdf_page_title',       desc: 'jpgpdf_meta_desc' },
        'png-to-pdf':         { title: 'pngpdf_page_title',       desc: 'pngpdf_meta_desc' },
        'passport-photo':     { title: 'pp_page_title',           desc: 'pp_meta_desc' },
        'pixelate-image':     { title: 'pix_page_title',          desc: 'pix_meta_desc' },
        'resize-in-kb':       { title: 'rik_page_title',          desc: 'rik_meta_desc' },
        'svg-to-png':         { title: 'svgpng_page_title',       desc: 'svgpng_meta_desc' },
        'svg-to-jpg':         { title: 'svgjpg_page_title',       desc: 'svgjpg_meta_desc' },
        'remove-background':  { title: 'rb_page_title',           desc: 'rb_meta_desc' },
        'pdf-tools':          { title: 'pdftools_page_title',     desc: 'pdftools_meta_desc' },
        'merge-pdf':          { title: 'mergepdf_page_title',     desc: 'mergepdf_meta_desc' },
        'split-pdf':          { title: 'splitpdf_page_title',     desc: 'splitpdf_meta_desc' },
        'rotate-pdf':         { title: 'rotpdf_page_title',       desc: 'rotpdf_meta_desc' },
        'compress-pdf':       { title: 'compresspdf_page_title',  desc: 'compresspdf_meta_desc' },
        'reorder-pdf':        { title: 'reorderpdf_page_title',   desc: 'reorderpdf_meta_desc' },
        'extract-pdf':        { title: 'extractpdf_page_title',   desc: 'extractpdf_meta_desc' },
        'remove-pdf':         { title: 'removepdf_page_title',    desc: 'removepdf_meta_desc' },
        'add-page-numbers':   { title: 'addpgnum_page_title',     desc: 'addpgnum_meta_desc' },
        'watermark-pdf':      { title: 'wmpdf_page_title',        desc: 'wmpdf_meta_desc' },
        'crop-pdf':           { title: 'croppdf_page_title',      desc: 'croppdf_meta_desc' },
        'protect-pdf':        { title: 'protpdf_page_title',      desc: 'protpdf_meta_desc' },
        'unlock-pdf':         { title: 'unlkpdf_page_title',      desc: 'unlkpdf_meta_desc' },
        'extract-images-pdf': { title: 'extimg_page_title',       desc: 'extimg_meta_desc' },
        'word-to-pdf':        { title: 'wordpdf_page_title',      desc: 'wordpdf_meta_desc' },
        'excel-to-pdf':       { title: 'excelpdf_page_title',     desc: 'excelpdf_meta_desc' },
        'powerpoint-to-pdf':  { title: 'pptpdf_page_title',       desc: 'pptpdf_meta_desc' },
        'pdf-to-word':        { title: 'pdfword_page_title',      desc: 'pdfword_meta_desc' },
        'pdf-to-excel':       { title: 'pdfexcel_page_title',     desc: 'pdfexcel_meta_desc' },
        'pdf-to-powerpoint':  { title: 'pdfppt_page_title',       desc: 'pdfppt_meta_desc' },
        'excel-to-word':      { title: 'excelword_page_title',    desc: 'excelword_meta_desc' },
        'word-to-excel':      { title: 'wordexcel_page_title',    desc: 'wordexcel_meta_desc' },
        'powerpoint-to-word': { title: 'pptword_page_title',      desc: 'pptword_meta_desc' },
      }
      // Static page key in vite.config (URL slug) → key inside the i18n.js lang block
      const STATIC_PAGE_I18N_KEY = {
        'about': 'about',
        'contact': 'contact',
        'privacy-policy': 'privacy',
        'terms-and-conditions': 'terms',
        'cookies': 'cookies',
      }

      // Extract per-lang flat keys (compresspdf_page_title etc.) and static
      // page sub-objects (about.title, about.hero_p, …) from i18n.js so we
      // can resolve translated title/desc at build time.
      // i18n.js uses BOTH single and double quotes for string values
      // (double-quoted when the value contains an apostrophe, e.g. fr's
      // hero_p:"Des outils d'image gratuits..."). Helpers handle both.
      function _matchKeyValue(text, key) {
        const re = new RegExp(`(?:^|[^a-zA-Z0-9_])${key}:(?:'((?:\\\\.|[^'\\\\])*)'|"((?:\\\\.|[^"\\\\])*)")`)
        const m = text.match(re)
        if (!m) return null
        return unescJs(m[1] !== undefined ? m[1] : m[2])
      }
      const flatKeysByLang = {}
      const staticPageByLang = {}
      const FLAT_KEY_NAMES = [...new Set(
        Object.values(TOOL_KEY_OVERRIDES).flatMap(v => [v.title, v.desc])
      )]
      for (const lang of allLangsForMeta) {
        const langKey2 = lang.includes('-') ? `'${lang}'` : lang
        let s = i18nSrc.indexOf('\n  ' + langKey2 + ':{')
        if (s === -1) s = i18nSrc.indexOf('\n  ' + langKey2 + ': {')
        if (s === -1) continue
        let e = i18nSrc.length
        for (const o of allLangsForMeta) {
          if (o === lang) continue
          const ok = o.includes('-') ? `'${o}'` : o
          let oi = i18nSrc.indexOf('\n  ' + ok + ':{', s + 1)
          if (oi === -1) oi = i18nSrc.indexOf('\n  ' + ok + ': {', s + 1)
          if (oi !== -1 && oi < e) e = oi
        }
        const block = i18nSrc.substring(s, e)
        flatKeysByLang[lang] = {}
        for (const k of FLAT_KEY_NAMES) {
          const v = _matchKeyValue(block, k)
          if (v !== null) flatKeysByLang[lang][k] = v
        }
        staticPageByLang[lang] = {}
        for (const pageKey of ['about', 'contact', 'privacy', 'terms', 'cookies']) {
          const re = new RegExp(`(?:^|[^a-zA-Z0-9_])${pageKey}:\\{([^{}]*)\\}`)
          const m = block.match(re)
          if (!m) continue
          const inner = m[1]
          staticPageByLang[lang][pageKey] = {
            title: _matchKeyValue(inner, 'title') || '',
            hero_p: _matchKeyValue(inner, 'hero_p') || '',
          }
        }
      }

      function _stripHtmlForMeta(s) { return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }
      // Truncate at last word boundary at or before `max` chars. Never cuts
      // mid-word. If the string fits, returns as-is.
      function _truncateForMeta(s, max) {
        if (!s) return ''
        if (s.length <= max) return s
        const slice = s.substring(0, max)
        const lastDot = slice.lastIndexOf('. ')
        if (lastDot > 80) return slice.substring(0, lastDot + 1).trim()
        const lastSpace = slice.lastIndexOf(' ')
        return (lastSpace > 0 ? slice.substring(0, lastSpace) : slice).trim()
      }
      // Title cap: optimize for human readability over Ahrefs's 60-char rule.
      //   ≤65 chars → use as-is.
      //   >65 chars → only truncate if a CLAUSE boundary (period, em-dash,
      //               colon, " | ", or " — ") falls in [40, 65). Truncate
      //               there. Otherwise, return as-is — longer-but-natural
      //               beats awkward mid-phrase cuts.
      function _capTitle(s) {
        if (!s) return s
        if (s.length <= 65) return s
        // Try strong clause boundaries first (in order of preference)
        const candidates = []
        const probes = [
          { sep: '. ',  adj: 1 },  // end of sentence — keep the period
          { sep: ' — ', adj: 0 },  // em-dash separator — drop both
          { sep: ' – ', adj: 0 },  // en-dash separator
          { sep: ' | ', adj: 0 },  // pipe separator
          { sep: ': ',  adj: 1 },  // colon — keep
        ]
        for (const { sep, adj } of probes) {
          const idx = s.lastIndexOf(sep, 65)
          if (idx >= 40) candidates.push(s.substring(0, idx + adj).trim())
        }
        // Pick the longest candidate that fits within 65 — fewer omissions = closer to author intent
        const best = candidates
          .filter(c => c.length <= 65)
          .sort((a, b) => b.length - a.length)[0]
        return best || s
      }
      // Tool title resolution. Drops the " | RelahConvert" suffix when seo.h2b
      // is already ≥45 chars — at that length the suffix tips most titles past
      // the 60-char Ahrefs threshold without adding signal. Caps at 60 chars
      // at a word boundary in all branches.
      function buildToolTitle(slug, lang) {
        const flat = flatKeysByLang[lang] || {}
        const ovKey = TOOL_KEY_OVERRIDES[slug] && TOOL_KEY_OVERRIDES[slug].title
        if (ovKey && flat[ovKey]) return _capTitle(sanitizeDesc(flat[ovKey]))
        const seo = allSeoByLang[lang] && allSeoByLang[lang][slug]
        if (seo && seo.h2b) {
          const h = sanitizeDesc(seo.h2b)
          return _capTitle(h.length >= 45 ? h : h + ' | RelahConvert')
        }
        const enSeo = allSeoByLang['en'] && allSeoByLang['en'][slug]
        if (enSeo && enSeo.h2b) {
          const h = sanitizeDesc(enSeo.h2b)
          return _capTitle(h.length >= 45 ? h : h + ' | RelahConvert')
        }
        return 'RelahConvert'
      }
      // Meta description resolution. Caps at 155 chars (Ahrefs flags >160).
      // Applies the cap to flat-key overrides too — many *_meta_desc values
      // in i18n.js exceed 160 chars and were previously bypassing truncation.
      function buildToolMetaDesc(slug, lang) {
        const flat = flatKeysByLang[lang] || {}
        const ovKey = TOOL_KEY_OVERRIDES[slug] && TOOL_KEY_OVERRIDES[slug].desc
        if (ovKey && flat[ovKey]) return sanitizeDesc(_truncateForMeta(_stripHtmlForMeta(flat[ovKey]), 155))
        const seo = allSeoByLang[lang] && allSeoByLang[lang][slug]
        if (seo && seo.body) return sanitizeDesc(_truncateForMeta(_stripHtmlForMeta(seo.body), 155))
        return TOOL_DESC_EN[slug] || ''
      }

      // Replace or insert <title> and <meta name="description"> at build time
      // so per-lang static HTML response matches the post-JS DOM. Strip ALL
      // existing description tags first (regardless of indent or self-closing
      // style) so static-HTML hardcoded ones don't survive.
      function setTitleAndDesc(html, title, description) {
        let out = html
        if (title) {
          if (/<title>[^<]*<\/title>/.test(out)) {
            out = out.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`)
          } else {
            out = out.replace('</head>', `    <title>${escAttr(title)}</title>\n  </head>`)
          }
        }
        if (description) {
          out = out.replace(/[ \t]*<meta\s+name=["']description["'][^>]*\/?>[ \t]*\n?/gi, '')
          out = out.replace('</head>', `    <meta name="description" content="${escAttr(description)}" />\n  </head>`)
        }
        return out
      }

      // Inject OG + Twitter card tags. Idempotent — strips any existing OG /
      // twitter:* tags first so a re-run produces clean output.
      function injectOgTwitter(html, opts) {
        const t = escAttr(opts.title || 'RelahConvert')
        const d = escAttr(opts.description || '')
        const u = escAttr(opts.url || '')
        const l = escAttr(opts.locale || 'en_US')
        const type = escAttr(opts.type || 'website')
        const tags = [
          `    <meta property="og:title" content="${t}" />`,
          `    <meta property="og:description" content="${d}" />`,
          `    <meta property="og:image" content="${OG_IMAGE_URL}" />`,
          `    <meta property="og:url" content="${u}" />`,
          `    <meta property="og:type" content="${type}" />`,
          `    <meta property="og:site_name" content="RelahConvert" />`,
          `    <meta property="og:locale" content="${l}" />`,
          `    <meta name="twitter:card" content="${TWITTER_CARD}" />`,
          `    <meta name="twitter:title" content="${t}" />`,
          `    <meta name="twitter:description" content="${d}" />`,
          `    <meta name="twitter:image" content="${OG_IMAGE_URL}" />`,
          '',
        ].join('\n')
        const cleaned = html
          .replace(/    <meta property="og:[^>]*\/>\n?/g, '')
          .replace(/    <meta name="twitter:[^>]*\/>\n?/g, '')
        return cleaned.replace('</head>', tags + '  </head>')
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
      // Pre-render: fill empty hero H1 and description with English hero values
      enHomeHtml = injectHomePrerender(enHomeHtml, 'en')
      // OG / Twitter cards
      enHomeHtml = injectOgTwitter(enHomeHtml, {
        title: homeTitleByLang['en'] || 'RelahConvert — File Converter & Editor',
        description: homeDescByLang['en'] || '',
        url: enHomeUrl,
        locale: LOCALE_MAP.en,
        type: 'website',
      })
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
        'watermark-pdf','crop-pdf','protect-pdf','unlock-pdf','extract-images-pdf','word-to-pdf','excel-to-pdf','powerpoint-to-pdf',
        'pdf-to-word','pdf-to-excel','pdf-to-powerpoint','excel-to-word','word-to-excel'
      ]
      for (const slug of enToolSlugs) {
        const toolFile = resolve(distDir, slug + '.html')
        if (existsSync(toolFile)) {
          let toolHtml = readFileSync(toolFile, 'utf-8')
          // Build-time-resolve translated title/desc using same logic as runtime
          // setToolMeta(). Source HTML titles are stale (e.g. compress.html ships
          // "Compress Image Free - RelahConvert") — we override with the seo-derived
          // value so static HTML matches what setToolMeta would produce post-JS.
          const enToolTitle = buildToolTitle(slug, 'en')
          const enToolDesc = buildToolMetaDesc(slug, 'en')
          toolHtml = setTitleAndDesc(toolHtml, enToolTitle, enToolDesc)
          const toolName = TOOL_NAME_EN[slug] || slug
          const toolUrl = base + '/' + slug
          toolHtml = injectSchemas(toolHtml, [appSchema({
            name: toolName, description: enToolDesc, url: toolUrl, category: appCategoryFor(slug), slug
          })])
          toolHtml = toolHtml.replace('</head>', hreflangTags(slug) + '  </head>')
          // Pre-render: inject H1 + SEO content into the empty <div id="app">
          const prerender = slug === 'pdf-tools'
            ? buildPdfHubBlock('en')
            : buildToolPrerender(slug, 'en')
          toolHtml = injectAppPrerender(toolHtml, prerender)
          // OG / Twitter cards
          toolHtml = injectOgTwitter(toolHtml, {
            title: enToolTitle,
            description: enToolDesc,
            url: toolUrl,
            locale: LOCALE_MAP.en,
            type: 'website',
          })
          writeFileSync(toolFile, toolHtml)
        }
      }

      // Inject hreflang and pre-rendered H1 into English static pages
      const enStaticPages = ['about', 'contact', 'cookies', 'privacy-policy', 'terms-and-conditions']
      for (const page of enStaticPages) {
        const staticFile = resolve(distDir, page + '.html')
        if (existsSync(staticFile)) {
          let html = readFileSync(staticFile, 'utf-8')
          html = html.replace('</head>', staticHreflangTags(page) + '  </head>')
          html = injectStaticH1(html, page, 'en')
          // Translated title/desc + OG/Twitter cards from i18n.js static page entries
          const i18nKey = STATIC_PAGE_I18N_KEY[page]
          const sp = (staticPageByLang.en && staticPageByLang.en[i18nKey]) || {}
          const staticTitle = sp.title || (STATIC_H1.en[page] + ' | RelahConvert')
          const staticDesc = sp.hero_p || ''
          html = setTitleAndDesc(html, staticTitle, staticDesc)
          html = injectOgTwitter(html, {
            title: staticTitle,
            description: staticDesc,
            url: base + '/' + page,
            locale: LOCALE_MAP.en,
            type: 'website',
          })
          writeFileSync(staticFile, html)
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
        // Pre-render: fill empty hero H1 and description with the lang's hero values
        homeHtml = injectHomePrerender(homeHtml, lang)
        // OG / Twitter cards
        homeHtml = injectOgTwitter(homeHtml, {
          title: homeTitleByLang[lang] || homeTitleByLang['en'] || 'RelahConvert',
          description: homeDescByLang[lang] || homeDescByLang['en'] || '',
          url: langHomeUrl,
          locale: LOCALE_MAP[lang] || LOCALE_MAP.en,
          type: 'website',
        })

        // Create {lang}/index.html for homepage
        const langDir = resolve(distDir, lang)
        mkdirSync(langDir, { recursive: true })
        writeFileSync(resolve(langDir, 'index.html'), homeHtml)

        // Create {lang}/{slug}/index.html for each tool page.
        // Use the English tool's compiled HTML as the base (NOT the homepage)
        // so per-language tool pages have the same simple <div id="app"></div>
        // structure — no homepage shell, no body-wipe FOUC, prerender survives
        // until the tool module replaces #app.
        const slugMap = slugMapByLang[lang] || {}
        for (const [enKey, localSlug] of Object.entries(slugMap)) {
          const enToolFile = resolve(distDir, enKey + '.html')
          if (!existsSync(enToolFile)) continue

          // Read the freshly-built English tool HTML (Vite has already
          // resolved its script/style tags to /assets/* hashed filenames).
          // We cleanse it of English-specific head tags before re-injecting
          // language-specific ones below.
          let toolHtml = readFileSync(enToolFile, 'utf-8')
          toolHtml = toolHtml.replace('lang="en"', `lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ''}`)
          toolHtml = toolHtml.replace(/<link rel="canonical"[^>]*\/>\n?/g, '')
          toolHtml = toolHtml.replace(/<link rel="alternate" hreflang="[^"]*"[^>]*\/>\n?/g, '')
          toolHtml = toolHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '')

          const toolCanonical = `    <link rel="canonical" href="${base}/${lang}/${localSlug}/" />\n`
          toolHtml = toolHtml.replace('</head>', toolCanonical + hreflangTags(enKey) + '  </head>')

          // Universal build-time title/desc translation (replaces the old
          // PDF-only override). Uses the same getToolTitle/getToolMetaDesc
          // logic as runtime setToolMeta() so static HTML matches post-JS DOM.
          const langToolTitle = buildToolTitle(enKey, lang)
          const langToolDesc = buildToolMetaDesc(enKey, lang)
          toolHtml = setTitleAndDesc(toolHtml, langToolTitle, langToolDesc)

          const toolUrl = base + '/' + lang + '/' + localSlug + '/'
          const toolName = TOOL_NAME_EN[enKey] || enKey
          toolHtml = injectSchemas(toolHtml, [appSchema({
            name: toolName, description: langToolDesc, url: toolUrl, category: appCategoryFor(enKey), slug: enKey
          })])

          // Pre-render: tool HTML has <div id="app"></div> — inject the
          // language-specific H1 + SEO block inside it. The tool module will
          // replace #app at runtime, but the static HTML response carries
          // the prerender for non-JS crawlers and Google's first wave.
          const langPrerender = enKey === 'pdf-tools'
            ? buildPdfHubBlock(lang)
            : buildToolPrerender(enKey, lang)
          toolHtml = injectAppPrerender(toolHtml, langPrerender)

          // OG / Twitter cards
          toolHtml = injectOgTwitter(toolHtml, {
            title: langToolTitle,
            description: langToolDesc,
            url: toolUrl,
            locale: LOCALE_MAP[lang] || LOCALE_MAP.en,
            type: 'website',
          })

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
          const translatedSlugLocal = (staticSlugMap[lang] && staticSlugMap[lang][page]) || page
          const staticCanonical = `    <link rel="canonical" href="${base}/${lang}/${translatedSlugLocal}/" />\n`
          staticHtml = staticHtml.replace('</head>', staticCanonical + staticHreflangTags(page) + '  </head>')
          // Pre-render: fill empty static page H1 with translated title
          staticHtml = injectStaticH1(staticHtml, page, lang)
          // Translated title/desc from i18n.js + OG/Twitter cards. Falls back
          // to STATIC_H1 + " | RelahConvert" if i18n.js doesn't have a title
          // for this lang/page combination.
          const i18nKey = STATIC_PAGE_I18N_KEY[page]
          const sp = (staticPageByLang[lang] && staticPageByLang[lang][i18nKey]) || {}
          const enSp = (staticPageByLang.en && staticPageByLang.en[i18nKey]) || {}
          const fallbackH1 = (STATIC_H1[lang] && STATIC_H1[lang][page]) || (STATIC_H1.en && STATIC_H1.en[page]) || page
          const staticTitle = sp.title || enSp.title || (fallbackH1 + ' | RelahConvert')
          const staticDesc = sp.hero_p || enSp.hero_p || ''
          staticHtml = setTitleAndDesc(staticHtml, staticTitle, staticDesc)
          const staticUrl = base + '/' + lang + '/' + translatedSlugLocal + '/'
          staticHtml = injectOgTwitter(staticHtml, {
            title: staticTitle,
            description: staticDesc,
            url: staticUrl,
            locale: LOCALE_MAP[lang] || LOCALE_MAP.en,
            type: 'website',
          })
          const staticDir = resolve(distDir, lang, translatedSlugLocal)
          mkdirSync(staticDir, { recursive: true })
          writeFileSync(resolve(staticDir, 'index.html'), staticHtml)
        }
      }

      // ── Sitemap freshness: patch <lastmod> in dist/sitemap.xml per URL ──
      // We don't regenerate the sitemap (it's hand-maintained at 43k lines);
      // we just walk each <url> block, work out which tool/page the <loc>
      // points at, and replace its <lastmod> with the latest git commit date
      // for that tool's relevant files. Source public/sitemap.xml is
      // untouched — only dist/sitemap.xml is rewritten, so re-running the
      // build with no source changes is a no-op.
      try {
        const sitemapPath = resolve(distDir, 'sitemap.xml')
        if (existsSync(sitemapPath)) {
          let xml = readFileSync(sitemapPath, 'utf-8')
          // Reverse slugMapByLang → look up English key from a translated slug
          const slugToEn = {}
          for (const lang of supportedLangs) {
            const m = slugMapByLang[lang] || {}
            for (const [enKey, locSlug] of Object.entries(m)) {
              slugToEn[`${lang}/${locSlug}`] = enKey
            }
          }
          const homepageDate = lastModFor('') // i18n.js root signal
          // Map a URL path to its English tool slug (or '' for non-tool pages).
          function slugFromPath(pathOnly) {
            const clean = pathOnly.replace(/^\/|\/$/g, '')
            if (clean === '') return ''                                 // homepage
            const segs = clean.split('/')
            if (segs.length === 1) {
              // EN URL like /word-to-pdf — direct
              return segs[0]
            }
            // Lang-prefixed: /fr/word-vers-pdf → look up via reverse map
            const key = `${segs[0]}/${segs[1]}`
            return slugToEn[key] || segs[1]
          }
          xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
            const locM = block.match(/<loc>([^<]+)<\/loc>/)
            if (!locM) return block
            let pathOnly
            try { pathOnly = new URL(locM[1]).pathname } catch (_) { return block }
            const slug = slugFromPath(pathOnly)
            const date = slug ? lastModFor(slug) : homepageDate
            if (/<lastmod>[^<]*<\/lastmod>/.test(block)) {
              return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`)
            }
            // No <lastmod> in this entry — insert one right after <loc> so
            // the resulting order is loc → lastmod → changefreq → priority
            // (the convention the rest of the sitemap already uses).
            return block.replace(/(<loc>[^<]+<\/loc>)(\s*)/, `$1$2<lastmod>${date}</lastmod>$2`)
          })
          writeFileSync(sitemapPath, xml)
        }
      } catch (e) {
        console.warn('[sitemap-lastmod] patch skipped:', e && e.message || e)
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
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
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
        'word-to-pdf':       resolve(__dirname, 'word-to-pdf.html'),
        'excel-to-pdf':      resolve(__dirname, 'excel-to-pdf.html'),
        'powerpoint-to-pdf': resolve(__dirname, 'powerpoint-to-pdf.html'),
        'pdf-to-word':       resolve(__dirname, 'pdf-to-word.html'),
        'pdf-to-excel':      resolve(__dirname, 'pdf-to-excel.html'),
        'pdf-to-powerpoint': resolve(__dirname, 'pdf-to-powerpoint.html'),
        'excel-to-word':     resolve(__dirname, 'excel-to-word.html'),
        'word-to-excel':     resolve(__dirname, 'word-to-excel.html'),
        'powerpoint-to-word':resolve(__dirname, 'powerpoint-to-word.html'),
        'account':           resolve(__dirname, 'account.html'),
      }
    }
  }
})
