/**
 * Nomenclatura inorgánica: tradicional, Stock y sistemática (convenciones de los textos peruanos).
 *
 * Se genera el conjunto de compuestos a partir de las tablas de valencias (estados de oxidación) y
 * reglas de formación de cada función química:
 *   óxido básico   = metal + O          · hidróxido = óxido básico + H₂O        → M(OH)ᵥ
 *   anhídrido      = no metal + O       · oxácido   = anhídrido + H₂O           → HₐEOᵦ
 *   hidruro        = metal + H          · hidrácido = H + (F, Cl, Br, I, S, Se, Te)
 *   sal            = ácido + hidróxido (los H del ácido se reemplazan por el metal)
 * Fórmula de un compuesto iónico: se «cruzan» las cargas y se simplifica:  Mᵃ⁺ + Xᵇ⁻ → M_b X_a.
 *
 * Convenciones elegidas (varían entre textos):
 *  - Stock con número romano pegado al nombre: «óxido de hierro(III)» (se acepta también con espacio).
 *  - Oxácidos: sistemática «tetraoxosulfato(VI) de hidrógeno»; Stock «ácido tetraoxosulfúrico(VI)».
 *  - Oxisales: sistemática «tetraoxosulfato(VI) de hierro(III)».
 */
import { elementoPorSimbolo } from '../elements';
import { formulaHill, parsearFormula } from '../formula';

export type Funcion =
  | 'oxido-basico'
  | 'oxido-acido'
  | 'oxido-neutro'
  | 'peroxido'
  | 'hidruro-metalico'
  | 'hidruro-especial'
  | 'hidracido'
  | 'hidroxido'
  | 'oxacido'
  | 'sal-haloidea'
  | 'oxisal'
  | 'sal-acida'
  | 'sal-basica'
  | 'sal-doble'
  | 'cation'
  | 'anion';

export const NOMBRE_FUNCION: Record<Funcion, string> = {
  'oxido-basico': 'Óxido básico',
  'oxido-acido': 'Óxido ácido (anhídrido)',
  'oxido-neutro': 'Óxido neutro',
  peroxido: 'Peróxido',
  'hidruro-metalico': 'Hidruro metálico',
  'hidruro-especial': 'Hidruro no metálico (nombre especial)',
  hidracido: 'Ácido hidrácido',
  hidroxido: 'Hidróxido (base)',
  oxacido: 'Ácido oxácido',
  'sal-haloidea': 'Sal haloidea',
  oxisal: 'Oxisal',
  'sal-acida': 'Sal ácida',
  'sal-basica': 'Sal básica',
  'sal-doble': 'Sal doble',
  cation: 'Catión',
  anion: 'Anión',
};

export interface Nombres {
  tradicional: string;
  stock: string | null;
  sistematica: string | null;
}

export interface Compuesto {
  /** Fórmula escrita (catión primero): Fe2(SO4)3, NaHCO3, SO4^2-. */
  formula: string;
  funcion: Funcion;
  nombres: Nombres;
  alias: string[];
  /** Estado de oxidación del elemento característico (metal o no metal central). */
  estados: Record<string, number>;
  /** Explicación de cómo se forma. */
  formacion: string;
}

// ── Utilidades ──────────────────────────────────────────────────────────────

const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
export const romano = (n: number) => ROMANOS[n] ?? String(n);
const PREFIJOS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
export const prefijo = (n: number) => PREFIJOS[n] ?? `${n}-`;
/** «óxido» con prefijo: monóxido, dióxido, trióxido, tetróxido, pentóxido, hexóxido, heptóxido. */
const oxidoConPrefijo = (n: number) => (n === 2 ? 'dióxido' : n === 3 ? 'trióxido' : n === 1 ? 'monóxido' : `${prefijo(n).replace(/a$/, '')}óxido`);
/** Prefijo de los oxígenos en la sistemática: monoxo, dioxo, trioxo, tetraoxo… */
const prefOxo = (n: number) => (n === 1 ? 'monoxo' : `${prefijo(n)}oxo`);
const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : Math.abs(a));
const sub = (n: number) => (n > 1 ? String(n) : '');
const nombreEl = (s: string) => elementoPorSimbolo(s)!.nombre.toLowerCase();
const SUB_U = '₀₁₂₃₄₅₆₇₈₉', SUP_U = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Ion en texto Unicode: («SO4», 2, '−') → SO₄²⁻ */
const ionTexto = (grupo: string, carga: number, signo: '+' | '−') =>
  `${grupo.replace(/d/g, (d) => SUB_U[Number(d)]!)}${carga > 1 ? String(carga).replace(/d/g, (d) => SUP_U[Number(d)]!) : ''}${signo === '+' ? '⁺' : '⁻'}`;

