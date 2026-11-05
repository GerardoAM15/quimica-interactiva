import { useMemo, useState } from 'react';
import { mazo, NOMBRE_CATEGORIA, type CategoriaTarjeta } from '@/study/tarjetas';
import { CALIFICACIONES, pendiente } from '@/study/sm2';
import { useProgreso } from '@/store/progreso';
import { boton, botonPrincipal } from './VistaPregunta';

const NUEVAS_POR_SESION = 15;

/** Flashcards con repetición espaciada (SM-2). */
export default function Tarjetas() {
  const estados = useProgreso((s) => s.tarjetas);
  const repasarTarjeta = useProgreso((s) => s.repasarTarjeta);
  const [categorias, setCategorias] = useState<CategoriaTarjeta[]>(['elementos', 'iones']);
  const [volteada, setVolteada] = useState(false);
  const [hechas, setHechas] = useState(0);
  // La cola se calcula al iniciar la sesión o al cambiar categorías (no en cada repaso)
  const [semilla, setSemilla] = useState(0);
  const cola = useMemo(() => {
    const ahora = Date.now();
    const lista = mazo().filter((t) => categorias.includes(t.categoria));
    const vencidas = lista.filter((t) => estados[t.id] && pendiente(estados[t.id], ahora));
    const nuevas = lista.filter((t) => !estados[t.id]).slice(0, NUEVAS_POR_SESION);
    return [...vencidas, ...nuevas];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias, semilla]);
  const actual = cola[hechas];
  const total = mazo().filter((t) => categorias.includes(t.categoria)).length;
  const aprendidas = mazo().filter((t) => categorias.includes(t.categoria) && (estados[t.id]?.repeticiones ?? 0) > 0).length;

  return (
    <div className="space-y-4">
      <fieldset className="flex flex-wrap gap-3 text-sm">
        <legend className="mb-1 w-full font-medium">Mazos</legend>
        {(Object.keys(NOMBRE_CATEGORIA) as CategoriaTarjeta[]).map((c) => (
          <label key={c} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={categorias.includes(c)}
              onChange={() => {
                setCategorias((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
                setHechas(0);
                setVolteada(false);
              }}
            />
            {NOMBRE_CATEGORIA[c]}
          </label>
        ))}
      </fieldset>
      <p className="text-sm text-texto-suave tabular-nums">
        En esta sesión: {Math.max(0, cola.length - hechas)} por repasar · aprendidas {aprendidas} de {total}
      </p>
      {actual ? (
        <div className="mx-auto max-w-md space-y-3">
          <button
            type="button"
            onClick={() => setVolteada((v) => !v)}
            className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-borde bg-superficie p-6 text-center shadow-sm"
            aria-label={volteada ? 'Ocultar respuesta' : 'Mostrar respuesta'}
          >
            <span className="text-xs text-texto-suave">{NOMBRE_CATEGORIA[actual.categoria]}</span>
            <span className="mt-2 text-3xl font-bold">{actual.frente}</span>
            {volteada ? <span className="mt-4 text-lg" aria-live="polite">{actual.reverso}</span> : <span className="mt-4 text-sm text-texto-suave">Toca para ver la respuesta</span>}
          </button>
          {volteada && (
            <div className="grid grid-cols-4 gap-2">
              {CALIFICACIONES.map((c) => (
                <button
                  key={c.q}
                  type="button"
                  title={c.descripcion}
                  className={c.q >= 4 ? botonPrincipal : boton}
                  onClick={() => {
                    repasarTarjeta(actual.id, c.q);
                    setHechas((h) => h + 1);
                    setVolteada(false);
                  }}
                >
                  {c.etiqueta}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-borde bg-superficie p-5 text-center">
          <p className="font-semibold">¡Al día! No hay tarjetas pendientes en estos mazos.</p>
          <p className="mt-1 text-sm text-texto-suave">Las tarjetas vuelven a aparecer cuando les toca repaso según el algoritmo SM-2.</p>
          <button type="button" className={`${boton} mt-3`} onClick={() => (setSemilla((x) => x + 1), setHechas(0))}>
            Buscar tarjetas nuevas
          </button>
        </div>
      )}
      <p className="text-xs text-texto-suave">«Otra vez» la repite mañana; «Bien» y «Fácil» alargan el intervalo (1, 6, luego × factor de facilidad).</p>
    </div>
  );
}
