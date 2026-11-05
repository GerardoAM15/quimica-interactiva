/**
 * Primitivas 3D para «muestras» de sustancias (elementos y compuestos): trozo metálico, cristales,
 * polvo, matraz con líquido o gas y tubo de descarga. Materiales PBR aproximados.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Datos mínimos de aspecto que usan las primitivas. */
export interface AparienciaMuestra {
  color: string | null;
  rugosidad: number;
  metalicidad: number;
  metalico?: boolean;
}

/** Generador pseudoaleatorio con semilla (mulberry32): la misma muestra para el mismo elemento. */
export function aleatorio(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Trozo irregular: icosaedro subdividido con deformación suave de baja frecuencia.
 * Con `suave`, se unen los vértices duplicados para obtener normales continuas (metal pulido);
 * sin unir, cada cara conserva su normal (aspecto facetado de un cristal).
 */
export function geometriaTrozo(semilla: number, detalle = 4, rugosidad = 0.22, suave = true) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detalle);
  if (suave) {
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    g = mergeVertices(g);
  }
  const r = aleatorio(semilla);
  const ondas = Array.from({ length: 5 }, () => ({
    d: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
    f: 1 + r() * 2.5,
    a: (r() * rugosidad) / 2,
    fase: r() * 6.28,
  }));
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let k = 1;
    for (const o of ondas) k += o.a * Math.sin(o.f * v.dot(o.d) * 3 + o.fase);
    // Aplanado vertical: los trozos de metal reposan sobre una cara
    v.multiplyScalar(k).multiply(new THREE.Vector3(1.15, 0.72, 0.95));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function Metal({ ap, z }: { ap: AparienciaMuestra; z: number }) {
  const geo = useMemo(() => geometriaTrozo(z * 7919, 5, 0.16), [z]);
  return (
    <mesh geometry={geo} rotation={[0.2, 0.6, 0]}>
      <meshPhysicalMaterial color={ap.color ?? '#c9cdd3'} metalness={ap.metalicidad} roughness={ap.rugosidad} clearcoat={0.15} />
    </mesh>
  );
}

export function Cristales({ ap, z, transparente = false }: { ap: AparienciaMuestra; z: number; transparente?: boolean }) {
  const piezas = useMemo(() => {
    const r = aleatorio(z * 104729);
    return Array.from({ length: 9 }, (_, i) => {
      const ang = (i / 9) * Math.PI * 2 + r();
      const dist = i === 0 ? 0 : 0.5 + r() * 0.8;
      const s = i === 0 ? 0.85 : 0.25 + r() * 0.35;
      return {
        geo: geometriaTrozo(z * 31 + i, 1, 0.5, false),
        pos: [Math.cos(ang) * dist, -0.6 + s * 0.6, Math.sin(ang) * dist] as [number, number, number],
        rot: [r() * 3, r() * 3, r() * 3] as [number, number, number],
        s,
      };
    });
  }, [z]);
  return (
    <group>
      {piezas.map((p, i) => (
        <mesh key={i} geometry={p.geo} position={p.pos} rotation={p.rot} scale={p.s}>
          <meshPhysicalMaterial color={ap.color ?? '#999'} metalness={ap.metalicidad} roughness={ap.rugosidad} flatShading transparent={transparente} opacity={transparente ? 0.55 : 1} />
        </mesh>
      ))}
    </group>
  );
}

/** Perfil de un matraz de fondo redondo (para LatheGeometry). */
function perfilMatraz(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = -Math.PI / 2 + (i / 20) * Math.PI * 0.82;
    pts.push(new THREE.Vector2(Math.cos(a) * 1.1, Math.sin(a) * 1.1));
  }
  pts.push(new THREE.Vector2(0.32, 1.25), new THREE.Vector2(0.32, 2.1), new THREE.Vector2(0.36, 2.15));
  return pts;
}

// Vidrio: transparencia simple (no «transmission», que oculta lo que hay dentro y depende mucho de la GPU).
// Se dibuja después del contenido (renderOrder) y sin escribir profundidad.
const vidrio = { color: '#e6f0fa', transparent: true, opacity: 0.16, roughness: 0.04, metalness: 0, clearcoat: 1, depthWrite: false } as const;

