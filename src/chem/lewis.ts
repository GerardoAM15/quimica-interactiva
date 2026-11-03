/**
 * Estructuras de Lewis de moléculas e iones con un átomo central (AXₙ).
 *
 * Procedimiento de los textos:
 *  1. Contar los electrones de valencia: Σ V − carga.
 *  2. Unir cada ligando al central con un enlace simple (en los oxoácidos, O–H).
 *  3. Completar el octeto de los átomos terminales con pares libres (el H solo lleva 2 e⁻).
 *  4. Los electrones restantes van al átomo central.
 *  5. Si al central le falta el octeto, convertir pares libres de terminales (O, S, N, C) en enlaces
 *     múltiples. Be, B y Al pueden quedar con octeto incompleto.
 *  6. Carga formal: CF = V − (e⁻ no enlazantes + e⁻ de enlace / 2).
 * Las distintas ubicaciones equivalentes de los enlaces múltiples son las formas resonantes.
 */
import { electronesValencia, LETRAS_L } from './configuracion';
import { elementoPorSimbolo, periodo } from './elements';
import { ErrorVSEPR, esqueleto } from './vsepr';

export interface AtomoLewis {
  simbolo: string;
  paresLibres: number;
  /** Electrón desapareado (radicales). */
  electronSolitario: boolean;
  cargaFormal: number;
  x: number;
  y: number;
}

export interface EnlaceLewis {
  a: number;
  b: number;
  orden: number;
}

export interface EstructuraLewis {
  atomos: AtomoLewis[];
  enlaces: EnlaceLewis[];
  /** Electrones alrededor del central. */
  electronesCentral: number;
}

export interface ResultadoLewis {
  formula: string;
  central: string;
  totalElectrones: number;
  /** Estructuras resonantes que cumplen el octeto (o el máximo posible). */
  resonantes: EstructuraLewis[];
  /** Con octeto expandido y cargas formales mínimas (solo si el central es del periodo ≥ 3). */
  expandidas: EstructuraLewis[];
  octetoIncompleto: boolean;
  radical: boolean;
  pasos: string[];
}

const V = (s: string) => electronesValencia(elementoPorSimbolo(s)!.z);
const PUEDEN_ENLACE_MULTIPLE = new Set(['O', 'S', 'Se', 'N', 'C', 'P']);
const OCTETO_INCOMPLETO = new Set(['Be', 'B', 'Al']);

/** Copia profunda de una estructura. */
const copiar = (e: EstructuraLewis): EstructuraLewis => ({
  atomos: e.atomos.map((a) => ({ ...a })),
  enlaces: e.enlaces.map((b) => ({ ...b })),
  electronesCentral: e.electronesCentral,
});

/** Recalcula cargas formales y electrones del central: CF = V − (2·pares + solitario + Σ órdenes). */
function recalcular(e: EstructuraLewis): EstructuraLewis {
  e.atomos.forEach((a, i) => {
    const enlazantes = e.enlaces.filter((b) => b.a === i || b.b === i).reduce((s, b) => s + b.orden, 0);
    a.cargaFormal = V(a.simbolo) - (2 * a.paresLibres + (a.electronSolitario ? 1 : 0) + enlazantes);
  });
  const c = e.atomos[0]!;
  e.electronesCentral = 2 * c.paresLibres + (c.electronSolitario ? 1 : 0) + 2 * e.enlaces.filter((b) => b.a === 0).reduce((s, b) => s + b.orden, 0);
  return e;
}

const firma = (e: EstructuraLewis) => e.enlaces.map((b) => b.orden).join(',') + '|' + e.atomos.map((a) => a.paresLibres).join(',');
const sumaCargas = (e: EstructuraLewis) => e.atomos.reduce((s, a) => s + Math.abs(a.cargaFormal), 0);

/** Posiciones 2D: central en el origen y ligandos repartidos (en AX₂ con pares libres, en forma angular). */
function ubicar(n: number, paresCentral: number): [number, number][] {
  if (n === 2 && paresCentral > 0 && paresCentral < 3) return [[-0.94, 0.34], [0.94, 0.34]];
  if (n === 3 && paresCentral === 1) return [[-1, 0.35], [1, 0.35], [0, 1]];
  const inicio = n === 2 ? 0 : n === 3 ? -90 : n === 4 ? 0 : -90;
  return Array.from({ length: n }, (_, i) => {
    const ang = ((inicio + (360 * i) / n) * Math.PI) / 180;
    return [Math.round(Math.cos(ang) * 1e6) / 1e6, Math.round(Math.sin(ang) * 1e6) / 1e6];
  });
}

