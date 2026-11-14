import { useMemo, useState } from 'react';
import type { RDKit } from '@/lib/rdkit';
import { coordenadas3DEstereo, proyeccionFischer, proyeccionNewman, serieDL, type ProyeccionFischer, type ProyeccionNewman } from '@/chem/estereo';
import { vecindario, type Molecula } from '@/chem/molecula';
import { Slider } from '@/components/Slider';
import { EJEMPLOS_FISCHER, EJEMPLOS_NEWMAN } from '@/data/estereo';
import { Figura2D, SelectorEjemplo, useAnalisis } from './comun';

/** Proyección de Fischer: cadena vertical; cada cruce es un carbono. */
function FischerSVG({ f, titulo }: { f: ProyeccionFischer; titulo: string }) {
  const paso = 46;
  const alto = (f.filas.length + 1) * paso + 40;
  const x = 130;
  const y = (k: number) => 28 + k * paso;
  return (
    <svg viewBox={`0 0 260 ${alto}`} className="w-64 max-w-full rounded-lg border border-borde bg-superficie text-texto" role="img" aria-label={`Proyección de Fischer de ${titulo}: ${f.arriba} arriba, ${f.filas.map((r) => `${r.izquierda} a la izquierda y ${r.derecha} a la derecha`).join('; ')}, ${f.abajo} abajo`}>
      <line x1={x} y1={y(0) + 10} x2={x} y2={y(f.filas.length + 1) - 12} stroke="currentColor" strokeWidth={2} />
      <text x={x} y={y(0)} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={600} fill="currentColor">
        {f.arriba}
      </text>
      {f.filas.map((r, k) => (
        <g key={r.atomo}>
          <line x1={x - 48} y1={y(k + 1)} x2={x + 48} y2={y(k + 1)} stroke="currentColor" strokeWidth={2} />
          <text x={x - 54} y={y(k + 1)} textAnchor="end" dominantBaseline="central" fontSize={16} fill="currentColor">
            {r.izquierda}
          </text>
          <text x={x + 54} y={y(k + 1)} textAnchor="start" dominantBaseline="central" fontSize={16} fill="currentColor">
            {r.derecha}
          </text>
          {r.descriptor && (
            <text x={248} y={y(k + 1)} textAnchor="end" dominantBaseline="central" fontSize={13} fill="var(--texto-suave)">
              ({r.descriptor})
            </text>
          )}
        </g>
      ))}
      <text x={x} y={y(f.filas.length + 1)} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={600} fill="currentColor">
        {f.abajo}
      </text>
    </svg>
  );
}

/** Enlace C–C central para la proyección de Newman: el que une los dos carbonos sp³ más sustituidos. */
function enlaceCentral(mol: Molecula): [number, number] | null {
  const vec = vecindario(mol);
  const pesados = (i: number) => vec[i]!.filter((v) => mol.atomos[v.i]!.simbolo !== 'H').length;
  let mejor: [number, number] | null = null;
  let puntaje = -1;
  for (const e of mol.enlaces) {
    if (e.orden !== 1 || mol.atomos[e.a]!.simbolo !== 'C' || mol.atomos[e.b]!.simbolo !== 'C') continue;
    if (vec[e.a]!.length !== 4 || vec[e.b]!.length !== 4) continue;
    const p = pesados(e.a) + pesados(e.b);
    if (p > puntaje) [mejor, puntaje] = [[e.a, e.b], p];
  }
  return mejor;
}

/**
 * Proyección de Newman idealizada: los sustituyentes de cada carbono a 120° entre sí, en el orden de
 * giro que tienen en la molécula 3D (eso conserva la configuración); el carbono trasero gira φ.
 */
