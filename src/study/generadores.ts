/**
 * Generadores de preguntas originales a partir de las funciones de src/chem (no hay bancos de
 * preguntas fijos): cada pregunta se arma con datos aleatorios (con semilla) y su solución se calcula.
 * Todas las preguntas tienen 5 alternativas (A–E), una respuesta y su solución paso a paso.
 */
import { balancear, ecuacionMhchem, ecuacionTexto, type ResultadoBalanceo } from '@/chem/balance';
import { formulaHill, masaMolar, parsearFormula } from '@/chem/formula';
import { catalogoNomenclatura, type Compuesto, type Funcion } from '@/chem/nomenclatura/inorganica';
import { formulaMolecularGrafo, formulaSemidesarrollada, nombrarOrganico, type GrafoOrg } from '@/chem/nomenclatura/organica';
import { clasificarReaccion, NOMBRE_TIPO, type TipoReaccion } from '@/chem/reacciones';
import { configuracionMoeller, configuracionReal, electronesDesapareados, electronesPorNivel, formatearConfiguracion, esExcepcion } from '@/chem/configuracion';
import { elementoPorZ, grupo, periodo } from '@/chem/elements';
import { hendersonHasselbalch, pHAcidoDebil, pHAcidoFuerte, pHBaseFuerte } from '@/chem/acidBase';
import { densidadGas, gasIdeal, leyCombinada } from '@/chem/gases';
import { ANIONES, CATIONES, formulaCompuesto, predecirPrecipitado } from '@/chem/solubilidad';
import { NA } from '@/chem/constants';
import datosAB from '@/data/acidos-bases.json';
import { Azar } from './azar';

export type Tema = 'balanceo' | 'nomenclatura-inorganica' | 'nomenclatura-organica' | 'estequiometria' | 'tipos-reaccion' | 'configuracion' | 'ph' | 'gases';
export type Dificultad = 1 | 2 | 3;

export interface PasoSolucion {
  titulo: string;
  tex?: string;
}

export interface Pregunta {
  id: string;
  tema: Tema;
  subtema: string;
  dificultad: Dificultad;
  enunciado: string;
  /** Fórmula o ecuación de apoyo del enunciado (mhchem/LaTeX). */
  tex?: string;
  opciones: string[];
  correcta: number;
  /** Respuesta en texto (para la hoja de respuestas). */
  respuesta: string;
  solucion: PasoSolucion[];
}

export interface InfoTema {
  id: Tema;
  nombre: string;
  subtemas: { id: string; nombre: string }[];
}

export const TEMAS: InfoTema[] = [
  { id: 'balanceo', nombre: 'Balanceo de ecuaciones', subtemas: [{ id: 'combustion', nombre: 'Combustión' }, { id: 'sintesis', nombre: 'Síntesis de óxidos' }, { id: 'neutralizacion', nombre: 'Neutralización' }] },
  { id: 'nomenclatura-inorganica', nombre: 'Nomenclatura inorgánica', subtemas: [{ id: 'nombrar', nombre: 'Fórmula → nombre' }, { id: 'formular', nombre: 'Nombre → fórmula' }] },
  { id: 'nomenclatura-organica', nombre: 'Nomenclatura orgánica', subtemas: [{ id: 'nombrar', nombre: 'Estructura → nombre' }, { id: 'formula', nombre: 'Nombre → fórmula molecular' }] },
  { id: 'estequiometria', nombre: 'Estequiometría', subtemas: [{ id: 'mol-masa', nombre: 'Moles, masa y partículas' }, { id: 'masa-masa', nombre: 'Relación masa–masa' }, { id: 'limitante', nombre: 'Reactivo limitante' }] },
  { id: 'tipos-reaccion', nombre: 'Tipos de reacción', subtemas: [{ id: 'clasificar', nombre: 'Clasificar' }, { id: 'precipitado', nombre: 'Precipitados' }] },
  { id: 'configuracion', nombre: 'Configuración electrónica', subtemas: [{ id: 'configuracion', nombre: 'Configuración' }, { id: 'desapareados', nombre: 'Electrones desapareados' }, { id: 'ubicacion', nombre: 'Periodo y grupo' }] },
  { id: 'ph', nombre: 'pH', subtemas: [{ id: 'fuerte', nombre: 'Ácidos y bases fuertes' }, { id: 'debil', nombre: 'Ácidos débiles' }, { id: 'buffer', nombre: 'Buffers' }] },
  { id: 'gases', nombre: 'Gases', subtemas: [{ id: 'ideal', nombre: 'PV = nRT' }, { id: 'combinada', nombre: 'Ley combinada' }, { id: 'densidad', nombre: 'Densidad de gases' }] },
];

// ── Utilidades ──────────────────────────────────────────────────────────────

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** «Fe2(SO4)3» → «Fe₂(SO₄)₃» (sin tocar coeficientes). */
export const fUnicode = (f: string) => f.replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, n: string) => a + n.replace(/\d/g, (d) => SUB[Number(d)]!));
/** Número con 3 cifras significativas (separador decimal del resto de la aplicación). */
export const num = (x: number, cifras = 3) => {
  if (x !== 0 && (Math.abs(x) >= 1e5 || Math.abs(x) < 1e-3)) {
    const [m, e] = x.toExponential(cifras - 1).split('e');
    return `${m} × 10${String(Number(e)).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)}`;
  }
  return Number(x.toPrecision(cifras)).toLocaleString('es-PE', { maximumSignificantDigits: cifras });
};

