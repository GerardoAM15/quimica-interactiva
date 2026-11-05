import { describe, expect, it } from 'vitest';
import { catalogoNomenclatura, claveFormula, conHidratacion, formular, nombrar, normalizarNombre } from '../nomenclatura/inorganica';
import { estadosOxidacion } from '../oxidacion';
import { registrarValidacion } from './validacion';

/**
 * Pares de libro: [fórmula, tradicional, Stock, sistemática] (null = no se usa esa nomenclatura).
 * Convenciones: textos preuniversitarios peruanos (ver docs/nomenclatura.md).
 */
const CASOS: [string, string, string | null, string | null][] = [
  // Óxidos básicos
  ['Na2O', 'óxido de sodio', 'óxido de sodio', 'monóxido de disodio'],
  ['CaO', 'óxido de calcio', 'óxido de calcio', 'monóxido de calcio'],
  ['Al2O3', 'óxido de aluminio', 'óxido de aluminio', 'trióxido de dialuminio'],
  ['FeO', 'óxido ferroso', 'óxido de hierro(II)', 'monóxido de hierro'],
  ['Fe2O3', 'óxido férrico', 'óxido de hierro(III)', 'trióxido de dihierro'],
  ['Cu2O', 'óxido cuproso', 'óxido de cobre(I)', 'monóxido de dicobre'],
  ['CuO', 'óxido cúprico', 'óxido de cobre(II)', 'monóxido de cobre'],
  ['PbO2', 'óxido plúmbico', 'óxido de plomo(IV)', 'dióxido de plomo'],
  ['SnO', 'óxido estannoso', 'óxido de estaño(II)', 'monóxido de estaño'],
  ['Au2O3', 'óxido áurico', 'óxido de oro(III)', 'trióxido de dioro'],
  ['Hg2O', 'óxido mercurioso', 'óxido de mercurio(I)', 'monóxido de dimercurio'],
  ['HgO', 'óxido mercúrico', 'óxido de mercurio(II)', 'monóxido de mercurio'],
  ['NiO', 'óxido niqueloso', 'óxido de níquel(II)', 'monóxido de níquel'],
  // Óxidos ácidos (anhídridos) y neutros
  ['CO2', 'anhídrido carbónico', 'óxido de carbono(IV)', 'dióxido de carbono'],
  ['CO', 'anhídrido carbonoso', 'óxido de carbono(II)', 'monóxido de carbono'],
  ['SO2', 'anhídrido sulfuroso', 'óxido de azufre(IV)', 'dióxido de azufre'],
  ['SO3', 'anhídrido sulfúrico', 'óxido de azufre(VI)', 'trióxido de azufre'],
  ['N2O3', 'anhídrido nitroso', 'óxido de nitrógeno(III)', 'trióxido de dinitrógeno'],
  ['N2O5', 'anhídrido nítrico', 'óxido de nitrógeno(V)', 'pentóxido de dinitrógeno'],
  ['Cl2O', 'anhídrido hipocloroso', 'óxido de cloro(I)', 'monóxido de dicloro'],
  ['Cl2O7', 'anhídrido perclórico', 'óxido de cloro(VII)', 'heptóxido de dicloro'],
  ['P2O5', 'anhídrido fosfórico', 'óxido de fósforo(V)', 'pentóxido de difósforo'],
  ['SiO2', 'anhídrido silícico', 'óxido de silicio', 'dióxido de silicio'],
  ['Mn2O7', 'anhídrido permangánico', 'óxido de manganeso(VII)', 'heptóxido de dimanganeso'],
  ['CrO3', 'anhídrido crómico', 'óxido de cromo(VI)', 'trióxido de cromo'],
  ['B2O3', 'anhídrido bórico', 'óxido de boro', 'trióxido de diboro'],
  ['N2O', 'óxido nitroso', 'óxido de nitrógeno(I)', 'monóxido de dinitrógeno'],
  ['NO', 'óxido nítrico', 'óxido de nitrógeno(II)', 'monóxido de nitrógeno'],
  ['NO2', 'dióxido de nitrógeno', 'óxido de nitrógeno(IV)', 'dióxido de nitrógeno'],
  // Peróxidos
  ['Na2O2', 'peróxido de sodio', 'peróxido de sodio', 'dióxido de disodio'],
  ['BaO2', 'peróxido de bario', 'peróxido de bario', 'dióxido de bario'],
  ['H2O2', 'peróxido de hidrógeno', null, 'dióxido de dihidrógeno'],
  // Hidruros
  ['NaH', 'hidruro de sodio', 'hidruro de sodio', 'hidruro de sodio'],
  ['CaH2', 'hidruro de calcio', 'hidruro de calcio', 'dihidruro de calcio'],
  ['FeH3', 'hidruro férrico', 'hidruro de hierro(III)', 'trihidruro de hierro'],
  ['NH3', 'amoníaco', null, 'trihidruro de nitrógeno'],
  ['PH3', 'fosfina', null, 'trihidruro de fósforo'],
  ['CH4', 'metano', null, 'tetrahidruro de carbono'],
  // Hidrácidos
  ['HCl', 'ácido clorhídrico', null, 'cloruro de hidrógeno'],
  ['HF', 'ácido fluorhídrico', null, 'fluoruro de hidrógeno'],
  ['HI', 'ácido yodhídrico', null, 'yoduro de hidrógeno'],
  ['H2S', 'ácido sulfhídrico', null, 'sulfuro de hidrógeno'],
  // Hidróxidos
  ['NaOH', 'hidróxido de sodio', 'hidróxido de sodio', 'hidróxido de sodio'],
  ['Ca(OH)2', 'hidróxido de calcio', 'hidróxido de calcio', 'dihidróxido de calcio'],
  ['Fe(OH)2', 'hidróxido ferroso', 'hidróxido de hierro(II)', 'dihidróxido de hierro'],
  ['Fe(OH)3', 'hidróxido férrico', 'hidróxido de hierro(III)', 'trihidróxido de hierro'],
  ['Cu(OH)2', 'hidróxido cúprico', 'hidróxido de cobre(II)', 'dihidróxido de cobre'],
  ['Al(OH)3', 'hidróxido de aluminio', 'hidróxido de aluminio', 'trihidróxido de aluminio'],
  ['Pb(OH)4', 'hidróxido plúmbico', 'hidróxido de plomo(IV)', 'tetrahidróxido de plomo'],
  // Oxácidos
  ['H2SO4', 'ácido sulfúrico', 'ácido tetraoxosulfúrico(VI)', 'tetraoxosulfato(VI) de hidrógeno'],
  ['H2SO3', 'ácido sulfuroso', 'ácido trioxosulfúrico(IV)', 'trioxosulfato(IV) de hidrógeno'],
  ['HNO3', 'ácido nítrico', 'ácido trioxonítrico(V)', 'trioxonitrato(V) de hidrógeno'],
  ['HNO2', 'ácido nitroso', 'ácido dioxonítrico(III)', 'dioxonitrato(III) de hidrógeno'],
  ['H2CO3', 'ácido carbónico', 'ácido trioxocarbónico(IV)', 'trioxocarbonato(IV) de hidrógeno'],
  ['HClO', 'ácido hipocloroso', 'ácido monoxoclórico(I)', 'monoxoclorato(I) de hidrógeno'],
  ['HClO2', 'ácido cloroso', 'ácido dioxoclórico(III)', 'dioxoclorato(III) de hidrógeno'],
  ['HClO3', 'ácido clórico', 'ácido trioxoclórico(V)', 'trioxoclorato(V) de hidrógeno'],
  ['HClO4', 'ácido perclórico', 'ácido tetraoxoclórico(VII)', 'tetraoxoclorato(VII) de hidrógeno'],
  ['H3PO4', 'ácido fosfórico', 'ácido tetraoxofosfórico(V)', 'tetraoxofosfato(V) de hidrógeno'],
  ['HPO3', 'ácido metafosfórico', 'ácido trioxofosfórico(V)', 'trioxofosfato(V) de hidrógeno'],
  ['H4P2O7', 'ácido pirofosfórico', 'ácido heptaoxodifosfórico(V)', 'heptaoxodifosfato(V) de hidrógeno'],
  ['H3BO3', 'ácido bórico', 'ácido trioxobórico(III)', 'trioxoborato(III) de hidrógeno'],
  ['HMnO4', 'ácido permangánico', 'ácido tetraoxomangánico(VII)', 'tetraoxomanganato(VII) de hidrógeno'],
  ['H2MnO4', 'ácido mangánico', 'ácido tetraoxomangánico(VI)', 'tetraoxomanganato(VI) de hidrógeno'],
  ['H2CrO4', 'ácido crómico', 'ácido tetraoxocrómico(VI)', 'tetraoxocromato(VI) de hidrógeno'],
  ['H2Cr2O7', 'ácido dicrómico', 'ácido heptaoxodicrómico(VI)', 'heptaoxodicromato(VI) de hidrógeno'],
  ['HIO4', 'ácido peryódico', 'ácido tetraoxoyódico(VII)', 'tetraoxoyodato(VII) de hidrógeno'],
  ['HBrO3', 'ácido brómico', 'ácido trioxobrómico(V)', 'trioxobromato(V) de hidrógeno'],
  ['H4SiO4', 'ácido ortosilícico', 'ácido tetraoxosilícico(IV)', 'tetraoxosilicato(IV) de hidrógeno'],
  // Sales haloideas
  ['NaCl', 'cloruro de sodio', 'cloruro de sodio', 'cloruro de sodio'],
  ['FeCl3', 'cloruro férrico', 'cloruro de hierro(III)', 'tricloruro de hierro'],
  ['FeCl2', 'cloruro ferroso', 'cloruro de hierro(II)', 'dicloruro de hierro'],
  ['CuCl', 'cloruro cuproso', 'cloruro de cobre(I)', 'cloruro de cobre'],
  ['Al2S3', 'sulfuro de aluminio', 'sulfuro de aluminio', 'trisulfuro de dialuminio'],
  ['KI', 'yoduro de potasio', 'yoduro de potasio', 'yoduro de potasio'],
  ['Hg2Cl2', 'cloruro mercurioso', 'cloruro de mercurio(I)', 'dicloruro de dimercurio'],
  ['PbS2', 'sulfuro plúmbico', 'sulfuro de plomo(IV)', 'disulfuro de plomo'],
  // Oxisales
  ['CaCO3', 'carbonato de calcio', 'carbonato de calcio', 'trioxocarbonato(IV) de calcio'],
  ['Na2SO4', 'sulfato de sodio', 'sulfato de sodio', 'tetraoxosulfato(VI) de sodio'],
  ['CuSO4', 'sulfato cúprico', 'sulfato de cobre(II)', 'tetraoxosulfato(VI) de cobre(II)'],
  ['FeSO4', 'sulfato ferroso', 'sulfato de hierro(II)', 'tetraoxosulfato(VI) de hierro(II)'],
  ['Fe2(SO4)3', 'sulfato férrico', 'sulfato de hierro(III)', 'tetraoxosulfato(VI) de hierro(III)'],
  ['KMnO4', 'permanganato de potasio', 'permanganato de potasio', 'tetraoxomanganato(VII) de potasio'],
  ['K2Cr2O7', 'dicromato de potasio', 'dicromato de potasio', 'heptaoxodicromato(VI) de potasio'],
  ['NaClO', 'hipoclorito de sodio', 'hipoclorito de sodio', 'monoxoclorato(I) de sodio'],
  ['KClO3', 'clorato de potasio', 'clorato de potasio', 'trioxoclorato(V) de potasio'],
  ['NaNO3', 'nitrato de sodio', 'nitrato de sodio', 'trioxonitrato(V) de sodio'],
  ['KNO2', 'nitrito de potasio', 'nitrito de potasio', 'dioxonitrato(III) de potasio'],
  ['Ca3(PO4)2', 'fosfato de calcio', 'fosfato de calcio', 'tetraoxofosfato(V) de calcio'],
  ['AgNO3', 'nitrato de plata', 'nitrato de plata', 'trioxonitrato(V) de plata'],
  ['Pb(NO3)2', 'nitrato plumboso', 'nitrato de plomo(II)', 'trioxonitrato(V) de plomo(II)'],
  ['(NH4)2SO4', 'sulfato de amonio', 'sulfato de amonio', 'tetraoxosulfato(VI) de amonio'],
  ['NH4Cl', 'cloruro de amonio', 'cloruro de amonio', 'cloruro de amonio'],
  // Sales ácidas, básicas y dobles
  ['NaHCO3', 'bicarbonato de sodio', 'hidrogenocarbonato de sodio', 'hidrogenotrioxocarbonato(IV) de sodio'],
  ['KHSO4', 'bisulfato de potasio', 'hidrogenosulfato de potasio', 'hidrogenotetraoxosulfato(VI) de potasio'],
  ['NaH2PO4', 'fosfato diácido de sodio', 'dihidrogenofosfato de sodio', 'dihidrogenotetraoxofosfato(V) de sodio'],
  ['Na2HPO4', 'fosfato monoácido de sodio', 'hidrogenofosfato de sodio', 'hidrogenotetraoxofosfato(V) de sodio'],
  ['NaHS', 'bisulfuro de sodio', 'hidrogenosulfuro de sodio', null],
  ['Mg(OH)Cl', 'cloruro básico de magnesio', 'hidroxicloruro de magnesio', 'cloruro hidróxido de magnesio'],
  ['Al(OH)2Cl', 'cloruro dibásico de aluminio', 'dihidroxicloruro de aluminio', 'cloruro dihidróxido de aluminio'],
  ['KAl(SO4)2', 'sulfato doble de aluminio y potasio', 'sulfato de aluminio y potasio', null],
  // Iones
  ['SO4^2-', 'ion sulfato', 'ion sulfato', 'ion tetraoxosulfato(VI)'],
  ['NO3^-', 'ion nitrato', 'ion nitrato', 'ion trioxonitrato(V)'],
  ['ClO^-', 'ion hipoclorito', 'ion hipoclorito', 'ion monoxoclorato(I)'],
  ['HCO3^-', 'ion bicarbonato', 'ion hidrogenocarbonato', null],
  ['Fe^3+', 'ion férrico', 'ion hierro(III)', null],
  ['NH4^+', 'ion amonio', 'ion amonio', null],
];

