import { tools } from '../tools/configs.js'
import { getLang, setLang, getT, supportedLangs, langLabels, translatedSlug, englishKeyFromSlug } from './i18n.js'
import { initTheme, toggleTheme, getCurrentTheme, sunIcon, moonIcon } from './theme.js'
import { getUser, onAuthStateChange, signOut as supabaseSignOut } from './supabase.js'
import { createSignInButton, createUserDropdown, showSignInModal } from './auth-ui.js'
import { initPreferencesSync, syncPreference, clearPreferencesSync } from './preferences-sync.js'
import './wp-upload.js' // Auto-init WordPress upload integration

// Review prompt — shown once per session after a download
function showReviewPrompt() {
  if (sessionStorage.getItem('reviewShown')) return
  sessionStorage.setItem('reviewShown', 'true')
  setTimeout(() => {
    const el = document.createElement('div')
    el.style.cssText = `
      position:fixed;bottom:20px;right:20px;
      background:var(--bg-card);border-radius:12px;
      padding:16px 20px;
      box-shadow:0 6px 24px rgba(0,0,0,0.15);
      z-index:9999;
      font-family:'DM Sans',sans-serif;
      border:1px solid var(--border);
      max-width:280px;
      animation:fadeUp 0.3s ease both;
    `
    el.innerHTML = `
      <div style="margin-bottom:8px;font-size:13px;font-weight:600;color:var(--text-primary)">
        Enjoying RelahConvert?
      </div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:10px">
        Rate us on
        <img src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-white.svg"
             style="height:16px;vertical-align:middle;filter:invert(1) sepia(1) saturate(5) hue-rotate(100deg);"
             alt="Trustpilot"/>
      </div>
      <div style="display:flex;gap:8px;">
        <button id="closeReview"
          style="flex:1;padding:7px;border:1px solid var(--border-light);border-radius:8px;background:var(--bg-card);cursor:pointer;font-size:12px;color:var(--text-tertiary)">
          Skip
        </button>
        <a href="https://www.trustpilot.com/review/relahconvert.com" target="_blank"
          id="reviewLink"
          style="flex:2;padding:7px;background:var(--trustpilot);color:#fff;text-align:center;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
          \u2605 Write a Review
        </a>
      </div>
    `
    document.body.appendChild(el)
    document.getElementById('closeReview').onclick = () => el.remove()
    document.getElementById('reviewLink').addEventListener('click', () => setTimeout(() => el.remove(), 500))
    setTimeout(() => { if (el.parentNode) el.remove() }, 8000)
  }, 1500)
}
window.showReviewPrompt = showReviewPrompt

