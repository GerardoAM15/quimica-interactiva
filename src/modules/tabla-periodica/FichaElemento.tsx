import { lazy, Suspense, useState } from 'react';
import {
  elementoPorZ,
  grupo,
  grupoTradicional,
  NOMBRE_ESTADO,
  NOMBRE_FAMILIA,
  periodo,
  tipoElemento,
  esSerieF,
} from '@/chem/elements';
import {
  bloque,
  configuracionMoeller,
  configuracionReal,
  electronesDesapareados,
  electronesPorNivel,
  electronesValencia,
  esExcepcion,
  formatearConfiguracion,
  notacionKernel,
  numerosCuanticosUltimoElectron,
} from '@/chem/configuracion';
import { isotoposDe, masaAtomicaPromedio, pesoAtomicoEstandarNIST } from '@/chem/atomo';
import { Pestanas } from '@/components/Pestanas';
import { Cargando } from '@/components/Cargando';
import { DiagramaOrbitales } from '@/components/atomo/DiagramaOrbitales';
import { ModeloBohr } from '@/components/atomo/ModeloBohr';
import { PasoAPaso } from '@/components/PasoAPaso';
import { COLOR_FAMILIA, colorTexto } from './colores';
import { FotoWikimedia } from './FotoWikimedia';

const Muestra3D = lazy(() => import('./Muestra3D'));
const VidaDiaria3D = lazy(() => import('./VidaDiaria3D'));
const EstructuraCristalina = lazy(() => import('./EstructuraCristalina'));

type Seccion = 'datos' | 'electrones' | 'isotopos' | 'muestra' | 'vida' | 'cristal' | 'foto';
const SECCIONES = [
  { id: 'datos', titulo: 'Datos' },
  { id: 'electrones', titulo: 'Electrones' },
  { id: 'isotopos', titulo: 'Isótopos' },
  { id: 'muestra', titulo: 'Muestra 3D' },
  { id: 'vida', titulo: 'En la vida diaria' },
  { id: 'cristal', titulo: 'Estructura cristalina' },
  { id: 'foto', titulo: 'Foto' },
] as const;

const fmt = (v: number | null, dec = 3, unidad = '') =>
  v === null ? <span className="text-texto-suave">sin dato</span> : `${v.toLocaleString('es-PE', { maximumFractionDigits: dec })}${unidad ? ` ${unidad}` : ''}`;
const kAC = (k: number | null) => (k === null ? null : k - 273.15);

interface Props {
  z: number;
  alElegir: (z: number) => void;
}

export function FichaElemento({ z, alElegir }: Props) {
  const el = elementoPorZ(z);
  const [seccion, setSeccion] = useState<Seccion>('datos');
  const fondo = COLOR_FAMILIA[el.familia];

  return (
    <article className="mt-6 rounded-lg border border-borde bg-superficie p-4 sm:p-5" aria-labelledby="ficha-titulo">
      <header className="flex flex-wrap items-start gap-4">
        <div
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg"
          style={{ background: fondo, color: colorTexto(fondo) }}
          aria-hidden
        >
          <span className="text-xs tabular-nums">{el.z}</span>
          <span className="text-4xl font-bold leading-none">{el.simbolo}</span>
          <span className="mt-1 text-[11px] tabular-nums">{el.masaAtomica?.toLocaleString('es-PE', { maximumFractionDigits: 3 })}</span>
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <h2 id="ficha-titulo" className="text-2xl font-bold">
            {el.nombre} <span className="text-base font-normal text-texto-suave">({el.nombreIngles})</span>
          </h2>
          <p className="text-sm text-texto-suave">
            {NOMBRE_FAMILIA[el.familia]} · {tipoElemento(el) === 'metal' ? 'metal' : tipoElemento(el) === 'metaloide' ? 'metaloide' : 'no metal'} ·{' '}
            {NOMBRE_ESTADO[el.estadoEstandar].toLowerCase()} a 25 °C{el.estadoEsperado ? ' (predicho)' : ''}
          </p>
          {el.alias.length > 0 && <p className="text-sm text-texto-suave">También: {el.alias.join(', ')}</p>}
          {el.origenSimbolo && (
            <p className="text-sm">
              Símbolo <strong>{el.simbolo}</strong> {el.origenSimbolo}.
            </p>
          )}
        </div>
        <nav aria-label="Elementos vecinos" className="flex w-full gap-1 text-sm sm:w-auto">
          {z > 1 && (
            <button type="button" onClick={() => alElegir(z - 1)} className="rounded-md border border-borde px-2 py-1 hover:bg-superficie-2">
              ← {elementoPorZ(z - 1).simbolo}
            </button>
          )}
          {z < 118 && (
            <button type="button" onClick={() => alElegir(z + 1)} className="rounded-md border border-borde px-2 py-1 hover:bg-superficie-2">
              {elementoPorZ(z + 1).simbolo} →
            </button>
          )}
        </nav>
      </header>

      <div className="mt-4">
        <Pestanas pestanas={SECCIONES} activa={seccion} alCambiar={setSeccion} etiqueta={`Secciones de la ficha de ${el.nombre}`}>
          {seccion === 'datos' && <Datos z={z} />}
          {seccion === 'electrones' && <Electrones z={z} />}
          {seccion === 'isotopos' && <Isotopos z={z} />}
          {seccion === 'muestra' && (
            <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
              <Muestra3D z={z} />
            </Suspense>
          )}
          {seccion === 'vida' && (
            <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
              <VidaDiaria3D z={z} />
            </Suspense>
          )}
          {seccion === 'cristal' && (
            <Suspense fallback={<Cargando texto="Cargando escena 3D…" />}>
              <EstructuraCristalina z={z} />
            </Suspense>
          )}
          {seccion === 'foto' && <FotoWikimedia z={z} />}
        </Pestanas>
      </div>
    </article>
  );
}

