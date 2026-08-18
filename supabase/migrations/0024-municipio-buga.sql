-- Migración 0024 — dar de alta Buga.
--
-- Tercer municipio. La 0020 dejó dicho que agregar uno exige su fila en
-- `municipio_config`: el gestor solo tiene privilegio de UPDATE, no de INSERT,
-- así que sin esta fila la alcaldía de Buga no puede cambiar su propio número
-- desde el panel.
--
-- Lo demás que hace falta NO es SQL y no cabe aquí: la entrada en
-- src/config/municipios.ts, el proyecto de Vercel con sus variables, el CNAME,
-- las URL de redirección de Supabase y los webhooks. Está todo en
-- docs/alta-de-municipio.md.

insert into municipio_config (municipio, whatsapp_reportes, responsable)
values ('buga', '573113179404', 'Pendiente: alcaldía de Buga')
on conflict (municipio) do nothing;

-- ---------------------------------------------------------------------------
-- Comprobación: deben salir tres filas.
--
--   select * from municipio_config order by municipio;
--
-- Y que Buga arranca vacío, que es lo correcto:
--
--   select municipio, count(*) from places group by municipio;
--   select municipio, count(*) from posts  group by municipio;
-- ---------------------------------------------------------------------------
