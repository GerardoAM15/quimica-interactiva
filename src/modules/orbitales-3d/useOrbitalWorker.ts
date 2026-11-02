import { useEffect, useRef, useState } from 'react';
import type { PeticionOrbital, RespuestaOrbital } from './orbitales.worker';

type SinId<T> = T extends unknown ? Omit<T, 'id'> : never;

/** Envía peticiones al worker de orbitales y devuelve la última respuesta (descarta las obsoletas). */
export function useOrbitalWorker(peticion: SinId<PeticionOrbital>) {
  const worker = useRef<Worker | null>(null);
  const ultimoId = useRef(0);
  const [respuesta, setRespuesta] = useState<RespuestaOrbital | null>(null);
  const [calculando, setCalculando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const w = new Worker(new URL('./orbitales.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (ev: MessageEvent<RespuestaOrbital>) => {
      if (ev.data.id !== ultimoId.current) return;
      setRespuesta(ev.data);
      setCalculando(false);
    };
    w.onerror = () => {
      setError('No se pudo calcular el orbital.');
      setCalculando(false);
    };
    worker.current = w;
    return () => w.terminate();
  }, []);

  const clave = JSON.stringify(peticion);
  useEffect(() => {
    const id = ++ultimoId.current;
    setCalculando(true);
    setError(null);
    // Pequeña espera para no recalcular en cada paso de un deslizador
    const t = setTimeout(() => worker.current?.postMessage({ ...peticion, id }), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return { respuesta, calculando, error };
}
