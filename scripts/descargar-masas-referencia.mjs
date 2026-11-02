// Descarga de PubChem la fórmula y la masa molar de compuestos de referencia para validar
// el parser de fórmulas (src/chem/__tests__/fixtures/masas-pubchem.json).
// Uso: node scripts/descargar-masas-referencia.mjs [--sin-cache]
import { descargar, guardarJSON, hoy } from './lib/util.mjs';

// [fórmula tal como la escribe un estudiante, CID de PubChem, nombre]
const COMPUESTOS = [
  ['H2O', 962, 'agua'],
  ['CO2', 280, 'dióxido de carbono'],
  ['NaCl', 5234, 'cloruro de sodio'],
  ['H2SO4', 1118, 'ácido sulfúrico'],
  ['HNO3', 944, 'ácido nítrico'],
  ['HCl', 313, 'cloruro de hidrógeno'],
  ['NH3', 222, 'amoníaco'],
  ['CH4', 297, 'metano'],
  ['C2H5OH', 702, 'etanol'],
  ['C6H12O6', 5793, 'glucosa'],
  ['C12H22O11', 5988, 'sacarosa'],
  ['CaCO3', 10112, 'carbonato de calcio'],
  ['Ca(OH)2', 6093208, 'hidróxido de calcio'],
  ['NaOH', 14798, 'hidróxido de sodio'],
  ['KMnO4', 516875, 'permanganato de potasio'],
  ['K2Cr2O7', 24502, 'dicromato de potasio'],
  ['CuSO4', 24462, 'sulfato de cobre(II)'],
  ['CuSO4·5H2O', 24463, 'sulfato de cobre(II) pentahidratado'],
  ['Al2(SO4)3', 24850, 'sulfato de aluminio'],
  ['Fe2O3', 518696, 'óxido de hierro(III)'],
  ['(NH4)2SO4', 6097028, 'sulfato de amonio'],
  ['Mg3(PO4)2', 24439, 'fosfato de magnesio'],
  ['Ca3(PO4)2', 24456, 'fosfato de calcio'],
  ['NaHCO3', 516892, 'bicarbonato de sodio'],
  ['C6H6', 241, 'benceno'],
  ['CH3COOH', 176, 'ácido acético'],
  ['C3H8', 6334, 'propano'],
  ['C8H18', 356, 'octano'],
  ['H3PO4', 1004, 'ácido fosfórico'],
  ['KClO3', 6426889, 'clorato de potasio'],
  ['Na2CO3', 10340, 'carbonato de sodio'],
  ['Na2SO4·10H2O', 62649, 'sulfato de sodio decahidratado'],
  ['BaCl2·2H2O', 5284346, 'cloruro de bario dihidratado'],
  ['Pb(NO3)2', 24924, 'nitrato de plomo(II)'],
  ['AgNO3', 24470, 'nitrato de plata'],
  ['K4[Fe(CN)6]', 9605257, 'ferrocianuro de potasio'],
  ['C6H8O7', 311, 'ácido cítrico'],
  ['C2H2', 6326, 'acetileno'],
  ['SO2', 1119, 'dióxido de azufre'],
  ['N2O5', 66242, 'pentóxido de dinitrógeno'],
  ['O3', 24823, 'ozono'],
  ['P4O10', 14812, 'decaóxido de tetrafósforo'],
];

const salida = [];
for (const [formula, cid, nombre] of COMPUESTOS) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`;
  const p = JSON.parse(await descargar(url)).PropertyTable.Properties[0];
  salida.push({
    formula,
    nombre,
    cid,
    formulaPubChem: p.MolecularFormula,
    masaMolar: Number(p.MolecularWeight),
    masaMolarTexto: String(p.MolecularWeight), // conserva los decimales que reporta PubChem
    nombreIUPAC: p.IUPACName ?? null,
  });
  console.log(`  ${formula.padEnd(14)} ${p.MolecularFormula.padEnd(14)} ${p.MolecularWeight}`);
}

guardarJSON('src/chem/__tests__/fixtures/masas-pubchem.json', {
  fuente: { nombre: 'PubChem PUG REST (propiedades calculadas)', licencia: 'Dominio público', descargado: hoy() },
  compuestos: salida,
});
