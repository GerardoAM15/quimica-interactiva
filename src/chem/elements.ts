/**
 * Acceso a los datos de los elementos (PubChem) y posición en la tabla periódica.
 * Funciones puras, sin React.
 */
import datos from '@/data/elementos.json';

export type Familia =
  | 'alcalino'
  | 'alcalinoterreo'
  | 'transicion'
  | 'postransicion'
  | 'metaloide'
  | 'no-metal'
  | 'halogeno'
  | 'gas-noble'
  | 'lantanido'
  | 'actinido';

export type EstadoFisico = 'solido' | 'liquido' | 'gas';
export type Bloque = 's' | 'p' | 'd' | 'f';

export interface Elemento {
  z: number;
  simbolo: string;
  nombre: string;
  nombreIngles: string;
  alias: string[];
  origenSimbolo: string | null;
  /** Masa atómica en u (= g/mol): peso atómico estándar IUPAC (NIST) o, si no existe, el de PubChem. */
  masaAtomica: number;
  origenMasaAtomica: string;
  /** Valor tal como aparece en la tabla periódica de PubChem (a veces truncado). */
  masaAtomicaPubChem: number | null;
  colorCPK: string | null;
  configuracionPubChem: string | null;
  /** Escala de Pauling. */
  electronegatividad: number | null;
  /** Radio de van der Waals, pm. */
  radioVdW: number | null;
  /** Primera energía de ionización, eV. */
  energiaIonizacion: number | null;
  /** Afinidad electrónica, eV. */
  afinidadElectronica: number | null;
  estadosOxidacion: number[];
  /** Estado a 25 °C y 1 atm. */
  estadoEstandar: EstadoFisico;
  /** true si el estado es una predicción (elementos superpesados). */
  estadoEsperado: boolean;
  puntoFusion: number | null;
  puntoEbullicion: number | null;
  /** g/cm³ */
  densidad: number | null;
  familia: Familia;
  anioDescubrimiento: number | null;
  conocidoDesdeAntiguedad: boolean;
}

export const ELEMENTOS: readonly Elemento[] = datos.elementos as Elemento[];
export const FUENTE_ELEMENTOS = datos.fuente;
export const UNIDADES = datos.fuente.unidades;

const porSimbolo = new Map(ELEMENTOS.map((e) => [e.simbolo, e]));

/** Elemento por número atómico (1–118). */
export function elementoPorZ(z: number): Elemento {
  const e = ELEMENTOS[z - 1];
  if (!e || e.z !== z) throw new RangeError(`Número atómico fuera de rango: ${z}`);
  return e;
}

/** Elemento por símbolo, distinguiendo mayúsculas ("Co" ≠ "CO"). */
export function elementoPorSimbolo(simbolo: string): Elemento | undefined {
  return porSimbolo.get(simbolo);
}

export const NOMBRE_FAMILIA: Record<Familia, string> = {
  alcalino: 'Metales alcalinos',
  alcalinoterreo: 'Metales alcalinotérreos',
  transicion: 'Metales de transición',
  postransicion: 'Metales del bloque p',
  metaloide: 'Metaloides',
  'no-metal': 'No metales',
  halogeno: 'Halógenos',
  'gas-noble': 'Gases nobles',
  lantanido: 'Lantánidos',
  actinido: 'Actínidos',
};

export const NOMBRE_ESTADO: Record<EstadoFisico, string> = {
  solido: 'Sólido',
  liquido: 'Líquido',
  gas: 'Gas',
};

/** Clasificación metal / no metal / metaloide. */
export function tipoElemento(e: Elemento): 'metal' | 'no-metal' | 'metaloide' {
  if (e.familia === 'metaloide') return 'metaloide';
  if (e.familia === 'no-metal' || e.familia === 'halogeno' || e.familia === 'gas-noble') return 'no-metal';
  return 'metal';
}

// ── Posición en la tabla ────────────────────────────────────────────────────

/** Z de los gases nobles: cierran cada periodo. */
export const Z_GASES_NOBLES = [2, 10, 18, 36, 54, 86, 118] as const;

/** Periodo = número del nivel de energía más externo (n máximo). */
export function periodo(z: number): number {
  const p = Z_GASES_NOBLES.findIndex((g) => z <= g);
  if (p < 0 || z < 1) throw new RangeError(`Número atómico fuera de rango: ${z}`);
  return p + 1;
}

/** true para lantánidos (57–71) y actínidos (89–103), que van en las filas separadas. */
export function esSerieF(z: number): boolean {
  return (z >= 57 && z <= 71) || (z >= 89 && z <= 103);
}

/**
 * Grupo IUPAC (1–18). Los lantánidos y actínidos se asignan al grupo 3 (IIIB),
 * como en los textos preuniversitarios peruanos.
 */
export function grupo(z: number): number {
  const p = periodo(z);
  const k = z - (p === 1 ? 0 : Z_GASES_NOBLES[p - 2]!); // posición dentro del periodo
  if (p === 1) return k === 1 ? 1 : 18;
  if (p <= 3) return k <= 2 ? k : k + 10;
  if (p <= 5) return k;
  // Periodos 6 y 7: 2 (s) + 15 (La–Lu / Ac–Lr, serie f) + 15 (Hf–Rn / Rf–Og)
  if (k <= 2) return k;
  if (k <= 17) return 3;
  return k - 14;
}

/** Grupo en notación tradicional A/B (IA, IIA, IIIB … VIIIB, IB, IIB, IIIA … VIIIA). */
export function grupoTradicional(z: number): string {
  const g = grupo(z);
  const romano = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  if (g <= 2) return `${romano[g]}A`;
  if (g >= 13) return `${romano[g - 10]}A`;
  if (g <= 7) return `${romano[g]}B`;
  if (g <= 10) return 'VIIIB';
  return `${romano[g - 10]}B`;
}

/**
 * Celda de la cuadrícula para dibujar la tabla (fila y columna desde 1).
 * Filas 1–7 para la tabla principal; 9 y 10 para lantánidos y actínidos.
 */
export function posicionTabla(z: number): { fila: number; columna: number } {
  if (z >= 57 && z <= 71) return { fila: 9, columna: 3 + (z - 57) };
  if (z >= 89 && z <= 103) return { fila: 10, columna: 3 + (z - 89) };
  return { fila: periodo(z), columna: grupo(z) };
}

// ── Búsqueda simple (la difusa con Fuse.js va en la interfaz) ───────────────

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Busca por símbolo exacto, número atómico o nombre (español, inglés o alias), sin tildes. */
export function buscarElemento(texto: string): Elemento | undefined {
  const t = texto.trim();
  if (!t) return undefined;
  if (/^\d+$/.test(t)) {
    const z = Number(t);
    return z >= 1 && z <= 118 ? elementoPorZ(z) : undefined;
  }
  const exacto = elementoPorSimbolo(t[0]!.toUpperCase() + t.slice(1).toLowerCase());
  if (exacto && t.length <= 2) return exacto;
  const n = normalizar(t);
  return ELEMENTOS.find(
    (e) => normalizar(e.nombre) === n || normalizar(e.nombreIngles) === n || e.alias.some((a) => normalizar(a) === n),
  );
}
