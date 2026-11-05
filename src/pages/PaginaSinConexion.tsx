import { useEffect, useState } from 'react';
import { descargarTodo, estadoDescarga, type EstadoDescarga } from '@/lib/descarga';
import { useEnLinea, useInstalacion } from '@/lib/pwa';

/** Uso sin conexión: estado de la descarga, botón «Descargar todo» e instalación. */
export default function PaginaSinConexion() {
  const [estado, setEstado] = useState<EstadoDescarga | null>(null);
  const [progreso, setProgreso] = useState<{ hechos: number; total: number } | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const enLinea = useEnLinea();
  const { disponible, instalar } = useInstalacion();

  const actualizar = () => void estadoDescarga().then(setEstado);
  useEffect(actualizar, []);

  const completo = estado?.disponible && estado.guardados === estado.total;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Usar sin conexión</h1>
      <p className="text-texto-suave">
        La aplicación guarda en este dispositivo todo lo necesario para funcionar sin internet: los 24 módulos, RDKit (estructuras), KaTeX
        (fórmulas), las escenas 3D y las estructuras de las moléculas del catálogo.
      </p>

      <section className="rounded-lg border border-borde bg-superficie p-5" aria-live="polite">
        {!estado ? (
          <p>Comprobando…</p>
        ) : !estado.disponible ? (
          <p className="text-aviso">{estado.motivo}</p>
        ) : (
          <>
            <p className="text-lg font-semibold">{completo ? 'Todo está guardado para usar sin conexión.' : `Faltan ${estado.total - estado.guardados} de ${estado.total} recursos.`}</p>
            <div className="mt-3 h-3 overflow-hidden rounded bg-superficie-2" role="progressbar" aria-valuemin={0} aria-valuemax={estado.total} aria-valuenow={progreso ? estado.guardados + progreso.hechos : estado.guardados} aria-label="Recursos guardados">
              <div className="h-full bg-acento transition-[width]" style={{ width: `${(100 * (estado.guardados + (progreso?.hechos ?? 0))) / Math.max(1, estado.total)}%` }} />
            </div>
            <p className="mt-2 text-sm text-texto-suave tabular-nums">
              {estado.guardados + (progreso?.hechos ?? 0)} / {estado.total} recursos
              {estado.usoMB !== null && ` · espacio usado: ${estado.usoMB.toFixed(1)} MB`}
              {estado.persistente !== null && ` · almacenamiento ${estado.persistente ? 'persistente' : 'temporal (el navegador podría liberarlo si falta espacio)'}`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!!progreso || !enLinea}
                onClick={async () => {
                  setMensaje(null);
                  setProgreso({ hechos: 0, total: estado.faltantes.length });
                  try {
                    const r = await descargarTodo((hechos, total) => setProgreso({ hechos, total }));
                    setMensaje(r.errores.length ? `No se pudieron descargar ${r.errores.length} recursos; vuelve a intentarlo con conexión.` : 'Descarga completa.');
                  } catch (e) {
                    setMensaje((e as Error).message);
                  }
                  setProgreso(null);
                  actualizar();
                }}
                className="rounded-md bg-acento px-4 py-2 text-sm font-semibold text-acento-texto disabled:opacity-50"
              >
                {progreso ? `Descargando… ${progreso.hechos}/${progreso.total}` : completo ? 'Comprobar y pedir almacenamiento persistente' : 'Descargar todo'}
              </button>
              {disponible && (
                <button type="button" onClick={() => void instalar()} className="rounded-md border border-borde px-4 py-2 text-sm hover:bg-superficie-2">
                  Instalar como aplicación
                </button>
              )}
            </div>
            {!enLinea && <p className="mt-2 text-sm text-aviso">Sin conexión: la descarga se podrá hacer cuando vuelva internet.</p>}
            {mensaje && <p className="mt-2 text-sm">{mensaje}</p>}
          </>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Qué necesita internet</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Buscar moléculas en PubChem que no están en el catálogo (visor de moléculas).</li>
          <li>Las fotos reales de los elementos (Wikimedia Commons), que se cargan solo al pedirlas.</li>
        </ul>
        <p className="mt-2 text-sm text-texto-suave">Todo lo demás —cálculos, simulaciones, 3D, modo estudio y progreso— funciona sin conexión.</p>
      </section>
    </div>
  );
}
