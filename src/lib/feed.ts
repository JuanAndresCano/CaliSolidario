import { MUNICIPIO } from '@/config/municipios';
import { supabasePublic } from './supabase/public';
import { FEED_COLUMNS, type FeedPost } from './types';
import type { Kind } from './catalog';

/** Tope de avisos que viajan al cliente en una página del tablero. */
export const FEED_LIMIT = 500;

/**
 * Todas las consultas del tablero filtran por el municipio de este despliegue.
 * La base es compartida entre municipios: sin este filtro, el sitio de
 * Filandia mostraría los avisos de Cali.
 *
 * La separación en lectura vive aquí y no en RLS a propósito: los avisos son
 * públicos de todos modos, así que mezclarlos sería un error de correctitud,
 * no una fuga de datos. Donde sí la impone RLS es en escritura (ver 0017).
 */

/**
 * Trae los avisos abiertos. Se llama solo desde Server Components cacheados,
 * así que una ejecución sirve a todos los visitantes hasta el siguiente
 * `revalidate`.
 */
export async function getFeed(kind?: Kind): Promise<FeedPost[]> {
  let query = supabasePublic
    .from('posts')
    .select(FEED_COLUMNS)
    .eq('municipio', MUNICIPIO.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(FEED_LIMIT);

  if (kind) query = query.eq('kind', kind);

  const { data, error } = await query;

  if (error) {
    // Que un fallo de la base no tumbe la página entera: el tablero se muestra
    // vacío con su mensaje y el resto del sitio (publicar, entrar) sigue vivo.
    console.error('[feed] no se pudo cargar el tablero:', error.message);
    return [];
  }

  return (data ?? []) as FeedPost[];
}

export type ResolvedPost = FeedPost & { fulfilled_at: string | null };

/**
 * Ayudas ya concretadas. Sirven de prueba pública de que el tablero funciona:
 * quien llega y ve solo peticiones abiertas no sabe si esto sirve para algo.
 */
export async function getResolved(limit = 60): Promise<ResolvedPost[]> {
  const { data, error } = await supabasePublic
    .from('posts')
    .select(`${FEED_COLUMNS}, fulfilled_at`)
    .eq('municipio', MUNICIPIO.id)
    .eq('status', 'fulfilled')
    .order('fulfilled_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[feed] no se pudieron cargar las resueltas:', error.message);
    return [];
  }

  return (data ?? []) as ResolvedPost[];
}

/** Cuántas ayudas se han concretado en total. Solo trae el conteo, no filas. */
export async function countResolved(): Promise<number> {
  const { count, error } = await supabasePublic
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('municipio', MUNICIPIO.id)
    .eq('status', 'fulfilled');

  if (error) {
    console.error('[feed] no se pudo contar las resueltas:', error.message);
    return 0;
  }

  return count ?? 0;
}
