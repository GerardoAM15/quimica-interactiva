/**
 * Teoría de repulsión de pares electrónicos de la capa de valencia (TRPECV / VSEPR).
 *
 * Los dominios electrónicos alrededor del átomo central (enlaces, sin importar su orden, y pares
 * libres) se ubican lo más lejos posible entre sí. Notación AXₙEₘ: n ligandos, m pares libres.
 *
 * Número de dominios (método de conteo de los textos):
 *   SN = (V_central + Σ aporte de los ligandos − carga) / 2
 *   aporte: H, halógenos y OH → +1 · O, S, Se terminales → 0 · N, P terminales → −1
 * (un número impar de electrones —radicales como NO₂— se redondea hacia arriba).
 */
import { parsearFormula } from './formula';
import { elementoPorSimbolo } from './elements';
import { electronesValencia } from './configuracion';
import { cruz, norma, suma, escalar, unitario, type Molecula, type Vec3, vecindario, pos, resta } from './molecula';

export class ErrorVSEPR extends Error {
  override name = 'ErrorVSEPR';
}

export const GEOMETRIA_ELECTRONICA: Record<number, string> = {
  2: 'lineal',
  3: 'trigonal plana',
  4: 'tetraédrica',
  5: 'bipiramidal trigonal',
  6: 'octaédrica',
};

/** Geometría molecular según el número de dominios (SN) y de pares libres (E). */
export const GEOMETRIA_MOLECULAR: Record<number, Record<number, string>> = {
  2: { 0: 'lineal' },
  3: { 0: 'trigonal plana', 1: 'angular' },
  4: { 0: 'tetraédrica', 1: 'piramidal trigonal', 2: 'angular', 3: 'lineal' },
  5: { 0: 'bipiramidal trigonal', 1: 'balancín (tetraedro distorsionado)', 2: 'forma de T', 3: 'lineal' },
  6: { 0: 'octaédrica', 1: 'piramidal cuadrada', 2: 'cuadrada plana', 3: 'forma de T', 4: 'lineal' },
};

/** Hibridación del átomo central asociada al número de dominios (modelo de los textos). */
export const HIBRIDACION: Record<number, string> = { 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²' };

/** Ángulos ideales entre ligandos (°) para cada caso; con pares libres, los reales son algo menores. */
export function angulosIdeales(sn: number, e: number): number[] {
  const n = sn - e;
  if (n <= 1) return [];
  if (sn === 2) return [180];
  if (sn === 3) return [120];
  if (sn === 4) return [109.5];
  if (sn === 5) {
    if (e === 0) return [90, 120, 180];
    if (e === 1) return [90, 120, 180];
    if (e === 2) return [90, 180];
    return [180];
  }
  if (e === 0) return [90, 180];
  if (e === 1) return [90, 180];
  if (e === 2) return [90, 180];
  if (e === 3) return [90, 180];
  return [180];
}

/** Aporte de electrones de un ligando terminal al conteo de dominios. */
export function aporteLigando(simbolo: string, esOH = false): number {
  if (esOH) return 1;
  if (simbolo === 'H' || ['F', 'Cl', 'Br', 'I'].includes(simbolo)) return 1;
  if (['O', 'S', 'Se', 'Te'].includes(simbolo)) return 0;
  if (['N', 'P'].includes(simbolo)) return -1;
  throw new ErrorVSEPR(`No se sabe cuántos electrones aporta «${simbolo}» como átomo terminal.`);
}

// ── Posiciones ideales de los dominios ──────────────────────────────────────

const s3 = Math.sqrt(3) / 2;
const t = 1 / Math.sqrt(3);
/**
 * Direcciones de los dominios. El orden importa: los pares libres ocupan las primeras posiciones
 * (ecuatoriales en la bipirámide trigonal; opuestas entre sí en el octaedro).
 */
const DIRECCIONES: Record<number, Vec3[]> = {
  2: [[0, 0, 1], [0, 0, -1]],
  3: [[1, 0, 0], [-0.5, s3, 0], [-0.5, -s3, 0]],
  4: [[t, t, t], [t, -t, -t], [-t, t, -t], [-t, -t, t]],
  5: [[1, 0, 0], [-0.5, s3, 0], [-0.5, -s3, 0], [0, 0, 1], [0, 0, -1]],
  6: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]],
};

