import { createClient } from '@supabase/supabase-js';

/**
 * Cliente anónimo, sin cookies ni sesión.
 *
 * Esta es la pieza que hace que el free tier aguante: el listado público lo
 * renderiza el servidor con este cliente y la página se cachea. Mil personas
 * mirando el tablero = una consulta a Postgres cada `revalidate` segundos,
 * no una por visitante.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
