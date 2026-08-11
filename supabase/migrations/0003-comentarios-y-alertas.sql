-- Migración 0003 — comentarios públicos y avisos en conflicto.
--
-- Modelo de moderación: la comunidad evalúa, no un censor. Un comentario de
-- tipo 'warning' no tumba el aviso; lo marca en conflicto para que quien lo lea
-- proceda con cuidado y pueda leer qué pasó y qué respondió el autor.
--
-- Dos líneas trazadas a propósito:
--   * La MARCA de conflicto es pública (va en posts.warning_count) para que
--     hasta un visitante anónimo vea la advertencia.
--   * El TEXTO de los testimonios solo lo leen cuentas con sesión. Una
--     acusación con nombre propio no debe quedar indexable ni raspable.

create type comment_kind as enum (
  'comment',   -- aporte normal: "yo tengo parte de eso", "ya lo llevé"
  'warning'    -- alerta: algo salió mal con este aviso o con quien lo publicó
);

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

-- Evaluación de los demás: ¿este testimonio te cuadra o no?
create table comment_votes (
  comment_id uuid not null references post_comments (id) on delete cascade,
  voter_id   uuid not null references profiles (id) on delete cascade,
  agrees     boolean not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, voter_id)
);

-- Contador desnormalizado: es lo único del conflicto que ve un anónimo, y
-- evita que el tablero tenga que contar comentarios en cada carga.
alter table posts
  add column if not exists warning_count integer not null default 0;

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
-- RLS
-- ---------------------------------------------------------------------------

alter table post_comments enable row level security;
alter table comment_votes enable row level security;

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

-- ---------------------------------------------------------------------------
-- Nombrar al primer administrador (a mano, una sola vez):
--
--   update profiles set is_admin = true
--    where id = (select id from auth.users where email = 'tu-correo@gmail.com');
-- ---------------------------------------------------------------------------
