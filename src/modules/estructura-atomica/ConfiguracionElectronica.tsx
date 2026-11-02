import { useState } from 'react';
import {
  bloque,
  configuracionIon,
  configuracionMoeller,
  configuracionReal,
  electronesDesapareados,
  electronesPorNivel,
  esExcepcion,
  formatearConfiguracion,
  LETRAS_L,
  nombreSubnivel,
  notacionKernel,
  numerosCuanticosEnSubnivel,
  ordenarPorNivel,
  ORDEN_MOELLER,
  type ConvencionSpin,
  type Subnivel,
} from '@/chem/configuracion';
import { elementoPorZ, grupo, grupoTradicional, periodo } from '@/chem/elements';
import { DiagramaOrbitales } from '@/components/atomo/DiagramaOrbitales';
import { PasoAPaso } from '@/components/PasoAPaso';
import { SelectorElemento } from '@/components/SelectorElemento';

/**
 * Diagrama de Moeller (regla de las diagonales): subniveles en filas por n,
 * flechas diagonales que indican el orden de llenado.
 */
function DiagramaMoeller({ ocupados }: { ocupados: Map<string, number> }) {
  const celda = 46;
  const pos = (n: number, l: number) => ({ x: 20 + l * celda, y: 20 + (n - 1) * 34 });
  // Diagonales: subniveles con igual n + l
  const diagonales = new Map<number, { n: number; l: number }[]>();
  for (const s of ORDEN_MOELLER) {
    const k = s.n + s.l;
    diagonales.set(k, [...(diagonales.get(k) ?? []), s]);
  }
  return (
    <svg viewBox="0 0 210 260" className="w-full max-w-[230px]" role="img" aria-label="Diagrama de Moeller con los subniveles ocupados resaltados">
      <defs>
        <marker id="punta-moeller" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity="0.5" />
        </marker>
      </defs>
      {[...diagonales.values()].map((lista, i) => {
        const ordenada = [...lista].sort((a, b) => b.l - a.l); // de arriba-derecha a abajo-izquierda
        const a = pos(ordenada[0]!.n, ordenada[0]!.l), b = pos(ordenada.at(-1)!.n, ordenada.at(-1)!.l);
        return (
          <line key={i} x1={a.x + 14} y1={a.y - 10} x2={b.x - 8} y2={b.y + 8} stroke="currentColor" strokeOpacity="0.35" markerEnd="url(#punta-moeller)" />
        );
      })}
      {ORDEN_MOELLER.map(({ n, l }) => {
        const { x, y } = pos(n, l);
        const e = ocupados.get(`${n},${l}`) ?? 0;
        const lleno = e === 2 * (2 * l + 1);
        return (
          <g key={`${n}${l}`}>
            <rect x={x - 15} y={y - 12} width={34} height={22} rx={4} fill={e ? (lleno ? '#38bdf8' : '#facc15') : 'transparent'} fillOpacity={e ? 0.85 : 0} stroke="currentColor" strokeOpacity={0.4} />
            <text x={x + 2} y={y + 4} textAnchor="middle" fontSize="12" fontWeight={e ? 700 : 400} fill={e ? '#0b1020' : 'currentColor'}>
              {n}
              {LETRAS_L[l]}
              {e > 0 && <tspan fontSize="8" dy="-5">{e}</tspan>}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ConfiguracionElectronica() {
  const [z, setZ] = useState(26);
  const [carga, setCarga] = useState(0);
  const [convencion, setConvencion] = useState<ConvencionSpin>('arriba+');
  const [porCapas, setPorCapas] = useState(false);
  const el = elementoPorZ(z);
  const cargaValida = Math.max(-3, Math.min(carga, Math.min(z, 8)), z - 118);
  const conf = configuracionIon(z, cargaValida);
  const moeller = configuracionMoeller(z - cargaValida);
  const excepcion = cargaValida === 0 && esExcepcion(z);
  const ocupados = new Map(conf.map((s) => [`${s.n},${s.l}`, s.e]));
  const ultimoMoeller: Subnivel = moeller.at(-1) ?? { n: 1, l: 0, e: 0 };
  const nc = ultimoMoeller.e > 0 ? numerosCuanticosEnSubnivel(ultimoMoeller.n, ultimoMoeller.l, ultimoMoeller.e, convencion) : null;
  const especie = `${el.simbolo}${cargaValida === 0 ? '' : `${Math.abs(cargaValida) > 1 ? Math.abs(cargaValida) : ''}${cargaValida > 0 ? '+' : '−'}`}`;
  const electrones = z - cargaValida;
  const mostrada = porCapas ? ordenarPorNivel(conf) : conf;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <SelectorElemento z={z} alCambiar={(x) => { setZ(x); setCarga(0); }} />
        <label className="text-sm">
          <span className="mb-1 block font-medium">Carga del ion</span>
          <select value={cargaValida} onChange={(e) => setCarga(Number(e.target.value))} className="rounded-md border border-borde bg-superficie px-2 py-1.5">
            {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].filter((q) => q <= z && z - q <= 118).map((q) => (
              <option key={q} value={q}>
                {q === 0 ? 'neutro' : q > 0 ? `+${q} (catión)` : `${q} (anión)`}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={porCapas} onChange={(e) => setPorCapas(e.target.checked)} />
          Ordenar por niveles
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-4">
          <section>
            <h3 className="font-semibold">
              {especie}: {electrones} electrones
            </h3>
            <p className="mt-1 font-mono text-[15px] break-words">{formatearConfiguracion(mostrada)}</p>
            <p className="mt-1 text-sm">
              Kernel: <span className="font-mono">{notacionKernel(conf).texto}</span>
            </p>
            {excepcion && (
              <p className="mt-2 rounded-md border border-aviso/50 p-2 text-sm">
                <strong>Excepción:</strong> Moeller predice <span className="font-mono">{notacionKernel(moeller).texto}</span>, pero la configuración real
                tiene el subnivel d (o f) lleno o semilleno, que es más estable.
              </p>
            )}
            {cargaValida > 0 && (
              <p className="mt-2 text-sm text-texto-suave">
                En los cationes se retiran primero los electrones del nivel más externo (mayor n), no los últimos que entraron según Moeller.
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 font-semibold">Diagrama de orbitales</h3>
            <DiagramaOrbitales configuracion={notacionKernel(conf).resto} mostrarMl />
          </section>

          <section className="text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-texto-suave">Electrones por capa</dt>
              <dd>{electronesPorNivel(conf).join(', ')}</dd>
              <dt className="text-texto-suave">Desapareados</dt>
              <dd>
                {electronesDesapareados(conf)} → {electronesDesapareados(conf) ? 'paramagnético' : 'diamagnético'}
              </dd>
              {cargaValida === 0 && (
                <>
                  <dt className="text-texto-suave">Ubicación</dt>
                  <dd>
                    Periodo {periodo(z)}, grupo {grupo(z)} ({grupoTradicional(z)}), bloque {bloque(z)}
                  </dd>
                </>
              )}
              {nc && (
                <>
                  <dt className="text-texto-suave">Electrón diferenciador</dt>
                  <dd>
                    {nombreSubnivel(ultimoMoeller.n, ultimoMoeller.l)}
                    <sup>{ultimoMoeller.e}</sup> → (n, l, mₗ, mₛ) = ({nc.n}, {nc.l}, {nc.ml > 0 ? `+${nc.ml}` : nc.ml}, {nc.ms > 0 ? '+1/2' : '−1/2'})
                  </dd>
                </>
              )}
            </dl>
            <fieldset className="mt-2 text-xs">
              <legend className="text-texto-suave">Convención de spin del primer electrón de cada orbital:</legend>
              <label className="mr-3">
                <input type="radio" name="conv" checked={convencion === 'arriba+'} onChange={() => setConvencion('arriba+')} /> ↑ = +1/2
              </label>
              <label>
                <input type="radio" name="conv" checked={convencion === 'arriba-'} onChange={() => setConvencion('arriba-')} /> ↑ = −1/2
              </label>
            </fieldset>
            <PasoAPaso
              pasos={[
                { titulo: `Electrones a distribuir: Z − carga = ${z} − (${cargaValida}) = ${electrones}.` },
                { titulo: 'Se llenan los subniveles en orden de energía relativa n + l (diagonales de Moeller):', detalle: <span className="font-mono">{formatearConfiguracion(moeller)}</span> },
                ...(cargaValida > 0
                  ? [{ titulo: `Catión: se parte del átomo neutro y se quitan ${cargaValida} electrón(es) del nivel más externo.`, detalle: <span className="font-mono">{formatearConfiguracion(configuracionReal(z))} → {formatearConfiguracion(conf)}</span> }]
                  : []),
                ...(nc
                  ? [
                      {
                        titulo: `El último electrón entra al subnivel ${nombreSubnivel(ultimoMoeller.n, ultimoMoeller.l)}: n = ${nc.n}, l = ${nc.l}.`,
                      },
                      {
                        titulo: `Con Hund, el electrón n.º ${ultimoMoeller.e} del subnivel ocupa la casilla mₗ = ${nc.ml} con spin ${nc.ms > 0 ? '+1/2' : '−1/2'}.`,
                      },
                    ]
                  : []),
              ]}
            />
          </section>
        </div>
        <div className="text-texto">
          <DiagramaMoeller ocupados={ocupados} />
          <p className="mt-1 max-w-[230px] text-xs text-texto-suave">Celeste: subnivel lleno · amarillo: incompleto. Las flechas siguen el orden de llenado.</p>
        </div>
      </div>
    </div>
  );
}
