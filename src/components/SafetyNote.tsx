export function SafetyNote() {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
      <p className="font-semibold text-foreground">Antes de coordinar una entrega</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4">
        <li>Nadie en este tablero debe pedirte dinero, datos bancarios ni claves.</li>
        <li>Acuerda puntos de encuentro visibles y, si puedes, ve acompañado.</li>
        <li>
          CaliSolidario no verifica los avisos ni a quienes los publican: es un
          tablero abierto, la coordinación va por tu cuenta.
        </li>
      </ul>
    </div>
  );
}
