import type { StateStorage } from 'zustand/middleware';

/**
 * Acceso a localStorage envuelto en try/catch.
 * En modo privado, con cookies bloqueadas o sin espacio, localStorage puede
 * lanzar excepciones: la app debe seguir funcionando (solo sin persistencia).
 */
function obtenerAlmacen(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function leer(clave: string): string | null {
  try {
    return obtenerAlmacen()?.getItem(clave) ?? null;
  } catch {
    return null;
  }
}

export function escribir(clave: string, valor: string): boolean {
  try {
    const almacen = obtenerAlmacen();
    if (!almacen) return false;
    almacen.setItem(clave, valor);
    return true;
  } catch {
    return false;
  }
}

export function borrar(clave: string): void {
  try {
    obtenerAlmacen()?.removeItem(clave);
  } catch {
    /* sin persistencia disponible: no hay nada que borrar */
  }
}

export function leerJSON<T>(clave: string, porDefecto: T): T {
  const crudo = leer(clave);
  if (crudo === null) return porDefecto;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return porDefecto;
  }
}

/** Adaptador para el middleware `persist` de Zustand. */
export const almacenSeguro: StateStorage = {
  getItem: (clave) => leer(clave),
  setItem: (clave, valor) => {
    escribir(clave, valor);
  },
  removeItem: (clave) => borrar(clave),
};
