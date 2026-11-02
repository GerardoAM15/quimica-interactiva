// Descarga masas isotópicas y abundancias naturales del NIST
// ("Atomic Weights and Isotopic Compositions for All Elements") → src/data/isotopos.json
// Uso: node scripts/descargar-isotopos.mjs [--sin-cache]
import { descargar, guardarJSON, hoy, sinIncertidumbre } from './lib/util.mjs';

const URL =
  'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=&all=all&ascii=ascii2&isotype=some';

const texto = await descargar(URL);
// Los registros vienen como bloques "Clave = valor" separados por una línea en blanco.
const bloques = texto
  .replace(/<[^>]+>/g, '\n')
  .split(/\n\s*\n/)
  .map((b) =>
    Object.fromEntries(
      b
        .split(/\r?\n/)
        .map((l) => l.match(/^\s*([A-Za-z ]+?)\s*=\s*(.*)$/))
        .filter(Boolean)
        .map((m) => [m[1], m[2].trim()]),
    ),
  )
  .filter((b) => b['Atomic Number'] && b['Mass Number']);

const porElemento = {};
for (const b of bloques) {
  const z = Number(b['Atomic Number']);
  // El NIST usa D y T para el deuterio y el tritio; se guarda el símbolo del elemento (H).
  const isotopo = {
    a: Number(b['Mass Number']),
    simboloEspecial: ['D', 'T'].includes(b['Atomic Symbol']) ? b['Atomic Symbol'] : null,
    masa: sinIncertidumbre(b['Relative Atomic Mass'].replace('#', '')),
    abundancia: b['Isotopic Composition'] ? sinIncertidumbre(b['Isotopic Composition']) : null,
  };
  (porElemento[z] ??= { z, pesoAtomicoEstandar: b['Standard Atomic Weight'] || null, isotopos: [] }).isotopos.push(
    isotopo,
  );
}

const lista = Object.values(porElemento).sort((x, y) => x.z - y.z);
if (lista.length < 100) throw new Error(`Solo se leyeron ${lista.length} elementos`);

guardarJSON('src/data/isotopos.json', {
  fuente: {
    nombre: 'NIST — Atomic Weights and Isotopic Compositions for All Elements',
    url: 'https://www.nist.gov/pml/atomic-weights-and-isotopic-compositions-relative-atomic-masses',
    archivo: URL,
    licencia: 'Datos del NIST, uso libre con cita',
    descargado: hoy(),
    notas:
      'masa en u (masa atómica relativa). abundancia como fracción (0–1); null = sin abundancia natural. ' +
      'pesoAtomicoEstandar tal como lo publica el NIST (puede ser un intervalo [a,b]).',
  },
  elementos: lista,
});
