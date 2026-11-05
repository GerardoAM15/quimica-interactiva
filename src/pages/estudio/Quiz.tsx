import { useState } from 'react';
import { generarPreguntas, TEMAS, type Dificultad, type Pregunta, type Seleccion } from '@/study/generadores';
import { semillaNueva } from '@/study/azar';
import { useProgreso } from '@/store/progreso';
import { SelectorDificultad, SelectorTemas } from './SelectorTemas';
import { boton, botonPrincipal, VistaPregunta } from './VistaPregunta';

/** Quiz de práctica: respuesta inmediata y solución de cada pregunta. */
export default function Quiz() {
  const [seleccion, setSeleccion] = useState<Seleccion[]>([{ tema: 'nomenclatura-inorganica' }, { tema: 'balanceo' }]);
  const [dificultad, setDificultad] = useState<Dificultad>(1);
  const [n, setN] = useState(10);
  const [preguntas, setPreguntas] = useState<Pregunta[] | null>(null);
  const [k, setK] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const registrar = useProgreso((s) => s.registrarRespuesta);

  const empezar = () => {
    setPreguntas(generarPreguntas(semillaNueva(), seleccion, n, dificultad));
    setK(0);
    setElegida(null);
    setAciertos(0);
  };

  if (!preguntas) {
    return (
      <div className="space-y-4">
        <SelectorTemas seleccion={seleccion} alCambiar={setSeleccion} />
        <div className="flex flex-wrap items-end gap-6">
          <SelectorDificultad valor={dificultad} alCambiar={setDificultad} />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Preguntas</span>
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
              {[5, 10, 15, 20].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button type="button" className={botonPrincipal} disabled={!seleccion.length} onClick={empezar}>
            Empezar
          </button>
        </div>
      </div>
    );
  }

  if (k >= preguntas.length) {
    return (
      <div className="space-y-3 rounded-lg border border-borde bg-superficie p-5">
        <h2 className="text-xl font-semibold">Resultado</h2>
        <p className="text-3xl font-bold tabular-nums">
          {aciertos} / {preguntas.length}
        </p>
        <div className="flex gap-2">
          <button type="button" className={botonPrincipal} onClick={empezar}>
            Otro quiz con los mismos temas
          </button>
          <button type="button" className={boton} onClick={() => setPreguntas(null)}>
            Cambiar temas
          </button>
        </div>
      </div>
    );
  }

  const q = preguntas[k]!;
  const revisada = elegida !== null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-texto-suave">
        <span>
          Pregunta {k + 1} de {preguntas.length} · {TEMAS.find((t) => t.id === q.tema)?.nombre}
        </span>
        <span className="tabular-nums">Aciertos: {aciertos}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-superficie-2" aria-hidden>
        <div className="h-full bg-acento" style={{ width: `${(100 * k) / preguntas.length}%` }} />
      </div>
      <div className="rounded-lg border border-borde bg-superficie p-4">
        <VistaPregunta
          pregunta={q}
          elegida={elegida}
          revisada={revisada}
          alElegir={(i) => {
            setElegida(i);
            const ok = i === q.correcta;
            if (ok) setAciertos((a) => a + 1);
            registrar(q.tema, ok);
          }}
        />
      </div>
      {revisada && (
        <button
          type="button"
          className={botonPrincipal}
          onClick={() => {
            setK((x) => x + 1);
            setElegida(null);
          }}
        >
          {k + 1 < preguntas.length ? 'Siguiente' : 'Ver resultado'}
        </button>
      )}
    </div>
  );
}
