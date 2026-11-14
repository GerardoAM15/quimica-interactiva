import { useMemo } from 'react';
import { analizarEstructura, smilesCanonico, type RDKit } from '@/lib/rdkit';
import { centrosEstereo, doblesEnlacesEstereo, tipoQuiralidad, type CentroEstereo, type DobleEnlaceEstereo, type TipoQuiralidad } from '@/chem/estereo';
import type { Molecula } from '@/chem/molecula';
import { svgEstructura } from '@/components/molecula/VistaOrganica';
import type { EjemploEstereo } from '@/data/estereo';

export const claseInput = 'rounded-md border border-borde bg-superficie px-2 py-1.5';

/** Colores para distinguir cada centro en el dibujo y en su tarjeta (RGB 0–1 para RDKit). */
export const COLORES_CENTRO: [number, number, number][] = [
  [1, 0.72, 0.3],
  [0.45, 0.78, 1],
  [0.6, 0.9, 0.55],
  [0.95, 0.6, 0.85],
  [0.8, 0.75, 1],
];
export const cssColor = (c: [number, number, number]) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`;

/** SMILES de la imagen especular: se invierte cada centro tetraédrico (@ ↔ @@). */
export const espejoSmiles = (smiles: string) => smiles.replace(/@@|@/g, (m) => (m === '@@' ? '@' : '@@'));

export interface Analisis {
  /** Molécula con H explícitos, 2D con cuñas. */
  molecula: Molecula;
  centros: CentroEstereo[];
  dobles: DobleEnlaceEstereo[];
  canonico: string;
  tipo: TipoQuiralidad;
  /** «2S,3R» (numeración por posición del átomo en el SMILES). */
  descriptores: string;
}

/** Analiza un SMILES con RDKit (estructura) y `chem/estereo` (configuración). Lanza si no es válido. */
export function analizar(R: RDKit, smiles: string): Analisis {
  const { molecula, smilesCanonico: canonico } = analizarEstructura(R, smiles);
  const centros = centrosEstereo(molecula);
  const dobles = doblesEnlacesEstereo(molecula);
  // Quiralidad: ¿la imagen especular es la misma estructura? (comparación de estructuras canónicas)
  const igualAlEspejo = smilesCanonico(R, espejoSmiles(smiles)) === canonico;
  return {
    molecula,
    centros,
    dobles,
    canonico,
    tipo: tipoQuiralidad(centros.length, igualAlEspejo),
    descriptores: centros.map((c) => `${c.atomo + 1}${c.descriptor ?? '?'}`).join(','),
  };
}

export function useAnalisis(R: RDKit | null, smiles: string): { analisis: Analisis | null; error: string | null } {
  return useMemo(() => {
    if (!R || !smiles.trim()) return { analisis: null, error: null };
    try {
      return { analisis: analizar(R, smiles.trim()), error: null };
    } catch (e) {
      return { analisis: null, error: (e as Error).message };
    }
  }, [R, smiles]);
}

/** Dibujo 2D de RDKit con átomos resaltados y notas (descriptores). */
export function Figura2D({ R, smiles, titulo, colores, notas, ancho = 320, alto = 220 }: { R: RDKit; smiles: string; titulo: string; colores?: Record<number, [number, number, number]>; notas?: Record<number, string>; ancho?: number; alto?: number }) {
  const svg = useMemo(() => svgEstructura(R, smiles, { ancho, alto, colores, notas }), [R, smiles, ancho, alto, colores, notas]);
  if (!svg) return <p className="text-sm text-error">Estructura no válida.</p>;
  return (
    <figure className="inline-block max-w-full rounded-md bg-white p-1" role="img" aria-label={`Fórmula estructural de ${titulo}`}>
      <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: ancho, maxWidth: '100%' }} className="[&_svg]:h-auto [&_svg]:max-w-full" />
    </figure>
  );
}

/** Lista desplegable de ejemplos. */
export function SelectorEjemplo({ etiqueta, ejemplos, indice, alElegir }: { etiqueta: string; ejemplos: EjemploEstereo[]; indice: number; alElegir: (i: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-texto-suave">{etiqueta}</span>
      <select value={indice} onChange={(e) => alElegir(Number(e.target.value))} className={`${claseInput} w-full max-w-sm`}>
        {ejemplos.map((x, i) => (
          <option key={x.smiles} value={i}>
            {x.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

export const TEXTO_TIPO: Record<TipoQuiralidad, string> = {
  quiral: 'Quiral: no se superpone con su imagen especular; existe como par de enantiómeros.',
  meso: 'Forma meso: tiene centros estereogénicos, pero un plano de simetría interno la hace aquiral (se superpone con su imagen especular).',
  aquiral: 'Aquiral: se superpone con su imagen especular y no desvía la luz polarizada.',
};
