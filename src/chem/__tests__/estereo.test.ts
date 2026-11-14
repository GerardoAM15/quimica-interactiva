import { beforeAll, describe, expect, it } from 'vitest';
import iniciarRDKit from '@rdkit/rdkit';
import { analizarEstructura, type RDKit } from '@/lib/rdkit';
import {
  alinearPorCentro,
  centrosEstereo,
  composicionEnantiomerica,
  coordenadas3DEstereo,
  doblesEnlacesEstereo,
  excesoEnantiomerico,
  imagenEspecular,
  maximoEstereoisomeros,
  prioridadesCIP,
  proyeccionFischer,
  proyeccionNewman,
  relacionEstereo,
  rotacionEspecifica,
  rotacionObservada,
  serieDL,
  tipoQuiralidad,
} from '../estereo';
import { distancia, pos } from '../molecula';
import { registrarValidacion } from './validacion';

let R: RDKit;
beforeAll(async () => {
  R = (await iniciarRDKit()) as RDKit;
  R.prefer_coordgen(true);
}, 60000);

const mol = (smiles: string) => analizarEstructura(R, smiles).molecula;

/** Descriptores de RDKit (referencia): «1:S 3:R» para los centros y «1-2:E» para los dobles enlaces. */
function referencia(smiles: string): { centros: string; dobles: string } {
  const m = R.get_mol(smiles)!;
  try {
    const t = JSON.parse(m.get_stereo_tags()) as { CIP_atoms: [number, string][]; CIP_bonds: [number, number, string][] };
    return {
      centros: t.CIP_atoms.map(([i, d]) => `${i}:${d.replace(/[()]/g, '')}`).sort().join(' '),
      dobles: t.CIP_bonds.map(([a, b, d]) => `${Math.min(a, b)}-${Math.max(a, b)}:${d.replace(/[()]/g, '')}`).sort().join(' '),
    };
  } finally {
    m.delete();
  }
}
const propios = (smiles: string) => {
  const m = mol(smiles);
  return {
    centros: centrosEstereo(m).map((c) => `${c.atomo}:${c.descriptor}`).sort().join(' '),
    dobles: doblesEnlacesEstereo(m).map((d) => `${Math.min(d.a, d.b)}-${Math.max(d.a, d.b)}:${d.descriptor}`).sort().join(' '),
  };
};

/** [nombre, SMILES isomérico (PubChem), descriptores de libro en el orden de los átomos]. */
const CENTROS: [string, string, string][] = [
  ['L-alanina', 'C[C@@H](C(=O)O)N', 'S'],
  ['D-alanina', 'C[C@H](C(=O)O)N', 'R'],
  ['L-serina', 'C([C@@H](C(=O)O)N)O', 'S'],
  ['L-cisteína', 'C([C@@H](C(=O)O)N)S', 'R'],
  ['L-valina', 'CC(C)[C@@H](C(=O)O)N', 'S'],
  ['L-leucina', 'CC(C)C[C@@H](C(=O)O)N', 'S'],
  ['L-fenilalanina', 'C1=CC=C(C=C1)C[C@@H](C(=O)O)N', 'S'],
  ['L-ácido aspártico', 'C([C@@H](C(=O)O)N)C(=O)O', 'S'],
  ['L-metionina', 'CSCC[C@@H](C(=O)O)N', 'S'],
  ['L-prolina', 'C1C[C@H](NC1)C(=O)O', 'S'],
  ['L-treonina', 'C[C@H]([C@@H](C(=O)O)N)O', 'R S'],
  ['L-isoleucina', 'CC[C@H](C)[C@@H](C(=O)O)N', 'S S'],
  ['ácido (S)-láctico', 'C[C@@H](C(=O)O)O', 'S'],
  ['ácido (R)-láctico', 'C[C@H](C(=O)O)O', 'R'],
  ['D-gliceraldehído', 'C([C@H](C=O)O)O', 'R'],
  ['L-gliceraldehído', 'C([C@@H](C=O)O)O', 'S'],
  ['ácido L-(+)-tartárico', '[C@@H]([C@H](C(=O)O)O)(C(=O)O)O', 'R R'],
  ['ácido D-(−)-tartárico', '[C@H]([C@@H](C(=O)O)O)(C(=O)O)O', 'S S'],
  ['ácido meso-tartárico', '[C@@H]([C@@H](C(=O)O)O)(C(=O)O)O', 'R S'],
  ['D-glucosa (cadena abierta)', 'C([C@H]([C@H]([C@@H]([C@H](C=O)O)O)O)O)O', 'R R S R'],
  ['(R)-2-butanol', 'CC[C@@H](C)O', 'R'],
  ['(S)-2-butanol', 'CC[C@H](C)O', 'S'],
  ['(S)-ibuprofeno', 'C[C@@H](C1=CC=C(C=C1)CC(C)C)C(=O)O', 'S'],
  ['(S)-naproxeno', 'C[C@@H](C1=CC2=C(C=C1)C=C(C=C2)OC)C(=O)O', 'S'],
  ['(R)-carvona', 'CC1=CC[C@H](CC1=O)C(=C)C', 'R'],
  ['(S)-carvona', 'CC1=CC[C@@H](CC1=O)C(=C)C', 'S'],
  ['(R)-limoneno', 'CC1=CC[C@@H](CC1)C(=C)C', 'R'],
  ['(R)-adrenalina', 'CNC[C@@H](C1=CC(=C(C=C1)O)O)O', 'R'],
  ['(−)-mentol', 'CC(C)[C@@H]1CC[C@@H](C)C[C@H]1O', 'S R R'],
  ['(2R,3R)-2,3-dibromobutano', 'C[C@@H](Br)[C@@H](C)Br', 'R R'],
  ['meso-2,3-dibromobutano', 'C[C@@H](Br)[C@H](C)Br', 'R S'],
  ['trans-1,2-dimetilciclohexano', 'C[C@@H]1CCCC[C@H]1C', 'R R'],
  ['(S)-3-metilhexano', 'CCC[C@@H](C)CC', 'S'],
  ['bromoclorofluorometano', 'F[C@H](Cl)Br', ''],
];

