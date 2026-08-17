# Prompt para Claude Code — Rediseño visual de CaliSolidario


## 0. Contexto

Este es el proyecto **CaliSolidario** (`calisolidario.triadaaliados.com`), una plataforma de solidaridad comunitaria construida en Next.js. Las rutas actuales del sitio son:

- `/` — Tablero (home)
- `/sitios` — Sitios de ayuda
- `/guias` — Guías
- `/servicios` — Servicios
- `/enlaces` — Otros recursos / enlaces externos
- `/mis-avisos` — Mis avisos
- `/publicar` — Publicar

Vamos a hacer un **rediseño puramente visual** del frontend, manteniendo el 100% de la lógica, rutas, data fetching y funcionalidades actuales intactas.

Antes de tocar nada, **audita el proyecto**: identifica el framework exacto (Next.js App Router o Pages Router), la versión de Tailwind instalada, si hay CSS Modules / styled-components / SCSS en uso, y el árbol de componentes actual. Repórtame ese inventario antes de empezar a escribir código.

---

## 1. Reglas no negociables

1. **No usar estilos "a mano" (CSS/SCSS/CSS-in-JS/styled-components).** Todo el styling va con **Tailwind CSS en su última versión estable**. Si el proyecto tiene una versión vieja de Tailwind, actualízala antes de empezar (y valida que no rompa nada existente).
2. **Arquitectura de componentes atómica** (Atomic Design): `atoms/`, `molecules/`, `organisms/`, `templates/`, y las `pages` (o `app/`) consumiendo esos templates. No quiero componentes monolíticos de 300 líneas por página.
3. **No modificar la lógica de negocio.** Nada de tocar fetch de datos, server actions, validaciones de formularios, rutas, params, estado, hooks de datos, etc. Solo la capa de presentación (JSX/markup + clases). Si un componente mezcla lógica y presentación, refactorízalo para separar ambas cosas, pero preservando el comportamiento exacto.
4. **Ajusta el diseño a las funcionalidades reales del sitio**, no al revés. Los mockups adjuntos (ver sección 3) son una referencia de estilo, no la verdad absoluta: si el mockup muestra una nav con ítems distintos a los reales (`Servicios / Guías / Informes / Mapas` en el mockup vs. `Tablero / Sitios / Guías / Servicios / Enlaces / Mis avisos / Publicar` en el sitio real), **respeta la navegación y las funcionalidades reales del sitio**, solo aplícales el nuevo estilo visual.
5. **Interfaz limpia**: mucho whitespace, jerarquía clara por tipografía y peso (no por decoración), tarjetas simples, nada de ruido visual.
6. **Iconografía: usar los iconos de shadcn**, es decir **`lucide-react`** (la librería de iconos que usa shadcn/ui), no Material Symbols/Google Icons (que es lo que usan los mockups de referencia) ni emojis (que es lo que usa el sitio actual, ej. `📖 Guías`, `❤️ Servicios`, `🏠 Tablero`). Vas a tener que mapear manualmente cada ícono actual (emoji o material symbol) a su equivalente en `lucide-react`.
7. No instales ni copies componentes de shadcn/ui completos si no es necesario — la instrucción de "iconografía de shadcn" es específicamente sobre los **íconos** (`lucide-react`), no sobre migrar todo el sistema de componentes a shadcn. Si ya usan (o quieres usar) primitivos de shadcn/ui para inputs/botones/dialogs, está bien, pero constrúyelos como parte de tus `atoms/`, no como una dependencia externa sin control.

---

## 2. Sistema de diseño (`DESIGN.md`)

Lee el archivo `DESIGN.md` adjunto en la raíz del repo. Contiene el design system completo en frontmatter YAML + descripción:

- Paleta de colores completa (primary, secondary, tertiary, superficies, contenedores, estados) — basada en la bandera de Cali, con azul primario, verde secundario para acciones de "solidaridad", y rojo terciario para alertas/urgencia.
- Tipografía: **Hanken Grotesk** para headlines/display, **Geist** para body/labels.
- Escalas de spacing (unidad de 8px), grid de 12 columnas, radios de borde, elevación por capas tonales (no sombras duras).
- Especificación de componentes (botones, cards, inputs, navegación, chips).

**Tareas concretas:**

