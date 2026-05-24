import { isAllowedOrigin, corsHeaders, forbidden } from '../_lib/guard.js'

export async function onRequestPost(context) {
  if (!isAllowedOrigin(context.request)) return forbidden()
  const cors = corsHeaders(context.request)

  try {
    const formData = await context.request.formData()
    const imageFile = formData.get('image')
    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'Missing image file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const apiKey = context.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const rbgForm = new FormData()
    rbgForm.append('image_file', imageFile)
    rbgForm.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: rbgForm,
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: 'Remove.bg API error', detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const resultBuffer = await response.arrayBuffer()
    return new Response(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        ...cors,
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    })
  }
}

export async function onRequestOptions(context) {
  if (!isAllowedOrigin(context.request)) return forbidden()
  return new Response(null, { headers: corsHeaders(context.request) })
}
