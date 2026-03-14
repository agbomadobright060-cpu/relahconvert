import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
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
        'jpg-to-svg':           resolve(__dirname, 'jpg-to-svg.html'),
        'website-screenshot':   resolve(__dirname, 'website-screenshot.html'),
      }
    }
  }
})