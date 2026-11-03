import { useState } from 'react';
import { clasificarEnlace, NOMBRE_TIPO_ENLACE, UMBRAL_IONICO } from '@/chem/enlace';
import { elementoPorSimbolo, ELEMENTOS } from '@/chem/elements';
import { SelectorElemento } from '@/components/SelectorElemento';
import { Formula } from '@/components/Formula';
import { PasoAPaso } from '@/components/PasoAPaso';

const EJEMPLOS: [string, string][] = [['H', 'H'], ['C', 'H'], ['H', 'Cl'], ['O', 'H'], ['C', 'O'], ['H', 'F'], ['Al', 'Cl'], ['Na', 'Cl'], ['K', 'F'], ['Cu', 'Zn']];
const conEN = ELEMENTOS.filter((e) => e.electronegatividad !== null).map((e) => e.z);

/** Calculadora del tipo de enlace por diferencia de electronegatividad. */
export function EnlaceCovalente() {
  const [za, setZa] = useState(1);
  const [zb, setZb] = useState(17);
  const a = ELEMENTOS[za - 1]!, b = ELEMENTOS[zb - 1]!;
  let r: ReturnType<typeof clasificarEnlace> | null = null;
  let error: string | null = null;
  try {
    r = clasificarEnlace(a.simbolo, b.simbolo);
  } catch (e) {
    error = (e as Error).message;
  }
  const x = (d: number) => `${(Math.min(d, 3.3) / 3.3) * 100}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <SelectorElemento z={za} alCambiar={(z) => conEN.includes(z) && setZa(z)} etiqueta="Átomo A" />
        <SelectorElemento z={zb} alCambiar={(z) => conEN.includes(z) && setZb(z)} etiqueta="Átomo B" />
      </div>
      {error && <p className="text-sm text-aviso">{error}</p>}
      {r && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-lg">
              Enlace <strong>{a.simbolo}–{b.simbolo}</strong>: <strong className="text-acento">{NOMBRE_TIPO_ENLACE[r.tipo]}</strong>
            </p>
            <p className="mt-1 text-sm">{r.explicacion}</p>
            {/* Escala de ΔEN con las zonas del criterio */}
            <div className="mt-4" aria-hidden>
              <div className="relative h-6 overflow-hidden rounded-md">
                <div className="absolute inset-y-0 left-0 bg-sky-500/70" style={{ width: x(0.05) }} />
                <div className="absolute inset-y-0 bg-violet-500/60" style={{ left: x(0.05), width: `calc(${x(UMBRAL_IONICO)} - ${x(0.05)})` }} />
                <div className="absolute inset-y-0 right-0 bg-orange-500/70" style={{ left: x(UMBRAL_IONICO) }} />
                <div className="absolute inset-y-0 w-1 bg-white shadow" style={{ left: x(r.deltaEN) }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-texto-suave">
                <span>0 · apolar</span>
                <span>covalente polar</span>
                <span>{UMBRAL_IONICO} · iónico →</span>
                <span>3,3</span>
              </div>
            </div>
            <dl className="mt-4 grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm tabular-nums">
              <dt>EN de {a.simbolo}</dt>
              <dd>{a.electronegatividad}</dd>
              <dt>EN de {b.simbolo}</dt>
              <dd>{b.electronegatividad}</dd>
              <dt>ΔEN</dt>
              <dd className="font-semibold">{r.deltaEN.toFixed(2)}</dd>
              <dt>Carácter iónico (Pauling)</dt>
              <dd className="font-semibold">{r.caracterIonico.toFixed(1)} %</dd>
            </dl>
            <PasoAPaso
              pasos={[
                { titulo: 'Diferencia de electronegatividad (escala de Pauling):', tex: `\\Delta EN = |${a.electronegatividad} - ${b.electronegatividad}| = ${r.deltaEN.toFixed(2)}` },
                { titulo: 'Porcentaje de carácter iónico:', tex: `\\%CI = 100\\left(1 - e^{-(${r.deltaEN.toFixed(2)})^2/4}\\right) = ${r.caracterIonico.toFixed(1)}\\%` },
                { titulo: `Criterio: ${r.explicacion}` },
              ]}
            />
          </div>
          <svg viewBox="0 0 300 140" className="w-full text-texto" role="img" aria-label={`Distribución de carga en el enlace ${a.simbolo}–${b.simbolo}`}>
            <defs>
              <linearGradient id="nube" x1="0" x2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={r.poloNegativo === a.simbolo ? 0.8 : 0.25} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={r.poloNegativo === b.simbolo ? 0.8 : 0.25} />
              </linearGradient>
            </defs>
            <ellipse cx={150} cy={70} rx={125} ry={48} fill="url(#nube)" />
            <text x={85} y={78} textAnchor="middle" fontSize={26} fontWeight={700} fill="currentColor">
              {a.simbolo}
            </text>
            <text x={215} y={78} textAnchor="middle" fontSize={26} fontWeight={700} fill="currentColor">
              {b.simbolo}
            </text>
            {r.poloNegativo && r.tipo !== 'metalico' && (
              <>
                <text x={85} y={30} textAnchor="middle" fontSize={15} fill={r.poloNegativo === a.simbolo ? '#dc2626' : '#2563eb'}>
                  {r.tipo === 'ionico' ? (r.poloNegativo === a.simbolo ? '−' : '+') : r.poloNegativo === a.simbolo ? 'δ−' : 'δ+'}
                </text>
                <text x={215} y={30} textAnchor="middle" fontSize={15} fill={r.poloNegativo === b.simbolo ? '#dc2626' : '#2563eb'}>
                  {r.tipo === 'ionico' ? (r.poloNegativo === b.simbolo ? '−' : '+') : r.poloNegativo === b.simbolo ? 'δ−' : 'δ+'}
                </text>
              </>
            )}
          </svg>
        </div>
      )}
      <section>
        <h3 className="mb-2 font-semibold">Ejemplos</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-sm">
            <thead>
              <tr className="border-b border-borde text-left">
                <th className="py-1 pr-2">Enlace</th>
                <th className="py-1 pr-2">ΔEN</th>
                <th className="py-1 pr-2">% iónico</th>
                <th className="py-1">Tipo</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {EJEMPLOS.map(([p, q]) => {
                const c = clasificarEnlace(p, q);
                return (
                  <tr key={p + q} className="cursor-pointer border-b border-borde/50 hover:bg-superficie-2" onClick={() => { setZa(elementoPorSimbolo(p)!.z); setZb(elementoPorSimbolo(q)!.z); }}>
                    <td className="py-1 pr-2">
                      {p}–{q}
                    </td>
                    <td className="py-1 pr-2">{c.deltaEN.toFixed(2)}</td>
                    <td className="py-1 pr-2">{c.caracterIonico.toFixed(0)} %</td>
                    <td className="py-1">{NOMBRE_TIPO_ENLACE[c.tipo]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-texto-suave">
          El criterio de ΔEN es aproximado: el límite de 1,7 corresponde a ~50 % de carácter iónico. <Formula tex="\%CI = 100(1 - e^{-\Delta EN^2/4})" />
        </p>
      </section>
    </div>
  );
}