export function Frasco({ ap, gas, vapor = false, opacidadGas = 0.38 }: { ap: AparienciaMuestra; gas: boolean; vapor?: boolean; opacidadGas?: number }) {
  const perfil = useMemo(() => perfilMatraz(), []);
  const color = ap.color ?? '#999999';
  return (
    <group position={[0, -0.3, 0]}>
      <mesh renderOrder={2}>
        <latheGeometry args={[perfil, 48]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
      {gas ? (
        // Gas coloreado llenando el matraz
        <mesh scale={0.96}>
          <sphereGeometry args={[1.1, 40, 24]} />
          <meshStandardMaterial color={color} transparent opacity={opacidadGas} depthWrite={false} />
        </mesh>
      ) : (
        <>
          {/* Líquido: casquete inferior de la esfera */}
          <mesh scale={0.97}>
            <sphereGeometry args={[1.1, 48, 24, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45]} />
            {ap.metalico ? (
              <meshPhysicalMaterial color={color} metalness={1} roughness={0.08} />
            ) : (
              <meshPhysicalMaterial color={color} roughness={0.12} clearcoat={0.6} transparent opacity={0.93} />
            )}
          </mesh>
          {/* Superficie del líquido */}
          {/* En la esfera y = R·cos θ: el borde del casquete (θ = 0,55π) queda algo por debajo del centro */}
          <mesh position={[0, 1.1 * Math.cos(Math.PI * 0.55) * 0.97, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.1 * Math.sin(Math.PI * 0.55) * 0.97, 48]} />
            <meshPhysicalMaterial color={color} metalness={ap.metalico ? 1 : 0} roughness={ap.metalico ? 0.05 : 0.45} />
          </mesh>
          {/* El bromo desprende vapor anaranjado */}
          {vapor && (
            <mesh position={[0, 0.55, 0]} scale={[0.9, 0.75, 0.9]}>
              <sphereGeometry args={[1, 32, 16]} />
              <meshStandardMaterial color="#d9622b" transparent opacity={0.18} depthWrite={false} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

export function TuboDescarga({ ap }: { ap: AparienciaMuestra }) {
  const brillo = useRef<THREE.MeshBasicMaterial>(null);
  const color = ap.color ?? '#dddddd';
  useFrame(({ clock }) => {
    if (brillo.current) brillo.current.opacity = 0.75 + 0.08 * Math.sin(clock.elapsedTime * 23) * Math.sin(clock.elapsedTime * 3.1);
  });
  if (!ap.color) {
    return (
      <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={2}>
        <cylinderGeometry args={[0.35, 0.35, 4, 32, 1, true]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
    );
  }
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Tubo de vidrio */}
      <mesh renderOrder={2}>
        <cylinderGeometry args={[0.35, 0.35, 4, 32, 1, true]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
      {/* Columna luminosa (plasma) con halos aditivos */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 3.4, 24]} />
        <meshBasicMaterial ref={brillo} color={color} transparent opacity={0.8} />
      </mesh>
      {[0.2, 0.3, 0.45].map((r, i) => (
        <mesh key={r}>
          <cylinderGeometry args={[r, r, 3.4, 24, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.22 - i * 0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Electrodos */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * 2.15, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.35, 24]} />
          <meshStandardMaterial color="#a8adb5" metalness={1} roughness={0.35} />
        </mesh>
      ))}
      <pointLight color={color} intensity={6} distance={6} />
    </group>
  );
}


/** Montón de polvo sobre un vidrio de reloj: granos pequeños, muy rugosos. */
export function Polvo({ color, semilla }: { color: string; semilla: number }) {
  const granos = useMemo(() => {
    const r = aleatorio(semilla);
    return Array.from({ length: 260 }, () => {
      // Distribución cónica: más granos cerca del centro y abajo
      const rad = Math.sqrt(r()) * 1.1;
      const ang = r() * Math.PI * 2;
      const h = (1 - rad / 1.1) * 0.75 * r();
      return { p: [Math.cos(ang) * rad, -0.55 + h, Math.sin(ang) * rad] as [number, number, number], s: 0.05 + r() * 0.05 };
    });
  }, [semilla]);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    {
      const m = ref.current;
      if (!m) return;
      const o = new THREE.Object3D();
      granos.forEach((g, i) => {
        o.position.set(...g.p);
        o.scale.setScalar(g.s);
        o.rotation.set(g.p[0] * 7, g.p[1] * 5, g.p[2] * 3);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
  }, [granos]);
  return (
    <group>
      {/* Montículo continuo debajo de los granos */}
      <mesh position={[0, -0.6, 0]}>
        <coneGeometry args={[1.05, 0.7, 48, 1]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[geo, undefined, granos.length]}>
        <meshStandardMaterial color={color} roughness={1} />
      </instancedMesh>
      {/* Vidrio de reloj */}
      <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[1.6, 48, 12, 0, Math.PI * 2, 0, 0.5]} />
        <meshPhysicalMaterial color="#e6f0fa" transparent opacity={0.2} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
