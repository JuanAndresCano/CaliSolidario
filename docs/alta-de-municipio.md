# Dar de alta un municipio

Todos los municipios corren **el mismo código y la misma base de datos**. Lo
que los separa es la variable `NEXT_PUBLIC_MUNICIPIO` del despliegue y la
columna `municipio` de cada fila. Ver ADR-0001 y la migración 0017.

Esto es la lista de todo lo que hay que tocar. Está escrita después de hacerlo
tres veces —Cali, Filandia, Buga— y el orden importa en los puntos donde se
dice.

---

## 1. La entrada en el código

`src/config/municipios.ts`. Copia la de Filandia y cambia:

| Campo | Qué poner |
|---|---|
| `id` | Minúsculas, sin tildes ni espacios. Es el valor de `NEXT_PUBLIC_MUNICIPIO` y el de la columna `municipio`. |
| `nombre` | Como le dice la gente, no el nombre oficial. "Buga", no "Guadalajara de Buga". |
| `marca` | Partido en dos: `['Buga', 'Solidario']`. El encabezado colorea la segunda mitad. |
| `contextoMapa` | Aquí sí el nombre oficial y completo, que es lo que busca Google Maps. |
| `centroMapa` | Solo decide la vista inicial. **Ábrelo antes de lanzar** y ajústalo si abre torcido. |
| `divisiones` | Con `opciones: []` el formulario pide la zona como texto libre. Es preferible a inventarse una división que no existe. |
| `whatsappReportes` | Solo el respaldo; el vigente vive en `municipio_config`. |
| `url` | El dominio definitivo, aunque todavía no resuelva. |

## 2. La fila en `municipio_config`

Una migración con su `insert`. **No es opcional**: el gestor solo tiene
privilegio de `UPDATE` sobre esa tabla, así que sin la fila la alcaldía no
puede cambiar su número desde `/gestion`.

## 3. El proyecto en Vercel

Nuevo proyecto sobre el mismo repositorio, con cuatro variables:

```
NEXT_PUBLIC_MUNICIPIO=<id>
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
REVALIDATE_SECRET=...
```

**Márcalas para todos los entornos**, no solo Production. Las vistas previas
corren en Preview y el build entero falla si les faltan, con un error que no
dice cuál es.

## 4. El dominio

CNAME `<id>solidario` → `cname.vercel-dns.com`. Comprueba que responde antes de
seguir:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -L https://<id>solidario.triadaaliados.com/
```

## 5. Supabase → Authentication → URL Configuration

En *Redirect URLs*, con el comodín:

```
https://<id>solidario.triadaaliados.com/**
```

Sin los `/**` no cubre `/auth/callback`, Supabase descarta la ruta y manda al
*Site URL*. El síntoma es que el login "no guarda la sesión"; la causa es que
el código de Google llega a `/` y nadie lo intercambia.

## 6. Los webhooks

Database → Webhooks. **Tres por municipio nuevo**, uno por tabla, todos
apuntando al sitio nuevo:

| Tabla | Eventos | Destino |
|---|---|---|
| `places` | insert, update, delete | `https://<id>solidario.../api/revalidar` |
| `posts` | insert, update, delete | idem |
| `place_contacts` | insert, update, delete | idem |

Cada sitio recibe todos los cambios y descarta los que no son suyos mirando la
columna `municipio`; por eso hace falta uno por sitio y no uno global.

> **Umbral a vigilar.** Son tablas × sitios: con tres municipios van nueve
> entradas en el panel. A partir de cuatro o cinco conviene pasar a los
> triggers por sentencia de la migración 0015, que recorren un arreglo de
> destinos y viven versionados en el repo. Hoy no compensa; con quince
> casillas que mantener a mano, sí.

`municipio_config` no lleva webhook: se edita desde `/gestion`, y esa acción ya
purga la caché por su cuenta.

## 7. Los permisos, después del primer ingreso

La fila en `profiles` **no existe hasta que la persona entra una vez**. Primero
que entre a `/login`, después:

```sql
update profiles
   set gestor_municipio = '<id>',              -- mantiene lugares
       confirma_entregas_municipio = '<id>'    -- cierra avisos ajenos
 where id = (select id from auth.users where email = 'persona@ejemplo.com')
returning display_name, gestor_municipio, confirma_entregas_municipio;
```

Son permisos independientes: se pueden dar por separado. Ver la migración 0023
para por qué están separados.

## 8. Comprobar antes de anunciarlo

- El sitio responde y el encabezado dice el nombre correcto.
- El tablero sale **vacío**. Es el resultado correcto: no hay datos de ese
  municipio todavía. Si aparecen avisos de otro, el filtro por `municipio` está
  roto y hay que parar.
- El mapa carga. Ningún check automático lo cubre y ya se rompió en silencio.
- El login completa: en el log tiene que salir `GET /auth/callback`.
- Publica un aviso de prueba y confirma que sale en el sitio nuevo **y no en
  los otros dos**. Después bórralo.
- Cambia el WhatsApp desde `/gestion` y comprueba que el botón "¿Conoces otro
  punto?" apunta al nuevo.

---

## Lo que NO hay que hacer

**No crear otro proyecto de Supabase.** Una sola base para todos: es lo que
permite que un servicio virtual —el acompañamiento de Tríada, la orientación
jurídica de Icesi— se muestre en todos los municipios sin duplicar la ficha.
Ver la migración 0018.

**No copiar los datos de otro municipio para "que no se vea vacío".** Un punto
de acopio que no existe manda a alguien con el carro lleno a una dirección
equivocada, y eso cuesta más que una página vacía.
