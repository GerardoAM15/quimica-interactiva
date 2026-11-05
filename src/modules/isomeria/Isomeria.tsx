import { lazy, Suspense, useMemo, useState } from 'react';
import { claseFuncional, parsearNombre, smilesDeGrafo, tieneIsomeriaGeometrica, tipoIsomeria, type TipoIsomeria } from '@/chem/nomenclatura/organica';
import { ISOMEROS } from '@/data/isomeros';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Cargando } from '@/components/Cargando';
import { VistaOrganica } from '@/components/molecula/VistaOrganica';

const CisTrans3D = lazy(() => import('./CisTrans3D'));

type Seccion = 'estructurales' | 'comparar' | 'geometrica';
const SECCIONES = [
  { id: 'estructurales', titulo: 'Isómeros de una fórmula' },
  { id: 'comparar', titulo: 'Comparar dos compuestos' },
  { id: 'geometrica', titulo: 'Isomería cis/trans' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const sub = (f: string) => f.replace(/\d+/g, (d) => d.replace(/\d/g, (x) => '₀₁₂₃₄₅₆₇₈₉'[Number(x)]!));
const CLASE: Record<string, string> = {
  alcano: 'alcano',
  alqueno: 'alqueno',
  alquino: 'alquino',
  cicloalcano: 'cicloalcano',
  cicloalqueno: 'cicloalqueno',
  aromatico: 'aromático',
  eter: 'éter',
  alcohol: 'alcohol',
  aldehido: 'aldehído',
  cetona: 'cetona',
  acido: 'ácido carboxílico',
  ester: 'éster',
  amina: 'amina',
  amida: 'amida',
  nitrilo: 'nitrilo',
};
const TEXTO_TIPO: Record<TipoIsomeria, string> = {
  cadena: 'Isómeros de cadena: misma función, distinto esqueleto carbonado.',
  posicion: 'Isómeros de posición: mismo esqueleto y misma función, en distinta posición.',
  funcion: 'Isómeros de función: misma fórmula molecular, distinto grupo funcional.',
  iguales: 'Son el mismo compuesto (la misma estructura escrita de dos formas).',
  'no son isomeros': 'No son isómeros: tienen distinta fórmula molecular.',
};

function Estructurales() {
  const [k, setK] = useState(0);
  const g = ISOMEROS[k]!;
  const items = useMemo(() => g.nombres.map((n) => ({ n, gr: parsearNombre(n) })), [g]);
  const [ref, setRef] = useState(0);
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="mb-1 block font-medium">Fórmula molecular</span>
          <select value={k} onChange={(e) => (setK(Number(e.target.value)), setRef(0))} className={input}>
            {ISOMEROS.map((x, i) => (
              <option key={x.formula} value={i}>
                {sub(x.formula)} ({x.nombres.length} {x.completo ? 'isómeros' : 'isómeros, selección'})
              </option>
            ))}
          </select>
        </label>
        <p className="text-texto-suave">Haz clic en un compuesto para compararlo con los demás.</p>
      </div>
      {g.nota && <p className="text-texto-suave">{g.nota}</p>}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((x, i) => {
          const tipo = i === ref ? null : tipoIsomeria(items[ref]!.gr, x.gr);
          return (
            <li key={x.n}>
              <button
                type="button"
                onClick={() => setRef(i)}
                aria-pressed={i === ref}
                className={`w-full rounded-lg border bg-superficie p-3 text-left ${i === ref ? 'border-acento' : 'border-borde hover:bg-superficie-2'}`}
              >
                <p className="font-semibold">{x.n}</p>
                <p className="text-xs text-texto-suave">{CLASE[claseFuncional(x.gr)] ?? claseFuncional(x.gr)}</p>
                <p className="mt-1 text-xs">{i === ref ? 'Referencia' : `Respecto de ${items[ref]!.n}: isómero de ${tipo === 'posicion' ? 'posición' : tipo === 'funcion' ? 'función' : tipo}`}</p>
              </button>
              <div className="mt-1">
                <VistaOrganica smiles={smilesDeGrafo(x.gr)} titulo={x.n} ancho={220} alto={150} con3D={false} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Comparar() {
  const [a, setA] = useState('butan-1-ol');
  const [b, setB] = useState('etoxietano');
  let res: { tipo: TipoIsomeria; sa: string; sb: string } | null = null;
  let error: string | null = null;
  try {
    const ga = parsearNombre(a), gb = parsearNombre(b);
    res = { tipo: tipoIsomeria(ga, gb), sa: smilesDeGrafo(ga), sb: smilesDeGrafo(gb) };
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-3">
        <label>
          <span className="mb-1 block font-medium">Compuesto A</span>
          <input value={a} onChange={(e) => setA(e.target.value)} className={`${input} w-64`} spellCheck={false} />
        </label>
        <label>
          <span className="mb-1 block font-medium">Compuesto B</span>
          <input value={b} onChange={(e) => setB(e.target.value)} className={`${input} w-64`} spellCheck={false} />
        </label>
      </div>
      {error && <p className="text-aviso">{error}</p>}
      {res && (
        <>
          <p className="rounded-lg border border-borde bg-superficie p-3 text-base font-medium" aria-live="polite">
            {TEXTO_TIPO[res.tipo]}
          </p>
          <div className="flex flex-wrap gap-4">
            <VistaOrganica smiles={res.sa} titulo={a} ancho={260} alto={180} con3D={false} />
            <VistaOrganica smiles={res.sb} titulo={b} ancho={260} alto={180} con3D={false} />
          </div>
        </>
      )}
    </div>
  );
}

function Geometrica() {
  const [nombre, setNombre] = useState('pent-2-eno');
  let tiene: boolean | null = null;
  let smiles = '';
  try {
    const g = parsearNombre(nombre);
    tiene = tieneIsomeriaGeometrica(g);
    smiles = smilesDeGrafo(g);
  } catch {
    tiene = null;
  }
  return (
    <div className="space-y-5 text-sm">
      <Suspense fallback={<Cargando />}>
        <CisTrans3D />
      </Suspense>
      <section className="rounded-lg border border-borde bg-superficie p-4">
        <h3 className="font-semibold">¿Tiene isomería cis/trans?</h3>
        <p className="mt-1 text-texto-suave">Condición: cada carbono del doble enlace debe tener dos sustituyentes distintos (el giro alrededor del C=C está impedido).</p>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${input} mt-2 w-64`} aria-label="Nombre del alqueno" spellCheck={false} />
        {tiene === null ? (
          <p className="mt-2 text-aviso">Nombre no reconocido.</p>
        ) : (
          <div className="mt-2 flex flex-wrap items-start gap-4">
            <p className={`font-semibold ${tiene ? 'text-exito' : 'text-texto-suave'}`}>{tiene ? 'Sí: existen los isómeros cis y trans.' : 'No: algún carbono del doble enlace tiene dos grupos iguales (o no hay C=C).'}</p>
            <VistaOrganica smiles={smiles} titulo={nombre} ancho={220} alto={150} con3D={false} />
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {['but-2-eno', 'but-1-eno', '2-metilbut-2-eno', 'pent-2-eno', 'hex-3-eno', '1,2-dicloroeteno'].map((n) => (
            <button key={n} type="button" onClick={() => setNombre(n)} className="rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2">
              {n}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Isomeria() {
  const [s, setS] = useState<Seccion>('estructurales');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: isomería">
          <div className="space-y-3">
            <p>Los isómeros tienen la misma fórmula molecular pero distinta estructura, por lo que sus propiedades son diferentes.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Estructural (constitucional):</strong> de cadena (butano / 2-metilpropano), de posición (propan-1-ol / propan-2-ol) y de función (etanol /
                metoximetano).
              </li>
              <li>
                <strong>Estereoisomería geométrica (cis/trans):</strong> en alquenos con dos grupos distintos en cada carbono del C=C y en cicloalcanos disustituidos.
                En el isómero cis los grupos iguales quedan del mismo lado; en el trans, en lados opuestos.
              </li>
            </ul>
            <p>Los isómeros cis/trans no se interconvierten a temperatura ambiente: el enlace π impide el giro.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={s} alCambiar={setS} etiqueta="Isomería">
        {s === 'estructurales' && <Estructurales />}
        {s === 'comparar' && <Comparar />}
        {s === 'geometrica' && <Geometrica />}
      </Pestanas>
    </div>
  );
}
