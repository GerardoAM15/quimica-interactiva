import { lazy, Suspense, useEffect, useState } from 'react';
import { cargarRDKit, type RDKit } from '@/lib/rdkit';
import { grafoDeMolecula, type GrafoOrg } from '@/chem/nomenclatura/organica';
import { parsearMolfile } from '@/chem/molecula';
import { Cargando } from '@/components/Cargando';

const Vista3D = lazy(() => import('./VistaOrganica3D'));

/** RDKit compartido por los módulos de orgánica (carga diferida). */
export function useRDKit() {
  const [R, setR] = useState<RDKit | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    cargarRDKit()
      .then((r) => vivo && setR(r))
      .catch((e: Error) => vivo && setError(`No se pudo cargar RDKit: ${e.message}`));
    return () => {
      vivo = false;
    };
  }, []);
  return { R, error };
}

/** SMILES → grafo sin H, con los mismos índices de átomo que RDKit (para resaltar). */
export function grafoDesdeSmiles(R: RDKit, smiles: string): GrafoOrg {
  const m = R.get_mol(smiles);
  if (!m || !m.is_valid()) {
    m?.delete();
    throw new Error('SMILES no válido.');
  }
  try {
    return grafoDeMolecula(parsearMolfile(m.get_molblock(JSON.stringify({ kekulize: true }))));
  } finally {
    m.delete();
  }
}

/** Dibujo 2D con RDKit; opcionalmente resalta átomos con colores RGB (0–1) y muestra los H. */
export function svgEstructura(R: RDKit, smiles: string, opciones: { ancho?: number; alto?: number; colores?: Record<number, [number, number, number]>; conH?: boolean; notas?: Record<number, string> } = {}): string | null {
  // Notas de átomo (numeración) como propiedad «atomNote» en la extensión CXSMILES
  const notas = opciones.notas && Object.keys(opciones.notas).length && !smiles.includes('|')
    ? ` |atomProp:${Object.entries(opciones.notas).map(([i, t]) => `${i}.atomNote.${t}`).join(':')}|`
    : '';
  let m = R.get_mol(smiles + notas);
  if (!m || !m.is_valid()) {
    m?.delete();
    return null;
  }
  try {
    if (opciones.conH) {
      const h = R.get_mol(m.add_hs());
      m.delete();
      m = h;
      if (!m) return null;
    }
    const colores = opciones.colores ?? {};
    const atomos = Object.keys(colores).map(Number);
    return m.get_svg_with_highlights(
      JSON.stringify({
        width: opciones.ancho ?? 320,
        height: opciones.alto ?? 220,
        bondLineWidth: 1.6,
        backgroundColour: [1, 1, 1, 0],
        atoms: atomos,
        bonds: [],
        highlightAtomColors: colores,
        highlightAtomRadii: Object.fromEntries(atomos.map((a) => [a, 0.3])),
        annotationFontScale: 0.9,
      }),
    );
  } finally {
    m?.delete();
  }
}

interface Props {
  smiles: string;
  titulo: string;
  ancho?: number;
  alto?: number;
  colores?: Record<number, [number, number, number]>;
  conH?: boolean;
  /** Muestra el botón para ver la molécula en 3D. */
  con3D?: boolean;
}

/** Estructura orgánica: dibujo 2D (RDKit) y, a pedido, modelo 3D. */
export function VistaOrganica({ smiles, titulo, ancho = 320, alto = 220, colores, conH, con3D = true }: Props) {
  const { R, error } = useRDKit();
  const [ver3D, setVer3D] = useState(false);
  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!R) return <div className="flex h-[140px] items-center text-sm text-texto-suave">Cargando RDKit…</div>;
  const svg = svgEstructura(R, smiles, { ancho, alto, colores, conH });
  if (!svg) return <p className="text-sm text-error">Estructura no válida.</p>;
  return (
    <div className="space-y-2">
      <figure className="inline-block rounded-md bg-white p-1" role="img" aria-label={`Fórmula estructural de ${titulo}`}>
        <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: ancho, maxWidth: '100%' }} className="[&_svg]:h-auto [&_svg]:max-w-full" />
      </figure>
      {con3D && (
        <div>
          <button type="button" onClick={() => setVer3D((v) => !v)} className="rounded-md border border-borde px-3 py-1 text-sm hover:bg-superficie-2" aria-expanded={ver3D}>
            {ver3D ? 'Ocultar 3D' : 'Ver en 3D'}
          </button>
          {ver3D && (
            <Suspense fallback={<Cargando />}>
              <Vista3D R={R} smiles={smiles} titulo={titulo} />
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
}
