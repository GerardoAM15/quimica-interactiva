/**
 * Nomenclatura IUPAC de compuestos orgánicos (nivel básico), en español.
 *
 * Alcance: alcanos (ramificados), alquenos, alquinos, cicloalcanos y cicloalquenos, derivados del
 * benceno, halogenuros, alcoholes, éteres (como alcoxi), aldehídos, cetonas, ácidos carboxílicos,
 * ésteres, aminas, amidas y nitrilos. Fuera de ese alcance se lanza un error explicativo.
 *
 * Reglas aplicadas (recomendaciones IUPAC 1979/1993, las de los textos de admisión):
 *   1. Grupo principal (orden de prioridad): ácido > éster > amida > nitrilo > aldehído > cetona > alcohol > amina.
 *   2. Cadena principal: máximo número de grupos principales → de enlaces múltiples → mayor longitud →
 *      más dobles enlaces → (numeración) localizadores más bajos al grupo principal, a los enlaces
 *      múltiples, a los dobles, mayor número de sustituyentes, localizadores más bajos a los
 *      sustituyentes y, por último, al sustituyente citado primero en orden alfabético.
 *   3. Prefijos en orden alfabético (sin contar di-, tri-…), separados por guiones si llevan localizador.
 */
import type { Molecula } from '../molecula';

export class ErrorNomenclaturaOrg extends Error {
  override name = 'ErrorNomenclaturaOrg';
}

const fuera = (motivo: string): never => {
  throw new ErrorNomenclaturaOrg(`Estructura fuera del alcance del nombrador: ${motivo}.`);
};

export type Orden = 1 | 2 | 3;
export interface AtomoOrg {
  el: string;
  carga: number;
}
export interface EnlaceOrg {
  a: number;
  b: number;
  orden: Orden;
}
/** Grafo de átomos pesados (los H son implícitos y se deducen por valencia). */
export interface GrafoOrg {
  atomos: AtomoOrg[];
  enlaces: EnlaceOrg[];
}

/** Quita los hidrógenos explícitos de una molécula (de RDKit o de un molfile). */
export function grafoDeMolecula(m: Molecula): GrafoOrg {
  const idx = new Map<number, number>();
  const atomos: AtomoOrg[] = [];
  m.atomos.forEach((a, i) => {
    if (a.simbolo === 'H') return;
    idx.set(i, atomos.length);
    atomos.push({ el: a.simbolo, carga: a.carga });
  });
  const enlaces = m.enlaces.filter((e) => idx.has(e.a) && idx.has(e.b)).map((e) => ({ a: idx.get(e.a)!, b: idx.get(e.b)!, orden: e.orden }));
  return { atomos, enlaces };
}

// ── Raíces y prefijos ───────────────────────────────────────────────────────

