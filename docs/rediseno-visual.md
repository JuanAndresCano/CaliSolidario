# Rediseño visual de CaliSolidario — versión adaptada

Este documento reemplaza a `calisolidario_prompt/prompt-claude-code-rediseno-calisolidario.md`
como especificación de trabajo. El original y su `DESIGN.md` siguen siendo la
referencia de estilo; lo que cambia es el alcance.

La razón del cambio está en la sección final: el prompt original está escrito
como un rediseño completo, y este sitio tiene usuarios que ya lo aprendieron.

---

## 0. Restricciones que no vienen del gusto

Estas no son preferencias estéticas. Son hechos del proyecto, y cualquier
propuesta que las incumpla está mal aunque se vea mejor.

1. **Hay videos tutoriales circulando.** La navegación, el orden de las
   secciones, los nombres de las pestañas y la posición de los botones
   principales **no se tocan**. Si alguien sigue un video grabado la semana
   pasada, tiene que poder seguirlo.

2. **El 84% de las visitas son de celular**, muchas con red mala en zona
   afectada. Móvil primero, no móvil "también".

3. **El sitio vive de la caché.** Las páginas públicas son estáticas con ISR
   y se sirven desde el CDN. Nada de lo visual puede volverlas dinámicas ni
   añadir peticiones por visitante. Ver el comentario de `revalidate` en
   `src/app/page.tsx`.

4. **JavaScript de cliente solo cuando no haya alternativa.** El mapa carga
   ~40 KB y por eso vive en su propia ruta. Si un efecto visual se puede
   hacer con HTML y CSS, se hace con HTML y CSS.

5. **Nada de emoji para iconos.** Los de Unicode 11 en adelante se ven como
   cuadro vacío en equipos con fuentes viejas. Ya pasó en producción. Ver
   `SERVICE_CATEGORIES` en `src/lib/catalog.ts`.

---

## 1. Qué problema resuelve este trabajo

Uno solo, y hay que tenerlo presente todo el tiempo:

> Con 17 puntos cargados, la página `/sitios` es imposible de recorrer. Las
> tarjetas no tienen altura acotada —una con lista larga de medicamentos ocupa
> la pantalla entera— así que caben una o dos por vista y encontrar el punto
> adecuado exige desplazarse por minutos.

Lo demás —iconos, imágenes, color— es mejora estética y va después. Si al
terminar la página sigue siendo difícil de recorrer, el trabajo falló aunque
se vea precioso.

---

## 2. Especificación de la tarjeta de lugar

`src/components/PlaceCard.tsx`. Es el 80% del valor de este rediseño.

### Estructura

```
┌──────────────────────────────────────────┐
│ [chip categoría]        [chip estado]    │  ← una sola fila
│ Nombre del lugar                         │
│ (organización, si la hay)                │
│ ⌖ Dirección · Comuna                     │
│ ⏱ Horario                                │
│                                          │
│ Necesitan: agua, pañales, medicamentos   │  ← 2 líneas máximo
│ ▸ Ver la lista completa (23 cosas)       │  ← <details>, plegado
│                                          │
│ [ Cómo llegar ]        [ WhatsApp ]      │
└──────────────────────────────────────────┘
```

### Reglas

- **Altura acotada.** Objetivo: mediana por debajo de 290 px en móvil.

  > La primera versión de este documento pedía 260 px y cuatro tarjetas por
  > pantalla. Medido contra los datos reales quedó en 281 px de mediana y unas
  > tres por pantalla. El piso está en unos 220 px: título, dirección, resumen
  > de lo que necesitan y dos áreas táctiles de 44 px no bajan de ahí sin
  > quitar información que la gente usa. Bajar más es trabajo del índice de
  > anclas, no de la tarjeta.
- **El chip de categoría resume qué necesitan.** Es lo que permite decidir sin
  desplegar nada. Sale de `supplies_needed`; mientras no haya catálogo, se
  toman las primeras palabras hasta un máximo, o se deja el chip fuera.
- **La lista completa se pliega, no se esconde.** Con `<details>`/`<summary>`
  nativo: cero JavaScript, funciona sin hidratación y el navegador ya sabe
  hacerlo accesible. Las primeras dos líneas quedan visibles porque saber qué
  llevar es la razón de existir del tablero.
- **El aviso de seguridad (`safety_note`) nunca se pliega.** Es lo único que
  alguien no puede permitirse no leer.
- **Los albergues llevan foto cuando la haya.** Reconocer el sitio de noche
  vale más que la simetría de la lista.

### Índice de anclas

Al principio de cada sección larga, una fila de enlaces con los nombres de los
puntos, que saltan a su tarjeta. Son anclas `#id` — cero JavaScript. Las
tarjetas ya tienen `id` y `scroll-mt` porque el mapa las usa.

---

## 3. Iconografía

**`lucide-react`**, como pide el prompt original, con una salvedad que el
original no menciona:

- **Desde Server Components no cuestan nada.** React los renderiza a SVG
  dentro del HTML y no se envía JavaScript al navegador. Comprobado: en los
  paquetes de cliente solo aparece la cadena "lucide" una vez, en un mapa de
  módulos, sin el código de los iconos.
