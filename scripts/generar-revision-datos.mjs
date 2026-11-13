// Genera docs/revision_datos.md: cada dato «pendiente de revisión» con su valor actual, unidad y fuente
// citada, para compararlo con el libro. Solo LEE los datos: no cambia ningún valor.
// Uso: npm run revision
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'vite';
import { RAIZ } from './lib/util.mjs';

const json = (nombre) => JSON.parse(readFileSync(join(RAIZ, 'src', 'data', `${nombre}.json`), 'utf8'));
const fuente = (ruta) => readFileSync(join(RAIZ, ruta), 'utf8');

// Las tablas escritas en TypeScript se cargan con Vite (resuelve el alias «@» y los JSON importados)
const vite = await createServer({
  configFile: false,
  root: RAIZ,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  resolve: { alias: { '@': join(RAIZ, 'src') } },
  optimizeDeps: { noDiscovery: true },
});
const gases = await vite.ssrLoadModule('/src/chem/gases.ts');
const soluciones = await vite.ssrLoadModule('/src/chem/solutions.ts');
const cristalesTs = await vite.ssrLoadModule('/src/chem/cristales.ts');
await vite.close();

// ── Formato ─────────────────────────────────────────────────────────────────
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** Número tal como está guardado, con coma decimal; notación científica fuera de 0,001…100 000. */
function num(v) {
  if (v === null || v === undefined) return '—';
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs < 1e-3 || abs >= 1e6) {
    const [m, e] = v.toExponential().split('e');
    return `${m.replace('.', ',')} × 10${[...String(Number(e))].map((c) => SUP[c]).join('')}`;
  }
  return String(v).replace('.', ',');
}
const celda = (v) => String(v ?? '—').replace(/\|/g, '/').replace(/\n/g, ' ');
/** Tabla Markdown con una columna final vacía para anotar el valor del libro. */
function tabla(cabeceras, filas, conLibro = true) {
  const cab = conLibro ? [...cabeceras, 'En mi libro'] : cabeceras;
  const cuerpo = filas.map((f) => `| ${[...f, ...(conLibro ? [''] : [])].map(celda).join(' | ')} |`);
  return [`| ${cab.join(' | ')} |`, `|${cab.map(() => '---').join('|')}|`, ...cuerpo].join('\n');
}
const secciones = [];
let total = 0;
function seccion(titulo, origen, fuenteCitada, unidad, cuerpo, nFilas) {
  total += nFilas;
  secciones.push(`### ${titulo}\n\n- Origen: \`${origen}\`\n- Fuente citada: ${fuenteCitada}\n- Unidad: ${unidad}\n\n${cuerpo}`);
}

// ── A. Datos de Chang ───────────────────────────────────────────────────────
const ab = json('acidos-bases');
seccion('Constantes de ionización de ácidos débiles (Ka, 25 °C)', 'src/data/acidos-bases.json → acidos', 'Chang, tablas 15.3 y 15.5', 'adimensional',
  tabla(['Ácido', 'Fórmula', 'Ka₁', 'Ka₂', 'Ka₃'], ab.acidos.map((a) => [a.nombre, a.formula, num(a.Ka[0]), num(a.Ka[1]), num(a.Ka[2])])), ab.acidos.length);
seccion('Constantes de ionización de bases débiles (Kb, 25 °C)', 'src/data/acidos-bases.json → bases', 'Chang, tabla 15.4', 'adimensional',
  tabla(['Base', 'Fórmula', 'Kb'], ab.bases.map((b) => [b.nombre, b.formula, num(b.Kb)])), ab.bases.length);
seccion('Ácidos y bases fuertes', 'src/data/acidos-bases.json → fuertes', 'Chang, cap. 15 (el archivo no cita una tabla concreta)', '—',
  tabla(['Tipo', 'Especies consideradas fuertes'], [['Ácidos', ab.fuertes.acidos.join(', ')], ['Bases', ab.fuertes.bases.join(', ')]]), 2);
