/**
 * Configuración del sitio que no vive en la base de datos.
 */

/**
 * WhatsApp al que la gente escribe para reportar un punto nuevo.
 *
 * Solo dígitos, con indicativo país y sin signos: '573001234567'.
 * Mientras esté vacío, los botones de "reportar un punto" no se muestran —
 * mejor no enseñar un botón que no lleva a ninguna parte.
 */
export const WHATSAPP_REPORTES = '573113179404';

/** Enlace de WhatsApp con un mensaje ya escrito. */
export function whatsappLink(mensaje: string): string | null {
  if (!WHATSAPP_REPORTES) return null;
  return `https://wa.me/${WHATSAPP_REPORTES}?text=${encodeURIComponent(mensaje)}`;
}
