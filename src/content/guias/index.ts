/**
 * Guías informativas del sitio.
 *
 * Viven en el repo y no en la base de datos a propósito. Se evaluó montar un
 * editor web y se descartó:
 *
 *   - Publicar una guía no es urgente. Un punto de acopio saturado cambia cada
 *     hora; una guía de duelo no. El único beneficio real del editor
 *     —publicar desde el celular— aquí casi no aplica.
 *   - En contenido de salud mental la fricción es una virtud: el diff, el
 *     historial y poder revertir valen más que la comodidad.
 *   - Cuesta cero: se generan estáticas, sin una sola consulta a Supabase.
 *
 * Si publicar por commit se vuelve el cuello de botella, ahí sí vale el editor.
 *
 * PARA AGREGAR UNA GUÍA: crea un archivo en esta carpeta siguiendo el patrón
 * de los existentes, impórtalo aquí y agrégalo al arreglo. Nada más.
 *
 * REGLA al escribir: nada de consejo clínico inventado. Cada guía declara
 * quién la escribió y con qué credenciales, y recuerda que no reemplaza a un
 * profesional.
 */
import { COMUNIDAD_Y_SENTIDO } from './comunidad-y-sentido';
import { CUIDARTE_EN_LA_ZONA } from './cuidarte-en-la-zona';
import { DONACIONES_QUE_LLEGAN } from './donaciones-que-llegan';
import { HERRAMIENTAS_PARA_ACOMPANAR } from './herramientas-para-acompanar';
import { LOS_DUELOS } from './los-duelos';
import { NINOS_Y_ADOLESCENTES } from './ninos-y-adolescentes';
import { PRIMEROS_AUXILIOS_EMOCIONALES } from './primeros-auxilios-emocionales';
import type { Guide } from './tipos';

export type { Guide, GuideBlock, GuideSection, GuideAuthor } from './tipos';

/**
 * El orden importa: es el que ve la gente, de lo más accionable hoy a lo más
 * reposado. Las dos primeras son de acción inmediata para quien va a salir a
 * ayudar; las demás acompañan un proceso más largo.
 */
export const GUIDES: Guide[] = [
  CUIDARTE_EN_LA_ZONA,
  DONACIONES_QUE_LLEGAN,
  PRIMEROS_AUXILIOS_EMOCIONALES,
  LOS_DUELOS,
  HERRAMIENTAS_PARA_ACOMPANAR,
  NINOS_Y_ADOLESCENTES,
  COMUNIDAD_Y_SENTIDO,
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
