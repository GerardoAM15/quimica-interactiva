import datos from '@/data/obtencion.json';
import apariencia from '@/data/apariencia.json';
import { elementoPorZ } from '@/chem/elements';
import type { ObjetoCotidiano } from './presentacion';

/** Aspecto de la fuente natural: cristales cúbicos (halita, galena), cristales, roca masiva… */
export type FormaMineral = 'cubos' | 'cristales' | 'roca' | 'pepitas' | 'cuarzo-oro';

export interface FuenteNatural {
  /** mineral: mena; nativo: el elemento sin combinar; aire y gas: mezclas gaseosas. */
  tipo: 'mineral' | 'nativo' | 'aire' | 'gas';
  nombre: string;
  /** Fórmula válida para chem/formula; null si el mineral solo contiene trazas o no es estequiométrico. */
  formula: string | null;
  /** Fórmula tal como se escribe en los libros cuando no es estequiométrica (bauxita, pentlandita…). */
  formulaTexto?: string;
  forma?: FormaMineral;
  color: string;
  metalico?: boolean;
  transparente?: boolean;
}

export interface Obtencion {
  fuente: FuenteNatural;
  proceso: {
    nombre: string;
    descripcion: string;
    /** Ecuaciones balanceadas en la sintaxis de chem/balance; vacío si la separación es física. */
    ecuaciones: string[];
  };
  productos: { objeto: ObjetoCotidiano; texto: string }[];
  /** Nota «En el Perú» (posición como productor y región o mina principal). */
  peru?: string;
}

export const FUENTE_OBTENCION = datos.fuente;
export const AIRE = datos.aire;
export const ELEMENTOS_CON_OBTENCION = Object.keys(datos.elementos);

/** Ficha «del mineral al producto» del elemento, o null si no está en la selección. */
export function obtencionDe(z: number): Obtencion | null {
  const el = elementoPorZ(z);
  return ((datos.elementos as unknown as Record<string, Obtencion>)[el.simbolo] ?? null) as Obtencion | null;
}

/** Texto breve para los elementos sin ficha de obtención: nunca se inventa un proceso. */
export function textoSinObtencion(z: number): string {
  const el = elementoPorZ(z);
  if (apariencia.noObservables.z.includes(z)) return 'Solo se han producido unos pocos átomos en aceleradores de partículas: no tiene uso industrial relevante.';
  if (z === 43 || z === 61 || z >= 93) return 'Elemento artificial: se produce en reactores nucleares o en aceleradores de partículas, en cantidades muy pequeñas.';
  if (el.familia === 'lantanido') return 'Se obtiene junto con las demás tierras raras, a partir de minerales como la monacita y la bastnasita, que se separan por extracción con disolventes.';
  return `Aún no hay una ficha de obtención industrial para ${el.nombre.toLowerCase()} en la aplicación.`;
}
