/**
 * Estereoquímica: prioridades de Cahn-Ingold-Prelog (CIP), configuración R/S de los centros
 * estereogénicos, E/Z de los dobles enlaces, proyecciones de Fischer y de Newman, relación entre
 * estereoisómeros y actividad óptica.
 *
 * Trabaja sobre una `Molecula` con **hidrógenos explícitos**. La geometría puede ser 3D (coordenadas
 * reales) o 2D con cuñas (campo `estereo` de los enlaces del molfile: 1 = cuña hacia el observador,
 * 6 = cuña hacia atrás, ambas partiendo del centro).
 *
 * Alcance de las reglas CIP: regla 1 (número atómico, explorando el grafo esfera por esfera, con
 * átomos duplicados en los enlaces múltiples y en los cierres de anillo). No se aplican las reglas de
 * isótopos ni las de estereodescriptores (3 a 5): si dos sustituyentes empatan, el átomo no se
 * considera centro estereogénico.
 */
import { elementoPorSimbolo } from './elements';
import { cruz, norma, pos, punto, resta, suma, escalar, unitario, vecindario, type Molecula, type Vec3 } from './molecula';
import { generarCoordenadas3D } from './coordenadas3d';

type Vecindario = ReturnType<typeof vecindario>;

// ── Prioridades CIP ─────────────────────────────────────────────────────────

/** Nodo del árbol jerárquico que se explora desde el centro. */
interface Nodo {
  atomo: number;
  /** Número atómico (0 = átomo fantasma que completa la valencia). */
  z: number;
  /** Átomo duplicado (enlace múltiple o cierre de anillo): no tiene más ramas. */
  duplicado: boolean;
  /** Átomos recorridos desde el centro hasta este nodo (para no volver atrás). */
  camino: number[];
}

const PROFUNDIDAD = 8;
const numeroAtomico = (mol: Molecula, i: number) => elementoPorSimbolo(mol.atomos[i]!.simbolo)?.z ?? 0;

/**
 * Hijos de un nodo: cada vecino (menos el padre), un duplicado por cada enlace extra de un enlace
 * múltiple y un duplicado si el vecino cierra un anillo. Se completa hasta 3 con fantasmas (Z = 0).
 */
function hijos(mol: Molecula, vec: Vecindario, n: Nodo, prof: number, memo: Map<string, number[][]>): Nodo[] {
  const fantasma = (): Nodo => ({ atomo: -1, z: 0, duplicado: true, camino: n.camino });
  if (n.duplicado) return [fantasma(), fantasma(), fantasma()];
  const padre = n.camino.at(-2);
  const lista: Nodo[] = [];
  const duplicado = (i: number): Nodo => ({ atomo: i, z: numeroAtomico(mol, i), duplicado: true, camino: n.camino });
  for (const { i, orden } of vec[n.atomo]!) {
    if (i === padre) {
      // Enlace múltiple con el padre: el padre se duplica (orden − 1) veces
      for (let k = 1; k < orden; k++) lista.push(duplicado(i));
    } else if (n.camino.includes(i)) {
      // Cierre de anillo: el átomo ya visitado cuenta como duplicado
      for (let k = 0; k < orden; k++) lista.push(duplicado(i));
    } else {
      lista.push({ atomo: i, z: numeroAtomico(mol, i), duplicado: false, camino: [...n.camino, i] });
      for (let k = 1; k < orden; k++) lista.push(duplicado(i));
    }
  }
  while (lista.length < 3) lista.push(fantasma());
  // Mayor número atómico primero; a igual Z decide lo que cada rama tenga más lejos
  return lista.sort((a, b) => b.z - a.z || compararNodos(mol, vec, b, a, prof - 1, memo));
}

/** Conjuntos de números atómicos de cada esfera de la rama que empieza en `raiz`. */
function esferas(mol: Molecula, vec: Vecindario, raiz: Nodo, prof: number, memo: Map<string, number[][]>): number[][] {
  const clave = `${raiz.camino.join('.')}|${raiz.atomo}|${raiz.duplicado ? 1 : 0}|${prof}`;
  const previo = memo.get(clave);
  if (previo) return previo;
  const resultado: number[][] = [[raiz.z]];
  let nivel = [raiz];
  for (let k = 1; k < prof; k++) {
    nivel = nivel.flatMap((n) => hijos(mol, vec, n, prof - k, memo));
    if (nivel.every((n) => n.z === 0)) break;
    resultado.push(nivel.map((n) => n.z));
  }
  memo.set(clave, resultado);
  return resultado;
}

