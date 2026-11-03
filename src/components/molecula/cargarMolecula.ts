/**
 * Obtención de estructuras moleculares: catálogo local (sin conexión), PubChem en vivo y geometría
 * generada. Decide qué geometría mostrar y lo informa para rotularlo en la interfaz.
 */
import catalogo from '@/data/moleculas.json';
import { parsearMolfile, type Molecula } from '@/chem/molecula';
import { esHipervalente, generarCoordenadas3D, geometriaEstrella } from '@/chem/coordenadas3d';
import { smilesCanonico, type RDKit } from '@/lib/rdkit';

export type EntradaCatalogo = (typeof catalogo.moleculas)[number];
export const CATALOGO: readonly EntradaCatalogo[] = catalogo.moleculas;
export const FUENTE_CATALOGO = catalogo.fuente;

export type OrigenGeometria = 'pubchem-3d' | 'vsepr' | 'aproximada';

export const DESCRIPCION_ORIGEN: Record<OrigenGeometria, string> = {
  'pubchem-3d': 'Conformero 3D de PubChem',
  vsepr: 'Geometría ideal según VSEPR',
  aproximada: 'Geometría 3D aproximada (generada por la aplicación)',
};

export interface MoleculaCargada {
  molecula: Molecula;
  origen: OrigenGeometria;
}

/**
 * Elige la geometría: el conformero de PubChem salvo para hipervalentes (SF₄, ClF₃…, cuyos conformeros
 * de campos de fuerzas son incorrectos) o si solo hay 2D; en esos casos, VSEPR o geometría aproximada.
 */
export function elegirGeometria(mol: Molecula): MoleculaCargada {
  if (mol.es3D && !esHipervalente(mol)) return { molecula: mol, origen: 'pubchem-3d' };
  const estrella = geometriaEstrella(mol);
  if (estrella) return { molecula: estrella, origen: 'vsepr' };
  return { molecula: generarCoordenadas3D(mol), origen: 'aproximada' };
}

const cache = new Map<number, Promise<Molecula>>();

/** Lee el SDF del catálogo (archivo estático, disponible sin conexión gracias al service worker). */
export function molfileCatalogo(cid: number): Promise<Molecula> {
  if (!cache.has(cid)) {
    const p = fetch(`./moleculas/${cid}.sdf`)
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudo leer la estructura (${r.status}).`);
        return r.text();
      })
      .then(parsearMolfile);
    p.catch(() => cache.delete(cid));
    cache.set(cid, p);
  }
  return cache.get(cid)!;
}

export async function cargarDelCatalogo(cid: number): Promise<MoleculaCargada> {
  return elegirGeometria(await molfileCatalogo(cid));
}

export interface ResultadoPubChem {
  cid: number;
  nombre: string;
  formula: string;
  masaMolar: number;
  iupac: string | null;
  smiles: string;
  carga: number;
  cargada: MoleculaCargada;
}

const PUG = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

/** Busca en PubChem por nombre (en inglés), SMILES o fórmula y descarga su estructura. Requiere conexión. */
export async function buscarEnPubChem(consulta: string, tipo: 'nombre' | 'smiles', senal?: AbortSignal): Promise<ResultadoPubChem> {
  const ruta = tipo === 'smiles' ? `compound/smiles/${encodeURIComponent(consulta)}` : `compound/name/${encodeURIComponent(consulta)}`;
  const r = await fetch(`${PUG}/${ruta}/property/MolecularFormula,MolecularWeight,IUPACName,SMILES,Charge,Title/JSON`, { signal: senal });
  if (r.status === 404) throw new Error('PubChem no encontró ese compuesto (busca el nombre en inglés o usa un SMILES).');
  if (!r.ok) throw new Error(`PubChem respondió con un error (${r.status}).`);
  const p = (await r.json()).PropertyTable.Properties[0];
  let sdf = await fetch(`${PUG}/compound/cid/${p.CID}/SDF?record_type=3d`, { signal: senal });
  if (!sdf.ok) sdf = await fetch(`${PUG}/compound/cid/${p.CID}/SDF?record_type=2d`, { signal: senal });
  if (!sdf.ok) throw new Error('PubChem no tiene estructura para ese compuesto.');
  const mol = parsearMolfile((await sdf.text()).split(/\r?\nM {2}END/)[0] + '\nM  END\n');
  return {
    cid: p.CID,
    nombre: p.Title ?? consulta,
    formula: p.MolecularFormula,
    masaMolar: Number(p.MolecularWeight),
    iupac: p.IUPACName ?? null,
    smiles: p.SMILES,
    carga: p.Charge ?? 0,
    cargada: elegirGeometria(mol),
  };
}

/** SMILES canónico → entrada del catálogo (se calcula una sola vez). */
let mapaCanonico: Map<string, EntradaCatalogo> | null = null;
export function catalogoPorCanonico(R: RDKit): Map<string, EntradaCatalogo> {
  if (!mapaCanonico) {
    mapaCanonico = new Map();
    // RDKit rechaza algunos hipervalentes (BrF₅, IF₅…): se captura su log para no llenar la consola
    const log = R.set_log_capture('rdApp.*');
    for (const m of CATALOGO) {
      const c = smilesCanonico(R, m.smiles);
      if (c && !mapaCanonico.has(c)) mapaCanonico.set(c, m);
    }
    log?.delete();
  }
  return mapaCanonico;
}

