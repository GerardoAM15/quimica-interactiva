import { memo, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ELEMENTOS, grupoTradicional, posicionTabla, NOMBRE_FAMILIA, type Elemento } from '@/chem/elements';
import { colorCasilla, colorTexto, propiedadPorClave, PROPIEDADES, type ModoColor, type normalizador } from './colores';

interface Props {
  modo: ModoColor;
  norm: ReturnType<typeof normalizador> | undefined;
  seleccion: number | null;
  resaltados: Set<number> | null;
  alElegir: (z: number) => void;
}

const GRUPOS = Array.from({ length: 18 }, (_, i) => i + 1);
// Z de un elemento representativo por grupo, para la etiqueta A/B
const Z_EJEMPLO_GRUPO = [1, 4, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 5, 6, 7, 8, 9, 2];

/** Cuadrícula de 18 columnas: filas 1–7 (periodos), fila 9 lantánidos y 10 actínidos. */
export const CuadriculaPeriodica = memo(function CuadriculaPeriodica({ modo, norm, seleccion, resaltados, alElegir }: Props) {
  const posiciones = useMemo(() => new Map(ELEMENTOS.map((e) => [e.z, posicionTabla(e.z)])), []);
  const porCelda = useMemo(() => new Map(ELEMENTOS.map((e) => [`${posiciones.get(e.z)!.fila},${posiciones.get(e.z)!.columna}`, e.z])), [posiciones]);
  const [enfocado, setEnfocado] = useState(seleccion ?? 1);
  const botones = useRef(new Map<number, HTMLButtonElement>());
  const propiedad = PROPIEDADES.some((p) => p.clave === modo) ? propiedadPorClave(modo as never) : null;

  // Navegación con flechas: busca la casilla ocupada más cercana en esa dirección
  const mover = (e: KeyboardEvent, z: number) => {
    const d: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    let destino: number | undefined;
    if (e.key === 'Home') destino = 1;
    else if (e.key === 'End') destino = 118;
    else if (d[e.key]) {
      const [df, dc] = d[e.key]!;
      let { fila, columna } = posiciones.get(z)!;
      for (let i = 0; i < 18 && destino === undefined; i++) {
        fila += df;
        columna += dc;
        if (fila === 8) fila += df; // salta la fila vacía entre la tabla y la serie f
        if (fila < 1 || fila > 10 || columna < 1 || columna > 18) break;
        destino = porCelda.get(`${fila},${columna}`);
      }
    } else return;
    e.preventDefault();
    if (destino) {
      setEnfocado(destino);
      botones.current.get(destino)?.focus();
    }
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div
        role="group"
        aria-label="Tabla periódica de los elementos"
        className="grid min-w-[760px] gap-[3px]"
        style={{ gridTemplateColumns: 'auto repeat(18, minmax(0, 1fr))', gridTemplateRows: 'auto repeat(7, auto) 0.6rem auto auto' }}
      >
        {/* Encabezados de grupo: IUPAC (1–18) y tradicional (IA…VIIIA) */}
        <div />
        {GRUPOS.map((g) => (
          <div key={g} className="text-center text-[10px] leading-tight text-texto-suave" style={{ gridColumn: g + 1, gridRow: 1 }}>
            <div className="font-semibold">{g}</div>
            <div>{grupoTradicional(Z_EJEMPLO_GRUPO[g - 1]!)}</div>
          </div>
        ))}
        {/* Periodos */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex items-center pr-1 text-[10px] font-semibold text-texto-suave" style={{ gridColumn: 1, gridRow: i + 2 }}>
            {i + 1}
          </div>
        ))}
        {/* Marcadores de las series f */}
        {[
          [7, '57–71', 'Lantánidos'],
          [8, '89–103', 'Actínidos'],
        ].map(([fila, rango, nombre]) => (
          <div
            key={String(rango)}
            className="flex flex-col items-center justify-center rounded border border-dashed border-borde text-[9px] leading-tight text-texto-suave"
            style={{ gridColumn: 4, gridRow: Number(fila) }}
            title={String(nombre)}
          >
            <span>{rango}</span>
            <span>*</span>
          </div>
        ))}
        {[['Lantánidos', 10], ['Actínidos', 11]].map(([t, fila]) => (
          <div key={String(t)} className="flex items-center justify-end pr-1 text-[10px] text-texto-suave" style={{ gridColumn: '1 / span 3', gridRow: Number(fila) }}>
            * {t}
          </div>
        ))}

        {ELEMENTOS.map((e) => {
          const { fila, columna } = posiciones.get(e.z)!;
          return (
            <Casilla
              key={e.z}
              elemento={e}
              fila={fila === 9 ? 10 : fila === 10 ? 11 : fila + 1}
              columna={columna + 1}
              fondo={colorCasilla(e, modo, norm)}
              valor={propiedad ? e[propiedad.clave] : undefined}
              decimales={propiedad?.decimales ?? 0}
              seleccionado={seleccion === e.z}
              atenuado={resaltados !== null && !resaltados.has(e.z)}
              tabIndex={e.z === enfocado ? 0 : -1}
              refBoton={(b) => {
                if (b) botones.current.set(e.z, b);
              }}
              alElegir={() => {
                setEnfocado(e.z);
                alElegir(e.z);
              }}
              alTeclear={(ev) => mover(ev, e.z)}
            />
          );
        })}
      </div>
    </div>
  );
});

interface PropsCasilla {
  elemento: Elemento;
  fila: number;
  columna: number;
  fondo: string;
  valor: number | null | undefined;
  decimales: number;
  seleccionado: boolean;
  atenuado: boolean;
  tabIndex: number;
  refBoton: (b: HTMLButtonElement | null) => void;
  alElegir: () => void;
  alTeclear: (e: KeyboardEvent) => void;
}

const Casilla = memo(function Casilla(p: PropsCasilla) {
  const { elemento: e } = p;
  const texto = colorTexto(p.fondo);
  const valorTexto =
    p.valor === undefined ? null : p.valor === null ? '—' : p.valor.toLocaleString('es-PE', { maximumFractionDigits: p.decimales });
  return (
    <button
      ref={p.refBoton}
      type="button"
      tabIndex={p.tabIndex}
      onClick={p.alElegir}
      onKeyDown={p.alTeclear}
      aria-label={`${e.nombre}, ${e.simbolo}, número atómico ${e.z}, ${NOMBRE_FAMILIA[e.familia]}${valorTexto ? `, ${valorTexto}` : ''}`}
      aria-pressed={p.seleccionado}
      className={`relative flex aspect-[0.92] min-w-0 flex-col items-center justify-center rounded-[3px] px-0.5 leading-none transition-[transform,opacity] hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:scale-110 ${
        p.seleccionado ? 'z-10 ring-2 ring-texto ring-offset-1 ring-offset-fondo' : ''
      } ${p.atenuado ? 'opacity-25' : ''}`}
      style={{ gridRow: p.fila, gridColumn: p.columna, background: p.fondo, color: texto }}
    >
      <span className="absolute top-0.5 left-1 text-[9px] tabular-nums opacity-80">{e.z}</span>
      <span className="mt-1.5 text-[15px] font-bold">{e.simbolo}</span>
      <span className="mt-0.5 w-full truncate text-center text-[8px] opacity-90">{valorTexto ?? e.nombre}</span>
    </button>
  );
});
