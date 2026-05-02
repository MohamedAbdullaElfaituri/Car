create extension if not exists "pgcrypto";

create type app_role as enum ('manager');
create type payment_method as enum ('cash', 'card', 'transfer', 'unpaid');
create type wash_order_status as enum ('new', 'washing', 'ready', 'completed', 'cancelled');
create type audit_action as enum ('create', 'update', 'delete', 'soft_delete', 'status_change', 'login');

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name app_role not null unique,
  description text not null,
  permissions jsonb not null default '{"all": true}'::jsonb,
  created_at timestamptz not null default now()
);

-- The only authenticated person is the manager.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role app_role not null default 'manager',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Workers are operational records, not login accounts.
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  commission_rate numeric(5,2) not null default 0 check (commission_rate >= 0 and commission_rate <= 100),
  active boolean not null default true,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  plate_number text not null,
  vehicle_type text not null,
  vehicle_model text not null,
  color text not null,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (plate_number)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  active boolean not null default true,
  description text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.wash_orders (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_id uuid not null references public.customers(id),
  vehicle_id uuid not null references public.vehicles(id),
  worker_id uuid references public.workers(id),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null default 0,
  payment_method payment_method not null default 'unpaid',
  status wash_order_status not null default 'new',
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.wash_order_services (
  id uuid primary key default gen_random_uuid(),
  wash_order_id uuid not null references public.wash_orders(id) on delete cascade,
  service_id uuid not null references public.services(id),
  service_name text not null,
  price numeric(12,2) not null,
  duration_minutes integer not null,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  wash_order_id uuid not null unique references public.wash_orders(id),
  invoice_number text not null unique,
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  issued_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id),
  amount numeric(12,2) not null check (amount >= 0),
  method payment_method not null,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.settings (
  id boolean primary key default true,
  shop_name text not null default 'بوسنينه لخدمات السيارات',
  phone text,
  address text,
  currency text not null default 'د.ل',
  tax_rate numeric(5,2) not null default 0,
  invoice_footer text,
  working_hours text,
  logo_url text default '/logo.jpeg',
  primary_color text not null default '#d71920',
  calculate_worker_commissions boolean not null default true,
  reports_export_enabled boolean not null default true,
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  user_name text,
  action audit_action not null,
  entity text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index customers_search_idx on public.customers using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(phone,''))) where deleted_at is null;
create index vehicles_search_idx on public.vehicles using gin (to_tsvector('simple', coalesce(plate_number,'') || ' ' || coalesce(vehicle_type,''))) where deleted_at is null;
create index workers_search_idx on public.workers using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(phone,''))) where deleted_at is null;
create index wash_orders_created_idx on public.wash_orders (created_at desc) where deleted_at is null;
create index wash_orders_worker_idx on public.wash_orders (worker_id, created_at desc) where deleted_at is null;
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'manager'
      and active = true
      and deleted_at is null
  )
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
as $$
declare
  actor_name text;
  event_action audit_action;
begin
  select full_name into actor_name from public.users where id = auth.uid();

  if tg_op = 'INSERT' then
    event_action := 'create';
  elsif tg_op = 'UPDATE' and old.deleted_at is null and new.deleted_at is not null then
    event_action := 'soft_delete';
  elsif tg_op = 'UPDATE' then
    event_action := 'update';
  else
    event_action := 'delete';
  end if;

  insert into public.audit_logs(user_id, user_name, action, entity, entity_id, old_data, new_data)
  values (auth.uid(), coalesce(actor_name, 'manager'), event_action, tg_table_name, coalesce(new.id, old.id), to_jsonb(old), to_jsonb(new));

  return coalesce(new, old);
end;
$$;

create or replace function public.create_invoice_for_order()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.invoices(wash_order_id, invoice_number, subtotal, discount, total)
  values (new.id, new.invoice_number, new.subtotal, new.discount, new.total)
  on conflict (wash_order_id) do update set
    subtotal = excluded.subtotal,
    discount = excluded.discount,
    total = excluded.total;

  return new;
end;
$$;

create trigger users_touch before update on public.users for each row execute function public.touch_updated_at();
create trigger workers_touch before update on public.workers for each row execute function public.touch_updated_at();
create trigger customers_touch before update on public.customers for each row execute function public.touch_updated_at();
create trigger vehicles_touch before update on public.vehicles for each row execute function public.touch_updated_at();
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();
create trigger wash_orders_touch before update on public.wash_orders for each row execute function public.touch_updated_at();

create trigger users_audit after insert or update or delete on public.users for each row execute function public.write_audit_log();
create trigger workers_audit after insert or update or delete on public.workers for each row execute function public.write_audit_log();
create trigger customers_audit after insert or update or delete on public.customers for each row execute function public.write_audit_log();
create trigger vehicles_audit after insert or update or delete on public.vehicles for each row execute function public.write_audit_log();
create trigger services_audit after insert or update or delete on public.services for each row execute function public.write_audit_log();
create trigger wash_orders_audit after insert or update or delete on public.wash_orders for each row execute function public.write_audit_log();
create trigger invoices_audit after insert or update or delete on public.invoices for each row execute function public.write_audit_log();
create trigger invoices_auto after insert or update on public.wash_orders for each row execute function public.create_invoice_for_order();

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.services enable row level security;
alter table public.wash_orders enable row level security;
alter table public.wash_order_services enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "manager reads roles" on public.roles for select to authenticated using (public.is_manager());
-- Keep the users policy self-contained. Calling public.is_manager() here would
-- make is_manager() query users while the users policy calls is_manager() again.
create policy "manager reads own profile" on public.users for select to authenticated
  using (id = auth.uid() and role = 'manager' and active = true and deleted_at is null);
create policy "manager updates own profile" on public.users for update to authenticated
  using (id = auth.uid() and role = 'manager' and active = true and deleted_at is null)
  with check (id = auth.uid() and role = 'manager' and active = true and deleted_at is null);
create policy "manager manages workers" on public.workers for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages customers" on public.customers for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages vehicles" on public.vehicles for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages services" on public.services for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages orders" on public.wash_orders for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages order services" on public.wash_order_services for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages invoices" on public.invoices for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages payments" on public.payments for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager manages settings" on public.settings for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy "manager reads audit logs" on public.audit_logs for select to authenticated using (public.is_manager());