/** Direcciones de los ligandos (sin las de los pares libres) para un átomo con `sn` dominios y `e` pares libres. */
export function direccionesDominios(sn: number, e: number): Vec3[] {
  const dirs = DIRECCIONES[sn] ?? DIRECCIONES[4]!;
  const libres = dirs.slice(e);
  // En la bipirámide trigonal, los ligandos ocupan primero las posiciones axiales
  return sn === 5 ? [...libres].sort((a, b) => Math.abs(b[2]) - Math.abs(a[2])) : libres;
}

export interface Ligando {
  simbolo: string;
  /** true si es un grupo –OH (en oxoácidos el H va unido al O). */
  esOH: boolean;
  aporte: number;
}

export interface ResultadoVSEPR {
  central: string;
  ligandos: Ligando[];
  carga: number;
  electronesValenciaCentral: number;
  /** Electrones para el conteo: V + Σ aportes − carga. */
  electronesConteo: number;
  dominios: number;
  paresLibres: number;
  radical: boolean;
  notacion: string;
  geometriaElectronica: string;
  geometriaMolecular: string;
  angulos: number[];
  notaAngulos: string | null;
  hibridacion: string;
  polar: boolean;
  razonPolaridad: string;
  /** Momento dipolar estimado (suma vectorial de ΔEN, unidades relativas, no Debye). */
  momentoRelativo: number;
  direccionMomento: Vec3;
  posiciones: { ligandos: Vec3[]; paresLibres: Vec3[] };
  pasos: string[];
}

const EN = (s: string) => elementoPorSimbolo(s)?.electronegatividad ?? 2.2;

/**
 * Elige el átomo central y los ligandos a partir de la fórmula (moléculas e iones AXₙ):
 * el central es el menos electronegativo de los que aparecen una sola vez; en los oxoácidos
 * los H se unen a O (grupos OH); los trímeros homonucleares (O₃, I₃⁻, N₃⁻) usan uno de sus átomos.
 */
