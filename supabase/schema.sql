create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists price text;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  pickup_date date not null,
  customer_name text not null,
  phone text not null,
  email text,
  notes text,
  status text not null default 'uusi' check (status in ('uusi', 'kasittelyssa', 'valmis', 'noudettu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists email text;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  quantity_grams integer not null check (quantity_grams > 0)
);

create table if not exists public.daily_featured_product (
  id text primary key default 'default' check (id = 'default'),
  product_name text not null,
  price text not null,
  fishing_area text not null,
  visible_from date not null default current_date,
  visible_to date not null default (current_date + 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_daily_featured_product_updated_at on public.daily_featured_product;
create trigger set_daily_featured_product_updated_at
before update on public.daily_featured_product
for each row
execute function public.set_updated_at();

create index if not exists orders_pickup_date_idx on public.orders (pickup_date);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists products_active_sort_idx on public.products (active, sort_order);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.daily_featured_product enable row level security;

drop policy if exists "Authenticated users can read products" on public.products;
drop policy if exists "Public users can read products" on public.products;
create policy "Public users can read products"
on public.products
for select
to public
using (true);

drop policy if exists "Authenticated users can manage products" on public.products;
drop policy if exists "Public users can manage products" on public.products;
create policy "Public users can manage products"
on public.products
for all
to public
using (true)
with check (true);

drop policy if exists "Authenticated users can read orders" on public.orders;
drop policy if exists "Public users can read orders" on public.orders;
create policy "Public users can read orders"
on public.orders
for select
to public
using (true);

drop policy if exists "Authenticated users can manage orders" on public.orders;
drop policy if exists "Public users can manage orders" on public.orders;
create policy "Public users can manage orders"
on public.orders
for all
to public
using (true)
with check (true);

drop policy if exists "Authenticated users can read order items" on public.order_items;
drop policy if exists "Public users can read order items" on public.order_items;
create policy "Public users can read order items"
on public.order_items
for select
to public
using (true);

drop policy if exists "Authenticated users can manage order items" on public.order_items;
drop policy if exists "Public users can manage order items" on public.order_items;
create policy "Public users can manage order items"
on public.order_items
for all
to public
using (true)
with check (true);

drop policy if exists "Public users can read daily featured product" on public.daily_featured_product;
create policy "Public users can read daily featured product"
on public.daily_featured_product
for select
to public
using (true);

drop policy if exists "Public users can manage daily featured product" on public.daily_featured_product;
create policy "Public users can manage daily featured product"
on public.daily_featured_product
for all
to public
using (true)
with check (true);

insert into public.products (name, sort_order)
values
  ('Savumerilohi', 1),
  ('Savukirjolohi', 2),
  ('Graavimerilohi', 3),
  ('Graavikirjolohi', 4),
  ('Graavisiika', 5),
  ('Tuore merilohifilee', 6),
  ('Tuore kirjolohifilee', 7),
  ('Tuore kokonainen kirjolohi', 8),
  ('Kuhafilee', 9),
  ('Haukifilee', 10),
  ('Perattu muikku', 11)
on conflict (name) do nothing;
