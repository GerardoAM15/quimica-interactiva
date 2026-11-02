/**
 * Setup global de Vitest: al terminar todas las pruebas genera docs/tabla_validacion.md
 * con las comparaciones registradas por cada archivo de pruebas.
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR_TEMPORAL, errorPorcentual, type FilaValidacion } from './validacion';

const formatear = (v: number | string) => {
  if (typeof v === 'string') return v;
  if (v === 0) return '0';
  const abs = Math.abs(v);
  return abs >= 1e5 || abs < 1e-3 ? v.toExponential(6) : String(Number(v.toPrecision(8)));
};

export function setup() {
  if (existsSync(DIR_TEMPORAL)) rmSync(DIR_TEMPORAL, { recursive: true, force: true });
}

export function teardown() {
  if (!existsSync(DIR_TEMPORAL)) return;
  const secciones = readdirSync(DIR_TEMPORAL)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(DIR_TEMPORAL, f), 'utf8')) as { seccion: string; nota?: string; filas: FilaValidacion[] });
  if (secciones.length === 0) return;

  const lineas = [
    '# Tabla de validación',
    '',
    'Generada automáticamente por `npm test` (no editar a mano). Compara los resultados de `src/chem/`',
    'con valores de referencia (PubChem, NIST, CODATA, soluciones analíticas y libros de texto).',
    '',
  ];
  for (const s of secciones) {
    lineas.push(`## ${s.seccion}`, '');
    if (s.nota) lineas.push(s.nota, '');
    lineas.push('| Caso | Referencia | Calculado | Unidad | Error (%) | Fuente |', '|---|---|---|---|---|---|');
    for (const f of s.filas) {
      const err =
        typeof f.referencia === 'number' && typeof f.calculado === 'number' && f.referencia !== 0
          ? errorPorcentual(f.referencia, f.calculado).toExponential(2)
          : f.referencia === f.calculado ? '0 (idéntico)' : '—';
      lineas.push(`| ${f.caso} | ${formatear(f.referencia)} | ${formatear(f.calculado)} | ${f.unidad ?? ''} | ${err} | ${f.fuente} |`);
    }
    lineas.push('');
  }
  writeFileSync(join(process.cwd(), 'docs', 'tabla_validacion.md'), lineas.join('\n'));
}
