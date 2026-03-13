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
    .tool-wrap{max-width:1200px;margin:0 auto;padding:24px 16px 60px;font-family:'DM Sans',sans-serif}
    .tool-hero{margin-bottom:16px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:900;color:#2C1810;margin:0 0 4px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:#C84B31}
    .tool-sub{font-size:13px;color:#7A6A5A;margin:0}

    /* source row */
    .meme-source-row{display:flex;align-items:center;gap:10px;margin-bottom:14px}
    .meme-source-btn{flex:1;max-width:200px;padding:10px 14px;border:none;border-radius:9px;background:#C84B31;color:#fff;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-source-btn:hover{background:#A63D26;transform:translateY(-1px)}
    .meme-or{font-size:12px;font-weight:700;color:#B0A090;font-family:'DM Sans',sans-serif}

    /* main layout: canvas left, panel right */
    .meme-layout{display:none;grid-template-columns:1fr 280px;gap:16px;align-items:start}
    .meme-layout.visible{display:grid}
    @media(max-width:768px){.meme-layout{grid-template-columns:1fr}}

    /* canvas column */
    .meme-canvas-col{display:flex;flex-direction:column;gap:8px}

    /* floating toolbar */
    .ftb{display:none;background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;padding:6px 10px;box-shadow:0 4px 16px rgba(0,0,0,0.1);align-items:center;gap:3px;flex-wrap:wrap;overflow:visible}
    .ftb.show{display:flex}
    .ftb-div{width:1px;height:22px;background:#E0D8D0;margin:0 3px;flex-shrink:0}
    .ftb-font{height:30px;padding:0 6px;border:1.5px solid #DDD5C8;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#fff;cursor:pointer;outline:none;flex-shrink:0;min-width:110px}
    .ftb-font:focus{border-color:#C84B31}
    .ftb-size{height:30px;width:58px;padding:0 4px;border:1.5px solid #DDD5C8;border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#fff;cursor:pointer;outline:none;flex-shrink:0}
    .ftb-size:focus{border-color:#C84B31}
    .ftb-btn{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:#2C1810;transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-weight:700}
    .ftb-btn:hover{background:#F5EDE8;color:#C84B31}
    .ftb-btn.on{background:#C84B31;color:#fff}
    .ftb-align{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;color:#2C1810;transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
    .ftb-align:hover{background:#F5EDE8}
    .ftb-align.on{background:#C84B31;color:#fff}

    /* color swatch buttons in toolbar */
    .ftb-color-wrap{position:relative;flex-shrink:0}
    .ftb-swatch-btn{width:30px;height:30px;border:1.5px solid #DDD5C8;border-radius:6px;cursor:pointer;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px}
    .ftb-swatch-btn:hover{border-color:#C84B31}
    .ftb-swatch-letter{font-size:12px;font-weight:700;color:#2C1810;line-height:1;font-family:'DM Sans',sans-serif;pointer-events:none}
    .ftb-swatch-bar{width:16px;height:3px;border-radius:1px;pointer-events:none}
    .ftb-swatch-panel{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#fff;border:1.5px solid #E0D8D0;border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.14);z-index:100;width:192px}
    .ftb-swatch-panel.open{display:block}
    .ftb-swatch-panel p{font-size:10px;font-weight:700;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;font-family:'DM Sans',sans-serif}
    .ftb-grid{display:flex;flex-wrap:wrap;gap:4px}
    .ftb-dot{width:20px;height:20px;border-radius:4px;cursor:pointer;border:1px solid rgba(0,0,0,0.1);transition:transform 0.1s;flex-shrink:0}
    .ftb-dot:hover{transform:scale(1.3);position:relative;z-index:1}
    .ftb-del{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:14px;color:#C84B31;transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
    .ftb-del:hover{background:#FDE8E3}

    /* canvas wrapper — for overlay hit testing */
    .meme-canvas-wrap{position:relative;background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px}
    .meme-canvas-wrap canvas{display:block;max-width:100%}
    .meme-placeholder{color:#C4B8A8;font-size:14px;font-family:'DM Sans',sans-serif;padding:60px 20px;text-align:center}

    /* RIGHT PANEL */
    .meme-panel{background:#fff;border-radius:14px;border:1.5px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.06);padding:20px;position:sticky;top:84px;display:flex;flex-direction:column;gap:0}
    .panel-title{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:0 0 14px;text-align:center}
    .panel-section{padding:14px 0;border-bottom:1px solid #F0EAE4}
    .panel-section:last-child{border-bottom:none;padding-bottom:0}
    .panel-label{font-size:10px;font-weight:700;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;display:block;font-family:'DM Sans',sans-serif}

    /* text inside/outside toggle with icons */
    .pos-toggle{display:flex;gap:8px;margin-bottom:0}
    .pos-btn{flex:1;padding:10px 6px;border:1.5px solid #DDD5C8;border-radius:10px;background:#fff;font-size:11px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
    .pos-btn svg{opacity:0.5}
    .pos-btn:hover{border-color:#C84B31;color:#C84B31}
    .pos-btn:hover svg{opacity:1}
    .pos-btn.active{background:#FDE8E3;border-color:#C84B31;color:#C84B31}
    .pos-btn.active svg{opacity:1}

    /* text inputs */
    .meme-input{width:100%;padding:9px 11px;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:#2C1810;background:#FAFAF8;outline:none;transition:border-color 0.15s;margin-bottom:6px}
    .meme-input:last-child{margin-bottom:0}
    .meme-input:focus{border-color:#C84B31;background:#fff}
    .meme-input::placeholder{color:#C4B8A8;font-size:12px}

    /* outside band color */
    .band-color-row{display:flex;align-items:center;gap:8px;margin-top:8px}
    .band-color-label{font-size:12px;color:#5A4A3A;font-family:'DM Sans',sans-serif}
    .band-color-pick{width:36px;height:26px;border:1.5px solid #DDD5C8;border-radius:6px;cursor:pointer;padding:2px;background:#fff}

    /* action buttons */
    .panel-action-btn{width:100%;padding:11px;border:1.5px solid #DDD5C8;border-radius:10px;background:#fff;font-size:13px;font-weight:600;color:#2C1810;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .panel-action-btn:last-of-type{margin-bottom:0}
    .panel-action-btn:hover{border-color:#C84B31;color:#C84B31;background:#FDE8E3}
    .panel-action-btn svg{flex-shrink:0;opacity:0.7}
    .panel-action-btn:hover svg{opacity:1}

    /* download */
    .fmt-row{display:flex;gap:6px;margin-bottom:10px}
    .fmt-btn{flex:1;padding:7px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-size:12px;font-weight:600;color:#5A4A3A;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .fmt-btn.active{background:#C84B31;border-color:#C84B31;color:#fff}
    .download-btn{width:100%;padding:13px;border:none;border-radius:10px;background:#C84B31;color:#fff;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s}
    .download-btn:hover{background:#A63D26;transform:translateY(-1px)}

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

    .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
    .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:24px 0 8px}
    .seo-section ol{padding-left:20px;margin:0 0 12px}
    .seo-section ol li{font-size:13px;color:#5A4A3A;line-height:1.6;margin-bottom:6px}
    .seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin:0 0 12px}
    .seo-faq{border-top:1px solid #E8E0D5;padding:10px 0}
    .seo-faq:last-child{border-bottom:1px solid #E8E0D5}
    .seo-faq-q{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px;font-family:'DM Sans',sans-serif}
    .seo-faq-a{font-size:13px;color:#5A4A3A;margin:0;line-height:1.6}
    .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
    .seo-link:hover{border-color:#C84B31;color:#C84B31}
  `
  document.head.appendChild(style)
}

const FONTS = [
  { label: 'Impact',          val: 'Impact, Haettenschweiler, sans-serif' },
  { label: 'Arial Black',     val: '"Arial Black", Gadget, sans-serif' },
  { label: 'Arial',           val: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana',         val: 'Verdana, Geneva, sans-serif' },
  { label: 'Times New Roman', val: '"Times New Roman", Times, serif' },
  { label: 'Georgia',         val: 'Georgia, serif' },
  { label: 'Courier New',     val: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans',      val: '"Comic Sans MS", cursive' },
]
const SIZES = [12,14,16,18,20,24,28,32,36,42,48,56,64,72,96,120]
const COLORS = [
  '#ffffff','#000000','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
  '#ff6600','#ffd700','#ff4444','#44dd44','#4488ff','#aa44ff','#ff44aa','#44ffee',
  '#888888','#444444','#cc9966','#334455'
]

document.getElementById('app').innerHTML = `
<div class="tool-wrap">
  <div class="tool-hero">
    <h1 class="tool-title">Meme <em class="brand-em">Generator</em></h1>
    <p class="tool-sub">Create memes online. Choose a template or upload your own image. Private — runs in your browser.</p>
  </div>

  <div class="meme-source-row" id="sourceRow">
    <button class="meme-source-btn" id="uploadBtn">⬆ Upload Image</button>
    <span class="meme-or">or</span>
    <button class="meme-source-btn" id="templateBtn">🎭 Choose Template</button>
    <input type="file" id="fileInput" accept="image/*" style="display:none">
  </div>

  <div class="meme-layout" id="memeLayout">

    <!-- LEFT: canvas + toolbar -->
    <div class="meme-canvas-col">

      <!-- floating toolbar -->
      <div class="ftb" id="ftb">
        <select class="ftb-font" id="ftbFont">
          ${FONTS.map(f=>`<option value="${f.val}">${f.label}</option>`).join('')}
        </select>
        <select class="ftb-size" id="ftbSize">
          ${SIZES.map(s=>`<option value="${s}"${s===40?' selected':''}>${s}</option>`).join('')}
        </select>
        <div class="ftb-div"></div>
        <button class="ftb-btn" id="ftbB" title="Bold"><b>B</b></button>
        <button class="ftb-btn" id="ftbI" title="Italic"><i>I</i></button>
        <button class="ftb-btn" id="ftbU" title="Underline"><u>U</u></button>
        <div class="ftb-div"></div>
        <button class="ftb-align" id="ftbAL" title="Left">
          <svg width="14" height="12" viewBox="0 0 14 12"><rect x="0" y="0" width="10" height="2" rx="1" fill="currentColor"/><rect x="0" y="5" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="10" width="8" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <button class="ftb-align on" id="ftbAC" title="Center">
          <svg width="14" height="12" viewBox="0 0 14 12"><rect x="2" y="0" width="10" height="2" rx="1" fill="currentColor"/><rect x="0" y="5" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="10" width="10" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <button class="ftb-align" id="ftbAR" title="Right">
          <svg width="14" height="12" viewBox="0 0 14 12"><rect x="4" y="0" width="10" height="2" rx="1" fill="currentColor"/><rect x="0" y="5" width="14" height="2" rx="1" fill="currentColor"/><rect x="6" y="10" width="8" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <div class="ftb-div"></div>
        <button class="ftb-del" id="ftbDel" title="Delete layer">🗑</button>
        <div class="ftb-div"></div>

        <!-- text color -->
        <label style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;position:relative;width:30px;height:30px;justify-content:center;border:1.5px solid #DDD5C8;border-radius:6px;background:#fff" title="Text color">
          <span style="font-size:13px;font-weight:700;color:#2C1810;line-height:1;font-family:'DM Sans',sans-serif;pointer-events:none">A</span>
          <div id="tcBar" style="width:16px;height:3px;border-radius:1px;background:#000000;pointer-events:none"></div>
          <input type="color" id="tcInput" value="#000000" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0">
        </label>

        <!-- stroke color -->
        <label style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;position:relative;width:30px;height:30px;justify-content:center;border:1.5px solid #DDD5C8;border-radius:6px;background:#fff" title="Stroke color">
          <span style="font-size:9px;font-weight:700;color:#888;line-height:1;font-family:'DM Sans',sans-serif;pointer-events:none">STR</span>
          <div id="scBar" style="width:16px;height:3px;border-radius:1px;background:#ffffff;border:1px solid #ddd;pointer-events:none"></div>
          <input type="color" id="scInput" value="#ffffff" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0">
        </label>
      </div>

      <!-- canvas -->
      <div class="meme-canvas-wrap" id="canvasWrap">
        <div class="meme-placeholder" id="placeholder">Select an image or template to get started</div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="meme-panel">
      <p class="panel-title">Meme Editor</p>

      <!-- text position -->
      <div class="panel-section">
        <div class="pos-toggle">
          <button class="pos-btn active" id="insideBtn">
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none"><rect x="1" y="1" width="26" height="20" rx="3" stroke="#C84B31" stroke-width="1.5"/><text x="14" y="15" text-anchor="middle" font-size="9" fill="#C84B31" font-family="Impact">TEXT</text></svg>
            Text inside
          </button>
          <button class="pos-btn" id="outsideBtn">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="1" y="9" width="26" height="18" rx="3" stroke="#9A8A7A" stroke-width="1.5"/><text x="14" y="6" text-anchor="middle" font-size="7" fill="#9A8A7A" font-family="Impact">TEXT</text></svg>
            Text outside
          </button>
        </div>
        <!-- outside band color — only shown when outside active -->
        <div class="band-color-row" id="bandColorRow" style="display:none">
          <span class="band-color-label">Band color:</span>
          <input type="color" id="bandColor" value="#ffffff" class="band-color-pick">
        </div>
      </div>

      <!-- top / bottom text -->
      <div class="panel-section">
        <span class="panel-label">Text</span>
        <input type="text" id="topText" class="meme-input" placeholder="Top text (optional)">
        <input type="text" id="bottomText" class="meme-input" placeholder="Bottom text (optional)" style="margin-bottom:0">
      </div>

      <!-- actions -->
      <div class="panel-section">
        <span class="panel-label">Add</span>
        <button class="panel-action-btn" id="addTextBtn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#C84B31" stroke-width="1.5"/><text x="9" y="13" text-anchor="middle" font-size="10" fill="#C84B31" font-family="Impact,sans-serif">A</text></svg>
          ADD TEXT
        </button>
        <button class="panel-action-btn" id="overlayBtn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#C84B31" stroke-width="1.5"/><path d="M1 12l4-4 3 3 4-5 5 6" stroke="#C84B31" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ADD IMAGE
        </button>
        <input type="file" id="overlayInput" accept="image/*" style="display:none">
      </div>

      <!-- download -->
      <div class="panel-section">
        <span class="panel-label">Download</span>
        <div class="fmt-row">
          <button class="fmt-btn active" id="fmtJpg">JPG</button>
          <button class="fmt-btn" id="fmtPng">PNG</button>
        </div>
        <button class="download-btn" id="downloadBtn">⬇ Download Meme</button>
      </div>
    </div>
  </div>

  <!-- template modal -->
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
const S = {
  position: 'inside', bandColor: '#ffffff', fmt: 'jpg'
}
// separate style per text slot
function defaultStyle() {
  return { font: FONTS[0].val, size: 40, bold: false, italic: false, underline: false, align: 'center', textColor: '#000000', strokeColor: '#ffffff' }
}
const ST = defaultStyle()  // top text style
const SB = defaultStyle()  // bottom text style

// draggable text layers
let layers = []        // { id, text, x, y, ...style props }
let selectedLayer = null   // which layer is active
let activeInput = null     // 'top' | 'bottom' | null

let mainImage = null, overlayImage = null
let overlayX = 0.5, overlayY = 0.5
let canvas = null, ctx = null
let filteredTemplates = []

// drag state
let dragging = null  // { layer, startX, startY, origX, origY }
let editingLayer = null  // layer currently being typed into

const $ = id => document.getElementById(id)
const topText = $('topText'), bottomText = $('bottomText')
const ftb = $('ftb'), canvasWrap = $('canvasWrap')

// ── Toolbar state sync ──
function getActiveStyle() {
  if (selectedLayer) return selectedLayer
  if (activeInput === 'top') return ST
  if (activeInput === 'bottom') return SB
  return ST  // fallback
}
function applyStyle(key, val) {
  if (selectedLayer) { selectedLayer[key] = val }
  else if (activeInput === 'top') { ST[key] = val }
  else if (activeInput === 'bottom') { SB[key] = val }
  render()
}

// ── Show/hide toolbar ──
function showToolbar() { ftb.classList.add('show') }
function hideToolbar() { ftb.classList.remove('show') }

function syncToolbarToState(src) {
  $('ftbFont').value = src.font || FONTS[0].val
  $('ftbSize').value = src.size || 40
  $('ftbB').classList.toggle('on', !!(src.bold))
  $('ftbI').classList.toggle('on', !!(src.italic))
  $('ftbU').classList.toggle('on', !!(src.underline))
  const tc = src.textColor || '#000000'
  const sc = src.strokeColor || '#ffffff'
  $('tcBar').style.background = tc
  $('scBar').style.background = sc
  const align = src.align || S.align
  ;['ftbAC','ftbAL','ftbAR'].forEach(id => $(id).classList.remove('on'))
  if (align === 'center') $('ftbAC').classList.add('on')
  else if (align === 'left') $('ftbAL').classList.add('on')
  else $('ftbAR').classList.add('on')
}

// ── Layout show ──
function showLayout() {
  $('memeLayout').classList.add('visible')
  $('placeholder').style.display = 'none'
  $('sourceRow').style.display = 'none'
}

// ── Render ──
function render() {
  if (!mainImage) return

  const W = mainImage.naturalWidth, H = mainImage.naturalHeight
  const topVal = topText.value.trim().toUpperCase()
  const botVal = bottomText.value.trim().toUpperCase()
  const fs = ST.size  // top text drives overall font size for layout

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'max-width:100%;display:block;cursor:default'
    canvasWrap.innerHTML = ''
    canvasWrap.appendChild(canvas)
    setupCanvasDrag()
  }

  let topBand = 0, botBand = 0
  if (S.position === 'outside') {
    if (topVal) topBand = blockH(topVal, W * 0.92, ST.size, ST) + ST.size
    if (botVal) botBand = blockH(botVal, W * 0.92, SB.size, SB) + SB.size
  }

  canvas.width = W
  canvas.height = H + topBand + botBand
  ctx = canvas.getContext('2d')

  // background
  if (topBand || botBand) {
    ctx.fillStyle = S.bandColor
    ctx.fillRect(0, 0, W, canvas.height)
  }

  ctx.drawImage(mainImage, 0, topBand, W, H)

  // top/bottom text
  if (S.position === 'inside') {
    drawFixedText(topVal, W/2, topBand + ST.size*0.7 + blockH(topVal, W*0.92, ST.size, ST)/2, W*0.92, ST.size, ST)
    drawFixedText(botVal, W/2, topBand + H - SB.size*0.7 - blockH(botVal, W*0.92, SB.size, SB)/2, W*0.92, SB.size, SB)
  } else {
    if (topVal) drawFixedText(topVal, W/2, topBand/2, W*0.92, ST.size, ST)
    if (botVal) drawFixedText(botVal, W/2, topBand+H+botBand/2, W*0.92, SB.size, SB)
  }

  // overlay image
  if (overlayImage) {
    const ow = W * 0.3, oh = (overlayImage.naturalHeight / overlayImage.naturalWidth) * ow
    ctx.drawImage(overlayImage, overlayX*W - ow/2, overlayY*canvas.height - oh/2, ow, oh)
  }

  // draggable text layers
  layers.forEach(layer => {
    if (layer === editingLayer) return  // skip — shown as input overlay
    const lfs = layer.size || S.size
    const lfont = layer.font || S.font
    const lfill = layer.textColor || '#ffffff'
    const lstroke = layer.strokeColor || '#000000'
    const lbold = layer.bold ?? false
    const litalic = layer.italic ?? false
    const lunder = layer.underline ?? false
    const lalign = layer.align || 'center'

    const fontStr = `${litalic?'italic ':''}${lbold?'900 ':'700 '}${lfs}px ${lfont}`
    ctx.font = fontStr
    ctx.textAlign = lalign
    ctx.textBaseline = 'middle'
    ctx.lineWidth = Math.max(lfs/7, 3)
    ctx.strokeStyle = lstroke
    ctx.fillStyle = lfill

    // pixel position from 0-1 ratio
    const px = layer.x * W
    const py = layer.y * canvas.height

    ctx.strokeText(layer.text, px, py)
    ctx.fillText(layer.text, px, py)

    if (lunder) {
      const tw = ctx.measureText(layer.text).width
      const ux = lalign === 'center' ? px - tw/2 : lalign === 'right' ? px - tw : px
      ctx.fillStyle = lfill
      ctx.fillRect(ux, py + lfs*0.55, tw, Math.max(1, lfs/18))
    }

    // selection indicator + X delete handle
    if (layer === selectedLayer) {
      ctx.save()
      const tw2 = ctx.measureText(layer.text).width
      const pad = 8
      const bx = lalign === 'center' ? px - tw2/2 - pad : lalign === 'right' ? px - tw2 - pad : px - pad
      const by = py - lfs*0.75
      const bw = tw2 + pad*2
      const bh = lfs*1.4
      ctx.strokeStyle = '#4488ff'
      ctx.lineWidth = 2
      ctx.setLineDash([4,3])
      ctx.strokeRect(bx, by, bw, bh)
      ctx.setLineDash([])
      // X delete button — top-right corner
      const xr = 10
      const xcx = bx + bw + xr + 2
      const xcy = by - xr - 2
      ctx.fillStyle = '#ff3333'
      ctx.beginPath(); ctx.arc(xcx, xcy, xr, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(xcx-5, xcy-5); ctx.lineTo(xcx+5, xcy+5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(xcx+5, xcy-5); ctx.lineTo(xcx-5, xcy+5); ctx.stroke()
      // store hit area for click detection
      layer._xBtn = { cx: xcx, cy: xcy, r: xr, bx, by, bw, bh }
      ctx.restore()
    } else {
      layer._xBtn = null
    }
  })
}

// ── Text helpers ──
function fontStr(fs, st) {
  const bold = st.bold ? '900' : '700'
  const italic = st.italic ? 'italic' : 'normal'
  return `${italic} ${bold} ${fs}px ${st.font || FONTS[0].val}`
}
function wrapLines(text, maxW, fs, st) {
  const tmp = document.createElement('canvas').getContext('2d')
  tmp.font = fontStr(fs, st)
  const words = text.split(' '), lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (tmp.measureText(test).width > maxW && line) { lines.push(line); line = w } else line = test
  }
  lines.push(line)
  return lines
}
function blockH(text, maxW, fs, st) {
  if (!text) return 0
  return wrapLines(text, maxW, fs, st).length * fs * 1.3
}
function drawFixedText(text, cx, cy, maxW, fs, st, forceAlign, forceFill, forceStroke) {
  if (!text) return
  const lines = wrapLines(text, maxW, fs, st)
  const align = forceAlign || st.align
  const fill = forceFill || st.textColor
  const stroke = forceStroke || st.strokeColor
  ctx.font = fontStr(fs, st)
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(fs/7, 3)
  ctx.strokeStyle = stroke
  ctx.fillStyle = fill
  const lineH = fs * 1.3, totalH = lines.length * lineH
  const x = align === 'left' ? cx - maxW/2 : align === 'right' ? cx + maxW/2 : cx
  lines.forEach((l, i) => {
    const y = cy - totalH/2 + i*lineH + lineH/2
    ctx.strokeText(l, x, y)
    ctx.fillText(l, x, y)
    if (st.underline) {
      const tw = ctx.measureText(l).width
      const ux = align === 'center' ? x - tw/2 : align === 'right' ? x - tw : x
      ctx.fillStyle = fill
      ctx.fillRect(ux, y + fs*0.55, tw, Math.max(1, fs/18))
    }
  })
}

// ── Canvas drag for layers ──
function setupCanvasDrag() {
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY

    // check X delete button first
    if (selectedLayer && selectedLayer._xBtn) {
      const { cx: xcx, cy: xcy, r } = selectedLayer._xBtn
      if (Math.hypot(cx - xcx, cy - xcy) <= r + 4) {
        layers = layers.filter(l => l !== selectedLayer)
        selectedLayer = null; hideToolbar(); render(); e.preventDefault(); return
      }
    }

    // hit test layers (reverse = top layer first)
    let hit = null
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]
      const lfs = layer.size || S.size
      const px = layer.x * canvas.width
      const py = layer.y * canvas.height
      ctx.font = `${layer.bold?'900':'700'} ${lfs}px ${layer.font || S.font}`
      const tw = ctx.measureText(layer.text).width
      const bx = layer.align === 'center' ? px - tw/2 : layer.align === 'right' ? px - tw : px
      if (cx >= bx - 8 && cx <= bx + tw + 8 && cy >= py - lfs*0.8 && cy <= py + lfs*0.7) {
        hit = layer; break
      }
    }

    if (hit) {
      selectedLayer = hit
      syncToolbarToState(hit)
      showToolbar()
      dragging = { layer: hit, startX: e.clientX, startY: e.clientY, origX: hit.x, origY: hit.y }
      render()
      e.preventDefault()
    } else {
      // deselect
      selectedLayer = null
      dragging = null
      if (activeInput) {
        syncToolbarToState(ST)
        showToolbar()
      } else {
        hideToolbar()
      }
      render()
    }
  })

  window.addEventListener('mousemove', e => {
    if (!dragging) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const dx = (e.clientX - dragging.startX) * scaleX / canvas.width
    const dy = (e.clientY - dragging.startY) * scaleY / canvas.height
    dragging.layer.x = Math.max(0, Math.min(1, dragging.origX + dx))
    dragging.layer.y = Math.max(0, Math.min(1, dragging.origY + dy))
    render()
  })

  window.addEventListener('mouseup', () => { dragging = null })

  // touch
  canvas.addEventListener('touchstart', e => {
    const touch = e.touches[0]
    const me = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY })
    canvas.dispatchEvent(me)
  }, { passive: false })
  window.addEventListener('touchmove', e => {
    if (!dragging) return
    const touch = e.touches[0]
    const me = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY })
    window.dispatchEvent(me)
  }, { passive: true })
  window.addEventListener('touchend', () => { dragging = null })
}

// ── Top/Bottom text inputs ──
topText.addEventListener('focus', () => {
  activeInput = 'top'; selectedLayer = null
  syncToolbarToState(ST); showToolbar()
})
bottomText.addEventListener('focus', () => {
  activeInput = 'bottom'; selectedLayer = null
  syncToolbarToState(SB); showToolbar()
})
topText.addEventListener('blur', () => {
  setTimeout(() => {
    const focused = document.activeElement
    const inToolbar = ftb.contains(focused)
    const inTextInputs = focused === topText || focused === bottomText
    if (!inToolbar && !inTextInputs && !selectedLayer) {
      activeInput = null
      hideToolbar()
    }
  }, 150)
})
bottomText.addEventListener('blur', () => {
  setTimeout(() => {
    const focused = document.activeElement
    const inToolbar = ftb.contains(focused)
    const inTextInputs = focused === topText || focused === bottomText
    if (!inToolbar && !inTextInputs && !selectedLayer) {
      activeInput = null
      hideToolbar()
    }
  }, 150)
})
topText.addEventListener('input', render)
bottomText.addEventListener('input', render)

// keep toolbar open while interacting with it
ftb.addEventListener('mousedown', e => { if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') e.preventDefault() })

// ── Toolbar controls ──
$('ftbFont').addEventListener('change', () => { applyStyle('font', $('ftbFont').value) })
$('ftbSize').addEventListener('change', () => { applyStyle('size', parseInt($('ftbSize').value)) })
$('ftbB').onclick = () => { const v = !(getActiveStyle().bold ?? false); applyStyle('bold', v); $('ftbB').classList.toggle('on', v) }
$('ftbI').onclick = () => { const v = !(getActiveStyle().italic ?? false); applyStyle('italic', v); $('ftbI').classList.toggle('on', v) }
$('ftbU').onclick = () => { const v = !(getActiveStyle().underline ?? false); applyStyle('underline', v); $('ftbU').classList.toggle('on', v) }

;[['ftbAC','center'],['ftbAL','left'],['ftbAR','right']].forEach(([id, val]) => {
  $(id).onclick = () => {
    applyStyle('align', val)
    ;['ftbAC','ftbAL','ftbAR'].forEach(i => $(i).classList.remove('on'))
    $(id).classList.add('on')
  }
})

// delete selected layer
$('ftbDel').onclick = () => {
  if (!selectedLayer) return
  layers = layers.filter(l => l !== selectedLayer)
  selectedLayer = null; hideToolbar(); render()
}

// ── Color swatches ──
function buildSwatches(gridId, onPick) {
  const grid = $(gridId); grid.innerHTML = ''
  COLORS.forEach(c => {
    const d = document.createElement('div')
    d.className = 'ftb-dot'; d.style.background = c; d.title = c
    d.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); onPick(c) })
    grid.appendChild(d)
  })
}

// Text color picker
$('tcInput').addEventListener('input', () => {
  const c = $('tcInput').value
  $('tcBar').style.background = c
  applyStyle('textColor', c)
})
$('tcInput').addEventListener('change', () => {
  const c = $('tcInput').value
  $('tcBar').style.background = c
  applyStyle('textColor', c)
})

// Stroke color picker
$('scInput').addEventListener('input', () => {
  const c = $('scInput').value
  $('scBar').style.background = c
  applyStyle('strokeColor', c)
})
$('scInput').addEventListener('change', () => {
  const c = $('scInput').value
  $('scBar').style.background = c
  applyStyle('strokeColor', c)
})

// ── Add Text ──
let textIdCounter = 0
$('addTextBtn').onclick = () => {
  if (!mainImage) return
  const layer = {
    id: ++textIdCounter,
    text: 'Text',
    x: 0.5, y: 0.5,
    font: ST.font, size: ST.size,
    bold: false, italic: false, underline: false,
    align: 'center', textColor: '#ffffff', strokeColor: '#000000'
  }
  layers.push(layer)
  selectedLayer = layer
  syncToolbarToState(layer)
  showToolbar()
  render()
  // open editor right away
  setTimeout(() => openInlineEditor(layer), 50)
}

// double-click to edit layer text
// inline text editor on canvas
function openInlineEditor(layer) {
  const oldEl = document.getElementById('layerEditor')
  if (oldEl) oldEl.remove()

  editingLayer = layer  // tell render() to skip drawing this layer
  render()              // redraw without the text so no overlap

  const rect = canvas.getBoundingClientRect()
  const scaleX = rect.width / canvas.width
  const scaleY = rect.height / canvas.height
  const wrapRect = canvasWrap.getBoundingClientRect()

  const px = layer.x * canvas.width * scaleX + rect.left - wrapRect.left
  const py = layer.y * canvas.height * scaleY + rect.top - wrapRect.top

  // scale font size to match canvas display size
  const displayFontSize = Math.max(12, (layer.size || S.size) * scaleY)

  const inp = document.createElement('input')
  inp.id = 'layerEditor'
  inp.value = layer.text === 'Text' ? '' : layer.text
  inp.placeholder = 'Type here...'
  inp.style.cssText = [
    'position:absolute',
    `left:${px}px`,
    `top:${py}px`,
    'transform:translate(-50%,-50%)',
    'background:rgba(0,0,0,0.75)',
    'color:#fff',
    'border:2px solid #4488ff',
    'border-radius:6px',
    'padding:4px 10px',
    `font-size:${displayFontSize}px`,
    `font-family:${layer.font || S.font}`,
    'outline:none',
    'z-index:50',
    'min-width:80px',
    'max-width:90%',
    'text-align:center',
    'box-shadow:0 2px 12px rgba(0,0,0,0.4)'
  ].join(';')

  canvasWrap.style.position = 'relative'
  canvasWrap.appendChild(inp)
  inp.focus()
  inp.select()

  // grow width as user types
  inp.addEventListener('input', () => {
    layer.text = inp.value || ' '
    inp.style.width = Math.max(80, inp.value.length * displayFontSize * 0.6) + 'px'
  })
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur() })
  inp.addEventListener('blur', () => {
    editingLayer = null
    layer.text = inp.value.trim() || 'Text'
    inp.remove()
    render()
  })
}

canvasWrap.addEventListener('dblclick', e => {
  if (!selectedLayer) return
  openInlineEditor(selectedLayer)
})

// ── Position toggles ──
$('insideBtn').onclick = () => {
  S.position = 'inside'
  $('insideBtn').classList.add('active'); $('outsideBtn').classList.remove('active')
  $('bandColorRow').style.display = 'none'
  render()
}
$('outsideBtn').onclick = () => {
  S.position = 'outside'
  $('outsideBtn').classList.add('active'); $('insideBtn').classList.remove('active')
  $('bandColorRow').style.display = 'flex'
  render()
}

// band color
$('bandColor').addEventListener('input', () => { S.bandColor = $('bandColor').value; render() })
$('bandColor').addEventListener('change', () => { S.bandColor = $('bandColor').value; render() })

// ── Upload ──
$('uploadBtn').onclick = () => { $('fileInput').value = ''; $('fileInput').click() }
$('fileInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const r = new FileReader()
  r.onload = ev => {
    const img = new Image()
    img.onload = () => { mainImage = img; canvas = null; layers = []; selectedLayer = null; showLayout(); render() }
    img.src = ev.target.result
  }
  r.readAsDataURL(f)
}

// ── Overlay image ──
$('overlayBtn').onclick = () => { $('overlayInput').value = ''; $('overlayInput').click() }
$('overlayInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return
  const r = new FileReader()
  r.onload = ev => {
    const img = new Image()
    img.onload = () => { overlayImage = img; render() }
    img.src = ev.target.result
  }
  r.readAsDataURL(f)
}

// ── Format + download ──
$('fmtJpg').onclick = () => { S.fmt='jpg'; $('fmtJpg').classList.add('active'); $('fmtPng').classList.remove('active') }
$('fmtPng').onclick = () => { S.fmt='png'; $('fmtPng').classList.add('active'); $('fmtJpg').classList.remove('active') }
$('downloadBtn').onclick = () => {
  if (!canvas) return
  const mime = S.fmt === 'png' ? 'image/png' : 'image/jpeg'
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${S.fmt}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, mime, 0.92)
}

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
      img.onload = () => { mainImage = img; canvas = null; layers = []; selectedLayer = null; showLayout(); render(); $('templateModal').style.display = 'none' }
      img.onerror = () => { const i2 = new Image(); i2.onload = () => { mainImage = i2; canvas = null; layers = []; selectedLayer = null; showLayout(); render(); $('templateModal').style.display = 'none' }; i2.src = item.dataset.url }
      img.src = item.dataset.url
    }
  })
  const pag = $('pagination')
  if (totalPages > 1) {
    pag.style.display = 'flex'
    $('pageInfo').textContent = `Page ${page+1} of ${totalPages}`
    $('prevPage').disabled = page === 0
    $('nextPage').disabled = page >= totalPages - 1
  } else pag.style.display = 'none'
}

// ── SEO ──
;(function injectSEO() {
  const seo = (t.seo && t.seo['meme-generator']) || {}
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'

  const h2a   = seo.h2a   || 'How to Make a Meme Free — No Upload Required'
  const h2b   = seo.h2b   || "The Best Free Meme Generator That Doesn't Upload Your Files"
  const body  = seo.body  || 'RelahConvert lets you create memes directly in your browser. No upload, no account, no watermark. Choose from 100+ viral meme templates or use your own photo. Add text inside or outside the image, drag it anywhere, and customize every detail.'
  const h3why = seo.h3why || 'Why Make Memes Online?'
  const why   = seo.why   || 'Memes are the fastest way to share a joke, make a point, or go viral. A good meme generator gives you full control over text placement, font, and style — without installing anything or giving up your photos.'
  const steps = seo.steps || [
    'Upload your image or choose a template — click Upload Image or pick from 100+ popular meme templates.',
    'Add your text — type in the Top Text and Bottom Text fields, or click Add Text to place custom text anywhere on the image.',
    'Style your text — change font, size, color, stroke, bold, italic, and alignment using the toolbar.',
    'Download your meme — click JPG or PNG to save instantly to your device.'
  ]
  const faqs = seo.faqs || [
    { q: 'Will my image be uploaded to a server?', a: 'No. Everything runs in your browser. Your files never leave your device.' },
    { q: 'Can I use my own image?', a: 'Yes — upload any JPG, PNG, or WebP image.' },
    { q: 'Is there a watermark?', a: 'No watermark, ever.' },
    { q: 'Can I add multiple text layers?', a: 'Yes — click Add Text to add as many draggable text layers as you want.' },
    { q: 'What fonts are available?', a: 'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New, and Comic Sans.' },
    { q: 'Can I download as PNG?', a: 'Yes — choose JPG or PNG before downloading.' }
  ]
  const links = seo.links || [
    { href: '/compress', label: 'Compress Image' },
    { href: '/resize', label: 'Resize Image' },
    { href: '/crop', label: 'Crop Image' },
    { href: '/watermark', label: 'Add Watermark' },
    { href: '/jpg-to-png', label: 'JPG to PNG' }
  ]

  const div = document.createElement('div')
  div.className = 'seo-section'
  div.innerHTML = `
    <h2>${h2a}</h2>
    <ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
    <h2>${h2b}</h2>
    <p>${body}</p>
    <h3>${h3why}</h3>
    <p>${why}</p>
    <h3>${faqTitle}</h3>
    ${faqs.map(f=>`<div class="seo-faq"><p class="seo-faq-q">${f.q}</p><p class="seo-faq-a">${f.a}</p></div>`).join('')}
    <h3>${alsoTry}</h3>
    <div class="seo-links">${links.map(l=>`<a class="seo-link" href="${l.href}">${l.label}</a>`).join('')}</div>
  `
  document.querySelector('#app').appendChild(div)
})()