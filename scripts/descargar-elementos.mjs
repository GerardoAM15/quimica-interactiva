// Descarga la tabla periódica de PubChem (dominio público) y la guarda en src/data/elementos.json,
// agregando los nombres en español (IUPAC/RAE) y el origen de los símbolos no evidentes.
// Requiere src/data/isotopos.json (ejecutar antes scripts/descargar-isotopos.mjs).
// Uso: node scripts/descargar-elementos.mjs [--sin-cache]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { descargar, guardarJSON, hoy, num, RAIZ, sinIncertidumbre } from './lib/util.mjs';

const URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON';

// ── Masa atómica ──
// La tabla periódica de PubChem trunca algunos valores (Pb «207», Li «7», Br «79.9»), aunque sus
// masas molares de compuestos usan los valores completos. Por eso la masa atómica se toma así:
//  1. peso atómico estándar IUPAC publicado por el NIST, si es un valor único (Fe 55.845);
//  2. si el NIST da un intervalo [a, b] (H, C, S, Cl…): el valor de PubChem si cae dentro del intervalo
//     (es el que PubChem usa en sus masas molares, p. ej. S = 32.07); si no (Li «7», Br «79.9»),
//     el «valor convencional» IUPAC;
//  3. elementos sin peso estándar (radiactivos): el valor de PubChem (masa del isótopo más estable).
const CONVENCIONALES_IUPAC = {
  H: 1.008, Li: 6.94, B: 10.81, C: 12.011, N: 14.007, O: 15.999, Mg: 24.305,
  Si: 28.085, S: 32.06, Cl: 35.45, Br: 79.904, Tl: 204.38,
};
const pesosNIST = new Map(
  JSON.parse(readFileSync(join(RAIZ, 'src/data/isotopos.json'), 'utf8')).elementos.map((e) => [e.z, e.pesoAtomicoEstandar]),
);
function masaAtomica(z, simbolo, valorPubChem) {
  const pub = num(valorPubChem);
  const w = (pesosNIST.get(z) ?? '').trim();
  const intervalo = /^\[([\d.]+),([\d.]+)\]$/.exec(w);
  if (intervalo) {
    const [a, b] = [Number(intervalo[1]), Number(intervalo[2])];
    if (pub !== null && pub >= a && pub <= b) return { valor: pub, origen: 'PubChem (dentro del intervalo IUPAC)' };
    if (CONVENCIONALES_IUPAC[simbolo]) return { valor: CONVENCIONALES_IUPAC[simbolo], origen: 'IUPAC (valor convencional)' };
  }
  const unico = w.startsWith('[') ? NaN : sinIncertidumbre(w);
  if (Number.isFinite(unico) && unico > 0) return { valor: unico, origen: 'IUPAC (NIST)' };
  return { valor: pub, origen: 'PubChem' };
}

// Nombres en español, en orden de número atómico (Z = 1 … 118).
const NOMBRES = `Hidrógeno Helio Litio Berilio Boro Carbono Nitrógeno Oxígeno Flúor Neón Sodio Magnesio Aluminio
Silicio Fósforo Azufre Cloro Argón Potasio Calcio Escandio Titanio Vanadio Cromo Manganeso Hierro Cobalto Níquel
Cobre Zinc Galio Germanio Arsénico Selenio Bromo Kriptón Rubidio Estroncio Itrio Circonio Niobio Molibdeno
Tecnecio Rutenio Rodio Paladio Plata Cadmio Indio Estaño Antimonio Telurio Yodo Xenón Cesio Bario Lantano Cerio
Praseodimio Neodimio Prometio Samario Europio Gadolinio Terbio Disprosio Holmio Erbio Tulio Iterbio Lutecio Hafnio
Tantalio Wolframio Renio Osmio Iridio Platino Oro Mercurio Talio Plomo Bismuto Polonio Astato Radón Francio Radio
Actinio Torio Protactinio Uranio Neptunio Plutonio Americio Curio Berkelio Californio Einstenio Fermio Mendelevio
Nobelio Laurencio Rutherfordio Dubnio Seaborgio Bohrio Hasio Meitnerio Darmstatio Roentgenio Copernicio Nihonio
Flerovio Moscovio Livermorio Teneso Oganesón`
  .split(/\s+/)
  .filter(Boolean);

// Variantes aceptadas por la RAE / usadas en textos peruanos (para la búsqueda).
const ALIAS = {
  Zn: ['Cinc'],
  Kr: ['Criptón'],
  Zr: ['Zirconio'],
  W: ['Tungsteno'],
  Ta: ['Tántalo'],
  Te: ['Teluro'],
  I: ['Iodo'],
  Es: ['Einsteinio'],
  Lr: ['Lawrencio'],
  Ds: ['Darmstadtio'],
};

