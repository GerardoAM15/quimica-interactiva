import { describe, expect, it } from 'vitest';
import {
  bloque,
  configuracionIon,
  configuracionMoeller,
  configuracionReal,
  diagramaSubnivel,
  electronesDesapareados,
  electronesPorNivel,
  electronesValencia,
  esExcepcion,
  formatearConfiguracion,
  mismasConfiguraciones,
  notacionKernel,
  numerosCuanticosUltimoElectron,
  ORDEN_MOELLER,
  parsearConfiguracion,
  totalElectrones,
  validarNumerosCuanticos,
} from '../configuracion';
import { ELEMENTOS, elementoPorSimbolo } from '../elements';
import { registrarValidacion } from './validacion';

const z = (s: string) => elementoPorSimbolo(s)!.z;
const texto = (conf: ReturnType<typeof configuracionReal>) => formatearConfiguracion(conf, 'texto');

describe('regla de Moeller', () => {
  it('sigue el orden de las diagonales', () => {
    expect(ORDEN_MOELLER.map(({ n, l }) => `${n}${'spdf'[l]}`).join(' ')).toBe(
      '1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p',
    );
  });

  it('distribuye ejemplos clásicos', () => {
    expect(texto(configuracionMoeller(1))).toBe('1s1');
    expect(texto(configuracionMoeller(8))).toBe('1s2 2s2 2p4');
    expect(texto(configuracionMoeller(26))).toBe('1s2 2s2 2p6 3s2 3p6 4s2 3d6');
    expect(texto(configuracionMoeller(35))).toBe('1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p5');
    expect(texto(configuracionMoeller(24))).toBe('1s2 2s2 2p6 3s2 3p6 4s2 3d4'); // sin excepción
  });

  it('conserva el número de electrones para todos los elementos', () => {
    for (let i = 1; i <= 118; i++) {
      expect(totalElectrones(configuracionMoeller(i))).toBe(i);
      expect(totalElectrones(configuracionReal(i))).toBe(i);
    }
  });
});

describe('configuración real vs PubChem', () => {
  it('coincide con PubChem en todos los elementos, salvo diferencias documentadas', () => {
    // Lr: PubChem lista 7s² 6d¹; la medición de 2015 (Sato et al., Nature 520, 209) indica 7s² 7p¹.
    const DIFERENCIAS_DOCUMENTADAS = new Set(['Lr']);
    const filas = [];
    const discrepancias: string[] = [];
    let total = 0;
    let iguales = 0;
    for (const el of ELEMENTOS) {
      if (!el.configuracionPubChem) continue;
      const pub = parsearConfiguracion(el.configuracionPubChem);
      const nuestra = configuracionReal(el.z);
      const coincide = mismasConfiguraciones(pub, nuestra);
      if (!coincide && !DIFERENCIAS_DOCUMENTADAS.has(el.simbolo)) {
        discrepancias.push(`${el.simbolo}: PubChem ${el.configuracionPubChem} | calculada ${notacionKernel(nuestra, 'texto').texto}`);
      }
      // En la tabla se listan las excepciones a Moeller y las diferencias con PubChem
      if (!coincide || esExcepcion(el.z)) {
        filas.push({
          caso: `${el.simbolo} (Z = ${el.z})`,
          referencia: el.configuracionPubChem,
          calculado: coincide ? el.configuracionPubChem : notacionKernel(nuestra, 'texto').texto,
          fuente: coincide ? 'PubChem' : 'PubChem (diferencia documentada)',
        });
      }
      total++;
      if (coincide) iguales++;
    }
    expect(discrepancias).toEqual([]);
    registrarValidacion(
      3,
      'Configuración electrónica',
      filas,
      `Coinciden con PubChem ${iguales} de ${total} elementos. Se listan solo las excepciones a la regla de Moeller y las diferencias documentadas; el resto coincide exactamente.`,
    );
  });

  it('reproduce las excepciones típicas de examen', () => {
    expect(notacionKernel(configuracionReal(z('Cr')), 'texto').texto).toBe('[Ar] 4s1 3d5');
    expect(notacionKernel(configuracionReal(z('Cu')), 'texto').texto).toBe('[Ar] 4s1 3d10');
    expect(notacionKernel(configuracionReal(z('Ag')), 'texto').texto).toBe('[Kr] 5s1 4d10');
    expect(notacionKernel(configuracionReal(z('Pd')), 'texto').texto).toBe('[Kr] 4d10');
    expect(notacionKernel(configuracionReal(z('Au')), 'texto').texto).toBe('[Xe] 6s1 4f14 5d10');
  });
});

