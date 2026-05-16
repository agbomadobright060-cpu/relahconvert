// Cloudflare Pages Function — returns job status and (when finished) the
// download URL the browser uses to fetch the converted file.
// Query: ?jobId=X
// Returns: { status: 'processing'|'finished'|'error', downloadUrl?, filename?, code?, message? }

export async function onRequestGet(context) {
  const { request, env } = context
  console.log('[cc-status] key_present=', !!env.CC_API_KEY)
  if (!env.CC_API_KEY) {
    console.log('[cc-status] CC_API_KEY env var is missing')
    return json({ status: 'error', code: 'service_misconfigured' }, 500)
  }

  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')
  console.log('[cc-status] jobId=', jobId)
  if (!jobId || !/^[a-zA-Z0-9-]+$/.test(jobId)) {
    console.log('[cc-status] invalid jobId format')
    return json({ status: 'error', code: 'invalid_request' }, 400)
  }

  let ccRes
  try {
    ccRes = await fetch(
      `https://api.cloudconvert.com/v2/jobs/${encodeURIComponent(jobId)}?include=tasks`,
      { headers: { 'Authorization': 'Bearer ' + env.CC_API_KEY } }
    )
  } catch (e) {
    console.log('[cc-status] fetch threw:', String(e && e.message || e))
    return json({ status: 'error', code: 'service_unreachable' }, 502)
  }

  const ccText = await ccRes.text()
  console.log('[cc-status] CC HTTP status:', ccRes.status, 'response_body:', ccText.slice(0, 2000))

  if (ccRes.status === 404) {
    console.log('[cc-status] job not found')
    return json({ status: 'error', code: 'job_not_found' }, 404)
  }
  if (!ccRes.ok) {
    console.log('[cc-status] CC returned non-OK status:', ccRes.status)
    return json({ status: 'error', code: 'service_error', http: ccRes.status }, 502)
  }

  let ccData
  try { ccData = JSON.parse(ccText) } catch (_) {
    console.log('[cc-status] could not parse CC response as JSON')
    return json({ status: 'error', code: 'service_response_invalid' }, 502)
  }
  const job = ccData && ccData.data
  if (!job) {
    console.log('[cc-status] CC response missing data')
    return json({ status: 'error', code: 'service_response_invalid' }, 502)
  }
  console.log('[cc-status] job.status=', job.status)

  // CloudConvert job statuses: 'waiting', 'processing', 'finished', 'error'
  if (job.status === 'error') {
    // Try to find which task failed so we can map to a useful code
    const failed = Array.isArray(job.tasks) ? job.tasks.find(t => t.status === 'error') : null
    console.log('[cc-status] job failed. failed task:', failed ? JSON.stringify({ name: failed.name, operation: failed.operation, code: failed.code, message: failed.message }) : 'none')
    return json({
      status: 'error',
      code: failed ? mapTaskErrorCode(failed) : 'conversion_failed',
      message: (failed && failed.message) || job.message || '',
    })
  }
  if (job.status !== 'finished') {
    return json({ status: 'processing' })
  }

  const exportTask = Array.isArray(job.tasks)
    ? job.tasks.find(t => t.operation === 'export/url' && t.status === 'finished')
    : null
  const fileInfo = exportTask && exportTask.result && Array.isArray(exportTask.result.files) && exportTask.result.files[0]
  if (!fileInfo || !fileInfo.url) {
    console.log('[cc-status] finished but no export file found. tasks:', JSON.stringify(job.tasks).slice(0, 1000))
    return json({ status: 'error', code: 'no_output' })
  }
  console.log('[cc-status] success — downloadUrl=', fileInfo.url)
  return json({ status: 'finished', downloadUrl: fileInfo.url, filename: fileInfo.filename || 'converted' })
}

function mapTaskErrorCode(task) {
  const msg = String(task.message || '').toLowerCase()
  if (msg.includes('password')) return 'password_protected'
  if (msg.includes('corrupt')) return 'file_corrupted'
  if (msg.includes('unsupported') || msg.includes('invalid format')) return 'unsupported_content'
  return 'conversion_failed'
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
