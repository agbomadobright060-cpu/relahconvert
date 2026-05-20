// Word → Excel tool: bulk processing of up to 10 .docx/.doc files per
// session via the shared bulk engine. CloudConvert routing happens through
// the Pages Function broker at /api/convert/word-to-excel/{start,status}.
// CloudConvert is named only in the privacy policy.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'

initBulkPdfTool({
  slug: 'word-to-excel',
  keyPrefix: 'wordexcel',
  acceptExts: ['.docx', '.doc'],
  acceptAttr: '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
  outputExt: 'xlsx',
  outputMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Output is .xlsx — Excel→PDF accepts that input format and the IDB
  // handoff (saveFilesToIDB / pendingFromIDB) auto-loads the converted
  // file. excel-to-word would round-trip back to Word; not useful here.
  nextStepsSlugs: ['excel-to-pdf'],
  t: getT(),
  labels: {
    desc: 'Convert one or multiple Word files to editable Excel spreadsheets.',
    select: 'Select Word files',
    dropHint: 'or drop .docx / .doc files anywhere',
    convertBtn: 'Convert to Excel',
    downloadAll: 'Download all as ZIP',
    retry: 'Retry',
    remove: 'Remove',
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
    errInvalidFormat: 'Please select Word files (.docx or .doc).',
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
    fileBaseFallback: 'document',
    zipName: 'word-to-excel.zip',
  },
})
