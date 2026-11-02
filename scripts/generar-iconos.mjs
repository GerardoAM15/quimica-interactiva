// Genera los íconos PNG de la PWA (192, 512 y maskable 512) sin dependencias externas.
// Dibuja un átomo estilizado: núcleo + tres órbitas elípticas, sobre fondo oscuro.
// Uso: node scripts/generar-iconos.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const FONDO = [11, 16, 32];
const ORBITAS = [[56, 189, 248], [167, 139, 250], [52, 211, 153]]; // cian, violeta, verde
const ELECTRON = [250, 204, 21]; // amarillo
const NUCLEO = [244, 114, 182]; // rosa

/** Tabla CRC32 para los bloques PNG. */
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloque(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const td = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  const crudo = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    crudo[y * (ancho * 4 + 1)] = 0; // filtro "None"
    rgba.copy(crudo, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', ihdr),
    bloque('IDAT', deflateSync(crudo, { level: 9 })),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

/** Distancia aproximada de un punto a una elipse rotada (semiejes a, b). */
function distElipse(x, y, a, b, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const u = x * c + y * s, v = -x * s + y * c;
  const k = Math.hypot(u / a, v / b);
  if (k === 0) return Math.min(a, b);
  // Aproximación de primer orden: |f| / |∇f|
  const f = k - 1;
  const gu = u / (a * a * k), gv = v / (b * b * k);
  return Math.abs(f) / Math.hypot(gu, gv);
}

function dibujar(tam, { maskable }) {
  const rgba = Buffer.alloc(tam * tam * 4);
  const SS = 4; // supermuestreo para antialias
  const escala = maskable ? 0.72 : 0.9; // zona segura para íconos maskable
  const radioEsquina = maskable ? 0 : 0.22;
  for (let py = 0; py < tam; py++) {
    for (let px = 0; px < tam; px++) {
      let r = 0, g = 0, bl = 0, al = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // Coordenadas normalizadas en [-1, 1]
          const nx = ((px + (sx + 0.5) / SS) / tam) * 2 - 1;
          const ny = ((py + (sy + 0.5) / SS) / tam) * 2 - 1;
          // Fondo con esquinas redondeadas
          const qx = Math.max(Math.abs(nx) - (1 - radioEsquina), 0);
          const qy = Math.max(Math.abs(ny) - (1 - radioEsquina), 0);
          if (Math.hypot(qx, qy) > radioEsquina && radioEsquina > 0) continue;
          let col = FONDO;
          const x = nx / escala, y = ny / escala;
          const grosor = 0.045;
          const angulos = [0, Math.PI / 3, (2 * Math.PI) / 3];
          angulos.forEach((ang, k) => {
            if (distElipse(x, y, 0.85, 0.3, ang) < grosor) col = ORBITAS[k];
          });
          // Un electrón sobre cada órbita, en distinto punto de su recorrido
          angulos.forEach((ang, k) => {
            const t = 0.6 + k * 2.1;
            const u = 0.85 * Math.cos(t), v = 0.3 * Math.sin(t);
            const ex = u * Math.cos(ang) - v * Math.sin(ang);
            const ey = u * Math.sin(ang) + v * Math.cos(ang);
            if (Math.hypot(x - ex, y - ey) < 0.1) col = ELECTRON;
          });
          if (Math.hypot(x, y) < 0.16) col = NUCLEO;
          r += col[0]; g += col[1]; bl += col[2]; al += 255;
        }
      }
      const n = SS * SS, i = (py * tam + px) * 4;
      // Promedio premultiplicado → color final
      const a = al / n;
      rgba[i] = a ? Math.round((r / n) * (255 / a)) : 0;
      rgba[i + 1] = a ? Math.round((g / n) * (255 / a)) : 0;
      rgba[i + 2] = a ? Math.round((bl / n) * (255 / a)) : 0;
      rgba[i + 3] = Math.round(a);
    }
  }
  return png(tam, tam, rgba);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', dibujar(192, { maskable: false }));
writeFileSync('public/icons/icon-512.png', dibujar(512, { maskable: false }));
writeFileSync('public/icons/icon-maskable-512.png', dibujar(512, { maskable: true }));
writeFileSync('public/icons/apple-touch-icon.png', dibujar(180, { maskable: true }));
console.log('Íconos generados en public/icons/');
