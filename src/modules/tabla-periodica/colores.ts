import type { Elemento, Familia, EstadoFisico, Bloque } from '@/chem/elements';
import { bloque as bloqueDe } from '@/chem/configuracion';

/** Colores de fondo de las casillas (tonos claros para texto oscuro, contraste ≥ 4,5:1). */
export const COLOR_FAMILIA: Record<Familia, string> = {
  alcalino: '#fca5a5',
  alcalinoterreo: '#fdba74',
  transicion: '#fde68a',
  postransicion: '#bef264',
  metaloide: '#86efac',
  'no-metal': '#7dd3fc',
  halogeno: '#a5b4fc',
  'gas-noble': '#d8b4fe',
  lantanido: '#f9a8d4',
  actinido: '#fda4af',
};

export const COLOR_BLOQUE: Record<Bloque, string> = {
  s: '#fca5a5',
  p: '#93c5fd',
  d: '#fde68a',
  f: '#86efac',
};

export const COLOR_ESTADO: Record<EstadoFisico, string> = {
  solido: '#cbd5e1',
  liquido: '#7dd3fc',
  gas: '#fcd34d',
};

export type ModoColor = 'familia' | 'bloque' | 'estado' | ClavePropiedad;

export type ClavePropiedad =
  | 'electronegatividad'
  | 'radioVdW'
  | 'energiaIonizacion'
  | 'afinidadElectronica'
  | 'masaAtomica'
  | 'densidad'
  | 'puntoFusion'
  | 'puntoEbullicion';

export interface Propiedad {
  clave: ClavePropiedad;
  nombre: string;
  unidad: string;
  /** Escala logarítmica para propiedades que abarcan varios órdenes de magnitud. */
  log?: boolean;
  decimales: number;
}

export const PROPIEDADES: readonly Propiedad[] = [
  { clave: 'electronegatividad', nombre: 'Electronegatividad (Pauling)', unidad: '', decimales: 2 },
  { clave: 'radioVdW', nombre: 'Radio de van der Waals', unidad: 'pm', decimales: 0 },
  { clave: 'energiaIonizacion', nombre: 'Primera energía de ionización', unidad: 'eV', decimales: 2 },
  { clave: 'afinidadElectronica', nombre: 'Afinidad electrónica', unidad: 'eV', decimales: 2 },
  { clave: 'masaAtomica', nombre: 'Masa atómica', unidad: 'u', decimales: 2 },
  { clave: 'densidad', nombre: 'Densidad', unidad: 'g/cm³', log: true, decimales: 3 },
  { clave: 'puntoFusion', nombre: 'Punto de fusión', unidad: 'K', decimales: 0 },
  { clave: 'puntoEbullicion', nombre: 'Punto de ebullición', unidad: 'K', decimales: 0 },
];

export const propiedadPorClave = (c: ClavePropiedad) => PROPIEDADES.find((p) => p.clave === c)!;

export const valorPropiedad = (e: Elemento, c: ClavePropiedad): number | null => e[c];

/** Escala secuencial (de azul oscuro a amarillo, perceptualmente uniforme, tipo «viridis»). */
const PARADAS: [number, number, number][] = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
];

export function colorEscala(t: number): string {
  const x = Math.min(1, Math.max(0, t)) * (PARADAS.length - 1);
  const i = Math.min(PARADAS.length - 2, Math.floor(x));
  const f = x - i;
  const [a, b] = [PARADAS[i]!, PARADAS[i + 1]!];
  const c = a.map((v, k) => Math.round(v + f * (b[k]! - v)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Normalizador [mín, máx] → [0, 1] para una propiedad sobre los elementos con dato. */
export function normalizador(elementos: readonly Elemento[], p: Propiedad) {
  const valores = elementos.map((e) => valorPropiedad(e, p.clave)).filter((v): v is number => v !== null && v > (p.log ? 0 : -Infinity));
  const tr = (v: number) => (p.log ? Math.log10(v) : v);
  const min = Math.min(...valores.map(tr));
  const max = Math.max(...valores.map(tr));
  return {
    min: p.log ? 10 ** min : min,
    max: p.log ? 10 ** max : max,
    t: (v: number) => (max === min ? 0.5 : (tr(v) - min) / (max - min)),
  };
}

/** Texto negro o blanco según la luminancia relativa del fondo (WCAG). */
export function colorTexto(fondo: string): string {
  const m = fondo.match(/\d+/g);
  let rgb: number[];
  if (fondo.startsWith('#')) {
    const h = fondo.slice(1);
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  } else rgb = (m ?? ['0', '0', '0']).slice(0, 3).map(Number);
  const lin = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
  // Contraste con negro (L + 0,05)/0,05 vs con blanco 1,05/(L + 0,05)
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#0b1020' : '#ffffff';
}

/** Color de fondo de una casilla según el modo elegido. */
export function colorCasilla(e: Elemento, modo: ModoColor, norm?: ReturnType<typeof normalizador>): string {
  if (modo === 'familia') return COLOR_FAMILIA[e.familia];
  if (modo === 'bloque') return COLOR_BLOQUE[bloqueDe(e.z)];
  if (modo === 'estado') return COLOR_ESTADO[e.estadoEstandar];
  const v = valorPropiedad(e, modo);
  if (v === null || !norm) return '#3a4157';
  return colorEscala(norm.t(v));
}