export function injectHeader() {
  const t = getT()
  const currentLang = getLang()
  const isRTL = currentLang === 'ar'
  initTheme()

  const activeToolKey = (function() {
    const path = decodeURIComponent(window.location.pathname).replace(/^\/|\/$/g, '').split('?')[0]
    if (!path) return null
    if (tools[path]) return path
    const segs = path.split('/')
    if (segs.length === 2) {
      const lang = supportedLangs.find(l => l.toLowerCase() === segs[0].toLowerCase())
      if (lang) {
        const ek = englishKeyFromSlug(lang, segs[1])
        if (ek && tools[ek]) return ek
      }
    }
    return null
  })()

  function localHref(englishSlug) {
    if (currentLang === 'en') return '/' + englishSlug
    return '/' + currentLang + '/' + translatedSlug(currentLang, englishSlug)
  }

  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:wght@400;500;600&display=swap'
  document.head.appendChild(fontLink)

  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; }
    html, body { min-height: 100vh; }
    body { display: flex; flex-direction: column; }
    #app { flex: 1; }
    #site-header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      font-family: 'DM Sans', sans-serif;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    #site-header .header-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    #site-header .logo {
      font-family: 'Fraunces', serif;
      font-size: 24px;
      color: var(--text-primary);
      text-decoration: none;
      letter-spacing: -0.02em;
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 5px;
      direction: ltr;
      line-height: 1;
    }
    #site-header .logo .logo-text { display: flex; align-items: baseline; }
    #site-header .logo .relah { font-weight: 400; color: var(--text-primary); }
    #site-header .logo .convert { font-weight: 900; font-style: italic; color: var(--accent); }
    #site-header .desktop-nav {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    #site-header .nav-link {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #111111;
      text-decoration: none;
      transition: color 0.15s;
      white-space: nowrap;
    }
    [data-theme="dark"] #site-header .nav-link { color: var(--text-primary); }
    #site-header .nav-link:hover { color: var(--accent); }
    #site-header .nav-link.active { color: var(--accent); font-weight: 600; }
    #site-header .more-btn {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #111111;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: color 0.15s;
      font-family: 'DM Sans', sans-serif;
      white-space: nowrap;
    }
    [data-theme="dark"] #site-header .more-btn { color: var(--text-primary); }
    #site-header .more-btn:hover { color: var(--accent); }
    #site-header .more-btn .arrow { font-size: 10px; transition: transform 0.15s; display: inline-block; }
    #site-header .more-btn.open .arrow { transform: rotate(180deg); }
    #site-header .hamburger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      flex-direction: column;
      gap: 5px;
    }
    #site-header .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.2s;
    }
    #dropdown-menu {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      z-index: 99;
      max-height: calc(100vh - 64px);
      overflow-y: auto;
    }
    #dropdown-menu.open { display: block; }
    #dropdown-menu .dropdown-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px 24px;
      display: flex;
      gap: 12px;
    }
    .dropdown-col { display: contents; }
    .dropdown-category { flex: 1; min-width: 0; }
    .dropdown-category h3 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
      margin: 0 0 8px;
      padding: 0 4px;
      font-family: 'DM Sans', sans-serif;
    }
    .dropdown-category a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 4px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
    }
    .dropdown-category a:hover { background: var(--bg-surface); color: var(--accent); }
    .dropdown-category a.active { background: var(--accent-bg); color: var(--accent); }
    @media (max-width: 768px) {
      #site-header .desktop-nav { display: none; }
      #site-header .hamburger { display: flex; }
      #dropdown-menu .dropdown-inner {
        display: flex;
        padding: 12px;
        gap: 12px;
      }
      .dropdown-col { display: flex; flex-direction: column; flex: 1; min-width: 0; }
      .dropdown-category { flex: none; margin-bottom: 12px; }
      .dropdown-category a { font-size: 12px; padding: 6px 4px; }
    }
    #site-footer {
      background: var(--footer-bg);
      font-family: 'DM Sans', sans-serif;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid var(--border);
    }
    #site-footer .footer-copy { font-size: 12px; color: var(--text-muted); }
    .lang-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      position: relative;
    }
    .lang-toggle {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      color: var(--text-secondary);
      font-size: 12px;
      font-family: 'DM Sans', sans-serif;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      outline: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: border-color 0.15s;
    }
    .lang-toggle:hover { border-color: var(--accent); }
    .lang-toggle .lang-arrow { font-size: 9px; transition: transform 0.15s; display: inline-block; }
    .lang-toggle.open .lang-arrow { transform: rotate(180deg); }
    .lang-grid-wrap {
      display: none;
      position: fixed;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      padding: 12px;
      z-index: 9999;
      width: 480px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .lang-grid-wrap.open { display: block; }
    .lang-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }
    .lang-grid a {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 400;
      color: var(--text-secondary);
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.12s;
      white-space: nowrap;
      cursor: pointer;
    }
    .lang-grid a:hover { background: var(--bg-surface); color: var(--text-primary); }
    .lang-grid a.active { font-weight: 600; color: var(--accent); }
    .lang-grid a .lang-check {
      width: 16px;
      flex-shrink: 0;
      font-size: 13px;
      color: var(--accent);
      text-align: center;
    }
    @media (max-width: 768px) {
      .lang-grid-wrap {
        width: 90vw;
        max-width: 400px;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      .lang-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 360px) {
      .lang-grid { grid-template-columns: 1fr; }
    }

    .theme-toggle {
      background: none;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      cursor: pointer;
      padding: 4px 6px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      margin-left: auto;
    }
    .theme-toggle:hover { border-color: var(--accent); color: var(--accent); }
    .mobile-theme { display: none; }
    @media (max-width: 768px) {
      .mobile-theme { display: flex; }
      #themeToggle { display: none; }
    }

    /* RTL Arabic */
    [dir="rtl"] #site-header .desktop-nav { justify-content: flex-start; }
    [dir="rtl"] #dropdown-menu .dropdown-inner { direction: rtl; }
    [dir="rtl"] .dropdown-category a { flex-direction: row-reverse; }
    [dir="rtl"] #site-footer { direction: rtl; }
    [dir="rtl"] .lang-bar { flex-direction: row-reverse; }
    [dir="rtl"] .lang-grid a { flex-direction: row-reverse; }
    [dir="rtl"] .lang-grid-wrap { direction: rtl; }
  `
  document.head.appendChild(style)

  if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
    const noTranslate = document.createElement('meta')
    noTranslate.name = 'google'
    noTranslate.content = 'notranslate'
    document.head.appendChild(noTranslate)
  }

  document.documentElement.setAttribute('lang', currentLang)
  document.documentElement.classList.add('notranslate')
  document.documentElement.setAttribute('translate', 'no')
  if (isRTL) {
    document.documentElement.setAttribute('dir', 'rtl')
  }

  const svgIcons = {
    'compress':          { bg: '#E8F4FB', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="8" width="24" height="24" rx="4" fill="#3B9ECC" opacity="0.2"/><path d="M20 12v8M20 20l-4 4M20 20l4 4" stroke="#3B9ECC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 28h14" stroke="#3B9ECC" stroke-width="2.5" stroke-linecap="round"/><path d="M16 14h-4v-4M24 14h4v-4" stroke="#3B9ECC" stroke-width="2" stroke-linecap="round"/></svg>` },
    'resize':            { bg: '#FEF3E6', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="12" width="24" height="16" rx="3" fill="#F59E0B" opacity="0.2"/><rect x="12" y="16" width="16" height="8" rx="2" fill="#F59E0B" opacity="0.3"/><path d="M10 20h6M30 20h-6M13 17l-3 3 3 3M27 17l3 3-3 3" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'jpg-to-png':        { bg: '#F0FDF4', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#22C55E" opacity="0.3"/><text x="6.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#16A34A">JPG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#16A34A"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">PNG</text><path d="M18 20h4" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'png-to-jpg':        { bg: '#FFF7ED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#FB923C" opacity="0.3"/><text x="6" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#EA580C">PNG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#EA580C"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#EA580C" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#EA580C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'jpg-to-webp':       { bg: '#F5F3FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#8B5CF6" opacity="0.3"/><text x="5.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#7C3AED">JPG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#7C3AED"/><text x="21.5" y="25" font-family="Arial" font-size="5.8" font-weight="800" fill="#fff">WebP</text><path d="M18 20h4" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'webp-to-jpg':       { bg: '#FDF2F8', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#EC4899" opacity="0.3"/><text x="5" y="21" font-family="Arial" font-size="5.8" font-weight="800" fill="#DB2777">WebP</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#DB2777"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#DB2777" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#DB2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'png-to-webp':       { bg: '#ECFDF5', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#10B981" opacity="0.3"/><text x="6" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#059669">PNG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#059669"/><text x="21.5" y="25" font-family="Arial" font-size="5.8" font-weight="800" fill="#fff">WebP</text><path d="M18 20h4" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'webp-to-png':       { bg: '#EFF6FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#3B82F6" opacity="0.3"/><text x="5" y="21" font-family="Arial" font-size="5.8" font-weight="800" fill="#2563EB">WebP</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#2563EB"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">PNG</text><path d="M18 20h4" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'jpg-to-pdf':        { bg: '#FEF2F2', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M10 6h14l6 6v22a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#EF4444" opacity="0.2" stroke="#EF4444" stroke-width="2"/><path d="M24 6v7h7" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/><text x="12" y="28" font-family="Arial" font-size="7.5" font-weight="800" fill="#EF4444">PDF</text></svg>` },
    'png-to-pdf':        { bg: '#FFF1F2', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M10 6h14l6 6v22a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#F43F5E" opacity="0.2" stroke="#F43F5E" stroke-width="2"/><path d="M24 6v7h7" stroke="#F43F5E" stroke-width="2" stroke-linecap="round"/><text x="12" y="28" font-family="Arial" font-size="7.5" font-weight="800" fill="#F43F5E">PDF</text></svg>` },
    'gif-to-jpg':        { bg: '#FFFBEB', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#F59E0B" opacity="0.3"/><text x="6.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#D97706">GIF</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#D97706"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#D97706" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'gif-to-png':        { bg: '#F0FDF4', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#22C55E" opacity="0.3"/><text x="6.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#16A34A">GIF</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#16A34A"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">PNG</text><path d="M18 20h4" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'bmp-to-jpg':        { bg: '#EFF6FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#3B82F6" opacity="0.3"/><text x="5.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#2563EB">BMP</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#2563EB"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'bmp-to-png':        { bg: '#F5F3FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#8B5CF6" opacity="0.3"/><text x="5.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#7C3AED">BMP</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#7C3AED"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">PNG</text><path d="M18 20h4" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'tiff-to-jpg':       { bg: '#FDF4FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#D946EF" opacity="0.3"/><text x="5" y="21" font-family="Arial" font-size="6" font-weight="800" fill="#C026D3">TIFF</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#C026D3"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#C026D3" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#C026D3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'jpg-to-gif':        { bg: '#FFFBEB', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#F59E0B" opacity="0.3"/><text x="5.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#D97706">JPG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#D97706"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">GIF</text><path d="M18 20h4" stroke="#D97706" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'png-to-gif':        { bg: '#ECFDF5', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#10B981" opacity="0.3"/><text x="6" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#059669">PNG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#059669"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">GIF</text><path d="M18 20h4" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'crop':              { bg: '#FFF7ED', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M10 6v24h24" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round"/><path d="M6 10h24v24" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><rect x="10" y="10" width="16" height="16" rx="1" fill="#EA580C" opacity="0.15" stroke="#EA580C" stroke-width="1.5" stroke-dasharray="3 2"/></svg>` },
    'rotate':            { bg: '#EFF6FF', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M28 10a12 12 0 11-16 0" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/><path d="M28 6v6h-6" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="16" width="12" height="12" rx="2" fill="#2563EB" opacity="0.2"/></svg>` },
    'flip':              { bg: '#F5F3FF', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M20 8v24" stroke="#7C3AED" stroke-width="2" stroke-dasharray="3 2"/><path d="M8 14h10v12H8z" rx="2" fill="#7C3AED" opacity="0.25" stroke="#7C3AED" stroke-width="1.5"/><path d="M22 14h10v12H22z" rx="2" fill="#7C3AED" opacity="0.5" stroke="#7C3AED" stroke-width="1.5"/></svg>` },
    'grayscale':         { bg: '#F3F4F6', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="12" fill="url(#gs)" stroke="#6B7280" stroke-width="1.5"/><defs><linearGradient id="gs" x1="8" y1="20" x2="32" y2="20"><stop offset="0%" stop-color="#6B7280"/><stop offset="50%" stop-color="#D1D5DB"/><stop offset="100%" stop-color="#F3F4F6"/></linearGradient></defs><path d="M20 8v24M8 20h24" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/></svg>` },
    'watermark':         { bg: '#ECFDF5', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="28" height="24" rx="3" fill="#059669" opacity="0.15" stroke="#059669" stroke-width="1.5"/><text x="9" y="23" font-family="Arial" font-size="7" font-weight="800" fill="#059669" opacity="0.5">© mark</text><path d="M6 28h28" stroke="#059669" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/></svg>` },
    'round-corners':     { bg: '#FFF0F6', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="7" width="26" height="26" rx="8" fill="#F472B6" opacity="0.25" stroke="#EC4899" stroke-width="2"/><rect x="13" y="13" width="14" height="14" rx="4" fill="#EC4899" opacity="0.4"/></svg>` },
    'meme-generator':    { bg: '#FFF9E6', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="28" height="24" rx="3" fill="#F59E0B" opacity="0.2" stroke="#F59E0B" stroke-width="1.5"/><text x="20" y="18" font-family="Arial" font-size="6" font-weight="800" fill="#D97706" text-anchor="middle">TOP</text><text x="20" y="28" font-family="Arial" font-size="6" font-weight="800" fill="#D97706" text-anchor="middle">BOTTOM</text></svg>` },
    'blur-face':         { bg: '#F0F4FF', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="17" r="7" fill="#6366F1" opacity="0.2" stroke="#6366F1" stroke-width="1.5"/><path d="M10 32c0-5 4.5-8 10-8s10 3 10 8" fill="#6366F1" opacity="0.15" stroke="#6366F1" stroke-width="1.5"/><rect x="14" y="13" width="12" height="8" rx="3" fill="#6366F1" opacity="0.25"/><line x1="13" y1="15" x2="27" y2="15" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><line x1="13" y1="18" x2="27" y2="18" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><line x1="13" y1="21" x2="27" y2="21" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>` },
    'remove-background': { bg: '#F0F9FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="6" width="28" height="28" rx="4" fill="#0EA5E9" opacity="0.15" stroke="#0EA5E9" stroke-width="1.5" stroke-dasharray="3 2"/><circle cx="20" cy="18" r="5" fill="#0EA5E9" opacity="0.5"/><path d="M10 30c0-4 4.5-7 10-7s10 3 10 7" fill="#0EA5E9" opacity="0.3"/><path d="M6 6l28 28" stroke="#0EA5E9" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/></svg>` },
    'heic-to-jpg':       { bg: '#FFF7ED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#F97316" opacity="0.3"/><text x="4" y="21" font-family="Arial" font-size="5.5" font-weight="800" fill="#EA580C">HEIC</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#EA580C"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">JPG</text><path d="M18 20h4" stroke="#EA580C" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#EA580C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'image-to-ico':      { bg: '#F5F3FF', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="8" width="24" height="24" rx="4" fill="#7C3AED" opacity="0.15" stroke="#7C3AED" stroke-width="1.5"/><rect x="13" y="13" width="6" height="6" rx="1" fill="#7C3AED" opacity="0.5"/><rect x="21" y="13" width="6" height="6" rx="1" fill="#7C3AED" opacity="0.3"/><rect x="13" y="21" width="6" height="6" rx="1" fill="#7C3AED" opacity="0.3"/><rect x="21" y="21" width="6" height="6" rx="1" fill="#7C3AED" opacity="0.6"/></svg>` },
    'jpg-to-svg':        { bg: '#ECFDF5', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="9" width="14" height="18" rx="3" fill="#10B981" opacity="0.3"/><text x="5.5" y="21" font-family="Arial" font-size="6.5" font-weight="800" fill="#059669">JPG</text><rect x="21" y="13" width="14" height="18" rx="3" fill="#059669"/><text x="22.5" y="25" font-family="Arial" font-size="6.5" font-weight="800" fill="#fff">SVG</text><path d="M18 20h4" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/><path d="M20 18l2 2-2 2" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'html-to-image':     { bg: '#E0F2FE', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" fill="#0EA5E9" opacity="0.2" stroke="#0EA5E9" stroke-width="1.5"/><rect x="4" y="8" width="32" height="7" rx="3" fill="#0EA5E9" opacity="0.35"/><circle cx="9" cy="11.5" r="1.5" fill="#fff"/><circle cx="14" cy="11.5" r="1.5" fill="#fff"/><circle cx="19" cy="11.5" r="1.5" fill="#fff"/><rect x="8" y="19" width="24" height="2" rx="1" fill="#0EA5E9" opacity="0.4"/><rect x="8" y="24" width="16" height="2" rx="1" fill="#0EA5E9" opacity="0.4"/></svg>` },
    'image-splitter':    { bg: '#FFF7ED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="5" width="30" height="30" rx="3" fill="#F97316" opacity="0.15" stroke="#F97316" stroke-width="1.5"/><line x1="20" y1="5" x2="20" y2="35" stroke="#F97316" stroke-width="1.5" stroke-dasharray="3 2"/><line x1="5" y1="20" x2="35" y2="20" stroke="#F97316" stroke-width="1.5" stroke-dasharray="3 2"/><rect x="8" y="8" width="9" height="9" rx="1.5" fill="#F97316" opacity="0.25"/><rect x="23" y="8" width="9" height="9" rx="1.5" fill="#F97316" opacity="0.25"/><rect x="8" y="23" width="9" height="9" rx="1.5" fill="#F97316" opacity="0.25"/><rect x="23" y="23" width="9" height="9" rx="1.5" fill="#F97316" opacity="0.25"/></svg>` },
  }

  const mainLinks = ['compress', 'resize', 'jpg-to-png', 'jpg-to-pdf']

  const logoHTML = `
    <a href="${currentLang === 'en' ? '/' : '/' + currentLang}" class="logo">
      <svg width="22" height="18" viewBox="0 0 26 20" style="flex-shrink:0;order:0;">
        <polygon points="9,1 17,10 9,19 1,10" fill="#C84B31" opacity="0.5"/>
        <polygon points="17,1 25,10 17,19 9,10" fill="#C84B31"/>
        <polygon points="17,1 25,10 17,10" fill="#2C1810" opacity="0.18"/>
      </svg>
      <span class="logo-text" style="order:1;"><span class="relah" translate="no">Relah</span><span class="convert" translate="no">convert</span></span>
    </a>`

  const navHTML = `
    <nav class="desktop-nav">
      ${mainLinks.map(slug => `<a href="${localHref(slug)}" class="nav-link ${activeToolKey === slug ? 'active' : ''}">${t.nav_short[slug]}</a>`).join('')}
      <button class="more-btn" id="moreBtn">${t.nav_more_tools} <span class="arrow">▼</span></button>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode"></button>
      <div id="authSlot" style="display:inline-flex;margin-inline-start:4px;"></div>
    </nav>
    <div id="authSlotMobile" style="display:inline-flex;"></div>
    <button class="theme-toggle mobile-theme" id="themeToggleMobile" aria-label="Toggle dark mode"></button>
    <button class="hamburger" id="hamburgerBtn" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>`

  const header = document.createElement('header')
  header.id = 'site-header'
  header.innerHTML = `<div class="header-inner">${logoHTML + navHTML}</div>`

  const toolCategories = [
    { name: 'Convert', slugs: ['jpg-to-png','png-to-jpg','jpg-to-webp','webp-to-jpg','png-to-webp','webp-to-png','gif-to-jpg','gif-to-png','bmp-to-jpg','bmp-to-png','tiff-to-jpg','heic-to-jpg'] },
    { name: 'Optimize', slugs: ['compress','resize','resize-in-kb'] },
    { name: 'Modify', slugs: ['crop','rotate','flip','grayscale','round-corners','pixelate-image'] },
    { name: 'Create', slugs: ['meme-generator','merge-images','image-splitter','watermark','jpg-to-gif','png-to-gif'] },
    { name: 'Export', slugs: ['jpg-to-pdf','png-to-pdf','image-to-ico','jpg-to-svg','svg-to-png','svg-to-jpg','html-to-image'] },
    { name: 'Photo', slugs: ['passport-photo','remove-background','blur-face'] },
  ]

  function toolLink(slug) {
    const tool = tools[slug]
    if (!tool) return ''
    const ic = svgIcons[slug] || { bg: '#F5F5F5', svg: '<svg viewBox="0 0 40 40"></svg>' }
    const svgSmall = ic.svg.replace('viewBox="0 0 40 40"', 'viewBox="0 0 40 40" width="18" height="18"')
    return `<a href="${localHref(slug)}" class="${activeToolKey === slug ? 'active' : ''}">
      <span style="width:24px;height:24px;border-radius:6px;background:${ic.bg};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${svgSmall}</span>
      ${t.nav_short[slug] || tool.title}
    </a>`
  }

  const leftCats = toolCategories.slice(0, 3)  // Convert, Optimize, Modify
  const rightCats = toolCategories.slice(3)     // Create, Export, Photo

  function renderCat(cat) {
    return `<div class="dropdown-category"><h3>${cat.name}</h3>${cat.slugs.map(s => toolLink(s)).join('')}</div>`
  }

  const dropdown = document.createElement('div')
  dropdown.id = 'dropdown-menu'
  dropdown.innerHTML = `
    <div class="dropdown-inner" id="dropdownInner">
      <div class="dropdown-col">${leftCats.map(renderCat).join('')}</div>
      <div class="dropdown-col">${rightCats.map(renderCat).join('')}</div>
    </div>
  `

  const footer = document.createElement('footer')
  footer.id = 'site-footer'
  footer.innerHTML = `
    <p class="footer-copy">${t.footer_copy}</p>
    <div class="lang-bar">
      <button class="lang-toggle" id="langToggle">
        <span>🌐</span>
        <span>${langLabels[currentLang]}</span>
        <span class="lang-arrow">▲</span>
      </button>
      <div class="lang-grid-wrap" id="langGridWrap">
        <div class="lang-grid">
          ${supportedLangs.map(l => `<a href="#" data-lang="${l}" class="${l === currentLang ? 'active' : ''}"><span class="lang-check">${l === currentLang ? '✓' : ''}</span>${langLabels[l]}</a>`).join('')}
        </div>
      </div>
    </div>
  `

  const oldHeader = document.getElementById('site-header')
  if (oldHeader) oldHeader.remove()
  const oldDropdown = document.getElementById('dropdown-menu')
  if (oldDropdown) oldDropdown.remove()
  const oldFooter = document.getElementById('site-footer')
  if (oldFooter) oldFooter.remove()

  document.body.insertBefore(header, document.body.firstChild)
  document.body.insertBefore(dropdown, header.nextSibling)
  document.body.appendChild(footer)

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle')
  const themeToggleMobile = document.getElementById('themeToggleMobile')
  function updateToggleIcons() {
    const icon = getCurrentTheme() === 'dark' ? sunIcon : moonIcon
    if (themeToggle) themeToggle.innerHTML = icon
    if (themeToggleMobile) themeToggleMobile.innerHTML = icon
  }
  updateToggleIcons()
  function handleToggle() {
    toggleTheme(); updateToggleIcons()
    syncPreference('theme', getCurrentTheme())
  }
  if (themeToggle) themeToggle.addEventListener('click', handleToggle)
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleToggle)

  // ── Auth integration ──
  const authSlot = document.getElementById('authSlot')
  const authSlotMobile = document.getElementById('authSlotMobile')

  function renderAuthUI(user) {
    if (!authSlot) return
    authSlot.innerHTML = ''
    if (authSlotMobile) authSlotMobile.innerHTML = ''
    if (user) {
      authSlot.appendChild(createUserDropdown(user, async () => {
        clearPreferencesSync()
        await supabaseSignOut()
      }))
    } else {
      authSlot.appendChild(createSignInButton(() => showSignInModal()))
      if (authSlotMobile) {
        authSlotMobile.appendChild(createSignInButton(() => showSignInModal()))
      }
    }
  }

  // Initialize auth state
  getUser().then(user => {
    renderAuthUI(user)
    if (user) initPreferencesSync(user)
  })

  // Listen for auth changes (sign in, sign out, token refresh)
  onAuthStateChange((event, session) => {
    const user = session?.user || null
    renderAuthUI(user)
    if (event === 'SIGNED_IN' && user) initPreferencesSync(user)
    if (event === 'SIGNED_OUT') clearPreferencesSync()
  })

  // Listen for theme apply from preferences sync
  window.addEventListener('rc:apply-theme', (e) => {
    const theme = e.detail
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('relahconvert-theme', theme)
    updateToggleIcons()
  })

  const langToggle = document.getElementById('langToggle')
  const langGridWrap = document.getElementById('langGridWrap')

  function positionLangDropdown() {
    // Always recalculate position based on current button location
    const btn = langToggle.getBoundingClientRect()
    const dropH = Math.min(langGridWrap.scrollHeight, window.innerHeight * 0.6)
    const spaceAbove = btn.top
    const spaceBelow = window.innerHeight - btn.bottom

    if (spaceAbove > dropH || spaceAbove > spaceBelow) {
      // Open upward
      langGridWrap.style.top = 'auto'
      langGridWrap.style.bottom = (window.innerHeight - btn.top + 8) + 'px'
    } else {
      // Open downward
      langGridWrap.style.bottom = 'auto'
      langGridWrap.style.top = (btn.bottom + 8) + 'px'
    }

    if (window.innerWidth <= 768) {
      // On mobile: center horizontally using fixed positioning
      langGridWrap.style.left = '50%'
      langGridWrap.style.transform = 'translateX(-50%)'
    } else {
      // On desktop: center relative to button
      const wrapW = 480
      let left = btn.left + btn.width / 2 - wrapW / 2
      left = Math.max(8, Math.min(left, window.innerWidth - wrapW - 8))
      langGridWrap.style.left = left + 'px'
      langGridWrap.style.transform = 'none'
    }
  }

  if (langToggle && langGridWrap) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = langGridWrap.classList.toggle('open')
      langToggle.classList.toggle('open', isOpen)
      if (isOpen) positionLangDropdown()
    })

    langGridWrap.addEventListener('click', (e) => {
      e.stopPropagation()
      const link = e.target.closest('a[data-lang]')
      if (link) {
        e.preventDefault()
        const newLang = link.dataset.lang
        setLang(newLang)
        if (activeToolKey && tools[activeToolKey]) {
          if (newLang === 'en') {
            window.location.href = '/' + activeToolKey
          } else {
            window.location.href = '/' + newLang + '/' + translatedSlug(newLang, activeToolKey)
          }
        } else {
          window.location.href = newLang === 'en' ? '/' : '/' + newLang
        }
      }
    })

    document.addEventListener('click', () => {
      langGridWrap.classList.remove('open')
      langToggle.classList.remove('open')
    })

    // Reposition on scroll/resize in case page scrolls
    window.addEventListener('resize', () => {
      if (langGridWrap.classList.contains('open')) positionLangDropdown()
    })
  }

  const moreBtn = document.getElementById('moreBtn')
  const hamburgerBtn = document.getElementById('hamburgerBtn')

  function openDropdown() {
    dropdown.classList.add('open')
    if (moreBtn) moreBtn.classList.add('open')
  }
  function closeDropdown() {
    dropdown.classList.remove('open')
    if (moreBtn) moreBtn.classList.remove('open')
  }
  function toggleDropdown(e) {
    e.stopPropagation()
    if (dropdown.classList.contains('open')) closeDropdown()
    else openDropdown()
  }

  // Desktop: hover to open/close
  let hoverTimeout = null
  if (moreBtn) {
    moreBtn.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout)
      openDropdown()
    })
    moreBtn.addEventListener('click', toggleDropdown)
  }
  dropdown.addEventListener('mouseenter', () => { clearTimeout(hoverTimeout) })
  dropdown.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(closeDropdown, 200)
  })
  if (moreBtn) {
    moreBtn.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(closeDropdown, 200)
    })
  }

  // Mobile: hamburger click
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDropdown)

  document.addEventListener('click', () => closeDropdown())
  dropdown.addEventListener('click', e => e.stopPropagation())

  // PWA install prompt — Android only (iOS has no install API)
  let deferredPrompt = null
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    setTimeout(() => {
      if (!deferredPrompt || sessionStorage.getItem('pwaInstallDismissed')) return
      const banner = document.createElement('div')
      banner.id = 'pwa-install-banner'
      banner.style.cssText = `
        position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
        background:var(--bg-card);border:1px solid var(--border);border-radius:12px;
        padding:12px 16px;box-shadow:0 6px 24px rgba(0,0,0,0.15);
        z-index:9999;font-family:'DM Sans',sans-serif;
        display:flex;align-items:center;gap:12px;max-width:420px;width:calc(100% - 32px);
        animation:fadeUp 0.3s ease both;
      `
      banner.innerHTML = `
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Install RelahConvert</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Use tools offline, faster loads</div>
        </div>
        <button id="pwaInstallBtn" style="padding:7px 16px;background:var(--accent);color:var(--text-on-accent);border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;">Install</button>
        <button id="pwaInstallDismiss" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px;padding:4px;">✕</button>
      `
      document.body.appendChild(banner)
      document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        await deferredPrompt.userChoice
        deferredPrompt = null
        banner.remove()
      })
      document.getElementById('pwaInstallDismiss').addEventListener('click', () => {
        sessionStorage.setItem('pwaInstallDismissed', '1')
        banner.remove()
      })
    }, 30000)
  })
}