export const RAICES = ['', 'met', 'et', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec', 'undec', 'dodec', 'tridec', 'tetradec', 'pentadec', 'hexadec', 'heptadec', 'octadec', 'nonadec', 'icos'];
const MULT = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa'];
const MULT_COMPLEJO = ['', '', 'bis', 'tris', 'tetrakis'];
const HALOGENO: Record<string, string> = { F: 'fluoro', Cl: 'cloro', Br: 'bromo', I: 'yodo' };
const raiz = (n: number) => RAICES[n] ?? fuera(`cadena de ${n} carbonos`);

export type TipoGrupo = 'acido' | 'ester' | 'amida' | 'nitrilo' | 'aldehido' | 'cetona' | 'alcohol' | 'amina';
export const PRIORIDAD: TipoGrupo[] = ['acido', 'ester', 'amida', 'nitrilo', 'aldehido', 'cetona', 'alcohol', 'amina'];
export const NOMBRE_GRUPO: Record<TipoGrupo, string> = {
  acido: 'ácido carboxílico (–COOH)',
  ester: 'éster (–COO–)',
  amida: 'amida (–CONH₂)',
  nitrilo: 'nitrilo (–C≡N)',
  aldehido: 'aldehído (–CHO)',
  cetona: 'cetona (C=O)',
  alcohol: 'alcohol (–OH)',
  amina: 'amina (–NH₂)',
};
const SUFIJO: Record<TipoGrupo, string> = { acido: 'oico', ester: 'oato', amida: 'amida', nitrilo: 'nitrilo', aldehido: 'al', cetona: 'ona', alcohol: 'ol', amina: 'amina' };
/** Grupos cuyo carbono es extremo de cadena: su localizador (1) no se escribe. */
const TERMINAL: TipoGrupo[] = ['acido', 'ester', 'amida', 'nitrilo', 'aldehido'];

// ── Análisis del grafo ──────────────────────────────────────────────────────

const VALENCIA: Record<string, number> = { C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1 };

interface Vecino {
  j: number;
  orden: Orden;
}

interface Grupo {
  tipo: TipoGrupo;
  carbono: number;
  /** Heteroátomos que forman parte del grupo (no se nombran como sustituyentes). */
  hetero: number[];
  /** N de amina o amida (para los sustituyentes N-). */
  n?: number;
  /** Carbono del alcohol en un éster (R′ de R–COO–R′). */
  alcoxi?: number;
}

class Analisis {
  vec: Vecino[][];
  anillo: number[] = [];
  aromatico = false;
  grupos: Grupo[] = [];
  principal: TipoGrupo | null = null;

  constructor(readonly g: GrafoOrg) {
    this.vec = g.atomos.map(() => []);
    for (const e of g.enlaces) {
      this.vec[e.a]!.push({ j: e.b, orden: e.orden });
      this.vec[e.b]!.push({ j: e.a, orden: e.orden });
    }
    for (const [i, a] of g.atomos.entries()) {
      if (!(a.el in VALENCIA)) fuera(`contiene ${a.el}`);
      if (this.hidrogenos(i) < 0) throw new ErrorNomenclaturaOrg(`El átomo ${a.el} n.º ${i + 1} supera su valencia.`);
    }
    if (g.atomos.length && !g.atomos.some((a) => a.el === 'C')) fuera('no hay átomos de carbono');
    this.detectarAnillo();
    this.detectarGrupos();
  }

  el = (i: number) => this.g.atomos[i]!.el;
  valencia = (i: number) => {
    const a = this.g.atomos[i]!;
    return VALENCIA[a.el]! + (a.el === 'N' ? a.carga : a.el === 'O' ? a.carga : 0);
  };
  hidrogenos = (i: number) => this.valencia(i) - this.vec[i]!.reduce((s, v) => s + v.orden, 0);
  orden = (a: number, b: number) => this.vec[a]!.find((v) => v.j === b)?.orden ?? 0;
  carbonosVecinos = (i: number) => this.vec[i]!.filter((v) => this.el(v.j) === 'C');

  /** Poda de hojas: lo que queda es el núcleo cíclico; solo se admite un anillo carbocíclico. */
  private detectarAnillo() {
    const grado = this.vec.map((v) => v.length);
    const vivo = grado.map(() => true);
    let cambio = true;
    while (cambio) {
      cambio = false;
      grado.forEach((d, i) => {
        if (vivo[i] && d <= 1) {
          vivo[i] = false;
          cambio = true;
          for (const v of this.vec[i]!) if (vivo[v.j]) grado[v.j]!--;
        }
      });
    }
    const nucleo = vivo.flatMap((v, i) => (v ? [i] : []));
    if (!nucleo.length) return;
    if (nucleo.some((i) => this.vec[i]!.filter((v) => vivo[v.j]).length !== 2)) fuera('tiene más de un anillo');
    if (nucleo.some((i) => this.el(i) !== 'C')) fuera('es un heterociclo');
    // Recorrer el ciclo en orden
    const orden = [nucleo[0]!];
    while (orden.length < nucleo.length) {
      const u = orden.at(-1)!;
      const sig = this.vec[u]!.find((v) => vivo[v.j] && !orden.includes(v.j));
      if (!sig) fuera('tiene más de un anillo');
      orden.push(sig!.j);
    }
    this.anillo = orden;
    const n = orden.length;
    const ords = orden.map((a, k) => this.orden(a, orden[(k + 1) % n]!));
    // Benceno: seis carbonos con enlaces simples y dobles alternados (forma de Kekulé)
    this.aromatico = n === 6 && ords.every((o, k) => o === ords[k % 2]) && ords[0]! + ords[1]! === 3;
  }

  enAnillo = (i: number) => this.anillo.includes(i);

  private detectarGrupos() {
    for (const [c, a] of this.g.atomos.entries()) {
      if (a.el !== 'C') continue;
      const v = this.vec[c]!;
      const dblO = v.filter((x) => this.el(x.j) === 'O' && x.orden === 2);
      const sO = v.filter((x) => this.el(x.j) === 'O' && x.orden === 1 && this.g.atomos[x.j]!.carga === 0);
      const OH = sO.filter((x) => this.vec[x.j]!.length === 1);
      const Oeter = sO.filter((x) => this.vec[x.j]!.length === 2);
      const sN = v.filter((x) => this.el(x.j) === 'N' && x.orden === 1 && this.g.atomos[x.j]!.carga === 0 && !this.vec[x.j]!.some((y) => this.el(y.j) === 'O'));
      const tN = v.filter((x) => this.el(x.j) === 'N' && x.orden === 3);
      if (dblO.length > 1) fuera('carbono con dos =O');
      if (dblO.length === 1) {
        const o = dblO[0]!.j;
        if (OH.length) this.grupos.push({ tipo: 'acido', carbono: c, hetero: [o, OH[0]!.j] });
        else if (Oeter.length) {
          const oe = Oeter[0]!.j;
          const r = this.vec[oe]!.find((x) => x.j !== c)!.j;
          if (this.el(r) !== 'C') fuera('éster no carbonado');
          this.grupos.push({ tipo: 'ester', carbono: c, hetero: [o, oe], alcoxi: r });
        } else if (sN.length) this.grupos.push({ tipo: 'amida', carbono: c, hetero: [o, sN[0]!.j], n: sN[0]!.j });
        else if (this.carbonosVecinos(c).length <= 1) this.grupos.push({ tipo: 'aldehido', carbono: c, hetero: [o] });
        else this.grupos.push({ tipo: 'cetona', carbono: c, hetero: [o] });
        continue;
      }
      if (tN.length) this.grupos.push({ tipo: 'nitrilo', carbono: c, hetero: [tN[0]!.j] });
      for (const x of OH) this.grupos.push({ tipo: 'alcohol', carbono: c, hetero: [x.j] });
      for (const x of sN) {
        // N unido a un carbonilo pertenece a una amida (del otro carbono)
        const n = x.j;
        if (this.vec[n]!.some((y) => y.j !== c && this.esCarbonilo(y.j))) continue;
        this.grupos.push({ tipo: 'amina', carbono: c, hetero: [n], n });
      }
    }
    this.principal = PRIORIDAD.find((t) => this.grupos.some((g) => g.tipo === t)) ?? null;
    // Éster: el R′ del alcohol no puede tener a su vez otros grupos (fuera del alcance)
    if (this.principal === 'ester' && this.grupos.filter((g) => g.tipo === 'ester').length > 1) fuera('más de un grupo éster');
  }

  esCarbonilo = (c: number) => this.el(c) === 'C' && this.vec[c]!.some((x) => this.el(x.j) === 'O' && x.orden === 2);
  gruposEn = (c: number, tipo: TipoGrupo | null) => this.grupos.filter((g) => g.carbono === c && g.tipo === tipo);
}

// ── Sustituyentes ───────────────────────────────────────────────────────────

interface Sustituyente {
  loc: number | 'N';
  nombre: string;
  complejo?: boolean;
}

/** Clave alfabética: sin localizadores, paréntesis ni multiplicadores de los sustituyentes simples. */
const claveAlfabetica = (s: Sustituyente) => s.nombre.replace(/[()\d,-]/g, '').replace(/^N/, '');

/**
 * Nombre de una rama alquilo que empieza en `ini` (unida a `desde`): cadena más larga desde el punto de
 * unión (C1 = el carbono unido); si tiene ramificaciones se escribe entre paréntesis: (1-metiletil).
 */
function nombreAlquilo(A: Analisis, ini: number, desde: number): { nombre: string; complejo: boolean } {
  if (A.el(ini) !== 'C') fuera('rama con heteroátomos');
  if (A.enAnillo(ini)) {
    if (A.aromatico) return { nombre: 'fenil', complejo: false };
    if (A.anillo.some((i) => A.vec[i]!.some((v) => !A.enAnillo(v.j) && v.j !== desde))) fuera('anillo sustituido como rama');
    if (A.anillo.some((a, k) => A.orden(a, A.anillo[(k + 1) % A.anillo.length]!) > 1)) fuera('cicloalquenilo');
    return { nombre: `ciclo${raiz(A.anillo.length)}il`, complejo: false };
  }
  // Caminos desde ini dentro de la rama
  const caminos: number[][] = [];
  const dfs = (u: number, previo: number, camino: number[]) => {
    caminos.push(camino);
    for (const v of A.vec[u]!) {
      if (v.j === previo) continue;
      if (A.el(v.j) !== 'C') fuera('rama con heteroátomos');
      if (v.orden !== 1) fuera('rama insaturada');
      if (A.enAnillo(v.j)) fuera('rama con anillo');
      dfs(v.j, u, [...camino, v.j]);
    }
  };
  dfs(ini, desde, [ini]);
  const maxL = Math.max(...caminos.map((c) => c.length));
  let mejor: { camino: number[]; subs: Sustituyente[] } | null = null;
  for (const c of caminos.filter((x) => x.length === maxL)) {
    const subs: Sustituyente[] = [];
    c.forEach((u, k) => {
      for (const v of A.vec[u]!) {
        if (v.j === desde || c.includes(v.j)) continue;
        const r = nombreAlquilo(A, v.j, u);
        subs.push({ loc: k + 1, nombre: r.nombre, complejo: r.complejo });
      }
    });
    const locs = subs.map((s) => s.loc as number).sort((a, b) => a - b);
    if (!mejor || compararListas(locs, mejor.subs.map((s) => s.loc as number).sort((a, b) => a - b)) < 0) mejor = { camino: c, subs };
  }
  const m = mejor!;
  if (!m.subs.length) return { nombre: `${raiz(maxL)}il`, complejo: false };
  return { nombre: `(${prefijos(m.subs, true)}${raiz(maxL)}il)`, complejo: true };
}

/** Nombre del sustituyente unido al átomo `u` de la cadena principal a través del vecino `v`. */
function nombreSustituyente(A: Analisis, v: number, u: number): { nombre: string; complejo: boolean } {
  const el = A.el(v);
  if (el === 'C') return nombreAlquilo(A, v, u);
  if (HALOGENO[el]) return { nombre: HALOGENO[el]!, complejo: false };
  if (el === 'O') {
    if (A.orden(u, v) === 2) return { nombre: 'oxo', complejo: false };
    const otros = A.vec[v]!.filter((x) => x.j !== u);
    if (!otros.length) return { nombre: 'hidroxi', complejo: false };
    const r = otros[0]!.j;
    if (A.esCarbonilo(r)) fuera('grupo aciloxi');
    const alq = nombreAlquilo(A, r, v);
    if (alq.complejo || alq.nombre === 'fenil') fuera('alcoxi ramificado');
    return { nombre: alq.nombre.replace(/il$/, 'oxi'), complejo: false };
  }
  if (el === 'N') {
    const os = A.vec[v]!.filter((x) => A.el(x.j) === 'O');
    if (os.length === 2) return { nombre: 'nitro', complejo: false };
    if (A.vec[v]!.length === 1) return { nombre: 'amino', complejo: false };
  }
  return fuera(`sustituyente con ${el}`);
}

const compararListas = (a: number[], b: number[]) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
};

