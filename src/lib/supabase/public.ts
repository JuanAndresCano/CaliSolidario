import { createClient } from '@supabase/supabase-js';

/**
 * Cliente anónimo, sin cookies ni sesión.
 *
 * Esta es la pieza que hace que el free tier aguante: el listado público lo
 * renderiza el servidor con este cliente y la página se cachea. Mil personas
 * mirando el tablero = una consulta a Postgres cada `revalidate` segundos,
 * no una por visitante.
 */
/**
 * El cliente se crea al evaluar el módulo, así que sin variables de entorno el
 * build entero falla con "supabaseUrl is required" y sin decir dónde. Pasó al
 * abrir el primer PR: las variables estaban solo en Production y la preview
 * corre en el entorno Preview.
 *
 * Con este mensaje, quien vea el log sabe qué configurar y dónde.
 */
/**
 * OJO: el valor se recibe como argumento y NO se lee con `process.env[nombre]`.
 *
 * Next sustituye las variables `NEXT_PUBLIC_` en el paquete del navegador solo
 * cuando la referencia es literal. Con acceso dinámico no las reemplaza, así
 * que quedan indefinidas en el cliente y este mismo guard revienta. Pasó en
 * producción: tumbó el mapa entero.
 */
function requerido(valor: string | undefined, nombre: string): string {
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        'En Vercel: Settings → Environment Variables, y márcala para TODOS ' +
        'los entornos (Production, Preview y Development), no solo Production. ' +
        'En local va en .env.local.',
    );
  }

  return valor;
}

export const supabasePublic = createClient(
  requerido(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  requerido(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
