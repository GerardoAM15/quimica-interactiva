import datos from '@/data/apariencia-compuestos.json';
import Escena3D from '@/components/escena3d/Escena3D';
import { Cristales, Frasco, Polvo } from '@/components/escena3d/Muestras';
import { InsigniaRevision } from '@/components/InsigniaRevision';

interface AspectoCompuesto {
  estado: 'sólido' | 'líquido' | 'gas' | null;
  forma: 'polvo' | 'cristal' | 'sólido' | null;
  color: string | null;
  hex: string | null;
  descripcion: string;
  fuente: string;
  soloDisolucion?: boolean;
}

const ASPECTOS = datos.compuestos as Record<string, AspectoCompuesto>;
export const aspectoCompuesto = (cid: number): AspectoCompuesto | null => ASPECTOS[String(cid)] ?? null;

/** Muestra del compuesto a 25 °C según su estado, forma y color (PubChem; clasificación automática). */
export default function MuestraCompuesto3D({ cid, nombre }: { cid: number; nombre: string }) {
  const a = aspectoCompuesto(cid);
  if (!a || a.soloDisolucion || !a.estado) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-borde p-6 text-center text-sm text-texto-suave">
        {a?.soloDisolucion ? a.descripcion : 'No hay descripción del aspecto de este compuesto en PubChem.'}
      </div>
    );
  }
  const incoloro = !a.hex;
  const ap = { color: a.hex ?? (a.estado === 'sólido' ? '#eef2f6' : '#cfe6f5'), rugosidad: a.forma === 'cristal' ? 0.15 : 0.6, metalicidad: 0 };
  let contenido;
  if (a.estado === 'gas') contenido = <Frasco ap={ap} gas opacidadGas={incoloro ? 0.04 : 0.4} />;
  else if (a.estado === 'líquido') contenido = <Frasco ap={ap} gas={false} />;
  else if (a.forma === 'cristal') contenido = <Cristales ap={ap} z={cid % 9973} transparente={incoloro} />;
  else contenido = <Polvo color={ap.color} semilla={cid} />;
  const texto = `${a.estado}${a.forma && a.forma !== 'sólido' ? ` (${a.forma})` : ''}${a.color ? `, ${a.color}` : ''}`;
  return (
    <div className="space-y-2">
      <Escena3D descripcion={`Muestra de ${nombre} a 25 °C: ${texto}`} camara={[0, 1.2, 4.2]} entorno className="h-[360px]">
        {contenido}
      </Escena3D>
      <p className="text-sm">
        A 25 °C: <strong>{texto}</strong>
        {a.estado === 'gas' && incoloro && ' (gas incoloro: el matraz parece vacío)'}.
      </p>
      <p className="text-xs text-texto-suave">
        «{a.descripcion}» — {a.fuente}, vía PubChem. <InsigniaRevision texto="Aspecto aproximado" titulo="Estado, forma y color clasificados automáticamente a partir de la descripción de la fuente; pendiente de revisión." />
      </p>
    </div>
  );
}
