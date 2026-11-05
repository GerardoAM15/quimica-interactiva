import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { aMhchem, masaMolar } from '@/chem/formula';
import {
  aumentoEbullicion,
  CONSTANTES_COLIGATIVAS,
  descensoCongelacion,
  dilucion,
  masaMolarCrioscopia,
  mezcla,
  presionOsmotica,
  raoult,
  SOLUBILIDAD,
  solubilidadA,
} from '@/chem/solutions';
import { R_LATM } from '@/chem/constants';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Seccion = 'preparar' | 'dilucion' | 'solubilidad' | 'coligativas';
const SECCIONES = [
  { id: 'preparar', titulo: 'Preparar una solución' },
  { id: 'dilucion', titulo: 'Dilución y mezcla' },
  { id: 'solubilidad', titulo: 'Solubilidad' },
  { id: 'coligativas', titulo: 'Propiedades coligativas' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const n4 = (x: number) => (Number.isFinite(x) ? Number(x.toPrecision(4)).toLocaleString('es-PE') : '—');
const COLORES = ['#38bdf8', '#f97316', '#a855f7', '#22c55e', '#f472b6'];

/**
 * Solutos de ejemplo. θ: número de H⁺, OH⁻ o carga total del catión (para la normalidad).
 * i: factor de Van 't Hoff ideal (iones por fórmula). El color es solo ilustrativo.
 */
const SOLUTOS = [
  { formula: 'NaCl', anhidro: 'NaCl', nombre: 'cloruro de sodio', theta: 1, i: 2, color: null },
  { formula: 'CuSO4·5H2O', anhidro: 'CuSO4', nombre: 'sulfato de cobre(II) pentahidratado', theta: 2, i: 2, color: '#2f7fe0' },
  { formula: 'KMnO4', anhidro: 'KMnO4', nombre: 'permanganato de potasio', theta: 1, i: 2, color: '#8b2fc9' },
  { formula: 'K2Cr2O7', anhidro: 'K2Cr2O7', nombre: 'dicromato de potasio', theta: 2, i: 3, color: '#f07a1a' },
  { formula: 'NiCl2·6H2O', anhidro: 'NiCl2', nombre: 'cloruro de níquel(II) hexahidratado', theta: 2, i: 3, color: '#2fa35a' },
  { formula: 'NaOH', anhidro: 'NaOH', nombre: 'hidróxido de sodio', theta: 1, i: 2, color: null },
  { formula: 'C6H12O6', anhidro: 'C6H12O6', nombre: 'glucosa', theta: 0, i: 1, color: null },
] as const;

/** Vaso de precipitados: altura del líquido ∝ volumen; intensidad del color ∝ concentración. */
function Vaso({ volumen, maximo = 1000, color, intensidad, rotulo }: { volumen: number; maximo?: number; color: string | null; intensidad: number; rotulo: string }) {
  const h = 160, w = 120, x0 = 20, y0 = 20;
  const nivel = Math.max(0, Math.min(1, volumen / maximo)) * (h - 10);
  const relleno = color ?? 'var(--acento)';
  const opacidad = color ? 0.15 + 0.8 * Math.min(1, intensidad) : 0.18;
  // Partículas de soluto (posiciones pseudoaleatorias fijas)
  const n = Math.min(120, Math.round(intensidad * 60));
  // Secuencia R2 (baja discrepancia): puntos bien repartidos sin patrones visibles
  const frac = (x: number) => x - Math.floor(x);
  const puntos = Array.from({ length: n }, (_, k) => ({ x: x0 + 6 + frac(0.5 + 0.7548776662 * (k + 1)) * (w - 12), y: y0 + h - 4 - frac(0.5 + 0.569840291 * (k + 1)) * Math.max(0, nivel - 8) }));
  return (
    <svg viewBox="0 0 160 210" className="h-52 w-40" role="img" aria-label={rotulo}>
      <rect x={x0} y={y0 + h - nivel} width={w} height={nivel} fill={relleno} opacity={opacidad} />
      {puntos.map((p, k) => (
        <circle key={k} cx={p.x} cy={p.y} r={1.6} fill={color ?? 'var(--texto-suave)'} opacity={0.8} />
      ))}
      <path d={`M${x0 - 6} ${y0 - 4} L${x0} ${y0} L${x0} ${y0 + h} L${x0 + w} ${y0 + h} L${x0 + w} ${y0}`} fill="none" stroke="var(--texto-suave)" strokeWidth={2.5} />
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f}>
          <line x1={x0 + w - 18} x2={x0 + w} y1={y0 + h - f * (h - 10)} y2={y0 + h - f * (h - 10)} stroke="var(--texto-suave)" />
          <text x={x0 + w - 20} y={y0 + h - f * (h - 10) + 3} textAnchor="end" fontSize={9} fill="var(--texto-suave)">
            {Math.round(f * maximo)}
          </text>
        </g>
      ))}
      <text x={80} y={205} textAnchor="middle" fontSize={11} fill="var(--texto)">
        {rotulo}
      </text>
    </svg>
  );
}

