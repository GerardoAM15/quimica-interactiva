import { useState } from 'react';
import {
  analizarRedox,
  balancear,
  balancearIonElectron,
  ecuacionMhchem,
  ErrorBalanceo,
  pasosTanteo,
  type Medio,
  type ResultadoBalanceo,
} from '@/chem/balance';
import { aMhchem } from '@/chem/formula';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce, Formula } from '@/components/Formula';

type Metodo = 'algebraico' | 'tanteo' | 'redox' | 'ion';
const METODOS = [
  { id: 'algebraico', titulo: 'Algebraico' },
  { id: 'tanteo', titulo: 'Tanteo' },
  { id: 'redox', titulo: 'Redox (cambio de EO)' },
  { id: 'ion', titulo: 'Ion-electrón' },
] as const;

const EJEMPLOS = [
  'Fe + O2 -> Fe2O3',
  'C3H8 + O2 -> CO2 + H2O',
  'Al(OH)3 + H2SO4 -> Al2(SO4)3 + H2O',
  'Cu + HNO3 -> Cu(NO3)2 + NO + H2O',
  'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O',
  'K2Cr2O7 + HCl -> KCl + CrCl3 + Cl2 + H2O',
];
const EJEMPLOS_ION: [string, Medio][] = [
  ['MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+', 'acido'],
  ['Cr2O7^2- + Fe^2+ -> Cr^3+ + Fe^3+', 'acido'],
  ['Cu + NO3^- -> Cu^2+ + NO', 'acido'],
  ['MnO4^- + I^- -> MnO2 + I2', 'basico'],
  ['Cl2 -> Cl^- + ClO3^-', 'basico'],
];

const LETRAS = 'abcdefghijklmnopqrstuvwxyz';

function Algebraico({ r }: { r: ResultadoBalanceo }) {
  const especies = [...r.reactivos, ...r.productos];
  return (
    <PasoAPaso
      abierto
      pasos={[
        {
          titulo: 'Se asigna una letra a cada coeficiente:',
          tex: `\\ce{${r.reactivos.map((s, i) => `${LETRAS[i]}\\,${aMhchem(s.texto)}`).join(' + ')} -> ${r.productos.map((s, i) => `${LETRAS[r.reactivos.length + i]}\\,${aMhchem(s.texto)}`).join(' + ')}}`.replace(/\\,/g, ' '),
        },
        { titulo: 'Una ecuación por cada elemento (átomos a la izquierda = átomos a la derecha):', detalle: <ul className="font-mono">{r.sistema.map((s) => <li key={s}>{s}</li>)}</ul> },
        {
          titulo: `Se fija ${LETRAS[0]} = 1 y se resuelve el sistema (con fracciones exactas):`,
          tex: especies.map((_, i) => `${LETRAS[i]} = ${r.solucionRacional[i]!.aLatex()}`).join(',\\quad '),
        },
        { titulo: 'Se multiplica por el m.c.m. de los denominadores para obtener enteros mínimos:', tex: especies.map((_, i) => `${LETRAS[i]} = ${r.coeficientes[i]}`).join(',\\quad ') },
      ]}
    />
  );
}

