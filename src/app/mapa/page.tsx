import type { Metadata } from 'next';
import Link from 'next/link';
import { MapaCargador } from '@/components/MapaCargador';
import { getPlaces } from '@/lib/places';
import { MUNICIPIO } from '@/config/municipios';

/**
 * Una hora. El mapa se alimenta de `places`, que son fichas curadas a mano:
 * cambian unas pocas veces al día y cada cambio ya dispara el webhook. Un
 * reloj corto aquí solo gastaba escrituras regenerando lo mismo.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Mapa',
  description:
    `Mapa de ${MUNICIPIO.nombre} con los albergues, los puntos de acopio y las zonas a las que no está llegando ayuda.`,
};

export default async function MapaPage() {
  const [albergues, acopios, zonas] = await Promise.all([
    getPlaces('albergue'),
    getPlaces('acopio'),
    getPlaces('necesidad'),
  ]);

  /*
   * Los albergues van de primeros, igual que en /sitios y por la misma razón:
   * quien perdió su casa es quien tiene la necesidad más urgente de esta
   * página. Antes el mapa ni siquiera los cargaba, así que esa persona entraba
   * y no veía un solo sitio donde dormir.
   */
  const todos = [...albergues, ...zonas, ...acopios];
  const ubicados = todos.filter((p) => p.lat !== null && p.lng !== null);
  const sinUbicar = todos.filter((p) => p.lat === null || p.lng === null);

  return (
    <div className="py-2">
      {/*
        Enlace fijo a /sitios y no un `history.back()`: quien llega desde un
        enlace compartido no tiene historial al que volver, y se quedaría con
        un botón muerto. Así siempre lleva a algún lado útil.
      */}
      <Link
        href="/sitios"
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-2 pl-2 pr-3.5 text-sm font-semibold active:opacity-70"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver a la lista
      </Link>

      <h1 className="text-xl font-bold tracking-tight">Mapa</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Toca un punto para ver qué necesitan y cómo llegar.
      </p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <Leyenda color="#1d4ed8" texto="Dónde dormir" />
        <Leyenda color="#b4501a" texto="No llega ayuda" />
        <Leyenda color="#0f6f5c" texto="Acopio recibiendo" />
        <Leyenda color="#62676e" texto="Lleno por ahora" />
      </div>

      <div className="mt-3">
        {ubicados.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
            Todavía ningún sitio tiene coordenadas cargadas.
          </p>
        ) : (
          <MapaCargador places={ubicados} />
        )}
      </div>

      {/*
        Los sitios sin coordenadas se listan en vez de esconderse: si no
        aparecen en ninguna parte, nadie se entera de que faltan por ubicar y
        el mapa parece completo cuando no lo está.
      */}
      {sinUbicar.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-bold">
            Todavía sin ubicar en el mapa ({sinUbicar.length})
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Estos sitios están en el tablero pero aún no tienen coordenadas.
            Míralos en la lista, que ahí sí sale su dirección.
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {sinUbicar.map((p) => (
              <li key={p.id} className="text-sm">
                · {p.name}
                {p.address ? (
                  <span className="text-muted"> — {p.address}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/sitios"
        role="button"
        className="mt-6 flex items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold"
      >
        Ver la lista completa, con horarios y contactos
      </Link>
    </div>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-3 rounded-full border border-white/60"
        style={{ background: color }}
      />
      {texto}
    </span>
  );
}
