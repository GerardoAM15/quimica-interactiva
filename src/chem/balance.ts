/**
 * Balanceo de ecuaciones químicas.
 *
 * Método algebraico: cada especie recibe un coeficiente xⱼ; la conservación de cada elemento (y de la
 * carga) da un sistema homogéneo A·x = 0, con A[elemento][especie] = átomos (positivo en reactivos,
 * negativo en productos). La solución es el espacio nulo de A, calculado con fracciones exactas:
 *   - dimensión 0 → la ecuación es imposible;
 *   - dimensión 1 → solución única (salvo un factor): se escala a los enteros mínimos;
 *   - dimensión > 1 → la ecuación combina varias reacciones independientes (infinitas soluciones).
 *
 * Método ion-electrón: cada semirreacción se balancea con H₂O, H⁺ (medio ácido) u OH⁻ (medio básico)
 * y electrones; luego se igualan los electrones y se suman.
 */
import { aMhchem, formulaHill, parsearFormula, type Formula } from './formula';
import { Fraccion, aEnterosMinimos, espacioNulo, frac, mcdB, mcmB } from './fraction';
import { estadosOxidacion } from './oxidacion';
import { elementoPorSimbolo, tipoElemento } from './elements';

export interface Especie {
  /** Texto tal como se escribe (sin coeficiente). */
  texto: string;
  formula: Formula;
  esElectron: boolean;
}

export interface EcuacionParseada {
  reactivos: Especie[];
  productos: Especie[];
}

export class ErrorBalanceo extends Error {
  constructor(
    mensaje: string,
    public readonly tipo: 'sintaxis' | 'imposible' | 'multiples',
  ) {
    super(mensaje);
    this.name = 'ErrorBalanceo';
  }
}

const FLECHA = /\s*(?:<=>|⇌|==>|-->|->|→|⟶|⇒|=)\s*/;

/** Interpreta una especie: quita coeficiente y estado físico; reconoce el electrón (e⁻). */
export function especie(texto: string): Especie {
  let t = texto.trim().replace(/^\d+\s*/, '');
  if (/^(e|e-|e\^-|e⁻|e\{-\})$/.test(t)) {
    return { texto: 'e^-', formula: { atomos: new Map(), carga: -1, texto: 'e-' }, esElectron: true };
  }
  t = t.replace(/\((s|l|g|aq|ac)\)$/i, '');
  return { texto: t, formula: parsearFormula(t), esElectron: false };
}

