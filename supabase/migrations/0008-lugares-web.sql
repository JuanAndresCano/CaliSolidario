-- Migración 0008 — enlace web para lugares.
--
-- Los puntos de acopio se contactan por teléfono, pero un servicio profesional
-- normalmente agenda por su propio sitio. Sin este campo, esos servicios
-- quedaban sin botón de acción.

alter table places
  add column if not exists website text
    check (website is null or website ~ '^https://');

comment on column places.website is
  'URL de agendamiento o página del servicio. Solo https.';
