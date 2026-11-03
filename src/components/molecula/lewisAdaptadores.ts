import { analizarAtomo } from '@/chem/vsepr';
import { vecindario, type Molecula } from '@/chem/molecula';
import type { EstructuraLewis } from '@/chem/lewis';
import type { DibujoLewis } from './LewisSVG';

/** Estructura de Lewis (chem/lewis) → dibujo. */
export const dibujoDeLewis = (e: EstructuraLewis): DibujoLewis => ({ atomos: e.atomos, enlaces: e.enlaces });

/**
 * Molécula con coordenadas 2D y H explícitos (p. ej. de RDKit) → dibujo de Lewis.
 * Pares libres: E = (V − q − Σ órdenes)/2; las coordenadas se escalan para que el enlace mida 1.
 */
export function dibujoDeMolecula(mol: Molecula): DibujoLewis {
  const vec = vecindario(mol);
  const largos = mol.enlaces
    .map((e) => {
      const a = mol.atomos[e.a]!, b = mol.atomos[e.b]!;
      return Math.hypot(a.x - b.x, a.y - b.y);
    })
    .sort((a, b) => a - b);
  const escala = largos.length ? 1 / (largos[Math.floor(largos.length / 2)] || 1) : 1;
  return {
    atomos: mol.atomos.map((a, i) => ({
      simbolo: a.simbolo,
      x: a.x * escala,
      y: a.y * escala,
      paresLibres: analizarAtomo(mol, i, vec).paresLibres,
      cargaFormal: a.carga,
    })),
    enlaces: mol.enlaces.map((e) => ({ a: e.a, b: e.b, orden: e.orden })),
  };
}
