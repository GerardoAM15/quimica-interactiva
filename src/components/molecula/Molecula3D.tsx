import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { elementoPorSimbolo } from '@/chem/elements';
import { centroide, pos, type Molecula, type Vec3 } from '@/chem/molecula';

export type EstiloMolecula = 'bolas' | 'espacio' | 'alambre';

interface Props {
  molecula: Molecula;
  estilo?: EstiloMolecula;
  seleccion?: number[];
  alElegirAtomo?: (i: number) => void;
  etiquetas?: boolean;
  /** Vector del momento dipolar (se dibuja como flecha desde el centro). */
  dipolo?: Vec3 | null;
}

/** Colores CPK de PubChem (el H se dibuja blanco). */
export function colorAtomo(simbolo: string): string {
  if (simbolo === 'H') return '#f2f2f2';
  return elementoPorSimbolo(simbolo)?.colorCPK ?? '#ff1493';
}

/** Radio de van der Waals en Å (PubChem). */
export const radioVdW = (s: string) => (elementoPorSimbolo(s)?.radioVdW ?? 170) / 100;

const ARRIBA = new THREE.Vector3(0, 1, 0);

function Flecha({ desde, hacia, color }: { desde: THREE.Vector3; hacia: THREE.Vector3; color: string }) {
  const dir = hacia.clone().sub(desde);
  const largo = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, dir.clone().normalize());
  const cuerpo = Math.max(0.01, largo - 0.35);
  return (
    <group position={desde} quaternion={q}>
      <mesh position={[0, cuerpo / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, cuerpo, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, cuerpo + 0.17, 0]}>
        <coneGeometry args={[0.16, 0.35, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Molécula en 3D: bolas y barras, espacio lleno (radios de van der Waals) o alambre.
 * Los enlaces dobles y triples se dibujan como 2 o 3 cilindros paralelos.
 */
export function Molecula3D({ molecula, estilo = 'bolas', seleccion = [], alElegirAtomo, etiquetas = false, dipolo = null }: Props) {
  const centro = useMemo(() => new THREE.Vector3(...centroide(molecula.atomos.map(pos))), [molecula]);
  const esfera = useMemo(() => new THREE.SphereGeometry(1, 28, 20), []);
  const cilindro = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 12), []);

  const P = useMemo(() => molecula.atomos.map((a) => new THREE.Vector3(a.x, a.y, a.z).sub(centro)), [molecula, centro]);

  // Geometría de los enlaces (posiciones y orientaciones), con desplazamiento para enlaces múltiples
  const barras = useMemo(() => {
    const res: { pos: THREE.Vector3; quat: THREE.Quaternion; largo: number; colorA: string; colorB: string }[] = [];
    for (const e of molecula.enlaces) {
      const a = P[e.a]!, b = P[e.b]!;
      const dir = b.clone().sub(a);
      const largo = dir.length();
      const u = dir.clone().normalize();
      // Vector perpendicular para separar las barras de un enlace múltiple (en el plano de un vecino si existe)
      const vecino = molecula.enlaces.find((x) => x !== e && (x.a === e.a || x.b === e.a || x.a === e.b || x.b === e.b));
      let perp = new THREE.Vector3(0, 0, 1).cross(u);
      if (vecino) {
        const otro = [vecino.a, vecino.b].find((i) => i !== e.a && i !== e.b)!;
        perp = P[otro]!.clone().sub(a).cross(u).cross(u);
      }
      if (perp.lengthSq() < 1e-6) perp = new THREE.Vector3(1, 0, 0).cross(u);
      perp.normalize();
      const desplazamientos = e.orden === 1 ? [0] : e.orden === 2 ? [-0.09, 0.09] : [-0.13, 0, 0.13];
      const quat = new THREE.Quaternion().setFromUnitVectors(ARRIBA, u);
      for (const d of desplazamientos) {
        const medio = a.clone().add(b).multiplyScalar(0.5).add(perp.clone().multiplyScalar(d));
        res.push({ pos: medio, quat, largo, colorA: colorAtomo(molecula.atomos[e.a]!.simbolo), colorB: colorAtomo(molecula.atomos[e.b]!.simbolo) });
      }
    }
    return res;
  }, [molecula, P]);

  const radioAtomo = (s: string) => (estilo === 'espacio' ? radioVdW(s) : estilo === 'alambre' ? 0.06 : Math.max(0.18, radioVdW(s) * 0.24));
  const radioBarra = estilo === 'alambre' ? 0.04 : 0.075;

  return (
    <group>
      {molecula.atomos.map((a, i) => {
        const sel = seleccion.includes(i);
        return (
          <mesh
            key={i}
            geometry={esfera}
            position={P[i]}
            scale={radioAtomo(a.simbolo) * (sel ? 1.12 : 1)}
            onClick={(ev) => {
              ev.stopPropagation();
              alElegirAtomo?.(i);
            }}
            onPointerOver={(ev) => {
              ev.stopPropagation();
              if (alElegirAtomo) document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <meshStandardMaterial color={colorAtomo(a.simbolo)} roughness={0.35} metalness={0.05} emissive={sel ? '#facc15' : '#000000'} emissiveIntensity={sel ? 0.55 : 0} />
          </mesh>
        );
      })}
      {estilo !== 'espacio' &&
        barras.map((b, i) => (
          // Cada enlace se dibuja en dos mitades, cada una con el color de su átomo
          <group key={i} position={b.pos} quaternion={b.quat}>
            <mesh geometry={cilindro} position={[0, -b.largo / 4, 0]} scale={[radioBarra, b.largo / 2, radioBarra]}>
              <meshStandardMaterial color={b.colorA} roughness={0.45} />
            </mesh>
            <mesh geometry={cilindro} position={[0, b.largo / 4, 0]} scale={[radioBarra, b.largo / 2, radioBarra]}>
              <meshStandardMaterial color={b.colorB} roughness={0.45} />
            </mesh>
          </group>
        ))}
      {etiquetas &&
        molecula.atomos.map((a, i) => (
          <Html key={`t${i}`} position={P[i]} center zIndexRange={[10, 0]}>
            <span className="pointer-events-none rounded bg-black/55 px-1 text-[10px] font-semibold text-white select-none">
              {a.simbolo}
              {i + 1}
            </span>
          </Html>
        ))}
      {dipolo && Math.hypot(...dipolo) > 1e-3 && (
        <Flecha desde={new THREE.Vector3(0, 0, 0)} hacia={new THREE.Vector3(...dipolo).normalize().multiplyScalar(1.8)} color="#a855f7" />
      )}
    </group>
  );
}

/** Radio de la molécula (para encuadrar la cámara). */
export function radioMolecula(m: Molecula): number {
  const c = centroide(m.atomos.map(pos));
  return Math.max(1.5, ...m.atomos.map((a) => Math.hypot(a.x - c[0], a.y - c[1], a.z - c[2]) + radioVdW(a.simbolo)));
}
