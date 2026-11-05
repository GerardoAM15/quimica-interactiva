/**
 * Reacciones orgánicas básicas sobre el grafo molecular (sin mecanismos):
 *
 *   Combustión completa:   CₓHᵧO_z + O₂ → x CO₂ + (y/2) H₂O          (balanceada con chem/balance)
 *   Hidrogenación:          C=C + H₂ → C–C   (catalizador Ni, Pd o Pt)
 *   Halogenación de alcanos (radicalaria, luz UV):  R–H + X₂ → R–X + HX   (mezcla de isómeros)
 *   Adición a alquenos:     C=C + X₂ → X–C–C–X ;  C=C + HX y C=C + H₂O (regla de Markovnikov)
 *   Esterificación de Fischer:  R–COOH + R′–OH ⇌ R–COO–R′ + H₂O   (H⁺)
 *   Saponificación:         R–COO–R′ + NaOH → R–COO⁻Na⁺ + R′–OH
 */
import { balancear, ecuacionTexto } from './balance';
import { formulaMolecularGrafo, nombrarOrganico, type GrafoOrg, type Orden } from './nomenclatura/organica';

export class ErrorReaccionOrg extends Error {
  override name = 'ErrorReaccionOrg';
}

const copiar = (g: GrafoOrg): GrafoOrg => ({ atomos: g.atomos.map((a) => ({ ...a })), enlaces: g.enlaces.map((e) => ({ ...e })) });
const VAL: Record<string, number> = { C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1 };
const hidrogenos = (g: GrafoOrg, i: number) => VAL[g.atomos[i]!.el]! + (g.atomos[i]!.el !== 'C' ? g.atomos[i]!.carga : 0) - g.enlaces.reduce((s, e) => s + (e.a === i || e.b === i ? e.orden : 0), 0);
const nombre = (g: GrafoOrg) => {
  try {
    return nombrarOrganico(g).nombre;
  } catch {
    return formulaMolecularGrafo(g);
  }
};
const agregar = (g: GrafoOrg, el: string, a: number, orden: Orden = 1) => {
  g.atomos.push({ el, carga: 0 });
  g.enlaces.push({ a, b: g.atomos.length - 1, orden });
  return g.atomos.length - 1;
};

export interface Producto {
  nombre: string;
  grafo: GrafoOrg;
  /** Fracción estadística (halogenación) cuando hay varios productos. */
  fraccion?: number;
}

export interface ResultadoReaccion {
  ecuacion: string;
  productos: Producto[];
  explicacion: string[];
}

/** Combustión completa (C, H y O): se balancea con el método algebraico. */
export function combustion(g: GrafoOrg): ResultadoReaccion {
  if (g.atomos.some((a) => !['C', 'O'].includes(a.el))) throw new ErrorReaccionOrg('La combustión completa se plantea aquí solo para compuestos de C, H y O.');
  const f = formulaMolecularGrafo(g);
  const b = balancear(`${f} + O2 -> CO2 + H2O`);
  return {
    ecuacion: ecuacionTexto(b),
    productos: [],
    explicacion: [`${nombre(g)} (${f}) arde con exceso de O₂ y forma solo CO₂ y H₂O.`, 'Coeficientes enteros mínimos por el método algebraico.'],
  };
}

/** Hidrogenación catalítica de todos los enlaces múltiples C=C y C≡C (no aromáticos). */
export function hidrogenar(g: GrafoOrg): ResultadoReaccion {
  const p = copiar(g);
  let nH2 = 0;
  const enAnilloAromatico = (e: { a: number; b: number }) => esAromatico(g, e.a) && esAromatico(g, e.b);
  for (const e of p.enlaces) {
    if (e.orden > 1 && g.atomos[e.a]!.el === 'C' && g.atomos[e.b]!.el === 'C' && !enAnilloAromatico(e)) {
      nH2 += e.orden - 1;
      e.orden = 1;
    }
  }
  if (!nH2) throw new ErrorReaccionOrg('No hay enlaces C=C ni C≡C que hidrogenar.');
  const n = nombre(p);
  return {
    ecuacion: `${nombre(g)} + ${nH2 > 1 ? nH2 + ' ' : ''}H₂ → ${n}`,
    productos: [{ nombre: n, grafo: p }],
    explicacion: [`Cada enlace π se rompe y se adicionan dos átomos de H (${nH2} mol de H₂ por mol).`, 'Catalizador: Ni, Pd o Pt.'],
  };
}

