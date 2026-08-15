import { SERVICE_CATEGORY_MAP } from '@/lib/catalog';
import { contactUrl, mapsUrl, type Place } from '@/lib/places';
import { timeAgo } from '@/lib/time';

export function PlaceCard({ place }: { place: Place }) {
  const maps = mapsUrl(place);
  const contact = contactUrl(place);
  const service = place.service_category
    ? SERVICE_CATEGORY_MAP[place.service_category]
    : null;

  return (
    // El id permite llegar directo desde el mapa con /sitios#<id>. El
    // `scroll-mt` deja aire para el encabezado fijo, que si no tapa la tarjeta
    // justo después de saltar.
    <li
      id={place.id}
      className={
        place.is_full
          ? 'tarjeta-lugar scroll-mt-24 rounded-2xl border border-line bg-surface px-4 py-3.5 opacity-60'
          : 'tarjeta-lugar scroll-mt-24 rounded-2xl border border-line bg-surface px-4 py-3.5'
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {place.kind === 'necesidad' && (
          <span className="rounded-full bg-need px-2.5 py-1 text-xs font-bold text-white">
            ⚠ No está llegando ayuda
          </span>
        )}
        {place.kind === 'albergue' && (
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-ink">
            🛏 Albergue
          </span>
        )}
        {place.is_verified && (
          <span className="rounded-full bg-offer-bg px-2.5 py-1 text-xs font-bold text-offer">
            ✓ Verificado
          </span>
        )}
        {service && (
          <span className="text-xs text-muted">
            {service.emoji} {service.label}
          </span>
        )}
        {place.is_full && (
          <span className="rounded-full bg-need-bg px-2.5 py-1 text-xs font-bold text-need">
            🔴 Lleno por ahora
          </span>
        )}
        {/* Explica por qué una organización de otra ciudad aparece aquí. */}
        {place.disponible_en_todos && (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-bold text-muted">
            Atención virtual
          </span>
        )}
      </div>

      {/* Con miniatura queda como la tarjeta que arma WhatsApp al compartir un
          enlace: imagen a la izquierda, título y organización a la derecha. */}
      <div className="mt-2 flex items-start gap-3">
        {place.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.image_url}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            decoding="async"
            className="size-18 shrink-0 rounded-xl border border-line object-cover"
          />
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-snug">{place.name}</h2>
          {place.org_name && (
            <p className="text-xs text-muted">Por {place.org_name}</p>
          )}
        </div>
      </div>

      {/* Va antes que la descripción y con el color más fuerte de la tarjeta:
          es lo único que no se puede leer por encima. */}
      {place.safety_note && (
        <div
          role="alert"
          className="mt-3 rounded-xl border-2 border-need bg-need-bg px-3 py-3"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-need">
            ⚠ Antes de ir, lee esto
          </p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-need">
            {place.safety_note}
          </p>
        </div>
      )}

      {place.description && (
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
          {place.description}
        </p>
      )}

      {(place.supplies_needed || place.supplies_surplus) && (
        <div className="mt-3 flex flex-col gap-1.5">
          {/* `whitespace-pre-line` respeta los saltos: las listas largas se
              cargan agrupadas (MEDICAMENTOS / INSUMOS) y así se pueden leer en
              un móvil en vez de ser un párrafo corrido. */}
          {place.supplies_needed && (
            <div className="rounded-xl bg-need-bg px-3 py-2 text-sm text-need">
              <p className="font-bold">
                {place.kind === 'necesidad' ? 'Necesitan:' : 'Les falta:'}
              </p>
              <p className="mt-0.5 whitespace-pre-line leading-relaxed">
                {place.supplies_needed}
              </p>
            </div>
          )}
          {place.supplies_surplus && (
            <div className="rounded-xl bg-offer-bg px-3 py-2 text-sm text-offer">
              <p className="font-bold">Ya tienen de sobra:</p>
              <p className="mt-0.5 whitespace-pre-line leading-relaxed">
                {place.supplies_surplus}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-2.5 text-xs text-muted">
        {place.address ? `📍 ${place.address}` : null}
        {place.comuna ? ` · ${place.comuna}` : null}
        {place.schedule ? ` · 🕐 ${place.schedule}` : null}
      </p>

      <p className="mt-1 text-xs text-muted" suppressHydrationWarning>
        Confirmado {timeAgo(place.confirmed_at)}
      </p>

      {(maps || contact || place.website) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Si además hay WhatsApp o teléfono, ese es el canal real para
              agendar y el sitio pasa a ser secundario: dos botones diciendo
              "Agendar" mandarían a la gente por el camino largo. */}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
              className={
                contact
                  ? 'flex flex-1 items-center justify-center rounded-xl border border-line px-3 text-sm font-semibold'
                  : 'flex flex-1 items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink'
              }
            >
              {contact ? 'Ver su página' : 'Agendar'}
            </a>
          )}
          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
              className="flex flex-1 items-center justify-center rounded-xl border border-line px-3 text-sm font-semibold"
            >
              Cómo llegar
            </a>
          )}
          {contact && (
            <a
              href={contact}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink"
            >
              {place.contact_method === 'whatsapp' ? 'WhatsApp' : 'Llamar'}
            </a>
          )}
        </div>
      )}
    </li>
  );
}
