-- Coordenadas de los sitios, para que aparezcan en /mapa.
--
-- Sacadas del marcador real de cada enlace de Google Maps (el par !3d!4d de la
-- URL), no del centro del mapa (@lat,lng): el centro suele estar corrido
-- respecto al punto que uno buscó.
--
-- Se puede volver a ejecutar sin problema: son updates por nombre.

update places set lat = 3.3851320, lng = -76.5306650, confirmed_at = now()
 where name = 'Acopio para El Águila, Valle — Edificio Albricias';

update places set lat = 3.3422175, lng = -76.5287941, confirmed_at = now()
 where name = 'Universidad Icesi — medicamentos e insumos médicos';

update places set lat = 3.4263251, lng = -76.5370157, confirmed_at = now()
 where name = 'Escuela Nacional del Deporte — punto 2 de acopio';

update places set lat = 3.4550312, lng = -76.5348350, confirmed_at = now()
 where name = 'Plazoleta Jairo Varela — punto de acopio';

update places set lat = 3.3476839, lng = -76.5343398, confirmed_at = now()
 where name = 'Colegio Berchmans — portería principal';

update places set lat = 3.4134830, lng = -76.5516832, confirmed_at = now()
 where name = 'Coliseo El Pueblo';

update places set lat = 3.3762021, lng = -76.5183047, confirmed_at = now()
 where name = 'Parroquia Juan Pablo II';

-- El primer enlace de Vanessa apuntaba a otro edificio del mismo nombre:
-- caía a 1,8 km de la Calle 9, a la altura de la Cra 51. Este es el corregido,
-- que sí cae sobre la Calle 9 cerca de la Cra 44.
update places set lat = 3.4166260, lng = -76.5399127, confirmed_at = now()
 where name = 'Edificio Vanessa — Cra 44 con Calle 9';

-- Comprobación: no debería quedar ningún sitio sin ubicar.
--
--   select name, address from places
--    where lat is null and is_active and kind <> 'servicio';
