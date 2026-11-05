// Aspecto de los compuestos del catálogo a 25 °C (estado, forma y color) desde PubChem PUG View
// («Physical Description» y «Color/Form»). Se guarda la frase original y su fuente; la clasificación
// automática se marca como pendiente de revisión.
// Uso: node scripts/descargar-apariencia-compuestos.mjs  →  src/data/apariencia-compuestos.json
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { descargar, guardarJSON, hoy, RAIZ } from './lib/util.mjs';

const catalogo = JSON.parse(readFileSync(join(RAIZ, 'src/data/moleculas.json'), 'utf8')).moleculas;

/** Fuentes en orden de preferencia (descripciones redactadas, no listas de formatos comerciales). */
const PREFERENCIA = [/CAMEO/i, /Hazardous Substances Data Bank|HSDB/i, /ILO|ICSC/i, /NIOSH/i, /Merck/i, /CRC/i];

function textos(json) {
  const refs = new Map((json.Record?.Reference ?? []).map((r) => [r.ReferenceNumber, r.SourceName]));
  const res = [];
  const recorrer = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o.Information))
      for (const i of o.Information) {
        const t = i.Value?.StringWithMarkup?.map((s) => s.String).join(' ');
        const fuente = refs.get(i.ReferenceNumber) ?? 'PubChem';
        // Se descartan las descripciones de disoluciones y mezclas comerciales
        if (t && !/EPA Chemical Data Reporting/i.test(fuente) && !/solution|aqueous|dissolved|syrup|in water|mixture/i.test(t)) res.push({ texto: t.trim(), fuente });
      }
    for (const k of Object.keys(o)) recorrer(o[k]);
  };
  recorrer(json);
  const rango = (f) => {
    const k = PREFERENCIA.findIndex((r) => r.test(f));
    return k < 0 ? 99 : k;
  };
  return res.sort((a, b) => rango(a.fuente) - rango(b.fuente));
}

/** Colores reconocidos (inglés → nombre en español y color de muestra). */
const COLORES = [
  [/greenish[- ]yellow|yellow(?:ish)?[- ]green/i, 'amarillo verdoso', '#c8d94a'],
  [/reddish[- ]brown|red[- ]brown/i, 'pardo rojizo', '#8a3a1c'],
  [/bluish[- ]black|violet[- ]black|black[- ]violet/i, 'negro violáceo', '#2b2236'],
  [/colou?rless|clear|transparent/i, 'incoloro', null],
  [/\bwhite\b/i, 'blanco', '#f4f4f2'],
  [/pale[- ]yellow|light yellow/i, 'amarillo pálido', '#f3eaa0'],
  [/yellow/i, 'amarillo', '#f2d31b'],
  [/orange/i, 'anaranjado', '#f08a24'],
  [/\bred\b|reddish/i, 'rojo', '#c62d2d'],
  [/violet|purple/i, 'violeta', '#6a2c91'],
  [/\bblue\b|bluish/i, 'azul', '#2f6fd1'],
  [/green/i, 'verde', '#3c9a46'],
  [/brown/i, 'pardo', '#7b4a24'],
  [/black/i, 'negro', '#1d1d1f'],
  [/gr[ae]y/i, 'gris', '#8d9096'],
];

/** Primera coincidencia (por posición en la frase) entre varias expresiones. */
function primera(texto, reglas) {
  let mejor = null;
  for (const [k, r] of reglas.entries()) {
    const m = r[0].exec(texto);
    if (m && (!mejor || m.index < mejor.pos)) mejor = { pos: m.index, k };
  }
  return mejor ? reglas[mejor.k] : null;
}

const ESTADOS = [
  [/(gas|gaseous)/i, 'gas'],
  [/liquid|oil|oily/i, 'líquido'],
  [/solid|crystal|powder|prism|needle|flake|granul|lump|pellet|leaflet|plate|scale|wax/i, 'sólido'],
];

function clasificar(texto, pe) {
  const t = texto.toLowerCase();
  let estado;
  if (pe !== null && pe !== undefined) {
    // Con punto de ebullición conocido: gas si hierve por debajo de 25 °C; si no, sólido o líquido según la frase
    estado = pe < 25 ? 'gas' : primera(texto, ESTADOS.filter((e) => e[1] !== 'gas'))?.[1] ?? null;
  } else estado = primera(texto, ESTADOS)?.[1] ?? null;
  let forma = null;
  if (estado === 'sólido') forma = /powder|granul/.test(t) ? 'polvo' : /crystal|prism|needle|plate|leaflet|scale/.test(t) ? 'cristal' : 'sólido';
  const c = primera(texto, COLORES);
  let color = c ? c[1] : null, hex = c ? c[2] : null;
  // Un polvo de cristales incoloros se ve blanco (dispersión de la luz)
  if (forma === 'polvo' && color === 'incoloro') (color = 'blanco'), (hex = '#f4f4f2');
  return { estado, forma, color, hex };
}

