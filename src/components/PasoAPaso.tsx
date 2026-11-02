import { useState, type ReactNode } from 'react';
import { Formula } from './Formula';

export interface Paso {
  titulo: string;
  /** Texto explicativo (puede incluir JSX). */
  detalle?: ReactNode;
  /** Expresión LaTeX del paso. */
  tex?: string;
}

interface Props {
  pasos: Paso[];
  /** Abierto desde el inicio. */
  abierto?: boolean;
  etiqueta?: string;
}

/** Botón «Ver paso a paso» con la lista numerada de pasos del cálculo. */
export function PasoAPaso({ pasos, abierto = false, etiqueta = 'Ver paso a paso' }: Props) {
  const [visible, setVisible] = useState(abierto);
  if (pasos.length === 0) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-expanded={visible}
        className="text-sm font-medium text-acento underline-offset-2 hover:underline"
      >
        {visible ? 'Ocultar paso a paso' : etiqueta}
      </button>
      {visible && (
        <ol className="mt-3 space-y-3 border-l-2 border-acento/40 pl-4">
          {pasos.map((p, i) => (
            <li key={i}>
              <p className="text-sm font-semibold">
                <span className="mr-1.5 text-texto-suave tabular-nums">{i + 1}.</span>
                {p.titulo}
              </p>
              {p.detalle && <div className="mt-1 text-sm text-texto-suave">{p.detalle}</div>}
              {p.tex && <Formula tex={p.tex} bloque />}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
