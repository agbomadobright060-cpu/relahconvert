// Excel → Word tool: fully browser-side conversion. The CloudConvert
// xlsx → pdf → docx chain via LibreOffice was reliable but slow (~10-15s
// per file because LibreOffice ran twice). SheetJS reads .xlsx/.xls,
// docx writes .docx with proper tables. Runs in well under a second per
// file, no upload, no broker call.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } from 'docx'

function cellsToString(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

async function convertXlsxToDocxBlob(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })

  const sectionChildren = []
  const sheetNames = wb.SheetNames

  for (let s = 0; s < sheetNames.length; s++) {
    const name = sheetNames[s]
    const ws = wb.Sheets[name]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false, raw: false })
    if (sheetNames.length > 1) {
      sectionChildren.push(new Paragraph({
        text: name,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: s === 0 ? 0 : 240, after: 120 },
      }))
    }

    if (rows.length === 0) {
      sectionChildren.push(new Paragraph({ text: '(empty sheet)' }))
      continue
    }

    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0) || 1
    const tableRows = rows.map((r, ri) => new TableRow({
      children: Array.from({ length: maxCols }, (_, ci) => {
        const text = cellsToString(r[ci])
        return new TableCell({
          width: { size: Math.floor(9000 / maxCols), type: WidthType.DXA },
          children: [new Paragraph({
            children: [new TextRun({ text, bold: ri === 0 })],
          })],
        })
      }),
    }))

    sectionChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }))
    if (s < sheetNames.length - 1) {
      sectionChildren.push(new Paragraph({ text: '' }))
    }
  }

  if (sectionChildren.length === 0) {
    sectionChildren.push(new Paragraph({ text: '(empty workbook)' }))
  }

  const doc = new Document({
    sections: [{ children: sectionChildren }],
  })

  return await Packer.toBlob(doc)
}

initBulkPdfTool({
  slug: 'excel-to-word',
  keyPrefix: 'excelword',
  acceptExts: ['.xlsx', '.xls'],
  acceptAttr: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
  outputExt: 'docx',
  outputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  maxFiles: 25,
  maxBytesTotal: 250 * 1024 * 1024,
  nextStepsSlugs: ['word-to-pdf'],
  t: getT(),
  processOneOverride: async (entry) => {
    try {
      const blob = await convertXlsxToDocxBlob(entry.file)
      entry.pdfBlob = blob
      entry.downloadUrl = URL.createObjectURL(blob)
      entry.status = 'done'
    } catch (e) {
      const msg = (e && (e.message || String(e))) || ''
      entry.status = 'error'
      if (/password|encrypted/i.test(msg)) entry.errCode = 'password_protected'
      else if (/corrupt|invalid|signature|unrecognized/i.test(msg)) entry.errCode = 'file_corrupted'
      else entry.errCode = 'conversion_failed'
    }
  },
  labels: {
    desc: 'Convert one or multiple Excel files to editable Word documents.',
    select: 'Select Excel files',
    dropHint: 'or drop .xlsx / .xls files anywhere',
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
    errInvalidFormat: 'Please select Excel files (.xlsx or .xls).',
    errRateLimited: 'Server busy. Try again in a moment.',
    errQuotaExhausted: 'Free conversion limit reached. Try again tomorrow.',
    errServiceUnreachable: 'Conversion service is unreachable. Try again shortly.',
    errServiceError: 'Conversion service returned an error.',
    errPasswordProtected: 'File is password-protected. Remove the password and retry.',
    errFileCorrupted: 'File appears corrupted or not a valid Excel file.',
    errUnsupportedContent: 'File contains unsupported content.',
    errConversionFailed: 'Conversion failed.',
    errUploadFailed: 'Upload failed.',
    errTimeout: 'Conversion took too long.',
    errGeneric: 'Something went wrong.',
    fileBaseFallback: 'spreadsheet',
    zipName: 'excel-to-word.zip',
  },
})
