import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente con la sesión del usuario. Úsalo en Server Actions y en páginas que
 * dependen de quién está logueado. Al leer cookies la ruta se vuelve dinámica,
 * así que NO lo uses en el listado público: eso mataría el caché.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: el middleware ya refresca la
            // sesión, así que se puede ignorar.
          }
        },
      },
    },
  );
}
