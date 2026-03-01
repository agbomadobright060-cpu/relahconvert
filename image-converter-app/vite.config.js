import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        compress: resolve(__dirname, 'compress.html'),
        resize: resolve(__dirname, 'resize.html'),
      }
    }
  }
})