import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ELEMENTOS, NOMBRE_FAMILIA, NOMBRE_ESTADO, type Familia, type EstadoFisico } from '@/chem/elements';
import { Pestanas } from '@/components/Pestanas';
import { Cargando } from '@/components/Cargando';
import { Teoria } from '@/components/Teoria';
import { CuadriculaPeriodica } from './CuadriculaPeriodica';
import { FichaElemento } from './FichaElemento';
import { BuscadorElementos } from './BuscadorElementos';
import { TeoriaTablaPeriodica } from './TeoriaTablaPeriodica';
import {
  COLOR_BLOQUE,
  COLOR_ESTADO,
  COLOR_FAMILIA,
  colorEscala,
  normalizador,
  PROPIEDADES,
  propiedadPorClave,
  type ClavePropiedad,
  type ModoColor,
} from './colores';

const GraficaTendencias = lazy(() => import('./GraficaTendencias'));
const Tabla3D = lazy(() => import('./Tabla3D'));
const Vitrina3D = lazy(() => import('./Vitrina3D'));

type Vista = 'tabla' | 'tendencias' | 'tabla3d' | 'vitrina';
const PESTANAS = [
  { id: 'tabla', titulo: 'Tabla periódica' },
  { id: 'tendencias', titulo: 'Tendencias vs Z' },
  { id: 'tabla3d', titulo: 'Tabla en 3D' },
  { id: 'vitrina', titulo: 'Vitrina 3D' },
] as const;

const esPropiedad = (m: ModoColor): m is ClavePropiedad => PROPIEDADES.some((p) => p.clave === m);

export default function TablaPeriodica() {
  const [params, setParams] = useSearchParams();
  const zParam = Number(params.get('z'));
  const seleccion = zParam >= 1 && zParam <= 118 ? zParam : null;
  const [vista, setVista] = useState<Vista>('tabla');
  const [modo, setModo] = useState<ModoColor>('familia');
  const [resaltados, setResaltados] = useState<Set<number> | null>(null);
  const ficha = useRef<HTMLDivElement>(null);

  // Solo se desplaza hacia la ficha cuando el usuario elige un elemento (no al abrir un enlace con ?z=)
  const desplazar = useRef(false);
  const seleccionar = (z: number) => {
    desplazar.current = true;
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('z', String(z));
      return n;
    }, { replace: true });
  };

  useEffect(() => {
    if (!desplazar.current || !seleccion || (vista !== 'tabla' && vista !== 'vitrina')) return;
    desplazar.current = false;
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    ficha.current?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
  }, [seleccion, vista]);

  const norm = useMemo(() => (esPropiedad(modo) ? normalizador(ELEMENTOS, propiedadPorClave(modo)) : undefined), [modo]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Teoria titulo="Teoría: la tabla periódica">
          <TeoriaTablaPeriodica />
        </Teoria>
        <p className="text-sm text-texto-suave">
          Datos de PubChem (NIH) e IUPAC/NIST. Elige un elemento para ver su ficha completa.
        </p>
      </div>

      <Pestanas pestanas={PESTANAS} activa={vista} alCambiar={setVista} etiqueta="Vistas de la tabla periódica">
        {vista === 'tabla' && (
          <>
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <BuscadorElementos alElegir={seleccionar} alResaltar={setResaltados} />
              <label className="text-sm">
                <span className="mb-1 block font-medium">Colorear por</span>
                <select
                  value={modo}
                  onChange={(e) => setModo(e.target.value as ModoColor)}
                  className="rounded-md border border-borde bg-superficie px-2 py-1.5"
                >
                  <option value="familia">Familia</option>
                  <option value="bloque">Bloque (s, p, d, f)</option>
                  <option value="estado">Estado a 25 °C</option>
                  <optgroup label="Mapa de calor">
                    {PROPIEDADES.map((p) => (
                      <option key={p.clave} value={p.clave}>
                        {p.nombre}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            </div>

            <CuadriculaPeriodica modo={modo} norm={norm} seleccion={seleccion} resaltados={resaltados} alElegir={seleccionar} />
            <Leyenda modo={modo} norm={norm} />

            <div ref={ficha} className="scroll-mt-20">
              {seleccion ? (
                <FichaElemento z={seleccion} alElegir={seleccionar} />
              ) : (
                <p className="mt-6 rounded-lg border border-dashed border-borde p-4 text-sm text-texto-suave">
                  Haz clic (o usa Tab y Enter) en un elemento para ver su ficha: configuración electrónica, modelo de
                  Bohr, isótopos, muestra 3D y estructura cristalina.
                </p>
              )}
            </div>
          </>
        )}
        {vista === 'tendencias' && (
          <Suspense fallback={<Cargando texto="Cargando gráfica…" />}>
            <GraficaTendencias alElegir={(z) => { seleccionar(z); setVista('tabla'); }} />
          </Suspense>
        )}
        {vista === 'vitrina' && (
          <Suspense fallback={<Cargando texto="Cargando la vitrina 3D…" />}>
            <Vitrina3D alElegir={seleccionar} />
            <div ref={ficha} className="scroll-mt-20">
              {seleccion && <FichaElemento z={seleccion} alElegir={seleccionar} />}
            </div>
          </Suspense>
        )}
        {vista === 'tabla3d' && (
          <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
            <Tabla3D alElegir={(z) => { seleccionar(z); setVista('tabla'); }} />
          </Suspense>
        )}
      </Pestanas>
    </div>
  );
}

function Leyenda({ modo, norm }: { modo: ModoColor; norm: ReturnType<typeof normalizador> | undefined }) {
  if (esPropiedad(modo) && norm) {
    const p = propiedadPorClave(modo);
    const fmt = (v: number) => v.toLocaleString('es-PE', { maximumFractionDigits: p.decimales });
    return (
      <div className="mt-3 max-w-md text-xs">
        <p className="mb-1 font-medium">
          {p.nombre}
          {p.unidad && ` (${p.unidad})`}
          {p.log && ' · escala logarítmica'}
        </p>
        <div
          className="h-3 rounded"
          style={{ background: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1].map(colorEscala).join(', ')})` }}
          aria-hidden
        />
        <div className="mt-0.5 flex justify-between text-texto-suave tabular-nums">
          <span>{fmt(norm.min)}</span>
          <span>{fmt(norm.max)}</span>
        </div>
        <p className="mt-1 text-texto-suave">Gris: sin dato en PubChem.</p>
      </div>
    );
  }
  const entradas: [string, string][] =
    modo === 'familia'
      ? (Object.keys(COLOR_FAMILIA) as Familia[]).map((f) => [NOMBRE_FAMILIA[f], COLOR_FAMILIA[f]])
      : modo === 'bloque'
        ? Object.entries(COLOR_BLOQUE).map(([b, c]) => [`Bloque ${b}`, c])
        : (Object.keys(COLOR_ESTADO) as EstadoFisico[]).map((e) => [NOMBRE_ESTADO[e], COLOR_ESTADO[e]]);
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Leyenda de colores">
      {entradas.map(([t, c]) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: c }} aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}
