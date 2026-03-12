import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
let allTemplates = []
let templatePage = 0
const PER_PAGE = 20

if (document.head) {
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:#F2F2F2;'
  const style = document.createElement('style')
  style.textContent = `
    *{box-sizing:border-box}
    .tool-wrap{max-width:1100px;margin:0 auto;padding:32px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:20px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:#C84B31}
    .tool-sub{font-size:13px;color:#7A6A5A;margin:0}

    /* ── Toolbar ── */
    .meme-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:4px;background:#fff;border:1.5px solid #E0D8D0;border-radius:12px;padding:8px 10px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .tb-sep{width:1px;height:22px;background:#E0D8D0;margin:0 2px;flex-shrink:0}
    .tb-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:#3A2A1A;transition:all 0.12s;font-family:'DM Sans',sans-serif;font-weight:600;flex-shrink:0}
    .tb-btn:hover,.tb-btn.active{background:#F5EDE8;color:#C84B31}
    .tb-btn.active{background:#C84B31;color:#fff}
    .tb-select{height:30px;padding:0 6px;border:1.5px solid #E0D8D0;border-radius:6px;font-size:12px;font-family:'DM Sans',sans-serif;color:#3A2A1A;background:#fff;cursor:pointer;outline:none}
    .tb-select:focus{border-color:#C84B31}
    .tb-color-wrap{position:relative;width:30px;height:30px;border-radius:6px;overflow:hidden;border:1.5px solid #E0D8D0;cursor:pointer;flex-shrink:0}
    .tb-color-wrap input[type=color]{position:absolute;inset:-4px;width:calc(100%+8px);height:calc(100%+8px);border:none;cursor:pointer;padding:0}
    .tb-color-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;pointer-events:none}
    .tb-add-btn{padding:0 12px;height:30px;border:none;border-radius:6px;background:#C84B31;color:#fff;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:all 0.12s}
    .tb-add-btn:hover{background:#A63D26}

    /* ── Canvas area ── */
    .meme-canvas-wrap{position:relative;background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;min-height:200px;display:flex;align-items:center;justify-content:center}
    .meme-canvas-wrap canvas{display:block;max-width:100%}
    .meme-empty{padding:60px 24px;text-align:center;color:#B0A090;font-size:13px;font-family:'DM Sans',sans-serif}

    /* ── Text layer (overlay divs on canvas) ── */
    .meme-text-layer{position:absolute;inset:0;pointer-events:none}
    .meme-text-box{position:absolute;pointer-events:all;cursor:move;user-select:none;line-height:1.2;white-space:pre-wrap;word-break:break-word;outline:none;min-width:40px;min-height:20px}
    .meme-text-box.selected{outline:2px dashed #C84B31;outline-offset:2px}
    .meme-text-box:focus{cursor:text}

    /* ── Bottom row ── */
    .meme-bottom-row{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
    .meme-source-btn{flex:1;min-width:140px;padding:11px 14px;border:none;border-radius:9px;background:#C84B31;color:#fff;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-source-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .meme-source-or{display:flex;align-items:center;font-size:12px;font-weight:700;color:#B0A090;font-family:'DM Sans',sans-serif;flex-shrink:0}
    .meme-dl-btn{flex:1;min-width:140px;padding:11px 14px;border:none;border-radius:9px;background:#2C1810;color:#fff;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-dl-btn:hover{background:#1a0f09;transform:translateY(-1px)}
    .meme-dl-btn:disabled{background:#C4B8A8;cursor:not-allowed;transform:none}
    .meme-fmt-toggle{display:flex;gap:4px;align-items:center}
    .meme-fmt-btn{padding:6px 12px;border:1.5px solid #DDD5C8;border-radius:7px;background:#fff;font-size:11px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.12s}
    .meme-fmt-btn.active{background:#C84B31;border-color:#C84B31;color:#fff}

    /* ── Template modal ── */
    .meme-modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .meme-modal{background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.2)}
    .meme-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid #E8E0D5;flex-shrink:0}
    .meme-modal-header h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:0}
    .meme-modal-close{width:30px;height:30px;border:none;border-radius:8px;background:#F5F0E8;color:#5A4A3A;font-size:14px;cursor:pointer;transition:all 0.15s}
    .meme-modal-close:hover{background:#C84B31;color:#fff}
    .meme-search{width:100%;padding:11px 16px;border:none;border-bottom:1px solid #E8E0D5;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#FAFAF8;outline:none;flex-shrink:0}
    .meme-search::placeholder{color:#C4B8A8}
    .meme-template-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;overflow-y:auto;flex:1}
    @media(max-width:600px){.meme-template-grid{grid-template-columns:repeat(2,1fr)}}
    .meme-template-item{border:1.5px solid #E8E0D5;border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.15s;background:#FAFAF8}
    .meme-template-item:hover{border-color:#C84B31;box-shadow:0 4px 12px rgba(200,75,49,0.15);transform:translateY(-2px)}
    .meme-template-item img{width:100%;height:110px;object-fit:cover;display:block;background:#F0EAE4}
    .meme-template-item span{display:block;font-size:10px;font-weight:600;color:#5A4A3A;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Sans',sans-serif}
    .meme-pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 16px;border-top:1px solid #E8E0D5;flex-shrink:0}
    .meme-page-btn{padding:7px 16px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#2C1810;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-page-btn:hover:not(:disabled){border-color:#C84B31;color:#C84B31}
    .meme-page-btn:disabled{opacity:0.4;cursor:not-allowed}
    .meme-page-info{font-size:12px;color:#9A8A7A;font-family:'DM Sans',sans-serif}

    /* ── Color picker dropdown ── */
    .color-dropdown{position:absolute;z-index:100;background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);display:none}
    .color-dropdown.open{display:block}
    .color-swatch-grid{display:grid;grid-template-columns:repeat(10,18px);gap:3px}
    .color-swatch{width:18px;height:18px;border-radius:3px;cursor:pointer;border:1px solid rgba(0,0,0,0.08);transition:transform 0.1s}
    .color-swatch:hover{transform:scale(1.3);z-index:1;position:relative}

    .seo-section{max-width:700px;margin:40px auto 0;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
    .seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin:0 0 12px}
    .faq-item{border-top:1px solid #E8E0D5;padding:10px 0}
    .faq-item h4{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif}
  `
  document.head.appendChild(style)
}