/** Normaliza un nombre para buscarlo: minúsculas, sin tildes, espacios simples, «(III)» pegado. */
export function normalizarNombre(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .replace(/\(ac\)|\(aq\)/g, '')
    .trim();
}

// ── Tablas de valencias ─────────────────────────────────────────────────────

interface Metal {
  s: string;
  v: number[];
  /** Adjetivos tradicionales [‑oso, ‑ico] para metales con dos valencias. */
  adj?: [string, string];
}

/** Metales y sus estados de oxidación usuales en nomenclatura (textos preuniversitarios). */
export const METALES: Metal[] = [
  ...['Li', 'Na', 'K', 'Rb', 'Cs', 'Ag'].map((s) => ({ s, v: [1] })),
  ...['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Zn', 'Cd'].map((s) => ({ s, v: [2] })),
  { s: 'Al', v: [3] },
  { s: 'Cu', v: [1, 2], adj: ['cuproso', 'cúprico'] },
  { s: 'Hg', v: [1, 2], adj: ['mercurioso', 'mercúrico'] },
  { s: 'Au', v: [1, 3], adj: ['auroso', 'áurico'] },
  { s: 'Fe', v: [2, 3], adj: ['ferroso', 'férrico'] },
  { s: 'Co', v: [2, 3], adj: ['cobaltoso', 'cobáltico'] },
  { s: 'Ni', v: [2, 3], adj: ['niqueloso', 'niquélico'] },
  { s: 'Cr', v: [2, 3], adj: ['cromoso', 'crómico'] },
  { s: 'Mn', v: [2, 3], adj: ['manganoso', 'mangánico'] },
  { s: 'Sn', v: [2, 4], adj: ['estannoso', 'estánnico'] },
  { s: 'Pb', v: [2, 4], adj: ['plumboso', 'plúmbico'] },
  { s: 'Pt', v: [2, 4], adj: ['platinoso', 'platínico'] },
];

interface NoMetal {
  s: string;
  /** EO → nombre tradicional del anhídrido/oxácido (sin «ácido»/«anhídrido»). */
  eo: Record<number, string>;
  /** Raíz para el anión y la sistemática (sulf‑ato, nitr‑ato…). */
  raiz: string;
  /** Elementos con forma «orto» por defecto (3 H₂O): P, As, Sb, B. */
  orto?: boolean;
}

export const NO_METALES: NoMetal[] = [
  { s: 'B', eo: { 3: 'bórico' }, raiz: 'bor', orto: true },
  { s: 'C', eo: { 4: 'carbónico' }, raiz: 'carbon' },
  { s: 'Si', eo: { 4: 'silícico' }, raiz: 'silic' },
  { s: 'N', eo: { 3: 'nitroso', 5: 'nítrico' }, raiz: 'nitr' },
  { s: 'P', eo: { 1: 'hipofosforoso', 3: 'fosforoso', 5: 'fosfórico' }, raiz: 'fosf', orto: true },
  { s: 'As', eo: { 3: 'arsenioso', 5: 'arsénico' }, raiz: 'arseni', orto: true },
  { s: 'Sb', eo: { 3: 'antimonioso', 5: 'antimónico' }, raiz: 'antimoni', orto: true },
  { s: 'S', eo: { 2: 'hiposulfuroso', 4: 'sulfuroso', 6: 'sulfúrico' }, raiz: 'sulf' },
  { s: 'Se', eo: { 4: 'selenioso', 6: 'selénico' }, raiz: 'selen' },
  { s: 'Te', eo: { 4: 'teluroso', 6: 'telúrico' }, raiz: 'telur' },
  { s: 'Cl', eo: { 1: 'hipocloroso', 3: 'cloroso', 5: 'clórico', 7: 'perclórico' }, raiz: 'clor' },
  { s: 'Br', eo: { 1: 'hipobromoso', 3: 'bromoso', 5: 'brómico', 7: 'perbrómico' }, raiz: 'brom' },
  { s: 'I', eo: { 1: 'hipoyodoso', 3: 'yodoso', 5: 'yódico', 7: 'peryódico' }, raiz: 'yod' },
  { s: 'Mn', eo: { 4: 'manganoso', 6: 'mangánico', 7: 'permangánico' }, raiz: 'mangan' },
  { s: 'Cr', eo: { 6: 'crómico' }, raiz: 'crom' },
];

