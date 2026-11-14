import { lazy, Suspense, useState } from 'react';
import { Cargando } from '@/components/Cargando';
import { Formula } from '@/components/Formula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { useRDKit } from '@/components/molecula/VistaOrganica';

const ConfiguracionRS = lazy(() => import('./ConfiguracionRS'));
const IsomeriaEZ = lazy(() => import('./IsomeriaEZ'));
const Estereoisomeros = lazy(() => import('./Estereoisomeros'));
const Proyecciones = lazy(() => import('./Proyecciones'));
const ActividadOptica = lazy(() => import('./ActividadOptica'));

type Seccion = 'rs' | 'ez' | 'isomeros' | 'proyecciones' | 'optica';
const SECCIONES = [
  { id: 'rs', titulo: 'Quiralidad y R/S' },
  { id: 'ez', titulo: 'Isomería E/Z' },
  { id: 'isomeros', titulo: 'Estereoisómeros' },
  { id: 'proyecciones', titulo: 'Fischer y Newman' },
  { id: 'optica', titulo: 'Actividad óptica' },
] as const;

export default function Estereoquimica() {
  const [seccion, setSeccion] = useState<Seccion>('rs');
  const { R, error } = useRDKit();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Teoria titulo="Teoría: estereoquímica">
          <div className="space-y-3 text-sm">
            <p>
              Los <strong>estereoisómeros</strong> tienen los mismos átomos unidos en el mismo orden, pero distinta disposición en el espacio. No se convierten uno en otro girando enlaces sencillos (eso son
              conformaciones).
            </p>
            <h3 className="font-semibold">Quiralidad</h3>
            <p>
              Una molécula es <strong>quiral</strong> si no se superpone con su imagen especular, como las manos. La causa más común es un <strong>centro estereogénico</strong>: un carbono con cuatro
              sustituyentes distintos. Una molécula con un plano de simetría es aquiral.
            </p>
            <h3 className="font-semibold">Reglas de Cahn-Ingold-Prelog</h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Tiene prioridad el átomo de mayor número atómico unido directamente al centro.</li>
              <li>Si hay empate, se comparan los átomos unidos a ellos, alejándose del centro hasta la primera diferencia.</li>
              <li>Un enlace doble o triple cuenta como si el átomo estuviera unido dos o tres veces (átomos duplicados): C=O equivale a (O, O).</li>
            </ol>
            <h3 className="font-semibold">Configuración R/S</h3>
            <p>
              Con el sustituyente de menor prioridad hacia atrás, se recorre 1 → 2 → 3: giro horario, <strong>R</strong>; antihorario, <strong>S</strong>.
            </p>
            <h3 className="font-semibold">Configuración E/Z</h3>
            <p>
              En cada carbono del C=C se elige el sustituyente prioritario. Al mismo lado: <strong>Z</strong>; en lados opuestos: <strong>E</strong>.
            </p>
            <h3 className="font-semibold">Relaciones</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Enantiómeros</strong>: imágenes especulares no superponibles (todos los centros invertidos).
              </li>
              <li>
                <strong>Diastereómeros</strong>: estereoisómeros que no son imágenes especulares.
              </li>
              <li>
                <strong>Meso</strong>: con centros estereogénicos, pero aquiral por tener un plano de simetría.
              </li>
            </ul>
            <p>Con n centros estereogénicos hay como máximo:</p>
            <Formula tex="2^{n}\ \text{estereoisómeros}" bloque />
            <h3 className="font-semibold">Actividad óptica</h3>
            <p>Una sustancia quiral gira el plano de la luz polarizada. Ley de Biot (l en dm, c en g/mL):</p>
            <Formula tex="\alpha = [\alpha]\cdot l\cdot c" bloque />
            <p>Exceso enantiomérico de una mezcla:</p>
            <Formula tex="ee = \dfrac{[\alpha]_\text{muestra}}{[\alpha]_\text{puro}}\times 100\,\%" bloque />
            <h3 className="font-semibold">Proyecciones</h3>
            <p>
              <strong>Fischer</strong>: cadena vertical; horizontales hacia el observador, verticales hacia atrás. <strong>Newman</strong>: se mira a lo largo de un enlace C–C; delante un punto, detrás un
              círculo.
            </p>
            <p className="text-texto-suave">
              Alcance: se aplica la regla 1 de Cahn-Ingold-Prelog (número atómico). Los casos que necesitan las reglas de isótopos o de estereodescriptores no se resuelven.
            </p>
          </div>
        </Teoria>
        <p className="text-sm text-texto-suave">Configuraciones calculadas con las reglas de Cahn-Ingold-Prelog; estructuras dibujadas con RDKit.</p>
      </div>

      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Secciones de estereoquímica">
        {seccion === 'optica' ? (
          <Suspense fallback={<Cargando />}>
            <ActividadOptica />
          </Suspense>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : !R ? (
          <Cargando texto="Cargando RDKit…" />
        ) : (
          <Suspense fallback={<Cargando />}>
            {seccion === 'rs' && <ConfiguracionRS R={R} />}
            {seccion === 'ez' && <IsomeriaEZ R={R} />}
            {seccion === 'isomeros' && <Estereoisomeros R={R} />}
            {seccion === 'proyecciones' && <Proyecciones R={R} />}
          </Suspense>
        )}
      </Pestanas>
    </div>
  );
}
