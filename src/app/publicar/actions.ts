'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MUNICIPIO } from '@/config/municipios';
import { CATEGORIES, CONTACT_METHODS, KINDS } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';

export type CreatePostState = { error: string | null };

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as string[];
const KIND_VALUES = KINDS.map((k) => k.value) as string[];
const METHOD_VALUES = CONTACT_METHODS.map((m) => m.value) as string[];
const COMUNA_VALUES = MUNICIPIO.divisiones.opciones;

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Revalida las tres rutas cacheadas del tablero. Sin esto el aviso recién
 * creado no aparecería hasta que expire el `revalidate` de 60 segundos.
 */
function refreshFeed() {
  revalidatePath('/');
  revalidatePath('/necesidades');
  revalidatePath('/ofertas');
}

export async function createPost(
  _prev: CreatePostState,
  form: FormData,
): Promise<CreatePostState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/publicar');

  const kind = text(form, 'kind');
  const category = text(form, 'category');
  const title = text(form, 'title');
  const description = text(form, 'description');
  const quantity = text(form, 'quantity_text');
  const comuna = text(form, 'comuna');
  const barrio = text(form, 'barrio');
  const address = text(form, 'address');
  const method = text(form, 'contact_method');
  const contactValue = text(form, 'contact_value');

  if (!KIND_VALUES.includes(kind)) return { error: 'Elige si necesitas u ofreces.' };
  if (!CATEGORY_VALUES.includes(category)) return { error: 'Elige una categoría.' };
  if (title.length < 5 || title.length > 90)
    return { error: 'El título debe tener entre 5 y 90 caracteres.' };
  if (description.length < 10 || description.length > 1000)
    return { error: 'La descripción debe tener entre 10 y 1000 caracteres.' };
  // La comuna es opcional, pero si viene tiene que ser una de la lista.
  // Si el municipio tiene lista, el valor debe salir de ella. Si no la tiene,
  // la zona es texto libre y solo se limita el largo.
  if (COMUNA_VALUES.length > 0) {
    if (comuna && !COMUNA_VALUES.includes(comuna))
      return {
        error: `Esa ${MUNICIPIO.divisiones.etiqueta.toLowerCase()} no existe en la lista.`,
      };
  } else if (comuna.length > 60) {
    return { error: 'El nombre de la zona es demasiado largo.' };
  }
  if (address && (address.length < 5 || address.length > 160))
    return { error: 'La dirección debe tener entre 5 y 160 caracteres.' };
  if (!comuna && !address && !barrio)
    return {
      error: 'Di al menos dónde: una dirección, un barrio o una comuna.',
    };
  if (!METHOD_VALUES.includes(method))
    return { error: 'Elige cómo quieres que te contacten.' };

  if (method === 'whatsapp' || method === 'telefono') {
    const digits = contactValue.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15)
      return { error: 'Revisa el número de teléfono.' };
  } else if (contactValue.length < 5 || contactValue.length > 120) {
    return { error: 'Escribe cómo pueden contactarte (entre 5 y 120 caracteres).' };
  }

  // Un solo RPC en vez de dos inserts: el aviso y su contacto entran en la
  // misma transacción. Antes, si el segundo insert fallaba, quedaba un aviso
  // publicado sin forma de contactar a nadie.
  const { error: createError } = await supabase.rpc('create_post_with_contact', {
    p_kind: kind,
    p_category: category,
    p_title: title,
    p_description: description,
    p_quantity: quantity || null,
    p_comuna: comuna || null,
    p_barrio: barrio || null,
    p_address: address || null,
    p_method: method,
    p_contact_value: contactValue,
    // El aviso queda atado al municipio de este despliegue.
    p_municipio: MUNICIPIO.id,
  });

  if (createError) {
    // El trigger de límite de avisos abiertos habla en español y su mensaje
    // sirve tal cual para el usuario.
    return { error: createError.message };
  }

  refreshFeed();
  redirect('/mis-avisos?publicado=1');
}

/** Deshace un cierre hecho por error. RLS y el trigger impiden revivir un
 *  aviso retirado por moderación. */
export async function reopenPost(formData: FormData) {
  const postId = formData.get('post_id');
  if (typeof postId !== 'string') return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    // `fulfilled_by` también se limpia: si el aviso vuelve a estar abierto, la
    // entrega que alguien confirmó ya no vale, y dejar su nombre ahí lo
    // haría responsable de algo que se deshizo.
    .update({ status: 'open', fulfilled_at: null, fulfilled_by: null })
    .eq('id', postId);

  if (error) {
    console.error('[posts] no se pudo reabrir:', error.message);
    return;
  }

  refreshFeed();
  revalidatePath('/mis-avisos');
}

export async function markFulfilled(formData: FormData) {
  const postId = formData.get('post_id');
  if (typeof postId !== 'string') return;

  const supabase = await createClient();
  const { error } = await supabase.rpc('mark_fulfilled', { p_post_id: postId });

  if (error) {
    console.error('[posts] no se pudo marcar como cumplido:', error.message);
    return;
  }

  refreshFeed();
  revalidatePath('/mis-avisos');
}

export async function deletePost(formData: FormData) {
  const postId = formData.get('post_id');
  if (typeof postId !== 'string') return;

  const supabase = await createClient();
  // Soft-delete a propósito: un DELETE físico arrastraría las alertas de la
  // comunidad en cascada, o sea la evidencia contra un estafador. Para el
  // autor el efecto es el mismo: el aviso desaparece del tablero y de su
  // lista (RLS esconde los 'removed'). RLS limita esto a los avisos propios.
  const { error } = await supabase
    .from('posts')
    .update({ status: 'removed' })
    .eq('id', postId);

  if (error) {
    console.error('[posts] no se pudo borrar:', error.message);
    return;
  }

  refreshFeed();
  revalidatePath('/mis-avisos');
}
