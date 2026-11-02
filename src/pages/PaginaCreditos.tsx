import { FUENTES, type TipoFuente } from '@/data/fuentes';

const SECCIONES: { tipo: TipoFuente; titulo: string }[] = [
  { tipo: 'datos', titulo: 'Fuentes de datos' },
  { tipo: 'software', titulo: 'Software de código abierto' },
];

export default function PaginaCreditos() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Créditos y fuentes</h1>
      <p className="mt-3 text-texto-suave">
        Los datos químicos provienen de fuentes públicas y citadas. Si un valor no se pudo verificar, se marca en la
        aplicación como «pendiente de revisión».
      </p>

      {SECCIONES.map((s) => (
        <section key={s.tipo} className="mt-8" aria-labelledby={`creditos-${s.tipo}`}>
          <h2 id={`creditos-${s.tipo}`} className="text-xl font-semibold">
            {s.titulo}
          </h2>
          <ul className="mt-3 space-y-3">
            {FUENTES.filter((f) => f.tipo === s.tipo).map((f) => (
              <li key={f.id} className="rounded-lg border border-borde bg-superficie p-4">
                <h3 className="font-semibold">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {f.nombre}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-texto-suave">{f.descripcion}</p>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                  <dt className="font-medium">Licencia</dt>
                  <dd className="text-texto-suave">{f.licencia}</dd>
                  <dt className="font-medium">Uso</dt>
                  <dd className="text-texto-suave">{f.uso}</dd>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