/** Aniones de los hidrácidos: [elemento, carga, ácido, anión]. */
const HALUROS: [string, number, string, string][] = [
  ['F', 1, 'fluorhídrico', 'fluoruro'],
  ['Cl', 1, 'clorhídrico', 'cloruro'],
  ['Br', 1, 'bromhídrico', 'bromuro'],
  ['I', 1, 'yodhídrico', 'yoduro'],
  ['S', 2, 'sulfhídrico', 'sulfuro'],
  ['Se', 2, 'selenhídrico', 'seleniuro'],
  ['Te', 2, 'telurhídrico', 'telururo'],
];

// ── Aniones ─────────────────────────────────────────────────────────────────

interface Anion {
  /** Fórmula del anión sin carga (SO4, Cl, HCO3). */
  grupo: string;
  carga: number;
  tradicional: string;
  stock: string;
  sistematica: string;
  alias: string[];
  /** Ácido del que proviene (para la explicación). */
  acido: string;
  /** Elemento central y su EO. */
  central: string;
  eoCentral: number;
  acida: boolean;
  monoatomico: boolean;
}

/** Nombre del anión: ‑oso → ‑ito, ‑ico → ‑ato (sulfúrico → sulfato, fosforoso → fosfito: raíces irregulares). */
const oxidoDe = (tradicional: string) =>
  tradicional
    .replace(/oso$/, 'ito')
    .replace(/ico$/, 'ato')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/sulfur(?=ato|ito)/, 'sulf')
    .replace(/fosfor(?=ato|ito)/, 'fosf');

/** Ácidos oxácidos: fórmula, nombres y anión correspondiente. */
interface Oxacido {
  formula: string;
  h: number;
  central: string;
  nCentral: number;
  o: number;
  eo: number;
  tradicional: string;
  prefijoForma: '' | 'meta' | 'piro' | 'orto' | 'di';
  raiz: string;
  adjetivoStock: string;
}

function generarOxacidos(): Oxacido[] {
  const lista: Oxacido[] = [];
  for (const nm of NO_METALES) {
    for (const [eoTxt, nombre] of Object.entries(nm.eo)) {
      const v = Number(eoTxt);
      const adjetivoStock = (nm.eo[Math.max(...Object.keys(nm.eo).map(Number))] ?? nombre).replace(/^(hipo|per)/, '');
      const formas: { h: number; n: number; o: number; pref: Oxacido['prefijoForma'] }[] = [];
      // Anhídrido + 1 H₂O: EO impar → HEO_{(v+1)/2}; EO par → H₂EO_{(v+2)/2}
      const normal = v % 2 ? { h: 1, n: 1, o: (v + 1) / 2 } : { h: 2, n: 1, o: (v + 2) / 2 };
      if (nm.orto) {
        // P, As, Sb, B: la forma usual es «orto» (anhídrido + 3 H₂O): H₃EO_{(v+3)/2}
        formas.push({ h: 3, n: 1, o: (v + 3) / 2, pref: '' });
        if (v === 5 || nm.s === 'B') formas.push({ ...normal, pref: 'meta' });
        if (v === 5) formas.push({ h: 4, n: 2, o: v + 2, pref: 'piro' }); // 1 anhídrido + 2 H₂O
      } else if (nm.s === 'Si') {
        formas.push({ ...normal, pref: 'meta' }, { h: 4, n: 1, o: 4, pref: 'orto' });
      } else {
        formas.push({ ...normal, pref: '' });
        if (nm.s === 'Cr') formas.push({ h: 2, n: 2, o: 7, pref: 'di' }); // ácido dicrómico H₂Cr₂O₇
      }
      for (const f of formas) {
        const formula = `H${sub(f.h)}${nm.s}${sub(f.n)}O${sub(f.o)}`;
        lista.push({
          formula,
          h: f.h,
          central: nm.s,
          nCentral: f.n,
          o: f.o,
          eo: v,
          tradicional: `${f.pref}${nombre}`,
          prefijoForma: f.pref,
          raiz: nm.raiz,
          adjetivoStock,
        });
      }
    }
  }
  return lista;
}

