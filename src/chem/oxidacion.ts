/**
 * Estados (números) de oxidación por las reglas de los textos:
 *  1. Elemento libre (Fe, O₂, Cl₂): 0.
 *  2. F: −1 siempre.
 *  3. Grupo 1: +1; grupo 2: +2; Al: +3; Zn, Cd: +2; Ag: +1.
 *  4. H: +1 (−1 en hidruros metálicos: NaH, CaH₂).
 *  5. O: −2 (−1 en peróxidos: H₂O₂, Na₂O₂, BaO₂; +2 en OF₂).
 *  6. Cl, Br, I: −1 si no hay O y son el elemento más electronegativo.
 *  7. El resto por diferencia: Σ (átomos × EO) = carga de la especie.
 * En las sales con dos elementos desconocidos (FeSO₄) se reconoce el oxoanión (SO₄²⁻).
 * El resultado puede ser fraccionario (EO promedio): Fe₃O₄ → Fe +8/3.
 */
import { parsearFormula, type Formula } from './formula';
import { elementoPorSimbolo, grupo, tipoElemento } from './elements';
import { Fraccion, frac } from './fraction';
import { METALES } from './nomenclatura/inorganica';

export interface ResultadoOxidacion {
  estados: Map<string, Fraccion>;
  pasos: string[];
  /** true si no se pudo determinar algún EO. */
  incompleto: boolean;
}

/** Oxoaniones comunes: elemento central → [O por átomo central, carga] posibles. */
const OXOANIONES: Record<string, [number, number][]> = {
  S: [[4, -2], [3, -2]],
  Se: [[4, -2], [3, -2]],
  Te: [[4, -2], [3, -2]],
  N: [[3, -1], [2, -1]],
  P: [[4, -3], [3, -1], [3.5, -4]], // fosfato, metafosfato, pirofosfato (P₂O₇⁴⁻)
  As: [[4, -3], [3, -3], [3, -1]], // arseniato, arsenito, metaarseniato
  Sb: [[4, -3], [3, -3], [3, -1]],
  C: [[3, -2], [2, -2]], // carbonato, oxalato (C₂O₄²⁻: 2 O por C)
  Si: [[3, -2], [4, -4]],
  B: [[3, -3], [2, -1]], // borato, metaborato
  Cl: [[4, -1], [3, -1], [2, -1], [1, -1]],
  Br: [[4, -1], [3, -1], [2, -1], [1, -1]],
  I: [[4, -1], [3, -1], [2, -1], [1, -1]],
  Mn: [[4, -1], [4, -2]],
  Cr: [[4, -2], [3.5, -2]], // cromato, dicromato (Cr₂O₇²⁻)
};

const signo = (x: Fraccion) => (x.signo() > 0 ? `+${x}` : x.toString());

