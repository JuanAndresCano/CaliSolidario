'use client';

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
 * Los emoji son deliberadamente antiguos (Unicode 8 o anterior). Los añadidos
 * en Unicode 11+ se ven como un cuadro vacío en equipos con fuentes
 * desactualizadas, y ya nos pasó en producción.
 */
type Slot = {
  href: string;
  label: string;
  emoji: string;
  /** El del centro va elevado, como el botón de batalla de Clash Royale. */
  center?: boolean;
};

const SLOTS: Slot[] = [
  { href: '/guias', label: 'Guías', emoji: '📖' },
  { href: '/servicios', label: 'Servicios', emoji: '❤️' },
  { href: '/', label: 'Tablero', emoji: '🏠', center: true },
  // "Sitios" y no "Acopio": la página lista puntos de acopio Y zonas
  // desatendidas, y el nombre viejo solo cubría la mitad.
  { href: '/sitios', label: 'Sitios', emoji: '📍' },
  { href: '/enlaces', label: 'Enlaces', emoji: '🔗' },
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
        <span aria-hidden className="text-xl leading-none">
          ＋
        </span>
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
                        ? 'flex size-14 -translate-y-3 items-center justify-center rounded-full bg-brand text-2xl shadow-lg ring-4 ring-background'
                        : 'flex size-14 -translate-y-3 items-center justify-center rounded-full bg-surface text-2xl shadow-lg ring-4 ring-background'
                    }
                  >
                    <span aria-hidden>{slot.emoji}</span>
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
                <span aria-hidden className="text-xl leading-none">
                  {slot.emoji}
                </span>
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
