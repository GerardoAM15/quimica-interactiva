import { Suspense, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePreferencias } from '@/store/preferencias';

interface Props {
  children: ReactNode;
  /** Descripción para lectores de pantalla. */
  descripcion: string;
  /** Posición inicial de la cámara. */
  camara?: [number, number, number];
  campoVision?: number;
  /** 'demand' redibuja solo al interactuar (ahorra batería); 'always' para animaciones. */
  modoFotogramas?: 'always' | 'demand';
  autoRotar?: boolean;
  /**
   * Entorno de iluminación para materiales metálicos/vidrio (PBR): `true` usa paneles de luz generados;
   * `'estudio'` usa el HDRI de estudio local (public/hdri, CC0) para reflejos reales.
   */
  entorno?: boolean | 'estudio';
  /** Exposición del mapeo de tonos ACES (por defecto 1). */
  exposicion?: number;
  /** Intensidad de los reflejos del HDRI de estudio (por defecto 0,9). */
  intensidadEntorno?: number;
  /** Opciones extra de OrbitControls (límites de distancia y ángulo, paneo…). */
  controles?: Record<string, unknown>;
  /** Mostrar u ocultar el texto de ayuda inferior. */
  ayuda?: string;
  className?: string;
  /** Contenido HTML superpuesto (leyendas). */
  superposicion?: ReactNode;
}

/** Cuenta FPS dentro del bucle de render y escribe el valor en un elemento del DOM (sin re-render de React). */
function MedidorFPS({ destino }: { destino: React.RefObject<HTMLSpanElement | null> }) {
  const acumulado = useRef({ cuadros: 0, tiempo: 0 });
  useFrame((_, delta) => {
    const a = acumulado.current;
    a.cuadros++;
    a.tiempo += delta;
    if (a.tiempo >= 0.5) {
      if (destino.current) destino.current.textContent = `${Math.round(a.cuadros / a.tiempo)} FPS`;
      a.cuadros = 0;
      a.tiempo = 0;
    }
  });
  return null;
}

/**
 * Escena 3D estándar: cámara en perspectiva, controles de órbita (arrastrar para rotar,
 * rueda o pellizco para acercar), luces y un entorno generado localmente (sin descargar HDR,
 * para que funcione sin conexión).
 */
export default function Escena3D({
  children,
  descripcion,
  camara = [0, 0, 8],
  campoVision = 45,
  modoFotogramas = 'demand',
  autoRotar = false,
  entorno = false,
  className = 'h-[420px]',
  superposicion,
  exposicion = 1,
  intensidadEntorno = 0.9,
  controles,
  ayuda = 'Arrastra para rotar · rueda o pellizco para acercar',
}: Props) {
  const mostrarFPS = usePreferencias((s) => s.mostrarFPS);
  const setMostrarFPS = usePreferencias((s) => s.setMostrarFPS);
  const textoFPS = useRef<HTMLSpanElement>(null);
  const fotogramas = mostrarFPS || autoRotar ? 'always' : modoFotogramas;

  return (
    <div className={`relative overflow-hidden rounded-lg border border-borde bg-[#070b16] ${className}`}>
      <Canvas
        camera={{ position: camara, fov: campoVision, near: 0.05, far: 2000 }}
        dpr={[1, 1.75]}
        frameloop={fotogramas}
        // Mapeo de tonos ACES Filmic (el de R3F por defecto), explícito para ajustar la exposición
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposicion }}
        aria-label={descripcion}
        role="img"
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} />
        <directionalLight position={[-6, -3, -4]} intensity={0.35} />
        {entorno === 'estudio' && (
          // HDRI de estudio también como fondo difuminado: los metales reflejan un estudio real y no el vacío
          <Environment files={`${import.meta.env.BASE_URL}hdri/estudio_1k.hdr`} environmentIntensity={intensidadEntorno} background backgroundBlurriness={0.6} backgroundIntensity={0.32} />
        )}
        {entorno === true && (
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={2.2} position={[0, 5, -6]} scale={[12, 5, 1]} />
            <Lightformer form="rect" intensity={1.2} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
            <Lightformer form="rect" intensity={0.8} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
            <Lightformer form="circle" intensity={3} position={[0, 8, 4]} scale={3} />
          </Environment>
        )}
        <Suspense fallback={null}>{children}</Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.12} autoRotate={autoRotar} autoRotateSpeed={1.2} {...controles} />
        {mostrarFPS && <MedidorFPS destino={textoFPS} />}
      </Canvas>
      {superposicion}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {mostrarFPS && (
          <span ref={textoFPS} className="rounded bg-black/70 px-2 py-0.5 font-mono text-xs text-green-300" aria-live="off">
            … FPS
          </span>
        )}
        <button
          type="button"
          onClick={() => setMostrarFPS(!mostrarFPS)}
          aria-pressed={mostrarFPS}
          className="rounded bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
        >
          FPS
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-2 text-[11px] text-white/60">
        {ayuda}
      </p>
    </div>
  );
}
