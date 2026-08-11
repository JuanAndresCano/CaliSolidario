import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deletePost, reopenPost } from '@/app/publicar/actions';
import { ResolveButton } from '@/components/ResolveButton';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/catalog';
import { describePlace } from '@/lib/place';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import type { Post } from '@/lib/types';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: 'Mis avisos',
};

const STATUS_LABELS: Record<Post['status'], string> = {
  open: 'Activo',
  fulfilled: 'Resuelto',
  expired: 'Vencido',
  removed: 'Retirado',
};

export default async function MyPostsPage({
  searchParams,
}: PageProps<'/mis-avisos'>) {
  const { publicado } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/mis-avisos');

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const posts = (data ?? []) as Post[];
  const openCount = posts.filter((p) => p.status === 'open').length;

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Mis avisos</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-muted underline underline-offset-4"
          >
            Salir
          </button>
        </form>
      </div>

      {publicado && (
        <div className="mt-3 rounded-xl bg-offer-bg px-3 py-3">
          <p className="text-sm font-bold text-offer">
            ✓ Listo, tu aviso ya está en el tablero
          </p>
          <p className="mt-0.5 text-sm text-offer">
            No tienes que hacer nada más. La gente te va a contactar por el
            medio que dejaste.
          </p>
          <Link
            href="/"
            className="mt-2 inline-block text-sm font-semibold text-offer underline underline-offset-4"
          >
            Ver el tablero
          </Link>
        </div>
      )}

      <p className="mt-2 text-sm text-muted">
        {openCount} de 3 avisos activos. Cierra uno solo cuando ya hayas
        recibido o entregado la ayuda.
      </p>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center">
          <p className="text-sm text-muted">Todavía no has publicado nada.</p>
          <Link
            href="/publicar"
            role="button"
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-ink"
          >
            Publicar mi primer aviso
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-line bg-surface px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">
                  {post.kind === 'need' ? 'Necesita' : 'Ofrece'} ·{' '}
                  {STATUS_LABELS[post.status]}
                </span>
                <span
                  className="ml-auto text-xs text-muted"
                  suppressHydrationWarning
                >
                  {timeAgo(post.created_at)}
                </span>
              </div>

              <Link href={`/aviso/${post.id}`} className="mt-1.5 block">
                <h2 className="text-base font-semibold leading-snug">
                  {post.title}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {CATEGORY_EMOJIS[post.category]}{' '}
                  {CATEGORY_LABELS[post.category]} ·{' '}
                  {describePlace(post.address, post.barrio, post.comuna)}
                </p>
              </Link>

              {post.status === 'fulfilled' && (
                <p className="mt-2 rounded-xl bg-need-bg px-3 py-2 text-xs text-need">
                  Este aviso ya no aparece en el tablero.
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {post.status === 'open' && (
                  <ResolveButton postId={post.id} kind={post.kind} />
                )}

                {post.status === 'fulfilled' && (
                  <form action={reopenPost} className="flex-1">
                    <input type="hidden" name="post_id" value={post.id} />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink"
                    >
                      Volver a publicarlo
                    </button>
                  </form>
                )}

                <form action={deletePost} className="flex-1">
                  <input type="hidden" name="post_id" value={post.id} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-line px-3 text-sm text-muted"
                  >
                    Borrar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
