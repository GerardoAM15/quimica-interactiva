import { useMemo, useState } from 'react';
import { formulaMolecularGrafo, formulaSemidesarrollada, nombrarOrganico, parsearNombre, smilesDeGrafo } from '@/chem/nomenclatura/organica';
import { Pestanas } from '@/components/Pestanas';
import { PasoAPaso } from '@/components/PasoAPaso';
import { grafoDesdeSmiles, svgEstructura, useRDKit, VistaOrganica } from '@/components/molecula/VistaOrganica';

export interface Ejemplo {
  smiles: string;
  /** Rótulo corto para la lista (p. ej. «alcano ramificado»). */
  tipo: string;
}

const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
const normalizar = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[‐–—]/g, '-');

type Seccion = 'nombrar' | 'formular' | 'practicar';
const SECCIONES = [
  { id: 'nombrar', titulo: 'Estructura → nombre' },
  { id: 'formular', titulo: 'Nombre → estructura' },
  { id: 'practicar', titulo: 'Practicar' },
] as const;

/** Color de la cadena principal (azul claro) en el dibujo de RDKit. */
const CADENA: [number, number, number] = [0.75, 0.88, 1];

function Nombrar({ ejemplos }: { ejemplos: Ejemplo[] }) {
  const { R, error: errorR } = useRDKit();
  const [smiles, setSmiles] = useState(ejemplos[0]?.smiles ?? 'CCO');
  const r = useMemo(() => {
    if (!R) return null;
    try {
      const g = grafoDesdeSmiles(R, smiles);
      const n = nombrarOrganico(g);
      let semi: string | null = null;
      try {
        semi = formulaSemidesarrollada(g);
      } catch {
        semi = null;
      }
      const notas = Object.fromEntries(n.cadena.map((a, k) => [a, String(k + 1)]));
      const colores = Object.fromEntries(n.cadena.map((a) => [a, CADENA])) as Record<number, [number, number, number]>;
      return { n, formula: formulaMolecularGrafo(g), semi, svg: svgEstructura(R, smiles, { ancho: 340, alto: 240, colores, notas }), error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [R, smiles]);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block font-medium">Ejemplos</span>
          <select value={ejemplos.some((e) => e.smiles === smiles) ? smiles : ''} onChange={(e) => e.target.value && setSmiles(e.target.value)} className={`${input} w-full`}>
            <option value="">Elegir…</option>
            {ejemplos.map((e) => (
              <option key={e.smiles} value={e.smiles}>
                {e.tipo}: {e.smiles}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">SMILES (escribe o pega una estructura)</span>
          <input value={smiles} onChange={(e) => setSmiles(e.target.value)} className={`${input} w-full font-mono`} spellCheck={false} />
        </label>
        <p className="text-xs text-texto-suave">SMILES: C, O, N y halógenos; «=» doble y «#» triple enlace; ramas entre paréntesis; anillos con números (C1CCCCC1); aromáticos en minúscula (c1ccccc1).</p>
        {errorR && <p className="text-error">{errorR}</p>}
        {r?.error && <p className="text-aviso">{r.error}</p>}
      </div>
      {r && !r.error && 'n' in r && r.n && (
        <div className="space-y-3 rounded-lg border border-borde bg-superficie p-4 text-sm">
          <p className="text-xl font-semibold">{r.n.nombre}</p>
          {r.svg && (
            <figure className="inline-block rounded-md bg-white p-1" role="img" aria-label={`Estructura de ${r.n.nombre} con la cadena principal numerada`}>
              <div dangerouslySetInnerHTML={{ __html: r.svg }} style={{ width: 340, maxWidth: '100%' }} className="[&_svg]:h-auto [&_svg]:max-w-full" />
            </figure>
          )}
          <p className="text-xs text-texto-suave">En azul, la cadena (o el anillo) principal con su numeración.</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-texto-suave">Fórmula molecular</dt>
            <dd>{r.formula!.replace(/\d+/g, (d) => d.replace(/\d/g, (x) => '₀₁₂₃₄₅₆₇₈₉'[Number(x)]!))}</dd>
            {r.semi && (
              <>
                <dt className="text-texto-suave">Semidesarrollada</dt>
                <dd>{r.semi}</dd>
              </>
            )}
          </dl>
          <PasoAPaso pasos={r.n.pasos.map((p) => ({ titulo: p }))} />
        </div>
      )}
    </div>
  );
}

function Formular({ inicial }: { inicial: string }) {
  const [nombre, setNombre] = useState(inicial);
  let res: { smiles: string; correcto: string } | null = null;
  let error: string | null = null;
  try {
    const g = parsearNombre(nombre);
    let correcto = '';
    try {
      correcto = nombrarOrganico(g).nombre;
    } catch {
      correcto = '';
    }
    res = { smiles: smilesDeGrafo(g), correcto };
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <div className="space-y-2">
        <label className="block">
          <span className="mb-1 block font-medium">Nombre IUPAC</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${input} w-full`} spellCheck={false} />
        </label>
        <p className="text-xs text-texto-suave">Ejemplos: 3-etil-2-metilhexano, but-2-eno, ciclopentanol, ácido 2-hidroxipropanoico, propanoato de etilo, N-metiletanamina.</p>
        {error && <p className="text-aviso">{error}</p>}
        {res && res.correcto && normalizar(res.correcto) !== normalizar(nombre) && (
          <p className="rounded-md border border-aviso/60 p-2">
            La estructura existe, pero su nombre IUPAC correcto es <strong>{res.correcto}</strong> (revisa la cadena principal o la numeración).
          </p>
        )}
        {res && res.correcto && normalizar(res.correcto) === normalizar(nombre) && <p className="text-exito">Nombre correcto.</p>}
      </div>
      {res && <VistaOrganica smiles={res.smiles} titulo={nombre} />}
    </div>
  );
}

function Practicar({ ejemplos }: { ejemplos: Ejemplo[] }) {
  const { R } = useRDKit();
  const [k, setK] = useState(0);
  const [resp, setResp] = useState('');
  const [verificado, setVerificado] = useState<null | boolean>(null);
  const [aciertos, setAciertos] = useState({ bien: 0, total: 0 });
  const e = ejemplos[k % ejemplos.length]!;
  const correcto = useMemo(() => (R ? nombrarOrganico(grafoDesdeSmiles(R, e.smiles)).nombre : ''), [R, e.smiles]);
  const comprobar = () => {
    const ok = normalizar(resp) === normalizar(correcto);
    setVerificado(ok);
    setAciertos((a) => ({ bien: a.bien + (ok ? 1 : 0), total: a.total + 1 }));
  };
  const siguiente = () => {
    setK((x) => x + 1 + Math.floor(Math.random() * Math.max(1, ejemplos.length - 1)));
    setResp('');
    setVerificado(null);
  };
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <VistaOrganica smiles={e.smiles} titulo="estructura a nombrar" con3D={false} />
      <div className="space-y-3">
        <p>Escribe el nombre IUPAC de la estructura.</p>
        <input
          value={resp}
          onChange={(ev) => setResp(ev.target.value)}
          onKeyDown={(ev) => ev.key === 'Enter' && (verificado === null ? comprobar() : siguiente())}
          className={`${input} w-full`}
          aria-label="Tu respuesta"
          spellCheck={false}
        />
        <div className="flex gap-2">
          <button type="button" onClick={comprobar} disabled={!resp || verificado !== null} className="rounded-md bg-acento px-3 py-1.5 font-medium text-acento-texto disabled:opacity-50">
            Comprobar
          </button>
          <button type="button" onClick={siguiente} className="rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2">
            Otra estructura
          </button>
        </div>
        {verificado !== null && (
          <p className={verificado ? 'font-semibold text-exito' : 'text-error'} aria-live="polite">
            {verificado ? '¡Correcto!' : `No es correcto. La respuesta es: ${correcto}`}
          </p>
        )}
        <p className="text-texto-suave tabular-nums">
          Aciertos: {aciertos.bien} de {aciertos.total}
        </p>
      </div>
    </div>
  );
}

/** Herramienta común de los módulos de orgánica: nombrar, formular y practicar. */
export function NombreEstructura({ ejemplos, nombreInicial }: { ejemplos: Ejemplo[]; nombreInicial: string }) {
  const [s, setS] = useState<Seccion>('nombrar');
  return (
    <Pestanas pestanas={SECCIONES} activa={s} alCambiar={setS} etiqueta="Nomenclatura">
      {s === 'nombrar' && <Nombrar ejemplos={ejemplos} />}
      {s === 'formular' && <Formular inicial={nombreInicial} />}
      {s === 'practicar' && <Practicar ejemplos={ejemplos} />}
    </Pestanas>
  );
}
