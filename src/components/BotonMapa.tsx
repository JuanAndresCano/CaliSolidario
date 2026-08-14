import Link from 'next/link';

/**
 * Entrada al mapa desde la lista.
 *
 * El icono es SVG en línea y no un emoji: los emoji se ven como un cuadro
 * vacío en equipos con fuentes desactualizadas (ya pasó dos veces en este
 * proyecto) y una imagen externa sería una petición más. Un SVG hereda el
 * color del tema y no puede fallar.
 */
export function BotonMapa({ ubicados }: { ubicados: number }) {
  return (
    <Link
      href="/mapa"
      className="mt-4 flex items-center gap-3 rounded-2xl bg-brand px-4 py-3.5 text-brand-ink active:opacity-80"
    >
      <IconoMapa />
      <span className="min-w-0">
        <span className="block text-base font-bold leading-tight">
          Ver el mapa
        </span>
        <span className="block text-xs leading-tight opacity-90">
          {ubicados === 0
            ? 'Todavía sin sitios ubicados'
            : ubicados === 1
              ? '1 sitio ubicado en Cali'
              : `${ubicados} sitios ubicados en Cali`}
        </span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="ml-auto size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

function IconoMapa() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-9 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mapa plegado */}
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13M15 6.5v13" />
      {/* Chincheta encima, para que se lea como ubicación y no como documento */}
      <circle cx="12" cy="10" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
