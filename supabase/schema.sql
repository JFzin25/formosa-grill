-- ============================================================================
-- SUPABASE SCHEMA MIGRATION FILE FOR FORMOSA GRILL
-- ============================================================================
-- Created: July 28, 2026
-- Description: Complete database schema, triggers, RLS policies, storage configuration,
--              and seed data for the Formosa Grill restaurant website.
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. TABLES CREATION
-- ============================================================================

-- 1.1 PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nome text,
  telefone text,
  avatar text,
  role text default 'employee' check (role in ('admin', 'manager', 'employee')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  active boolean default true
);

-- 1.2 AUTHORIZED_EMAILS TABLE
create table if not exists public.authorized_emails (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text default 'employee' check (role in ('admin', 'manager', 'employee')),
  created_at timestamptz default now(),
  authorized_by uuid references public.profiles(id) on delete set null,
  status text default 'active' check (status in ('active', 'inactive'))
);

-- 1.3 CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  ordem integer default 0,
  ativa boolean default true,
  created_at timestamptz default now()
);

-- 1.4 PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  categoria uuid references public.categories(id) on delete set null,
  nome text not null,
  descricao text,
  preco numeric(10,2),
  imagem text,
  destaque boolean default false,
  disponivel boolean default true,
  ordem integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1.5 GALLERY TABLE
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  titulo text,
  imagem text,
  ordem integer default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- 1.6 BANNERS TABLE
create table if not exists public.banners (
  id uuid default gen_random_uuid() primary key,
  titulo text,
  subtitulo text,
  imagem text,
  botao text,
  link text,
  ativo boolean default true,
  ordem integer default 0,
  created_at timestamptz default now()
);

-- 1.7 RESERVATIONS TABLE
create table if not exists public.reservations (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text not null,
  email text,
  data date not null,
  hora text not null,
  pessoas integer default 1,
  observacoes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

-- 1.8 CONTACTS TABLE
create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text,
  email text,
  mensagem text,
  lida boolean default false,
  created_at timestamptz default now()
);

-- 1.9 SETTINGS TABLE (Single row enforced via unique constraint)
create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  logo text,
  telefone text,
  whatsapp text,
  instagram text,
  facebook text,
  endereco text,
  mapa_url text,
  horario text,
  email text,
  cor_primaria text,
  cor_secundaria text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Singleton guard constraint to guarantee only one record in the table
  singleton_guard boolean default true unique check (singleton_guard = true)
);

-- 1.10 LOGS TABLE
create table if not exists public.logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  user_email text,
  acao text not null,
  entidade text,
  entidade_id text,
  detalhes jsonb,
  ip text,
  navegador text,
  created_at timestamptz default now()
);

-- 1.11 REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  stars integer check (stars >= 1 and stars <= 5),
  text text,
  approved boolean default false,
  created_at timestamptz default now()
);


-- ============================================================================
-- 2. HELPER FUNCTIONS FOR RLS (Security Definer)
-- ============================================================================

-- 2.1 is_admin() - Returns true if the authenticated user has the 'admin' role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2.2 is_manager() - Returns true if the authenticated user is an 'admin' or 'manager'
create or replace function public.is_manager()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager') and active = true
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2.3 is_staff() - Returns true if the authenticated user is 'admin', 'manager', or 'employee'
create or replace function public.is_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager', 'employee') and active = true
  );
end;
$$ language plpgsql security definer set search_path = public;


-- ============================================================================
-- 3. TRIGGERS & TRIGGERS FUNCTIONS
-- ============================================================================

-- 3.1 HANDLE_NEW_USER TRIGGER FUNCTION
-- Auto-creates profile on auth.users signup.
-- Enforces first user to be admin, and subsequent users to be pre-authorized.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_empty boolean;
  auth_role text;
  user_name text;
