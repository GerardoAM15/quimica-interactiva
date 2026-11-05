import { useEffect, useRef, useState } from 'react';
import { R } from '@/chem/constants';
import { maxwellBoltzmann, vMasProbable } from '@/chem/gases';
import { colorEscala, colorToken } from '@/lib/colores';

interface Props {
  /** Volumen (L), temperatura (K), moles y masa molar (g/mol). */
  V: number;
  T: number;
  n: number;
  M: number;
  Vmax: number;
  pausado: boolean;
}

interface Particula {
  x: number;
  y: number;
  /** Velocidad real (m/s) descompuesta en el plano de dibujo. */
  vx: number;
  vy: number;
}

/** Partículas dibujadas por mol (representación, no a escala). */
const POR_MOL = 30;
/** px por segundo de animación por cada m/s de velocidad molecular. */
const ESCALA_V = 0.2;
const RADIO = 3;
const BINS = 24;

/**
 * Muestrea la rapidez de una molécula según Maxwell-Boltzmann:
 * cada componente vₓ, v_y, v_z ~ Normal(0, σ) con σ = √(RT/M)  (M en kg/mol).
 * Se dibuja en 2D con la rapidez 3D completa y una dirección al azar.
 */
function muestrear(T: number, M: number): [number, number] {
  const s = Math.sqrt((R * T) / (M / 1000));
  const normal = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const v = Math.hypot(normal() * s, normal() * s, normal() * s);
  const a = Math.random() * 2 * Math.PI;
  return [v * Math.cos(a), v * Math.sin(a)];
}

