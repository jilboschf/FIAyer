## Supabase setup (FIAyer)

### 1) Variables d'entorn

#### Frontend (Vite)
Afegir a un fitxer local (ex. `.env.local`, **no** pujar a git):

- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

#### Backend (Vercel project env)

- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...` (només server-side)
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- (recomanat) `STRIPE_PRICE_PACK=price_...`
- (recomanat) `STRIPE_PRICE_PRO=price_...`
- (recomanat) `STRIPE_PRICE_PREMIUM=price_...`

### 2) SQL (crear taula d'entitlements)
Executa això a Supabase SQL editor:

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

-- Índex per a lookups ràpids des del webhook quan no hi ha userId a metadata
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

Si ja tenies la taula creada d'una versió anterior, executa aquesta migració per afegir les columnes noves:

```sql
alter table public.entitlements
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists payment_failed_at timestamptz;

create index if not exists entitlements_stripe_subscription_id_idx
  on public.entitlements (stripe_subscription_id);
```

### 3) RLS (opcional però recomanat)
Si vols permetre llegir/actualitzar des del client (ara mateix el projecte ho fa via `api/*` amb service role):

```sql
alter table public.entitlements enable row level security;

create policy "read own entitlements"
on public.entitlements
for select
using (auth.uid() = user_id);
```

### 4) Stripe webhook
Configura a Stripe Dashboard → Developers → Webhooks → Add endpoint:

- Endpoint URL: `https://todoflayer.es/api/stripe-webhook`
- Events to send:
  - `checkout.session.completed` — compra inicial (pack, pro, premium)
  - `customer.subscription.updated` — renovacions mensuals i canvis de pla
  - `customer.subscription.deleted` — cancel·lacions (degrada a `free`)
  - `invoice.payment_failed` — pagament fallit (marca `payment_failed_at`)

El secret del webhook (`whsec_...`) s'ha de posar a la variable d'entorn `STRIPE_WEBHOOK_SECRET`.

