import type { Metadata } from 'next';
import { PlaceCard } from '@/components/PlaceCard';
import { ReportarPunto } from '@/components/ReportarPunto';
import { getPlaces } from '@/lib/places';

/**
 * La frescura real la da el webhook de Supabase (/api/revalidar): al editar
 * una fila, la caché se purga en segundos. Estos 300 son solo la red de
 * seguridad por si el webhook falla — sin él tocaría regenerar cada minuto
 * "por si acaso", que es justo el desperdicio que el webhook elimina.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Dónde llevar la ayuda',
  description:
    'Puntos de acopio en Cali con lo que le falta a cada uno, y zonas a las que no está llegando ayuda.',
};

export default async function AcopioPage() {
  const [places, zonas] = await Promise.all([
    getPlaces('acopio'),
    getPlaces('necesidad'),
  ]);

  const open = places.filter((p) => !p.is_full);
  const full = places.filter((p) => p.is_full);

  return (
    <div className="py-2">
      <h1 className="text-xl font-bold tracking-tight">Dónde llevar la ayuda</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Mira qué le falta a cada punto antes de salir. Llevar lo que ya les
        sobra ocupa manos y espacio que hacen falta en otra parte.
      </p>

      {/*
        Dos secciones que se leen como cosas distintas, no como una lista
        larga: la de zonas va con banda roja y primero, porque es a donde no
        está llegando nadie. Van en la misma página a propósito — quien va con
        el carro lleno necesita comparar las dos para decidir.
      */}
      {zonas.length > 0 && (
        <section className="mt-6">
          <div className="rounded-t-2xl bg-need px-4 py-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white">
              ⚠ No está llegando ayuda
            </h2>
          </div>
          <div className="rounded-b-2xl border border-t-0 border-line px-3 pb-3 pt-3">
            <p className="mb-3 px-1 text-sm leading-relaxed text-muted">
              No son puntos de acopio: son sitios donde hay gente esperando y no
              hay una operación montada recibiendo. Si puedes llegar hasta allá,
              aquí es donde más falta haces.
            </p>
            <ul className="flex flex-col gap-2.5">
              {zonas.map((zona) => (
                <PlaceCard key={zona.id} place={zona} />
              ))}
            </ul>
            <ReportarPunto tipo="necesidad" />
          </div>
        </section>
      )}

      <section className="mt-7">
        <div className="rounded-t-2xl bg-brand px-4 py-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-ink">
            📍 Puntos de acopio
          </h2>
        </div>
        <div className="rounded-b-2xl border border-t-0 border-line px-3 pb-3 pt-3">
          <p className="mb-3 px-1 text-sm leading-relaxed text-muted">
            Sitios organizados que reciben donaciones y las distribuyen.
          </p>

          {places.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
              Todavía no hay puntos de acopio cargados.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-2.5">
                {open.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </ul>

              {full.length > 0 && (
                <>
                  <h3 className="mt-6 px-1 text-sm font-bold">
                    Llenos por ahora ({full.length})
                  </h3>
                  <p className="mb-3 mt-1 px-1 text-sm text-muted">
                    No vayas todavía. Suelen volver a recibir en unas horas.
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {full.map((place) => (
                      <PlaceCard key={place.id} place={place} />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          <ReportarPunto tipo="acopio" />
        </div>
      </section>
    </div>
  );
}
