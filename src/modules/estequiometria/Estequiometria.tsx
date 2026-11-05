import { useMemo, useState } from 'react';
import { balancear, ecuacionMhchem, type ResultadoBalanceo } from '@/chem/balance';
import { aMhchem, composicionPorcentual, masaMolar, masaMolarDetallada } from '@/chem/formula';
import { convertir, formulaEmpirica, formulaMolecular, masaPura, porcentajeRendimiento, reactivoLimitante, VM_TEXTOS, type Unidad } from '@/chem/stoichiometry';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce, Formula } from '@/components/Formula';

type Seccion = 'conversiones' | 'limitante' | 'rendimiento' | 'composicion';
const SECCIONES = [
  { id: 'conversiones', titulo: 'Mol, masa, volumen, partículas' },
  { id: 'limitante', titulo: 'Reactivo limitante' },
  { id: 'rendimiento', titulo: 'Rendimiento y pureza' },
  { id: 'composicion', titulo: 'Composición y fórmulas' },
] as const;

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Número legible: notación científica «1.204 × 10²⁴» para valores muy grandes o muy pequeños. */
const num = (x: number, d = 4) => {
  if (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0)) {
    const e = Math.floor(Math.log10(Math.abs(x)));
    const exp = String(e).replace('-', '⁻').replace(/\d/g, (c) => SUP[Number(c)]!);
    return `${(x / 10 ** e).toFixed(3)} × 10${exp}`;
  }
  return Number(x.toPrecision(d)).toLocaleString('es-PE');
};
const input = 'rounded-md border border-borde bg-superficie px-2 py-1.5';

function Conversiones() {
  const [formula, setFormula] = useState('CO2');
  const [valor, setValor] = useState(88);
  const [unidad, setUnidad] = useState<Unidad>('g');
  let r: ReturnType<typeof convertir> | null = null;
  let error: string | null = null;
  try {
    r = convertir(formula, valor, unidad);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label>
          <span className="mb-1 block font-medium">Sustancia</span>
          <input value={formula} onChange={(e) => setFormula(e.target.value)} className={`${input} w-32 font-mono`} />
        </label>
        <label>
          <span className="mb-1 block font-medium">Cantidad</span>
          <input type="number" step="any" min={0} value={valor} onChange={(e) => setValor(Number(e.target.value))} className={`${input} w-36`} />
        </label>
        <label>
          <span className="mb-1 block font-medium">Unidad</span>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value as Unidad)} className={input}>
            <option value="g">gramos</option>
            <option value="mol">moles</option>
            <option value="L">litros (gas en CN)</option>
            <option value="particulas">partículas</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {r && (
        <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
          <dl className="grid max-w-md grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums">
            <dt>Masa molar</dt>
            <dd>{num(r.masaMolar, 6)} g/mol</dd>
            <dt>Moles</dt>
            <dd className="font-semibold">{num(r.moles)} mol</dd>
            <dt>Masa</dt>
            <dd>{num(r.masa)} g</dd>
            <dt>Volumen (gas en CN)</dt>
            <dd>{num(r.volumenCN)} L</dd>
            <dt>Partículas</dt>
            <dd>{num(r.particulas)}</dd>
          </dl>
          <PasoAPaso pasos={r.pasos} />
          <p className="mt-2 text-xs text-texto-suave">CN: 0 °C y 1 atm; se usa Vₘ = {VM_TEXTOS} L/mol, el valor de los textos (CODATA: 22,414 L/mol).</p>
        </div>
      )}
    </div>
  );
}

