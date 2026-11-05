/**
 * Cinética química.
 *
 *   Ley de velocidad: v = k[A]^m[B]^n
 *   Leyes integradas (A → productos):
 *     orden 0: [A] = [A]₀ − kt            t½ = [A]₀/(2k)
 *     orden 1: ln[A] = ln[A]₀ − kt        t½ = ln 2 / k
 *     orden 2: 1/[A] = 1/[A]₀ + kt        t½ = 1/(k[A]₀)
 *   Arrhenius: k = A·e^(−Ea/RT)  ⇒  ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)
 */
import { R } from './constants';

export type Orden = 0 | 1 | 2;

/** Concentración del reactivo en el tiempo t (no negativa en orden 0). */
export function concentracion(orden: Orden, A0: number, k: number, t: number): number {
  if (orden === 0) return Math.max(0, A0 - k * t);
  if (orden === 1) return A0 * Math.exp(-k * t);
  return 1 / (1 / A0 + k * t);
}

/** Tiempo de vida media. */
export function vidaMedia(orden: Orden, k: number, A0: number): number {
  if (orden === 0) return A0 / (2 * k);
  if (orden === 1) return Math.LN2 / k;
  return 1 / (k * A0);
}

/** Tiempo necesario para que [A] baje de A0 a A. */
export function tiempoPara(orden: Orden, A0: number, A: number, k: number): number {
  if (orden === 0) return (A0 - A) / k;
  if (orden === 1) return Math.log(A0 / A) / k;
  return (1 / A - 1 / A0) / k;
}

/** Unidades de k según el orden global (concentración en M, tiempo en s). */
export const unidadesK = (ordenGlobal: number) => (ordenGlobal === 1 ? 's⁻¹' : ordenGlobal === 0 ? 'M·s⁻¹' : `M${superindice(1 - ordenGlobal)}·s⁻¹`);
const superindice = (n: number) =>
  String(n)
    .replace('-', '⁻')
    .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)
    .replace('.', '·');

// ── Regresión lineal ────────────────────────────────────────────────────────

export interface AjusteLineal {
  pendiente: number;
  intercepto: number;
  r2: number;
}

/** Mínimos cuadrados y = a + b·x, con coeficiente de determinación R². */
export function regresionLineal(x: number[], y: number[]): AjusteLineal {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my);
    sxx += (x[i]! - mx) ** 2;
    syy += (y[i]! - my) ** 2;
  }
  const b = sxy / sxx;
  return { pendiente: b, intercepto: my - b * mx, r2: syy === 0 ? 1 : (sxy * sxy) / (sxx * syy) };
}

export interface ResultadoOrden {
  orden: Orden;
  k: number;
  ajustes: Record<Orden, AjusteLineal>;
}

/**
 * Método gráfico: el orden es el que da la recta con mejor R² en
 * [A] vs t (orden 0), ln[A] vs t (orden 1) o 1/[A] vs t (orden 2).
 */
export function determinarOrden(t: number[], A: number[]): ResultadoOrden {
  const ajustes = {
    0: regresionLineal(t, A),
    1: regresionLineal(t, A.map(Math.log)),
    2: regresionLineal(t, A.map((a) => 1 / a)),
  } as Record<Orden, AjusteLineal>;
  const orden = ([0, 1, 2] as Orden[]).reduce((m, o) => (ajustes[o].r2 > ajustes[m].r2 ? o : m), 0 as Orden);
  const k = orden === 2 ? ajustes[2].pendiente : -ajustes[orden].pendiente;
  return { orden, k, ajustes };
}

// ── Método de las velocidades iniciales ─────────────────────────────────────

export interface Experimento {
  concentraciones: number[];
  velocidad: number;
}