begin
  -- Block if email is null
  if new.email is null then
    raise exception 'E-mail é obrigatório para o cadastro.';
  end if;

  -- Check if profiles table is currently empty
  select not exists (select 1 from public.profiles limit 1) into is_empty;

  -- Extract user display name from metadata or split email
  user_name := coalesce(
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  if is_empty then
    -- First signup is automatically registered as Admin
    insert into public.profiles (id, email, nome, role, active)
    values (new.id, new.email, user_name, 'admin', true);
  else
    -- Check if email exists and is active in authorized_emails
    select role into auth_role
    from public.authorized_emails
    where email = new.email and status = 'active';

    if auth_role is not null then
      insert into public.profiles (id, email, nome, role, active)
      values (new.id, new.email, user_name, auth_role, true);
    else
      -- Reject signup if not in authorized_emails
      raise exception 'O e-mail % não está autorizado para cadastro no sistema.', new.email;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create handle_new_user trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3.2 UPDATE_UPDATED_AT TRIGGER FUNCTION
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply update_updated_at trigger to profiles, products, and settings
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.update_updated_at();

drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at
  before update on public.settings
  for each row execute procedure public.update_updated_at();


-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.authorized_emails enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.gallery enable row level security;
alter table public.banners enable row level security;
alter table public.reservations enable row level security;
alter table public.contacts enable row level security;
alter table public.settings enable row level security;
alter table public.logs enable row level security;
alter table public.reviews enable row level security;

-- 4.1 PROFILES POLICIES
-- SELECT: Authenticated user can read self, or any admin/manager can read all profiles
drop policy if exists "Allow SELECT for self or admin/manager" on public.profiles;
create policy "Allow SELECT for self or admin/manager"
  on public.profiles for select
  using (auth.uid() = id or public.is_manager());

-- UPDATE: Authenticated user can update self, or any admin can update profiles
drop policy if exists "Allow UPDATE for self or admin" on public.profiles;
create policy "Allow UPDATE for self or admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ALL (Full control): Admin has full power on profiles
drop policy if exists "Allow admin full control on profiles" on public.profiles;
create policy "Allow admin full control on profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4.2 AUTHORIZED_EMAILS POLICIES
-- Full CRUD only for Admin
drop policy if exists "Allow full CRUD for admin on authorized_emails" on public.authorized_emails;
create policy "Allow full CRUD for admin on authorized_emails"
  on public.authorized_emails for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4.3 CATEGORIES POLICIES
-- SELECT: Anyone can read active categories, or staff can read all categories
drop policy if exists "Allow read for everyone on active categories, or staff" on public.categories;
create policy "Allow read for everyone on active categories, or staff"
  on public.categories for select
  using (ativa = true or public.is_staff());

-- Write operations: Only admin/manager can write
drop policy if exists "Allow full write access for managers on categories" on public.categories;
create policy "Allow full write access for managers on categories"
  on public.categories for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.4 PRODUCTS POLICIES
-- SELECT: Anyone can read available products, or staff can read all products
drop policy if exists "Allow read for everyone on available products, or staff" on public.products;
create policy "Allow read for everyone on available products, or staff"
  on public.products for select
  using (disponivel = true or public.is_staff());

-- Write operations: Only admin/manager can write
drop policy if exists "Allow full write access for managers on products" on public.products;
create policy "Allow full write access for managers on products"
  on public.products for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.5 GALLERY POLICIES
-- SELECT: Anyone can read active gallery images, or staff can read all
drop policy if exists "Allow read for everyone on active gallery, or staff" on public.gallery;
create policy "Allow read for everyone on active gallery, or staff"
  on public.gallery for select
  using (ativo = true or public.is_staff());

-- Write operations: Only admin/manager can write
drop policy if exists "Allow full write access for managers on gallery" on public.gallery;
create policy "Allow full write access for managers on gallery"
  on public.gallery for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.6 BANNERS POLICIES
-- SELECT: Anyone can read active banners, or staff can read all
drop policy if exists "Allow read for everyone on active banners, or staff" on public.banners;
create policy "Allow read for everyone on active banners, or staff"
  on public.banners for select
  using (ativo = true or public.is_staff());

-- Write operations: Only admin/manager can write
drop policy if exists "Allow full write access for managers on banners" on public.banners;
create policy "Allow full write access for managers on banners"
  on public.banners for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.7 RESERVATIONS POLICIES
-- INSERT: Anyone (anon / public) can submit a reservation
drop policy if exists "Allow anonymous insert on reservations" on public.reservations;
create policy "Allow anonymous insert on reservations"
  on public.reservations for insert
  with check (true);

-- SELECT/UPDATE/DELETE: Restricted to admin or manager
drop policy if exists "Allow all other operations for admin/manager on reservations" on public.reservations;
create policy "Allow all other operations for admin/manager on reservations"
  on public.reservations for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.8 CONTACTS POLICIES
-- INSERT: Anyone can submit a contact message
drop policy if exists "Allow anonymous insert on contacts" on public.contacts;
create policy "Allow anonymous insert on contacts"
  on public.contacts for insert
  with check (true);

-- SELECT/UPDATE/DELETE: Restricted to admin or manager
drop policy if exists "Allow all other operations for admin/manager on contacts" on public.contacts;
create policy "Allow all other operations for admin/manager on contacts"
  on public.contacts for all
  using (public.is_manager())
  with check (public.is_manager());


-- 4.9 SETTINGS POLICIES
-- SELECT: Public read for settings
drop policy if exists "Allow SELECT for all on settings" on public.settings;
create policy "Allow SELECT for all on settings"
  on public.settings for select
  using (true);

-- UPDATE/ALL: Full control restricted to admin
drop policy if exists "Allow full control for admin on settings" on public.settings;
create policy "Allow full control for admin on settings"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());