/** Arma las 5 alternativas: la correcta y 4 distractores distintos, en orden aleatorio. */
function alternativas(az: Azar, correcta: string, distractores: string[], relleno?: () => string): { opciones: string[]; correcta: number } {
  const set = new Set<string>([correcta]);
  for (const d of az.barajar(distractores)) {
    if (set.size >= 5) break;
    set.add(d);
  }
  let intentos = 0;
  while (set.size < 5 && relleno && intentos++ < 60) set.add(relleno());
  if (set.size < 5) throw new Error('No hay suficientes alternativas distintas.');
  const opciones = az.barajar([...set]);
  return { opciones, correcta: opciones.indexOf(correcta) };
}

/** Distractores numéricos típicos: errores de factor 2, 10, inversión y ± 20 %. */
function numericas(az: Azar, valor: number, formato: (x: number) => string, extra: number[] = []) {
  const candidatos = [...extra, valor * 2, valor / 2, valor * 10, valor / 10, valor * 1.2, valor * 0.8, valor * 1.5, valor * 0.6].filter((x) => Number.isFinite(x) && x > 0);
  return alternativas(az, formato(valor), candidatos.map(formato), () => formato(valor * az.decimal(0.3, 3, 2)));
}

let contador = 0;
const id = (t: string) => `${t}-${++contador}`;

// ── Balanceo ────────────────────────────────────────────────────────────────

const OXIDOS_SIMPLES = () => catalogoNomenclatura().filter((c) => c.funcion === 'oxido-basico' && !/[()]|Hg2/.test(c.formula));

/** Combustibles de C, H (y O) generados al azar según la dificultad. */
function combustible(az: Azar, d: Dificultad): string {
  const n = az.entero(1, d === 1 ? 4 : d === 2 ? 6 : 10);
  const tipo = d === 1 ? 'alcano' : az.elegir(d === 2 ? ['alcano', 'alqueno', 'alcohol'] : ['alcano', 'alqueno', 'alquino', 'alcohol', 'glucosa']);
  if (tipo === 'glucosa') return 'C6H12O6';
  if (tipo === 'alqueno' && n >= 2) return `C${n}H${2 * n}`;
  if (tipo === 'alquino' && n >= 2) return `C${n}H${2 * n - 2}`;
  if (tipo === 'alcohol') return `C${n}H${2 * n + 1}OH`;
  return `C${n === 1 ? '' : n}H${2 * n + 2}`;
}

function ecuacionAleatoria(az: Azar, subtema: string, d: Dificultad): string {
  if (subtema === 'combustion') return `${combustible(az, d)} + O2 -> CO2 + H2O`;
  if (subtema === 'sintesis') {
    const ox = az.elegir(OXIDOS_SIMPLES());
    const metal = [...parsearFormula(ox.formula).atomos.keys()].find((e) => e !== 'O')!;
    return `${metal} + O2 -> ${ox.formula}`;
  }
  // Neutralización: ácido HₙX + hidróxido M(OH)ₘ → sal + agua
  const an = az.elegir(ANIONES.filter((a) => !['OH-', 'CH3COO-', 'S^2-', 'CrO4^2-'].includes(a.ion)));
  // Sin NH₄⁺ (no hay «NH₄OH» aislable) ni Ag⁺ (el AgOH no existe: precipita Ag₂O)
  const cat = az.elegir(CATIONES.filter((c) => c.ion !== 'NH4+' && c.ion !== 'Ag+' && (d > 1 || c.carga <= 2)));
  const acido = `H${an.carga > 1 ? an.carga : ''}${an.grupo}`;
  const base = formulaCompuesto(cat, ANIONES.find((a) => a.ion === 'OH-')!);
  return `${acido} + ${base} -> ${formulaCompuesto(cat, an)} + H2O`;
}

const ladoTexto = (b: ResultadoBalanceo) => fUnicode(ecuacionTexto(b).replace('->', '→')).replace(/\b1 /g, '');

function preguntaBalanceo(az: Azar, subtema: string, d: Dificultad): Pregunta {
  const texto = ecuacionAleatoria(az, subtema, d);
  const b = balancear(texto);
  const k = b.coeficientes.map(Number);
  const esqueleto = fUnicode(texto.replace('->', '→'));
  const pideSuma = az.siguiente() < 0.5;
  const suma = k.reduce((a, x) => a + x, 0);
  const i = b.reactivos.findIndex((s) => s.texto === 'O2');
  const objetivo = pideSuma || i < 0 ? suma : k[i]!;
  const fmt = (x: number) => String(Math.round(x));
  const alt = alternativas(az, fmt(objetivo), [objetivo + 1, objetivo - 1, objetivo + 2, objetivo * 2, objetivo - 2].filter((x) => x > 0).map(fmt), () => fmt(az.entero(1, objetivo * 2 + 3)));
  return {
    id: id('bal'),
    tema: 'balanceo',
    subtema,
    dificultad: d,
    enunciado: `Balancea la ecuación ${esqueleto} con los coeficientes enteros mínimos. ${pideSuma || i < 0 ? '¿Cuál es la suma de todos los coeficientes?' : '¿Cuál es el coeficiente del O₂?'}`,
    ...alt,
    respuesta: `${ladoTexto(b)} (${pideSuma || i < 0 ? `suma = ${suma}` : `O₂: ${k[i]}`})`,
    solucion: [
      { titulo: 'Se plantea una incógnita por especie y una ecuación por elemento (conservación de átomos):' },
      ...b.sistema.map((s) => ({ titulo: s })),
      { titulo: 'Se resuelve y se llevan los coeficientes a los enteros mínimos:', tex: `\\ce{${ecuacionMhchem(b)}}` },
      { titulo: pideSuma || i < 0 ? `Suma: ${k.join(' + ')} = ${suma}` : `Coeficiente del O₂: ${k[i]}` },
    ],
  };
}