/** Prefijos agrupados y ordenados alfabéticamente: «2-bromo-2-cloro-1,1,1-trifluoro». */
function prefijos(subs: Sustituyente[], conLocalizadores: boolean): string {
  const grupos = new Map<string, Sustituyente[]>();
  for (const s of subs) grupos.set(s.nombre, [...(grupos.get(s.nombre) ?? []), s]);
  const claves = [...grupos.keys()].sort((a, b) => claveAlfabetica({ loc: 0, nombre: a }).localeCompare(claveAlfabetica({ loc: 0, nombre: b }), 'es'));
  let texto = '';
  for (const k of claves) {
    const lista = grupos.get(k)!;
    const n = lista.length;
    const complejo = lista[0]!.complejo;
    const mult = n > 1 ? (complejo ? MULT_COMPLEJO[n] : MULT[n]) ?? fuera('demasiados sustituyentes iguales') : '';
    const locs = lista.map((s) => s.loc).sort((a, b) => (a === 'N' ? -1 : b === 'N' ? 1 : (a as number) - (b as number)));
    const conLoc = conLocalizadores || locs.includes('N');
    const pieza = `${conLoc ? `${locs.join(',')}-` : ''}${mult}${k}`;
    texto += texto && conLoc ? `-${pieza}` : pieza;
  }
  return texto;
}

// ── Construcción del nombre ─────────────────────────────────────────────────

interface Partes {
  n: number;
  ciclo: boolean;
  dobles: number[];
  triples: number[];
  principal: TipoGrupo | null;
  locPrincipal: number[];
  subs: Sustituyente[];
  esterAlquilo?: string;
  aromatico?: boolean;
}

const vocal = (s: string) => /^[aeiou]/.test(s);

function ensamblar(p: Partes): string {
  const r = raiz(p.n);
  const nInsat = p.dobles.length + p.triples.length;
  // Localizadores de insaturación: no en C2 ni en un anillo con un solo enlace múltiple
  const locInsat = !(p.ciclo ? nInsat === 1 : p.n <= 2);
  let tallo: string;
  if (!nInsat) tallo = r + 'an';
  else {
    const partes = [
      { locs: p.dobles, base: 'en' },
      { locs: p.triples, base: 'in' },
    ].filter((x) => x.locs.length);
    const a = partes[0]!.locs.length > 1 ? 'a' : '';
    tallo = r + a + partes.map((x) => `${locInsat ? `-${x.locs.join(',')}-` : ''}${MULT[x.locs.length]}${x.base}`).join('');
  }
  let final: string;
  if (!p.principal) final = tallo + 'o';
  else {
    const k = p.locPrincipal.length;
    const suf = MULT[k] + SUFIJO[p.principal];
    const terminal = TERMINAL.includes(p.principal);
    const omitir = terminal || (k === 1 && (p.ciclo ? !p.subs.length && !nInsat : p.n <= 2));
    const conector = vocal(suf) ? '' : 'o';
    final = omitir ? tallo + conector + suf : `${tallo}${conector}-${p.locPrincipal.join(',')}-${suf}`;
  }
  // Localizadores de sustituyentes: se omiten en el metano y, con un solo sustituyente y sin grupo
  // principal, en el etano/eteno/etino y en los anillos sin dobles enlaces
  const numericos = p.subs.filter((s) => s.loc !== 'N');
  const sinLoc = p.n === 1 || (numericos.length === 1 && !p.principal && (p.ciclo ? !nInsat : p.n <= 2));
  const pre = prefijos(p.subs, !sinLoc);
  if (p.aromatico) return `${pre}benceno`;
  const nombre = `${pre}${p.ciclo ? 'ciclo' : ''}${final}`;
  if (p.principal === 'acido') return `ácido ${nombre}`;
  if (p.principal === 'ester') return `${nombre} de ${p.esterAlquilo}o`;
  return nombre;
}

// ── Elección de la cadena principal ─────────────────────────────────────────

interface Candidato {
  atomos: number[];
  ciclo: boolean;
  partes: Partes;
  clave: (number | number[] | string[])[];
}

