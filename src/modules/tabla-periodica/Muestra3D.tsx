import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Escena3D from '@/components/escena3d/Escena3D';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { elementoPorZ, NOMBRE_ESTADO } from '@/chem/elements';
import { aparienciaDe, type Apariencia } from './apariencia';

/** Generador pseudoaleatorio con semilla (mulberry32): la misma muestra para el mismo elemento. */
function aleatorio(semilla: number) {
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
function geometriaTrozo(semilla: number, detalle = 4, rugosidad = 0.22, suave = true) {
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

function Metal({ ap, z }: { ap: Apariencia; z: number }) {
  const geo = useMemo(() => geometriaTrozo(z * 7919, 5, 0.16), [z]);
  return (
    <mesh geometry={geo} rotation={[0.2, 0.6, 0]}>
      <meshPhysicalMaterial color={ap.color ?? '#c9cdd3'} metalness={ap.metalicidad} roughness={ap.rugosidad} clearcoat={0.15} />
    </mesh>
  );
}

function Cristales({ ap, z }: { ap: Apariencia; z: number }) {
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
          <meshPhysicalMaterial color={ap.color ?? '#999'} metalness={ap.metalicidad} roughness={ap.rugosidad} flatShading />
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

function Frasco({ ap, gas }: { ap: Apariencia; gas: boolean }) {
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
          <meshStandardMaterial color={color} transparent opacity={0.38} depthWrite={false} />
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
          {!ap.metalico && (
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

function TuboDescarga({ ap }: { ap: Apariencia }) {
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

function Contenido({ ap, z }: { ap: Apariencia; z: number }) {
  switch (ap.tipo) {
    case 'metal':
      return <Metal ap={ap} z={z} />;
    case 'no-metal':
      return <Cristales ap={ap} z={z} />;
    case 'liquido':
      return <Frasco ap={ap} gas={false} />;
    case 'gas-coloreado':
      return <Frasco ap={ap} gas />;
    case 'gas':
      return <TuboDescarga ap={ap} />;
    default:
      return null;
  }
}

/** Muestra realista del elemento a 25 °C, según su estado y aspecto. */
export default function Muestra3D({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const ap = aparienciaDe(z);
  const animado = ap.tipo === 'gas';

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {ap.tipo === 'no-observable' ? (
        <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
          {ap.descripcion}
        </div>
      ) : (
        <Escena3D
          descripcion={`Muestra de ${el.nombre} a 25 °C: ${ap.descripcion}`}
          camara={ap.tipo === 'gas' ? [0, 0.6, 5.5] : [0, 1.2, 4.2]}
          modoFotogramas={animado ? 'always' : 'demand'}
          entorno
          className="h-[360px]"
        >
          <Contenido ap={ap} z={z} />
        </Escena3D>
      )}
      <div className="text-sm">
        <h3 className="font-semibold">
          {el.nombre} a 25 °C: {NOMBRE_ESTADO[el.estadoEstandar].toLowerCase()}
        </h3>
        <p className="mt-1">{ap.descripcion}</p>
        {ap.tipo === 'gas' && <p className="mt-2 text-texto-suave">El gas es incoloro; el brillo aparece al aplicar alto voltaje en un tubo a baja presión.</p>}
        <div className="mt-3 space-y-1 text-xs text-texto-suave">
          <InsigniaRevision texto="Color aproximado" titulo="Representación visual aproximada de la descripción de la fuente; pendiente de revisión." />
          <p>Fuente de la descripción: CRC Handbook (sección 4) y Greenwood-Earnshaw. {!ap.especifica && 'Aspecto genérico para su tipo de elemento.'}</p>
        </div>
      </div>
    </div>
  );
}
