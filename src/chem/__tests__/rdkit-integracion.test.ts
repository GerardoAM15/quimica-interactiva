import { beforeAll, describe, expect, it } from 'vitest';
import iniciarRDKit from '@rdkit/rdkit';
import { analizarEstructura, esqueleto2D, type RDKit } from '@/lib/rdkit';
import { generarCoordenadas3D, longitudEnlace } from '../coordenadas3d';
import { distancia, escribirMolfile, formulaDeMolecula, pos, vecindario, type Vec3 } from '../molecula';
import { analizarAtomo } from '../vsepr';
import { masaMolar } from '../formula';

let R: RDKit;
beforeAll(async () => {
  R = (await iniciarRDKit()) as RDKit;
  R.prefer_coordgen(true);
}, 60000);

const CASOS: [string, string, string][] = [
  ['CCO', 'C2H6O', 'etanol'],
  ['CC(=O)O', 'C2H4O2', 'ácido acético'],
  ['c1ccccc1', 'C6H6', 'benceno'],
  ['C1CCCCC1', 'C6H12', 'ciclohexano'],
  ['NCC(=O)O', 'C2H5NO2', 'glicina'],
  ['CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'C8H10N4O2', 'cafeína'],
  ['C#N', 'CHN', 'cianuro de hidrógeno'],
  ['[NH4+]', 'H4N+', 'amonio'],
];

describe('RDKit + geometría 3D aproximada', () => {
  it.each(CASOS)('%s → %s (%s)', (smiles, formula) => {
    const r = analizarEstructura(R, smiles);
    expect(formulaDeMolecula(r.molecula)).toBe(formula);
    expect(r.masaMolar).toBeCloseTo(masaMolar(formula.replace(/[+-]$/, '')), 1);
    const m = generarCoordenadas3D(r.molecula);
    const P = m.atomos.map(pos);
    // Enlaces con longitud razonable (±12 %)
    for (const e of m.enlaces) {
      const ideal = longitudEnlace(m.atomos[e.a]!.simbolo, m.atomos[e.b]!.simbolo, e.orden);
      expect(Math.abs(distancia(P[e.a]!, P[e.b]!) - ideal) / ideal).toBeLessThan(0.12);
    }
    // Sin choques: átomos no enlazados a más de 1,0 Å
    const vec = vecindario(m);
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        if (vec[i]!.some((x) => x.i === j)) continue;
        expect(distancia(P[i]!, P[j]!), `${m.atomos[i]!.simbolo}${i}–${m.atomos[j]!.simbolo}${j}`).toBeGreaterThan(1.0);
      }
    }
  });

  it('el benceno generado es plano', () => {
    const m = generarCoordenadas3D(analizarEstructura(R, 'c1ccccc1').molecula);
    const C = m.atomos.map((a, i) => ({ a, i })).filter(({ a }) => a.simbolo === 'C').map(({ i }) => pos(m.atomos[i]!));
    // Distancia de cada C al plano de los tres primeros
    const [a, b, c] = C as [Vec3, Vec3, Vec3];
    const u = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!], v = [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!];
    const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
    const L = Math.hypot(...n);
    for (const p of C) expect(Math.abs(((p[0]! - a[0]!) * n[0]! + (p[1]! - a[1]!) * n[1]! + (p[2]! - a[2]!) * n[2]!) / L)).toBeLessThan(0.15);
  });

  it('los carbonos del ácido acético: sp³ (CH₃) y sp² (COOH)', () => {
    const m = analizarEstructura(R, 'CC(=O)O').molecula;
    const hib = m.atomos.map((a, i) => (a.simbolo === 'C' ? analizarAtomo(m, i).hibridacion : null)).filter(Boolean).sort();
    expect(hib).toEqual(['sp²', 'sp³']);
  });

  it('traduce el error de valencia al español', () => {
    expect(() => analizarEstructura(R, 'CC(C)(C)(C)C')).toThrow(/tiene 5 enlaces, más de los que permite su valencia/);
  });

  it('acepta molfiles con título vacío (los que genera el constructor)', () => {
    const mf = escribirMolfile({ atomos: [{ simbolo: 'C', carga: 0, x: 0, y: 0, z: 0 }, { simbolo: 'O', carga: 0, x: 1.5, y: 0, z: 0 }], enlaces: [{ a: 0, b: 1, orden: 1 }], es3D: false });
    expect(formulaDeMolecula(analizarEstructura(R, mf).molecula)).toBe('CH4O');
  });

  it('el esqueleto para el editor no tiene H explícitos', () => {
    const m = esqueleto2D(R, 'CCO');
    expect(m.atomos.map((a) => a.simbolo)).toEqual(['C', 'C', 'O']);
  });
});
