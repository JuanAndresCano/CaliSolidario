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
 * Qué rutas le importan a cada tabla.
 *
 * Antes se purgaban las siete siempre. Publicar un aviso regeneraba el mapa y
 * la página de servicios, que no muestran avisos; mover un acopio regeneraba
 * el tablero, que no muestra lugares. Cada regeneración es una escritura de
 * ISR facturable, y el plan gratuito se quedó al 75% de su cupo.
 *
 * Una tabla que no esté aquí purga todo, que es el comportamiento seguro:
 * ante la duda, dato fresco antes que escritura ahorrada.
 */
const RUTAS_POR_TABLA: Record<string, string[]> = {
  posts: ['/', '/necesidades', '/ofertas', '/resueltas'],
  places: ['/sitios', '/servicios', '/mapa'],
  place_contacts: ['/sitios', '/servicios', '/mapa'],
  // Solo cambia el botón de "¿conoces otro punto?", que vive en estas dos.
  municipio_config: ['/sitios', '/servicios'],
};

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
async function leerCambio(
  request: NextRequest,
): Promise<{ municipio: string | null; rutas: string[] }> {
  // El cuerpo solo se puede leer una vez, así que de aquí sale todo.
  try {
    const cuerpo = await request.json();
    const fila = cuerpo?.record ?? cuerpo?.old_record;
    const tabla = typeof cuerpo?.table === 'string' ? cuerpo.table : '';
    const rutas = RUTAS_POR_TABLA[tabla] ?? RUTAS;

    // Una ficha marcada como disponible en todos los municipios se ve en todos
    // los sitios, así que su cambio le importa a todos: se devuelve `null`
    // para que ninguno lo omita.
    if (fila?.disponible_en_todos === true) return { municipio: null, rutas };

    const municipio = fila?.municipio;
    return {
      municipio: typeof municipio === 'string' ? municipio : null,
      rutas,
    };
  } catch {
    return { municipio: null, rutas: RUTAS };
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

  const { municipio, rutas } = await leerCambio(request);

  if (municipio !== null && municipio !== MUNICIPIO.id) {
    // El cambio es de otro municipio: este despliegue no muestra esa fila, así
    // que regenerar sería trabajo perdido. Se responde 200 para que Supabase
    // no lo cuente como fallo.
    return NextResponse.json({
      omitido: true,
      motivo: `el cambio es de "${municipio}" y este sitio sirve "${MUNICIPIO.id}"`,
    });
  }

  for (const ruta of rutas) revalidatePath(ruta);

  return NextResponse.json({
    municipio: MUNICIPIO.id,
    revalidado: rutas,
    en: new Date().toISOString(),
  });
}
