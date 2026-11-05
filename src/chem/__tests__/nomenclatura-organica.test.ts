import { beforeAll, describe, expect, it } from 'vitest';
import iniciarRDKit from '@rdkit/rdkit';
import type { RDKit } from '@/lib/rdkit';
import { parsearMolfile } from '../molecula';
import {
  aIngles,
  analizarCarbonos,
  formulaMolecularGrafo,
  formulaSemidesarrollada,
  grafoDeMolecula,
  nombrarOrganico,
  parsearNombre,
  smilesDeGrafo,
  tieneIsomeriaGeometrica,
  tipoIsomeria,
  type GrafoOrg,
} from '../nomenclatura/organica';
import fixture from './fixtures/organica-pubchem.json';
import { registrarValidacion } from './validacion';

let R: RDKit;
beforeAll(async () => {
  R = (await iniciarRDKit()) as RDKit;
}, 60000);

/** SMILES → grafo (vía molfile de RDKit en forma de Kekulé, como en la aplicación). */
function grafo(smiles: string): GrafoOrg {
  const m = R.get_mol(smiles)!;
  try {
    return grafoDeMolecula(parsearMolfile(m.get_molblock(JSON.stringify({ kekulize: true }))));
  } finally {
    m.delete();
  }
}
const canonico = (smiles: string) => {
  const m = R.get_mol(smiles)!;
  try {
    return m.get_smiles();
  } finally {
    m.delete();
  }
};

const COMPUESTOS = fixture.compuestos;

describe(`nomenclatura orgánica: ${COMPUESTOS.length} pares IUPAC ↔ SMILES verificados con PubChem`, () => {
  it('hay al menos 80 pares', () => expect(COMPUESTOS.length).toBeGreaterThanOrEqual(80));

  it.each(COMPUESTOS.map((c) => [c.nombre, c] as const))('%s', (_, c) => {
    // 1) Estructura → nombre
    const g = grafo(c.smiles);
    expect(nombrarOrganico(g).nombre).toBe(c.nombre);
    // 2) Nombre → estructura (igual a la de PubChem)
    const g2 = parsearNombre(c.nombre);
    expect(canonico(smilesDeGrafo(g2))).toBe(canonico(c.smilesPubChem));
    expect(formulaMolecularGrafo(g2)).toBe(c.formula);
    // 3) El nombre traducido coincide con el IUPACName de PubChem
    expect(aIngles(c.nombre).toLowerCase()).toBe(c.iupacPubChem!.toLowerCase());
  });

  it('genera la tabla de validación', () => {
    registrarValidacion(
      23,
      'Nomenclatura orgánica (IUPAC ↔ SMILES, PubChem)',
      COMPUESTOS.map((c) => ({ caso: c.smiles, referencia: c.iupacPubChem ?? '', calculado: `${nombrarOrganico(grafo(c.smiles)).nombre} → ${aIngles(c.nombre)}`, fuente: `PubChem CID ${c.cid}` })),
      'Para cada compuesto: nombre generado desde la estructura, estructura reconstruida desde el nombre (SMILES canónico de RDKit igual al de PubChem) y traducción al inglés igual al IUPACName de PubChem.',
    );
  });
});

describe('herramientas de química orgánica', () => {
  it('acepta variantes de escritura y rechaza nombres inválidos', () => {
    expect(canonico(smilesDeGrafo(parsearNombre('2-Metilpropano')))).toBe(canonico('CC(C)C'));
    expect(canonico(smilesDeGrafo(parsearNombre('tolueno')))).toBe(canonico('Cc1ccccc1'));
    expect(canonico(smilesDeGrafo(parsearNombre('2-(1-metiletil)pentano')))).toBe(canonico('CCCC(C)C(C)C'));
    expect(() => parsearNombre('2-metilxano')).toThrow();
    expect(() => parsearNombre('pent-7-eno')).toThrow();
    // Un C con cinco enlaces no es válido
    expect(() => parsearNombre('2,2,2-trimetilpropano')).toThrow();
  });

  it('nombra ramificaciones complejas y corrige nombres mal numerados', () => {
    // Regla de 1993: la cadena debe contener el doble enlace aunque haya otra más larga
    expect(nombrarOrganico(grafo('CCC(=C)CC')).nombre).toBe('2-etilbut-1-eno');
    expect(nombrarOrganico(grafo('CCCC(C(C)C)CCCC')).nombre).toBe('4-(1-metiletil)octano');
    // «4-metilpentano» mal numerado → 2-metilpentano
    expect(nombrarOrganico(parsearNombre('4-metilpentano')).nombre).toBe('2-metilpentano');
    expect(nombrarOrganico(parsearNombre('3-etilbutano')).nombre).toBe('3-metilpentano');
  });

  it('tipos de carbono, hibridación y fórmula semidesarrollada', () => {
    const c = analizarCarbonos(grafo('CC(C)(C)C=CC#C'));
    expect(c.filter((x) => x.tipo === 'primario').length).toBe(4);
    expect(c.filter((x) => x.tipo === 'cuaternario').length).toBe(1);
    expect(c.map((x) => x.hibridacion)).toEqual(['sp³', 'sp³', 'sp³', 'sp³', 'sp²', 'sp²', 'sp', 'sp']);
    expect(formulaSemidesarrollada(grafo('CC(O)C'))).toBe('CH₃–CH(OH)–CH₃');
    expect(formulaSemidesarrollada(grafo('CC(C)(C)C'))).toBe('CH₃–C(CH₃)₂–CH₃');
    expect(formulaSemidesarrollada(grafo('CCC(C)C(CC)CCO'))).toBe('CH₃–CH₂–CH(CH₃)–CH(CH₂–CH₃)–CH₂–CH₂–OH');
    expect(formulaSemidesarrollada(grafo('CCOC(C)=O'))).toMatch(/^CH₃–CH₂–O–C\(=O\)–CH₃$|^CH₃–C\(=O\)–O–CH₂–CH₃$/);
  });

  it('isomería estructural y geométrica', () => {
    expect(tipoIsomeria(grafo('CCCC'), grafo('CC(C)C'))).toBe('cadena');
    expect(tipoIsomeria(grafo('CCCO'), grafo('CC(O)C'))).toBe('posicion');
    expect(tipoIsomeria(grafo('CCO'), grafo('COC'))).toBe('funcion');
    expect(tipoIsomeria(grafo('CCC=O'), grafo('CC(C)=O'))).toBe('funcion');
    expect(tipoIsomeria(grafo('CCO'), grafo('OCC'))).toBe('iguales');
    expect(tipoIsomeria(grafo('CCO'), grafo('CCC'))).toBe('no son isomeros');
    expect(tieneIsomeriaGeometrica(grafo('CC=CC'))).toBe(true);
    expect(tieneIsomeriaGeometrica(grafo('C=CCC'))).toBe(false);
    expect(tieneIsomeriaGeometrica(grafo('CC(C)=CC'))).toBe(false);
    expect(tieneIsomeriaGeometrica(grafo('ClC=CCl'))).toBe(true);
  });
});