function Fila({ nombre, children }: { nombre: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-texto-suave">{nombre}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </>
  );
}

function Datos({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const pf = kAC(el.puntoFusion), pe = kAC(el.puntoEbullicion);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <Fila nombre="Número atómico (Z)">{el.z}</Fila>
        <Fila nombre="Masa atómica">
          {fmt(el.masaAtomica, 5, 'u')}{' '}
          <span className="text-xs font-normal text-texto-suave">({el.origenMasaAtomica})</span>
        </Fila>
        <Fila nombre="Periodo">{periodo(z)}</Fila>
        <Fila nombre="Grupo">
          {grupo(z)} ({grupoTradicional(z)}){esSerieF(z) ? ' · serie f' : ''}
        </Fila>
        <Fila nombre="Bloque">{bloque(z)}</Fila>
        <Fila nombre="Estados de oxidación">
          {el.estadosOxidacion.length ? el.estadosOxidacion.map((n) => (n > 0 ? `+${n}` : String(n))).join(', ') : <span className="text-texto-suave">sin dato</span>}
        </Fila>
        <Fila nombre="Descubrimiento">{el.conocidoDesdeAntiguedad ? 'conocido desde la Antigüedad' : (el.anioDescubrimiento ?? 'sin dato')}</Fila>
      </dl>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <Fila nombre="Electronegatividad (Pauling)">{fmt(el.electronegatividad, 2)}</Fila>
        <Fila nombre="Radio de van der Waals">{fmt(el.radioVdW, 0, 'pm')}</Fila>
        <Fila nombre="1.ª energía de ionización">
          {fmt(el.energiaIonizacion, 3, 'eV')}
          {el.energiaIonizacion !== null && (
            <span className="text-xs font-normal text-texto-suave"> = {(el.energiaIonizacion * 96.485).toLocaleString('es-PE', { maximumFractionDigits: 0 })} kJ/mol</span>
          )}
        </Fila>
        <Fila nombre="Afinidad electrónica">{fmt(el.afinidadElectronica, 3, 'eV')}</Fila>
        <Fila nombre="Densidad">{fmt(el.densidad, 5, el.estadoEstandar === 'gas' ? 'g/cm³ (gas)' : 'g/cm³')}</Fila>
        <Fila nombre="Punto de fusión">{pf === null ? fmt(null) : `${fmt(el.puntoFusion, 2, 'K')} (${pf.toLocaleString('es-PE', { maximumFractionDigits: 1 })} °C)`}</Fila>
        <Fila nombre="Punto de ebullición">{pe === null ? fmt(null) : `${fmt(el.puntoEbullicion, 2, 'K')} (${pe.toLocaleString('es-PE', { maximumFractionDigits: 1 })} °C)`}</Fila>
      </dl>
      <p className="text-xs text-texto-suave md:col-span-2">
        Fuente: PubChem Periodic Table (NIH, dominio público). Masa atómica: pesos atómicos estándar IUPAC publicados por
        el NIST. 1 eV/átomo = 96,485 kJ/mol.
      </p>
    </div>
  );
}

