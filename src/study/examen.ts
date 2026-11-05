/**
 * Simulacros de examen de admisión: preguntas originales generadas (opción múltiple A–E),
 * cronometradas, con mezcla de temas y dificultades, y calificación en escala vigesimal (0–20).
 */
import { generarPreguntas, TEMAS, type Dificultad, type Pregunta, type Tema } from './generadores';

export interface ConfigExamen {
  id: string;
  nombre: string;
  preguntas: number;
  minutos: number;
  descripcion: string;
}

export const CONFIGS: ConfigExamen[] = [
  { id: 'rapido', nombre: 'Práctica rápida', preguntas: 10, minutos: 15, descripcion: '10 preguntas variadas en 15 minutos.' },
  { id: 'completo', nombre: 'Simulacro completo', preguntas: 30, minutos: 60, descripcion: '30 preguntas de todos los temas en 60 minutos, de menor a mayor dificultad.' },
  { id: 'avanzado', nombre: 'Simulacro avanzado', preguntas: 20, minutos: 40, descripcion: '20 preguntas de dificultad intermedia y alta.' },
];

export interface Examen {
  semilla: number;
  config: ConfigExamen;
  preguntas: Pregunta[];
}

/** Reparte las preguntas entre dificultades (simulacro completo: 30 % básico, 40 % intermedio, 30 % avanzado). */
export function armarExamen(semilla: number, idConfig: string, temas: Tema[] = TEMAS.map((t) => t.id)): Examen {
  const config = CONFIGS.find((c) => c.id === idConfig) ?? CONFIGS[0]!;
  const reparto: [Dificultad, number][] =
    config.id === 'avanzado' ? [[2, 0.5], [3, 0.5]] : config.id === 'rapido' ? [[1, 0.4], [2, 0.6]] : [[1, 0.3], [2, 0.4], [3, 0.3]];
  const sel = temas.map((tema) => ({ tema }));
  const preguntas: Pregunta[] = [];
  let resto = config.preguntas;
  reparto.forEach(([d, f], i) => {
    const n = i === reparto.length - 1 ? resto : Math.round(config.preguntas * f);
    resto -= n;
    preguntas.push(...generarPreguntas(semilla + d * 1009, sel, n, d));
  });
  return { semilla, config, preguntas: preguntas.slice(0, config.preguntas).map((q, k) => ({ ...q, id: `ex${semilla}-${k + 1}` })) };
}

export interface Calificacion {
  correctas: number;
  incorrectas: number;
  enBlanco: number;
  /** Nota vigesimal: 20 × correctas / total. */
  nota: number;
  porTema: Partial<Record<Tema, { correctas: number; total: number }>>;
}

export function calificar(ex: Examen, respuestas: (number | null)[]): Calificacion {
  const porTema: Calificacion['porTema'] = {};
  let correctas = 0, incorrectas = 0, enBlanco = 0;
  ex.preguntas.forEach((q, i) => {
    const r = respuestas[i] ?? null;
    const t = (porTema[q.tema] ??= { correctas: 0, total: 0 });
    t.total++;
    if (r === null) enBlanco++;
    else if (r === q.correcta) {
      correctas++;
      t.correctas++;
    } else incorrectas++;
  });
  return { correctas, incorrectas, enBlanco, nota: Math.round((200 * correctas) / ex.preguntas.length) / 10, porTema };
}
