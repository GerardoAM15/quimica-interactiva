import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { almacenSeguro } from '@/lib/almacenamiento';
import type { Tema } from '@/study/generadores';
import { estadoInicial, repasar, type EstadoTarjeta } from '@/study/sm2';

export interface ResultadoExamen {
  fecha: number;
  config: string;
  semilla: number;
  nota: number;
  correctas: number;
  total: number;
}

interface EstadoProgreso {
  temas: Partial<Record<Tema, { correctas: number; total: number }>>;
  tarjetas: Record<string, EstadoTarjeta>;
  examenes: ResultadoExamen[];
  registrarRespuesta: (tema: Tema, correcta: boolean) => void;
  repasarTarjeta: (id: string, q: number) => void;
  registrarExamen: (r: ResultadoExamen, porTema: Partial<Record<Tema, { correctas: number; total: number }>>) => void;
  reiniciar: () => void;
}

/** Progreso de estudio guardado en este dispositivo (localStorage vía almacenSeguro). */
export const useProgreso = create<EstadoProgreso>()(
  persist(
    (set) => ({
      temas: {},
      tarjetas: {},
      examenes: [],
      registrarRespuesta: (tema, correcta) =>
        set((s) => {
          const t = s.temas[tema] ?? { correctas: 0, total: 0 };
          return { temas: { ...s.temas, [tema]: { correctas: t.correctas + (correcta ? 1 : 0), total: t.total + 1 } } };
        }),
      repasarTarjeta: (id, q) =>
        set((s) => {
          const ahora = Date.now();
          return { tarjetas: { ...s.tarjetas, [id]: repasar(s.tarjetas[id] ?? estadoInicial(ahora), q, ahora) } };
        }),
      registrarExamen: (r, porTema) =>
        set((s) => {
          const temas = { ...s.temas };
          for (const [k, v] of Object.entries(porTema) as [Tema, { correctas: number; total: number }][]) {
            const t = temas[k] ?? { correctas: 0, total: 0 };
            temas[k] = { correctas: t.correctas + v.correctas, total: t.total + v.total };
          }
          return { examenes: [...s.examenes.slice(-49), r], temas };
        }),
      reiniciar: () => set({ temas: {}, tarjetas: {}, examenes: [] }),
    }),
    { name: 'qi-progreso', storage: createJSONStorage(() => almacenSeguro), partialize: (s) => ({ temas: s.temas, tarjetas: s.tarjetas, examenes: s.examenes }) },
  ),
);