/** Anión de un oxácido que pierde k H (k = todos → neutro; menos → anión ácido). */
function anionDeOxacido(a: Oxacido, perdidos: number): Anion {
  const restantes = a.h - perdidos;
  const baseTrad = oxidoDe(a.tradicional);
  const acidoBase = `${a.central}${sub(a.nCentral)}O${sub(a.o)}`;
  const grupo = `${restantes ? `H${sub(restantes)}` : ''}${acidoBase}`;
  const sistBase = `${prefOxo(a.o)}${a.nCentral > 1 ? prefijo(a.nCentral) : ''}${a.raiz}ato(${romano(a.eo)})`;
  // Nombres de los aniones ácidos: bi‑ (un H restante de un diprótico), mono/diácido (fosfatos)
  let tradicional = baseTrad;
  const alias: string[] = [];
  let stock = baseTrad;
  if (restantes > 0) {
    if (a.h === 2) {
      tradicional = `bi${baseTrad}`;
      alias.push(`${baseTrad} ácido`);
    } else {
      tradicional = `${baseTrad} ${restantes === 1 ? 'monoácido' : 'diácido'}`;
      alias.push(`${baseTrad} ${restantes === 1 ? 'ácido' : 'diácido'}`);
    }
    stock = `${restantes === 1 ? '' : prefijo(restantes)}hidrogeno${baseTrad}`;
  }
  return {
    grupo,
    carga: perdidos,
    tradicional,
    stock,
    sistematica: `${restantes ? `${restantes === 1 ? '' : prefijo(restantes)}hidrogeno` : ''}${sistBase}`,
    alias,
    acido: a.formula,
    central: a.central,
    eoCentral: a.eo,
    acida: restantes > 0,
    monoatomico: false,
  };
}

// ── Generación del catálogo de compuestos ───────────────────────────────────

interface Cation {
  grupo: string;
  nAtomos: number;
  carga: number;
  metal: string;
  eo: number;
  tradicional: string;
  stock: string;
  /** Para la sistemática: nombre del metal. */
  nombreMetal: string;
  variable: boolean;
}

function cationes(): Cation[] {
  const res: Cation[] = [];
  for (const m of METALES) {
    m.v.forEach((v, k) => {
      const nombre = nombreEl(m.s);
      const variable = m.v.length > 1;
      // Hg(I) existe como el ion dímero Hg₂²⁺
      const dimero = m.s === 'Hg' && v === 1;
      res.push({
        grupo: dimero ? 'Hg2' : m.s,
        nAtomos: dimero ? 2 : 1,
        carga: dimero ? 2 : v,
        metal: m.s,
        eo: v,
        tradicional: variable ? m.adj![k]! : `de ${nombre}`,
        stock: variable ? `de ${nombre}(${romano(v)})` : `de ${nombre}`,
        nombreMetal: nombre,
        variable,
      });
    });
  }
  return res;
}

/** Une catión y anión cruzando cargas: Mᵃ⁺ + Xᵇ⁻ → M_b X_a (simplificado). */
function cruzar(c: Cation, grupoAnion: string, cargaAnion: number, poliatomico: boolean) {
  const g = mcd(c.carga, cargaAnion);
  const nC = cargaAnion / g, nA = c.carga / g;
  // Cationes poliatómicos (NH₄⁺, Hg₂²⁺) van entre paréntesis si se repiten: (NH4)2SO4
  const poliCation = c.grupo === 'Hg2' || c.grupo === 'NH4';
  const parteC = poliCation && nC > 1 ? `(${c.grupo})${nC}` : `${c.grupo}${sub(nC)}`;
  const parteA = nA > 1 && poliatomico ? `(${grupoAnion})${nA}` : `${grupoAnion}${nA > 1 ? nA : ''}`;
  return { formula: `${parteC}${parteA}`, nC, nA };
}

let CACHE: Compuesto[] | null = null;

