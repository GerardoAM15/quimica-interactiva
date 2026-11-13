import { useRef, useState, type PointerEvent } from 'react';
import { colorAtomo } from '@/components/molecula/Molecula3D';
import type { OrdenEnlace } from '@/chem/molecula';
import { colorLegible } from '@/lib/colores';
import { usePreferencias } from '@/store/preferencias';

export interface AtomoEditor {
  id: number;
  simbolo: string;
  x: number;
  y: number;
  carga: number;
}
export interface EnlaceEditor {
  a: number;
  b: number;
  orden: OrdenEnlace;
}
export interface Dibujo {
  atomos: AtomoEditor[];
  enlaces: EnlaceEditor[];
}

export type Herramienta = 'atomo' | 'enlace' | 'carga' | 'mover' | 'borrar';

interface Props {
  dibujo: Dibujo;
  alCambiar: (d: Dibujo) => void;
  herramienta: Herramienta;
  elemento: string;
  /** Átomos con error de valencia (resaltados). */
  conError?: number[];
}

/** Largo de enlace en el lienzo (px). */
export const LARGO = 44;
let siguienteId = 1;
export const nuevoId = () => siguienteId++;

/**
 * Editor 2D: clic en el vacío agrega un átomo; arrastrar desde un átomo crea un enlace (a otro átomo
 * o a un átomo nuevo); clic en un enlace cambia su orden (1 → 2 → 3 → 1).
 */
