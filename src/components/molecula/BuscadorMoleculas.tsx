import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type Fuse from 'fuse.js';
import { CATALOGO, type EntradaCatalogo } from './cargarMolecula';

interface Props {
  alElegir: (m: EntradaCatalogo) => void;
  etiqueta?: string;
  /** Filtro opcional (p. ej. solo moléculas con un átomo central). */
  filtro?: (m: EntradaCatalogo) => boolean;
  placeholder?: string;
}

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const NOMBRE_CATEGORIA: Record<string, string> = {
  inorganica: 'Inorgánicas',
  ion: 'Iones',
  hidrocarburo: 'Hidrocarburos',
  oxigenado: 'Compuestos oxigenados',
  nitrogenado: 'Compuestos nitrogenados',
  halogenado: 'Compuestos halogenados',
  biomolecula: 'Biomoléculas',
  cotidiana: 'Moléculas cotidianas',
  ionico: 'Compuestos iónicos',
};

/** Búsqueda difusa en el catálogo por nombre (español o inglés), fórmula o SMILES. Fuse.js se carga al enfocar. */
export function BuscadorMoleculas({ alElegir, etiqueta = 'Buscar molécula', filtro, placeholder = 'agua, etanol, CH4, benceno…' }: Props) {
  const id = useId();
  const lista = useMemo(() => CATALOGO.filter((m) => !filtro || filtro(m)), [filtro]);
  const [texto, setTexto] = useState('');
  const [fuse, setFuse] = useState<Fuse<EntradaCatalogo & { busqueda: string }> | null>(null);
  const [activo, setActivo] = useState(0);
  const cargando = useRef(false);

  const cargarFuse = () => {
    if (fuse || cargando.current) return;
    cargando.current = true;
    void import('fuse.js').then(({ default: F }) =>
      setFuse(
        new F(
          lista.map((m) => ({ ...m, busqueda: quitarTildes(m.nombre) })),
          {
            keys: [
              { name: 'busqueda', weight: 3 },
              { name: 'nombreIngles', weight: 2 },
              { name: 'formula', weight: 2 },
              { name: 'iupac', weight: 1 },
              { name: 'smiles', weight: 1 },
            ],
            threshold: 0.35,
            ignoreLocation: true,
          },
        ),
      ),
    );
  };
  useEffect(() => {
    setFuse(null);
    cargando.current = false;
  }, [lista]);

  const resultados = useMemo(() => {
    const t = texto.trim();
    if (!t || !fuse) return [];
    const exactos = lista.filter((m) => m.formula.toLowerCase() === t.toLowerCase() || m.smiles === t);
    const difusos = fuse.search(quitarTildes(t)).map((r) => lista.find((m) => m.cid === r.item.cid)!);
    return [...new Set([...exactos, ...difusos])].slice(0, 8);
  }, [texto, fuse, lista]);

  const elegir = (m: EntradaCatalogo) => {
    alElegir(m);
    setTexto('');
  };

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor={`${id}-in`} className="mb-1 block text-sm font-medium">
        {etiqueta}
      </label>
      <input
        id={`${id}-in`}
        type="search"
        role="combobox"
        aria-expanded={resultados.length > 0}
        aria-controls={id}
        aria-autocomplete="list"
        aria-activedescendant={resultados[activo] ? `${id}-${resultados[activo]!.cid}` : undefined}
        placeholder={placeholder}
        value={texto}
        onFocus={cargarFuse}
        onChange={(e) => {
          setTexto(e.target.value);
          setActivo(0);
        }}
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
        <ul id={id} role="listbox" className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-borde bg-superficie shadow-xl">
          {resultados.map((m, i) => (
            <li
              key={m.cid}
              id={`${id}-${m.cid}`}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(ev) => {
                ev.preventDefault();
                elegir(m);
              }}
              className={`cursor-pointer px-3 py-1.5 text-sm ${i === activo ? 'bg-superficie-2' : ''}`}
            >
              <span className="font-medium">{m.nombre}</span> <span className="text-xs text-texto-suave">{m.formula}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
