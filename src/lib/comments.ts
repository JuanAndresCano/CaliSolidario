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
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, profiles(display_name)')
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