/** Halogenación radicalaria de un alcano: se sustituye un H; productos ponderados por el número de H equivalentes. */
export function halogenar(g: GrafoOrg, X: 'Cl' | 'Br'): ResultadoReaccion {
  if (g.enlaces.some((e) => e.orden > 1) || g.atomos.some((a) => a.el !== 'C')) throw new ErrorReaccionOrg('La halogenación por sustitución se aplica aquí a alcanos.');
  const cuenta = new Map<string, { grafo: GrafoOrg; h: number }>();
  let total = 0;
  g.atomos.forEach((_, i) => {
    const h = hidrogenos(g, i);
    if (!h) return;
    const p = copiar(g);
    agregar(p, X, i);
    const n = nombre(p);
    cuenta.set(n, { grafo: p, h: (cuenta.get(n)?.h ?? 0) + h });
    total += h;
  });
  const productos = [...cuenta].map(([n, v]) => ({ nombre: n, grafo: v.grafo, fraccion: v.h / total }));
  return {
    ecuacion: `${nombre(g)} + ${X}₂ → ${productos.map((p) => p.nombre).join(' / ')} + H${X}`,
    productos,
    explicacion: [
      'Reacción en cadena por radicales libres (luz UV o calor): un H se sustituye por un halógeno.',
      'Porcentajes estadísticos: proporcionales al número de H equivalentes. En la práctica los H de carbonos terciarios y secundarios reaccionan más rápido (sobre todo con Br₂).',
    ],
  };
}

function esAromatico(g: GrafoOrg, i: number): boolean {
  // Carbono de un anillo de 6 con dobles alternados (detección simple para no hidrogenar el benceno)
  const vec = (u: number) => g.enlaces.filter((e) => e.a === u || e.b === u).map((e) => ({ j: e.a === u ? e.b : e.a, o: e.orden }));
  const buscar = (u: number, camino: number[]): number[] | null => {
    if (camino.length === 6) return vec(u).some((v) => v.j === camino[0]) ? camino : null;
    for (const v of vec(u)) if (!camino.includes(v.j) && g.atomos[v.j]!.el === 'C') {
      const r = buscar(v.j, [...camino, v.j]);
      if (r) return r;
    }
    return null;
  };
  const ciclo = buscar(i, [i]);
  if (!ciclo) return false;
  const ord = ciclo.map((u, k) => g.enlaces.find((e) => (e.a === u && e.b === ciclo[(k + 1) % 6]) || (e.b === u && e.a === ciclo[(k + 1) % 6]))!.orden);
  return ord.filter((o) => o === 2).length === 3;
}

export type Reactivo = 'X2' | 'HX' | 'H2O';

/** Adición electrofílica al primer doble enlace C=C (Markovnikov para HX y H₂O). */
export function adicion(g: GrafoOrg, reactivo: Reactivo, X: 'Cl' | 'Br' = 'Br'): ResultadoReaccion {
  const e = g.enlaces.find((x) => x.orden === 2 && g.atomos[x.a]!.el === 'C' && g.atomos[x.b]!.el === 'C' && !esAromatico(g, x.a));
  if (!e) throw new ErrorReaccionOrg('La adición necesita un doble enlace C=C (alqueno).');
  const p = copiar(g);
  const pe = p.enlaces[g.enlaces.indexOf(e)]!;
  pe.orden = 1;
  const explicacion = ['Se rompe el enlace π y cada carbono del doble enlace recibe un átomo o grupo.'];
  let reac: string;
  if (reactivo === 'X2') {
    agregar(p, X, e.a);
    agregar(p, X, e.b);
    reac = `${X}₂`;
    explicacion.push('Los dos átomos de halógeno quedan en carbonos vecinos (dihalogenuro vecinal).');
  } else {
    // Markovnikov: el H va al carbono con más H; el X (u OH) al otro
    const [masH, menosH] = hidrogenos(g, e.a) >= hidrogenos(g, e.b) ? [e.a, e.b] : [e.b, e.a];
    void masH;
    agregar(p, reactivo === 'HX' ? X : 'O', menosH);
    reac = reactivo === 'HX' ? `H${X}` : 'H₂O (H⁺)';
    explicacion.push('Regla de Markovnikov: el H se une al carbono del doble enlace que ya tiene más hidrógenos (se forma el carbocatión más estable).');
  }
  const n = nombre(p);
  return { ecuacion: `${nombre(g)} + ${reac} → ${n}`, productos: [{ nombre: n, grafo: p }], explicacion };
}

/** Busca el grupo –COOH: devuelve el carbono y el O del OH. */
function grupoCarboxilo(g: GrafoOrg) {
  for (const [c, a] of g.atomos.entries()) {
    if (a.el !== 'C') continue;
    const os = g.enlaces.filter((e) => (e.a === c || e.b === c) && g.atomos[e.a === c ? e.b : e.a]!.el === 'O');
    const dbl = os.find((e) => e.orden === 2);
    const oh = os.find((e) => e.orden === 1 && hidrogenos(g, e.a === c ? e.b : e.a) === 1);
    if (dbl && oh) return { c, oh: oh.a === c ? oh.b : oh.a };
  }
  return null;
}