/** Separa un lado de la ecuación en especies. «+» con espacios separa; sin espacios, solo si sigue una mayúscula. */
function separarLado(lado: string): string[] {
  const s = lado.trim();
  if (!s) return [];
  if (/\s\+\s/.test(s)) return s.split(/\s+\+\s+/);
  return s.split(/\+(?=\d*\s*[A-Z([e])/).filter(Boolean);
}

export function parsearEcuacion(texto: string): EcuacionParseada {
  const partes = texto.split(FLECHA);
  if (partes.length !== 2) throw new ErrorBalanceo('Escribe la ecuación con una flecha: reactivos -> productos.', 'sintaxis');
  const [izq, der] = partes as [string, string];
  try {
    const reactivos = separarLado(izq).map(especie);
    const productos = separarLado(der).map(especie);
    if (!reactivos.length || !productos.length) throw new ErrorBalanceo('Faltan reactivos o productos.', 'sintaxis');
    return { reactivos, productos };
  } catch (e) {
    if (e instanceof ErrorBalanceo) throw e;
    throw new ErrorBalanceo(`Fórmula no válida: ${(e as Error).message}`, 'sintaxis');
  }
}

export interface ResultadoBalanceo {
  reactivos: Especie[];
  productos: Especie[];
  coeficientes: bigint[];
  elementos: string[];
  conCarga: boolean;
  /** Sistema de ecuaciones del método algebraico (una por elemento). */
  sistema: string[];
  /** Solución racional con el primer coeficiente = 1. */
  solucionRacional: Fraccion[];
}

const especiesDe = (e: EcuacionParseada) => [...e.reactivos, ...e.productos];

/** Matriz de composición (filas: elementos y carga; columnas: especies). */
function matriz(e: EcuacionParseada) {
  const todas = especiesDe(e);
  const elementos: string[] = [];
  for (const s of todas) for (const el of s.formula.atomos.keys()) if (!elementos.includes(el)) elementos.push(el);
  const conCarga = todas.some((s) => s.formula.carga !== 0);
  const filas = [...elementos.map((el) => todas.map((s, j) => frac((s.formula.atomos.get(el) ?? 0) * (j < e.reactivos.length ? 1 : -1)))),
    ...(conCarga ? [todas.map((s, j) => frac(s.formula.carga * (j < e.reactivos.length ? 1 : -1)))] : [])];
  return { filas, elementos, conCarga };
}

const LETRAS = 'abcdefghijklmnopqrstuvwxyz';

/** Balancea por el método algebraico (espacio nulo con fracciones exactas). */
export function balancear(entrada: string | EcuacionParseada): ResultadoBalanceo {
  const e = typeof entrada === 'string' ? parsearEcuacion(entrada) : entrada;
  const { filas, elementos, conCarga } = matriz(e);
  const nulo = espacioNulo(filas);
  if (nulo.length === 0) {
    throw new ErrorBalanceo('La ecuación no se puede balancear: no existe ninguna combinación que conserve todos los átomos (revisa las fórmulas o faltan especies).', 'imposible');
  }
  if (nulo.length > 1) {
    throw new ErrorBalanceo(
      `La ecuación admite infinitas soluciones (${nulo.length} reacciones independientes combinadas). Hay que separarla en reacciones o fijar una proporción entre especies.`,
      'multiples',
    );
  }
  const v = nulo[0]!;
  const coeficientes = aEnterosMinimos(v);
  if (coeficientes.some((c) => c <= 0n)) {
    throw new ErrorBalanceo('La ecuación no se puede balancear con coeficientes positivos: alguna especie sobra o está del lado equivocado.', 'imposible');
  }
  const todas = especiesDe(e);
  const n = e.reactivos.length;
  const termino = (j: number, k: number) => `${Math.abs(k) === 1 ? '' : Math.abs(k)}${LETRAS[j]}`;
  const sistema = [...elementos, ...(conCarga ? ['carga'] : [])].map((el, i) => {
    const izq = todas.map((_, j) => (j < n ? filas[i]![j]!.aNumero() : 0)).map((k, j) => (k ? termino(j, k) : '')).filter(Boolean);
    const der = todas.map((_, j) => (j >= n ? -filas[i]![j]!.aNumero() : 0)).map((k, j) => (k ? termino(j, k) : '')).filter(Boolean);
    return `${el}: ${izq.join(' + ') || '0'} = ${der.join(' + ') || '0'}`;
  });
  const primero = v[0]!;
  return {
    reactivos: e.reactivos,
    productos: e.productos,
    coeficientes,
    elementos,
    conCarga,
    sistema,
    solucionRacional: v.map((x) => x.dividir(primero)),
  };
}

// ── Presentación ────────────────────────────────────────────────────────────

const conCoef = (c: bigint, s: Especie, latex: boolean) => {
  const t = latex ? (s.esElectron ? 'e-' : aMhchem(s.texto)) : s.texto;
  return `${c === 1n ? '' : `${c} `}${t}`;
};

/** Texto de la ecuación balanceada: «2 H2 + O2 -> 2 H2O». */
export function ecuacionTexto(r: { reactivos: Especie[]; productos: Especie[]; coeficientes: bigint[] }): string {
  const n = r.reactivos.length;
  const lado = (lista: Especie[], desde: number) => lista.map((s, i) => conCoef(r.coeficientes[desde + i]!, s, false)).join(' + ');
  return `${lado(r.reactivos, 0)} -> ${lado(r.productos, n)}`;
}

/** Contenido para \ce{…} de mhchem. */
export function ecuacionMhchem(r: { reactivos: Especie[]; productos: Especie[]; coeficientes: bigint[] }): string {
  const n = r.reactivos.length;
  const lado = (lista: Especie[], desde: number) => lista.map((s, i) => conCoef(r.coeficientes[desde + i]!, s, true)).join(' + ');
  return `${lado(r.reactivos, 0)} -> ${lado(r.productos, n)}`;
}

/** Comprueba que una ecuación con coeficientes conserva átomos y carga. */
export function verificarBalance(r: { reactivos: Especie[]; productos: Especie[]; coeficientes: bigint[] }): boolean {
  const cuenta = (lista: Especie[], desde: number) => {
    const m = new Map<string, bigint>();
    lista.forEach((s, i) => {
      const c = r.coeficientes[desde + i]!;
      for (const [el, k] of s.formula.atomos) m.set(el, (m.get(el) ?? 0n) + c * BigInt(k));
      m.set('carga', (m.get('carga') ?? 0n) + c * BigInt(s.formula.carga));
    });
    return m;
  };
  const a = cuenta(r.reactivos, 0), b = cuenta(r.productos, r.reactivos.length);
  for (const k of new Set([...a.keys(), ...b.keys()])) if ((a.get(k) ?? 0n) !== (b.get(k) ?? 0n)) return false;
  return true;
}

/**
 * Comprobación por tanteo: conteo de átomos por elemento en cada lado, en el orden usual
 * (metales, no metales, hidrógeno, oxígeno).
 */
export function pasosTanteo(r: ResultadoBalanceo): string[] {
  const orden = (s: string) => (s === 'O' ? 3 : s === 'H' ? 2 : tipoElemento(elementoPorSimbolo(s)!) === 'metal' ? 0 : 1);
  const elementos = [...r.elementos].sort((a, b) => orden(a) - orden(b));
  const n = r.reactivos.length;
  return elementos.map((el) => {
    const lado = (lista: Especie[], desde: number) =>
      lista
        .map((s, i) => [r.coeficientes[desde + i]!, BigInt(s.formula.atomos.get(el) ?? 0)] as const)
        .filter(([, k]) => k > 0n)
        .map(([c, k]) => `${c}×${k}`)
        .join(' + ');
    const total = (lista: Especie[], desde: number) => lista.reduce((s, x, i) => s + r.coeficientes[desde + i]! * BigInt(x.formula.atomos.get(el) ?? 0), 0n);
    const tipo = orden(el) === 0 ? 'metal' : orden(el) === 1 ? 'no metal' : el === 'H' ? 'hidrógeno' : 'oxígeno';
    return `${el} (${tipo}): izquierda ${lado(r.reactivos, 0)} = ${total(r.reactivos, 0)}; derecha ${lado(r.productos, n)} = ${total(r.productos, n)}.`;
  });
}

// ── Análisis redox (cambio de número de oxidación) ──────────────────────────

export interface CambioRedox {
  elemento: string;
  inicial: Fraccion;
  final: Fraccion;
  tipo: 'oxidacion' | 'reduccion';
  especieInicial: string;
  especieFinal: string;
  /** Electrones por átomo: |ΔEO|. */
  electronesPorAtomo: Fraccion;
}

export interface AnalisisRedox {
  esRedox: boolean;
  cambios: CambioRedox[];
  agenteOxidante: string[];
  agenteReductor: string[];
  /** Electrones transferidos en la ecuación balanceada. */
  electronesTransferidos: bigint | null;
  estados: { especie: string; estados: [string, Fraccion][] }[];
}

export function analizarRedox(r: { reactivos: Especie[]; productos: Especie[]; coeficientes?: bigint[] }): AnalisisRedox {
  const eo = (s: Especie) => (s.esElectron ? new Map<string, Fraccion>() : estadosOxidacion(s.formula).estados);
  const est = [...r.reactivos, ...r.productos].map((s) => ({ especie: s.texto, estados: [...eo(s).entries()] as [string, Fraccion][] }));
  const cambios: CambioRedox[] = [];
  for (const [i, sr] of r.reactivos.entries()) {
    const er = eo(sr);
    for (const [el, vi] of er) {
      for (const sp of r.productos) {
        const vf = eo(sp).get(el);
        if (!vf || vf.igual(vi)) continue;
        if (cambios.some((c) => c.elemento === el && c.especieInicial === sr.texto && c.especieFinal === sp.texto)) continue;
        // Se ignoran H y O salvo que sean los únicos que cambian (peróxidos, H₂)
        cambios.push({
          elemento: el,
          inicial: vi,
          final: vf,
          tipo: vf.restar(vi).signo() > 0 ? 'oxidacion' : 'reduccion',
          especieInicial: sr.texto,
          especieFinal: sp.texto,
          electronesPorAtomo: vf.restar(vi).signo() > 0 ? vf.restar(vi) : vi.restar(vf),
        });
      }
      void i;
    }
  }
  // Los «cambios» del O desde −2 o del H desde +1 suelen ser comparaciones entre especies no relacionadas
  // (el O del MnO₄⁻ frente al O₂ que viene del H₂O₂): se descartan si hay otros cambios del mismo tipo
  const sospechoso = (c: CambioRedox) => (c.elemento === 'O' && c.inicial.igual(frac(-2))) || (c.elemento === 'H' && c.inicial.igual(frac(1)));
  const depurar = (lista: CambioRedox[]) => (lista.some((c) => !sospechoso(c)) ? lista.filter((c) => !sospechoso(c)) : lista);
  const oxid = depurar(cambios.filter((c) => c.tipo === 'oxidacion'));
  const red = depurar(cambios.filter((c) => c.tipo === 'reduccion'));
  cambios.splice(0, cambios.length, ...oxid, ...red);
  const esRedox = oxid.length > 0 && red.length > 0;
  let electrones: bigint | null = null;
  if (esRedox && r.coeficientes) {
    // e⁻ perdidos = Σ coef(producto oxidado) × átomos × ΔEO
    let total = Fraccion.CERO;
    const n = r.reactivos.length;
    for (const c of oxid) {
      const j = r.productos.findIndex((p) => p.texto === c.especieFinal);
      const p = r.productos[j]!;
      total = total.sumar(frac(r.coeficientes[n + j]! * BigInt(p.formula.atomos.get(c.elemento) ?? 0)).multiplicar(c.electronesPorAtomo));
    }
    electrones = total.d === 1n ? total.n : null;
  }
  return {
    esRedox,
    cambios,
    agenteOxidante: [...new Set(red.map((c) => c.especieInicial))],
    agenteReductor: [...new Set(oxid.map((c) => c.especieInicial))],
    electronesTransferidos: electrones,
    estados: est,
  };
}

// ── Método ion-electrón ─────────────────────────────────────────────────────

export type Medio = 'acido' | 'basico';

export interface Semirreaccion {
  tipo: 'oxidacion' | 'reduccion';
  /** Especies y coeficientes (positivo = reactivo, negativo = producto). */
  terminos: { especie: Especie; coef: bigint }[];
  electrones: bigint;
  texto: string;
}

export interface ResultadoIonElectron {
  medio: Medio;
  semirreacciones: Semirreaccion[];
  /** Factores por los que se multiplica cada semirreacción. */
  factores: bigint[];
  final: { reactivos: Especie[]; productos: Especie[]; coeficientes: bigint[] };
  pasos: string[];
}

const H2O = especie('H2O');
const HMAS = especie('H^+');
const OHMENOS = especie('OH^-');
const ELECTRON = especie('e-');
const clave = (s: Especie) => (s.esElectron ? 'e-' : `${formulaHill(s.formula)}`);

function textoTerminos(t: { especie: Especie; coef: bigint }[]): string {
  const lado = (signo: 1 | -1) =>
    t
      .filter((x) => (signo > 0 ? x.coef > 0n : x.coef < 0n))
      .map((x) => {
        const c = x.coef < 0n ? -x.coef : x.coef;
        return `${c === 1n ? '' : `${c} `}${x.especie.texto}`;
      })
      .join(' + ');
  return `${lado(1)} -> ${lado(-1)}`;
}

/** Balancea una semirreacción X → Y agregando H₂O, H⁺/OH⁻ y e⁻ (sus lados se deducen del signo). */
function balancearSemi(x: Especie, y: Especie, medio: Medio): { especie: Especie; coef: bigint }[] {
  const ion = medio === 'acido' ? HMAS : OHMENOS;
  // Si las especies solo tienen H y O (H₂O₂ → O₂), con H₂O el sistema queda indeterminado: se omite el agua
  const intentos = [[H2O, ion, ELECTRON], [ion, ELECTRON], [H2O, ELECTRON]];
  let lista: Especie[] = [];
  let nulo: Fraccion[][] = [];
  for (const aux of intentos) {
    lista = [x, y, ...aux];
    const elementos = [...new Set(lista.flatMap((s) => [...s.formula.atomos.keys()]))];
    const filas = [
      ...elementos.map((el) => lista.map((s, j) => frac((s.formula.atomos.get(el) ?? 0) * (j === 1 ? -1 : 1)))),
      lista.map((s, j) => frac(s.formula.carga * (j === 1 ? -1 : 1))),
    ];
    nulo = espacioNulo(filas);
    if (nulo.length === 1 && !nulo[0]![0]!.esCero() && !nulo[0]![1]!.esCero()) break;
  }
  if (nulo.length !== 1) throw new ErrorBalanceo(`No se pudo balancear la semirreacción ${x.texto} → ${y.texto}.`, 'imposible');
  let v = aEnterosMinimos(nulo[0]!);
  if (v[0]! < 0n) v = v.map((c) => -c);
  // x (índice 0) es reactivo con coef positivo; y (índice 1) producto: su coef positivo se guarda negativo
  return lista.map((s, j) => ({ especie: s, coef: j === 1 ? -v[j]! : v[j]! })).filter((t) => t.coef !== 0n);
}

/**
 * Método ion-electrón para ecuaciones iónicas redox. Las especies H₂O, H⁺ y OH⁻ escritas por el usuario
 * se descartan y se vuelven a agregar al balancear cada semirreacción.
 */
export function balancearIonElectron(texto: string, medio: Medio): ResultadoIonElectron {
  const e = parsearEcuacion(texto);
  const filtrar = (l: Especie[]) => l.filter((s) => !['H2O', 'H+', 'HO-'].includes(formulaHill(s.formula)) && !s.esElectron);
  const ec = { reactivos: filtrar(e.reactivos), productos: filtrar(e.productos) };
  const redox = analizarRedox(ec);
  if (!redox.esRedox) throw new ErrorBalanceo('No hay cambios de número de oxidación: no es una reacción redox (usa el método algebraico).', 'imposible');
  // Pares X → Y (uno de oxidación y uno de reducción; en la dismutación comparten X)
  const pares = (['oxidacion', 'reduccion'] as const).map((tipo) => {
    const c = redox.cambios.find((k) => k.tipo === tipo)!;
    return { tipo, x: ec.reactivos.find((s) => s.texto === c.especieInicial)!, y: ec.productos.find((s) => s.texto === c.especieFinal)!, c };
  });
  const usados = new Set(pares.flatMap((p) => [p.x.texto, p.y.texto]));
  const sobrantes = [...ec.reactivos, ...ec.productos].filter((s) => !usados.has(s.texto));
  if (sobrantes.length) {
    throw new ErrorBalanceo(`El método ion-electrón aquí admite dos semirreacciones; sobran: ${sobrantes.map((s) => s.texto).join(', ')}.`, 'imposible');
  }

  const pasos: string[] = [];
  pasos.push(`Números de oxidación: ${pares.map((p) => `${p.c.elemento} pasa de ${p.c.inicial} a ${p.c.final} (${p.tipo === 'oxidacion' ? 'se oxida, pierde e⁻' : 'se reduce, gana e⁻'})`).join('; ')}.`);
  const semis: Semirreaccion[] = pares.map((p) => {
    const terminos = balancearSemi(p.x, p.y, medio);
    const eTerm = terminos.find((t) => t.especie.esElectron);
    const electrones = eTerm ? (eTerm.coef < 0n ? -eTerm.coef : eTerm.coef) : 0n;
    const t = textoTerminos(terminos);
    pasos.push(
      `Semirreacción de ${p.tipo === 'oxidacion' ? 'oxidación' : 'reducción'}: ${p.x.texto} -> ${p.y.texto}. Se balancea ${p.c.elemento}; el O con H₂O; ${medio === 'acido' ? 'el H con H⁺' : 'el H con H₂O y OH⁻ (medio básico)'}; la carga con electrones: ${t}`,
    );
    return { tipo: p.tipo, terminos, electrones, texto: t };
  });
  if (semis.some((s) => s.electrones === 0n)) throw new ErrorBalanceo('Una semirreacción no intercambia electrones.', 'imposible');
  const m = mcmB(semis[0]!.electrones, semis[1]!.electrones);
  const factores = semis.map((s) => m / s.electrones);
  pasos.push(`Se igualan los electrones (m.c.m. = ${m}): oxidación × ${factores[0]}, reducción × ${factores[1]}.`);

  // Suma y simplificación (las especies iguales a ambos lados se cancelan)
  const total = new Map<string, { especie: Especie; coef: bigint }>();
  semis.forEach((s, k) => {
    for (const t of s.terminos) {
      const kk = clave(t.especie);
      const prev = total.get(kk);
      total.set(kk, { especie: prev?.especie ?? t.especie, coef: (prev?.coef ?? 0n) + t.coef * factores[k]! });
    }
  });
  const terminos = [...total.values()].filter((t) => t.coef !== 0n);
  if (terminos.some((t) => t.especie.esElectron)) throw new ErrorBalanceo('Los electrones no se cancelaron.', 'imposible');
  const reactivos = terminos.filter((t) => t.coef > 0n);
  const productos = terminos.filter((t) => t.coef < 0n);
  // En la dismutación (Cl₂ → Cl⁻ + ClO₃⁻) la suma puede tener un factor común: se simplifica
  const crudos = [...reactivos.map((t) => t.coef), ...productos.map((t) => -t.coef)];
  const g = crudos.reduce((a, b) => mcdB(a, b), 0n) || 1n;
  if (g > 1n) pasos.push(`Los coeficientes tienen factor común ${g}: se dividen todos entre ${g}.`);
  const final = {
    reactivos: reactivos.map((t) => t.especie),
    productos: productos.map((t) => t.especie),
    coeficientes: crudos.map((c) => c / g),
  };
  pasos.push(`Se suman las semirreacciones y se cancelan los electrones${medio === 'acido' ? ', el H₂O y el H⁺' : ', el H₂O y el OH⁻'} repetidos: ${ecuacionTexto(final)}.`);
  if (!verificarBalance(final)) throw new ErrorBalanceo('La suma no quedó balanceada.', 'imposible');
  pasos.push('Comprobación: se conservan los átomos de cada elemento y la carga total.');
  return { medio, semirreacciones: semis, factores, final, pasos };
}
