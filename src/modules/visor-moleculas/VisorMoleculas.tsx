import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { angulo, diedro, distancia, formulaDeMolecula, pos, vecindario, type Molecula } from '@/chem/molecula';
import { analizarAtomo, momentoDipolarEstimado } from '@/chem/vsepr';
import { esPolar } from '@/chem/fuerzas';
import { masaMolar } from '@/chem/formula';
import { elementoPorSimbolo } from '@/chem/elements';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula, type EstiloMolecula } from '@/components/molecula/Molecula3D';
import { BuscadorMoleculas, NOMBRE_CATEGORIA } from '@/components/molecula/BuscadorMoleculas';
import { Estructura2D } from '@/components/molecula/Estructura2D';
import {
  buscarEnPubChem,
  CATALOGO,
  cargarDelCatalogo,
  catalogoPorCanonico,
  DESCRIPCION_ORIGEN,
  type EntradaCatalogo,
  type MoleculaCargada,
} from '@/components/molecula/cargarMolecula';
import { cargarRDKit, analizarEstructura, smilesCanonico } from '@/lib/rdkit';
import { generarCoordenadas3D } from '@/chem/coordenadas3d';
import { useEnLinea } from '@/lib/pwa';
import { Teoria } from '@/components/Teoria';
import { Ce, Formula } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import dipolos from '@/data/dipolos.json';
import { RED_POR_FORMULA } from '@/chem/cristales';
import { Cargando } from '@/components/Cargando';
import { aspectoCompuesto } from '@/components/molecula/MuestraCompuesto3D';

const RedIonica3D = lazy(() => import('@/components/escena3d/RedIonica3D'));
const MuestraCompuesto3D = lazy(() => import('@/components/molecula/MuestraCompuesto3D'));
type Vista = 'molecula' | 'red' | 'muestra';

type Modo = 'atomo' | 'distancia' | 'angulo' | 'diedro';
const NECESARIOS: Record<Modo, number> = { atomo: 1, distancia: 2, angulo: 3, diedro: 4 };

interface Mostrada {
  nombre: string;
  formula: string;
  iupac: string | null;
  smiles: string;
  cargada: MoleculaCargada;
  catalogo: EntradaCatalogo | null;
  fuente: string;
}

