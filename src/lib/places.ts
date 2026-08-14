import { supabasePublic } from './supabase/public';
import type { Place, PlaceKind } from './place-utils';

// El tipo y las utilidades puras viven en place-utils para que los componentes
// de cliente no arrastren el cliente de Supabase al navegador. Se reexportan
// por comodidad de los componentes de servidor.
export type { Place, PlaceKind } from './place-utils';
export { mapsUrl, contactUrl } from './place-utils';

const COLUMNS =
  'id, kind, name, org_name, description, service_category, address, comuna, lat, lng, contact_method, contact_value, website, image_url, schedule, supplies_needed, supplies_surplus, safety_note, is_full, is_verified, confirmed_at';

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
