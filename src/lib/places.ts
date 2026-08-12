import { supabasePublic } from './supabase/public';
import type { ContactMethod, ServiceCategory } from './catalog';

export type PlaceKind =
  /** Sitio organizado que recibe donaciones. */
  | 'acopio'
  /** Servicio profesional gratuito. */
  | 'servicio'
  /** Barrio o punto al que no está llegando la ayuda. */
  | 'necesidad';

export type Place = {
  id: string;
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
  is_full: boolean;
  is_verified: boolean;
  confirmed_at: string;
};

const COLUMNS =
  'id, kind, name, org_name, description, service_category, address, comuna, lat, lng, contact_method, contact_value, website, image_url, schedule, supplies_needed, supplies_surplus, is_full, is_verified, confirmed_at';

/**
 * Lugares curados por el equipo. Se consultan con el cliente anónimo desde
 * páginas cacheadas, igual que el tablero: una consulta sirve a todo el mundo.
 */
export async function getPlaces(kind: PlaceKind): Promise<Place[]> {
  const { data, error } = await supabasePublic
    .from('places')
    .select(COLUMNS)
    .eq('kind', kind)
    .eq('is_active', true)
    // Los saturados van al final: siguen siendo útiles saberlos, pero no son
    // a donde hay que ir ahora.
    .order('is_full', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('[places] no se pudieron cargar:', error.message);
    return [];
  }

  return (data ?? []) as Place[];
}

/** Enlace a Maps: usa coordenadas si las hay, y si no la dirección escrita. */
export function mapsUrl(place: Place): string | null {
  if (place.lat !== null && place.lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  }
  if (place.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${place.address}, Cali, Colombia`,
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
