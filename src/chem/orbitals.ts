/**
 * Orbitales hidrogenoides (solución exacta de la ecuación de Schrödinger para un electrón).
 *
 *   ψₙₗₘ(r, θ, φ) = Rₙₗ(r) · Yₗₘ(θ, φ)
 *
 * Unidades atómicas: r en radios de Bohr (a₀), ψ en a₀^(−3/2). Se usan los armónicos esféricos
 * REALES (combinaciones de ±m), que dan los orbitales px, py, dxy… que se dibujan en los libros.
 */
import type { Campo3D } from './marchingCubes';

// ── Parte radial ────────────────────────────────────────────────────────────

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/**
 * Polinomio de Laguerre generalizado L_k^α(x), por recurrencia:
 *   L₀ = 1,  L₁ = 1 + α − x,  (k+1)·L_{k+1} = (2k + 1 + α − x)·L_k − (k + α)·L_{k−1}
 */
export function laguerre(k: number, alfa: number, x: number): number {
  if (k === 0) return 1;
  let anterior = 1;
  let actual = 1 + alfa - x;
  for (let j = 1; j < k; j++) {
    const siguiente = ((2 * j + 1 + alfa - x) * actual - (j + alfa) * anterior) / (j + 1);
    anterior = actual;
    actual = siguiente;
  }
  return actual;
}

/** Comprueba 1 ≤ n, 0 ≤ l < n, |m| ≤ l. */
export function validarNLM(n: number, l: number, m = 0): void {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('n debe ser un entero ≥ 1');
  if (!Number.isInteger(l) || l < 0 || l >= n) throw new RangeError('l debe cumplir 0 ≤ l ≤ n − 1');
  if (!Number.isInteger(m) || Math.abs(m) > l) throw new RangeError('m debe cumplir −l ≤ m ≤ l');
}

/**
 * Función radial normalizada (∫₀^∞ R² r² dr = 1):
 *   Rₙₗ(r) = √[(2Z/n)³ · (n−l−1)! / (2n·(n+l)!)] · e^(−ρ/2) · ρˡ · L_{n−l−1}^{2l+1}(ρ),   ρ = 2Zr/n
 */
export function radial(n: number, l: number, r: number, z = 1): number {
  const rho = (2 * z * r) / n;
  const norma = Math.sqrt(((2 * z) / n) ** 3 * (factorial(n - l - 1) / (2 * n * factorial(n + l))));
  return norma * Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho);
}

/** Función de distribución radial P(r) = r²·R²: probabilidad por unidad de radio. */
export const distribucionRadial = (n: number, l: number, r: number, z = 1) => r * r * radial(n, l, r, z) ** 2;

// ── Parte angular ───────────────────────────────────────────────────────────

/**
 * Polinomio asociado de Legendre Pₗᵐ(x) para m ≥ 0, SIN la fase de Condon-Shortley (−1)ᵐ,
 * para que px sea positivo hacia +x (convención de los textos de química).
 */
