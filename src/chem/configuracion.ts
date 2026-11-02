/**
 * Configuración electrónica y números cuánticos.
 *
 * - Regla de Moeller (Aufbau / regla de las diagonales): los subniveles se llenan en orden creciente
 *   de energía relativa ER = n + l; a igual ER, primero el de menor n.
 * - Principio de exclusión de Pauli: máximo 2 electrones (spines opuestos) por orbital →
 *   un subnivel admite 2(2l + 1) electrones y un nivel 2n².
 * - Regla de Hund: en orbitales de igual energía, los electrones se distribuyen primero con spines
 *   paralelos (uno por orbital) antes de aparearse.
 */
import { elementoPorZ, Z_GASES_NOBLES, type Bloque } from './elements';

export const LETRAS_L = ['s', 'p', 'd', 'f', 'g'] as const;

export interface Subnivel {
  n: number;
  l: number;
  /** Número de electrones en el subnivel. */
  e: number;
}

/** Capacidad de un subnivel: 2(2l + 1). */
export const capacidadSubnivel = (l: number) => 2 * (2 * l + 1);
/** Capacidad de un nivel: 2n². */
export const capacidadNivel = (n: number) => 2 * n * n;
/** Energía relativa (regla de Moeller): ER = n + l. */
export const energiaRelativa = (n: number, l: number) => n + l;

export const nombreSubnivel = (n: number, l: number) => `${n}${LETRAS_L[l]}`;

/** Orden de llenado de Moeller hasta 7p (suficiente para Z ≤ 118). */
export const ORDEN_MOELLER: readonly { n: number; l: number }[] = (() => {
  const lista: { n: number; l: number }[] = [];
  // Hasta 7p (n + l ≤ 8): 6f, 7d… no se ocupan en ningún elemento conocido
  for (let n = 1; n <= 7; n++) for (let l = 0; l < Math.min(n, 4); l++) if (n + l <= 8) lista.push({ n, l });
  return lista.sort((a, b) => energiaRelativa(a.n, a.l) - energiaRelativa(b.n, b.l) || a.n - b.n);
})();

const clave = (n: number, l: number) => `${n},${l}`;

/** Distribución según la regla de Moeller, sin excepciones. */
export function configuracionMoeller(numElectrones: number): Subnivel[] {
  if (!Number.isInteger(numElectrones) || numElectrones < 0 || numElectrones > 118) {
    throw new RangeError(`Número de electrones no válido: ${numElectrones}`);
  }
  const resultado: Subnivel[] = [];
  let restantes = numElectrones;
  for (const { n, l } of ORDEN_MOELLER) {
    if (restantes === 0) break;
    const e = Math.min(restantes, capacidadSubnivel(l));
    resultado.push({ n, l, e });
    restantes -= e;
  }
  return resultado;
}

/**
 * Excepciones a la regla de Moeller en el estado fundamental (átomos neutros), con la ocupación
 * real de los subniveles que cambian. La estabilidad extra de los subniveles d y f llenos o
 * semillenos (d⁵, d¹⁰, f⁷, f¹⁴) explica varias de ellas (Cr, Cu, Mo, Ag, Au, Gd…).
 * Fuente: NIST Atomic Spectra Database (configuraciones del estado fundamental).
 * Para Lr se usa 7s² 7p¹ (medición de 2015); PubChem aún lista 7s² 6d¹.
 */
