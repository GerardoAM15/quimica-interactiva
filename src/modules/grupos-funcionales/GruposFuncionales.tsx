import { useMemo, useState } from 'react';
import { claseFuncional, nombrarOrganico } from '@/chem/nomenclatura/organica';
import { Pestanas } from '@/components/Pestanas';
import { Teoria } from '@/components/Teoria';
import { Formula } from '@/components/Formula';
import { NombreEstructura, type Ejemplo } from '@/components/organica/NombreEstructura';
import { grafoDesdeSmiles, useRDKit, VistaOrganica } from '@/components/molecula/VistaOrganica';

type Seccion = 'tabla' | 'nomenclatura' | 'identificar';
const SECCIONES = [
  { id: 'tabla', titulo: 'Grupos y prioridad' },
  { id: 'nomenclatura', titulo: 'Nomenclatura IUPAC' },
  { id: 'identificar', titulo: 'Identificar el grupo' },
] as const;

/** Grupos funcionales en orden de prioridad decreciente (como sufijo). */
const GRUPOS = [
  { clase: 'acido', nombre: 'Ácido carboxílico', general: 'R–COOH', sufijo: 'ácido …-oico', prefijo: 'carboxi-', ejemplo: 'CCC(O)=O' },
  { clase: 'ester', nombre: 'Éster', general: 'R–COO–R′', sufijo: '…-oato de …-ilo', prefijo: '—', ejemplo: 'CCOC(C)=O' },
  { clase: 'amida', nombre: 'Amida', general: 'R–CONH₂', sufijo: '-amida', prefijo: 'carbamoil-', ejemplo: 'CCC(N)=O' },
  { clase: 'nitrilo', nombre: 'Nitrilo', general: 'R–C≡N', sufijo: '-nitrilo', prefijo: 'ciano-', ejemplo: 'CCC#N' },
  { clase: 'aldehido', nombre: 'Aldehído', general: 'R–CHO', sufijo: '-al', prefijo: 'oxo- / formil-', ejemplo: 'CCCC=O' },
  { clase: 'cetona', nombre: 'Cetona', general: 'R–CO–R′', sufijo: '-ona', prefijo: 'oxo-', ejemplo: 'CCC(C)=O' },
  { clase: 'alcohol', nombre: 'Alcohol', general: 'R–OH', sufijo: '-ol', prefijo: 'hidroxi-', ejemplo: 'CC(O)C' },
  { clase: 'amina', nombre: 'Amina', general: 'R–NH₂', sufijo: '-amina', prefijo: 'amino-', ejemplo: 'CCCN' },
  { clase: 'eter', nombre: 'Éter', general: 'R–O–R′', sufijo: '—', prefijo: 'alcoxi- (metoxi, etoxi…)', ejemplo: 'CCOC' },
  { clase: 'halogenuro', nombre: 'Halogenuro de alquilo', general: 'R–X', sufijo: '—', prefijo: 'fluoro-, cloro-, bromo-, yodo-', ejemplo: 'CC(Cl)C' },
];

const EJEMPLOS: Ejemplo[] = [
  { tipo: 'alcohol', smiles: 'CCC(O)CC' },
  { tipo: 'diol', smiles: 'CC(O)CO' },
  { tipo: 'alcohol insaturado', smiles: 'C=CCCO' },
  { tipo: 'éter', smiles: 'CCCOCC' },
  { tipo: 'aldehído', smiles: 'CC(C)CC=O' },
  { tipo: 'cetona', smiles: 'CCC(=O)C(C)C' },
  { tipo: 'cetona cíclica', smiles: 'O=C1CCCC1' },
  { tipo: 'ácido', smiles: 'CC(C)C(O)=O' },
  { tipo: 'ácido con sustituyente', smiles: 'CC(O)CC(O)=O' },
  { tipo: 'diácido', smiles: 'OC(=O)CCCC(O)=O' },
  { tipo: 'éster', smiles: 'CCCC(=O)OC' },
  { tipo: 'amina', smiles: 'CCC(N)C' },
  { tipo: 'amina secundaria', smiles: 'CCCNC' },
  { tipo: 'amida', smiles: 'CCCC(N)=O' },
  { tipo: 'amida N-sustituida', smiles: 'CCC(=O)NC' },
  { tipo: 'nitrilo', smiles: 'CC(C)C#N' },
  { tipo: 'cetona + alcohol', smiles: 'CC(=O)CC(C)O' },
  { tipo: 'aldehído aromático', smiles: 'O=Cc1ccccc1' },
];

