import type { MetadataRoute } from 'next';
import { MUNICIPIO } from '@/config/municipios';

const SITE = MUNICIPIO.url;

/** Solo los paneles. Los avisos individuales quedan fuera a propósito: ver robots.ts */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1 },
    { path: '/necesidades', priority: 0.9 },
    { path: '/ofertas', priority: 0.9 },
    { path: '/sitios', priority: 0.9 },
    { path: '/mapa', priority: 0.8 },
    { path: '/servicios', priority: 0.8 },
    { path: '/guias', priority: 0.7 },
    { path: '/resueltas', priority: 0.5 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority,
  }));
}