/** Todos los compuestos que genera el sistema (se calcula una vez). */
export function catalogoNomenclatura(): Compuesto[] {
  if (CACHE) return CACHE;
  const lista: Compuesto[] = [];
  const agregar = (c: Compuesto) => lista.push(c);
  const cats = cationes();

  // Óxidos básicos y peróxidos, hidróxidos, hidruros
  for (const c of cats) {
    const { formula, nC, nA } = cruzar(c, 'O', 2, false);
    const nM = c.grupo === 'Hg2' ? 2 * nC : nC;
    const f = c.grupo === 'Hg2' ? 'Hg2O' : formula;
    agregar({
      formula: f,
      funcion: 'oxido-basico',
      nombres: {
        tradicional: `óxido ${c.tradicional}`,
        stock: `óxido ${c.stock}`,
        sistematica: `${oxidoConPrefijo(nA)} de ${nM > 1 ? prefijo(nM) : ''}${c.nombreMetal}`,
      },
      alias: [],
      estados: { [c.metal]: c.eo, O: -2 },
      formacion: `Metal + oxígeno: ${c.metal}${romano(c.eo) ? `(${c.eo > 0 ? '+' : ''}${c.eo})` : ''} con O²⁻ → se cruzan las valencias.`,
    });
    if (c.grupo !== 'Hg2') {
      agregar({
        formula: c.carga > 1 ? `${c.grupo}(OH)${c.carga}` : `${c.grupo}OH`,
        funcion: 'hidroxido',
        nombres: {
          tradicional: `hidróxido ${c.tradicional}`,
          stock: `hidróxido ${c.stock}`,
          sistematica: `${c.carga > 1 ? prefijo(c.carga) : ''}hidróxido de ${c.nombreMetal}`,
        },
        alias: [],
        estados: { [c.metal]: c.eo },
        formacion: `Óxido básico + agua: el metal (${c.eo > 0 ? '+' : ''}${c.eo}) se une a ${c.carga} grupo(s) OH⁻.`,
      });
      agregar({
        formula: `${c.grupo}H${sub(c.carga)}`,
        funcion: 'hidruro-metalico',
        nombres: {
          tradicional: `hidruro ${c.tradicional}`,
          stock: `hidruro ${c.stock}`,
          sistematica: `${c.carga > 1 ? prefijo(c.carga) : ''}hidruro de ${c.nombreMetal}`,
        },
        alias: [],
        estados: { [c.metal]: c.eo, H: -1 },
        formacion: `Metal + hidrógeno: el H actúa con −1 (ion hidruro H⁻).`,
      });
    }
    // Peróxidos de los grupos 1 y 2, Zn y Cu(II)
    if ((c.eo === 1 && !c.variable && c.metal !== 'Ag') || (c.eo === 2 && !c.variable) || (c.metal === 'Cu' && c.eo === 2)) {
      const pf = c.eo === 1 ? `${c.metal}2O2` : `${c.metal}O2`;
      agregar({
        formula: pf,
        funcion: 'peroxido',
        nombres: {
          tradicional: `peróxido ${c.tradicional}`,
          stock: `peróxido ${c.stock}`,
          sistematica: `dióxido de ${c.eo === 1 ? 'di' : ''}${c.nombreMetal}`,
        },
        alias: [],
        estados: { [c.metal]: c.eo, O: -1 },
        formacion: 'Óxido + un oxígeno más: grupo peróxido O₂²⁻ (cada O con −1).',
      });
    }
  }
  agregar({
    formula: 'H2O2',
    funcion: 'peroxido',
    nombres: { tradicional: 'peróxido de hidrógeno', stock: null, sistematica: 'dióxido de dihidrógeno' },
    alias: ['agua oxigenada'],
    estados: { H: 1, O: -1 },
    formacion: 'Grupo peróxido O₂²⁻ con dos H⁺.',
  });

  // Anhídridos y óxidos de no metales
  const ANHIDRIDOS_EXTRA: [string, number, string][] = [
    ['N', 1, 'hiponitroso'],
    ['C', 2, 'carbonoso'],
  ];
  const oxidosNoMetal = new Map<string, { s: string; v: number; trad: string | null }>();
  for (const nm of NO_METALES) for (const [v, n] of Object.entries(nm.eo)) oxidosNoMetal.set(`${nm.s}${v}`, { s: nm.s, v: Number(v), trad: n });
  for (const [s, v, n] of ANHIDRIDOS_EXTRA) oxidosNoMetal.set(`${s}${v}`, { s, v, trad: n });
  for (const [s, v] of [['N', 2], ['N', 4]] as const) oxidosNoMetal.set(`${s}${v}`, { s, v, trad: null });
  for (const { s, v, trad } of oxidosNoMetal.values()) {
    const g = mcd(v, 2);
    const nE = 2 / g, nO = v / g;
    const formula = `${s}${sub(nE)}O${sub(nO)}`;
    const variable = Object.keys(NO_METALES.find((x) => x.s === s)?.eo ?? {}).length + (s === 'N' || s === 'C' ? 2 : 0) > 1;
    const esMetalTransicion = s === 'Mn' || s === 'Cr';
    const neutro = trad === null;
    const especial: Record<string, [string, string[]]> = {
      N2O: ['óxido nitroso', ['anhídrido hiponitroso']],
      NO: ['óxido nítrico', []],
      CO: ['anhídrido carbonoso', ['monóxido de carbono']],
    };
    const sistNeutro = `${oxidoConPrefijo(nO)} de ${nE > 1 ? prefijo(nE) : ''}${nombreEl(s)}`;
    const [tradicional, alias] = especial[formula] ?? [neutro ? sistNeutro : `anhídrido ${trad}`, []];
    agregar({
      formula,
      funcion: neutro || formula === 'N2O' || formula === 'NO' ? 'oxido-neutro' : 'oxido-acido',
      nombres: {
        tradicional,
        stock: `óxido de ${nombreEl(s)}${variable || esMetalTransicion ? `(${romano(v)})` : ''}`,
        sistematica: `${oxidoConPrefijo(nO)} de ${nE > 1 ? prefijo(nE) : ''}${nombreEl(s)}`,
      },
      alias: formula === 'N2O' ? ['anhídrido hiponitroso'] : alias,
      estados: { [s]: v, O: -2 },
      formacion: `No metal + oxígeno: ${s} con EO +${v} y O²⁻ → ${formula}.`,
    });
  }

  // Hidruros especiales
  const ESPECIALES: [string, string, string, string[]][] = [
    ['BH3', 'borano', 'trihidruro de boro', []],
    ['CH4', 'metano', 'tetrahidruro de carbono', []],
    ['SiH4', 'silano', 'tetrahidruro de silicio', []],
    ['NH3', 'amoníaco', 'trihidruro de nitrógeno', ['azano', 'amoniaco']],
    ['PH3', 'fosfina', 'trihidruro de fósforo', ['fosfano']],
    ['AsH3', 'arsina', 'trihidruro de arsénico', ['arsano']],
    ['SbH3', 'estibina', 'trihidruro de antimonio', ['estibano']],
    ['H2O', 'agua', 'óxido de dihidrógeno', ['monóxido de dihidrógeno']],
  ];
  for (const [f, t, s, a] of ESPECIALES) {
    agregar({ formula: f, funcion: 'hidruro-especial', nombres: { tradicional: t, stock: null, sistematica: s }, alias: a, estados: {}, formacion: 'Hidruro de no metal de los grupos 13 a 15 (nombre especial).' });
  }

  // Hidrácidos y aniones haloideos
  const aniones: Anion[] = [];
  for (const [s, q, acido, anion] of HALUROS) {
    const formula = `H${sub(q)}${s}`;
    agregar({
      formula,
      funcion: 'hidracido',
      nombres: { tradicional: `ácido ${acido}`, stock: null, sistematica: `${anion} de hidrógeno` },
      alias: q > 1 ? [`${anion} de dihidrógeno`] : [],
      estados: { H: 1, [s]: -q },
      formacion: `H + no metal del grupo ${q === 1 ? '17' : '16'} (EO −${q}). En disolución acuosa es un ácido.`,
    });
    aniones.push({ grupo: s, carga: q, tradicional: anion, stock: anion, sistematica: anion, alias: [], acido: formula, central: s, eoCentral: -q, acida: false, monoatomico: true });
    if (q === 2) {
      aniones.push({ grupo: `H${s}`, carga: 1, tradicional: `bi${anion}`, stock: `hidrogeno${anion}`, sistematica: `hidrogeno${anion}`, alias: [`${anion} ácido`], acido: formula, central: s, eoCentral: -q, acida: true, monoatomico: false });
    }
  }
  aniones.push({ grupo: 'CN', carga: 1, tradicional: 'cianuro', stock: 'cianuro', sistematica: 'cianuro', alias: [], acido: 'HCN', central: 'C', eoCentral: 2, acida: false, monoatomico: false });
  agregar({ formula: 'HCN', funcion: 'hidracido', nombres: { tradicional: 'ácido cianhídrico', stock: null, sistematica: 'cianuro de hidrógeno' }, alias: [], estados: { H: 1 }, formacion: 'Ácido del ion cianuro CN⁻.' });

  // Oxácidos y sus aniones
  for (const a of generarOxacidos()) {
    const adj = a.adjetivoStock.replace(/oso$/, 'ico');
    agregar({
      formula: a.formula,
      funcion: 'oxacido',
      nombres: {
        tradicional: `ácido ${a.tradicional}`,
        stock: `ácido ${prefOxo(a.o)}${a.nCentral > 1 ? prefijo(a.nCentral) : ''}${adj}(${romano(a.eo)})`,
        sistematica: `${prefOxo(a.o)}${a.nCentral > 1 ? prefijo(a.nCentral) : ''}${a.raiz}ato(${romano(a.eo)}) de hidrógeno`,
      },
      alias: a.prefijoForma === '' && NO_METALES.find((n) => n.s === a.central)?.orto ? [`ácido orto${a.tradicional}`] : a.prefijoForma === 'orto' ? [`ácido ${a.tradicional.replace(/^orto/, '')}`] : [],
      estados: { H: 1, [a.central]: a.eo, O: -2 },
      formacion: `Anhídrido + agua (${a.prefijoForma === 'piro' ? '1 anhídrido + 2 H₂O' : a.prefijoForma === 'orto' || (a.prefijoForma === '' && NO_METALES.find((n) => n.s === a.central)?.orto) ? 'forma orto: anhídrido + 3 H₂O' : a.prefijoForma === 'di' ? '2 anhídridos + 1 H₂O' : '1 anhídrido + 1 H₂O'}): ${a.central} con EO +${a.eo}.`,
    });
    // H₃PO₂ (monoprótico) y H₃PO₃ (diprótico) tienen H unidos al P: no forman «PO₂³⁻» ni «PO₃³⁻»
    if (a.central === 'P' && a.eo < 5) continue;
    aniones.push(anionDeOxacido(a, a.h));
    // Aniones ácidos usuales: bisulfato, bisulfito, bicarbonato, fosfatos ácidos
    const conAcidas = (a.central === 'S' || a.central === 'C' || (a.central === 'P' && a.eo === 5)) && a.prefijoForma === '';
    if (conAcidas) for (let k = 1; k < a.h; k++) aniones.push(anionDeOxacido(a, k));
  }

  // Aniones y cationes como especies
  for (const an of aniones) {
    agregar({
      formula: `${an.grupo}^${an.carga > 1 ? an.carga : ''}-`,
      funcion: 'anion',
      nombres: { tradicional: `ion ${an.tradicional}`, stock: `ion ${an.stock}`, sistematica: `ion ${an.sistematica}` },
      alias: an.alias.map((x) => `ion ${x}`),
      estados: { [an.central]: an.eoCentral },
      formacion: `Proviene del ácido ${an.acido} al perder ${an.carga} H⁺.`,
    });
  }
  for (const c of cats) {
    agregar({
      formula: `${c.grupo}^${c.carga > 1 ? c.carga : ''}+`,
      funcion: 'cation',
      nombres: { tradicional: c.variable ? `ion ${c.tradicional}` : `ion ${c.nombreMetal}`, stock: `ion ${c.stock.replace(/^de /, '')}`, sistematica: null },
      alias: [],
      estados: { [c.metal]: c.eo },
      formacion: `El ${c.nombreMetal} pierde ${c.eo} electrón(es)${c.grupo === 'Hg2' ? ' (el Hg(I) forma el ion dímero Hg₂²⁺)' : ''}.`,
    });
  }
  agregar({ formula: 'NH4^+', funcion: 'cation', nombres: { tradicional: 'ion amonio', stock: 'ion amonio', sistematica: 'ion azanio' }, alias: [], estados: { N: -3 }, formacion: 'NH₃ + H⁺.' });
  agregar({ formula: 'H3O^+', funcion: 'cation', nombres: { tradicional: 'ion hidronio', stock: 'ion oxonio', sistematica: 'ion oxidanio' }, alias: [], estados: {}, formacion: 'H₂O + H⁺.' });

  // Sales: cada catión (incluido el amonio) con cada anión
  const amonio: Cation = { grupo: 'NH4', nAtomos: 1, carga: 1, metal: 'N', eo: -3, tradicional: 'de amonio', stock: 'de amonio', nombreMetal: 'amonio', variable: false };
  for (const c of [...cats, amonio]) {
    for (const an of aniones) {
      // Se omiten combinaciones del mismo elemento como catión y como central del anión (CrCrO₄, MnMnO₄)
      if (an.central === c.metal) continue;
      const poli = !an.monoatomico;
      const { formula, nC, nA } = cruzar(c, an.grupo, an.carga, poli);
      const funcion: Funcion = an.acida ? 'sal-acida' : an.monoatomico || an.grupo === 'CN' ? 'sal-haloidea' : 'oxisal';
      const nM = c.grupo === 'Hg2' ? 2 * nC : nC;
      const sistematica = an.monoatomico
        ? `${nA > 1 ? prefijo(nA) : ''}${an.sistematica} de ${nM > 1 ? prefijo(nM) : ''}${c.nombreMetal}`
        : `${an.sistematica} ${c.stock}`;
      const trad = `${an.tradicional} ${c.tradicional}`;
      agregar({
        formula,
        funcion,
        nombres: { tradicional: trad, stock: `${an.stock} ${c.stock}`, sistematica },
        alias: an.alias.map((x) => `${x} ${c.tradicional}`),
        estados: { [c.metal]: c.eo, [an.central]: an.eoCentral },
        formacion: `Catión ${ionTexto(c.grupo, c.carga, '+')} (${c.tradicional.replace(/^de /, '')}) + anión ${ionTexto(an.grupo, an.carga, '−')} (${an.tradicional}): se cruzan las cargas → ${formula.replace(/d/g, (d) => SUB_U[Number(d)]!)}.`,
      });
    }
  }

  // Sales básicas (hidroxisales) con haluros: metales M²⁺ fijos y Al³⁺
  for (const c of cats.filter((x) => !x.variable && x.carga >= 2)) {
    for (const [s, q, , anion] of HALUROS.filter((h) => h[1] === 1)) {
      for (let oh = 1; oh < c.carga; oh++) {
        const nX = c.carga - oh * 1;
        if (nX % q) continue;
        const formula = `${c.grupo}(OH)${oh > 1 ? oh : ''}${s}${sub(nX / q)}`;
        const basico = oh === 1 ? 'básico' : `${prefijo(oh)}básico`;
        agregar({
          formula,
          funcion: 'sal-basica',
          nombres: {
            tradicional: `${anion} ${basico} ${c.tradicional}`,
            stock: `${oh > 1 ? prefijo(oh) : ''}hidroxi${nX > 1 ? prefijo(nX) : ''}${anion} ${c.stock}`,
            sistematica: `${nX > 1 ? prefijo(nX) : ''}${anion} ${oh > 1 ? prefijo(oh) : ''}hidróxido ${c.stock}`,
          },
          alias: [],
          estados: { [c.metal]: c.eo },
          formacion: `Hidróxido que reemplaza solo parte de sus OH⁻ por ${anion}: quedan ${oh} OH⁻.`,
        });
      }
    }
  }

  // Sales dobles (selección)
  const DOBLES: [string, string, string, string][] = [
    ['KNaSO4', 'sulfato doble de potasio y sodio', 'sulfato de potasio y sodio', 'tetraoxosulfato(VI) de potasio y sodio'],
    ['KAl(SO4)2', 'sulfato doble de aluminio y potasio', 'sulfato de aluminio y potasio', 'bis[tetraoxosulfato(VI)] de aluminio y potasio'],
    ['KNaCO3', 'carbonato doble de potasio y sodio', 'carbonato de potasio y sodio', 'trioxocarbonato(IV) de potasio y sodio'],
    ['NH4MgPO4', 'fosfato doble de amonio y magnesio', 'fosfato de amonio y magnesio', 'tetraoxofosfato(V) de amonio y magnesio'],
  ];
  for (const [f, t, s, si] of DOBLES) {
    agregar({ formula: f, funcion: 'sal-doble', nombres: { tradicional: t, stock: s, sistematica: si }, alias: [], estados: {}, formacion: 'Dos cationes distintos con el mismo anión.' });
  }

  CACHE = lista;
  return lista;
}

