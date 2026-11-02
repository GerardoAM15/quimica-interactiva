/**
 * Estructura atómica: modelo de Bohr, espectro del hidrógeno, isótopos y dispersión de Rutherford.
 */
import { a0, c, e, eps0, EV, h, HC_EV_NM, R_H, Rinf, me, mn, mp, u } from './constants';
import isotoposDatos from '@/data/isotopos.json';

// ── Modelo de Bohr (átomos hidrogenoides: H, He⁺, Li²⁺…) ────────────────────

/** Radio de la órbita n: rₙ = a₀ · n² / Z  (en pm; a₀ ≈ 52,9 pm). */
export const radioBohr = (n: number, z = 1) => (a0 * 1e12 * n * n) / z;

/**
 * Energía del nivel n: Eₙ = −R_H·h·c · Z² / n²  (en eV).
 * Con la masa reducida del H, E₁ = −13,598 eV; con núcleo infinito (R∞), −13,606 eV.
 */
export function energiaBohr(n: number, z = 1, { masaReducida = true } = {}): number {
  const R = masaReducida ? R_H : Rinf;
  return (-(R * h * c) / EV) * (z * z) / (n * n);
}

/** Velocidad del electrón en la órbita n: vₙ = Z·e² / (2·ε₀·h·n)  (m/s). */
export const velocidadBohr = (n: number, z = 1) => (z * e * e) / (2 * eps0 * h * n);

// ── Espectro del hidrógeno (ecuación de Rydberg) ────────────────────────────

export const SERIES: Record<number, { nombre: string; region: string }> = {
  1: { nombre: 'Lyman', region: 'ultravioleta' },
  2: { nombre: 'Balmer', region: 'visible y ultravioleta cercano' },
  3: { nombre: 'Paschen', region: 'infrarrojo' },
  4: { nombre: 'Brackett', region: 'infrarrojo' },
  5: { nombre: 'Pfund', region: 'infrarrojo' },
  6: { nombre: 'Humphreys', region: 'infrarrojo' },
};

export interface Transicion {
  nInicial: number;
  nFinal: number;
  tipo: 'emision' | 'absorcion';
  /** Número de onda 1/λ, m⁻¹. */
  numeroOnda: number;
  /** Longitud de onda en el vacío, nm. */
  longitudOnda: number;
  /** Frecuencia, Hz. */
  frecuencia: number;
  /** Energía del fotón, eV. */
  energiaEV: number;
  /** Energía del fotón, J. */
  energiaJ: number;
  serie: string | null;
}

/**
 * Ecuación de Rydberg: 1/λ = R_H · Z² · |1/n_f² − 1/n_i²|
 * La serie la define el nivel inferior (n_f en emisión). λ resulta en el vacío; las tablas
 * suelen dar λ en el aire (p. ej. Hα = 656,28 nm en el aire, 656,47 nm en el vacío).
 */
export function transicion(nInicial: number, nFinal: number, z = 1): Transicion {
  if (nInicial === nFinal) throw new RangeError('Los niveles inicial y final deben ser distintos.');
  if (nInicial < 1 || nFinal < 1) throw new RangeError('n debe ser ≥ 1.');
  const numeroOnda = R_H * z * z * Math.abs(1 / (nFinal * nFinal) - 1 / (nInicial * nInicial));
  const longitudOnda = 1e9 / numeroOnda;
  const frecuencia = c * numeroOnda;
  const energiaJ = h * frecuencia;
  const inferior = Math.min(nInicial, nFinal);
  return {
    nInicial,
    nFinal,
    tipo: nInicial > nFinal ? 'emision' : 'absorcion',
    numeroOnda,
    longitudOnda,
    frecuencia,
    energiaJ,
    energiaEV: energiaJ / EV,
    serie: SERIES[inferior]?.nombre ?? null,
  };
}

/** Límite de la serie (n_i → ∞): 1/λ = R_H / n_f². */
export const limiteSerie = (nFinal: number) => (1e9 * nFinal * nFinal) / R_H;

/** Líneas de una serie desde n_f + 1 hasta nMax. */
export const lineasSerie = (nFinal: number, nMax = 10) =>
  Array.from({ length: Math.max(0, nMax - nFinal) }, (_, k) => transicion(nFinal + k + 1, nFinal));

/** E [eV] ↔ λ [nm]: E = hc/λ. */
export const energiaDeLongitud = (nm: number) => HC_EV_NM / nm;
export const longitudDeEnergia = (eV: number) => HC_EV_NM / eV;

/** Región del espectro electromagnético para una longitud de onda (nm). */
export function regionEspectral(nm: number): string {
  if (nm < 10) return 'rayos X';
  if (nm < 380) return 'ultravioleta';
  if (nm <= 750) return 'visible';
  if (nm < 1e6) return 'infrarrojo';
  return 'microondas';
}

