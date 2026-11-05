import { describe, expect, it } from 'vitest';
import { arrhenius, concentracion, determinarOrden, energiaActivacion, kADosTemperaturas, leyVelocidad, tiempoPara, vidaMedia } from '../kinetics';
import { cociente, deltaNGas, kpDesdeKc, pasoCinetico, resolverICE, vantHoff, type ReaccionEq } from '../equilibrium';
import {
  curvaTitulacion,
  fracciones,
  hendersonHasselbalch,
  pHAcidoDebil,
  pHAcidoDebilAprox,
  pHAcidoFuerte,
  pHBaseDebil,
  pHBaseFuerte,
  pHBuffer,
  pHSolucion,
  pHTitulacion,
  porcentajeIonizacion,
  productoIonico,
  solubilidadIonComun,
  solubilidadMolar,
  volumenesEquivalencia,
  KW,
} from '../acidBase';
import { celda, cocienteCelda, masaElectrolisis, nernst, SEMIRREACCIONES, tiempoElectrolisis } from '../electrochem';
import { propiedadesReaccion } from '../thermo';
import { errorPorcentual, registrarValidacion, type FilaValidacion } from './validacion';

describe('cinética', () => {
  const filas: FilaValidacion[] = [];
  const caso = (c: string, ref: number, calc: number, u: string, fuente: string, tol = 1) => {
    expect(errorPorcentual(ref, calc), c).toBeLessThan(tol);
    filas.push({ caso: c, referencia: ref, calculado: Number(calc.toPrecision(5)), unidad: u, fuente });
  };

  it('leyes integradas y vida media', () => {
    // Orden 1 (Chang): ciclopropano → propeno, k = 6,7·10⁻⁴ s⁻¹: t½ ≈ 1,0·10³ s
    caso('t½ de orden 1, k = 6,7·10⁻⁴ s⁻¹', 1.03e3, vidaMedia(1, 6.7e-4, 1), 's', 'Chang, cap. 13 (ln 2/k)');
    // Orden 2 (Chang): 2I → I₂, k = 7,0·10⁹ M⁻¹s⁻¹, [I]₀ = 0,086 M → t½ = 1,7·10⁻⁹ s
    caso('t½ de orden 2, k = 7,0·10⁹ M⁻¹s⁻¹, [A]₀ = 0,086 M', 1.7e-9, vidaMedia(2, 7.0e9, 0.086), 's', 'Chang, cap. 13 (1/k[A]₀; 2 cifras)', 3);
    // Coherencia: a t = t½ queda la mitad, para los tres órdenes
    for (const o of [0, 1, 2] as const) expect(concentracion(o, 0.8, 0.05, vidaMedia(o, 0.05, 0.8))).toBeCloseTo(0.4, 12);
    expect(tiempoPara(1, 1, 0.25, Math.LN2)).toBeCloseTo(2, 12);
    expect(concentracion(0, 1, 0.1, 20)).toBe(0);
  });

  it('determina el orden por el método gráfico', () => {
    const t = [0, 50, 100, 150, 200, 300];
    for (const o of [0, 1, 2] as const) {
      const A = t.map((x) => concentracion(o, 1, 0.002, x));
      const r = determinarOrden(t, A);
      expect(r.orden).toBe(o);
      expect(r.k).toBeCloseTo(0.002, 9);
    }
  });

  it('método de las velocidades iniciales (Chang: F₂ + 2ClO₂ → 2FClO₂)', () => {
    const r = leyVelocidad([
      { concentraciones: [0.1, 0.01], velocidad: 1.2e-3 },
      { concentraciones: [0.1, 0.04], velocidad: 4.8e-3 },
      { concentraciones: [0.2, 0.01], velocidad: 2.4e-3 },
    ]);
    expect(r.ordenes).toEqual([1, 1]);
    caso('k de F₂ + 2ClO₂ (v = k[F₂][ClO₂])', 1.2, r.k, 'M⁻¹s⁻¹', 'Chang, cap. 13 (velocidades iniciales)');
  });

  it('Arrhenius', () => {
    // Ea a partir de dos constantes, ida y vuelta
    const k2 = kADosTemperaturas(1e-3, 298.15, 308.15, 50e3);
    expect(energiaActivacion(1e-3, 298.15, k2, 308.15)).toBeCloseTo(50e3, 6);
    // Regla práctica: con Ea ≈ 50 kJ/mol, 10 °C más casi duplican k
    expect(k2 / 1e-3).toBeCloseTo(1.92, 2);
    expect(arrhenius(1e13, 0, 300)).toBe(1e13);
    registrarValidacion(19, 'Cinética', filas);
  });
});

