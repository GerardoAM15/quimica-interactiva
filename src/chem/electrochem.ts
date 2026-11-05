/**
 * Electroquímica.
 *
 *   E°celda = E°cátodo − E°ánodo   (ambos como potenciales de reducción)
 *   ΔG° = −nFE°        K = e^(nFE°/RT)
 *   Nernst: E = E° − (RT/nF)·ln Q  =  E° − (0,0592/n)·log Q  a 25 °C
 *   Faraday: m = I·t·M / (n·F)
 */
import datos from '@/data/potenciales.json';
import { F, R } from './constants';

export interface Semirreaccion {
  id: string;
  ecuacion: string;
  n: number;
  E: number;
  metal?: string;
  ion?: string;
}

export const FUENTE_POTENCIALES = datos.fuente;
export const SEMIRREACCIONES = datos.semirreacciones as Semirreaccion[];
export const semirreaccion = (id: string) => {
  const s = SEMIRREACCIONES.find((x) => x.id === id);
  if (!s) throw new Error(`No hay semirreacción «${id}».`);
  return s;
};

/** Especie con estado: «Cu2+(ac)», «e-», «H2O(l)». */
const ESTADO = /\((s|l|g|ac)\)$/;
export const estadoDe = (especie: string) => (ESTADO.exec(especie)?.[1] ?? null) as 's' | 'l' | 'g' | 'ac' | null;

/** Vector de especies de una semirreacción: reactivos negativos, productos positivos. */
function vector(ecuacion: string): Map<string, number> {
  const [izq, der] = ecuacion.split('->').map((l) => l.trim());
  const v = new Map<string, number>();
  const agregar = (lado: string, signo: number) => {
    for (const t of lado.split(/\s+\+\s+/)) {
      const m = /^(\d+)?(.+)$/.exec(t.trim())!;
      const c = m[1] ? Number(m[1]) : 1;
      v.set(m[2]!, (v.get(m[2]!) ?? 0) + signo * c);
    }
  };
  agregar(izq!, -1);
  agregar(der!, 1);
  return v;
}

const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
const mcm = (a: number, b: number) => (a * b) / mcd(a, b);

export interface Celda {
  catodo: Semirreaccion;
  anodo: Semirreaccion;
  /** Electrones transferidos en la reacción global. */
  n: number;
  E0: number;
  dG0: number;
  K: number;
  espontanea: boolean;
  /** Reacción global: especie → coeficiente (reactivos negativos). */
  global: Map<string, number>;
  ecuacion: string;
  pasos: string[];
}

/** Escribe un vector de especies como ecuación «reactivos -> productos». */
export function textoEcuacion(v: Map<string, number>): string {
  const lado = (s: number) =>
    [...v]
      .filter(([, c]) => Math.sign(c) === s)
      .map(([e, c]) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}${e}`)
      .join(' + ');
  return `${lado(-1)} -> ${lado(1)}`;
}

/**
 * Celda con el cátodo (reducción) y el ánodo (oxidación) dados.
 * La reacción global se obtiene igualando electrones: (mcm/n_c)·cátodo + (mcm/n_a)·(ánodo invertido).
 */
export function celda(idCatodo: string, idAnodo: string, T = 298.15): Celda {
  const catodo = semirreaccion(idCatodo), anodo = semirreaccion(idAnodo);
  const n = mcm(catodo.n, anodo.n);
  const fc = n / catodo.n, fa = n / anodo.n;
  const global = new Map<string, number>();
  vector(catodo.ecuacion).forEach((c, e) => global.set(e, (global.get(e) ?? 0) + fc * c));
  vector(anodo.ecuacion).forEach((c, e) => global.set(e, (global.get(e) ?? 0) - fa * c));
  for (const [e, c] of global) if (Math.abs(c) < 1e-12) global.delete(e);
  const E0 = catodo.E - anodo.E;
  const dG0 = -n * F * E0; // J
  const K = Math.exp((n * F * E0) / (R * T));
  return {
    catodo,
    anodo,
    n,
    E0,
    dG0,
    K,
    espontanea: E0 > 0,
    global,
    ecuacion: textoEcuacion(global),
    pasos: [
      `Cátodo (reducción): ${catodo.ecuacion}   E° = ${catodo.E.toFixed(2)} V`,
      `Ánodo (oxidación): se invierte ${anodo.ecuacion}   E° = ${anodo.E.toFixed(2)} V`,
      `Se igualan los electrones: n = mcm(${catodo.n}, ${anodo.n}) = ${n}; cátodo × ${fc}, ánodo × ${fa}`,
      `E°celda = E°cátodo − E°ánodo = ${catodo.E.toFixed(2)} − (${anodo.E.toFixed(2)}) = ${E0.toFixed(2)} V`,
      `ΔG° = −nFE° = −${n} × 96 485 × ${E0.toFixed(2)} = ${(dG0 / 1000).toFixed(1)} kJ`,
      `K = e^(nFE°/RT) = ${K.toPrecision(3)}`,
    ],
  };
}

/** Cociente de reacción: [ac] en M, (g) en atm; sólidos, líquidos y electrones no entran. */
export function cocienteCelda(global: Map<string, number>, actividades: Record<string, number>): number {
  let Q = 1;
  for (const [e, c] of global) {
    const est = estadoDe(e);
    if (est !== 'ac' && est !== 'g') continue;
    const a = actividades[e] ?? 1;
    Q *= a ** c;
  }
  return Q;
}

/** Ecuación de Nernst (V). */
export const nernst = (E0: number, n: number, Q: number, T = 298.15) => E0 - ((R * T) / (n * F)) * Math.log(Q);

/** Masa depositada (g) en una electrólisis: m = I·t·M/(n·F). */
export const masaElectrolisis = (I: number, t: number, M: number, n: number) => (I * t * M) / (n * F);
/** Tiempo (s) necesario para depositar m gramos. */
export const tiempoElectrolisis = (m: number, I: number, M: number, n: number) => (m * n * F) / (I * M);
