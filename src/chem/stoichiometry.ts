/**
 * Estequiometría: conversiones entre unidades químicas, reactivo limitante, rendimiento, pureza y
 * fórmulas empírica y molecular.
 *
 *   n = m / M                 (moles a partir de la masa)
 *   N = n · N_A               (partículas)
 *   V = n · Vₘ                (gas en condiciones normales: Vₘ = 22,4 L/mol a 0 °C y 1 atm)
 *   ξ = min(nᵢ / νᵢ)          (avance de reacción; el reactivo que da el mínimo es el limitante)
 *   % rendimiento = real / teórico × 100      · masa pura = masa de muestra × % pureza / 100
 */
import { NA } from './constants';
import { composicionPorcentual, masaAtomica, masaMolar, parsearFormula } from './formula';
import type { ResultadoBalanceo } from './balance';

/** Volumen molar usado en los textos para gases en condiciones normales (0 °C, 1 atm), L/mol. */
export const VM_TEXTOS = 22.4;

export type Unidad = 'mol' | 'g' | 'L' | 'particulas';

export interface Conversion {
  moles: number;
  masa: number;
  volumenCN: number;
  particulas: number;
  masaMolar: number;
  pasos: { titulo: string; tex: string }[];
}

const cientifica = (x: number) => {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e <= 4) return Number(x.toPrecision(5)).toString().replace('.', '{,}');
  return `${(x / 10 ** e).toFixed(3).replace('.', '{,}')}\\times10^{${e}}`;
};

/** Convierte una cantidad de una sustancia entre mol, masa, volumen (gas en CN) y partículas. */
export function convertir(formula: string, valor: number, unidad: Unidad, vm = VM_TEXTOS): Conversion {
  if (!(valor >= 0)) throw new RangeError('La cantidad debe ser un número positivo.');
  const M = masaMolar(formula);
  const n = unidad === 'mol' ? valor : unidad === 'g' ? valor / M : unidad === 'L' ? valor / vm : valor / NA;
  const pasos: Conversion['pasos'] = [];
  if (unidad === 'g') pasos.push({ titulo: 'Moles a partir de la masa:', tex: `n = \\dfrac{m}{M} = \\dfrac{${cientifica(valor)}\\ \\text{g}}{${cientifica(M)}\\ \\text{g/mol}} = ${cientifica(n)}\\ \\text{mol}` });
  if (unidad === 'L') pasos.push({ titulo: 'Moles a partir del volumen (gas en CN):', tex: `n = \\dfrac{V}{V_m} = \\dfrac{${cientifica(valor)}\\ \\text{L}}{${cientifica(vm)}\\ \\text{L/mol}} = ${cientifica(n)}\\ \\text{mol}` });
  if (unidad === 'particulas') pasos.push({ titulo: 'Moles a partir del número de partículas:', tex: `n = \\dfrac{N}{N_A} = \\dfrac{${cientifica(valor)}}{6{,}022\\times10^{23}} = ${cientifica(n)}\\ \\text{mol}` });
  if (unidad !== 'g') pasos.push({ titulo: 'Masa:', tex: `m = n\\,M = ${cientifica(n)}\\times${cientifica(M)} = ${cientifica(n * M)}\\ \\text{g}` });
  if (unidad !== 'L') pasos.push({ titulo: 'Volumen si es un gas en condiciones normales:', tex: `V = n\\,V_m = ${cientifica(n)}\\times${cientifica(vm)} = ${cientifica(n * vm)}\\ \\text{L}` });
  if (unidad !== 'particulas') pasos.push({ titulo: 'Número de partículas (moléculas o unidades fórmula):', tex: `N = n\\,N_A = ${cientifica(n)}\\times6{,}022\\times10^{23} = ${cientifica(n * NA)}` });
  return { moles: n, masa: n * M, volumenCN: n * vm, particulas: n * NA, masaMolar: M, pasos };
}

// ── Reactivo limitante ──────────────────────────────────────────────────────

export interface ResultadoLimitante {
  /** Índice (entre los reactivos) del reactivo limitante. */
  limitante: number;
  /** Avance ξ = n_limitante / ν_limitante (mol). */
  avance: number;
  /** Moles de cada reactivo que sobran. */
  exceso: number[];
  /** Moles teóricos de cada producto. */
  productos: number[];
  pasos: string[];
}

