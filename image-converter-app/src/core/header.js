import { tools } from '../tools/configs.js'

export function injectHeader() {
  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; }
    #site-header {
      background: #fff;
      border-bottom: 1px solid #E8E0D5;
      font-family: 'DM Sans', sans-serif;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    #site-header .header-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    #site-header .logo {
      font-family: 'Fraunces', serif;
      font-weight: 900;
      font-size: 26px;
      color: #2C1810;
      text-decoration: none;
      letter-spacing: -0.02em;
      flex-shrink: 0;
    }
    #site-header .logo em { font-style: italic; color: #C84B31; }
    #site-header .desktop-nav {
      display: flex;
      align-items: center;
      gap: 0;
      flex: 1;
    }
    #site-header .nav-link {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #5A4A3A;
      text-decoration: none;
      transition: color 0.15s;
      white-space: nowrap;
    }
    #site-header .nav-link:hover { color: #C84B31; }
    #site-header .nav-link.active { color: #C84B31; font-weight: 600; }
    #site-header .more-btn {
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #5A4A3A;
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
    #site-header .more-btn:hover { color: #C84B31; }
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
      background: #2C1810;
      border-radius: 2px;
      transition: all 0.2s;
    }
    #dropdown-menu {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background: #fff;
      border-bottom: 1px solid #E8E0D5;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      z-index: 99;
      max-height: calc(100vh - 64px);
      overflow-y: auto;
    }
    #dropdown-menu.open { display: block; }
    #dropdown-menu .dropdown-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 8px;
    }
    #dropdown-menu a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #2C1810;
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
    }
    #dropdown-menu a:hover { background: #F5F0E8; color: #C84B31; }
    #dropdown-menu a.active { background: #FDE8E3; color: #C84B31; }

    @media (max-width: 768px) {
      #site-header .desktop-nav { display: none; }
      #site-header .hamburger { display: flex; }
      #dropdown-menu .dropdown-inner {
        grid-template-columns: 1fr 1fr;
        padding: 12px;
        gap: 6px;
      }
      #dropdown-menu a { font-size: 12px; padding: 10px; }
    }
  `
  document.head.appendChild(style)

  const currentPath = window.location.pathname.replace(/^\//, '').split('?')[0]

  const icons = {
    'jpg-to-png': '🖼️', 'png-to-jpg': '🖼️', 'jpg-to-webp': '🔄',
    'webp-to-jpg': '🔄', 'png-to-webp': '🔄', 'webp-to-png': '🔄',
    'compress': '📦', 'resize': '↔️', 'jpg-to-pdf': '📄', 'png-to-pdf': '📄',
  }
  const shortNames = {
    'jpg-to-png': 'JPG to PNG', 'png-to-jpg': 'PNG to JPG',
    'jpg-to-webp': 'JPG to WebP', 'webp-to-jpg': 'WebP to JPG',
    'png-to-webp': 'PNG to WebP', 'webp-to-png': 'WebP to PNG',
    'compress': 'Compress Image', 'resize': 'Resize Image',
    'jpg-to-pdf': 'JPG to PDF', 'png-to-pdf': 'PNG to PDF',
  }
  const mainLinks = ['compress', 'resize', 'jpg-to-png', 'jpg-to-pdf']

  const header = document.createElement('header')
  header.id = 'site-header'
  header.innerHTML = `
    <div class="header-inner">
      <a href="/" class="logo">relah<em>convert</em></a>
      <nav class="desktop-nav">
        ${mainLinks.map(slug => `<a href="/${slug}" class="nav-link ${currentPath === slug ? 'active' : ''}">${shortNames[slug]}</a>`).join('')}
        <button class="more-btn" id="moreBtn">More Tools <span class="arrow">▼</span></button>
      </nav>
      <button class="hamburger" id="hamburgerBtn" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `

  const dropdown = document.createElement('div')
  dropdown.id = 'dropdown-menu'
  dropdown.innerHTML = `
    <div class="dropdown-inner">
      ${Object.values(tools).map(tool => `
        <a href="/${tool.slug}" class="${currentPath === tool.slug ? 'active' : ''}">
          <span>${icons[tool.slug] || '🔧'}</span>${shortNames[tool.slug] || tool.title}
        </a>
      `).join('')}
    </div>
  `

  document.body.insertBefore(header, document.body.firstChild)
  document.body.insertBefore(dropdown, header.nextSibling)

  const moreBtn = document.getElementById('moreBtn')
  const hamburgerBtn = document.getElementById('hamburgerBtn')

  function toggleDropdown(e) {
    e.stopPropagation()
    const isOpen = dropdown.classList.toggle('open')
    if (moreBtn) moreBtn.classList.toggle('open', isOpen)
  }

  if (moreBtn) moreBtn.addEventListener('click', toggleDropdown)
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDropdown)

  document.addEventListener('click', () => {
    dropdown.classList.remove('open')
    if (moreBtn) moreBtn.classList.remove('open')
  })
  dropdown.addEventListener('click', e => e.stopPropagation())
}