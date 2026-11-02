import datos from '@/data/apariencia.json';
import { elementoPorZ, tipoElemento } from '@/chem/elements';

export type TipoMuestra = 'metal' | 'liquido' | 'gas' | 'gas-coloreado' | 'no-metal' | 'no-observable';

export interface Apariencia {
  tipo: TipoMuestra;
  color: string | null;
  rugosidad: number;
  metalicidad: number;
  transparente: boolean;
  metalico: boolean;
  descripcion: string;
  /** true si proviene de la tabla curada; false si es el aspecto genérico por defecto. */
  especifica: boolean;
}

interface Entrada {
  tipo: string;
  color: string | null;
  descripcion: string;
  rugosidad?: number;
  metalicidad?: number;
  transparente?: boolean;
  metalico?: boolean;
}

export const FUENTE_APARIENCIA = datos.fuente;

/** Aspecto del elemento a 25 °C: entrada curada o valor por defecto según su estado y tipo. */
export function aparienciaDe(z: number): Apariencia {
  const el = elementoPorZ(z);
  if (datos.noObservables.z.includes(z)) {
    return {
      tipo: 'no-observable',
      color: null,
      rugosidad: 0.5,
      metalicidad: 0,
      transparente: false,
      metalico: false,
      descripcion: datos.noObservables.descripcion,
      especifica: true,
    };
  }
  const e = (datos.elementos as Record<string, Entrada>)[el.simbolo];
  if (e) {
    const metal = e.tipo === 'metal';
    return {
      tipo: e.tipo as TipoMuestra,
      color: e.color,
      rugosidad: e.rugosidad ?? (metal ? 0.3 : 0.6),
      metalicidad: e.metalicidad ?? (metal ? 1 : 0),
      transparente: e.transparente ?? false,
      metalico: e.metalico ?? metal,
      descripcion: e.descripcion,
      especifica: true,
    };
  }
  // Por defecto: los metales sólidos son plateados con brillo metálico
  const radiactivo = z === 43 || z === 61 || z >= 84;
  if (tipoElemento(el) === 'metal' && el.estadoEstandar === 'solido') {
    return {
      tipo: 'metal',
      color: '#c9cdd3',
      rugosidad: 0.32,
      metalicidad: 1,
      transparente: false,
      metalico: true,
      descripcion: `Metal sólido de aspecto plateado (aspecto genérico)${radiactivo ? '. Es radiactivo: su manipulación requiere instalaciones especiales.' : '.'}`,
      especifica: false,
    };
  }
  return {
    tipo: 'no-metal',
    color: '#9ca3af',
    rugosidad: 0.6,
    metalicidad: 0,
    transparente: false,
    metalico: false,
    descripcion: 'Aspecto no documentado en la tabla de apariencia.',
    especifica: false,
  };
}