/** Caja con pistón: el ancho interior es proporcional al volumen. Cuenta choques contra las paredes. */
export function CajaGases({ V, T, n, M, Vmax, pausado }: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const histograma = useRef<HTMLCanvasElement>(null);
  const estado = useRef({ particulas: [] as Particula[], T, M, choques: 0, tiempo: 0 });
  const props = useRef({ V, T, n, M, Vmax });
  props.current = { V, T, n, M, Vmax };
  const [impactos, setImpactos] = useState(0);

  // Ajustar el número de partículas y reescalar velocidades: v ∝ √(T/M)
  useEffect(() => {
    const e = estado.current;
    const N = Math.max(1, Math.round(n * POR_MOL));
    const f = Math.sqrt((T / e.T) * (e.M / M));
    if (f !== 1) for (const p of e.particulas) (p.vx *= f), (p.vy *= f);
    e.T = T;
    e.M = M;
    while (e.particulas.length > N) e.particulas.pop();
    while (e.particulas.length < N) {
      const [vx, vy] = muestrear(T, M);
      e.particulas.push({ x: Math.random() * 100 + 10, y: Math.random() * 200 + 10, vx, vy });
    }
  }, [n, T, M]);

  useEffect(() => {
    const cv = lienzo.current, ch = histograma.current;
    if (!cv || !ch) return;
    const ctx = cv.getContext('2d')!, hx = ch.getContext('2d')!;
    let raf = 0;
    let ultimo = performance.now();

    const ajustar = (c: HTMLCanvasElement, k: CanvasRenderingContext2D) => {
      const W = c.clientWidth, H = c.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(W * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      k.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [W, H] as const;
    };

    const cuadro = (t: number) => {
      const dt = pausado ? 0 : Math.min(0.04, (t - ultimo) / 1000);
      ultimo = t;
      const { V, Vmax, T, M } = props.current;
      const e = estado.current;
      const [W, H] = ajustar(cv, ctx);
      const x0 = 8, y0 = 8, alto = H - 16;
      const anchoMax = W - 16 - 14;
      const ancho = Math.max(30, (V / Vmax) * anchoMax);

      // Movimiento rectilíneo y choques elásticos con las paredes (gas ideal: sin choques entre partículas)
      for (const p of e.particulas) {
        p.x += p.vx * ESCALA_V * dt;
        p.y += p.vy * ESCALA_V * dt;
        if (p.x < RADIO) (p.x = RADIO), (p.vx = Math.abs(p.vx)), e.choques++;
        if (p.x > ancho - RADIO) {
          if (p.vx > 0) e.choques++;
          p.x = ancho - RADIO;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < RADIO) (p.y = RADIO), (p.vy = Math.abs(p.vy)), e.choques++;
        if (p.y > alto - RADIO) (p.y = alto - RADIO), (p.vy = -Math.abs(p.vy)), e.choques++;
      }
      e.tiempo += dt;
      if (e.tiempo >= 0.5) {
        setImpactos(Math.round(e.choques / e.tiempo));
        e.choques = 0;
        e.tiempo = 0;
      }

      // Dibujo
      const borde = colorToken('--borde'), texto = colorToken('--texto-suave'), fondo = colorToken('--superficie-2');
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = fondo;
      ctx.fillRect(x0, y0, ancho, alto);
      ctx.strokeStyle = borde;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0, y0, ancho, alto);
      // Pistón
      ctx.fillStyle = texto;
      ctx.fillRect(x0 + ancho, y0 - 4, 8, alto + 8);
      ctx.fillRect(x0 + ancho + 8, y0 + alto / 2 - 3, W - (x0 + ancho + 8), 6);
      const vRef = 2.2 * vMasProbable(M, T);
      for (const p of e.particulas) {
        const v = Math.hypot(p.vx, p.vy);
        ctx.fillStyle = colorEscala(v / vRef);
        ctx.beginPath();
        ctx.arc(x0 + p.x, y0 + p.y, RADIO, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Histograma de rapideces frente a la curva teórica de Maxwell-Boltzmann
      const [hw, hh] = ajustar(ch, hx);
      hx.clearRect(0, 0, hw, hh);
      const vMax = 3 * vMasProbable(M, T);
      const ancBin = vMax / BINS;
      const cuenta = new Array<number>(BINS).fill(0);
      for (const p of e.particulas) {
        const b = Math.floor(Math.hypot(p.vx, p.vy) / ancBin);
        if (b < BINS) cuenta[b]!++;
      }
      const N = e.particulas.length;
      const fMax = maxwellBoltzmann(vMasProbable(M, T), M, T) * N * ancBin;
      const yMax = Math.max(fMax * 1.4, ...cuenta);
      const mx = 30, my = 18;
      const sx = (hw - mx - 6) / BINS, sy = (hh - my - 6) / yMax;
      cuenta.forEach((c, i) => {
        hx.fillStyle = colorEscala(((i + 0.5) * ancBin) / vRef);
        hx.globalAlpha = 0.75;
        hx.fillRect(mx + i * sx + 1, hh - my - c * sy, sx - 2, c * sy);
      });
      hx.globalAlpha = 1;
      hx.strokeStyle = colorToken('--texto');
      hx.lineWidth = 2;
      hx.beginPath();
      for (let k = 0; k <= 120; k++) {
        const v = (k / 120) * vMax;
        const y = maxwellBoltzmann(v, M, T) * N * ancBin;
        const px = mx + (v / vMax) * BINS * sx, py = hh - my - y * sy;
        k === 0 ? hx.moveTo(px, py) : hx.lineTo(px, py);
      }
      hx.stroke();
      hx.strokeStyle = borde;
      hx.lineWidth = 1;
      hx.beginPath();
      hx.moveTo(mx, 4);
      hx.lineTo(mx, hh - my);
      hx.lineTo(hw - 4, hh - my);
      hx.stroke();
      hx.fillStyle = texto;
      hx.font = '11px system-ui, sans-serif';
      hx.fillText('0', mx - 4, hh - 4);
      hx.fillText(`${Math.round(vMax)} m/s`, hw - 62, hh - 4);
      hx.save();
      hx.translate(12, hh / 2 + 24);
      hx.rotate(-Math.PI / 2);
      hx.fillText('moléculas', 0, 0);
      hx.restore();

      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [pausado]);

  return (
    <div className="space-y-2">
      <canvas ref={lienzo} className="h-[260px] w-full rounded-lg border border-borde bg-superficie" role="img" aria-label={`Caja con ${Math.round(n * POR_MOL)} partículas de gas en movimiento; el pistón marca el volumen`} />
      <p className="text-xs text-texto-suave">
        Choques contra las paredes: <span className="tabular-nums">{impactos}</span> por segundo de animación (aumentan con la presión). Cada punto representa 1/{POR_MOL} de mol; el color indica la rapidez.
      </p>
      <canvas ref={histograma} className="h-[150px] w-full rounded-lg border border-borde bg-superficie" role="img" aria-label="Histograma de rapideces de las partículas comparado con la curva de Maxwell-Boltzmann" />
      <p className="text-xs text-texto-suave">Barras: rapideces de las partículas de la caja. Línea: distribución de Maxwell-Boltzmann teórica.</p>
    </div>
  );
}
