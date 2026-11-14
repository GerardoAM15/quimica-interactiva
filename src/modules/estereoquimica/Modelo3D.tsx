import { useMemo } from 'react';
import { alinearPorCentro, centrosEstereo, coordenadas3DEstereo, imagenEspecular } from '@/chem/estereo';
import type { Molecula } from '@/chem/molecula';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula } from '@/components/molecula/Molecula3D';

const AVISO = 'Geometría 3D aproximada; la configuración de cada centro es la del dibujo.';
const AVISO_INEXACTA = 'No se pudo reproducir en 3D la configuración de todos los centros: usa el dibujo 2D como referencia.';

/** Modelo 3D de una molécula con la configuración R/S indicada por sus cuñas. */
export default function Modelo3D({ molecula, seleccion, titulo }: { molecula: Molecula; seleccion?: number[]; titulo: string }) {
  const r = useMemo(() => coordenadas3DEstereo(molecula), [molecula]);
  return (
    <div>
      <Escena3D descripcion={`Modelo 3D de ${titulo}`} camara={[0, 0, radioMolecula(r.molecula) * 2.6]} className="h-[260px]" autoRotar>
        <Molecula3D molecula={r.molecula} seleccion={seleccion} />
      </Escena3D>
      <p className="mt-1 text-xs text-texto-suave">{r.exacta ? AVISO : AVISO_INEXACTA}</p>
    </div>
  );
}

/**
 * Una molécula y su imagen especular. Lado a lado con el plano del espejo entre ambas, o superpuestas:
 * se alinean el centro y sus dos sustituyentes de mayor prioridad, y la imagen (en alambre) deja ver
 * que los otros dos sustituyentes quedan intercambiados si la molécula es quiral.
 */
export function Espejo3D({ molecula, superponer, titulo }: { molecula: Molecula; superponer: boolean; titulo: string }) {
  const { original, reflejo, radio, exacta } = useMemo(() => {
    const r = coordenadas3DEstereo(molecula);
    const original = r.molecula;
    const espejo = imagenEspecular(original);
    const c = centrosEstereo(original)[0];
    // Sin centros estereogénicos no hay nada que alinear: se muestra el reflejo tal cual
    const reflejo = c ? alinearPorCentro(original, espejo, c.atomo, c.sustituyentes[0]!.atomo, c.sustituyentes[1]!.atomo) : espejo;
    return { original, reflejo, radio: radioMolecula(original), exacta: r.exacta };
  }, [molecula]);
  const separacion = radio * 1.1;
  return (
    <div>
      <Escena3D
        key={superponer ? 'superpuestas' : 'espejo'}
        descripcion={superponer ? `${titulo} superpuesta con su imagen especular` : `${titulo} y su imagen especular, separadas por el plano del espejo`}
        camara={[0, 0, radio * (superponer ? 2.3 : 3.4)]}
        className="h-[300px]"
      >
        {superponer ? (
          <>
            <Molecula3D molecula={original} />
            <Molecula3D molecula={reflejo} estilo="alambre" />
          </>
        ) : (
          // Escena algo girada para que el plano del espejo no quede de canto
          <group rotation={[0.12, -0.45, 0]}>
            <group position={[-separacion, 0, 0]}>
              <Molecula3D molecula={original} />
            </group>
            <group position={[separacion, 0, 0]}>
              <Molecula3D molecula={imagenEspecular(original)} />
            </group>
            {/* Plano del espejo */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[radio * 2.6, radio * 2.6]} />
              <meshBasicMaterial color="#9fd3ff" transparent opacity={0.32} side={2} depthWrite={false} />
            </mesh>
          </group>
        )}
      </Escena3D>
      <p className="mt-1 text-xs text-texto-suave">{exacta ? AVISO : AVISO_INEXACTA}</p>
    </div>
  );
}
