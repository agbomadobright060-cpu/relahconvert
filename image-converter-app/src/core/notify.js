// Shared notification system — stacking errors with dismiss, auto-dismiss success

let container = null

function getContainer() {
  if (container && container.parentNode) return container
  container = document.createElement('div')
  container.id = 'notify-stack'
  container.style.cssText = `
    position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
    z-index:9998;display:flex;flex-direction:column;gap:8px;
    max-width:500px;width:calc(100% - 32px);pointer-events:none;
  `
  document.body.appendChild(container)
  return container
}

function createBanner(msg, type) {
  const el = document.createElement('div')
  const isError = type === 'error'
  el.style.cssText = `
    display:flex;align-items:flex-start;gap:10px;padding:12px 14px;
    border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;
    font-weight:500;line-height:1.5;pointer-events:auto;
    animation:fadeUp 0.25s ease both;
    background:${isError ? 'var(--accent-hover)' : '#22c55e'};
    color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.15);
  `
  const text = document.createElement('span')
  text.style.flex = '1'
  text.textContent = msg

  const closeBtn = document.createElement('button')
  closeBtn.innerHTML = '✕'
  closeBtn.style.cssText = `
    background:none;border:none;color:#fff;font-size:14px;
    cursor:pointer;padding:0 2px;opacity:0.8;flex-shrink:0;
    font-family:'DM Sans',sans-serif;line-height:1;
  `
  closeBtn.addEventListener('click', () => el.remove())

  el.appendChild(text)
  el.appendChild(closeBtn)
  return el
}

export function showError(msg) {
  const c = getContainer()
  const banner = createBanner(msg, 'error')
  c.appendChild(banner)
}

export function showSuccess(msg) {
  const c = getContainer()
  const banner = createBanner(msg, 'success')
  c.appendChild(banner)
  setTimeout(() => { if (banner.parentNode) banner.remove() }, 5000)
}

export function clearAll() {
  if (container && container.parentNode) {
    container.innerHTML = ''
  }
}
