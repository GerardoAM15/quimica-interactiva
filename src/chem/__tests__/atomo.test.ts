import { describe, expect, it } from 'vitest';
import {
  anguloDispersion,
  colorDeLongitud,
  distanciaMinima,
  energiaBohr,
  isotoposDe,
  limiteSerie,
  lineasSerie,
  masaAtomicaPromedio,
  nombreColor,
  particulas,
  radioBohr,
  regionEspectral,
  transicion,
  velocidadBohr,
} from '../atomo';
import { ELEMENTOS, elementoPorSimbolo } from '../elements';
import { errorPorcentual, registrarValidacion } from './validacion';

/** Índice de refracción del aire (15 °C, 101 325 Pa), aproximación de Edlén para λ visible. */
const nAire = (nm: number) => {
  const s2 = (1000 / nm) ** 2; // (1/λ en µm⁻¹)²
  return 1 + 1e-8 * (8342.54 + 2406147 / (130 - s2) + 15998 / (38.9 - s2));
};

describe('modelo de Bohr', () => {
  it('rₙ = a₀·n²/Z', () => {
    expect(radioBohr(1)).toBeCloseTo(52.918, 3);
    expect(radioBohr(2)).toBeCloseTo(4 * 52.918, 2);
    expect(radioBohr(1, 2)).toBeCloseTo(26.459, 3); // He⁺
  });

  it('Eₙ = −13,6 eV·Z²/n²', () => {
    expect(energiaBohr(1)).toBeCloseTo(-13.598, 3);
    expect(energiaBohr(1, 1, { masaReducida: false })).toBeCloseTo(-13.6057, 4);
    expect(energiaBohr(2)).toBeCloseTo(-3.3996, 3);
    expect(energiaBohr(1, 2, { masaReducida: false })).toBeCloseTo(-54.42, 2); // He⁺
  });

  it('la energía de ionización del H coincide con el valor experimental de PubChem', () => {
    const ei = elementoPorSimbolo('H')!.energiaIonizacion!;
    expect(Math.abs(-energiaBohr(1) - ei)).toBeLessThan(0.001);
  });

  it('v₁ ≈ 2,19 × 10⁶ m/s (≈ c/137)', () => {
    expect(velocidadBohr(1) / 1e6).toBeCloseTo(2.188, 3);
  });
});

