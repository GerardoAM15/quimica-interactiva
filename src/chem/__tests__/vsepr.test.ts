import { describe, expect, it } from 'vitest';
import { analizarVSEPR, ErrorVSEPR } from '../vsepr';
import { registrarValidacion } from './validacion';

/**
 * Moléculas e iones de libro (Chang, Química, cap. 10; Brown, Química, cap. 9).
 * [fórmula, notación, geometría molecular, hibridación, ángulos ideales, polar, ángulo experimental (°) o null]
 */
const CASOS: [string, string, string, string, number[], boolean, number | null][] = [
  ['BeCl2', 'AX2', 'lineal', 'sp', [180], false, 180],
  ['CO2', 'AX2', 'lineal', 'sp', [180], false, 180],
  ['HCN', 'AX2', 'lineal', 'sp', [180], true, 180],
  ['BF3', 'AX3', 'trigonal plana', 'sp²', [120], false, 120],
  ['SO3', 'AX3', 'trigonal plana', 'sp²', [120], false, 120],
  ['CO3^2-', 'AX3', 'trigonal plana', 'sp²', [120], false, 120],
  ['NO3-', 'AX3', 'trigonal plana', 'sp²', [120], false, 120],
  ['CH2O', 'AX3', 'trigonal plana', 'sp²', [120], true, null],
  ['COCl2', 'AX3', 'trigonal plana', 'sp²', [120], true, null],
  ['SO2', 'AX2E', 'angular', 'sp²', [120], true, 119],
  ['O3', 'AX2E', 'angular', 'sp²', [120], true, 117],
  ['NO2-', 'AX2E', 'angular', 'sp²', [120], true, 115],
  ['SnCl2', 'AX2E', 'angular', 'sp²', [120], true, null],
  ['CH4', 'AX4', 'tetraédrica', 'sp³', [109.5], false, 109.5],
  ['CCl4', 'AX4', 'tetraédrica', 'sp³', [109.5], false, 109.5],
  ['NH4+', 'AX4', 'tetraédrica', 'sp³', [109.5], false, 109.5],
  ['SO4^2-', 'AX4', 'tetraédrica', 'sp³', [109.5], false, 109.5],
  ['CH2Cl2', 'AX4', 'tetraédrica', 'sp³', [109.5], true, null],
  ['POCl3', 'AX4', 'tetraédrica', 'sp³', [109.5], true, null],
  ['NH3', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, 107],
  ['H3O+', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, null],
  ['PCl3', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, 100],
  ['NF3', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, 102],
  ['ClO3-', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, null],
  ['XeO3', 'AX3E', 'piramidal trigonal', 'sp³', [109.5], true, null],
  ['H2O', 'AX2E2', 'angular', 'sp³', [109.5], true, 104.5],
  ['H2S', 'AX2E2', 'angular', 'sp³', [109.5], true, 92],
  ['OF2', 'AX2E2', 'angular', 'sp³', [109.5], true, 103],
  ['PCl5', 'AX5', 'bipiramidal trigonal', 'sp³d', [90, 120, 180], false, null],
  ['SF4', 'AX4E', 'balancín (tetraedro distorsionado)', 'sp³d', [90, 120, 180], true, null],
  ['ClF3', 'AX3E2', 'forma de T', 'sp³d', [90, 180], true, null],
  ['XeF2', 'AX2E3', 'lineal', 'sp³d', [180], false, 180],
  ['I3-', 'AX2E3', 'lineal', 'sp³d', [180], false, 180],
  ['SF6', 'AX6', 'octaédrica', 'sp³d²', [90, 180], false, 90],
  ['BrF5', 'AX5E', 'piramidal cuadrada', 'sp³d²', [90, 180], true, null],
  ['IF5', 'AX5E', 'piramidal cuadrada', 'sp³d²', [90, 180], true, null],
  ['XeF4', 'AX4E2', 'cuadrada plana', 'sp³d²', [90, 180], false, 90],
  ['ICl4-', 'AX4E2', 'cuadrada plana', 'sp³d²', [90, 180], false, 90],
  ['H2SO4', 'AX4', 'tetraédrica', 'sp³', [109.5], true, null],
  ['HNO3', 'AX3', 'trigonal plana', 'sp²', [120], true, null],
  ['H3PO4', 'AX4', 'tetraédrica', 'sp³', [109.5], true, null],
  ['HClO', 'AX2E2', 'angular', 'sp³', [109.5], true, null],
  ['N3-', 'AX2', 'lineal', 'sp', [180], false, 180],
];

