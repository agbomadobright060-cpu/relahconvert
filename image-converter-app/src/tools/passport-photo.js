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
const DPI = 600
const MM_PER_INCH = 25.4

let selectedCountry = PASSPORT_COUNTRIES.find(c => c.country === 'United States')
let selectedDocType = 'passport'
let activeW = selectedCountry.w, activeH = selectedCountry.h
let uploadedImg = null
let processedImg = null
let removeBgFn = null
let personBounds = null

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
  .pp-canvas-area{background:#fff;border-radius:12px;overflow:hidden;position:relative;display:none}
  .pp-canvas-area.visible{display:block}
  .pp-dropzone{border:2px dashed #DDD5C8;border-radius:12px;padding:48px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#FAFAF8}
  .pp-dropzone:hover{border-color:#C84B31;background:#FDE8E3}
  .pp-dropzone svg{margin-bottom:8px;color:#C4B8A8}
  .pp-dropzone:hover svg{color:#C84B31}
  .pp-dropzone p{margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#9A8A7A}
  .pp-hero{text-align:center;margin-bottom:24px}
  .pp-hero img{max-width:100%;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08)}
  .pp-canvas-inner{position:relative;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none;-webkit-user-select:none}
  .pp-canvas-inner canvas{display:block;max-width:100%;height:auto;pointer-events:none;user-select:none;margin:0 auto}
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
  .pp-status{font-size:13px;color:#7A6A5A;text-align:center;padding:10px 0;font-family:'DM Sans',sans-serif}
  .pp-dl-btn{display:block;width:100%;padding:12px;border:none;border-radius:10px;font-size:14px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;transition:all 0.18s;text-align:center;text-decoration:none}
  .pp-dl-primary{background:#C84B31;color:#fff}
  .pp-dl-primary:hover{background:#A63D26}
  .pp-dl-secondary{background:#2C1810;color:#fff;margin-top:8px}
  .pp-dl-secondary:hover{background:#1a0f0a}
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

document.querySelector('#app').innerHTML = `
  <div class="pp-wrap">
    <h1 class="pp-h1">${h1Main} <em>${h1Em}</em></h1>
    <p class="pp-desc">${descText}</p>
    <div class="pp-grid">
      <div>
        <div class="pp-canvas-area" id="canvasArea">
          <div class="pp-canvas-inner" id="canvasWrap">
            <canvas id="ppCanvas"></canvas>
          </div>
          <div class="pp-status" id="ppStatus" style="display:none"></div>
        </div>
        <div id="dropZone" class="pp-dropzone">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#F5F0E8"/><circle cx="14" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="#DDD5C8"/><path d="M6 26l7-6 5 4 6-5 10 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="14" y="16" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#fff" opacity="0.85"/><path d="M28 30v-8m0 0l-3.5 3.5M28 22l3.5 3.5" stroke="#C84B31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>${t.pp_drop || 'Upload a portrait photo to get started'}</p>
        </div>
        <div class="pp-hero" id="heroSection">
          <img src="/passport-before-after.jpg" alt="Passport photo before and after example" />
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
          <input type="hidden" id="bgColor" value="#ffffff" />
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
const canvasArea    = document.getElementById('canvasArea')
const dropZoneEl    = document.getElementById('dropZone')
const nextSteps     = document.getElementById('nextSteps')
const nextBtns      = document.getElementById('nextBtns')
const docTypeSelect = document.getElementById('docTypeSelect')
const triggerFlag   = document.getElementById('triggerFlag')
const ppStatus      = document.getElementById('ppStatus')

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = async () => {
    uploadedImg = img
    processedImg = null
    personBounds = null
    dropZoneEl.style.display = 'none'
    document.getElementById('heroSection').style.display = 'none'
    canvasArea.classList.add('visible')
    downloadCard.style.display = 'none'
    ppStatus.style.display = ''
    renderCanvas()

    ppStatus.textContent = t.pp_removing_bg || 'Removing background...'

    try {
      if (!removeBgFn) {
        ppStatus.textContent = t.pp_loading_model || 'Loading AI model...'
        const mod = await import('@imgly/background-removal')
        removeBgFn = mod.removeBackground
      }
      ppStatus.textContent = t.pp_removing_bg || 'Removing background...'
      const blob = await removeBgFn(file, {
        model: 'isnet_quint8',
        output: { format: 'image/png' },
      })
      const bgImg = new Image()
      bgImg.onload = () => {
        processedImg = bgImg
        personBounds = null  // reset so getCropRegion rescans
        ppStatus.style.display = 'none'
        downloadCard.style.display = ''
        renderCanvas()
        buildNextSteps()
      }
      bgImg.onerror = () => showWithoutBgRemoval()
      bgImg.src = URL.createObjectURL(blob)
    } catch (err) {
      console.error('Background removal failed:', err)
      ppStatus.textContent = 'Background removal failed — using original photo.'
      ppStatus.style.color = '#C84B31'
      setTimeout(() => { ppStatus.style.display = 'none'; ppStatus.style.color = '' }, 5000)
      showWithoutBgRemoval()
    }
  }
  img.src = url
}

function showWithoutBgRemoval() {
  processedImg = null
  ppStatus.style.display = 'none'
  downloadCard.style.display = ''
  renderCanvas()
  buildNextSteps()
}

uploadBtn.addEventListener('click', () => fileInput.click())
dropZoneEl.addEventListener('click', () => fileInput.click())
dropZoneEl.addEventListener('dragover', e => { e.preventDefault(); dropZoneEl.style.borderColor = '#C84B31'; dropZoneEl.style.background = '#FDE8E3' })
dropZoneEl.addEventListener('dragleave', () => { dropZoneEl.style.borderColor = ''; dropZoneEl.style.background = '' })
dropZoneEl.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); dropZoneEl.style.borderColor = ''; dropZoneEl.style.background = ''; if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]) })
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]) })
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) handleFile(fileInput.files[0])
  fileInput.value = ''
})

function flagUrl(code, size) { return 'https://flagcdn.com/w' + (size || 40) + '/' + code.toLowerCase() + '.png' }

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
  renderCanvas()
})

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
      countryDropdown.classList.remove('open')
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

function findPersonBounds(img) {
  const imgW = img.naturalWidth
  const imgH = img.naturalHeight
  const sc = document.createElement('canvas')
  sc.width = imgW; sc.height = imgH
  const sctx = sc.getContext('2d')
  sctx.drawImage(img, 0, 0)
  const data = sctx.getImageData(0, 0, imgW, imgH).data
  let topY = imgH, bottomY = 0, leftX = imgW, rightX = 0
  for (let y = 0; y < imgH; y += 2) {
    for (let x = 0; x < imgW; x += 2) {
      const i = (y * imgW + x) * 4
      if (data[i + 3] > 30) {
        if (y < topY) topY = y
        if (y > bottomY) bottomY = y
        if (x < leftX) leftX = x
        if (x > rightX) rightX = x
      }
    }
  }
  if (topY >= bottomY) return null
  return { topY, bottomY, leftX, rightX }
}

function getCropRegion(img, aspect) {
  const imgW = img.naturalWidth
  const imgH = img.naturalHeight

  // After bg removal: scan alpha to find person, crop head+shoulders
  if (processedImg) {
    if (!personBounds) personBounds = findPersonBounds(img)
    if (personBounds) {
      const { topY, bottomY, leftX, rightX } = personBounds
      const personH = bottomY - topY
      const personCx = leftX + (rightX - leftX) / 2
      console.log('Person bounds:', { topY, bottomY, leftX, rightX, personH, imgW, imgH, fillRatio: personH/imgH })

      // How much of image does person fill?
      const fillRatio = personH / imgH

      // Calculate how much of the person to show (head + shoulders)
      // For any photo type, we want: top of head → mid-chest
      let headTop = topY
      let cropBottom
      if (fillRatio > 0.7) {
        // Full body or 3/4: take head + shoulders (top 22%)
        cropBottom = topY + personH * 0.22
      } else if (fillRatio > 0.4) {
        // Half body: take head + shoulders (top 50%)
        cropBottom = topY + personH * 0.50
      } else {
        // Already close-up: use full person bounds
        cropBottom = bottomY
      }

      // Add small margin above head (5% of crop height)
      const cropH = cropBottom - headTop
      const marginTop = cropH * 0.12
      let srcY = Math.max(0, headTop - marginTop)
      let srcH = cropH + marginTop

      // Apply aspect ratio
      let srcW = srcH * aspect
      let srcX = personCx - srcW / 2

      // Clamp: if wider than image, expand height to fill
      if (srcW > imgW) {
        srcW = imgW
        srcH = srcW / aspect
        srcX = 0
      }
      // Clamp all bounds
      if (srcX < 0) srcX = 0
      if (srcX + srcW > imgW) srcX = imgW - srcW
      if (srcY < 0) srcY = 0
      if (srcY + srcH > imgH) { srcH = imgH - srcY }

      return { srcX, srcY, srcW, srcH }
    }
  }

  // Before bg removal: show original image, rough center crop
  let srcW, srcH, srcX, srcY
  if (aspect >= 1) {
    // Wide or square: crop from top, width = image width
    srcW = imgW
    srcH = srcW / aspect
    srcX = 0
    srcY = 0
  } else {
    // Tall: crop centered
    srcH = imgH * 0.5
    srcW = srcH * aspect
    srcX = (imgW - srcW) / 2
    srcY = 0
  }
  if (srcW > imgW) { srcW = imgW; srcH = srcW / aspect }
  if (srcH > imgH) { srcH = imgH; srcW = srcH * aspect }
  if (srcX < 0) srcX = 0
  if (srcY < 0) srcY = 0
  return { srcX, srcY, srcW, srcH }
}

function renderCanvas() {
  const aspect = activeW / activeH
  const dispW = 400
  const dispH = Math.round(dispW / aspect)
  ppCanvas.width = dispW
  ppCanvas.height = dispH
  canvasWrap.style.maxWidth = dispW + 'px'
  canvasArea.style.maxWidth = dispW + 'px'
  ctx.fillStyle = selectedCountry.bg || '#ffffff'
  ctx.fillRect(0, 0, dispW, dispH)
  if (!uploadedImg) return
  const img = processedImg || uploadedImg
  const { srcX, srcY, srcW, srcH } = getCropRegion(img, aspect)
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, dispW, dispH)
}

function generatePhoto() {
  const wPx = Math.round(activeW / MM_PER_INCH * DPI)
  const hPx = Math.round(activeH / MM_PER_INCH * DPI)
  const aspect = activeW / activeH
  const outCanvas = document.createElement('canvas')
  outCanvas.width = wPx; outCanvas.height = hPx
  const octx = outCanvas.getContext('2d')
  octx.fillStyle = selectedCountry.bg || '#ffffff'
  octx.fillRect(0, 0, wPx, hPx)
  if (uploadedImg) {
    const img = processedImg || uploadedImg
    const { srcX, srcY, srcW, srcH } = getCropRegion(img, aspect)
    octx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, wPx, hPx)
  }
  return outCanvas
}

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

dlSheet.addEventListener('click', () => {
  const photoCanvas = generatePhoto()
  const photoW = photoCanvas.width
  const photoH = photoCanvas.height
  const sheetW = 6 * DPI
  const sheetH = 4 * DPI
  const sheetCanvas = document.createElement('canvas')
  sheetCanvas.width = sheetW; sheetCanvas.height = sheetH
  const sctx = sheetCanvas.getContext('2d')
  sctx.fillStyle = '#ffffff'
  sctx.fillRect(0, 0, sheetW, sheetH)
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

renderCountryList('')
updateDocTypes()
renderCanvas()

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