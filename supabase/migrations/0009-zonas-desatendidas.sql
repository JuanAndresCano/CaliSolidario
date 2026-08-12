-- Migración 0009 — tercer tipo de lugar: zona desatendida.
--
-- IMPORTANTE: ejecuta ESTE archivo solo, y aparte del seed. Postgres no deja
-- usar un valor de enum recién agregado dentro de la misma transacción, así
-- que si lo pegas junto con los INSERT que lo usan, falla.
--
-- Por qué un tipo nuevo y no reusar 'acopio':
--
--   acopio    = sitio organizado que RECIBE donaciones y las distribuye.
--   necesidad = barrio o punto al que NO está llegando la ayuda. No hay una
--               operación montada; hay gente esperando.
--
-- Mezclarlos manda voluntarios a "entregar en la portería" de un sitio donde
-- no hay portería, y esconde justo lo que hay que ver: dónde falta.

alter type place_kind add value if not exists 'necesidad';