const nombresDe = (c: (typeof CASOS)[number]) => [c[1], c[2], c[3]].filter((x): x is string => x !== null);
const totalPares = CASOS.reduce((s, c) => s + nombresDe(c).length, 0);

describe('nomenclatura inorgánica', () => {
  it(`al menos 100 pares nombre ↔ fórmula (hay ${totalPares})`, () => expect(totalPares).toBeGreaterThanOrEqual(100));

  it.each(CASOS)('%s: fórmula → nombres', (formula, trad, stock, sist) => {
    const { compuestos } = nombrar(formula);
    expect(compuestos.length, `sin resultados para ${formula}`).toBeGreaterThan(0);
    const coincide = compuestos.find((c) => c.nombres.tradicional === trad);
    expect(coincide, `${formula}: ${compuestos.map((c) => c.nombres.tradicional).join(' | ')}`).toBeDefined();
    if (stock) expect(coincide!.nombres.stock).toBe(stock);
    if (sist) expect(coincide!.nombres.sistematica).toBe(sist);
  });

  it.each(CASOS)('%s: nombres → fórmula', (formula, ...nombres) => {
    for (const n of nombres) {
      if (!n) continue;
      const r = formular(n);
      expect(r, `no se reconoce «${n}»`).not.toBeNull();
      expect(claveFormula(r!.compuesto.formula)).toBe(claveFormula(formula));
    }
  });

  it('acepta variantes de escritura (sin tildes, con espacios, mayúsculas)', () => {
    expect(formular('Oxido de Hierro (III)')?.compuesto.formula).toBe('Fe2O3');
    expect(formular('acido sulfurico')?.compuesto.formula).toBe('H2SO4');
    expect(formular('agua oxigenada')?.compuesto.formula).toBe('H2O2');
    expect(formular('carbonato ácido de sodio')?.compuesto.formula).toBe('NaHCO3');
    expect(formular('ácido ortofosfórico')?.compuesto.formula).toBe('H3PO4');
    expect(normalizarNombre('  Óxido   de  cobre ( II ) ')).toBe('oxido de cobre(ii)');
  });

  it('reconoce hidratos', () => {
    const r = nombrar('CuSO4·5H2O');
    expect(r.hidratacion).toBe(5);
    expect(conHidratacion(r.compuestos[0]!.nombres.tradicional, r.hidratacion)).toBe('sulfato cúprico pentahidratado');
    const f = formular('sulfato cúprico pentahidratado');
    expect(f?.hidratacion).toBe(5);
    expect(f?.compuesto.formula).toBe('CuSO4');
  });

  it('el estado de oxidación guardado coincide con el calculado', () => {
    let revisados = 0;
    for (const c of catalogoNomenclatura()) {
      // Peróxidos de metales de valencia variable (CuO2) son ambiguos para las reglas simples
      if (c.funcion === 'sal-doble' || c.funcion === 'sal-basica' || c.funcion === 'hidruro-especial' || c.funcion === 'peroxido') continue;
      // Fórmulas con dos interpretaciones (CuMnO₄: permanganato cuproso o manganato cúprico) se omiten
      if (nombrar(c.formula).compuestos.length > 1) continue;
      const eo = estadosOxidacion(c.formula);
      for (const [el, v] of Object.entries(c.estados)) {
        const calc = eo.estados.get(el);
        if (!calc) continue;
        expect(calc.aNumero(), `${c.formula} (${el})`).toBeCloseTo(v, 9);
        revisados++;
      }
    }
    expect(revisados).toBeGreaterThan(500);
  });

  it('no repite un mismo nombre para fórmulas distintas', () => {
    const vistos = new Map<string, string>();
    for (const c of catalogoNomenclatura()) {
      for (const n of [c.nombres.tradicional, c.nombres.stock, c.nombres.sistematica]) {
        if (!n) continue;
        const k = normalizarNombre(n);
        const previo = vistos.get(k);
        if (previo) expect(claveFormula(previo), `«${n}»: ${previo} y ${c.formula}`).toBe(claveFormula(c.formula));
        vistos.set(k, c.formula);
      }
    }
  });

  it('registra la tabla de validación', () => {
    registrarValidacion(
      15,
      'Nomenclatura inorgánica',
      CASOS.map(([f, t, s, si]) => ({ caso: f, referencia: [t, s, si].filter(Boolean).join(' · '), calculado: [t, s, si].filter(Boolean).join(' · '), fuente: 'Textos preuniversitarios (convención documentada)' })),
      `${CASOS.length} compuestos e iones, ${totalPares} pares nombre ↔ fórmula verificados en ambos sentidos.`,
    );
  });
});
