import { describe, expect, it } from 'vitest';
import { convertir, formulaEmpirica, formulaMolecular, masaPura, porcentajeRendimiento, reactivoLimitante } from '../stoichiometry';
import { balancear, parsearEcuacion } from '../balance';
import { masaMolar } from '../formula';
import { clasificarReaccion } from '../reacciones';
import { errorPorcentual, registrarValidacion } from './validacion';

describe('conversiones', () => {
  it('mol ↔ masa ↔ volumen ↔ partículas', () => {
    const c = convertir('H2O', 36.03, 'g');
    expect(c.moles).toBeCloseTo(2, 3);
    expect(c.particulas).toBeCloseTo(1.2044e24, -20);
    expect(convertir('CO2', 2, 'mol').volumenCN).toBeCloseTo(44.8, 6);
    expect(convertir('O2', 11.2, 'L').masa).toBeCloseTo(15.999, 3);
    expect(convertir('NaCl', 6.02214076e23, 'particulas').moles).toBeCloseTo(1, 10);
    expect(() => convertir('H2O', -1, 'g')).toThrow();
  });
});

describe('reactivo limitante y rendimiento (ejercicios de Chang)', () => {
  it('2 H₂ + O₂ → 2 H₂O con 4 mol de H₂ y 1 mol de O₂', () => {
    const r = reactivoLimitante(balancear('H2 + O2 -> H2O'), [4, 1]);
    expect(r.limitante).toBe(1);
    expect(r.productos[0]).toBeCloseTo(2, 10);
    expect(r.exceso[0]).toBeCloseTo(2, 10);
  });

  it('urea: 637,2 g de NH₃ y 1142 g de CO₂ → 1,124 × 10³ g de (NH₂)₂CO', () => {
    const ec = balancear('NH3 + CO2 -> CO(NH2)2 + H2O');
    const r = reactivoLimitante(ec, [637.2 / masaMolar('NH3'), 1142 / masaMolar('CO2')]);
    expect(ec.reactivos[r.limitante]!.texto).toBe('NH3');
    const urea = r.productos[0]! * masaMolar('CO(NH2)2');
    expect(errorPorcentual(1124, urea)).toBeLessThan(0.2);
  });

  it('titanio: 3,54 × 10⁷ g de TiCl₄ y 1,13 × 10⁷ g de Mg; real 7,91 × 10⁶ g → 88,4 %', () => {
    const ec = balancear('TiCl4 + Mg -> Ti + MgCl2');
    const r = reactivoLimitante(ec, [3.54e7 / masaMolar('TiCl4'), 1.13e7 / masaMolar('Mg')]);
    expect(ec.reactivos[r.limitante]!.texto).toBe('TiCl4');
    const teorico = r.productos[0]! * masaMolar('Ti');
    expect(errorPorcentual(8.95e6, teorico)).toBeLessThan(0.5);
    const rend = porcentajeRendimiento(7.91e6, teorico);
    expect(Math.abs(rend - 88.4)).toBeLessThan(0.5);
    const ureaMol = reactivoLimitante(balancear('NH3 + CO2 -> CO(NH2)2 + H2O'), [637.2 / masaMolar('NH3'), 1142 / masaMolar('CO2')]).productos[0]!;
    registrarValidacion(16, 'Estequiometría (ejercicios de Chang)', [
      { caso: 'Urea a partir de 637,2 g NH₃ + 1142 g CO₂', referencia: 1124, calculado: Number((ureaMol * masaMolar('CO(NH2)2')).toFixed(1)), unidad: 'g', fuente: 'Chang, Química (reactivo limitante)' },
      { caso: 'Ti teórico (TiCl₄ + 2 Mg)', referencia: 8.95e6, calculado: teorico, unidad: 'g', fuente: 'Chang, Química (rendimiento)' },
      { caso: '% de rendimiento del Ti', referencia: 88.4, calculado: Number(rend.toFixed(2)), unidad: '%', fuente: 'Chang, Química' },
    ]);
  });

  it('pureza', () => expect(masaPura(200, 80)).toBe(160));
});

describe('fórmulas empírica y molecular', () => {
  it.each([
    [{ C: 40.0, H: 6.71, O: 53.3 }, 'CH2O'],
    [{ C: 40.92, H: 4.58, O: 54.5 }, 'C3H4O3'], // ácido ascórbico (Chang)
    [{ Fe: 69.94, O: 30.06 }, 'Fe2O3'],
    [{ K: 24.75, Mn: 34.77, O: 40.51 }, 'KMnO4'],
    [{ C: 85.63, H: 14.37 }, 'CH2'],
    [{ Na: 32.39, S: 22.59, O: 45.02 }, 'Na2O4S'],
  ] as const)('%j → %s', (comp, esperado) => {
    expect(formulaEmpirica({ ...comp }).formula).toBe(esperado);
  });

  it('molecular: CH₂O con M = 180 g/mol → C₆H₁₂O₆', () => {
    expect(formulaMolecular('CH2O', 180).formula).toBe('C6H12O6');
    expect(formulaMolecular('C3H4O3', 176.12).formula).toBe('C6H8O6');
  });
});

describe('clasificación de reacciones', () => {
  const tipos = (ec: string) => clasificarReaccion(parsearEcuacion(ec)).tipos;
  it('reconoce los tipos de libro', () => {
    expect(tipos('H2 + O2 -> H2O')).toEqual(expect.arrayContaining(['sintesis', 'redox']));
    expect(tipos('CaCO3 -> CaO + CO2')).toEqual(['descomposicion']);
    expect(tipos('Zn + CuSO4 -> ZnSO4 + Cu')).toEqual(expect.arrayContaining(['desplazamiento-simple', 'redox']));
    expect(tipos('AgNO3 + NaCl -> AgCl + NaNO3')).toEqual(['doble-desplazamiento']);
    expect(tipos('CH4 + O2 -> CO2 + H2O')).toEqual(expect.arrayContaining(['combustion', 'redox']));
    expect(tipos('HCl + NaOH -> NaCl + H2O')).toEqual(['neutralizacion']);
    expect(tipos('H2SO4 + Ca(OH)2 -> CaSO4 + H2O')).toContain('neutralizacion');
  });
});
