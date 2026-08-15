'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MUNICIPIO } from '@/config/municipios';
import { SERVICE_CATEGORIES } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';

export type EstadoLugar = { error: string | null };

const TIPOS = ['albergue', 'acopio', 'servicio', 'necesidad'];
const METODOS = ['whatsapp', 'telefono', 'otro'];
const CATEGORIAS_SERVICIO = SERVICE_CATEGORIES.map((c) => c.value) as string[];

/**
 * Todas las acciones de gestión se apoyan en RLS para el control de acceso:
 * la política `places_gestor` solo deja escribir filas del municipio del
 * gestor. Si alguien llamara estas acciones sin permiso, Postgres devuelve
 * cero filas afectadas y aquí se reporta el error.
 */
function refrescar() {
  revalidatePath('/sitios');
  revalidatePath('/servicios');
  revalidatePath('/mapa');
  revalidatePath('/gestion');
}

function texto(form: FormData, clave: string): string {
  const v = form.get(clave);
  return typeof v === 'string' ? v.trim() : '';
}

function numeroONulo(form: FormData, clave: string): number | null {
  const v = texto(form, clave);
  if (!v) return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Campos comunes a crear y editar, ya validados. */
function leerLugar(form: FormData):
  | { error: string }
  | { datos: Record<string, unknown> } {
  const kind = texto(form, 'kind');
  const name = texto(form, 'name');
  const serviceCategory = texto(form, 'service_category');
  const method = texto(form, 'contact_method');
  const website = texto(form, 'website');
  const imageUrl = texto(form, 'image_url');

  if (!TIPOS.includes(kind)) return { error: 'Elige el tipo de lugar.' };
  if (name.length < 3 || name.length > 100)
    return { error: 'El nombre debe tener entre 3 y 100 caracteres.' };

  // El esquema exige categoría solo para servicios, y la prohíbe en el resto.
  if (kind === 'servicio' && !CATEGORIAS_SERVICIO.includes(serviceCategory))
    return { error: 'Un servicio necesita categoría.' };

  if (method && !METODOS.includes(method))
    return { error: 'Ese medio de contacto no existe.' };

  if (website && !website.startsWith('https://'))
    return { error: 'El sitio web debe empezar por https://' };
  if (imageUrl && !imageUrl.startsWith('https://'))
    return { error: 'La imagen debe empezar por https://' };

  const lat = numeroONulo(form, 'lat');
  const lng = numeroONulo(form, 'lng');
  if ((lat === null) !== (lng === null))
    return { error: 'Las coordenadas van completas o ninguna.' };

  return {
    datos: {
      kind,
      name,
      org_name: texto(form, 'org_name') || null,
      description: texto(form, 'description') || null,
      service_category: kind === 'servicio' ? serviceCategory : null,
      address: texto(form, 'address') || null,
      comuna: texto(form, 'comuna') || null,
      lat,
      lng,
      contact_method: method || null,
      contact_value: texto(form, 'contact_value') || null,
      website: website || null,
      image_url: imageUrl || null,
      schedule: texto(form, 'schedule') || null,
      supplies_needed: texto(form, 'supplies_needed') || null,
      supplies_surplus: texto(form, 'supplies_surplus') || null,
      safety_note: texto(form, 'safety_note') || null,
      is_full: form.get('is_full') === 'on',
      is_verified: form.get('is_verified') === 'on',
      is_active: form.get('is_active') === 'on',
    },
  };
}

export async function crearLugar(
  _prev: EstadoLugar,
  form: FormData,
): Promise<EstadoLugar> {
  const leido = leerLugar(form);
  if ('error' in leido) return { error: leido.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from('places')
    // El municipio lo pone el servidor, nunca el formulario: si viniera del
    // cliente, un gestor podría intentar crear lugares en otro municipio.
    // RLS lo rechazaría igual, pero mejor ni ofrecerlo.
    .insert({ ...leido.datos, municipio: MUNICIPIO.id });

  if (error) {
    console.error('[gestion] no se pudo crear:', error.message);
    return { error: 'No se pudo crear el lugar. Revisa los datos.' };
  }

  refrescar();
  redirect('/gestion?creado=1');
}

export async function editarLugar(
  _prev: EstadoLugar,
  form: FormData,
): Promise<EstadoLugar> {
  const id = texto(form, 'id');
  if (!id) return { error: 'Falta el lugar a editar.' };

  const leido = leerLugar(form);
  if ('error' in leido) return { error: leido.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from('places')
    .update({ ...leido.datos, confirmed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[gestion] no se pudo editar:', error.message);
    return { error: 'No se pudo guardar. Revisa los datos.' };
  }

  refrescar();
  redirect('/gestion?guardado=1');
}

/**
 * Las tres acciones rápidas son las que de verdad se usan a diario: un punto
 * se llena, se vacía, o alguien llama para confirmar que sigue abierto.
 * Tenerlas a un toque desde la lista es lo que hace que los datos se
 * mantengan al día.
 */
export async function alternarLleno(form: FormData) {
  const id = form.get('id');
  const lleno = form.get('lleno') === 'true';
  if (typeof id !== 'string') return;

  const supabase = await createClient();
  await supabase
    .from('places')
    .update({ is_full: !lleno, confirmed_at: new Date().toISOString() })
    .eq('id', id);

  refrescar();
}

export async function confirmarVigencia(form: FormData) {
  const id = form.get('id');
  if (typeof id !== 'string') return;

  const supabase = await createClient();
  await supabase
    .from('places')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', id);

  refrescar();
}

export async function alternarActivo(form: FormData) {
  const id = form.get('id');
  const activo = form.get('activo') === 'true';
  if (typeof id !== 'string') return;

  const supabase = await createClient();
  await supabase
    .from('places')
    .update({ is_active: !activo, confirmed_at: new Date().toISOString() })
    .eq('id', id);

  refrescar();
}
