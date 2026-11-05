import { useMemo, useState } from 'react';
import { generarPreguntas, LETRAS, TEMAS, type Dificultad, type Seleccion } from '@/study/generadores';
import { semillaNueva } from '@/study/azar';
import { Formula } from '@/components/Formula';
import { SelectorDificultad, SelectorTemas } from './SelectorTemas';
import { boton, botonPrincipal, input } from './VistaPregunta';

const NOMBRE_DIF: Record<Dificultad, string> = { 1: 'básica', 2: 'intermedia', 3: 'avanzada' };

/**
 * Generador de hojas de trabajo: ejercicios aleatorios (con semilla) creados desde src/chem,
 * vista previa en tamaño A4 e impresión o PDF con la hoja de respuestas al final.
 */
export default function Hojas() {
  const [seleccion, setSeleccion] = useState<Seleccion[]>([{ tema: 'balanceo' }, { tema: 'estequiometria' }]);
  const [n, setN] = useState(10);
  const [dificultad, setDificultad] = useState<Dificultad>(2);
  const [semilla, setSemilla] = useState(() => semillaNueva());
  const [formato, setFormato] = useState<'abiertas' | 'opcion'>('abiertas');
  const [conRespuestas, setConRespuestas] = useState(true);
  const [titulo, setTitulo] = useState('Hoja de trabajo de química');
  const [encabezado, setEncabezado] = useState({ nombre: true, curso: true, fecha: true });
  const [curso, setCurso] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toLocaleDateString('es-PE'));

  const preguntas = useMemo(() => generarPreguntas(semilla, seleccion, Math.max(5, Math.min(50, n)), dificultad), [semilla, seleccion, n, dificultad]);
  const temas = seleccion.map((s) => TEMAS.find((t) => t.id === s.tema)!.nombre).join(', ');

  return (
    <div className="space-y-5">
      <div className="no-imprimir space-y-4">
        <SelectorTemas seleccion={seleccion} alCambiar={setSeleccion} conSubtemas />
        <div className="flex flex-wrap items-end gap-5 text-sm">
          <label>
            <span className="mb-1 block font-medium">Número de preguntas (5–50)</span>
            <input type="number" min={5} max={50} value={n} onChange={(e) => setN(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <SelectorDificultad valor={dificultad} alCambiar={setDificultad} />
          <fieldset>
            <legend className="mb-1 font-medium">Formato</legend>
            <label className="mr-3">
              <input type="radio" name="formato" checked={formato === 'abiertas'} onChange={() => setFormato('abiertas')} /> Preguntas abiertas
            </label>
            <label>
              <input type="radio" name="formato" checked={formato === 'opcion'} onChange={() => setFormato('opcion')} /> Opción múltiple (A–E)
            </label>
          </fieldset>
        </div>
        <div className="flex flex-wrap items-end gap-4 text-sm">
          <label>
            <span className="mb-1 block font-medium">Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={`${input} w-64`} />
          </label>
          <label>
            <span className="mb-1 block font-medium">Curso</span>
            <input value={curso} onChange={(e) => setCurso(e.target.value)} className={`${input} w-40`} placeholder="(en blanco: línea)" />
          </label>
          <label>
            <span className="mb-1 block font-medium">Fecha</span>
            <input value={fecha} onChange={(e) => setFecha(e.target.value)} className={`${input} w-32`} />
          </label>
          <fieldset className="flex gap-3">
            <legend className="mb-1 font-medium">Encabezado</legend>
            {(['nombre', 'curso', 'fecha'] as const).map((k) => (
              <label key={k}>
                <input type="checkbox" checked={encabezado[k]} onChange={(e) => setEncabezado((s) => ({ ...s, [k]: e.target.checked }))} /> {k}
              </label>
            ))}
          </fieldset>
          <label>
            <input type="checkbox" checked={conRespuestas} onChange={(e) => setConRespuestas(e.target.checked)} /> Hoja de respuestas al final
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label>
            <span className="mb-1 block font-medium">Semilla</span>
            <input type="number" value={semilla} onChange={(e) => setSemilla(Number(e.target.value) || 1)} className={`${input} w-32 tabular-nums`} />
          </label>
          <button type="button" className={boton} onClick={() => setSemilla(semillaNueva())}>
            Nueva versión
          </button>
          <button type="button" className={botonPrincipal} onClick={() => window.print()} disabled={!preguntas.length}>
            Imprimir / guardar PDF
          </button>
          <span className="text-texto-suave">Con la misma semilla y opciones se obtiene exactamente la misma hoja.</span>
        </div>
      </div>

      {/* Vista previa en papel A4 (blanco, como impresa) */}
      <div className="overflow-x-auto">
        <article className="hoja mx-auto w-[210mm] max-w-none bg-white p-[14mm] text-[11pt] leading-relaxed text-black shadow-lg">
          <header className="border-b border-black pb-2">
            <h1 className="text-[16pt] font-bold">{titulo}</h1>
            <div className="mt-2 flex flex-wrap gap-x-8 gap-y-1">
              {encabezado.nombre && <span>Nombre: ______________________________</span>}
              {encabezado.curso && <span>Curso: {curso || '________________'}</span>}
              {encabezado.fecha && <span>Fecha: {fecha || '__________'}</span>}
            </div>
            <p className="mt-1 text-[9pt] text-neutral-600">
              Temas: {temas || '—'} · dificultad {NOMBRE_DIF[dificultad]} · {preguntas.length} preguntas · semilla {semilla}
            </p>
          </header>
          {!preguntas.length && <p className="mt-4">Elige al menos un tema.</p>}
          <ol className="mt-4 space-y-4">
            {preguntas.map((q, i) => (
              <li key={q.id} className="break-inside-avoid">
                <p>
                  <span className="mr-1 font-semibold">{i + 1}.</span>
                  {q.enunciado}
                </p>
                {q.tex && formato === 'abiertas' && <Formula tex={q.tex} bloque />}
                {formato === 'opcion' ? (
                  <ol className="mt-1 grid grid-cols-1 gap-x-6 pl-5 sm:grid-cols-2">
                    {q.opciones.map((o, j) => (
                      <li key={j}>
                        {LETRAS[j]}) {o}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-1 h-16 border-b border-dotted border-neutral-400" aria-hidden />
                )}
              </li>
            ))}
          </ol>
          {conRespuestas && preguntas.length > 0 && (
            <section className="salto mt-8 border-t-2 border-black pt-4">
              <h2 className="text-[14pt] font-bold">Hoja de respuestas</h2>
              <p className="text-[9pt] text-neutral-600">
                {titulo} · semilla {semilla}
              </p>
              <ol className="mt-2 columns-1 gap-8 text-[10pt] sm:columns-2">
                {preguntas.map((q, i) => (
                  <li key={q.id} className="break-inside-avoid">
                    <span className="font-semibold">{i + 1}.</span> {formato === 'opcion' ? `${LETRAS[q.correcta]}) ` : ''}
                    {q.respuesta}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
