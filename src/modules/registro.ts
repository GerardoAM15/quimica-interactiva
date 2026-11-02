/**
 * Registro central de bloques y módulos.
 * Solo contiene metadatos (sin importar componentes) para que la portada sea ligera;
 * los componentes de cada módulo se cargan bajo demanda desde `componentes.ts`.
 */

export type IdBloque = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Bloque {
  id: IdBloque;
  slug: string;
  titulo: string;
  descripcion: string;
  /** Color de identificación del bloque (se usa en bordes y acentos, no como fondo de texto). */
  color: string;
}

export interface Modulo {
  numero: number;
  slug: string;
  bloque: IdBloque;
  titulo: string;
  resumen: string;
  temas: string[];
}

export const BLOQUES: readonly Bloque[] = [
  {
    id: 'A',
    slug: 'atomo-y-tabla-periodica',
    titulo: 'Átomo y tabla periódica',
    descripcion: 'Elementos, estructura atómica, configuración electrónica y orbitales en 3D.',
    color: '#38bdf8',
  },
  {
    id: 'B',
    slug: 'enlace-y-moleculas',
    titulo: 'Enlace y moléculas',
    descripcion: 'Enlace químico, estructuras de Lewis, geometría molecular y fuerzas intermoleculares.',
    color: '#a78bfa',
  },
  {
    id: 'C',
    slug: 'inorganica-y-reacciones',
    titulo: 'Química inorgánica y reacciones',
    descripcion: 'Nomenclatura inorgánica, tipos de reacción, balanceo y estequiometría.',
    color: '#f472b6',
  },
  {
    id: 'D',
    slug: 'estados-y-soluciones',
    titulo: 'Estados de la materia y soluciones',
    descripcion: 'Gases ideales y reales, unidades de concentración y propiedades coligativas.',
    color: '#34d399',
  },
  {
    id: 'E',
    slug: 'termo-cinetica-equilibrio',
    titulo: 'Termoquímica, cinética y equilibrio',
    descripcion: 'Entalpía y ley de Hess, velocidad de reacción, Arrhenius y equilibrio químico.',
    color: '#fb923c',
  },
  {
    id: 'F',
    slug: 'acidos-bases-electroquimica',
    titulo: 'Ácidos, bases y electroquímica',
    descripcion: 'pH, buffers, titulaciones, celdas galvánicas, Nernst y electrólisis.',
    color: '#facc15',
  },
  {
    id: 'G',
    slug: 'organica-basica',
    titulo: 'Química orgánica básica',
    descripcion: 'El carbono, hidrocarburos, grupos funcionales, isomería y reacciones básicas.',
    color: '#4ade80',
  },
];

