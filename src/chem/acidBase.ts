/**
 * Ácidos y bases: cálculo exacto del pH por balance de carga.
 *
 *   Kw = [H⁺][OH⁻] = 1,0·10⁻¹⁴ (25 °C)      pH = −log[H⁺]      pH + pOH = 14
 *   Ácido HₙA con constantes Ka₁…Kaₙ: fracción de la especie que perdió i protones
 *     αᵢ = (Ka₁···Kaᵢ)·[H⁺]^(n−i) / Σⱼ (Ka₁···Kaⱼ)·[H⁺]^(n−j)
 *   Balance de carga:  [H⁺] + Σ[cationes] = [OH⁻] + Σ[aniones]
 *
 * La función del balance es monótona en el pH, por lo que se resuelve por bisección
 * sin las aproximaciones de los textos (que se muestran aparte, para comparar).
 * Una base débil B se describe con su ácido conjugado BH⁺ (Ka = Kw/Kb, carga +1).
 */
export const KW = 1.0e-14;

/** Sistema ácido-base: concentración analítica C, constantes Ka (de la forma más protonada) y su carga. */
export interface SistemaAcido {
  C: number;
  Ka: number[];
  /** Carga de la forma totalmente protonada (0 para HA y H₂A, +1 para NH₄⁺). */
  cargaProtonada: number;
}

export interface Solucion {
  sistemas: SistemaAcido[];
  /** Cationes que no reaccionan (Na⁺, K⁺…) en equivalentes de carga por litro. */
  cationes?: number;
  /** Aniones que no reaccionan (Cl⁻, NO₃⁻…) en equivalentes de carga por litro. */
  aniones?: number;
}

/** Fracciones αᵢ de cada forma (i = protones perdidos) a una [H⁺] dada. */
export function fracciones(Ka: number[], H: number): number[] {
  const n = Ka.length;
  const terminos: number[] = [];
  let prod = 1;
  for (let i = 0; i <= n; i++) {
    if (i > 0) prod *= Ka[i - 1]!;
    terminos.push(prod * H ** (n - i));
  }
  const D = terminos.reduce((a, b) => a + b, 0);
  return terminos.map((t) => t / D);
}

/** Carga neta (eq/L) de la solución a un pH dado: positiva si sobran cargas +. */
function cargaNeta(s: Solucion, pH: number): number {
  const H = 10 ** -pH;
  let q = H - KW / H + (s.cationes ?? 0) - (s.aniones ?? 0);
  for (const sis of s.sistemas) {
    const a = fracciones(sis.Ka, H);
    q += sis.C * a.reduce((acc, ai, i) => acc + ai * (sis.cargaProtonada - i), 0);
  }
  return q;
}

