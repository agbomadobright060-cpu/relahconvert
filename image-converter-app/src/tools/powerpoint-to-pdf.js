// PowerPoint → PDF tool: bulk processing of up to 10 .pptx/.ppt files per
// session via the shared bulk-pdf engine. CloudConvert routing happens
// through the Pages Function broker at /api/convert/powerpoint-to-pdf/{start,status}.
// CloudConvert is named only in the privacy policy.
import { getT } from '../core/i18n.js'
import { initBulkPdfTool } from './shared/bulk-pdf-tool.js'

initBulkPdfTool({
  slug: 'powerpoint-to-pdf',
  keyPrefix: 'pptpdf',
  acceptExts: ['.pptx', '.ppt'],
  acceptAttr: '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint',
  nextStepsSlugs: ['word-to-pdf', 'excel-to-pdf', 'merge-pdf'],
  t: getT(),
  labels: {
    desc: 'Convert one or multiple PowerPoint files to PDF.',
    select: 'Select PowerPoint files',
    dropHint: 'or drop .pptx / .ppt files anywhere',
    convertBtn: 'Convert to PDF',
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
    errInvalidFormat: 'Please select PowerPoint files (.pptx or .ppt).',
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
    zipName: 'powerpoint-to-pdf.zip',
  },
})