/** Construye la estructura de Lewis paso a paso. */
export function estructuraLewis(formula: string): ResultadoLewis {
  const { central, ligandos, carga } = esqueleto(formula);
  if (!elementoPorSimbolo(central) || ['transicion', 'lantanido', 'actinido'].includes(elementoPorSimbolo(central)!.familia)) {
    throw new ErrorVSEPR('Solo se construyen estructuras con átomo central de los bloques s y p.');
  }
  const simbolos = [central, ...ligandos.map((l) => l.simbolo), ...ligandos.filter((l) => l.esOH).map(() => 'H')];
  const total = simbolos.reduce((s, x) => s + V(x), 0) - carga;
  if (total <= 0) throw new ErrorVSEPR('La carga deja la especie sin electrones de valencia.');
  const pasos: string[] = [];
  pasos.push(`Electrones de valencia: ${simbolos.map((s) => `${s} (${V(s)})`).join(' + ')}${carga ? ` − (${carga})` : ''} = ${total}.`);

  // 2) Esqueleto con enlaces simples
  const posiciones = ubicar(ligandos.length, 0);
  const base: EstructuraLewis = {
    atomos: [{ simbolo: central, paresLibres: 0, electronSolitario: false, cargaFormal: 0, x: 0, y: 0 }],
    enlaces: [],
    electronesCentral: 0,
  };
  ligandos.forEach((l, i) => {
    const [x, y] = posiciones[i]!;
    base.atomos.push({ simbolo: l.simbolo, paresLibres: 0, electronSolitario: false, cargaFormal: 0, x, y });
    base.enlaces.push({ a: 0, b: i + 1, orden: 1 });
  });
  ligandos.forEach((l, i) => {
    if (!l.esOH) return;
    const o = base.atomos[i + 1]!;
    base.atomos.push({ simbolo: 'H', paresLibres: 0, electronSolitario: false, cargaFormal: 0, x: o.x * 1.75, y: o.y * 1.75 + 0.001 });
    base.enlaces.push({ a: i + 1, b: base.atomos.length - 1, orden: 1 });
  });
  let restantes = total - 2 * base.enlaces.length;
  if (restantes < 0) throw new ErrorVSEPR('No hay electrones suficientes para formar el esqueleto con enlaces simples.');
  pasos.push(`Se forman ${base.enlaces.length} enlaces simples (${2 * base.enlaces.length} e⁻). Quedan ${restantes} e⁻.`);

  // 3) Octeto de los terminales (el H ya tiene 2 e⁻ con su enlace)
  base.atomos.forEach((a, i) => {
    if (i === 0 || a.simbolo === 'H') return;
    const enlaces = base.enlaces.filter((b) => b.a === i || b.b === i).length;
    const faltan = Math.max(0, (8 - 2 * enlaces) / 2);
    const pares = Math.min(faltan, Math.floor(restantes / 2));
    a.paresLibres = pares;
    restantes -= 2 * pares;
  });
  pasos.push(`Se completa el octeto de los átomos terminales con pares libres. Quedan ${restantes} e⁻.`);

  // 4) El resto al central
  const c = base.atomos[0]!;
  c.paresLibres = Math.floor(restantes / 2);
  c.electronSolitario = restantes % 2 === 1;
  const radical = c.electronSolitario;
  pasos.push(
    restantes > 0
      ? `Los ${restantes} e⁻ restantes se colocan en el ${central} (${c.paresLibres} par(es) libre(s)${radical ? ' y 1 electrón desapareado: es un radical' : ''}).`
      : `No quedan electrones para el ${central}.`,
  );
  // Reubicar ligandos en forma angular si el central tiene pares libres
  const pos2 = ubicar(ligandos.length, c.paresLibres);
  ligandos.forEach((_, i) => {
    base.atomos[i + 1]!.x = pos2[i]![0];
    base.atomos[i + 1]!.y = pos2[i]![1];
  });
  base.enlaces.filter((b) => b.a !== 0).forEach((b) => {
    const o = base.atomos[b.a]!;
    const h = base.atomos[b.b]!;
    h.x = o.x * 1.75;
    h.y = o.y * 1.75;
  });
  recalcular(base);

  // 5) Enlaces múltiples si falta el octeto del central
  const deficit = Math.max(0, Math.floor((8 - base.electronesCentral) / 2));
  const incompletoPermitido = OCTETO_INCOMPLETO.has(central);
  let resonantes: EstructuraLewis[] = [base];
  if (deficit > 0 && !incompletoPermitido) {
    const elegibles = ligandos.map((l, i) => ({ i: i + 1, l })).filter(({ l }) => PUEDEN_ENLACE_MULTIPLE.has(l.simbolo) && !l.esOH);
    // Reparte «deficit» enlaces π entre los terminales elegibles (cada uno hasta triple)
    const repartos: number[][] = [];
    const recorrer = (k: number, restantesPi: number, actual: number[]) => {
      if (k === elegibles.length) {
        if (restantesPi === 0) repartos.push([...actual]);
        return;
      }
      for (let x = 0; x <= Math.min(2, restantesPi); x++) {
        actual.push(x);
        recorrer(k + 1, restantesPi - x, actual);
        actual.pop();
      }
    };
    recorrer(0, deficit, []);
    const candidatas = repartos
      .map((r) => {
        const e = copiar(base);
        r.forEach((x, k) => {
          const idx = elegibles[k]!.i;
          const a = e.atomos[idx]!;
          if (x > a.paresLibres) return;
          a.paresLibres -= x;
          e.enlaces.find((b) => b.a === 0 && b.b === idx)!.orden += x;
        });
        return recalcular(e);
      })
      .filter((e) => e.electronesCentral >= 8 - (radical ? 1 : 0));
    if (candidatas.length) {
      const minimo = Math.min(...candidatas.map(sumaCargas));
      const vistas = new Set<string>();
      resonantes = candidatas.filter((e) => sumaCargas(e) === minimo && !vistas.has(firma(e)) && vistas.add(firma(e)));
      pasos.push(
        `Al ${central} le faltan ${2 * deficit} e⁻ para el octeto: se forman ${deficit} enlace(s) múltiple(s) con pares libres de los terminales.` +
          (resonantes.length > 1 ? ` Hay ${resonantes.length} ubicaciones equivalentes: formas resonantes.` : ''),
      );
    }
  } else if (deficit > 0) {
    pasos.push(`El ${central} queda con ${base.electronesCentral} e⁻: es una excepción con octeto incompleto (típica de Be, B y Al).`);
  }

  // 6) Octeto expandido: periodo ≥ 3, se reducen las cargas formales convirtiendo O⁻ terminales en dobles enlaces
  const expandidas: EstructuraLewis[] = [];
  const zc = elementoPorSimbolo(central)!.z;
  if (periodo(zc) >= 3) {
    const vistas = new Set<string>();
    const expandir = (e: EstructuraLewis) => {
      const cen = e.atomos[0]!;
      const negativos = e.atomos.map((a, i) => ({ a, i })).filter(({ a, i }) => i > 0 && a.cargaFormal === -1 && ['O', 'S'].includes(a.simbolo) && e.enlaces.some((b) => b.a === 0 && b.b === i));
      if (cen.cargaFormal <= 0 || negativos.length === 0) {
        if (e !== resonantes[0] && !vistas.has(firma(e))) {
          vistas.add(firma(e));
          expandidas.push(e);
        }
        return;
      }
      for (const { i } of negativos) {
        const n = copiar(e);
        n.atomos[i]!.paresLibres -= 1;
        n.enlaces.find((b) => b.a === 0 && b.b === i)!.orden += 1;
        expandir(recalcular(n));
      }
    };
    for (const r of resonantes) expandir(r);
    if (expandidas.length) {
      pasos.push(
        `El ${central} (periodo ${periodo(zc)}) tiene orbitales d disponibles en el modelo de octeto expandido: con ${expandidas[0]!.electronesCentral} e⁻ alrededor del central las cargas formales se reducen al mínimo (${expandidas.length} forma(s) resonante(s)).`,
      );
    }
  }

  const cf = resonantes[0]!.atomos.map((a) => `${a.simbolo}: ${a.cargaFormal > 0 ? '+' : ''}${a.cargaFormal}`);
  pasos.push(`Cargas formales (CF = V − e⁻ libres − ½ e⁻ de enlace): ${[...new Set(cf)].join(', ')}. Suma = ${carga}.`);

  return {
    formula,
    central,
    totalElectrones: total,
    resonantes,
    expandidas,
    octetoIncompleto: resonantes[0]!.electronesCentral < 8 && !radical,
    radical,
    pasos,
  };
}

/** Nombre del subnivel de valencia (para textos): «2p», «3p»… */
export const subnivelValencia = (simbolo: string) => {
  const z = elementoPorSimbolo(simbolo)!.z;
  return `${periodo(z)}${LETRAS_L[1]}`;
};
