import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { IconoCerrar } from './Iconos';

interface Props {
  titulo?: string;
  children: ReactNode;
}

/** Botón «Teoría» que abre un panel lateral con la explicación y las fórmulas del módulo. */
export function Teoria({ titulo = 'Teoría', children }: Props) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const boton = useRef<HTMLButtonElement>(null);

  const cerrar = () => {
    setAbierto(false);
    boton.current?.focus();
  };

  useEffect(() => {
    if (!abierto) return;
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [abierto]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-md border border-borde bg-superficie px-3 py-1.5 text-sm font-medium hover:bg-superficie-2"
      >
        Teoría
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={id}>
          <div className="absolute inset-0 bg-black/60" onClick={cerrar} aria-hidden />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-borde bg-superficie shadow-2xl">
            <div className="flex items-center justify-between border-b border-borde px-5 py-3">
              <h2 id={id} className="text-lg font-semibold">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                className="rounded-md p-2 hover:bg-superficie-2"
                aria-label="Cerrar teoría"
                autoFocus
              >
                <IconoCerrar />
              </button>
            </div>
            <div className="teoria flex-1 overflow-y-auto px-5 py-4 text-[0.95rem] leading-relaxed">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
