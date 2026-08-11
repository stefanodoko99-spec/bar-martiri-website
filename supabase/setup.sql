-- Bar Martiri production hardening and multilingual product fields.
-- Run once in the Supabase SQL editor, then add the Auth user's UUID to
-- public.admin_users. The script is idempotent.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists name_it text,
  add column if not exists name_en text,
  add column if not exists description_it text,
  add column if not exists description_en text;

-- Correct the two products that were imported under the ice-cream category.
update public.products
set category = 'alcohol', updated_at = now()
where id in (
  'f71cccf3-3ced-475c-b57d-53782a50ab74',
  '0963df7b-ed4d-48c0-90b1-01c9232e3e80'
);

create or replace function public.is_menu_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_menu_admin() from public;
grant execute on function public.is_menu_admin() to authenticated;

alter table public.products enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (public.is_menu_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (public.is_menu_admin());

drop policy if exists "Admins can view own membership" on public.admin_users;
create policy "Admins can view own membership"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_menu_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_menu_admin())
with check (bucket_id = 'product-images' and public.is_menu_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_menu_admin());

create or replace function public.replace_products_transactional(product_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_menu_admin() then
    raise exception 'Not authorized';
  end if;

  if jsonb_typeof(product_payload) <> 'array' then
    raise exception 'product_payload must be an array';
  end if;

  delete from public.products;

  insert into public.products (
    id, name, category, description, price, image, sort_order, updated_at,
    name_it, name_en, description_it, description_en
  )
  select
    item->>'id',
    left(coalesce(item->>'name', ''), 80),
    item->>'category',
    left(coalesce(item->>'description', ''), 240),
    nullif(item->>'price', '')::numeric,
    coalesce(item->>'image', ''),
    coalesce((item->>'sort_order')::integer, 0),
    coalesce((item->>'updated_at')::timestamptz, now()),
    nullif(left(coalesce(item->>'name_it', ''), 80), ''),
    nullif(left(coalesce(item->>'name_en', ''), 80), ''),
    nullif(left(coalesce(item->>'description_it', ''), 240), ''),
    nullif(left(coalesce(item->>'description_en', ''), 240), '')
  from jsonb_array_elements(product_payload) as item;
end;
$$;

revoke all on function public.replace_products_transactional(jsonb) from public;
grant execute on function public.replace_products_transactional(jsonb) to authenticated;

create or replace function public.update_product_order(order_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_menu_admin() then
    raise exception 'Not authorized';
  end if;

  if jsonb_typeof(order_payload) <> 'array' then
    raise exception 'order_payload must be an array';
  end if;

  update public.products as product
  set
    sort_order = (item->>'sort_order')::integer,
    updated_at = now()
  from jsonb_array_elements(order_payload) as item
  where product.id = item->>'id';
end;
$$;

revoke all on function public.update_product_order(jsonb) from public;
grant execute on function public.update_product_order(jsonb) to authenticated;

-- Reviews summary (rating, count, testimonials) shown on the public site and
-- editable from /admin instead of being hand-typed in the HTML.
create table if not exists public.site_reviews (
  id text primary key default 'main',
  rating_value numeric not null default 3.9,
  review_count integer not null default 0,
  last_verified date not null default current_date,
  testimonials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_reviews (id, rating_value, review_count, last_verified, testimonials)
values (
  'main', 3.9, 31, '2026-08-03',
  '[{"author":"Doctor Who","rating":5,"quote":"That ice-cream was awesome."},{"author":"E Cabej","rating":5,"quote":"The service is excellent."}]'::jsonb
)
on conflict (id) do nothing;

alter table public.site_reviews enable row level security;

drop policy if exists "Public can read site reviews" on public.site_reviews;
create policy "Public can read site reviews"
on public.site_reviews for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert site reviews" on public.site_reviews;
create policy "Admins can insert site reviews"
on public.site_reviews for insert
to authenticated
with check (public.is_menu_admin());

drop policy if exists "Admins can update site reviews" on public.site_reviews;
create policy "Admins can update site reviews"
on public.site_reviews for update
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

-- Orders placed from the public site's basket, confirmed from /admin, with a
-- Telegram notification fired automatically on every new order.
create extension if not exists pgcrypto;
create extension if not exists pg_net;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  customer_name text not null,
  customer_phone text,
  note text,
  items jsonb not null,
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- Beach layout: 2 sections (A/B) split by the central pathway, 8 rows each,
-- 13 umbrellas per side on rows 1-4 and 12 per side on rows 5-8 (200 total).
alter table public.orders add column if not exists umbrella_section text;
alter table public.orders add column if not exists umbrella_row integer;
alter table public.orders add column if not exists umbrella_number integer;

alter table public.orders enable row level security;

drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can view an order by id" on public.orders;
create policy "Anyone can view an order by id"
on public.orders for select
to anon, authenticated
using (true);

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders for delete
to authenticated
using (public.is_menu_admin());

-- Recompute the total server-side from live product prices on every insert, and
-- force new orders to start pending, so a tampered client can't self-confirm an
-- order or lie about its price.
create or replace function public.compute_order_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  computed numeric := 0;
  cart_item jsonb;
  live_price numeric;
begin
  for cart_item in select * from jsonb_array_elements(new.items) loop
    select price into live_price from public.products where id = (cart_item->>'id');
    if live_price is not null then
      computed := computed + (live_price * greatest(coalesce((cart_item->>'qty')::numeric, 1), 1));
    end if;
  end loop;
  new.total := computed;
  new.status := 'pending';
  new.confirmed_at := null;
  return new;
end;
$$;

drop trigger if exists trg_compute_order_total on public.orders;
create trigger trg_compute_order_total
before insert on public.orders
for each row execute function public.compute_order_total();

-- Bot settings (name, token, chat id) are admin-only: never exposed to anon.
create table if not exists public.bot_settings (
  id text primary key default 'main',
  bot_name text,
  bot_token text,
  chat_id text,
  updated_at timestamptz not null default now()
);

insert into public.bot_settings (id) values ('main') on conflict (id) do nothing;

alter table public.bot_settings enable row level security;

drop policy if exists "Admins can read bot settings" on public.bot_settings;
create policy "Admins can read bot settings"
on public.bot_settings for select
to authenticated
using (public.is_menu_admin());

drop policy if exists "Admins can insert bot settings" on public.bot_settings;
create policy "Admins can insert bot settings"
on public.bot_settings for insert
to authenticated
with check (public.is_menu_admin());

drop policy if exists "Admins can update bot settings" on public.bot_settings;
create policy "Admins can update bot settings"
on public.bot_settings for update
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

-- Fires a Telegram message to the configured bot/chat on every new order.
-- security definer lets it read bot_settings even though anon (who placed the
-- order) has no direct access to that table.
create or replace function public.notify_telegram_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  settings record;
  message text;
  items_text text := '';
  location_text text := '-';
  cart_item jsonb;
begin
  select bot_token, chat_id into settings from public.bot_settings where id = 'main';
  if settings.bot_token is null or settings.bot_token = '' or settings.chat_id is null or settings.chat_id = '' then
    return new;
  end if;

  for cart_item in select * from jsonb_array_elements(new.items) loop
    items_text := items_text || format(
      E'\n- %s x%s (%s ALL)',
      cart_item->>'name',
      coalesce(cart_item->>'qty', '1'),
      coalesce(cart_item->>'price', '?')
    );
  end loop;

  if new.umbrella_section is not null and new.umbrella_row is not null and new.umbrella_number is not null then
    location_text := format('Section %s, Row %s, Umbrella %s', new.umbrella_section, new.umbrella_row, new.umbrella_number);
  end if;

  message := format(
    E'New order #%s\nCustomer: %s\nPhone: %s\nLocation: %s\nTotal: %s ALL%s\n\nNote: %s',
    left(new.id::text, 8),
    coalesce(nullif(new.customer_name, ''), '-'),
    coalesce(nullif(new.customer_phone, ''), '-'),
    location_text,
    new.total,
    items_text,
    coalesce(nullif(new.note, ''), '-')
  );

  perform net.http_post(
    url := format('https://api.telegram.org/bot%s/sendMessage', settings.bot_token),
    body := jsonb_build_object('chat_id', settings.chat_id, 'text', message),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_telegram_new_order on public.orders;
create trigger trg_notify_telegram_new_order
after insert on public.orders
for each row execute function public.notify_telegram_new_order();

-- Photo gallery: admin-uploaded images shown in a public site section. The
-- section stays hidden on the site until at least one row exists.
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

drop policy if exists "Public can read gallery images" on public.gallery_images;
create policy "Public can read gallery images"
on public.gallery_images for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert gallery images" on public.gallery_images;
create policy "Admins can insert gallery images"
on public.gallery_images for insert
to authenticated
with check (public.is_menu_admin());

drop policy if exists "Admins can update gallery images" on public.gallery_images;
create policy "Admins can update gallery images"
on public.gallery_images for update
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

drop policy if exists "Admins can delete gallery images" on public.gallery_images;
create policy "Admins can delete gallery images"
on public.gallery_images for delete
to authenticated
using (public.is_menu_admin());

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view gallery images" on storage.objects;
create policy "Public can view gallery images"
on storage.objects for select
to public
using (bucket_id = 'gallery-images');

drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery-images' and public.is_menu_admin());

drop policy if exists "Admins can update gallery image objects" on storage.objects;
create policy "Admins can update gallery image objects"
on storage.objects for update
to authenticated
using (bucket_id = 'gallery-images' and public.is_menu_admin())
with check (bucket_id = 'gallery-images' and public.is_menu_admin());

drop policy if exists "Admins can delete gallery image objects" on storage.objects;
create policy "Admins can delete gallery image objects"
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery-images' and public.is_menu_admin());

-- Web Push subscriptions for customers, so an order-status change can reach
-- them even after they close the tab (regular Notification API can't). Each
-- row links one browser's push subscription to the order it was created for.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Anyone can save a push subscription" on public.push_subscriptions;
create policy "Anyone can save a push subscription"
on public.push_subscriptions for insert
to anon, authenticated
with check (true);

-- No public select/update/delete: only the send-order-push Edge Function
-- (using the service role key, which bypasses RLS) ever reads these back.

-- Fires the send-order-push Edge Function whenever an order's status
-- changes, so it can push a notification to every subscription saved for
-- that order. Mirrors the existing notify_telegram_new_order trigger below.
-- The bearer token here is the public anon key already committed in
-- supabase-config.js — it only lets the caller invoke this project's own
-- Edge Functions, the same way the browser does.
create or replace function public.notify_customer_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://uctomzwdnfldhoipzepp.supabase.co/functions/v1/send-order-push',
    body := jsonb_build_object('order_id', new.id, 'status', new.status),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG9tendkbmZsZGhvaXB6ZXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NDQzOTEsImV4cCI6MjEwMDMyMDM5MX0._0gk4xTVRm2LvcKHtwZNmFNm4oOdrBX-4n6j9qleGww'
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_customer_order_status on public.orders;
create trigger trg_notify_customer_order_status
after update on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.notify_customer_order_status();

-- After creating the administrator in Authentication, run this with its UUID:
-- insert into public.admin_users (user_id) values ('AUTH-USER-UUID') on conflict do nothing;
