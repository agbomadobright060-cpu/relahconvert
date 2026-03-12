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
    .apply-btn:disabled{background:#C4B8A8;cursor:not-allowed;opacity:0.7;transform:none}

    /* preview column */
    .meme-preview-col{display:flex;flex-direction:column;gap:0;position:sticky;top:84px}

    /* FLOATING TOOLBAR — sits above the preview box */
    .meme-float-toolbar{
      display:none;align-items:center;flex-wrap:nowrap;gap:2px;
      background:#fff;border:1.5px solid #E0D8D0;
      border-radius:10px;padding:6px 10px;
      box-shadow:0 4px 16px rgba(0,0,0,0.12);
      margin-bottom:8px;overflow-x:auto;
    }
    .meme-float-toolbar.show{display:flex}
    .ftb-sep{width:1px;height:20px;background:#E0D8D0;margin:0 2px;flex-shrink:0}

    /* font dropdown — styled like iLoveIMG */
    .ftb-font-wrap{position:relative;flex-shrink:0}
    .ftb-font-btn{display:flex;align-items:center;gap:4px;height:30px;padding:0 8px;border:1px solid #E0D8D0;border-radius:6px;background:#fff;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:600;color:#2C1810;cursor:pointer;white-space:nowrap}
    .ftb-font-btn:hover{border-color:#C84B31;color:#C84B31}
    .ftb-font-btn svg{flex-shrink:0}
    .ftb-font-dropdown{display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:50;min-width:160px;overflow:hidden}
    .ftb-font-dropdown.open{display:block}
    .ftb-font-option{padding:8px 14px;font-size:13px;color:#2C1810;cursor:pointer;border-bottom:1px solid #F5F0E8;font-family:'DM Sans',sans-serif;white-space:nowrap}
    .ftb-font-option:last-child{border-bottom:none}
    .ftb-font-option:hover,.ftb-font-option.selected{background:#FDE8E3;color:#C84B31}
    .ftb-font-option.selected{font-weight:700}

    /* size picker */
    .ftb-size-wrap{position:relative;flex-shrink:0}
    .ftb-size-btn{display:flex;align-items:center;gap:3px;height:30px;padding:0 7px;border:1px solid #E0D8D0;border-radius:6px;background:#fff;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;color:#2C1810;cursor:pointer;white-space:nowrap}
    .ftb-size-btn:hover{border-color:#C84B31;color:#C84B31}
    .ftb-size-dropdown{display:none;position:absolute;top:calc(100% + 4px);left:0;background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:50;min-width:70px;max-height:200px;overflow-y:auto}
    .ftb-size-dropdown.open{display:block}
    .ftb-size-option{padding:6px 14px;font-size:12px;color:#2C1810;cursor:pointer;font-family:'DM Sans',sans-serif}
    .ftb-size-option:hover,.ftb-size-option.selected{background:#FDE8E3;color:#C84B31}

    /* icon buttons */
    .ftb-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:#3A2A1A;transition:all 0.12s;font-family:'DM Sans',sans-serif;font-weight:700;flex-shrink:0}
    .ftb-btn:hover{background:#F5EDE8;color:#C84B31}
    .ftb-btn.active{background:#C84B31;color:#fff}

    /* color button with swatch dropdown */
    .ftb-color-wrap{position:relative;flex-shrink:0}
    .ftb-color-trigger{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;transition:all 0.12s;flex-direction:column;gap:1px;padding:4px}
    .ftb-color-trigger:hover{background:#F5EDE8}
    .ftb-color-letter{font-size:13px;font-weight:700;color:#2C1810;line-height:1;font-family:'DM Sans',sans-serif}
    .ftb-color-bar{width:16px;height:3px;border-radius:2px;background:#C84B31}
    .ftb-color-bg-icon{font-size:14px;line-height:1}
    .ftb-swatch-dropdown{display:none;position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);background:#fff;border:1.5px solid #E0D8D0;border-radius:12px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,0.14);z-index:50;min-width:220px}
    .ftb-swatch-dropdown.open{display:block}
    .ftb-swatch-label{font-size:10px;font-weight:700;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;font-family:'DM Sans',sans-serif}
    .ftb-swatch-grid{display:grid;grid-template-columns:repeat(10,18px);gap:3px;margin-bottom:6px}
    .ftb-swatch{width:18px;height:18px;border-radius:3px;cursor:pointer;border:1px solid rgba(0,0,0,0.08);flex-shrink:0;transition:transform 0.1s}
    .ftb-swatch:hover{transform:scale(1.3);position:relative;z-index:1}
    .ftb-swatch.none{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18'%3E%3Cline x1='0' y1='18' x2='18' y2='0' stroke='%23e74c3c' stroke-width='1.5'/%3E%3C/svg%3E") center/cover;border:1px solid #ddd}

    /* preview box */
    .meme-preview-box{background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px;padding:12px}
    .meme-preview-box canvas{max-width:100%;border-radius:6px;display:block}

    /* template modal */
    .meme-modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .meme-modal{background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.2)}
    .meme-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;border-bottom:1px solid #E8E0D5;flex-shrink:0}
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

    .seo-section{max-width:700px;margin:40px auto 0;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
    .seo-section p,.seo-section li{font-size:13px;color:#5A4A3A;line-height:1.6}
    .faq-item{border-top:1px solid #E8E0D5;padding:10px 0}
    .faq-item h4{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif}
  `
  document.head.appendChild(style)
}

const FONTS = ['Impact','Arial Black','Arial','Verdana','Comic Sans MS','Times New Roman','Courier New','Georgia']
const SIZES = [12,14,16,18,20,24,28,32,36,42,48,56,64,72,96]
const SWATCHES_TEXT = ['#ffffff','#000000','#ffff00','#ff0000','#ff6600','#00ff00','#00ffff','#0000ff','#ff00ff','#888888',
  '#ffd700','#ff4444','#ff8800','#44dd44','#4488ff','#aa44ff','#ff44aa','#44ffee','#334455','#cc9966']
const SWATCHES_BG = ['transparent','#ffffff','#000000','#ffff00','#ff0000','#ff6600','#00ff00','#00bcd4','#2196f3','#9c27b0',
  '#ffd700','#ff4444','#ff8800','#44dd44','#4488ff','#aa44ff','#ff44aa','#44ffee','#334455','#cc9966']

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
      <div class="meme-section">
        <label class="meme-label">Add Overlay <span class="meme-optional">(optional — drag to position)</span></label>
        <button class="meme-pick-btn" id="overlayBtn">+ Add Sticker / Image</button>
        <input type="file" id="overlayInput" accept="image/*" style="display:none">
        <div id="overlayControls" style="display:none;margin-top:8px">
          <label class="meme-label" style="margin-top:6px">Size: <span id="overlaySizeVal">30</span>%</label>
          <input type="range" id="overlaySize" min="5" max="100" value="30" class="meme-slider">
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

    <div class="meme-preview-col" id="previewCol">
      <!-- Floating toolbar — above preview box, hidden until text focus -->
      <div class="meme-float-toolbar" id="floatToolbar">

        <!-- Font picker -->
        <div class="ftb-font-wrap" id="ftbFontWrap">
          <button class="ftb-font-btn" id="ftbFontBtn">
            <span id="ftbFontLabel">Impact</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="ftb-font-dropdown" id="ftbFontDropdown">
            ${FONTS.map(f => `<div class="ftb-font-option${f==='Impact'?' selected':''}" data-font="${f}" style="font-family:${f}">${f}</div>`).join('')}
          </div>
        </div>

        <!-- Size picker -->
        <div class="ftb-size-wrap" id="ftbSizeWrap">
          <button class="ftb-size-btn" id="ftbSizeBtn">
            <span id="ftbSizeLabel">40</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <div class="ftb-size-dropdown" id="ftbSizeDropdown">
            ${SIZES.map(s => `<div class="ftb-size-option${s===40?' selected':''}" data-size="${s}">${s}</div>`).join('')}
          </div>
        </div>

        <div class="ftb-sep"></div>
        <button class="ftb-btn" id="ftbBold" title="Bold"><b>B</b></button>
        <button class="ftb-btn" id="ftbItalic" title="Italic"><i>I</i></button>
        <button class="ftb-btn" id="ftbUnder" title="Underline"><u>U</u></button>

        <div class="ftb-sep"></div>

        <!-- Background color -->
        <div class="ftb-color-wrap" id="ftbBgWrap">
          <button class="ftb-color-trigger" id="ftbBgBtn" title="Background color">
            <span class="ftb-color-bg-icon">▩</span>
          </button>
          <div class="ftb-swatch-dropdown" id="ftbBgDropdown">
            <div class="ftb-swatch-label">Background Color</div>
            <div class="ftb-swatch-grid" id="ftbBgSwatches"></div>
          </div>
        </div>

        <!-- Text color -->
        <div class="ftb-color-wrap" id="ftbTcWrap">
          <button class="ftb-color-trigger" id="ftbTcBtn" title="Text color">
            <span class="ftb-color-letter">A</span>
            <div class="ftb-color-bar" id="ftbColorBar"></div>
          </button>
          <div class="ftb-swatch-dropdown" id="ftbTcDropdown">
            <div class="ftb-swatch-label">Text Color</div>
            <div class="ftb-swatch-grid" id="ftbTcSwatches"></div>
          </div>
        </div>

        <div class="ftb-sep"></div>
        <button class="ftb-btn active" id="ftbAlignC" title="Center">≡</button>
        <button class="ftb-btn" id="ftbAlignL" title="Left">⬛</button>
        <button class="ftb-btn" id="ftbAlignR" title="Right">⬛</button>
      </div>

      <div class="meme-preview-box" id="previewBox"></div>
    </div>
  </div>

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
let mainImage = null, overlayImage = null
let overlayX = 0.5, overlayY = 0.5
let textPosition = 'inside', downloadFmt = 'jpg'
let isDragging = false
let canvas = null, ctx = null
let filteredTemplates = []
let tbFont = 'Impact', tbSize = 40, tbBold = false, tbItalic = false, tbUnder = false
let tbAlign = 'center', tbTextColor = '#ffffff', tbStrokeColor = '#000000', tbBgColor = 'transparent'

// ── Element refs ──
const fileInput = document.getElementById('fileInput')
const overlayInput = document.getElementById('overlayInput')
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
const memeLayout = document.getElementById('memeLayout')
const floatToolbar = document.getElementById('floatToolbar')
const insideBtn = document.getElementById('insideBtn')
const outsideBtn = document.getElementById('outsideBtn')
const fmtJpg = document.getElementById('fmtJpg')
const fmtPng = document.getElementById('fmtPng')

// ── Show layout after image load ──
function showLayout() { memeLayout.classList.add('visible') }

// ── Upload ──
document.getElementById('uploadBtn').onclick = () => { fileInput.value = ''; fileInput.click() }
fileInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => { const img = new Image(); img.onload = () => { mainImage = img; canvas = null; showLayout(); render() }; img.src = ev.target.result }
  reader.readAsDataURL(f)
}

// ── Overlay ──
document.getElementById('overlayBtn').onclick = () => { overlayInput.value = ''; overlayInput.click() }
overlayInput.onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = ev => { const img = new Image(); img.onload = () => { overlayImage = img; overlayControls.style.display = 'block'; render() }; img.src = ev.target.result }
  reader.readAsDataURL(f)
}
document.getElementById('removeOverlay').onclick = () => { overlayImage = null; overlayControls.style.display = 'none'; render() }

// ── Toggles ──
insideBtn.onclick = () => { textPosition='inside'; insideBtn.classList.add('active'); outsideBtn.classList.remove('active'); tbTextColor='#ffffff'; textColor.value='#ffffff'; syncToolbarColor(); render() }
outsideBtn.onclick = () => { textPosition='outside'; outsideBtn.classList.add('active'); insideBtn.classList.remove('active'); tbTextColor='#000000'; textColor.value='#000000'; syncToolbarColor(); render() }
fmtJpg.onclick = () => { downloadFmt='jpg'; fmtJpg.classList.add('active'); fmtPng.classList.remove('active') }
fmtPng.onclick = () => { downloadFmt='png'; fmtPng.classList.add('active'); fmtJpg.classList.remove('active') }

// ── Left panel inputs ──
topText.oninput = render
bottomText.oninput = render
fontSize.oninput = () => { tbSize = parseInt(fontSize.value); fontSizeVal.textContent = tbSize; document.getElementById('ftbSizeLabel').textContent = tbSize; render() }
textColor.oninput = textColor.onchange = () => { tbTextColor = textColor.value; syncToolbarColor(); render() }
strokeColor.oninput = strokeColor.onchange = () => { tbStrokeColor = strokeColor.value; render() }
overlaySize.oninput = () => { overlaySizeVal.textContent = overlaySize.value; render() }

function syncToolbarColor() {
  document.getElementById('ftbColorBar').style.background = tbTextColor
}

// ── Floating toolbar show/hide ──
;[topText, bottomText].forEach(inp => {
  inp.addEventListener('focus', () => floatToolbar.classList.add('show'))
  inp.addEventListener('blur', () => {
    setTimeout(() => {
      if (!floatToolbar.contains(document.activeElement)) floatToolbar.classList.remove('show')
    }, 150)
  })
})

// ── Close dropdowns on outside click ──
document.addEventListener('click', e => {
  if (!document.getElementById('ftbFontWrap').contains(e.target)) document.getElementById('ftbFontDropdown').classList.remove('open')
  if (!document.getElementById('ftbSizeWrap').contains(e.target)) document.getElementById('ftbSizeDropdown').classList.remove('open')
  if (!document.getElementById('ftbBgWrap').contains(e.target)) document.getElementById('ftbBgDropdown').classList.remove('open')
  if (!document.getElementById('ftbTcWrap').contains(e.target)) document.getElementById('ftbTcDropdown').classList.remove('open')
})

// ── Font dropdown ──
document.getElementById('ftbFontBtn').onclick = e => { e.stopPropagation(); document.getElementById('ftbFontDropdown').classList.toggle('open') }
document.getElementById('ftbFontDropdown').querySelectorAll('.ftb-font-option').forEach(opt => {
  opt.onclick = e => {
    e.stopPropagation()
    tbFont = opt.dataset.font
    document.getElementById('ftbFontLabel').textContent = tbFont
    document.querySelectorAll('.ftb-font-option').forEach(o => o.classList.remove('selected'))
    opt.classList.add('selected')
    document.getElementById('ftbFontDropdown').classList.remove('open')
    render()
  }
})

// ── Size dropdown ──
document.getElementById('ftbSizeBtn').onclick = e => { e.stopPropagation(); document.getElementById('ftbSizeDropdown').classList.toggle('open') }
document.getElementById('ftbSizeDropdown').querySelectorAll('.ftb-size-option').forEach(opt => {
  opt.onclick = e => {
    e.stopPropagation()
    tbSize = parseInt(opt.dataset.size)
    document.getElementById('ftbSizeLabel').textContent = tbSize
    fontSize.value = tbSize; fontSizeVal.textContent = tbSize
    document.querySelectorAll('.ftb-size-option').forEach(o => o.classList.remove('selected'))
    opt.classList.add('selected')
    document.getElementById('ftbSizeDropdown').classList.remove('open')
    render()
  }
})

// ── B / I / U ──
document.getElementById('ftbBold').onclick = () => { tbBold = !tbBold; document.getElementById('ftbBold').classList.toggle('active', tbBold); render() }
document.getElementById('ftbItalic').onclick = () => { tbItalic = !tbItalic; document.getElementById('ftbItalic').classList.toggle('active', tbItalic); render() }
document.getElementById('ftbUnder').onclick = () => { tbUnder = !tbUnder; document.getElementById('ftbUnder').classList.toggle('active', tbUnder); render() }

// ── Alignment ──
;[['ftbAlignC','center'],['ftbAlignL','left'],['ftbAlignR','right']].forEach(([id,val]) => {
  document.getElementById(id).onclick = () => {
    tbAlign = val
    ;['ftbAlignC','ftbAlignL','ftbAlignR'].forEach(i => document.getElementById(i).classList.remove('active'))
    document.getElementById(id).classList.add('active')
    render()
  }
})

// ── Build swatch grids ──
function buildSwatches(gridId, colors, onPick) {
  const grid = document.getElementById(gridId)
  colors.forEach(c => {
    const s = document.createElement('div')
    s.className = 'ftb-swatch' + (c === 'transparent' ? ' none' : '')
    if (c !== 'transparent') s.style.background = c
    s.title = c
    s.onclick = e => { e.stopPropagation(); onPick(c) }
    grid.appendChild(s)
  })
}

document.getElementById('ftbBgBtn').onclick = e => { e.stopPropagation(); document.getElementById('ftbBgDropdown').classList.toggle('open'); document.getElementById('ftbTcDropdown').classList.remove('open') }
document.getElementById('ftbTcBtn').onclick = e => { e.stopPropagation(); document.getElementById('ftbTcDropdown').classList.toggle('open'); document.getElementById('ftbBgDropdown').classList.remove('open') }

buildSwatches('ftbBgSwatches', SWATCHES_BG, c => {
  tbBgColor = c
  document.getElementById('ftbBgDropdown').classList.remove('open')
  render()
})
buildSwatches('ftbTcSwatches', SWATCHES_TEXT, c => {
  tbTextColor = c
  textColor.value = c === 'transparent' ? '#ffffff' : c
  document.getElementById('ftbColorBar').style.background = c
  document.getElementById('ftbTcDropdown').classList.remove('open')
  render()
})

// ── Templates ──
document.getElementById('templateBtn').onclick = async () => {
  document.getElementById('templateModal').style.display = 'flex'
  if (allTemplates.length) { filteredTemplates = allTemplates; showPage(0); return }
  document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#9A8A7A;font-size:13px;grid-column:1/-1;font-family:\'DM Sans\',sans-serif">Loading templates…</p>'
  try {
    const res = await fetch('https://api.imgflip.com/get_memes')
    const json = await res.json()
    allTemplates = json.data.memes; filteredTemplates = allTemplates; showPage(0)
  } catch { document.getElementById('templateGrid').innerHTML = '<p style="padding:24px;color:#C84B31;font-size:13px;grid-column:1/-1">Failed to load.</p>' }
}
document.getElementById('closeModal').onclick = () => { document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateModal').onclick = e => { if (e.target === document.getElementById('templateModal')) document.getElementById('templateModal').style.display = 'none' }
document.getElementById('templateSearch').oninput = e => {
  const q = e.target.value.toLowerCase().trim()
  filteredTemplates = q ? allTemplates.filter(m => m.name.toLowerCase().includes(q)) : allTemplates; showPage(0)
}
document.getElementById('prevPage').onclick = () => { if (templatePage > 0) showPage(templatePage - 1) }
document.getElementById('nextPage').onclick = () => { if ((templatePage + 1) * PER_PAGE < filteredTemplates.length) showPage(templatePage + 1) }

function showPage(page) {
  templatePage = page
  const total = filteredTemplates.length, totalPages = Math.ceil(total / PER_PAGE)
  const slice = filteredTemplates.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  document.getElementById('templateGrid').innerHTML = slice.map(m =>
    `<div class="meme-template-item" data-url="${m.url}"><img src="${m.url}" alt="${m.name}" loading="lazy"><span>${m.name}</span></div>`
  ).join('')
  document.getElementById('templateGrid').querySelectorAll('.meme-template-item').forEach(item => {
    item.onclick = () => {
      const img = new Image(); img.crossOrigin = 'anonymous'
      img.onload = () => { mainImage = img; canvas = null; showLayout(); render(); document.getElementById('templateModal').style.display = 'none' }
      img.onerror = () => { const i2 = new Image(); i2.onload = () => { mainImage = i2; canvas = null; showLayout(); render(); document.getElementById('templateModal').style.display = 'none' }; i2.src = item.dataset.url }
      img.src = item.dataset.url
    }
  })
  const pag = document.getElementById('pagination')
  if (totalPages > 1) {
    pag.style.display = 'flex'
    document.getElementById('pageInfo').textContent = `Page ${page + 1} of ${totalPages}`
    document.getElementById('prevPage').disabled = page === 0
    document.getElementById('nextPage').disabled = page >= totalPages - 1
  } else pag.style.display = 'none'
}

// ── Text rendering helpers ──
function makeFont(fs) {
  return `${tbItalic ? 'italic' : 'normal'} ${tbBold ? '900' : '700'} ${fs}px ${tbFont}, Arial Black, sans-serif`
}
function measureLines(text, maxW, fs) {
  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = makeFont(fs)
  const words = text.split(' '), lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (tmp.measureText(test).width > maxW && line) { lines.push(line); line = w } else line = test
  }
  lines.push(line)
  return lines
}
function blockHeight(text, maxW, fs) {
  return text ? measureLines(text, maxW, fs).length * fs * 1.3 : 0
}
function drawText(text, cx, cy, maxW, fs, fill, stroke, forceAlign) {
  if (!text) return
  const lines = measureLines(text, maxW, fs)
  const align = forceAlign || tbAlign
  ctx.font = makeFont(fs)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(fs / 7, 3)
  ctx.strokeStyle = stroke
  ctx.fillStyle = fill
  const lineH = fs * 1.3, totalH = lines.length * lineH
  const x = align === 'left' ? cx - maxW / 2 : align === 'right' ? cx + maxW / 2 : cx
  lines.forEach((l, i) => {
    const y = cy - totalH / 2 + i * lineH + lineH / 2
    ctx.strokeText(l, x, y)
    ctx.fillText(l, x, y)
    // underline
    if (tbUnder) {
      const tw = ctx.measureText(l).width
      const ux = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x
      ctx.fillRect(ux, y + fs * 0.55, tw, Math.max(1, fs / 18))
    }
  })
}

// ── Main render ──
function render() {
  if (!mainImage) return
  const fs = tbSize
  const tc = tbTextColor
  const sc = tbStrokeColor
  const top = topText.value.trim().toUpperCase()
  const bot = bottomText.value.trim().toUpperCase()
  const ovSz = parseInt(overlaySize.value) / 100
  const W = mainImage.naturalWidth, H = mainImage.naturalHeight
  const maxW = W * 0.92, vpad = fs * 0.5

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'max-width:100%;border-radius:6px;display:block'
    previewBox.innerHTML = ''
    previewBox.appendChild(canvas)
    setupDrag()
  }

  let topBand = 0, botBand = 0
  if (textPosition === 'outside') {
    if (top) topBand = blockHeight(top, maxW, fs) + vpad * 2
    if (bot) botBand = blockHeight(bot, maxW, fs) + vpad * 2
  }

  canvas.width = W; canvas.height = H + topBand + botBand
  ctx = canvas.getContext('2d')

  if (topBand || botBand) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, canvas.height) }
  ctx.drawImage(mainImage, 0, topBand, W, H)

  if (textPosition === 'inside') {
    // background box behind text if tbBgColor set
    if (tbBgColor !== 'transparent') {
      ;[[top, topBand + vpad, blockHeight(top, maxW, fs)], [bot, topBand + H - vpad - blockHeight(bot, maxW, fs), blockHeight(bot, maxW, fs)]].forEach(([txt, y, bh]) => {
        if (!txt) return
        ctx.fillStyle = tbBgColor; ctx.fillRect(0, y - 2, W, bh + 8)
      })
    }
    const topY = topBand + vpad + blockHeight(top, maxW, fs) / 2 + fs * 0.15
    const botY = topBand + H - vpad - blockHeight(bot, maxW, fs) / 2 - fs * 0.15
    drawText(top, W / 2, topY, maxW, fs, tc, sc)
    drawText(bot, W / 2, botY, maxW, fs, tc, sc)
  } else {
    if (top) drawText(top, W / 2, topBand / 2, maxW, fs, '#000000', '#ffffff', 'center')
    if (bot) drawText(bot, W / 2, topBand + H + botBand / 2, maxW, fs, '#000000', '#ffffff', 'center')
  }

  if (overlayImage) {
    const ow = W * ovSz, oh = (overlayImage.naturalHeight / overlayImage.naturalWidth) * ow
    ctx.drawImage(overlayImage, overlayX * W - ow / 2, overlayY * canvas.height - oh / 2, ow, oh)
  }
}

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
  canvas.addEventListener('touchstart', e => { if (overlayImage) { isDragging = true; e.preventDefault() } }, { passive: false })
  window.addEventListener('touchmove', e => {
    if (!isDragging) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    overlayX = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    overlayY = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height))
    render()
  }, { passive: true })
  window.addEventListener('touchend', () => { isDragging = false })
}

downloadBtn.onclick = () => {
  if (!canvas) return
  const mime = downloadFmt === 'png' ? 'image/png' : 'image/jpeg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${downloadFmt}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

;(function injectSEO() {
  const s = t.seo?.['meme-generator']; if (!s) return
  const sec = document.createElement('section'); sec.className = 'seo-section'
  sec.innerHTML = `<h2>${s.h2a||''}</h2><p>${s.body||''}</p>${(s.faqs||[]).map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}`
  document.getElementById('app').appendChild(sec)
})()