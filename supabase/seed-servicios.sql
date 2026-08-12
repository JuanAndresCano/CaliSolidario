-- Servicios profesionales gratuitos — carga inicial.
--
-- Ejecutar después de las migraciones 0007, 0008 y 0010.
--
-- `is_verified` va en true porque la información la dio directamente el
-- director de la organización: 5 coaches ontológicos graduados y coaches de
-- vida certificados, servicio gratuito sin venta posterior.
--
-- CUPOS: arrancan con 20 sesiones semanales y los amplían según la demanda.
-- Cuando se llenen, en vez de borrar el servicio, márcalo lleno — así la gente
-- sabe que existe pero que ahora mismo no hay campo:
--
--   update places set is_full = true,  confirmed_at = now() where name = 'Acompañamiento emocional gratuito';
--   update places set is_full = false, confirmed_at = now() where name = 'Acompañamiento emocional gratuito';
--
-- Avisos y cambios llegan por WhatsApp al 315 056 8033.

insert into places (
  kind, name, org_name, description, service_category,
  contact_method, contact_value, website, image_url, schedule,
  is_verified, is_active
) values
(
  'servicio',
  'Acompañamiento emocional gratuito',
  'Tríada Aliados',
  'Una sesión virtual de 45 minutos para escucharte y ayudarte a encontrar paz y tranquilidad frente a lo que dejó el terremoto. La atienden 5 coaches ontológicos graduados y coaches de vida certificados.

Para agendar, escribe al WhatsApp con tu nombre, tu correo electrónico y el horario que prefieras. La cita se hace por Google Meet.

Es totalmente gratis: no se vende nada ni hay un programa pago después.',
  'salud_mental',
  'whatsapp',
  '3150568033',
  'https://www.triadaaliados.com',
  -- Su propio og:image, el mismo que WhatsApp muestra al compartir el enlace.
  'https://www.triadaaliados.com/opengraph-image?c8c6e34bd360e9d7',
  'Sesiones de 45 min · 20 cupos por semana',
  true,
  true
)
on conflict (name) do update set
  org_name       = excluded.org_name,
  description    = excluded.description,
  contact_method = excluded.contact_method,
  contact_value  = excluded.contact_value,
  website        = excluded.website,
  image_url      = excluded.image_url,
  schedule       = excluded.schedule,
  confirmed_at   = now();
