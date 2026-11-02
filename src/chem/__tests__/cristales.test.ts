import { describe, expect, it } from 'vitest';
import {
  celdaElemento,
  celdaIonica,
  contarPorEspecie,
  densidadCubica,
  distanciaMinimaEntreSitios,
  INFO_REDES,
  REDES_IONICAS,
  type TipoRed,
  type TipoRedIonica,
} from '../cristales';
import { NA } from '../constants';
import { elementoPorSimbolo } from '../elements';
import { formulaHill, masaMolar } from '../formula';
import cristales from '@/data/cristales.json';
import { errorPorcentual, registrarValidacion } from './validacion';

const sumaAportes = (red: TipoRed) => celdaElemento(red, 400, 650).reduce((s, x) => s + x.aporte, 0);

describe('celdas unitarias de elementos', () => {
  it.each([
    ['sc', 1],
    ['bcc', 2],
    ['fcc', 4],
    ['diamante', 8],
    ['hcp', 6],
  ] as const)('%s: %i átomos por celda (suma de aportes)', (red, n) => {
    expect(sumaAportes(red)).toBeCloseTo(n, 10);
    expect(INFO_REDES[red].atomosPorCelda).toBe(n);
  });

  it('factores de empaquetamiento: sc 0,524 · bcc 0,680 · fcc 0,740 · diamante 0,340', () => {
    expect(INFO_REDES.sc.empaquetamiento).toBeCloseTo(0.5236, 4);
    expect(INFO_REDES.bcc.empaquetamiento).toBeCloseTo(0.6802, 4);
    expect(INFO_REDES.fcc.empaquetamiento).toBeCloseTo(0.7405, 4);
    expect(INFO_REDES.diamante.empaquetamiento).toBeCloseTo(0.3401, 4);
  });

  it('el FEA coincide con N·(4/3)πr³/a³ usando la relación r(a)', () => {
    for (const red of ['sc', 'bcc', 'fcc', 'diamante'] as const) {
      const { atomosPorCelda, radioDesdeArista, empaquetamiento } = INFO_REDES[red];
      const r = radioDesdeArista!(1);
      expect((atomosPorCelda * (4 / 3) * Math.PI * r ** 3)).toBeCloseTo(empaquetamiento, 12);
    }
  });

  it('distancia al vecino más cercano: sc a, bcc a√3/2, fcc a/√2, diamante a√3/4, hcp a', () => {
    const a = 400;
    expect(distanciaMinimaEntreSitios(celdaElemento('sc', a))).toBeCloseTo(a, 6);
    expect(distanciaMinimaEntreSitios(celdaElemento('bcc', a))).toBeCloseTo((a * Math.sqrt(3)) / 2, 6);
    expect(distanciaMinimaEntreSitios(celdaElemento('fcc', a))).toBeCloseTo(a / Math.SQRT2, 6);
    expect(distanciaMinimaEntreSitios(celdaElemento('diamante', a))).toBeCloseTo((a * Math.sqrt(3)) / 4, 6);
    expect(distanciaMinimaEntreSitios(celdaElemento('hcp', a, a * Math.sqrt(8 / 3)))).toBeCloseTo(a, 6);
  });

  it('grafito: enlace C–C = a/√3 ≈ 142 pm', () => {
    expect(distanciaMinimaEntreSitios(celdaElemento('grafito', 246.4, 671.1))).toBeCloseTo(246.4 / Math.sqrt(3), 4);
  });

  it('la celda queda centrada en el origen', () => {
    const sitios = celdaElemento('fcc', 400);
    const centro = [0, 1, 2].map((e) => sitios.reduce((s, x) => s + x.posicion[e]!, 0) / sitios.length);
    for (const c of centro) expect(Math.abs(c)).toBeLessThan(1e-9);
  });
});

