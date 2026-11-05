import { useEffect, useState } from 'react';
import { diedro, pos, type Molecula } from '@/chem/molecula';
import Escena3D from '@/components/escena3d/Escena3D';
import { Molecula3D, radioMolecula } from '@/components/molecula/Molecula3D';
import { cargarDelCatalogo } from '@/components/molecula/cargarMolecula';

/** cis- y trans-but-2-eno: conformeros 3D de PubChem (catálogo local). */
const CASOS = [
  { cid: 5287573, nombre: 'cis-but-2-eno', nota: 'Los dos CH₃ del mismo lado del doble enlace.' },
  { cid: 62695, nombre: 'trans-but-2-eno', nota: 'Los CH₃ en lados opuestos.' },
];

/** Diedro C–C=C–C medido sobre los cuatro carbonos de la cadena. */
function diedroCadena(m: Molecula): number | null {
  const C = m.atomos.map((a, i) => ({ a, i })).filter((x) => x.a.simbolo === 'C').map((x) => x.i);
  const e = m.enlaces.find((x) => x.orden === 2 && C.includes(x.a) && C.includes(x.b));
  if (!e) return null;
  const vecC = (u: number, otro: number) => m.enlaces.filter((x) => (x.a === u || x.b === u) && x.orden === 1).map((x) => (x.a === u ? x.b : x.a)).find((v) => v !== otro && C.includes(v));
  const a = vecC(e.a, e.b), d = vecC(e.b, e.a);
  if (a === undefined || d === undefined) return null;
  return Math.abs(diedro(pos(m.atomos[a]!), pos(m.atomos[e.a]!), pos(m.atomos[e.b]!), pos(m.atomos[d]!)));
}

export default function CisTrans3D() {
  const [mols, setMols] = useState<(Molecula | null)[]>([null, null]);
  useEffect(() => {
    let vivo = true;
    CASOS.forEach((c, i) => void cargarDelCatalogo(c.cid).then(({ molecula }) => vivo && setMols((s) => s.map((x, j) => (j === i ? molecula : x)))));
    return () => {
      vivo = false;
    };
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CASOS.map((c, i) => {
        const m = mols[i];
        const d = m ? diedroCadena(m) : null;
        return (
          <section key={c.cid} className="rounded-lg border border-borde bg-superficie p-3 text-sm">
            <h3 className="font-semibold">{c.nombre}</h3>
            {m ? (
              <Escena3D descripcion={`Modelo 3D del ${c.nombre}`} camara={[0, 0, radioMolecula(m) * 2.6]} className="h-[220px]" autoRotar>
                <Molecula3D molecula={m} />
              </Escena3D>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-texto-suave">Cargando…</div>
            )}
            <p className="mt-1">{c.nota}</p>
            <p className="text-texto-suave tabular-nums">Diedro C–C=C–C: {d !== null ? `${d.toFixed(0)}°` : '—'} (conformero de PubChem)</p>
          </section>
        );
      })}
    </div>
  );
}