export const EXCEPCIONES: Readonly<Record<number, Readonly<Record<string, number>>>> = {
  24: { '4,0': 1, '3,2': 5 }, // Cr: [Ar] 3d⁵ 4s¹
  29: { '4,0': 1, '3,2': 10 }, // Cu: [Ar] 3d¹⁰ 4s¹
  41: { '5,0': 1, '4,2': 4 }, // Nb: [Kr] 4d⁴ 5s¹
  42: { '5,0': 1, '4,2': 5 }, // Mo: [Kr] 4d⁵ 5s¹
  44: { '5,0': 1, '4,2': 7 }, // Ru: [Kr] 4d⁷ 5s¹
  45: { '5,0': 1, '4,2': 8 }, // Rh: [Kr] 4d⁸ 5s¹
  46: { '5,0': 0, '4,2': 10 }, // Pd: [Kr] 4d¹⁰
  47: { '5,0': 1, '4,2': 10 }, // Ag: [Kr] 4d¹⁰ 5s¹
  57: { '4,3': 0, '5,2': 1 }, // La: [Xe] 5d¹ 6s²
  58: { '4,3': 1, '5,2': 1 }, // Ce: [Xe] 4f¹ 5d¹ 6s²
  64: { '4,3': 7, '5,2': 1 }, // Gd: [Xe] 4f⁷ 5d¹ 6s²
  78: { '6,0': 1, '5,2': 9 }, // Pt: [Xe] 4f¹⁴ 5d⁹ 6s¹
  79: { '6,0': 1, '5,2': 10 }, // Au: [Xe] 4f¹⁴ 5d¹⁰ 6s¹
  89: { '5,3': 0, '6,2': 1 }, // Ac: [Rn] 6d¹ 7s²
  90: { '5,3': 0, '6,2': 2 }, // Th: [Rn] 6d² 7s²
  91: { '5,3': 2, '6,2': 1 }, // Pa: [Rn] 5f² 6d¹ 7s²
  92: { '5,3': 3, '6,2': 1 }, // U:  [Rn] 5f³ 6d¹ 7s²
  93: { '5,3': 4, '6,2': 1 }, // Np: [Rn] 5f⁴ 6d¹ 7s²
  96: { '5,3': 7, '6,2': 1 }, // Cm: [Rn] 5f⁷ 6d¹ 7s²
  103: { '6,2': 0, '7,1': 1 }, // Lr: [Rn] 5f¹⁴ 7s² 7p¹
};

export const esExcepcion = (z: number) => z in EXCEPCIONES;

/** Aplica cambios {"n,l": e} a una distribución, conservando el orden de Moeller. */
function aplicarCambios(base: Subnivel[], cambios: Readonly<Record<string, number>>): Subnivel[] {
  const mapa = new Map(base.map((s) => [clave(s.n, s.l), s.e]));
  for (const [k, e] of Object.entries(cambios)) mapa.set(k, e);
  return ORDEN_MOELLER.map(({ n, l }) => ({ n, l, e: mapa.get(clave(n, l)) ?? 0 })).filter((s) => s.e > 0);
}

/** Configuración real del átomo neutro en su estado fundamental (Moeller + excepciones). */
export function configuracionReal(z: number): Subnivel[] {
  const base = configuracionMoeller(z);
  const cambios = EXCEPCIONES[z];
  return cambios ? aplicarCambios(base, cambios) : base;
}

export const totalElectrones = (conf: Subnivel[]) => conf.reduce((s, x) => s + x.e, 0);

/** Ordena por nivel (n) y luego por subnivel (l): notación «por capas». */
export const ordenarPorNivel = (conf: Subnivel[]) => [...conf].sort((a, b) => a.n - b.n || a.l - b.l);

/** Ordena por energía relativa (orden de Moeller): notación usual en los textos preuniversitarios. */
export const ordenarPorEnergia = (conf: Subnivel[]) =>
  [...conf].sort((a, b) => energiaRelativa(a.n, a.l) - energiaRelativa(b.n, b.l) || a.n - b.n);

// ── Iones ───────────────────────────────────────────────────────────────────

/**
 * Configuración de un ion de carga `carga`.
 * - Catión: se retiran electrones del nivel más externo (mayor n) y, dentro de él, del subnivel de
 *   mayor l. Por eso Fe²⁺ es [Ar] 3d⁶ (pierde los 4s antes que los 3d).
 * - Anión: los electrones extra se agregan siguiendo la regla de Moeller.
 */
