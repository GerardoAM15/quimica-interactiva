// Lista los datos marcados «pendiente de revisión» (JSON de src/data y constantes en src/chem)
// y las insignias visibles en la interfaz → docs/pendientes_revision.md
// Uso: npm run pendientes
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RAIZ } from './lib/util.mjs';

const archivos = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? (f === '__tests__' ? [] : archivos(p)) : [p];
  });

const rel = (p) => relative(RAIZ, p).replace(/\\/g, '/');
const filas = [];

// 1) Archivos de datos con pendienteRevision
for (const p of archivos(join(RAIZ, 'src', 'data')).filter((f) => f.endsWith('.json'))) {
  const texto = readFileSync(p, 'utf8');
  if (!/pendienteRevision"\s*:\s*true/.test(texto)) continue;
  const d = JSON.parse(texto);
  const refs = d.fuente?.referencias ?? (d.fuente?.nombre ? [d.fuente.nombre] : []);
  const n = (texto.match(/pendienteRevision"\s*:\s*true/g) ?? []).length;
  filas.push({ archivo: rel(p), que: d.fuente?.notas ?? d.fuente?.nombre ?? 'Datos transcritos', fuente: refs.join('; ') || '—', n });
}

// 2) Tablas en código TypeScript con «pendiente de revisión» en su comentario
for (const p of archivos(join(RAIZ, 'src')).filter((f) => /\.(ts|tsx)$/.test(f))) {
  const lineas = readFileSync(p, 'utf8').split('\n');
  lineas.forEach((l, i) => {
    if (/pendiente[s]? de revisi[oó]n/i.test(l) && /^\s*(\/\*\*|\*|\/\/)/.test(l) && !/marca|marcarlo|InsigniaRevision/.test(l)) {
      filas.push({ archivo: `${rel(p)}:${i + 1}`, que: l.replace(/^\s*(\/\*\*|\*|\/\/)\s*/, '').replace(/\*\/\s*$/, '').trim(), fuente: '(ver comentario)', n: 1 });
    }
  });
}

// 3) Insignias visibles en la interfaz
const insignias = [];
for (const p of archivos(join(RAIZ, 'src')).filter((f) => f.endsWith('.tsx'))) {
  const t = readFileSync(p, 'utf8');
  const n = (t.match(/<InsigniaRevision/g) ?? []).length;
  if (n && !p.endsWith('InsigniaRevision.tsx')) insignias.push(`- \`${rel(p)}\`: ${n}`);
}

const md = `# Datos pendientes de revisión

Generado con \`npm run pendientes\` (${new Date().toISOString().slice(0, 10)}). Son valores transcritos de libros o
clasificados automáticamente que la aplicación muestra con la insignia «Pendiente de revisión». Al verificarlos contra
la fuente, cambia \`pendienteRevision\` a \`false\` (o quita la insignia) y vuelve a ejecutar las pruebas.

## Datos

| Archivo | Qué contiene | Fuente citada |
|---|---|---|
${filas.map((f) => `| \`${f.archivo}\` | ${f.que.replace(/\|/g, '/')} | ${f.fuente.replace(/\|/g, '/')} |`).join('\n')}

## Insignias en la interfaz

${insignias.join('\n')}
`;
writeFileSync(join(RAIZ, 'docs', 'pendientes_revision.md'), md);
console.log(`✔ docs/pendientes_revision.md (${filas.length} entradas, ${insignias.length} archivos con insignias)`);
