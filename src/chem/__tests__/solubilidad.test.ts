import { describe, expect, it } from 'vitest';
import { ANIONES, CATIONES, formulaCompuesto, identificarSal, ladoMhchem, predecirPrecipitado, solubilidad, tablaSolubilidad, type Solubilidad } from '../solubilidad';
import { masaMolar } from '../formula';
import { registrarValidacion } from './validacion';

const sol = (formula: string) => {
  const s = identificarSal(formula);
  if (!s) throw new Error(`no identificada: ${formula}`);
  return solubilidad(s.cation, s.anion);
};

/** Casos de las reglas de solubilidad (Chang tabla 4.2, Brown tabla 4.1). */
const CASOS: [string, Solubilidad][] = [
  ['AgCl', 'insoluble'],
  ['AgBr', 'insoluble'],
  ['AgI', 'insoluble'],
  ['NaNO3', 'soluble'],
  ['KNO3', 'soluble'],
  ['AgNO3', 'soluble'],
  ['Pb(NO3)2', 'soluble'],
  ['BaSO4', 'insoluble'],
  ['PbSO4', 'insoluble'],
  ['SrSO4', 'insoluble'],
  ['CaSO4', 'poco'],
  ['Na2SO4', 'soluble'],
  ['CuSO4', 'soluble'],
  ['NaCl', 'soluble'],
  ['KI', 'soluble'],
  ['PbI2', 'insoluble'],
  ['PbCl2', 'poco'],
  ['CaCO3', 'insoluble'],
  ['Na2CO3', 'soluble'],
  ['(NH4)2CO3', 'soluble'],
  ['Ca3(PO4)2', 'insoluble'],
  ['K3PO4', 'soluble'],
  ['Mg(OH)2', 'insoluble'],
  ['Fe(OH)3', 'insoluble'],
  ['Cu(OH)2', 'insoluble'],
  ['NaOH', 'soluble'],
  ['Ba(OH)2', 'soluble'],
  ['Ca(OH)2', 'poco'],
  ['CuS', 'insoluble'],
  ['PbS', 'insoluble'],
  ['Na2S', 'soluble'],
  ['ZnS', 'insoluble'],
  ['PbCrO4', 'insoluble'],
  ['K2CrO4', 'soluble'],
  ['Ca(CH3COO)2', 'soluble'],
  ['Al2S3', 'reacciona'],
  ['FeCl3', 'soluble'],
  ['ZnCl2', 'soluble'],
];

describe(`tabla de solubilidad (${CASOS.length} casos)`, () => {
  it.each(CASOS)('%s es %s', (f, esperado) => expect(sol(f).solubilidad).toBe(esperado));

  it('fórmulas, colores y Ksp', () => {
    const fe = CATIONES.find((c) => c.ion === 'Fe3+')!, so4 = ANIONES.find((a) => a.ion === 'SO4^2-')!;
    expect(formulaCompuesto(fe, so4)).toBe('Fe2(SO4)3');
    expect(sol('Ca(CH3COO)2').formula).toBe('Ca(CH3COO)2');
    expect(sol('AgCl').color).toBe('blanco');
    expect(sol('PbI2').color).toBe('amarillo intenso');
    expect(sol('AgCl').ksp).toBe(1.6e-10);
    expect(sol('NaCl').color).toBeUndefined();
    // Todas las celdas tienen fórmula válida
    for (const fila of tablaSolubilidad()) for (const c of fila) expect(masaMolar(c.formula), c.formula).toBeGreaterThan(0);
    registrarValidacion(
      24,
      'Tabla de solubilidad',
      CASOS.map(([f, e]) => ({ caso: f, referencia: e, calculado: sol(f).solubilidad, fuente: 'Reglas de solubilidad (Chang 4.2, Brown 4.1)' })),
    );
  });
});

describe('precipitación en doble desplazamiento', () => {
  it('AgNO3 + NaCl → AgCl(s): ecuación iónica neta Ag⁺ + Cl⁻ → AgCl', () => {
    const p = predecirPrecipitado('AgNO3', 'NaCl');
    expect(p.hayPrecipitado).toBe(true);
    expect(p.precipitados.map((c) => c.formula)).toEqual(['AgCl']);
    expect(ladoMhchem(p.ionicaNeta![0]!)).toBe('Ag+(aq) + Cl-(aq)');
    expect(ladoMhchem(p.ionicaNeta![1]!)).toBe('AgCl(s)');
  });

  it('Pb(NO3)2 + 2 KI → PbI2(s) + 2 KNO3', () => {
    const p = predecirPrecipitado('Pb(NO3)2', 'KI');
    expect(p.molecular[0]!.map((e) => e.coef)).toEqual([1, 2]);
    expect(ladoMhchem(p.ionicaNeta![0]!)).toBe('Pb^2+(aq) + 2 I-(aq)');
    expect(ladoMhchem(p.ionicaNeta![1]!)).toBe('PbI2(s)');
  });

  it('BaCl2 + Na2SO4 → BaSO4(s); fosfatos con coeficientes', () => {
    expect(ladoMhchem(predecirPrecipitado('BaCl2', 'Na2SO4').ionicaNeta![0]!)).toBe('Ba^2+(aq) + SO4^2-(aq)');
    const f = predecirPrecipitado('CaCl2', 'Na3PO4');
    expect(ladoMhchem(f.ionicaNeta![0]!)).toBe('3 Ca^2+(aq) + 2 PO4^3-(aq)');
    expect(ladoMhchem(f.ionicaNeta![1]!)).toBe('Ca3(PO4)2(s)');
    const h = predecirPrecipitado('FeCl3', 'NaOH');
    expect(ladoMhchem(h.ionicaNeta![0]!)).toBe('Fe^3+(aq) + 3 OH-(aq)');
  });

  it('ion amonio y espectadores', () => {
    const p = predecirPrecipitado('(NH4)2S', 'CuSO4');
    expect(ladoMhchem(p.ionicaNeta![0]!)).toBe('Cu^2+(aq) + S^2-(aq)');
    expect(ladoMhchem(p.ionicaTotal[1]!)).toContain('2 NH4+(aq)');
  });

  it('sin precipitado: NaCl + KNO3', () => {
    const p = predecirPrecipitado('NaCl', 'KNO3');
    expect(p.hayPrecipitado).toBe(false);
    expect(p.ionicaNeta).toBeNull();
    expect(p.explicacion.join(' ')).toMatch(/no hay reacción neta/);
    expect(() => predecirPrecipitado('NaCl', 'C6H12O6')).toThrow();
  });
});
