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
function requerido(nombre: string): string {
  const valor = process.env[nombre];

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
  requerido('NEXT_PUBLIC_SUPABASE_URL'),
  requerido('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
