/**
 * Termoquímica.
 *
 *   ΔH°reacción = Σ ν·ΔHf°(productos) − Σ ν·ΔHf°(reactivos)      (igual para S° y ΔGf°)
 *   Ley de Hess: si reacción = Σ kᵢ·(reacción i)  ⇒  ΔH = Σ kᵢ·ΔHᵢ
 *   Gibbs: ΔG = ΔH − T·ΔS ;  temperatura de inversión T = ΔH/ΔS (ΔG = 0)
 *   Calorimetría: q = m·c·ΔT ;  q = C·ΔT ;  mezcla: Σ mᵢcᵢ(T_f − Tᵢ) = 0
 */
import datos from '@/data/termodinamica.json';
import { balancear, especie } from './balance';
import { Fraccion, frac, rref } from './fraction';

export const FUENTE_TERMO = datos.fuente;
export const ESPECIES_TERMO = datos.especies as Record<string, { nombre: string; dHf: number; S: number; dGf: number }>;
export const CALORES_ESPECIFICOS = datos.caloresEspecificos.valores as Record<string, number>;

export class ErrorTermo extends Error {
  override name = 'ErrorTermo';
}

/** Especie con estado: «CO2(g)», «2 H2O(l)», «C(grafito)». */
interface Termino {
  coef: number;
  clave: string;
}

const ESTADO = /\((g|l|s|ac|aq|grafito|diamante|rombico)\)$/;

function parsearLado(lado: string): Termino[] {
  return lado
    .split(/\s+\+\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const m = /^(\d+\/\d+|\d+(?:[.,]\d+)?)?\s*(.+)$/.exec(t)!;
      const c = m[1] ? (m[1].includes('/') ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : Number(m[1].replace(',', '.'))) : NaN;
      return { coef: c, clave: m[2]!.trim() };
    });
}

/** Interpreta una ecuación termoquímica. Si no se escribe ningún coeficiente, se balancea automáticamente. */
export function ecuacionTermo(texto: string): { reactivos: Termino[]; productos: Termino[] } {
  const partes = texto.split(/\s*(?:->|→|=)\s*/);
  if (partes.length !== 2) throw new ErrorTermo('Escribe la reacción con una flecha: reactivos -> productos.');
  const reactivos = parsearLado(partes[0]!), productos = parsearLado(partes[1]!);
  for (const t of [...reactivos, ...productos]) if (!ESTADO.test(t.clave)) throw new ErrorTermo(`Indica el estado físico de ${t.clave}: (g), (l), (s) o (ac).`);
  const todos = [...reactivos, ...productos];
  if (todos.some((t) => !Number.isNaN(t.coef))) {
    // Con algún coeficiente explícito, los que faltan valen 1
    for (const t of todos) if (Number.isNaN(t.coef)) t.coef = 1;
  } else {
    // Balanceo algebraico sin los estados; los coeficientes se asignan en el mismo orden
    const sinEstado = (t: Termino) => t.clave.replace(ESTADO, '').replace(/^C$/, 'C');
    const b = balancear(`${reactivos.map(sinEstado).join(' + ')} -> ${productos.map(sinEstado).join(' + ')}`);
    [...reactivos, ...productos].forEach((t, i) => (t.coef = Number(b.coeficientes[i])));
  }
  return { reactivos, productos };
}

export interface PropiedadesReaccion {
  dH: number;
  dS: number;
  dG: number;
  faltantes: string[];
  pasos: string[];
}

/** ΔH°, ΔS° y ΔG° de una reacción a partir de las tablas de formación (25 °C). */
export function propiedadesReaccion(texto: string): PropiedadesReaccion {
  const { reactivos, productos } = ecuacionTermo(texto);
  const faltantes = [...reactivos, ...productos].map((t) => t.clave).filter((k) => !ESPECIES_TERMO[k]);
  if (faltantes.length) throw new ErrorTermo(`No hay datos de formación para: ${faltantes.join(', ')}.`);
  const suma = (lista: Termino[], p: 'dHf' | 'S' | 'dGf') => lista.reduce((s, t) => s + t.coef * ESPECIES_TERMO[t.clave]![p], 0);
  const dH = suma(productos, 'dHf') - suma(reactivos, 'dHf');
  const dS = suma(productos, 'S') - suma(reactivos, 'S');
  const dG = suma(productos, 'dGf') - suma(reactivos, 'dGf');
  const detalle = (lista: Termino[], p: 'dHf' | 'S' | 'dGf') => lista.map((t) => `${t.coef}(${ESPECIES_TERMO[t.clave]![p]})`).join(' + ');
  return {
    dH,
    dS,
    dG,
    faltantes,
    pasos: [
      `ΔH° = Σν·ΔHf°(prod.) − Σν·ΔHf°(react.) = [${detalle(productos, 'dHf')}] − [${detalle(reactivos, 'dHf')}] = ${dH.toFixed(1)} kJ`,
      `ΔS° = [${detalle(productos, 'S')}] − [${detalle(reactivos, 'S')}] = ${dS.toFixed(1)} J/K`,
      `ΔG° = [${detalle(productos, 'dGf')}] − [${detalle(reactivos, 'dGf')}] = ${dG.toFixed(1)} kJ`,
      `Comprobación: ΔH° − T·ΔS° = ${dH.toFixed(1)} − 298,15 × ${(dS / 1000).toFixed(4)} = ${(dH - (298.15 * dS) / 1000).toFixed(1)} kJ ≈ ΔG°`,
    ],
  };
}

