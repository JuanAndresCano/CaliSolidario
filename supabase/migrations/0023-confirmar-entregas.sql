-- Migración 0023 — alguien de confianza puede cerrar avisos que no son suyos.
--
-- El caso viene de Filandia: el vecino publica la necesidad en nombre de otro,
-- el punto de acopio entrega la ayuda, y el aviso se queda abierto para
-- siempre porque solo el autor podía cerrarlo. El tablero termina lleno de
-- necesidades ya resueltas, que es el peor dato posible: manda voluntarios a
-- donde ya no hacen falta.
--
-- POR QUÉ NO SE LLAMA "MODERADOR". Un moderador retira contenido. Esta persona
-- confirma entregas y nada más. Si el permiso se llamara "moderador", tarde o
-- temprano alguien asumiría que también puede ocultar el aviso de un
-- ciudadano, y esa facultad no se la estamos dando a nadie fuera del admin.
-- El nombre describe la facultad, no el cargo.
--
-- POR QUÉ NO SE CUELGA DEL GESTOR. La alcaldía autoriza los puntos de acopio
-- pero no le da cuenta de usuario a quien trabaja en ellos. Son personas
-- distintas y facultades distintas: mantener fichas de lugares no es lo mismo
-- que cerrar la solicitud de un ciudadano. Separados, se puede dar uno sin el
-- otro.

-- ---------------------------------------------------------------------------
-- 1. El permiso
-- ---------------------------------------------------------------------------

alter table profiles
  add column if not exists confirma_entregas_municipio text;

comment on column profiles.confirma_entregas_municipio is
  'Municipio en el que esta persona puede marcar avisos ajenos como cumplidos. NULL = no puede.';

create or replace function confirma_entregas_de()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select confirma_entregas_municipio from profiles where id = auth.uid();
$$;

-- Igual que con `gestor_municipio`: el permiso no se lo puede dar nadie a sí
-- mismo por la API, porque los privilegios de columna de `profiles` solo
-- dejan escribir display_name e is_banned.
revoke update on profiles from authenticated;
grant update (display_name, is_banned) on profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Quién cerró el aviso
--
-- Cerrar algo ajeno sin dejar rastro es pedir que se use mal. Con la columna,
-- el autor ve quién lo hizo y tú puedes revisar si alguien se está pasando.
--
-- OJO para el futuro: con esto `posts` pasa a referenciar `profiles` DOS veces
-- (author_id y fulfilled_by). Cualquier consulta de PostgREST que pida
-- `profiles(...)` sobre `posts` tiene que nombrar la llave foránea, o
-- responderá 300 PGRST201 y fallará entera. Es exactamente el fallo que dejó
-- los comentarios sin funcionar desde el lanzamiento.
-- ---------------------------------------------------------------------------

alter table posts
  add column if not exists fulfilled_by uuid references profiles (id);

comment on column posts.fulfilled_by is
  'Quién marcó el aviso como cumplido. NULL en los cerrados antes de la 0023.';

-- La 0004 dejó los privilegios de escritura en (status, fulfilled_at). Hay que
-- sumar la columna nueva o el update la rechaza antes de llegar a RLS.
revoke update on posts from authenticated;
grant update (status, fulfilled_at, fulfilled_by) on posts to authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS: solo la transición abierto -> cumplido, solo en su municipio
--
-- `using` mira la fila VIEJA y `with check` la NUEVA, así que entre las dos
-- dejan pasar esa transición y ninguna otra. No hace falta confiar en que la
-- función se comporte: aunque alguien llamara a la API directamente, no puede
-- retirar un aviso ni reabrirlo.
-- ---------------------------------------------------------------------------

drop policy if exists posts_update_confirmador on posts;

create policy posts_update_confirmador on posts
  for update to authenticated
  using (
    confirma_entregas_de() is not null
    and municipio = confirma_entregas_de()
    and status = 'open'
    and not exists (select 1 from profiles where id = auth.uid() and is_banned)
  )
  with check (
    confirma_entregas_de() is not null
    and municipio = confirma_entregas_de()
    and status = 'fulfilled'
  );

-- ---------------------------------------------------------------------------
-- 4. La función que cierra
--
-- Se conserva `security invoker`: RLS sigue siendo la frontera real. La
-- condición de abajo es explícita además de RLS, no en su lugar.
-- ---------------------------------------------------------------------------

create or replace function mark_fulfilled(p_post_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  update posts
     set status = 'fulfilled',
         fulfilled_at = now(),
         fulfilled_by = auth.uid()
   where id = p_post_id
     and status = 'open'
     and (
       author_id = auth.uid()
       or municipio = confirma_entregas_de()
     );

  if not found then
    raise exception 'No se pudo marcar el aviso como cumplido. O ya estaba cerrado, o no es tuyo y no tienes permiso para confirmar entregas en ese municipio.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Para dar el permiso, cuando la alcaldía señale a alguien:
--
--   update profiles set confirma_entregas_municipio = 'filandia'
--    where id = (select id from auth.users where email = 'persona@ejemplo.com');
--
-- Para quitarlo:
--
--   update profiles set confirma_entregas_municipio = null where id = '...';
--
-- Para revisar qué ha cerrado cada quien:
--
--   select p.title, p.fulfilled_at, pr.display_name
--     from posts p join profiles pr on pr.id = p.fulfilled_by
--    where p.fulfilled_by is distinct from p.author_id
--    order by p.fulfilled_at desc;
-- ---------------------------------------------------------------------------
