/**
 * Tipo de enlace según la diferencia de electronegatividad (escala de Pauling).
 *
 * Criterio usual en los textos preuniversitarios:
 *   ΔEN = 0          → covalente apolar
 *   0 < ΔEN < 1,7    → covalente polar
 *   ΔEN ≥ 1,7        → iónico (entre un metal y un no metal)
 *   metal + metal    → metálico
 * Carácter iónico parcial (Pauling):  %CI = 100·(1 − e^(−ΔEN²/4))
 * Es una regla aproximada: el HF (ΔEN = 1,78) es covalente polar por ser entre dos no metales.
 */
import { elementoPorSimbolo, tipoElemento, grupo } from './elements';

export type TipoEnlace = 'ionico' | 'covalente-polar' | 'covalente-apolar' | 'metalico';

export const NOMBRE_TIPO_ENLACE: Record<TipoEnlace, string> = {
  ionico: 'iónico',
  'covalente-polar': 'covalente polar',
  'covalente-apolar': 'covalente apolar',
  metalico: 'metálico',
};

export const UMBRAL_IONICO = 1.7;

/** Porcentaje de carácter iónico de Pauling. */
export const caracterIonico = (deltaEN: number) => 100 * (1 - Math.exp(-(deltaEN * deltaEN) / 4));

export interface ClasificacionEnlace {
  deltaEN: number;
  tipo: TipoEnlace;
  caracterIonico: number;
  explicacion: string;
  /** Símbolo del átomo más electronegativo (polo negativo δ−), si lo hay. */
  poloNegativo: string | null;
}

export function clasificarEnlace(a: string, b: string): ClasificacionEnlace {
  const ea = elementoPorSimbolo(a), eb = elementoPorSimbolo(b);
  if (!ea || !eb) throw new Error('Elemento desconocido.');
  if (ea.electronegatividad === null || eb.electronegatividad === null) {
    throw new Error(`No hay electronegatividad tabulada para ${ea.electronegatividad === null ? a : b}.`);
  }
  const d = Math.round(Math.abs(ea.electronegatividad - eb.electronegatividad) * 100) / 100;
  const metalA = tipoElemento(ea) === 'metal', metalB = tipoElemento(eb) === 'metal';
  const ci = caracterIonico(d);
  const polo = d === 0 ? null : ea.electronegatividad > eb.electronegatividad ? a : b;
  let tipo: TipoEnlace;
  let explicacion: string;
  if (metalA && metalB) {
    tipo = 'metalico';
    explicacion = 'Ambos son metales: comparten un «mar» de electrones deslocalizados.';
  } else if (d === 0) {
    tipo = 'covalente-apolar';
    explicacion = 'ΔEN = 0: los electrones se comparten por igual.';
  } else if (d >= UMBRAL_IONICO && (metalA || metalB)) {
    tipo = 'ionico';
    explicacion = `ΔEN = ${d.toFixed(2)} ≥ ${UMBRAL_IONICO}: el metal transfiere electrones al no metal y se forman iones.`;
  } else if (d >= UMBRAL_IONICO) {
    tipo = 'covalente-polar';
    explicacion = `ΔEN = ${d.toFixed(2)} ≥ ${UMBRAL_IONICO}, pero ambos son no metales: el enlace es covalente muy polar (como en el HF).`;
  } else {
    tipo = 'covalente-polar';
    explicacion = `0 < ΔEN = ${d.toFixed(2)} < ${UMBRAL_IONICO}: los electrones se comparten de forma desigual; ${polo} tiene carga parcial δ−.`;
  }
  return { deltaEN: d, tipo, caracterIonico: ci, explicacion, poloNegativo: polo };
}

const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));

export interface FormacionIonica {
  cation: string;
  anion: string;
  cargaCation: number;
  cargaAnion: number;
  /** Átomos de cada uno en la fórmula unitaria. */
  nCation: number;
  nAnion: number;
  formula: string;
  electronesTransferidos: number;
  pasos: string[];
}

/**
 * Compuesto iónico binario entre un metal de los grupos 1, 2 o 13 y un no metal de los grupos 15–17:
 * el metal pierde sus electrones de valencia (catión M^q+) y el no metal gana los que le faltan
 * para el octeto (anión X^(8−v)−). La fórmula se obtiene igualando cargas con el m.c.m.
 */
export function formacionIonica(metal: string, noMetal: string): FormacionIonica {
  const m = elementoPorSimbolo(metal), x = elementoPorSimbolo(noMetal);
  if (!m || !x) throw new Error('Elemento desconocido.');
  const gm = grupo(m.z), gx = grupo(x.z);
  if (!(gm === 1 || gm === 2 || gm === 13) || tipoElemento(m) !== 'metal') {
    throw new Error('El catión debe ser un metal de los grupos 1, 2 o 13 (IA, IIA, IIIA).');
  }
  if (!(gx >= 15 && gx <= 17) || tipoElemento(x) === 'metal') {
    throw new Error('El anión debe ser un no metal de los grupos 15, 16 o 17 (VA, VIA, VIIA).');
  }
  const qc = gm >= 13 ? gm - 10 : gm;
  const qa = 8 - (gx - 10);
  const g = mcd(qc, qa);
  const nC = qa / g, nA = qc / g;
  const sub = (s: string, k: number) => (k > 1 ? `${s}${k}` : s);
  const formula = `${sub(metal, nC)}${sub(noMetal, nA)}`;
  return {
    cation: metal,
    anion: noMetal,
    cargaCation: qc,
    cargaAnion: -qa,
    nCation: nC,
    nAnion: nA,
    formula,
    electronesTransferidos: qc * nC,
    pasos: [
      `${m.nombre} (grupo ${gm}) tiene ${qc} electrón(es) de valencia y los pierde: ${metal}${qc > 1 ? qc : ''}⁺.`,
      `${x.nombre} (grupo ${gx}) tiene ${gx - 10} electrones de valencia y gana ${qa} para completar el octeto: ${noMetal}${qa > 1 ? qa : ''}⁻.`,
      `Neutralidad: ${nC} × (+${qc}) + ${nA} × (−${qa}) = 0 → ${formula}.`,
      `Se transfieren ${qc * nC} electrones en total.`,
    ],
  };
}