- **Desde componentes de cliente sí viajan, pero menos de lo que temíamos.**
  La regla original de este documento los prohibía y era demasiado estricta:
  los seis iconos de `BottomNav` no movieron el tamaño de los paquetes ni un
  kilobyte medible (1.116 KB antes y después). Cada icono es una lista corta
  de trazos y el empaquetador descarta el resto.
- **La regla que queda:** en un componente de cliente, unos pocos iconos están
  bien; un puñado obliga a volver a medir antes de darlo por bueno.

Mapear uno por uno los emoji actuales. Los que hay hoy: `⚠ 🛏 ✓ 🔴 📍 🕐 ＋ ⚙`
más los de `CATEGORIES` y `SERVICE_CATEGORIES` en `src/lib/catalog.ts`.

Los emoji de las categorías pueden quedarse en el catálogo por ahora: son
contenido, no interfaz, y cambiarlos toca la base de datos.

---

## 4. Color y tipografía

Aquí es donde este documento más se separa del original.

### Se toma

- **La disciplina de nombres semánticos.** Los tokens actuales
  (`brand`, `need`, `offer`, `surface`, `line`, `muted`) se mantienen, pero se
  documentan y se usan de forma consistente. Tailwind v4: van en `@theme`
  dentro de `src/app/globals.css`.
- **La regla de elevación por capas**: fondo, tarjeta con borde de 1px, sin
  sombras duras. Es lo que el sitio ya hace; queda escrito.
- **Menos color por tarjeta.** Hoy una tarjeta puede mostrar seis bloques de
  color compitiendo. El rojo se reserva **solo** para el aviso de seguridad y
  para "no está llegando ayuda". El resto baja a texto con un punto de color.
  Cuando todo grita, nada se oye.

### No se toma, por ahora

- **La paleta completa del `DESIGN.md`** (azul primario, sistema tipo
  Material 3). No es un retoque: es otra identidad. La gente reconoce el sitio
  por sus colores actuales y hay videos que los muestran.
- **La segunda familia tipográfica** (Hanken Grotesk sobre Geist). Es otra
  descarga en un celular con mala señal. Se reevalúa cuando pase la urgencia.
- **El grid fijo de 1280px con 12 columnas.** El sitio es de una columna
  centrada porque sus usuarios están en el teléfono. El escritorio se atiende,
  no se prioriza.

---

## 5. Lo que explícitamente no se hace

**Reestructurar a Atomic Design** (`atoms/molecules/organisms/templates`).

El prompt original lo justifica con *"no quiero componentes monolíticos de 300
líneas por página"*. Ese problema no existe aquí: la página más grande,
`src/app/sitios/page.tsx`, tiene 152 líneas contando comentarios, y los
componentes ya están separados por responsabilidad.

Adoptar el patrón significaría tocar todos los archivos de una aplicación con
usuarios reales, en emergencia, para resolver algo que no está roto. Si más
adelante aparece duplicación real entre `/sitios`, `/servicios` y `/enlaces`,
se extrae un componente compartido cuando duela — no antes.

**No se inventan datos.** El mockup muestra un contador de cupo `45/100` en el
albergue y un botón "Reportar Emergencia". Ninguno de los dos existe en la base
ni en el producto. No se dibujan.

---

## 6. Orden de trabajo

1. `PlaceCard` compacta con `<details>` — resuelve el problema real.
2. Índice de anclas en `/sitios`.
3. Iconos `lucide-react` en componentes de servidor.
4. Reducción de ruido de color.
5. Fotos en albergues (`next/image`, no `<img>` crudo).

Una cosa a la vez, desplegada y mirada en un celular de verdad antes de seguir
con la siguiente. Nada de una pasada por todo el repo.

---

## 7. Cómo se verifica

- `bash scripts/verificar-codigo.sh` y `bash scripts/verificar-build.sh`.
- En el build, que **ninguna ruta cambie de `○` a `ƒ`**. Si una página estática
  se volvió dinámica, el rediseño rompió la caché y eso cuesta dinero.
- Que `/sitios` muestre al menos cuatro puntos en una pantalla de 375 px sin
  desplazarse. Es la prueba de que el trabajo sirvió.
- Que el mapa siga cargando. Ningún check automático lo cubre y ya se rompió
  en silencio una vez.
- Abrir la página en un teléfono con fuentes viejas y comprobar que no hay
  cuadros vacíos.

---

## 8. Por qué esta versión y no la original

El prompt del profe está bien planteado como ejercicio de rediseño: el
`DESIGN.md` es sólido, los mockups son buenos y el diagnóstico de la tarjeta
coincide con el que habíamos hecho por separado.

Lo que no encaja es el alcance. Está escrito para un sitio sin usuarios, donde
rehacer la capa visual entera no tiene costo. Este sitio tiene gente que
aprendió a usarlo por video hace una semana, y el reconocimiento visual es
parte de lo que hace que funcione bajo estrés.

Así que se toma lo que resuelve problemas —la tarjeta, los iconos, el ruido de
color, las fotos— y se deja para después lo que solo cambia la apariencia. La
puerta al rediseño completo queda abierta para cuando pase la urgencia y se
puedan volver a grabar los videos.
