import { tools } from '../tools/configs.js'
import { getLang, setLang, getT, supportedLangs, langLabels, translatedSlug, englishKeyFromSlug } from './i18n.js'
import { initTheme, toggleTheme, getCurrentTheme, sunIcon, moonIcon } from './theme.js'
import { getUser, onAuthStateChange, signOut as supabaseSignOut } from './supabase.js'
import { createSignInButton, createUserDropdown, showSignInModal } from './auth-ui.js'
import { initPreferencesSync, syncPreference, clearPreferencesSync } from './preferences-sync.js'
import './wp-upload.js' // Auto-init WordPress upload integration
import { maybeShowSaveButton } from './cloud-save.js'

// Expose globally so tools using ephemeral <a> downloads can trigger it manually
if (typeof window !== 'undefined') window.rcShowSaveButton = maybeShowSaveButton

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
    .mobile-user-btn { display:none; background:none; border:1px solid var(--border-light); border-radius:8px; padding:6px; color:var(--text-secondary); cursor:pointer; transition:all 0.15s; }
    .mobile-user-btn:hover { border-color:var(--accent); color:var(--accent); }
    .mobile-user-btn.signed-in { color:var(--accent); border-color:var(--accent); }
    #mobileUserPanel { display:none; position:fixed; top:64px; right:0; width:280px; background:var(--bg-card); border-bottom-left-radius:14px; box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:99; padding:16px; border:1px solid var(--border-light); }
    #mobileUserPanel.open { display:block; }
    @media (max-width: 768px) {
      .mobile-user-btn { display:flex; align-items:center; justify-content:center; }
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

  const _conv = (from, to, color) => `<svg viewBox="0 0 40 40" fill="none"><rect x="1" y="10" width="14" height="20" rx="2" fill="#fff"/><text x="8" y="23" font-family="Arial,sans-serif" font-size="5.5" font-weight="800" fill="${color}" text-anchor="middle">${from}</text><path d="M17 20h6m-2.5-2.5L23 20l-2.5 2.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="25" y="10" width="14" height="20" rx="2" fill="#fff"/><text x="32" y="23" font-family="Arial,sans-serif" font-size="5.5" font-weight="800" fill="${color}" text-anchor="middle">${to}</text></svg>`
  const svgIcons = {
    'compress':          { bg: '#3B9ECC', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M20 8v10m-5-5 5 5 5-5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 32V22m-5 5 5-5 5 5" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20h24" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    'resize':            { bg: '#F59E0B', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="9" y="9" width="22" height="22" rx="2" stroke="#fff" stroke-width="2.8"/><path d="M14 14h5v5" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 26h-5v-5" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 14l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    'jpg-to-png':        { bg: '#16A34A', svg: _conv('JPG', 'PNG', '#16A34A') },
    'png-to-jpg':        { bg: '#EA580C', svg: _conv('PNG', 'JPG', '#EA580C') },
    'jpg-to-webp':       { bg: '#7C3AED', svg: _conv('JPG', 'WebP', '#7C3AED') },
    'webp-to-jpg':       { bg: '#DB2777', svg: _conv('WebP', 'JPG', '#DB2777') },
    'png-to-webp':       { bg: '#059669', svg: _conv('PNG', 'WebP', '#059669') },
    'webp-to-png':       { bg: '#2563EB', svg: _conv('WebP', 'PNG', '#2563EB') },
    'jpg-to-pdf':        { bg: '#EF4444', svg: _conv('JPG', 'PDF', '#EF4444') },
    'png-to-pdf':        { bg: '#F43F5E', svg: _conv('PNG', 'PDF', '#F43F5E') },
    'gif-to-jpg':        { bg: '#D97706', svg: _conv('GIF', 'JPG', '#D97706') },
    'gif-to-png':        { bg: '#16A34A', svg: _conv('GIF', 'PNG', '#16A34A') },
    'bmp-to-jpg':        { bg: '#2563EB', svg: _conv('BMP', 'JPG', '#2563EB') },
    'bmp-to-png':        { bg: '#7C3AED', svg: _conv('BMP', 'PNG', '#7C3AED') },
    'tiff-to-jpg':       { bg: '#C026D3', svg: _conv('TIFF', 'JPG', '#C026D3') },
    'jpg-to-gif':        { bg: '#D97706', svg: _conv('JPG', 'GIF', '#D97706') },
    'png-to-gif':        { bg: '#059669', svg: _conv('PNG', 'GIF', '#059669') },
    'crop':              { bg: '#EA580C', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M12 6v22h22" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12h22v22" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'rotate':            { bg: '#2563EB', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M30 20a10 10 0 11-3-7" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M30 6v8h-8" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'flip':              { bg: '#7C3AED', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M20 6v28" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 2.5"/><rect x="7" y="13" width="10" height="14" rx="1.5" fill="#fff"/><rect x="23" y="13" width="10" height="14" rx="1.5" stroke="#fff" stroke-width="2.5"/></svg>` },
    'grayscale':         { bg: '#6B7280', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="12" stroke="#fff" stroke-width="3"/><path d="M20 8a12 12 0 000 24z" fill="#fff"/></svg>` },
    'watermark':         { bg: '#059669', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="12" stroke="#fff" stroke-width="3"/><path d="M24 16a5 5 0 100 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>` },
    'round-corners':     { bg: '#EC4899', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="7" width="26" height="26" rx="9" stroke="#fff" stroke-width="3.2"/></svg>` },
    'meme-generator':    { bg: '#F59E0B', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="13" stroke="#fff" stroke-width="3"/><circle cx="15" cy="17" r="1.8" fill="#fff"/><circle cx="25" cy="17" r="1.8" fill="#fff"/><path d="M13 22c1.8 3.5 4.5 5 7 5s5.2-1.5 7-5" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>` },
    'blur-face':         { bg: '#6366F1', svg: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="16" r="6" stroke="#fff" stroke-width="2.8"/><path d="M9 32c0-5 5-8 11-8s11 3 11 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><path d="M13 13h14M13 17h14M13 21h14" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    'remove-background': { bg: '#0EA5E9', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="7" width="26" height="26" rx="3" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 2.5"/><circle cx="20" cy="18" r="4.5" fill="#fff"/><path d="M11 30c0-4 4-6 9-6s9 2 9 6" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>` },
    'heic-to-jpg':       { bg: '#F97316', svg: _conv('HEIC', 'JPG', '#F97316') },
    'image-to-ico':      { bg: '#7C3AED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="9" y="9" width="22" height="22" rx="3" stroke="#fff" stroke-width="2.8"/><rect x="13" y="13" width="6" height="6" rx="0.5" fill="#fff"/><rect x="21" y="13" width="6" height="6" rx="0.5" fill="#fff"/><rect x="13" y="21" width="6" height="6" rx="0.5" fill="#fff"/><rect x="21" y="21" width="6" height="6" rx="0.5" fill="#fff"/></svg>` },
    'jpg-to-svg':        { bg: '#10B981', svg: _conv('JPG', 'SVG', '#10B981') },
    'html-to-image':     { bg: '#0EA5E9', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="9" width="28" height="22" rx="2.5" stroke="#fff" stroke-width="2.8"/><path d="M6 16h28" stroke="#fff" stroke-width="2.5"/><circle cx="10" cy="12.5" r="1.3" fill="#fff"/><circle cx="14" cy="12.5" r="1.3" fill="#fff"/><circle cx="18" cy="12.5" r="1.3" fill="#fff"/></svg>` },
    'merge-images':      { bg: '#D97706', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="10" width="12" height="20" rx="2" stroke="#fff" stroke-width="2.8"/><rect x="22" y="10" width="12" height="20" rx="2" stroke="#fff" stroke-width="2.8"/><path d="M18 20h4m-2-2 2 2-2 2" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'passport-photo':    { bg: '#3B82F6', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="9" y="5" width="22" height="30" rx="2.5" stroke="#fff" stroke-width="2.8"/><circle cx="20" cy="17" r="5" stroke="#fff" stroke-width="2.5"/><path d="M12 30c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    'image-splitter':    { bg: '#F97316', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="7" width="26" height="26" rx="2" stroke="#fff" stroke-width="2.8"/><path d="M20 7v26M7 20h26" stroke="#fff" stroke-width="2.5"/></svg>` },
    'resize-in-kb':      { bg: '#D97706', svg: `<svg viewBox="0 0 40 40" fill="none"><text x="20" y="26" font-family="Arial" font-size="14" font-weight="900" fill="#fff" text-anchor="middle">KB</text></svg>` },
    'pixelate-image':    { bg: '#6366F1', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="10" width="6" height="6" fill="#fff"/><rect x="18" y="10" width="6" height="6" fill="#fff" fill-opacity="0.7"/><rect x="26" y="10" width="4" height="6" fill="#fff"/><rect x="10" y="18" width="6" height="6" fill="#fff" fill-opacity="0.7"/><rect x="18" y="18" width="6" height="6" fill="#fff"/><rect x="26" y="18" width="4" height="6" fill="#fff" fill-opacity="0.7"/><rect x="10" y="26" width="6" height="4" fill="#fff"/><rect x="18" y="26" width="6" height="4" fill="#fff" fill-opacity="0.7"/><rect x="26" y="26" width="4" height="4" fill="#fff"/></svg>` },
    'svg-to-png':        { bg: '#D97706', svg: _conv('SVG', 'PNG', '#D97706') },
    'svg-to-jpg':        { bg: '#EA580C', svg: _conv('SVG', 'JPG', '#EA580C') },
    'pdf-to-png':        { bg: '#E11D48', svg: _conv('PDF', 'PNG', '#E11D48') },
    'pdf-tools':         { bg: '#EF4444', svg: `<svg viewBox="0 0 40 40" fill="none"><path d="M10 6h14l6 6v22a2 2 0 01-2 2H10a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#fff" opacity="0.9"/><text x="12" y="28" font-family="Arial" font-size="7.5" font-weight="800" fill="#EF4444">PDF</text></svg>` },
    'merge-pdf':         { bg: '#2563EB', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="12" height="16" rx="2" fill="#fff" opacity="0.6"/><rect x="22" y="16" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M16 20l6-4v8z" fill="#fff"/></svg>` },
    'split-pdf':         { bg: '#D97706', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="6" width="24" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 8v24" stroke="#fff" stroke-width="2.5" stroke-dasharray="3 2"/><path d="M16 20l-4 3v-6z" fill="#fff"/><path d="M24 20l4 3v-6z" fill="#fff"/></svg>` },
    'rotate-pdf':        { bg: '#16A34A', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="8" width="20" height="24" rx="2" fill="#fff" opacity="0.3"/><path d="M26 16a8 8 0 11-12 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M26 12v5h-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'compress-pdf':      { bg: '#DC2626', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 14v8M20 22l-3 3M20 22l3 3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 28h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>` },
    'reorder-pdf':       { bg: '#7C3AED', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="8" width="20" height="6" rx="1.5" fill="#fff" opacity="0.5"/><rect x="10" y="17" width="20" height="6" rx="1.5" fill="#fff"/><rect x="10" y="26" width="20" height="6" rx="1.5" fill="#fff" opacity="0.5"/></svg>` },
    'extract-pdf':       { bg: '#059669', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M20 16v10M17 19l3-3 3 3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    'remove-pdf':        { bg: '#E11D48', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><path d="M15 19l10 8M25 19l-10 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>` },
    'add-page-numbers':  { bg: '#EA580C', svg: `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="28" rx="2" fill="#fff" opacity="0.3"/><text x="20" y="25" font-family="Arial" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">1</text></svg>` },
  }

  const mainLinks = ['compress', 'resize', 'pdf-tools']

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
    <button class="mobile-user-btn" id="mobileUserBtn" aria-label="Account">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </button>
    <button class="hamburger" id="hamburgerBtn" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>`

  const header = document.createElement('header')
  header.id = 'site-header'
  header.innerHTML = `<div class="header-inner">${logoHTML + navHTML}</div>`

  const toolCategories = [
    { name: t.cat_convert || 'Convert', slugs: ['jpg-to-png','png-to-jpg','jpg-to-webp','webp-to-jpg','png-to-webp','webp-to-png','gif-to-jpg','gif-to-png','bmp-to-jpg','bmp-to-png','tiff-to-jpg','heic-to-jpg'] },
    { name: t.cat_optimize || 'Optimize', slugs: ['compress','resize','resize-in-kb'] },
    { name: t.cat_modify || 'Modify', slugs: ['crop','rotate','flip','grayscale','round-corners','pixelate-image'] },
    { name: t.cat_create || 'Create', slugs: ['meme-generator','merge-images','image-splitter','watermark','jpg-to-gif','png-to-gif'] },
    { name: t.cat_export || 'Export', slugs: ['jpg-to-pdf','png-to-pdf','image-to-ico','jpg-to-svg','svg-to-png','svg-to-jpg','html-to-image'] },
    { name: t.cat_photo || 'Photo', slugs: ['passport-photo','remove-background','blur-face'] },
    { name: t.cat_pdf || 'PDF Tools', slugs: ['pdf-tools','merge-pdf','split-pdf','rotate-pdf','compress-pdf','reorder-pdf','extract-pdf','remove-pdf','add-page-numbers'] },
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
  const rightCats = toolCategories.slice(3)     // Create, Export, Photo, PDF Tools

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

  // Mobile user panel (separate from tools dropdown)
  const mobileUserPanel = document.createElement('div')
  mobileUserPanel.id = 'mobileUserPanel'
  mobileUserPanel.innerHTML = `<div id="mobileAuthContent"></div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:12px;font-weight:600;color:var(--text-muted);font-family:'DM Sans',sans-serif;">Dark mode</span>
      <button id="mobileThemeBtn" style="background:none;border:1px solid var(--border-light);border-radius:8px;padding:6px 10px;cursor:pointer;color:var(--text-secondary);display:flex;align-items:center;gap:6px;font-size:12px;font-family:'DM Sans',sans-serif;"></button>
    </div>`

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
  document.body.insertBefore(mobileUserPanel, dropdown.nextSibling)
  document.body.appendChild(footer)

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle')
  const mobileThemeBtn = document.getElementById('mobileThemeBtn')

  // Mobile user button
  const mobileUserBtn = document.getElementById('mobileUserBtn')
  if (mobileUserBtn) {
    mobileUserBtn.addEventListener('click', () => {
      const panel = document.getElementById('mobileUserPanel')
      panel.classList.toggle('open')
      // Close tools dropdown if open
      dropdown.classList.remove('open')
    })
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('mobileUserPanel')
      if (!panel.contains(e.target) && e.target !== mobileUserBtn && !mobileUserBtn.contains(e.target)) {
        panel.classList.remove('open')
      }
    })
  }
  function updateToggleIcons() {
    const icon = getCurrentTheme() === 'dark' ? sunIcon : moonIcon
    const label = getCurrentTheme() === 'dark' ? 'Light' : 'Dark'
    if (themeToggle) themeToggle.innerHTML = icon
    if (mobileThemeBtn) mobileThemeBtn.innerHTML = icon + ' ' + label
  }
  updateToggleIcons()
  function handleToggle() {
    toggleTheme(); updateToggleIcons()
    syncPreference('theme', getCurrentTheme())
  }
  if (themeToggle) themeToggle.addEventListener('click', handleToggle)
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', handleToggle)

  // ── Auth integration ──
  const authSlot = document.getElementById('authSlot')
  const mobileAuthContent = document.getElementById('mobileAuthContent')

  function renderAuthUI(user) {
    // Desktop auth
    if (authSlot) {
      authSlot.innerHTML = ''
      if (user) {
        authSlot.appendChild(createUserDropdown(user, async () => { clearPreferencesSync(); await supabaseSignOut() }))
      } else {
        authSlot.appendChild(createSignInButton(() => showSignInModal()))
      }
    }
    // Mobile auth panel
    if (mobileAuthContent) {
      mobileAuthContent.innerHTML = ''
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        const avatar = user.user_metadata?.avatar_url
        mobileAuthContent.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            ${avatar ? `<img src="${avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer" />` : `<div style="width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;font-family:'DM Sans',sans-serif;">${name.charAt(0).toUpperCase()}</div>`}
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--text-primary);font-family:'DM Sans',sans-serif;">${name}</div>
              <div style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;">${user.email || ''}</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <a href="/account" style="flex:1;padding:9px;border-radius:8px;border:1.5px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-primary);text-decoration:none;text-align:center;font-family:'DM Sans',sans-serif;">My Files</a>
            <button id="mobileSignOutBtn" style="flex:1;padding:9px;border-radius:8px;border:1.5px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-muted);background:var(--bg-card);cursor:pointer;font-family:'DM Sans',sans-serif;">Sign out</button>
          </div>`
        mobileAuthContent.querySelector('#mobileSignOutBtn')?.addEventListener('click', async () => { clearPreferencesSync(); await supabaseSignOut(); document.getElementById('mobileUserPanel').classList.remove('open') })
        if (mobileUserBtn) mobileUserBtn.classList.add('signed-in')
      } else {
        const btn = document.createElement('button')
        btn.style.cssText = 'width:100%;padding:11px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-weight:700;font-family:"DM Sans",sans-serif;cursor:pointer;'
        btn.textContent = 'Sign in'
        btn.addEventListener('click', () => { showSignInModal(); document.getElementById('mobileUserPanel').classList.remove('open') })
        mobileAuthContent.appendChild(btn)
        if (mobileUserBtn) mobileUserBtn.classList.remove('signed-in')
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

  // ── Auto-inject "Save to Account" next to download links ──
  const processedDLs = new WeakSet()
  function checkForDownloadLinks() {
    const links = document.querySelectorAll('a[download], a[id*="download"], a[class*="download"]')
    links.forEach(a => {
      if (processedDLs.has(a)) return
      if (a.style.display === 'none' || !a.offsetParent) return
      const href = a.href || ''
      if (!href.startsWith('blob:') && !href.startsWith('data:')) return
      processedDLs.add(a)
      const toolSlug = window.location.pathname.split('/').filter(Boolean).pop() || 'unknown'
      maybeShowSaveButton(a.parentElement, () => fetch(href).then(r => r.blob()), () => a.download || 'image.jpg', toolSlug)
    })
  }
  const dlObserver = new MutationObserver(checkForDownloadLinks)
  dlObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'display', 'href'] })
  setInterval(checkForDownloadLinks, 2000)

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
        syncPreference('language', newLang)
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