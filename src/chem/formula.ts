/**
 * Parser de fórmulas químicas, masa molar y composición centesimal.
 *
 * Acepta: H2O, Ca(OH)2, Al2(SO4)3, K4[Fe(CN)6], CuSO4·5H2O (también con * o .), iones
 * (SO4^2-, NH4^+, Fe^3+, OH-, NH4+), subíndices Unicode (H₂O, SO₄²⁻) y estados (s), (l), (g), (aq).
 *
 * Masa molar: M = Σ nᵢ · Aᵣ(i)   [g/mol], con las masas atómicas de PubChem.
 * (La masa de los electrones ganados o perdidos por un ion se desprecia, como es usual.)
 */
import { elementoPorSimbolo } from './elements';

export class ErrorFormula extends Error {
  constructor(
    mensaje: string,
    public readonly posicion: number,
  ) {
    super(mensaje);
    this.name = 'ErrorFormula';
  }
}

export interface Formula {
  /** Átomos por elemento, en orden de aparición. */
  atomos: Map<string, number>;
  /** Carga neta del ion (0 si es neutro). */
  carga: number;
  /** Texto normalizado que se analizó. */
  texto: string;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** Convierte subíndices/superíndices Unicode a notación ASCII (SO₄²⁻ → SO4^2-). */
export function normalizarTexto(texto: string): string {
  let t = texto.trim().replace(/\s+/g, '');
  t = t.replace(/[₀-₉]/g, (d) => String(SUB.indexOf(d)));
  const digitosSup = (ds: string) => [...ds].map((d) => SUP.indexOf(d)).join('');
  // Signo antes del número (Fe⁺³, notación frecuente en textos peruanos) o después (SO₄²⁻)
  t = t.replace(/([⁺⁻])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, s: string, ds: string) => `^${digitosSup(ds)}${s === '⁺' ? '+' : '-'}`);
  t = t.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])/g, (_, ds: string, s: string) => `^${digitosSup(ds)}${s === '⁺' ? '+' : '-'}`);
  t = t.replace(/[−–]/g, '-'); // signos menos tipográficos
  t = t.replace(/[*•∙]/g, '·');
  // El punto entre una fórmula y un número/mayúscula indica hidrato: CuSO4.5H2O
  t = t.replace(/\.(?=\d|[A-Z(])/g, '·');
  // Estado físico al final
  t = t.replace(/\((s|l|g|aq|ac)\)$/i, '');
  return t;
}

/** Analiza una fórmula y devuelve los átomos de cada elemento y la carga. */
export function parsearFormula(entrada: string): Formula {
  const texto = normalizarTexto(entrada);
  if (!texto) throw new ErrorFormula('Escribe una fórmula.', 0);

  let i = 0;
  const ver = () => texto[i];

  const leerNumero = (): number | null => {
    const m = /^\d+/.exec(texto.slice(i));
    if (!m) return null;
    i += m[0].length;
    const n = Number(m[0]);
    if (n === 0) throw new ErrorFormula('Un subíndice no puede ser 0.', i - m[0].length);
    return n;
  };

  const sumar = (destino: Map<string, number>, origen: Map<string, number>, factor: number) => {
    for (const [el, n] of origen) destino.set(el, (destino.get(el) ?? 0) + n * factor);
  };

  // secuencia := (elemento | (secuencia) | [secuencia])+  con subíndices opcionales
  const leerSecuencia = (cierre: string | null): Map<string, number> => {
    const atomos = new Map<string, number>();
    while (i < texto.length) {
      const c = ver()!;
      if (cierre && c === cierre) return atomos;
      if (c === '(' || c === '[') {
        const abre = i;
        i++;
        const interior = leerSecuencia(c === '(' ? ')' : ']');
        if (ver() !== (c === '(' ? ')' : ']')) {
          throw new ErrorFormula(`Falta cerrar el «${c}» abierto en la posición ${abre + 1}.`, abre);
        }
        if (interior.size === 0) throw new ErrorFormula('Paréntesis vacío.', abre);
        i++;
        sumar(atomos, interior, leerNumero() ?? 1);
        continue;
      }
      if (/[A-Z]/.test(c)) {
        const m = /^[A-Z][a-z]?/.exec(texto.slice(i))!;
        let simbolo = m[0];
        // Si la letra minúscula no forma un símbolo válido, se toma solo la mayúscula ("Hf" sí, "Ho" sí…)
        if (simbolo.length === 2 && !elementoPorSimbolo(simbolo) && elementoPorSimbolo(simbolo[0]!)) {
          simbolo = simbolo[0]!;
        }
        if (!elementoPorSimbolo(simbolo)) {
          throw new ErrorFormula(`«${simbolo}» no es el símbolo de ningún elemento.`, i);
        }
        i += simbolo.length;
        atomos.set(simbolo, (atomos.get(simbolo) ?? 0) + (leerNumero() ?? 1));
        continue;
      }
      if (c === ')' || c === ']') throw new ErrorFormula(`«${c}» sin abrir.`, i);
      if (/[a-z]/.test(c)) {
        throw new ErrorFormula(`Los símbolos empiezan con mayúscula: ¿quisiste decir «${c.toUpperCase()}»?`, i);
      }
      break; // carga, punto de hidrato o carácter no reconocido: lo trata el llamador
    }
    return atomos;
  };

  const leerCarga = (): number => {
    // ^2-, ^-2, ^+, {2-}, o signos al final: OH-, NH4+, O--
    let m = /^\^(\d*)([+-])$|^\^([+-])(\d*)$|^\{(\d*)([+-])\}$/.exec(texto.slice(i));
    if (m) {
      const n = Number(m[1] || m[4] || m[5] || 1);
      const signo = (m[2] || m[3] || m[6]) === '+' ? 1 : -1;
      i = texto.length;
      return signo * n;
    }
    m = /^([+-]+)$/.exec(texto.slice(i));
    if (m) {
      i = texto.length;
      return (m[1]![0] === '+' ? 1 : -1) * m[1]!.length;
    }
    // Signo y número sin «^»: Fe+3, SO4-2
    m = /^([+-])(\d+)$/.exec(texto.slice(i));
    if (m) {
      i = texto.length;
      return (m[1] === '+' ? 1 : -1) * Number(m[2]);
    }
    return 0;
  };

  const atomos = new Map<string, number>();
  let carga = 0;
  // partes separadas por «·» (hidratos y sales dobles): CuSO4·5H2O
  for (;;) {
    const coef = leerNumero() ?? 1;
    const inicio = i;
    const parte = leerSecuencia(null);
    if (parte.size === 0) throw new ErrorFormula('Se esperaba un símbolo de elemento.', inicio);
    sumar(atomos, parte, coef);
    if (ver() === '·') {
      i++;
      continue;
    }
    carga = leerCarga();
    break;
  }
  if (i < texto.length) throw new ErrorFormula(`Carácter no reconocido: «${texto[i]}».`, i);
  return { atomos, carga, texto };
}

