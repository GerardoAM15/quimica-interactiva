import { describe, expect, it } from 'vitest';
import { ISOMEROS } from '@/data/isomeros';
import { formulaMolecularGrafo, nombrarOrganico, parsearNombre, tipoIsomeria } from '../nomenclatura/organica';

describe('listas de isómeros', () => {
  it.each(ISOMEROS.map((g) => [g.formula, g] as const))('%s: fórmula, nombre correcto y sin repetidos', (_, g) => {
    const grafos = g.nombres.map((n) => parsearNombre(n));
    grafos.forEach((x, i) => {
      expect(formulaMolecularGrafo(x), g.nombres[i]).toBe(g.formula);
      expect(nombrarOrganico(x).nombre).toBe(g.nombres[i]);
    });
    expect(new Set(g.nombres).size).toBe(g.nombres.length);
    // Ningún par es «iguales»
    for (let i = 0; i < grafos.length; i++) for (let j = i + 1; j < grafos.length; j++) expect(tipoIsomeria(grafos[i]!, grafos[j]!)).not.toBe('iguales');
  });
});
