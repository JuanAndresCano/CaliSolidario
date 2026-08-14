-- Migración 0015 — avisar al sitio cuando cambian los datos.
--
-- Equivale a un "Database Webhook" del panel de Supabase, pero escrito a mano:
-- por debajo esa función es exactamente esto, un trigger que hace una petición
-- HTTP con pg_net. Hacerlo en SQL tiene dos ventajas: queda versionado en el
-- repo y no depende de dónde esté el botón en el panel esta semana.
--
-- ANTES DE CORRER: reemplaza EL_SECRETO por el valor de REVALIDATE_SECRET que
-- pusiste en Vercel. Tiene que ser idéntico o el endpoint responde 401.
--
-- Nota sobre el secreto: queda guardado dentro de la definición de la función,
-- o sea visible para quien tenga acceso a la base. Es aceptable —el panel de
-- Supabase lo guarda igual— y ese secreto solo permite purgar caché, no leer
-- ni escribir datos. Si algún día quieres esconderlo, Supabase Vault es el
-- camino.

create extension if not exists pg_net;

create or replace function notificar_revalidacion()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
begin
  perform net.http_post(
    url := 'https://calisolidario.triadaaliados.com/api/revalidar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-revalidate-secret', 'EL_SECRETO'
    ),
    body := jsonb_build_object(
      'tabla', tg_table_name,
      'evento', tg_op
    )
  );
  return null;
end;
$$;

-- `for each statement` y no `for each row`: un update masivo debe disparar UNA
-- petición, no una por fila. Purgar la caché dos veces da lo mismo que una.

drop trigger if exists places_revalidar on places;
create trigger places_revalidar
  after insert or update or delete on places
  for each statement execute function notificar_revalidacion();

drop trigger if exists posts_revalidar on posts;
create trigger posts_revalidar
  after insert or update or delete on posts
  for each statement execute function notificar_revalidacion();

-- ---------------------------------------------------------------------------
-- Para comprobar que funciona, después de desplegar:
--
--   update places set confirmed_at = now() where name = 'Coliseo El Pueblo';
--
-- y luego revisar que la petición salió y qué respondió (200 = bien):
--
--   select id, created, status_code, error_msg, content
--     from net._http_response order by id desc limit 5;
--
-- Si los nombres de columna no coinciden (pg_net los cambió entre versiones),
-- mira la tabla completa y ya:
--
--   select * from net._http_response order by id desc limit 5;
-- ---------------------------------------------------------------------------
