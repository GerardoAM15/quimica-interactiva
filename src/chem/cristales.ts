/**
 * Redes cristalinas: generación de la celda unitaria y propiedades geométricas.
 *
 * Aporte de cada átomo a la celda cúbica según su posición:
 *   vértice 1/8 · arista 1/4 · cara 1/2 · interior 1
 * Factor de empaquetamiento atómico: FEA = (átomos por celda · 4/3·π·r³) / V_celda
 */

export type TipoRed = 'sc' | 'bcc' | 'fcc' | 'hcp' | 'diamante' | 'grafito';
export type TipoRedIonica = 'NaCl' | 'CsCl' | 'CaF2' | 'ZnS';

export interface InfoRed {
  nombre: string;
  /** Átomos por celda unitaria convencional. */
  atomosPorCelda: number;
  /** Número de coordinación (vecinos más cercanos). */
  coordinacion: number;
  /** Factor de empaquetamiento ideal (esferas en contacto). */
  empaquetamiento: number;
  /** Relación entre el radio atómico y la arista a (esferas en contacto). */
  relacionRadio: string;
  /** r en función de a (y c para hcp, no aplicable). */
  radioDesdeArista?: (a: number) => number;
  ejemplos: string;
}

export const INFO_REDES: Record<TipoRed, InfoRed> = {
  sc: {
    nombre: 'Cúbica simple',
    atomosPorCelda: 1,
    coordinacion: 6,
    empaquetamiento: Math.PI / 6, // 0,524
    relacionRadio: 'a = 2r',
    radioDesdeArista: (a) => a / 2,
    ejemplos: 'Po (polonio α)',
  },
  bcc: {
    nombre: 'Cúbica centrada en el cuerpo',
    atomosPorCelda: 2,
    coordinacion: 8,
    empaquetamiento: (Math.PI * Math.sqrt(3)) / 8, // 0,680
    relacionRadio: 'a = 4r/√3 (contacto en la diagonal del cubo)',
    radioDesdeArista: (a) => (a * Math.sqrt(3)) / 4,
    ejemplos: 'Fe α, Cr, W, Na, K',
  },
  fcc: {
    nombre: 'Cúbica centrada en las caras',
    atomosPorCelda: 4,
    coordinacion: 12,
    empaquetamiento: Math.PI / (3 * Math.SQRT2), // 0,740
    relacionRadio: 'a = 2√2·r (contacto en la diagonal de la cara)',
    radioDesdeArista: (a) => a / (2 * Math.SQRT2),
    ejemplos: 'Cu, Al, Ag, Au, Ni, Pb',
  },
  hcp: {
    nombre: 'Hexagonal compacta',
    atomosPorCelda: 6,
    coordinacion: 12,
    empaquetamiento: Math.PI / (3 * Math.SQRT2), // 0,740 (ideal, c/a = √(8/3))
    relacionRadio: 'a = 2r; c/a ideal = √(8/3) ≈ 1,633',
    radioDesdeArista: (a) => a / 2,
    ejemplos: 'Mg, Zn, Ti, Co',
  },
  diamante: {
    nombre: 'Tipo diamante',
    atomosPorCelda: 8,
    coordinacion: 4,
    empaquetamiento: (Math.PI * Math.sqrt(3)) / 16, // 0,340
    relacionRadio: 'a = 8r/√3 (enlace a lo largo de 1/4 de la diagonal)',
    radioDesdeArista: (a) => (a * Math.sqrt(3)) / 8,
    ejemplos: 'C (diamante), Si, Ge',
  },
  grafito: {
    nombre: 'Grafito (capas hexagonales)',
    atomosPorCelda: 4,
    coordinacion: 3,
    empaquetamiento: NaN,
    relacionRadio: 'C–C = a/√3 ≈ 142 pm dentro de la capa; capas separadas c/2 ≈ 335 pm',
    ejemplos: 'C (grafito)',
  },
};

export interface SitioRed {
  /** Coordenadas en pm. */
  posicion: [number, number, number];
  /** Especie (símbolo) o índice de subred. */
  especie: string;
  /** Fracción del átomo que pertenece a la celda (1/8, 1/4, 1/2, 1). */
  aporte: number;
}

/** Aporte de un punto en coordenadas fraccionarias: 1/2 por cada coordenada en 0 o 1. */
export function aporteFraccionario(f: [number, number, number]): number {
  const enBorde = f.filter((x) => Math.abs(x) < 1e-9 || Math.abs(x - 1) < 1e-9).length;
  return 1 / 2 ** enBorde;
}

/** Todas las imágenes de un punto fraccionario dentro de [0, 1]³ (vértices, aristas, caras). */
function imagenesEnCelda(f: [number, number, number]): [number, number, number][] {
  const opciones = f.map((x) => {
    const v = ((x % 1) + 1) % 1;
    return Math.abs(v) < 1e-9 ? [0, 1] : [v];
  });
  const res: [number, number, number][] = [];
  for (const x of opciones[0]!) for (const y of opciones[1]!) for (const z of opciones[2]!) res.push([x, y, z]);
  return res;
}

