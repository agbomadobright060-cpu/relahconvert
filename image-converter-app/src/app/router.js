import { tools } from '../tools/configs.js'
import { getLang, supportedLangs, setLang, englishKeyFromSlug } from '../core/i18n.js'

// Parse URL segments once
const _path = window.location.pathname.replace(/^\/|\/$/g, '').split('?')[0]
const _segments = _path.split('/')

// Check if first segment is a language code
const _urlLang = _segments[0]
  ? supportedLangs.find(l => l.toLowerCase() === _segments[0].toLowerCase())
  : null

// If URL has a language prefix, save it and redirect to the English tool URL.
// e.g. /fr/compresser-image → saves 'fr' to localStorage → redirects to /compress
// e.g. /fr (homepage) → saves 'fr' → redirects to /
if (_urlLang) {
  setLang(_urlLang)

  if (_segments[1]) {
    // Tool page: /fr/compresser-image → /compress
    const englishKey = englishKeyFromSlug(_urlLang, _segments[1])
    if (englishKey) {
      window.location.replace('/' + englishKey)
    }
  } else {
    // Homepage: /fr → /
    window.location.replace('/')
  }
}

export function getCurrentTool() {
  if (!_path || _urlLang) return null
  return tools[_path] || null
}

export function getCurrentLangFromURL() {
  return _urlLang || getLang()
}
