/**
 * patch-revoke.js
 * Run from your project root: node patch-revoke.js
 *
 * What it does to every .js file in src/tools/:
 *  1. Preview <img> tags — adds onload="URL.revokeObjectURL(this.src)" if missing
 *  2. Single download links — revokes URL after click
 *  3. ZIP download — revokes URL after click + sets compression: "STORE"
 */

const fs   = require('fs')
const path = require('path')

const TOOLS_DIR = path.join(__dirname, 'src', 'tools')
const files = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith('.js'))

let totalPatched = 0

files.forEach(filename => {
  const filepath = path.join(TOOLS_DIR, filename)
  let src = fs.readFileSync(filepath, 'utf8')
  let changes = []

  // ── 1. Preview img tags: add revokeObjectURL onload ──────────────────────
  // Matches: <img src="${url}" ... /> but only if onload revoke is NOT already there
  const imgTagRegex = /(<img\s+src="\$\{url\}"[^>]*?)(\/?>)/g
  const newSrc1 = src.replace(imgTagRegex, (match, before, end) => {
    if (match.includes('revokeObjectURL')) return match // already patched
    changes.push('preview img revoke')
    // Insert onload just before the closing > or />
    return `${before} onload="URL.revokeObjectURL(this.src)" ${end}`
  })
  src = newSrc1

  // ── 2. Single-file download: revoke after click ───────────────────────────
  // Pattern: a.href = URL.createObjectURL(...)\n  a.download = ...\n  a.click()
  // We add URL.revokeObjectURL(a.href) after a.click()
  const singleDlRegex = /(a\.href\s*=\s*URL\.createObjectURL\([^)]+\)[\s\S]*?a\.click\(\))/g
  const newSrc2 = src.replace(singleDlRegex, (match) => {
    if (match.includes('revokeObjectURL')) return match // already patched
    changes.push('single download revoke')
    return match + '\n    URL.revokeObjectURL(a.href)'
  })
  src = newSrc2

  // ── 3. ZIP download: revoke after click ───────────────────────────────────
  // Pattern: a.href = URL.createObjectURL(zipBlob)\n  ...\n  a.click()
  const zipDlRegex = /(a\.href\s*=\s*URL\.createObjectURL\(zipBlob\)[\s\S]*?a\.click\(\))/g
  const newSrc3 = src.replace(zipDlRegex, (match) => {
    if (match.includes('revokeObjectURL')) return match
    changes.push('zip download revoke')
    return match + '\n    URL.revokeObjectURL(a.href)'
  })
  src = newSrc3

  // ── 4. ZIP compression: set to STORE ─────────────────────────────────────
  // Pattern: zip.generateAsync({ type: 'blob' })  or  { type:"blob" }
  // We add compression:'STORE' if not already set
  const zipGenRegex = /(zip\.generateAsync\(\{)([^}]*?)(type\s*:\s*['"]blob['"])/g
  const newSrc4 = src.replace(zipGenRegex, (match, open, middle, typeClause) => {
    if (match.includes('compression')) return match // already set
    changes.push('zip STORE compression')
    return `${open}${middle}${typeClause}, compression: 'STORE'`
  })
  src = newSrc4

  // ── Write back only if changed ────────────────────────────────────────────
  if (changes.length > 0) {
    fs.writeFileSync(filepath, src, 'utf8')
    console.log(`✅ ${filename} — [${[...new Set(changes)].join(', ')}]`)
    totalPatched++
  } else {
    console.log(`⬜ ${filename} — already clean`)
  }
})

console.log(`\nDone. ${totalPatched}/${files.length} files patched.`)