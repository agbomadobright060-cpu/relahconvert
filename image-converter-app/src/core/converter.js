import JSZip from 'jszip'
import { mimeToExt, mimeToLabel, sanitizeBaseName, uniqueName } from './utils.js'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import * as UTIF from 'utif'

// ── TIFF decoder ──────────────────────────────────────────────────────────────
// Browsers can't decode TIFF natively. UTIF decodes it to raw RGBA, then we
// paint it onto a canvas so the rest of the pipeline works normally.
function tiffFileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('File read failed'))
    reader.onload = (e) => {
      try {
        const buffer = e.target.result
        const ifds = UTIF.decode(buffer)
        if (!ifds || ifds.length === 0) throw new Error('No TIFF pages found')
        UTIF.decodeImage(buffer, ifds[0])
        const ifd = ifds[0]
        const rgba = UTIF.toRGBA8(ifd)
        const width = ifd.width
        const height = ifd.height
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        const imageData = ctx.createImageData(width, height)
        imageData.data.set(rgba)
        ctx.putImageData(imageData, 0, 0)
        // Return a fake img-like object with the canvas as source
        // We return the canvas directly — convertFile checks for this
        resolve(canvas)
      } catch (err) {
        reject(new Error('TIFF decode failed: ' + err.message))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
// ─────────────────────────────────────────────────────────────────────────────

export function fileToImage(file) {
  // Route TIFF files through the UTIF decoder
  if (file.type === 'image/tiff' || file.name.toLowerCase().match(/\.tiff?$/)) {
    return tiffFileToImage(file)
  }
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
// GIF is a low-quality format — cap at 800px to keep memory manageable
const GIF_MAX_SIZE = 800

function canvasToGifBlob(sourceCanvas) {
  let width = sourceCanvas.width
  let height = sourceCanvas.height

  // Scale down if too large
  if (width > GIF_MAX_SIZE || height > GIF_MAX_SIZE) {
    if (width > height) {
      height = Math.round((height / width) * GIF_MAX_SIZE)
      width = GIF_MAX_SIZE
    } else {
      width = Math.round((width / height) * GIF_MAX_SIZE)
      height = GIF_MAX_SIZE
    }
  }

  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const tmpCtx = tmpCanvas.getContext('2d')
  tmpCtx.fillStyle = '#ffffff'
  tmpCtx.fillRect(0, 0, width, height)
  tmpCtx.drawImage(sourceCanvas, 0, 0, width, height)

  const imageData = tmpCtx.getImageData(0, 0, width, height)
  const data = new Uint8Array(imageData.data.buffer)

  const palette = quantize(data, 256)
  const index = applyPalette(data, palette)

  const gif = GIFEncoder()
  gif.writeFrame(index, width, height, { palette })
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