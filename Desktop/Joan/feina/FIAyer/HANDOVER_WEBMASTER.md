# Handover FIAyer / todoflayer.es — Guía para el webmaster

Este documento recoge **todo lo que hay que hacer fuera del código** para publicar el sitio. El código ya está preparado; lo que queda es configuración de servicios externos, DNS, secretos y validación.

**Dominio:** `todoflayer.es` · **Stack:** Vite + React 19 desplegado en Vercel, Supabase (auth + DB), Stripe (pagos), Google Gemini 2.0 Flash (IA).

---

## 1. DNS y dominio (Vercel)

1. En el panel de tu registrador de dominio (el que te vendió `todoflayer.es`), crear los registros:
   - `A` `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   (Los valores exactos los da Vercel al añadir el dominio; usa los que muestre el panel.)
2. En **Vercel → Project → Settings → Domains**, añadir `todoflayer.es` y `www.todoflayer.es`. Marcar `todoflayer.es` como canónico y que `www` redirija al apex.
3. Esperar a que Vercel emita el certificado SSL (suele tardar < 5 min).
4. Probar: `https://todoflayer.es` debe cargar el sitio y `http://todoflayer.es` debe redirigir a HTTPS automáticamente.

---

## 2. Variables de entorno en Vercel

Ir a **Vercel → Project → Settings → Environment Variables** y crear (Production + Preview):

### Frontend (visibles en el bundle, prefijo `VITE_`)
| Variable | Dónde obtenerla | Obligatoria |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key | ✅ |
| `VITE_AUTH_GOOGLE_ENABLED` | Poner `true` solo cuando Google OAuth esté configurado (ver §5). Por defecto `false` | ❌ |
| `VITE_AUTH_APPLE_ENABLED` | Poner `true` solo cuando Apple OAuth esté configurado (ver §5). Por defecto `false` | ❌ |

### Backend (solo servidor)
| Variable | Dónde obtenerla | Obligatoria |
|---|---|---|
| `SUPABASE_URL` | Mismo valor que `VITE_SUPABASE_URL` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role (⚠️ secreta) | ✅ |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | ✅ |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → Secret key (live) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Lo da Stripe al crear el endpoint (ver §4) — empieza por `whsec_...` | ✅ |
| `STRIPE_PRICE_PACK` | Stripe → Products → Pack → Price ID | Recomendada |
| `STRIPE_PRICE_PRO` | Stripe → Products → Pro → Price ID | Recomendada |
| `STRIPE_PRICE_PREMIUM` | Stripe → Products → Premium → Price ID | Recomendada |

> Sin `STRIPE_PRICE_*` el checkout funciona con importes de fallback, pero conviene usar Price IDs reales para tener trazabilidad en Stripe.

Después de añadir variables hay que **redesplegar** (Deployments → ... → Redeploy) para que se apliquen.

---

## 3. Supabase

### 3.1. Esquema de base de datos

Ejecutar en **Supabase → SQL Editor** (si es una instalación nueva):

```sql
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 10,
  plan text not null default 'free',
  has_paid boolean not null default false,
  plan_expires_at timestamptz null,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  payment_failed_at timestamptz null,
  updated_at timestamptz not null default now()
);

create index if not exists entitlements_stripe_subscription_id_idx
  on public.entitlements (stripe_subscription_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_entitlements_updated_at on public.entitlements;
create trigger trg_entitlements_updated_at
before update on public.entitlements
for each row execute function public.set_updated_at();
```

Si la tabla ya existe de antes (versión previa), aplicar esta migración para las columnas del webhook ampliado:

```sql
alter table public.entitlements
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists payment_failed_at timestamptz;

create index if not exists entitlements_stripe_subscription_id_idx
  on public.entitlements (stripe_subscription_id);
```

### 3.2. Configuración de Auth (⚠️ crítico para que funcionen magic links)

En **Supabase → Authentication → URL Configuration**:
- **Site URL**: `https://todoflayer.es`
- **Redirect URLs** (añadir todos):
  - `https://todoflayer.es/**`
  - `https://www.todoflayer.es/**`
  - `http://localhost:5173/**` (para desarrollo local)

Sin esto los magic links de email apuntarán a la URL anterior y no funcionarán.

### 3.3. Email templates (recomendado)

En **Authentication → Email Templates**, personalizar al menos el template "Magic Link" con remitente y branding propios. Comprobar que el enlace de confirmación respete `{{ .ConfirmationURL }}`.

---

## 4. Stripe

### 4.1. Productos y precios

En **Stripe Dashboard → Products**, crear:
- **Pack Export único** — 5 €, pago único
- **Pro** — 15 €/mes, recurring
- **Premium** — 35 €/mes, recurring

Copiar el `price_id` (empieza por `price_...`) de cada uno y ponerlo en las variables `STRIPE_PRICE_PACK`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM` de Vercel.

### 4.2. Webhook

En **Stripe → Developers → Webhooks → Add endpoint**:
- **Endpoint URL**: `https://todoflayer.es/api/stripe-webhook`
- **Events to send** (los 4 son necesarios):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copiar el **Signing secret** (`whsec_...`) y ponerlo en `STRIPE_WEBHOOK_SECRET` en Vercel.

