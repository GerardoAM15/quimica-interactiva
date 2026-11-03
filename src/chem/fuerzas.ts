/**
 * Fuerzas intermoleculares a partir de la estructura de una molécula.
 *  - Dispersión de London: en todas las moléculas (aumentan con el tamaño y la polarizabilidad).
 *  - Dipolo-dipolo: entre moléculas polares (μ ≠ 0).
 *  - Puente de hidrógeno: H unido a N, O o F (donador) frente a un N, O o F con par libre (aceptor).
 *  - Ion-dipolo: un ion frente a moléculas polares (p. ej. en disolución acuosa).
 */
import { analizarAtomo, momentoDipolarEstimado } from './vsepr';
import { vecindario, type Molecula } from './molecula';
import { elementoPorSimbolo } from './elements';

const NOF = new Set(['N', 'O', 'F']);

export interface FuerzasIntermoleculares {
  london: true;
  dipoloDipolo: boolean;
  puenteHidrogeno: boolean;
  /** Puede formar puentes de H con el agua (tiene aceptores) aunque no entre sí. */
  aceptaPuenteH: boolean;
  esIon: boolean;
  polar: boolean;
  momentoRelativo: number;
  donadores: number;
  aceptores: number;
  explicacion: string[];
}

/**
 * Polaridad (criterio de los textos): una molécula neutra es polar si sus momentos no se cancelan
 * por simetría (momento estimado > UMBRAL_SIMETRIA) y además tiene enlaces polares (ΔEN ≥ 0,4)
 * o pares libres distribuidos de forma asimétrica (como en H₂S o PH₃, de ΔEN pequeña).
 * Los enlaces C–H (ΔEN = 0,35) se consideran prácticamente apolares.
 */
export const UMBRAL_SIMETRIA = 0.05;
export const DELTA_EN_POLAR = 0.4;

export function esPolar(mol: Molecula): { polar: boolean; momento: number; tieneEnlacesPolares: boolean } {
  const EN = (s: string) => elementoPorSimbolo(s)?.electronegatividad ?? 2.2;
  const tieneEnlacesPolares = mol.enlaces.some((e) => Math.abs(EN(mol.atomos[e.a]!.simbolo) - EN(mol.atomos[e.b]!.simbolo)) >= DELTA_EN_POLAR);
  const vec = vecindario(mol);
  // Par libre asimétrico: átomo con pares libres cuyos vecinos no lo rodean simétricamente
  const paresAsimetricos = mol.atomos.some((a, i) => {
    if (!analizarAtomo(mol, i, vec).paresLibres || vec[i]!.length === 0) return false;
    const s = vec[i]!.reduce(
      (acc, x) => {
        const b = mol.atomos[x.i]!;
        const d = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1;
        return [acc[0]! + (b.x - a.x) / d, acc[1]! + (b.y - a.y) / d, acc[2]! + (b.z - a.z) / d];
      },
      [0, 0, 0],
    );
    return Math.hypot(s[0]!, s[1]!, s[2]!) > 0.1;
  });
  const momento = momentoDipolarEstimado(mol).modulo;
  return { polar: (tieneEnlacesPolares || paresAsimetricos) && momento > UMBRAL_SIMETRIA, momento, tieneEnlacesPolares };
}

export function fuerzasIntermoleculares(mol: Molecula): FuerzasIntermoleculares {
  const vec = vecindario(mol);
  let donadores = 0, aceptores = 0;
  mol.atomos.forEach((a, i) => {
    if (a.simbolo === 'H' && vec[i]!.some((x) => NOF.has(mol.atomos[x.i]!.simbolo))) donadores++;
    if (NOF.has(a.simbolo) && analizarAtomo(mol, i, vec).paresLibres > 0) aceptores++;
  });
  const carga = mol.atomos.reduce((s, a) => s + a.carga, 0);
  const { polar: polarNeutra, momento: modulo, tieneEnlacesPolares } = esPolar(mol);
  const polar = carga === 0 && polarNeutra;
  const puente = donadores > 0 && aceptores > 0;
  const exp: string[] = ['Fuerzas de London (dispersión): presentes en todas las moléculas.'];
  if (carga !== 0) exp.push('Es un ion: su interacción principal con moléculas polares es ion-dipolo.');
  else if (polar) exp.push('Dipolo-dipolo: la molécula es polar (tiene enlaces polares y sus momentos no se cancelan).');
  else if (tieneEnlacesPolares) exp.push('Tiene enlaces polares, pero por su simetría los momentos se cancelan: es apolar.');
  else exp.push('No tiene enlaces polares: es apolar y solo presenta fuerzas de London.');
  if (puente) exp.push(`Puente de hidrógeno: tiene ${donadores} H unido(s) a N, O o F y ${aceptores} átomo(s) aceptor(es) con pares libres.`);
  else if (aceptores > 0) exp.push('No forma puentes de H entre sus propias moléculas (no tiene H unido a N, O o F), pero sí puede aceptarlos del agua.');
  return {
    london: true,
    dipoloDipolo: polar,
    puenteHidrogeno: puente,
    aceptaPuenteH: aceptores > 0,
    esIon: carga !== 0,
    polar,
    momentoRelativo: modulo,
    donadores,
    aceptores,
    explicacion: exp,
  };
}
