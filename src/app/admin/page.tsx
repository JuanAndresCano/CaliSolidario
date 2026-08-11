import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import type { Post, PostComment } from '@/lib/types';
import {
  banAuthor,
  hideComment,
  removePost,
  restorePost,
  unhideComment,
} from './actions';

export const metadata: Metadata = {
  title: 'Moderación',
  robots: { index: false, follow: false },
};

type CommentRow = PostComment & {
  profiles: { display_name: string } | null;
  posts: Pick<Post, 'id' | 'title' | 'status' | 'author_id'> | null;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  // 404 y no 403: quien no es moderador no tiene por qué saber que esto existe.
  if (!profile?.is_admin) notFound();

  const { data } = await supabase
    .from('post_comments')
    .select('*, profiles(display_name), posts(id, title, status, author_id)')
    .eq('kind', 'warning')
    .order('created_at', { ascending: false })
    .limit(100);

  const warnings = (data ?? []) as CommentRow[];
  const active = warnings.filter((w) => w.hidden_at === null);
  const hidden = warnings.filter((w) => w.hidden_at !== null);

  return (
    <div className="py-2">
      <h1 className="text-xl font-bold tracking-tight">Moderación</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Las alertas no tumban avisos: los marcan en conflicto y la gente decide.
        Retira un aviso solo ante una estafa evidente, y oculta una alerta solo
        si es falsa o difamatoria.
      </p>

      <h2 className="mt-6 text-base font-bold">
        Alertas vigentes ({active.length})
      </h2>

      {active.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          Ningún aviso está en conflicto ahora mismo.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {active.map((w) => (
            <WarningCard key={w.id} warning={w} />
          ))}
        </ul>
      )}

      {hidden.length > 0 && (
        <>
          <h2 className="mt-8 text-base font-bold">
            Alertas ocultas ({hidden.length})
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {hidden.map((w) => (
              <li
                key={w.id}
                className="rounded-2xl border border-line bg-surface px-4 py-3 opacity-70"
              >
                <p className="text-xs text-muted">
                  {w.profiles?.display_name ?? 'Alguien'} sobre{' '}
                  <Link
                    href={`/aviso/${w.post_id}`}
                    className="underline underline-offset-4"
                  >
                    {w.posts?.title ?? 'aviso borrado'}
                  </Link>
                </p>
                <p className="mt-1 text-sm">{w.body}</p>
                <form action={unhideComment} className="mt-2">
                  <input type="hidden" name="comment_id" value={w.id} />
                  <input type="hidden" name="post_id" value={w.post_id} />
                  <button
                    type="submit"
                    className="min-h-0 text-xs text-muted underline underline-offset-4"
                  >
                    Volver a mostrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function WarningCard({ warning }: { warning: CommentRow }) {
  const post = warning.posts;
  const isRemoved = post?.status === 'removed';

  return (
    <li className="rounded-2xl border border-need bg-need-bg px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-need">
          ⚠ Alerta
        </span>
        <span className="ml-auto text-xs text-muted" suppressHydrationWarning>
          {timeAgo(warning.created_at)}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted">
        {warning.profiles?.display_name ?? 'Alguien'} sobre{' '}
        <Link
          href={`/aviso/${warning.post_id}`}
          className="font-semibold underline underline-offset-4"
        >
          {post?.title ?? 'aviso borrado'}
        </Link>
        {isRemoved && ' · ya retirado'}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
        {warning.body}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <form action={hideComment}>
          <input type="hidden" name="comment_id" value={warning.id} />
          <input type="hidden" name="post_id" value={warning.post_id} />
          <button
            type="submit"
            className="rounded-xl border border-line bg-surface px-3 text-sm"
          >
            Ocultar alerta
          </button>
        </form>

        {post && !isRemoved && (
          <form action={removePost}>
            <input type="hidden" name="post_id" value={post.id} />
            <button
              type="submit"
              className="rounded-xl bg-need px-3 text-sm font-semibold text-white"
            >
              Retirar aviso
            </button>
          </form>
        )}

        {post && isRemoved && (
          <form action={restorePost}>
            <input type="hidden" name="post_id" value={post.id} />
            <button
              type="submit"
              className="rounded-xl border border-line bg-surface px-3 text-sm"
            >
              Restaurar aviso
            </button>
          </form>
        )}

        {post && (
          <form action={banAuthor}>
            <input type="hidden" name="author_id" value={post.author_id} />
            <button
              type="submit"
              className="rounded-xl border border-need px-3 text-sm text-need"
            >
              Bloquear cuenta
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
