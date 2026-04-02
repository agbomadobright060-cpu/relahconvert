import { injectHeader } from '../core/header.js'

import { getT , getLang, localHref, injectHreflang, injectFaqSchema} from '../core/i18n.js'
injectHreflang('meme-generator')

const t = getT()

const ui = {
  title:       t.meme_title        || 'Meme',
  titleEm:     t.meme_title_em     || 'Generator',
  sub:         t.meme_sub          || 'Create memes online. Choose a template or upload your own image. Private — runs in your browser.',
  uploadBtn:   t.meme_upload_btn   || 'Upload Image',
  templateBtn: t.meme_template_btn || 'Choose Template',
  editor:      t.meme_editor       || 'Meme Editor',
  textInside:  t.meme_text_inside  || 'Text inside',
  textOutside: t.meme_text_outside || 'Text outside',
  bandColor:   t.meme_band_color   || 'Band color:',
  topText:     t.meme_top_text     || 'Top text (optional)',
  bottomText:  t.meme_bottom_text  || 'Bottom text (optional)',
  addText:     t.meme_add_text     || 'ADD TEXT',
  addImage:    t.meme_add_image    || 'ADD IMAGE',
  download:    t.meme_download     || 'Download Meme',
  chooseTempl: t.meme_choose_templ || 'Choose a Meme Template',
}
let allTemplates = [], templatePage = 0
const PER_PAGE = 20

