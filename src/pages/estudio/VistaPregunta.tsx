import { LETRAS, type Pregunta } from '@/study/generadores';
import { Formula } from '@/components/Formula';
import { PasoAPaso } from '@/components/PasoAPaso';

interface Props {
  pregunta: Pregunta;
  numero?: number;
  elegida: number | null;
  alElegir?: (i: number) => void;
  /** Muestra la corrección y la solución. */
  revisada: boolean;
}

/** Pregunta de opción múltiple (A–E) con corrección y solución paso a paso. */
export function VistaPregunta({ pregunta: q, numero, elegida, alElegir, revisada }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-base">
        {numero !== undefined && <span className="mr-2 font-semibold tabular-nums">{numero}.</span>}
        {q.enunciado}
      </p>
      {q.tex && <Formula tex={q.tex} bloque />}
      <ol className="space-y-2" role="radiogroup" aria-label="Alternativas">
        {q.opciones.map((o, i) => {
          const esCorrecta = i === q.correcta;
          const marcada = elegida === i;
          const estilo = revisada
            ? esCorrecta
              ? 'border-exito bg-exito/10'
              : marcada
                ? 'border-error bg-error/10'
                : 'border-borde'
            : marcada
              ? 'border-acento bg-acento/10'
              : 'border-borde hover:bg-superficie-2';
          return (
            <li key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={marcada}
                disabled={revisada || !alElegir}
                onClick={() => alElegir?.(i)}
                className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left ${estilo}`}
              >
                <span className="font-semibold">{LETRAS[i]})</span>
                <span>{o}</span>
                {revisada && esCorrecta && <span className="ml-auto text-exito">✓</span>}
                {revisada && marcada && !esCorrecta && <span className="ml-auto text-error">✗</span>}
              </button>
            </li>
          );
        })}
      </ol>
      {revisada && (
        <div aria-live="polite">
          <p className={elegida === q.correcta ? 'font-semibold text-exito' : 'font-semibold text-error'}>
            {elegida === null ? `Sin responder. Respuesta: ${LETRAS[q.correcta]})` : elegida === q.correcta ? '¡Correcto!' : `Incorrecto. Respuesta: ${LETRAS[q.correcta]}) ${q.opciones[q.correcta]}`}
          </p>
          <PasoAPaso pasos={q.solucion} etiqueta="Ver solución paso a paso" />
        </div>
      )}
    </div>
  );
}

export const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
export const boton = 'rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2 disabled:opacity-50';
export const botonPrincipal = 'rounded-md bg-acento px-4 py-2 text-sm font-semibold text-acento-texto disabled:opacity-50';
