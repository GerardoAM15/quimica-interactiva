// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { borrar, escribir, leer, leerJSON } from '../almacenamiento';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('almacenamiento seguro', () => {
  it('lee y escribe normalmente', () => {
    expect(escribir('k', 'v')).toBe(true);
    expect(leer('k')).toBe('v');
    borrar('k');
    expect(leer('k')).toBeNull();
  });

  it('devuelve el valor por defecto si el JSON está corrupto', () => {
    escribir('j', '{no es json');
    expect(leerJSON('j', { a: 1 })).toEqual({ a: 1 });
  });

  it('no lanza excepciones si localStorage falla (modo privado, cuota llena)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    expect(escribir('k', 'v')).toBe(false);
    expect(leer('k')).toBeNull();
    expect(() => borrar('k')).not.toThrow();
    expect(leerJSON('k', 7)).toBe(7);
  });
});
