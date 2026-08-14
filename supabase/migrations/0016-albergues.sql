-- Migración 0016 — cuarto tipo de lugar: albergue.
--
-- EJECUTAR SOLO ESTE ARCHIVO, aparte del seed que usa el valor nuevo.
-- Postgres no admite usar un valor de enum recién creado en la misma
-- transacción que lo crea.
--
-- Por qué un tipo propio: los otros tres responden "¿dónde llevo la ayuda?" o
-- "¿quién me atiende?". Un albergue responde a otra pregunta, y a la más
-- urgente de todas para quien se quedó sin casa: dónde duermo esta noche.
-- Mezclarlo con los acopios haría que esa persona tuviera que leerse una lista
-- de puntos de donación para encontrar la única línea que le sirve.

alter type place_kind add value if not exists 'albergue';
