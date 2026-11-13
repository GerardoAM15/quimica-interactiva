// Isótopo más estable (mayor vida media) de cada elemento sin isótopos estables, desde la base de
// datos LiveChart del OIEA (estados fundamentales, ENSDF/NUBASE).
// Uso: node scripts/descargar-vidas-medias.mjs  →  src/data/vidas-medias.json
import { descargar, guardarJSON, hoy } from './lib/util.mjs';

const csv = await descargar('https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all');
const [cab, ...filas] = csv.trim().split('\n');
const col = Object.fromEntries(cab.split(',').map((c, i) => [c, i]));
const porZ = new Map();
for (const f of filas) {
  const c = f.split(',');
  const z = Number(c[col.z]), n = Number(c[col.n]);
  if (!(z >= 1 && z <= 118)) continue;
  const hl = c[col.half_life];
  const seg = Number(c[col.half_life_sec]);
  const lista = porZ.get(z) ?? [];
  lista.push({ a: z + n, simbolo: c[col.symbol], estable: hl === 'STABLE', vidaMedia: hl, unidad: c[col.unit_hl], operador: c[col.operator_hl], segundos: Number.isFinite(seg) ? seg : null });
  porZ.set(z, lista);
}
const salida = {};
for (const [z, lista] of [...porZ].sort((a, b) => a[0] - b[0])) {
  if (lista.some((x) => x.estable)) continue;
  const conValor = lista.filter((x) => x.segundos !== null && x.segundos > 0);
  if (!conValor.length) continue;
  const m = conValor.reduce((a, b) => (b.segundos > a.segundos ? b : a));
  salida[z] = { isotopo: `${m.simbolo}-${m.a}`, a: m.a, vidaMedia: Number(m.vidaMedia), unidad: m.unidad, operador: m.operador || null, segundos: m.segundos };
}
guardarJSON('src/data/vidas-medias.json', {
  fuente: { nombre: 'IAEA LiveChart of Nuclides (estados fundamentales; ENSDF/NUBASE)', url: 'https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html', licencia: 'Datos públicos del OIEA', descargado: hoy() },
  elementos: salida,
});
console.log(`  ${Object.keys(salida).length} elementos sin isótopos estables`);
