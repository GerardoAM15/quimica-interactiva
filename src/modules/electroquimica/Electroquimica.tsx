import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { celda, cocienteCelda, masaElectrolisis, nernst, SEMIRREACCIONES, tiempoElectrolisis, type Semirreaccion } from '@/chem/electrochem';
import { masaMolar } from '@/chem/formula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Seccion = 'galvanica' | 'tabla' | 'electrolisis' | 'corrosion';
const SECCIONES = [
  { id: 'galvanica', titulo: 'Celda galvánica' },
  { id: 'tabla', titulo: 'Potenciales estándar' },
  { id: 'electrolisis', titulo: 'Electrólisis' },
  { id: 'corrosion', titulo: 'Corrosión' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const METALES = SEMIRREACCIONES.filter((s) => s.metal) as (Semirreaccion & { metal: string; ion: string })[];
/** «Cu2+(ac) + 2e- -> Cu(s)» → notación mhchem. */
/**
 * Cargas para mhchem: «Cu2+(ac)» → «Cu^{2+} (ac)». Convención de la tabla: en los cationes el dígito es la carga;
 * en los aniones es subíndice (MnO4-) y las cargas múltiples se escriben con ^ (SO4^2-).
 */
const ce = (t: string) =>
  t
    .replace(/\^(\d)([+-])\(/g, '^{$1$2} (')
    .replace(/(?<!\^)(\d)\+\(/g, '^{$1+} (')
    .replace(/([A-Za-z])([+-])\(/g, '$1^{$2} (');
const sci = (x: number) => (Math.abs(Math.log10(Math.abs(x))) > 4 ? x.toExponential(2) : x.toLocaleString('es-PE', { maximumSignificantDigits: 4 }));

/** Esquema de la pila: electrodos, puente salino, voltímetro y flujo de electrones (ánodo → cátodo). */
function EsquemaPila({ anodo, catodo, E }: { anodo: string; catodo: string; E: number }) {
  const reducido = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const cable = 'M70 70 L70 30 L330 30 L330 70';
  return (
    <svg viewBox="0 0 400 250" className="w-full max-w-lg" role="img" aria-label={`Pila: ánodo de ${anodo}, cátodo de ${catodo}, ${E.toFixed(3)} V`}>
      <path d={cable} fill="none" stroke="var(--texto-suave)" strokeWidth={2} />
      {E > 0 &&
        !reducido &&
        [0, 1, 2, 3].map((i) => (
          <circle key={i} r={4} fill="var(--acento)">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.6}s`} path={cable} />
          </circle>
        ))}
      <rect x={165} y={12} width={70} height={36} rx={6} fill="var(--superficie-2)" stroke="var(--texto-suave)" />
      <text x={200} y={36} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--texto)">
        {E.toFixed(3)} V
      </text>
      <text x={200} y={64} textAnchor="middle" fontSize={11} fill="var(--acento)">
        {E > 0 ? 'e⁻ →' : 'sin corriente espontánea'}
      </text>
      {/* Vasos */}
      {[40, 260].map((x, i) => (
        <g key={x}>
          <rect x={x} y={110} width={100} height={110} fill={i === 0 ? '#94a3b8' : '#2f7fe0'} opacity={0.2} />
          <path d={`M${x} 95 L${x} 220 L${x + 100} 220 L${x + 100} 95`} fill="none" stroke="var(--texto-suave)" strokeWidth={2.5} />
        </g>
      ))}
      {/* Electrodos */}
      <rect x={62} y={70} width={16} height={130} fill="#9ca3af" stroke="var(--texto-suave)" />
      <rect x={322} y={70} width={16} height={130} fill="#c58a4a" stroke="var(--texto-suave)" />
      {/* Puente salino */}
      <path d="M115 150 L115 85 L285 85 L285 150" fill="none" stroke="var(--aviso)" strokeWidth={10} strokeOpacity={0.5} />
      <text x={200} y={102} textAnchor="middle" fontSize={10} fill="var(--texto-suave)">
        puente salino (KNO₃)
      </text>
      <text x={90} y={240} textAnchor="middle" fontSize={12} fill="var(--texto)">
        ánodo (−): {anodo} · oxidación
      </text>
      <text x={310} y={240} textAnchor="middle" fontSize={12} fill="var(--texto)">
        cátodo (+): {catodo} · reducción
      </text>
    </svg>
  );
}

function Galvanica() {
  const [m1, setM1] = useState('Zn');
  const [m2, setM2] = useState('Cu');
  const [log1, setLog1] = useState(0);
  const [log2, setLog2] = useState(0);
  const a = METALES.find((x) => x.id === m1)!, b = METALES.find((x) => x.id === m2)!;
  const iguales = a.id === b.id;
  // El de mayor E° de reducción es el cátodo
  const [cat, an] = a.E >= b.E ? [a, b] : [b, a];
  const cCat = 10 ** (cat === a ? log1 : log2), cAn = 10 ** (an === a ? log1 : log2);
  const c = iguales ? null : celda(cat.id, an.id);
  const Q = c ? cocienteCelda(c.global, { [`${cat.ion}(ac)`]: cCat, [`${an.ion}(ac)`]: cAn }) : 1;
  const E = c ? nernst(c.E0, c.n, Q) : 0;
  const curva = useMemo(() => (c ? Array.from({ length: 41 }, (_, i) => ({ logQ: i / 2 - 10, E: nernst(c.E0, c.n, 10 ** (i / 2 - 10)) })) : []), [c?.E0, c?.n]);
  const sel = (v: string, f: (x: string) => void, e: string) => (
    <label className="text-sm">
      <span className="mb-1 block font-medium">{e}</span>
      <select value={v} onChange={(ev) => f(ev.target.value)} className={input}>
        {METALES.map((x) => (
          <option key={x.id} value={x.id}>
            {x.metal} | {x.ion} (E° = {x.E.toFixed(2)} V)
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {sel(m1, setM1, 'Semicelda 1')}
        <div className="w-56">
          <Slider etiqueta={`[${a.ion}]`} valor={log1} min={-4} max={1} paso={0.1} alCambiar={setLog1} formato={(v) => `${sci(10 ** v)} M`} />
        </div>
        {sel(m2, setM2, 'Semicelda 2')}
        <div className="w-56">
          <Slider etiqueta={`[${b.ion}]`} valor={log2} min={-4} max={1} paso={0.1} alCambiar={setLog2} formato={(v) => `${sci(10 ** v)} M`} />
        </div>
      </div>
      {iguales || !c ? (
        <p className="text-aviso text-sm">Elige dos metales distintos para formar una pila.</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <EsquemaPila anodo={an.metal} catodo={cat.metal} E={E} />
            <p className="mt-2 text-sm">
              Notación:{' '}
              <span className="font-mono">
                {an.metal}(s) | {an.ion} ({sci(cAn)} M) ‖ {cat.ion} ({sci(cCat)} M) | {cat.metal}(s)
              </span>
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <Ce bloque>{ce(c.ecuacion)}</Ce>
            <dl className="grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums">
              <dt>E° de la celda</dt>
              <dd>{c.E0.toFixed(2)} V</dd>
              <dt>E (Nernst, 25 °C)</dt>
              <dd className="font-semibold">{E.toFixed(3)} V</dd>
              <dt>n (electrones)</dt>
              <dd>{c.n}</dd>
              <dt>ΔG°</dt>
              <dd>{(c.dG0 / 1000).toFixed(1)} kJ</dd>
              <dt>K</dt>
              <dd>{sci(c.K)}</dd>
            </dl>
            <PasoAPaso
              pasos={[
                ...c.pasos.map((p) => ({ titulo: p })),
                { titulo: 'Ecuación de Nernst', tex: `E = E^\\circ - \\dfrac{0{,}0592}{n}\\log Q = ${c.E0.toFixed(2)} - \\dfrac{0{,}0592}{${c.n}}\\log(${sci(Q)}) = ${E.toFixed(3)}\\ \\text{V}` },
              ]}
            />
            <div className="h-[200px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Potencial de la celda frente a log Q">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curva} margin={{ top: 8, right: 16, bottom: 18, left: 4 }}>
                  <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
                  <XAxis dataKey="logQ" type="number" domain={[-10, 10]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'log Q', position: 'insideBottom', offset: -8, fill: 'var(--texto-suave)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={44} tickFormatter={(v) => Number(v).toFixed(2)} />
                  <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} formatter={(y) => [`${Number(y).toFixed(3)} V`, 'E']} />
                  <ReferenceLine x={Math.max(-10, Math.min(10, Math.log10(Q)))} stroke="var(--acento)" strokeDasharray="4 3" />
                  <ReferenceLine y={0} stroke="var(--texto-suave)" />
                  <Line dataKey="E" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tabla() {
  const [cat, setCat] = useState('MnO4');
  const [an, setAn] = useState('Fe3');
  const c = cat === an ? null : celda(cat, an);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="max-h-[520px] overflow-y-auto rounded-lg border border-borde bg-superficie">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-superficie">
            <tr className="text-left text-texto-suave">
              <th className="px-3 py-2 font-medium">Semirreacción (reducción)</th>
              <th className="px-3 py-2 text-right font-medium">E° (V)</th>
            </tr>
          </thead>
          <tbody>
            {SEMIRREACCIONES.map((s) => (
              <tr key={s.id} className={`border-t border-borde ${s.id === cat ? 'bg-acento/10' : s.id === an ? 'bg-aviso/10' : ''}`}>
                <td className="px-3 py-1">
                  <Ce>{ce(s.ecuacion)}</Ce>
                </td>
                <td className="px-3 py-1 text-right tabular-nums">{s.E.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 text-sm">
        <p>Arriba: oxidantes más fuertes (se reducen con facilidad). Abajo: reductores más fuertes (sus metales se oxidan con facilidad).</p>
        {(
          [
            ['Se reduce (cátodo)', cat, setCat],
            ['Se oxida (ánodo)', an, setAn],
          ] as const
        ).map(([e, v, f]) => (
          <label key={e} className="block">
            <span className="mb-1 block font-medium">{e}</span>
            <select value={v} onChange={(ev) => f(ev.target.value)} className={`${input} w-full`}>
              {SEMIRREACCIONES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ecuacion} ({s.E.toFixed(2)} V)
                </option>
              ))}
            </select>
          </label>
        ))}
        {c && (
          <div className="rounded-lg border border-borde bg-superficie p-3">
            <div className="overflow-x-auto">
              <Ce bloque>{ce(c.ecuacion)}</Ce>
            </div>
            <p>
              E° = <strong>{c.E0.toFixed(2)} V</strong>: {c.espontanea ? 'espontánea en condiciones estándar.' : 'no espontánea (ocurre la inversa).'}
            </p>
            <PasoAPaso pasos={c.pasos.map((p) => ({ titulo: p }))} />
          </div>
        )}
        <p className="text-xs text-texto-suave">
          Potenciales a 25 °C: Chang, tabla 19.1 <InsigniaRevision />
        </p>
      </div>
    </div>
  );
}

function Electrolisis() {
  const [id, setId] = useState('Cu');
  const s = METALES.find((x) => x.id === id)!;
  const [I, setI] = useState(2);
  const [min, setMin] = useState(30);
  const [meta, setMeta] = useState(5);
  const M = masaMolar(s.metal);
  const m = masaElectrolisis(I, min * 60, M, s.n);
  const t = tiempoElectrolisis(meta, I, M, s.n);
  return (
    <div className="grid gap-5 md:grid-cols-2 text-sm">
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">Leyes de Faraday</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Metal depositado en el cátodo</span>
          <select value={id} onChange={(e) => setId(e.target.value)} className={input}>
            {METALES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.metal} (desde {x.ion}, n = {x.n})
              </option>
            ))}
          </select>
        </label>
        <div className="mt-3 space-y-3">
          <Slider etiqueta="Corriente" valor={I} min={0.1} max={20} paso={0.1} unidad="A" alCambiar={setI} />
          <Slider etiqueta="Tiempo" valor={min} min={1} max={300} unidad="min" alCambiar={setMin} />
        </div>
        <p className="mt-3 text-lg">
          m = <strong>{sci(m)} g</strong> de {s.metal}
        </p>
        <PasoAPaso
          pasos={[
            { titulo: 'Carga', tex: `Q = It = ${I}\\times${min * 60} = ${(I * min * 60).toFixed(0)}\\ \\text{C}` },
            { titulo: 'Moles de electrones', tex: `n_{e^-} = \\dfrac{Q}{F} = \\dfrac{${(I * min * 60).toFixed(0)}}{96\\,485} = ${sci((I * min * 60) / 96485)}\\ \\text{mol}` },
            { titulo: `Masa (${s.ion} + ${s.n}e⁻ → ${s.metal})`, tex: `m = \\dfrac{n_{e^-}}{${s.n}}\\times${M.toFixed(3)} = ${sci(m)}\\ \\text{g}` },
          ]}
        />
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">Tiempo necesario</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Masa que se quiere depositar (g)</span>
          <input type="number" step="any" value={meta} onChange={(e) => setMeta(Number(e.target.value))} className={`${input} w-28`} />
        </label>
        <p className="mt-3">
          t = <strong>{sci(t)} s</strong> = {sci(t / 60)} min con {I} A
        </p>
        <Formula tex="t = \dfrac{m\,n\,F}{I\,M}" bloque />
        <h4 className="mt-4 font-medium">En una celda electrolítica…</h4>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-texto-suave">
          <li>La energía eléctrica fuerza una reacción no espontánea (ΔG &gt; 0).</li>
          <li>El ánodo (+) es donde ocurre la oxidación; el cátodo (−), la reducción.</li>
          <li>NaCl fundido: 2Cl⁻ → Cl₂ + 2e⁻ (ánodo) y Na⁺ + e⁻ → Na (cátodo).</li>
        </ul>
      </section>
    </div>
  );
}

function Corrosion() {
  const fe = METALES.find((x) => x.id === 'Fe')!;
  const [id, setId] = useState('Mg');
  const s = METALES.find((x) => x.id === id)!;
  const protege = s.E < fe.E;
  return (
    <div className="grid gap-5 md:grid-cols-2 text-sm">
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">¿Cómo se oxida el hierro?</h3>
        <p className="mt-2">El hierro actúa como ánodo y el oxígeno disuelto en el agua como cátodo, en una pila galvánica microscópica:</p>
        <Ce bloque>{'Fe(s) -> Fe^{2+}(aq) + 2e-'}</Ce>
        <Ce bloque>{'O2(g) + 4H+(aq) + 4e- -> 2H2O(l)'}</Ce>
        <p>El Fe²⁺ se oxida después a Fe³⁺ y forma la herrumbre (Fe₂O₃·xH₂O). La sal y la acidez la aceleran, porque aumentan la conductividad.</p>
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">Protección catódica (ánodo de sacrificio)</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Metal en contacto con el hierro</span>
          <select value={id} onChange={(e) => setId(e.target.value)} className={input}>
            {METALES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.metal} (E° = {x.E.toFixed(2)} V)
              </option>
            ))}
          </select>
        </label>
        <p className={`mt-3 font-semibold ${protege ? 'text-exito' : 'text-error'}`}>
          {s.id === 'Fe' ? 'Es el mismo metal.' : protege ? `El ${s.metal} se oxida antes que el hierro (E° menor): lo protege.` : `El ${s.metal} tiene E° mayor: el hierro se oxida primero y la corrosión se acelera donde se rompa el recubrimiento.`}
        </p>
        <p className="mt-2 text-texto-suave">
          E°(Fe²⁺/Fe) = {fe.E.toFixed(2)} V. Por eso el hierro galvanizado (con Zn) resiste la corrosión y en barcos y tuberías se usan bloques de Mg o Zn.
        </p>
      </section>
    </div>
  );
}

export default function Electroquimica() {
  const [seccion, setSeccion] = useState<Seccion>('galvanica');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: electroquímica">
          <div className="space-y-4">
            <p>En una celda galvánica una reacción redox espontánea produce corriente: la oxidación ocurre en el ánodo (−) y la reducción en el cátodo (+). Los electrones viajan por el circuito externo del ánodo al cátodo y el puente salino mantiene la neutralidad.</p>
            <Formula tex="E^\circ_{\text{celda}} = E^\circ_{\text{cátodo}} - E^\circ_{\text{ánodo}}\qquad \Delta G^\circ = -nFE^\circ\qquad E^\circ = \dfrac{RT}{nF}\ln K" bloque />
            <Formula tex="E = E^\circ - \dfrac{RT}{nF}\ln Q = E^\circ - \dfrac{0{,}0592\ \text{V}}{n}\log Q\quad(25\ ^\circ\text{C})" bloque />
            <p>Electrólisis (leyes de Faraday): la masa depositada es proporcional a la carga que circula.</p>
            <Formula tex="m = \dfrac{I\,t\,M}{n\,F}\qquad F = 96\,485\ \text{C/mol}" bloque />
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Electroquímica">
        {seccion === 'galvanica' && <Galvanica />}
        {seccion === 'tabla' && <Tabla />}
        {seccion === 'electrolisis' && <Electrolisis />}
        {seccion === 'corrosion' && <Corrosion />}
      </Pestanas>
    </div>
  );
}
