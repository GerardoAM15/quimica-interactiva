import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import catalogo from '@/data/moleculas.json';
import dipolos from '@/data/dipolos.json';
import { angulo, formulaDeMolecula, parsearMolfile, pos, vecindario, type Molecula } from '../molecula';
import { formulaHill, masaMolar } from '../formula';
import { analizarAtomo } from '../vsepr';
import { esPolar, fuerzasIntermoleculares } from '../fuerzas';
import { esHipervalente } from '../coordenadas3d';
import { registrarValidacion } from './validacion';

const M = catalogo.moleculas;
const porNombre = (n: string) => {
  const m = M.find((x) => x.nombre === n);
  if (!m) throw new Error(`No está en el catálogo: ${n}`);
  return m;
};
const cargar = (cid: number): Molecula => parsearMolfile(readFileSync(`public/moleculas/${cid}.sdf`, 'utf8'));
const molDe = (n: string) => cargar(porNombre(n).cid);

describe('integridad del catálogo de moléculas', () => {
  it('tiene al menos 280 moléculas con CID únicos', () => {
    expect(M.length).toBeGreaterThanOrEqual(280);
    expect(new Set(M.map((m) => m.cid)).size).toBe(M.length);
  });

  it.each(M.map((m) => [m.nombre, m] as const))('%s: carga su estructura y coincide con PubChem', (_, m) => {
    expect(m.nombre.length).toBeGreaterThan(1);
    expect(m.smiles.length).toBeGreaterThan(0);
    expect(existsSync(`public/moleculas/${m.cid}.sdf`)).toBe(true);
    const mol = cargar(m.cid);
    expect(mol.atomos.length).toBeGreaterThan(0);
    expect(mol.es3D || !m.tiene3D).toBe(true);
    // Fórmula reconstruida a partir de los átomos del SDF = fórmula de PubChem
    const carga = mol.atomos.reduce((s, a) => s + a.carga, 0);
    expect(carga).toBe(m.carga);
    const sinCarga = (f: string) => f.replace(/[+-]\d*$/, '');
    expect(sinCarga(formulaDeMolecula(mol))).toBe(formulaHill(sinCarga(m.formula)));
    // Masa molar con nuestras masas atómicas (PubChem trunca al último decimal que muestra: 280,452 → «280,4»)
    const decimales = String(m.masaMolar).split('.')[1]?.length ?? 0;
    expect(Math.abs(masaMolar(sinCarga(m.formula)) - m.masaMolar)).toBeLessThan(Math.max(0.01, 10 ** -decimales) + 1e-9);
  });

  it('los momentos dipolares curados corresponden a moléculas del catálogo', () => {
    for (const nombre of Object.keys(dipolos.valores)) expect(() => porNombre(nombre)).not.toThrow();
  });
});

describe('geometría de los conformeros 3D de PubChem', () => {
  // Ángulos experimentales (Chang; Brown) frente a los medidos en el conformero de PubChem
  const casos: [string, string, string, string, number][] = [
    ['agua', 'H', 'O', 'H', 104.5],
    ['amoníaco', 'H', 'N', 'H', 107],
    ['metano', 'H', 'C', 'H', 109.5],
    ['eteno (etileno)', 'H', 'C', 'H', 117],
    ['dióxido de carbono', 'O', 'C', 'O', 180],
    ['metanal (formaldehído)', 'H', 'C', 'H', 116],
  ];
  it('los ángulos medidos están a menos de 4° de los experimentales', () => {
    const filas = casos.map(([n, a, c, b, exp]) => {
      const mol = molDe(n);
      const vec = vecindario(mol);
      const ic = mol.atomos.findIndex((x, i) => x.simbolo === c && vec[i]!.filter((v) => mol.atomos[v.i]!.simbolo === a || mol.atomos[v.i]!.simbolo === b).length >= 2);
      const vs = vec[ic]!.filter((v) => [a, b].includes(mol.atomos[v.i]!.simbolo));
      const med = angulo(pos(mol.atomos[vs[0]!.i]!), pos(mol.atomos[ic]!), pos(mol.atomos[vs[1]!.i]!));
      expect(Math.abs(med - exp), n).toBeLessThan(4);
      return { caso: `${n}: ángulo ${a}–${c}–${b}`, referencia: exp, calculado: Number(med.toFixed(2)), unidad: '°', fuente: 'Experimental (Chang/Brown) vs conformero de PubChem' };
    });
    registrarValidacion(12, 'Ángulos de enlace en los conformeros 3D', filas);
  });

  it('detecta los hipervalentes, cuyo conformero de PubChem no es fiable (SF₄ sale tetraédrico)', () => {
    expect(esHipervalente(molDe('tetrafluoruro de azufre'))).toBe(true);
    expect(esHipervalente(molDe('agua'))).toBe(false);
    expect(esHipervalente(molDe('ácido sulfúrico'))).toBe(false); // S con 4 dominios (2 S=O)
  });
});

