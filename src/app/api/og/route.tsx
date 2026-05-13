import type { NextRequest } from 'next/server';

const STATIC_OG_PATH = '/og/og-image.png';

export async function GET(req: NextRequest) {
  const staticOgUrl = new URL(STATIC_OG_PATH, req.url);
  const image = await fetch(staticOgUrl);

  if (!image.ok || !image.body) {
    return new Response('Static OG image not found', { status: 404 });
  }

  return new Response(image.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
