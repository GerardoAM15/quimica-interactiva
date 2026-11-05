/**
 * Solubilidad de compuestos iónicos en agua (25 °C) por reglas de solubilidad y predicción de
 * precipitados en reacciones de doble desplazamiento, con ecuación iónica total y neta.
 *
 *   Fórmula del compuesto: Mᵃ⁺ y Xᵇ⁻ se combinan en la proporción M_(b/d) X_(a/d), d = mcd(a, b)
 *   Ecuación iónica neta: se eliminan los iones espectadores (los que aparecen igual en ambos lados).
 */
import datos from '@/data/solubilidad.json';
import ab from '@/data/acidos-bases.json';
import { balancear } from './balance';
import { formulaHill } from './formula';

export type Solubilidad = 'soluble' | 'poco' | 'insoluble' | 'reacciona';
export const NOMBRE_SOLUBILIDAD: Record<Solubilidad, string> = { soluble: 'soluble', poco: 'poco soluble', insoluble: 'insoluble', reacciona: 'reacciona con el agua' };

export interface Cation {
  ion: string;
  elemento: string;
  carga: number;
  nombre: string;
}
export interface Anion {
  ion: string;
  grupo: string;
  carga: number;
  nombre: string;
}

export const FUENTE_SOLUBILIDAD = datos.fuente;
export const CATIONES = datos.cationes as Cation[];
export const ANIONES = datos.aniones as Anion[];
export const REGLAS = datos.reglas.map((r) => r.texto);
const COLORES = datos.colores as Record<string, string>;
const HEX = datos.hexColores as Record<string, string>;

const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : a);
/** ¿Es un grupo de varios átomos (necesita paréntesis si se repite)? */
const poliatomico = (g: string) => (g.match(/[A-Z]/g) ?? []).length > 1 || /\d/.test(g);
const grupo = (g: string, n: number) => (n === 1 ? g : poliatomico(g) ? `(${g})${n}` : `${g}${n}`);

/** Fórmula neutra: Fe³⁺ + SO₄²⁻ → Fe2(SO4)3. */
export function formulaCompuesto(c: Cation, a: Anion): string {
  const d = mcd(c.carga, a.carga);
  return grupo(c.elemento, a.carga / d) + grupo(a.grupo, c.carga / d);
}

export const nombreCompuesto = (c: Cation, a: Anion) => `${a.nombre} de ${c.nombre}`;

export interface Celda {
  cation: Cation;
  anion: Anion;
  formula: string;
  nombre: string;
  solubilidad: Solubilidad;
  /** Regla o excepción que decide el resultado. */
  regla: string;
  nota?: string;
  /** Color del precipitado (si es insoluble o poco soluble y se conoce). */
  color?: string;
  hex?: string;
  ksp?: number;
}

const ALCALINOS = ['Li+', 'Na+', 'K+', 'NH4+'];

/** Solubilidad de la combinación catión–anión según las reglas (excepciones primero). */
export function solubilidad(c: Cation, a: Anion): Celda {
  const formula = formulaCompuesto(c, a);
  const base = { cation: c, anion: a, formula, nombre: nombreCompuesto(c, a) };
  let res: Solubilidad;
  let regla: string;
  let nota: string | undefined;
  const exc = datos.excepciones.find((e) => e.cation === c.ion && e.anion === a.ion);
  if (exc) {
    res = exc.resultado as Solubilidad;
    nota = exc.nota;
    regla = datos.reglas.find((r) => r.aniones !== '*' && (r.aniones as string[]).includes(a.ion))?.texto ?? 'Excepción tabulada.';
  } else if (ALCALINOS.includes(c.ion)) {
    res = 'soluble';
    regla = datos.reglas[0]!.texto;
  } else {
    const r = datos.reglas.find((x) => x.aniones !== '*' && (x.aniones as string[]).includes(a.ion))!;
    res = ((r.excepto ?? []).includes(c.ion) ? r.resultadoExcepcion : r.resultado) as Solubilidad;
    regla = r.texto;
  }
  const clave = formula.replace(/[()]/g, (p) => p);
  const color = res === 'insoluble' || res === 'poco' ? COLORES[clave] : undefined;
  const ksp = ab.ksp.find((k) => k.formula === formula)?.Ksp;
  return { ...base, solubilidad: res, regla, nota, color, hex: color ? HEX[color] : undefined, ksp };
}

/** Tabla completa cationes × aniones. */
export const tablaSolubilidad = (): Celda[][] => CATIONES.map((c) => ANIONES.map((a) => solubilidad(c, a)));

/** Identifica el catión y el anión de una sal escrita por su fórmula (compara átomos, no texto). */
export function identificarSal(formula: string): { cation: Cation; anion: Anion } | null {
  let hill: string;
  try {
    hill = formulaHill(formula);
  } catch {
    return null;
  }
  for (const c of CATIONES) for (const a of ANIONES) if (formulaHill(formulaCompuesto(c, a)) === hill) return { cation: c, anion: a };
  return null;
}

export interface Especie {
  coef: number;
  texto: string;
  /** (s) si precipita; (ac) si está disuelta. */
  estado: 's' | 'ac';
}

export interface PrediccionPrecipitado {
  productos: [Celda, Celda];
  hayPrecipitado: boolean;
  precipitados: Celda[];
  molecular: Especie[][];
  ionicaTotal: Especie[][];
  ionicaNeta: Especie[][] | null;
  explicacion: string[];
}