// ── Nomenclatura inorgánica ─────────────────────────────────────────────────

const FUNCIONES_POR_DIF: Record<Dificultad, Funcion[]> = {
  1: ['oxido-basico', 'oxido-acido', 'hidroxido', 'hidruro-metalico', 'hidracido'],
  2: ['oxacido', 'sal-haloidea', 'peroxido', 'oxido-acido', 'hidroxido'],
  3: ['oxisal', 'sal-acida', 'oxacido', 'sal-haloidea'],
};
const SISTEMAS = [
  ['tradicional', 'tradicional'],
  ['stock', 'Stock'],
  ['sistematica', 'sistemática'],
] as const;

function preguntaInorganica(az: Azar, subtema: string, d: Dificultad): Pregunta {
  const cat = catalogoNomenclatura();
  const funcion = az.elegir(FUNCIONES_POR_DIF[d]);
  const grupo = cat.filter((c) => c.funcion === funcion);
  const c = az.elegir(grupo);
  const sistemas = SISTEMAS.filter(([k]) => c.nombres[k]);
  const [clave, nombreSistema] = az.elegir(sistemas);
  const nombre = c.nombres[clave]!;
  const otros = az.barajar(grupo.filter((x) => x.formula !== c.formula));
  // Distractores parecidos: mismo elemento característico primero
  const elementos = new Set(Object.keys(c.estados));
  const parecidos = [...otros.filter((x) => Object.keys(x.estados).some((e) => elementos.has(e))), ...otros];
  const solucion = [{ titulo: `Función: ${funcion.replace('-', ' ')}.` }, { titulo: c.formacion }, { titulo: `Nombres: tradicional «${c.nombres.tradicional}»${c.nombres.stock ? `; Stock «${c.nombres.stock}»` : ''}${c.nombres.sistematica ? `; sistemática «${c.nombres.sistematica}»` : ''}.` }];
  if (subtema === 'formular') {
    const alt = alternativas(az, fUnicode(c.formula), parecidos.map((x) => fUnicode(x.formula)));
    return { id: id('inorg'), tema: 'nomenclatura-inorganica', subtema, dificultad: d, enunciado: `¿Cuál es la fórmula del ${nombre}?`, ...alt, respuesta: fUnicode(c.formula), solucion };
  }
  const nombresDe = (x: Compuesto) => x.nombres[clave] ?? x.nombres.tradicional;
  const alt = alternativas(az, nombre, parecidos.map(nombresDe));
  return {
    id: id('inorg'),
    tema: 'nomenclatura-inorganica',
    subtema,
    dificultad: d,
    enunciado: `¿Cuál es el nombre en nomenclatura ${nombreSistema} de ${fUnicode(c.formula)}?`,
    ...alt,
    respuesta: nombre,
    solucion,
  };
}

// ── Nomenclatura orgánica ───────────────────────────────────────────────────

/** Estructura acíclica aleatoria: cadena + sustituyentes (+ un grupo funcional según la dificultad). */
function estructuraAleatoria(az: Azar, d: Dificultad): GrafoOrg {
  const atomos: { el: string; carga: number }[] = [];
  const enlaces: { a: number; b: number; orden: 1 | 2 | 3 }[] = [];
  const add = (el: string) => (atomos.push({ el, carga: 0 }), atomos.length - 1);
  const n = az.entero(d === 1 ? 4 : 5, d === 1 ? 6 : d === 2 ? 7 : 8);
  const c = Array.from({ length: n }, () => add('C'));
  for (let i = 1; i < n; i++) enlaces.push({ a: c[i - 1]!, b: c[i]!, orden: 1 });
  const nSubs = d === 1 ? 1 : d === 2 ? az.entero(1, 2) : az.entero(2, 3);
  for (let k = 0; k < nSubs; k++) {
    const pos = c[az.entero(1, n - 2)]!;
    const tipo = az.elegir(d === 1 ? ['CH3', 'CH3', 'Cl'] : ['CH3', 'CH3', 'C2H5', 'Cl', 'Br']);
    if (tipo === 'CH3') enlaces.push({ a: pos, b: add('C'), orden: 1 });
    else if (tipo === 'C2H5') {
      const x = add('C');
      enlaces.push({ a: pos, b: x, orden: 1 }, { a: x, b: add('C'), orden: 1 });
    } else enlaces.push({ a: pos, b: add(tipo), orden: 1 });
  }
  if (d >= 2) {
    const g = az.elegir(d === 2 ? ['OH', 'doble', 'ninguno'] : ['OH', 'doble', 'cetona', 'acido', 'triple']);
    if (g === 'OH') enlaces.push({ a: c[az.entero(0, n - 1)]!, b: add('O'), orden: 1 });
    if (g === 'cetona') enlaces.push({ a: c[az.entero(1, n - 2)]!, b: add('O'), orden: 2 });
    if (g === 'acido') {
      enlaces.push({ a: c[0]!, b: add('O'), orden: 2 }, { a: c[0]!, b: add('O'), orden: 1 });
    }
    if (g === 'doble' || g === 'triple') {
      const i = az.entero(0, n - 2);
      enlaces.find((e) => e.a === c[i] && e.b === c[i + 1])!.orden = g === 'doble' ? 2 : 3;
    }
  }
  return { atomos, enlaces };
}

