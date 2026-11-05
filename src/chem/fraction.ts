/**
 * Aritmética racional exacta (numerador/denominador con BigInt), para resolver los sistemas del
 * balanceo sin errores de redondeo: 1/3 + 2/3 = 1 exactamente.
 */

const absB = (a: bigint) => (a < 0n ? -a : a);

export function mcdB(a: bigint, b: bigint): bigint {
  a = absB(a);
  b = absB(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
export const mcmB = (a: bigint, b: bigint) => (a === 0n || b === 0n ? 0n : absB(a * b) / mcdB(a, b));

export class Fraccion {
  readonly n: bigint;
  readonly d: bigint;

  constructor(n: bigint | number, d: bigint | number = 1n) {
    let nn = BigInt(n), dd = BigInt(d);
    if (dd === 0n) throw new RangeError('Denominador cero.');
    if (dd < 0n) {
      nn = -nn;
      dd = -dd;
    }
    const g = mcdB(nn, dd) || 1n;
    this.n = nn / g;
    this.d = dd / g;
  }

  static readonly CERO = new Fraccion(0);
  static readonly UNO = new Fraccion(1);

  sumar(o: Fraccion) {
    return new Fraccion(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  restar(o: Fraccion) {
    return new Fraccion(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  multiplicar(o: Fraccion) {
    return new Fraccion(this.n * o.n, this.d * o.d);
  }
  dividir(o: Fraccion) {
    if (o.n === 0n) throw new RangeError('División por cero.');
    return new Fraccion(this.n * o.d, this.d * o.n);
  }
  negar() {
    return new Fraccion(-this.n, this.d);
  }
  esCero() {
    return this.n === 0n;
  }
  signo() {
    return this.n === 0n ? 0 : this.n > 0n ? 1 : -1;
  }
  igual(o: Fraccion) {
    return this.n === o.n && this.d === o.d;
  }
  aNumero() {
    return Number(this.n) / Number(this.d);
  }
  toString() {
    return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`;
  }
  /** LaTeX: \frac{n}{d} o entero. */
  aLatex() {
    if (this.d === 1n) return this.n.toString();
    return `${this.n < 0n ? '-' : ''}\\tfrac{${absB(this.n)}}{${this.d}}`;
  }
}

export const frac = (n: bigint | number, d: bigint | number = 1n) => new Fraccion(n, d);

/**
 * Forma escalonada reducida por filas (Gauss-Jordan) con fracciones exactas.
 * Devuelve la matriz reducida y los índices de las columnas pivote.
 */
export function rref(m: Fraccion[][]): { matriz: Fraccion[][]; pivotes: number[] } {
  const A = m.map((f) => [...f]);
  const filas = A.length, cols = A[0]?.length ?? 0;
  const pivotes: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < filas; c++) {
    let p = -1;
    for (let i = r; i < filas; i++) if (!A[i]![c]!.esCero()) {
      p = i;
      break;
    }
    if (p < 0) continue;
    [A[r], A[p]] = [A[p]!, A[r]!];
    const piv = A[r]![c]!;
    A[r] = A[r]!.map((x) => x.dividir(piv));
    for (let i = 0; i < filas; i++) {
      if (i === r || A[i]![c]!.esCero()) continue;
      const f = A[i]![c]!;
      A[i] = A[i]!.map((x, j) => x.restar(f.multiplicar(A[r]![j]!)));
    }
    pivotes.push(c);
    r++;
  }
  return { matriz: A, pivotes };
}

/** Base del espacio nulo de la matriz (vectores x con A·x = 0). */
export function espacioNulo(m: Fraccion[][]): Fraccion[][] {
  const cols = m[0]?.length ?? 0;
  const { matriz, pivotes } = rref(m);
  const libres = Array.from({ length: cols }, (_, j) => j).filter((j) => !pivotes.includes(j));
  return libres.map((libre) => {
    const v = Array.from({ length: cols }, () => Fraccion.CERO);
    v[libre] = Fraccion.UNO;
    pivotes.forEach((pc, fila) => {
      v[pc] = matriz[fila]![libre]!.negar();
    });
    return v;
  });
}

/** Escala un vector racional a los enteros más pequeños (todos con el signo del primero no nulo positivo). */
export function aEnterosMinimos(v: Fraccion[]): bigint[] {
  const den = v.reduce((acc, x) => mcmB(acc, x.d), 1n);
  let enteros = v.map((x) => (x.n * den) / x.d);
  const g = enteros.reduce((acc, x) => mcdB(acc, x), 0n) || 1n;
  enteros = enteros.map((x) => x / g);
  const primero = enteros.find((x) => x !== 0n) ?? 1n;
  return primero < 0n ? enteros.map((x) => -x) : enteros;
}