1. Convierte los colores, tipografía, spacing y radios de `DESIGN.md` en **tokens de Tailwind** (extensión de `tailwind.config` o, si el proyecto usa Tailwind v4, en `@theme` dentro del CSS con `@import "tailwindcss"`). Usa los mismos nombres semánticos que trae el archivo (`surface`, `surface-container`, `on-surface`, `primary`, `on-primary`, `secondary-container`, etc.) para que las clases se lean igual que en el spec: `bg-surface-container`, `text-on-surface-variant`, `bg-primary text-on-primary`, etc.
2. Registra las fuentes `Hanken Grotesk` y `Geist` (Google Fonts o `next/font`) y expón los presets tipográficos (`display-lg`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `label-md`, `label-sm`) como utilidades o componentes de texto reutilizables en `atoms/`.
3. Implementa las reglas de elevación descritas (Nivel 0 fondo, Nivel 1 cards con borde 1px, Nivel 2 hover con sombra tintada suave en azul primario) como parte de los átomos/moléculas correspondientes, no como estilos sueltos repetidos en cada página.
4. Respeta la especificación de componentes tal cual (botón primario sólido azul, secundario sólido verde para "Unirse/Donar/Donar", ghost con borde primario, cards con 16px de radio y borde sutil que gana borde inferior de 2px en hover, inputs con ring de foco al 20% de opacidad, chips con fondo `accent-warm`).

---

## 3. Referencia visual (mockups adjuntos)

Vienen adjuntos varios mockups estáticos (HTML + screenshot) generados como referencia de estilo para páginas específicas del sitio, en desktop y mobile. Úsalos **solo como referencia de composición visual** (jerarquía, spacing, layout de cards, tono general), no los copies literal porque están hechos con Material Symbols y con nombres de navegación que no coinciden 1:1 con el sitio real:

| Carpeta del mockup | Referencia visual para |
|---|---|
| `recursos_estilo_moderno_calisolidario/` | Estilo general / home o página de referencia del sistema completo |
| `gu_as_calisolidaria/` + `gu_as_m_vil_calisolidaria/` | `/guias` (desktop + mobile) |
| `servicios_gratuitos_calisolidario/` + `servicios_m_vil_calisolidario/` | `/servicios` (desktop + mobile) |
| `sitios_de_ayuda_calisolidario/` + `sitios_de_ayuda_m_vil_calisolidario/` | `/sitios` (desktop + mobile) |
| `otros_recursos_calisolidario/` + `otros_recursos_m_vil_calisolidario/` | `/enlaces` (desktop + mobile) — esta es la página "Otros recursos" |
| `mapa_calisolidario/` + `mapa_m_vil_calisolidario/` | Referencia de layout tipo mapa/listado (revisa si aplica a alguna sección existente, ej. `/sitios`, o si es una idea a futuro que no existe todavía en el sitio — en ese caso ignórala) |

Antes de aplicar cualquier mockup a una ruta, **compara contra el contenido real de esa ruta en el sitio actual** para asegurarte de no inventar secciones, textos o funcionalidades que no existen.

---

## 4. Arquitectura de componentes esperada

Organiza así (ajusta rutas a la convención que ya use el repo, ej. `src/components/`):

```
components/
  atoms/
    Button.tsx          # variantes: primary | secondary | ghost
    Badge.tsx / Chip.tsx
    Icon.tsx             # wrapper delgado sobre lucide-react
    Input.tsx
    Text.tsx             # aplica los presets tipográficos del DESIGN.md
    Link.tsx
  molecules/
    NavLink.tsx
    ResourceCard.tsx     # tarjeta de "Colombia te busca", "Cruz Roja", etc.
    SectionHeader.tsx    # kicker + ícono + título de sección (ej. "¿Buscas a alguien?")
    Alert.tsx / Notice.tsx  # el aviso "Estos sitios son de terceros..."
  organisms/
    Header.tsx           # nav fija con blur, logo, links, CTAs
    Footer.tsx
    ResourceGrid.tsx      # grid responsive de ResourceCard
    PageHero.tsx          # kicker + título display + descripción
  templates/
    ResourceListTemplate.tsx  # patrón compartido por /sitios, /guias, /servicios, /enlaces
```

No dupliques el mismo patrón de "hero + secciones de cards" en cada página: la mayoría de rutas de este sitio (`/sitios`, `/guias`, `/servicios`, `/enlaces`) comparten el mismo esqueleto visual (hero + N secciones de grid de tarjetas + aviso final). Extrae eso a un `template` reutilizable y que cada página solo le pase el contenido/datos que ya trae del backend/CMS actual.

---

## 5. Proceso sugerido

1. Auditoría del repo (stack real, versión de Tailwind, componentes existentes, fuente de datos de cada página).
2. Crear los design tokens de Tailwind a partir de `DESIGN.md`.
3. Construir los átomos.
4. Construir moléculas y organismos.
5. Migrar página por página (empezando por `/enlaces` porque ya tenemos el mockup `otros_recursos_calisolidario` 1:1 con su contenido real), verificando en cada una que la funcionalidad (links, formularios, data) sigue intacta.
6. Verificar responsive (mobile-first, con los mockups mobile como referencia) y accesibilidad (contraste con los colores `on-*` del DESIGN.md, focus states visibles).
7. Checklist final: sin CSS custom suelto, sin Material Symbols/emojis residuales, sin componentes gigantes sin dividir, sin cambios de comportamiento.

Ve mostrándome el avance página por página en vez de hacer todo el repo de una sola pasada.
