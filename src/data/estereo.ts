/**
 * Ejemplos del módulo de estereoquímica. Los SMILES isoméricos son los de PubChem; sus descriptores
 * R/S y E/Z se calculan en `chem/estereo` y se validan contra RDKit en las pruebas.
 */

export interface EjemploEstereo {
  nombre: string;
  smiles: string;
  nota?: string;
}

/** Moléculas para practicar la asignación R/S. */
export const EJEMPLOS_RS: EjemploEstereo[] = [
  { nombre: 'L-alanina', smiles: 'C[C@@H](C(=O)O)N', nota: 'Aminoácido natural.' },
  { nombre: 'D-gliceraldehído', smiles: 'C([C@H](C=O)O)O', nota: 'Referencia de la serie D de los azúcares.' },
  { nombre: 'Ácido (S)-láctico', smiles: 'C[C@@H](C(=O)O)O', nota: 'Se forma en el músculo.' },
  { nombre: '(R)-2-butanol', smiles: 'CC[C@@H](C)O' },
  { nombre: 'L-cisteína', smiles: 'C([C@@H](C(=O)O)N)S', nota: 'Único aminoácido L con configuración R: el azufre da prioridad al CH₂SH.' },
  { nombre: 'L-treonina', smiles: 'C[C@H]([C@@H](C(=O)O)N)O', nota: 'Dos centros estereogénicos.' },
  { nombre: '(S)-ibuprofeno', smiles: 'C[C@@H](C1=CC=C(C=C1)CC(C)C)C(=O)O', nota: 'El enantiómero con actividad analgésica.' },
  { nombre: '(R)-carvona', smiles: 'CC1=CC[C@H](CC1=O)C(=C)C', nota: 'Aroma de menta verde; su enantiómero huele a alcaravea.' },
  { nombre: '(R)-limoneno', smiles: 'CC1=CC[C@@H](CC1)C(=C)C', nota: 'Aroma de naranja.' },
  { nombre: 'Ácido meso-tartárico', smiles: '[C@@H]([C@@H](C(=O)O)O)(C(=O)O)O', nota: 'Tiene dos centros, pero es aquiral (forma meso).' },
  { nombre: '(−)-mentol', smiles: 'CC(C)[C@@H]1CC[C@@H](C)C[C@H]1O', nota: 'Tres centros en un anillo.' },
  { nombre: 'Propan-2-ol (aquiral)', smiles: 'CC(C)O', nota: 'El carbono central tiene dos CH₃ iguales: no es un centro estereogénico.' },
];

/** Alquenos para practicar E/Z. */
export const EJEMPLOS_EZ: EjemploEstereo[] = [
  { nombre: '(E)-2-buteno', smiles: 'C/C=C/C', nota: 'También llamado trans-2-buteno.' },
  { nombre: '(Z)-2-buteno', smiles: 'C/C=C\\C', nota: 'También llamado cis-2-buteno.' },
  { nombre: 'Ácido fumárico', smiles: 'C(=C/C(=O)O)\\C(=O)O' },
  { nombre: 'Ácido maleico', smiles: 'C(=C\\C(=O)O)\\C(=O)O' },
  { nombre: '(E)-3-metil-2-penteno', smiles: 'CC/C(=C/C)/C', nota: 'Aquí cis/trans es ambiguo: hace falta E/Z.' },
  { nombre: '(Z)-3-metil-2-penteno', smiles: 'CC/C(=C\\C)/C' },
  { nombre: '1-bromo-2-cloro-1-fluoroeteno', smiles: 'F/C(Br)=C/Cl', nota: 'Cuatro sustituyentes distintos.' },
  { nombre: 'Geraniol', smiles: 'CC(=CCC/C(=C/CO)/C)C', nota: 'Aroma de rosas; el otro doble enlace no tiene isomería.' },
  { nombre: 'Nerol', smiles: 'CC(=CCC/C(=C\\CO)/C)C', nota: 'Isómero geométrico del geraniol.' },
  { nombre: '2-metil-2-buteno (sin isomería)', smiles: 'CC(C)=CC', nota: 'Un carbono lleva dos CH₃ iguales.' },
];