function Redox({ r }: { r: ResultadoBalanceo }) {
  const a = analizarRedox(r);
  return (
    <div className="space-y-3 text-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[360px]">
          <caption className="mb-1 text-left font-semibold">Números de oxidación</caption>
          <tbody>
            {a.estados.map((e) => (
              <tr key={e.especie} className="border-b border-borde/50">
                <td className="py-1 pr-3">
                  <Ce>{aMhchem(e.especie)}</Ce>
                </td>
                <td className="py-1 font-mono text-xs">{e.estados.map(([el, v]) => `${el}: ${v.signo() > 0 ? '+' : ''}${v}`).join('   ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {a.esRedox ? (
        <>
          <ul className="list-disc space-y-1 pl-5">
            {a.cambios.map((c) => (
              <li key={`${c.elemento}${c.especieInicial}${c.especieFinal}`}>
                <strong>{c.elemento}</strong>: {c.inicial.toString()} → {c.final.toString()} · {c.tipo === 'oxidacion' ? 'se oxida (pierde' : 'se reduce (gana'} {c.electronesPorAtomo.toString()} e⁻ por átomo) · {c.especieInicial} → {c.especieFinal}
              </li>
            ))}
          </ul>
          <p>
            Agente oxidante: <strong>{a.agenteOxidante.join(', ')}</strong> (se reduce) · Agente reductor: <strong>{a.agenteReductor.join(', ')}</strong> (se oxida)
          </p>
          {a.electronesTransferidos !== null && <p>Electrones transferidos en la ecuación balanceada: <strong>{a.electronesTransferidos.toString()}</strong></p>}
          <p className="text-texto-suave">
            Método: se igualan los electrones perdidos y ganados (se multiplican en cruz), se colocan esos coeficientes en el agente oxidante y el reductor, y se
            termina por tanteo. El resultado coincide con el método algebraico.
          </p>
        </>
      ) : (
        <p className="text-texto-suave">Ningún elemento cambia de número de oxidación: no es una reacción redox.</p>
      )}
    </div>
  );
}

function IonElectron() {
  const [texto, setTexto] = useState(EJEMPLOS_ION[0]![0]);
  const [medio, setMedio] = useState<Medio>('acido');
  let r: ReturnType<typeof balancearIonElectron> | null = null;
  let error: string | null = null;
  try {
    r = balancearIonElectron(texto, medio);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block font-medium">Ecuación iónica (sin H₂O, H⁺ ni OH⁻)</span>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full rounded-md border border-borde bg-superficie px-3 py-1.5 font-mono" />
        </label>
        <fieldset className="flex gap-3">
          <legend className="sr-only">Medio</legend>
          <label>
            <input type="radio" checked={medio === 'acido'} onChange={() => setMedio('acido')} /> Medio ácido
          </label>
          <label>
            <input type="radio" checked={medio === 'basico'} onChange={() => setMedio('basico')} /> Medio básico
          </label>
        </fieldset>
      </div>
      <div className="flex flex-wrap gap-1">
        {EJEMPLOS_ION.map(([e, m]) => (
          <button key={e} type="button" onClick={() => { setTexto(e); setMedio(m); }} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
            <Ce>{e.replace(/->/, '->')}</Ce> ({m === 'acido' ? 'ácido' : 'básico'})
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {r && (
        <div className="rounded-lg border border-borde bg-superficie p-4">
          <Ce bloque>{ecuacionMhchem(r.final)}</Ce>
          <div className="mt-2 space-y-1 text-sm">
            {r.semirreacciones.map((s, i) => (
              <p key={i}>
                <span className="font-medium">{s.tipo === 'oxidacion' ? 'Oxidación' : 'Reducción'} (× {r!.factores[i]!.toString()}):</span> <Ce>{s.texto.replace(/\^/g, '^')}</Ce>
              </p>
            ))}
          </div>
          <PasoAPaso abierto pasos={r.pasos.map((p) => ({ titulo: p }))} />
        </div>
      )}
    </div>
  );
}

export default function Balanceador() {
  const [metodo, setMetodo] = useState<Metodo>('algebraico');
  const [texto, setTexto] = useState(EJEMPLOS[3]!);
  let r: ResultadoBalanceo | null = null;
  let error: { mensaje: string; tipo: string } | null = null;
  try {
    r = balancear(texto);
  } catch (e) {
    error = { mensaje: (e as Error).message, tipo: e instanceof ErrorBalanceo ? e.tipo : 'sintaxis' };
  }
  return (
    <div className="space-y-4">
      <Teoria titulo="Teoría: balanceo de ecuaciones">
        <div className="space-y-4">
          <p>Ley de conservación de la masa (Lavoisier): en una reacción, el número de átomos de cada elemento es el mismo en reactivos y productos. En las ecuaciones iónicas también se conserva la carga.</p>
          <section>
            <h3 className="font-semibold">Método algebraico</h3>
            <Formula tex="A\,\vec{x} = \vec{0},\qquad A_{ij} = \pm\,\text{átomos del elemento } i \text{ en la especie } j" bloque />
            <p>Si el sistema no tiene solución positiva, la ecuación es imposible; si tiene infinitas, combina reacciones independientes.</p>
          </section>
          <section>
            <h3 className="font-semibold">Método redox</h3>
            <p>e⁻ perdidos por el reductor = e⁻ ganados por el oxidante. Oxidación: aumenta el EO; reducción: disminuye.</p>
          </section>
          <section>
            <h3 className="font-semibold">Método ion-electrón</h3>
            <p>
              1) Separar semirreacciones; 2) balancear el elemento principal; 3) el O con H₂O; 4) el H con H⁺ (en medio básico, luego se agrega OH⁻ a ambos lados);
              5) la carga con e⁻; 6) igualar electrones y sumar.
            </p>
          </section>
        </div>
      </Teoria>
      <div>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Ecuación sin balancear (usa -&gt; o =)</span>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} className="w-full rounded-md border border-borde bg-superficie px-3 py-1.5 font-mono" />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          {EJEMPLOS.map((e) => (
            <button key={e} type="button" onClick={() => setTexto(e)} className="rounded border border-borde px-2 py-0.5 text-xs hover:bg-superficie-2">
              <Ce>{e}</Ce>
            </button>
          ))}
        </div>
      </div>
      {error && metodo !== 'ion' && (
        <p className={`rounded-md border p-3 text-sm ${error.tipo === 'sintaxis' ? 'border-aviso/60 text-aviso' : 'border-error/60 text-error'}`} role="alert">
          {error.mensaje}
        </p>
      )}
      {r && metodo !== 'ion' && (
        <div className="rounded-lg border border-exito/40 bg-superficie p-4">
          <p className="text-sm font-semibold text-exito">Ecuación balanceada</p>
          <Ce bloque>{ecuacionMhchem(r)}</Ce>
        </div>
      )}
      <Pestanas pestanas={METODOS} activa={metodo} alCambiar={setMetodo} etiqueta="Método de balanceo">
        {metodo === 'algebraico' && r && <Algebraico r={r} />}
        {metodo === 'tanteo' && r && (
          <div className="text-sm">
            <p className="mb-2 text-texto-suave">Orden del tanteo: metales, no metales, hidrógeno y oxígeno. Comprobación con los coeficientes obtenidos:</p>
            <ul className="space-y-1 font-mono text-xs">
              {pasosTanteo(r).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {metodo === 'redox' && r && <Redox r={r} />}
        {metodo === 'ion' && <IonElectron />}
      </Pestanas>
    </div>
  );
}
