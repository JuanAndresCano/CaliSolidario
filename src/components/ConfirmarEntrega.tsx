'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { markFulfilled } from '@/app/publicar/actions';

/**
 * Cerrar un aviso ajeno, para quien tiene el permiso de confirmar entregas en
 * este municipio (migración 0023).
 *
 * Va con confirmación en dos pasos a propósito. Cuando el botón de resolver
 * era de un solo toque, dos personas cerraron su propio aviso por error a los
 * 3 y a los 6 minutos de publicarlo. Aquí el riesgo es mayor: se está cerrando
 * la necesidad de OTRO, que puede no enterarse hasta que nadie le llegue.
 */
export function ConfirmarEntrega({
  postId,
  esNecesidad,
}: {
  postId: string;
  esNecesidad: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-line px-4 py-3.5">
        <p className="text-sm font-semibold">
          ¿Te consta que esto ya se resolvió?
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Puedes cerrarlo aunque no sea tuyo. Hazlo solo si lo viste: quien lo
          publicó puede volver a abrirlo, y tu nombre queda registrado.
        </p>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="mt-3 w-full rounded-xl border border-line px-4 text-sm font-semibold"
        >
          {esNecesidad ? 'Ya recibió la ayuda' : 'Ya se entregó'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-brand bg-surface px-4 py-3.5">
      <p className="text-sm font-semibold">
        Se va a cerrar un aviso que no es tuyo
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Desaparece del tablero. Si te equivocaste, quien lo publicó puede
        reabrirlo desde sus avisos.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="flex-1 rounded-xl border border-line px-3 text-sm font-semibold"
        >
          Cancelar
        </button>
        <form action={markFulfilled} className="flex-1">
          <input type="hidden" name="post_id" value={postId} />
          <Guardar />
        </form>
      </div>
    </div>
  );
}

function Guardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand px-3 text-sm font-bold text-brand-ink disabled:opacity-60"
    >
      {pending ? 'Cerrando…' : 'Sí, me consta'}
    </button>
  );
}