function Electrones({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const real = configuracionReal(z);
  const moeller = configuracionMoeller(z);
  const excepcion = esExcepcion(z);
  const nc = numerosCuanticosUltimoElectron(z);
  const iso = isotoposDe(z).filter((i) => i.abundancia).sort((a, b) => b.abundancia! - a.abundancia!)[0];
  const fmtMs = (ms: number) => (ms > 0 ? '+1/2' : '−1/2');
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        <section>
          <h3 className="font-semibold">Configuración electrónica</h3>
          <p className="mt-1 font-mono text-[15px] break-words">{formatearConfiguracion(real)}</p>
          <p className="mt-1 text-sm">
            Kernel: <span className="font-mono">{notacionKernel(real).texto}</span>
          </p>
          {excepcion && (
            <p className="mt-2 rounded-md border border-aviso/50 p-2 text-sm">
              <strong>Excepción a la regla de Moeller.</strong> Según Moeller sería{' '}
              <span className="font-mono">{notacionKernel(moeller).texto}</span>, pero el estado fundamental real es el indicado
              arriba (estabilidad de subniveles llenos o semillenos).
            </p>
          )}
          <PasoAPaso
            pasos={[
              { titulo: `Número de electrones del átomo neutro: Z = ${z}.` },
              { titulo: 'Orden de llenado (Moeller): 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p.' },
              {
                titulo: 'Se llena cada subnivel hasta su capacidad 2(2l + 1): s = 2, p = 6, d = 10, f = 14.',
                detalle: <span className="font-mono">{formatearConfiguracion(moeller)}</span>,
              },
              ...(excepcion ? [{ titulo: 'Se aplica la excepción del estado fundamental:', detalle: <span className="font-mono">{formatearConfiguracion(real)}</span> }] : []),
              { titulo: 'Se reemplaza el núcleo de gas noble por su símbolo (Kernel):', detalle: <span className="font-mono">{notacionKernel(real).texto}</span> },
            ]}
          />
        </section>
        <section>
          <h3 className="font-semibold">Diagrama de orbitales</h3>
          <div className="mt-2">
            <DiagramaOrbitales configuracion={notacionKernel(real).resto} resaltarUltimo={!excepcion} mostrarMl />
          </div>
          <p className="mt-2 text-xs text-texto-suave">Se omiten los subniveles del kernel. Llenado según Hund (primero ↑ en cada orbital) y Pauli.</p>
        </section>
        <section>
          <h3 className="font-semibold">Resumen</h3>
          <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <Fila nombre="Electrones por capa">{electronesPorNivel(real).join(', ')}</Fila>
            <Fila nombre="Electrones de valencia">{electronesValencia(z)}</Fila>
            <Fila nombre="Electrones desapareados">
              {electronesDesapareados(real)} ({electronesDesapareados(real) > 0 ? 'paramagnético' : 'diamagnético'})
            </Fila>
            <Fila nombre="Último electrón (Moeller)">
              n = {nc.n}, l = {nc.l}, mₗ = {nc.ml > 0 ? `+${nc.ml}` : nc.ml}, mₛ = {fmtMs(nc.ms)}
            </Fila>
          </dl>
          <p className="mt-1 text-xs text-texto-suave">Convención: mₗ de −l a +l; el primer electrón de cada orbital tiene mₛ = +1/2.</p>
        </section>
      </div>
      <div>
        <ModeloBohr
          simbolo={el.simbolo}
          porNivel={electronesPorNivel(real)}
          protones={z}
          neutrones={iso ? iso.a - z : undefined}
          className="mx-auto w-full max-w-[300px] text-texto"
        />
        <p className="mt-1 text-center text-xs text-texto-suave">
          Modelo de Bohr{iso ? ` del isótopo más abundante (${el.simbolo}-${iso.a})` : ''}.
        </p>
      </div>
    </div>
  );
}

function Isotopos({ z }: { z: number }) {
  const el = elementoPorZ(z);
  const lista = isotoposDe(z);
  const naturales = lista.filter((i) => i.abundancia);
  const promedio = naturales.length ? masaAtomicaPromedio(naturales) : null;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <caption className="mb-2 text-left text-texto-suave">Isótopos de {el.nombre} (NIST)</caption>
          <thead>
            <tr className="border-b border-borde text-left">
              <th className="py-1 pr-3 font-medium">Isótopo</th>
              <th className="py-1 pr-3 font-medium">Protones</th>
              <th className="py-1 pr-3 font-medium">Neutrones</th>
              <th className="py-1 pr-3 font-medium">Masa (u)</th>
              <th className="py-1 font-medium">Abundancia</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((i) => (
              <tr key={i.a} className="border-b border-borde/50 tabular-nums">
                <td className="py-1 pr-3">
                  <sup>{i.a}</sup>
                  {el.simbolo}
                  {i.simboloEspecial && <span className="text-texto-suave"> ({i.simboloEspecial === 'D' ? 'deuterio' : 'tritio'})</span>}
                </td>
                <td className="py-1 pr-3">{z}</td>
                <td className="py-1 pr-3">{i.a - z}</td>
                <td className="py-1 pr-3">{i.masa.toFixed(6)}</td>
                <td className="py-1">{i.abundancia ? `${(i.abundancia * 100).toLocaleString('es-PE', { maximumFractionDigits: 4 })} %` : '— (no natural)'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {promedio !== null ? (
        <div className="mt-3 text-sm">
          <p>
            Masa atómica promedio: <strong className="tabular-nums">{promedio.toFixed(4)} u</strong> · Peso atómico estándar
            (NIST): <span className="tabular-nums">{pesoAtomicoEstandarNIST(z)}</span>
          </p>
          <PasoAPaso
            pasos={[
              { titulo: 'La masa atómica es el promedio ponderado de las masas de los isótopos naturales:', tex: '\\bar{A}_r = \\sum_i m_i\\,x_i' },
              {
                titulo: 'Reemplazando masas y abundancias (fracción):',
                tex: `\\bar{A}_r = ${naturales.map((i) => `${i.masa.toFixed(4)}\\times${i.abundancia!.toFixed(5)}`).join(' + ')}`,
              },
              { titulo: 'Resultado:', tex: `\\bar{A}_r = ${promedio.toFixed(4)}\\ \\text{u}` },
            ]}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-texto-suave">Este elemento no tiene isótopos estables con abundancia natural definida.</p>
      )}
    </div>
  );
}
