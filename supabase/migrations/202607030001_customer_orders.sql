create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null unique,
  default_address text not null default '',
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Adresse principale',
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'paid' check (status in ('pending', 'paid', 'accepted', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')),
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  payment_provider text,
  payment_reference text,
  delivery_address text not null,
  scheduled_date date,
  scheduled_time text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price numeric(10, 2) not null default 0 check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null default 0 check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists customers_auth_user_id_idx on public.customers(auth_user_id);
create index if not exists customers_email_idx on public.customers(lower(email));
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_name_idx on public.order_items(product_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_customer_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (
    auth_user_id,
    first_name,
    last_name,
    phone,
    email,
    default_address
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'Client'),
    coalesce(new.raw_user_meta_data->>'last_name', 'Edo-San'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'default_address', '')
  )
  on conflict (auth_user_id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    email = excluded.email,
    default_address = excluded.default_address,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_customer on auth.users;
create trigger on_auth_user_created_create_customer
after insert on auth.users
for each row execute function public.handle_new_customer_user();

create or replace view public.customer_backoffice as
select
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  c.default_address,
  count(o.id)::integer as orders_count,
  coalesce(sum(o.total_amount), 0)::numeric(10, 2) as total_spent,
  coalesce(avg(o.total_amount), 0)::numeric(10, 2) as average_spent,
  max(o.created_at) as last_order_at,
  coalesce(
    (
      select array_agg(product_name order by qty desc, product_name asc)
      from (
        select oi.product_name, sum(oi.quantity) as qty
        from public.order_items oi
        join public.orders oo on oo.id = oi.order_id
        where oo.customer_id = c.id
        group by oi.product_name
        order by qty desc, oi.product_name asc
        limit 5
      ) favorites
    ),
    array[]::text[]
  ) as top_products
from public.customers c
left join public.orders o on o.customer_id = c.id and o.status <> 'cancelled'
group by c.id;

alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can read their own profile" on public.customers;
create policy "Customers can read their own profile"
on public.customers for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "Customers can update their own profile" on public.customers;
create policy "Customers can update their own profile"
on public.customers for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "Customers can insert their own profile" on public.customers;
create policy "Customers can insert their own profile"
on public.customers for insert
to authenticated
with check (auth.uid() = auth_user_id);

drop policy if exists "Customers can read their addresses" on public.customer_addresses;
create policy "Customers can read their addresses"
on public.customer_addresses for select
to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = customer_addresses.customer_id
    and c.auth_user_id = auth.uid()
  )
);

drop policy if exists "Customers can manage their addresses" on public.customer_addresses;
create policy "Customers can manage their addresses"
on public.customer_addresses for all
to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = customer_addresses.customer_id
    and c.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.customers c
    where c.id = customer_addresses.customer_id
    and c.auth_user_id = auth.uid()
  )
);

drop policy if exists "Customers can read their orders" on public.orders;
create policy "Customers can read their orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1 from public.customers c
    where c.id = orders.customer_id
    and c.auth_user_id = auth.uid()
  )
);

drop policy if exists "Customers can read their order items" on public.order_items;
create policy "Customers can read their order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id
    and c.auth_user_id = auth.uid()
  )
);

revoke all on public.customer_backoffice from anon, authenticated;