/** pH exacto de la solución (bisección en −2 … 16). */
export function pHSolucion(s: Solucion): number {
  let a = -2, b = 16;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    // La carga neta disminuye al aumentar el pH
    if (cargaNeta(s, m) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

// ── Casos típicos ───────────────────────────────────────────────────────────

/** Ácido fuerte monoprótico (incluye el aporte del agua: [H⁺] = (C + √(C² + 4Kw))/2). */
export const pHAcidoFuerte = (C: number) => -Math.log10((C + Math.sqrt(C * C + 4 * KW)) / 2);
/** Base fuerte (OH⁻ por fórmula: 1 para NaOH, 2 para Ba(OH)₂). */
export const pHBaseFuerte = (C: number, oh = 1) => 14 + Math.log10((C * oh + Math.sqrt((C * oh) ** 2 + 4 * KW)) / 2);
/** Ácido débil (exacto). */
export const pHAcidoDebil = (C: number, Ka: number[] | number) => pHSolucion({ sistemas: [{ C, Ka: Array.isArray(Ka) ? Ka : [Ka], cargaProtonada: 0 }] });
/** Base débil B con Kb (exacto): se usa el ácido conjugado BH⁺ con Ka = Kw/Kb. */
export const pHBaseDebil = (C: number, Kb: number) => pHSolucion({ sistemas: [{ C, Ka: [KW / Kb], cargaProtonada: 1 }], aniones: 0 });

/** Aproximación de los textos para el ácido débil: [H⁺] ≈ √(Ka·C) (válida si α < 5 %). */
export const pHAcidoDebilAprox = (C: number, Ka: number) => -Math.log10(Math.sqrt(Ka * C));
/** Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA]). */
export const hendersonHasselbalch = (Ka: number, cBase: number, cAcido: number) => -Math.log10(Ka) + Math.log10(cBase / cAcido);
/** Porcentaje de ionización de un ácido débil monoprótico a su pH exacto. */
export const porcentajeIonizacion = (C: number, Ka: number) => {
  const H = 10 ** -pHAcidoDebil(C, Ka);
  return (100 * Ka) / (H + Ka);
};

/** Buffer HA / A⁻ (sal de sodio) exacto. */
export const pHBuffer = (Ka: number, cAcido: number, cBase: number) => pHSolucion({ sistemas: [{ C: cAcido + cBase, Ka: [Ka], cargaProtonada: 0 }], cationes: cBase });

// ── Titulación ──────────────────────────────────────────────────────────────

export type TipoTitulacion = 'fuerte-fuerte' | 'debil-fuerte' | 'base-debil-acido-fuerte' | 'base-fuerte-acido-fuerte';

export interface Titulacion {
  /** El analito (en el matraz). */
  analito: { C: number; V: number; Ka?: number[]; base?: boolean; Kb?: number };
  /** El titulante es un ácido fuerte (si el analito es base) o una base fuerte (si es ácido). */
  titulante: { C: number };
}

/** pH tras añadir v mL de titulante (balance de carga exacto, con dilución). */
export function pHTitulacion(t: Titulacion, v: number): number {
  const Vt = t.analito.V + v;
  const nA = (t.analito.C * t.analito.V) / Vt; // concentración analítica del analito ya diluido
  const nT = (t.titulante.C * v) / Vt;
  if (t.analito.base) {
    // Base (débil con Kb o fuerte) titulada con HCl: el Cl⁻ es el anión espectador
    if (t.analito.Kb) return pHSolucion({ sistemas: [{ C: nA, Ka: [KW / t.analito.Kb], cargaProtonada: 1 }], aniones: nT });
    return pHSolucion({ sistemas: [], cationes: nA, aniones: nT });
  }
  // Ácido (débil con Ka o fuerte) titulado con NaOH: el Na⁺ es el catión espectador
  if (t.analito.Ka) return pHSolucion({ sistemas: [{ C: nA, Ka: t.analito.Ka, cargaProtonada: 0 }], cationes: nT });
  return pHSolucion({ sistemas: [], cationes: nT, aniones: nA });
}

/** Volumen(es) de equivalencia (mL): uno por protón ácido. */
export function volumenesEquivalencia(t: Titulacion): number[] {
  const v1 = (t.analito.C * t.analito.V) / t.titulante.C;
  const n = t.analito.base ? 1 : (t.analito.Ka?.length ?? 1);
  return Array.from({ length: n }, (_, i) => v1 * (i + 1));
}

/** Curva completa de pH frente a volumen. */
export function curvaTitulacion(t: Titulacion, vMax: number, puntos = 400): { v: number; pH: number }[] {
  return Array.from({ length: puntos + 1 }, (_, i) => {
    const v = (i / puntos) * vMax;
    return { v, pH: pHTitulacion(t, v) };
  });
}

// ── Solubilidad (Ksp) ───────────────────────────────────────────────────────

/** Solubilidad molar s de una sal MₓAᵧ en agua pura: Ksp = xˣ·yʸ·s^(x+y). */
export const solubilidadMolar = (Ksp: number, x: number, y: number) => (Ksp / (x ** x * y ** y)) ** (1 / (x + y));

/**
 * Solubilidad con ion común: Ksp = (x·s + c_M)ˣ·(y·s + c_A)ʸ, resuelta por bisección en s.
 */
export function solubilidadIonComun(Ksp: number, x: number, y: number, cM: number, cA: number): number {
  let a = 0, b = solubilidadMolar(Ksp, x, y);
  const f = (s: number) => (x * s + cM) ** x * (y * s + cA) ** y - Ksp;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (f(m) > 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}

/** ¿Precipita? Compara el producto iónico Q = [M]ˣ[A]ʸ con Ksp. */
export const productoIonico = (cM: number, cA: number, x: number, y: number) => cM ** x * cA ** y;
