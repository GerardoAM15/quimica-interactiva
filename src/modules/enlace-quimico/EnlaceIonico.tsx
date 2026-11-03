import { useEffect, useMemo, useState } from 'react';
import { formacionIonica } from '@/chem/enlace';
import { celdaIonica, contarPorEspecie, densidadCubica, REDES_IONICAS, type TipoRedIonica } from '@/chem/cristales';
import { NA } from '@/chem/constants';
import { masaMolar } from '@/chem/formula';
import { elementoPorSimbolo, grupo } from '@/chem/elements';
import Escena3D from '@/components/escena3d/Escena3D';
import { Cristal3D } from '@/components/escena3d/Cristal3D';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { PasoAPaso } from '@/components/PasoAPaso';
import { Ce } from '@/components/Formula';

const METALES = ['Li', 'Na', 'K', 'Mg', 'Ca', 'Ba', 'Al'];
const NO_METALES = ['F', 'Cl', 'Br', 'I', 'O', 'S', 'N', 'P'];

/** Posiciones de los electrones de valencia en la notación de Lewis (4 lados, primero uno por lado). */
function posicionesLewis(n: number, cx: number, cy: number): [number, number][] {
  // [dirección del lado, dirección perpendicular] para arriba, derecha, abajo, izquierda
  const lados: [number, number, number, number][] = [
    [0, -1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [-1, 0, 0, 1],
  ];
  return Array.from({ length: n }, (_, k) => {
    const [dx, dy, px, py] = lados[k % 4]!;
    const o = k < 4 ? -5 : 5; // el segundo electrón de cada lado forma el par
    return [cx + dx * 24 + px * o, cy + dy * 24 + py * o] as [number, number];
  });
}

function AnimacionTransferencia({ metal, noMetal }: { metal: string; noMetal: string }) {
  const f = formacionIonica(metal, noMetal);
  const [etapa, setEtapa] = useState(0);
  useEffect(() => setEtapa(0), [metal, noMetal]);

  const vMetal = f.cargaCation;
  const vNoMetal = 8 + f.cargaAnion;
  const ancho = Math.max(f.nCation, f.nAnion) * 110 + 40;
  const xC = (i: number) => 60 + i * 110 + (Math.max(f.nCation, f.nAnion) - f.nCation) * 55;
  const xA = (i: number) => 60 + i * 110 + (Math.max(f.nCation, f.nAnion) - f.nAnion) * 55;
  const yC = 50, yA = 170;

  // Cada electrón de un metal va a un hueco libre de algún no metal
  const transferidos = useMemo(() => {
    const lista: { desde: [number, number]; hacia: [number, number] }[] = [];
    let destinoAnion = 0;
    let hueco = vNoMetal;
    for (let i = 0; i < f.nCation; i++) {
      const origen = posicionesLewis(vMetal, xC(i), yC);
      for (let k = 0; k < vMetal; k++) {
        if (hueco >= 8) {
          destinoAnion++;
          hueco = vNoMetal;
        }
        const destino = posicionesLewis(8, xA(destinoAnion), yA)[hueco]!;
        lista.push({ desde: origen[k]!, hacia: destino });
        hueco++;
      }
    }
    return lista;
  }, [f.nCation, vMetal, vNoMetal, metal, noMetal]); // eslint-disable-line react-hooks/exhaustive-deps

  const reducido = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const carga = (q: number) => `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}`;

  return (
    <div>
      <svg viewBox={`0 0 ${ancho} 230`} className="h-52 w-auto max-w-full text-texto" role="img" aria-label={`Formación de ${f.formula}: cada ${metal} cede ${vMetal} electrón(es) y cada ${noMetal} gana ${-f.cargaAnion}`}>
        {Array.from({ length: f.nCation }, (_, i) => (
          <g key={`c${i}`}>
            <text x={xC(i)} y={yC} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} fill="currentColor">
              {metal}
            </text>
            {etapa === 2 && (
              <text x={xC(i) + 22} y={yC - 16} fontSize={13} fontWeight={700} fill="#2563eb">
                {carga(f.cargaCation)}
              </text>
            )}
          </g>
        ))}
        {Array.from({ length: f.nAnion }, (_, i) => (
          <g key={`a${i}`}>
            {etapa === 2 && <text x={xA(i) - 38} y={yA} dominantBaseline="central" fontSize={46} fill="currentColor" opacity={0.6}>[</text>}
            <text x={xA(i)} y={yA} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} fill="#16a34a">
              {noMetal}
            </text>
            {etapa === 2 && (
              <>
                <text x={xA(i) + 26} y={yA} dominantBaseline="central" fontSize={46} fill="currentColor" opacity={0.6}>]</text>
                <text x={xA(i) + 40} y={yA - 22} fontSize={13} fontWeight={700} fill="#dc2626">
                  {carga(f.cargaAnion)}
                </text>
              </>
            )}
            {/* Electrones propios del no metal */}
            {posicionesLewis(vNoMetal, xA(i), yA).map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={3.2} fill="#16a34a" />
            ))}
          </g>
        ))}
        {/* Electrones que se transfieren (amarillos) */}
        {transferidos.map((t, k) => {
          const [x, y] = etapa === 0 ? t.desde : t.hacia;
          return (
            <circle
              key={k}
              cx={0}
              cy={0}
              r={3.6}
              fill="#eab308"
              style={{ transform: `translate(${x}px, ${y}px)`, transition: reducido ? 'none' : `transform 1.1s ease-in-out ${k * 0.15}s` }}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setEtapa(1);
            setTimeout(() => setEtapa(2), reducido ? 0 : 1300 + transferidos.length * 150);
          }}
          disabled={etapa > 0}
          className="rounded-md bg-acento px-3 py-1.5 font-medium text-acento-texto disabled:opacity-50"
        >
          Transferir electrones
        </button>
        <button type="button" onClick={() => setEtapa(0)} className="rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2">
          Reiniciar
        </button>
        {etapa === 2 && (
          <span aria-live="polite">
            Fórmula: <Ce>{f.formula}</Ce>
          </span>
        )}
      </div>
      <PasoAPaso pasos={f.pasos.map((p) => ({ titulo: p }))} />
    </div>
  );
}