const DOBLES: [string, string, string][] = [
  ['(E)-2-buteno', 'C/C=C/C', 'E'],
  ['(Z)-2-buteno', 'C/C=C\\C', 'Z'],
  ['(E)-1,2-dicloroeteno', 'Cl/C=C/Cl', 'E'],
  ['(Z)-1,2-dicloroeteno', 'Cl/C=C\\Cl', 'Z'],
  ['ácido fumárico', 'C(=C/C(=O)O)\\C(=O)O', 'E'],
  ['ácido maleico', 'C(=C\\C(=O)O)\\C(=O)O', 'Z'],
  ['(E)-cinamaldehído', 'C1=CC=C(C=C1)/C=C/C=O', 'E'],
  ['(E)-3-metil-2-penteno', 'CC/C(=C/C)/C', 'E'],
  ['(Z)-3-metil-2-penteno', 'CC/C(=C\\C)/C', 'Z'],
  ['geraniol', 'CC(=CCC/C(=C/CO)/C)C', 'E'],
  ['nerol', 'CC(=CCC/C(=C\\CO)/C)C', 'Z'],
  ['(Z)-1-bromo-2-cloro-1-fluoroeteno', 'F/C(Br)=C/Cl', ''],
];

describe('configuración R/S (reglas de Cahn-Ingold-Prelog)', () => {
  it.each(CENTROS)('%s', (_nombre, smiles, libro) => {
    const [mio, ref] = [propios(smiles), referencia(smiles)];
    expect(mio.centros).toBe(ref.centros);
    if (libro) expect(mio.centros.split(' ').map((x) => x.split(':')[1]).join(' ')).toBe(libro);
  });

  it('registra la validación frente a RDKit', () => {
    expect(CENTROS.length).toBeGreaterThanOrEqual(30);
    registrarValidacion(
      30,
      'Estereoquímica: configuración R/S y E/Z (propio vs RDKit)',
      [...CENTROS, ...DOBLES].map(([nombre, smiles]) => {
        const [mio, ref] = [propios(smiles), referencia(smiles)];
        return { caso: nombre, referencia: [ref.centros, ref.dobles].filter(Boolean).join(' ') || '—', calculado: [mio.centros, mio.dobles].filter(Boolean).join(' ') || '—', fuente: 'RDKit' };
      }),
      'Descriptores por índice de átomo (átomo:descriptor). Referencia: RDKit (get_stereo_tags).',
    );
  });

  it('no marca centros en moléculas aquirales', () => {
    for (const s of ['CCO', 'CC(C)O', 'CC(C)(C)O', 'C1CCCCC1', 'CC(=O)O', 'ClC(Cl)(F)F']) expect(centrosEstereo(mol(s)), s).toHaveLength(0);
  });

  it('ordena los sustituyentes: en la L-alanina NH₂ > COOH > CH₃ > H', () => {
    const m = mol('C[C@@H](C(=O)O)N');
    const sus = prioridadesCIP(m, 1);
    expect(sus.map((s) => m.atomos[s.atomo]!.simbolo)).toEqual(['N', 'C', 'C', 'H']);
    // COOH (O, O, O) antes que CH₃ (H, H, H): el C=O cuenta como dos oxígenos (átomo duplicado)
    expect(sus[1]!.esferas[1]).toEqual(['O', 'O', 'O']);
    expect(sus[2]!.esferas[1]).toEqual(['H', 'H', 'H']);
    expect(sus.map((s) => s.prioridad)).toEqual([1, 2, 3, 4]);
  });

  it('sin cuñas no asigna descriptor', () => {
    const c = centrosEstereo(mol('CC(N)C(=O)O'));
    expect(c).toHaveLength(1);
    expect(c[0]!.descriptor).toBeNull();
  });
});

