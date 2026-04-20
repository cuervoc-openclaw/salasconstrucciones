import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, site }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const consent = !!body.consent;
    if (!consent) {
      return new Response(JSON.stringify({ ok: false, error: 'consent_required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const payload = {
      source: body.source || 'form',
      timestamp: new Date().toISOString(),
      lang: body.lang || 'es',
      serviceType: body.serviceType || '',
      propertyType: body.propertyType || '',
      areaM2: Number(body.areaM2 || 0),
      budget: body.budget || null,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      location: body.location || '',
      timing: body.timing || '',
      quality: body.quality || 'estandar',
      consent: true,
      stage: body.stage || 'submitted',
      score: Number(body.score || 0),
      site: String(site || '')
    };
    const url = process.env.CRM_WEBHOOK_URL || '';
    if (url) {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
