'use server';

import { revalidatePath } from 'next/cache';
import { COMMENT_KINDS } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';

export type CommentState = { error: string | null };

const KIND_VALUES = COMMENT_KINDS.map((k) => k.value) as string[];

/**
 * Una alerta cambia `warning_count`, que sale en el tablero público cacheado,
 * así que hay que revalidar las tres rutas además del detalle.
 */
function refreshAfterWarning(postId: string) {
  revalidatePath('/');
  revalidatePath('/necesidades');
  revalidatePath('/ofertas');
  revalidatePath(`/aviso/${postId}`);
}

export async function addComment(
  _prev: CommentState,
  form: FormData,
): Promise<CommentState> {
  const postId = form.get('post_id');
  const kind = form.get('kind');
  const bodyRaw = form.get('body');
  const body = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';

  if (typeof postId !== 'string') return { error: 'Falta el aviso.' };
  if (typeof kind !== 'string' || !KIND_VALUES.includes(kind))
    return { error: 'Elige si es un comentario o una alerta.' };
  if (body.length < 10 || body.length > 1000)
    return { error: 'Escribe entre 10 y 1000 caracteres.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Entra con tu cuenta para escribir.' };

  const { error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, author_id: user.id, kind, body });

  if (error) {
    console.error('[comments] no se pudo guardar:', error.message);
    return { error: 'No se pudo publicar. Intenta de nuevo.' };
  }

  refreshAfterWarning(postId);
  return { error: null };
}

/** Evaluar un testimonio: de acuerdo o no. Volver a votar igual lo retira. */
export async function voteComment(formData: FormData) {
  const commentId = formData.get('comment_id');
  const postId = formData.get('post_id');
  const agreesRaw = formData.get('agrees');

  if (typeof commentId !== 'string' || typeof postId !== 'string') return;
  const agrees = agreesRaw === 'true';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('comment_votes')
    .select('agrees')
    .eq('comment_id', commentId)
    .eq('voter_id', user.id)
    .maybeSingle();

  if (existing && existing.agrees === agrees) {
    await supabase
      .from('comment_votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('voter_id', user.id);
  } else {
    await supabase
      .from('comment_votes')
      .upsert(
        { comment_id: commentId, voter_id: user.id, agrees },
        { onConflict: 'comment_id,voter_id' },
      );
  }

  revalidatePath(`/aviso/${postId}`);
}

export async function deleteOwnComment(formData: FormData) {
  const commentId = formData.get('comment_id');
  const postId = formData.get('post_id');
  if (typeof commentId !== 'string' || typeof postId !== 'string') return;

  const supabase = await createClient();
  // RLS limita el borrado a los comentarios propios.
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('[comments] no se pudo borrar:', error.message);
    return;
  }

  refreshAfterWarning(postId);
}
