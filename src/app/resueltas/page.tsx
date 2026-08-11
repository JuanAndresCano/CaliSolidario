import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/catalog';
import { getResolved } from '@/lib/feed';
import { describePlace } from '@/lib/place';
import { timeAgo } from '@/lib/time';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Ayudas concretadas',
  description:
    'Necesidades que ya se resolvieron y ofertas que ya se entregaron gracias a CaliSolidario.',
};

export default async function ResolvedPage() {
  const posts = await getResolved();

  return (
    <div className="py-2">
      <h1 className="text-xl font-bold tracking-tight">Ya se concretaron</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Cada uno de estos avisos lo cerró la persona que lo publicó, porque ya
        recibió o entregó la ayuda.
      </p>

      {posts.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          Todavía no hay ayudas cerradas. Cuando alguien marque su aviso como
          resuelto, aparece aquí.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-line bg-surface px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-offer-bg px-2.5 py-1 text-xs font-bold text-offer">
                  ✓ {post.kind === 'need' ? 'Recibió ayuda' : 'Entregó'}
                </span>
                <span
                  className="ml-auto text-xs text-muted"
                  suppressHydrationWarning
                >
                  {post.fulfilled_at ? timeAgo(post.fulfilled_at) : null}
                </span>
              </div>

              <h2 className="mt-2 text-base font-semibold leading-snug">
                {post.title}
              </h2>

              <p className="mt-1 text-xs text-muted">
                {CATEGORY_EMOJIS[post.category]}{' '}
                {CATEGORY_LABELS[post.category]} ·{' '}
                {describePlace(post.address, post.barrio, post.comuna)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/"
        className="mt-6 inline-flex items-center text-sm text-muted underline underline-offset-4"
      >
        Volver al tablero
      </Link>
    </div>
  );
}