describe('redes iónicas', () => {
  it.each([
    ['NaCl', { Na: 4, Cl: 4 }],
    ['CsCl', { Cs: 1, Cl: 1 }],
    ['CaF2', { Ca: 4, F: 8 }],
    ['ZnS', { Zn: 4, S: 4 }],
  ] as const)('%s: iones por celda %j (respeta la fórmula)', (tipo, esperado) => {
    expect(contarPorEspecie(celdaIonica(tipo))).toEqual(esperado);
    // La proporción coincide con la fórmula del compuesto
    const { cation, anion } = REDES_IONICAS[tipo];
    const f = formulaHill(tipo);
    expect(f).toContain(cation);
    expect(f).toContain(anion);
  });

  it('distancia catión-anión: NaCl a/2, CsCl a√3/2, CaF₂ y ZnS a√3/4', () => {
    const d = (t: TipoRedIonica) => {
      const s = celdaIonica(t);
      const { cation, anion } = REDES_IONICAS[t];
      let min = Infinity;
      for (const c of s.filter((x) => x.especie === cation)) {
        for (const an of s.filter((x) => x.especie === anion)) {
          min = Math.min(min, Math.hypot(...c.posicion.map((v, i) => v - an.posicion[i]!) as [number, number, number]));
        }
      }
      return min;
    };
    expect(d('NaCl')).toBeCloseTo(REDES_IONICAS.NaCl.a / 2, 6);
    expect(d('CsCl')).toBeCloseTo((REDES_IONICAS.CsCl.a * Math.sqrt(3)) / 2, 6);
    expect(d('CaF2')).toBeCloseTo((REDES_IONICAS.CaF2.a * Math.sqrt(3)) / 4, 6);
    expect(d('ZnS')).toBeCloseTo((REDES_IONICAS.ZnS.a * Math.sqrt(3)) / 4, 6);
  });

  it('densidad teórica de los compuestos iónicos vs valores de libro (error < 1,5 %)', () => {
    // Densidades a 25 °C (CRC Handbook, sección 4 «Physical constants of inorganic compounds»)
    const ref: Record<TipoRedIonica, [number, number]> = {
      NaCl: [2.17, 4],
      CsCl: [3.99, 1],
      CaF2: [3.18, 4],
      ZnS: [4.09, 4],
    };
    const filas = Object.entries(ref).map(([t, [rho, z]]) => {
      const calc = densidadCubica(z, masaMolar(t), REDES_IONICAS[t as TipoRedIonica].a, NA);
      expect(errorPorcentual(rho, calc), t).toBeLessThan(1.5);
      return { caso: `${t}: ρ = Z·M/(N_A·a³)`, referencia: rho, calculado: calc, unidad: 'g/cm³', fuente: 'CRC Handbook (pendiente de revisión)' };
    });
    registrarValidacion(10, 'Redes iónicas: densidad teórica', filas);
  });
});

describe('datos de cristales.json vs densidades de PubChem', () => {
  it('la densidad calculada con el parámetro de red coincide con PubChem (error < 3 %)', () => {
    // K: la densidad calculada (0,859) coincide con el CRC (0,862 g/cm³); PubChem lista 0,89.
    const REFERENCIA_ALTERNATIVA: Record<string, [number, string]> = { K: [0.862, 'CRC Handbook (PubChem lista 0,89)'] };
    const filas = [];
    const datos = cristales.elementos as Record<string, { red: string; a?: number; c?: number }>;
    for (const [simbolo, d] of Object.entries(datos)) {
      if (d.red === 'otra' || d.red === 'grafito' || !d.a) continue;
      const el = elementoPorSimbolo(simbolo)!;
      if (!el.densidad) continue;
      let rho: number;
      if (d.red === 'hcp') {
        // V(prisma hexagonal) = (3√3/2)·a²·c, con 6 átomos
        const v = ((3 * Math.sqrt(3)) / 2) * (d.a * 1e-10) ** 2 * (d.c! * 1e-10);
        rho = (6 * el.masaAtomica) / (NA * v);
      } else {
        rho = densidadCubica(INFO_REDES[d.red as TipoRed].atomosPorCelda, el.masaAtomica, d.a, NA);
      }
      const [ref, fuente] = REFERENCIA_ALTERNATIVA[simbolo] ?? [el.densidad, 'PubChem (densidad)'];
      expect(errorPorcentual(ref, rho), `${simbolo} (${d.red})`).toBeLessThan(3);
      filas.push({ caso: `${simbolo} (${d.red}, a = ${d.a} pm)`, referencia: ref, calculado: rho, unidad: 'g/cm³', fuente });
    }
    expect(filas.length).toBeGreaterThan(50);
    registrarValidacion(
      9,
      'Estructuras cristalinas: densidad teórica vs PubChem',
      filas,
      'Valida los parámetros de red de src/data/cristales.json: ρ = Z·M/(N_A·V_celda). Diferencias de 1–2 % son normales (temperatura de medición, alótropos).',
    );
  });
});
