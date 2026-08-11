/** Marcas diacríticas combinantes (los acentos que deja `normalize('NFD')`). */
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Normaliza para comparar: sin tildes, sin mayúsculas, sin espacios de sobra.
 * Casi nadie escribe las tildes en el celular, así que "pañales" y "panales"
 * tienen que encontrar lo mismo.
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim();
}

/** Coincide si cada palabra buscada aparece en alguno de los campos. */
export function matchesQuery(query: string, fields: (string | null)[]): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = normalize(fields.filter(Boolean).join(' '));
  return terms.every((term) => haystack.includes(term));
}
