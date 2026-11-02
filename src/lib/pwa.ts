import { useEffect, useState } from 'react';

/** Evento no estándar de Chromium que permite mostrar el diálogo "Instalar app". */
interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let eventoGuardado: EventoInstalacion | null = null;
const oyentes = new Set<() => void>();
const notificar = () => oyentes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // se muestra con nuestro propio botón "Instalar"
    eventoGuardado = e as EventoInstalacion;
    notificar();
  });
  window.addEventListener('appinstalled', () => {
    eventoGuardado = null;
    notificar();
  });
}

export function estaInstalada(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/** Devuelve si se puede instalar y una función para lanzar el diálogo del navegador. */
export function useInstalacion() {
  const [disponible, setDisponible] = useState(eventoGuardado !== null);
  useEffect(() => {
    const f = () => setDisponible(eventoGuardado !== null);
    oyentes.add(f);
    return () => {
      oyentes.delete(f);
    };
  }, []);

  const instalar = async () => {
    if (!eventoGuardado) return false;
    await eventoGuardado.prompt();
    const { outcome } = await eventoGuardado.userChoice;
    eventoGuardado = null;
    notificar();
    return outcome === 'accepted';
  };

  return { disponible: disponible && !estaInstalada(), instalar };
}

/** Estado de conexión del navegador (para avisar cuando una función necesita internet). */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setEnLinea(true);
    const off = () => setEnLinea(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return enLinea;
}
