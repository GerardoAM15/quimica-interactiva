import { useState } from 'react';
import { capacidadNivel, capacidadSubnivel, LETRAS_L, LETRAS_CAPA, validarNumerosCuanticos } from '@/chem/configuracion';
import { nodosAngulares, nodosRadiales } from '@/chem/orbitals';
import { Formula } from '@/components/Formula';

const NOMBRE_L = ['sharp', 'principal', 'difuso', 'fundamental'];
const FORMA_L = ['esférica', 'dilobular (dos lóbulos)', 'tetralobular (en general)', 'compleja'];

/** Explorador de los cuatro números cuánticos con validación. */
export function NumerosCuanticos() {
  const [n, setN] = useState(3);
  const [l, setL] = useState(2);
  const [ml, setMl] = useState(-1);
  const [ms, setMs] = useState<0.5 | -0.5>(0.5);
  const v = validarNumerosCuanticos(n, l, ml, ms);

  const cambiarN = (x: number) => {
    setN(x);
    if (l > x - 1) {
      setL(x - 1);
      if (Math.abs(ml) > x - 1) setMl(0);
    }
  };
  const cambiarL = (x: number) => {
    setL(x);
    if (Math.abs(ml) > x) setMl(0);
  };

  const sel = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">n (principal)</span>
          <select className={sel} value={n} onChange={(e) => cambiarN(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((x) => (
              <option key={x} value={x}>
                {x} (capa {LETRAS_CAPA[x - 1]})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">l (secundario o azimutal)</span>
          <select className={sel} value={l} onChange={(e) => cambiarL(Number(e.target.value))}>
            {Array.from({ length: Math.min(n, 4) }, (_, x) => (
              <option key={x} value={x}>
                {x} ({LETRAS_L[x]})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">mₗ (magnético)</span>
          <select className={sel} value={ml} onChange={(e) => setMl(Number(e.target.value))}>
            {Array.from({ length: 2 * l + 1 }, (_, i) => i - l).map((x) => (
              <option key={x} value={x}>
                {x > 0 ? `+${x}` : x}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">mₛ (spin)</span>
          <select className={sel} value={ms} onChange={(e) => setMs(Number(e.target.value) as 0.5 | -0.5)}>
            <option value={0.5}>+1/2 (↑)</option>
            <option value={-0.5}>−1/2 (↓)</option>
          </select>
        </label>
      </div>

      <div className={`rounded-lg border p-4 text-sm ${v.valido ? 'border-exito/60' : 'border-error/60'}`} aria-live="polite">
        {v.valido ? (
          <>
            <p className="font-semibold text-exito">
              Combinación válida: ({n}, {l}, {ml > 0 ? `+${ml}` : ml}, {ms > 0 ? '+1/2' : '−1/2'})
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Nivel n = {n} (capa {LETRAS_CAPA[n - 1]}): admite hasta 2n² = <strong>{capacidadNivel(n)}</strong> electrones y tiene n² ={' '}
                {n * n} orbitales.
              </li>
              <li>
                Subnivel <strong>{n}{LETRAS_L[l]}</strong> (de «{NOMBRE_L[l]}»): {2 * l + 1} orbital(es), hasta {capacidadSubnivel(l)} electrones; forma{' '}
                {FORMA_L[l]}.
              </li>
              <li>
                Orbital con mₗ = {ml}: {nodosRadiales(n, l)} nodo(s) radial(es) y {nodosAngulares(l)} nodo(s) angular(es) (total n − 1 = {n - 1}).
              </li>
              <li>Energía relativa del subnivel: n + l = {n + l}.</li>
            </ul>
          </>
        ) : (
          <p className="font-semibold text-error">No válida: {v.motivo}</p>
        )}
      </div>

      <section className="text-sm">
        <h3 className="font-semibold">Valores permitidos</h3>
        <Formula
          tex="n = 1, 2, 3, \dots\qquad l = 0, 1, \dots, n-1\qquad m_l = -l, \dots, 0, \dots, +l\qquad m_s = \pm\tfrac{1}{2}"
          bloque
        />
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[480px]">
            <caption className="mb-1 text-left text-texto-suave">Subniveles del nivel n = {n}</caption>
            <thead>
              <tr className="border-b border-borde text-left">
                <th className="py-1 pr-2">l</th>
                <th className="py-1 pr-2">Subnivel</th>
                <th className="py-1 pr-2">Valores de mₗ</th>
                <th className="py-1 pr-2">Orbitales</th>
                <th className="py-1">Electrones máx.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(n, 4) }, (_, x) => (
                <tr key={x} className={`border-b border-borde/50 ${x === l ? 'bg-superficie-2' : ''}`}>
                  <td className="py-1 pr-2">{x}</td>
                  <td className="py-1 pr-2">
                    {n}
                    {LETRAS_L[x]}
                  </td>
                  <td className="py-1 pr-2">{Array.from({ length: 2 * x + 1 }, (_, i) => i - x).map((m) => (m > 0 ? `+${m}` : m)).join(', ')}</td>
                  <td className="py-1 pr-2">{2 * x + 1}</td>
                  <td className="py-1">{capacidadSubnivel(x)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {n > 4 && <p className="mt-1 text-xs text-texto-suave">Para n ≥ 5 también existirían subniveles g, h…, pero ningún elemento conocido los ocupa en su estado fundamental.</p>}
      </section>
    </div>
  );
}