function preguntaOrganica(az: Azar, subtema: string, d: Dificultad): Pregunta {
  for (let intento = 0; intento < 40; intento++) {
    const g = estructuraAleatoria(az, d);
    let r: ReturnType<typeof nombrarOrganico>, semi: string, formula: string;
    try {
      r = nombrarOrganico(g);
      semi = formulaSemidesarrollada(g);
      formula = formulaMolecularGrafo(g);
    } catch {
      continue;
    }
    // Distractores: isómeros con los mismos átomos en otras posiciones
    const otros = new Set<string>();
    for (let k = 0; k < 40 && otros.size < 8; k++) {
      try {
        const o = estructuraAleatoria(az.derivar(k + intento * 50), d);
        if (subtema === 'formula' || formulaMolecularGrafo(o) === formula || k > 25) otros.add(subtema === 'formula' ? formulaMolecularGrafo(o) : nombrarOrganico(o).nombre);
      } catch {
        /* se ignora */
      }
    }
    otros.delete(subtema === 'formula' ? formula : r.nombre);
    if (subtema === 'formula') {
      const alt = alternativas(az, fUnicode(formula), [...otros].map(fUnicode), () => fUnicode(formula.replace(/H(\d+)/, (_, h: string) => `H${Number(h) + az.elegir([-2, 2, -4])}`)));
      return {
        id: id('org'),
        tema: 'nomenclatura-organica',
        subtema,
        dificultad: d,
        enunciado: `¿Cuál es la fórmula molecular del ${r.nombre}?`,
        ...alt,
        respuesta: fUnicode(formula),
        solucion: [...r.pasos.slice(0, -1).map((p) => ({ titulo: p })), { titulo: `Estructura: ${semi}` }, { titulo: `Contando átomos: ${fUnicode(formula)}` }],
      };
    }
    try {
      const alt = alternativas(az, r.nombre, [...otros]);
      return {
        id: id('org'),
        tema: 'nomenclatura-organica',
        subtema,
        dificultad: d,
        enunciado: `¿Cuál es el nombre IUPAC de ${semi}?`,
        ...alt,
        respuesta: r.nombre,
        solucion: r.pasos.map((p) => ({ titulo: p })),
      };
    } catch {
      continue;
    }
  }
  throw new Error('No se pudo generar la pregunta de nomenclatura orgánica.');
}

// ── Estequiometría ──────────────────────────────────────────────────────────

const SUSTANCIAS = ['H2O', 'CO2', 'NaCl', 'CaCO3', 'H2SO4', 'NaOH', 'NH3', 'C6H12O6', 'O2', 'CH4', 'HCl', 'KMnO4', 'Fe2O3', 'C2H5OH', 'Al2(SO4)3'];

