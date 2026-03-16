import { defineConfig } from 'vite'
import { resolve } from 'path'
import { mkdirSync, copyFileSync, existsSync, readFileSync } from 'fs'

const supportedLangs = ['fr','es','pt','de','ar','it','ja','ru','ko','zh','zh-tw','bg','ca','nl','el','hi','id','ms','pl','sv','th','tr','uk','vi']

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
      const slugsByLang = {}
      // Match each slugs:{...} block in order of language definitions
      const slugBlocks = i18nSrc.match(/slugs:\{[^}]+\}/g) || []
      // Languages with slugs appear in same order as supportedLangs (minus 'en')
      const langsWithSlugs = supportedLangs.filter(l => l !== 'en')
      slugBlocks.forEach((block, i) => {
        if (i >= langsWithSlugs.length) return
        const lang = langsWithSlugs[i]
        const pairs = block.replace('slugs:{', '').replace('}', '').split(',')
        slugsByLang[lang] = pairs.map(p => {
          const val = p.split(':')[1]
          return val ? val.replace(/'/g, '').trim() : null
        }).filter(Boolean)
      })

      for (const lang of supportedLangs) {
        // Create {lang}/index.html for homepage
        const langDir = resolve(distDir, lang)
        mkdirSync(langDir, { recursive: true })
        copyFileSync(src, resolve(langDir, 'index.html'))

        // Create {lang}/{slug}/index.html for each tool page
        const slugs = slugsByLang[lang] || []
        for (const slug of slugs) {
          const slugDir = resolve(distDir, lang, slug)
          mkdirSync(slugDir, { recursive: true })
          copyFileSync(src, resolve(slugDir, 'index.html'))
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
      }
    }
  }
})
