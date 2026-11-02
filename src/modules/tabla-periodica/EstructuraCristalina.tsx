import { useMemo, useState } from 'react';
import datos from '@/data/cristales.json';
import { celdaElemento, densidadCubica, distanciaMinimaEntreSitios, INFO_REDES, type TipoRed } from '@/chem/cristales';
import { NA } from '@/chem/constants';
import { elementoPorZ } from '@/chem/elements';
import Escena3D from '@/components/escena3d/Escena3D';
import { Cristal3D } from '@/components/escena3d/Cristal3D';
import { InsigniaRevision } from '@/components/InsigniaRevision';
import { PasoAPaso } from '@/components/PasoAPaso';
import { aparienciaDe } from './apariencia';

interface EntradaCristal {
  red: TipoRed | 'otra';
  a?: number;
  c?: number;
  nota?: string;
  descripcion?: string;
  alotropos?: { nombre: string; red: TipoRed; a: number }[];
}

const CUBICAS: TipoRed[] = ['sc', 'bcc', 'fcc', 'diamante'];

export default function EstructuraCristalina({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const entrada = (datos.elementos as Record<string, EntradaCristal>)[el.simbolo];
  const [alotropo, setAlotropo] = useState(0);
  const [recortar, setRecortar] = useState(false);
  const [tamanoReal, setTamanoReal] = useState(false);

  const opciones = useMemo(() => {
    if (!entrada || entrada.red === 'otra' || !entrada.a) return [];
    return [{ nombre: 'forma estable a 25 °C', red: entrada.red, a: entrada.a, c: entrada.c }, ...(entrada.alotropos ?? [])];
  }, [entrada]);

  if (!entrada || opciones.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-borde p-5 text-sm">
        <p>{entrada?.descripcion ?? (el.estadoEstandar === 'solido' ? 'No hay datos de estructura cristalina para este elemento en la tabla de la aplicación.' : `A 25 °C el ${el.nombre.toLowerCase()} no es sólido.`)}</p>
        {entrada?.descripcion && <p className="mt-2 text-texto-suave">Su estructura es más compleja que las redes que dibuja esta aplicación (sc, bcc, fcc, hcp, diamante y grafito).</p>}
      </div>
    );
  }

  const op = opciones[Math.min(alotropo, opciones.length - 1)]!;
  const info = INFO_REDES[op.red];
  const sitios = celdaElemento(op.red, op.a, 'c' in op ? op.c : undefined, el.simbolo);
  const vecino = distanciaMinimaEntreSitios(sitios);
  const esCubica = CUBICAS.includes(op.red);
  // Radio de contacto (esferas tangentes) o radio reducido para ver la estructura
  const radioContacto = op.red === 'grafito' ? vecino / 2 : (info.radioDesdeArista?.(op.a) ?? vecino / 2);
  const radio = tamanoReal ? radioContacto : radioContacto * 0.42;
  const enlaces = op.red === 'diamante' || op.red === 'grafito' ? vecino : null;
  const celda = esCubica ? { tipo: 'cubica' as const, a: op.a } : op.red === 'hcp' ? { tipo: 'hexagonal' as const, a: op.a, c: 'c' in op && op.c ? op.c : op.a * 1.633 } : null;
  const rhoTeorica = esCubica ? densidadCubica(info.atomosPorCelda, el.masaAtomica, op.a, NA) : null;
  const tam = Math.max(op.a, 'c' in op && op.c ? op.c : 0) / 100;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div>
        <Escena3D descripcion={`Celda unitaria ${info.nombre} de ${el.nombre}`} camara={[tam * 1.6, tam * 1.1, tam * 2]} className="h-[380px]">
          <Cristal3D
            sitios={sitios}
            radios={{ [el.simbolo]: radio }}
            colores={{ [el.simbolo]: aparienciaDe(z).color ?? el.colorCPK ?? '#c0c0c0' }}
            celda={celda}
            recortar={recortar && esCubica}
            enlaces={enlaces}
            metalico={op.red !== 'diamante' && op.red !== 'grafito'}
          />
        </Escena3D>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {opciones.length > 1 && (
            <label className="flex items-center gap-2">
              Alótropo:
              <select value={alotropo} onChange={(e) => setAlotropo(Number(e.target.value))} className="rounded border border-borde bg-superficie px-2 py-1">
                {opciones.map((o, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? `${INFO_REDES[o.red].nombre} (${o.nombre})` : o.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={tamanoReal} onChange={(e) => setTamanoReal(e.target.checked)} />
            Esferas en contacto (tamaño real)
          </label>
          {esCubica && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={recortar} onChange={(e) => setRecortar(e.target.checked)} />
              Mostrar solo la parte dentro de la celda
            </label>
          )}
        </div>
      </div>
      <div className="text-sm">
        <h3 className="font-semibold">{info.nombre}</h3>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-texto-suave">Parámetro a</dt>
          <dd className="tabular-nums">{op.a} pm</dd>
          {'c' in op && op.c && (
            <>
              <dt className="text-texto-suave">Parámetro c</dt>
              <dd className="tabular-nums">
                {op.c} pm (c/a = {(op.c / op.a).toFixed(3)})
              </dd>
            </>
          )}
          <dt className="text-texto-suave">Átomos por celda</dt>
          <dd>{info.atomosPorCelda}</dd>
          <dt className="text-texto-suave">N.º de coordinación</dt>
          <dd>{info.coordinacion}</dd>
          {!Number.isNaN(info.empaquetamiento) && (
            <>
              <dt className="text-texto-suave">Empaquetamiento</dt>
              <dd>{(info.empaquetamiento * 100).toFixed(1)} %</dd>
            </>
          )}
          <dt className="text-texto-suave">Vecino más cercano</dt>
          <dd className="tabular-nums">{vecino.toFixed(1)} pm</dd>
        </dl>
        <p className="mt-2 text-texto-suave">{info.relacionRadio}</p>
        {'nota' in entrada && entrada.nota && <p className="mt-2">{entrada.nota}</p>}
        {rhoTeorica !== null && (
          <div className="mt-3">
            <p>
              Densidad teórica: <strong className="tabular-nums">{rhoTeorica.toFixed(3)} g/cm³</strong>
              {el.densidad && <span className="text-texto-suave"> (PubChem: {el.densidad})</span>}
            </p>
            <PasoAPaso
              pasos={[
                { titulo: 'Masa de la celda / volumen de la celda:', tex: '\\rho = \\dfrac{Z\\,M}{N_A\\,a^3}' },
                {
                  titulo: `Z = ${info.atomosPorCelda} átomos/celda, M = ${el.masaAtomica} g/mol, a = ${op.a} pm = ${(op.a * 1e-10).toExponential(4)} cm`,
                  tex: `\\rho = \\dfrac{${info.atomosPorCelda}\\times ${el.masaAtomica}}{6{,}022\\times10^{23}\\times(${(op.a * 1e-10).toExponential(4).replace('e-8', '\\times10^{-8}')})^3}`,
                },
                { titulo: 'Resultado:', tex: `\\rho = ${rhoTeorica.toFixed(3)}\\ \\text{g/cm}^3` },
              ]}
            />
          </div>
        )}
        <div className="mt-3">
          <InsigniaRevision titulo="Parámetros de red transcritos del CRC Handbook; pendientes de verificación." />
        </div>
      </div>
    </div>
  );
}
