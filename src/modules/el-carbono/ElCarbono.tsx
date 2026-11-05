import { lazy, Suspense, useMemo, useState } from 'react';
import { analizarCarbonos, contarEnlaces, formulaMolecularGrafo, formulaSemidesarrollada, type TipoCarbono } from '@/chem/nomenclatura/organica';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Formula } from '@/components/Formula';
import { Cargando } from '@/components/Cargando';
import { grafoDesdeSmiles, svgEstructura, useRDKit } from '@/components/molecula/VistaOrganica';

const Hibridacion = lazy(() => import('./Hibridacion'));

type Seccion = 'hibridacion' | 'tipos' | 'formulas';
const SECCIONES = [
  { id: 'hibridacion', titulo: 'Hibridación sp³, sp², sp' },
  { id: 'tipos', titulo: 'Tipos de carbono' },
  { id: 'formulas', titulo: 'Tipos de fórmulas' },
] as const;

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
/** Colores de resaltado (RGB 0–1) y equivalentes CSS para la leyenda. */
const COLOR: Record<TipoCarbono, { rgb: [number, number, number]; css: string }> = {
  primario: { rgb: [0.55, 0.8, 1], css: '#8cccff' },
  secundario: { rgb: [0.6, 0.9, 0.6], css: '#99e699' },
  terciario: { rgb: [1, 0.8, 0.45], css: '#ffcc73' },
  cuaternario: { rgb: [1, 0.6, 0.7], css: '#ff99b3' },
  'sin carbonos vecinos': { rgb: [0.85, 0.85, 0.85], css: '#d9d9d9' },
};
const sub = (f: string) => f.replace(/\d+/g, (d) => d.replace(/\d/g, (x) => '₀₁₂₃₄₅₆₇₈₉'[Number(x)]!));

