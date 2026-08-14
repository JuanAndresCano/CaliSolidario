'use client';

import dynamic from 'next/dynamic';
import type { Place } from '@/lib/places';

/**
 * Leaflet toca `window` al importarse, así que no puede renderizarse en el
 * servidor. Este envoltorio lo carga solo en el navegador.
 *
 * De paso, el mapa (unos 40 KB de JavaScript más las teselas) queda fuera del
 * resto del sitio: solo lo descarga quien entra a /mapa. Por eso /sitios sigue
 * siendo una lista sin JavaScript, que es lo que carga rápido en una red
 * saturada.
 */
const Mapa = dynamic(() => import('./Mapa').then((m) => m.Mapa), {
  ssr: false,
  loading: () => (
    <div className="flex h-[65vh] min-h-80 w-full items-center justify-center rounded-2xl border border-line bg-surface">
      <p className="text-sm text-muted">Cargando el mapa…</p>
    </div>
  ),
});

export function MapaCargador({ places }: { places: Place[] }) {
  return <Mapa places={places} />;
}
