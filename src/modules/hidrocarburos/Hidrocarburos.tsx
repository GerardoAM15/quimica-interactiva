import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formulaMolecularGrafo, nombrarOrganico, parsearNombre, RAICES } from '@/chem/nomenclatura/organica';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Formula } from '@/components/Formula';
import { Slider } from '@/components/Slider';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { NombreEstructura, type Ejemplo } from '@/components/organica/NombreEstructura';

type Seccion = 'nomenclatura' | 'series' | 'conformaciones';
const SECCIONES = [
  { id: 'nomenclatura', titulo: 'Nomenclatura IUPAC' },
  { id: 'series', titulo: 'Series homólogas' },
  { id: 'conformaciones', titulo: 'Conformaciones' },
] as const;

const EJEMPLOS: Ejemplo[] = [
  { tipo: 'alcano', smiles: 'CCCCCC' },
  { tipo: 'alcano ramificado', smiles: 'CC(C)CC(C)(C)C' },
  { tipo: 'alcano ramificado', smiles: 'CCC(C)C(CC)CCC' },
  { tipo: 'alcano ramificado', smiles: 'CCCC(C(C)C)CCCC' },
  { tipo: 'alqueno', smiles: 'CC=CCC' },
  { tipo: 'alqueno ramificado', smiles: 'CC(C)=CCC' },
  { tipo: 'dieno', smiles: 'C=CC=CC' },
  { tipo: 'alquino', smiles: 'CC#CCC' },
  { tipo: 'eno-ino', smiles: 'C=CCC#C' },
  { tipo: 'cicloalcano', smiles: 'CCC1CCCC1' },
  { tipo: 'cicloalcano', smiles: 'CC1CCC(C)CC1' },
  { tipo: 'cicloalqueno', smiles: 'CC1=CCCCC1' },
  { tipo: 'aromático', smiles: 'CCc1ccccc1' },
  { tipo: 'aromático', smiles: 'Cc1ccc(Cl)cc1' },
  { tipo: 'halogenuro', smiles: 'CC(Br)C(C)Cl' },
];

const sub = (f: string) => f.replace(/\d+/g, (d) => d.replace(/\d/g, (x) => '₀₁₂₃₄₅₆₇₈₉'[Number(x)]!));