seccion('Productos de solubilidad (Ksp, 25 °C)', 'src/data/acidos-bases.json → ksp', 'Chang, tabla 16.2', 'adimensional',
  tabla(['Compuesto', 'Fórmula', 'Ksp'], ab.ksp.map((k) => [k.nombre, k.formula, num(k.Ksp)])), ab.ksp.length);
seccion('Intervalos de viraje de indicadores', 'src/data/acidos-bases.json → indicadores', 'Chang, tabla 16.1', 'pH',
  tabla(['Indicador', 'pH inicial', 'pH final'], ab.indicadores.map((i) => [i.nombre, num(i.desde), num(i.hasta)])), ab.indicadores.length);
seccion('pH de sustancias comunes', 'src/data/acidos-bases.json → phComunes', 'Chang, tabla 15.1', 'pH',
  tabla(['Sustancia', 'pH'], ab.phComunes.map((p) => [p.nombre, num(p.pH)])), ab.phComunes.length);

const pot = json('potenciales');
seccion('Potenciales estándar de reducción (25 °C)', 'src/data/potenciales.json', pot.fuente.referencias.join('; '), 'V',
  tabla(['Semirreacción (reducción)', 'n (e⁻)', 'E° (V)'], pot.semirreacciones.map((s) => [s.ecuacion, s.n, num(s.E)])), pot.semirreacciones.length);

const termo = json('termodinamica');
const esp = Object.entries(termo.especies);
seccion('Datos termodinámicos (1 atm, 25 °C)', 'src/data/termodinamica.json → especies', termo.fuente.referencias.join('; '),
  `ΔHf° en ${termo.fuente.unidades.dHf}; S° en ${termo.fuente.unidades.S}; ΔGf° en ${termo.fuente.unidades.dGf}`,
  tabla(['Especie', 'Nombre', 'ΔHf°', 'S°', 'ΔGf°'], esp.map(([k, v]) => [k, v.nombre, num(v.dHf), num(v.S), num(v.dGf)])), esp.length);
const ce = Object.entries(termo.caloresEspecificos.valores);
seccion('Calores específicos', 'src/data/termodinamica.json → caloresEspecificos', 'Chang, tabla 6.2', 'J/(g·°C)',
  tabla(['Sustancia', 'c'], ce.map(([k, v]) => [k, num(v)])), ce.length);

const vdw = Object.entries(gases.VAN_DER_WAALS);
seccion('Constantes de Van der Waals', 'src/chem/gases.ts → VAN_DER_WAALS', 'Chang, tabla 5.4', 'a en L²·atm/mol²; b en L/mol',
  tabla(['Gas', 'Nombre', 'a', 'b'], vdw.map(([k, v]) => [k, v.nombre, num(v.a), num(v.b)])), vdw.length);

const col = Object.values(soluciones.CONSTANTES_COLIGATIVAS);
seccion('Constantes ebulloscópicas y crioscópicas', 'src/chem/solutions.ts → CONSTANTES_COLIGATIVAS', 'Chang, tabla 12.2',
  'puntos normales en °C; Ke y Kc en °C·kg/mol (°C/m)',
  tabla(['Disolvente', 'P. ebullición', 'P. congelación', 'Ke', 'Kc'], col.map((v) => [v.nombre, num(v.Te), num(v.Tc), num(v.Ke), num(v.Kc)])), col.length);

// Constantes de equilibrio de ejemplo: están en el componente (no exportadas), se leen del código fuente
const eq = [...fuente('src/modules/equilibrio/Equilibrio.tsx').matchAll(/titulo: '([^']+)',[\s\S]*?K: ([\d.e+-]+),\s*T: ([\d.]+),[\s\S]*?fuente: '([^']+)'/g)];
seccion('Constantes de equilibrio de ejemplo', 'src/modules/equilibrio/Equilibrio.tsx → PRESETS', 'Chang, cap. 14', 'Kc adimensional; T en K',
  tabla(['Reacción', 'Kc', 'T (K)', 'Nota de fuente'], eq.map((m) => [m[1], num(Number(m[2])), num(Number(m[3])), m[4]])), eq.length);

