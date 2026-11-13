/**
 * Geometrías procedurales de las presentaciones típicas de las muestras de elementos (lingote,
 * barra, alambre, lámina, gránulos, moneda, cristales, oblea, ampolla, gota…) y sus acabados PBR
 * (pátina, óxido iridiscente, opaco, diamante). `detalle = 'bajo'` reduce segmentos (vitrina, lejos).
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { aleatorio, Cristales, Frasco, geometriaTrozo, Metal, Polvo, TuboDescarga, type AparienciaMuestra } from './Muestras';

export type Presentacion =
  | 'lingote'
  | 'barra'
  | 'alambre'
  | 'cinta'
  | 'lamina'
  | 'granulos'
  | 'polvo'
  | 'pepita'
  | 'trozo'
  | 'moneda'
  | 'cristales'
  | 'cristal-cubico'
  | 'cristal-octaedrico'
  | 'cristal-escalonado'
  | 'oblea'
  | 'aceite'
  | 'ampolla'
  | 'gota'
  | 'tubo'
  | 'frasco-gas'
  | 'sin-muestra';

export type Efecto = 'patina' | 'iridiscente' | 'opaco' | 'diamante';
export type Detalle = 'alto' | 'bajo';

export interface PropsMuestra {
  ap: AparienciaMuestra & { color: string | null };
  efecto?: Efecto;
  semilla: number;
  detalle?: Detalle;
  /** Símbolo del elemento (relieve de la moneda). */
  simbolo?: string;
  /** Contenido líquido en la ampolla (Br) en lugar de sólido. */
  liquido?: boolean;
}

// ── Texturas procedurales (CanvasTexture, sin archivos externos) ────────────

const cacheTex = new Map<string, THREE.Texture>();