function TiposCarbono() {
  const { R, error } = useRDKit();
  const [smiles, setSmiles] = useState('CC(C)(C)CC(C)C');
  const r = useMemo(() => {
    if (!R) return null;
    try {
      const g = grafoDesdeSmiles(R, smiles);
      const c = analizarCarbonos(g);
      const colores = Object.fromEntries(c.map((x) => [x.indice, COLOR[x.tipo].rgb])) as Record<number, [number, number, number]>;
      return { c, enlaces: contarEnlaces(g), svg: svgEstructura(R, smiles, { ancho: 360, alto: 240, colores }) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [R, smiles]);
  const tipos: TipoCarbono[] = ['primario', 'secundario', 'terciario', 'cuaternario'];
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-medium">Estructura (SMILES)</span>
          <input value={smiles} onChange={(e) => setSmiles(e.target.value)} className={`${input} w-full font-mono`} spellCheck={false} />
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            ['2,2,4-trimetilpentano', 'CC(C)(C)CC(C)C'],
            ['3-etil-2-metilhexano', 'CCCC(CC)C(C)C'],
            ['metilciclohexano', 'CC1CCCCC1'],
            ['but-1-en-3-ino', 'C=CC#C'],
          ].map(([n, s]) => (
            <button key={s} type="button" onClick={() => setSmiles(s!)} className="rounded-md border border-borde px-2 py-1 text-xs hover:bg-superficie-2">
              {n}
            </button>
          ))}
        </div>
        {error && <p className="text-error">{error}</p>}
        {r && 'error' in r && <p className="text-aviso">{r.error}</p>}
        <p>
          Un carbono es <strong>primario</strong> si está unido a 1 carbono, <strong>secundario</strong> a 2, <strong>terciario</strong> a 3 y{' '}
          <strong>cuaternario</strong> a 4.
        </p>
      </div>
      {r && 'c' in r && r.c && (
        <div className="space-y-3">
          {r.svg && (
            <figure className="inline-block rounded-md bg-white p-1" role="img" aria-label="Estructura con los carbonos coloreados según su tipo">
              <div dangerouslySetInnerHTML={{ __html: r.svg }} style={{ width: 360, maxWidth: '100%' }} className="[&_svg]:h-auto [&_svg]:max-w-full" />
            </figure>
          )}
          <ul className="grid grid-cols-2 gap-2">
            {tipos.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-4 w-4 rounded" style={{ background: COLOR[t].css }} aria-hidden />
                {t}: <strong className="tabular-nums">{r.c.filter((x) => x.tipo === t).length}</strong>
              </li>
            ))}
          </ul>
          <table className="text-sm tabular-nums">
            <thead>
              <tr className="text-left text-texto-suave">
                <th className="pr-4 font-medium">Hibridación</th>
                <th className="pr-4 font-medium">Carbonos</th>
              </tr>
            </thead>
            <tbody>
              {(['sp³', 'sp²', 'sp'] as const).map((h) => (
                <tr key={h}>
                  <td className="pr-4">{h}</td>
                  <td>{r.c.filter((x) => x.hibridacion === h).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Enlaces σ: <strong>{r.enlaces.sigma}</strong> · enlaces π: <strong>{r.enlaces.pi}</strong> (un enlace simple es σ; uno doble, σ + π; uno triple, σ + 2π).
          </p>
        </div>
      )}
    </div>
  );
}

function Formulas() {
  const { R } = useRDKit();
  const [smiles, setSmiles] = useState('CC(O)CC');
  const r = useMemo(() => {
    if (!R) return null;
    try {
      const g = grafoDesdeSmiles(R, smiles);
      let semi: string | null = null;
      try {
        semi = formulaSemidesarrollada(g);
      } catch {
        semi = null;
      }
      return { formula: formulaMolecularGrafo(g), semi, desarrollada: svgEstructura(R, smiles, { ancho: 300, alto: 220, conH: true }), esqueletal: svgEstructura(R, smiles, { ancho: 300, alto: 220 }) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [R, smiles]);
  const fig = (svg: string | null | undefined, titulo: string, nota: string) =>
    svg && (
      <figure className="rounded-lg border border-borde bg-superficie p-3">
        <figcaption className="mb-1 font-medium">{titulo}</figcaption>
        <div className="inline-block rounded-md bg-white p-1" dangerouslySetInnerHTML={{ __html: svg }} style={{ width: 300, maxWidth: '100%' }} />
        <p className="mt-1 text-xs text-texto-suave">{nota}</p>
      </figure>
    );
  return (
    <div className="space-y-4 text-sm">
      <label className="block max-w-md">
        <span className="mb-1 block font-medium">Estructura (SMILES)</span>
        <input value={smiles} onChange={(e) => setSmiles(e.target.value)} className={`${input} w-full font-mono`} spellCheck={false} />
      </label>
      {r && 'error' in r && <p className="text-aviso">{r.error}</p>}
      {r && 'formula' in r && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-borde bg-superficie p-3">
            <p className="mb-1 font-medium">Molecular</p>
            <p className="text-2xl">{sub(r.formula!)}</p>
            <p className="mt-1 text-xs text-texto-suave">Solo indica cuántos átomos de cada elemento hay.</p>
          </div>
          <div className="rounded-lg border border-borde bg-superficie p-3">
            <p className="mb-1 font-medium">Semidesarrollada</p>
            <p className="text-lg">{r.semi ?? '—'}</p>
            <p className="mt-1 text-xs text-texto-suave">Muestra los enlaces entre carbonos y agrupa los H de cada carbono.</p>
          </div>
          {fig(r.desarrollada, 'Desarrollada', 'Todos los átomos y todos los enlaces.')}
          {fig(r.esqueletal, 'Esqueletal (de líneas)', 'Cada vértice o extremo es un C; los H de los carbonos no se dibujan.')}
        </div>
      )}
    </div>
  );
}

export default function ElCarbono() {
  const [s, setS] = useState<Seccion>('hibridacion');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: el átomo de carbono">
          <div className="space-y-4">
            <p>El carbono (Z = 6, 1s² 2s² 2p²) forma cuatro enlaces covalentes (tetravalencia) y puede unirse a otros carbonos formando cadenas y anillos (autosaturación).</p>
            <p>Para explicar sus geometrías se combinan (hibridan) sus orbitales 2s y 2p:</p>
            <Formula tex="\begin{array}{lccc} & sp^3 & sp^2 & sp\\ \text{Orbitales} & s + 3p & s + 2p & s + p\\ \text{Geometría} & \text{tetraédrica} & \text{trigonal plana} & \text{lineal}\\ \text{Ángulo} & 109{,}5^\circ & 120^\circ & 180^\circ\\ \text{Enlaces} & 4\sigma & 3\sigma + 1\pi & 2\sigma + 2\pi\\ \text{Ejemplo} & \ce{CH4} & \ce{C2H4} & \ce{C2H2}\end{array}" bloque />
            <p>Un enlace simple es σ; uno doble, σ + π; uno triple, σ + 2π. Los enlaces π se forman por solapamiento lateral de orbitales p no hibridados.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={s} alCambiar={setS} etiqueta="El carbono">
        {s === 'hibridacion' && (
          <Suspense fallback={<Cargando />}>
            <Hibridacion />
          </Suspense>
        )}
        {s === 'tipos' && <TiposCarbono />}
        {s === 'formulas' && <Formulas />}
      </Pestanas>
    </div>
  );
}
