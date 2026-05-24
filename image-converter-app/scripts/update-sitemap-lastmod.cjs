// Pre-build script: sync sitemap.xml <lastmod> dates with real git history.
//
// For each <url> block, finds the source file that backs the URL and reads
// its most recent commit date via `git log -1 --format=%cs`. That date is
// written into the URL's <lastmod> tag.
//
// URL mapping rules:
//   1. EN canonical URL is found via the <xhtml:link rel="alternate"
//      hreflang="en" href="..."> inside the block. (Each language variant
//      of the same tool gets the same date as the EN version.)
//   2. The slug is extracted from the EN URL.
//   3. Source file candidates checked, in order:
//        - src/tools/<slug>.js
//        - src/<slug>.js
//   4. If no source file is found (homepage, static pages like /about,
//      /privacy-policy, /terms, /cookies, /pdf-tools), fall back to the
//      "latest commit touching src/ or public/" date. This still gives
//      Google a meaningful freshness signal on every deploy.
//
// Runs as `prebuild` in package.json so `npm run build` triggers it
// before vite copies public/ to dist/.

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const APP_ROOT = path.resolve(__dirname, '..') // .../image-converter-app
const REPO_ROOT = path.resolve(APP_ROOT, '..')  // .../image-converter
const SITEMAP_PATH = path.join(APP_ROOT, 'public', 'sitemap.xml')

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
  } catch (_) {
    return ''
  }
}

// Fallback: most recent commit touching website source. Used when a URL
// doesn't map cleanly to one source file (homepage, static pages, etc.).
const FALLBACK_DATE =
  git('log -1 --format=%cs -- image-converter-app/src image-converter-app/public image-converter-app/index.html') ||
  new Date().toISOString().slice(0, 10)

// Memoized lookup: slug -> resolved source file (repo-relative) or null
const fileForSlug = new Map()
function findSourceFile(slug) {
  if (fileForSlug.has(slug)) return fileForSlug.get(slug)
  const candidates = [
    `image-converter-app/src/tools/${slug}.js`,
    `image-converter-app/src/${slug}.js`,
  ]
  for (const rel of candidates) {
    if (fs.existsSync(path.join(REPO_ROOT, rel))) {
      fileForSlug.set(slug, rel)
      return rel
    }
  }
  fileForSlug.set(slug, null)
  return null
}

// Memoized lookup: file -> last commit date
const dateForFile = new Map()
function lastCommitDate(file) {
  if (dateForFile.has(file)) return dateForFile.get(file)
  const date = git(`log -1 --format=%cs -- "${file}"`)
  dateForFile.set(file, date)
  return date
}

function extractSlugFromEnUrl(url) {
  // https://relahconvert.com/word-to-excel   -> word-to-excel
  // https://relahconvert.com/                 -> '' (homepage)
  const m = url.match(/^https:\/\/relahconvert\.com\/?([^?#]*?)\/?$/)
  return m ? m[1] : ''
}

function dateForUrlBlock(inner) {
  const enMatch = inner.match(/<xhtml:link\s+rel="alternate"\s+hreflang="en"\s+href="([^"]+)"/)
  if (!enMatch) return FALLBACK_DATE
  const slug = extractSlugFromEnUrl(enMatch[1])
  if (!slug) return FALLBACK_DATE // homepage
  const file = findSourceFile(slug)
  if (!file) return FALLBACK_DATE // static page or unknown
  return lastCommitDate(file) || FALLBACK_DATE
}

function run() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.warn(`[sitemap-lastmod] sitemap not found at ${SITEMAP_PATH} — skipping`)
    return
  }

  let src = fs.readFileSync(SITEMAP_PATH, 'utf8')

  let total = 0
  let perFile = 0
  let fallback = 0

  src = src.replace(/<url>\s*([\s\S]*?)\s*<\/url>/g, (block, inner) => {
    total++
    const date = dateForUrlBlock(inner)
    if (date === FALLBACK_DATE) fallback++; else perFile++

    let newInner
    if (inner.includes('<lastmod>')) {
      newInner = inner.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${date}</lastmod>`)
    } else {
      newInner = inner.replace(/(<loc>[^<]+<\/loc>)/, `$1\n    <lastmod>${date}</lastmod>`)
    }
    return `<url>\n    ${newInner}\n  </url>`
  })

  fs.writeFileSync(SITEMAP_PATH, src, 'utf8')
  console.log(`[sitemap-lastmod] ${total} URLs processed`)
  console.log(`[sitemap-lastmod]   per-file dates: ${perFile}`)
  console.log(`[sitemap-lastmod]   fallback to overall (${FALLBACK_DATE}): ${fallback}`)
}

run()
