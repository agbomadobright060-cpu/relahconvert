import { injectHeader } from '../core/header.js'
import { getT, localHref, injectHreflang, injectFaqSchema } from '../core/i18n.js'
injectHreflang('passport-photo')

const t = getT()

const toolName  = (t.nav_short && t.nav_short['passport-photo']) || 'Passport Photo'
const seoData   = t.seo && t.seo['passport-photo']
const descText  = seoData ? seoData.h2a : 'Create passport photos that meet official requirements for 170+ countries.'
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
const ppPrintSheetLbl = t.pp_print_sheet || 'Download Print Sheet (4x6)'
const ppSizeLbl       = t.pp_size || 'Size'
const ppUploadLbl     = t.pp_upload || 'Upload Photo'
const ppExampleLbl    = t.pp_example || 'Example output'
const ppSearchLbl     = t.pp_search || 'Search country...'
const ppDocTypeLbl    = t.pp_doc_type || 'Document Type'
const ppPassportLbl   = t.pp_passport || 'Passport'
const ppVisaLbl       = t.pp_visa || 'Visa'
const ppIdCardLbl     = t.pp_id_card || 'ID Card'

const PASSPORT_COUNTRIES = [
  { country: "Afghanistan", code: "AF", flag: "\u{1F1E6}\u{1F1EB}", w: 40, h: 45, bg: "#ffffff" },
  { country: "Albania", code: "AL", flag: "\u{1F1E6}\u{1F1F1}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Algeria", code: "DZ", flag: "\u{1F1E9}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Angola", code: "AO", flag: "\u{1F1E6}\u{1F1F4}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Argentina", code: "AR", flag: "\u{1F1E6}\u{1F1F7}", w: 40, h: 40, bg: "#ffffff" },
  { country: "Armenia", code: "AM", flag: "\u{1F1E6}\u{1F1F2}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Australia", code: "AU", flag: "\u{1F1E6}\u{1F1FA}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Australia Passport (35×45mm)', w: 35, h: 45 }, { name: 'Australia Visa (35×45mm)', w: 35, h: 45 }, { name: 'Australia Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'Australia Citizenship (35×45mm)', w: 35, h: 45 }, { name: 'Australia Working Holiday Visa (35×45mm)', w: 35, h: 45 }, { name: 'Australia Student Visa (35×45mm)', w: 35, h: 45 }] },
  { country: "Austria", code: "AT", flag: "\u{1F1E6}\u{1F1F9}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Azerbaijan", code: "AZ", flag: "\u{1F1E6}\u{1F1FF}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Bahamas", code: "BS", flag: "\u{1F1E7}\u{1F1F8}", w: 51, h: 51, bg: "#ffffff" },
  { country: "Bahrain", code: "BH", flag: "\u{1F1E7}\u{1F1ED}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Bangladesh", code: "BD", flag: "\u{1F1E7}\u{1F1E9}", w: 45, h: 55, bg: "#ffffff", docs: [{ name: 'Bangladesh Passport (45×55mm)', w: 45, h: 55 }, { name: 'Bangladesh Visa (45×55mm)', w: 45, h: 55 }, { name: 'Bangladesh NID Card (30×36mm)', w: 30, h: 36 }, { name: 'Bangladesh Driving Licence (30×36mm)', w: 30, h: 36 }] },
  { country: "Barbados", code: "BB", flag: "\u{1F1E7}\u{1F1E7}", w: 50, h: 50, bg: "#ffffff" },
  { country: "Belarus", code: "BY", flag: "\u{1F1E7}\u{1F1FE}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Belgium", code: "BE", flag: "\u{1F1E7}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Belize", code: "BZ", flag: "\u{1F1E7}\u{1F1FF}", w: 51, h: 51, bg: "#ffffff" },
  { country: "Benin", code: "BJ", flag: "\u{1F1E7}\u{1F1EF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Bhutan", code: "BT", flag: "\u{1F1E7}\u{1F1F9}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Bolivia", code: "BO", flag: "\u{1F1E7}\u{1F1F4}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Bosnia and Herzegovina", code: "BA", flag: "\u{1F1E7}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Botswana", code: "BW", flag: "\u{1F1E7}\u{1F1FC}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Brazil", code: "BR", flag: "\u{1F1E7}\u{1F1F7}", w: 50, h: 70, bg: "#ffffff", docs: [{ name: 'Brazil Passport (50×70mm)', w: 50, h: 70 }, { name: 'Brazil Visa (50×70mm)', w: 50, h: 70 }, { name: 'Brazil ID Card (30×40mm)', w: 30, h: 40 }, { name: 'Brazil Driving Licence (30×40mm)', w: 30, h: 40 }, { name: 'Brazil RG National ID (30×40mm)', w: 30, h: 40 }, { name: 'Brazil CNH Driving Licence (30×40mm)', w: 30, h: 40 }, { name: 'Brazil Work Permit (50×70mm)', w: 50, h: 70 }] },
  { country: "Brunei", code: "BN", flag: "\u{1F1E7}\u{1F1F3}", w: 52, h: 40, bg: "#ffffff" },
  { country: "Bulgaria", code: "BG", flag: "\u{1F1E7}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Burkina Faso", code: "BF", flag: "\u{1F1E7}\u{1F1EB}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Cambodia", code: "KH", flag: "\u{1F1F0}\u{1F1ED}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Cameroon", code: "CM", flag: "\u{1F1E8}\u{1F1F2}", w: 40, h: 40, bg: "#ffffff" },
  { country: "Canada", code: "CA", flag: "\u{1F1E8}\u{1F1E6}", w: 50, h: 70, bg: "#ffffff", docs: [{ name: 'Canada Passport (50×70mm)', w: 50, h: 70 }, { name: 'Canada Visa (35×45mm)', w: 35, h: 45 }, { name: 'Canada Permanent Resident Card (50×70mm)', w: 50, h: 70 }, { name: 'Canada Citizenship (50×70mm)', w: 50, h: 70 }, { name: 'Canada Driving Licence (50×70mm)', w: 50, h: 70 }, { name: 'Canada Study Permit (35×45mm)', w: 35, h: 45 }, { name: 'Canada Work Permit (35×45mm)', w: 35, h: 45 }, { name: 'Canada Temporary Resident Visa (35×45mm)', w: 35, h: 45 }] },
  { country: "Chad", code: "TD", flag: "\u{1F1F9}\u{1F1E9}", w: 50, h: 50, bg: "#ffffff" },
  { country: "Chile", code: "CL", flag: "\u{1F1E8}\u{1F1F1}", w: 45, h: 45, bg: "#ffffff" },
  { country: "China", code: "CN", flag: "\u{1F1E8}\u{1F1F3}", w: 33, h: 48, bg: "#ffffff", docs: [{ name: 'China Passport (33×48mm)', w: 33, h: 48 }, { name: 'China Visa (33×48mm)', w: 33, h: 48 }, { name: 'China ID Card (26×32mm)', w: 26, h: 32 }, { name: 'China Driving Licence (22×32mm)', w: 22, h: 32 }, { name: 'China Residence Permit (33×48mm)', w: 33, h: 48 }, { name: 'China Work Permit (33×48mm)', w: 33, h: 48 }, { name: 'China Student Visa (33×48mm)', w: 33, h: 48 }, { name: 'China Hong Kong Visa (40×50mm)', w: 40, h: 50 }] },
  { country: "Colombia", code: "CO", flag: "\u{1F1E8}\u{1F1F4}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Congo (Brazzaville)", code: "CG", flag: "\u{1F1E8}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Congo (DR)", code: "CD", flag: "\u{1F1E8}\u{1F1E9}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Costa Rica", code: "CR", flag: "\u{1F1E8}\u{1F1F7}", w: 51, h: 51, bg: "#ffffff" },
  { country: "Croatia", code: "HR", flag: "\u{1F1ED}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Cuba", code: "CU", flag: "\u{1F1E8}\u{1F1FA}", w: 45, h: 45, bg: "#ffffff" },
  { country: "Cyprus", code: "CY", flag: "\u{1F1E8}\u{1F1FE}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Czech Republic", code: "CZ", flag: "\u{1F1E8}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Denmark", code: "DK", flag: "\u{1F1E9}\u{1F1F0}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Djibouti", code: "DJ", flag: "\u{1F1E9}\u{1F1EF}", w: 35, h: 35, bg: "#ffffff" },
  { country: "Dominica", code: "DM", flag: "\u{1F1E9}\u{1F1F2}", w: 45, h: 38, bg: "#ffffff" },
  { country: "Dominican Republic", code: "DO", flag: "\u{1F1E9}\u{1F1F4}", w: 51, h: 51, bg: "#ffffff" },
  { country: "Ecuador", code: "EC", flag: "\u{1F1EA}\u{1F1E8}", w: 50, h: 50, bg: "#ffffff" },
  { country: "Egypt", code: "EG", flag: "\u{1F1EA}\u{1F1EC}", w: 40, h: 60, bg: "#ffffff", docs: [{ name: 'Egypt Passport (40×60mm)', w: 40, h: 60 }, { name: 'Egypt Visa (40×60mm)', w: 40, h: 60 }, { name: 'Egypt ID Card (40×60mm)', w: 40, h: 60 }, { name: 'Egypt National ID Card (40×60mm)', w: 40, h: 60 }, { name: 'Egypt Work Permit (40×60mm)', w: 40, h: 60 }] },
  { country: "El Salvador", code: "SV", flag: "\u{1F1F8}\u{1F1FB}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Equatorial Guinea", code: "GQ", flag: "\u{1F1EC}\u{1F1F6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Estonia", code: "EE", flag: "\u{1F1EA}\u{1F1EA}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Ethiopia", code: "ET", flag: "\u{1F1EA}\u{1F1F9}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Fiji", code: "FJ", flag: "\u{1F1EB}\u{1F1EF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Finland", code: "FI", flag: "\u{1F1EB}\u{1F1EE}", w: 36, h: 47, bg: "#ffffff" },
  { country: "France", code: "FR", flag: "\u{1F1EB}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'France Passport (35×45mm)', w: 35, h: 45 }, { name: 'France Visa (35×45mm)', w: 35, h: 45 }, { name: 'France ID Card (35×45mm)', w: 35, h: 45 }, { name: 'France Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'France Residence Permit (35×45mm)', w: 35, h: 45 }, { name: 'France Schengen Visa (35×45mm)', w: 35, h: 45 }, { name: 'France Titre de Séjour (35×45mm)', w: 35, h: 45 }, { name: 'France Carte Vitale (35×45mm)', w: 35, h: 45 }] },
  { country: "Gabon", code: "GA", flag: "\u{1F1EC}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Georgia", code: "GE", flag: "\u{1F1EC}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Germany", code: "DE", flag: "\u{1F1E9}\u{1F1EA}", w: 35, h: 45, bg: "#d3d3d3", docs: [{ name: 'Germany Passport (35×45mm)', w: 35, h: 45 }, { name: 'Germany Visa (35×45mm)', w: 35, h: 45 }, { name: 'Germany ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Germany Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'Germany Residence Permit (35×45mm)', w: 35, h: 45 }, { name: 'Germany Schengen Visa (35×45mm)', w: 35, h: 45 }, { name: 'Germany Work Visa (35×45mm)', w: 35, h: 45 }, { name: 'Germany Student Visa (35×45mm)', w: 35, h: 45 }] },
  { country: "Ghana", code: "GH", flag: "\u{1F1EC}\u{1F1ED}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Ghana Passport (35×45mm)', w: 35, h: 45 }, { name: 'Ghana Visa (35×45mm)', w: 35, h: 45 }, { name: 'Ghana ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Ghana National ID Ghana Card (35×45mm)', w: 35, h: 45 }, { name: 'Ghana Driving Licence (35×45mm)', w: 35, h: 45 }] },
  { country: "Greece", code: "GR", flag: "\u{1F1EC}\u{1F1F7}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Grenada", code: "GD", flag: "\u{1F1EC}\u{1F1E9}", w: 38, h: 51, bg: "#ffffff" },
  { country: "Guatemala", code: "GT", flag: "\u{1F1EC}\u{1F1F9}", w: 26, h: 32, bg: "#ffffff" },
  { country: "Guinea", code: "GN", flag: "\u{1F1EC}\u{1F1F3}", w: 35, h: 50, bg: "#ffffff" },
  { country: "Guinea-Bissau", code: "GW", flag: "\u{1F1EC}\u{1F1FC}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Guyana", code: "GY", flag: "\u{1F1EC}\u{1F1FE}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Hong Kong", code: "HK", flag: "\u{1F1ED}\u{1F1F0}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Hungary", code: "HU", flag: "\u{1F1ED}\u{1F1FA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iceland", code: "IS", flag: "\u{1F1EE}\u{1F1F8}", w: 35, h: 45, bg: "#ffffff" },
  { country: "India", code: "IN", flag: "\u{1F1EE}\u{1F1F3}", w: 51, h: 51, bg: "#ffffff", docs: [{ name: 'India Passport (51×51mm)', w: 51, h: 51 }, { name: 'India Passport Seva (35×45mm)', w: 35, h: 45 }, { name: 'India OCI Passport (51×51mm)', w: 51, h: 51 }, { name: 'India Visa (51×51mm)', w: 51, h: 51 }, { name: 'India Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'India PAN Card (25×35mm)', w: 25, h: 35 }, { name: 'India Voter ID (35×45mm)', w: 35, h: 45 }, { name: 'India Aadhaar Card (35×45mm)', w: 35, h: 45 }, { name: 'India e-Visa Online (51×51mm)', w: 51, h: 51 }, { name: 'India OCI Card (35×35mm)', w: 35, h: 35 }] },
  { country: "Indonesia", code: "ID", flag: "\u{1F1EE}\u{1F1E9}", w: 35, h: 45, bg: "#ff0000", docs: [{ name: 'Indonesia Passport (35×45mm)', w: 35, h: 45 }, { name: 'Indonesia Visa (35×45mm)', w: 35, h: 45 }, { name: 'Indonesia KTP ID Card (30×40mm)', w: 30, h: 40 }, { name: 'Indonesia SIM Driving Licence (30×40mm)', w: 30, h: 40 }, { name: 'Indonesia KITAS Residence Permit (30×40mm)', w: 30, h: 40 }] },
  { country: "Iran", code: "IR", flag: "\u{1F1EE}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Iraq", code: "IQ", flag: "\u{1F1EE}\u{1F1F6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ireland", code: "IE", flag: "\u{1F1EE}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Israel", code: "IL", flag: "\u{1F1EE}\u{1F1F1}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Italy", code: "IT", flag: "\u{1F1EE}\u{1F1F9}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Italy Passport (35×45mm)', w: 35, h: 45 }, { name: 'Italy Visa (35×45mm)', w: 35, h: 45 }, { name: 'Italy ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Italy Driving Licence (35×45mm)', w: 35, h: 45 }] },
  { country: "Ivory Coast", code: "CI", flag: "\u{1F1E8}\u{1F1EE}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Jamaica", code: "JM", flag: "\u{1F1EF}\u{1F1F2}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Japan", code: "JP", flag: "\u{1F1EF}\u{1F1F5}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Japan Passport (35×45mm)', w: 35, h: 45 }, { name: 'Japan Visa (45×45mm)', w: 45, h: 45 }, { name: 'Japan Residence Card (30×40mm)', w: 30, h: 40 }, { name: 'Japan Driving Licence (24×30mm)', w: 24, h: 30 }, { name: 'Japan My Number Card (35×45mm)', w: 35, h: 45 }, { name: 'Japan Work Visa (45×45mm)', w: 45, h: 45 }, { name: 'Japan Student Visa (45×45mm)', w: 45, h: 45 }] },
  { country: "Jordan", code: "JO", flag: "\u{1F1EF}\u{1F1F4}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kazakhstan", code: "KZ", flag: "\u{1F1F0}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Kenya", code: "KE", flag: "\u{1F1F0}\u{1F1EA}", w: 51, h: 51, bg: "#ffffff", docs: [{ name: 'Kenya Passport (51×51mm)', w: 51, h: 51 }, { name: 'Kenya Visa (51×51mm)', w: 51, h: 51 }, { name: 'Kenya ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Kenya National ID Huduma Namba (35×45mm)', w: 35, h: 45 }] },
  { country: "Kuwait", code: "KW", flag: "\u{1F1F0}\u{1F1FC}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Kyrgyzstan", code: "KG", flag: "\u{1F1F0}\u{1F1EC}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Laos", code: "LA", flag: "\u{1F1F1}\u{1F1E6}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Latvia", code: "LV", flag: "\u{1F1F1}\u{1F1FB}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lebanon", code: "LB", flag: "\u{1F1F1}\u{1F1E7}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Liberia", code: "LR", flag: "\u{1F1F1}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Libya", code: "LY", flag: "\u{1F1F1}\u{1F1FE}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Liechtenstein", code: "LI", flag: "\u{1F1F1}\u{1F1EE}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Lithuania", code: "LT", flag: "\u{1F1F1}\u{1F1F9}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Luxembourg", code: "LU", flag: "\u{1F1F1}\u{1F1FA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Macau", code: "MO", flag: "\u{1F1F2}\u{1F1F4}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Madagascar", code: "MG", flag: "\u{1F1F2}\u{1F1EC}", w: 40, h: 40, bg: "#ffffff" },
  { country: "Malawi", code: "MW", flag: "\u{1F1F2}\u{1F1FC}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Malaysia", code: "MY", flag: "\u{1F1F2}\u{1F1FE}", w: 35, h: 50, bg: "#ffffff", docs: [{ name: 'Malaysia Passport (35×50mm)', w: 35, h: 50 }, { name: 'Malaysia Visa (35×50mm)', w: 35, h: 50 }, { name: 'Malaysia MyKad ID (25×32mm)', w: 25, h: 32 }, { name: 'Malaysia Driving Licence (25×32mm)', w: 25, h: 32 }, { name: 'Malaysia MyKad IC (25×32mm)', w: 25, h: 32 }, { name: 'Malaysia Work Permit (35×50mm)', w: 35, h: 50 }] },
  { country: "Maldives", code: "MV", flag: "\u{1F1F2}\u{1F1FB}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mali", code: "ML", flag: "\u{1F1F2}\u{1F1F1}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Malta", code: "MT", flag: "\u{1F1F2}\u{1F1F9}", w: 40, h: 30, bg: "#ffffff" },
  { country: "Mauritania", code: "MR", flag: "\u{1F1F2}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mauritius", code: "MU", flag: "\u{1F1F2}\u{1F1FA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mexico", code: "MX", flag: "\u{1F1F2}\u{1F1FD}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Mexico Passport (35×45mm)', w: 35, h: 45 }, { name: 'Mexico Visa (35×45mm)', w: 35, h: 45 }, { name: 'Mexico Voter ID (25×30mm)', w: 25, h: 30 }, { name: 'Mexico Driving Licence (25×30mm)', w: 25, h: 30 }, { name: 'Mexico INE Voter ID (35×45mm)', w: 35, h: 45 }, { name: 'Mexico Residence Permit (35×45mm)', w: 35, h: 45 }] },
  { country: "Moldova", code: "MD", flag: "\u{1F1F2}\u{1F1E9}", w: 30, h: 40, bg: "#ffffff" },
  { country: "Mongolia", code: "MN", flag: "\u{1F1F2}\u{1F1F3}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Montenegro", code: "ME", flag: "\u{1F1F2}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Morocco", code: "MA", flag: "\u{1F1F2}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Mozambique", code: "MZ", flag: "\u{1F1F2}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Myanmar", code: "MM", flag: "\u{1F1F2}\u{1F1F2}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Namibia", code: "NA", flag: "\u{1F1F3}\u{1F1E6}", w: 37, h: 52, bg: "#ffffff" },
  { country: "Nepal", code: "NP", flag: "\u{1F1F3}\u{1F1F5}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Netherlands", code: "NL", flag: "\u{1F1F3}\u{1F1F1}", w: 35, h: 45, bg: "#ffffff" },
  { country: "New Zealand", code: "NZ", flag: "\u{1F1F3}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nicaragua", code: "NI", flag: "\u{1F1F3}\u{1F1EE}", w: 40, h: 50, bg: "#ffffff" },
  { country: "Niger", code: "NE", flag: "\u{1F1F3}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Nigeria", code: "NG", flag: "\u{1F1F3}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Nigeria Passport (35×45mm)', w: 35, h: 45 }, { name: 'Nigeria Visa (35×45mm)', w: 35, h: 45 }, { name: 'Nigeria NIN Card (35×45mm)', w: 35, h: 45 }, { name: 'Nigeria Voter Card (35×45mm)', w: 35, h: 45 }, { name: 'Nigeria Driving Licence (35×45mm)', w: 35, h: 45 }] },
  { country: "North Korea", code: "KP", flag: "\u{1F1F0}\u{1F1F5}", w: 35, h: 45, bg: "#ffffff" },
  { country: "North Macedonia", code: "MK", flag: "\u{1F1F2}\u{1F1F0}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Norway", code: "NO", flag: "\u{1F1F3}\u{1F1F4}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Oman", code: "OM", flag: "\u{1F1F4}\u{1F1F2}", w: 40, h: 60, bg: "#ffffff" },
  { country: "Pakistan", code: "PK", flag: "\u{1F1F5}\u{1F1F0}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Pakistan Passport (35×45mm)', w: 35, h: 45 }, { name: 'Pakistan CNIC (35×45mm)', w: 35, h: 45 }, { name: 'Pakistan Visa (35×45mm)', w: 35, h: 45 }, { name: 'Pakistan Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'Pakistan CNIC ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Pakistan NICOP (35×45mm)', w: 35, h: 45 }] },
  { country: "Palestine", code: "PS", flag: "\u{1F1F5}\u{1F1F8}", w: 35, h: 45, bg: "#add8e6" },
  { country: "Panama", code: "PA", flag: "\u{1F1F5}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Papua New Guinea", code: "PG", flag: "\u{1F1F5}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Paraguay", code: "PY", flag: "\u{1F1F5}\u{1F1FE}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Peru", code: "PE", flag: "\u{1F1F5}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Philippines", code: "PH", flag: "\u{1F1F5}\u{1F1ED}", w: 35, h: 45, bg: "#0038a8", docs: [{ name: 'Philippines Passport (35×45mm)', w: 35, h: 45 }, { name: 'Philippines Visa (35×45mm)', w: 35, h: 45 }, { name: 'Philippines ID Card (35×45mm)', w: 35, h: 45 }, { name: 'Philippines Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'Philippines NBI Clearance (35×45mm)', w: 35, h: 45 }, { name: 'Philippines Postal ID (35×45mm)', w: 35, h: 45 }, { name: 'Philippines SSS ID (35×45mm)', w: 35, h: 45 }] },
  { country: "Poland", code: "PL", flag: "\u{1F1F5}\u{1F1F1}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Portugal", code: "PT", flag: "\u{1F1F5}\u{1F1F9}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Qatar", code: "QA", flag: "\u{1F1F6}\u{1F1E6}", w: 38, h: 48, bg: "#ffffff" },
  { country: "Romania", code: "RO", flag: "\u{1F1F7}\u{1F1F4}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Russia", code: "RU", flag: "\u{1F1F7}\u{1F1FA}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Russia Passport (35×45mm)', w: 35, h: 45 }, { name: 'Russia Internal Passport (35×45mm)', w: 35, h: 45 }, { name: 'Russia Visa (35×45mm)', w: 35, h: 45 }, { name: 'Russia Driving Licence (30×40mm)', w: 30, h: 40 }, { name: 'Russia Work Permit (35×45mm)', w: 35, h: 45 }, { name: 'Russia Student Visa (35×45mm)', w: 35, h: 45 }] },
  { country: "Rwanda", code: "RW", flag: "\u{1F1F7}\u{1F1FC}", w: 51, h: 51, bg: "#ffffff" },
  { country: "Saint Kitts and Nevis", code: "KN", flag: "\u{1F1F0}\u{1F1F3}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Samoa", code: "WS", flag: "\u{1F1FC}\u{1F1F8}", w: 45, h: 35, bg: "#ffffff" },
  { country: "Saudi Arabia", code: "SA", flag: "\u{1F1F8}\u{1F1E6}", w: 40, h: 60, bg: "#ffffff", docs: [{ name: 'Saudi Arabia Passport (40×60mm)', w: 40, h: 60 }, { name: 'Saudi Arabia Visa (40×60mm)', w: 40, h: 60 }, { name: 'Saudi Arabia ID Card (40×60mm)', w: 40, h: 60 }, { name: 'Saudi Arabia Driving Licence (40×60mm)', w: 40, h: 60 }, { name: 'Saudi Arabia Iqama Residence Permit (40×60mm)', w: 40, h: 60 }, { name: 'Saudi Arabia Work Visa (40×60mm)', w: 40, h: 60 }] },
  { country: "Senegal", code: "SN", flag: "\u{1F1F8}\u{1F1F3}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Serbia", code: "RS", flag: "\u{1F1F7}\u{1F1F8}", w: 50, h: 50, bg: "#ffffff" },
  { country: "Seychelles", code: "SC", flag: "\u{1F1F8}\u{1F1E8}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sierra Leone", code: "SL", flag: "\u{1F1F8}\u{1F1F1}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Singapore", code: "SG", flag: "\u{1F1F8}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovakia", code: "SK", flag: "\u{1F1F8}\u{1F1F0}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Slovenia", code: "SI", flag: "\u{1F1F8}\u{1F1EE}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Somalia", code: "SO", flag: "\u{1F1F8}\u{1F1F4}", w: 35, h: 45, bg: "#ffffff" },
  { country: "South Africa", code: "ZA", flag: "\u{1F1FF}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'South Africa Passport (35×45mm)', w: 35, h: 45 }, { name: 'South Africa Visa (35×45mm)', w: 35, h: 45 }, { name: 'South Africa ID Card (35×45mm)', w: 35, h: 45 }, { name: 'South Africa Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'South Africa Smart ID Card (35×45mm)', w: 35, h: 45 }, { name: 'South Africa Work Visa (35×45mm)', w: 35, h: 45 }] },
  { country: "South Korea", code: "KR", flag: "\u{1F1F0}\u{1F1F7}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'South Korea Passport (35×45mm)', w: 35, h: 45 }, { name: 'South Korea Visa (35×45mm)', w: 35, h: 45 }, { name: 'South Korea Alien Registration Card (30×40mm)', w: 30, h: 40 }, { name: 'South Korea Driving Licence (35×45mm)', w: 35, h: 45 }] },
  { country: "South Sudan", code: "SS", flag: "\u{1F1F8}\u{1F1F8}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Spain", code: "ES", flag: "\u{1F1EA}\u{1F1F8}", w: 26, h: 32, bg: "#ffffff", docs: [{ name: 'Spain Passport (26×32mm)', w: 26, h: 32 }, { name: 'Spain Visa (26×32mm)', w: 26, h: 32 }, { name: 'Spain ID Card (26×32mm)', w: 26, h: 32 }, { name: 'Spain Driving Licence (26×32mm)', w: 26, h: 32 }] },
  { country: "Sri Lanka", code: "LK", flag: "\u{1F1F1}\u{1F1F0}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sudan", code: "SD", flag: "\u{1F1F8}\u{1F1E9}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Sweden", code: "SE", flag: "\u{1F1F8}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Switzerland", code: "CH", flag: "\u{1F1E8}\u{1F1ED}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Syria", code: "SY", flag: "\u{1F1F8}\u{1F1FE}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Taiwan", code: "TW", flag: "\u{1F1F9}\u{1F1FC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tajikistan", code: "TJ", flag: "\u{1F1F9}\u{1F1EF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Tanzania", code: "TZ", flag: "\u{1F1F9}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Thailand", code: "TH", flag: "\u{1F1F9}\u{1F1ED}", w: 35, h: 45, bg: "#ffffff", docs: [{ name: 'Thailand Passport (35×45mm)', w: 35, h: 45 }, { name: 'Thailand Visa (35×45mm)', w: 35, h: 45 }, { name: 'Thailand ID Card (25×30mm)', w: 25, h: 30 }, { name: 'Thailand Driving Licence (25×30mm)', w: 25, h: 30 }, { name: 'Thailand Work Permit (35×45mm)', w: 35, h: 45 }] },
  { country: "Tunisia", code: "TN", flag: "\u{1F1F9}\u{1F1F3}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Turkey", code: "TR", flag: "\u{1F1F9}\u{1F1F7}", w: 50, h: 60, bg: "#ffffff", docs: [{ name: 'Turkey Passport (50×60mm)', w: 50, h: 60 }, { name: 'Turkey Visa (50×60mm)', w: 50, h: 60 }, { name: 'Turkey ID Card (50×60mm)', w: 50, h: 60 }, { name: 'Turkey Driving Licence (50×60mm)', w: 50, h: 60 }, { name: 'Turkey Residence Permit (50×60mm)', w: 50, h: 60 }, { name: 'Turkey Work Permit (50×60mm)', w: 50, h: 60 }] },
  { country: "Turkmenistan", code: "TM", flag: "\u{1F1F9}\u{1F1F2}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uganda", code: "UG", flag: "\u{1F1FA}\u{1F1EC}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Ukraine", code: "UA", flag: "\u{1F1FA}\u{1F1E6}", w: 35, h: 45, bg: "#ffffff" },
  { country: "United Arab Emirates", code: "AE", flag: "\u{1F1E6}\u{1F1EA}", w: 40, h: 60, bg: "#ffffff", docs: [{ name: 'UAE Passport (40×60mm)', w: 40, h: 60 }, { name: 'UAE Visa (40×60mm)', w: 40, h: 60 }, { name: 'UAE Emirates ID (40×60mm)', w: 40, h: 60 }, { name: 'UAE Driving Licence (40×60mm)', w: 40, h: 60 }, { name: 'UAE Work Permit (40×60mm)', w: 40, h: 60 }, { name: 'UAE Residence Visa (40×60mm)', w: 40, h: 60 }] },
  { country: "United Kingdom", code: "GB", flag: "\u{1F1EC}\u{1F1E7}", w: 35, h: 45, bg: "#d3d3d3", docs: [{ name: 'UK Passport (35×45mm)', w: 35, h: 45 }, { name: 'UK Visa (35×45mm)', w: 35, h: 45 }, { name: 'UK Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'UK ID Card (35×45mm)', w: 35, h: 45 }, { name: 'UK Biometric Residence Permit BRP (35×45mm)', w: 35, h: 45 }, { name: 'UK Provisional Driving Licence (35×45mm)', w: 35, h: 45 }, { name: 'UK Firearms Certificate (35×45mm)', w: 35, h: 45 }] },
  { country: "United States", code: "US", flag: "\u{1F1FA}\u{1F1F8}", w: 51, h: 51, bg: "#ffffff", docs: [{ name: 'US Passport (51×51mm)', w: 51, h: 51 }, { name: 'US Visa (51×51mm)', w: 51, h: 51 }, { name: 'US Green Card (51×51mm)', w: 51, h: 51 }, { name: 'US Citizenship (51×51mm)', w: 51, h: 51 }, { name: "US Driver's License (51×51mm)", w: 51, h: 51 }, { name: 'US Passport Card (51×51mm)', w: 51, h: 51 }, { name: 'US DV Lottery (51×51mm)', w: 51, h: 51 }, { name: 'US Employment Authorization (51×51mm)', w: 51, h: 51 }, { name: 'US Re-entry Permit (51×51mm)', w: 51, h: 51 }, { name: 'US Naturalization/Citizenship (51×51mm)', w: 51, h: 51 }] },
  { country: "Uruguay", code: "UY", flag: "\u{1F1FA}\u{1F1FE}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Uzbekistan", code: "UZ", flag: "\u{1F1FA}\u{1F1FF}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Venezuela", code: "VE", flag: "\u{1F1FB}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Vietnam", code: "VN", flag: "\u{1F1FB}\u{1F1F3}", w: 40, h: 60, bg: "#ffffff", docs: [{ name: 'Vietnam Passport (40×60mm)', w: 40, h: 60 }, { name: 'Vietnam Visa (40×60mm)', w: 40, h: 60 }, { name: 'Vietnam ID Card (30×40mm)', w: 30, h: 40 }, { name: 'Vietnam CCCD ID Card (30×40mm)', w: 30, h: 40 }, { name: 'Vietnam Work Permit (40×60mm)', w: 40, h: 60 }] },
  { country: "Yemen", code: "YE", flag: "\u{1F1FE}\u{1F1EA}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zambia", code: "ZM", flag: "\u{1F1FF}\u{1F1F2}", w: 35, h: 45, bg: "#ffffff" },
  { country: "Zimbabwe", code: "ZW", flag: "\u{1F1FF}\u{1F1FC}", w: 35, h: 45, bg: "#ffffff" },
]

// Add generic docs to countries that don't have specific ones
PASSPORT_COUNTRIES.forEach(c => {
  if (!c.docs) {
    c.docs = [
      { name: c.country + ' Passport (' + c.w + '×' + c.h + 'mm)', w: c.w, h: c.h },
      { name: c.country + ' Visa (' + c.w + '×' + c.h + 'mm)', w: c.w, h: c.h },
      { name: c.country + ' ID Card (' + c.w + '×' + c.h + 'mm)', w: c.w, h: c.h },
    ]
  }
})

// DPI for print-quality output
const DPI = 300
const MM_PER_INCH = 25.4

let selectedCountry = PASSPORT_COUNTRIES.find(c => c.country === 'United States')
let activeW = selectedCountry.w, activeH = selectedCountry.h
let uploadedImg = null
let uploadedFile = null
let bgRemovedImg = null   // bg-removed version of FULL image
let bgWhiteImg = null      // bg-removed with white background filled (used in step 2 & 3)
let croppedImg = null       // the cropped portion from step 2

// Manual crop box state
let cropBox = { x: 0, y: 0, w: 100, h: 100 }
let dragging = null // 'move' | 'nw' | 'ne' | 'sw' | 'se' | null
let dragStart = { mx: 0, my: 0, box: null }
let displayScale = 1 // ratio of display canvas to original image

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:' + bg + ';'
const style = document.createElement('style')
style.textContent = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  #app>div{animation:fadeUp 0.4s ease both}
  .pp-wrap{max-width:900px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif}
  .pp-h1{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:#2C1810;margin:0 0 6px;line-height:1;letter-spacing:-0.02em}
  .pp-h1 em{font-style:italic;color:#C84B31}
  .pp-desc{font-size:13px;color:#7A6A5A;margin:0 0 20px}
  .pp-grid{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start}
  @media(max-width:700px){.pp-grid{grid-template-columns:1fr}}
  .pp-canvas-area{background:transparent;border-radius:12px;overflow:hidden;position:relative;display:none}
  .pp-canvas-area.visible{display:inline-block}
  .pp-dropzone{border:2px dashed #DDD5C8;border-radius:12px;padding:24px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#FAFAF8}
  .pp-dropzone:hover{border-color:#C84B31;background:#FDE8E3}
  .pp-dropzone svg{margin-bottom:8px;color:#C4B8A8}
  .pp-dropzone:hover svg{color:#C84B31}
  .pp-dropzone p{margin:0;font-family:'DM Sans',sans-serif;font-size:14px;color:#9A8A7A}
  .pp-canvas-inner{position:relative;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none;-webkit-user-select:none}
  .pp-canvas-inner canvas{display:block;max-width:100%;height:auto;cursor:crosshair;user-select:none;margin:0 auto}
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
  .pp-crop-hint{font-size:12px;color:#7A6A5A;text-align:center;padding:8px 0;font-family:'DM Sans',sans-serif}
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
.seo-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
  .seo-link{padding:7px 14px;background:#fff;border:1.5px solid #DDD5C8;border-radius:8px;font-size:13px;font-weight:600;color:#2C1810;text-decoration:none;font-family:'DM Sans',sans-serif;transition:all 0.15s}
  .seo-link:hover{border-color:#C84B31;color:#C84B31}
    .seo-section .faq-item { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .seo-section .faq-item h4 { font-family:'Fraunces',serif; font-size:15px; font-weight:700; color:#2C1810; margin:0 0 6px; }
    .seo-section .faq-item p { margin:0; }
`
document.head.appendChild(style)
document.title = t.pp_page_title || 'Passport Photo Maker Free Online \u2014 AI Background Removal for 170+ Countries | RelahConvert'
const metaDesc = document.createElement('meta')
metaDesc.name = 'description'
metaDesc.content = t.pp_meta_desc || 'Make passport photos at home free. AI white background removal, auto-size to official 2x2, 35x45mm and 51x51mm dimensions for 170+ countries. Download or print 4x6 sheet. No watermark.'
document.head.appendChild(metaDesc)
const metaKeywords = document.createElement('meta')
metaKeywords.name = 'keywords'
metaKeywords.content = 'passport photo maker, passport photo online free, passport size photo, passport photo app, visa photo maker, ID photo maker, passport photo background removal, passport photo white background, 2x2 passport photo, 35x45mm passport photo, make passport photo at home, free passport photo no watermark, US passport photo, UK passport photo, passport photo requirements, passport photo near me alternative'
document.head.appendChild(metaKeywords)

document.querySelector('#app').innerHTML = `
  <div class="pp-wrap">
    <h1 class="pp-h1">${h1Main} <em>${h1Em}</em></h1>
    <p class="pp-desc">${descText}</p>

    <!-- Step 1: Upload & Background Removal -->
    <div id="step1">
      <div id="step1Top" style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
        <div id="dropZone" class="pp-dropzone" style="flex-shrink:0;width:220px;padding:16px">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="14" y="16" width="28" height="22" rx="3" stroke="currentColor" stroke-width="2" fill="#fff" opacity="0.85"/><path d="M28 30v-8m0 0l-3.5 3.5M28 22l3.5 3.5" stroke="#C84B31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p style="font-size:12px">${t.pp_drop || 'Upload a portrait photo'}</p>
          <button class="pp-upload-btn" style="margin-top:8px;width:auto;display:inline-flex;font-size:12px;padding:8px 16px"><span style="font-size:14px">+</span> ${selectLbl}</button>
        </div>
        <div id="heroSection" style="flex:1;min-width:300px;max-width:500px">
          <video autoplay loop muted playsinline style="width:100%;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
            <source src="/passport-demo.mp4" type="video/mp4" />
          </video>
          <p style="font-size:11px;color:#9A8A7A;text-align:center;margin:6px 0 0">${t.pp_demo_label || 'See how it works'}</p>
        </div>
      </div>
      <input type="file" id="fileInput" accept="image/*" style="display:none" />
      <div id="processingArea" style="display:none;max-width:500px">
        <div style="position:relative;display:inline-block">
          <canvas id="uploadPreview" style="max-width:500px;border-radius:12px;display:block"></canvas>
          <div id="loadingOverlay" style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;gap:8px">
            <div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite"></div>
            <span id="progressText" style="color:#fff;font-size:14px;font-weight:600">${t.pp_removing_bg || 'Removing background...'} 0%</span>
          </div>
        </div>
        <div id="step1Error" style="display:none;color:#C84B31;font-size:13px;text-align:center;margin-top:8px"></div>
        <button class="pp-upload-btn" id="step1NextBtn" style="display:none;margin:12px auto;width:auto;padding:10px 28px">Next \u2192</button>
      </div>
    </div>

    <!-- Step 2: Crop -->
    <div id="step2" style="display:none">
      <div class="pp-canvas-area visible">
        <div class="pp-canvas-inner" id="canvasWrap">
          <canvas id="cropCanvas"></canvas>
        </div>
        <div class="pp-crop-hint">${ppRepositionLbl}</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button class="pp-next-btn" id="step2BackBtn">\u2190 Back</button>
        <button class="pp-upload-btn" id="step2NextBtn" style="width:auto;padding:10px 28px">Next \u2192</button>
      </div>
    </div>

    <!-- Step 3: Country & Download -->
    <div id="step3" style="display:none">
      <div class="pp-grid">
        <div>
          <div style="text-align:center">
            <canvas id="finalPreview" style="max-width:100%;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.1)"></canvas>
          </div>
        </div>
        <div class="pp-panel">
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
              <option value="passport">${ppPassportLbl} (${selectedCountry.w}\u00d7${selectedCountry.h}mm)</option>
            </select>
            <div class="pp-size-info" id="sizeInfo">${ppSizeLbl}: ${selectedCountry.w}\u00d7${selectedCountry.h} mm</div>
            <input type="hidden" id="bgColor" value="#ffffff" />
          </div>
          <div class="pp-card" id="downloadCard">
            <button class="pp-dl-btn pp-dl-primary" id="dlPhoto">${ppDownloadLbl}</button>
            <button class="pp-dl-btn pp-dl-secondary" id="dlSheet">${ppPrintSheetLbl}</button>
          </div>
          <button class="pp-next-btn" id="step3BackBtn" style="margin-top:4px">\u2190 Back</button>
          <div id="nextSteps" style="display:none" class="pp-next">
            <div class="pp-next-label">${t.whats_next || "What's Next?"}</div>
            <div class="pp-next-btns" id="nextBtns"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`

injectHeader()

// ---- DOM refs ----
const fileInput      = document.getElementById('fileInput')
const dropZoneEl     = document.getElementById('dropZone')
const processingArea = document.getElementById('processingArea')
const uploadPreview  = document.getElementById('uploadPreview')
const uploadPreviewCtx = uploadPreview.getContext('2d')
const loadingOverlay = document.getElementById('loadingOverlay')
const step1Error     = document.getElementById('step1Error')
const step1NextBtn   = document.getElementById('step1NextBtn')

const step1El        = document.getElementById('step1')
const step2El        = document.getElementById('step2')
const step3El        = document.getElementById('step3')

const canvasWrap     = document.getElementById('canvasWrap')
const cropCanvas     = document.getElementById('cropCanvas')
const ctx            = cropCanvas.getContext('2d')
const step2BackBtn   = document.getElementById('step2BackBtn')
const step2NextBtn   = document.getElementById('step2NextBtn')

const finalPreview   = document.getElementById('finalPreview')
const finalPreviewCtx = finalPreview.getContext('2d')
const countryTrigger = document.getElementById('countryTrigger')
const countryDropdown = document.getElementById('countryDropdown')
const countrySearch  = document.getElementById('countrySearch')
const countryList    = document.getElementById('countryList')
const countryNameEl  = document.getElementById('countryName')
const sizeInfo       = document.getElementById('sizeInfo')
const bgColorInput   = document.getElementById('bgColor')
const downloadCard   = document.getElementById('downloadCard')
const dlPhoto        = document.getElementById('dlPhoto')
const dlSheet        = document.getElementById('dlSheet')
const nextSteps      = document.getElementById('nextSteps')
const nextBtns       = document.getElementById('nextBtns')
const docTypeSelect  = document.getElementById('docTypeSelect')
const triggerFlag    = document.getElementById('triggerFlag')
const step3BackBtn   = document.getElementById('step3BackBtn')

// ---- Step navigation ----

function showStep(n) {
  step1El.style.display = n === 1 ? '' : 'none'
  step2El.style.display = n === 2 ? '' : 'none'
  step3El.style.display = n === 3 ? '' : 'none'
}

// ---- Step 1: Upload & Background Removal ----

function drawUploadPreview(img) {
  const maxW = 500
  const scale = Math.min(maxW / img.naturalWidth, maxW / img.naturalHeight, 1)
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  uploadPreview.width = w
  uploadPreview.height = h
  uploadPreviewCtx.drawImage(img, 0, 0, w, h)
}

function applyMaskToOriginal(originalImg, maskBlob) {
  return new Promise(resolve => {
    const maskImg = new Image()
    maskImg.onload = () => {
      const W = originalImg.naturalWidth, H = originalImg.naturalHeight
      // Draw original at full resolution
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const ctx = c.getContext('2d')
      ctx.drawImage(originalImg, 0, 0)
      const origData = ctx.getImageData(0, 0, W, H)

      // Draw mask scaled up to original dimensions to extract alpha
      const mc = document.createElement('canvas')
      mc.width = W; mc.height = H
      const mctx = mc.getContext('2d')
      mctx.drawImage(maskImg, 0, 0, W, H)
      const maskData = mctx.getImageData(0, 0, W, H)

      // Apply mask alpha to original pixels
      const src = origData.data, m = maskData.data
      for (let i = 3; i < src.length; i += 4) {
        src[i] = m[i]
      }
      ctx.putImageData(origData, 0, 0)
      c.toBlob(blob => resolve(blob), 'image/png')
    }
    maskImg.src = URL.createObjectURL(maskBlob)
  })
}

function drawBgWhiteImage(sourceImg) {
  const c = document.createElement('canvas')
  c.width = sourceImg.naturalWidth
  c.height = sourceImg.naturalHeight
  const cctx = c.getContext('2d')
  cctx.fillStyle = '#ffffff'
  cctx.fillRect(0, 0, c.width, c.height)
  cctx.drawImage(sourceImg, 0, 0)
  return new Promise(resolve => {
    c.toBlob(blob => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = URL.createObjectURL(blob)
    }, 'image/png')
  })
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  uploadedFile = file
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = async () => {
    uploadedImg = img
    bgRemovedImg = null
    bgWhiteImg = null
    croppedImg = null

    // Show processing area, hide dropzone and hero
    document.getElementById('step1Top').style.display = 'none'
    processingArea.style.display = ''
    step1NextBtn.style.display = 'none'
    step1Error.style.display = 'none'
    loadingOverlay.style.display = 'flex'
    loadingOverlay.querySelector('span').textContent = t.pp_removing_bg || 'Removing background...'

    // Draw uploaded image as preview
    drawUploadPreview(img)

    try {
      const progressText = document.getElementById('progressText')
      const bgLabel = t.pp_removing_bg || 'Removing background...'
      progressText.textContent = bgLabel

      // Use server-side Remove.bg API for high-quality background removal
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/remove-bg', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('API returned ' + response.status)
      const resultBlob = await response.blob()

      // Apply the Remove.bg mask to the original full-res image
      // (free tier returns low-res; this preserves original sharpness)
      const hiResBlob = await applyMaskToOriginal(img, resultBlob)

      progressText.textContent = bgLabel + ' 100%'
      const bgImg = new Image()
      bgImg.onload = async () => {
        bgRemovedImg = bgImg
        bgWhiteImg = await drawBgWhiteImage(bgImg)
        drawUploadPreview(bgWhiteImg)
        loadingOverlay.style.display = 'none'
        step1NextBtn.style.display = ''
      }
      bgImg.onerror = () => {
        bgRemovedImg = null
        bgWhiteImg = null
        loadingOverlay.style.display = 'none'
        step1Error.style.display = ''
        step1Error.textContent = t.pp_bg_failed || 'Background removal failed \u2014 using original photo.'
        step1NextBtn.style.display = ''
      }
      bgImg.src = URL.createObjectURL(hiResBlob)
    } catch (err) {
      console.error('Background removal failed:', err)
      bgRemovedImg = null
      bgWhiteImg = null
      loadingOverlay.style.display = 'none'
      step1Error.style.display = ''
      step1Error.textContent = t.pp_bg_failed || 'Background removal failed \u2014 using original photo.'
      step1NextBtn.style.display = ''
    }
  }
  img.src = url
}

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

step1NextBtn.addEventListener('click', () => {
  // Go to Step 2: Crop
  showStep(2)
  initCropBox()
  renderCropCanvas()
})

// ---- Step 2: Crop ----

function getCropSourceImg() {
  // Use white-bg image if available, otherwise original
  return bgWhiteImg || uploadedImg
}

function initCropBox() {
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return
  const imgW = sourceImg.naturalWidth
  const imgH = sourceImg.naturalHeight

  // FREE aspect ratio — default to 80% of image centered
  let bw = imgW * 0.8
  let bh = imgH * 0.8
  cropBox.w = bw
  cropBox.h = bh
  cropBox.x = (imgW - bw) / 2
  cropBox.y = (imgH - bh) / 2
}

function renderCropCanvas() {
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return

  const imgW = sourceImg.naturalWidth
  const imgH = sourceImg.naturalHeight
  const maxW = 500
  const scale = Math.min(maxW / imgW, maxW / imgH, 1)
  const dispW = Math.round(imgW * scale)
  const dispH = Math.round(imgH * scale)
  displayScale = scale

  cropCanvas.width = dispW
  cropCanvas.height = dispH
  canvasWrap.style.maxWidth = dispW + 'px'

  // 1. Draw full image
  ctx.drawImage(sourceImg, 0, 0, dispW, dispH)

  // 2. Draw semi-transparent dark overlay over entire canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.fillRect(0, 0, dispW, dispH)

  // 3. Clear overlay inside crop box (show image through)
  const bx = Math.round(cropBox.x * scale)
  const by = Math.round(cropBox.y * scale)
  const bw = Math.round(cropBox.w * scale)
  const bh = Math.round(cropBox.h * scale)

  ctx.save()
  ctx.beginPath()
  ctx.rect(bx, by, bw, bh)
  ctx.clip()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(bx, by, bw, bh)
  ctx.drawImage(sourceImg, 0, 0, dispW, dispH)
  ctx.restore()

  // 4. Draw dashed border around crop box
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(bx, by, bw, bh)
  ctx.setLineDash([])

  // 5. Draw corner handles
  const hs = 8 // handle size
  ctx.fillStyle = '#C84B31'
  // NW
  ctx.fillRect(bx - hs / 2, by - hs / 2, hs, hs)
  // NE
  ctx.fillRect(bx + bw - hs / 2, by - hs / 2, hs, hs)
  // SW
  ctx.fillRect(bx - hs / 2, by + bh - hs / 2, hs, hs)
  // SE
  ctx.fillRect(bx + bw - hs / 2, by + bh - hs / 2, hs, hs)
}

// ---- Mouse / touch interaction for crop canvas ----

function getCanvasPos(e) {
  const rect = cropCanvas.getBoundingClientRect()
  const scaleX = cropCanvas.width / rect.width
  const scaleY = cropCanvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function hitTest(pos) {
  const scale = displayScale
  const bx = cropBox.x * scale
  const by = cropBox.y * scale
  const bw = cropBox.w * scale
  const bh = cropBox.h * scale
  const hs = 12 // hit area for handles

  // Check corners
  if (Math.abs(pos.x - bx) < hs && Math.abs(pos.y - by) < hs) return 'nw'
  if (Math.abs(pos.x - (bx + bw)) < hs && Math.abs(pos.y - by) < hs) return 'ne'
  if (Math.abs(pos.x - bx) < hs && Math.abs(pos.y - (by + bh)) < hs) return 'sw'
  if (Math.abs(pos.x - (bx + bw)) < hs && Math.abs(pos.y - (by + bh)) < hs) return 'se'

  // Check inside box
  if (pos.x >= bx && pos.x <= bx + bw && pos.y >= by && pos.y <= by + bh) return 'move'

  return null
}

function clampCropBox() {
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return
  const imgW = sourceImg.naturalWidth
  const imgH = sourceImg.naturalHeight
  // Clamp size
  if (cropBox.w > imgW) cropBox.w = imgW
  if (cropBox.h > imgH) cropBox.h = imgH
  if (cropBox.w < 20) cropBox.w = 20
  if (cropBox.h < 20) cropBox.h = 20
  // Clamp position
  if (cropBox.x < 0) cropBox.x = 0
  if (cropBox.y < 0) cropBox.y = 0
  if (cropBox.x + cropBox.w > imgW) cropBox.x = imgW - cropBox.w
  if (cropBox.y + cropBox.h > imgH) cropBox.y = imgH - cropBox.h
}

cropCanvas.addEventListener('mousedown', (e) => {
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return
  e.preventDefault()
  const pos = getCanvasPos(e)
  const hit = hitTest(pos)
  if (!hit) return
  dragging = hit
  dragStart = { mx: pos.x, my: pos.y, box: { ...cropBox } }
  cropCanvas.style.cursor = hit === 'move' ? 'grabbing' : 'nwse-resize'
})

window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return
  e.preventDefault()
  const pos = getCanvasPos(e)
  const dx = (pos.x - dragStart.mx) / displayScale
  const dy = (pos.y - dragStart.my) / displayScale
  const orig = dragStart.box

  if (dragging === 'move') {
    cropBox.x = orig.x + dx
    cropBox.y = orig.y + dy
    cropBox.w = orig.w
    cropBox.h = orig.h
  } else {
    // Corner resize — FREE aspect ratio (no lock)
    let fixedX, fixedY
    if (dragging === 'nw') { fixedX = orig.x + orig.w; fixedY = orig.y + orig.h }
    else if (dragging === 'ne') { fixedX = orig.x; fixedY = orig.y + orig.h }
    else if (dragging === 'sw') { fixedX = orig.x + orig.w; fixedY = orig.y }
    else { fixedX = orig.x; fixedY = orig.y } // se

    let draggedX, draggedY
    if (dragging === 'nw') { draggedX = orig.x + dx; draggedY = orig.y + dy }
    else if (dragging === 'ne') { draggedX = orig.x + orig.w + dx; draggedY = orig.y + dy }
    else if (dragging === 'sw') { draggedX = orig.x + dx; draggedY = orig.y + orig.h + dy }
    else { draggedX = orig.x + orig.w + dx; draggedY = orig.y + orig.h + dy }

    // Free aspect ratio: width and height move independently
    let newW = Math.abs(draggedX - fixedX)
    let newH = Math.abs(draggedY - fixedY)

    if (newW < 20) newW = 20
    if (newH < 20) newH = 20

    cropBox.w = newW
    cropBox.h = newH
    if (draggedX < fixedX) { cropBox.x = fixedX - newW } else { cropBox.x = fixedX }
    if (draggedY < fixedY) { cropBox.y = fixedY - newH } else { cropBox.y = fixedY }
  }

  clampCropBox()
  renderCropCanvas()
})

window.addEventListener('mouseup', () => {
  if (dragging) {
    dragging = null
    cropCanvas.style.cursor = 'crosshair'
  }
})

// Update cursor on hover
cropCanvas.addEventListener('mousemove', (e) => {
  if (dragging) return
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return
  const pos = getCanvasPos(e)
  const hit = hitTest(pos)
  if (hit === 'move') cropCanvas.style.cursor = 'grab'
  else if (hit) cropCanvas.style.cursor = 'nwse-resize'
  else cropCanvas.style.cursor = 'crosshair'
})

// Touch support
function touchToMouse(type) {
  return function(e) {
    if (e.touches.length !== 1) return
    const touch = e.touches[0] || e.changedTouches[0]
    const mouseEvent = new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true
    })
    if (type === 'mousedown') {
      cropCanvas.dispatchEvent(mouseEvent)
    } else {
      window.dispatchEvent(mouseEvent)
    }
    if (dragging) e.preventDefault()
  }
}
cropCanvas.addEventListener('touchstart', touchToMouse('mousedown'), { passive: false })
window.addEventListener('touchmove', touchToMouse('mousemove'), { passive: false })
window.addEventListener('touchend', (e) => {
  const mouseEvent = new MouseEvent('mouseup', { bubbles: true })
  window.dispatchEvent(mouseEvent)
})

step2BackBtn.addEventListener('click', () => {
  showStep(1)
})

step2NextBtn.addEventListener('click', () => {
  // Apply crop: extract the cropped region from the white-bg image
  const sourceImg = getCropSourceImg()
  if (!sourceImg) return

  const c = document.createElement('canvas')
  c.width = Math.round(cropBox.w)
  c.height = Math.round(cropBox.h)
  const cctx = c.getContext('2d')
  cctx.drawImage(sourceImg, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, c.width, c.height)

  // Convert to image for step 3 — use blob to preserve quality
  c.toBlob(blob => {
    const img = new Image()
    img.onload = () => {
      croppedImg = img
      showStep(3)
      updateDocTypes()
      generateAndShowPreview()
      buildNextSteps()
    }
    img.src = URL.createObjectURL(blob)
  }, 'image/png')
})

// ---- Step 3: Country Selection & Download ----

function flagUrl(code, size) { return 'https://flagcdn.com/w' + (size || 40) + '/' + code.toLowerCase() + '.png' }

function generatePhoto() {
  const wPx = Math.round(activeW / MM_PER_INCH * DPI)
  const hPx = Math.round(activeH / MM_PER_INCH * DPI)
  const out = document.createElement('canvas')
  out.width = wPx; out.height = hPx
  const octx = out.getContext('2d')
  octx.fillStyle = selectedCountry.bg || '#ffffff'
  octx.fillRect(0, 0, wPx, hPx)
  if (croppedImg) {
    // Cover-fill: scale to fill width, align bottom, crop overflow at top
    const cropAspect = croppedImg.naturalWidth / croppedImg.naturalHeight
    const outAspect = wPx / hPx
    let dw, dh, dx, dy
    if (cropAspect > outAspect) {
      // Crop is wider than output — fill height, center horizontally
      dh = hPx; dw = hPx * cropAspect; dx = (wPx - dw) / 2; dy = 0
    } else {
      // Crop is taller than output — fill width, align bottom
      dw = wPx; dh = wPx / cropAspect; dx = 0; dy = hPx - dh
    }
    octx.drawImage(croppedImg, dx, dy, dw, dh)
  }
  return out
}

function generateAndShowPreview() {
  const photoCanvas = generatePhoto()
  const aspect = activeW / activeH
  const prevW = 300
  const prevH = Math.round(prevW / aspect)
  finalPreview.width = prevW
  finalPreview.height = prevH
  finalPreviewCtx.drawImage(photoCanvas, 0, 0, prevW, prevH)
}

function updateDocTypes() {
  const c = selectedCountry
  const docs = c.docs || [{ name: c.country + ' Passport (' + c.w + '\u00d7' + c.h + 'mm)', w: c.w, h: c.h }]
  docTypeSelect.innerHTML = docs.map((d, i) =>
    '<option value="' + i + '">' + d.name + '</option>'
  ).join('')
  docTypeSelect.value = '0'
  activeW = docs[0].w; activeH = docs[0].h
  sizeInfo.textContent = ppSizeLbl + ': ' + activeW + '\u00d7' + activeH + ' mm'
  if (uploadedImg) { initCropBox(); renderCropCanvas() }
}

docTypeSelect.addEventListener('change', () => {
  const docs = selectedCountry.docs || [{ w: selectedCountry.w, h: selectedCountry.h }]
  const idx = parseInt(docTypeSelect.value) || 0
  const doc = docs[idx] || docs[0]
  activeW = doc.w; activeH = doc.h
  sizeInfo.textContent = ppSizeLbl + ': ' + activeW + '\u00d7' + activeH + ' mm'
  // Re-render preview if on step 3 with a cropped image
  if (step3El.style.display !== 'none' && croppedImg) {
    try { generateAndShowPreview() } catch(e) {}
  }
  if (uploadedImg) { initCropBox() }
  renderCropCanvas()
})

function renderCountryList(filter) {
  const q = (filter || '').toLowerCase()
  const filtered = PASSPORT_COUNTRIES.filter(c => c.country.toLowerCase().indexOf(q) !== -1)
  countryList.innerHTML = filtered.map(c =>
    '<div class="pp-dropdown-item' + (c.country === selectedCountry.country ? ' active' : '') + '" data-country="' + c.country + '">' +
    '<img class="flag-img" src="' + flagUrl(c.code, 40) + '" alt="' + c.code + '" />' +
    '<span>' + c.country + '</span>' +
    '<span class="size">' + c.w + '\u00d7' + c.h + 'mm</span></div>'
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
      if (croppedImg) generateAndShowPreview()
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

dlPhoto.addEventListener('click', () => {
  const photoCanvas = generatePhoto()
  photoCanvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passport-photo-' + selectedCountry.country.toLowerCase().replace(/\s+/g, '-') + '.jpg'
    a.click();if(window.showReviewPrompt)window.showReviewPrompt()
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
    a.click();if(window.showReviewPrompt)window.showReviewPrompt()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, 'image/jpeg', 0.95)
})

step3BackBtn.addEventListener('click', () => {
  showStep(2)
  renderCropCanvas()
})

// ---- IndexedDB helpers ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('relahconvert', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('pending', { keyPath: 'id' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(new Error('IndexedDB open failed'))
  })
}
async function saveFilesToIDB(files) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite')
    const store = tx.objectStore('pending')
    store.clear()
    files.forEach((f, i) => store.put({ id: i, blob: f.blob, name: f.name, type: f.type }))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('IDB write failed'))
  })
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
    const file = new File([records[0].blob], records[0].name, { type: records[0].type })
    handleFile(file)
  } catch (e) {}
}

function buildNextSteps() {
  const ns = t.nav_short || {}
  const buttons = [
    { label: ns.resize || 'Resize', href: localHref('resize') },
    { label: ns.compress || 'Compress', href: localHref('compress') },
  ]
  nextBtns.innerHTML = ''
  buttons.forEach(b => {
    const btn = document.createElement('button')
    btn.className = 'pp-next-btn'
    btn.textContent = b.label
    btn.addEventListener('click', async () => {
      // Save final photo to IDB so next tool auto-loads it
      try {
        const photoCanvas = generatePhoto()
        const blob = await new Promise(res => photoCanvas.toBlob(res, 'image/jpeg', 0.95))
        if (blob) {
          await saveFilesToIDB([{ blob, name: 'passport-photo.jpg', type: 'image/jpeg' }])
          sessionStorage.setItem('pendingFromIDB', '1')
        }
      } catch (e) {}
      window.location.href = b.href
    })
    nextBtns.appendChild(btn)
  })
  nextSteps.style.display = ''
}

// ---- Init ----
renderCountryList('')
updateDocTypes()
showStep(1)
loadPendingFiles()

// ---- SEO section (always visible at bottom) ----
;(function injectSEO() {
  const seo = t.seo && t.seo['passport-photo']
  if (!seo) return
  const faqTitle = t.seo_faq_title || 'Frequently Asked Questions'
  const alsoTry  = t.seo_also_try  || 'Also Try'
  const div = document.createElement('div')
  div.className = 'seo-section'
  injectFaqSchema(seo.faqs)
  div.innerHTML = '<h2>' + seo.h2a + '</h2><ol>' + seo.steps.map(function(s){return '<li>' + s + '</li>'}).join('') + '</ol><h2>' + seo.h2b + '</h2>' + seo.body + '<h3>' + seo.h3why + '</h3><p>' + seo.why + '</p><h3>' + faqTitle + '</h3>' + seo.faqs.map(function(f){return '<div class="faq-item"><h4>' + f.q + '</h4><p>' + f.a + '</p></div>'}).join('') + '<h3>' + alsoTry + '</h3><div class="seo-links">' + seo.links.map(function(l){return '<a class="seo-link" href="' + localHref(l.href.slice(1)) + '">' + l.label + '</a>'}).join('') + '</div>'
  document.querySelector('#app').appendChild(div)
})()