export const MODULOS: readonly Modulo[] = [
  // ── Bloque A ──
  {
    numero: 1,
    slug: 'tabla-periodica',
    bloque: 'A',
    titulo: 'Tabla periódica interactiva',
    resumen: 'Ficha de cada elemento, muestra 3D, estructura cristalina y tendencias periódicas.',
    temas: ['familias', 'bloques s/p/d/f', 'modelo de Bohr', 'diagrama de orbitales', 'tendencias periódicas'],
  },
  {
    numero: 2,
    slug: 'estructura-atomica',
    bloque: 'A',
    titulo: 'Estructura atómica',
    resumen: 'Modelos atómicos, números cuánticos, configuración electrónica, isótopos y espectro del hidrógeno.',
    temas: ['Dalton', 'Thomson', 'Rutherford', 'Bohr', 'números cuánticos', 'regla de Moeller', 'Rydberg'],
  },
  {
    numero: 3,
    slug: 'orbitales-3d',
    bloque: 'A',
    titulo: 'Orbitales en 3D',
    resumen: 'Orbitales s, p, d y f con isosuperficies, fases, nodos y orbitales híbridos.',
    temas: ['función de onda', 'densidad de probabilidad', 'nodos', 'sp', 'sp²', 'sp³'],
  },
  // ── Bloque B ──
  {
    numero: 4,
    slug: 'enlace-quimico',
    bloque: 'B',
    titulo: 'Enlace químico',
    resumen: 'Enlace iónico, covalente y metálico; estructuras de Lewis, carga formal y resonancia.',
    temas: ['ΔEN', 'red cristalina', 'Lewis', 'carga formal', 'resonancia'],
  },
  {
    numero: 5,
    slug: 'visor-moleculas',
    bloque: 'B',
    titulo: 'Visor de moléculas 3D',
    resumen: 'Busca una molécula y explórala: distancias, ángulos, geometría e hibridación.',
    temas: ['bolas y barras', 'espacio lleno', 'momento dipolar', 'VSEPR'],
  },
  {
    numero: 6,
    slug: 'constructor-moleculas',
    bloque: 'B',
    titulo: 'Constructor de moléculas',
    resumen: 'Dibuja átomos y enlaces, valida la valencia y mira el resultado en 3D.',
    temas: ['valencia', 'fórmula molecular', 'masa molar'],
  },
  {
    numero: 7,
    slug: 'fuerzas-intermoleculares',
    bloque: 'B',
    titulo: 'Fuerzas intermoleculares',
    resumen: 'Dipolo-dipolo, puente de hidrógeno y London, y su relación con el punto de ebullición.',
    temas: ['dipolo-dipolo', 'puente de hidrógeno', 'fuerzas de London', 'punto de ebullición'],
  },
  // ── Bloque C ──
  {
    numero: 8,
    slug: 'nomenclatura-inorganica',
    bloque: 'C',
    titulo: 'Nomenclatura inorgánica',
    resumen: 'Nombre ↔ fórmula en nomenclatura tradicional, Stock y sistemática, con estados de oxidación.',
    temas: ['óxidos', 'hidróxidos', 'ácidos oxácidos', 'hidrácidos', 'sales', 'iones'],
  },
  {
    numero: 9,
    slug: 'reacciones-quimicas',
    bloque: 'C',
    titulo: 'Reacciones químicas',
    resumen: 'Síntesis, descomposición, desplazamiento, doble desplazamiento, combustión, neutralización y redox.',
    temas: ['clasificación de reacciones', 'redox'],
  },
  {
    numero: 10,
    slug: 'balanceador',
    bloque: 'C',
    titulo: 'Balanceador de ecuaciones',
    resumen: 'Tanteo, método algebraico y redox ion-electrón en medio ácido y básico, paso a paso.',
    temas: ['tanteo', 'método algebraico', 'ion-electrón', 'medio ácido', 'medio básico'],
  },
  {
    numero: 11,
    slug: 'estequiometria',
    bloque: 'C',
    titulo: 'Estequiometría',
    resumen: 'Mol, masa, volumen y partículas; reactivo limitante, rendimiento, pureza y fórmula empírica.',
    temas: ['mol', 'reactivo limitante', 'rendimiento', 'composición centesimal', 'fórmula empírica'],
  },
  // ── Bloque D ──
  {
    numero: 12,
    slug: 'simulador-gases',
    bloque: 'D',
    titulo: 'Simulador de gases',
    resumen: 'Partículas en una caja con pistón: leyes de los gases, Maxwell-Boltzmann, Van der Waals y Graham.',
    temas: ['Boyle', 'Charles', 'Gay-Lussac', 'Dalton', 'Maxwell-Boltzmann', 'Van der Waals', 'Graham'],
  },
  {
    numero: 13,
    slug: 'soluciones',
    bloque: 'D',
    titulo: 'Soluciones',
    resumen: 'Prepara soluciones, unidades de concentración, diluciones, solubilidad y propiedades coligativas.',
    temas: ['molaridad', 'molalidad', 'normalidad', 'fracción molar', 'dilución', 'coligativas'],
  },
  // ── Bloque E ──
  {
    numero: 14,
    slug: 'termoquimica',
    bloque: 'E',
    titulo: 'Termoquímica',
    resumen: 'Diagramas de entalpía, ley de Hess interactiva, calorimetría y espontaneidad (ΔG).',
    temas: ['ΔH', 'ley de Hess', 'calorimetría', 'ΔS', 'ΔG = ΔH − TΔS'],
  },
  {
    numero: 15,
    slug: 'cinetica',
    bloque: 'E',
    titulo: 'Cinética química',
    resumen: 'Leyes de velocidad, órdenes 0/1/2, vida media, Arrhenius y catalizadores.',
    temas: ['ley de velocidad', 'orden de reacción', 'vida media', 'Arrhenius', 'energía de activación'],
  },
  {
    numero: 16,
    slug: 'equilibrio',
    bloque: 'E',
    titulo: 'Equilibrio químico',
    resumen: 'Tabla ICE, Kc y Kp, cociente Q y simulador de Le Chatelier.',
    temas: ['tabla ICE', 'Kc', 'Kp', 'Q vs K', 'Le Chatelier'],
  },
  // ── Bloque F ──
  {
    numero: 17,
    slug: 'acidos-bases',
    bloque: 'F',
    titulo: 'Ácidos y bases',
    resumen: 'Teorías ácido-base, escala de pH, cálculo de pH, buffers, hidrólisis y Ksp.',
    temas: ['Arrhenius', 'Brønsted-Lowry', 'Lewis', 'pH', 'Henderson-Hasselbalch', 'Ksp'],
  },
  {
    numero: 18,
    slug: 'titulacion',
    bloque: 'F',
    titulo: 'Laboratorio de titulación',
    resumen: 'Bureta y matraz, indicadores, curva de pH en tiempo real y punto de equivalencia.',
    temas: ['fuerte-fuerte', 'débil-fuerte', 'polipróticos', 'indicadores'],
  },
  {
    numero: 19,
    slug: 'electroquimica',
    bloque: 'F',
    titulo: 'Electroquímica',
    resumen: 'Celda galvánica, potenciales estándar, ecuación de Nernst, electrólisis y corrosión.',
    temas: ['E° de celda', 'Nernst', 'electrólisis', 'leyes de Faraday', 'corrosión'],
  },
  // ── Bloque G ──
  {
    numero: 20,
    slug: 'el-carbono',
    bloque: 'G',
    titulo: 'El carbono',
    resumen: 'Hibridación sp/sp²/sp³ en 3D, tipos de carbono y tipos de fórmulas.',
    temas: ['hibridación', 'carbono primario a cuaternario', 'fórmula esqueletal'],
  },
  {
    numero: 21,
    slug: 'hidrocarburos',
    bloque: 'G',
    titulo: 'Hidrocarburos',
    resumen: 'Alcanos, alquenos, alquinos, cíclicos y aromáticos; nomenclatura IUPAC y conformaciones.',
    temas: ['alcanos', 'alquenos', 'alquinos', 'aromáticos', 'IUPAC', 'conformaciones'],
  },
  {
    numero: 22,
    slug: 'grupos-funcionales',
    bloque: 'G',
    titulo: 'Grupos funcionales',
    resumen: 'Funciones oxigenadas y nitrogenadas, prioridad de grupos y nombre ↔ estructura.',
    temas: ['alcoholes', 'aldehídos', 'cetonas', 'ácidos carboxílicos', 'ésteres', 'aminas', 'amidas'],
  },
  {
    numero: 23,
    slug: 'isomeria',
    bloque: 'G',
    titulo: 'Isomería',
    resumen: 'Isomería estructural (cadena, posición, función) y geométrica cis/trans en 3D.',
    temas: ['isomería de cadena', 'de posición', 'de función', 'cis/trans'],
  },
  {
    numero: 24,
    slug: 'reacciones-organicas',
    bloque: 'G',
    titulo: 'Reacciones orgánicas básicas',
    resumen: 'Combustión, halogenación, hidrogenación, esterificación y saponificación.',
    temas: ['combustión', 'halogenación', 'hidrogenación', 'esterificación', 'saponificación'],
  },
];

export function bloquePorSlug(slug: string): Bloque | undefined {
  return BLOQUES.find((b) => b.slug === slug);
}

export function bloquePorId(id: IdBloque): Bloque {
  const b = BLOQUES.find((x) => x.id === id);
  if (!b) throw new Error(`Bloque desconocido: ${id}`);
  return b;
}

export function moduloPorSlug(slug: string): Modulo | undefined {
  return MODULOS.find((m) => m.slug === slug);
}

export function modulosDeBloque(id: IdBloque): Modulo[] {
  return MODULOS.filter((m) => m.bloque === id);
}
