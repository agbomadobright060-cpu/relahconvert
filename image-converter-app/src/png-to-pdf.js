import { initImageToPdf } from './image-to-pdf.js'

initImageToPdf({
  acceptMime: ['image/png'],
  acceptAttr: 'image/png',
  toolTitle: 'PNG to PDF Converter',
  toolDesc: 'Convert PNG images to PDF free. Files never leave your device.',
  outputName: 'images',
})