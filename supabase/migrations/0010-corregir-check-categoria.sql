-- Migración 0010 — corrige el CHECK que la 0009 dejó incompleto.
--
-- La 0009 agregó el tipo 'necesidad' al enum, pero el CHECK de la 0007
-- enumeraba los tipos uno por uno:
--
--   (kind = 'servicio' and service_category is not null)
--   or (kind = 'acopio' and service_category is null)
--
-- Una fila 'necesidad' no cae en ninguna rama, así que quedaba rechazada.
--
-- La regla real es más simple y no hay que tocarla cada vez que aparezca un
-- tipo nuevo: solo los servicios llevan categoría; los demás, ninguna.

alter table places drop constraint if exists servicio_con_categoria;

alter table places add constraint servicio_con_categoria check (
  (kind = 'servicio' and service_category is not null)
  or (kind <> 'servicio' and service_category is null)
);
