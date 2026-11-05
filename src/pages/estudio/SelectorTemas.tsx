import { TEMAS, type Dificultad, type Seleccion, type Tema } from '@/study/generadores';

interface Props {
  seleccion: Seleccion[];
  alCambiar: (s: Seleccion[]) => void;
  conSubtemas?: boolean;
}

/** Casillas de temas (y subtemas) para quizzes, simulacros y hojas de trabajo. */
export function SelectorTemas({ seleccion, alCambiar, conSubtemas = false }: Props) {
  const activo = (t: Tema) => seleccion.find((s) => s.tema === t);
  const alternar = (t: Tema) => alCambiar(activo(t) ? seleccion.filter((s) => s.tema !== t) : [...seleccion, { tema: t }]);
  const alternarSub = (t: Tema, sub: string, todos: string[]) => {
    const s = activo(t);
    const actuales = s?.subtemas?.length ? s.subtemas : todos;
    const nuevos = actuales.includes(sub) ? actuales.filter((x) => x !== sub) : [...actuales, sub];
    alCambiar(nuevos.length ? seleccion.map((x) => (x.tema === t ? { tema: t, subtemas: nuevos } : x)) : seleccion.filter((x) => x.tema !== t));
  };
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Temas</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {TEMAS.map((t) => {
          const s = activo(t.id);
          const todos = t.subtemas.map((x) => x.id);
          return (
            <div key={t.id} className={`rounded-md border p-2 text-sm ${s ? 'border-acento' : 'border-borde'}`}>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" checked={!!s} onChange={() => alternar(t.id)} /> {t.nombre}
              </label>
              {conSubtemas && s && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-6 text-xs">
                  {t.subtemas.map((x) => (
                    <label key={x.id} className="flex items-center gap-1">
                      <input type="checkbox" checked={(s.subtemas?.length ? s.subtemas : todos).includes(x.id)} onChange={() => alternarSub(t.id, x.id, todos)} /> {x.nombre}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SelectorDificultad({ valor, alCambiar }: { valor: Dificultad; alCambiar: (d: Dificultad) => void }) {
  return (
    <fieldset className="text-sm">
      <legend className="mb-1 font-medium">Dificultad</legend>
      <div className="flex gap-1">
        {(
          [
            [1, 'Básica'],
            [2, 'Intermedia'],
            [3, 'Avanzada'],
          ] as const
        ).map(([d, t]) => (
          <button key={d} type="button" aria-pressed={valor === d} onClick={() => alCambiar(d)} className={`rounded-md border px-3 py-1 ${valor === d ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
            {t}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