function preguntaEstequiometria(az: Azar, subtema: string, d: Dificultad): Pregunta {
  if (subtema === 'mol-masa') {
    const f = az.elegir(d === 1 ? SUSTANCIAS.slice(0, 8) : SUSTANCIAS);
    const M = masaMolar(f);
    const modo = az.elegir(d === 1 ? ['g-mol', 'mol-g'] : ['g-mol', 'mol-g', 'g-moleculas']);
    if (modo === 'mol-g') {
      const n = az.decimal(0.1, 5, 2);
      const alt = numericas(az, n * M, (x) => `${num(x)} g`, [M / n]);
      return { id: id('est'), tema: 'estequiometria', subtema, dificultad: d, enunciado: `¿Cuál es la masa de ${num(n)} mol de ${fUnicode(f)}?`, ...alt, respuesta: `${num(n * M)} g`, solucion: [{ titulo: `Masa molar de ${fUnicode(f)}: ${num(M, 5)} g/mol` }, { titulo: 'Masa = n · M', tex: `m = ${num(n)}\\times${num(M, 5)} = ${num(n * M)}\\ \\text{g}` }] };
    }
    const m = az.decimal(5, 500, 3);
    if (modo === 'g-moleculas') {
      const N = (m / M) * NA;
      const alt = numericas(az, N, (x) => `${num(x)} moléculas`, [(m * M) / NA]);
      return { id: id('est'), tema: 'estequiometria', subtema, dificultad: d, enunciado: `¿Cuántas moléculas hay en ${num(m)} g de ${fUnicode(f)}?`, ...alt, respuesta: `${num(N)} moléculas`, solucion: [{ titulo: `n = m/M = ${num(m)} / ${num(M, 5)} = ${num(m / M)} mol` }, { titulo: `N = n · Nₐ = ${num(m / M)} × 6.022 × 10²³ = ${num(N)} moléculas` }] };
    }
    const alt = numericas(az, m / M, (x) => `${num(x)} mol`, [m * M]);
    return { id: id('est'), tema: 'estequiometria', subtema, dificultad: d, enunciado: `¿Cuántos moles hay en ${num(m)} g de ${fUnicode(f)}?`, ...alt, respuesta: `${num(m / M)} mol`, solucion: [{ titulo: `Masa molar de ${fUnicode(f)}: ${num(M, 5)} g/mol` }, { titulo: 'n = m / M', tex: `n = \\dfrac{${num(m)}}{${num(M, 5)}} = ${num(m / M)}\\ \\text{mol}` }] };
  }
  // Masa–masa o reactivo limitante sobre una ecuación generada
  const b = balancear(ecuacionAleatoria(az, az.elegir(['combustion', 'sintesis']), d));
  const k = b.coeficientes.map(Number);
  const R = b.reactivos, P = b.productos;
  if (subtema === 'limitante') {
    const masas = R.map(() => az.decimal(5, 120, 3));
    const moles = R.map((s, i) => masas[i]! / masaMolar(s.texto));
    const cocientes = moles.map((n, i) => n / k[i]!);
    const lim = cocientes.indexOf(Math.min(...cocientes));
    const alt = alternativas(
      az,
      fUnicode(R[lim]!.texto),
      [...R.filter((_, i) => i !== lim).map((s) => fUnicode(s.texto)), ...P.map((s) => fUnicode(s.texto)), 'Ninguno: están en proporción exacta', 'No se puede determinar sin el rendimiento'],
    );
    return {
      id: id('est'),
      tema: 'estequiometria',
      subtema,
      dificultad: d,
      enunciado: `Para la reacción ${ladoTexto(b)}, se mezclan ${R.map((s, i) => `${num(masas[i]!)} g de ${fUnicode(s.texto)}`).join(' y ')}. ¿Cuál es el reactivo limitante?`,
      ...alt,
      respuesta: fUnicode(R[lim]!.texto),
      solucion: [...R.map((s, i) => ({ titulo: `${fUnicode(s.texto)}: ${num(masas[i]!)} g ÷ ${num(masaMolar(s.texto), 5)} g/mol = ${num(moles[i]!)} mol; ÷ coeficiente ${k[i]} = ${num(cocientes[i]!)}` })), { titulo: `El menor cociente corresponde al limitante: ${fUnicode(R[lim]!.texto)}.` }],
    };
  }
  const i = 0, j = az.entero(0, P.length - 1);
  const m = az.decimal(2, 200, 3);
  const mProd = (m / masaMolar(R[i]!.texto)) * (k[R.length + j]! / k[i]!) * masaMolar(P[j]!.texto);
  const alt = numericas(az, mProd, (x) => `${num(x)} g`, [(m / masaMolar(R[i]!.texto)) * masaMolar(P[j]!.texto)]);
  return {
    id: id('est'),
    tema: 'estequiometria',
    subtema,
    dificultad: d,
    enunciado: `Según ${ladoTexto(b)}, ¿qué masa de ${fUnicode(P[j]!.texto)} se obtiene a partir de ${num(m)} g de ${fUnicode(R[i]!.texto)} (con exceso de los demás reactivos)?`,
    ...alt,
    respuesta: `${num(mProd)} g`,
    solucion: [
      { titulo: `Moles de ${fUnicode(R[i]!.texto)}: ${num(m)} / ${num(masaMolar(R[i]!.texto), 5)} = ${num(m / masaMolar(R[i]!.texto))} mol` },
      { titulo: `Relación molar ${k[R.length + j]} : ${k[i]} → ${num(((m / masaMolar(R[i]!.texto)) * k[R.length + j]!) / k[i]!)} mol de ${fUnicode(P[j]!.texto)}` },
      { titulo: `Masa: × ${num(masaMolar(P[j]!.texto), 5)} g/mol = ${num(mProd)} g` },
    ],
  };
}

// ── Tipos de reacción ───────────────────────────────────────────────────────

