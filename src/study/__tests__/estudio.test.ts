import { describe, expect, it } from 'vitest';
import { Azar } from '../azar';
import { DIA, estadoInicial, repasar } from '../sm2';
import { generarPreguntas, TEMAS, type Dificultad, type Tema } from '../generadores';
import { mazo } from '../tarjetas';
import { armarExamen, calificar } from '../examen';

describe('azar con semilla', () => {
  it('es reproducible y está en rango', () => {
    const a = new Azar(42), b = new Azar(42);
    const xa = Array.from({ length: 20 }, () => a.entero(1, 6));
    expect(xa).toEqual(Array.from({ length: 20 }, () => b.entero(1, 6)));
    expect(xa.every((x) => x >= 1 && x <= 6)).toBe(true);
    expect(new Azar(1).derivar(3).siguiente()).not.toBe(new Azar(1).derivar(4).siguiente());
  });
});

describe('SM-2', () => {
  it('intervalos 1, 6 y luego ×EF; EF sube con q = 5 y no baja de 1,3', () => {
    let e = estadoInicial(0);
    e = repasar(e, 5, 0);
    expect(e.intervalo).toBe(1);
    expect(e.ef).toBeCloseTo(2.6, 10);
    e = repasar(e, 5, 0);
    expect(e.intervalo).toBe(6);
    e = repasar(e, 5, 0);
    expect(e.intervalo).toBe(Math.round(6 * 2.8));
    expect(e.proxima).toBe(e.intervalo * DIA);
    // Un fallo reinicia las repeticiones
    const f = repasar(e, 1, 0);
    expect(f.repeticiones).toBe(0);
    expect(f.intervalo).toBe(1);
    let g = estadoInicial(0);
    for (let i = 0; i < 20; i++) g = repasar(g, 0, 0);
    expect(g.ef).toBe(1.3);
    expect(() => repasar(g, 7, 0)).toThrow();
  });
});

describe('generadores de preguntas', () => {
  const temas = TEMAS.map((t) => t.id);
  it.each(temas.flatMap((t) => ([1, 2, 3] as Dificultad[]).map((d) => [t, d] as [Tema, Dificultad])))('%s, dificultad %i: preguntas válidas', (tema, d) => {
    for (let semilla = 1; semilla <= 12; semilla++) {
      const qs = generarPreguntas(semilla * 7919, [{ tema }], 4, d);
      expect(qs.length, `semilla ${semilla}`).toBeGreaterThanOrEqual(3);
      for (const q of qs) {
        expect(q.opciones).toHaveLength(5);
        expect(new Set(q.opciones).size, q.enunciado).toBe(5);
        expect(q.correcta).toBeGreaterThanOrEqual(0);
        expect(q.correcta).toBeLessThan(5);
        expect(q.enunciado.length).toBeGreaterThan(10);
        expect(q.solucion.length).toBeGreaterThan(0);
        expect(q.enunciado).not.toMatch(/undefined|\bNaN\b/);
        expect(q.opciones.join(' ')).not.toMatch(/undefined|\bNaN\b|Infinity/);
      }
    }
  });

  it('la misma semilla genera la misma hoja; otra semilla, otra', () => {
    const sel = TEMAS.map((t) => ({ tema: t.id }));
    const a = generarPreguntas(123456, sel, 20, 2), b = generarPreguntas(123456, sel, 20, 2), c = generarPreguntas(654321, sel, 20, 2);
    expect(a.map((q) => q.enunciado)).toEqual(b.map((q) => q.enunciado));
    expect(a.map((q) => q.enunciado)).not.toEqual(c.map((q) => q.enunciado));
    expect(a).toHaveLength(20);
  });

  it('respeta los subtemas y genera hasta 50 preguntas', () => {
    const qs = generarPreguntas(99, [{ tema: 'gases', subtemas: ['densidad'] }, { tema: 'ph', subtemas: ['fuerte'] }], 50, 3);
    expect(qs.length).toBeGreaterThanOrEqual(40);
    expect(new Set(qs.map((q) => q.subtema))).toEqual(new Set(['densidad', 'fuerte']));
  });

  it('las respuestas son correctas (comprobación independiente)', () => {
    for (const q of generarPreguntas(2024, [{ tema: 'ph', subtemas: ['fuerte'] }], 10, 1)) {
      const m = /de una disolución ([\d.]+(?: × 10[⁻⁰-⁹]+)?) M de (\S+)\?/.exec(q.enunciado)!;
      const C = Number(m[1]!.replace(/ × 10([⁻⁰-⁹]+)/, (_, e: string) => `e${e.replace('⁻', '-').replace(/[⁰-⁹]/g, (c) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)))}`));
      const pH = /OH/.test(m[2]!) ? 14 + Math.log10(C) : -Math.log10(C);
      expect(Number(q.opciones[q.correcta]!)).toBeCloseTo(pH, 2);
    }
  });
});

describe('tarjetas y examen', () => {
  it('el mazo tiene tarjetas únicas con frente y reverso', () => {
    const m = mazo();
    expect(m.length).toBeGreaterThan(100);
    expect(new Set(m.map((t) => t.id)).size).toBe(m.length);
    expect(m.every((t) => t.frente && t.reverso)).toBe(true);
  });

  it('arma y califica un simulacro', () => {
    const ex = armarExamen(777, 'completo');
    expect(ex.preguntas.length).toBe(ex.config.preguntas);
    const respuestas = ex.preguntas.map((q, i) => (i % 2 === 0 ? q.correcta : null));
    const r = calificar(ex, respuestas);
    expect(r.correctas).toBe(Math.ceil(ex.preguntas.length / 2));
    expect(r.enBlanco).toBe(Math.floor(ex.preguntas.length / 2));
    expect(Object.values(r.porTema).reduce((s, t) => s + t.total, 0)).toBe(ex.preguntas.length);
  });
});
