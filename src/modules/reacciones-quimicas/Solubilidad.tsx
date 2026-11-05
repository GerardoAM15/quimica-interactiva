import { useMemo, useState } from 'react';
import { aMhchem } from '@/chem/formula';
import { ANIONES, CATIONES, ladoMhchem, NOMBRE_SOLUBILIDAD, predecirPrecipitado, REGLAS, tablaSolubilidad, type Celda, type PrediccionPrecipitado, type Solubilidad } from '@/chem/solubilidad';
import { Ce } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { PasoAPaso } from '@/components/PasoAPaso';

/** Clases de color de cada categoría (tokens del tema). */
const CLASE: Record<Solubilidad, string> = {
  soluble: 'bg-exito/20 hover:bg-exito/35',
  poco: 'bg-aviso/25 hover:bg-aviso/40',
  insoluble: 'bg-error/25 hover:bg-error/40',
  reacciona: 'bg-superficie-2 hover:bg-borde',
};
const SIGLA: Record<Solubilidad, string> = { soluble: 'S', poco: 'P', insoluble: 'I', reacciona: 'R' };
const sub = (f: string) => f.replace(/(\d+)/g, (d) => d.replace(/\d/g, (x) => '₀₁₂₃₄₅₆₇₈₉'[Number(x)]!));
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** «SO₄²⁻», «NH₄⁺» a partir de la fórmula del grupo y la carga. */
const ionTexto = (base: string, carga: number) => `${sub(base)}${Math.abs(carga) > 1 ? SUP[Math.abs(carga)] : ''}${carga > 0 ? '⁺' : '⁻'}`;
const cientifico = (x: number) => {
  const [m, e] = x.toExponential(1).split('e');
  return `${m!.replace('.', ',')} × 10${String(Number(e)).replace('-', '⁻').replace(/\d/g, (d) => SUP[Number(d)]!)}`;
};

/** Tubo de ensayo: solución transparente o con precipitado del color correspondiente. */
export function TuboEnsayo({ celda, etiqueta }: { celda: Pick<Celda, 'solubilidad' | 'hex' | 'formula'> | null; etiqueta: string }) {
  const s = celda?.solubilidad;
  const pp = s === 'insoluble' ? 34 : s === 'poco' ? 16 : 0;
  const color = celda?.hex ?? '#e8ecef';
  return (
    <svg viewBox="0 0 60 170" className="h-40 w-14" role="img" aria-label={etiqueta}>
      <path d="M12 8 L12 140 A18 18 0 0 0 48 140 L48 8" fill="none" stroke="var(--texto-suave)" strokeWidth={2.5} />
      <path d="M13.5 60 L13.5 140 A16.5 16.5 0 0 0 46.5 140 L46.5 60 Z" fill="var(--acento)" opacity={0.12} />
      {pp > 0 && <path d={`M13.5 ${156 - pp} L13.5 140 A16.5 16.5 0 0 0 46.5 140 L46.5 ${156 - pp} Z`} fill={color} />}
      {s === 'poco' && [20, 30, 40, 25, 35].map((x, i) => <circle key={i} cx={x} cy={90 + i * 9} r={1.8} fill={color} />)}
    </svg>
  );
}

