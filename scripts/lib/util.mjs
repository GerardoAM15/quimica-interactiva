// Utilidades compartidas por los scripts de descarga de datos.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = join(RAIZ, 'scripts', '.cache');

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Descarga texto con reintentos y caché local (scripts/.cache).
 * Usa --sin-cache para forzar una descarga nueva.
 */
export async function descargar(url, { reintentos = 4 } = {}) {
  mkdirSync(CACHE, { recursive: true });
  const archivo = join(CACHE, createHash('sha1').update(url).digest('hex') + '.txt');
  if (!process.argv.includes('--sin-cache') && existsSync(archivo)) return readFileSync(archivo, 'utf8');

  let ultimoError;
  for (let i = 0; i < reintentos; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'quimica-interactiva/0.1 (proyecto educativo)' } });
      if (r.status === 503 || r.status === 429) throw new Error(`Servidor ocupado (${r.status})`);
      if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
      const texto = await r.text();
      writeFileSync(archivo, texto);
      // PubChem pide como máximo 5 solicitudes por segundo
      await esperar(250);
      return texto;
    } catch (e) {
      ultimoError = e;
      await esperar(1000 * 2 ** i);
    }
  }
  throw ultimoError;
}

export function guardarJSON(rutaRelativa, datos) {
  const ruta = join(RAIZ, rutaRelativa);
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, JSON.stringify(datos, null, 1) + '\n');
  console.log(`✔ ${rutaRelativa}`);
}

export const hoy = () => new Date().toISOString().slice(0, 10);

/** Número o null si el campo viene vacío. */
export const num = (s) => (s === undefined || s === null || String(s).trim() === '' ? null : Number(s));

/** Valor con incertidumbre entre paréntesis, p. ej. "1.00782503223(9)" → 1.00782503223 */
export const sinIncertidumbre = (s) => Number(String(s).replace(/\(.*?\)/g, '').replace(/\s/g, ''));
