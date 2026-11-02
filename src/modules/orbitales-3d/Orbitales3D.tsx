import { lazy, Suspense, useMemo, useState } from 'react';
import {
  crearPsi,
  crearPsiHibrido,
  direccionHibrido,
  HIBRIDOS,
  nodosAngulares,
  nodosRadiales,
  nombreOrbital,
  orbitalesDeSubnivel,
  radioContencion,
  type TipoHibrido,
} from '@/chem/orbitals';
import { LETRAS_L } from '@/chem/configuracion';
import Escena3D from '@/components/escena3d/Escena3D';
import { Formula } from '@/components/Formula';
import { Pestanas } from '@/components/Pestanas';
import { Slider } from '@/components/Slider';
import { Teoria } from '@/components/Teoria';
import { Cargando } from '@/components/Cargando';
import { useOrbitalWorker } from './useOrbitalWorker';
import { COLOR_FASE_NEGATIVA, COLOR_FASE_POSITIVA, COLORES_HIBRIDOS, Lobulos3D } from './Lobulos3D';
import { CorteDensidad } from './CorteDensidad';

const DistribucionRadial = lazy(() => import('./DistribucionRadial'));

type Vista = 'atomicos' | 'hibridos';
const VISTAS = [
  { id: 'atomicos', titulo: 'Orbitales atómicos' },
  { id: 'hibridos', titulo: 'Orbitales híbridos' },
] as const;

const RESOLUCIONES = [
  { valor: 40, nombre: 'Rápida' },
  { valor: 56, nombre: 'Media' },
  { valor: 76, nombre: 'Alta' },
];

export default function Orbitales3D() {
  const [vista, setVista] = useState<Vista>('atomicos');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: orbitales atómicos">
          <TeoriaOrbitales />
        </Teoria>
      </div>
      <Pestanas pestanas={VISTAS} activa={vista} alCambiar={setVista} etiqueta="Tipo de orbital">
        {vista === 'atomicos' ? <VisorAtomico /> : <VisorHibridos />}
      </Pestanas>
    </div>
  );
}

function Leyenda({ hibrido }: { hibrido?: number }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {hibrido ? (
        <>
          {Array.from({ length: hibrido }, (_, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: COLORES_HIBRIDOS[i] }} aria-hidden /> híbrido {i + 1}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-gray-400" aria-hidden /> lóbulo menor (fase opuesta)
          </li>
        </>
      ) : (
        <>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: COLOR_FASE_POSITIVA }} aria-hidden /> ψ &gt; 0
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: COLOR_FASE_NEGATIVA }} aria-hidden /> ψ &lt; 0
          </li>
        </>
      )}
    </ul>
  );
}