function Tabla() {
  const tabla = useMemo(() => tablaSolubilidad(), []);
  const [sel, setSel] = useState<Celda>(tabla[14]![2]!);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-fondo" />
                {ANIONES.map((a) => (
                  <th key={a.ion} scope="col" className="px-1 py-1 font-semibold whitespace-nowrap">
                    {ionTexto(a.grupo, -a.carga)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila, i) => (
                <tr key={CATIONES[i]!.ion}>
                  <th scope="row" className="sticky left-0 bg-fondo pr-2 text-right font-semibold whitespace-nowrap">
                    {ionTexto(CATIONES[i]!.elemento, CATIONES[i]!.carga)}
                  </th>
                  {fila.map((c) => (
                    <td key={c.formula} className="p-0">
                      <button
                        type="button"
                        onClick={() => setSel(c)}
                        aria-pressed={sel.formula === c.formula}
                        aria-label={`${c.nombre}, ${c.formula}: ${NOMBRE_SOLUBILIDAD[c.solubilidad]}`}
                        className={`relative h-9 w-12 rounded text-[11px] font-semibold ${CLASE[c.solubilidad]} ${sel.formula === c.formula ? 'ring-2 ring-acento' : ''}`}
                      >
                        {SIGLA[c.solubilidad]}
                        {c.hex && <span className="absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full border border-black/30" style={{ background: c.hex }} aria-hidden />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex flex-wrap gap-3 text-xs">
          {(Object.keys(SIGLA) as Solubilidad[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`inline-block h-3 w-4 rounded ${CLASE[s]}`} aria-hidden /> {SIGLA[s]} = {NOMBRE_SOLUBILIDAD[s]}
            </span>
          ))}
          <span>● color del precipitado</span>
        </p>
      </div>
      <aside className="space-y-3 text-sm" aria-live="polite">
        <div className="flex gap-3">
          <TuboEnsayo celda={sel} etiqueta={`Tubo de ensayo con ${sel.formula} en agua: ${NOMBRE_SOLUBILIDAD[sel.solubilidad]}`} />
          <div>
            <h3 className="text-base font-semibold">{sel.nombre}</h3>
            <p className="text-lg">
              <Ce>{aMhchem(sel.formula)}</Ce>
            </p>
            <p className="font-medium">{NOMBRE_SOLUBILIDAD[sel.solubilidad]}</p>
            {sel.color && <p>Precipitado {sel.color}</p>}
            {sel.ksp !== undefined && <p className="tabular-nums">Ksp = {cientifico(sel.ksp)}</p>}
          </div>
        </div>
        <p className="text-texto-suave">{sel.regla}</p>
        {sel.nota && <p>{sel.nota}</p>}
        <p className="text-xs text-texto-suave">
          Reglas: Chang (tabla 4.2) y Brown (tabla 4.1) <InsigniaRevision />
        </p>
      </aside>
      <details className="xl:col-span-2 text-sm">
        <summary className="cursor-pointer font-medium">Reglas de solubilidad</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {REGLAS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/** Ecuaciones molecular, iónica total y neta de una predicción. */
export function EcuacionesPrecipitado({ p }: { p: PrediccionPrecipitado }) {
  const ec = (l: PrediccionPrecipitado['molecular']) => `${ladoMhchem(l[0]!)} -> ${ladoMhchem(l[1]!)}`;
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium">Ecuación molecular</p>
      <Ce bloque>{ec(p.molecular)}</Ce>
      <p className="font-medium">Ecuación iónica total</p>
      <div className="overflow-x-auto">
        <Ce bloque>{ec(p.ionicaTotal)}</Ce>
      </div>
      {p.ionicaNeta && (
        <>
          <p className="font-medium">Ecuación iónica neta</p>
          <Ce bloque>{ec(p.ionicaNeta)}</Ce>
        </>
      )}
    </div>
  );
}

const PARES = [
  ['AgNO3', 'NaCl'],
  ['Pb(NO3)2', 'KI'],
  ['BaCl2', 'Na2SO4'],
  ['CuSO4', 'NaOH'],
  ['CaCl2', 'Na2CO3'],
  ['FeCl3', 'KOH'],
  ['AgNO3', 'K2CrO4'],
  ['NaCl', 'KNO3'],
] as const;

function Predecir() {
  const [a, setA] = useState('Pb(NO3)2');
  const [b, setB] = useState('KI');
  let p: PrediccionPrecipitado | null = null;
  let error: string | null = null;
  try {
    p = predecirPrecipitado(a, b);
  } catch (e) {
    error = (e as Error).message;
  }
  const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5 font-mono';
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="mb-1 block font-medium">Sal 1</span>
          <input value={a} onChange={(e) => setA(e.target.value)} className={`${input} w-36`} spellCheck={false} />
        </label>
        <span className="pb-2 text-lg">+</span>
        <label>
          <span className="mb-1 block font-medium">Sal 2</span>
          <input value={b} onChange={(e) => setB(e.target.value)} className={`${input} w-36`} spellCheck={false} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {PARES.map(([x, y]) => (
          <button key={x + y} type="button" onClick={() => (setA(x), setB(y))} className="rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2">
            {sub(x)} + {sub(y)}
          </button>
        ))}
      </div>
      {error && <p className="text-aviso">{error}</p>}
      {p && (
        <div className="grid gap-4 rounded-lg border border-borde bg-superficie p-4 lg:grid-cols-[auto_1fr]">
          <div className="flex items-start gap-2">
            {p.productos.map((c) => (
              <figure key={c.formula} className="text-center">
                <TuboEnsayo celda={c} etiqueta={`${c.formula}: ${NOMBRE_SOLUBILIDAD[c.solubilidad]}`} />
                <figcaption className="text-xs">
                  {sub(c.formula)}
                  <br />
                  {NOMBRE_SOLUBILIDAD[c.solubilidad]}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="min-w-0 space-y-2">
            <p className={`text-base font-semibold ${p.hayPrecipitado ? 'text-exito' : 'text-texto-suave'}`}>{p.hayPrecipitado ? 'Se forma precipitado' : 'No se forma precipitado'}</p>
            <EcuacionesPrecipitado p={p} />
            <PasoAPaso
              abierto
              pasos={[
                { titulo: 'Se intercambian los iones: AB + CD → AD + CB.' },
                { titulo: 'Se consulta la tabla de solubilidad de cada producto.' },
                ...p.explicacion.map((x) => ({ titulo: x })),
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Solubilidad({ seccion }: { seccion: 'tabla' | 'precipitado' }) {
  return seccion === 'tabla' ? <Tabla /> : <Predecir />;
}
