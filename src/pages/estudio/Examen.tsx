import { useEffect, useRef, useState } from 'react';
import { armarExamen, calificar, CONFIGS, type Calificacion, type Examen as TipoExamen } from '@/study/examen';
import { TEMAS } from '@/study/generadores';
import { semillaNueva } from '@/study/azar';
import { useProgreso } from '@/store/progreso';
import { boton, botonPrincipal, VistaPregunta } from './VistaPregunta';

const reloj = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Simulacro de admisión: opción múltiple A–E, cronometrado, con revisión y solución paso a paso. */
export default function Examen() {
  const [ex, setEx] = useState<TipoExamen | null>(null);
  const [resp, setResp] = useState<(number | null)[]>([]);
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [k, setK] = useState(0);
  const [restante, setRestante] = useState(0);
  const [resultado, setResultado] = useState<Calificacion | null>(null);
  const registrarExamen = useProgreso((s) => s.registrarExamen);
  const respRef = useRef(resp);
  respRef.current = resp;

  const entregar = () => {
    if (!ex) return;
    const r = calificar(ex, respRef.current);
    setResultado(r);
    setK(0);
    registrarExamen({ fecha: Date.now(), config: ex.config.id, semilla: ex.semilla, nota: r.nota, correctas: r.correctas, total: ex.preguntas.length }, r.porTema);
  };

  // Cronómetro: al llegar a cero se entrega automáticamente
  useEffect(() => {
    if (!ex || resultado) return;
    const t = setInterval(() => setRestante((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [ex, resultado]);
  useEffect(() => {
    if (ex && !resultado && restante <= 0) entregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante]);

  if (!ex) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-texto-suave">Simulacros con preguntas originales generadas por la aplicación (no son preguntas de exámenes reales). Nota en escala vigesimal (0–20).</p>
        <div className="grid gap-3 md:grid-cols-3">
          {CONFIGS.map((c) => (
            <div key={c.id} className="rounded-lg border border-borde bg-superficie p-4 text-sm">
              <h3 className="text-base font-semibold">{c.nombre}</h3>
              <p className="mt-1 text-texto-suave">{c.descripcion}</p>
              <button
                type="button"
                className={`${botonPrincipal} mt-3`}
                onClick={() => {
                  const e = armarExamen(semillaNueva(), c.id);
                  setEx(e);
                  setResp(e.preguntas.map(() => null));
                  setMarcadas(new Set());
                  setK(0);
                  setRestante(c.minutos * 60);
                  setResultado(null);
                }}
              >
                Empezar
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = ex.preguntas[k]!;
  const respondidas = resp.filter((r) => r !== null).length;
  return (
    <div className="space-y-4">
      {resultado ? (
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <div className="flex flex-wrap items-baseline gap-6">
            <p className="text-4xl font-bold tabular-nums">{resultado.nota.toFixed(1)}</p>
            <p className="text-sm tabular-nums">
              {resultado.correctas} correctas · {resultado.incorrectas} incorrectas · {resultado.enBlanco} en blanco
            </p>
            <button type="button" className={boton} onClick={() => setEx(null)}>
              Nuevo simulacro
            </button>
          </div>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {Object.entries(resultado.porTema).map(([t, v]) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-48 truncate">{TEMAS.find((x) => x.id === t)?.nombre}</span>
                <span className="h-2 flex-1 overflow-hidden rounded bg-superficie-2">
                  <span className="block h-full bg-acento" style={{ width: `${(100 * v!.correctas) / v!.total}%` }} />
                </span>
                <span className="tabular-nums">
                  {v!.correctas}/{v!.total}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-texto-suave">Semilla del simulacro: {ex.semilla}. Revisa cada pregunta con su solución abajo.</p>
        </div>
      ) : (
        <div className="sticky top-14 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-borde bg-superficie p-3 text-sm">
          <span className="font-semibold">{ex.config.nombre}</span>
          <span className={`text-lg font-bold tabular-nums ${restante < 60 ? 'text-error' : ''}`} aria-live="off" role="timer">
            ⏱ {reloj(Math.max(0, restante))}
          </span>
          <span className="tabular-nums">
            Respondidas: {respondidas}/{ex.preguntas.length}
          </span>
          <button
            type="button"
            className={botonPrincipal}
            onClick={() => {
              if (respondidas === ex.preguntas.length || window.confirm(`Quedan ${ex.preguntas.length - respondidas} preguntas sin responder. ¿Entregar de todos modos?`)) entregar();
            }}
          >
            Entregar
          </button>
        </div>
      )}
      <nav aria-label="Preguntas del simulacro" className="flex flex-wrap gap-1">
        {ex.preguntas.map((p, i) => {
          const estado = resultado
            ? resp[i] === null
              ? 'border-borde'
              : resp[i] === p.correcta
                ? 'border-exito bg-exito/20'
                : 'border-error bg-error/20'
            : resp[i] !== null
              ? 'border-acento bg-acento/20'
              : 'border-borde';
          return (
            <button key={p.id} type="button" onClick={() => setK(i)} aria-current={i === k} className={`h-8 w-8 rounded border text-xs tabular-nums ${estado} ${i === k ? 'ring-2 ring-acento' : ''} ${marcadas.has(i) && !resultado ? 'underline decoration-aviso decoration-2' : ''}`}>
              {i + 1}
            </button>
          );
        })}
      </nav>
      <div className="rounded-lg border border-borde bg-superficie p-4">
        <p className="mb-2 text-xs text-texto-suave">{TEMAS.find((t) => t.id === q.tema)?.nombre}</p>
        <VistaPregunta pregunta={q} numero={k + 1} elegida={resp[k] ?? null} revisada={!!resultado} alElegir={resultado ? undefined : (i) => setResp((r) => r.map((x, j) => (j === k ? i : x)))} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={boton} disabled={k === 0} onClick={() => setK((x) => x - 1)}>
          ← Anterior
        </button>
        <button type="button" className={boton} disabled={k === ex.preguntas.length - 1} onClick={() => setK((x) => x + 1)}>
          Siguiente →
        </button>
        {!resultado && (
          <>
            <button type="button" className={boton} onClick={() => setMarcadas((m) => new Set(m.has(k) ? [...m].filter((x) => x !== k) : [...m, k]))}>
              {marcadas.has(k) ? 'Quitar marca' : 'Marcar para revisar'}
            </button>
            {resp[k] !== null && (
              <button type="button" className={boton} onClick={() => setResp((r) => r.map((x, j) => (j === k ? null : x)))}>
                Borrar respuesta
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
