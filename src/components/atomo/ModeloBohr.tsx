import { useMemo } from 'react';
import { LETRAS_CAPA } from '@/chem/configuracion';

interface Props {
  simbolo: string;
  /** Electrones por capa (K, L, M…). */
  porNivel: number[];
  protones: number;
  neutrones?: number;
  className?: string;
}

/**
 * Modelo de Bohr esquemático: núcleo y electrones en órbitas circulares por capa.
 * (Es una representación histórica: los electrones no siguen órbitas definidas, ver módulo de orbitales.)
 */
export function ModeloBohr({ simbolo, porNivel, protones, neutrones, className = '' }: Props) {
  const moverse = useMemo(() => {
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return true;
    }
  }, []);

  const capas = porNivel.length;
  const rMin = 34;
  const rMax = 140;
  const paso = capas > 1 ? (rMax - rMin) / (capas - 1) : 0;

  return (
    <svg
      viewBox="-160 -160 320 320"
      className={className}
      role="img"
      aria-label={`Modelo de Bohr de ${simbolo}: ${porNivel.map((n, i) => `capa ${LETRAS_CAPA[i]} con ${n}`).join(', ')}`}
    >
      {porNivel.map((n, i) => {
        const r = rMin + i * paso;
        // Capas exteriores giran más lento (solo efecto visual)
        const duracion = 6 + i * 3;
        return (
          <g key={i}>
            <circle r={r} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.2} />
            <g>
              {/* Gira alrededor del núcleo (0, 0) */}
              {moverse && (
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur={`${duracion}s`} repeatCount="indefinite" />
              )}
              {Array.from({ length: n }, (_, k) => {
                const ang = (2 * Math.PI * k) / n;
                return <circle key={k} cx={r * Math.cos(ang)} cy={r * Math.sin(ang)} r={4.5} fill="#38bdf8" stroke="#0b1020" strokeWidth={0.8} />;
              })}
            </g>
            <text x={r * Math.cos(-Math.PI / 4) + 6} y={r * Math.sin(-Math.PI / 4) - 6} fontSize={11} fill="currentColor" opacity={0.7}>
              {LETRAS_CAPA[i]} ({n})
            </text>
          </g>
        );
      })}
      <circle r={22} fill="#db2777" />
      <text textAnchor="middle" y={-3} fontSize={13} fontWeight={700} fill="#fff">
        {simbolo}
      </text>
      <text textAnchor="middle" y={12} fontSize={8.5} fill="#fff">
        {protones} p⁺{neutrones !== undefined ? ` ${neutrones} n⁰` : ''}
      </text>
    </svg>
  );
}
