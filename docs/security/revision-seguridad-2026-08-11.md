# Revisión de seguridad — CaliSolidario

- **Fecha:** 2026-08-11 (antes del lanzamiento público)
- **Alcance:** código de la app (Next.js 16), esquema y políticas RLS de
  Supabase, flujo OAuth, manejo de datos personales. No cubre la configuración
  del dashboard de Supabase ni de Vercel, que no son visibles desde el repo.
- **Método:** lectura del código fuente; pruebas en vivo contra la API REST del
  proyecto usando **solo la anon key** (los mismos permisos de un atacante
  anónimo), con `scripts/verificar-esquema.sh`; `npm audit`.

## Resumen

El diseño de base es sano: nada construye SQL a mano (todo pasa por PostgREST
parametrizado), React escapa todo lo que renderiza y no hay ni un
`dangerouslySetInnerHTML`, los secretos no viven en el repo y la `service_role`
no se usa en ninguna parte. La protección real de los datos está en RLS, que es
donde debe estar: la app podría tener un bug y la base seguiría negando lo que
debe negar.

Los hallazgos serios estaban en los **bordes de RLS** — políticas correctas en
el caso típico con huecos en las transiciones — y todos quedan corregidos con
la migración `0004-endurecimiento.sql` más los cambios de código de esta fecha.

## Hallazgos

| # | Severidad | Hallazgo | Estado |
|---|-----------|----------|--------|
| 1 | **Alta** | Un usuario bloqueado podía desbloquearse a sí mismo | Corregido (0004) |
| 2 | **Alta** | El autor podía reescribir su aviso por la API: bajar `warning_count` a 0, resucitar un aviso retirado, extender la caducidad, cambiar título tras acumular alertas | Corregido (0004) |
| 3 | **Alta** | «Borrar» era DELETE físico: arrastraba las alertas de la comunidad (la evidencia) en cascada | Corregido (0004 + código) |
| 4 | **Media** | `profiles` legible por anónimos: nombres reales y quiénes son admins — **confirmado en vivo** | Corregido (0004) |
| 5 | **Media** | Sin límite de frecuencia en comentarios: spam barato con una sola cuenta | Corregido (0004) |
| 6 | **Media** | Sin cabeceras de seguridad HTTP | Corregido (`next.config.ts`) |
| 7 | **Baja** | El validador de redirect del callback aceptaba `/\evil.com` (los navegadores lo normalizan a `//evil.com`) | Corregido (código) |
| 8 | **Baja** | El registro OAuth fallaba si el nombre de Google supera 60 caracteres | Corregido (0004) |
| 9 | **Baja** | Carrera en el límite de 3 avisos abiertos con inserts simultáneos | Corregido (0004) |
| 10 | **Baja** | `/login?next=/admin` no estaba en la lista permitida (funcional, no de seguridad) | Corregido (código) |

### Detalle de los altos

**1 — Auto-desbloqueo.** `profiles_update_own` comprobaba dueño en el `USING`
pero no estado: un baneado pasaba el `USING` (la fila es suya) y el `CHECK` (la
fila nueva declara `is_banned = false`). El bloqueo —la única herramienta de
sanción— era reversible por el sancionado. Arreglo: `using (id = auth.uid()
and not is_banned)`.

**2 — Reescritura de avisos.** La política de UPDATE limitaba las *filas*
(solo las propias) pero no las *columnas*. La app nunca edita un aviso tras
crearlo, pero la API sí lo permitía, y eso habilitaba: anular la marca de
conflicto (`warning_count = 0`), reabrir un aviso que un admin retiró
(`removed → open`), y el cebo-y-cambio (reescribir el texto después de que la
comunidad lo avaló o alertó). Arreglo en dos capas: privilegios por columna
(`authenticated` solo puede actualizar `status` y `fulfilled_at`) y un trigger
que restringe las transiciones de estado de no-admins a cerrar, nunca reabrir.

