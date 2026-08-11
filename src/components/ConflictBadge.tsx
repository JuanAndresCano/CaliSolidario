/**
 * La marca de conflicto es pública a propósito: quien vea el aviso tiene que
 * saber que hay alertas aunque no tenga cuenta. Lo que exige sesión es leer
 * de qué se acusa y quién lo dice.
 */
export function ConflictBadge({
  count,
  size = 'small',
}: {
  count: number;
  size?: 'small' | 'large';
}) {
  if (count < 1) return null;

  const text =
    count === 1 ? '1 alerta de la comunidad' : `${count} alertas de la comunidad`;

  if (size === 'small') {
    return (
      <span className="rounded-full bg-need-bg px-2.5 py-1 text-xs font-bold text-need">
        ⚠ En conflicto
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-need-bg px-3 py-2.5">
      <p className="text-sm font-bold text-need">⚠ Aviso en conflicto</p>
      <p className="mt-0.5 text-sm text-need">
        {text}. Procede con cuidado y lee lo que cuentan antes de coordinar
        nada.
      </p>
    </div>
  );
}
