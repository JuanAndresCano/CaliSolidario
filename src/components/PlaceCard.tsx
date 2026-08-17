import { SERVICE_CATEGORY_MAP } from '@/lib/catalog';
import {
  contactUrlDe,
  contactosDe,
  mapsUrl,
  type Place,
  type PlaceContact,
} from '@/lib/places';
import { timeAgo } from '@/lib/time';

/** Cómo se llama el botón según el medio. */
const VERBO: Record<PlaceContact['method'], string> = {
  whatsapp: 'WhatsApp',
  telefono: 'Llamar',
  otro: 'Contactar',
};

/**
 * A partir de cuántos caracteres el contenido se pliega.
 *
 * Con 17 puntos cargados, `/sitios` era imposible de recorrer: una tarjeta con
 * la lista de medicamentos de un acopio ocupaba la pantalla entera, así que
 * cabían una o dos por vista. El umbral está calibrado para que las tarjetas
 * que ya eran cortas —la mayoría de albergues y servicios— NO cambien: solo se
 * pliegan las que causaban el problema.
 */
const LARGO_TEXTO = 140;

export function PlaceCard({ place }: { place: Place }) {
  const maps = mapsUrl(place);
  const service = place.service_category
    ? SERVICE_CATEGORY_MAP[place.service_category]
    : null;

  // Solo los que se pueden abrir. Un contacto de tipo "otro" no tiene enlace,
  // y un botón que no hace nada estorba más de lo que informa.
  const contactos = contactosDe(place).filter((c) => contactUrlDe(c) !== null);
  const [principal, ...secundarios] = contactos;

  // Sin dos puntos: ahora es un rótulo en versalitas, no el principio de una
  // frase.
  const etiquetaInsumos = place.kind === 'necesidad' ? 'Necesitan' : 'Les falta';

  // ¿Esta tarjeta es de las que revientan la lista? Se decide una sola vez y
  // gobierna todo el cuerpo, para no tener tres criterios distintos de
  // truncado conviviendo en la misma tarjeta.
  // Se mide el texto SUMADO y no cada campo por su cuenta: había tarjetas de
  // 545 px con una descripción y una lista que, por separado, pasaban el
  // umbral por poco y no se plegaban ni una ni otra.
  const extensa =
    (place.description?.length ?? 0) +
      (place.supplies_needed?.length ?? 0) +
      (place.supplies_surplus?.length ?? 0) >
    LARGO_TEXTO;

  // Lo que se ve sin desplegar. Se prefiere lo que hace falta sobre la
  // descripción: quien está decidiendo a dónde ir necesita saber qué llevar.
  const resumen = place.supplies_needed ?? place.description ?? '';

  return (
    // El id permite llegar directo desde el mapa con /sitios#<id>. El
    // `scroll-mt` deja aire para el encabezado fijo, que si no tapa la tarjeta
    // justo después de saltar.
    <li
      id={place.id}
      /*
       * `flex flex-col` para que, cuando la rejilla estire la tarjeta a la
       * altura de su fila, el sobrante se lo lleve el bloque de acciones con
       * `mt-auto` y los botones queden alineados de lado a lado. Sin eso, la
       * tarjeta corta de una fila quedaba con un hueco blanco al final y
       * parecía rota en vez de deliberada.
       */
      className={
        place.is_full
          ? 'tarjeta-lugar flex scroll-mt-24 flex-col rounded-2xl border border-line bg-surface px-4 py-3.5 opacity-60'
          : 'tarjeta-lugar flex scroll-mt-24 flex-col rounded-2xl border border-line bg-surface px-4 py-3.5'
      }
    >
      {/* Una sola fila: a la izquierda qué es, a la derecha en qué estado
          está. Antes eran hasta seis insignias apiladas que empujaban el
          nombre del lugar fuera de la primera pantalla. */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
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
          {service && (
            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">
              {service.emoji} {service.label}
            </span>
          )}
          {place.disponible_en_todos && (
            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">
              Atención virtual
            </span>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {place.is_full && (
            <span className="rounded-full bg-need-bg px-2.5 py-1 text-xs font-bold text-need">
              {place.kind === 'albergue' ? 'Sin cupo' : 'Lleno'}
            </span>
          )}
          {place.is_verified && (
            <span className="rounded-full bg-offer-bg px-2.5 py-1 text-xs font-bold text-offer">
              ✓ Verificado
            </span>
          )}
        </div>
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

      {/*
        Sigue sin plegarse —es lo único que alguien no se puede permitir no
        leer— pero ya no es una caja roja con borde de 2 px y rótulo en
        mayúsculas. Una regla roja al margen y el texto en rojo dicen lo mismo
        sin gritar, y la tarjeta baja 40 px.

        Si un aviso concreto dejó de aplicar, lo que sobra es el dato, no el
        campo: se limpia en la base y la tarjeta deja de mostrarlo sola.
      */}
      {place.safety_note && (
        <p
          role="alert"
          className="mt-2.5 border-l-2 border-need pl-3 text-sm leading-relaxed text-need"
        >
          {place.safety_note}
        </p>
      )}

      {/* Dónde y cuándo, en una línea. Es lo que se lee de un vistazo para
          descartar un punto sin abrirlo. */}
      {(place.address || place.comuna || place.schedule) && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          {place.address ? `📍 ${place.address}` : null}
          {place.comuna ? ` · ${place.comuna}` : null}
          {place.schedule ? ` · 🕐 ${place.schedule}` : null}
        </p>
      )}

      {extensa ? (
        /*
         * `<details>` nativo: se pliega sin una línea de JavaScript, funciona
         * antes de que hidrate nada y el navegador ya lo hace accesible por su
         * cuenta. Con `group-open` el resumen se cambia por "ocultar" al
         * abrir, así el texto no aparece dos veces.
         */
        /*
         * Sin caja de color. El rótulo en versalitas y una línea divisoria
         * bastan para separar la sección, y así el rojo queda reservado para
         * el aviso de seguridad — que es lo único que de verdad debe gritar.
         * Cuando todo grita, nada se oye.
         */
        <details className="group mt-3 border-t border-line pt-2.5">
          {/* `list-none` más la regla de webkit quitan el triangulito del
              navegador, que se ve distinto en cada uno. A cambio hay que poner
              un indicador propio: sin él nadie sabe que esto se abre. */}
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="block text-xs font-bold uppercase tracking-wide text-muted">
              {etiquetaInsumos}
            </span>
            {/* OJO: nada de `block` aquí. `line-clamp-2` funciona poniendo
                `display: -webkit-box`, y cualquier utilidad de display
                posterior lo pisa: el recorte deja de aplicarse en silencio y
                la tarjeta pasa de 300 a 970 px sin que nada falle. */}
            <span className="mt-0.5 line-clamp-2 text-sm leading-relaxed group-open:hidden">
              {resumen}
            </span>
            {/* Sin `min-h-[44px]`: el área táctil es el `<summary>` completo, que
                ya pasa de 44 px. Dársela también a esta línea añadía 30 px a
                cada tarjeta de la lista sin ganar nada. */}
            <span className="mt-1 block text-xs font-semibold underline underline-offset-4">
              <span className="group-open:hidden">Ver la lista completa</span>
              <span className="hidden group-open:inline">Ocultar la lista</span>
            </span>
          </summary>

          <div className="mt-2 flex flex-col gap-3">
            {place.supplies_needed && (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {place.supplies_needed}
              </p>
            )}
            {place.supplies_surplus && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  Ya tienen de sobra
                </p>
                <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {place.supplies_surplus}
                </p>
              </div>
            )}
            {place.description && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {place.description}
              </p>
            )}
          </div>
        </details>
      ) : (
        /* Tarjeta corta: se queda exactamente como estaba. La gente que ya
           conoce el sitio no debería notar ningún cambio aquí. */
        <>
          {place.description && (
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
              {place.description}
            </p>
          )}
          {/* Mismo tratamiento que en la versión plegable, para que las dos
              clases de tarjeta se lean como la misma cosa. */}
          {place.supplies_needed && (
            <div className="mt-3 border-t border-line pt-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                {etiquetaInsumos}
              </p>
              <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed">
                {place.supplies_needed}
              </p>
            </div>
          )}
          {place.supplies_surplus && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Ya tienen de sobra
              </p>
              <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                {place.supplies_surplus}
              </p>
            </div>
          )}
        </>
      )}

      {/* `mt-auto` empuja las acciones al fondo. En la rejilla de escritorio
          eso alinea los botones de todas las tarjetas de una misma fila. */}
      <div className="mt-auto" />

      {(maps || principal || place.website) && (
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
                principal
                  ? 'flex flex-1 items-center justify-center rounded-xl border border-line px-3 text-sm font-semibold'
                  : 'flex flex-1 items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink'
              }
            >
              {principal ? 'Ver su página' : 'Agendar'}
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
          {principal && (
            <a
              href={contactUrlDe(principal) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              role="button"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink"
            >
              {VERBO[principal.method]}
              {/* El nombre solo cuando hay más de uno: con un contacto único
                  no aporta nada y alarga el botón. */}
              {secundarios.length > 0 && principal.label
                ? ` · ${principal.label}`
                : ''}
            </a>
          )}
        </div>
      )}

      {/* Los demás van apilados y a lo ancho, no en la fila de arriba: tres
          botones repartidos en una pantalla de celular quedan ilegibles, y
          aquí lo que hay que leer es a quién se le escribe. */}
      {secundarios.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {secundarios.map((contacto) => (
            <li key={contacto.id}>
              <a
                href={contactUrlDe(contacto) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                role="button"
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-brand px-3 text-sm font-semibold"
              >
                {VERBO[contacto.method]}
                {contacto.label ? ` · ${contacto.label}` : ` · ${contacto.value}`}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Al final y en pequeño: importa, pero no es lo primero que hay que
          leer para decidir si ir. */}
      <p className="mt-2 text-xs text-muted" suppressHydrationWarning>
        Confirmado {timeAgo(place.confirmed_at)}
      </p>
    </li>
  );
}
