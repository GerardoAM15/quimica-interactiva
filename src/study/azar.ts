/**
 * Números pseudoaleatorios reproducibles (mulberry32): la misma semilla genera siempre la misma
 * hoja, el mismo examen o el mismo quiz.
 */
export class Azar {
  private s: number;
  constructor(readonly semilla: number) {
    this.s = semilla >>> 0;
  }
  /** Número en [0, 1). */
  siguiente(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** Entero en [a, b]. */
  entero(a: number, b: number): number {
    return a + Math.floor(this.siguiente() * (b - a + 1));
  }
  /** Decimal en [a, b] redondeado a `cifras` cifras significativas. */
  decimal(a: number, b: number, cifras = 3): number {
    return Number((a + this.siguiente() * (b - a)).toPrecision(cifras));
  }
  elegir<T>(lista: readonly T[]): T {
    if (!lista.length) throw new Error('Lista vacía.');
    return lista[Math.floor(this.siguiente() * lista.length)]!;
  }
  barajar<T>(lista: readonly T[]): T[] {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.siguiente() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }
  /** Semilla derivada para una subtarea (p. ej. la pregunta i de una hoja). */
  derivar(i: number): Azar {
    return new Azar((Math.imul(this.semilla ^ 0x9e3779b9, 2654435761) + Math.imul(i + 1, 40503)) >>> 0);
  }
}

/** Semilla nueva de 6 dígitos (fácil de copiar en una hoja). */
export const semillaNueva = () => 100000 + Math.floor(Math.random() * 900000);
