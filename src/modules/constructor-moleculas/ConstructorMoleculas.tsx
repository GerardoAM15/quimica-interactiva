import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { escribirMolfile, formulaDeMolecula, type Molecula } from '@/chem/molecula';
import { generarCoordenadas3D } from '@/chem/coordenadas3d';
import { masaMolar } from '@/chem/formula';
import { analizarAtomo } from '@/chem/vsepr';
import { cargarRDKit, analizarEstructura, esqueleto2D, type RDKit, type ResultadoRDKit } from '@/lib/rdkit';
import { catalogoPorCanonico } from '@/components/molecula/cargarMolecula';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula } from '@/components/molecula/Molecula3D';
import { Teoria } from '@/components/Teoria';
import { Ce } from '@/components/Formula';
import { EditorMolecula, LARGO, nuevoId, type Dibujo, type Herramienta } from './EditorMolecula';

const ELEMENTOS = ['C', 'H', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B', 'Si'];
const EJEMPLOS: [string, string][] = [
  ['Etanol', 'CCO'],
  ['Ácido acético', 'CC(=O)O'],
  ['Benceno', 'c1ccccc1'],
  ['Acetona', 'CC(C)=O'],
  ['Glicina', 'NCC(=O)O'],
  ['Ciclohexano', 'C1CCCCC1'],
];
const HERRAMIENTAS: [Herramienta, string][] = [
  ['atomo', 'Átomo / enlace'],
  ['enlace', 'Solo enlaces'],
  ['carga', 'Carga ±'],
  ['mover', 'Mover'],
  ['borrar', 'Borrar'],
];

/** Dibujo del editor → molécula (coordenadas en Å, y hacia arriba). */
function aMolecula(d: Dibujo): { mol: Molecula; ids: number[] } {
  const ids = d.atomos.map((a) => a.id);
  const indice = new Map(ids.map((id, i) => [id, i]));
  const f = 1.5 / LARGO;
  return {
    ids,
    mol: {
      atomos: d.atomos.map((a) => ({ simbolo: a.simbolo, carga: a.carga, x: a.x * f, y: -a.y * f, z: 0 })),
      enlaces: d.enlaces.filter((b) => indice.has(b.a) && indice.has(b.b)).map((b) => ({ a: indice.get(b.a)!, b: indice.get(b.b)!, orden: b.orden })),
      es3D: false,
    },
  };
}

/** Molécula (2D, sin H) → dibujo centrado en el lienzo. */
function deMolecula(m: Molecula): Dibujo {
  const xs = m.atomos.map((a) => a.x), ys = m.atomos.map((a) => a.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const largos = m.enlaces.map((e) => Math.hypot(m.atomos[e.a]!.x - m.atomos[e.b]!.x, m.atomos[e.a]!.y - m.atomos[e.b]!.y));
  const f = LARGO / (largos.sort((p, q) => p - q)[Math.floor(largos.length / 2)] || 1);
  const atomos = m.atomos.map((a) => ({ id: nuevoId(), simbolo: a.simbolo, carga: a.carga, x: 320 + (a.x - cx) * f, y: 200 - (a.y - cy) * f }));
  return { atomos, enlaces: m.enlaces.map((e) => ({ a: atomos[e.a]!.id, b: atomos[e.b]!.id, orden: e.orden })) };
}

export default function ConstructorMoleculas() {
  const [dibujo, setDibujo] = useState<Dibujo>({ atomos: [], enlaces: [] });
  const [historial, setHistorial] = useState<Dibujo[]>([]);
  const [herramienta, setHerramienta] = useState<Herramienta>('atomo');
  const [elemento, setElemento] = useState('C');
  const [R, setR] = useState<RDKit | null>(null);
  const [resultado, setResultado] = useState<ResultadoRDKit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [smiles, setSmiles] = useState('');

  useEffect(() => {
    cargarRDKit()
      .then(setR)
      .catch(() => setError('No se pudo cargar RDKit.'));
  }, []);

  const cambiar = (d: Dibujo) => {
    setHistorial((h) => [...h.slice(-49), dibujo]);
    setDibujo(d);
  };

  // Validación con RDKit (agrega H implícitos según la valencia normal de cada elemento)
  const { mol, ids } = useMemo(() => aMolecula(dibujo), [dibujo]);
  useEffect(() => {
    if (!R) return;
    if (dibujo.atomos.length === 0) {
      setResultado(null);
      setError(null);
      return;
    }
    const t = setTimeout(() => {
      try {
        setResultado(analizarEstructura(R, escribirMolfile(mol)));
        setError(null);
      } catch (e) {
        setResultado(null);
        setError((e as Error).message);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [R, mol, dibujo.atomos.length]);

  const indiceError = error?.match(/átomo n\.º (\d+)/)?.[1];
  const conError = indiceError ? [ids[Number(indiceError) - 1]!] : [];
  const mol3D = useMemo(() => (resultado ? generarCoordenadas3D(resultado.molecula) : null), [resultado]);
  const delCatalogo = R && resultado ? catalogoPorCanonico(R).get(resultado.smilesCanonico) : undefined;
  const formula = resultado ? formulaDeMolecula(resultado.molecula) : null;

  const cargarSmiles = (s: string) => {
    if (!R) return;
    try {
      cambiar(deMolecula(esqueleto2D(R, s)));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: valencia y fórmulas">
          <div className="space-y-3">
            <p>
              Cada elemento forma un número típico de enlaces covalentes para completar su octeto: H 1, C 4, N 3, O 2, halógenos 1, S 2
              (o más con octeto expandido), P 3 o 5, B 3. Al dibujar solo el esqueleto, la aplicación agrega los H que faltan.
            </p>
            <p>Un enlace doble cuenta como 2 y uno triple como 3. Con carga formal cambia la valencia: N⁺ forma 4 enlaces (NH₄⁺), O⁻ forma 1 (OH⁻).</p>
            <p>La geometría 3D se obtiene aplicando la TRPECV a cada átomo y relajando las distancias; es una aproximación.</p>
          </div>
        </Teoria>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <div role="group" aria-label="Elemento" className="flex flex-wrap gap-1">
          {ELEMENTOS.map((s) => (
            <button key={s} type="button" aria-pressed={elemento === s} onClick={() => { setElemento(s); setHerramienta('atomo'); }} className={`w-9 rounded border py-1 font-semibold ${elemento === s && herramienta === 'atomo' ? 'border-acento bg-superficie-2' : 'border-borde'}`}>
              {s}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Herramienta" className="flex flex-wrap gap-1">
          {HERRAMIENTAS.map(([h, t]) => (
            <button key={h} type="button" aria-pressed={herramienta === h} onClick={() => setHerramienta(h)} className={`rounded border px-2 py-1 ${herramienta === h ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
              {t}
            </button>
          ))}
        </div>
        <button type="button" disabled={!historial.length} onClick={() => { setDibujo(historial.at(-1)!); setHistorial((h) => h.slice(0, -1)); }} className="rounded border border-borde px-2 py-1 disabled:opacity-40">
          Deshacer
        </button>
        <button type="button" onClick={() => cambiar({ atomos: [], enlaces: [] })} className="rounded border border-borde px-2 py-1">
          Limpiar
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-3">
          <EditorMolecula dibujo={dibujo} alCambiar={cambiar} herramienta={herramienta} elemento={elemento} conError={conError} />
          <p className="text-xs text-texto-suave">
            Clic en el vacío: nuevo átomo · arrastrar desde un átomo: nuevo enlace · clic en un enlace: simple → doble → triple · clic en un átomo
            con otro elemento elegido: lo cambia. Los H se agregan solos.
          </p>
          <div className="flex flex-wrap items-end gap-2 text-sm">
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                cargarSmiles(smiles);
              }}
            >
              <label>
                <span className="mb-1 block font-medium">O escribe un SMILES</span>
                <input value={smiles} onChange={(e) => setSmiles(e.target.value)} placeholder="CC(=O)O" className="w-48 rounded-md border border-borde bg-superficie px-2 py-1.5 font-mono" />
              </label>
              <button type="submit" disabled={!R} className="rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2">
                Dibujar
              </button>
            </form>
            <span className="text-texto-suave">Ejemplos:</span>
            {EJEMPLOS.map(([n, s]) => (
              <button key={n} type="button" disabled={!R} onClick={() => cargarSmiles(s)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
                {n}
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-3 text-sm" aria-live="polite">
          {!R && <p className="text-texto-suave">Cargando RDKit…</p>}
          {error && (
            <p className="rounded-md border border-error/60 p-2 text-error" role="alert">
              {error}
            </p>
          )}
          {resultado && formula && (
            <div className="rounded-md border border-exito/50 p-3">
              <p className="font-semibold text-exito">Estructura válida</p>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                <dt className="text-texto-suave">Fórmula</dt>
                <dd>
                  <Ce>{formula.replace(/([+-])(\d?)$/, '^{$2$1}')}</Ce>
                </dd>
                <dt className="text-texto-suave">Masa molar</dt>
                <dd className="tabular-nums">{masaMolar(formula.replace(/[+-]\d*$/, '')).toFixed(3)} g/mol</dd>
                <dt className="text-texto-suave">SMILES</dt>
                <dd className="font-mono text-xs break-all">{resultado.smilesCanonico}</dd>
                <dt className="text-texto-suave">Nombre</dt>
                <dd>{delCatalogo ? <strong>{delCatalogo.nombre}</strong> : <span className="text-texto-suave">no está en el catálogo</span>}</dd>
              </dl>
              <Link to={`/modulo/visor-moleculas?smiles=${encodeURIComponent(resultado.smilesCanonico)}`} className="mt-2 inline-block text-acento underline">
                Abrir en el visor 3D
              </Link>
            </div>
          )}
          {mol3D && (
            <>
              <Escena3D descripcion={`Modelo 3D aproximado de ${formula}`} camara={[0, 0, radioMolecula(mol3D) * 2.6]} className="h-[260px]" autoRotar>
                <Molecula3D molecula={mol3D} />
              </Escena3D>
              <p className="text-xs text-texto-suave">Geometría 3D aproximada (TRPECV + relajación).</p>
              <ResumenHibridacion mol={resultado!.molecula} />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function ResumenHibridacion({ mol }: { mol: Molecula }) {
  const cuenta = new Map<string, number>();
  mol.atomos.forEach((a, i) => {
    if (a.simbolo === 'H') return;
    const an = analizarAtomo(mol, i);
    const k = `${a.simbolo} ${an.hibridacion ?? '—'}`;
    cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
  });
  return (
    <div>
      <h3 className="font-semibold">Hibridación de los átomos</h3>
      <ul className="mt-1 flex flex-wrap gap-2">
        {[...cuenta].map(([k, n]) => (
          <li key={k} className="rounded-full border border-borde px-2 py-0.5 text-xs">
            {n} × {k}
          </li>
        ))}
      </ul>
    </div>
  );
}