export function configuracionIon(z: number, carga: number): Subnivel[] {
  const electrones = z - carga;
  if (electrones < 0) throw new RangeError('La carga no puede superar el número de protones');
  if (carga === 0) return configuracionReal(z);
  if (carga < 0) return configuracionDesdeBase(configuracionReal(z), -carga);
  const conf = configuracionReal(z).map((s) => ({ ...s }));
  let quitar = carga;
  while (quitar > 0) {
    const candidato = conf
      .filter((s) => s.e > 0)
      .sort((a, b) => b.n - a.n || b.l - a.l)[0];
    if (!candidato) break;
    const q = Math.min(quitar, candidato.e);
    candidato.e -= q;
    quitar -= q;
  }
  return ordenarPorEnergia(conf.filter((s) => s.e > 0));
}

/** Agrega `extra` electrones a una configuración siguiendo el orden de Moeller. */
function configuracionDesdeBase(base: Subnivel[], extra: number): Subnivel[] {
  const mapa = new Map(base.map((s) => [clave(s.n, s.l), s.e]));
  let restantes = extra;
  for (const { n, l } of ORDEN_MOELLER) {
    if (restantes === 0) break;
    const k = clave(n, l);
    const libre = capacidadSubnivel(l) - (mapa.get(k) ?? 0);
    if (libre <= 0) continue;
    const e = Math.min(libre, restantes);
    mapa.set(k, (mapa.get(k) ?? 0) + e);
    restantes -= e;
  }
  return ORDEN_MOELLER.map(({ n, l }) => ({ n, l, e: mapa.get(clave(n, l)) ?? 0 })).filter((s) => s.e > 0);
}

// ── Notación ────────────────────────────────────────────────────────────────

const SUPER = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const superindice = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUPER[Number(d)])
    .join('');

const SIMBOLO_GAS_NOBLE: Record<number, string> = { 2: 'He', 10: 'Ne', 18: 'Ar', 36: 'Kr', 54: 'Xe', 86: 'Rn' };

export type EstiloNotacion = 'texto' | 'unicode' | 'latex';

function formatearSubnivel(s: Subnivel, estilo: EstiloNotacion) {
  const nombre = nombreSubnivel(s.n, s.l);
  if (estilo === 'unicode') return `${nombre}${superindice(s.e)}`;
  if (estilo === 'latex') return `${nombre}^{${s.e}}`;
  return `${nombre}${s.e}`;
}

/** "1s2 2s2 2p6 …" (o con superíndices / LaTeX). */
export function formatearConfiguracion(conf: Subnivel[], estilo: EstiloNotacion = 'unicode'): string {
  return conf.map((s) => formatearSubnivel(s, estilo)).join(estilo === 'latex' ? '\\,' : ' ');
}

/**
 * Notación de Kernel (gas noble): [Ar] 4s² 3d⁶.
 * El kernel es el gas noble anterior cuyos subniveles están todos llenos en la configuración.
 */
export function notacionKernel(
  conf: Subnivel[],
  estilo: EstiloNotacion = 'unicode',
): { kernel: string | null; resto: Subnivel[]; texto: string } {
  const total = totalElectrones(conf);
  const mapa = new Map(conf.map((s) => [clave(s.n, s.l), s.e]));
  let kernelZ: number | null = null;
  for (const g of [...Z_GASES_NOBLES].reverse()) {
    if (g >= total || g === 118) continue;
    const nucleo = configuracionMoeller(g);
    if (nucleo.every((s) => mapa.get(clave(s.n, s.l)) === s.e)) {
      kernelZ = g;
      break;
    }
  }
  if (kernelZ === null) return { kernel: null, resto: conf, texto: formatearConfiguracion(conf, estilo) };
  const nucleo = new Set(configuracionMoeller(kernelZ).map((s) => clave(s.n, s.l)));
  const resto = conf.filter((s) => !nucleo.has(clave(s.n, s.l)));
  const kernel = `[${SIMBOLO_GAS_NOBLE[kernelZ]}]`;
  return {
    kernel,
    resto,
    texto: `${estilo === 'latex' ? `\\text{${kernel}}` : kernel}${estilo === 'latex' ? '\\,' : ' '}${formatearConfiguracion(resto, estilo)}`,
  };
}

