import { describe, expect, it } from 'vitest';
import { estructuraLewis } from '../lewis';
import { caracterIonico, clasificarEnlace, formacionIonica } from '../enlace';

const cargas = (r: ReturnType<typeof estructuraLewis>, k = 0) => r.resonantes[k]!.atomos.map((a) => a.cargaFormal);
const ordenes = (r: ReturnType<typeof estructuraLewis>, k = 0) => r.resonantes[k]!.enlaces.map((e) => e.orden);

describe('estructuras de Lewis', () => {
  it('H2O: 8 e⁻, dos pares libres en el O, cargas formales nulas', () => {
    const r = estructuraLewis('H2O');
    expect(r.totalElectrones).toBe(8);
    expect(r.resonantes).toHaveLength(1);
    expect(r.resonantes[0]!.atomos[0]!.paresLibres).toBe(2);
    expect(cargas(r)).toEqual([0, 0, 0]);
  });

  it('CO2: O=C=O, sin cargas formales', () => {
    const r = estructuraLewis('CO2');
    expect(r.totalElectrones).toBe(16);
    expect(r.resonantes).toHaveLength(1);
    expect(ordenes(r)).toEqual([2, 2]);
    expect(cargas(r)).toEqual([0, 0, 0]);
  });

  it('HCN: triple enlace C≡N', () => {
    const r = estructuraLewis('HCN');
    expect(r.central).toBe('C');
    expect(ordenes(r).sort()).toEqual([1, 3]);
    expect(cargas(r)).toEqual([0, 0, 0]);
  });

  it('O3: dos formas resonantes, O central +1', () => {
    const r = estructuraLewis('O3');
    expect(r.totalElectrones).toBe(18);
    expect(r.resonantes).toHaveLength(2);
    expect(r.resonantes[0]!.atomos[0]!.cargaFormal).toBe(1);
    expect(cargas(r).reduce((s, x) => s + x, 0)).toBe(0);
  });

  it('NO3⁻ y CO3²⁻: tres formas resonantes', () => {
    const no3 = estructuraLewis('NO3-');
    expect(no3.totalElectrones).toBe(24);
    expect(no3.resonantes).toHaveLength(3);
    expect(no3.resonantes[0]!.atomos[0]!.cargaFormal).toBe(1);
    expect(cargas(no3).reduce((s, x) => s + x, 0)).toBe(-1);
    const co3 = estructuraLewis('CO3^2-');
    expect(co3.resonantes).toHaveLength(3);
    expect(cargas(co3).reduce((s, x) => s + x, 0)).toBe(-2);
  });

  it('NH4⁺: el N tiene carga formal +1', () => {
    const r = estructuraLewis('NH4+');
    expect(r.resonantes[0]!.atomos[0]!.cargaFormal).toBe(1);
  });

  it('BF3: octeto incompleto del boro', () => {
    const r = estructuraLewis('BF3');
    expect(r.octetoIncompleto).toBe(true);
    expect(r.resonantes[0]!.electronesCentral).toBe(6);
    expect(cargas(r)).toEqual([0, 0, 0, 0]);
  });

  it('SO4²⁻: con octeto S es +2; con octeto expandido hay 6 formas con S = 0', () => {
    const r = estructuraLewis('SO4^2-');
    expect(r.totalElectrones).toBe(32);
    expect(r.resonantes[0]!.atomos[0]!.cargaFormal).toBe(2);
    expect(r.expandidas).toHaveLength(6);
    expect(r.expandidas[0]!.atomos[0]!.cargaFormal).toBe(0);
    expect(r.expandidas[0]!.electronesCentral).toBe(12);
  });

  it('SO2: dos formas con octeto (S +1) y una expandida sin cargas', () => {
    const r = estructuraLewis('SO2');
    expect(r.resonantes).toHaveLength(2);
    expect(r.expandidas).toHaveLength(1);
    expect(r.expandidas[0]!.atomos.every((a) => a.cargaFormal === 0)).toBe(true);
  });

  it('H2SO4: la forma expandida no tiene cargas formales', () => {
    const r = estructuraLewis('H2SO4');
    expect(r.totalElectrones).toBe(32);
    expect(r.expandidas[0]!.atomos.every((a) => a.cargaFormal === 0)).toBe(true);
  });

  it('PCl5 y XeF4: más de 8 electrones alrededor del central', () => {
    expect(estructuraLewis('PCl5').resonantes[0]!.electronesCentral).toBe(10);
    const xef4 = estructuraLewis('XeF4');
    expect(xef4.resonantes[0]!.atomos[0]!.paresLibres).toBe(2);
    expect(xef4.resonantes[0]!.electronesCentral).toBe(12);
  });

  it('NO2: radical con un electrón desapareado', () => {
    const r = estructuraLewis('NO2');
    expect(r.totalElectrones).toBe(17);
    expect(r.radical).toBe(true);
  });

  it('la suma de cargas formales es igual a la carga de la especie', () => {
    for (const f of ['H2O', 'NH3', 'CH4', 'NO3-', 'CO3^2-', 'SO4^2-', 'PO4^3-', 'ClO4-', 'NH4+', 'H3O+', 'O3', 'HCN', 'SO2', 'BF3']) {
      const r = estructuraLewis(f);
      const q = r.resonantes[0]!.atomos.reduce((s, a) => s + a.cargaFormal, 0);
      const esperado = f.includes('^') ? -Number(f.match(/\^(\d)/)![1]) : f.endsWith('+') ? 1 : f.endsWith('-') ? -1 : 0;
      expect(q, f).toBe(esperado);
    }
  });
});

describe('tipo de enlace (ΔEN)', () => {
  it('clasifica pares de elementos', () => {
    expect(clasificarEnlace('Na', 'Cl').tipo).toBe('ionico');
    expect(clasificarEnlace('Na', 'Cl').deltaEN).toBeCloseTo(2.23, 2);
    expect(clasificarEnlace('H', 'H').tipo).toBe('covalente-apolar');
    expect(clasificarEnlace('H', 'Cl').tipo).toBe('covalente-polar');
    expect(clasificarEnlace('H', 'F').tipo).toBe('covalente-polar'); // ΔEN = 1,78 pero entre no metales
    expect(clasificarEnlace('Fe', 'Cu').tipo).toBe('metalico');
    expect(clasificarEnlace('Al', 'Cl').tipo).toBe('covalente-polar'); // ΔEN = 1,55
    expect(clasificarEnlace('O', 'H').poloNegativo).toBe('O');
  });

  it('carácter iónico de Pauling', () => {
    expect(caracterIonico(0)).toBe(0);
    expect(caracterIonico(1.7)).toBeCloseTo(51.4, 1);
    expect(caracterIonico(2.23)).toBeCloseTo(71.15, 1);
  });

  it('forma compuestos iónicos binarios igualando cargas', () => {
    expect(formacionIonica('Na', 'Cl').formula).toBe('NaCl');
    expect(formacionIonica('Mg', 'Cl').formula).toBe('MgCl2');
    expect(formacionIonica('Al', 'O').formula).toBe('Al2O3');
    expect(formacionIonica('Na', 'S').formula).toBe('Na2S');
    expect(formacionIonica('Ca', 'N').formula).toBe('Ca3N2');
    expect(formacionIonica('Al', 'O').electronesTransferidos).toBe(6);
    expect(() => formacionIonica('Cl', 'Na')).toThrow();
  });
});
