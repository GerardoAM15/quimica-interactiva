interface Props {
  texto?: string;
}

/** Indicador de carga para módulos diferidos (Suspense). */
export function Cargando({ texto = 'Cargando…' }: Props) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-16 text-texto-suave">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-borde border-t-acento" aria-hidden />
      <span>{texto}</span>
    </div>
  );
}