// ── Ley de Hess ─────────────────────────────────────────────────────────────

export interface ReaccionHess {
  ecuacion: string;
  dH: number;
}

export interface ResultadoHess {
  multiplicadores: Fraccion[];
  dH: number;
  pasos: string[];
}

/** Vector de especies (productos +, reactivos −) de una ecuación con coeficientes explícitos o balanceables. */
export function vectorEspecies(texto: string): Map<string, number> {
  const { reactivos, productos } = ecuacionTermo(texto);
  const v = new Map<string, number>();
  for (const t of reactivos) v.set(t.clave, (v.get(t.clave) ?? 0) - t.coef);
  for (const t of productos) v.set(t.clave, (v.get(t.clave) ?? 0) + t.coef);
  return v;
}

/**
 * Busca los multiplicadores kᵢ (fracciones exactas) tales que Σ kᵢ·(ecuación i) = objetivo.
 * kᵢ negativo significa invertir la ecuación (cambia el signo de ΔH).
 */
export function hess(objetivo: string, reacciones: ReaccionHess[]): ResultadoHess {
  const vObj = vectorEspecies(objetivo);
  const vs = reacciones.map((r) => vectorEspecies(r.ecuacion));
  const especies = [...new Set([...vObj.keys(), ...vs.flatMap((v) => [...v.keys()])])];
  // Matriz aumentada [A | b]: columnas = reacciones, filas = especies
  const aFrac = (x: number) => {
    const d = 1000;
    return frac(Math.round(x * d), d);
  };
  const filas = especies.map((e) => [...vs.map((v) => aFrac(v.get(e) ?? 0)), aFrac(vObj.get(e) ?? 0)]);
  const { matriz, pivotes } = rref(filas);
  const n = reacciones.length;
  if (pivotes.includes(n)) throw new ErrorTermo('La reacción objetivo no se puede obtener combinando las ecuaciones dadas.');
  const k = Array.from({ length: n }, () => Fraccion.CERO);
  pivotes.forEach((c, f) => (k[c] = matriz[f]![n]!));
  const dH = k.reduce((s, ki, i) => s + ki.aNumero() * reacciones[i]!.dH, 0);
  const pasos = reacciones.map((r, i) => {
    const ki = k[i]!;
    if (ki.esCero()) return `Ecuación ${i + 1}: no se usa.`;
    const inv = ki.signo() < 0;
    const abs = inv ? ki.negar() : ki;
    return `Ecuación ${i + 1}: ${inv ? 'se invierte y ' : ''}se multiplica por ${abs.toString()} → ΔH = ${ki.toString()} × (${r.dH}) = ${(ki.aNumero() * r.dH).toFixed(1)} kJ`;
  });
  pasos.push(`Al sumar, las especies intermedias se cancelan: ΔH = ${dH.toFixed(1)} kJ.`);
  return { multiplicadores: k, dH, pasos };
}

// ── Espontaneidad ───────────────────────────────────────────────────────────

/** ΔG = ΔH − T·ΔS (ΔH en kJ, ΔS en J/K, resultado en kJ). */
export const gibbs = (dH: number, dS: number, T: number) => dH - (T * dS) / 1000;
/** Temperatura a la que ΔG = 0: T = ΔH/ΔS (K). */
export const temperaturaInversion = (dH: number, dS: number) => (dH * 1000) / dS;

export function criterioEspontaneidad(dH: number, dS: number): string {
  if (dH < 0 && dS > 0) return 'Espontánea a cualquier temperatura (ΔH < 0, ΔS > 0).';
  if (dH > 0 && dS < 0) return 'No espontánea a ninguna temperatura (ΔH > 0, ΔS < 0).';
  const T = temperaturaInversion(dH, dS);
  if (dH < 0) return `Espontánea a bajas temperaturas: por debajo de ${T.toFixed(0)} K (${(T - 273.15).toFixed(0)} °C).`;
  return `Espontánea a altas temperaturas: por encima de ${T.toFixed(0)} K (${(T - 273.15).toFixed(0)} °C).`;
}

// ── Calorimetría ────────────────────────────────────────────────────────────

/** Calor (J): q = m·c·ΔT. */
export const calor = (m: number, c: number, dT: number) => m * c * dT;

/** Temperatura final de una mezcla sin pérdidas: T_f = Σ mᵢcᵢTᵢ / Σ mᵢcᵢ. */
export function temperaturaEquilibrio(partes: { m: number; c: number; T: number }[]): number {
  const num = partes.reduce((s, p) => s + p.m * p.c * p.T, 0);
  const den = partes.reduce((s, p) => s + p.m * p.c, 0);
  return num / den;
}

/** ΔH de una reacción en un calorímetro a presión constante: q_reacción = −(m·c·ΔT) del agua. */
export const calorReaccion = (mAgua: number, dT: number, c = 4.184) => -mAgua * c * dT;

/** Comprueba que una especie de la tabla tenga sus átomos (para pruebas). */
export const formulaDeClave = (clave: string) => especie(clave.replace(ESTADO, '')).formula;
