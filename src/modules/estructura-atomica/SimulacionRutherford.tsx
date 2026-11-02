import { useEffect, useRef, useState } from 'react';
import { anguloDispersion, distanciaMinima } from '@/chem/atomo';
import { Slider } from '@/components/Slider';

/** Ancho de la región simulada alrededor del núcleo, en femtómetros (1 fm = 10⁻¹⁵ m). */
const ANCHO_FM = 1600;

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  b: number;
  rastro: [number, number][];
}

/**
 * Experimento de Rutherford (1911): partículas α contra una lámina de oro.
 * Cada partícula se integra numéricamente bajo la repulsión de Coulomb  F = k·(2e)(Ze)/r².
 * Con el modelo de Thomson (carga positiva repartida en todo el átomo) la fuerza cerca de cada
 * partícula es despreciable y las trayectorias son prácticamente rectas.
 */
export function SimulacionRutherford() {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [modelo, setModelo] = useState<'rutherford' | 'thomson'>('rutherford');
  const [energia, setEnergia] = useState(5); // MeV
  const [pausado, setPausado] = useState(false);
  const [stats, setStats] = useState({ total: 0, mas10: 0, mas90: 0 });
  const estado = useRef({ particulas: [] as Particula[], total: 0, mas10: 0, mas90: 0, acumulador: 0 });
  const zOro = 79;
  const d = distanciaMinima(energia, zOro) * 1e15; // fm

  // Reiniciar contadores al cambiar parámetros
  useEffect(() => {
    estado.current = { particulas: [], total: 0, mas10: 0, mas90: 0, acumulador: 0 };
    setStats({ total: 0, mas10: 0, mas90: 0 });
  }, [modelo, energia]);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv || pausado) return;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    let ultimo = performance.now();
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const cuadro = (t: number) => {
      const W = cv.clientWidth, H = cv.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const escala = W / ANCHO_FM; // px por fm
      const cx = W * 0.55, cy = H / 2;
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      const e = estado.current;

      // Generar partículas con parámetro de impacto b aleatorio (fm)
      e.acumulador += dt * (reducido ? 4 : 14);
      while (e.acumulador >= 1) {
        e.acumulador -= 1;
        const bMax = (H / 2 / escala) * 0.95;
        const b = (Math.random() * 2 - 1) * bMax;
        e.particulas.push({ x: -cx / escala, y: b, vx: 1, vy: 0, b, rastro: [] });
      }

      // Integración (unidades: fm y «velocidad 1»); a = K/r², con K = d/2 para que
      // ½v² = K/d  → distancia mínima frontal = d
      const K = modelo === 'rutherford' ? d / 2 : 0;
      const velocidad = 900; // fm por segundo de animación
      const pasos = 40;
      const h = (dt * velocidad) / pasos;
      for (const p of e.particulas) {
        for (let k = 0; k < pasos; k++) {
          const r2 = p.x * p.x + p.y * p.y;
          const r = Math.sqrt(r2);
          const a = K / Math.max(r2, 1);
          p.vx += (a * p.x) / r * h;
          p.vy += (a * p.y) / r * h;
          p.x += p.vx * h;
          p.y += p.vy * h;
        }
        p.rastro.push([p.x, p.y]);
        if (p.rastro.length > 160) p.rastro.shift();
      }
      // Contar las que salen de la región
      const lim = (W / escala) * 0.75;
      e.particulas = e.particulas.filter((p) => {
        const fuera = Math.abs(p.x) > lim || Math.abs(p.y) > lim;
        if (fuera) {
          const ang = (Math.atan2(Math.abs(p.vy), p.vx) * 180) / Math.PI;
          e.total++;
          if (ang > 10) e.mas10++;
          if (ang > 90) e.mas90++;
        }
        return !fuera;
      });

      // Dibujo
      ctx.fillStyle = '#070b16';
      ctx.fillRect(0, 0, W, H);
      if (modelo === 'thomson') {
        ctx.fillStyle = 'rgba(244,114,182,0.10)';
        ctx.fillRect(0, 0, W, H);
      } else {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
        g.addColorStop(0, '#fbcfe8');
        g.addColorStop(1, '#db2777');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(4, 7 * escala * 2.5), 0, Math.PI * 2);
        ctx.fill();
        // Círculo de máxima aproximación (choque frontal)
        ctx.strokeStyle = 'rgba(250,204,21,0.5)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, d * escala, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.lineWidth = 1.2;
      for (const p of e.particulas) {
        ctx.strokeStyle = 'rgba(56,189,248,0.55)';
        ctx.beginPath();
        p.rastro.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * escala, cy + y * escala) : ctx.moveTo(cx + x * escala, cy + y * escala)));
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(cx + p.x * escala, cy + p.y * escala, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Barra de escala
      ctx.fillStyle = '#e6eaf2';
      ctx.fillRect(12, H - 16, 200 * escala, 2);
      ctx.font = '11px system-ui';
      ctx.fillText('200 fm', 12, H - 22);

      if (Math.round(t / 250) !== Math.round((t - dt * 1000) / 250)) setStats({ total: e.total, mas10: e.mas10, mas90: e.mas90 });
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [modelo, d, pausado]);

  const pct = (n: number) => (stats.total ? ((100 * n) / stats.total).toFixed(1) : '0.0');

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <canvas
        ref={lienzo}
        className="h-[340px] w-full rounded-lg border border-borde"
        role="img"
        aria-label={`Simulación de dispersión de partículas alfa de ${energia} MeV contra núcleos de oro, modelo de ${modelo === 'rutherford' ? 'Rutherford' : 'Thomson'}`}
      />
      <div className="space-y-3 text-sm">
        <fieldset>
          <legend className="font-medium">Modelo del átomo</legend>
          <label className="mt-1 flex items-center gap-2">
            <input type="radio" name="modelo-ruth" checked={modelo === 'thomson'} onChange={() => setModelo('thomson')} />
            Thomson (carga positiva repartida)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="modelo-ruth" checked={modelo === 'rutherford'} onChange={() => setModelo('rutherford')} />
            Rutherford (núcleo pequeño y denso)
          </label>
        </fieldset>
        <Slider etiqueta="Energía de las partículas α" valor={energia} min={2} max={10} paso={0.5} unidad="MeV" alCambiar={setEnergia} />
        <p className="text-texto-suave">
          Distancia mínima de aproximación (choque frontal): <strong className="text-texto">{d.toFixed(1)} fm</strong>
        </p>
        <dl className="grid grid-cols-[1fr_auto] gap-x-2 tabular-nums" aria-live="polite">
          <dt>Partículas detectadas</dt>
          <dd>{stats.total}</dd>
          <dt>Desviadas más de 10°</dt>
          <dd>{pct(stats.mas10)} %</dd>
          <dt>Rebotan (más de 90°)</dt>
          <dd>{pct(stats.mas90)} %</dd>
        </dl>
        <button type="button" onClick={() => setPausado((p) => !p)} className="rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2">
          {pausado ? 'Reanudar' : 'Pausar'}
        </button>
        <p className="text-xs text-texto-suave">
          Vista ampliada cerca de un núcleo (el átomo de oro mide ~1,4 × 10⁵ fm, casi 100 veces el ancho mostrado). Los
          porcentajes se refieren a las partículas que pasan por esta zona; en la lámina real casi todas pasan lejos de
          cualquier núcleo y atraviesan sin desviarse (Geiger y Marsden: ~1 de cada 8000 rebotaba). Ángulo
          teórico para parámetro de impacto b: θ = 2·arctan(d/2b); por ejemplo, b = {(d / 2).toFixed(1)} fm da θ = {anguloDispersion(d / 2, d).toFixed(0)}°.
        </p>
      </div>
    </div>
  );
}
