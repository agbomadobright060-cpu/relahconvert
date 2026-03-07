import JSZip from 'jszip'
import { mimeToExt, mimeToLabel, sanitizeBaseName, uniqueName } from './utils.js'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'

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

// ── GIF encoder ──────────────────────────────────────────────────────────────
function canvasToGifBlob(canvas) {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext('2d')

  // Fill white background before reading pixels (avoids transparent pixel issues)
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const tmpCtx = tmpCanvas.getContext('2d')
  tmpCtx.fillStyle = '#ffffff'
  tmpCtx.fillRect(0, 0, width, height)
  tmpCtx.drawImage(canvas, 0, 0)

  const imageData = tmpCtx.getImageData(0, 0, width, height)
  const rgba = imageData.data // Uint8ClampedArray, length = width * height * 4

  // gifenc needs a Uint8Array of format [r,g,b, r,g,b, ...]
  const pixelCount = width * height
  const rgb = new Uint8Array(pixelCount * 3)
  for (let i = 0; i < pixelCount; i++) {
    rgb[i * 3 + 0] = rgba[i * 4 + 0]
    rgb[i * 3 + 1] = rgba[i * 4 + 1]
    rgb[i * 3 + 2] = rgba[i * 4 + 2]
  }

  const palette = quantize(rgb, 256, { format: 'rgb444' })
  const index = applyPalette(rgb, palette, 'rgb444')

  const gif = GIFEncoder()
  gif.writeFrame(index, width, height, { palette, delay: 0 })
  gif.finish()

  return new Blob([gif.bytes()], { type: 'image/gif' })
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
  if (mime === 'image/gif') {
    blob = canvasToGifBlob(canvas)
  } else {
    blob = await canvasToBlob(canvas, mime, quality)
  }

  const ext = mime === 'image/gif' ? 'gif' : mimeToExt(mime)
  const fmtLabel = mime === 'image/gif' ? 'gif' : mimeToLabel(mime).toLowerCase()
  const base = sanitizeBaseName(file.name)
  const filename = `${base}-converted-${fmtLabel}.${ext}`

  return { blob, originalSize: file.size, outputSize: blob.size, filename }
}

export async function convertFilesToZip(files, mime, quality, onProgress) {
  const zip = new JSZip()
  const usedNames = new Set()
  const ext = mime === 'image/gif' ? 'gif' : mimeToExt(mime)
  const fmtLabel = mime === 'image/gif' ? 'gif' : mimeToLabel(mime).toLowerCase()
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
    if (mime === 'image/gif') {
      blob = canvasToGifBlob(canvas)
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