import { useMemo, useState, type ReactNode } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { masaMolar } from '@/chem/formula';
import {
  aAtm,
  compresibilidad,
  dalton,
  desdeAtm,
  gasIdeal,
  masaMolarGraham,
  maxwellBoltzmann,
  presionVdW,
  relacionGraham,
  VAN_DER_WAALS,
  vMasProbable,
  vMedia,
  vRms,
  type UnidadPresion,
  type Variable,
} from '@/chem/gases';
import { R_LATM } from '@/chem/constants';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { CajaGases } from './CajaGases';

type Seccion = 'caja' | 'ecuacion' | 'mb' | 'real' | 'mezclas';
const SECCIONES = [
  { id: 'caja', titulo: 'Caja con pistón' },
  { id: 'ecuacion', titulo: 'PV = nRT' },
  { id: 'mb', titulo: 'Maxwell-Boltzmann' },
  { id: 'real', titulo: 'Gas real' },
  { id: 'mezclas', titulo: 'Dalton y Graham' },
] as const;

const GASES = ['He', 'Ne', 'Ar', 'Xe', 'H2', 'N2', 'O2', 'CO2', 'CH4', 'NH3', 'Cl2'] as const;
const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const n3 = (x: number) => Number(x.toPrecision(4)).toLocaleString('es-PE');
const COLORES = ['var(--acento)', '#f97316', '#a855f7', '#22c55e'];