export default function VisorMoleculas() {
  const [params, setParams] = useSearchParams();
  const enLinea = useEnLinea();
  const [mostrada, setMostrada] = useState<Mostrada | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estilo, setEstilo] = useState<EstiloMolecula>('bolas');
  const [etiquetas, setEtiquetas] = useState(false);
  const [verDipolo, setVerDipolo] = useState(false);
  const [modo, setModo] = useState<Modo>('atomo');
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [consulta, setConsulta] = useState('');
  const [vista, setVista] = useState<Vista>('molecula');

  const abrirCatalogo = async (m: EntradaCatalogo) => {
    setError(null);
    setEstado('Cargando estructura…');
    try {
      const cargada = await cargarDelCatalogo(m.cid);
      setMostrada({ nombre: m.nombre, formula: m.formula, iupac: m.iupac, smiles: m.smiles, cargada, catalogo: m, fuente: 'Catálogo (PubChem)' });
      setVista('molecula');
      setSeleccion([]);
      setParams({ cid: String(m.cid) }, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEstado(null);
    }
  };

  // Abrir por URL (?cid= o ?smiles=) o el agua por defecto
  useEffect(() => {
    const cid = Number(params.get('cid'));
    const smiles = params.get('smiles');
    if (smiles) void interpretarSmiles(smiles);
    else void abrirCatalogo(CATALOGO.find((m) => m.cid === cid) ?? CATALOGO.find((m) => m.nombre === 'agua')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** SMILES: si está en el catálogo se usa su conformero; si no, PubChem (en línea) o geometría aproximada. */
  async function interpretarSmiles(smiles: string) {
    setError(null);
    setEstado('Cargando RDKit…');
    try {
      const R = await cargarRDKit();
      const canonico = smilesCanonico(R, smiles);
      if (!canonico) throw new Error(analizarEstructuraError(R, smiles));
      const delCatalogo = catalogoPorCanonico(R).get(canonico);
      if (delCatalogo) return void (await abrirCatalogo(delCatalogo));
      if (enLinea) {
        try {
          setEstado('Buscando en PubChem…');
          const p = await buscarEnPubChem(smiles, 'smiles');
          setMostrada({ nombre: p.nombre, formula: p.formula, iupac: p.iupac, smiles: p.smiles, cargada: p.cargada, catalogo: null, fuente: `PubChem (CID ${p.cid})` });
          setSeleccion([]);
          return;
        } catch {
          /* no está en PubChem: se genera la geometría */
        }
      }
      const r = analizarEstructura(R, smiles);
      const mol = generarCoordenadas3D(r.molecula);
      setMostrada({ nombre: 'Estructura ingresada', formula: formulaDeMolecula(mol), iupac: null, smiles: r.smilesCanonico, cargada: { molecula: mol, origen: 'aproximada' }, catalogo: null, fuente: 'SMILES (RDKit)' });
      setSeleccion([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEstado(null);
    }
  }

  async function buscarNombrePubChem() {
    if (!consulta.trim()) return;
    setError(null);
    setEstado('Buscando en PubChem…');
    try {
      const p = await buscarEnPubChem(consulta, 'nombre');
      const enCatalogo = CATALOGO.find((m) => m.cid === p.cid);
      if (enCatalogo) return void (await abrirCatalogo(enCatalogo));
      setMostrada({ nombre: p.nombre, formula: p.formula, iupac: p.iupac, smiles: p.smiles, cargada: p.cargada, catalogo: null, fuente: `PubChem (CID ${p.cid})` });
      setSeleccion([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEstado(null);
    }
  }

  const elegirAtomo = (i: number) => {
    setSeleccion((s) => {
      const n = NECESARIOS[modo];
      if (s.length >= n) return [i];
      if (s.includes(i)) return s;
      return [...s, i];
    });
  };

  const mol = mostrada?.cargada.molecula;
  const polaridad = useMemo(() => (mol ? esPolar(mol) : null), [mol]);
  const dipolo = useMemo(() => (mol ? momentoDipolarEstimado(mol).vector : null), [mol]);
  const muExp = mostrada?.catalogo ? (dipolos.valores as Record<string, number>)[mostrada.catalogo.nombre] : undefined;
  const r = mol ? radioMolecula(mol) : 3;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Teoria titulo="Teoría: geometría molecular">
          <TeoriaVisor />
        </Teoria>
        <p className="text-sm text-texto-suave">{CATALOGO.length} moléculas disponibles sin conexión. Estructuras 3D de PubChem.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <BuscadorMoleculas alElegir={(m) => void abrirCatalogo(m)} etiqueta="Buscar en el catálogo" />
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void buscarNombrePubChem();
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium">SMILES o nombre en inglés (PubChem)</span>
            <input value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder="CC(=O)O, caffeine…" className="w-64 rounded-md border border-borde bg-superficie px-3 py-1.5" />
          </label>
          <button type="submit" className="rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto">
            Buscar
          </button>
          <button type="button" onClick={() => void interpretarSmiles(consulta)} className="rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2">
            Interpretar como SMILES
          </button>
        </form>
      </div>
      {!enLinea && <p className="mb-3 text-sm text-aviso">Sin conexión: la búsqueda en PubChem no está disponible, pero el catálogo y los SMILES sí funcionan.</p>}
      {estado && <p className="mb-3 text-sm text-texto-suave" aria-live="polite">{estado}</p>}
      {error && <p className="mb-3 text-sm text-error" role="alert">{error}</p>}

      {mostrada && mol && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {(() => {
              const red = mostrada.catalogo ? RED_POR_FORMULA[mostrada.catalogo.formula] : undefined;
              const conMuestra = mostrada.catalogo ? aspectoCompuesto(mostrada.catalogo.cid) !== null : false;
              const opciones: [Vista, string][] = [['molecula', 'Molécula 3D'], ...(red ? [['red', 'Red cristalina'] as [Vista, string]] : []), ...(conMuestra ? [['muestra', 'Muestra a 25 °C'] as [Vista, string]] : [])];
              return opciones.length > 1 ? (
                <div role="group" aria-label="Vista" className="mb-3 flex flex-wrap gap-1 text-sm">
                  {opciones.map(([k, t]) => (
                    <button key={k} type="button" aria-pressed={vista === k} onClick={() => setVista(k)} className={`rounded-md border px-3 py-1 ${vista === k ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde hover:bg-superficie-2'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
            {vista === 'red' && mostrada.catalogo && RED_POR_FORMULA[mostrada.catalogo.formula] ? (
              <Suspense fallback={<Cargando />}>
                <RedIonica3D tipo={RED_POR_FORMULA[mostrada.catalogo.formula]!} />
              </Suspense>
            ) : vista === 'muestra' && mostrada.catalogo ? (
              <Suspense fallback={<Cargando />}>
                <MuestraCompuesto3D cid={mostrada.catalogo.cid} nombre={mostrada.nombre} />
              </Suspense>
            ) : (
              <>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <div role="group" aria-label="Estilo" className="flex gap-1">
                {(
                  [
                    ['bolas', 'Bolas y barras'],
                    ['espacio', 'Espacio lleno'],
                    ['alambre', 'Alambre'],
                  ] as const
                ).map(([k, t]) => (
                  <button key={k} type="button" aria-pressed={estilo === k} onClick={() => setEstilo(k)} className={`rounded border px-2 py-1 ${estilo === k ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={etiquetas} onChange={(e) => setEtiquetas(e.target.checked)} /> Etiquetas
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={verDipolo} onChange={(e) => setVerDipolo(e.target.checked)} /> Momento dipolar
              </label>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-1 text-sm" role="group" aria-label="Herramienta">
              <span className="mr-1 font-medium">Clic en átomos para:</span>
              {(
                [
                  ['atomo', 'Ver átomo'],
                  ['distancia', 'Distancia'],
                  ['angulo', 'Ángulo'],
                  ['diedro', 'Diedro'],
                ] as const
              ).map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={modo === k}
                  onClick={() => {
                    setModo(k);
                    setSeleccion([]);
                  }}
                  className={`rounded border px-2 py-1 ${modo === k ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Escena3D
              key={mostrada.smiles + mostrada.fuente}
              descripcion={`Modelo 3D de ${mostrada.nombre}`}
              camara={[0, r * 0.4, r * 2.6]}
              className="h-[440px]"
              superposicion={<Medicion mol={mol} modo={modo} seleccion={seleccion} />}
            >
              <Molecula3D molecula={mol} estilo={estilo} seleccion={seleccion} alElegirAtomo={elegirAtomo} etiquetas={etiquetas} dipolo={verDipolo ? dipolo : null} />
            </Escena3D>
            <p className="mt-1 text-xs text-texto-suave">
              {DESCRIPCION_ORIGEN[mostrada.cargada.origen]} · {mostrada.fuente}
              {mostrada.cargada.origen === 'vsepr' && ' (PubChem no publica un conformero fiable para esta especie hipervalente o sin 3D).'}
              {mostrada.cargada.origen === 'aproximada' && ' — distancias y ángulos aproximados.'}
            </p>
              </>
            )}
          </div>

          <aside className="space-y-4 text-sm">
            <div>
              <h2 className="text-xl font-bold">{mostrada.nombre}</h2>
              {mostrada.catalogo && <p className="text-texto-suave">{NOMBRE_CATEGORIA[mostrada.catalogo.categoria] ?? ''}</p>}
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-texto-suave">Fórmula</dt>
                <dd>
                  <Ce>{mostrada.formula.replace(/([+-])(\d?)$/, '^{$2$1}')}</Ce>
                </dd>
                <dt className="text-texto-suave">Masa molar</dt>
                <dd className="tabular-nums">{masaMolar(mostrada.formula.replace(/[+-]\d*$/, '')).toFixed(3)} g/mol</dd>
                {mostrada.iupac && (
                  <>
                    <dt className="text-texto-suave">IUPAC (inglés)</dt>
                    <dd className="break-words">{mostrada.iupac}</dd>
                  </>
                )}
                <dt className="text-texto-suave">SMILES</dt>
                <dd className="font-mono text-xs break-all">{mostrada.smiles}</dd>
                {mostrada.catalogo?.puntoEbullicion && (
                  <>
                    <dt className="text-texto-suave">{mostrada.catalogo.puntoEbullicion.sublima ? 'Sublimación' : 'Ebullición'}</dt>
                    <dd title={mostrada.catalogo.puntoEbullicion.fuente}>{mostrada.catalogo.puntoEbullicion.valor} °C</dd>
                  </>
                )}
                {polaridad && (
                  <>
                    <dt className="text-texto-suave">Polaridad</dt>
                    <dd>{mol.atomos.some((a) => a.carga) ? 'ion' : polaridad.polar ? 'polar' : 'apolar'}</dd>
                  </>
                )}
                {muExp !== undefined && (
                  <>
                    <dt className="text-texto-suave">μ experimental</dt>
                    <dd>
                      {muExp} D <InsigniaRevision texto="CRC" titulo="Momento dipolar experimental (CRC Handbook), pendiente de revisión" />
                    </dd>
                  </>
                )}
              </dl>
              {verDipolo && <p className="mt-1 text-xs text-texto-suave">La flecha violeta es una estimación cualitativa (suma de ΔEN y pares libres), apunta al extremo negativo.</p>}
            </div>
            <AnalisisSeleccion mol={mol} modo={modo} seleccion={seleccion} />
            <div>
              <h3 className="mb-1 font-semibold">Fórmula estructural</h3>
              <Estructura2D estructura={mostrada.smiles} titulo={mostrada.nombre} ancho={300} alto={200} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function analizarEstructuraError(R: Awaited<ReturnType<typeof cargarRDKit>>, smiles: string): string {
  try {
    analizarEstructura(R, smiles);
    return 'SMILES no válido.';
  } catch (e) {
    return (e as Error).message;
  }
}

/** Resultado de la medición en curso (superpuesto a la escena). */
function Medicion({ mol, modo, seleccion }: { mol: Molecula; modo: Modo; seleccion: number[] }) {
  if (modo === 'atomo' || seleccion.length === 0) return null;
  const n = NECESARIOS[modo];
  const P = seleccion.map((i) => pos(mol.atomos[i]!));
  const etiqueta = seleccion.map((i) => `${mol.atomos[i]!.simbolo}${i + 1}`).join('–');
  let texto = `${etiqueta} … elige ${n - seleccion.length} átomo(s) más`;
  if (seleccion.length === n) {
    if (modo === 'distancia') texto = `${etiqueta}: ${distancia(P[0]!, P[1]!).toFixed(3)} Å`;
    if (modo === 'angulo') texto = `${etiqueta}: ${angulo(P[0]!, P[1]!, P[2]!).toFixed(1)}°`;
    if (modo === 'diedro') texto = `${etiqueta}: ${diedro(P[0]!, P[1]!, P[2]!, P[3]!).toFixed(1)}°`;
  }
  return (
    <div className="pointer-events-none absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white" aria-live="polite">
      {texto}
    </div>
  );
}

/** Información VSEPR del átomo elegido. */
function AnalisisSeleccion({ mol, modo, seleccion }: { mol: Molecula; modo: Modo; seleccion: number[] }) {
  if (modo !== 'atomo' || seleccion.length === 0) {
    return <p className="text-texto-suave">Haz clic en un átomo para ver su geometría local e hibridación.</p>;
  }
  const i = seleccion[0]!;
  const a = analizarAtomo(mol, i);
  const vec = vecindario(mol);
  const el = elementoPorSimbolo(a.simbolo);
  return (
    <div className="rounded-md border border-borde p-3">
      <h3 className="font-semibold">
        {el?.nombre ?? a.simbolo} ({a.simbolo}
        {i + 1})
      </h3>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-texto-suave">Vecinos</dt>
        <dd>{vec[i]!.map((x) => `${mol.atomos[x.i]!.simbolo}${x.i + 1}${x.orden > 1 ? (x.orden === 2 ? ' (=)' : ' (≡)') : ''}`).join(', ') || '—'}</dd>
        <dt className="text-texto-suave">Pares libres</dt>
        <dd>{a.paresLibres}</dd>
        {mol.atomos[i]!.carga !== 0 && (
          <>
            <dt className="text-texto-suave">Carga formal</dt>
            <dd>{mol.atomos[i]!.carga > 0 ? `+${mol.atomos[i]!.carga}` : mol.atomos[i]!.carga}</dd>
          </>
        )}
        <dt className="text-texto-suave">Notación</dt>
        <dd>{a.notacion}</dd>
        {a.geometriaMolecular && (
          <>
            <dt className="text-texto-suave">Geometría local</dt>
            <dd>{a.geometriaMolecular}</dd>
          </>
        )}
        {a.hibridacion && (
          <>
            <dt className="text-texto-suave">Hibridación</dt>
            <dd>{a.hibridacion}</dd>
          </>
        )}
      </dl>
      {a.conjugado && <p className="mt-1 text-xs text-texto-suave">Su par libre está junto a un enlace múltiple: por resonancia este átomo suele ser plano (sp²).</p>}
    </div>
  );
}

function TeoriaVisor() {
  return (
    <div className="space-y-4">
      <p>
        Las estructuras del catálogo son conformeros 3D calculados por PubChem. Para especies hipervalentes (SF₄, ClF₃, XeF₄…) se usa la
        geometría ideal de la TRPECV, porque los campos de fuerzas no describen bien sus pares libres.
      </p>
      <section>
        <h3 className="font-semibold">Mediciones</h3>
        <Formula tex="d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}\qquad \cos\theta = \dfrac{\vec{BA}\cdot\vec{BC}}{|\vec{BA}|\,|\vec{BC}|}" bloque />
        <p>
          El ángulo diedro A–B–C–D es el ángulo entre los planos ABC y BCD: describe la rotación alrededor del enlace B–C (conformaciones).
        </p>
      </section>
      <section>
        <h3 className="font-semibold">Geometría local de cada átomo</h3>
        <Formula tex="E = \dfrac{V - q - \sum \text{órdenes de enlace}}{2}\qquad \text{dominios} = \text{vecinos} + E" bloque />
        <p>Con los dominios se obtienen la geometría (TRPECV) y la hibridación: 2 sp, 3 sp², 4 sp³.</p>
      </section>
      <section>
        <h3 className="font-semibold">Momento dipolar</h3>
        <Formula tex="\vec{\mu} = \sum_i q_i\,\vec{r}_i\qquad 1\ \text{D} = 3{,}336\times10^{-30}\ \text{C·m}" bloque />
        <p>
          Una molécula es polar si tiene enlaces polares (o pares libres) y su geometría no los cancela: H₂O es polar, CO₂ es apolar aunque sus
          enlaces C=O sean polares.
        </p>
      </section>
    </div>
  );
}

