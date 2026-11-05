import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import datos from '@/data/acidos-bases.json';
import {
  fracciones,
  hendersonHasselbalch,
  KW,
  pHAcidoDebil,
  pHAcidoDebilAprox,
  pHAcidoFuerte,
  pHBaseDebil,
  pHBaseFuerte,
  pHSolucion,
  porcentajeIonizacion,
  productoIonico,
  solubilidadIonComun,
  solubilidadMolar,
} from '@/chem/acidBase';
import { aMhchem, masaMolar } from '@/chem/formula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Seccion = 'escala' | 'calcular' | 'buffer' | 'ksp';
const SECCIONES = [
  { id: 'escala', titulo: 'Escala de pH' },
  { id: 'calcular', titulo: 'Calcular el pH' },
  { id: 'buffer', titulo: 'Soluciones buffer' },
  { id: 'ksp', titulo: 'Solubilidad (Ksp)' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const sci = (x: number) => {
  const [m, e] = x.toExponential(2).split('e');
  return `${m!.replace('.', ',')} × 10${String(Number(e)).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)}`;
};
const tex = (x: number) => {
  const [m, e] = x.toExponential(2).split('e');
  return `${m!.replace('.', '{,}')}\\times10^{${Number(e)}}`;
};

/** Color aproximado del indicador universal (ilustrativo). */
const COLOR_UNIVERSAL = ['#d7263d', '#e8432d', '#f0642b', '#f6892b', '#f7b32b', '#f2d32b', '#c9d84a', '#5cb85c', '#2fa58a', '#2a8fbf', '#2f6fd1', '#3d4fc4', '#5a3fb8', '#6a2fa8', '#75209a'];
/** Negro o blanco según la luminancia relativa del fondo (contraste WCAG). */
const textoSobre = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! > 0.18 ? '#000000' : '#ffffff';
};
const colorPH = (pH: number) => COLOR_UNIVERSAL[Math.max(0, Math.min(14, Math.round(pH)))]!;

function Escala() {
  const [pH, setPH] = useState(3);
  const H = 10 ** -pH;
  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="flex h-10 overflow-hidden rounded-lg" aria-hidden>
          {COLOR_UNIVERSAL.map((c, i) => (
            <div key={i} className="flex flex-1 items-center justify-center text-xs font-semibold" style={{ background: c, color: textoSobre(c) }}>
              {i}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute -top-1 h-12 w-1 -translate-x-1/2 rounded bg-texto" style={{ left: `${((pH + 0.5) / 15) * 100}%` }} aria-hidden />
      </div>
      <Slider etiqueta="pH" valor={pH} min={0} max={14} paso={0.1} alCambiar={setPH} formato={(v) => v.toFixed(1)} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-borde bg-superficie p-4 text-sm tabular-nums">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <dt>[H₃O⁺]</dt>
            <dd>{sci(H)} M</dd>
            <dt>[OH⁻]</dt>
            <dd>{sci(KW / H)} M</dd>
            <dt>pOH</dt>
            <dd>{(14 - pH).toFixed(1)}</dd>
            <dt>Carácter</dt>
            <dd className="font-semibold">{pH < 6.995 ? 'ácido' : pH > 7.005 ? 'básico' : 'neutro'}</dd>
          </dl>
          <PasoAPaso pasos={[{ titulo: 'Definiciones (25 °C)', tex: `[\\ce{H3O+}] = 10^{-\\text{pH}} = ${tex(H)}\\qquad [\\ce{OH-}] = \\dfrac{K_w}{[\\ce{H3O+}]} = ${tex(KW / H)}\\qquad \\text{pH} + \\text{pOH} = 14` }]} />
          <p className="mt-2 text-xs text-texto-suave">Bajar 1 unidad de pH significa 10 veces más H₃O⁺. Colores del indicador universal: aproximados.</p>
        </div>
        <ul className="space-y-1 text-sm">
          {datos.phComunes.map((s) => (
            <li key={s.nombre} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: colorPH(s.pH) }} aria-hidden />
              <span className="w-10 tabular-nums">{s.pH.toFixed(1)}</span>
              <button type="button" className="text-left hover:underline" onClick={() => setPH(s.pH)}>
                {s.nombre}
              </button>
            </li>
          ))}
          <li className="pt-1 text-xs text-texto-suave">
            Valores típicos (Chang, tabla 15.1) <InsigniaRevision />
          </li>
        </ul>
      </div>
    </div>
  );
}

type Tipo = 'acido-fuerte' | 'base-fuerte' | 'acido-debil' | 'base-debil';

function Calcular() {
  const [tipo, setTipo] = useState<Tipo>('acido-debil');
  const [logC, setLogC] = useState(-1);
  const [ia, setIa] = useState(4);
  const [ib, setIb] = useState(2);
  const C = 10 ** logC;
  const acido = datos.acidos[ia]!, base = datos.bases[ib]!;
  let pH: number, aprox: number | null = null;
  let pasos: { titulo: string; tex?: string }[] = [];
  if (tipo === 'acido-fuerte') {
    pH = pHAcidoFuerte(C);
    aprox = -logC;
    pasos = [
      { titulo: 'Un ácido fuerte se ioniza por completo: [H₃O⁺] ≈ C', tex: `\\text{pH} \\approx -\\log(${tex(C)}) = ${aprox.toFixed(2)}` },
      { titulo: 'Incluyendo la autoionización del agua (importante si C < 10⁻⁶ M)', tex: `[\\ce{H3O+}] = \\dfrac{C + \\sqrt{C^2 + 4K_w}}{2}\\Rightarrow\\text{pH} = ${pH.toFixed(3)}` },
    ];
  } else if (tipo === 'base-fuerte') {
    pH = pHBaseFuerte(C);
    aprox = 14 + logC;
    pasos = [{ titulo: 'Base fuerte: [OH⁻] ≈ C', tex: `\\text{pOH} = -\\log(${tex(C)}) = ${(-logC).toFixed(2)}\\qquad \\text{pH} = 14 - \\text{pOH} = ${aprox.toFixed(2)}` }];
  } else if (tipo === 'acido-debil') {
    pH = pHAcidoDebil(C, acido.Ka);
    const Ka = acido.Ka[0]!;
    aprox = pHAcidoDebilAprox(C, Ka);
    const alfa = porcentajeIonizacion(C, Ka);
    pasos = [
      { titulo: 'Equilibrio de ionización (primera constante)', tex: `K_a = \\dfrac{x^2}{C - x} = ${tex(Ka)}` },
      { titulo: 'Aproximación x ≪ C', tex: `x \\approx \\sqrt{K_aC} = ${tex(Math.sqrt(Ka * C))}\\Rightarrow\\text{pH} \\approx ${aprox.toFixed(3)}` },
      { titulo: `Ionización: ${alfa.toFixed(2)} % ${alfa < 5 ? '(< 5 %: la aproximación es válida)' : '(> 5 %: hay que resolver la cuadrática)'}` },
      { titulo: `Cálculo exacto por balance de carga${acido.Ka.length > 1 ? ' con todas las constantes' : ''}: pH = ${pH.toFixed(3)}` },
    ];
  } else {
    pH = pHBaseDebil(C, base.Kb);
    aprox = 14 + Math.log10(Math.sqrt(base.Kb * C));
    pasos = [
      { titulo: 'B + H₂O ⇌ BH⁺ + OH⁻', tex: `K_b = \\dfrac{x^2}{C - x} = ${tex(base.Kb)}\\qquad x \\approx \\sqrt{K_bC} = ${tex(Math.sqrt(base.Kb * C))}` },
      { titulo: `pOH ≈ ${(14 - aprox).toFixed(3)} → pH ≈ ${aprox.toFixed(3)}` },
      { titulo: `Cálculo exacto: pH = ${pH.toFixed(3)}` },
    ];
  }
  // Diagrama de distribución de especies (ácido débil o ácido conjugado de la base)
  const Ka = tipo === 'acido-debil' ? acido.Ka : tipo === 'base-debil' ? [KW / base.Kb] : null;
  const nombres = tipo === 'acido-debil' ? especiesDe(acido.formula, acido.Ka.length) : tipo === 'base-debil' ? [`${base.formula}H⁺`, base.formula] : [];
  const distribucion = useMemo(
    () => (Ka ? Array.from({ length: 141 }, (_, i) => Object.fromEntries([['pH', i / 10], ...fracciones(Ka, 10 ** -(i / 10)).map((a, j) => [nombres[j]!, a])])) : []),
    [Ka?.join(','), nombres.join(',')],
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block font-medium">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)} className={input}>
              <option value="acido-fuerte">ácido fuerte (HCl, HNO₃…)</option>
              <option value="base-fuerte">base fuerte (NaOH, KOH…)</option>
              <option value="acido-debil">ácido débil</option>
              <option value="base-debil">base débil</option>
            </select>
          </label>
          {tipo === 'acido-debil' && (
            <label>
              <span className="mb-1 block font-medium">Ácido</span>
              <select value={ia} onChange={(e) => setIa(Number(e.target.value))} className={input}>
                {datos.acidos.map((a, i) => (
                  <option key={a.formula} value={i}>
                    {a.nombre} ({a.formula})
                  </option>
                ))}
              </select>
            </label>
          )}
          {tipo === 'base-debil' && (
            <label>
              <span className="mb-1 block font-medium">Base</span>
              <select value={ib} onChange={(e) => setIb(Number(e.target.value))} className={input}>
                {datos.bases.map((b, i) => (
                  <option key={b.formula} value={i}>
                    {b.nombre} ({b.formula})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <Slider etiqueta="Concentración" valor={logC} min={-8} max={0} paso={0.05} alCambiar={setLogC} formato={(v) => `${sci(10 ** v)} M`} />
        {tipo === 'acido-debil' && <p className="text-texto-suave">{acido.Ka.map((k, i) => `Ka${acido.Ka.length > 1 ? i + 1 : ''} = ${sci(k)}`).join('; ')}</p>}
        {tipo === 'base-debil' && <p className="text-texto-suave">Kb = {sci(base.Kb)}; Ka del ácido conjugado = Kw/Kb = {sci(KW / base.Kb)}</p>}
        <div className="flex items-center gap-4 rounded-lg border border-borde bg-superficie p-4">
          <div className="h-14 w-14 shrink-0 rounded-full border border-borde" style={{ background: colorPH(pH) }} aria-hidden />
          <div>
            <p className="text-2xl font-semibold tabular-nums">pH = {pH.toFixed(2)}</p>
            {aprox !== null && <p className="text-texto-suave tabular-nums">Aproximación de los textos: {aprox.toFixed(2)} (diferencia {Math.abs(aprox - pH).toFixed(3)})</p>}
          </div>
        </div>
        <PasoAPaso pasos={pasos} />
        <p className="text-xs text-texto-suave">
          Constantes a 25 °C: Chang, tablas 15.3–15.5 <InsigniaRevision />
        </p>
      </div>
      {Ka && (
        <div className="h-[320px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Diagrama de distribución de especies frente al pH">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={distribucion} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
              <XAxis dataKey="pH" type="number" domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'pH', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={40} label={{ value: 'fracción α', angle: -90, position: 'insideLeft', fill: 'var(--texto-suave)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(x) => `pH ${x}`} formatter={(y) => Number(y).toFixed(3)} />
              <Legend verticalAlign="top" />
              <ReferenceLine x={Number(pH.toFixed(1))} stroke="var(--texto)" strokeDasharray="4 3" />
              {nombres.map((n, i) => (
                <Line key={n} dataKey={n} stroke={['var(--acento)', '#f97316', '#a855f7', '#22c55e'][i]} strokeWidth={2} dot={false} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/** Nombres de las formas H₃A, H₂A⁻, HA²⁻, A³⁻ a partir de la fórmula del ácido. */
function especiesDe(formula: string, n: number): string[] {
  const SUP = ['', '⁻', '²⁻', '³⁻'];
  if (/COOH$/.test(formula)) return [formula, formula.replace(/COOH$/, 'COO⁻')];
  if (/^H\d?/.test(formula)) {
    const m = /^H(\d?)(.*)$/.exec(formula)!;
    const h = Number(m[1] || 1);
    return Array.from({ length: n + 1 }, (_, i) => {
      const nh = h - i;
      return `${nh > 0 ? `H${nh > 1 ? nh : ''}` : ''}${m[2]}${SUP[i]}`;
    });
  }
  // Ácidos orgánicos: R–COOH → R–COO⁻ (y fenol → fenóxido)
  return [formula, formula.replace(/OH$/, 'O') + '⁻'];
}

function Buffer() {
  const monopr = datos.acidos.filter((a) => a.Ka.length === 1);
  const [ia, setIa] = useState(monopr.findIndex((a) => a.formula === 'CH3COOH'));
  const [cA, setCA] = useState(0.1);
  const [cB, setCB] = useState(0.1);
  const [mmol, setMmol] = useState(0);
  const V = 0.1; // L
  const a = monopr[ia]!;
  const Ka = a.Ka[0]!;
  // Ácido (+) o base (−) fuerte añadidos: el Cl⁻ o el Na⁺ son iones espectadores
  const n = mmol / 1000 / V;
  const sis = { sistemas: [{ C: cA + cB, Ka: [Ka], cargaProtonada: 0 }] };
  const pH0 = pHSolucion({ ...sis, cationes: cB });
  const pH1 = pHSolucion({ ...sis, cationes: cB + Math.max(0, -n), aniones: Math.max(0, n) });
  const agua = n === 0 ? 7 : n > 0 ? pHAcidoFuerte(n) : pHBaseFuerte(-n);
  const capacidad = n > 0 ? n < cB : -n < cA;
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-medium">Par ácido / base conjugada</span>
          <select value={ia} onChange={(e) => setIa(Number(e.target.value))} className={input}>
            {monopr.map((x, i) => (
              <option key={x.formula} value={i}>
                {x.nombre} / su sal de sodio (pKa = {(-Math.log10(x.Ka[0]!)).toFixed(2)})
              </option>
            ))}
          </select>
        </label>
        <Slider etiqueta="[HA]" valor={cA} min={0.01} max={1} paso={0.01} unidad="M" alCambiar={setCA} />
        <Slider etiqueta="[A⁻]" valor={cB} min={0.01} max={1} paso={0.01} unidad="M" alCambiar={setCB} />
        <Slider etiqueta="Ácido (+) o base (−) fuerte añadidos a 100 mL" valor={mmol} min={-10} max={10} paso={0.5} unidad="mmol" alCambiar={setMmol} />
        <PasoAPaso
          pasos={[
            { titulo: 'Henderson-Hasselbalch', tex: `\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\ce{A-}]}{[\\ce{HA}]} = ${(-Math.log10(Ka)).toFixed(3)} + \\log\\dfrac{${cB}}{${cA}} = ${hendersonHasselbalch(Ka, cB, cA).toFixed(3)}` },
            ...(mmol !== 0
              ? [
                  {
                    titulo: mmol > 0 ? `El H⁺ añadido convierte A⁻ en HA: ${mmol} mmol` : `El OH⁻ añadido convierte HA en A⁻: ${-mmol} mmol`,
                    tex: `\\text{pH} = \\text{p}K_a + \\log\\dfrac{${(cB * 100 - mmol).toFixed(1)}}{${(cA * 100 + mmol).toFixed(1)}} = ${capacidad ? hendersonHasselbalch(Ka, cB * 100 - mmol, cA * 100 + mmol).toFixed(3) : '\\text{(se agotó el buffer)}'}`,
                  },
                ]
              : []),
            { titulo: 'El valor exacto (balance de carga) aparece en el panel.' },
          ]}
        />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <figure className="rounded-lg border border-borde bg-superficie p-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full border border-borde" style={{ background: colorPH(pH1) }} aria-hidden />
            <figcaption className="mt-2">
              Buffer: <strong className="tabular-nums">{pH0.toFixed(2)} → {pH1.toFixed(2)}</strong>
            </figcaption>
          </figure>
          <figure className="rounded-lg border border-borde bg-superficie p-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full border border-borde" style={{ background: colorPH(agua) }} aria-hidden />
            <figcaption className="mt-2">
              Agua pura: <strong className="tabular-nums">7,00 → {agua.toFixed(2)}</strong>
            </figcaption>
          </figure>
        </div>
        <p>
          {capacidad
            ? `El buffer amortigua: su pH cambia ${Math.abs(pH1 - pH0).toFixed(2)} unidades, frente a ${Math.abs(agua - 7).toFixed(2)} en agua pura.`
            : 'Se superó la capacidad del buffer: se consumió todo el componente que neutraliza lo añadido.'}
        </p>
        <p className="text-texto-suave">Un buffer es más eficaz cuando [A⁻] ≈ [HA] (pH ≈ pKa) y las concentraciones son altas.</p>
      </div>
    </div>
  );
}

function Ksp() {
  const [k, setK] = useState(0);
  const sal = datos.ksp[k]!;
  const [comun, setComun] = useState(0);
  const [cM, setCM] = useState(1e-4);
  const [cA, setCAn] = useState(1e-4);
  const s = solubilidadMolar(sal.Ksp, sal.x, sal.y);
  const sComun = solubilidadIonComun(sal.Ksp, sal.x, sal.y, 0, comun);
  const Q = productoIonico(cM, cA, sal.x, sal.y);
  const Mformula = useMemo(() => {
    try {
      return masaMolar(sal.formula);
    } catch {
      return NaN;
    }
  }, [sal.formula]);
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-medium">Sal poco soluble</span>
          <select value={k} onChange={(e) => setK(Number(e.target.value))} className={input}>
            {datos.ksp.map((x, i) => (
              <option key={x.formula} value={i}>
                {x.nombre} ({x.formula}), Ksp = {sci(x.Ksp)}
              </option>
            ))}
          </select>
        </label>
        <Ce bloque>{`${aMhchem(sal.formula)}(s) <=> ${sal.x > 1 ? sal.x : ''}${sal.cation.replace(/(\d)\+$/, '^$1+')}(ac) + ${sal.y > 1 ? sal.y : ''}${sal.anion.replace(/(\d)-$/, '^$1-')}(ac)`}</Ce>
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <p>
            Solubilidad molar en agua: <strong>{sci(s)} M</strong>
            {Number.isFinite(Mformula) && ` = ${sci(s * Mformula)} g/L`}
          </p>
          <PasoAPaso
            pasos={[
              { titulo: 'Expresión de Ksp con s = solubilidad molar', tex: `K_{sp} = (${sal.x}s)^{${sal.x}}(${sal.y}s)^{${sal.y}} = ${sal.x ** sal.x * sal.y ** sal.y}s^{${sal.x + sal.y}}` },
              { titulo: 'Despejando', tex: `s = \\sqrt[${sal.x + sal.y}]{\\dfrac{${tex(sal.Ksp)}}{${sal.x ** sal.x * sal.y ** sal.y}}} = ${tex(s)}\\ \\text{M}` },
            ]}
          />
        </div>
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <Slider etiqueta={`Ion común: [${sal.anion}] añadido`} valor={comun} min={0} max={0.5} paso={0.01} unidad="M" alCambiar={setComun} />
          <p className="mt-2">
            Solubilidad con ion común: <strong>{sci(sComun)} M</strong> ({((100 * sComun) / s).toPrecision(3)} % de la solubilidad en agua pura)
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">¿Se forma precipitado?</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">[{sal.cation}] (M)</span>
            <input type="number" step="any" value={cM} onChange={(e) => setCM(Number(e.target.value))} className={`${input} w-28`} />
          </label>
          <label>
            <span className="mb-1 block">[{sal.anion}] (M)</span>
            <input type="number" step="any" value={cA} onChange={(e) => setCAn(Number(e.target.value))} className={`${input} w-28`} />
          </label>
        </div>
        <p className="mt-3">
          Q = [{sal.cation}]<sup>{sal.x}</sup>[{sal.anion}]<sup>{sal.y}</sup> = <strong>{sci(Q)}</strong>
        </p>
        <p className={`mt-1 font-semibold ${Q > sal.Ksp ? 'text-error' : 'text-exito'}`}>
          {Q > sal.Ksp ? 'Q > Ksp: precipita hasta que Q = Ksp.' : Q < sal.Ksp ? 'Q < Ksp: no precipita (solución insaturada).' : 'Q = Ksp: solución saturada.'}
        </p>
        <p className="mt-3 text-xs text-texto-suave">
          Ksp a 25 °C: Chang, tabla 16.2 <InsigniaRevision />
        </p>
      </div>
    </div>
  );
}


export default function AcidosBases() {
  const [seccion, setSeccion] = useState<Seccion>('escala');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: ácidos y bases">
          <div className="space-y-4">
            <p>
              <strong>Arrhenius:</strong> un ácido libera H⁺ en agua y una base libera OH⁻. <strong>Brønsted-Lowry:</strong> un ácido cede un protón y una base lo
              acepta; cada ácido tiene su base conjugada (HA / A⁻). <strong>Lewis:</strong> un ácido acepta un par de electrones y una base lo cede.
            </p>
            <Formula tex="\ce{HA + H2O <=> H3O+ + A-}\qquad K_a = \dfrac{[\ce{H3O+}][\ce{A-}]}{[\ce{HA}]}\qquad K_aK_b = K_w = 1{,}0\times10^{-14}" bloque />
            <Formula tex="\text{pH} = -\log[\ce{H3O+}]\qquad \text{pH} + \text{pOH} = 14\qquad [\ce{H3O+}] \approx \sqrt{K_aC}" bloque />
            <p>Hidrólisis: el anión de un ácido débil (CH₃COO⁻) da soluciones básicas; el catión de una base débil (NH₄⁺), soluciones ácidas.</p>
            <p>Buffer (solución amortiguadora): ácido débil + su base conjugada.</p>
            <Formula tex="\text{pH} = \text{p}K_a + \log\dfrac{[\ce{A-}]}{[\ce{HA}]}" bloque />
            <p>Solubilidad: para MₓAᵧ(s) ⇌ xMʸ⁺ + yAˣ⁻, Ksp = [M]ˣ[A]ʸ. Precipita si Q &gt; Ksp. Un ion común disminuye la solubilidad.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Ácidos y bases">
        {seccion === 'escala' && <Escala />}
        {seccion === 'calcular' && <Calcular />}
        {seccion === 'buffer' && <Buffer />}
        {seccion === 'ksp' && <Ksp />}
      </Pestanas>
    </div>
  );
}
