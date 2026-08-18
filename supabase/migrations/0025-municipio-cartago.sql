-- Migración 0025 — dar de alta Cartago.
--
-- Cuarto municipio. El procedimiento completo está en
-- docs/alta-de-municipio.md; aquí va solo la parte que es SQL.
--
-- `do nothing` y no `do update`: si alguien ya cambió el número desde el panel
-- de gestión, volver a correr esto no debe pisárselo. La contrapartida es que
-- para CORREGIR la fila hay que hacer un update aparte; el insert no sirve.

insert into municipio_config (municipio, whatsapp_reportes, responsable)
values ('cartago', '573113179404', 'Pendiente: alcaldía de Cartago')
on conflict (municipio) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: deben salir cuatro filas.
--
--   select * from municipio_config order by municipio;
--
-- Y que Cartago arranca vacío, que es lo correcto:
--
--   select municipio, count(*) from places group by municipio;
--   select municipio, count(*) from posts  group by municipio;
-- ---------------------------------------------------------------------------
