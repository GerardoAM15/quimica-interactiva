import { Link } from 'react-router-dom';
import Escena3D from '@/components/escena3d/Escena3D';
import { Ajustado } from '@/components/escena3d/Ajustado';
import { FuenteNatural3D } from '@/components/escena3d/Minerales';
import { ObjetoCotidiano3D } from '@/components/escena3d/ObjetosCotidianos';
import { MuestraPresentacion } from '@/components/escena3d/Presentaciones';
import { Ce } from '@/components/Formula';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { balancear, ecuacionMhchem } from '@/chem/balance';
import { aMhchem } from '@/chem/formula';
import { elementoPorZ } from '@/chem/elements';
import { aparienciaDe } from './apariencia';
import { Encuadre } from './Muestra3D';
import { AIRE, obtencionDe, textoSinObtencion } from './obtencion';
import { NOMBRE_PRESENTACION, presentacionDe } from './presentacion';

const ALTO = 'h-[230px]';

/** Colocación de 1, 2 o 3 productos para aprovechar un cuadro casi cuadrado (x, y). */
const COLOCACION: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.85, 0.45], [0.85, -0.45]],
  3: [[-0.9, 0.8], [0.9, 0.8], [0, -0.8]],
};

/** Tarjeta de una de las tres etapas: escena 3D con su rótulo. */
function Etapa({ numero, titulo, children, pie }: { numero: number; titulo: string; children: React.ReactNode; pie: React.ReactNode }) {
  return (
    <section className="min-w-0 space-y-2" aria-label={titulo}>
      <h3 className="text-sm font-semibold">
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-superficie-2 text-xs">{numero}</span>
        {titulo}
      </h3>
      {children}
      <div className="text-sm">{pie}</div>
    </section>
  );
}

/** Flecha entre etapas: horizontal en escritorio, vertical en móvil. */
function Flecha({ texto }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-texto-suave lg:w-24 lg:flex-col lg:pt-16">
      {texto && <span className="text-center text-xs">{texto}</span>}
      <span className="text-2xl leading-none lg:hidden" aria-hidden>
        ↓
      </span>
      <span className="hidden text-2xl leading-none lg:block" aria-hidden>
        →
      </span>
    </div>
  );
}

/** Pestaña «Del mineral al producto»: fuente natural → proceso industrial → elemento puro → productos. */
export default function MineralProducto({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const o = obtencionDe(z);
  if (!o) {
    return (
      <div className="rounded-lg border border-dashed border-borde p-6 text-sm">
        <p>{textoSinObtencion(z)}</p>
      </div>
    );
  }
  const info = presentacionDe(z);
  const { fuente, proceso } = o;
  const gaseosa = fuente.tipo === 'aire' || fuente.tipo === 'gas';

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <Etapa
          numero={1}
          titulo="En la naturaleza"
          pie={
            <>
              <strong>{fuente.nombre}</strong>
              {(fuente.formulaTexto || fuente.formula) && <> · {fuente.formulaTexto ?? <Ce>{aMhchem(fuente.formula!)}</Ce>}</>}
              {fuente.tipo === 'aire' && <p className="mt-1 text-xs text-texto-suave">{AIRE.composicion}</p>}
            </>
          }
        >
          <Escena3D descripcion={`${el.nombre} en la naturaleza: ${fuente.nombre}`} camara={[0, 0.8, 3.6]} entorno="estudio" className={ALTO} ayuda="">
            <Encuadre clave={`${z}-fuente`} pedestal={!gaseosa}>
              <FuenteNatural3D fuente={fuente} semilla={z * 3571} />
            </Encuadre>
          </Escena3D>
        </Etapa>

        <Flecha texto={proceso.nombre} />

        <Etapa
          numero={2}
          titulo="Elemento puro"
          pie={
            <>
              <strong>{el.nombre}</strong> · {NOMBRE_PRESENTACION[info.presentacion]}
            </>
          }
        >
          <Escena3D descripcion={`Muestra de ${el.nombre} puro`} camara={[0, 0.8, 3.6]} entorno="estudio" className={ALTO} ayuda="" modoFotogramas={info.presentacion === 'tubo' ? 'always' : 'demand'}>
            <Encuadre clave={`${z}-puro`} pedestal={info.presentacion !== 'tubo'}>
              <MuestraPresentacion presentacion={info.presentacion} ap={aparienciaDe(z)} efecto={info.efecto} semilla={z * 7919} simbolo={el.simbolo} liquido={el.estadoEstandar === 'liquido'} />
            </Encuadre>
          </Escena3D>
        </Etapa>

        <Flecha />

        <Etapa
          numero={3}
          titulo="Productos"
          pie={
            <ul className="list-disc space-y-0.5 pl-5">
              {o.productos.map((p) => (
                <li key={p.objeto}>{p.texto}</li>
              ))}
            </ul>
          }
        >
          <Escena3D descripcion={`Productos hechos con ${el.nombre}: ${o.productos.map((p) => p.texto).join(' ')}`} camara={[0, 0.8, 3.6]} entorno="estudio" className={ALTO} ayuda="">
            <Encuadre clave={`${z}-productos`} pedestal={false}>
              {o.productos.map((p, i) => (
                <Ajustado key={p.objeto} lado={1.5} posicion={[COLOCACION[o.productos.length]![i]![0], COLOCACION[o.productos.length]![i]![1], 0]} clave={`${z}-${p.objeto}`}>
                  <ObjetoCotidiano3D objeto={p.objeto} simbolo={el.simbolo} />
                </Ajustado>
              ))}
            </Encuadre>
          </Escena3D>
        </Etapa>
      </div>

      <section className="rounded-lg border border-borde bg-superficie-2 p-4 text-sm">
        <h3 className="font-semibold">Proceso industrial: {proceso.nombre}</h3>
        <p className="mt-1">{proceso.descripcion}</p>
        {proceso.ecuaciones.length === 0 ? (
          <p className="mt-2 text-texto-suave">No interviene ninguna reacción química: no hay ecuación que balancear.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {proceso.ecuaciones.map((ec) => (
              <li key={ec} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Ce>{ecuacionMhchem(balancear(ec))}</Ce>
                <Link to={`/modulo/balanceador?ecuacion=${encodeURIComponent(ec)}`} className="rounded-md border border-borde bg-superficie px-2.5 py-1 text-xs font-medium hover:bg-fondo">
                  Abrir en el balanceador
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {o.peru && (
        <section className="rounded-lg border border-borde p-4 text-sm">
          <h3 className="font-semibold">En el Perú</h3>
          <p className="mt-1">{o.peru}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-texto-suave">
            Fuentes: MINEM, Anuario Minero 2024; USGS, Mineral Commodity Summaries. <InsigniaRevision />
          </p>
        </section>
      )}

      <p className="flex flex-wrap items-center gap-2 text-xs text-texto-suave">
        Mena y proceso más representativos, simplificados (Chang; Greenwood-Earnshaw). Colores de los minerales aproximados. <InsigniaRevision />
      </p>
    </div>
  );
}
