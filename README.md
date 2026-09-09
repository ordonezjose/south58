# SOUTH 58 — sitio web

Reimplementación del sitio de SOUTH 58 sobre el stack obligatorio: Astro +
Tailwind v4 + Content Collections (Zod) + Keystatic (local) + Vercel + Umami.

## Stack y versiones verificadas

Instaladas y verificadas contra el registro de npm en el momento de construir
este proyecto (`npm view <paquete> version`):

| Paquete | Versión |
|---|---|
| astro | 7.3.2 |
| tailwindcss / @tailwindcss/vite | 4.3.3 |
| @keystatic/core | 0.6.9 |
| @keystatic/astro | 6.0.0 |
| @astrojs/vercel | 11.0.10 |
| @astrojs/react | 6.0.5 |
| react / react-dom | 19.2.8 |

## Cómo se armó (y por qué no con `npm create astro@latest` template)

Este sandbox no tiene salida de red hacia `github.com` / `api.github.com`
(sí hacia `raw.githubusercontent.com` y `registry.npmjs.org`), y
`create-astro` descarga sus templates desde la API de GitHub. Por eso el
scaffold inicial se armó a mano (`package.json`, `astro.config.mjs`,
`tsconfig.json` extendiendo `astro/tsconfigs/strict`) instalando `astro`
directo por npm, en vez de `npm create astro@latest`. Todo lo demás sí usa
los comandos oficiales: `npx astro add tailwind` no se usó porque instala
el plugin viejo de PostCSS en algunos casos — se siguió la guía de Tailwind
para `@tailwindcss/vite` a mano — pero **sí** se usó `npx astro add vercel`
y `npx astro add react` tal cual pide el brief.

Si vuelves a correr esto en tu máquina (con salida a GitHub sin restricciones),
`npm create astro@latest` funcionará normalmente — no hay nada especial que
mantener del workaround.

## Estructura de contenido

Todo el contenido editable vive en `src/content/` como archivos JSON — uno
por entrada en cada colección (`shows/`, `videos/`, `pics/`, `band/`,
`press/`, `testimonials/`, `songs/`), más dos singletons de un solo archivo
(`site.json`). Cada colección tiene su esquema Zod en `src/content.config.ts`
— **si falta un campo requerido, `astro build` falla ahí mismo**, no en
producción.

`keystatic.config.ts` (raíz del proyecto) define el mismo modelo de datos
para el panel visual. Si cambias un campo, cámbialo en **los dos** archivos.

### Panel de Keystatic

```bash
npm run dev
# abre http://localhost:4321/keystatic
```

Modo `local`: Keystatic lee y escribe directo sobre los archivos en
`src/content/`. No hay login ni backend — es exactamente el modo "edito y
el cambio queda en el repo" que pediste, para desarrollo.

**Detalle importante (la parte donde la mayoría se atasca, como bien
avisaste):** el sitio público es 100% estático, pero las rutas del panel
(`/keystatic` y `/api/keystatic`) las inyecta la integración de Keystatic
como rutas *server-rendered* sin importar el `output` configurado. Eso
significa que necesitan un adaptador para poder construirse — de ahí
`@astrojs/vercel`. Y como Keystatic en modo `local` no tiene autenticación,
**no debe quedar expuesto en producción** (cualquiera podría abrir
`tusitio.vercel.app/keystatic`). Por eso `astro.config.mjs` sólo agrega la
integración de Keystatic cuando `NODE_ENV !== "production"`:

```js
const isDev = process.env.NODE_ENV !== "production";
integrations: [...(isDev ? [keystatic()] : []), react()],
```

Verificado en este entorno:
- `astro dev` → `output: "server"`, `/keystatic` responde 200, el panel
  carga las 7 colecciones + 1 singleton con las cuentas correctas, y
  guardar un cambio en el panel efectivamente reescribe el JSON en disco.
- `astro build` (lo que corre Vercel) → `output: "static"`, sin rutas de
  Keystatic, sin función serverless de por medio.

