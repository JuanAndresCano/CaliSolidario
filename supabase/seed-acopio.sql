-- Puntos de acopio — carga inicial (12 de agosto de 2026).
--
-- Transcritos de las piezas gráficas oficiales que circularon. Se puede volver
-- a ejecutar: si el punto ya existe por nombre, actualiza en vez de duplicar.
--
-- DOS COSAS ANTES DE CORRER ESTO:
--
-- 1. `is_verified` va en false a propósito. El sello "✓ Verificado" debe
--    significar que alguien LLAMÓ y confirmó que el punto sigue recibiendo,
--    no que vimos un flyer bonito. Márcalos uno por uno cuando confirmes:
--
--       update places set is_verified = true, confirmed_at = now()
--        where name = 'Universidad Icesi — medicamentos e insumos médicos';
--
-- 2. `lat`/`lng` van en null porque no invento coordenadas: un punto mal
--    ubicado manda gente a la dirección equivocada. El botón "Cómo llegar"
--    igual funciona con la dirección escrita. Para el mapa que viene, sácalas
--    de Google Maps (clic derecho sobre el sitio -> "¿Qué hay aquí?") y:
--
--       update places set lat = 3.34210, lng = -76.53010
--        where name = 'Universidad Icesi — medicamentos e insumos médicos';

create unique index if not exists places_name_unique on places (name);

insert into places (
  kind, name, org_name, description, address, comuna,
  contact_method, contact_value, schedule,
  supplies_needed, is_verified, is_active
) values

-- 1 ---------------------------------------------------------------------------
(
  'acopio',
  'Acopio para El Águila, Valle — Edificio Albricias',
  null,
  'Punto en el sur de Cali que recoge ayuda destinada al municipio de El Águila, Valle. Lo que dejes aquí no se queda en la comuna 17: se transporta hasta allá. Otros números para confirmar antes de ir: 316 317 6069 y 312 757 0458 (Víctor H).',
  'Cra 83A #14A-106, edificio Albricias Ingenio 2',
  'Comuna 17',
  'whatsapp',
  '3128335964',
  null,
  'Materiales de construcción, colchones, cobijas, ropa y otros elementos',
  false,
  true
),

-- 2 ---------------------------------------------------------------------------
(
  'acopio',
  'Universidad Icesi — medicamentos e insumos médicos',
  'Universidad Icesi',
  'Centro de acopio institucional atendido por estudiantes de Medicina y profesores. Recibe exclusivamente medicamentos e insumos médicos. Punto de recepción: edificio G, aula 108G.',
  'Universidad Icesi, edificio G-108G',
  null,
  'whatsapp',
  '3207163511',
  'Jornada continua de 8:00 a. m. a 5:00 p. m.',
  'Angiocath 14, tijeras corta-todo, torniquetes para control de sangrado (no de canalización), cánulas de Guedel, máscaras simples, mantas térmicas, guantes de nitrilo tallas S, M y L, tapabocas, gasas, solución salina y alimento para animales',
  false,
  true
),

-- 3 ---------------------------------------------------------------------------
(
  'acopio',
  'Escuela Nacional del Deporte — punto 2 de acopio',
  'Alcaldía de Santiago de Cali',
  'Punto oficial de la Alcaldía. Si vas a asistir, lleva hidratación y elementos de protección personal.',
  'Calle 9 #34-01',
  null,
  null,
  null,
  null,
  'Agua potable (prioridad), alimentos no perecederos, colchonetas, mantas, kits de aseo, papel higiénico, tapabocas, guantes, gafas de protección, herramientas, palas, bolsas resistentes para residuos, linternas, toallas y alimento para perros y gatos',
  false,
  true
),

-- 4 ---------------------------------------------------------------------------
(
  'acopio',
  'Plazoleta Jairo Varela — punto de acopio',
  'Alcaldía de Santiago de Cali',
  'Punto oficial de la Alcaldía. Si vas a asistir, lleva hidratación y elementos de protección personal.',
  'Plazoleta Jairo Varela',
  null,
  null,
  null,
  null,
  'Agua potable (prioridad), alimentos no perecederos, colchonetas, mantas, kits de aseo, papel higiénico, tapabocas, guantes, gafas de protección, herramientas, palas, bolsas resistentes para residuos, linternas, toallas y alimento para perros y gatos',
  false,
  true
)

on conflict (name) do update set
  description      = excluded.description,
  address          = excluded.address,
  comuna           = excluded.comuna,
  contact_method   = excluded.contact_method,
  contact_value    = excluded.contact_value,
  schedule         = excluded.schedule,
  supplies_needed  = excluded.supplies_needed,
  confirmed_at     = now();
