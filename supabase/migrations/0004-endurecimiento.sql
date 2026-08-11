-- Migración 0004 — endurecimiento tras la revisión de seguridad (2026-08-11).
-- Requiere haber aplicado la 0003 (usa is_admin() y post_comments).
--
-- Corrige, en orden de gravedad:
--   1. Un usuario bloqueado podía desbloquearse solo (UPDATE a su propio perfil).
--   2. El autor de un aviso podía, vía la API REST, reescribir título y
--      descripción después de acumular alertas, poner warning_count en 0,
--      resucitar un aviso retirado por un admin y extender expires_at.
--   3. Borrar un aviso era un DELETE físico: arrastraba en cascada las alertas
--      de la comunidad, o sea la evidencia contra un estafador.
--   4. Cualquier anónimo podía leer profiles completo (nombres reales y
--      quiénes son admins).
--   5. Sin límite de frecuencia en comentarios: spam barato con una cuenta.
--   6. El registro fallaba si el nombre de Google supera los 60 caracteres.
--   7. Carrera en el límite de 3 avisos abiertos (dos inserts simultáneos).

-- ---------------------------------------------------------------------------
-- 1. Nadie se desbloquea a sí mismo
--
-- El fallo estaba en el USING: comprobaba dueño pero no estado. El bloqueado
-- pasaba el USING (es su fila) y el CHECK (la fila nueva dice is_banned=false).
-- ---------------------------------------------------------------------------

drop policy profiles_update_own on profiles;

create policy profiles_update_own on profiles
  for update to authenticated
  using (id = auth.uid() and not is_banned)
  with check (id = auth.uid() and is_admin = false and is_banned = false);

-- ---------------------------------------------------------------------------
-- 2. El autor solo puede cambiar el estado de su aviso, y solo hacia adelante
--
-- Privilegios por columna: la app nunca edita título/descripción tras crear,
-- así que la API tampoco debe permitirlo. El UPDATE de authenticated queda
-- reducido a (status, fulfilled_at); el resto, denegado antes de llegar a RLS.
-- El trigger security definer que mantiene warning_count corre como dueño de
-- la tabla y no lo afecta este revoke.
-- ---------------------------------------------------------------------------

revoke update on posts from authenticated;
grant update (status, fulfilled_at) on posts to authenticated;

-- Y las transiciones de estado válidas para no-admins: cerrar, nunca reabrir.
create or replace function posts_guard_immutable()
returns trigger language plpgsql as $$
begin
  if new.author_id  is distinct from old.author_id
  or new.kind       is distinct from old.kind
  or new.created_at is distinct from old.created_at then
    raise exception 'Estos campos no se pueden modificar';
  end if;

  if new.status is distinct from old.status and not is_admin() then
    -- open puede cerrarse (cumplido, retirado o vencido —el cron corre sin
    -- sesión y cae aquí—); un aviso ya cerrado solo puede pasar a retirado.
    -- Reabrir es exclusivo de administradores.
    if not (
      (old.status = 'open' and new.status in ('fulfilled', 'removed', 'expired'))
      or (old.status in ('fulfilled', 'expired') and new.status = 'removed')
    ) then
      raise exception 'Esa transición de estado no está permitida';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Borrar es soft-delete: la evidencia sobrevive
--
-- Sin política de DELETE nadie borra filas de posts por la API. La app pasa a
-- marcar status='removed' (el aviso desaparece del tablero y de "Mis avisos",
-- pero las alertas de la comunidad quedan para el admin).
-- ---------------------------------------------------------------------------

drop policy posts_delete_own on posts;

-- ---------------------------------------------------------------------------
-- 4. Los perfiles no se leen sin sesión, y ser admin no se otorga por la API
-- ---------------------------------------------------------------------------

drop policy profiles_select_public on profiles;

create policy profiles_select_authenticated on profiles
  for select to authenticated using (true);

revoke update on profiles from authenticated;
grant update (display_name, is_banned) on profiles to authenticated;
-- (is_banned sigue gobernado por RLS: solo un admin pasa la política para
--  cambiárselo a otros; el CHECK de arriba impide auto-asignárselo.)

-- ---------------------------------------------------------------------------
-- 5. Límite de frecuencia en comentarios
-- ---------------------------------------------------------------------------

create index post_comments_author_recent_idx
  on post_comments (author_id, created_at desc);

create function post_comments_enforce_rate_limit()
returns trigger language plpgsql as $$
declare
  recent int;
begin
  select count(*) into recent
    from post_comments
   where author_id = new.author_id
     and created_at > now() - interval '1 hour';

  if recent >= 15 then
    raise exception 'Has escrito muchos comentarios en poco tiempo. Espera un rato.';
  end if;

  return new;
end;
$$;

create trigger post_comments_enforce_rate_limit
  before insert on post_comments
  for each row execute function post_comments_enforce_rate_limit();

-- ---------------------------------------------------------------------------
-- 6. El registro no puede fallar por el nombre
--
-- display_name tiene check de 2 a 60 caracteres; un nombre de Google más largo
-- (o un correo de una letra) rompía el alta del usuario en pleno OAuth.
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name text;
begin
  name := left(trim(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  )), 60);

  if name is null or length(name) < 2 then
    name := 'Alguien';
  end if;

  insert into public.profiles (id, display_name) values (new.id, name);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Sin carrera en el límite de 3 avisos abiertos
--
-- El lock por autor serializa sus inserts dentro de la transacción; dos
-- peticiones simultáneas ya no pueden contar 2 y terminar ambas en 4.
-- ---------------------------------------------------------------------------

create or replace function posts_enforce_open_limit()
returns trigger language plpgsql as $$
declare
  open_count int;
begin
  perform pg_advisory_xact_lock(hashtext(new.author_id::text));

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

-- ---------------------------------------------------------------------------
-- Higiene: por si el revoke de la 0001 editada no se llegó a correr.
-- ---------------------------------------------------------------------------

revoke execute on function expire_old_posts() from anon, authenticated;
