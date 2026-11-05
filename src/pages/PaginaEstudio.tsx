import { lazy, Suspense } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { Cargando } from '@/components/Cargando';
import { useProgreso } from '@/store/progreso';
import { TEMAS } from '@/study/generadores';
import { mazo } from '@/study/tarjetas';
import { pendiente } from '@/study/sm2';

const Quiz = lazy(() => import('./estudio/Quiz'));
const Tarjetas = lazy(() => import('./estudio/Tarjetas'));
const Examen = lazy(() => import('./estudio/Examen'));
const Hojas = lazy(() => import('./estudio/Hojas'));

const SECCIONES = [
  { slug: 'quiz', titulo: 'Quiz', texto: 'Preguntas generadas al momento con respuesta inmediata y solución paso a paso.' },
  { slug: 'tarjetas', titulo: 'Tarjetas', texto: 'Repetición espaciada (SM-2): repasas cada tarjeta justo antes de olvidarla.' },
  { slug: 'simulacro', titulo: 'Simulacro de admisión', texto: 'Opción múltiple A–E, cronometrado, con nota vigesimal y revisión por tema.' },
  { slug: 'hojas', titulo: 'Hojas de trabajo', texto: 'Ejercicios imprimibles en A4 con hoja de respuestas; cada versión tiene su semilla.' },
  { slug: 'progreso', titulo: 'Progreso', texto: 'Aciertos por tema, historial de simulacros y tarjetas aprendidas.' },
] as const;

function Progreso() {
  const { temas, examenes, tarjetas, reiniciar } = useProgreso();
  const ahora = Date.now();
  const total = mazo().length;
  const aprendidas = Object.values(tarjetas).filter((t) => t.repeticiones > 0).length;
  const vencidas = Object.values(tarjetas).filter((t) => pendiente(t, ahora)).length;
  const debiles = TEMAS.filter((t) => (temas[t.id]?.total ?? 0) >= 3).sort((a, b) => temas[a.id]!.correctas / temas[a.id]!.total - temas[b.id]!.correctas / temas[b.id]!.total);
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h2 className="mb-2 text-lg font-semibold">Aciertos por tema</h2>
        <ul className="space-y-2">
          {TEMAS.map((t) => {
            const v = temas[t.id];
            const p = v && v.total ? v.correctas / v.total : 0;
            return (
              <li key={t.id} className="flex items-center gap-3">
                <span className="w-52 shrink-0">{t.nombre}</span>
                <span className="h-3 flex-1 overflow-hidden rounded bg-superficie-2" aria-hidden>
                  <span className={`block h-full ${p >= 0.7 ? 'bg-exito' : p >= 0.4 ? 'bg-aviso' : 'bg-error'}`} style={{ width: `${p * 100}%` }} />
                </span>
                <span className="w-24 text-right tabular-nums">{v ? `${v.correctas}/${v.total} (${Math.round(p * 100)} %)` : 'sin datos'}</span>
              </li>
            );
          })}
        </ul>
        {debiles.length > 0 && <p className="mt-2">Para reforzar: <strong>{debiles.slice(0, 2).map((t) => t.nombre).join(' y ')}</strong>.</p>}
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Tarjetas</h2>
        <p className="tabular-nums">
          Aprendidas: {aprendidas} de {total} · pendientes de repaso hoy: {vencidas}
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Simulacros</h2>
        {examenes.length ? (
          <table className="tabular-nums">
            <thead>
              <tr className="text-left text-texto-suave">
                <th className="pr-4 font-medium">Fecha</th>
                <th className="pr-4 font-medium">Tipo</th>
                <th className="pr-4 font-medium">Correctas</th>
                <th className="pr-4 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {[...examenes].reverse().map((e) => (
                <tr key={e.fecha}>
                  <td className="pr-4">{new Date(e.fecha).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="pr-4">{e.config}</td>
                  <td className="pr-4">
                    {e.correctas}/{e.total}
                  </td>
                  <td className="pr-4 font-semibold">{e.nota.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-texto-suave">Aún no has rendido ningún simulacro.</p>
        )}
      </section>
      <p className="text-xs text-texto-suave">El progreso se guarda solo en este dispositivo y navegador.</p>
      <button
        type="button"
        className="rounded-md border border-error px-3 py-1.5 text-error hover:bg-error/10"
        onClick={() => window.confirm('¿Borrar todo el progreso guardado?') && reiniciar()}
      >
        Borrar progreso
      </button>
    </div>
  );
}

export default function PaginaEstudio() {
  const { seccion } = useParams();
  const actual = SECCIONES.find((s) => s.slug === seccion);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="no-imprimir">
        <h1 className="text-3xl font-bold tracking-tight">Modo estudio</h1>
        <nav aria-label="Secciones del modo estudio" className="mt-4 mb-6 flex flex-wrap gap-1 border-b border-borde">
          <NavLink to="/estudio" end className={({ isActive }) => `-mb-px border-b-2 px-3 py-2 text-sm ${isActive ? 'border-acento font-semibold' : 'border-transparent text-texto-suave hover:text-texto'}`}>
            Inicio
          </NavLink>
          {SECCIONES.map((s) => (
            <NavLink key={s.slug} to={`/estudio/${s.slug}`} className={({ isActive }) => `-mb-px border-b-2 px-3 py-2 text-sm ${isActive ? 'border-acento font-semibold' : 'border-transparent text-texto-suave hover:text-texto'}`}>
              {s.titulo}
            </NavLink>
          ))}
        </nav>
      </div>
      {!actual ? (
        <div>
          <p className="text-texto-suave">Practica lo aprendido en los módulos con ejercicios que la aplicación genera a partir de sus propios cálculos.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {SECCIONES.map((s) => (
              <li key={s.slug}>
                <Link to={`/estudio/${s.slug}`} className="block h-full rounded-lg border border-borde bg-superficie p-4 hover:border-acento">
                  <h2 className="font-semibold">{s.titulo}</h2>
                  <p className="mt-1 text-sm text-texto-suave">{s.texto}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Suspense fallback={<Cargando />}>
          {actual.slug === 'quiz' && <Quiz />}
          {actual.slug === 'tarjetas' && <Tarjetas />}
          {actual.slug === 'simulacro' && <Examen />}
          {actual.slug === 'hojas' && <Hojas />}
          {actual.slug === 'progreso' && <Progreso />}
        </Suspense>
      )}
    </div>
  );
}
