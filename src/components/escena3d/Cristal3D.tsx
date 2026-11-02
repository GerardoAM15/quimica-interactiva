import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SitioRed } from '@/chem/cristales';

/** Escala de la escena: 1 unidad = 100 pm. */
const ESCALA = 1 / 100;

interface Props {
  sitios: SitioRed[];
  /** Radio de cada especie en pm. */
  radios: Record<string, number>;
  colores: Record<string, string>;
  /** Celda a dibujar: cúbica de arista a, prisma hexagonal (a, c) o ninguna. */
  celda?: { tipo: 'cubica'; a: number } | { tipo: 'hexagonal'; a: number; c: number } | null;
  /** Recorta las esferas a la celda cúbica, mostrando la fracción que le pertenece. */
  recortar?: boolean;
  /** Dibuja enlaces entre vecinos más cercanos (diamante, grafito). */
  enlaces?: number | null;
  metalico?: boolean;
}

function aristasCubo(a: number): THREE.BufferGeometry {
  const h = (a * ESCALA) / 2;
  return new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * h, 2 * h, 2 * h));
}

function aristasPrismaHex(a: number, c: number): THREE.BufferGeometry {
  const s = a * ESCALA, hz = (c * ESCALA) / 2;
  const pts: number[] = [];
  const v = (k: number, z: number) => [s * Math.cos((k * Math.PI) / 3), s * Math.sin((k * Math.PI) / 3), z];
  for (let k = 0; k < 6; k++) {
    for (const z of [-hz, hz]) pts.push(...v(k, z), ...v(k + 1, z));
    pts.push(...v(k, -hz), ...v(k, hz));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Red cristalina 3D (esferas + celda unitaria). El eje c del hexagonal se muestra vertical. */
export function Cristal3D({ sitios, radios, colores, celda, recortar = false, enlaces = null, metalico = false }: Props) {
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = recortar;

  const planos = useMemo(() => {
    if (!recortar || celda?.tipo !== 'cubica') return [];
    const h = (celda.a * ESCALA) / 2 + 1e-4;
    const ejes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
    return ejes.flatMap((e) => [new THREE.Plane(e.clone().negate(), h), new THREE.Plane(e.clone(), h)]);
  }, [recortar, celda]);

  const geoEsfera = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const materiales = useMemo(() => {
    const m: Record<string, THREE.MeshStandardMaterial> = {};
    for (const [esp, color] of Object.entries(colores)) {
      m[esp] = new THREE.MeshStandardMaterial({
        color,
        roughness: metalico ? 0.3 : 0.45,
        metalness: metalico ? 0.75 : 0.05,
        clippingPlanes: planos,
        clipShadows: true,
        side: planos.length ? THREE.DoubleSide : THREE.FrontSide,
      });
    }
    return m;
  }, [colores, planos, metalico]);

  const lineas = useMemo(() => {
    if (!celda) return null;
    return celda.tipo === 'cubica' ? aristasCubo(celda.a) : aristasPrismaHex(celda.a, celda.c);
  }, [celda]);

  // Enlaces: pares a distancia ≈ «enlaces» (pm)
  const cilindros = useMemo(() => {
    if (!enlaces) return [];
    const res: { pos: THREE.Vector3; quat: THREE.Quaternion; largo: number }[] = [];
    const arriba = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < sitios.length; i++) {
      for (let j = i + 1; j < sitios.length; j++) {
        const a = new THREE.Vector3(...sitios[i]!.posicion), b = new THREE.Vector3(...sitios[j]!.posicion);
        const d = a.distanceTo(b);
        if (Math.abs(d - enlaces) > enlaces * 0.05) continue;
        const dir = b.clone().sub(a).normalize();
        res.push({
          pos: a.add(b).multiplyScalar(0.5 * ESCALA),
          quat: new THREE.Quaternion().setFromUnitVectors(arriba, dir),
          largo: d * ESCALA,
        });
      }
    }
    return res;
  }, [sitios, enlaces]);

  // El eje c (z en chem/cristales) se dibuja vertical (y en three.js)
  const rotacion: [number, number, number] = celda?.tipo === 'hexagonal' || enlaces ? [-Math.PI / 2, 0, 0] : [0, 0, 0];

  return (
    <group rotation={rotacion}>
      {sitios.map((s, i) => (
        <mesh
          key={i}
          geometry={geoEsfera}
          material={materiales[s.especie]}
          position={[s.posicion[0] * ESCALA, s.posicion[1] * ESCALA, s.posicion[2] * ESCALA]}
          scale={(radios[s.especie] ?? 50) * ESCALA}
        />
      ))}
      {cilindros.map((c, i) => (
        <mesh key={`e${i}`} position={c.pos} quaternion={c.quat}>
          <cylinderGeometry args={[0.07, 0.07, c.largo, 10]} />
          <meshStandardMaterial color="#9aa3b5" roughness={0.6} />
        </mesh>
      ))}
      {lineas && (
        <lineSegments geometry={lineas}>
          <lineBasicMaterial color="#facc15" />
        </lineSegments>
      )}
    </group>
  );
}
