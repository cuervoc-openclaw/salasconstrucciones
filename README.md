# Construcciones Salas

![Build](https://img.shields.io/badge/build-validado_localmente-success)
![Coverage](https://img.shields.io/badge/coverage-no_configurado-lightgrey)
![Astro](https://img.shields.io/badge/Astro-5.16.6-ff5d01)
![WordPress](https://img.shields.io/badge/WordPress-Theme%201.0.0-21759b)
![SEO](https://img.shields.io/badge/SEO-auditoria_realizada-informational)

Landing de conversion, blog y galeria de proyectos para `Construcciones Salas`, construida con `Astro` como frontend estatico y `WordPress` como CMS headless mediante REST.

Este README cumple dos funciones:

1. Documenta la arquitectura actual del proyecto.
2. Deja una auditoria tecnica accionable sobre configuraciones pendientes, SEO y riesgos de build/deploy.

## Estado actual

- Frontend principal en `ContruccionesSalas/`.
- Tema headless de WordPress en `ContruccionesSalasCMS/wp-content/themes/construccionessalas/`.
- Build local de Astro validado con `npm run build`.
- El chequeo tipado `astro check` no esta operativo aun porque faltan `@astrojs/check` y `typescript` como dependencias de desarrollo.
- SEO base implementado: `canonical`, `robots`, `Open Graph`, `Twitter Cards`, `sitemap` y `LocalBusiness` JSON-LD.
- Existen riesgos criticos de configuracion que hoy permiten compilar "en verde" aunque el sitio salga con contenido fallback o SEO incorrecto.

## Resultado de la auditoria

### Hallazgos criticos

1. `PUBLIC_SITE_URL` no esta asegurada en build.
   - Impacto: `canonical`, `og:url`, `og:image`, `robots.txt` y `sitemap` quedan apuntando a `https://example.com`.
   - Evidencia observada en build actual: `dist/index.html`, `dist/robots.txt`, `dist/sitemap-index.xml`, `dist/sitemap-0.xml`.

2. `PUBLIC_WP_BASE_URL` no esta garantizada en build.
   - Impacto: la landing usa contenido fallback y las rutas dinamicas de blog/proyectos pueden no generarse.
   - Evidencia observada: el `dist/` actual solo contiene `/`, `/blog/` y `/proyectos/`, sin slugs dinamicos.

3. La landing renderiza un `<head>` dentro del `<body>`.
   - Impacto: HTML invalido, riesgo SEO tecnico y parsing inconsistente.
   - Causa: el componente `Welcome.astro` imprime un `<head>` propio en vez de usar el slot `head` del layout.

4. Las rutas API `POST` no tienen adaptador de servidor configurado.
   - Impacto: `/api/assistant`, `/api/lead` y `/api/metrics` no son deployables en hosting estatico puro.
   - Estado actual: existe codigo de endpoints, pero `astro.config.mjs` no define adapter ni `output: 'server'`.

5. El build oculta errores del CMS.
   - Impacto: si WordPress falla o no responde, el sitio igual compila con fallback, dificultando detectar errores antes de publicar.
   - Causa: multiples `catch {}` silenciosos en la landing y listados.

6. No existe pipeline de calidad minima.
   - Impacto: no hay CI, no hay coverage, no hay linting, no hay testing automatizado y no hay `astro check` operativo.

### Hallazgos importantes

1. `og:type` se define como `article` para cualquier URL que comience con `/blog/`.
   - Problema: `/blog/` es un listado, no un articulo individual.

2. El SEO social usa una sola imagen global (`/logo.png`).
   - Problema: blog y proyectos no exponen imagen destacada propia para `og:image` o `twitter:image`.

3. Solo hay schema `LocalBusiness` en home.
   - Problema: faltan `Article` para blog, `BreadcrumbList` para paginas internas y `FAQPage` cuando existan FAQs visibles.

4. El origen CORS del tema WordPress esta hardcodeado a `http://localhost:4322`.
   - Problema: el README heredado de Astro indica `4321` y el puerto real puede cambiar.

5. No existe `.env.example`.
   - Problema: onboarding lento y alto riesgo de builds mal configurados.

6. No hay documentacion de despliegue ni estrategia definida para frontend y CMS.

### Hallazgos secundarios

1. Las imagenes se consumen directo desde WordPress con `<img>` y fondos CSS.
   - Riesgo: falta optimizacion responsive, `srcset`, formatos modernos y control de peso.

2. Google Fonts se carga desde `fonts.googleapis.com`.
   - Riesgo: impacto en performance y privacidad; conviene evaluar self-hosting.

3. Los metadatos del tema WordPress siguen usando `example.com`.
   - Riesgo: inconsistencia documental.

4. El frontend interno `ContruccionesSalas/README.md` sigue siendo el README default de Astro y no describe el proyecto real.

## Checklist priorizado de configuraciones pendientes

### Prioridad alta

- [ ] Definir `PUBLIC_SITE_URL` con la URL final del sitio.
- [ ] Definir `PUBLIC_WP_BASE_URL` con la base publica del WordPress headless.
- [ ] Decidir estrategia para `/api/*`: `server adapter` o externalizar webhooks/assistant.
- [ ] Instalar `@astrojs/check` y `typescript` para habilitar chequeo de tipos.
- [ ] Crear `.env.example` con todas las variables requeridas.
- [ ] Corregir la inyeccion de `<head>` de la landing usando el slot `head`.
- [ ] Hacer que el build falle o al menos alerte cuando WordPress no responda en rutas criticas.
- [ ] Definir CI minima con build y chequeos tecnicos.

### Prioridad media

- [ ] Corregir `og:type` para listado de blog.
- [ ] Exponer `og:image` dinamica en posts y proyectos.
- [ ] Agregar schemas `Article`, `BreadcrumbList` y `FAQPage` donde aplique.
- [ ] Corregir CORS de desarrollo para no depender de `4322` fijo.
- [ ] Documentar despliegue de Astro y WordPress.
- [ ] Definir observabilidad minima para fallas de fetch hacia WordPress y webhooks.

### Prioridad baja

- [ ] Incorporar linting y formateo.
- [ ] Incorporar testeo visual o E2E para la landing y modal.
- [ ] Revisar self-hosting de fuentes.
- [ ] Actualizar metadata informativa del tema WordPress.

## Auditoria SEO completa

### Lo que ya existe

- `meta description` en layout global.
- `canonical` por pagina.
- `robots` con `index,follow`.
- `Open Graph` y `Twitter Cards`.
- `@astrojs/sitemap` configurado.
- `robots.txt` generado por Astro.
- `LocalBusiness` JSON-LD en la landing.
- URLs limpias para blog y proyectos:
  - `/blog/`
  - `/blog/[slug]`
  - `/proyectos/`
  - `/proyectos/[slug]`

### Problemas criticos detectados

| Area | Estado | Problema | Prioridad | Recomendacion |
| --- | --- | --- | --- | --- |
| Canonical | Parcial | Depende de `PUBLIC_SITE_URL`; sin ella apunta a `example.com` | Alta | Configurar URL publica en build/deploy |
| Sitemap | Parcial | Generado, pero hoy referencia `example.com` y no incluye slugs dinamicos en build auditado | Alta | Configurar `PUBLIC_SITE_URL` y `PUBLIC_WP_BASE_URL`, luego validar `dist/sitemap-0.xml` |
| Robots | Parcial | Existe, pero hoy anuncia sitemap de `example.com` | Alta | Mismo ajuste de URL publica |
| HTML tecnico | Incorrecto | La home contiene un `<head>` dentro del `<body>` | Alta | Mover los metadatos al slot `head` del layout |
| Rendering de contenido | Riesgo silencioso | El build no falla si WordPress no responde | Alta | Agregar logs, warnings o fail-fast segun entorno |
| Datos estructurados | Parcial | Solo `LocalBusiness`; faltan schemas por tipo de contenido | Media | Agregar `Article`, `BreadcrumbList`, `FAQPage` |
| Social metadata | Parcial | `og:image` y `twitter:image` globales, no especificos por contenido | Media | Usar imagen destacada de post/proyecto |
| OG type | Incorrecto | `/blog/` queda como `article` | Media | Marcar solo `/blog/[slug]` como `article` |
| Performance de imagenes | Basico | Sin `srcset`, sin optimizacion remota, hero con backgrounds remotos | Media | Optimizar assets y evaluar `astro:assets` o CDN |
| Indexacion preview/staging | Sin politica | No hay `noindex` condicional por entorno | Media | Bloquear previews con meta/headers segun entorno |

### Recomendaciones SEO especificas

#### Prioridad alta

1. Configurar `PUBLIC_SITE_URL` antes de cualquier deploy productivo.
2. Corregir la estructura HTML de la home eliminando el `<head>` embebido.
3. Garantizar que WordPress este accesible en build para generar blog/proyectos y sitemap completo.
4. Validar en cada release:
   - `dist/index.html`
   - `dist/blog/index.html`
   - `dist/proyectos/index.html`
   - `dist/sitemap-index.xml`
   - `dist/robots.txt`

#### Prioridad media

1. Agregar `Article` schema en `blog/[slug].astro`.
2. Agregar `BreadcrumbList` en blog y proyectos internos.
3. Emitir `FAQPage` solo cuando la seccion FAQ este activa y visible.
4. Exponer imagen destacada como `og:image` en posts y proyectos.
5. Incluir `article:published_time` y, si aplica, `article:modified_time`.

#### Prioridad baja

1. Evaluar self-hosting de `Inter`.
2. Revisar `og:image:alt`, `og:site_name`, `twitter:site`.
3. Medir Core Web Vitals en produccion con Lighthouse/PageSpeed.

## Problemas de construccion y despliegue

## 1. Build local validado

Comando ejecutado:

```bash
npm run build
```

Resultado:

- Build completado sin error.
- Riesgo: el build puede terminar correctamente aunque falten variables o falle WordPress, porque el proyecto cae a valores fallback.

## 2. Chequeo tipado incompleto

Comando ejecutado:

```bash
npm run astro -- check
```

Resultado:

- Astro solicita instalar:

```bash
npm i -D @astrojs/check typescript
```

- Conclusion: el proyecto no tiene todavia una capa minima de chequeo estatico automatizable.

## 3. Endpoints API sin adapter

Archivos afectados:

- `src/pages/api/assistant.ts`
- `src/pages/api/lead.ts`
- `src/pages/api/metrics.ts`

Riesgo:

- Si el sitio se despliega como estatico puro, las rutas `POST` no van a funcionar.

Opciones recomendadas:

1. Pasar Astro a modo SSR/server con un adapter adecuado.
2. Mover esas funciones a un backend/serverless separado.
3. Eliminar o mantener desactivado el modulo asistente hasta definir backend.

## 4. Integridad de contenido en build

Hoy el proyecto depende de WordPress para:

- Home (`/wp-json/csalas/v1/landing`)
- Slider (`/wp-json/csalas/v1/hero-slider`)
- Blog (`/wp-json/wp/v2/posts`)
- Proyectos (`/wp-json/wp/v2/proyecto`)

Si `PUBLIC_WP_BASE_URL` no existe o el CMS no responde:

- La home usa textos fallback.
- Blog y proyectos listan vacio.
- Los slugs dinamicos no se generan.
- El sitemap queda incompleto.

## Variables de entorno requeridas

Actualmente no existe un `.env.example`. Estas son las variables detectadas en el codigo:

| Variable | Requerida | Uso | Ejemplo |
| --- | --- | --- | --- |
| `PUBLIC_SITE_URL` | Si | URL canonica del sitio para `canonical`, `OG`, `Twitter`, `robots` y `sitemap` | `https://www.construccionessalas.cl` |
| `SITE_URL` | Alternativa | Fallback para `astro.config.mjs` si no existe `PUBLIC_SITE_URL` | `https://www.construccionessalas.cl` |
| `PUBLIC_WP_BASE_URL` | Si | Base URL del WordPress headless para fetch de landing, blog y proyectos | `https://cms.construccionessalas.cl` |
| `CRM_WEBHOOK_URL` | Condicional | Recepcion de leads desde `/api/lead` y `/api/assistant` | `https://hooks.example.com/crm` |
| `ANALYTICS_WEBHOOK_URL` | Condicional | Recepcion de eventos desde `/api/metrics` | `https://hooks.example.com/analytics` |

### Ejemplo recomendado de `.env`

```env
PUBLIC_SITE_URL=https://www.construccionessalas.cl
PUBLIC_WP_BASE_URL=https://cms.construccionessalas.cl
CRM_WEBHOOK_URL=https://hooks.example.com/crm
ANALYTICS_WEBHOOK_URL=https://hooks.example.com/analytics
```

## Guia de instalacion y configuracion

### Requisitos recomendados

- Node.js 20 LTS
- npm 10+
- WordPress 6.0+
- PHP 7.4+
- Un sitio WordPress accesible por HTTPS

### 1. Preparar WordPress

1. Copiar el tema `ContruccionesSalasCMS/wp-content/themes/construccionessalas/` a la instalacion WordPress.
2. Activar el tema desde el admin.
3. Confirmar que el REST API responde:

```text
/wp-json/wp/v2/posts
/wp-json/csalas/v1/landing
/wp-json/csalas/v1/hero-slider
```

4. Crear y publicar contenido en los CPT:
   - `servicio`
   - `hero_slide`
   - `proyecto`
   - `testimonio`
   - `faq`
5. Configurar las opciones del sitio en `Ajustes > Construcciones Salas`.

### 2. Preparar el frontend Astro

```bash
cd ContruccionesSalas
npm install
```

Crear `.env` en `ContruccionesSalas/`:

```env
PUBLIC_SITE_URL=https://www.construccionessalas.cl
PUBLIC_WP_BASE_URL=https://cms.construccionessalas.cl
CRM_WEBHOOK_URL=https://hooks.example.com/crm
ANALYTICS_WEBHOOK_URL=https://hooks.example.com/analytics
```

### 3. Levantar entorno local

```bash
npm run dev
```

### 4. Validar antes de desplegar

```bash
npm run build
npm run astro -- check
```

Si `astro check` aun falla por dependencias faltantes:

```bash
npm i -D @astrojs/check typescript
```

### 5. Despliegue

Antes de desplegar:

1. Confirmar que `PUBLIC_SITE_URL` es la URL final.
2. Confirmar que WordPress responde desde el entorno de build.
3. Confirmar que el sitemap generado no apunta a `example.com`.
4. Definir si `/api/*` va con adapter SSR o con backend externo.

## Scripts disponibles

En `ContruccionesSalas/package.json`:

| Script | Uso |
| --- | --- |
| `npm run dev` | Levanta el entorno de desarrollo Astro |
| `npm run build` | Genera el sitio estatico en `dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run astro` | Ejecuta la CLI de Astro |

### Script auxiliar no integrado

- `generar-presupuesto-papa.mjs`
  - Genera el archivo `presupuesto-papa.pdf`.
  - No esta conectado al flujo principal ni al `package.json`.

## Dependencias y versiones

### Frontend Astro

| Paquete | Version detectada |
| --- | --- |
| `astro` | `^5.16.6` |
| `@astrojs/sitemap` | `^3.7.2` |

### Dependencias faltantes recomendadas

| Paquete | Motivo |
| --- | --- |
| `@astrojs/check` | Chequeo estatico de Astro |
| `typescript` | Requerido por `astro check` |

### Stack CMS

| Componente | Version/estado |
| --- | --- |
| WordPress Theme | `Construcciones Salas 1.0.0` |
| WordPress minimo | `6.0` |
| WordPress probado hasta | `6.6` |
| PHP minimo | `7.4` |

## Arquitectura del proyecto

### Vision general

```text
Usuario
  |
  v
Astro frontend (ContruccionesSalas)
  |
  +--> Build-time fetch a WordPress REST
  |      - /wp-json/csalas/v1/landing
  |      - /wp-json/csalas/v1/hero-slider
  |      - /wp-json/wp/v2/posts
  |      - /wp-json/wp/v2/proyecto
  |
  +--> Render estatico
  |
  +--> Endpoints /api/* (solo si se define backend/adaptador)
         - /api/assistant
         - /api/lead
         - /api/metrics

WordPress CMS (ContruccionesSalasCMS)
  |
  +--> Opciones del sitio (wp_options)
  +--> CPTs: servicio, hero_slide, proyecto, testimonio, faq
  +--> REST custom namespace: csalas/v1
```

### Estructura de carpetas

```text
contruccion-salas/
|-- README.md
|-- .gitignore
|-- ContruccionesSalas/
|   |-- astro.config.mjs
|   |-- package.json
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Welcome.astro
|   |   |   `-- AssistantWidget.astro
|   |   |-- layouts/
|   |   |   `-- Layout.astro
|   |   `-- pages/
|   |       |-- index.astro
|   |       |-- robots.txt.ts
|   |       |-- api/
|   |       |-- blog/
|   |       `-- proyectos/
|   `-- generar-presupuesto-papa.mjs
`-- ContruccionesSalasCMS/
    `-- wp-content/
        `-- themes/
            `-- construccionessalas/
                |-- functions.php
                |-- style.css
                `-- assets/
                    |-- bootstrap.php
                    |-- config.php
                    |-- helpers.php
                    |-- admin/
                    `-- controllers/
```

### Patrones y decisiones arquitectonicas

- `Astro + WordPress headless`: el frontend no usa tema WordPress para render final; consume REST.
- `Static-first`: el objetivo actual es generar HTML estatico para SEO.
- `CMS-driven landing`: la home se alimenta por un endpoint agregado `csalas/v1/landing`.
- `CPT-based content modeling`: servicios, FAQs, testimonios, proyectos y slides son tipos de contenido propios en WordPress.
- `Fallback rendering`: cuando falta contenido remoto, el frontend usa valores por defecto; util para resiliencia, peligroso para despliegue si no hay alertas.
- `REST options`: muchas configuraciones viven en `wp_options` y se exponen con `show_in_rest`.

### Flujo de datos

1. WordPress guarda contenido y opciones.
2. El tema registra CPTs, metacampos y endpoints REST.
3. Astro consulta WordPress en build-time.
4. Astro genera la landing, blog, proyectos, sitemap y robots.
5. Si se habilita backend para `/api/*`, los leads y metricas se reenvian a webhooks.

## Integraciones de terceros

### Activas o parcialmente activas

- Google Fonts
- WhatsApp (`wa.me`)
- Email (`mailto:`)
- Webhooks externos:
  - CRM via `CRM_WEBHOOK_URL`
  - Analitica via `ANALYTICS_WEBHOOK_URL`

### Pendientes de formalizar

- CI/CD
- Coverage
- Linting/formateo
- Hosting SSR o serverless para `/api/*`
- Monitoreo de errores

## Recomendaciones paso a paso para estabilizar el proyecto

### Fase 1: Configuracion minima

1. Crear `.env.example`.
2. Definir `PUBLIC_SITE_URL`.
3. Definir `PUBLIC_WP_BASE_URL`.
4. Instalar `@astrojs/check` y `typescript`.
5. Documentar puerto/origen correcto para desarrollo del CMS.

### Fase 2: SEO tecnico

1. Corregir el uso del slot `head`.
2. Corregir `og:type` del listado `/blog/`.
3. Agregar OG dinamico por post/proyecto.
4. Agregar schema por tipo de contenido.
5. Revalidar sitemap con slugs reales.

### Fase 3: Calidad y despliegue

1. Incorporar GitHub Actions con build automatizado.
2. Agregar chequeo de tipos en CI.
3. Definir estrategia final para `/api/*`.
4. Agregar una auditoria Lighthouse al flujo de release.

## Guia de contribucion

### Convenciones recomendadas

- Trabajar por ramas cortas (`feature/*`, `fix/*`, `docs/*`).
- No mezclar cambios de Astro y WordPress sin documentar impacto cruzado.
- Validar `npm run build` antes de abrir PR.
- Si se toca SEO, revisar `dist/` generado.
- Si se toca WordPress, validar endpoints REST manualmente.

### Checklist sugerido para Pull Requests

- [ ] Build local exitoso
- [ ] Variables de entorno documentadas
- [ ] No se introducen URLs hardcodeadas incorrectas
- [ ] Sitemap y robots revisados
- [ ] Se validan canonicals en HTML final
- [ ] Se documentan cambios de CMS si afectan contenido

## Roadmap sugerido

### Corto plazo

- Corregir el `head` embebido de la landing.
- Formalizar variables de entorno.
- Habilitar `astro check`.
- Crear `.env.example`.
- Ajustar CORS de desarrollo.

### Mediano plazo

- Mejorar metadatos sociales por contenido.
- Incorporar schemas por tipo de pagina.
- Activar CI con build y chequeos.
- Definir deploy para endpoints server-side.

### Largo plazo

- Optimizar imagenes con pipeline/CDN.
- Incorporar analitica real de Core Web Vitals.
- Añadir tests E2E para navegacion, modal y rutas criticas.
- Incorporar entorno staging con politica `noindex`.

## Notas del repositorio

- El `.gitignore` raiz esta configurado para versionar solo:
  - el frontend Astro
  - el tema custom de WordPress
- WordPress core y otros archivos del CMS quedan fuera del repositorio.
- Esto es correcto para mantener el repo enfocado en codigo personalizado.

## Resumen ejecutivo

El proyecto tiene una base tecnica valida y una direccion correcta para SEO headless con Astro + WordPress, pero todavia no esta completamente endurecido para produccion. Lo mas urgente no es diseno ni contenido: es cerrar la configuracion de entorno, corregir el `head` invalido, definir la estrategia de `/api/*` y evitar builds "falsamente exitosos" cuando el CMS no responde.