export function masaAtomica(simbolo: string): number {
  const e = elementoPorSimbolo(simbolo);
  if (!e) throw new Error(`Elemento desconocido: ${simbolo}`);
  return e.masaAtomica;
}

export interface PasoMasaMolar {
  simbolo: string;
  cantidad: number;
  masaAtomica: number;
  subtotal: number;
}

/** Masa molar con el detalle por elemento (para «Ver paso a paso»). */
export function masaMolarDetallada(f: Formula | string): { total: number; pasos: PasoMasaMolar[] } {
  const formula = typeof f === 'string' ? parsearFormula(f) : f;
  const pasos = [...formula.atomos].map(([simbolo, cantidad]) => {
    const ar = masaAtomica(simbolo);
    return { simbolo, cantidad, masaAtomica: ar, subtotal: cantidad * ar };
  });
  return { total: pasos.reduce((s, p) => s + p.subtotal, 0), pasos };
}

/** Masa molar en g/mol. */
export const masaMolar = (f: Formula | string) => masaMolarDetallada(f).total;

/** Composición centesimal: %(i) = nᵢ·Aᵣ(i) / M × 100. */
export function composicionPorcentual(f: Formula | string): { simbolo: string; porcentaje: number }[] {
  const { total, pasos } = masaMolarDetallada(f);
  return pasos.map((p) => ({ simbolo: p.simbolo, porcentaje: (100 * p.subtotal) / total }));
}

/** Fórmula de Hill: C primero, luego H, luego el resto en orden alfabético (sin C: todo alfabético). */
export function formulaHill(f: Formula | string): string {
  const formula = typeof f === 'string' ? parsearFormula(f) : f;
  const simbolos = [...formula.atomos.keys()];
  const conC = formula.atomos.has('C');
  const orden = simbolos.sort((a, b) => {
    if (conC) {
      const p = (s: string) => (s === 'C' ? 0 : s === 'H' ? 1 : 2);
      if (p(a) !== p(b)) return p(a) - p(b);
    }
    return a.localeCompare(b, 'en');
  });
  const cuerpo = orden.map((s) => s + (formula.atomos.get(s)! > 1 ? formula.atomos.get(s) : '')).join('');
  if (formula.carga === 0) return cuerpo;
  const n = Math.abs(formula.carga);
  return `${cuerpo}${n > 1 ? n : ''}${formula.carga > 0 ? '+' : '-'}`;
}

/** Número total de átomos (fórmula unitaria). */
export const totalAtomos = (f: Formula | string) =>
  [...(typeof f === 'string' ? parsearFormula(f) : f).atomos.values()].reduce((a, b) => a + b, 0);

/** Convierte la fórmula normalizada a la sintaxis de mhchem para KaTeX: \ce{CuSO4.5H2O}. */
export function aMhchem(entrada: string): string {
  return normalizarTexto(entrada).replace(/·/g, '.').replace(/\^(\d*)([+-])/, '^{$1$2}');
}
