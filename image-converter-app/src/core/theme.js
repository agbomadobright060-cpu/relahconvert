// Theme system: CSS variables + dark mode toggle
// Must be called early (before any styles render) to avoid flash

const THEME_KEY = 'relahconvert-theme'

function getPreferred() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)
}

export function initTheme() {
  // Inject CSS variables
  const style = document.createElement('style')
  style.id = 'theme-vars'
  style.textContent = `
    :root,
    [data-theme="light"] {
      --bg-page: #F2F2F2;
      --bg-card: #ffffff;
      --bg-surface: #F5F0E8;
      --bg-error: #FDE8E3;
      --text-primary: #2C1810;
      --text-secondary: #5A4A3A;
      --text-tertiary: #7A6A5A;
      --text-muted: #9A8A7A;
      --text-on-accent: #ffffff;
      --text-on-dark-btn: #F5F0E8;
      --border: #E8E0D5;
      --border-light: #DDD5C8;
      --accent: #C84B31;
      --accent-hover: #A63D26;
      --accent-bg: #FDE8E3;
      --btn-dark: #2C1810;
      --btn-dark-hover: #1a0f09;
      --btn-disabled: #C4B8A8;
      --overlay: rgba(255,255,255,0.78);
      --shadow: 0 1px 4px rgba(0,0,0,0.08);
      --shadow-lg: 0 6px 20px rgba(200,75,49,0.35);
      --footer-bg: #F2F2F2;
      --checker-a: #cccccc;
      --checker-b: #f0f0f0;
      --badge-green: #22c55e;
      --badge-purple: #7C3AED;
      --badge-purple-hover: #6D28D9;
      --trustpilot: #00b67a;
    }

    [data-theme="dark"] {
      --bg-page: #18181b;
      --bg-card: #27272a;
      --bg-surface: #3f3f46;
      --bg-error: #451a1a;
      --text-primary: #f4f4f5;
      --text-secondary: #d4d4d8;
      --text-tertiary: #a1a1aa;
      --text-muted: #71717a;
      --text-on-accent: #ffffff;
      --text-on-dark-btn: #18181b;
      --border: #3f3f46;
      --border-light: #52525b;
      --accent: #e05a3a;
      --accent-hover: #f07050;
      --accent-bg: #3d1f17;
      --btn-dark: #f4f4f5;
      --btn-dark-hover: #e4e4e7;
      --btn-disabled: #52525b;
      --overlay: rgba(24,24,27,0.85);
      --shadow: 0 1px 4px rgba(0,0,0,0.3);
      --shadow-lg: 0 6px 20px rgba(224,90,58,0.3);
      --footer-bg: #1f1f23;
      --checker-a: #3f3f46;
      --checker-b: #27272a;
      --badge-green: #22c55e;
      --badge-purple: #7C3AED;
      --badge-purple-hover: #6D28D9;
      --trustpilot: #00b67a;
    }
  `
  // Prepend so it loads before other styles
  document.head.insertBefore(style, document.head.firstChild)

  // Apply saved/preferred theme immediately
  applyTheme(getPreferred())
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light'
  applyTheme(current === 'dark' ? 'light' : 'dark')
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light'
}

// Sun/moon toggle SVGs
export const sunIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
export const moonIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
