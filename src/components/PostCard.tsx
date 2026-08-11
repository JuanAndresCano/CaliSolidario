import Link from 'next/link';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/catalog';
import { describePlace } from '@/lib/place';
import { timeAgo } from '@/lib/time';
import { ConflictBadge } from './ConflictBadge';
import type { FeedPost } from '@/lib/types';

export function PostCard({ post }: { post: FeedPost }) {
  const isNeed = post.kind === 'need';

  return (
    <li className="rounded-2xl border border-line bg-surface">
      <Link
        href={`/aviso/${post.id}`}
        className="block px-4 py-3.5 active:opacity-70"
      >
        <div className="flex items-center gap-2">
          <span
            className={
              isNeed
                ? 'rounded-full bg-need-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-need'
                : 'rounded-full bg-offer-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-offer'
            }
          >
            {isNeed ? 'Necesita' : 'Ofrece'}
          </span>
          <span className="text-xs text-muted">
            {CATEGORY_EMOJIS[post.category]} {CATEGORY_LABELS[post.category]}
          </span>
          <span className="ml-auto text-xs text-muted" suppressHydrationWarning>
            {timeAgo(post.created_at)}
          </span>
        </div>

        {post.warning_count > 0 && (
          <div className="mt-2">
            <ConflictBadge count={post.warning_count} />
          </div>
        )}

        <h2 className="mt-2 text-base font-semibold leading-snug">
          {post.title}
        </h2>

        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">
          {post.description}
        </p>

        <p className="mt-2 text-xs text-muted">
          📍 {describePlace(post.address, post.barrio, post.comuna)}
          {post.quantity_text ? ` · ${post.quantity_text}` : ''}
        </p>
      </Link>
    </li>
  );
}