describe('isomería E/Z', () => {
  it.each(DOBLES)('%s', (_nombre, smiles, libro) => {
    const [mio, ref] = [propios(smiles), referencia(smiles)];
    expect(mio.dobles).toBe(ref.dobles);
    if (libro) expect(mio.dobles.split(':').at(-1)).toBe(libro);
  });

  it('no hay E/Z si un carbono tiene dos sustituyentes iguales o el doble enlace está en un anillo pequeño', () => {
    for (const s of ['C=C', 'CC=C', 'CC(C)=CC', 'C1=CCCCC1']) expect(doblesEnlacesEstereo(mol(s)), s).toHaveLength(0);
  });
});

describe('geometría 3D que respeta la configuración', () => {
  it.each([...CENTROS, ...DOBLES])('%s', (_nombre, smiles) => {
    const m2 = mol(smiles);
    const { molecula, exacta } = coordenadas3DEstereo(m2);
    expect(exacta).toBe(true);
    expect(centrosEstereo(molecula).map((c) => `${c.atomo}:${c.descriptor}`)).toEqual(centrosEstereo(m2).map((c) => `${c.atomo}:${c.descriptor}`));
  });

  it('la imagen especular invierte todos los centros', () => {
    const { molecula } = coordenadas3DEstereo(mol('C[C@H]([C@@H](C(=O)O)N)O'));
    expect(centrosEstereo(molecula).map((c) => c.descriptor)).toEqual(['R', 'S']);
    expect(centrosEstereo(imagenEspecular(molecula)).map((c) => c.descriptor)).toEqual(['S', 'R']);
  });
});

describe('superposición con la imagen especular', () => {
  it('al alinear dos sustituyentes de un enantiómero, los otros dos quedan intercambiados', () => {
    const { molecula } = coordenadas3DEstereo(mol('C[C@@H](C(=O)O)N'));
    const c = centrosEstereo(molecula)[0]!;
    const [s1, s2, s3, s4] = c.sustituyentes.map((s) => s.atomo) as [number, number, number, number];
    const reflejo = alinearPorCentro(molecula, imagenEspecular(molecula), c.atomo, s1, s2);
    const d = (i: number, j: number) => distancia(pos(molecula.atomos[i]!), pos(reflejo.atomos[j]!));
    expect(d(c.atomo, c.atomo)).toBeLessThan(1e-6);
    expect(d(s1, s1)).toBeLessThan(0.05);
    expect(d(s2, s2)).toBeLessThan(0.05);
    // CH₃ y H no coinciden consigo mismos: cada uno cae donde estaba el otro
    expect(d(s3, s3)).toBeGreaterThan(0.8);
    expect(d(s3, s4)).toBeLessThan(d(s3, s3));
    // La alineación es una rotación: conserva la configuración del reflejo (R)
    expect(centrosEstereo(reflejo)[0]!.descriptor).toBe('R');
  });
});

