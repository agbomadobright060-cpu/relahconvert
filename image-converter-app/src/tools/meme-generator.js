import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

// JSZip not needed for meme generator (single output)

const t = getT()

const IMGFLIP_TEMPLATES = [
  { id: '181913649', name: 'Drake Pointing', keywords: ['drake','approve','disapprove','pointing'] },
  { id: '112126428', name: 'Distracted Boyfriend', keywords: ['distracted','boyfriend','girlfriend','looking'] },
  { id: '55311130', name: 'This Is Fine', keywords: ['this is fine','dog','fire','okay'] },
  { id: '87743020', name: 'Two Buttons', keywords: ['two buttons','buttons','choice','decision'] },
  { id: '129242436', name: 'Change My Mind', keywords: ['change my mind','crowder','table','debate'] },
  { id: '93895088', name: 'Expanding Brain', keywords: ['expanding brain','brain','galaxy','evolving'] },
  { id: '131087935', name: "Gru's Plan", keywords: ['gru','plan','minions','steps'] },
  { id: '61579', name: 'One Does Not Simply', keywords: ['one does not simply','boromir','lord of the rings','mordor'] },
  { id: '155067746', name: 'Surprised Pikachu', keywords: ['surprised pikachu','shock','pokemon','surprised'] },
  { id: '188390779', name: 'Woman Yelling at Cat', keywords: ['woman yelling','cat','real housewives','table'] },
  { id: '8072786', name: 'Doge', keywords: ['doge','dog','shibe','wow','such'] },
  { id: '101470', name: 'Ancient Aliens', keywords: ['ancient aliens','guy','hair','aliens'] },
  { id: '61544', name: 'Bad Luck Brian', keywords: ['bad luck brian','unlucky','fail'] },
  { id: '61585', name: 'First World Problems', keywords: ['first world problems','crying','rain'] },
  { id: '61532', name: 'The Most Interesting Man', keywords: ['most interesting man','dos equis','interesting','i dont always'] },
  { id: '4087833', name: 'Waiting Skeleton', keywords: ['waiting','skeleton','still waiting','patience'] },
  { id: '124822590', name: 'Left Exit 12', keywords: ['left exit','car','highway','turn'] },
  { id: '134797956', name: 'Batman Slapping Robin', keywords: ['batman','robin','slapping','stop'] },
  { id: '217743513', name: 'UNO Draw 25', keywords: ['uno','draw','cards','why not both'] },
  { id: '178591752', name: 'Tuxedo Winnie The Pooh', keywords: ['winnie','pooh','fancy','tuxedo','classy'] },
  { id: '196652226', name: 'Spongebob Ight Imma Head Out', keywords: ['spongebob','leaving','imma head out','bye'] },
  { id: '102156234', name: 'Mocking Spongebob', keywords: ['mocking','spongebob','alternating','caps'] },
  { id: '135256802', name: 'Epic Handshake', keywords: ['handshake','agree','both','epic'] },
  { id: '91538330', name: 'Bike Fall', keywords: ['bike','fall','stick figure','own goal'] },
  { id: '148909805', name: 'Monkey Puppet', keywords: ['monkey','puppet','side eye','awkward'] },
  { id: '247375501', name: 'Buff Doge vs Cheems', keywords: ['buff doge','cheems','strong','weak','vs'] },
  { id: '222403160', name: 'The Scroll Of Truth', keywords: ['scroll','truth','monk','running away'] },
  { id: '119139145', name: 'Blinking White Guy', keywords: ['blinking','white guy','drew scanlon','surprised'] },
  { id: '252600902', name: 'Always Has Been', keywords: ['always has been','astronaut','gun','earth'] },
  { id: '161865971', name: 'Masked Bane', keywords: ['bane','batman','mask','no','nobody cared'] },
]

