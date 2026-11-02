import { useState } from 'react';
import { colorDeLongitud, energiaBohr, lineasSerie, nombreColor, regionEspectral, SERIES, transicion } from '@/chem/atomo';
import { PasoAPaso } from '@/components/PasoAPaso';
import { R_H } from '@/chem/constants';

const N_MAX = 7;

/** Diagrama de niveles del H con transiciones; espectro visible (Balmer) y calculadora de Rydberg. */
export function EspectroHidrogeno() {
  const [ni, setNi] = useState(3);
  const [nf, setNf] = useState(2);
  const t = ni !== nf ? transicion(ni, nf) : null;

  // Diagrama de niveles: escala de energía no lineal para que se vean los niveles altos
  const Y = (n: number) => 20 + 260 * (1 - Math.sqrt(-energiaBohr(n) / 13.6));
  const transicionesSerie = (inferior: number) => lineasSerie(inferior, N_MAX);
  const colores: Record<number, string> = { 1: '#a78bfa', 2: '#f472b6', 3: '#fb923c', 4: '#4ade80' };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
        <svg viewBox="0 0 420 300" className="w-full text-texto" role="img" aria-label="Diagrama de niveles de energía del átomo de hidrógeno con las series de Lyman, Balmer, Paschen y Brackett">
          {Array.from({ length: N_MAX }, (_, i) => i + 1).map((n) => (
            <g key={n}>
              <line x1={60} x2={410} y1={Y(n)} y2={Y(n)} stroke="currentColor" strokeOpacity={n === ni || n === nf ? 0.9 : 0.35} strokeWidth={n === ni || n === nf ? 2 : 1} />
              <text x={4} y={Y(n) + 4} fontSize={11} fill="currentColor">
                n={n}
              </text>
              <text x={58} y={Y(n) - 3} fontSize={9} fill="currentColor" opacity={0.6} textAnchor="end">
                {energiaBohr(n).toFixed(2)}
              </text>
            </g>
          ))}
          <text x={410} y={14} fontSize={9} fill="currentColor" opacity={0.6} textAnchor="end">
            E (eV); n = ∞ → 0 eV
          </text>
          {[1, 2, 3, 4].map((inf, k) =>
            transicionesSerie(inf).map((tr, j) => {
              const x = 80 + k * 85 + j * 10;
              const activa = tr.nInicial === Math.max(ni, nf) && tr.nFinal === Math.min(ni, nf);
              return (
                <line
                  key={`${inf}-${j}`}
                  x1={x}
                  x2={x}
                  y1={Y(tr.nInicial)}
                  y2={Y(inf) - 3}
                  stroke={colores[inf]}
                  strokeWidth={activa ? 3.5 : 1.4}
                  opacity={activa ? 1 : 0.55}
                  className="cursor-pointer"
                  onClick={() => {
                    setNi(tr.nInicial);
                    setNf(inf);
                  }}
                >
                  <title>
                    {SERIES[inf]!.nombre}: {tr.nInicial} → {inf}, λ = {tr.longitudOnda.toFixed(1)} nm
                  </title>
                </line>
              );
            }),
          )}
          {[1, 2, 3, 4].map((inf, k) => (
            <text key={inf} x={80 + k * 85} y={296} fontSize={10} fill={colores[inf]}>
              {SERIES[inf]!.nombre}
            </text>
          ))}
        </svg>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <label>
              <span className="mb-1 block font-medium">Nivel inicial nᵢ</span>
              <select value={ni} onChange={(e) => setNi(Number(e.target.value))} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block font-medium">Nivel final n_f</span>
              <select value={nf} onChange={(e) => setNf(Number(e.target.value))} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {t ? (
            <div aria-live="polite">
              <p>
                <strong>{t.tipo === 'emision' ? 'Emisión' : 'Absorción'}</strong> ({ni} → {nf}){t.serie && ` · serie de ${t.serie}`}
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 tabular-nums">
                <dt className="text-texto-suave">Longitud de onda λ</dt>
                <dd className="flex items-center gap-2 font-semibold">
                  {t.longitudOnda.toLocaleString('es-PE', { maximumFractionDigits: 2 })} nm
                  {regionEspectral(t.longitudOnda) === 'visible' && <span className="h-3 w-6 rounded" style={{ background: colorDeLongitud(t.longitudOnda) }} aria-hidden />}
                </dd>
                <dt className="text-texto-suave">Región</dt>
                <dd>
                  {regionEspectral(t.longitudOnda)}
                  {nombreColor(t.longitudOnda) && ` (${nombreColor(t.longitudOnda)})`}
                </dd>
                <dt className="text-texto-suave">Frecuencia ν</dt>
                <dd>{(t.frecuencia / 1e14).toFixed(4)} × 10¹⁴ Hz</dd>
                <dt className="text-texto-suave">Energía del fotón</dt>
                <dd>
                  {t.energiaEV.toFixed(4)} eV = {(t.energiaJ * 1e19).toFixed(4)} × 10⁻¹⁹ J
                </dd>
              </dl>
              <PasoAPaso
                pasos={[
                  { titulo: 'Ecuación de Rydberg:', tex: '\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{n_f^2} - \\dfrac{1}{n_i^2}\\right)' },
                  {
                    titulo: `Con R_H = ${(R_H / 1e7).toFixed(6)} × 10⁷ m⁻¹:`,
                    tex: `\\dfrac{1}{\\lambda} = ${(R_H / 1e7).toFixed(6)}\\times10^{7}\\left|\\dfrac{1}{${Math.min(ni, nf)}^2} - \\dfrac{1}{${Math.max(ni, nf)}^2}\\right| = ${(t.numeroOnda / 1e6).toFixed(5)}\\times10^{6}\\ \\text{m}^{-1}`,
                  },
                  { titulo: 'Longitud de onda:', tex: `\\lambda = ${t.longitudOnda.toFixed(2)}\\ \\text{nm}` },
                  { titulo: 'Energía del fotón:', tex: `E = \\dfrac{hc}{\\lambda} = ${t.energiaEV.toFixed(4)}\\ \\text{eV} = |E_{${ni}} - E_{${nf}}|` },
                ]}
              />
              <p className="mt-2 text-xs text-texto-suave">λ en el vacío. En el aire es ~0,03 % menor (Hα: 656,47 nm en el vacío, 656,28 nm en el aire).</p>
            </div>
          ) : (
            <p className="text-aviso">Los niveles deben ser distintos.</p>
          )}
        </div>
      </div>

      <section>
        <h3 className="mb-2 font-semibold">Espectro de emisión visible del hidrógeno (serie de Balmer)</h3>
        <EspectroVisible lineas={lineasSerie(2, 9).filter((l) => l.longitudOnda >= 380)} seleccion={t?.longitudOnda} />
      </section>

      <section className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <caption className="mb-1 text-left font-semibold">Series espectrales del hidrógeno</caption>
          <thead>
            <tr className="border-b border-borde text-left">
              <th className="py-1 pr-2">Serie</th>
              <th className="py-1 pr-2">n_f</th>
              <th className="py-1 pr-2">Región</th>
              <th className="py-1 pr-2">Primera línea (nm)</th>
              <th className="py-1">Límite de la serie (nm)</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {[1, 2, 3, 4, 5].map((n) => (
              <tr key={n} className="border-b border-borde/50">
                <td className="py-1 pr-2">{SERIES[n]!.nombre}</td>
                <td className="py-1 pr-2">{n}</td>
                <td className="py-1 pr-2">{SERIES[n]!.region}</td>
                <td className="py-1 pr-2">{transicion(n + 1, n).longitudOnda.toFixed(1)}</td>
                <td className="py-1">{(1e9 * n * n / R_H).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function EspectroVisible({ lineas, seleccion }: { lineas: { longitudOnda: number; nInicial: number }[]; seleccion: number | undefined }) {
  const x = (nm: number) => ((nm - 380) / (750 - 380)) * 100;
  return (
    <div>
      <div className="relative h-14 overflow-hidden rounded-md bg-black" role="img" aria-label={`Líneas de Balmer en ${lineas.map((l) => `${l.longitudOnda.toFixed(0)} nm`).join(', ')}`}>
        {lineas.map((l) => (
          <div
            key={l.nInicial}
            className="absolute top-0 h-full"
            style={{
              left: `${x(l.longitudOnda)}%`,
              width: seleccion && Math.abs(seleccion - l.longitudOnda) < 0.01 ? 4 : 2,
              background: colorDeLongitud(l.longitudOnda),
              boxShadow: `0 0 8px ${colorDeLongitud(l.longitudOnda)}`,
            }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-8 text-[10px] text-texto-suave">
        {lineas.slice(0, 4).map((l) => (
          <span key={l.nInicial} className="absolute -translate-x-1/2 text-center" style={{ left: `${x(l.longitudOnda)}%` }}>
            {l.longitudOnda.toFixed(1)}
            <br />
            {l.nInicial}→2
          </span>
        ))}
      </div>
      <div className="mt-1 h-2 rounded" style={{ background: `linear-gradient(to right, ${[380, 420, 460, 500, 540, 580, 620, 660, 700, 750].map(colorDeLongitud).join(',')})` }} aria-hidden />
      <div className="flex justify-between text-[10px] text-texto-suave">
        <span>380 nm</span>
        <span>750 nm</span>
      </div>
    </div>
  );
}
