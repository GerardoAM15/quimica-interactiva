import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { escribir, leer } from '@/lib/almacenamiento';

/** Recuerda que el aviso «ya funciona sin conexión» se mostró: no vuelve a aparecer en este navegador. */
const CLAVE_AVISO = 'qi-aviso-sin-conexion';
/** El aviso informativo se cierra solo pasado este tiempo (ms). */
const DURACION_AVISO = 5000;

/**
 * Registra el service worker y avisa cuando:
 *  - la app ya quedó guardada para usarse sin conexión (una sola vez; se cierra solo a los 5 s), o
 *  - hay una versión nueva lista para instalarse (permanece hasta que el usuario decide).
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

  const anotado = useRef(false);
  // Aviso informativo: se muestra una sola vez (se recuerda en localStorage) y se cierra solo
  const mostrarListo = listoSinConexion && !hayActualizacion;
  useEffect(() => {
    if (!mostrarListo) return;
    // `anotado` evita que una segunda ejecución del efecto (modo estricto de React) oculte el aviso recién abierto
    if (!anotado.current && leer(CLAVE_AVISO) === '1') {
      setListoSinConexion(false);
      return;
    }
    anotado.current = true;
    escribir(CLAVE_AVISO, '1');
    const temporizador = window.setTimeout(() => setListoSinConexion(false), DURACION_AVISO);
    return () => window.clearTimeout(temporizador);
  }, [mostrarListo, setListoSinConexion]);

  if (!listoSinConexion && !hayActualizacion) return null;

  const cerrar = () => {
    setListoSinConexion(false);
    setHayActualizacion(false);
  };

  return (
    <div
      role="status"
      className="no-imprimir fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md rounded-lg border border-borde bg-superficie p-4 shadow-xl sm:left-auto"
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
