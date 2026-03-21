import { tools } from '../tools/configs.js'
import { getLang, supportedLangs, setLang, englishKeyFromSlug } from '../core/i18n.js'

// Map standalone tools to their JS module paths (tools NOT handled by main.js)
const standaloneModules = {
  'compress':          () => import('../compress.js'),
  'resize':            () => import('../resize.js'),
  'crop':              () => import('../tools/crop.js'),
  'rotate':            () => import('../tools/rotate.js'),
  'flip':              () => import('../tools/flip.js'),
  'grayscale':         () => import('../tools/grayscale.js'),
  'watermark':         () => import('../tools/watermark.js'),
  'round-corners':     () => import('../tools/round-corners.js'),
  'meme-generator':    () => import('../tools/meme-generator.js'),
  'blur-face':         () => import('../tools/blur-face.js'),
  'remove-background': () => import('../tools/remove-background.js'),
  'heic-to-jpg':       () => import('../tools/heic-to-jpg.js'),
  'image-to-ico':      () => import('../tools/image-to-ico.js'),
  'jpg-to-svg':        () => import('../tools/jpg-to-svg.js'),
  'html-to-image':     () => import('../tools/html-to-image.js'),
  'jpg-to-gif':        () => import('../tools/jpg-to-gif.js'),
  'png-to-gif':        () => import('../tools/png-to-gif.js'),
  'passport-photo':    () => import('../tools/passport-photo.js'),
  'image-splitter':    () => import('../tools/image-splitter.js'),
  'resize-in-kb':      () => import('../tools/resize-in-kb.js'),
  'jpg-to-pdf':        () => import('../jpg-to-pdf.js'),
  'png-to-pdf':        () => import('../png-to-pdf.js'),
}

// Parse URL
const _path = window.location.pathname.replace(/^\/|\/$/g, '').split('?')[0]
const _segments = _path.split('/')
const _urlLang = _segments[0]
  ? supportedLangs.find(l => l.toLowerCase() === _segments[0].toLowerCase())
  : null

// If URL has a language prefix, save it
if (_urlLang) setLang(_urlLang)

// Handle standalone tools: dynamically load instead of letting main.js render
let _handledByDynamicImport = false
// Direct English slug (e.g. /passport-photo, /merge-images loaded via catch-all)
if (!_urlLang && _segments.length === 1 && standaloneModules[_segments[0]]) {
  _handledByDynamicImport = true
  standaloneModules[_segments[0]]()
}
// Translated URLs (e.g. /fr/photo-passeport)
if (_urlLang && _segments[1]) {
  const englishKey = englishKeyFromSlug(_urlLang, _segments[1])
  if (englishKey && standaloneModules[englishKey]) {
    _handledByDynamicImport = true
    standaloneModules[englishKey]()
  }
}

export function getCurrentTool() {
  // If a standalone tool was loaded via dynamic import, don't let main.js render
  if (_handledByDynamicImport) return null

  if (!_path) return null

  // Direct English slug (e.g. /jpg-to-png)
  if (tools[_path]) return tools[_path]

  // Translated URL for main.js tools (e.g. /fr/jpg-vers-png)
  if (_urlLang && _segments[1]) {
    const englishKey = englishKeyFromSlug(_urlLang, _segments[1])
    if (englishKey && tools[englishKey]) return tools[englishKey]
  }

  return null
}

export function getCurrentLangFromURL() {
  return _urlLang || getLang()
}

// True if a standalone tool was loaded via dynamic import — main.js should not render
export const isStandaloneRoute = _handledByDynamicImport