### 4.3. Test mode primero

Antes de poner en live, crear una clave de **test** (`sk_test_...`), un endpoint de webhook de test, y ejecutar `stripe trigger checkout.session.completed` desde el CLI para verificar que la tabla `entitlements` se actualiza correctamente. Luego cambiar a claves live.

---

## 5. OAuth (opcional — Google / Apple)

Actualmente los botones de Google y Apple en el modal de login están **ocultos por defecto** (flags `VITE_AUTH_GOOGLE_ENABLED` y `VITE_AUTH_APPLE_ENABLED` en `false`).

Para activarlos:

### Google
1. **Google Cloud Console** → crear OAuth 2.0 Client ID (tipo Web).
2. Authorized redirect URI: `https://<tu-supabase-ref>.supabase.co/auth/v1/callback` (lo da Supabase).
3. En **Supabase → Authentication → Providers → Google**, pegar Client ID y Secret. Activar.
4. En Vercel, poner `VITE_AUTH_GOOGLE_ENABLED=true` y redesplegar.

### Apple
1. Más costoso: requiere cuenta Apple Developer ($99/año) y crear un Services ID + Key.
2. Guía oficial: https://supabase.com/docs/guides/auth/social-login/auth-apple
3. En Vercel, poner `VITE_AUTH_APPLE_ENABLED=true` y redesplegar.

**Recomendación:** activar Google primero (es gratis y cubre la mayoría de usuarios). Apple puede esperar.

---

## 6. Assets que faltan

### 6.1. `og-image.png` (OBLIGATORIO para social media)

El archivo `public/og-image.svg` es una plantilla. WhatsApp/LinkedIn/Facebook **no aceptan SVG** para previews, hay que convertirlo a PNG 1200×630.