/** Descriptor de una numeración (cadena o anillo) para comparar según las reglas IUPAC. */
function describir(A: Analisis, atomos: number[], ciclo: boolean): Candidato {
  const pos = new Map(atomos.map((a, k) => [a, k + 1]));
  const n = atomos.length;
  const P = A.principal;
  const locPrincipal: number[] = [];
  const consumidos = new Set<number>();
  const subs: Sustituyente[] = [];
  let esterAlquilo: string | undefined;
  for (const [k, a] of atomos.entries()) {
    for (const g of A.gruposEn(a, P)) {
      locPrincipal.push(k + 1);
      g.hetero.forEach((h) => consumidos.add(h));
      if (g.tipo === 'ester') esterAlquilo = nombreAlquilo(A, g.alcoxi!, g.hetero[1]!).nombre;
      // Sustituyentes N- de aminas y amidas
      if (g.n !== undefined)
        for (const v of A.vec[g.n]!) if (v.j !== a && !g.hetero.includes(v.j)) subs.push({ loc: 'N', ...nombreSustituyente(A, v.j, g.n) });
    }
  }
  const dobles: number[] = [], triples: number[] = [];
  const enlaceLoc = (k: number) => k + 1;
  for (let k = 0; k < (ciclo ? n : n - 1); k++) {
    const o = A.orden(atomos[k]!, atomos[(k + 1) % n]!);
    if (A.aromatico && ciclo) continue;
    if (o === 2) dobles.push(enlaceLoc(k));
    if (o === 3) triples.push(enlaceLoc(k));
  }
  for (const [k, a] of atomos.entries()) {
    for (const v of A.vec[a]!) {
      if (pos.has(v.j) || consumidos.has(v.j)) continue;
      subs.push({ loc: k + 1, ...nombreSustituyente(A, v.j, a) });
    }
  }
  const multiples = [...dobles, ...triples].sort((x, y) => x - y);
  const locSubs = subs.filter((s) => s.loc !== 'N').map((s) => s.loc as number).sort((x, y) => x - y);
  const alfabetico = [...subs.filter((s) => s.loc !== 'N')].sort((x, y) => claveAlfabetica(x).localeCompare(claveAlfabetica(y), 'es') || (x.loc as number) - (y.loc as number)).map((s) => s.loc as number);
  const partes: Partes = { n, ciclo, dobles, triples, principal: P, locPrincipal: [...locPrincipal].sort((x, y) => x - y), subs, esterAlquilo, aromatico: ciclo && A.aromatico };
  return {
    atomos,
    ciclo,
    partes,
    // Mayor es mejor en los cuatro primeros (se guardan con signo −); luego menor es mejor
    clave: [-locPrincipal.length, -multiples.length, -n, -dobles.length, partes.locPrincipal, multiples, dobles, -locSubs.length, locSubs, alfabetico],
  };
}

