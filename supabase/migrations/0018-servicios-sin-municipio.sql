-- Migración 0018 — servicios disponibles desde cualquier municipio.
--
-- Un acompañamiento por videollamada no está "en Cali": está disponible para
-- quien tenga internet, viva donde viva. Duplicar la ficha en cada municipio
-- obligaría a mantener dos filas en sincronía —cupos, horario, descripción— y
-- se desincronizarían al primer cambio.
--
-- La columna `municipio` se conserva y sigue siendo obligatoria: indica QUIÉN
-- es dueño de la ficha, o sea quién la mantiene desde su panel de gestión. Lo
-- que cambia es DÓNDE se muestra.

alter table places
  add column if not exists disponible_en_todos boolean not null default false;

comment on column places.disponible_en_todos is
  'Se muestra en todos los municipios, no solo en el suyo. Para servicios sin sede física.';

-- Solo los servicios pueden marcarse así. Un punto de acopio o un albergue
-- tienen dirección física: mostrarlos en otro municipio mandaría gente a
-- cruzar el país con un mercado.
alter table places drop constraint if exists solo_servicios_sin_municipio;

alter table places add constraint solo_servicios_sin_municipio check (
  disponible_en_todos = false or kind = 'servicio'
);

-- ---------------------------------------------------------------------------
-- El acompañamiento emocional de Tríada Aliados es virtual, por Google Meet.
-- ---------------------------------------------------------------------------

update places
   set disponible_en_todos = true,
       confirmed_at = now()
 where name = 'Acompañamiento emocional gratuito';