/**
 * Correcciones manuales cuando la frase elegida describe el producto comercial o una forma alterada
 * (se documenta el motivo). Los ácidos que solo existen en disolución no tienen muestra.
 */
const CORRECCIONES = {
  996: { estado: 'sólido', forma: 'cristal', color: 'incoloro', hex: null, motivo: 'El fenol funde a 41 °C: a 25 °C es sólido (cristales incoloros a blancos).' },
  1118: { estado: 'líquido', forma: null, color: 'incoloro', hex: null, motivo: 'El H₂SO₄ puro es un líquido aceitoso incoloro; el color oscuro corresponde al producto técnico.' },
  944: { estado: 'líquido', forma: null, color: 'incoloro', hex: null, motivo: 'El HNO₃ puro es incoloro; el rojo/amarillo se debe al NO₂ disuelto (ácido fumante o envejecido).' },
  6228: { estado: 'líquido', forma: null, color: 'incoloro', hex: null, motivo: 'La N,N-dimetilformamida es un líquido incoloro.' },
  1548943: { estado: 'sólido', forma: 'polvo', color: 'blanco', hex: '#f4f4f2', motivo: 'La capsaicina pura es un sólido cristalino blanco (el rojo es del ají).' },
  5816: { estado: 'sólido', forma: 'polvo', color: 'blanco', hex: '#f4f4f2', motivo: 'La adrenalina pura es blanca; se oscurece al oxidarse con el aire y la luz.' },
};
const SOLO_DISOLUCION = { 24529: 'ácido nitroso', 24341: 'ácido hipocloroso', 767: 'ácido carbónico' };

const salida = {};
const sinDato = [];
for (const m of catalogo) {
  if (m.categoria === 'ion') continue;
  let lista = [];
  for (const h of ['Physical+Description', 'Color%2FForm']) {
    try {
      lista = lista.concat(textos(JSON.parse(await descargar(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${m.cid}/JSON?heading=${h}`, { reintentos: 1 }))));
    } catch {
      /* sin esa sección */
    }
  }
  const pe = m.puntoEbullicion?.valor ?? null;
  // Primera descripción que permita clasificar el estado
  let elegido = null;
  for (const x of lista) {
    const c = clasificar(x.texto, pe);
    if (c.estado) {
      // Si no tiene color, se busca en otra frase (p. ej. la de «Color/Form»)
      if (!c.color) {
        const otro = lista.find((y) => clasificar(y.texto, pe).color);
        if (otro) Object.assign(c, { color: clasificar(otro.texto, pe).color, hex: clasificar(otro.texto, pe).hex });
      }
      elegido = { ...c, descripcion: x.texto.slice(0, 220), fuente: x.fuente };
      break;
    }
  }
  if (!elegido && pe !== null && pe < 25) elegido = { estado: 'gas', forma: null, color: null, hex: null, descripcion: `Punto de ebullición ${pe} °C`, fuente: 'PubChem (punto de ebullición)' };
  if (SOLO_DISOLUCION[m.cid]) elegido = { estado: null, forma: null, color: null, hex: null, soloDisolucion: true, descripcion: 'Solo existe en disolución acuosa: no se puede aislar como sustancia pura.', fuente: 'Chang, Química' };
  if (CORRECCIONES[m.cid] && elegido) elegido = { ...elegido, ...CORRECCIONES[m.cid], fuente: `${elegido.fuente} (corrección: ${CORRECCIONES[m.cid].motivo})` };
  if (elegido) delete elegido.motivo;
  if (elegido) salida[m.cid] = elegido;
  else sinDato.push(m.nombre);
  console.log(`  ${String(m.cid).padEnd(9)} ${m.nombre.padEnd(34)} ${elegido ? `${elegido.estado} ${elegido.forma ?? ''} ${elegido.color ?? ''}` : '—'}`);
}

guardarJSON('src/data/apariencia-compuestos.json', {
  fuente: {
    nombre: 'PubChem PUG View: «Physical Description» y «Color/Form» (CAMEO Chemicals, HSDB, ICSC…)',
    licencia: 'Dominio público / según la fuente citada en cada entrada',
    descargado: hoy(),
    pendienteRevision: true,
    notas: 'Estado, forma y color se clasifican automáticamente a partir de la frase original (en inglés), que se conserva.',
  },
  sinDato,
  compuestos: salida,
});
