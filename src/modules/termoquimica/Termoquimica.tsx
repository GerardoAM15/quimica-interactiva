import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  calor,
  CALORES_ESPECIFICOS,
  calorReaccion,
  criterioEspontaneidad,
  ESPECIES_TERMO,
  gibbs,
  hess,
  propiedadesReaccion,
  temperaturaEquilibrio,
  temperaturaInversion,
  vectorEspecies,
  type ReaccionHess,
} from '@/chem/thermo';
import { Fraccion, frac } from '@/chem/fraction';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Seccion = 'reaccion' | 'hess' | 'calorimetria';
const SECCIONES = [
  { id: 'reaccion', titulo: 'ΔH, ΔS y ΔG de reacción' },
  { id: 'hess', titulo: 'Ley de Hess' },
  { id: 'calorimetria', titulo: 'Calorimetría' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const n4 = (x: number) => (Number.isFinite(x) ? Number(x.toPrecision(4)).toLocaleString('es-PE') : '—');

/** «2 H2O(l)» → «2 H2O(l)» en mhchem (los estados no estándar se escriben como texto). */
const ceTermo = (t: string) => t.replace(/\((grafito|diamante|rombico)\)/g, '_{($1)}').replace(/->/g, '->');

const EJEMPLOS = [
  'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)',
  'CaCO3(s) -> CaO(s) + CO2(g)',
  'N2(g) + 3 H2(g) -> 2 NH3(g)',
  'C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(l)',
  'C6H12O6(s) + 6 O2(g) -> 6 CO2(g) + 6 H2O(l)',
  '2 NO2(g) -> N2O4(g)',
  'Fe2O3(s) + 2 Al(s) -> Al2O3(s) + 2 Fe(s)',
  'C2H5OH(l) + 3 O2(g) -> 2 CO2(g) + 3 H2O(l)',
  'C(grafito) -> C(diamante)',
];

/** Diagrama de entalpía: niveles de reactivos y productos con la flecha de ΔH. */
function DiagramaEntalpia({ dH }: { dH: number }) {
  const exo = dH < 0;
  const yR = exo ? 40 : 150, yP = exo ? 150 : 40;
  return (
    <svg viewBox="0 0 300 200" className="h-48 w-full max-w-sm" role="img" aria-label={`Diagrama de entalpía: reacción ${exo ? 'exotérmica' : 'endotérmica'}, ΔH = ${n4(dH)} kJ`}>
      <line x1={30} y1={10} x2={30} y2={190} stroke="var(--texto-suave)" />
      <text x={12} y={100} fontSize={12} fill="var(--texto-suave)" transform="rotate(-90 12 100)" textAnchor="middle">
        H
      </text>
      <line x1={50} x2={140} y1={yR} y2={yR} stroke="var(--texto)" strokeWidth={3} />
      <text x={95} y={yR - 8} textAnchor="middle" fontSize={12} fill="var(--texto)">
        reactivos
      </text>
      <line x1={170} x2={260} y1={yP} y2={yP} stroke="var(--texto)" strokeWidth={3} />
      <text x={215} y={yP - 8} textAnchor="middle" fontSize={12} fill="var(--texto)">
        productos
      </text>
      <defs>
        <marker id="punta-dh" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={exo ? 'var(--error)' : 'var(--acento)'} />
        </marker>
      </defs>
      <line x1={155} x2={155} y1={yR} y2={yP + (exo ? -6 : 6)} stroke={exo ? 'var(--error)' : 'var(--acento)'} strokeWidth={2.5} markerEnd="url(#punta-dh)" />
      <text x={162} y={100} fontSize={12} fill="var(--texto)">
        ΔH = {n4(dH)} kJ
      </text>
      <text x={150} y={196} textAnchor="middle" fontSize={11} fill="var(--texto-suave)">
        {exo ? 'exotérmica: se libera calor' : 'endotérmica: se absorbe calor'}
      </text>
    </svg>
  );
}

function Reaccion() {
  const [texto, setTexto] = useState(EJEMPLOS[1]!);
  const [T, setT] = useState(298.15);
  let r: ReturnType<typeof propiedadesReaccion> | null = null;
  let error: string | null = null;
  try {
    r = propiedadesReaccion(texto);
  } catch (e) {
    error = (e as Error).message;
  }
  const curva = useMemo(() => (r ? Array.from({ length: 61 }, (_, k) => ({ T: k * 25, dG: Number(gibbs(r.dH, r.dS, k * 25).toFixed(2)) })) : []), [r?.dH, r?.dS]);
  const Tinv = r && r.dS !== 0 ? temperaturaInversion(r.dH, r.dS) : null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block font-medium">Reacción (con estados; sin coeficientes se balancea sola)</span>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} className={`${input} w-full font-mono`} />
        </label>
        <label>
          <span className="mb-1 block font-medium">Ejemplos</span>
          <select value="" onChange={(e) => e.target.value && setTexto(e.target.value)} className={input}>
            <option value="">Elegir…</option>
            {EJEMPLOS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="text-sm text-aviso">
          {error} Especies disponibles: {Object.keys(ESPECIES_TERMO).join(', ')}.
        </p>
      )}
      {r && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
            <Ce bloque>{ceTermo(texto)}</Ce>
            <dl className="mt-2 grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums">
              <dt>ΔH° (25 °C)</dt>
              <dd className="font-semibold">{n4(r.dH)} kJ</dd>
              <dt>ΔS° (25 °C)</dt>
              <dd>{n4(r.dS)} J/K</dd>
              <dt>ΔG° (25 °C, de tablas)</dt>
              <dd>{n4(r.dG)} kJ</dd>
            </dl>
            <p className="mt-2">{criterioEspontaneidad(r.dH, r.dS)}</p>
            <DiagramaEntalpia dH={r.dH} />
            <PasoAPaso pasos={r.pasos.map((p) => ({ titulo: p }))} />
            <p className="mt-2 text-xs text-texto-suave">
              Datos: Chang, apéndice 3 <InsigniaRevision />
            </p>
          </div>
          <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
            <h3 className="font-semibold">ΔG en función de la temperatura</h3>
            <Slider etiqueta="Temperatura" valor={T} min={0} max={1500} paso={5} alCambiar={setT} formato={(t) => `${t.toFixed(0)} K (${(t - 273.15).toFixed(0)} °C)`} />
            <p className="mt-2 tabular-nums">
              ΔG = ΔH − TΔS = {n4(r.dH)} − {T.toFixed(0)} × {n4(r.dS / 1000)} = <strong>{n4(gibbs(r.dH, r.dS, T))} kJ</strong> → {gibbs(r.dH, r.dS, T) < 0 ? 'espontánea' : 'no espontánea'}
            </p>
            <div className="mt-2 h-[240px]" role="img" aria-label="Gráfica de ΔG frente a la temperatura">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curva} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
                  <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
                  <XAxis dataKey="T" type="number" domain={[0, 1500]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'T (K)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={56} />
                  <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(t) => `${t} K`} formatter={(y) => [`${y} kJ`, 'ΔG']} />
                  <ReferenceLine y={0} stroke="var(--texto-suave)" />
                  <ReferenceLine x={T} stroke="var(--acento)" strokeDasharray="4 3" />
                  {Tinv !== null && Tinv > 0 && Tinv < 1500 && <ReferenceLine x={Tinv} stroke="var(--aviso)" label={{ value: `${Tinv.toFixed(0)} K`, fill: 'var(--aviso)', fontSize: 11, position: 'insideTopRight' }} />}
                  <Line dataKey="dG" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-texto-suave">Aproximación: se supone que ΔH y ΔS no cambian con la temperatura.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ley de Hess ─────────────────────────────────────────────────────────────

const PROBLEMAS_HESS: { titulo: string; objetivo: string; datos: ReaccionHess[] }[] = [
  {
    titulo: 'Formación del CO',
    objetivo: 'C(grafito) + 1/2 O2(g) -> CO(g)',
    datos: [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'CO(g) + 1/2 O2(g) -> CO2(g)', dH: -283.0 },
    ],
  },
  {
    titulo: 'Formación del acetileno',
    objetivo: '2 C(grafito) + H2(g) -> C2H2(g)',
    datos: [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'H2(g) + 1/2 O2(g) -> H2O(l)', dH: -285.8 },
      { ecuacion: '2 C2H2(g) + 5 O2(g) -> 4 CO2(g) + 2 H2O(l)', dH: -2598.8 },
    ],
  },
  {
    titulo: 'Formación del metano',
    objetivo: 'C(grafito) + 2 H2(g) -> CH4(g)',
    datos: [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'H2(g) + 1/2 O2(g) -> H2O(l)', dH: -285.8 },
      { ecuacion: 'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)', dH: -890.4 },
    ],
  },
  {
    titulo: 'Grafito → diamante',
    objetivo: 'C(grafito) -> C(diamante)',
    datos: [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'C(diamante) + O2(g) -> CO2(g)', dH: -395.4 },
    ],
  },
];

