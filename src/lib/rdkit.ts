/**
 * Carga diferida de RDKit.js (WebAssembly, ~7 MB). Solo los módulos que lo usan lo descargan; el
 * service worker lo guarda para uso sin conexión.
 *
 * RDKit se usa SOLO para estructura molecular: leer SMILES/molfile, validar valencias, agregar H,
 * coordenadas 2D, SMILES canónico y dibujo 2D. La química (VSEPR, Lewis, polaridad…) está en src/chem.
 */
import type { MainModule, Mol } from '@rdkit/rdkit';
import { parsearMolfile, type Molecula } from '@/chem/molecula';

export type RDKit = MainModule;

let promesa: Promise<RDKit> | null = null;

export function cargarRDKit(): Promise<RDKit> {
  promesa ??= (async () => {
    const [{ default: iniciar }, { default: urlWasm }] = await Promise.all([
      import('@rdkit/rdkit'),
      import('@rdkit/rdkit/RDKit_minimal.wasm?url'),
    ]);
    const R = await iniciar({ locateFile: () => urlWasm });
    R.prefer_coordgen(true);
    return R;
  })();
  promesa.catch(() => (promesa = null));
  return promesa;
}

/** Traduce los mensajes de error más comunes de RDKit. */
function traducirError(log: string): string {
  const valencia = /Explicit valence for atom # (\d+) (\w+), (\d+), is greater than permitted/.exec(log);
  if (valencia) {
    return `El átomo n.º ${Number(valencia[1]) + 1} (${valencia[2]}) tiene ${valencia[3]} enlaces, más de los que permite su valencia.`;
  }
  if (/Can't kekulize/i.test(log)) return 'No se puede asignar una estructura de enlaces alternados al anillo aromático (revisa los H en los N del anillo).';
  if (/SMILES Parse Error/i.test(log)) return 'El SMILES tiene un error de sintaxis.';
  if (/Unclosed ring/i.test(log)) return 'Hay un anillo sin cerrar en el SMILES.';
  return log.trim() ? `Estructura no válida: ${log.trim().split('\n').at(-1)!.replace(/^\[[^\]]*\]\s*/, '')}` : 'Estructura no válida.';
}

export interface ResultadoRDKit {
  /** Molécula con H explícitos, coordenadas 2D y forma de Kekulé. */
  molecula: Molecula;
  smilesCanonico: string;
  masaMolar: number;
  /** Dibujo 2D (sin H explícitos), SVG con fondo transparente. */
  svg: string;
}

/**
 * Interpreta un SMILES o un molfile, agrega hidrógenos y calcula coordenadas 2D.
 * Lanza un Error con un mensaje en español si la estructura no es válida.
 */
export function analizarEstructura(R: RDKit, entrada: string, { ancho = 320, alto = 220 } = {}): ResultadoRDKit {
  const log = R.set_log_capture('rdApp.*');
  log?.clear_buffer();
  let mol: Mol | null = null;
  let conH: Mol | null = null;
  try {
    // Un molfile empieza con una línea de título que puede estar vacía: solo se recortan los SMILES
    mol = R.get_mol(entrada.includes('\n') ? entrada : entrada.trim());
    if (!mol || !mol.is_valid()) throw new Error(traducirError(log?.get_buffer() ?? ''));
    conH = R.get_mol(mol.add_hs());
    if (!conH) throw new Error(traducirError(log?.get_buffer() ?? ''));
    conH.set_new_coords(true);
    const molecula = parsearMolfile(conH.get_molblock(JSON.stringify({ kekulize: true })));
    const smilesCanonico = mol.get_smiles();
    const masaMolar = Number(JSON.parse(mol.get_descriptors()).amw);
    const svg = mol.get_svg_with_highlights(JSON.stringify({ width: ancho, height: alto, bondLineWidth: 1.6, backgroundColour: [1, 1, 1, 0], addStereoAnnotation: true }));
    return { molecula, smilesCanonico, masaMolar, svg };
  } finally {
    mol?.delete();
    conH?.delete();
    log?.delete();
  }
}

/** Coordenadas 2D sin hidrógenos explícitos (esqueleto para el editor del constructor). */
export function esqueleto2D(R: RDKit, smiles: string): Molecula {
  const m = R.get_mol(smiles);
  if (!m || !m.is_valid()) throw new Error('SMILES no válido.');
  try {
    m.set_new_coords(true);
    return parsearMolfile(m.get_molblock(JSON.stringify({ kekulize: true })));
  } finally {
    m.delete();
  }
}

/** SMILES canónico (o null si no es válido), para comparar estructuras. */
export function smilesCanonico(R: RDKit, entrada: string): string | null {
  const m = R.get_mol(entrada);
  if (!m) return null;
  try {
    return m.is_valid() ? m.get_smiles() : null;
  } finally {
    m.delete();
  }
}

/** Molfile → SVG 2D (para dibujar estructuras del constructor o del catálogo). */
export function svgDesdeMolfile(R: RDKit, molfile: string, ancho = 320, alto = 220): string | null {
  const m = R.get_mol(molfile);
  if (!m) return null;
  try {
    return m.get_svg_with_highlights(JSON.stringify({ width: ancho, height: alto, bondLineWidth: 1.6, backgroundColour: [1, 1, 1, 0] }));
  } finally {
    m.delete();
  }
}
