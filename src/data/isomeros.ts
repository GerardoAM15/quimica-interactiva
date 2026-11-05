/**
 * Isómeros estructurales por fórmula molecular (sin estereoisómeros), escritos por su nombre IUPAC.
 * `completo` indica que la lista contiene todos los isómeros constitucionales; si es false, es una
 * selección (se omiten, por ejemplo, los heterociclos). Las pruebas comprueban fórmula y nombre.
 */
export interface GrupoIsomeros {
  formula: string;
  completo: boolean;
  nota?: string;
  nombres: string[];
}

export const ISOMEROS: GrupoIsomeros[] = [
  { formula: 'C4H10', completo: true, nombres: ['butano', '2-metilpropano'] },
  { formula: 'C5H12', completo: true, nombres: ['pentano', '2-metilbutano', '2,2-dimetilpropano'] },
  { formula: 'C6H14', completo: true, nombres: ['hexano', '2-metilpentano', '3-metilpentano', '2,2-dimetilbutano', '2,3-dimetilbutano'] },
  {
    formula: 'C4H8',
    completo: true,
    nota: 'El but-2-eno además tiene isómeros cis y trans.',
    nombres: ['but-1-eno', 'but-2-eno', '2-metilprop-1-eno', 'ciclobutano', 'metilciclopropano'],
  },
  { formula: 'C3H8O', completo: true, nombres: ['propan-1-ol', 'propan-2-ol', 'metoxietano'] },
  {
    formula: 'C4H10O',
    completo: true,
    nombres: ['butan-1-ol', 'butan-2-ol', '2-metilpropan-1-ol', '2-metilpropan-2-ol', 'etoxietano', '1-metoxipropano', '2-metoxipropano'],
  },
  {
    formula: 'C3H6O',
    completo: false,
    nota: 'Selección: faltan los heterociclos (oxetano, metiloxirano) y los enoles.',
    nombres: ['propanal', 'propan-2-ona', 'prop-2-en-1-ol', 'metoxieteno', 'ciclopropanol'],
  },
  {
    formula: 'C3H6O2',
    completo: false,
    nota: 'Selección: ácido, ésteres e hidroxialdehídos/cetonas más comunes.',
    nombres: ['ácido propanoico', 'etanoato de metilo', 'metanoato de etilo', '2-hidroxipropanal', '3-hidroxipropanal', '1-hidroxipropan-2-ona'],
  },
  { formula: 'C3H9N', completo: true, nombres: ['propan-1-amina', 'propan-2-amina', 'N-metiletanamina', 'N,N-dimetilmetanamina'] },
];