/** Pátina del cobre: manchas verdes (carbonato básico), más rugosas y sin brillo metálico. */
function texturasPatina(semilla: number, base: string) {
  const k = `patina-${semilla}-${base}`;
  if (cacheTex.has(k)) return { map: cacheTex.get(k)!, orm: cacheTex.get(`${k}-orm`)! };
  const n = 256;
  const color = document.createElement('canvas'), orm = document.createElement('canvas');
  color.width = color.height = orm.width = orm.height = n;
  const c = color.getContext('2d')!, o = orm.getContext('2d')!;
  c.fillStyle = base;
  c.fillRect(0, 0, n, n);
  // Canal G = rugosidad, B = metalicidad (convención de three.js)
  o.fillStyle = 'rgb(255,50,255)';
  o.fillRect(0, 0, n, n);
  const r = aleatorio(semilla);
  for (let i = 0; i < 16; i++) {
    const x = r() * n, y = r() * n, rad = 3 + r() * 7;
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(84,150,124,0.7)');
    g.addColorStop(1, 'rgba(84,150,124,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, rad, 0, Math.PI * 2);
    c.fill();
    const h = o.createRadialGradient(x, y, 0, x, y, rad);
    h.addColorStop(0, 'rgba(255,225,60,0.7)');
    h.addColorStop(1, 'rgba(255,235,0,0)');
    o.fillStyle = h;
    o.beginPath();
    o.arc(x, y, rad, 0, Math.PI * 2);
    o.fill();
  }
  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  const tOrm = new THREE.CanvasTexture(orm);
  cacheTex.set(k, map);
  cacheTex.set(`${k}-orm`, tOrm);
  return { map, orm: tOrm };
}

/** Relieve de la moneda: el símbolo del elemento y un anillo de puntos (mapa de relieve). */
function texturaMoneda(simbolo: string) {
  const k = `moneda-${simbolo}`;
  if (cacheTex.has(k)) return cacheTex.get(k)!;
  const n = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#000';
  c.fillRect(0, 0, n, n);
  c.strokeStyle = '#fff';
  c.lineWidth = 6;
  c.beginPath();
  c.arc(n / 2, n / 2, n * 0.42, 0, Math.PI * 2);
  c.stroke();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(n / 2 + Math.cos(a) * n * 0.46, n / 2 + Math.sin(a) * n * 0.46, 2.2, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = '#fff';
  c.font = `bold ${n * 0.36}px system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(simbolo, n / 2, n / 2 + 6);
  const t = new THREE.CanvasTexture(cv);
  cacheTex.set(k, t);
  return t;
}

/** Oblea de silicio: cuadrícula de chips (dies) que difracta la luz. */
function texturaOblea() {
  const k = 'oblea';
  if (cacheTex.has(k)) return cacheTex.get(k)!;
  const n = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = n;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#5b6474';
  c.fillRect(0, 0, n, n);
  const paso = n / 14;
  for (let i = 0; i < 14; i++)
    for (let j = 0; j < 14; j++) {
      const h = 210 + ((i * 7 + j * 13) % 40);
      c.fillStyle = `hsl(${h}, 18%, ${34 + ((i + j) % 3) * 4}%)`;
      c.fillRect(i * paso + 2, j * paso + 2, paso - 4, paso - 4);
    }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  cacheTex.set(k, t);
  return t;
}

// ── Material según el acabado ───────────────────────────────────────────────

export function MaterialMuestra({ ap, efecto, semilla = 1, plano = false }: { ap: PropsMuestra['ap']; efecto?: Efecto; semilla?: number; plano?: boolean }) {
  const color = ap.color ?? '#c9cdd3';
  if (efecto === 'patina') {
    const { map, orm } = texturasPatina(semilla, color);
    return <meshPhysicalMaterial map={map} roughnessMap={orm} metalnessMap={orm} metalness={1} roughness={1} clearcoat={0.1} flatShading={plano} />;
  }
  if (efecto === 'iridiscente') {
    // Película delgada de óxido: interferencia (iridiscencia) sobre el metal
    return <meshPhysicalMaterial color={color} metalness={1} roughness={0.18} iridescence={1} iridescenceIOR={1.9} iridescenceThicknessRange={[180, 720]} flatShading={plano} />;
  }
  if (efecto === 'opaco') return <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.78} flatShading={plano} />;
  if (efecto === 'diamante') {
    // n = 2,42 y dispersión: «fuego» del diamante
    return <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0} transmission={1} thickness={1.2} ior={2.42} dispersion={4} clearcoat={1} flatShading attenuationColor="#f4fbff" attenuationDistance={6} />;
  }
  return <meshPhysicalMaterial color={color} metalness={ap.metalicidad} roughness={ap.rugosidad} clearcoat={ap.metalicidad > 0.5 ? 0.15 : 0} flatShading={plano} />;
}

// ── Geometrías ──────────────────────────────────────────────────────────────

/** Lingote: prisma con la cara superior más estrecha (forma de molde) y aristas suavizadas. */
function geometriaLingote() {
  const g = new THREE.BoxGeometry(2, 0.62, 1, 1, 1, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setXYZ(i, p.getX(i) * 0.82, p.getY(i), p.getZ(i) * 0.78);
  g.computeVertexNormals();
  return g;
}

function Lingote(props: PropsMuestra) {
  const geo = useMemo(geometriaLingote, []);
  return (
    <mesh geometry={geo} rotation={[0, 0.5, 0]} position={[0, -0.4, 0]}>
      <MaterialMuestra {...props} />
    </mesh>
  );
}

function Barra(props: PropsMuestra) {
  const seg = props.detalle === 'bajo' ? 12 : 48;
  return (
    <group rotation={[0, 0.6, Math.PI / 2]} position={[0, -0.35, 0]}>
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, 0, i * 0.1]}>
          <cylinderGeometry args={[0.24, 0.24, 2.6 - i * 0.4, seg]} />
          <MaterialMuestra {...props} />
        </mesh>
      ))}
    </group>
  );
}

/** Alambre enrollado: tubo a lo largo de una hélice, con una punta libre. */
function Alambre(props: PropsMuestra) {
  const geo = useMemo(() => {
    const vueltas = 7;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= vueltas * 40; i++) {
      const t = i / 40;
      pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 2) * 0.8, -0.6 + t * 0.11, Math.sin(t * Math.PI * 2) * 0.8));
    }
    const ultimo = pts.at(-1)!;
    pts.push(new THREE.Vector3(ultimo.x + 0.4, ultimo.y + 0.2, ultimo.z + 0.6), new THREE.Vector3(ultimo.x + 0.9, ultimo.y + 0.5, ultimo.z + 0.9));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), props.detalle === 'bajo' ? 120 : 600, 0.045, props.detalle === 'bajo' ? 4 : 10);
  }, [props.detalle]);
  return (
    <mesh geometry={geo} rotation={[0.15, 0, 0]}>
      <MaterialMuestra {...props} />
    </mesh>
  );
}

/** Cinta enrollada (Mg): rectángulo plano extruido a lo largo de una espiral. */
function Cinta(props: PropsMuestra) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 5 * 48; i++) {
      const t = i / 48;
      const r = 0.35 + t * 0.12;
      pts.push(new THREE.Vector3(Math.cos(t * Math.PI * 2) * r, Math.sin(t * Math.PI * 2) * r, 0));
    }
    const forma = new THREE.Shape();
    forma.moveTo(-0.012, -0.16);
    forma.lineTo(0.012, -0.16);
    forma.lineTo(0.012, 0.16);
    forma.lineTo(-0.012, 0.16);
    return new THREE.ExtrudeGeometry(forma, { steps: props.detalle === 'bajo' ? 80 : 400, extrudePath: new THREE.CatmullRomCurve3(pts), bevelEnabled: false });
  }, [props.detalle]);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2.6, 0, 0]} position={[0, -0.2, 0]}>
      <MaterialMuestra {...props} />
    </mesh>
  );
}

/** Lámina delgada ligeramente curvada (como una hoja de metal). */
function Lamina(props: PropsMuestra) {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(2.3, 0.025, 1.5, 48, 1, 16);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, p.getY(i) + 0.14 * Math.cos(x * 1.1) + 0.05 * Math.sin(z * 2.2 + x));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[0.25, 0.5, 0]} position={[0, -0.3, 0]}>
      <MaterialMuestra {...props} />
    </mesh>
  );
}

/** Gránulos: muchos trocitos redondeados apilados (instancias). */
function Granulos(props: PropsMuestra) {
  const n = props.detalle === 'bajo' ? 18 : 70;
  const geo = useMemo(() => geometriaTrozo(props.semilla, 1, 0.3), [props.semilla]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const r = aleatorio(props.semilla * 31);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const rad = Math.sqrt(r()) * 1.05, a = r() * Math.PI * 2;
      o.position.set(Math.cos(a) * rad, -0.75 + (1 - rad / 1.05) * 0.55 * r() + 0.08, Math.sin(a) * rad);
      o.rotation.set(r() * 3, r() * 3, r() * 3);
      o.scale.setScalar(0.13 + r() * 0.07);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, props.semilla]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]}>
      <MaterialMuestra {...props} />
    </instancedMesh>
  );
}

function Pepita(props: PropsMuestra) {
  const geo = useMemo(() => geometriaTrozo(props.semilla * 3, props.detalle === 'bajo' ? 2 : 5, 0.42), [props.semilla, props.detalle]);
  return (
    <mesh geometry={geo} scale={0.85} position={[0, -0.25, 0]}>
      <MaterialMuestra {...props} />
    </mesh>
  );
}

/** Moneda con canto, borde elevado y el símbolo en relieve. */
function Moneda(props: PropsMuestra) {
  const relieve = useMemo(() => texturaMoneda(props.simbolo ?? ''), [props.simbolo]);
  const seg = props.detalle === 'bajo' ? 24 : 96;
  const color = props.ap.color ?? '#c9cdd3';
  return (
    <group rotation={[0.95, 0, 0]} position={[0, -0.1, 0]}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.13, seg]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.3} />
      </mesh>
      {/* Cara con el símbolo en relieve: disco aparte, con el «arriba» de la textura hacia el fondo */}
      <mesh position={[0, 0.0665, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.93, seg]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.22} bumpMap={relieve} bumpScale={4} />
      </mesh>
      <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.03, 8, seg]} />
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

function CristalCubico(props: PropsMuestra) {
  const piezas = useMemo(() => {
    const r = aleatorio(props.semilla);
    return Array.from({ length: 5 }, (_, i) => ({ s: i ? 0.35 + r() * 0.35 : 0.9, p: [(r() - 0.5) * 1.1, -0.4 + r() * 0.3, (r() - 0.5) * 1.1] as [number, number, number], rot: [r() * 0.6, r() * 1.5, r() * 0.6] as [number, number, number] }));
  }, [props.semilla]);
  return (
    <group>
      {piezas.map((p, i) => (
        <mesh key={i} position={p.p} rotation={p.rot} scale={p.s}>
          <boxGeometry args={[1, 1, 1]} />
          <MaterialMuestra {...props} plano />
        </mesh>
      ))}
    </group>
  );
}

function CristalOctaedrico(props: PropsMuestra) {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh rotation={[0.3, 0.5, 0.15]} scale={[0.95, 1.1, 0.95]}>
        <octahedronGeometry args={[0.95, 0]} />
        <MaterialMuestra {...props} plano />
      </mesh>
      <mesh rotation={[0.9, 0.2, 0.5]} position={[0.95, -0.5, 0.3]} scale={0.38}>
        <octahedronGeometry args={[1, 0]} />
        <MaterialMuestra {...props} plano />
      </mesh>
    </group>
  );
}

/**
 * Cristal escalonado («tolva») del bismuto: marcos cuadrados que crecen más rápido en las aristas que
 * en el centro de las caras, apilados en escalones.
 */
/**
 * Color de interferencia de la película de óxido del bismuto: cambia de forma continua con el grosor
 * de la capa, que aquí se hace variar suavemente con la posición (degradado, sin franjas).
 */
function colorOxido(x: number, y: number, z: number, c: THREE.Color) {
  const t = 0.55 + y * 0.55 + (x + z) * 0.16;
  c.setHSL(t - Math.floor(t), 0.5, 0.6);
}

function geometriaTolva(niveles: number, conColor = true) {
  const partes: THREE.BufferGeometry[] = [];
  for (let k = 0; k < niveles; k++) {
    const lado = 1.6 - k * 0.24, grosor = 0.11, alto = 0.12;
    const y = k * alto * 0.95;
    const borde = (sx: number, sz: number, px: number, pz: number) => {
      // Varios segmentos a lo largo de cada barra para que el degradado sea suave
      const b = new THREE.BoxGeometry(sx, alto, sz, sx > sz ? 8 : 1, 1, sz > sx ? 8 : 1);
      b.translate(px, y, pz);
      partes.push(b);
    };
    borde(lado, grosor, 0, lado / 2 - grosor / 2);
    borde(lado, grosor, 0, -lado / 2 + grosor / 2);
    borde(grosor, lado - 2 * grosor, lado / 2 - grosor / 2, 0);
    borde(grosor, lado - 2 * grosor, -lado / 2 + grosor / 2, 0);
  }
  // Base del hueco central
  const base = new THREE.BoxGeometry(1.6 - niveles * 0.24, 0.06, 1.6 - niveles * 0.24);
  base.translate(0, 0.02, 0);
  partes.push(base);
  return unir(partes, conColor ? colorOxido : undefined);
}

/** Une geometrías no indexadas (equivalente simple a mergeGeometries). */
function unir(partes: THREE.BufferGeometry[], color?: (x: number, y: number, z: number, c: THREE.Color) => void) {
  const pos: number[] = [], nor: number[] = [], col: number[] = [];
  const c = new THREE.Color();
  for (const p of partes) {
    const g = p.index ? p.toNonIndexed() : p;
    if (!g.attributes.normal) g.computeVertexNormals();
    const a = g.attributes.position!.array as Float32Array;
    for (let k = 0; k < a.length; k++) pos.push(a[k]!);
    const nn = g.attributes.normal!.array as Float32Array;
    for (let k = 0; k < nn.length; k++) nor.push(nn[k]!);
    if (color)
      for (let k = 0; k < a.length; k += 3) {
        color(a[k]!, a[k + 1]!, a[k + 2]!, c);
        col.push(c.r, c.g, c.b);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (color) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

function CristalEscalonado(props: PropsMuestra) {
  const geo = useMemo(() => geometriaTolva(props.detalle === 'bajo' ? 4 : 6), [props.detalle]);
  // Degradado suave de la película de óxido + iridiscencia física (cambia con el ángulo de visión)
  const mat = <meshPhysicalMaterial vertexColors metalness={1} roughness={0.14} iridescence={1} iridescenceIOR={1.8} iridescenceThicknessRange={[200, 600]} envMapIntensity={1.2} side={THREE.DoubleSide} />;
  return (
    <group position={[0, -0.6, 0]}>
      <mesh geometry={geo} rotation={[0.15, 0.4, 0.05]}>
        {mat}
      </mesh>
      <mesh geometry={geo} position={[0.8, 0.3, -0.55]} rotation={[0.7, 1.2, 0.3]} scale={0.55}>
        {mat}
      </mesh>
    </group>
  );
}

/** Oblea de silicio pulida con el canto plano de orientación. */
function Oblea(props: PropsMuestra) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const R = 1.35, corte = Math.acos(0.92);
    s.absarc(0, 0, R, -Math.PI / 2 + corte, Math.PI * 1.5 - corte, false);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false, curveSegments: props.detalle === 'bajo' ? 16 : 64 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [props.detalle]);
  const tex = useMemo(() => {
    const t = texturaOblea();
    t.repeat.set(1 / 2.7, 1 / 2.7);
    t.offset.set(0.5, 0.5);
    return t;
  }, []);
  return (
    <mesh geometry={geo} rotation={[0.55, 0.3, 0]} position={[0, -0.25, 0]}>
      <meshPhysicalMaterial map={tex} metalness={0.9} roughness={0.08} clearcoat={1} iridescence={0.35} iridescenceThicknessRange={[100, 400]} />
    </mesh>
  );
}

/** Perfil de frasco de vidrio (LatheGeometry). */
function perfilFrasco(r = 0.95, h = 1.7): THREE.Vector2[] {
  return [new THREE.Vector2(0, -h / 2), new THREE.Vector2(r, -h / 2), new THREE.Vector2(r, h / 2 - 0.25), new THREE.Vector2(r * 0.7, h / 2 - 0.05), new THREE.Vector2(r * 0.7, h / 2)];
}
const vidrio = { color: '#e6f0fa', transparent: true, opacity: 0.18, roughness: 0.04, metalness: 0, clearcoat: 1, depthWrite: false } as const;

/** Metal alcalino bajo aceite mineral (Li, Na, K…): trozos con costra blanquecina dentro del frasco. */
function EnAceite(props: PropsMuestra) {
  const perfil = useMemo(() => perfilFrasco(), []);
  const r = aleatorio(props.semilla);
  const trozos = useMemo(() => Array.from({ length: 4 }, (_, i) => ({ geo: geometriaTrozo(props.semilla + i * 17, props.detalle === 'bajo' ? 1 : 3, 0.35), p: [(r() - 0.5) * 0.9, -0.55 + r() * 0.15, (r() - 0.5) * 0.9] as [number, number, number], s: 0.22 + r() * 0.14 })), [props.semilla, props.detalle]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group position={[0, -0.05, 0]}>
      <mesh renderOrder={3}>
        <latheGeometry args={[perfil, 48]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
      {/* Aceite mineral: líquido ámbar pálido transparente */}
      <mesh position={[0, -0.25, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.92, 0.92, 1.15, 48]} />
        <meshPhysicalMaterial color="#e8c77a" transparent opacity={0.28} roughness={0.1} depthWrite={false} />
      </mesh>
      {trozos.map((t, i) => (
        <mesh key={i} geometry={t.geo} position={t.p} scale={t.s}>
          <meshPhysicalMaterial color={props.ap.color ?? '#cfd2d6'} metalness={0.7} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.18, 48]} />
        <meshStandardMaterial color="#20252e" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Ampolla de vidrio sellada al fuego (Cs, Rb, Br…), con el contenido en el fondo. */
function Ampolla(props: PropsMuestra) {
  const perfil = useMemo(() => {
    const p: THREE.Vector2[] = [new THREE.Vector2(0, -1.05)];
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2);
      p.push(new THREE.Vector2(0.42 * Math.cos(a), -0.63 + 0.42 * Math.sin(a)));
    }
    p.push(new THREE.Vector2(0.42, 0.35), new THREE.Vector2(0.15, 0.6), new THREE.Vector2(0.15, 0.95), new THREE.Vector2(0.05, 1.25), new THREE.Vector2(0, 1.3));
    return p;
  }, []);
  const color = props.ap.color ?? '#c9cdd3';
  return (
    <group rotation={[0, 0, 0.12]}>
      <mesh renderOrder={3}>
        <latheGeometry args={[perfil, 40]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
      {props.liquido ? (
        <>
          <mesh position={[0, -0.72, 0]} scale={[1, 0.75, 1]}>
            <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshPhysicalMaterial color={color} roughness={0.1} clearcoat={0.6} transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, -0.1, 0]} scale={[0.38, 0.9, 0.38]}>
            <sphereGeometry args={[1, 24, 12]} />
            <meshStandardMaterial color="#d9622b" transparent opacity={0.16} depthWrite={false} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, -0.82, 0]} scale={[0.38, 0.22, 0.38]}>
          <sphereGeometry args={[1, 32, 16]} />
          <MaterialMuestra {...props} />
        </mesh>
      )}
    </group>
  );
}

/** Gota de mercurio sobre un vidrio de reloj: casi esférica por su gran tensión superficial. */
function Gota(props: PropsMuestra) {
  const r = aleatorio(props.semilla);
  const gotitas = useMemo(() => Array.from({ length: 6 }, () => ({ p: [(r() - 0.5) * 1.8, -0.66, (r() - 0.5) * 1.4] as [number, number, number], s: 0.05 + r() * 0.08 })), []); // eslint-disable-line react-hooks/exhaustive-deps
  const seg = props.detalle === 'bajo' ? 16 : 64;
  // Espejo plateado: metal puro y muy liso, con más reflejo del entorno y un mínimo de luz propia para
  // que la zona que refleja el suelo oscuro del estudio no se vea negra
  const mat = <meshPhysicalMaterial color="#f3f5f8" metalness={1} roughness={0.05} envMapIntensity={2.4} emissive="#aab0ba" emissiveIntensity={0.22} />;
  return (
    <group>
      <mesh position={[0, -0.42, 0]} scale={[0.85, 0.34, 0.85]}>
        <sphereGeometry args={[1, seg, seg / 2]} />
        {mat}
      </mesh>
      {gotitas.map((g, i) => (
        <mesh key={i} position={g.p} scale={[g.s, g.s * 0.7, g.s]}>
          <sphereGeometry args={[1, 16, 8]} />
          {mat}
        </mesh>
      ))}
      {/* Vidrio de reloj: casquete inferior de una esfera cuyo centro queda por encima de la gota */}
      <mesh position={[0, 1.46, 0]} rotation={[Math.PI, 0, 0]} renderOrder={3}>
        <sphereGeometry args={[2.2, 48, 8, 0, Math.PI * 2, 0, 0.42]} />
        <meshPhysicalMaterial {...vidrio} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Símbolo de radiactividad (trébol) en 3D, para los elementos sin muestra que exhibir. */
export function SimboloRadiactivo({ escala = 1 }: { escala?: number }) {
  const geo = useMemo(() => {
    const formas: THREE.Shape[] = [];
    for (let k = 0; k < 3; k++) {
      const a0 = (k * 2 * Math.PI) / 3 + Math.PI / 2 - Math.PI / 6, a1 = a0 + Math.PI / 3;
      const s = new THREE.Shape();
      s.absarc(0, 0, 1, a0, a1, false);
      s.absarc(0, 0, 0.3, a1, a0, true);
      formas.push(s);
    }
    const c = new THREE.Shape();
    c.absarc(0, 0, 0.2, 0, Math.PI * 2, false);
    formas.push(c);
    return new THREE.ExtrudeGeometry(formas, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24 });
  }, []);
  return (
    <group scale={escala}>
      <mesh position={[0, 0, -0.05]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 64]} />
        <meshStandardMaterial color="#f5c400" roughness={0.5} />
      </mesh>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Muestra según su presentación. */
export function MuestraPresentacion({ presentacion, ...props }: PropsMuestra & { presentacion: Presentacion }) {
  const ap = { ...props.ap, color: props.ap.color ?? '#c9cdd3' };
  switch (presentacion) {
    case 'lingote':
      return <Lingote {...props} />;
    case 'barra':
      return <Barra {...props} />;
    case 'alambre':
      return <Alambre {...props} />;
    case 'cinta':
      return <Cinta {...props} />;
    case 'lamina':
      return <Lamina {...props} />;
    case 'granulos':
      return <Granulos {...props} />;
    case 'polvo':
      return <Polvo color={ap.color} semilla={props.semilla} />;
    case 'pepita':
      return <Pepita {...props} />;
    case 'moneda':
      return <Moneda {...props} />;
    case 'cristal-cubico':
      return <CristalCubico {...props} />;
    case 'cristal-octaedrico':
      return <CristalOctaedrico {...props} />;
    case 'cristal-escalonado':
      return <CristalEscalonado {...props} />;
    case 'cristales':
      return <Cristales ap={ap} z={props.semilla} />;
    case 'oblea':
      return <Oblea {...props} />;
    case 'aceite':
      return <EnAceite {...props} />;
    case 'ampolla':
      return <Ampolla {...props} />;
    case 'gota':
      return <Gota {...props} />;
    case 'tubo':
      return <TuboDescarga ap={ap} />;
    case 'frasco-gas':
      return <Frasco ap={ap} gas />;
    case 'sin-muestra':
      return (
        <group rotation={[Math.PI / 2.4, 0, 0]}>
          <SimboloRadiactivo />
        </group>
      );
    case 'trozo':
    default:
      return props.efecto ? <Pepita {...props} /> : <Metal ap={ap} z={props.semilla} />;
  }
}

/**
 * Versión simplificada (LOD bajo) de cada presentación, en una sola geometría y a la misma escala
 * que la muestra detallada: la vitrina la dibuja con InstancedMesh (una llamada por tipo).
 */
export function geometriaMiniatura(p: Presentacion): THREE.BufferGeometry {
  const r = aleatorio(p.length * 9973);
  const partes: THREE.BufferGeometry[] = [];
  const m = (g: THREE.BufferGeometry, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0], esc: number | [number, number, number] = 1) => {
    const e = typeof esc === 'number' ? [esc, esc, esc] : esc;
    g.scale(e[0]!, e[1]!, e[2]!);
    g.rotateX(rot[0]).rotateY(rot[1]).rotateZ(rot[2]);
    g.translate(...pos);
    partes.push(g);
  };
  switch (p) {
    case 'lingote':
      m(geometriaLingote(), [0, -0.4, 0], [0, 0.5, 0]);
      break;
    case 'barra':
      m(new THREE.CylinderGeometry(0.24, 0.24, 2.6, 10), [0, -0.3, -0.25], [0, 0, Math.PI / 2]);
      m(new THREE.CylinderGeometry(0.24, 0.24, 2.2, 10), [0.1, -0.3, 0.3], [0, 0, Math.PI / 2]);
      break;
    case 'alambre': {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 5 * 16; i++) pts.push(new THREE.Vector3(Math.cos((i / 16) * Math.PI * 2) * 0.8, -0.55 + (i / 16) * 0.16, Math.sin((i / 16) * Math.PI * 2) * 0.8));
      m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.07, 4), [0, 0, 0], [0.15, 0, 0]);
      break;
    }
    case 'cinta':
      for (let i = 0; i < 4; i++) m(new THREE.TorusGeometry(0.4 + i * 0.13, 0.03, 4, 20), [0, -0.3, 0], [-Math.PI / 2.6, 0, 0], [1, 1, 5]);
      break;
    case 'lamina': {
      const g = new THREE.BoxGeometry(2.3, 0.04, 1.5, 10, 1, 2);
      const a = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < a.count; i++) a.setY(i, a.getY(i) + 0.14 * Math.cos(a.getX(i) * 1.1));
      m(g, [0, -0.3, 0], [0.25, 0.5, 0]);
      break;
    }
    case 'granulos':
      for (let i = 0; i < 12; i++) {
        const rad = Math.sqrt(r()) * 0.9, a = r() * Math.PI * 2;
        m(new THREE.IcosahedronGeometry(0.2 + r() * 0.08, 0), [Math.cos(a) * rad, -0.6 + (1 - rad) * 0.4 * r(), Math.sin(a) * rad]);
      }
      break;
    case 'polvo':
      m(new THREE.ConeGeometry(1.05, 0.7, 16), [0, -0.5, 0]);
      break;
    case 'moneda':
      m(new THREE.CylinderGeometry(1, 1, 0.13, 24), [0, -0.1, 0], [0.95, 0, 0]);
      break;
    case 'cristales':
      for (let i = 0; i < 6; i++) m(new THREE.IcosahedronGeometry(1, 0), i ? [(r() - 0.5) * 1.6, -0.5 + r() * 0.2, (r() - 0.5) * 1.2] : [0, -0.2, 0], [r() * 3, r() * 3, 0], i ? 0.3 + r() * 0.2 : 0.7);
      break;
    case 'cristal-cubico':
      for (let i = 0; i < 4; i++) m(new THREE.BoxGeometry(1, 1, 1), i ? [(r() - 0.5) * 1.2, -0.4, (r() - 0.5) * 1.2] : [0, -0.2, 0], [0, r() * 1.5, 0], i ? 0.45 : 0.9);
      break;
    case 'cristal-octaedrico':
      m(new THREE.OctahedronGeometry(0.95, 0), [0, -0.05, 0], [0.3, 0.5, 0.15], [0.95, 1.1, 0.95]);
      break;
    case 'cristal-escalonado':
      m(geometriaTolva(4, false), [0, -0.6, 0], [0.15, 0.4, 0.05]);
      break;
    case 'oblea':
      m(new THREE.CylinderGeometry(1.35, 1.35, 0.03, 24), [0, -0.25, 0], [0.55, 0.3, 0]);
      break;
    case 'aceite':
      m(new THREE.CylinderGeometry(0.95, 0.95, 1.7, 16), [0, -0.05, 0]);
      m(new THREE.CylinderGeometry(0.7, 0.7, 0.18, 16), [0, 0.88, 0]);
      break;
    case 'ampolla':
      m(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 12), [0, -0.3, 0]);
      m(new THREE.ConeGeometry(0.42, 0.9, 12), [0, 0.85, 0]);
      break;
    case 'gota':
      m(new THREE.SphereGeometry(1, 16, 10), [0, -0.42, 0], [0, 0, 0], [0.85, 0.34, 0.85]);
      break;
    case 'frasco-gas':
      m(new THREE.SphereGeometry(1.05, 16, 12), [0, -0.3, 0]);
      m(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 12), [0, 1.0, 0]);
      break;
    default:
      m(geometriaTrozo(p === 'pepita' ? 97 : 53, 1, 0.38), [0, -0.3, 0], [0.2, 0.6, 0], p === 'pepita' ? 0.85 : 1);
  }
  return unir(partes);
}
