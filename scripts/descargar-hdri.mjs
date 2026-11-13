// HDRI de estudio para la iluminación de las muestras 3D (reflejos reales en metales), guardado en
// public/hdri para que funcione sin conexión. Poly Haven, «Studio Small 09» de Sergej Majboroda (CC0).
// Uso: node scripts/descargar-hdri.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './lib/util.mjs';

const URL_HDRI = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr';
const r = await fetch(URL_HDRI);
if (!r.ok) throw new Error(`HTTP ${r.status}`);
const destino = join(RAIZ, 'public', 'hdri', 'estudio_1k.hdr');
mkdirSync(join(RAIZ, 'public', 'hdri'), { recursive: true });
writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
console.log('✔ public/hdri/estudio_1k.hdr');