const BASE_FCC: [number, number, number][] = [
  [0, 0, 0],
  [0.5, 0.5, 0],
  [0.5, 0, 0.5],
  [0, 0.5, 0.5],
];

/** Genera una celda cúbica a partir de una base fraccionaria: [especie, posición][] */
function celdaCubica(a: number, base: [string, [number, number, number]][]): SitioRed[] {
  const sitios: SitioRed[] = [];
  const vistos = new Set<string>();
  for (const [especie, f] of base) {
    for (const p of imagenesEnCelda(f)) {
      const k = `${especie}:${p.map((x) => x.toFixed(4)).join(',')}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      sitios.push({ especie, aporte: aporteFraccionario(p), posicion: [p[0] * a, p[1] * a, p[2] * a] });
    }
  }
  return sitios;
}

const conEspecie = (especie: string, lista: [number, number, number][]) =>
  lista.map((f) => [especie, f] as [string, [number, number, number]]);

/** Celda unitaria convencional de un elemento (posiciones en pm, centrada en el origen). */
export function celdaElemento(red: TipoRed, a: number, c?: number, especie = 'X'): SitioRed[] {
  let sitios: SitioRed[];
  switch (red) {
    case 'sc':
      sitios = celdaCubica(a, conEspecie(especie, [[0, 0, 0]]));
      break;
    case 'bcc':
      sitios = celdaCubica(a, conEspecie(especie, [[0, 0, 0], [0.5, 0.5, 0.5]]));
      break;
    case 'fcc':
      sitios = celdaCubica(a, conEspecie(especie, BASE_FCC));
      break;
    case 'diamante':
      // fcc + la misma red desplazada (1/4, 1/4, 1/4): 4 de los 8 huecos tetraédricos
      sitios = celdaCubica(a, conEspecie(especie, [...BASE_FCC, ...BASE_FCC.map(desplazarCuarto)]));
      break;
    case 'hcp':
      return celdaHexagonal(a, c ?? a * Math.sqrt(8 / 3), especie);
    case 'grafito':
      return capasGrafito(a, c ?? 671.1, especie);
  }
  return centrar(sitios, [a / 2, a / 2, a / 2]);
}

const desplazarCuarto = (f: [number, number, number]): [number, number, number] => [f[0] + 0.25, f[1] + 0.25, f[2] + 0.25];

function centrar(sitios: SitioRed[], centro: [number, number, number]): SitioRed[] {
  return sitios.map((s) => ({ ...s, posicion: [s.posicion[0] - centro[0], s.posicion[1] - centro[1], s.posicion[2] - centro[2]] }));
}

/**
 * Prisma hexagonal de la red hcp (secuencia de capas ABAB):
 *  - capas A (z = 0 y z = c): 6 vértices (aporte 1/6) + centro (aporte 1/2)
 *  - capa B (z = c/2): 3 átomos interiores
 * Total: 12·1/6 + 2·1/2 + 3 = 6 átomos.
 */
function celdaHexagonal(a: number, c: number, especie: string): SitioRed[] {
  const sitios: SitioRed[] = [];
  for (const z of [-c / 2, c / 2]) {
    for (let k = 0; k < 6; k++) {
      const ang = (k * Math.PI) / 3;
      sitios.push({ especie, aporte: 1 / 6, posicion: [a * Math.cos(ang), a * Math.sin(ang), z] });
    }
    sitios.push({ especie, aporte: 1 / 2, posicion: [0, 0, z] });
  }
  for (const ang of [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2]) {
    const d = a / Math.sqrt(3);
    sitios.push({ especie, aporte: 1, posicion: [d * Math.cos(ang), d * Math.sin(ang), 0] });
  }
  return sitios;
}

/** Fragmento de dos capas de grafito (anillos hexagonales, apilamiento AB). */
function capasGrafito(a: number, c: number, especie: string, radio = 2.2): SitioRed[] {
  // Red de panal: vectores a₁ = (a, 0), a₂ = (a/2, a√3/2) y base de dos átomos (0, 0) y δ,
  // con δ = (a/2, a/(2√3)), |δ| = a/√3 = enlace C–C.
  const delta: [number, number] = [a / 2, a / (2 * Math.sqrt(3))];
  const sitios: SitioRed[] = [];
  const a1: [number, number] = [a, 0];
  const a2: [number, number] = [a / 2, (a * Math.sqrt(3)) / 2];
  for (const [capa, z] of [[0, -c / 4], [1, c / 4]] as const) {
    // Apilamiento AB (Bernal): la capa B se desplaza δ, de modo que la mitad de sus átomos
    // quedan sobre átomos de A y la otra mitad sobre el centro de los hexágonos de A
    const desp = capa === 0 ? [0, 0] : delta;
    for (let i = -6; i <= 6; i++) {
      for (let j = -6; j <= 6; j++) {
        for (const base of [[0, 0], delta] as const) {
          const x = i * a1[0] + j * a2[0] + base[0] + desp[0]!;
          const y = i * a1[1] + j * a2[1] + base[1] + desp[1]!;
          if (Math.hypot(x, y) <= radio * a) sitios.push({ especie, aporte: 1, posicion: [x, y, z] });
        }
      }
    }
  }
  return sitios;
}

// ── Redes iónicas ───────────────────────────────────────────────────────────

export interface InfoRedIonica {
  nombre: string;
  cation: string;
  anion: string;
  /** Parámetro de red a 25 °C, pm (pendiente de revisión: CRC Handbook, sección 12). */
  a: number;
  /** Coordinación catión : anión. */
  coordinacion: string;
  descripcion: string;
}

export const REDES_IONICAS: Record<TipoRedIonica, InfoRedIonica> = {
  NaCl: {
    nombre: 'Cloruro de sodio (sal gema)',
    cation: 'Na',
    anion: 'Cl',
    a: 564.0,
    coordinacion: '6 : 6',
    descripcion: 'Dos redes fcc interpenetradas, desplazadas a/2. Cada ion queda rodeado por 6 de carga opuesta (octaedro).',
  },
  CsCl: {
    nombre: 'Cloruro de cesio',
    cation: 'Cs',
    anion: 'Cl',
    a: 412.3,
    coordinacion: '8 : 8',
    descripcion: 'Cl⁻ en los vértices del cubo y Cs⁺ en el centro (no es bcc: los dos sitios tienen iones distintos).',
  },
  CaF2: {
    nombre: 'Fluoruro de calcio (fluorita)',
    cation: 'Ca',
    anion: 'F',
    a: 546.3,
    coordinacion: '8 : 4',
    descripcion: 'Ca²⁺ en red fcc y F⁻ en los 8 huecos tetraédricos: 4 Ca²⁺ y 8 F⁻ por celda (CaF₂).',
  },
  ZnS: {
    nombre: 'Sulfuro de zinc (blenda)',
    cation: 'Zn',
    anion: 'S',
    a: 541.0,
    coordinacion: '4 : 4',
    descripcion: 'S²⁻ en red fcc y Zn²⁺ en la mitad de los huecos tetraédricos (estructura similar a la del diamante).',
  },
};

/** Celda unitaria de una red iónica (posiciones en pm, centrada en el origen). */
export function celdaIonica(tipo: TipoRedIonica): SitioRed[] {
  const { cation, anion, a } = REDES_IONICAS[tipo];
  let base: [string, [number, number, number]][];
  switch (tipo) {
    case 'NaCl':
      base = [...conEspecie(anion, BASE_FCC), ...conEspecie(cation, BASE_FCC.map((f) => [f[0] + 0.5, f[1], f[2]] as [number, number, number]))];
      break;
    case 'CsCl':
      base = [[anion, [0, 0, 0]], [cation, [0.5, 0.5, 0.5]]];
      break;
    case 'CaF2': {
      const tetra: [number, number, number][] = [];
      for (const x of [0.25, 0.75]) for (const y of [0.25, 0.75]) for (const z of [0.25, 0.75]) tetra.push([x, y, z]);
      base = [...conEspecie(cation, BASE_FCC), ...conEspecie(anion, tetra)];
      break;
    }
    case 'ZnS':
      base = [
        ...conEspecie(anion, BASE_FCC),
        ...conEspecie(cation, [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]]),
      ];
      break;
  }
  return centrar(celdaCubica(a, base), [a / 2, a / 2, a / 2]);
}

/** Suma de aportes por especie (iones por celda). */
export function contarPorEspecie(sitios: SitioRed[]): Record<string, number> {
  const r: Record<string, number> = {};
  for (const s of sitios) r[s.especie] = (r[s.especie] ?? 0) + s.aporte;
  for (const k of Object.keys(r)) r[k] = Math.round(r[k]! * 1e9) / 1e9;
  return r;
}

/** Densidad teórica: ρ = (Z · M) / (N_A · a³); a en pm → cm. */
export function densidadCubica(atomosPorCelda: number, masaMolar: number, aPm: number, NA: number): number {
  const aCm = aPm * 1e-10;
  return (atomosPorCelda * masaMolar) / (NA * aCm ** 3);
}

/** Vecino más cercano: la distancia mínima entre dos sitios distintos (pm). */
export function distanciaMinimaEntreSitios(sitios: SitioRed[]): number {
  let min = Infinity;
  for (let i = 0; i < sitios.length; i++) {
    for (let j = i + 1; j < sitios.length; j++) {
      const [a, b] = [sitios[i]!.posicion, sitios[j]!.posicion];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      if (d > 1e-6 && d < min) min = d;
    }
  }
  return min;
}
