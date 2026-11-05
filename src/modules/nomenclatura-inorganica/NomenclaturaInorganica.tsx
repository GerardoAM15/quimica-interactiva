import { useMemo, useState } from 'react';
import {
  catalogoNomenclatura,
  conHidratacion,
  formular,
  METALES,
  NO_METALES,
  nombrar,
  NOMBRE_FUNCION,
  type Compuesto,
  type Funcion,
} from '@/chem/nomenclatura/inorganica';
import { estadosOxidacion } from '@/chem/oxidacion';
import { aMhchem } from '@/chem/formula';
import { elementoPorSimbolo } from '@/chem/elements';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce, Formula } from '@/components/Formula';

type Seccion = 'nombrar' | 'formular' | 'funciones' | 'practicar' | 'valencias';
const SECCIONES = [
  { id: 'nombrar', titulo: 'Fórmula → nombre' },
  { id: 'formular', titulo: 'Nombre → fórmula' },
  { id: 'funciones', titulo: 'Funciones químicas' },
  { id: 'practicar', titulo: 'Practicar' },
  { id: 'valencias', titulo: 'Tabla de valencias' },
] as const;

const ce = (f: string) => aMhchem(f);

function TablaNombres({ c, hidratacion = 0 }: { c: Compuesto; hidratacion?: number }) {
  const filas: [string, string | null][] = [
    ['Tradicional', c.nombres.tradicional],
    ['Stock', c.nombres.stock],
    ['Sistemática (IUPAC)', c.nombres.sistematica],
  ];
  return (
    <div className="rounded-lg border border-borde bg-superficie p-4">
      <p className="text-xs font-medium tracking-wide text-texto-suave uppercase">{NOMBRE_FUNCION[c.funcion]}</p>
      <p className="mt-1 text-2xl">
        <Ce>{`${ce(c.formula)}${hidratacion ? `.${hidratacion}H2O` : ''}`}</Ce>
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-texto-suave">{k}</dt>
            <dd className="font-medium">{v ? conHidratacion(v, hidratacion) : <span className="font-normal text-texto-suave">no se usa</span>}</dd>
          </div>
        ))}
        {c.alias.length > 0 && (
          <>
            <dt className="text-texto-suave">También</dt>
            <dd>{c.alias.join(', ')}</dd>
          </>
        )}
      </dl>
      <p className="mt-2 text-sm text-texto-suave">{c.formacion}</p>
    </div>
  );
}

function PasosEO({ formula }: { formula: string }) {
  try {
    const r = estadosOxidacion(formula);
    return <PasoAPaso etiqueta="Ver estados de oxidación paso a paso" pasos={r.pasos.map((p) => ({ titulo: p }))} />;
  } catch {
    return null;
  }
}

