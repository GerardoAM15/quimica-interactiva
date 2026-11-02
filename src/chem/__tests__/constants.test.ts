import { describe, expect, it } from 'vitest';
import { c, e, F, h, HC_EV_NM, kB, NA, R, R_H, R_LATM, Rinf, RYDBERG_EV, VM_CN, FUENTE_CONSTANTES, TABLA_CONSTANTES } from '../constants';
import { registrarValidacion } from './validacion';

describe('constantes CODATA', () => {
  it('usa la edición CODATA 2018 o posterior (SI redefinido)', () => {
    expect(Number(FUENTE_CONSTANTES.edicion)).toBeGreaterThanOrEqual(2018);
  });

  it('las constantes que definen el SI son exactas', () => {
    expect(h).toBe(6.62607015e-34);
    expect(e).toBe(1.602176634e-19);
    expect(NA).toBe(6.02214076e23);
    expect(kB).toBe(1.380649e-23);
    expect(c).toBe(299792458);
    for (const k of ['h', 'e', 'NA', 'kB', 'c'] as const) expect(TABLA_CONSTANTES[k].exacta).toBe(true);
  });

  it('R = N_A·k_B y F = N_A·e', () => {
    expect(R).toBeCloseTo(NA * kB, 8);
    expect(F).toBeCloseTo(NA * e, 4);
  });

  it('valores derivados conocidos', () => {
    expect(R_LATM).toBeCloseTo(0.082057, 6); // L·atm/(mol·K)
    expect(VM_CN * 1000).toBeCloseTo(22.414, 3); // L/mol a 0 °C y 1 atm
    expect(RYDBERG_EV).toBeCloseTo(13.6057, 4);
    expect(HC_EV_NM).toBeCloseTo(1239.84, 2);
    // R_H = R∞/(1 + mₑ/mₚ) ≈ 1,09678 × 10⁷ m⁻¹
    expect(R_H / 1e7).toBeCloseTo(1.096776, 6);
    expect(R_H).toBeLessThan(Rinf);

    registrarValidacion(1, 'Constantes derivadas', [
      { caso: 'R en L·atm/(mol·K)', referencia: 0.082057366, calculado: R_LATM, fuente: 'CODATA (R / 101325 Pa · 1000)' },
      { caso: 'Volumen molar a CN', referencia: 22.41396954, calculado: VM_CN * 1000, unidad: 'L/mol', fuente: 'CODATA' },
      { caso: 'R∞·h·c', referencia: TABLA_CONSTANTES.RinfHcEV.valor, calculado: RYDBERG_EV, unidad: 'eV', fuente: 'CODATA' },
      { caso: 'F = N_A·e', referencia: F, calculado: NA * e, unidad: 'C/mol', fuente: 'CODATA' },
    ]);
  });
});
