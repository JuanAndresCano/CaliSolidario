import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { MUNICIPIO } from '@/config/municipios';

/**
 * Purga la caché de las páginas públicas. Lo llama un Database Webhook de
 * Supabase cada vez que cambia una fila de `places` o de `posts`.
 *
 * Por qué existe: `revalidatePath` solo se dispara desde las acciones de la
 * app, y buena parte de las ediciones se hacen a mano en el SQL Editor. Sin
 * esto, el sitio se entera cuando vence el reloj, no cuando cambia el dato.
 *
 * Con varios municipios en la misma base, el webhook tiene que avisarle a
 * TODOS los despliegues —Supabase no sabe cuál corresponde— y cada uno decide
 * si le toca. De ahí el filtro por municipio de abajo.
 */

/** Todas las rutas cacheadas que dependen de la base. */
const RUTAS = [
  '/',
  '/necesidades',
  '/ofertas',
  '/sitios',
  '/servicios',
  '/mapa',
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

/**
 * El municipio de la fila que cambió, según el cuerpo que manda Supabase:
 * `{ type, table, record, old_record }`. En un DELETE la fila viene en
 * `old_record`.
 *
 * Si no se puede determinar, devuelve `null` y se revalida igual: una
 * regeneración de más no le cuesta nada a nadie, pero un dato viejo en
 * pantalla sí.
 */
async function municipioDelCambio(request: NextRequest): Promise<string | null> {
  try {
    const cuerpo = await request.json();
    const fila = cuerpo?.record ?? cuerpo?.old_record;
    const municipio = fila?.municipio;
    return typeof municipio === 'string' ? municipio : null;
  } catch {
    return null;
  }
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

  const municipio = await municipioDelCambio(request);

  if (municipio !== null && municipio !== MUNICIPIO.id) {
    // El cambio es de otro municipio: este despliegue no muestra esa fila, así
    // que regenerar sería trabajo perdido. Se responde 200 para que Supabase
    // no lo cuente como fallo.
    return NextResponse.json({
      omitido: true,
      motivo: `el cambio es de "${municipio}" y este sitio sirve "${MUNICIPIO.id}"`,
    });
  }

  for (const ruta of RUTAS) revalidatePath(ruta);

  return NextResponse.json({
    municipio: MUNICIPIO.id,
    revalidado: RUTAS,
    en: new Date().toISOString(),
  });
}