describe('equilibrio', () => {
  const HI: ReaccionEq = { reactivos: [{ formula: 'H2', coef: 1, fase: 'g' }, { formula: 'I2', coef: 1, fase: 'g' }], productos: [{ formula: 'HI', coef: 2, fase: 'g' }] };
  const N2O4: ReaccionEq = { reactivos: [{ formula: 'N2O4', coef: 1, fase: 'g' }], productos: [{ formula: 'NO2', coef: 2, fase: 'g' }] };

  it('tabla ICE (Chang: H₂ + I₂ ⇌ 2HI, Kc = 54,3 a 430 °C)', () => {
    const r = resolverICE(HI, [0.5, 0.5], [0], 54.3);
    expect(r.productos[0]).toBeCloseTo(0.786, 2);
    expect(r.reactivos[0]).toBeCloseTo(0.107, 3);
    expect(cociente(HI, r.reactivos, r.productos)).toBeCloseTo(54.3, 6);
    expect(r.sentido).toBe('productos');
    // Partiendo solo de productos, se llega al mismo equilibrio
    const r2 = resolverICE(HI, [0, 0], [1.0], 54.3);
    expect(r2.productos[0]).toBeCloseTo(0.786, 2);
    expect(r2.sentido).toBe('reactivos');
    // Sólidos fuera de K: CaCO3(s) ⇌ CaO(s) + CO2(g)
    const caco3: ReaccionEq = { reactivos: [{ formula: 'CaCO3', coef: 1, fase: 's' }], productos: [{ formula: 'CaO', coef: 1, fase: 's' }, { formula: 'CO2', coef: 1, fase: 'g' }] };
    expect(cociente(caco3, [1], [1, 0.25])).toBe(0.25);
  });

  it('Kp = Kc(RT)^Δn (Chang: N₂O₄ ⇌ 2NO₂, Kc = 4,63·10⁻³ a 25 °C → Kp = 0,113)', () => {
    expect(deltaNGas(N2O4)).toBe(1);
    expect(kpDesdeKc(4.63e-3, 298.15, 1)).toBeCloseTo(0.113, 3);
    registrarValidacion(20, 'Equilibrio', [
      { caso: 'H₂ + I₂ ⇌ 2HI: [HI]eq desde 0,500 M de H₂ e I₂', referencia: 0.786, calculado: Number(resolverICE(HI, [0.5, 0.5], [0], 54.3).productos[0]!.toFixed(4)), unidad: 'M', fuente: 'Chang, cap. 14' },
      { caso: 'N₂O₄ ⇌ 2NO₂: Kp a 25 °C', referencia: 0.113, calculado: Number(kpDesdeKc(4.63e-3, 298.15, 1).toFixed(4)), unidad: '', fuente: 'Chang, cap. 14' },
    ]);
  });

  it('Le Chatelier y Van ’t Hoff', () => {
    // Al comprimir a la mitad, el equilibrio N₂O₄/NO₂ se desplaza hacia N₂O₄ (menos moles de gas)
    const eq = resolverICE(N2O4, [0.1], [0], 4.63e-3);
    const comp = resolverICE(N2O4, [eq.reactivos[0]! * 2], [eq.productos[0]! * 2], 4.63e-3);
    expect(comp.x).toBeLessThan(0);
    // Reacción endotérmica (ΔH° de las tablas): al calentar K aumenta
    const dH = propiedadesReaccion('N2O4(g) -> 2 NO2(g)').dH * 1000;
    expect(vantHoff(4.63e-3, 298.15, 350, dH)).toBeGreaterThan(4.63e-3);
    // La evolución cinética converge al equilibrio
    let c = { reactivos: [0.1], productos: [0] };
    for (let i = 0; i < 4000; i++) c = pasoCinetico(N2O4, c.reactivos, c.productos, 4.63e-3, 1, 0.01);
    expect(c.productos[0]).toBeCloseTo(eq.productos[0]!, 6);
  });
});

