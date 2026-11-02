import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { Lobulo } from './orbitales.worker';

export const COLOR_FASE_POSITIVA = '#3b82f6';
export const COLOR_FASE_NEGATIVA = '#f97316';
/** Colores para distinguir los híbridos de un mismo conjunto. */
export const COLORES_HIBRIDOS = ['#3b82f6', '#22c55e', '#eab308', '#ec4899'];

interface Props {
  lobulos: Lobulo[];
  /** Semilado de la caja en a₀; se escala para que todo orbital ocupe un tamaño similar en pantalla. */
  L: number;
  opacidad: number;
  modoHibrido?: boolean;
  mostrarEjes?: boolean;
}

function Eje({ dir, color, etiqueta, largo }: { dir: [number, number, number]; color: string; etiqueta: string; largo: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-dir[0] * largo, -dir[1] * largo, -dir[2] * largo, dir[0] * largo, dir[1] * largo, dir[2] * largo], 3));
    return g;
  }, [dir, largo]);
  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={color} />
      </lineSegments>
      <Html position={[dir[0] * largo * 1.06, dir[1] * largo * 1.06, dir[2] * largo * 1.06]} center>
        <span className="pointer-events-none text-xs font-bold select-none" style={{ color }}>
          {etiqueta}
        </span>
      </Html>
    </group>
  );
}

/**
 * Dibuja las isosuperficies. Convención química: z hacia arriba; en three.js el eje vertical es y,
 * así que se rota el grupo −90° alrededor de x.
 */
export function Lobulos3D({ lobulos, L, opacidad, modoHibrido = false, mostrarEjes = true }: Props) {
  const escala = 3 / L;
  const geometrias = useMemo(
    () =>
      lobulos.map((lb) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(lb.posiciones, 3));
        g.setAttribute('normal', new THREE.BufferAttribute(lb.normales, 3));
        return g;
      }),
    [lobulos],
  );
  useEffect(() => () => geometrias.forEach((g) => g.dispose()), [geometrias]);

  return (
    <group>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={escala}>
        {lobulos.map((lb, i) => {
          const color = modoHibrido
            ? lb.signo > 0
              ? COLORES_HIBRIDOS[lb.indice % COLORES_HIBRIDOS.length]
              : '#9ca3af'
            : lb.signo > 0
              ? COLOR_FASE_POSITIVA
              : COLOR_FASE_NEGATIVA;
          return (
            <mesh key={i} geometry={geometrias[i]}>
              <meshPhysicalMaterial
                color={color}
                roughness={0.35}
                clearcoat={0.4}
                transparent={opacidad < 1}
                opacity={modoHibrido && lb.signo < 0 ? opacidad * 0.45 : opacidad}
                depthWrite={opacidad >= 1}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
      {mostrarEjes && (
        <group>
          {/* x (rojo), y (verde), z (azul, vertical) — mismo sistema químico tras la rotación */}
          <Eje dir={[1, 0, 0]} color="#f87171" etiqueta="x" largo={3.4} />
          <Eje dir={[0, 0, -1]} color="#4ade80" etiqueta="y" largo={3.4} />
          <Eje dir={[0, 1, 0]} color="#60a5fa" etiqueta="z" largo={3.4} />
        </group>
      )}
    </group>
  );
}
