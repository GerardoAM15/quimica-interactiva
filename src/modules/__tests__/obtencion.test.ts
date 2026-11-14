import { describe, expect, it } from 'vitest';
import datos from '@/data/obtencion.json';
import { balancear, ecuacionTexto, parsearEcuacion } from '@/chem/balance';
import { parsearFormula } from '@/chem/formula';
import { ELEMENTOS, elementoPorSimbolo } from '@/chem/elements';
import { obtencionDe, textoSinObtencion } from '../tabla-periodica/obtencion';
import { OBJETOS_COTIDIANOS } from '../tabla-periodica/presentacion';

const sinEspacios = (s: string) => s.replace(/\s+/g, '');
const fichas = ELEMENTOS.map((e) => ({ el: e, o: obtencionDe(e.z) })).filter((x) => x.o !== null) as { el: (typeof ELEMENTOS)[number]; o: NonNullable<ReturnType<typeof obtencionDe>> }[];

// «Del mineral al producto»: las ecuaciones se comprueban con el balanceador propio y las fórmulas con chem/formula
describe('obtención industrial de los elementos', () => {
  it('cita sus fuentes, está pendiente de revisión y cubre unos 40 elementos', () => {
    expect(datos.fuente.referencias.length).toBeGreaterThanOrEqual(3);
    expect(datos.fuente.pendienteRevision).toBe(true);
    expect(fichas.length).toBeGreaterThanOrEqual(40);
    for (const s of Object.keys(datos.elementos)) expect(elementoPorSimbolo(s), s).toBeDefined();
  });

  it('cada fórmula de mineral es válida y contiene el elemento', () => {
    for (const { el, o } of fichas) {
      if (o.fuente.formula === null) continue; // trazas o mineral no estequiométrico: se muestra formulaTexto
      const f = parsearFormula(o.fuente.formula);
      expect(f.atomos.has(el.simbolo), `${el.simbolo}: ${o.fuente.formula}`).toBe(true);
    }
  });

  it('cada ecuación está balanceada con coeficientes enteros mínimos', () => {
    let n = 0;
    for (const { el, o } of fichas) {
      for (const ec of o.proceso.ecuaciones) {
        const r = balancear(ec);
        expect(sinEspacios(ecuacionTexto(r)), `${el.simbolo}: ${ec}`).toBe(sinEspacios(ec));
        n++;
      }
    }
    expect(n).toBeGreaterThanOrEqual(30);
  });

  it('la última ecuación de cada proceso produce el elemento (libre o en su compuesto útil)', () => {
    for (const { el, o } of fichas) {
      const ultima = o.proceso.ecuaciones.at(-1);
      if (!ultima) continue;
      const productos = parsearEcuacion(ultima).productos;
      expect(productos.some((p) => p.formula.atomos.has(el.simbolo)), `${el.simbolo}: ${ultima}`).toBe(true);
    }
  });

  it('cada ficha tiene de 1 a 3 productos con un objeto 3D existente', () => {
    for (const { el, o } of fichas) {
      expect(o.productos.length, el.simbolo).toBeGreaterThanOrEqual(1);
      expect(o.productos.length, el.simbolo).toBeLessThanOrEqual(3);
      for (const p of o.productos) expect(OBJETOS_COTIDIANOS, `${el.simbolo}: ${p.objeto}`).toContain(p.objeto);
      expect(['mineral', 'nativo', 'aire', 'gas']).toContain(o.fuente.tipo);
      if (o.fuente.tipo === 'mineral' || o.fuente.tipo === 'nativo') expect(o.fuente.forma, el.simbolo).toBeDefined();
      expect(o.fuente.color, el.simbolo).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('los ejemplos de la especificación están presentes', () => {
    const de = (s: string) => obtencionDe(elementoPorSimbolo(s)!.z)!;
    expect(de('Fe').fuente).toMatchObject({ nombre: 'hematita', formula: 'Fe2O3' });
    expect(de('Cu').fuente.formula).toBe('CuFeS2');
    expect(de('Zn').fuente.formula).toBe('ZnS');
    expect(de('Pb').fuente.formula).toBe('PbS');
    expect(de('Sn').fuente.formula).toBe('SnO2');
    expect(de('Ag').fuente.formula).toBe('Ag2S');
    expect(de('Na').fuente.formula).toBe('NaCl');
    expect(de('Si').fuente.formula).toBe('SiO2');
    for (const s of ['N', 'O', 'Ar', 'Ne']) expect(de(s).fuente.tipo, s).toBe('aire');
    for (const s of ['Cu', 'Au', 'Zn', 'Ag', 'Pb', 'Sn', 'Mo']) expect(de(s).peru, s).toBeTruthy();
  });

  it('los elementos sin ficha muestran un texto breve, sin inventar un proceso', () => {
    for (const e of ELEMENTOS) if (!obtencionDe(e.z)) expect(textoSinObtencion(e.z).length, e.simbolo).toBeGreaterThan(20);
    expect(textoSinObtencion(118)).toContain('no tiene uso industrial relevante');
  });
});
