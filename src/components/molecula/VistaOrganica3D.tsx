import { useEffect, useState } from 'react';
import type { RDKit } from '@/lib/rdkit';
import { analizarEstructura } from '@/lib/rdkit';
import { generarCoordenadas3D } from '@/chem/coordenadas3d';
import type { Molecula } from '@/chem/molecula';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula } from './Molecula3D';
import { cargarDelCatalogo, catalogoPorCanonico, DESCRIPCION_ORIGEN, type OrigenGeometria } from './cargarMolecula';

/** Modelo 3D: conformero de PubChem si la molécula está en el catálogo; si no, geometría aproximada. */
export default function VistaOrganica3D({ R, smiles, titulo }: { R: RDKit; smiles: string; titulo: string }) {
  const [mol, setMol] = useState<{ molecula: Molecula; origen: OrigenGeometria } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    setMol(null);
    try {
      const r = analizarEstructura(R, smiles);
      const cat = catalogoPorCanonico(R).get(r.smilesCanonico);
      if (cat?.tiene3D) {
        void cargarDelCatalogo(cat.cid)
          .then((m) => vivo && setMol(m))
          .catch(() => vivo && setMol({ molecula: generarCoordenadas3D(r.molecula), origen: 'aproximada' }));
      } else setMol({ molecula: generarCoordenadas3D(r.molecula), origen: 'aproximada' });
    } catch (e) {
      setError((e as Error).message);
    }
    return () => {
      vivo = false;
    };
  }, [R, smiles]);
  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!mol) return <p className="text-sm text-texto-suave">Generando modelo 3D…</p>;
  return (
    <div className="mt-2">
      <Escena3D descripcion={`Modelo 3D de ${titulo}`} camara={[0, 0, radioMolecula(mol.molecula) * 2.6]} className="h-[260px]" autoRotar>
        <Molecula3D molecula={mol.molecula} />
      </Escena3D>
      <p className="mt-1 text-xs text-texto-suave">{DESCRIPCION_ORIGEN[mol.origen]}</p>
    </div>
  );
}