describe('notación de Kernel', () => {
  it('usa el gas noble anterior', () => {
    expect(notacionKernel(configuracionReal(z('Fe')), 'texto').texto).toBe('[Ar] 4s2 3d6');
    expect(notacionKernel(configuracionReal(z('Na')), 'texto').texto).toBe('[Ne] 3s1');
    expect(notacionKernel(configuracionReal(z('Pb')), 'texto').texto).toBe('[Xe] 6s2 4f14 5d10 6p2');
    expect(notacionKernel(configuracionReal(z('H')), 'texto').kernel).toBeNull();
    // Un gas noble se expresa con el gas noble anterior: Ar = [Ne] 3s² 3p⁶
    expect(notacionKernel(configuracionReal(z('Ar')), 'texto').texto).toBe('[Ne] 3s2 3p6');
  });

  it('formatea con superíndices y LaTeX', () => {
    expect(formatearConfiguracion(configuracionReal(8))).toBe('1s² 2s² 2p⁴');
    expect(formatearConfiguracion(configuracionReal(8), 'latex')).toBe('1s^{2}\\,2s^{2}\\,2p^{4}');
  });
});

describe('iones', () => {
  it('los cationes pierden primero los electrones del nivel más externo', () => {
    expect(notacionKernel(configuracionIon(z('Fe'), 2), 'texto').texto).toBe('[Ar] 3d6');
    expect(notacionKernel(configuracionIon(z('Fe'), 3), 'texto').texto).toBe('[Ar] 3d5');
    expect(notacionKernel(configuracionIon(z('Cu'), 1), 'texto').texto).toBe('[Ar] 3d10');
    expect(notacionKernel(configuracionIon(z('Cr'), 3), 'texto').texto).toBe('[Ar] 3d3');
    expect(notacionKernel(configuracionIon(z('Zn'), 2), 'texto').texto).toBe('[Ar] 3d10');
    expect(texto(configuracionIon(z('Na'), 1))).toBe('1s2 2s2 2p6');
  });

  it('los aniones ganan electrones según Moeller (isoelectrónicos con el gas noble)', () => {
    expect(mismasConfiguraciones(configuracionIon(z('Cl'), -1), configuracionReal(z('Ar')))).toBe(true);
    expect(mismasConfiguraciones(configuracionIon(z('O'), -2), configuracionReal(z('Ne')))).toBe(true);
    expect(mismasConfiguraciones(configuracionIon(z('N'), -3), configuracionReal(z('Ne')))).toBe(true);
  });

  it('no permite cargas mayores que Z', () => {
    expect(() => configuracionIon(1, 2)).toThrow();
  });
});

