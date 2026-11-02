/** Carga diferida de KaTeX (una sola vez, compartida por todos los componentes). */
type Renderizador = (tex: string, enBloque: boolean) => string;

let promesa: Promise<Renderizador> | null = null;
let listo: Renderizador | null = null;

export function cargarKatex(): Promise<Renderizador> {
  promesa ??= import('./katex-impl').then((m) => (listo = m.renderizar));
  return promesa;
}

/** Devuelve el renderizador si ya está cargado (para pintar sin parpadeo). */
export const katexListo = () => listo;
