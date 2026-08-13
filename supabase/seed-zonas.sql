-- Zonas desatendidas — carga inicial.
--
-- Ejecutar DESPUÉS de la migración 0009, en una corrida aparte (Postgres no
-- admite usar un valor de enum nuevo en la misma transacción que lo crea).
--
-- OJO CON DOS COSAS DE ESTE REGISTRO:
--
--   * "Metoclopramida" venía escrito "Metroclopramida" en el mensaje original.
--     Corregí la ortografía porque es el nombre de un medicamento y un error
--     ahí hace que alguien compre lo que no es.
--   * "agua destroza" lo interpreté como "agua destilada", que es lo que tiene
--     sentido junto a gasas y acetaminofén. CONFIRMA ESTO con quien te pasó el
--     dato antes de que alguien salga a comprar.

insert into places (
  kind, name, description, address, comuna,
  lat, lng, supplies_needed, safety_note, is_verified, is_active
) values
(
  'necesidad',
  'Meléndez — El Jordán',
  'Reportan que el punto está muy abandonado y no le está llegando ayuda. Sirve todo lo que se pueda aportar.',
  'Meléndez, sector El Jordán',
  'Comuna 18',
  3.3747291564941406,
  -76.55164337158203,
  'Hidratación, comida, insumos médicos, metoclopramida, agua destilada, gasas y acetaminofén',
  'Se han reportado varios hurtos en la zona desde ayer. Si vas, ve en grupo y de día, no lleves objetos de valor y no te separes de los demás. La necesidad allá es real: la advertencia es para que puedas ayudar sin exponerte.',
  false,
  true
),
(
  'necesidad',
  'Edificio Vanessa — Cra 44 con Calle 9',
  'Están trabajando en el edificio y piden equipos concretos, no donaciones generales. Si tienes una motobomba o linternas potentes, ahí hacen falta.',
  'Carrera 44 con Calle 9',
  null,
  null,
  null,
  'Motobombas y linternas',
  null,
  false,
  true
)
on conflict (name) do update set
  description     = excluded.description,
  supplies_needed = excluded.supplies_needed,
  safety_note     = excluded.safety_note,
  lat             = excluded.lat,
  lng             = excluded.lng,
  confirmed_at    = now();
