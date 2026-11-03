/**
 * Generación de coordenadas 3D aproximadas a partir de un grafo molecular con coordenadas 2D
 * (por ejemplo, las que produce RDKit). Se usa cuando PubChem no tiene un conformero 3D o para
 * moléculas dibujadas en el constructor.
 *
 * Método: restricciones de distancia iteradas (dinámica basada en posiciones):
 *  - enlaces: d₀ = r_cov(A) + r_cov(B), acortada para dobles (×0,87) y triples (×0,78);
 *  - ángulos VSEPR: distancia 1-3 por la ley de cosenos  d₁₃² = a² + b² − 2ab·cos θ;
 *  - dobles enlaces planos: distancia 1-4 cis o trans tomada de la disposición 2D;
 *  - repulsión entre átomos no enlazados.
 * Es una geometría aproximada (no considera estereoquímica ni conformaciones de mínima energía).
 */
import { analizarAtomo, direccionesDominios } from './vsepr';
import { vecindario, type Molecula, type Vec3 } from './molecula';
import { elementoPorSimbolo } from './elements';

/** Radios covalentes (Å). Fuente: B. Cordero et al., Dalton Trans. 2008, 2832 (C: valor sp³). */
export const RADIO_COVALENTE: Record<string, number> = {
  H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66, F: 0.57, Ne: 0.58,
  Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, Ar: 1.06, K: 2.03, Ca: 1.76,
  Ga: 1.22, Ge: 1.2, As: 1.19, Se: 1.2, Br: 1.2, Kr: 1.16, Sn: 1.39, Sb: 1.39, Te: 1.38, I: 1.39, Xe: 1.4,
};

const radio = (s: string) => RADIO_COVALENTE[s] ?? 1.3;
const FACTOR_ORDEN = { 1: 1, 2: 0.87, 3: 0.78 } as const;

/** Longitud de enlace estimada (Å). */
export const longitudEnlace = (a: string, b: string, orden: 1 | 2 | 3 = 1) => (radio(a) + radio(b)) * FACTOR_ORDEN[orden];

interface Restriccion {
  i: number;
  j: number;
  d: number;
  /** Rigidez (0–1). */
  k: number;
  /** Solo empuja si están más cerca que d. */
  soloRepulsion?: boolean;
}