-- 4.10 LOGS POLICIES
-- INSERT: Allowed for any authenticated user
drop policy if exists "Allow INSERT for authenticated on logs" on public.logs;
create policy "Allow INSERT for authenticated on logs"
  on public.logs for insert
  with check (auth.uid() is not null);

-- SELECT: Only admin can read system logs
drop policy if exists "Allow SELECT for admin on logs" on public.logs;
create policy "Allow SELECT for admin on logs"
  on public.logs for select
  using (public.is_admin());


-- 4.11 REVIEWS POLICIES
-- INSERT: Anyone can submit a review
drop policy if exists "Allow INSERT for anyone on reviews" on public.reviews;
create policy "Allow INSERT for anyone on reviews"
  on public.reviews for insert
  with check (true);

-- SELECT: Anyone can read approved reviews, or manager can read all reviews
drop policy if exists "Allow read for everyone on approved reviews, or manager" on public.reviews;
create policy "Allow read for everyone on approved reviews, or manager"
  on public.reviews for select
  using (approved = true or public.is_manager());

-- UPDATE/DELETE: Restricted to admin/manager
drop policy if exists "Allow UPDATE/DELETE for admin/manager on reviews" on public.reviews;
create policy "Allow UPDATE/DELETE for admin/manager on reviews"
  on public.reviews for all
  using (public.is_manager())
  with check (public.is_manager());


-- ============================================================================
-- 5. STORAGE BUCKETS AND STORAGE POLICIES
-- ============================================================================

-- Ensure standard buckets exist
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('gallery', 'gallery', true),
  ('banners', 'banners', true),
  ('avatars', 'avatars', true),
  ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- NOTE: Policies on storage.objects are managed by Supabase storage ownership.
-- The following RLS and policy commands were removed because the current role
-- is not owner of storage.objects, which causes "must be owner of table objects".

-- If you need custom storage policies, configure them in the Supabase dashboard.


-- ============================================================================
-- 6. SEED DATA (Fully Idempotent)
-- ============================================================================

-- 6.1 SEED DEFAULT SETTINGS
insert into public.settings (
  id, logo, telefone, whatsapp, instagram, facebook, endereco, mapa_url, horario, email, cor_primaria, cor_secundaria, singleton_guard
)
values (
  '51111111-1111-1111-1111-111111111111',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80',
  '(99) 3317-2043',
  '5599333172043',
  'https://instagram.com/formosagrill',
  'https://facebook.com/formosagrill',
  'Av. Pres. Médici, 2296, Formosa, Timon - MA, CEP 65636-010',
  'https://maps.app.goo.gl/K4vABkqjkNgNS52QA',
  'Todos os dias, a partir das 18:00',
  'contato@formosagrill.com',
  '#e23e3e', -- Primary Red
  '#f59e0b', -- Secondary Amber
  true
)
on conflict (singleton_guard) do update
set logo = excluded.logo,
    telefone = excluded.telefone,
    whatsapp = excluded.whatsapp,
    instagram = excluded.instagram,
    facebook = excluded.facebook,
    endereco = excluded.endereco,
    mapa_url = excluded.mapa_url,
    horario = excluded.horario,
    email = excluded.email,
    cor_primaria = excluded.cor_primaria,
    cor_secundaria = excluded.cor_secundaria;

