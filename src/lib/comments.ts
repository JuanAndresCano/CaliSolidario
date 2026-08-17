import type { SupabaseClient } from '@supabase/supabase-js';
import type { CommentWithMeta, PostComment } from './types';

type CommentRow = PostComment & {
  profiles: { display_name: string } | null;
};

/**
 * Comentarios de un aviso con el nombre de quien escribe y el saldo de
 * evaluaciones. Solo devuelve algo con sesión iniciada: RLS esconde la tabla
 * a los anónimos, que únicamente ven el contador de alertas del aviso.
 */
export async function getComments(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
): Promise<CommentWithMeta[]> {
  /*
   * La llave foránea va NOMBRADA a propósito.
   *
   * `post_comments` apunta a `profiles` dos veces —`author_id` y `hidden_by`—
   * así que `profiles(display_name)` a secas es ambiguo: PostgREST responde
   * 300 con PGRST201 y la consulta falla ENTERA. Como el error se registraba y
   * se devolvía una lista vacía, la pantalla decía "todavía no hay
   * comentarios" y el fallo pasó desapercibido desde que se lanzó la función.
   *
   * Si algún día se agrega otra columna que referencie a `profiles`, esto
   * sigue funcionando precisamente por estar nombrado.
   */
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, profiles!post_comments_author_id_fkey(display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[comments] no se pudieron cargar:', error.message);
    return [];
  }

  const rows = (data ?? []) as CommentRow[];
  if (rows.length === 0) return [];

  const { data: voteRows } = await supabase
    .from('comment_votes')
    .select('comment_id, voter_id, agrees')
    .in(
      'comment_id',
      rows.map((r) => r.id),
    );

  const votes = voteRows ?? [];

  return rows.map((row) => {
    const own = votes.filter((v) => v.comment_id === row.id);
    return {
      ...row,
      author_name: row.profiles?.display_name ?? 'Alguien',
      agree_count: own.filter((v) => v.agrees).length,
      disagree_count: own.filter((v) => !v.agrees).length,
      my_vote: own.find((v) => v.voter_id === userId)?.agrees ?? null,
      is_mine: row.author_id === userId,
    };
  });
}
