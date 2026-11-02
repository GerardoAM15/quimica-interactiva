import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { distribucionRadial, radial } from '@/chem/orbitals';

/** P(r) = r²·R²(r): probabilidad de encontrar al electrón a la distancia r del núcleo. */
export default function DistribucionRadial({ n, l, rMax }: { n: number; l: number; rMax: number }) {
  const { datos, nodos, rMasProbable } = useMemo(() => {
    const pasos = 300;
    const datos = Array.from({ length: pasos + 1 }, (_, i) => {
      const r = (i / pasos) * rMax;
      return { r: Number(r.toFixed(3)), P: distribucionRadial(n, l, r) };
    });
    // Nodos radiales: cambios de signo de R(r)
    const nodos: number[] = [];
    let previo = radial(n, l, 1e-6);
    for (let i = 1; i <= 4000; i++) {
      const r = (i / 4000) * rMax;
      const v = radial(n, l, r);
      if (Math.sign(v) !== Math.sign(previo) && previo !== 0) nodos.push(r);
      previo = v;
    }
    const rMasProbable = datos.reduce((a, b) => (b.P > a.P ? b : a)).r;
    return { datos, nodos, rMasProbable };
  }, [n, l, rMax]);

  return (
    <div>
      <div className="h-[220px] w-full" role="img" aria-label={`Distribución radial del orbital ${n}${'spdf'[l]}: máximo en r = ${rMasProbable} a₀, ${nodos.length} nodos radiales`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
            <CartesianGrid stroke="var(--borde)" strokeDasharray="3 3" />
            <XAxis dataKey="r" type="number" domain={[0, rMax]} tick={{ fill: 'var(--texto-suave)', fontSize: 11 }} label={{ value: 'r (a₀)', position: 'insideBottom', offset: -8, fill: 'var(--texto-suave)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--texto-suave)', fontSize: 11 }} width={44} tickFormatter={(v: number) => v.toFixed(2)} />
            <Tooltip
              contentStyle={{ background: 'var(--superficie)', border: '1px solid var(--borde)', color: 'var(--texto)' }}
              labelFormatter={(r) => `r = ${r} a₀`}
              formatter={(v) => [Number(v).toFixed(4), 'r²R²']}
            />
            {nodos.map((r) => (
              <ReferenceLine key={r} x={r} stroke="#f97316" strokeDasharray="4 3" />
            ))}
            <Line dataKey="P" stroke="var(--acento)" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-texto-suave">
        Máximo en r ≈ {rMasProbable.toFixed(2)} a₀ ({(rMasProbable * 52.92).toFixed(0)} pm).{' '}
        {nodos.length > 0 ? `Nodos radiales (líneas naranjas) en r ≈ ${nodos.map((r) => r.toFixed(2)).join(', ')} a₀.` : 'Sin nodos radiales.'}
      </p>
    </div>
  );
}
