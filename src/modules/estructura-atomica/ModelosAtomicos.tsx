import { useState } from 'react';
import { SimulacionRutherford } from './SimulacionRutherford';
import { Formula } from '@/components/Formula';

interface Modelo {
  id: string;
  nombre: string;
  anio: string;
  idea: string;
  aporte: string;
  limitacion: string;
  dibujo: React.ReactNode;
}

const MODELOS: Modelo[] = [
  {
    id: 'dalton',
    nombre: 'Dalton',
    anio: '1808',
    idea: 'La materia está formada por átomos indivisibles e indestructibles. Los átomos de un mismo elemento son idénticos en masa y propiedades; los compuestos se forman por combinación de átomos en proporciones de números enteros sencillos.',
    aporte: 'Explica las leyes ponderales (conservación de la masa, proporciones definidas y múltiples).',
    limitacion: 'El átomo sí es divisible (electrones, protones, neutrones) y existen isótopos de masas distintas.',
    dibujo: (
      <svg viewBox="-60 -60 120 120" className="h-32 w-32" aria-hidden>
        <defs>
          <radialGradient id="g-dalton" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#4b5563" />
          </radialGradient>
        </defs>
        <circle r="45" fill="url(#g-dalton)" />
      </svg>
    ),
  },
  {
    id: 'thomson',
    nombre: 'Thomson',
    anio: '1904',
    idea: 'Tras descubrir el electrón (1897, rayos catódicos), Thomson propuso una esfera de carga positiva uniforme con los electrones incrustados («budín de pasas»).',
    aporte: 'Primer modelo con partículas subatómicas; el átomo es neutro.',
    limitacion: 'No explica la dispersión de partículas α a ángulos grandes observada por Geiger y Marsden.',
    dibujo: (
      <svg viewBox="-60 -60 120 120" className="h-32 w-32" aria-hidden>
        <circle r="45" fill="#f9a8d4" fillOpacity="0.55" stroke="#db2777" />
        {[[-20, -18], [15, -25], [25, 5], [-5, 5], [-28, 15], [8, 28], [-10, -35], [30, -10]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill="#0ea5e9" />
            <text x={x} y={(y ?? 0) + 2.5} textAnchor="middle" fontSize="8" fill="#fff">
              −
            </text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: 'rutherford',
    nombre: 'Rutherford',
    anio: '1911',
    idea: 'Casi toda la masa y la carga positiva están en un núcleo diminuto (≈ 10⁻¹⁴ m) frente al tamaño del átomo (≈ 10⁻¹⁰ m). Los electrones giran alrededor del núcleo; el átomo es casi vacío.',
    aporte: 'Explica la dispersión de partículas α: la mayoría atraviesa la lámina y muy pocas rebotan.',
    limitacion: 'Según el electromagnetismo clásico, un electrón en órbita emite energía y caería al núcleo; tampoco explica los espectros de líneas.',
    dibujo: (
      <svg viewBox="-60 -60 120 120" className="h-32 w-32" aria-hidden>
        {[0, 60, 120].map((r, i) => (
          <g key={r} transform={`rotate(${r})`}>
            <ellipse rx="48" ry="16" fill="none" stroke="#38bdf8" strokeOpacity="0.7" />
            {/* Un electrón sobre cada órbita: punto (48·cos t, 16·sen t) */}
            <circle cx={48 * Math.cos(1 + i * 2)} cy={16 * Math.sin(1 + i * 2)} r="3.5" fill="#0ea5e9" />
          </g>
        ))}
        <circle r="6" fill="#db2777" />
      </svg>
    ),
  },
  {
    id: 'bohr',
    nombre: 'Bohr',
    anio: '1913',
    idea: 'El electrón del hidrógeno solo puede estar en órbitas circulares de energía definida (estados estacionarios), donde no emite energía. Al saltar entre órbitas absorbe o emite un fotón de energía exacta.',
    aporte: 'Explica el espectro de líneas del hidrógeno y la ecuación de Rydberg. Introduce la cuantización (número cuántico n).',
    limitacion: 'Solo funciona para átomos de un electrón (H, He⁺, Li²⁺…); supone órbitas definidas, lo que contradice el principio de incertidumbre.',
    dibujo: (
      <svg viewBox="-60 -60 120 120" className="h-32 w-32" aria-hidden>
        {[16, 30, 46].map((r, i) => (
          <g key={r}>
            <circle r={r} fill="none" stroke="#38bdf8" strokeOpacity="0.7" />
            <text x={r * 0.72 + 2} y={-r * 0.72} fontSize="8" fill="currentColor">
              n={i + 1}
            </text>
          </g>
        ))}
        <circle r="6" fill="#db2777" />
        <circle cx="30" r="4" fill="#0ea5e9" />
        {/* Fotón emitido al pasar de n = 3 a n = 2 */}
        <path d="M 46 4 q 4 -6 8 0 t 8 0" stroke="#facc15" fill="none" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'cuantico',
    nombre: 'Mecano-cuántico',
    anio: '1926',
    idea: 'Schrödinger describe al electrón con una función de onda ψ. No hay órbitas: |ψ|² da la probabilidad de encontrar al electrón en cada región (orbital). Cada orbital queda definido por los números cuánticos n, l y mₗ; el spin (mₛ) completa la descripción del electrón.',
    aporte: 'Modelo actual: explica la tabla periódica, el enlace químico y los espectros de todos los átomos.',
    limitacion: 'Para átomos de varios electrones solo se resuelve de forma aproximada.',
    dibujo: (
      <svg viewBox="-60 -60 120 120" className="h-32 w-32" aria-hidden>
        <defs>
          <radialGradient id="g-nube">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="50" fill="url(#g-nube)" />
        <circle r="4" fill="#db2777" />
      </svg>
    ),
  },
];

export function ModelosAtomicos() {
  const [activo, setActivo] = useState('rutherford');
  const m = MODELOS.find((x) => x.id === activo)!;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Modelos atómicos">
        {MODELOS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setActivo(x.id)}
            aria-pressed={x.id === activo}
            className={`rounded-md border px-3 py-1.5 text-sm ${x.id === activo ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde hover:bg-superficie-2'}`}
          >
            {x.nombre} <span className="text-texto-suave">({x.anio})</span>
          </button>
        ))}
      </div>
      <article className="grid gap-4 rounded-lg border border-borde bg-superficie p-4 sm:grid-cols-[auto_1fr]">
        <div className="text-texto">{m.dibujo}</div>
        <div className="text-sm">
          <h3 className="text-lg font-semibold">
            Modelo de {m.nombre} ({m.anio})
          </h3>
          <p className="mt-1">{m.idea}</p>
          <p className="mt-2">
            <strong className="text-exito">Aporte:</strong> {m.aporte}
          </p>
          <p className="mt-1">
            <strong className="text-error">Limitación:</strong> {m.limitacion}
          </p>
          {m.id === 'bohr' && (
            <div className="mt-2">
              <Formula tex="r_n = a_0\,\dfrac{n^2}{Z}\qquad E_n = -\dfrac{13{,}6\ \text{eV}\cdot Z^2}{n^2}" bloque />
            </div>
          )}
        </div>
      </article>
      <section>
        <h3 className="mb-2 font-semibold">Simulación: experimento de Geiger-Marsden-Rutherford</h3>
        <SimulacionRutherford />
      </section>
    </div>
  );
}
