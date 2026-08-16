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

export type PlaceContact = {
  id: string;
  method: ContactMethod;
  value: string;
  /** Quién contesta. Con tres números iguales es lo único que distingue. */
  label: string | null;
  /** El 0 es el principal: el del botón grande. */
  orden: number;
};

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
  /**
   * Contacto principal. Se conserva sincronizado con el primer elemento de
   * `contacts` mientras dure el traspaso a `place_contacts` (migración 0021);
   * el mapa todavía lo lee. No lo uses en pantallas nuevas: usa `contactosDe`.
   */
  contact_method: ContactMethod | null;
  contact_value: string | null;
  /**
   * Todos los contactos, cuando la consulta los trajo. Opcional porque el
   * panel de gestión pide la fila sola, sin la tabla anidada.
   */
  contacts?: PlaceContact[];
  website: string | null;
  image_url: string | null;
  schedule: string | null;
  supplies_needed: string | null;
  supplies_surplus: string | null;
  /** Advertencia de seguridad. Se muestra destacada, arriba de todo. */
  safety_note: string | null;
  is_full: boolean;
  is_verified: boolean;
  /**
   * Se muestra en todos los municipios, no solo en el suyo. Para servicios sin
   * sede física: una videollamada no está en ninguna ciudad en particular.
   */
  disponible_en_todos: boolean;
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

/**
 * Contactos del lugar, ordenados, con el principal de primero.
 *
 * Si la consulta no trajo la tabla anidada —o el lugar es anterior al
 * traspaso— cae a las columnas heredadas y devuelve uno solo. Así ninguna
 * pantalla se queda sin contacto por el orden en que se apliquen la migración
 * y el despliegue.
 */
export function contactosDe(place: Place): PlaceContact[] {
  if (place.contacts && place.contacts.length > 0) {
    return [...place.contacts].sort((a, b) => a.orden - b.orden);
  }

  if (place.contact_method && place.contact_value) {
    return [
      {
        id: `${place.id}-heredado`,
        method: place.contact_method,
        value: place.contact_value,
        label: null,
        orden: 0,
      },
    ];
  }

  return [];
}

/** Enlace directo según el medio. `otro` no es accionable: no da enlace. */
export function contactUrlDe(contacto: PlaceContact): string | null {
  const digits = contacto.value.replace(/\D/g, '');
  const intl = digits.length === 10 ? `57${digits}` : digits;

  if (contacto.method === 'whatsapp') return `https://wa.me/${intl}`;
  if (contacto.method === 'telefono') return `tel:+${intl}`;
  return null;
}

/**
 * Enlace del contacto principal.
 *
 * Lo conserva el mapa, donde el globo es demasiado pequeño para una lista y
 * un solo botón es lo correcto.
 */
export function contactUrl(place: Place): string | null {
  const [principal] = contactosDe(place);
  return principal ? contactUrlDe(principal) : null;
}
