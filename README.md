# CaliSolidario

[![CI](https://github.com/JuanAndresCano/CaliSolidario/actions/workflows/ci.yml/badge.svg)](https://github.com/JuanAndresCano/CaliSolidario/actions/workflows/ci.yml)

Tablero abierto para conectar a quien necesita ayuda en Cali con quien puede
darla. Cualquiera puede mirar; para publicar un aviso, ver un contacto o marcar
algo como resuelto hay que entrar con Google.

Nació el 11 de agosto de 2026, un día después del sismo, y tiene usuarios
reales publicando necesidades y ofertas de ayuda.

Next.js 16 · React 19 · Tailwind v4 · Supabase (Postgres + Auth) · Vercel.

## Puesta en marcha

1. **Base de datos.** En Supabase → SQL Editor, pega y ejecuta
   [`supabase/schema.sql`](supabase/schema.sql) completo. Crea las tablas, los
   triggers y todas las políticas de RLS.

2. **Google OAuth.** En Google Cloud Console → *Clientes* → OAuth client ID de
   tipo *Aplicación web*, con este redirect URI:

   ```
   https://<tu-ref>.supabase.co/auth/v1/callback
   ```

   El Client ID y el secret van en Supabase → Authentication → Providers →
   Google. En Authentication → URL Configuration agrega
   `http://localhost:3000/**` y la URL de Vercel a *Redirect URLs*.

3. **Variables de entorno.**

   ```bash
   cp .env.local.example .env.local
   ```

   Llena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con lo que
   aparece en Supabase → Project Settings → API. La `service_role` no se usa en
   ninguna parte y no debe estar en este archivo.

4. **Arrancar.**

   ```bash
   nvm use 22 && npm run dev
   ```

## Caducidad de los avisos

Los avisos nacen con `expires_at` a 7 días. Para que salgan del tablero solos
hay que llamar a `expire_old_posts()` una vez al día — con `pg_cron` en Supabase
o con un cron de Vercel. Mientras no esté programado, los vencidos siguen
apareciendo.

## Flujo de trabajo

Rama única `main`, protegida. Todo cambio entra por pull request desde una rama
`feat/...`, que Vercel despliega en una preview propia para probarla antes de
fusionar.

El CI corre en cada PR: `next typegen`, `tsc --noEmit`, `eslint` y el build de
producción. Cada uno va como paso aparte, así el nombre del que falle dice qué
se rompió.

Opcionalmente, en Settings → Secrets and variables → Actions → Variables se
pueden definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(son públicas por diseño). Sin ellas el build usa valores de relleno y valida
compilación y rutas; con ellas valida además que las consultas a Supabase
sigan funcionando.

Antes de un commit, lo mismo en local:

```bash
bash scripts/verificar-codigo.sh
```

## Decisiones

- [ADR-0001 — Tablero público cacheado](docs/adr/0001-tablero-publico-cacheado.md)
- [ADR-0002 — Contacto en tabla aparte](docs/adr/0002-contacto-en-tabla-aparte.md)
- [ADR-0003 — Moderación comunitaria](docs/adr/0003-moderacion-comunitaria.md)

## Moderación

Las alertas de la comunidad marcan un aviso "en conflicto"; no lo retiran. El
retiro administrativo existe como último recurso en `/admin`, visible solo para
perfiles con `is_admin`. Para nombrar al primero:

```sql
update profiles set is_admin = true
 where id = (select id from auth.users where email = 'tu-correo@gmail.com');
```

## Estructura

```
src/
  app/
    page.tsx              tablero completo (cacheado, revalidate 60)
    necesidades/          solo kind = need
    ofertas/              solo kind = offer
    aviso/[id]/           detalle; el contacto solo con sesión
    publicar/             formulario + server actions
    mis-avisos/           marcar resuelto, borrar, salir
    auth/callback/        intercambio del código de OAuth
  components/
  lib/
    supabase/public.ts    cliente anónimo, sin cookies → permite cachear
    supabase/server.ts    cliente con sesión, para acciones y páginas privadas
    supabase/browser.ts   solo para el botón de Google
supabase/schema.sql
```
