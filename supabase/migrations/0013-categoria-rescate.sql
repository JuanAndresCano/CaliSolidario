-- Migración 0013 — categoría de servicio: apoyo técnico a rescate.
--
-- IMPORTANTE: ejecutar este archivo SOLO, aparte de cualquier insert que use
-- el valor nuevo. Postgres no admite usar un valor de enum recién creado
-- dentro de la misma transacción que lo crea.
--
-- Por qué no reusar una categoría existente:
--
--   'estructural' arrastra la advertencia sobre tarjeta profesional COPNIA,
--   pensada para quien va a decirle a una familia si su casa aguanta. Una
--   cámara térmica que apoya a brigadas en estructuras colapsadas no emite ese
--   dictamen, y mostrar esa advertencia confundiría a todo el mundo.
--
--   'otro' lo escondería justo cuando lo que hace falta es que las brigadas
--   sepan que este equipo existe.

alter type service_category add value if not exists 'rescate';
