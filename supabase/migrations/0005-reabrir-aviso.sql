-- Migración 0005 — el autor puede reabrir un aviso que cerró por error.
--
-- La 0004 bloqueó toda reapertura para no-admins. El objetivo era impedir que
-- alguien resucitara un aviso que un moderador retiró; pero se llevó por
-- delante el caso legítimo, y en producción dos personas marcaron "resuelto"
-- a los 3 y 6 minutos de publicar, sin forma de deshacerlo.
--
-- La distinción correcta no es "reabrir sí o no", es CUÁL cierre se puede
-- deshacer:
--   * fulfilled -> open : lo cerró el autor, el autor lo reabre.
--   * expired   -> open : lo cerró el reloj, el autor lo revive.
--   * removed   -> open : lo cerró un moderador. Solo un admin lo reabre.

create or replace function posts_guard_immutable()
returns trigger language plpgsql as $$
declare
  open_count int;
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

  -- Reabrir no puede saltarse el límite de 3 avisos abiertos: el trigger que
  -- lo vigila solo corre en INSERT.
  if new.status = 'open' and old.status <> 'open' then
    perform pg_advisory_xact_lock(hashtext(new.author_id::text));

    select count(*) into open_count
      from posts
     where author_id = new.author_id
       and status = 'open'
       and id <> new.id;

    if open_count >= 3 then
      raise exception 'Ya tienes 3 avisos abiertos. Cierra uno para volver a publicar este.';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reparación de los dos avisos cerrados por error en producción.
-- Solo toca los que se "resolvieron" en menos de 10 minutos: ese patrón es el
-- del clic accidental, no el de una necesidad realmente satisfecha.
-- ---------------------------------------------------------------------------

update posts
   set status = 'open', fulfilled_at = null
 where status = 'fulfilled'
   and fulfilled_at - created_at < interval '10 minutes';