/** Dadas las moles iniciales de cada reactivo de una ecuación balanceada, halla el limitante. */
export function reactivoLimitante(ec: ResultadoBalanceo, molesReactivos: number[]): ResultadoLimitante {
  const nR = ec.reactivos.length;
  if (molesReactivos.length !== nR) throw new RangeError('Debe indicarse la cantidad de cada reactivo.');
  const coef = ec.coeficientes.map(Number);
  const cocientes = molesReactivos.map((n, i) => n / coef[i]!);
  const avance = Math.min(...cocientes);
  const limitante = cocientes.indexOf(avance);
  const exceso = molesReactivos.map((n, i) => n - coef[i]! * avance);
  const productos = ec.productos.map((_, j) => coef[nR + j]! * avance);
  const pasos = [
    ...ec.reactivos.map((r, i) => `${r.texto}: ${molesReactivos[i]!.toPrecision(4)} mol ÷ ${coef[i]} = ${cocientes[i]!.toPrecision(4)}`),
    `El menor cociente corresponde a ${ec.reactivos[limitante]!.texto}: es el reactivo limitante (se consume por completo).`,
    ...ec.productos.map((p, j) => `${p.texto}: ${coef[nR + j]} × ${avance.toPrecision(4)} = ${productos[j]!.toPrecision(4)} mol (teórico).`),
    ...ec.reactivos.map((r, i) => (i === limitante ? null : `Sobran ${exceso[i]!.toPrecision(4)} mol de ${r.texto} (reactivo en exceso).`)).filter((x): x is string => x !== null),
  ];
  return { limitante, avance, exceso, productos, pasos };
}

/** % de rendimiento = rendimiento real / rendimiento teórico × 100. */
export const porcentajeRendimiento = (real: number, teorico: number) => (100 * real) / teorico;
/** Masa de sustancia pura en una muestra impura. */
export const masaPura = (masaMuestra: number, pureza: number) => (masaMuestra * pureza) / 100;

// ── Fórmula empírica y molecular ────────────────────────────────────────────

export interface ResultadoEmpirica {
  subindices: Record<string, number>;
  formula: string;
  masaMolarEmpirica: number;
  pasos: string[];
}

/**
 * Fórmula empírica a partir de la composición (porcentajes o masas):
 *  1. moles de cada elemento = masa / Aᵣ;  2. dividir entre el menor;
 *  3. si no salen enteros, multiplicar por 2, 3, 4… hasta obtenerlos.
 */
export function formulaEmpirica(composicion: Record<string, number>, tolerancia = 0.1): ResultadoEmpirica {
  const elementos = Object.keys(composicion);
  if (elementos.length < 1) throw new RangeError('Indica al menos un elemento.');
  const moles = elementos.map((s) => composicion[s]! / masaAtomica(s));
  const minimo = Math.min(...moles);
  const relacion = moles.map((n) => n / minimo);
  const pasos = [
    `Moles de cada elemento (masa ÷ Aᵣ): ${elementos.map((s, i) => `${s} = ${composicion[s]} / ${masaAtomica(s)} = ${moles[i]!.toFixed(4)}`).join('; ')}.`,
    `Se divide entre el menor (${minimo.toFixed(4)}): ${elementos.map((s, i) => `${s} = ${relacion[i]!.toFixed(3)}`).join('; ')}.`,
  ];
  let factor = 1;
  for (; factor <= 12; factor++) {
    if (relacion.every((r) => Math.abs(r * factor - Math.round(r * factor)) <= tolerancia * factor ** 0.5 * 0.5 + 0.02)) break;
  }
  if (factor > 12) throw new RangeError('No se encontró una relación entera sencilla; revisa los datos.');
  if (factor > 1) pasos.push(`No son enteros: se multiplica por ${factor}: ${elementos.map((s, i) => `${s} = ${(relacion[i]! * factor).toFixed(2)}`).join('; ')}.`);
  const subindices = Object.fromEntries(elementos.map((s, i) => [s, Math.round(relacion[i]! * factor)]));
  // Orden de Hill para escribir la fórmula
  const orden = [...elementos].sort((a, b) => {
    const p = (x: string) => (x === 'C' ? 0 : x === 'H' ? 1 : 2);
    return elementos.includes('C') && p(a) !== p(b) ? p(a) - p(b) : a.localeCompare(b, 'en');
  });
  const formula = orden.map((s) => s + (subindices[s]! > 1 ? subindices[s] : '')).join('');
  pasos.push(`Fórmula empírica: ${formula}.`);
  return { subindices, formula, masaMolarEmpirica: masaMolar(formula), pasos };
}

/** Fórmula molecular = (fórmula empírica)ₖ con k = M / M_empírica (redondeado). */
export function formulaMolecular(empirica: string, masaMolarMolecular: number): { k: number; formula: string; pasos: string[] } {
  const Me = masaMolar(empirica);
  const k = Math.round(masaMolarMolecular / Me);
  if (k < 1) throw new RangeError('La masa molar es menor que la de la fórmula empírica.');
  const f = parsearFormula(empirica);
  const formula = [...f.atomos].map(([s, n]) => s + (n * k > 1 ? n * k : '')).join('');
  return {
    k,
    formula,
    pasos: [`M(empírica) = ${Me.toFixed(3)} g/mol.`, `k = M / M(empírica) = ${masaMolarMolecular} / ${Me.toFixed(3)} = ${(masaMolarMolecular / Me).toFixed(3)} ≈ ${k}.`, `Fórmula molecular: (${empirica})×${k} = ${formula}.`],
  };
}

/** Composición centesimal con el detalle por elemento. */
export const composicionCentesimal = composicionPorcentual;