// Símbolos que no se derivan del nombre en español (origen latino, griego o alemán).
const ORIGEN_SIMBOLO = {
  Na: 'del latín natrium',
  K: 'del latín kalium',
  Fe: 'del latín ferrum',
  Cu: 'del latín cuprum',
  Ag: 'del latín argentum',
  Sn: 'del latín stannum',
  Sb: 'del latín stibium',
  Au: 'del latín aurum',
  Hg: 'del latín hydrargyrum (del griego «plata líquida»)',
  Pb: 'del latín plumbum',
  W: 'del alemán Wolfram',
  P: 'del griego phosphoros («portador de luz»)',
  S: 'del latín sulphur',
  N: 'del latín nitrogenium',
};

const FAMILIA = {
  'Alkali metal': 'alcalino',
  'Alkaline earth metal': 'alcalinoterreo',
  'Transition metal': 'transicion',
  'Post-transition metal': 'postransicion',
  Metalloid: 'metaloide',
  Nonmetal: 'no-metal',
  Halogen: 'halogeno',
  'Noble gas': 'gas-noble',
  Lanthanide: 'lantanido',
  Actinide: 'actinido',
};

function estado(s) {
  const t = s.toLowerCase();
  const estadoEstandar = t.includes('gas') ? 'gas' : t.includes('liquid') ? 'liquido' : 'solido';
  return { estadoEstandar, estadoEsperado: t.startsWith('expected') };
}

const crudo = JSON.parse(await descargar(URL));
const columnas = crudo.Table.Columns.Column;
const filas = crudo.Table.Row.map((r) => Object.fromEntries(columnas.map((c, i) => [c, r.Cell[i]])));

if (NOMBRES.length !== 118) throw new Error(`Se esperaban 118 nombres en español, hay ${NOMBRES.length}`);
if (filas.length !== 118) throw new Error(`PubChem devolvió ${filas.length} elementos`);

const elementos = filas.map((f) => {
  const z = Number(f.AtomicNumber);
  const familia = FAMILIA[f.GroupBlock];
  if (!familia) throw new Error(`Familia desconocida para Z=${z}: ${f.GroupBlock}`);
  const anio = f.YearDiscovered === 'Ancient' ? null : num(f.YearDiscovered);
  return {
    z,
    simbolo: f.Symbol,
    nombre: NOMBRES[z - 1],
    nombreIngles: f.Name,
    alias: ALIAS[f.Symbol] ?? [],
    origenSimbolo: ORIGEN_SIMBOLO[f.Symbol] ?? null,
    ...(({ valor, origen }) => ({ masaAtomica: valor, origenMasaAtomica: origen }))(masaAtomica(z, f.Symbol, f.AtomicMass)),
    masaAtomicaPubChem: num(f.AtomicMass),
    colorCPK: f.CPKHexColor ? `#${f.CPKHexColor}` : null,
    configuracionPubChem: f.ElectronConfiguration || null,
    electronegatividad: num(f.Electronegativity), // escala de Pauling
    radioVdW: num(f.AtomicRadius), // pm (radio de van der Waals)
    energiaIonizacion: num(f.IonizationEnergy), // eV (primera)
    afinidadElectronica: num(f.ElectronAffinity), // eV
    estadosOxidacion: f.OxidationStates
      ? f.OxidationStates.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
      : [],
    ...estado(f.StandardState),
    puntoFusion: num(f.MeltingPoint), // K
    puntoEbullicion: num(f.BoilingPoint), // K
    densidad: num(f.Density), // g/cm³
    familia,
    anioDescubrimiento: anio,
    conocidoDesdeAntiguedad: f.YearDiscovered === 'Ancient',
  };
});

guardarJSON('src/data/elementos.json', {
  fuente: {
    nombre: 'PubChem Periodic Table (NCBI/NIH)',
    url: 'https://pubchem.ncbi.nlm.nih.gov/periodic-table/',
    api: URL,
    licencia: 'Dominio público',
    descargado: hoy(),
    unidades: {
      masaAtomica: 'u (g/mol)',
      radioVdW: 'pm (radio de van der Waals)',
      energiaIonizacion: 'eV',
      afinidadElectronica: 'eV',
      puntoFusion: 'K',
      puntoEbullicion: 'K',
      densidad: 'g/cm³',
      electronegatividad: 'escala de Pauling',
    },
    notas:
      'Nombres en español según IUPAC/RAE agregados por el proyecto. masaAtomica: peso atómico estándar IUPAC (NIST) o valor convencional IUPAC; masaAtomicaPubChem conserva el valor de la tabla de PubChem.',
  },
  elementos,
});
