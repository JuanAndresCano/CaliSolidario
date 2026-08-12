-- Puntos de acopio — segunda carga.
--
-- DOS OMISIONES DELIBERADAS EN EL REGISTRO DE BERCHMANS. Léelas antes de
-- correr esto, porque son decisiones tuyas, no mías:
--
-- 1. NO incluí la cuenta bancaria (Bancolombia corriente 06033212701, a
--    nombre de la Compañía de Jesús).
--
--    El sitio le dice a todo el mundo, en cada aviso: "nadie en este tablero
--    debe pedirte dinero ni datos bancarios". Publicar un número de cuenta
--    rompe esa línea, y con ella se va la única regla simple que protege a la
--    gente: en cuanto CaliSolidario muestra UNA cuenta, un estafador puede
--    decir "aquí publican cuentas, la mía también es legítima". El colegio es
--    de fiar; el precedente no. Si aun así la quieres publicar, hay que
--    reescribir antes el aviso de seguridad para que distinga instituciones
--    verificadas de particulares.
--
-- 2. NO incluí las direcciones de los cuatro puntos de recolección en casas
--    particulares (Pance, Oeste, Quintas de Don Simón y Jamundí).
--
--    Son nombre + dirección + número de apartamento + celular de personas que
--    se ofrecieron a recibir donaciones en su casa. En un flyer que circula
--    por el grupo del colegio eso es una cosa; en una página pública e
--    indexable por Google es otra muy distinta, y esas personas no aceptaron
--    lo segundo. Los menciono sin dirección para que la gente sepa que
--    existen y pregunte por el canal del colegio.

insert into places (
  kind, name, org_name, description, address, comuna,
  schedule, supplies_needed, is_full, is_verified, is_active
) values

-- Colegio Berchmans -----------------------------------------------------------
(
  'acopio',
  'Colegio Berchmans — portería principal',
  'Colegio Berchmans',
  'Centro de acopio abierto las 24 horas en la portería principal del colegio. Lo recogido se entrega a las zonas afectadas.

El Consejo de Padres tiene además puntos de recolección en Pance, el Oeste, Quintas de Don Simón y Jamundí; pregunta por ellos en el colegio si te queda más cerca.',
  'Colegio Berchmans, portería principal',
  null,
  'Abierto 24 horas',
  'Alimentos no perecederos: arroz, granos, panela, azúcar, sal, aceite, café, pasta, enlatados y leche en polvo. Botellas con agua. Aseo: jabón, crema dental, papel higiénico, toallas higiénicas, pañitos y desodorante. Bebés: pañales, crema para pañalitis y fórmula. Descanso: cobijas, mantas, almohadas, colchonetas y sábanas. Ropa en buen estado para todas las edades. Comida para animales.',
  false,
  false,
  true
),

-- Coliseo El Pueblo -----------------------------------------------------------
-- Se carga YA MARCADO COMO LLENO. Suena raro publicar un punto para decir que
-- no vayan, pero es justo el caso que el estado "lleno" existe para atender:
-- el nombre circula por otros canales y quien lo busque aquí se entera de que
-- no hace falta ir, en vez de perder el viaje.
(
  'acopio',
  'Coliseo El Pueblo',
  null,
  'Reportan que ya hay suficiente gente ayudando y por ahora no se necesitan más manos ni donaciones en este punto. Puede volver a recibir más adelante.',
  'Coliseo El Pueblo',
  null,
  null,
  null,
  true,
  false,
  true
)

on conflict (name) do update set
  org_name        = excluded.org_name,
  description     = excluded.description,
  address         = excluded.address,
  schedule        = excluded.schedule,
  supplies_needed = excluded.supplies_needed,
  is_full         = excluded.is_full,
  confirmed_at    = now();
