/**
 * Worker: muestrea ψ en una cuadrícula 3D y extrae las isosuperficies (lóbulos + y −) con
 * marching cubes, sin bloquear la interfaz.
 */
import { marchingCubes, muestrearCampo } from '@/chem/marchingCubes';
import { crearPsi, crearPsiHibrido, HIBRIDOS, isoParaProbabilidad, radioContencion, type TipoHibrido } from '@/chem/orbitals';

export type PeticionOrbital =
  | { id: number; tipo: 'orbital'; n: number; l: number; m: number; probabilidad: number; resolucion: number }
  | { id: number; tipo: 'hibrido'; hibrido: TipoHibrido; probabilidad: number; resolucion: number };

export interface Lobulo {
  posiciones: Float32Array;
  normales: Float32Array;
  /** Fase de la función de onda: +1 o −1. */
  signo: 1 | -1;
  /** Índice del híbrido (o 0 para un orbital simple). */
  indice: number;
}

export interface RespuestaOrbital {
  id: number;
  lobulos: Lobulo[];
  /** Semilado de la caja muestreada (a₀). */
  L: number;
  iso: number;
  ms: number;
}

self.onmessage = (ev: MessageEvent<PeticionOrbital>) => {
  const p = ev.data;
  const t0 = performance.now();
  const lobulos: Lobulo[] = [];
  let L: number;
  let iso = 0;

  const extraer = (f: (x: number, y: number, z: number) => number, indice: number) => {
    const campo = muestrearCampo(f, p.resolucion, L);
    iso = isoParaProbabilidad(campo, p.probabilidad);
    for (const signo of [1, -1] as const) {
      const malla = marchingCubes(campo, iso, signo);
      if (malla.numTriangulos > 0) lobulos.push({ posiciones: malla.posiciones, normales: malla.normales, signo, indice });
    }
  };

  if (p.tipo === 'orbital') {
    // Caja que contiene el 99,9 % de la probabilidad radial
    L = radioContencion(p.n, p.l, 0.999) * 1.02;
    extraer(crearPsi(p.n, p.l, p.m), 0);
  } else {
    L = radioContencion(2, 1, 0.999) * 1.02;
    HIBRIDOS[p.hibrido].coeficientes.forEach((c, i) => extraer(crearPsiHibrido(c), i));
  }

  const respuesta: RespuestaOrbital = { id: p.id, lobulos, L, iso, ms: performance.now() - t0 };
  const transferibles = lobulos.flatMap((lb) => [lb.posiciones.buffer, lb.normales.buffer]);
  (self as unknown as Worker).postMessage(respuesta, transferibles);
};
