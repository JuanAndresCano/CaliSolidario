'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
// Desde place-utils y NO desde places: este componente corre en el navegador,
// y places arrastra el cliente de Supabase al paquete. Eso tumbó el mapa en
// producción el 14 de agosto.
import { contactUrl, mapsUrl, type Place } from '@/lib/place-utils';
import { MUNICIPIO } from '@/config/municipios';

/** Vista inicial, por si no hay ningún punto con coordenadas. */
const CENTRO: [number, number] = [
  MUNICIPIO.centroMapa.lat,
  MUNICIPIO.centroMapa.lng,
];

/**
 * Teselas de CARTO: no exigen cuenta ni clave, a diferencia de la mayoría, y
 * el servidor público de OpenStreetMap prohíbe expresamente las aplicaciones
 * con tráfico alto como esta. La atribución es obligatoria y va abajo a la
 * derecha del mapa.
 *
 * Si el tráfico crece mucho, el siguiente paso es un proveedor con clave.
 */
const TESELAS = {
  claro: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  oscuro: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Marcadores dibujados con divIcon y no con las imágenes por defecto de
 * Leaflet: esas se rompen al empaquetar (las rutas de los PNG no sobreviven al
 * bundler) y además así el color comunica el estado de un vistazo.
 */
function icono(place: Place): L.DivIcon {
  const color = place.is_full
    ? '#62676e' // saturado: gris, no es a donde hay que ir
    : place.kind === 'necesidad'
      ? '#b4501a' // no le está llegando ayuda
      : place.kind === 'albergue'
        ? '#1d4ed8' // dónde dormir
        : '#0f6f5c'; // acopio recibiendo

  /*
   * El símbolo distingue los albergues del resto sin depender del color: hay
   * quien no diferencia el azul del verde, y aquí la confusión manda a alguien
   * que perdió su casa a un punto de donaciones.
   */
  const simbolo =
    place.kind === 'necesidad' ? '!' : place.kind === 'albergue' ? '⌂' : '';

  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);color:#fff;font-weight:700;font-size:14px;line-height:1">${simbolo}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const CONSULTA_OSCURO = '(prefers-color-scheme: dark)';

/**
 * El tema del sistema es estado que vive fuera de React, así que se lee con
 * `useSyncExternalStore` y no con un efecto que llame a setState: eso último
 * provoca un render en cascada y React lo desaconseja explícitamente.
 *
 * Hace falta porque el sitio sigue el tema del sistema, y un mapa blanco
 * dentro de una interfaz oscura se ve como un error.
 */
function useTemaOscuro(): boolean {
  return useSyncExternalStore(
    (alCambiar) => {
      const mq = window.matchMedia(CONSULTA_OSCURO);
      mq.addEventListener('change', alCambiar);
      return () => mq.removeEventListener('change', alCambiar);
    },
    () => window.matchMedia(CONSULTA_OSCURO).matches,
    // El componente solo se monta en el navegador; este valor nunca se usa.
    () => false,
  );
}

export function Mapa({ places }: { places: Place[] }) {
  const oscuro = useTemaOscuro();

  const conCoordenadas = useMemo(
    () => places.filter((p) => p.lat !== null && p.lng !== null),
    [places],
  );

  const limites = useMemo(() => {
    if (conCoordenadas.length === 0) return null;
    return L.latLngBounds(
      conCoordenadas.map((p) => [p.lat as number, p.lng as number]),
    ).pad(0.25);
  }, [conCoordenadas]);

  return (
    <MapContainer
      center={CENTRO}
      zoom={MUNICIPIO.centroMapa.zoom}
      bounds={limites ?? undefined}
      scrollWheelZoom={false}
      // `mapa-tema` engancha los estilos de Leaflet a las variables del tema;
      // sin esa clase los popups salen con el tema claro de Leaflet.
      className="mapa-tema h-[65vh] min-h-80 w-full rounded-2xl border border-line"
    >
      <TileLayer
        url={oscuro ? TESELAS.oscuro : TESELAS.claro}
        attribution={ATRIBUCION}
        maxZoom={19}
      />

      {conCoordenadas.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat as number, place.lng as number]}
          icon={icono(place)}
        >
          <Popup>
            <PopupContenido place={place} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function PopupContenido({ place }: { place: Place }) {
  const maps = mapsUrl(place);
  const contacto = contactUrl(place);

  // El color lo pone `.leaflet-popup-content-wrapper` en globals.css, atado a
  // las variables del tema; aquí no se fija para no pelear con eso.
  return (
    <div className="min-w-52">
      {place.kind === 'necesidad' && (
        <p className="text-xs font-bold uppercase text-need">
          ⚠ No está llegando ayuda
        </p>
      )}
      {place.is_full && (
        <p className="text-xs font-bold uppercase text-muted">
          Lleno por ahora
        </p>
      )}

      <p className="text-sm font-bold leading-snug">{place.name}</p>

      {place.supplies_needed && (
        <p className="mt-1 whitespace-pre-line text-xs leading-snug">
          <span className="font-semibold">Necesitan: </span>
          {place.supplies_needed.slice(0, 140)}
          {place.supplies_needed.length > 140 ? '…' : ''}
        </p>
      )}

      {place.supplies_needed && place.supplies_needed.length > 140 && (
        // Ancla a la tarjeta de este sitio, no al principio de la lista.
        <Link
          href={`/sitios#${place.id}`}
          className="popup-enlace mt-1 block text-xs"
        >
          Ver todo lo que necesitan
        </Link>
      )}

      {place.schedule && (
        <p className="mt-1 text-xs text-muted">🕐 {place.schedule}</p>
      )}

      <div className="mt-2.5 flex gap-1.5">
        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noopener noreferrer"
            className="popup-btn popup-btn-primario"
          >
            Cómo llegar
          </a>
        )}
        {contacto && (
          <a
            href={contacto}
            target="_blank"
            rel="noopener noreferrer"
            className="popup-btn popup-btn-secundario"
          >
            Contactar
          </a>
        )}
      </div>
    </div>
  );
}
