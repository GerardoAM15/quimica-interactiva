import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { almacenSeguro } from '@/lib/almacenamiento';

export type Tema = 'oscuro' | 'claro';

interface EstadoPreferencias {
  tema: Tema;
  /** Muestra el contador de FPS en las escenas 3D. */
  mostrarFPS: boolean;
  alternarTema: () => void;
  setTema: (tema: Tema) => void;
  setMostrarFPS: (valor: boolean) => void;
}

/** Clave usada también por el script de index.html que aplica el tema antes de pintar. */
export const CLAVE_PREFERENCIAS = 'qi-preferencias';

export const usePreferencias = create<EstadoPreferencias>()(
  persist(
    (set) => ({
      tema: 'oscuro',
      mostrarFPS: false,
      alternarTema: () => set((s) => ({ tema: s.tema === 'oscuro' ? 'claro' : 'oscuro' })),
      setTema: (tema) => set({ tema }),
      setMostrarFPS: (mostrarFPS) => set({ mostrarFPS }),
    }),
    {
      name: CLAVE_PREFERENCIAS,
      storage: createJSONStorage(() => almacenSeguro),
      partialize: (s) => ({ tema: s.tema, mostrarFPS: s.mostrarFPS }),
    },
  ),
);

/** Sincroniza la clase .dark del <html> y el color de la barra del navegador. */
export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  raiz.classList.toggle('dark', tema === 'oscuro');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', tema === 'oscuro' ? '#0b1020' : '#f6f7fb');
}
