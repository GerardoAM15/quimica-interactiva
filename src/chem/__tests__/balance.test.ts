import { describe, expect, it } from 'vitest';
import { analizarRedox, balancear, balancearIonElectron, ecuacionTexto, ErrorBalanceo, pasosTanteo, verificarBalance } from '../balance';
import { estadosOxidacion } from '../oxidacion';
import { aEnterosMinimos, espacioNulo, frac } from '../fraction';
import { registrarValidacion } from './validacion';

/** [ecuación sin balancear, coeficientes esperados (enteros mínimos)] — Chang, Brown y textos preuniversitarios. */
const ECUACIONES: [string, number[]][] = [
  ['H2 + O2 -> H2O', [2, 1, 2]],
  ['N2 + H2 -> NH3', [1, 3, 2]],
  ['Fe + O2 -> Fe2O3', [4, 3, 2]],
  ['Al + O2 -> Al2O3', [4, 3, 2]],
  ['Na + Cl2 -> NaCl', [2, 1, 2]],
  ['P4 + O2 -> P4O10', [1, 5, 1]],
  ['KClO3 -> KCl + O2', [2, 2, 3]],
  ['CaCO3 -> CaO + CO2', [1, 1, 1]],
  ['H2O2 -> H2O + O2', [2, 2, 1]],
  ['NaHCO3 -> Na2CO3 + H2O + CO2', [2, 1, 1, 1]],
  ['Zn + HCl -> ZnCl2 + H2', [1, 2, 1, 1]],
  ['Al + HCl -> AlCl3 + H2', [2, 6, 2, 3]],
  ['Fe + CuSO4 -> FeSO4 + Cu', [1, 1, 1, 1]],
  ['Cl2 + NaBr -> NaCl + Br2', [1, 2, 2, 1]],
  ['AgNO3 + NaCl -> AgCl + NaNO3', [1, 1, 1, 1]],
  ['BaCl2 + Na2SO4 -> BaSO4 + NaCl', [1, 1, 1, 2]],
  ['Pb(NO3)2 + KI -> PbI2 + KNO3', [1, 2, 1, 2]],
  ['HCl + NaOH -> NaCl + H2O', [1, 1, 1, 1]],
  ['H2SO4 + NaOH -> Na2SO4 + H2O', [1, 2, 1, 2]],
  ['H3PO4 + Ca(OH)2 -> Ca3(PO4)2 + H2O', [2, 3, 1, 6]],
  ['Al(OH)3 + H2SO4 -> Al2(SO4)3 + H2O', [2, 3, 1, 6]],
  ['CH4 + O2 -> CO2 + H2O', [1, 2, 1, 2]],
  ['C3H8 + O2 -> CO2 + H2O', [1, 5, 3, 4]],
  ['C2H6 + O2 -> CO2 + H2O', [2, 7, 4, 6]],
  ['C8H18 + O2 -> CO2 + H2O', [2, 25, 16, 18]],
  ['C6H12O6 + O2 -> CO2 + H2O', [1, 6, 6, 6]],
  ['C2H5OH + O2 -> CO2 + H2O', [1, 3, 2, 3]],
  ['C12H22O11 + O2 -> CO2 + H2O', [1, 12, 12, 11]],
  ['Fe2O3 + CO -> Fe + CO2', [1, 3, 2, 3]],
  ['NH3 + O2 -> NO + H2O', [4, 5, 4, 6]],
  ['Cu + HNO3 -> Cu(NO3)2 + NO + H2O', [3, 8, 3, 2, 4]],
  ['Cu + HNO3 -> Cu(NO3)2 + NO2 + H2O', [1, 4, 1, 2, 2]],
  ['KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O', [2, 16, 2, 2, 5, 8]],
  ['K2Cr2O7 + HCl -> KCl + CrCl3 + Cl2 + H2O', [1, 14, 2, 2, 3, 7]],
  ['MnO2 + HCl -> MnCl2 + Cl2 + H2O', [1, 4, 1, 1, 2]],
  ['H2S + HNO3 -> S + NO + H2O', [3, 2, 3, 2, 4]],
  ['Zn + HNO3 -> Zn(NO3)2 + NH4NO3 + H2O', [4, 10, 4, 1, 3]],
  ['Cl2 + NaOH -> NaCl + NaClO3 + H2O', [3, 6, 5, 1, 3]],
  ['FeS2 + O2 -> Fe2O3 + SO2', [4, 11, 2, 8]],
  ['Ca3(PO4)2 + SiO2 + C -> CaSiO3 + P4 + CO', [2, 6, 10, 6, 1, 10]],
  ['K4[Fe(CN)6] + KMnO4 + H2SO4 -> KHSO4 + Fe2(SO4)3 + MnSO4 + HNO3 + CO2 + H2O', [10, 122, 299, 162, 5, 122, 60, 60, 188]],
  // Iónicas (se conserva también la carga)
  ['MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O', [1, 5, 8, 1, 5, 4]],
  ['Cr2O7^2- + Fe^2+ + H^+ -> Cr^3+ + Fe^3+ + H2O', [1, 6, 14, 2, 6, 7]],
  ['Cu + Ag^+ -> Cu^2+ + Ag', [1, 2, 1, 2]],
  ['Ag^+ + Cl^- -> AgCl', [1, 1, 1]],
  ['Fe^3+ + e- -> Fe^2+', [1, 1, 1]],
  ['SO2 + O2 -> SO3', [2, 1, 2]],
  ['Cu^2+ + NH3 -> [Cu(NH3)4]^2+', [1, 4, 1]],
];

