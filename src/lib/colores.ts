/**
 * Lee un token de color de src/styles/index.css (p. ej. «--acento») para dibujar en Canvas 2D,
 * donde no se pueden usar las clases de Tailwind. Respeta el tema activo (oscuro/claro).
 */
export function colorToken(nombre: string, respaldo = '#888888'): string {
  if (typeof document === 'undefined') return respaldo;
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return v || respaldo;
}

/** Color para una magnitud normalizada 0…1 (azul = lento/frío → rojo = rápido/caliente). */
export const colorEscala = (t: number) => `hsl(${(1 - Math.max(0, Math.min(1, t))) * 220}, 85%, 58%)`;
