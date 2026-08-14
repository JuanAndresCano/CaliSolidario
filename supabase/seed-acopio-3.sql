-- Puntos nuevos — 14 de agosto de 2026.
--
-- FENADECO va como acopio: es el capítulo Icesi de la Federación Nacional de
-- Estudiantes de Economía, o sea un grupo estudiantil bajo una universidad, no
-- una persona suelta recogiendo. Por eso entra verificado.
--
-- Chiminangos va como ZONA DESATENDIDA y no como acopio, aunque tenga a Óscar
-- recibiendo: el mensaje central de la pieza es "allá no están llegando las
-- ayudas". Esa es la señal que hay que dar, y es justo la que la sección de
-- zonas existe para mostrar. Tiene contacto, así que además es accionable.

insert into places (
  kind, name, org_name, description, address, comuna,
  contact_method, contact_value, schedule,
  supplies_needed, is_verified, is_active
) values

(
  'acopio',
  'FENADECO Icesi — Cañas Gordas',
  'FENADECO, capítulo Icesi',
  'Punto de recolección del capítulo Icesi de la Federación Nacional de Estudiantes de Economía. Enfocado en apoyar a los equipos de búsqueda y rescate en terreno.',
  'Carrera 115 #18-43, Cañas Gordas',
  null,
  null,
  null,
  'Reciben desde las 9:00 a. m.',
  'Ropa, alimentos no perecederos y materiales de rescate: cascos y linternas.',
  true,
  true
),

(
  'necesidad',
  'Barrio Chiminangos — Torres H, I y J',
  null,
  'A este sector no están llegando las ayudas. Óscar recibe las donaciones en el centro de acopio del Sector 3; escríbele antes de ir, para que las reciba o te indique dónde dejarlas.',
  'Calle 62B1 A9 250, Chiminangos 2',
  null,
  'whatsapp',
  '3172868989',
  null,
  'Agua embotellada, alimentos no perecederos, artículos de aseo personal, pañales de niño y de adulto, ropa en buen estado, cobijas y medicamentos básicos.',
  false,
  true
)

on conflict (name) do update set
  org_name        = excluded.org_name,
  description     = excluded.description,
  address         = excluded.address,
  contact_method  = excluded.contact_method,
  contact_value   = excluded.contact_value,
  schedule        = excluded.schedule,
  supplies_needed = excluded.supplies_needed,
  confirmed_at    = now();
