/** Marca visible para datos que aún no han sido verificados contra su fuente. */
export function InsigniaRevision({ texto = 'Pendiente de revisión', titulo }: { texto?: string; titulo?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-aviso/60 px-2 py-0.5 text-xs font-medium text-aviso"
      title={titulo ?? 'Dato transcrito de la fuente citada; falta verificarlo.'}
    >
      <span aria-hidden>⚠</span> {texto}
    </span>
  );
}
