import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ELEMENTOS, elementoPorZ, Z_GASES_NOBLES } from '@/chem/elements';
import { PROPIEDADES, propiedadPorClave, type ClavePropiedad } from './colores';

const TENDENCIAS: Partial<Record<ClavePropiedad, string>> = {
  electronegatividad: 'Aumenta de izquierda a derecha en un periodo y disminuye al bajar en un grupo. El F es el más electronegativo (3,98).',
  radioVdW: 'Disminuye en un periodo (mayor carga nuclear efectiva) y aumenta al bajar en un grupo (más niveles). Los máximos son los metales alcalinos.',
  energiaIonizacion: 'Aumenta en un periodo y disminuye en un grupo. Los máximos son los gases nobles; los mínimos, los metales alcalinos.',
  afinidadElectronica: 'En general aumenta (en valor absoluto) hacia los halógenos; los gases nobles y los alcalinotérreos no forman aniones estables.',
};

/** Propiedad periódica en función del número atómico. */
export default function GraficaTendencias({ alElegir }: { alElegir: (z: number) => void }) {
  const [clave, setClave] = useState<ClavePropiedad>('energiaIonizacion');
  const [zMax, setZMax] = useState(86);
  const p = propiedadPorClave(clave);
  const datos = useMemo(
    () => ELEMENTOS.filter((e) => e.z <= zMax).map((e) => ({ z: e.z, simbolo: e.simbolo, valor: e[clave] })),
    [clave, zMax],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Propiedad</span>
          <select value={clave} onChange={(e) => setClave(e.target.value as ClavePropiedad)} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
            {PROPIEDADES.map((x) => (
              <option key={x.clave} value={x.clave}>
                {x.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Hasta Z =</span>
          <select value={zMax} onChange={(e) => setZMax(Number(e.target.value))} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
            {[18, 36, 54, 86, 118].map((z) => (
              <option key={z} value={z}>
                {z} ({elementoPorZ(z).simbolo})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="h-[380px] w-full rounded-lg border border-borde bg-superficie p-2" role="img" aria-label={`Gráfica de ${p.nombre} en función del número atómico`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={datos}
            margin={{ top: 10, right: 16, bottom: 18, left: 4 }}
            onClick={(e) => {
              const z = Number(e?.activeLabel);
              if (z >= 1 && z <= 118) alElegir(z);
            }}
          >
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="z" type="number" domain={[1, zMax]} tick={{ fill: 'var(--texto-suave)', fontSize: 12 }} label={{ value: 'Número atómico Z', position: 'insideBottom', offset: -10, fill: 'var(--texto-suave)', fontSize: 12 }} />
            <YAxis
              scale={p.log ? 'log' : 'auto'}
              domain={p.log ? ['auto', 'auto'] : [0, 'auto']}
              allowDataOverflow={false}
              tick={{ fill: 'var(--texto-suave)', fontSize: 12 }}
              width={56}
            />
            <Tooltip
              contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }}
              labelFormatter={(z) => {
                const e = elementoPorZ(Number(z));
                return `${e.nombre} (${e.simbolo}), Z = ${z}`;
              }}
              formatter={(v) => [`${Number(v).toLocaleString('es-PE', { maximumFractionDigits: p.decimales })} ${p.unidad}`, p.nombre]}
            />
            {Z_GASES_NOBLES.filter((z) => z <= zMax).map((z) => (
              <ReferenceLine key={z} x={z} stroke="var(--texto-suave)" strokeOpacity={0.4} label={{ value: elementoPorZ(z).simbolo, fill: 'var(--texto-suave)', fontSize: 10, position: 'top' }} />
            ))}
            <Line dataKey="valor" stroke="var(--acento)" strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm">
        <strong>{p.nombre}.</strong> {TENDENCIAS[clave] ?? 'Las líneas verticales marcan los gases nobles (fin de cada periodo).'}
      </p>
      <p className="mt-1 text-xs text-texto-suave">Los huecos corresponden a elementos sin dato en PubChem. Haz clic en un punto para abrir su ficha.</p>
    </div>
  );
}
