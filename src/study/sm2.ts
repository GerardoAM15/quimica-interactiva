/**
 * Repetición espaciada SM-2 (P. Woźniak, SuperMemo 2, 1987).
 *
 *   q ∈ {0…5}: calidad de la respuesta.
 *   Si q < 3: repeticiones = 0 e intervalo = 1 día.
 *   Si q ≥ 3: intervalo = 1 (1.ª), 6 (2.ª) y luego intervalo·EF (redondeado); repeticiones + 1.
 *   EF′ = EF + (0,1 − (5 − q)·(0,08 + (5 − q)·0,02)),  con EF ≥ 1,3.
 */
export interface EstadoTarjeta {
  /** Factor de facilidad. */
  ef: number;
  /** Intervalo actual en días. */
  intervalo: number;
  repeticiones: number;
  /** Próximo repaso (ms desde 1970). */
  proxima: number;
}

export const DIA = 24 * 60 * 60 * 1000;
export const estadoInicial = (ahora: number): EstadoTarjeta => ({ ef: 2.5, intervalo: 0, repeticiones: 0, proxima: ahora });

export function repasar(e: EstadoTarjeta, q: number, ahora: number): EstadoTarjeta {
  if (q < 0 || q > 5) throw new Error('La calidad debe estar entre 0 y 5.');
  const ef = Math.max(1.3, e.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  if (q < 3) return { ef, intervalo: 1, repeticiones: 0, proxima: ahora + DIA };
  const intervalo = e.repeticiones === 0 ? 1 : e.repeticiones === 1 ? 6 : Math.round(e.intervalo * ef);
  return { ef, intervalo, repeticiones: e.repeticiones + 1, proxima: ahora + intervalo * DIA };
}

/** Botones de la interfaz y su calidad SM-2. */
export const CALIFICACIONES = [
  { etiqueta: 'Otra vez', q: 1, descripcion: 'No la recordé' },
  { etiqueta: 'Difícil', q: 3, descripcion: 'La recordé con mucho esfuerzo' },
  { etiqueta: 'Bien', q: 4, descripcion: 'La recordé tras pensar un poco' },
  { etiqueta: 'Fácil', q: 5, descripcion: 'La recordé de inmediato' },
] as const;

export const pendiente = (e: EstadoTarjeta | undefined, ahora: number) => !e || e.proxima <= ahora;
