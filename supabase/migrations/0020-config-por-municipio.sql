-- Migración 0020 — configuración editable por municipio.
--
-- El número al que se reportan puntos nuevos vivía en `src/config/municipios.ts`,
-- o sea dentro del paquete compilado: cambiarlo exigía un commit y un
-- despliegue. Eso servía mientras el único que respondía era Juan.
--
-- Ahora quien responde en Filandia es alguien de la alcaldía, y ese turno va a
-- rotar —vacaciones, cambio de administración—. Cada rotación no puede ser una
-- dependencia de un desarrollador: la alcaldía tiene que poder cambiarlo un
-- domingo desde el panel de gestión. Ese es el driver de esta tabla.
--
-- POR QUÉ SOLO ESTO Y NO TODO EL MUNICIPIO:
-- Las veredas, las coordenadas del mapa, la marca y la URL siguen en el repo.
-- Cambian una vez al año y se benefician de pasar por un diff revisable. Lo
-- único que baja a la base es lo que tiene un dueño no técnico que lo cambia
-- con frecuencia. Una tabla `municipios` completa sería resolver un problema
-- que todavía no existe.
--
-- El código conserva los valores de `municipios.ts` como respaldo, así que
-- esta migración y el despliegue pueden ir en cualquier orden: con la tabla
-- vacía el sitio sigue mostrando el número de siempre.

create table if not exists municipio_config (
  -- Mismo identificador que NEXT_PUBLIC_MUNICIPIO y que places.municipio.
  municipio text primary key,

  -- Solo dígitos, con indicativo de país: es lo que se pega en un enlace
  -- wa.me. Vacío significa "sin canal de reportes" y el botón desaparece del
  -- sitio, que es preferible a un botón que no lleva a ninguna parte.
  whatsapp_reportes text
    check (whatsapp_reportes is null or whatsapp_reportes ~ '^[0-9]{10,15}$'),

  -- Quién está respondiendo ese número. No se publica; se muestra solo en el
  -- panel. Cuando el turno rote, quien entre necesita saber a quién releva.
  responsable text check (length(responsable) <= 80),

  updated_at timestamptz not null default now()
);

comment on table municipio_config is
  'Ajustes que la alcaldía de cada municipio mantiene sin pasar por un despliegue.';

drop trigger if exists municipio_config_touch_updated_at on municipio_config;
create trigger municipio_config_touch_updated_at
  before update on municipio_config
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Valores actuales, los mismos que hoy están en el código.
--
-- `on conflict do nothing`: si la tabla ya existe con datos, correr esto de
-- nuevo no debe pisar un número que alguien ya cambió desde el panel.
-- ---------------------------------------------------------------------------

insert into municipio_config (municipio, whatsapp_reportes, responsable)
values
  ('cali',     '573113179404', 'Juan Andrés Cano'),
  ('filandia', '573113179404', 'Juan Andrés Cano (temporal)')
on conflict (municipio) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
--
-- Lectura pública: el sitio la consulta con el cliente anónimo desde páginas
-- cacheadas, igual que `places`. Y de todas formas ese número se publica en
-- un botón, no hay nada que esconder.
--
-- Escritura: el admin en cualquier municipio; el gestor solo en el suyo.
-- ---------------------------------------------------------------------------

alter table municipio_config enable row level security;

drop policy if exists municipio_config_select_public on municipio_config;
create policy municipio_config_select_public on municipio_config
  for select using (true);

drop policy if exists municipio_config_admin on municipio_config;
create policy municipio_config_admin on municipio_config
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- Solo UPDATE, no `for all`: un gestor mantiene su municipio, no crea ni
-- borra municipios. Dar de alta uno nuevo es parte de desplegarlo, y va con
-- su `insert` en la migración correspondiente.
drop policy if exists municipio_config_gestor on municipio_config;
create policy municipio_config_gestor on municipio_config
  for update to authenticated
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

-- Privilegios por columna, como en `profiles`. El `with check` de arriba ya
-- impide mover la fila a otro municipio; esto lo impide un nivel más abajo,
-- en Postgres, sin depender de que la política esté bien escrita.
grant select on municipio_config to anon, authenticated;
revoke update on municipio_config from authenticated;
grant update (whatsapp_reportes, responsable) on municipio_config to authenticated;

-- ---------------------------------------------------------------------------
-- Comprobación:
--
--   select * from municipio_config order by municipio;
--
-- Al agregar un municipio nuevo, además de su entrada en municipios.ts:
--
--   insert into municipio_config (municipio, whatsapp_reportes, responsable)
--   values ('xxx', '57...', 'Nombre');
-- ---------------------------------------------------------------------------
