import { useId } from 'react';

interface Props {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso?: number;
  unidad?: string;
  alCambiar: (v: number) => void;
  formato?: (v: number) => string;
}

/** Control deslizante con etiqueta y valor visible. */
export function Slider({ etiqueta, valor, min, max, paso = 1, unidad = '', alCambiar, formato }: Props) {
  const id = useId();
  const texto = formato ? formato(valor) : String(valor);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium">
          {etiqueta}
        </label>
        <output htmlFor={id} className="tabular-nums text-texto-suave">
          {texto}
          {unidad && ` ${unidad}`}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => alCambiar(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--acento)]"
      />
    </div>
  );
}