function preguntaTipos(az: Azar, subtema: string, d: Dificultad): Pregunta {
  if (subtema === 'precipitado') {
    for (let k = 0; k < 50; k++) {
      const s1 = formulaCompuesto(az.elegir(CATIONES.filter((c) => ['Ag+', 'Pb2+', 'Ba2+', 'Ca2+', 'Cu2+', 'Fe3+', 'Mg2+', 'Zn2+'].includes(c.ion))), ANIONES.find((a) => a.ion === 'NO3-')!);
      const s2 = formulaCompuesto(az.elegir(CATIONES.filter((c) => ['Na+', 'K+'].includes(c.ion))), az.elegir(ANIONES.filter((a) => a.ion !== 'NO3-' && a.ion !== 'CH3COO-')));
      const p = predecirPrecipitado(s1, s2);
      if (p.productos.some((c) => c.solubilidad === 'reacciona')) continue;
      const correcta = p.hayPrecipitado ? `${fUnicode(p.precipitados[0]!.formula)}` : 'No se forma precipitado';
      const alt = alternativas(az, correcta, [...p.productos.map((c) => fUnicode(c.formula)), fUnicode(s1), fUnicode(s2), 'No se forma precipitado', 'H₂O'].filter((x) => x !== correcta));
      return {
        id: id('tipo'),
        tema: 'tipos-reaccion',
        subtema,
        dificultad: d,
        enunciado: `Se mezclan disoluciones acuosas de ${fUnicode(s1)} y ${fUnicode(s2)}. ¿Qué sustancia precipita?`,
        ...alt,
        respuesta: correcta,
        solucion: [{ titulo: 'Doble desplazamiento: se intercambian los iones.' }, ...p.productos.map((c) => ({ titulo: `${fUnicode(c.formula)}: ${c.solubilidad === 'soluble' ? 'soluble' : c.solubilidad === 'poco' ? 'poco soluble' : 'insoluble'} (${c.regla})` })), ...p.explicacion.map((x) => ({ titulo: x }))],
      };
    }
  }
  const opciones: TipoReaccion[] = ['sintesis', 'descomposicion', 'desplazamiento-simple', 'doble-desplazamiento', 'combustion', 'neutralizacion'];
  const tipo = az.elegir(opciones);
  let texto: string;
  if (tipo === 'sintesis') texto = ecuacionAleatoria(az, 'sintesis', d);
  else if (tipo === 'descomposicion') {
    const [r, p] = ecuacionAleatoria(az, 'sintesis', d).split(' -> ');
    texto = `${p} -> ${r}`;
  } else if (tipo === 'combustion') texto = ecuacionAleatoria(az, 'combustion', d);
  else if (tipo === 'neutralizacion') texto = ecuacionAleatoria(az, 'neutralizacion', d);
  else if (tipo === 'desplazamiento-simple') {
    const m = az.elegir(CATIONES.filter((c) => ['Mg2+', 'Zn2+', 'Fe2+', 'Al3+', 'Ni2+'].includes(c.ion)));
    const an = az.elegir(ANIONES.filter((a) => ['Cl-', 'SO4^2-', 'Br-'].includes(a.ion)));
    texto = `${m.elemento} + H${an.carga > 1 ? an.carga : ''}${an.grupo} -> ${formulaCompuesto(m, an)} + H2`;
  } else {
    const s1 = formulaCompuesto(az.elegir(CATIONES.filter((c) => ['Ag+', 'Ba2+', 'Pb2+'].includes(c.ion))), ANIONES.find((a) => a.ion === 'NO3-')!);
    const cat2 = az.elegir(CATIONES.filter((c) => ['Na+', 'K+'].includes(c.ion)));
    const an2 = az.elegir(ANIONES.filter((a) => ['Cl-', 'SO4^2-', 'I-', 'CO3^2-'].includes(a.ion)));
    const s1i = CATIONES.find((c) => formulaCompuesto(c, ANIONES.find((a) => a.ion === 'NO3-')!) === s1)!;
    texto = `${s1} + ${formulaCompuesto(cat2, an2)} -> ${formulaCompuesto(s1i, an2)} + ${formulaCompuesto(cat2, ANIONES.find((a) => a.ion === 'NO3-')!)}`;
  }
  const b = balancear(texto);
  const c = clasificarReaccion(b);
  // No se ofrecen como distractores otros tipos que también son válidos (p. ej. la combustión es redox)
  const otros = (Object.keys(NOMBRE_TIPO) as TipoReaccion[]).filter((t) => t !== tipo && !c.tipos.includes(t)).map((t) => NOMBRE_TIPO[t]);
  const alt = alternativas(az, NOMBRE_TIPO[tipo], otros);
  return {
    id: id('tipo'),
    tema: 'tipos-reaccion',
    subtema: 'clasificar',
    dificultad: d,
    enunciado: `¿A qué tipo pertenece la reacción ${ladoTexto(b)}?`,
    ...alt,
    respuesta: NOMBRE_TIPO[tipo],
    solucion: c.explicaciones.map((x) => ({ titulo: x })),
  };
}

// ── Configuración electrónica ───────────────────────────────────────────────

function preguntaConfiguracion(az: Azar, subtema: string, d: Dificultad): Pregunta {
  const zMax = d === 1 ? 20 : d === 2 ? 36 : 56;
  const z = az.entero(d === 3 ? 19 : 1, zMax);
  const el = elementoPorZ(z);
  const conf = configuracionReal(z);
  const texto = formatearConfiguracion(conf);
  const base = [{ titulo: `${el.nombre} (Z = ${z}): ${z} electrones.` }, { titulo: `Regla de Möller (n + ℓ creciente): ${formatearConfiguracion(configuracionMoeller(z))}` }];
  if (esExcepcion(z)) base.push({ titulo: `Excepción: la configuración real es ${texto} (subnivel d semilleno o lleno, más estable).` });
  if (subtema === 'desapareados') {
    const u = electronesDesapareados(conf);
    const alt = alternativas(az, String(u), ['0', '1', '2', '3', '4', '5', '6'].filter((x) => x !== String(u)));
    return { id: id('conf'), tema: 'configuracion', subtema, dificultad: d, enunciado: `¿Cuántos electrones desapareados tiene el átomo de ${el.nombre} (Z = ${z}) en su estado fundamental?`, ...alt, respuesta: String(u), solucion: [...base, { titulo: `Regla de Hund en el último subnivel: ${u} electrón(es) desapareado(s).` }] };
  }
  if (subtema === 'ubicacion') {
    const p = periodo(z), g = grupo(z);
    const correcta = `periodo ${p}, grupo ${g}`;
    const alt = alternativas(az, correcta, [`periodo ${p + 1}, grupo ${g}`, `periodo ${p}, grupo ${g === 18 ? 17 : g + 1}`, `periodo ${p - 1 || p + 2}, grupo ${g}`, `periodo ${p}, grupo ${g > 2 ? g - 1 : g + 2}`, `periodo ${p + 1}, grupo ${g === 1 ? 2 : g - 1}`]);
    const niveles = electronesPorNivel(conf);
    return { id: id('conf'), tema: 'configuracion', subtema, dificultad: d, enunciado: `Un átomo neutro tiene ${z} electrones. ¿En qué periodo y grupo de la tabla periódica se ubica?`, ...alt, respuesta: `${correcta} (${el.nombre})`, solucion: [...base, { titulo: `Último nivel: n = ${niveles.length} → periodo ${p}. Electrones de valencia/subnivel final → grupo ${g}.` }] };
  }
  // Configuración correcta frente a errores típicos (Z ± 1, ± 2 y la de Möller en las excepciones)
  const distractores = [z - 1, z + 1, z + 2, z - 2].filter((x) => x > 0).map((x) => formatearConfiguracion(configuracionMoeller(x)));
  if (esExcepcion(z)) distractores.unshift(formatearConfiguracion(configuracionMoeller(z)));
  const alt = alternativas(az, texto, distractores);
  return { id: id('conf'), tema: 'configuracion', subtema, dificultad: d, enunciado: `¿Cuál es la configuración electrónica del ${el.nombre} (Z = ${z})?`, ...alt, respuesta: texto, solucion: base };
}