-- 6.2 SEED DEFAULT CATEGORIES
insert into public.categories (id, nome, ordem, ativa)
values
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Carnes', 10, true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Pizzas', 20, true),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Porções', 30, true),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Massas', 40, true),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Hambúrgueres', 50, true),
  ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Bebidas', 60, true),
  ('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Sobremesas', 70, true)
on conflict (id) do update
set nome = excluded.nome, ordem = excluded.ordem, ativa = excluded.ativa;

-- 6.3 SEED DEFAULT PRODUCTS (from restaurant.ts menu data)
insert into public.products (id, categoria, nome, descricao, preco, imagem, destaque, disponivel, ordem)
values
  -- CARNES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Picanha na Brasa', 'Picanha fatiada na brasa, farofa da casa, vinagrete e arroz. Serve 2 pessoas.', 109.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', true, true, 10),
  ('11111111-1111-1111-1111-111111111112', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Costela no Bafo', 'Costela bovina assada lentamente por 8 horas, mandioca e molho barbecue.', 94.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', false, true, 20),
  ('11111111-1111-1111-1111-111111111113', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Maminha Grelhada', 'Maminha macia grelhada na brasa com legumes salteados e arroz biro-biro.', 86.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', false, true, 30),
  ('11111111-1111-1111-1111-111111111114', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mixed Grill Formosa', 'Picanha, linguiça artesanal, frango e coração com acompanhamentos. Serve 3.', 139.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', false, true, 40),

  -- PIZZAS ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e')
  ('22222222-2222-2222-2222-222222222221', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Margherita Artesanal', 'Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite.', 54.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', false, true, 10),
  ('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Calabresa Especial', 'Calabresa artesanal fatiada, cebola roxa, muçarela e orégano.', 52.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', true, true, 20),
  ('22222222-2222-2222-2222-222222222223', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Frango com Catupiry', 'Frango desfiado temperado, catupiry cremoso e milho verde.', 56.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', false, true, 30),
  ('22222222-2222-2222-2222-222222222224', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Portuguesa da Casa', 'Presunto, ovos, cebola, azeitonas, pimentão e muçarela.', 55.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', false, true, 40),

  -- PORÇÕES ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f')
  ('33333333-3333-3333-3333-333333333331', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Batata Frita Rústica', 'Batatas rústicas crocantes com alecrim e maionese da casa.', 39.90, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&q=80', false, true, 10),
  ('33333333-3333-3333-3333-333333333332', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Isca de Frango', 'Iscas empanadas crocantes com molho especial. Serve 2 pessoas.', 46.90, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=1200&q=80', false, true, 20),
  ('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Calabresa Acebolada', 'Calabresa artesanal acebolada com pão de alho e vinagrete.', 44.90, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', false, true, 30),

  -- MASSAS ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a')
  ('44444444-4444-4444-4444-444444444441', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Fettuccine ao Molho Branco', 'Fettuccine fresco ao molho branco cremoso com filé em tiras.', 62.90, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=1200&q=80', false, true, 10),
  ('44444444-4444-4444-4444-444444444442', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Espaguete à Bolonhesa', 'Espaguete al dente com molho bolonhesa da casa e parmesão.', 49.90, 'https://images.unsplash.com/photo-156379971899-660589a01cd3?w=1200&q=80', false, true, 20),

  -- HAMBÚRGUERES ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b')
  ('55555555-5555-5555-5555-555555555551', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Formosa Burger', 'Blend 180g na brasa, cheddar, bacon crocante, alface e molho especial.', 42.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80', true, true, 10),
  ('55555555-5555-5555-5555-555555555552', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Smash Duplo', 'Dois smash de 100g, queijo prato duplo, picles e cebola caramelizada.', 44.90, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=1200&q=80', false, true, 20),

  -- BEBIDAS ('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c')
  ('66666666-6666-6666-6666-666666666661', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Chopp Gelado 500ml', 'Chopp claro sempre trincando de gelado.', 14.90, 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=1200&q=80', false, true, 10),
  ('66666666-6666-6666-6666-666666666662', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Caipirinha da Casa', 'Cachaça artesanal, limão fresco e gelo.', 22.90, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&q=80', false, true, 20),
  ('66666666-6666-6666-6666-666666666663', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Suco Natural 500ml', 'Laranja, abacaxi, maracujá ou acerola.', 12.90, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=1200&q=80', false, true, 30),
  ('66666666-6666-6666-6666-666666666664', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Refrigerante Lata', 'Linha completa gelada.', 7.90, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&q=80', false, true, 40),

  -- SOBREMESAS ('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d')
  ('77777777-7777-7777-7777-777777777771', 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Petit Gâteau', 'Bolo quente de chocolate com sorvete de creme.', 27.90, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80', true, true, 10),
  ('77777777-7777-7777-7777-777777777772', 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Pizza de Chocolate', 'Massa artesanal, chocolate ao leite e morangos.', 49.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', false, true, 20),
  ('77777777-7777-7777-7777-777777777773', 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Pudim da Casa', 'Pudim cremoso de leite condensado com calda de caramelo.', 18.90, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80', false, true, 30)
on conflict (id) do update
set categoria = excluded.categoria,
    nome = excluded.nome,
    descricao = excluded.descricao,
    preco = excluded.preco,
    imagem = excluded.imagem,
    destaque = excluded.destaque,
    disponivel = excluded.disponivel,
    ordem = excluded.ordem;

-- 6.4 SEED DEFAULT GALLERY ITEMS (from gallery.tsx)
insert into public.gallery (id, titulo, imagem, ordem, ativo)
values
  ('81111111-1111-1111-1111-111111111111', 'Carnes na brasa', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', 10, true),
  ('82222222-2222-2222-2222-222222222222', 'Pizzas artesanais', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', 20, true),
  ('83333333-3333-3333-3333-333333333333', 'Drinks & bebidas', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80', 30, true),
  ('84444444-4444-4444-4444-444444444444', 'Sobremesas', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80', 40, true),
  ('85555555-5555-5555-5555-555555555555', 'Ambiente', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', 50, true),
  ('86666666-6666-6666-6666-666666666666', 'Clientes felizes', 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80', 60, true)
on conflict (id) do update
set titulo = excluded.titulo,
    imagem = excluded.imagem,
    ordem = excluded.ordem,
    ativo = excluded.ativo;

-- 6.5 SEED DEFAULT BANNERS (from Hero)
insert into public.banners (id, titulo, subtitulo, imagem, botao, link, ativo, ordem)
values
  ('91111111-1111-1111-1111-111111111111', 'O verdadeiro sabor do churrasco', 'Carnes selecionadas na brasa, atendimento acolhedor e ambiente para toda a família.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', 'Reservar Mesa', '/reservas', true, 10),
  ('92222222-2222-2222-2222-222222222222', 'Pizzas Artesanais de Longa Fermentação', 'Massa leve, ingredientes frescos e assadas em alta temperatura.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', 'Ver Cardápio', '/cardapio', true, 20)
on conflict (id) do update
set titulo = excluded.titulo,
    subtitulo = excluded.subtitulo,
    imagem = excluded.imagem,
    botao = excluded.botao,
    link = excluded.link,
    ativo = excluded.ativo,
    ordem = excluded.ordem;

-- 6.6 SEED DEFAULT REVIEWS (marked as approved=true)
insert into public.reviews (id, nome, stars, text, approved)
values
  ('a1111111-1111-1111-1111-111111111111', 'Ana Carolina', 5, 'Excelente comida e ambiente para toda a família. Voltaremos com certeza!', true),
  ('a2222222-2222-2222-2222-222222222222', 'Rodrigo Melo', 5, 'Carnes muito saborosas e atendimento excelente. A picanha na brasa é imperdível.', true),
  ('a3333333-3333-3333-3333-333333333333', 'Juliana Sousa', 4, 'Ótimo lugar para jantar com amigos. As pizzas artesanais surpreendem.', true),
  ('a4444444-4444-4444-4444-444444444444', 'Marcos Vinícius', 5, 'Melhor churrascaria de Timon. Porções generosas e cerveja sempre gelada.', true)
on conflict (id) do update
set nome = excluded.nome,
    stars = excluded.stars,
    text = excluded.text,
    approved = excluded.approved;

-- ============================================================================
-- END OF MIGRATION FILE
-- ============================================================================
