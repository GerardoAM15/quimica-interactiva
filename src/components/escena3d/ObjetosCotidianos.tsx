/**
 * Objetos cotidianos sencillos (geometría procedural) para la pestaña «En la vida diaria»:
 * bombilla, lata, cable, letrero, batería, termómetro, moneda, anillo, globo, lápiz, chip…
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import type { ObjetoCotidiano } from '@/modules/tabla-periodica/presentacion';

const acero = { color: '#c9ced6', metalness: 1, roughness: 0.25 } as const;
const vidrio = { color: '#eef6ff', transparent: true, opacity: 0.22, roughness: 0.03, metalness: 0, clearcoat: 1, depthWrite: false } as const;

function Lathe({ puntos, seg = 48, children, ...rest }: { puntos: [number, number][]; seg?: number; children: React.ReactNode } & JSX.IntrinsicElements['mesh']) {
  const pts = useMemo(() => puntos.map(([x, y]) => new THREE.Vector2(x, y)), [puntos]);
  return (
    <mesh {...rest}>
      <latheGeometry args={[pts, seg]} />
      {children}
    </mesh>
  );
}

function Tubo({ puntos, radio, children, cerrado = false }: { puntos: [number, number, number][]; radio: number; children: React.ReactNode; cerrado?: boolean }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(puntos.map((p) => new THREE.Vector3(...p)), cerrado), puntos.length * 24, radio, 12, cerrado), [puntos, radio, cerrado]);
  return <mesh geometry={geo}>{children}</mesh>;
}

function Bombilla() {
  const filamento = useMemo(() => {
    const p: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) p.push([-0.25 + (i / 60) * 0.5, 0.35 + 0.04 * Math.sin(i * 1.3), 0.04 * Math.cos(i * 1.3)]);
    return p;
  }, []);
  return (
    <group position={[0, -0.2, 0]}>
      <Lathe puntos={[[0, -0.5], [0.22, -0.48], [0.24, -0.2], [0.45, 0.15], [0.62, 0.5], [0.6, 0.85], [0.4, 1.12], [0, 1.2]]} renderOrder={3}>
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </Lathe>
      <Tubo puntos={filamento} radio={0.012}>
        <meshStandardMaterial color="#ffb347" emissive="#ff9a2e" emissiveIntensity={3} />
      </Tubo>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x * 0.9, 0.05, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6, 6]} />
          <meshStandardMaterial {...acero} />
        </mesh>
      ))}
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.23, 0.2, 0.5, 32]} />
        <meshPhysicalMaterial {...acero} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.58 - i * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.235, 0.018, 8, 32]} />
          <meshPhysicalMaterial {...acero} />
        </mesh>
      ))}
      <pointLight position={[0, 0.4, 0]} color="#ffb867" intensity={2.5} distance={4} />
    </group>
  );
}

function Lata() {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 1.6, 48]} />
        <meshPhysicalMaterial color="#d7dbe0" metalness={1} roughness={0.22} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.556, 0.556, 0.9, 48, 1, true]} />
        <meshPhysicalMaterial color="#c0262d" metalness={0.6} roughness={0.35} clearcoat={0.8} />
      </mesh>
      {[0.8, -0.8].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.04, 8, 48]} />
          <meshPhysicalMaterial color="#d7dbe0" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0.15, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.12, 24]} />
        <meshPhysicalMaterial color="#b9bec6" metalness={1} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Cable() {
  const ruta: [number, number, number][] = [[-1.4, -0.4, 0], [-0.6, 0.2, 0.3], [0.2, -0.2, -0.2], [0.8, 0.1, 0]];
  const cobre: [number, number, number][] = [[0.8, 0.1, 0], [1.05, 0.2, 0.05], [1.3, 0.25, 0.1]];
  return (
    <group>
      <Tubo puntos={ruta} radio={0.13}>
        <meshPhysicalMaterial color="#2a62c9" roughness={0.45} clearcoat={0.4} />
      </Tubo>
      <Tubo puntos={cobre} radio={0.07}>
        <meshPhysicalMaterial color="#e39a73" metalness={1} roughness={0.2} />
      </Tubo>
    </group>
  );
}

/** Letrero de neón: la palabra «Ne» trazada con un tubo luminoso. */
function Letrero() {
  const N: [number, number, number][] = [[-1.1, -0.5, 0], [-1.1, 0.5, 0], [-0.4, -0.5, 0], [-0.4, 0.5, 0]];
  const e: [number, number, number][] = [[0.2, 0, 0], [0.9, 0, 0], [0.85, 0.3, 0], [0.55, 0.45, 0], [0.22, 0.25, 0], [0.22, -0.25, 0], [0.55, -0.45, 0], [0.9, -0.35, 0]];
  const brillo = <meshStandardMaterial color="#ff6a2b" emissive="#ff4a10" emissiveIntensity={4} toneMapped={false} />;
  return (
    <group>
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[2.8, 1.5, 0.06]} />
        <meshStandardMaterial color="#14161c" roughness={0.8} />
      </mesh>
      <Tubo puntos={N} radio={0.045}>
        {brillo}
      </Tubo>
      <Tubo puntos={e} radio={0.045}>
        {brillo}
      </Tubo>
      <pointLight position={[0, 0, 0.6]} color="#ff5a1f" intensity={4} distance={4} />
    </group>
  );
}

