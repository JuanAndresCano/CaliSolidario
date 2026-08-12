-- Migración 0012 — aviso de seguridad por lugar.
--
-- Campo aparte y no un párrafo dentro de `description` a propósito: es
-- información de otra naturaleza y necesita tratamiento visual propio. Metida
-- en la descripción, se pierde entre lo que necesitan y el horario, y es justo
-- lo que nadie puede pasar por alto.
--
-- Regla al redactarlo: describir la SITUACIÓN, nunca al barrio ni a su gente.
-- "Se han reportado hurtos en la zona" informa; "el barrio es peligroso"
-- estigmatiza a las mismas personas que están esperando ayuda, y consigue que
-- dejen de ir los voluntarios que hacen falta.

alter table places
  add column if not exists safety_note text
    check (safety_note is null or length(trim(safety_note)) between 10 and 400);

comment on column places.safety_note is
  'Advertencia de seguridad del lugar. Se muestra destacada en la tarjeta.';