function NewmanSVG({ n, phi, titulo }: { n: ProyeccionNewman; phi: number; titulo: string }) {
  const [delante, detras] = [[...n.delante].sort((a, b) => a.angulo - b.angulo), [...n.detras].sort((a, b) => a.angulo - b.angulo)];
  const c = 130, r = 46, largo = 86;
  const p = (grados: number, d: number): [number, number] => [c + d * Math.sin((grados * Math.PI) / 180), c - d * Math.cos((grados * Math.PI) / 180)];
  return (
    <svg viewBox="0 0 260 260" className="w-64 max-w-full rounded-lg border border-borde bg-superficie text-texto" role="img" aria-label={`Proyección de Newman de ${titulo} con el carbono trasero girado ${phi}°`}>
      {detras.map((s, k) => {
        const g = phi + k * 120;
        const [x1, y1] = p(g, r), [x2, y2] = p(g, largo), [xt, yt] = p(g, largo + 20);
        return (
          <g key={s.atomo}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--texto-suave)" strokeWidth={2.5} />
            <text x={xt} y={yt} textAnchor="middle" dominantBaseline="central" fontSize={14} fill="var(--texto-suave)">
              {s.texto}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={r} fill="var(--superficie)" stroke="currentColor" strokeWidth={2} />
      {delante.map((s, k) => {
        const g = k * 120;
        const [x2, y2] = p(g, largo - 8), [xt, yt] = p(g, largo + 6);
        return (
          <g key={s.atomo}>
            <line x1={c} y1={c} x2={x2} y2={y2} stroke="currentColor" strokeWidth={2.5} />
            <text x={xt} y={yt + (g === 0 ? -6 : 8)} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600} fill="currentColor">
              {s.texto}
            </text>
          </g>
        );
      })}
      <circle cx={c} cy={c} r={3} fill="currentColor" />
    </svg>
  );
}

/** Nombre de la conformación según el ángulo diedro entre los dos sustituyentes de referencia. */
function conformacion(diedro: number): string {
  if (diedro === 0) return 'eclipsada, con los dos grupos uno tras otro (la menos estable)';
  if (diedro === 120 || diedro === 240) return 'eclipsada';
  if (diedro === 180) return 'alternada anti, con los dos grupos opuestos (la más estable)';
  if (diedro === 60 || diedro === 300) return 'alternada gauche, con los dos grupos a 60°';
  return 'intermedia (ni eclipsada ni alternada)';
}

/** Sustituyente de referencia de un carbono: el grupo carbonado si lo hay; si no, el primero que no sea H. */
function indiceReferencia(lista: { texto: string }[]): number {
  const k = lista.findIndex((s) => s.texto.startsWith('C') && s.texto !== 'Cl');
  return k >= 0 ? k : Math.max(0, lista.findIndex((s) => s.texto !== 'H'));
}

export default function Proyecciones({ R }: { R: RDKit }) {
  const [iF, setIF] = useState(0);
  const [iN, setIN] = useState(0);
  const [phi, setPhi] = useState(60);
  const ejF = EJEMPLOS_FISCHER[iF]!;
  const ejN = EJEMPLOS_NEWMAN[iN]!;
  const { analisis: aF } = useAnalisis(R, ejF.smiles);
  const { analisis: aN } = useAnalisis(R, ejN.smiles);
  const fischer = useMemo(() => (aF ? proyeccionFischer(aF.molecula) : null), [aF]);
  const newman = useMemo(() => {
    if (!aN) return null;
    const m = coordenadas3DEstereo(aN.molecula).molecula;
    const e = enlaceCentral(m);
    return e ? proyeccionNewman(m, e[0], e[1]) : null;
  }, [aN]);
  const serie = fischer ? serieDL(fischer) : null;
  // Diedro entre los grupos de referencia: en el dibujo, el k-ésimo sustituyente va a k·120° (delante) y a φ + k·120° (detrás)
  const referencia = useMemo(() => {
    if (!newman) return null;
    const [delante, detras] = [[...newman.delante].sort((a, b) => a.angulo - b.angulo), [...newman.detras].sort((a, b) => a.angulo - b.angulo)];
    const [kd, kt] = [indiceReferencia(delante), indiceReferencia(detras)];
    return { delante: delante[kd]!.texto, detras: detras[kt]!.texto, desfase: (kt - kd) * 120 };
  }, [newman]);
  const diedro = referencia ? (((phi + referencia.desfase) % 360) + 360) % 360 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3 text-sm">
        <h3 className="text-base font-semibold">Proyección de Fischer</h3>
        <SelectorEjemplo etiqueta="Molécula" ejemplos={EJEMPLOS_FISCHER} indice={iF} alElegir={setIF} />
        <div className="flex flex-wrap items-start gap-4">
          {fischer ? <FischerSVG f={fischer} titulo={ejF.nombre} /> : <p className="text-texto-suave">Esta molécula no tiene una cadena que se pueda proyectar.</p>}
          <Figura2D R={R} smiles={ejF.smiles} titulo={ejF.nombre} ancho={220} alto={160} notas={Object.fromEntries((aF?.centros ?? []).map((c) => [c.atomo, c.descriptor ?? '?']))} />
        </div>
        <ul className="list-disc space-y-1 pl-5">
          <li>La cadena carbonada va en vertical, con el carbono más oxidado arriba.</li>
          <li>Cada cruce es un carbono: los enlaces horizontales salen hacia el observador y los verticales se alejan.</li>
          {serie && (
            <li>
              Serie <strong>{serie}</strong>: en el centro estereogénico más bajo, el OH (o NH₂) queda a la {serie === 'D' ? 'derecha' : 'izquierda'}.
            </li>
          )}
          <li>Girarla 180° en el plano no cambia la molécula; girarla 90° o intercambiar dos sustituyentes de un centro invierte su configuración.</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm">
        <h3 className="text-base font-semibold">Proyección de Newman</h3>
        <SelectorEjemplo etiqueta="Molécula (se mira a lo largo del enlace C–C central)" ejemplos={EJEMPLOS_NEWMAN} indice={iN} alElegir={setIN} />
        {newman ? (
          <>
            <NewmanSVG n={newman} phi={phi} titulo={ejN.nombre} />
            <Slider etiqueta="Giro del carbono trasero (φ)" valor={phi} min={0} max={360} paso={15} unidad="°" alCambiar={setPhi} />
            <p aria-live="polite">
              Diedro {referencia!.delante}–C–C–{referencia!.detras} = {diedro}°: conformación <strong>{conformacion(diedro)}</strong>.
            </p>
          </>
        ) : (
          <p className="text-texto-suave">No hay un enlace C–C sencillo para proyectar.</p>
        )}
        <ul className="list-disc space-y-1 pl-5">
          <li>El carbono de delante es el punto central; el de atrás, el círculo.</li>
          <li>Girar el enlace cambia la conformación, no la configuración: el orden de giro de los sustituyentes de cada carbono se mantiene.</li>
          <li>Las conformaciones alternadas son más estables que las eclipsadas (menor tensión torsional).</li>
        </ul>
      </section>
    </div>
  );
}