const FONTS = ['Impact', 'Arial', 'Arial Black', 'Verdana', 'Comic Sans MS', 'Times New Roman', 'Courier New', 'Georgia']
const SIZES = [12,14,16,18,20,24,28,32,36,42,48,56,64,72,96]
const SWATCHES = [
  '#000000','#222222','#444444','#666666','#888888','#aaaaaa','#cccccc','#dddddd','#eeeeee','#ffffff',
  '#c0392b','#e74c3c','#e67e22','#f39c12','#f1c40f','#2ecc71','#27ae60','#1abc9c','#3498db','#2980b9',
  '#9b59b6','#8e44ad','#e91e63','#ff5722','#ff9800','#4caf50','#009688','#00bcd4','#2196f3','#673ab7',
  '#ffcdd2','#ffe0b2','#fff9c4','#c8e6c9','#b2ebf2','#bbdefb','#e1bee7','#f8bbd0','#d7ccc8','#cfd8dc',
  '#b71c1c','#e65100','#f57f17','#1b5e20','#006064','#0d47a1','#4a148c','#880e4f','#3e2723','#212121',
]

document.getElementById('app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">Meme <em class="brand-em">Generator</em></h1>
    <p class="tool-sub">Create memes online. Add text, pick fonts, drag to position. Private — runs in your browser.</p>
  </div>

  <!-- Toolbar -->
  <div class="meme-toolbar" id="toolbar">
    <select class="tb-select" id="tbFont" style="width:120px" title="Font">
      ${FONTS.map(f=>`<option value="${f}" ${f==='Impact'?'selected':''}>${f}</option>`).join('')}
    </select>
    <select class="tb-select" id="tbSize" style="width:58px" title="Size">
      ${SIZES.map(s=>`<option value="${s}" ${s===36?'selected':''}>${s}</option>`).join('')}
    </select>
    <div class="tb-sep"></div>
    <button class="tb-btn" id="tbBold" title="Bold"><b>B</b></button>
    <button class="tb-btn" id="tbItalic" title="Italic"><i>I</i></button>
    <button class="tb-btn" id="tbUnder" title="Underline"><u>U</u></button>
    <div class="tb-sep"></div>
    <div style="position:relative">
      <button class="tb-btn" id="tbTextColorBtn" title="Text color" style="font-size:16px">A</button>
      <div class="color-dropdown" id="textColorDropdown">
        <div style="font-size:10px;font-weight:600;color:#9A8A7A;margin-bottom:6px;font-family:'DM Sans',sans-serif">TEXT COLOR</div>
        <div class="color-swatch-grid" id="textSwatches"></div>
      </div>
    </div>
    <div style="position:relative">
      <button class="tb-btn" id="tbBgColorBtn" title="Background color" style="font-size:16px">▩</button>
      <div class="color-dropdown" id="bgColorDropdown">
        <div style="font-size:10px;font-weight:600;color:#9A8A7A;margin-bottom:6px;font-family:'DM Sans',sans-serif">BACKGROUND COLOR</div>
        <div class="color-swatch-grid" id="bgSwatches"></div>
        <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
          <div class="color-swatch" data-color="transparent" style="background:white;border:1px dashed #aaa;font-size:9px;display:flex;align-items:center;justify-content:center;width:36px;color:#888">None</div>
        </div>
      </div>
    </div>
    <div class="tb-sep"></div>
    <button class="tb-btn" id="tbAlignL" title="Align left">⬛</button>
    <button class="tb-btn active" id="tbAlignC" title="Align center">☰</button>
    <button class="tb-btn" id="tbAlignR" title="Align right">⬛</button>
    <div class="tb-sep"></div>
    <button class="tb-btn" id="tbDup" title="Duplicate text">⧉</button>
    <button class="tb-btn" id="tbDel" title="Delete text" style="color:#C84B31">🗑</button>
    <div class="tb-sep"></div>
    <button class="tb-add-btn" id="tbAddText">+ Add Text</button>
  </div>

  <!-- Canvas -->
  <div class="meme-canvas-wrap" id="canvasWrap">
    <div class="meme-empty" id="emptyMsg">⬆ Upload an image or choose a template to get started</div>
    <canvas id="mainCanvas" style="display:none"></canvas>
    <div class="meme-text-layer" id="textLayer"></div>
  </div>

  <!-- Bottom row -->
  <div class="meme-bottom-row">
    <button class="meme-source-btn" id="uploadBtn">⬆ Upload Image</button>
    <span class="meme-source-or">or</span>
    <button class="meme-source-btn" id="templateBtn">🎭 Choose Template</button>
    <input type="file" id="fileInput" accept="image/*" style="display:none">
    <input type="file" id="overlayInput" accept="image/*" style="display:none">
    <div style="flex:1;min-width:140px;display:flex;gap:6px;align-items:center">
      <button class="meme-source-btn" id="addStickerBtn" style="background:#7A6A5A;flex:1">🖼 Add Sticker</button>
    </div>
    <div class="meme-fmt-toggle">
      <button class="meme-fmt-btn active" id="fmtJpg">JPG</button>
      <button class="meme-fmt-btn" id="fmtPng">PNG</button>
    </div>
    <button class="meme-dl-btn" id="downloadBtn" disabled>⬇ Download</button>
  </div>

  <!-- Template modal -->
  <div class="meme-modal-overlay" id="templateModal" style="display:none">
    <div class="meme-modal">
      <div class="meme-modal-header">
        <h2>Choose a Meme Template</h2>
        <button class="meme-modal-close" id="closeModal">✕</button>
      </div>
      <input type="text" id="templateSearch" class="meme-search" placeholder="Search... (try 'drake', 'dog', 'brain')">
      <div class="meme-template-grid" id="templateGrid"></div>
      <div class="meme-pagination" id="pagination" style="display:none">
        <button class="meme-page-btn" id="prevPage">← Prev</button>
        <span class="meme-page-info" id="pageInfo"></span>
        <button class="meme-page-btn" id="nextPage">Next →</button>
      </div>
    </div>
  </div>
</div>
`

injectHeader()

// ── State ──
let mainImg = null
let overlayImg = null, overlayX = 0, overlayY = 0, overlayW = 0, overlayH = 0
let selectedBox = null
let downloadFmt = 'jpg'
let filteredTemplates = []
let canvasScale = 1  // CSS width / canvas width ratio

const canvas = document.getElementById('mainCanvas')
const ctx = canvas.getContext('2d')
const textLayer = document.getElementById('textLayer')
const canvasWrap = document.getElementById('canvasWrap')
const emptyMsg = document.getElementById('emptyMsg')
const downloadBtn = document.getElementById('downloadBtn')

// ── Toolbar state ──
let tbState = {
  font: 'Impact', size: 36, bold: false, italic: false, underline: false,
  color: '#ffffff', bg: 'transparent', align: 'center'
}

// ── Color swatches ──
function buildSwatches(containerId, onPick) {
  const el = document.getElementById(containerId)
  SWATCHES.forEach(c => {
    const s = document.createElement('div')
    s.className = 'color-swatch'
    s.style.background = c
    s.dataset.color = c
    s.onclick = () => { onPick(c); closeAllDropdowns() }
    el.appendChild(s)
  })
}
buildSwatches('textSwatches', c => {
  tbState.color = c
  document.getElementById('tbTextColorBtn').style.color = c
  document.getElementById('tbTextColorBtn').style.textShadow = c === '#ffffff' ? '0 0 0 #999' : 'none'
  if (selectedBox) { selectedBox.style.color = c }
})
buildSwatches('bgSwatches', c => {
  tbState.bg = c
  if (selectedBox) { selectedBox.style.background = c === 'transparent' ? 'transparent' : c }
})
// "None" bg swatch
document.querySelector('#bgColorDropdown [data-color="transparent"]').onclick = () => {
  tbState.bg = 'transparent'
  if (selectedBox) selectedBox.style.background = 'transparent'
  closeAllDropdowns()
}

function closeAllDropdowns() {
  document.getElementById('textColorDropdown').classList.remove('open')
  document.getElementById('bgColorDropdown').classList.remove('open')
}
document.getElementById('tbTextColorBtn').onclick = e => {
  e.stopPropagation()
  document.getElementById('bgColorDropdown').classList.remove('open')
  document.getElementById('textColorDropdown').classList.toggle('open')
}
document.getElementById('tbBgColorBtn').onclick = e => {
  e.stopPropagation()
  document.getElementById('textColorDropdown').classList.remove('open')
  document.getElementById('bgColorDropdown').classList.toggle('open')
}
document.addEventListener('click', closeAllDropdowns)

// ── Toolbar controls ──
document.getElementById('tbFont').onchange = e => {
  tbState.font = e.target.value
  if (selectedBox) selectedBox.style.fontFamily = tbState.font
}
document.getElementById('tbSize').onchange = e => {
  tbState.size = parseInt(e.target.value)
  if (selectedBox) selectedBox.style.fontSize = tbState.size + 'px'
}
document.getElementById('tbBold').onclick = () => {
  tbState.bold = !tbState.bold
  document.getElementById('tbBold').classList.toggle('active', tbState.bold)
  if (selectedBox) selectedBox.style.fontWeight = tbState.bold ? '900' : '400'
}
document.getElementById('tbItalic').onclick = () => {
  tbState.italic = !tbState.italic
  document.getElementById('tbItalic').classList.toggle('active', tbState.italic)
  if (selectedBox) selectedBox.style.fontStyle = tbState.italic ? 'italic' : 'normal'
}
document.getElementById('tbUnder').onclick = () => {
  tbState.underline = !tbState.underline
  document.getElementById('tbUnder').classList.toggle('active', tbState.underline)
  if (selectedBox) selectedBox.style.textDecoration = tbState.underline ? 'underline' : 'none'
}
;['L','C','R'].forEach(a => {
  document.getElementById('tbAlign'+a).onclick = () => {
    tbState.align = {L:'left',C:'center',R:'right'}[a]
    ;['L','C','R'].forEach(x => document.getElementById('tbAlign'+x).classList.remove('active'))
    document.getElementById('tbAlign'+a).classList.add('active')
    if (selectedBox) selectedBox.style.textAlign = tbState.align
  }
})
document.getElementById('tbDup').onclick = () => {
  if (!selectedBox) return
  const clone = selectedBox.cloneNode(true)
  clone.style.left = (parseFloat(selectedBox.style.left) + 2) + '%'
  clone.style.top = (parseFloat(selectedBox.style.top) + 2) + '%'
  setupTextBox(clone)
  textLayer.appendChild(clone)
  selectBox(clone)
}
document.getElementById('tbDel').onclick = () => {
  if (selectedBox) { selectedBox.remove(); selectedBox = null }
}
document.getElementById('tbAddText').onclick = () => addTextBox('TEXT', 50, 50)

// ── Add text box ──
function addTextBox(text, xPct, yPct) {
  if (!mainImg) return
  const box = document.createElement('div')
  box.className = 'meme-text-box selected'
  box.contentEditable = 'false'
  box.textContent = text
  box.style.cssText = `
    left:${xPct}%; top:${yPct}%;
    transform:translate(-50%,-50%);
    font-family:${tbState.font};
    font-size:${tbState.size}px;
    font-weight:${tbState.bold?'900':'700'};
    font-style:${tbState.italic?'italic':'normal'};
    text-decoration:${tbState.underline?'underline':'none'};
    color:${tbState.color};
    background:${tbState.bg};
    text-align:${tbState.align};
    padding:4px 8px;
    border-radius:4px;
    max-width:90%;
    text-transform:uppercase;
    -webkit-text-stroke: 1px #000;
    paint-order: stroke fill;
  `
  setupTextBox(box)
  textLayer.appendChild(box)
  selectBox(box)
}

function setupTextBox(box) {
  let isDragging = false, startX, startY, origLeft, origTop

  // Single click = select, double click = edit
  box.addEventListener('mousedown', e => {
    if (e.detail === 2) return  // double click handled separately
    e.stopPropagation()
    selectBox(box)
    isDragging = false
    startX = e.clientX; startY = e.clientY
    const rect = canvasWrap.getBoundingClientRect()
    origLeft = parseFloat(box.style.left)
    origTop = parseFloat(box.style.top)

    function onMove(e) {
      const dx = (e.clientX - startX) / rect.width * 100
      const dy = (e.clientY - startY) / rect.height * 100
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) isDragging = true
      box.style.left = Math.max(0, Math.min(100, origLeft + dx)) + '%'
      box.style.top = Math.max(0, Math.min(100, origTop + dy)) + '%'
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  })

  box.addEventListener('dblclick', e => {
    e.stopPropagation()
    selectBox(box)
    box.contentEditable = 'true'
    box.focus()
    // select all
    const range = document.createRange()
    range.selectNodeContents(box)
    const sel = window.getSelection()
    sel.removeAllRanges(); sel.addRange(range)
  })

  box.addEventListener('blur', () => {
    box.contentEditable = 'false'
    if (!box.textContent.trim()) box.remove()
  })

  // Touch drag
  box.addEventListener('touchstart', e => {
    e.stopPropagation()
    selectBox(box)
    const t0 = e.touches[0]
    startX = t0.clientX; startY = t0.clientY
    const rect = canvasWrap.getBoundingClientRect()
    origLeft = parseFloat(box.style.left)
    origTop = parseFloat(box.style.top)
    function onMove(e) {
      const t = e.touches[0]
      const dx = (t.clientX - startX) / rect.width * 100
      const dy = (t.clientY - startY) / rect.height * 100
      box.style.left = Math.max(0, Math.min(100, origLeft + dx)) + '%'
      box.style.top = Math.max(0, Math.min(100, origTop + dy)) + '%'
    }
    function onEnd() {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }, { passive: true })
}

function selectBox(box) {
  document.querySelectorAll('.meme-text-box').forEach(b => b.classList.remove('selected'))
  box.classList.add('selected')
  selectedBox = box
  // Sync toolbar to box's current styles
  const s = box.style
  document.getElementById('tbFont').value = s.fontFamily.replace(/['"]/g,'').split(',')[0].trim() || 'Impact'
  document.getElementById('tbSize').value = parseInt(s.fontSize) || 36
  document.getElementById('tbBold').classList.toggle('active', s.fontWeight === '900' || s.fontWeight === 'bold')
  document.getElementById('tbItalic').classList.toggle('active', s.fontStyle === 'italic')
  document.getElementById('tbUnder').classList.toggle('active', s.textDecoration?.includes('underline'))
  document.getElementById('tbTextColorBtn').style.color = s.color || '#fff'
}

// Deselect when clicking canvas bg
canvasWrap.addEventListener('click', e => {
  if (e.target === canvasWrap || e.target === canvas || e.target === textLayer) {
    document.querySelectorAll('.meme-text-box').forEach(b => b.classList.remove('selected'))
    selectedBox = null
  }
})

// ── Set image ──
function setImage(img) {
  mainImg = img
  const maxW = canvasWrap.clientWidth - 32 || 700
  const scale = Math.min(1, maxW / img.naturalWidth)
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.style.width = (img.naturalWidth * scale) + 'px'
  canvas.style.height = (img.naturalHeight * scale) + 'px'
  canvasScale = scale
  ctx.drawImage(img, 0, 0)
  canvas.style.display = 'block'
  emptyMsg.style.display = 'none'
  textLayer.style.width = canvas.style.width
  textLayer.style.height = canvas.style.height
  downloadBtn.disabled = false

  // Add default top/bottom text boxes
  textLayer.innerHTML = ''
  addTextBox('TOP TEXT', 50, 10)
  addTextBox('BOTTOM TEXT', 50, 90)
  selectBox(textLayer.firstChild)
}

// ── Upload ──
document.getElementById('uploadBtn').onclick = () => { document.getElementById('fileInput').value=''; document.getElementById('fileInput').click() }
document.getElementById('fileInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => { const img = new Image(); img.onload = () => setImage(img); img.src = ev.target.result }
  reader.readAsDataURL(f)
}

// ── Sticker / overlay ──
document.getElementById('addStickerBtn').onclick = () => { document.getElementById('overlayInput').value=''; document.getElementById('overlayInput').click() }
document.getElementById('overlayInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => {
      // Add as a draggable image overlay box
      const box = document.createElement('div')
      box.className = 'meme-text-box selected'
      const pct = Math.min(40, (img.naturalWidth / canvas.width) * 100)
      const aspect = img.naturalHeight / img.naturalWidth
      box.style.cssText = `left:50%;top:50%;transform:translate(-50%,-50%);width:${pct}%;background:transparent;padding:0;cursor:move`
      const i = document.createElement('img')
      i.src = ev.target.result
      i.style.cssText = 'width:100%;display:block;pointer-events:none'
      box.appendChild(i)
      setupTextBox(box)
      textLayer.appendChild(box)
      selectBox(box)
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(f)
}

// ── Format toggle ──
document.getElementById('fmtJpg').onclick = () => { downloadFmt='jpg'; document.getElementById('fmtJpg').classList.add('active'); document.getElementById('fmtPng').classList.remove('active') }
document.getElementById('fmtPng').onclick = () => { downloadFmt='png'; document.getElementById('fmtPng').classList.add('active'); document.getElementById('fmtJpg').classList.remove('active') }

// ── Download: flatten canvas + text layer ──
document.getElementById('downloadBtn').onclick = () => {
  if (!mainImg) return
  // Deselect all so no dashed outlines
  document.querySelectorAll('.meme-text-box').forEach(b => b.classList.remove('selected'))
  selectedBox = null

  // Use html2canvas approach — draw canvas then each text box
  const W = canvas.width, H = canvas.height
  const out = document.createElement('canvas')
  out.width = W; out.height = H
  const octx = out.getContext('2d')
  octx.drawImage(canvas, 0, 0)

  const wrapRect = canvasWrap.getBoundingClientRect()
  const canRect = canvas.getBoundingClientRect()

  const boxes = textLayer.querySelectorAll('.meme-text-box')
  boxes.forEach(box => {
    const boxRect = box.getBoundingClientRect()
    // Position relative to canvas
    const rx = (boxRect.left - canRect.left) / canRect.width
    const ry = (boxRect.top - canRect.top) / canRect.height
    const rw = boxRect.width / canRect.width
    const rh = boxRect.height / canRect.height
    const cx = rx * W
    const cy = ry * H
    const cw = rw * W
    const ch = rh * H

    const imgEl = box.querySelector('img')
    if (imgEl) {
      // It's a sticker
      const si = new Image(); si.src = imgEl.src
      octx.drawImage(si, cx, cy, cw, ch)
      return
    }

    const style = window.getComputedStyle(box)
    const fs = parseFloat(style.fontSize) / canRect.height * H
    const font = `${style.fontStyle} ${style.fontWeight} ${fs}px ${style.fontFamily}`
    octx.font = font
    octx.fillStyle = style.color
    octx.textAlign = style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'right' : 'left'
    octx.textBaseline = 'top'

    // Background
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
      octx.fillStyle = style.backgroundColor
      octx.fillRect(cx, cy, cw, ch)
      octx.fillStyle = style.color
    }

    // -webkit-text-stroke
    const stroke = parseFloat(style.webkitTextStrokeWidth) || 0
    if (stroke > 0 || style.webkitTextStrokeColor) {
      octx.lineWidth = (stroke / canRect.height * H) * 2 || fs / 12
      octx.strokeStyle = style.webkitTextStrokeColor || '#000'
    }

    const textX = octx.textAlign === 'center' ? cx + cw / 2 : octx.textAlign === 'right' ? cx + cw : cx
    const lineH = fs * 1.25
    const text = box.textContent
    const words = text.split(' ')
    const lines = []
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (octx.measureText(test).width > cw * 0.98 && line) { lines.push(line); line = w } else line = test
    }
    lines.push(line)
    lines.forEach((l, i) => {
      const ly = cy + i * lineH
      if (stroke > 0) octx.strokeText(l, textX, ly)
      octx.fillText(l, textX, ly)
    })
  })

  const mime = downloadFmt === 'png' ? 'image/png' : 'image/jpeg'
  out.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${downloadFmt}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

// ── Templates ──
document.getElementById('templateBtn').onclick = async () => {
  document.getElementById('templateModal').style.display = 'flex'
  if (allTemplates.length) { filteredTemplates = allTemplates; showPage(0); return }
  document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#9A8A7A;font-size:13px;grid-column:1/-1;font-family:\'DM Sans\',sans-serif">Loading templates…</p>'
  try {
    const res = await fetch('https://api.imgflip.com/get_memes')
    const json = await res.json()
    allTemplates = json.data.memes
    filteredTemplates = allTemplates
    showPage(0)
  } catch { document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#C84B31;font-size:13px;grid-column:1/-1">Failed to load.</p>' }
}
document.getElementById('closeModal').onclick = () => { document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateModal').onclick = e => { if (e.target === document.getElementById('templateModal')) document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateSearch').oninput = e => {
  const q = e.target.value.toLowerCase().trim()
  filteredTemplates = q ? allTemplates.filter(m => m.name.toLowerCase().includes(q)) : allTemplates
  showPage(0)
}
document.getElementById('prevPage').onclick = () => { if (templatePage > 0) showPage(templatePage - 1) }
document.getElementById('nextPage').onclick = () => { if ((templatePage + 1) * PER_PAGE < filteredTemplates.length) showPage(templatePage + 1) }

function showPage(page) {
  templatePage = page
  const total = filteredTemplates.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const slice = filteredTemplates.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  document.getElementById('templateGrid').innerHTML = slice.map(m =>
    `<div class="meme-template-item" data-url="${m.url}"><img src="${m.url}" alt="${m.name}" loading="lazy"><span>${m.name}</span></div>`
  ).join('')
  document.getElementById('templateGrid').querySelectorAll('.meme-template-item').forEach(item => {
    item.onclick = () => {
      const img = new Image(); img.crossOrigin = 'anonymous'
      img.onload = () => { setImage(img); document.getElementById('templateModal').style.display = 'none' }
      img.onerror = () => { const img2 = new Image(); img2.onload = () => { setImage(img2); document.getElementById('templateModal').style.display = 'none' }; img2.src = item.dataset.url }
      img.src = item.dataset.url
    }
  })
  const pag = document.getElementById('pagination')
  if (totalPages > 1) {
    pag.style.display = 'flex'
    document.getElementById('pageInfo').textContent = `Page ${page + 1} of ${totalPages}`
    document.getElementById('prevPage').disabled = page === 0
    document.getElementById('nextPage').disabled = page >= totalPages - 1
  } else { pag.style.display = 'none' }
}

// ── SEO ──
;(function injectSEO() {
  const s = t.seo?.['meme-generator']
  if (!s) return
  const sec = document.createElement('section')
  sec.className = 'seo-section'
  sec.innerHTML = `<h2>${s.h2a||''}</h2><p>${s.body||''}</p>${(s.faqs||[]).map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}`
  document.getElementById('app').appendChild(sec)
})()