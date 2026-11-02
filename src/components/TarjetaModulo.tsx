import { Link } from 'react-router-dom';
import { bloquePorId, type Modulo } from '@/modules/registro';

/** Tarjeta enlazada a un módulo; el borde izquierdo lleva el color de su bloque. */
export function TarjetaModulo({ modulo }: { modulo: Modulo }) {
  const bloque = bloquePorId(modulo.bloque);
  return (
    <Link
      to={`/modulo/${modulo.slug}`}
      className="group block h-full rounded-lg border border-borde border-l-4 bg-superficie p-4 transition-colors hover:bg-superficie-2"
      style={{ borderLeftColor: bloque.color }}
    >
      <p className="text-xs font-medium text-texto-suave">
        Bloque {bloque.id} · Módulo {modulo.numero}
      </p>
      <h3 className="mt-1 font-semibold group-hover:underline">{modulo.titulo}</h3>
      <p className="mt-1 text-sm text-texto-suave">{modulo.resumen}</p>
    </Link>
  );
}