const sol = json('solubilidad');
seccion('Reglas de solubilidad en agua (25 °C)', 'src/data/solubilidad.json → reglas', sol.fuente.referencias.slice(0, 2).join('; '), '—',
  tabla(['#', 'Regla', 'Resultado'], sol.reglas.map((r, i) => [i + 1, r.texto, r.resultado])), sol.reglas.length);
seccion('Excepciones a las reglas de solubilidad', 'src/data/solubilidad.json → excepciones', sol.fuente.referencias.slice(0, 2).join('; '), '—',
  tabla(['Catión', 'Anión', 'Resultado', 'Nota'], sol.excepciones.map((e) => [e.cation, e.anion, e.resultado, e.nota])), sol.excepciones.length);
const colores = Object.entries(sol.colores);
seccion('Colores de precipitados', 'src/data/solubilidad.json → colores', sol.fuente.referencias[2], '—',
  tabla(['Compuesto', 'Color'], colores.map(([k, v]) => [k, v])), colores.length);

// ── B. Datos de otras fuentes ───────────────────────────────────────────────
const inicioB = secciones.length;
const curvas = Object.entries(soluciones.SOLUBILIDAD);
const temps = [...new Set(curvas.flatMap(([, v]) => v.puntos.map((p) => p[0])))].sort((a, b) => a - b);
seccion('Solubilidad en agua frente a la temperatura', 'src/chem/solutions.ts → SOLUBILIDAD',
  'CRC Handbook, «Aqueous solubility of inorganic compounds at various temperatures»', 'g de soluto / 100 g de agua',
  tabla(['Sal', 'Fórmula', ...temps.map((t) => `${t} °C`)], curvas.map(([k, v]) => [k, v.formula, ...temps.map((t) => num(v.puntos.find((p) => p[0] === t)?.[1]))])), curvas.length);

const cri = json('cristales');
const conRed = Object.entries(cri.elementos).filter(([, v]) => v.red !== 'otra');
seccion('Estructura cristalina y parámetros de red de los elementos', 'src/data/cristales.json', cri.fuente.referencias.join('; '), 'a y c en pm',
  tabla(['Elemento', 'Red', 'a', 'c', 'Nota'], conRed.map(([k, v]) => [k, v.red, num(v.a), num(v.c), v.nota ?? ''])), conRed.length);
const otras = Object.entries(cri.elementos).filter(([, v]) => v.red === 'otra');
seccion('Estructuras cristalinas descritas solo en texto', 'src/data/cristales.json (red «otra»)', cri.fuente.referencias[0], '—',
  tabla(['Elemento', 'Descripción'], otras.map(([k, v]) => [k, v.descripcion])), otras.length);

const redes = Object.entries(cristalesTs.REDES_IONICAS);
seccion('Redes iónicas: parámetro de red y radios iónicos', 'src/chem/cristales.ts → REDES_IONICAS, RADIOS_IONICOS',
  'CRC Handbook, sección 12 (parámetro de red); radios iónicos de Shannon', 'pm',
  tabla(['Red', 'Nombre', 'a', 'Coordinación', 'Radio del catión', 'Radio del anión'],
    redes.map(([k, v]) => [k, v.nombre, num(v.a), v.coordinacion, `${v.cation}: ${num(cristalesTs.RADIOS_IONICOS[k][v.cation])}`, `${v.anion}: ${num(cristalesTs.RADIOS_IONICOS[k][v.anion])}`])), redes.length);

const dip = json('dipolos');
const dv = Object.entries(dip.valores);
seccion('Momentos dipolares (fase gaseosa)', 'src/data/dipolos.json', dip.fuente.referencias.join('; '), 'D (debye)',
  tabla(['Molécula', 'μ (D)'], dv.map(([k, v]) => [k, num(v)])), dv.length);

const eb = json('ebullicion-complementaria');
const ev = Object.entries(eb.valores);
seccion('Puntos de ebullición complementarios', 'src/data/ebullicion-complementaria.json', eb.fuente.referencias.join('; '), '°C',
  tabla(['Compuesto', 'P. ebullición (°C)'], ev.map(([k, v]) => [k, num(v)])), ev.length);