Opciones:
- Abrir el SVG en Figma, Inkscape, Sketch o Illustrator y exportar como PNG 1200×630 a `public/og-image.png`.
- O usar un servicio online (ej. https://cloudconvert.com/svg-to-png) con tamaño 1200×630.

Sin este archivo, las tarjetas en redes sociales saldrán sin imagen.

### 6.2. `favicon.svg`

Verificar que existe en `public/favicon.svg`. Si no, generar uno a partir del logo (la letra "F" azul sobre fondo blanco, o el logo en azul `#3E86C1` sobre blanco).

---

## 7. Decisiones de producto pendientes (requieren input del cliente)

### 7.1. Branding: ¿FIAyer o TodoFlyer?

Tenemos una inconsistencia: la marca visual del sitio es **FIAyer** (el logo "F + IA + yer") pero el domini és **todoflayer.es**. Ya he sustituido las referencias de URL (`fiayer.com` → `todoflayer.es`) en metatags SEO, sitemap, marca de agua del flyer y trust tags.

**Decidir:**
- Opción A — Mantener "FIAyer" como marca y solo usar todoflayer.es como URL. Los usuarios aprenden que "FIAyer vive en todoflayer.es".
- Opción B — Renombrar a "TodoFlyer" completamente (cambiar logo, copys, i18n). Trabajo de medio día adicional.
- Opción C — "TodoFlyer by FIAyer" o similar doble branding.

### 7.2. Textos legales (Términos / Privacidad / Cookies)

Las 3 páginas legales están creadas pero contienen **placeholders** que hay que rellenar antes de publicar:
- `{{NOMBRE_COMPLETO}}` — nombre y apellidos del autónomo responsable.
- `{{NIF}}` — NIF del autónomo.
- `{{DIRECCION}}` — dirección fiscal.
- Email de contacto ya está puesto como `xavicid@gmail.com` — si se quiere uno específico de la web (tipo `legal@todoflayer.es`), cambiarlo en `src/i18n.js` (claves `legal.contactEmail`).

Ubicación: `src/i18n.js` (buscar `{{NOMBRE_COMPLETO}}` en los 3 idiomas ca/es/en).

Si el negocio pasa a ser una SL en el futuro, habrá que actualizar la razón social, CIF y datos registrales.

### 7.3. Email corporativo

`xavicid@gmail.com` funciona pero para una web profesional es más creíble un email `@todoflayer.es` (tipo `hola@todoflayer.es`). Se puede montar con Google Workspace (~6 €/mes) o con un alias gratuito en el panel del registrador que redirija a Gmail.

### 7.4. Marca de agua del flyer en plan free

Los flyers generados en el plan gratuito llevan la marca "CREADO GRATUITAMENTE CON TODOFLAYER.ES". Confirmar que esto es deseable (actualmente está en 3 idiomas en `src/i18n.js`).

---

## 8. Checklist de verificación antes de anunciar públicamente

Una vez configurado todo lo anterior, recorrer esta lista en **producción** (`https://todoflayer.es`):

### Básicos
- [ ] La home carga. Los 3 idiomas (ca/es/en) cambian al pulsar el botón del globo.
- [ ] El footer muestra los 3 enlaces legales. Pulsando cada uno se abre la página correspondiente.
- [ ] El banner de cookies aparece en primera visita. "Aceptar" lo cierra. Recargar: no vuelve a salir. Pulsar el botón 🍪 del footer: vuelve a salir.
- [ ] Vista móvil (DevTools → 375×667): el header cabe, el editor es una sola columna, el footer se apila.

### Auth
- [ ] Login con magic link: pedir código → llega email → click lleva a la home ya logueado.
- [ ] El logout funciona.
- [ ] Si `VITE_AUTH_GOOGLE_ENABLED=true`, el botón Google aparece y completa el flujo.
- [ ] Si ambos OAuth están en `false`, el divisor "O" no aparece.

### Generación
- [ ] Con un usuario logueado con créditos, generar un flyer: se descuenta 1 crédito tras el éxito.
- [ ] Si el usuario no tiene créditos, aparece un toast (no un `alert()`) indicándolo.
- [ ] Los 3 formatos de descarga (PNG, JPG, PDF) generan archivos legibles.

### Pagos
- [ ] Abrir modal de pricing estando logueado → pulsar "Pro" → redirige a Stripe Checkout.
- [ ] Completar pago con tarjeta de test `4242 4242 4242 4242` (solo en modo test).
- [ ] Al volver al sitio, el contador de créditos refleja la compra.
- [ ] En Supabase, la fila `entitlements` del usuario tiene `plan='pro'`, `has_paid=true`, `stripe_customer_id` y `stripe_subscription_id` rellenos, y `plan_expires_at` en un mes.
- [ ] Disparar manualmente `customer.subscription.deleted` desde Stripe CLI: la fila pasa a `plan='free'`, `has_paid=false`, `plan_expires_at=null`.

### SEO / social
- [ ] `https://todoflayer.es/robots.txt` carga y apunta al sitemap correcto.
- [ ] `https://todoflayer.es/sitemap.xml` carga y lista las 4 URLs con el domini nou.
- [ ] Pegar la URL en un Tweet/WhatsApp: aparece preview con título, descripción e imagen.
- [ ] Debug de OpenGraph: https://www.opengraph.xyz/ con la URL todoflayer.es.

### Legal / GDPR
- [ ] La página `/#/legal/privacy` lista claramente: responsable, finalidades, base legal, derechos ARCO-POL, AEPD como autoridad.
- [ ] La página `/#/legal/cookies` distingue entre cookies esenciales y analíticas (si se añaden después).
- [ ] El banner permite "Solo esenciales" y eso se respeta (por ahora no hay analytics, pero la UI lo soporta).

---

## 9. Monitoring recomendado (no bloqueante pero útil)

- **Vercel Analytics**: gratis, ya integrado si lo activas en el panel. Da tráfico y Web Vitals.
- **Sentry** (free tier): captura errores en frontend y backend serverless. Añadir con `@sentry/vite-plugin` y `@sentry/react`.
- **Plausible / Umami**: analytics respetuoso con la privacidad. Requiere actualizar la política de cookies para informar.
- **Stripe Radar**: activado por defecto, útil para detectar pagos fraudulentos.
- **Logflare** (opcional): si quieres logs estructurados de los webhooks de Stripe más allá de lo que guarda Vercel (24 h en plan free).

---

## 10. Qué hay hecho ya (para contexto)

Por si el webmaster quiere saber qué no hace falta tocar:

- **Código**: React 19 + Vite 8, todas las vistas, i18n en 3 idiomas, responsive móvil/tablet, toasts, cookie banner, OAuth feature-flagged, Stripe checkout + webhook completo (checkout/renewal/cancellation/failed-payment).
- **SEO técnico**: meta tags, OpenGraph, Twitter Card, JSON-LD WebApplication, hreflang, sitemap.xml, robots.txt, `<html lang>` dinámico.
- **Seguridad**: Auth con JWT de Supabase, service role key solo en servidor, validación de firma en webhook de Stripe, RLS recomendada en SQL setup.
- **Legales**: Términos, Privacidad y Cookies en 3 idiomas, GDPR-compatibles, solo falta rellenar NIF/nombre real.

El código está en un estado **deployable**: un `vercel --prod` con las variables de entorno bien puestas debería funcionar.

---

## 11. Contacto / dudas del desarrollo

Cualquier duda técnica sobre estructura del código, lógica del webhook o decisiones de arquitectura, están documentadas en:
- `README.md` — overview general.
- `SUPABASE_SETUP.md` — detalles de auth y DB.
- Este documento — handoff de despliegue.

Stack files principales:
- `api/` — funciones serverless (Vercel).
- `src/App.jsx` — root de la aplicación, routing por hash.
- `src/i18n.js` — todos los textos traducibles.
- `src/components/` — componentes UI.
- `src/pages/Legal.jsx` — renderiza las 3 páginas legales.
- `src/lib/toast.jsx` — sistema de toasts.
- `src/lib/supabaseClient.js` — cliente de Supabase (singleton).