function Bateria({ auto }: { auto: boolean }) {
  if (auto)
    return (
      <group position={[0, -0.2, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.1, 1]} />
          <meshPhysicalMaterial color="#1d2229" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[1.82, 0.08, 1.02]} />
          <meshPhysicalMaterial color="#2c333d" roughness={0.5} />
        </mesh>
        {[
          [-0.6, '#c0262d'],
          [0.6, '#1f1f1f'],
        ].map(([x, c]) => (
          <group key={x as number} position={[x as number, 0.7, 0]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.12, 0.18, 24]} />
              <meshPhysicalMaterial color="#8d939b" metalness={0.9} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.02, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
              <meshStandardMaterial color={c as string} />
            </mesh>
          </group>
        ))}
      </group>
    );
  return (
    <group rotation={[0, 0, 0.3]}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.36, 1.4, 48]} />
        <meshPhysicalMaterial color="#2a9d8f" roughness={0.3} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.3, 0.33, 0.06, 32]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 24]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
    </group>
  );
}

function Pila() {
  return (
    <group rotation={[0, 0, Math.PI / 2.4]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 1.5, 48]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.282, 0.282, 0.6, 48, 1, true]} />
        <meshPhysicalMaterial color="#c9822f" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 24]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
    </group>
  );
}

function Termometro() {
  return (
    <group rotation={[0, 0, -0.35]} position={[0, -0.1, 0]}>
      <mesh renderOrder={3}>
        <cylinderGeometry args={[0.1, 0.1, 2.4, 24]} />
        <meshPhysicalMaterial {...vidrio} />
      </mesh>
      <mesh position={[0, -1.25, 0]} renderOrder={3}>
        <sphereGeometry args={[0.15, 24, 16]} />
        <meshPhysicalMaterial {...vidrio} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <meshPhysicalMaterial color="#d4d7de" metalness={1} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.5, 12]} />
        <meshPhysicalMaterial color="#d4d7de" metalness={1} roughness={0.05} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[0.1, -0.9 + i * 0.18, 0]}>
          <boxGeometry args={[0.04, 0.012, 0.012]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

function Moneda() {
  return (
    <group rotation={[-0.8, 0, 0.3]}>
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 0.12, 64]} />
        <meshPhysicalMaterial color="#c9cdd3" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.03, 8, 64]} />
        <meshPhysicalMaterial color="#c9cdd3" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Anillo() {
  return (
    <group rotation={[0.9, 0.3, 0]}>
      <mesh>
        <torusGeometry args={[0.7, 0.12, 32, 96]} />
        <meshPhysicalMaterial color="#f1c457" metalness={1} roughness={0.12} />
      </mesh>
    </group>
  );
}

function Globo() {
  const hilo: [number, number, number][] = [[0, -0.95, 0], [0.1, -1.3, 0.05], [-0.05, -1.7, 0], [0.08, -2.1, 0]];
  return (
    <group position={[0, 0.5, 0]}>
      <mesh scale={[0.8, 1, 0.8]}>
        <sphereGeometry args={[0.9, 48, 32]} />
        <meshPhysicalMaterial color="#e94e77" roughness={0.25} clearcoat={1} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <coneGeometry args={[0.1, 0.15, 16]} />
        <meshPhysicalMaterial color="#e94e77" roughness={0.3} />
      </mesh>
      <Tubo puntos={hilo} radio={0.008}>
        <meshStandardMaterial color="#eeeeee" />
      </Tubo>
    </group>
  );
}

