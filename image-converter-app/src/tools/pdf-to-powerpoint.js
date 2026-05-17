// PDF → PowerPoint tool: bulk processing of up to 10 .pdf files per session
// via the shared bulk engine. CloudConvert routing happens through the Pages
// Function broker at /api/convert/pdf-to-powerpoint/{start,status}.
// CloudConvert is named only in the privacy policy.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'

initBulkPdfTool({
  slug: 'pdf-to-powerpoint',
  keyPrefix: 'pdfppt',
  acceptExts: ['.pdf'],
  acceptAttr: '.pdf,application/pdf',
  outputExt: 'pptx',
  outputMime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  nextStepsSlugs: ['pdf-to-word', 'pdf-to-excel', 'compress-pdf'],
  t: getT(),
  labels: {
    desc: 'Convert one or multiple PDF files to editable PowerPoint presentations.',
    select: 'Select PDF files',
    dropHint: 'or drop .pdf files anywhere',
    convertBtn: 'Convert to PowerPoint',
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
    errInvalidFormat: 'Please select PDF files (.pdf).',
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
    fileBaseFallback: 'presentation',
    zipName: 'pdf-to-powerpoint.zip',
  },
})
