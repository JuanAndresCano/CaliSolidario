# ADR-0001 — El tablero público se sirve desde caché, no desde el cliente

- **Fecha:** 2026-08-11
- **Estado:** aceptado

## Contexto

CaliSolidario nace días después del terremoto en Cali y se va a difundir por
WhatsApp. El patrón de tráfico esperado no es una curva: son picos bruscos
cuando alguien reenvía el enlace a un grupo grande.

El despliegue es Vercel Hobby + Supabase free. El límite que se rompe primero no
es el de la base de datos (unos miles de avisos de texto son decenas de MB) sino
los 5 GB mensuales de egress de Supabase. Si el listado se consulta desde el
navegador con `supabase-js`, cada visitante abre su propia conexión y descarga
su propia copia del feed: el pico de difusión se traduce uno a uno en consultas
a Postgres.

## Decisión

El listado se renderiza en Server Components con `export const revalidate = 60`,
consultando Supabase con un **cliente anónimo sin cookies**
(`src/lib/supabase/public.ts`).

Dos consecuencias de diseño se derivan de ahí y son obligatorias:

1. **El layout no lee la sesión.** El header no muestra el nombre del usuario ni
   cambia según si hay sesión. Leer cookies en el layout volvería dinámicas
   todas las páginas que cuelgan de él.
2. **Los filtros no usan `searchParams`.** El tipo de aviso va en rutas propias
   (`/`, `/necesidades`, `/ofertas`), estáticas y cacheables; categoría y comuna
   se filtran en el cliente sobre la lista ya descargada (`FeedList`).

## Consecuencias

- Mil personas mirando el tablero producen una consulta a Postgres por minuto,
  no mil. El coste de Supabase deja de escalar con las visitas.
- Un aviso nuevo puede tardar hasta 60 segundos en aparecer. Se mitiga con
  `revalidatePath` tras publicar, así que quien publica lo ve de inmediato.
- El feed carga hasta 120 avisos por ruta. Cuando eso se quede corto hay que
  paginar con segmentos estáticos (`/necesidades/pagina/2`), no con
  `searchParams`, o se pierde el caché.
- Las páginas de detalle (`/aviso/[id]`) **sí** son dinámicas, porque tienen que
  decidir si muestran el contacto. Es un coste aceptable: hay muchas menos
  vistas de detalle que de listado.