/** > 0 si la rama `a` tiene mayor prioridad que `b`; 0 si empatan hasta la profundidad dada. */
function compararNodos(mol: Molecula, vec: Vecindario, a: Nodo, b: Nodo, prof: number, memo: Map<string, number[][]>): number {
  if (a.z !== b.z) return a.z - b.z;
  if (prof <= 1) return 0;
  const [ea, eb] = [esferas(mol, vec, a, prof, memo), esferas(mol, vec, b, prof, memo)];
  for (let k = 0; k < Math.max(ea.length, eb.length); k++) {
    const [sa, sb] = [ea[k] ?? [], eb[k] ?? []];
    for (let j = 0; j < Math.max(sa.length, sb.length); j++) {
      const d = (sa[j] ?? 0) - (sb[j] ?? 0);
      if (d !== 0) return d;
    }
  }
  return 0;
}

export interface Sustituyente {
  /** Índice del átomo unido al centro. */
  atomo: number;
  /** 1 = mayor prioridad. Los empates comparten número. */
  prioridad: number;
  /** Conjuntos de símbolos por esfera, para explicar la decisión («O», «C, H, H»…). */
  esferas: string[][];
}

const simboloDeZ = (z: number) => (z === 0 ? '∅' : (elementoPorZSeguro(z) ?? '?'));
function elementoPorZSeguro(z: number): string | undefined {
  return TABLA_Z.get(z);
}
/** Z → símbolo de los elementos habituales en química orgánica (para los textos de los pasos). */
const TABLA_Z = new Map<number, string>(
  ['H', 'B', 'C', 'N', 'O', 'F', 'Si', 'P', 'S', 'Cl', 'Br', 'I', 'Na', 'K', 'Li', 'Mg', 'Se'].map((s) => [elementoPorSimbolo(s)!.z, s]),
);

/**
 * Ordena por prioridad CIP los sustituyentes de `centro` (regla 1).
 * `excluir` deja fuera un vecino (el otro carbono de un doble enlace, para E/Z).
 */
export function prioridadesCIP(mol: Molecula, centro: number, excluir?: number): Sustituyente[] {
  const vec = vecindario(mol);
  const memo = new Map<string, number[][]>();
  const ramas = vec[centro]!.filter((v) => v.i !== excluir).map((v) => ({ atomo: v.i, z: numeroAtomico(mol, v.i), duplicado: false, camino: [centro, v.i] }) as Nodo);
  ramas.sort((a, b) => compararNodos(mol, vec, b, a, PROFUNDIDAD, memo));
  let prioridad = 0;
  return ramas.map((r, k) => {
    if (k === 0 || compararNodos(mol, vec, ramas[k - 1]!, r, PROFUNDIDAD, memo) !== 0) prioridad = k + 1;
    return { atomo: r.atomo, prioridad, esferas: esferas(mol, vec, r, PROFUNDIDAD, memo).map((e) => e.map(simboloDeZ)) };
  });
}

/** Explica por qué `a` va antes que `b`: primera esfera en la que difieren. */
export function explicarPrioridad(a: Sustituyente, b: Sustituyente): string {
  for (let k = 0; k < Math.max(a.esferas.length, b.esferas.length); k++) {
    const [sa, sb] = [a.esferas[k] ?? [], b.esferas[k] ?? []];
    if (sa.join() !== sb.join()) {
      const donde = k === 0 ? 'En el átomo unido al centro' : k === 1 ? 'Empatan en el primer átomo; en los átomos unidos a él' : `Empatan hasta la esfera ${k}; en la esfera ${k + 1}`;
      return `${donde}: (${sa.join(', ') || '∅'}) > (${sb.join(', ') || '∅'}).`;
    }
  }
  return 'Empatan con la regla 1 de CIP: los dos sustituyentes son equivalentes.';
}

// ── Centros estereogénicos y R/S ────────────────────────────────────────────

export type Descriptor = 'R' | 'S';

export interface CentroEstereo {
  atomo: number;
  /** Sustituyentes de mayor a menor prioridad. */
  sustituyentes: Sustituyente[];
  /** null si la geometría no define la configuración (2D sin cuñas). */
  descriptor: Descriptor | null;
}