document.getElementById('app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title"><span class="t1">Meme</span> <em class="brand-em">Generator</em></h1>
    <p class="tool-sub">Create memes online. Choose a template or upload your own image. Private — runs in your browser.</p>
  </div>

  <div class="meme-layout">
    <!-- LEFT: controls -->
    <div class="meme-controls">

      <!-- Image source -->
      <div class="meme-section">
        <label class="meme-label">Image</label>
        <div class="meme-btn-row">
          <button class="meme-pick-btn" id="uploadBtn">⬆ Upload Image</button>
          <button class="meme-pick-btn" id="templateBtn">🎭 Choose Template</button>
        </div>
        <input type="file" id="fileInput" accept="image/*" style="display:none">
      </div>

      <!-- Text options -->
      <div class="meme-section">
        <label class="meme-label">Top Text <span class="meme-optional">(optional)</span></label>
        <input type="text" id="topText" class="meme-input" placeholder="TOP TEXT">
      </div>

      <div class="meme-section">
        <label class="meme-label">Bottom Text <span class="meme-optional">(optional)</span></label>
        <input type="text" id="bottomText" class="meme-input" placeholder="BOTTOM TEXT">
      </div>

      <div class="meme-section">
        <label class="meme-label">Text Position</label>
        <div class="meme-toggle-row">
          <button class="meme-toggle active" id="insideBtn" data-val="inside">Inside Image</button>
          <button class="meme-toggle" id="outsideBtn" data-val="outside">Outside Image</button>
        </div>
      </div>

      <div class="meme-section">
        <label class="meme-label">Font Size: <span id="fontSizeVal">40</span>px</label>
        <input type="range" id="fontSize" min="16" max="100" value="40" class="meme-slider">
      </div>

      <div class="meme-section meme-color-row">
        <div>
          <label class="meme-label">Text Color</label>
          <input type="color" id="textColor" value="#ffffff" class="meme-color">
        </div>
        <div>
          <label class="meme-label">Stroke Color</label>
          <input type="color" id="strokeColor" value="#000000" class="meme-color">
        </div>
      </div>

      <!-- Overlay image -->
      <div class="meme-section">
        <label class="meme-label">Add Overlay Image <span class="meme-optional">(optional — drag to position)</span></label>
        <button class="meme-pick-btn" id="overlayBtn">+ Add Sticker / Image</button>
        <input type="file" id="overlayInput" accept="image/*" style="display:none">
        <div id="overlayControls" style="display:none;margin-top:8px">
          <label class="meme-label">Overlay Size: <span id="overlaySizeVal">30</span>%</label>
          <input type="range" id="overlaySize" min="5" max="100" value="30" class="meme-slider">
          <button class="meme-remove-btn" id="removeOverlay">✕ Remove Overlay</button>
        </div>
      </div>

      <!-- Download -->
      <div class="meme-section">
        <label class="meme-label">Download Format</label>
        <div class="meme-toggle-row">
          <button class="meme-toggle active" id="fmtJpg" data-fmt="jpg">JPG</button>
          <button class="meme-toggle" id="fmtPng" data-fmt="png">PNG</button>
        </div>
      </div>

      <button class="apply-btn" id="downloadBtn" disabled>⬇ Download Meme</button>
    </div>

    <!-- RIGHT: preview -->
    <div class="meme-preview-wrap">
      <div class="meme-preview-box" id="previewBox">
        <p class="meme-placeholder">Select an image or template to get started</p>
      </div>
    </div>
  </div>

  <!-- Template modal -->
  <div class="meme-modal-overlay" id="templateModal" style="display:none">
    <div class="meme-modal">
      <div class="meme-modal-header">
        <h2>Choose a Meme Template</h2>
        <button class="meme-modal-close" id="closeModal">✕</button>
      </div>
      <input type="text" id="templateSearch" class="meme-search" placeholder="Search templates... (try 'dog', 'drake', 'brain')">
      <div class="meme-template-grid" id="templateGrid"></div>
    </div>
  </div>
</div>
`

injectHeader()

// State
let mainImage = null
let overlayImage = null
let overlayX = 0.5
let overlayY = 0.5
let textPosition = 'inside'
let downloadFmt = 'jpg'
let isDraggingOverlay = false
let dragOffsetX = 0
let dragOffsetY = 0
let canvas = null
let ctx = null

// Elements
const fileInput = document.getElementById('fileInput')
const overlayInput = document.getElementById('overlayInput')
const uploadBtn = document.getElementById('uploadBtn')
const templateBtn = document.getElementById('templateBtn')
const overlayBtn = document.getElementById('overlayBtn')
const removeOverlay = document.getElementById('removeOverlay')
const topText = document.getElementById('topText')
const bottomText = document.getElementById('bottomText')
const fontSize = document.getElementById('fontSize')
const fontSizeVal = document.getElementById('fontSizeVal')
const textColor = document.getElementById('textColor')
const strokeColor = document.getElementById('strokeColor')
const overlaySize = document.getElementById('overlaySize')
const overlaySizeVal = document.getElementById('overlaySizeVal')
const overlayControls = document.getElementById('overlayControls')
const downloadBtn = document.getElementById('downloadBtn')
const previewBox = document.getElementById('previewBox')
const templateModal = document.getElementById('templateModal')
const closeModal = document.getElementById('closeModal')
const templateSearch = document.getElementById('templateSearch')
const templateGrid = document.getElementById('templateGrid')
const insideBtn = document.getElementById('insideBtn')
const outsideBtn = document.getElementById('outsideBtn')
const fmtJpg = document.getElementById('fmtJpg')
const fmtPng = document.getElementById('fmtPng')

// Upload
uploadBtn.onclick = () => { fileInput.value = ''; fileInput.click() }
fileInput.onchange = e => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => { mainImage = img; render() }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

// Overlay
overlayBtn.onclick = () => { overlayInput.value = ''; overlayInput.click() }
overlayInput.onchange = e => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => { overlayImage = img; overlayControls.style.display = 'block'; render() }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}
removeOverlay.onclick = () => { overlayImage = null; overlayControls.style.display = 'none'; render() }

// Text position toggle
insideBtn.onclick = () => { textPosition = 'inside'; insideBtn.classList.add('active'); outsideBtn.classList.remove('active'); render() }
outsideBtn.onclick = () => { textPosition = 'outside'; outsideBtn.classList.add('active'); insideBtn.classList.remove('active'); render() }

// Format toggle
fmtJpg.onclick = () => { downloadFmt = 'jpg'; fmtJpg.classList.add('active'); fmtPng.classList.remove('active') }
fmtPng.onclick = () => { downloadFmt = 'png'; fmtPng.classList.add('active'); fmtJpg.classList.remove('active') }

// Live inputs
topText.oninput = render
bottomText.oninput = render
fontSize.oninput = () => { fontSizeVal.textContent = fontSize.value; render() }
textColor.oninput = render
strokeColor.oninput = render
overlaySize.oninput = () => { overlaySizeVal.textContent = overlaySize.value; render() }

// Template modal
templateBtn.onclick = () => { renderTemplates(IMGFLIP_TEMPLATES); templateModal.style.display = 'flex' }
closeModal.onclick = () => { templateModal.style.display = 'none' }
templateModal.onclick = e => { if (e.target === templateModal) templateModal.style.display = 'none' }

templateSearch.oninput = () => {
  const q = templateSearch.value.toLowerCase().trim()
  if (!q) { renderTemplates(IMGFLIP_TEMPLATES); return }
  const filtered = IMGFLIP_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.keywords.some(k => k.includes(q) || q.includes(k.split(' ')[0]))
  )
  renderTemplates(filtered.length ? filtered : IMGFLIP_TEMPLATES.filter(t =>
    t.keywords.some(k => k.split(' ').some(w => w.startsWith(q[0])))
  ).slice(0, 8))
}

function renderTemplates(list) {
  templateGrid.innerHTML = list.map(t => `
    <div class="meme-template-item" data-id="${t.id}" data-name="${t.name}">
      <img src="https://i.imgflip.com/${t.id}/template.jpg" alt="${t.name}" loading="lazy" onerror="this.src='https://i.imgflip.com/${t.id}s.jpg'">
      <span>${t.name}</span>
    </div>
  `).join('')
  templateGrid.querySelectorAll('.meme-template-item').forEach(item => {
    item.onclick = () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { mainImage = img; render(); templateModal.style.display = 'none' }
      img.onerror = () => {
        // try alternate url
        const img2 = new Image()
        img2.crossOrigin = 'anonymous'
        img2.onload = () => { mainImage = img2; render(); templateModal.style.display = 'none' }
        img2.src = `https://i.imgflip.com/${item.dataset.id}s.jpg`
      }
      img.src = `https://i.imgflip.com/${item.dataset.id}/template.jpg`
    }
  })
}

