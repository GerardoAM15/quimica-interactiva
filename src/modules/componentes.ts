import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Componentes de cada módulo, cargados bajo demanda con React.lazy (un chunk por módulo).
 * Se agregan aquí a medida que se implementan; un slug sin entrada muestra la
 * página "en preparación".
 *
 * Ejemplo:
 *   'tabla-periodica': lazy(() => import('./tabla-periodica/TablaPeriodica')),
 */
export const COMPONENTES_MODULO: Partial<Record<string, LazyExoticComponent<ComponentType>>> = {};
