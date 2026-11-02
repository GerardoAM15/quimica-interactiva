import { describe, expect, it } from 'vitest';
import {
  aMhchem,
  composicionPorcentual,
  ErrorFormula,
  formulaHill,
  masaMolar,
  masaMolarDetallada,
  normalizarTexto,
  parsearFormula,
  totalAtomos,
} from '../formula';
import referencia from './fixtures/masas-pubchem.json';
import { registrarValidacion } from './validacion';

const atomos = (f: string) => Object.fromEntries(parsearFormula(f).atomos);

describe('parser de fórmulas', () => {
  it('lee fórmulas simples y con paréntesis', () => {
    expect(atomos('H2O')).toEqual({ H: 2, O: 1 });
    expect(atomos('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(atomos('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 });
    expect(atomos('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 });
    expect(atomos('Mg3(PO4)2')).toEqual({ Mg: 3, P: 2, O: 8 });
  });

  it('lee corchetes y paréntesis anidados', () => {
    expect(atomos('K4[Fe(CN)6]')).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
    expect(atomos('[Cu(NH3)4]SO4')).toEqual({ Cu: 1, N: 4, H: 12, S: 1, O: 4 });
  });

  it('lee hidratos con ·, * o .', () => {
    const esperado = { Cu: 1, S: 1, O: 9, H: 10 };
    expect(atomos('CuSO4·5H2O')).toEqual(esperado);
    expect(atomos('CuSO4*5H2O')).toEqual(esperado);
    expect(atomos('CuSO4.5H2O')).toEqual(esperado);
    expect(atomos('Na2SO4·10H2O')).toEqual({ Na: 2, S: 1, O: 14, H: 20 });
  });

  it('distingue Co (cobalto) de CO (monóxido de carbono)', () => {
    expect(atomos('Co')).toEqual({ Co: 1 });
    expect(atomos('CO')).toEqual({ C: 1, O: 1 });
    expect(atomos('CoCl2')).toEqual({ Co: 1, Cl: 2 });
  });

  it('lee iones en varias notaciones', () => {
    const carga = (f: string) => parsearFormula(f).carga;
    expect(carga('SO4^2-')).toBe(-2);
    expect(carga('SO4^-2')).toBe(-2);
    expect(carga('SO4{2-}')).toBe(-2);
    expect(carga('NH4^+')).toBe(1);
    expect(carga('NH4+')).toBe(1);
    expect(carga('OH-')).toBe(-1);
    expect(carga('Fe^3+')).toBe(3);
    expect(carga('Fe+3')).toBe(3);
    expect(carga('SO₄²⁻')).toBe(-2);
    expect(carga('Fe⁺³')).toBe(3);
    expect(carga('H2O')).toBe(0);
    expect(atomos('SO₄²⁻')).toEqual({ S: 1, O: 4 });
  });

  it('acepta subíndices Unicode, espacios y el estado físico', () => {
    expect(atomos('H₂SO₄')).toEqual({ H: 2, S: 1, O: 4 });
    expect(atomos(' H2O (l)')).toEqual({ H: 2, O: 1 });
    expect(atomos('NaCl(aq)')).toEqual({ Na: 1, Cl: 1 });
    expect(normalizarTexto('C₆H₁₂O₆')).toBe('C6H12O6');
  });

  it('da errores claros en español', () => {
    const error = (f: string) => {
      try {
        parsearFormula(f);
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorFormula);
        return (e as Error).message;
      }
      return null;
    };
    expect(error('Xy2')).toMatch(/no es el símbolo/);
    expect(error('Ca(OH2')).toMatch(/Falta cerrar/);
    expect(error('CaOH)2')).toMatch(/sin abrir/);
    expect(error('h2o')).toMatch(/mayúscula/);
    expect(error('H0')).toMatch(/no puede ser 0/);
    expect(error('')).toMatch(/Escribe/);
    expect(error('H2O#')).toMatch(/no reconocido/);
  });
});

describe('masa molar y composición', () => {
  it('detalla el cálculo por elemento', () => {
    const { total, pasos } = masaMolarDetallada('H2O');
    expect(pasos.map((p) => [p.simbolo, p.cantidad])).toEqual([['H', 2], ['O', 1]]);
    expect(total).toBeCloseTo(2 * 1.008 + 15.999, 6);
  });

  it('calcula la composición centesimal', () => {
    const comp = Object.fromEntries(composicionPorcentual('H2O').map((c) => [c.simbolo, c.porcentaje]));
    expect(comp.H).toBeCloseTo(11.19, 2);
    expect(comp.O).toBeCloseTo(88.81, 2);
    const suma = composicionPorcentual('C6H12O6').reduce((s, c) => s + c.porcentaje, 0);
    expect(suma).toBeCloseTo(100, 10);
  });

  it('cuenta átomos', () => {
    expect(totalAtomos('C6H12O6')).toBe(24);
    expect(totalAtomos('Ca3(PO4)2')).toBe(13);
  });

  it('genera la fórmula de Hill y la sintaxis de mhchem', () => {
    expect(formulaHill('CH3COOH')).toBe('C2H4O2');
    expect(formulaHill('NaCl')).toBe('ClNa');
    expect(formulaHill('H2SO4')).toBe('H2O4S');
    expect(formulaHill('SO4^2-')).toBe('O4S2-');
    expect(aMhchem('CuSO4·5H2O')).toBe('CuSO4.5H2O');
    expect(aMhchem('Fe+3')).toBe('Fe+3');
    expect(aMhchem('Fe^3+')).toBe('Fe^{3+}');
  });
});

describe('validación contra PubChem', () => {
  const compuestos = referencia.compuestos;

  it(`usa al menos 30 compuestos de referencia (hay ${compuestos.length})`, () => {
    expect(compuestos.length).toBeGreaterThanOrEqual(30);
  });

  it.each(compuestos.map((c) => [c.formula, c] as const))('%s: misma fórmula molecular (Hill) que PubChem', (_, c) => {
    expect(formulaHill(c.formula)).toBe(c.formulaPubChem);
  });

  it('la masa molar difiere de PubChem en menos de 0,01 g/mol', () => {
    const filas = compuestos.map((c) => {
      const calculado = masaMolar(c.formula);
      // PubChem redondea según la precisión de las masas atómicas (p. ej. Pb(NO3)2 = «331»):
      // se compara con la cifra que reporta, con tolerancia de media unidad de su último decimal.
      const decimales = c.masaMolarTexto.split('.')[1]?.length ?? 0;
      const tolerancia = Math.max(0.01, 0.5 * 10 ** -decimales);
      const diferencia = Math.abs(calculado - c.masaMolar);
      expect(diferencia, `${c.formula}: ${calculado} vs ${c.masaMolarTexto}`).toBeLessThan(tolerancia);
      return {
        caso: `${c.formula} (${c.nombre})`,
        referencia: c.masaMolar,
        calculado: Number(calculado.toFixed(decimales + 2)),
        unidad: 'g/mol',
        fuente: `PubChem CID ${c.cid}`,
      };
    });
    const exigentes = compuestos.filter((c) => (c.masaMolarTexto.split('.')[1]?.length ?? 0) >= 2);
    expect(exigentes.length).toBeGreaterThanOrEqual(30);
    registrarValidacion(
      2,
      'Masas molares (parser de fórmulas vs PubChem)',
      filas,
      `${compuestos.length} compuestos. Error < 0,01 g/mol en todos los que PubChem reporta con 2 o más decimales (${exigentes.length}); en el resto, la diferencia es menor que el redondeo de PubChem.`,
    );
  });
});
