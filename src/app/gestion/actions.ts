'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MUNICIPIO } from '@/config/municipios';
import { MAX_CONTACTOS, SERVICE_CATEGORIES } from '@/lib/catalog';
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

type ContactoNuevo = {
  method: string;
  value: string;
  label: string | null;
  orden: number;
};

/**
 * Los contactos vienen en ranuras numeradas (`contact_value_1`, `_2`, `_3`).
 * Las vacías se ignoran, así que borrar un número es borrar el campo, y el
 * orden final se recalcula: si se vacía el segundo, el tercero sube y no
 * quedan huecos.
 */
function leerContactos(
  form: FormData,
): { error: string } | { contactos: ContactoNuevo[] } {
  const contactos: ContactoNuevo[] = [];

  for (let i = 1; i <= MAX_CONTACTOS; i++) {
    const value = texto(form, `contact_value_${i}`);
    if (!value) continue;

    const method = texto(form, `contact_method_${i}`);
    if (!METODOS.includes(method))
      return { error: `Elige el medio del contacto ${i}.` };
    if (value.length < 3 || value.length > 120)
      return { error: `El contacto ${i} debe tener entre 3 y 120 caracteres.` };

    contactos.push({
      method,
      value,
      label: texto(form, `contact_label_${i}`).slice(0, 60) || null,
      orden: contactos.length,
    });
  }

  return { contactos };
}

/** Campos comunes a crear y editar, ya validados. */
function leerLugar(form: FormData):
  | { error: string }
  | { datos: Record<string, unknown>; contactos: ContactoNuevo[] } {
  const kind = texto(form, 'kind');
  const name = texto(form, 'name');
  const serviceCategory = texto(form, 'service_category');
  const website = texto(form, 'website');
  const imageUrl = texto(form, 'image_url');

  if (!TIPOS.includes(kind)) return { error: 'Elige el tipo de lugar.' };
  if (name.length < 3 || name.length > 100)
    return { error: 'El nombre debe tener entre 3 y 100 caracteres.' };

  // El esquema exige categoría solo para servicios, y la prohíbe en el resto.
  if (kind === 'servicio' && !CATEGORIAS_SERVICIO.includes(serviceCategory))
    return { error: 'Un servicio necesita categoría.' };

  const leidos = leerContactos(form);
  if ('error' in leidos) return { error: leidos.error };

  if (website && !website.startsWith('https://'))
    return { error: 'El sitio web debe empezar por https://' };
  if (imageUrl && !imageUrl.startsWith('https://'))
    return { error: 'La imagen debe empezar por https://' };

  const lat = numeroONulo(form, 'lat');
  const lng = numeroONulo(form, 'lng');
  if ((lat === null) !== (lng === null))
    return { error: 'Las coordenadas van completas o ninguna.' };

  const principal = leidos.contactos[0] ?? null;

  return {
    contactos: leidos.contactos,
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
      // Escritura doble mientras dure el traspaso a `place_contacts`: el mapa
      // y cualquier despliegue anterior todavía leen estas dos columnas. Las
      // elimina la migración de cierre, no antes (ver la 0021).
      contact_method: principal?.method ?? null,
      contact_value: principal?.value ?? null,
      website: website || null,
      image_url: imageUrl || null,
      schedule: texto(form, 'schedule') || null,
      supplies_needed: texto(form, 'supplies_needed') || null,
      supplies_surplus: texto(form, 'supplies_surplus') || null,
      safety_note: texto(form, 'safety_note') || null,
      is_full: form.get('is_full') === 'on',
      is_verified: form.get('is_verified') === 'on',
      is_active: form.get('is_active') === 'on',
      // Se fuerza a falso fuera de los servicios: el CHECK de la base lo
      // exige, y un acopio visible en otro municipio mandaría gente a
      // atravesar el país con un mercado.
      disponible_en_todos:
        kind === 'servicio' && form.get('disponible_en_todos') === 'on',
    },
  };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Reemplaza los contactos del lugar: se borran los que había y se insertan
 * los del formulario.
 *
 * Borrar e insertar en vez de conciliar fila por fila porque son tres como
 * máximo y no hay nada colgando de su id. Conciliar sería más código para
 * conservar unos identificadores que a nadie le importan.
 */
async function guardarContactos(
  supabase: Supabase,
  placeId: string,
  contactos: ContactoNuevo[],
): Promise<string | null> {
  const { error: errorBorrado } = await supabase
    .from('place_contacts')
    .delete()
    .eq('place_id', placeId);

  if (errorBorrado) return errorBorrado.message;
  if (contactos.length === 0) return null;

  const { error } = await supabase
    .from('place_contacts')
    .insert(contactos.map((c) => ({ ...c, place_id: placeId })));

  return error?.message ?? null;
}

export async function crearLugar(
  _prev: EstadoLugar,
  form: FormData,
): Promise<EstadoLugar> {
  const leido = leerLugar(form);
  if ('error' in leido) return { error: leido.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    // El municipio lo pone el servidor, nunca el formulario: si viniera del
    // cliente, un gestor podría intentar crear lugares en otro municipio.
    // RLS lo rechazaría igual, pero mejor ni ofrecerlo.
    .insert({ ...leido.datos, municipio: MUNICIPIO.id })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[gestion] no se pudo crear:', error?.message);
    return { error: 'No se pudo crear el lugar. Revisa los datos.' };
  }

  const fallo = await guardarContactos(supabase, data.id, leido.contactos);
  if (fallo) {
    // El lugar quedó creado y sin contactos. Se avisa en vez de fingir que
    // salió bien: el gestor entra a editarlo y los vuelve a poner.
    console.error('[gestion] contactos no guardados:', fallo);
    return {
      error: 'El lugar se creó, pero los contactos no. Edítalo y vuelve a guardarlos.',
    };
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

  const fallo = await guardarContactos(supabase, id, leido.contactos);
  if (fallo) {
    console.error('[gestion] contactos no guardados:', fallo);
    return { error: 'Se guardó el lugar, pero no los contactos.' };
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

/**
 * Cambia el WhatsApp al que llegan los reportes de puntos nuevos.
 *
 * Existe para que una rotación de turno en la alcaldía no dependa de un
 * despliegue. El municipio lo pone el servidor, nunca el formulario; RLS y los
 * privilegios por columna lo rechazarían igual, pero mejor ni ofrecerlo.
 */
export async function guardarContacto(form: FormData) {
  const crudo = texto(form, 'whatsapp_reportes');
  const responsable = texto(form, 'responsable').slice(0, 80) || null;

  // Se acepta como lo escriba la gente —"311 317 9404", "+57 311 3179404"— y
  // se normaliza aquí. Un número con espacios rompe el enlace de wa.me, y no
  // es razonable pedirle a alguien de una alcaldía que lo sepa.
  const digitos = crudo.replace(/\D/g, '');
  const numero = digitos.length === 10 ? `57${digitos}` : digitos;

  if (numero && !/^[0-9]{10,15}$/.test(numero)) {
    redirect('/gestion?contacto=invalido');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('municipio_config')
    .update({
      whatsapp_reportes: numero || null,
      responsable,
    })
    .eq('municipio', MUNICIPIO.id)
    .select('municipio');

  if (error || !data || data.length === 0) {
    console.error(
      '[gestion] no se pudo guardar el contacto:',
      error?.message ?? 'ninguna fila afectada',
    );
    redirect('/gestion?contacto=error');
  }

  refrescar();
  redirect('/gestion?contacto=1');
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
