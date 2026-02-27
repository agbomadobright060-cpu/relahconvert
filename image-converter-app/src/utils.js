// ===== Limits =====
export const LIMITS = {
  MAX_FILES: 25,
  MAX_PER_FILE_BYTES: 20 * 1024 * 1024,
  MAX_TOTAL_BYTES: 200 * 1024 * 1024
}

// ===== Format helpers =====
export function mimeToExt(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'img'
}

export function mimeToLabel(mime) {
  if (mime === 'image/jpeg') return 'JPG'
  if (mime === 'image/png') return 'PNG'
  if (mime === 'image/webp') return 'WebP'
  return 'IMG'
}

export function formatSupportsQuality(mime) {
  return mime === 'image/jpeg' || mime === 'image/webp'
}

// ===== Size formatting =====
export function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return Math.round(bytes / 1024) + ' KB'
}

// ===== Filename helpers =====
export function sanitizeBaseName(name) {
  const base = name.replace(/\.[^/.]+$/, '').trim()
  return base.replace(/[^\w\s-]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'image'
}

export function uniqueName(usedSet, desiredName) {
  if (!usedSet.has(desiredName.toLowerCase())) {
    usedSet.add(desiredName.toLowerCase())
    return desiredName
  }
  const dot = desiredName.lastIndexOf('.')
  const base = dot >= 0 ? desiredName.slice(0, dot) : desiredName
  const ext = dot >= 0 ? desiredName.slice(dot) : ''
  let i = 2
  while (usedSet.has(`${base}-${i}${ext}`.toLowerCase())) i++
  const finalName = `${base}-${i}${ext}`
  usedSet.add(finalName.toLowerCase())
  return finalName
}

// ===== File key (for deduplication) =====
export function fileKey(f) {
  return `${f.name}__${f.size}__${f.lastModified}`
}

export function totalBytes(files) {
  return files.reduce((sum, f) => sum + (f?.size || 0), 0)
}