describe('proyecciones de Fischer y de Newman', () => {
  const fischer = (s: string) => proyeccionFischer(mol(s))!;

  it('D-gliceraldehído: CHO arriba, OH a la derecha, serie D', () => {
    const f = fischer('C([C@H](C=O)O)O');
    expect([f.arriba, f.abajo]).toEqual(['CHO', 'CH₂OH']);
    expect(f.filas).toHaveLength(1);
    expect([f.filas[0]!.izquierda, f.filas[0]!.derecha]).toEqual(['H', 'OH']);
    expect(serieDL(f)).toBe('D');
    expect(serieDL(fischer('C([C@@H](C=O)O)O'))).toBe('L');
  });

  it('L-alanina: COOH arriba, NH₂ a la izquierda, serie L', () => {
    const f = fischer('C[C@@H](C(=O)O)N');
    expect([f.arriba, f.abajo]).toEqual(['COOH', 'CH₃']);
    expect([f.filas[0]!.izquierda, f.filas[0]!.derecha]).toEqual(['NH₂', 'H']);
    expect(serieDL(f)).toBe('L');
  });

  it('D-glucosa: OH a la derecha, izquierda, derecha, derecha (C2 a C5)', () => {
    const f = fischer('C([C@H]([C@H]([C@@H]([C@H](C=O)O)O)O)O)O');
    expect(f.filas.map((x) => (x.derecha === 'OH' ? 'der' : 'izq'))).toEqual(['der', 'izq', 'der', 'der']);
    expect(serieDL(f)).toBe('D');
  });

  it('ácido tartárico: en el meso los dos OH quedan al mismo lado; en el L-(+), en lados opuestos', () => {
    const lados = (s: string) => fischer(s).filas.map((x) => (x.derecha === 'OH' ? 'der' : 'izq'));
    const meso = lados('[C@@H]([C@@H](C(=O)O)O)(C(=O)O)O');
    expect(meso[0]).toBe(meso[1]);
    const l = lados('[C@@H]([C@H](C(=O)O)O)(C(=O)O)O');
    expect(l[0]).not.toBe(l[1]);
  });

  it('Newman: tres sustituyentes delante y tres detrás, separados unos 120°', () => {
    const { molecula } = coordenadas3DEstereo(mol('C[C@@H](Br)[C@H](C)Br'));
    const n = proyeccionNewman(molecula, 1, 3);
    expect(n.delante).toHaveLength(3);
    expect(n.detras).toHaveLength(3);
    const ang = n.delante.map((s) => s.angulo).sort((a, b) => a - b);
    expect(ang[1]! - ang[0]!).toBeGreaterThan(95);
    expect(ang[2]! - ang[1]!).toBeGreaterThan(95);
    expect(n.delante.map((s) => s.texto).sort()).toEqual(['Br', 'CH₃', 'H']);
  });
});

describe('relaciones entre estereoisómeros y actividad óptica', () => {
  it('clasifica pares de estereoisómeros', () => {
    expect(relacionEstereo(['R', 'R'], ['S', 'S'], false)).toBe('enantiómeros');
    expect(relacionEstereo(['R', 'R'], ['R', 'S'], false)).toBe('diastereómeros');
    expect(relacionEstereo(['R', 'S'], ['S', 'R'], true)).toBe('idénticos'); // forma meso
    expect(tipoQuiralidad(2, true)).toBe('meso');
    expect(tipoQuiralidad(1, false)).toBe('quiral');
    expect(tipoQuiralidad(0, true)).toBe('aquiral');
    expect(maximoEstereoisomeros(4)).toBe(16); // aldohexosas: 2⁴
  });

  it('ley de Biot y exceso enantiomérico', () => {
    // 1,00 g en 10,0 mL (0,100 g/mL), tubo de 1,00 dm, [α] = +66,47 → α = +6,647°
    expect(rotacionObservada(66.47, 1, 0.1)).toBeCloseTo(6.647, 3);
    expect(rotacionEspecifica(6.647, 1, 0.1)).toBeCloseTo(66.47, 2);
    // Muestra con [α] = +11,6 de un compuesto cuyo enantiómero puro tiene +23,2: ee = 50 % → 75 % / 25 %
    expect(excesoEnantiomerico(11.6, 23.2)).toBeCloseTo(50, 6);
    expect(composicionEnantiomerica(50)).toEqual({ mayoritario: 75, minoritario: 25 });
    expect(composicionEnantiomerica(0)).toEqual({ mayoritario: 50, minoritario: 50 }); // mezcla racémica
  });
});
