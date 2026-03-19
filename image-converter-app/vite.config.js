import { defineConfig } from 'vite'
import { resolve } from 'path'
import { mkdirSync, copyFileSync, writeFileSync, existsSync, readFileSync } from 'fs'

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

      const base = 'https://relahconvert.com'
      const baseHtml = readFileSync(src, 'utf-8')

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

      // Inject meta description and hreflang into root index.html (English homepage)
      const enDescTag = homeDescByLang['en']
        ? `    <meta name="description" content="${homeDescByLang['en']}" />\n`
        : ''
      const enHomeHtml = baseHtml.replace('</head>', enDescTag + hreflangTags(null) + '  </head>')
      writeFileSync(src, enHomeHtml)

      // Inject hreflang into English tool HTML files (e.g. dist/jpg-to-pdf.html)
      const enToolSlugs = [
        'jpg-to-png','png-to-jpg','jpg-to-webp','webp-to-jpg','png-to-webp','webp-to-png',
        'compress','resize','jpg-to-pdf','png-to-pdf',
        'gif-to-jpg','gif-to-png','bmp-to-jpg','bmp-to-png','tiff-to-jpg',
        'jpg-to-gif','png-to-gif','crop','rotate','flip','grayscale','watermark',
        'round-corners','meme-generator','blur-face','remove-background',
        'heic-to-jpg','image-to-ico','jpg-to-svg','html-to-image','merge-images','passport-photo'
      ]
      for (const slug of enToolSlugs) {
        const toolFile = resolve(distDir, slug + '.html')
        if (existsSync(toolFile)) {
          const toolHtml = readFileSync(toolFile, 'utf-8')
          const updated = toolHtml.replace('</head>', hreflangTags(slug) + '  </head>')
          writeFileSync(toolFile, updated)
        }
      }

      for (const lang of supportedLangs) {
        // Replace lang="en" with the correct language
        let langHtml = baseHtml.replace('lang="en"', `lang="${lang}"`)

        // Inject translated title and meta description into homepage
        let homeHtml = langHtml
        if (homeTitleByLang[lang]) {
          homeHtml = homeHtml.replace(/<title>[^<]*<\/title>/, `<title>${homeTitleByLang[lang]}</title>`)
        }
        const descTag = homeDescByLang[lang]
          ? `    <meta name="description" content="${homeDescByLang[lang]}" />\n`
          : ''
        // Inject hreflang tags and meta description into <head>
        homeHtml = homeHtml.replace('</head>', descTag + hreflangTags(null) + '  </head>')

        // Create {lang}/index.html for homepage
        const langDir = resolve(distDir, lang)
        mkdirSync(langDir, { recursive: true })
        writeFileSync(resolve(langDir, 'index.html'), homeHtml)

        // Create {lang}/{slug}/index.html for each tool page
        const slugMap = slugMapByLang[lang] || {}
        for (const [enKey, localSlug] of Object.entries(slugMap)) {
          const toolHtml = langHtml.replace('</head>', hreflangTags(enKey) + '  </head>')
          const slugDir = resolve(distDir, lang, localSlug)
          mkdirSync(slugDir, { recursive: true })
          writeFileSync(resolve(slugDir, 'index.html'), toolHtml)
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [langRedirectPlugin(), langCopyPlugin()],
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
      }
    }
  }
})