function Nombrar() {
  const [formula, setFormula] = useState('Fe2(SO4)3');
  let resultado: ReturnType<typeof nombrar> | null = null;
  let error: string | null = null;
  try {
    resultado = nombrar(formula);
  } catch (e) {
    error = (e as Error).message;
  }
  const ejemplos = ['FeO', 'CO2', 'H2SO4', 'NaHCO3', 'Cu(OH)2', 'KMnO4', 'HCl', 'CuSO4·5H2O', 'Hg2Cl2', 'NH4^+', 'N2O5', 'Mg(OH)Cl'];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Fórmula</span>
          <input value={formula} onChange={(e) => setFormula(e.target.value)} className="w-48 rounded-md border border-borde bg-superficie px-3 py-1.5 font-mono" />
        </label>
        <div className="flex flex-wrap gap-1">
          {ejemplos.map((f) => (
            <button key={f} type="button" onClick={() => setFormula(f)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
              <Ce>{ce(f)}</Ce>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {resultado && resultado.compuestos.length === 0 && (
        <p className="text-sm text-texto-suave">No se encontró este compuesto en las funciones químicas que cubre la aplicación (revisa la fórmula o el orden: el catión va primero).</p>
      )}
      {resultado && resultado.compuestos.length > 1 && (
        <p className="text-sm text-aviso">Esta fórmula admite {resultado.compuestos.length} interpretaciones; se muestran todas.</p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {resultado?.compuestos.map((c, i) => (
          <div key={i}>
            <TablaNombres c={c} hidratacion={resultado!.hidratacion} />
            <PasosEO formula={c.formula} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Formular() {
  const [nombre, setNombre] = useState('sulfato férrico');
  const r = formular(nombre);
  const sugerencias = useMemo(() => {
    const t = nombre.trim().toLowerCase();
    if (t.length < 3 || r) return [];
    const quitar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = quitar(t);
    const res: string[] = [];
    for (const c of catalogoNomenclatura()) {
      for (const n of [c.nombres.tradicional, c.nombres.stock, c.nombres.sistematica]) {
        if (n && quitar(n).includes(q) && !res.includes(n)) res.push(n);
        if (res.length >= 8) return res;
      }
    }
    return res;
  }, [nombre, r]);
  const ejemplos = ['óxido de hierro(III)', 'anhídrido sulfúrico', 'ácido perclórico', 'hidróxido de calcio', 'carbonato ácido de sodio', 'tetraoxosulfato(VI) de cobre(II)', 'dicromato de potasio', 'cloruro de mercurio(I)'];
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Nombre (en cualquiera de las tres nomenclaturas)</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full max-w-md rounded-md border border-borde bg-superficie px-3 py-1.5" />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          {ejemplos.map((n) => (
            <button key={n} type="button" onClick={() => setNombre(n)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
              {n}
            </button>
          ))}
        </div>
      </div>
      {r ? (
        <div className="max-w-xl">
          <TablaNombres c={r.compuesto} hidratacion={r.hidratacion} />
          <PasoAPaso
            pasos={[
              { titulo: `Función: ${NOMBRE_FUNCION[r.compuesto.funcion].toLowerCase()}.` },
              { titulo: r.compuesto.formacion },
              { titulo: 'Fórmula resultante:', tex: `\\ce{${ce(r.compuesto.formula)}}` },
            ]}
          />
        </div>
      ) : (
        nombre.trim().length > 2 && (
          <div className="text-sm">
            <p className="text-texto-suave">No se reconoce ese nombre. {sugerencias.length ? '¿Quisiste decir…?' : ''}</p>
            <ul className="mt-1 flex flex-wrap gap-1">
              {sugerencias.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => setNombre(s)} className="rounded border border-borde px-2 py-0.5 hover:bg-superficie-2">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}

/** Diagrama de las funciones químicas inorgánicas. */
function Funciones() {
  const [sel, setSel] = useState<Funcion>('oxido-basico');
  const cajas: { id: Funcion | null; texto: string; x: number; y: number }[] = [
    { id: null, texto: 'Metal', x: 20, y: 20 },
    { id: null, texto: 'No metal', x: 20, y: 200 },
    { id: 'oxido-basico', texto: 'Óxido básico', x: 200, y: 20 },
    { id: 'oxido-acido', texto: 'Óxido ácido', x: 200, y: 200 },
    { id: 'hidroxido', texto: 'Hidróxido', x: 380, y: 20 },
    { id: 'oxacido', texto: 'Oxácido', x: 380, y: 200 },
    { id: 'hidruro-metalico', texto: 'Hidruro', x: 200, y: 110 - 50 + 50 },
    { id: 'hidracido', texto: 'Hidrácido', x: 200, y: 290 },
    { id: 'oxisal', texto: 'Sal (oxisal / haloidea)', x: 540, y: 110 },
  ];
  const flechas: [number, number, number, number, string][] = [
    [120, 40, 200, 40, '+ O₂'],
    [120, 220, 200, 220, '+ O₂'],
    [300, 40, 380, 40, '+ H₂O'],
    [300, 220, 380, 220, '+ H₂O'],
    [70, 60, 200, 130, '+ H₂'],
    [70, 240, 200, 305, '+ H₂'],
    [480, 45, 540, 115, ''],
    [480, 220, 540, 140, ''],
    [300, 305, 560, 155, ''],
  ];
  const ejemplos = catalogoNomenclatura()
    .filter((c) => c.funcion === sel || (sel === 'oxisal' && c.funcion === 'sal-haloidea'))
    .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 6)) === 0)
    .slice(0, 6);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <svg viewBox="0 0 700 340" className="w-full text-texto" role="img" aria-label="Diagrama de formación de las funciones químicas inorgánicas">
        <defs>
          <marker id="flecha-fun" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        {flechas.map(([x1, y1, x2, y2, t], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.6} markerEnd="url(#flecha-fun)" />
            {t && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize={11} textAnchor="middle" fill="currentColor">
                {t}
              </text>
            )}
          </g>
        ))}
        <text x={560} y={95} fontSize={11} fill="currentColor" opacity={0.7}>
          ácido + base → sal + H₂O
        </text>
        {cajas.map((c) => {
          const activa = c.id === sel;
          return (
            <g key={c.texto} onClick={() => c.id && setSel(c.id)} className={c.id ? 'cursor-pointer' : ''} role={c.id ? 'button' : undefined} aria-label={c.id ? `Ver ${c.texto}` : undefined}>
              <rect x={c.x} y={c.y} width={c.id === 'oxisal' ? 150 : 100} height={40} rx={8} fill={activa ? 'var(--acento)' : 'var(--superficie-2)'} stroke="var(--borde)" />
              <text x={c.x + (c.id === 'oxisal' ? 75 : 50)} y={c.y + 25} fontSize={12} textAnchor="middle" fill={activa ? 'var(--acento-texto)' : 'currentColor'} fontWeight={600}>
                {c.texto}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-sm">
        <div className="mb-2 flex flex-wrap gap-1">
          {(['oxido-basico', 'oxido-acido', 'hidroxido', 'oxacido', 'hidruro-metalico', 'hidracido', 'oxisal', 'peroxido', 'sal-acida', 'sal-basica'] as Funcion[]).map((f) => (
            <button key={f} type="button" aria-pressed={sel === f} onClick={() => setSel(f)} className={`rounded border px-2 py-0.5 text-xs ${sel === f ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}>
              {NOMBRE_FUNCION[f]}
            </button>
          ))}
        </div>
        <h3 className="font-semibold">{NOMBRE_FUNCION[sel]}: ejemplos</h3>
        <ul className="mt-2 space-y-2">
          {ejemplos.map((c) => (
            <li key={c.formula} className="rounded border border-borde p-2">
              <Ce>{ce(c.formula)}</Ce> — {c.nombres.tradicional}
              {c.nombres.stock && c.nombres.stock !== c.nombres.tradicional && <span className="text-texto-suave"> · {c.nombres.stock}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type TipoPregunta = 'nombre' | 'formula';
const FUNCIONES_PRACTICA: Funcion[] = ['oxido-basico', 'oxido-acido', 'hidroxido', 'oxacido', 'hidracido', 'sal-haloidea', 'oxisal', 'sal-acida'];

function nuevaPregunta(semilla: number) {
  const lista = catalogoNomenclatura().filter((c) => FUNCIONES_PRACTICA.includes(c.funcion));
  const azar = (k: number) => {
    const x = Math.sin(semilla * 9301 + k * 49297) * 233280;
    return x - Math.floor(x);
  };
  const c = lista[Math.floor(azar(1) * lista.length)]!;
  const tipo: TipoPregunta = azar(2) < 0.5 ? 'nombre' : 'formula';
  const disponibles = (['tradicional', 'stock', 'sistematica'] as const).filter((k) => c.nombres[k]);
  const nomenclatura = disponibles[Math.floor(azar(3) * disponibles.length)]!;
  const mismos = lista.filter((x) => x.funcion === c.funcion && x !== c && x.nombres[nomenclatura]);
  const distractores: Compuesto[] = [];
  for (let k = 0; distractores.length < 4 && k < 60; k++) {
    const d = mismos[Math.floor(azar(10 + k) * mismos.length)];
    if (d && !distractores.includes(d) && d.nombres[nomenclatura] !== c.nombres[nomenclatura]) distractores.push(d);
  }
  const opciones = [c, ...distractores].sort((a, b) => (azar(a.formula.length * 7 + a.formula.charCodeAt(0)) > azar(b.formula.length * 7 + b.formula.charCodeAt(0)) ? 1 : -1));
  return { c, tipo, nomenclatura, opciones };
}

function Practicar() {
  const [semilla, setSemilla] = useState(() => Math.floor(Math.random() * 1e6));
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState({ bien: 0, total: 0 });
  const p = useMemo(() => nuevaPregunta(semilla), [semilla]);
  const etiquetaNom = { tradicional: 'tradicional', stock: 'Stock', sistematica: 'sistemática' }[p.nomenclatura];
  const correcta = p.opciones.indexOf(p.c);
  const responder = (i: number) => {
    if (elegida !== null) return;
    setElegida(i);
    setAciertos((a) => ({ bien: a.bien + (i === correcta ? 1 : 0), total: a.total + 1 }));
  };
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm text-texto-suave">
        Aciertos: {aciertos.bien} de {aciertos.total}
      </p>
      <p className="text-lg">
        {p.tipo === 'nombre' ? (
          <>
            ¿Cuál es el nombre {etiquetaNom} de <Ce>{ce(p.c.formula)}</Ce>?
          </>
        ) : (
          <>¿Cuál es la fórmula de «{p.c.nombres[p.nomenclatura]}»?</>
        )}
      </p>
      <ol className="space-y-2">
        {p.opciones.map((o, i) => {
          const estado = elegida === null ? '' : i === correcta ? 'border-exito bg-exito/10' : i === elegida ? 'border-error bg-error/10' : 'opacity-60';
          return (
            <li key={i}>
              <button type="button" onClick={() => responder(i)} className={`flex w-full items-center gap-3 rounded-md border border-borde px-3 py-2 text-left hover:bg-superficie-2 ${estado}`}>
                <span className="font-bold">{'ABCDE'[i]})</span>
                {p.tipo === 'nombre' ? o.nombres[p.nomenclatura] : <Ce>{ce(o.formula)}</Ce>}
              </button>
            </li>
          );
        })}
      </ol>
      {elegida !== null && (
        <div className="rounded-md border border-borde p-3 text-sm" aria-live="polite">
          <p className="font-semibold">{elegida === correcta ? '¡Correcto!' : `Incorrecto: la respuesta es ${'ABCDE'[correcta]}.`}</p>
          <p className="mt-1">{p.c.formacion}</p>
          <p className="mt-1 text-texto-suave">
            {p.c.nombres.tradicional}
            {p.c.nombres.stock ? ` · ${p.c.nombres.stock}` : ''}
            {p.c.nombres.sistematica ? ` · ${p.c.nombres.sistematica}` : ''}
          </p>
          <button type="button" onClick={() => { setSemilla((s) => s + 1); setElegida(null); }} className="mt-2 rounded-md bg-acento px-3 py-1.5 font-medium text-acento-texto">
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function Valencias() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <caption className="mb-1 text-left font-semibold">Metales</caption>
          <thead>
            <tr className="border-b border-borde text-left">
              <th className="py-1 pr-2">Elemento</th>
              <th className="py-1 pr-2">EO</th>
              <th className="py-1">Terminaciones</th>
            </tr>
          </thead>
          <tbody>
            {METALES.map((m) => (
              <tr key={m.s} className="border-b border-borde/50">
                <td className="py-1 pr-2">
                  {m.s} · {elementoPorSimbolo(m.s)!.nombre}
                </td>
                <td className="py-1 pr-2">{m.v.map((v) => `+${v}`).join(', ')}</td>
                <td className="py-1 text-texto-suave">{m.adj ? `${m.adj[0]} / ${m.adj[1]}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <caption className="mb-1 text-left font-semibold">No metales (en anhídridos y oxácidos)</caption>
          <thead>
            <tr className="border-b border-borde text-left">
              <th className="py-1 pr-2">Elemento</th>
              <th className="py-1">EO y nombre</th>
            </tr>
          </thead>
          <tbody>
            {NO_METALES.map((n) => (
              <tr key={n.s} className="border-b border-borde/50">
                <td className="py-1 pr-2">
                  {n.s} · {elementoPorSimbolo(n.s)!.nombre}
                </td>
                <td className="py-1">
                  {Object.entries(n.eo)
                    .map(([v, t]) => `+${v} ${t}`)
                    .join(' · ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-texto-suave">Con hidrógeno (hidrácidos y sales haloideas): F, Cl, Br, I actúan con −1; S, Se, Te con −2.</p>
      </div>
    </div>
  );
}

export default function NomenclaturaInorganica() {
  const [seccion, setSeccion] = useState<Seccion>('nombrar');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: nomenclatura inorgánica">
          <div className="space-y-4">
            <section>
              <h3 className="font-semibold">Número (estado) de oxidación</h3>
              <Formula tex="\sum_i n_i\cdot EO_i = \text{carga de la especie}" bloque />
              <p>O es −2 (−1 en peróxidos), H es +1 (−1 en hidruros metálicos), los metales alcalinos +1 y los alcalinotérreos +2.</p>
            </section>
            <section>
              <h3 className="font-semibold">Nomenclatura tradicional</h3>
              <p>Con dos valencias: ‑oso (menor) e ‑ico (mayor). Con cuatro: hipo…oso, …oso, …ico, per…ico. Los aniones cambian ‑oso → ‑ito e ‑ico → ‑ato; los de hidrácidos, ‑hídrico → ‑uro.</p>
            </section>
            <section>
              <h3 className="font-semibold">Nomenclatura Stock</h3>
              <p>El estado de oxidación del elemento se indica con números romanos entre paréntesis, solo si tiene más de uno: óxido de hierro(III), cloruro de sodio.</p>
            </section>
            <section>
              <h3 className="font-semibold">Nomenclatura sistemática (IUPAC)</h3>
              <p>Prefijos mono, di, tri, tetra… indican el número de átomos: trióxido de dihierro (Fe₂O₃). En oxácidos y oxisales: tetraoxosulfato(VI) de hidrógeno (H₂SO₄).</p>
            </section>
            <section>
              <h3 className="font-semibold">Fórmula de un compuesto iónico</h3>
              <Formula tex="\ce{M^{a+}} + \ce{X^{b-}} \rightarrow \ce{M_bX_a}\ \text{(se simplifica)}" bloque />
            </section>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Nomenclatura inorgánica">
        {seccion === 'nombrar' && <Nombrar />}
        {seccion === 'formular' && <Formular />}
        {seccion === 'funciones' && <Funciones />}
        {seccion === 'practicar' && <Practicar />}
        {seccion === 'valencias' && <Valencias />}
      </Pestanas>
    </div>
  );
}
