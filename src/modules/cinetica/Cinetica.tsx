import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { arrhenius, concentracion, determinarOrden, energiaActivacion, leyVelocidad, unidadesK, vidaMedia, type Orden } from '@/chem/kinetics';
import { R } from '@/chem/constants';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Formula } from '@/components/Formula';

type Seccion = 'ordenes' | 'grafico' | 'iniciales' | 'arrhenius';
const SECCIONES = [
  { id: 'ordenes', titulo: 'Leyes integradas' },
  { id: 'grafico', titulo: 'Determinar el orden' },
  { id: 'iniciales', titulo: 'Velocidades iniciales' },
  { id: 'arrhenius', titulo: 'Energía de activación' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const n4 = (x: number) => (Number.isFinite(x) ? x.toLocaleString('es-PE', { maximumSignificantDigits: 4 }) : '—');
const ejes = { tick: { fill: 'var(--texto-suave)', fontSize: 12 } };
const tooltip = { contentStyle: { background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' } };
const ECUACION: Record<Orden, string> = {
  0: '[A] = [A]_0 - kt\\qquad t_{1/2} = \\dfrac{[A]_0}{2k}',
  1: '\\ln[A] = \\ln[A]_0 - kt\\qquad t_{1/2} = \\dfrac{\\ln 2}{k}',
  2: '\\dfrac{1}{[A]} = \\dfrac{1}{[A]_0} + kt\\qquad t_{1/2} = \\dfrac{1}{k[A]_0}',
};

function Ordenes() {
  const [orden, setOrden] = useState<Orden>(1);
  const [A0, setA0] = useState(1);
  const [k, setK] = useState(0.05);
  const t12 = vidaMedia(orden, k, A0);
  const tMax = Math.max(4 * vidaMedia(1, k, A0), 4 * t12);
  const datos = useMemo(
    () =>
      Array.from({ length: 101 }, (_, i) => {
        const t = (i / 100) * tMax;
        const A = concentracion(orden, A0, k, t);
        return { t: Number(t.toFixed(2)), A, lnA: A > 0 ? Math.log(A) : null, invA: A > 0 ? 1 / A : null };
      }),
    [orden, A0, k, tMax],
  );
  const lineal = orden === 0 ? 'A' : orden === 1 ? 'lnA' : 'invA';
  const etiquetaLineal = orden === 0 ? '[A] (M)' : orden === 1 ? 'ln[A]' : '1/[A] (M⁻¹)';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-5">
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium">Orden</legend>
          {([0, 1, 2] as Orden[]).map((o) => (
            <label key={o} className="mr-3">
              <input type="radio" name="orden" checked={orden === o} onChange={() => setOrden(o)} /> {o}
            </label>
          ))}
        </fieldset>
        <div className="w-56">
          <Slider etiqueta="[A]₀" valor={A0} min={0.1} max={2} paso={0.05} unidad="M" alCambiar={setA0} />
        </div>
        <div className="w-56">
          <Slider etiqueta="k" valor={k} min={0.005} max={0.2} paso={0.005} unidad={unidadesK(orden)} alCambiar={setK} />
        </div>
      </div>
      <Formula tex={ECUACION[orden]} bloque />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[280px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Concentración del reactivo frente al tiempo">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
              <XAxis dataKey="t" type="number" {...ejes} label={{ value: 't (s)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
              <YAxis {...ejes} width={48} />
              <Tooltip {...tooltip} labelFormatter={(t) => `t = ${t} s`} formatter={(y) => [`${Number(y).toFixed(4)} M`, '[A]']} />
              <ReferenceLine x={Number(t12.toFixed(2))} stroke="var(--aviso)" label={{ value: 't½', fill: 'var(--aviso)', fontSize: 11, position: 'insideTopRight' }} />
              <ReferenceLine y={A0 / 2} stroke="var(--aviso)" strokeDasharray="4 3" />
              <Line dataKey="A" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[280px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label={`Gráfica lineal: ${etiquetaLineal} frente al tiempo`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
              <XAxis dataKey="t" type="number" {...ejes} label={{ value: 't (s)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
              <YAxis {...ejes} width={48} domain={['auto', 'auto']} />
              <Tooltip {...tooltip} formatter={(y) => [Number(y).toFixed(4), etiquetaLineal]} />
              <Line dataKey={lineal} name={etiquetaLineal} stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Legend verticalAlign="top" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-sm">
        t½ = <strong>{n4(t12)} s</strong>.{' '}
        {orden === 1 ? 'En orden 1 la vida media no depende de [A]₀: cada t½ la concentración se reduce a la mitad.' : orden === 0 ? 'En orden 0 la vida media es proporcional a [A]₀.' : 'En orden 2 cada vida media dura el doble que la anterior.'}
      </p>
    </div>
  );
}

const DATOS_EJEMPLO = '0 0.0100\n50 0.0079\n100 0.0065\n150 0.0055\n200 0.0048\n300 0.0038';

function Grafico() {
  const [texto, setTexto] = useState(DATOS_EJEMPLO);
  const pares = texto
    .split('\n')
    .map((l) => l.trim().split(/[\s,;]+/).map((x) => Number(x.replace(',', '.'))))
    .filter((p) => p.length >= 2 && p.every(Number.isFinite) && p[1]! > 0) as [number, number][];
  const t = pares.map((p) => p[0]), A = pares.map((p) => p[1]);
  const r = pares.length >= 3 ? determinarOrden(t, A) : null;
  const series: { o: Orden; titulo: string; f: (a: number) => number }[] = [
    { o: 0, titulo: '[A] vs t', f: (a) => a },
    { o: 1, titulo: 'ln[A] vs t', f: Math.log },
    { o: 2, titulo: '1/[A] vs t', f: (a) => 1 / a },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="text-sm">
        <label>
          <span className="mb-1 block font-medium">Datos: t (s) y [A] (M), una pareja por línea</span>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={9} className={`${input} w-full font-mono`} />
        </label>
        {r && (
          <div className="mt-3 rounded-lg border border-borde bg-superficie p-3">
            <p>
              Orden <strong>{r.orden}</strong>, k = <strong>{n4(r.k)}</strong> {unidadesK(r.orden)}
            </p>
            <PasoAPaso
              pasos={[
                { titulo: 'Se grafican las tres formas lineales y se elige la de mejor R² (más cercano a 1).' },
                ...series.map((s) => ({ titulo: `${s.titulo}: R² = ${r.ajustes[s.o].r2.toFixed(5)}, pendiente = ${n4(r.ajustes[s.o].pendiente)}` })),
                { titulo: r.orden === 2 ? 'Orden 2: la pendiente es k.' : 'La pendiente es −k.' },
              ]}
            />
          </div>
        )}
        {!r && <p className="mt-2 text-aviso">Se necesitan al menos 3 puntos con [A] &gt; 0.</p>}
      </div>
      {r && (
        <div className="grid gap-3 md:grid-cols-3">
          {series.map((s) => (
            <figure key={s.o} className={`rounded-lg border bg-superficie p-2 ${r.orden === s.o ? 'border-acento' : 'border-borde'}`}>
              <figcaption className="text-center text-sm">
                {s.titulo} <span className="text-texto-suave">(R² = {r.ajustes[s.o].r2.toFixed(4)})</span>
              </figcaption>
              <div className="h-[200px]" role="img" aria-label={`Gráfica ${s.titulo}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                    <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" {...ejes} />
                    <YAxis dataKey="y" type="number" {...ejes} width={52} domain={['auto', 'auto']} tickFormatter={(v) => Number(v).toPrecision(3)} />
                    <Scatter data={pares.map(([x, a]) => ({ x, y: s.f(a) }))} fill={r.orden === s.o ? 'var(--acento)' : 'var(--texto-suave)'} isAnimationActive={false} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function Iniciales() {
  const [filas, setFilas] = useState([
    [0.1, 0.01, 1.2e-3],
    [0.1, 0.04, 4.8e-3],
    [0.2, 0.01, 2.4e-3],
  ]);
  let r: ReturnType<typeof leyVelocidad> | null = null;
  let error: string | null = null;
  try {
    r = leyVelocidad(filas.map((f) => ({ concentraciones: [f[0]!, f[1]!], velocidad: f[2]! })));
  } catch (e) {
    error = (e as Error).message;
  }
  const og = r ? r.ordenes.reduce((a, b) => a + b, 0) : 0;
  return (
    <div className="space-y-3 text-sm">
      <p>
        Reacción ejemplo: F₂ + 2 ClO₂ → 2 FClO₂. Ley buscada: v = k[A]<sup>m</sup>[B]<sup>n</sup>.
      </p>
      <div className="overflow-x-auto">
        <table className="tabular-nums">
          <thead>
            <tr className="text-left text-texto-suave">
              <th className="pr-3 font-medium">Exp.</th>
              <th className="pr-3 font-medium">[A] = [F₂] (M)</th>
              <th className="pr-3 font-medium">[B] = [ClO₂] (M)</th>
              <th className="pr-3 font-medium">v inicial (M/s)</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td className="pr-3">{i + 1}</td>
                {f.map((v, j) => (
                  <td key={j} className="pr-3 py-1">
                    <input
                      type="number"
                      step="any"
                      value={v}
                      onChange={(e) => setFilas((s) => s.map((x, a) => (a === i ? x.map((y, b) => (b === j ? Number(e.target.value) : y)) : x)))}
                      className={`${input} w-28`}
                      aria-label={`Experimento ${i + 1}, columna ${j + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2" onClick={() => setFilas((s) => [...s, [0.2, 0.02, 9.6e-3]])} disabled={filas.length >= 6}>
        Agregar experimento
      </button>
      {error && <p className="text-aviso">{error}</p>}
      {r && (
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <Formula tex={`v = ${n4(r.k)}\\,[A]^{${r.ordenes[0]}}[B]^{${r.ordenes[1]}}\\qquad \\text{orden global} = ${og}`} bloque />
          <p className="text-texto-suave">Unidades de k: {unidadesK(og)}</p>
          <PasoAPaso pasos={r.pasos.map((p) => ({ titulo: p }))} />
        </div>
      )}
    </div>
  );
}

/** Perfil de energía: reactivos, estado de transición y productos (con y sin catalizador). */
function PerfilEnergia({ Ea, dH, EaCat }: { Ea: number; dH: number; EaCat: number | null }) {
  // y(E): energías relativas a los reactivos; el máximo es el estado de transición
  const W = 320, H = 200, arriba = 18, abajo = 175;
  const eMax = Math.max(Ea, dH, 1), eMin = Math.min(0, dH);
  const y = (E: number) => arriba + ((eMax - E) / (eMax - eMin)) * (abajo - arriba);
  const base = y(0);
  const camino = (ea: number) => {
    const yR = base, yT = y(Math.max(ea, dH)), yP = y(dH);
    return `M20 ${yR} L80 ${yR} C120 ${yR} 130 ${yT} 160 ${yT} C190 ${yT} 200 ${yP} 240 ${yP} L300 ${yP}`;
  };
  const esc = (abajo - arriba) / (eMax - eMin);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full max-w-md" role="img" aria-label={`Perfil de energía: Ea = ${Ea} kJ/mol, ΔH = ${dH} kJ/mol`}>
      <line x1={14} y1={10} x2={14} y2={190} stroke="var(--texto-suave)" />
      <text x={10} y={100} fontSize={11} fill="var(--texto-suave)" transform="rotate(-90 10 100)" textAnchor="middle">
        energía
      </text>
      <path d={camino(Ea)} fill="none" stroke="var(--acento)" strokeWidth={2.5} />
      {EaCat !== null && <path d={camino(EaCat)} fill="none" stroke="var(--exito)" strokeWidth={2} strokeDasharray="5 4" />}
      <line x1={160} x2={160} y1={base} y2={base - Ea * esc} stroke="var(--texto-suave)" strokeDasharray="3 3" />
      <text x={164} y={base - (Ea * esc) / 2} fontSize={11} fill="var(--texto)">
        Ea = {Ea} kJ/mol
      </text>
      <text x={40} y={base + 16} fontSize={11} fill="var(--texto)">
        reactivos
      </text>
      <text x={250} y={y(dH) + 14} fontSize={11} fill="var(--texto)">
        productos
      </text>
      {EaCat !== null && (
        <text x={164} y={y(EaCat) - 6} fontSize={10} fill="var(--exito)">
          con catalizador
        </text>
      )}
    </svg>
  );
}

function Arrhenius() {
  const [Ea, setEa] = useState(75);
  const [dH, setDH] = useState(-40);
  const [logA, setLogA] = useState(11);
  const [T, setT] = useState(300);
  const [cat, setCat] = useState(false);
  const EaCat = Math.round(Ea * 0.6);
  const Ef = cat ? EaCat : Ea;
  const A = 10 ** logA;
  const k = arrhenius(A, Ef * 1000, T);
  const datos = useMemo(() => Array.from({ length: 41 }, (_, i) => {
    const t = 250 + i * 5;
    return { invT: Number((1000 / t).toFixed(4)), lnk: Math.log(arrhenius(A, Ef * 1000, t)), T: t };
  }), [A, Ef]);
  // Ejercicio: Ea a partir de dos temperaturas
  const [k1, setK1] = useState(3.46e-5);
  const [T1, setT1] = useState(298);
  const [k2, setK2] = useState(9.63e-4);
  const [T2, setT2] = useState(328);
  const EaCalc = energiaActivacion(k1, T1, k2, T2);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Slider etiqueta="Energía de activación" valor={Ea} min={10} max={200} unidad="kJ/mol" alCambiar={setEa} />
          <Slider etiqueta="ΔH de reacción" valor={dH} min={-150} max={150} unidad="kJ/mol" alCambiar={setDH} />
          <Slider etiqueta="log A (factor de frecuencia)" valor={logA} min={6} max={15} paso={0.5} alCambiar={setLogA} />
          <Slider etiqueta="Temperatura" valor={T} min={250} max={450} alCambiar={setT} formato={(t) => `${t} K (${(t - 273.15).toFixed(0)} °C)`} />
          <label className="text-sm">
            <input type="checkbox" checked={cat} onChange={(e) => setCat(e.target.checked)} /> Añadir catalizador (Ea baja a {EaCat} kJ/mol; ΔH no cambia)
          </label>
          <div className="rounded-lg border border-borde bg-superficie p-3 text-sm">
            <p>
              k = <strong>{k.toExponential(3)}</strong> (mismas unidades que A)
            </p>
            <p className="text-texto-suave">
              Con 10 K más: k × {n4(arrhenius(A, Ef * 1000, T + 10) / k)}. {cat && `El catalizador multiplica k por ${arrhenius(A, EaCat * 1000, T) / arrhenius(A, Ea * 1000, T) > 1e6 ? (arrhenius(A, EaCat * 1000, T) / arrhenius(A, Ea * 1000, T)).toExponential(2) : n4(arrhenius(A, EaCat * 1000, T) / arrhenius(A, Ea * 1000, T))}.`}
            </p>
            <PasoAPaso pasos={[{ titulo: 'Arrhenius', tex: `k = Ae^{-E_a/RT} = 10^{${logA}}\\,e^{-${Ef * 1000}/(8{,}314\\times${T})} = ${k.toExponential(3).replace('e', '\\times10^{') + '}'}` }]} />
          </div>
        </div>
        <div className="space-y-3">
          <PerfilEnergia Ea={Ea} dH={dH} EaCat={cat ? EaCat : null} />
          <div className="h-[220px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Gráfica de Arrhenius: ln k frente a 1/T">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
                <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
                <XAxis dataKey="invT" type="number" domain={['auto', 'auto']} {...ejes} label={{ value: '1000/T (K⁻¹)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
                <YAxis {...ejes} width={48} domain={['auto', 'auto']} tickFormatter={(v) => Number(v).toFixed(1)} />
                <Tooltip {...tooltip} labelFormatter={(x) => `T = ${(1000 / Number(x)).toFixed(0)} K`} formatter={(y) => [Number(y).toFixed(3), 'ln k']} />
                <Line dataKey="lnk" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-texto-suave">Pendiente de la recta = −Ea/R.</p>
        </div>
      </div>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Ea a partir de k a dos temperaturas</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          {(
            [
              ['k₁', k1, setK1],
              ['T₁ (K)', T1, setT1],
              ['k₂', k2, setK2],
              ['T₂ (K)', T2, setT2],
            ] as const
          ).map(([e, v, f]) => (
            <label key={e}>
              <span className="mb-1 block">{e}</span>
              <input type="number" step="any" value={v} onChange={(ev) => f(Number(ev.target.value))} className={`${input} w-28`} />
            </label>
          ))}
        </div>
        <p className="mt-2">
          Ea = <strong>{n4(EaCalc / 1000)} kJ/mol</strong>
        </p>
        <PasoAPaso
          pasos={[
            { titulo: 'Forma de dos puntos de Arrhenius', tex: '\\ln\\dfrac{k_2}{k_1} = \\dfrac{E_a}{R}\\left(\\dfrac{1}{T_1} - \\dfrac{1}{T_2}\\right)' },
            { titulo: 'Despejando Ea', tex: `E_a = \\dfrac{${R.toFixed(3)}\\times\\ln(${n4(k2 / k1)})}{1/${T1} - 1/${T2}} = ${n4(EaCalc)}\\ \\text{J/mol}` },
          ]}
        />
      </section>
    </div>
  );
}

export default function Cinetica() {
  const [seccion, setSeccion] = useState<Seccion>('ordenes');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: cinética química">
          <div className="space-y-4">
            <p>La velocidad de reacción mide cuánto cambia la concentración por unidad de tiempo. Para aA + bB → productos:</p>
            <Formula tex="v = -\dfrac{1}{a}\dfrac{d[A]}{dt} = k[A]^m[B]^n" bloque />
            <p>Los órdenes m y n se determinan experimentalmente (no son, en general, los coeficientes estequiométricos).</p>
            <Formula tex={`${ECUACION[0]}\\\\ ${ECUACION[1]}\\\\ ${ECUACION[2]}`} bloque />
            <p>Teoría de colisiones: las moléculas deben chocar con la orientación adecuada y con energía mayor que la energía de activación. Ecuación de Arrhenius:</p>
            <Formula tex="k = Ae^{-E_a/RT}\qquad \ln k = \ln A - \dfrac{E_a}{R}\cdot\dfrac{1}{T}" bloque />
            <p>Un catalizador ofrece un mecanismo alternativo con menor Ea; no modifica ΔH ni la constante de equilibrio.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Cinética química">
        {seccion === 'ordenes' && <Ordenes />}
        {seccion === 'grafico' && <Grafico />}
        {seccion === 'iniciales' && <Iniciales />}
        {seccion === 'arrhenius' && <Arrhenius />}
      </Pestanas>
    </div>
  );
}