/** Resuelve un sistema lineal pequeño por eliminación de Gauss con pivoteo parcial. */
function resolver(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((f, i) => [...f, b[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let f = c + 1; f < n; f++) if (Math.abs(M[f]![c]!) > Math.abs(M[p]![c]!)) p = f;
    [M[c], M[p]] = [M[p]!, M[c]!];
    if (Math.abs(M[c]![c]!) < 1e-12) throw new Error('Los experimentos no permiten separar el efecto de cada reactivo.');
    for (let f = 0; f < n; f++) {
      if (f === c) continue;
      const r = M[f]![c]! / M[c]![c]!;
      for (let k = c; k <= n; k++) M[f]![k]! -= r * M[c]![k]!;
    }
  }
  return M.map((f, i) => f[n]! / f[i]!);
}

/**
 * Ajusta log v = log k + Σ mᵢ·log[Aᵢ] por mínimos cuadrados (ecuaciones normales).
 * Los órdenes se redondean al múltiplo de ½ más cercano y k se recalcula como promedio.
 */
export function leyVelocidad(experimentos: Experimento[]): { ordenes: number[]; ordenesExactos: number[]; k: number; pasos: string[] } {
  const nR = experimentos[0]!.concentraciones.length;
  const X = experimentos.map((e) => [1, ...e.concentraciones.map(Math.log10)]);
  const y = experimentos.map((e) => Math.log10(e.velocidad));
  const XtX = Array.from({ length: nR + 1 }, (_, i) => Array.from({ length: nR + 1 }, (_, j) => X.reduce((s, f) => s + f[i]! * f[j]!, 0)));
  const Xty = Array.from({ length: nR + 1 }, (_, i) => X.reduce((s, f, k) => s + f[i]! * y[k]!, 0));
  const sol = resolver(XtX, Xty);
  const ordenesExactos = sol.slice(1);
  const ordenes = ordenesExactos.map((m) => Math.round(m * 2) / 2);
  const ks = experimentos.map((e) => e.velocidad / e.concentraciones.reduce((p, c, i) => p * c ** ordenes[i]!, 1));
  const k = ks.reduce((a, b) => a + b, 0) / ks.length;
  // Pasos: comparar pares de experimentos donde solo cambia un reactivo
  const pasos: string[] = [];
  for (let r = 0; r < nR; r++) {
    for (let i = 0; i < experimentos.length; i++) {
      for (let j = i + 1; j < experimentos.length; j++) {
        const a = experimentos[i]!, b = experimentos[j]!;
        const soloCambia = a.concentraciones.every((c, q) => (q === r ? c !== b.concentraciones[q] : Math.abs(c - b.concentraciones[q]!) < 1e-12 * Math.max(1, c)));
        if (soloCambia && !pasos.some((p) => p.startsWith(`Reactivo ${r + 1}`))) {
          const fc = b.concentraciones[r]! / a.concentraciones[r]!, fv = b.velocidad / a.velocidad;
          pasos.push(`Reactivo ${r + 1}: experimentos ${i + 1} y ${j + 1}: la concentración se multiplica por ${fc.toPrecision(3)} y la velocidad por ${fv.toPrecision(3)} → orden = log(${fv.toPrecision(3)})/log(${fc.toPrecision(3)}) = ${(Math.log(fv) / Math.log(fc)).toFixed(2)}`);
        }
      }
    }
  }
  pasos.push(`k = v / Π[Aᵢ]^mᵢ, promedio de los experimentos = ${k.toPrecision(3)}`);
  return { ordenes, ordenesExactos, k, pasos };
}

// ── Arrhenius ───────────────────────────────────────────────────────────────

/** k = A·e^(−Ea/RT), Ea en J/mol. */
export const arrhenius = (A: number, Ea: number, T: number) => A * Math.exp(-Ea / (R * T));
/** k₂ a partir de k₁: ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂). */
export const kADosTemperaturas = (k1: number, T1: number, T2: number, Ea: number) => k1 * Math.exp((Ea / R) * (1 / T1 - 1 / T2));
/** Energía de activación (J/mol) a partir de dos constantes. */
export const energiaActivacion = (k1: number, T1: number, k2: number, T2: number) => (R * Math.log(k2 / k1)) / (1 / T1 - 1 / T2);
