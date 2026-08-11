/**
 * Texto de ubicación para el tablero. Los tres campos son opcionales, así que
 * se arma con lo que haya y cae en "Cali" si no hay nada.
 */
export function describePlace(
  address: string | null,
  barrio: string | null,
  comuna: string | null,
): string {
  const parts = [address, barrio, comuna].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Cali';
}
