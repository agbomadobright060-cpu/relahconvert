// Cloudflare Pages Function — returns job status and (when finished) the
// download URL the browser uses to fetch the converted file.
// Query: ?jobId=X
// Returns: { status: 'processing'|'finished'|'error', downloadUrl?, filename?, code?, message? }

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.CC_API_KEY) return json({ status: 'error', code: 'service_misconfigured' }, 500)

  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')
  if (!jobId || !/^[a-zA-Z0-9-]+$/.test(jobId)) {
    return json({ status: 'error', code: 'invalid_request' }, 400)
  }

  let ccRes
  try {
    ccRes = await fetch(
      `https://api.cloudconvert.com/v2/jobs/${encodeURIComponent(jobId)}?include=tasks`,
      { headers: { 'Authorization': 'Bearer ' + env.CC_API_KEY } }
    )
  } catch (_) {
    return json({ status: 'error', code: 'service_unreachable' }, 502)
  }
  if (ccRes.status === 404) return json({ status: 'error', code: 'job_not_found' }, 404)
  if (!ccRes.ok) return json({ status: 'error', code: 'service_error', http: ccRes.status }, 502)

  let ccData
  try { ccData = await ccRes.json() } catch (_) { return json({ status: 'error', code: 'service_response_invalid' }, 502) }
  const job = ccData && ccData.data
  if (!job) return json({ status: 'error', code: 'service_response_invalid' }, 502)

  // CloudConvert job statuses: 'waiting', 'processing', 'finished', 'error'
  if (job.status === 'error') {
    const failed = Array.isArray(job.tasks) ? job.tasks.find(t => t.status === 'error') : null
    return json({
      status: 'error',
      code: failed ? mapTaskErrorCode(failed) : 'conversion_failed',
      message: (failed && failed.message) || job.message || '',
    })
  }
  if (job.status !== 'finished') return json({ status: 'processing' })

  const exportTask = Array.isArray(job.tasks)
    ? job.tasks.find(t => t.operation === 'export/url' && t.status === 'finished')
    : null
  const fileInfo = exportTask && exportTask.result && Array.isArray(exportTask.result.files) && exportTask.result.files[0]
  if (!fileInfo || !fileInfo.url) return json({ status: 'error', code: 'no_output' })
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
