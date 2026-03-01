import { initImageToPdf } from './image-to-pdf.js'

initImageToPdf({
  acceptMime: ['image/jpeg'],
  acceptAttr: 'image/jpeg',
  toolTitle: 'JPG to PDF Converter',
  toolDesc: 'Convert JPG images to PDF free. Files never leave your device.',
  outputName: 'images',
})