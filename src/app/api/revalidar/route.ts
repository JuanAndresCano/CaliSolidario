import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Purga la caché de las páginas públicas. Lo llama un Database Webhook de
 * Supabase cada vez que cambia una fila de `places` o de `posts`.
 *
 * Por qué existe: `revalidatePath` solo se dispara desde las acciones de la
 * app, y buena parte de las ediciones se hacen a mano en el SQL Editor. Sin
 * esto, el sitio se entera cuando vence el reloj, no cuando cambia el dato.
 *
 * Además ahorra: con el webhook la página se regenera cuando algo cambia y no
 * cada minuto por si acaso.
 */

/** Todas las rutas cacheadas que dependen de la base. */
const RUTAS = [
  '/',
  '/necesidades',
  '/ofertas',
  '/sitios',
  '/servicios',
  '/resueltas',
];

/**
 * Comparación en tiempo constante. Un `===` normal corta en el primer carácter
 * distinto y filtra, por diferencias de milisegundos, cuánto del secreto se
 * acertó.
 */
function secretoValido(recibido: string | null, esperado: string): boolean {
  if (!recibido || recibido.length !== esperado.length) return false;

  let diferencia = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferencia |= recibido.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diferencia === 0;
}

export async function POST(request: NextRequest) {
  const esperado = process.env.REVALIDATE_SECRET;

  // Sin secreto configurado el endpoint no se activa: es preferible que no
  // funcione a que quede abierto para que cualquiera dispare regeneraciones.
  if (!esperado) {
    console.error('[revalidar] falta REVALIDATE_SECRET');
    return NextResponse.json({ error: 'no configurado' }, { status: 503 });
  }

  if (!secretoValido(request.headers.get('x-revalidate-secret'), esperado)) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }

  for (const ruta of RUTAS) revalidatePath(ruta);

  return NextResponse.json({ revalidado: RUTAS, en: new Date().toISOString() });
}