// Energías torsionales: constantes dentro del componente, se leen del código fuente
const hid = fuente('src/modules/hidrocarburos/Hidrocarburos.tsx');
const but = hid.match(/\[E0, E60, E120, E180\] = \[([^\]]+)\]/)?.[1].split(',').map((x) => Number(x.trim())) ?? [];
const etano = Number(hid.match(/Etano: barrera de ([\d.,]+) kJ\/mol/)?.[1].replace(',', '.'));
seccion('Energías torsionales (análisis conformacional)', 'src/modules/hidrocarburos/Hidrocarburos.tsx', 'McMurry, Química orgánica, cap. 3', 'kJ/mol',
  tabla(['Molécula', 'Conformación', 'Energía relativa'], [
    ['etano', 'eclipsada (barrera de rotación)', num(etano)],
    ['butano (C2–C3)', 'totalmente eclipsada (0°)', num(but[0])],
    ['butano (C2–C3)', 'gauche (60°)', num(but[1])],
    ['butano (C2–C3)', 'eclipsada (120°)', num(but[2])],
    ['butano (C2–C3)', 'anti (180°)', num(but[3])],
  ]), 5);

// ── C. Aspecto (no comparable con Chang) ────────────────────────────────────
const inicioC = secciones.length;
const ap = json('apariencia');
const ae = Object.entries(ap.elementos);
seccion('Aspecto de los elementos', 'src/data/apariencia.json → elementos', ap.fuente.referencias.join('; '), 'color sRGB aproximado',
  tabla(['Elemento', 'Tipo', 'Color', 'Descripción'], ae.map(([k, v]) => [k, v.tipo, v.color ?? '—', v.descripcion]), false), ae.length);
const moleculas = new Map(json('moleculas').moleculas.map((m) => [String(m.cid), m.nombre]));
const apc = json('apariencia-compuestos');
const ac = Object.entries(apc.compuestos).map(([cid, v]) => [moleculas.get(cid) ?? `CID ${cid}`, v]).sort((a, b) => a[0].localeCompare(b[0], 'es'));
seccion('Aspecto de los compuestos del catálogo (clasificación automática)', 'src/data/apariencia-compuestos.json', apc.fuente.nombre, '—',
  tabla(['Compuesto', 'Estado', 'Forma', 'Color', 'Frase original (PubChem)', 'Fuente de la frase'],
    ac.map(([n, v]) => [n, v.estado, v.forma ?? '—', v.color ?? '—', v.descripcion, v.fuente]), false), ac.length);

const md = `# Revisión de datos

Generado con \`npm run revision\` (${new Date().toISOString().slice(0, 10)}) a partir de los datos marcados «pendiente de
revisión» (lista en \`docs/pendientes_revision.md\`). Muestra **el valor que usa hoy la aplicación**, su unidad y la
fuente citada. El script solo lee: **no cambia ningún valor**.

Cómo usarlo: compara cada fila con tu libro y anota en la columna «En mi libro» el valor si difiere (o ✓ si
coincide). Con esa lista se corrigen los valores y se retira la marca «pendiente de revisión».

Total: ${total} filas en ${secciones.length} tablas. Los números se muestran tal como están guardados, con coma decimal.

## A. Datos citados de Chang (y Brown)

${secciones.slice(0, inicioB).join('\n\n')}

## B. Datos de otras fuentes (CRC Handbook, Callister, McMurry)

${secciones.slice(inicioB, inicioC).join('\n\n')}

## C. Aspecto visual (no comparable con Chang)

Colores y clasificaciones aproximados que alimentan las muestras 3D; se incluyen para tener la lista completa.

${secciones.slice(inicioC).join('\n\n')}
`;
writeFileSync(join(RAIZ, 'docs', 'revision_datos.md'), md);
console.log(`✔ docs/revision_datos.md (${total} filas, ${secciones.length} tablas)`);
