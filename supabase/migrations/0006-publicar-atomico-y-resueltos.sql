-- Migración 0006 — publicar en una sola transacción, y soporte al panel de
-- ayudas concretadas.
--
-- Bug corregido: `createPost` hacía dos inserts (posts, luego post_contacts) y,
-- si el segundo fallaba, deshacía el primero con un DELETE. Pero la 0004
-- eliminó la política de DELETE sobre posts (el borrado pasó a ser suave), así
-- que ese rollback dejó de funcionar en silencio: quedaba un aviso publicado
-- SIN datos de contacto, o sea inservible, y la persona veía un error.
--
-- El arreglo no es reparar el rollback: es que no haga falta. Una función
-- hace los dos inserts en la misma transacción, así que o entran los dos o no
-- entra ninguno. `security invoker` mantiene RLS y todos los triggers vigentes.

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
  p_contact_value text
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
    quantity_text, comuna, barrio, address
  )
  values (
    auth.uid(), p_kind::post_kind, p_category::post_category, p_title,
    p_description, p_quantity, p_comuna, p_barrio, p_address
  )
  returning id into new_id;

  insert into post_contacts (post_id, method, value)
  values (new_id, p_method::contact_method, p_contact_value);

  return new_id;
end;
$$;

revoke execute on function create_post_with_contact(
  text, text, text, text, text, text, text, text, text, text) from anon;

grant execute on function create_post_with_contact(
  text, text, text, text, text, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Panel de ayudas concretadas: el listado ordena por fulfilled_at.
-- ---------------------------------------------------------------------------

create index posts_fulfilled_idx on posts (fulfilled_at desc)
  where status = 'fulfilled';

-- ---------------------------------------------------------------------------
-- Diagnóstico: avisos que quedaron sin contacto por el bug de arriba.
-- Si esto devuelve filas, son avisos inservibles que conviene retirar.
--
--   select p.id, p.title, p.created_at
--     from posts p
--     left join post_contacts c on c.post_id = p.id
--    where c.post_id is null;
-- ---------------------------------------------------------------------------
