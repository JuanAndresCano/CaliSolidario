'use client';

import {
  BookOpen,
  HeartHandshake,
  House,
  Link2,
  MapPin,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navegación principal, al estilo de la barra inferior de Clash Royale: el
 * panel central es el destino primario y está elevado, y los demás se
 * reparten a lado y lado.
 *
 * Está abajo y no arriba a propósito: es donde vive el pulgar, y las
 * pastillas superiores que había antes pasaban desapercibidas.
 *
 * Iconos de lucide y ya no emoji. El motivo original de usar emoji viejos era
 * que los de Unicode 11+ salen como cuadro vacío en equipos con fuentes
 * desactualizadas; con SVG ese problema desaparece de raíz, y además se ven
 * igual en todos los teléfonos en vez de depender de la fuente del sistema.
 *
 * Este componente SÍ es de cliente —necesita `usePathname` para la pestaña
 * activa— así que, a diferencia de los iconos de las tarjetas, estos seis sí
 * viajan al navegador.
 *
 * Medido antes y después sobre `.next/static/chunks`: 1.116 KB en los dos
 * casos. El coste no llega ni a un kilobyte, porque cada icono de lucide es
 * una lista corta de trazos y el empaquetador descarta los demás. Si algún día
 * se meten iconos a puñados en componentes de cliente, hay que volver a medir.
 */
type Slot = {
  href: string;
  label: string;
  Icono: LucideIcon;
  /** El del centro va elevado, como el botón de batalla de Clash Royale. */
  center?: boolean;
};

const SLOTS: Slot[] = [
  { href: '/guias', label: 'Guías', Icono: BookOpen },
  { href: '/servicios', label: 'Servicios', Icono: HeartHandshake },
  { href: '/', label: 'Tablero', Icono: House, center: true },
  // "Sitios" y no "Acopio": la página lista puntos de acopio Y zonas
  // desatendidas, y el nombre viejo solo cubría la mitad.
  { href: '/sitios', label: 'Sitios', Icono: MapPin },
  { href: '/enlaces', label: 'Enlaces', Icono: Link2 },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Acción principal, flotando sobre la barra: publicar no puede perder
          protagonismo por darle el centro al tablero. */}
      <Link
        href="/publicar"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-30 flex min-h-14 items-center gap-1.5 rounded-full bg-brand px-5 text-base font-bold text-brand-ink shadow-lg active:opacity-80"
      >
        <Plus aria-hidden className="size-5 shrink-0" />
        Publicar
      </Link>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid w-full max-w-2xl grid-cols-5 items-end px-1 pb-1 pt-1.5">
          {SLOTS.map((slot) => {
            const active = isActive(slot.href);

            if (slot.center) {
              return (
                <Link
                  key={slot.href}
                  href={slot.href}
                  aria-current={active ? 'page' : undefined}
                  className="flex flex-col items-center"
                >
                  <span
                    className={
                      active
                        ? 'flex size-14 -translate-y-3 items-center justify-center rounded-full bg-brand text-brand-ink shadow-lg ring-4 ring-background'
                        : 'flex size-14 -translate-y-3 items-center justify-center rounded-full bg-surface text-muted shadow-lg ring-4 ring-background'
                    }
                  >
                    <slot.Icono aria-hidden className="size-7" />
                  </span>
                  <span
                    className={
                      active
                        ? '-mt-2 text-[0.7rem] font-bold text-brand'
                        : '-mt-2 text-[0.7rem] font-medium text-muted'
                    }
                  >
                    {slot.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={slot.href}
                href={slot.href}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl"
              >
                {/* El icono toma el color del estado activo igual que la
                    etiqueta: con emoji eso no se podía, porque el color lo
                    traía la fuente. */}
                <slot.Icono
                  aria-hidden
                  className={
                    active ? 'size-6 text-brand' : 'size-6 text-muted'
                  }
                />
                <span
                  className={
                    active
                      ? 'text-[0.7rem] font-bold text-brand'
                      : 'text-[0.7rem] font-medium text-muted'
                  }
                >
                  {slot.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
