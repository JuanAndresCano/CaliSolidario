-- Migración 0017 — un solo despliegue por municipio, una sola base.
--
-- Dos cosas:
--
--   1. Columna `municipio` en posts y places. Cada despliegue filtra por la
--      suya, así que dos sitios distintos comparten esquema y migraciones.
--      Todo lo que existe hoy es de Cali, por eso el default.
--
--   2. Rol de GESTOR: alguien que mantiene los lugares de SU municipio sin ser
--      administrador del sitio. Es lo que permite que la alcaldía actualice
--      sus propios acopios y albergues en vez de que lo haga una persona a
--      mano en la consola de Supabase.
--
-- La separación entre municipios en LECTURA es de la aplicación, no de RLS:
-- los avisos son públicos de todos modos, así que mezclarlos sería un error de
-- correctitud, no una fuga. En ESCRITURA sí la impone RLS, porque ahí sí hay
-- un límite de privilegio real: un gestor de Filandia no puede tocar Cali.

-- ---------------------------------------------------------------------------
-- 1. Columna municipio
-- ---------------------------------------------------------------------------

alter table posts
  add column if not exists municipio text not null default 'cali';

alter table places
  add column if not exists municipio text not null default 'cali';

-- El tablero siempre filtra por municipio y estado a la vez.
create index if not exists posts_municipio_feed_idx
  on posts (municipio, status, created_at desc);

create index if not exists places_municipio_idx
  on places (municipio, kind, is_active);

-- ---------------------------------------------------------------------------
-- 2. Rol de gestor
--
-- Una columna y no una tabla de roles: el caso real es "esta persona mantiene
-- este municipio". Una tabla de roles sería resolver un problema que todavía
-- no existe.
-- ---------------------------------------------------------------------------

alter table profiles
  add column if not exists gestor_municipio text;

comment on column profiles.gestor_municipio is
  'Municipio cuyos lugares puede administrar. NULL = no es gestor.';

create or replace function gestor_de()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select gestor_municipio from profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 3. RLS: los gestores administran lugares, solo los de su municipio
-- ---------------------------------------------------------------------------

drop policy if exists places_gestor on places;

create policy places_gestor on places
  for all to authenticated
  using (
    gestor_de() is not null
    and municipio = gestor_de()
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  )
  with check (
    gestor_de() is not null
    and municipio = gestor_de()
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  );

-- El `with check` es lo que impide que un gestor de Filandia cree un lugar
-- marcándolo como de Cali: la fila resultante tiene que seguir siendo suya.

-- Un gestor NO puede otorgarse a sí mismo el rol ni cambiárselo a otro: la
-- política de perfiles solo permite editar display_name, y `gestor_municipio`
-- queda fuera de los privilegios de columna.
revoke update on profiles from authenticated;
grant update (display_name, is_banned) on profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Publicar avisos con su municipio
--
-- Se reemplaza la función: PostgREST resuelve por firma, así que hay que
-- eliminar la vieja o quedarían dos y llamaría a la que no es.
-- ---------------------------------------------------------------------------

drop function if exists create_post_with_contact(
  text, text, text, text, text, text, text, text, text, text);

create function create_post_with_contact(
  p_kind          text,
  p_category      text,
  p_title         text,
  p_description   text,
  p_quantity      text,
  p_comuna        text,
  p_barrio        text,
  p_address       text,
  p_method        text,
  p_contact_value text,
  -- CON VALOR POR DEFECTO a propósito: el código que está desplegado cuando se
  -- corre esta migración todavía llama a la función con diez parámetros. Sin
  -- el default, PostgREST no encontraría la firma y nadie podría publicar
  -- hasta que se despliegue el código nuevo. Con él, la migración y el
  -- despliegue pueden ir en cualquier orden.
  p_municipio     text default 'cali'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into posts (
    author_id, kind, category, title, description,
    quantity_text, comuna, barrio, address, municipio
  )
  values (
    auth.uid(), p_kind::post_kind, p_category::post_category, p_title,
    p_description, p_quantity, p_comuna, p_barrio, p_address, p_municipio
  )
  returning id into new_id;

  insert into post_contacts (post_id, method, value)
  values (new_id, p_method::contact_method, p_contact_value);

  return new_id;
end;
$$;

revoke execute on function create_post_with_contact(
  text, text, text, text, text, text, text, text, text, text, text) from anon;

grant execute on function create_post_with_contact(
  text, text, text, text, text, text, text, text, text, text, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Para nombrar a un gestor (a mano, cuando la alcaldía delegue):
--
--   update profiles set gestor_municipio = 'filandia'
--    where id = (select id from auth.users where email = 'persona@ejemplo.com');
--
-- Para quitarle el rol:
--
--   update profiles set gestor_municipio = null where id = '...';
-- ---------------------------------------------------------------------------
