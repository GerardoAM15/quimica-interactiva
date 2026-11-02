import { useParams } from 'react-router-dom';
import { bloquePorSlug, modulosDeBloque } from '@/modules/registro';
import { TarjetaModulo } from '@/components/TarjetaModulo';
import NoEncontrada from './NoEncontrada';

export default function PaginaBloque() {
  const { slug = '' } = useParams();
  const bloque = bloquePorSlug(slug);
  if (!bloque) return <NoEncontrada />;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium" style={{ color: bloque.color }}>
        Bloque {bloque.id}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{bloque.titulo}</h1>
      <p className="mt-2 text-texto-suave">{bloque.descripcion}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {modulosDeBloque(bloque.id).map((m) => (
          <li key={m.slug}>
            <TarjetaModulo modulo={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}
