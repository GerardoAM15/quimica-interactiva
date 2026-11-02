import { describe, expect, it } from 'vitest';
import {
  armonicoReal,
  crearPsi,
  crearPsiHibrido,
  direccionHibrido,
  distribucionRadial,
  HIBRIDOS,
  isoParaProbabilidad,
  laguerre,
  nodosAngulares,
  nodosRadiales,
  nombreOrbital,
  nombreOrbitalTexto,
  probabilidadEnCaja,
  radial,
  radioContencion,
  validarNLM,
} from '../orbitals';
import { areaMalla, marchingCubes, muestrearCampo } from '../marchingCubes';
import { registrarValidacion } from './validacion';

/** Integral ∫₀^∞ f(r) dr por la regla de Simpson en [0, rMax]. */
function simpson(f: (r: number) => number, rMax: number, pasos = 20000): number {
  const h = rMax / pasos;
  let s = f(0) + f(rMax);
  for (let i = 1; i < pasos; i++) s += f(i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** ∫ g(θ, φ) dΩ por cuadratura de punto medio. */
function integralAngular(g: (t: number, p: number) => number, nt = 200, np = 400): number {
  let s = 0;
  const dt = Math.PI / nt, dp = (2 * Math.PI) / np;
  for (let i = 0; i < nt; i++) {
    const t = (i + 0.5) * dt;
    for (let j = 0; j < np; j++) s += g(t, (j + 0.5) * dp) * Math.sin(t);
  }
  return s * dt * dp;
}

/** Cambios de signo de una función muestreada (descarta valores casi nulos). */
function cambiosDeSigno(valores: number[], umbral = 1e-10): number {
  let cambios = 0;
  let previo = 0;
  for (const v of valores) {
    if (Math.abs(v) < umbral) continue;
    if (previo !== 0 && Math.sign(v) !== Math.sign(previo)) cambios++;
    previo = v;
  }
  return cambios;
}

const SUBNIVELES: [number, number][] = [];
for (let n = 1; n <= 6; n++) for (let l = 0; l < Math.min(n, 4); l++) SUBNIVELES.push([n, l]);

describe('parte radial Rₙₗ', () => {
  it('polinomios de Laguerre generalizados conocidos', () => {
    expect(laguerre(0, 3, 1.7)).toBe(1);
    expect(laguerre(1, 1, 0.5)).toBeCloseTo(1.5, 12); // 1 + α − x
    // L₂^α(x) = (x² − 2(α+2)x + (α+1)(α+2)) / 2
    const x = 0.9, a = 3;
    expect(laguerre(2, a, x)).toBeCloseTo((x * x - 2 * (a + 2) * x + (a + 1) * (a + 2)) / 2, 12);
  });

  it('formas cerradas de libro: R₁₀ = 2e^(−r), R₂₀ = (2 − r)e^(−r/2)/(2√2), R₂₁ = r e^(−r/2)/(2√6)', () => {
    for (const r of [0, 0.3, 1, 2.5, 6]) {
      expect(radial(1, 0, r)).toBeCloseTo(2 * Math.exp(-r), 12);
      expect(radial(2, 0, r)).toBeCloseTo(((2 - r) * Math.exp(-r / 2)) / (2 * Math.SQRT2), 12);
      expect(radial(2, 1, r)).toBeCloseTo((r * Math.exp(-r / 2)) / (2 * Math.sqrt(6)), 12);
    }
  });

  it.each(SUBNIVELES)('n=%i, l=%i: ∫R²r²dr = 1', (n, l) => {
    const integral = simpson((r) => distribucionRadial(n, l, r), 150);
    expect(integral).toBeCloseTo(1, 6);
  });

  it.each(SUBNIVELES)('n=%i, l=%i: tiene n − l − 1 nodos radiales', (n, l) => {
    const valores = Array.from({ length: 6000 }, (_, i) => radial(n, l, 1e-3 + i * 0.02));
    expect(cambiosDeSigno(valores)).toBe(nodosRadiales(n, l));
  });

  it('ortogonalidad radial: ∫R₁₀R₂₀r²dr = 0', () => {
    expect(simpson((r) => radial(1, 0, r) * radial(2, 0, r) * r * r, 80)).toBeCloseTo(0, 8);
  });

  it('el radio más probable del 1s es a₀ (máximo de r²R²)', () => {
    let mejor = 0, rMejor = 0;
    for (let r = 0.01; r < 5; r += 0.001) {
      const p = distribucionRadial(1, 0, r);
      if (p > mejor) [mejor, rMejor] = [p, r];
    }
    expect(rMejor).toBeCloseTo(1, 2);
  });

  it('para iones hidrogenoides el orbital se contrae como 1/Z', () => {
    expect(radioContencion(1, 0, 0.9, 2)).toBeCloseTo(radioContencion(1, 0, 0.9) / 2, 1);
  });
});

describe('parte angular Yₗₘ', () => {
  const pares: [number, number][] = [];
  for (let l = 0; l <= 3; l++) for (let m = -l; m <= l; m++) pares.push([l, m]);

  it.each(pares)('l=%i, m=%i: ∫Y²dΩ = 1', (l, m) => {
    expect(integralAngular((t, p) => armonicoReal(l, m, t, p) ** 2)).toBeCloseTo(1, 3);
  });

  it('son ortogonales entre sí', () => {
    for (const [l1, m1] of pares) {
      for (const [l2, m2] of pares) {
        if (l1 === l2 && m1 === m2) continue;
        const s = integralAngular((t, p) => armonicoReal(l1, m1, t, p) * armonicoReal(l2, m2, t, p), 80, 160);
        expect(Math.abs(s), `(${l1},${m1})·(${l2},${m2})`).toBeLessThan(1e-3);
      }
    }
  });

  it.each(pares)('l=%i, m=%i: tiene l superficies nodales angulares', (l, m) => {
    // Conos nodales: ceros de Pₗ^|m|(cos θ) en (0, π) → l − |m|
    const enTheta = Array.from({ length: 4001 }, (_, i) => armonicoReal(l, m, 1e-4 + (i * (Math.PI - 2e-4)) / 4000, m >= 0 ? 0 : Math.PI / (2 * Math.abs(m))));
    // Planos nodales: 2|m| cambios de signo de cos(mφ) o sin(mφ) en [0, 2π) → |m| planos
    const enPhi = Array.from({ length: 4000 }, (_, i) => armonicoReal(l, m, Math.PI / 2 - 0.1234, 0.01 + (i * 2 * Math.PI) / 4000));
    const conos = cambiosDeSigno(enTheta);
    const planos = m === 0 ? 0 : cambiosDeSigno(enPhi) / 2;
    expect(conos + planos).toBe(nodosAngulares(l));
  });

  it('fases: pₓ es positivo hacia +x, p_z hacia +z, d_xy positivo en el primer cuadrante', () => {
    const px = crearPsi(2, 1, 1), pz = crearPsi(2, 1, 0), dxy = crearPsi(3, 2, -2), dz2 = crearPsi(3, 2, 0);
    expect(px(2, 0, 0)).toBeGreaterThan(0);
    expect(px(-2, 0, 0)).toBeLessThan(0);
    expect(px(0, 2, 0)).toBeCloseTo(0, 12);
    expect(pz(0, 0, 2)).toBeGreaterThan(0);
    expect(dxy(1, 1, 0)).toBeGreaterThan(0);
    expect(dxy(1, -1, 0)).toBeLessThan(0);
    expect(dz2(0, 0, 3)).toBeGreaterThan(0);
    expect(dz2(3, 0, 0)).toBeLessThan(0); // anillo de signo opuesto en el plano xy
  });
});

describe('función de onda completa', () => {
  it('∫|ψ|²dV ≈ 1 en una cuadrícula 3D (comprobación independiente)', () => {
    const filas = [];
    for (const [n, l, m] of [[1, 0, 0], [2, 1, 1], [3, 2, -2], [4, 3, 0]] as const) {
      const L = radioContencion(n, l, 0.99995);
      const campo = muestrearCampo(crearPsi(n, l, m), 81, L);
      const p = probabilidadEnCaja(campo);
      expect(p, nombreOrbital(n, l, m)).toBeCloseTo(1, 2);
      filas.push({ caso: `∫|ψ|²dV, ${nombreOrbitalTexto(n, l, m)} (cuadrícula 81³)`, referencia: 1, calculado: p, fuente: 'Normalización analítica' });
    }
    for (const [n, l] of [[1, 0], [3, 1], [5, 2], [6, 3]] as const) {
      filas.push({ caso: `∫R²r²dr, n=${n} l=${l} (Simpson)`, referencia: 1, calculado: simpson((r) => distribucionRadial(n, l, r), 150), fuente: 'Normalización analítica' });
    }
    registrarValidacion(6, 'Orbitales: normalización', filas);
  });

  it('nombra los orbitales reales', () => {
    expect(nombreOrbital(2, 1, 1)).toBe('2p_x');
    expect(nombreOrbital(3, 2, 2)).toBe('3d_{x^2-y^2}');
    expect(nombreOrbitalTexto(3, 2, 0)).toBe('3dz²');
    expect(nombreOrbitalTexto(4, 3, -2)).toBe('4fxyz');
  });

  it('valida n, l, m', () => {
    expect(() => validarNLM(2, 2)).toThrow();
    expect(() => validarNLM(2, 1, 2)).toThrow();
    expect(() => validarNLM(0, 0)).toThrow();
    expect(() => crearPsi(3, 2, -2)).not.toThrow();
  });
});

describe('orbitales híbridos', () => {
  it('cada conjunto es ortonormal (C·Cᵀ = I)', () => {
    for (const { coeficientes } of Object.values(HIBRIDOS)) {
      for (let i = 0; i < coeficientes.length; i++) {
        for (let j = 0; j < coeficientes.length; j++) {
          const punto = coeficientes[i]!.reduce((s, c, k) => s + c * coeficientes[j]![k]!, 0);
          expect(punto).toBeCloseTo(i === j ? 1 : 0, 12);
        }
      }
    }
  });

  it('ángulos entre lóbulos: sp 180°, sp² 120°, sp³ 109,47°', () => {
    const filas = [];
    for (const [tipo, { coeficientes, angulo }] of Object.entries(HIBRIDOS)) {
      const [a, b] = [direccionHibrido(coeficientes[0]!), direccionHibrido(coeficientes[1]!)];
      const calc = (Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) * 180) / Math.PI;
      expect(calc).toBeCloseTo(angulo, 8);
      filas.push({ caso: `Ángulo entre híbridos ${tipo}`, referencia: { sp: 180, sp2: 120, sp3: 109.4712 }[tipo]!, calculado: calc, unidad: '°', fuente: 'Geometría (arccos(−1/3) para sp³)' });
    }
    registrarValidacion(7, 'Orbitales híbridos', filas);
  });

  it('el lóbulo mayor de un sp³ apunta en su dirección y el menor al lado opuesto', () => {
    const coef = HIBRIDOS.sp3.coeficientes[0]!;
    const psi = crearPsiHibrido(coef);
    const [dx, dy, dz] = direccionHibrido(coef);
    // r = 3 a₀ (en r = 2 a₀ está el nodo radial del 2s y ambos lados valdrían lo mismo)
    const r = 3;
    expect(Math.abs(psi(r * dx, r * dy, r * dz))).toBeGreaterThan(Math.abs(psi(-r * dx, -r * dy, -r * dz)));
  });
});

describe('marching cubes', () => {
  it('extrae una esfera: radio, área ≈ 4πr² y normales hacia afuera', () => {
    const R = 1.5;
    const campo = muestrearCampo((x, y, z) => R - Math.hypot(x, y, z), 48, 2.2);
    const malla = marchingCubes(campo, 0);
    expect(malla.numTriangulos).toBeGreaterThan(1000);
    const p = malla.posiciones, nr = malla.normales;
    for (let i = 0; i < p.length; i += 3) {
      const r = Math.hypot(p[i]!, p[i + 1]!, p[i + 2]!);
      expect(Math.abs(r - R)).toBeLessThan(0.02);
      // Normal en dirección radial
      expect((p[i]! * nr[i]! + p[i + 1]! * nr[i + 1]! + p[i + 2]! * nr[i + 2]!) / r).toBeGreaterThan(0.95);
    }
    expect(areaMalla(malla) / (4 * Math.PI * R * R)).toBeCloseTo(1, 1);
    // El orden de los vértices (regla de la mano derecha) también produce caras hacia afuera
    let haciaAfuera = 0;
    for (let t = 0; t < p.length; t += 9) {
      const u = [p[t + 3]! - p[t]!, p[t + 4]! - p[t + 1]!, p[t + 5]! - p[t + 2]!];
      const v = [p[t + 6]! - p[t]!, p[t + 7]! - p[t + 1]!, p[t + 8]! - p[t + 2]!];
      const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
      if (n[0]! * p[t]! + n[1]! * p[t + 1]! + n[2]! * p[t + 2]! > 0) haciaAfuera++;
    }
    expect(haciaAfuera / malla.numTriangulos).toBeGreaterThan(0.99);
  });

  it('la isosuperficie del 90 % del 1s es una esfera del radio que da la integral radial', () => {
    const psi1s = crearPsi(1, 0, 0);
    const campo = muestrearCampo(psi1s, 81, 7);
    const iso = isoParaProbabilidad(campo, 0.9);
    const malla = marchingCubes(campo, iso);
    const p = malla.posiciones;
    let suma = 0;
    for (let i = 0; i < p.length; i += 3) suma += Math.hypot(p[i]!, p[i + 1]!, p[i + 2]!);
    const radioMalla = suma / (p.length / 3);
    const radioAnalitico = radioContencion(1, 0, 0.9);
    expect(radioMalla).toBeCloseTo(radioAnalitico, 1);
    registrarValidacion(8, 'Isosuperficies (marching cubes)', [
      { caso: 'Radio de la esfera que encierra el 90 % (1s)', referencia: radioAnalitico, calculado: radioMalla, unidad: 'a₀', fuente: '∫₀^r r²R² dr = 0,9 (analítico ≈ 2,66 a₀)' },
    ]);
  });

  it('el lóbulo negativo se obtiene con signo −1', () => {
    const campo = muestrearCampo(crearPsi(2, 1, 0), 41, 10);
    const iso = isoParaProbabilidad(campo, 0.9);
    const pos = marchingCubes(campo, iso, 1).posiciones;
    const neg = marchingCubes(campo, iso, -1).posiciones;
    const zMedio = (a: Float32Array) => {
      let s = 0;
      for (let i = 2; i < a.length; i += 3) s += a[i]!;
      return s / (a.length / 3);
    };
    expect(zMedio(pos)).toBeGreaterThan(1);
    expect(zMedio(neg)).toBeLessThan(-1);
  });
});
