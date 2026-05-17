// Excel → PDF tool: bulk processing of up to 10 .xlsx/.xls files per session
// via the shared bulk-pdf engine. CloudConvert routing happens through the
// Pages Function broker at /api/convert/excel-to-pdf/{start,status}.
// CloudConvert is named only in the privacy policy.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'

initBulkPdfTool({
  slug: 'excel-to-pdf',
  keyPrefix: 'excelpdf',
  acceptExts: ['.xlsx', '.xls'],
  acceptAttr: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
  nextStepsSlugs: ['word-to-pdf', 'merge-pdf', 'compress-pdf'],
  t: getT(),
  labels: {
    desc: 'Convert one or multiple Excel files to PDF.',
    select: 'Select Excel files',
    dropHint: 'or drop .xlsx / .xls files anywhere',
    convertBtn: 'Convert to PDF',
    downloadAll: 'Download all as ZIP',
    retry: 'Retry',
    remove: 'Remove',
    limitBanner: 'Free limit: 10 files per session. Upgrade for more.',
    upgradeBtn: 'Upgrade',
    statusPending: 'Ready',
    statusUploading: 'Uploading…',
    statusConverting: 'Converting…',
    statusDone: 'Done',
    statusError: 'Failed',
    progressFmt: 'Converting {current} of {total}…',
    summaryFmt: '{ok} of {total} converted',
    errTooLarge: 'File too large (max 25 MB per file).',
    errTotalTooLarge: 'Total batch size too large (max 100 MB).',
    errTooMany: 'Maximum 10 files per session on the free tier.',
    errInvalidFormat: 'Please select Excel files (.xlsx or .xls).',
    errRateLimited: 'Server busy. Try again in a moment.',
    errQuotaExhausted: 'Free conversion limit reached. Try again tomorrow.',
    errServiceUnreachable: 'Conversion service is unreachable. Try again shortly.',
    errServiceError: 'Conversion service returned an error.',
    errPasswordProtected: 'File is password-protected. Remove the password and retry.',
    errFileCorrupted: 'File appears corrupted.',
    errUnsupportedContent: 'File contains unsupported content.',
    errConversionFailed: 'Conversion failed.',
    errUploadFailed: 'Upload failed.',
    errTimeout: 'Conversion took too long.',
    errGeneric: 'Something went wrong.',
    fileBaseFallback: 'spreadsheet',
    zipName: 'excel-to-pdf.zip',
  },
})
