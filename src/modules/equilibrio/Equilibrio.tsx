import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cociente, deltaNGas, kcDesdeKp, kpDesdeKc, pasoCinetico, resolverICE, sentido, vantHoff, type ReaccionEq } from '@/chem/equilibrium';
import { propiedadesReaccion } from '@/chem/thermo';
import { aMhchem } from '@/chem/formula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Seccion = 'ice' | 'kp' | 'lechatelier';
const SECCIONES = [
  { id: 'ice', titulo: 'Tabla ICE' },
  { id: 'kp', titulo: 'Kc, Kp y Q' },
  { id: 'lechatelier', titulo: 'Le Chatelier' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const n4 = (x: number) => (Number.isFinite(x) ? (Math.abs(x) < 1e-3 && x !== 0 ? x.toExponential(3) : x.toLocaleString('es-PE', { maximumSignificantDigits: 4 })) : '—');

interface Preset {
  titulo: string;
  reaccion: ReaccionEq;
  K: number;
  T: number;
  inicial: [number[], number[]];
  fuente: string;
}

/** Constantes de equilibrio de ejemplo (Chang, cap. 14; pendientes de revisión). */
const PRESETS: Preset[] = [
  {
    titulo: 'H₂ + I₂ ⇌ 2HI (430 °C)',
    reaccion: { reactivos: [{ formula: 'H2', coef: 1, fase: 'g' }, { formula: 'I2', coef: 1, fase: 'g' }], productos: [{ formula: 'HI', coef: 2, fase: 'g' }] },
    K: 54.3,
    T: 703.15,
    inicial: [[0.5, 0.5], [0]],
    fuente: 'Chang, cap. 14',
  },
  {
    titulo: 'N₂O₄ ⇌ 2NO₂ (25 °C)',
    reaccion: { reactivos: [{ formula: 'N2O4', coef: 1, fase: 'g' }], productos: [{ formula: 'NO2', coef: 2, fase: 'g' }] },
    K: 4.63e-3,
    T: 298.15,
    inicial: [[0.1], [0]],
    fuente: 'Chang, cap. 14',
  },
  {
    titulo: 'CaCO₃(s) ⇌ CaO(s) + CO₂(g) (Kc = [CO₂])',
    reaccion: { reactivos: [{ formula: 'CaCO3', coef: 1, fase: 's' }], productos: [{ formula: 'CaO', coef: 1, fase: 's' }, { formula: 'CO2', coef: 1, fase: 'g' }] },
    K: 2.68e-3,
    T: 1073.15,
    inicial: [[1], [1, 0]],
    fuente: 'Chang, cap. 14 (P_CO₂ = 0,236 atm a 800 °C)',
  },
];

const expresionK = (r: ReaccionEq) => {
  const t = (l: ReaccionEq['reactivos']) =>
    l
      .filter((e) => e.fase !== 's' && e.fase !== 'l')
      .map((e) => `[\\ce{${aMhchem(e.formula)}}]${e.coef !== 1 ? `^{${e.coef}}` : ''}`)
      .join('') || '1';
  return `K_c = \\dfrac{${t(r.productos)}}{${t(r.reactivos)}}`;
};

function ICE() {
  const [p, setP] = useState(0);
  const preset = PRESETS[p]!;
  const [cR, setCR] = useState<number[]>(preset.inicial[0]);
  const [cP, setCP] = useState<number[]>(preset.inicial[1]);
  const [K, setK] = useState(preset.K);
  const elegir = (i: number) => {
    setP(i);
    setCR(PRESETS[i]!.inicial[0]);
    setCP(PRESETS[i]!.inicial[1]);
    setK(PRESETS[i]!.K);
  };
  const r = preset.reaccion;
  let res: ReturnType<typeof resolverICE> | null = null;
  try {
    res = resolverICE(r, cR, cP, K);
  } catch {
    res = null;
  }
  const especies = [...r.reactivos.map((e, i) => ({ e, i, lado: -1 as const })), ...r.productos.map((e, i) => ({ e, i, lado: 1 as const }))];
  const fila = (f: (o: (typeof especies)[number]) => string) => especies.map((o) => <td key={o.e.formula} className="px-3 py-1 text-center">{f(o)}</td>);
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-end gap-4">
        <label>
          <span className="mb-1 block font-medium">Reacción</span>
          <select value={p} onChange={(e) => elegir(Number(e.target.value))} className={input}>
            {PRESETS.map((x, i) => (
              <option key={x.titulo} value={i}>
                {x.titulo}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block font-medium">Kc</span>
          <input type="number" step="any" value={K} onChange={(e) => setK(Number(e.target.value))} className={`${input} w-32`} />
        </label>
        <span className="text-xs text-texto-suave">
          {preset.fuente} <InsigniaRevision />
        </span>
      </div>
      <Formula tex={expresionK(r)} bloque />
      <div className="overflow-x-auto rounded-lg border border-borde bg-superficie p-3">
        <table className="tabular-nums">
          <thead>
            <tr>
              <th />
              {especies.map((o) => (
                <th key={o.e.formula} className="px-3 py-1">
                  <Ce>{`${o.e.coef > 1 ? o.e.coef : ''}${aMhchem(o.e.formula)}(${o.e.fase})`}</Ce>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="pr-3 text-left font-medium">Inicial (M)</th>
              {especies.map((o) => (
                <td key={o.e.formula} className="px-3 py-1 text-center">
                  {o.e.fase === 's' || o.e.fase === 'l' ? (
                    <span className="text-texto-suave">sólido</span>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={(o.lado < 0 ? cR : cP)[o.i]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (o.lado < 0) setCR((s) => s.map((x, j) => (j === o.i ? v : x)));
                        else setCP((s) => s.map((x, j) => (j === o.i ? v : x)));
                      }}
                      className={`${input} w-24`}
                      aria-label={`Concentración inicial de ${o.e.formula}`}
                    />
                  )}
                </td>
              ))}
            </tr>
            {res && (
              <>
                <tr>
                  <th className="pr-3 text-left font-medium">Cambio</th>
                  {fila((o) => (o.e.fase === 's' || o.e.fase === 'l' ? '—' : `${o.lado < 0 ? '−' : '+'}${o.e.coef > 1 ? o.e.coef : ''}x`))}
                </tr>
                <tr>
                  <th className="pr-3 text-left font-medium">Equilibrio (M)</th>
                  {fila((o) => (o.e.fase === 's' || o.e.fase === 'l' ? '—' : n4((o.lado < 0 ? res!.reactivos : res!.productos)[o.i]!)))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      {res ? (
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <p>
            x = <strong>{n4(res.x)} M</strong>. {Number.isFinite(res.Q0) ? `Q inicial = ${n4(res.Q0)} ` : 'Al inicio falta algún producto (Q = 0) '}
            {res.sentido === 'productos' ? '< K: la reacción avanza hacia los productos.' : res.sentido === 'reactivos' ? '> K: la reacción retrocede hacia los reactivos.' : '= K: ya está en equilibrio.'}
          </p>
          <PasoAPaso
            pasos={[
              { titulo: 'Expresión de equilibrio con las concentraciones de la fila «Equilibrio»', tex: expresionK(r) },
              { titulo: `Se resuelve para x de forma exacta (bisección); no se usa la aproximación «x despreciable».` },
              { titulo: `Comprobación: Q en el equilibrio = ${n4(cociente(r, res.reactivos, res.productos))} = Kc` },
            ]}
          />
        </div>
      ) : (
        <p className="text-aviso">Revisa las concentraciones: debe haber al menos una especie en disolución o gas a cada lado.</p>
      )}
    </div>
  );
}

function KpKc() {
  const [p, setP] = useState(1);
  const preset = PRESETS[p]!;
  const dn = deltaNGas(preset.reaccion);
  const Kp = kpDesdeKc(preset.K, preset.T, dn);
  const [Q, setQ] = useState(0.01);
  return (
    <div className="grid gap-5 md:grid-cols-2 text-sm">
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">Relación entre Kp y Kc</h3>
        <select value={p} onChange={(e) => setP(Number(e.target.value))} className={`${input} mt-2`} aria-label="Reacción">
          {PRESETS.map((x, i) => (
            <option key={x.titulo} value={i}>
              {x.titulo}
            </option>
          ))}
        </select>
        <p className="mt-3">
          Δn (gases) = {dn}; Kc = {n4(preset.K)} a {preset.T.toFixed(0)} K → Kp = <strong>{n4(Kp)}</strong>
        </p>
        <Formula tex={`K_p = K_c(RT)^{\\Delta n} = ${n4(preset.K)}\\times(0{,}08206\\times${preset.T.toFixed(2)})^{${dn}} = ${n4(Kp)}`} bloque />
        <p className="text-texto-suave">Si Δn = 0, Kp = Kc. Con Kp en atm, de vuelta: Kc = {n4(kcDesdeKp(Kp, preset.T, dn))}.</p>
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">Cociente de reacción Q</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Q para {preset.titulo} (Kc = {n4(preset.K)})</span>
          <input type="range" min={-6} max={4} step={0.05} value={Math.log10(Q)} onChange={(e) => setQ(10 ** Number(e.target.value))} className="w-full accent-[var(--acento)]" aria-label="Q (escala logarítmica)" />
        </label>
        <p className="mt-2 tabular-nums">Q = {n4(Q)}</p>
        <div className="relative mt-3 h-8 rounded bg-superficie-2" aria-hidden>
          <div className="absolute inset-y-0 w-0.5 bg-aviso" style={{ left: `${((Math.log10(preset.K) + 6) / 10) * 100}%` }} />
          <div className="absolute top-1 h-6 w-6 -translate-x-1/2 rounded-full bg-acento" style={{ left: `${((Math.log10(Q) + 6) / 10) * 100}%` }} />
        </div>
        <p className="mt-3 font-medium">
          {sentido(Q, preset.K) === 'productos' ? 'Q < K → la reacción avanza hacia la derecha (productos).' : sentido(Q, preset.K) === 'reactivos' ? 'Q > K → la reacción avanza hacia la izquierda (reactivos).' : 'Q = K → equilibrio.'}
        </p>
      </section>
    </div>
  );
}

// ── Le Chatelier: N₂O₄ ⇌ 2NO₂ ───────────────────────────────────────────────

const N2O4: ReaccionEq = PRESETS[1]!.reaccion;
const K298 = PRESETS[1]!.K;
/** ΔH° de N₂O₄ → 2NO₂ desde las tablas de formación (J/mol). */
const DH = propiedadesReaccion('N2O4(g) -> 2 NO2(g)').dH * 1000;

interface Punto {
  t: number;
  N2O4: number;
  NO2: number;
}

function LeChatelier() {
  const [T, setT] = useState(298.15);
  const K = vantHoff(K298, 298.15, T, DH);
  const eq0 = resolverICE(N2O4, [0.05], [0], K298);
  const estado = useRef({ c: [eq0.reactivos[0]!, eq0.productos[0]!], t: 0 });
  const [serie, setSerie] = useState<Punto[]>([{ t: 0, N2O4: eq0.reactivos[0]!, NO2: eq0.productos[0]! }]);
  const [mensaje, setMensaje] = useState('Sistema en equilibrio a 25 °C. Aplica una perturbación.');
  const Kref = useRef(K);
  Kref.current = K;

  // Integración temporal continua (acción de masas con k_d/k_i = K)
  useEffect(() => {
    let raf = 0, ultimo = performance.now(), acumulado = 0;
    const cuadro = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      const e = estado.current;
      for (let i = 0; i < 10; i++) {
        const r = pasoCinetico(N2O4, [e.c[0]!], [e.c[1]!], Kref.current, 0.1, dt / 10);
        e.c = [r.reactivos[0]!, r.productos[0]!];
      }
      e.t += dt;
      acumulado += dt;
      if (acumulado > 0.1) {
        acumulado = 0;
        setSerie((s) => [...s.slice(-150), { t: Number(e.t.toFixed(1)), N2O4: e.c[0]!, NO2: e.c[1]! }]);
      }
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, []);

  const perturbar = (f: (c: number[]) => number[], texto: string) => {
    estado.current.c = f(estado.current.c);
    setMensaje(texto);
  };
  const [cN2O4, cNO2] = estado.current.c as [number, number];
  const Q = (cNO2 * cNO2) / cN2O4;
  // Color: el NO₂ es pardo rojizo; el N₂O₄, incoloro
  const intensidad = Math.min(1, cNO2 / 0.06);
  const boton = 'rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2';
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <div className="space-y-3 text-sm">
        <Ce bloque>{'N2O4(g) <=> 2NO2(g)'}</Ce>
        <p className="text-texto-suave">ΔH° = +{(DH / 1000).toFixed(1)} kJ (endotérmica en sentido directo; tablas de formación).</p>
        <svg viewBox="0 0 200 160" className="h-40 w-full" role="img" aria-label={`Recipiente con gas pardo de intensidad ${(intensidad * 100).toFixed(0)} %`}>
          <rect x={30} y={10} width={140} height={140} rx={10} fill={`rgba(150, 60, 20, ${0.08 + 0.85 * intensidad})`} stroke="var(--texto-suave)" strokeWidth={2} />
        </svg>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={boton} onClick={() => perturbar(([a, b]) => [a! + 0.03, b!], 'Se añadió N₂O₄: Q < K, el sistema produce NO₂.')}>
            + N₂O₄
          </button>
          <button type="button" className={boton} onClick={() => perturbar(([a, b]) => [a!, b! + 0.03], 'Se añadió NO₂: Q > K, el sistema forma N₂O₄.')}>
            + NO₂
          </button>
          <button type="button" className={boton} onClick={() => perturbar(([a, b]) => [a! * 2, b! * 2], 'Volumen a la mitad (presión ×2): se favorece el lado con menos moles de gas (N₂O₄).')}>
            Comprimir (V ÷ 2)
          </button>
          <button type="button" className={boton} onClick={() => perturbar(([a, b]) => [a! / 2, b! / 2], 'Volumen al doble: se favorece el lado con más moles de gas (NO₂).')}>
            Expandir (V × 2)
          </button>
        </div>
        <label className="block">
          <span className="mb-1 block font-medium">
            Temperatura: {T.toFixed(0)} K ({(T - 273.15).toFixed(0)} °C)
          </span>
          <input
            type="range"
            min={260}
            max={380}
            step={1}
            value={T}
            onChange={(e) => {
              const nT = Number(e.target.value);
              setMensaje(nT > T ? 'Al calentar, K aumenta (reacción endotérmica): se forma más NO₂.' : 'Al enfriar, K disminuye: se forma N₂O₄.');
              setT(nT);
            }}
            className="w-full accent-[var(--acento)]"
          />
        </label>
        <div className="rounded-lg border border-borde bg-superficie p-3 tabular-nums">
          <p>Kc({T.toFixed(0)} K) = {n4(K)}</p>
          <p>Q = {n4(Q)}</p>
          <p aria-live="polite" className="mt-1 font-medium">
            {mensaje}
          </p>
        </div>
        <p className="text-xs text-texto-suave">
          K a otras temperaturas por Van ’t Hoff (ΔH° constante). Kc a 25 °C: Chang <InsigniaRevision />
        </p>
      </div>
      <div className="h-[360px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Concentraciones de N₂O₄ y NO₂ frente al tiempo">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={serie} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'tiempo (simulado)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={56} tickFormatter={(v) => Number(v).toFixed(3)} />
            <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} formatter={(y) => `${Number(y).toFixed(4)} M`} />
            <Legend verticalAlign="top" />
            <Line dataKey="N2O4" name="[N₂O₄]" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="NO2" name="[NO₂]" stroke="#c2410c" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Equilibrio() {
  const [seccion, setSeccion] = useState<Seccion>('ice');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: equilibrio químico">
          <div className="space-y-4">
            <p>En el equilibrio las velocidades directa e inversa son iguales y las concentraciones dejan de cambiar. Para aA + bB ⇌ cC + dD:</p>
            <Formula tex="K_c = \dfrac{[C]^c[D]^d}{[A]^a[B]^b}\qquad K_p = K_c(RT)^{\Delta n}" bloque />
            <p>Los sólidos y líquidos puros no aparecen en la expresión de K. El cociente Q tiene la misma forma con concentraciones cualesquiera:</p>
            <Formula tex="Q < K\Rightarrow\ \rightarrow\qquad Q > K\Rightarrow\ \leftarrow\qquad Q = K\Rightarrow\ \text{equilibrio}" bloque />
            <p>
              Principio de Le Chatelier: si se perturba un sistema en equilibrio, este se desplaza para contrarrestar la perturbación. Cambiar concentraciones o presión
              desplaza el equilibrio sin cambiar K; solo la temperatura cambia K:
            </p>
            <Formula tex="\ln\dfrac{K_2}{K_1} = -\dfrac{\Delta H^\circ}{R}\left(\dfrac{1}{T_2} - \dfrac{1}{T_1}\right)" bloque />
            <p>Un catalizador no desplaza el equilibrio: solo hace que se alcance antes.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Equilibrio químico">
        {seccion === 'ice' && <ICE />}
        {seccion === 'kp' && <KpKc />}
        {seccion === 'lechatelier' && <LeChatelier />}
      </Pestanas>
    </div>
  );
}
