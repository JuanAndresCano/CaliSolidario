# ADR-0002 — El dato de contacto vive en su propia tabla

- **Fecha:** 2026-08-11
- **Estado:** aceptado

## Contexto

El aviso tiene que ser visible sin registro: obligar a entrar para *mirar* mata
la difusión justo cuando más importa. Pero el número de teléfono no puede quedar
abierto a internet. Publicar teléfonos de personas damnificadas atrae dos cosas
concretas: raspado masivo de contactos y estafadores que se hacen pasar por
donantes.

Row Level Security en Postgres opera a nivel de **fila**, no de columna. Con el
contacto como una columna más de `posts` no hay forma de decir "esta fila es
pública salvo esta columna" con una sola política.

## Alternativas consideradas

- **Vista con columnas enmascaradas.** Funciona, pero deja dos objetos que
  consultar y es fácil que alguien consulte la tabla por error.
- **Función `security definer` que devuelve el contacto.** Añade una superficie
  con privilegios elevados para resolver algo que RLS ya sabe hacer.
- **Filtrar el campo en el servidor de Next.** El filtro deja de ser una
  garantía de la base de datos y pasa a depender de que ningún `select('*')`
  futuro se olvide de excluirlo.

## Decisión

Tabla `post_contacts` con `post_id` como clave primaria y foránea. Dos
políticas, cada una trivial de auditar:

```sql
create policy posts_select_public on posts
  for select using (status <> 'removed');

create policy post_contacts_select_authenticated on post_contacts
  for select to authenticated using (true);
```

## Consecuencias

- El aviso público y el contacto privado quedan separados por el motor de la
  base de datos, no por la aplicación. Un `select('*')` descuidado sobre `posts`
  no puede filtrar un teléfono.
- Publicar un aviso son dos `insert`. Si el segundo falla, la acción borra el
  aviso: un aviso sin contacto no sirve para nada.
- Cualquier cuenta de Google puede leer todos los contactos. Es una barrera
  contra el raspado anónimo, no contra alguien decidido. Cuando haga falta más,
  el siguiente paso es registrar cada revelación de contacto en una tabla y
  limitar cuántas puede ver una cuenta por día.

## Addendum (2026-08-11): la dirección sí es pública

Se evaluó meter también la dirección en `post_contacts` y se descartó. En esta
emergencia las direcciones de los edificios y unidades colapsados ya circulan
abiertamente por redes sociales, y son justamente el dato por el que las
brigadas y los voluntarios llegan al sitio. Esconderla tras el login habría
roto el uso principal del tablero para proteger algo que de todos modos ya es
público.

`posts.address` es entonces una columna pública normal. La línea queda trazada
entre **dónde ocurre** (público, porque hay que llegar) y **con quién hablar**
(cerrado, porque es lo que se raspa y se usa para estafar).

Si más adelante entran avisos de casas particulares donde la dirección sí
comprometa a una familia, la evolución natural es un `address_is_public`
booleano por aviso, no mover la columna de tabla.
