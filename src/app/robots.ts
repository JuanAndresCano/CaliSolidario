import type { MetadataRoute } from 'next';

/**
 * El tablero se indexa a propósito: que Google lo encuentre es parte de que
 * la ayuda llegue.
 *
 * Lo que se excluye son los avisos individuales. Su contenido es público
 * dentro del sitio, pero indexarlos los vuelve permanentes: la dirección de
 * una familia damnificada quedaría en la caché de Google y en archive.org
 * años después de que la emergencia pasó, mucho más allá de lo que esa
 * persona aceptó al publicar. El aviso caduca a los 7 días; su rastro en un
 * buscador, no.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/aviso/', '/mis-avisos', '/publicar', '/admin', '/auth/'],
    },
    sitemap: 'https://calisolidario.triadaaliados.com/sitemap.xml',
  };
}