if (document.head) {
  document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'
  const style = document.createElement('style')
  style.textContent = `
    *{box-sizing:border-box}
    .tool-wrap{max-width:700px;margin:0 auto;padding:24px 16px 60px;font-family:'DM Sans',sans-serif;transition:max-width 0.3s}
    .tool-wrap.expanded{max-width:1200px}
    .tool-hero{margin-bottom:16px}
    .tool-title{font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:400;color:var(--text-primary);margin:0 0 4px;line-height:1;letter-spacing:-0.02em}
    .brand-em{font-style:italic;color:var(--accent)}
    .tool-sub{font-size:13px;color:var(--text-tertiary);margin:0}

    /* source row */
    .meme-source-row{display:flex;align-items:center;gap:10px;margin-bottom:14px}
    .meme-source-btn{flex:1;max-width:200px;padding:10px 14px;border:none;border-radius:9px;background:var(--accent);color:var(--text-on-accent);font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center}
    .meme-source-btn:hover{background:var(--accent-hover);transform:translateY(-1px)}
    .meme-or{font-size:12px;font-weight:700;color:var(--text-muted);font-family:'DM Sans',sans-serif}

    /* main layout: canvas left, panel right */
    .meme-layout{display:none;grid-template-columns:1fr 280px;gap:16px;align-items:start}
    .meme-layout.visible{display:grid}
    @media(max-width:768px){.meme-layout{grid-template-columns:1fr}}

    /* canvas column */
    .meme-canvas-col{display:flex;flex-direction:column;gap:8px}

    /* floating toolbar */
    .ftb{display:none;background:var(--bg-card);border:1.5px solid var(--border);border-radius:10px;padding:6px 10px;box-shadow:0 4px 16px rgba(0,0,0,0.1);align-items:center;gap:3px;flex-wrap:wrap;overflow:visible}
    .ftb.show{display:flex}
    .ftb-div{width:1px;height:22px;background:#E0D8D0;margin:0 3px;flex-shrink:0}
    .ftb-font{height:30px;padding:0 6px;border:1.5px solid var(--border-light);border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);cursor:pointer;outline:none;flex-shrink:0;min-width:110px}
    .ftb-font:focus{border-color:var(--accent)}
    .ftb-size{height:30px;width:58px;padding:0 4px;border:1.5px solid var(--border-light);border-radius:6px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-card);cursor:pointer;outline:none;flex-shrink:0}
    .ftb-size:focus{border-color:var(--accent)}
    .ftb-btn{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:13px;color:var(--text-primary);transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-weight:700}
    .ftb-btn:hover{background:var(--bg-surface);color:var(--accent)}
    .ftb-btn.on{background:var(--accent);color:var(--text-on-accent)}
    .ftb-align{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;color:var(--text-primary);transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
    .ftb-align:hover{background:var(--bg-surface)}
    .ftb-align.on{background:var(--accent);color:var(--text-on-accent)}

    /* color swatch buttons in toolbar */
    .ftb-color-wrap{position:relative;flex-shrink:0}
    .ftb-swatch-btn{width:30px;height:30px;border:1.5px solid var(--border-light);border-radius:6px;cursor:pointer;background:var(--bg-card);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px}
    .ftb-swatch-btn:hover{border-color:var(--accent)}
    .ftb-swatch-letter{font-size:12px;font-weight:700;color:var(--text-primary);line-height:1;font-family:'DM Sans',sans-serif;pointer-events:none}
    .ftb-swatch-bar{width:16px;height:3px;border-radius:1px;pointer-events:none}
    .ftb-swatch-panel{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:var(--bg-card);border:1.5px solid var(--border);border-radius:10px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.14);z-index:100;width:192px}
    .ftb-swatch-panel.open{display:block}
    .ftb-swatch-panel p{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;font-family:'DM Sans',sans-serif}
    .ftb-grid{display:flex;flex-wrap:wrap;gap:4px}
    .ftb-dot{width:20px;height:20px;border-radius:4px;cursor:pointer;border:1px solid rgba(0,0,0,0.1);transition:transform 0.1s;flex-shrink:0}
    .ftb-dot:hover{transform:scale(1.3);position:relative;z-index:1}
    .ftb-del{width:30px;height:30px;border:none;border-radius:6px;background:transparent;cursor:pointer;font-size:14px;color:var(--accent);transition:all 0.12s;flex-shrink:0;display:flex;align-items:center;justify-content:center}
    .ftb-del:hover{background:var(--accent-bg)}

    /* canvas wrapper — for overlay hit testing */
    .meme-canvas-wrap{position:relative;background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px}
    .meme-canvas-wrap canvas{display:block;max-width:100%}
    .meme-placeholder{color:var(--btn-disabled);font-size:14px;font-family:'DM Sans',sans-serif;padding:60px 20px;text-align:center}

    /* RIGHT PANEL */
    .meme-panel{background:var(--bg-card);border-radius:14px;border:1.5px solid var(--border);box-shadow:0 1px 4px rgba(0,0,0,0.06);padding:20px;position:sticky;top:84px;display:flex;flex-direction:column;gap:0}
    .panel-title{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:0 0 14px;text-align:center}
    .panel-section{padding:14px 0;border-bottom:1px solid #F0EAE4}
    .panel-section:last-child{border-bottom:none;padding-bottom:0}
    .panel-label{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;display:block;font-family:'DM Sans',sans-serif}

    /* text inside/outside toggle with icons */
    .pos-toggle{display:flex;gap:8px;margin-bottom:0}
    .pos-btn{flex:1;padding:10px 6px;border:1.5px solid var(--border-light);border-radius:10px;background:var(--bg-card);font-size:11px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}
    .pos-btn svg{opacity:0.5}
    .pos-btn:hover{border-color:var(--accent);color:var(--accent)}
    .pos-btn:hover svg{opacity:1}
    .pos-btn.active{background:var(--accent-bg);border-color:var(--accent);color:var(--accent)}
    .pos-btn.active svg{opacity:1}

    /* text inputs */
    .meme-input{width:100%;padding:9px 11px;border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-surface);outline:none;transition:border-color 0.15s;margin-bottom:6px}
    .meme-input:last-child{margin-bottom:0}
    .meme-input:focus{border-color:var(--accent);background:var(--bg-card)}
    .meme-input::placeholder{color:var(--btn-disabled);font-size:12px}

    /* outside band color */
    .band-color-row{display:flex;align-items:center;gap:8px;margin-top:8px}
    .band-color-label{font-size:12px;color:var(--text-secondary);font-family:'DM Sans',sans-serif}
    .band-color-pick{width:36px;height:26px;border:1.5px solid var(--border-light);border-radius:6px;cursor:pointer;padding:2px;background:var(--bg-card)}

    /* action buttons */
    .panel-action-btn{width:100%;padding:11px;border:1.5px solid var(--border-light);border-radius:10px;background:var(--bg-card);font-size:13px;font-weight:600;color:var(--text-primary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .panel-action-btn:last-of-type{margin-bottom:0}
    .panel-action-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-bg)}
    .panel-action-btn svg{flex-shrink:0;opacity:0.7}
    .panel-action-btn:hover svg{opacity:1}

    /* download */
    .fmt-row{display:flex;gap:6px;margin-bottom:10px}
    .fmt-btn{flex:1;padding:7px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:12px;font-weight:600;color:var(--text-secondary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .fmt-btn.active{background:var(--accent);border-color:var(--accent);color:var(--text-on-accent)}
    .download-btn{width:100%;padding:13px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s}
    .download-btn:hover{background:var(--accent-hover);transform:translateY(-1px)}

    /* modal */
    .meme-modal-overlay{position:fixed;inset:0;background:rgba(44,24,16,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .meme-modal{background:var(--bg-card);border-radius:16px;width:100%;max-width:760px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.2)}
    .meme-modal-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
    .meme-modal-header h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:0}
    .meme-modal-close{width:30px;height:30px;border:none;border-radius:8px;background:var(--bg-surface);color:var(--text-secondary);font-size:14px;cursor:pointer}
    .meme-modal-close:hover{background:var(--accent);color:var(--text-on-accent)}
    .meme-search{width:100%;padding:11px 16px;border:none;border-bottom:1px solid var(--border);font-size:13px;font-family:'DM Sans',sans-serif;color:var(--text-primary);background:var(--bg-surface);outline:none;flex-shrink:0}
    .meme-search::placeholder{color:var(--btn-disabled)}
    .meme-template-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;overflow-y:auto;flex:1}
    @media(max-width:600px){.meme-template-grid{grid-template-columns:repeat(2,1fr)}}
    .meme-template-item{border:1.5px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:all 0.15s;background:var(--bg-surface)}
    .meme-template-item:hover{border-color:var(--accent);box-shadow:0 4px 12px rgba(200,75,49,0.15);transform:translateY(-2px)}
    .meme-template-item img{width:100%;height:110px;object-fit:cover;display:block;background:#F0EAE4}
    .meme-template-item span{display:block;font-size:10px;font-weight:600;color:var(--text-secondary);padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Sans',sans-serif}
    .meme-pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 16px;border-top:1px solid var(--border);flex-shrink:0}
    .meme-page-btn{padding:7px 16px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);font-size:12px;font-weight:600;color:var(--text-primary);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s}
    .meme-page-btn:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
    .meme-page-btn:disabled{opacity:0.4;cursor:not-allowed}
    .meme-page-info{font-size:12px;color:var(--text-muted);font-family:'DM Sans',sans-serif}

    .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
    .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:var(--text-primary);margin:32px 0 10px}
    .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--text-primary);margin:24px 0 8px}
    .seo-section ol{padding-left:20px;margin:0 0 12px}
    .seo-section ol li{font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:6px}
    .seo-section p{font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 12px}
.seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .seo-link{padding:7px 14px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:8px;font-size:13px;font-weight:600;color:var(--text-primary);text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
    .seo-link:hover{border-color:var(--accent);color:var(--accent)}
    .seo-section .faq-item { background:var(--bg-card); border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:var(--text-primary); margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
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
    <h1 class="tool-title">${ui.title} <em class="brand-em">${ui.titleEm}</em></h1>
    <p class="tool-sub">${ui.sub}</p>
  </div>

  <div class="meme-source-row" id="sourceRow">
    <button class="meme-source-btn" id="uploadBtn">⬆ ${ui.uploadBtn}</button>
    <span class="meme-or">or</span>
    <button class="meme-source-btn" id="templateBtn">🎭 ${ui.templateBtn}</button>
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
        <label style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;position:relative;width:30px;height:30px;justify-content:center;border:1.5px solid var(--border-light);border-radius:6px;background:var(--bg-card)" title="Text color">
          <span style="font-size:13px;font-weight:700;color:var(--text-primary);line-height:1;font-family:'DM Sans',sans-serif;pointer-events:none">A</span>
          <div id="tcBar" style="width:16px;height:3px;border-radius:1px;background:#000000;pointer-events:none"></div>
          <input type="color" id="tcInput" value="#000000" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0">
        </label>

        <!-- stroke color -->
        <label style="display:flex;flex-direction:column;align-items:center;cursor:pointer;flex-shrink:0;position:relative;width:30px;height:30px;justify-content:center;border:1.5px solid var(--border-light);border-radius:6px;background:var(--bg-card)" title="Stroke color">
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
      <p class="panel-title">${ui.editor}</p>

      <!-- text position -->
      <div class="panel-section">
        <div class="pos-toggle">
          <button class="pos-btn active" id="insideBtn">
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none"><rect x="1" y="1" width="26" height="20" rx="3" stroke="#C84B31" stroke-width="1.5"/><text x="14" y="15" text-anchor="middle" font-size="9" fill="#C84B31" font-family="Impact">TEXT</text></svg>
            ${ui.textInside}
          </button>
          <button class="pos-btn" id="outsideBtn">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="1" y="9" width="26" height="18" rx="3" stroke="#9A8A7A" stroke-width="1.5"/><text x="14" y="6" text-anchor="middle" font-size="7" fill="#9A8A7A" font-family="Impact">TEXT</text></svg>
            ${ui.textOutside}
          </button>
        </div>
        <!-- outside band color — only shown when outside active -->
        <div class="band-color-row" id="bandColorRow" style="display:none">
          <span class="band-color-label">${ui.bandColor}</span>
          <input type="color" id="bandColor" value="#ffffff" class="band-color-pick">
        </div>
      </div>

      <!-- top / bottom text -->
      <div class="panel-section">
        <span class="panel-label">Text</span>
        <input type="text" id="topText" class="meme-input" placeholder="${ui.topText}">
        <input type="text" id="bottomText" class="meme-input" placeholder="${ui.bottomText}" style="margin-bottom:0">
      </div>

      <!-- actions -->
      <div class="panel-section">
        <span class="panel-label">Add</span>
        <button class="panel-action-btn" id="addTextBtn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#C84B31" stroke-width="1.5"/><text x="9" y="13" text-anchor="middle" font-size="10" fill="#C84B31" font-family="Impact,sans-serif">A</text></svg>
          ${ui.addText}
        </button>
        <button class="panel-action-btn" id="overlayBtn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#C84B31" stroke-width="1.5"/><path d="M1 12l4-4 3 3 4-5 5 6" stroke="#C84B31" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${ui.addImage}
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
        <button class="download-btn" id="downloadBtn">⬇ ${ui.download}</button>
        <div id="nextSteps" style="display:none;margin-top:14px">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;font-family:'DM Sans',sans-serif">${t.whats_next||"What's Next?"}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px" id="nextStepsButtons"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- template modal -->
  <div class="meme-modal-overlay" id="templateModal" style="display:none">
    <div class="meme-modal">
      <div class="meme-modal-header">
        <h2>${ui.chooseTempl}</h2>
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

let mainImage = null
let imageLayers = []   // { id, img, x, y, w, _xBtn, _resizeBtn, selected }
let selectedImageLayer = null
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
  document.querySelector('.tool-wrap').classList.add('expanded')
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

  // image layers
  imageLayers.forEach(il => {
    const iw = il.w * W
    const ih = (il.img.naturalHeight / il.img.naturalWidth) * iw
    const ix = il.x * W - iw/2
    const iy = il.y * canvas.height - ih/2
    ctx.drawImage(il.img, ix, iy, iw, ih)
    if (il.selected) {
      ctx.save()
      ctx.strokeStyle = '#4488ff'; ctx.lineWidth = 2; ctx.setLineDash([4,3])
      ctx.strokeRect(ix, iy, iw, ih)
      ctx.setLineDash([])
      // X delete button top-right
      const xr = 10
      const xcx = ix + iw + xr + 2, xcy = iy - xr - 2
      ctx.fillStyle = '#ff3333'
      ctx.beginPath(); ctx.arc(xcx, xcy, xr, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(xcx-5,xcy-5); ctx.lineTo(xcx+5,xcy+5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(xcx+5,xcy-5); ctx.lineTo(xcx-5,xcy+5); ctx.stroke()
      il._xBtn = { cx: xcx, cy: xcy, r: xr }
      // resize handle bottom-right
      const rcx = ix + iw, rcy = iy + ih
      ctx.fillStyle = '#4488ff'
      ctx.fillRect(rcx - 8, rcy - 8, 16, 16)
      il._resizeBtn = { x: rcx - 8, y: rcy - 8, w: 16, h: 16 }
      il._bounds = { ix, iy, iw, ih }
      ctx.restore()
    } else {
      il._xBtn = null; il._resizeBtn = null; il._bounds = { ix, iy, iw, ih }
    }
  })

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

    // check image layer X delete button
    for (const il of [...imageLayers].reverse()) {
      if (il._xBtn) {
        const { cx: xcx, cy: xcy, r } = il._xBtn
        if (Math.hypot(cx - xcx, cy - xcy) <= r + 4) {
          imageLayers = imageLayers.filter(x => x !== il)
          if (selectedImageLayer === il) selectedImageLayer = null
          render(); e.preventDefault(); return
        }
      }
      // check resize handle
      if (il._resizeBtn) {
        const rb = il._resizeBtn
        if (cx >= rb.x && cx <= rb.x+rb.w && cy >= rb.y && cy <= rb.y+rb.h) {
          dragging = { imageLayer: il, resizing: true, startX: cx, startY: cy, origW: il.w }
          e.preventDefault(); return
        }
      }
      // check image body for drag
      if (il._bounds) {
        const { ix, iy, iw, ih } = il._bounds
        if (cx >= ix && cx <= ix+iw && cy >= iy && cy <= iy+ih) {
          imageLayers.forEach(x => x.selected = false)
          il.selected = true; selectedImageLayer = il
          dragging = { imageLayer: il, resizing: false, startX: cx, startY: cy, origX: il.x, origY: il.y }
          render(); e.preventDefault(); return
        }
      }
    }

    // check text layer X delete button first
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
      dragging = { layer: hit, startX: cx, startY: cy, origX: hit.x, origY: hit.y }
      render()
      e.preventDefault()
    } else {
      // deselect
      selectedLayer = null
      selectedImageLayer = null
      imageLayers.forEach(il => il.selected = false)
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
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    if (dragging.imageLayer) {
      const il = dragging.imageLayer
      if (dragging.resizing) {
        const dx = mx - dragging.startX
        il.w = Math.max(0.05, Math.min(1, dragging.origW + dx / canvas.width))
      } else {
        il.x = Math.max(0, Math.min(1, dragging.origX + (mx - dragging.startX) / canvas.width))
        il.y = Math.max(0, Math.min(1, dragging.origY + (my - dragging.startY) / canvas.height))
      }
      render(); return
    }

    if (dragging.layer) {
      dragging.layer.x = Math.max(0, Math.min(1, dragging.origX + (mx - dragging.startX) / canvas.width))
      dragging.layer.y = Math.max(0, Math.min(1, dragging.origY + (my - dragging.startY) / canvas.height))
      render()
    }
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
    img.onload = () => {
      // deselect all
      imageLayers.forEach(il => il.selected = false)
      selectedImageLayer = null
      const il = { id: Date.now(), img, x: 0.5, y: 0.5, w: 0.3, selected: false, _xBtn: null, _resizeBtn: null, _bounds: null }
      imageLayers.push(il)
      selectedImageLayer = null
      render()
    }
    img.src = ev.target.result
  }
  r.readAsDataURL(f)
}

// ── Format + download ──
$('fmtJpg').onclick = () => { S.fmt='jpg'; $('fmtJpg').classList.add('active'); $('fmtPng').classList.remove('active') }
$('fmtPng').onclick = () => { S.fmt='png'; $('fmtPng').classList.add('active'); $('fmtJpg').classList.remove('active') }
// ── IDB helpers for passing meme to next tool ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IDB open failed'))
  })
}
async function saveToIDB(blob, name, type) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    store.put({ id: 0, blob, name, type })
    tx.oncomplete = resolve
    tx.onerror = () => reject(new Error('IDB write failed'))
  })
}

function buildNextSteps(blob, mime) {
  const ext = mime === 'image/png' ? 'png' : 'jpg'
  const buttons = [
    { label: t.nav_short?.compress  || 'Compress',  href: localHref('compress') },
    { label: t.nav_short?.resize    || 'Resize',    href: localHref('resize') },
    { label: t.nav_short?.crop      || 'Crop',      href: localHref('crop') },
    { label: t.nav_short?.rotate    || 'Rotate',    href: localHref('rotate') },
    { label: t.nav_short?.watermark || 'Watermark', href: localHref('watermark') },
  ]
  const container = $('nextStepsButtons')
  container.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.style.cssText = 'padding:7px 13px;border-radius:8px;border:1.5px solid var(--border-light);font-size:12px;font-weight:600;color:var(--text-primary);background:var(--bg-card);cursor:pointer;font-family:DM Sans,sans-serif;transition:all 0.15s'
    btn.textContent = b.label
    btn.onmouseover = () => { btn.style.borderColor='var(--accent)'; btn.style.color='var(--accent)' }
    btn.onmouseout  = () => { btn.style.borderColor='var(--border-light)'; btn.style.color='var(--text-primary)' }
    btn.onclick = async () => {
      try {
        await saveToIDB(blob, `meme.${ext}`, mime)
        sessionStorage.setItem('pendingFromIDB', '1')
      } catch(e) {}
      window.location.href = b.href
    }
    container.appendChild(btn)
  })
  $('nextSteps').style.display = 'block'
}

$('downloadBtn').onclick = () => {
  if (!canvas) return
  const mime = S.fmt === 'png' ? 'image/png' : 'image/jpeg'
  // deselect all for clean download
  const prevSelected = selectedLayer
  const prevImageSelected = selectedImageLayer
  selectedLayer = null
  selectedImageLayer = null
  imageLayers.forEach(il => il.selected = false)
  render()
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `meme.${S.fmt}`; a.click();if(window.showReviewPrompt)window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
    buildNextSteps(blob, mime)
    // restore selection
    selectedLayer = prevSelected
    selectedImageLayer = prevImageSelected
    if (prevImageSelected) prevImageSelected.selected = true
    render()
  }, mime, 0.92)
}

// ── Templates ──
$('templateBtn').onclick = async () => {
  $('templateModal').style.display = 'flex'
  if (allTemplates.length) { filteredTemplates = allTemplates; showPage(0); return }
  $('templateGrid').innerHTML = '<p style="padding:24px;color:var(--text-muted);font-size:13px;grid-column:1/-1">Loading templates…</p>'
  try {
    const res = await fetch('https://api.imgflip.com/get_memes')
    const json = await res.json()
    allTemplates = json.data.memes; filteredTemplates = allTemplates; showPage(0)
  } catch { $('templateGrid').innerHTML = '<p style="padding:24px;color:var(--accent);font-size:13px;grid-column:1/-1">Failed to load.</p>' }
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
const seoMeme = {
  en: {
    h2a: 'How to Make a Meme Free — No Upload Required',
    steps: ['Upload your image or choose a template — click Upload Image or pick from 100+ popular meme templates.','Add your text — type in the Top Text and Bottom Text fields, or click Add Text to place custom text anywhere on the image.','Style your text — change font, size, color, stroke, bold, italic, and alignment using the toolbar.','Download your meme — click JPG or PNG to save instantly to your device.'],
    h2b: "The Best Free Meme Generator That Doesn't Upload Your Files",
    body: 'RelahConvert lets you create memes directly in your browser. No upload, no account, no watermark. Choose from 100+ viral meme templates or use your own photo. Add text inside or outside the image, drag it anywhere, and customize every detail.',
    h3why: 'Why Make Memes Online?',
    why: 'Memes are the fastest way to share a joke, make a point, or go viral. A good meme generator gives you full control over text placement, font, and style — without installing anything or giving up your photos.',
    faqs: [{q:'Will my image be uploaded to a server?',a:'No. Everything runs in your browser. Your files never leave your device.'},{q:'Can I use my own image?',a:'Yes — upload any JPG, PNG, or WebP image.'},{q:'Is there a watermark?',a:'No watermark, ever.'},{q:'Can I add multiple text layers?',a:'Yes — click Add Text to add as many draggable text layers as you want.'},{q:'What fonts are available?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New, and Comic Sans.'},{q:'Can I download as PNG?',a:'Yes — choose JPG or PNG before downloading.'}],
    links: [{href: '/compress',label:'Compress Image'},{href: '/resize',label:'Resize Image'},{href: '/crop',label:'Crop Image'},{href: '/watermark',label:'Add Watermark'},{href: '/jpg-to-png',label:'JPG to PNG'}],
  },
  fr: {
    h2a: "Comment créer un mème gratuitement — sans téléchargement",
    steps: ["Téléversez votre image ou choisissez un modèle — cliquez sur Téléverser une image ou choisissez parmi plus de 100 modèles populaires.","Ajoutez votre texte — tapez dans les champs Texte du haut et Texte du bas, ou cliquez sur Ajouter du texte pour le placer n'importe où.","Stylisez votre texte — modifiez la police, la taille, la couleur, le contour, le gras, l'italique et l'alignement.","Téléchargez votre mème — cliquez sur JPG ou PNG pour enregistrer instantanément."],
    h2b: "Le meilleur générateur de mèmes gratuit qui ne télécharge pas vos fichiers",
    body: "RelahConvert vous permet de créer des mèmes directement dans votre navigateur. Aucun téléchargement, aucun compte, aucun filigrane. Choisissez parmi plus de 100 modèles viraux ou utilisez votre propre photo.",
    h3why: "Pourquoi créer des mèmes en ligne ?",
    why: "Les mèmes sont le moyen le plus rapide de partager une blague ou de devenir viral. Un bon générateur vous donne un contrôle total sur le texte, la police et le style — sans rien installer.",
    faqs: [{q:"Mon image sera-t-elle téléchargée sur un serveur ?",a:"Non. Tout s'exécute dans votre navigateur. Vos fichiers ne quittent jamais votre appareil."},{q:"Puis-je utiliser ma propre image ?",a:"Oui — téléversez n'importe quelle image JPG, PNG ou WebP."},{q:"Y a-t-il un filigrane ?",a:"Aucun filigrane, jamais."},{q:"Puis-je ajouter plusieurs calques de texte ?",a:"Oui — cliquez sur Ajouter du texte pour en ajouter autant que vous voulez."},{q:"Quelles polices sont disponibles ?",a:"Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New et Comic Sans."},{q:"Puis-je télécharger en PNG ?",a:"Oui — choisissez JPG ou PNG avant de télécharger."}],
    links: [{href:"/compress",label:"Compresser l'image"},{href:"/resize",label:"Redimensionner"},{href:"/crop",label:"Recadrer"},{href:"/watermark",label:"Filigrane"},{href:"/jpg-to-png",label:"JPG en PNG"}],
  },
  es: {
    h2a: 'Cómo crear un meme gratis — sin subir archivos',
    steps: ['Sube tu imagen o elige una plantilla — haz clic en Subir imagen o elige entre más de 100 plantillas populares.','Agrega tu texto — escribe en los campos Texto superior e inferior, o haz clic en Agregar texto para colocarlo en cualquier lugar.','Estiliza tu texto — cambia la fuente, tamaño, color, contorno, negrita, cursiva y alineación.','Descarga tu meme — haz clic en JPG o PNG para guardarlo instantáneamente.'],
    h2b: 'El mejor generador de memes gratuito que no sube tus archivos',
    body: 'RelahConvert te permite crear memes directamente en tu navegador. Sin subidas, sin cuenta, sin marca de agua. Elige entre más de 100 plantillas virales o usa tu propia foto.',
    h3why: '¿Por qué hacer memes en línea?',
    why: 'Los memes son la forma más rápida de compartir un chiste o volverse viral. Un buen generador te da control total sobre el texto, la fuente y el estilo — sin instalar nada.',
    faqs: [{q:'¿Mi imagen se subirá a un servidor?',a:'No. Todo se ejecuta en tu navegador. Tus archivos nunca salen de tu dispositivo.'},{q:'¿Puedo usar mi propia imagen?',a:'Sí — sube cualquier imagen JPG, PNG o WebP.'},{q:'¿Hay marca de agua?',a:'Sin marca de agua, nunca.'},{q:'¿Puedo agregar varias capas de texto?',a:'Sí — haz clic en Agregar texto para añadir tantas como desees.'},{q:'¿Qué fuentes están disponibles?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New y Comic Sans.'},{q:'¿Puedo descargar en PNG?',a:'Sí — elige JPG o PNG antes de descargar.'}],
    links: [{href: '/compress',label:'Comprimir imagen'},{href: '/resize',label:'Redimensionar'},{href: '/crop',label:'Recortar'},{href: '/watermark',label:'Marca de agua'},{href: '/jpg-to-png',label:'JPG a PNG'}],
  },
  pt: {
    h2a: 'Como criar um meme grátis — sem fazer upload',
    steps: ['Faça upload da sua imagem ou escolha um modelo — clique em Fazer upload ou escolha entre mais de 100 modelos populares.','Adicione seu texto — digite nos campos Texto superior e inferior, ou clique em Adicionar texto para colocá-lo em qualquer lugar.','Estilize seu texto — altere a fonte, tamanho, cor, contorno, negrito, itálico e alinhamento.','Baixe seu meme — clique em JPG ou PNG para salvar instantaneamente.'],
    h2b: 'O melhor gerador de memes gratuito que não faz upload dos seus arquivos',
    body: "O RelahConvert permite criar memes diretamente no seu navegador. Sem upload, sem conta, sem marca d'água. Escolha entre mais de 100 modelos virais ou use sua própria foto.",
    h3why: 'Por que criar memes online?',
    why: 'Os memes são a forma mais rápida de compartilhar uma piada ou se tornar viral. Um bom gerador oferece controle total sobre o texto, a fonte e o estilo — sem instalar nada.',
    faqs: [{q:'Minha imagem será enviada para um servidor?',a:'Não. Tudo é executado no seu navegador. Seus arquivos nunca saem do seu dispositivo.'},{q:'Posso usar minha própria imagem?',a:"Sim — faça upload de qualquer imagem JPG, PNG ou WebP."},{q:"Há marca d'água?",a:"Sem marca d'água, nunca."},{q:'Posso adicionar várias camadas de texto?',a:'Sim — clique em Adicionar texto para adicionar quantas quiser.'},{q:'Quais fontes estão disponíveis?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New e Comic Sans.'},{q:'Posso baixar em PNG?',a:'Sim — escolha JPG ou PNG antes de baixar.'}],
    links: [{href: '/compress',label:'Comprimir imagem'},{href: '/resize',label:'Redimensionar'},{href: '/crop',label:'Cortar'},{href:"/watermark",label:"Marca d'água"},{href: '/jpg-to-png',label:'JPG para PNG'}],
  },
  de: {
    h2a: 'So erstellen Sie ein Meme kostenlos — ohne Upload',
    steps: ['Laden Sie Ihr Bild hoch oder wählen Sie eine Vorlage — klicken Sie auf Bild hochladen oder wählen Sie aus über 100 beliebten Vorlagen.','Fügen Sie Ihren Text hinzu — geben Sie in die Felder Oberer Text und Unterer Text ein, oder klicken Sie auf Text hinzufügen.','Gestalten Sie Ihren Text — ändern Sie Schriftart, Größe, Farbe, Kontur, Fett, Kursiv und Ausrichtung.','Laden Sie Ihr Meme herunter — klicken Sie auf JPG oder PNG zum sofortigen Speichern.'],
    h2b: 'Der beste kostenlose Meme-Generator, der Ihre Dateien nicht hochlädt',
    body: 'RelahConvert ermöglicht es Ihnen, Memes direkt in Ihrem Browser zu erstellen. Kein Upload, kein Konto, kein Wasserzeichen. Wählen Sie aus über 100 viralen Vorlagen oder verwenden Sie Ihr eigenes Foto.',
    h3why: 'Warum Memes online erstellen?',
    why: 'Memes sind der schnellste Weg, einen Witz zu teilen oder viral zu gehen. Ein guter Generator gibt Ihnen volle Kontrolle über Text, Schriftart und Stil — ohne Installation.',
    faqs: [{q:'Wird mein Bild auf einen Server hochgeladen?',a:'Nein. Alles läuft in Ihrem Browser. Ihre Dateien verlassen nie Ihr Gerät.'},{q:'Kann ich mein eigenes Bild verwenden?',a:'Ja — laden Sie ein beliebiges JPG-, PNG- oder WebP-Bild hoch.'},{q:'Gibt es ein Wasserzeichen?',a:'Kein Wasserzeichen, niemals.'},{q:'Kann ich mehrere Textebenen hinzufügen?',a:'Ja — klicken Sie auf Text hinzufügen, um beliebig viele hinzuzufügen.'},{q:'Welche Schriftarten sind verfügbar?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New und Comic Sans.'},{q:'Kann ich als PNG herunterladen?',a:'Ja — wählen Sie vor dem Herunterladen JPG oder PNG.'}],
    links: [{href: '/compress',label:'Bild komprimieren'},{href: '/resize',label:'Skalieren'},{href: '/crop',label:'Zuschneiden'},{href: '/watermark',label:'Wasserzeichen'},{href: '/jpg-to-png',label:'JPG zu PNG'}],
  },
  ar: {
    h2a: 'كيفية إنشاء ميم مجاناً — بدون رفع الملفات',
    steps: ['ارفع صورتك أو اختر قالباً — انقر على رفع صورة أو اختر من أكثر من 100 قالب شهير.','أضف نصك — اكتب في حقلي النص العلوي والسفلي، أو انقر على إضافة نص لوضعه في أي مكان.','نسّق نصك — غيّر الخط والحجم واللون والحدود والغامق والمائل والمحاذاة.','نزّل ميمك — انقر على JPG أو PNG للحفظ فوراً.'],
    h2b: 'أفضل مولّد ميم مجاني لا يرفع ملفاتك',
    body: 'يتيح لك RelahConvert إنشاء الميمات مباشرةً في متصفحك. بدون رفع، بدون حساب، بدون علامة مائية. اختر من أكثر من 100 قالب رائج أو استخدم صورتك الخاصة.',
    h3why: 'لماذا تصنع الميمات أونلاين؟',
    why: 'الميمات هي أسرع طريقة لمشاركة نكتة أو الانتشار الواسع. يمنحك مولّد الميم الجيد تحكماً كاملاً في النص والخط والأسلوب — دون تثبيت أي شيء.',
    faqs: [{q:'هل سيتم رفع صورتي إلى خادم؟',a:'لا. كل شيء يعمل في متصفحك. ملفاتك لا تغادر جهازك أبداً.'},{q:'هل يمكنني استخدام صورتي الخاصة؟',a:'نعم — ارفع أي صورة بصيغة JPG أو PNG أو WebP.'},{q:'هل توجد علامة مائية؟',a:'لا توجد علامة مائية، أبداً.'},{q:'هل يمكنني إضافة طبقات نص متعددة؟',a:'نعم — انقر على إضافة نص لإضافة أي عدد تريده.'},{q:'ما الخطوط المتاحة؟',a:'Impact وArial Black وArial وVerdana وTimes New Roman وGeorgia وCourier New وComic Sans.'},{q:'هل يمكنني التنزيل بصيغة PNG؟',a:'نعم — اختر JPG أو PNG قبل التنزيل.'}],
    links: [{href: '/compress',label:'ضغط الصورة'},{href: '/resize',label:'تغيير الحجم'},{href: '/crop',label:'اقتصاص'},{href: '/watermark',label:'علامة مائية'},{href: '/jpg-to-png',label:'JPG إلى PNG'}],
  },
  it: {
    h2a: 'Come creare un meme gratis — senza caricare file',
    steps: ['Carica la tua immagine o scegli un modello — clicca su Carica immagine o scegli tra oltre 100 modelli popolari.','Aggiungi il tuo testo — scrivi nei campi Testo superiore e inferiore, o clicca su Aggiungi testo per posizionarlo ovunque.','Personalizza il testo — cambia font, dimensione, colore, contorno, grassetto, corsivo e allineamento.','Scarica il tuo meme — clicca su JPG o PNG per salvare istantaneamente.'],
    h2b: 'Il miglior generatore di meme gratuito che non carica i tuoi file',
    body: 'RelahConvert ti permette di creare meme direttamente nel browser. Nessun caricamento, nessun account, nessun watermark. Scegli tra oltre 100 modelli virali o usa la tua foto.',
    h3why: 'Perché creare meme online?',
    why: 'I meme sono il modo più veloce per condividere una battuta o diventare virali. Un buon generatore ti dà il controllo completo su testo, font e stile — senza installare nulla.',
    faqs: [{q:'La mia immagine viene caricata su un server?',a:'No. Tutto funziona nel tuo browser. I tuoi file non lasciano mai il dispositivo.'},{q:'Posso usare la mia immagine?',a:'Sì — carica qualsiasi immagine JPG, PNG o WebP.'},{q:'C\'è un watermark?',a:'Nessun watermark, mai.'},{q:'Posso aggiungere più livelli di testo?',a:'Sì — clicca su Aggiungi testo per aggiungerne quanti ne vuoi.'},{q:'Quali font sono disponibili?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New e Comic Sans.'},{q:'Posso scaricare in PNG?',a:'Sì — scegli JPG o PNG prima di scaricare.'}],
    links: [{href: '/compress',label:'Comprimi immagine'},{href: '/resize',label:'Ridimensiona'},{href: '/crop',label:'Ritaglia'},{href: '/watermark',label:'Watermark'},{href: '/jpg-to-png',label:'JPG in PNG'}],
  },
  ja: {
    h2a: 'ミームを無料で作成する方法 — アップロード不要',
    steps: ['画像をアップロードまたはテンプレートを選択 — 「画像をアップロード」をクリックするか、100以上の人気テンプレートから選択。','テキストを追加 — 上部テキストと下部テキストのフィールドに入力、または「テキスト追加」で任意の場所に配置。','テキストをスタイリング — フォント、サイズ、色、輪郭、太字、斜体、配置を変更。','ミームをダウンロード — JPGまたはPNGをクリックして即座に保存。'],
    h2b: 'ファイルをアップロードしない最高の無料ミームジェネレーター',
    body: 'RelahConvertはブラウザで直接ミームを作成できます。アップロード不要、アカウント不要、透かしなし。100以上のバイラルテンプレートから選ぶか、自分の写真を使用できます。',
    h3why: 'なぜオンラインでミームを作るのか？',
    why: 'ミームはジョークを共有したりバイラルになる最速の方法です。優れたジェネレーターはテキスト、フォント、スタイルを完全にコントロールできます。',
    faqs: [{q:'画像はサーバーにアップロードされますか？',a:'いいえ。すべてブラウザで動作します。ファイルはデバイスから離れません。'},{q:'自分の画像を使えますか？',a:'はい — JPG、PNG、WebP画像をアップロードできます。'},{q:'透かしはありますか？',a:'透かしは一切ありません。'},{q:'複数のテキストレイヤーを追加できますか？',a:'はい — テキスト追加をクリックして好きなだけ追加できます。'},{q:'どのフォントが使えますか？',a:'Impact、Arial Black、Arial、Verdana、Times New Roman、Georgia、Courier New、Comic Sans。'},{q:'PNGでダウンロードできますか？',a:'はい — ダウンロード前にJPGまたはPNGを選択できます。'}],
    links: [{href: '/compress',label:'画像圧縮'},{href: '/resize',label:'リサイズ'},{href: '/crop',label:'トリミング'},{href: '/watermark',label:'透かし'},{href: '/jpg-to-png',label:'JPGからPNG'}],
  },
  ru: {
    h2a: 'Как создать мем бесплатно — без загрузки файлов',
    steps: ['Загрузите изображение или выберите шаблон — нажмите «Загрузить» или выберите из 100+ популярных шаблонов.','Добавьте текст — введите в поля верхнего и нижнего текста или нажмите «Добавить текст» для размещения в любом месте.','Стилизуйте текст — измените шрифт, размер, цвет, обводку, жирность, курсив и выравнивание.','Скачайте мем — нажмите JPG или PNG для мгновенного сохранения.'],
    h2b: 'Лучший бесплатный генератор мемов без загрузки файлов',
    body: 'RelahConvert позволяет создавать мемы прямо в браузере. Без загрузки, без аккаунта, без водяных знаков. Выбирайте из 100+ вирусных шаблонов или используйте своё фото.',
    h3why: 'Зачем создавать мемы онлайн?',
    why: 'Мемы — самый быстрый способ поделиться шуткой или стать вирусным. Хороший генератор даёт полный контроль над текстом, шрифтом и стилем.',
    faqs: [{q:'Моё изображение загружается на сервер?',a:'Нет. Всё работает в вашем браузере. Файлы никогда не покидают ваше устройство.'},{q:'Можно ли использовать своё изображение?',a:'Да — загрузите любое изображение JPG, PNG или WebP.'},{q:'Есть водяной знак?',a:'Водяного знака нет, никогда.'},{q:'Можно добавить несколько текстовых слоёв?',a:'Да — нажмите «Добавить текст», чтобы добавить сколько угодно.'},{q:'Какие шрифты доступны?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New и Comic Sans.'},{q:'Можно скачать в PNG?',a:'Да — выберите JPG или PNG перед скачиванием.'}],
    links: [{href: '/compress',label:'Сжать изображение'},{href: '/resize',label:'Изменить размер'},{href: '/crop',label:'Обрезать'},{href: '/watermark',label:'Водяной знак'},{href: '/jpg-to-png',label:'JPG в PNG'}],
  },
  ko: {
    h2a: '무료로 밈 만드는 방법 — 업로드 불필요',
    steps: ['이미지를 업로드하거나 템플릿을 선택 — "이미지 업로드"를 클릭하거나 100개 이상의 인기 템플릿에서 선택하세요.','텍스트 추가 — 상단 텍스트와 하단 텍스트 필드에 입력하거나 "텍스트 추가"를 클릭하여 원하는 위치에 배치하세요.','텍스트 스타일링 — 글꼴, 크기, 색상, 윤곽선, 굵기, 기울임, 정렬을 변경하세요.','밈 다운로드 — JPG 또는 PNG를 클릭하여 즉시 저장하세요.'],
    h2b: '파일을 업로드하지 않는 최고의 무료 밈 생성기',
    body: 'RelahConvert는 브라우저에서 직접 밈을 만들 수 있습니다. 업로드 없음, 계정 없음, 워터마크 없음. 100개 이상의 바이럴 템플릿에서 선택하거나 자신의 사진을 사용하세요.',
    h3why: '왜 온라인에서 밈을 만들까요?',
    why: '밈은 농담을 공유하거나 바이럴이 되는 가장 빠른 방법입니다. 좋은 생성기는 텍스트, 글꼴, 스타일을 완전히 제어할 수 있게 해줍니다.',
    faqs: [{q:'이미지가 서버에 업로드되나요?',a:'아닙니다. 모든 것이 브라우저에서 작동합니다. 파일은 기기를 떠나지 않습니다.'},{q:'내 이미지를 사용할 수 있나요?',a:'네 — JPG, PNG 또는 WebP 이미지를 업로드하세요.'},{q:'워터마크가 있나요?',a:'워터마크는 절대 없습니다.'},{q:'여러 텍스트 레이어를 추가할 수 있나요?',a:'네 — 텍스트 추가를 클릭하여 원하는 만큼 추가하세요.'},{q:'어떤 글꼴을 사용할 수 있나요?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New, Comic Sans.'},{q:'PNG로 다운로드할 수 있나요?',a:'네 — 다운로드 전에 JPG 또는 PNG를 선택하세요.'}],
    links: [{href: '/compress',label:'이미지 압축'},{href: '/resize',label:'크기 조정'},{href: '/crop',label:'자르기'},{href: '/watermark',label:'워터마크'},{href: '/jpg-to-png',label:'JPG를 PNG로'}],
  },
  zh: {
    h2a: '如何免费制作表情包 — 无需上传',
    steps: ['上传图片或选择模板 — 点击"上传图片"或从100多个热门模板中选择。','添加文字 — 在顶部文字和底部文字字段中输入，或点击"添加文字"放置在任意位置。','设置文字样式 — 更改字体、大小、颜色、描边、粗体、斜体和对齐方式。','下载表情包 — 点击JPG或PNG即时保存。'],
    h2b: '不上传文件的最佳免费表情包生成器',
    body: 'RelahConvert让你直接在浏览器中创建表情包。无需上传、无需账号、无水印。从100多个热门模板中选择或使用自己的照片。',
    h3why: '为什么要在线制作表情包？',
    why: '表情包是分享笑话或走红的最快方式。好的生成器让你完全控制文字、字体和样式 — 无需安装任何东西。',
    faqs: [{q:'我的图片会上传到服务器吗？',a:'不会。一切都在浏览器中运行。文件永远不会离开你的设备。'},{q:'可以使用自己的图片吗？',a:'可以 — 上传任何JPG、PNG或WebP图片。'},{q:'有水印吗？',a:'永远没有水印。'},{q:'可以添加多个文字层吗？',a:'可以 — 点击"添加文字"添加任意数量。'},{q:'有哪些字体可用？',a:'Impact、Arial Black、Arial、Verdana、Times New Roman、Georgia、Courier New和Comic Sans。'},{q:'可以下载PNG格式吗？',a:'可以 — 下载前选择JPG或PNG。'}],
    links: [{href: '/compress',label:'压缩图片'},{href: '/resize',label:'调整大小'},{href: '/crop',label:'裁剪'},{href: '/watermark',label:'水印'},{href: '/jpg-to-png',label:'JPG转PNG'}],
  },
  'zh-TW': {
    h2a: '如何免費製作迷因 — 無需上傳',
    steps: ['上傳圖片或選擇範本 — 點擊「上傳圖片」或從100多個熱門範本中選擇。','新增文字 — 在頂部文字和底部文字欄位中輸入，或點擊「新增文字」放置在任意位置。','設定文字樣式 — 更改字型、大小、顏色、描邊、粗體、斜體和對齊方式。','下載迷因 — 點擊JPG或PNG即時儲存。'],
    h2b: '不上傳檔案的最佳免費迷因產生器',
    body: 'RelahConvert讓你直接在瀏覽器中建立迷因。無需上傳、無需帳號、無浮水印。從100多個熱門範本中選擇或使用自己的照片。',
    h3why: '為什麼要線上製作迷因？',
    why: '迷因是分享笑話或爆紅的最快方式。好的產生器讓你完全控制文字、字型和樣式 — 無需安裝任何東西。',
    faqs: [{q:'我的圖片會上傳到伺服器嗎？',a:'不會。一切都在瀏覽器中運行。檔案永遠不會離開你的裝置。'},{q:'可以使用自己的圖片嗎？',a:'可以 — 上傳任何JPG、PNG或WebP圖片。'},{q:'有浮水印嗎？',a:'永遠沒有浮水印。'},{q:'可以新增多個文字層嗎？',a:'可以 — 點擊「新增文字」新增任意數量。'},{q:'有哪些字型可用？',a:'Impact、Arial Black、Arial、Verdana、Times New Roman、Georgia、Courier New和Comic Sans。'},{q:'可以下載PNG格式嗎？',a:'可以 — 下載前選擇JPG或PNG。'}],
    links: [{href: '/compress',label:'壓縮圖片'},{href: '/resize',label:'調整大小'},{href: '/crop',label:'裁切'},{href: '/watermark',label:'浮水印'},{href: '/jpg-to-png',label:'JPG轉PNG'}],
  },
  bg: {
    h2a: 'Как да създадете мийм безплатно — без качване',
    steps: ['Качете изображение или изберете шаблон — щракнете „Качи изображение" или изберете от 100+ популярни шаблона.','Добавете текст — въведете в полетата за горен и долен текст, или щракнете „Добави текст" за поставяне навсякъде.','Стилизирайте текста — променете шрифт, размер, цвят, контур, получер, курсив и подравняване.','Изтеглете мийма — щракнете JPG или PNG за мигновено запазване.'],
    h2b: 'Най-добрият безплатен генератор на миймове без качване',
    body: 'RelahConvert ви позволява да създавате миймове директно в браузъра. Без качване, без акаунт, без воден знак. Изберете от 100+ вирусни шаблона или използвайте собствена снимка.',
    h3why: 'Защо да правите миймове онлайн?',
    why: 'Миймовете са най-бързият начин да споделите шега или да станете вирусни. Добрият генератор дава пълен контрол върху текст, шрифт и стил.',
    faqs: [{q:'Изображението ми ще бъде качено на сървър?',a:'Не. Всичко работи в браузъра ви. Файловете никога не напускат устройството.'},{q:'Мога ли да използвам собствено изображение?',a:'Да — качете всяко JPG, PNG или WebP изображение.'},{q:'Има ли воден знак?',a:'Никога няма воден знак.'},{q:'Мога ли да добавя множество текстови слоеве?',a:'Да — щракнете „Добави текст" за добавяне на колкото искате.'},{q:'Какви шрифтове са налични?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New и Comic Sans.'},{q:'Мога ли да изтегля като PNG?',a:'Да — изберете JPG или PNG преди изтегляне.'}],
    links: [{href: '/compress',label:'Компресиране'},{href: '/resize',label:'Преоразмеряване'},{href: '/crop',label:'Изрязване'},{href: '/watermark',label:'Воден знак'},{href: '/jpg-to-png',label:'JPG към PNG'}],
  },
  ca: {
    h2a: 'Com crear un meme gratis — sense pujar fitxers',
    steps: ['Pugeu la vostra imatge o trieu una plantilla — feu clic a «Pujar imatge» o trieu entre més de 100 plantilles populars.','Afegiu el text — escriviu als camps de text superior i inferior, o feu clic a «Afegir text» per col·locar-lo on vulgueu.','Estilitzeu el text — canvieu la font, mida, color, contorn, negreta, cursiva i alineació.','Descarregueu el meme — feu clic a JPG o PNG per desar instantàniament.'],
    h2b: 'El millor generador de memes gratuït que no puja els vostres fitxers',
    body: 'RelahConvert us permet crear memes directament al navegador. Sense pujada, sense compte, sense marca d\'aigua. Trieu entre més de 100 plantilles virals o useu la vostra foto.',
    h3why: 'Per què crear memes en línia?',
    why: 'Els memes són la manera més ràpida de compartir un acudit o fer-se viral. Un bon generador dóna control total sobre text, font i estil.',
    faqs: [{q:'La meva imatge es pujarà a un servidor?',a:'No. Tot funciona al vostre navegador. Els fitxers no surten mai del dispositiu.'},{q:'Puc usar la meva pròpia imatge?',a:'Sí — pugeu qualsevol imatge JPG, PNG o WebP.'},{q:'Hi ha marca d\'aigua?',a:'Mai cap marca d\'aigua.'},{q:'Puc afegir múltiples capes de text?',a:'Sí — feu clic a «Afegir text» per afegir-ne tantes com vulgueu.'},{q:'Quines fonts estan disponibles?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New i Comic Sans.'},{q:'Puc descarregar en PNG?',a:'Sí — trieu JPG o PNG abans de descarregar.'}],
    links: [{href: '/compress',label:'Comprimir imatge'},{href: '/resize',label:'Redimensionar'},{href: '/crop',label:'Retallar'},{href: '/watermark',label:'Marca d\'aigua'},{href: '/jpg-to-png',label:'JPG a PNG'}],
  },
  nl: {
    h2a: 'Hoe maak je gratis een meme — zonder uploaden',
    steps: ['Upload je afbeelding of kies een sjabloon — klik op "Afbeelding uploaden" of kies uit 100+ populaire sjablonen.','Voeg tekst toe — typ in de velden boventekst en ondertekst, of klik op "Tekst toevoegen" om het overal te plaatsen.','Style je tekst — wijzig lettertype, grootte, kleur, omtrek, vet, cursief en uitlijning.','Download je meme — klik op JPG of PNG om direct op te slaan.'],
    h2b: 'De beste gratis memegenerator die je bestanden niet uploadt',
    body: 'RelahConvert laat je memes maken direct in je browser. Geen upload, geen account, geen watermerk. Kies uit 100+ virale sjablonen of gebruik je eigen foto.',
    h3why: 'Waarom online memes maken?',
    why: 'Memes zijn de snelste manier om een grap te delen of viraal te gaan. Een goede generator geeft volledige controle over tekst, lettertype en stijl.',
    faqs: [{q:'Wordt mijn afbeelding geüpload naar een server?',a:'Nee. Alles draait in je browser. Je bestanden verlaten nooit je apparaat.'},{q:'Kan ik mijn eigen afbeelding gebruiken?',a:'Ja — upload elke JPG-, PNG- of WebP-afbeelding.'},{q:'Is er een watermerk?',a:'Nooit een watermerk.'},{q:'Kan ik meerdere tekstlagen toevoegen?',a:'Ja — klik op "Tekst toevoegen" om er zoveel toe te voegen als je wilt.'},{q:'Welke lettertypen zijn beschikbaar?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New en Comic Sans.'},{q:'Kan ik downloaden als PNG?',a:'Ja — kies JPG of PNG voor het downloaden.'}],
    links: [{href: '/compress',label:'Afbeelding comprimeren'},{href: '/resize',label:'Formaat wijzigen'},{href: '/crop',label:'Bijsnijden'},{href: '/watermark',label:'Watermerk'},{href: '/jpg-to-png',label:'JPG naar PNG'}],
  },
  el: {
    h2a: 'Πώς να δημιουργήσετε meme δωρεάν — χωρίς μεταφόρτωση',
    steps: ['Ανεβάστε την εικόνα σας ή επιλέξτε πρότυπο — κάντε κλικ στο «Ανέβασμα εικόνας» ή επιλέξτε από 100+ δημοφιλή πρότυπα.','Προσθέστε κείμενο — πληκτρολογήστε στα πεδία πάνω και κάτω κειμένου, ή κάντε κλικ «Προσθήκη κειμένου» για τοποθέτηση οπουδήποτε.','Μορφοποιήστε το κείμενο — αλλάξτε γραμματοσειρά, μέγεθος, χρώμα, περίγραμμα, έντονα, πλάγια και στοίχιση.','Κατεβάστε το meme σας — κάντε κλικ στο JPG ή PNG για άμεση αποθήκευση.'],
    h2b: 'Η καλύτερη δωρεάν γεννήτρια meme χωρίς μεταφόρτωση αρχείων',
    body: 'Το RelahConvert σας επιτρέπει να δημιουργείτε memes απευθείας στο πρόγραμμα περιήγησης. Χωρίς μεταφόρτωση, χωρίς λογαριασμό, χωρίς υδατογράφημα.',
    h3why: 'Γιατί να φτιάξετε memes online;',
    why: 'Τα memes είναι ο πιο γρήγορος τρόπος να μοιραστείτε ένα αστείο ή να γίνετε viral. Μια καλή γεννήτρια δίνει πλήρη έλεγχο κειμένου, γραμματοσειράς και στυλ.',
    faqs: [{q:'Η εικόνα μου θα ανέβει σε server;',a:'Όχι. Όλα τρέχουν στο πρόγραμμα περιήγησής σας.'},{q:'Μπορώ να χρησιμοποιήσω τη δική μου εικόνα;',a:'Ναι — ανεβάστε οποιαδήποτε εικόνα JPG, PNG ή WebP.'},{q:'Υπάρχει υδατογράφημα;',a:'Ποτέ κανένα υδατογράφημα.'},{q:'Μπορώ να προσθέσω πολλαπλά επίπεδα κειμένου;',a:'Ναι — κάντε κλικ «Προσθήκη κειμένου» για να προσθέσετε όσα θέλετε.'},{q:'Ποιες γραμματοσειρές είναι διαθέσιμες;',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New και Comic Sans.'},{q:'Μπορώ να κατεβάσω σε PNG;',a:'Ναι — επιλέξτε JPG ή PNG πριν την λήψη.'}],
    links: [{href: '/compress',label:'Συμπίεση εικόνας'},{href: '/resize',label:'Αλλαγή μεγέθους'},{href: '/crop',label:'Περικοπή'},{href: '/watermark',label:'Υδατογράφημα'},{href: '/jpg-to-png',label:'JPG σε PNG'}],
  },
  hi: {
    h2a: 'मुफ्त में मीम कैसे बनाएं — अपलोड की जरूरत नहीं',
    steps: ['अपनी छवि अपलोड करें या टेम्पलेट चुनें — "छवि अपलोड" पर क्लिक करें या 100+ लोकप्रिय टेम्पलेट में से चुनें।','टेक्स्ट जोड़ें — ऊपर और नीचे के टेक्स्ट फ़ील्ड में टाइप करें, या "टेक्स्ट जोड़ें" पर क्लिक करके कहीं भी रखें।','टेक्स्ट स्टाइल करें — फ़ॉन्ट, आकार, रंग, आउटलाइन, बोल्ड, इटैलिक और अलाइनमेंट बदलें।','मीम डाउनलोड करें — JPG या PNG पर क्लिक करके तुरंत सहेजें।'],
    h2b: 'सबसे अच्छा मुफ्त मीम जनरेटर जो फ़ाइलें अपलोड नहीं करता',
    body: 'RelahConvert आपको ब्राउज़र में सीधे मीम बनाने देता है। कोई अपलोड नहीं, कोई खाता नहीं, कोई वॉटरमार्क नहीं। 100+ वायरल टेम्पलेट में से चुनें या अपनी फ़ोटो का उपयोग करें।',
    h3why: 'ऑनलाइन मीम क्यों बनाएं?',
    why: 'मीम किसी मज़ाक को साझा करने या वायरल होने का सबसे तेज़ तरीका है। एक अच्छा जनरेटर टेक्स्ट, फ़ॉन्ट और स्टाइल पर पूरा नियंत्रण देता है।',
    faqs: [{q:'क्या मेरी छवि सर्वर पर अपलोड होगी?',a:'नहीं। सब कुछ ब्राउज़र में चलता है। फ़ाइलें डिवाइस से कभी नहीं जातीं।'},{q:'क्या मैं अपनी खुद की छवि इस्तेमाल कर सकता हूँ?',a:'हाँ — कोई भी JPG, PNG या WebP छवि अपलोड करें।'},{q:'क्या वॉटरमार्क है?',a:'कभी कोई वॉटरमार्क नहीं।'},{q:'क्या मैं कई टेक्स्ट लेयर जोड़ सकता हूँ?',a:'हाँ — "टेक्स्ट जोड़ें" पर क्लिक करके जितने चाहें उतने जोड़ें।'},{q:'कौन से फ़ॉन्ट उपलब्ध हैं?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New और Comic Sans।'},{q:'क्या PNG में डाउनलोड कर सकता हूँ?',a:'हाँ — डाउनलोड से पहले JPG या PNG चुनें।'}],
    links: [{href: '/compress',label:'छवि संपीड़ित करें'},{href: '/resize',label:'आकार बदलें'},{href: '/crop',label:'काटें'},{href: '/watermark',label:'वॉटरमार्क'},{href: '/jpg-to-png',label:'JPG से PNG'}],
  },
  id: {
    h2a: 'Cara membuat meme gratis — tanpa upload',
    steps: ['Upload gambar atau pilih template — klik "Upload Gambar" atau pilih dari 100+ template populer.','Tambahkan teks — ketik di kolom Teks Atas dan Bawah, atau klik "Tambah Teks" untuk menempatkan di mana saja.','Gaya teks Anda — ubah font, ukuran, warna, outline, tebal, miring, dan perataan.','Download meme Anda — klik JPG atau PNG untuk menyimpan secara instan.'],
    h2b: 'Generator meme gratis terbaik yang tidak mengupload file Anda',
    body: 'RelahConvert memungkinkan Anda membuat meme langsung di browser. Tanpa upload, tanpa akun, tanpa watermark. Pilih dari 100+ template viral atau gunakan foto sendiri.',
    h3why: 'Mengapa membuat meme online?',
    why: 'Meme adalah cara tercepat untuk berbagi lelucon atau menjadi viral. Generator yang baik memberikan kontrol penuh atas teks, font, dan gaya.',
    faqs: [{q:'Apakah gambar saya diupload ke server?',a:'Tidak. Semuanya berjalan di browser Anda. File tidak pernah meninggalkan perangkat.'},{q:'Bisakah saya menggunakan gambar sendiri?',a:'Ya — upload gambar JPG, PNG, atau WebP apa pun.'},{q:'Apakah ada watermark?',a:'Tidak ada watermark, selamanya.'},{q:'Bisakah menambah banyak lapisan teks?',a:'Ya — klik "Tambah Teks" untuk menambahkan sebanyak yang Anda mau.'},{q:'Font apa saja yang tersedia?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New, dan Comic Sans.'},{q:'Bisakah download dalam PNG?',a:'Ya — pilih JPG atau PNG sebelum mengunduh.'}],
    links: [{href: '/compress',label:'Kompres Gambar'},{href: '/resize',label:'Ubah Ukuran'},{href: '/crop',label:'Potong'},{href: '/watermark',label:'Watermark'},{href: '/jpg-to-png',label:'JPG ke PNG'}],
  },
  ms: {
    h2a: 'Cara membuat meme percuma — tanpa muat naik',
    steps: ['Muat naik imej atau pilih templat — klik "Muat Naik Imej" atau pilih dari 100+ templat popular.','Tambah teks — taip di medan Teks Atas dan Bawah, atau klik "Tambah Teks" untuk letak di mana-mana.','Gaya teks anda — tukar fon, saiz, warna, kontur, tebal, italik dan penjajaran.','Muat turun meme anda — klik JPG atau PNG untuk simpan serta-merta.'],
    h2b: 'Penjana meme percuma terbaik yang tidak memuat naik fail anda',
    body: 'RelahConvert membolehkan anda membuat meme terus dalam pelayar. Tanpa muat naik, tanpa akaun, tanpa tera air. Pilih dari 100+ templat viral atau guna foto sendiri.',
    h3why: 'Mengapa membuat meme dalam talian?',
    why: 'Meme ialah cara terpantas untuk berkongsi jenaka atau menjadi viral. Penjana yang baik memberi kawalan penuh terhadap teks, fon dan gaya.',
    faqs: [{q:'Adakah imej saya dimuat naik ke pelayan?',a:'Tidak. Semuanya berjalan dalam pelayar anda. Fail tidak pernah meninggalkan peranti.'},{q:'Bolehkah saya guna imej sendiri?',a:'Ya — muat naik sebarang imej JPG, PNG atau WebP.'},{q:'Adakah tera air?',a:'Tiada tera air, selamanya.'},{q:'Boleh tambah banyak lapisan teks?',a:'Ya — klik "Tambah Teks" untuk tambah seberapa banyak yang anda mahu.'},{q:'Fon apa yang ada?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New dan Comic Sans.'},{q:'Boleh muat turun sebagai PNG?',a:'Ya — pilih JPG atau PNG sebelum memuat turun.'}],
    links: [{href: '/compress',label:'Mampat Imej'},{href: '/resize',label:'Ubah Saiz'},{href: '/crop',label:'Pangkas'},{href: '/watermark',label:'Tera Air'},{href: '/jpg-to-png',label:'JPG ke PNG'}],
  },
  pl: {
    h2a: 'Jak stworzyć mema za darmo — bez przesyłania',
    steps: ['Prześlij obraz lub wybierz szablon — kliknij „Prześlij obraz" lub wybierz z ponad 100 popularnych szablonów.','Dodaj tekst — wpisz w pola tekstu górnego i dolnego lub kliknij „Dodaj tekst", aby umieścić go w dowolnym miejscu.','Stylizuj tekst — zmień czcionkę, rozmiar, kolor, obrys, pogrubienie, kursywę i wyrównanie.','Pobierz mema — kliknij JPG lub PNG, aby zapisać natychmiast.'],
    h2b: 'Najlepszy darmowy generator memów bez przesyłania plików',
    body: 'RelahConvert pozwala tworzyć memy bezpośrednio w przeglądarce. Bez przesyłania, bez konta, bez znaku wodnego. Wybierz z ponad 100 viralowych szablonów lub użyj własnego zdjęcia.',
    h3why: 'Dlaczego tworzyć memy online?',
    why: 'Memy to najszybszy sposób na podzielenie się żartem lub stanie się viralem. Dobry generator daje pełną kontrolę nad tekstem, czcionką i stylem.',
    faqs: [{q:'Czy mój obraz zostanie przesłany na serwer?',a:'Nie. Wszystko działa w przeglądarce. Pliki nigdy nie opuszczają urządzenia.'},{q:'Czy mogę użyć własnego obrazu?',a:'Tak — prześlij dowolny obraz JPG, PNG lub WebP.'},{q:'Czy jest znak wodny?',a:'Nigdy żadnego znaku wodnego.'},{q:'Czy mogę dodać wiele warstw tekstu?',a:'Tak — kliknij „Dodaj tekst", aby dodać ile chcesz.'},{q:'Jakie czcionki są dostępne?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New i Comic Sans.'},{q:'Czy mogę pobrać jako PNG?',a:'Tak — wybierz JPG lub PNG przed pobraniem.'}],
    links: [{href: '/compress',label:'Kompresja obrazu'},{href: '/resize',label:'Zmień rozmiar'},{href: '/crop',label:'Przytnij'},{href: '/watermark',label:'Znak wodny'},{href: '/jpg-to-png',label:'JPG do PNG'}],
  },
  sv: {
    h2a: 'Hur man skapar en meme gratis — ingen uppladdning krävs',
    steps: ['Ladda upp din bild eller välj en mall — klicka på "Ladda upp bild" eller välj bland 100+ populära mallar.','Lägg till text — skriv i fälten för övre och nedre text, eller klicka "Lägg till text" för att placera var som helst.','Styla din text — ändra typsnitt, storlek, färg, kontur, fetstil, kursiv och justering.','Ladda ner din meme — klicka JPG eller PNG för att spara direkt.'],
    h2b: 'Bästa gratis memegeneratorn som inte laddar upp dina filer',
    body: 'RelahConvert låter dig skapa memes direkt i webbläsaren. Ingen uppladdning, inget konto, ingen vattenstämpel. Välj bland 100+ virala mallar eller använd ditt eget foto.',
    h3why: 'Varför skapa memes online?',
    why: 'Memes är det snabbaste sättet att dela ett skämt eller bli viral. En bra generator ger full kontroll över text, typsnitt och stil.',
    faqs: [{q:'Laddas min bild upp till en server?',a:'Nej. Allt körs i din webbläsare. Dina filer lämnar aldrig din enhet.'},{q:'Kan jag använda min egen bild?',a:'Ja — ladda upp vilken JPG-, PNG- eller WebP-bild som helst.'},{q:'Finns det en vattenstämpel?',a:'Aldrig någon vattenstämpel.'},{q:'Kan jag lägga till flera textlager?',a:'Ja — klicka "Lägg till text" för att lägga till hur många du vill.'},{q:'Vilka typsnitt finns tillgängliga?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New och Comic Sans.'},{q:'Kan jag ladda ner som PNG?',a:'Ja — välj JPG eller PNG innan du laddar ner.'}],
    links: [{href: '/compress',label:'Komprimera bild'},{href: '/resize',label:'Ändra storlek'},{href: '/crop',label:'Beskär'},{href: '/watermark',label:'Vattenstämpel'},{href: '/jpg-to-png',label:'JPG till PNG'}],
  },
  th: {
    h2a: 'วิธีสร้างมีมฟรี — ไม่ต้องอัปโหลด',
    steps: ['อัปโหลดรูปภาพหรือเลือกเทมเพลต — คลิก "อัปโหลดรูปภาพ" หรือเลือกจาก 100+ เทมเพลตยอดนิยม','เพิ่มข้อความ — พิมพ์ในช่องข้อความบนและล่าง หรือคลิก "เพิ่มข้อความ" เพื่อวางที่ไหนก็ได้','ตกแต่งข้อความ — เปลี่ยนฟอนต์ ขนาด สี เส้นขอบ ตัวหนา ตัวเอียง และการจัดตำแหน่ง','ดาวน์โหลดมีม — คลิก JPG หรือ PNG เพื่อบันทึกทันที'],
    h2b: 'เครื่องมือสร้างมีมฟรีที่ดีที่สุดที่ไม่อัปโหลดไฟล์ของคุณ',
    body: 'RelahConvert ให้คุณสร้างมีมโดยตรงในเบราว์เซอร์ ไม่ต้องอัปโหลด ไม่ต้องมีบัญชี ไม่มีลายน้ำ เลือกจาก 100+ เทมเพลตไวรัลหรือใช้รูปภาพของคุณเอง',
    h3why: 'ทำไมต้องสร้างมีมออนไลน์?',
    why: 'มีมเป็นวิธีที่เร็วที่สุดในการแชร์มุกตลกหรือเป็นไวรัล เครื่องมือสร้างที่ดีให้การควบคุมข้อความ ฟอนต์ และสไตล์อย่างสมบูรณ์',
    faqs: [{q:'รูปภาพจะถูกอัปโหลดไปยังเซิร์ฟเวอร์ไหม?',a:'ไม่ ทุกอย่างทำงานในเบราว์เซอร์ ไฟล์ไม่เคยออกจากอุปกรณ์'},{q:'ใช้รูปภาพของตัวเองได้ไหม?',a:'ได้ — อัปโหลดรูปภาพ JPG, PNG หรือ WebP ใดก็ได้'},{q:'มีลายน้ำไหม?',a:'ไม่มีลายน้ำเลย'},{q:'เพิ่มเลเยอร์ข้อความหลายชั้นได้ไหม?',a:'ได้ — คลิก "เพิ่มข้อความ" เพื่อเพิ่มได้ไม่จำกัด'},{q:'มีฟอนต์อะไรบ้าง?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New และ Comic Sans'},{q:'ดาวน์โหลดเป็น PNG ได้ไหม?',a:'ได้ — เลือก JPG หรือ PNG ก่อนดาวน์โหลด'}],
    links: [{href: '/compress',label:'บีบอัดรูปภาพ'},{href: '/resize',label:'ปรับขนาด'},{href: '/crop',label:'ครอป'},{href: '/watermark',label:'ลายน้ำ'},{href: '/jpg-to-png',label:'JPG เป็น PNG'}],
  },
  tr: {
    h2a: 'Ücretsiz meme nasıl yapılır — yükleme gerekmez',
    steps: ['Görselinizi yükleyin veya şablon seçin — "Görsel Yükle"ye tıklayın veya 100+ popüler şablondan seçin.','Metin ekleyin — üst ve alt metin alanlarına yazın veya "Metin Ekle"ye tıklayarak istediğiniz yere yerleştirin.','Metni stillendirin — yazı tipi, boyut, renk, kontur, kalın, italik ve hizalamayı değiştirin.','Meme\'inizi indirin — anında kaydetmek için JPG veya PNG\'ye tıklayın.'],
    h2b: 'Dosyalarınızı yüklemeyen en iyi ücretsiz meme oluşturucu',
    body: 'RelahConvert doğrudan tarayıcınızda meme oluşturmanızı sağlar. Yükleme yok, hesap yok, filigran yok. 100+ viral şablondan seçin veya kendi fotoğrafınızı kullanın.',
    h3why: 'Neden çevrimiçi meme yapmalısınız?',
    why: 'Memeler bir şakayı paylaşmanın veya viral olmanın en hızlı yoludur. İyi bir oluşturucu metin, yazı tipi ve stil üzerinde tam kontrol sağlar.',
    faqs: [{q:'Görselim bir sunucuya yüklenir mi?',a:'Hayır. Her şey tarayıcınızda çalışır. Dosyalarınız cihazınızdan asla ayrılmaz.'},{q:'Kendi görselimi kullanabilir miyim?',a:'Evet — herhangi bir JPG, PNG veya WebP görseli yükleyin.'},{q:'Filigran var mı?',a:'Asla filigran yok.'},{q:'Birden fazla metin katmanı ekleyebilir miyim?',a:'Evet — istediğiniz kadar eklemek için "Metin Ekle"ye tıklayın.'},{q:'Hangi yazı tipleri mevcut?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New ve Comic Sans.'},{q:'PNG olarak indirebilir miyim?',a:'Evet — indirmeden önce JPG veya PNG seçin.'}],
    links: [{href: '/compress',label:'Görsel Sıkıştır'},{href: '/resize',label:'Boyutlandır'},{href: '/crop',label:'Kırp'},{href: '/watermark',label:'Filigran'},{href: '/jpg-to-png',label:'JPG\'den PNG\'ye'}],
  },
  uk: {
    h2a: 'Як створити мем безкоштовно — без завантаження',
    steps: ['Завантажте зображення або виберіть шаблон — натисніть «Завантажити зображення» або виберіть з 100+ популярних шаблонів.','Додайте текст — введіть у поля верхнього та нижнього тексту, або натисніть «Додати текст» для розміщення будь-де.','Стилізуйте текст — змініть шрифт, розмір, колір, обведення, жирний, курсив та вирівнювання.','Завантажте мем — натисніть JPG або PNG для миттєвого збереження.'],
    h2b: 'Найкращий безкоштовний генератор мемів без завантаження файлів',
    body: 'RelahConvert дозволяє створювати меми прямо в браузері. Без завантаження, без облікового запису, без водяного знаку. Вибирайте з 100+ вірусних шаблонів або використовуйте своє фото.',
    h3why: 'Навіщо створювати меми онлайн?',
    why: 'Меми — найшвидший спосіб поділитися жартом або стати вірусним. Хороший генератор дає повний контроль над текстом, шрифтом і стилем.',
    faqs: [{q:'Моє зображення завантажується на сервер?',a:'Ні. Все працює у вашому браузері. Файли ніколи не залишають ваш пристрій.'},{q:'Чи можу я використати своє зображення?',a:'Так — завантажте будь-яке зображення JPG, PNG або WebP.'},{q:'Чи є водяний знак?',a:'Водяного знаку ніколи немає.'},{q:'Чи можу додати кілька текстових шарів?',a:'Так — натисніть «Додати текст», щоб додати скільки завгодно.'},{q:'Які шрифти доступні?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New і Comic Sans.'},{q:'Чи можу завантажити у PNG?',a:'Так — виберіть JPG або PNG перед завантаженням.'}],
    links: [{href: '/compress',label:'Стиснути зображення'},{href: '/resize',label:'Змінити розмір'},{href: '/crop',label:'Обрізати'},{href: '/watermark',label:'Водяний знак'},{href: '/jpg-to-png',label:'JPG в PNG'}],
  },
  vi: {
    h2a: 'Cách tạo meme miễn phí — không cần tải lên',
    steps: ['Tải ảnh lên hoặc chọn mẫu — nhấp "Tải ảnh lên" hoặc chọn từ 100+ mẫu phổ biến.','Thêm văn bản — nhập vào ô Văn bản trên và dưới, hoặc nhấp "Thêm văn bản" để đặt ở bất kỳ đâu.','Tạo kiểu văn bản — thay đổi phông chữ, kích thước, màu sắc, viền, in đậm, in nghiêng và căn chỉnh.','Tải meme về — nhấp JPG hoặc PNG để lưu ngay lập tức.'],
    h2b: 'Trình tạo meme miễn phí tốt nhất không tải lên tệp của bạn',
    body: 'RelahConvert cho phép bạn tạo meme trực tiếp trong trình duyệt. Không tải lên, không cần tài khoản, không có watermark. Chọn từ 100+ mẫu viral hoặc dùng ảnh của riêng bạn.',
    h3why: 'Tại sao tạo meme trực tuyến?',
    why: 'Meme là cách nhanh nhất để chia sẻ một trò đùa hoặc trở nên viral. Một trình tạo tốt cho bạn toàn quyền kiểm soát văn bản, phông chữ và phong cách.',
    faqs: [{q:'Ảnh của tôi có được tải lên máy chủ không?',a:'Không. Mọi thứ chạy trong trình duyệt. Tệp không bao giờ rời khỏi thiết bị.'},{q:'Tôi có thể dùng ảnh riêng không?',a:'Có — tải lên bất kỳ ảnh JPG, PNG hoặc WebP nào.'},{q:'Có watermark không?',a:'Không bao giờ có watermark.'},{q:'Có thể thêm nhiều lớp văn bản không?',a:'Có — nhấp "Thêm văn bản" để thêm bao nhiêu tùy thích.'},{q:'Có phông chữ nào?',a:'Impact, Arial Black, Arial, Verdana, Times New Roman, Georgia, Courier New và Comic Sans.'},{q:'Có thể tải về dạng PNG không?',a:'Có — chọn JPG hoặc PNG trước khi tải về.'}],
    links: [{href: '/compress',label:'Nén ảnh'},{href: '/resize',label:'Đổi kích thước'},{href: '/crop',label:'Cắt ảnh'},{href: '/watermark',label:'Watermark'},{href: '/jpg-to-png',label:'JPG sang PNG'}],
  },
}



async function loadFilesFromIDB() {
  const db = await openDB()
  const tx = db.transaction('pending', 'readwrite')
  const store = tx.objectStore('pending')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => { store.clear(); resolve(req.result || []) }
    req.onerror = () => reject(new Error('IDB read failed'))
  })
}

async function loadPendingFiles() {
  if (!sessionStorage.getItem('pendingFromIDB')) return
  sessionStorage.removeItem('pendingFromIDB')
  try {
    const records = await loadFilesFromIDB()
    if (!records.length) return
    const rec = records[0]
    if (!rec?.blob) return
    const img = new Image()
    img.onload = () => {
      mainImage = img
      canvas = null
      layers = []
      selectedLayer = null
      showLayout()
      render()
    }
    img.src = URL.createObjectURL(rec.blob)
  } catch(e) {}
}

function buildSeoSection() {
  const lang = getLang()
  const seo = seoMeme[lang] || seoMeme['en']
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = `<h2>${seo.h2a}</h2><ol>${seo.steps.map(s=>`<li>${s}</li>`).join('')}</ol><h2>${seo.h2b}</h2><p>${seo.body}</p><h3>${seo.h3why}</h3><p>${seo.why}</p><h3>${faqTitle}</h3>${seo.faqs.map(f=>`<div class="faq-item"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('')}<h3>${alsoTry}</h3><div class="seo-links">${seo.links.map(l=>`<a class="seo-link" href="${localHref(l.href.slice(1))}">${l.label}</a>`).join('')}</div>`
  document.querySelector('#app').appendChild(div)
}
buildSeoSection()
loadPendingFiles()