function Tabla() {
  const [sel, setSel] = useState(0);
  const g = GRUPOS[sel]!;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px] text-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-texto-suave">
              <th className="pr-3 font-medium">Prioridad</th>
              <th className="pr-3 font-medium">Función</th>
              <th className="pr-3 font-medium">Fórmula</th>
              <th className="pr-3 font-medium">Sufijo</th>
              <th className="pr-3 font-medium">Prefijo</th>
            </tr>
          </thead>
          <tbody>
            {GRUPOS.map((x, i) => (
              <tr key={x.clase} className={`cursor-pointer border-t border-borde ${i === sel ? 'bg-acento/10' : 'hover:bg-superficie-2'}`} onClick={() => setSel(i)}>
                <td className="py-1.5 pr-3 tabular-nums">{x.sufijo === '—' ? '—' : i + 1}</td>
                <td className="pr-3">
                  <button type="button" className="text-left font-medium" onClick={() => setSel(i)}>
                    {x.nombre}
                  </button>
                </td>
                <td className="pr-3">{x.general}</td>
                <td className="pr-3">{x.sufijo}</td>
                <td className="pr-3">{x.prefijo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-texto-suave">
          Si hay varios grupos, el de mayor prioridad va como sufijo y los demás como prefijos. Éteres y halogenuros solo se nombran como prefijos.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Ejemplo: {g.nombre.toLowerCase()}</h3>
        <EjemploNombrado smiles={g.ejemplo} />
      </div>
    </div>
  );
}

function EjemploNombrado({ smiles }: { smiles: string }) {
  const { R } = useRDKit();
  const nombre = useMemo(() => (R ? nombrarOrganico(grafoDesdeSmiles(R, smiles)).nombre : ''), [R, smiles]);
  return (
    <div>
      <p className="text-lg">{nombre}</p>
      <VistaOrganica smiles={smiles} titulo={nombre} ancho={280} alto={190} />
    </div>
  );
}

const OPCIONES = GRUPOS.filter((g) => g.clase !== 'halogenuro');
const ETIQUETA: Record<string, string> = Object.fromEntries(GRUPOS.map((g) => [g.clase, g.nombre]));

function Identificar() {
  const { R } = useRDKit();
  const preguntas = EJEMPLOS.filter((e) => !e.tipo.includes('+') && !e.tipo.includes('aromático'));
  const [k, setK] = useState(0);
  const [resp, setResp] = useState<string | null>(null);
  const [puntos, setPuntos] = useState({ bien: 0, total: 0 });
  const e = preguntas[k % preguntas.length]!;
  const correcta = useMemo(() => (R ? claseFuncional(grafoDesdeSmiles(R, e.smiles)) : null), [R, e.smiles]);
  const elegir = (c: string) => {
    if (resp) return;
    setResp(c);
    setPuntos((p) => ({ bien: p.bien + (c === correcta ? 1 : 0), total: p.total + 1 }));
  };
  return (
    <div className="grid gap-5 lg:grid-cols-2 text-sm">
      <VistaOrganica smiles={e.smiles} titulo="estructura" con3D={false} />
      <div className="space-y-3">
        <p>¿Qué grupo funcional principal tiene esta molécula?</p>
        <div className="grid grid-cols-2 gap-2">
          {OPCIONES.map((o) => {
            const estado = resp ? (o.clase === correcta ? 'border-exito bg-exito/10' : o.clase === resp ? 'border-error bg-error/10' : 'border-borde') : 'border-borde hover:bg-superficie-2';
            return (
              <button key={o.clase} type="button" onClick={() => elegir(o.clase)} className={`rounded-md border px-3 py-2 text-left ${estado}`} aria-pressed={resp === o.clase}>
                {o.nombre} <span className="text-texto-suave">{o.general}</span>
              </button>
            );
          })}
        </div>
        {resp && (
          <p aria-live="polite" className={resp === correcta ? 'font-semibold text-exito' : 'text-error'}>
            {resp === correcta ? '¡Correcto!' : `Es ${ETIQUETA[correcta ?? ''] ?? correcta}.`}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setK((x) => x + 1 + Math.floor(Math.random() * (preguntas.length - 1)));
              setResp(null);
            }}
            className="rounded-md border border-borde px-3 py-1.5 hover:bg-superficie-2"
          >
            Siguiente
          </button>
          <span className="text-texto-suave tabular-nums">
            {puntos.bien} / {puntos.total}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GruposFuncionales() {
  const [s, setS] = useState<Seccion>('tabla');
  return (
    <div>
      <div className="mb-4">
        <Teoria titulo="Teoría: grupos funcionales">
          <div className="space-y-3">
            <p>Un grupo funcional es el átomo o grupo de átomos que da a la molécula sus propiedades químicas características.</p>
            <p>
              <strong>Pasos para nombrar:</strong> 1) identificar el grupo principal (el de mayor prioridad); 2) elegir la cadena principal que lo contenga (y el mayor
              número de ellos, luego los enlaces múltiples y la mayor longitud); 3) numerar para darle el localizador más bajo; 4) citar los demás grupos como prefijos en
              orden alfabético.
            </p>
            <Formula tex="\text{propan-2-ol}\qquad \text{butan-2-ona}\qquad \text{ácido 3-hidroxibutanoico}\qquad \text{etanoato de etilo}" bloque />
            <p>Los aldehídos, ácidos, amidas, nitrilos y ésteres están siempre en el extremo de la cadena: su carbono es el C1 y no se escribe el localizador.</p>
          </div>
        </Teoria>
      </div>
      <Pestanas pestanas={SECCIONES} activa={s} alCambiar={setS} etiqueta="Grupos funcionales">
        {s === 'tabla' && <Tabla />}
        {s === 'nomenclatura' && <NombreEstructura ejemplos={EJEMPLOS} nombreInicial="ácido 3-hidroxibutanoico" />}
        {s === 'identificar' && <Identificar />}
      </Pestanas>
    </div>
  );
}