/** Familias de estereoisómeros: se generan todas las combinaciones invirtiendo los centros de la plantilla. */
export const FAMILIAS_ESTEREO: EjemploEstereo[] = [
  { nombre: 'Ácido tartárico (2 centros iguales)', smiles: '[C@@H]([C@H](C(=O)O)O)(C(=O)O)O', nota: 'Los dos centros llevan los mismos sustituyentes: aparece una forma meso.' },
  { nombre: 'Treonina (2 centros distintos)', smiles: 'C[C@H]([C@@H](C(=O)O)N)O', nota: 'Centros distintos: cuatro estereoisómeros.' },
  { nombre: '2,3-dibromobutano', smiles: 'C[C@@H](Br)[C@@H](C)Br' },
  { nombre: '2-bromo-3-clorobutano', smiles: 'C[C@@H](Br)[C@@H](C)Cl' },
  { nombre: 'Alanina (1 centro)', smiles: 'C[C@@H](C(=O)O)N' },
  { nombre: '2,3,4-trihidroxibutanal (aldotetrosas)', smiles: 'C([C@H]([C@H](C=O)O)O)O', nota: 'Eritrosa y treosa, cada una con su enantiómero.' },
];

/** Moléculas de cadena para la proyección de Fischer. */
export const EJEMPLOS_FISCHER: EjemploEstereo[] = [
  { nombre: 'D-gliceraldehído', smiles: 'C([C@H](C=O)O)O' },
  { nombre: 'L-gliceraldehído', smiles: 'C([C@@H](C=O)O)O' },
  { nombre: 'L-alanina', smiles: 'C[C@@H](C(=O)O)N' },
  { nombre: 'D-alanina', smiles: 'C[C@H](C(=O)O)N' },
  { nombre: 'L-treonina', smiles: 'C[C@H]([C@@H](C(=O)O)N)O' },
  { nombre: 'Ácido L-(+)-tartárico', smiles: '[C@@H]([C@H](C(=O)O)O)(C(=O)O)O' },
  { nombre: 'Ácido meso-tartárico', smiles: '[C@@H]([C@@H](C(=O)O)O)(C(=O)O)O' },
  { nombre: 'D-eritrosa', smiles: 'C([C@H]([C@H](C=O)O)O)O' },
  { nombre: 'D-glucosa', smiles: 'C([C@H]([C@H]([C@@H]([C@H](C=O)O)O)O)O)O' },
];

/** Moléculas para la proyección de Newman (se mira a lo largo del enlace C2–C3). */
export const EJEMPLOS_NEWMAN: EjemploEstereo[] = [
  { nombre: 'meso-2,3-dibromobutano', smiles: 'C[C@@H](Br)[C@H](C)Br' },
  { nombre: '(2R,3R)-2,3-dibromobutano', smiles: 'C[C@@H](Br)[C@@H](C)Br' },
  { nombre: 'Butano', smiles: 'CCCC' },
  { nombre: 'L-treonina', smiles: 'C[C@H]([C@@H](C(=O)O)N)O' },
];

export interface RotacionEspecifica {
  nombre: string;
  /** [α]D en grados (línea D del sodio, 589 nm, 20 °C). */
  alfa: number;
}

/** Rotaciones específicas de sustancias conocidas (McMurry, cap. 5; pendiente de revisión). */
export const ROTACIONES: { fuente: string; pendienteRevision: boolean; valores: RotacionEspecifica[] } = {
  fuente: 'J. McMurry, Química orgánica, cap. 5 (tabla de rotaciones específicas de algunas moléculas orgánicas)',
  pendienteRevision: true,
  valores: [
    { nombre: 'Penicilina V', alfa: 233 },
    { nombre: 'Sacarosa', alfa: 66.47 },
    { nombre: 'Alcanfor', alfa: 44.26 },
    { nombre: 'Glutamato monosódico', alfa: 25.5 },
    { nombre: 'Colesterol', alfa: -31.5 },
    { nombre: 'Morfina', alfa: -132 },
  ],
};
