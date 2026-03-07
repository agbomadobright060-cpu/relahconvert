import JSZip from 'jszip'
import { mimeToExt, mimeToLabel, sanitizeBaseName, uniqueName } from './utils.js'

export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image load failed'))
      img.onload = () => resolve(img)
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Conversion failed'))
      else resolve(blob)
    }, mime, quality)
  })
}

// ── ICO encoder ──────────────────────────────────────────────────────────────
// Generates a valid .ico binary containing one 32x32 PNG image inside.
async function canvasToIcoBlob(sourceCanvas) {
  const SIZE = 32

  // Draw source onto a 32x32 canvas
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0, SIZE, SIZE)

  // Get PNG blob of the 32x32 image
  const pngBlob = await canvasToBlob(canvas, 'image/png', 1)
  const pngBuffer = await pngBlob.arrayBuffer()
  const pngBytes = new Uint8Array(pngBuffer)

  // Build ICO file:
  // ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + PNG data
  const icoSize = 6 + 16 + pngBytes.length
  const buffer = new ArrayBuffer(icoSize)
  const view = new DataView(buffer)

  // ICONDIR header
  view.setUint16(0, 0, true)       // Reserved (must be 0)
  view.setUint16(2, 1, true)       // Type: 1 = ICO
  view.setUint16(4, 1, true)       // Number of images: 1

  // ICONDIRENTRY
  view.setUint8(6, SIZE)           // Width
  view.setUint8(7, SIZE)           // Height
  view.setUint8(8, 0)              // Color count (0 = more than 256)
  view.setUint8(9, 0)              // Reserved
  view.setUint16(10, 1, true)      // Color planes
  view.setUint16(12, 32, true)     // Bits per pixel
  view.setUint32(14, pngBytes.length, true) // Size of image data
  view.setUint32(18, 22, true)     // Offset of image data (6 + 16 = 22)

  // Copy PNG bytes into buffer
  const icoBytes = new Uint8Array(buffer)
  icoBytes.set(pngBytes, 22)

  return new Blob([buffer], { type: 'image/x-icon' })
}
// ─────────────────────────────────────────────────────────────────────────────

export async function convertFile(file, mime, quality) {
  const img = await fileToImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0)

  let blob
  if (mime === 'image/x-icon') {
    blob = await canvasToIcoBlob(canvas)
  } else {
    blob = await canvasToBlob(canvas, mime, quality)
  }

  const ext = mime === 'image/x-icon' ? 'ico' : mimeToExt(mime)
  const fmtLabel = mime === 'image/x-icon' ? 'ico' : mimeToLabel(mime).toLowerCase()
  const base = sanitizeBaseName(file.name)
  const filename = `${base}-converted-${fmtLabel}.${ext}`

  return { blob, originalSize: file.size, outputSize: blob.size, filename }
}

export async function convertFilesToZip(files, mime, quality, onProgress) {
  const zip = new JSZip()
  const usedNames = new Set()
  const ext = mime === 'image/x-icon' ? 'ico' : mimeToExt(mime)
  const fmtLabel = mime === 'image/x-icon' ? 'ico' : mimeToLabel(mime).toLowerCase()
  const convertedBlobs = []

  let totalOriginal = 0
  let totalNew = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    totalOriginal += file.size

    if (onProgress) onProgress(i + 1, files.length)

    const img = await fileToImage(file)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)

    let blob
    if (mime === 'image/x-icon') {
      blob = await canvasToIcoBlob(canvas)
    } else {
      blob = await canvasToBlob(canvas, mime, quality)
    }

    totalNew += blob.size

    const base = sanitizeBaseName(file.name)
    const desired = `${base}.${ext}`
    const safeName = uniqueName(usedNames, desired)

    convertedBlobs.push({ blob, name: safeName, type: mime })
    zip.file(safeName, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const zipName = `converted-${fmtLabel}.zip`

  return { zipBlob, zipName, totalOriginal, totalNew, convertedBlobs }
}