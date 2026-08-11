/**
 * Antigüedad en pasos gruesos (minutos, horas, días). Deliberadamente sin
 * segundos: el mismo texto se calcula en el servidor y en el cliente, y una
 * unidad fina provocaría desajustes de hidratación.
 */
export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}
