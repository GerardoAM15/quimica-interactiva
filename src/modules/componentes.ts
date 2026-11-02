import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Componentes de cada módulo, cargados bajo demanda con React.lazy (un chunk por módulo).
 * Un slug sin entrada muestra la página «Módulo en preparación».
 */
export const COMPONENTES_MODULO: Partial<Record<string, LazyExoticComponent<ComponentType>>> = {
  'tabla-periodica': lazy(() => import('./tabla-periodica/TablaPeriodica')),
  'estructura-atomica': lazy(() => import('./estructura-atomica/EstructuraAtomica')),
  'orbitales-3d': lazy(() => import('./orbitales-3d/Orbitales3D')),
};
