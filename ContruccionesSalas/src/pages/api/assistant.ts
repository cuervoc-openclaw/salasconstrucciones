import type { APIRoute } from 'astro';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };
type Quality = 'basica' | 'estandar' | 'alta';
type Ctx = {
  lang?: 'es' | 'en';
  serviceType?: string;
  propertyType?: string;
  areaM2?: number;
  location?: string;
  timing?: string;
  quality?: Quality;
  name?: string;
  email?: string;
  phone?: string;
  consent?: boolean;
  stage?: 'greeting' | 'qualification' | 'scoping' | 'estimate' | 'handoff';
  budget?: { min: number; max: number; unit: string };
  score?: number;
};

const SERVICES = [
  'electricidad',
  'plomería',
  'plomeria',
  'pintura',
  'remodelación',
  'remodelaciones',
  'remodelacion',
  'mantenimiento',
  'obra civil',
  'llave en mano',
  'obra nueva',
  'reforma integral',
  'cocina',
  'baño',
  'impermeabilización',
  'impermeabilizacion',
  'estructura',
  'carpintería',
  'carpinteria',
  'tablaroca',
  'yeso'
];
const PROPERTIES = ['casa', 'departamento', 'apartamento', 'oficina', 'local', 'bodega', 'edificio', 'nave', 'terreno'];

function detectLang(s: string): 'es' | 'en' {
  const esHints = ['hola', 'presupuesto', 'servicio', 'm2', 'metros', 'plomería', 'plomeria', 'pintura', 'remodelación', 'remodelacion', 'departamento', 'oficina', 'obra'];
  let score = 0;
  esHints.forEach(h => {
    if (s.toLowerCase().includes(h)) score++;
  });
  return score >= 1 ? 'es' : 'en';
}

function parseNumber(s: string) {
  const m = s.match(/(\d+([.,]\d+)?)/);
  if (!m) return undefined;
  return Number(m[1].replace(',', '.'));
}

function extract(last: string, ctx: Ctx): Ctx {
  const t = last.toLowerCase();
  const c = { ...ctx };
  if (!c.lang) c.lang = detectLang(last);
  SERVICES.forEach(s => {
    if (t.includes(s)) c.serviceType = s;
  });
  PROPERTIES.forEach(p => {
    if (t.includes(p)) c.propertyType = p;
  });
  const areaMatch = t.match(/(\d+([.,]\d+)?)\s*(m2|m²|metros|metros cuadrados)/);
  if (areaMatch) c.areaM2 = parseNumber(areaMatch[1]);
  const phone = t.match(/(\+?\d{7,15})/);
  if (phone && !c.phone) c.phone = phone[1];
  const email = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email && !c.email) c.email = email[0];
  const name = t.match(/\b(soy|me llamo|mi nombre es)\s+([a-záéíóúñ]+\s?[a-záéíóúñ]*)/i);
  if (name && !c.name) c.name = name[2];
  if (/consent|acepto|autorizo|sí acepto|si acepto|acepto el uso de datos/.test(t)) c.consent = true;
  const loc = t.match(/\b(en|ubicado en|ubicada en|zona)\s+([a-záéíóúñ\s]+)$/i);
  if (loc && !c.location) c.location = loc[2].trim();
  const tim = t.match(/\b(urgente|esta semana|próxima semana|proxima semana|este mes|próximo mes|proximo mes|\d+\s*(días|semanas|meses))\b/);
  if (tim) c.timing = tim[0];
  if (/básica|basica/.test(t)) c.quality = 'basica';
  if (/estándar|estandar/.test(t)) c.quality = 'estandar';
  if (/alta|premium|lujo/.test(t)) c.quality = 'alta';
  return c;
}

