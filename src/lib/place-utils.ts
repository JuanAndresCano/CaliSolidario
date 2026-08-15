import { MUNICIPIO } from '@/config/municipios';
import type { ContactMethod, ServiceCategory } from './catalog';

/**
 * Tipo de lugar y utilidades puras, SIN importar el cliente de Supabase.
 *
 * Existe separado a propósito: los componentes de cliente (el mapa) solo
 * necesitan esto, y si lo tomaran de `places.ts` arrastrarían el cliente de
 * Supabase al paquete del navegador. Eso ya tumbó el mapa en producción una
 * vez, además de ser peso muerto que descarga cada visitante.
 *
 * Regla: aquí no entra nada que toque la red ni variables de entorno.
 */

export type PlaceKind =
  /** Sitio donde alguien que se quedó sin casa puede dormir. */
  | 'albergue'
  /** Sitio organizado que recibe donaciones. */
  | 'acopio'
  /** Servicio profesional gratuito. */
  | 'servicio'
  /** Barrio o punto al que no está llegando la ayuda. */
  | 'necesidad';

export type Place = {
  id: string;
  /** Municipio dueño del lugar. La base es compartida entre despliegues. */
  municipio: string;
  kind: PlaceKind;
  name: string;
  org_name: string | null;
  description: string | null;
  service_category: ServiceCategory | null;
  address: string | null;
  comuna: string | null;
  lat: number | null;
  lng: number | null;
  contact_method: ContactMethod | null;
  contact_value: string | null;
  website: string | null;
  image_url: string | null;
  schedule: string | null;
  supplies_needed: string | null;
  supplies_surplus: string | null;
  /** Advertencia de seguridad. Se muestra destacada, arriba de todo. */
  safety_note: string | null;
  is_full: boolean;
  is_verified: boolean;
  /** Retirado sin borrar. El sitio público solo muestra los activos. */
  is_active: boolean;
  confirmed_at: string;
};

/** Enlace a Maps: usa coordenadas si las hay, y si no la dirección escrita. */
export function mapsUrl(place: Place): string | null {
  if (place.lat !== null && place.lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  }
  if (place.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${place.address}, ${MUNICIPIO.contextoMapa}`,
    )}`;
  }
  return null;
}

/** Enlace de contacto directo según el medio declarado. */
export function contactUrl(place: Place): string | null {
  if (!place.contact_value) return null;
  const digits = place.contact_value.replace(/\D/g, '');
  const intl = digits.length === 10 ? `57${digits}` : digits;

  if (place.contact_method === 'whatsapp') return `https://wa.me/${intl}`;
  if (place.contact_method === 'telefono') return `tel:+${intl}`;
  return null;
}
