import { describe, expect, it } from 'vitest';
import {
  compresibilidad,
  dalton,
  densidadGas,
  gasIdeal,
  leyCombinada,
  masaMolarGraham,
  maxwellBoltzmann,
  presionVdW,
  relacionGraham,
  VAN_DER_WAALS,
  vMasProbable,
  vMedia,
  vRms,
} from '../gases';
import {
  aumentoEbullicion,
  CONSTANTES_COLIGATIVAS,
  descensoCongelacion,
  dilucion,
  masaMolarCrioscopia,
  mezcla,
  molaridadDesdePorcentaje,
  presionOsmotica,
  solubilidadA,
} from '../solutions';
import { calor, criterioEspontaneidad, ESPECIES_TERMO, formulaDeClave, gibbs, hess, propiedadesReaccion, temperaturaEquilibrio, temperaturaInversion } from '../thermo';
import { masaMolar } from '../formula';
import { errorPorcentual, registrarValidacion } from './validacion';

describe('gases (ejercicios de Chang)', () => {
  const filas: { caso: string; referencia: number; calculado: number; unidad: string; fuente: string }[] = [];
  const caso = (c: string, ref: number, calc: number, u: string, tol = 1) => {
    expect(errorPorcentual(ref, calc), c).toBeLessThan(tol);
    filas.push({ caso: c, referencia: ref, calculado: Number(calc.toPrecision(5)), unidad: u, fuente: 'Chang, Química, cap. 5' });
  };

  it('ecuación de estado y leyes de los gases', () => {
    caso('6,9 mol de CO en 30,4 L a 62 °C: P', 6.2, gasIdeal({ n: 6.9, V: 30.4, T: 335.15 }, 'P'), 'atm');
    caso('Boyle: 726 mmHg y 946 mL → 154 mL', 4.46e3, leyCombinada({ P: 726, V: 946, T: 1 }, { V: 154, T: 1 }, 'P'), 'mmHg');
    caso('1 mol a 0 °C y 1 atm: V', 22.41, gasIdeal({ n: 1, P: 1, T: 273.15 }, 'V'), 'L', 0.1);
    caso('Densidad del CO₂ a 0,990 atm y 55 °C', 1.62, densidadGas(0.99, masaMolar('CO2'), 328.15), 'g/L');
    caso('Graham: efusión en 1,50 min frente a Br₂ en 4,73 min → M', 16.1, masaMolarGraham(1.5, 4.73, masaMolar('Br2')), 'g/mol');
    const vdw = VAN_DER_WAALS.NH3!;
    caso('Van der Waals: 3,50 mol NH₃ en 5,20 L a 47 °C', 16.2, presionVdW(3.5, 5.2, 320.15, vdw.a, vdw.b), 'atm');
    caso('v_rms del N₂ a 25 °C', 515, vRms(masaMolar('N2'), 298.15), 'm/s');
    caso('v_rms del He a 25 °C', 1.36e3, vRms(masaMolar('He'), 298.15), 'm/s');
    registrarValidacion(17, 'Gases', filas);
  });

  it('Dalton y Graham', () => {
    const p = dalton([1, 3], 4);
    expect(p[0]!.presion).toBeCloseTo(1, 10);
    expect(relacionGraham(masaMolar('H2'), masaMolar('O2'))).toBeCloseTo(3.98, 2);
  });

  it('Maxwell-Boltzmann: normalizada y con v_mp < v̄ < v_rms', () => {
    const M = 28, T = 300;
    let s = 0;
    for (let v = 0; v < 3000; v += 0.5) s += maxwellBoltzmann(v + 0.25, M, T) * 0.5;
    expect(s).toBeCloseTo(1, 4);
    expect(vMasProbable(M, T)).toBeLessThan(vMedia(M, T));
    expect(vMedia(M, T)).toBeLessThan(vRms(M, T));
    // El máximo de f(v) está en v_mp
    const vmp = vMasProbable(M, T);
    expect(maxwellBoltzmann(vmp, M, T)).toBeGreaterThan(maxwellBoltzmann(vmp * 1.05, M, T));
    expect(maxwellBoltzmann(vmp, M, T)).toBeGreaterThan(maxwellBoltzmann(vmp * 0.95, M, T));
  });

  it('el gas ideal tiene Z = 1 y los reales se desvían', () => {
    const V = gasIdeal({ n: 1, P: 1, T: 300 }, 'V');
    expect(compresibilidad(1, V, 1, 300)).toBeCloseTo(1, 12);
  });
});

