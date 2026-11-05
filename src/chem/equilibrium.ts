/**
 * Equilibrio químico.
 *
 *   aA + bB ⇌ cC + dD      Kc = [C]^c[D]^d / ([A]^a[B]^b)   (sólidos y líquidos puros no aparecen)
 *   Kp = Kc·(RT)^Δn,  Δn = moles de gas de productos − de reactivos
 *   Q < K → avanza hacia productos;  Q > K → hacia reactivos;  Q = K → equilibrio
 *   Van 't Hoff: ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)
 */
import { R, R_LATM } from './constants';

export interface EspecieEq {
  formula: string;
  coef: number;
  /** Las fases condensadas puras (s, l) no entran en la expresión de K. */
  fase?: 'g' | 'ac' | 's' | 'l';
}

export interface ReaccionEq {
  reactivos: EspecieEq[];
  productos: EspecieEq[];
}

const cuenta = (e: EspecieEq) => e.fase !== 's' && e.fase !== 'l';

/** Cociente de reacción Q (con las mismas reglas que K). */
export function cociente(r: ReaccionEq, cReac: number[], cProd: number[]): number {
  const p = (lista: EspecieEq[], c: number[]) => lista.reduce((acc, e, i) => (cuenta(e) ? acc * c[i]! ** e.coef : acc), 1);
  return p(r.productos, cProd) / p(r.reactivos, cReac);
}

/** Δn de gases. */
export const deltaNGas = (r: ReaccionEq) =>
  r.productos.filter((e) => e.fase === 'g').reduce((s, e) => s + e.coef, 0) - r.reactivos.filter((e) => e.fase === 'g').reduce((s, e) => s + e.coef, 0);

/** Kp = Kc·(RT)^Δn (R en L·atm/(mol·K)). */
export const kpDesdeKc = (Kc: number, T: number, dn: number) => Kc * (R_LATM * T) ** dn;
export const kcDesdeKp = (Kp: number, T: number, dn: number) => Kp / (R_LATM * T) ** dn;

export function sentido(Q: number, K: number): 'productos' | 'reactivos' | 'equilibrio' {
  if (Math.abs(Math.log(Q / K)) < 1e-9) return 'equilibrio';
  return Q < K ? 'productos' : 'reactivos';
}

/** Van 't Hoff: K a otra temperatura (ΔH° en J/mol, supuesto constante). */
export const vantHoff = (K1: number, T1: number, T2: number, dH: number) => K1 * Math.exp((-dH / R) * (1 / T2 - 1 / T1));

export interface ResultadoICE {
  x: number;
  reactivos: number[];
  productos: number[];
  Q0: number;
  sentido: ReturnType<typeof sentido>;
}

/**
 * Tabla ICE: [X]eq = [X]₀ − ν·x (reactivos) y [X]₀ + ν·x (productos).
 * f(x) = ln Q(x) − ln K es estrictamente creciente en el intervalo permitido,
 * así que la raíz se halla por bisección (sin aproximaciones del tipo «x despreciable»).
 */
export function resolverICE(r: ReaccionEq, cReac: number[], cProd: number[], K: number): ResultadoICE {
  const activos = (l: EspecieEq[], c: number[]) => l.map((e, i) => ({ e, c: c[i]! })).filter((o) => cuenta(o.e));
  const ra = activos(r.reactivos, cReac), pa = activos(r.productos, cProd);
  // Límites: ninguna concentración puede ser negativa
  const xMax = Math.min(...ra.map((o) => o.c / o.e.coef), Infinity);
  const xMin = Math.max(...pa.map((o) => -o.c / o.e.coef), -Infinity);
  if (!Number.isFinite(xMax) || !Number.isFinite(xMin)) throw new Error('La reacción necesita al menos un reactivo y un producto en disolución o gas.');
  const lnQ = (x: number) =>
    pa.reduce((s, o) => s + o.e.coef * Math.log(o.c + o.e.coef * x), 0) - ra.reduce((s, o) => s + o.e.coef * Math.log(o.c - o.e.coef * x), 0);
  const lnK = Math.log(K);
  let a = xMin, b = xMax;
  for (let i = 0; i < 300 && b - a > 1e-16 * Math.max(1, Math.abs(a), Math.abs(b)); i++) {
    const m = (a + b) / 2;
    const f = lnQ(m) - lnK;
    if (Number.isNaN(f) || f > 0) b = m;
    else a = m;
  }
  const x = (a + b) / 2;
  const Q0 = cociente(r, cReac, cProd);
  return {
    x,
    reactivos: r.reactivos.map((e, i) => (cuenta(e) ? cReac[i]! - e.coef * x : cReac[i]!)),
    productos: r.productos.map((e, i) => (cuenta(e) ? cProd[i]! + e.coef * x : cProd[i]!)),
    Q0,
    sentido: sentido(Q0, K),
  };
}

/**
 * Evolución temporal por ley de acción de masas (para animar Le Chatelier):
 * d x/dt = k_d·Π[R]^ν − k_i·Π[P]^ν, con k_d/k_i = K. Integra con pasos pequeños (Euler semi-implícito).
 */
export function pasoCinetico(r: ReaccionEq, cReac: number[], cProd: number[], K: number, kd: number, dt: number): { reactivos: number[]; productos: number[] } {
  const ki = kd / K;
  const vd = kd * r.reactivos.reduce((p, e, i) => (cuenta(e) ? p * Math.max(0, cReac[i]!) ** e.coef : p), 1);
  const vi = ki * r.productos.reduce((p, e, i) => (cuenta(e) ? p * Math.max(0, cProd[i]!) ** e.coef : p), 1);
  let dx = (vd - vi) * dt;
  // No pasarse del equilibrio en un paso grande
  const eq = resolverICE(r, cReac, cProd, K);
  if (Math.sign(dx) === Math.sign(eq.x) && Math.abs(dx) > Math.abs(eq.x)) dx = eq.x;
  return {
    reactivos: r.reactivos.map((e, i) => (cuenta(e) ? cReac[i]! - e.coef * dx : cReac[i]!)),
    productos: r.productos.map((e, i) => (cuenta(e) ? cProd[i]! + e.coef * dx : cProd[i]!)),
  };
}