describe('fracciones y espacio nulo', () => {
  it('opera con fracciones exactas', () => {
    expect(frac(1, 3).sumar(frac(2, 3)).toString()).toBe('1');
    expect(frac(6, -8).toString()).toBe('-3/4');
    expect(frac(1, 2).dividir(frac(1, 4)).toString()).toBe('2');
  });
  it('espacio nulo de 2H₂ + O₂ → 2H₂O', () => {
    const v = espacioNulo([[frac(2), frac(0), frac(-2)], [frac(0), frac(2), frac(-1)]]);
    expect(v).toHaveLength(1);
    expect(aEnterosMinimos(v[0]!)).toEqual([2n, 1n, 2n]);
  });
});

describe('balanceo algebraico', () => {
  it(`al menos 40 ecuaciones (hay ${ECUACIONES.length})`, () => expect(ECUACIONES.length).toBeGreaterThanOrEqual(40));

  it.each(ECUACIONES)('%s', (ec, esperado) => {
    const r = balancear(ec);
    expect(r.coeficientes.map(Number)).toEqual(esperado);
    expect(verificarBalance(r)).toBe(true);
  });

  it('genera la tabla de validación', () => {
    registrarValidacion(
      14,
      'Balanceo de ecuaciones',
      ECUACIONES.map(([ec, esp]) => {
        const r = balancear(ec);
        return { caso: ec.replace(/->/, '→'), referencia: esp.join(' : '), calculado: r.coeficientes.join(' : '), fuente: 'Chang / Brown / textos preuniversitarios' };
      }),
      `${ECUACIONES.length} ecuaciones (síntesis, descomposición, desplazamiento, doble desplazamiento, neutralización, combustión, redox moleculares e iónicas). Coeficientes enteros mínimos por espacio nulo con fracciones exactas.`,
    );
  });

  it('detecta ecuaciones imposibles', () => {
    expect(() => balancear('H2O -> H2 + CO2')).toThrow(ErrorBalanceo);
    expect(() => balancear('NaCl -> Na + Cl2 + O2')).toThrow(/positivos|imposible|balancear/);
    try {
      balancear('H2 + O2 -> H2O + H2O2');
    } catch (e) {
      expect((e as ErrorBalanceo).tipo).toBe('multiples');
    }
  });

  it('da el sistema algebraico y la comprobación por tanteo', () => {
    const r = balancear('Fe + O2 -> Fe2O3');
    expect(r.sistema).toEqual(['Fe: a = 2c', 'O: 2b = 3c']);
    expect(r.solucionRacional.map(String)).toEqual(['1', '3/4', '1/2']);
    expect(pasosTanteo(r)[0]).toMatch(/^Fe \(metal\)/);
    expect(ecuacionTexto(r)).toBe('4 Fe + 3 O2 -> 2 Fe2O3');
  });

  it('acepta flechas y notaciones variadas', () => {
    expect(balancear('CH4+O2=CO2+H2O').coeficientes.map(Number)).toEqual([1, 2, 1, 2]);
    expect(balancear('2 H2 + O2 → H2O(l)').coeficientes.map(Number)).toEqual([2, 1, 2]);
    expect(() => balancear('H2 + O2')).toThrow(/flecha/);
  });
});