describe('ácidos y bases (error < 0,01 unidades de pH)', () => {
  const filas: FilaValidacion[] = [];
  const caso = (c: string, ref: number, calc: number, fuente: string) => {
    expect(Math.abs(calc - ref), c).toBeLessThan(0.01);
    filas.push({ caso: c, referencia: ref, calculado: Number(calc.toFixed(4)), unidad: 'pH', fuente });
  };
  const Ka = 1.8e-5;

  it('ácidos y bases fuertes y débiles', () => {
    caso('HCl 0,10 M', 1.0, pHAcidoFuerte(0.1), 'analítico: −log C');
    caso('HCl 1,0·10⁻⁸ M (con el agua)', 6.978, pHAcidoFuerte(1e-8), 'analítico: [H⁺] = (C + √(C² + 4Kw))/2');
    caso('NaOH 0,050 M', 12.699, pHBaseFuerte(0.05), 'analítico: 14 + log C');
    caso('Ba(OH)₂ 0,020 M', 12.602, pHBaseFuerte(0.02, 2), 'analítico: 14 + log 2C');
    // Ácido débil: cuadrática exacta x²/(C − x) = Ka
    const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * 0.1)) / 2;
    caso('CH₃COOH 0,10 M (Ka = 1,8·10⁻⁵)', -Math.log10(x), pHAcidoDebil(0.1, Ka), 'analítico: cuadrática; Chang ≈ 2,87');
    expect(Math.abs(pHAcidoDebil(0.1, Ka) - 2.87)).toBeLessThan(0.01);
    expect(Math.abs(pHAcidoDebilAprox(0.1, Ka) - pHAcidoDebil(0.1, Ka))).toBeLessThan(0.01);
    caso('NH₃ 0,40 M (Kb = 1,8·10⁻⁵)', 14 + Math.log10((-1.8e-5 + Math.sqrt(1.8e-5 ** 2 + 4 * 1.8e-5 * 0.4)) / 2), pHBaseDebil(0.4, 1.8e-5), 'analítico: cuadrática; Chang ≈ 11,43');
    expect(Math.abs(pHBaseDebil(0.4, 1.8e-5) - 11.43)).toBeLessThan(0.01);
    // Fosfórico 0,10 M: domina Ka₁ (cuadrática)
    const y = (-7.5e-3 + Math.sqrt(7.5e-3 ** 2 + 4 * 7.5e-3 * 0.1)) / 2;
    caso('H₃PO₄ 0,10 M', -Math.log10(y), pHAcidoDebil(0.1, [7.5e-3, 6.2e-8, 4.8e-13]), 'analítico: cuadrática con Ka₁');
    expect(porcentajeIonizacion(0.1, Ka)).toBeCloseTo(1.33, 1);
  });

  it('buffers', () => {
    caso('Buffer CH₃COOH 0,10 M / CH₃COONa 0,10 M', -Math.log10(Ka), pHBuffer(Ka, 0.1, 0.1), 'Henderson-Hasselbalch');
    caso('Buffer NH₃ 0,30 M / NH₄Cl 0,36 M', 14 + Math.log10(1.8e-5) + Math.log10(0.3 / 0.36), pHSolucion({ sistemas: [{ C: 0.66, Ka: [KW / 1.8e-5], cargaProtonada: 1 }], aniones: 0.36 }), 'Henderson-Hasselbalch; Chang ≈ 9,17');
    expect(hendersonHasselbalch(Ka, 0.2, 0.1)).toBeCloseTo(-Math.log10(Ka) + Math.log10(2), 12);
  });

  it('puntos de la titulación frente a los valores analíticos', () => {
    const t = { analito: { C: 0.1, V: 25, Ka: [Ka] }, titulante: { C: 0.1 } };
    expect(volumenesEquivalencia(t)).toEqual([25]);
    caso('CH₃COOH con NaOH: semiequivalencia (pH = pKa)', -Math.log10(Ka), pHTitulacion(t, 12.5), 'analítico');
    // Equivalencia: hidrólisis del acetato 0,050 M → [OH⁻] = √(Kw/Ka·C)
    caso('CH₃COOH con NaOH: equivalencia', 14 + Math.log10(Math.sqrt((KW / Ka) * 0.05)), pHTitulacion(t, 25), 'analítico; Chang ≈ 8,72');
    // Exceso: 10 mL de NaOH 0,1 M en 60 mL
    caso('CH₃COOH con NaOH: 35 mL', 14 + Math.log10((0.1 * 10) / 60), pHTitulacion(t, 35), 'analítico: exceso de OH⁻');
    const f = { analito: { C: 0.1, V: 25 }, titulante: { C: 0.1 } };
    caso('HCl con NaOH: equivalencia', 7.0, pHTitulacion(f, 25), 'analítico');
    caso('HCl con NaOH: 10 mL', -Math.log10((0.1 * 15) / 35), pHTitulacion(f, 10), 'analítico: exceso de H⁺');
    const b = { analito: { C: 0.1, V: 25, base: true, Kb: 1.8e-5 }, titulante: { C: 0.1 } };
    caso('NH₃ con HCl: equivalencia', -Math.log10(Math.sqrt((KW / 1.8e-5) * 0.05)), pHTitulacion(b, 25), 'analítico; Chang ≈ 5,28');
    // La curva crece de forma monótona
    const curva = curvaTitulacion(t, 50, 200);
    expect(curva.every((p, i) => i === 0 || p.pH >= curva[i - 1]!.pH - 1e-9)).toBe(true);
    registrarValidacion(21, 'pH, buffers y titulación', filas, 'El pH se calcula por balance de carga exacto (bisección); el analítico usa la fórmula cerrada indicada.');
  });

  it('fracciones de especie y Ksp', () => {
    const a = fracciones([Ka], Ka);
    expect(a[0]).toBeCloseTo(0.5, 12);
    expect(fracciones([7.5e-3, 6.2e-8, 4.8e-13], 1e-7).reduce((s, v) => s + v, 0)).toBeCloseTo(1, 12);
    // Chang: Ksp(AgCl) = 1,6·10⁻¹⁰ → s = 1,3·10⁻⁵ M; CaF₂ 4,0·10⁻¹¹ → 2,2·10⁻⁴ M
    expect(solubilidadMolar(1.6e-10, 1, 1)).toBeCloseTo(1.26e-5, 7);
    expect(solubilidadMolar(4.0e-11, 1, 2)).toBeCloseTo(2.15e-4, 6);
    // Ion común: AgCl en NaCl 0,10 M → s ≈ Ksp/0,10
    expect(solubilidadIonComun(1.6e-10, 1, 1, 0, 0.1)).toBeCloseTo(1.6e-9, 12);
    expect(productoIonico(1e-3, 1e-3, 1, 1)).toBeGreaterThan(1.6e-10);
  });
});

