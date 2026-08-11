'use client';

import { useState } from 'react';
import { markFulfilled } from '@/app/publicar/actions';

/**
 * Cerrar un aviso pide confirmación explícita, y el botón es secundario a
 * propósito. En producción dos personas cerraron su aviso a los 3 y 6 minutos
 * de publicarlo: aterrizaban en esta pantalla y presionaban el botón verde
 * grande creyendo que confirmaba la publicación.
 */
export function ResolveButton({
  postId,
  kind,
}: {
  postId: string;
  kind: 'need' | 'offer';
}) {
  const [confirming, setConfirming] = useState(false);

  const label = kind === 'need' ? 'Ya lo conseguí' : 'Ya lo entregué';

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex-1 rounded-xl border border-line bg-surface px-3 text-sm text-muted"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl bg-need-bg px-3 py-2.5">
      <p className="text-sm font-semibold text-need">
        {kind === 'need'
          ? '¿Ya recibiste esta ayuda?'
          : '¿Ya entregaste lo que ofrecías?'}
      </p>
      <p className="mt-0.5 text-xs text-need">
        Tu aviso dejará de aparecer en el tablero. Podrás volver a publicarlo si
        te equivocas.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-xl border border-line bg-surface px-3 text-sm"
        >
          No, todavía no
        </button>
        <form action={markFulfilled} className="flex-1">
          <input type="hidden" name="post_id" value={postId} />
          <button
            type="submit"
            className="w-full rounded-xl bg-need px-3 text-sm font-semibold text-white"
          >
            Sí, cerrar
          </button>
        </form>
      </div>
    </div>
  );
}