export function EditorMolecula({ dibujo, alCambiar, herramienta, elemento, conError = [] }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [arrastre, setArrastre] = useState<{ desde: number; x: number; y: number; movio: boolean } | null>(null);

  const punto = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const vb = svg.current!.viewBox.baseVal;
    return { x: ((e.clientX - r.left) / r.width) * vb.width, y: ((e.clientY - r.top) / r.height) * vb.height };
  };
  const atomoEn = (x: number, y: number) => dibujo.atomos.find((a) => Math.hypot(a.x - x, a.y - y) < 14);
  const conBorrado = (id: number): Dibujo => ({ atomos: dibujo.atomos.filter((a) => a.id !== id), enlaces: dibujo.enlaces.filter((b) => b.a !== id && b.b !== id) });

  const alPresionarFondo = (e: PointerEvent) => {
    if (herramienta !== 'atomo') return;
    const p = punto(e);
    if (atomoEn(p.x, p.y)) return;
    alCambiar({ ...dibujo, atomos: [...dibujo.atomos, { id: nuevoId(), simbolo: elemento, x: p.x, y: p.y, carga: 0 }] });
  };

  const alPresionarAtomo = (e: PointerEvent, a: AtomoEditor) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = punto(e);
    setArrastre({ desde: a.id, x: p.x, y: p.y, movio: false });
  };

  const alMover = (e: PointerEvent) => {
    if (!arrastre) return;
    const p = punto(e);
    const movio = arrastre.movio || Math.hypot(p.x - dibujo.atomos.find((a) => a.id === arrastre.desde)!.x, p.y - dibujo.atomos.find((a) => a.id === arrastre.desde)!.y) > 8;
    setArrastre({ ...arrastre, x: p.x, y: p.y, movio });
    if (herramienta === 'mover' && movio) {
      alCambiar({ ...dibujo, atomos: dibujo.atomos.map((a) => (a.id === arrastre.desde ? { ...a, x: p.x, y: p.y } : a)) });
    }
  };

  const alSoltar = (e: PointerEvent) => {
    if (!arrastre) return;
    const origen = dibujo.atomos.find((a) => a.id === arrastre.desde)!;
    const p = punto(e);
    setArrastre(null);
    if (herramienta === 'mover') return;
    if (!arrastre.movio) {
      // Clic sobre un átomo
      if (herramienta === 'borrar') return alCambiar(conBorrado(origen.id));
      if (herramienta === 'carga') {
        const q = origen.carga === 0 ? 1 : origen.carga === 1 ? -1 : 0;
        return alCambiar({ ...dibujo, atomos: dibujo.atomos.map((a) => (a.id === origen.id ? { ...a, carga: q } : a)) });
      }
      if (herramienta === 'atomo' && origen.simbolo !== elemento) {
        return alCambiar({ ...dibujo, atomos: dibujo.atomos.map((a) => (a.id === origen.id ? { ...a, simbolo: elemento } : a)) });
      }
      return;
    }
    if (herramienta !== 'atomo' && herramienta !== 'enlace') return;
    const destino = atomoEn(p.x, p.y);
    if (destino && destino.id !== origen.id) {
      const existe = dibujo.enlaces.find((b) => (b.a === origen.id && b.b === destino.id) || (b.b === origen.id && b.a === destino.id));
      if (existe) return;
      return alCambiar({ ...dibujo, enlaces: [...dibujo.enlaces, { a: origen.id, b: destino.id, orden: 1 }] });
    }
    // Arrastre al vacío: átomo nuevo a la distancia de un enlace, en la dirección del arrastre
    const ang = Math.atan2(p.y - origen.y, p.x - origen.x);
    const nuevo = { id: nuevoId(), simbolo: elemento, x: origen.x + Math.cos(ang) * LARGO, y: origen.y + Math.sin(ang) * LARGO, carga: 0 };
    alCambiar({ atomos: [...dibujo.atomos, nuevo], enlaces: [...dibujo.enlaces, { a: origen.id, b: nuevo.id, orden: 1 }] });
  };

  const alClicEnlace = (e: React.MouseEvent, k: number) => {
    e.stopPropagation();
    if (herramienta === 'borrar') return alCambiar({ ...dibujo, enlaces: dibujo.enlaces.filter((_, i) => i !== k) });
    if (herramienta === 'atomo' || herramienta === 'enlace') {
      alCambiar({ ...dibujo, enlaces: dibujo.enlaces.map((b, i) => (i === k ? { ...b, orden: ((b.orden % 3) + 1) as OrdenEnlace } : b)) });
    }
  };

  // El lienzo sigue el tema activo: fondo = token «superficie» de cada tema (src/styles/index.css).
  // Los símbolos conservan el color CPK del elemento, aclarado u oscurecido hasta un contraste de 4,5.
  const oscuro = usePreferencias((s) => s.tema) === 'oscuro';
  const fondo = oscuro ? '#121a2e' : '#ffffff';
  const fondoError = oscuro ? '#4a1d24' : '#fecaca';
  const porId = new Map(dibujo.atomos.map((a) => [a.id, a]));
  const origenArrastre = arrastre ? porId.get(arrastre.desde) : undefined;

  return (
    <svg
      ref={svg}
      viewBox="0 0 640 400"
      className="h-auto w-full touch-none rounded-lg border border-borde bg-superficie text-texto select-none"
      onPointerDown={alPresionarFondo}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      role="application"
      aria-label="Lienzo para dibujar la molécula"
    >
      {dibujo.enlaces.map((b, k) => {
        const A = porId.get(b.a), B = porId.get(b.b);
        if (!A || !B) return null;
        const L = Math.hypot(B.x - A.x, B.y - A.y) || 1;
        const px = -(B.y - A.y) / L, py = (B.x - A.x) / L;
        const offs = b.orden === 1 ? [0] : b.orden === 2 ? [-3, 3] : [-5, 0, 5];
        return (
          <g key={k} onClick={(e) => alClicEnlace(e, k)} className="cursor-pointer">
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="transparent" strokeWidth={14} />
            {offs.map((o) => (
              <line key={o} x1={A.x + px * o} y1={A.y + py * o} x2={B.x + px * o} y2={B.y + py * o} stroke="var(--texto)" strokeWidth={2.2} />
            ))}
          </g>
        );
      })}
      {origenArrastre && arrastre?.movio && herramienta !== 'mover' && (
        <line x1={origenArrastre.x} y1={origenArrastre.y} x2={arrastre.x} y2={arrastre.y} stroke="var(--acento)" strokeDasharray="4 3" strokeWidth={2} />
      )}
      {dibujo.atomos.map((a) => {
        const error = conError.includes(a.id);
        const mostrarSimbolo = a.simbolo !== 'C' || dibujo.enlaces.every((b) => b.a !== a.id && b.b !== a.id) || a.carga !== 0;
        return (
          <g key={a.id} onPointerDown={(e) => alPresionarAtomo(e, a)} className="cursor-pointer">
            <circle cx={a.x} cy={a.y} r={13} fill={error ? fondoError : mostrarSimbolo ? fondo : 'transparent'} stroke={error ? 'var(--error)' : 'transparent'} strokeWidth={2} />
            {mostrarSimbolo ? (
              <text x={a.x} y={a.y} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} fill={a.simbolo === 'C' ? 'var(--texto)' : colorLegible(colorAtomo(a.simbolo), error ? fondoError : fondo)}>
                {a.simbolo}
              </text>
            ) : (
              <circle cx={a.x} cy={a.y} r={3} fill="var(--texto)" />
            )}
            {a.carga !== 0 && (
              <text x={a.x + 12} y={a.y - 11} fontSize={12} fontWeight={700} fill={colorLegible(a.carga > 0 ? '#2563eb' : '#dc2626', fondo)}>
                {a.carga > 0 ? '+' : '−'}
              </text>
            )}
          </g>
        );
      })}
      {dibujo.atomos.length === 0 && (
        <text x={320} y={200} textAnchor="middle" fontSize={14} fill="var(--texto-suave)">
          Elige un elemento y haz clic aquí para empezar; arrastra desde un átomo para enlazar.
        </text>
      )}
    </svg>
  );
}
