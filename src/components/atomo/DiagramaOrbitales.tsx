import { diagramaSubnivel, nombreSubnivel, type Subnivel } from '@/chem/configuracion';

interface Props {
  configuracion: Subnivel[];
  /** Resalta el subnivel del electrón diferenciador. */
  resaltarUltimo?: boolean;
  /** Muestra los valores de mₗ debajo de cada casilla. */
  mostrarMl?: boolean;
}

/**
 * Diagrama de orbitales: una casilla por orbital (2l + 1 por subnivel), con flechas ↑↓
 * colocadas según la regla de Hund y el principio de exclusión de Pauli.
 */
export function DiagramaOrbitales({ configuracion, resaltarUltimo = false, mostrarMl = false }: Props) {
  const ultimo = configuracion.at(-1);
  const resumen = configuracion.map((s) => `${nombreSubnivel(s.n, s.l)} con ${s.e} electrones`).join(', ');
  return (
    <div className="overflow-x-auto" role="img" aria-label={`Diagrama de orbitales: ${resumen}`}>
      <div className="flex min-w-max flex-wrap gap-x-4 gap-y-3">
        {configuracion.map((s) => {
          const destacado = resaltarUltimo && s === ultimo;
          return (
            <div key={`${s.n}${s.l}`} className="text-center">
              <div
                className={`flex rounded ${destacado ? 'ring-2 ring-acento ring-offset-2 ring-offset-superficie' : ''}`}
                aria-hidden
              >
                {diagramaSubnivel(s.l, s.e).map((o) => (
                  <div
                    key={o.m}
                    className="-ml-px flex h-9 w-8 items-center justify-center border border-texto-suave/70 font-mono text-base leading-none first:ml-0"
                  >
                    <span className="text-sky-500 dark:text-sky-300">{o.electrones[0] ?? ''}</span>
                    <span className="text-pink-600 dark:text-pink-300">{o.electrones[1] ?? ''}</span>
                  </div>
                ))}
              </div>
              {mostrarMl && (
                <div className="flex text-[10px] text-texto-suave" aria-hidden>
                  {diagramaSubnivel(s.l, 0).map((o) => (
                    <span key={o.m} className="w-8 tabular-nums">
                      {o.m > 0 ? `+${o.m}` : o.m}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-0.5 text-xs font-medium">
                {nombreSubnivel(s.n, s.l)}
                <sup>{s.e}</sup>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
