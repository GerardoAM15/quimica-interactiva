import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { BLOQUES, modulosDeBloque, moduloPorSlug, type IdBloque } from '@/modules/registro';
import { IconoChevron } from '@/components/Iconos';

interface Props {
  /** Se llama al elegir un enlace (para cerrar el panel en móvil). */
  alNavegar?: () => void;
}

/** Lista de bloques y módulos, con el bloque actual desplegado. */
export function NavegacionModulos({ alNavegar }: Props) {
  const { pathname } = useLocation();
  const slugActual = pathname.match(/^\/modulo\/([^/]+)/)?.[1];
  const bloqueActual = slugActual ? moduloPorSlug(slugActual)?.bloque : undefined;
  const [abiertos, setAbiertos] = useState<Set<IdBloque>>(() => new Set(bloqueActual ? [bloqueActual] : []));

  const alternar = (id: IdBloque) =>
    setAbiertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <nav aria-label="Módulos" className="text-sm">
      <ul className="space-y-1">
        {BLOQUES.map((b) => {
          const abierto = abiertos.has(b.id) || bloqueActual === b.id;
          const idLista = `nav-bloque-${b.id}`;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => alternar(b.id)}
                aria-expanded={abierto}
                aria-controls={idLista}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left font-medium hover:bg-superficie-2"
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded text-xs font-bold text-[#04111c]"
                  style={{ background: b.color }}
                  aria-hidden
                >
                  {b.id}
                </span>
                <span className="flex-1">{b.titulo}</span>
                <IconoChevron
                  width={16}
                  height={16}
                  className={`shrink-0 transition-transform ${abierto ? 'rotate-90' : ''}`}
                />
              </button>
              {abierto && (
                <ul id={idLista} className="mt-1 mb-2 ml-5 space-y-0.5 border-l border-borde pl-3">
                  {modulosDeBloque(b.id).map((m) => (
                    <li key={m.slug}>
                      <NavLink
                        to={`/modulo/${m.slug}`}
                        onClick={alNavegar}
                        className={({ isActive }) =>
                          `block rounded px-2 py-1.5 ${
                            isActive
                              ? 'bg-superficie-2 font-semibold text-texto'
                              : 'text-texto-suave hover:bg-superficie-2 hover:text-texto'
                          }`
                        }
                      >
                        <span className="tabular-nums">{m.numero}.</span> {m.titulo}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
