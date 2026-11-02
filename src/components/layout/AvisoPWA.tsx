import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Registra el service worker y avisa cuando:
 *  - la app ya quedó guardada para usarse sin conexión, o
 *  - hay una versión nueva lista para instalarse.
 */
export function AvisoPWA() {
  const {
    offlineReady: [listoSinConexion, setListoSinConexion],
    needRefresh: [hayActualizacion, setHayActualizacion],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn('No se pudo registrar el service worker:', error);
    },
  });

  if (!listoSinConexion && !hayActualizacion) return null;

  const cerrar = () => {
    setListoSinConexion(false);
    setHayActualizacion(false);
  };

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-lg border border-borde bg-superficie p-4 shadow-xl sm:left-auto"
    >
      <p className="text-sm">
        {hayActualizacion
          ? 'Hay una versión nueva de la aplicación.'
          : 'Listo: la aplicación ya funciona sin conexión a internet.'}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {hayActualizacion && (
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto"
          >
            Actualizar
          </button>
        )}
        <button
          type="button"
          onClick={cerrar}
          className="rounded-md border border-borde px-3 py-1.5 text-sm hover:bg-superficie-2"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