export function esqueleto(formula: string): { central: string; ligandos: Ligando[]; carga: number } {
  const f = parsearFormula(formula);
  const atomos = [...f.atomos.entries()];
  const total = atomos.reduce((s, [, n]) => s + n, 0);
  if (total < 3) throw new ErrorVSEPR('Se necesitan al menos 3 átomos (un átomo central y dos ligandos).');
  const h = f.atomos.get('H') ?? 0;
  const o = f.atomos.get('O') ?? 0;

  // Trímeros de un solo elemento: O₃, I₃⁻, N₃⁻
  if (atomos.length === 1 && atomos[0]![1] === 3) {
    const s = atomos[0]![0];
    return { central: s, ligandos: [0, 1].map(() => ({ simbolo: s, esOH: false, aporte: aporteLigando(s) })), carga: f.carga };
  }

  // Hipohalitos y similares (HOCl): el H está unido al O, que es el central
  const otros = atomos.filter(([s]) => s !== 'H' && s !== 'O');
  if (h === 1 && o === 1 && otros.length === 1 && otros[0]![1] === 1 && total === 3) {
    return { central: 'O', ligandos: [{ simbolo: 'H', esOH: false, aporte: 1 }, { simbolo: otros[0]![0], esOH: false, aporte: aporteLigando(otros[0]![0]) }], carga: f.carga };
  }

  const candidatos = atomos.filter(([s, n]) => n === 1 && s !== 'H');
  if (candidatos.length === 0) throw new ErrorVSEPR('No hay un átomo central único (todos los elementos, salvo H, aparecen más de una vez).');
  // El central es el menos electronegativo de los que aparecen una sola vez
  const central = candidatos.sort((a, b) => EN(a[0]) - EN(b[0]))[0]![0];
  if (central === 'H') throw new ErrorVSEPR('El hidrógeno no puede ser átomo central.');
  // Si otro elemento repetido es menos electronegativo que el candidato, el central sería ese elemento
  // repetido (N₂O es N–N–O): la molécula no tiene un único átomo central
  const repetidoMenosEN = atomos.find(([s, n]) => n > 1 && s !== 'H' && EN(s) < EN(central));
  if (repetidoMenosEN) {
    throw new ErrorVSEPR(`Esta molécula no tiene un único átomo central (hay varios ${repetidoMenosEN[0]} menos electronegativos que ${central}).`);
  }

  const ligandos: Ligando[] = [];
  // Oxoácidos (H₂SO₄, HNO₃, H₃PO₄…): si hay O suficientes y el central no es O, los H van sobre los O
  const hEnOxigeno = central !== 'O' && h > 0 && o >= h + 1 && o > 0;
  let oxigenosLibres = o;
  if (hEnOxigeno) {
    for (let i = 0; i < h; i++) ligandos.push({ simbolo: 'O', esOH: true, aporte: 1 });
    oxigenosLibres -= h;
  } else {
    for (let i = 0; i < h; i++) ligandos.push({ simbolo: 'H', esOH: false, aporte: 1 });
  }
  for (const [s, n] of atomos) {
    if (s === 'H' || s === central) continue;
    const cantidad = s === 'O' ? oxigenosLibres : n;
    for (let i = 0; i < cantidad; i++) ligandos.push({ simbolo: s, esOH: false, aporte: aporteLigando(s) });
  }
  if (central === 'O' && o > 1) throw new ErrorVSEPR('Con varios oxígenos no hay un átomo central único (p. ej. H₂O₂).');
  return { central, ligandos, carga: f.carga };
}

