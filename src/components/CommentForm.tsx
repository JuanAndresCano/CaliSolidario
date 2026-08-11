'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addComment, type CommentState } from '@/app/aviso/[id]/actions';
import { COMMENT_KINDS } from '@/lib/catalog';

const INITIAL: CommentState = { error: null };

export function CommentForm({ postId }: { postId: string }) {
  const [state, action] = useActionState(addComment, INITIAL);
  const [kind, setKind] = useState<string>('comment');

  const active = COMMENT_KINDS.find((k) => k.value === kind);
  const isWarning = kind === 'warning';

  return (
    <form action={action} className="mt-4" key={state.error ? 'err' : 'ok'}>
      <input type="hidden" name="post_id" value={postId} />

      <div className="grid grid-cols-2 gap-2">
        {COMMENT_KINDS.map((k) => (
          <label
            key={k.value}
            className={
              kind === k.value
                ? k.value === 'warning'
                  ? 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-need px-3 text-sm font-semibold text-white'
                  : 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink'
                : 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-3 text-sm'
            }
          >
            <input
              type="radio"
              name="kind"
              value={k.value}
              checked={kind === k.value}
              onChange={() => setKind(k.value)}
              className="sr-only"
            />
            {k.label}
          </label>
        ))}
      </div>

      <p className="mt-1.5 text-xs text-muted">{active?.hint}</p>

      <textarea
        name="body"
        rows={3}
        required
        minLength={10}
        maxLength={1000}
        placeholder={
          isWarning
            ? 'Cuenta qué pasó, con hechos concretos: cuándo, dónde y qué ocurrió.'
            : 'Escribe tu aporte'
        }
        className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />

      {isWarning && (
        <p className="mt-1.5 rounded-xl bg-need-bg px-3 py-2 text-xs leading-relaxed text-need">
          Esto marca el aviso en conflicto para todo el mundo. Cuenta lo que te
          consta de primera mano: una acusación falsa perjudica a alguien que
          quizá esté ayudando de verdad, y tu nombre queda junto a lo que
          escribas.
        </p>
      )}

      {state.error && (
        <p role="alert" className="mt-2 text-sm text-need">
          {state.error}
        </p>
      )}

      <SubmitComment isWarning={isWarning} />
    </form>
  );
}

function SubmitComment({ isWarning }: { isWarning: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        isWarning
          ? 'mt-2 w-full rounded-xl bg-need px-4 text-sm font-bold text-white disabled:opacity-60'
          : 'mt-2 w-full rounded-xl bg-brand px-4 text-sm font-bold text-brand-ink disabled:opacity-60'
      }
    >
      {pending ? 'Publicando…' : isWarning ? 'Publicar alerta' : 'Comentar'}
    </button>
  );
}