describe('números de oxidación', () => {
  const eo = (f: string, el: string) => estadosOxidacion(f).estados.get(el)!.toString();
  it.each([
    ['KMnO4', 'Mn', '7'],
    ['K2Cr2O7', 'Cr', '6'],
    ['H2SO4', 'S', '6'],
    ['SO3^2-', 'S', '4'],
    ['NH4^+', 'N', '-3'],
    ['NO3^-', 'N', '5'],
    ['H2O2', 'O', '-1'],
    ['Na2O2', 'O', '-1'],
    ['NaH', 'H', '-1'],
    ['Fe3O4', 'Fe', '8/3'],
    ['FeSO4', 'Fe', '2'],
    ['Fe2(SO4)3', 'Fe', '3'],
    ['CuSO4', 'S', '6'],
    ['OF2', 'O', '2'],
    ['Cl2', 'Cl', '0'],
    ['C2O4^2-', 'C', '3'],
    ['CH3OH', 'C', '-2'],
    ['H2S', 'S', '-2'],
    ['Cr2O7^2-', 'Cr', '6'],
    ['SnS2', 'Sn', '4'],
  ])('%s: %s = %s', (f, el, v) => expect(eo(f, el)).toBe(v));
});

describe('redox', () => {
  it('identifica agentes oxidante y reductor y los electrones transferidos', () => {
    const r = balancear('KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O');
    const a = analizarRedox(r);
    expect(a.esRedox).toBe(true);
    expect(a.agenteOxidante).toEqual(['KMnO4']);
    expect(a.agenteReductor).toEqual(['HCl']);
    expect(a.electronesTransferidos).toBe(10n);
    expect(analizarRedox(balancear('HCl + NaOH -> NaCl + H2O')).esRedox).toBe(false);
  });

  const ION_ELECTRON: [string, 'acido' | 'basico', string][] = [
    ['MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+', 'acido', 'MnO4^- + 5 Fe^2+ + 8 H^+ -> Mn^2+ + 5 Fe^3+ + 4 H2O'],
    ['Cr2O7^2- + Fe^2+ -> Cr^3+ + Fe^3+', 'acido', 'Cr2O7^2- + 6 Fe^2+ + 14 H^+ -> 2 Cr^3+ + 6 Fe^3+ + 7 H2O'],
    ['Cu + NO3^- -> Cu^2+ + NO', 'acido', '3 Cu + 2 NO3^- + 8 H^+ -> 3 Cu^2+ + 2 NO + 4 H2O'],
    ['MnO4^- + I^- -> MnO2 + I2', 'basico', '2 MnO4^- + 6 I^- + 4 H2O -> 2 MnO2 + 3 I2 + 8 OH^-'],
    ['Cl2 -> Cl^- + ClO3^-', 'basico', '3 Cl2 + 6 OH^- -> 5 Cl^- + ClO3^- + 3 H2O'],
    ['CrO4^2- + Fe(OH)2 -> Cr(OH)3 + Fe(OH)3', 'basico', 'CrO4^2- + 3 Fe(OH)2 + 4 H2O -> Cr(OH)3 + 3 Fe(OH)3 + 2 OH^-'],
    ['MnO4^- + SO3^2- -> MnO2 + SO4^2-', 'basico', '2 MnO4^- + 3 SO3^2- + H2O -> 2 MnO2 + 3 SO4^2- + 2 OH^-'],
    ['H2O2 + MnO4^- -> O2 + Mn^2+', 'acido', '5 H2O2 + 2 MnO4^- + 6 H^+ -> 5 O2 + 2 Mn^2+ + 8 H2O'],
  ];
  it.each(ION_ELECTRON)('ion-electrón: %s (medio %s)', (ec, medio, esperado) => {
    const r = balancearIonElectron(ec, medio);
    expect(verificarBalance(r.final)).toBe(true);
    // Mismo conjunto de términos, sin importar el orden
    const normal = (s: string) => s.split(' -> ').map((l) => l.split(' + ').sort().join(' + ')).join(' -> ');
    expect(normal(ecuacionTexto(r.final))).toBe(normal(esperado));
    expect(r.pasos.length).toBeGreaterThanOrEqual(5);
  });
});
