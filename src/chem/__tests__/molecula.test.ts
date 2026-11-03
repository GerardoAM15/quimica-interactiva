import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { angulo, diedro, distancia, escribirMolfile, formulaDeMolecula, parsearMolfile, pos, type Molecula } from '../molecula';
import { esHipervalente, generarCoordenadas3D, geometriaEstrella, longitudEnlace } from '../coordenadas3d';
import { analizarAtomo } from '../vsepr';

const AGUA = `962
  -OEChem-11022618343D

  3  2  0     0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.2774    0.8929    0.2544 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.6068   -0.2383   -0.7169 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`;

/** Construye una molécula 2D a partir de una lista compacta de átomos y enlaces. */
function mol2D(atomos: [string, number, number][], enlaces: [number, number, 1 | 2 | 3][], cargas: Record<number, number> = {}): Molecula {
  return {
    atomos: atomos.map(([simbolo, x, y], i) => ({ simbolo, x, y, z: 0, carga: cargas[i] ?? 0 })),
    enlaces: enlaces.map(([a, b, orden]) => ({ a, b, orden })),
    es3D: false,
  };
}

describe('molfile V2000', () => {
  it('lee el agua de PubChem', () => {
    const m = parsearMolfile(AGUA);
    expect(m.atomos.map((a) => a.simbolo)).toEqual(['O', 'H', 'H']);
    expect(m.enlaces).toHaveLength(2);
    expect(m.es3D).toBe(true);
    expect(formulaDeMolecula(m)).toBe('H2O');
    expect(angulo(pos(m.atomos[1]!), pos(m.atomos[0]!), pos(m.atomos[2]!))).toBeGreaterThan(100);
  });

  it('lee cargas formales de las líneas M  CHG (ion nitrato)', () => {
    const nitrato = parsearMolfile(readFileSync('public/moleculas/943.sdf', 'utf8'));
    expect(formulaDeMolecula(nitrato)).toBe('NO3-');
    expect(nitrato.atomos.reduce((s, a) => s + a.carga, 0)).toBe(-1);
  });

  it('escribe y vuelve a leer sin perder información', () => {
    const m = mol2D([['N', 0, 0], ['H', 1, 0], ['H', -0.5, 0.8], ['H', -0.5, -0.8], ['H', 0, 0]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], { 0: 1 });
    const r = parsearMolfile(escribirMolfile(m));
    expect(formulaDeMolecula(r)).toBe('H4N+');
    expect(r.enlaces.map((e) => [e.a, e.b, e.orden])).toEqual(m.enlaces.map((e) => [e.a, e.b, e.orden]));
  });

  it('calcula distancias, ángulos y diedros', () => {
    expect(distancia([0, 0, 0], [3, 4, 0])).toBe(5);
    expect(angulo([1, 0, 0], [0, 0, 0], [0, 1, 0])).toBeCloseTo(90, 10);
    expect(diedro([1, 0, 0], [0, 0, 0], [0, 0, 1], [1, 0, 1])).toBeCloseTo(0, 10);
    expect(Math.abs(diedro([1, 0, 0], [0, 0, 0], [0, 0, 1], [-1, 0, 1]))).toBeCloseTo(180, 10);
    expect(diedro([1, 0, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1])).toBeCloseTo(90, 10);
  });
});

