import { useState } from 'react';
import { balancear, ecuacionMhchem, ErrorBalanceo } from '@/chem/balance';
import { clasificarReaccion, NOMBRE_TIPO, type TipoReaccion } from '@/chem/reacciones';
import { Teoria } from '@/components/Teoria';
import { Ce } from '@/components/Formula';

const TIPOS: { tipo: TipoReaccion; esquema: string; ejemplo: string; descripcion: string }[] = [
  { tipo: 'sintesis', esquema: 'A + B → AB', ejemplo: 'H2 + O2 -> H2O', descripcion: 'Dos o más reactivos forman un solo producto.' },
  { tipo: 'descomposicion', esquema: 'AB → A + B', ejemplo: 'CaCO3 -> CaO + CO2', descripcion: 'Un compuesto se separa en sustancias más simples (pirólisis, electrólisis, fotólisis).' },
  { tipo: 'desplazamiento-simple', esquema: 'A + BC → AC + B', ejemplo: 'Zn + CuSO4 -> ZnSO4 + Cu', descripcion: 'Un elemento más activo reemplaza a otro en su compuesto.' },
  { tipo: 'doble-desplazamiento', esquema: 'AB + CD → AD + CB', ejemplo: 'AgNO3 + NaCl -> AgCl + NaNO3', descripcion: 'Dos compuestos intercambian sus iones; suele formarse un precipitado.' },
  { tipo: 'combustion', esquema: 'CₓHᵧ + O₂ → CO₂ + H₂O', ejemplo: 'C3H8 + O2 -> CO2 + H2O', descripcion: 'Un combustible reacciona con O₂ liberando energía (exotérmica).' },
  { tipo: 'neutralizacion', esquema: 'ácido + base → sal + H₂O', ejemplo: 'HCl + NaOH -> NaCl + H2O', descripcion: 'H⁺ del ácido y OH⁻ de la base forman agua.' },
  { tipo: 'redox', esquema: 'oxidante + reductor', ejemplo: 'Fe2O3 + CO -> Fe + CO2', descripcion: 'Hay transferencia de electrones: un elemento se oxida y otro se reduce.' },
];

/** Esquema animado: bolitas de colores que se reorganizan (A, B, C, D). */
function Esquema({ tipo }: { tipo: TipoReaccion }) {
  const [despues, setDespues] = useState(false);
  const C: Record<string, string> = { A: '#38bdf8', B: '#f472b6', C: '#facc15', D: '#4ade80' };
  // Posiciones antes/después de cada partícula
  const config: Record<TipoReaccion, { p: string; a: [number, number]; d: [number, number] }[]> = {
    sintesis: [{ p: 'A', a: [40, 50], d: [180, 50] }, { p: 'B', a: [100, 50], d: [210, 50] }],
    descomposicion: [{ p: 'A', a: [60, 50], d: [160, 50] }, { p: 'B', a: [90, 50], d: [230, 50] }],
    'desplazamiento-simple': [{ p: 'A', a: [30, 50], d: [170, 50] }, { p: 'B', a: [90, 50], d: [250, 50] }, { p: 'C', a: [120, 50], d: [200, 50] }],
    'doble-desplazamiento': [{ p: 'A', a: [20, 50], d: [160, 50] }, { p: 'B', a: [50, 50], d: [260, 50] }, { p: 'C', a: [90, 50], d: [230, 50] }, { p: 'D', a: [120, 50], d: [190, 50] }],
    combustion: [{ p: 'A', a: [40, 50], d: [170, 35] }, { p: 'B', a: [70, 50], d: [170, 65] }, { p: 'C', a: [110, 50], d: [230, 50] }],
    neutralizacion: [{ p: 'A', a: [30, 50], d: [170, 50] }, { p: 'B', a: [60, 50], d: [230, 50] }, { p: 'C', a: [100, 50], d: [200, 50] }, { p: 'D', a: [130, 50], d: [260, 50] }],
    redox: [{ p: 'A', a: [40, 50], d: [180, 50] }, { p: 'B', a: [110, 50], d: [240, 50] }],
  };
  const reducido = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <button type="button" onClick={() => setDespues((d) => !d)} className="block w-full" aria-label={`Animar esquema de ${NOMBRE_TIPO[tipo]}`}>
      <svg viewBox="0 0 290 100" className="w-full text-texto" aria-hidden>
        <text x={145} y={56} fontSize={18} textAnchor="middle" fill="currentColor" opacity={0.5}>
          →
        </text>
        {config[tipo].map((b) => {
          const [x, y] = despues ? b.d : b.a;
          return (
            <g key={b.p} style={{ transform: `translate(${x}px, ${y}px)`, transition: reducido ? 'none' : 'transform 0.9s ease-in-out' }}>
              <circle r={14} fill={C[b.p]} />
              <text y={5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0b1020">
                {b.p}
              </text>
              {tipo === 'redox' && b.p === 'A' && despues && <text y={-18} textAnchor="middle" fontSize={10} fill="#dc2626">+e⁻</text>}
            </g>
          );
        })}
      </svg>
    </button>
  );
}

