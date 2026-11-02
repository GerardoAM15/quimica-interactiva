import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Encabezado } from './Encabezado';
import { NavegacionModulos } from './NavegacionModulos';
import { AvisoPWA } from './AvisoPWA';
import { Cargando } from '@/components/Cargando';
import { LimiteErrores } from '@/components/LimiteErrores';
import { IconoCerrar } from '@/components/Iconos';

export function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();
  const principal = useRef<HTMLElement>(null);
  const esPortada = pathname === '/';

  // Al cambiar de página: volver arriba y llevar el foco al contenido (lectores de pantalla).
  useEffect(() => {
    window.scrollTo(0, 0);
    principal.current?.focus({ preventScroll: true });
  }, [pathname]);

  // Cerrar el panel móvil con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [menuAbierto]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          principal.current?.focus();
        }}
        className="sr-only z-50 rounded-md bg-acento px-3 py-2 text-acento-texto focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <Encabezado alAbrirMenu={() => setMenuAbierto(true)} />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1">
        {/* Barra lateral fija en escritorio (se oculta en la portada para dar espacio) */}
        {!esPortada && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-borde p-3 lg:block">
            <NavegacionModulos />
          </aside>
        )}

        <main
          id="contenido"
          ref={principal}
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8"
        >
          <LimiteErrores clave={pathname}>
            <Suspense fallback={<Cargando />}>
              <Outlet />
            </Suspense>
          </LimiteErrores>
        </main>
      </div>

      <footer className="border-t border-borde px-4 py-4 text-center text-xs text-texto-suave">
        Proyecto personal de estudio · Datos de PubChem (dominio público) y CODATA ·{' '}
        <Link to="/creditos" className="underline hover:text-texto">
          Créditos y fuentes
        </Link>
      </footer>

      {/* Panel de módulos en móvil/tablet */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Módulos">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuAbierto(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col overflow-y-auto border-r border-borde bg-superficie p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="px-2 font-semibold">Módulos</span>
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                className="rounded-md p-2 hover:bg-superficie-2"
                aria-label="Cerrar menú"
                autoFocus
              >
                <IconoCerrar />
              </button>
            </div>
            <nav aria-label="Secciones" className="mb-3 flex gap-1 border-b border-borde pb-3 text-sm md:hidden">
              <Link to="/" onClick={() => setMenuAbierto(false)} className="rounded px-2 py-1 hover:bg-superficie-2">
                Inicio
              </Link>
              <Link to="/estudio" onClick={() => setMenuAbierto(false)} className="rounded px-2 py-1 hover:bg-superficie-2">
                Estudio
              </Link>
              <Link to="/creditos" onClick={() => setMenuAbierto(false)} className="rounded px-2 py-1 hover:bg-superficie-2">
                Créditos
              </Link>
            </nav>
            <NavegacionModulos alNavegar={() => setMenuAbierto(false)} />
          </div>
        </div>
      )}

      <AvisoPWA />
    </div>
  );
}
