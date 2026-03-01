import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        compress: resolve(__dirname, 'compress.html'),
        resize: resolve(__dirname, 'resize.html'),
        'jpg-to-pdf': resolve(__dirname, 'jpg-to-pdf.html'),
        'png-to-pdf': resolve(__dirname, 'png-to-pdf.html'),
      }
    }
  }
})