import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { ELEMENTOS, posicionTabla } from '@/chem/elements';
import Escena3D from '@/components/escena3d/Escena3D';
import { colorEscala, normalizador, PROPIEDADES, propiedadPorClave, type ClavePropiedad } from './colores';

/** Textura con el símbolo del elemento para la cara superior de cada columna. */
function texturaSimbolo(simbolo: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 96, 96);
  g.fillStyle = '#0b1020';
  g.font = 'bold 46px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(simbolo, 48, 52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Tabla periódica en 3D: la altura de cada columna es proporcional a la propiedad elegida. */
export default function Tabla3D({ alElegir }: { alElegir: (z: number) => void }) {
  const [clave, setClave] = useState<ClavePropiedad>('electronegatividad');
  const [hover, setHover] = useState<number | null>(null);
  const p = propiedadPorClave(clave);
  const norm = useMemo(() => normalizador(ELEMENTOS, p), [p]);
  const texturas = useMemo(() => new Map(ELEMENTOS.map((e) => [e.z, texturaSimbolo(e.simbolo)])), []);
  const caja = useMemo(() => new THREE.BoxGeometry(0.9, 1, 0.9), []);
  const elHover = hover ? ELEMENTOS[hover - 1]! : null;

  return (
    <div>
      <label className="mb-3 block text-sm">
        <span className="mb-1 block font-medium">Altura según</span>
        <select value={clave} onChange={(e) => setClave(e.target.value as ClavePropiedad)} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
          {PROPIEDADES.map((x) => (
            <option key={x.clave} value={x.clave}>
              {x.nombre}
            </option>
          ))}
        </select>
      </label>
      <Escena3D
        descripcion={`Tabla periódica en 3D con columnas de altura proporcional a ${p.nombre}`}
        camara={[0, 14, 15]}
        className="h-[460px]"
        superposicion={
          elHover && (
            <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/75 px-2 py-1 text-sm text-white">
              {elHover.nombre} ({elHover.simbolo}):{' '}
              {elHover[clave] === null ? 'sin dato' : `${elHover[clave]!.toLocaleString('es-PE', { maximumFractionDigits: p.decimales })} ${p.unidad}`}
            </div>
          )
        }
      >
        <group position={[-8.5, 0, -5]}>
          {ELEMENTOS.map((e) => {
            const { fila, columna } = posicionTabla(e.z);
            const v = e[clave];
            const t = v === null ? 0 : norm.t(v);
            const alto = v === null ? 0.05 : 0.15 + t * 5;
            const x = columna - 1, zz = fila >= 9 ? fila - 0.4 : fila - 1;
            return (
              <group key={e.z} position={[x, alto / 2, zz]}>
                <mesh
                  geometry={caja}
                  scale={[1, alto, 1]}
                  onPointerOver={(ev) => {
                    ev.stopPropagation();
                    setHover(e.z);
                  }}
                  onPointerOut={() => setHover((h) => (h === e.z ? null : h))}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    alElegir(e.z);
                  }}
                >
                  <meshStandardMaterial color={v === null ? '#3a4157' : colorEscala(t)} emissive={hover === e.z ? '#ffffff' : '#000000'} emissiveIntensity={0.25} />
                </mesh>
                <mesh position={[0, alto / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.7, 0.7]} />
                  <meshBasicMaterial map={texturas.get(e.z)} transparent opacity={0.92} />
                </mesh>
              </group>
            );
          })}
        </group>
      </Escena3D>
      <p className="mt-2 text-xs text-texto-suave">
        Pasa el cursor sobre una columna para ver su valor; haz clic para abrir la ficha. Las columnas grises casi planas no tienen dato.
      </p>
    </div>
  );
}
