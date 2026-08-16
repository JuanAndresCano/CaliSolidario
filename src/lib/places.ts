import { MUNICIPIO } from '@/config/municipios';
import { supabasePublic } from './supabase/public';
import type { Place, PlaceKind } from './place-utils';

// El tipo y las utilidades puras viven en place-utils para que los componentes
// de cliente no arrastren el cliente de Supabase al navegador. Se reexportan
// por comodidad de los componentes de servidor.
export type { Place, PlaceContact, PlaceKind } from './place-utils';
export { mapsUrl, contactUrl, contactUrlDe, contactosDe } from './place-utils';

// `contacts` es la tabla anidada: PostgREST la resuelve por la llave foránea
// de place_contacts. Se ordena en el cliente, dentro de `contactosDe`.
const COLUMNS =
  'id, municipio, kind, name, org_name, description, service_category, address, comuna, lat, lng, contact_method, contact_value, website, image_url, schedule, supplies_needed, supplies_surplus, safety_note, is_full, is_verified, is_active, disponible_en_todos, confirmed_at, contacts:place_contacts(id, method, value, label, orden)';

/**
 * Lugares curados por el equipo. Se consultan con el cliente anónimo desde
 * páginas cacheadas, igual que el tablero: una consulta sirve a todo el mundo.
 */
export async function getPlaces(kind: PlaceKind): Promise<Place[]> {
  const { data, error } = await supabasePublic
    .from('places')
    .select(COLUMNS)
    // Los de este municipio, más los que no dependen de ninguno (servicios
    // virtuales). PostgREST une esta condición con las demás por AND.
    .or(`municipio.eq.${MUNICIPIO.id},disponible_en_todos.is.true`)
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