// ── pH ──────────────────────────────────────────────────────────────────────

const ph2 = (x: number) => x.toFixed(2);

function preguntaPH(az: Azar, subtema: string, d: Dificultad): Pregunta {
  const dist = (v: number) => [v + 1, v - 1, 14 - v, v + 0.3, v - 0.3, v / 2].filter((x) => x > 0 && x < 14).map(ph2);
  if (subtema === 'debil') {
    const a = az.elegir(datosAB.acidos.filter((x) => x.Ka.length === 1));
    const C = az.elegir([0.01, 0.05, 0.1, 0.2, 0.5, 1]);
    const Ka = a.Ka[0]!;
    const p = pHAcidoDebil(C, Ka);
    const alt = alternativas(az, ph2(p), [...dist(p), ph2(-Math.log10(C))]);
    return { id: id('ph'), tema: 'ph', subtema, dificultad: d, enunciado: `Calcula el pH de una disolución ${num(C)} M de ${a.nombre} (Ka = ${num(Ka, 2)}).`, ...alt, respuesta: ph2(p), solucion: [{ titulo: 'Equilibrio HA ⇌ H⁺ + A⁻', tex: `K_a = \\dfrac{x^2}{C - x}\\approx\\dfrac{x^2}{C}` }, { titulo: `x = √(Ka·C) = √(${num(Ka, 2)} × ${num(C)}) = ${num(Math.sqrt(Ka * C))} M` }, { titulo: `pH = −log[H⁺] ≈ ${ph2(p)} (resultado exacto)` }] };
  }
  if (subtema === 'buffer') {
    const a = az.elegir(datosAB.acidos.filter((x) => x.Ka.length === 1 && x.Ka[0]! > 1e-8));
    const ca = az.decimal(0.05, 0.5, 2), cb = az.decimal(0.05, 0.5, 2);
    const p = hendersonHasselbalch(a.Ka[0]!, cb, ca);
    const alt = alternativas(az, ph2(p), [...dist(p), ph2(-Math.log10(a.Ka[0]!) + Math.log10(ca / cb))]);
    return { id: id('ph'), tema: 'ph', subtema, dificultad: d, enunciado: `Un buffer contiene ${num(ca)} M de ${a.nombre} y ${num(cb)} M de su sal de sodio (Ka = ${num(a.Ka[0]!, 2)}). ¿Cuál es su pH?`, ...alt, respuesta: ph2(p), solucion: [{ titulo: 'Henderson-Hasselbalch', tex: `\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\ce{A-}]}{[\\ce{HA}]} = ${(-Math.log10(a.Ka[0]!)).toFixed(2)} + \\log\\dfrac{${num(cb)}}{${num(ca)}} = ${p.toFixed(2)}` }] };
  }
  const base = az.siguiente() < 0.5;
  const exp = az.entero(1, d === 1 ? 3 : 5);
  const m = d === 1 ? 1 : az.elegir([1, 2, 5]);
  const C = m * 10 ** -exp;
  const sustancia = base ? az.elegir(['NaOH', 'KOH']) : az.elegir(['HCl', 'HNO3', 'HBr']);
  const p = base ? pHBaseFuerte(C) : pHAcidoFuerte(C);
  const alt = alternativas(az, ph2(p), dist(p));
  return {
    id: id('ph'),
    tema: 'ph',
    subtema,
    dificultad: d,
    enunciado: `¿Cuál es el pH de una disolución ${num(C)} M de ${fUnicode(sustancia)}?`,
    ...alt,
    respuesta: ph2(p),
    solucion: base
      ? [{ titulo: `Base fuerte: [OH⁻] = ${num(C)} M` }, { titulo: `pOH = −log(${num(C)}) = ${ph2(14 - p)}` }, { titulo: `pH = 14 − pOH = ${ph2(p)}` }]
      : [{ titulo: `Ácido fuerte: [H⁺] = ${num(C)} M` }, { titulo: `pH = −log(${num(C)}) = ${ph2(p)}` }],
  };
}

// ── Gases ───────────────────────────────────────────────────────────────────

