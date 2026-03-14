import { injectHeader } from '../core/header.js'
import { getT } from '../core/i18n.js'

const t = getT()
const API_KEY = 'cecb9e03ead844aeb7f6e24e6a6f6824'
const toolName = (t.nav_short && t.nav_short['website-screenshot']) || 'Website Screenshot'
const _tp = toolName.split(' ')
const titlePart1 = _tp[0]
const titlePart2 = _tp.slice(1).join(' ')

document.title = `${toolName} Free | RelahConvert`
document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:#F2F2F2;'

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin   { to { transform:rotate(360deg) } }
  #app > div { animation: fadeUp 0.4s ease both }
  .url-input {
    width: 100%; box-sizing: border-box; padding: 12px 16px;
    border: 1.5px solid #DDD5C8; border-radius: 10px;
    font-size: 15px; font-family: 'DM Sans', sans-serif;
    color: #2C1810; background: #fff; outline: none; transition: border-color 0.15s;
  }
  .url-input:focus { border-color: #C84B31; }
  .opt-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .opt-group { flex: 1; min-width: 140px; }
  .opt-label {
    font-size: 11px; font-weight: 600; color: #9A8A7A;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 6px; font-family: 'DM Sans', sans-serif; display: block;
  }
  .opt-select {
    width: 100%; padding: 10px 12px; border: 1.5px solid #DDD5C8;
    border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #2C1810; background: #fff; outline: none; cursor: pointer;
    transition: border-color 0.15s;
  }
  .opt-select:focus { border-color: #C84B31; }
  .capture-btn {
    width: 100%; padding: 13px; border: none; border-radius: 10px;
    background: #C84B31; color: #fff; font-size: 15px;
    font-family: 'Fraunces', serif; font-weight: 700;
    cursor: pointer; transition: all 0.18s; margin-bottom: 16px; display: block;
  }
  .capture-btn:hover  { background: #A63D26; transform: translateY(-1px); }
  .capture-btn:disabled { background: #C4B8A8; cursor: not-allowed; opacity: 0.7; transform: none; }
  .loading-overlay {
    text-align: center; padding: 40px 0; display: none;
    font-family: 'DM Sans', sans-serif; color: #7A6A5A; margin-bottom: 16px;
  }
  .spinner {
    display: block; width: 32px; height: 32px; margin: 0 auto 12px;
    border: 3px solid #E8E0D5; border-top-color: #C84B31;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  .preview-box {
    background: #fff; border-radius: 12px; border: 1.5px solid #E8E0D5;
    overflow: hidden; margin-bottom: 16px; display: none;
  }
  .preview-box img { width: 100%; display: block; }
  .download-btn {
    display: none; width: 100%; box-sizing: border-box; text-align: center;
    padding: 13px; border-radius: 10px; background: #2C1810;
    text-decoration: none; color: #F5F0E8; font-family: 'Fraunces', serif;
    font-weight: 700; font-size: 15px; margin-bottom: 10px;
  }
  .download-btn:hover { background: #1a0f09; }
  .error-msg {
    color: #C84B31; font-size: 13px; font-family: 'DM Sans', sans-serif;
    margin-bottom: 12px; padding: 10px 14px; background: #FDE8E3;
    border-radius: 8px; display: none;
  }
`
document.head.appendChild(style)

document.querySelector('#app').innerHTML = `
  <div style="max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;">
    <div style="margin-bottom:24px;">
      <h1 style="font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em;">${titlePart1} <em style="font-style:italic;color:#C84B31;">${titlePart2}</em></h1>
      <p style="font-size:13px;color:#7A6A5A;margin:0;">Capture any website as an image. Enter a URL and download the screenshot.</p>
    </div>
    <div style="margin-bottom:16px;">
      <label class="opt-label" for="urlInput">Website URL</label>
      <input class="url-input" id="urlInput" type="url" placeholder="https://example.com" />
    </div>
    <div class="opt-row">
      <div class="opt-group">
        <label class="opt-label" for="screenSize">Screen Size</label>
        <select class="opt-select" id="screenSize">
          <option value="375">Mobile (375px)</option>
          <option value="768">Tablet (768px)</option>
          <option value="1366" selected>Desktop (1366px)</option>
          <option value="1920">Full HD (1920px)</option>
        </select>
      </div>
      <div class="opt-group">
        <label class="opt-label" for="formatSelect">Format</label>
        <select class="opt-select" id="formatSelect">
          <option value="jpeg">JPG</option>
          <option value="png">PNG</option>
        </select>
      </div>
    </div>
    <div class="error-msg" id="errorMsg"></div>
    <button class="capture-btn" id="captureBtn">📸 Capture Screenshot</button>
    <div class="loading-overlay" id="loadingOverlay">
      <span class="spinner"></span>
      <div>Capturing screenshot…</div>
    </div>
    <div class="preview-box" id="previewBox">
      <img id="previewImg" src="" alt="Screenshot preview" />
    </div>
    <a class="download-btn" id="downloadBtn" href="#" download="screenshot.jpg">⬇ Download Screenshot</a>
  </div>
`

injectHeader()

const urlInput    = document.getElementById('urlInput')
const screenSize  = document.getElementById('screenSize')
const formatSel   = document.getElementById('formatSelect')
const captureBtn  = document.getElementById('captureBtn')
const loadingEl   = document.getElementById('loadingOverlay')
const previewBox  = document.getElementById('previewBox')
const previewImg  = document.getElementById('previewImg')
const downloadBtn = document.getElementById('downloadBtn')
const errorMsg    = document.getElementById('errorMsg')

function showError(msg) {
  errorMsg.textContent = msg
  errorMsg.style.display = msg ? 'block' : 'none'
}

captureBtn.addEventListener('click', async () => {
  let url = urlInput.value.trim()
  if (!url) { showError('Please enter a website URL.'); return }
  if (!url.startsWith('http')) url = 'https://' + url

  const width  = screenSize.value
  const fmt    = formatSel.value
  const ext    = fmt === 'jpeg' ? 'jpg' : 'png'

  showError('')
  captureBtn.disabled = true
  loadingEl.style.display = 'block'
  previewBox.style.display = 'none'
  downloadBtn.style.display = 'none'

  const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${API_KEY}&url=${encodeURIComponent(url)}&format=${fmt}&width=${width}&response_type=image&fresh=true`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error()
    const blob   = await res.blob()
    const objUrl = URL.createObjectURL(blob)

    previewImg.src       = objUrl
    previewBox.style.display = 'block'
    downloadBtn.href     = objUrl
    downloadBtn.download = `screenshot.${ext}`
    downloadBtn.style.display = 'block'
  } catch {
    showError('Could not capture screenshot. Please check the URL and try again.')
  } finally {
    captureBtn.disabled   = false
    loadingEl.style.display = 'none'
  }
})
