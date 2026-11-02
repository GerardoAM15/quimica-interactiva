import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-5xl font-bold text-acento">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-texto-suave">La dirección no corresponde a ningún módulo.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-acento px-4 py-2 font-medium text-acento-texto hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
