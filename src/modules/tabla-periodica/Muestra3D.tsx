import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Escena3D from '@/components/escena3d/Escena3D';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { MuestraPresentacion } from '@/components/escena3d/Presentaciones';
import { elementoPorZ, NOMBRE_ESTADO } from '@/chem/elements';
import { aparienciaDe } from './apariencia';
import { EXPLICACION_EFECTO, NOMBRE_PRESENTACION, presentacionDe } from './presentacion';

/**
 * Encuadre automático: mide la caja envolvente del objeto, lo centra en el origen, coloca el pedestal
 * justo debajo y aleja la cámara lo necesario para que quepa entero (según el campo de visión y la
 * proporción del lienzo). Así ninguna muestra queda cortada, sea un lingote o una ampolla alta.
 */
export function Encuadre({ children, clave, pedestal = true }: { children: ReactNode; clave: string; pedestal?: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const { camera, controls, invalidate, size } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControlsImpl | null;
    invalidate: () => void;
    size: { width: number; height: number };
  };
  const [base, setBase] = useState<{ y: number; radio: number } | null>(null);

  useLayoutEffect(() => {
    const g = grupo.current;
    if (!g) return;
    g.position.set(0, 0, 0);
    g.updateWorldMatrix(true, true);
    const caja = new THREE.Box3().setFromObject(g);
    if (caja.isEmpty()) return;
    const centro = caja.getCenter(new THREE.Vector3());
    const tam = caja.getSize(new THREE.Vector3());
    g.position.copy(centro).multiplyScalar(-1);
    const radioPedestal = Math.max(0.9, Math.max(tam.x, tam.z) * 0.62);
    // Esfera que contiene el objeto y el pedestal
    const radio = Math.max(Math.hypot(tam.x, tam.y, tam.z) / 2, pedestal ? Math.hypot(radioPedestal, tam.y / 2 + 0.16) : 0);
    // Distancia para que la esfera quepa en el menor de los dos campos de visión (vertical y horizontal)
    const fovV = (camera.fov * Math.PI) / 180;
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * (size.width / size.height));
    const distancia = (radio / Math.sin(Math.min(fovV, fovH) / 2)) * 1.08;
    camera.position.set(0, distancia * 0.3, distancia * 0.954);
    camera.near = distancia / 50;
    camera.far = distancia * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
    setBase({ y: -tam.y / 2, radio: radioPedestal });
    invalidate();
  }, [clave, controls, size.width, size.height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <group ref={grupo}>{children}</group>
      {pedestal && base && (
        <>
          <mesh position={[0, base.y - 0.08, 0]}>
            <cylinderGeometry args={[base.radio, base.radio * 1.04, 0.16, 64]} />
            <meshPhysicalMaterial color="#3b414c" roughness={0.4} metalness={0.15} clearcoat={0.5} />
          </mesh>
          <ContactShadows key={clave} position={[0, base.y + 0.005, 0]} opacity={0.5} scale={base.radio * 2.4} blur={2.4} far={2} frames={1} />
        </>
      )}
    </>
  );
}

/**
 * Placa de aviso para los elementos sin muestra: no se inventa un aspecto que nadie ha visto.
 * Amarillo y negro son los colores normalizados de la señal de radiactividad (no dependen del tema).
 */
function PlacaSinMuestra({ nombre, pocosAtomos, vidaMedia }: { nombre: string; pocosAtomos: boolean; vidaMedia?: { isotopo: string; texto: string } }) {
  // Trébol: tres sectores de 60° alrededor de un disco central
  const sector = (k: number) => {
    const a0 = ((k * 120 - 90 - 30) * Math.PI) / 180, a1 = a0 + Math.PI / 3;
    const p = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    return `M ${p(15, a0)} L ${p(50, a0)} A 50 50 0 0 1 ${p(50, a1)} L ${p(15, a1)} A 15 15 0 0 0 ${p(15, a0)} Z`;
  };
  return (
    <div className="flex h-[360px] items-center justify-center rounded-lg border border-borde bg-superficie-2 p-4">
      <div className="w-full max-w-sm rounded-md border-4 border-[#111111] bg-[#f5c400] p-5 text-center text-[#111111] shadow-lg" role="img" aria-label={`${nombre}: sin muestra. ${pocosAtomos ? 'Solo se han producido unos pocos átomos' : 'Muy radiactivo y escaso'}${vidaMedia ? `; isótopo más estable ${vidaMedia.isotopo}, vida media ${vidaMedia.texto}` : ''}.`}>
        <svg viewBox="-56 -56 112 112" className="mx-auto h-28 w-28" aria-hidden>
          {[0, 1, 2].map((k) => (
            <path key={k} d={sector(k)} fill="#111111" />
          ))}
          <circle r={9} fill="#111111" />
        </svg>
        <p className="mt-3 text-base font-bold">{pocosAtomos ? 'Solo se han producido unos pocos átomos' : 'Muy radiactivo y escaso'}</p>
        <p className="mt-1 text-sm">{pocosAtomos ? `Nunca se ha reunido una cantidad visible de ${nombre}.` : `No se exhiben muestras de ${nombre} en las colecciones.`}</p>
        {vidaMedia && (
          <p className="mt-2 text-sm">
            Vida media ({vidaMedia.isotopo.replace('-', '‑')}): <strong>{vidaMedia.texto}</strong>
          </p>
        )}
      </div>
    </div>
  );
}