function preguntaGases(az: Azar, subtema: string, d: Dificultad): Pregunta {
  if (subtema === 'combinada') {
    const P1 = az.decimal(0.5, 3, 2), V1 = az.decimal(1, 20, 3), T1 = az.entero(250, 400), P2 = az.decimal(0.5, 5, 2), T2 = az.entero(250, 500);
    const V2 = leyCombinada({ P: P1, V: V1, T: T1 }, { P: P2, T: T2 }, 'V');
    const alt = numericas(az, V2, (x) => `${num(x)} L`, [(P2 * V1 * T1) / (P1 * T2), (P1 * V1) / P2]);
    return { id: id('gas'), tema: 'gases', subtema, dificultad: d, enunciado: `Un gas ocupa ${num(V1)} L a ${num(P1)} atm y ${T1} K. ¿Qué volumen ocupa a ${num(P2)} atm y ${T2} K?`, ...alt, respuesta: `${num(V2)} L`, solucion: [{ titulo: 'Ley combinada', tex: `\\dfrac{P_1V_1}{T_1} = \\dfrac{P_2V_2}{T_2}\\Rightarrow V_2 = \\dfrac{P_1V_1T_2}{P_2T_1} = \\dfrac{${num(P1)}\\times${num(V1)}\\times${T2}}{${num(P2)}\\times${T1}} = ${num(V2)}\\ \\text{L}` }] };
  }
  if (subtema === 'densidad') {
    const f = az.elegir(['O2', 'N2', 'CO2', 'CH4', 'NH3', 'Cl2', 'SO2', 'He']);
    const P = az.decimal(0.5, 3, 2), T = az.entero(273, 400);
    const rho = densidadGas(P, masaMolar(f), T);
    const alt = numericas(az, rho, (x) => `${num(x)} g/L`, [masaMolar(f) / 22.4]);
    return { id: id('gas'), tema: 'gases', subtema, dificultad: d, enunciado: `¿Cuál es la densidad del ${fUnicode(f)} a ${num(P)} atm y ${T} K?`, ...alt, respuesta: `${num(rho)} g/L`, solucion: [{ titulo: 'ρ = PM/(RT)', tex: `\\rho = \\dfrac{${num(P)}\\times${num(masaMolar(f), 4)}}{0{,}08206\\times${T}} = ${num(rho)}\\ \\text{g/L}` }] };
  }
  const incognita = az.elegir(['P', 'V', 'n', 'T'] as const);
  const datos = { P: az.decimal(0.5, 5, 2), V: az.decimal(1, 50, 3), n: az.decimal(0.1, 5, 2), T: az.entero(250, 600) };
  const v = gasIdeal(datos, incognita);
  const unidad = { P: 'atm', V: 'L', n: 'mol', T: 'K' }[incognita];
  const textoDato = (k: 'P' | 'V' | 'n' | 'T') => `${k} = ${num(datos[k])} ${{ P: 'atm', V: 'L', n: 'mol', T: 'K' }[k]}`;
  const conocidos = (['P', 'V', 'n', 'T'] as const).filter((k) => k !== incognita);
  const alt = numericas(az, v, (x) => `${num(x)} ${unidad}`);
  return {
    id: id('gas'),
    tema: 'gases',
    subtema,
    dificultad: d,
    enunciado: `Para un gas ideal con ${conocidos.map(textoDato).join(', ')}, calcula ${incognita}.`,
    ...alt,
    respuesta: `${num(v)} ${unidad}`,
    solucion: [{ titulo: 'PV = nRT con R = 0.08206 L·atm/(mol·K)' }, { titulo: `${incognita} = ${num(v)} ${unidad}` }],
  };
}

// ── Punto de entrada ────────────────────────────────────────────────────────

const GENERADORES: Record<Tema, (az: Azar, subtema: string, d: Dificultad) => Pregunta> = {
  balanceo: preguntaBalanceo,
  'nomenclatura-inorganica': preguntaInorganica,
  'nomenclatura-organica': preguntaOrganica,
  estequiometria: preguntaEstequiometria,
  'tipos-reaccion': preguntaTipos,
  configuracion: preguntaConfiguracion,
  ph: preguntaPH,
  gases: preguntaGases,
};

export interface Seleccion {
  tema: Tema;
  subtemas?: string[];
}

/**
 * Genera `n` preguntas reproducibles para la selección de temas (y subtemas) dada.
 * Si una combinación falla (datos insuficientes), se intenta con otra semilla derivada.
 */
export function generarPreguntas(semilla: number, seleccion: Seleccion[], n: number, dificultad: Dificultad): Pregunta[] {
  const az = new Azar(semilla);
  const plan = seleccion.flatMap((s) => {
    const info = TEMAS.find((t) => t.id === s.tema)!;
    const subs = s.subtemas?.length ? s.subtemas : info.subtemas.map((x) => x.id);
    return subs.map((sub) => ({ tema: s.tema, sub }));
  });
  if (!plan.length) return [];
  const res: Pregunta[] = [];
  for (let i = 0; res.length < n && i < n * 6; i++) {
    const p = plan[i % plan.length]!;
    try {
      const q = GENERADORES[p.tema](az.derivar(i), p.sub, dificultad);
      if (!res.some((r) => r.enunciado === q.enunciado)) res.push(q);
    } catch {
      /* combinación sin datos suficientes: se prueba la siguiente */
    }
  }
  // Mezclar el orden de los temas de forma reproducible
  return az.barajar(res).map((q, k) => ({ ...q, id: `${semilla}-${k + 1}` }));
}

export const LETRAS = ['A', 'B', 'C', 'D', 'E'] as const;
export const formulaHillTexto = formulaHill;
