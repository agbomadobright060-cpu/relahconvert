// Cloudflare Pages Function — creates a CloudConvert job and returns the
// upload form data for the browser to POST directly to CloudConvert.
// Path param: [tool] — e.g. 'word-to-pdf', 'excel-to-pdf'
// Body: { filename: string, size: number }
// Returns: { jobId, uploadUrl, uploadFields }
// Errors: 4xx/5xx with { error: code, ... }

// Per-tool config: which input extensions to accept, output format, and the
// max file size that we allow through to CloudConvert. inputs[] supports
// multiple legitimate extensions for a single tool (e.g. .xlsx + .xls for
// Excel→PDF). The extension is detected per-file and passed as input_format.
// `via` is an optional intermediate format. CloudConvert doesn't have a direct
// converter for some Office↔Office combinations (e.g. xlsx→docx), so we chain
// two convert tasks through PDF: xlsx → pdf → docx.
const TOOL_CONFIG = {
  'word-to-pdf':       { inputs: ['docx', 'doc'],  output: 'pdf',  maxBytes: 25 * 1024 * 1024 },
  'excel-to-pdf':      { inputs: ['xlsx', 'xls'],  output: 'pdf',  maxBytes: 25 * 1024 * 1024 },
  'powerpoint-to-pdf': { inputs: ['pptx', 'ppt'],  output: 'pdf',  maxBytes: 25 * 1024 * 1024 },
  'pdf-to-word':       { inputs: ['pdf'],          output: 'docx', maxBytes: 25 * 1024 * 1024 },
  'pdf-to-excel':      { inputs: ['pdf'],          output: 'xlsx', maxBytes: 25 * 1024 * 1024 },
  'pdf-to-powerpoint': { inputs: ['pdf'],          output: 'pptx', maxBytes: 25 * 1024 * 1024 },
  // excel-to-word and word-to-excel intentionally not routed through CC.
  // The docx→pdf→xlsx chain is unreliable (default pdf→xlsx engine errors
  // on text-only docs; libreoffice can't do pdf→xlsx). Tool runs fully
  // browser-side via mammoth + sheetjs — see src/tools/word-to-excel.js.
}

import { isAllowedOrigin, forbidden } from '../../../_lib/guard.js'

export async function onRequestPost(context) {
  const { request, params, env } = context
  // Reject requests not originating from relahconvert.com — protects the
  // paid CloudConvert API key from drive-by abuse, same lock-down applied
  // to /api/screenshot and /api/remove-bg after the 2026-05-24 ApiFlash
  // incident.
  if (!isAllowedOrigin(request)) return forbidden()

  const tool = params.tool
  const config = TOOL_CONFIG[tool]
  if (!config) return json({ error: 'unknown_tool' }, 404)
  if (!env.CC_API_KEY) return json({ error: 'service_misconfigured' }, 500)

  let body
  try { body = await request.json() } catch (_) { return json({ error: 'invalid_request' }, 400) }
  const { filename, size } = body || {}
  if (typeof filename !== 'string' || typeof size !== 'number' || size <= 0) {
    return json({ error: 'invalid_request' }, 400)
  }
  if (size > config.maxBytes) {
    return json({ error: 'file_too_large', maxBytes: config.maxBytes }, 413)
  }

  // Detect extension from the filename and check it's in the allowed list.
  const lower = filename.toLowerCase()
  const dot = lower.lastIndexOf('.')
  const ext = dot >= 0 ? lower.substring(dot + 1) : ''
  if (!config.inputs.includes(ext)) {
    return json({ error: 'invalid_format', expected: config.inputs.join(',') }, 400)
  }

  // Build the job spec. Single-step for direct conversions; two convert tasks
  // chained through `via` (e.g. xlsx → pdf → docx) for tools that need it.
  let tasks
  if (config.via) {
    tasks = {
      'import-1':  { operation: 'import/upload' },
      'convert-1': {
        operation: 'convert',
        input: 'import-1',
        input_format: ext,
        output_format: config.via,
      },
      'convert-2': {
        operation: 'convert',
        input: 'convert-1',
        input_format: config.via,
        output_format: config.output,
        ...(config.engine2 ? { engine: config.engine2 } : {}),
      },
      'export-1':  { operation: 'export/url', input: 'convert-2' },
    }
  } else {
    tasks = {
      'import-1':  { operation: 'import/upload' },
      'convert-1': {
        operation: 'convert',
        input: 'import-1',
        input_format: ext,
        output_format: config.output,
      },
      'export-1':  { operation: 'export/url', input: 'convert-1' },
    }
  }
  const jobSpec = { tasks, tag: 'relahconvert-' + tool }

  let ccRes
  try {
    ccRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.CC_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobSpec),
    })
  } catch (_) {
    return json({ error: 'service_unreachable' }, 502)
  }
  if (ccRes.status === 401 || ccRes.status === 403) return json({ error: 'service_misconfigured' }, 500)
  if (ccRes.status === 402) return json({ error: 'quota_exhausted' }, 402)
  if (ccRes.status === 429) return json({ error: 'rate_limited' }, 429)
  if (!ccRes.ok) return json({ error: 'service_error', status: ccRes.status }, 502)

  let ccData
  try { ccData = await ccRes.json() } catch (_) { return json({ error: 'service_response_invalid' }, 502) }
  const job = ccData && ccData.data
  if (!job || !Array.isArray(job.tasks)) return json({ error: 'service_response_invalid' }, 502)
  const importTask = job.tasks.find(t => t.name === 'import-1' || t.operation === 'import/upload')
  if (!importTask || !importTask.result || !importTask.result.form) {
    return json({ error: 'service_response_invalid' }, 502)
  }
  const form = importTask.result.form
  return json({ jobId: job.id, uploadUrl: form.url, uploadFields: form.parameters })
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
