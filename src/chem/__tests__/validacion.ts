/**
 * Registro de comparaciones «referencia vs calculado» para docs/tabla_validacion.md.
 * Cada archivo de pruebas llama a `registrarValidacion`; al final de la corrida,
 * `setup-global.ts` une todo en un único documento.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface FilaValidacion {
  caso: string;
  referencia: number | string;
  calculado: number | string;
  unidad?: string;
  fuente: string;
}

export const DIR_TEMPORAL = join(process.cwd(), 'node_modules', '.tmp', 'validacion');

/** Error relativo porcentual |calc − ref| / |ref| · 100. */
export const errorPorcentual = (ref: number, calc: number) => (Math.abs(calc - ref) / Math.abs(ref)) * 100;

/** Guarda una sección (se sobrescribe en cada corrida). `orden` define su posición en el documento. */
export function registrarValidacion(orden: number, seccion: string, filas: FilaValidacion[], nota?: string): void {
  mkdirSync(DIR_TEMPORAL, { recursive: true });
  const archivo = join(DIR_TEMPORAL, `${String(orden).padStart(2, '0')}-${seccion.replace(/[^a-z0-9]+/gi, '_')}.json`);
  writeFileSync(archivo, JSON.stringify({ seccion, nota, filas }, null, 1));
}
