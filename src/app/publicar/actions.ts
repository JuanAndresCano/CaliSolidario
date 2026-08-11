'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CATEGORIES, COMUNAS, CONTACT_METHODS, KINDS } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';

export type CreatePostState = { error: string | null };

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as string[];
const KIND_VALUES = KINDS.map((k) => k.value) as string[];
const METHOD_VALUES = CONTACT_METHODS.map((m) => m.value) as string[];
const COMUNA_VALUES = COMUNAS as readonly string[];

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
  if (comuna && !COMUNA_VALUES.includes(comuna))
    return { error: 'Esa comuna no existe en la lista.' };
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

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      kind,
      category,
      title,
      description,
      quantity_text: quantity || null,
      comuna: comuna || null,
      barrio: barrio || null,
      address: address || null,
    })
    .select('id')
    .single();

  if (postError) {
    // El trigger de límite de avisos abiertos habla en español y su mensaje
    // sirve tal cual para el usuario.
    return { error: postError.message };
  }

  const { error: contactError } = await supabase
    .from('post_contacts')
    .insert({ post_id: post.id, method, value: contactValue });

  if (contactError) {
    // Un aviso sin contacto no sirve para nada: se deshace la publicación.
    await supabase.from('posts').delete().eq('id', post.id);
    return { error: 'No se pudo guardar el dato de contacto. Intenta de nuevo.' };
  }

  refreshFeed();
  redirect('/mis-avisos?publicado=1');
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
  // RLS se encarga de que solo el autor pueda borrar.
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('[posts] no se pudo borrar:', error.message);
    return;
  }

  refreshFeed();
  revalidatePath('/mis-avisos');
}
