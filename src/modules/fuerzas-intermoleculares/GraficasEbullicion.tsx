import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from 'recharts';
import { ALCANOS, ebullicion, ebullicionElemento, HIDRUROS, ISOMEROS_C5, MASA_SIMILAR } from './datosEbullicion';
import { InsigniaRevision } from '@/components/InsigniaRevision';

type Grafica = 'hidruros' | 'alcanos' | 'isomeros' | 'masa' | 'nobles';
const OPCIONES: [Grafica, string][] = [
  ['hidruros', 'Hidruros de los grupos 14–17'],
  ['alcanos', 'Alcanos lineales'],
  ['isomeros', 'Isómeros C₅H₁₂'],
  ['masa', 'Masa molar parecida'],
  ['nobles', 'Gases nobles y halógenos'],
];
const COLORES = ['#38bdf8', '#a78bfa', '#f472b6', '#facc15'];
const ejes = { tick: { fill: 'var(--texto-suave)', fontSize: 12 } };
const tooltip = { contentStyle: { background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' } };

/** Gráficas comparativas de puntos de ebullición (datos de PubChem). */
export default function GraficasEbullicion() {
  const [g, setG] = useState<Grafica>('hidruros');

  let grafica: React.ReactNode;
  let explicacion: string;
  let pendiente = false;

  if (g === 'hidruros') {
    const datos = [2, 3, 4, 5].map((periodo, k) => {
      const fila: Record<string, number | string | null> = { periodo: `Periodo ${periodo}` };
      for (const h of HIDRUROS) {
        const p = ebullicion(h.moleculas[k]![0], h.moleculas[k]![1]);
        fila[h.grupo] = p.valor;
        fila[`${h.grupo}-et`] = h.moleculas[k]![1];
        pendiente ||= p.pendienteRevision;
      }
      return fila;
    });
    grafica = (
      <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
        <XAxis dataKey="periodo" {...ejes} />
        <YAxis {...ejes} unit=" °C" width={64} />
        <Tooltip {...tooltip} formatter={(v, n, item) => [`${v} °C (${(item.payload as Record<string, string>)[`${n}-et`]})`, n]} />
        <Legend />
        {HIDRUROS.map((h, i) => (
          <Line key={h.grupo} dataKey={h.grupo} stroke={COLORES[i]} strokeWidth={2} isAnimationActive={false} connectNulls />
        ))}
      </LineChart>
    );
    explicacion =
      'Dentro de cada grupo el punto de ebullición crece con la masa (más electrones → fuerzas de London más intensas), excepto el primer miembro de los grupos 15, 16 y 17: NH₃, H₂O y HF forman puentes de hidrógeno y hierven mucho más alto de lo esperado. El grupo 14 (CH₄…) no tiene esa anomalía.';
  } else if (g === 'alcanos') {
    const datos = ALCANOS.map(([n, c]) => ({ c, valor: ebullicion(n).valor }));
    grafica = (
      <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 18, left: 0 }}>
        <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
        <XAxis dataKey="c" {...ejes} label={{ value: 'Número de átomos de C', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
        <YAxis {...ejes} unit=" °C" width={64} />
        <Tooltip {...tooltip} labelFormatter={(c) => `C${c}H${2 * Number(c) + 2}`} formatter={(v) => [`${v} °C`, 'Ebullición']} />
        <Line dataKey="valor" stroke="#38bdf8" strokeWidth={2} isAnimationActive={false} />
      </LineChart>
    );
    explicacion = 'Los alcanos solo tienen fuerzas de London. Al alargar la cadena aumentan la superficie de contacto y el número de electrones, y con ellos el punto de ebullición.';
  } else if (g === 'isomeros') {
    const datos = ISOMEROS_C5.map(([n, e]) => ({ nombre: e, valor: ebullicion(n).valor }));
    grafica = (
      <BarChart data={datos} margin={{ top: 20, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
        <XAxis dataKey="nombre" {...ejes} />
        <YAxis {...ejes} unit=" °C" width={56} />
        <Tooltip {...tooltip} formatter={(v) => [`${v} °C`, 'Ebullición']} />
        <Bar dataKey="valor" fill="#a78bfa" isAnimationActive={false}>
          <LabelList dataKey="valor" position="top" fill="var(--texto)" fontSize={12} />
        </Bar>
      </BarChart>
    );
    explicacion = 'Los tres isómeros tienen la misma fórmula (C₅H₁₂) y masa. Cuanto más ramificada (más esférica) es la molécula, menor es su superficie de contacto y más débiles sus fuerzas de London.';
  } else if (g === 'masa') {
    const datos = MASA_SIMILAR.map(([n, e, f]) => {
      const p = ebullicion(n);
      return { nombre: e, valor: p.valor, fuerza: f, masa: p.masaMolar };
    });
    const color = (f: string) => (f.startsWith('puente') ? '#f472b6' : f.startsWith('dipolo') ? '#a78bfa' : '#38bdf8');
    grafica = (
      <BarChart data={datos} margin={{ top: 20, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
        <XAxis dataKey="nombre" {...ejes} interval={0} angle={-15} textAnchor="end" height={50} />
        <YAxis {...ejes} unit=" °C" width={56} />
        <Tooltip {...tooltip} formatter={(v, _n, item) => [`${v} °C · ${(item.payload as { fuerza: string; masa: number }).fuerza} · M = ${(item.payload as { masa: number }).masa} g/mol`, 'Ebullición']} />
        <Bar dataKey="valor" isAnimationActive={false}>
          {datos.map((d) => (
            <Cell key={d.nombre} fill={color(d.fuerza)} />
          ))}
          <LabelList dataKey="valor" position="top" fill="var(--texto)" fontSize={12} />
        </Bar>
      </BarChart>
    );
    explicacion = 'Con masas molares casi iguales (58–60 g/mol), el punto de ebullición lo decide el tipo de fuerza: London (celeste) < dipolo-dipolo (violeta) < puente de hidrógeno (rosado).';
  } else {
    const nobles = ['He', 'Ne', 'Ar', 'Kr', 'Xe'].map((s) => ({ nombre: s, valor: ebullicionElemento(s) }));
    const halogenos = ([['flúor (F2)', 'F₂'], ['cloro (Cl2)', 'Cl₂'], ['bromo (Br2)', 'Br₂'], ['yodo (I2)', 'I₂']] as const).map(([n, e]) => ({ nombre: e, valor: ebullicion(n).valor }));
    grafica = (
      <BarChart data={[...nobles, ...halogenos]} margin={{ top: 20, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
        <XAxis dataKey="nombre" {...ejes} />
        <YAxis {...ejes} unit=" °C" width={64} />
        <Tooltip {...tooltip} formatter={(v) => [`${v} °C`, 'Ebullición']} />
        <Bar dataKey="valor" isAnimationActive={false}>
          {[...nobles, ...halogenos].map((d, i) => (
            <Cell key={d.nombre} fill={i < nobles.length ? '#a78bfa' : '#22c55e'} />
          ))}
          <LabelList dataKey="valor" position="top" fill="var(--texto)" fontSize={11} />
        </Bar>
      </BarChart>
    );
    explicacion = 'Gases nobles (violeta) y halógenos (verde) son apolares: solo tienen fuerzas de London, que crecen con el tamaño y la polarizabilidad. El yodo es sólido a 25 °C y hierve a 184 °C.';
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Comparación">
        {OPCIONES.map(([k, t]) => (
          <button key={k} type="button" aria-pressed={g === k} onClick={() => setG(k)} className={`rounded border px-2 py-1 text-sm ${g === k ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="h-[360px] w-full rounded-lg border border-borde bg-superficie p-2" role="img" aria-label={`Gráfica de puntos de ebullición: ${OPCIONES.find((o) => o[0] === g)![1]}`}>
        <ResponsiveContainer width="100%" height="100%">
          {grafica as React.ReactElement}
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm">{explicacion}</p>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-texto-suave">
        Puntos de ebullición a 1 atm: PubChem (con su referencia original; elementos: tabla periódica de PubChem).
        {pendiente && <InsigniaRevision texto="H₂Te y SnH₄: CRC" titulo="Valores complementarios del CRC Handbook, pendientes de revisión" />}
      </p>
    </div>
  );
}
