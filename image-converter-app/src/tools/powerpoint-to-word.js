// PowerPoint → Word tool: fully browser-side conversion. A .pptx is a
// zip of XML files; JSZip unpacks it, DOMParser reads each slide's XML,
// and we extract paragraph text plus table content into a structured
// Word doc with a heading per slide. No CloudConvert call, runs in
// under a second per slide deck.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'
import JSZip from 'jszip'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from 'docx'

const DRAWINGML_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'

// Extract joined text from an <a:p> paragraph node (all child <a:t> runs).
function paragraphText(pNode) {
  const ts = pNode.getElementsByTagNameNS(DRAWINGML_NS, 't')
  let out = ''
  for (const t of Array.from(ts)) out += t.textContent || ''
  return out.trim()
}

// Walk a <a:tbl> table node, returning rows of cell-text arrays.
function extractTable(tblNode) {
  const rows = []
  const trs = tblNode.getElementsByTagNameNS(DRAWINGML_NS, 'tr')
  for (const tr of Array.from(trs)) {
    const tcs = tr.getElementsByTagNameNS(DRAWINGML_NS, 'tc')
    const row = []
    for (const tc of Array.from(tcs)) {
      const ps = tc.getElementsByTagNameNS(DRAWINGML_NS, 'p')
      const text = Array.from(ps).map(paragraphText).filter(Boolean).join(' ')
      row.push(text)
    }
    if (row.length) rows.push(row)
  }
  return rows
}

async function convertPptxToDocxBlob(file) {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const ai = parseInt(a.match(/slide(\d+)\.xml$/)[1], 10)
      const bi = parseInt(b.match(/slide(\d+)\.xml$/)[1], 10)
      return ai - bi
    })

  if (slideFiles.length === 0) {
    const e = new Error('not a valid pptx — no slides found')
    e.errCode = 'file_corrupted'
    throw e
  }

  const parser = new DOMParser()
  const sectionChildren = []

  for (let i = 0; i < slideFiles.length; i++) {
    const xmlText = await zip.files[slideFiles[i]].async('string')
    const xml = parser.parseFromString(xmlText, 'application/xml')

    sectionChildren.push(new Paragraph({
      text: `Slide ${i + 1}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: i === 0 ? 0 : 280, after: 140 },
    }))

    // Tables — extract structure-preserving rows.
    const tableNodes = Array.from(xml.getElementsByTagNameNS(DRAWINGML_NS, 'tbl'))
    const seenTextNodes = new Set()
    for (const tbl of tableNodes) {
      const rows = extractTable(tbl)
      if (rows.length === 0) continue
      const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0)
      const docxRows = rows.map((r, ri) => new TableRow({
        children: Array.from({ length: maxCols }, (_, ci) => new TableCell({
          width: { size: Math.floor(9000 / maxCols), type: WidthType.DXA },
          children: [new Paragraph({
            children: [new TextRun({ text: r[ci] || '', bold: ri === 0 })],
          })],
        })),
      }))
      sectionChildren.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: docxRows,
      }))
      // Mark text inside this table as already used so we don't re-emit it.
      for (const t of Array.from(tbl.getElementsByTagNameNS(DRAWINGML_NS, 't'))) seenTextNodes.add(t)
    }

    // Paragraph text — every <a:p> outside a table.
    const allParagraphs = Array.from(xml.getElementsByTagNameNS(DRAWINGML_NS, 'p'))
    for (const p of allParagraphs) {
      // Skip if this paragraph is inside a table (any ancestor is <a:tbl>).
      let inTable = false
      let parent = p.parentNode
      while (parent && parent.nodeType === 1) {
        if (parent.localName === 'tbl' && parent.namespaceURI === DRAWINGML_NS) { inTable = true; break }
        parent = parent.parentNode
      }
      if (inTable) continue
      const text = paragraphText(p)
      if (text) sectionChildren.push(new Paragraph({ text }))
    }
  }

  const doc = new Document({
    sections: [{ children: sectionChildren }],
  })
  return await Packer.toBlob(doc)
}

initBulkPdfTool({
  slug: 'powerpoint-to-word',
  keyPrefix: 'pptword',
  acceptExts: ['.pptx'],
  acceptAttr: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
  outputExt: 'docx',
  outputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  maxFiles: 25,
  maxBytesTotal: 250 * 1024 * 1024,
  nextStepsSlugs: ['word-to-pdf'],
  t: getT(),
  processOneOverride: async (entry) => {
    try {
      const blob = await convertPptxToDocxBlob(entry.file)
      entry.pdfBlob = blob
      entry.downloadUrl = URL.createObjectURL(blob)
      entry.status = 'done'
    } catch (e) {
      const code = (e && e.errCode) || null
      const msg = (e && (e.message || String(e))) || ''
      entry.status = 'error'
      if (code) entry.errCode = code
      else if (/password|encrypted/i.test(msg)) entry.errCode = 'password_protected'
      else if (/corrupt|invalid|signature|not a zip/i.test(msg)) entry.errCode = 'file_corrupted'
      else entry.errCode = 'conversion_failed'
    }
  },
  labels: {
    desc: 'Convert one or multiple PowerPoint files to editable Word documents.',
    select: 'Select PowerPoint files',
    dropHint: 'or drop .pptx files anywhere',
    convertBtn: 'Convert to Word',
    downloadAll: 'Download all as ZIP',
    retry: 'Retry',
    remove: 'Remove',
    statusPending: 'Ready',
    statusUploading: 'Reading…',
    statusConverting: 'Converting…',
    statusDone: 'Done',
    statusError: 'Failed',
    progressFmt: 'Converting {current} of {total}…',
    summaryFmt: '{ok} of {total} converted',
    errTooLarge: 'File too large (max 25 MB per file).',
    errTotalTooLarge: 'Total batch size too large (max 250 MB).',
    errTooMany: 'Maximum 25 files per session on the free tier.',
    errInvalidFormat: 'Please select PowerPoint files (.pptx).',
    errRateLimited: 'Server busy. Try again in a moment.',
    errQuotaExhausted: 'Free conversion limit reached. Try again tomorrow.',
    errServiceUnreachable: 'Conversion service is unreachable. Try again shortly.',
    errServiceError: 'Conversion service returned an error.',
    errPasswordProtected: 'File is password-protected. Remove the password and retry.',
    errFileCorrupted: 'File appears corrupted or not a valid .pptx.',
    errUnsupportedContent: 'File contains unsupported content.',
    errConversionFailed: 'Conversion failed.',
    errUploadFailed: 'Upload failed.',
    errTimeout: 'Conversion took too long.',
    errGeneric: 'Something went wrong.',
    fileBaseFallback: 'presentation',
    zipName: 'powerpoint-to-word.zip',
  },
})