function VisorAtomico() {
  const [n, setN] = useState(3);
  const [l, setL] = useState(2);
  const [m, setM] = useState(0);
  const [probabilidad, setProbabilidad] = useState(90);
  const [resolucion, setResolucion] = useState(56);
  const [opacidad, setOpacidad] = useState(0.85);
  const { respuesta, calculando, error } = useOrbitalWorker({ tipo: 'orbital', n, l, m, probabilidad: probabilidad / 100, resolucion });
  const psi = useMemo(() => crearPsi(n, l, m), [n, l, m]);
  const L = useMemo(() => radioContencion(n, l, 0.995), [n, l]);
  const sel = 'rounded-md border border-borde bg-superficie px-2 py-1.5';

  const cambiarN = (x: number) => {
    setN(x);
    if (l >= x) {
      setL(x - 1);
      setM(0);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end gap-3 text-sm">
          <label>
            <span className="mb-1 block font-medium">n</span>
            <select className={sel} value={n} onChange={(e) => cambiarN(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block font-medium">l</span>
            <select
              className={sel}
              value={l}
              onChange={(e) => {
                setL(Number(e.target.value));
                setM(0);
              }}
            >
              {Array.from({ length: Math.min(n, 4) }, (_, x) => (
                <option key={x} value={x}>
                  {x} ({LETRAS_L[x]})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block font-medium">Orbital</span>
            <select className={sel} value={m} onChange={(e) => setM(Number(e.target.value))}>
              {orbitalesDeSubnivel(l).map((x) => (
                <option key={x} value={x}>
                  {nombreOrbital(n, l, x).replace(/[_{}]/g, '').replace(/\^2/g, '²').replace(/\^3/g, '³')}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block font-medium">Calidad</span>
            <select className={sel} value={resolucion} onChange={(e) => setResolucion(Number(e.target.value))}>
              {RESOLUCIONES.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Escena3D
          descripcion={`Isosuperficie del orbital ${nombreOrbital(n, l, m)} que encierra el ${probabilidad} % de la probabilidad`}
          camara={[5, 4, 7]}
          className="h-[420px]"
          superposicion={
            <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white" aria-live="polite">
              {error ?? (calculando ? 'Calculando…' : respuesta && `${respuesta.lobulos.reduce((s, x) => s + x.posiciones.length / 9, 0).toLocaleString('es-PE')} triángulos · ${respuesta.ms.toFixed(0)} ms`)}
            </div>
          }
        >
          {respuesta && <Lobulos3D lobulos={respuesta.lobulos} L={respuesta.L} opacidad={opacidad} />}
        </Escena3D>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Slider etiqueta="Probabilidad encerrada" valor={probabilidad} min={50} max={95} paso={5} unidad="%" alCambiar={setProbabilidad} />
          <Slider etiqueta="Opacidad" valor={opacidad} min={0.3} max={1} paso={0.05} alCambiar={setOpacidad} formato={(v) => `${Math.round(v * 100)} %`} />
        </div>
        <div className="mt-2">
          <Leyenda />
        </div>
      </div>

      <aside className="space-y-4 text-sm">
        <div>
          <h3 className="text-lg font-semibold">
            <Formula tex={nombreOrbital(n, l, m)} />
          </h3>
          <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
            <dt className="text-texto-suave">Nodos radiales (n − l − 1)</dt>
            <dd className="font-semibold">{nodosRadiales(n, l)}</dd>
            <dt className="text-texto-suave">Nodos angulares (l)</dt>
            <dd className="font-semibold">{nodosAngulares(l)}</dd>
            <dt className="text-texto-suave">Nodos totales (n − 1)</dt>
            <dd className="font-semibold">{n - 1}</dd>
          </dl>
          <p className="mt-2 text-xs text-texto-suave">
            La superficie encierra el {probabilidad} % de la probabilidad de encontrar al electrón. Los colores indican el signo
            (fase) de ψ, no una carga.
          </p>
        </div>
        <div>
          <h4 className="mb-1 font-semibold">Corte de densidad</h4>
          <CorteDensidad psi={psi} L={L} descripcion={`orbital ${nombreOrbital(n, l, m)}`} />
        </div>
        <div>
          <h4 className="mb-1 font-semibold">Distribución radial</h4>
          <Suspense fallback={<Cargando texto="Cargando gráfica…" />}>
            <DistribucionRadial n={n} l={l} rMax={L} />
          </Suspense>
        </div>
      </aside>
    </div>
  );
}

function VisorHibridos() {
  const [hibrido, setHibrido] = useState<TipoHibrido>('sp3');
  // Con poca probabilidad encerrada los lóbulos se ven separados y con su forma direccional
  const [probabilidad, setProbabilidad] = useState(65);
  const [opacidad, setOpacidad] = useState(0.8);
  const { respuesta, calculando } = useOrbitalWorker({ tipo: 'hibrido', hibrido, probabilidad: probabilidad / 100, resolucion: 48 });
  const info = HIBRIDOS[hibrido];
  const psiPrimero = useMemo(() => crearPsiHibrido(info.coeficientes[0]!), [info]);
  const nombres: Record<TipoHibrido, string> = { sp: 'sp', sp2: 'sp²', sp3: 'sp³' };
  const ejemplos: Record<TipoHibrido, string> = {
    sp: 'BeCl₂, CO₂ (carbono), C₂H₂ (cada carbono)',
    sp2: 'BF₃, C₂H₄ (cada carbono), benceno',
    sp3: 'CH₄, NH₃, H₂O (N y O con pares libres)',
  };
  const fmt = (x: number) => (Math.abs(x) < 1e-9 ? '0' : x.toFixed(3));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="mb-3 flex gap-2" role="group" aria-label="Tipo de hibridación">
          {(['sp', 'sp2', 'sp3'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHibrido(h)}
              aria-pressed={hibrido === h}
              className={`rounded-md border px-3 py-1.5 text-sm ${hibrido === h ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde hover:bg-superficie-2'}`}
            >
              {nombres[h]}
            </button>
          ))}
        </div>
        <Escena3D
          descripcion={`Orbitales híbridos ${nombres[hibrido]} con geometría ${info.geometria}`}
          camara={[5, 4, 7]}
          className="h-[420px]"
          superposicion={
            calculando && <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">Calculando…</div>
          }
        >
          {respuesta && <Lobulos3D lobulos={respuesta.lobulos} L={respuesta.L} opacidad={opacidad} modoHibrido />}
        </Escena3D>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Slider etiqueta="Probabilidad encerrada" valor={probabilidad} min={40} max={95} paso={5} unidad="%" alCambiar={setProbabilidad} />
          <Slider etiqueta="Opacidad" valor={opacidad} min={0.3} max={1} paso={0.05} alCambiar={setOpacidad} formato={(v) => `${Math.round(v * 100)} %`} />
        </div>
        <div className="mt-2">
          <Leyenda hibrido={info.coeficientes.length} />
        </div>
      </div>
      <aside className="space-y-3 text-sm">
        <h3 className="text-lg font-semibold">Hibridación {nombres[hibrido]}</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-texto-suave">Orbitales híbridos</dt>
          <dd>{info.coeficientes.length}</dd>
          <dt className="text-texto-suave">Geometría</dt>
          <dd>{info.geometria}</dd>
          <dt className="text-texto-suave">Ángulo</dt>
          <dd>{info.angulo.toFixed(2)}°</dd>
          <dt className="text-texto-suave">Ejemplos</dt>
          <dd>{ejemplos[hibrido]}</dd>
        </dl>
        <div>
          <h4 className="font-semibold">Combinaciones lineales</h4>
          <ul className="mt-1 space-y-1">
            {info.coeficientes.map((c, i) => {
              const d = direccionHibrido(c);
              return (
                <li key={i} className="overflow-x-auto">
                  <Formula
                    tex={`h_${i + 1} = ${fmt(c[0]!)}\\,s ${['p_x', 'p_y', 'p_z']
                      .map((p, k) => (Math.abs(c[k + 1]!) < 1e-9 ? '' : `${c[k + 1]! >= 0 ? '+' : '-'} ${fmt(Math.abs(c[k + 1]!))}\\,${p}`))
                      .join(' ')}`}
                  />
                  <span className="ml-2 text-xs text-texto-suave">
                    dirección ({d.map((x) => fmt(x)).join(', ')})
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-texto-suave">
            Base: orbitales 2s y 2p del hidrógeno (ilustrativo). Cada híbrido es una combinación normalizada; el conjunto es
            ortonormal.
          </p>
        </div>
        <div>
          <h4 className="mb-1 font-semibold">Corte del híbrido 1</h4>
          <CorteDensidad psi={psiPrimero} L={12} descripcion={`primer orbital híbrido ${nombres[hibrido]}`} />
        </div>
      </aside>
    </div>
  );
}

function TeoriaOrbitales() {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold">Función de onda</h3>
        <p>
          Para el átomo de hidrógeno (y iones de un electrón), la ecuación de Schrödinger tiene solución exacta. Cada orbital
          es una función de onda:
        </p>
        <Formula tex="\psi_{n l m}(r,\theta,\phi) = R_{nl}(r)\,Y_{lm}(\theta,\phi)" bloque />
        <p>
          |ψ|² es la <strong>densidad de probabilidad</strong>: la probabilidad de hallar el electrón en un volumen dV es
          |ψ|²dV. La función está normalizada:
        </p>
        <Formula tex="\int |\psi|^2\,dV = 1" bloque />
      </section>
      <section>
        <h3 className="font-semibold">Parte radial</h3>
        <Formula tex="R_{nl}(r) = \sqrt{\left(\tfrac{2Z}{n a_0}\right)^3\tfrac{(n-l-1)!}{2n\,(n+l)!}}\;e^{-\rho/2}\,\rho^{l}\,L^{2l+1}_{n-l-1}(\rho),\quad \rho = \tfrac{2Zr}{n a_0}" bloque />
        <p>Ejemplos: </p>
        <Formula tex="R_{10} = 2\left(\tfrac{Z}{a_0}\right)^{3/2}e^{-Zr/a_0}\qquad R_{20} = \tfrac{1}{2\sqrt2}\left(\tfrac{Z}{a_0}\right)^{3/2}\left(2-\tfrac{Zr}{a_0}\right)e^{-Zr/2a_0}" bloque />
        <p>
          La <strong>distribución radial</strong> P(r) = r²R² da la probabilidad por unidad de radio; para el 1s tiene su
          máximo en r = a₀ (el radio de Bohr).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Nodos</h3>
        <Formula tex="\text{radiales} = n - l - 1\qquad \text{angulares} = l\qquad \text{totales} = n - 1" bloque />
        <p>
          Un nodo es una superficie donde ψ = 0 (probabilidad nula). Los radiales son esferas; los angulares, planos o conos
          (p. ej. el plano xy en el p<sub>z</sub>; los dos conos del d<sub>z²</sub>).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Fases</h3>
        <p>
          ψ puede ser positiva o negativa. El signo no es una carga eléctrica, pero importa cuando los orbitales se combinan
          (enlaces e hibridación): fases iguales se suman y fases opuestas se cancelan.
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Orbitales híbridos</h3>
        <p>Combinaciones de orbitales s y p del mismo átomo que apuntan hacia los enlaces:</p>
        <Formula tex="sp:\ \tfrac{1}{\sqrt2}(s \pm p_z)\qquad sp^3:\ \tfrac12(s + p_x + p_y + p_z),\ \dots" bloque />
        <p>sp → lineal (180°), sp² → trigonal plana (120°), sp³ → tetraédrica (109,5°).</p>
      </section>
      <p className="text-xs text-texto-suave">
        Se usan los orbitales reales (combinaciones de m y −m) habituales en química. En los exámenes, los valores de mₗ se
        asignan a las casillas del diagrama de orbitales, no a orbitales con forma concreta (px, py…).
      </p>
    </div>
  );
}
