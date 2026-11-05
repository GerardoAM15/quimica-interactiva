/**
 * Gases ideales y reales.
 *
 *   Ecuación de estado:   PV = nRT          (R = 0,082057 L·atm/(mol·K))
 *   Ley combinada:        P₁V₁/T₁ = P₂V₂/T₂  (Boyle: T cte; Charles: P cte; Gay-Lussac: V cte)
 *   Densidad:             ρ = PM/(RT)
 *   Dalton:               Pᵢ = xᵢ·P_total
 *   Graham:               v₁/v₂ = √(M₂/M₁) = t₂/t₁
 *   Van der Waals:        (P + a·n²/V²)(V − n·b) = nRT
 *   Maxwell-Boltzmann:    f(v) = 4π (M/2πRT)^{3/2} v² e^{−Mv²/2RT}
 *   Velocidades:          v_mp = √(2RT/M), v̄ = √(8RT/πM), v_rms = √(3RT/M)  (M en kg/mol)
 */
import { R, R_LATM, ATM, kB } from './constants';

export const R_ATM = R_LATM;
/** 1 atm = 760 mmHg = 101,325 kPa. */
export const MMHG_POR_ATM = 760;
export const KPA_POR_ATM = ATM / 1000;

export type UnidadPresion = 'atm' | 'mmHg' | 'kPa';
export const aAtm = (p: number, u: UnidadPresion) => (u === 'atm' ? p : u === 'mmHg' ? p / MMHG_POR_ATM : p / KPA_POR_ATM);
export const desdeAtm = (p: number, u: UnidadPresion) => (u === 'atm' ? p : u === 'mmHg' ? p * MMHG_POR_ATM : p * KPA_POR_ATM);
export const aKelvin = (celsius: number) => celsius + 273.15;

export type Variable = 'P' | 'V' | 'n' | 'T';

/** Resuelve PV = nRT para la variable desconocida (atm, L, mol, K). */
export function gasIdeal(datos: Partial<Record<Variable, number>>, incognita: Variable): number {
  const { P, V, n, T } = datos;
  switch (incognita) {
    case 'P':
      return (n! * R_ATM * T!) / V!;
    case 'V':
      return (n! * R_ATM * T!) / P!;
    case 'n':
      return (P! * V!) / (R_ATM * T!);
    case 'T':
      return (P! * V!) / (n! * R_ATM);
  }
}

/** Ley combinada: dado el estado 1 completo y dos variables del estado 2, halla la tercera. */
export function leyCombinada(
  e1: { P: number; V: number; T: number },
  e2: Partial<{ P: number; V: number; T: number }>,
  incognita: 'P' | 'V' | 'T',
): number {
  const k = (e1.P * e1.V) / e1.T;
  if (incognita === 'P') return (k * e2.T!) / e2.V!;
  if (incognita === 'V') return (k * e2.T!) / e2.P!;
  return (e2.P! * e2.V!) / k;
}

/** Densidad de un gas ideal, g/L: ρ = PM/(RT). */
export const densidadGas = (P: number, M: number, T: number) => (P * M) / (R_ATM * T);
/** Masa molar a partir de la densidad: M = ρRT/P. */
export const masaMolarDeDensidad = (rho: number, P: number, T: number) => (rho * R_ATM * T) / P;

/** Presiones parciales (Dalton) a partir de los moles de cada gas y la presión total. */
export function dalton(moles: number[], Ptotal: number) {
  const total = moles.reduce((a, b) => a + b, 0);
  return moles.map((n) => ({ fraccion: n / total, presion: (n / total) * Ptotal }));
}

/** Graham: relación de velocidades de efusión v₁/v₂ = √(M₂/M₁). */
export const relacionGraham = (M1: number, M2: number) => Math.sqrt(M2 / M1);
/** Masa molar desconocida a partir de los tiempos de efusión: M₁ = M₂·(t₁/t₂)². */
export const masaMolarGraham = (t1: number, t2: number, M2: number) => M2 * (t1 / t2) ** 2;

// ── Van der Waals ───────────────────────────────────────────────────────────

/** Constantes de Van der Waals: a en L²·atm/mol², b en L/mol (Chang, tabla 5.4; pendiente de revisión). */
export const VAN_DER_WAALS: Record<string, { nombre: string; a: number; b: number }> = {
  He: { nombre: 'helio', a: 0.034, b: 0.0237 },
  Ne: { nombre: 'neón', a: 0.211, b: 0.0171 },
  Ar: { nombre: 'argón', a: 1.34, b: 0.0322 },
  Kr: { nombre: 'kriptón', a: 2.32, b: 0.0398 },
  Xe: { nombre: 'xenón', a: 4.19, b: 0.0511 },
  H2: { nombre: 'hidrógeno', a: 0.244, b: 0.0266 },
  N2: { nombre: 'nitrógeno', a: 1.39, b: 0.0391 },
  O2: { nombre: 'oxígeno', a: 1.36, b: 0.0318 },
  Cl2: { nombre: 'cloro', a: 6.49, b: 0.0562 },
  CO2: { nombre: 'dióxido de carbono', a: 3.59, b: 0.0427 },
  CH4: { nombre: 'metano', a: 2.25, b: 0.0428 },
  CCl4: { nombre: 'tetracloruro de carbono', a: 20.4, b: 0.138 },
  NH3: { nombre: 'amoníaco', a: 4.17, b: 0.0371 },
  H2O: { nombre: 'agua', a: 5.46, b: 0.0305 },
};

/** Presión de Van der Waals: P = nRT/(V − nb) − a n²/V². */
export const presionVdW = (n: number, V: number, T: number, a: number, b: number) => (n * R_ATM * T) / (V - n * b) - (a * n * n) / (V * V);

/** Factor de compresibilidad Z = PV/(nRT) (Z = 1 para el gas ideal). */
export const compresibilidad = (P: number, V: number, n: number, T: number) => (P * V) / (n * R_ATM * T);

// ── Teoría cinética ─────────────────────────────────────────────────────────

/** M en g/mol → kg/mol. */
const kg = (M: number) => M / 1000;
/** Velocidad cuadrática media, m/s. */
export const vRms = (M: number, T: number) => Math.sqrt((3 * R * T) / kg(M));
/** Velocidad media, m/s. */
export const vMedia = (M: number, T: number) => Math.sqrt((8 * R * T) / (Math.PI * kg(M)));
/** Velocidad más probable, m/s. */
export const vMasProbable = (M: number, T: number) => Math.sqrt((2 * R * T) / kg(M));
/** Energía cinética media por molécula: Ē = (3/2)·k_B·T (J). */
export const energiaCineticaMedia = (T: number) => 1.5 * kB * T;

/** Densidad de probabilidad de Maxwell-Boltzmann f(v) (s/m), con ∫₀^∞ f dv = 1. */
export function maxwellBoltzmann(v: number, M: number, T: number): number {
  const m = kg(M);
  const a = m / (2 * Math.PI * R * T);
  return 4 * Math.PI * a ** 1.5 * v * v * Math.exp((-m * v * v) / (2 * R * T));
}
