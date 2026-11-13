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

/** Luminancia relativa (WCAG 2.1) de un color #rrggbb. */
function luminancia(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

/** Razón de contraste WCAG entre dos colores #rrggbb (1 a 21). */
export function contraste(a: string, b: string): number {
  const [la, lb] = [luminancia(a), luminancia(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Devuelve el color más parecido a `color` que alcanza el contraste mínimo sobre `fondo`:
 * lo mezcla poco a poco con blanco (fondo oscuro) o con negro (fondo claro).
 * Sirve para escribir símbolos con el color CPK del elemento en ambos temas (WCAG AA: 4,5).
 */
export function colorLegible(color: string, fondo: string, minimo = 4.5): string {
  const hacia = luminancia(fondo) < 0.5 ? 255 : 0;
  const n = parseInt(color.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const mezcla = '#' + rgb.map((v) => Math.round(v + (hacia - v) * t).toString(16).padStart(2, '0')).join('');
    if (contraste(mezcla, fondo) >= minimo) return mezcla;
  }
  return hacia === 255 ? '#ffffff' : '#000000';
}