function Lapiz() {
  return (
    <group rotation={[0, 0, Math.PI / 2.6]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 2, 6]} />
        <meshPhysicalMaterial color="#f2c21b" roughness={0.4} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.12, 0.3, 6]} />
        <meshStandardMaterial color="#e3c59a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.27, 0]}>
        <coneGeometry args={[0.04, 0.1, 12]} />
        <meshStandardMaterial color="#2c2c2e" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.08, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.16, 24]} />
        <meshPhysicalMaterial color="#c9ced6" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 24]} />
        <meshStandardMaterial color="#e88aa0" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Chip() {
  return (
    <group rotation={[0.5, 0.4, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.12, 1.2]} />
        <meshPhysicalMaterial color="#1b1d22" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshPhysicalMaterial color="#6e7684" metalness={0.9} roughness={0.1} iridescence={0.5} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) =>
        [-1, 1].map((s) => (
          <mesh key={`${i}${s}`} position={[-0.5 + i * 0.11, -0.04, s * 0.68]}>
            <boxGeometry args={[0.05, 0.03, 0.18]} />
            <meshPhysicalMaterial color="#d9b44a" metalness={1} roughness={0.25} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Salero() {
  return (
    <group position={[0, -0.3, 0]}>
      <Lathe puntos={[[0, -0.6], [0.42, -0.6], [0.45, 0.3], [0.38, 0.55], [0, 0.55]]} renderOrder={3}>
        <meshPhysicalMaterial {...vidrio} opacity={0.3} side={THREE.DoubleSide} />
      </Lathe>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.65, 32]} />
        <meshStandardMaterial color="#f7f7f4" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.39, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
    </group>
  );
}

function Clavo() {
  return (
    <group rotation={[0, 0, Math.PI / 2.3]}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 2, 16]} />
        <meshPhysicalMaterial color="#9aa0a8" metalness={1} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
        <meshPhysicalMaterial color="#9aa0a8" metalness={1} roughness={0.4} />
      </mesh>
      <mesh position={[0, -1.08, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.16, 16]} />
        <meshPhysicalMaterial color="#9aa0a8" metalness={1} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Tanque() {
  return (
    <group position={[0, -0.2, 0]}>
      <Lathe puntos={[[0, -1], [0.45, -1], [0.45, 0.6], [0.35, 0.85], [0.12, 0.95], [0, 0.95]]}>
        <meshPhysicalMaterial color="#2f8f4e" roughness={0.35} clearcoat={0.6} />
      </Lathe>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.25, 16]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 24]} />
        <meshPhysicalMaterial {...acero} />
      </mesh>
    </group>
  );
}

function TuboPasta() {
  return (
    <group rotation={[0, 0, -0.4]}>
      <mesh scale={[1, 1, 0.55]}>
        <cylinderGeometry args={[0.38, 0.32, 1.8, 32]} />
        <meshPhysicalMaterial color="#f2f4f7" roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, -0.92, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.06]} />
        <meshPhysicalMaterial color="#e6e9ee" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.26, 24]} />
        <meshPhysicalMaterial color="#2a6fd6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, 0.2]}>
        <boxGeometry args={[0.5, 0.5, 0.01]} />
        <meshStandardMaterial color="#2a6fd6" />
      </mesh>
    </group>
  );
}

function Cerilla() {
  return (
    <group rotation={[0.5, 0.4, 0]}>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.5, 0.35, 1]} />
        <meshStandardMaterial color="#c0392b" roughness={0.8} />
      </mesh>
      <mesh position={[0.76, -0.25, 0]}>
        <boxGeometry args={[0.01, 0.3, 0.9]} />
        <meshStandardMaterial color="#5a3a2a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <boxGeometry args={[0.05, 1.4, 0.05]} />
        <meshStandardMaterial color="#e3c59a" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 0.05, -0.2]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial color="#b8231a" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Cuchara() {
  return (
    <group rotation={[-0.9, 0, 0.4]}>
      <mesh position={[0, 0.7, 0]} scale={[0.42, 0.6, 0.12]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial {...acero} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.12, 1.6, 0.03]} />
        <meshPhysicalMaterial {...acero} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Led({ color }: { color: string }) {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0.85} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0.85} roughness={0.1} />
      </mesh>
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={x} position={[x, -0.45 - i * 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2 + i * 0.2, 8]} />
          <meshPhysicalMaterial {...acero} />
        </mesh>
      ))}
      <pointLight position={[0, 0.6, 0.4]} color={color} intensity={2} distance={3} />
    </group>
  );
}