// Render canvas
function render() {
  if (!mainImage) return
  downloadBtn.disabled = false

  const fs = parseInt(fontSize.value)
  const tc = textColor.value
  const sc = strokeColor.value
  const top = topText.value.trim().toUpperCase()
  const bot = bottomText.value.trim().toUpperCase()
  const ovSize = parseInt(overlaySize.value) / 100

  const W = mainImage.naturalWidth
  const H = mainImage.naturalHeight
  const padding = textPosition === 'outside' && (top || bot) ? fs * 2 : 0

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.maxWidth = '100%'
    canvas.style.borderRadius = '8px'
    canvas.style.cursor = overlayImage ? 'move' : 'default'
    previewBox.innerHTML = ''
    previewBox.appendChild(canvas)
    setupDrag()
  }

  const topPad = textPosition === 'outside' && top ? padding : 0
  const botPad = textPosition === 'outside' && bot ? padding : 0

  canvas.width = W
  canvas.height = H + topPad + botPad
  ctx = canvas.getContext('2d')

  // Background for outside text
  if (topPad || botPad) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, canvas.height)
  }

  ctx.drawImage(mainImage, 0, topPad, W, H)

  // Draw text
  ctx.font = `900 ${fs}px Impact, Arial Black, sans-serif`
  ctx.textAlign = 'center'
  ctx.lineWidth = fs / 8
  ctx.strokeStyle = sc
  ctx.fillStyle = tc

  if (top) {
    if (textPosition === 'inside') {
      ctx.strokeText(top, W / 2, topPad + fs + 10)
      ctx.fillText(top, W / 2, topPad + fs + 10)
    } else {
      ctx.strokeText(top, W / 2, fs + 8)
      ctx.fillText(top, W / 2, fs + 8)
    }
  }
  if (bot) {
    if (textPosition === 'inside') {
      ctx.strokeText(bot, W / 2, topPad + H - 12)
      ctx.fillText(bot, W / 2, topPad + H - 12)
    } else {
      ctx.strokeText(bot, W / 2, topPad + H + botPad - 8)
      ctx.fillText(bot, W / 2, topPad + H + botPad - 8)
    }
  }

  // Draw overlay
  if (overlayImage) {
    const ow = W * ovSize
    const oh = (overlayImage.naturalHeight / overlayImage.naturalWidth) * ow
    const ox = overlayX * W - ow / 2
    const oy = overlayY * canvas.height - oh / 2
    ctx.drawImage(overlayImage, ox, oy, ow, oh)
  }
}

