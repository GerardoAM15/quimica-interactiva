import { useEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import datos from '@/data/acidos-bases.json';
import { curvaTitulacion, KW, pHTitulacion, volumenesEquivalencia, type Titulacion as DatosTitulacion } from '@/chem/acidBase';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';

interface Caso {
  id: string;
  titulo: string;
  analito: string;
  titulante: string;
  reaccion: string;
  Ka?: number[];
  Kb?: number;
  base?: boolean;
}

const KA = (f: string) => datos.acidos.find((a) => a.formula === f)!.Ka;
const CASOS: Caso[] = [
  { id: 'ff', titulo: 'HCl con NaOH (fuerte-fuerte)', analito: 'HCl', titulante: 'NaOH', reaccion: 'H3O+ + OH- -> 2H2O' },
  { id: 'df', titulo: 'CH₃COOH con NaOH (débil-fuerte)', analito: 'CH3COOH', titulante: 'NaOH', reaccion: 'CH3COOH + OH- -> CH3COO- + H2O', Ka: KA('CH3COOH') },
  { id: 'bf', titulo: 'NH₃ con HCl (base débil-ácido fuerte)', analito: 'NH3', titulante: 'HCl', reaccion: 'NH3 + H3O+ -> NH4+ + H2O', base: true, Kb: datos.bases.find((b) => b.formula === 'NH3')!.Kb },
  { id: 'pp', titulo: 'H₃PO₄ con NaOH (poliprótico)', analito: 'H3PO4', titulante: 'NaOH', reaccion: 'H3PO4 + OH- -> H2PO4- + H2O', Ka: KA('H3PO4') },
];

/** Mezcla dos colores hex según t ∈ [0, 1]. */
function mezclar(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i]! - v) * t)).join(',')})`;
}

/** Color del matraz: forma ácida → básica dentro del intervalo de viraje. */
function colorIndicador(ind: (typeof datos.indicadores)[number], pH: number) {
  const t = Math.max(0, Math.min(1, (pH - ind.desde) / (ind.hasta - ind.desde)));
  if (!ind.acido) return { color: ind.basico, opacidad: t * 0.85 };
  return { color: mezclar(ind.acido, ind.basico, t), opacidad: 0.75 };
}

function Montaje({ vAgregado, vBureta, pH, ind, goteando }: { vAgregado: number; vBureta: number; pH: number; ind: (typeof datos.indicadores)[number]; goteando: boolean }) {
  const nivel = Math.max(0, 1 - vAgregado / vBureta);
  const { color, opacidad } = colorIndicador(ind, pH);
  return (
    <svg viewBox="0 0 160 320" className="h-80 w-40" role="img" aria-label={`Bureta con ${(vBureta - vAgregado).toFixed(2)} mL; matraz a pH ${pH.toFixed(2)}`}>
      {/* Bureta */}
      <rect x={70} y={10} width={20} height={180} fill="none" stroke="var(--texto-suave)" strokeWidth={2} />
      <rect x={72} y={12 + (1 - nivel) * 176} width={16} height={nivel * 176} fill="var(--acento)" opacity={0.35} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={70} x2={i % 5 === 0 ? 80 : 76} y1={12 + (i / 10) * 176} y2={12 + (i / 10) * 176} stroke="var(--texto-suave)" />
      ))}
      <rect x={66} y={190} width={28} height={8} fill="var(--texto-suave)" />
      <rect x={77} y={198} width={6} height={18} fill="var(--texto-suave)" />
      {goteando && (
        <circle cx={80} cy={226} r={3} fill="var(--acento)">
          <animate attributeName="cy" from="218" to="262" dur="0.35s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Matraz Erlenmeyer */}
      <path d="M68 240 L68 262 L36 308 L124 308 L92 262 L92 240 Z" fill="var(--superficie-2)" />
      <path d="M68 240 L68 262 L36 308 L124 308 L92 262 L92 240 Z" fill={color} fillOpacity={opacidad} stroke="none" />
      <path d="M66 232 L66 262 L30 312 L130 312 L94 262 L94 232" fill="none" stroke="var(--texto-suave)" strokeWidth={2.5} />
    </svg>
  );
}

export default function Titulacion() {
  const [ic, setIc] = useState(1);
  const caso = CASOS[ic]!;
  const [Ca, setCa] = useState(0.1);
  const [Va, setVa] = useState(25);
  const [Ct, setCt] = useState(0.1);
  const [ii, setIi] = useState(datos.indicadores.findIndex((x) => x.nombre === 'fenolftaleína'));
  const ind = datos.indicadores[ii]!;
  const [v, setV] = useState(0);
  const [puntos, setPuntos] = useState<{ v: number; pH: number }[]>([]);
  const [abierta, setAbierta] = useState(false);
  const [velocidad, setVelocidad] = useState(1); // mL/s
  const [teorica, setTeorica] = useState(false);

  const t: DatosTitulacion = useMemo(() => ({ analito: { C: Ca, V: Va, Ka: caso.Ka, base: caso.base, Kb: caso.Kb }, titulante: { C: Ct } }), [Ca, Va, Ct, caso]);
  const veq = volumenesEquivalencia(t);
  // Puntos de equivalencia visibles (el tercero del H₃PO₄ no da salto apreciable)
  const veqVisibles = caso.id === 'pp' ? veq.slice(0, 2) : veq;
  const vBureta = Math.max(50, Math.ceil((veqVisibles.at(-1)! * 1.6) / 5) * 5);
  const curva = useMemo(() => curvaTitulacion(t, vBureta, 500), [t, vBureta]);
  const pH = pHTitulacion(t, v);

  // Reiniciar al cambiar el sistema
  useEffect(() => {
    setV(0);
    setPuntos([{ v: 0, pH: pHTitulacion(t, 0) }]);
    setAbierta(false);
  }, [t]);

  // Llave abierta: el volumen fluye a la velocidad elegida
  const vRef = useRef(v);
  vRef.current = v;
  useEffect(() => {
    if (!abierta) return;
    let raf = 0, ultimo = performance.now(), acumulado = 0;
    const cuadro = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      const nv = Math.min(vBureta, vRef.current + velocidad * dt);
      acumulado += velocidad * dt;
      setV(nv);
      if (acumulado >= Math.min(0.25, velocidad * 0.1)) {
        acumulado = 0;
        setPuntos((p) => [...p, { v: nv, pH: pHTitulacion(t, nv) }]);
      }
      if (nv >= vBureta) setAbierta(false);
      else raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [abierta, velocidad, t, vBureta]);

  const agregar = (dv: number) => {
    const nv = Math.min(vBureta, v + dv);
    setV(nv);
    setPuntos((p) => [...p, { v: nv, pH: pHTitulacion(t, nv) }]);
  };
  const reiniciar = () => {
    setAbierta(false);
    setV(0);
    setPuntos([{ v: 0, pH: pHTitulacion(t, 0) }]);
  };

  const pHeq = veqVisibles.map((x) => pHTitulacion(t, x));
  const adecuado = pHeq.some((p) => {
    // El viraje debe caer en el salto: pH a ±0,5 % del volumen de equivalencia
    const x = veqVisibles[pHeq.indexOf(p)]!;
    const a = pHTitulacion(t, x * 0.995), b = pHTitulacion(t, x * 1.005);
    return ind.desde < b && ind.hasta > a;
  });
  // Descripción de la zona actual de la curva
  const zona = (() => {
    const e = veq[0]!;
    if (v === 0) return `Solo el analito: pH inicial ${pHTitulacion(t, 0).toFixed(2)}.`;
    if (Math.abs(v - e) / e < 0.01) return caso.Ka || caso.Kb ? 'Punto de equivalencia: solo queda la sal, que se hidroliza.' : 'Punto de equivalencia: solución neutra (pH 7).';
    if (v < e) return caso.Ka || caso.Kb ? (Math.abs(v - e / 2) / e < 0.02 ? 'Semiequivalencia: [HA] = [A⁻], pH = pKa.' : 'Zona buffer: coexisten el ácido (o base) débil y su conjugado.') : 'Antes de la equivalencia: exceso de ácido.';
    return 'Después de la equivalencia: el pH lo fija el exceso de titulante.';
  })();
  const boton = 'rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2 disabled:opacity-50';
  const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';

  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: titulación ácido-base">
          <div className="space-y-4">
            <p>En una titulación se añade una solución de concentración conocida (titulante) desde la bureta hasta reaccionar por completo con el analito.</p>
            <Formula tex="\text{Punto de equivalencia: } n_{\text{ácido}}\cdot\theta_a = n_{\text{base}}\cdot\theta_b\quad\Rightarrow\quad C_aV_a = C_bV_b\ \ (\theta = 1)" bloque />
            <p>Fuerte-fuerte: pH = 7 en la equivalencia. Débil-fuerte: pH &gt; 7 (el anión se hidroliza); en la semiequivalencia pH = pKa. Base débil-ácido fuerte: pH &lt; 7.</p>
            <Formula tex="\text{Equivalencia (débil-fuerte): } [\ce{OH-}] = \sqrt{\dfrac{K_w}{K_a}\,C_{\text{sal}}}" bloque />
            <p>El indicador debe cambiar de color dentro del salto brusco de pH que rodea al punto de equivalencia (el punto final debe coincidir con él).</p>
          </div>
        </Teoria>
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_auto_1fr]">
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block font-medium">Titulación</span>
            <select value={ic} onChange={(e) => setIc(Number(e.target.value))} className={`${input} w-full`}>
              {CASOS.map((c, i) => (
                <option key={c.id} value={i}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </label>
          <Ce>{caso.reaccion}</Ce>
          <Slider etiqueta={`[${caso.analito}] en el matraz`} valor={Ca} min={0.02} max={0.5} paso={0.01} unidad="M" alCambiar={setCa} />
          <Slider etiqueta="Volumen del analito" valor={Va} min={5} max={50} paso={1} unidad="mL" alCambiar={setVa} />
          <Slider etiqueta={`[${caso.titulante}] en la bureta`} valor={Ct} min={0.02} max={0.5} paso={0.01} unidad="M" alCambiar={setCt} />
          <label className="block">
            <span className="mb-1 block font-medium">Indicador</span>
            <select value={ii} onChange={(e) => setIi(Number(e.target.value))} className={`${input} w-full`}>
              {datos.indicadores.map((x, i) => (
                <option key={x.nombre} value={i}>
                  {x.nombre} (vira entre {x.desde} y {x.hasta})
                </option>
              ))}
            </select>
          </label>
          <p className={adecuado ? 'text-exito' : 'text-aviso'}>{adecuado ? 'Este indicador vira dentro del salto de pH: es adecuado.' : 'Este indicador vira fuera del salto: el punto final no coincidirá con el de equivalencia.'}</p>
          <p className="text-xs text-texto-suave">
            Constantes e indicadores: Chang <InsigniaRevision />
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Montaje vAgregado={v} vBureta={vBureta} pH={pH} ind={ind} goteando={abierta} />
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className={boton} onClick={() => setAbierta((a) => !a)} disabled={v >= vBureta} aria-pressed={abierta}>
              {abierta ? 'Cerrar llave' : 'Abrir llave'}
            </button>
            <button type="button" className={boton} onClick={() => agregar(0.05)} disabled={abierta || v >= vBureta}>
              + 1 gota
            </button>
            <button type="button" className={boton} onClick={() => agregar(1)} disabled={abierta || v >= vBureta}>
              + 1 mL
            </button>
            <button type="button" className={boton} onClick={reiniciar}>
              Reiniciar
            </button>
          </div>
          <label className="text-sm">
            Caudal:{' '}
            <select value={velocidad} onChange={(e) => setVelocidad(Number(e.target.value))} className={input}>
              <option value={0.2}>lento (0,2 mL/s)</option>
              <option value={1}>medio (1 mL/s)</option>
              <option value={3}>rápido (3 mL/s)</option>
            </select>
          </label>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg border border-borde bg-superficie p-2">
              <p className="text-texto-suave">Volumen añadido</p>
              <p className="text-xl font-semibold tabular-nums">{v.toFixed(2)} mL</p>
            </div>
            <div className="rounded-lg border border-borde bg-superficie p-2">
              <p className="text-texto-suave">pH</p>
              <p className="text-xl font-semibold tabular-nums">{pH.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-borde bg-superficie p-2">
              <p className="text-texto-suave">V equivalencia</p>
              <p className="text-xl font-semibold tabular-nums">{veqVisibles.map((x) => x.toFixed(2)).join(' / ')} mL</p>
            </div>
          </div>
          <p className="text-sm" aria-live="polite">
            {zona}
          </p>
          <div className="h-[340px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Curva de titulación: pH frente al volumen añadido">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={curva} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
                <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
                <XAxis dataKey="v" type="number" domain={[0, vBureta]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'V de titulante (mL)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
                <YAxis dataKey="pH" domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={36} />
                <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(x) => `${Number(x).toFixed(2)} mL`} formatter={(y) => [Number(y).toFixed(2), 'pH']} />
                <ReferenceArea y1={ind.desde} y2={ind.hasta} fill={ind.basico} fillOpacity={0.15} />
                {veqVisibles.map((x) => (
                  <ReferenceLine key={x} x={x} stroke="var(--aviso)" strokeDasharray="4 3" />
                ))}
                {teorica && <Line dataKey="pH" stroke="var(--texto-suave)" strokeWidth={1.5} dot={false} isAnimationActive={false} />}
                <Scatter data={puntos} dataKey="pH" fill="var(--acento)" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <label className="text-sm">
            <input type="checkbox" checked={teorica} onChange={(e) => setTeorica(e.target.checked)} /> Mostrar la curva teórica completa
          </label>
          <PasoAPaso
            pasos={[
              { titulo: 'Volumen de equivalencia', tex: `V_{eq} = \\dfrac{C_aV_a}{C_t} = \\dfrac{${Ca}\\times${Va}}{${Ct}} = ${veq[0]!.toFixed(2)}\\ \\text{mL}` },
              ...(caso.Ka && caso.Ka.length === 1
                ? [
                    { titulo: `Semiequivalencia (${(veq[0]! / 2).toFixed(2)} mL): pH = pKa = ${(-Math.log10(caso.Ka[0]!)).toFixed(2)}` },
                    { titulo: 'Equivalencia: hidrólisis del anión', tex: `C_{sal} = \\dfrac{${Ca}\\times${Va}}{${Va} + ${veq[0]!.toFixed(2)}};\\ [\\ce{OH-}] = \\sqrt{\\dfrac{K_w}{K_a}C_{sal}}\\Rightarrow \\text{pH} = ${(14 + Math.log10(Math.sqrt((KW / caso.Ka[0]!) * ((Ca * Va) / (Va + veq[0]!))))).toFixed(2)}` },
                  ]
                : []),
              { titulo: `pH en la equivalencia (cálculo exacto): ${pHeq.map((p) => p.toFixed(2)).join(' y ')}` },
              { titulo: 'Los puntos azules son tus mediciones; el cálculo de cada punto usa el balance de carga exacto con la dilución.' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
