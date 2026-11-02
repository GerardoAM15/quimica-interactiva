/**
 * Constantes físicas fundamentales (CODATA, descargadas del NIST por scripts/descargar-constantes.mjs).
 * Desde la redefinición del SI (2019), h, e, N_A, k_B y c son EXACTAS.
 */
import datos from '@/data/constantes.json';

type Clave = keyof typeof datos.constantes;
const v = (k: Clave): number => datos.constantes[k].valor;

export const FUENTE_CONSTANTES = datos.fuente;

/** Velocidad de la luz en el vacío, m/s (exacta). */
export const c = v('c');
/** Constante de Planck, J·s (exacta). */
export const h = v('h');
/** Carga elemental, C (exacta). */
export const e = v('e');
/** Constante de Avogadro, mol⁻¹ (exacta). */
export const NA = v('NA');
/** Constante de Boltzmann, J/K (exacta). */
export const kB = v('kB');
/** Constante de los gases R = N_A·k_B, J/(mol·K). */
export const R = v('R');
/** Constante de Faraday F = N_A·e, C/mol. */
export const F = v('F');
/** Masa del electrón, kg. */
export const me = v('me');
/** Masa del protón, kg. */
export const mp = v('mp');
/** Masa del neutrón, kg. */
export const mn = v('mn');
/** Unidad de masa atómica (1 u = m(¹²C)/12), kg. */
export const u = v('u');
/** Radio de Bohr a₀, m. */
export const a0 = v('a0');
/** Constante de Rydberg R∞ (núcleo de masa infinita), m⁻¹. */
export const Rinf = v('Rinf');
/** Permitividad del vacío ε₀, F/m. */
export const eps0 = v('eps0');
/** Masa de la partícula alfa (núcleo de ⁴He), kg. */
export const mAlfa = v('alpha_mass');
/** 1 atm en Pa (exacta por definición). */
export const ATM = v('atm');
/** 1 eV en J. */
export const EV = v('eV');
/** Volumen molar del gas ideal a 0 °C y 1 atm (condiciones normales, CN), m³/mol. */
export const VM_CN = v('Vm');

/** R en L·atm/(mol·K): R [J/(mol·K)] · 1000 L/m³ / 101325 Pa/atm ≈ 0,082057 */
export const R_LATM = (R * 1000) / ATM;

/** Energía de Rydberg R∞·h·c expresada en eV (≈ 13,6057 eV). */
export const RYDBERG_EV = (Rinf * h * c) / EV;

/**
 * Constante de Rydberg para el hidrógeno, corregida por la masa reducida del sistema protón-electrón:
 *   R_H = R∞ · μ/mₑ = R∞ / (1 + mₑ/mₚ)
 * Con ella, la energía de ionización del H resulta 13,598 eV (valor experimental).
 */
export const R_H = Rinf / (1 + me / mp);

/** Factor de conversión de longitud de onda: E [eV] = HC_EV_NM / λ [nm] (≈ 1239,84). */
export const HC_EV_NM = (h * c) / EV / 1e-9;

/** Todas las constantes con nombre, unidad e incertidumbre (para la página de teoría y créditos). */
export const TABLA_CONSTANTES = datos.constantes;
