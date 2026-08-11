'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * La comprobación de administrador la hace RLS con `is_admin()`, no este
 * código: si alguien invocara estas acciones sin serlo, Postgres simplemente
 * no afecta ninguna fila.
 *
 * Estas son la válvula de último recurso. El camino normal es que la comunidad
 * marque el aviso en conflicto y cada quien decida; aquí solo se llega cuando
 * hay una estafa evidente o una acusación difamatoria.
 */

function refreshAll(postId?: string) {
  revalidatePath('/');
  revalidatePath('/necesidades');
  revalidatePath('/ofertas');
  revalidatePath('/admin');
  if (postId) revalidatePath(`/aviso/${postId}`);
}

/** Retira el aviso del tablero. No lo borra: queda el rastro para auditar. */
export async function removePost(formData: FormData) {
  const postId = formData.get('post_id');
  if (typeof postId !== 'string') return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({ status: 'removed' })
    .eq('id', postId);

  if (error) {
    console.error('[admin] no se pudo retirar el aviso:', error.message);
    return;
  }

  refreshAll(postId);
}

/** Devuelve al tablero un aviso retirado por error. */
export async function restorePost(formData: FormData) {
  const postId = formData.get('post_id');
  if (typeof postId !== 'string') return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({ status: 'open' })
    .eq('id', postId);

  if (error) {
    console.error('[admin] no se pudo restaurar el aviso:', error.message);
    return;
  }

  refreshAll(postId);
}

/**
 * Oculta una alerta difamatoria o falsa. Al ocultarla, el trigger recalcula
 * `warning_count` y el aviso deja de figurar en conflicto si era la única.
 */
export async function hideComment(formData: FormData) {
  const commentId = formData.get('comment_id');
  const postId = formData.get('post_id');
  if (typeof commentId !== 'string') return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('post_comments')
    .update({ hidden_at: new Date().toISOString(), hidden_by: user.id })
    .eq('id', commentId);

  if (error) {
    console.error('[admin] no se pudo ocultar el comentario:', error.message);
    return;
  }

  refreshAll(typeof postId === 'string' ? postId : undefined);
}

export async function unhideComment(formData: FormData) {
  const commentId = formData.get('comment_id');
  const postId = formData.get('post_id');
  if (typeof commentId !== 'string') return;

  const supabase = await createClient();
  const { error } = await supabase
    .from('post_comments')
    .update({ hidden_at: null, hidden_by: null })
    .eq('id', commentId);

  if (error) {
    console.error('[admin] no se pudo restaurar el comentario:', error.message);
    return;
  }

  refreshAll(typeof postId === 'string' ? postId : undefined);
}

/**
 * Bloquea una cuenta y retira sus avisos abiertos en la misma pasada: dejar
 * activo lo que publicó un estafador no tendría sentido.
 */
export async function banAuthor(formData: FormData) {
  const authorId = formData.get('author_id');
  if (typeof authorId !== 'string') return;

  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', authorId);

  if (error) {
    console.error('[admin] no se pudo bloquear la cuenta:', error.message);
    return;
  }

  await supabase
    .from('posts')
    .update({ status: 'removed' })
    .eq('author_id', authorId)
    .eq('status', 'open');

  refreshAll();
}
