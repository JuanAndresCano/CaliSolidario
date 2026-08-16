import type { Metadata } from 'next';
import { PlaceCard } from '@/components/PlaceCard';
import { ReportarPunto } from '@/components/ReportarPunto';
import { SERVICE_CATEGORIES } from '@/lib/catalog';
import { getPlaces } from '@/lib/places';

/** Red de seguridad; la frescura la da el webhook (/api/revalidar). */
export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Servicios gratuitos',
  description:
    'Apoyo emocional, revisión de vivienda, salud y otros servicios que profesionales y empresas ofrecen gratis tras el sismo.',
};

export default async function ServiciosPage() {
  const places = await getPlaces('servicio');

  // Solo se advierte de lo que realmente está publicado.
  const cautions = SERVICE_CATEGORIES.filter(
    (c) => c.caution && places.some((p) => p.service_category === c.value),
  );

  return (
    <div className="py-2">

      <h1 className="text-xl font-bold tracking-tight">Servicios gratuitos</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {/* Antes decía que estaban "todos revisados uno por uno", y no era
            cierto de los recién cargados. Prometer verificación que no se hizo
            es peor que no prometerla: aquí hay servicios jurídicos y de salud
            donde la gente entrega datos sensibles. Ahora el sello es el que
            habla, y por eso significa algo. */}
        Profesionales y empresas que pusieron sus servicios a disposición de
        quien los necesite, sin cobrar. Los que llevan ✓ Verificado los
        confirmamos por teléfono; los demás están tal como nos los reportaron.
      </p>

      {cautions.map((c) => (
        <p
          key={c.value}
          className="mt-3 rounded-xl bg-need-bg px-3 py-2.5 text-sm leading-relaxed text-need"
        >
          <span className="font-bold">
            {c.emoji} Sobre {c.label.toLowerCase()}:
          </span>{' '}
          {c.caution}
        </p>
      ))}

      {places.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          Todavía no hay servicios publicados.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </ul>
      )}

      <ReportarPunto tipo="servicio" />
    </div>
  );
}