/** Aplica VSEPR a una molécula o ion con un átomo central (AXₙEₘ). */
export function analizarVSEPR(formula: string): ResultadoVSEPR {
  const { central, ligandos, carga } = esqueleto(formula);
  const el = elementoPorSimbolo(central)!;
  const bloque = el.familia === 'transicion' || el.familia === 'lantanido' || el.familia === 'actinido';
  if (bloque) throw new ErrorVSEPR('VSEPR en esta forma se aplica a átomos centrales de los bloques s y p.');
  const V = electronesValencia(el.z);
  const sumaAportes = ligandos.reduce((s, l) => s + l.aporte, 0);
  const conteo = V + sumaAportes - carga;
  const radical = conteo % 2 !== 0;
  const dominios = Math.ceil(conteo / 2);
  const n = ligandos.length;
  const paresLibres = dominios - n;
  if (paresLibres < 0) throw new ErrorVSEPR(`El conteo da ${dominios} dominios para ${n} ligandos: revisa la fórmula o la carga.`);
  if (dominios < 2 || dominios > 6) throw new ErrorVSEPR(`${dominios} dominios electrónicos: fuera del alcance del modelo (2 a 6).`);

  // Ubicar pares libres y ligandos (regla de Bent: en la bipirámide, los ligandos más electronegativos son axiales)
  const dirs = DIRECCIONES[dominios]!;
  const posPares = dirs.slice(0, paresLibres);
  let posLig = dirs.slice(paresLibres);
  let ligOrdenados = [...ligandos];
  if (dominios === 5) {
    posLig = [...posLig].sort((a, b) => Math.abs(b[2]) - Math.abs(a[2])); // axiales primero
    ligOrdenados = [...ligandos].sort((a, b) => EN(b.simbolo) - EN(a.simbolo));
  }

  // Momento dipolar: suma de ΔEN·û (û del central al ligando; positivo si el ligando es más electronegativo)
  let mu: Vec3 = [0, 0, 0];
  ligOrdenados.forEach((l, i) => {
    mu = suma(mu, escalar(posLig[i]!, EN(l.simbolo) - EN(central)));
  });
  const sumaPares = posPares.reduce((acc, p) => suma(acc, p), [0, 0, 0] as Vec3);
  const momentoRelativo = norma(mu);
  const paresAsimetricos = norma(sumaPares) > 1e-6;
  const ligandosIguales = new Set(ligandos.map((l) => `${l.simbolo}${l.esOH ? 'H' : ''}`)).size === 1;
  // Regla de los textos: ligandos distintos (incluido OH frente a =O) → los momentos no se cancelan.
  // (Hay excepciones muy simétricas, como PCl₃F₂ con los F axiales, que este criterio no distingue.)
  const polar = paresAsimetricos || !ligandosIguales || momentoRelativo > 0.05;
  const razonPolaridad = paresAsimetricos
    ? 'Los pares libres del átomo central están distribuidos de forma asimétrica: los momentos dipolares no se cancelan.'
    : polar
      ? 'Los ligandos son distintos (o tienen distinta electronegatividad): los momentos de enlace no se cancelan.'
      : ligandosIguales
        ? 'Geometría simétrica con ligandos iguales: los momentos de enlace se cancelan (μ = 0).'
        : 'Los momentos de enlace se cancelan por simetría.';

  const geometriaMolecular = n === 1 ? 'lineal' : GEOMETRIA_MOLECULAR[dominios]![paresLibres]!;
  const ideal = angulosIdeales(dominios, paresLibres);
  const notaAngulos =
    paresLibres > 0 && dominios <= 4 && n >= 2
      ? `Los pares libres repelen más que los pares enlazantes: el ángulo real es menor que ${ideal[0]}°.`
      : paresLibres > 0 && dominios >= 5 && geometriaMolecular !== 'lineal' && geometriaMolecular !== 'cuadrada plana'
        ? 'Los pares libres comprimen ligeramente los ángulos respecto de los ideales.'
        : null;
  const notacion = `AX${n > 1 ? n : ''}${paresLibres ? `E${paresLibres > 1 ? paresLibres : ''}` : ''}`;
  const desc = (l: Ligando) => (l.esOH ? 'OH' : l.simbolo);
  const pasos = [
    `Átomo central: ${central} (el menos electronegativo que aparece una sola vez${ligandos.some((l) => l.esOH) ? '; en los oxoácidos los H están unidos a O, formando grupos OH' : ''}).`,
    `Electrones de valencia del ${central}: ${V}.`,
    `Aportes de los ligandos: ${ligandos.map((l) => `${desc(l)} (${l.aporte >= 0 ? '+' : ''}${l.aporte})`).join(', ')} → Σ = ${sumaAportes}.`,
    `${carga !== 0 ? `Carga del ion: ${carga > 0 ? '+' : ''}${carga} → se resta. ` : ''}Electrones = ${V} + ${sumaAportes}${carga ? ` − (${carga})` : ''} = ${conteo}.`,
    `Dominios = ${conteo}/2${radical ? ` = ${(conteo / 2).toFixed(1)} → se redondea a ${dominios} (hay un electrón desapareado)` : ` = ${dominios}`}.`,
    `Pares libres = dominios − ligandos = ${dominios} − ${n} = ${paresLibres} → ${notacion}.`,
    `Geometría electrónica: ${GEOMETRIA_ELECTRONICA[dominios]}; geometría molecular: ${geometriaMolecular}.`,
    `Hibridación del ${central}: ${HIBRIDACION[dominios]}.`,
  ];

  return {
    central,
    ligandos: ligOrdenados,
    carga,
    electronesValenciaCentral: V,
    electronesConteo: conteo,
    dominios,
    paresLibres,
    radical,
    notacion,
    geometriaElectronica: GEOMETRIA_ELECTRONICA[dominios]!,
    geometriaMolecular,
    angulos: ideal,
    notaAngulos,
    hibridacion: HIBRIDACION[dominios]!,
    polar,
    razonPolaridad,
    momentoRelativo,
    direccionMomento: unitario(mu),
    posiciones: { ligandos: posLig, paresLibres: posPares },
    pasos,
  };
}

