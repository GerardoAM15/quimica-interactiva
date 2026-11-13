import Escena3D from '@/components/escena3d/Escena3D';
import { ObjetoCotidiano3D } from '@/components/escena3d/ObjetosCotidianos';
import { MuestraPresentacion } from '@/components/escena3d/Presentaciones';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { elementoPorZ } from '@/chem/elements';
import { aparienciaDe } from './apariencia';
import { presentacionDe } from './presentacion';
import { Encuadre } from './Muestra3D';

/** Pestaña «En la vida diaria»: un objeto común que contiene el elemento y una frase sobre su uso. */
export default function VidaDiaria3D({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const info = presentacionDe(z);
  const { objeto, uso } = info.vidaDiaria;
  const animado = objeto === 'letrero' || objeto === 'bombilla' || objeto === 'led' || objeto === 'cohete';
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {objeto ? (
        <Escena3D descripcion={`${el.nombre} en la vida diaria: ${uso}`} camara={[0, 0.5, 4.2]} entorno="estudio" modoFotogramas={animado ? 'always' : 'demand'} className="h-[340px]" autoRotar>
          <Encuadre clave={`${z}-objeto`} pedestal={false}>
            <ObjetoCotidiano3D objeto={objeto} simbolo={el.simbolo} />
          </Encuadre>
        </Escena3D>
      ) : info.presentacion !== 'sin-muestra' ? (
        <Escena3D descripcion={`Muestra de ${el.nombre}`} camara={[0, 0.75, 3.6]} entorno="estudio" className="h-[340px]">
          <Encuadre clave={`${z}-muestra`}>
            <MuestraPresentacion presentacion={info.presentacion} ap={aparienciaDe(z)} efecto={info.efecto} semilla={z * 7919} simbolo={el.simbolo} detalle="bajo" />
          </Encuadre>
        </Escena3D>
      ) : (
        <div className="flex h-[340px] items-center justify-center rounded-lg border border-dashed border-borde text-5xl" aria-hidden>
          ☢
        </div>
      )}
      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">{el.nombre} en la vida diaria</h3>
        <p className="text-base">{uso}</p>
        {!objeto && info.presentacion !== 'sin-muestra' && <p className="text-texto-suave">Se muestra el propio elemento: sus usos son sobre todo industriales.</p>}
        <p className="pt-1 text-xs text-texto-suave">
          Objeto ilustrativo y simplificado. Usos: CRC Handbook (sección 4) y Chang <InsigniaRevision />
        </p>
      </div>
    </div>
  );
}
