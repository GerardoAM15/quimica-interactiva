/** Dibujo de una estructura de Lewis: símbolos, enlaces (simples, dobles, triples), pares libres y cargas formales. */

export interface DibujoLewis {
  atomos: { simbolo: string; x: number; y: number; paresLibres: number; electronSolitario?: boolean; cargaFormal: number }[];
  enlaces: { a: number; b: number; orden: number }[];
}

interface Props {
  dibujo: DibujoLewis;
  /** Unidades por enlace (px). */
  escala?: number;
  mostrarCargas?: boolean;
  /** Ocultar los H (para moléculas grandes). */
  titulo: string;
  className?: string;
}

const COLOR: Record<string, string> = { O: '#ef4444', N: '#3b82f6', S: '#ca8a04', P: '#f97316', F: '#16a34a', Cl: '#16a34a', Br: '#b45309', I: '#7c3aed' };

/**
 * Ubica los pares libres en los huecos angulares más grandes alrededor de cada átomo.
 * Se prueban 12 direcciones (cada 30°) y se eligen de forma voraz las más alejadas de los enlaces.
 */
function angulosPares(propio: { x: number; y: number }, vecinos: { x: number; y: number }[], n: number): number[] {
  const ocupados = vecinos.map((v) => Math.atan2(v.y - propio.y, v.x - propio.x));
  const elegidos: number[] = [];
  const candidatos = vecinos.length === 0 ? [0, 90, 180, 270].map((g) => (g * Math.PI) / 180) : Array.from({ length: 12 }, (_, k) => (k * Math.PI) / 6);
  const dist = (a: number, b: number) => {
    const d = Math.abs(a - b) % (2 * Math.PI);
    return Math.min(d, 2 * Math.PI - d);
  };
  for (let k = 0; k < n; k++) {
    let mejor = candidatos[0]!, puntaje = -1;
    for (const c of candidatos) {
      const s = Math.min(...[...ocupados, ...elegidos].map((o) => dist(c, o)), 10);
      if (s > puntaje + 1e-9) {
        puntaje = s;
        mejor = c;
      }
    }
    elegidos.push(mejor);
  }
  return elegidos;
}

export function LewisSVG({ dibujo, escala = 60, mostrarCargas = true, titulo, className = '' }: Props) {
  const xs = dibujo.atomos.map((a) => a.x), ys = dibujo.atomos.map((a) => a.y);
  const margen = 0.8;
  const minX = Math.min(...xs) - margen, maxX = Math.max(...xs) + margen;
  const minY = Math.min(...ys) - margen, maxY = Math.max(...ys) + margen;
  // y hacia arriba en la química, hacia abajo en SVG
  const X = (x: number) => (x - minX) * escala;
  const Y = (y: number) => (maxY - y) * escala;
  const ancho = (maxX - minX) * escala, alto = (maxY - minY) * escala;
  const vecinos = (i: number) => dibujo.enlaces.filter((e) => e.a === i || e.b === i).map((e) => dibujo.atomos[e.a === i ? e.b : e.a]!);
  const r = 0.24; // radio de recorte alrededor del símbolo (en unidades de enlace)

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className={className} role="img" aria-label={titulo} style={{ maxWidth: Math.max(160, ancho) }}>
      {dibujo.enlaces.map((e, k) => {
        const A = dibujo.atomos[e.a]!, B = dibujo.atomos[e.b]!;
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
        const ux = dx / L, uy = dy / L, px = -uy, py = ux;
        const sep = 0.09;
        const offs = e.orden === 1 ? [0] : e.orden === 2 ? [-sep / 2, sep / 2] : [-sep, 0, sep];
        return (
          <g key={k} stroke="currentColor" strokeWidth={2}>
            {offs.map((o) => (
              <line key={o} x1={X(A.x + ux * r + px * o)} y1={Y(A.y + uy * r + py * o)} x2={X(B.x - ux * r + px * o)} y2={Y(B.y - uy * r + py * o)} />
            ))}
          </g>
        );
      })}
      {dibujo.atomos.map((a, i) => {
        const angulos = angulosPares(a, vecinos(i), a.paresLibres + (a.electronSolitario ? 1 : 0));
        return (
          <g key={i}>
            <text x={X(a.x)} y={Y(a.y)} textAnchor="middle" dominantBaseline="central" fontSize={escala * 0.36} fontWeight={600} fill={COLOR[a.simbolo] ?? 'currentColor'}>
              {a.simbolo}
            </text>
            {angulos.map((ang, k) => {
              const d = 0.36;
              const cx = a.x + Math.cos(ang) * d, cy = a.y + Math.sin(ang) * d;
              const px = -Math.sin(ang) * 0.075, py = Math.cos(ang) * 0.075;
              const solitario = a.electronSolitario && k === angulos.length - 1;
              return solitario ? (
                <circle key={k} cx={X(cx)} cy={Y(cy)} r={escala * 0.04} fill="currentColor" />
              ) : (
                <g key={k} fill="currentColor">
                  <circle cx={X(cx + px)} cy={Y(cy + py)} r={escala * 0.035} />
                  <circle cx={X(cx - px)} cy={Y(cy - py)} r={escala * 0.035} />
                </g>
              );
            })}
            {mostrarCargas && a.cargaFormal !== 0 && (
              <text x={X(a.x + 0.3)} y={Y(a.y + 0.32)} fontSize={escala * 0.24} fontWeight={700} textAnchor="middle" fill={a.cargaFormal > 0 ? '#2563eb' : '#dc2626'}>
                {Math.abs(a.cargaFormal) > 1 ? Math.abs(a.cargaFormal) : ''}
                {a.cargaFormal > 0 ? '+' : '−'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