describe('coordenadas 3D aproximadas', () => {
  it('metano desde un dibujo plano: tetraedro de 109,5°', () => {
    const plano = mol2D([['C', 0, 0], ['H', 1, 0], ['H', 0, 1], ['H', -1, 0], ['H', 0, -1]], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]);
    const m = generarCoordenadas3D(plano);
    const C = pos(m.atomos[0]!);
    for (let i = 1; i <= 4; i++) {
      expect(distancia(C, pos(m.atomos[i]!))).toBeCloseTo(longitudEnlace('C', 'H'), 1);
      for (let j = i + 1; j <= 4; j++) expect(angulo(pos(m.atomos[i]!), C, pos(m.atomos[j]!))).toBeCloseTo(109.47, -0.5);
    }
  });

  it('eteno: plano, C=C más corto que C–C y ángulos de 120°', () => {
    const eteno = mol2D(
      [['C', 0, 0], ['C', 1.3, 0], ['H', -0.7, 1.2], ['H', -0.7, -1.2], ['H', 2, 1.2], ['H', 2, -1.2]],
      [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
    );
    const m = generarCoordenadas3D(eteno);
    const P = m.atomos.map(pos);
    expect(distancia(P[0]!, P[1]!)).toBeCloseTo(longitudEnlace('C', 'C', 2), 1);
    expect(angulo(P[2]!, P[0]!, P[3]!)).toBeCloseTo(120, -0.5);
    // Todos los átomos en el plano: diedro H–C=C–H ≈ 0° (cis) o 180° (trans)
    expect(Math.abs(diedro(P[2]!, P[0]!, P[1]!, P[4]!))).toBeLessThan(10);
    expect(Math.abs(diedro(P[2]!, P[0]!, P[1]!, P[5]!))).toBeGreaterThan(170);
  });

  it('conserva la configuración cis/trans del dibujo (but-2-eno con sus H)', () => {
    // C0=C1; metilos C2 (sobre C0) y C3 (sobre C1); H4 en C0, H5 en C1; 3 H en cada metilo
    const butenoEn = (yMetilo2: number): Molecula =>
      mol2D(
        [
          ['C', 0, 0], ['C', 1.3, 0], ['C', -0.7, 1.2], ['C', 2, yMetilo2], ['H', -0.7, -1.2], ['H', 2, -yMetilo2],
          ['H', -1.8, 1.2], ['H', -0.3, 2.2], ['H', -0.9, 2.1], ['H', 3.1, yMetilo2], ['H', 1.6, 2.2 * Math.sign(yMetilo2)], ['H', 2.2, 2.1 * Math.sign(yMetilo2)],
        ],
        [[0, 1, 2], [0, 2, 1], [1, 3, 1], [0, 4, 1], [1, 5, 1], [2, 6, 1], [2, 7, 1], [2, 8, 1], [3, 9, 1], [3, 10, 1], [3, 11, 1]],
      );
    const cis = butenoEn(1.2);
    const trans = butenoEn(-1.2);
    // Diedro C–C=C–C: ≈ 0° en el cis y ≈ 180° en el trans
    const diedroCentral = (m: Molecula) => {
      const P = generarCoordenadas3D(m).atomos.map(pos);
      return Math.abs(diedro(P[2]!, P[0]!, P[1]!, P[3]!));
    };
    expect(diedroCentral(cis)).toBeLessThan(15);
    expect(diedroCentral(trans)).toBeGreaterThan(165);
  });

  it('SF4 (hipervalente): geometría VSEPR de balancín', () => {
    const sf4 = parsearMolfile(readFileSync('public/moleculas/24555.sdf', 'utf8'));
    expect(esHipervalente(sf4)).toBe(true);
    const m = geometriaEstrella(sf4)!;
    const P = m.atomos.map(pos);
    const angulos = [];
    for (let i = 1; i < 5; i++) for (let j = i + 1; j < 5; j++) angulos.push(Math.round(angulo(P[i]!, P[0]!, P[j]!)));
    expect(angulos.sort((a, b) => a - b)).toEqual([90, 90, 90, 90, 120, 180]);
  });

  it('SF6: octaedro', () => {
    const sf6 = mol2D([['S', 0, 0], ...Array.from({ length: 6 }, (_, i) => ['F', Math.cos(i), Math.sin(i)] as [string, number, number])], Array.from({ length: 6 }, (_, i) => [0, i + 1, 1] as [number, number, 1]));
    const m = generarCoordenadas3D(sf6);
    const P = m.atomos.map(pos);
    const angulos = new Set<number>();
    for (let i = 1; i < 7; i++) for (let j = i + 1; j < 7; j++) angulos.add(Math.round(angulo(P[i]!, P[0]!, P[j]!)));
    expect([...angulos].sort()).toEqual([180, 90]);
  });

  it('análisis por átomo: pares libres, dominios e hibridación', () => {
    const agua = parsearMolfile(AGUA);
    const o = analizarAtomo(agua, 0);
    expect(o.paresLibres).toBe(2);
    expect(o.notacion).toBe('AX2E2');
    expect(o.hibridacion).toBe('sp³');
    expect(o.geometriaMolecular).toBe('angular');
  });
});
