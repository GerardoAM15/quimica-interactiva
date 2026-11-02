import { Link, useParams } from 'react-router-dom';
import { bloquePorId, moduloPorSlug, MODULOS } from '@/modules/registro';
import { COMPONENTES_MODULO } from '@/modules/componentes';
import NoEncontrada from './NoEncontrada';

export default function PaginaModulo() {
  const { slug = '' } = useParams();
  const modulo = moduloPorSlug(slug);
  if (!modulo) return <NoEncontrada />;

  const bloque = bloquePorId(modulo.bloque);
  const Componente = COMPONENTES_MODULO[modulo.slug];
  const anterior = MODULOS.find((m) => m.numero === modulo.numero - 1);
  const siguiente = MODULOS.find((m) => m.numero === modulo.numero + 1);

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Ruta de navegación" className="text-sm text-texto-suave">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:underline">
              Inicio
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to={`/bloque/${bloque.slug}`} className="hover:underline">
              {bloque.titulo}
            </Link>
          </li>
        </ol>
      </nav>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">{modulo.titulo}</h1>
      <p className="mt-2 max-w-prose text-texto-suave">{modulo.resumen}</p>

      <div className="mt-6">
        {Componente ? (
          <Componente />
        ) : (
          <section className="rounded-lg border border-dashed border-borde bg-superficie p-6">
            <h2 className="font-semibold">Módulo en preparación</h2>
            <p className="mt-1 text-sm text-texto-suave">Este módulo cubrirá los siguientes temas:</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {modulo.temas.map((t) => (
                <li key={t} className="rounded-full border border-borde px-3 py-1 text-sm">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <nav aria-label="Módulos vecinos" className="mt-10 flex flex-wrap justify-between gap-3 border-t border-borde pt-4 text-sm">
        {anterior ? (
          <Link to={`/modulo/${anterior.slug}`} className="rounded-md px-2 py-1 hover:bg-superficie-2">
            ← {anterior.numero}. {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link to={`/modulo/${siguiente.slug}`} className="rounded-md px-2 py-1 hover:bg-superficie-2">
            {siguiente.numero}. {siguiente.titulo} →
          </Link>
        )}
      </nav>
    </div>
  );
}