// ── Búsquedas ───────────────────────────────────────────────────────────────

/** Clave de composición (fórmula de Hill con carga) para comparar fórmulas escritas de forma distinta. */
export function claveFormula(f: string): string {
  return formulaHill(parsearFormula(f));
}

let indiceFormula: Map<string, Compuesto[]> | null = null;
let indiceNombre: Map<string, Compuesto> | null = null;

function indices() {
  if (!indiceFormula || !indiceNombre) {
    indiceFormula = new Map();
    indiceNombre = new Map();
    for (const c of catalogoNomenclatura()) {
      const k = claveFormula(c.formula);
      indiceFormula.set(k, [...(indiceFormula.get(k) ?? []), c]);
      for (const n of [c.nombres.tradicional, c.nombres.stock, c.nombres.sistematica, ...c.alias]) {
        if (n && !indiceNombre.has(normalizarNombre(n))) indiceNombre.set(normalizarNombre(n), c);
      }
    }
  }
  return { indiceFormula, indiceNombre };
}

const HIDRATOS = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];

export interface ResultadoNombre {
  compuestos: Compuesto[];
  /** Moléculas de agua de hidratación (CuSO4·5H2O → 5). */
  hidratacion: number;
}

/** Fórmula → compuesto(s) con sus nombres. */
export function nombrar(formula: string): ResultadoNombre {
  const partes = formula.replace(/[*•∙.]/g, '·').split('·');
  const principal = partes[0]!.trim();
  const agua = partes[1]?.match(/^(\d*)\s*H2O$/);
  const hidratacion = agua ? Number(agua[1] || 1) : 0;
  const k = claveFormula(principal);
  return { compuestos: indices().indiceFormula.get(k) ?? [], hidratacion };
}

/** Agrega «pentahidratado» a un nombre. */
export const conHidratacion = (nombre: string, n: number) => (n ? `${nombre} ${HIDRATOS[n] ?? n}hidratado` : nombre);

/** Nombre (cualquiera de las tres nomenclaturas, con o sin tildes) → compuesto. */
export function formular(nombre: string): { compuesto: Compuesto; hidratacion: number } | null {
  let n = normalizarNombre(nombre);
  let hidratacion = 0;
  const m = n.match(/ (mono|di|tri|tetra|penta|hexa|hepta|octa|nona|deca)hidratado$/);
  if (m) {
    hidratacion = HIDRATOS.indexOf(m[1]!);
    n = n.slice(0, m.index);
  }
  const c = indices().indiceNombre.get(n);
  return c ? { compuesto: c, hidratacion } : null;
}
