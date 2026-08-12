-- Migración 0011 — imagen de vista previa para lugares.
--
-- Para que una organización se vea como la tarjeta que arma WhatsApp al
-- compartir su enlace: miniatura + título + descripción.
--
-- Se guarda la URL de la imagen en vez de leerla en tiempo de render. Podría
-- hacerse un "unfurl" automático que descargue la página y le saque el
-- og:image, pero eso metería una petición a un servidor ajeno dentro del
-- render de una página cacheada: si ese sitio se cae o se pone lento, se cae
-- o se pone lento /servicios. No vale la pena por ahorrar un copiar y pegar.

alter table places
  add column if not exists image_url text
    check (image_url is null or image_url ~ '^https://');

comment on column places.image_url is
  'Miniatura de la organización. Normalmente su og:image. Solo https.';