/** Esterificación de Fischer: ácido + alcohol ⇌ éster + agua. */
export function esterificar(acido: GrafoOrg, alcohol: GrafoOrg): ResultadoReaccion {
  const cx = grupoCarboxilo(acido);
  if (!cx) throw new ErrorReaccionOrg('El primer reactivo debe ser un ácido carboxílico.');
  const ohAlc = alcohol.atomos.findIndex((a, i) => a.el === 'O' && hidrogenos(alcohol, i) === 1 && alcohol.enlaces.filter((e) => e.a === i || e.b === i).length === 1);
  if (ohAlc < 0) throw new ErrorReaccionOrg('El segundo reactivo debe ser un alcohol.');
  // El OH del ácido sale como agua; el O del alcohol se une al carbono carbonílico
  const p = copiar(acido);
  const quitar = cx.oh;
  p.enlaces = p.enlaces.filter((e) => e.a !== quitar && e.b !== quitar);
  const mapa = new Map<number, number>();
  alcohol.atomos.forEach((a, i) => {
    mapa.set(i, p.atomos.length);
    p.atomos.push({ ...a });
  });
  for (const e of alcohol.enlaces) p.enlaces.push({ a: mapa.get(e.a)!, b: mapa.get(e.b)!, orden: e.orden });
  p.enlaces.push({ a: cx.c, b: mapa.get(ohAlc)!, orden: 1 });
  // Eliminar el átomo O suelto y reindexar
  const keep = p.atomos.map((_, i) => i).filter((i) => i !== quitar);
  const nuevo = new Map(keep.map((v, k) => [v, k]));
  const ester: GrafoOrg = { atomos: keep.map((i) => p.atomos[i]!), enlaces: p.enlaces.map((e) => ({ a: nuevo.get(e.a)!, b: nuevo.get(e.b)!, orden: e.orden })) };
  const n = nombre(ester);
  return {
    ecuacion: `${nombre(acido)} + ${nombre(alcohol)} ⇌ ${n} + H₂O`,
    productos: [{ nombre: n, grafo: ester }],
    explicacion: [
      'Catálisis ácida (H₂SO₄) y calor; es un equilibrio (se desplaza retirando el agua o con exceso de alcohol).',
      'El –OH sale del ácido y el H del alcohol: el oxígeno del alcohol queda en el éster.',
      'Nombre del éster: «-oato de …ilo» (la parte del ácido primero, la del alcohol al final).',
    ],
  };
}

/** Saponificación: éster + NaOH → sal de sodio del ácido + alcohol. */
export function saponificar(ester: GrafoOrg): ResultadoReaccion {
  let r: ReturnType<typeof nombrarOrganico>;
  try {
    r = nombrarOrganico(ester);
  } catch {
    throw new ErrorReaccionOrg('No se reconoce el éster.');
  }
  if (r.principal !== 'ester') throw new ErrorReaccionOrg('La saponificación necesita un éster.');
  // Separar por el enlace C(=O)–O–R′
  const c = r.cadena[0]!;
  const oEster = ester.enlaces
    .filter((e) => (e.a === c || e.b === c) && e.orden === 1)
    .map((e) => (e.a === c ? e.b : e.a))
    .find((i) => ester.atomos[i]!.el === 'O')!;
  const rPrima = ester.enlaces.filter((e) => e.a === oEster || e.b === oEster).map((e) => (e.a === oEster ? e.b : e.a)).find((i) => i !== c)!;
  // Alcohol: el R′ con un OH; sal: el resto, con O⁻
  const alcohol = copiar(ester);
  alcohol.enlaces = alcohol.enlaces.filter((e) => !((e.a === c && e.b === oEster) || (e.b === c && e.a === oEster)));
  const componente = (g: GrafoOrg, ini: number) => {
    const vis = new Set([ini]);
    const pila = [ini];
    while (pila.length) {
      const u = pila.pop()!;
      for (const e of g.enlaces) {
        const v = e.a === u ? e.b : e.b === u ? e.a : -1;
        if (v >= 0 && !vis.has(v)) vis.add(v), pila.push(v);
      }
    }
    return [...vis].sort((a, b) => a - b);
  };
  const sub = (g: GrafoOrg, idx: number[]): GrafoOrg => {
    const m = new Map(idx.map((v, k) => [v, k]));
    return { atomos: idx.map((i) => ({ ...g.atomos[i]! })), enlaces: g.enlaces.filter((e) => m.has(e.a) && m.has(e.b)).map((e) => ({ a: m.get(e.a)!, b: m.get(e.b)!, orden: e.orden })) };
  };
  const gAlc = sub(alcohol, componente(alcohol, rPrima));
  const acidoIdx = componente(alcohol, c);
  const gAcido = sub(alcohol, acidoIdx);
  agregar(gAcido, 'O', acidoIdx.indexOf(c));
  const nAcido = nombre(gAcido); // «ácido …oico»
  const sal = nAcido.replace(/^ácido (.+)oico$/, '$1oato de sodio');
  const nAlc = nombre(gAlc);
  return {
    ecuacion: `${r.nombre} + NaOH → ${sal} + ${nAlc}`,
    productos: [
      { nombre: sal, grafo: gAcido },
      { nombre: nAlc, grafo: gAlc },
    ],
    explicacion: ['Hidrólisis básica del éster (irreversible): se forma la sal del ácido y se libera el alcohol.', 'Con ésteres de ácidos grasos (grasas) la sal es un jabón.'],
  };
}