function setupDrag() {
  canvas.addEventListener('mousedown', e => {
    if (!overlayImage) return
    isDraggingOverlay = true
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    dragOffsetX = (e.clientX - rect.left) * scaleX
    dragOffsetY = (e.clientY - rect.top) * scaleY
  })
  window.addEventListener('mousemove', e => {
    if (!isDraggingOverlay) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    overlayX = Math.max(0, Math.min(1, (e.clientX - rect.left) * scaleX / canvas.width))
    overlayY = Math.max(0, Math.min(1, (e.clientY - rect.top) * scaleY / canvas.height))
    render()
  })
  window.addEventListener('mouseup', () => { isDraggingOverlay = false })

  // Touch support
  canvas.addEventListener('touchstart', e => {
    if (!overlayImage) return
    isDraggingOverlay = true
    e.preventDefault()
  }, { passive: false })
  window.addEventListener('touchmove', e => {
    if (!isDraggingOverlay) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    overlayX = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height))
    render()
  }, { passive: true })
  window.addEventListener('touchend', () => { isDraggingOverlay = false })
}

// Download
downloadBtn.onclick = () => {
  if (!canvas) return
  const mime = downloadFmt === 'png' ? 'image/png' : 'image/jpeg'
  const ext = downloadFmt
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meme.${ext}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

// SEO
;(function injectSEO() {
  const s = t.seo?.['meme-generator']
  if (!s) return
  const sec = document.createElement('section')
  sec.className = 'seo-section'
  sec.innerHTML = `
    <h2>${s.h2a}</h2>
    <ol>${(s.steps||[]).map(st=>`<li>${st}</li>`).join('')}</ol>
    <h2>${s.h2b}</h2>
    ${s.body||''}
    <h3>${s.h3why||''}</h3>
    <p>${s.why||''}</p>
    <h3>Frequently Asked Questions</h3>
    ${(s.faqs||[]).map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}
    <div class="seo-links">${(s.links||[]).map(l=>`<a href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.getElementById('app').appendChild(sec)
})()