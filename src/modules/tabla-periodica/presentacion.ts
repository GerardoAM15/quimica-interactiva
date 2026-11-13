import vidas from '@/data/vidas-medias.json';
import apariencia from '@/data/apariencia.json';
import { elementoPorZ } from '@/chem/elements';
import type { Efecto, Presentacion } from '@/components/escena3d/Presentaciones';

/** Presentación y uso cotidiano de cada elemento: bloque «presentaciones» de apariencia.json. */
const datos = apariencia.presentaciones;

/** Objetos 3D disponibles para la pestaña «En la vida diaria» (components/escena3d/ObjetosCotidianos). */
export const OBJETOS_COTIDIANOS = [
  'bombilla',
  'lata',
  'cable',
  'letrero',
  'bateria',
  'termometro',
  'moneda',
  'anillo',
  'globo',
  'lapiz',
  'chip',
  'salero',
  'clavo',
  'pila',
  'tanque',
  'tubo-pasta',
  'cerilla',
  'cuchara',
  'led',
  'cohete',
  'espejo',
  'iman',
  'tableta',
  'botella',
  'detector',
] as const;
export type ObjetoCotidiano = (typeof OBJETOS_COTIDIANOS)[number];

export interface InfoPresentacion {
  presentacion: Presentacion;
  efecto?: Efecto;
  /** Acabado que el usuario puede activar (p. ej. la pátina del cobre). */
  efectoOpcional?: Efecto;
  nota?: string;
  vidaDiaria: { objeto: ObjetoCotidiano | null; uso: string };
  /** Isótopo más estable de los elementos sin isótopos estables (OIEA). */
  vidaMedia?: { isotopo: string; texto: string; segundos: number };
  /** Nunca se ha visto una cantidad macroscópica del elemento puro. */
  pocosAtomos: boolean;
}

export const FUENTE_PRESENTACIONES = datos.fuente;
export const FUENTE_VIDAS = vidas.fuente;

export const NOMBRE_PRESENTACION: Record<Presentacion, string> = {
  lingote: 'lingote',
  barra: 'barras',
  alambre: 'alambre enrollado',
  cinta: 'cinta enrollada',
  lamina: 'lámina',
  granulos: 'gránulos',
  polvo: 'polvo',
  pepita: 'pepita',
  trozo: 'trozo',
  moneda: 'moneda',
  cristales: 'cristales',
  'cristal-cubico': 'cristales cúbicos',
  'cristal-octaedrico': 'cristal octaédrico',
  'cristal-escalonado': 'cristal escalonado',
  oblea: 'oblea',
  aceite: 'trozos bajo aceite mineral',
  ampolla: 'ampolla de vidrio sellada',
  gota: 'gota sobre vidrio de reloj',
  tubo: 'tubo de descarga',
  'frasco-gas': 'gas en matraz',
  'sin-muestra': 'sin muestra',
};

export const EXPLICACION_EFECTO: Record<Efecto, string> = {
  patina: 'Pátina: con el aire húmedo se forma una capa verde de carbonato básico de cobre.',
  iridiscente: 'Iridiscencia: una película delgada de óxido produce colores por interferencia de la luz (como en una burbuja de jabón).',
  opaco: 'Superficie opaca: se cubre rápidamente de una capa de óxido gris que le quita el brillo.',
  diamante: 'Transparente y muy brillante: índice de refracción 2,42 y alta dispersión («fuego»).',
};

const UNIDADES: Record<string, [string, string]> = {
  Y: ['año', 'años'],
  d: ['día', 'días'],
  h: ['hora', 'horas'],
  m: ['minuto', 'minutos'],
  s: ['segundo', 'segundos'],
  ms: ['milisegundo', 'milisegundos'],
  us: ['microsegundo', 'microsegundos'],
};

/** «4,21 millones de años», «22 minutos», «2,01 × 10¹⁹ años». */
export function textoVidaMedia(valor: number, unidad: string): string {
  const [uno, varios] = UNIDADES[unidad] ?? [unidad, unidad];
  const u = valor === 1 ? uno : varios;
  if (valor >= 1e12) {
    const [m, e] = valor.toExponential(2).split('e');
    return `${m} × 10${String(Number(e)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)} ${u}`;
  }
  if (valor >= 1e9) return `${(valor / 1e9).toLocaleString('es-PE', { maximumSignificantDigits: 3 })} mil millones de ${u}`;
  if (valor >= 1e6) return `${(valor / 1e6).toLocaleString('es-PE', { maximumSignificantDigits: 3 })} millones de ${u}`;
  return `${valor.toLocaleString('es-PE', { maximumSignificantDigits: 4 })} ${u}`;
}

export function presentacionDe(z: number): InfoPresentacion {
  const el = elementoPorZ(z);
  const e = (datos.elementos as Record<string, { presentacion: string; efecto?: string; efectoOpcional?: string; nota?: string; vidaDiaria: { objeto: string | null; uso: string } }>)[el.simbolo]!;
  const v = (vidas.elementos as Record<string, { isotopo: string; vidaMedia: number; unidad: string; segundos: number }>)[String(z)];
  return {
    presentacion: e.presentacion as Presentacion,
    efecto: e.efecto as Efecto | undefined,
    efectoOpcional: e.efectoOpcional as Efecto | undefined,
    nota: e.nota,
    vidaDiaria: { objeto: e.vidaDiaria.objeto as ObjetoCotidiano | null, uso: e.vidaDiaria.uso },
    vidaMedia: v ? { isotopo: v.isotopo, texto: textoVidaMedia(v.vidaMedia, v.unidad), segundos: v.segundos } : undefined,
    pocosAtomos: apariencia.noObservables.z.includes(z),
  };
}
