-- CaliSolidario — esquema F0
-- Ejecutar en el SQL Editor de Supabase (una sola vez, es idempotente en lo posible).

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type post_kind   as enum ('need', 'offer');
create type post_status as enum ('open', 'fulfilled', 'expired', 'removed');

create type post_category as enum (
  'agua',
  'alimentos',
  'medicamentos',
  'aseo',
  'panales',
  'ropa',
  'cobijas_colchones',
  'albergue',
  'transporte',
  'herramientas',
  'mano_de_obra',
  'salud',
  'mascotas',
  'otro'
);

create type contact_method as enum ('whatsapp', 'telefono', 'otro');

create type comment_kind as enum (
  'comment',   -- aporte normal: "yo tengo parte de eso", "ya lo llevé"
  'warning'    -- alerta: algo salió mal con este aviso o con quien lo publicó
);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text        not null check (length(trim(display_name)) between 2 and 60),
  is_banned    boolean     not null default false,
  is_admin     boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Cada usuario nuevo de auth.users obtiene su fila en profiles automáticamente.
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------

create table posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references profiles (id) on delete cascade,
  kind         post_kind     not null,
  category     post_category not null,
  title        text not null check (length(trim(title)) between 5 and 90),
  description  text not null check (length(trim(description)) between 10 and 1000),
  quantity_text text        check (length(quantity_text) <= 60),
  -- Opcional a propósito: son 37 comunas y corregimientos, y exigir la correcta
  -- es fricción para alguien que está pidiendo ayuda con afán.
  comuna       text,
  barrio       text          check (length(barrio) <= 60),
  -- Pública a propósito: es el dato por el que las brigadas llegan al sitio.
  address      text          check (address is null or length(trim(address)) between 5 and 160),
  status       post_status not null default 'open',
  -- Alertas vigentes. Es lo único del conflicto que ve un anónimo; el texto de
  -- los testimonios exige sesión.
  warning_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '7 days',
  fulfilled_at timestamptz
);

-- El listado siempre filtra por status y ordena por fecha; este índice cubre
-- la consulta principal sin tocar el resto de la tabla.
create index posts_feed_idx on posts (status, created_at desc);
create index posts_kind_category_idx on posts (kind, category) where status = 'open';
create index posts_author_idx on posts (author_id);

create function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on posts
  for each row execute function touch_updated_at();

-- Campos que nadie puede reescribir después de crear el aviso.
create function posts_guard_immutable()
returns trigger language plpgsql as $$
begin
  if new.author_id  is distinct from old.author_id
  or new.kind       is distinct from old.kind
  or new.created_at is distinct from old.created_at then
    raise exception 'Estos campos no se pueden modificar';
  end if;
  return new;
end;
$$;

create trigger posts_guard_immutable
  before update on posts
  for each row execute function posts_guard_immutable();

-- Antispam más barato que cualquier rate limiter externo: 3 avisos abiertos
-- por persona. Para publicar otro tienes que cerrar uno.
create function posts_enforce_open_limit()
returns trigger language plpgsql as $$
declare
  open_count int;
begin
  select count(*) into open_count
    from posts
   where author_id = new.author_id
     and status = 'open';

  if open_count >= 3 then
    raise exception 'Ya tienes 3 avisos abiertos. Marca uno como cumplido para publicar otro.';
  end if;

  return new;
end;
$$;

create trigger posts_enforce_open_limit
  before insert on posts
  for each row execute function posts_enforce_open_limit();

-- ---------------------------------------------------------------------------
-- post_contacts
--
-- Tabla aparte a propósito: RLS es a nivel de fila, no de columna. Separar el
-- contacto permite que el aviso sea público y el teléfono solo lo lea alguien
-- con sesión iniciada, con una sola política y sin vistas ni security definer.
-- ---------------------------------------------------------------------------

create table post_contacts (
  post_id uuid primary key references posts (id) on delete cascade,
  method  contact_method not null,
  value   text not null check (length(trim(value)) between 5 and 120),
  notes   text check (length(notes) <= 200)
);

-- ---------------------------------------------------------------------------
-- post_comments y comment_votes
--
-- La comunidad evalúa en vez de un censor: una alerta no tumba el aviso, lo
-- marca en conflicto para que quien lo lea proceda con cuidado, vea qué pasó y
-- lea la respuesta del autor.
-- ---------------------------------------------------------------------------