export function estadosOxidacion(entrada: string | Formula): ResultadoOxidacion {
  const f = typeof entrada === 'string' ? parsearFormula(entrada) : entrada;
  const atomos = [...f.atomos.entries()];
  const estados = new Map<string, Fraccion>();
  const pasos: string[] = [];
  const carga = f.carga;

  if (atomos.length === 1) {
    const [s, n] = atomos[0]!;
    const eo = frac(carga, n);
    estados.set(s, eo);
    pasos.push(carga === 0 ? `${s} está como elemento libre: EO = 0.` : `Ion monoatómico/homonuclear: EO = carga/átomos = ${eo}.`);
    return { estados, pasos, incompleto: false };
  }

  const tiene = (s: string) => f.atomos.has(s);
  const soloMetalesYH = atomos.every(([s]) => s === 'H' || tipoElemento(elementoPorSimbolo(s)!) === 'metal');
  const fijar = (s: string, v: number | Fraccion, regla: string) => {
    if (!tiene(s) || estados.has(s)) return;
    estados.set(s, typeof v === 'number' ? frac(v) : v);
    pasos.push(`${s}: ${signo(estados.get(s)!)} (${regla}).`);
  };

  fijar('F', -1, 'el flúor siempre es −1');
  for (const [s] of atomos) {
    const el = elementoPorSimbolo(s)!;
    const g = grupo(el.z);
    if (s === 'H') continue;
    if (g === 1) fijar(s, 1, 'metal alcalino');
    else if (g === 2) fijar(s, 2, 'metal alcalinotérreo');
    else if (s === 'Al') fijar(s, 3, 'el aluminio actúa con +3');
    else if (s === 'Zn' || s === 'Cd') fijar(s, 2, `el ${el.nombre.toLowerCase()} actúa con +2`);
    else if (s === 'Ag') fijar(s, 1, 'la plata actúa con +1');
  }
  if (tiene('H')) fijar('H', soloMetalesYH ? -1 : 1, soloMetalesYH ? 'hidruro metálico' : 'el hidrógeno con no metales es +1');

  if (tiene('O') && !estados.has('O')) {
    const nO = f.atomos.get('O')!;
    // Peróxidos: H₂O₂, M₂O₂ (alcalinos), MO₂ (alcalinotérreos)
    const otros = atomos.filter(([s]) => s !== 'O');
    const esPeroxido =
      carga === 0 &&
      otros.length === 1 &&
      (() => {
        const [s, n] = otros[0]!;
        const g = s === 'H' ? 1 : grupo(elementoPorSimbolo(s)!.z);
        return (g === 1 && n === nO) || (g === 2 && nO === 2 * n);
      })();
    if (esPeroxido) fijar('O', -1, 'peróxido: grupo O₂²⁻, el O es −1');
    else if (tiene('F') && atomos.length === 2) fijar('O', frac(f.atomos.get('F')!, nO), 'con flúor el O es positivo');
    else if (otros.every(([s]) => estados.has(s))) {
      // Si todo lo demás ya se conoce, el O sale por diferencia (peróxido ZnO₂, superóxido KO₂)
      const resto = otros.reduce((acc, [s, n]) => acc.sumar(estados.get(s)!.multiplicar(frac(n))), Fraccion.CERO);
      const eoO = frac(carga).restar(resto).dividir(frac(nO));
      fijar('O', eoO, eoO.igual(frac(-2)) ? 'el oxígeno combinado es −2' : 'por diferencia (peróxido o superóxido)');
    } else fijar('O', -2, 'el oxígeno combinado es −2');
  }

  if (!tiene('O')) {
    const halogenos = atomos.filter(([s]) => ['Cl', 'Br', 'I'].includes(s)).map(([s]) => s);
    const masEN = [...atomos].sort((a, b) => (elementoPorSimbolo(b[0])!.electronegatividad ?? 0) - (elementoPorSimbolo(a[0])!.electronegatividad ?? 0))[0]![0];
    for (const h of halogenos) if (h === masEN) fijar(h, -1, 'halógeno sin oxígeno, el más electronegativo');
    // Anfígenos y nitrogenoides como anión simple (sulfuros, nitruros) frente a metales
    const g16 = atomos.find(([s]) => ['S', 'Se', 'Te'].includes(s) && s === masEN);
    if (g16 && atomos.filter(([s]) => !estados.has(s)).length > 1) fijar(g16[0], -2, 'anión de los anfígenos (sulfuro…)');
  }

  const suma = () => atomos.reduce((acc, [s, n]) => (estados.has(s) ? acc.sumar(estados.get(s)!.multiplicar(frac(n))) : acc), Fraccion.CERO);
  let desconocidos = atomos.filter(([s]) => !estados.has(s));

  // Sales con metal + oxoanión: dos desconocidos
  if (desconocidos.length === 2) {
    // Central del oxoanión: si ambos podrían serlo (Cr y B en Cr(BO₂)₂), se prefiere el no metal
    const conOxoanion = desconocidos.filter(([s]) => OXOANIONES[s]);
    const central = conOxoanion.find(([s]) => tipoElemento(elementoPorSimbolo(s)!) !== 'metal') ?? conOxoanion[0];
    const metal = desconocidos.find(([s]) => s !== central?.[0]);
    const nO = f.atomos.get('O') ?? 0;
    if (central && metal && nO > 0) {
      const candidatos: { eoMetal: Fraccion; x: Fraccion; k: number; q: number }[] = [];
      for (const [oPorX, q] of OXOANIONES[central[0]]!) {
        if (Math.abs(nO / central[1] - oPorX) > 1e-9) continue;
        // Carga de los aniones presentes (los H de las sales ácidas ya están contados en suma())
        const nAniones = oPorX === 3.5 ? central[1] / 2 : central[1];
        const cargaAniones = frac(q * nAniones);
        const resto = frac(carga).restar(cargaAniones).restar(suma().restar(frac(-2 * nO)));
        const eoMetal = resto.dividir(frac(metal[1]));
        if (eoMetal.signo() <= 0) continue;
        // EO del central en el anión (X_p O_{k·p})^q:  p·x − 2·k·p = q  →  x = (q + 2kp)/p
        const porAnion = oPorX === 3.5 ? 2 : 1;
        candidatos.push({ eoMetal, x: frac(q + 2 * oPorX * porAnion, porAnion), k: oPorX, q });
      }
      // Si hay varias posibilidades (CuAsO₃: metaarseniato con Cu⁺ o arsenito con Cu³⁺), se prefiere
      // la que da al metal un estado de oxidación habitual (PubChem)
      // Primero las valencias del metal como catión (tabla de nomenclatura); luego las de PubChem
      const comoCation = METALES.find((m) => m.s === metal[0])?.v ?? [];
      const comunes = elementoPorSimbolo(metal[0])?.estadosOxidacion ?? [];
      // El Hg(I) solo existe como dímero Hg₂²⁺: con un número impar de Hg no puede ser +1
      const posible = (c: (typeof candidatos)[number]) => !(metal[0] === 'Hg' && c.eoMetal.igual(frac(1)) && metal[1] % 2 === 1);
      const entero = (c: (typeof candidatos)[number], lista: number[]) => c.eoMetal.d === 1n && lista.includes(Number(c.eoMetal.n));
      const elegido =
        candidatos.find((c) => posible(c) && entero(c, comoCation)) ??
        candidatos.find((c) => posible(c) && entero(c, comunes)) ??
        candidatos.find(posible) ??
        candidatos[0];
      if (elegido) {
        estados.set(metal[0], elegido.eoMetal);
        estados.set(central[0], elegido.x);
        pasos.push(`Se reconoce el oxoanión (${central[0]}O${elegido.k === 3.5 ? '₇ con 2 átomos' : elegido.k})${elegido.q}: ${central[0]} = ${signo(elegido.x)}.`);
        pasos.push(`${metal[0]} por diferencia: ${signo(elegido.eoMetal)}.`);
      }
    }
    desconocidos = atomos.filter(([s]) => !estados.has(s));
  }

  if (desconocidos.length === 1) {
    const [s, n] = desconocidos[0]!;
    const eo = frac(carga).restar(suma()).dividir(frac(n));
    estados.set(s, eo);
    pasos.push(`${s} por diferencia: ${n}·x + (${suma()}) = ${carga} → x = ${signo(eo)}.`);
  } else if (desconocidos.length > 1) {
    pasos.push(`No se pudo determinar el EO de ${desconocidos.map(([s]) => s).join(' y ')} con las reglas simples.`);
  }
  if (estados.size === atomos.length) {
    pasos.push(`Comprobación: Σ = ${suma()} = carga ${carga}.`);
  }
  return { estados, pasos, incompleto: estados.size < atomos.length };
}