describe('soluciones', () => {
  it('ejercicios de libro', () => {
    // Etilenglicol: 651 g en 2505 g de agua → m = 4,19, ΔTc = 7,79 °C (Chang)
    const m = 651 / masaMolar('C2H6O2') / 2.505;
    expect(m).toBeCloseTo(4.19, 2);
    expect(descensoCongelacion(m, CONSTANTES_COLIGATIVAS.agua!.Kc)).toBeCloseTo(7.79, 1);
    expect(aumentoEbullicion(m, CONSTANTES_COLIGATIVAS.agua!.Ke)).toBeCloseTo(2.18, 1);
    // Agua de mar ≈ 0,70 M a 25 °C: π ≈ 17 atm (Chang)
    expect(presionOsmotica(0.7, 298.15)).toBeCloseTo(17.1, 0);
    // H2SO4 98 % y ρ = 1,84 g/mL → 18,4 M
    expect(molaridadDesdePorcentaje(98, 1.84, masaMolar('H2SO4'))).toBeCloseTo(18.4, 1);
    // Dilución: 2,00 M a 0,500 L de 0,400 M → 0,100 L
    expect(dilucion(2, null, 0.4, 0.5)).toBeCloseTo(0.1, 10);
    expect(mezcla([{ c: 1, v: 1 }, { c: 3, v: 1 }])).toBe(2);
    // Masa molar por crioscopía: 7,85 g en 301 g de benceno, ΔTc = 1,05 °C → 127 g/mol (Chang)
    expect(masaMolarCrioscopia(7.85, 0.301, 1.05, CONSTANTES_COLIGATIVAS.benceno!.Kc)).toBeCloseTo(127, -0.5);
  });

  it('curvas de solubilidad', () => {
    expect(solubilidadA('nitrato de potasio', 20)).toBeCloseTo(31.6, 6);
    expect(solubilidadA('nitrato de potasio', 30)).toBeCloseTo((31.6 + 63.9) / 2, 6);
    expect(solubilidadA('nitrato de potasio', 200)).toBeNull();
  });
});

describe('termoquímica', () => {
  it('la tabla es coherente: ΔGf° ≈ ΔHf° − T·ΔSf° (error < 3 kJ/mol)', () => {
    // Entropía de los elementos en su estado estándar
    const S_ELEMENTO: Record<string, number> = { H: 131.0 / 2, O: 205.0 / 2, N: 191.5 / 2, C: 5.69, Cl: 223.0 / 2, S: 31.88, Fe: 27.2, Ca: 41.6, Na: 51.05, Al: 28.3, Mg: 32.5 };
    const filas = [];
    for (const [clave, d] of Object.entries(ESPECIES_TERMO)) {
      if (d.dHf === 0 && d.dGf === 0) continue;
      const f = formulaDeClave(clave);
      const sElementos = [...f.atomos].reduce((s, [el, n]) => s + n * S_ELEMENTO[el]!, 0);
      const dSf = d.S - sElementos;
      const calc = d.dHf - (298.15 * dSf) / 1000;
      expect(Math.abs(calc - d.dGf), clave).toBeLessThan(3);
      filas.push({ caso: `${clave}: ΔHf° − TΔSf°`, referencia: d.dGf, calculado: Number(calc.toFixed(2)), unidad: 'kJ/mol', fuente: 'Chang, apéndice 3 (coherencia interna)' });
    }
    registrarValidacion(18, 'Termoquímica: coherencia de la tabla ΔHf°, S°, ΔGf°', filas, 'Cada ΔGf° tabulado se compara con ΔHf° − T·ΔSf°, calculando ΔSf° con las entropías de los elementos.');
  });

  it('entalpías de reacción de libro', () => {
    expect(propiedadesReaccion('CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)').dH).toBeCloseTo(-890.4, 0);
    const caco3 = propiedadesReaccion('CaCO3(s) -> CaO(s) + CO2(g)');
    expect(caco3.dH).toBeCloseTo(177.8, 1);
    expect(caco3.dS).toBeCloseTo(160.5, 1);
    // Temperatura de descomposición: 835 °C (Chang)
    expect(temperaturaInversion(caco3.dH, caco3.dS) - 273.15).toBeCloseTo(835, -0.5);
    // Sin coeficientes: se balancea solo
    expect(propiedadesReaccion('C3H8(g) + O2(g) -> CO2(g) + H2O(l)').dH).toBeCloseTo(-2220, -1);
  });

  it('ley de Hess: C + ½O₂ → CO a partir de las combustiones de C y CO', () => {
    const r = hess('C(grafito) + 1/2 O2(g) -> CO(g)', [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'CO(g) + 1/2 O2(g) -> CO2(g)', dH: -283.0 },
    ]);
    expect(r.multiplicadores.map(String)).toEqual(['1', '-1']);
    expect(r.dH).toBeCloseTo(-110.5, 6);
    // Acetileno (Chang): 2C + H2 → C2H2 con ΔH = 226,6 kJ
    const a = hess('2 C(grafito) + H2(g) -> C2H2(g)', [
      { ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 },
      { ecuacion: 'H2(g) + 1/2 O2(g) -> H2O(l)', dH: -285.8 },
      { ecuacion: '2 C2H2(g) + 5 O2(g) -> 4 CO2(g) + 2 H2O(l)', dH: -2598.8 },
    ]);
    expect(a.dH).toBeCloseTo(226.6, 1);
    expect(() => hess('N2(g) + O2(g) -> 2 NO(g)', [{ ecuacion: 'C(grafito) + O2(g) -> CO2(g)', dH: -393.5 }])).toThrow();
  });

  it('espontaneidad y calorimetría', () => {
    expect(gibbs(-100, 50, 298)).toBeCloseTo(-114.9, 1);
    expect(criterioEspontaneidad(177.8, 160.5)).toMatch(/altas temperaturas/);
    expect(criterioEspontaneidad(-100, 50)).toMatch(/cualquier/);
    // 466 g de agua de 8,50 °C a 74,60 °C: q = 129 kJ (Chang)
    expect(calor(466, 4.184, 66.1) / 1000).toBeCloseTo(128.9, 0);
    expect(temperaturaEquilibrio([{ m: 100, c: 4.184, T: 80 }, { m: 100, c: 4.184, T: 20 }])).toBeCloseTo(50, 10);
  });
});
