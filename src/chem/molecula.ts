/**
 * Representación de una molécula (grafo de átomos y enlaces con coordenadas), lectura y escritura
 * de archivos MDL molfile/SDF V2000 (formato de PubChem) y geometría: distancias, ángulos y diedros.
 */

export type OrdenEnlace = 1 | 2 | 3;

export interface AtomoMol {
  simbolo: string;
  /** Carga formal. */
  carga: number;
  x: number;
  y: number;
  z: number;
}

export interface EnlaceMol {
  /** Índices (desde 0) de los átomos unidos. */
  a: number;
  b: number;
  orden: OrdenEnlace;
  /**
   * Estereoquímica del molfile (campo sss), referida al átomo `a`: 1 = cuña hacia el observador,
   * 6 = cuña hacia atrás; en un doble enlace, 3 = geometría cis/trans sin especificar.
   */
  estereo?: number;
}

export interface Molecula {
  atomos: AtomoMol[];
  enlaces: EnlaceMol[];
  /** true si las coordenadas son 3D (z no nulas). */
  es3D: boolean;
}

// ── Molfile V2000 ───────────────────────────────────────────────────────────

/** Código de carga del bloque de átomos V2000 (campo ccc): 1 = +3, 2 = +2, 3 = +1, 5 = −1, 6 = −2, 7 = −3. */
const CARGA_V2000: Record<number, number> = { 1: 3, 2: 2, 3: 1, 5: -1, 6: -2, 7: -3 };

/** Lee un molfile V2000 (o el primer registro de un SDF). */
export function parsearMolfile(texto: string): Molecula {
  const lineas = texto.replace(/\r/g, '').split('\n');
  // La línea de conteos es la 4.ª (índice 3): «aaabbb … V2000»
  const conteos = lineas[3];
  if (!conteos || !/V2000/.test(conteos)) throw new Error('Formato no soportado: se esperaba un molfile V2000.');
  const nAtomos = Number(conteos.slice(0, 3));
  const nEnlaces = Number(conteos.slice(3, 6));
  const atomos: AtomoMol[] = [];
  for (let i = 0; i < nAtomos; i++) {
    const l = lineas[4 + i] ?? '';
    const ccc = Number(l.slice(36, 39)) || 0;
    atomos.push({
      x: Number(l.slice(0, 10)),
      y: Number(l.slice(10, 20)),
      z: Number(l.slice(20, 30)),
      simbolo: l.slice(31, 34).trim(),
      carga: CARGA_V2000[ccc] ?? 0,
    });
  }
  const enlaces: EnlaceMol[] = [];
  for (let i = 0; i < nEnlaces; i++) {
    const l = lineas[4 + nAtomos + i] ?? '';
    const tipo = Number(l.slice(6, 9));
    // Tipo 4 (aromático) se trata como 1,5 → se guarda como 1 (PubChem usa la forma de Kekulé)
    const sss = Number(l.slice(9, 12)) || 0;
    enlaces.push({ a: Number(l.slice(0, 3)) - 1, b: Number(l.slice(3, 6)) - 1, orden: (tipo >= 1 && tipo <= 3 ? tipo : 1) as OrdenEnlace, ...(sss ? { estereo: sss } : {}) });
  }
  // Si hay líneas «M  CHG», reemplazan por completo al campo ccc de todos los átomos (especificación V2000)
  const propiedades = lineas.slice(4 + nAtomos + nEnlaces);
  const fin = propiedades.findIndex((l) => l.startsWith('M  END'));
  const lineasCHG = propiedades.slice(0, fin < 0 ? undefined : fin).filter((l) => l.startsWith('M  CHG'));
  if (lineasCHG.length) for (const a of atomos) a.carga = 0;
  for (const l of lineasCHG) {
    const n = Number(l.slice(6, 9));
    for (let k = 0; k < n; k++) {
      const idx = Number(l.slice(10 + 8 * k, 13 + 8 * k)) - 1;
      const q = Number(l.slice(14 + 8 * k, 17 + 8 * k));
      if (atomos[idx]) atomos[idx]!.carga = q;
    }
  }
  // La línea 2 indica la dimensión (columnas 21–22: «2D» o «3D»); las moléculas lineales o planas
  // tienen z = 0 aunque sean 3D, así que solo se usa z como respaldo
  const dimension = (lineas[1] ?? '').slice(20, 22);
  const es3D = dimension === '3D' || (dimension !== '2D' && atomos.some((a) => Math.abs(a.z) > 1e-4));
  return { atomos, enlaces, es3D };
}

const f10 = (v: number) => v.toFixed(4).padStart(10);
const i3 = (v: number) => String(v).padStart(3);

