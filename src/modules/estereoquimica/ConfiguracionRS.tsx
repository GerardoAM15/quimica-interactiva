import { lazy, Suspense, useMemo, useState } from 'react';
import type { RDKit } from '@/lib/rdkit';
import { explicarPrioridad, type CentroEstereo } from '@/chem/estereo';
import { textoGrupo } from '@/chem/estereo';
import type { Molecula } from '@/chem/molecula';
import { Cargando } from '@/components/Cargando';
import { PasoAPaso, type Paso } from '@/components/PasoAPaso';
import { EJEMPLOS_RS } from '@/data/estereo';
import { claseInput, COLORES_CENTRO, cssColor, Figura2D, SelectorEjemplo, TEXTO_TIPO, useAnalisis } from './comun';

const Modelo3D = lazy(() => import('./Modelo3D'));

/** Pasos de la asignación R/S de un centro con las reglas de Cahn-Ingold-Prelog. */
function pasosRS(mol: Molecula, c: CentroEstereo): Paso[] {
  const grupos = c.sustituyentes.map((s) => textoGrupo(mol, s.atomo, c.atomo));
  const pasos: Paso[] = [
    {
      titulo: 'Ordenar los cuatro sustituyentes por número atómico (regla 1 de CIP)',
      detalle: (
        <ol className="list-decimal space-y-1 pl-5">
          {c.sustituyentes.map((s, k) => (
            <li key={s.atomo}>
              <strong>{grupos[k]}</strong>
              {k > 0 && <span className="text-texto-suave"> — {explicarPrioridad(c.sustituyentes[k - 1]!, s).replace(/\.$/, '')}: va después de {grupos[k - 1]}.</span>}
            </li>
          ))}
        </ol>
      ),
    },
    { titulo: 'Orientar la molécula', detalle: `Se mira con el sustituyente de menor prioridad (${grupos[3]}) apuntando hacia atrás, lejos del observador.` },
  ];
  if (c.descriptor) {
    pasos.push({
      titulo: 'Recorrer 1 → 2 → 3',
      detalle: `De ${grupos[0]} a ${grupos[1]} a ${grupos[2]} el giro es ${c.descriptor === 'R' ? 'horario: configuración R (rectus)' : 'antihorario: configuración S (sinister)'}.`,
    });
  } else {
    pasos.push({ titulo: 'Configuración sin especificar', detalle: 'El dibujo no indica con cuñas qué sustituyente va hacia delante o hacia atrás, así que no se puede decidir entre R y S.' });
  }
  return pasos;
}

export default function ConfiguracionRS({ R }: { R: RDKit }) {
  const [indice, setIndice] = useState(0);
  const [propio, setPropio] = useState('');
  const [ver3D, setVer3D] = useState(false);
  const ejemplo = EJEMPLOS_RS[indice]!;
  const smiles = propio.trim() || ejemplo.smiles;
  const { analisis, error } = useAnalisis(R, smiles);
  const colores = useMemo(() => Object.fromEntries((analisis?.centros ?? []).map((c, k) => [c.atomo, COLORES_CENTRO[k % COLORES_CENTRO.length]!])), [analisis]);
  const notas = useMemo(() => Object.fromEntries((analisis?.centros ?? []).filter((c) => c.descriptor).map((c) => [c.atomo, c.descriptor!])), [analisis]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <SelectorEjemplo
          etiqueta="Molécula de ejemplo"
          ejemplos={EJEMPLOS_RS}
          indice={indice}
          alElegir={(i) => {
            setIndice(i);
            setPropio('');
          }}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-texto-suave">O escribe un SMILES con estereoquímica (@, @@)</span>
          <input value={propio} onChange={(e) => setPropio(e.target.value)} placeholder="C[C@@H](C(=O)O)N" className={`${claseInput} w-64 max-w-full font-mono`} />
        </label>
      </div>
      {!propio.trim() && ejemplo.nota && <p className="text-sm text-texto-suave">{ejemplo.nota}</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {analisis && (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="space-y-2">
            <Figura2D R={R} smiles={smiles} titulo={propio.trim() ? 'la molécula escrita' : ejemplo.nombre} colores={colores} notas={notas} />
            <p className="text-xs text-texto-suave">Cuña llena: hacia el observador. Cuña rayada: hacia atrás. Los centros estereogénicos están resaltados con su descriptor.</p>
            <button type="button" onClick={() => setVer3D((v) => !v)} aria-expanded={ver3D} className="rounded-md border border-borde px-3 py-1 text-sm hover:bg-superficie-2">
              {ver3D ? 'Ocultar 3D' : 'Ver en 3D'}
            </button>
            {ver3D && (
              <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
                <Modelo3D molecula={analisis.molecula} seleccion={analisis.centros.map((c) => c.atomo)} titulo={ejemplo.nombre} />
              </Suspense>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <section className="rounded-lg border border-borde bg-superficie-2 p-3">
              <h3 className="font-semibold">
                {analisis.centros.length === 0 ? 'Sin centros estereogénicos' : `${analisis.centros.length} ${analisis.centros.length === 1 ? 'centro estereogénico' : 'centros estereogénicos'}`}
              </h3>
              <p className="mt-1">{TEXTO_TIPO[analisis.tipo]}</p>
              {analisis.centros.length === 0 && <p className="mt-1 text-texto-suave">Ningún carbono tiene cuatro sustituyentes distintos.</p>}
            </section>
            {analisis.centros.map((c, k) => (
              <section key={c.atomo} className="rounded-lg border border-borde p-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: cssColor(COLORES_CENTRO[k % COLORES_CENTRO.length]!) }} aria-hidden />
                  Carbono con {c.sustituyentes.map((s) => textoGrupo(analisis.molecula, s.atomo, c.atomo)).join(', ')}
                  {c.descriptor && <span className="rounded bg-superficie-2 px-2 py-0.5">({c.descriptor})</span>}
                </h3>
                <PasoAPaso pasos={pasosRS(analisis.molecula, c)} abierto={k === 0} />
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
