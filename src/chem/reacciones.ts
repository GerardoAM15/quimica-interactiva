/**
 * Clasificación de reacciones químicas:
 *  síntesis (A + B → AB) · descomposición (AB → A + B) · desplazamiento simple (A + BC → AC + B)
 *  doble desplazamiento (AB + CD → AD + CB) · combustión (combustible + O₂ → CO₂ + H₂O)
 *  neutralización (ácido + base → sal + agua) · redox (hay cambio de números de oxidación)
 */
import { analizarRedox, type Especie } from './balance';
import { nombrar } from './nomenclatura/inorganica';

export type TipoReaccion = 'sintesis' | 'descomposicion' | 'desplazamiento-simple' | 'doble-desplazamiento' | 'combustion' | 'neutralizacion' | 'redox';

export const NOMBRE_TIPO: Record<TipoReaccion, string> = {
  sintesis: 'Síntesis (adición, combinación)',
  descomposicion: 'Descomposición',
  'desplazamiento-simple': 'Desplazamiento simple (sustitución)',
  'doble-desplazamiento': 'Doble desplazamiento (metátesis)',
  combustion: 'Combustión',
  neutralizacion: 'Neutralización',
  redox: 'Óxido-reducción (redox)',
};

const esElemento = (s: Especie) => s.formula.atomos.size === 1 && s.formula.carga === 0;
const formulaDe = (s: Especie) => s.texto.replace(/\((s|l|g|aq|ac)\)$/i, '');
const funcionDe = (s: Especie) => nombrar(formulaDe(s)).compuestos.map((c) => c.funcion);
const esAgua = (s: Especie) => s.formula.atomos.get('H') === 2 && s.formula.atomos.get('O') === 1 && s.formula.atomos.size === 2;

export interface Clasificacion {
  tipos: TipoReaccion[];
  explicaciones: string[];
}

export function clasificarReaccion(ec: { reactivos: Especie[]; productos: Especie[] }): Clasificacion {
  const { reactivos: R, productos: P } = ec;
  const tipos: TipoReaccion[] = [];
  const exp: string[] = [];

  const o2 = R.find((s) => s.formula.atomos.get('O') === 2 && s.formula.atomos.size === 1);
  const combustible = R.find((s) => s !== o2 && s.formula.atomos.has('C') && s.formula.atomos.has('H'));
  if (o2 && combustible && P.some((s) => s.formula.atomos.get('C') === 1 && s.formula.atomos.size === 2 && s.formula.atomos.has('O')) && P.some(esAgua)) {
    tipos.push('combustion');
    exp.push(`Un combustible (${combustible.texto}) reacciona con O₂ y produce ${P.some((s) => formulaDe(s) === 'CO') ? 'CO (combustión incompleta)' : 'CO₂'} y H₂O; libera energía.`);
  }
  const acido = R.find((s) => funcionDe(s).some((f) => f === 'oxacido' || f === 'hidracido'));
  const base = R.find((s) => funcionDe(s).includes('hidroxido') || formulaDe(s) === 'NH3');
  if (acido && base && P.some(esAgua)) {
    tipos.push('neutralizacion');
    exp.push(`Un ácido (${acido.texto}) y una base (${base.texto}) forman sal y agua: H⁺ + OH⁻ → H₂O.`);
  }
  if (R.length >= 2 && P.length === 1) {
    tipos.push('sintesis');
    exp.push('Dos o más sustancias se combinan en un único producto.');
  }
  if (R.length === 1 && P.length >= 2) {
    tipos.push('descomposicion');
    exp.push('Una sustancia se descompone en dos o más más sencillas (suele requerir calor, luz o electricidad).');
  }
  const elemR = R.filter(esElemento), elemP = P.filter(esElemento);
  if (R.length === 2 && P.length === 2 && elemR.length === 1 && elemP.length === 1 && formulaDe(elemR[0]!) !== formulaDe(elemP[0]!) && !tipos.includes('combustion')) {
    tipos.push('desplazamiento-simple');
    exp.push(`El elemento ${elemR[0]!.texto} desplaza a ${elemP[0]!.texto} de su compuesto (es más activo).`);
  }
  const redox = analizarRedox(ec);
  if (R.length === 2 && P.length === 2 && elemR.length === 0 && elemP.length === 0 && !redox.esRedox && !tipos.includes('neutralizacion')) {
    tipos.push('doble-desplazamiento');
    exp.push('Dos compuestos intercambian sus iones (a menudo se forma un precipitado, un gas o agua).');
  }
  if (redox.esRedox) {
    tipos.push('redox');
    exp.push(`Hay transferencia de electrones: se oxida ${[...new Set(redox.cambios.filter((c) => c.tipo === 'oxidacion').map((c) => c.elemento))].join(', ')} y se reduce ${[...new Set(redox.cambios.filter((c) => c.tipo === 'reduccion').map((c) => c.elemento))].join(', ')}.`);
  }
  return { tipos, explicaciones: exp };
}
