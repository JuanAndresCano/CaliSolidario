import { permanentRedirect } from 'next/navigation';

/**
 * La página se llamaba /acopio cuando solo listaba puntos de acopio. Ahora
 * también muestra zonas desatendidas, así que pasó a /sitios.
 *
 * Se mantiene la ruta vieja redirigiendo: el enlace ya circuló por WhatsApp y
 * ahí no se puede corregir nada una vez enviado.
 */
export default function AcopioRedirect() {
  permanentRedirect('/sitios');
}