describe('análisis por átomo e hibridación', () => {
  const hib = (n: string, simbolo: string) => {
    const mol = molDe(n);
    return analizarAtomo(mol, mol.atomos.findIndex((a) => a.simbolo === simbolo));
  };
  it('asigna la hibridación de libro', () => {
    expect(hib('metano', 'C').hibridacion).toBe('sp³');
    expect(hib('eteno (etileno)', 'C').hibridacion).toBe('sp²');
    expect(hib('etino (acetileno)', 'C').hibridacion).toBe('sp');
    expect(hib('benceno', 'C').hibridacion).toBe('sp²');
    expect(hib('dióxido de carbono', 'C').hibridacion).toBe('sp');
    expect(hib('agua', 'O').notacion).toBe('AX2E2');
    expect(hib('amoníaco', 'N').notacion).toBe('AX3E');
    expect(hib('trifluoruro de boro', 'B').geometriaMolecular).toBe('trigonal plana');
  });
  it('marca la posible conjugación del N de una amida', () => {
    expect(hib('etanamida (acetamida)', 'N').conjugado).toBe(true);
    expect(hib('metilamina', 'N').conjugado).toBe(false);
  });
});

describe('polaridad y fuerzas intermoleculares', () => {
  const apolares = ['metano', 'dióxido de carbono', 'tetraclorometano', 'benceno', 'hexano', 'ciclohexano', 'eteno (etileno)', 'etino (acetileno)', 'cloro (Cl2)', 'nitrógeno (N2)', 'p-xileno', 'naftaleno', 'tetrafluoroeteno', 'trióxido de azufre', 'tetracloruro de silicio', 'tolueno (metilbenceno)'];
  const polares = ['agua', 'amoníaco', 'cloruro de hidrógeno', 'clorometano', 'diclorometano', 'triclorometano (cloroformo)', 'propanona (acetona)', 'etanol', 'metanol', 'metoximetano (éter dimetílico)', 'dióxido de azufre', 'sulfuro de hidrógeno', 'cianuro de hidrógeno', 'etanonitrilo (acetonitrilo)', 'ácido etanoico (acético)', 'etanoato de etilo (acetato de etilo)', 'fosgeno', 'monóxido de carbono', 'piridina'];
  it.each(apolares)('%s es apolar', (n) => expect(esPolar(molDe(n)).polar).toBe(false));
  it.each(polares)('%s es polar', (n) => expect(esPolar(molDe(n)).polar).toBe(true));

  it('coincide con el signo de los momentos dipolares experimentales', () => {
    // El tolueno (μ = 0,38 D, solo enlaces C–H y C–C) se trata en los textos como prácticamente apolar
    const PRACTICAMENTE_APOLARES = new Set(['tolueno (metilbenceno)']);
    for (const [n, mu] of Object.entries(dipolos.valores)) {
      if (porNombre(n).tiene3D === false || PRACTICAMENTE_APOLARES.has(n)) continue;
      expect(esPolar(molDe(n)).polar, n).toBe(mu > 0);
    }
  });

  it('identifica los puentes de hidrógeno', () => {
    const ph = (n: string) => fuerzasIntermoleculares(molDe(n)).puenteHidrogeno;
    for (const n of ['agua', 'etanol', 'amoníaco', 'fluoruro de hidrógeno', 'ácido etanoico (acético)', 'metilamina', 'propano-1,2,3-triol (glicerol)']) expect(ph(n), n).toBe(true);
    for (const n of ['metano', 'propanona (acetona)', 'metoximetano (éter dimetílico)', 'triclorometano (cloroformo)', 'trimetilamina']) expect(ph(n), n).toBe(false);
    expect(fuerzasIntermoleculares(molDe('propanona (acetona)')).aceptaPuenteH).toBe(true);
  });

  it('los iones tienen interacción ion-dipolo', () => {
    expect(fuerzasIntermoleculares(molDe('ion nitrato')).esIon).toBe(true);
  });
});

describe('puntos de ebullición (PubChem)', () => {
  // Valores de libro (°C, 1 atm) para contrastar con lo descargado de PubChem
  const libro: [string, number][] = [
    ['agua', 100],
    ['etanol', 78.3],
    ['metanol', 64.7],
    ['benceno', 80.1],
    ['etoxietano (éter dietílico)', 34.6],
    ['hexano', 68.7],
    ['tetraclorometano', 76.7],
    ['propanona (acetona)', 56.1],
    ['amoníaco', -33.3],
    ['metano', -161.5],
  ];
  it('coinciden con los valores de libro (error < 1 °C)', () => {
    const filas = libro.map(([n, v]) => {
      const pe = porNombre(n).puntoEbullicion!;
      expect(Math.abs(pe.valor - v), n).toBeLessThan(1);
      return { caso: n, referencia: v, calculado: pe.valor, unidad: '°C', fuente: 'Valor de libro vs PubChem' };
    });
    registrarValidacion(13, 'Puntos de ebullición del catálogo (PubChem)', filas);
  });

  it('no hay valores imposibles (todas las ebulliciones por encima de −273 °C)', () => {
    for (const m of M) if (m.puntoEbullicion) expect(m.puntoEbullicion.valor, m.nombre).toBeGreaterThan(-273.15);
  });

  it('la tendencia de los alcanos lineales crece con la cadena', () => {
    const alcanos = ['metano', 'etano', 'propano', 'butano', 'pentano', 'hexano', 'heptano', 'octano', 'nonano', 'decano'].map((n) => porNombre(n).puntoEbullicion!.valor);
    for (let i = 1; i < alcanos.length; i++) expect(alcanos[i]).toBeGreaterThan(alcanos[i - 1]!);
  });
});