const MULTIPLICADORES = ['-2', '-1', '-1/2', '0', '1/2', '1', '2'];

/** Suma Σ kᵢ·(ecuación i) y la escribe como ecuación (lo negativo a la izquierda). */
function sumar(vectores: Map<string, number>[], k: Fraccion[]) {
  const total = new Map<string, number>();
  vectores.forEach((v, i) => v.forEach((c, e) => total.set(e, (total.get(e) ?? 0) + c * k[i]!.aNumero())));
  const lado = (signo: number) =>
    [...total]
      .filter(([, c]) => Math.abs(c) > 1e-9 && Math.sign(c) === signo)
      .map(([e, c]) => `${Math.abs(c) === 1 ? '' : `${Number(Math.abs(c).toFixed(3))} `}${e}`)
      .join(' + ') || '0';
  return { total, texto: `${lado(-1)} -> ${lado(1)}` };
}

function Hess() {
  const [p, setP] = useState(0);
  const prob = PROBLEMAS_HESS[p]!;
  const [k, setK] = useState<string[]>(prob.datos.map(() => '1'));
  const [verSolucion, setVerSolucion] = useState(false);
  const fr = k.map((x) => {
    const [a, b] = x.split('/');
    return frac(Number(a), Number(b ?? 1));
  });
  const vectores = useMemo(() => prob.datos.map((d) => vectorEspecies(d.ecuacion)), [prob]);
  const objetivo = useMemo(() => vectorEspecies(prob.objetivo), [prob]);
  const suma = sumar(vectores, fr);
  const especies = new Set([...suma.total.keys(), ...objetivo.keys()]);
  const correcto = [...especies].every((e) => Math.abs((suma.total.get(e) ?? 0) - (objetivo.get(e) ?? 0)) < 1e-9);
  const dH = fr.reduce((s, f, i) => s + f.aNumero() * prob.datos[i]!.dH, 0);
  const sol = useMemo(() => hess(prob.objetivo, prob.datos), [prob]);
  const cambiar = (i: number) => {
    setP(i);
    setK(PROBLEMAS_HESS[i]!.datos.map(() => '1'));
    setVerSolucion(false);
  };
  return (
    <div className="space-y-4 text-sm">
      <label className="block">
        <span className="mb-1 block font-medium">Problema</span>
        <select value={p} onChange={(e) => cambiar(Number(e.target.value))} className={input}>
          {PROBLEMAS_HESS.map((x, i) => (
            <option key={x.titulo} value={i}>
              {x.titulo}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded-lg border border-borde bg-superficie p-4">
        <p className="font-medium">Reacción objetivo:</p>
        <Ce bloque>{ceTermo(prob.objetivo)}</Ce>
        <p className="mt-2 text-texto-suave">Elige por cuánto multiplicar cada ecuación (un número negativo la invierte) hasta que la suma dé la reacción objetivo.</p>
        <ol className="mt-3 space-y-2">
          {prob.datos.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3">
              <span className="w-5 text-texto-suave">{i + 1}.</span>
              <select value={k[i]} onChange={(e) => setK((s) => s.map((x, j) => (j === i ? e.target.value : x)))} className={`${input} w-20`} aria-label={`Multiplicador de la ecuación ${i + 1}`}>
                {MULTIPLICADORES.map((m) => (
                  <option key={m} value={m}>
                    × {m}
                  </option>
                ))}
              </select>
              <span className="order-last min-w-0 basis-full overflow-x-auto sm:order-none sm:basis-auto sm:flex-1">
                <Ce>{ceTermo(d.ecuacion)}</Ce>
              </span>
              <span className="tabular-nums">ΔH = {d.dH} kJ</span>
            </li>
          ))}
        </ol>
        <div className={`mt-4 rounded-md border p-3 ${correcto ? 'border-exito' : 'border-borde'}`} aria-live="polite">
          <p className="font-medium">Suma de las ecuaciones (las especies repetidas se cancelan):</p>
          <Ce bloque>{ceTermo(suma.texto)}</Ce>
          <p className="tabular-nums">
            ΔH = {fr.map((f, i) => `(${f.toString()})(${prob.datos[i]!.dH})`).join(' + ')} = <strong>{n4(dH)} kJ</strong>
          </p>
          <p className={correcto ? 'mt-1 font-semibold text-exito' : 'mt-1 text-texto-suave'}>{correcto ? '¡Correcto! La suma coincide con la reacción objetivo.' : 'Todavía no coincide con la reacción objetivo.'}</p>
        </div>
        <button type="button" onClick={() => setVerSolucion((v) => !v)} className="mt-3 rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2">
          {verSolucion ? 'Ocultar solución' : 'Mostrar solución'}
        </button>
        {verSolucion && (
          <div className="mt-2">
            <p>
              Multiplicadores: {sol.multiplicadores.map((m) => m.toString()).join(', ')} → ΔH = <strong>{n4(sol.dH)} kJ</strong>
            </p>
            <PasoAPaso abierto pasos={sol.pasos.map((x) => ({ titulo: x }))} />
          </div>
        )}
        <p className="mt-2 text-xs text-texto-suave">
          Entalpías de combustión del ejemplo: Chang <InsigniaRevision />
        </p>
      </div>
    </div>
  );
}

// ── Calorimetría ────────────────────────────────────────────────────────────

function Calorimetria() {
  const sustancias = Object.keys(CALORES_ESPECIFICOS);
  const [sus, setSus] = useState('agua líquida');
  const [m, setM] = useState(466);
  const [ti, setTi] = useState(8.5);
  const [tf, setTf] = useState(74.6);
  const c = CALORES_ESPECIFICOS[sus]!;
  const q = calor(m, c, tf - ti);
  // Mezcla: metal caliente en agua
  const [metal, setMetal] = useState('hierro');
  const [mm, setMm] = useState(50);
  const [tm, setTm] = useState(100);
  const [ma, setMa] = useState(200);
  const [ta, setTa] = useState(20);
  const cm = CALORES_ESPECIFICOS[metal]!, ca = CALORES_ESPECIFICOS['agua líquida']!;
  const Tf = temperaturaEquilibrio([
    { m: mm, c: cm, T: tm },
    { m: ma, c: ca, T: ta },
  ]);
  // Calorímetro de presión constante (vaso de café)
  const [mSol, setMSol] = useState(100);
  const [dT, setDT] = useState(6.6);
  const [nReac, setNReac] = useState(0.05);
  const qR = calorReaccion(mSol, dT);
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Calor sensible: q = m·c·ΔT</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Sustancia (c en J/(g·°C))</span>
          <select value={sus} onChange={(e) => setSus(e.target.value)} className={input}>
            {sustancias.map((s) => (
              <option key={s} value={s}>
                {s} ({CALORES_ESPECIFICOS[s]})
              </option>
            ))}
          </select>
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">m (g)</span>
            <input type="number" step="any" value={m} onChange={(e) => setM(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <label>
            <span className="mb-1 block">T inicial (°C)</span>
            <input type="number" step="any" value={ti} onChange={(e) => setTi(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <label>
            <span className="mb-1 block">T final (°C)</span>
            <input type="number" step="any" value={tf} onChange={(e) => setTf(Number(e.target.value))} className={`${input} w-24`} />
          </label>
        </div>
        <p className="mt-3">
          q = <strong>{n4(q / 1000)} kJ</strong> ({q >= 0 ? 'absorbido' : 'liberado'})
        </p>
        <PasoAPaso pasos={[{ titulo: 'Calor', tex: `q = mc\\Delta T = ${m}\\times${c}\\times(${tf} - ${ti}) = ${n4(q)}\\ \\text{J}` }]} />
        <p className="mt-2 text-xs text-texto-suave">
          Calores específicos: Chang, tabla 6.2 <InsigniaRevision />
        </p>
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Equilibrio térmico: sólido caliente en agua</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Sólido caliente</span>
          <select value={metal} onChange={(e) => setMetal(e.target.value)} className={input}>
            {sustancias
              .filter((s) => !['agua líquida', 'etanol'].includes(s))
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </select>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Slider etiqueta="m metal" valor={mm} min={10} max={500} unidad="g" alCambiar={setMm} />
          <Slider etiqueta="T metal" valor={tm} min={0} max={300} unidad="°C" alCambiar={setTm} />
          <Slider etiqueta="m agua" valor={ma} min={10} max={1000} unidad="g" alCambiar={setMa} />
          <Slider etiqueta="T agua" valor={ta} min={0} max={99} unidad="°C" alCambiar={setTa} />
        </div>
        <p className="mt-3">
          T final = <strong>{n4(Tf)} °C</strong>
        </p>
        <div className="mt-2 flex h-3 overflow-hidden rounded bg-superficie-2" aria-hidden>
          <div className="bg-error" style={{ width: `${Math.max(0, Math.min(100, (Tf / 300) * 100))}%` }} />
        </div>
        <PasoAPaso
          pasos={[
            { titulo: 'El calor que pierde el metal lo gana el agua', tex: 'm_mc_m(T_f - T_m) + m_ac_a(T_f - T_a) = 0' },
            { titulo: 'Despejando', tex: `T_f = \\dfrac{m_mc_mT_m + m_ac_aT_a}{m_mc_m + m_ac_a} = \\dfrac{${mm}\\times${cm}\\times${tm} + ${ma}\\times${ca}\\times${ta}}{${mm}\\times${cm} + ${ma}\\times${ca}} = ${n4(Tf)}` },
          ]}
        />
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Calorímetro a presión constante</h3>
        <p className="mt-1 text-texto-suave">Se mide el cambio de temperatura de la solución acuosa (c ≈ 4,184 J/(g·°C)).</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">m solución (g)</span>
            <input type="number" step="any" value={mSol} onChange={(e) => setMSol(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <label>
            <span className="mb-1 block">ΔT (°C)</span>
            <input type="number" step="any" value={dT} onChange={(e) => setDT(Number(e.target.value))} className={`${input} w-24`} />
          </label>
          <label>
            <span className="mb-1 block">mol que reaccionan</span>
            <input type="number" step="any" value={nReac} onChange={(e) => setNReac(Number(e.target.value))} className={`${input} w-24`} />
          </label>
        </div>
        <p className="mt-3">
          q_reacción = <strong>{n4(qR / 1000)} kJ</strong>; ΔH = <strong>{n4(qR / 1000 / nReac)} kJ/mol</strong>
        </p>
        <PasoAPaso
          pasos={[
            { titulo: 'Calor absorbido por la solución', tex: `q_{\\text{sol}} = mc\\Delta T = ${mSol}\\times4{,}184\\times${dT} = ${n4(-qR)}\\ \\text{J}` },
            { titulo: 'El de la reacción es igual y de signo contrario', tex: `q_{\\text{reac}} = -q_{\\text{sol}} = ${n4(qR)}\\ \\text{J}` },
            { titulo: 'Por mol', tex: `\\Delta H = \\dfrac{q_{\\text{reac}}}{n} = \\dfrac{${n4(qR / 1000)}\\ \\text{kJ}}{${nReac}\\ \\text{mol}} = ${n4(qR / 1000 / nReac)}\\ \\text{kJ/mol}` },
          ]}
        />
      </section>
    </div>
  );
}

export default function Termoquimica() {
  const [seccion, setSeccion] = useState<Seccion>('reaccion');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: termoquímica">
          <div className="space-y-4">
            <p>La entalpía (H) mide el calor intercambiado a presión constante. ΔH &lt; 0: exotérmica; ΔH &gt; 0: endotérmica.</p>
            <Formula tex="\Delta H^\circ_{\text{reac}} = \sum \nu\,\Delta H^\circ_f(\text{productos}) - \sum \nu\,\Delta H^\circ_f(\text{reactivos})" bloque />
            <p>La entalpía de formación de un elemento en su estado estándar (O₂(g), C(grafito)…) es cero.</p>
            <p>Ley de Hess: ΔH depende solo de los estados inicial y final. Si una ecuación se invierte, ΔH cambia de signo; si se multiplica por k, ΔH también.</p>
            <Formula tex="\Delta G = \Delta H - T\Delta S\qquad \Delta G < 0\ \Rightarrow\ \text{espontánea}\qquad T_{\text{inversión}} = \dfrac{\Delta H}{\Delta S}" bloque />
            <p>Calorimetría:</p>
            <Formula tex="q = mc\Delta T\qquad q = C\Delta T\qquad q_{\text{reac}} = -q_{\text{calorímetro}}" bloque />
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Termoquímica">
        {seccion === 'reaccion' && <Reaccion />}
        {seccion === 'hess' && <Hess />}
        {seccion === 'calorimetria' && <Calorimetria />}
      </Pestanas>
    </div>
  );
}