/** Notación mhchem de los iones: «Pb^2+», «NH4+», «SO4^2-». */
const ionCation = (c: Cation) => (c.carga > 1 ? `${c.elemento}^${c.carga}+` : `${c.elemento}+`);
const ionAnion = (a: Anion) => (a.carga > 1 ? `${a.grupo}^${a.carga}-` : `${a.grupo}-`);

/** Doble desplazamiento AB + CD → AD + CB: predice el precipitado y escribe la ecuación iónica neta. */
export function predecirPrecipitado(sal1: string, sal2: string): PrediccionPrecipitado {
  const s1 = identificarSal(sal1), s2 = identificarSal(sal2);
  if (!s1 || !s2) throw new Error(`No se reconoce ${!s1 ? sal1 : sal2} como una sal de la tabla de solubilidad.`);
  const r1 = solubilidad(s1.cation, s1.anion), r2 = solubilidad(s2.cation, s2.anion);
  const p1 = solubilidad(s1.cation, s2.anion), p2 = solubilidad(s2.cation, s1.anion);
  const explicacion: string[] = [];
  for (const r of [r1, r2]) if (r.solubilidad !== 'soluble') explicacion.push(`Atención: ${r.formula} es ${NOMBRE_SOLUBILIDAD[r.solubilidad]}; la reacción en disolución supone reactivos disueltos.`);
  const b = balancear(`${r1.formula} + ${r2.formula} -> ${p1.formula} + ${p2.formula}`);
  const k = b.coeficientes.map(Number);
  const precipita = (c: Celda) => c.solubilidad === 'insoluble' || c.solubilidad === 'poco';
  const estado = (c: Celda): 's' | 'ac' => (precipita(c) ? 's' : 'ac');
  const molecular: Especie[][] = [
    [r1, r2].map((c, i) => ({ coef: k[i]!, texto: c.formula, estado: estado(c) })),
    [p1, p2].map((c, i) => ({ coef: k[i + 2]!, texto: c.formula, estado: estado(c) })),
  ];
  // Iónica total: las sales disueltas se separan en sus iones
  const ionizar = (c: Celda, coef: number): Especie[] => {
    if (precipita(c)) return [{ coef, texto: c.formula, estado: 's' }];
    const d = mcd(c.cation.carga, c.anion.carga);
    return [
      { coef: (coef * c.anion.carga) / d, texto: ionCation(c.cation), estado: 'ac' },
      { coef: (coef * c.cation.carga) / d, texto: ionAnion(c.anion), estado: 'ac' },
    ];
  };
  const juntar = (l: Especie[]) => {
    const m = new Map<string, Especie>();
    for (const e of l) m.set(e.texto + e.estado, { ...e, coef: (m.get(e.texto + e.estado)?.coef ?? 0) + e.coef });
    return [...m.values()];
  };
  const izq = juntar([...ionizar(r1, k[0]!), ...ionizar(r2, k[1]!)]);
  const der = juntar([...ionizar(p1, k[2]!), ...ionizar(p2, k[3]!)]);
  const ionicaTotal = [izq, der];
  const precipitados = [p1, p2].filter(precipita);
  const reacciona = [p1, p2].filter((c) => c.solubilidad === 'reacciona');
  for (const c of reacciona) explicacion.push(`${c.formula}: ${c.nota ?? 'no existe como tal en agua.'}`);
  let ionicaNeta: Especie[][] | null = null;
  if (precipitados.length) {
    // Se eliminan los espectadores (misma especie y estado a ambos lados)
    const resta = (a: Especie[], b: Especie[]) =>
      a
        .map((e) => {
          const o = b.find((x) => x.texto === e.texto && x.estado === e.estado);
          return { ...e, coef: e.coef - Math.min(e.coef, o?.coef ?? 0) };
        })
        .filter((e) => e.coef > 0);
    let ni = resta(izq, der), nd = resta(der, izq);
    const g = [...ni, ...nd].reduce((x, e) => mcd(x, e.coef), 0) || 1;
    ni = ni.map((e) => ({ ...e, coef: e.coef / g }));
    nd = nd.map((e) => ({ ...e, coef: e.coef / g }));
    // Convención: primero los cationes, luego los aniones y al final los sólidos
    const orden = (e: Especie) => (e.estado === 's' ? 2 : e.texto.endsWith('+') ? 0 : 1);
    ionicaNeta = [ni.sort((x, y) => orden(x) - orden(y)), nd.sort((x, y) => orden(x) - orden(y))];
    const espect = izq.filter((e) => e.estado === 'ac' && der.some((x) => x.texto === e.texto && x.estado === 'ac')).map((e) => e.texto);
    explicacion.push(`Precipita ${precipitados.map((c) => `${c.formula} (${c.nombre}${c.color ? `, ${c.color}` : ''})`).join(' y ')}.`);
    if (espect.length) explicacion.push(`Iones espectadores (no participan): ${espect.join(', ')}.`);
  } else if (!reacciona.length) {
    explicacion.push('Los dos productos posibles son solubles: los iones permanecen en disolución y no hay reacción neta.');
  }
  return { productos: [p1, p2], hayPrecipitado: precipitados.length > 0, precipitados, molecular, ionicaTotal, ionicaNeta, explicacion };
}

/** Lado de una ecuación en notación mhchem: «2 Ag+(aq) + 2 NO3-(aq)». */
export const ladoMhchem = (l: Especie[]) => l.map((e) => `${e.coef > 1 ? `${e.coef} ` : ''}${e.texto}(${e.estado === 's' ? 's' : 'aq'})`).join(' + ');
