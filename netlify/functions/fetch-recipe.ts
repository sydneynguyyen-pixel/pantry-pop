// Netlify Function (v2). Fetches a recipe page server-side so the browser never
// makes the cross-origin request — this removes the CORS problem that made the
// client-side "Try fetch" fail, without depending on flaky public CORS proxies.

export default async (req: Request): Promise<Response> => {
  const target = new URL(req.url).searchParams.get('url')
  if (!target) {
    return new Response('Missing "url" query parameter.', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return new Response('Invalid URL.', { status: 400 })
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return new Response('Only http/https URLs are supported.', { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      redirect: 'follow',
      headers: {
        // Some recipe sites block obvious bots, so present as a normal browser.
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!upstream.ok) {
      return new Response(`Upstream site responded with ${upstream.status}.`, { status: 502 })
    }

    const html = await upstream.text()
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('Could not reach the recipe site.', { status: 502 })
  }
}

export const config = { path: '/api/fetch-recipe' }