export function legendreAsociado(l: number, m: number, x: number): number {
  let pmm = 1;
  if (m > 0) {
    const s = Math.sqrt(Math.max(0, 1 - x * x));
    let impar = 1;
    for (let i = 1; i <= m; i++) {
      pmm *= impar * s;
      impar += 2;
    }
  }
  if (l === m) return pmm;
  let pmm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pmm1;
  let pll = 0;
  for (let ll = m + 2; ll <= l; ll++) {
    pll = ((2 * ll - 1) * x * pmm1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = pmm1;
    pmm1 = pll;
  }
  return pll;
}

/**
 * Armónico esférico real normalizado (∫ Y² dΩ = 1):
 *   m = 0:  N·Pₗ⁰(cos θ)
 *   m > 0:  √2·N·Pₗᵐ(cos θ)·cos(mφ)
 *   m < 0:  √2·N·Pₗ^|m|(cos θ)·sin(|m|φ)
 * con N = √[(2l+1)/(4π) · (l−|m|)!/(l+|m|)!]
 */
export function armonicoReal(l: number, m: number, theta: number, phi: number): number {
  const am = Math.abs(m);
  const N = Math.sqrt(((2 * l + 1) / (4 * Math.PI)) * (factorial(l - am) / factorial(l + am)));
  const P = legendreAsociado(l, am, Math.cos(theta));
  if (m === 0) return N * P;
  return Math.SQRT2 * N * P * (m > 0 ? Math.cos(am * phi) : Math.sin(am * phi));
}

// ── Función de onda completa ────────────────────────────────────────────────

/** ψₙₗₘ en coordenadas esféricas. */
export const psiEsferica = (n: number, l: number, m: number, r: number, theta: number, phi: number, z = 1) =>
  radial(n, l, r, z) * armonicoReal(l, m, theta, phi);

/** ψₙₗₘ(x, y, z) en coordenadas cartesianas (unidades de a₀). */
export function psi(n: number, l: number, m: number, x: number, y: number, zc: number, zNuclear = 1): number {
  const r = Math.hypot(x, y, zc);
  const theta = r === 0 ? 0 : Math.acos(zc / r);
  const phi = Math.atan2(y, x);
  return psiEsferica(n, l, m, r, theta, phi, zNuclear);
}

/** Crea una función ψ(x, y, z) para un orbital fijo (más rápido al muestrear). */
export function crearPsi(n: number, l: number, m: number, zNuclear = 1) {
  validarNLM(n, l, m);
  return (x: number, y: number, z: number) => psi(n, l, m, x, y, z, zNuclear);
}

// ── Nodos y nombres ─────────────────────────────────────────────────────────

/** Nodos radiales (esferas donde R = 0): n − l − 1. */
export const nodosRadiales = (n: number, l: number) => n - l - 1;
/** Nodos angulares (planos o conos donde Y = 0): l. */
export const nodosAngulares = (l: number) => l;
/** Nodos totales: n − 1. */
export const nodosTotales = (n: number) => n - 1;

const NOMBRES_REALES: Record<number, Record<number, string>> = {
  0: { 0: 's' },
  1: { 1: 'p_x', [-1]: 'p_y', 0: 'p_z' },
  2: { 0: 'd_{z^2}', 1: 'd_{xz}', [-1]: 'd_{yz}', 2: 'd_{x^2-y^2}', [-2]: 'd_{xy}' },
  3: {
    0: 'f_{z^3}',
    1: 'f_{xz^2}',
    [-1]: 'f_{yz^2}',
    2: 'f_{z(x^2-y^2)}',
    [-2]: 'f_{xyz}',
    3: 'f_{x(x^2-3y^2)}',
    [-3]: 'f_{y(3x^2-y^2)}',
  },
};

/** Nombre del orbital real en notación LaTeX: "2p_x", "3d_{z^2}". */
export function nombreOrbital(n: number, l: number, m: number): string {
  return `${n}${NOMBRES_REALES[l]?.[m] ?? `l${l}m${m}`}`;
}

/** Nombre en texto plano: "2px", "3dz²". */
export function nombreOrbitalTexto(n: number, l: number, m: number): string {
  return nombreOrbital(n, l, m)
    .replace(/[_{}]/g, '')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³');
}

/** Lista de orbitales reales de un subnivel, en el orden en que se muestran. */
export function orbitalesDeSubnivel(l: number): number[] {
  return Array.from({ length: 2 * l + 1 }, (_, i) => i - l);
}

// ── Orbitales híbridos (con base n = 2) ─────────────────────────────────────

export type TipoHibrido = 'sp' | 'sp2' | 'sp3';

/** Coeficientes de cada híbrido sobre la base [2s, 2px, 2py, 2pz]. Cada fila está normalizada. */
export const HIBRIDOS: Record<TipoHibrido, { coeficientes: number[][]; angulo: number; geometria: string }> = {
  // sp: (s ± pz)/√2 → dos lóbulos opuestos (180°), geometría lineal
  sp: {
    coeficientes: [
      [Math.SQRT1_2, 0, 0, Math.SQRT1_2],
      [Math.SQRT1_2, 0, 0, -Math.SQRT1_2],
    ],
    angulo: 180,
    geometria: 'lineal',
  },
  // sp²: s/√3 + √(2/3)·px, etc. → tres lóbulos en el plano xy a 120°, trigonal plana
  sp2: {
    coeficientes: [
      [1 / Math.sqrt(3), Math.sqrt(2 / 3), 0, 0],
      [1 / Math.sqrt(3), -1 / Math.sqrt(6), Math.SQRT1_2, 0],
      [1 / Math.sqrt(3), -1 / Math.sqrt(6), -Math.SQRT1_2, 0],
    ],
    angulo: 120,
    geometria: 'trigonal plana',
  },
  // sp³: (s ± px ± py ± pz)/2 → cuatro lóbulos hacia los vértices de un tetraedro (109,47°)
  sp3: {
    coeficientes: [
      [0.5, 0.5, 0.5, 0.5],
      [0.5, 0.5, -0.5, -0.5],
      [0.5, -0.5, 0.5, -0.5],
      [0.5, -0.5, -0.5, 0.5],
    ],
    angulo: (Math.acos(-1 / 3) * 180) / Math.PI,
    geometria: 'tetraédrica',
  },
};

/** Dirección del lóbulo mayor de un híbrido: el vector (cx, cy, cz) de los coeficientes p. */
export function direccionHibrido(coef: number[]): [number, number, number] {
  const [, x = 0, y = 0, z = 0] = coef;
  const largo = Math.hypot(x, y, z) || 1;
  return [x / largo, y / largo, z / largo];
}

/**
 * ψ de un híbrido: Σ cᵢ·φᵢ con φ = [−ψ200, ψ211(px), ψ21−1(py), ψ210(pz)].
 * El 2s hidrogenoide es negativo fuera de su nodo radial (r > 2a₀/Z), justo donde se forma el
 * enlace; se usa −ψ200 (la fase global de una función de base es arbitraria) para que el lóbulo
 * mayor del híbrido apunte en la dirección del enlace, como en los dibujos de los libros.
 */
export function crearPsiHibrido(coef: number[], zNuclear = 1) {
  const s = crearPsi(2, 0, 0, zNuclear);
  const base = [(x: number, y: number, z: number) => -s(x, y, z), crearPsi(2, 1, 1, zNuclear), crearPsi(2, 1, -1, zNuclear), crearPsi(2, 1, 0, zNuclear)];
  return (x: number, y: number, z: number) => coef.reduce((s, ci, i) => s + ci * base[i]!(x, y, z), 0);
}

// ── Isosuperficies y tamaño de la caja ──────────────────────────────────────

/**
 * Radio r* tal que la probabilidad de encontrar al electrón dentro de la esfera de radio r* es p:
 *   ∫₀^{r*} r²·R²(r) dr = p   (integración numérica por el método del trapecio)
 */
export function radioContencion(n: number, l: number, p = 0.99, z = 1): number {
  const dr = 0.01 / z;
  let acumulado = 0;
  let anterior = 0;
  for (let r = dr; r < 400; r += dr) {
    const actual = distribucionRadial(n, l, r, z);
    acumulado += ((anterior + actual) / 2) * dr;
    anterior = actual;
    if (acumulado >= p) return r;
  }
  return 400;
}

/**
 * Valor de |ψ| cuya isosuperficie encierra la fracción `p` de la probabilidad total:
 * se ordenan los puntos de la cuadrícula por |ψ| decreciente y se acumula ψ²·dV hasta llegar a p.
 */
export function isoParaProbabilidad(campo: Campo3D, p = 0.9): number {
  const v = campo.valores;
  const abs = new Float32Array(v.length);
  let total = 0;
  for (let i = 0; i < v.length; i++) {
    abs[i] = Math.abs(v[i]!);
    total += v[i]! * v[i]!;
  }
  abs.sort();
  let acumulado = 0;
  for (let i = abs.length - 1; i >= 0; i--) {
    acumulado += abs[i]! * abs[i]!;
    if (acumulado >= p * total) return abs[i]!;
  }
  return 0;
}

/** Probabilidad dentro de la caja muestreada: Σ ψ²·(paso)³ (≈ 1 si la caja es suficientemente grande). */
export function probabilidadEnCaja(campo: Campo3D): number {
  let s = 0;
  for (const x of campo.valores) s += x * x;
  return s * campo.paso ** 3;
}
