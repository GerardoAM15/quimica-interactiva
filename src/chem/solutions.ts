/**
 * Soluciones: unidades de concentración, dilución, mezclas y propiedades coligativas.
 *
 *   M = n_soluto / V_solución(L)            m = n_soluto / kg_solvente
 *   N = M · θ  (θ: H⁺ del ácido, OH⁻ de la base o carga total del catión en la sal)
 *   %m/m = m_soluto/m_solución·100   %m/V = g soluto/100 mL   %V/V   ppm = mg/kg ≈ mg/L
 *   xᵢ = nᵢ / n_total                       M = 10·%m/m·ρ / M_soluto  (ρ en g/mL)
 *   Dilución: C₁V₁ = C₂V₂                   Mezcla: C = ΣCᵢVᵢ / ΣVᵢ
 *   Coligativas: ΔT_e = i·K_e·m   ΔT_c = i·K_c·m   π = i·M·R·T   P = x_solvente·P°  (Raoult)
 */
import { R_LATM } from './constants';

export const molaridad = (moles: number, litros: number) => moles / litros;
export const molalidad = (moles: number, kgSolvente: number) => moles / kgSolvente;
export const normalidad = (M: number, theta: number) => M * theta;
export const porcentajeMasa = (mSoluto: number, mSolucion: number) => (100 * mSoluto) / mSolucion;
export const fraccionMolar = (ni: number, nTotal: number) => ni / nTotal;
/** Molaridad a partir de %m/m y densidad (g/mL): M = 10·%·ρ/M_soluto. */
export const molaridadDesdePorcentaje = (porcentaje: number, densidad: number, masaMolar: number) => (10 * porcentaje * densidad) / masaMolar;

/** Dilución: C₁V₁ = C₂V₂; devuelve la incógnita (la que se pasa como null). */
export function dilucion(c1: number | null, v1: number | null, c2: number | null, v2: number | null): number {
  if (c1 === null) return (c2! * v2!) / v1!;
  if (v1 === null) return (c2! * v2!) / c1;
  if (c2 === null) return (c1 * v1) / v2!;
  return (c1 * v1) / c2;
}

/** Mezcla de soluciones del mismo soluto: C = ΣCᵢVᵢ / ΣVᵢ (volúmenes aditivos). */
export function mezcla(partes: { c: number; v: number }[]): number {
  const nTotal = partes.reduce((s, p) => s + p.c * p.v, 0);
  return nTotal / partes.reduce((s, p) => s + p.v, 0);
}

/** Constantes ebulloscópicas y crioscópicas (°C·kg/mol). Fuente: Chang, tabla 12.2 (pendiente de revisión). */
export const CONSTANTES_COLIGATIVAS: Record<string, { nombre: string; Te: number; Tc: number; Ke: number; Kc: number }> = {
  agua: { nombre: 'agua', Te: 100, Tc: 0, Ke: 0.52, Kc: 1.86 },
  benceno: { nombre: 'benceno', Te: 80.1, Tc: 5.5, Ke: 2.53, Kc: 5.12 },
  etanol: { nombre: 'etanol', Te: 78.4, Tc: -117.3, Ke: 1.22, Kc: 1.99 },
  'acido-acetico': { nombre: 'ácido acético', Te: 117.9, Tc: 16.6, Ke: 2.93, Kc: 3.9 },
  ciclohexano: { nombre: 'ciclohexano', Te: 80.7, Tc: 6.6, Ke: 2.79, Kc: 20.0 },
};

/** Aumento ebulloscópico: ΔT_e = i·K_e·m. */
export const aumentoEbullicion = (m: number, Ke: number, i = 1) => i * Ke * m;
/** Descenso crioscópico: ΔT_c = i·K_c·m. */
export const descensoCongelacion = (m: number, Kc: number, i = 1) => i * Kc * m;
/** Presión osmótica (atm): π = i·M·R·T. */
export const presionOsmotica = (M: number, T: number, i = 1) => i * M * R_LATM * T;
/** Ley de Raoult: presión de vapor de la solución P = x_solvente·P°. */
export const raoult = (xSolvente: number, P0: number) => xSolvente * P0;
/** Masa molar del soluto a partir del descenso crioscópico: M = K_c·m_soluto / (ΔT·kg_solvente). */
export const masaMolarCrioscopia = (gSoluto: number, kgSolvente: number, deltaT: number, Kc: number, i = 1) => (i * Kc * gSoluto) / (deltaT * kgSolvente);

/**
 * Solubilidad (g de soluto / 100 g de agua) frente a la temperatura (°C).
 * Fuente: CRC Handbook, «Aqueous solubility of inorganic compounds at various temperatures» (pendiente de revisión).
 */
export const SOLUBILIDAD: Record<string, { formula: string; puntos: [number, number][] }> = {
  'nitrato de potasio': { formula: 'KNO3', puntos: [[0, 13.3], [20, 31.6], [40, 63.9], [60, 110], [80, 169], [100, 246]] },
  'cloruro de sodio': { formula: 'NaCl', puntos: [[0, 35.7], [20, 35.9], [40, 36.4], [60, 37.1], [80, 38.0], [100, 39.2]] },
  'cloruro de potasio': { formula: 'KCl', puntos: [[0, 28.0], [20, 34.2], [40, 40.1], [60, 45.8], [80, 51.3], [100, 56.3]] },
  'nitrato de sodio': { formula: 'NaNO3', puntos: [[0, 73], [20, 88], [40, 104], [60, 124], [80, 148], [100, 180]] },
  'sulfato de cerio(III)': { formula: 'Ce2(SO4)3', puntos: [[0, 20.8], [20, 9.84], [40, 5.7], [60, 3.87]] },
};

/** Interpolación lineal de la curva de solubilidad. */
export function solubilidadA(sal: string, T: number): number | null {
  const p = SOLUBILIDAD[sal]?.puntos;
  if (!p || T < p[0]![0] || T > p.at(-1)![0]) return null;
  for (let i = 1; i < p.length; i++) {
    const [t0, s0] = p[i - 1]!, [t1, s1] = p[i]!;
    if (T <= t1) return s0 + ((s1 - s0) * (T - t0)) / (t1 - t0);
  }
  return p.at(-1)![1];
}
