import { describe, expect, it } from 'vitest';
import {
  buscarElemento,
  ELEMENTOS,
  elementoPorSimbolo,
  elementoPorZ,
  grupo,
  grupoTradicional,
  periodo,
  posicionTabla,
  tipoElemento,
} from '../elements';
import apariencia from '@/data/apariencia.json';
import cristales from '@/data/cristales.json';

describe('integridad de los datos de elementos', () => {
  it('tiene los 118 elementos en orden y con símbolos únicos', () => {
    expect(ELEMENTOS).toHaveLength(118);
    ELEMENTOS.forEach((el, i) => expect(el.z).toBe(i + 1));
    expect(new Set(ELEMENTOS.map((e) => e.simbolo)).size).toBe(118);
    expect(new Set(ELEMENTOS.map((e) => e.nombre)).size).toBe(118);
  });

  it('cada elemento tiene sus campos obligatorios', () => {
    for (const el of ELEMENTOS) {
      expect(el.simbolo, `Z=${el.z}`).toMatch(/^[A-Z][a-z]?$/);
      expect(el.nombre.length, el.simbolo).toBeGreaterThan(1);
      expect(el.masaAtomica, el.simbolo).toBeGreaterThan(0);
      expect(['solido', 'liquido', 'gas']).toContain(el.estadoEstandar);
      expect(el.familia).toBeTruthy();
    }
  });

  it('las masas atómicas crecen con Z salvo las inversiones conocidas', () => {
    const inversiones = ELEMENTOS.slice(1)
      .filter((el, i) => el.masaAtomica < ELEMENTOS[i]!.masaAtomica)
      .map((el) => `${ELEMENTOS[el.z - 2]!.simbolo}-${el.simbolo}`);
    // Ar-K, Co-Ni y Te-I son las inversiones clásicas; el resto aparece entre elementos sintéticos
    for (const par of ['Ar-K', 'Co-Ni', 'Te-I']) expect(inversiones).toContain(par);
  });

  it('a 25 °C los únicos líquidos son Br y Hg, y los gases son H, N, O, F, Cl y los nobles', () => {
    const naturales = ELEMENTOS.filter((e) => !e.estadoEsperado);
    expect(naturales.filter((e) => e.estadoEstandar === 'liquido').map((e) => e.simbolo).sort()).toEqual(['Br', 'Hg']);
    expect(naturales.filter((e) => e.estadoEstandar === 'gas').map((e) => e.simbolo).sort()).toEqual(
      ['Ar', 'Cl', 'F', 'H', 'He', 'Kr', 'N', 'Ne', 'O', 'Rn', 'Xe'],
    );
  });

  it('los datos curados (apariencia, cristales) solo usan símbolos válidos', () => {
    for (const s of [...Object.keys(apariencia.elementos), ...Object.keys(cristales.elementos)]) {
      expect(elementoPorSimbolo(s), s).toBeDefined();
    }
    expect(apariencia.fuente.pendienteRevision).toBe(true);
    expect(cristales.fuente.pendienteRevision).toBe(true);
  });
});

describe('posición en la tabla periódica', () => {
  const casos: [string, number, number, string][] = [
    ['H', 1, 1, 'IA'],
    ['He', 1, 18, 'VIIIA'],
    ['Na', 3, 1, 'IA'],
    ['Al', 3, 13, 'IIIA'],
    ['Cl', 3, 17, 'VIIA'],
    ['Sc', 4, 3, 'IIIB'],
    ['Fe', 4, 8, 'VIIIB'],
    ['Co', 4, 9, 'VIIIB'],
    ['Ni', 4, 10, 'VIIIB'],
    ['Cu', 4, 11, 'IB'],
    ['Zn', 4, 12, 'IIB'],
    ['Mn', 4, 7, 'VIIB'],
    ['Br', 4, 17, 'VIIA'],
    ['I', 5, 17, 'VIIA'],
    ['Ba', 6, 2, 'IIA'],
    ['La', 6, 3, 'IIIB'],
    ['Lu', 6, 3, 'IIIB'],
    ['Hf', 6, 4, 'IVB'],
    ['Au', 6, 11, 'IB'],
    ['Rn', 6, 18, 'VIIIA'],
    ['U', 7, 3, 'IIIB'],
    ['Rf', 7, 4, 'IVB'],
    ['Og', 7, 18, 'VIIIA'],
  ];
  it.each(casos)('%s: periodo %i, grupo %i (%s)', (s, p, g, gt) => {
    const z = elementoPorSimbolo(s)!.z;
    expect(periodo(z)).toBe(p);
    expect(grupo(z)).toBe(g);
    expect(grupoTradicional(z)).toBe(gt);
  });

  it('asigna una celda distinta a cada elemento', () => {
    const celdas = ELEMENTOS.map((e) => {
      const { fila, columna } = posicionTabla(e.z);
      return `${fila},${columna}`;
    });
    expect(new Set(celdas).size).toBe(118);
  });

  it('el grupo coincide con la familia de PubChem', () => {
    for (const el of ELEMENTOS) {
      if (el.familia === 'alcalino') expect(grupo(el.z)).toBe(1);
      if (el.familia === 'alcalinoterreo') expect(grupo(el.z)).toBe(2);
      if (el.familia === 'halogeno') expect(grupo(el.z)).toBe(17);
      if (el.familia === 'gas-noble') expect(grupo(el.z)).toBe(18);
    }
  });

  it('clasifica metales, no metales y metaloides', () => {
    expect(tipoElemento(elementoPorSimbolo('Fe')!)).toBe('metal');
    expect(tipoElemento(elementoPorSimbolo('O')!)).toBe('no-metal');
    expect(tipoElemento(elementoPorSimbolo('Si')!)).toBe('metaloide');
  });
});

describe('búsqueda', () => {
  it('encuentra por símbolo, número, nombre en español o inglés y alias, sin tildes', () => {
    expect(buscarElemento('fe')?.z).toBe(26);
    expect(buscarElemento('26')?.simbolo).toBe('Fe');
    expect(buscarElemento('hierro')?.simbolo).toBe('Fe');
    expect(buscarElemento('Iron')?.simbolo).toBe('Fe');
    expect(buscarElemento('nitrogeno')?.simbolo).toBe('N');
    expect(buscarElemento('tungsteno')?.simbolo).toBe('W');
    expect(buscarElemento('cinc')?.simbolo).toBe('Zn');
    expect(buscarElemento('xx')).toBeUndefined();
    expect(buscarElemento('200')).toBeUndefined();
  });

  it('elementoPorZ valida el rango', () => {
    expect(elementoPorZ(1).simbolo).toBe('H');
    expect(() => elementoPorZ(0)).toThrow();
    expect(() => elementoPorZ(119)).toThrow();
  });
});
