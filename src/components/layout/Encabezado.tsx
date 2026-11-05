import { Link, NavLink } from 'react-router-dom';
import { usePreferencias } from '@/store/preferencias';
import { useInstalacion, useEnLinea } from '@/lib/pwa';
import { IconoAtomo, IconoDescargar, IconoLuna, IconoMenu, IconoSinConexion, IconoSol } from '@/components/Iconos';

interface Props {
  alAbrirMenu: () => void;
}

const enlaces = [
  { a: '/', texto: 'Inicio', fin: true },
  { a: '/estudio', texto: 'Estudio', fin: false },
  { a: '/creditos', texto: 'Créditos', fin: false },
];

export function Encabezado({ alAbrirMenu }: Props) {
  const tema = usePreferencias((s) => s.tema);
  const alternarTema = usePreferencias((s) => s.alternarTema);
  const { disponible, instalar } = useInstalacion();
  const enLinea = useEnLinea();

  return (
    <header className="no-imprimir sticky top-0 z-30 border-b border-borde bg-fondo/90 backdrop-blur supports-[backdrop-filter]:bg-fondo/75">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4">
        <button
          type="button"
          onClick={alAbrirMenu}
          className="-ml-2 rounded-md p-2 hover:bg-superficie-2 lg:hidden"
          aria-label="Abrir menú de módulos"
        >
          <IconoMenu />
        </button>

        <Link to="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight">
          <IconoAtomo width={26} height={26} className="text-acento" />
          <span>
            Química <span className="text-acento">Interactiva</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.fin}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-superficie-2 font-medium' : 'text-texto-suave hover:text-texto'
                }`
              }
            >
              {e.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {!enLinea && (
            <span
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-aviso"
              role="status"
              title="Sin conexión: el contenido descargado sigue disponible"
            >
              <IconoSinConexion width={16} height={16} />
              <span className="hidden sm:inline">Sin conexión</span>
            </span>
          )}
          {disponible && (
            <button
              type="button"
              onClick={() => void instalar()}
              className="flex items-center gap-1.5 rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto hover:opacity-90"
            >
              <IconoDescargar width={16} height={16} />
              Instalar
            </button>
          )}
          <button
            type="button"
            onClick={alternarTema}
            className="rounded-md p-2 hover:bg-superficie-2"
            aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
          >
            {tema === 'oscuro' ? <IconoSol /> : <IconoLuna />}
          </button>
        </div>
      </div>
    </header>
  );
}
