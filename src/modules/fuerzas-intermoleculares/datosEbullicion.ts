import { CATALOGO } from '@/components/molecula/cargarMolecula';
import { elementoPorSimbolo } from '@/chem/elements';
import complementaria from '@/data/ebullicion-complementaria.json';

export interface PuntoEbullicion {
  nombre: string;
  etiqueta: string;
  valor: number | null;
  masaMolar: number | null;
  fuente: string;
  pendienteRevision: boolean;
}

/** Punto de ebullición (°C) de una molécula del catálogo; si PubChem no lo tiene, el complementario del CRC. */
export function ebullicion(nombre: string, etiqueta = nombre): PuntoEbullicion {
  const m = CATALOGO.find((x) => x.nombre === nombre);
  const extra = (complementaria.valores as Record<string, number>)[nombre];
  if (m?.puntoEbullicion) {
    return { nombre, etiqueta, valor: m.puntoEbullicion.valor, masaMolar: m.masaMolar, fuente: m.puntoEbullicion.fuente, pendienteRevision: false };
  }
  return {
    nombre,
    etiqueta,
    valor: extra ?? null,
    masaMolar: m?.masaMolar ?? null,
    fuente: extra !== undefined ? 'CRC Handbook (complementario)' : 'sin dato',
    pendienteRevision: extra !== undefined,
  };
}

/** Punto de ebullición de un elemento (PubChem, en K → °C). */
export function ebullicionElemento(simbolo: string): number | null {
  const k = elementoPorSimbolo(simbolo)?.puntoEbullicion;
  return k == null ? null : Math.round((k - 273.15) * 100) / 100;
}

/** Hidruros de los grupos 14 a 17 por periodo (2 a 5). */
export const HIDRUROS: { grupo: string; moleculas: [string, string][] }[] = [
  { grupo: 'Grupo 14 (CH₄…)', moleculas: [['metano', 'CH₄'], ['silano', 'SiH₄'], ['germano', 'GeH₄'], ['estannano', 'SnH₄']] },
  { grupo: 'Grupo 15 (NH₃…)', moleculas: [['amoníaco', 'NH₃'], ['fosfina', 'PH₃'], ['arsina', 'AsH₃'], ['estibina', 'SbH₃']] },
  { grupo: 'Grupo 16 (H₂O…)', moleculas: [['agua', 'H₂O'], ['sulfuro de hidrógeno', 'H₂S'], ['seleniuro de hidrógeno', 'H₂Se'], ['telururo de hidrógeno', 'H₂Te']] },
  { grupo: 'Grupo 17 (HF…)', moleculas: [['fluoruro de hidrógeno', 'HF'], ['cloruro de hidrógeno', 'HCl'], ['bromuro de hidrógeno', 'HBr'], ['yoduro de hidrógeno', 'HI']] },
];

export const ALCANOS: [string, number][] = [
  ['metano', 1], ['etano', 2], ['propano', 3], ['butano', 4], ['pentano', 5], ['hexano', 6], ['heptano', 7], ['octano', 8], ['nonano', 9], ['decano', 10],
];

export const ISOMEROS_C5: [string, string][] = [
  ['pentano', 'pentano (lineal)'],
  ['isopentano (2-metilbutano)', '2-metilbutano'],
  ['neopentano (2,2-dimetilpropano)', '2,2-dimetilpropano (esférico)'],
];

/** Moléculas de masa molar parecida (58–60 g/mol) con fuerzas distintas. */
export const MASA_SIMILAR: [string, string, string][] = [
  ['butano', 'butano', 'London'],
  ['metoxietano', 'metoxietano', 'dipolo-dipolo'],
  ['propanal', 'propanal', 'dipolo-dipolo'],
  ['propanona (acetona)', 'propanona', 'dipolo-dipolo'],
  ['propan-1-ol', 'propan-1-ol', 'puente de H'],
  ['ácido etanoico (acético)', 'ácido acético', 'puente de H (dímeros)'],
];
