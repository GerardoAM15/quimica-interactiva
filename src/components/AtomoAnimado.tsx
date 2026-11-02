import { useMemo } from 'react';

/**
 * Átomo decorativo en SVG para la portada (ligero, sin WebGL).
 * Los electrones recorren órbitas elípticas con <animateMotion>; si el usuario
 * prefiere movimiento reducido se muestran quietos.
 */
const ORBITAS = [
  { rot: 0, color: '#38bdf8', dur: 5.5 },
  { rot: 60, color: '#a78bfa', dur: 7 },
  { rot: 120, color: '#34d399', dur: 8.5 },
];

// Elipse rx=90, ry=32 centrada en el origen, como trayectoria cerrada
const RUTA = 'M 90 0 A 90 32 0 1 1 -90 0 A 90 32 0 1 1 90 0 Z';

export function AtomoAnimado({ className = '' }: { className?: string }) {
  const moverse = useMemo(() => {
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return true;
    }
  }, []);

  return (
    <svg viewBox="-110 -110 220 220" className={className} role="img" aria-label="Modelo de un átomo">
      <defs>
        <radialGradient id="nucleo" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
        <radialGradient id="halo">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="105" fill="url(#halo)" />
      {ORBITAS.map((o) => (
        <g key={o.rot} transform={`rotate(${o.rot})`}>
          <path d={RUTA} fill="none" stroke={o.color} strokeOpacity="0.55" strokeWidth="2" />
          <circle r="6" fill="#facc15" cx={moverse ? 0 : 90}>
            {moverse && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={RUTA} />}
          </circle>
        </g>
      ))}
      <circle r="17" fill="url(#nucleo)" />
    </svg>
  );
}
