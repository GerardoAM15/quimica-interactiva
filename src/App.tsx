import { lazy, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { aplicarTema, usePreferencias } from '@/store/preferencias';
import Portada from '@/pages/Portada';

// La portada va en el paquete inicial; el resto de páginas se cargan bajo demanda.
const PaginaBloque = lazy(() => import('@/pages/PaginaBloque'));
const PaginaModulo = lazy(() => import('@/pages/PaginaModulo'));
const PaginaEstudio = lazy(() => import('@/pages/PaginaEstudio'));
const PaginaCreditos = lazy(() => import('@/pages/PaginaCreditos'));
const NoEncontrada = lazy(() => import('@/pages/NoEncontrada'));
const PaginaSinConexion = lazy(() => import('@/pages/PaginaSinConexion'));

export default function App() {
  const tema = usePreferencias((s) => s.tema);
  useEffect(() => aplicarTema(tema), [tema]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Portada />} />
          <Route path="bloque/:slug" element={<PaginaBloque />} />
          <Route path="modulo/:slug" element={<PaginaModulo />} />
          <Route path="estudio" element={<PaginaEstudio />} />
          <Route path="estudio/:seccion" element={<PaginaEstudio />} />
          <Route path="creditos" element={<PaginaCreditos />} />
          <Route path="sin-conexion" element={<PaginaSinConexion />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
