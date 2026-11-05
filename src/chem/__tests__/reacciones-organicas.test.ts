import { describe, expect, it } from 'vitest';
import { parsearNombre } from '../nomenclatura/organica';
import { adicion, combustion, esterificar, halogenar, hidrogenar, saponificar } from '../reaccionesOrganicas';

const g = parsearNombre;

describe('reacciones orgánicas básicas', () => {
  it('combustión completa balanceada', () => {
    expect(combustion(g('propano')).ecuacion).toBe('C3H8 + 5 O2 -> 3 CO2 + 4 H2O');
    expect(combustion(g('etanol')).ecuacion).toBe('C2H6O + 3 O2 -> 2 CO2 + 3 H2O');
    expect(combustion(g('octano')).ecuacion).toMatch(/2 C8H18 \+ 25 O2/);
  });

  it('hidrogenación', () => {
    expect(hidrogenar(g('but-2-eno')).productos[0]!.nombre).toBe('butano');
    expect(hidrogenar(g('prop-1-ino')).ecuacion).toBe('prop-1-ino + 2 H₂ → propano');
    expect(hidrogenar(g('ciclohexeno')).productos[0]!.nombre).toBe('ciclohexano');
    expect(() => hidrogenar(g('benceno'))).toThrow();
  });

  it('halogenación de alcanos: isómeros y proporción estadística', () => {
    const r = halogenar(g('propano'), 'Cl');
    const p = Object.fromEntries(r.productos.map((x) => [x.nombre, x.fraccion]));
    expect(p['1-cloropropano']).toBeCloseTo(6 / 8, 12);
    expect(p['2-cloropropano']).toBeCloseTo(2 / 8, 12);
    expect(halogenar(g('2-metilpropano'), 'Br').productos.map((x) => x.nombre).sort()).toEqual(['1-bromo-2-metilpropano', '2-bromo-2-metilpropano']);
    expect(halogenar(g('metano'), 'Cl').productos[0]!.nombre).toBe('clorometano');
  });

  it('adición a alquenos (Markovnikov)', () => {
    expect(adicion(g('prop-1-eno'), 'HX', 'Br').productos[0]!.nombre).toBe('2-bromopropano');
    expect(adicion(g('prop-1-eno'), 'H2O').productos[0]!.nombre).toBe('propan-2-ol');
    expect(adicion(g('eteno'), 'X2', 'Cl').productos[0]!.nombre).toBe('1,2-dicloroetano');
    expect(adicion(g('2-metilprop-1-eno'), 'HX', 'Cl').productos[0]!.nombre).toBe('2-cloro-2-metilpropano');
  });

  it('esterificación y saponificación', () => {
    expect(esterificar(g('ácido etanoico'), g('etanol')).productos[0]!.nombre).toBe('etanoato de etilo');
    expect(esterificar(g('ácido propanoico'), g('metanol')).productos[0]!.nombre).toBe('propanoato de metilo');
    const s = saponificar(g('etanoato de etilo'));
    expect(s.productos.map((p) => p.nombre)).toEqual(['etanoato de sodio', 'etanol']);
    expect(saponificar(g('propanoato de butilo')).productos.map((p) => p.nombre)).toEqual(['propanoato de sodio', 'butan-1-ol']);
    expect(() => saponificar(g('etanol'))).toThrow();
  });
});
