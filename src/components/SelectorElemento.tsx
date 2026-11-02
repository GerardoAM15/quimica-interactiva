import { useId } from 'react';
import { ELEMENTOS } from '@/chem/elements';

interface Props {
  z: number;
  alCambiar: (z: number) => void;
  etiqueta?: string;
  zMax?: number;
}

/** Lista desplegable de elementos («26 · Fe · Hierro»). */
export function SelectorElemento({ z, alCambiar, etiqueta = 'Elemento', zMax = 118 }: Props) {
  const id = useId();
  return (
    <div className="text-sm">
      <label htmlFor={id} className="mb-1 block font-medium">
        {etiqueta}
      </label>
      <select id={id} value={z} onChange={(e) => alCambiar(Number(e.target.value))} className="w-full max-w-[16rem] rounded-md border border-borde bg-superficie px-2 py-1.5">
        {ELEMENTOS.filter((e) => e.z <= zMax).map((e) => (
          <option key={e.z} value={e.z}>
            {e.z} · {e.simbolo} · {e.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