describe('electroquímica', () => {
  it('celdas galvánicas, Nernst y Faraday (Chang)', () => {
    const d = celda('Cu', 'Zn');
    expect(d.E0).toBeCloseTo(1.1, 10);
    expect(d.n).toBe(2);
    expect(d.dG0 / 1000).toBeCloseTo(-212, 0);
    expect(d.ecuacion).toBe('Cu2+(ac) + Zn(s) -> Cu(s) + Zn2+(ac)');
    // Co + Fe²⁺ → Co²⁺ + Fe: E° = −0,16 V; con [Co²⁺] = 0,15 M y [Fe²⁺] = 0,68 M → E = −0,14 V
    const c = celda('Fe', 'Co');
    expect(c.E0).toBeCloseTo(-0.16, 10);
    const Q = cocienteCelda(c.global, { 'Co2+(ac)': 0.15, 'Fe2+(ac)': 0.68 });
    const E = nernst(c.E0, c.n, Q);
    expect(E).toBeCloseTo(-0.14, 2);
    // Electrones igualados: MnO4⁻/Fe²⁺ (n = 5)
    const m = celda('MnO4', 'Fe3');
    expect(m.n).toBe(5);
    expect(m.global.get('e-')).toBeUndefined();
    expect(m.global.get('Fe2+(ac)')).toBe(-5);
    // Electrólisis de CaCl₂ fundido: 0,452 A durante 1,50 h → 0,507 g de Ca
    expect(masaElectrolisis(0.452, 1.5 * 3600, 40.078, 2)).toBeCloseTo(0.507, 3);
    expect(tiempoElectrolisis(0.507, 0.452, 40.078, 2) / 3600).toBeCloseTo(1.5, 2);
    registrarValidacion(22, 'Electroquímica', [
      { caso: 'Pila de Daniell: E°', referencia: 1.1, calculado: d.E0, unidad: 'V', fuente: 'Chang, cap. 19' },
      { caso: 'Pila de Daniell: ΔG°', referencia: -212, calculado: Number((d.dG0 / 1000).toFixed(1)), unidad: 'kJ', fuente: 'Chang, cap. 19' },
      { caso: 'Co | Co²⁺ (0,15 M) ‖ Fe²⁺ (0,68 M) | Fe: Nernst', referencia: -0.14, calculado: Number(E.toFixed(4)), unidad: 'V', fuente: 'Chang, cap. 19' },
      { caso: 'Electrólisis de CaCl₂: 0,452 A, 1,50 h', referencia: 0.507, calculado: Number(masaElectrolisis(0.452, 5400, 40.078, 2).toFixed(4)), unidad: 'g', fuente: 'Chang, cap. 19' },
    ]);
  });

  it('la tabla de potenciales está ordenada y completa', () => {
    for (let i = 1; i < SEMIRREACCIONES.length; i++) expect(SEMIRREACCIONES[i]!.E).toBeLessThanOrEqual(SEMIRREACCIONES[i - 1]!.E);
    for (const s of SEMIRREACCIONES) {
      expect(s.ecuacion).toMatch(/e- /);
      const m = /(\d*)e-/.exec(s.ecuacion)!;
      expect(Number(m[1] || 1), s.id).toBe(s.n);
    }
  });
});