/** Generador pseudoaleatorio determinista (mismo resultado en cada ejecución). */
function aleatorio(semilla: number) {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/**
 * Moléculas «estrella» (un átomo central unido a todos los demás átomos pesados; los H pueden estar
 * en el central o en un O terminal, como en los oxoácidos): geometría VSEPR exacta. Devuelve null si
 * la molécula no tiene esa forma.
 */
export function geometriaEstrella(mol: Molecula): Molecula | null {
  const n = mol.atomos.length;
  if (n < 2) return null;
  const vec = vecindario(mol);
  const pesados = mol.atomos.map((_, i) => i).filter((i) => mol.atomos[i]!.simbolo !== 'H');
  const centro = [...pesados].sort((a, b) => vec[b]!.length - vec[a]!.length)[0] ?? 0;
  const ligandos = vec[centro]!;
  // Todos los átomos deben estar unidos al centro o ser el H de un grupo OH/SH terminal
  for (let i = 0; i < n; i++) {
    if (i === centro || ligandos.some((x) => x.i === i)) continue;
    const a = mol.atomos[i]!;
    if (a.simbolo !== 'H' || vec[i]!.length !== 1) return null;
    const portador = vec[i]![0]!.i;
    if (!ligandos.some((x) => x.i === portador)) return null;
    if (!['O', 'S'].includes(mol.atomos[portador]!.simbolo) || vec[portador]!.length !== 2) return null;
  }
  if (ligandos.some((x) => vec[x.i]!.some((y) => y.i !== centro && mol.atomos[y.i]!.simbolo !== 'H'))) return null;

  const an = analizarAtomo(mol, centro, vec);
  if (an.dominios < 2 || an.dominios > 6) return null;
  const dirs = direccionesDominios(an.dominios, an.paresLibres);
  const EN = (i: number) => elementoPorSimbolo(mol.atomos[i]!.simbolo)?.electronegatividad ?? 2.2;
  // Regla de Bent: en la bipirámide, los ligandos más electronegativos van a las posiciones axiales
  const orden = an.dominios === 5 ? [...ligandos].sort((a, b) => EN(b.i) - EN(a.i)) : ligandos;
  const P: Vec3[] = mol.atomos.map(() => [0, 0, 0]);
  orden.forEach((x, k) => {
    const d = dirs[k] ?? dirs[0]!;
    const L = longitudEnlace(mol.atomos[centro]!.simbolo, mol.atomos[x.i]!.simbolo, x.orden);
    P[x.i] = [d[0] * L, d[1] * L, d[2] * L];
    // H de un grupo OH terminal: a 0,96 Å, formando ~109,5° con el enlace al centro
    vec[x.i]!.filter((y) => y.i !== centro).forEach((y, j) => {
      const u = d;
      const ref: Vec3 = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
      const perp: Vec3 = [u[1] * ref[2] - u[2] * ref[1], u[2] * ref[0] - u[0] * ref[2], u[0] * ref[1] - u[1] * ref[0]];
      const np = Math.hypot(...perp) || 1;
      const ang = (70.5 * Math.PI) / 180;
      const s = j % 2 ? -1 : 1;
      const LH = longitudEnlace(mol.atomos[x.i]!.simbolo, 'H');
      P[y.i] = [
        P[x.i]![0] + LH * (Math.cos(ang) * u[0] + (s * Math.sin(ang) * perp[0]) / np),
        P[x.i]![1] + LH * (Math.cos(ang) * u[1] + (s * Math.sin(ang) * perp[1]) / np),
        P[x.i]![2] + LH * (Math.cos(ang) * u[2] + (s * Math.sin(ang) * perp[2]) / np),
      ];
    });
  });
  return { atomos: mol.atomos.map((a, i) => ({ ...a, x: P[i]![0], y: P[i]![1], z: P[i]![2] })), enlaces: mol.enlaces.map((e) => ({ ...e })), es3D: true };
}

/** true si algún átomo tiene 5 o 6 dominios (los conformeros de campos de fuerzas suelen fallar en estos casos). */
export function esHipervalente(mol: Molecula): boolean {
  const vec = vecindario(mol);
  return mol.atomos.some((_, i) => analizarAtomo(mol, i, vec).dominios >= 5);
}

export function generarCoordenadas3D(mol: Molecula, { iteraciones = 600 } = {}): Molecula {
  const estrella = geometriaEstrella(mol);
  if (estrella) return estrella;
  const n = mol.atomos.length;
  const vec = vecindario(mol);
  const azar = aleatorio(n * 7919 + mol.enlaces.length);
  const P: Vec3[] = mol.atomos.map((a) => [a.x, a.y, (azar() - 0.5) * 0.6]);

  // Escalar la 2D para que los enlaces tengan longitudes razonables
  if (mol.enlaces.length) {
    let suma2D = 0, sumaIdeal = 0;
    for (const e of mol.enlaces) {
      const [p, q] = [P[e.a]!, P[e.b]!];
      suma2D += Math.hypot(p[0] - q[0], p[1] - q[1]);
      sumaIdeal += longitudEnlace(mol.atomos[e.a]!.simbolo, mol.atomos[e.b]!.simbolo, e.orden);
    }
    const f = suma2D > 0 ? sumaIdeal / suma2D : 1;
    for (const p of P) {
      p[0] *= f;
      p[1] *= f;
    }
  }

  const restricciones: Restriccion[] = [];
  const unidos = new Set<string>();
  const clave = (i: number, j: number) => (i < j ? `${i},${j}` : `${j},${i}`);
  // 1) Enlaces
  for (const e of mol.enlaces) {
    restricciones.push({ i: e.a, j: e.b, d: longitudEnlace(mol.atomos[e.a]!.simbolo, mol.atomos[e.b]!.simbolo, e.orden), k: 1 });
    unidos.add(clave(e.a, e.b));
  }
  // 2) Ángulos (distancias 1-3)
  const separados13 = new Set<string>();
  for (let c = 0; c < n; c++) {
    const v = vec[c]!;
    if (v.length < 2) continue;
    const an = analizarAtomo(mol, c, vec);
    const largo = (x: { i: number; orden: 1 | 2 | 3 }) => longitudEnlace(mol.atomos[c]!.simbolo, mol.atomos[x.i]!.simbolo, x.orden);
    if (an.dominios >= 5) {
      // Hipervalentes: se siembran las posiciones ideales VSEPR y se fijan todas las distancias 1-3
      const dirs = direccionesDominios(an.dominios, an.paresLibres);
      v.forEach((x, k) => {
        const d = dirs[k]!;
        const L = largo(x);
        if (vec[x.i]!.length === 1) P[x.i] = [P[c]![0] + d[0] * L, P[c]![1] + d[1] * L, P[c]![2] + d[2] * L];
      });
      for (let p = 0; p < v.length; p++) {
        for (let q = p + 1; q < v.length; q++) {
          const cos = dirs[p]![0] * dirs[q]![0] + dirs[p]![1] * dirs[q]![1] + dirs[p]![2] * dirs[q]![2];
          const a = largo(v[p]!), b = largo(v[q]!);
          restricciones.push({ i: v[p]!.i, j: v[q]!.i, d: Math.sqrt(a * a + b * b - 2 * a * b * cos), k: 0.6 });
          separados13.add(clave(v[p]!.i, v[q]!.i));
        }
      }
      continue;
    }
    const theta = an.dominios === 2 ? 180 : an.dominios === 3 ? 120 : 109.47;
    const cos = Math.cos((theta * Math.PI) / 180);
    for (let p = 0; p < v.length; p++) {
      for (let q = p + 1; q < v.length; q++) {
        const a = largo(v[p]!), b = largo(v[q]!);
        restricciones.push({ i: v[p]!.i, j: v[q]!.i, d: Math.sqrt(a * a + b * b - 2 * a * b * cos), k: 0.5 });
        separados13.add(clave(v[p]!.i, v[q]!.i));
      }
    }
  }
  // 3) Dobles enlaces planos: distancia 1-4 cis/trans según la 2D (ángulos de 120°)
  for (const e of mol.enlaces) {
    if (e.orden !== 2) continue;
    for (const x of vec[e.a]!) {
      if (x.i === e.b) continue;
      for (const y of vec[e.b]!) {
        if (y.i === e.a || y.i === x.i) continue;
        const A = mol.atomos[e.a]!, B = mol.atomos[e.b]!;
        // ¿x e y del mismo lado del eje A=B en la 2D? (signo del producto cruz)
        const lado = (p: { x: number; y: number }) => (B.x - A.x) * (p.y - A.y) - (B.y - A.y) * (p.x - A.x);
        const cis = lado(mol.atomos[x.i]!) * lado(mol.atomos[y.i]!) > 0;
        const dAB = longitudEnlace(A.simbolo, B.simbolo, 2);
        const dAX = longitudEnlace(A.simbolo, mol.atomos[x.i]!.simbolo, x.orden);
        const dBY = longitudEnlace(B.simbolo, mol.atomos[y.i]!.simbolo, y.orden);
        // Geometría plana con ángulos de 120°: coordenadas en el plano
        const px = [-dAX * Math.cos(Math.PI / 3), dAX * Math.sin(Math.PI / 3)];
        const py = [dAB + dBY * Math.cos(Math.PI / 3), (cis ? 1 : -1) * dBY * Math.sin(Math.PI / 3)];
        restricciones.push({ i: x.i, j: y.i, d: Math.hypot(py[0]! - px[0]!, py[1]! - px[1]!), k: 0.3 });
        separados13.add(clave(x.i, y.i));
      }
    }
  }
  // 4) Repulsión entre no enlazados
  const radioVdW = (s: string) => (elementoPorSimbolo(s)?.radioVdW ?? 170) / 100;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const k = clave(i, j);
      if (unidos.has(k) || separados13.has(k)) continue;
      restricciones.push({ i, j, d: 0.72 * (radioVdW(mol.atomos[i]!.simbolo) + radioVdW(mol.atomos[j]!.simbolo)), k: 0.25, soloRepulsion: true });
    }
  }

  // Iteración: cada restricción mueve a sus dos átomos la mitad de la corrección (ponderada por k)
  for (let it = 0; it < iteraciones; it++) {
    const relajacion = it < iteraciones * 0.2 ? 0.6 : 1;
    for (const r of restricciones) {
      const p = P[r.i]!, q = P[r.j]!;
      const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
      let d = Math.hypot(dx, dy, dz);
      if (r.soloRepulsion && d >= r.d) continue;
      if (d < 1e-6) {
        q[2] += 0.05;
        d = 0.05;
      }
      const c = ((d - r.d) / d) * 0.5 * r.k * relajacion;
      p[0] += dx * c; p[1] += dy * c; p[2] += dz * c;
      q[0] -= dx * c; q[1] -= dy * c; q[2] -= dz * c;
    }
  }

  // Centrar en el origen
  const cen = P.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n, s[2] + p[2] / n] as Vec3, [0, 0, 0] as Vec3);
  return {
    atomos: mol.atomos.map((a, i) => ({ ...a, x: P[i]![0] - cen[0], y: P[i]![1] - cen[1], z: P[i]![2] - cen[2] })),
    enlaces: mol.enlaces.map((e) => ({ ...e })),
    es3D: true,
  };
}