describe('espectro del hidrógeno (Rydberg)', () => {
  // Longitudes de onda en el aire de las líneas de Balmer y Lyman-α en el vacío
  // (NIST Atomic Spectra Database, promedio ponderado de la estructura fina)
  const balmerAire: [number, number, string][] = [
    [3, 656.279, 'Hα'],
    [4, 486.135, 'Hβ'],
    [5, 434.047, 'Hγ'],
    [6, 410.174, 'Hδ'],
  ];

  it('reproduce las líneas de Balmer (en el aire) con error < 0,01 %', () => {
    const filas = balmerAire.map(([ni, ref, nombre]) => {
      const t = transicion(ni, 2);
      expect(t.serie).toBe('Balmer');
      expect(t.tipo).toBe('emision');
      const enAire = t.longitudOnda / nAire(t.longitudOnda);
      expect(errorPorcentual(ref, enAire)).toBeLessThan(0.01);
      return { caso: `${nombre} (${ni} → 2), en el aire`, referencia: ref, calculado: enAire, unidad: 'nm', fuente: 'NIST ASD' };
    });
    const lymanAlfa = transicion(2, 1).longitudOnda;
    expect(errorPorcentual(121.567, lymanAlfa)).toBeLessThan(0.01);
    filas.push({ caso: 'Lyman-α (2 → 1), en el vacío', referencia: 121.567, calculado: lymanAlfa, unidad: 'nm', fuente: 'NIST ASD' });
    filas.push({
      caso: 'Energía de ionización del H (−E₁)',
      referencia: elementoPorSimbolo('H')!.energiaIonizacion!,
      calculado: -energiaBohr(1),
      unidad: 'eV',
      fuente: 'PubChem',
    });
    registrarValidacion(4, 'Espectro del hidrógeno', filas, 'λ calculada con R_H (masa reducida) y convertida al aire con la fórmula de Edlén.');
  });

  it('clasifica series y regiones', () => {
    expect(transicion(2, 1).serie).toBe('Lyman');
    expect(transicion(5, 3).serie).toBe('Paschen');
    expect(transicion(1, 3).tipo).toBe('absorcion');
    expect(regionEspectral(transicion(2, 1).longitudOnda)).toBe('ultravioleta');
    expect(regionEspectral(transicion(3, 2).longitudOnda)).toBe('visible');
    expect(regionEspectral(transicion(4, 3).longitudOnda)).toBe('infrarrojo');
    expect(nombreColor(656)).toBe('rojo');
    expect(nombreColor(486)).toBe('cian');
    expect(nombreColor(410)).toBe('violeta');
    expect(nombreColor(200)).toBeNull();
  });

  it('el límite de la serie de Balmer es ≈ 364,6 nm', () => {
    expect(limiteSerie(2)).toBeCloseTo(364.71, 1);
    const lineas = lineasSerie(2, 30);
    expect(lineas.at(-1)!.longitudOnda).toBeGreaterThan(limiteSerie(2));
    // Las líneas se acercan al límite al crecer n
    for (let i = 1; i < lineas.length; i++) expect(lineas[i]!.longitudOnda).toBeLessThan(lineas[i - 1]!.longitudOnda);
  });

  it('E = hν = hc/λ', () => {
    const t = transicion(3, 2);
    expect(t.energiaEV).toBeCloseTo(energiaBohr(3) - energiaBohr(2), 8);
    expect(t.energiaEV * t.longitudOnda).toBeCloseTo(1239.84, 1);
  });

  it('rechaza transiciones inválidas', () => {
    expect(() => transicion(2, 2)).toThrow();
    expect(() => transicion(0, 2)).toThrow();
  });

  it('da colores visibles razonables', () => {
    expect(colorDeLongitud(656)).toMatch(/^#ff0000$/);
    expect(colorDeLongitud(300)).toBe('#000000');
    expect(colorDeLongitud(530)).toMatch(/^#[0-9a-f]{2}ff00$/);
  });
});

describe('isótopos (NIST)', () => {
  it('hay datos de isótopos para los 118 elementos', () => {
    for (const el of ELEMENTOS) expect(isotoposDe(el.z).length, el.simbolo).toBeGreaterThan(0);
  });

  it('las abundancias naturales suman 1', () => {
    for (const el of ELEMENTOS) {
      const ab = isotoposDe(el.z).filter((i) => i.abundancia);
      if (ab.length === 0) continue;
      const suma = ab.reduce((s, i) => s + i.abundancia!, 0);
      expect(suma, el.simbolo).toBeCloseTo(1, 3);
    }
  });

  it('la masa atómica promedio coincide con la masa atómica tabulada (error < 0,01 u)', () => {
    // Diferencias conocidas entre la composición isotópica representativa y el peso atómico estándar:
    //  - Se: IUPAC revisó su peso atómico en 2013 (78,96 → 78,971) sin cambiar la composición representativa.
    //  - Pb: composición muy variable en la naturaleza (plomo radiogénico); IUPAC 2020 da el intervalo
    //    [206,14; 207,94] con valor convencional 207,2.
    const EXCEPCIONES: Record<string, number> = { Se: 0.02, Pb: 0.02 };
    const filas = [];
    let comparados = 0;
    for (const el of ELEMENTOS) {
      const iso = isotoposDe(el.z);
      if (!iso.some((i) => i.abundancia)) continue;
      const promedio = masaAtomicaPromedio(iso);
      expect(Math.abs(promedio - el.masaAtomica), el.simbolo).toBeLessThan(EXCEPCIONES[el.simbolo] ?? 0.01);
      comparados++;
      if (['H', 'B', 'C', 'Cl', 'Cu', 'Br', 'Mg', 'Fe', 'Ag', 'Se', 'Pb'].includes(el.simbolo)) {
        filas.push({
          caso: `${el.simbolo}: Σ mᵢ·xᵢ`,
          referencia: el.masaAtomica,
          calculado: Number(promedio.toFixed(5)),
          unidad: 'u',
          fuente: `NIST (isótopos) vs ${el.origenMasaAtomica}`,
        });
      }
    }
    expect(comparados).toBeGreaterThan(80);
    registrarValidacion(
      5,
      'Masa atómica promedio a partir de los isótopos',
      filas,
      `Se compararon ${comparados} elementos con abundancia natural: error < 0,01 u en todos salvo Se y Pb (< 0,02 u), ` +
        'cuya composición isotópica representativa no coincide con el peso atómico estándar vigente (ver comentario en atomo.test.ts). Se muestra una selección.',
    );
  });

  it('calcula ejemplos de libro (Cl: 75,76 % ³⁵Cl y 24,24 % ³⁷Cl)', () => {
    expect(masaAtomicaPromedio([
      { masa: 34.96885, abundancia: 0.7576 },
      { masa: 36.96590, abundancia: 0.2424 },
    ])).toBeCloseTo(35.453, 3);
    expect(() => masaAtomicaPromedio([{ masa: 1, abundancia: null }])).toThrow();
  });

  it('cuenta partículas de nucleidos e iones', () => {
    expect(particulas(26, 56, 3)).toEqual({ protones: 26, neutrones: 30, electrones: 23, nucleones: 56 });
    expect(particulas(17, 35, -1).electrones).toBe(18);
    expect(() => particulas(10, 5)).toThrow();
  });
});

describe('experimento de Rutherford', () => {
  it('partícula α de 5 MeV contra oro: d ≈ 45 fm', () => {
    // d = k·(2e)(79e)/Eₖ = 1,44 MeV·fm · 158 / 5 MeV ≈ 45,5 fm
    expect(distanciaMinima(5, 79) * 1e15).toBeCloseTo(45.5, 0);
  });

  it('θ = 2·arctan(d/2b)', () => {
    expect(anguloDispersion(0, 1)).toBe(180);
    expect(anguloDispersion(0.5, 1)).toBeCloseTo(90, 10); // b = d/2 → 90°
    expect(anguloDispersion(1000, 1)).toBeLessThan(0.1);
  });
});
