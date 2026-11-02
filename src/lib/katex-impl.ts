// Implementación de KaTeX + mhchem. Se importa SOLO de forma diferida (ver katex.ts),
// para que la portada y los módulos no carguen KaTeX hasta que muestran una fórmula.
import katex from 'katex';
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';

export function renderizar(tex: string, enBloque: boolean): string {
  return katex.renderToString(tex, {
    displayMode: enBloque,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml', // MathML para lectores de pantalla
  });
}
