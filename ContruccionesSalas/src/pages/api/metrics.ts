import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, site }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = {
      event: body.event || 'interaction',
      timestamp: new Date().toISOString(),
      data: body.data || {},
      site: String(site || '')
    };
    const url = process.env.ANALYTICS_WEBHOOK_URL || '';
    if (url) {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
