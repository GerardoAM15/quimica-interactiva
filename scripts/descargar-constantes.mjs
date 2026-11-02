// Descarga los valores recomendados CODATA (NIST) y guarda en src/data/constantes.json
// solo las constantes que usa la aplicación.
// Uso: node scripts/descargar-constantes.mjs [--sin-cache]
import { descargar, guardarJSON, hoy } from './lib/util.mjs';

const URL = 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt';

// clave en la app → nombre exacto en la tabla del NIST
const BUSCADAS = {
  c: 'speed of light in vacuum',
  h: 'Planck constant',
  e: 'elementary charge',
  NA: 'Avogadro constant',
  kB: 'Boltzmann constant',
  R: 'molar gas constant',
  F: 'Faraday constant',
  me: 'electron mass',
  mp: 'proton mass',
  mn: 'neutron mass',
  u: 'atomic mass constant',
  a0: 'Bohr radius',
  Rinf: 'Rydberg constant',
  RinfHcEV: 'Rydberg constant times hc in eV',
  eps0: 'vacuum electric permittivity',
  eV: 'electron volt',
  Vm: 'molar volume of ideal gas (273.15 K, 101.325 kPa)',
  atm: 'standard atmosphere',
  alpha_mass: 'alpha particle mass',
};

const NOMBRES_ES = {
  c: 'Velocidad de la luz en el vacío',
  h: 'Constante de Planck',
  e: 'Carga elemental',
  NA: 'Constante de Avogadro',
  kB: 'Constante de Boltzmann',
  R: 'Constante de los gases',
  F: 'Constante de Faraday',
  me: 'Masa del electrón',
  mp: 'Masa del protón',
  mn: 'Masa del neutrón',
  u: 'Unidad de masa atómica',
  a0: 'Radio de Bohr',
  Rinf: 'Constante de Rydberg',
  RinfHcEV: 'Energía de Rydberg (R∞hc)',
  eps0: 'Permitividad eléctrica del vacío',
  eV: 'Electronvoltio',
  Vm: 'Volumen molar del gas ideal a 0 °C y 1 atm',
  atm: 'Atmósfera estándar',
  alpha_mass: 'Masa de la partícula alfa',
};

const texto = await descargar(URL);
const edicion = texto.match(/(\d{4}) CODATA adjustment/)?.[1];
const lineas = texto.split(/\r?\n/);
const inicio = lineas.findIndex((l) => l.startsWith('-----')) + 1;

const tabla = new Map();
for (const l of lineas.slice(inicio)) {
  if (!l.trim()) continue;
  const nombre = l.slice(0, 60).trim();
  const valor = l.slice(60, 85).replace(/\s/g, '').replace('...', '');
  const incert = l.slice(85, 110).replace(/\s/g, '');
  const unidad = l.slice(110).trim();
  tabla.set(nombre, { valor: Number(valor), incertidumbre: incert === '(exact)' ? 0 : Number(incert), unidad });
}

const constantes = {};
for (const [clave, nombre] of Object.entries(BUSCADAS)) {
  const fila = tabla.get(nombre);
  if (!fila || Number.isNaN(fila.valor)) throw new Error(`No se encontró «${nombre}» en la tabla del NIST`);
  constantes[clave] = { nombre: NOMBRES_ES[clave], nombreNIST: nombre, ...fila, exacta: fila.incertidumbre === 0 };
}

guardarJSON('src/data/constantes.json', {
  fuente: {
    nombre: `CODATA ${edicion} — Valores recomendados de las constantes físicas fundamentales (NIST)`,
    url: 'https://physics.nist.gov/cuu/Constants/',
    archivo: URL,
    edicion,
    descargado: hoy(),
  },
  constantes,
});