/** Nombre del color percibido para λ visible (aproximado). */
export function nombreColor(nm: number): string | null {
  if (nm < 380 || nm > 750) return null;
  if (nm < 450) return 'violeta';
  if (nm < 485) return 'azul';
  if (nm < 500) return 'cian';
  if (nm < 565) return 'verde';
  if (nm < 590) return 'amarillo';
  if (nm < 625) return 'naranja';
  return 'rojo';
}

/**
 * Color RGB aproximado de una longitud de onda visible (algoritmo de Dan Bruton, 1996).
 * Es una representación para pantalla, no una conversión colorimétrica exacta.
 */
export function colorDeLongitud(nm: number): string {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 750) { r = 1; }
  // Atenuación en los extremos del visible
  let f = 0;
  if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm >= 420 && nm <= 700) f = 1;
  else if (nm > 700 && nm <= 750) f = 0.3 + (0.7 * (750 - nm)) / 50;
  const canal = (x: number) => Math.round(255 * Math.pow(x * f, 0.8)).toString(16).padStart(2, '0');
  return `#${canal(r)}${canal(g)}${canal(b)}`;
}

// ── Isótopos ────────────────────────────────────────────────────────────────

export interface Isotopo {
  a: number;
  simboloEspecial: string | null;
  /** Masa atómica relativa del nucleido, u. */
  masa: number;
  /** Abundancia natural (fracción 0–1) o null. */
  abundancia: number | null;
}

export const FUENTE_ISOTOPOS = isotoposDatos.fuente;
const isotoposPorZ = new Map(isotoposDatos.elementos.map((x) => [x.z, x]));

export function isotoposDe(z: number): Isotopo[] {
  return (isotoposPorZ.get(z)?.isotopos ?? []) as Isotopo[];
}

export const pesoAtomicoEstandarNIST = (z: number) => isotoposPorZ.get(z)?.pesoAtomicoEstandar ?? null;

/**
 * Masa atómica promedio: Āᵣ = Σ mᵢ · xᵢ / Σ xᵢ
 * (mᵢ = masa del isótopo i, xᵢ = abundancia; se normaliza por si las abundancias no suman 1).
 */
export function masaAtomicaPromedio(isotopos: { masa: number; abundancia: number | null }[]): number {
  const naturales = isotopos.filter((i) => (i.abundancia ?? 0) > 0);
  if (naturales.length === 0) throw new Error('El elemento no tiene isótopos con abundancia natural.');
  const suma = naturales.reduce((s, i) => s + i.abundancia!, 0);
  return naturales.reduce((s, i) => s + i.masa * i.abundancia!, 0) / suma;
}

/** Partículas de un nucleido ᴬ_Z X^q: protones = Z, neutrones = A − Z, electrones = Z − q. */
export function particulas(z: number, a: number, carga = 0) {
  if (a < z) throw new RangeError('El número de masa A no puede ser menor que Z.');
  if (carga > z) throw new RangeError('La carga no puede superar el número de protones.');
  return { protones: z, neutrones: a - z, electrones: z - carga, nucleones: a };
}

/** Defecto de masa aproximado (u): Δm = Z·m(¹H) + N·mₙ − m(nucleido). */
export function defectoMasa(z: number, a: number, masaNucleido: number): number {
  const mH = isotoposDe(1).find((i) => i.a === 1)!.masa; // átomo ¹H (incluye su electrón), u — NIST
  const mNeutron = mn / u; // u — CODATA
  return z * mH + (a - z) * mNeutron - masaNucleido;
}

// ── Experimento de Rutherford ───────────────────────────────────────────────

/** Constante de Coulomb k = 1/(4πε₀), N·m²/C². */
export const K_COULOMB = 1 / (4 * Math.PI * eps0);

/**
 * Distancia de máxima aproximación en choque frontal:  d = k · (2e)(Ze) / Eₖ
 * (toda la energía cinética de la partícula α se convierte en energía potencial eléctrica).
 * Eₖ en MeV, resultado en m.
 */
export function distanciaMinima(eCineticaMeV: number, zBlanco: number): number {
  return (K_COULOMB * 2 * zBlanco * e * e) / (eCineticaMeV * 1e6 * EV);
}

/**
 * Ángulo de dispersión de Rutherford para parámetro de impacto b:
 *   tan(θ/2) = d / (2b)   →   θ = 2·arctan(d / 2b)
 * (d y b en las mismas unidades; b = 0 → θ = 180°, rebote total). Devuelve grados.
 */
export function anguloDispersion(b: number, d: number): number {
  if (b === 0) return 180;
  return (2 * Math.atan(d / (2 * Math.abs(b))) * 180) / Math.PI;
}

/** Radio aproximado del núcleo: R ≈ r₀ · A^(1/3), con r₀ ≈ 1,2 fm. Resultado en m. */
export const radioNuclear = (a: number) => 1.2e-15 * Math.cbrt(a);

/** Relación masa protón / masa electrón (≈ 1836). */
export const RELACION_MP_ME = mp / me;