function baseRates(service: string) {
  const s = service?.toLowerCase() || '';
  if (s.includes('electric')) return { min: 25, max: 40, unit: 'USD/m²' };
  if (s.includes('plomer')) return { min: 20, max: 35, unit: 'USD/m²' };
  if (s.includes('pint')) return { min: 8, max: 15, unit: 'USD/m²' };
  if (s.includes('llave') || s.includes('remodel') || s.includes('reforma')) return { min: 180, max: 300, unit: 'USD/m²' };
  if (s.includes('obra nueva')) return { min: 350, max: 600, unit: 'USD/m²' };
  if (s.includes('impermeabil')) return { min: 12, max: 22, unit: 'USD/m²' };
  if (s.includes('estructura')) return { min: 90, max: 150, unit: 'USD/m²' };
  if (s.includes('carpinter')) return { min: 50, max: 120, unit: 'USD/m²' };
  if (s.includes('mant')) return { min: 12, max: 25, unit: 'USD/m²' };
  return { min: 15, max: 30, unit: 'USD/m²' };
}

function qualityFactor(q?: Quality) {
  if (q === 'basica') return 0.9;
  if (q === 'alta') return 1.25;
  return 1;
}

function computeBudget(ctx: Ctx) {
  if (!ctx.serviceType || !ctx.areaM2) return undefined;
  const r = baseRates(ctx.serviceType);
  const qf = qualityFactor(ctx.quality);
  const min = Math.round(r.min * ctx.areaM2 * qf);
  const max = Math.round(r.max * ctx.areaM2 * qf);
  return { min, max, unit: 'USD' };
}

function scoreLead(ctx: Ctx) {
  let s = 0;
  if (ctx.serviceType) s += 20;
  if (ctx.propertyType) s += 10;
  if (ctx.areaM2) s += 20;
  if (ctx.quality) s += 10;
  if (ctx.timing) s += 10;
  if (ctx.name) s += 10;
  if (ctx.phone || ctx.email) s += 10;
  if (ctx.consent) s += 10;
  return Math.min(100, s);
}

function technicalAnswer(msg: string, lang: 'es' | 'en') {
  const t = msg.toLowerCase();
  if (/material|calidad|acabado|azulejo|porcelanato|pintura|impermeabil/.test(t)) {
    return lang === 'es'
      ? 'Trabajamos con calidades básica, estándar y alta. Recomendamos definir calidades por estancia y uso. Para pintura, usamos sistemas base agua lavables; para impermeabilización, membrana asfáltica o poliuretano según exposición.'
      : 'We offer basic, standard and premium finishes. Define finishes by room and use. For painting we use washable water-based systems; for waterproofing, asphalt membrane or polyurethane depending on exposure.';
  }
  if (/norma|normativ|código|codigo|reglamento|licencia|permiso/.test(t)) {
    return lang === 'es'
      ? 'Cumplimos reglamentos locales y normas de seguridad. Para obra nueva o reformas estructurales se requieren licencias y memoria técnica. Podemos gestionar el expediente y visado si lo indicas.'
      : 'We comply with local regulations and safety codes. New builds or structural works require permits and technical documentation. We can manage the permit package if requested.';
  }
  return '';
}

