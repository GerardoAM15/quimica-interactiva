import { useEffect, useId, useRef, useState } from 'react';
import type Fuse from 'fuse.js';
import { ELEMENTOS, type Elemento } from '@/chem/elements';

interface Props {
  alElegir: (z: number) => void;
  /** Conjunto de Z que coinciden (null = sin filtro), para atenuar el resto en la tabla. */
  alResaltar: (zs: Set<number> | null) => void;
}

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Búsqueda difusa por nombre (español/inglés), símbolo, número atómico o alias. Fuse.js se carga al enfocar. */
export function BuscadorElementos({ alElegir, alResaltar }: Props) {
  const [texto, setTexto] = useState('');
  const [fuse, setFuse] = useState<Fuse<Elemento & { nombreSinTildes: string }> | null>(null);
  const [resultados, setResultados] = useState<Elemento[]>([]);
  const [activo, setActivo] = useState(0);
  const idLista = useId();
  const cargando = useRef(false);

  const cargarFuse = () => {
    if (fuse || cargando.current) return;
    cargando.current = true;
    void import('fuse.js').then(({ default: F }) => {
      const datos = ELEMENTOS.map((e) => ({ ...e, nombreSinTildes: quitarTildes(e.nombre) }));
      setFuse(
        new F(datos, {
          keys: [
            { name: 'simbolo', weight: 3 },
            { name: 'nombreSinTildes', weight: 2 },
            { name: 'nombre', weight: 2 },
            { name: 'nombreIngles', weight: 1 },
            { name: 'alias', weight: 1 },
          ],
          threshold: 0.35,
          ignoreLocation: true,
        }),
      );
    });
  };

  useEffect(() => {
    const t = texto.trim();
    if (!t) {
      setResultados([]);
      alResaltar(null);
      return;
    }
    let lista: Elemento[];
    if (/^\d+$/.test(t)) {
      const z = Number(t);
      lista = z >= 1 && z <= 118 ? [ELEMENTOS[z - 1]!] : [];
    } else if (fuse) {
      const exacto = ELEMENTOS.find((e) => e.simbolo.toLowerCase() === t.toLowerCase());
      const difusos = fuse.search(quitarTildes(t)).map((r) => ELEMENTOS[r.item.z - 1]!);
      lista = exacto ? [exacto, ...difusos.filter((e) => e !== exacto)] : difusos;
    } else lista = [];
    lista = lista.slice(0, 8);
    setResultados(lista);
    setActivo(0);
    alResaltar(new Set(lista.map((e) => e.z)));
  }, [texto, fuse, alResaltar]);

  const elegir = (e: Elemento) => {
    alElegir(e.z);
    setTexto('');
  };

  return (
    <div className="relative w-full max-w-xs">
      <label htmlFor={`${idLista}-in`} className="mb-1 block text-sm font-medium">
        Buscar elemento
      </label>
      <input
        id={`${idLista}-in`}
        type="search"
        role="combobox"
        aria-expanded={resultados.length > 0}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={resultados[activo] ? `${idLista}-${resultados[activo]!.z}` : undefined}
        placeholder="hierro, Fe, 26, tungsteno…"
        value={texto}
        onFocus={cargarFuse}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActivo((a) => Math.min(a + 1, resultados.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActivo((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && resultados[activo]) {
            e.preventDefault();
            elegir(resultados[activo]!);
          } else if (e.key === 'Escape') setTexto('');
        }}
        className="w-full rounded-md border border-borde bg-superficie px-3 py-1.5"
      />
      {resultados.length > 0 && (
        <ul id={idLista} role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-borde bg-superficie shadow-xl">
          {resultados.map((e, i) => (
            <li
              key={e.z}
              id={`${idLista}-${e.z}`}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(ev) => {
                ev.preventDefault();
                elegir(e);
              }}
              className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm ${i === activo ? 'bg-superficie-2' : ''}`}
            >
              <span className="w-7 font-bold">{e.simbolo}</span>
              <span className="flex-1">{e.nombre}</span>
              <span className="text-xs text-texto-suave tabular-nums">Z = {e.z}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
