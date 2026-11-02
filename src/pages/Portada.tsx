import { Link } from 'react-router-dom';
import { AtomoAnimado } from '@/components/AtomoAnimado';
import { IconoFlecha } from '@/components/Iconos';
import { BLOQUES, MODULOS, modulosDeBloque } from '@/modules/registro';

const RASGOS = [
  { titulo: 'Teoría con fórmulas', texto: 'Cada módulo explica la química con sus ecuaciones.' },
  { titulo: 'Simulaciones 2D y 3D', texto: 'Moléculas, orbitales, gases y titulaciones que puedes manipular.' },
  { titulo: 'Paso a paso', texto: 'Los resultados muestran el procedimiento completo, no solo la respuesta.' },
  { titulo: 'Modo examen', texto: 'Simulacros cronometrados de opción múltiple (A–E) con solución explicada.' },
];

export default function Portada() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* ── Presentación ── */}
      <section className="grid items-center gap-8 py-6 md:grid-cols-[1.3fr_1fr] md:py-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Química <span className="text-acento">interactiva</span>
          </h1>
          <p className="mt-4 max-w-prose text-lg text-texto-suave">
            Química general, inorgánica y orgánica en 2D y 3D: desde la preparación para el examen de admisión
            (San Marcos, UNI y otras) hasta la química general universitaria.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/modulo/tabla-periodica"
              className="inline-flex items-center gap-2 rounded-md bg-acento px-4 py-2.5 font-medium text-acento-texto hover:opacity-90"
            >
              Empezar por la tabla periódica
              <IconoFlecha width={18} height={18} />
            </Link>
            <Link
              to="/estudio"
              className="inline-flex items-center gap-2 rounded-md border border-borde px-4 py-2.5 font-medium hover:bg-superficie-2"
            >
              Modo estudio y examen
            </Link>
          </div>
          <p className="mt-4 text-sm text-texto-suave">
            {MODULOS.length} módulos en {BLOQUES.length} bloques · Nomenclatura tradicional, Stock e IUPAC
          </p>
        </div>
        <AtomoAnimado className="mx-auto w-56 sm:w-72 md:w-full md:max-w-sm" />
      </section>

      {/* ── Cómo se estudia aquí ── */}
      <section aria-labelledby="titulo-rasgos" className="py-6">
        <h2 id="titulo-rasgos" className="sr-only">
          Cómo funciona
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RASGOS.map((r) => (
            <li key={r.titulo} className="rounded-lg border border-borde bg-superficie p-4">
              <h3 className="font-semibold">{r.titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave">{r.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Bloques y módulos ── */}
      <section aria-labelledby="titulo-bloques" className="py-6">
        <h2 id="titulo-bloques" className="text-2xl font-bold tracking-tight">
          Contenido
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {BLOQUES.map((b) => (
            <article key={b.id} className="rounded-lg border border-borde bg-superficie p-5">
              <header className="flex items-start gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-base font-bold text-[#04111c]"
                  style={{ background: b.color }}
                  aria-hidden
                >
                  {b.id}
                </span>
                <div>
                  <h3 className="font-semibold">
                    <Link to={`/bloque/${b.slug}`} className="hover:underline">
                      {b.titulo}
                    </Link>
                  </h3>
                  <p className="text-sm text-texto-suave">{b.descripcion}</p>
                </div>
              </header>
              <ul className="mt-3 space-y-1 text-sm">
                {modulosDeBloque(b.id).map((m) => (
                  <li key={m.slug}>
                    <Link
                      to={`/modulo/${m.slug}`}
                      className="flex items-baseline gap-2 rounded px-2 py-1 hover:bg-superficie-2"
                    >
                      <span className="w-6 shrink-0 text-right tabular-nums text-texto-suave">{m.numero}.</span>
                      <span>{m.titulo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
