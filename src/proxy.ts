import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * En Next 16 este archivo reemplaza a `middleware.ts` (deprecado).
 *
 * Lo único que hace es refrescar el token de Supabase y reescribir las cookies.
 * Deliberadamente NO protege rutas: el listado es público y las páginas
 * privadas verifican la sesión ellas mismas. Así el matcher deja pasar el
 * tráfico anónimo sin ejecutar nada.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/publicar/:path*',
    '/mis-avisos/:path*',
    '/aviso/:path*',
    '/admin/:path*',
    '/login',
  ],
};
