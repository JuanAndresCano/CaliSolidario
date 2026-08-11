-- Migración 0002 — la comuna pasa a ser opcional y aparece la dirección.
--
-- Motivo: elegir entre 37 comunas y corregimientos es fricción justo en el
-- momento en que alguien está pidiendo ayuda con afán. La dirección resuelve
-- mejor el "¿dónde?" y no obliga a saberse la división administrativa.
--
-- La dirección es pública, en `posts` y no en `post_contacts`: en esta
-- emergencia las direcciones de los edificios colapsados ya circulan por redes
-- y son justamente el dato por el que las brigadas llegan al sitio. Esconderla
-- tras el login rompería el uso principal. Ver docs/adr/0002.

alter table posts
  alter column comuna drop not null;

alter table posts
  add column if not exists address text
    check (address is null or length(trim(address)) between 5 and 160);
