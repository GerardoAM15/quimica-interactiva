import { useEffect, useState } from 'react';
import { estructuraLewis, type ResultadoLewis } from '@/chem/lewis';
import { cargarRDKit, analizarEstructura } from '@/lib/rdkit';
import { LewisSVG, type DibujoLewis } from '@/components/molecula/LewisSVG';
import { dibujoDeLewis, dibujoDeMolecula } from '@/components/molecula/lewisAdaptadores';
import { BuscadorMoleculas } from '@/components/molecula/BuscadorMoleculas';
import type { EntradaCatalogo } from '@/components/molecula/cargarMolecula';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce } from '@/components/Formula';
import { aMhchem } from '@/chem/formula';

const EJEMPLOS = ['H2O', 'NH3', 'CO2', 'HCN', 'O3', 'SO2', 'NO3-', 'CO3^2-', 'SO4^2-', 'BF3', 'PCl5', 'XeF4', 'H2SO4', 'NH4+', 'NO2'];

function Resonancia({ estructuras, titulo }: { estructuras: DibujoLewis[]; titulo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {estructuras.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-2xl text-texto-suave" aria-label="resonancia">↔</span>}
          <LewisSVG dibujo={d} titulo={`${titulo}, forma ${i + 1} de ${estructuras.length}`} className="h-36 w-auto text-texto" />
        </div>
      ))}
    </div>
  );
}

function LewisDeFormula() {
  const [formula, setFormula] = useState('NO3-');
  const [expandido, setExpandido] = useState(false);
  let r: ResultadoLewis | null = null;
  let error: string | null = null;
  try {
    r = estructuraLewis(formula);
  } catch (e) {
    error = (e as Error).message;
  }
  const mostradas = r ? (expandido && r.expandidas.length ? r.expandidas : r.resonantes) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Fórmula (un átomo central)</span>
          <input value={formula} onChange={(e) => setFormula(e.target.value)} className="w-40 rounded-md border border-borde bg-superficie px-2 py-1.5 font-mono" />
        </label>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Ejemplos">
          {EJEMPLOS.map((f) => (
            <button key={f} type="button" aria-label={`Ejemplo: ${f}`} onClick={() => setFormula(f)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
              <Ce>{aMhchem(f)}</Ce>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {r && (
        <div>
          <p className="text-sm">
            <Ce>{aMhchem(formula)}</Ce>: {r.totalElectrones} electrones de valencia · átomo central <strong>{r.central}</strong>
            {r.resonantes.length > 1 && ` · ${r.resonantes.length} formas resonantes`}
            {r.octetoIncompleto && ' · octeto incompleto'}
            {r.radical && ' · radical (electrón desapareado)'}
          </p>
          {r.expandidas.length > 0 && (
            <fieldset className="mt-2 text-sm">
              <legend className="sr-only">Modelo</legend>
              <label className="mr-4">
                <input type="radio" checked={!expandido} onChange={() => setExpandido(false)} /> Regla del octeto
              </label>
              <label>
                <input type="radio" checked={expandido} onChange={() => setExpandido(true)} /> Octeto expandido (cargas formales mínimas)
              </label>
            </fieldset>
          )}
          <div className="mt-3 rounded-lg border border-borde bg-superficie p-3">
            <Resonancia estructuras={mostradas.slice(0, 6).map(dibujoDeLewis)} titulo={`Estructura de Lewis de ${formula}`} />
            {mostradas.length > 6 && <p className="mt-1 text-xs text-texto-suave">… y {mostradas.length - 6} formas más.</p>}
          </div>
          <p className="mt-2 text-xs text-texto-suave">Las cargas formales distintas de cero se indican junto al átomo (azul +, rojo −).</p>
          <PasoAPaso pasos={r.pasos.map((p) => ({ titulo: p }))} />
        </div>
      )}
    </div>
  );
}

function LewisDeCatalogo() {
  const [m, setM] = useState<EntradaCatalogo | null>(null);
  const [dibujo, setDibujo] = useState<DibujoLewis | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!m) return;
    let vivo = true;
    setDibujo(null);
    setError(null);
    cargarRDKit()
      .then((R) => vivo && setDibujo(dibujoDeMolecula(analizarEstructura(R, m.smiles).molecula)))
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, [m]);
  return (
    <div className="space-y-3">
      <BuscadorMoleculas alElegir={setM} etiqueta="Molécula del catálogo" />
      {!m && <p className="text-sm text-texto-suave">Elige una molécula (por ejemplo, etanol, ácido acético o benceno) para ver su estructura de Lewis.</p>}
      {m && !dibujo && !error && <p className="text-sm text-texto-suave">Cargando RDKit y calculando la estructura…</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {m && dibujo && (
        <div className="rounded-lg border border-borde bg-superficie p-3">
          <p className="mb-2 text-sm font-medium">
            {m.nombre} · <Ce>{m.formula}</Ce>
          </p>
          <LewisSVG dibujo={dibujo} escala={dibujo.atomos.length > 20 ? 40 : 52} titulo={`Estructura de Lewis de ${m.nombre}`} className="h-auto max-h-[420px] w-full text-texto" />
          <p className="mt-2 text-xs text-texto-suave">Una forma de Kekulé de la molécula; los pares libres se calculan como (V − q − Σ enlaces)/2.</p>
        </div>
      )}
    </div>
  );
}

export function EstructurasLewis() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 font-semibold">Paso a paso para moléculas e iones con un átomo central</h3>
        <LewisDeFormula />
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Cualquier molécula del catálogo</h3>
        <LewisDeCatalogo />
      </section>
    </div>
  );
}