function Preparar() {
  const [k, setK] = useState(1);
  const [masa, setMasa] = useState(12.5);
  const [vol, setVol] = useState(250);
  const [rho, setRho] = useState(1.0);
  const s = SOLUTOS[k]!;
  const Mh = masaMolar(s.formula), Ma = masaMolar(s.anhidro);
  const n = masa / Mh;
  const L = vol / 1000;
  const M = n / L;
  const mSoluto = n * Ma; // masa de la sal anhidra
  const mSolucion = rho * vol;
  const mSolvente = mSolucion - mSoluto;
  const molal = n / (mSolvente / 1000);
  const nAgua = mSolvente / masaMolar('H2O');
  const x = n / (n + nAgua);
  const ok = n > 0 && L > 0 && mSolvente > 0;
  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center">
        <Vaso volumen={vol} color={s.color} intensidad={M / 0.4} rotulo={`${n4(M)} M`} />
      </div>
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Soluto</span>
          <select value={k} onChange={(e) => setK(Number(e.target.value))} className={input}>
            {SOLUTOS.map((x, i) => (
              <option key={x.formula} value={i}>
                {x.nombre} ({x.formula})
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <Slider etiqueta="Masa pesada" valor={masa} min={0.5} max={100} paso={0.5} unidad="g" alCambiar={setMasa} />
          <Slider etiqueta="Volumen de solución" valor={vol} min={50} max={1000} paso={10} unidad="mL" alCambiar={setVol} />
          <Slider etiqueta="Densidad de la solución" valor={rho} min={0.9} max={1.5} paso={0.01} unidad="g/mL" alCambiar={setRho} formato={(v) => v.toFixed(2)} />
        </div>
        {ok ? (
          <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
            <dl className="grid max-w-lg grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums">
              <dt>Moles de soluto</dt>
              <dd>{n4(n)} mol</dd>
              <dt>Molaridad</dt>
              <dd className="font-semibold">{n4(M)} mol/L</dd>
              {s.theta > 0 && (
                <>
                  <dt>Normalidad (θ = {s.theta})</dt>
                  <dd>{n4(M * s.theta)} eq/L</dd>
                </>
              )}
              <dt>Concentración en masa</dt>
              <dd>{n4(mSoluto / L)} g/L</dd>
              <dt>%m/V</dt>
              <dd>{n4((100 * mSoluto) / vol)} %</dd>
              <dt>%m/m</dt>
              <dd>{n4((100 * mSoluto) / mSolucion)} %</dd>
              <dt>Molalidad</dt>
              <dd>{n4(molal)} mol/kg</dd>
              <dt>Fracción molar del soluto</dt>
              <dd>{n4(x)}</dd>
              <dt>ppm (mg/L)</dt>
              <dd>{n4((mSoluto * 1000) / L)}</dd>
            </dl>
            <p className="mt-2 text-xs text-texto-suave">
              %m/m, molalidad y fracción molar dependen de la densidad de la solución, que debe medirse; 1,00 g/mL es solo una aproximación para soluciones diluidas.
              {s.formula !== s.anhidro && ' En un hidrato, el agua de cristalización pasa a formar parte del solvente.'}
            </p>
            <PasoAPaso
              pasos={[
                { titulo: `Moles: n = m/M = ${masa} g ÷ ${n4(Mh)} g/mol = ${n4(n)} mol` },
                { titulo: 'Molaridad', tex: `M = \\dfrac{n}{V(\\text{L})} = \\dfrac{${n4(n)}}{${L}} = ${n4(M)}\\ \\text{mol/L}` },
                ...(s.theta > 0 ? [{ titulo: 'Normalidad', tex: `N = M\\cdot\\theta = ${n4(M)}\\times${s.theta} = ${n4(M * s.theta)}` }] : []),
                { titulo: `Masa de solución = ρ·V = ${rho} × ${vol} = ${n4(mSolucion)} g; de solvente = ${n4(mSolucion)} − ${n4(mSoluto)} = ${n4(mSolvente)} g` },
                { titulo: 'Molalidad', tex: `m = \\dfrac{n}{\\text{kg de solvente}} = \\dfrac{${n4(n)}}{${n4(mSolvente / 1000)}} = ${n4(molal)}\\ \\text{mol/kg}` },
              ]}
            />
          </div>
        ) : (
          <p className="text-sm text-aviso">Con esos datos la masa de solvente sería negativa: aumenta el volumen o la densidad.</p>
        )}
      </div>
    </div>
  );
}

type Incognita = 'c1' | 'v1' | 'c2' | 'v2';

function Dilucion() {
  const [inc, setInc] = useState<Incognita>('v1');
  const [vals, setVals] = useState({ c1: 2, v1: 100, c2: 0.4, v2: 500 });
  const r = dilucion(inc === 'c1' ? null : vals.c1, inc === 'v1' ? null : vals.v1, inc === 'c2' ? null : vals.c2, inc === 'v2' ? null : vals.v2);
  const final = { ...vals, [inc]: r };
  const [mezclas, setMezclas] = useState([
    { c: 1, v: 200 },
    { c: 3, v: 300 },
  ]);
  const cMezcla = mezcla(mezclas);
  const vTotal = mezclas.reduce((s, x) => s + x.v, 0);
  const campo = (k: Incognita, etiqueta: string) => (
    <label className="text-sm">
      <span className="mb-1 block">{etiqueta}</span>
      <input type="number" step="any" min={0} value={inc === k ? Number(r.toPrecision(4)) : vals[k]} disabled={inc === k} onChange={(e) => setVals({ ...vals, [k]: Number(e.target.value) })} className={`${input} w-28 disabled:opacity-60`} />
    </label>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Dilución: C₁V₁ = C₂V₂</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Incógnita</span>
          <select value={inc} onChange={(e) => setInc(e.target.value as Incognita)} className={input}>
            <option value="c1">C₁ (concentrada)</option>
            <option value="v1">V₁ (alícuota a tomar)</option>
            <option value="c2">C₂ (final)</option>
            <option value="v2">V₂ (volumen final)</option>
          </select>
        </label>
        <div className="mt-3 flex flex-wrap gap-3">
          {campo('c1', 'C₁ (M)')}
          {campo('v1', 'V₁ (mL)')}
          {campo('c2', 'C₂ (M)')}
          {campo('v2', 'V₂ (mL)')}
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-center gap-2">
          <Vaso volumen={final.v1} color="#2f7fe0" intensidad={final.c1 / 2} rotulo={`${n4(final.v1)} mL de ${n4(final.c1)} M`} />
          <span className="pb-24 text-2xl" aria-hidden>
            →
          </span>
          <Vaso volumen={final.v2} color="#2f7fe0" intensidad={final.c2 / 2} rotulo={`${n4(final.v2)} mL de ${n4(final.c2)} M`} />
        </div>
        {final.c2 > final.c1 && <p className="text-aviso">Al diluir, la concentración final debe ser menor que la inicial.</p>}
        <PasoAPaso
          pasos={[
            { titulo: 'Los moles de soluto no cambian al agregar solvente', tex: 'n = C_1V_1 = C_2V_2' },
            { titulo: `Resultado: ${inc} = ${n4(r)} ${inc.startsWith('c') ? 'M' : 'mL'}`, tex: `${n4(final.c1)}\\times${n4(final.v1)} = ${n4(final.c2)}\\times${n4(final.v2)}` },
            ...(inc === 'v1' ? [{ titulo: `Se toman ${n4(r)} mL de la solución concentrada y se completa con agua hasta ${final.v2} mL.` }] : []),
          ]}
        />
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Mezcla de soluciones del mismo soluto</h3>
        <ul className="mt-2 space-y-2">
          {mezclas.map((x, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              Solución {i + 1}:
              <input type="number" step="any" min={0} value={x.c} onChange={(e) => setMezclas((s) => s.map((y, j) => (j === i ? { ...y, c: Number(e.target.value) } : y)))} className={`${input} w-20`} aria-label={`Concentración ${i + 1}`} />
              M,
              <input type="number" step="any" min={0} value={x.v} onChange={(e) => setMezclas((s) => s.map((y, j) => (j === i ? { ...y, v: Number(e.target.value) } : y)))} className={`${input} w-24`} aria-label={`Volumen ${i + 1}`} />
              mL
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setMezclas((s) => [...s, { c: 0, v: 100 }])} className="mt-2 rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2" disabled={mezclas.length >= 4}>
          Agregar solución (agua: 0 M)
        </button>
        <p className="mt-3 text-lg">
          C final = <strong>{n4(cMezcla)} M</strong> en {vTotal} mL
        </p>
        <PasoAPaso
          pasos={[
            { titulo: 'Se suman los moles y los volúmenes (volúmenes aditivos)', tex: 'C = \\dfrac{\\sum C_iV_i}{\\sum V_i}' },
            { titulo: 'Cálculo', tex: `C = \\dfrac{${mezclas.map((x) => `${x.c}\\times${x.v}`).join(' + ')}}{${vTotal}} = ${n4(cMezcla)}\\ \\text{M}` },
          ]}
        />
      </section>
    </div>
  );
}

function Solubilidad() {
  const sales = Object.keys(SOLUBILIDAD);
  const [sal, setSal] = useState(sales[0]!);
  const [T, setT] = useState(40);
  const [g, setG] = useState(50);
  const datos = useMemo(() => {
    const ts = [...new Set(Object.values(SOLUBILIDAD).flatMap((s) => s.puntos.map((p) => p[0])))].sort((a, b) => a - b);
    return ts.map((t) => Object.fromEntries([['T', t], ...sales.map((s) => [s, SOLUBILIDAD[s]!.puntos.find((p) => p[0] === t)?.[1] ?? null])]));
  }, [sales]);
  const s = solubilidadA(sal, T);
  const estado = s === null ? null : Math.abs(g - s) < 0.5 ? 'saturada' : g < s ? 'insaturada' : 'sobresaturada (el exceso precipita)';
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="h-[380px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Curvas de solubilidad en agua frente a la temperatura">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="T" type="number" domain={[0, 100]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'T (°C)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={50} label={{ value: 'g / 100 g de agua', angle: -90, position: 'insideLeft', fill: 'var(--texto-suave)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(t) => `${t} °C`} />
            <Legend verticalAlign="top" />
            <ReferenceLine x={T} stroke="var(--texto-suave)" strokeDasharray="4 3" />
            {sales.map((x, i) => (
              <Line key={x} dataKey={x} stroke={COLORES[i % COLORES.length]} strokeWidth={x === sal ? 3 : 1.5} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
            ))}
            <ReferenceDot x={T} y={g} r={6} fill="var(--texto)" stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block font-medium">Sal</span>
          <select value={sal} onChange={(e) => setSal(e.target.value)} className={input}>
            {sales.map((x) => (
              <option key={x} value={x}>
                {x} ({SOLUBILIDAD[x]!.formula})
              </option>
            ))}
          </select>
        </label>
        <Slider etiqueta="Temperatura" valor={T} min={0} max={100} unidad="°C" alCambiar={setT} />
        <Slider etiqueta="Soluto en 100 g de agua" valor={g} min={0} max={250} unidad="g" alCambiar={setG} />
        <div className="rounded-lg border border-borde bg-superficie p-3">
          {s === null ? (
            <p>No hay datos de esta sal a {T} °C.</p>
          ) : (
            <>
              <p>
                Solubilidad de <Ce>{aMhchem(SOLUBILIDAD[sal]!.formula)}</Ce> a {T} °C: <strong>{n4(s)} g/100 g</strong>
              </p>
              <p className="mt-1">
                Con {g} g la solución está <strong>{estado}</strong>.
              </p>
              {g > s && <p className="mt-1">Precipitan ≈ {n4(g - s)} g al alcanzar el equilibrio.</p>}
            </>
          )}
          <p className="mt-2 text-xs text-texto-suave">
            Valores entre los puntos tabulados obtenidos por interpolación lineal. La solubilidad del Ce₂(SO₄)₃ disminuye al calentar. <InsigniaRevision />
          </p>
        </div>
      </div>
    </div>
  );
}

function Coligativas() {
  const [solv, setSolv] = useState('agua');
  const [m, setM] = useState(1);
  const [i, setI] = useState(1);
  const c = CONSTANTES_COLIGATIVAS[solv]!;
  const dTe = aumentoEbullicion(m, c.Ke, i);
  const dTc = descensoCongelacion(m, c.Kc, i);
  const [Mo, setMo] = useState(0.7);
  const [To, setTo] = useState(25);
  const pi = presionOsmotica(Mo, To + 273.15, i);
  const [x, setX] = useState(0.95);
  const [P0, setP0] = useState(23.76);
  const [gS, setGS] = useState(7.85);
  const [kg, setKg] = useState(0.301);
  const [dT, setDT] = useState(1.05);
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Ebulloscopía y crioscopía</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1 block font-medium">Solvente</span>
            <select value={solv} onChange={(e) => setSolv(e.target.value)} className={input}>
              {Object.entries(CONSTANTES_COLIGATIVAS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.nombre} (Kₑ = {v.Ke}, K_c = {v.Kc})
                </option>
              ))}
            </select>
          </label>
          <Slider etiqueta="Molalidad" valor={m} min={0} max={5} paso={0.05} unidad="mol/kg" alCambiar={setM} />
          <Slider etiqueta="Factor de Van 't Hoff, i" valor={i} min={1} max={4} paso={0.1} alCambiar={setI} formato={(v) => v.toFixed(1)} />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-8">
          {/* Termómetros: temperatura normal (gris) y de la solución (acento) */}
          {[
            { titulo: 'Ebullición', puro: c.Te, sol: c.Te + dTe },
            { titulo: 'Congelación', puro: c.Tc, sol: c.Tc - dTc },
          ].map((t) => (
            <figure key={t.titulo} className="text-center">
              <svg viewBox="0 0 120 180" className="h-44 w-28" role="img" aria-label={`${t.titulo}: solvente puro ${t.puro} °C, solución ${n4(t.sol)} °C`}>
                <rect x={50} y={10} width={20} height={140} rx={10} fill="none" stroke="var(--texto-suave)" strokeWidth={2} />
                <circle cx={60} cy={158} r={14} fill="var(--error)" />
                {(() => {
                  const y = (v: number) => 80 - (v - t.puro) * 12;
                  const ys = Math.max(14, Math.min(146, y(t.sol)));
                  return (
                    <>
                      <rect x={55} y={ys} width={10} height={150 - ys} fill="var(--error)" />
                      <line x1={40} x2={80} y1={80} y2={80} stroke="var(--texto-suave)" strokeDasharray="3 2" />
                      <text x={84} y={83} fontSize={10} fill="var(--texto-suave)">
                        {t.puro} °C
                      </text>
                      <text x={36} y={ys + 4} fontSize={10} textAnchor="end" fill="var(--texto)">
                        {n4(t.sol)}
                      </text>
                    </>
                  );
                })()}
              </svg>
              <figcaption className="text-xs">{t.titulo}</figcaption>
            </figure>
          ))}
          <div className="tabular-nums">
            <p>
              ΔTₑ = i·Kₑ·m = {i.toFixed(1)} × {c.Ke} × {m} = <strong>{n4(dTe)} °C</strong> → Tₑ = {n4(c.Te + dTe)} °C
            </p>
            <p>
              ΔT_c = i·K_c·m = {i.toFixed(1)} × {c.Kc} × {m} = <strong>{n4(dTc)} °C</strong> → T_c = {n4(c.Tc - dTc)} °C
            </p>
            <p className="mt-2 text-xs text-texto-suave">
              Constantes: Chang, tabla 12.2 <InsigniaRevision />
            </p>
          </div>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <h3 className="font-semibold">Presión osmótica</h3>
          <div className="mt-2 flex gap-3">
            <label>
              <span className="mb-1 block">M (mol/L)</span>
              <input type="number" step="any" value={Mo} onChange={(e) => setMo(Number(e.target.value))} className={`${input} w-24`} />
            </label>
            <label>
              <span className="mb-1 block">T (°C)</span>
              <input type="number" step="any" value={To} onChange={(e) => setTo(Number(e.target.value))} className={`${input} w-24`} />
            </label>
          </div>
          <p className="mt-2">
            π = <strong>{n4(pi)} atm</strong> (i = {i.toFixed(1)})
          </p>
          <PasoAPaso pasos={[{ titulo: 'Van \'t Hoff', tex: `\\pi = iMRT = ${i.toFixed(1)}\\times${Mo}\\times${R_LATM.toFixed(5)}\\times${n4(To + 273.15)} = ${n4(pi)}\\ \\text{atm}` }]} />
        </section>
        <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <h3 className="font-semibold">Ley de Raoult</h3>
          <div className="mt-2 flex gap-3">
            <label>
              <span className="mb-1 block">x del solvente</span>
              <input type="number" step="any" min={0} max={1} value={x} onChange={(e) => setX(Number(e.target.value))} className={`${input} w-24`} />
            </label>
            <label>
              <span className="mb-1 block">P° (mmHg)</span>
              <input type="number" step="any" value={P0} onChange={(e) => setP0(Number(e.target.value))} className={`${input} w-24`} />
            </label>
          </div>
          <p className="mt-2">
            P = <strong>{n4(raoult(x, P0))} mmHg</strong> (descenso: {n4(P0 - raoult(x, P0))} mmHg)
          </p>
          <PasoAPaso pasos={[{ titulo: 'Presión de vapor de la solución', tex: `P = x_{\\text{solv}}\\,P^\\circ = ${x}\\times${P0} = ${n4(raoult(x, P0))}` }]} />
        </section>
        <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <h3 className="font-semibold">Masa molar por crioscopía</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            <label>
              <span className="mb-1 block">Soluto (g)</span>
              <input type="number" step="any" value={gS} onChange={(e) => setGS(Number(e.target.value))} className={`${input} w-20`} />
            </label>
            <label>
              <span className="mb-1 block">Solvente (kg)</span>
              <input type="number" step="any" value={kg} onChange={(e) => setKg(Number(e.target.value))} className={`${input} w-20`} />
            </label>
            <label>
              <span className="mb-1 block">ΔT_c (°C)</span>
              <input type="number" step="any" value={dT} onChange={(e) => setDT(Number(e.target.value))} className={`${input} w-20`} />
            </label>
          </div>
          <p className="mt-2">
            M = <strong>{n4(masaMolarCrioscopia(gS, kg, dT, c.Kc, i))} g/mol</strong> ({c.nombre})
          </p>
          <PasoAPaso
            pasos={[
              { titulo: 'Molalidad a partir del descenso', tex: `m = \\dfrac{\\Delta T_c}{iK_c} = \\dfrac{${dT}}{${i.toFixed(1)}\\times${c.Kc}} = ${n4(dT / (i * c.Kc))}\\ \\text{mol/kg}` },
              { titulo: 'Masa molar', tex: `M = \\dfrac{g}{m\\cdot\\text{kg}} = \\dfrac{${gS}}{${n4(dT / (i * c.Kc))}\\times${kg}} = ${n4(masaMolarCrioscopia(gS, kg, dT, c.Kc, i))}` },
            ]}
          />
        </section>
      </div>
    </div>
  );
}

