import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'jpg-to-png': resolve(__dirname, 'jpg-to-png.html'),
        'png-to-jpg': resolve(__dirname, 'png-to-jpg.html'),
        'jpg-to-webp': resolve(__dirname, 'jpg-to-webp.html'),
        'webp-to-jpg': resolve(__dirname, 'webp-to-jpg.html'),
        'png-to-webp': resolve(__dirname, 'png-to-webp.html'),
        'webp-to-png': resolve(__dirname, 'webp-to-png.html'),
        compress: resolve(__dirname, 'compress.html'),
        resize: resolve(__dirname, 'resize.html'),
        'jpg-to-pdf': resolve(__dirname, 'jpg-to-pdf.html'),
        'png-to-pdf': resolve(__dirname, 'png-to-pdf.html'),
      }
    }
  }
})