import JSZip from 'jszip'
import { mimeToExt, mimeToLabel, sanitizeBaseName, uniqueName } from './utils.js'

// Load a File into an HTMLImageElement
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

// Convert a canvas to a Blob
export function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Conversion failed'))
      else resolve(blob)
    }, mime, quality)
  })
}

// Convert a single file and return { blob, originalSize, outputSize, filename }
export async function convertFile(file, mime, quality) {
  const img = await fileToImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext('2d').drawImage(img, 0, 0)

  const blob = await canvasToBlob(canvas, mime, quality)
  const ext = mimeToExt(mime)
  const fmtLabel = mimeToLabel(mime).toLowerCase()
  const base = sanitizeBaseName(file.name)
  const filename = `${base}-converted-${fmtLabel}.${ext}`

  return { blob, originalSize: file.size, outputSize: blob.size, filename }
}

// Convert multiple files and return a ZIP blob + size totals
export async function convertFilesToZip(files, mime, quality, onProgress) {
  const zip = new JSZip()
  const usedNames = new Set()
  const ext = mimeToExt(mime)
  const fmtLabel = mimeToLabel(mime).toLowerCase()

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
    canvas.getContext('2d').drawImage(img, 0, 0)

    const blob = await canvasToBlob(canvas, mime, quality)
    totalNew += blob.size

    const base = sanitizeBaseName(file.name)
    const desired = `${base}.${ext}`
    const safeName = uniqueName(usedNames, desired)

    zip.file(safeName, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const zipName = `converted-${fmtLabel}.zip`

  return { zipBlob, zipName, totalOriginal, totalNew }
}