/** Posición de un vecino del centro: coordenadas reales (3D) o plano + cuña (2D). */
function posicionRelativa(mol: Molecula, centro: number, vecino: number): Vec3 {
  const p = resta(pos(mol.atomos[vecino]!), pos(mol.atomos[centro]!));
  if (mol.es3D) return p;
  const e = mol.enlaces.find((x) => x.a === centro && x.b === vecino);
  // Cuña llena (1): hacia el observador (+z); cuña rayada (6): hacia atrás (−z)
  return [p[0], p[1], e?.estereo === 1 ? 1 : e?.estereo === 6 ? -1 : 0];
}

/**
 * Sentido de giro a → b → c mirando con d (menor prioridad) hacia atrás.
 * Producto mixto (a−d)·[(b−d)×(c−d)]: negativo = horario = R; positivo = antihorario = S.
 */
function sentido(a: Vec3, b: Vec3, c: Vec3, d: Vec3): Descriptor | null {
  const v = punto(resta(a, d), cruz(resta(b, d), resta(c, d)));
  if (Math.abs(v) < 1e-6) return null;
  return v < 0 ? 'R' : 'S';
}

/** Centros estereogénicos tetraédricos: átomos con cuatro sustituyentes de prioridades distintas. */
export function centrosEstereo(mol: Molecula): CentroEstereo[] {
  const vec = vecindario(mol);
  const centros: CentroEstereo[] = [];
  mol.atomos.forEach((a, i) => {
    if (!['C', 'Si', 'N', 'P', 'S'].includes(a.simbolo)) return;
    if (vec[i]!.length !== 4 || vec[i]!.some((v) => v.orden !== 1)) return;
    const sus = prioridadesCIP(mol, i);
    if (new Set(sus.map((s) => s.prioridad)).size !== 4) return;
    const [pa, pb, pc, pd] = sus.map((s) => posicionRelativa(mol, i, s.atomo)) as [Vec3, Vec3, Vec3, Vec3];
    const conGeometria = mol.es3D || mol.enlaces.some((e) => e.a === i && (e.estereo === 1 || e.estereo === 6));
    centros.push({ atomo: i, sustituyentes: sus, descriptor: conGeometria ? sentido(pa, pb, pc, pd) : null });
  });
  return centros;
}

// ── Dobles enlaces E/Z ──────────────────────────────────────────────────────

export type DescriptorDoble = 'E' | 'Z';

export interface DobleEnlaceEstereo {
  a: number;
  b: number;
  /** Sustituyentes de cada carbono, de mayor a menor prioridad. */
  sustituyentesA: Sustituyente[];
  sustituyentesB: Sustituyente[];
  descriptor: DescriptorDoble | null;
}

/** Tamaño del anillo más pequeño que contiene el enlace a–b (Infinity si no está en un anillo). */
function tamanoAnillo(vec: Vecindario, a: number, b: number): number {
  const dist = new Map<number, number>([[a, 0]]);
  const cola = [a];
  while (cola.length) {
    const x = cola.shift()!;
    for (const { i } of vec[x]!) {
      if (x === a && i === b) continue; // no usar el propio enlace
      if (dist.has(i)) continue;
      dist.set(i, dist.get(x)! + 1);
      if (i === b) return dist.get(i)! + 1;
      cola.push(i);
    }
  }
  return Infinity;
}

/**
 * Dobles enlaces con isomería E/Z: cada extremo tiene dos sustituyentes distintos.
 * Z (zusammen): los de mayor prioridad al mismo lado; E (entgegen): en lados opuestos.
 */
