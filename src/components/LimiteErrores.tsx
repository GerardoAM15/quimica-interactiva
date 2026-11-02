import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Al cambiar (p. ej. la ruta), se reinicia el estado de error. */
  clave?: string;
}

interface Estado {
  error: Error | null;
  clave?: string;
}

/**
 * Captura errores de renderizado y fallos al descargar un módulo diferido
 * (típico cuando no hay conexión y el módulo aún no estaba guardado).
 */
export class LimiteErrores extends Component<Props, Estado> {
  override state: Estado = { error: null, clave: this.props.clave };

  static getDerivedStateFromError(error: Error): Partial<Estado> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, estado: Estado): Partial<Estado> | null {
    if (props.clave !== estado.clave) return { error: null, clave: props.clave };
    return null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error en la interfaz:', error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const esDeCarga = /fetch|import|chunk|module/i.test(error.message);
    return (
      <div role="alert" className="mx-auto max-w-xl rounded-lg border border-borde bg-superficie p-6">
        <h2 className="text-lg font-semibold">Algo salió mal</h2>
        <p className="mt-2 text-sm text-texto-suave">
          {esDeCarga
            ? 'No se pudo descargar esta sección. Revisa tu conexión a internet e inténtalo de nuevo.'
            : 'Ocurrió un error inesperado al mostrar esta sección.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto"
        >
          Recargar
        </button>
      </div>
    );
  }
}
