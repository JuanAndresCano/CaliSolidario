export const CATEGORIES = [
  { value: 'agua', label: 'Agua', emoji: '💧' },
  { value: 'alimentos', label: 'Alimentos', emoji: '🍲' },
  { value: 'medicamentos', label: 'Medicamentos', emoji: '💊' },
  { value: 'aseo', label: 'Aseo e higiene', emoji: '🧼' },
  { value: 'panales', label: 'Pañales', emoji: '🍼' },
  { value: 'ropa', label: 'Ropa', emoji: '👕' },
  { value: 'cobijas_colchones', label: 'Cobijas y colchones', emoji: '🛏️' },
  { value: 'albergue', label: 'Albergue', emoji: '🏠' },
  { value: 'transporte', label: 'Transporte', emoji: '🚚' },
  { value: 'herramientas', label: 'Herramientas', emoji: '🔧' },
  { value: 'mano_de_obra', label: 'Mano de obra', emoji: '💪' },
  { value: 'salud', label: 'Salud y apoyo psicológico', emoji: '🩺' },
  { value: 'mascotas', label: 'Mascotas', emoji: '🐾' },
  { value: 'otro', label: 'Otro', emoji: '📦' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<Category, string>;

export const CATEGORY_EMOJIS = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.emoji]),
) as Record<Category, string>;

/** Las 22 comunas y los 15 corregimientos de Cali. */
export const COMUNAS = [
  ...Array.from({ length: 22 }, (_, i) => `Comuna ${i + 1}`),
  'Corregimiento Golondrinas',
  'Corregimiento La Paz',
  'Corregimiento Montebello',
  'Corregimiento La Castilla',
  'Corregimiento Los Andes',
  'Corregimiento Pichindé',
  'Corregimiento La Leonera',
  'Corregimiento Felidia',
  'Corregimiento El Saladito',
  'Corregimiento La Elvira',
  'Corregimiento Villacarmelo',
  'Corregimiento La Buitrera',
  'Corregimiento Pance',
  'Corregimiento El Hormiguero',
  'Corregimiento Navarro',
] as const;

export const CONTACT_METHODS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telefono', label: 'Llamada' },
  { value: 'otro', label: 'Otro medio' },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]['value'];

export const COMMENT_KINDS = [
  {
    value: 'comment',
    label: 'Comentario',
    hint: 'Un aporte: que ya lo llevaste, que tienes parte de lo que piden, una corrección.',
  },
  {
    value: 'warning',
    label: 'Alerta',
    hint: 'Algo salió mal. Marca el aviso en conflicto para que los demás procedan con cuidado.',
  },
] as const;

export type CommentKind = (typeof COMMENT_KINDS)[number]['value'];

export const KINDS = [
  { value: 'need', label: 'Necesito', plural: 'Necesidades' },
  { value: 'offer', label: 'Ofrezco', plural: 'Ofertas' },
] as const;

export type Kind = (typeof KINDS)[number]['value'];