export function doblesEnlacesEstereo(mol: Molecula): DobleEnlaceEstereo[] {
  const vec = vecindario(mol);
  const lista: DobleEnlaceEstereo[] = [];
  for (const e of mol.enlaces) {
    if (e.orden !== 2) continue;
    if (vec[e.a]!.length !== 3 || vec[e.b]!.length !== 3) continue;
    if (tamanoAnillo(vec, e.a, e.b) < 8) continue; // en anillos pequeños solo cabe la forma Z
    const [sa, sb] = [prioridadesCIP(mol, e.a, e.b), prioridadesCIP(mol, e.b, e.a)];
    if (sa.length !== 2 || sb.length !== 2 || sa[0]!.prioridad === sa[1]!.prioridad || sb[0]!.prioridad === sb[1]!.prioridad) continue;
    let descriptor: DescriptorDoble | null = null;
    if (e.estereo !== 3) {
      // ¿Los dos sustituyentes prioritarios quedan al mismo lado del eje C=C?
      const [A, B] = [pos(mol.atomos[e.a]!), pos(mol.atomos[e.b]!)];
      const eje = resta(B, A);
      const lado = punto(cruz(eje, resta(pos(mol.atomos[sa[0]!.atomo]!), A)), cruz(eje, resta(pos(mol.atomos[sb[0]!.atomo]!), B)));
      if (Math.abs(lado) > 1e-6) descriptor = lado > 0 ? 'Z' : 'E';
    }
    lista.push({ a: e.a, b: e.b, sustituyentesA: sa, sustituyentesB: sb, descriptor });
  }
  return lista;
}

// ── Relación entre estereoisómeros ──────────────────────────────────────────

export type RelacionEstereo = 'idénticos' | 'enantiómeros' | 'diastereómeros';

/**
 * Relación entre dos estereoisómeros de la misma constitución, a partir de los descriptores de sus
 * centros (en el mismo orden). `mismoCompuesto` indica que sus estructuras canónicas coinciden
 * (así un compuesto meso escrito como R,S y como S,R se reconoce como una sola sustancia).
 */
export function relacionEstereo(a: readonly string[], b: readonly string[], mismoCompuesto: boolean): RelacionEstereo {
  if (mismoCompuesto) return 'idénticos';
  if (a.length === b.length && a.length > 0 && a.every((d, i) => d !== b[i])) return 'enantiómeros';
  return 'diastereómeros';
}

export type TipoQuiralidad = 'aquiral' | 'quiral' | 'meso';

/** Quiral si no se superpone con su imagen especular; meso si tiene centros pero sí se superpone. */
export function tipoQuiralidad(numeroCentros: number, igualASuEspejo: boolean): TipoQuiralidad {
  if (!igualASuEspejo) return 'quiral';
  return numeroCentros > 0 ? 'meso' : 'aquiral';
}

/** Número máximo de estereoisómeros: 2ⁿ (n = centros estereogénicos + dobles enlaces E/Z). */
export const maximoEstereoisomeros = (n: number) => 2 ** n;

// ── Geometría 3D que respeta la configuración ───────────────────────────────

/** Átomos de la rama que cuelga de `vecino` sin pasar por `centro` (null si vuelve al centro: anillo). */
function rama(vec: Vecindario, centro: number, vecino: number): number[] | null {
  const vistos = new Set([vecino]);
  const cola = [vecino];
  while (cola.length) {
    const x = cola.shift()!;
    for (const { i } of vec[x]!) {
      if (i === centro) {
        if (x !== vecino) return null;
        continue;
      }
      if (!vistos.has(i)) {
        vistos.add(i);
        cola.push(i);
      }
    }
  }
  return [...vistos];
}

const espejo = (mol: Molecula): Molecula => ({ ...mol, atomos: mol.atomos.map((a) => ({ ...a, x: -a.x })) });

/** Imagen especular de una molécula 3D (reflexión en el plano x = 0). */
export const imagenEspecular = espejo;

/**
 * Coordenadas 3D aproximadas que reproducen la configuración R/S indicada por las cuñas de `mol2D`.
 * El generador de geometría no conoce la quiralidad: si un centro sale invertido se intercambian dos
 * de sus sustituyentes reflejándolos en el plano que forman el centro y los otros dos.
 * `exacta` es false si algún centro o doble enlace no pudo reproducirse.
 */