/** Radios iónicos de Shannon (pm) para el tamaño de las esferas (pendiente de revisión). */
const RADIOS_IONICOS: Record<TipoRedIonica, Record<string, number>> = {
  NaCl: { Na: 102, Cl: 181 },
  CsCl: { Cs: 174, Cl: 181 },
  CaF2: { Ca: 112, F: 131 },
  ZnS: { Zn: 60, S: 184 },
};
const COLORES_IONES: Record<string, string> = { Na: '#a78bfa', Cs: '#c084fc', Ca: '#94a3b8', Zn: '#9ca3af', Cl: '#22c55e', F: '#a3e635', S: '#facc15' };

function RedIonica() {
  const [tipo, setTipo] = useState<TipoRedIonica>('NaCl');
  const [reducidos, setReducidos] = useState(true);
  const info = REDES_IONICAS[tipo];
  const sitios = useMemo(() => celdaIonica(tipo), [tipo]);
  const cuenta = contarPorEspecie(sitios);
  const z = Math.min(cuenta[info.cation]!, cuenta[info.anion]! / (tipo === 'CaF2' ? 2 : 1));
  const rho = densidadCubica(z, masaMolar(tipo), info.a, NA);
  const radios = Object.fromEntries(Object.entries(RADIOS_IONICOS[tipo]).map(([k, v]) => [k, reducidos ? v * 0.55 : v]));
  const tam = info.a / 100;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label="Red iónica">
          {(Object.keys(REDES_IONICAS) as TipoRedIonica[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={tipo === t}
              className={`rounded-md border px-3 py-1 text-sm ${tipo === t ? 'border-acento bg-superficie-2 font-semibold' : 'border-borde'}`}
            >
              <Ce>{t}</Ce>
            </button>
          ))}
        </div>
        <Escena3D descripcion={`Celda unitaria de ${info.nombre}`} camara={[tam * 1.7, tam * 1.2, tam * 2.1]} className="h-[380px]">
          <Cristal3D sitios={sitios} radios={radios} colores={COLORES_IONES} celda={{ tipo: 'cubica', a: info.a }} />
        </Escena3D>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!reducidos} onChange={(e) => setReducidos(!e.target.checked)} />
          Iones con su radio real (empaquetados)
        </label>
      </div>
      <div className="text-sm">
        <h3 className="font-semibold">{info.nombre}</h3>
        <p className="mt-1">{info.descripcion}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-texto-suave">Coordinación</dt>
          <dd>{info.coordinacion}</dd>
          <dt className="text-texto-suave">Iones por celda</dt>
          <dd>
            {cuenta[info.cation]} {info.cation} + {cuenta[info.anion]} {info.anion}
          </dd>
          <dt className="text-texto-suave">Arista a</dt>
          <dd>{info.a} pm</dd>
          <dt className="text-texto-suave">Densidad teórica</dt>
          <dd>{rho.toFixed(2)} g/cm³</dd>
        </dl>
        <ul className="mt-3 flex flex-wrap gap-3 text-xs">
          {[info.cation, info.anion].map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: COLORES_IONES[s] }} aria-hidden />
              {elementoPorSimbolo(s)!.nombre} ({s === info.cation ? 'catión' : 'anión'})
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <InsigniaRevision titulo="Parámetros de red (CRC) y radios iónicos de Shannon transcritos; pendientes de verificación." />
        </div>
      </div>
    </div>
  );
}

export function EnlaceIonico() {
  const [metal, setMetal] = useState('Na');
  const [noMetal, setNoMetal] = useState('Cl');
  const sel = 'rounded-md border border-borde bg-superficie px-2 py-1.5';
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-2 font-semibold">Formación de un compuesto iónico</h3>
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <label>
            <span className="mb-1 block font-medium">Metal</span>
            <select className={sel} value={metal} onChange={(e) => setMetal(e.target.value)}>
              {METALES.map((s) => (
                <option key={s} value={s}>
                  {s} · {elementoPorSimbolo(s)!.nombre} (grupo {grupo(elementoPorSimbolo(s)!.z)})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block font-medium">No metal</span>
            <select className={sel} value={noMetal} onChange={(e) => setNoMetal(e.target.value)}>
              {NO_METALES.map((s) => (
                <option key={s} value={s}>
                  {s} · {elementoPorSimbolo(s)!.nombre} (grupo {grupo(elementoPorSimbolo(s)!.z)})
                </option>
              ))}
            </select>
          </label>
        </div>
        <AnimacionTransferencia metal={metal} noMetal={noMetal} />
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Redes cristalinas iónicas</h3>
        <RedIonica />
      </section>
    </div>
  );
}
