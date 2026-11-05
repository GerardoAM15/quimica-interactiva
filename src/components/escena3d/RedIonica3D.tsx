import { useMemo, useState } from 'react';
import { celdaIonica, COLORES_IONES, contarPorEspecie, RADIOS_IONICOS, REDES_IONICAS, type TipoRedIonica } from '@/chem/cristales';
import Escena3D from './Escena3D';
import { Cristal3D } from './Cristal3D';

/** Celda unitaria de una red iónica tabulada (para la ficha de un compuesto del catálogo). */
export default function RedIonica3D({ tipo }: { tipo: TipoRedIonica }) {
  const [reales, setReales] = useState(false);
  const info = REDES_IONICAS[tipo];
  const sitios = useMemo(() => celdaIonica(tipo), [tipo]);
  const cuenta = contarPorEspecie(sitios);
  const radios = Object.fromEntries(Object.entries(RADIOS_IONICOS[tipo]).map(([k, v]) => [k, reales ? v : v * 0.55]));
  const tam = info.a / 100;
  return (
    <div className="space-y-2 text-sm">
      <Escena3D descripcion={`Celda unitaria de ${info.nombre}`} camara={[tam * 1.7, tam * 1.2, tam * 2.1]} className="h-[360px]">
        <Cristal3D sitios={sitios} radios={radios} colores={COLORES_IONES} celda={{ tipo: 'cubica', a: info.a }} />
      </Escena3D>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={reales} onChange={(e) => setReales(e.target.checked)} /> Iones con su radio real (empaquetados)
      </label>
      <p>
        <strong>{info.nombre}</strong>: {info.descripcion}
      </p>
      <p className="text-texto-suave">
        Coordinación {info.coordinacion} · por celda: {cuenta[info.cation]} {info.cation} + {cuenta[info.anion]} {info.anion} · a = {info.a} pm
      </p>
    </div>
  );
}