describe('VSEPR: moléculas e iones de libro', () => {
  it(`hay al menos 25 casos (hay ${CASOS.length})`, () => expect(CASOS.length).toBeGreaterThanOrEqual(25));

  it.each(CASOS)('%s → %s, %s, %s', (formula, notacion, geometria, hib, angulos, polar) => {
    const r = analizarVSEPR(formula);
    expect(r.notacion).toBe(notacion);
    expect(r.geometriaMolecular).toBe(geometria);
    expect(r.hibridacion).toBe(hib);
    expect(r.angulos).toEqual(angulos);
    expect(r.polar, `polaridad de ${formula}`).toBe(polar);
  });

  it('genera la tabla de validación', () => {
    const filas = CASOS.filter((c) => c[6] !== null).map(([f, , g, , ang, , exp]) => ({
      caso: `${f}: ${g}`,
      referencia: exp!,
      calculado: ang[0]!,
      unidad: '° (ideal VSEPR)',
      fuente: 'Chang / Brown (ángulo experimental)',
    }));
    registrarValidacion(11, 'VSEPR: ángulo ideal vs experimental', filas, `${CASOS.length} moléculas e iones verificados en notación, geometría, hibridación y polaridad. Los pares libres reducen el ángulo real respecto del ideal (p. ej. H₂O 104,5° frente a 109,5°).`);
  });
});

describe('VSEPR: casos especiales', () => {
  it('trata los radicales redondeando hacia arriba', () => {
    const no2 = analizarVSEPR('NO2');
    expect(no2.radical).toBe(true);
    expect(no2.dominios).toBe(3);
    expect(no2.geometriaMolecular).toBe('angular');
    expect(analizarVSEPR('ClO2').notacion).toBe('AX2E2');
  });

  it('los oxoácidos llevan los H sobre los oxígenos', () => {
    const r = analizarVSEPR('H2SO4');
    expect(r.central).toBe('S');
    expect(r.ligandos.filter((l) => l.esOH)).toHaveLength(2);
    expect(r.electronesConteo).toBe(8);
  });

  it('en la bipirámide los pares libres son ecuatoriales y en el octaedro opuestos', () => {
    const sf4 = analizarVSEPR('SF4');
    expect(Math.abs(sf4.posiciones.paresLibres[0]![2])).toBeLessThan(1e-9); // ecuatorial
    const xef4 = analizarVSEPR('XeF4');
    const [a, b] = xef4.posiciones.paresLibres;
    expect(a![0] * b![0] + a![1] * b![1] + a![2] * b![2]).toBeCloseTo(-1, 10); // trans
  });

  it('rechaza especies sin un único átomo central', () => {
    expect(() => analizarVSEPR('N2O')).toThrow(ErrorVSEPR);
    expect(() => analizarVSEPR('H2O2')).toThrow(ErrorVSEPR);
    expect(() => analizarVSEPR('HCl')).toThrow(ErrorVSEPR);
    expect(() => analizarVSEPR('CuCl4^2-')).toThrow(ErrorVSEPR);
  });

  it('explica el procedimiento paso a paso', () => {
    const r = analizarVSEPR('NH3');
    expect(r.pasos.join(' ')).toMatch(/Dominios = 8\/2 = 4/);
    expect(r.razonPolaridad).toMatch(/pares libres/);
  });
});
