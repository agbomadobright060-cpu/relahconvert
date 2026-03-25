export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const { url, format, width } = await context.request.json()
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const apiKey = context.env.APIFLASH_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const fmt = format === 'jpeg' ? 'jpeg' : 'png'
    const w = parseInt(width) || 1366
    const apiUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=${fmt}&width=${w}&response_type=image&fresh=true&full_page=true&scroll_page=true&delay=2000&wait_until=network_idle`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: 'Screenshot API error', detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const imageBuffer = await response.arrayBuffer()
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': fmt === 'jpeg' ? 'image/jpeg' : 'image/png',
        ...corsHeaders,
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
