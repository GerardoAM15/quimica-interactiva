const SECCIONES = [
  {
    titulo: 'Quizzes por módulo',
    texto: 'Preguntas generadas desde los datos: elementos, nomenclatura, balanceo, estequiometría, VSEPR y más.',
  },
  {
    titulo: 'Flashcards',
    texto: 'Tarjetas con repetición espaciada (algoritmo SM-2): repasas cada tarjeta justo antes de olvidarla.',
  },
  {
    titulo: 'Examen de admisión',
    texto: 'Simulacros cronometrados de opción múltiple (A–E) por tema y dificultad, con solución paso a paso.',
  },
  {
    titulo: 'Progreso',
    texto: 'Avance por bloque y temas débiles, guardado en este dispositivo.',
  },
];

export default function PaginaEstudio() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Modo estudio</h1>
      <p className="mt-3 text-texto-suave">Practica lo aprendido en los módulos. Esta sección está en preparación.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {SECCIONES.map((s) => (
          <li key={s.titulo} className="rounded-lg border border-borde bg-superficie p-4">
            <h2 className="font-semibold">{s.titulo}</h2>
            <p className="mt-1 text-sm text-texto-suave">{s.texto}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
