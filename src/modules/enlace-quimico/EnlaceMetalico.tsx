import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/Slider';

/**
 * Modelo del «mar de electrones»: cationes metálicos fijos en una red y electrones de valencia
 * deslocalizados que se mueven al azar. Al aplicar una diferencia de potencial, los electrones
 * adquieren una velocidad de deriva neta hacia el polo positivo: conducción eléctrica.
 */
export function EnlaceMetalico() {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [voltaje, setVoltaje] = useState(0);
  const voltajeRef = useRef(0);
  voltajeRef.current = voltaje;

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const electrones = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), vx: 0, vy: 0 }));
    let raf = 0;
    const cuadro = () => {
      const W = cv.clientWidth, H = cv.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#070b16';
      ctx.fillRect(0, 0, W, H);
      // Red de cationes
      const cols = 9, filas = 5;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < filas; j++) {
          const x = ((i + 0.5) / cols) * W, y = ((j + 0.5) / filas) * H;
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0b1020';
          ctx.font = 'bold 14px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', x, y + 1);
        }
      }
      // Electrones: movimiento aleatorio + deriva proporcional al voltaje (hacia la izquierda, polo +)
      const deriva = voltajeRef.current * 0.0009;
      for (const e of electrones) {
        if (!reducido) {
          e.vx = e.vx * 0.9 + (Math.random() - 0.5) * 0.004 - deriva;
          e.vy = e.vy * 0.9 + (Math.random() - 0.5) * 0.004;
          e.x = (e.x + e.vx + 1) % 1;
          e.y = Math.min(1, Math.max(0, e.y + e.vy));
        }
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(e.x * W, e.y * H, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (voltajeRef.current > 0) {
        ctx.fillStyle = '#e6eaf2';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('(+) ←  flujo de electrones', 10, 16);
        ctx.textAlign = 'right';
        ctx.fillText('(−)', W - 10, 16);
      }
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={lienzo} className="h-[300px] w-full rounded-lg border border-borde" role="img" aria-label="Modelo del mar de electrones: cationes en una red y electrones deslocalizados" />
      <div className="space-y-3 text-sm">
        <Slider etiqueta="Diferencia de potencial" valor={voltaje} min={0} max={10} unidad="(relativa)" alCambiar={setVoltaje} />
        <p>
          Los átomos metálicos ceden sus electrones de valencia, que quedan <strong>deslocalizados</strong> entre los cationes. La atracción
          entre los cationes y el «mar» de electrones es el enlace metálico.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-texto-suave">
          <li><strong className="text-texto">Conductividad eléctrica:</strong> los electrones libres se desplazan al aplicar un voltaje.</li>
          <li><strong className="text-texto">Conductividad térmica:</strong> los electrones transportan energía cinética.</li>
          <li><strong className="text-texto">Maleabilidad y ductilidad:</strong> las capas de cationes se deslizan sin romper el enlace.</li>
          <li><strong className="text-texto">Brillo:</strong> los electrones absorben y reemiten la luz visible.</li>
        </ul>
      </div>
    </div>
  );
}
