-- Migración 0019 — orientación jurídica gratuita (egresados y estudiantes de
-- Derecho, Universidad Icesi).
--
-- Es el segundo servicio virtual, después del acompañamiento emocional de
-- Tríada: se atiende por WhatsApp y videollamada, así que va con
-- `disponible_en_todos = true` y se muestra también en Filandia. El municipio
-- sigue siendo 'cali' porque indica QUIÉN mantiene la ficha, no dónde se
-- presta (ver la 0018).
--
-- Dos cosas que la tabla no sabe representar y que van dentro de la
-- descripción como texto:
--
--   1. Tres números de contacto. `contact_value` es uno solo, así que el
--      botón de WhatsApp apunta al primero y los otros dos quedan escritos.
--      Meter los tres en el campo produciría un enlace wa.me roto, porque
--      `contactUrl` le quita todo lo que no sea dígito y los concatenaría.
--   2. Atención virtual O presencial. `disponible_en_todos` da a entender que
--      no hay sede; la parte presencial se aclara en el texto.
--
-- Sin `image_url` a propósito: el logo de Icesi haría leer esto como un
-- servicio institucional de la universidad, y el propio volante dice que es
-- una iniciativa independiente que la universidad acompaña y difunde, sin
-- coordinarla ni prestarla. Poner el escudo sería atribuirle a Icesi una
-- responsabilidad que no asumió.
--
-- `is_verified` queda en false hasta que alguien llame al 316 381 9989 y
-- confirme. Para asesoría legal el sello importa más que en un acopio: aquí
-- la gente entrega datos de su seguro, su arriendo y su sucesión.

insert into places (
  municipio, kind, name, org_name, service_category,
  contact_method, contact_value,
  description,
  disponible_en_todos, is_verified, confirmed_at
)
select
  'cali',
  'servicio',
  'Orientación jurídica gratuita',
  'Egresados y estudiantes de Derecho, Universidad Icesi',
  'juridico',
  'whatsapp',
  '3163819989',
  'Egresados y estudiantes del Programa de Derecho de la Universidad Icesi acompañan sin costo a quienes enfrentan trámites derivados del sismo. Atención virtual o presencial en Cali; se coordina por WhatsApp.

- Seguros y pólizas: daños en vivienda, copropiedad y vehículo; qué hacer si la aseguradora objeta o demora el pago.
- Arrendamiento: terminación o suspensión del canon si el inmueble quedó inhabitable, y devolución del depósito.
- Sucesiones y estado civil: trámites tras el fallecimiento de un familiar.
- Vivienda y copropiedad: responsabilidad de constructoras y administraciones, y acceso a ayudas y subsidios del Estado.

Más WhatsApp: 315 865 2444 (Valentina Valencia) y 315 336 8111 (Nicole Rivas).

Es orientación jurídica inicial; no constituye representación judicial.',
  true,
  false,
  now()
where not exists (
  select 1 from places where name = 'Orientación jurídica gratuita'
);

-- ---------------------------------------------------------------------------
-- Comprobación: debe devolver dos filas, Tríada y esta.
-- ---------------------------------------------------------------------------

select name, municipio, service_category, disponible_en_todos, is_verified,
       length(description) as largo_descripcion
  from places
 where disponible_en_todos
 order by name;
