import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
injectHreflang('passport-photo')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['passport-photo']) || 'Passport Photo'
const seoData   = t.seo && t.seo['passport-photo']
const descText  = seoData ? seoData.h2a : 'Create passport photos that meet official requirements. Free and private — files never leave your device.'
const selectLbl = t.select_images || 'Select Image'
const dlBtn     = t.download || 'Download'
const parts     = toolName.split(' ')
const h1Main    = parts[0]
const h1Em      = parts.slice(1).join(' ')
const bg = '#F2F2F2'

const ppCountryLbl    = t.pp_country || 'Country'
const ppBgColorLbl    = t.pp_bg_color || 'Background'
const ppRepositionLbl = t.pp_reposition || 'Drag to reposition'
const ppDownloadLbl   = t.pp_download || 'Download Photo'
const ppPrintSheetLbl = t.pp_print_sheet || 'Download Print Sheet (4×6)'
const ppSizeLbl       = t.pp_size || 'Size'
const ppUploadLbl     = t.pp_upload || 'Upload Photo'
const ppExampleLbl    = t.pp_example || 'Example output'
const ppSearchLbl     = t.pp_search || 'Search country...'

const PASSPORT_COUNTRIES = [
  { country: "Afghanistan", flag: "🇦🇫", w: 40, h: 45, bg: "#ffffff" },
  { country: "Albania", flag: "🇦🇱", w: 40, h: 50, bg: "#ffffff" },
  { country: "Algeria", flag: "🇩🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Angola", flag: "🇦🇴", w: 30, h: 40, bg: "#ffffff" },
  { country: "Argentina", flag: "🇦🇷", w: 40, h: 40, bg: "#ffffff" },
  { country: "Armenia", flag: "🇦🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Australia", flag: "🇦🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Austria", flag: "🇦🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Azerbaijan", flag: "🇦🇿", w: 30, h: 40, bg: "#ffffff" },
  { country: "Bahamas", flag: "🇧🇸", w: 51, h: 51, bg: "#ffffff" },
  { country: "Bahrain", flag: "🇧🇭", w: 40, h: 60, bg: "#ffffff" },
  { country: "Bangladesh", flag: "🇧🇩", w: 40, h: 50, bg: "#ffffff" },
  { country: "Barbados", flag: "🇧🇧", w: 50, h: 50, bg: "#ffffff" },
  { country: "Belarus", flag: "🇧🇾", w: 40, h: 50, bg: "#ffffff" },
  { country: "Belgium", flag: "🇧🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Belize", flag: "🇧🇿", w: 51, h: 51, bg: "#ffffff" },
  { country: "Benin", flag: "🇧🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Bhutan", flag: "🇧🇹", w: 45, h: 35, bg: "#ffffff" },
  { country: "Bolivia", flag: "🇧🇴", w: 40, h: 50, bg: "#ffffff" },
  { country: "Bosnia and Herzegovina", flag: "🇧🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Botswana", flag: "🇧🇼", w: 30, h: 40, bg: "#ffffff" },
  { country: "Brazil", flag: "🇧🇷", w: 50, h: 70, bg: "#ffffff" },
  { country: "Brunei", flag: "🇧🇳", w: 52, h: 40, bg: "#ffffff" },
  { country: "Bulgaria", flag: "🇧🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Burkina Faso", flag: "🇧🇫", w: 45, h: 35, bg: "#ffffff" },
  { country: "Cambodia", flag: "🇰🇭", w: 40, h: 60, bg: "#ffffff" },
  { country: "Cameroon", flag: "🇨🇲", w: 40, h: 40, bg: "#ffffff" },
  { country: "Canada", flag: "🇨🇦", w: 50, h: 70, bg: "#ffffff" },
  { country: "Chad", flag: "🇹🇩", w: 50, h: 50, bg: "#ffffff" },
  { country: "Chile", flag: "🇨🇱", w: 45, h: 45, bg: "#ffffff" },
  { country: "China", flag: "🇨🇳", w: 33, h: 48, bg: "#ffffff" },
  { country: "Colombia", flag: "🇨🇴", w: 40, h: 50, bg: "#ffffff" },
  { country: "Congo (Brazzaville)", flag: "🇨🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Congo (DR)", flag: "🇨🇩", w: 35, h: 45, bg: "#ffffff" },
  { country: "Costa Rica", flag: "🇨🇷", w: 51, h: 51, bg: "#ffffff" },
  { country: "Croatia", flag: "🇭🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Cuba", flag: "🇨🇺", w: 45, h: 45, bg: "#ffffff" },
  { country: "Cyprus", flag: "🇨🇾", w: 40, h: 50, bg: "#ffffff" },
  { country: "Czech Republic", flag: "🇨🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Denmark", flag: "🇩🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Djibouti", flag: "🇩🇯", w: 35, h: 35, bg: "#ffffff" },
  { country: "Dominica", flag: "🇩🇲", w: 45, h: 38, bg: "#ffffff" },
  { country: "Dominican Republic", flag: "🇩🇴", w: 51, h: 51, bg: "#ffffff" },
  { country: "Ecuador", flag: "🇪🇨", w: 50, h: 50, bg: "#ffffff" },
  { country: "Egypt", flag: "🇪🇬", w: 40, h: 60, bg: "#ffffff" },
  { country: "El Salvador", flag: "🇸🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Equatorial Guinea", flag: "🇬🇶", w: 35, h: 45, bg: "#ffffff" },
  { country: "Estonia", flag: "🇪🇪", w: 40, h: 50, bg: "#ffffff" },
  { country: "Ethiopia", flag: "🇪🇹", w: 30, h: 40, bg: "#ffffff" },
  { country: "Fiji", flag: "🇫🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Finland", flag: "🇫🇮", w: 36, h: 47, bg: "#ffffff" },
  { country: "France", flag: "🇫🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Gabon", flag: "🇬🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Georgia", flag: "🇬🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Germany", flag: "🇩🇪", w: 35, h: 45, bg: "#d3d3d3" },
  { country: "Ghana", flag: "🇬🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Greece", flag: "🇬🇷", w: 40, h: 60, bg: "#ffffff" },
  { country: "Grenada", flag: "🇬🇩", w: 38, h: 51, bg: "#ffffff" },
  { country: "Guatemala", flag: "🇬🇹", w: 26, h: 32, bg: "#ffffff" },
  { country: "Guinea", flag: "🇬🇳", w: 35, h: 50, bg: "#ffffff" },
  { country: "Guinea-Bissau", flag: "🇬🇼", w: 30, h: 40, bg: "#ffffff" },
  { country: "Guyana", flag: "🇬🇾", w: 45, h: 35, bg: "#ffffff" },
  { country: "Hong Kong", flag: "🇭🇰", w: 40, h: 50, bg: "#ffffff" },
  { country: "Hungary", flag: "🇭🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iceland", flag: "🇮🇸", w: 35, h: 45, bg: "#ffffff" },
  { country: "India", flag: "🇮🇳", w: 51, h: 51, bg: "#ffffff" },
  { country: "Indonesia", flag: "🇮🇩", w: 51, h: 51, bg: "#ff0000" },
  { country: "Iran", flag: "🇮🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iraq", flag: "🇮🇶", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ireland", flag: "🇮🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Israel", flag: "🇮🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Italy", flag: "🇮🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ivory Coast", flag: "🇨🇮", w: 45, h: 35, bg: "#ffffff" },
  { country: "Jamaica", flag: "🇯🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Japan", flag: "🇯🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "Jordan", flag: "🇯🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kazakhstan", flag: "🇰🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kenya", flag: "🇰🇪", w: 51, h: 51, bg: "#ffffff" },
  { country: "Kuwait", flag: "🇰🇼", w: 40, h: 60, bg: "#ffffff" },
  { country: "Kyrgyzstan", flag: "🇰🇬", w: 40, h: 60, bg: "#ffffff" },
  { country: "Laos", flag: "🇱🇦", w: 40, h: 60, bg: "#ffffff" },
  { country: "Latvia", flag: "🇱🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lebanon", flag: "🇱🇧", w: 35, h: 45, bg: "#ffffff" },
  { country: "Liberia", flag: "🇱🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Libya", flag: "🇱🇾", w: 40, h: 60, bg: "#ffffff" },
  { country: "Liechtenstein", flag: "🇱🇮", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lithuania", flag: "🇱🇹", w: 40, h: 60, bg: "#ffffff" },
  { country: "Luxembourg", flag: "🇱🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Macau", flag: "🇲🇴", w: 45, h: 35, bg: "#ffffff" },
  { country: "Madagascar", flag: "🇲🇬", w: 40, h: 40, bg: "#ffffff" },
  { country: "Malawi", flag: "🇲🇼", w: 45, h: 35, bg: "#ffffff" },
  { country: "Malaysia", flag: "🇲🇾", w: 35, h: 50, bg: "#add8e6" },
  { country: "Maldives", flag: "🇲🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mali", flag: "🇲🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Malta", flag: "🇲🇹", w: 40, h: 30, bg: "#ffffff" },
  { country: "Mauritania", flag: "🇲🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mauritius", flag: "🇲🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mexico", flag: "🇲🇽", w: 35, h: 45, bg: "#ffffff" },
  { country: "Moldova", flag: "🇲🇩", w: 30, h: 40, bg: "#ffffff" },
  { country: "Mongolia", flag: "🇲🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Montenegro", flag: "🇲🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Morocco", flag: "🇲🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mozambique", flag: "🇲🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Myanmar", flag: "🇲🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Namibia", flag: "🇳🇦", w: 37, h: 52, bg: "#ffffff" },
  { country: "Nepal", flag: "🇳🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "Netherlands", flag: "🇳🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "New Zealand", flag: "🇳🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nicaragua", flag: "🇳🇮", w: 40, h: 50, bg: "#ffffff" },
  { country: "Niger", flag: "🇳🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nigeria", flag: "🇳🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "North Korea", flag: "🇰🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "North Macedonia", flag: "🇲🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Norway", flag: "🇳🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Oman", flag: "🇴🇲", w: 40, h: 60, bg: "#ffffff" },
  { country: "Pakistan", flag: "🇵🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Palestine", flag: "🇵🇸", w: 35, h: 45, bg: "#add8e6" },
  { country: "Panama", flag: "🇵🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Papua New Guinea", flag: "🇵🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Paraguay", flag: "🇵🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Peru", flag: "🇵🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Philippines", flag: "🇵🇭", w: 45, h: 35, bg: "#ffffff" },
  { country: "Poland", flag: "🇵🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Portugal", flag: "🇵🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Qatar", flag: "🇶🇦", w: 38, h: 48, bg: "#ffffff" },
  { country: "Romania", flag: "🇷🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Russia", flag: "🇷🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Rwanda", flag: "🇷🇼", w: 51, h: 51, bg: "#ffffff" },
  { country: "Saint Kitts and Nevis", flag: "🇰🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Samoa", flag: "🇼🇸", w: 45, h: 35, bg: "#ffffff" },
  { country: "Saudi Arabia", flag: "🇸🇦", w: 40, h: 60, bg: "#ffffff" },
  { country: "Senegal", flag: "🇸🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Serbia", flag: "🇷🇸", w: 50, h: 50, bg: "#ffffff" },
  { country: "Seychelles", flag: "🇸🇨", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sierra Leone", flag: "🇸🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Singapore", flag: "🇸🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovakia", flag: "🇸🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovenia", flag: "🇸🇮", w: 35, h: 45, bg: "#ffffff" },
  { country: "Somalia", flag: "🇸🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Africa", flag: "🇿🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Korea", flag: "🇰🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Sudan", flag: "🇸🇸", w: 35, h: 45, bg: "#ffffff" },
  { country: "Spain", flag: "🇪🇸", w: 26, h: 32, bg: "#ffffff" },
  { country: "Sri Lanka", flag: "🇱🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sudan", flag: "🇸🇩", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sweden", flag: "🇸🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Switzerland", flag: "🇨🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Syria", flag: "🇸🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Taiwan", flag: "🇹🇼", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tajikistan", flag: "🇹🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tanzania", flag: "🇹🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Thailand", flag: "🇹🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tunisia", flag: "🇹🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Turkey", flag: "🇹🇷", w: 50, h: 60, bg: "#ffffff" },
  { country: "Turkmenistan", flag: "🇹🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uganda", flag: "🇺🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ukraine", flag: "🇺🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "United Arab Emirates", flag: "🇦🇪", w: 40, h: 60, bg: "#ffffff" },
  { country: "United Kingdom", flag: "🇬🇧", w: 35, h: 45, bg: "#d3d3d3" },
  { country: "United States", flag: "🇺🇸", w: 51, h: 51, bg: "#ffffff" },
  { country: "Uruguay", flag: "🇺🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uzbekistan", flag: "🇺🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Venezuela", flag: "🇻🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Vietnam", flag: "🇻🇳", w: 40, h: 60, bg: "#ffffff" },
  { country: "Yemen", flag: "🇾🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zambia", flag: "🇿🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zimbabwe", flag: "🇿🇼", w: 35, h: 45, bg: "#ffffff" },
]

// DPI for print-quality output
const DPI = 300
const MM_PER_INCH = 25.4

let selectedCountry = PASSPORT_COUNTRIES.find(c => c.country === 'United States')
let uploadedImg = null
let panOffsetX = 0, panOffsetY = 0
let isDragging = false, dragStartX = 0, dragStartY = 0, dragStartPanX = 0, dragStartPanY = 0

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:' + bg + ';'
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .pp-wrap{max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
  .pp-h1{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:900;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em}
  .pp-h1 em{font-style:italic;color:#C84B31}
  .pp-desc{font-size:13px;color:#7A6A5A;margin:0 0 20px}
  .pp-grid{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start}
  @media(max-width:700px){.pp-grid{grid-template-columns:1fr}}
  .pp-canvas-area{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;overflow:hidden;position:relative}
  .pp-canvas-inner{position:relative;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:grab;touch-action:none}
  .pp-canvas-inner:active{cursor:grabbing}
  .pp-canvas-inner canvas{display:block;width:100%;height:auto}
  .pp-panel{display:flex;flex-direction:column;gap:14px}
  .pp-card{background:#fff;border-radius:12px;border:1.5px solid #E8E0D5;padding:16px}
  .pp-card-title{font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#2C1810;margin:0 0 10px}
  .pp-upload-btn{display:inline-flex;align-items:center;gap:8px;background:#C84B31;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;padding:10px 20px;border-radius:8px;cursor:pointer;transition:background 0.15s;border:none;width:100%;justify-content:center}
  .pp-upload-btn:hover{background:#A63D26}
  .pp-country-trigger{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px solid #DDD5C8;border-radius:8px;background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;color:#2C1810;cursor:pointer;width:100%;text-align:left;transition:border-color 0.15s}
  .pp-country-trigger:hover{border-color:#C84B31}
  .pp-country-trigger .flag{font-size:18px}
  .pp-country-trigger .arrow{margin-left:auto;font-size:10px;color:#9A8A7A}
  .pp-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;margin-top:4px;display:none;flex-direction:column;max-height:300px}
  .pp-dropdown.open{display:flex}
  .pp-dropdown-search{padding:8px 12px;border:none;border-bottom:1px solid #E8E0D5;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;color:#2C1810}
  .pp-dropdown-search::placeholder{color:#C4B8A8}
  .pp-dropdown-list{overflow-y:auto;flex:1}
  .pp-dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;color:#2C1810;transition:background 0.1s}
  .pp-dropdown-item:hover,.pp-dropdown-item.active{background:#FDE8E3}
  .pp-dropdown-item .flag{font-size:16px}
  .pp-dropdown-item .size{margin-left:auto;font-size:11px;color:#9A8A7A}
  .pp-size-info{font-size:12px;color:#7A6A5A;margin-top:6px}
  .pp-color-row{display:flex;align-items:center;gap:8px;margin-top:8px}
  .pp-color-input{width:36px;height:36px;border:1.5px solid #DDD5C8;border-radius:8px;cursor:pointer;padding:2px;background:#fff}
  .pp-color-label{font-size:12px;color:#5A4A3A}
  .pp-drag-hint{font-size:11px;color:#9A8A7A;text-align:center;padding:6px 0}
  .pp-dl-btn{display:block;width:100%;padding:12px;border:none;border-radius:10px;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;text-align:center;text-decoration:none}
  .pp-dl-primary{background:#C84B31;color:#fff}
  .pp-dl-primary:hover{background:#A63D26}
  .pp-dl-secondary{background:#2C1810;color:#fff;margin-top:8px}
  .pp-dl-secondary:hover{background:#1a0f0a}
  .pp-example{text-align:center;padding:20px}
  .pp-example-label{font-size:11px;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;font-weight:600}
  .pp-example svg{max-width:180px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
  .pp-next{margin-top:20px}
  .pp-next-label{font-size:11px;font-weight:600;color:#9A8A7A;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px}
  .pp-next-btns{display:flex;gap:10px;flex-wrap:wrap}
  .pp-next-btn{padding:7px 14px;border-radius:8px;border:1.5px solid #DDD5C8;font-size:13px;font-weight:600;color:#2C1810;background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .pp-next-btn:hover{border-color:#C84B31;color:#C84B31}
  .seo-section{max-width:700px;margin:0 auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
  .seo-section h2{font-family:'Fraunces',serif;font-size:17px;font-weight:700;color:#2C1810;margin:32px 0 10px}
  .seo-section h3{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:#2C1810;margin:24px 0 8px}
  .seo-section ol{padding-left:20px;margin:0 0 12px}
  .seo-section ol li{font-size:13px;color:#5A4A3A;line-height:1.6;margin-bottom:6px}
  .seo-section p{font-size:13px;color:#5A4A3A;line-height:1.6;margin:0 0 12px}
  .seo-faq{border-top:1px solid #E8E0D5;padding:10px 0}
  .seo-faq:last-child{border-bottom:1px solid #E8E0D5}
  .seo-faq-q{font-size:13px;font-weight:700;color:#2C1810;margin:0 0 4px}
  .seo-faq-a{font-size:13px;color:#5A4A3A;margin:0;line-height:1.6}
  .seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
  .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .seo-link:hover{border-color:#C84B31;color:#C84B31}
`
document.head.appendChild(style)
document.title = toolName + ' Free & Private | RelahConvert'

// SVG example illustration
const exampleSVG = `<svg viewBox="0 0 180 230" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="230" fill="#ffffff" rx="4"/>
  <ellipse cx="90" cy="210" rx="55" ry="30" fill="#4a6fa5"/>
  <circle cx="90" cy="95" r="42" fill="#d4a574"/>
  <ellipse cx="90" cy="55" rx="38" ry="30" fill="#2c2c2c"/>
  <path d="M52 80 Q55 55 90 50 Q125 55 128 80" fill="#2c2c2c"/>
  <circle cx="76" cy="92" r="3.5" fill="#2c2c2c"/>
  <circle cx="104" cy="92" r="3.5" fill="#2c2c2c"/>
  <ellipse cx="90" cy="105" rx="4" ry="2.5" fill="#c4916e"/>
  <path d="M80 115 Q90 122 100 115" stroke="#b5846a" stroke-width="1.5" fill="none"/>
  <rect x="60" y="160" width="60" height="70" rx="2" fill="#4a6fa5"/>
  <path d="M60 160 L75 145 Q90 138 105 145 L120 160Z" fill="#4a6fa5"/>
  <line x1="90" y1="160" x2="90" y2="195" stroke="#3d5d8a" stroke-width="0.5"/>
</svg>`

document.querySelector('#app').innerHTML = `
  <div class="pp-wrap">
    <h1 class="pp-h1">${h1Main} <em>${h1Em}</em></h1>
    <p class="pp-desc">${descText}</p>
    <div class="pp-grid">
      <div>
        <div class="pp-canvas-area">
          <div class="pp-canvas-inner" id="canvasWrap">
            <canvas id="ppCanvas" width="510" height="510"></canvas>
          </div>
          <div class="pp-drag-hint" id="dragHint" style="display:none">${ppRepositionLbl}</div>
        </div>
        <div id="exampleArea" class="pp-example">
          <div class="pp-example-label">${ppExampleLbl}</div>
          ${exampleSVG}
        </div>
      </div>
      <div class="pp-panel">
        <div class="pp-card">
          <div class="pp-card-title">${ppUploadLbl}</div>
          <button class="pp-upload-btn" id="uploadBtn"><span style="font-size:18px">+</span> ${selectLbl}</button>
          <input type="file" id="fileInput" accept="image/*" style="display:none" />
        </div>
        <div class="pp-card">
          <div class="pp-card-title">${ppCountryLbl}</div>
          <div style="position:relative" id="countryWrap">
            <button class="pp-country-trigger" id="countryTrigger">
              <span class="flag">${selectedCountry.flag}</span>
              <span id="countryName">${selectedCountry.country}</span>
              <span class="arrow">&#9660;</span>
            </button>
            <div class="pp-dropdown" id="countryDropdown">
              <input class="pp-dropdown-search" id="countrySearch" type="text" placeholder="${ppSearchLbl}" />
              <div class="pp-dropdown-list" id="countryList"></div>
            </div>
          </div>
          <div class="pp-size-info" id="sizeInfo">${ppSizeLbl}: ${selectedCountry.w}×${selectedCountry.h} mm</div>
          <div class="pp-color-row">
            <input type="color" class="pp-color-input" id="bgColor" value="${selectedCountry.bg}" />
            <span class="pp-color-label">${ppBgColorLbl}</span>
          </div>
        </div>
        <div class="pp-card" id="downloadCard" style="display:none">
          <button class="pp-dl-btn pp-dl-primary" id="dlPhoto">${ppDownloadLbl}</button>
          <button class="pp-dl-btn pp-dl-secondary" id="dlSheet">${ppPrintSheetLbl}</button>
        </div>
        <div id="nextSteps" style="display:none" class="pp-next">
          <div class="pp-next-label">${t.whats_next || "What's Next?"}</div>
          <div class="pp-next-btns" id="nextBtns"></div>
        </div>
      </div>
    </div>
  </div>
`

injectHeader()

// Elements
const fileInput     = document.getElementById('fileInput')
const uploadBtn     = document.getElementById('uploadBtn')
const canvasWrap    = document.getElementById('canvasWrap')
const ppCanvas      = document.getElementById('ppCanvas')
const ctx           = ppCanvas.getContext('2d')
const countryTrigger = document.getElementById('countryTrigger')
const countryDropdown = document.getElementById('countryDropdown')
const countrySearch = document.getElementById('countrySearch')
const countryList   = document.getElementById('countryList')
const countryNameEl = document.getElementById('countryName')
const sizeInfo      = document.getElementById('sizeInfo')
const bgColorInput  = document.getElementById('bgColor')
const downloadCard  = document.getElementById('downloadCard')
const dlPhoto       = document.getElementById('dlPhoto')
const dlSheet       = document.getElementById('dlSheet')
const dragHint      = document.getElementById('dragHint')
const exampleArea   = document.getElementById('exampleArea')
const nextSteps     = document.getElementById('nextSteps')
const nextBtns      = document.getElementById('nextBtns')

// Upload
uploadBtn.addEventListener('click', () => fileInput.click())
fileInput.addEventListener('change', () => {
  if (!fileInput.files.length) return
  const file = fileInput.files[0]
  if (!file.type.startsWith('image/')) return
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    uploadedImg = img
    panOffsetX = 0
    panOffsetY = 0
    exampleArea.style.display = 'none'
    dragHint.style.display = ''
    downloadCard.style.display = ''
    renderCanvas()
    buildNextSteps()
  }
  img.src = url
  fileInput.value = ''
})

// Country dropdown
function renderCountryList(filter) {
  const q = (filter || '').toLowerCase()
  const filtered = PASSPORT_COUNTRIES.filter(c => c.country.toLowerCase().indexOf(q) !== -1)
  countryList.innerHTML = filtered.map(c =>
    '<div class="pp-dropdown-item' + (c.country === selectedCountry.country ? ' active' : '') + '" data-country="' + c.country + '">' +
    '<span class="flag">' + c.flag + '</span>' +
    '<span>' + c.country + '</span>' +
    '<span class="size">' + c.w + '×' + c.h + 'mm</span></div>'
  ).join('')
  countryList.querySelectorAll('.pp-dropdown-item').forEach(el => {
    el.addEventListener('click', () => {
      const c = PASSPORT_COUNTRIES.find(x => x.country === el.dataset.country)
      if (!c) return
      selectedCountry = c
      countryNameEl.textContent = c.country
      countryTrigger.querySelector('.flag').textContent = c.flag
      sizeInfo.textContent = ppSizeLbl + ': ' + c.w + '×' + c.h + ' mm'
      bgColorInput.value = c.bg
      countryDropdown.classList.remove('open')
      panOffsetX = 0
      panOffsetY = 0
      renderCanvas()
    })
  })
}

countryTrigger.addEventListener('click', (e) => {
  e.stopPropagation()
  countryDropdown.classList.toggle('open')
  if (countryDropdown.classList.contains('open')) {
    countrySearch.value = ''
    renderCountryList('')
    setTimeout(() => countrySearch.focus(), 50)
  }
})
countrySearch.addEventListener('input', () => renderCountryList(countrySearch.value))
document.addEventListener('click', (e) => {
  if (!document.getElementById('countryWrap').contains(e.target)) {
    countryDropdown.classList.remove('open')
  }
})

bgColorInput.addEventListener('input', () => renderCanvas())

// Canvas rendering
function renderCanvas() {
  const c = selectedCountry
  // Use mm-based aspect ratio for canvas display
  const aspect = c.w / c.h
  const dispW = 400
  const dispH = Math.round(dispW / aspect)
  ppCanvas.width = dispW
  ppCanvas.height = dispH
  canvasWrap.style.maxWidth = dispW + 'px'

  // Background
  ctx.fillStyle = bgColorInput.value
  ctx.fillRect(0, 0, dispW, dispH)

  if (!uploadedImg) return

  // Scale image to fill canvas, allow panning
  const img = uploadedImg
  const imgAspect = img.naturalWidth / img.naturalHeight
  let drawW, drawH
  if (imgAspect > aspect) {
    // Image is wider — fit height, crop sides
    drawH = dispH
    drawW = dispH * imgAspect
  } else {
    // Image is taller — fit width, crop top/bottom
    drawW = dispW
    drawH = dispW / imgAspect
  }

  // Clamp pan offset
  const maxPanX = Math.max(0, (drawW - dispW) / 2)
  const maxPanY = Math.max(0, (drawH - dispH) / 2)
  panOffsetX = Math.max(-maxPanX, Math.min(maxPanX, panOffsetX))
  panOffsetY = Math.max(-maxPanY, Math.min(maxPanY, panOffsetY))

  const x = (dispW - drawW) / 2 + panOffsetX
  const y = (dispH - drawH) / 2 + panOffsetY
  ctx.drawImage(img, x, y, drawW, drawH)
}

// Drag to reposition
canvasWrap.addEventListener('mousedown', startDrag)
canvasWrap.addEventListener('touchstart', startDragTouch, { passive: false })

function startDrag(e) {
  if (!uploadedImg) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartPanX = panOffsetX
  dragStartPanY = panOffsetY
  e.preventDefault()
}
function startDragTouch(e) {
  if (!uploadedImg) return
  isDragging = true
  dragStartX = e.touches[0].clientX
  dragStartY = e.touches[0].clientY
  dragStartPanX = panOffsetX
  dragStartPanY = panOffsetY
  e.preventDefault()
}

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return
  panOffsetX = dragStartPanX + (e.clientX - dragStartX)
  panOffsetY = dragStartPanY + (e.clientY - dragStartY)
  renderCanvas()
})
document.addEventListener('touchmove', (e) => {
  if (!isDragging) return
  panOffsetX = dragStartPanX + (e.touches[0].clientX - dragStartX)
  panOffsetY = dragStartPanY + (e.touches[0].clientY - dragStartY)
  renderCanvas()
}, { passive: true })
document.addEventListener('mouseup', () => { isDragging = false })
document.addEventListener('touchend', () => { isDragging = false })

// Generate high-res single photo
function generatePhoto() {
  const c = selectedCountry
  const wPx = Math.round(c.w / MM_PER_INCH * DPI)
  const hPx = Math.round(c.h / MM_PER_INCH * DPI)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = wPx
  outCanvas.height = hPx
  const octx = outCanvas.getContext('2d')

  octx.fillStyle = bgColorInput.value
  octx.fillRect(0, 0, wPx, hPx)

  if (uploadedImg) {
    const img = uploadedImg
    const aspect = c.w / c.h
    const imgAspect = img.naturalWidth / img.naturalHeight
    let drawW, drawH
    if (imgAspect > aspect) {
      drawH = hPx
      drawW = hPx * imgAspect
    } else {
      drawW = wPx
      drawH = wPx / imgAspect
    }
    // Scale pan offset from display to output resolution
    const scaleRatio = wPx / ppCanvas.width
    const ox = panOffsetX * scaleRatio
    const oy = panOffsetY * scaleRatio
    const x = (wPx - drawW) / 2 + ox
    const y = (hPx - drawH) / 2 + oy
    octx.drawImage(img, x, y, drawW, drawH)
  }
  return outCanvas
}

// Download single photo
dlPhoto.addEventListener('click', () => {
  const photoCanvas = generatePhoto()
  photoCanvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passport-photo-' + selectedCountry.country.toLowerCase().replace(/\s+/g, '-') + '.jpg'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, 'image/jpeg', 0.95)
})

// Download 4×6 print sheet
dlSheet.addEventListener('click', () => {
  const photoCanvas = generatePhoto()
  const photoW = photoCanvas.width
  const photoH = photoCanvas.height
  // 4×6 inches at 300 DPI
  const sheetW = 6 * DPI  // 1800
  const sheetH = 4 * DPI  // 1200
  const sheetCanvas = document.createElement('canvas')
  sheetCanvas.width = sheetW
  sheetCanvas.height = sheetH
  const sctx = sheetCanvas.getContext('2d')
  sctx.fillStyle = '#ffffff'
  sctx.fillRect(0, 0, sheetW, sheetH)

  // Tile photos with 20px gap
  const gap = 20
  const cols = Math.floor((sheetW + gap) / (photoW + gap))
  const rows = Math.floor((sheetH + gap) / (photoH + gap))
  const startX = Math.round((sheetW - (cols * photoW + (cols - 1) * gap)) / 2)
  const startY = Math.round((sheetH - (rows * photoH + (rows - 1) * gap)) / 2)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      sctx.drawImage(photoCanvas, startX + c * (photoW + gap), startY + r * (photoH + gap))
    }
  }

  sheetCanvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passport-photo-sheet-4x6.jpg'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, 'image/jpeg', 0.95)
})

// Next steps
function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.crop || 'Crop', href: localHref('crop') },
    { label: ns.resize || 'Resize', href: localHref('resize') },
    { label: ns.compress || 'Compress', href: localHref('compress') },
    { label: ns['jpg-to-pdf'] || 'JPG to PDF', href: localHref('jpg-to-pdf') },
  ]
  nextBtns.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'pp-next-btn'
    btn.textContent = b.label
    btn.addEventListener('click', () => { window.location.href = b.href })
    nextBtns.appendChild(btn)
  })
  nextSteps.style.display = ''
}

// Initial render
renderCountryList('')
renderCanvas()

// SEO section
;(function injectSEO() {
  const seo = t.seo && t.seo['passport-photo']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = '<h2>' + seo.h2a + '</h2><ol>' + seo.steps.map(function(s){return '<li>' + s + '</li>'}).join('') + '</ol><h2>' + seo.h2b + '</h2>' + seo.body + '<h3>' + seo.h3why + '</h3><p>' + seo.why + '</p><h3>' + faqTitle + '</h3>' + seo.faqs.map(function(f){return '<div class="seo-faq"><p class="seo-faq-q">' + f.q + '</p><p class="seo-faq-a">' + f.a + '</p></div>'}).join('') + '<h3>' + alsoTry + '</h3><div class="seo-links">' + seo.links.map(function(l){return '<a class="seo-link" href="' + localHref(l.href.slice(1)) + '">' + l.label + '</a>'}).join('') + '</div>'
  document.querySelector('#app').appendChild(div)
})()
