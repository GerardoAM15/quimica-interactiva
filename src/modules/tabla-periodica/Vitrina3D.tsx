import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Escena3D from '@/components/escena3d/Escena3D';
import { geometriaMiniatura, MuestraPresentacion, type Presentacion } from '@/components/escena3d/Presentaciones';
import { ELEMENTOS, elementoPorZ, posicionTabla } from '@/chem/elements';
import { aparienciaDe } from './apariencia';
import { presentacionDe } from './presentacion';

/**
 * Vitrina 3D: pared de madera con 118 casilleros iluminados (fondo claro y placa negra con símbolo y Z),
 * cada uno con la misma presentación que la muestra grande, en miniatura.
 *
 * Rendimiento: los casilleros, las luces y las miniaturas lejanas son InstancedMesh (pocas llamadas
 * de dibujo para los 118 elementos); al acercarse, los casilleros más próximos a la cámara cambian a
 * la muestra detallada (LOD). Se redibuja solo al mover la cámara (frameloop «demand»).
 */

const PASO = 1.12; // separación entre casilleros
const LADO = 1; // tamaño interior del casillero
const MAX_DETALLE = 6; // casilleros con la muestra detallada a la vez
const DISTANCIA_DETALLE = 6.5;
const CAMARA_INICIAL: [number, number, number] = [0, 0.5, 17];
const ESCALA_MINIATURA = 0.3; // la muestra (≈ 2 unidades de ancho) cabe en el casillero

/** Centro del casillero de cada elemento (la fila 8 queda vacía entre la tabla y el bloque f). */
function centro(z: number): THREE.Vector3 {
  const { fila, columna } = posicionTabla(z);
  const f = fila >= 9 ? fila - 0.55 : fila;
  return new THREE.Vector3((columna - 9.5) * PASO, -(f - 5.5) * PASO, 0);
}

type Grupo = 'metal' | 'solido' | 'recipiente' | 'tubo' | 'radiactivo';
const grupoDe = (p: Presentacion, metalico: boolean): Grupo =>
  p === 'tubo' ? 'tubo' : p === 'sin-muestra' ? 'radiactivo' : ['aceite', 'ampolla', 'gota', 'frasco-gas'].includes(p) ? 'recipiente' : metalico ? 'metal' : 'solido';

interface Celda {
  z: number;
  pos: THREE.Vector3;
  grupo: Grupo;
  metalico: boolean;
  presentacion: Presentacion;
  color: string;
}

function celdas(): Celda[] {
  return ELEMENTOS.map((e) => {
    const ap = aparienciaDe(e.z);
    const info = presentacionDe(e.z);
    return { z: e.z, pos: centro(e.z), grupo: grupoDe(info.presentacion, ap.metalico), metalico: ap.metalico, presentacion: info.presentacion, color: ap.color ?? '#9ca3af' };
  });
}

// ── Texturas ────────────────────────────────────────────────────────────────