/** Muestra realista del elemento a 25 °C, según su presentación típica de colección. */
export default function Muestra3D({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const ap = aparienciaDe(z);
  const info = presentacionDe(z);
  const [opcional, setOpcional] = useState(false);
  const sinMuestra = info.presentacion === 'sin-muestra';
  const animado = info.presentacion === 'tubo';
  const efecto = info.efecto ?? (opcional ? info.efectoOpcional : undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {sinMuestra ? (
        <PlacaSinMuestra nombre={el.nombre} pocosAtomos={info.pocosAtomos} vidaMedia={info.vidaMedia} />
      ) : (
        <Escena3D
          descripcion={`Muestra de ${el.nombre} a 25 °C: ${NOMBRE_PRESENTACION[info.presentacion]}`}
          camara={[0, 1, 4]}
          modoFotogramas={animado ? 'always' : 'demand'}
          entorno="estudio"
          className="h-[360px]"
        >
          <Encuadre clave={`${z}-${efecto ?? ''}`} pedestal={!animado}>
            <MuestraPresentacion presentacion={info.presentacion} ap={ap} efecto={efecto} semilla={z * 7919} simbolo={el.simbolo} liquido={el.estadoEstandar === 'liquido'} />
          </Encuadre>
        </Escena3D>
      )}
      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">
          {el.nombre} a 25 °C: {NOMBRE_ESTADO[el.estadoEstandar].toLowerCase()}
        </h3>
        {!sinMuestra && (
          <p>
            Presentación: <strong>{NOMBRE_PRESENTACION[info.presentacion]}</strong>
          </p>
        )}
        <p>{sinMuestra ? (info.pocosAtomos ? 'Elemento sintético: se obtiene átomo por átomo en aceleradores de partículas y se desintegra enseguida.' : 'Es radiactivo y muy escaso: no se exhiben muestras en las colecciones; su manipulación requiere instalaciones especiales.') : ap.descripcion}</p>
        {info.efectoOpcional && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={opcional} onChange={(e) => setOpcional(e.target.checked)} />
            {info.efectoOpcional === 'patina' ? 'Mostrar con pátina (cobre envejecido)' : 'Mostrar acabado alternativo'}
          </label>
        )}
        {efecto && <p>{EXPLICACION_EFECTO[efecto]}</p>}
        {info.nota && <p className="text-texto-suave">{info.nota}</p>}
        {info.vidaMedia && (
          <p>
            Isótopo más estable: <strong>{info.vidaMedia.isotopo.replace('-', '‑')}</strong>, vida media {info.vidaMedia.texto}
            {info.vidaMedia.segundos > 1e25 && ' (en la práctica se comporta como estable)'}.
          </p>
        )}
        {info.presentacion === 'tubo' && <p className="text-texto-suave">El gas es incoloro; el brillo aparece al aplicar alto voltaje en un tubo a baja presión.</p>}
        {info.presentacion === 'aceite' && <p className="text-texto-suave">Se guarda bajo aceite mineral para que no reaccione con el oxígeno y la humedad del aire.</p>}
        {info.presentacion === 'ampolla' && <p className="text-texto-suave">Se conserva en una ampolla sellada (al vacío o con argón) porque reacciona con el aire.</p>}
        <div className="space-y-1 pt-1 text-xs text-texto-suave">
          {sinMuestra ? (
            <p>Vida media: OIEA, LiveChart of Nuclides (ENSDF/NUBASE).</p>
          ) : (
            <>
              <InsigniaRevision texto="Aspecto aproximado" titulo="Representación visual aproximada de la descripción de la fuente; pendiente de revisión." />
              <p>
                Aspecto: CRC Handbook (sección 4) y Greenwood-Earnshaw. Presentación: colecciones de elementos (T. Gray). {info.vidaMedia && 'Vida media: OIEA (LiveChart). '}Iluminación:
                HDRI de estudio de Poly Haven (CC0). {!ap.especifica && 'Color genérico para su tipo de elemento.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
