// Cloudflare Pages Function — creates a CloudConvert job and returns the
// upload form data for the browser to POST directly to CloudConvert.
// Path param: [tool] — e.g. 'word-to-pdf'
// Body: { filename: string, size: number }
// Returns: { jobId, uploadUrl, uploadFields }
// Errors: 4xx/5xx with { error: code, ... }

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB cap, enforced both client and server side

// Map each Phase 3 tool slug to its CloudConvert convert-task input/output formats.
// Only formats explicitly listed here are accepted; unknown slugs return 404.
const TOOL_CONFIG = {
  'word-to-pdf':       { input: 'docx', output: 'pdf'  },
  'excel-to-pdf':      { input: 'xlsx', output: 'pdf'  },
  'powerpoint-to-pdf': { input: 'pptx', output: 'pdf'  },
  'pdf-to-word':       { input: 'pdf',  output: 'docx' },
  'pdf-to-excel':      { input: 'pdf',  output: 'xlsx' },
  'pdf-to-powerpoint': { input: 'pdf',  output: 'pptx' },
}

export async function onRequestPost(context) {
  const { request, params, env } = context
  const tool = params.tool
  console.log('[cc-start] tool=', tool, 'key_present=', !!env.CC_API_KEY)
  const config = TOOL_CONFIG[tool]
  if (!config) {
    console.log('[cc-start] unknown tool')
    return json({ error: 'unknown_tool' }, 404)
  }
  if (!env.CC_API_KEY) {
    console.log('[cc-start] CC_API_KEY env var is missing')
    return json({ error: 'service_misconfigured' }, 500)
  }

  let body
  try { body = await request.json() } catch (_) {
    console.log('[cc-start] failed to parse request body')
    return json({ error: 'invalid_request' }, 400)
  }
  const { filename, size } = body || {}
  console.log('[cc-start] incoming: filename=', filename, 'size=', size)
  if (typeof filename !== 'string' || typeof size !== 'number' || size <= 0) {
    console.log('[cc-start] invalid filename/size types')
    return json({ error: 'invalid_request' }, 400)
  }
  if (size > MAX_BYTES) {
    console.log('[cc-start] file too large:', size)
    return json({ error: 'file_too_large', maxBytes: MAX_BYTES }, 413)
  }
  const expectedExt = '.' + config.input
  if (!filename.toLowerCase().endsWith(expectedExt)) {
    console.log('[cc-start] invalid extension; expected', expectedExt)
    return json({ error: 'invalid_format', expected: config.input }, 400)
  }

  const jobSpec = {
    tasks: {
      'import-1':  { operation: 'import/upload' },
      'convert-1': {
        operation: 'convert',
        input: 'import-1',
        input_format: config.input,
        output_format: config.output,
      },
      'export-1':  { operation: 'export/url', input: 'convert-1' },
    },
    tag: 'relahconvert-' + tool,
  }
  const jobSpecBody = JSON.stringify(jobSpec)
  console.log('[cc-start] job spec being sent to CC:', jobSpecBody)

  let ccRes
  try {
    ccRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.CC_API_KEY,
        'Content-Type': 'application/json',
      },
      body: jobSpecBody,
    })
  } catch (e) {
    console.log('[cc-start] fetch threw:', String(e && e.message || e))
    return json({ error: 'service_unreachable' }, 502)
  }

  const ccText = await ccRes.text()
  console.log('[cc-start] CC HTTP status:', ccRes.status, 'response_body:', ccText.slice(0, 2000))

  if (ccRes.status === 401 || ccRes.status === 403) {
    console.log('[cc-start] auth failure from CC — key invalid or lacking permissions')
    return json({ error: 'service_misconfigured' }, 500)
  }
  if (ccRes.status === 402) {
    console.log('[cc-start] CC says quota exhausted')
    return json({ error: 'quota_exhausted' }, 402)
  }
  if (ccRes.status === 429) {
    console.log('[cc-start] CC rate limited')
    return json({ error: 'rate_limited' }, 429)
  }
  if (!ccRes.ok) {
    console.log('[cc-start] CC returned non-OK status:', ccRes.status)
    return json({ error: 'service_error', status: ccRes.status }, 502)
  }

  let ccData
  try { ccData = JSON.parse(ccText) } catch (_) {
    console.log('[cc-start] could not parse CC response as JSON')
    return json({ error: 'service_response_invalid' }, 502)
  }
  const job = ccData && ccData.data
  if (!job || !Array.isArray(job.tasks)) {
    console.log('[cc-start] CC response missing data.tasks')
    return json({ error: 'service_response_invalid' }, 502)
  }
  const importTask = job.tasks.find(t => t.name === 'import-1' || t.operation === 'import/upload')
  if (!importTask || !importTask.result || !importTask.result.form) {
    console.log('[cc-start] no import task or no form in result. tasks:', JSON.stringify(job.tasks).slice(0, 1000))
    return json({ error: 'service_response_invalid' }, 502)
  }
  const form = importTask.result.form
  console.log('[cc-start] success — jobId=', job.id, 'uploadUrl=', form.url)
  return json({ jobId: job.id, uploadUrl: form.url, uploadFields: form.parameters })
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
