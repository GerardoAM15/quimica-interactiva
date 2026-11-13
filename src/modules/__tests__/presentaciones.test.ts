import { describe, expect, it } from 'vitest';
import apariencia from '@/data/apariencia.json';
import vidas from '@/data/vidas-medias.json';
import { ELEMENTOS } from '@/chem/elements';
import { aparienciaDe } from '../tabla-periodica/apariencia';
import { NOMBRE_PRESENTACION, OBJETOS_COTIDIANOS, presentacionDe, textoVidaMedia } from '../tabla-periodica/presentacion';

// Integridad de los datos de «Muestra 3D», «En la vida diaria» y «Vitrina 3D»
describe('presentaciones de los elementos', () => {
  const datos = apariencia.presentaciones;

  it('cita su fuente y está marcada como pendiente de revisión', () => {
    expect(datos.fuente.referencias.length).toBeGreaterThan(0);
    expect(datos.fuente.pendienteRevision).toBe(true);
  });

  it('los 118 elementos tienen una presentación válida y un uso cotidiano', () => {
    expect(Object.keys(datos.elementos)).toHaveLength(118);
    for (const el of ELEMENTOS) {
      const info = presentacionDe(el.z);
      expect(Object.keys(NOMBRE_PRESENTACION), el.simbolo).toContain(info.presentacion);
      expect(info.vidaDiaria.uso.length, el.simbolo).toBeGreaterThan(10);
      if (info.vidaDiaria.objeto !== null) expect(OBJETOS_COTIDIANOS, el.simbolo).toContain(info.vidaDiaria.objeto);
    }
  });

  it('las presentaciones fijadas por la especificación se respetan', () => {
    const de = (s: string) => presentacionDe(ELEMENTOS.find((e) => e.simbolo === s)!.z).presentacion;
    for (const s of ['H', 'He', 'N', 'O', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe']) expect(de(s), s).toBe('tubo');
    for (const s of ['Li', 'Na', 'K']) expect(de(s), s).toBe('aceite');
    for (const s of ['Rb', 'Cs', 'Br']) expect(de(s), s).toBe('ampolla');
    expect(de('Hg')).toBe('gota');
    expect(de('Si')).toBe('oblea');
    expect(de('Bi')).toBe('cristal-escalonado');
    for (const s of ['Tc', 'Pm', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac']) expect(de(s), s).toBe('sin-muestra');
  });

  it('sin muestra: los no observables y todos los Z > 95; nunca se inventa su aspecto', () => {
    for (const el of ELEMENTOS) {
      const info = presentacionDe(el.z);
      if (apariencia.noObservables.z.includes(el.z) || el.z > 95) expect(info.presentacion, el.simbolo).toBe('sin-muestra');
      // Toda placa «sin muestra» informa la vida media del isótopo más estable
      if (info.presentacion === 'sin-muestra') expect(info.vidaMedia, el.simbolo).toBeDefined();
    }
  });

  it('los tubos de descarga tienen color de emisión', () => {
    for (const el of ELEMENTOS) {
      if (presentacionDe(el.z).presentacion === 'tubo') expect(aparienciaDe(el.z).color, el.simbolo).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('vidas medias: una por cada elemento sin isótopos estables, con valor positivo', () => {
    for (const [z, v] of Object.entries(vidas.elementos)) {
      expect(Number(z)).toBeGreaterThan(0);
      expect(v.segundos, z).toBeGreaterThan(0);
      expect(v.isotopo, z).toMatch(/^[A-Z][a-z]?-\d+$/);
    }
    // es-PE escribe el separador decimal según la versión de ICU del entorno (punto o coma)
    expect(textoVidaMedia(4210000, 'Y')).toMatch(/^4[.,]21 millones de años$/);
    expect(textoVidaMedia(22, 'm')).toBe('22 minutos');
  });
});
