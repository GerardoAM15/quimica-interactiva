import { useState } from 'react';
import { composicionEnantiomerica, excesoEnantiomerico, rotacionObservada } from '@/chem/estereo';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Slider } from '@/components/Slider';
import { ROTACIONES } from '@/data/estereo';
import { claseInput } from './comun';

const n = (v: number, d = 2) => v.toLocaleString('es-PE', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const signo = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '');
const conSigno = (v: number, d = 2) => `${signo(v)}${n(Math.abs(v), d)}`;
/** Número para KaTeX. */
const tex = (v: number, d = 2) => String(Number(v.toFixed(d))).replace('.', '{,}');

/** Esquema del polarímetro: el analizador gira α respecto del plano de la luz polarizada incidente. */
function Polarimetro({ alfa }: { alfa: number }) {
  const g = ((alfa % 360) + 360) % 360;
  return (
    <svg viewBox="0 0 220 220" className="w-48 max-w-full text-texto" role="img" aria-label={`Polarímetro: el plano de la luz gira ${conSigno(alfa)} grados (${alfa > 0 ? 'dextrógiro, sentido horario' : alfa < 0 ? 'levógiro, sentido antihorario' : 'sin desviación'})`}>
      <circle cx={110} cy={110} r={92} fill="var(--superficie)" stroke="var(--borde)" strokeWidth={2} />
      {Array.from({ length: 12 }, (_, k) => (
        <line key={k} x1={110} y1={22} x2={110} y2={k % 3 === 0 ? 36 : 30} stroke="var(--texto-suave)" strokeWidth={k % 3 === 0 ? 2 : 1} transform={`rotate(${k * 30} 110 110)`} />
      ))}
      {/* Plano de polarización de la luz que entra */}
      <line x1={110} y1={30} x2={110} y2={190} stroke="var(--texto-suave)" strokeWidth={2} strokeDasharray="5 4" />
      {/* Plano de la luz que sale: girado α (positivo = horario) */}
      <line x1={110} y1={30} x2={110} y2={190} stroke="var(--acento)" strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${g} 110 110)`} />
      <circle cx={110} cy={110} r={4} fill="currentColor" />
    </svg>
  );
}

export default function ActividadOptica() {
  const [indice, setIndice] = useState(1);
  const [longitud, setLongitud] = useState(1);
  const [conc, setConc] = useState(0.1);
  const [muestra, setMuestra] = useState('11.6');
  const [puro, setPuro] = useState('23.2');
  const sustancia = ROTACIONES.valores[indice]!;
  const alfa = rotacionObservada(sustancia.alfa, longitud, conc);
  const [am, ap] = [Number(muestra.replace(',', '.')), Number(puro.replace(',', '.'))];
  const eeValido = Number.isFinite(am) && Number.isFinite(ap) && ap !== 0 && Math.abs(am) <= Math.abs(ap);
  const ee = eeValido ? excesoEnantiomerico(am, ap) : 0;
  const comp = composicionEnantiomerica(ee);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3 text-sm">
        <h3 className="text-base font-semibold">Polarímetro: ley de Biot</h3>
        <label className="block">
          <span className="mb-1 block text-texto-suave">Sustancia</span>
          <select value={indice} onChange={(e) => setIndice(Number(e.target.value))} className={`${claseInput} w-full max-w-sm`}>
            {ROTACIONES.valores.map((x, i) => (
              <option key={x.nombre} value={i}>
                {x.nombre} · [α] = {conSigno(x.alfa)}°
              </option>
            ))}
          </select>
        </label>
        <Slider etiqueta="Longitud del tubo (l)" valor={longitud} min={0.5} max={2} paso={0.5} unidad=" dm" alCambiar={setLongitud} formato={(v) => n(v, 1)} />
        <Slider etiqueta="Concentración (c)" valor={conc} min={0.01} max={0.5} paso={0.01} unidad=" g/mL" alCambiar={setConc} formato={(v) => n(v, 2)} />
        <div className="flex flex-wrap items-center gap-4">
          <Polarimetro alfa={alfa} />
          <div aria-live="polite">
            <p className="text-lg font-semibold">α = {conSigno(alfa)}°</p>
            <p>{alfa > 0 ? 'Dextrógira (+): gira el plano en sentido horario.' : alfa < 0 ? 'Levógira (−): gira el plano en sentido antihorario.' : 'No desvía el plano de la luz.'}</p>
            <p className="mt-1 text-texto-suave">Línea punteada: luz que entra. Línea de color: luz que sale.</p>
          </div>
        </div>
        <PasoAPaso
          pasos={[
            { titulo: 'Ley de Biot', tex: '\\alpha = [\\alpha]\\cdot l \\cdot c', detalle: 'l en decímetros y c en gramos por mililitro.' },
            { titulo: 'Sustituir', tex: `\\alpha = (${tex(sustancia.alfa)})\\times ${tex(longitud, 1)}\\,\\text{dm}\\times ${tex(conc)}\\,\\text{g/mL} = ${tex(alfa)}^\\circ` },
          ]}
        />
        <p className="flex flex-wrap items-center gap-2 text-xs text-texto-suave">
          Rotaciones específicas [α]<sub>D</sub> a 20 °C: {ROTACIONES.fuente}. <InsigniaRevision />
        </p>
        <p className="text-texto-suave">El signo (+) o (−) se mide: no se puede deducir de la configuración R o S.</p>
      </section>

      <section className="space-y-3 text-sm">
        <h3 className="text-base font-semibold">Exceso enantiomérico</h3>
        <div className="flex flex-wrap gap-3">
          <label className="block">
            <span className="mb-1 block text-texto-suave">[α] de la muestra (°)</span>
            <input value={muestra} onChange={(e) => setMuestra(e.target.value)} inputMode="decimal" className={`${claseInput} w-32`} />
          </label>
          <label className="block">
            <span className="mb-1 block text-texto-suave">[α] del enantiómero puro (°)</span>
            <input value={puro} onChange={(e) => setPuro(e.target.value)} inputMode="decimal" className={`${claseInput} w-32`} />
          </label>
        </div>
        {eeValido ? (
          <>
            <div className="rounded-lg border border-borde bg-superficie-2 p-3" aria-live="polite">
              <p className="text-lg font-semibold">ee = {n(Math.abs(ee), 1)} %</p>
              <p>
                Mezcla: {n(comp.mayoritario, 1)} % del enantiómero mayoritario y {n(comp.minoritario, 1)} % del otro.
                {ee === 0 && ' Es una mezcla racémica: no desvía la luz.'}
              </p>
              <div className="mt-2 flex h-4 overflow-hidden rounded border border-borde" aria-hidden>
                <div className="bg-acento" style={{ width: `${comp.mayoritario}%` }} />
                <div className="bg-superficie" style={{ width: `${comp.minoritario}%` }} />
              </div>
            </div>
            <PasoAPaso
              pasos={[
                { titulo: 'Exceso enantiomérico', tex: `ee = \\dfrac{[\\alpha]_\\text{muestra}}{[\\alpha]_\\text{puro}}\\times 100 = \\dfrac{${tex(am)}}{${tex(ap)}}\\times 100 = ${tex(Math.abs(ee), 1)}\\,\\%` },
                { titulo: 'Enantiómero mayoritario', tex: `\\dfrac{100 + ee}{2} = ${tex(comp.mayoritario, 1)}\\,\\%` },
                { titulo: 'Enantiómero minoritario', tex: `\\dfrac{100 - ee}{2} = ${tex(comp.minoritario, 1)}\\,\\%` },
              ]}
            />
          </>
        ) : (
          <p className="text-error">Escribe dos rotaciones válidas: la de la muestra no puede superar en valor absoluto a la del enantiómero puro.</p>
        )}
        <ul className="list-disc space-y-1 pl-5">
          <li>Dos enantiómeros giran el plano el mismo ángulo, en sentidos opuestos.</li>
          <li>Una mezcla racémica (50 % de cada uno) es ópticamente inactiva; también lo son los compuestos meso.</li>
        </ul>
      </section>
    </div>
  );
}
