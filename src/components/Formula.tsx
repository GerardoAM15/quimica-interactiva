import { useEffect, useState } from 'react';
import { cargarKatex, katexListo } from '@/lib/katex';

interface Props {
  /** Código LaTeX. Para química, usar \ce{...} (mhchem) o el componente <Ce>. */
  tex: string;
  bloque?: boolean;
  className?: string;
}

/** Fórmula renderizada con KaTeX (cargado bajo demanda). Mientras carga, muestra el texto LaTeX. */
export function Formula({ tex, bloque = false, className = '' }: Props) {
  const [html, setHtml] = useState<string | null>(() => katexListo()?.(tex, bloque) ?? null);

  useEffect(() => {
    let vivo = true;
    void cargarKatex().then((r) => {
      if (vivo) setHtml(r(tex, bloque));
    });
    return () => {
      vivo = false;
    };
  }, [tex, bloque]);

  const Etiqueta = bloque ? 'div' : 'span';
  if (html === null) {
    return <Etiqueta className={`font-mono text-sm text-texto-suave ${className}`}>{tex}</Etiqueta>;
  }
  return (
    <Etiqueta
      className={`${bloque ? 'my-2 block overflow-x-auto overflow-y-hidden' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Atajo para fórmulas y ecuaciones químicas con mhchem: <Ce>CuSO4.5H2O</Ce> */
export function Ce({ children, bloque = false }: { children: string; bloque?: boolean }) {
  return <Formula tex={`\\ce{${children}}`} bloque={bloque} />;
}
