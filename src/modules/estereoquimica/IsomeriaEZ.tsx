import { useMemo, useState } from 'react';
import type { RDKit } from '@/lib/rdkit';
import { explicarPrioridad, textoGrupo, type DobleEnlaceEstereo } from '@/chem/estereo';
import type { Molecula } from '@/chem/molecula';
import { PasoAPaso, type Paso } from '@/components/PasoAPaso';
import { EJEMPLOS_EZ } from '@/data/estereo';
import { claseInput, COLORES_CENTRO, cssColor, Figura2D, SelectorEjemplo, useAnalisis } from './comun';

/** Pasos de la asignación E/Z: prioridad en cada carbono y comparación de lados. */
function pasosEZ(mol: Molecula, d: DobleEnlaceEstereo): Paso[] {
  const lado = (centro: number, sus: DobleEnlaceEstereo['sustituyentesA'], nombre: string): Paso => {
    const [alto, bajo] = [textoGrupo(mol, sus[0]!.atomo, centro), textoGrupo(mol, sus[1]!.atomo, centro)];
    return {
      titulo: `Carbono ${nombre}: ${alto} tiene prioridad sobre ${bajo}`,
      detalle: explicarPrioridad(sus[0]!, sus[1]!),
    };
  };
  const pasos = [lado(d.a, d.sustituyentesA, 'izquierdo del C=C'), lado(d.b, d.sustituyentesB, 'derecho del C=C')];
  const [ga, gb] = [textoGrupo(mol, d.sustituyentesA[0]!.atomo, d.a), textoGrupo(mol, d.sustituyentesB[0]!.atomo, d.b)];
  pasos.push(
    d.descriptor
      ? {
          titulo: 'Comparar los lados',
          detalle:
            d.descriptor === 'Z'
              ? `Los sustituyentes prioritarios (${ga} y ${gb}) están al mismo lado del doble enlace: Z (del alemán zusammen, «juntos»).`
              : `Los sustituyentes prioritarios (${ga} y ${gb}) están en lados opuestos del doble enlace: E (del alemán entgegen, «opuestos»).`,
        }
      : { titulo: 'Geometría sin especificar', detalle: 'El SMILES no indica (con / y \\) de qué lado está cada sustituyente.' },
  );
  return pasos;
}

export default function IsomeriaEZ({ R }: { R: RDKit }) {
  const [indice, setIndice] = useState(0);
  const [propio, setPropio] = useState('');
  const ejemplo = EJEMPLOS_EZ[indice]!;
  const smiles = propio.trim() || ejemplo.smiles;
  const { analisis, error } = useAnalisis(R, smiles);
  const colores = useMemo(
    () => Object.fromEntries((analisis?.dobles ?? []).flatMap((d, k) => [d.a, d.b].map((i) => [i, COLORES_CENTRO[k % COLORES_CENTRO.length]!]))),
    [analisis],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <SelectorEjemplo
          etiqueta="Alqueno de ejemplo"
          ejemplos={EJEMPLOS_EZ}
          indice={indice}
          alElegir={(i) => {
            setIndice(i);
            setPropio('');
          }}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-texto-suave">O escribe un SMILES con / y \</span>
          <input value={propio} onChange={(e) => setPropio(e.target.value)} placeholder="C/C=C/C" className={`${claseInput} w-64 max-w-full font-mono`} />
        </label>
      </div>
      {!propio.trim() && ejemplo.nota && <p className="text-sm text-texto-suave">{ejemplo.nota}</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      {analisis && (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Figura2D R={R} smiles={smiles} titulo={propio.trim() ? 'el alqueno escrito' : ejemplo.nombre} colores={colores} />
          <div className="space-y-3 text-sm">
            {analisis.dobles.length === 0 && (
              <section className="rounded-lg border border-borde bg-superficie-2 p-3">
                <h3 className="font-semibold">Sin isomería E/Z</h3>
                <p className="mt-1">Para que exista, cada carbono del doble enlace debe llevar dos sustituyentes distintos (y el doble enlace no puede estar en un anillo pequeño).</p>
              </section>
            )}
            {analisis.dobles.map((d, k) => (
              <section key={`${d.a}-${d.b}`} className="rounded-lg border border-borde p-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: cssColor(COLORES_CENTRO[k % COLORES_CENTRO.length]!) }} aria-hidden />
                  Doble enlace C=C
                  {d.descriptor && <span className="rounded bg-superficie-2 px-2 py-0.5">({d.descriptor})</span>}
                </h3>
                <PasoAPaso pasos={pasosEZ(analisis.molecula, d)} abierto={k === 0} />
              </section>
            ))}
            <p className="text-texto-suave">
              cis/trans solo sirve cuando hay un sustituyente igual en cada carbono. E/Z funciona siempre, porque usa las prioridades de Cahn-Ingold-Prelog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