export function coordenadas3DEstereo(mol2D: Molecula): { molecula: Molecula; exacta: boolean } {
  const deseados = new Map(centrosEstereo(mol2D).filter((c) => c.descriptor).map((c) => [c.atomo, c.descriptor]));
  const doblesDeseados = doblesEnlacesEstereo(mol2D);
  let m: Molecula = { ...generarCoordenadas3D(mol2D), es3D: true };
  const erroneos = (x: Molecula) => centrosEstereo(x).filter((c) => deseados.has(c.atomo) && c.descriptor !== deseados.get(c.atomo));
  // Si la mayoría de centros salió al revés, la molécula entera es la imagen especular
  if (erroneos(m).length * 2 > deseados.size) m = espejo(m);
  const vec = vecindario(m);
  const conCentro = new Set(deseados.keys());
  for (let pasada = 0; pasada < 4; pasada++) {
    const malos = erroneos(m);
    if (!malos.length) break;
    for (const c of malos) {
      // Ramas que se pueden mover: no forman anillo con el centro; primero las que no llevan otros centros
      const candidatas = vec[c.atomo]!
        .map((v) => ({ vecino: v.i, atomos: rama(vec, c.atomo, v.i) }))
        .filter((r): r is { vecino: number; atomos: number[] } => r.atomos !== null)
        .sort((p, q) => Number(p.atomos.some((i) => conCentro.has(i))) - Number(q.atomos.some((i) => conCentro.has(i))) || p.atomos.length - q.atomos.length);
      if (candidatas.length < 2) continue;
      const [r1, r2] = candidatas as [(typeof candidatas)[number], (typeof candidatas)[number]];
      const fijos = vec[c.atomo]!.map((v) => v.i).filter((i) => i !== r1.vecino && i !== r2.vecino);
      const C = pos(m.atomos[c.atomo]!);
      // Plano de reflexión: contiene al centro y a los dos sustituyentes que no se mueven
      const n = unitario(cruz(resta(pos(m.atomos[fijos[0]!]!), C), resta(pos(m.atomos[fijos[1]!]!), C)));
      if (norma(n) < 1e-6) continue;
      const mover = new Set([...r1.atomos, ...r2.atomos]);
      m = {
        ...m,
        atomos: m.atomos.map((a, i) => {
          if (!mover.has(i)) return a;
          const p = pos(a);
          const q = suma(p, escalar(n, -2 * punto(resta(p, C), n))); // p' = p − 2[(p − C)·n]n
          return { ...a, x: q[0], y: q[1], z: q[2] };
        }),
      };
    }
  }
  const dobles3D = doblesEnlacesEstereo(m);
  const doblesBien = doblesDeseados.every((d) => d.descriptor === null || dobles3D.find((x) => x.a === d.a && x.b === d.b)?.descriptor === d.descriptor);
  return { molecula: m, exacta: erroneos(m).length === 0 && doblesBien };
}

// ── Proyección de Fischer ───────────────────────────────────────────────────

/** Fórmula condensada de un sustituyente pequeño (CH3, CH2OH, CHO, COOH, OH, NH2…). */
export function textoGrupo(mol: Molecula, atomo: number, desde: number): string {
  const vec = vecindario(mol);
  const s = mol.atomos[atomo]!.simbolo;
  const otros = vec[atomo]!.filter((v) => v.i !== desde);
  const nH = otros.filter((v) => mol.atomos[v.i]!.simbolo === 'H').length;
  const H = nH === 0 ? '' : nH === 1 ? 'H' : `H${'₀₁₂₃₄'[nH]}`;
  if (s === 'H') return 'H';
  if (s !== 'C') return `${s}${H}`;
  const pesados = otros.filter((v) => mol.atomos[v.i]!.simbolo !== 'H');
  const oxoDoble = pesados.find((v) => v.orden === 2 && mol.atomos[v.i]!.simbolo === 'O');
  const hidroxilo = pesados.find((v) => v.orden === 1 && mol.atomos[v.i]!.simbolo === 'O' && vec[v.i]!.some((w) => mol.atomos[w.i]!.simbolo === 'H'));
  if (oxoDoble && hidroxilo && pesados.length === 2) return 'COOH';
  if (oxoDoble && pesados.length === 1) return 'CHO';
  if (pesados.length === 0) return `C${H}`;
  if (pesados.length === 1 && pesados[0]!.orden === 1 && mol.atomos[pesados[0]!.i]!.simbolo !== 'C') return `C${H}${textoGrupo(mol, pesados[0]!.i, atomo)}`;
  return `C${H}…`;
}

export interface FilaFischer {
  atomo: number;
  izquierda: string;
  derecha: string;
  descriptor: Descriptor | null;
}

export interface ProyeccionFischer {
  /** Carbonos de la cadena vertical, de arriba abajo. */
  cadena: number[];
  arriba: string;
  abajo: string;
  /** Carbonos intermedios con sus dos sustituyentes horizontales. */
  filas: FilaFischer[];
}