/** Vetas de madera procedurales. */
function texturaMadera(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 512;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#5a3a22';
  c.fillRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < cv.height; y += 2) {
    const v = Math.sin(y * 0.05) * 18 + Math.sin(y * 0.013) * 30;
    c.strokeStyle = `rgba(${40 + (v > 0 ? 20 : 0)}, ${24 + (v > 0 ? 10 : 0)}, 12, ${0.18 + Math.abs(Math.sin(y * 0.21)) * 0.22})`;
    c.beginPath();
    c.moveTo(0, y);
    for (let x = 0; x <= cv.width; x += 32) c.lineTo(x, y + Math.sin(x * 0.01 + y * 0.03) * 6 + v * 0.1);
    c.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Etiquetas de todos los casilleros en una sola textura (una sola llamada de dibujo). */
function texturaEtiquetas(lista: Celda[], ancho: number, alto: number): THREE.CanvasTexture {
  const px = 120; // píxeles por unidad
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(ancho * px);
  cv.height = Math.ceil(alto * px);
  const c = cv.getContext('2d')!;
  for (const cel of lista) {
    const el = elementoPorZ(cel.z);
    const x = (cel.pos.x + ancho / 2) * px, y = (alto / 2 - cel.pos.y) * px;
    const yPlaca = y + (LADO / 2) * px - 0.2 * px;
    // Placa negra con el símbolo y el número atómico en blanco
    c.fillStyle = '#0d0f14';
    c.fillRect(x - (LADO / 2) * px, yPlaca, LADO * px, 0.2 * px);
    c.fillStyle = '#f4f5f7';
    c.font = `bold ${0.15 * px}px system-ui, sans-serif`;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(el.simbolo, x - 0.46 * px, yPlaca + 0.1 * px);
    c.font = `${0.1 * px}px system-ui, sans-serif`;
    c.textAlign = 'right';
    c.fillText(String(el.z), x + 0.46 * px, yPlaca + 0.1 * px);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Placa de aviso (amarilla, con el trébol de radiactividad) para los elementos sin muestra: ilustración, no foto. */
function texturaRadiactivo(): THREE.CanvasTexture {
  const n = 160;
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#111';
  c.fillRect(0, 0, n, n);
  c.fillStyle = '#f5c400';
  c.fillRect(6, 6, n - 12, n - 12);
  c.fillStyle = '#111';
  const r = n * 0.36;
  for (let k = 0; k < 3; k++) {
    const a0 = (k * 2 * Math.PI) / 3 - Math.PI / 2 - Math.PI / 6;
    c.beginPath();
    c.moveTo(n / 2, n / 2);
    c.arc(n / 2, n / 2, r, a0, a0 + Math.PI / 3);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#f5c400';
  c.beginPath();
  c.arc(n / 2, n / 2, r * 0.34, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#111';
  c.beginPath();
  c.arc(n / 2, n / 2, r * 0.22, 0, Math.PI * 2);
  c.fill();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── Geometrías ──────────────────────────────────────────────────────────────

/** Casillero: fondo y cuatro paredes, en una sola geometría. */
function geometriaCasillero(): THREE.BufferGeometry {
  const g = (sx: number, sy: number, sz: number, x: number, y: number, z: number) => new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z).toNonIndexed();
  const prof = 0.8, e = 0.06, t = LADO + 2 * e;
  const partes = [g(t, t, e, 0, 0, -prof / 2), g(t, e, prof, 0, LADO / 2 + e / 2, 0), g(t, e, prof, 0, -LADO / 2 - e / 2, 0), g(e, t, prof, LADO / 2 + e / 2, 0, 0), g(e, t, prof, -LADO / 2 - e / 2, 0, 0)];
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  for (const p of partes) {
    pos.push(...(p.attributes.position!.array as Float32Array));
    nor.push(...(p.attributes.normal!.array as Float32Array));
    uv.push(...(p.attributes.uv!.array as Float32Array));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geo;
}

/** Instancias de una geometría en las posiciones dadas, con color por instancia (opcional). */
function Instancias({
  lista,
  geometria,
  children,
  desplazamiento = [0, 0, 0],
  escala = 1,
  conColor = true,
  ocultos,
  alHacerClic,
}: {
  lista: Celda[];
  geometria: THREE.BufferGeometry;
  children: React.ReactNode;
  desplazamiento?: [number, number, number];
  escala?: number | [number, number, number];
  conColor?: boolean;
  ocultos?: Set<number>;
  alHacerClic?: (z: number) => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    lista.forEach((cel, i) => {
      o.position.set(cel.pos.x + desplazamiento[0], cel.pos.y + desplazamiento[1], cel.pos.z + desplazamiento[2]);
      const s = ocultos?.has(cel.z) ? 0 : 1;
      if (Array.isArray(escala)) o.scale.set(escala[0] * s, escala[1] * s, escala[2] * s);
      else o.scale.setScalar(escala * s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (conColor) m.setColorAt(i, c.set(cel.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [lista, desplazamiento, escala, conColor, ocultos]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometria, undefined, lista.length]}
      onClick={
        alHacerClic
          ? (e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              if (e.instanceId !== undefined) alHacerClic(lista[e.instanceId]!.z);
            }
          : undefined
      }
    >
      {children}
    </instancedMesh>
  );
}

/** Contenido de la escena: pared, casilleros, miniaturas (LOD) y animación de cámara. */
function Pared({ alElegir, volver, alVolver }: { alElegir: (z: number) => void; volver: number; alVolver: () => void }) {
  const lista = useMemo(celdas, []);
  const { camera, controls, invalidate, size } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: OrbitControlsImpl | null; invalidate: () => void; size: { width: number; height: number } };
  const ancho = 18 * PASO + 1.2, alto = 9.5 * PASO + 1.2;
  const madera = useMemo(texturaMadera, []);
  const etiquetas = useMemo(() => texturaEtiquetas(lista, ancho, alto), [lista, ancho, alto]);
  const trebol = useMemo(texturaRadiactivo, []);
  const geo = useMemo(
    () => ({
      casillero: geometriaCasillero(),
      luz: new THREE.BoxGeometry(LADO * 0.9, 0.02, 0.06),
      tubo: new THREE.CylinderGeometry(0.045, 0.045, 0.8, 8).rotateZ(Math.PI / 2),
      placa: new THREE.PlaneGeometry(0.58, 0.58),
      fondo: new THREE.PlaneGeometry(LADO, LADO),
    }),
    [],
  );

  // Vista general: en pantallas estrechas (móvil en vertical) la cámara se aleja hasta que la pared
  // quepa a lo ancho: d = (ancho/2) / tan(fovH/2), con tan(fovH/2) = tan(fovV/2) · proporción
  const inicio = useRef(new THREE.Vector3(...CAMARA_INICIAL));
  useLayoutEffect(() => {
    if (!controls) return;
    const tanH = Math.tan((camera.fov * Math.PI) / 360) * (size.width / size.height);
    const d = Math.max(CAMARA_INICIAL[2], (ancho / 2 + 0.2) / tanH);
    const estabaEnInicio = camera.position.distanceTo(inicio.current) < 0.05;
    inicio.current.set(CAMARA_INICIAL[0], CAMARA_INICIAL[1], d);
    controls.maxDistance = d + 2;
    camera.far = Math.max(camera.far, d * 3);
    camera.updateProjectionMatrix();
    if (estabaEnInicio) {
      camera.position.copy(inicio.current);
      controls.update();
    }
    invalidate();
  }, [controls, size.width, size.height]); // eslint-disable-line react-hooks/exhaustive-deps

  // LOD: los casilleros más cercanos a la cámara muestran la muestra detallada
  const [detalle, setDetalle] = useState<number[]>([]);
  const actualizarLOD = () => {
    const cercanos = lista
      .map((c) => ({ z: c.z, d: camera.position.distanceTo(c.pos) }))
      .filter((x) => x.d < DISTANCIA_DETALLE)
      .sort((a, b) => a.d - b.d)
      .slice(0, MAX_DETALLE)
      .map((x) => x.z)
      .sort((a, b) => a - b);
    setDetalle((prev) => (prev.join() === cercanos.join() ? prev : cercanos));
  };
  useEffect(() => {
    if (!controls) return;
    // Límites de paneo: el centro de la vista no sale de la pared
    const limitar = () => {
      const t = controls.target;
      const x = THREE.MathUtils.clamp(t.x, -ancho / 2 + 1, ancho / 2 - 1), y = THREE.MathUtils.clamp(t.y, -alto / 2 + 1, alto / 2 - 1);
      if (x !== t.x || y !== t.y || t.z !== 0) {
        camera.position.x += x - t.x;
        camera.position.y += y - t.y;
        t.set(x, y, 0);
      }
      actualizarLOD();
    };
    controls.addEventListener('change', limitar);
    actualizarLOD();
    return () => controls.removeEventListener('change', limitar);
  }, [controls]); // eslint-disable-line react-hooks/exhaustive-deps
  const ocultos = useMemo(() => new Set(detalle), [detalle]);

  // Animación de acercamiento al casillero elegido
  const animacion = useRef<{ z?: number; destino: THREE.Vector3; objetivo: THREE.Vector3 } | null>(null);
  const elegir = (z: number) => {
    const c = lista.find((x) => x.z === z)!.pos;
    animacion.current = { z, objetivo: c.clone(), destino: c.clone().add(new THREE.Vector3(0, 0.25, 3.4)) };
    invalidate();
  };
  useFrame((_, dt) => {
    const a = animacion.current;
    if (!a || !controls) return;
    const k = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(a.destino, k);
    controls.target.lerp(a.objetivo, k);
    controls.update();
    if (camera.position.distanceTo(a.destino) < 0.02) {
      animacion.current = null;
      if (a.z !== undefined) alElegir(a.z);
      else alVolver();
    } else invalidate();
  });
  // «Volver a la vitrina»: la cámara regresa suavemente a la vista general
  useEffect(() => {
    if (!volver) return;
    animacion.current = { objetivo: new THREE.Vector3(0, 0, 0), destino: inicio.current.clone() };
    invalidate();
  }, [volver, invalidate]);

  // LOD bajo: una malla instanciada por presentación (lingote, barras, lámina, gránulos, moneda…) y
  // tipo de material, de modo que cada elemento conserva su forma sin multiplicar las llamadas de dibujo
  const miniaturas = useMemo(() => {
    const grupos = new Map<string, { presentacion: Presentacion; material: 'metal' | 'mate' | 'vidrio'; lista: Celda[] }>();
    for (const c of lista) {
      if (c.grupo === 'tubo' || c.grupo === 'radiactivo') continue;
      const material = ['aceite', 'ampolla', 'frasco-gas'].includes(c.presentacion) ? 'vidrio' : c.metalico ? 'metal' : 'mate';
      const k = `${c.presentacion}|${material}`;
      if (!grupos.has(k)) grupos.set(k, { presentacion: c.presentacion, material, lista: [] });
      grupos.get(k)!.lista.push(c);
    }
    return [...grupos.entries()].map(([clave, g]) => ({ clave, ...g, geometria: geometriaMiniatura(g.presentacion) }));
  }, [lista]);
  const tubos = useMemo(() => lista.filter((c) => c.grupo === 'tubo'), [lista]);
  const radiactivos = useMemo(() => lista.filter((c) => c.grupo === 'radiactivo'), [lista]);

  return (
    <group>
      {/* Luz cálida de vitrina sobre la pared */}
      <ambientLight intensity={0.25} color="#ffe9c9" />
      <spotLight position={[0, 9, 9]} angle={0.9} penumbra={0.8} intensity={18} color="#fff1dc" distance={40} decay={1.4} />
      {/* Pared de madera */}
      <mesh position={[0, 0, -0.45]}>
        <planeGeometry args={[ancho + 1.5, alto + 1.5]} />
        <meshStandardMaterial map={madera} roughness={0.75} color="#c08a5c" />
      </mesh>
      {/* Casilleros (una sola instancia por elemento) */}
      <Instancias lista={lista} geometria={geo.casillero} conColor={false} alHacerClic={elegir}>
        <meshStandardMaterial map={madera} color="#b07a4c" roughness={0.55} />
      </Instancias>
      {/* Fondo claro de cada casillero: las muestras se recortan mejor que sobre la madera */}
      <Instancias lista={lista} geometria={geo.fondo} desplazamiento={[0, 0, -0.365]} conColor={false}>
        <meshStandardMaterial color="#efe7d8" roughness={0.9} />
      </Instancias>
      {/* Tira de luz cálida en el techo de cada casillero */}
      <Instancias lista={lista} geometria={geo.luz} desplazamiento={[0, LADO / 2 - 0.02, 0.2]} conColor={false}>
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </Instancias>
      {/* Placas con símbolo y número atómico */}
      <mesh position={[0, 0, 0.405]}>
        <planeGeometry args={[ancho, alto]} />
        <meshBasicMaterial map={etiquetas} transparent toneMapped={false} />
      </mesh>
      {/* Miniaturas lejanas (LOD bajo): una malla instanciada por presentación */}
      {miniaturas.map((g) => (
        <Instancias key={g.clave} lista={g.lista} geometria={g.geometria} desplazamiento={[0, -0.05, 0]} escala={ESCALA_MINIATURA} ocultos={ocultos}>
          {g.material === 'metal' ? (
            <meshPhysicalMaterial metalness={0.92} roughness={0.42} envMapIntensity={1} />
          ) : g.material === 'vidrio' ? (
            <meshPhysicalMaterial metalness={0.1} roughness={0.12} clearcoat={1} transparent opacity={0.8} />
          ) : (
            <meshStandardMaterial roughness={0.6} flatShading />
          )}
        </Instancias>
      ))}
      <Instancias lista={tubos} geometria={geo.tubo} desplazamiento={[0, 0.02, 0]} ocultos={ocultos}>
        <meshBasicMaterial toneMapped={false} />
      </Instancias>
      <Instancias lista={tubos} geometria={geo.tubo} desplazamiento={[0, 0.02, 0]} escala={[1, 3.2, 3.2]} ocultos={ocultos}>
        <meshBasicMaterial transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </Instancias>
      <Instancias lista={radiactivos} geometria={geo.placa} desplazamiento={[0, 0.06, -0.3]} conColor={false}>
        <meshBasicMaterial map={trebol} toneMapped={false} />
      </Instancias>
      {/* Miniaturas detalladas (LOD alto) de los casilleros más cercanos */}
      {detalle.map((z) => {
        const c = lista.find((x) => x.z === z)!;
        if (c.grupo === 'radiactivo') return null;
        const info = presentacionDe(z);
        // En el casillero los metales muy pulidos reflejan de lleno el foco del estudio y se «lavan»
        // (el oro se ve crema): un acabado algo más satinado conserva el color propio del metal
        const base = aparienciaDe(z);
        const ap = { ...base, rugosidad: Math.max(base.rugosidad, 0.42) };
        return (
          <group key={z} position={[c.pos.x, c.pos.y + (c.grupo === 'tubo' ? 0.02 : -0.05), 0]} scale={c.grupo === 'tubo' ? 0.22 : ESCALA_MINIATURA}>
            <MuestraPresentacion presentacion={info.presentacion} ap={ap} efecto={info.efecto} semilla={z * 7919} simbolo={elementoPorZ(z).simbolo} detalle="bajo" liquido={elementoPorZ(z).estadoEstandar === 'liquido'} />
          </group>
        );
      })}
    </group>
  );
}

export default function Vitrina3D({ alElegir }: { alElegir: (z: number) => void }) {
  // `acercado`: la cámara está frente a un casillero; `volver` cuenta las pulsaciones del botón
  const [acercado, setAcercado] = useState(false);
  const [volver, setVolver] = useState(0);
  return (
    <div className="space-y-2">
      <div className="relative">
        <Escena3D
          descripcion="Vitrina 3D: pared de madera con 118 casilleros iluminados, cada uno con una muestra en miniatura de su elemento"
          camara={CAMARA_INICIAL}
          campoVision={42}
          entorno="estudio"
          exposicion={0.9}
          intensidadEntorno={0.4}
          className="h-[560px]"
          ayuda="Arrastra para girar · rueda para acercar · clic derecho para desplazar · clic en un casillero para verlo de cerca"
          controles={{ minDistance: 1.8, maxDistance: 19, minAzimuthAngle: -0.7, maxAzimuthAngle: 0.7, minPolarAngle: Math.PI / 2 - 0.55, maxPolarAngle: Math.PI / 2 + 0.45, screenSpacePanning: true }}
        >
          <Pared
            alElegir={(z) => {
              setAcercado(true);
              alElegir(z);
            }}
            volver={volver}
            alVolver={() => setAcercado(false)}
          />
        </Escena3D>
        {acercado && (
          <button
            type="button"
            onClick={() => setVolver((n) => n + 1)}
            className="absolute top-2 left-2 rounded-md border border-borde bg-superficie px-3 py-1.5 text-sm font-medium shadow hover:bg-superficie-2"
          >
            ← Volver a la vitrina
          </button>
        )}
      </div>
      <p className="text-xs text-texto-suave">
        Cada casillero muestra en miniatura la misma presentación que la muestra grande; de lejos se dibuja simplificada y al acercarte, detallada. Los elementos
        radiactivos sin muestra llevan una placa de aviso. Los gases brillan en su tubo de descarga.
      </p>
    </div>
  );
}
