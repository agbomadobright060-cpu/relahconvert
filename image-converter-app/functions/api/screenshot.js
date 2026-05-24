import { isAllowedOrigin, corsHeaders, forbidden } from '../_lib/guard.js'

export async function onRequestPost(context) {
  if (!isAllowedOrigin(context.request)) return forbidden()
  const cors = corsHeaders(context.request)

  try {
    const { url, format, width } = await context.request.json()
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const apiKey = context.env.APIFLASH_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const fmt = format === 'jpeg' ? 'jpeg' : 'png'
    const w = parseInt(width) || 1366
    const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=${fmt}&width=${w}&response_type=image&fresh=true&full_page=true&delay=2`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: 'Screenshot API error', detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...cors },
      })
    }

    const imageBuffer = await response.arrayBuffer()
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': fmt === 'jpeg' ? 'image/jpeg' : 'image/png',
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
