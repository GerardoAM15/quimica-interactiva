import { useEffect, useRef, useState } from 'react';

type Plano = 'xz' | 'xy' | 'yz';

interface Props {
  psi: (x: number, y: number, z: number) => number;
  /** Semilado de la región (a₀). */
  L: number;
  descripcion: string;
}

/**
 * Corte de la densidad de probabilidad |ψ|² en un plano que pasa por el núcleo.
 * Azul: ψ > 0, naranja: ψ < 0. Las franjas oscuras son nodos (ψ = 0).
 * Se usa √(|ψ|²/máx) para que se vean también las regiones de baja densidad.
 */
export function CorteDensidad({ psi, L, descripcion }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [plano, setPlano] = useState<Plano>('xz');

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const N = 220;
    cv.width = cv.height = N;
    const ctx = cv.getContext('2d')!;
    const img = ctx.createImageData(N, N);
    const valores = new Float32Array(N * N);
    let max = 0;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const u = -L + (2 * L * (i + 0.5)) / N;
        const v = L - (2 * L * (j + 0.5)) / N; // eje vertical hacia arriba
        const [x, y, z] = plano === 'xz' ? [u, 0, v] : plano === 'xy' ? [u, v, 0] : [0, u, v];
        const p = psi(x, y, z);
        valores[j * N + i] = p;
        max = Math.max(max, p * p);
      }
    }
    for (let k = 0; k < N * N; k++) {
      const p = valores[k]!;
      const t = max > 0 ? Math.sqrt((p * p) / max) : 0;
      const [r, g, b] = p >= 0 ? [59, 130, 246] : [249, 115, 22];
      img.data[k * 4] = r * t;
      img.data[k * 4 + 1] = g * t;
      img.data[k * 4 + 2] = b * t;
      img.data[k * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // Ejes
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(N / 2, 0);
    ctx.lineTo(N / 2, N);
    ctx.moveTo(0, N / 2);
    ctx.lineTo(N, N / 2);
    ctx.stroke();
  }, [psi, L, plano]);

  const [h, v] = plano === 'xz' ? ['x', 'z'] : plano === 'xy' ? ['x', 'y'] : ['y', 'z'];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm" role="group" aria-label="Plano de corte">
        <span className="font-medium">Plano:</span>
        {(['xz', 'xy', 'yz'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlano(p)}
            aria-pressed={plano === p}
            className={`rounded border px-2 py-0.5 ${plano === p ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="relative w-full max-w-[300px]">
        <canvas ref={lienzo} className="aspect-square w-full rounded-md border border-borde [image-rendering:auto]" role="img" aria-label={`Corte de densidad en el plano ${plano}: ${descripcion}`} />
        <span className="absolute right-1 bottom-1 text-[11px] text-white/70">{h} →</span>
        <span className="absolute top-1 left-1 text-[11px] text-white/70">↑ {v}</span>
      </div>
      <p className="mt-1 text-xs text-texto-suave">Región de ±{L.toFixed(0)} a₀. Las zonas negras dentro de la nube son nodos.</p>
    </div>
  );
}
