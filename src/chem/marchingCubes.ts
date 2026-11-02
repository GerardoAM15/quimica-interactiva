/**
 * Marching cubes (Lorensen y Cline, 1987): extrae la isosuperficie f(x, y, z) = iso de un campo
 * escalar muestreado en una cuadrícula regular. Se usan las tablas clásicas de Paul Bourke
 * (las mismas que trae three.js), con su convención de vértices y aristas:
 *
 *   vértices: 0 (0,0,0) 1 (1,0,0) 2 (1,1,0) 3 (0,1,0) 4 (0,0,1) 5 (1,0,1) 6 (1,1,1) 7 (0,1,1)
 *   aristas:  0:0-1 1:1-2 2:2-3 3:3-0 4:4-5 5:5-6 6:6-7 7:7-4 8:0-4 9:1-5 10:2-6 11:3-7
 *
 * Función pura: no depende de WebGL; devuelve arreglos de posiciones y normales.
 */
import { edgeTable as tablaAristasCruda, triTable as tablaTriangulosCruda } from 'three/examples/jsm/objects/MarchingCubes.js';

// Los tipos de @types/three declaran Int32Array[], pero son arreglos planos.
const tablaAristas = tablaAristasCruda as unknown as Int32Array;
const tablaTriangulos = tablaTriangulosCruda as unknown as Int32Array;

export interface Campo3D {
  valores: Float32Array;
  /** Puntos por eje. */
  nx: number;
  ny: number;
  nz: number;
  /** Coordenada del punto (0, 0, 0). */
  origen: [number, number, number];
  /** Separación entre puntos. */
  paso: number;
}

export interface Malla {
  posiciones: Float32Array;
  normales: Float32Array;
  numTriangulos: number;
}

const ESQUINAS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
] as const;
const ARISTAS = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
] as const;

/** Muestrea f(x, y, z) en una cuadrícula cúbica de n³ puntos en [−L, L]³. */
export function muestrearCampo(f: (x: number, y: number, z: number) => number, n: number, L: number): Campo3D {
  const valores = new Float32Array(n * n * n);
  const paso = (2 * L) / (n - 1);
  let idx = 0;
  for (let k = 0; k < n; k++) {
    const z = -L + k * paso;
    for (let j = 0; j < n; j++) {
      const y = -L + j * paso;
      for (let i = 0; i < n; i++) valores[idx++] = f(-L + i * paso, y, z);
    }
  }
  return { valores, nx: n, ny: n, nz: n, origen: [-L, -L, -L], paso };
}

/**
 * Extrae la superficie donde el campo vale `iso`. La región «interior» es la de valores > iso;
 * las normales apuntan hacia afuera (−∇f normalizado). Para `signo = -1` se usa −f
 * (útil para el lóbulo negativo de un orbital).
 */
export function marchingCubes(campo: Campo3D, iso: number, signo: 1 | -1 = 1): Malla {
  const { valores, nx, ny, nz, origen, paso } = campo;
  const val = (i: number, j: number, k: number) => signo * valores[i + nx * (j + ny * k)]!;

  // Gradiente por diferencias centrales (unilaterales en el borde)
  const grad = (i: number, j: number, k: number): [number, number, number] => {
    const d = (a: number, b: number, h: number) => (a - b) / h;
    const gx = d(val(Math.min(i + 1, nx - 1), j, k), val(Math.max(i - 1, 0), j, k), (i > 0 && i < nx - 1 ? 2 : 1) * paso);
    const gy = d(val(i, Math.min(j + 1, ny - 1), k), val(i, Math.max(j - 1, 0), k), (j > 0 && j < ny - 1 ? 2 : 1) * paso);
    const gz = d(val(i, j, Math.min(k + 1, nz - 1)), val(i, j, Math.max(k - 1, 0)), (k > 0 && k < nz - 1 ? 2 : 1) * paso);
    return [gx, gy, gz];
  };

  const pos: number[] = [];
  const nor: number[] = [];
  const vertArista = new Float32Array(12 * 3);
  const normArista = new Float32Array(12 * 3);
  const v = new Float32Array(8);

  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let indiceCubo = 0;
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = ESQUINAS[c]!;
          v[c] = val(i + di, j + dj, k + dk);
          // Convención de Bourke: el bit se activa si el vértice está «fuera» (valor < iso)
          if (v[c]! < iso) indiceCubo |= 1 << c;
        }
        const bits = tablaAristas[indiceCubo]!;
        if (bits === 0) continue;

        for (let a = 0; a < 12; a++) {
          if (!(bits & (1 << a))) continue;
          const [c1, c2] = ARISTAS[a]!;
          const v1 = v[c1]!, v2 = v[c2]!;
          // Interpolación lineal del punto donde f = iso sobre la arista
          const t = Math.abs(v2 - v1) < 1e-12 ? 0.5 : (iso - v1) / (v2 - v1);
          const p1 = ESQUINAS[c1]!, p2 = ESQUINAS[c2]!;
          const g1 = grad(i + p1[0], j + p1[1], k + p1[2]);
          const g2 = grad(i + p2[0], j + p2[1], k + p2[2]);
          for (let e = 0; e < 3; e++) {
            vertArista[a * 3 + e] = origen[e]! + paso * ([i, j, k][e]! + p1[e]! + t * (p2[e]! - p1[e]!));
            normArista[a * 3 + e] = -(g1[e]! + t * (g2[e]! - g1[e]!));
          }
        }

        const base = indiceCubo * 16;
        for (let t = 0; tablaTriangulos[base + t] !== -1; t += 3) {
          // Con la convención de Bourke (bit = vértice fuera) el orden 0-1-2 deja las caras hacia afuera
          for (let o = 0; o < 3; o++) {
            const a = tablaTriangulos[base + t + o]!;
            pos.push(vertArista[a * 3]!, vertArista[a * 3 + 1]!, vertArista[a * 3 + 2]!);
            const nx_ = normArista[a * 3]!, ny_ = normArista[a * 3 + 1]!, nz_ = normArista[a * 3 + 2]!;
            const largo = Math.hypot(nx_, ny_, nz_) || 1;
            nor.push(nx_ / largo, ny_ / largo, nz_ / largo);
          }
        }
      }
    }
  }
  return { posiciones: new Float32Array(pos), normales: new Float32Array(nor), numTriangulos: pos.length / 9 };
}

/** Área total de la malla (para pruebas). */
export function areaMalla(m: Malla): number {
  let area = 0;
  const p = m.posiciones;
  for (let t = 0; t < p.length; t += 9) {
    const ux = p[t + 3]! - p[t]!, uy = p[t + 4]! - p[t + 1]!, uz = p[t + 5]! - p[t + 2]!;
    const vx = p[t + 6]! - p[t]!, vy = p[t + 7]! - p[t + 1]!, vz = p[t + 8]! - p[t + 2]!;
    area += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
  }
  return area;
}
