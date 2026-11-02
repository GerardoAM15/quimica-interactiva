import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface Pestana<K extends string> {
  id: K;
  titulo: ReactNode;
}

interface Props<K extends string> {
  pestanas: readonly Pestana<K>[];
  activa: K;
  alCambiar: (id: K) => void;
  etiqueta: string;
  children: ReactNode;
}

/** Pestañas accesibles (patrón WAI-ARIA: flechas ← → para moverse, Inicio/Fin). */
export function Pestanas<K extends string>({ pestanas, activa, alCambiar, etiqueta, children }: Props<K>) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const teclado = (e: KeyboardEvent, i: number) => {
    let j = i;
    if (e.key === 'ArrowRight') j = (i + 1) % pestanas.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + pestanas.length) % pestanas.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = pestanas.length - 1;
    else return;
    e.preventDefault();
    alCambiar(pestanas[j]!.id);
    refs.current[j]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={etiqueta} className="flex gap-1 overflow-x-auto border-b border-borde">
        {pestanas.map((p, i) => {
          const sel = p.id === activa;
          return (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-t-${p.id}`}
              aria-selected={sel}
              aria-controls={`${base}-p-${p.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => alCambiar(p.id)}
              onKeyDown={(e) => teclado(e, i)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm whitespace-nowrap ${
                sel ? 'border-acento font-semibold text-texto' : 'border-transparent text-texto-suave hover:text-texto'
              }`}
            >
              {p.titulo}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${base}-p-${activa}`} aria-labelledby={`${base}-t-${activa}`} className="pt-4">
        {children}
      </div>
    </div>
  );
}