/** Estado de oxidación aproximado de un carbono: enlaces a O, N o halógenos (decide el extremo superior). */
function oxidacion(mol: Molecula, vec: Vecindario, c: number): number {
  return vec[c]!.reduce((s, v) => s + (['O', 'N', 'F', 'Cl', 'Br', 'I', 'S'].includes(mol.atomos[v.i]!.simbolo) ? v.orden : 0), 0);
}

/**
 * Proyección de Fischer: la cadena carbonada vertical (el carbono más oxidado arriba); los enlaces
 * verticales se alejan del observador y los horizontales se acercan. La posición izquierda/derecha
 * de cada sustituyente se deduce de la configuración R/S del centro. Devuelve null si no hay una
 * cadena de al menos tres carbonos que contenga todos los centros.
 */
export function proyeccionFischer(mol: Molecula): ProyeccionFischer | null {
  const vec = vecindario(mol);
  const centros = centrosEstereo(mol);
  const esC = (i: number) => mol.atomos[i]!.simbolo === 'C';
  // Camino más largo entre carbonos que pase por todos los centros (moléculas pequeñas: búsqueda directa)
  let mejor: number[] = [];
  const explorar = (camino: number[]) => {
    const ultimo = camino.at(-1)!;
    let avanzo = false;
    for (const { i } of vec[ultimo]!) {
      if (!esC(i) || camino.includes(i)) continue;
      avanzo = true;
      explorar([...camino, i]);
    }
    if (!avanzo && camino.length > mejor.length && centros.every((c) => camino.includes(c.atomo))) mejor = camino;
  };
  mol.atomos.forEach((_, i) => {
    if (esC(i) && vec[i]!.filter((v) => esC(v.i)).length === 1) explorar([i]);
  });
  if (mejor.length < 3) return null;
  let cadena = mejor;
  const [ox0, oxN] = [oxidacion(mol, vec, cadena[0]!), oxidacion(mol, vec, cadena.at(-1)!)];
  if (oxN > ox0) cadena = [...cadena].reverse();

  const filas: FilaFischer[] = [];
  for (let k = 1; k < cadena.length - 1; k++) {
    const c = cadena[k]!;
    const [arriba, abajo] = [cadena[k - 1]!, cadena[k + 1]!];
    const laterales = vec[c]!.map((v) => v.i).filter((i) => i !== arriba && i !== abajo);
    if (laterales.length !== 2) return null; // carbono con doble enlace o ramificado fuera del alcance
    let [izq, der] = laterales as [number, number];
    const centro = centros.find((x) => x.atomo === c);
    if (centro?.descriptor) {
      // Geometría de Fischer: verticales hacia atrás (z < 0), horizontales hacia delante (z > 0)
      const lugar = (i: number): Vec3 => (i === arriba ? [0, 1, -1] : i === abajo ? [0, -1, -1] : i === izq ? [-1, 0, 1] : [1, 0, 1]);
      const [a, b, d, e] = centro.sustituyentes.map((s) => lugar(s.atomo)) as [Vec3, Vec3, Vec3, Vec3];
      if (sentido(a, b, d, e) !== centro.descriptor) [izq, der] = [der, izq];
    }
    filas.push({ atomo: c, izquierda: textoGrupo(mol, izq, c), derecha: textoGrupo(mol, der, c), descriptor: centro?.descriptor ?? null });
  }
  return { cadena, arriba: textoGrupo(mol, cadena[0]!, cadena[1]!), abajo: textoGrupo(mol, cadena.at(-1)!, cadena.at(-2)!), filas };
}

/**
 * Serie D/L (azúcares y aminoácidos): en la proyección de Fischer, el centro estereogénico más alejado
 * del carbono 1 lleva el OH (o el NH₂) a la derecha en la serie D y a la izquierda en la L.
 */
export function serieDL(f: ProyeccionFischer): 'D' | 'L' | null {
  const ultima = [...f.filas].reverse().find((x) => x.descriptor);
  if (!ultima) return null;
  const hetero = (t: string) => t === 'OH' || t === 'NH₂';
  if (hetero(ultima.derecha) && !hetero(ultima.izquierda)) return 'D';
  if (hetero(ultima.izquierda) && !hetero(ultima.derecha)) return 'L';
  return null;
}

// ── Proyección de Newman ────────────────────────────────────────────────────

export interface SustituyenteNewman {
  atomo: number;
  texto: string;
  /** Ángulo en grados alrededor del eje (0° = arriba, sentido horario). */
  angulo: number;
}