Esto reconstruye lo documentado en la propia integración
(`node_modules/@keystatic/astro/dist/keystatic-astro.js`) y en el patrón que
usa la comunidad para "sitio estático + panel sólo en dev" — no pude leer
`keystatic.com/docs` directo desde este sandbox (bloqueado por política de
red), así que si algo del comportamiento del panel no coincide con lo que
esperabas, vale la pena que confirmes contra la documentación oficial.

## Cero JS por defecto — cómo se resolvió cada interacción

- **Menú móvil**: checkbox oculto (`#menu-toggle`) + `<label>` como botón +
  CSS `peer-checked:` de Tailwind. Sin JavaScript.
- **Tabs de Shows (Upcoming / Past)**: mismo patrón con dos `<input
  type="radio">` ocultos. Sin JavaScript.
- **Próximos shows / shows pasados**: calculado en build time comparando la
  fecha de cada show con "hoy" (no hay un campo manual "upcoming/past" que se
  pueda desincronizar).
- Lo único que carga JS del lado del cliente en las páginas públicas es la
  fuente de Google Fonts (red) y, si configuras `PUBLIC_UMAMI_*`, el script
  de Umami. El panel de Keystatic sí es una app de React, pero vive
  únicamente en `/keystatic` (dev) y nunca se envía a un visitante del sitio.

## Variables de entorno

Copia `.env.example` a `.env` y completa lo que quieras activar:

- `PUBLIC_UMAMI_WEBSITE_ID` / `PUBLIC_UMAMI_SCRIPT_URL` — analítica Umami.
  Sácalos de tu instancia de Umami (Settings → Websites → tu sitio →
  Tracking code). Sin esto, el sitio simplemente no incluye el script.
- `PUBLIC_BOOKING_FORM_ACTION` — a qué servicio apunta el formulario de
  `/bookings`. **Esto quedó sin decidir** — no elegí un backend de formularios
  por ti. Opciones simples: [Formspree](https://formspree.io),
  [Web3Forms](https://web3forms.com), o una Vercel Function propia. Mientras
  esta variable esté vacía, la página muestra un aviso + botón de "escríbenos
  por email" en vez de un formulario que no hace nada.

## Deploy a Vercel + GitHub

Esto sí requiere tus cuentas — no lo hice yo:

1. Sube esta carpeta (`web/`) a un repositorio de GitHub.
2. En Vercel: **Add New → Project**, importa ese repo. Vercel detecta Astro
   automáticamente (usa `@astrojs/vercel`, ya instalado).
3. En **Settings → Environment Variables** del proyecto de Vercel, agrega
   las mismas variables de `.env.example` que quieras usar en producción.
4. Cada push a la rama por defecto vuelve a desplegar solo — tal como
   pediste.

## Comandos

```bash
npm install
npm run dev       # http://localhost:4321 — sitio + panel /keystatic
npm run build     # astro check && astro build — build de producción (estático)
npm run preview   # sirve dist/ localmente para revisar el build
```

## Pendiente / decisiones que te tocan a ti

- **Formulario de bookings**: sin `PUBLIC_BOOKING_FORM_ACTION` no envía nada
  (ver arriba).
- **Umami**: sin `PUBLIC_UMAMI_*` no hay analítica corriendo.
- **Fotos/video reales**: `pics`, `band` y el hero siguen en placeholder
  (patrón de rayas diagonales) — sube archivos a `public/uploads/...` o
  desde el panel de Keystatic (colecciones Pics/Band, ya configuradas con
  campo de imagen) y el campo `photo`/`portrait` se completa solo.
- **Vulnerabilidad conocida (`npm audit`)**: `@astrojs/vercel@11.0.10` (la
  versión estable más reciente al momento de escribir esto) trae
  transitivamente `@vercel/routing-utils` → `path-to-regexp` con un aviso de
  severidad alta (ReDoS, GHSA-9wv6-86v2-598j). `npm audit fix --force`
  lo "resuelve" bajando `@astrojs/vercel` a una versión vieja/rota — no lo
  hice porque sería peor que el problema. Vale la pena revisar
  `npm audit` de nuevo cuando salga una actualización de `@astrojs/vercel`.