/** Interpreta "[Ar]4s2 3d6", "1s2 2s2 2p6" (ignora anotaciones como "(predicted)"). */
export function parsearConfiguracion(texto: string): Subnivel[] {
  const limpio = texto.replace(/\(.*?\)/g, '').trim();
  const base: Subnivel[] = [];
  const kernel = limpio.match(/^\[([A-Z][a-z]?)\]/);
  if (kernel) {
    const z = Object.entries(SIMBOLO_GAS_NOBLE).find(([, s]) => s === kernel[1])?.[0];
    if (!z) throw new Error(`Kernel desconocido: ${kernel[0]}`);
    base.push(...configuracionMoeller(Number(z)));
  }
  const resto = kernel ? limpio.slice(kernel[0].length) : limpio;
  for (const m of resto.matchAll(/(\d)([spdf])(\d+)/g)) {
    base.push({ n: Number(m[1]), l: LETRAS_L.indexOf(m[2] as 's'), e: Number(m[3]) });
  }
  return ordenarPorEnergia(base);
}

/** Compara dos configuraciones sin importar el orden de escritura. */
export function mismasConfiguraciones(a: Subnivel[], b: Subnivel[]): boolean {
  const f = (c: Subnivel[]) =>
    ordenarPorNivel(c.filter((s) => s.e > 0))
      .map((s) => `${s.n}${s.l}:${s.e}`)
      .join(' ');
  return f(a) === f(b);
}

// ── Análisis de la configuración ────────────────────────────────────────────

/** Electrones por nivel (capas K, L, M, N…), útil para el modelo de Bohr. */
export function electronesPorNivel(conf: Subnivel[]): number[] {
  const niveles: number[] = [];
  for (const s of conf) niveles[s.n - 1] = (niveles[s.n - 1] ?? 0) + s.e;
  return Array.from(niveles, (x) => x ?? 0);
}

export const LETRAS_CAPA = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const;

/** Electrones desapareados (regla de Hund): por subnivel, min(e, 2(2l+1) − e). */
export function electronesDesapareados(conf: Subnivel[]): number {
  return conf.reduce((suma, s) => suma + Math.min(s.e, capacidadSubnivel(s.l) - s.e), 0);
}

/** Paramagnético si tiene electrones desapareados; diamagnético si todos están apareados. */
export const esParamagnetico = (conf: Subnivel[]) => electronesDesapareados(conf) > 0;

/** Bloque: subnivel del electrón diferenciador (el último según Moeller). */
export function bloque(z: number): Bloque {
  const ultimo = configuracionMoeller(z).at(-1)!;
  return LETRAS_L[ultimo.l] as Bloque;
}

/**
 * Electrones de valencia:
 *  - bloques s y p: electrones del nivel más externo (ns + np);
 *  - bloque d: ns + (n−1)d;
 *  - bloque f: se reporta ns + (n−2)f + (n−1)d.
 */
export function electronesValencia(z: number): number {
  const conf = configuracionReal(z);
  const nMax = Math.max(...conf.map((s) => s.n));
  const b = bloque(z);
  return conf
    .filter((s) => {
      if (s.n === nMax) return true;
      if (b === 'd' || b === 'f') return (s.n === nMax - 1 && s.l === 2) || (b === 'f' && s.n === nMax - 2 && s.l === 3);
      return false;
    })
    .reduce((a, s) => a + s.e, 0);
}

// ── Diagrama de orbitales y números cuánticos ───────────────────────────────

/** Valor del spin del primer electrón de cada orbital (convención). */
export type ConvencionSpin = 'arriba+' | 'arriba-';

