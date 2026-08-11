import { supabasePublic } from './supabase/public';
import { FEED_COLUMNS, type FeedPost } from './types';
import type { Kind } from './catalog';

/** Tope de avisos que viajan al cliente en una página del tablero. */
export const FEED_LIMIT = 120;

/**
 * Trae los avisos abiertos. Se llama solo desde Server Components cacheados,
 * así que una ejecución sirve a todos los visitantes hasta el siguiente
 * `revalidate`.
 */
export async function getFeed(kind?: Kind): Promise<FeedPost[]> {
  let query = supabasePublic
    .from('posts')
    .select(FEED_COLUMNS)
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