function reply(ctx: Ctx, lastUser: string): { text: string; ctx: Ctx; leadRequest?: boolean } {
  const lang = ctx.lang || 'es';
  if (!ctx.stage) ctx.stage = 'greeting';
  const tech = technicalAnswer(lastUser, lang);
  if (tech && !ctx.serviceType) {
    return { text: tech, ctx };
  }
  if (!ctx.serviceType) {
    return {
      text:
        lang === 'es'
          ? '¿Qué tipo de proyecto necesitas? Obra nueva, reforma integral, remodelación de cocina/baño, electricidad, plomería, pintura, impermeabilización o mantenimiento.'
          : 'What type of project do you need? New build, full renovation, kitchen/bath remodel, electrical, plumbing, painting, waterproofing or maintenance.',
      ctx
    };
  }
  if (!ctx.propertyType) {
    return {
      text: lang === 'es' ? '¿Para qué inmueble es? Casa, departamento, oficina, local, bodega o edificio.' : 'What property is it for? House, apartment, office, retail, warehouse or building.',
      ctx
    };
  }
  if (!ctx.areaM2) {
    return {
      text: lang === 'es' ? '¿Área aproximada en m²?' : 'Approximate area in m²?',
      ctx
    };
  }
  if (!ctx.quality) {
    return {
      text:
        lang === 'es'
          ? '¿Qué calidades buscas? Básica, estándar o alta. Esto ajusta el estimado.'
          : 'Which finish level? Basic, standard or premium. This adjusts the estimate.',
      ctx
    };
  }
  if (!ctx.budget) {
    const b = computeBudget(ctx);
    if (b) {
      ctx.budget = b;
      ctx.stage = 'estimate';
      ctx.score = scoreLead(ctx);
      return {
        text:
          lang === 'es'
            ? `Estimación preliminar: ${b.min}–${b.max} ${b.unit}. Incluye mano de obra y materiales según calidades. Sujeto a visita técnica y normativa local. ¿Compartes nombre, teléfono o correo y confirmas consentimiento para coordinar?`
            : `Preliminary estimate: ${b.min}–${b.max} ${b.unit}. Includes labor and materials per selected finishes. Subject to site visit and local regulations. Share name, phone or email and confirm consent to coordinate?`,
        ctx,
        leadRequest: true
      };
    }
  }
  if (!ctx.name || (!ctx.phone && !ctx.email) || !ctx.consent) {
    return {
      text:
        lang === 'es'
          ? 'Para agendar visita, necesito nombre y al menos teléfono o correo, y tu autorización para contactarte.'
          : 'To schedule a visit, please provide your name and at least a phone or email, and authorize us to contact you.',
      ctx,
      leadRequest: true
    };
  }
  ctx.stage = 'handoff';
  ctx.score = scoreLead(ctx);
  return {
    text:
      lang === 'es'
        ? 'Gracias, registré tus datos. Un asesor te contactará para confirmar fecha de visita y preparar cotización formal.'
        : 'Thanks, your details are registered. An agent will contact you to confirm a site visit and prepare a formal quote.',
    ctx
  };
}

async function sendLead(ctx: Ctx, base: string) {
  const url = process.env.CRM_WEBHOOK_URL || '';
  if (!url) return;
  const payload = {
    source: 'assistant',
    timestamp: new Date().toISOString(),
    lang: ctx.lang || 'es',
    serviceType: ctx.serviceType || '',
    propertyType: ctx.propertyType || '',
    areaM2: ctx.areaM2 || 0,
    budget: ctx.budget || null,
    name: ctx.name || '',
    email: ctx.email || '',
    phone: ctx.phone || '',
    location: ctx.location || '',
    timing: ctx.timing || '',
    quality: ctx.quality || 'estandar',
    consent: !!ctx.consent,
    stage: ctx.stage || 'estimate',
    score: ctx.score || 0,
    site: base
  };
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch {}
}

export const POST: APIRoute = async ({ request, site }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const messages: Msg[] = body.messages || [];
    const prevCtx: Ctx = body.context || {};
    const last = messages.length ? messages[messages.length - 1].content : '';
    let ctx: Ctx = { ...prevCtx };
    if (body.locale && !ctx.lang) ctx.lang = body.locale === 'es' ? 'es' : 'en';
    if (typeof body.consent === 'boolean' && !ctx.consent) ctx.consent = body.consent;
    ctx = extract(last || '', ctx);
    const r = reply(ctx, last || '');
    ctx = r.ctx;
    if (ctx.name && (ctx.phone || ctx.email) && ctx.consent) {
      void sendLead(ctx, String(site || ''));
    }
    return new Response(JSON.stringify({ reply: r.text, context: ctx, budget: ctx.budget || null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ reply: 'Hubo un error. Intenta nuevamente.', context: {} }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
};