**3 — Borrado de evidencia.** Un estafador con alertas encima podía borrar el
aviso (DELETE físico → cascada sobre `post_comments`) y republicar limpio.
Ahora no existe política de DELETE: «borrar» marca `status = 'removed'`, el
aviso desaparece del tablero y de la lista del autor, y las alertas quedan
visibles para el admin, asociadas a la cuenta.

## Verificado y en buen estado

- **Inyección SQL:** sin SQL crudo en toda la app; supabase-js + PostgREST
  parametrizan todo. Los únicos SQL del proyecto son las migraciones.
- **XSS:** React escapa por defecto; cero `dangerouslySetInnerHTML`, cero
  `eval`. Los datos de usuario se renderizan siempre como texto.
- **Enlaces generados:** `wa.me` y `tel:` se construyen solo con dígitos
  extraídos (`replace(/\D/g)`); el enlace a Maps pasa por `encodeURIComponent`.
  Todos los `target="_blank"` llevan `rel="noopener noreferrer"`.
- **Validación en servidor:** toda entrada se valida en la Server Action
  (longitudes, enums contra listas cerradas, formato de teléfono) además de los
  `CHECK` de la base. La validación HTML del navegador es solo cortesía.
- **Escritura anónima:** probado en vivo — `INSERT` anónimo rechazado (401),
  `UPDATE` anónimo afecta cero filas.
- **Contactos:** probado en vivo — `post_contacts` invisible sin sesión.
- **Avisos retirados:** invisibles para todo el mundo salvo admins (RLS), y
  `/admin` responde 404 —no 403— a quien no es admin: no anuncia que existe.
- **CSRF:** las Server Actions de Next validan origen por diseño.
- **Redirects:** allowlist en `/login`, validación en el callback (reforzada
  con el hallazgo 7).
- **Secretos:** `.env*` en `.gitignore` (solo la plantilla sin valores se
  versiona); la anon key es pública por diseño y la `service_role` no aparece
  en el código.
- **Dependencias:** `npm audit` — 0 vulnerabilidades a la fecha.

## Riesgos aceptados (documentados, no corregidos)

- **Volcado de contactos con sesión.** Cualquier cuenta de Google puede leer
  todos los contactos de avisos. Es la línea trazada en ADR-0002: barrera
  contra el raspado anónimo, no contra un atacante que se registra. La
  siguiente capa —registrar cada revelación y limitar cuántas ve una cuenta al
  día— queda como evolución si se detecta abuso.
- **Alertas coordinadas.** Varias cuentas pueden marcar en conflicto a un
  donante legítimo (ADR-0003). Mitigado por firmas, evaluación de terceros y
  respuesta del autor; no eliminado.

## Pendientes fuera del código (los tuyos)

1. **Aplicar las migraciones 0003 y 0004** en el SQL Editor, en ese orden — la
   0003 sigue sin aplicar (la verificación da 404 en `post_comments`) y la app
   la necesita para arrancar.
2. Re-correr `bash scripts/verificar-esquema.sh`: debe salir todo OK,
   incluida la lectura anónima de `profiles` que hoy falla.
3. Publicar la pantalla de consentimiento de Google (hoy solo entran usuarios
   de prueba).
4. Programar el cron de `expire_old_posts()` y el `pg_dump` de respaldo.
5. **Hacer el primer commit.** El repo no tiene ninguno: todo este trabajo
   existe en una sola copia en tu disco.

## Mejoras futuras (no bloquean el lanzamiento)

- CSP completa con nonces (hoy solo hay cabeceras básicas).
- Rate limiting a nivel HTTP (Vercel WAF / middleware) además del de la base.
- Registro de revelaciones de contacto con límite diario por cuenta.
- Política de contenidos publicada y canal de retiro a petición del afectado
  (obligación práctica de Ley 1581 si el proyecto crece).
- CAPTCHA de Supabase Auth si aparecen registros automatizados.
