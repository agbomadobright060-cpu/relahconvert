import { tools } from '../tools/configs.js'
import { getLang, supportedLangs, englishKeyFromSlug } from '../core/i18n.js'

export function getCurrentTool() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '').split('?')[0]
  if (!path) return null

  // Direct English slug match (e.g. /jpg-to-png)
  if (tools[path]) return tools[path]

  // Translated URL: /{lang}/{translatedSlug} (e.g. /fr/jpg-vers-png)
  const segments = path.split('/')
  if (segments.length === 2) {
    const lang = supportedLangs.find(l => l.toLowerCase() === segments[0].toLowerCase())
    if (lang) {
      const englishKey = englishKeyFromSlug(lang, segments[1])
      if (englishKey && tools[englishKey]) return tools[englishKey]
    }
  }

  return null
}

export function getCurrentLangFromURL() {
  return getLang()
}