function Clasificador() {
  const [texto, setTexto] = useState('Zn + HCl -> ZnCl2 + H2');
  let resultado: { mhchem: string; tipos: TipoReaccion[]; exp: string[] } | null = null;
  let error: string | null = null;
  try {
    const r = balancear(texto);
    const c = clasificarReaccion(r);
    resultado = { mhchem: ecuacionMhchem(r), tipos: c.tipos, exp: c.explicaciones };
  } catch (e) {
    error = e instanceof ErrorBalanceo ? e.message : `Revisa la ecuación: ${(e as Error).message}`;
  }
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Clasifica una reacción</h3>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full max-w-xl rounded-md border border-borde bg-superficie px-3 py-1.5 font-mono" aria-label="Ecuación química" />
      {error && <p className="text-sm text-aviso">{error}</p>}
      {resultado && (
        <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <Ce bloque>{resultado.mhchem}</Ce>
          <ul className="mt-2 flex flex-wrap gap-2">
            {resultado.tipos.map((t) => (
              <li key={t} className="rounded-full bg-acento px-3 py-0.5 text-xs font-semibold text-acento-texto">
                {NOMBRE_TIPO[t]}
              </li>
            ))}
          </ul>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {resultado.exp.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function ReaccionesQuimicas() {
  return (
    <div className="space-y-6">
      <Teoria titulo="Teoría: reacciones químicas">
        <div className="space-y-3">
          <p>Una reacción química reorganiza los átomos: se rompen y forman enlaces, pero se conservan la masa (ley de Lavoisier) y el número de átomos de cada elemento.</p>
          <p>Evidencias de una reacción: cambio de color, desprendimiento de gas, formación de precipitado, liberación o absorción de energía.</p>
          <p>Según la energía: exotérmicas (liberan calor, ΔH &lt; 0) y endotérmicas (absorben calor, ΔH &gt; 0).</p>
          <p>Una reacción puede pertenecer a varios tipos a la vez: la combustión es también redox; muchos desplazamientos simples son redox.</p>
        </div>
      </Teoria>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIPOS.map((t) => (
          <article key={t.tipo} className="rounded-lg border border-borde bg-superficie p-4">
            <h3 className="font-semibold">{NOMBRE_TIPO[t.tipo]}</h3>
            <p className="font-mono text-sm text-texto-suave">{t.esquema}</p>
            <Esquema tipo={t.tipo} />
            <p className="text-sm">{t.descripcion}</p>
            <div className="mt-2 text-sm">
              <Ce>{ecuacionMhchem(balancear(t.ejemplo))}</Ce>
            </div>
          </article>
        ))}
      </div>
      <p className="text-xs text-texto-suave">Toca un esquema para animarlo.</p>
      <Clasificador />
    </div>
  );
}
