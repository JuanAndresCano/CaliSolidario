-- Migración 0007 — puntos de acopio y servicios verificados.
--
-- Entidad distinta a `posts` y a propósito:
--
--   posts  = avisos de personas. Efímeros, autopublicados, sin verificar, y su
--            contacto está protegido porque son individuos vulnerables.
--   places = puntos institucionales. Duraderos, curados y verificados por el
--            equipo, y su contacto ES público: son organizaciones que quieren
--            que las llamen, no personas expuestas.
--
-- Esa diferencia de exposición del contacto es intencional; ver ADR-0002.
--
-- Las coordenadas se guardan aquí para el mapa que viene. Son pocas y se
-- ponen a mano una sola vez: geocodificar direcciones libres de los avisos
-- sería caro y poco confiable.

-- Se puede volver a ejecutar sin errores: `create type` no admite
-- IF NOT EXISTS, así que va envuelto. Aplicar dos veces por error no debería
-- costarte un susto.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'place_kind') then
    create type place_kind as enum (
      'acopio',    -- punto donde se recibe o se entrega ayuda material
      'servicio'   -- servicio profesional puesto a disposición de la gente
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'service_category') then
    create type service_category as enum (
      'salud_mental',   -- acompañamiento emocional, psicología
      'estructural',    -- revisión de viviendas (exige tarjeta profesional)
      'salud_fisica',   -- fisioterapia, medicina, enfermería
      'juridico',       -- asesoría legal
      'veterinario',    -- atención a mascotas
      'otro'
    );
  end if;
end
$$;

create table if not exists places (
  id          uuid primary key default gen_random_uuid(),
  kind        place_kind not null,

  name        text not null check (length(trim(name)) between 3 and 100),
  org_name    text check (length(org_name) <= 100),
  description text check (length(description) <= 800),

  -- Solo para kind = 'servicio'.
  service_category service_category,

  address     text check (length(address) <= 160),
  comuna      text,
  lat         double precision check (lat is null or lat between -5 and 14),
  lng         double precision check (lng is null or lng between -82 and -66),

  -- Contacto público: son organizaciones, no individuos.
  contact_method contact_method,
  contact_value  text check (length(contact_value) <= 120),
  schedule       text check (length(schedule) <= 120),
  -- Un servicio profesional suele agendar por su propio sitio. Solo https.
  website        text check (website is null or website ~ '^https://'),
  -- Miniatura de la organización (normalmente su og:image). Solo https.
  image_url      text check (image_url is null or image_url ~ '^https://'),

  -- El estado que pediste: qué tienen, qué les sobra y qué les falta. Texto
  -- libre a propósito: cambia cada hora y encasillarlo en categorías haría
  -- que nadie lo actualice.
  supplies_needed  text check (length(supplies_needed) <= 500),
  supplies_surplus text check (length(supplies_surplus) <= 500),

  -- Un punto saturado no se borra: se marca, porque mañana vuelve a recibir.
  is_full     boolean not null default false,
  is_verified boolean not null default false,
  is_active   boolean not null default true,

  -- Cuándo se confirmó por última vez que esto sigue vigente. Un punto de
  -- acopio con información de ayer manda gente a un sitio equivocado.
  confirmed_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Solo los servicios llevan categoría; los demás tipos, ninguna. Escrito
  -- así y no enumerando tipos, para no tener que tocarlo cada vez que aparezca
  -- uno nuevo (fue justo lo que falló al agregar 'necesidad').
  constraint servicio_con_categoria check (
    (kind = 'servicio' and service_category is not null)
    or (kind <> 'servicio' and service_category is null)
  )
);

create index if not exists places_kind_idx on places (kind, is_active);
create index if not exists places_map_idx on places (lat, lng)
  where is_active and lat is not null;

drop trigger if exists places_touch_updated_at on places;
create trigger places_touch_updated_at
  before update on places
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: lectura pública de lo activo, escritura solo del equipo.
-- ---------------------------------------------------------------------------

alter table places enable row level security;

drop policy if exists places_select_public on places;
create policy places_select_public on places
  for select using (is_active);

drop policy if exists places_all_admin on places;
create policy places_all_admin on places
  for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Cómo cargar un punto de acopio (desde el SQL Editor o el Table Editor):
--
--   insert into places (kind, name, address, comuna, lat, lng,
--                       contact_method, contact_value, schedule,
--                       supplies_needed, supplies_surplus, is_verified)
--   values ('acopio', 'Coliseo El Pueblo', 'Calle 5 con Carrera 52',
--           'Comuna 19', 3.4206, -76.5410, 'whatsapp', '3001234567',
--           '8:00 a 18:00', 'Pañales, agua', 'Ropa usada', true);
--
-- Las coordenadas salen de Google Maps: clic derecho sobre el punto ->
-- "¿Qué hay aquí?" -> copia los dos números (latitud, longitud).
-- ---------------------------------------------------------------------------
