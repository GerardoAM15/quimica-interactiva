import { Cristales, Frasco, Metal, TuboDescarga } from '@/components/escena3d/Muestras';
import Escena3D from '@/components/escena3d/Escena3D';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { elementoPorZ, NOMBRE_ESTADO } from '@/chem/elements';
import { aparienciaDe, type Apariencia } from './apariencia';

function Contenido({ ap, z }: { ap: Apariencia; z: number }) {
  switch (ap.tipo) {
    case 'metal':
      return <Metal ap={ap} z={z} />;
    case 'no-metal':
      return <Cristales ap={ap} z={z} />;
    case 'liquido':
      return <Frasco ap={ap} gas={false} vapor={!ap.metalico} />;
    case 'gas-coloreado':
      return <Frasco ap={ap} gas />;
    case 'gas':
      return <TuboDescarga ap={ap} />;
    default:
      return null;
  }
}

/** Muestra realista del elemento a 25 °C, según su estado y aspecto. */
export default function Muestra3D({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const ap = aparienciaDe(z);
  const animado = ap.tipo === 'gas';

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {ap.tipo === 'no-observable' ? (
        <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
          {ap.descripcion}
        </div>
      ) : (
        <Escena3D
          descripcion={`Muestra de ${el.nombre} a 25 °C: ${ap.descripcion}`}
          camara={ap.tipo === 'gas' ? [0, 0.6, 5.5] : [0, 1.2, 4.2]}
          modoFotogramas={animado ? 'always' : 'demand'}
          entorno
          className="h-[360px]"
        >
          <Contenido ap={ap} z={z} />
        </Escena3D>
      )}
      <div className="text-sm">
        <h3 className="font-semibold">
          {el.nombre} a 25 °C: {NOMBRE_ESTADO[el.estadoEstandar].toLowerCase()}
        </h3>
        <p className="mt-1">{ap.descripcion}</p>
        {ap.tipo === 'gas' && <p className="mt-2 text-texto-suave">El gas es incoloro; el brillo aparece al aplicar alto voltaje en un tubo a baja presión.</p>}
        <div className="mt-3 space-y-1 text-xs text-texto-suave">
          <InsigniaRevision texto="Color aproximado" titulo="Representación visual aproximada de la descripción de la fuente; pendiente de revisión." />
          <p>Fuente de la descripción: CRC Handbook (sección 4) y Greenwood-Earnshaw. {!ap.especifica && 'Aspecto genérico para su tipo de elemento.'}</p>
        </div>
      </div>
    </div>
  );
}
