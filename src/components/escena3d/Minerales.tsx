/**
 * Fuente natural de un elemento para «Del mineral al producto»: mena (cristales cúbicos, cristales
 * o roca masiva), elemento nativo (pepitas, oro en cuarzo) o mezcla gaseosa (aire, gas natural).
 * Reutiliza las geometrías de las muestras; los colores son aproximaciones visuales del mineral.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { aleatorio, Cristales, Frasco, geometriaTrozo } from './Muestras';
import { MuestraPresentacion, type Presentacion } from './Presentaciones';
import type { FormaMineral, FuenteNatural } from '@/modules/tabla-periodica/obtencion';

/** Presentación de las muestras que corresponde a cada forma de mineral (también para las miniaturas). */
export const PRESENTACION_MINERAL: Record<FormaMineral, Presentacion> = {
  cubos: 'cristal-cubico',
  cristales: 'cristales',
  roca: 'trozo',
  pepitas: 'pepita',
  'cuarzo-oro': 'trozo',
};

/** Acabado del mineral: brillo metálico (galena, calcopirita), vítreo (cuarzo, halita) o terroso (bauxita). */
export function aparienciaMineral(f: FuenteNatural) {
  return {
    color: f.color,
    metalicidad: f.metalico ? 0.85 : 0,
    rugosidad: f.metalico ? 0.38 : f.transparente ? 0.12 : 0.78,
    metalico: f.metalico ?? false,
  };
}

/** Presentación equivalente de cualquier fuente (las mezclas gaseosas van en matraz). */
export const presentacionFuente = (f: FuenteNatural): Presentacion => (f.tipo === 'aire' || f.tipo === 'gas' ? 'frasco-gas' : PRESENTACION_MINERAL[f.forma ?? 'roca']);

/** Oro nativo: roca de cuarzo blanco con vetas y granos de oro incrustados. */
function CuarzoConOro({ color, semilla }: { color: string; semilla: number }) {
  const roca = useMemo(() => geometriaTrozo(semilla, 5, 0.2), [semilla]);
  const granos = useMemo(() => {
    const r = aleatorio(semilla + 17);
    const pos = roca.attributes.position as THREE.BufferAttribute;
    // Granos sobre la superficie de la roca, agrupados como una veta
    return Array.from({ length: 16 }, () => {
      const i = Math.floor(r() * pos.count);
      return { p: new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).multiplyScalar(0.98), s: 0.05 + r() * 0.09 };
    }).filter((g) => g.p.y > -0.2);
  }, [roca, semilla]);
  return (
    <group rotation={[0.2, 0.6, 0]}>
      <mesh geometry={roca}>
        <meshPhysicalMaterial color="#efeee9" roughness={0.35} clearcoat={0.3} flatShading />
      </mesh>
      {granos.map((g, i) => (
        <mesh key={i} position={g.p} scale={[g.s * 1.5, g.s, g.s * 1.2]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color={color} metalness={1} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

/** Mena masiva: roca angulosa de caras planas (fractura), con brillo metálico o terroso según el mineral. */
function Roca({ ap, semilla }: { ap: ReturnType<typeof aparienciaMineral>; semilla: number }) {
  const geo = useMemo(() => geometriaTrozo(semilla, 2, 0.34, false), [semilla]);
  return (
    <mesh geometry={geo} rotation={[0.15, 0.6, 0]} scale={[1.15, 0.85, 1]}>
      <meshPhysicalMaterial color={ap.color} metalness={ap.metalicidad} roughness={ap.rugosidad} flatShading />
    </mesh>
  );
}

/** El aire: esfera de vidrio con moléculas dispersas (muy separadas, como en un gas). */
function Aire({ semilla }: { semilla: number }) {
  const puntos = useMemo(() => {
    const r = aleatorio(semilla + 5);
    return Array.from({ length: 70 }, (_, i) => {
      const d = Math.cbrt(r()) * 0.95, t = r() * Math.PI * 2, f = Math.acos(2 * r() - 1);
      // Proporción aproximada del aire: 4 de cada 5 moléculas son N₂ (azul) y 1 es O₂ (rojo)
      return { p: [d * Math.sin(f) * Math.cos(t), d * Math.cos(f), d * Math.sin(f) * Math.sin(t)] as [number, number, number], o2: i % 5 === 0 };
    });
  }, [semilla]);
  return (
    <group>
      <mesh renderOrder={2}>
        <sphereGeometry args={[1.1, 48, 32]} />
        <meshPhysicalMaterial color="#eef6ff" transparent opacity={0.16} roughness={0.03} clearcoat={1} depthWrite={false} />
      </mesh>
      {puntos.map((m, i) => (
        <mesh key={i} position={m.p}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color={m.o2 ? '#e25555' : '#5b8fe6'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function FuenteNatural3D({ fuente, semilla, detalle = 'alto' }: { fuente: FuenteNatural; semilla: number; detalle?: 'alto' | 'bajo' }) {
  const ap = aparienciaMineral(fuente);
  if (fuente.tipo === 'aire') return <Aire semilla={semilla} />;
  if (fuente.tipo === 'gas') return <Frasco ap={ap} gas opacidadGas={0.22} />;
  if (fuente.forma === 'cuarzo-oro') return <CuarzoConOro color={fuente.color} semilla={semilla} />;
  if ((fuente.forma ?? 'roca') === 'roca') return <Roca ap={ap} semilla={semilla} />;
  // Cristales vítreos (cuarzo): translúcidos
  if (fuente.forma === 'cristales') return <Cristales ap={ap} z={semilla} transparente={fuente.transparente ?? false} />;
  return <MuestraPresentacion presentacion={PRESENTACION_MINERAL[fuente.forma ?? 'roca']} ap={ap} semilla={semilla} detalle={detalle} />;
}
