import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
let allTemplates = [], templatePage = 0
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

    .meme-source-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
    .meme-source-btn{flex:1;max-width:200px;padding:11px 14px;border:none;border-radius:9px;background:#C84B31;color:#fff;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-source-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .meme-or{font-size:12px;font-weight:700;color:#B0A090;font-family:'DM Sans',sans-serif;flex-shrink:0}

    .meme-layout{display:none;grid-template-columns:300px 1fr;gap:20px;align-items:start}
    .meme-layout.visible{display:grid}
    @media(max-width:768px){.meme-layout{grid-template-columns:1fr}}

    .meme-controls{background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border:1.5px solid #E8E0D5;display:flex;flex-direction:column}
    .meme-section{padding:12px 0;border-bottom:1px solid #F0EAE4}
    .meme-section:first-child{padding-top:0}
    .meme-section:last-child{border-bottom:none;padding-bottom:0}
    .meme-label{display:block;font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:7px;font-family:'DM Sans',sans-serif}
    .meme-optional{font-weight:400;text-transform:none;letter-spacing:0;color:#B0A090;font-size:10px}
    .meme-input{width:100%;padding:9px 11px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#FAFAF8;outline:none;transition:border-color 0.15s}
    .meme-input:focus{border-color:#C84B31;background:#fff}
    .meme-input::placeholder{color:#C4B8A8}
    .meme-toggle-row{display:flex;gap:6px}
    .meme-toggle{flex:1;padding:7px 10px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:11px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-toggle:hover{border-color:#C84B31;color:#C84B31}
    .meme-toggle.active{background:#C84B31;border-color:#C84B31;color:#fff}
    .meme-slider{width:100%;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#DDD5C8;outline:none;cursor:pointer;margin-top:4px;display:block}
    .meme-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#C84B31;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.2)}
    .meme-slider::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#C84B31;cursor:pointer;border:none}
    .meme-color-row{display:flex;gap:16px}
    .meme-color-row>div{flex:1}
    .meme-color{width:44px;height:30px;border:1.5px solid #DDD5C8;border-radius:6px;cursor:pointer;padding:2px;background:#fff;display:block;margin-top:4px}
    .meme-pick-btn{width:100%;padding:9px 10px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#2C1810;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-pick-btn:hover{border-color:#C84B31;color:#C84B31;background:#FDE8E3}
    .meme-remove-btn{margin-top:8px;padding:6px 10px;border:1.5px solid #E8D0C8;border-radius:7px;background:#FDE8E3;font-size:11px;font-weight:600;color:#C84B31;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;display:block;width:100%}
    .meme-remove-btn:hover{background:#C84B31;color:#fff;border-color:#C84B31}
    .apply-btn{width:100%;padding:12px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;margin-top:4px}
    .apply-btn:hover{background:#A63D26;transform:translateY(-1px)}

    /* preview column */
    .meme-preview-col{display:flex;flex-direction:column;gap:8px;position:sticky;top:84px}

    /* FLOATING TOOLBAR */
    .ftb{display:none;background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;padding:6px 10px;box-shadow:0 4px 16px rgba(0,0,0,0.12);align-items:center;gap:4px;flex-wrap:nowrap;overflow-x:auto}
    .ftb.show{display:flex}
    .ftb-div{width:1px;height:22px;background:#E0D8D0;margin:0 2px;flex-shrink:0}

    /* font select — real native select, each option shows its own font */
    .ftb-font{height:30px;padding:0 6px;border:1.5px solid #DDD5C8;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#fff;cursor:pointer;outline:none;flex-shrink:0;min-width:110px}
    .ftb-font:focus{border-color:#C84B31}

    /* size select */
    .ftb-size{height:30px;width:58px;padding:0 4px;border:1.5px solid #DDD5C8;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#fff;cursor:pointer;outline:none;flex-shrink:0}
    .ftb-size:focus{border-color:#C84B31}

    /* icon buttons */
    .ftb-btn{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:14px;color:#2C1810;transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-weight:700}
    .ftb-btn:hover{background:#F5EDE8;color:#C84B31}
    .ftb-btn.on{background:#C84B31;color:#fff}

    /* color swatches inline */
    .ftb-color-wrap{position:relative;flex-shrink:0}
    .ftb-swatch-btn{width:30px;height:30px;border:1.5px solid #DDD5C8;border-radius:6px;cursor:pointer;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px;flex-shrink:0}
    .ftb-swatch-btn:hover{border-color:#C84B31}
    .ftb-swatch-letter{font-size:12px;font-weight:700;color:#2C1810;line-height:1;font-family:'DM Sans',sans-serif}
    .ftb-swatch-bar{width:16px;height:3px;border-radius:1px}
    .ftb-swatch-panel{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.14);z-index:100;width:186px}
    .ftb-swatch-panel.open{display:block}
    .ftb-swatch-panel p{font-size:10px;font-weight:700;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;font-family:'DM Sans',sans-serif}
    .ftb-grid{display:flex;flex-wrap:wrap;gap:4px}
    .ftb-dot{width:20px;height:20px;border-radius:4px;cursor:pointer;border:1px solid rgba(0,0,0,0.1);transition:transform 0.1s}
    .ftb-dot:hover{transform:scale(1.25);position:relative;z-index:1}

    /* align buttons */
    .ftb-align{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:#2C1810;transition:all 0.12s;flex-shrink:0}
    .ftb-align:hover{background:#F5EDE8}
    .ftb-align.on{background:#C84B31;color:#fff}

    /* preview box */
    .meme-preview-box{background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px;padding:12px}
    .meme-preview-box canvas{max-width:100%;border-radius:6px;display:block}

    /* modal */
    .meme-modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .meme-modal{background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.2)}
    .meme-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;border-bottom:1px solid #E8E0D5;flex-shrink:0}
    .meme-modal-header h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:0}
    .meme-modal-close{width:30px;height:30px;border:none;border-radius:8px;background:#F5F0E8;color:#5A4A3A;font-size:14px;cursor:pointer}
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

    .seo-section{max-width:700px;margin:40px auto 0;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
    .seo-section p,.seo-section li{font-size:13px;color:#5A4A3A;line-height:1.6}
    .faq-item{border-top:1px solid #E8E0D5;padding:10px 0}
    .faq-item h4{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif}
  `
  document.head.appendChild(style)
}

// All fonts that actually work in browsers without loading
const FONTS = [
  { label: 'Impact',          value: 'Impact, Haettenschweiler, sans-serif' },
  { label: 'Arial Black',     value: '"Arial Black", Gadget, sans-serif' },
  { label: 'Arial',           value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia',         value: 'Georgia, serif' },
  { label: 'Courier New',     value: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans',      value: '"Comic Sans MS", cursive' },
]

const TEXT_COLORS = [
  '#ffffff','#000000','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff6600','#ff4444',
  '#ffd700','#44dd44','#4488ff','#aa44ff','#ff44aa','#44ffee','#888888','#444444','#cc9966','#334455'
]
const STROKE_COLORS = [
  '#000000','#ffffff','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff6600','#888888',
  '#ffd700','#cc0000','#005500','#000088','#440044','#004444','#222222','#666666','#cc9966','#334455'
]

document.getElementById('app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">Meme <em class="brand-em">Generator</em></h1>
    <p class="tool-sub">Create memes online. Choose a template or upload your own image. Private — runs in your browser.</p>
  </div>

  <div class="meme-source-row">
    <button class="meme-source-btn" id="uploadBtn">⬆ Upload Image</button>
    <span class="meme-or">or</span>
    <button class="meme-source-btn" id="templateBtn">🎭 Choose Template</button>
    <input type="file" id="fileInput" accept="image/*" style="display:none">
  </div>

  <div class="meme-layout" id="memeLayout">

    <!-- LEFT PANEL -->
    <div class="meme-controls">
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
          <button class="meme-toggle active" id="insideBtn">Inside Image</button>
          <button class="meme-toggle" id="outsideBtn">Outside Image</button>
        </div>
      </div>
      <div class="meme-section">
        <label class="meme-label">Font Size: <span id="fontSizeVal">40</span>px</label>
        <input type="range" id="fontSizeSlider" min="12" max="120" value="40" class="meme-slider">
      </div>
      <div class="meme-section meme-color-row">
        <div>
          <label class="meme-label">Text Color</label>
          <input type="color" id="textColorPicker" value="#ffffff" class="meme-color">
        </div>
        <div>
          <label class="meme-label">Stroke Color</label>
          <input type="color" id="strokeColorPicker" value="#000000" class="meme-color">
        </div>
      </div>
      <div class="meme-section">
        <label class="meme-label">Add Overlay <span class="meme-optional">(optional — drag to position)</span></label>
        <button class="meme-pick-btn" id="overlayBtn">+ Add Sticker / Image</button>
        <input type="file" id="overlayInput" accept="image/*" style="display:none">
        <div id="overlayControls" style="display:none;margin-top:8px">
          <label class="meme-label">Size: <span id="overlaySizeVal">30</span>%</label>
          <input type="range" id="overlaySizeSlider" min="5" max="100" value="30" class="meme-slider">
          <button class="meme-remove-btn" id="removeOverlay">✕ Remove Overlay</button>
        </div>
      </div>
      <div class="meme-section">
        <label class="meme-label">Download Format</label>
        <div class="meme-toggle-row">
          <button class="meme-toggle active" id="fmtJpg">JPG</button>
          <button class="meme-toggle" id="fmtPng">PNG</button>
        </div>
      </div>
      <button class="apply-btn" id="downloadBtn">⬇ Download Meme</button>
    </div>

    <!-- RIGHT COLUMN: toolbar + preview -->
    <div class="meme-preview-col">

      <!-- FLOATING TOOLBAR — shows on text input focus -->
      <div class="ftb" id="ftb">

        <!-- Font family -->
        <select class="ftb-font" id="ftbFont">
          ${FONTS.map(f => `<option value="${f.value}" style="font-family:${f.value}">${f.label}</option>`).join('')}
        </select>

        <!-- Font size -->
        <select class="ftb-size" id="ftbSize">
          ${[12,14,16,18,20,24,28,32,36,42,48,56,64,72,96,120].map(s =>
            `<option value="${s}"${s===40?' selected':''}>${s}</option>`).join('')}
        </select>

        <div class="ftb-div"></div>

        <!-- Bold / Italic / Underline -->
        <button class="ftb-btn" id="ftbB" title="Bold"><b>B</b></button>
        <button class="ftb-btn" id="ftbI" title="Italic"><i>I</i></button>
        <button class="ftb-btn" id="ftbU" title="Underline"><u>U</u></button>

        <div class="ftb-div"></div>

        <!-- Text color swatch button -->
        <div class="ftb-color-wrap" id="tcWrap">
          <button class="ftb-swatch-btn" id="tcBtn" title="Text color">
            <span class="ftb-swatch-letter">A</span>
            <div class="ftb-swatch-bar" id="tcBar" style="background:#ffffff"></div>
          </button>
          <div class="ftb-swatch-panel" id="tcPanel">
            <p>Text Color</p>
            <div class="ftb-grid" id="tcGrid"></div>
          </div>
        </div>

        <!-- Stroke color swatch button -->
        <div class="ftb-color-wrap" id="scWrap">
          <button class="ftb-swatch-btn" id="scBtn" title="Stroke color">
            <span class="ftb-swatch-letter" style="color:#888;font-size:10px">STR</span>
            <div class="ftb-swatch-bar" id="scBar" style="background:#000000"></div>
          </button>
          <div class="ftb-swatch-panel" id="scPanel">
            <p>Stroke Color</p>
            <div class="ftb-grid" id="scGrid"></div>
          </div>
        </div>

        <div class="ftb-div"></div>

        <!-- Alignment -->
        <button class="ftb-align on" id="ftbAC" title="Center">≡</button>
        <button class="ftb-align" id="ftbAL" title="Left">⬛</button>
        <button class="ftb-align" id="ftbAR" title="Right">⬛</button>
      </div>

      <div class="meme-preview-box" id="previewBox"></div>
    </div>
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

// ── State — single source of truth ──
const S = {
  font: FONTS[0].value,
  size: 40,
  bold: false,
  italic: false,
  underline: false,
  align: 'center',
  textColor: '#ffffff',
  strokeColor: '#000000',
  position: 'inside',
  fmt: 'jpg'
}

let mainImage = null, overlayImage = null
let overlayX = 0.5, overlayY = 0.5, isDragging = false
let canvas = null, ctx = null
let filteredTemplates = []

// ── DOM refs ──
const $ = id => document.getElementById(id)
const topText = $('topText'), bottomText = $('bottomText')
const fontSizeSlider = $('fontSizeSlider'), fontSizeVal = $('fontSizeVal')
const textColorPicker = $('textColorPicker'), strokeColorPicker = $('strokeColorPicker')
const overlaySizeSlider = $('overlaySizeSlider')
const previewBox = $('previewBox'), memeLayout = $('memeLayout')
const ftb = $('ftb')

// ── Helpers ──
function showLayout() { memeLayout.classList.add('visible') }
function render() {
  if (!mainImage) return
  const fs = S.size
  const W = mainImage.naturalWidth, H = mainImage.naturalHeight
  const maxW = W * 0.92, vpad = fs * 0.5
  const top = topText.value.trim().toUpperCase()
  const bot = bottomText.value.trim().toUpperCase()
  const ovSz = parseInt(overlaySizeSlider.value) / 100

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'max-width:100%;border-radius:6px;display:block'
    previewBox.innerHTML = ''
    previewBox.appendChild(canvas)
    setupDrag()
  }

  let topBand = 0, botBand = 0
  if (S.position === 'outside') {
    if (top) topBand = blockH(top, maxW, fs) + vpad * 2
    if (bot) botBand = blockH(bot, maxW, fs) + vpad * 2
  }

  canvas.width = W; canvas.height = H + topBand + botBand
  ctx = canvas.getContext('2d')

  if (topBand || botBand) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, canvas.height) }
  ctx.drawImage(mainImage, 0, topBand, W, H)

  if (S.position === 'inside') {
    drawText(top, W/2, topBand + vpad + blockH(top,maxW,fs)/2 + fs*0.15, maxW, fs, S.textColor, S.strokeColor)
    drawText(bot, W/2, topBand + H - vpad - blockH(bot,maxW,fs)/2 - fs*0.15, maxW, fs, S.textColor, S.strokeColor)
  } else {
    if (top) drawText(top, W/2, topBand/2, maxW, fs, '#000', '#fff', 'center')
    if (bot) drawText(bot, W/2, topBand+H+botBand/2, maxW, fs, '#000', '#fff', 'center')
  }

  if (overlayImage) {
    const ow = W * ovSz, oh = (overlayImage.naturalHeight / overlayImage.naturalWidth) * ow
    ctx.drawImage(overlayImage, overlayX*W - ow/2, overlayY*canvas.height - oh/2, ow, oh)
  }
}

function fontStr(fs) {
  const style = S.italic ? 'italic ' : ''
  const weight = S.bold ? '900 ' : '700 '
  return `${style}${weight}${fs}px ${S.font}`
}

function wrapLines(text, maxW, fs) {
  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = fontStr(fs)
  const words = text.split(' '), lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (tmp.measureText(test).width > maxW && line) { lines.push(line); line = w } else line = test
  }
  lines.push(line)
  return lines
}

function blockH(text, maxW, fs) {
  return text ? wrapLines(text, maxW, fs).length * fs * 1.3 : 0
}

function drawText(text, cx, cy, maxW, fs, fill, stroke, forceAlign) {
  if (!text) return
  const lines = wrapLines(text, maxW, fs)
  const align = forceAlign || S.align
  ctx.font = fontStr(fs)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(fs / 7, 3)
  ctx.strokeStyle = stroke
  ctx.fillStyle = fill
  const lineH = fs * 1.3, totalH = lines.length * lineH
  const x = align === 'left' ? cx - maxW/2 : align === 'right' ? cx + maxW/2 : cx
  lines.forEach((l, i) => {
    const y = cy - totalH/2 + i*lineH + lineH/2
    ctx.strokeText(l, x, y)
    ctx.fillText(l, x, y)
    if (S.underline) {
      const tw = ctx.measureText(l).width
      const ux = align === 'center' ? x - tw/2 : align === 'right' ? x - tw : x
      ctx.fillStyle = fill
      ctx.fillRect(ux, y + fs*0.55, tw, Math.max(1, fs/18))
    }
  })
}

// ── Upload ──
$('uploadBtn').onclick = () => { $('fileInput').value = ''; $('fileInput').click() }
$('fileInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const r = new FileReader()
  r.onload = ev => { const img = new Image(); img.onload = () => { mainImage = img; canvas = null; showLayout(); render() }; img.src = ev.target.result }
  r.readAsDataURL(f)
}

// ── Overlay ──
$('overlayBtn').onclick = () => { $('overlayInput').value = ''; $('overlayInput').click() }
$('overlayInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const r = new FileReader()
  r.onload = ev => { const img = new Image(); img.onload = () => { overlayImage = img; $('overlayControls').style.display = 'block'; render() }; img.src = ev.target.result }
  r.readAsDataURL(f)
}
$('removeOverlay').onclick = () => { overlayImage = null; $('overlayControls').style.display = 'none'; render() }

// ── Left panel controls ──
topText.oninput = render
bottomText.oninput = render
fontSizeSlider.oninput = () => { S.size = parseInt(fontSizeSlider.value); fontSizeVal.textContent = S.size; $('ftbSize').value = S.size; render() }
overlaySizeSlider.oninput = () => { $('overlaySizeVal').textContent = overlaySizeSlider.value; render() }

// Left panel color pickers sync → state → render
textColorPicker.oninput = textColorPicker.onchange = () => {
  S.textColor = textColorPicker.value
  $('tcBar').style.background = S.textColor
  render()
}
strokeColorPicker.oninput = strokeColorPicker.onchange = () => {
  S.strokeColor = strokeColorPicker.value
  $('scBar').style.background = S.strokeColor
  render()
}

// Position toggles
$('insideBtn').onclick = () => {
  S.position = 'inside'
  $('insideBtn').classList.add('active'); $('outsideBtn').classList.remove('active')
  render()
}
$('outsideBtn').onclick = () => {
  S.position = 'outside'
  $('outsideBtn').classList.add('active'); $('insideBtn').classList.remove('active')
  render()
}

// Format
$('fmtJpg').onclick = () => { S.fmt='jpg'; $('fmtJpg').classList.add('active'); $('fmtPng').classList.remove('active') }
$('fmtPng').onclick = () => { S.fmt='png'; $('fmtPng').classList.add('active'); $('fmtJpg').classList.remove('active') }

// ── Toolbar show/hide ──
let toolbarPinned = false
;[topText, bottomText].forEach(inp => {
  inp.addEventListener('focus', () => ftb.classList.add('show'))
  inp.addEventListener('blur', () => {
    setTimeout(() => {
      if (!toolbarPinned && !ftb.matches(':focus-within')) ftb.classList.remove('show')
    }, 200)
  })
})
ftb.addEventListener('mousedown', () => { toolbarPinned = true })
ftb.addEventListener('mouseup', () => { toolbarPinned = false })

// ── Toolbar: font family ──
$('ftbFont').onchange = () => {
  S.font = $('ftbFont').value
  render()
}

// ── Toolbar: font size ──
$('ftbSize').onchange = () => {
  S.size = parseInt($('ftbSize').value)
  fontSizeSlider.value = S.size
  fontSizeVal.textContent = S.size
  render()
}

// ── Toolbar: B / I / U ──
$('ftbB').onclick = () => { S.bold = !S.bold; $('ftbB').classList.toggle('on', S.bold); render() }
$('ftbI').onclick = () => { S.italic = !S.italic; $('ftbI').classList.toggle('on', S.italic); render() }
$('ftbU').onclick = () => { S.underline = !S.underline; $('ftbU').classList.toggle('on', S.underline); render() }

// ── Toolbar: alignment ──
;[['ftbAC','center'],['ftbAL','left'],['ftbAR','right']].forEach(([id, val]) => {
  $(id).onclick = () => {
    S.align = val
    ;['ftbAC','ftbAL','ftbAR'].forEach(i => $(i).classList.remove('on'))
    $(id).classList.add('on')
    render()
  }
})

// ── Toolbar: color swatches ──
function buildSwatches(gridId, colors, onPick) {
  const grid = $(gridId)
  grid.innerHTML = ''
  colors.forEach(c => {
    const d = document.createElement('div')
    d.className = 'ftb-dot'
    d.style.background = c
    d.title = c
    d.onclick = () => onPick(c)
    grid.appendChild(d)
  })
}

// Text color panel
$('tcBtn').onclick = e => {
  e.stopPropagation()
  $('tcPanel').classList.toggle('open')
  $('scPanel').classList.remove('open')
}
buildSwatches('tcGrid', TEXT_COLORS, c => {
  S.textColor = c
  textColorPicker.value = c
  $('tcBar').style.background = c
  $('tcPanel').classList.remove('open')
  render()
})

// Stroke color panel
$('scBtn').onclick = e => {
  e.stopPropagation()
  $('scPanel').classList.toggle('open')
  $('tcPanel').classList.remove('open')
}
buildSwatches('scGrid', STROKE_COLORS, c => {
  S.strokeColor = c
  strokeColorPicker.value = c
  $('scBar').style.background = c
  $('scPanel').classList.remove('open')
  render()
})

// Close panels on outside click
document.addEventListener('click', () => {
  $('tcPanel').classList.remove('open')
  $('scPanel').classList.remove('open')
})

// ── Templates ──
$('templateBtn').onclick = async () => {
  $('templateModal').style.display = 'flex'
  if (allTemplates.length) { filteredTemplates = allTemplates; showPage(0); return }
  $('templateGrid').innerHTML = '<p style="padding:24px;color:#9A8A7A;font-size:13px;grid-column:1/-1">Loading templates…</p>'
  try {
    const res = await fetch('https://api.imgflip.com/get_memes')
    const json = await res.json()
    allTemplates = json.data.memes; filteredTemplates = allTemplates; showPage(0)
  } catch { $('templateGrid').innerHTML = '<p style="padding:24px;color:#C84B31;font-size:13px;grid-column:1/-1">Failed to load.</p>' }
}
$('closeModal').onclick = () => { $('templateModal').style.display = 'none' }
$('templateModal').onclick = e => { if (e.target === $('templateModal')) $('templateModal').style.display = 'none' }
$('templateSearch').oninput = e => {
  const q = e.target.value.toLowerCase().trim()
  filteredTemplates = q ? allTemplates.filter(m => m.name.toLowerCase().includes(q)) : allTemplates
  showPage(0)
}
$('prevPage').onclick = () => { if (templatePage > 0) showPage(templatePage - 1) }
$('nextPage').onclick = () => { if ((templatePage+1)*PER_PAGE < filteredTemplates.length) showPage(templatePage+1) }

function showPage(page) {
  templatePage = page
  const total = filteredTemplates.length, totalPages = Math.ceil(total / PER_PAGE)
  const slice = filteredTemplates.slice(page*PER_PAGE, (page+1)*PER_PAGE)
  $('templateGrid').innerHTML = slice.map(m =>
    `<div class="meme-template-item" data-url="${m.url}"><img src="${m.url}" alt="${m.name}" loading="lazy"><span>${m.name}</span></div>`
  ).join('')
  $('templateGrid').querySelectorAll('.meme-template-item').forEach(item => {
    item.onclick = () => {
      const img = new Image(); img.crossOrigin = 'anonymous'
      img.onload = () => { mainImage = img; canvas = null; showLayout(); render(); $('templateModal').style.display = 'none' }
      img.onerror = () => { const i2 = new Image(); i2.onload = () => { mainImage = i2; canvas = null; showLayout(); render(); $('templateModal').style.display = 'none' }; i2.src = item.dataset.url }
      img.src = item.dataset.url
    }
  })
  const pag = $('pagination')
  if (totalPages > 1) {
    pag.style.display = 'flex'
    $('pageInfo').textContent = `Page ${page+1} of ${totalPages}`
    $('prevPage').disabled = page === 0
    $('nextPage').disabled = page >= totalPages-1
  } else pag.style.display = 'none'
}

// ── Drag overlay ──
function setupDrag() {
  canvas.addEventListener('mousedown', () => { if (overlayImage) isDragging = true })
  window.addEventListener('mousemove', e => {
    if (!isDragging) return
    const rect = canvas.getBoundingClientRect()
    overlayX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    render()
  })
  window.addEventListener('mouseup', () => { isDragging = false })
  canvas.addEventListener('touchstart', e => { if (overlayImage) { isDragging = true; e.preventDefault() } }, { passive:false })
  window.addEventListener('touchmove', e => {
    if (!isDragging) return
    const rect = canvas.getBoundingClientRect(), t = e.touches[0]
    overlayX = Math.max(0, Math.min(1, (t.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (t.clientY - rect.top) / rect.height))
    render()
  }, { passive:true })
  window.addEventListener('touchend', () => { isDragging = false })
}

// ── Download ──
$('downloadBtn').onclick = () => {
  if (!canvas) return
  const mime = S.fmt === 'png' ? 'image/png' : 'image/jpeg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${S.fmt}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

// ── SEO ──
;(function() {
  const s = t.seo?.['meme-generator']; if (!s) return
  const sec = document.createElement('section'); sec.className = 'seo-section'
  sec.innerHTML = `<h2>${s.h2a||''}</h2><p>${s.body||''}</p>${(s.faqs||[]).map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}`
  document.getElementById('app').appendChild(sec)
})()