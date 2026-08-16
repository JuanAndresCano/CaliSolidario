export const CATEGORIES = [
  { value: 'agua', label: 'Agua', emoji: '💧' },
  { value: 'alimentos', label: 'Alimentos', emoji: '🍲' },
  { value: 'medicamentos', label: 'Medicamentos', emoji: '💊' },
  { value: 'aseo', label: 'Aseo e higiene', emoji: '🚿' },
  { value: 'panales', label: 'Pañales', emoji: '🍼' },
  { value: 'ropa', label: 'Ropa', emoji: '👕' },
  { value: 'cobijas_colchones', label: 'Cobijas y colchones', emoji: '🛏️' },
  { value: 'albergue', label: 'Albergue', emoji: '🏠' },
  { value: 'transporte', label: 'Transporte', emoji: '🚚' },
  { value: 'herramientas', label: 'Herramientas', emoji: '🔧' },
  { value: 'mano_de_obra', label: 'Mano de obra', emoji: '💪' },
  { value: 'salud', label: 'Salud y apoyo psicológico', emoji: '🏥' },
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

/**
 * La división territorial se mudó a `src/config/municipios.ts`: depende del
 * municipio, no del catálogo de categorías. Se reexporta para no romper lo que
 * ya la importaba de aquí.
 */
export { MUNICIPIO } from '@/config/municipios';

export const CONTACT_METHODS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telefono', label: 'Llamada' },
  { value: 'otro', label: 'Otro medio' },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]['value'];

/**
 * Cuántos contactos admite un lugar en el formulario de gestión.
 *
 * Vive aquí y no en las acciones porque un módulo 'use server' solo puede
 * exportar funciones async: una constante ahí rompe el build.
 */
export const MAX_CONTACTOS = 3;

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

/**
 * Los emoji son deliberadamente antiguos (Unicode 8 o anterior). Los añadidos
 * en Unicode 11+ —🫂, 🩺, 🧰— se ven como un cuadro vacío en equipos con
 * fuentes desactualizadas, y ya nos pasó en producción.
 */
export const SERVICE_CATEGORIES = [
  {
    value: 'salud_mental',
    label: 'Apoyo emocional',
    emoji: '💬',
    caution: null,
  },
  {
    value: 'estructural',
    label: 'Revisión de vivienda',
    emoji: '🏚️',
    caution:
      'Un dictamen sobre si una casa aguanta es trabajo de ingeniería civil. Pide siempre la tarjeta profesional (COPNIA) antes de confiar en una evaluación.',
  },
  {
    value: 'salud_fisica',
    label: 'Salud y fisioterapia',
    emoji: '🏥',
    caution: null,
  },
  {
    value: 'rescate',
    label: 'Apoyo técnico a rescate',
    emoji: '🚨',
    caution: null,
  },
  { value: 'juridico', label: 'Asesoría legal', emoji: '⚖️', caution: null },
  { value: 'veterinario', label: 'Veterinaria', emoji: '🐾', caution: null },
  { value: 'otro', label: 'Otro servicio', emoji: '➕', caution: null },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]['value'];

export const SERVICE_CATEGORY_MAP = Object.fromEntries(
  SERVICE_CATEGORIES.map((s) => [s.value, s]),
) as Record<ServiceCategory, (typeof SERVICE_CATEGORIES)[number]>;

export const KINDS = [
  { value: 'need', label: 'Necesito', plural: 'Necesidades' },
  { value: 'offer', label: 'Ofrezco', plural: 'Ofertas' },
] as const;

export type Kind = (typeof KINDS)[number]['value'];
