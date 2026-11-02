import { useMemo, useState } from 'react';
import { isotoposDe, masaAtomicaPromedio, particulas } from '@/chem/atomo';
import { elementoPorZ } from '@/chem/elements';
import { PasoAPaso } from '@/components/PasoAPaso';
import { SelectorElemento } from '@/components/SelectorElemento';
import { Formula } from '@/components/Formula';

/** Notación de nucleido y cálculo de partículas; masa atómica promedio con isótopos editables. */
export function IsotoposIones() {
  const [z, setZ] = useState(17);
  const el = elementoPorZ(z);
  const naturales = useMemo(() => isotoposDe(z).filter((i) => i.abundancia), [z]);
  const [a, setA] = useState(35);
  const [carga, setCarga] = useState(-1);
  const aValido = Math.max(a, z);
  const p = particulas(z, aValido, Math.min(carga, z));

  // Calculadora de masa promedio (editable, inicia con los datos del NIST)
  const [filas, setFilas] = useState(() => naturales.map((i) => ({ a: i.a, masa: i.masa, porcentaje: i.abundancia! * 100 })));
  const reiniciar = (nz: number) => {
    setZ(nz);
    const nat = isotoposDe(nz).filter((i) => i.abundancia);
    setFilas(nat.map((i) => ({ a: i.a, masa: i.masa, porcentaje: i.abundancia! * 100 })));
    setA(nat[0]?.a ?? isotoposDe(nz)[0]?.a ?? nz * 2);
    setCarga(0);
  };
  const sumaPct = filas.reduce((s, f) => s + f.porcentaje, 0);
  const promedio = filas.length && sumaPct > 0 ? masaAtomicaPromedio(filas.map((f) => ({ masa: f.masa, abundancia: f.porcentaje / 100 }))) : null;
  const especie = `${el.simbolo}${carga === 0 ? '' : `^{${Math.abs(carga) > 1 ? Math.abs(carga) : ''}${carga > 0 ? '+' : '-'}}`}`;

  return (
    <div className="space-y-6">
      <SelectorElemento z={z} alCambiar={reiniciar} />

      <section>
        <h3 className="font-semibold">Partículas de un nucleido o ion</h3>
        <div className="mt-2 flex flex-wrap items-end gap-4 text-sm">
          <label>
            <span className="mb-1 block font-medium">Número de masa A</span>
            <input type="number" min={z} max={300} value={aValido} onChange={(e) => setA(Number(e.target.value))} className="w-24 rounded-md border border-borde bg-superficie px-2 py-1.5" />
          </label>
          <label>
            <span className="mb-1 block font-medium">Carga</span>
            <input type="number" min={-4} max={Math.min(z, 8)} value={carga} onChange={(e) => setCarga(Number(e.target.value))} className="w-20 rounded-md border border-borde bg-superficie px-2 py-1.5" />
          </label>
          <Formula tex={`{}^{${aValido}}_{${z}}\\mathrm{${especie}}`} className="text-2xl" />
        </div>
        <dl className="mt-3 grid max-w-sm grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm tabular-nums">
          <dt>Protones (p⁺ = Z)</dt>
          <dd className="font-semibold">{p.protones}</dd>
          <dt>Neutrones (n⁰ = A − Z)</dt>
          <dd className="font-semibold">{p.neutrones}</dd>
          <dt>Electrones (e⁻ = Z − carga)</dt>
          <dd className="font-semibold">{p.electrones}</dd>
        </dl>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-texto-suave">
          <li><strong className="text-texto">Isótopos:</strong> igual Z, distinto A (¹²C y ¹⁴C).</li>
          <li><strong className="text-texto">Isóbaros:</strong> igual A, distinto Z (⁴⁰Ar y ⁴⁰Ca).</li>
          <li><strong className="text-texto">Isótonos:</strong> igual número de neutrones (¹⁴C y ¹⁶O, con 8 n⁰).</li>
          <li><strong className="text-texto">Isoelectrónicos:</strong> igual número de electrones (Na⁺, Ne y F⁻, con 10 e⁻).</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold">Masa atómica promedio</h3>
        <p className="mt-1 text-sm text-texto-suave">Valores iniciales del NIST para {el.nombre.toLowerCase()}. Puedes editarlos para resolver tus propios ejercicios.</p>
        {filas.length === 0 ? (
          <p className="mt-2 text-sm">Este elemento no tiene isótopos con abundancia natural.</p>
        ) : (
          <>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-[360px] text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="pr-3 pb-1 font-medium">Isótopo</th>
                    <th className="pr-3 pb-1 font-medium">Masa (u)</th>
                    <th className="pb-1 font-medium">Abundancia (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i}>
                      <td className="pr-3 py-0.5">
                        <sup>{f.a}</sup>
                        {el.simbolo}
                      </td>
                      <td className="pr-3 py-0.5">
                        <input
                          type="number"
                          step="any"
                          value={f.masa}
                          aria-label={`Masa del isótopo ${el.simbolo}-${f.a}`}
                          onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, masa: Number(e.target.value) } : x)))}
                          className="w-32 rounded border border-borde bg-superficie px-2 py-1"
                        />
                      </td>
                      <td className="py-0.5">
                        <input
                          type="number"
                          step="any"
                          value={Number(f.porcentaje.toFixed(5))}
                          aria-label={`Abundancia del isótopo ${el.simbolo}-${f.a}`}
                          onChange={(e) => setFilas((fs) => fs.map((x, j) => (j === i ? { ...x, porcentaje: Number(e.target.value) } : x)))}
                          className="w-28 rounded border border-borde bg-superficie px-2 py-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Math.abs(sumaPct - 100) > 0.01 && <p className="mt-1 text-sm text-aviso">Las abundancias suman {sumaPct.toFixed(3)} %; se normalizan al calcular.</p>}
            {promedio !== null && (
              <>
                <p className="mt-2 text-sm">
                  Masa atómica promedio: <strong className="tabular-nums">{promedio.toFixed(4)} u</strong>{' '}
                  <span className="text-texto-suave">(tabla: {el.masaAtomica} u)</span>
                </p>
                <PasoAPaso
                  pasos={[
                    { titulo: 'Promedio ponderado por la abundancia:', tex: '\\bar{A}_r = \\dfrac{\\sum_i m_i\\,\\%_i}{100}' },
                    { titulo: 'Reemplazando:', tex: `\\bar{A}_r = \\dfrac{${filas.map((f) => `${f.masa.toFixed(4)}\\times${f.porcentaje.toFixed(3)}`).join(' + ')}}{${sumaPct.toFixed(3)}}` },
                    { titulo: 'Resultado:', tex: `\\bar{A}_r = ${promedio.toFixed(4)}\\ \\text{u}` },
                  ]}
                />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