function Limitante() {
  const [texto, setTexto] = useState('NH3 + CO2 -> CO(NH2)2 + H2O');
  const [masas, setMasas] = useState<number[]>([637.2, 1142]);
  let ec: ResultadoBalanceo | null = null;
  let error: string | null = null;
  try {
    ec = balancear(texto);
  } catch (e) {
    error = (e as Error).message;
  }
  const n = ec?.reactivos.length ?? 0;
  const cantidades = Array.from({ length: n }, (_, i) => masas[i] ?? 10);
  const moles = ec ? ec.reactivos.map((s, i) => cantidades[i]! / masaMolar(s.texto)) : [];
  const r = ec && moles.every((m) => m > 0) ? reactivoLimitante(ec, moles) : null;
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Ecuación (se balancea automáticamente)</span>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} className={`${input} w-full max-w-xl font-mono`} />
      </label>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {ec && (
        <>
          <Ce bloque>{ecuacionMhchem(ec)}</Ce>
          <div className="flex flex-wrap gap-3 text-sm">
            {ec.reactivos.map((s, i) => (
              <label key={i}>
                <span className="mb-1 block font-medium">
                  Masa de <Ce>{aMhchem(s.texto)}</Ce> (g)
                </span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={cantidades[i]}
                  onChange={(e) => {
                    const c = [...cantidades];
                    c[i] = Number(e.target.value);
                    setMasas(c);
                  }}
                  className={`${input} w-32`}
                />
              </label>
            ))}
          </div>
        </>
      )}
      {ec && r && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-borde bg-superficie p-4 text-sm">
            <p>
              Reactivo limitante: <strong className="text-acento">{ec.reactivos[r.limitante]!.texto}</strong>
            </p>
            <ul className="mt-2 space-y-1">
              {ec.productos.map((p, j) => (
                <li key={j}>
                  <Ce>{aMhchem(p.texto)}</Ce>: {num(r.productos[j]!)} mol = <strong>{num(r.productos[j]! * masaMolar(p.texto))} g</strong> (teórico)
                </li>
              ))}
              {ec.reactivos.map((s, i) =>
                i === r.limitante ? null : (
                  <li key={`e${i}`} className="text-texto-suave">
                    Sobran {num(r.exceso[i]!)} mol = {num(r.exceso[i]! * masaMolar(s.texto))} g de {s.texto}
                  </li>
                ),
              )}
            </ul>
            <PasoAPaso pasos={[...ec.reactivos.map((s, i) => ({ titulo: `Moles de ${s.texto}: ${cantidades[i]} g ÷ ${num(masaMolar(s.texto), 6)} g/mol = ${num(moles[i]!)} mol` })), ...r.pasos.map((p) => ({ titulo: p }))]} />
          </div>
          {/* Barras: fracción de cada reactivo que se consume */}
          <div className="space-y-3 text-sm" aria-label="Consumo de cada reactivo">
            {ec.reactivos.map((s, i) => {
              const usado = 1 - r.exceso[i]! / moles[i]!;
              return (
                <div key={i}>
                  <p>
                    {s.texto}: se consume {(usado * 100).toFixed(0)} %
                  </p>
                  <div className="h-4 overflow-hidden rounded bg-superficie-2">
                    <div className={`h-full ${i === r.limitante ? 'bg-error' : 'bg-acento'}`} style={{ width: `${usado * 100}%`, transition: 'width 0.8s' }} />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-texto-suave">El limitante (rojo) se agota por completo; los demás quedan en exceso.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Rendimiento() {
  const [teorico, setTeorico] = useState(8.93e6);
  const [real, setReal] = useState(7.91e6);
  const [muestra, setMuestra] = useState(250);
  const [pureza, setPureza] = useState(80);
  const rend = porcentajeRendimiento(real, teorico);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Porcentaje de rendimiento</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">Teórico (g)</span>
            <input type="number" step="any" value={teorico} onChange={(e) => setTeorico(Number(e.target.value))} className={`${input} w-36`} />
          </label>
          <label>
            <span className="mb-1 block">Real (g)</span>
            <input type="number" step="any" value={real} onChange={(e) => setReal(Number(e.target.value))} className={`${input} w-36`} />
          </label>
        </div>
        <p className="mt-3 text-lg">
          Rendimiento: <strong>{rend.toFixed(1)} %</strong>
        </p>
        <Formula tex={`\\%R = \\dfrac{\\text{real}}{\\text{teórico}}\\times100 = \\dfrac{${num(real)}}{${num(teorico)}}\\times100 = ${rend.toFixed(1)}\\%`} bloque />
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Pureza de una muestra</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <label>
            <span className="mb-1 block">Masa de la muestra (g)</span>
            <input type="number" step="any" value={muestra} onChange={(e) => setMuestra(Number(e.target.value))} className={`${input} w-32`} />
          </label>
          <label>
            <span className="mb-1 block">Pureza (%)</span>
            <input type="number" step="any" min={0} max={100} value={pureza} onChange={(e) => setPureza(Number(e.target.value))} className={`${input} w-24`} />
          </label>
        </div>
        <p className="mt-3 text-lg">
          Sustancia pura: <strong>{num(masaPura(muestra, pureza))} g</strong>
        </p>
        <Formula tex={`m_{\\text{pura}} = m_{\\text{muestra}}\\cdot\\dfrac{\\%P}{100} = ${muestra}\\times\\dfrac{${pureza}}{100}`} bloque />
      </section>
    </div>
  );
}

function Composicion() {
  const [formula, setFormula] = useState('C6H12O6');
  const [porc, setPorc] = useState('C 40.92, H 4.58, O 54.50');
  const [M, setM] = useState(176.12);
  let comp: ReturnType<typeof composicionPorcentual> | null = null;
  try {
    comp = composicionPorcentual(formula);
  } catch {
    comp = null;
  }
  const datos = useMemo(() => {
    const pares = porc.split(/[,;]/).map((x) => x.trim().match(/^([A-Z][a-z]?)\s*[:=]?\s*([\d.]+)/)).filter(Boolean) as RegExpMatchArray[];
    return Object.fromEntries(pares.map((m) => [m[1]!, Number(m[2])]));
  }, [porc]);
  let emp: ReturnType<typeof formulaEmpirica> | null = null;
  let mol: ReturnType<typeof formulaMolecular> | null = null;
  let errorEmp: string | null = null;
  try {
    emp = formulaEmpirica(datos);
    if (M > 0) mol = formulaMolecular(emp.formula, M);
  } catch (e) {
    errorEmp = (e as Error).message;
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Composición centesimal</h3>
        <input value={formula} onChange={(e) => setFormula(e.target.value)} className={`${input} mt-2 w-40 font-mono`} aria-label="Fórmula" />
        {comp ? (
          <>
            <ul className="mt-3 space-y-1">
              {comp.map((c) => (
                <li key={c.simbolo} className="flex items-center gap-2">
                  <span className="w-8 font-semibold">{c.simbolo}</span>
                  <span className="h-3 rounded bg-acento" style={{ width: `${c.porcentaje * 2}px` }} aria-hidden />
                  <span className="tabular-nums">{c.porcentaje.toFixed(2)} %</span>
                </li>
              ))}
            </ul>
            <PasoAPaso
              pasos={[
                ...masaMolarDetallada(formula).pasos.map((p) => ({ titulo: `${p.simbolo}: ${p.cantidad} × ${p.masaAtomica} = ${p.subtotal.toFixed(3)} g/mol` })),
                { titulo: `M = ${masaMolar(formula).toFixed(3)} g/mol`, tex: '\\%X = \\dfrac{n_X\\,A_r(X)}{M}\\times100' },
              ]}
            />
          </>
        ) : (
          <p className="mt-2 text-aviso">Fórmula no válida.</p>
        )}
      </section>
      <section className="rounded-lg border border-borde bg-superficie p-4 text-sm">
        <h3 className="font-semibold">Fórmula empírica y molecular</h3>
        <label className="mt-2 block">
          <span className="mb-1 block">Composición (% o g): «C 40.92, H 4.58, O 54.50»</span>
          <input value={porc} onChange={(e) => setPorc(e.target.value)} className={`${input} w-full font-mono`} />
        </label>
        <label className="mt-2 block">
          <span className="mb-1 block">Masa molar (g/mol, opcional)</span>
          <input type="number" step="any" value={M} onChange={(e) => setM(Number(e.target.value))} className={`${input} w-32`} />
        </label>
        {errorEmp && <p className="mt-2 text-aviso">{errorEmp}</p>}
        {emp && (
          <div className="mt-3">
            <p>
              Fórmula empírica: <Ce>{emp.formula}</Ce> ({emp.masaMolarEmpirica.toFixed(3)} g/mol)
            </p>
            {mol && (
              <p>
                Fórmula molecular: <Ce>{mol.formula}</Ce> (k = {mol.k})
              </p>
            )}
            <PasoAPaso pasos={[...emp.pasos, ...(mol?.pasos ?? [])].map((p) => ({ titulo: p }))} />
          </div>
        )}
      </section>
    </div>
  );
}

export default function Estequiometria() {
  const [seccion, setSeccion] = useState<Seccion>('conversiones');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: estequiometría">
          <div className="space-y-4">
            <Formula tex="n = \dfrac{m}{M} = \dfrac{N}{N_A} = \dfrac{V}{V_m}\qquad N_A = 6{,}022\times10^{23}\ \text{mol}^{-1}\qquad V_m(\text{CN}) = 22{,}4\ \text{L/mol}" bloque />
            <p>
              Los coeficientes de la ecuación balanceada dan la relación en moles entre reactivos y productos. El reactivo limitante es el que se agota primero:
              el de menor cociente moles / coeficiente.
            </p>
            <Formula tex="\%R = \dfrac{\text{rendimiento real}}{\text{rendimiento teórico}}\times100\qquad \%X = \dfrac{n_X\,A_r(X)}{M}\times100" bloque />
            <p>Fórmula empírica: la relación entera más simple de átomos. La molecular es un múltiplo k de la empírica: k = M / M(empírica).</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta="Estequiometría">
        {seccion === 'conversiones' && <Conversiones />}
        {seccion === 'limitante' && <Limitante />}
        {seccion === 'rendimiento' && <Rendimiento />}
        {seccion === 'composicion' && <Composicion />}
      </Pestanas>
    </div>
  );
}
