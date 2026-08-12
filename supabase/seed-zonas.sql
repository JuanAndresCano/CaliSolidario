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
  lat, lng, supplies_needed, is_verified, is_active
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
  false,
  true
)
on conflict (name) do update set
  description     = excluded.description,
  supplies_needed = excluded.supplies_needed,
  lat             = excluded.lat,
  lng             = excluded.lng,
  confirmed_at    = now();
