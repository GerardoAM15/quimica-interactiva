import { describe, expect, it } from 'vitest';
import { BLOQUES, MODULOS, bloquePorId, modulosDeBloque, moduloPorSlug } from '../registro';

describe('registro de módulos', () => {
  it('tiene los 8 bloques (A–H) y los 25 módulos', () => {
    expect(BLOQUES.map((b) => b.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(MODULOS).toHaveLength(25);
  });

  it('numera los módulos de 1 a 25 sin huecos ni repeticiones', () => {
    expect(MODULOS.map((m) => m.numero)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('usa slugs únicos y válidos para URL', () => {
    const slugs = [...MODULOS.map((m) => m.slug), ...BLOQUES.map((b) => b.slug)];
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('asigna cada módulo a un bloque existente, en el orden del plan', () => {
    const esperado: Record<string, number[]> = {
      A: [1, 2, 3],
      B: [4, 5, 6, 7],
      C: [8, 9, 10, 11],
      D: [12, 13],
      E: [14, 15, 16],
      F: [17, 18, 19],
      G: [20, 21, 22, 23, 24],
      H: [25],
    };
    for (const b of BLOQUES) {
      expect(modulosDeBloque(b.id).map((m) => m.numero)).toEqual(esperado[b.id]);
      expect(bloquePorId(b.id)).toBe(b);
    }
  });

  it('no muestra etiquetas de desarrollo en los textos', () => {
    const textos = [
      ...BLOQUES.flatMap((b) => [b.titulo, b.descripcion]),
      ...MODULOS.flatMap((m) => [m.titulo, m.resumen, ...m.temas]),
    ];
    for (const t of textos) {
      expect(t).not.toMatch(/\bfase\b|lorem/i);
      expect(t).not.toMatch(/\bTODO\b|FIXME/);
    }
  });

  it('busca por slug', () => {
    expect(moduloPorSlug('balanceador')?.numero).toBe(10);
    expect(moduloPorSlug('no-existe')).toBeUndefined();
  });
});