// ── Análisis por átomo en una molécula cualquiera (visor 3D) ────────────────

export interface AnalisisAtomo {
  indice: number;
  simbolo: string;
  vecinos: number;
  paresLibres: number;
  dominios: number;
  notacion: string;
  geometriaMolecular: string | null;
  hibridacion: string | null;
  /** Posible conjugación: par libre junto a un enlace múltiple (p. ej. N de una amida, sp² en la realidad). */
  conjugado: boolean;
}

/**
 * Pares libres de cada átomo a partir del grafo:  E = (V − q − Σ órdenes de enlace) / 2
 * (V = electrones de valencia, q = carga formal). Requiere que la molécula incluya los H.
 */
export function analizarAtomo(mol: Molecula, indice: number, vecinos = vecindario(mol)): AnalisisAtomo {
  const a = mol.atomos[indice]!;
  const el = elementoPorSimbolo(a.simbolo);
  const v = vecinos[indice]!;
  const sumaOrdenes = v.reduce((s, x) => s + x.orden, 0);
  const V = el && el.familia !== 'transicion' ? electronesValencia(el.z) : 0;
  const pares = Math.max(0, Math.floor((V - a.carga - sumaOrdenes) / 2));
  const dominios = v.length + pares;
  const conjugado = pares > 0 && dominios === 4 && v.some((x) => vecinos[x.i]!.some((y) => y.orden > 1 && y.i !== indice));
  const n = v.length;
  return {
    indice,
    simbolo: a.simbolo,
    vecinos: n,
    paresLibres: pares,
    dominios,
    notacion: `AX${n > 1 ? n : n === 1 ? '' : '0'}${pares ? `E${pares > 1 ? pares : ''}` : ''}`,
    geometriaMolecular: n >= 2 && GEOMETRIA_MOLECULAR[dominios] ? (GEOMETRIA_MOLECULAR[dominios]![pares] ?? null) : null,
    hibridacion: n >= 1 && a.simbolo !== 'H' && HIBRIDACION[dominios] ? HIBRIDACION[dominios]! : null,
    conjugado,
  };
}

/**
 * Momento dipolar estimado de una molécula con coordenadas 3D: suma de vectores de enlace
 * ΔEN·û más un término por cada par libre (en la dirección opuesta a sus vecinos).
 * Es una estimación cualitativa (unidades relativas), no un valor en Debye.
 */
export function momentoDipolarEstimado(mol: Molecula): { vector: Vec3; modulo: number } {
  const vec = vecindario(mol);
  let mu: Vec3 = [0, 0, 0];
  for (const e of mol.enlaces) {
    const A = mol.atomos[e.a]!, B = mol.atomos[e.b]!;
    const d = EN(B.simbolo) - EN(A.simbolo);
    mu = suma(mu, escalar(unitario(resta(pos(B), pos(A))), d));
  }
  const K_PAR = 0.35; // peso relativo de un par libre
  mol.atomos.forEach((a, i) => {
    const an = analizarAtomo(mol, i, vec);
    if (!an.paresLibres || vec[i]!.length === 0) return;
    const haciaVecinos = vec[i]!.reduce((acc, x) => suma(acc, unitario(resta(pos(mol.atomos[x.i]!), pos(a)))), [0, 0, 0] as Vec3);
    if (norma(haciaVecinos) < 1e-3) return; // pares opuestos (simétricos): no contribuyen
    mu = suma(mu, escalar(unitario(haciaVecinos), -K_PAR * an.paresLibres));
  });
  return { vector: mu, modulo: norma(mu) };
}

/** Plano de un trío de puntos (para comprobar planaridad en pruebas). */
export const normalPlano = (a: Vec3, b: Vec3, c: Vec3) => unitario(cruz(resta(b, a), resta(c, a)));
