import { MUNICIPIO } from '@/config/municipios';
import { supabasePublic } from './supabase/public';

/**
 * Número al que se reportan puntos nuevos.
 *
 * Vive en `municipio_config` y no en el código porque quien responde rota:
 * en Filandia lo atiende la alcaldía, y cada cambio de turno no puede exigir
 * un despliegue (ver la migración 0020).
 *
 * El valor de `municipios.ts` queda como respaldo para cuando la tabla
 * todavía no existe o la consulta falla. Eso es lo que permite que la
 * migración y el despliegue vayan en cualquier orden.
 */
export async function whatsappReportes(): Promise<string | null> {
  const { data, error } = await supabasePublic
    .from('municipio_config')
    .select('whatsapp_reportes')
    .eq('municipio', MUNICIPIO.id)
    .maybeSingle();

  // La base no respondió: mejor el número de siempre que ningún botón.
  if (error) {
    console.error('[site] no se pudo leer municipio_config:', error.message);
    return MUNICIPIO.whatsappReportes || null;
  }

  // Todavía no hay fila para este municipio (migración sin correr).
  if (!data) return MUNICIPIO.whatsappReportes || null;

  // Hay fila: manda ella, incluso si está vacía. Si el gestor borró el número
  // fue a propósito —nadie está atendiendo— y resucitar el del código pondría
  // a la gente a escribirle a alguien que ya no responde.
  return data.whatsapp_reportes || null;
}

/**
 * Enlace de WhatsApp con un mensaje ya escrito.
 *
 * Si el municipio no tiene número, devuelve `null` y los botones de reportar
 * no se muestran: mejor eso que un botón que no lleva a ninguna parte.
 */
export async function whatsappLink(mensaje: string): Promise<string | null> {
  const numero = await whatsappReportes();
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
