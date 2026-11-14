import { lazy, Suspense, useMemo, useState } from 'react';
import { smilesCanonico, type RDKit } from '@/lib/rdkit';
import { maximoEstereoisomeros, relacionEstereo, type RelacionEstereo } from '@/chem/estereo';
import { Cargando } from '@/components/Cargando';
import { FAMILIAS_ESTEREO } from '@/data/estereo';
import { analizar, Figura2D, SelectorEjemplo, type Analisis } from './comun';

const Espejo3D = lazy(() => import('./Modelo3D').then((m) => ({ default: m.Espejo3D })));

interface Isomero {
  smiles: string;
  analisis: Analisis;
}

/**
 * Todas las combinaciones de configuración de una plantilla: se invierte cada centro (@ ↔ @@) y se
 * descartan las estructuras repetidas (una forma meso aparece dos veces, como R,S y como S,R).
 */
function estereoisomeros(R: RDKit, plantilla: string): Isomero[] {
  const marcas = [...plantilla.matchAll(/@@|@/g)];
  const vistos = new Set<string>();
  const lista: Isomero[] = [];
  for (let mascara = 0; mascara < 2 ** marcas.length; mascara++) {
    let k = 0;
    const smiles = plantilla.replace(/@@|@/g, (m) => ((mascara >> k++) & 1 ? (m === '@@' ? '@' : '@@') : m));
    const canonico = smilesCanonico(R, smiles);
    if (!canonico || vistos.has(canonico)) continue;
    vistos.add(canonico);
    lista.push({ smiles, analisis: analizar(R, smiles) });
  }
  return lista;
}

const EXPLICACION: Record<RelacionEstereo, string> = {
  idénticos: 'Es el mismo compuesto.',
  enantiómeros: 'Enantiómeros: imágenes especulares no superponibles. Todos sus centros tienen configuración opuesta. Mismas propiedades físicas, salvo el sentido en que desvían la luz polarizada.',
  diastereómeros: 'Diastereómeros: estereoisómeros que no son imágenes especulares. Difieren en algunos centros, pero no en todos, y tienen propiedades físicas distintas.',
};

export default function Estereoisomeros({ R }: { R: RDKit }) {
  const [familia, setFamilia] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [superponer, setSuperponer] = useState(false);
  const plantilla = FAMILIAS_ESTEREO[familia]!;
  const lista = useMemo(() => estereoisomeros(R, plantilla.smiles), [R, plantilla.smiles]);
  const n = lista[0]?.analisis.centros.length ?? 0;
  const [ia, ib] = [Math.min(a, lista.length - 1), Math.min(b, lista.length - 1)];
  const [A, B] = [lista[ia]!, lista[ib]!];
  const relacion = relacionEstereo(
    A.analisis.centros.map((c) => c.descriptor ?? '?'),
    B.analisis.centros.map((c) => c.descriptor ?? '?'),
    A.analisis.canonico === B.analisis.canonico,
  );
  const hayMeso = lista.some((x) => x.analisis.tipo === 'meso');

  return (
    <div className="space-y-4">
      <SelectorEjemplo
        etiqueta="Compuesto"
        ejemplos={FAMILIAS_ESTEREO}
        indice={familia}
        alElegir={(i) => {
          setFamilia(i);
          setA(0);
          setB(1);
        }}
      />
      {plantilla.nota && <p className="text-sm text-texto-suave">{plantilla.nota}</p>}
      <p className="text-sm">
        {n} {n === 1 ? 'centro estereogénico' : 'centros estereogénicos'} → como máximo 2<sup>{n}</sup> = {maximoEstereoisomeros(n)} estereoisómeros. Existen{' '}
        <strong>{lista.length}</strong>
        {hayMeso && ': una de las combinaciones es una forma meso, que coincide con su propia imagen especular'}.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {lista.map((x, i) => (
          <section key={x.analisis.canonico} className={`rounded-lg border p-2 text-sm ${i === ia || i === ib ? 'border-acento' : 'border-borde'}`}>
            <Figura2D R={R} smiles={x.smiles} titulo={`estereoisómero ${x.analisis.descriptores}`} ancho={220} alto={150} notas={Object.fromEntries(x.analisis.centros.map((c) => [c.atomo, c.descriptor ?? '?']))} />
            <p className="mt-1 font-semibold">
              ({x.analisis.centros.map((c) => c.descriptor).join(',')}) {x.analisis.tipo === 'meso' && <span className="font-normal text-texto-suave">· meso</span>}
            </p>
            <div className="mt-1 flex gap-2">
              <button type="button" aria-pressed={i === ia} onClick={() => setA(i)} className={`rounded border px-2 py-0.5 text-xs ${i === ia ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
                Comparar: A
              </button>
              <button type="button" aria-pressed={i === ib} onClick={() => setB(i)} className={`rounded border px-2 py-0.5 text-xs ${i === ib ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
                Comparar: B
              </button>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-borde bg-superficie-2 p-3 text-sm" aria-live="polite">
        <h3 className="font-semibold">
          A ({A.analisis.centros.map((c) => c.descriptor).join(',')}) y B ({B.analisis.centros.map((c) => c.descriptor).join(',')}): {relacion}
        </h3>
        <p className="mt-1">{EXPLICACION[relacion]}</p>
      </section>

      <section className="space-y-2 text-sm">
        <h3 className="font-semibold">El estereoisómero A y su imagen especular</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de la vista 3D">
          {[
            { v: false, t: 'Frente al espejo' },
            { v: true, t: 'Superponer' },
          ].map((o) => (
            <button key={o.t} type="button" aria-pressed={superponer === o.v} onClick={() => setSuperponer(o.v)} className={`rounded-md border px-3 py-1 ${superponer === o.v ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde hover:bg-superficie-2'}`}>
              {o.t}
            </button>
          ))}
        </div>
        <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
          <Espejo3D molecula={A.analisis.molecula} superponer={superponer} titulo={`El estereoisómero (${A.analisis.descriptores})`} />
        </Suspense>
        <p>
          {A.analisis.tipo === 'quiral'
            ? 'Al superponer (la imagen especular va en alambre) se hacen coincidir el centro y sus dos sustituyentes de mayor prioridad: los otros dos quedan intercambiados. No hay giro que las haga coincidir: son enantiómeros.'
            : 'Esta molécula es aquiral: su imagen especular es el mismo compuesto. Para verlas coincidir hay que girar la molécula entera (y, en una forma meso, también alrededor del enlace central); la vista solo alinea un centro.'}
        </p>
      </section>
    </div>
  );
}
