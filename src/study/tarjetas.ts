/**
 * Mazo de tarjetas (flashcards) generado desde los datos de la aplicación: elementos, iones,
 * compuestos inorgánicos, grupos funcionales y constantes físicas (CODATA).
 */
import { ELEMENTOS } from '@/chem/elements';
import { ANIONES, CATIONES } from '@/chem/solubilidad';
import { catalogoNomenclatura, type Funcion } from '@/chem/nomenclatura/inorganica';
import { TABLA_CONSTANTES } from '@/chem/constants';
import { fUnicode } from './generadores';

export type CategoriaTarjeta = 'elementos' | 'iones' | 'compuestos' | 'grupos' | 'constantes';
export const NOMBRE_CATEGORIA: Record<CategoriaTarjeta, string> = {
  elementos: 'Símbolos de los elementos',
  iones: 'Iones comunes',
  compuestos: 'Compuestos inorgánicos',
  grupos: 'Grupos funcionales',
  constantes: 'Constantes físicas',
};

export interface Tarjeta {
  id: string;
  categoria: CategoriaTarjeta;
  frente: string;
  reverso: string;
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const ion = (base: string, carga: number) => `${fUnicode(base)}${Math.abs(carga) > 1 ? SUP[Math.abs(carga)] : ''}${carga > 0 ? '⁺' : '⁻'}`;

const GRUPOS = [
  ['R–OH', 'alcohol (sufijo -ol)'],
  ['R–O–R′', 'éter (prefijo alcoxi-)'],
  ['R–CHO', 'aldehído (sufijo -al)'],
  ['R–CO–R′', 'cetona (sufijo -ona)'],
  ['R–COOH', 'ácido carboxílico (ácido …-oico)'],
  ['R–COO–R′', 'éster (…-oato de …-ilo)'],
  ['R–NH₂', 'amina (sufijo -amina)'],
  ['R–CONH₂', 'amida (sufijo -amida)'],
  ['R–C≡N', 'nitrilo (sufijo -nitrilo)'],
  ['R–X', 'halogenuro de alquilo (prefijo halo-)'],
  ['C=C', 'alqueno (sufijo -eno)'],
  ['C≡C', 'alquino (sufijo -ino)'],
];

const FUNCIONES: Funcion[] = ['oxido-basico', 'oxido-acido', 'hidroxido', 'hidracido', 'oxacido', 'sal-haloidea', 'oxisal'];

let cache: Tarjeta[] | null = null;

export function mazo(): Tarjeta[] {
  if (cache) return cache;
  const t: Tarjeta[] = [];
  for (const e of ELEMENTOS.filter((x) => x.z <= 86)) {
    t.push({ id: `el-${e.z}`, categoria: 'elementos', frente: e.simbolo, reverso: `${e.nombre} (Z = ${e.z})` });
  }
  for (const c of CATIONES) t.push({ id: `cat-${c.ion}`, categoria: 'iones', frente: ion(c.elemento, c.carga), reverso: `ion ${c.nombre}` });
  for (const a of ANIONES) t.push({ id: `an-${a.ion}`, categoria: 'iones', frente: ion(a.grupo, -a.carga), reverso: `ion ${a.nombre}` });
  // Compuestos: los primeros de cada función (orden estable del catálogo)
  const cat = catalogoNomenclatura();
  for (const f of FUNCIONES) {
    for (const c of cat.filter((x) => x.funcion === f).slice(0, 12)) {
      t.push({ id: `comp-${c.formula}`, categoria: 'compuestos', frente: fUnicode(c.formula), reverso: [c.nombres.tradicional, c.nombres.stock].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ') });
    }
  }
  for (const [f, n] of GRUPOS) t.push({ id: `gf-${f}`, categoria: 'grupos', frente: f!, reverso: n! });
  // Unidades de CODATA («m s^-1») en notación legible («m·s⁻¹»)
  const unidad = (u: string) => u.replace(/\^(-?\d+)/g, (_, e: string) => e.replace('-', '⁻').replace(/\d/g, (d) => SUP[Number(d)]!)).replace(/ /g, '·');
  for (const [simbolo, c] of Object.entries(TABLA_CONSTANTES)) {
    t.push({ id: `cte-${simbolo}`, categoria: 'constantes', frente: c.nombre, reverso: `${c.valor.toLocaleString('es-PE', { maximumSignificantDigits: 10 })} ${unidad(c.unidad)}${c.exacta ? ' (exacta)' : ''}` });
  }
  // Sin duplicados (p. ej. dos compuestos con la misma fórmula)
  cache = t.filter((x, i) => t.findIndex((y) => y.id === x.id) === i);
  return cache;
}