describe('Hund, Pauli y propiedades', () => {
  it('llena con Hund: primero ↑ en todos los orbitales', () => {
    expect(diagramaSubnivel(1, 4).map((o) => o.electrones.join(''))).toEqual(['↑↓', '↑', '↑']);
    expect(diagramaSubnivel(2, 6).map((o) => o.electrones.join(''))).toEqual(['↑↓', '↑', '↑', '↑', '↑']);
    expect(diagramaSubnivel(0, 2).map((o) => o.m)).toEqual([0]);
  });

  it('cuenta electrones desapareados', () => {
    const d = (s: string) => electronesDesapareados(configuracionReal(z(s)));
    expect(d('H')).toBe(1);
    expect(d('He')).toBe(0);
    expect(d('C')).toBe(2);
    expect(d('N')).toBe(3);
    expect(d('O')).toBe(2);
    expect(d('Fe')).toBe(4);
    expect(d('Cr')).toBe(6); // 4s¹ 3d⁵
    expect(d('Cu')).toBe(1);
    expect(d('Zn')).toBe(0);
    expect(electronesDesapareados(configuracionIon(z('Fe'), 3))).toBe(5);
  });

  it('distribuye por capas (modelo de Bohr)', () => {
    expect(electronesPorNivel(configuracionReal(z('Na')))).toEqual([2, 8, 1]);
    expect(electronesPorNivel(configuracionReal(z('Fe')))).toEqual([2, 8, 14, 2]);
    expect(electronesPorNivel(configuracionReal(z('Ca')))).toEqual([2, 8, 8, 2]);
  });

  it('identifica el bloque por el electrón diferenciador', () => {
    expect(bloque(z('Na'))).toBe('s');
    expect(bloque(z('He'))).toBe('s');
    expect(bloque(z('Cl'))).toBe('p');
    expect(bloque(z('Fe'))).toBe('d');
    expect(bloque(z('Ce'))).toBe('f');
    expect(bloque(z('U'))).toBe('f');
  });

  it('cuenta electrones de valencia', () => {
    expect(electronesValencia(z('Na'))).toBe(1);
    expect(electronesValencia(z('Cl'))).toBe(7);
    expect(electronesValencia(z('Ar'))).toBe(8);
    expect(electronesValencia(z('Fe'))).toBe(8);
  });
});

describe('números cuánticos', () => {
  // Convención: mₗ de −l a +l, primer electrón de cada orbital con mₛ = +1/2
  const casos: [string, [number, number, number, number]][] = [
    ['H', [1, 0, 0, 0.5]],
    ['He', [1, 0, 0, -0.5]],
    ['C', [2, 1, 0, 0.5]], // 2p²: ↑ ↑ _ → segundo electrón en mₗ = 0
    ['N', [2, 1, 1, 0.5]],
    ['O', [2, 1, -1, -0.5]],
    ['Na', [3, 0, 0, 0.5]],
    ['Cl', [3, 1, 0, -0.5]],
    ['Fe', [3, 2, -2, -0.5]], // 3d⁶
    ['Zn', [3, 2, 2, -0.5]], // 3d¹⁰
    ['Br', [4, 1, 0, -0.5]],
  ];
  it.each(casos)('último electrón de %s = %j', (s, [n, l, ml, ms]) => {
    expect(numerosCuanticosUltimoElectron(z(s))).toEqual({ n, l, ml, ms });
  });

  it('con la convención opuesta cambia solo el signo de mₛ', () => {
    expect(numerosCuanticosUltimoElectron(z('Fe'), { convencion: 'arriba-' })).toEqual({ n: 3, l: 2, ml: -2, ms: 0.5 });
  });

  it('con excepciones, el Cr termina en 3d⁵', () => {
    expect(numerosCuanticosUltimoElectron(z('Cr'), { usarExcepciones: true })).toEqual({ n: 3, l: 2, ml: 2, ms: 0.5 });
  });

  it('valida combinaciones', () => {
    expect(validarNumerosCuanticos(2, 1, 0, 0.5).valido).toBe(true);
    expect(validarNumerosCuanticos(2, 2, 0, 0.5).valido).toBe(false);
    expect(validarNumerosCuanticos(3, 1, 2, 0.5).valido).toBe(false);
    expect(validarNumerosCuanticos(1, 0, 0, 1).valido).toBe(false);
    expect(validarNumerosCuanticos(0, 0, 0, 0.5).valido).toBe(false);
  });
});
