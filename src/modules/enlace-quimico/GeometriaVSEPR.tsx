import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { analizarVSEPR, type ResultadoVSEPR } from '@/chem/vsepr';
import { aMhchem } from '@/chem/formula';
import Escena3D from '@/components/escena3d/Escena3D';
import { colorAtomo } from '@/components/molecula/Molecula3D';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce } from '@/components/Formula';

const EJEMPLOS = ['CO2', 'BF3', 'CH4', 'NH3', 'H2O', 'SO2', 'PCl5', 'SF4', 'ClF3', 'XeF2', 'SF6', 'BrF5', 'XeF4', 'SO4^2-', 'H2SO4'];
const ARRIBA = new THREE.Vector3(0, 1, 0);

/** Modelo VSEPR 3D: central, ligandos y pares libres (lóbulos translúcidos). Convención: z vertical. */
function ModeloVSEPR({ r, mostrarPares }: { r: ResultadoVSEPR; mostrarPares: boolean }) {
  const L = 1.7;
  // chem (x, y, z) → three (x, z, −y) para que el eje z químico quede vertical
  const v = (p: number[]) => new THREE.Vector3(p[0]!, p[2]!, -p[1]!);
  const ligandos = useMemo(() => r.posiciones.ligandos.map((p) => v(p).multiplyScalar(L)), [r]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color={colorAtomo(r.central)} roughness={0.35} />
      </mesh>
      <Html center position={[0, 0, 0]}>
        <span className="pointer-events-none text-xs font-bold text-white drop-shadow">{r.central}</span>
      </Html>
      {ligandos.map((p, i) => {
        const l = r.ligandos[i]!;
        const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, p.clone().normalize());
        return (
          <group key={i}>
            <mesh position={p.clone().multiplyScalar(0.5)} quaternion={q}>
              <cylinderGeometry args={[0.08, 0.08, L, 12]} />
              <meshStandardMaterial color="#9aa3b5" />
            </mesh>
            <mesh position={p}>
              <sphereGeometry args={[l.simbolo === 'H' ? 0.22 : 0.32, 24, 16]} />
              <meshStandardMaterial color={colorAtomo(l.simbolo)} roughness={0.4} />
            </mesh>
            <Html center position={p}>
              <span className="pointer-events-none text-[10px] font-bold text-black">{l.esOH ? 'OH' : l.simbolo}</span>
            </Html>
          </group>
        );
      })}
      {mostrarPares &&
        r.posiciones.paresLibres.map((p, i) => {
          const d = v(p);
          const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, d.clone().normalize());
          return (
            <mesh key={`e${i}`} position={d.clone().multiplyScalar(0.85)} quaternion={q} scale={[0.32, 0.6, 0.32]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshStandardMaterial color="#c084fc" transparent opacity={0.45} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
}

export function GeometriaVSEPR() {
  const [formula, setFormula] = useState('SF4');
  const [mostrarPares, setMostrarPares] = useState(true);
  let r: ResultadoVSEPR | null = null;
  let error: string | null = null;
  try {
    r = analizarVSEPR(formula);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Fórmula</span>
          <input value={formula} onChange={(e) => setFormula(e.target.value)} className="w-40 rounded-md border border-borde bg-superficie px-2 py-1.5 font-mono" />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Ejemplos">
          {EJEMPLOS.map((f) => (
            <button key={f} type="button" onClick={() => setFormula(f)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
              <Ce>{aMhchem(f)}</Ce>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {r && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <Escena3D descripcion={`Geometría ${r.geometriaMolecular} de ${formula} (${r.notacion})`} camara={[3.2, 2.4, 4.2]} className="h-[380px]">
              <ModeloVSEPR r={r} mostrarPares={mostrarPares} />
            </Escena3D>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={mostrarPares} onChange={(e) => setMostrarPares(e.target.checked)} />
              Mostrar pares libres (lóbulos violetas)
            </label>
          </div>
          <div className="text-sm">
            <p className="text-lg font-semibold">
              <Ce>{aMhchem(formula)}</Ce> · {r.notacion}
            </p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-texto-suave">Dominios electrónicos</dt>
              <dd>
                {r.dominios} ({r.ligandos.length} enlazantes, {r.paresLibres} libres)
              </dd>
              <dt className="text-texto-suave">Geometría electrónica</dt>
              <dd>{r.geometriaElectronica}</dd>
              <dt className="text-texto-suave">Geometría molecular</dt>
              <dd className="font-semibold">{r.geometriaMolecular}</dd>
              <dt className="text-texto-suave">Ángulos ideales</dt>
              <dd>{r.angulos.length ? r.angulos.map((a) => `${a}°`).join(', ') : '—'}</dd>
              <dt className="text-texto-suave">Hibridación</dt>
              <dd>{r.hibridacion}</dd>
              <dt className="text-texto-suave">Polaridad</dt>
              <dd className="font-semibold">{r.polar ? 'polar' : 'apolar'}</dd>
            </dl>
            {r.notaAngulos && <p className="mt-2 text-texto-suave">{r.notaAngulos}</p>}
            <p className="mt-2 text-texto-suave">{r.razonPolaridad}</p>
            <PasoAPaso pasos={r.pasos.map((p) => ({ titulo: p }))} />
          </div>
        </div>
      )}
    </div>
  );
}