function comparar(a: Candidato, b: Candidato): number {
  for (let i = 0; i < a.clave.length; i++) {
    const x = a.clave[i]!, y = b.clave[i]!;
    const d = typeof x === 'number' ? x - (y as number) : compararListas(x as number[], y as number[]);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * Mejor candidato. Una cadena que deja fuera grupos o enlaces múltiples produce ramas que no se
 * pueden nombrar (p. ej. una rama con OH): esos candidatos pierden de todos modos y se descartan.
 */
function elegir(A: Analisis, opciones: number[][], ciclo: boolean): Candidato {
  let mejor: Candidato | null = null;
  let error: unknown = null;
  for (const o of opciones) {
    let c: Candidato;
    try {
      c = describir(A, o, ciclo);
    } catch (e) {
      error ??= e;
      continue;
    }
    if (!mejor || comparar(c, mejor) < 0) mejor = c;
  }
  if (!mejor) throw error;
  return mejor;
}

/** Todas las cadenas simples de carbonos no cíclicos, en ambos sentidos. */
function cadenas(A: Analisis): number[][] {
  const elegible = (i: number) => A.el(i) === 'C' && !A.enAnillo(i);
  const res: number[][] = [];
  const dfs = (u: number, camino: number[]) => {
    res.push(camino);
    for (const v of A.vec[u]!) if (elegible(v.j) && !camino.includes(v.j)) dfs(v.j, [...camino, v.j]);
  };
  A.g.atomos.forEach((_, i) => elegible(i) && dfs(i, [i]));
  return res;
}

function numeracionesAnillo(A: Analisis): number[][] {
  const r = A.anillo, n = r.length;
  const res: number[][] = [];
  for (let s = 0; s < n; s++) for (const d of [1, -1]) res.push(Array.from({ length: n }, (_, k) => r[(s + d * k + n * n) % n]!));
  return res;
}

export interface ResultadoNombre {
  nombre: string;
  /** Explicación de cada decisión. */
  pasos: string[];
  /** Átomos de la cadena o del anillo principal, en orden de numeración (índices del grafo). */
  cadena: number[];
  principal: TipoGrupo | null;
}

/** Nombre IUPAC (en español) de la estructura. */
export function nombrarOrganico(g: GrafoOrg): ResultadoNombre {
  const A = new Analisis(g);
  const pasos: string[] = [];
  if (A.principal) pasos.push(`Grupo principal (el de mayor prioridad): ${NOMBRE_GRUPO[A.principal]} → sufijo «-${SUFIJO[A.principal]}».`);
  else pasos.push('No hay grupo funcional con sufijo: se nombra como hidrocarburo (o derivado halogenado/éter como prefijo).');

  // Derivados del benceno con nombre aceptado por la IUPAC
  if (A.anillo.length && A.aromatico) {
    const externos = A.anillo.flatMap((a) => A.vec[a]!.filter((v) => !A.enAnillo(v.j)).map((v) => ({ a, v: v.j })));
    if (externos.length === 1 && A.principal) {
      const { a, v } = externos[0]!;
      const g1 = A.grupos.find((x) => x.carbono === v || (x.carbono === a && x.hetero.includes(v)));
      const retenido = g1?.tipo === 'acido' ? 'ácido benzoico' : g1?.tipo === 'aldehido' ? 'benzaldehído' : g1?.tipo === 'alcohol' ? 'fenol' : g1?.tipo === 'amina' && A.vec[v]!.length === 1 ? 'anilina' : null;
      if (retenido && A.g.atomos.length === 6 + (g1!.tipo === 'acido' ? 3 : g1!.tipo === 'aldehido' ? 2 : 1)) {
        pasos.push(`Derivado del benceno con nombre aceptado por la IUPAC: ${retenido}.`);
        return { nombre: retenido, pasos, cadena: A.anillo, principal: A.principal };
      }
    }
  }

  const principalEnCadena = A.principal !== null && A.grupos.some((x) => x.tipo === A.principal && !A.enAnillo(x.carbono));
  const principalEnAnillo = A.principal !== null && A.grupos.some((x) => x.tipo === A.principal && A.enAnillo(x.carbono));
  let mejor: Candidato | null = null;
  if (A.anillo.length && !principalEnCadena) {
    if (A.aromatico && A.principal) fuera('benceno con grupo funcional y otros sustituyentes');
    mejor = elegir(A, numeracionesAnillo(A), true);
    pasos.push(A.aromatico ? 'Compuesto principal: benceno (los sustituyentes se nombran como prefijos).' : `Cadena principal: el anillo de ${A.anillo.length} carbonos (ciclo${raiz(A.anillo.length)}ano).`);
  } else {
    if (principalEnAnillo) fuera('grupo principal en el anillo y en la cadena');
    const todas = cadenas(A);
    if (!todas.length) fuera('no hay cadena carbonada');
    mejor = elegir(A, todas, false);
    const m = mejor!;
    pasos.push(
      `Cadena principal: ${m.atomos.length} carbono${m.atomos.length > 1 ? 's' : ''} (${raiz(m.atomos.length)}-)` +
        (A.principal ? `, la que contiene más grupos ${A.principal === 'alcohol' ? 'OH' : 'principales'}` : '') +
        (m.partes.dobles.length + m.partes.triples.length ? ' e incluye los enlaces múltiples' : '') +
        '; entre las posibles, la más larga y con más sustituyentes.',
    );
  }
  const m = mejor!;
  const p = m.partes;
  const detalles: string[] = [];
  if (p.locPrincipal.length && !TERMINAL.includes(p.principal!)) detalles.push(`grupo principal en ${p.locPrincipal.join(',')}`);
  if (p.dobles.length) detalles.push(`doble enlace en ${p.dobles.join(',')}`);
  if (p.triples.length) detalles.push(`triple enlace en ${p.triples.join(',')}`);
  const numSubs = p.subs.filter((s) => s.loc !== 'N');
  if (numSubs.length) detalles.push(`sustituyentes en ${numSubs.map((s) => s.loc).sort((a, b) => (a as number) - (b as number)).join(',')}`);
  if (detalles.length) pasos.push(`Numeración que da los localizadores más bajos (en este orden de prioridad): ${detalles.join('; ')}.`);
  if (p.subs.length) pasos.push(`Prefijos en orden alfabético: ${[...new Set(p.subs.map((s) => s.nombre))].sort((a, b) => claveAlfabetica({ loc: 0, nombre: a }).localeCompare(claveAlfabetica({ loc: 0, nombre: b }), 'es')).join(', ')}.`);
  if (p.principal === 'ester') pasos.push(`Éster: «-oato de ${p.esterAlquilo}o» (el grupo R′ unido al oxígeno se nombra al final).`);
  const nombre = ensamblar(p);
  pasos.push(`Nombre: ${nombre}`);
  return { nombre, pasos, cadena: m.atomos, principal: p.principal };
}

// ── Nombre → estructura ─────────────────────────────────────────────────────

class Constructor {
  atomos: AtomoOrg[] = [];
  enlaces: EnlaceOrg[] = [];
  add(el: string, carga = 0) {
    this.atomos.push({ el, carga });
    return this.atomos.length - 1;
  }
  bond(a: number, b: number, orden: Orden = 1) {
    this.enlaces.push({ a, b, orden });
  }
  cadena(n: number): number[] {
    const c = Array.from({ length: n }, () => this.add('C'));
    for (let i = 1; i < n; i++) this.bond(c[i - 1]!, c[i]!);
    return c;
  }
  setOrden(a: number, b: number, orden: Orden) {
    const e = this.enlaces.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (!e) throw new ErrorNomenclaturaOrg('Localizador de insaturación no válido.');
    e.orden = orden;
  }
  benceno(): number[] {
    const r = this.cadena(6);
    this.bond(r[5]!, r[0]!);
    [0, 2, 4].forEach((k) => this.setOrden(r[k]!, r[k + 1]!, 2));
    return r;
  }
}

const RAIZ_RE = 'icos|nonadec|octadec|heptadec|hexadec|pentadec|tetradec|tridec|dodec|undec|dec|non|oct|hept|hex|pent|but|prop|et|met';
const MULT_RE = 'di|tri|tetra|penta|hexa|bis|tris';
const nRaiz = (r: string) => {
  const n = RAICES.indexOf(r);
  if (n < 1) throw new ErrorNomenclaturaOrg(`Raíz desconocida: «${r}».`);
  return n;
};
const valorMult = (m: string | undefined) => (!m ? 1 : { di: 2, tri: 3, tetra: 4, penta: 5, hexa: 6, bis: 2, tris: 3 }[m] ?? 1);

interface PrefijoLeido {
  locs: (number | 'N')[];
  nombre: string;
}

/** Lee «2-bromo-2-cloro-1,1,1-trifluoro», «N,N-dimetil», «2-(1-metiletil)»… */
function leerPrefijos(texto: string): PrefijoLeido[] {
  const res: PrefijoLeido[] = [];
  const re = new RegExp(
    `-?(?:([\\dN][\\dN,]*)-)?(${MULT_RE})?(\\((?:[^()]|\\([^()]*\\))*\\)|fluoro|cloro|bromo|yodo|nitro|amino|hidroxi|oxo|fenil|ciclo(?:prop|but|pent|hex|hept|oct)il|(?:met|et|prop|but|pent|hex|hept|oct|non|dec)oxi|(?:${RAIZ_RE})il)`,
    'y',
  );
  let i = 0;
  while (i < texto.length) {
    re.lastIndex = i;
    const m = re.exec(texto);
    if (!m) throw new ErrorNomenclaturaOrg(`No se reconoce el prefijo «${texto.slice(i)}».`);
    const k = valorMult(m[2]);
    const locs = m[1] ? m[1].split(',').map((x) => (x === 'N' ? 'N' : Number(x))) : Array.from({ length: k }, () => 1);
    if (locs.length !== k) throw new ErrorNomenclaturaOrg(`El número de localizadores de «${m[0]}» no coincide con el multiplicador.`);
    for (const l of locs) res.push({ locs: [l], nombre: m[3]! });
    i = re.lastIndex;
  }
  return res.map((r) => ({ locs: r.locs, nombre: r.nombre }));
}

/** Agrega el sustituyente `nombre` unido al átomo `a`. */
function agregarSustituyente(K: Constructor, a: number, nombre: string) {
  const H = Object.entries(HALOGENO).find(([, v]) => v === nombre);
  if (H) return K.bond(a, K.add(H[0]));
  if (nombre === 'hidroxi') return K.bond(a, K.add('O'));
  if (nombre === 'oxo') return K.bond(a, K.add('O'), 2);
  if (nombre === 'amino') return K.bond(a, K.add('N'));
  if (nombre === 'nitro') {
    const n = K.add('N', 1);
    K.bond(a, n);
    K.bond(n, K.add('O'), 2);
    K.bond(n, K.add('O', -1));
    return;
  }
  if (nombre === 'fenil') return K.bond(a, K.benceno()[0]!);
  let m = /^ciclo(\w+?)il$/.exec(nombre);
  if (m) {
    const r = K.cadena(nRaiz(m[1]!));
    K.bond(r.at(-1)!, r[0]!);
    return K.bond(a, r[0]!);
  }
  m = /^(\w+?)oxi$/.exec(nombre);
  if (m) {
    const o = K.add('O');
    K.bond(a, o);
    return K.bond(o, K.cadena(nRaiz(m[1]!))[0]!);
  }
  return K.bond(a, agregarAlquilo(K, nombre));
}

/** Construye una rama alquilo («etil», «(1-metiletil)») y devuelve su carbono de unión. */
function agregarAlquilo(K: Constructor, nombre: string): number {
  const interior = nombre.startsWith('(') ? nombre.slice(1, -1) : nombre;
  const m = new RegExp(`^(.*?)(${RAIZ_RE})il$`).exec(interior);
  if (!m) throw new ErrorNomenclaturaOrg(`Sustituyente desconocido: «${nombre}».`);
  const c = K.cadena(nRaiz(m[2]!));
  if (m[1]) for (const p of leerPrefijos(m[1])) agregarSustituyente(K, c[(p.locs[0] as number) - 1]!, p.nombre);
  return c[0]!;
}

const RETENIDOS: Record<string, string> = { tolueno: 'metilbenceno' };

/** Estructura (grafo) a partir de un nombre IUPAC en español. */
export function parsearNombre(entrada: string): GrafoOrg {
  let nombre = entrada.trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[,\s(-])n(?=[,-])/g, '$1N');
  nombre = RETENIDOS[nombre] ?? nombre;
  const K = new Constructor();
  const especiales: Record<string, () => void> = {
    fenol: () => K.bond(K.benceno()[0]!, K.add('O')),
    anilina: () => K.bond(K.benceno()[0]!, K.add('N')),
    'ácido benzoico': () => {
      const c = K.add('C');
      K.bond(K.benceno()[0]!, c);
      K.bond(c, K.add('O'), 2);
      K.bond(c, K.add('O'));
    },
    benzaldehído: () => {
      const c = K.add('C');
      K.bond(K.benceno()[0]!, c);
      K.bond(c, K.add('O'), 2);
    },
  };
  if (especiales[nombre]) {
    especiales[nombre]!();
    return { atomos: K.atomos, enlaces: K.enlaces };
  }
  let alcoxiEster: string | null = null;
  const ester = /^(.+oato) de (.+)ilo$/.exec(nombre);
  if (ester) {
    nombre = ester[1]!;
    alcoxiEster = `${ester[2]}il`;
  }
  const acido = /^ácido (.+)$/.exec(nombre);
  if (acido) nombre = acido[1]!;
  const benceno = /^(.*)benceno$/.exec(nombre);
  if (benceno) {
    const r = K.benceno();
    for (const p of leerPrefijos(benceno[1]!)) agregarSustituyente(K, r[(p.locs[0] as number) - 1]!, p.nombre);
    return { atomos: K.atomos, enlaces: K.enlaces };
  }
  const re = new RegExp(
    `^(.*?)(ciclo)?(${RAIZ_RE})(a)?(an|(?:-[\\d,]+-(?:${MULT_RE})?(?:en|in))+|(?:${MULT_RE})?en|(?:${MULT_RE})?in|en(?:${MULT_RE})?in)(o|o?(?:-([\\d,]+)-)?(${MULT_RE})?(ol|ona|amina|al|oico|nitrilo|amida|oato))$`,
  );
  const m = re.exec(nombre);
  if (!m) throw new ErrorNomenclaturaOrg(`No se reconoce el nombre «${entrada}».`);
  const [, pref, ciclo, r, , insat, , locSuf, multSuf, suf] = m;
  const n = nRaiz(r!);
  const c = K.cadena(n);
  if (ciclo) {
    if (n < 3) throw new ErrorNomenclaturaOrg('Un anillo necesita al menos 3 carbonos.');
    K.bond(c[n - 1]!, c[0]!);
  }
  const enlace = (loc: number) => [c[loc - 1]!, c[loc % n]!] as const;
  if (insat !== 'an') {
    const partes = [...insat!.matchAll(new RegExp(`-?([\\d,]+)?-?(${MULT_RE})?(en|in)`, 'g'))];
    for (const p of partes) {
      const k = valorMult(p[2]);
      const locs = p[1] ? p[1].split(',').map(Number) : Array.from({ length: k }, (_, i) => 1 + 2 * i);
      if (locs.length !== k) throw new ErrorNomenclaturaOrg('Los localizadores de la insaturación no coinciden con el multiplicador.');
      for (const l of locs) {
        if (l < 1 || l >= (ciclo ? n + 1 : n)) throw new ErrorNomenclaturaOrg(`Localizador ${l} fuera de la cadena.`);
        const [a, b] = enlace(l);
        K.setOrden(a, b, p[3] === 'en' ? 2 : 3);
      }
    }
  }
  let nPrincipal: number | null = null;
  if (suf) {
    const k = valorMult(multSuf);
    const terminal = ['al', 'oico', 'nitrilo', 'amida', 'oato'].includes(suf);
    const locs = locSuf ? locSuf.split(',').map(Number) : terminal ? [1, n].slice(0, k) : suf === 'ona' && !ciclo && n >= 3 ? [2] : [1];
    if (locs.length !== k) throw new ErrorNomenclaturaOrg('Los localizadores del sufijo no coinciden con el multiplicador.');
    for (const l of locs) {
      const a = c[l - 1];
      if (a === undefined) throw new ErrorNomenclaturaOrg(`Localizador ${l} fuera de la cadena.`);
      if (suf === 'ol') K.bond(a, K.add('O'));
      else if (suf === 'ona' || suf === 'al') K.bond(a, K.add('O'), 2);
      else if (suf === 'amina') {
        const nn = K.add('N');
        nPrincipal ??= nn;
        K.bond(a, nn);
      }
      else if (suf === 'nitrilo') K.bond(a, K.add('N'), 3);
      else if (suf === 'amida') {
        K.bond(a, K.add('O'), 2);
        const nn = K.add('N');
        nPrincipal ??= nn;
        K.bond(a, nn);
      } else if (suf === 'oico') {
        K.bond(a, K.add('O'), 2);
        K.bond(a, K.add('O'));
      } else if (suf === 'oato') {
        if (!alcoxiEster) throw new ErrorNomenclaturaOrg('Un éster se nombra «…oato de …ilo».');
        K.bond(a, K.add('O'), 2);
        const o = K.add('O');
        K.bond(a, o);
        K.bond(o, agregarAlquilo(K, alcoxiEster));
      }
    }
  }
  for (const p of leerPrefijos(pref!)) {
    const l = p.locs[0]!;
    if (l === 'N') {
      if (nPrincipal === null) throw new ErrorNomenclaturaOrg('El localizador N solo se usa con aminas y amidas.');
      agregarSustituyente(K, nPrincipal, p.nombre);
    } else {
      const a = c[l - 1];
      if (a === undefined) throw new ErrorNomenclaturaOrg(`Localizador ${l} fuera de la cadena.`);
      agregarSustituyente(K, a, p.nombre);
    }
  }
  const g = { atomos: K.atomos, enlaces: K.enlaces };
  new Analisis(g); // valida valencias
  return g;
}

// ── Grafo → SMILES ──────────────────────────────────────────────────────────

/** SMILES (no canónico) del grafo, para dibujarlo con RDKit. */
export function smilesDeGrafo(g: GrafoOrg): string {
  const n = g.atomos.length;
  if (!n) return '';
  const vec: Vecino[][] = g.atomos.map(() => []);
  for (const e of g.enlaces) {
    vec[e.a]!.push({ j: e.b, orden: e.orden });
    vec[e.b]!.push({ j: e.a, orden: e.orden });
  }
  const visto = new Array<boolean>(n).fill(false);
  const enPila = new Array<boolean>(n).fill(false);
  const padre = new Array<number>(n).fill(-1);
  const cierres = new Map<number, { digito: number; orden: Orden; abre: boolean }[]>();
  let digito = 1;
  const hijos: number[][] = g.atomos.map(() => []);
  const dfs = (u: number) => {
    visto[u] = true;
    enPila[u] = true;
    for (const v of vec[u]!) {
      if (v.j === padre[u]) continue;
      if (visto[v.j]) {
        // Arista hacia un antecesor: cierre de anillo (el dígito se abre en el antecesor)
        if (enPila[v.j]) {
          const d = digito++;
          cierres.set(v.j, [...(cierres.get(v.j) ?? []), { digito: d, orden: v.orden, abre: true }]);
          cierres.set(u, [...(cierres.get(u) ?? []), { digito: d, orden: v.orden, abre: false }]);
        }
        continue;
      }
      padre[v.j] = u;
      hijos[u]!.push(v.j);
      dfs(v.j);
    }
    enPila[u] = false;
  };
  const simbolo = (a: AtomoOrg) => (a.carga ? `[${a.el}${a.carga > 0 ? '+' : '-'}]` : a.el);
  const b = (o: number) => (o === 2 ? '=' : o === 3 ? '#' : '');
  const ordenEntre = (u: number, v: number) => vec[u]!.find((x) => x.j === v)!.orden;
  const escribir = (u: number): string => {
    let s = simbolo(g.atomos[u]!);
    for (const c of cierres.get(u) ?? []) s += (c.abre ? b(c.orden) : '') + (c.digito < 10 ? c.digito : `%${c.digito}`);
    const h = hijos[u]!;
    h.forEach((v, k) => {
      const t = b(ordenEntre(u, v)) + escribir(v);
      s += k < h.length - 1 ? `(${t})` : t;
    });
    return s;
  };
  const partes: string[] = [];
  for (let i = 0; i < n; i++) {
    if (visto[i]) continue;
    dfs(i);
    partes.push(escribir(i));
  }
  return partes.join('.');
}

// ── Traducción al inglés (para compararla con PubChem) ──────────────────────

const RETENIDOS_EN: Record<string, string> = {
  etino: 'acetylene',
  metilbenceno: 'toluene',
  triclorometano: 'chloroform',
  metanal: 'formaldehyde',
  etanal: 'acetaldehyde',
  'ácido metanoico': 'formic acid',
  'ácido etanoico': 'acetic acid',
  metanamida: 'formamide',
  etanamida: 'acetamide',
  'N-metiletanamida': 'N-methylacetamide',
  'N,N-dimetilmetanamida': 'N,N-dimethylformamide',
  etanonitrilo: 'acetonitrile',
  fenol: 'phenol',
  'ácido benzoico': 'benzoic acid',
  benzaldehído: 'benzaldehyde',
  anilina: 'aniline',
};

/** Traduce un nombre generado por `nombrarOrganico` a la forma inglesa que usa PubChem. */
export function aIngles(nombre: string): string {
  if (RETENIDOS_EN[nombre]) return RETENIDOS_EN[nombre]!;
  const ester = /^(.+)oato de (.+)ilo$/.exec(nombre);
  if (ester) {
    const acido = ester[1] === 'etan' ? 'acet' : ester[1] === 'metan' ? 'form' : aIngles(`${ester[1]}o`).replace(/e$/, 'o');
    return `${aIngles(`${ester[2]}ilo`).replace(/o$/, '')} ${acido}ate`.replace(/oate$/, 'oate');
  }
  const ac = /^ácido (.+)oico$/.exec(nombre);
  if (ac) return `${traducir(ac[1]!)}oic acid`;
  return traducir(nombre);
}

function traducir(s: string): string {
  return s
    .replace(/benceno/g, 'benzene')
    .replace(/nitrilo$/, 'NITRILE')
    .replace(/amina$/, 'amine')
    .replace(/amida$/, 'amide')
    .replace(/ona$/, 'one')
    .replace(/ino$/, 'yne')
    .replace(/in(?=-|o?NITRILE|ol|al|one|amine|amide|oic|$)/g, 'yn')
    .replace(/eno$/, 'ene')
    .replace(/ano$/, 'ane')
    .replace(/ano(?=-)/g, 'ane')
    .replace(/(an|en|yn)o(?=NITRILE|di|tri|tetra)/g, '$1e')
    .replace(/met(?=il|an|en|yn|ox)/g, 'meth')
    .replace(/(?<![mh])et(?=il|an|en|yn|ox)/g, 'eth')
    .replace(/il/g, 'yl')
    .replace(/oxi/g, 'oxy')
    .replace(/hidroxy|hidroxi/g, 'hydroxy')
    .replace(/cloro/g, 'chloro')
    .replace(/yodo/g, 'iodo')
    .replace(/fenyl/g, 'phenyl')
    .replace(/ciclo/g, 'cyclo')
    .replace('NITRILE', 'nitrile');
}

// ── Utilidades para los módulos ─────────────────────────────────────────────

export type TipoCarbono = 'primario' | 'secundario' | 'terciario' | 'cuaternario' | 'sin carbonos vecinos';
export type Hibridacion = 'sp' | 'sp²' | 'sp³';

/** Clasificación de cada carbono por el número de carbonos unidos y su hibridación. */
export function analizarCarbonos(g: GrafoOrg): { indice: number; tipo: TipoCarbono; hibridacion: Hibridacion; sigma: number; pi: number }[] {
  const A = new Analisis(g);
  const tipos: TipoCarbono[] = ['sin carbonos vecinos', 'primario', 'secundario', 'terciario', 'cuaternario'];
  return g.atomos.flatMap((a, i) => {
    if (a.el !== 'C') return [];
    const v = A.vec[i]!;
    const pi = v.reduce((s, x) => s + x.orden - 1, 0);
    const dobles = v.filter((x) => x.orden === 2).length, triples = v.filter((x) => x.orden === 3).length;
    const hibridacion: Hibridacion = triples || dobles >= 2 ? 'sp' : dobles ? 'sp²' : 'sp³';
    return [{ indice: i, tipo: tipos[A.carbonosVecinos(i).length]!, hibridacion, sigma: v.length + A.hidrogenos(i), pi }];
  });
}

/** Enlaces σ y π de la molécula (incluidos los enlaces con H implícitos). */
export function contarEnlaces(g: GrafoOrg): { sigma: number; pi: number } {
  const A = new Analisis(g);
  const h = g.atomos.reduce((s, _, i) => s + A.hidrogenos(i), 0);
  return { sigma: g.enlaces.length + h, pi: g.enlaces.reduce((s, e) => s + e.orden - 1, 0) };
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => (n > 1 ? String(n).replace(/\d/g, (d) => SUB[Number(d)]!) : '');

/** Fórmula semidesarrollada (condensada) de una estructura acíclica: CH₃–CH(OH)–CH₃. */
export function formulaSemidesarrollada(g: GrafoOrg): string {
  const A = new Analisis(g);
  if (A.anillo.length) fuera('la fórmula semidesarrollada se genera solo para cadenas abiertas');
  const n = g.atomos.length;
  if (n === 1) {
    const h = A.hidrogenos(0);
    return `${g.atomos[0]!.el}H${sub(h)}`;
  }
  // Camino más largo del árbol; a igual longitud, el que tiene más carbonos y empieza en carbono
  let camino: number[] = [];
  const puntaje = (c: number[]) => [c.length, c.filter((u) => g.atomos[u]!.el === 'C').length, g.atomos[c[0]!]!.el === 'C' ? 1 : 0];
  const mejorQue = (a: number[], b: number[]) => {
    if (!b.length) return true;
    const [x, y] = [puntaje(a), puntaje(b)];
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i]! > y[i]!;
    return false;
  };
  const dfs = (u: number, c: number[]) => {
    if (mejorQue(c, camino)) camino = c;
    for (const v of A.vec[u]!) if (!c.includes(v.j)) dfs(v.j, [...c, v.j]);
  };
  g.atomos.forEach((_, i) => dfs(i, [i]));
  const etiqueta = (u: number) => {
    const h = A.hidrogenos(u);
    return `${g.atomos[u]!.el}${h ? `H${sub(h)}` : ''}${g.atomos[u]!.carga ? (g.atomos[u]!.carga > 0 ? '⁺' : '⁻') : ''}`;
  };
  const enl = (o: number) => (o === 2 ? '=' : o === 3 ? '≡' : '–');
  const rama = (u: number, desde: number): string => {
    let s = etiqueta(u);
    const hijos = A.vec[u]!.filter((v) => v.j !== desde);
    // Las ramas laterales van entre paréntesis; la continuación lineal, con su enlace: CH₂–CH₃
    hijos.forEach((v, k) => {
      const t = rama(v.j, u);
      s += k < hijos.length - 1 ? `(${v.orden > 1 ? enl(v.orden) : ''}${t})` : `${enl(v.orden)}${t}`;
    });
    return s;
  };
  return camino
    .map((u, k) => {
      let s = etiqueta(u);
      const lados = A.vec[u]!.filter((v) => v.j !== camino[k - 1] && v.j !== camino[k + 1]);
      // Agrupar ramas idénticas: C(CH₃)₂
      const textos = lados.map((v) => `${v.orden > 1 ? enl(v.orden) : ''}${rama(v.j, u)}`);
      const cuenta = new Map<string, number>();
      for (const t of textos) cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
      for (const [t, c] of cuenta) s += c > 1 ? `(${t})${sub(c)}` : `(${t})`;
      return (k ? enl(A.orden(camino[k - 1]!, u)) : '') + s;
    })
    .join('');
}

/** Fórmula molecular (orden de Hill) del grafo con los H implícitos. */
export function formulaMolecularGrafo(g: GrafoOrg): string {
  const A = new Analisis(g);
  const cuenta = new Map<string, number>();
  g.atomos.forEach((a, i) => {
    cuenta.set(a.el, (cuenta.get(a.el) ?? 0) + 1);
    cuenta.set('H', (cuenta.get('H') ?? 0) + A.hidrogenos(i));
  });
  const orden = ['C', 'H', ...[...cuenta.keys()].filter((e) => e !== 'C' && e !== 'H').sort()];
  return orden.filter((e) => cuenta.get(e)).map((e) => `${e}${cuenta.get(e)! > 1 ? cuenta.get(e) : ''}`).join('');
}

/** Clase funcional (para clasificar isómeros). */
export function claseFuncional(g: GrafoOrg): string {
  const A = new Analisis(g);
  if (A.principal) return A.principal;
  if (g.atomos.some((a) => a.el === 'O')) return 'eter';
  if (A.anillo.length) return A.aromatico ? 'aromatico' : A.anillo.some((a, k) => A.orden(a, A.anillo[(k + 1) % A.anillo.length]!) > 1) ? 'cicloalqueno' : 'cicloalcano';
  if (g.enlaces.some((e) => e.orden === 3)) return 'alquino';
  if (g.enlaces.some((e) => e.orden === 2)) return 'alqueno';
  return 'alcano';
}

/** Firma del esqueleto carbonado (forma canónica AHU del árbol; en anillos, tamaño + grados). */
export function firmaEsqueleto(g: GrafoOrg): string {
  const C = g.atomos.flatMap((a, i) => (a.el === 'C' ? [i] : []));
  const ady = new Map(C.map((i) => [i, [] as number[]]));
  for (const e of g.enlaces) if (ady.has(e.a) && ady.has(e.b)) ady.get(e.a)!.push(e.b), ady.get(e.b)!.push(e.a);
  if (g.enlaces.filter((e) => ady.has(e.a) && ady.has(e.b)).length >= C.length) {
    return `ciclo:${C.length}:${C.map((i) => ady.get(i)!.length).sort().join('')}`;
  }
  const canon = (u: number, p: number): string => `(${ady.get(u)!.filter((v) => v !== p).map((v) => canon(v, u)).sort().join('')})`;
  return C.map((r) => canon(r, -1)).sort()[0] ?? '';
}

export type TipoIsomeria = 'cadena' | 'posicion' | 'funcion' | 'iguales' | 'no son isomeros';

/** Tipo de isomería estructural entre dos estructuras. */
export function tipoIsomeria(a: GrafoOrg, b: GrafoOrg): TipoIsomeria {
  if (formulaMolecularGrafo(a) !== formulaMolecularGrafo(b)) return 'no son isomeros';
  try {
    if (nombrarOrganico(a).nombre === nombrarOrganico(b).nombre) return 'iguales';
  } catch {
    /* sin nombre: se sigue con las firmas */
  }
  if (claseFuncional(a) !== claseFuncional(b)) return 'funcion';
  return firmaEsqueleto(a) === firmaEsqueleto(b) ? 'posicion' : 'cadena';
}

/** ¿Tiene isomería geométrica (cis/trans)? Cada carbono del C=C debe tener dos sustituyentes distintos. */
export function tieneIsomeriaGeometrica(g: GrafoOrg): boolean {
  const A = new Analisis(g);
  const firmaRama = (u: number, desde: number, prof = 0): string =>
    prof > 8 ? '' : `${g.atomos[u]!.el}[${A.vec[u]!.filter((v) => v.j !== desde).map((v) => `${v.orden}${firmaRama(v.j, u, prof + 1)}`).sort().join(',')}]`;
  return g.enlaces.some((e) => {
    if (e.orden !== 2 || A.el(e.a) !== 'C' || A.el(e.b) !== 'C' || (A.enAnillo(e.a) && A.enAnillo(e.b))) return false;
    const lado = (c: number, otro: number) => {
      const s = A.vec[c]!.filter((v) => v.j !== otro).map((v) => firmaRama(v.j, c));
      while (s.length < 2) s.push('H');
      return s[0] !== s[1];
    };
    return lado(e.a, e.b) && lado(e.b, e.a);
  });
}