function SelectorGas({ valor, alCambiar, etiqueta = 'Gas', opciones = GASES as readonly string[] }: { valor: string; alCambiar: (g: string) => void; etiqueta?: string; opciones?: readonly string[] }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium">{etiqueta}</span>
      <select value={valor} onChange={(e) => alCambiar(e.target.value)} className={input}>
        {opciones.map((g) => (
          <option key={g} value={g}>
            {g} ({VAN_DER_WAALS[g]?.nombre ?? g}, {masaMolar(g).toFixed(2)} g/mol)
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Caja con pistón ─────────────────────────────────────────────────────────

type Constante = 'V' | 'P';
const VMIN = 5, VMAX = 50;

function Caja() {
  const [gas, setGas] = useState('N2');
  const [n, setN] = useState(2);
  const [T, setT] = useState(300);
  const [Vfijo, setVfijo] = useState(30);
  const [Pfija, setPfija] = useState(2);
  const [modo, setModo] = useState<Constante>('V');
  const [pausado, setPausado] = useState(false);
  const M = masaMolar(gas);
  // Pistón fijo: P = nRT/V.  Pistón libre a presión externa constante: V = nRT/P (con topes)
  let V = modo === 'V' ? Vfijo : gasIdeal({ n, T, P: Pfija }, 'V');
  const tope = V < VMIN || V > VMAX;
  V = Math.min(VMAX, Math.max(VMIN, V));
  const P = gasIdeal({ n, T, V }, 'P');
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <CajaGases V={V} T={T} n={n} M={M} Vmax={VMAX} pausado={pausado} />
      <div className="space-y-4">
        <SelectorGas valor={gas} alCambiar={setGas} />
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium">El pistón está…</legend>
          <label className="mr-4">
            <input type="radio" name="modo" checked={modo === 'V'} onChange={() => setModo('V')} /> fijo (V constante)
          </label>
          <label>
            <input type="radio" name="modo" checked={modo === 'P'} onChange={() => setModo('P')} /> libre (P constante)
          </label>
        </fieldset>
        {modo === 'V' ? (
          <Slider etiqueta="Volumen" valor={Vfijo} min={VMIN} max={VMAX} paso={0.5} unidad="L" alCambiar={setVfijo} />
        ) : (
          <Slider etiqueta="Presión externa" valor={Pfija} min={0.2} max={20} paso={0.1} unidad="atm" alCambiar={setPfija} />
        )}
        <Slider etiqueta="Temperatura" valor={T} min={100} max={1000} paso={5} alCambiar={setT} formato={(t) => `${t} K (${(t - 273.15).toFixed(0)} °C)`} />
        <Slider etiqueta="Cantidad de gas" valor={n} min={0.5} max={5} paso={0.1} unidad="mol" alCambiar={setN} />
        <button type="button" onClick={() => setPausado((p) => !p)} className="rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2">
          {pausado ? 'Reanudar' : 'Pausar'}
        </button>
        <div className="rounded-lg border border-borde bg-superficie p-3 text-sm">
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 tabular-nums">
            <dt>Presión</dt>
            <dd className="font-semibold">{n3(P)} atm</dd>
            <dt>Volumen</dt>
            <dd>{n3(V)} L</dd>
            <dt>v_rms</dt>
            <dd>{n3(vRms(M, T))} m/s</dd>
          </dl>
          {tope && <p className="mt-2 text-aviso">El pistón llegó a su tope: el volumen ya no puede cambiar y la presión interna difiere de la externa.</p>}
          <p className="mt-2 text-xs text-texto-suave">
            {modo === 'V'
              ? 'Con el pistón fijo, al subir T aumenta P (Gay-Lussac); al bajar V aumenta P (Boyle).'
              : 'Con presión constante, al subir T el pistón se desplaza y aumenta V (Charles).'}
          </p>
          <PasoAPaso
            pasos={[
              { titulo: 'Ecuación de estado', tex: 'PV = nRT' },
              modo === 'V'
                ? { titulo: 'Presión', tex: `P = \\dfrac{nRT}{V} = \\dfrac{${n}\\times${R_LATM.toFixed(5)}\\times${T}}{${n3(V)}} = ${n3(P)}\\ \\text{atm}` }
                : { titulo: 'Volumen', tex: `V = \\dfrac{nRT}{P} = \\dfrac{${n}\\times${R_LATM.toFixed(5)}\\times${T}}{${Pfija}} = ${n3(gasIdeal({ n, T, P: Pfija }, 'V'))}\\ \\text{L}` },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ── Calculadora PV = nRT ────────────────────────────────────────────────────

function Ecuacion() {
  const [incognita, setIncognita] = useState<Variable>('P');
  const [P, setP] = useState(1);
  const [uP, setUP] = useState<UnidadPresion>('atm');
  const [V, setV] = useState(30.4);
  const [n, setN] = useState(6.9);
  const [tC, setTC] = useState(62);
  const datos = { P: aAtm(P, uP), V, n, T: tC + 273.15 };
  const r = gasIdeal(datos, incognita);
  const valido = Number.isFinite(r) && r > 0;
  const textoR = incognita === 'P' ? `${n3(desdeAtm(r, uP))} ${uP}` : incognita === 'V' ? `${n3(r)} L` : incognita === 'n' ? `${n3(r)} mol` : `${n3(r)} K (${n3(r - 273.15)} °C)`;
  const despeje: Record<Variable, string> = {
    P: `P = \\dfrac{nRT}{V} = \\dfrac{${n}\\times0{,}08206\\times${n3(datos.T)}}{${V}}`,
    V: `V = \\dfrac{nRT}{P} = \\dfrac{${n}\\times0{,}08206\\times${n3(datos.T)}}{${n3(datos.P)}}`,
    n: `n = \\dfrac{PV}{RT} = \\dfrac{${n3(datos.P)}\\times${V}}{0{,}08206\\times${n3(datos.T)}}`,
    T: `T = \\dfrac{PV}{nR} = \\dfrac{${n3(datos.P)}\\times${V}}{${n}\\times0{,}08206}`,
  };
  const campo = (v: Variable, contenido: ReactNode) => (
    <div className={incognita === v ? 'opacity-40' : ''} aria-disabled={incognita === v}>
      {contenido}
    </div>
  );
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block font-medium">Calcular</span>
          <select value={incognita} onChange={(e) => setIncognita(e.target.value as Variable)} className={input}>
            <option value="P">presión (P)</option>
            <option value="V">volumen (V)</option>
            <option value="n">moles (n)</option>
            <option value="T">temperatura (T)</option>
          </select>
        </label>
        {campo(
          'P',
          <div className="flex items-end gap-2">
            <label>
              <span className="mb-1 block">P</span>
              <input type="number" step="any" value={P} disabled={incognita === 'P'} onChange={(e) => setP(Number(e.target.value))} className={`${input} w-28`} />
            </label>
            <select value={uP} onChange={(e) => setUP(e.target.value as UnidadPresion)} className={input} aria-label="Unidad de presión">
              <option value="atm">atm</option>
              <option value="mmHg">mmHg</option>
              <option value="kPa">kPa</option>
            </select>
          </div>,
        )}
        {campo(
          'V',
          <label>
            <span className="mb-1 block">V (L)</span>
            <input type="number" step="any" value={V} disabled={incognita === 'V'} onChange={(e) => setV(Number(e.target.value))} className={`${input} w-28`} />
          </label>,
        )}
        {campo(
          'n',
          <label>
            <span className="mb-1 block">n (mol)</span>
            <input type="number" step="any" value={n} disabled={incognita === 'n'} onChange={(e) => setN(Number(e.target.value))} className={`${input} w-28`} />
          </label>,
        )}
        {campo(
          'T',
          <label>
            <span className="mb-1 block">T (°C)</span>
            <input type="number" step="any" value={tC} disabled={incognita === 'T'} onChange={(e) => setTC(Number(e.target.value))} className={`${input} w-28`} />
          </label>,
        )}
      </div>
      <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        {valido ? (
          <>
            <p className="text-lg">
              Resultado: <strong>{textoR}</strong>
            </p>
            <PasoAPaso
              abierto
              pasos={[
                { titulo: 'Unidades: P en atm, V en L, T en K; R = 0,08206 L·atm/(mol·K)', detalle: `T = ${tC} + 273,15 = ${n3(datos.T)} K${uP !== 'atm' && incognita !== 'P' ? `; P = ${P} ${uP} = ${n3(datos.P)} atm` : ''}` },
                { titulo: 'Despejar de PV = nRT', tex: despeje[incognita] },
                { titulo: `Resultado: ${textoR}` },
              ]}
            />
          </>
        ) : (
          <p className="text-aviso">Revisa los datos: deben ser positivos (T en kelvin &gt; 0).</p>
        )}
      </div>
    </div>
  );
}

// ── Maxwell-Boltzmann ───────────────────────────────────────────────────────

function DistribucionMB() {
  const [gases, setGases] = useState<string[]>(['N2', 'He']);
  const [T, setT] = useState(300);
  const [T2, setT2] = useState<number | null>(null);
  const curvas = useMemo(() => {
    const series = [...gases.map((g) => ({ clave: `${g} a ${T} K`, M: masaMolar(g), T })), ...(T2 ? [{ clave: `${gases[0]} a ${T2} K`, M: masaMolar(gases[0]!), T: T2 }] : [])];
    const vTope = Math.max(...series.map((s) => 3.2 * vMasProbable(s.M, s.T)));
    const puntos = Array.from({ length: 121 }, (_, k) => {
      const v = (k / 120) * vTope;
      return Object.fromEntries([['v', Math.round(v)], ...series.map((s) => [s.clave, maxwellBoltzmann(v, s.M, s.T) * 1000])]);
    });
    return { series, puntos };
  }, [gases, T, T2]);
  const g0 = gases[0]!;
  const M0 = masaMolar(g0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium">Gases (hasta 3)</legend>
          <div className="flex flex-wrap gap-2">
            {GASES.map((g) => (
              <label key={g} className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={gases.includes(g)}
                  disabled={!gases.includes(g) && gases.length >= 3}
                  onChange={(e) => setGases((s) => (e.target.checked ? [...s, g] : s.length > 1 ? s.filter((x) => x !== g) : s))}
                />
                <Ce>{g}</Ce>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="w-64">
          <Slider etiqueta="Temperatura" valor={T} min={100} max={2000} paso={10} unidad="K" alCambiar={setT} />
        </div>
        <label className="text-sm">
          <input type="checkbox" checked={T2 !== null} onChange={(e) => setT2(e.target.checked ? 1000 : null)} /> Comparar {g0} a otra temperatura
        </label>
        {T2 !== null && (
          <div className="w-64">
            <Slider etiqueta={`T de ${g0}`} valor={T2} min={100} max={2000} paso={10} unidad="K" alCambiar={setT2} />
          </div>
        )}
      </div>
      <div className="h-[340px] w-full rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Curvas de distribución de rapideces de Maxwell-Boltzmann">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curvas.puntos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="v" type="number" tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'rapidez (m/s)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={50} label={{ value: 'f(v) × 10³ (s/m)', angle: -90, position: 'insideLeft', fill: 'var(--texto-suave)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(v) => `v = ${v} m/s`} formatter={(y) => Number(y).toFixed(3)} />
            <Legend verticalAlign="top" />
            <ReferenceLine x={Math.round(vMasProbable(M0, T))} stroke="var(--texto-suave)" strokeDasharray="4 3" label={{ value: 'v_mp', fill: 'var(--texto-suave)', fontSize: 11, position: 'top' }} />
            <ReferenceLine x={Math.round(vRms(M0, T))} stroke="var(--texto-suave)" strokeDasharray="1 3" label={{ value: 'v_rms', fill: 'var(--texto-suave)', fontSize: 11, position: 'top' }} />
            {curvas.series.map((s, i) => (
              <Line key={s.clave} dataKey={s.clave} stroke={COLORES[i % COLORES.length]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto">
        <table className="text-sm tabular-nums">
          <thead>
            <tr className="text-left text-texto-suave">
              <th className="pr-4 font-medium">Gas</th>
              <th className="pr-4 font-medium">v_mp (m/s)</th>
              <th className="pr-4 font-medium">v̄ (m/s)</th>
              <th className="pr-4 font-medium">v_rms (m/s)</th>
            </tr>
          </thead>
          <tbody>
            {curvas.series.map((s) => (
              <tr key={s.clave}>
                <td className="pr-4">{s.clave}</td>
                <td className="pr-4">{n3(vMasProbable(s.M, s.T))}</td>
                <td className="pr-4">{n3(vMedia(s.M, s.T))}</td>
                <td className="pr-4">{n3(vRms(s.M, s.T))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PasoAPaso
        pasos={[
          { titulo: `Velocidad cuadrática media de ${g0} a ${T} K (M en kg/mol)`, tex: `v_{rms} = \\sqrt{\\dfrac{3RT}{M}} = \\sqrt{\\dfrac{3\\times8{,}314\\times${T}}{${(M0 / 1000).toFixed(5)}}} = ${n3(vRms(M0, T))}\\ \\text{m/s}` },
          { titulo: 'Las moléculas más ligeras y las temperaturas altas dan curvas más anchas y desplazadas a la derecha; el área bajo cada curva vale 1.' },
        ]}
      />
    </div>
  );
}

// ── Gas real: Van der Waals ─────────────────────────────────────────────────

function GasReal() {
  const [gas, setGas] = useState('NH3');
  const [n, setN] = useState(3.5);
  const [V, setV] = useState(5.2);
  const [tC, setTC] = useState(47);
  const T = tC + 273.15;
  const c = VAN_DER_WAALS[gas]!;
  const Pid = gasIdeal({ n, V, T }, 'P');
  const Preal = presionVdW(n, V, T, c.a, c.b);
  const Z = compresibilidad(Preal, V, n, T);
  const curva = useMemo(() => {
    const Vmin = Math.max(n * c.b * 2.5, 0.2);
    return Array.from({ length: 80 }, (_, k) => {
      const v = Vmin + (k / 79) * (20 - Vmin);
      return { V: Number(v.toFixed(3)), ideal: gasIdeal({ n, V: v, T }, 'P'), real: presionVdW(n, v, T, c.a, c.b) };
    });
  }, [n, T, c.a, c.b]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <SelectorGas valor={gas} alCambiar={setGas} opciones={Object.keys(VAN_DER_WAALS)} />
        <div className="w-48">
          <Slider etiqueta="n" valor={n} min={0.5} max={10} paso={0.1} unidad="mol" alCambiar={setN} />
        </div>
        <div className="w-48">
          <Slider etiqueta="V" valor={V} min={0.5} max={20} paso={0.1} unidad="L" alCambiar={setV} />
        </div>
        <div className="w-48">
          <Slider etiqueta="T" valor={tC} min={-100} max={500} paso={1} unidad="°C" alCambiar={setTC} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <p>
            <Ce>{gas}</Ce>: a = {c.a} L²·atm/mol², b = {c.b} L/mol <InsigniaRevision />
          </p>
          <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 tabular-nums">
            <dt>P ideal</dt>
            <dd>{n3(Pid)} atm</dd>
            <dt>P Van der Waals</dt>
            <dd className="font-semibold">{n3(Preal)} atm</dd>
            <dt>Diferencia</dt>
            <dd>{n3((100 * (Preal - Pid)) / Pid)} %</dd>
            <dt>Z = PV/nRT</dt>
            <dd>{Z.toFixed(3)}</dd>
          </dl>
          <p className="mt-2 text-xs text-texto-suave">Z &lt; 1: dominan las atracciones (término a). Z &gt; 1: domina el volumen propio de las moléculas (término b).</p>
          <PasoAPaso
            pasos={[
              { titulo: 'Corrección por volumen', tex: `V - nb = ${V} - ${n}\\times${c.b} = ${n3(V - n * c.b)}\\ \\text{L}` },
              { titulo: 'Corrección por atracción', tex: `\\dfrac{an^2}{V^2} = \\dfrac{${c.a}\\times${n}^2}{${V}^2} = ${n3((c.a * n * n) / (V * V))}\\ \\text{atm}` },
              { titulo: 'Presión real', tex: `P = \\dfrac{nRT}{V-nb} - \\dfrac{an^2}{V^2} = ${n3(Preal)}\\ \\text{atm}` },
            ]}
          />
        </div>
        <div className="h-[320px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Isoterma ideal y de Van der Waals: presión frente a volumen">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curva} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
              <XAxis dataKey="V" type="number" domain={[0, 20]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'V (L)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={50} domain={[0, Math.ceil(Pid * 4)]} allowDataOverflow />
              <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(v) => `V = ${v} L`} formatter={(y) => `${Number(y).toFixed(2)} atm`} />
              <Legend verticalAlign="top" />
              <ReferenceLine x={V} stroke="var(--texto-suave)" strokeDasharray="4 3" />
              <Line dataKey="ideal" name="gas ideal" stroke="var(--texto-suave)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="real" name="Van der Waals" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Dalton y Graham ─────────────────────────────────────────────────────────

function Mezclas() {
  const [componentes, setComponentes] = useState([
    { gas: 'N2', n: 0.78 },
    { gas: 'O2', n: 0.21 },
    { gas: 'Ar', n: 0.01 },
  ]);
  const [Pt, setPt] = useState(760);
  const parciales = dalton(componentes.map((c) => c.n), Pt);
  const [g1, setG1] = useState('H2');
  const [g2, setG2] = useState('O2');
  const [t1, setT1] = useState(1.5);
  const [t2, setT2] = useState(4.73);
  const Mdesc = masaMolarGraham(t1, t2, masaMolar('Br2'));
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Ley de Dalton: presiones parciales</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Presión total (mmHg)</span>
          <input type="number" step="any" value={Pt} onChange={(e) => setPt(Number(e.target.value))} className={`${input} w-28`} />
        </label>
        <ul className="mt-3 space-y-2">
          {componentes.map((c, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <select
                value={c.gas}
                onChange={(e) => setComponentes((s) => s.map((x, j) => (j === i ? { ...x, gas: e.target.value } : x)))}
                className={input}
                aria-label={`Gas ${i + 1}`}
              >
                {GASES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                min={0}
                value={c.n}
                onChange={(e) => setComponentes((s) => s.map((x, j) => (j === i ? { ...x, n: Number(e.target.value) } : x)))}
                className={`${input} w-24`}
                aria-label={`Moles de ${c.gas}`}
              />
              <span>mol</span>
              <span className="ml-auto tabular-nums">
                x = {parciales[i]!.fraccion.toFixed(3)} → P = <strong>{n3(parciales[i]!.presion)} mmHg</strong>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex h-5 overflow-hidden rounded" aria-hidden>
          {parciales.map((p, i) => (
            <div key={i} style={{ width: `${p.fraccion * 100}%`, background: COLORES[i % COLORES.length] }} />
          ))}
        </div>
        <PasoAPaso pasos={[{ titulo: 'Fracción molar y presión parcial', tex: 'x_i = \\dfrac{n_i}{n_{\\text{total}}}\\qquad P_i = x_i\\,P_{\\text{total}}' }, ...componentes.map((c, i) => ({ titulo: `${c.gas}: ${parciales[i]!.fraccion.toFixed(4)} × ${Pt} = ${n3(parciales[i]!.presion)} mmHg` }))]} />
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Ley de Graham: efusión</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <SelectorGas valor={g1} alCambiar={setG1} etiqueta="Gas 1" />
          <SelectorGas valor={g2} alCambiar={setG2} etiqueta="Gas 2" />
        </div>
        <p className="mt-3">
          <Ce>{g1}</Ce> efunde <strong>{relacionGraham(masaMolar(g1), masaMolar(g2)).toFixed(3)}</strong> veces más rápido que <Ce>{g2}</Ce>.
        </p>
        <Formula tex={`\\dfrac{v_1}{v_2} = \\sqrt{\\dfrac{M_2}{M_1}} = \\sqrt{\\dfrac{${masaMolar(g2).toFixed(3)}}{${masaMolar(g1).toFixed(3)}}} = ${relacionGraham(masaMolar(g1), masaMolar(g2)).toFixed(3)}`} bloque />
        <h4 className="mt-4 font-medium">Masa molar a partir de los tiempos de efusión (referencia: Br₂)</h4>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">t del gas desconocido (min)</span>
            <input type="number" step="any" value={t1} onChange={(e) => setT1(Number(e.target.value))} className={`${input} w-28`} />
          </label>
          <label>
            <span className="mb-1 block">t del Br₂ (min)</span>
            <input type="number" step="any" value={t2} onChange={(e) => setT2(Number(e.target.value))} className={`${input} w-28`} />
          </label>
        </div>
        <p className="mt-2">
          M = <strong>{n3(Mdesc)} g/mol</strong>
        </p>
        <PasoAPaso pasos={[{ titulo: 'El tiempo de efusión es inversamente proporcional a la velocidad', tex: `\\dfrac{t_1}{t_2} = \\sqrt{\\dfrac{M_1}{M_2}}\\Rightarrow M_1 = M_2\\left(\\dfrac{t_1}{t_2}\\right)^2 = ${masaMolar('Br2').toFixed(2)}\\left(\\dfrac{${t1}}{${t2}}\\right)^2 = ${n3(Mdesc)}` }]} />
      </section>
    </div>
  );
}

export default function SimuladorGases() {
  const [seccion, setSeccion] = useState<Seccion>('caja');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: gases">
          <div className="space-y-4">
            <p>El gas ideal está formado por partículas puntuales que no se atraen y chocan elásticamente. Su estado queda fijado por P, V, n y T:</p>
            <Formula tex="PV = nRT\qquad R = 0{,}08206\ \dfrac{\text{L·atm}}{\text{mol·K}} = 8{,}314\ \dfrac{\text{J}}{\text{mol·K}}" bloque />
            <Formula tex="\dfrac{P_1V_1}{T_1} = \dfrac{P_2V_2}{T_2}\quad\begin{cases}\text{Boyle (T cte): } P_1V_1 = P_2V_2\\ \text{Charles (P cte): } V_1/T_1 = V_2/T_2\\ \text{Gay-Lussac (V cte): } P_1/T_1 = P_2/T_2\end{cases}" bloque />
            <p>Densidad y masa molar de un gas: ρ = PM/(RT). Volumen molar en condiciones normales (0 °C, 1 atm): 22,4 L/mol.</p>
            <p>Teoría cinética: la energía cinética media depende solo de la temperatura, Ē = (3/2)k_BT. Las rapideces siguen la distribución de Maxwell-Boltzmann:</p>
            <Formula tex="f(v) = 4\pi\left(\dfrac{M}{2\pi RT}\right)^{3/2} v^2\,e^{-Mv^2/2RT}\qquad v_{mp} = \sqrt{\dfrac{2RT}{M}},\ \bar v = \sqrt{\dfrac{8RT}{\pi M}},\ v_{rms} = \sqrt{\dfrac{3RT}{M}}" bloque />
            <p>Ley de Dalton: P_total = Σ Pᵢ, con Pᵢ = xᵢ·P_total. Ley de Graham: v₁/v₂ = √(M₂/M₁).</p>
            <p>Gas real (Van der Waals): a corrige las atracciones intermoleculares y b el volumen propio de las moléculas.</p>
            <Formula tex="\left(P + \dfrac{an^2}{V^2}\right)(V - nb) = nRT" bloque />
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Simulador de gases">
        {seccion === 'caja' && <Caja />}
        {seccion === 'ecuacion' && <Ecuacion />}
        {seccion === 'mb' && <DistribucionMB />}
        {seccion === 'real' && <GasReal />}
        {seccion === 'mezclas' && <Mezclas />}
      </Pestanas>
    </div>
  );
}