function Cohete({ color }: { color: string }) {
  return (
    <group rotation={[0, 0, -0.3]}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 1, 24]} />
        <meshPhysicalMaterial color="#d7dbe0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.2, 0.3, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[0.03, 1.4, 0.03]} />
        <meshStandardMaterial color="#c9a06b" />
      </mesh>
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (0.9 + (i % 3) * 0.15), 1.3 + Math.sin(a) * (0.9 + (i % 3) * 0.15), 0]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Espejo() {
  return (
    <group rotation={[0, 0.5, 0]}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.04, 64]} />
        <meshPhysicalMaterial color="#e8ecf2" metalness={1} roughness={0.01} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.02, 0.06, 12, 64]} />
        <meshPhysicalMaterial color="#8a6a3c" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Iman() {
  return (
    <group rotation={[0.6, 0, 0.2]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, i * 0.17 - 0.3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 48]} />
          <meshPhysicalMaterial color="#c9ced6" metalness={1} roughness={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Tableta() {
  const pos: [number, number, number][] = [[0, -0.5, 0], [0.7, -0.5, 0.3], [-0.6, -0.5, -0.2], [0.2, -0.32, -0.1]];
  return (
    <group>
      {pos.map((p, i) => (
        <mesh key={i} position={p} rotation={[i === 3 ? 0.6 : 0, i, 0]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[0.35, 32, 16]} />
          <meshPhysicalMaterial color={i % 2 ? '#f6c0cf' : '#f5f5f2'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Botella() {
  return (
    <group position={[0, -0.15, 0]}>
      <Lathe puntos={[[0, -1], [0.42, -1], [0.45, -0.9], [0.45, 0.4], [0.2, 0.75], [0.15, 0.95], [0, 0.95]]} renderOrder={3}>
        <meshPhysicalMaterial color="#cfe6ff" transparent opacity={0.35} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </Lathe>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.2, 32]} />
        <meshPhysicalMaterial color="#8ec5ff" transparent opacity={0.35} roughness={0.05} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.16, 24]} />
        <meshPhysicalMaterial color="#2a6fd6" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Detector() {
  return (
    <group rotation={[0.9, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1, 1.05, 0.3, 64]} />
        <meshPhysicalMaterial color="#f1f2f4" roughness={0.6} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[Math.cos((i / 12) * Math.PI * 2) * 0.6, 0.16, Math.sin((i / 12) * Math.PI * 2) * 0.6]} rotation={[0, -(i / 12) * Math.PI * 2, 0]}>
          <boxGeometry args={[0.25, 0.02, 0.04]} />
          <meshStandardMaterial color="#c9ccd1" />
        </mesh>
      ))}
      <mesh position={[0.3, 0.16, 0.2]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshStandardMaterial color="#e33" emissive="#e33" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

/** Objeto cotidiano; algunos cambian según el elemento (color del LED o del fuego artificial). */
export function ObjetoCotidiano3D({ objeto, simbolo }: { objeto: ObjetoCotidiano; simbolo: string }) {
  switch (objeto) {
    case 'bombilla':
      return <Bombilla />;
    case 'lata':
      return <Lata />;
    case 'cable':
      return <Cable />;
    case 'letrero':
      return <Letrero />;
    case 'bateria':
      return <Bateria auto={simbolo === 'Pb'} />;
    case 'termometro':
      return <Termometro />;
    case 'moneda':
      return <Moneda />;
    case 'anillo':
      return <Anillo />;
    case 'globo':
      return <Globo />;
    case 'lapiz':
      return <Lapiz />;
    case 'chip':
      return <Chip />;
    case 'salero':
      return <Salero />;
    case 'clavo':
      return <Clavo />;
    case 'pila':
      return <Pila />;
    case 'tanque':
      return <Tanque />;
    case 'tubo-pasta':
      return <TuboPasta />;
    case 'cerilla':
      return <Cerilla />;
    case 'cuchara':
      return <Cuchara />;
    case 'led':
      return <Led color={{ Eu: '#ff3b3b', Tb: '#3bff6a', Ga: '#4d7dff', Y: '#fff6d8' }[simbolo] ?? '#ffffff'} />;
    case 'cohete':
      return <Cohete color={simbolo === 'Ba' ? '#43e06b' : '#ff3b3b'} />;
    case 'espejo':
      return <Espejo />;
    case 'iman':
      return <Iman />;
    case 'tableta':
      return <Tableta />;
    case 'botella':
      return <Botella />;
    case 'detector':
      return <Detector />;
  }
}
