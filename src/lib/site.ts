import { MUNICIPIO } from '@/config/municipios';

/**
 * Enlace de WhatsApp con un mensaje ya escrito, al número de reportes del
 * municipio configurado.
 *
 * Si ese municipio todavía no tiene número, devuelve `null` y los botones de
 * reportar no se muestran: mejor eso que un botón que no lleva a ninguna parte.
 */
export function whatsappLink(mensaje: string): string | null {
  if (!MUNICIPIO.whatsappReportes) return null;
  return `https://wa.me/${MUNICIPIO.whatsappReportes}?text=${encodeURIComponent(
    mensaje,
  )}`;
}