export default function Soluciones() {
  const [seccion, setSeccion] = useState<Seccion>('preparar');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: soluciones">
          <div className="space-y-4">
            <p>Una solución es una mezcla homogénea de soluto (en menor proporción) y solvente.</p>
            <Formula tex="M = \dfrac{n_{\text{soluto}}}{V_{\text{sol}}(\text{L})}\qquad m = \dfrac{n_{\text{soluto}}}{\text{kg de solvente}}\qquad N = M\cdot\theta\qquad x_i = \dfrac{n_i}{n_{\text{total}}}" bloque />
            <Formula tex="\%m/m = \dfrac{m_{\text{soluto}}}{m_{\text{sol}}}\times100\qquad M = \dfrac{10\cdot\%m/m\cdot\rho}{\overline{M}}\quad(\rho\ \text{en g/mL})" bloque />
            <p>θ es el número de H⁺ que cede un ácido, de OH⁻ de una base, o la carga total positiva de una sal.</p>
            <Formula tex="C_1V_1 = C_2V_2\qquad C_{\text{mezcla}} = \dfrac{\sum C_iV_i}{\sum V_i}" bloque />
            <p>Las propiedades coligativas dependen del número de partículas disueltas, no de su naturaleza (i = factor de Van 't Hoff):</p>
            <Formula tex="\Delta T_e = iK_em\qquad \Delta T_c = iK_cm\qquad \pi = iMRT\qquad P = x_{\text{solv}}P^\circ" bloque />
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Soluciones">
        {seccion === 'preparar' && <Preparar />}
        {seccion === 'dilucion' && <Dilucion />}
        {seccion === 'solubilidad' && <Solubilidad />}
        {seccion === 'coligativas' && <Coligativas />}
      </Pestanas>
    </div>
  );
}
