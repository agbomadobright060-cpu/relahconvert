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
const ppDocTypeLbl    = t.pp_doc_type || 'Document Type'
const ppPassportLbl   = t.pp_passport || 'Passport'
const ppVisaLbl       = t.pp_visa || 'Visa'
const ppIdCardLbl     = t.pp_id_card || 'ID Card'

// Common document type sizes (mm) that apply across countries
const DOC_TYPES = {
  passport: { label: ppPassportLbl },
  visa:     { label: ppVisaLbl, sizes: [
    { name: 'US Visa (2×2 in)', w: 51, h: 51 },
    { name: 'Schengen Visa (35×45mm)', w: 35, h: 45 },
    { name: 'China Visa (33×48mm)', w: 33, h: 48 },
    { name: 'India Visa (51×51mm)', w: 51, h: 51 },
  ]},
  id_card:  { label: ppIdCardLbl, sizes: [
    { name: 'Standard ID (35×45mm)', w: 35, h: 45 },
    { name: 'US Green Card (51×51mm)', w: 51, h: 51 },
    { name: 'EU ID Card (35×45mm)', w: 35, h: 45 },
  ]},
}

const PASSPORT_COUNTRIES = [
  { country: "Afghanistan", code: "AF", flag: "🇦🇫", w: 40, h: 45, bg: "#ffffff" },
  { country: "Albania", code: "AL", flag: "🇦🇱", w: 40, h: 50, bg: "#ffffff" },
  { country: "Algeria", code: "DZ", flag: "🇩🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Angola", code: "AO", flag: "🇦🇴", w: 30, h: 40, bg: "#ffffff" },
  { country: "Argentina", code: "AR", flag: "🇦🇷", w: 40, h: 40, bg: "#ffffff" },
  { country: "Armenia", code: "AM", flag: "🇦🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Australia", code: "AU", flag: "🇦🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Austria", code: "AT", flag: "🇦🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Azerbaijan", code: "AZ", flag: "🇦🇿", w: 30, h: 40, bg: "#ffffff" },
  { country: "Bahamas", code: "BS", flag: "🇧🇸", w: 51, h: 51, bg: "#ffffff" },
  { country: "Bahrain", code: "BH", flag: "🇧🇭", w: 40, h: 60, bg: "#ffffff" },
  { country: "Bangladesh", code: "BD", flag: "🇧🇩", w: 45, h: 55, bg: "#ffffff" },
  { country: "Barbados", code: "BB", flag: "🇧🇧", w: 50, h: 50, bg: "#ffffff" },
  { country: "Belarus", code: "BY", flag: "🇧🇾", w: 40, h: 50, bg: "#ffffff" },
  { country: "Belgium", code: "BE", flag: "🇧🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Belize", code: "BZ", flag: "🇧🇿", w: 51, h: 51, bg: "#ffffff" },
  { country: "Benin", code: "BJ", flag: "🇧🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Bhutan", code: "BT", flag: "🇧🇹", w: 45, h: 35, bg: "#ffffff" },
  { country: "Bolivia", code: "BO", flag: "🇧🇴", w: 40, h: 50, bg: "#ffffff" },
  { country: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Botswana", code: "BW", flag: "🇧🇼", w: 30, h: 40, bg: "#ffffff" },
  { country: "Brazil", code: "BR", flag: "🇧🇷", w: 50, h: 70, bg: "#ffffff" },
  { country: "Brunei", code: "BN", flag: "🇧🇳", w: 52, h: 40, bg: "#ffffff" },
  { country: "Bulgaria", code: "BG", flag: "🇧🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Burkina Faso", code: "BF", flag: "🇧🇫", w: 45, h: 35, bg: "#ffffff" },
  { country: "Cambodia", code: "KH", flag: "🇰🇭", w: 40, h: 60, bg: "#ffffff" },
  { country: "Cameroon", code: "CM", flag: "🇨🇲", w: 40, h: 40, bg: "#ffffff" },
  { country: "Canada", code: "CA", flag: "🇨🇦", w: 50, h: 70, bg: "#ffffff" },
  { country: "Chad", code: "TD", flag: "🇹🇩", w: 50, h: 50, bg: "#ffffff" },
  { country: "Chile", code: "CL", flag: "🇨🇱", w: 45, h: 45, bg: "#ffffff" },
  { country: "China", code: "CN", flag: "🇨🇳", w: 33, h: 48, bg: "#ffffff" },
  { country: "Colombia", code: "CO", flag: "🇨🇴", w: 40, h: 50, bg: "#ffffff" },
  { country: "Congo (Brazzaville)", code: "CG", flag: "🇨🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Congo (DR)", code: "CD", flag: "🇨🇩", w: 35, h: 45, bg: "#ffffff" },
  { country: "Costa Rica", code: "CR", flag: "🇨🇷", w: 51, h: 51, bg: "#ffffff" },
  { country: "Croatia", code: "HR", flag: "🇭🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Cuba", code: "CU", flag: "🇨🇺", w: 45, h: 45, bg: "#ffffff" },
  { country: "Cyprus", code: "CY", flag: "🇨🇾", w: 40, h: 50, bg: "#ffffff" },
  { country: "Czech Republic", code: "CZ", flag: "🇨🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Denmark", code: "DK", flag: "🇩🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Djibouti", code: "DJ", flag: "🇩🇯", w: 35, h: 35, bg: "#ffffff" },
  { country: "Dominica", code: "DM", flag: "🇩🇲", w: 45, h: 38, bg: "#ffffff" },
  { country: "Dominican Republic", code: "DO", flag: "🇩🇴", w: 51, h: 51, bg: "#ffffff" },
  { country: "Ecuador", code: "EC", flag: "🇪🇨", w: 50, h: 50, bg: "#ffffff" },
  { country: "Egypt", code: "EG", flag: "🇪🇬", w: 40, h: 60, bg: "#ffffff" },
  { country: "El Salvador", code: "SV", flag: "🇸🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", w: 35, h: 45, bg: "#ffffff" },
  { country: "Estonia", code: "EE", flag: "🇪🇪", w: 40, h: 50, bg: "#ffffff" },
  { country: "Ethiopia", code: "ET", flag: "🇪🇹", w: 30, h: 40, bg: "#ffffff" },
  { country: "Fiji", code: "FJ", flag: "🇫🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Finland", code: "FI", flag: "🇫🇮", w: 36, h: 47, bg: "#ffffff" },
  { country: "France", code: "FR", flag: "🇫🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Gabon", code: "GA", flag: "🇬🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Georgia", code: "GE", flag: "🇬🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Germany", code: "DE", flag: "🇩🇪", w: 35, h: 45, bg: "#d3d3d3" },
  { country: "Ghana", code: "GH", flag: "🇬🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Greece", code: "GR", flag: "🇬🇷", w: 40, h: 60, bg: "#ffffff" },
  { country: "Grenada", code: "GD", flag: "🇬🇩", w: 38, h: 51, bg: "#ffffff" },
  { country: "Guatemala", code: "GT", flag: "🇬🇹", w: 26, h: 32, bg: "#ffffff" },
  { country: "Guinea", code: "GN", flag: "🇬🇳", w: 35, h: 50, bg: "#ffffff" },
  { country: "Guinea-Bissau", code: "GW", flag: "🇬🇼", w: 30, h: 40, bg: "#ffffff" },
  { country: "Guyana", code: "GY", flag: "🇬🇾", w: 45, h: 35, bg: "#ffffff" },
  { country: "Hong Kong", code: "HK", flag: "🇭🇰", w: 40, h: 50, bg: "#ffffff" },
  { country: "Hungary", code: "HU", flag: "🇭🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iceland", code: "IS", flag: "🇮🇸", w: 35, h: 45, bg: "#ffffff" },
  { country: "India", code: "IN", flag: "🇮🇳", w: 51, h: 51, bg: "#ffffff" },
  { country: "Indonesia", code: "ID", flag: "🇮🇩", w: 51, h: 51, bg: "#ff0000" },
  { country: "Iran", code: "IR", flag: "🇮🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iraq", code: "IQ", flag: "🇮🇶", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ireland", code: "IE", flag: "🇮🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Israel", code: "IL", flag: "🇮🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Italy", code: "IT", flag: "🇮🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ivory Coast", code: "CI", flag: "🇨🇮", w: 45, h: 35, bg: "#ffffff" },
  { country: "Jamaica", code: "JM", flag: "🇯🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Japan", code: "JP", flag: "🇯🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "Jordan", code: "JO", flag: "🇯🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kazakhstan", code: "KZ", flag: "🇰🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kenya", code: "KE", flag: "🇰🇪", w: 51, h: 51, bg: "#ffffff" },
  { country: "Kuwait", code: "KW", flag: "🇰🇼", w: 40, h: 60, bg: "#ffffff" },
  { country: "Kyrgyzstan", code: "KG", flag: "🇰🇬", w: 40, h: 60, bg: "#ffffff" },
  { country: "Laos", code: "LA", flag: "🇱🇦", w: 40, h: 60, bg: "#ffffff" },
  { country: "Latvia", code: "LV", flag: "🇱🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lebanon", code: "LB", flag: "🇱🇧", w: 35, h: 45, bg: "#ffffff" },
  { country: "Liberia", code: "LR", flag: "🇱🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Libya", code: "LY", flag: "🇱🇾", w: 40, h: 60, bg: "#ffffff" },
  { country: "Liechtenstein", code: "LI", flag: "🇱🇮", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lithuania", code: "LT", flag: "🇱🇹", w: 40, h: 60, bg: "#ffffff" },
  { country: "Luxembourg", code: "LU", flag: "🇱🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Macau", code: "MO", flag: "🇲🇴", w: 45, h: 35, bg: "#ffffff" },
  { country: "Madagascar", code: "MG", flag: "🇲🇬", w: 40, h: 40, bg: "#ffffff" },
  { country: "Malawi", code: "MW", flag: "🇲🇼", w: 45, h: 35, bg: "#ffffff" },
  { country: "Malaysia", code: "MY", flag: "🇲🇾", w: 35, h: 50, bg: "#ffffff" },
  { country: "Maldives", code: "MV", flag: "🇲🇻", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mali", code: "ML", flag: "🇲🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Malta", code: "MT", flag: "🇲🇹", w: 40, h: 30, bg: "#ffffff" },
  { country: "Mauritania", code: "MR", flag: "🇲🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mauritius", code: "MU", flag: "🇲🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mexico", code: "MX", flag: "🇲🇽", w: 35, h: 45, bg: "#ffffff" },
  { country: "Moldova", code: "MD", flag: "🇲🇩", w: 30, h: 40, bg: "#ffffff" },
  { country: "Mongolia", code: "MN", flag: "🇲🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Montenegro", code: "ME", flag: "🇲🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Morocco", code: "MA", flag: "🇲🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mozambique", code: "MZ", flag: "🇲🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Myanmar", code: "MM", flag: "🇲🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Namibia", code: "NA", flag: "🇳🇦", w: 37, h: 52, bg: "#ffffff" },
  { country: "Nepal", code: "NP", flag: "🇳🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "Netherlands", code: "NL", flag: "🇳🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "New Zealand", code: "NZ", flag: "🇳🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nicaragua", code: "NI", flag: "🇳🇮", w: 40, h: 50, bg: "#ffffff" },
  { country: "Niger", code: "NE", flag: "🇳🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nigeria", code: "NG", flag: "🇳🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "North Korea", code: "KP", flag: "🇰🇵", w: 35, h: 45, bg: "#ffffff" },
  { country: "North Macedonia", code: "MK", flag: "🇲🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Norway", code: "NO", flag: "🇳🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Oman", code: "OM", flag: "🇴🇲", w: 40, h: 60, bg: "#ffffff" },
  { country: "Pakistan", code: "PK", flag: "🇵🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Palestine", code: "PS", flag: "🇵🇸", w: 35, h: 45, bg: "#add8e6" },
  { country: "Panama", code: "PA", flag: "🇵🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "Papua New Guinea", code: "PG", flag: "🇵🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Paraguay", code: "PY", flag: "🇵🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Peru", code: "PE", flag: "🇵🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Philippines", code: "PH", flag: "🇵🇭", w: 35, h: 45, bg: "#0038a8" },
  { country: "Poland", code: "PL", flag: "🇵🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Portugal", code: "PT", flag: "🇵🇹", w: 35, h: 45, bg: "#ffffff" },
  { country: "Qatar", code: "QA", flag: "🇶🇦", w: 38, h: 48, bg: "#ffffff" },
  { country: "Romania", code: "RO", flag: "🇷🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "Russia", code: "RU", flag: "🇷🇺", w: 35, h: 45, bg: "#ffffff" },
  { country: "Rwanda", code: "RW", flag: "🇷🇼", w: 51, h: 51, bg: "#ffffff" },
  { country: "Saint Kitts and Nevis", code: "KN", flag: "🇰🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Samoa", code: "WS", flag: "🇼🇸", w: 45, h: 35, bg: "#ffffff" },
  { country: "Saudi Arabia", code: "SA", flag: "🇸🇦", w: 40, h: 60, bg: "#ffffff" },
  { country: "Senegal", code: "SN", flag: "🇸🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Serbia", code: "RS", flag: "🇷🇸", w: 50, h: 50, bg: "#ffffff" },
  { country: "Seychelles", code: "SC", flag: "🇸🇨", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sierra Leone", code: "SL", flag: "🇸🇱", w: 35, h: 45, bg: "#ffffff" },
  { country: "Singapore", code: "SG", flag: "🇸🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovakia", code: "SK", flag: "🇸🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovenia", code: "SI", flag: "🇸🇮", w: 35, h: 45, bg: "#ffffff" },
  { country: "Somalia", code: "SO", flag: "🇸🇴", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Africa", code: "ZA", flag: "🇿🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Korea", code: "KR", flag: "🇰🇷", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Sudan", code: "SS", flag: "🇸🇸", w: 35, h: 45, bg: "#ffffff" },
  { country: "Spain", code: "ES", flag: "🇪🇸", w: 26, h: 32, bg: "#ffffff" },
  { country: "Sri Lanka", code: "LK", flag: "🇱🇰", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sudan", code: "SD", flag: "🇸🇩", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sweden", code: "SE", flag: "🇸🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Switzerland", code: "CH", flag: "🇨🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Syria", code: "SY", flag: "🇸🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Taiwan", code: "TW", flag: "🇹🇼", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tajikistan", code: "TJ", flag: "🇹🇯", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tanzania", code: "TZ", flag: "🇹🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Thailand", code: "TH", flag: "🇹🇭", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tunisia", code: "TN", flag: "🇹🇳", w: 35, h: 45, bg: "#ffffff" },
  { country: "Turkey", code: "TR", flag: "🇹🇷", w: 50, h: 60, bg: "#ffffff" },
  { country: "Turkmenistan", code: "TM", flag: "🇹🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uganda", code: "UG", flag: "🇺🇬", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ukraine", code: "UA", flag: "🇺🇦", w: 35, h: 45, bg: "#ffffff" },
  { country: "United Arab Emirates", code: "AE", flag: "🇦🇪", w: 40, h: 60, bg: "#ffffff" },
  { country: "United Kingdom", code: "GB", flag: "🇬🇧", w: 35, h: 45, bg: "#d3d3d3" },
  { country: "United States", code: "US", flag: "🇺🇸", w: 51, h: 51, bg: "#ffffff" },
  { country: "Uruguay", code: "UY", flag: "🇺🇾", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uzbekistan", code: "UZ", flag: "🇺🇿", w: 35, h: 45, bg: "#ffffff" },
  { country: "Venezuela", code: "VE", flag: "🇻🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Vietnam", code: "VN", flag: "🇻🇳", w: 40, h: 60, bg: "#ffffff" },
  { country: "Yemen", code: "YE", flag: "🇾🇪", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zambia", code: "ZM", flag: "🇿🇲", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zimbabwe", code: "ZW", flag: "🇿🇼", w: 35, h: 45, bg: "#ffffff" },
]

// DPI for print-quality output
const DPI = 300
const MM_PER_INCH = 25.4

let selectedCountry = PASSPORT_COUNTRIES.find(c => c.country === 'United States')
let selectedDocType = 'passport'
let activeW = selectedCountry.w, activeH = selectedCountry.h
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
  .pp-country-trigger .flag-img{width:22px;height:16px;border-radius:2px;object-fit:cover;vertical-align:middle}
  .pp-country-trigger .arrow{margin-left:auto;font-size:10px;color:#9A8A7A}
  .pp-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;margin-top:4px;display:none;flex-direction:column;max-height:300px}
  .pp-dropdown.open{display:flex}
  .pp-dropdown-search{padding:8px 12px;border:none;border-bottom:1px solid #E8E0D5;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;color:#2C1810}
  .pp-dropdown-search::placeholder{color:#C4B8A8}
  .pp-dropdown-list{overflow-y:auto;flex:1}
  .pp-dropdown-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;color:#2C1810;transition:background 0.1s}
  .pp-dropdown-item:hover,.pp-dropdown-item.active{background:#FDE8E3}
  .pp-dropdown-item .flag-img{width:20px;height:14px;border-radius:2px;object-fit:cover}
  .pp-dropdown-item .size{margin-left:auto;font-size:11px;color:#9A8A7A}
  .pp-size-info{font-size:12px;color:#7A6A5A;margin-top:6px}
  .pp-doc-select{width:100%;padding:8px 12px;border:1.5px solid #DDD5C8;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;color:#2C1810;cursor:pointer;background:#fff;margin-top:8px}
  .pp-doc-select:focus{border-color:#C84B31;outline:none;box-shadow:0 0 0 3px rgba(200,75,49,0.12)}
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

// Realistic passport photo SVG illustration
const exampleSVG = `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c4a0"/><stop offset="1" stop-color="#d4a574"/></linearGradient>
    <linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a0e"/><stop offset="1" stop-color="#1a0f06"/></linearGradient>
    <linearGradient id="shirtG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8a0b0"/><stop offset="1" stop-color="#d4889a"/></linearGradient>
    <radialGradient id="cheekL" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8a090" stop-opacity="0.4"/><stop offset="1" stop-color="#e8a090" stop-opacity="0"/></radialGradient>
    <radialGradient id="cheekR" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8a090" stop-opacity="0.4"/><stop offset="1" stop-color="#e8a090" stop-opacity="0"/></radialGradient>
    <clipPath id="photoClip"><rect width="200" height="260" rx="4"/></clipPath>
  </defs>
  <g clip-path="url(#photoClip)">
    <rect width="200" height="260" fill="#f0f0f0"/>
    <!-- Shoulders / shirt -->
    <ellipse cx="100" cy="270" rx="80" ry="50" fill="url(#shirtG)"/>
    <path d="M40 240 Q50 220 70 215 Q85 212 100 210 Q115 212 130 215 Q150 220 160 240 L160 270 L40 270Z" fill="url(#shirtG)"/>
    <!-- Neck -->
    <rect x="82" y="165" width="36" height="50" rx="14" fill="url(#skinG)"/>
    <!-- Neck shadow -->
    <ellipse cx="100" cy="195" rx="18" ry="6" fill="#c49670" opacity="0.3"/>
    <!-- V-neckline -->
    <path d="M70 215 Q85 212 100 230 Q115 212 130 215" fill="none" stroke="#c47888" stroke-width="1"/>
    <!-- Face -->
    <ellipse cx="100" cy="120" rx="48" ry="56" fill="url(#skinG)"/>
    <!-- Ears -->
    <ellipse cx="52" cy="120" rx="8" ry="12" fill="#dbb08a"/>
    <ellipse cx="52" cy="120" rx="5" ry="8" fill="#d4a574"/>
    <ellipse cx="148" cy="120" rx="8" ry="12" fill="#dbb08a"/>
    <ellipse cx="148" cy="120" rx="5" ry="8" fill="#d4a574"/>
    <!-- Hair back -->
    <path d="M48 110 Q48 50 100 42 Q152 50 152 110 Q152 65 100 58 Q48 65 48 110Z" fill="url(#hairG)"/>
    <!-- Hair top volume -->
    <ellipse cx="100" cy="62" rx="50" ry="28" fill="url(#hairG)"/>
    <!-- Hair sides -->
    <path d="M48 70 Q45 90 50 120 Q48 95 52 75Z" fill="#1a0f06"/>
    <path d="M152 70 Q155 90 150 120 Q152 95 148 75Z" fill="#1a0f06"/>
    <!-- Hair strands -->
    <path d="M65 55 Q80 48 100 46 Q120 48 135 55" fill="none" stroke="#3a2a1e" stroke-width="0.5" opacity="0.4"/>
    <path d="M60 60 Q80 50 100 48 Q120 50 140 60" fill="none" stroke="#3a2a1e" stroke-width="0.3" opacity="0.3"/>
    <!-- Eyebrows -->
    <path d="M72 100 Q80 96 90 98" stroke="#3a2a1e" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M110 98 Q120 96 128 100" stroke="#3a2a1e" stroke-width="2" stroke-linecap="round" fill="none"/>
    <!-- Eyes -->
    <ellipse cx="82" cy="110" rx="9" ry="6" fill="#ffffff"/>
    <circle cx="82" cy="110" r="4.5" fill="#4a3520"/>
    <circle cx="82" cy="110" r="2.2" fill="#1a0f06"/>
    <circle cx="80" cy="108" r="1.2" fill="#ffffff" opacity="0.7"/>
    <ellipse cx="118" cy="110" rx="9" ry="6" fill="#ffffff"/>
    <circle cx="118" cy="110" r="4.5" fill="#4a3520"/>
    <circle cx="118" cy="110" r="2.2" fill="#1a0f06"/>
    <circle cx="116" cy="108" r="1.2" fill="#ffffff" opacity="0.7"/>
    <!-- Eyelids -->
    <path d="M73 107 Q82 104 91 107" stroke="#c49670" stroke-width="0.6" fill="none"/>
    <path d="M109 107 Q118 104 127 107" stroke="#c49670" stroke-width="0.6" fill="none"/>
    <!-- Eyelashes -->
    <path d="M73 110 Q82 105 91 110" stroke="#2a1a0e" stroke-width="0.8" fill="none"/>
    <path d="M109 110 Q118 105 127 110" stroke="#2a1a0e" stroke-width="0.8" fill="none"/>
    <!-- Nose -->
    <path d="M98 108 Q96 120 92 130 Q96 133 100 134 Q104 133 108 130 Q104 120 102 108" fill="none" stroke="#c49670" stroke-width="0.8"/>
    <ellipse cx="94" cy="130" rx="3.5" ry="2.5" fill="none" stroke="#c49670" stroke-width="0.5"/>
    <ellipse cx="106" cy="130" rx="3.5" ry="2.5" fill="none" stroke="#c49670" stroke-width="0.5"/>
    <!-- Cheek blush -->
    <ellipse cx="70" cy="125" rx="12" ry="8" fill="url(#cheekL)"/>
    <ellipse cx="130" cy="125" rx="12" ry="8" fill="url(#cheekR)"/>
    <!-- Lips -->
    <path d="M88 145 Q94 140 100 142 Q106 140 112 145" fill="#c47070" stroke="#b56060" stroke-width="0.3"/>
    <path d="M88 145 Q100 153 112 145" fill="#d48080" stroke="#b56060" stroke-width="0.3"/>
    <!-- Chin definition -->
    <path d="M80 158 Q100 170 120 158" fill="none" stroke="#c49670" stroke-width="0.4" opacity="0.5"/>
    <!-- Photo border -->
    <rect width="200" height="260" rx="4" fill="none" stroke="#e0e0e0" stroke-width="1"/>
  </g>
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
              <img class="flag-img" id="triggerFlag" src="https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png" alt="${selectedCountry.code}" />
              <span id="countryName">${selectedCountry.country}</span>
              <span class="arrow">&#9660;</span>
            </button>
            <div class="pp-dropdown" id="countryDropdown">
              <input class="pp-dropdown-search" id="countrySearch" type="text" placeholder="${ppSearchLbl}" />
              <div class="pp-dropdown-list" id="countryList"></div>
            </div>
          </div>
          <div class="pp-card-title" style="margin-top:12px">${ppDocTypeLbl}</div>
          <select class="pp-doc-select" id="docTypeSelect">
            <option value="passport">${ppPassportLbl} (${selectedCountry.w}×${selectedCountry.h}mm)</option>
          </select>
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
const docTypeSelect = document.getElementById('docTypeSelect')
const triggerFlag   = document.getElementById('triggerFlag')

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

// Flag image URL helper
function flagUrl(code, size) { return 'https://flagcdn.com/w' + (size || 40) + '/' + code.toLowerCase() + '.png' }

// Update document type dropdown options based on selected country
function updateDocTypes() {
  const c = selectedCountry
  docTypeSelect.innerHTML = '<option value="passport">' + ppPassportLbl + ' (' + c.w + '×' + c.h + 'mm)</option>'
  DOC_TYPES.visa.sizes.forEach(function(s, i) {
    docTypeSelect.innerHTML += '<option value="visa_' + i + '">' + ppVisaLbl + ' — ' + s.name + '</option>'
  })
  DOC_TYPES.id_card.sizes.forEach(function(s, i) {
    docTypeSelect.innerHTML += '<option value="id_' + i + '">' + ppIdCardLbl + ' — ' + s.name + '</option>'
  })
  docTypeSelect.value = 'passport'
  selectedDocType = 'passport'
  activeW = c.w; activeH = c.h
  sizeInfo.textContent = ppSizeLbl + ': ' + activeW + '×' + activeH + ' mm'
}

// Handle document type change
docTypeSelect.addEventListener('change', () => {
  const val = docTypeSelect.value
  if (val === 'passport') {
    activeW = selectedCountry.w; activeH = selectedCountry.h
  } else if (val.startsWith('visa_')) {
    const s = DOC_TYPES.visa.sizes[parseInt(val.split('_')[1])]
    activeW = s.w; activeH = s.h
  } else if (val.startsWith('id_')) {
    const s = DOC_TYPES.id_card.sizes[parseInt(val.split('_')[1])]
    activeW = s.w; activeH = s.h
  }
  sizeInfo.textContent = ppSizeLbl + ': ' + activeW + '×' + activeH + ' mm'
  panOffsetX = 0; panOffsetY = 0
  renderCanvas()
})

// Country dropdown
function renderCountryList(filter) {
  const q = (filter || '').toLowerCase()
  const filtered = PASSPORT_COUNTRIES.filter(c => c.country.toLowerCase().indexOf(q) !== -1)
  countryList.innerHTML = filtered.map(c =>
    '<div class="pp-dropdown-item' + (c.country === selectedCountry.country ? ' active' : '') + '" data-country="' + c.country + '">' +
    '<img class="flag-img" src="' + flagUrl(c.code, 40) + '" alt="' + c.code + '" />' +
    '<span>' + c.country + '</span>' +
    '<span class="size">' + c.w + '×' + c.h + 'mm</span></div>'
  ).join('')
  countryList.querySelectorAll('.pp-dropdown-item').forEach(el => {
    el.addEventListener('click', () => {
      const c = PASSPORT_COUNTRIES.find(x => x.country === el.dataset.country)
      if (!c) return
      selectedCountry = c
      countryNameEl.textContent = c.country
      triggerFlag.src = flagUrl(c.code, 40)
      triggerFlag.alt = c.code
      bgColorInput.value = c.bg
      countryDropdown.classList.remove('open')
      panOffsetX = 0
      panOffsetY = 0
      updateDocTypes()
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
  // Use mm-based aspect ratio for canvas display
  const aspect = activeW / activeH
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
  const wPx = Math.round(activeW / MM_PER_INCH * DPI)
  const hPx = Math.round(activeH / MM_PER_INCH * DPI)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = wPx
  outCanvas.height = hPx
  const octx = outCanvas.getContext('2d')

  octx.fillStyle = bgColorInput.value
  octx.fillRect(0, 0, wPx, hPx)

  if (uploadedImg) {
    const img = uploadedImg
    const aspect = activeW / activeH
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
updateDocTypes()
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
