import Link from 'next/link';
import { deleteOwnComment, voteComment } from '@/app/aviso/[id]/actions';
import { timeAgo } from '@/lib/time';
import type { CommentWithMeta } from '@/lib/types';
import { CommentForm } from './CommentForm';

export function CommentSection({
  postId,
  comments,
  canWrite,
}: {
  postId: string;
  comments: CommentWithMeta[];
  canWrite: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold tracking-tight">
        Lo que dice la comunidad
      </h2>

      {!canWrite ? (
        <div className="mt-3 rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-sm leading-relaxed text-muted">
            Los comentarios y las alertas solo se leen con sesión iniciada. Lo
            mantenemos así para que una acusación con nombre propio no quede
            expuesta a todo internet.
          </p>
          <Link
            href={`/login?next=/aviso/${postId}`}
            role="button"
            className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-ink"
          >
            Entrar para leer y escribir
          </Link>
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Todavía nadie ha comentado este aviso.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} postId={postId} />
              ))}
            </ul>
          )}

          <CommentForm postId={postId} />
        </>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  postId,
}: {
  comment: CommentWithMeta;
  postId: string;
}) {
  const isWarning = comment.kind === 'warning';

  return (
    <li
      className={
        isWarning
          ? 'rounded-2xl border border-need bg-need-bg px-4 py-3'
          : 'rounded-2xl border border-line bg-surface px-4 py-3'
      }
    >
      <div className="flex items-center gap-2">
        {isWarning && (
          <span className="text-xs font-bold uppercase tracking-wide text-need">
            ⚠ Alerta
          </span>
        )}
        <span className="text-xs font-semibold">{comment.author_name}</span>
        <span className="ml-auto text-xs text-muted" suppressHydrationWarning>
          {timeAgo(comment.created_at)}
        </span>
      </div>

      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
        {comment.body}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <VoteButton
          commentId={comment.id}
          postId={postId}
          agrees
          count={comment.agree_count}
          active={comment.my_vote === true}
          label="Me consta"
        />
        <VoteButton
          commentId={comment.id}
          postId={postId}
          agrees={false}
          count={comment.disagree_count}
          active={comment.my_vote === false}
          label="No es así"
        />

        {comment.is_mine && (
          <form action={deleteOwnComment} className="ml-auto">
            <input type="hidden" name="comment_id" value={comment.id} />
            <input type="hidden" name="post_id" value={postId} />
            <button
              type="submit"
              className="min-h-0 text-xs text-muted underline underline-offset-4"
            >
              Borrar
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

function VoteButton({
  commentId,
  postId,
  agrees,
  count,
  active,
  label,
}: {
  commentId: string;
  postId: string;
  agrees: boolean;
  count: number;
  active: boolean;
  label: string;
}) {
  return (
    <form action={voteComment}>
      <input type="hidden" name="comment_id" value={commentId} />
      <input type="hidden" name="post_id" value={postId} />
      <input type="hidden" name="agrees" value={String(agrees)} />
      <button
        type="submit"
        aria-pressed={active}
        className={
          active
            ? 'min-h-9 rounded-full bg-foreground px-3 text-xs font-semibold text-background'
            : 'min-h-9 rounded-full border border-line bg-surface px-3 text-xs'
        }
      >
        {label} {count > 0 ? count : ''}
      </button>
    </form>
  );
}