create table post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  author_id  uuid not null references profiles (id) on delete cascade,
  kind       comment_kind not null default 'comment',
  body       text not null check (length(trim(body)) between 10 and 1000),
  created_at timestamptz not null default now(),
  hidden_at  timestamptz,
  hidden_by  uuid references profiles (id)
);

create index post_comments_post_idx on post_comments (post_id, created_at);

create table comment_votes (
  comment_id uuid not null references post_comments (id) on delete cascade,
  voter_id   uuid not null references profiles (id) on delete cascade,
  agrees     boolean not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, voter_id)
);

create function sync_warning_count()
returns trigger
language plpgsql
security definer          -- actualiza `posts` aunque quien comenta no sea el autor
set search_path = public
as $$
declare
  target uuid := coalesce(new.post_id, old.post_id);
begin
  update posts
     set warning_count = (
       select count(*)
         from post_comments c
        where c.post_id = target
          and c.kind = 'warning'
          and c.hidden_at is null
     )
   where id = target;
  return null;
end;
$$;

create trigger post_comments_sync_warnings
  after insert or update or delete on post_comments
  for each row execute function sync_warning_count();

-- ---------------------------------------------------------------------------
-- Quién es administrador
--
-- Como función y no como subconsulta suelta: se usa en varias políticas y
-- `security definer` evita que la propia RLS de `profiles` interfiera.
-- ---------------------------------------------------------------------------

create function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- RPC: marcar cumplido
-- ---------------------------------------------------------------------------

create function mark_fulfilled(p_post_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  update posts
     set status = 'fulfilled',
         fulfilled_at = now()
   where id = p_post_id
     and author_id = auth.uid()
     and status = 'open';

  if not found then
    raise exception 'No se pudo marcar el aviso como cumplido';
  end if;
end;
$$;

-- Cron diario: los avisos vencidos salen del listado solos. Un tablero de
-- emergencia sin caducidad se llena de ruido en dos semanas.
create function expire_old_posts()
returns void
language sql
as $$
  update posts
     set status = 'expired'
   where status = 'open'
     and expires_at < now();
$$;

-- Solo la llama el cron (con la service_role o desde pg_cron). Sin este revoke
-- queda expuesta en la API pública; RLS haría que no modificara nada, pero no
-- hay razón para publicarla.
revoke execute on function expire_old_posts() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles      enable row level security;
alter table posts         enable row level security;
alter table post_contacts enable row level security;
alter table post_comments enable row level security;
alter table comment_votes enable row level security;

-- profiles: el nombre a mostrar es público; cada quien edita el suyo.
create policy profiles_select_public on profiles
  for select using (true);

create policy profiles_update_own on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = false and is_banned = false);

-- posts: lectura anónima de todo lo que no fue retirado.
create policy posts_select_public on posts
  for select using (status <> 'removed');

create policy posts_insert_own on posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and not exists (
      select 1 from profiles where id = auth.uid() and is_banned
    )
  );

create policy posts_update_own on posts
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy posts_delete_own on posts
  for delete to authenticated
  using (author_id = auth.uid());

-- post_contacts: el dato de contacto solo con sesión iniciada.
create policy post_contacts_select_authenticated on post_contacts
  for select to authenticated using (true);

create policy post_contacts_write_own on post_contacts
  for all to authenticated
  using (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- Leer los testimonios exige sesión. Los ocultos solo los ve un admin.
create policy post_comments_select_authenticated on post_comments
  for select to authenticated
  using (hidden_at is null or is_admin());

create policy post_comments_insert_own on post_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  );

-- Uno puede borrar lo suyo, pero no editarlo: un testimonio editado después de
-- que otros lo respaldaron dejaría de significar lo que respaldaron.
create policy post_comments_delete_own on post_comments
  for delete to authenticated
  using (author_id = auth.uid());

create policy post_comments_update_admin on post_comments
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy comment_votes_select_authenticated on comment_votes
  for select to authenticated using (true);

create policy comment_votes_write_own on comment_votes
  for all to authenticated
  using (voter_id = auth.uid())
  with check (
    voter_id = auth.uid()
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  );

-- El admin conserva la última palabra: retirar una estafa evidente y bloquear
-- cuentas. Es la válvula que una advertencia comunitaria no reemplaza.
create policy posts_select_admin on posts
  for select to authenticated using (is_admin());

create policy posts_update_admin on posts
  for update to authenticated
  using (is_admin()) with check (is_admin());

create policy profiles_update_admin on profiles
  for update to authenticated
  using (is_admin()) with check (is_admin());
