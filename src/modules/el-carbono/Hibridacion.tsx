import { useEffect, useState } from 'react';
import { angulo, pos, vecindario, type Molecula } from '@/chem/molecula';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula } from '@/components/molecula/Molecula3D';
import { cargarDelCatalogo } from '@/components/molecula/cargarMolecula';

/** Moléculas modelo de cada hibridación (conformeros 3D de PubChem del catálogo). */
const CASOS = [
  { cid: 297, nombre: 'metano', formula: 'CH₄', hib: 'sp³', geo: 'tetraédrica', ideal: 109.5, enlaces: '4 σ (C–H)' },
  { cid: 6325, nombre: 'eteno', formula: 'C₂H₄', hib: 'sp²', geo: 'trigonal plana', ideal: 120, enlaces: 'C=C: 1 σ + 1 π; 4 σ C–H' },
  { cid: 6326, nombre: 'etino', formula: 'C₂H₂', hib: 'sp', geo: 'lineal', ideal: 180, enlaces: 'C≡C: 1 σ + 2 π; 2 σ C–H' },
];

/** Ángulo medido en el primer carbono entre dos de sus vecinos. */
function anguloEnC(m: Molecula): number | null {
  const c = m.atomos.findIndex((a) => a.simbolo === 'C');
  const v = vecindario(m)[c]!;
  if (v.length < 2) return null;
  return angulo(pos(m.atomos[v[0]!.i]!), pos(m.atomos[c]!), pos(m.atomos[v[1]!.i]!));
}

export default function Hibridacion() {
  const [mols, setMols] = useState<(Molecula | null)[]>([null, null, null]);
  useEffect(() => {
    let vivo = true;
    CASOS.forEach((c, i) =>
      void cargarDelCatalogo(c.cid).then(({ molecula }) => vivo && setMols((s) => s.map((x, j) => (j === i ? molecula : x)))),
    );
    return () => {
      vivo = false;
    };
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CASOS.map((c, i) => {
        const m = mols[i];
        const a = m ? anguloEnC(m) : null;
        return (
          <section key={c.cid} className="rounded-lg border border-borde bg-superficie p-3 text-sm">
            <h3 className="text-lg font-semibold">
              {c.hib} · {c.nombre} ({c.formula})
            </h3>
            {m ? (
              <Escena3D descripcion={`Modelo 3D del ${c.nombre}: carbono ${c.hib}, geometría ${c.geo}`} camara={[0, 0, radioMolecula(m) * 2.8]} className="h-[220px]" autoRotar>
                <Molecula3D molecula={m} />
              </Escena3D>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-texto-suave">Cargando…</div>
            )}
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="text-texto-suave">Geometría</dt>
              <dd>{c.geo}</dd>
              <dt className="text-texto-suave">Ángulo ideal</dt>
              <dd>{c.ideal}°</dd>
              <dt className="text-texto-suave">Ángulo medido</dt>
              <dd className="tabular-nums">{a !== null ? `${a.toFixed(1)}° (conformero de PubChem)` : '—'}</dd>
              <dt className="text-texto-suave">Enlaces</dt>
              <dd>{c.enlaces}</dd>
            </dl>
          </section>
        );
      })}
    </div>
  );
}
