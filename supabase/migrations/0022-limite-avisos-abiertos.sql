-- Migración 0022 — el límite de avisos abiertos sube de 3 a 10.
--
-- El 3 se puso el primer día, cuando el riesgo era que alguien inundara un
-- tablero vacío. Con el tablero funcionando el problema es el contrario: hay
-- gente coordinando varias necesidades a la vez —una familia, un edificio, un
-- barrio— y tres casillas la obligaban a cerrar avisos vivos para publicar
-- otro, que es exactamente el dato falso que no queremos.
--
-- EL NÚMERO VIVE EN UN SOLO SITIO. Estaba escrito a mano en dos funciones y en
-- dos textos de la interfaz; cambiarlo obligaba a acordarse de los cuatro. Del
-- lado de la base ahora es esta función; del lado del código,
-- MAX_AVISOS_ABIERTOS en src/lib/catalog.ts. Siguen siendo dos sitios, pero la
-- base es la que manda: si el código se queda atrás, lo peor que pasa es que
-- el texto mienta, no que el límite se salte.

create or replace function limite_avisos_abiertos()
returns int
language sql
immutable
as $$
  select 10;
$$;

comment on function limite_avisos_abiertos is
  'Cuántos avisos abiertos puede tener una persona a la vez. Lo consultan los triggers de INSERT y de reapertura.';

-- ---------------------------------------------------------------------------
-- 1. Al publicar (viene de la 0004)
--
-- El lock por autor serializa sus inserts dentro de la transacción; dos
-- peticiones simultáneas ya no pueden contar 9 y terminar ambas en 11.
-- ---------------------------------------------------------------------------

create or replace function posts_enforce_open_limit()
returns trigger language plpgsql as $$
declare
  open_count int;
  limite     int := limite_avisos_abiertos();
begin
  perform pg_advisory_xact_lock(hashtext(new.author_id::text));

  select count(*) into open_count
    from posts
   where author_id = new.author_id
     and status = 'open';

  if open_count >= limite then
    raise exception 'Ya tienes % avisos abiertos. Marca uno como cumplido para publicar otro.', limite;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Al reabrir (viene de la 0005)
--
-- Se reescribe la función entera porque `create or replace` no permite tocar
-- solo un trozo. Lo único que cambia respecto a la 0005 son las tres líneas
-- del límite; las reglas de transición de estado se conservan tal cual.
-- ---------------------------------------------------------------------------

create or replace function posts_guard_immutable()
returns trigger language plpgsql as $$
declare
  open_count int;
  limite     int := limite_avisos_abiertos();
begin
  if new.author_id  is distinct from old.author_id
  or new.kind       is distinct from old.kind
  or new.created_at is distinct from old.created_at then
    raise exception 'Estos campos no se pueden modificar';
  end if;

  if new.status is distinct from old.status and not is_admin() then
    if not (
      (old.status = 'open' and new.status in ('fulfilled', 'removed', 'expired'))
      or (old.status in ('fulfilled', 'expired') and new.status = 'removed')
      -- Deshacer el propio cierre: lo que no se permite es revivir un aviso
      -- retirado por moderación.
      or (old.status in ('fulfilled', 'expired') and new.status = 'open')
    ) then
      raise exception 'Esa transición de estado no está permitida';
    end if;
  end if;

  -- Reabrir no puede saltarse el límite: el trigger que lo vigila solo corre
  -- en INSERT.
  if new.status = 'open' and old.status <> 'open' then
    perform pg_advisory_xact_lock(hashtext(new.author_id::text));

    select count(*) into open_count
      from posts
     where author_id = new.author_id
       and status = 'open'
       and id <> new.id;

    if open_count >= limite then
      raise exception 'Ya tienes % avisos abiertos. Cierra uno para volver a publicar este.', limite;
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Comprobación:
--
--   select limite_avisos_abiertos();   -- 10
--
-- Y quién está cerca del tope hoy:
--
--   select author_id, count(*) as abiertos
--     from posts where status = 'open'
--    group by author_id having count(*) >= 3
--    order by abiertos desc;
-- ---------------------------------------------------------------------------
