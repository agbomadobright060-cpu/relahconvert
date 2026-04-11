import { tools } from '../tools/configs.js'

const icons = {
  'jpg-to-png': '🖼️',
  'png-to-jpg': '🖼️',
  'jpg-to-webp': '🔄',
  'webp-to-jpg': '🔄',
  'png-to-webp': '🔄',
  'webp-to-png': '🔄',
  'compress': '📦',
  'resize': '↔️',
  'resize-in-kb': '📏',
  'pixelate-image': '🟦',
  'svg-to-png': '🖼️',
  'svg-to-jpg': '🖼️',
  'jpg-to-pdf': '📄',
  'png-to-pdf': '📄',
  'pdf-to-png': '🖼️',
}

export function renderToolsNav(currentSlug) {
  const currentPath = currentSlug || window.location.pathname.replace(/^\//, '').split('?')[0]

  const toolList = Object.values(tools)

  const html = `
    <div style="margin-top:48px; padding-top:32px; border-top:1px solid #E8E0D5;">
      <div style="font-size:11px; font-weight:600; color:#9A8A7A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:16px;">All Tools</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:10px;">
        ${toolList.map(tool => {
          const isActive = tool.slug === currentPath
          return `
            <a href="/${tool.slug}" style="
              display:flex; align-items:center; gap:10px;
              padding:10px 14px; border-radius:10px;
              border:1.5px solid ${isActive ? '#C84B31' : '#E8E0D5'};
              background:${isActive ? '#FDE8E3' : '#fff'};
              text-decoration:none;
              color:${isActive ? '#C84B31' : '#2C1810'};
              font-size:13px; font-weight:500;
              font-family:'DM Sans',sans-serif;
              transition:all 0.15s;
            "
            onmouseover="if('${tool.slug}'!=='${currentPath}'){this.style.borderColor='#C84B31';this.style.color='#C84B31'}"
            onmouseout="if('${tool.slug}'!=='${currentPath}'){this.style.borderColor='#E8E0D5';this.style.color='#2C1810'}"
            >
              <span style="font-size:16px;">${icons[tool.slug] || '🔧'}</span>
              <span>${tool.title.replace(' Converter', '').replace(' Compressor', ' Compress').replace(' Resizer', ' Resize')}</span>
            </a>
          `
        }).join('')}
      </div>
    </div>
  `

  return html
}

export function injectToolsNav(currentSlug) {
  const app = document.querySelector('#app > div')
  if (!app) return
  const nav = document.createElement('div')
  nav.innerHTML = renderToolsNav(currentSlug)
  app.appendChild(nav.firstElementChild)
}