export interface Orbital {
  m: number;
  /** Spines presentes: '↑' y/o '↓' en orden de llegada. */
  electrones: ('↑' | '↓')[];
}

/**
 * Llenado de un subnivel con la regla de Hund. Los orbitales se ordenan de m = −l a m = +l
 * (izquierda a derecha) y se llenan primero todos con ↑ y luego con ↓.
 */
export function diagramaSubnivel(l: number, e: number): Orbital[] {
  const orbitales: Orbital[] = Array.from({ length: 2 * l + 1 }, (_, i) => ({ m: i - l, electrones: [] }));
  for (let i = 0; i < e; i++) orbitales[i % (2 * l + 1)]!.electrones.push(i < 2 * l + 1 ? '↑' : '↓');
  return orbitales;
}

export interface NumerosCuanticos {
  n: number;
  l: number;
  ml: number;
  ms: 0.5 | -0.5;
}

/**
 * Números cuánticos de un electrón concreto: el k-ésimo (1-indexado) en entrar a un subnivel
 * con la regla de Hund. Convención por defecto: ↑ = +1/2 (primer electrón de cada orbital).
 */
export function numerosCuanticosEnSubnivel(
  n: number,
  l: number,
  k: number,
  convencion: ConvencionSpin = 'arriba+',
): NumerosCuanticos {
  const orbitales = 2 * l + 1;
  const arriba = k <= orbitales;
  const ml = -l + ((k - 1) % orbitales);
  const signoArriba = convencion === 'arriba+' ? 0.5 : -0.5;
  return { n, l, ml, ms: (arriba ? signoArriba : -signoArriba) as 0.5 | -0.5 };
}

/**
 * Números cuánticos del electrón diferenciador (el último en ubicarse según Moeller).
 * Es la pregunta típica de admisión. Por defecto usa la regla de Moeller pura, como en esos
 * exámenes; con `usarExcepciones` usa la configuración real (Cr, Cu…).
 */
export function numerosCuanticosUltimoElectron(
  z: number,
  { usarExcepciones = false, convencion = 'arriba+' as ConvencionSpin } = {},
): NumerosCuanticos {
  const conf = usarExcepciones ? configuracionReal(z) : configuracionMoeller(z);
  const ultimo = conf.at(-1)!;
  return numerosCuanticosEnSubnivel(ultimo.n, ultimo.l, ultimo.e, convencion);
}

/** Valida una combinación (n, l, mₗ, mₛ) y explica el motivo si no es válida. */
export function validarNumerosCuanticos(n: number, l: number, ml: number, ms: number): { valido: boolean; motivo?: string } {
  if (!Number.isInteger(n) || n < 1) return { valido: false, motivo: 'n debe ser un entero positivo (1, 2, 3, …).' };
  if (!Number.isInteger(l) || l < 0 || l > n - 1) return { valido: false, motivo: `l debe ir de 0 a n − 1 = ${n - 1}.` };
  if (!Number.isInteger(ml) || Math.abs(ml) > l) return { valido: false, motivo: `mₗ debe ir de −l a +l (−${l} … +${l}).` };
  if (ms !== 0.5 && ms !== -0.5) return { valido: false, motivo: 'mₛ solo puede valer +1/2 o −1/2.' };
  return { valido: true };
}

/** Configuración real de un elemento con su nombre, para presentar en la interfaz. */
export function resumenConfiguracion(z: number, carga = 0) {
  const el = elementoPorZ(z);
  const conf = carga === 0 ? configuracionReal(z) : configuracionIon(z, carga);
  return {
    elemento: el,
    carga,
    configuracion: conf,
    moeller: carga === 0 ? configuracionMoeller(z) : configuracionMoeller(z - carga),
    esExcepcion: carga === 0 && esExcepcion(z),
    kernel: notacionKernel(conf),
    desapareados: electronesDesapareados(conf),
    porNivel: electronesPorNivel(conf),
  };
}