function Series() {
  const filas = useMemo(
    () =>
      Array.from({ length: 10 }, (_, k) => {
        const n = k + 1;
        const r = RAICES[n]!;
        const intentar = (nombre: string) => {
          try {
            return { nombre: nombrarOrganico(parsearNombre(nombre)).nombre, formula: formulaMolecularGrafo(parsearNombre(nombre)) };
          } catch {
            return null;
          }
        };
        return {
          n,
          alcano: intentar(`${r}ano`),
          alqueno: n >= 2 ? intentar(n === 2 ? 'eteno' : `${r}-1-eno`) : null,
          alquino: n >= 2 ? intentar(n === 2 ? 'etino' : `${r}-1-ino`) : null,
          ciclo: n >= 3 ? intentar(`ciclo${r}ano`) : null,
        };
      }),
    [],
  );
  const celda = (x: { nombre: string; formula: string } | null) =>
    x ? (
      <>
        {x.nombre} <span className="text-texto-suave">({sub(x.formula)})</span>
      </>
    ) : (
      '—'
    );
  return (
    <div className="space-y-3 text-sm">
      <Formula tex="\text{Alcanos: } C_nH_{2n+2}\qquad \text{Alquenos y cicloalcanos: } C_nH_{2n}\qquad \text{Alquinos: } C_nH_{2n-2}" bloque />
      <p>Cada miembro de una serie homóloga difiere del anterior en un grupo –CH₂–. Las propiedades físicas (punto de ebullición, densidad) aumentan de forma gradual.</p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-texto-suave">
              <th className="pr-3 font-medium">n</th>
              <th className="pr-3 font-medium">Alcano</th>
              <th className="pr-3 font-medium">Alqueno</th>
              <th className="pr-3 font-medium">Alquino</th>
              <th className="pr-3 font-medium">Cicloalcano</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.n} className="border-t border-borde">
                <td className="py-1 pr-3 tabular-nums">{f.n}</td>
                <td className="pr-3">{celda(f.alcano)}</td>
                <td className="pr-3">{celda(f.alqueno)}</td>
                <td className="pr-3">{celda(f.alquino)}</td>
                <td className="pr-3">{celda(f.ciclo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Energía torsional aproximada E(φ) = a₀ + a₁cos φ + a₂cos 2φ + a₃cos 3φ (φ = 0: eclipsada).
 * Etano: barrera de 12 kJ/mol. Butano (C2–C3): totalmente eclipsada 19, gauche 3,8, eclipsada 16 y anti 0 kJ/mol.
 * Valores de McMurry, Química orgánica, cap. 3 (pendientes de revisión); los coeficientes se ajustan a esos cuatro puntos.
 */
function coeficientesButano(): number[] {
  const [E0, E60, E120, E180] = [19, 3.8, 16, 0];
  const a1a3 = (E0 - E180) / 2; // a₁ + a₃
  const a3 = (E120 - E60 + a1a3) / 3;
  const a1 = a1a3 - a3;
  const a0a2 = (E0 + E180) / 2;
  const a0 = (E60 + E120 + a0a2) / 3;
  return [a0, a1, a0a2 - a0, a3];
}
const COEF = { etano: [6, 0, 0, 6], butano: coeficientesButano() };
const energia = (m: 'etano' | 'butano', phi: number) => {
  const r = (phi * Math.PI) / 180;
  const a = COEF[m];
  return a[0]! + a[1]! * Math.cos(r) + a[2]! * Math.cos(2 * r) + a[3]! * Math.cos(3 * r);
};

function Newman({ phi, molecula }: { phi: number; molecula: 'etano' | 'butano' }) {
  const cx = 110, cy = 110, R = 46, L = 86;
  const punto = (ang: number, largo: number) => [cx + largo * Math.sin((ang * Math.PI) / 180), cy - largo * Math.cos((ang * Math.PI) / 180)] as const;
  const etiqueta = (i: number) => (molecula === 'butano' && i === 0 ? 'CH₃' : 'H');
  return (
    <svg viewBox="0 0 220 220" className="h-56 w-56" role="img" aria-label={`Proyección de Newman del ${molecula} con ángulo diedro de ${phi}°`}>
      {/* Carbono de atrás: círculo y enlaces que asoman */}
      {[0, 120, 240].map((a, i) => {
        const ang = a + phi;
        const [x1, y1] = punto(ang, R), [x2, y2] = punto(ang, L);
        const [tx, ty] = punto(ang, L + 14);
        return (
          <g key={`b${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--texto-suave)" strokeWidth={3} />
            <text x={tx} y={ty + 4} textAnchor="middle" fontSize={12} fill={etiqueta(i) === 'CH₃' ? 'var(--acento)' : 'var(--texto-suave)'}>
              {etiqueta(i)}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={R} fill="var(--superficie)" stroke="var(--texto)" strokeWidth={2.5} />
      {/* Carbono de adelante: enlaces desde el centro */}
      {[0, 120, 240].map((a, i) => {
        const [x2, y2] = punto(a, L - 10);
        const [tx, ty] = punto(a, L + 4);
        return (
          <g key={`f${i}`}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--texto)" strokeWidth={3} />
            <text x={tx} y={ty + 4} textAnchor="middle" fontSize={12} fill={etiqueta(i) === 'CH₃' ? 'var(--error)' : 'var(--texto)'}>
              {etiqueta(i)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Conformaciones() {
  const [molecula, setMolecula] = useState<'etano' | 'butano'>('butano');
  const [phi, setPhi] = useState(180);
  const datos = useMemo(() => Array.from({ length: 73 }, (_, k) => ({ phi: k * 5, E: Number(energia(molecula, k * 5).toFixed(2)) })), [molecula]);
  const nombreConf = (() => {
    const p = ((phi % 360) + 360) % 360;
    const d = Math.min(p, 360 - p);
    if (molecula === 'etano') return d % 120 < 10 || d % 120 > 110 ? 'eclipsada' : Math.abs((d % 120) - 60) < 10 ? 'alternada' : 'intermedia';
    if (d < 10) return 'totalmente eclipsada (sin)';
    if (Math.abs(d - 60) < 10) return 'gauche (alternada)';
    if (Math.abs(d - 120) < 10) return 'eclipsada';
    if (d > 170) return 'anti (alternada)';
    return 'intermedia';
  })();
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr] text-sm">
      <div className="space-y-3">
        <div className="flex gap-3">
          {(['etano', 'butano'] as const).map((m) => (
            <label key={m}>
              <input type="radio" name="conf" checked={molecula === m} onChange={() => setMolecula(m)} /> {m === 'etano' ? 'etano (C1–C2)' : 'butano (C2–C3)'}
            </label>
          ))}
        </div>
        <Newman phi={phi} molecula={molecula} />
        <Slider etiqueta="Ángulo diedro" valor={phi} min={0} max={360} paso={5} unidad="°" alCambiar={setPhi} />
        <p>
          Conformación: <strong>{nombreConf}</strong>; energía relativa ≈ <strong className="tabular-nums">{energia(molecula, phi).toFixed(1)} kJ/mol</strong>
        </p>
        <p className="text-xs text-texto-suave">
          Las conformaciones se interconvierten por giro del enlace C–C a temperatura ambiente; no son isómeros aislables. Energías: McMurry <InsigniaRevision />
        </p>
      </div>
      <div className="h-[320px] rounded-lg border border-borde bg-superficie p-2" role="img" aria-label="Energía torsional frente al ángulo diedro">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 10, right: 16, bottom: 20, left: 4 }}>
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="phi" type="number" domain={[0, 360]} ticks={[0, 60, 120, 180, 240, 300, 360]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'ángulo diedro (°)', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} width={40} label={{ value: 'kJ/mol', angle: -90, position: 'insideLeft', fill: 'var(--texto-suave)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }} labelFormatter={(x) => `${x}°`} formatter={(y) => [`${y} kJ/mol`, 'E']} />
            <ReferenceLine x={phi} stroke="var(--acento)" strokeDasharray="4 3" />
            <Line dataKey="E" stroke="var(--acento)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Hidrocarburos() {
  const [s, setS] = useState<Seccion>('nomenclatura');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: hidrocarburos">
          <div className="space-y-3">
            <p>Los hidrocarburos solo contienen C e H. Alcanos (solo enlaces simples, sufijo -ano), alquenos (C=C, -eno), alquinos (C≡C, -ino), cíclicos (prefijo ciclo-) y aromáticos (derivados del benceno).</p>
            <p>
              <strong>Reglas IUPAC:</strong> 1) La cadena principal es la que contiene los enlaces múltiples y, entre las posibles, la más larga (a igual longitud, la
              que tiene más sustituyentes). 2) Se numera para dar los localizadores más bajos a los enlaces múltiples (a igualdad, a los dobles) y luego a los
              sustituyentes. 3) Los sustituyentes (metil, etil…) se citan en orden alfabético, con di-, tri-… si se repiten (estos prefijos no cuentan en el orden).
            </p>
            <Formula tex="\text{4-etil-3-metilheptano}\qquad \text{but-1-en-3-ino}\qquad \text{buta-1,3-dieno}" bloque />
            <p>En los alquenos se escribe el localizador delante de la terminación: but-2-eno (antes «2-buteno»).</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={s} alCambiar={setS} etiqueta="Hidrocarburos">
        {s === 'nomenclatura' && <NombreEstructura ejemplos={EJEMPLOS} nombreInicial="3-etil-2-metilhexano" />}
        {s === 'series' && <Series />}
        {s === 'conformaciones' && <Conformaciones />}
      </Pestanas>
    </div>
  );
}
