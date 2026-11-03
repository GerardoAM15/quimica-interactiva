import { useEffect, useState } from 'react';
import { cargarRDKit, analizarEstructura } from '@/lib/rdkit';

interface Props {
  /** SMILES o molfile. */
  estructura: string;
  titulo: string;
  ancho?: number;
  alto?: number;
}

/** Fórmula estructural 2D dibujada por RDKit (cargado bajo demanda). Se muestra sobre fondo claro, como en papel. */
export function Estructura2D({ estructura, titulo, ancho = 320, alto = 220 }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    setSvg(null);
    setError(null);
    cargarRDKit()
      .then((R) => {
        if (!vivo) return;
        setSvg(analizarEstructura(R, estructura, { ancho, alto }).svg);
      })
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, [estructura, ancho, alto]);

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!svg) return <div className="flex h-[140px] items-center text-sm text-texto-suave">Dibujando estructura…</div>;
  return (
    <figure className="inline-block rounded-md bg-white p-1" role="img" aria-label={`Fórmula estructural de ${titulo}`}>
      <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: ancho, maxWidth: '100%' }} className="[&_svg]:h-auto [&_svg]:max-w-full" />
    </figure>
  );
}