/** Escribe un molfile V2000 (para pasar estructuras a RDKit). */
export function escribirMolfile(mol: Molecula, titulo = ''): string {
  const l: string[] = [titulo, '  QuimicaInteractiva', ''];
  l.push(`${i3(mol.atomos.length)}${i3(mol.enlaces.length)}  0  0  0  0  0  0  0  0999 V2000`);
  for (const a of mol.atomos) l.push(`${f10(a.x)}${f10(a.y)}${f10(a.z)} ${a.simbolo.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`);
  for (const e of mol.enlaces) l.push(`${i3(e.a + 1)}${i3(e.b + 1)}${i3(e.orden)}  0  0  0  0`);
  const cargadas = mol.atomos.map((a, i) => [i, a.carga] as const).filter(([, q]) => q !== 0);
  for (let k = 0; k < cargadas.length; k += 8) {
    const grupo = cargadas.slice(k, k + 8);
    l.push(`M  CHG${i3(grupo.length)}${grupo.map(([i, q]) => ` ${i3(i + 1)} ${i3(q)}`).join('')}`);
  }
  l.push('M  END');
  return l.join('\n') + '\n';
}

// ── Consultas sobre el grafo ────────────────────────────────────────────────

/** Vecinos de cada átomo: lista de { índice, orden }. */
export function vecindario(mol: Molecula): { i: number; orden: OrdenEnlace }[][] {
  const v: { i: number; orden: OrdenEnlace }[][] = mol.atomos.map(() => []);
  for (const e of mol.enlaces) {
    v[e.a]!.push({ i: e.b, orden: e.orden });
    v[e.b]!.push({ i: e.a, orden: e.orden });
  }
  return v;
}

/** Fórmula molecular de Hill a partir de los átomos (con carga neta): «C2H6O», «NO3-». */
export function formulaDeMolecula(mol: Molecula): string {
  const cuenta = new Map<string, number>();
  for (const a of mol.atomos) cuenta.set(a.simbolo, (cuenta.get(a.simbolo) ?? 0) + 1);
  const conC = cuenta.has('C');
  const orden = [...cuenta.keys()].sort((a, b) => {
    if (conC) {
      const p = (s: string) => (s === 'C' ? 0 : s === 'H' ? 1 : 2);
      if (p(a) !== p(b)) return p(a) - p(b);
    }
    return a.localeCompare(b, 'en');
  });
  const carga = mol.atomos.reduce((s, a) => s + a.carga, 0);
  const cuerpo = orden.map((s) => s + (cuenta.get(s)! > 1 ? cuenta.get(s) : '')).join('');
  if (carga === 0) return cuerpo;
  return `${cuerpo}${carga > 0 ? '+' : '-'}${Math.abs(carga) > 1 ? Math.abs(carga) : ''}`;
}

// ── Geometría ───────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number];

export const pos = (a: AtomoMol): Vec3 => [a.x, a.y, a.z];
export const resta = (p: Vec3, q: Vec3): Vec3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
export const suma = (p: Vec3, q: Vec3): Vec3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
export const escalar = (p: Vec3, k: number): Vec3 => [p[0] * k, p[1] * k, p[2] * k];
export const punto = (p: Vec3, q: Vec3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
export const cruz = (p: Vec3, q: Vec3): Vec3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
export const norma = (p: Vec3) => Math.hypot(p[0], p[1], p[2]);
export const unitario = (p: Vec3): Vec3 => {
  const n = norma(p);
  return n === 0 ? [0, 0, 0] : [p[0] / n, p[1] / n, p[2] / n];
};

/** Distancia entre dos puntos (en las unidades de las coordenadas; PubChem usa Å). */
export const distancia = (p: Vec3, q: Vec3) => norma(resta(p, q));

/** Ángulo A–B–C con vértice en B, en grados:  cos θ = (BA · BC) / (|BA||BC|) */
export function angulo(a: Vec3, b: Vec3, c: Vec3): number {
  const u = resta(a, b), v = resta(c, b);
  const cos = punto(u, v) / (norma(u) * norma(v));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/**
 * Ángulo diedro A–B–C–D en grados (−180, 180]: ángulo entre los planos ABC y BCD.
 * Convención IUPAC: positivo si, mirando de B a C, A gira en sentido horario para coincidir con D.
 *   φ = atan2(|b₂|·b₁·(b₂×b₃), (b₁×b₂)·(b₂×b₃))
 */
export function diedro(a: Vec3, b: Vec3, c: Vec3, d: Vec3): number {
  const b1 = resta(b, a), b2 = resta(c, b), b3 = resta(d, c);
  const n1 = cruz(b1, b2), n2 = cruz(b2, b3);
  return (Math.atan2(norma(b2) * punto(b1, n2), punto(n1, n2)) * 180) / Math.PI;
}

/** Centroide de las posiciones. */
export function centroide(puntos: Vec3[]): Vec3 {
  const s = puntos.reduce((acc, p) => suma(acc, p), [0, 0, 0] as Vec3);
  return escalar(s, 1 / Math.max(1, puntos.length));
}
