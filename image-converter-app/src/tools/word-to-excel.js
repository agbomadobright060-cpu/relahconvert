// Word → Excel tool: fully browser-side conversion. The CloudConvert
// docx→pdf→xlsx chain was unreliable — its default pdf→xlsx engine errors
// on text-only docs ("no tables found") and LibreOffice can't do pdf→xlsx.
// Mammoth parses .docx → HTML (preserving tables), SheetJS writes .xlsx.
// No upload, no broker call, never fails. .doc legacy format unsupported
// — mammoth only reads .docx.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

async function convertDocxToXlsxBlob(file) {
  const arrayBuffer = await file.arrayBuffer()
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html')

  // Walk top-level children. Tables become contiguous row blocks; everything
  // else (paragraphs, headings, lists) becomes one text row in column A.
  const rows = []
  let maxCols = 1
  for (const node of doc.body.children) {
    if (node.tagName === 'TABLE') {
      const trs = node.querySelectorAll('tr')
      for (const tr of trs) {
        const cells = []
        for (const cell of tr.querySelectorAll('th, td')) {
          cells.push((cell.textContent || '').replace(/\s+/g, ' ').trim())
        }
        if (cells.length) {
          rows.push(cells)
          if (cells.length > maxCols) maxCols = cells.length
        }
      }
      rows.push([]) // blank separator between content blocks
    } else if (node.tagName === 'UL' || node.tagName === 'OL') {
      for (const li of node.querySelectorAll('li')) {
        const text = (li.textContent || '').replace(/\s+/g, ' ').trim()
        if (text) rows.push([text])
      }
    } else {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
      if (text) rows.push([text])
    }
  }

  if (rows.length === 0) rows.push(['(empty document)'])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  // Auto column widths based on content length, capped to keep cells readable.
  const colWidths = []
  for (let c = 0; c < maxCols; c++) {
    let w = 10
    for (const row of rows) {
      const v = row[c]
      if (typeof v === 'string' && v.length > w) w = Math.min(80, v.length)
    }
    colWidths.push({ wch: w })
  }
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const ab = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([ab], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

initBulkPdfTool({
  slug: 'word-to-excel',
  keyPrefix: 'wordexcel',
  acceptExts: ['.docx'],
  acceptAttr: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  outputExt: 'xlsx',
  outputMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  maxFiles: 25,
  maxBytesTotal: 250 * 1024 * 1024,
  nextStepsSlugs: ['excel-to-pdf'],
  t: getT(),
  processOneOverride: async (entry) => {
    try {
      const blob = await convertDocxToXlsxBlob(entry.file)
      entry.pdfBlob = blob
      entry.downloadUrl = URL.createObjectURL(blob)
      entry.status = 'done'
    } catch (e) {
      const msg = (e && (e.message || String(e))) || ''
      entry.status = 'error'
      if (/password|encrypted/i.test(msg)) entry.errCode = 'password_protected'
      else if (/corrupt|invalid|signature|not a zip/i.test(msg)) entry.errCode = 'file_corrupted'
      else entry.errCode = 'conversion_failed'
    }
  },
  labels: {
    desc: 'Convert one or multiple Word files to editable Excel spreadsheets.',
    select: 'Select Word files',
    dropHint: 'or drop .docx files anywhere',
    convertBtn: 'Convert to Excel',
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
    errInvalidFormat: 'Please select Word files (.docx).',
    errRateLimited: 'Server busy. Try again in a moment.',
    errQuotaExhausted: 'Free conversion limit reached. Try again tomorrow.',
    errServiceUnreachable: 'Conversion service is unreachable. Try again shortly.',
    errServiceError: 'Conversion service returned an error.',
    errPasswordProtected: 'File is password-protected. Remove the password and retry.',
    errFileCorrupted: 'File appears corrupted or not a valid .docx.',
    errUnsupportedContent: 'File contains unsupported content.',
    errConversionFailed: 'Conversion failed.',
    errUploadFailed: 'Upload failed.',
    errTimeout: 'Conversion took too long.',
    errGeneric: 'Something went wrong.',
    fileBaseFallback: 'document',
    zipName: 'word-to-excel.zip',
  },
})
