-- Albergues disponibles tras el sismo.
-- Ejecutar DESPUÉS de la migración 0016 y en una corrida aparte.
--
-- Fuente: pieza que circuló el 14 de agosto de 2026, con la nota de que los
-- puntos "fueron confirmados mediante redes sociales, llamadas telefónicas y/o
-- verificación presencial por parte de estudiantes y funcionarios de la
-- Universidad del Valle".
--
-- Van con is_verified = false a propósito, pese a esa nota. El sello de este
-- sitio significa que NOSOTROS confirmamos, y un albergue que ya se llenó
-- manda a dormir a la calle a quien confió en la etiqueta. Llama a cada uno y
-- ve marcándolos:
--
--   update places set is_verified = true, confirmed_at = now()
--    where name = 'Coliseo de Hockey Miguel Calero';

insert into places (
  kind, name, description, address, comuna,
  contact_method, contact_value, supplies_needed, is_verified, is_active
) values

(
  'albergue',
  'Coliseo de Hockey Miguel Calero',
  'Unidad Deportiva Jaime Aparicio.',
  'Av. Joaquín Borrero Sinisterra #38-47, Calle 9 con Cra. 37A/39',
  null,
  'telefono',
  '3122813334',
  null,
  false,
  true
),
(
  'albergue',
  'Iglesia Avivamiento Cali',
  'Frente a la Biblioteca Departamental.',
  'Calle 6 #24-75',
  null,
  'whatsapp',
  '3165487069',
  null,
  false,
  true
),
(
  'albergue',
  'Hotel California — Yumbo',
  'Queda en Yumbo, fuera de Cali. Llama antes de desplazarte.',
  'Calle 10 #30-155, Arroyo Hondo, Yumbo',
  null,
  'telefono',
  '3178220607',
  null,
  false,
  true
),
(
  'albergue',
  'Motel Kamasutra — Yumbo',
  'Habilitaron una línea para damnificados. Queda en Yumbo, fuera de Cali.',
  'Calle 10 #29A-50, Acopi, Yumbo',
  null,
  'telefono',
  '3046580000',
  null,
  false,
  true
),
(
  'albergue',
  'Colegio Lacordaire',
  'Albergue de pasadía. Ofrecen alimentación, servicio médico y atención psicológica, y funcionan también como punto de acopio.',
  'Calle 5 #80-70',
  null,
  'whatsapp',
  '3228419549',
  null,
  false,
  true
)

on conflict (name) do update set
  description    = excluded.description,
  address        = excluded.address,
  contact_method = excluded.contact_method,
  contact_value  = excluded.contact_value,
  confirmed_at   = now();

-- Segundo número del Colegio Lacordaire, que no cabe en el campo de contacto:
update places
   set description = description || '

Otro número de contacto: 310 489 1835.'
 where name = 'Colegio Lacordaire';