export interface ProyeccionNewman {
  delante: SustituyenteNewman[];
  detras: SustituyenteNewman[];
}

/** Proyección de Newman a lo largo del enlace delante → detrás, a partir de una molécula 3D. */
export function proyeccionNewman(mol: Molecula, delante: number, detras: number): ProyeccionNewman {
  const vec = vecindario(mol);
  const [F, B] = [pos(mol.atomos[delante]!), pos(mol.atomos[detras]!)];
  const eje = unitario(resta(B, F)); // el observador mira de delante hacia detrás
  // Base perpendicular al eje, con «arriba» hacia el primer sustituyente delantero
  const primero = vec[delante]!.find((v) => v.i !== detras)!;
  const p0 = resta(pos(mol.atomos[primero.i]!), F);
  const arriba = unitario(resta(p0, escalar(eje, punto(p0, eje))));
  const derecha = cruz(arriba, eje);
  const angulo = (i: number, origen: Vec3) => {
    const p = resta(pos(mol.atomos[i]!), origen);
    const g = (Math.atan2(punto(p, derecha), punto(p, arriba)) * 180) / Math.PI;
    return Math.round(((g % 360) + 360) % 360);
  };
  const lista = (centro: number, otro: number, origen: Vec3) =>
    vec[centro]!.filter((v) => v.i !== otro).map((v) => ({ atomo: v.i, texto: textoGrupo(mol, v.i, centro), angulo: angulo(v.i, origen) }));
  return { delante: lista(delante, detras, F), detras: lista(detras, delante, B) };
}

// ── Actividad óptica ────────────────────────────────────────────────────────

/** Rotación observada (°): α = [α]·l·c, con l en dm y c en g/mL (ley de Biot). */
export const rotacionObservada = (rotacionEspecifica: number, longitudDm: number, concentracionGmL: number) => rotacionEspecifica * longitudDm * concentracionGmL;

/** Rotación específica: [α] = α / (l·c). */
export const rotacionEspecifica = (alfa: number, longitudDm: number, concentracionGmL: number) => alfa / (longitudDm * concentracionGmL);

/** Exceso enantiomérico (%): ee = 100·[α]muestra / [α]enantiómero puro. */
export const excesoEnantiomerico = (rotacionMuestra: number, rotacionPuro: number) => (100 * rotacionMuestra) / rotacionPuro;

/** Composición de la mezcla a partir del ee: % mayoritario = (100 + ee)/2; % minoritario = (100 − ee)/2. */
export function composicionEnantiomerica(ee: number): { mayoritario: number; minoritario: number } {
  const e = Math.abs(ee);
  return { mayoritario: (100 + e) / 2, minoritario: (100 - e) / 2 };
}

// ── Superposición de una molécula con su imagen especular ───────────────────

/**
 * Gira y traslada `otra` para que su átomo `centro` y sus sustituyentes `s1` y `s2` coincidan con los
 * de `base` (mismo índice de átomo en ambas). Con dos sustituyentes alineados, en un par de
 * enantiómeros los otros dos quedan intercambiados: por eso no son superponibles.
 *
 * Base ortonormal en cada molécula: e₁ hacia s1, e₂ en el plano centro–s1–s2, e₃ = e₁ × e₂.
 * Transformación (rotación propia): p′ = C_base + Σ [(p − C_otra)·fᵢ] eᵢ.
 */
export function alinearPorCentro(base: Molecula, otra: Molecula, centro: number, s1: number, s2: number): Molecula {
  const marco = (m: Molecula) => {
    const C = pos(m.atomos[centro]!);
    const e1 = unitario(resta(pos(m.atomos[s1]!), C));
    const v = resta(pos(m.atomos[s2]!), C);
    const e2 = unitario(resta(v, escalar(e1, punto(v, e1))));
    return { C, ejes: [e1, e2, cruz(e1, e2)] as [Vec3, Vec3, Vec3] };
  };
  const [A, B] = [marco(base), marco(otra)];
  return {
    ...otra,
    atomos: otra.atomos.map((a) => {
      const r = resta(pos(a), B.C);
      const q = A.ejes.reduce<Vec3>((s, e, i) => suma(s, escalar(e, punto(r, B.ejes[i]!))), A.C);
      return { ...a, x: q[0], y: q[1], z: q[2] };
    }),
  };
}
